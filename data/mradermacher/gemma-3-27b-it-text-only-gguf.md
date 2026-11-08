# mradermacher/gemma-3-27b-it-text-only-GGUF

## Resumen

`mradermacher/gemma-3-27b-it-text-only-GGUF` es una colección de cuantizaciones estáticas en formato GGUF del modelo `OpenPipe/gemma-3-27b-it-text-only`, que a su vez es una variante de solo texto del modelo multimodal `google/gemma-3-27b-it`. El trabajo de cuantización lo firma mradermacher, un conocido publicador de cuantizaciones GGUF para llama.cpp y ecosistemas compatibles, y el resultado se distribuye bajo el repositorio de Hugging Face con 186,7 GB de tamaño total (sumando todas las variantes de cuantización).

El modelo subyacente conserva la arquitectura transformer decoder-only de Gemma 3 con 27.009.346.304 parámetros (unos 27 mil millones) y está orientado a generación de texto conversacional en inglés. Al haberse eliminado la torre de visión respecto al Gemma 3 original, el modelo resultante es más ligero de desplegar en entornos de solo texto y permite cuantizaciones más agresivas sin perder la rama multimodal. La ficha actual corresponde exclusivamente al envoltorio GGUF, no al modelo base.

La relevancia práctica es doble: por un lado, ofrece una vía para ejecutar un modelo de 27B en hardware de consumo mediante cuantizaciones Q4_K_M (~16,6 GB) o Q5_K_M (~19,4 GB); por otro, permite desplegarlo en llama.cpp, Ollama o servidores compatibles con GGUF sin necesidad de GPUs de centro de datos. No obstante, la información pública del repositorio es escasa: no se declara licencia, no hay benchmarks propios y la model card es una plantilla genérica de mradermacher.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada de Gemma 3, variante text-only) |
| Parametros totales | 27.009.346.304 (~27B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0 |
| Idiomas soportados | en (ingles) |
| Licencia | no disponible |
| Formato de pesos | GGUF (cuantizaciones estaticas) y safetensors en el modelo base |
| Tamano del repositorio | 186,7 GB (todas las variantes) |
| Modelo base | OpenPipe/gemma-3-27b-it-text-only |
| Libreria declarada | transformers |
| Compatibilidad | endpoints_compatible |

## Arquitectura y entrenamiento

La arquitectura es la de Gemma 3, un transformer decoder-only con atención por ventanas deslizantes y atención global combinadas, aunque los detalles concretos de configuración (número de capas, dimensión oculta, número de cabezas) no se detallan en la información disponible para esta variante. El modelo base `OpenPipe/gemma-3-27b-it-text-only` deriva de `google/gemma-3-27b-it` mediante la eliminación de la torre de visión, conservando la parte textual y el ajuste por instrucciones (IT) del modelo original. No se documenta en esta ficha el número exacto de tokens de entrenamiento ni la composición del dataset, ya que esa información pertenece a la model card de Google y no se ha incluido en los datos proporcionados.

Sobre el proceso de cuantización, mradermacher aplica cuantizaciones estáticas (Q2_K a Q8_0) y ofrece adicionalmente cuantizaciones con imatrix/weighted en un repositorio separado (`gemma-3-27b-it-text-only-i1-GGUF`). No se especifica si el modelo base ha pasado por RLHF, DPO u otras fases de alineación posteriores al ajuste por instrucciones, aunque al ser una variante de Gemma 3 IT se asume que conserva el pipeline de alineación de Google. Tampoco se documentan innovaciones técnicas específicas de esta variante más allá de la eliminación de la modalidad visual.

## Capacidades

- Generación de texto conversacional en inglés con ajuste por instrucciones.
- Razonamiento de propósito general y respuesta a preguntas.
- Generación de código y matemáticas (heredado de Gemma 3 IT, aunque no verificado con benchmarks en esta ficha).
- Capacidades multilingües limitadas: el repositorio declara únicamente `en`, aunque el modelo original de Gemma 3 soporta más idiomas; no se confirma el alcance real en esta variante.
- Al ser una variante text-only, no procesa imágenes, audio ni vídeo.
- Soporte de tool calling / function calling: no confirmado en la información disponible para esta variante.
- Soporte de agentes y razonamiento multi-paso: no confirmado explícitamente para esta variante.
- Compatible con endpoints (tag `endpoints_compatible`) y con el ecosistema llama.cpp/Ollama vía GGUF.

## Casos de uso

- Despliegue local en estaciones de trabajo con GPU de consumo: con Q4_K_M (16,6 GB) o Q5_K_M (19,4 GB) el modelo cabe en GPUs de 24 GB como la RTX 4090, permitiendo asistentes conversacionales privados sin depender de la nube.
- Sustitución de APIs propietarias en pipelines internos de generación de texto: al ser GGUF, se integra en llama.cpp o servidores compatibles (Ollama, llama-cpp-python) y se puede servir mediante una API HTTP local para aplicaciones internas.
- Procesamiento por lotes de documentos en inglés: resumen, extracción y reescritura de textos largos en un contexto de 27B de parámetros, con calidad superior a modelos de 7B-13B.
- Generación de código asistida en entornos aislados: al ejecutarse localmente, es apto para entornos con requisitos de confidencialidad donde no se permite enviar código a servicios externos.
- Chatbot de soporte técnico en inglés: el ajuste IT y la capacidad conversacional permiten gestionar diálogos multi-turno, siempre que se valide el comportamiento en dominios específicos.
- Investigación y evaluación de cuantizaciones: el repositorio ofrece 11 variantes de cuantización, útil para estudiar el impacto de la compresión en la calidad (perplejidad) sobre un modelo de 27B.
- Fine-tuning ligero sobre el modelo base: aunque este repo es de inferencia, el modelo base `OpenPipe/gemma-3-27b-it-text-only` en safetensors puede servir como punto de partida para ajustes con LoRA/QLoRA.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del repo GGUF no incluye métricas de MMLU, HumanEval, GSM8K ni comparativas con otros modelos. El autor únicamente referencia un gráfico externo de perplejidad comparando tipos de cuantización (enlace `quantpplgraph.png`), que no aporta cifras concretas en esta ficha.

## Requisitos de hardware

- VRAM estimada según cuantización (solo pesos, sin overhead de contexto):
  - Q2_K: ~10,6 GB
  - Q3_K_M: ~13,5 GB
  - IQ4_XS: ~15,0 GB
  - Q4_K_M: ~16,6 GB
  - Q5_K_M: ~19,4 GB
  - Q6_K: ~22,3 GB
  - Q8_0: ~28,8 GB
- GPU recomendadas:
  - Q4_K_M / Q5_K_M: RTX 4090 (24 GB), RTX 3090 (24 GB), A6000 (48 GB) con margen amplio.
  - Q6_K: RTX 4090 al límite; A6000 o A100 40 GB con holgura.
  - Q8_0: A100 40 GB, A100 80 GB, H100, o configuraciones multi-GPU.
- ¿Cabe en GPU de consumo? Sí, en Q4_K_M y Q5_K_M en GPUs de 24 GB; en Q3_K_M o IQ4_XS en GPUs de 16 GB (RTX 4080, 4070 Ti Super) con contexto reducido.
- Opciones de despliegue: llama.cpp, Ollama, llama-cpp-python, servidores compatibles con GGUF; el tag `endpoints_compatible` sugiere compatibilidad con endpoints tipo Hugging Face. No se confirma soporte de vLLM o TGI para esta variante GGUF concreta (vLLM requiere pesos en safetensors para su ruta principal).
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato / licencia | Notas |
|---|---|---|---|---|
| mradermacher/gemma-3-27b-it-text-only-GGUF | ~27B | no disponible | GGUF / no disponible | Variante text-only cuantizada de Gemma 3 27B IT |
| google/gemma-3-27b-it | ~27B | no disponible en esta ficha | safetensors / Gemma Terms of Use | Modelo original multimodal (texto + visión) |
| OpenPipe/gemma-3-27b-it-text-only | ~27B | no disponible | safetensors / no disponible | Base del que deriva esta cuantización |
| mradermacher/gemma-3-27b-it-ultra-heretic-i1-GGUF | ~27B | no disponible | GGUF / no disponible | Otra variante cuantizada de Gemma 3 27B IT, con ajuste "heretic" |

No se dispone de datos de rendimiento comparativos entre estas variantes en la información proporcionada.

## Limitaciones y advertencias

- Licencia no declarada en el repositorio: al derivar de Gemma 3, es probable que apliquen los Gemma Terms of Use, pero debe verificarse antes de cualquier uso comercial.
- Idiomas: el repositorio declara únicamente inglés; el rendimiento en castellano no está validado y puede degradarse respecto al modelo original.
- Alucinaciones: como todo LLM de 27B, puede generar contenido factualmente incorrecto, especialmente en dominios especializados.
- Sesgos: no se documentan evaluaciones de sesgo para esta variante; hereda los sesgos del modelo base de Google.
- Contexto: la longitud de contexto no se especifica en la información disponible; conviene consultar la model card del modelo base antes de usarlo en tareas de contexto largo.
- Sin benchmarks propios: no hay métricas publicadas que permitan estimar la degradación por cuantización más allá del gráfico de perplejidad referenciado.
- Repositorio de bajo uso (54 descargas, 0 likes): menor validación comunitaria que otras cuantizaciones, lo que aumenta el riesgo de incidencias no documentadas.
- Formato GGUF: no apto para entrenamiento directo; para fine-tuning hay que partir del modelo base en safetensors.
- Variante text-only: no procesa imágenes aunque el modelo original sí lo haga.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/gemma-3-27b-it-text-only-GGUF
- Cuantizaciones imatrix/weighted: https://huggingface.co/mradermacher/gemma-3-27b-it-text-only-i1-GGUF
- Modelo base: https://huggingface.co/OpenPipe/gemma-3-27b-it-text-only
- Modelo original de Google: https://huggingface.co/google/gemma-3-27b-it
- Página de resumen del autor: https://hf.tst.eu/model#gemma-3-27b-it-text-only-GGUF
- Guía de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Gráfico de perplejidad por cuantización: https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre cuantizaciones: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Peticiones de cuantización: https://huggingface.co/mradermacher/model_requests
- Variante relacionada: https://huggingface.co/mradermacher/gemma-3-27b-it-ultra-heretic-i1-GGUF
