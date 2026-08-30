# JustANormalTinkerer/hayai-ocr-v2-onnx

## Resumen

Hayai OCR v2.1 es un modelo de reconocimiento óptico de caracteres (OCR) ligero, de aproximadamente 155 millones de parámetros, desarrollado por JustANormalTinkerer. Está diseñado para transcribir texto denso en japonés, chino, coreano e inglés directamente desde imágenes, sin necesidad de una etapa previa de detección de regiones de texto. Es una evolución del proyecto manga-ocr, orientado originalmente a manga japonés, pero ampliado a otros idiomas CJK y a inglés.

Esta versión concreta del repositorio proporciona exportaciones optimizadas para ONNX Runtime en tres precisiones (FP32, FP16 e INT8 con cuantización dinámica), lo que permite ejecutar el modelo sin depender de PyTorch y con un consumo de memoria reducido. La arquitectura combina un codificador visual SigLIP2 con un decodificador transformer causal, y emplea embeddings posicionales calculados en el host mediante interpolación NaFlex y frecuencias mRoPE 2D, lo que mantiene los grafos ONNX limpios y dinámicos en cuanto a tamaño de lote y longitud de secuencia.

La relevancia actual del modelo radica en su tamaño compacto, su soporte multilingüe para escrituras CJK y su disponibilidad en formatos cuantizados, lo que lo hace adecuado para despliegue en entornos con recursos limitados, como CPUs o GPUs de consumo.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | SigLIP2 (codificador visual) + decodificador transformer causal |
| Parametros totales | 155.614.464 (~155 M) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible (modelo OCR imagen-a-texto, sin contexto de texto largo) |
| Tipos de cuantizacion | FP32, FP16, INT8 (cuantización dinámica) |
| Idiomas soportados | en, ja, zh, ko |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (encoder y decoder separados), safetensors (pesos originales PyTorch) |

## Arquitectura y entrenamiento

El modelo sigue una arquitectura de codificador-decodificador: un codificador visual SigLIP2 (con interpolación NaFlex para posiciones) procesa la imagen de entrada, y un decodificador transformer causal genera el texto transcrito token a token. No se utiliza una etapa de detección de texto separada; el modelo mapea directamente la imagen completa a la transcripción.

Los embeddings posicionales se calculan en el lado del host (CPU) mediante NumPy, combinando la interpolación de la cuadrícula NaFlex de SigLIP2 con frecuencias mRoPE 2D. Este enfoque mantiene los grafos ONNX independientes del tamaño de lote, la longitud de la secuencia visual y el número de pasos de generación, y se cachea con LRU para un coste de aproximadamente 0,5 ms por llamada.

No se han publicado en la información disponible detalles sobre el conjunto de datos de entrenamiento, el número de tokens procesados ni el uso de técnicas como RLHF o DPO. El modelo es una evolución de manga-ocr, reconstruido con la arquitectura SigLIP2 + decoder, según se indica en el repositorio principal.

## Capacidades

- Reconocimiento de texto denso en imágenes, incluyendo escritura vertical y horizontal en japonés, chino, coreano e inglés.
- Transcripción directa imagen-a-texto sin detección previa de regiones de texto.
- Soporte de procesamiento por lotes (batch) en el codificador y el decodificador, con ejes dinámicos validados.
- Normalización de texto post-proceso para CJK, con normalización NFKC y eliminación de espacios entre caracteres CJK.
- Inferencia pura con ONNX Runtime, sin necesidad de PyTorch en tiempo de ejecución.
- Disponibilidad de cuantización INT8 dinámica para reducir el uso de memoria y acelerar la inferencia en CPU.

## Casos de uso

- OCR de manga y cómics: el modelo está específicamente orientado a texto denso en viñetas, incluyendo onomatopeyas y diálogos, con soporte para escritura vertical japonesa. Puede integrarse en pipelines de traducción automática de manga.
- Digitalización de documentos con texto CJK: transcripción de documentos escaneados o fotografiados en japonés, chino o coreano, útil para archivado y búsqueda de texto.
- Extracción de texto de capturas de pantalla: ideal para automatizar la captura de información de imágenes en aplicaciones de productividad o análisis de datos.
- Asistencia a la traducción: el texto reconocido puede alimentar sistemas de traducción automática, reduciendo el trabajo manual de transcribir imágenes.
- Procesamiento de imágenes en lote: gracias al soporte de ejes dinámicos y al script de inferencia por línea de comandos, puede procesar directorios completos de imágenes y generar resultados en JSONL.
- OCR en dispositivos con recursos limitados: las versiones FP16 e INT8 permiten ejecutar el modelo en GPUs de consumo o incluso en CPU con un rendimiento aceptable, adecuado para aplicaciones embebidas o edge.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No se dispone de métricas como MMLU, HumanEval o GSM8K, ya que se trata de un modelo OCR y no de un modelo de lenguaje general. Tampoco se han proporcionado comparativas cuantitativas con otros sistemas OCR en la documentación consultada.

## Requisitos de hardware

- VRAM estimada para inferencia: los archivos ONNX FP32 del encoder y decoder suman aproximadamente 535 MB de datos de pesos, por lo que la inferencia FP32 requiere al menos 1 GB de VRAM o RAM. Las versiones FP16 reducen el peso a unos 271 MB, y las INT8 a unos 137 MB, permitiendo ejecución en entornos con menos de 512 MB de memoria dedicada.
- GPU recomendadas: cualquier GPU con soporte CUDA y al menos 2 GB de VRAM (por ejemplo, NVIDIA GTX 1650, RTX 2060, RTX 3060) puede ejecutar las versiones FP16 o INT8 sin problemas. Para FP32 se recomienda al menos 4 GB de VRAM.
- En CPU: las versiones cuantizadas INT8 pueden ejecutarse en CPUs modernas con instrucciones AVX2, aunque la latencia será mayor que en GPU.
- Opciones de despliegue: ONNX Runtime (CPU o GPU), con scripts de inferencia incluidos (`inference_onnx.py`). No se menciona soporte nativo para vLLM, llama.cpp u Ollama, ya que el modelo no es un LLM sino un sistema OCR.
- Latencia y throughput: no se han publicado mediciones oficiales. Dado el tamaño de 155 M de parámetros y la cuantización disponible, se espera una latencia de decenas de milisegundos por imagen en GPU moderna, pero este dato no está confirmado.

## Comparativa con modelos similares

| Modelo | Parametros | Idiomas | Arquitectura | Licencia | Formato |
|---|---|---|---|---|---|
| Hayai OCR v2.1 (ONNX) | 155 M | en, ja, zh, ko | SigLIP2 + decoder causal | Apache 2.0 | ONNX, safetensors |
| manga-ocr (original) | ~90 M (estimado) | ja | ViT + decoder | MIT (según repo) | PyTorch |
| TrOCR (base) | ~334 M | en, otros | ViT + RoBERTa decoder | MIT | PyTorch, ONNX |

Nota: los datos de manga-ocr y TrOCR son aproximados y no se han verificado en la información proporcionada. No se dispone de comparativas de rendimiento publicadas entre estos modelos.

## Limitaciones y advertencias

- No se han publicado detalles sobre el conjunto de entrenamiento, por lo que se desconocen posibles sesgos en los datos (por ejemplo, predominancia de texto de manga frente a texto impreso).
- El modelo puede alucinar caracteres o palabras en imágenes de baja calidad, con ruido o con tipografías poco comunes.
- La longitud de contexto no está especificada; al ser un modelo OCR, no está diseñado para procesar texto largo de entrada, sino imágenes.
- Aunque la licencia Apache 2.0 permite uso comercial, es recomendable verificar los términos de los pesos originales y de los datos de entrenamiento si se utiliza en producción.
- La versión ONNX requiere los scripts de inferencia incluidos en el repositorio; no es un modelo plug-and-play con la API estándar de transformers sin adaptación.
- El soporte de coreano se indica en la model card, pero la descripción del Space de Hugging Face solo menciona japonés, chino e inglés; se recomienda probar con texto coreano antes de confiar en él.

## Enlaces

- Repositorio ONNX: https://huggingface.co/JustANormalTinkerer/hayai-ocr-v2-onnx
- Repositorio principal (pesos PyTorch): https://huggingface.co/JustANormalTinkerer/hayai-ocr-v2
- Space de demostración: https://huggingface.co/spaces/JustANormalTinkerer/hayai-ocr-v2
- GitHub del proyecto: https://github.com/NopeNopeGuy/hayai-ocr
- Paquete PyPI: https://pypi.org/project/hayai-ocr/
