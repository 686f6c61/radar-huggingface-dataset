# elnemer7/ElNeMeR-Hajj-Umrah-Visa-Fraud-ONNX

## Resumen

ElNeMeR Hajj & Umrah Visa Fraud ONNX es un clasificador binario/multiclase exportado a formato ONNX, publicado por el autor elnemer7 (Eng. Mahmoud ElNemer, ElNeMeR Digital Solutions & AI) dentro de una supuesta flota de 25 modelos orientados a IA humanitaria y forense digital. El modelo se presenta como una herramienta de proteccion para personas mayores y peregrinos frente a codigos de barras falsos de Umrah, intermediarios de Hajj sin licencia y estafas de visados de peregrinacion.

Tecnicamente se trata de un modelo muy ligero: el repositorio ocupa 0.0 GB y la unica informacion disponible indica una entrada tensorial `features` de tipo `float32` con forma `[batch_size, 512]` y una salida de tres clases (`official_pilgrimage_guidance`, `fake_umrah_barcode_broker`, `unlicensed_hajj_campaign`). Es compatible con `onnxruntime` y `onnxruntime-web` (WASM), lo que sugiere despliegue en navegador o en entornos de borde.

La relevancia del modelo es limitada y debe valorarse con cautela: no se especifica arquitectura interna, datos de entrenamiento, numero de parametros ni metodologia de evaluacion, y la unica metrica declarada ("Calibration Accuracy: 100.00%") no viene acompanada de conjunto de validacion, tamano de muestra ni protocolo reproducible. La model card incluye ademas datos de contacto comerciales y sellos de "verificacion" que no constituyen evidencia tecnica.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (clasificador con entrada `float32 [batch_size, 512]`; capas internas no documentadas) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (no es un modelo generativo; entrada de vector fijo de 512 dimensiones) |
| Tipos de cuantizacion | no disponible (formato ONNX; se desconoce si existen variantes INT8/FP16) |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | ONNX (opset 14), compatible con `onnxruntime` y `onnxruntime-web` WASM |

## Arquitectura y entrenamiento

No se dispone de informacion sobre la arquitectura interna del modelo. La model card unicamente describe la interfaz de inferencia: un tensor de entrada llamado `features` de tipo `float32` con forma `[batch_size, 512]` y una salida de probabilidades sobre tres clases. No se especifica si se trata de un perceptron multicapa, un modelo lineal, un transformer pequeno u otra topologia, ni el numero de capas, dimensiones ocultas o funcion de activacion.

Tampoco hay datos sobre el corpus de entrenamiento: numero de ejemplos, composicion del dataset, proceso de etiquetado, tecnicas de aumento de datos, ni si se aplico validacion cruzada, calibracion probabilistica (Platt scaling, temperature scaling) o tecnicas de RLHF/DPO (no aplicables a un clasificador de este tipo). La afirmacion de "Calibration Accuracy: 100.00%" no viene respaldada por ningun detalle metodologico en la informacion proporcionada.

## Capacidades

- Clasificacion de contenido en tres categorias: `official_pilgrimage_guidance`, `fake_umrah_barcode_broker` y `unlicensed_hajj_campaign`.
- Entrada basada en un vector de caracteristicas de 512 dimensiones (se desconoce el esquema de extraccion de caracteristicas; el modelo no procesa texto ni imagenes de forma nativa segun la informacion disponible).
- Inferencia en navegador mediante `onnxruntime-web` (WASM) y en servidor mediante `onnxruntime`.
- Soporte de procesamiento por lotes (`batch_size` configurable en la forma del tensor).
- No se documenta soporte de tool calling, function calling, agentes, razonamiento multi-paso, capacidades multilingues, vision, audio ni modo "thinking".

## Casos de uso

- Filtrado de mensajes sospechosos en plataformas de peregrinacion: el clasificador podria integrarse como una capa de triaje que marque conversaciones con probabilidad alta de `fake_umrah_barcode_broker` para revision humana, siempre que se defina previamente el esquema de extraccion de caracteristicas de 512 dimensiones.
- Aviso en aplicaciones moviles para personas mayores: al ejecutarse via `onnxruntime-web` o `onnxruntime` movil, el modelo podria desplegarse en el propio dispositivo para senalar posibles estafas de visados sin enviar datos a un servidor.
- Moderacion de anuncios clasificados: uso como senal auxiliar en la revision de publicaciones que ofrecen campanas de Hajj, priorizando aquellas clasificadas como `unlicensed_hajj_campaign`.
- Enrutamiento en centros de atencion al peregrino: clasificar consultas entrantes para derivar los casos sospechosos a un equipo antifraude y los legitimos a informacion oficial.
- Analisis forense posterior a incidentes: etiquetado de registros de conversaciones o transacciones ya recopiladas para apoyar la investigacion de una denuncia.
- Prototipado de sistemas de alerta temprana: al ser un modelo ONNX de muy bajo peso, sirve para validar pipelines de deteccion de fraude antes de invertir en modelos mayores, siempre que se valide su rendimiento con datos propios.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La unica metrica declarada por el autor es "Calibration Accuracy: 100.00%", sin conjunto de evaluacion, tamano de muestra ni protocolo reproducible, por lo que no debe interpretarse como evidencia de rendimiento generalizable.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el repositorio ocupa 0.0 GB y la entrada es un vector de 512 dimensiones, lo que sugiere un modelo de muy pocos parametros (potencialmente inferior a unos pocos MB), pero no se confirma.
- GPU recomendadas: no disponible; por el tamano aparente, la inferencia en CPU seria suficiente en la mayoria de escenarios.
- Compatibilidad con GPU de consumo: probable en cualquier GPU moderna e incluso en CPU, dado el formato ONNX y el tamano declarado del repositorio, aunque no hay datos oficiales.
- Opciones de despliegue: `onnxruntime` (Python, C++, C#, Java), `onnxruntime-web` (WASM en navegador) y cualquier runtime compatible con ONNX opset 14.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. No se han identificado en la informacion proporcionada modelos comparables de la misma categoria (clasificacion de fraude en peregrinacion) con especificaciones verificables.

## Limitaciones y advertencias

- Ausencia total de documentacion sobre arquitectura, datos de entrenamiento y evaluacion: no es posible verificar la validez del modelo ni reproducir sus resultados.
- La metrica "Calibration Accuracy: 100.00%" carece de respaldo metodologico y debe tratarse con escepticismo; una precision perfecta en un problema de fraude del mundo real es altamente improbable sin sobreajuste o fuga de datos.
- Se desconoce el esquema de extraccion de caracteristicas de 512 dimensiones, lo que impide reutilizar el modelo sin ingenieria inversa del pipeline original.
- No se documentan sesgos conocidos, pero al no haber informacion sobre el dataset no puede descartarse un sesgo geografico, linguistico o cultural en las predicciones.
- Riesgo de falsos positivos y negativos no cuantificado; en un contexto humanitario, un falso positivo podria perjudicar a peregrinos legitimos.
- La licencia MIT permite uso comercial, pero la ausencia de garantias tecnicas hace desaconsejable su uso en produccion sin una validacion independiente.
- El modelo no es generativo: no puede explicar sus decisiones ni mantener conversaciones; su utilidad se limita a la clasificacion.
- La model card incluye elementos promocionales (sellos de "verificacion", datos de contacto, referencias a una flota de 25 modelos) que no constituyen evidencia tecnica y deben ignorarse al evaluar el modelo.

## Enlaces

- Hugging Face: https://huggingface.co/elnemer7/ElNeMeR-Hajj-Umrah-Visa-Fraud-ONNX
- Plataforma del autor: https://detector.elnemer-ai.com
- Portal corporativo: https://elnemer-ai.com
