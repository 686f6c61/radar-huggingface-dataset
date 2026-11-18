# sautilm/SautiLM-Nuru-Agri

## Resumen

SautiLM-Nuru-Agri es un clasificador de imagenes de tipo edge-AI desarrollado por LosingTek Research para el ecosistema SautiLM, con sede en Bunia (Ituri, Republica Democratica del Congo). Se trata de un modelo TFLite de 1,074 MB, derivado de MobileNetV3-Small con cuantizacion completa INT8, disenado para ejecutarse de forma 100% offline en dispositivos moviles de gama baja. Su proposito es la clasificacion de cultivos del Este de Africa (9 clases de cultivos EAC mas una clase `non_plant`), orientado a contextos agricolas con conectividad limitada.

El modelo forma parte de una arquitectura de tres niveles definida por SautiLM: SautiLM-Jua (modelos de lenguaje moviles de 270M), SautiLM-Nuru (clasificadores visuales TFLite de hasta 45 MB, donde se encuadra este modelo) y SautiLM-Kuu (modelos de 1B para movil y 4B para escritorio). Es relevante por su enfoque en IA soberana, offline y de bajo consumo para regiones con infraestructura limitada, aunque su corpus de entrenamiento es muy reducido (260 ejemplos verificados) y no se han publicado metricas de rendimiento.

La ficha tecnica disponible es escasa: no hay resultados de benchmarks, ni verificacion en runtime completada, ni perdidas de entrenamiento reportadas. La licencia declarada es `gemma`, lo que conviene revisar con detalle antes de cualquier uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MobileNetV3-Small, full-integer INT8 (entrada 224x224x3 uint8) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (clasificacion de imagenes) |
| Tipos de cuantizacion | INT8 (`tflite_int8_weights`) |
| Idiomas soportados | fr, en, sw (metadatos del modelo; la tarea es vision) |
| Licencia | gemma |
| Formato de pesos | TFLite (`sautilm-nuru-agri.tflite`, 1,074 MB) |

## Arquitectura y entrenamiento

El modelo es una adaptacion de `tf.keras.applications.MobileNetV3Small`, convertida a TFLite con cuantizacion completa de pesos a INT8 mediante `litert-torch`. La entrada es una imagen RGB de 224x224x3 en formato uint8, y la salida corresponde a 10 clases: 9 clases de cultivos del Este de Africa (EAC) mas una clase `non_plant`. El modelo esta pensado para ejecutarse en CPU o mediante el acelerador NNAPI en dispositivos moviles, con un limite de tamano de 45 MB dentro de la familia SautiLM-Nuru.

El entrenamiento se realizo con 260 ejemplos verificados y sin fuga de datos (zero-leakage), segun la model card. Se menciona una configuracion LoRA con `r=16` y `alpha=32`, aunque no se especifican los pasos de entrenamiento ni las perdidas de entrenamiento y validacion (aparecen como "Pending"). No se detalla la composicion del dataset, el numero de tokens (no aplica en vision) ni si hubo tecnicas de aumento de datos. Tampoco se ha completado la verificacion en runtime. La innovacion principal es la optimizacion extrema para despliegue offline en hardware de gama baja.

## Capacidades

- Clasificacion de imagenes de cultivos del Este de Africa en 9 categorias mas una clase `non_plant`.
- Inferencia 100% offline en dispositivos moviles, sin dependencia de red.
- Ejecucion en CPU y aceleracion opcional via NNAPI.
- Modelo cuantizado INT8 de 1,074 MB, adecuado para almacenamiento y memoria limitados.
- Metadatos multilingues (fr, en, sw), aunque la tarea es puramente visual.
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso (no es un modelo de lenguaje).
- No dispone de modo thinking, vision generativa, audio ni otras capacidades multimodales mas alla de la clasificacion.

## Casos de uso

- Diagnostico agricola offline en campo: un agricultor fotografia una planta con su movil y el modelo clasifica el cultivo entre las 9 clases EAC, sin necesidad de conexion, gracias a su tamano de 1,074 MB y ejecucion en CPU.
- Aplicaciones de extension agraria en zonas rurales: integrado en apps Android para tecnicos agricolas que necesitan identificar cultivos en regiones sin cobertura, usando NNAPI para acelerar la inferencia.
- Filtrado previo en pipelines de vision: la clase `non_plant` permite descartar imagenes que no contienen plantas antes de enviarlas a modelos mayores (por ejemplo, SautiLM-Kuu), reduciendo coste computacional.
- Educacion y formacion agricola: herramienta de apoyo en talleres para reconocer cultivos del Este de Africa mediante capturas de camara en dispositivos de gama baja.
- Investigacion de campo con recogida de datos: clasificacion automatica de imagenes capturadas por encuestadores para etiquetado preliminar, con posterior revision humana dado el reducido corpus de entrenamiento.
- Prototipado de IA soberana en la RDC: base para desarrolladores locales que quieran construir soluciones de vision offline adaptadas a cultivos regionales, dentro del ecosistema SautiLM.
- Demostracion de despliegue edge: ejemplo de pipeline TFLite INT8 para integracion en wearables o dispositivos IoT con recursos muy limitados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica que la verificacion en runtime y las perdidas de entrenamiento y validacion estan "Pending".

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica en el sentido tradicional; el modelo esta pensado para CPU movil y NNAPI. El artefacto ocupa 1,074 MB en disco.
- GPU recomendadas: no requiere GPU; funciona en CPU de moviles y dispositivos embebidos. No se especifican modelos de GPU de escritorio.
- Cabe en cualquier dispositivo movil moderno (Android con soporte NNAPI) y en hardware embebido con al menos unos pocos MB de RAM libre para la inferencia INT8.
- Opciones de despliegue: TensorFlow Lite / LiteRT, con soporte de NNAPI en Android. No se mencionan vLLM, llama.cpp, Ollama ni TGI (no aplican a un clasificador de vision).
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Entrada | Formato | Licencia | Contexto / tarea |
|---|---|---|---|---|---|
| SautiLM-Nuru-Agri | no disponible | 224x224x3 uint8 | TFLite INT8 | gemma | Clasificacion de 10 clases (9 cultivos EAC + non_plant) |
| MobileNetV3-Small (original) | ~2,5 M (aprox., no confirmado en la info) | 224x224x3 | Keras / TF | Apache 2.0 (segun TensorFlow) | Clasificacion ImageNet (1000 clases) |
| SautiLM-Nuru-STEM / Med / Ius | no disponible | no disponible | TFLite INT8 | gemma | Clasificadores visuales del mismo ecosistema |

No se dispone de datos de rendimiento comparativo ni de otras alternativas especificas para clasificacion de cultivos del Este de Africa en la informacion proporcionada.

## Limitaciones y advertencias

- Corpus de entrenamiento muy reducido (260 ejemplos), lo que implica un alto riesgo de sobreajuste y baja generalizacion a condiciones reales de iluminacion, angulo o variedad de cultivos.
- No se han publicado metricas de validacion ni verificacion en runtime; el rendimiento real es desconocido.
- Sesgos probables hacia las condiciones de captura de las 260 imagenes de entrenamiento (dispositivo, iluminacion, region geografica concreta).
- Riesgo de clasificaciones erroneas en imagenes fuera de distribucion; la clase `non_plant` puede absorber falsos positivos.
- Licencia `gemma`: conviene revisar los terminos de la Gemma License antes de uso comercial, ya que impone restricciones y obligaciones de atribucion.
- Modelo limitado a vision y a 10 clases; no sirve para generacion de texto, razonamiento ni tareas multimodales.
- La documentacion tecnica esta incompleta (perdidas "Pending", sin benchmarks), lo que dificulta evaluar su idoneidad para produccion.
- El repo tiene 0 descargas y 0 likes, y el modelo fue creado en 2026-11-18; no hay evidencia de uso o validacion por terceros.

## Enlaces

- Hugging Face: https://huggingface.co/sautilm/SautiLM-Nuru-Agri
- Sitio web de SautiLM: https://sautilm.com
- LosingTek: https://losingtek.com
