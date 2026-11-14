# Hooshaai/llava-qwen-0.5b-adaptive-span-attention-scienceqa

## Resumen

llava-qwen-0.5b-adaptive-span-attention-scienceqa es un modelo vision-lenguaje (VLM) derivado de `llava-hf/llava-interleave-qwen-0.5b-hf`, publicado por el usuario Hooshaai en Hugging Face. El modelo parte de la arquitectura LLaVA interleaved, compuesta por un codificador visual SigLIP congelado, un proyector MLP multimodal de dos capas y un decodificador de lenguaje Qwen2 de 24 capas con dimensión oculta D=1024 y 16 cabezas de atención. Sobre esa base se ha realizado una cirugía de atención: 18 de las 24 capas del decodificador han sido sustituidas por el operador `adaptive_span_attention` bajo el patrón híbrido `hybrid_3_1`, conservando seis capas cuadráticas como anclas.

El modelo ha sido destilado sobre las preguntas con imagen del conjunto ScienceQA (`derek-thomas/ScienceQA`), una tarea de razonamiento visual multimodal de carácter científico. El interés del artefacto es doble: por un lado, explora la viabilidad de mecanismos de atención subcuadrática en modelos multimodales pequeños; por otro, se distribuye como un paquete de pesos de atención (459,16 MB en FP16) que se cargan sobre el modelo base congelado, lo que lo convierte en un experimento reproducible de sustitución de atención más que en un modelo autónomo listo para producción.

Con 0,5 mil millones de parámetros en el decodificador, licencia MIT e idioma declarado únicamente inglés, el modelo está orientado a investigación y prototipado. Su relevancia actual radica en la creciente línea de trabajo sobre eficiencia atencional en VLMs y en la publicación abierta de los pesos resultantes de la cirugía.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LLaVA interleaved: SigLIP (vision tower congelado) + proyector MLP multimodal + decodificador Qwen2 con atencion hibrida (18 capas `adaptive_span_attention` + 6 capas cuadraticas ancla) |
| Parametros totales | no disponible (decodificador de 24 capas, D=1024, H=16, d_h=64; tamano de repo 1,0 GB) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos de atencion publicados en FP16) |
| Idiomas soportados | en (ingles) |
| Licencia | MIT |
| Formato de pesos | safetensors (`attention_weights.safetensors`, 459,16 MB, FP16) + configs de processor y tokenizer |

## Arquitectura y entrenamiento

El modelo sigue el esquema `LlavaForConditionalGeneration`: los parches visuales extraidos por el codificador SigLIP se intercalan con los tokens de texto dentro de las capas del modelo de lenguaje. Tanto el `vision_tower` como el `multi_modal_projector` permanecen completamente congelados, de modo que el experimento aisla el efecto del mecanismo de atención subcuadrática en el enrutamiento cross-modal denso entre visión y texto. La cirugía `hybrid_3_1` sustituye 18 de las 24 capas de atención del decodificador por `AdaptiveSpanAttention` y mantiene seis capas cuadráticas como anclas en las posiciones `[3, 7, 11, 15, 19, 23]`.

El entrenamiento consistio en una destilacion de conocimiento en dos etapas sobre preguntas con imagen de ScienceQA, con un total de 216 pasos de optimizacion (82 en la etapa 1 y 134 en la etapa 2). La ejecucion duro 120,2 segundos con un pico de VRAM de 17.993 MB sobre una NVIDIA RTX 3090 de 24 GB, con marca temporal del 11 de noviembre de 2026. No se especifican en la informacion disponible el numero de tokens de entrenamiento, la composicion completa del dataset ni si se aplicaron tecnicas de RLHF o DPO.

## Capacidades

- Generacion de texto condicionada por imagen (image-text-to-text) en tareas de pregunta-respuesta visual.
- Razonamiento visual multimodal sobre contenido cientifico: el modelo esta ajustado especificamente sobre ScienceQA, que cubre materias de ciencias naturales y sociales.
- Respuesta a preguntas de opcion multiple con imagen asociada, formato dominante en el conjunto de evaluacion.
- Conversacion multimodal de un solo turno segun el pipeline declarado (`conversational`); no se documenta soporte multi-turno explicito.
- Capacidad de tool calling / function calling: no disponible.
- Soporte de agentes o razonamiento multi-paso: no disponible.
- Capacidades multilingues: limitadas al ingles declarado.
- Modo thinking, vision adicional, audio u otras modalidades: no disponible.

## Casos de uso

- Investigacion sobre atencion eficiente en VLMs: el modelo sirve como banco de pruebas reproducible para medir el impacto de sustituir atencion cuadratica por `adaptive_span_attention` en un decodificador pequeno, comparando directamente contra el profesor `llava-interleave-qwen-0.5b`.
- Prototipado de tutoria educativa en ciencias: dado su ajuste sobre ScienceQA, puede emplearse para experimentar con sistemas de respuesta a preguntas cientificas con imagen (diagramas, ilustraciones de experimentos) en ingles y en entornos de bajo coste computacional.
- Evaluacion de tecnicas de destilacion multimodal: los pesos publicados y el `training_metrics.json` permiten reproducir y auditar el proceso de destilacion en dos etapas sobre un subconjunto de ScienceQA.
- Despliegue en hardware de gama consumer para demos: con un decodificador de 0,5B y pesos de atencion de 459 MB, el modelo cabe en GPUs de consumo y permite demos interactivas de VQA sin infraestructura dedicada.
- Generacion de datasets sinteticos de QA visual cientifico: el modelo puede emplearse para pre-anotar pares imagen-pregunta-respuesta en ingles que luego se revisen manualmente, aprovechando su especializacion en el dominio.
- Comparativa de arquitecturas de atencion en pipelines de investigacion: integrable en estudios que comparen `adaptive_span_attention` con otros operadores del registro de NeuralOps sobre la misma base LLaVA-Qwen.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (no verificados de forma independiente), sobre el split de validacion de `derek-thomas/ScienceQA` (subconjunto con imagen):

| Metrica | Profesor (`llava-interleave-qwen-0.5b`) | Zero-shot con `adaptive_span_attention` | Destilado con `adaptive_span_attention` | Delta |
|---|---:|---:|---:|---:|
| Precision visual en ScienceQA (%) | 63,75 | 38,75 | 61,88 | +23,13 |
| Perplejidad de respuesta condicionada por imagen | 2,45 | 3,62 | 2,27 | -1,35 |

Telemetria del entrenamiento: 216 pasos de optimizacion (82 en etapa 1, 134 en etapa 2), 120,2 segundos de duracion, pico de 17.993 MB de VRAM en una RTX 3090 de 24 GB.

## Requisitos de hardware

- VRAM estimada para inferencia: no se publica una cifra de inferencia; como referencia, el entrenamiento con destilacion en dos etapas alcanzo un pico de 17.993 MB en FP16 sobre una RTX 3090. La inferencia en FP16 deberia requerir bastante menos, aunque la cifra exacta no esta disponible.
- GPU recomendadas: cualquier GPU con al menos 24 GB para reproducir el entrenamiento (RTX 3090, A100, H100). Para inferencia, GPUs de consumo con suficiente VRAM para el modelo base de 0,5B en FP16.
- Cabe en GPU consumer: si, dado el tamano del decodificador (0,5B) y los pesos de atencion de 459 MB; se requieren ademas los pesos del modelo base `llava-hf/llava-interleave-qwen-0.5b-hf`.
- Opciones de despliegue: la libreria declarada es `neuralops`, con carga via `neuralops.hub.load_surgeried_model` o mediante `transformers` (`LlavaForConditionalGeneration`) aplicando la cirugia con `apply_qwen_attention_surgery`. No se documenta soporte para vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | ScienceQA VQA (val) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| llava-qwen-0.5b-adaptive-span-attention-scienceqa | 0,5B (decodificador) | no disponible | 61,88% (declarado) | MIT | Hugging Face |
| llava-hf/llava-interleave-qwen-0.5b-hf (profesor) | 0,5B (decodificador) | no disponible | 63,75% (declarado por el autor) | no disponible en la informacion | Hugging Face |
| Otros VLMs de ~0,5B comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

La unica comparacion documentada es contra el modelo base del que deriva. No se dispone de datos de benchmarks de terceros ni de alternativas equivalentes en la informacion proporcionada.

## Limitaciones y advertencias

- Especializacion estrecha: el ajuste se limita a preguntas con imagen de ScienceQA; el rendimiento fuera de ese dominio no esta documentado y previsiblemente sera inferior.
- Idioma: solo se declara ingles; no hay soporte multilingue documentado.
- Pesos parciales: el repositorio contiene unicamente los pesos de atencion y layernorm trasplantados (459,16 MB); es imprescindible descargar y cargar el modelo base `llava-hf/llava-interleave-qwen-0.5b-hf` para su uso.
- Dependencia de codigo externo: la carga requiere la libreria `neuralops` o el script `scripts/benchmarks/qwen_zoo_train_mix.py` del repositorio NeuralOps, lo que anade una dependencia de mantenimiento no estandar frente a `transformers`.
- Resultados no verificados: las metricas de la model-index estan marcadas como `verified: false`; no han sido contrastadas de forma independiente.
- Riesgo de alucinacion: inherente a los modelos generativos de este tamano, especialmente en preguntas cientificas fuera de la distribucion de ScienceQA.
- Sesgos: no se documenta ninguna evaluacion de sesgos en la informacion disponible.
- Longitud de contexto: no declarada; no debe asumirse una ventana larga en produccion.
- Uso comercial: la licencia MIT lo permite, pero el modelo base y el codigo de NeuralOps pueden tener condiciones propias que conviene revisar antes de un despliegue comercial.
- Madurez: con 55 descargas y 0 likes en el momento de la consulta, es un artefacto de investigacion reciente, sin comunidad de validacion consolidada.

## Enlaces

- Hugging Face: https://huggingface.co/Hooshaai/llava-qwen-0.5b-adaptive-span-attention-scienceqa
- Repositorio NeuralOps: https://github.com/tahamajs/NeuralOps
- Licencia NeuralOps: https://github.com/tahamajs/NeuralOps/blob/main/LICENSE
- Implementacion de `AdaptiveSpanAttention`: https://github.com/tahamajs/NeuralOps/blob/main/neuralops/layers/adaptive/adaptive_span_attention.py
- Modelo base: https://huggingface.co/llava-hf/llava-interleave-qwen-0.5b-hf
- Dataset ScienceQA: https://huggingface.co/datasets/derek-thomas/ScienceQA
