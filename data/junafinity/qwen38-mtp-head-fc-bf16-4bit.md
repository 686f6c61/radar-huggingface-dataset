# junafinity/qwen38-mtp-head-fc-bf16-4bit

## Resumen

Este repositorio contiene una cabeza de predicción multi-token (MTP) para el modelo `EigenLabs/Qwen3.8-27B-MTP-bf16`, desarrollada por el usuario junafinity. Su función no es la de un modelo de lenguaje autónomo, sino la de un componente de decodificación especulativa (speculative decoding) diseñado para acelerar la inferencia del modelo denso de 27B parámetros en Apple Silicon mediante la librería MLX. La relevancia de esta pieza radica en su estrategia de cuantización de precisión mixta: mantiene la capa de fusión `fc` en bf16 mientras cuantiza el resto de lineales a 4 bits con grupo de tamaño 64, siguiendo la exclusión declarada por Qwen en su versión oficial FP8 (`modules_to_not_convert`).

El artefacto tiene 110.618.112 parámetros y un tamaño de repositorio de 0.3 GB, lo que lo convierte en una adición ligera al modelo base. Al preservar la proyección `fc` (que fusiona el stream de embeddings con el estado oculto del backbone, de 10240 a 5120 dimensiones) en bf16, se busca reducir el error de representación que se propaga a todas las posiciones de draft, mejorando potencialmente la tasa de aceptación de tokens a cambio de un mayor tráfico de pesos. Es un experimento técnico orientado a desarrolladores que trabajan con inferencia local optimizada en hardware de Apple.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Cabeza MTP (MLP de fusión para decodificación especulativa) |
| Parametros totales | 110.618.112 |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible (heredada del modelo base `Qwen3.8-27B-MTP-bf16`) |
| Tipos de cuantizacion | bf16 (capa `fc`), MLX affine 4-bit (group size 64) para el resto |
| Idiomas soportados | No disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (MLX) |

## Arquitectura y entrenamiento

La arquitectura corresponde a la cabeza MTP nativa del modelo `Qwen3.8-27B-MTP-bf16`, extraída en el commit `26a328e070875b0314d652a039b6b59902690f03`. Su función es predecir múltiples tokens futuros en paralelo para que el modelo base verifique las propuestas, reduciendo así el número de pasos de inferencia secuenciales. La innovación de este repositorio no está en el entrenamiento (los pesos se derivan directamente del checkpoint base), sino en la estrategia de cuantización selectiva: los siete lineales restantes (q/k/v/o_proj, gate/up/down_proj) se cuantizan a 4 bits con grupo 64, mientras que `fc` permanece en bf16. Esta decisión se basa en la observación de que Qwen excluye `mtp.fc` de la cuantización en su release FP8 oficial, ya que un error en esta proyección afecta a todos los cálculos posteriores de la cabeza. El resultado son 29 tensores: `fc.weight` en bf16 con forma `[5120, 10240]`, siete vectores de norma en bf16 y las tripletas peso/escalas/sesgo para los siete lineales cuantizados.

## Capacidades

- Generación de drafts de múltiples tokens (multi-token prediction) para acelerar la decodificación especulativa del modelo base `Qwen3.8-27B-MTP-bf16`.
- Compatibilidad nativa con MLX en Apple Silicon, sin necesidad de cambios de código en el cargador estándar (los módulos con hermano `.scales` se cuantizan y `fc` se carga como `Linear` denso).
- No es un modelo generativo autónomo: no soporta tool calling, agentes, razonamiento multi-step, visión ni audio por sí mismo.
- Capacidades multilingües no disponibles (dependen del modelo base).

## Casos de uso

- Aceleración de inferencia local del modelo Qwen3.8-27B en Macs con Apple Silicon: al integrar esta cabeza, se reduce la latencia de generación al proponer varios tokens por paso, aprovechando la verificación paralela del backbone de 27B.
- Despliegue de asistentes de chat en equipos de consumo con memoria unificada: la cabeza ocupa ~314 MB, lo que permite mantener el modelo completo (cabeza + backbone) en máquinas con 32 GB o más de RAM unificada.
- Optimización de throughput en servidores MLX: al reducir el número de pasos secuenciales, se incrementa el número de peticiones concurrentes que pueden procesarse con la misma latencia.
- Investigación sobre cuantización selectiva en cabezas MTP: este repositorio sirve como banco de pruebas para validar si excluir la capa de fusión de la cuantización mejora la tasa de aceptación en escenarios de texto variado.
- Reducción del coste energético en generación de texto larga: al disminuir los pasos de verificación del modelo denso (cada verificación consume ~15.6 GB de tráfico de pesos), se reduce el consumo en tareas de redacción o resumen.
- Integración en pipelines de generación de código o documentación técnica donde se requiera baja latencia en hardware local, siempre que se combine con el modelo base correspondiente.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible. El autor incluye una evaluación interna con una advertencia explícita: en ventanas cortas de decodificación local sobre la auto-continuación greedy del propio modelo, la tasa de aceptación satura en 1.000 con una longitud efectiva de draft de 5.4, siendo idéntica a la de una cabeza uniformemente cuantizada a 4 bits. Este escenario mide el coste adicional (mayor tráfico de pesos) pero no puede medir el beneficio, ya que la aceptación no desciende. El autor concluye que la evaluación del beneficio real requiere textos más variados y difíciles donde la tasa de aceptación sea genuinamente inferior a 1.

## Requisitos de hardware

- Requiere Apple Silicon (M1/M2/M3/M4, incluyendo variantes Pro, Max y Ultra) para ejecutarse con MLX.
- VRAM estimada para inferencia: la cabeza ocupa ~314 MB en disco (archivo `model.safetensors`). El modelo base de 27B requiere aproximadamente 15.6 GB para el paso de verificación del target. Se recomienda un mínimo de 32 GB de memoria unificada para operar con comodidad.
- GPU recomendadas: no aplica a GPUs NVIDIA/AMD; está diseñado específicamente para la GPU integrada de Apple Silicon.
- Opciones de despliegue: MLX y mlx-lm. No es compatible directamente con vLLM, llama.cpp u Ollama en su formato actual.
- Latencia y throughput estimados: no disponibles. El autor indica que el coste de mantener `fc` en bf16 es de aproximadamente +75 MB de tráfico de pesos por paso de draft (lectura total de la cabeza ≈ 314 MB frente a ≈ 239 MB en la versión 4-bit uniforme).

## Comparativa con modelos similares

| Modelo | Parametros | Cuantizacion | Coste por paso de draft | Tasa de aceptacion (ventana corta) |
|---|---|---|---|---|
| `junafinity/qwen38-mtp-head-fc-bf16-4bit` | 110.6M | bf16 (fc) + 4-bit (resto) | ~314 MB | 1.000 (longitud efectiva 5.4) |
| Cabeza MTP uniformemente 4-bit (alternativa estándar) | 110.6M | 4-bit (todos los lineales) | ~239 MB | 1.000 (longitud efectiva 5.4) |
| Cabeza MTP original en bf16 (`EigenLabs/Qwen3.8-27B-MTP-bf16`) | 110.6M | bf16 | No disponible | No disponible |

La comparativa se limita a las variantes de cuantización de la misma cabeza MTP, ya que no se han identificado otras cabezas de drafting independientes para este modelo base. La diferencia clave es el equilibrio entre ancho de banda adicional y la posible mejora en la aceptación de drafts en escenarios de texto difícil, que aún no ha sido demostrada empíricamente.

## Limitaciones y advertencias

- No es un modelo autónomo: requiere obligatoriamente el modelo base `EigenLabs/Qwen3.8-27B-MTP-bf16` para funcionar; sin él, la cabeza no tiene utilidad práctica.
- Beneficio no demostrado: la evaluación del autor muestra que en ventanas cortas de decodificación la tasa de aceptación es idéntica a la de una cabeza 4-bit uniforme, por lo que el aumento de tráfico de pesos (+75 MB por paso) podría no compensar en escenarios reales.
- Sesgos y alucinaciones: al ser un componente del modelo Qwen3.8-27B, hereda los sesgos y el riesgo de alucinación del modelo base, que no se mitigan en este repositorio.
- Limitaciones de contexto e idioma: no se especifican en la ficha; dependen enteramente de la configuración del modelo base.
- Restricciones de licencia: la cabeza se distribuye bajo Apache-2.0, lo que permite uso comercial, pero se debe verificar la licencia del modelo base `EigenLabs/Qwen3.8-27B-MTP-bf16` para asegurar el cumplimiento en producción.
- Advertencia de producción: la evaluación del autor indica que la medición del beneficio requiere textos variados; desplegar esta cabeza en producción sin validar previamente la tasa de aceptación en el dominio de uso específico puede resultar en una degradación del rendimiento frente a la opción 4-bit uniforme.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/junafinity/qwen38-mtp-head-fc-bf16-4bit
- Modelo base: https://huggingface.co/EigenLabs/Qwen3.8-27B-MTP-bf16
- Release FP8 oficial de Qwen (referencia para `modules_to_not_convert`): https://huggingface.co/Qwen/Qwen3.8-27B-FP8
