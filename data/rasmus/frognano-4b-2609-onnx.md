# RASMUS/FrogNano-4B-2609-ONNX

## Resumen

FrogNano-4B-2609-ONNX es una exportación a ONNX del checkpoint `microsoft/FrogNano-4B-2609`, publicada por el usuario RASMUS para su uso con Transformers.js 4.3.0 sobre WebGPU en el navegador. No se trata de un lanzamiento oficial de Microsoft: los pesos y el comportamiento proceden del modelo original, y el repo se limita a empaquetar una cuantización int4 (q4f16) del mismo. Es un modelo solo de texto: la exportación excluye los componentes de visión del checkpoint de origen.

El modelo base, FrogNano, es un agente de codificación de 4B parámetros desarrollado por Microsoft Research y post-entrenado exclusivamente mediante aprendizaje por refuerzo sobre en torno a 1.500 entornos de ingeniería de software (SWE) con tareas sintéticas. Su rasgo distintivo es un pipeline de síntesis de tareas en línea calibrado al "frontera de aprendibilidad" del propio modelo, sin destilación desde un modelo mayor. Deriva de `Qwen/Qwen3.5-4B` y emplea una arquitectura híbrida de atención (capas de atención lineal combinadas con capas GQA).

La relevancia de esta ficha concreta es de despliegue: permite ejecutar un agente de código de 4B íntegramente en el navegador vía WebGPU, con un peso total de aproximadamente 2,43 GB repartido en dos chunks para sortear el límite de asignación de `ArrayBuffer` de Chrome (unos 2,145 GB). El autor advierte de que aún no se han medido velocidad ni calidad en una GPU real en navegador.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer híbrido `qwen3_5_text`: 24 capas de atención lineal + 8 capas GQA (32 capas en total) |
| Parámetros totales | 4B (según el nombre del modelo y el informe técnico del base) |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | int4 simétrica, block size 32, `accuracy_level` 4, con activaciones fp16 (q4f16); las cachés rotatorias se mantienen en fp32 |
| Idiomas soportados | No disponible (la model card no los declara y los tags no incluyen etiquetas de idioma) |
| Licencia | MIT según el metadato del repo fuente; la tabla de la model card original indica Apache License 2.0 — consultar el repositorio fuente |
| Formato de pesos | ONNX (`model_q4f16.onnx` + dos ficheros `_data`), para Transformers.js |
| Tamaño del repo | 2,4 GB |
| Librería | transformers.js 4.3.0 |
| Modelo base | microsoft/FrogNano-4B-2609 (revisión `b90468c1`) |

## Arquitectura y entrenamiento

El export preserva la arquitectura del checkpoint original: una pila híbrida de 32 capas en la que 24 son de atención lineal y 8 son capas GQA, con 249 nodos `MatMulNBits` en el grafo y sin nodos `Scan` ni `Loop`. El modelo usa embeddings atados (tied embeddings). La conversión se realizó con `onnxruntime-genai` 0.15.2 (`-p int4 -e webgpu`), con `exclude_embeds=false` y `prune_lm_head=true`. Como los embeddings están atados, el builder cuantizaba todo nodo `Gather`, incluidas las cachés cos/sin rotatorias; los seis nodos `Gather` de caché se excluyeron vía `nodes_to_exclude` para mantenerlos en fp32.

La adaptación a Transformers.js 4.3.0 incluyó cuatro cambios: eliminación de la entrada `position_ids` (el grafo deriva las posiciones de `attention_mask`, porque la librería las rellenaba con un helper de Qwen2-VL que falla sin configuración de visión), renombrado de los tensores de estado híbrido a `past_conv.N`, `past_recurrent.N`, `present_conv.N` y `present_recurrent.N`, traslado del `text_config` anidado al nivel superior de `config.json`, y adición de `generation_config.json` con los tokens de parada `<|im_end|>` y `<|endoftext|>`.

En cuanto al entrenamiento del modelo base, FrogNano se post-entrena únicamente con RL sobre aproximadamente 1.500 entornos SWE y tareas sintéticas generadas en línea, calibradas al límite de capacidad del modelo. No hubo destilación desde un modelo mayor. El informe técnico y el repositorio `microsoft/FrogNano` describen el harness de evaluación ("Leaf"), que ejecuta agentes en sandboxes de Kubernetes aislados con endpoints compatibles con OpenAI y cinco herramientas: Read, Write, Edit, Glob y Bash.

## Capacidades

- Generación de texto conversacional (pipeline `text-generation`, tags `conversational`).
- Agente de codificación para tareas de ingeniería de software: el modelo base está entrenado para resolver tareas SWE con un bucle de herramientas.
- Uso de herramientas (tool calling) heredado del modelo base: el harness Leaf define cinco herramientas (Read, Write, Edit, Glob, Bash). El export conserva la plantilla de chat del modelo fuente sin cambios.
- Razonamiento multi-paso orientado a agentes: el entrenamiento con RL sobre entornos SWE implica trayectorias de varias llamadas a herramientas.
- Generación y edición de código (tags `code`, `agent`).
- Capacidad multilingüe: no disponible (no declarada en la información proporcionada).
- Visión: no soportada. La exportación excluye explícitamente los componentes de visión del checkpoint original.
- Modo "thinking" explícito: no disponible en la información proporcionada.

## Casos de uso

- Agente de código en el navegador: ejecutar un bucle de agente con las cinco herramientas del harness Leaf directamente en una aplicación web, sin backend de inferencia, aprovechando la ejecución WebGPU con `dtype: "q4f16"` y `device: "webgpu"`. Adecuado porque el peso total (~2,43 GB) es manejable en memoria de GPU de consumo.
- Demos y playgrounds sin servidor: publicar una demo de agente SWE en una página estática de Hugging Face Spaces o similar, donde el coste de infraestructura se traslada al cliente. El modelo es solo de texto, lo que simplifica el empaquetado.
- Asistencia a la reparación de bugs en pipelines de CI/CD: integrar el modelo como paso de generación de parches contra un endpoint compatible con OpenAI, con el harness ejecutando los tests en un sandbox aislado. El entrenamiento del base sobre entornos SWE con tests hace que el formato de tarea le sea familiar.
- Edición de código en herramientas de desarrollo web: extensiones de navegador o IDE en web que necesiten reescritura de ficheros, búsqueda por patrones (Glob) y ejecución de comandos, apoyándose en la plantilla de chat del modelo fuente.
- Evaluación reproducible de agentes SWE en local: usar el export como política de referencia dentro del harness Leaf sobre Kubernetes, comparando trayectorias sin depender de APIs externas.
- Investigación sobre RL sin destilación: reproducir o extender experimentos de síntesis de tareas en línea sobre un modelo pequeño, dado que el informe técnico del base documenta el pipeline y el modelo es abierto.
- Prototipado en entornos con recursos limitados: estaciones de trabajo con una única GPU de consumo o portátiles con iGPU compatible con WebGPU, donde no cabe un agente de 30B+.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la model card del export ONNX. Las únicas comprobaciones reportadas por el autor son de corrección del grafo, no de calidad:

| Comprobación | Resultado |
|---|---|
| Perfil de operadores frente a un export Qwen3.5-4B WebGPU de referencia | Idéntico: 24 capas de atención lineal, 8 capas GQA, 249 `MatMulNBits`, sin `Scan` ni `Loop` |
| Cache check con prompt de 400 tokens (decodificación de un token con caché frente a prefill limpio) | Divergencia KL 0,00041; solapamiento top-5 de 5/5 |
| Controles negativos (posiciones incorrectas, posiciones reiniciadas a 0, sin caché) | KL ≥ 1,68 |

En cuanto al modelo base, el titular del análisis publicado en explainx.ai atribuye a FrogNano un 61,5% en SWE-bench. Esta cifra procede de dicho artículo y del informe técnico del base, no de la model card del export, y no se ha podido desglosar con los datos disponibles; se reproduce aquí como referencia no verificada. No hay datos de MMLU, HumanEval ni GSM8K en la información proporcionada.

| Benchmark | FrogNano-4B-2609 | Fuente y estado |
|---|---|---|
| SWE-bench | 61,5% | Titular del blog de explainx.ai, atribuido al informe técnico; no verificado en esta ficha |
| MMLU / HumanEval / GSM8K | No disponible | No presentes en la información proporcionada |
| Velocidad y calidad en GPU real en navegador | No medidas | La model card indica que se añadirán tras las pruebas |

## Requisitos de hardware

- Peso en disco: 2,4 GB (0,6 MB de grafo + 1.990.742.016 B + 444.579.840 B de pesos, aproximadamente 2,43 GB en bruto).
- VRAM estimada para inferencia: en torno a 2,5-3 GB solo para pesos en q4f16. La estimación para caché y activaciones no está publicada; al usar atención lineal en 24 de las 32 capas, solo 8 capas GQA mantienen caché KV clásica, lo que reduce el crecimiento con la longitud de contexto.
- Restricción de navegador: Chrome no puede asignar un único `ArrayBuffer` superior a aproximadamente 2,145 GB, motivo por el que los pesos se dividen en dos chunks de menos de 2.000.000.000 bytes cada uno.
- Requisito de GPU: el dispositivo debe soportar la extensión `shader-f16` de WebGPU.
- GPU de consumo: el tamaño permite ejecución en GPU de consumo, aunque la información proporcionada no enumera modelos concretos compatibles ni mínimos de VRAM. No se especifican recomendaciones para A100, H100 o RTX 4090.
- Opciones de despliegue documentadas: Transformers.js 4.3.0 con `device: "webgpu"` y `dtype: "q4f16"`; el grafo se generó con `onnxruntime-genai` 0.15.2 y las comprobaciones se ejecutaron en CPU con ONNX Runtime. No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles. El autor indica explícitamente que la velocidad no se ha medido todavía en una GPU real en navegador.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato / despliegue | Licencia | Notas |
|---|---|---|---|---|---|
| RASMUS/FrogNano-4B-2609-ONNX | 4B | No disponible | ONNX q4f16, transformers.js + WebGPU | MIT según metadato del fuente; Apache 2.0 según la model card original | Solo texto; export de terceros, no oficial |
| microsoft/FrogNano-4B-2609 | 4B | No disponible | Checkpoint original (incluye componentes de visión) | MIT / Apache 2.0 según fuente | Modelo de referencia; entraña el entrenamiento RL descrito en el informe |
| Qwen/Qwen3.5-4B | 4B | No disponible | No disponible | No disponible | Modelo del que deriva FrogNano; sin post-entrenamiento específico para SWE |
| Otros agentes de código de tamaño similar | No disponible | No disponible | No disponible | No disponible | No se dispone de datos comparables en la información proporcionada |

## Limitaciones y advertencias

- Export de terceros: no es un lanzamiento oficial de Microsoft. Los pesos y el comportamiento provienen del modelo original, pero el empaquetado ONNX y sus adaptaciones son responsabilidad del autor del repo.
- Ambigüedad de licencia: el metadato del repositorio fuente declara MIT, mientras que la tabla de la model card original indica Apache License 2.0. Deben aplicarse los términos y avisos de copyright del repositorio fuente y del modelo upstream Qwen/Qwen3.5-4B.
- Sin capacidades de visión: la exportación excluye deliberadamente los componentes visuales del checkpoint original. Cualquier caso de uso multimodal queda fuera.
- Rendimiento no medido: el autor declara que no se han medido ni la velocidad ni la calidad en una GPU real en navegador. Las únicas validaciones son estructurales (perfil de operadores) y numéricas (divergencia KL de la caché).
- Restricción de WebGPU: requiere soporte de `shader-f16`. Dispositivos o navegadores sin esa extensión no podrán ejecutar el modelo.
- Idiomas soportados no declarados: no hay información sobre cobertura multilingüe ni sobre calidad fuera del inglés.
- Riesgo de alucinación: no cuantificado en la información disponible. Como agente de código que puede invocar herramientas de escritura y ejecución (Write, Edit, Bash en el harness Leaf), una alucinación puede traducirse en modificaciones de ficheros o comandos incorrectos; se recomienda ejecución en sandbox.
- Sesgos: no documentados en la información proporcionada.
- Cifra de SWE-bench no verificada: el 61,5% procede del titular de un blog, no de la model card del export, y no se ha podido cruzar con la tabla de resultados del informe técnico con los datos disponibles.
- Corpus de entrenamiento limitado: el base se post-entrena sobre en torno a 1.500 entornos SWE. No se especifica la composición del dataset ni si hubo RLHF o DPO adicionales.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/RASMUS/FrogNano-4B-2609-ONNX
- Modelo base: https://huggingface.co/microsoft/FrogNano-4B-2609
- Modelo upstream: https://huggingface.co/Qwen/Qwen3.5-4B
- Informe técnico (arXiv HTML): https://arxiv.org/html/2609.07925v1
- Informe técnico (arXiv abs): https://arxiv.org/abs/2609.07925
- Página del paper en Hugging Face: https://huggingface.co/papers/2609.07925
- Repositorio del harness Leaf: https://github.com/microsoft/FrogNano
- Scripts de conversión ONNX: https://github.com/R4ZZ3/webgpu-platform-international/tree/docs/frognano-backlog/ONNX_CONVERSION/tools
- Librería Transformers.js: https://github.com/huggingface/transformers.js
- Análisis en explainx.ai: https://www.explainx.ai/blog/frognano-microsoft-4b-coding-agent-no-distillation-2026
