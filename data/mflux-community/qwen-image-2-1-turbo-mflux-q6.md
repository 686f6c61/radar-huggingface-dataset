# mflux-community/qwen-image-2-1-turbo-mflux-q6

## Resumen

Qwen-Image 2.1 Turbo · MFlux Q6 es una conversión comunitaria, cuantizada a 6 bits, del modelo de generación de imágenes Qwen-Image-2.1-Turbo de Qwen, adaptada para ejecutarse de forma nativa en Mac con Apple Silicon mediante el framework MLX. La conversión ha sido realizada por MFlux-Community con MFlux 0.24.0 y no constituye una publicación oficial de los autores originales.

El problema que resuelve es claro: el modelo original en BF16 ocupa 32,5 GB, una cantidad difícil de alojar en la memoria unificada de la mayoría de Mac. Esta versión Q6 reduce el repositorio a 13,9 GB manteniendo la calidad de generación, lo que permite ejecutar localmente uno de los modelos de texto a imagen más recientes sin GPU dedicada de NVIDIA.

Es relevante ahora porque la generación de imágenes local en hardware Apple ha ganado tracción, y MFlux se ha consolidado como la herramienta de referencia para ejecutar modelos de difusión en MLX. El modelo base es un pipeline text-to-image que cuantiza conjuntamente el codificador de texto, el transformer y el VAE.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Pipeline text-to-image (codificador de texto + transformer de difusión + VAE); detalles concretos no disponibles |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | MLX affine quantization a 6 bits (Q6), aplicada a text encoder, transformer y VAE |
| Idiomas soportados | no disponible |
| Licencia | qwen-research (heredada del modelo original; no comercial estándar, consultar términos) |
| Formato de pesos | safetensors cuantizados en formato MLX (MFlux) |

Datos adicionales:

| Parametro | Valor |
|---|---|
| Tamaño del repositorio | 13,9 GB (Q6); BF16: 32,5 GB; Q8: 17,8 GB; Q5: 11,9 GB; Q4: 10,0 GB; Q3: 8,0 GB |
| Pipeline | text-to-image |
| Librería | mflux (0.24.0 en la conversión) |
| Resolución de ejemplo | 1024x1024 |

## Arquitectura y entrenamiento

El repositorio no detalla la arquitectura interna del modelo base, pero por su naturaleza de pipeline text-to-image consta de tres componentes, todos cuantizados a 6 bits en esta conversión: un codificador de texto que procesa el prompt, un transformer de difusión que genera la imagen de forma iterativa, y un VAE que codifica y decodifica en el espacio latente. La variante "Turbo" del modelo base sugiere un enfoque optimizado para reducir el número de pasos de inferencia, aunque el número exacto de pasos no está documentado en la ficha.

Sobre el entrenamiento del modelo original (número de tokens o imágenes, composición del dataset, uso de RLHF/DPO) no hay información disponible en la model card. La conversión a MLX no modifica los pesos más allá de la cuantización afín de 6 bits; el nivel de cuantización queda almacenado en los propios pesos, por lo que no es necesario pasar el flag `--quantize` al ejecutarlo.

## Capacidades

- Generación de imágenes a partir de texto (text-to-image) con resolución configurable, con 1024x1024 como ejemplo documentado.
- Ejecución nativa en Apple Silicon mediante MLX, sin necesidad de GPU NVIDIA ni de capas de traducción tipo CUDA.
- Control de semilla (`--seed`) para reproducibilidad de las generaciones.
- Descarga automática de pesos desde HuggingFace en el primer uso, o uso local con copia previa descargada.
- No hay soporte documentado en esta ficha para image-to-image, inpainting, edición, audio ni otras modalidades.

## Casos de uso

- Generación local de imágenes en Mac: ideal para desarrolladores con Apple Silicon (M1 a M4) que quieren generar imágenes sin depender de APIs de pago ni de GPU en la nube; con 13,9 GB cabe en Macs con 24 GB de memoria unificada o más.
- Prototipado rápido de prompts: la variante Turbo está orientada a inferencia rápida, útil para iterar decenas de prompts y ajustar composiciones antes de una generación final de mayor calidad.
- Integración en scripts y pipelines automatizados: la CLI de MFlux (`mflux-generate-qwen-2.1`) permite encadenar generaciones en scripts de shell o Python, por ejemplo para producir ilustraciones en lote para un blog o documentación.
- Privacidad en flujos creativos: al ejecutarse íntegramente en local, es adecuado para estudios de diseño o agencias que no pueden enviar prompts con información sensible a servicios externos.
- Trabajo sin conexión: una vez descargados los pesos (13,9 GB), el modelo funciona sin acceso a red, útil en entornos aislados o con conectividad limitada.
- Evaluación comparativa de cuantizaciones: la familia de repos Q3 a BF16 permite medir la degradación de calidad frente al ahorro de memoria y decidir el punto óptimo para el hardware disponible.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Tampoco se documentan tiempos de generación por imagen para esta versión Q6 en el hardware de referencia.

## Requisitos de hardware

- Memoria estimada: al tratarse de MLX sobre memoria unificada de Apple Silicon, se recomienda disponer de al menos 16-24 GB de RAM unificada para la versión Q6 (13,9 GB de pesos más la memoria de activación e inferencia); los valores exactos no están documentados.
- GPU recomendada: no aplica GPU dedicada; el modelo está diseñado exclusivamente para Apple Silicon (chips M1/M2/M3/M4). No es compatible con NVIDIA CUDA en este formato.
- Consumer GPU: no cabe el concepto de GPU de consumo NVIDIA aquí; en Macs, un MacBook Pro o Mac Studio con 24 GB o más de memoria unificada debería ejecutar la versión Q6 con holgura. Las versiones Q4 (10,0 GB) y Q3 (8,0 GB) son alternativas para Macs de 16 GB.
- Despliegue: mediante MFlux (`uv tool install mflux`), con descarga directa desde HuggingFace o copia local. No aplica vLLM, TGI ni Ollama al ser un modelo de difusión en formato MLX.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

Comparativa entre las versiones MFlux del mismo modelo base disponibles en HuggingFace:

| Version | Tamano | Cuantizacion | Repo |
|---|---|---|---|
| BF16 | 32,5 GB | Sin cuantizar | mflux-community/qwen-image-2-1-turbo-mflux-bf16 |
| Q8 | 17,8 GB | 8 bits | mflux-community/qwen-image-2-1-turbo-mflux-q8 |
| Q6 (esta ficha) | 13,9 GB | 6 bits | mflux-community/qwen-image-2-1-turbo-mflux-q6 |
| Q5 | 11,9 GB | 5 bits | mflux-community/qwen-image-2-1-turbo-mflux-q5 |
| Q4 | 10,0 GB | 4 bits | mflux-community/qwen-image-2-1-turbo-mflux-q4 |
| Q3 | 8,0 GB | 3 bits | mflux-community/qwen-image-2-1-turbo-mflux-q3 |

La versión Q6 representa el punto medio de la familia: reduce el tamaño del BF16 en más de la mitad (un 57 % menos) con una pérdida de calidad esperablemente moderada, aunque no hay mediciones comparativas publicadas. Frente a alternativas de otras familias (FLUX, SDXL en MLX), no se dispone de datos comparativos en la informacion proporcionada.

## Limitaciones y advertencias

- Conversión comunitaria: no es una publicación oficial de Qwen; cualquier problema de calidad puede derivar de la cuantización y no del modelo original.
- Licencia qwen-research: se hereda sin cambios del modelo original. No es una licencia abierta estándar (tipo Apache o MIT); conviene revisar los términos completos antes de cualquier uso comercial, ya que puede haber restricciones específicas.
- Riesgo de degradación por cuantización: la cuantización afín a 6 bits del text encoder, transformer y VAE puede introducir artefactos o pérdida de fidelidad respecto al BF16, especialmente en detalles finos y texto renderizado en imágenes.
- Solo Apple Silicon: el formato MLX no funciona en GPU NVIDIA, AMD ni en la mayoría de entornos de servidor Linux convencionales; para esos entornos habría que usar el modelo original en otro formato.
- Sesgos y alucinaciones: como todo modelo generativo de imágenes, puede reproducir sesgos presentes en sus datos de entrenamiento y generar contenido inexacto o no deseado; no se documentan evaluaciones específicas de sesgo.
- Información técnica incompleta: la model card no documenta parámetros, pasos de inferencia, idiomas soportados en los prompts ni benchmarks, lo que dificulta una evaluación rigurosa previa a la descarga de 13,9 GB.

## Enlaces

- Repositorio de esta conversión: https://huggingface.co/mflux-community/qwen-image-2-1-turbo-mflux-q6
- Modelo original: https://huggingface.co/Qwen/Qwen-Image-2.1-Turbo
- Licencia original: https://huggingface.co/Qwen/Qwen-Image-2.1-Turbo/blob/main/LICENSE
- MFlux (GitHub): https://github.com/filipstrand/mflux
- Organización MFlux-Community: https://huggingface.co/mflux-community
- Versiones alternativas: https://huggingface.co/mflux-community/qwen-image-2-1-turbo-mflux-bf16, https://huggingface.co/mflux-community/qwen-image-2-1-turbo-mflux-q8, https://huggingface.co/mflux-community/qwen-image-2-1-turbo-mflux-q5, https://huggingface.co/mflux-community/qwen-image-2-1-turbo-mflux-q4, https://huggingface.co/mflux-community/qwen-image-2-1-turbo-mflux-q3
