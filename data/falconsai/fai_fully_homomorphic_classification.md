# Falconsai/fai_fully_homomorphic_classification

## Resumen

FAI Fully Homomorphic Classification v1 es un clasificador de imagenes binario desarrollado por FALCONS.AI que decide si una fotografia contiene una persona o no, ejecutandose integramente sobre imagenes cifradas. La particularidad es que la inferencia se realiza bajo cifrado homomorfico completo (FHE), de modo que el servidor que ejecuta el modelo nunca accede a la imagen en claro ni a la prediccion resultante: solo el poseedor de la clave secreta puede descifrar la salida. El esquema empleado es TFHE con seguridad de 128 bits, compilado con Zama Concrete ML 1.9.0 y concrete-python 2.10.0.

El modelo es deliberadamente pequeno: 46.968 parametros con cuantizacion entera (entradas de 6 bits, pesos y activaciones de 4 bits) y una entrada de 64x64 pixeles RGB. Recibe una imagen, produce dos logits (`no_person`, `person`) y es el cliente quien los descifra. La tarea esta acotada a clasificacion binaria: no cuenta, localiza ni identifica personas, y no reconoce caras ni atributos.

Se presenta como una version 1 funcional y auditable, orientada a demostrar una ruta cifrada de extremo a extremo con numeros publicados, mas que a maximizar el rendimiento. Su relevancia actual radica en servir como referencia medible para equipos que evaluan FHE en tareas reales de vision, especialmente en escenarios donde las imagenes no pueden salir del entorno sin cifrar.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Red neuronal cuantizada compilada a un circuito FHE (MLIR); tipo exacto de capas no especificado en la model card |
| Parametros totales | 46.968 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No aplica; entrada fija de imagen 64x64 RGB |
| Tipos de cuantizacion | Entera: entradas 6 bits, pesos 4 bits, activaciones 4 bits |
| Idiomas soportados | No disponible (tarea de clasificacion de imagen, no linguistica) |
| Licencia | falconsai-model-license-v1 (categoria `other`) |
| Formato de pesos | Circuito FHE compilado (MLIR) en `fhe/server.zip` y `fhe/client.zip`; version ONNX en `FAI_FHE.onnx` |
| Esquema de cifrado | TFHE, seguridad 128 bits, compilado con Concrete ML 1.9.0 / concrete-python 2.10.0 |
| Entrada / salida | Imagen 64x64 RGB cifrada (~295 kB) / 2 logits cifrados (~262 kB) |
| Version / identificador | v1, release `FAI_FHE_20261015_054859` |

## Arquitectura y entrenamiento

La model card no detalla la topologia interna de la red (numero de capas, tipo de convoluciones ni configuracion exacta), por lo que la arquitectura precisa figura como no disponible. Lo que si se especifica es que se trata de un modelo cuantizado a enteros y compilado a un circuito FHE ejecutable: el circuito resultante tiene un ancho de bit intermedio maximo de 13 y un redondeo de acumulador de 7 bits, y su ejecucion sobre una imagen requiere 41.024 bootstraps programables. Los parametros del esquema TFHE fueron seleccionados por el optimizador de Concrete, con una probabilidad de error por operacion de 8,0 x 10⁻¹³.

No se aportan datos sobre el volumen de tokens o imagenes de entrenamiento, la composicion del dataset de entrenamiento, ni si hubo tecnicas de alineacion como RLHF o DPO; estos datos no estan disponibles. La evaluacion declarada se realizo sobre imagenes naturales de COCO-2017 (conjunto de validacion, 4.247 imagenes retenidas), que define el dominio en el que los numeros publicados son validos.

En cuanto a la innovacion tecnica, el aspecto destacable no es la red en si, sino la ruta cifrada de extremo a extremo: la clave secreta la genera y retiene unicamente el cliente y nunca se transmite; las claves de evaluacion (~2,1 GB) permiten computar sobre ciphertexts sin capacidad de descifrado. El servidor aprende unicamente que ha ocurrido una consulta, su tamano y su temporizacion. La generacion de claves en el cliente tarda aproximadamente 17,5 s en una CPU de 8 nucleos.

## Capacidades

- Clasificacion binaria de imagenes: distingue entre `person` (al menos una persona visible que ocupa aproximadamente el 2 % o mas del encuadre) y `no_person`.
- Inferencia sobre datos cifrados: todo el computo se realiza sobre ciphertexts TFHE, sin exponer la imagen ni el resultado al servidor.
- Salida con confianza: devuelve dos logits (`no_person`, `person`) que el cliente descifra localmente.
- Gestion de claves del lado del cliente: generacion de clave secreta y claves de evaluacion para registro en el servidor.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No tiene capacidades multilingues (no es un modelo linguistico).
- No dispone de modo de razonamiento, vision avanzada, audio ni generacion de texto.

## Casos de uso

- Control de ocupacion y presencia: determinar si alguien aparece en el encuadre de una camara (vestibulos, salas de control, habitaciones de hospital o camaras domesticas procesadas por un tercero) sin que el flujo de video abandone las instalaciones en claro.
- Triaje de fotografias con preservacion de privacidad: enrutar imagenes subidas que contienen personas hacia un tratamiento distinto (consentimiento, retencion, desenfoque) sin que el servicio de triaje vea nunca la imagen.
- Control de contenido para modelos compartidos: responder "person / no person" sobre imagenes de un socio sin que este las revele al proveedor del servicio.
- Cumplimiento normativo y minimizacion de datos: procesar imagenes bajo cifrado en flujos sujetos a requisitos estrictos de proteccion de datos, reduciendo la exposicion de datos personales en el servidor.
- Carga de referencia para evaluar FHE: usar el modelo, con su paquete de auditoria, scripts de validacion y latencias medidas, para valorar si FHE encaja en un entorno propio antes de escalar.
- Filtrado previo en pipelines de vision: descartar o etiquetar imagenes sin personas antes de pasarlas a modelos mas costosos, manteniendo la clasificacion inicial bajo cifrado.
- Demostraciones y pruebas de concepto de inferencia cifrada: servir como ejemplo reproducible de una ruta FHE completa con numeros verificables.

## Benchmarks y rendimiento

Resultados declarados por el autor (tarea: clasificacion binaria person / no_person, evaluada bajo simulacion FHE; dataset COCO-2017 val, 4.247 imagenes retenidas). Los valores no estan verificados de forma independiente.

| Metrica | Valor | Intervalo de confianza 95 % |
|---|---|---|
| Accuracy (simulada FHE) | 0,8119 | 0,800 – 0,824 |
| ROC-AUC (simulada FHE) | 0,8839 | 0,874 – 0,894 |
| F1 (simulada FHE) | 0,7874 | 0,773 – 0,802 |

No se han publicado otros resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- La inferencia FHE se ejecuta tipicamente en CPU; no se publican requisitos de VRAM ni GPU en la informacion disponible.
- Claves de evaluacion: ~2,1 GB, generadas por el cliente y registradas una vez en el servidor.
- Generacion de claves en el cliente: aproximadamente 17,5 s medidos en una CPU de 8 nucleos.
- Coste de computo del lado del servidor: 41.024 bootstraps programables por imagen, lo que condiciona fuertemente la latencia.
- No se especifican GPU recomendadas ni si el modelo cabe en GPU de consumo; dato no disponible.
- Opciones de despliegue: el modelo se distribuye como circuito FHE (`fhe/server.zip`, `fhe/client.zip`) mas artefactos auxiliares (`fhe/model_meta.json`, `fhe/versions.json`) y una version ONNX (`FAI_FHE.onnx`). No se documentan integraciones con vLLM, llama.cpp u Ollama (no aplicables a esta tarea).
- Latencia y throughput: no se publican cifras mas alla del tiempo de generacion de claves; dato no disponible.

## Comparativa con modelos similares

No se dispone en la informacion proporcionada de modelos comparables de clasificacion de imagenes bajo cifrado homomorfico completo, por lo que la comparativa se considera no disponible. Como referencia cualitativa, los clasificadores de imagen convencionales (no cifrados) de tareas similares operan sobre imagenes en claro y no ofrecen garantias de privacidad del dato durante la inferencia, pero no se aportan cifras concretas de dichos modelos en esta ficha.

| Modelo | Parametros | Contexto / entrada | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| FAI Fully Homomorphic Classification v1 | 46.968 | Imagen 64x64 RGB | Accuracy 0,8119; ROC-AUC 0,8839; F1 0,7874 (simulacion FHE) | falconsai-model-license-v1 | HuggingFace |
| Alternativas comparables | No disponible | No disponible | No disponible | No disponible | No disponible |

## Limitaciones y advertencias

- Sesgos: no se documentan analisis de sesgo; no se especifica el equilibrio del dataset de entrenamiento ni su representatividad.
- Riesgo de alucinacion: no aplica en el sentido linguistico, pero el modelo puede producir falsos positivos y falsos negativos; el F1 declarado (0,7874) implica una tasa de error apreciable.
- Alcance funcional muy limitado: no cuenta personas, no las localiza, no las identifica, no estima edad ni atributos y no reconoce caras. Solo devuelve una de dos etiquetas mas una confianza.
- Dominio restringido: los numeros publicados solo son validos para fotografias naturales de escenas cotidianas (COCO-2017); no se garantiza su comportamiento fuera de ese dominio.
- Resultados no verificados: las metricas estan marcadas como no verificadas y corresponden a simulacion FHE, no necesariamente a ejecucion FHE real.
- Limitaciones de idioma: no aplica, al ser un modelo de vision sin componente linguistico.
- Licencia: falconsai-model-license-v1 (categoria `other`). Las condiciones exactas para uso comercial deben consultarse en el fichero LICENSE del repositorio; no se detallan en la informacion disponible.
- Modelo de datos, no de modelo: los pesos residen en claro en el servidor; la proteccion cubre la imagen y la prediccion, no los pesos.
- Riesgo de extraccion del modelo: multiples consultas pueden revelar el comportamiento del modelo; se recomienda limitar la tasa de peticiones si esto es relevante.
- Despliegue en produccion: la version 1 no esta optimizada para throughput y su unico uso demostrado es la deteccion binaria de personas en fotografias naturales.
- Fuga de metadatos: el servidor conoce que ha ocurrido una consulta, su tamano y su temporizacion.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta; tamano de repo 0,0 GB. No hay evidencia de adopcion.

## Enlaces

- HuggingFace: https://huggingface.co/Falconsai/fai_fully_homomorphic_classification
- Licencia (referenciada en la model card): LICENSE (fichero dentro del repositorio)
- Dataset de evaluacion: detection-datasets/coco (COCO-2017)
- Libreria/compilador: Zama Concrete ML 1.9.0 y concrete-python 2.10.0 (referencias nombradas en la model card; sin enlaces explicitos en la informacion proporcionada)
- Artefactos del repositorio: `fhe/client.zip`, `fhe/server.zip`, `fhe/model_meta.json`, `fhe/versions.json`, `FAI_FHE.onnx`, `falcons_ai_logo.png`
- Paper, blog, repositorio de codigo o demo adicionales: no disponibles en la informacion proporcionada
