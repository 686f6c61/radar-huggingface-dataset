# aungthuhein-dev/Raj-0.6B-GGUF

## Resumen

Raj-0.6B-GGUF es una re-cuantización no oficial del modelo de reconocimiento automático del habla (ASR) aungzaythant/Raj-0.6B, un modelo de 596 millones de parámetros especializado en transcripción de birmano hablado con mezcla de inglés (code-switching). El modelo original deriva de Qwen/Qwen3-ASR-0.6B mediante fine-tuning, y esta variante, publicada por aungthuhein-dev, convierte los pesos de 8 bits del repositorio oficial a formato GGUF en cuantización Q5_K_M para su uso con llama.cpp.

La relevancia de esta ficha es doble: por un lado, documenta un modelo ASR de tamano reducido (0,6B) orientado a un idioma de bajos recursos como el birmano; por otro, ilustra un flujo de despliegue en dispositivo (iPhone, mediante la app offline Palm Note) donde el formato GGUF y la cuantización agresiva son requisitos practicos. El repositorio solo contiene el decodificador de texto re-cuantizado (444 MB), y requiere el codificador de audio `mmproj-Raj-0.6B-Q8_0.gguf` (208 MB) publicado en el repositorio original.

Es importante subrayar que este repositorio no es una release oficial del modelo Raj: el autor lo declara explicitamente y atribuye todo el credito a aungzaythant. La licencia es Apache-2.0, heredada del modelo original y del upstream Qwen3-ASR.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo ASR multimodal: codificador de audio + decodificador de texto; base Qwen3-ASR) |
| Parametros totales | 596.049.920 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q5_K_M (este repo); Q8_0 (original); mmproj en Q8_0 |
| Idiomas soportados | birmano (my), ingles (en); disenado para habla birmana con mezcla de ingles |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (llama.cpp) |

## Arquitectura y entrenamiento

El modelo es un sistema ASR compuesto por un codificador de audio y un decodificador de texto, segun la estructura de Qwen3-ASR de la que deriva. El decodificador tiene 596 millones de parametros y se distribuye en este repositorio en cuantizacion Q5_K_M. El codificador de audio se publica por separado como `mmproj-Raj-0.6B-Q8_0.gguf` en el repositorio original. No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF o DPO en el fine-tuning.

La innovacion tecnica de este repositorio es exclusivamente de formato: se parte del `Raj-0.6B-Q8_0.gguf` oficial y se re-cuantiza con `llama-quantize --allow-requantize` usando llama.cpp b12182. El propio autor advierte que re-cuantizar desde Q8_0 pierde algo mas de calidad que cuantizar desde pesos de precision completa. El resultado es un decodificador de 423 MiB (frente a 609 MiB del Q8_0) que, junto al codificador de audio, permite inferencia local en dispositivos con recursos limitados.

## Capacidades

- Reconocimiento automatico del habla (ASR) para birmano hablado, con manejo de mezcla de ingles (code-switching).
- Transcripcion de audio mediante `llama-mtmd-cli` con el flag `--audio`.
- Salida con marcador `language None<asr_text>` seguido de la transcripcion.
- Uso offline en aplicaciones moviles (caso de uso declarado: Palm Note para iPhone).
- Inferencia compatible con llama.cpp y endpoints compatibles.
- No se documentan capacidades de generacion de texto general, razonamiento, codigo, matematicas, vision, tool calling ni agentes; el pipeline declarado es exclusivamente automatic-speech-recognition.

## Casos de uso

- Transcripcion offline en movil: integrado en la app Palm Note para iPhone, el modelo permite dictar y transcribir notas en birmano sin conexion, usando el decodificador Q5_K_M (423 MiB) y el codificador de audio Q8_0 (208 MB).
- Notas de voz en birmano con terminos en ingles: el modelo esta disenado para habla casual con code-switching, por lo que resulta adecuado para reuniones o apuntes donde se mezclan palabras tecnicas en ingles.
- Subtitulado de grabaciones en birmano: se puede procesar audio pregrabado por lotes con `llama-mtmd-cli` para generar transcripciones que sirvan de base a subtitulos.
- Archivado y busqueda de audio: transcribir entrevistas o clases en birmano para indexar el contenido textualmente y permitir busqueda posterior.
- Prototipado en llama.cpp: como modelo ASR pequeno en GGUF, sirve para experimentar con pipelines multimodales de llama.cpp sin requerir GPU de gran capacidad.
- Integracion en aplicaciones de escritorio ligeras: el tamano total (decodificador + codificador, en torno a 630 MB) permite empaquetar el modelo en aplicaciones de escritorio o moviles con almacenamiento limitado.
- Evaluacion comparativa de cuantizaciones: util para medir el impacto de Q5_K_M frente a Q8_0 en tareas ASR (CER de 18,1% frente a 16,7% en FLEURS).

## Benchmarks y rendimiento

El autor publica la tasa de error de caracteres (CER) sobre 50 clips del split de test de Google FLEURS en birmano (habla leida; espacios y puntuacion eliminados antes de puntuar):

| Variante | Tamano del decodificador | CER |
|---|---:|---:|
| Q8_0 (original) | 609 MiB | 16,7% |
| Q5_K_M (este repo) | 423 MiB | 18,1% |

El propio autor advierte que FLEURS es habla leida formal con casi ninguna mezcla birmano-ingles, por lo que no mide el habla casual con code-switching para la que Raj fue disenado. No se han publicado otros resultados de benchmarks (MMLU, HumanEval, GSM8K u otros) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma oficial; por tamano, el decodificador Q5_K_M ocupa 423 MiB y el codificador de audio 208 MB, por lo que la inferencia cabe holgadamente en menos de 1 GB de memoria.
- GPU recomendadas: no disponibles; por el tamano del modelo, cualquier GPU consumer moderna es suficiente y la inferencia en CPU es viable.
- Cabe en GPU consumer: si, dado el reducido tamano del modelo.
- Opciones de despliegue: llama.cpp (via `llama-mtmd-cli`), con soporte declarado de endpoints compatibles; requiere el fichero mmproj del repositorio original.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---:|---|---|---|---|
| Raj-0.6B-GGUF (este repo) | 596 M | no disponible | GGUF Q5_K_M | Apache-2.0 | Re-cuantizacion no oficial; CER 18,1% en FLEURS birmano |
| aungzaythant/Raj-0.6B | 596 M | no disponible | GGUF Q8_0 | Apache-2.0 | Modelo original; CER 16,7% en FLEURS birmano |
| Qwen/Qwen3-ASR-0.6B | no disponible | no disponible | no disponible | no disponible | Modelo base del que deriva Raj |

No se dispone de datos de rendimiento de Qwen3-ASR-0.6B en la informacion proporcionada, por lo que la comparativa se limita a las dos variantes de Raj y a la relacion de dependencia con el modelo base.

## Limitaciones y advertencias

- No es una release oficial: el autor lo declara explicitamente; todo el credito del modelo corresponde a aungzaythant.
- Perdida de calidad por re-cuantizacion: el CER sube de 16,7% a 18,1% al pasar de Q8_0 a Q5_K_M, y el autor advierte que re-cuantizar desde Q8_0 pierde mas calidad que desde precision completa.
- Evaluacion limitada: el CER se mide sobre solo 50 clips de FLEURS, habla leida formal sin apenas code-switching, por lo que no refleja el caso de uso principal del modelo.
- Cobertura idiomatica restringida: solo birmano e ingles; no se documenta soporte de otros idiomas.
- Dependencia de dos ficheros: requiere el decodificador de este repo mas el codificador de audio del repositorio original; descargar solo uno de ellos no es suficiente.
- Riesgo de alucinacion y errores de transcripcion: inherente a los modelos ASR, especialmente en audio ruidoso o con acentos no representados en el entrenamiento; no se documentan sesgos especificos.
- Restricciones de licencia: Apache-2.0 permite uso comercial, pero deben respetarse los ficheros LICENSE, NOTICE y UPSTREAM-LICENSE.txt del repositorio, incluida la licencia upstream de Qwen3-ASR.
- Contexto: no se documenta la longitud de contexto del decodificador, lo que limita la planificacion de audios largos.
- Sin datos de adopcion: 0 descargas y 0 likes en el momento de la consulta, lo que implica ausencia de validacion por parte de la comunidad.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/aungthuhein-dev/Raj-0.6B-GGUF
- Modelo base: https://huggingface.co/aungzaythant/Raj-0.6B
- Codificador de audio (mmproj): https://huggingface.co/aungzaythant/Raj-0.6B/blob/main/gguf/mmproj-Raj-0.6B-Q8_0.gguf
- Aplicacion Palm Note: https://github.com/aungthuhein2005/palm-note
- Modelo upstream Qwen3-ASR: https://huggingface.co/Qwen/Qwen3-ASR-0.6B
