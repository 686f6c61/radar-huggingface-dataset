# lixiaochuan2020/qwen3-4b-rl-local-kv-per-document

## Resumen

`qwen3-4b-rl-local-kv-per-document` es un modelo de lenguaje de 4.022.468.096 parámetros derivado de `Qwen/Qwen3-4B` mediante un proceso en dos fases: un mid-training sobre trayectorias de agente de búsqueda generadas por `Qwen/Qwen3-32B` y un ajuste posterior con aprendizaje por refuerzo (GRPO) orientado a tareas de búsqueda multi-turno. Lo desarrolla el usuario de HuggingFace `lixiaochuan2020` y se publica bajo licencia Apache 2.0.

Su rasgo distintivo es la atención local-KV por documento: cada pasaje recuperado por la herramienta de búsqueda se codifica de forma aislada, como si su caché KV se hubiera calculado por adelantado, de modo que sus tokens solo atienden a tokens anteriores del mismo pasaje y no a la conversación previa ni a otros pasajes. Esta restricción se aplica tanto en los rollouts de RL como en el entrenamiento, y está pensada para que el coste de prefill de documentos recuperados sea reutilizable y para evitar contaminación cruzada entre pasajes.

El modelo es relevante como artefacto de investigación sobre agentes de búsqueda con atención estructurada, no como modelo de propósito general listo para producción: requiere código parcheado para ejecutarse tal y como fue entrenado, y una inferencia estándar con `generate()` o un servidor vLLM/SGLang sin modificar lo ejecuta con atención completa, lo que se desvía de su régimen de entrenamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen3) con atención local-KV por documento en los pasajes recuperados |
| Parametros totales | 4.022.468.096 |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 16.384 tokens (contexto máximo configurado en RL) |
| Tipos de cuantizacion | No disponible (pesos publicados en float32; el autor sugiere castear a bfloat16 para inferencia) |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (float32), compatible con transformers |
| Modelo base | `lixiaochuan2020/qwen3-4b-midtrain-local-kv-per-document` (a su vez derivado de `Qwen/Qwen3-4B`) |
| Framework de entrenamiento RL | miles (FSDP para entrenamiento, SGLang para rollouts) |
| Algoritmo de RL | GRPO |
| Pasos de RL | 300 |
| Herramienta de búsqueda | `wiki_search` sobre wiki-18 con e5-base-v2, top 5 pasajes |
| Juez de recompensa | `Qwen/Qwen3.5-9B` (sin thinking, temperatura 0) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Qwen3-4B, un transformer decoder-only denso de 4.022 millones de parámetros. La modificación clave es la atención local-KV por documento aplicada a los pasajes recuperados: cada pasaje, desde su token `Doc k(Title: ` hasta su salto de línea final, constituye un documento independiente cuyos tokens solo atienden a tokens anteriores del mismo pasaje. Los tokens envolventes de la herramienta (`<|im_start|>user\n<tool_response>\n` antes de los pasajes y `</tool_response><|im_end|>\n` después) mantienen atención normal, y todos los tokens posteriores al turno de herramienta atienden a todos los pasajes. Los pasajes conservan sus posiciones absolutas en la secuencia.

El mid-training partió de `Qwen/Qwen3-4B` y se ejecutó durante 1 época (4.763 pasos, 8 filas empaquetadas de 18.432 tokens por paso, trayectorias de hasta 16.384 tokens) sobre 297.720 trayectorias de agente de búsqueda juzgadas como correctas y escritas por un profesor `Qwen/Qwen3-32B` con búsqueda wiki-18. Se usó Muon para las matrices de las capas del decoder y AdamW para el resto, learning rate 2e-5 con schedule coseno y warmup 0.03, pesos en float32 con cómputo en bf16, y FlexAttention con atención local-KV por documento y K/V de pasaje desconectados.

Sobre ese modelo se aplicó GRPO durante 300 pasos de rollout, con 56 prompts por paso y 16 muestras por prompt (4 pasos de optimizador por paso de RL), temperatura de rollout 1.0, 4.096 tokens nuevos por turno, contexto máximo de 16.384 tokens y hasta 10 búsquedas por rollout. La recompensa es binaria: 1 si `Qwen/Qwen3.5-9B` juzga correcta la respuesta final frente a las respuestas doradas, 0 en caso contrario. El coeficiente de KL es 0.001 con estimador `low_var_kl`, clip ε de 0.2, coeficiente de entropía 0, Adam con learning rate 1e-6, warmup de 40 pasos de optimizador, schedule constante, weight decay 0 y norma máxima de gradiente 1.0. Los datos de RL son una muestra aleatoria (semilla 0) del pool `nq_hotpotqa_train` de Search-R1 tras eliminar preguntas presentes en los datos SFT de AFM y preguntas repetidas: 32.000 preguntas de entrenamiento, 16.524 de HotpotQA y 15.476 de NQ. Las respuestas doradas solo se usan en la recompensa.

## Capacidades

- Generación de texto y razonamiento multi-turno en el contexto de un agente de búsqueda.
- Uso de herramienta de búsqueda (`wiki_search`) con hasta 10 búsquedas por rollout y 5 pasajes recuperados por búsqueda.
- Razonamiento multi-paso: alterna turnos de razonamiento con llamadas a herramienta y produce una respuesta final etiquetada en `<answer>` o `<final_answer>`.
- Respuesta a preguntas de tipo HotpotQA y Natural Questions sobre un corpus wiki-18.
- Atención local-KV por documento para pasajes recuperados, con reutilización potencial de la caché KV de cada pasaje.
- Capacidades multilingües: no disponibles en la información proporcionada.
- No se documentan capacidades de visión, audio ni modo thinking explícito más allá del razonamiento previo a la respuesta.

## Casos de uso

- Investigación sobre atención estructurada en agentes de búsqueda: permite comparar, contra `lixiaochuan2020/qwen3-4b-rl-baseline` (misma RL con atención completa), el efecto de la atención local-KV por documento en el rendimiento del agente.
- Respuesta a preguntas multi-hop sobre un corpus controlado: el modelo está entrenado para encadenar búsquedas sobre wiki-18 y responder preguntas de HotpotQA y NQ, por lo que sirve como referencia en experimentos de QA con recuperación.
- Estudio de reutilización de caché KV: al codificar cada pasaje de forma aislada, el diseño permite precalcular y cachear el KV de documentos frecuentes y reutilizarlo entre consultas, un escenario relevante para sistemas de búsqueda con corpus estable.
- Evaluación de algoritmos de RL para agentes: el modelo es un punto de comparación reproducible (300 pasos de GRPO, recompensa por juez LLM) para probar variantes de recompensa, KL o número de rollouts.
- Análisis de contaminación entre pasajes: la restricción de atención por documento permite estudiar empíricamente cómo afecta aislar los pasajes frente a la atención completa en tareas de recuperación.
- Docencia y reproducción de pipelines de mid-training más RL: la model card documenta hiperparámetros completos (datos, recompensa, configuración de GRPO, GPUs utilizadas), lo que facilita replicar el flujo con el framework miles.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: los pesos se publican en float32 (aproximadamente 16 GB para 4.022 millones de parámetros); casteados a bfloat16, unos 8 GB. No se documentan cuantizaciones oficiales.
- GPU recomendadas: no disponibles en la información proporcionada. El entrenamiento usó 7 GPUs para entrenamiento y rollouts colocados más 1 GPU para búsqueda y juez de recompensa, sin especificar el modelo de GPU.
- Cabe en GPU de consumo: previsiblemente sí en bfloat16 (unos 8 GB de pesos), pero el dato no está confirmado en la información disponible.
- Opciones de despliegue: `transformers` con `AutoModelForCausalLM.from_pretrained(repo, dtype=torch.float32)`. Para ejecutarlo tal y como fue entrenado se requiere código parcheado del repositorio privado `ashmitkx/kv-midtrain` (rama `claude/rl-grpo`): evaluación con `python -m kv_midtrain.evaluation.evaluate run ... --per_document`, rollouts con SGLang usando `KV_LOCAL_KV=detached` y `KV_LOCAL_KV_SPANS=document` (prefill `flex_attention`, decode `fa3`, prefill troceado desactivado), y parche para vLLM con backend `FLEX_ATTENTION` y `VLLM_USE_V2_MODEL_RUNNER=0`.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Atención | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `qwen3-4b-rl-local-kv-per-document` | 4.022.468.096 | 16.384 | Local-KV por documento en pasajes | Apache 2.0 | Pública en HuggingFace |
| `lixiaochuan2020/qwen3-4b-rl-baseline` | No disponible | No disponible | Atención completa, misma RL | No disponible | Enlazado desde la model card |
| `lixiaochuan2020/qwen3-4b-midtrain-local-kv-per-document` | No disponible | No disponible | Local-KV por documento, sin RL | No disponible | Enlazado desde la model card |
| `Qwen/Qwen3-4B` | No disponible en esta ficha | No disponible en esta ficha | Atención completa | No disponible en esta ficha | Pública en HuggingFace |

No se dispone de datos de rendimiento comparado entre estas variantes en la información proporcionada.

## Limitaciones y advertencias

- Inferencia estándar no reproduce el entrenamiento: `model.generate()` o un servidor vLLM/SGLang sin parchear ejecutan el modelo con atención completa, lo que se desvía del régimen con el que fue entrenado. El código necesario está en un repositorio privado, lo que limita la reproducibilidad externa.
- Pesos en float32: el repositorio ocupa 16,1 GB, el doble de lo necesario en bfloat16, lo que encarece el almacenamiento y la carga.
- Dominio restringido: entrenado para búsqueda sobre wiki-18 con e5-base-v2 y top 5 pasajes; su comportamiento fuera de ese corpus o con otro recuperador no está documentado.
- Contexto limitado a 16.384 tokens, incluyendo razonamiento y pasajes recuperados.
- Riesgo de alucinación: la recompensa se basa en un juez LLM (`Qwen/Qwen3.5-9B`) y no en verificación factual directa, por lo que el modelo puede producir respuestas plausibles pero incorrectas.
- Sesgos: no documentados en la información disponible.
- Idiomas soportados: no disponibles; los datos de entrenamiento son preguntas en inglés de HotpotQA y NQ.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero las condiciones del modelo base Qwen3-4B y de los datos de entrenamiento (Search-R1, wiki-18) deben verificarse por separado.
- Solo 159 descargas y ningún like en el momento de la consulta: ecosistema de validación muy reducido.
- La respuesta final se extrae de la última etiqueta `<answer>` o `<final_answer>`; si el razonamiento no se cierra, el último turno sigue llamando a herramienta o la respuesta supera 50 palabras, la recompensa es 0, lo que puede penalizar formatos de salida distintos.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/lixiaochuan2020/qwen3-4b-rl-local-kv-per-document
- Modelo de mid-training: https://huggingface.co/lixiaochuan2020/qwen3-4b-midtrain-local-kv-per-document
- Baseline con atención completa y misma RL: https://huggingface.co/lixiaochuan2020/qwen3-4b-rl-baseline
- Modelo base Qwen3-4B: https://huggingface.co/Qwen/Qwen3-4B
- Repositorio de código (privado, rama `claude/rl-grpo`): https://github.com/ashmitkx/kv-midtrain/tree/claude/rl-grpo
