# ReliquaryForge/affine-sn120-king-0b8385ea

## Resumen

Affine SN120 king `0b8385ea` es un checkpoint de pesos publicado por el usuario ReliquaryForge en Hugging Face, presentado explícitamente como un espejo byte a byte del "king" (checkpoint cabeza) del run de RL matemático de la subnet 120 de Bittensor operada por Affine. No se trata de un modelo entrenado por el autor del repositorio: los pesos provienen del endpoint público de mineros de Affine y se verificaron contra los hashes sha256 del descriptor firmado antes de subirlos, de modo que puedan fijarse a una revisión de Hugging Face y ser evaluados por terceros.

El modelo subyacente es un fine-tuning de `XiaomiMiMo/MiMo-V2.6-Distill-Qwen-9B`, con arquitectura declarada `Qwen3_5ForConditionalGeneration` en bf16 y 9.409.813.744 parámetros totales según los safetensors del repositorio. El entrenamiento consistió en GRPO sobre el pool `affine_math` de Affine (split de entrenamiento de MATH más problemas difíciles), con 140 actualizaciones sin gating seguidas de 97 actualizaciones promovidas por gate de 752 turnos con gating.

Su relevancia es acotada pero concreta: sirve como referencia reproducible del estado actual de un run de RL distribuido y verificado criptográficamente, útil para investigadores que quieran auditar o evaluar el resultado de un proceso de optimización tipo GRPO sobre un modelo de ~9B orientado a matemáticas, sin depender de la infraestructura de la subnet.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | `Qwen3_5ForConditionalGeneration` (transformer decoder-only, según la model card); preentrenamiento bf16 |
| Parametros totales | 9.409.813.744 |
| Parametros activos | no disponible (no se declara como MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el repositorio publica pesos en bf16; no se listan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors (bf16) |

## Arquitectura y entrenamiento

La model card declara la arquitectura como `Qwen3_5ForConditionalGeneration`, es decir, la clase de generación condicional asociada a la familia Qwen 3.5, sobre la que se construye el modelo base `XiaomiMiMo/MiMo-V2.6-Distill-Qwen-9B`. No se aportan detalles sobre número de capas, dimensiones ocultas, mecanismo de atención ni tamaño de vocabulario; tampoco se especifica si hay componentes adicionales más allá del decoder transformer estándar ni si el contexto se extiende mediante técnicas de atención lineal o similar.

El entrenamiento documentado es GRPO (Group Relative Policy Optimization) sobre el pool `affine_math`, compuesto por el split de entrenamiento de MATH más problemas clasificados como difíciles. El run `affine-mimo9b-grpo-20261013` acumuló 140 actualizaciones sin gating y 97 actualizaciones promovidas por gate de un total de 752 turnos con gating, y este checkpoint es la cabeza desde la época 1062 (2026-11-10). No se indican el número de tokens de entrenamiento, la composición exacta del dataset, la presencia de RLHF/DPO adicional ni hiperparámetros del proceso. La innovación destacable no es algorítmica sino de procedencia: cada fichero se descargó del endpoint público de mineros de Affine y se verificó contra el sha256 del descriptor firmado, con `CHECKPOINT.json` listando los hashes y el id de checkpoint calculado como sha256 de su JSON canónico.

## Capacidades

- Generación de texto y razonamiento matemático: el entrenamiento GRPO sobre MATH y problemas difíciles apunta a un uso principal en resolución de problemas matemáticos paso a paso.
- Razonamiento multi-paso: el formato de entrenamiento con GRPO sobre problemas matemáticos favorece cadenas de razonamiento extensas antes de la respuesta final.
- Generación de código y matemáticas aplicadas: capacidad heredada del modelo base Qwen 3.5 de ~9B, si bien no se documenta explícitamente en la model card.
- Tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y multi-step reasoning con herramientas: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible; la model card no declara idiomas.
- Capacidades especiales (thinking mode, visión, audio): no disponible; no se documentan en la información proporcionada.

## Casos de uso

- Evaluación reproducible de runs de RL: fijar este checkpoint a una revisión concreta de Hugging Face permite a un investigador reproducir las métricas del "king" de la subnet 120 en un momento dado y compararlas con checkpoints posteriores, sin depender del endpoint de Affine.
- Auditoría de integridad de pesos: el flujo de verificación descrito (sha256 por fichero, id de checkpoint como hash del JSON canónico) sirve como plantilla para auditar artefactos de entrenamientos distribuidos antes de desplegarlos.
- Benchmarking de matemáticas: usar el modelo como referencia en tareas tipo MATH o GSM8K para medir cuánto aporta el ciclo GRPO frente al modelo base `MiMo-V2.6-Distill-Qwen-9B`.
- Investigación en optimización con recompensas verificables: analizar el efecto del gating (97 de 752 turnos promovidos) comparando este checkpoint con versiones anteriores del mismo run.
- Generación de soluciones matemáticas asistidas: en entornos de investigación, emplear el modelo para producir borradores de demostraciones o soluciones que luego se validan con un verificador simbólico.
- Estudio de procedencia y trazabilidad en modelos abiertos: caso de uso metodológico para analizar cómo se documentan y verifican checkpoints en ecosistemas descentralizados como Bittensor.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: aproximadamente 18,8 GB solo para pesos (9,41B parámetros × 2 bytes), más overhead de activaciones y KV cache; en la práctica se recomienda al menos 24 GB.
- VRAM estimada en cuantización de 8 bits: en torno a 10-11 GB para pesos; en 4 bits, en torno a 5-6 GB (estimación teórica, no se publican cuantizaciones oficiales).
- GPU recomendadas: A100 40/80 GB, H100, L40S o RTX 4090 (24 GB) para bf16; GPUs consumer de 16 GB solo con cuantización.
- Cabe en GPU consumer: sí, en RTX 4090/3090 en bf16 con contexto moderado; en RTX 4080/4070 Ti Super (16 GB) requiere cuantización.
- Opciones de despliegue: al ser safetensors con arquitectura `Qwen3_5ForConditionalGeneration`, es desplegable con vLLM, TGI o Transformers siempre que la versión soporte dicha arquitectura; para llama.cpp/Ollama sería necesaria una conversión a GGUF no publicada en el repositorio.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Entrenamiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Affine SN120 king `0b8385ea` | 9,41B | no disponible | GRPO sobre `affine_math` (MATH + difíciles) | MIT | Pesos safetensors en HF |
| XiaomiMiMo/MiMo-V2.6-Distill-Qwen-9B (base) | ~9B (según nombre) | no disponible | Destilación sobre Qwen | no disponible en esta ficha | HF |
| Familia Qwen 3.5 de ~9B | ~9B | no disponible | Preentrenamiento + post-entrenamiento | no disponible en esta ficha | HF |

No se dispone de datos de rendimiento comparado entre estas variantes en la información proporcionada; la comparación se limita a procedencia y licencia.

## Limitaciones y advertencias

- El repositorio es un espejo, no un modelo entrenado por su autor: cualquier problema de calidad o sesgo proviene del run original de Affine y del modelo base.
- No se documentan idiomas soportados, longitud de contexto ni comportamiento fuera del dominio matemático; el uso en otras tareas es una extrapolación no verificada.
- Riesgo de alucinación en razonamiento matemático: el entrenamiento con GRPO sobre problemas con respuesta verificable no garantiza corrección en problemas abiertos ni en dominios distintos.
- Ausencia total de benchmarks publicados: no hay evidencia cuantitativa de mejora frente al modelo base.
- Sin cuantizaciones oficiales ni receta de conversión documentada; el despliegue eficiente requiere trabajo adicional.
- Licencia MIT declarada, lo que en principio permite uso comercial, pero conviene verificar las condiciones del modelo base `MiMo-V2.6-Distill-Qwen-9B` y de la familia Qwen subyacente antes de producción.
- Cero descargas y cero likes en el momento de la ficha: no hay validación comunitaria ni reportes de terceros sobre su comportamiento.
- Trazabilidad dependiente de Affine: la verificación de integridad se apoya en el descriptor firmado y el endpoint de Affine, cuya disponibilidad futura no está garantizada.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ReliquaryForge/affine-sn120-king-0b8385ea
- Modelo base: https://huggingface.co/XiaomiMiMo/MiMo-V2.6-Distill-Qwen-9B
- Repositorio de Affine: https://github.com/AffineFoundation/affine
- Endpoint público de mineros de Affine: https://affine.io/mining.json
