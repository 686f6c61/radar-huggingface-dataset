# mflux-community/qwen-image-2-1-mflux-q5

## Resumen

Qwen-Image 2.1 MFlux Q5 es una conversión comunitaria del modelo de generación de imágenes Qwen-Image-2.1 de Alibaba Qwen, adaptada para ejecutarse en Apple Silicon mediante MLX. La conversión la firma mflux-community, el colectivo que mantiene versiones optimizadas de modelos generativos para el runtime MFlux creado por Filip Strand. El resultado es un conjunto de pesos cuantizados a 5 bits (Q5) que ocupa 12,6 GB, frente a los 33,1 GB de la versión BF16 original, lo que permite ejecutar el modelo en Macs con memoria unificada moderada.

El modelo resuelve el problema de desplegar un generador texto-a-imagen de última generación en hardware de consumo de Apple sin depender de CUDA ni de GPUs dedicadas. La cuantización se aplica de forma uniforme sobre los tres componentes del pipeline (text encoder, transformer y VAE) mediante cuantización afín de MLX a 5 bits, y el nivel de cuantización queda grabado en los propios pesos, de modo que no hace falta pasar ningún flag adicional al generar.

Es relevante ahora porque amplía el acceso local a modelos de imagen de alta calidad en el ecosistema Mac, y porque la familia MFlux ofrece una escala completa de cuantizaciones (BF16, Q8, Q6, Q5, Q4, Q3) que permite ajustar el equilibrio entre calidad y consumo de memoria. Al ser una conversión no oficial, hereda íntegramente la licencia qwen-research del modelo original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Pipeline texto-a-imagen de Qwen-Image-2.1 (text encoder + transformer + VAE), convertido a MLX |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | MLX affine 5 bits (Q5) sobre text encoder, transformer y VAE |
| Idiomas soportados | no disponible |
| Licencia | qwen-research (heredada del modelo base) |
| Formato de pesos | safetensors (MLX) |
| Tamano del repositorio | 12,6 GB |
| Version de MFlux usada | 0.24.0 |
| Fecha de conversion | 2026-10-31 |
| Modelo base | Qwen/Qwen-Image-2.1 |

## Arquitectura y entrenamiento

El modelo es una conversión de pesos, no un reentrenamiento: la arquitectura subyacente es la de Qwen-Image-2.1, un pipeline de difusión texto-a-imagen compuesto por un text encoder, un transformer de difusión y un VAE. La conversión a MLX preserva esa estructura y aplica cuantización afín de 5 bits de forma uniforme sobre los tres bloques. El nivel de cuantización queda almacenado en los pesos, por lo que el runtime lo detecta automáticamente.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, ni sobre si el modelo original empleó RLHF, DPO u otras técnicas de alineación. La model card de esta conversión no documenta detalles de entrenamiento y remite al modelo base para cualquier aspecto relativo a los datos o al proceso de entrenamiento original. La única modificación respecto al original es la conversión de formato y la cuantización.

## Capacidades

- Generación de imágenes a partir de descripciones textuales (text-to-image) mediante el comando `mflux-generate-qwen-2.1`.
- Control de resolución de salida mediante los parámetros `--width` y `--height` (el ejemplo de la model card usa 1024x1024).
- Reproducibilidad mediante semilla fija (`--seed`).
- Ejecución nativa en Apple Silicon a través de MLX, sin necesidad de CUDA.
- Selección del nivel de cuantización según la memoria disponible, con seis variantes publicadas (BF16, Q8, Q6, Q5, Q4, Q3).
- Descarga automática de pesos desde Hugging Face en el primer uso, o uso de copia local mediante `hf download`.
- No se documentan en la información disponible capacidades de edición de imagen, inpainting, control por imagen de referencia, tool calling ni modos de razonamiento.

## Casos de uso

- Generación de ilustraciones para prototipado de producto: un diseñador puede lanzar el comando con un prompt descriptivo y obtener una imagen a 1024x1024 en local, sin enviar datos a servicios externos, útil para iterar sobre conceptos antes de encargar arte final.
- Creación de assets para videojuegos indie: estudio pequeño que trabaja íntegramente en Macs puede generar bocetos de personajes, entornos o iconos y ajustar la resolución según el destino del asset.
- Exploración artística y generación por lotes con semilla fija: la posibilidad de fijar `--seed` permite reproducir exactamente una imagen y comparar variaciones de prompt manteniendo el resto de parámetros constantes.
- Docencia e investigación en generación de imágenes: al ejecutarse en local con MLX, permite experimentar con un modelo de difusión de última generación sin infraestructura de GPU dedicada, y comparar el efecto de distintas cuantizaciones (Q3 a Q8) sobre la calidad de salida.
- Generación de contenido para blogs y documentación técnica: imágenes de acompañamiento creadas en el propio portátil del redactor, sin cuotas de API ni latencia de red.
- Pruebas de concepto de aplicaciones Mac con IA generativa: desarrolladores que quieran integrar generación de imágenes en una app nativa pueden usar MFlux como backend y este repositorio como fuente de pesos cuantizados.
- Evaluación comparativa de cuantizaciones: el repositorio forma parte de una familia con seis niveles, lo que permite medir empíricamente el compromiso entre tamaño (8,7 GB en Q3 frente a 33,1 GB en BF16) y fidelidad de imagen.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas de calidad de imagen (FID, CLIP score, etc.), ni comparaciones cuantitativas con el modelo BF16 o con otras cuantizaciones. Tampoco se documentan tiempos de generación ni throughput por modelo de Mac.

## Requisitos de hardware

- VRAM/memoria unificada estimada: el repositorio pesa 12,6 GB en disco; en ejecución hay que sumar la memoria del runtime y los buffers intermedios, por lo que se recomienda un Mac con al menos 16 GB de memoria unificada y preferiblemente 24 GB o más.
- Hardware objetivo: Apple Silicon (M1, M2, M3, M4 y variantes Pro, Max y Ultra), ya que MLX solo funciona en chips de Apple.
- No es compatible con GPUs NVIDIA, AMD ni con CPU x86, al estar empaquetado para MLX.
- Alternativas dentro de la misma familia si falta memoria: Q4 (10,6 GB) y Q3 (8,7 GB); si sobra, Q6 (14,5 GB), Q8 (18,5 GB) o BF16 (33,1 GB).
- Despliegue: MFlux (`uv tool install --upgrade mflux`), con el comando `mflux-generate-qwen-2.1`. No se mencionan soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a este formato.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Tamano | Licencia | Plataforma |
|---|---|---|---|---|---|---|
| Qwen-Image 2.1 MFlux Q5 (este) | no disponible | no disponible | MLX affine 5 bits | 12,6 GB | qwen-research | Apple Silicon (MLX) |
| Qwen-Image 2.1 MFlux Q8 | no disponible | no disponible | MLX affine 8 bits | 18,5 GB | qwen-research | Apple Silicon (MLX) |
| Qwen-Image 2.1 MFlux Q3 | no disponible | no disponible | MLX affine 3 bits | 8,7 GB | qwen-research | Apple Silicon (MLX) |
| Qwen-Image 2.1 (original) | no disponible | no disponible | BF16 | no disponible | qwen-research | Multiplataforma (formato original) |

La comparación relevante aquí es interna a la familia MFlux: Q5 ocupa un punto medio entre Q4 (10,6 GB) y Q6 (14,5 GB), y reduce a menos de la mitad el peso del BF16 (33,1 GB). No se dispone de datos de rendimiento que permitan comparar la calidad de salida entre estas variantes ni con generadores de imagen de otros fabricantes.

## Limitaciones y advertencias

- Conversión no oficial: mflux-community no es el autor original del modelo; la model card lo advierte explícitamente. Cualquier problema de calidad atribuible a la cuantización no está respaldado por Qwen.
- Licencia qwen-research: no es una licencia permisiva estándar. Antes de usar el modelo en producción o con fines comerciales hay que revisar los términos completos en el enlace de licencia del modelo base.
- La cuantización a 5 bits puede introducir degradación en la fidelidad de las imágenes respecto a BF16; no se han publicado métricas que cuantifiquen esa pérdida.
- Exclusivo de Apple Silicon: no se puede desplegar en servidores con GPU NVIDIA, lo que limita su uso en infraestructura de producción convencional.
- Riesgo de sesgos y alucinaciones visuales inherente al modelo base; no se documentan en esta conversión análisis específicos de sesgo.
- Idiomas soportados no documentados en esta model card; hay que consultar la del modelo original.
- Sin garantías de mantenimiento: al ser un repositorio comunitario con 0 likes y 306 descargas en el momento de la consulta, la actividad de soporte puede ser limitada.
- No se documentan requisitos mínimos oficiales de memoria; las estimaciones de hardware son orientativas a partir del tamaño de los pesos.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/mflux-community/qwen-image-2-1-mflux-q5
- Modelo base: https://huggingface.co/Qwen/Qwen-Image-2.1
- Licencia del modelo base: https://huggingface.co/Qwen/Qwen-Image-2.1/blob/main/LICENSE
- Repositorio MFlux: https://github.com/filipstrand/mflux
- Organización MFlux-Community: https://huggingface.co/mflux-community
- Variante BF16: https://huggingface.co/mflux-community/qwen-image-2-1-mflux-bf16
- Variante Q8: https://huggingface.co/mflux-community/qwen-image-2-1-mflux-q8
- Variante Q6: https://huggingface.co/mflux-community/qwen-image-2-1-mflux-q6
- Variante Q4: https://huggingface.co/mflux-community/qwen-image-2-1-mflux-q4
- Variante Q3: https://huggingface.co/mflux-community/qwen-image-2-1-mflux-q3
