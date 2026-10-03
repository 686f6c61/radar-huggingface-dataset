# brosgor/BrosNet

## Resumen

BrosNet es un clasificador de payloads HTTP basado en una red neuronal convolucional de caracteres (char-CNN) de una dimension, desarrollado por el grupo J2K Security Group dentro de su departamento de I+D. Su funcion es recibir una linea de peticion HTTP o un payload en crudo y devolver una de seis categorias de ataque web (`normal`, `SQLi`, `XSS`, `LFI`, `RCE`, `SSRF`) junto con una puntuacion de confianza. Resuelve un problema acotado pero recurrente en operaciones de seguridad: la triaje de peticiones que han superado los filtros existentes o que nunca fueron bloqueadas, indicando de que tipo de ataque se trata sin necesidad de reglas manuales.

Tecnicamente es un modelo muy pequeno: aproximadamente 50.000 parametros, un checkpoint de 267 KB, vocabulario de 97 caracteres ASCII imprimibles y una longitud maxima de secuencia de 512 caracteres. Se ejecuta en CPU con latencias del orden de microsegundos, lo que lo aleja por completo del regimen de los grandes modelos de lenguaje y lo situa en la categoria de clasificadores ligeros desplegables en el propio borde de la infraestructura.

Su relevancia es practica: ofrece un clasificador de ataque web entrenado desde cero sobre 214.035 muestras de fuentes publicas (CSIC 2010, SecLists, varios conjuntos de Kaggle) mas un corpus privado anonimizado, con una exactitud declarada del 99,86% y un macro-F1 de 0,993 sobre una particion de validacion de 42.807 muestras. El repositorio no registra descargas ni likes en el momento de la consulta y publica unicamente pesos y codigo bajo licencia MIT.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | CNN 1D a nivel de caracter, multi-kernel con adaptive max-pool |
| Parametros totales | ~50.000 (checkpoint de 267 KB) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 512 caracteres (longitud maxima de secuencia) |
| Tipos de cuantizacion | no disponible (no se publican variantes cuantizadas; checkpoint PyTorch para CPU) |
| Idiomas soportados | en (metadatos); el vocabulario se limita a 97 caracteres ASCII imprimibles |
| Licencia | MIT |
| Formato de pesos | PyTorch (`brosnet.pt`, checkpoint con `state_dict`) |

Otros hiperparametros declarados en la model card:

| Componente | Valor |
|---|---|
| Vocabulario | 97 (ASCII imprimible) |
| Dimension de embedding | 32 |
| Filtros por kernel | 64 |
| Tamano de kernel | (2, 3, 4, 5) |
| Dimension oculta | 128 |
| Dropout | 0,3 |
| Clases | 6 (`normal`, `SQLi`, `XSS`, `LFI`, `RCE`, `SSRF`) |

## Arquitectura y entrenamiento

El modelo es una CNN 1D que opera directamente sobre caracteres, sin tokenizacion subword ni embeddings preentrenados. Cada caracter del payload se proyecta a un vector de 32 dimensiones y la secuencia resultante atraviesa cuatro ramas convolucionales en paralelo con tamanos de kernel 2, 3, 4 y 5, cada una con 64 filtros. Esto permite capturar patrones de n-gramas de caracteres de distinta longitud, algo adecuado para firmas de ataque como `' OR '1'='1`, `"`) como una linea de peticion completa (por ejemplo `"GET /login?user=admin' OR '1'='1 HTTP/1.1"`).
- Devuelve etiqueta y puntuacion de confianza mediante un helper de inferencia (`from brosnet.predict import classify`).
- Inferencia en CPU con latencias declaradas del orden de microsegundos, sin necesidad de GPU.
- Carga directa del checkpoint mediante la clase `BrosNet`, permitiendo integrarlo en codigo propio con solo `torch` y `numpy` como dependencias.
- No soporta tool calling, function calling, razonamiento multi-paso, agentes, vision, audio ni generacion de texto: es exclusivamente un clasificador.

## Casos de uso

- Triaje de alertas en un SOC: el analista recibe un flujo continuo de peticiones sospechosas y el modelo las etiqueta por tipo de ataque en microsegundos, lo que permite priorizar primero las categorias de mayor impacto (`RCE`, `SQLi`) y agrupar el resto para revision posterior.
- Enriquecimiento de logs de un WAF: las peticiones registradas por un WAF comercial o por ModSecurity se pasan por BrosNet para anadir una columna de categoria de ataque, lo que facilita busquedas y correlaciones en el SIEM sin depender de campos propietarios.
- Anotacion de datasets para entrenar modelos mayores: dado su coste computacional casi nulo, sirve como etiquetador automatico de grandes volumenes de peticiones y como generador de etiquetas debiles para un transformer que despues se valide manualmente.
- Clasificacion en honeypots y sensores de red: al ejecutarse en CPU y ocupar 267 KB, puede desplegarse en el propio honeypot o en un contenedor ligero junto al servicio expuesto, clasificando cada payload entrante sin enviar trafico a un sistema externo.
- Filtro previo en pipelines de pentest y generacion de carga: durante una campana de pruebas, el modelo permite verificar de forma automatica que los payloads generados caen en la categoria esperada antes de lanzarlos contra el objetivo, y detecta payloads mal formados.
- Apoyo a la revision manual en guardias: cuando un analista duda entre `LFI` y `RCE`, la salida del clasificador aporta una segunda opinion instantanea con confianza asociada, dejando la decision final al humano, tal como recomienda la propia model card.
- Control de calidad en un API gateway: como paso de diagnostico en modo observacion (no bloqueante), etiquetar las peticiones que superan los filtros existentes para detectar huecos de cobertura en las reglas y alimentar la creacion de firmas nuevas.
- Analisis forense posterior a un incidente: procesar de forma masiva los logs de acceso del periodo comprometido y separar las peticiones de ataque de las benignas para reconstruir la linea temporal de la intrusion.

## Benchmarks y rendimiento

La model card publica resultados de evaluacion sobre una particion de validacion retenida del 20% (42.807 muestras). No se aportan comparaciones con otros modelos en la informacion disponible.

| Metrica global | Valor |
|---|---|
| Exactitud (accuracy) | 99,86% |
| Macro-F1 | 0,993 |

| Clase | Precision | Recall | F1 |
|---|---|---|---|
| normal | 1,0000 | 0,9997 | 0,9999 |
| SQLi | 0,9993 | 0,9981 | 0,9987 |
| XSS | 0,9930 | 0,9943 | 0,9937 |
| LFI | 0,9978 | 0,9994 | 0,9986 |
| RCE | 0,9899 | 0,9988 | 0,9943 |
| SSRF | 1,0000 | 0,9500 | 0,9744 |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K u otros) en la informacion disponible, algo esperable en un clasificador de payloads y no en un modelo generativo.

## Requisitos de hardware

- VRAM estimada: no aplica. El modelo esta pensado para inferencia en CPU; el checkpoint ocupa 267 KB y el modelo ronda los 50.000 parametros.
- GPU recomendadas: ninguna. No se documenta soporte acelerado ni necesidad de GPU; la model card declara inferencia en CPU en microsegundos.
- Cabe en hardware de consumo: si, con enorme margen. Es viable en cualquier portatil, en una Raspberry Pi o en el propio contenedor del servicio inspeccionado.
- Opciones de despliegue: script Python con `torch` (CPU) y `numpy`, importando la clase `BrosNet` o el helper `classify`; integracion como libreria dentro de un servicio propio. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo. Tampoco se documenta una exportacion a ONNX o TorchScript.
- Latencia y throughput estimados: la model card indica latencia en microsegundos por inferencia en CPU. No se publican cifras de throughput (peticiones por segundo) en la informacion disponible.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye comparaciones con otros clasificadores de payloads web, ni datos de modelos alternativos de la misma categoria (por ejemplo, clasificadores basados en transformers o WAF de reglas como ModSecurity CRS) que permitan una comparacion cuantitativa honesta. Cualquier tabla comparativa requeriria medir los mismos conjuntos de datos y no se dispone de ellos.

## Limitaciones y advertencias

- La propia model card lo define como herramienta de triaje y anotacion para analistas, no como firewall en tiempo real ni motor de baneo automatico. No debe usarse para bloquear trafico sin supervision humana.
- Solo analiza texto de payload. No es un detector de flujo de red ni de DDoS; esos casos requieren modelos separados.
- La clase `SSRF` cuenta con muy pocas muestras de entrenamiento (aproximadamente 100), y su F1 es el mas bajo del conjunto (0,9744), con un recall de 0,95. Sus predicciones deben tratarse con menor confianza.
- Que una peticion se clasifique como `normal` no descarta ataques indistinguibles del texto benigno, por ejemplo CSRF. La model card recomienda revision humana antes de actuar sobre las predicciones.
- El vocabulario esta limitado a 97 caracteres ASCII imprimibles. Payloads con codificaciones, ofuscacion Unicode, doble codificacion URL o tecnicas de evasion fuera de ese alfabeto pueden quedar fuera de la distribucion de entrenamiento y degradar la deteccion.
- Riesgo de sobreajuste a los patrones de los conjuntos de entrenamiento publicos: payloads novedosos o generados especificamente para evadir clasificadores pueden pasar como `normal`. No se documentan pruebas de robustez frente a adversarios.
- Sesgo de composicion del dataset: la clase `normal` procede en gran parte de CSIC 2010 y de un corpus privado, por lo que refleja el trafico de unas aplicaciones concretas y puede no representar el trafico normal de otros entornos.
- La clase positiva `RCE` depende de conjuntos de Kaggle cuya licencia debe verificarse individualmente antes de redistribuir los datos. Los pesos se publican bajo MIT, pero el repositorio no incluye los datos de entrenamiento en crudo.
- Los metadatos indican idioma `en`, aunque el modelo no procesa lenguaje natural: la relevancia de este campo es limitada.
- El repositorio no registra descargas ni likes, no hay resultados de terceros que reproduzcan las metricas y el tamano del repositorio figura como 0.0 GB, por lo que conviene verificar que el checkpoint `brosnet.pt` este efectivamente disponible antes de integrarlo en produccion.
- Licencia MIT: permite uso comercial, modificacion y redistribucion de pesos y codigo, manteniendo el aviso de copyright. No se declara ninguna clausula adicional.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/brosgor/BrosNet
- CSIC 2010 HTTP Dataset: https://www.isi.csic.es/dataset/
- SecLists (MIT): https://github.com/danielmiessler/SecLists
- Web Application Payloads Dataset (Kaggle): https://www.kaggle.com/datasets/cyberprince/web-application-payloads-dataset
- SQL Injection Dataset, sajid576 (Kaggle): https://www.kaggle.com/datasets/sajid576/sql-injection-dataset
- XSS Dataset for Deep Learning (Kaggle): https://www.kaggle.com/datasets/syedsaqlainhussain/cross-site-scripting-xss-dataset-for-deep-learning
- SQL Injection Dataset, ayahkhaldi (Kaggle): https://www.kaggle.com/datasets/ayahkhaldi/sql-injection-dataset
