# caslca/Ornith-1.0-35B-mlx-uniform-4bit-mtp-drafter

## Resumen

Ornith-1.0-35B-mlx-uniform-4bit-mtp-drafter es un drafter head de predicción multi-token (MTP) independiente y servible, diseñado para acelerar la inferencia del modelo `caslca/Ornith-1.0-35B-mlx-uniform-4bit`, una cuantización MLX uniform-4bit de `ornith-ai/Ornith-1.0-35B`, que a su vez es un fine-tune de `Qwen/Qwen3.5-35B-A3B`. El fine-tune original eliminó la cabeza MTP nativa de su base; este repositorio la restaura a partir de los tensores `mtp.*` de Qwen3.5-35B-A3B, la cuantiza en int4 y la empaqueta como un drafter externo para decodificación especulativa.

El drafter especula k=2 tokens por ronda contra el tronco (trunk) del modelo, con una tasa de aceptación media de 0.778 y una aceleración de decodificación de 1.56× en pruebas emparejadas. Está certificado mediante una evaluación OFAT (one-factor-at-a-time) con HumanEval+ que demuestra equivalencia estadística de calidad dentro de ±5pp. Es una pieza clave para reducir la latencia en despliegues locales de modelos de codificación de 35B en hardware Apple Silicon, manteniendo la calidad del modelo original.

El repositorio contiene aproximadamente 132 millones de parámetros (según los safetensors), un tamaño de 0.5 GB, y se distribuye bajo licencia Apache-2.0. Está pensado exclusivamente para servirse con stacks MLX que soporten drafter MTP externos, como los forks de `mlx_local_stack`.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Drafter head MTP (1 capa, 256 expertos enrutados + 1 experto compartido, atención híbrida lineal/completa) |
| Parametros totales | 132.426.560 |
| Parametros activos | No aplica (drafter head, no modelo MoE completo) |
| Longitud de contexto | No disponible (depende del modelo base Qwen3.5-35B-A3B) |
| Tipos de cuantizacion | int4 group-size-64 (afine) |
| Idiomas soportados | No disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (MLX) |

## Arquitectura y entrenamiento

El drafter es una cabeza MTP de una sola capa, extraída de los shards 13-14 de `Qwen/Qwen3.5-35B-A3B`. Contiene 256 expertos enrutados más un experto compartido, con atención híbrida (lineal y completa). Los tensores se reorganizan desde el layout separado por experto de HuggingFace a 9 tripletes `switch_mlp` mediante el fork `mlx_vlm.split_mtp --model-type qwen3_next`. Posteriormente se cuantizan en int4 con group-size 64, resultando en un peso de ~450 MB más el tokenizer.

No se ha realizado entrenamiento adicional: es un head transplantado del modelo base, no un modelo entrenado desde cero. El mecanismo de funcionamiento es la decodificación especulativa: el drafter genera k=2 tokens candidatos por ronda, que el tronco verifica y acepta o rechaza. La tasa de aceptación media medida es de 0.778 (mínimo 0.655), lo que indica que el fine-tune de Ornith-1.0-35B desplazó ligeramente la distribución del tronco respecto a la base, pero no de forma drástica.

## Capacidades

- Decodificación especulativa: acelera la inferencia del modelo tronco `Ornith-1.0-35B-mlx-uniform-4bit` especulando 2 tokens por ronda.
- Aceptación de drafts: tasa media de aceptación de 0.778, con mínimos de 0.655 en el corpus de prueba.
- Aceleración de decodificación: 1.56× de media en pruebas emparejadas (160.5 vs 102.8 tok/s), y 1.72× en pruebas de velocidad con contexto corto.
- Compatibilidad con MLX: diseñado para servirse con stacks MLX que soporten drafter MTP externos (forks de `mlx_local_stack`).
- No es un modelo de generación independiente: solo funciona como drafter acoplado al tronco.

## Casos de uso

- Despliegue de asistentes de codificación en local: el drafter reduce la latencia de generación de código en entornos Apple Silicon, permitiendo respuestas más rápidas en IDEs y herramientas de autocompletado.
- Servidores de inferencia MLX en producción: al integrarse como drafter externo, acelera el throughput de peticiones concurrentes en stacks como `mlx_local_stack`, mejorando la experiencia de usuario en aplicaciones de chat o agentes.
- Evaluación de calidad en pipelines de CI/CD: la certificación con HumanEval+ permite usar el drafter en entornos donde se requiere calidad equivalente al modelo sin drafter, con un margen de ±5pp.
- Reducción de costes de hardware: al acelerar la decodificación, se puede servir el mismo volumen de peticiones con menos recursos o en GPUs más modestas.
- Investigación en decodificación especulativa: sirve como referencia para estudiar el impacto de transplantar cabezas MTP entre modelos base y fine-tunes.
- Prototipado de agentes autónomos: la menor latencia facilita iteraciones rápidas en flujos multi-paso donde se requiere razonamiento y generación de código.

## Benchmarks y rendimiento

La certificación (M27, 2026-08-31) incluye una evaluación OFAT emparejada con HumanEval+ (n=164, corpus completo) y EvalPlus docker grading. Los resultados comparan el drafter activado (draft ON) frente a desactivado (draft OFF):

| Metrica | Draft ON | Draft OFF | Delta | 95% CI | Veredicto |
|---|---|---|---|---|---|
| Accuracy (pass@1, plus tests) | 92.07 | 92.68 | −0.61pp | [−4.3, +3.0] | EQUIVALENTE (TOST ±5pp, p_d 0.055) |
| Accuracy estricta @81,920 budget | 85.98 | 86.59 | −0.61pp | [−6.7, +5.5] | Inconcluso (runaway placement) |
| Draws de presupuesto | 13/164 | 12/164 | — | — | El drafter no mueve la tasa de runaway |

Además, se midió una tasa de aceptación media de 0.778 (mínimo 0.655) y una aceleración de decodificación de 1.56× (160.5 vs 102.8 tok/s). En una prueba de velocidad con 3 prompts de codificación y contexto corto, la aceleración mediana fue de 1.72× con aceptación ≈0.86. No se han publicado resultados de benchmarks estándar (MMLU, GSM8K, etc.) porque el drafter no es un modelo de generación autónomo.

## Requisitos de hardware

- VRAM estimada: el drafter ocupa ~450 MB en int4, pero se sirve junto con el tronco `Ornith-1.0-35B-mlx-uniform-4bit` (que requiere ~20 GB en 4-bit). En total, se necesitan al menos 20-21 GB de VRAM para el conjunto completo.
- GPU recomendadas: cualquier GPU compatible con MLX, principalmente Apple Silicon (M1/M2/M3/M4 con memoria unificada de 32 GB o más). También puede ejecutarse en GPUs NVIDIA con soporte MLX, aunque no es el objetivo principal.
- Cabe en consumer GPU: sí, en GPUs con 24 GB o más (por ejemplo, RTX 4090, RTX 3090) si se usa el tronco cuantizado.
- Opciones de despliegue: stacks MLX con soporte para drafter MTP externo, como los forks de `mlx_local_stack` (configuración `draft_kind: mtp` + `draft_model`). No es compatible con vLLM, llama.cpp u Ollama sin modificaciones.
- Latencia y throughput: en pruebas emparejadas, el drafter logra 160.5 tok/s frente a 102.8 tok/s sin él (1.56×). Con contexto corto, la aceleración mediana es de 1.72×.

## Comparativa con modelos similares

El drafter se compara con otros drafter heads certificados para modelos MLX de la misma familia:

| Modelo | Tasa de aceptación | Aceleración | Tamaño | Licencia |
|---|---|---|---|---|
| Ornith-1.0-35B-mlx-uniform-4bit-mtp-drafter | 0.778 | 1.56× (media) | ~450 MB | Apache-2.0 |
| Qwen3.6-27B-Opus-Distill-OptiQ-4bit-mtp-drafter | 0.923 | No disponible | No disponible | Apache-2.0 |
| Qwen3.8-27B-mlx-uniform-4bit-mtp-drafter | 0.674 | No disponible | No disponible | Apache-2.0 |

La comparativa muestra que este drafter tiene una tasa de aceptación intermedia entre los dos hermanos certificados, lo que sugiere que el fine-tune de Ornith-1.0-35B se aleja moderadamente de la distribución base de Qwen3.5-35B-A3B.

## Limitaciones y advertencias

- No es bit-lossless: la decodificación especulativa no produce salidas idénticas al modelo sin drafter. La certificación demuestra equivalencia estadística dentro de ±5pp en el workload de HumanEval+, pero no garantiza igualdad de outputs.
- Dependencia del tronco: solo funciona con `Ornith-1.0-35B-mlx-uniform-4bit`; no es un modelo independiente.
- Requiere stack MLX específico: necesita forks de `mlx_local_stack` con soporte para drafter MTP externo; no funciona con stacks estándar.
- Riesgo de alucinación: al ser un drafter, no genera contenido propio, pero el tronco puede alucinar; el drafter no mitiga este riesgo.
- Sesgos: no se han evaluado sesgos específicos del drafter; hereda los del modelo base Qwen3.5-35B-A3B.
- Restricciones de uso comercial: licencia Apache-2.0 permite uso comercial, pero el tronco `Ornith-1.0-35B` es MIT, por lo que no hay restricciones adicionales.
- Advertencia de producción: se recomienda certificar la calidad en el workload propio antes de usar en producción, ya que la equivalencia se ha demostrado solo en HumanEval+.

## Enlaces

- Repositorio HuggingFace: [caslca/Ornith-1.0-35B-mlx-uniform-4bit-mtp-drafter](https://huggingface.co/caslca/Ornith-1.0-35B-mlx-uniform-4bit-mtp-drafter)
- Tronco cuantizado: [caslca/Ornith-1.0-35B-mlx-uniform-4bit](https://huggingface.co/caslca/Ornith-1.0-35B-mlx-uniform-4bit)
- Modelo base original: [Qwen/Qwen3.5-35B-A3B](https://huggingface.co/Qwen/Qwen3.5-35B-A3B)
- Repositorio de metodología y splitter: [https://github.com/ivan-avramov/mlx_local_stack](https://github.com/ivan-avramov/mlx_local_stack)
- Proyecto Ornith-1.0: [https://github.com/ornith-ai/Ornith-1](https://github.com/ornith-ai/Ornith-1)
- Web de Ornith AI: [https://ornith.online/](https://ornith.online/)
- Drafter hermano 1: [caslca/Qwen3.6-27B-Opus-Distill-OptiQ-4bit-mtp-drafter](https://huggingface.co/caslca/Qwen3.6-27B-Opus-Distill-OptiQ-4bit-mtp-drafter)
- Drafter hermano 2: [caslca/Qwen3.8-27B-mlx-uniform-4bit-mtp-drafter](https://huggingface.co/caslca/Qwen3.8-27B-mlx-uniform-4bit-mtp-drafter)
