# mflux-community/qwen-image-2-1-mflux-q8

## Resumen

`mflux-community/qwen-image-2-1-mflux-q8` es una conversión comunitaria del modelo de generación de imágenes Qwen-Image-2.1 de Alibaba Qwen, empaquetada en formato MLX y cuantizada a 8 bits para su ejecución local en Apple Silicon. No se trata de un modelo nuevo ni de un fine-tune: los pesos son los originales de Qwen-Image-2.1, modificados únicamente mediante conversión a MLX y cuantización afín de 8 bits sobre el text encoder, el transformer y el VAE. El repositorio ocupa 18,5 GB y lo mantiene la organización MFlux-Community, no los autores originales.

La relevancia de esta ficha es práctica: permite ejecutar un modelo texto-a-imagen de última generación en un Mac con memoria unificada, sin GPU NVIDIA ni CUDA, usando la librería MFlux (open source) sobre el framework MLX de Apple. Frente a la versión BF16 de 33,1 GB, esta variante Q8 reduce el peso a casi la mitad con una pérdida de calidad que el autor de la conversión no documenta numéricamente.

La licencia aplicable es `qwen-research`, heredada del modelo base, lo que condiciona el uso comercial. La model card no proporciona detalles sobre arquitectura interna, número de parámetros, resolución nativa ni datos de entrenamiento; esta ficha se limita a lo que la información disponible permite afirmar.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (modelo de difusión texto-a-imagen; componentes: text encoder, transformer y VAE) |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (no es un modelo de lenguaje; la entrada es un prompt de texto) |
| Tipos de cuantización | Q8 (MLX affine quantization de 8 bits); la familia incluye BF16, Q8, Q6, Q5, Q4 y Q3 |
| Idiomas soportados | no disponible (prompts en lenguaje natural; la model card no detalla cobertura) |
| Licencia | qwen-research (heredada de Qwen/Qwen-Image-2.1) |
| Formato de pesos | safetensors en formato MLX |
| Tamaño del repositorio | 18,5 GB |
| Librería de inferencia | mflux (MLX) |
| Hardware objetivo | Apple Silicon (memoria unificada) |
| Versión de conversión | MFlux 0.24.0, 31 de octubre de 2026 |
| Pipeline | text-to-image |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna del modelo base Qwen-Image-2.1: no se especifican el tipo de backbone de difusión, el número de parámetros, la resolución nativa de entrenamiento ni la composición del dataset. Lo que sí se documenta es la estructura de la conversión: MFlux cuantiza de forma independiente el text encoder, el transformer y el VAE, aplicando cuantización afín de 8 bits de MLX a los tres componentes. El nivel de cuantización queda almacenado en los propios pesos, de modo que no es necesario pasar un flag `--quantize` en tiempo de inferencia.

Tampoco se documentan procesos de RLHF, DPO ni preferencias humanas, algo esperable en un modelo de generación de imágenes. La conversión se realizó con MFlux 0.24.0 y no introduce ningún cambio más allá de la conversión de formato y la cuantización; no hay fine-tuning, destilación ni modificación de los pesos más allá del redondeo propio de la cuantización. La familia de versiones publicada por MFlux-Community permite elegir el compromiso entre tamaño y fidelidad: BF16 (33,1 GB), Q8 (18,5 GB), Q6 (14,5 GB), Q5 (12,6 GB), Q4 (10,6 GB) y Q3 (8,7 GB).

## Capacidades

- Generación de imágenes a partir de prompts de texto (pipeline `text-to-image`).
- Control de dimensiones de salida mediante parámetros de anchura y altura (el ejemplo de la model card usa 1024x1024).
- Reproducibilidad mediante semilla fija (`--seed`), útil para iterar sobre un mismo resultado.
- Ejecución local nativa en Apple Silicon a través de MLX, sin dependencia de CUDA.
- Cuantización embebida en los pesos: no requiere configuración adicional de cuantización en la CLI.
- Descarga automática de pesos en el primer uso o precarga manual con `hf download` para trabajo offline.
- No se documentan capacidades de edición de imagen, inpainting, outpainting, control por imagen de referencia ni tool calling; la información disponible no las confirma.

## Casos de uso

- Prototipado rápido de ilustraciones en un Mac: un desarrollador puede generar imágenes de 1024x1024 desde la terminal con `mflux-generate-qwen-2.1` sin montar infraestructura GPU, lo que reduce el ciclo de iteración en diseño de prompts.
- Generación de assets para aplicaciones en fase de desarrollo: placeholders, iconos o fondos generados localmente con semilla fija, integrables en un pipeline de build sin depender de APIs externas de pago.
- Trabajo con datos sensibles: al ejecutarse íntegramente en local, los prompts no salen del equipo, lo que encaja en entornos con requisitos de confidencialidad donde no se permite enviar descripciones a servicios en la nube.
- Evaluación comparativa de cuantizaciones: el mismo prompt y la misma semilla pueden ejecutarse contra Q8, Q6, Q4 y Q3 para medir la degradación visual y decidir el compromiso tamaño/calidad antes de fijar una versión en producción.
- Docencia y experimentación en generación de imágenes: el modelo cabe en un portátil Apple Silicon y permite explicar el funcionamiento de un pipeline de difusión con pesos reales sin acceso a clústeres.
- Generación por lotes en estaciones de trabajo Mac: scripts que recorren una lista de prompts y guardan resultados en disco, aprovechando la memoria unificada para mantener el modelo cargado entre invocaciones.
- Creación de contenido editorial preliminar: borradores de ilustración para revisión humana antes de encargar la versión final, con la ventaja de que el coste marginal por imagen es cero una vez descargado el modelo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card de esta conversión no incluye métricas de calidad de imagen (FID, CLIP score, evaluaciones humanas) ni comparaciones con la versión BF16 o con otros modelos texto-a-imagen. Tampoco se documentan latencia ni throughput medidos.

## Requisitos de hardware

- VRAM/memoria unificada estimada: el repositorio pesa 18,5 GB en Q8; hay que sumar el overhead del runtime MLX y los buffers de activación durante la inferencia, por lo que se recomienda un Mac con al menos 24-32 GB de memoria unificada para trabajar con margen.
- GPU recomendadas: exclusivamente Apple Silicon (serie M). No hay soporte CUDA documentado para esta conversión.
- Cabe en GPU de consumo: sí, en equipos Apple Silicon con memoria unificada suficiente; las variantes Q4 (10,6 GB) y Q3 (8,7 GB) reducen el requisito y amplían el rango de máquinas compatibles.
- Opciones de despliegue: MFlux (CLI `mflux-generate-qwen-2.1`), instalable con `uv tool install --upgrade mflux`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que además no aplican a un pipeline de difusión de este tipo.
- Latencia y throughput: no disponibles; la model card no publica tiempos de generación por imagen ni comparativas entre niveles de cuantización.

## Comparativa con modelos similares

| Modelo | Formato / hardware | Tamaño | Cuantización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| qwen-image-2-1-mflux-q8 (este) | MLX / Apple Silicon | 18,5 GB | Q8 | qwen-research | HuggingFace, comunidad |
| qwen-image-2-1-mflux-bf16 | MLX / Apple Silicon | 33,1 GB | BF16 | qwen-research | HuggingFace, comunidad |
| qwen-image-2-1-mflux-q4 | MLX / Apple Silicon | 10,6 GB | Q4 | qwen-research | HuggingFace, comunidad |
| Qwen/Qwen-Image-2.1 (original) | no disponible | no disponible | sin cuantizar | qwen-research | HuggingFace, oficial |

La comparación relevante es interna a la familia MFlux: mismo modelo base, distinto compromiso entre tamaño y fidelidad. No se dispone de datos de rendimiento que permitan comparar esta conversión con modelos texto-a-imagen de otros autores.

## Limitaciones y advertencias

- Conversión no oficial: la mantiene MFlux-Community, no los autores de Qwen-Image-2.1; no hay garantía de soporte ni de paridad exacta con el modelo original más allá de la cuantización.
- Licencia `qwen-research`: restringe el uso comercial. Cualquier despliegue en producción requiere revisar los términos completos en el enlace de licencia del modelo base antes de utilizarlo.
- Cuantización Q8: introduce una pérdida de calidad no cuantificada en la documentación; no hay métricas que permitan saber cuánto se degrada respecto a BF16.
- Sin datos de sesgo ni de alucinación visual: la model card no documenta evaluaciones de sesgo demográfico, estereotipos ni fidelidad prompt-imagen.
- Cobertura de idiomas no documentada: se desconoce el rendimiento con prompts en castellano u otros idiomas distintos del inglés.
- Dependencia de hardware Apple: no es portable a GPUs NVIDIA ni a CPU de forma directa; limita el despliegue en servidores convencionales.
- Sin benchmarks publicados: no es posible justificar la elección de esta cuantización frente a Q6 o Q4 con datos objetivos.
- Repositorio con 0 likes y creado y actualizado el mismo día: señales de una conversión reciente y con poca validación comunitaria acumulada.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/mflux-community/qwen-image-2-1-mflux-q8
- Modelo base: https://huggingface.co/Qwen/Qwen-Image-2.1
- Licencia del modelo base: https://huggingface.co/Qwen/Qwen-Image-2.1/blob/main/LICENSE
- Repositorio MFlux: https://github.com/filipstrand/mflux
- Organización MFlux-Community: https://huggingface.co/mflux-community
- Versión BF16: https://huggingface.co/mflux-community/qwen-image-2-1-mflux-bf16
- Versión Q6: https://huggingface.co/mflux-community/qwen-image-2-1-mflux-q6
- Versión Q5: https://huggingface.co/mflux-community/qwen-image-2-1-mflux-q5
- Versión Q4: https://huggingface.co/mflux-community/qwen-image-2-1-mflux-q4
- Versión Q3: https://huggingface.co/mflux-community/qwen-image-2-1-mflux-q3
