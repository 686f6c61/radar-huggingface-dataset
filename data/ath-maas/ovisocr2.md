# ATH-MaaS/OvisOCR2

## Resumen

OvisOCR2 es un modelo multimodal compacto de 0,8 mil millones de parámetros desarrollado por ATH-MaaS para el parsing de documentos a nivel de página. Dada una imagen de una página, genera una representación en Markdown siguiendo el orden de lectura natural, cubriendo texto, fórmulas, tablas y regiones visuales. Está construido sobre la base de Qwen3.5-0.8B y ha sido post-entrenado mediante un pipeline de datos que combina muestras reales y sintéticas, junto con un entrenamiento multi-etapa que integra SFT, RL y OPD (Optimized Policy Distillation).

El modelo destaca por ser el primero end-to-end en liderar el leaderboard de OmniDocBench v1.6, con una puntuación global de 96,58, superando a métodos pipeline tradicionales. También alcanza la mejor puntuación Avg3 (75,06) en PureDocBench. Su tamaño reducido lo hace adecuado para despliegues con recursos limitados, manteniendo un rendimiento competitivo en tareas de extracción de documentos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (basado en Qwen3.5-0.8B) |
| Parametros totales | 0,8 mil millones |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible (max_tokens de generacion: 16384) |
| Tipos de cuantizacion | No especificados (formato safetensors, cuantificable) |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

OvisOCR2 se basa en la arquitectura transformer multimodal de Qwen3.5-0.8B, que procesa imágenes y texto de forma conjunta. El modelo ha sido post-entrenado mediante un data engine que combina datos reales y sintéticos, y un esquema de entrenamiento en varias etapas que integra supervisión fina (SFT), aprendizaje por refuerzo (RL) y destilación de política optimizada (OPD). Esta combinación permite al modelo aprender a generar Markdown estructurado a partir de imágenes de páginas, incluyendo la transcripción de texto, la conversión de tablas a HTML, la representación de fórmulas en LaTeX y la identificación de regiones visuales mediante etiquetas `<img>` con coordenadas de bounding box.

El prompt de inferencia está diseñado para extraer todo el contenido legible en orden de lectura natural, sin traducir ni parafrasear el texto original. El modelo admite un máximo de 16384 tokens de generación y se recomienda usar temperatura 0 para resultados deterministas.

## Capacidades

- Generacion de Markdown estructurado a partir de imagenes de paginas de documentos.
- Reconocimiento de texto (OCR) en orden de lectura natural.
- Conversion de tablas a formato HTML (`<table>...</table>`).
- Representacion de formulas matematicas en LaTeX.
- Deteccion de regiones visuales (graficos, imagenes) mediante etiquetas `<img>` con coordenadas de bounding box escaladas a [0, 1000).
- Soporte para procesamiento por lotes de multiples imagenes en una sola llamada.
- Integracion con vLLM para inferencia eficiente en GPU.
- Capacidad de filtrado de etiquetas de imagen para obtener solo texto plano.

## Casos de uso

- **Digitalizacion de documentos historicos**: convertir escaneos de libros o archivos en Markdown editable, preservando el orden de lectura y las formulas.
- **Extraccion de tablas de informes financieros**: transformar tablas complejas en HTML estructurado para su posterior analisis o integracion en bases de datos.
- **Procesamiento de facturas y recibos**: extraer campos clave (importes, fechas, proveedores) en formato Markdown para automatizar flujos de contabilidad.
- **Generacion de documentacion tecnica**: convertir manuales o especificaciones en PDF a Markdown para su versionado en repositorios.
- **Preparacion de datos para RAG**: transformar documentos escaneados en texto estructurado para indexar en sistemas de recuperacion aumentada.
- **Accesibilidad**: convertir documentos impresos a texto legible por lectores de pantalla, incluyendo la descripcion de regiones visuales mediante etiquetas de imagen.

## Benchmarks y rendimiento

| Benchmark | Metrica | Resultado |
|---|---|---|
| OmniDocBench v1.6 | Puntuacion global | 96,58 |
| PureDocBench | Avg3 | 75,06 |

Segun la informacion proporcionada, OvisOCR2 es el primer modelo end-to-end en liderar el leaderboard de OmniDocBench v1.6, que anteriormente estaba dominado por metodos pipeline. No se han publicado comparaciones detalladas con otros modelos en la informacion disponible.

## Requisitos de hardware

- **VRAM estimada**: al ser un modelo de 0,8B, la inferencia en FP16 requiere aproximadamente 1,6 GB de VRAM; con cuantizacion de 8 bits se reduce a ~0,8 GB y con 4 bits a ~0,5 GB (estimaciones basadas en el tamano del modelo, no confirmadas por el autor).
- **GPU recomendadas**: cualquier GPU con al menos 2 GB de VRAM, incluyendo GPUs consumer como RTX 3060, RTX 4060 o superiores. Tambien es compatible con GPUs de datacenter como A10, A100 o H100.
- **Despliegue**: el codigo de ejemplo utiliza vLLM (version 0.22.1) con `gdn_prefill_backend="triton"`. Tambien puede desplegarse con otras herramientas compatibles con transformers, como TGI o llama.cpp (si se convierte a GGUF).
- **Latencia y throughput**: no se han publicado datos especificos, pero al ser un modelo pequeno, se espera una latencia baja y un throughput alto en GPUs modernas.

## Comparativa con modelos similares

No se dispone de informacion comparativa con otros modelos de parsing de documentos en la documentacion proporcionada. OvisOCR2 compite principalmente con metodos pipeline (como los que dominaban OmniDocBench) y con otros modelos end-to-end de OCR, pero no se han facilitado datos concretos de esos competidores.

## Limitaciones y advertencias

- **Idiomas**: no se especifican los idiomas soportados; el prompt de inferencia esta en ingles, por lo que el rendimiento en otros idiomas puede ser inferior.
- **Alucinacion**: como todo modelo generativo, puede producir texto incorrecto o inventado, especialmente en documentos con baja calidad de imagen o contenido ambiguo.
- **Longitud de contexto**: aunque el max_tokens de generacion es 16384, la longitud de contexto real del modelo no esta documentada; documentos muy largos pueden requerir particionado.
- **Region visual**: las etiquetas `<img>` generadas requieren post-procesamiento para extraer los recortes de imagen; si no se filtran, el Markdown resultante no es directamente renderizable sin esos archivos.
- **Licencia**: Apache 2.0 permite uso comercial, pero se recomienda revisar los terminos de la licencia de Qwen3.5-0.8B, que es el modelo base.
- **Dependencia de vLLM**: el codigo de ejemplo requiere vLLM 0.22.1, lo que puede limitar su uso en entornos sin esa version.

## Enlaces

- [Modelo en HuggingFace](https://huggingface.co/ATH-MaaS/OvisOCR2)
- [Technical Report (arXiv)](https://arxiv.org/abs/2607.13639)
- [Demo online](https://huggingface.co/spaces/ATH-MaaS/OvisOCR2)
