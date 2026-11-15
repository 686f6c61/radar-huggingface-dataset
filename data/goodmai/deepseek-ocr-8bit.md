# goodmai/DeepSeek-OCR-8bit

## Resumen

DeepSeek-OCR-8bit es una conversión al formato MLX del modelo DeepSeek-OCR, un modelo de visión-lenguaje especializado en reconocimiento óptico de caracteres (OCR) y extracción de texto a partir de imágenes. El repositorio publicado por el usuario goodmai en Hugging Face empaqueta los pesos en cuantización de 8 bits para su ejecución eficiente en hardware Apple Silicon mediante la librería mlx-vlm. El modelo original procede de DeepSeek y ha sido redistribuido a través de la variante prince-canuma/DeepSeek-OCR antes de su conversión a MLX.

El modelo cuenta con aproximadamente 3.336 millones de parámetros totales (3,3 mil millones) y está diseñado para tareas de image-text-to-text, con especial énfasis en OCR, aunque también soporta descripción de imágenes y conversación multimodal. Su licencia MIT facilita su uso comercial y su integración en productos, siempre que se respeten las condiciones de la licencia original.

La relevancia de esta ficha radica en que ofrece una vía práctica para ejecutar un modelo de OCR multimodal de tamaño medio en equipos con Apple Silicon, un escenario cada vez más común entre desarrolladores que necesitan procesar documentos sin depender de servicios en la nube. No obstante, la información pública disponible sobre el modelo es limitada: la model card es escueta y no se han publicado resultados de benchmarks ni detalles de entrenamiento en la información proporcionada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-language transformer (detalles no disponibles) |
| Parametros totales | 3.336.106.240 (≈3,3 mil millones) |
| Parametros activos | no disponible (no es MoE según la información disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 8 bits (MLX); otras cuantizaciones del modelo original no disponibles |
| Idiomas soportados | multilingüe (sin listado concreto) |
| Licencia | MIT |
| Formato de pesos | safetensors (MLX), custom_code |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna del modelo más allá de su naturaleza vision-language y su propósito de OCR. Por el nombre y el pipeline asignado (image-text-to-text), se trata de un transformer multimodal que combina un codificador visual con un decodificador de lenguaje, pero no se especifican el número de capas, la dimensión oculta, el mecanismo de atención ni el tipo de tokenizador visual. Tampoco se documentan los datos de entrenamiento: ni el número de tokens, ni la composición del dataset, ni si se aplicaron técnicas de RLHF, DPO o ajuste supervisado.

La innovación técnica destacable en este repositorio concreto es la conversión a MLX con cuantización de 8 bits, realizada con mlx-vlm versión 0.3.10 a partir de la variante prince-canuma/DeepSeek-OCR. Esta conversión permite ejecutar el modelo en hardware Apple Silicon con un consumo de memoria reducido en comparación con los pesos en precisión completa. No se dispone de información sobre innovaciones arquitectónicas propias del modelo original, como decodificación especulativa o atención lineal.

## Capacidades

- Reconocimiento óptico de caracteres (OCR): extracción de texto desde imágenes, su función principal según los tags del repositorio.
- Descripción de imágenes: el pipeline image-text-to-text permite generar descripciones a partir de una imagen de entrada.
- Conversación multimodal: el tag "conversational" indica soporte para interacción por turnos con entrada de imagen y texto.
- Soporte multilingüe: el modelo declara capacidad multilingüe, aunque no se detalla la lista de idiomas.
- Extracción de características: el tag "feature-extraction" sugiere que puede emplearse para obtener representaciones vectoriales de imágenes o texto.
- Tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades especiales (thinking mode, audio, visión avanzada): solo se confirma visión; el resto no está documentado.

## Casos de uso

- Digitalización de documentos en macOS: ejecutar el modelo con mlx-vlm en un Mac con Apple Silicon para convertir facturas, contratos o formularios escaneados en texto editable, aprovechando la cuantización de 8 bits para reducir el uso de memoria.
- Extracción de texto en aplicaciones de escritorio: integrar el modelo en una app nativa de macOS que procese capturas de pantalla o PDFs renderizados como imagen y devuelva el texto reconocido sin enviar datos a la nube.
- Procesamiento por lotes de archivos escaneados: usar el script `mlx_vlm.generate` en un pipeline local para recorrer un directorio de imágenes y generar transcripciones, adecuado por su licencia MIT y su ejecución offline.
- Asistencia a la accesibilidad: convertir imágenes con texto (carteles, menús, etiquetas) en texto legible o voz mediante un flujo que combine el OCR del modelo con un sintetizador de voz local.
- Prototipado de productos de visión-lenguaje: emplear el modelo como base para experimentar con tareas de descripción de imágenes y conversación multimodal en entornos de desarrollo con hardware Apple, gracias a la integración con mlx-vlm.
- Investigación en OCR multilingüe: utilizar el modelo para comparar el rendimiento de extracción de texto en distintos idiomas sobre un corpus propio, dado su carácter multilingüe declarado.
- Preprocesamiento de datos para entrenamiento: extraer texto de imágenes de un dataset para construir corpus textuales o pares imagen-texto, usando la capacidad de feature-extraction y OCR del modelo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con 3,3 mil millones de parámetros en 8 bits, los pesos ocupan aproximadamente 3,3 GB; el uso total de memoria (incluyendo activaciones y caché) puede situarse en torno a 4-6 GB, aunque no se dispone de cifras oficiales.
- GPU recomendadas: el repositorio está orientado a MLX, por lo que el hardware objetivo son los chips Apple Silicon (series M1, M2, M3, M4). No se documenta soporte para GPU NVIDIA en esta conversión concreta.
- ¿Cabe en GPU de consumo? Sí, en equipos Apple Silicon con al menos 8 GB de memoria unificada; en el ecosistema NVIDIA, el modelo original (no esta conversión MLX) podría ejecutarse en GPUs con 8-16 GB de VRAM, pero no está confirmado en la información disponible.
- Opciones de despliegue: mlx-vlm (método documentado en la model card). Otras opciones como vLLM, llama.cpp, Ollama o TGI no están documentadas para esta conversión.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato / despliegue | Notas |
|---|---|---|---|---|---|
| DeepSeek-OCR-8bit (este) | ≈3,3 mil millones | no disponible | MIT | MLX, safetensors | Conversión comunitaria para Apple Silicon |
| prince-canuma/DeepSeek-OCR | no disponible | no disponible | no disponible | transformers | Modelo base del que deriva esta conversión |
| Otros modelos OCR vision-language | no disponible | no disponible | no disponible | no disponible | No se dispone de datos comparativos en la información proporcionada |

No se dispone de información suficiente para establecer una comparativa cuantitativa con alternativas de la misma categoría.

## Limitaciones y advertencias

- Información muy limitada: la model card es mínima y no documenta arquitectura, datos de entrenamiento ni evaluación, lo que dificulta valorar su calidad real.
- Riesgo de alucinación: como todo modelo generativo, puede producir texto que no aparece en la imagen, especialmente en documentos con baja resolución o ruido.
- Sesgos conocidos: no documentados; al ser un modelo multilingüe sin listado de idiomas, el rendimiento puede variar mucho entre lenguas.
- Limitaciones de contexto e idioma: se desconoce la longitud máxima de contexto y la cobertura lingüística exacta.
- Restricciones de licencia: la licencia MIT permite uso comercial, pero conviene verificar la licencia del modelo original y de la variante intermedia, ya que la cadena de conversiones puede introducir condiciones adicionales.
- Dependencia de MLX: esta conversión está pensada para Apple Silicon; no es directamente portable a otros entornos sin reconvertir los pesos.
- Repositorio sin tracción: 0 descargas y 0 likes en el momento de la consulta, lo que implica ausencia de validación comunitaria.
- Fecha de creación futura (2026-11-15): conviene verificar la autenticidad y vigencia del repositorio antes de usarlo en producción.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/goodmai/DeepSeek-OCR-8bit
- Modelo original referenciado en la model card: https://huggingface.co/prince-canuma/DeepSeek-OCR
- Repositorio referenciado en la model card (mlx-community): https://huggingface.co/mlx-community/DeepSeek-OCR-8bit
- Librería mlx-vlm: no se proporciona URL directa en la información disponible.
