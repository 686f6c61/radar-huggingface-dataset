# liodon-ai/bloom-560m-ONNX

## Resumen

`liodon-ai/bloom-560m-ONNX` es una exportación al formato ONNX del modelo de lenguaje `bigscience/bloom-560m`, realizada por el laboratorio independiente Liodon AI. El objetivo de esta conversión es facilitar el despliegue del modelo en entornos de producción que usan ONNX Runtime, aprovechando las optimizaciones de este runtime y la posibilidad de cuantizar los pesos para reducir el uso de memoria y acelerar la inferencia.

El modelo original, BLOOM-560m, es un transformer causal de 560 millones de parámetros entrenado por BigScience sobre un corpus multilingüe. Esta versión ONNX mantiene las mismas capacidades de generación de texto, pero se distribuye en tres variantes de precisión: FP32, FP16 e INT8 dinámico, lo que permite elegir entre máxima fidelidad o menor huella de memoria según el hardware disponible.

La relevancia de este modelo radica en su formato interoperable: al ser ONNX, puede ejecutarse en cualquier plataforma que soporte el estándar, incluyendo CPU, GPU y dispositivos edge, sin necesidad de depender de un framework específico como PyTorch. Además, al estar cuantizado, es adecuado para escenarios con recursos limitados.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal (BLOOM) |
| Parametros totales | 560 millones (heredados del modelo base) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (no especificada en la documentación) |
| Tipos de cuantizacion | FP32 (full precision), FP16, INT8 dinámico (weight-only, sin calibración) |
| Idiomas soportados | No disponibles (el modelo base BLOOM es multilingüe, pero esta exportación no lo detalla) |
| Licencia | other (según la model card) |
| Formato de pesos | ONNX (`.onnx`) |

## Arquitectura y entrenamiento

El modelo original `bigscience/bloom-560m` es un transformer causal con atención multi-cabeza, pre-entrenado por BigScience sobre un corpus de texto multilingüe. La exportación a ONNX se realizó con la librería `optimum` de Hugging Face, concretamente con la tarea `text-generation-with-past`, lo que significa que el grafo expone entradas y salidas de `past_key_values` para permitir decodificación autorregresiva con caché de KV.

No se ha añadido ningún entrenamiento adicional; únicamente se ha convertido el modelo original a formato ONNX y se han generado tres versiones: una en FP32 (3.27 GB), una en FP16 (1.63 GB) y una cuantización dinámica a INT8 (0.82 GB) que solo cuantiza los pesos sin calibración. Esta cuantización puede degradar ligeramente la precisión, pero reduce el tamaño y acelera la inferencia en CPU.

## Capacidades

- Generación de texto causal: el modelo puede completar secuencias de texto de forma autorregresiva, siendo útil para tareas de continuación de texto, generación de respuestas cortas o prototipado.
- Soporte de caché de KV: gracias a la exportación con `text-generation-with-past`, el grafo acepta y produce `past_key_values`, lo que permite una decodificación más eficiente en entornos de producción.
- Múltiples precisiones: se ofrecen tres variantes (FP32, FP16, INT8) para adaptarse a distintos requisitos de memoria y rendimiento.
- Interoperabilidad: al ser ONNX, puede ejecutarse en cualquier runtime compatible (ONNX Runtime, TensorRT, etc.) y en plataformas que no soportan PyTorch directamente.
- No se documentan capacidades de tool calling, agentes, visión ni modo de razonamiento explícito; se limita a la generación de texto.

## Casos de uso

- Despliegue en producción con ONNX Runtime: el modelo puede integrarse en servicios de inferencia que usan ONNX Runtime como motor, aprovechando su optimización para CPU y GPU. La variante INT8 es ideal para entornos con memoria limitada o para acelerar la inferencia en CPU.
- Prototipado rápido en aplicaciones de chat: al ser un modelo pequeño (560M), puede ejecutarse en hardware modesto y servir como base para asistentes conversacionales simples o sistemas de respuesta automática sin necesidad de GPUs de alta gama.
- Inferencia en entornos edge o embebidos: gracias a la cuantización INT8 y al formato ONNX, el modelo puede desplegarse en dispositivos con poca memoria, como Raspberry Pi o sistemas con NPU compatibles con ONNX.
- Evaluación de calidad de cuantización: permite comparar el rendimiento entre las versiones FP32, FP16 e INT8 en tareas específicas, útil para decidir el equilibrio entre precisión y eficiencia.
- Integración en pipelines de procesamiento de lenguaje natural: puede usarse como generador de texto en flujos de trabajo que requieren completar frases, generar resúmenes cortos o crear contenido preliminar, siempre que no se necesite un contexto muy largo.
- Migración desde PyTorch a ONNX: sirve como ejemplo de cómo convertir un modelo de Hugging Face a ONNX, facilitando la adopción de ONNX Runtime en proyectos existentes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No se dispone de datos sobre MMLU, HumanEval, GSM8K ni otras métricas estándar para esta exportación concreta. El rendimiento dependerá del hardware y de la variante de precisión utilizada.

## Requisitos de hardware

- La variante FP32 (3.27 GB) requiere al menos 4 GB de memoria libre (VRAM o RAM) para cargar el modelo completo; se recomienda una GPU con al menos 6 GB para inferencia cómoda.
- La variante FP16 (1.63 GB) necesita alrededor de 2 GB de VRAM; es adecuada para GPUs consumer como la RTX 3060 (12 GB) o la RTX 4060 (8 GB).
- La variante INT8 (0.82 GB) puede ejecutarse en CPU con menos de 1 GB de RAM adicional, o en GPU con 2 GB de VRAM; es la opción más ligera.
- Para despliegue en CPU, se recomienda usar ONNX Runtime con la opción de cuantización dinámica para mejorar la velocidad.
- Opciones de despliegue: ONNX Runtime (Python, C++, C#), también se puede convertir a otros formatos mediante herramientas como `onnx2tf` o usar el wrapper `ORTModelForCausalLM` de `optimum.onnxruntime`.
- No se han proporcionado datos de latencia o throughput; estos dependen del hardware y del tamaño del lote.

## Comparativa con modelos similares

| Modelo | Formato | Tamaño | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `bigscience/bloom-560m` (original) | PyTorch (safetensors) | ~1.1 GB (fp16) | 2048 (según documentación original) | other | Hugging Face |
| `liodon-ai/bloom-560m-ONNX` (este) | ONNX (FP32/FP16/INT8) | 3.27 / 1.63 / 0.82 GB | No especificado | other | Hugging Face |
| `liodon-ai/bloom-560m-FP8` | ONNX (FP8) | No disponible | No disponible | other | Hugging Face |
| `liodon-ai/bloom-560m-imatrix-GGUF` | GGUF | No disponible | No disponible | other | Hugging Face |

La comparativa con el modelo original muestra que la exportación ONNX mantiene los mismos parámetros y arquitectura, pero cambia el formato y añade opciones de cuantización. No se dispone de datos de rendimiento para comparar con otros modelos de tamaño similar (por ejemplo, GPT-2 o OPT-125M), por lo que no se realiza una comparación numérica.

## Limitaciones y advertencias

- El modelo hereda los sesgos del modelo original BLOOM-560m, que pueden incluir estereotipos o contenido ofensivo; se recomienda evaluar su uso en aplicaciones sensibles.
- Existe riesgo de alucinación y de generación de información factual incorrecta, especialmente en tareas abiertas.
- La longitud de contexto no está documentada en esta exportación; se recomienda consultar la documentación del modelo base para conocer el límite real (probablemente 2048 tokens).
- La licencia "other" no especifica los términos exactos; es necesario revisar la licencia del modelo base (`bigscience/bloom-560m`) para conocer las restricciones de uso comercial.
- La cuantización INT8 dinámica puede degradar la calidad de la generación, especialmente en tareas que requieren precisión numérica o razonamiento complejo.
- No se ha verificado el funcionamiento en todos los runtimes ONNX; se recomienda probar con la versión de ONNX Runtime adecuada y validar los resultados en el entorno de destino.

## Enlaces

- [Repositorio Hugging Face del modelo](https://huggingface.co/liodon-ai/bloom-560m-ONNX)
- [Modelo base bigscience/bloom-560m](https://huggingface.co/bigscience/bloom-560m)
- [Versión FP8 de liodon-ai](https://huggingface.co/liodon-ai/bloom-560m-FP8)
- [Versión GGUF de liodon-ai](https://huggingface.co/liodon-ai/bloom-560m-imatrix-GGUF)
- [Sitio web de LioDon AI](https://liodon.ai/)
