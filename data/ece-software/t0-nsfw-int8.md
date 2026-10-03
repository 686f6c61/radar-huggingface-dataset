# ECE-Software/t0-nsfw-int8

## Resumen

t0-nsfw-int8 es un modelo de clasificacion de imagenes para deteccion de contenido NSFW y gore, publicado por ECE-Software en HuggingFace. Se trata de un clasificador de vision exportado a formato ONNX y cuantizado a INT8, con un peso de archivo de tan solo 4,39 MB, lo que lo situa en la categoria de modelos ligeros para ejecucion en dispositivo (edge/on-device).

El modelo forma parte de una arquitectura de moderacion en dos niveles: el nivel T0 (este modelo) actua como pre-filtro local en el dispositivo del usuario, mientras que un nivel T1 en FP32 re-verifica las decisiones en el lado del servidor. Clasifica imagenes en tres clases: NSFL, NSFW y SFW, aplicando un umbral de decision de 0,5.

Su relevancia inmediata es practica: permite descartar la mayor parte de contenido inapropiado antes de enviarlo a un servidor, reduciendo coste de ancho de banda y de computo, a cambio de una perdida de recall medible (el propio autor reconoce que deja pasar 16 de cada 48 imagenes explicitas que el modelo FP32 equivalente si detecta). La licencia Apache 2.0 facilita su integracion comercial. No se dispone de informacion sobre arquitectura interna, datos de entrenamiento ni benchmarks formales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (clasificador de imagenes de tres clases exportado a ONNX; el tag "t0" designa el nivel/tier del pipeline, no una arquitectura T0 de NLP) |
| Parametros totales | no disponible (el archivo INT8 ocupa 4,39 MB; no se publica el recuento exacto) |
| Parametros activos | no aplica (no es un modelo de mezcla de expertos) |
| Longitud de contexto | no aplica (modelo de vision, no procesa secuencias de texto) |
| Tipos de cuantizacion | INT8 (exportacion ONNX) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (INT8) |

## Arquitectura y entrenamiento

No se ha publicado informacion sobre la arquitectura interna del modelo, la composicion del dataset de entrenamiento, el numero de imagenes utilizadas, si hubo fases de ajuste fino supervisado o los metodos de etiquetado empleados. El unico dato estructural confirmado es que se trata de un clasificador de imagen con tres clases de salida (NSFL, NSFW, SFW), umbral de decision 0,5 y exportacion a ONNX en precision INT8.

La innovacion operativa que si queda documentada es el diseno en dos niveles: este modelo T0 funciona como pre-filtro on-device, y un modelo T1 en FP32 re-comprueba en servidor. Este esquema reparte el coste de computo entre cliente y servidor, y reserva el modelo de mayor precision para el filtrado final. El autor cuantifica explicitamente la perdida de recall de la version INT8 frente a la FP32 (16 imagenes explicitas no detectadas de un conjunto de 48 que la FP32 si caza), lo que indica que la cuantizacion se evaluo antes de publicar el modelo.

## Capacidades

- Clasificacion de imagenes en tres categorias: NSFL (not safe for life, contenido gore o extremadamente explicito), NSFW (not safe for work, contenido sexual) y SFW (safe for work).
- Deteccion binaria efectiva mediante umbral de 0,5 sobre las probabilidades de clase.
- Inferencia en dispositivo o servidor mediante ONNX Runtime.
- Ejecucion en CPU mediante el proveedor CPUExecutionProvider, sin necesidad de GPU.
- Integracion como pre-filtro dentro de pipelines de moderacion de dos etapas (T0 local, T1 servidor).
- No se documenta soporte de tool calling, agentes, razonamiento multi-paso ni capacidades multilingues; no aplica a un clasificador de imagenes.

## Casos de uso

- Pre-filtrado on-device en aplicaciones de mensajeria: el cliente puede clasificar localmente una imagen antes de subirla, descartando o marcando contenido para revision y evitando transmitir material inapropiado al servidor.
- Moderacion de subidas en plataformas de contenido generado por usuarios: como primera barrera del pipeline, reduce el volumen de imagenes que alcanzan el modelo T1 en FP32, bajando coste de inferencia en servidor.
- Ahorro de ancho de banda y computo en backend: al ser un modelo de 4,39 MB ejecutable en CPU, permite desplegar moderacion masiva sin GPUs dedicadas para la etapa de triaje.
- Procesamiento con requisitos de privacidad: la inferencia local evita enviar imagenes potencialmente sensibles a infraestructura externa, lo que encaja en flujos con requisitos de minimizacion de datos.
- Clasificacion embebida en navegador o aplicación movil: al usar ONNX y CPU, puede integrarse en clientes ligeros sin dependencias pesadas ni runtime de GPU.
- Deteccion de gore y contenido NSFL en foros o comunidades: la clase NSFL especifica permite tratar de forma separada el contenido violento o extremo del contenido sexual.
- Triaje previo en sistemas de revision humana: las imagenes marcadas como NSFW o NSFL pueden encolarse para moderadores, mientras que las SFW se aprueban automaticamente con bajo coste.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K u otros) en la informacion disponible, y no aplican a un clasificador de imagenes. El unico dato de rendimiento publicado es cualitativo y comparativo entre cuantizaciones:

| Metrica | Valor |
|---|---|
| Umbral de decision | 0,5 |
| Perdida de recall INT8 frente a FP32 | No detecta 16 de 48 imagenes explicitas que la version FP32 si detecta |
| Precision sobre las mismas imagenes | no disponible |
| Tasa de falsos positivos | no disponible |

No se debe interpretar esta cifra como recall absoluto del modelo, ya que el autor solo indica que la INT8 pierde 16 imagenes que la FP32 captura, sin especificar cuantas de las 48 detecta la FP32.

## Requisitos de hardware

- Vram estimada para inferencia: practicamente nula; el modelo pesa 4,39 MB en INT8 y puede ejecutarse en RAM de sistema con CPUExecutionProvider.
- GPU recomendadas: no requiere GPU. Cualquier CPU x86 o ARM moderna es suficiente para la inferencia.
- Compatibilidad con GPU de consumo: irrelevante; el modelo esta pensado para CPU. Cabe en cualquier dispositivo, incluidos moviles y sistemas embebidos.
- Opciones de despliegue: ONNX Runtime (CPUExecutionProvider), descarga via `huggingface_hub.hf_hub_download`, integracion en aplicaciones Python con `onnxruntime.InferenceSession`. No se documentan integraciones con vLLM, llama.cpp, Ollama o TGI, que no aplican a un clasificador de imagen ONNX.
- Latencia y throughput estimados: no disponibles. Dado el tamano del modelo, la latencia esperada por imagen es muy baja, pero el autor no publica cifras.

## Comparativa con modelos similares

No disponible. La informacion proporcionada unicamente describe este modelo y menciona un modelo T1 en FP32 del mismo autor que actua como segunda etapa de verificacion en servidor, pero no incluye sus especificaciones, nombre ni resultados. No se dispone de datos de modelos de terceros comparables (parametros, contexto, licencia o rendimiento) en el material facilitado.

## Limitaciones y advertencias

- Recall limitado por la cuantizacion: el propio autor documenta que la version INT8 deja pasar 16 de cada 48 imagenes explicitas que el modelo FP32 equivalente si detecta, por lo que no debe usarse como unico filtro en escenarios de alto riesgo.
- Dependencia de una segunda etapa: el diseno presupone que existe un modelo T1 en FP32 en servidor que re-verifica; sin esa etapa, la tasa de contenido no detectado aumenta.
- Modelo de clasificacion, no generativo: no produce texto, no razona y no soporta herramientas ni agentes; cualquier expectativa de capacidades linguisticas es incorrecta.
- Sin datos de entrenamiento publicados: se desconoce la composicion del dataset, lo que impide evaluar sesgos de representacion ni posibles sesgos culturales o de dominio.
- Umbral fijo de 0,5: no se documenta si puede ajustarse ni como se calibro, lo que complica adaptar el balance precision/recall a cada caso de uso.
- Contenido sensible: el repositorio esta etiquetado como `not-for-all-audiences`; las imagenes de entrenamiento y su tematica pueden incluir material gore o explicito, lo que exige cuidado en su manipulacion.
- Sin benchmarks formales: no hay metricas estandar de precision, recall, F1 ni AUC publicadas, por lo que la evaluacion comparativa con alternativas es imposible con la informacion disponible.
- Licencia Apache 2.0: permite uso comercial y modificacion sin restricciones adicionales conocidas, pero conviene verificar que el dataset de entrenamiento (no documentado) no imponga condiciones adicionales.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/ECE-Software/t0-nsfw-int8
- Repositorio del autor (ECE-Software): https://huggingface.co/ECE-Software
- ONNX Runtime: https://onnxruntime.ai/
- Documentacion de huggingface_hub para descarga: https://huggingface.co/docs/huggingface_hub

Nota: la busqueda web realizada no devolvio resultados relevantes sobre este modelo; los enlaces recuperados corresponden a la ECE (Ecole Centrale d'Electronique), una escuela de ingenieria francesa, sin relacion con el modelo. No se han encontrado papers, blogs ni demos asociados al modelo en la informacion disponible.
