# Pengyu965/ChartReformer

## Resumen

ChartReformer es un modelo de edición de gráficos (charts) a partir de imágenes y una instrucción en lenguaje natural, desarrollado por Pengyu Yan, Mahesh Bhosale, Jay Lal, Bikhyat Adhikari y David Doermann en la University at Buffalo. Se presentó en ICDAR 2024 y resuelve un problema concreto: la mayoría de los gráficos que circulan en artículos, informes y presentaciones son imágenes sin acceso a su tabla de datos ni a su código de trazado, de modo que modificarlos exigía reconstruirlos desde cero. ChartReformer recibe la imagen del gráfico y una orden de edición y devuelve una descripción JSON estructurada del gráfico editado, que un replotter determinista basado en Matplotlib convierte en imagen.

El modelo emplea la arquitectura Pix2Struct (un transformer encoder-decoder para imágenes), con unos 282 millones de parámetros, inicializado desde DePlot de Google. Se entrenó en dos etapas: una primera de de-renderizado de gráficos (imagen a tabla de datos más atributos visuales) y una segunda de ajuste fino específico para edición. La entrada se redimensiona con relleno blanco a 800×800 píxeles, con hasta 512 parches de imagen, y la salida puede alcanzar 1024 tokens.

La relevancia actual del modelo es fundamentalmente metodológica: define y estandariza por primera vez la tarea de edición de gráficos, introduce el conjunto de datos ChartCraft (unas 100.000 parejas de gráficos originales y editados con sus tablas e instrucciones) y propone métricas de evaluación específicas como el Visual Attribute Edit Score (VAES). Al predecir parámetros estructurados en lugar de código de trazado, consigue que aproximadamente el 99,9 % de sus salidas se rendericen correctamente, evitando los fallos de compilación típicos de los enfoques generadores de código.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Pix2Struct (transformer encoder-decoder para imagen-texto) |
| Parámetros totales | 282.285.696 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | hasta 512 parches de imagen de entrada; hasta 1024 tokens de salida |
| Tipos de cuantización | no disponible (pesos en safetensors; sin variantes GGUF publicadas) |
| Idiomas soportados | inglés |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

ChartReformer se basa en Pix2Struct, un transformer encoder-decoder diseñado para comprender imágenes de documentos y gráficos. El encoder procesa la imagen del gráfico dividida en parches (hasta 512), mientras que el decoder genera secuencias de texto de hasta 1024 tokens. El modelo parte de los pesos de google/deplot, un modelo especializado en extraer tablas de datos a partir de imágenes de gráficos, y se ajusta en dos fases secuenciales.

La primera fase es un preentrenamiento de de-renderizado de gráficos: dado un gráfico, el modelo aprende a producir su tabla de datos subyacente junto con los atributos visuales (tipo de gráfico, colores, estilos de línea, marcadores, fuentes, leyenda, rejilla, etc.). El checkpoint de esta fase se publica en el subdirectorio `pretrain/` (paso 48K). La segunda fase es un ajuste fino para edición de gráficos con el dataset ChartCraft, donde la instrucción del usuario se usa como prompt y la salida es la descripción JSON del gráfico editado; el checkpoint resultante, en la raíz del repositorio (paso 20K), es el modelo por defecto. La innovación técnica clave es predecir una representación estructurada (tabla más atributos visuales) en lugar de código de trazado, lo que un replotter determinista convierte en imagen y garantiza una alta tasa de renderizado correcto.

## Capacidades

- Edición de gráficos a partir de imágenes mediante instrucciones en lenguaje natural, sin acceso a los datos originales ni al código de trazado.
- Edición de estilo: color de trazado, estilo de línea, marcadores, patrones de trama de barras, familia y tamaño de fuente.
- Edición de disposición: líneas de rejilla y posición y disposición interna de la leyenda.
- Edición de formato: conversión entre gráfico de líneas y barras agrupadas, entre líneas y barras apiladas, y entre barras agrupadas y apiladas.
- Edición centrada en datos: filtrado por rango y por serie, adición o eliminación de puntos de datos y de series de datos.
- De-renderizado de gráficos: extracción de la tabla de datos subyacente y de los atributos visuales a partir de una imagen (checkpoint `pretrain/`).
- Generación de descripciones JSON estructuradas que un replotter basado en Matplotlib convierte en la imagen editada.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: limitadas al inglés.
- Capacidades especiales: ninguna adicional documentada (sin visión general, audio ni modo de razonamiento).

## Casos de uso

- Actualización de figuras en publicaciones científicas: dado un gráfico de un artículo del que solo se conserva la imagen, el modelo permite cambiar colores, estilos de línea o añadir rejilla mediante una instrucción, regenerando la figura sin necesidad de reconstruir los datos a mano.
- Adaptación de gráficos a guías de estilo corporativas: se pueden aplicar cambios sistemáticos de fuente, colores y disposición de leyenda sobre imágenes de gráficos existentes en informes y presentaciones, manteniendo la coherencia visual de la documentación.
- Conversión de tipos de gráfico en informes: transformar un gráfico de líneas en barras agrupadas o apiladas para adaptar la visualización a distintas audiencias o formatos de entrega, partiendo únicamente de la imagen original.
- Edición de series y puntos de datos: añadir o eliminar series o puntos concretos y filtrar por rango sobre gráficos de los que no se dispone la tabla de datos, útil para corregir o actualizar figuras en documentación heredada.
- Recuperación de datos de gráficos (de-renderizado): con el checkpoint `pretrain/`, extraer la tabla de datos y los atributos visuales de imágenes de gráficos para reconstruir el conjunto de datos subyacente o migrarlo a otra herramienta de visualización.
- Investigación en edición de documentos y gráficos: servir como línea base reproducible para la tarea de edición de gráficos definida en el artículo, con el dataset ChartCraft y las métricas VAES, RMS y SSIM para comparar nuevos métodos.
- Automatización de pipelines documentales: integrar el modelo en flujos que procesan lotes de figuras y aplican ediciones estandarizadas (por ejemplo, normalización de fuentes y leyendas) antes de publicar o archivar documentos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo tiene 282 millones de parámetros, lo que en precisión fp32 supone aproximadamente 1,1 GB de pesos; en fp16, alrededor de 0,56 GB. Sumando activaciones y procesamiento de imagen, la inferencia cabe holgadamente en GPUs de consumo con 4-8 GB de VRAM.
- GPU recomendadas: cualquier GPU moderna es suficiente; para lotes grandes o procesamiento por lotes se recomiendan A100, H100 o RTX 4090, aunque no son necesarias para inferencia individual.
- Cabe en GPU de consumo: sí, en tarjetas como RTX 3060, RTX 4060, RTX 4090 y similares; también puede ejecutarse en CPU, aunque con mayor latencia.
- Opciones de despliegue: la model card documenta el uso con la librería `transformers` (versiones 4.37.2 y 5.6.0 probadas) mediante `AutoProcessor` y `Pix2StructForConditionalGeneration`. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ChartReformer | 282 M | 512 parches de imagen / 1024 tokens de salida | Edición y de-renderizado de gráficos | MIT | Hugging Face |
| google/deplot | no disponible en la información | no disponible en la información | De-renderizado de gráficos (imagen a tabla) | no disponible en la información | Hugging Face |
| Alternativas de edición de gráficos | no disponible | no disponible | no disponible | no disponible | no disponible |

ChartReformer se inicializa desde google/deplot y hereda su arquitectura Pix2Struct, pero añade la capacidad de edición guiada por instrucciones, que DePlot no ofrece. No se dispone de información sobre otros modelos comparables de edición de gráficos en la documentación proporcionada.

## Limitaciones y advertencias

- El modelo solo admite instrucciones en inglés; no hay soporte multilingüe documentado.
- Está especializado exclusivamente en gráficos; no es un modelo de propósito general y no debe esperarse de él generación de texto libre, código, matemáticas o razonamiento general.
- Las ediciones están acotadas a la taxonomía del artículo (estilo, disposición, formato y datos); instrucciones fuera de ese conjunto pueden no producir resultados válidos.
- Riesgo de alucinación en la extracción de la tabla de datos y de atributos visuales: al predecir la tabla subyacente, puede generar valores que no correspondan exactamente a los del gráfico original, especialmente en gráficos densos o de baja resolución.
- La calidad del resultado depende del replotter determinista de Matplotlib; el JSON predicho debe ser válido y completo para renderizarse correctamente, aunque el artículo reporta una tasa de renderizado del 99,9 %.
- La entrada se redimensiona a 800×800 con relleno blanco; gráficos con relaciones de aspecto extremas o detalles finos pueden perder información.
- Licencia MIT: permite uso comercial, pero se recomienda revisar las condiciones de los pesos base de google/deplot de los que deriva.
- Los pesos publicados corresponden a los checkpoints originales del artículo de 2024, subidos a Hugging Face en octubre de 2026; no se trata de una versión nueva ni de trabajo adicional.
- No se documentan sesgos específicos del modelo en la información disponible.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Pengyu965/ChartReformer
- Artículo en arXiv: https://arxiv.org/abs/2403.00209
- Artículo en Springer (ICDAR 2024): https://link.springer.com/chapter/10.1007/978-3-031-70533-5_26
- Código en GitHub: https://github.com/pengyu965/ChartReformer
- Dataset ChartCraft: https://huggingface.co/datasets/Pengyu965/ChartCraft
- Modelo base DePlot: https://huggingface.co/google/deplot
