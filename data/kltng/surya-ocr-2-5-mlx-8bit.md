# kltng/surya-ocr-2.5-mlx-8bit

## Resumen

Surya OCR 2.5 en formato MLX de 8 bits es una conversión no oficial del modelo `datalab-to/surya-ocr-2.5` de Datalab, empaquetada por el usuario kltng para su ejecución en Apple Silicon mediante la librería MLX. Se trata de un modelo de visión-lenguaje especializado en OCR (reconocimiento óptico de caracteres) y análisis de documentos, construido sobre la arquitectura `qwen3_5` según los metadatos del repositorio, con aproximadamente 689 millones de parámetros totales y un peso de 0,8 GB en el repositorio.

El modelo resuelve el problema de extracción de texto y estructura a partir de imágenes de páginas, incluyendo material complejo como impresión moderna, xilografía (woodblock) y texto vertical, con soporte declarado para chino. Su relevancia radica en que permite ejecutar un pipeline OCR de calidad en hardware de consumo Apple (por ejemplo, un Mac mini M4 con 16 GB), sin depender de GPU dedicadas ni de servicios en la nube.

Esta ficha documenta exclusivamente la build MLX cuantizada a 8 bits; el modelo original de Datalab es la referencia de calidad y de licencia. La conversión no está respaldada por Datalab y no debe confundirse con una versión oficial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | qwen3_5 (vision-lenguaje, según metadatos del repo) |
| Parametros totales | 689.356.864 (~689 M) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 8 bits affine, group size 64; resto en bfloat16 |
| Idiomas soportados | no disponible en metadatos; la evaluación del autor usa material en chino |
| Licencia | openrail (AI Pubs Open RAIL-M modificada) |
| Formato de pesos | safetensors (MLX) |

## Arquitectura y entrenamiento

La build se basa en el modelo `datalab-to/surya-ocr-2.5`, cuya arquitectura se etiqueta como `qwen3_5` en los metadatos del repositorio, lo que sugiere un transformer de visión-lenguaje con codificador de imagen y decodificador de texto. El proceso de conversión se realizó con `surya/scripts/build_mlx.py` de surya-ocr 0.23.0 y mlx-vlm 0.7.10: los pesos se convirtieron a MLX y se cuantizaron a 8 bits con cuantización afín y tamaño de grupo 64, manteniendo el resto en bfloat16. También se restauraron los ficheros del tokenizador originales y se corrigió `eos_token_id` en `config.json` y `generation_config.json`.

No se dispone de información sobre el volumen de tokens de entrenamiento, la composición del dataset ni si el modelo original empleó RLHF, DPO u otras técnicas de alineación. Tampoco se detallan innovaciones como decodificación especulativa o atención lineal. La información disponible se limita al proceso de conversión y a los ajustes de configuración aplicados por el autor de la build.

## Capacidades

- Reconocimiento óptico de caracteres (OCR) sobre imágenes de páginas de documentos.
- Procesamiento de material difícil: impresión moderna, xilografía y texto vertical.
- Extracción de texto en chino, incluyendo formas tradicionales y simplificadas (la evaluación del autor aplica folding entre ambas).
- Pipeline image-text-to-text conversacional según el tag del repositorio.
- Ejecución en Apple Silicon mediante MLX y mlx-vlm.
- Integración con la CLI `surya_ocr` mediante variables de entorno (`SURYA_INFERENCE_BACKEND=mlx`, `SURYA_MLX_MODEL`).
- No se documentan capacidades de tool calling, agentes, audio ni modo thinking.

## Casos de uso

- Digitalización de fondos bibliográficos chinos: el modelo está evaluado sobre 150 páginas de cuatro libros con impresión moderna y xilografía, con texto vertical, lo que lo hace adecuado para proyectos de preservación digital que requieran manejar tipografías históricas y disposición vertical.
- Procesamiento OCR en estaciones de trabajo Mac: al ejecutarse con MLX sobre un Mac mini M4 de 16 GB a aproximadamente 8 segundos por página, permite montar un pipeline local sin GPU dedicada ni costes de API.
- Extracción de texto para pipelines de búsqueda y recuperación: la salida OCR puede alimentar índices de texto completo o sistemas RAG sobre corpus documentales escaneados.
- Preprocesado de documentos para investigación: investigadores que necesiten transcribir corpus de libros impresos o xilográficos pueden usar la build como paso previo a anotación o análisis lingüístico.
- Prototipado y evaluación de calidad OCR: la comparación publicada frente a la build GGUF de llama.cpp (error mediano 2,7 % frente a 2,6 %) permite usar esta versión como referencia en pruebas comparativas de backends.
- Despliegue mediante servidor mlx-vlm: el modelo puede servirse con `mlx_vlm.server`, aunque el autor advierte de que este servidor lista todos los modelos en caché y puede enrutar peticiones a otro modelo; se recomienda un `HF_HUB_CACHE` aislado.

## Benchmarks y rendimiento

El autor publica una evaluación sobre 150 páginas muestreadas de cuatro libros chinos (impresión moderna y xilografía, texto vertical), ejecutada en un Mac mini M4 de 16 GB. El error es la tasa de error de caracteres tras unificar formas tradicionales y simplificadas; menor es mejor.

| Metrica | Esta build (MLX 8-bit) | Surya 2.5 GGUF (llama.cpp) |
|---|---|---|
| Error mediano por pagina | 2,7 % | 2,6 % |
| Error en paginas faciles | 2,8 % | 2,7 % |
| Error en paginas dificiles | 17,8 % | 16,8 % |
| Proporcion de texto encontrado | 94,7 % | 95,0 % |

El autor advierte de que estos números provienen de una única prueba pequeña sobre un tipo concreto de material y pueden no generalizarse. La velocidad de la build GGUF no se compara porque se ejecutó en otra máquina. Esta build tarda aproximadamente 8 segundos por página, procesando una página a la vez.

## Requisitos de hardware

- VRAM/ memoria unificada: el repositorio ocupa 0,8 GB; con 689 M de parámetros en 8 bits más las capas en bfloat16, la inferencia cabe holgadamente en equipos con 16 GB de memoria unificada.
- GPU recomendadas: Apple Silicon (probado en Mac mini M4 con 16 GB). No se documenta soporte para GPU NVIDIA o AMD en esta build.
- GPU de consumo: sí, en equipos Apple Silicon; no aplica a GPU discretas convencionales por el uso de MLX.
- Opciones de despliegue: CLI `surya_ocr` con backend MLX, y servidor `mlx_vlm.server`. Requiere `surya-ocr==0.23.0` y `mlx-vlm==0.7.10`.
- Latencia y throughput: aproximadamente 8 segundos por página en Mac mini M4, procesamiento de una página a la vez.
- Advertencia de despliegue: mantener este modelo aislado en su caché de Hugging Face (`HF_HUB_CACHE` dedicado) para evitar que `mlx_vlm.server` enrute peticiones a otros modelos en caché.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato / plataforma | Notas |
|---|---|---|---|---|---|
| kltng/surya-ocr-2.5-mlx-8bit | ~689 M | no disponible | openrail (RAIL-M modificada) | safetensors MLX, Apple Silicon | Conversion no oficial, 8 bits |
| datalab-to/surya-ocr-2.5 | no disponible | no disponible | openrail (RAIL-M modificada) | pesos originales | Modelo base oficial de Datalab |
| Surya 2.5 GGUF (llama.cpp) | no disponible | no disponible | openrail (RAIL-M modificada) | GGUF | Usado como referencia en la evaluación del autor |

No se dispone de datos de benchmarks de modelos OCR alternativos en la información proporcionada, por lo que la comparativa se limita a las variantes del mismo modelo base.

## Limitaciones y advertencias

- Conversión no oficial: Datalab no ha participado en la creación de esta build ni la respalda.
- Licencia restrictiva: los pesos están bajo la licencia AI Pubs Open RAIL-M modificada, y todas sus restricciones de uso (párrafo 5 y Anexo A) se aplican a esta build y a sus usuarios, incluidos los límites al uso comercial. Datalab describe los pesos como gratuitos para investigación, uso personal y startups con menos de 5 millones de dólares de financiación o ingresos; para usos más amplios remite a su página de precios. La licencia también cubre la salida del modelo.
- Riesgo de alucinación y salida descontrolada: el autor indica que Surya no reporta salidas desbocadas a través de este backend, por lo que recomienda revisar las páginas que tarden un tiempo inusual.
- Rendimiento desigual: el error en páginas difíciles (17,8 %) es mucho mayor que en páginas fáciles (2,8 %), y la evaluación se limita a material chino; el comportamiento en otros idiomas o tipos de documento no está documentado.
- Cobertura de texto incompleta: la proporción de texto encontrado es del 94,7 %, por lo que puede omitir parte del contenido.
- Idiomas soportados no especificados en los metadatos; no se garantiza un rendimiento equivalente fuera del chino.
- Riesgo operativo en servidores: `mlx_vlm.server` puede enrutar peticiones a otros modelos en caché aunque `SURYA_MLX_MODEL` indique este; la única señal es una línea de log (`reports model=... but expected ...; using reported name`). Aislar la caché es imprescindible.
- Dependencias fijadas: requiere versiones concretas (`surya-ocr==0.23.0`, `mlx-vlm==0.7.10`), lo que limita la actualización independiente de componentes.
- Sesgos: no se documentan sesgos específicos en la información disponible.

## Enlaces

- Repositorio HuggingFace de esta build: https://huggingface.co/kltng/surya-ocr-2.5-mlx-8bit
- Modelo base: https://huggingface.co/datalab-to/surya-ocr-2.5
- Datalab: https://www.datalab.to/
- Precios y licencias de Datalab: https://www.datalab.to/pricing
- MLX: https://github.com/ml-explore/mlx
