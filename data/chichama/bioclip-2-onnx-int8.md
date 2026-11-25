# chichama/bioclip-2-onnx-int8

## Resumen

BioCLIP 2 ONNX int8 es una conversión del codificador de imágenes de imageomics/bioclip-2, un modelo de visión-lenguaje especializado en biología y, en particular, en organismos marinos. El autor de la conversión es el usuario chichama, que lo publica como artefacto ONNX cuantizado a int8 con un tamaño de 308 MB, pensado para ejecutarse en un teléfono móvil. El modelo original lo desarrolla el equipo de Imageomics (Ohio State University) y se distribuye bajo licencia MIT.

El problema que resuelve esta versión concreta es el despliegue offline en dispositivos con recursos limitados: el codificador de imágenes recibe un tensor `[1, 3, 224, 224]` en float32 y devuelve un embedding de 768 dimensiones que se compara por similitud coseno contra embeddings de texto o de referencia. No incluye el codificador de texto, solo la torre visual, por lo que su uso es la extracción de características de imagen y la búsqueda o clasificación por similitud.

Es relevante ahora porque demuestra un patrón de despliegue práctico de un modelo científico especializado (taxonomía biológica y marina) en un entorno móvil y sin conexión, con un peso de repositorio de 0,3 GB. La información disponible sobre el modelo original es limitada en esta ficha: los detalles de arquitectura, entrenamiento y benchmarks del modelo base no se han proporcionado más allá de la referencia al paper arXiv:2505.23883.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Codificador de imágenes tipo CLIP (ViT), exportado a ONNX; arquitectura exacta del backbone no disponible |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión, entrada de imagen fija de 224×224) |
| Tipos de cuantizacion | int8 (pesos cuantizados); entrada float32 |
| Idiomas soportados | no disponible (modelo de visión; no procesa texto) |
| Licencia | MIT |
| Formato de pesos | ONNX (int8, 308 MB) |

## Arquitectura y entrenamiento

Esta publicación es un artefacto de despliegue, no un entrenamiento nuevo: contiene el codificador de imágenes de BioCLIP 2 exportado a ONNX y cuantizado a int8. La arquitectura del backbone corresponde al modelo base imageomics/bioclip-2, del que no se detallan en la información disponible el número de parámetros, la profundidad ni la configuración exacta de atención. La entrada está fijada a `[1, 3, 224, 224]` en formato NCHW, con preprocesado CLIP estándar: redimensionado del lado corto a 224 con interpolación bicúbica, recorte central de 224×224, escalado a rango 0..1 y normalización con la media y desviación típica indicadas en `preprocess.json`.

La salida es un vector de 768 dimensiones que debe compararse mediante similitud coseno. No se dispone de información sobre el volumen de datos de entrenamiento, la composición del dataset, el uso de RLHF/DPO ni innovaciones técnicas del modelo original en la información proporcionada; la model card remite al paper arXiv:2505.23883 y a la model card original para esos detalles. La cuantización a int8 es la innovación práctica de esta versión, orientada a reducir el tamaño y permitir inferencia en móvil.

## Capacidades

- Extracción de características de imagen: genera embeddings de 768 dimensiones a partir de imágenes RGB de 224×224.
- Búsqueda y clasificación por similitud: comparación por similitud coseno contra embeddings de referencia (por ejemplo, de texto en el modelo completo o de imágenes de catálogo).
- Especialización biológica y marina: el modelo base está orientado a la identificación de organismos, según la model card del autor y la referencia al paper de BioCLIP 2.
- Inferencia offline en dispositivo: el formato ONNX int8 de 308 MB está pensado para ejecutarse en un teléfono sin conexión.
- Integración en aplicaciones móviles: el autor lo usa en Muckbook, una app no comercial de identificación de animales para buceadores.
- No incluye codificador de texto: esta exportación solo cubre la torre visual, por lo que no realiza zero-shot con prompts de texto por sí sola.
- Tool calling, agentes, razonamiento multi-paso y capacidades multilingües: no disponibles (no es un modelo generativo de lenguaje).

## Casos de uso

- Identificación de fauna marina en aplicaciones de buceo: la app calcula el embedding de la foto tomada por el buceador y lo compara por similitud coseno contra una galería de especies precalculada, todo en el dispositivo y sin conexión, gracias al tamaño de 308 MB y al formato ONNX.
- Clasificación de imágenes biológicas en campo: investigadores o ciudadanos pueden desplegar el codificador en un móvil o una Raspberry Pi para etiquetar especímenes por proximidad en el espacio de embeddings, sin depender de red.
- Búsqueda visual en catálogos de biodiversidad: indexar una colección de imágenes de referencia con embeddings de 768 dimensiones y recuperar las más similares a una consulta mediante similitud coseno.
- Filtrado y triaje de imágenes de cámaras trampa: precalcular embeddings de un flujo de imágenes y agrupar o descartar capturas por similitud antes de un análisis más costoso en servidor.
- Aplicaciones educativas offline: guías de campo interactivas que identifican organismos a partir de una foto sin necesidad de conectividad.
- Componente de un pipeline multimodal: usar el embedding visual como entrada para un clasificador ligero o un sistema de recuperación aumentada, combinándolo con un codificador de texto del modelo base si se dispone de él.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: muy baja; el artefacto pesa 308 MB en int8, por lo que la memoria necesaria para pesos y activaciones de una sola imagen de 224×224 es del orden de cientos de MB.
- GPU recomendadas: no requiere GPU; puede ejecutarse en CPU. Para lote grande en servidor, cualquier GPU con al menos 2 GB de memoria es suficiente, aunque no se dispone de cifras oficiales.
- Cabe en GPU de consumo: sí, en cualquier GPU de consumo moderna (por ejemplo, GTX 1650 o superior) e incluso en CPU móvil.
- Opciones de despliegue: ONNX Runtime (incluido en apps móviles), y conversión adicional a otros runtimes ONNX si se necesita.
- Latencia y throughput estimados: no disponibles; dependen del dispositivo y del runtime ONNX empleado.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto/entrada | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| chichama/bioclip-2-onnx-int8 | no disponible | imagen 224×224, salida 768 dim | ONNX int8 (308 MB) | MIT | Hugging Face |
| imageomics/bioclip-2 | no disponible | imagen 224×224, salida 768 dim | safetensors/PyTorch (no confirmado) | MIT | Hugging Face |
| CLIP ViT-B/32 (OpenAI) | ~151 M (torre visual) | imagen 224×224, salida 512 dim | PyTorch, ONNX | MIT | Hugging Face, repositorios públicos |

La comparación con CLIP genérico es orientativa: BioCLIP 2 está especializado en biología, mientras que CLIP es de propósito general. No se dispone de datos de rendimiento comparado en la información proporcionada.

## Limitaciones y advertencias

- Solo incluye el codificador de imágenes: no hay torre de texto, por lo que no puede hacer zero-shot con etiquetas textuales sin un codificador de texto adicional compatible.
- Entrada fija de 224×224: no admite resoluciones variables ni imágenes de mayor tamaño sin reescalado, lo que puede perder detalle en organismos pequeños.
- Especialización estrecha: el modelo base está orientado a biología y organismos marinos; su rendimiento fuera de ese dominio no está documentado.
- Sesgos: no se dispone de información sobre sesgos del modelo base en la documentación proporcionada.
- Riesgo de alucinación: no aplica en el sentido generativo, pero la similitud coseno puede producir falsos positivos en especies visualmente parecidas; conviene umbralizar y validar.
- Licencia MIT: permite uso comercial, pero se debe citar el paper de BioCLIP 2 (arXiv:2505.23883) según indica el autor.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: artefacto reciente y sin validación comunitaria amplia.
- No se han publicado métricas de precisión tras la cuantización int8: la pérdida de exactitud respecto al modelo original no está cuantificada.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/chichama/bioclip-2-onnx-int8
- Modelo base: https://huggingface.co/imageomics/bioclip-2
- Paper de BioCLIP 2: https://arxiv.org/abs/2505.23883
