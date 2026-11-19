# open-edge-platform/gemma-4-e4b-it-int4-ov-dls-sample

## Resumen

Gemma-4-E4B-it INT4 (OpenVINO) es una distribucion optimizada del modelo vision-lenguaje Gemma-4-E4B-it de Google, publicada por open-edge-platform (Intel) en formato OpenVINO Intermediate Representation (IR) con pesos cuantizados a INT4 mediante NNCF. El modelo base es una variante "edge" de la familia Gemma 4, pensada para ejecucion en estaciones de trabajo de borde (edge workstations) con razonamiento visual profundo y contexto multimodal ampliado. Esta build concreta elimina la necesidad de exportar o cuantizar localmente: se descarga y ejecuta directamente con OpenVINO GenAI.

La ficha del modelo lo orienta a un caso de uso muy especifico: descripcion en lenguaje natural de video de camaras de trafico en entornos de ciudad inteligente (smart city), con integracion tanto en OpenVINO GenAI como en Intel DLStreamer (elemento `gvagenai`). El repositorio incluye un script de exportacion/descarga, un sample en Python que procesa un video de prueba y superpone subtitulos generados sobre los fotogramas, y un video de ejemplo de 10 segundos.

Es relevante para desarrolladores que necesitan desplegar un VLM en hardware Intel (CPU o GPU, sin soporte de NPU) con un footprint reducido gracias a la cuantizacion INT4 (6,09 GB de IR), y para quienes trabajan en pipelines de analitica de video en tiempo real sobre infraestructura de borde. La informacion disponible sobre arquitectura interna, datos de entrenamiento y benchmarks es escasa: la model card se centra en el flujo de despliegue, no en las caracteristicas tecnicas del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-lenguaje (VLM) basada en transformer; detalles internos no disponibles |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (la model card menciona "contexto multimodal ampliado" sin cifra) |
| Tipos de cuantizacion | INT4 (compresion de pesos con NNCF) |
| Idiomas soportados | en (ingles) |
| Licencia | MIT |
| Formato de pesos | OpenVINO IR (INT4), con tokenizer y detokenizer OpenVINO |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna del modelo base Gemma-4-E4B-it. La model card lo describe como un modelo vision-lenguaje de Google, variante "edge" de la familia Gemma 4, con contexto multimodal ampliado y razonamiento visual profundo orientado a estaciones de trabajo de borde. No se especifican el numero de parametros, la composicion del dataset de entrenamiento, el numero de tokens vistos ni si se aplicaron tecnicas de RLHF o DPO.

El aporte tecnico de esta publicacion es el pipeline de optimizacion: los pesos originales en PyTorch (Transformers) se convierten a OpenVINO IR y se comprimen a INT4 con NNCF, generando un artefacto listo para inferencia con OpenVINO GenAI. El repositorio incluye un script (`export_and_quantize.sh`) que descarga el IR pre-cuantizado (6,09 GB) y un video de prueba, y que puede reconvertir el tokenizer si la version incluida es mas reciente que el runtime OpenVINO activo (sin este paso, el elemento `gvagenai` falla al cargar el tokenizer). Los ficheros originales del tokenizer se conservan en `gemma_4_e4b_it_int4_ov/original_tokenizer/`.

## Capacidades

- Generacion de descripciones en lenguaje natural de contenido visual (imagenes y fotogramas de video).
- Respuesta a prompts de pregunta-respuesta visual en formato libre (visual question answering) sobre escenas.
- Descripcion de escenas urbanas: vehiculos, peatones, flujo de trafico, actividad en cruces.
- Procesamiento de video mediante muestreo de fotogramas (el sample usa un `FRAME_STRIDE` de 15) y generacion periodica de subtitulos.
- Integracion con pipelines de video en tiempo real mediante Intel DLStreamer.
- Capacidad multilingue limitada al ingles segun los metadatos del modelo.
- No se documentan capacidades de tool calling, function calling ni razonamiento agentico multi-paso.

## Casos de uso

- Vigilancia de ciudad inteligente: el modelo recibe fotogramas de camaras de trafico y genera descripciones en lenguaje natural de intersecciones y flujo urbano, adecuado por su naturaleza VLM y su despliegue en hardware de borde.
- Triaje y monitorizacion de incidentes: descripcion automatica de eventos anormales en la calle a partir de streams de camara, util para priorizar la revision humana en centros de control.
- Analisis de trafico: registro multimodal de densidad de vehiculos, flujo de peatones y actividad en pasos de cebra, con salida textual apta para indexacion y busqueda.
- Asistencia a operadores: pregunta-respuesta visual conversacional sobre feeds de camara en directo, para que un operador consulte el estado de una escena sin revisar el video manualmente.
- Pipelines de analitica de video con DLStreamer: el modelo se integra como elemento `gvagenai` dentro de grafos de GStreamer/DLStreamer, generando subtitulos superpuestos sobre los fotogramas procesados.
- Despliegue en estaciones de borde con CPU/GPU Intel: al distribuirse como IR INT4 de 6,09 GB y ejecutarse con OpenVINO GenAI, permite inferencia local sin pasos de exportacion ni cuantizacion adicionales.
- Prototipado rapido de VLM en hardware Intel: el repositorio incluye script de descarga, sample funcional y video de prueba, lo que facilita validar el modelo antes de integrarlo en produccion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- Hardware soportado: CPU y GPU unicamente. La NPU no esta soportada segun la model card.
- Tamano del artefacto: IR INT4 de 6,09 GB, lo que condiciona los requisitos de memoria (el modelo completo debe residir en memoria del dispositivo de inferencia).
- VRAM/RAM estimada: no disponible de forma explicita; como referencia, el artefacto de pesos ocupa 6,09 GB, a lo que hay que sumar el overhead del runtime y de las activaciones.
- GPU recomendadas: no se especifican modelos concretos; la model card solo indica GPU Intel como dispositivo soportado.
- Compatibilidad con GPU de consumo: no confirmada en la informacion disponible.
- Opciones de despliegue: OpenVINO GenAI (`VLMPipeline`) e Intel DLStreamer (elemento `gvagenai`). No se documentan vLLM, llama.cpp, Ollama ni TGI para este artefacto.
- Latencia y throughput: no disponibles. El sample usa `max_new_tokens = 40` por generacion y procesa un fotograma cada 15 (`FRAME_STRIDE = 15`).
- Requisitos de software: Python 3.11+ y FFmpeg para transcodificar el video de ejemplo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| gemma-4-e4b-it-int4-ov-dls-sample (esta ficha) | no disponible | no disponible | OpenVINO IR INT4 | MIT | Optimizado para CPU/GPU Intel, orientado a descripcion de video en smart city |
| OpenVINO/gemma-4-E4B-it-int4-ov | no disponible | no disponible | OpenVINO IR INT4 | no disponible en la informacion | Build INT4 upstream de la que deriva este sample; sin integracion DLStreamer documentada |
| google/gemma-4-E4B-it | no disponible | no disponible | PyTorch (Transformers) | no disponible en la informacion | Modelo base original de Google en precision completa |

No se dispone de datos de benchmarks ni de especificaciones detalladas de los modelos comparables en la informacion proporcionada, por lo que no es posible una comparacion cuantitativa de rendimiento.

## Limitaciones y advertencias

- Idiomas: solo se declara soporte de ingles; el rendimiento en castellano u otros idiomas no esta garantizado.
- Hardware: no hay soporte de NPU; solo CPU y GPU. Esto excluye aceleradores Intel NPU y limita el despliegue a determinadas configuraciones.
- Naturaleza del repositorio: se trata de un sample de demostracion (sufijo `dls-sample`), no de un artefacto de produccion validado; la propia model card advierte que la validacion previa se hizo con un stack de desarrollo RC1.
- Dependencia de version del tokenizer: si el tokenizer incluido es mas reciente que el runtime OpenVINO activo, es necesario reconvertirlo; de lo contrario, `gvagenai` falla al cargar.
- Riesgo de alucinacion: inherente a los modelos generativos; las descripciones de escenas pueden incluir objetos o eventos no presentes, algo critico en vigilancia e informes de incidentes.
- Sesgos: no documentados en la informacion disponible; al ser un modelo entrenado principalmente en ingles, puede presentar sesgos culturales y de dominio en escenas no occidentales.
- Licencia MIT: permite uso comercial, pero conviene verificar las condiciones del modelo base de Google (gemma-4-E4B-it) antes de desplegar en produccion, ya que la model card no detalla la licencia del modelo original.
- Ausencia de datos de rendimiento: no hay benchmarks publicados, por lo que la calidad de las descripciones en dominios concretos debe validarse empiricamente.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: ecosistema de validacion muy limitado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/open-edge-platform/gemma-4-e4b-it-int4-ov-dls-sample
- Modelo base: https://huggingface.co/google/gemma-4-E4B-it
- Build INT4 OpenVINO upstream: https://huggingface.co/OpenVINO/gemma-4-E4B-it-int4-ov
- Documentacion de OpenVINO GenAI: https://docs.openvino.ai/2026/openvino-workflow-generative/inference-with-genai.html
- FFmpeg: https://ffmpeg.org/
