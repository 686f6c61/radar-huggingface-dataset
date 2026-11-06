# BicycleButler/m2v2-gemma2-audio-256d-int8

## Resumen

M2V2 Gemma-2 Audio 256d INT8 es un modelo de extracción de características de audio publicado por BicycleButler como complemento oficial del ecosistema de búsqueda de conocimiento cero (zero-knowledge) Bicycle Butler. Se construye extrayendo la torre de audio (`audio_tower`, basada en arquitectura Conformer) y la proyección de embeddings de audio (`embed_audio.embedding_projection`) del modelo multimodal `google/embeddinggemma-2`, y cuantizándolas a INT8. Su función es transformar fotogramas de audio de micrófono y comandos de voz en vectores unitarios de 256 dimensiones que habitan exactamente el mismo espacio vectorial que el modelo de texto asociado (`BicycleButler/m2v2-gemma2-256d-int4`), lo que permite comparar directamente una consulta hablada con un catálogo indexado por texto.

El modelo está diseñado para ejecutarse íntegramente en el dispositivo del usuario, mediante WebGPU o WASM en el navegador, o a través del demonio local `meaty` en `127.0.0.1:11435`. Esto encaja en una arquitectura en la que el servidor en la nube nunca realiza inferencia de machine learning: solo transporta y almacena datos ya procesados localmente. La relevancia actual reside en la combinación de búsqueda multimodal sin transcripción intermedia, despliegue en cliente y cuantización INT8 que, según el autor, conserva el 98,6 % de la precisión de recuperación respecto a FP16.

El repositorio tiene un tamaño de 0,0 GB y, en el momento de la consulta, registra 0 descargas y 0 likes, lo que indica un modelo muy reciente y de nicho, orientado a un producto concreto más que a un uso generalista. La licencia es Apache-2.0, sujeta además a los Términos de Uso de Gemma de Google.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Conformer (torre de audio `audio_tower`) con proyección de embeddings de audio, extraída de `google/embeddinggemma-2` |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | INT8 (8 bits) |
| Idiomas soportados | en (inglés) |
| Licencia | Apache-2.0, sujeta a los Términos de Uso de Gemma de Google |
| Formato de pesos | ONNX (según etiquetas del repositorio); no se detallan otros formatos |

## Arquitectura y entrenamiento

La arquitectura corresponde a la torre de audio de `google/embeddinggemma-2`, un codificador de tipo Conformer, junto con la proyección `embed_audio.embedding_projection` que mapea las representaciones acústicas al espacio de embeddings compartido. El modelo no se entrena desde cero: es una extracción de componentes de un modelo base de Google, seguida de cuantización a INT8. La salida es un vector de 256 dimensiones normalizado (unitario), alineado con el espacio del modelo de texto `BicycleButler/m2v2-gemma2-256d-int4`.

No se dispone de información sobre el volumen de datos de entrenamiento, la composición del dataset, ni sobre si hubo etapas de RLHF o DPO en el modelo original. La innovación técnica destacable no está en el entrenamiento sino en el diseño de despliegue: inferencia en cliente vía WebGPU o WASM, cuantización INT8 con una pérdida de precisión de recuperación declarada del 1,4 % frente a FP16, y la alineación de espacios vectoriales entre modalidades (audio y texto) que permite búsqueda directa sin pasar por ASR.

## Capacidades

- Extracción de características de audio: codifica fotogramas de micrófono en vectores de 256 dimensiones.
- Búsqueda directa voz a catálogo: empareja habla acústica con ítems indexados sin transcripción intermedia.
- Alineación multimodal: los vectores de audio son comparables con los del modelo de texto del mismo ecosistema (mismo espacio de 256 dimensiones).
- Ejecución en dispositivo: WebGPU o WASM en navegador, o demonio local `meaty` en `127.0.0.1:11435`.
- Integración como complemento en la librería `@wiltermoodj/search` mediante la clase `Gemma2AudioEngine`.
- Procesamiento de comandos de voz para búsqueda manos libres.
- No se documentan capacidades de generación de texto, razonamiento, código, matemáticas, tool calling ni agentes; el modelo es exclusivamente un extractor de embeddings de audio.

## Casos de uso

- Búsqueda de catálogo por voz en aplicaciones web: el modelo convierte la consulta hablada en un vector de 256 dimensiones y lo compara con los embeddings de texto del catálogo, todo en el navegador mediante WebGPU, sin enviar audio al servidor.
- Asistentes de compra manos libres: un usuario puede dictar el nombre o la descripción de un producto y obtener coincidencias semánticas sin que el audio salga del dispositivo, lo que resulta adecuado por su arquitectura zero-cloud.
- Indexación y recuperación con privacidad reforzada: en entornos donde el audio es sensible (salud, finanzas, domótica), la inferencia local elimina la necesidad de transmitir grabaciones a infraestructura de terceros.
- Integración en aplicaciones de escritorio mediante el demonio local `meaty`: permite que un cliente nativo realice búsquedas por voz usando el mismo espacio vectorial que el índice de texto ya existente.
- Prototipado de interfaces de voz en navegador: la disponibilidad de pesos ONNX y la compatibilidad con WebGPU/WASM facilitan demos y pruebas de concepto sin backend de ML.
- Sistemas de accesibilidad: comandos de voz para navegar por contenidos o catálogos en personas con movilidad reducida, con latencia local y sin dependencia de conectividad para la fase de inferencia.
- Filtrado y enrutamiento de audio en el cliente: clasificación o recuperación de fragmentos de audio por similitud semántica antes de decidir si se envían a un servicio remoto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El único dato de rendimiento declarado por el autor es que la cuantización INT8 conserva el 98,6 % de la precisión de recuperación respecto a FP16, sin especificar el conjunto de evaluación ni la métrica exacta empleada.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el repositorio ocupa 0,0 GB, lo que sugiere un modelo de tamaño reducido, pero no se publican cifras de parámetros ni de memoria.
- GPU recomendadas: no se especifican modelos concretos; el autor indica ejecución vía WebGPU o WASM en el dispositivo del usuario.
- Compatibilidad con GPU de consumo: probable por el diseño en cliente y la cuantización INT8, pero no se confirma qué GPU concretas (RTX 4090, etc.) están validadas.
- Opciones de despliegue: WebGPU, WASM, ONNX Runtime y el demonio local `meaty` en `127.0.0.1:11435`; no se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Modalidad | Licencia | Despliegue |
|---|---|---|---|---|---|
| BicycleButler/m2v2-gemma2-audio-256d-int8 | no disponible | no disponible | Audio a embedding 256d | Apache-2.0 (términos Gemma) | WebGPU, WASM, ONNX, demonio local |
| google/embeddinggemma-2 | no disponible | no disponible | Multimodal (texto y audio) | Términos Gemma | Servidor o local, según implementación |
| BicycleButler/m2v2-gemma2-256d-int4 | no disponible | no disponible | Texto a embedding 256d | Apache-2.0 (términos Gemma) | Cliente, según ecosistema Bicycle Butler |

La comparación con alternativas de la misma categoría (extractores de embeddings de audio para búsqueda) no está disponible en la información proporcionada. El modelo está pensado para funcionar junto al modelo de texto del mismo autor más que como sustituto de otros codificadores de audio.

## Limitaciones y advertencias

- Cobertura lingüística limitada al inglés; no se documenta soporte multilingüe.
- No es un modelo generativo: no produce texto, código ni respuestas; solo embeddings de audio.
- La alineación con el espacio vectorial de texto solo está garantizada con el modelo `BicycleButler/m2v2-gemma2-256d-int4` del mismo ecosistema.
- El dato del 98,6 % de precisión de recuperación procede del autor y no está respaldado por una evaluación pública reproducible.
- No se detallan sesgos conocidos, tasas de alucinación ni comportamiento ante audio ruidoso o con acentos distintos del inglés.
- La licencia Apache-2.0 está condicionada por los Términos de Uso de Gemma de Google, que pueden imponer restricciones adicionales al uso comercial.
- El modelo tiene 0 descargas y 0 likes en el momento de la consulta, por lo que carece de validación comunitaria y de casos de producción documentados.
- No se especifican requisitos mínimos de memoria ni versiones de navegador compatibles con WebGPU, lo que dificulta planificar el despliegue.

## Enlaces

- Hugging Face: https://huggingface.co/BicycleButler/m2v2-gemma2-audio-256d-int8
- Modelo base: https://huggingface.co/google/embeddinggemma-2
- Modelo de texto asociado: https://huggingface.co/BicycleButler/m2v2-gemma2-256d-int4
- Licencia Apache-2.0: https://www.apache.org/licenses/LICENSE-2.0
