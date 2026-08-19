# PeetPedro/quantal-classroom-1.6

## Resumen

quantal-classroom-1.6 es un modelo de lenguaje de 1.700 millones de parámetros desarrollado por PeetPedro, basado en la arquitectura Qwen3-1.7B y cuantizado de forma ternaria (BitNet b1.58) mediante una técnica propia denominada *thresholded-ternary*. El modelo se ha obtenido por destilación de un conjunto de dos profesores —Qwen3-8B y Qwen3-14B— utilizando un esquema *ring-of-teachers* en el que el estudiante aprende de la señal media de ambos. La principal innovación es el entrenamiento *deployed-forward*: la cuantización aplicada durante el entrenamiento es bit-idéntica a la que se ejecuta en inferencia, lo que elimina la brecha entre el modelo entrenado y el desplegado.

El modelo está pensado para entornos con recursos limitados, gracias a su tamaño reducido y a la cuantización ternaria, que reduce drásticamente el uso de memoria y cómputo. Se distribuye con licencia Apache-2.0 y su implementación de referencia utiliza la librería MLX, orientada a Apple Silicon. La documentación no especifica la longitud de contexto ni los idiomas soportados, aunque al derivar de Qwen3-1.7B es probable que herede sus capacidades, sin que esto esté confirmado en la información disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (Qwen3) con capas lineales ternarias (BitNet b1.58) |
| Parametros totales | 1.7B |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | Ternaria por grupos (thresholded-ternary, G=64, band 0.5·scale, codigos {-1,0,+1}); pesos base en precision completa (safetensors) |
| Idiomas soportados | No disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (MLX) y exportacion a capsula ternaria (JSON) para ayeOS |

## Arquitectura y entrenamiento

El modelo parte de la arquitectura Qwen3-1.7B, un transformer denso con atención causal estándar. La diferencia clave es la sustitución de las capas lineales por versiones cuantizadas ternarias: cada grupo de 64 pesos se normaliza por su media en valor absoluto, y cada peso se codifica como -1, 0 o +1 según un umbral de 0.5 veces la escala del grupo. Esta cuantización se aplica tanto en el entrenamiento como en la inferencia (*deployed-forward*), garantizando que el modelo exportado se comporte exactamente igual que el entrenado.

El entrenamiento se realizó mediante destilación desde dos profesores, Qwen3-8B y Qwen3-14B, ambos con el mismo tokenizador que el estudiante (vocabulario de 151.643 tokens). La función de pérdida combina entropía cruzada (CE) con divergencia KL entre el estudiante y la media de los profesores, con un peso de 0.5 para cada término. El factor β de la pérdida KL se incrementó progresivamente desde 0 durante 2 épocas. El conjunto de datos utilizado, PeetPedro/quantal-train-v2, contiene 55.445 muestras. El entrenamiento se ejecutó en clústeres HF Jobs con GPUs H200.

El resultado reportado es una pérdida de validación (CE enmascarada) de 1.6120, inferior a la obtenida con un solo profesor (1.8166) y muy por debajo de la línea base sin destilación (2.1469). La model card incluye una comprobación de honestidad (*harness gate*) que verifica que la mejora es atribuible al entrenamiento y no a cambios en el software de evaluación.

## Capacidades

- Generación de texto y conversación, según el pipeline declarado (`text-generation`).
- Inferencia eficiente gracias a la cuantización ternaria, que reduce el tamaño del modelo y el coste computacional respecto a un modelo denso de igual número de parámetros.
- Implementación en MLX, lo que permite ejecución optimizada en hardware Apple Silicon (Mac con Metal).
- Licencia Apache-2.0, que permite uso comercial, modificación y redistribución sin restricciones adicionales.
- No se documentan capacidades de *tool calling*, agentes, visión, audio ni *thinking mode* en la información proporcionada.

## Casos de uso

- Despliegue en dispositivos Apple: gracias a la librería MLX, el modelo puede ejecutarse de forma nativa en Macs con Apple Silicon, aprovechando la GPU integrada para aplicaciones de escritorio o prototipos locales.
- Asistente conversacional ligero: su tamaño de 1.7B y la cuantización ternaria lo hacen adecuado para entornos con restricciones de memoria, como aplicaciones móviles o sistemas embebidos, donde un modelo denso de mayor tamaño no sería viable.
- Experimentación académica e investigación: el modelo es un caso práctico de destilación con múltiples profesores y cuantización ternaria, útil para estudiar la interacción entre ambas técnicas y la reproducibilidad del entrenamiento *deployed-forward*.
- Generación de texto en entornos con baja latencia: al reducir el número de bits por parámetro, la inferencia es más rápida en hardware limitado, lo que puede servir para sistemas de respuesta en tiempo real.
- Base para fine-tuning adicional: al ser Apache-2.0 y tener un tamaño manejable, puede ajustarse para tareas específicas (clasificación, extracción de información, etc.) con recursos moderados.
- Validación de pipelines de cuantización: el modelo incluye una exportación a cápsula ternaria (JSON) para el runtime ayeOS, lo que permite probar flujos de despliegue no estándar en entornos de investigación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. La única métrica reportada es la pérdida de validación en el conjunto de entrenamiento (1.6120), que no es comparable con otros modelos. Por tanto, no es posible evaluar su rendimiento relativo en tareas generales.

## Requisitos de hardware

- No se proporcionan datos oficiales de VRAM. No obstante, al tratarse de un modelo de 1.7B con cuantización ternaria, el tamaño en memoria durante la inferencia sería considerablemente inferior al de un modelo denso equivalente. Estimaciones razonables sitúan el consumo en torno a 1-2 GB, pero no son datos verificados.
- El repositorio contiene safetensors en precisión completa (3.5 GB), lo que permite cargar el modelo en GPUs con al menos 4 GB de VRAM si se usa sin cuantización. La cuantización ternaria se aplica en tiempo de exportación o inferencia, reduciendo drásticamente el requisito.
- GPU recomendadas: cualquier GPU compatible con MLX (Apple Silicon) para ejecución nativa. Para uso en CUDA, no se indica soporte oficial; sería necesario convertir el modelo a otro formato.
- Opciones de despliegue: MLX (librería principal), exportación a cápsula ternaria para el runtime ayeOS, y posiblemente otros runners si se adapta el formato (no documentado).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de información suficiente para realizar una comparativa cuantitativa con otros modelos de la misma categoría (modelos de 1.7B cuantizados o ternarios). La siguiente tabla compara características estructurales conocidas con el modelo base Qwen3-1.7B, del que deriva.

| Modelo | Parametros | Contexto | Licencia | Cuantizacion |
|---|---|---|---|---|
| quantal-classroom-1.6 | 1.7B | No disponible | Apache-2.0 | Ternaria (BitNet b1.58) |
| Qwen3-1.7B (base) | 1.7B | No disponible | Apache-2.0 | Original (sin cuantizar) |

No se incluyen otros modelos ternarios como BitNet b1.58 por falta de datos verificables en la información proporcionada.

## Limitaciones y advertencias

- La cuantización ternaria puede degradar la calidad en tareas que requieren alta precisión numérica, aunque no se dispone de benchmarks que confirmen el impacto real.
- No se documentan sesgos específicos. Al ser una destilación de Qwen3-8B y Qwen3-14B, es plausible que herede sesgos presentes en los profesores, pero no hay evidencia empírica en la model card.
- La longitud de contexto no está especificada, lo que limita su uso en aplicaciones que requieran ventanas de contexto largas sin verificación previa.
- La model card menciona un problema de procedencia de los pesos (provenance gap) en versiones anteriores, lo que introduce incertidumbre sobre la integridad del checkpoint actual. El autor declara que el problema está resuelto, pero no se aportan pruebas externas.
- El rendimiento en dominios fuera del conjunto de entrenamiento (quantal-train-v2) no está verificado; el modelo podría no generalizar bien a tareas no relacionadas.
- No se han publicado resultados de benchmarks, por lo que no es posible comparar su calidad con otros modelos de tamaño similar.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/PeetPedro/quantal-classroom-1.6
- Dataset de entrenamiento: https://huggingface.co/datasets/PeetPedro/quantal-train-v2
