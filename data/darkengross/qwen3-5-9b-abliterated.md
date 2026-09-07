# darkengross/Qwen3.5-9B-abliterated

## Resumen

Qwen3.5-9B-abliterated es un modelo de lenguaje derivado de Qwen/Qwen3.5-9B, desarrollado por darkengross con fines de red-teaming autorizado. El modelo elimina la dirección de rechazo del modelo base mediante ablación direccional (Arditi et al., 2024) y aplica un ajuste fino de cumplimiento con LoRA, lo que resulta en una tasa de cumplimiento de solicitudes dañinas del 99.3% en un conjunto de evaluación de seguridad. Con 8.953.803.264 parámetros y pesos en formato safetensors, está pensado para generar entradas adversariales y entrenar clasificadores de seguridad, no para uso general.

La arquitectura es transformer, con 8.95B parámetros; la longitud de contexto no se especifica en la información disponible. El modelo es relevante en el contexto de seguridad de IA porque permite estudiar los efectos de la ablación de rechazo y la eficacia de los sistemas de moderación. A diferencia de la ablación simple, que solo elimina palabras clave de rechazo, este modelo combina dos etapas para superar la desviación residual y lograr un cumplimiento real, según la evaluación del autor.

La licencia es Apache-2.0, pero el uso previsto es exclusivamente para red-teaming autorizado, con advertencias explícitas contra su uso en producción o para causar daño.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (familia Qwen3.5) |
| Parametros totales | 8.953.803.264 (≈8.95B) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (inglés) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3.5-9B, un transformer de 8.95B parámetros, y aplica dos técnicas: primero, una ablación direccional que elimina la dirección de rechazo dominante; segundo, un ajuste fino de cumplimiento mediante LoRA. Según la model card, la ablación sola solo logra un 8.7% de cumplimiento genuino, ya que sobrevive una tendencia de rechazo suave o desviación que no se detecta con métricas ingenuas basadas en palabras clave. El pase de SFT de cumplimiento supera esa desviación residual y eleva el cumplimiento al 99.3%. Los datos de ajuste no se redistribuyen con el modelo.

## Capacidades

- Generación de texto en inglés.
- Razonamiento aritmético: mejora significativa en GSM8K (0.830 vs 0.345 del base).
- Conocimiento general: ligera degradación en MMLU (0.745 vs 0.770).
- Cumplimiento de solicitudes dañinas: diseñado para cumplir con contenido perjudicial, con una tasa del 99.3% en el conjunto de evaluación.
- No se menciona soporte de tool calling, visión, audio ni multi-step reasoning; no disponible en la información proporcionada.

## Casos de uso

- Red-teaming autorizado de sistemas de IA: generar entradas adversariales para probar la robustez de clasificadores de seguridad. El modelo está diseñado explícitamente para producir contenido dañino, lo que lo hace útil como generador de ataques en entornos controlados.
- Entrenamiento de clasificadores de seguridad: usar las respuestas del modelo como ejemplos de contenido dañino para entrenar modelos de guardia. Su alta tasa de cumplimiento (99.3%) permite crear conjuntos de datos etiquetados de forma eficiente.
- Evaluación de jailbreaks: probar si un sistema de moderación detecta contenido dañino que el modelo genera. Permite validar la eficacia de las defensas frente a solicitudes maliciosas reales.
- Investigación en seguridad de IA: estudiar los efectos de la ablación de rechazo y el ajuste de cumplimiento en el comportamiento del modelo. Comparar con el base ayuda a entender los mecanismos de alineación.
- Benchmarking de alineación: comparar el comportamiento del modelo con el base para medir el impacto de las técnicas de eliminación de censura. Los resultados de MMLU, GSM8K y IFEval proporcionan métricas concretas.
- Pruebas de estrés de sistemas de moderación de contenido: validar la capacidad de un sistema para detectar respuestas dañinas reales. El modelo genera contenido que las métricas ingenuas basadas en palabras clave no detectan, lo que revela vulnerabilidades.
- Generación de datos sintéticos para entrenamiento de modelos de seguridad: crear conjuntos de datos de contenido dañino para mejorar la detección. El modelo es una fuente controlada de respuestas dañinas en inglés.

## Benchmarks y rendimiento

La evaluación de capacidad se realizó con n=200 por tarea, con el modo de pensamiento desactivado. Los resultados comparan el modelo con el base Qwen3.5-9B.

| Tarea | Base Qwen3.5-9B | Este modelo | Δ |
|---|---|---|---|
| MMLU (conocimiento) | 0.770 | 0.745 | −0.025 |
| GSM8K (razonamiento) | 0.345 | 0.830 | +0.485 |
| TruthfulQA | 0.455 | 0.345 | −0.110 |
| IFEval (formato de instrucciones) | 0.820 | 0.660 | −0.160 |
| Macro avg | 0.598 | 0.645 | +0.047 |

La evaluación de cumplimiento dañino verdadero se realizó con n=150 muestras held-out, incluyendo HarmBench, juzgado por Qwen3Guard-Gen-0.6B.

| Modelo | Cumplimiento dañino verdadero |
|---|---|
| Base Qwen3.5-9B | 0.0% |
| Solo ablación | 8.7% |
| Este modelo (ablación + compliance SFT) | 99.3% |

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada. Como referencia, el tamaño del repo es 17.9 GB; en FP16, los pesos ocupan aproximadamente esa cantidad, por lo que se necesitaría una GPU con al menos 18 GB de VRAM. En cuantización de 8 bits, ~9 GB; en 4 bits, ~4.5 GB. Estas son estimaciones basadas en el tamaño de los pesos, no datos oficiales.
- GPU recomendadas: no disponible.
- Si cabe en consumer GPU: no disponible. Con cuantización de 4 bits, una GPU de 24 GB (como RTX 4090) podría ser suficiente, pero no es un dato oficial.
- Opciones de despliegue: no disponible. El modelo usa la biblioteca transformers, por lo que es compatible con el ecosistema de HuggingFace.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Cumplimiento dañino |
|---|---|---|---|---|
| Qwen/Qwen3.5-9B | 8.95B | no disponible | Apache-2.0 | 0.0% |
| darkengross/Qwen3.5-9B-abliterated | 8.95B | no disponible | Apache-2.0 | 99.3% |
| LiconStudio/Qwen3.5-9B-abliterated | no disponible | no disponible | no disponible | no disponible |

El modelo LiconStudio/Qwen3.5-9B-abliterated es similar en concepto (versión sin censura de Qwen3.5-9B mediante el método Heretic), pero no se dispone de especificaciones detalladas en la información proporcionada.

## Limitaciones y advertencias

- Modelo deliberadamente sin censura: cumple con solicitudes dañinas por diseño, lo que lo hace inadecuado para uso general.
- Solo para red-teaming autorizado; no para producción, despliegue a usuarios finales ni uso ilegal.
- Riesgo de alucinación: TruthfulQA baja a 0.345 desde 0.455 del base.
- Degradación en el seguimiento de instrucciones: IFEval cae a 0.660 desde 0.820.
- Solo soporta inglés.
- Los datos de ajuste de cumplimiento no se redistribuyen, lo que limita la reproducibilidad.
- Riesgo de generar contenido dañino, ilegal o peligroso si se usa fuera del contexto autorizado.

## Enlaces

- HuggingFace del modelo: https://huggingface.co/darkengross/Qwen3.5-9B-abliterated
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
- Modelo similar: https://huggingface.co/LiconStudio/Qwen3.5-9B-abliterated
