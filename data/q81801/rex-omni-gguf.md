# q81801/Rex-Omni-GGUF

## Resumen

Rex-Omni es un modelo multimodal de tipo image-text-to-text orientado a *visual grounding* y deteccion de objetos, desarrollado originalmente por IDEA-Research. El modelo base, IDEA-Research/Rex-Omni, se distribuye bajo la licencia IDEA License 1.0 y esta pensado para tareas de localizacion visual: dada una imagen y una instruccion en lenguaje natural, devuelve coordenadas de objetos en forma de tokens especiales de caja.

El repositorio q81801/Rex-Omni-GGUF es una cuantizacion comunitaria del modelo base en formato GGUF para su uso con llama.cpp. Concretamente se ofrece la variante UD-IQ4_XS del modelo principal (1.994.326.624 bytes) y un proyector visual mmproj en Q8_0 (844.757.600 bytes). El modelo cuenta con 3.397.103.616 parametros totales segun los pesos safetensors del modelo original.

La relevancia de esta ficha radica en que permite ejecutar localmente un modelo de grounding visual de ~3.4B parametros en hardware de consumo, algo poco habitual en esta categoria. No obstante, el autor documenta un comportamiento problematico: en decodificacion voraz con llama.cpp el modelo a menudo no emite EOS y sigue generando tokens de cierre de caja o respuestas repetidas, algo que tambien ocurre en el modelo F16 original (13 de 50 imagenes alcanzaron el limite en F16 frente a 25 en la version cuantizada).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo multimodal image-text-to-text; detalles de la arquitectura interna no disponibles) |
| Parametros totales | 3.397.103.616 |
| Parametros activos | no aplica (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | UD-IQ4_XS (modelo principal), Q8_0 (proyector visual mmproj) |
| Idiomas soportados | en (ingles) |
| Licencia | IDEA License 1.0 (identificador `other`) |
| Formato de pesos | GGUF (safetensors en el modelo base) |

## Arquitectura y entrenamiento

No se dispone de informacion detallada sobre la arquitectura interna del modelo en la informacion proporcionada. Por el pipeline `image-text-to-text` y por el uso de un proyector visual separado (`mmproj`), se trata de un modelo multimodal que combina un codificador de vision con un modelo de lenguaje, siguiendo el patron habitual de los modelos VLM. La referencia a Qwen-VL en la model card (recomendacion de `--image-min-tokens 1024`) sugiere que el componente de lenguaje o el esquema de tokens de grounding esta inspirado en la familia Qwen-VL, pero esto no se confirma de forma explicita.

El modelo base fue entrenado por IDEA-Research; no se detallan en la informacion disponible el numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF o DPO. La cuantizacion comunitaria se realizo con `llama-quantize --imatrix` usando una matriz de importancia calculada sobre el propio modelo, con corpus de calibracion COCO val2017 y prompts en formato Rex; los tensores de embedding de tokens se protegieron en q6_k. Antes de la conversion se corrigio el tokenizer del repositorio original, que carecia de `tokenizer.json`, para evitar la renumeracion de los tokens de coordenadas `<0>`..`<999>` (vinculados a los ids 150643..151642).

## Capacidades

- Generacion de texto multimodal a partir de imagen e instruccion en lenguaje natural.
- Visual grounding: localizacion de objetos mediante tokens de caja con coordenadas (tokens `<0>`..`<999>`).
- Deteccion de objetos guiada por texto (object detection con prompts).
- Salida estructurada en forma de cajas delimitadoras parseables.
- Capacidad conversacional (tag `conversational`).
- Compatibilidad con endpoints (`endpoints_compatible`).
- Soporte de inferencia local via llama.cpp en formato GGUF.
- Idiomas: unicamente ingles segun la model card.

## Casos de uso

- Anotacion automatica de datasets de vision: el modelo puede generar cajas delimitadoras sobre imagenes de un corpus (por ejemplo, imagenes de COCO) para preetiquetar objetos y reducir el trabajo manual de anotacion, dado su caracter de grounding.
- Deteccion de objetos en pipelines de inspeccion: integrado en un flujo de procesamiento de imagenes, el modelo devuelve coordenadas de objetos descritos en texto, util para control de calidad o inventario visual.
- Asistente de accesibilidad: descripcion y localizacion de elementos en imagenes para generar texto alternativo o indicaciones espaciales a partir de una consulta en ingles.
- Prototipado local en estacion de trabajo: al caber en formato GGUF de ~2 GB para el modelo principal mas ~0.8 GB de proyector visual, permite experimentar con grounding sin GPU de datacenter, usando llama.cpp.
- Extraccion de regiones de interes para OCR o analisis posterior: el modelo localiza la region descrita y el pipeline recorta esa zona para pasarla a otro modelo especializado.
- Investigacion en evaluacion de cuantizaciones: el repositorio documenta una comparacion de precision frente al F16 original (IoU pareado de 0.967 en 50 imagenes de COCO val2017), lo que lo hace util como referencia para estudiar el impacto de la cuantizacion en tareas de grounding.
- Busqueda visual por descripcion: dado un catalogo de imagenes, localizar elementos descritos textualmente para construir indices o filtros visuales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. El unico dato de evaluacion proporcionado es una comparacion de precision de grounding frente al modelo F16 original:

| Metrica | Valor |
|---|---|
| IoU pareado (misma clase, IoU>=0.5, emparejamiento voraz) frente a F16 | 0.967 |
| Imagenes de evaluacion | 50 (COCO val2017) |
| Decodificacion | voraz (greedy) |
| Imagenes que alcanzan el limite de tokens (F16) | 13 de 50 |
| Imagenes que alcanzan el limite de tokens (cuantizado) | 25 de 50 |

## Requisitos de hardware

- VRAM estimada: el modelo principal UD-IQ4_XS ocupa aproximadamente 1.99 GB y el proyector visual Q8_0 unos 0.84 GB; en total en torno a 2.8 GB de pesos, por lo que la VRAM necesaria para inferencia ronda los 3-4 GB incluyendo overhead de contexto y buffers.
- Cabe en GPU de consumo: si, en tarjetas con 6 GB o mas de VRAM (por ejemplo RTX 3060, RTX 4060, RTX 2070). Tambien puede ejecutarse en CPU con llama.cpp, aunque con mayor latencia.
- GPU recomendadas: cualquier GPU consumer con >=6 GB de VRAM; para mayor throughput, RTX 4090 o A100/H100, aunque el modelo es pequeno y no las aprovecha plenamente.
- Opciones de despliegue: llama.cpp (formato nativo del repositorio). No se documentan otros runners (vLLM, TGI, Ollama) en la informacion disponible.
- Parametros de inferencia recomendados por el autor: `-n` en torno a 1024, `--image-min-tokens 1024`, decodificacion voraz; parsear la primera respuesta completa e ignorar la cola repetida.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de datos de rendimiento comparables en la informacion proporcionada para establecer una comparativa cuantitativa con alternativas. A nivel cualitativo, el modelo se situa en la categoria de VLM pequenos (~3.4B parametros) especializados en grounding visual, pero no se han facilitado resultados de benchmarks de terceros ni especificaciones de modelos competidores en esta busqueda.

| Modelo | Parametros | Contexto | Licencia | Formato |
|---|---|---|---|---|
| Rex-Omni (este) | 3.397.103.616 | no disponible | IDEA License 1.0 | safetensors / GGUF |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- El modelo solo soporta ingles segun la model card; el rendimiento en otros idiomas no esta garantizado.
- Problema conocido de terminacion: en decodificacion voraz con llama.cpp el modelo a menudo no emite EOS y continua generando `<|box_end|>` o respuestas repetidas hasta el limite de tokens. Ocurre tambien en el F16 original (13/50 imagenes) y es mas frecuente en la version cuantizada (25/50). Es necesario limitar `-n` y parsear solo la primera respuesta completa.
- La cuantizacion UD-IQ4_XS introduce una perdida de precision medible: IoU pareado de 0.967 frente al F16, aceptable pero no identico al modelo original.
- Licencia IDEA License 1.0: es una licencia `other` con terminos propios; es imprescindible revisar sus condiciones antes de cualquier uso comercial o redistribucion. El repositorio es un archivo publico y cualquier redistribucion debe cumplir la licencia original.
- Riesgo de alucinacion: no se documenta de forma especifica, pero es inherente a los modelos generativos multimodales; las cajas generadas pueden no corresponder a objetos reales.
- No se dispone de informacion sobre sesgos del modelo base ni sobre su comportamiento en dominios distintos de los evaluados (COCO).
- El repositorio tiene 0 descargas y 1 like en el momento de la consulta, lo que indica escasa validacion por parte de la comunidad.
- No se documentan longitudes de contexto ni limites de imagenes por inferencia.

## Enlaces

- Repositorio GGUF: https://huggingface.co/q81801/Rex-Omni-GGUF
- Modelo base: https://huggingface.co/IDEA-Research/Rex-Omni
- Licencia IDEA License 1.0: referencia en la model card del modelo base (no se proporciona URL directa en la informacion disponible)
- llama.cpp: no se proporciona enlace en la informacion disponible
- Paper, blog o demo oficiales: no disponibles en la informacion proporcionada
