# Hooshaai/svd-linear-attention-roberta-astro

## Resumen

El modelo `Hooshaai/svd-linear-attention-roberta-astro` es un experimento de compresión y eficiencia atencional desarrollado por Hooshaai (Hoosha AI), dentro de su marco de trabajo denominado "SVD Linear Attention Framework". Se trata de una variante de RoBERTa en la que el módulo de atención estándar, de complejidad cuadrática, es sustituido por una aproximación lineal de bajo rango calibrada mediante descomposición en valores singulares (SVD) y posteriormente recuperada con 50 pasos de fine-tuning basado en LoRA.

Su objetivo principal es reducir el coste computacional y de memoria de la atención sin degradar significativamente el rendimiento en tareas de clasificación de texto. Está evaluado en el subconjunto SST-2 del benchmark GLUE, alcanzando una precisión de validación del 86,47 % y un F1 de 0,8801. La arquitectura es un Transformer basado en RoBERTa orientado a clasificación de secuencias. No se especifican el tamaño total de parámetros ni la longitud de contexto en la información disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (RoBERTa) con modulo `astro` de atencion lineal de bajo rango basada en SVD |
| Parametros totales | no disponible |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (ingles) |
| Licencia | MIT |
| Formato de pesos | PyTorch (archivo `weights.pt`) |

## Arquitectura y entrenamiento

El modelo parte de una arquitectura RoBERTa estandar, pero reemplaza las capas de atencion cuadratica o las proyecciones densas por aproximaciones lineales de bajo rango. El metodo `astro` utiliza calibracion mediante descomposicion en valores singulares (SVD) y posteriormente aplica una fase de recuperacion con 50 pasos de fine-tuning usando LoRA. Este enfoque busca mantener la expresividad del Transformer original reduciendo el coste computacional asintotico de la atencion.

Los datos de entrenamiento no se detallan en la informacion disponible. La evaluacion se realiza en el dataset GLUE, concretamente en la tarea SST-2 de analisis de sentimiento. No se menciona el uso de RLHF ni DPO. La innovacion tecnica destacable es la combinacion de SVD y LoRA para comprimir y recuperar el modulo de atencion en un modelo de clasificacion, un enfoque dentro de la linea de investigacion de atencion lineal subcuadratica.

## Capacidades

- Clasificacion de textos en ingles, especialmente analisis de sentimiento, con un accuracy de validacion del 86,47 % en SST-2 y F1 de 0,8801.
- Compatible con el pipeline `text-classification` de HuggingFace, cargable mediante `AutoModelForSequenceClassification`.
- Implementa una aproximacion de atencion lineal de bajo rango, lo que permite una huella de memoria reducida durante la inferencia.
- No se reportan capacidades de generacion de texto libre, tool calling, agentes, vision ni audio en la informacion disponible.
- Multilingue: solo en ingles.
- Modelo orientado a investigacion y validacion experimental de eficiencia atencional, no a produccion generalista.

## Casos de uso

- Analisis de sentimiento en reseñas de productos: el modelo puede clasificar opiniones en positivas o negativas a partir de SST-2, con un rendimiento razonable y un consumo de memoria bajo.
- Clasificacion de comentarios en foros o redes sociales: dado que soporta texto en ingles, puede aplicarse a la moderacion de contenido simple, diferenciando comentarios positivos de negativos.
- Experimentacion en compresion de atencion: se puede utilizar como punto de partida para estudiar el impacto de la atencion lineal basada en SVD en modelos Transformer de tamaño medio.
- Benchmarking de eficiencia en clasificacion de textos: el modelo ofrece datos de VRAM pico y tiempo de evaluacion, utiles para comparar estrategias de compresion.
- Pruebas de recuperacion mediante LoRA: sirve como ejemplo de como 50 pasos de fine-tuning LoRA pueden restaurar el rendimiento de un modulo comprimido con SVD.
- Integracion en flujos educativos o de investigacion: puede usarse para ensenar los fundamentos de la atencion lineal y la compresion de modelos en el aula.
- Despliegue en entornos con recursos limitados: con un pico de VRAM de 337,21 MB, el modelo puede ejecutarse en GPUs de gama baja o incluso en entornos de desarrollo ligeros.

## Benchmarks y rendimiento

Segun la informacion disponible en la model card, los resultados evaluados en GLUE (SST-2) son los siguientes:

| Metrica | Valor |
|---|---|
| Family | roberta |
| Modulo / Metodo | astro |
| Validation Accuracy | 86,47 % |
| F1 Score | 0,8801 |
| Compression Ratio | 1,0 |
| Peak GPU VRAM | 337,21 MB |
| Pure Eval Time | 22,35 s |

No se proporcionan benchmarks comparativos con otros modelos en la informacion disponible. No se han publicado resultados en MMLU, HumanEval ni GSM8K.

## Requisitos de hardware

- VRAM estimada para inferencia: segun la evaluacion de la model card, pico de 337,21 MB, lo que permite ejecutar el modelo en practicamente cualquier GPU moderna.
- GPU recomendadas: tarjetas consumer como NVIDIA GTX 1660, RTX 3060, RTX 4060 o superiores son suficientes; tambien compatible con cualquier GPU de datacenter.
- Si cabe en consumer GPU: si, con margen amplio; incluso en GPUs con 2 GB de VRAM.
- Opciones de despliegue: cargable con HuggingFace Transformers (`AutoModelForSequenceClassification`) y pipeline de `text-classification`. No se mencionan integraciones con vLLM, llama.cpp, Ollama ni TGI en la informacion disponible.
- Latencia y throughput: no disponible. El unico dato temporal es "Pure Eval Time" de 22,35 s, que corresponde a la evaluacion completa sobre el conjunto SST-2 y no a una medida de latencia por inferencia.

## Comparativa con modelos similares

No se han proporcionado datos comparativos con otros modelos en la informacion disponible. El modelo pertenece a la categoria de variantes de RoBERTa con atencion lineal de bajo rango, pero no hay benchmarks publicados que permitan una comparacion cuantitativa con otras alternativas como RoBERTa-base estandar o modelos similares de atencion lineal.

## Limitaciones y advertencias

- Sesgos conocidos: no se mencionan en la informacion disponible. Como cualquier modelo entrenado en SST-2, puede heredar sesgos presentes en ese dataset.
- Riesgo de alucinacion: al ser un modelo de clasificacion y no de generacion, el riesgo de alucinacion de texto libre no es relevante, pero pueden producirse errores de clasificacion en entradas ambiguas.
- Limitaciones de contexto o idioma: solo soporta ingles y no se especifica la longitud maxima de contexto, por lo que no es adecuado para secuencias largas sin evaluacion adicional.
- Restricciones de licencia para uso comercial: la licencia MIT permite uso comercial, pero el modelo es experimental y no se proporcionan garantias de rendimiento ni soporte.
- Caveats para produccion: el modelo no ha sido validado en entornos reales mas alla de GLUE/SST-2; el "Compression Ratio" figura como 1,0, lo que sugiere una compresion nula o un metodo de reporte ambiguo, por lo que la eficiencia real debe verificarse.
- Solo se ofrecen pesos en formato PyTorch (`weights.pt`); no se confirma disponibilidad en otros formatos como safetensors o GGUF.

## Enlaces

- HuggingFace: https://huggingface.co/Hooshaai/svd-linear-attention-roberta-astro
- Pagina del autor: https://hooshaai.github.io/
- Articulo sobre atencion lineal y Transformers: https://hooshaai.substack.com/p/scaling-transformers-how-linear-attention
