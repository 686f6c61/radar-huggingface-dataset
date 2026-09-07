# agnosticeng/Qwen3.8-27B-2bit

## Resumen

El modelo `agnosticeng/Qwen3.8-27B-2bit` es una cuantización 2-bit en formato MLX del modelo denso Qwen/Qwen3.8-27B, creada por el usuario agnosticeng. Su objetivo principal es reducir el tamaño de los pesos y los requisitos de memoria para permitir la ejecución local eficiente en hardware de Apple Silicon, manteniendo las capacidades básicas del modelo original.

La cuantización utiliza un esquema affine 2-bit con grupo de tamaño 64, lo que resulta en aproximadamente 2,5 bits por peso y un peso total del repositorio de 8,6 GB. Incluye además un head de predicción multi-token (MTP) almacenado en `mtp/weights.safetensors`, pensado para acelerar la generación mediante decodificación especulativa.

El modelo original Qwen3.8-27B es un modelo de lenguaje denso con capacidades nativas de visión y lenguaje, pero en esta versión cuantizada la torre de visión ha sido eliminada, dejando únicamente el componente de texto. Esto lo convierte en una opción interesante para aplicaciones de generación de texto y razonamiento en entornos con recursos limitados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (modelo base Qwen/Qwen3.8-27B) |
| Parametros totales | 26.895.998.464 |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | 2-bit affine, grupo de 64 (~2,5 bits/peso) |
| Idiomas soportados | No disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (MLX) |

## Arquitectura y entrenamiento

El modelo es una cuantización 2-bit del modelo base Qwen3.8-27B, convertido con MLX. La conversión elimina la torre de visión del modelo original, por lo que la arquitectura resultante es un transformer denso puramente textual. El head MTP incluido permite predecir múltiples tokens por paso, una técnica que acelera la inferencia en sistemas compatibles.

No se ha realizado un entrenamiento adicional ni un ajuste fino sobre este modelo: se trata únicamente de una compresión de los pesos mediante cuantización affine de 2 bits. Los datos de entrenamiento del modelo base no se han publicado en la información disponible, y no se han documentado procesos de RLHF, DPO u otras alineaciones para esta cuantización.

## Capacidades

- Generación de texto y conversación: el modelo puede producir texto de forma autoregresiva, aunque la cuantización agresiva a 2 bits puede degradar la calidad de salida en tareas complejas.
- Razonamiento multi-paso: el modelo base está diseñado para llevar a cabo tareas complejas y multi-step, pero esta capacidad no ha sido validada en la versión cuantizada.
- Soporte de decodificación especulativa: gracias al head MTP incluido, la generación puede acelerarse en entornos compatibles con MLX.
- No incluye capacidades de visión: la torre de visión del modelo original ha sido eliminada, por lo que no procesa imágenes ni vídeos.
- No se han confirmado capacidades de tool calling o function calling en la información disponible.
- El soporte multilingüe no está documentado en la ficha del modelo cuantizado.

## Casos de uso

- Ejecución local en Mac con Apple Silicon: gracias a la cuantización 2-bit y al formato MLX, el modelo puede ejecutarse en ordenadores Mac con memoria unificada limitada, por ejemplo en portátiles con 16 GB de RAM.
- Prototipado rápido de aplicaciones de texto: para experimentos y demos en los que no se requiere una calidad de salida máxima, el modelo ofrece una vía rápida de despliegue local sin necesidad de GPUs dedicadas.
- Investigación en cuantización: el modelo sirve como ejemplo práctico de cuantización extrema a 2 bits con grupo de 64, y puede utilizarse para estudiar el impacto de la compresión en el rendimiento de modelos densos de gran tamaño.
- Desarrollo de aplicaciones conversacionales en entornos sin conexión: al poder ejecutarse localmente con el framework MLX, es adecuado para chatbots y asistentes que deben funcionar sin acceso a la nube.
- Evaluación de decodificación especulativa: el head MTP incluido permite probar técnicas de predicción multi-token y comparar velocidades de generación frente a modelos equivalentes sin MTP.
- Análisis de viabilidad de modelos de 27B en hardware de consumo: sirve como referencia para determinar si un modelo de este tamaño es utilizable en dispositivos con recursos limitados antes de invertir en infraestructura más potente.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No existen datos de MMLU, HumanEval, GSM8K ni otras evaluaciones que permitan comparar el rendimiento de esta cuantización con el del modelo base u otras versiones.

## Requisitos de hardware

- Inferencia optimizada para Apple Silicon mediante el framework MLX. No es compatible con CUDA, vLLM ni llama.cpp.
- Tamaño del repositorio: 8,6 GB, con pesos estimados de aproximadamente 8,4 GB.
- Se recomienda un Mac con al menos 16 GB de memoria unificada para ejecutar el modelo con comodidad. Con 8 GB podría no ser suficiente debido al espacio que ocupan los pesos y el runtime.
- No se dispone de datos de latencia ni de throughput para este modelo.
- Opciones de despliegue: mediante la biblioteca `mlx-lm` o `mlx-vlm` (aunque este modelo no usa visión) en entornos Python compatibles con MLX.

## Comparativa con modelos similares

| Modelo | Parametros | Cuantizacion | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| agnosticeng/Qwen3.8-27B-2bit | 26.895.998.464 | 2-bit affine | No disponible | Apache-2.0 | HuggingFace |
| agnosticeng/Qwen3.8-27B-4bit | No disponible | 4-bit | No disponible | No disponible | HuggingFace |
| Qwen/Qwen3.8-27B (base) | 26.895.998.464 | Sin cuantizar | No disponible | Apache-2.0 | HuggingFace |

La versión 2-bit ofrece una reducción de memoria considerable frente al modelo base, pero a costa de una mayor pérdida de precisión en comparación con una cuantización 4-bit, que suele mantener mejor calidad. No se dispone de datos comparativos de rendimiento entre las versiones.

## Limitaciones y advertencias

- La cuantización a 2-bit es extremadamente agresiva y puede provocar una degradación notable de la calidad en tareas de razonamiento complejo, generación de código o matemáticas.
- El riesgo de alucinación es mayor que en el modelo original sin cuantizar, debido a la pérdida de información en los pesos.
- La torre de visión ha sido eliminada, por lo que el modelo no puede procesar imágenes ni vídeos, a diferencia del modelo base Qwen3.8-27B.
- No se han documentado sesgos específicos, pero el modelo base podría heredar sesgos de sus datos de entrenamiento; no se ha realizado una evaluación de sesgos en esta versión cuantizada.
- La licencia Apache-2.0 permite uso comercial y modificación, pero cualquier redistribución debe mantener la atribución y el aviso de licencia.
- No se han publicado evaluaciones de seguridad o alineación para esta cuantización, por lo que su comportamiento en producción no está validado.
- El formato MLX limita su despliegue a entornos Apple; no es ejecutable directamente en GPUs NVIDIA o en servidores con CUDA.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/agnosticeng/Qwen3.8-27B-2bit
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Versión 4-bit del mismo autor: https://huggingface.co/agnosticeng/Qwen3.8-27B-4bit
