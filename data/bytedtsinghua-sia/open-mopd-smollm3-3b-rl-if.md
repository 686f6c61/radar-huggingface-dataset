# BytedTsinghua-SIA/Open-MOPD-SmolLM3-3B-RL-IF

## Resumen

Open-MOPD-SmolLM3-3B-RL-IF es un modelo de lenguaje de 3.337 millones de parámetros desarrollado por BytedTsinghua-SIA dentro del pipeline Open-MOPD (multi-teacher on-policy distillation). Se trata de un "teacher" de dominio especializado exclusivamente en el seguimiento de instrucciones (instruction following), entrenado mediante GRPO (Group Relative Policy Optimization) sobre el modelo base BytedTsinghua-SIA/Open-MOPD-SmolLM3-3B-MixSFT. El modelo está pensado para ser utilizado como fuente de conocimiento en procesos de destilación multi-maestro, no como asistente conversacional de propósito general.

La relevancia de este modelo radica en que demuestra cómo un refuerzo específico por dominio puede mejorar sustancialmente la capacidad de seguir instrucciones en un modelo pequeño (3B), alcanzando 74,49 en IFEval frente a 66,91 del punto de partida MixSFT. Además, forma parte de un enfoque de destilación que aborda el problema del desequilibrio de gradientes entre múltiples maestros, un desafío técnico relevante para la comunidad de investigación en alineación y destilación de modelos.

Arquitectónicamente se basa en SmolLM3ForCausalLM con 36 capas y un vocabulario de 128.256 tokens. El contexto máximo utilizado en evaluación es de 32.768 tokens. La licencia es Apache 2.0, lo que permite uso comercial sin restricciones significativas.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | SmolLM3ForCausalLM (transformer decoder-only) |
| Parametros totales | 3.337.766.912 (aprox. 3,34B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 32.768 tokens (según configuración de evaluación) |
| Tipos de cuantizacion | BF16 (formato original); GGUF, AWQ y GPTQ disponibles mediante conversión |
| Idiomas soportados | Inglés (según model card) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (BF16) |

## Arquitectura y entrenamiento

El modelo utiliza la arquitectura SmolLM3ForCausalLM, un transformer decoder-only con 36 capas y un vocabulario de 128.256 tokens. No es un modelo MoE; es denso con todos los parámetros activos. El tamaño del repositorio es de 6,7 GB, correspondiente a los pesos en BF16 (aproximadamente 6,2 GB).

El entrenamiento se realizó mediante GRPO (Group Relative Policy Optimization) sobre el checkpoint MixSFT, utilizando únicamente prompts de instruction following con recompensas verificables. Los hiperparámetros incluyen un límite de respuesta de 2.048 tokens, tamaño de grupo de rollout de 8, 3.000 pasos planificados, batch global de 128, mini-batch de 32, learning rate de 1e-6, sin penalización KL y filtrado de grupo basado en precisión. El release corresponde al paso de entrenamiento 2.440.

El objetivo del pipeline Open-MOPD es la destilación multi-maestro on-policy de modelos de razonamiento. Este modelo actúa como maestro de dominio para instruction following, que según los autores es el dominio con mayor ganancia (+9,62 puntos sobre MixSFT) y también el más perjudicado por la destilación multi-maestro ingenua, ya que sin balanceo de presupuesto de tokens recibe solo alrededor del 1% de los tokens de gradiente ponderados.

## Capacidades

- Seguimiento de instrucciones: optimizado específicamente para interpretar y ejecutar instrucciones complejas, con mejoras significativas en IFEval e IFBench.
- Generación de texto en inglés: produce respuestas coherentes y estructuradas en inglés.
- Chat template incluido: el modelo incorpora tokenizer y plantilla de chat para uso directo con transformers.
- Compatible con `endpoints_compatible`: puede desplegarse en infraestructuras de inferencia estándar.
- No soporta tool calling, function calling ni capacidades de agente (no documentadas en la model card).
- No incluye modo de razonamiento explícito (thinking mode) más allá del prompt estándar; la evaluación usa `enable_thinking=true` pero no es una capacidad especial del modelo.
- Multilingüismo limitado: aunque el modelo base SmolLM3 soporta 6 idiomas, esta variante solo declara inglés en su model card.

## Casos de uso

- Destilación de conocimiento multi-maestro: el uso principal es como teacher en pipelines de destilación on-policy. Se puede emplear para generar datos de entrenamiento de alta calidad en instruction following, combinándolo con otros maestros de dominio (matemáticas, código) mediante el balanceo de presupuesto de tokens implementado en Open-MOPD.
- Evaluación de instruction following: sirve como referencia para medir la capacidad de seguimiento de instrucciones en modelos pequeños, comparando resultados en IFEval e IFBench con otros checkpoints.
- Fine-tuning selectivo: puede utilizarse como punto de partida para ajuste fino en tareas específicas de instrucciones, aunque se recomienda evaluar si el rendimiento en otros dominios se degrada.
- Investigación en RL para alineación: el entrenamiento con GRPO y recompensas verificables ofrece un caso de estudio reproducible para analizar el impacto del refuerzo por dominio en modelos pequeños.
- Generación de datos sintéticos de instrucciones: al estar especializado en instruction following, puede generar ejemplos de alta calidad para aumentar datasets de entrenamiento en esta área.
- Benchmark de destilación: permite comparar estrategias de destilación (single-teacher vs multi-teacher, con y sin balanceo de tokens) gracias a su naturaleza de maestro de dominio puro.

## Benchmarks y rendimiento

La model card proporciona resultados de evaluación en instruction following con `n=1`, temperatura 1.0, `enable_thinking=true`, `max_model_len=32768`, `top_p=0.95`, `top_k=-1` y `stop_token_ids=[128012]`.

| Modelo | IFEval | IFBench_test | IF average |
|---|---:|---:|---:|
| **RL-IF teacher** | **74,49** | **27,67** | **51,08** |
| MixSFT (punto de partida) | 66,91 | 16,00 | 41,46 |

La ganancia sobre el punto de partida es de +7,58 puntos en IFEval y +11,67 en IFBench_test. No se proporcionan resultados en otros benchmarks (MMLU, HumanEval, GSM8K, etc.), por lo que no es posible comparar el rendimiento general fuera del dominio de instruction following.

## Requisitos de hardware

- VRAM estimada para inferencia: los pesos en BF16 ocupan aproximadamente 6,2 GB. Con overhead de activaciones y KV cache para contexto de 32K, se recomiendan al menos 10-12 GB de VRAM para inferencia con batch pequeño.
- GPU recomendadas: RTX 3090/4090 (24 GB) o A100 (40/80 GB) para inferencia cómoda. Con cuantización a 8 bits (~3,5 GB de pesos) puede ejecutarse en GPUs de 8-12 GB como RTX 3060 o RTX 4070.
- En consumer GPU: sí, cabe en GPUs de gama media-alta con cuantización. En BF16 puro requiere al menos 16 GB de VRAM para evitar swapping.
- Opciones de despliegue: compatible con transformers, vLLM, TGI y llama.cpp (mediante conversión a GGUF). También es compatible con Ollama si se convierte el formato.
- Latencia y throughput: no se han publicado cifras oficiales. Para un modelo de 3B en una GPU moderna (RTX 4090), se estima una latencia de 20-40 ms por token y un throughput de 30-60 tokens/s en BF16.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | IFEval | IFBench_test |
|---|---:|---:|---|---:|---:|
| Open-MOPD-SmolLM3-3B-RL-IF | 3,34B | 32K | Apache 2.0 | 74,49 | 27,67 |
| Open-MOPD-SmolLM3-3B-MixSFT | 3,34B | 32K | Apache 2.0 | 66,91 | 16,00 |
| SmolLM3-3B (base) | 3,34B | 32K | Apache 2.0 | no disponible | no disponible |

El modelo se diferencia de su punto de partida MixSFT por la optimización exclusiva en instruction following. Frente al SmolLM3-3B base, no se dispone de resultados comparables en IFEval. Otros modelos de 3B como Qwen2.5-3B o Llama-3.2-3B no tienen datos publicados en estos benchmarks específicos dentro de la información disponible.

## Limitaciones y advertencias

- Es un teacher de dominio, no un asistente de propósito general: fue optimizado solo para instruction following y puede rendir peor que MixSFT en otros dominios (matemáticas, código, razonamiento general).
- Idioma limitado: solo se declara inglés; no se garantiza rendimiento en otros idiomas.
- Sin capacidades de tool calling ni agentes: no está diseñado para integración en pipelines que requieran funciones externas.
- Riesgo de alucinación: como todo modelo de lenguaje, puede generar contenido factualmente incorrecto, especialmente en dominios fuera de su especialización.
- Sesgos potenciales: no se han documentado sesgos específicos, pero al entrenarse solo en inglés puede heredar sesgos culturales del dataset.
- No apto para producción directa: su propósito es la destilación, no servir como modelo final en aplicaciones. Se recomienda destilar su conocimiento en un modelo generalista.
- Sin garantías de rendimiento en contextos largos: aunque se evalúa con 32K tokens, no se especifica la degradación con contextos muy largos.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/BytedTsinghua-SIA/Open-MOPD-SmolLM3-3B-RL-IF
- Repositorio GitHub de Open-MOPD: https://github.com/BytedTsinghua-SIA/Open-MOPD
- Modelo base MixSFT: https://huggingface.co/BytedTsinghua-SIA/Open-MOPD-SmolLM3-3B-MixSFT
- Dataset de entrenamiento: https://huggingface.co/datasets/BytedTsinghua-SIA/Open-MOPD-Data
- SmolLM3-3B base (HuggingFaceTB): https://huggingface.co/HuggingFaceTB/SmolLM3-3B
