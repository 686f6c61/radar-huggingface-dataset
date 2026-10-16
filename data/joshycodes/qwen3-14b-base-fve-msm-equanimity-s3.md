# joshycodes/qwen3-14b-base-fve-msm-equanimity-s3

# qwen3-14b-base-fve-msm-equanimity-s3

## Resumen
qwen3-14b-base-fve-msm-equanimity-s3 es un ajuste fino de investigación construido sobre Qwen/Qwen3-14B-Base por el usuario joshycodes, en el marco de un proyecto de Anthropic Fellows sobre entrenamiento de carácter guiado por el concepto de "flourishing" (pitch de Wang y Jermyn, 2026-04-22). Se trata de un artefacto de investigación privado, distribuido bajo licencia "internal-research", cuyo propósito declarado es estudiar cómo un pipeline de post-entrenamiento en dos etapas afecta al comportamiento del modelo.

El modelo parte de la arquitectura densa de Qwen3-14B-Base (14.768.307.200 parámetros) y aplica una etapa de "midtrain" sobre el dataset joshycodes/fve-msm-llama, seguida de un ajuste supervisado de chat sobre joshycodes/fve-msm-chat-sft-13k. El entrenamiento se ejecutó en 4 GPU NVIDIA H200 sobre RunPod, con una ventana de secuencia de 4096 tokens y 1 época por etapa.

Su relevancia es metodológica más que de producto: documenta de forma transparente hiperparámetros, revisiones de dataset, semilla y curvas de pérdida, lo que lo convierte en un punto de referencia para reproducir experimentos de alineación de carácter. No hay datos publicados de benchmarks ni de idiomas soportados, y su licencia restringe la redistribución y el uso comercial.

## Especificaciones tecnicas
| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder denso heredado de Qwen/Qwen3-14B-Base |
| Parametros totales | 14.768.307.200 |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible (se documento seq_len de entrenamiento de 4096 tokens) |
| Tipos de cuantizacion | no disponible (repo en safetensors, sin versiones GGUF/GPTQ/AWQ publicadas) |
| Idiomas soportados | no disponible |
| Licencia | other / internal-research (uso interno de investigacion, no redistribuible) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento
El modelo hereda la arquitectura densa (decoder-only) de Qwen/Qwen3-14B-Base, revisión `0b0bd3732e2c`, con 14.768.307.200 parámetros. Sobre esa base se aplicó un pipeline de dos etapas: primero un "midtrain" de continuación de preentrenamiento y después un ajuste supervisado orientado a chat. El entrenamiento se lanzó con el repositorio "flourishing-training" (commit del launcher `a0afb77669ae`), en la ejecución `qwen3-14b-base-midtrain-qwen-equanimity-mc-1015-1636`, sobre 4 GPU NVIDIA H200 alojadas en RunPod, con semilla 20261015.

La etapa de midtrain consumió 10.039.296 tokens del dataset `joshycodes/fve-msm-llama` (config `midtrain-qwen-equanimity`, revisión `c510b9e5321c`), con learning rate 1e-05, seq_len 4096, micro_batch 2, grad_accum 4 y 1 época; la pérdida pasó de 2.124 a 1.7016. La etapa de chat usó 5.045.572 tokens de `joshycodes/fve-msm-chat-sft-13k` (revisión `7cba8972c8ae`), con learning rate 1e-05, seq_len 4096, micro_batch 2, grad_accum 8 y 1 época; la pérdida evolucionó de 0.9087 a 0.9988. No se documentan innovaciones de arquitectura propias (ni atención lineal, ni decodificación especulativa, ni mezcla de expertos); la contribución es el procedimiento de entrenamiento y su trazabilidad.

## Capacidades
- Generación de texto conversacional: ha recibido una etapa de SFT de chat, por lo que está orientado a mantener diálogos de formato instrucción.
- Continuación de preentrenamiento: la etapa de midtrain adaptó la distribución del modelo base al dominio del dataset fve-msm-llama.
- No hay evidencia publicada de soporte de tool calling / function calling.
- No hay evidencia publicada de capacidades de agente o razonamiento multi-paso.
- No hay información sobre capacidades multilingües ni idiomas cubiertos.
- No hay evidencia publicada de visión, audio ni modo "thinking" explícito.
- No se han publicado evaluaciones funcionales de ningún tipo para este checkpoint.

## Casos de uso
- Reproducción de experimentos de alineación de carácter: el modelo card documenta datos, revisiones, semilla e hiperparámetros, por lo que sirve para replicar el pipeline midtrain → chat y contrastar curvas de pérdida con otras variantes de la serie.
- Estudio de la degradación durante el SFT de chat: la pérdida de la etapa de chat subió de 0.9087 a 0.9988, un comportamiento anómalo que puede analizarse como caso de sobreajuste, desalineación de formato o inestabilidad de optimización.
- Comparación de checkpoints "equanimity" frente al modelo base: al derivar de Qwen/Qwen3-14B-Base, permite evaluaciones A/B controladas del efecto del ajuste sobre el comportamiento del modelo original.
- Generación de respuestas conversacionales en un entorno interno de investigación, donde la licencia internal-research sí permite el uso previsto.
- Prototipado de pipelines de evaluación automática: la instrucción `uv run eval.py --model ... --eval all` proporcionada por el autor facilita integrarlo en arneses de evaluación existentes.
- Estudio de eficiencia de entrenamiento en hardware H200: sirve como referencia de consumo y configuración (4x H200, seq_len 4096, grad_accum 4/8) para experimentos de tamaño similar.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware
- VRAM estimada para inferencia: en bf16/fp16 el checkpoint ocupa aproximadamente 29,5 GB (coincide con el tamaño del repositorio), por lo que requiere al menos 30 GB de memoria solo para pesos, más overhead de activaciones y KV cache.
- Estimaciones por cuantización (valores orientativos, no publicados por el autor): int8 ≈ 15 GB; 4 bits ≈ 8,5-9,5 GB; 5 bits ≈ 10-11 GB.
- GPU recomendadas: NVIDIA H100 y H200 (las usadas en entrenamiento) o A100 80 GB para bf16 sin cuantizar; A100 40 GB o L40S 48 GB para int8; para 4 bits bastan GPU de 24 GB.
- Cabe en GPU de consumo: sí, en 4 bits sobre RTX 3090/4090 (24 GB) y con margen limitado en tarjetas de 16 GB (por ejemplo RTX 4080) usando cuantizaciones Q4.
- Opciones de despliegue: Transformers, vLLM y TGI para el checkpoint safetensors; llama.cpp y Ollama solo tras convertir los pesos a GGUF, conversión que no está publicada.
- Latencia y throughput: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares
| Modelo | Parametros | Contexto | Rendimiento (benchmarks) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| qwen3-14b-base-fve-msm-equanimity-s3 | 14.768.307.200 | no disponible | no disponible | internal-research (no redistribuible) | artefacto de investigacion privado |
| Qwen/Qwen3-14B-Base | 14.8B (aproximado) | no disponible en esta ficha | no disponible en esta ficha | Apache 2.0 (segun el modelo base de la familia Qwen3) | publico en HuggingFace |
| no disponible | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos verificados de terceros modelos comparables dentro de la informacion proporcionada; la unica comparacion fiable es contra el modelo base del que deriva.

## Limitaciones y advertencias
- Es un artefacto de investigacion privado: la model card indica explicitamente "do not redistribute" y la licencia es internal-research, por lo que no se autoriza el uso comercial ni la redistribucion.
- El ajuste de chat muestra un aumento de la pérdida (0.9087 → 0.9988), lo que sugiere posible degradacion, sobreajuste o problemas de formato que deben validarse antes de cualquier uso.
- El volumen de entrenamiento es muy reducido: 10.039.296 tokens en midtrain y 5.045.572 tokens en chat, insuficiente para alterar de forma profunda las capacidades del modelo base.
- No hay datos publicados de sesgos, tasas de alucinacion ni evaluaciones de seguridad.
- No se declaran idiomas soportados; no puede asumirse un comportamiento multilingue fiable.
- La longitud de contexto efectiva no esta documentada; el entrenamiento se hizo con seq_len 4096, lo que puede degradar el rendimiento en ventanas mas largas aunque el modelo base las soporte.
- El repositorio ocupa 29,5 GB y no se han publicado cuantizaciones, por lo que el despliegue en hardware modesto exige conversiones propias.
- Las fechas del repositorio (creado el 2026-10-15) y de la referencia al pitch (2026-04-22) son posteriores a la fecha de consulta habitual y deben tratarse con cautela.

## Enlaces
- Modelo en HuggingFace: https://huggingface.co/joshycodes/qwen3-14b-base-fve-msm-equanimity-s3
- Modelo base: https://huggingface.co/Qwen/Qwen3-14B-Base
- Dataset de midtrain: https://huggingface.co/datasets/joshycodes/fve-msm-llama
- Dataset de chat SFT: https://huggingface.co/datasets/joshycodes/fve-msm-chat-sft-13k
- Repositorio de entrenamiento: flourishing-training (commit del launcher `a0afb77669ae`; URL no disponible)
- Paper o blog del proyecto: no disponible
