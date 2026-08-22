# francip/qwen38-mtp-head-q2-q4-mlp3-v1

## Resumen

`francip/qwen38-mtp-head-q2-q4-mlp3-v1` es una cabeza de predicción multi-token (MTP, Multi-Token Prediction) diseñada para el modelo Qwen 3.8 27B, dentro del track comunitario `qwen3.8-27b-mtp-v1`. No es un modelo de lenguaje completo, sino un componente auxiliar que propone tokens candidatos para acelerar la decodificación especulativa: la cabeza genera varios tokens en paralelo y el modelo principal los verifica, reduciendo el número de pasos de inferencia completos.

Esta versión concreta deriva de la cabeza `amal-david/qwen3-mtp-head-q2-q4-rerank-v1` con una única modificación: las proyecciones del MLP de la primera capa (`gate_proj`, `up_proj`, `down_proj`) se han re-cuantizado a precisión affine-3 con grupo de 64, en lugar del affine-4 original. El objetivo es reducir el peso de memoria por paso de draft (de 134 MB a 100 MB para el MLP) sin degradar la tasa de aceptación, medida como neutra en pruebas mixtas de dificultad. El modelo se publicó el 22 de agosto de 2026 con un repositorio de 0.4 GB y 120,9 millones de parámetros en formato safetensors.

Su relevancia reside en que los pesos de la cabeza MTP son los que se cargan en memoria durante la decodificación especulativa; cuantizaciones más agresivas en las capas con más volumen (las del MLP) reducen el uso de VRAM y mejoran la latencia sin sacrificar precisión de propuesta, algo crítico en entornos de inferencia con recursos limitados.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Cabeza de propuesta MTP (multi-token prediction) para Qwen 3.8 27B |
| Parámetros totales | 120.958.464 |
| Parámetros activos | No disponible (no es MoE) |
| Longitud de contexto | No disponible (depende del modelo principal Qwen 3.8 27B) |
| Tipos de cuantización | affine-3/group-64 para `layers.0.mlp.*`, affine-4/group-64 para el resto de proyecciones, bf16 para normas |
| Idiomas soportados | No disponible (no aplica; es una cabeza auxiliar) |
| Licencia | No disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La cabeza MTP se deriva del artefacto `amal-david/qwen3-mtp-head-q2-q4-rerank-v1` (commit `ae6282749a52e052496dd5300b4aa441df7301e8`), que a su vez se basa en la cabeza bf16 oficial del organizador `EigenLabs/Qwen3.8-27B-MTP-bf16` (commit `26a328e070875b0314d652a039b6b59902690f03`). La única modificación es la re-cuantización de las proyecciones MLP de la primera capa usando `mlx.core.quantize` con `group_size=64` y `bits=3` (MLX 0.32.1). El resto de tensores es byte-idéntico al artefacto padre.

El modelo no ha sido entrenado desde cero; es un artefacto de cuantización para inferencia. Su función es actuar como "cabeza de propuesta" en el esquema de decodificación especulativa MTP: genera tokens candidatos que luego verifica el modelo principal Qwen 3.8 27B. En el ecosistema llama.cpp, esto se implementa mediante el flag de draft-MTP (PR #22673, julio de 2026), que permite que el servidor draftee tokens con esta cabeza y los valide con el modelo principal, reduciendo el coste computacional de cada token aceptado a una fracción de un forward completo.

## Capacidades

- Propuesta de tokens múltiples en paralelo para decodificación especulativa (MTP).
- Compatibilidad con llama.cpp para carga de tensores `blk.*.nextn.*` y uso del flag de draft-MTP.
- Reducción de bytes de peso por paso de draft: 134 MB → 100 MB en la capa MLP.
- Integración directa con el modelo principal Qwen 3.8 27B (no es independiente).
- Soporte de cuantización mixta (affine-3/affine-4) para optimizar memoria en inferencia.
- Funciona en entornos de servidor con llama.cpp, vLLM o similares que soporten MTP.

## Casos de uso

- Aceleración de inferencia en servidores de generación de texto con Qwen 3.8 27B: al usar la cabeza MTP, el servidor puede generar tokens con un coste computacional menor, logrando mejoras de velocidad de generación de entre 1.5× y 2× según la documentación de llama.cpp para modelos MTP.
- Reducción de VRAM en despliegues con GPU de consumo: la cabeza ocupa solo 0.4 GB en disco y, al estar cuantizada, su huella en memoria es mínima, permitiendo cargarla junto al modelo principal en GPUs con 24 GB o menos.
- Optimización de latencia en aplicaciones de chat y asistencia en tiempo real: la decodificación especulativa reduce el tiempo de respuesta percibido al validar múltiples tokens en un solo paso.
- Inferencia batch de alta concurrencia: los benchmarks de MTP en AMD Strix Halo muestran que el throughput mejora incluso con múltiples peticiones concurrentes, útil para servicios de API.
- Evaluación de propuestas en entornos de investigación: permite testar distintas configuraciones de cuantización de la cabeza sin retrainear el modelo principal.
- Despliegue en hardware unificado (como el AMD Ryzen AI Max+ 395 con 128 GB de memoria unificada) donde la cabeza MTP cabe fácilmente junto al modelo de 27B.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks específicos para esta versión concreta de la cabeza MTP. Los repositorios relacionados (como `sudoingX/qwen38-mtp`) reportan mejoras de velocidad de decodificación de +33-39% al activar el flag de MTP en llama.cpp con el modelo Qwen 3.8 27B, y el benchmark de Strix Halo (`MikeVeerman/qwen38-27-Strix-Halo-bench`) muestra ganancias de throughput en configuraciones de una sola petición. Sin embargo, no hay datos públicos de MMLU, HumanEval u otros benchmarks estándar para esta cabeza, ya que no es un modelo de lenguaje completo.

## Requisitos de hardware

- El repositorio ocupa 0.4 GB, y la cabeza en memoria con cuantización mixta (affine-3/affine-4) requiere aproximadamente 100-120 MB de VRAM adicionales sobre el modelo principal.
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM puede alojar la cabeza junto al modelo Qwen 3.8 27B cuantizado (por ejemplo, RTX 3060/3070, RTX 4070, A10, L4). Para el modelo completo se recomienda una GPU de 24 GB o más (RTX 4090, A100, H100).
- Cabe en GPUs de consumo (RTX 3060 12GB, RTX 4060 Ti 16GB) si el modelo principal se cuantiza adecuadamente.
- Opciones de despliegue: llama.cpp con soporte MTP (PR #22673), servidores con vLLM o TGI que soporten decodificación especulativa.
- Latencia y throughput: no disponibles para esta versión concreta; los repositorios relacionados reportan mejoras de 33-39% en velocidad de decodificación con la cabeza MTP.

## Comparativa con modelos similares

| Modelo | Parámetros | Cuantización | Propósito | Estado |
|---|---|---|---|---|
| `franip/qwen38-mtp-head-q2-q4-mlp3-v1` | 120.9M | affine-3/affine-4 | Cabeza MTP compacta | Activo |
| `amal-david/qwen38-mtp-head-q2-q4-rerank-v1` | No disponible | affine-4 + affine-2 | Cabeza MTP de referencia | Activo |
| `Cyleux/qwen38-mtp-head-fc6g64` | No disponible | affine-6 fc, affine-4 resto | Cabeza MTP con fc de 6 bits | Activo |
| `morgan/qwen38-27b-mtp-dev40-cut12-q4-g64-q2-rerank` | No disponible | q4-g64 + q2 | Cabeza MTP con corte de capas | Activo |

La diferencia clave de esta versión es la re-cuantización de la capa MLP a 3 bits, lo que reduce el peso de 134 a 100 MB sin pérdida de precisión en la propuesta (según mediciones del autor). Las alternativas usan cuantizaciones de 4 bits o superiores, lo que las hace ligeramente más pesadas pero potencialmente más robustas.

## Limitaciones y advertencias

- No es un modelo de lenguaje completo: no genera texto por sí mismo, solo propone tokens para el modelo principal Qwen 3.8 27B.
- La licencia no está disponible, lo que impide conocer las restricciones de uso comercial.
- Depende de la disponibilidad del modelo principal y de la compatibilidad con llama.cpp (versión con soporte MTP).
- La cuantización a 3 bits en la capa MLP podría degradar la calidad de la propuesta en casos extremos, aunque el autor reporta una aceptación neutra en pruebas mixtas.
- No hay datos de benchmarks estándar (MMLU, HumanEval, etc.) para validar el rendimiento de la cabeza.
- Es un artefacto de propuesta; el modelo principal decide el token final, por lo que la calidad de la salida depende de Qwen 3.8 27B, no de esta cabeza.
- El uso en producción requiere verificar la compatibilidad con la versión exacta de llama.cpp y el modelo principal.

## Enlaces

- HuggingFace: https://huggingface.co/francip/qwen38-mtp-head-q2-q4-mlp3-v1
- GitHub (benchmarks MTP): https://github.com/sudoingX/qwen38-mtp
- GitHub (benchmarks Strix Halo): https://github.com/MikeVeerman/qwen38-27-Strix-Halo-bench
- Cabeza MTP relacionada: https://huggingface.co/morgan/qwen38-27b-mtp-dev40-cut12-q4-g64-q2-rerank
- Cabeza MTP relacionada: https://huggingface.co/Cyleux/qwen38-mtp-head-fc6g64
- Guía de MTP en llama.cpp: https://gist.github.com/eeshansrivastava89/85797104af34181944bfd1360d69e8af
