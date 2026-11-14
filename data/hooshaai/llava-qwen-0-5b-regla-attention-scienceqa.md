# Hooshaai/llava-qwen-0.5b-regla-attention-scienceqa

## Resumen

llava-qwen-0.5b-regla-attention-scienceqa es un checkpoint multimodal de tipo vision-lenguaje publicado por el autor Hooshaai dentro del ecosistema NeuralOps. Se construye sobre el modelo base llava-hf/llava-interleave-qwen-0.5b-hf, un LLaVA que combina una torre de vision SigLIP congelada, un proyector MLP de dos capas y un decodificador Qwen2 de 24 capas y 0,5 mil millones de parametros. El modelo aplica una cirugia de atencion ("attention surgery") sustituyendo el mecanismo de atencion cuadratica de 18 de las 24 capas por el operador ReGLAAttention, una variante de atencion lineal con compuertas (Refined Gated Linear Attention) de la familia hibrida.

El objetivo del checkpoint es demostrar que es posible reducir drasticamente el peso del artefacto (de 1,66 GB a 402 MB, un 76,4 % menos) manteniendo un rendimiento razonable en razonamiento visual sobre ScienceQA, tras un proceso de destilacion de conocimiento desde el modelo profesor. Es relevante ahora porque ejemplifica una linea de trabajo activa: la sustitucion selectiva de capas de atencion por alternativas lineales eficientes en modelos multimodales pequenos, con artefactos modulares que solo guardan los pesos modificados.

La evaluacion declarada por el autor sobre el subconjunto STEM con imagenes de ScienceQA (validacion) arroja una precision del 38,75 % y una perplejidad de 3,20, partiendo de una linea base cero-shot de 32,50 % y 14,87 respectivamente. El modelo esta pensado para investigacion sobre eficiencia de atencion y destilacion, no como un asistente multimodal de produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LLaVA multimodal: torre de vision SigLIP congelada + proyector MLP de 2 capas + decodificador Qwen2 de 24 capas (D=1024, H=16, head_dim=64), con 18/24 capas sustituidas por ReGLAAttention (atencion lineal con compuertas, familia hibrida) |
| Parametros totales | 0,5 mil millones (modelo base Qwen2 de 0,5B; el artefacto guarda solo los pesos de atencion modificados) |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (los pesos se distribuyen en FP16 safetensors; no se documentan variantes GGUF, AWQ ni GPTQ) |
| Idiomas soportados | ingles (en) |
| Licencia | MIT |
| Formato de pesos | safetensors (attention_weights.safetensors, FP16, formato `attention_only_fp16`, 840 tensores) |

## Arquitectura y entrenamiento

El modelo parte de la arquitectura LLaVA-Interleave con Qwen2 de 0,5B como decodificador. La torre de vision SigLIP (27 capas) y el proyector multimodal permanecen congelados y no forman parte del artefacto guardado. La intervencion quirurgica afecta a 18 de las 24 capas del decodificador, segun el esquema `hybrid_3_1`, sustituyendo la atencion cuadratica por ReGLAAttention (Refined Gated Linear Attention), un operador de atencion lineal con compuertas. Se conservan seis capas de atencion cuadratica como "anclas" en los indices [3, 7, 11, 15, 19, 23], ademas de los MLP, embeddings y capas de normalizacion entrenadas. El artefacto serializado contiene unicamente los pesos de atencion modificados y las layernorms del decodificador.

El entrenamiento consistio en un proceso de destilacion de conocimiento desde el modelo profesor (el LLaVA-Qwen-0.5B original) hacia el modelo quirurgico, en dos etapas: una primera de 102 pasos y una segunda de 230 pasos, con un total de 332 pasos de optimizacion. Se ejecuto en una unica NVIDIA GeForce RTX 3090 (24 GB) con un pico de VRAM de 6823 MB y una duracion total de 120,2 segundos. El dataset de evaluacion y ajuste es derek-thomas/ScienceQA. No se documentan en la informacion disponible el numero de tokens de entrenamiento, la composicion completa del dataset ni el uso de RLHF o DPO.

## Capacidades

- Generacion de texto condicionada por imagen (image-text-to-text) para preguntas y respuestas visuales.
- Razonamiento visual basico sobre diagramas y figuras de contenido STEM (ciencia, tecnologia, ingenieria y matematicas).
- Respuesta a preguntas de opcion multiple con formato de letra de opcion, segun el ejemplo de la model card.
- Conversacion multi-turno segun la plantilla de chat incluida (`chat_template.json`).
- Capacidad multilingue limitada al ingles.
- No se documenta soporte de tool calling, function calling, agentes, modo thinking, audio ni otras capacidades especiales en la informacion disponible.

## Casos de uso

- Investigacion sobre eficiencia de atencion: el checkpoint sirve como referencia reproducible para estudiar el impacto de sustituir atencion cuadratica por ReGLAAttention en un VLM pequeno, comparando precision y perplejidad antes y despues de la destilacion.
- Experimentos de destilacion de conocimiento: permite analizar como un modelo profesor de 0,5B transfiere capacidad a un alumno con atencion lineal en solo 332 pasos y 120 segundos en una RTX 3090, util para calibrar presupuestos de entrenamiento.
- Evaluacion academica en ScienceQA: adecuado para reproducir la metrica declarada (38,75 % de precision) sobre el subconjunto STEM con imagenes y comparar variantes de cirugia de atencion.
- Prototipado de artefactos modulares: el formato `attention_only_fp16` con manifiesto quirurgico sirve para probar flujos de carga selectiva de pesos y auditoria de checkpoints en pipelines de investigacion.
- Docencia y formacion: util como ejemplo didactico de arquitectura hibrida, atencion lineal con compuertas y evaluacion multimodal en un entorno de recursos limitados (una sola GPU consumer).
- Pruebas de integracion del ecosistema NeuralOps: permite validar la API `load_surgeried_model` y el esquema `neuralops.surgery/v2` en entornos de desarrollo antes de escalar a modelos mayores.

## Benchmarks y rendimiento

Resultados declarados por el autor sobre ScienceQA (subconjunto STEM con imagenes, split de validacion). No verificados de forma independiente.

| Metrica | Profesor (baseline) | Cero-shot previo a KD | Final tras KD | Delta |
|---|---:|---:|---:|---:|
| Precision (%) | 63,75 | 32,50 | 38,75 | +6,25 |
| Perplejidad | 2,45 | 14,87 | 3,20 | -11,67 |

No se han publicado resultados de otros benchmarks (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el autor reporta un pico de 6823 MB durante el entrenamiento en una RTX 3090; la inferencia en FP16 deberia situarse por debajo de esa cifra, aunque no se documenta una medicion especifica.
- GPU recomendadas: NVIDIA GeForce RTX 3090 (24 GB) segun la telemetria del autor; cualquier GPU con al menos 8 GB de VRAM deberia ser suficiente para el modelo base de 0,5B en FP16.
- Cabe en GPU consumer: si, el modelo base de 0,5B es apto para GPUs consumer; la telemetria confirma ejecucion en RTX 3090.
- Opciones de despliegue: la model card documenta la API `load_surgeried_model` del paquete `neuralops.hub`; no se mencionan vLLM, llama.cpp, Ollama ni TGI en la informacion disponible.
- Latencia y throughput: no disponibles. El artefacto pesa 402,31 MB (421.857.796 bytes) frente a los 1,66 GB del base completo, un 76,4 % menos (4,23 veces mas pequeno).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento ScienceQA | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| llava-qwen-0.5b-regla-attention-scienceqa | 0,5B (18/24 capas con ReGLA) | no disponible | 38,75 % precision / 3,20 PPL (validacion, declarado) | MIT | Hugging Face (21 descargas) |
| llava-hf/llava-interleave-qwen-0.5b-hf (profesor) | 0,5B | no disponible | 63,75 % precision / 2,45 PPL (declarado por el autor) | no disponible en esta ficha | Hugging Face |
| LLaVA-Qwen-0.5B sin destilar (cero-shot) | 0,5B | no disponible | 32,50 % precision / 14,87 PPL (declarado por el autor) | no disponible en esta ficha | variante interna del experimento |

No se dispone de datos de otros modelos comparables de la misma categoria en la informacion proporcionada.

## Limitaciones y advertencias

- Precision reducida: el 38,75 % en ScienceQA esta muy por debajo del 63,75 % del profesor, por lo que no es adecuado para tareas de razonamiento visual que requieran alta exactitud.
- Artefacto parcial: el repositorio contiene solo los pesos de atencion modificados y las layernorms; requiere el modelo base y la API de NeuralOps para cargarse, no es un checkpoint autonomo en formato transformers convencional.
- Idiomas: solo ingles; no se documenta soporte de castellano ni de otros idiomas.
- Contexto: no se especifica la longitud de contexto soportada, lo que impide garantizar conversaciones largas o documentos extensos.
- Riesgo de alucinacion: inherente a los modelos de 0,5B y agravado por la destilacion parcial; las respuestas en dominios STEM fuera de la distribucion de ScienceQA pueden ser incorrectas.
- Sesgos: no se documenta ninguna evaluacion de sesgos; el dataset ScienceQA tiene una cobertura tematica y cultural limitada.
- Licencia MIT: permite uso comercial, pero el modelo base y la torre SigLIP pueden tener condiciones propias que conviene revisar antes de desplegar en produccion.
- Madurez: 21 descargas y 0 likes en el momento de la consulta; se trata de un artefacto de investigacion sin validacion independiente de sus metricas.
- Sin benchmarks adicionales: no hay datos de MMLU, HumanEval ni otras tareas que permitan evaluar su comportamiento general.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Hooshaai/llava-qwen-0.5b-regla-attention-scienceqa
- Modelo base: https://huggingface.co/llava-hf/llava-interleave-qwen-0.5b-hf
- Implementacion de ReGLAAttention en NeuralOps: https://github.com/tahamajs/NeuralOps/blob/main/neuralops/layers/hybrid/regla_attention.py
- Licencia NeuralOps (MIT): https://github.com/tahamajs/NeuralOps/blob/main/LICENSE
- Dataset ScienceQA: https://huggingface.co/datasets/derek-thomas/ScienceQA
