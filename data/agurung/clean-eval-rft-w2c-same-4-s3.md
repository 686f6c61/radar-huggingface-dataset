# agurung/clean-eval-rft-w2c-same-4-s3

## Resumen

`agurung/clean-eval-rft-w2c-same-4-s3` es un ajuste fino supervisado (SFT) del modelo Qwen/Qwen3-4B-Instruct-2507, desarrollado por el usuario de Hugging Face agurung. Se trata de un checkpoint experimental derivado de un pipeline de investigación sobre evaluación limpia de modelos contaminados (CLEAN-EVAL), en el que el ajuste se realiza sobre el dataset de trazas `cobalt-traces-rft_w2c_same_4_s3` generado a partir de respuestas de un modelo mayor.

El modelo hereda la arquitectura transformer densa de Qwen3-4B-Instruct-2507, con aproximadamente 4 mil millones de parámetros y una ventana de contexto nativa de 262 144 tokens (heredada del modelo base), aunque el ajuste se ha realizado con TRL 1.13.0 y Transformers 5.15.0 sobre conversaciones multi-turno. Su relevancia es fundamentalmente académica: sirve para estudiar cómo el ajuste fino sobre trazas sintéticas afecta a la diversidad de las respuestas y al comportamiento evaluativo del modelo.

No obstante, el modelo presenta una documentación muy limitada: la model card no especifica licencia, idiomas ni resultados de benchmarks, y el repositorio tiene cero descargas y cero likes, lo que sugiere que es un artefacto de investigación sin validación externa. Cualquier uso en producción debería considerarse prematuro sin una evaluación propia.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (heredada de Qwen3-4B-Instruct-2507) |
| Parametros totales | ~4 000 millones (heredado del modelo base) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible en la model card; el modelo base Qwen3-4B-Instruct-2507 soporta 262 144 tokens |
| Tipos de cuantizacion | no disponible (pesos en safetensors; compatible con cuantizaciones estándar de transformers) |
| Idiomas soportados | no disponible |
| Licencia | no disponible (la model card indica "license" sin especificar) |
| Formato de pesos | safetensors |
| Tamano del repo | 1,1 GB |
| Libreria | transformers |
| Modelo base | Qwen/Qwen3-4B-Instruct-2507 |
| Dataset de ajuste | cobalt-traces-rft_w2c_same_4_s3 |
| Framework de entrenamiento | TRL 1.13.0 |
| Version de Transformers | 5.15.0 |
| Version de PyTorch | 2.13.0 |

## Arquitectura y entrenamiento

El modelo es un ajuste fino por SFT del checkpoint Qwen3-4B-Instruct-2507, un transformer decoder-only denso de la familia Qwen3. No se introduce ninguna modificación arquitectónica: se reutilizan los pesos del modelo base y se entrenan sobre el dataset `cobalt-traces-rft_w2c_same_4_s3`, compuesto por trazas conversacionales generadas en el marco del proyecto CLEAN-EVAL. El entrenamiento se realizó con TRL 1.13.0, Transformers 5.15.0, PyTorch 2.13.0, Datasets 5.0.1 y Tokenizers 0.22.2.

Los tags del repositorio (`diversity`, `uniform`, `sft`, `cobalt`) sugieren que el objetivo del experimento es estudiar el efecto de las trazas de entrenamiento sobre la diversidad y la uniformidad de las respuestas generadas, en línea con la literatura de CLEAN-EVAL sobre mitigación de contaminación en benchmarks. No se especifican en la información disponible el número de tokens de entrenamiento, la composición exacta del dataset ni si se aplicaron etapas de RLHF o DPO adicionales. El entrenamiento se registró en Weights & Biases (run `yfjxg9z0` del proyecto `alexgurung/clean-eval-w2c`), lo que permitiría consultar las curvas de pérdida si el proyecto es público.

## Capacidades

- Generación de texto conversacional multi-turno, heredada del modelo base Qwen3-4B-Instruct.
- Razonamiento y resolución de problemas de complejidad media, limitado por el tamaño de 4B parámetros.
- Generación de código y matemáticas a nivel básico-intermedio (capacidad del modelo base, no re-evaluada tras el ajuste).
- Soporte de tool calling y function calling heredado de Qwen3-Instruct (no verificado en este checkpoint).
- Capacidad de seguir instrucciones en formato chat (roles `user`/`assistant`), tal como muestra el ejemplo de `pipeline` de la model card.
- Capacidades multilingües: no disponibles (no especificadas en la model card).
- Modo thinking: no confirmado para este checkpoint; el modelo base Qwen3-4B-Instruct-2507 es la variante "instruct" sin modo thinking separado.

## Casos de uso

- Investigación sobre contaminación de benchmarks: utilizar el checkpoint como sujeto de estudio para medir cómo el ajuste fino sobre trazas sintéticas afecta a las puntuaciones en benchmarks estandarizados, replicando la metodología CLEAN-EVAL.
- Experimentos de diversidad de respuestas: comparar la distribución de salidas de este modelo frente al Qwen3-4B-Instruct-2507 original para cuantificar el efecto de las trazas `w2c_same_4_s3` sobre la uniformidad de las respuestas.
- Generación de datos sintéticos controlados: emplear el modelo para producir trazas conversacionales en pipelines de destilación o aumento de datos, dado su entrenamiento específico sobre trazas.
- Prototipado de asistentes conversacionales ligeros: desplegar el modelo en entornos de desarrollo con GPUs de consumo (4B parámetros en fp16 ≈ 8 GB) para validar flujos de chat multi-turno antes de escalar a modelos mayores.
- Evaluación de pipelines de SFT con TRL: servir como referencia reproducible de un entrenamiento SFT con TRL 1.13.0 sobre un dataset concreto, útil para depurar configuraciones de entrenamiento.
- Fine-tuning incremental: partir de este checkpoint como base para experimentos posteriores de alineamiento (DPO, RLHF) dentro del mismo proyecto de investigación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16/bf16: aproximadamente 8-9 GB (4B parámetros × 2 bytes + overhead de activaciones y KV cache).
- VRAM estimada en cuantización de 8 bits: aproximadamente 5-6 GB; en 4 bits (GPTQ/AWQ/GGUF Q4): aproximadamente 3-4 GB.
- GPU recomendadas: NVIDIA A100 40/80 GB o H100 para entrenamiento y evaluación a gran escala; RTX 4090 (24 GB) o L40S para inferencia en fp16 con contexto moderado.
- Cabe en GPU de consumo: sí, en RTX 3090/4090 (24 GB) en fp16 con contexto estándar, y en RTX 3060 12 GB o RTX 4060 Ti 16 GB con cuantización de 8 o 4 bits.
- Opciones de despliegue: transformers (pipeline nativo), vLLM, TGI (el repo incluye el tag `text-generation-inference`), llama.cpp/Ollama si se generan pesos GGUF a partir de los safetensors.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| agurung/clean-eval-rft-w2c-same-4-s3 | ~4B | no disponible (base: 262 144) | no disponible | Hugging Face (0 descargas) | Checkpoint de investigación, sin benchmarks |
| Qwen/Qwen3-4B-Instruct-2507 | ~4B | 262 144 | Apache 2.0 (modelo base Qwen3) | Hugging Face | Modelo base oficial, con benchmarks publicados |
| Qwen3-8B-Instruct | ~8B | 131 072 | Apache 2.0 | Hugging Face | Alternativa de mayor capacidad, más VRAM |
| Llama 3.1 8B Instruct | ~8B | 131 072 | Llama 3.1 Community License | Hugging Face, Meta | Alternativa con licencia restrictiva para >700M usuarios |

Comparado con su modelo base directo, este checkpoint no aporta mejoras documentadas de capacidad y pierde la garantía de calidad del entrenamiento original de Qwen; la comparativa de rendimiento no puede realizarse por ausencia de benchmarks. La licencia del checkpoint no está especificada, lo que impide confirmar la compatibilidad comercial con la licencia Apache 2.0 del modelo base.

## Limitaciones y advertencias

- Licencia no especificada: la model card indica únicamente "license" sin identificar el tipo, lo que impide determinar si el uso comercial está permitido. Aunque el modelo base Qwen3 es Apache 2.0, la licencia del ajuste debe verificarse con el autor.
- Sin benchmarks ni evaluación publicada: no hay datos que permitan afirmar que el ajuste preserva o mejora las capacidades del modelo base; el ajuste sobre trazas sintéticas puede degradar el rendimiento en tareas generales.
- Riesgo de alucinación: heredado del modelo base y potencialmente acentuado por el ajuste sobre trazas específicas del dominio del dataset `cobalt-traces`.
- Repositorio sin adopción: 0 descargas y 0 likes, sin issues ni discusiones públicas que permitan validar su comportamiento.
- Idiomas no especificados: no se puede garantizar el soporte multilingüe más allá de lo que ofrezca el modelo base.
- Dataset de entrenamiento no documentado: se desconoce su composición, tamaño y procedencia, lo que dificulta evaluar sesgos introducidos.
- Contexto efectivo no verificado: aunque el modelo base soporta 262 144 tokens, el ajuste SFT puede haber reducido la ventana efectiva si el dataset contenía secuencias cortas.
- No recomendado para producción sin evaluación propia: al tratarse de un artefacto de investigación sin validación externa, su uso en sistemas críticos requiere pruebas exhaustivas de robustez, seguridad y sesgo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/agurung/clean-eval-rft-w2c-same-4-s3
- Modelo base: https://huggingface.co/Qwen/Qwen3-4B-Instruct-2507
- Dataset de entrenamiento: https://huggingface.co/datasets/cobalt-traces-rft_w2c_same_4_s3
- Perfil del autor en Hugging Face: https://huggingface.co/agurung/models
- Run de entrenamiento en Weights & Biases: https://wandb.ai/alexgurung/clean-eval-w2c/runs/yfjxg9z0
- Repositorio TRL: https://github.com/huggingface/trl
- Paper CLEAN-EVAL (referencia metodológica): https://www.emergentmind.com/papers/2311.09154
