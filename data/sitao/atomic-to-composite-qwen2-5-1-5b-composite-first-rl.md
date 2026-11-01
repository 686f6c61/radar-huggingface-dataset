# sitao/atomic-to-composite-qwen2.5-1.5b-composite-first-rl

## Resumen

Este modelo es un fine-tuning de investigación de Qwen2.5-1.5B desarrollado por Sitao Cheng y colaboradores (universidades vinculadas al proyecto "From Atomic to Composite") para estudiar cómo la generalización composicional en razonamiento complementario se ve afectada por la receta de entrenamiento. Concretamente, es la variante "composite-first": primero se aplica SFT (supervised fine-tuning) sobre pares de preguntas y respuestas de la tarea compuesta (COMP), y después se aplica aprendizaje por refuerzo con GRPO sobre la misma tarea compuesta. Actúa como línea base de práctica común en el paper de referencia, frente a la receta "atomic-first" que entrena primero sobre habilidades atómicas.

El problema que aborda es la composición de habilidades: responder preguntas multi-hop que requieren combinar memoria de hechos y uso de contexto, evaluando si el modelo generaliza a niveles IID, de composición y zero-shot. Es relevante porque ofrece evidencia empírica sobre cuándo el RL habilita (o no) la generalización en tareas de razonamiento complementario, un tema central en la investigación actual sobre composicionalidad en LLMs.

Arquitecturalmente es un transformer denso de la familia Qwen2.5 con aproximadamente 1.770 millones de parámetros (1.777.088.000 según los safetensors), entrenado sobre biografías sintéticas. No es un asistente de propósito general, sino un artefacto de investigación reproducible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (familia Qwen2.5), causal LM |
| Parametros totales | 1.777.088.000 (~1,78 B) |
| Parametros activos | no disponible (no es MoE; modelo denso, activos = totales) |
| Longitud de contexto | no disponible (el base Qwen2.5-1.5B soporta 32.768 tokens, pero no consta en la model card) |
| Tipos de cuantizacion | no disponible (solo pesos en bf16/fp16 en safetensors) |
| Idiomas soportados | Ingles (entrenado en ingles; tarea en ingles) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (compatible con text-generation-inference y endpoints) |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen2.5-1.5B, un transformer decoder-only denso. La receta de entrenamiento tiene dos etapas: primero un SFT realizado con LLaMA-Factory sobre el checkpoint `sitao/atomic-to-composite-qwen2.5-1.5b-sft-composite`, entrenado con pares de QA de la tarea compuesta (COMP) del dataset sintético `sitao/From_atomic_to_composite`; después, una fase de aprendizaje por refuerzo con el algoritmo GRPO implementado en el framework verl, también sobre datos de la tarea compuesta. Esta receta "composite-first" (SFT_Comp → RL_Comp) es la línea base de práctica común contra la que el paper compara la receta "atomic-first" (SFT sobre habilidades atómicas de memoria y contexto, seguido de RL sobre la tarea compuesta).

Los datos de entrenamiento son biografías sintéticas del dataset `From_atomic_to_composite`, diseñadas para descomponer el razonamiento en habilidades atómicas (memoria de hechos y uso de contexto) y una tarea compuesta de QA multi-hop. No se menciona el numero de tokens de entrenamiento ni el uso de RLHF/DPO adicionales. La salida del modelo sigue el formato de entrenamiento: cadena de razonamiento que termina con `So, the answer is: <answer>`.

## Capacidades

- Respuesta a preguntas multi-hop sobre biografías sintéticas, combinando hechos memorizados y párrafos de contexto proporcionados en el prompt (formato `PARAGRAPH: ...`).
- Generación de cadenas de razonamiento explícitas antes de la respuesta final, con formato fijo `So, the answer is: <answer>`.
- Razonamiento complementario: integración de dos fuentes de información (memoria paramétrica y contexto) para responder.
- Rendimiento medido en tres niveles de generalización: IID (79,25 % de accuracy), composición (67,42 %) y zero-shot (33,12 %) sobre el test COMP de 4.468 elementos.
- No está orientado a capacidades generales: no hay soporte documentado de tool calling, agentes, visión, audio ni modo de pensamiento extendido.
- Pensado para inferencia determinista (greedy decoding, `do_sample=False`) con el formato de prompt de entrenamiento.

## Casos de uso

- Investigacion en generalizacion composicional: sirve como baseline "composite-first" reproducible para comparar recetas de entrenamiento (SFT/RL sobre tarea compuesta frente a habilidades atómicas) en estudios de composicionalidad.
- Estudio del efecto del RL (GRPO) sobre tareas de QA multi-hop: permite analizar cuánto mejora el refuerzo sobre un modelo SFT cuando el SFT ya vio la tarea compuesta.
- Evaluacion de memoria frente a uso de contexto: útil para experimentos que miden cómo un modelo combina hechos paramétricos con contexto externo en biografías sintéticas controladas.
- Reproduccion de resultados academicos: el paper (arXiv:2512.01970), el código en GitHub y el dataset en HuggingFace permiten replicar la Tabla 7 y la Figura 8 del artículo.
- Comparacion de frameworks de entrenamiento: ejemplo práctico de pipeline LLaMA-Factory (SFT) + verl (GRPO) sobre un modelo pequeño de 1,5B.
- Docencia y demos educativas: por su tamaño reducido (cabe en una sola GPU de consumo), es adecuado para mostrar en clase o en talleres cómo funciona un pipeline completo SFT → RL sobre una tarea acotada.

## Benchmarks y rendimiento

Resultados publicados en la model card (accuracy en % sobre el test COMP de 4.468 elementos, por nivel de generalización, extraídos del log de validación del entrenamiento según el paper):

| Benchmark | IID | Composition | Zero-shot |
|---|---:|---:|---:|
| Test COMP (4.468 items) | 79,25 | 67,42 | 33,12 |

No se han publicado resultados de benchmarks estandarizados (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. El paper reporta este modelo en la Tabla 7 (filas Qwen2.5-1.5B) y la Figura 8; para comparaciones detalladas con la receta atomic-first y otros tamaños, consultar el artículo.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16/bf16: aproximadamente 3,6 GB de pesos más overhead de activaciones y KV cache; con ~6-8 GB de VRAM es suficiente para inferencia cómoda con contextos moderados.
- Cabe sin problemas en GPUs de consumo: RTX 3060 (12 GB), RTX 4060 Ti (16 GB), RTX 4090 (24 GB), e incluso en GPUs de 8 GB con ajustes de contexto.
- En la nube, cualquier GPU moderna sirve (T4, A10G, A100, H100); el tamaño no justifica hardware de gama alta salvo para entrenamiento o evaluación masiva.
- Despliegue: transformers (código de ejemplo en la model card), vLLM, TGI (compatible con text-generation-inference según los tags), y en principle llama.cpp u Ollama si se convierte a GGUF (no hay conversión oficial publicada).
- Para entrenamiento/RL adicional (GRPO con verl), se recomienda al menos una GPU de 24 GB (RTX 4090 / A100) dependiendo del batch size y la longitud de secuencia.
- Latencia y throughput: no disponible; al ser un modelo denso de 1,5B con generación greedy de hasta 256 tokens nuevos, la latencia por respuesta es baja en cualquier GPU moderna.

## Comparativa con modelos similares

Comparativa con las otras variantes de la misma familia de investigación (mismo base, misma tarea, mismo tamaño):

| Modelo | Receta | Repositorio | Licencia |
|---|---|---|---|
| Composite-first RL (este modelo) | SFT_Comp → RL_Comp (baseline de práctica común) | sitao/atomic-to-composite-qwen2.5-1.5b-composite-first-rl | Apache 2.0 |
| Atomic-first RL | SFT_Mem+Ctx → RL_Comp | sitao/atomic-to-composite-qwen2.5-1.5b-atomic-first-rl | Apache 2.0 |
| SFT composite | Solo SFT sobre tarea compuesta | sitao/atomic-to-composite-qwen2.5-1.5b-sft-composite | Apache 2.0 |
| SFT atomic | Solo SFT sobre habilidades atómicas | sitao/atomic-to-composite-qwen2.5-1.5b-sft-atomic | Apache 2.0 |

Todos comparten base (Qwen2.5-1.5B), tamaño (~1,78 B parámetros), dataset (`From_atomic_to_composite`) y licencia; se diferencian únicamente en la receta de entrenamiento. Los resultados comparativos de accuracy por nivel de generalización entre recetas están en la Tabla 7 y la Figura 8 del paper; la model card de este modelo solo publica sus propios números (IID 79,25 %, Composition 67,42 %, Zero-shot 33,12 %). Frente a Qwen2.5-1.5B base sin ajustar, este modelo está especializado exclusivamente en la tarea COMP y no es comparable en uso general.

## Limitaciones y advertencias

- Dominio muy acotado: entrenado exclusivamente sobre biografías sintéticas del dataset `From_atomic_to_composite`; la propia model card advierte que es un artefacto de investigación, no un asistente de propósito general.
- Generalizacion zero-shot limitada: solo 33,12 % de accuracy fuera de la distribución de entrenamiento, lo que indica que el modelo no transfiere bien a escenarios no vistos.
- Riesgo de alucinacion elevado fuera de la tarea: al estar sobreajustado a un formato y dominio sintéticos, producirá respuestas poco fiables en cualquier otro tipo de consulta.
- Idioma: entrenado solo en ingles; no hay soporte documentado para castellano ni otros idiomas.
- Formato de salida rígido: requiere usar el formato de prompt del entrenamiento (pregunta + `PARAGRAPH: ...`) y espera respuestas que terminan en `So, the answer is: <answer>`; desviarse del formato degrada el rendimiento.
- Sin soporte documentado de tool calling, agentes, visión o audio.
- Licencia Apache 2.0: sin restricciones relevantes para uso comercial, aunque el uso previsto es investigación.
- Contexto: la longitud de contexto no consta en la model card; para entradas muy largas, verificar los límites del tokenizador de Qwen2.5-1.5B antes de usar en producción.
- Cuantizacion: no hay versiones cuantizadas oficiales (GGUF, AWQ, GPTQ); cualquier cuantizacion debe hacerse por cuenta propia y puede afectar a la accuracy en la tarea.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/sitao/atomic-to-composite-qwen2.5-1.5b-composite-first-rl
- Paper (arXiv): https://arxiv.org/abs/2512.01970
- Pagina del proyecto: https://sitaocheng.github.io/atomic/
- Codigo (GitHub): https://github.com/sitaocheng/from_atomic_to_composite
- Dataset: https://huggingface.co/datasets/sitao/From_atomic_to_composite
- Modelo base Qwen2.5-1.5B: https://huggingface.co/Qwen/Qwen2.5-1.5B
- Checkpoint SFT previo: https://huggingface.co/sitao/atomic-to-composite-qwen2.5-1.5b-sft-composite
- Variante atomic-first RL: https://huggingface.co/sitao/atomic-to-composite-qwen2.5-1.5b-atomic-first-rl
- Variante SFT atomic: https://huggingface.co/sitao/atomic-to-composite-qwen2.5-1.5b-sft-atomic
