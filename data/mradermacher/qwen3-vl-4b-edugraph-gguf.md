# mradermacher/Qwen3-VL-4B-EduGraph-GGUF

## Resumen

Qwen3-VL-4B-EduGraph-GGUF es la distribucion en formato GGUF del modelo Qwen3-VL-4B-EduGraph, un ajuste fino (LoRA + SFT) realizado por christian-bick sobre la base Qwen3-VL-4B de Alibaba. La cuantizacion la firma mradermacher, un publicador habitual de versiones GGUF de modelos open source. El modelo combina la arquitectura multimodal Qwen3-VL (vision-lenguaje) con un entrenamiento especifico orientado al dominio educativo, segun se desprende del sufijo "EduGraph" del nombre.

El interes practico de esta publicacion es que permite ejecutar un modelo vision-lenguaje de 4.022 millones de parametros en hardware de consumo mediante llama.cpp y derivados, con cuantizaciones que van de 1,8 GB (Q2_K) a 8,2 GB (f16). El repositorio incluye ademas el proyector multimodal (mmproj) en Q8_0 y f16, necesario para procesar imagenes.

Conviene senalar que la model card etiqueta explicitamente el modelo como "deprecated" y que la licencia es AGPL-3.0, lo que condiciona fuertemente su uso en productos comerciales. La informacion publicada por el autor es escasa: no hay detalles sobre el dataset de entrenamiento, benchmarks ni hiperparametros del ajuste.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (base Qwen3-VL-4B; vision-lenguaje) |
| Parametros totales | 4.022.468.096 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16; mmproj en Q8_0 y f16 |
| Idiomas soportados | en (segun model card) |
| Licencia | AGPL-3.0 |
| Formato de pesos | GGUF (safetensors en el modelo base original) |

## Arquitectura y entrenamiento

El modelo base es Qwen3-VL-4B, un transformer multimodal de la familia Qwen3-VL que procesa texto e imagenes. Sobre esa base, christian-bick aplico un ajuste fino supervisado (SFT) con LoRA, segun los tags del repositorio (`lora`, `sft`, `trl`). No se especifica en la informacion disponible el volumen de datos de entrenamiento, la composicion del dataset, si hubo RLHF/DPO posterior ni los hiperparametros del ajuste.

La cuantizacion la realiza mradermacher con su pipeline habitual (`convert_type: hf`, `quantize_version: 2`, `output_tensor_quantised: 1`). Se trata de cuantizaciones estaticas: el autor indica que no hay versiones con imatrix/weighted disponibles en el momento de la publicacion. El repositorio incluye el proyector multimodal separado (mmproj) en Q8_0 y f16, imprescindible para la inferencia con imagenes en llama.cpp.

## Capacidades

- Generacion de texto conversacional en ingles, con el formato de chat de la familia Qwen3.
- Procesamiento de imagenes (vision-lenguaje) gracias al proyector multimodal incluido en el repo.
- Razonamiento y respuesta a preguntas, heredado del modelo base Qwen3-VL-4B.
- Ajuste orientado al dominio educativo (EduGraph), aunque no se detalla en la model card que tipo de tareas cubre exactamente.
- Soporte de tool calling y function calling: no confirmado en la informacion disponible para este ajuste concreto.
- Capacidades de agente y razonamiento multi-paso: no confirmadas en la informacion disponible.
- Multilingue: la model card solo declara ingles (`en`).

## Casos de uso

- Prototipado local de asistentes vision-lenguaje: con la cuantizacion Q4_K_M (2,6 GB) y el mmproj Q8_0 (0,6 GB) se puede desplegar en un portatil con GPU de 6-8 GB de VRAM para experimentar con descripcion de imagenes y VQA.
- Investigacion educativa: el ajuste EduGraph sugiere un uso orientado a tareas de aprendizaje; util para evaluar como un SFT de dominio afecta al comportamiento de un VLM pequeno en preguntas sobre material didactico o diagramas.
- Evaluacion comparativa de cuantizaciones: el repositorio ofrece 12 variantes de cuantizacion del mismo modelo, lo que permite medir la degradacion de calidad (perplejidad, exactitud en VQA) segun el nivel de compresion.
- Despliegue en entornos con recursos limitados: la version Q2_K (1,8 GB) permite ejecutar el modelo en CPU o en GPU integradas, util para demos offline o entornos air-gapped.
- Extraccion de informacion de documentos escaneados en ingles: el modelo puede recibir una imagen y devolver texto estructurado, aunque sin garantias de precision por la falta de benchmarks publicados.
- Base para nuevos ajustes: al estar en GGUF y derivar de un LoRA sobre Qwen3-VL-4B, sirve como punto de partida para experimentos de fine-tuning en dominios especificos, siempre respetando la AGPL-3.0.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (solo pesos del modelo de lenguaje): Q2_K ~1,8 GB; Q4_K_M ~2,6 GB; Q8_0 ~4,4 GB; f16 ~8,2 GB. Hay que sumar el mmproj (0,6 GB en Q8_0, 0,9 GB en f16) si se procesan imagenes, mas el espacio para el contexto KV cache.
- GPU recomendadas: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4090 para las cuantizaciones altas con contexto largo; A100/H100 solo si se necesita mucho throughput o contexto extendido.
- Cabe en GPU de consumo: si, practicamente cualquier GPU con 6 GB o mas para Q4_K_M con mmproj; las versiones Q2_K y Q3_K pueden correr incluso en CPU.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio y cualquier runtime compatible con GGUF y proyector multimodal. vLLM y TGI no soportan GGUF de forma nativa para modelos multimodales en el momento de la publicacion.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Modalidad | Licencia | Formato |
|---|---|---|---|---|---|
| Qwen3-VL-4B-EduGraph-GGUF (este) | 4,02 B | no disponible | texto + imagen | AGPL-3.0 | GGUF |
| Qwen3-VL-4B (base) | ~4 B | no disponible | texto + imagen | no disponible en la informacion | safetensors |
| Qwen2.5-VL-3B | ~3 B | no disponible | texto + imagen | no disponible en la informacion | safetensors, GGUF (comunidad) |
| Llava-1.5-7B | ~7 B | no disponible | texto + imagen | no disponible en la informacion | safetensors, GGUF (comunidad) |

La comparativa se limita a la categoria de VLMs pequenos ejecutables en hardware de consumo. Los datos de contexto y benchmarks de los alternativas no se han verificado en la informacion disponible, por lo que se omiten para no inventar cifras.

## Limitaciones y advertencias

- El autor marca el modelo como `deprecated` en los tags: no se garantiza mantenimiento ni correccion de errores.
- Licencia AGPL-3.0: cualquier uso en red (SaaS, API publica) obliga a liberar el codigo fuente derivado. Es incompatible con muchos productos comerciales cerrados.
- Solo declara soporte de ingles; el rendimiento en castellano no esta verificado y probablemente sea deficiente.
- No hay benchmarks publicados: se desconoce la calidad real del ajuste EduGraph frente al Qwen3-VL-4B base.
- Riesgo de alucinacion inherente a los VLM de 4B, especialmente en tareas de OCR y descripcion detallada de imagenes.
- El ajuste LoRA+SFT puede haber degradado capacidades generales del modelo base (olvido catastrofico), algo habitual en fine-tunes de dominio sin datos de mezcla.
- Las cuantizaciones Q2_K y Q3_K_S degradan notablemente la calidad; para produccion se recomienda Q4_K_M o superior.
- No se detalla la composicion del dataset de entrenamiento, lo que impide evaluar sesgos especificos.
- El repo pesa 37,7 GB porque incluye todas las cuantizaciones; conviene descargar solo el archivo necesario.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/Qwen3-VL-4B-EduGraph-GGUF
- Modelo base del ajuste: https://huggingface.co/christian-bick/Qwen3-VL-4B-EduGraph
- Pagina de descargas del autor: https://hf.tst.eu/model#Qwen3-VL-4B-EduGraph-GGUF
- Solicitudes de cuantizacion: https://huggingface.co/mradermacher/model_requests
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Analisis de tipos de cuantizacion (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
