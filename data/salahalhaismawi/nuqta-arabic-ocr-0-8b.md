# SalahALHaismawi/Nuqta-Arabic-OCR-0.8B

## Resumen

Nuqta-Arabic-OCR 0.8B es un modelo de reconocimiento óptico de caracteres (OCR) especializado en árabe, desarrollado por Salah AlHaismawi con la colaboración de Mohamed Saleh Tulib y Ahmed ElSayed Mohamed Ibrahim. Se trata de un ajuste fino supervisado sobre Qwen/Qwen3.5-0.8B, un modelo multimodal de tipo image-text-to-text, y resuelve el problema de convertir escaneos, fotografías y PDF en árabe (libros, documentos oficiales, artículos, tablas, formularios, DNI y pasaportes) en texto limpio o Markdown con tablas HTML, respetando el orden de lectura.

Su relevancia radica en tres factores: el tamaño (889,7 millones de parámetros, apto para ejecución en un único GPU pequeño o incluso en un teléfono con cuantización GGUF de aproximadamente 1,6 GB), la fidelidad en el tratamiento del *tashkeel* (apenas 0,08 signos diacríticos inventados por cada 100 letras en texto no vocalizado) y unos resultados declarados que superan a Gemini-2.0-Flash, AIN-7B y GPT-4o en KITAB-Bench, con un CER de 0,117.

El modelo se publica bajo licencia Apache-2.0, lo que permite uso comercial y despliegue on-premises sin que los documentos salgan de la red del usuario. Forma parte de la familia Nuqta OCR, que incluye también una variante de 4B.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal image-text-to-text (base Qwen/Qwen3.5-0.8B) |
| Parametros totales | 889.691.200 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | bf16; GGUF (aproximadamente 1,6 GB de memoria según la model card) |
| Idiomas soportados | ar (árabe) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors; GGUF |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3.5-0.8B, un transformer multimodal que acepta entrada de imagen y texto y genera texto. El ajuste fino se orienta a la tarea de OCR árabe con salida en texto plano o Markdown, incluyendo tablas en HTML y preservación del orden de lectura en documentos de dirección mixta. La model card no detalla el número de tokens de entrenamiento, la composición exacta del dataset ni si se aplicaron etapas de RLHF o DPO; esos datos figuran como no disponibles en la información proporcionada.

Entre las innovaciones destacadas por el autor figuran el tratamiento fiel del *tashkeel* (el modelo copia las marcas diacríticas impresas y casi no añade otras), la reconstrucción de tablas con celdas combinadas y orden de columnas correcto en el 95 %/96 % de las tablas de prueba de dirección mixta, la extracción de campos de DNI y pasaportes con validación del dígito de control ICAO de la MRZ, y una baja tendencia a bucles de repetición (la librería `nuqta-ocr` añade además una protección contra bucles). El tamaño de entrenamiento declarado para imágenes es de 2,4 megapíxeles; las páginas menores se reescalan a ese tamaño y los recortes de línea o palabra se leen tal cual.

## Capacidades

- Reconocimiento de texto impreso y manuscrito en árabe a partir de imágenes, fotografías y PDF.
- Conversión de documentos a Markdown con tablas en HTML, respetando el orden de lectura.
- Preservación del *tashkeel* impreso y baja tasa de diacríticos inventados (0,08–0,16 por 100 letras en texto no vocalizado).
- Reconocimiento de tablas con celdas combinadas y dirección de columnas izquierda-a-derecha o derecha-a-izquierda.
- Extracción de campos de documentos de identidad y pasaportes, con validación del dígito de control ICAO de la MRZ.
- Procesamiento de diagramas y documentos de estructura compleja.
- Interfaz conversacional (etiqueta `conversational` en los metadatos) sobre el pipeline image-text-to-text.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Capacidades de agente y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: limitadas al árabe según el campo `language`.
- Capacidades de audio o vídeo: no disponibles.

## Casos de uso

- Digitalización de fondos bibliográficos: el modelo convierte páginas de libros escaneados (incluidos textos vocalizados) en texto o Markdown con el *tashkeel* intacto, lo que resulta adecuado para corpus lingüísticos y proyectos de preservación digital que exigen fidelidad diacrítica.
- Procesamiento de documentos oficiales y administrativos: informes, expedientes y formularios árabes se transforman en Markdown estructurado, con tablas HTML cuando corresponde, facilitando su indexación en sistemas de gestión documental.
- Extracción de datos de DNI y pasaportes: la lectura de campos con validación ICAO de la MRZ permite automatizar el alta de clientes en procesos KYC, con la ventaja de que los documentos no abandonan la red corporativa al ejecutarse on-premises.
- Análisis de artículos científicos y papers en árabe: la conversión a Markdown con tablas preservadas permite alimentar pipelines de extracción de información y revisión bibliográfica sin reescribir manualmente las tablas.
- Digitalización de tablas y balances: la reconstrucción de tablas con celdas combinadas y orden de columnas correcto en el 95 %/96 % de las pruebas de dirección mixta la hace útil para digitalizar estados financieros y tablas administrativas.
- Digitalización móvil sin conexión: con cuantización GGUF de aproximadamente 1,6 GB, el modelo puede ejecutarse en un teléfono y procesar documentos en entornos sin conectividad, como inspecciones de campo o zonas con red limitada.
- Automatización de archivo y búsqueda: al generar Markdown limpio y en orden de lectura, los documentos pueden indexarse en motores de búsqueda internos o en sistemas RAG con mucho menos preprocesado posterior.

## Benchmarks y rendimiento

Resultados declarados por el autor del modelo (no verificados de forma independiente):

| Benchmark | Metrica | Nuqta 0.8B | Referencia comparada |
|---|---|---|---|
| KITAB-Bench (OCR, 13 datasets) | CER (macro, tamaño de entrada recomendado) | 0,117 | Gemini-2.0-Flash 0,13; AIN-7B 0,20; GPT-4o 0,31 |
| KITAB-Bench (imágenes tal cual) | CER | 0,132 | no disponible |
| Misraj-DocOCR | CER | 0,13 | no disponible |
| Misraj-DocOCR | chrF | 87,4 | no disponible |
| Misraj-DocOCR | TEDS (tablas) | 66,8 | no disponible |
| Misraj-DocOCR | MARS | 77,1 (76,3 con imágenes tal cual) | Baseer v2 77,8; Baseer original 76,9; Gemini-2.5-Pro 70,8; GPT-5 54,8 |

Según la model card, la puntuación se realizó con el código de evaluación propio de KITAB-Bench, copiado sin modificaciones; para Misraj-DocOCR se siguió la receta de la sección 7.1 del paper de Baseer, ya que Misraj no publicó su código de puntuación. Las cifras de los competidores son las publicadas por sus autores.

## Requisitos de hardware

- VRAM estimada: aproximadamente 3 GB en bf16 para inferencia; alrededor de 1,6 GB de memoria con cuantización GGUF.
- GPU recomendadas: una GPU pequeña de consumo o profesional es suficiente; la model card indica que funciona en un único GPU pequeño. No se especifican modelos concretos (A100, H100, RTX 4090) en la información disponible.
- Compatibilidad con GPU de consumo: sí, gracias a su tamaño inferior a 1B de parámetros; también se indica ejecución en teléfono con GGUF.
- Opciones de despliegue: vLLM (usado por el autor para las mediciones de latencia), transformers, llama.cpp/Ollama mediante GGUF y la librería propia `nuqta-ocr` (`pip install nuqta-ocr`).
- Latencia y throughput: aproximadamente 3 segundos por página de documento procesada de una en una con vLLM, más rápido en lotes; aproximadamente 0,2 segundos por línea de texto.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | KITAB-Bench CER | MARS (Misraj-DocOCR) | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Nuqta-Arabic-OCR 0.8B | 889,7 M | no disponible | 0,117 | 77,1 | Apache-2.0 | Pesos abiertos en Hugging Face |
| Nuqta-Arabic-OCR 4B | no disponible | no disponible | no disponible | no disponible | no disponible | Pesos abiertos en Hugging Face |
| AIN-7B | 7B (aproximado) | no disponible | 0,20 | no disponible | no disponible | no disponible |
| Baseer v2 (Misraj) | no disponible | no disponible | no disponible | 77,8 | no disponible | no disponible |
| Gemini-2.0-Flash | propietario | no disponible | 0,13 | no disponible | propietaria | API de Google |
| GPT-4o | propietario | no disponible | 0,31 | no disponible | propietaria | API de OpenAI |
| Gemini-2.5-Pro | propietario | no disponible | no disponible | 70,8 | propietaria | API de Google |
| GPT-5 | propietario | no disponible | no disponible | 54,8 | propietaria | API de OpenAI |

La comparación relevante es doble: frente a modelos abiertos especializados (AIN-7B, Baseer), Nuqta 0.8B ofrece un CER menor que AIN-7B con una décima parte de parámetros y queda a 0,7 puntos de MARS de Baseer v2; frente a modelos propietarios de propósito general, supera a Gemini-2.0-Flash, GPT-4o, Gemini-2.5-Pro y GPT-5 en las métricas declaradas, con la ventaja adicional de ejecución local y licencia permisiva.

## Limitaciones y advertencias

- Sesgos conocidos: no se documentan en la información proporcionada; al estar entrenado solo con árabe, su comportamiento fuera de ese idioma no está caracterizado.
- Riesgo de alucinación: la model card reporta entre 0,08 y 0,16 diacríticos inventados por 100 letras en texto no vocalizado, es decir, una alucinación baja pero no nula en el *tashkeel*; en otros campos (tablas, campos de documentos) no se cuantifica la tasa de error más allá de las métricas agregadas.
- Limitaciones de contexto: la longitud de contexto no está disponible; el rendimiento se mide por página o por línea, no en documentos completos de gran extensión.
- Limitaciones de idioma: el modelo está orientado exclusivamente al árabe; no se declaran capacidades multilingües.
- Dependencia del tamaño de entrada: los resultados recomendados asumen reescalar páginas menores a 2,4 MP; con imágenes tal cual, el CER sube de 0,117 a 0,132 y el MARS baja de 77,1 a 76,3.
- Validación de benchmarks: todas las cifras son ejecuciones del propio autor y están marcadas como no verificadas; la comparación con Misraj-DocOCR sigue una receta reconstruida, no el código oficial de Misraj.
- Restricciones de licencia: Apache-2.0 permite uso comercial, pero conviene revisar las condiciones del modelo base Qwen/Qwen3.5-0.8B y de los datasets empleados en el ajuste.
- Caveat para producción: la protección contra bucles de repetición se implementa en la librería `nuqta-ocr`, no en los pesos; un despliegue directo con transformers o vLLM sin esa capa podría exponerse a repeticiones en casos límite.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/SalahALHaismawi/Nuqta-Arabic-OCR-0.8B
- Variante de 4B: https://huggingface.co/SalahALHaismawi/Nuqta-Arabic-OCR-4B
- Colección Nuqta OCR: https://huggingface.co/collections/SalahALHaismawi/nuqta-ocr-6ad4af255195b706ac93d1d4
- Demo en Hugging Face Spaces: https://huggingface.co/spaces/SalahALHaismawi/Nuqta-Arabic-OCR
- Sitio web del proyecto: https://salahalhaismawi.github.io/nuqta-ocr/
- Librería y código de benchmark: https://github.com/SalahAlHaismawi/nuqta-ocr
- KITAB-Bench: https://github.com/mbzuai-oryx/KITAB-Bench
- Dataset Misraj-DocOCR: https://huggingface.co/datasets/Misraj/Misraj-DocOCR
- Resultados de Misraj (tabla de septiembre de 2026): https://misraj.ai/en/blogs/baseer-arabic-document-ocr-vlm-misraj
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
