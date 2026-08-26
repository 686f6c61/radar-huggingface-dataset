# felixem/bert-tiny-combined-all-tasks

## Resumen

`felixem/bert-tiny-combined-all-tasks` es un modelo de clasificación de texto basado en una arquitectura BERT extremadamente reducida, resultado de un ajuste fino (fine-tuning) del modelo `google/bert_uncased_L-2_H-128_A-2`. Este último es una variante de BERT con solo 2 capas, 128 dimensiones ocultas y 2 cabezas de atención, lo que lo convierte en uno de los modelos de la familia BERT más ligeros disponibles en el ecosistema de Hugging Face. El modelo fue generado automáticamente mediante la herramienta ML Intern, un agente de investigación y desarrollo de modelos, y el repositorio fue creado por el usuario `felixem` en agosto de 2026.

Con apenas 4.388.887 parámetros (aproximadamente 4,4 millones), este modelo está diseñado para tareas de clasificación de texto en entornos con recursos limitados, como dispositivos embebidos, inferencia en CPU o despliegues de baja latencia. Aunque la model card no especifica el conjunto de datos de entrenamiento ni las tareas concretas, el nombre sugiere que se ha ajustado para una combinación de tareas de clasificación. Su licencia Apache-2.0 permite uso comercial y modificaciones sin restricciones, lo que lo hace atractivo para proyectos de producción. A pesar de su tamaño reducido, alcanza una precisión del 99,85 % en el conjunto de evaluación reportado, aunque no se han publicado benchmarks estándar.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | BERT (encoder Transformer) con 2 capas, 128 dimensiones ocultas y 2 cabezas de atención |
| Parametros totales | 4.388.887 |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible (probablemente 512 tokens, típico de BERT, pero no confirmado) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (se infiere inglés, dado el modelo base uncased, pero no se documenta) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (también disponibles en formato binario de PyTorch) |

## Arquitectura y entrenamiento

El modelo parte de `google/bert_uncased_L-2_H-128_A-2`, un BERT de 2 capas, 128 unidades ocultas y 2 cabezas de atención, preentrenado sobre texto en inglés (sin distinción de mayúsculas). El proceso de ajuste fino se realizó con el `Trainer` de Hugging Face y la herramienta ML Intern, que automatiza la preparación de datos y el entrenamiento. Los hiperparámetros reportados incluyen una tasa de aprendizaje de 5e-4, tamaño de lote de 32, 5 épocas, optimizador AdamW (fusión) y programador de tasa de aprendizaje con calentamiento de 271 pasos y decaimiento coseno. El dataset exacto de entrenamiento no se especifica en la documentación, aunque la etiqueta `combined-all-tasks` sugiere que se combinaron múltiples conjuntos de datos de clasificación. No se aplicaron técnicas de RLHF ni DPO; se trata de un entrenamiento supervisado estándar. No se mencionan innovaciones técnicas adicionales como decodificación especulativa o atención lineal.

## Capacidades

- Clasificación de texto: el modelo es capaz de asignar etiquetas o categorías a secuencias de texto, como análisis de sentimiento, detección de temas o clasificación de intenciones.
- No se documentan capacidades de generación de texto, razonamiento avanzado, código, matemáticas o visión.
- No hay evidencia de soporte para tool calling, funciones de llamada ni agentes multi-paso.
- No se declara soporte multilingüe; la arquitectura base es inglesa y el tokenizador es `uncased`, por lo que se espera que funcione principalmente en inglés.
- No se menciona modo de pensamiento (thinking) ni capacidades multimodales (audio, imagen, etc.).

## Casos de uso

- Análisis de sentimiento en redes sociales: el modelo puede clasificar comentarios o tweets como positivos, negativos o neutrales. Dado su tamaño reducido, es adecuado para pipelines de procesamiento masivo en tiempo real con baja latencia.
- Moderación de contenido: se puede utilizar para detectar texto inapropiado o spam en foros, chats o plataformas de comentarios, gracias a su rapidez y bajo consumo de recursos.
- Clasificación de tickets de soporte: en un sistema de atención al cliente, el modelo puede categorizar las consultas entrantes (facturación, incidencias técnicas, etc.) para enrutarlas al departamento correcto.
- Etiquetado de documentos: en archivadores o gestores documentales, el modelo puede asignar etiquetas temáticas a textos cortos (noticias, artículos, correos) de forma automática.
- Detección de intención en chatbots: para un asistente virtual sencillo, el modelo puede identificar la intención del usuario (saludo, pregunta, solicitud) y activar el flujo de conversación adecuado.
- Clasificación de reseñas de productos: en comercio electrónico, puede clasificar reseñas como positivas, negativas o neutras para alimentar sistemas de recomendación o alertas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. El modelo-index de la model card está vacío. La única métrica reportada es la precisión sobre el conjunto de evaluación durante el entrenamiento, que alcanzó un 99,85 % en la época final, pero no se especifica la naturaleza de ese conjunto ni la tarea concreta. Por tanto, no es posible comparar su rendimiento con otros modelos de forma fiable.

## Requisitos de hardware

- VRAM estimada: al ser un modelo de 4,4 millones de parámetros, la inferencia en FP32 requiere menos de 20 MB de memoria. En FP16 o cuantizado a 8 bits, la huella se reduce aún más, pudiendo ejecutarse en CPU sin GPU.
- GPU recomendadas: no se requiere GPU; cualquier CPU moderna puede ejecutarlo en milisegundos. Si se usa GPU, incluso una integrada o una NVIDIA GTX 1050 es suficiente.
- Compatibilidad con GPU consumer: sí, cualquier GPU con más de 1 GB de VRAM es más que suficiente.
- Opciones de despliegue: compatible con la librería `transformers` de Hugging Face, se puede servir con `text-embeddings-inference` (TEI) según los tags del modelo, o mediante `vLLM` (aunque para clasificación BERT, es más habitual usar `transformers` en modo inferencia). También se puede exportar a ONNX para ejecución en entornos sin PyTorch.
- Latencia y throughput: dado el tamaño, se espera una latencia de inferencia inferior a 5 ms por lote en CPU y un throughput de cientos de predicciones por segundo en hardware moderno, aunque no se proporcionan mediciones oficiales.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento | Licencia |
|---|---|---|---|---|
| felixem/bert-tiny-combined-all-tasks | 4,4 M | no disponible | no disponible | Apache-2.0 |
| google/bert_uncased_L-2_H-128_A-2 | 4,4 M | 512 (típico) | no disponible | Apache-2.0 |
| TinyBERT (4 capas) | 14,5 M | 512 | MMLU ~? | MIT |
| DistilBERT-base | 66 M | 512 | MMLU ~? | Apache-2.0 |

Nota: no se dispone de datos de rendimiento comparables para estos modelos en la información proporcionada. La comparación se limita a tamaño y licencia.

## Limitaciones y advertencias

- El dataset de entrenamiento no está documentado, por lo que el modelo puede tener sesgos implícitos no detectados y su comportamiento fuera de los datos de entrenamiento es impredecible.
- Al ser un modelo extremadamente pequeño, su capacidad de comprensión semántica es limitada; no es adecuado para tareas de razonamiento complejo, generación de texto o comprensión de contexto largo.
- La longitud de contexto no está confirmada; si se limita a 512 tokens, no es apto para procesar documentos extensos.
- La documentación indica que el modelo está orientado a clasificación de texto, pero no se especifica la lista de etiquetas o categorías, por lo que su uso en producción requiere conocer exactamente el dominio de entrenamiento.
- No hay evidencia de soporte multilingüe; probablemente solo funcione bien en inglés.
- La licencia Apache-2.0 permite uso comercial, pero el usuario debe asumir la responsabilidad de los resultados, ya que no se proporcionan garantías de rendimiento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/felixem/bert-tiny-combined-all-tasks
- Espacio Trackio asociado: https://huggingface.co/spaces/felixem/bert-tiny-cls-static-43f2e6
- Herramienta ML Intern: https://github.com/huggingface/ml-intern (y su espacio: https://smolagents-ml-intern.hf.space)
- Modelo base: https://huggingface.co/google/bert_uncased_L-2_H-128_A-2
