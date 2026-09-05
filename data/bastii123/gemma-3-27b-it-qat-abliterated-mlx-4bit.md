# Bastii123/gemma-3-27b-it-qat-abliterated-mlx-4Bit

## Resumen

Bastii123/gemma-3-27b-it-qat-abliterated-mlx-4Bit es una conversión al formato MLX del modelo mlabonne/gemma-3-27b-it-qat-abliterated, que a su vez es una versión cuantizada con entrenamiento consciente de cuantización (QAT) y abliterada de Gemma 3 27B IT de Google. El modelo base es un modelo de lenguaje multimodal de 27.009.346.304 parámetros. Esta versión está cuantizada a 4 bits y optimizada para ejecutarse en Apple Silicon mediante la librería mlx-lm. El repositorio pesa 16.9 GB y no se han publicado benchmarks ni especificaciones detalladas en la información proporcionada.

La relevancia de este modelo radica en ofrecer una alternativa ligera y local para ejecutar un modelo de 27B en hardware de Apple, con la particularidad de la abliteración, que elimina ciertos comportamientos de alineación del modelo original mediante edición de pesos. No se dispone de datos sobre el conjunto de entrenamiento, el número de tokens ni procesos de RLHF/DPO.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Gemma 3) |
| Parametros totales | 27.009.346.304 |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 4-bit (MLX) |
| Idiomas soportados | no disponible |
| Licencia | gemma |
| Formato de pesos | MLX (safetensors) |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura Gemma 3, un transformer decoder-only con mecanismo de atención estándar. La conversión a MLX se realizó con mlx-lm 0.31.2 a partir de una versión QAT (quantization-aware training) de 4 bits del modelo abliterado. La abliteración es una técnica de edición de pesos que elimina los comportamientos asociados a la alineación (refusals, etc.) sin necesidad de reentrenamiento. No se han proporcionado datos sobre el dataset de entrenamiento, el número de tokens ni procesos de RLHF/DPO en la información disponible.

## Capacidades

- Generación de texto y razonamiento: heredado del modelo base Gemma 3 27B IT, aunque no se han publicado evaluaciones específicas.
- Multimodalidad: el pipeline declarado es image-text-to-text, pero la etiqueta gemma3_text sugiere que la conversión MLX se centra en texto.
- Multilingüe: no se han listado los idiomas soportados.
- Tool calling: no disponible en la información proporcionada.
- Soporte de agentes: no disponible en la información proporcionada.
- Modo de razonamiento especial: no disponible en la información proporcionada.

## Casos de uso

- Desarrollo de asistentes de código locales: se puede ejecutar en un MacBook con Apple Silicon, generando código y explicaciones sin conexión. La cuantización 4-bit permite cargar el modelo en memoria unificada.
- Investigación en alineación y seguridad: al estar abliterado, permite estudiar el comportamiento del modelo sin las capas de alineación, útil para análisis de sesgos y robustez.
- Generación de contenido creativo: para escribir relatos, guiones o artículos, aprovechando la capacidad de generación de texto del modelo base.
- Procesamiento de documentos en local: resumir informes o extraer información de textos largos, aunque la longitud de contexto no está confirmada.
- Traducción asistida: si se confirma el soporte multilingüe, puede usarse para traducción en entornos sin conexión.
- Experimentos de cuantización y rendimiento: para evaluar el impacto de la cuantización 4-bit en tareas de razonamiento y generación, comparando con la versión sin cuantizar.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: los pesos en 4-bit ocupan aproximadamente 16.9 GB, por lo que se recomienda al menos 18 GB de memoria unificada para inferencia.
- GPU recomendadas: Apple Silicon (M1/M2/M3/M4 Pro, Max o Ultra) con 32 GB o más de RAM unificada.
- Si cabe en consumer GPU: no directamente en formato MLX; requeriría conversión a otro formato como GGUF o safetensors estándar para su uso en GPUs NVIDIA.
- Opciones de despliegue: mlx-lm (Python), también se puede usar con la librería transformers si se convierte el formato.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No disponible. No se han proporcionado datos comparables en la información disponible.

## Limitaciones y advertencias

- La abliteración puede eliminar las barreras de seguridad, lo que incrementa el riesgo de generar contenido dañino o no alineado.
- Al estar cuantizado a 4 bits, puede haber pérdida de precisión en tareas complejas.
- No se dispone de información sobre idiomas, longitud de contexto ni benchmarks, por lo que su rendimiento real es desconocido.
- La licencia Gemma impone restricciones de uso comercial y de distribución, por lo que hay que revisar los términos antes de desplegar el modelo en producción.
- El formato MLX limita su uso a Apple Silicon, lo que reduce las opciones de despliegue en infraestructura estándar.

## Enlaces

- https://huggingface.co/Bastii123/gemma-3-27b-it-qat-abliterated-mlx-4Bit
- https://huggingface.co/mlabonne/gemma-3-27b-it-qat-abliterated
- https://huggingface.co/mlabonne/gemma-3-27b-it-abliterated
- https://pypi.org/project/mlx-lm/
