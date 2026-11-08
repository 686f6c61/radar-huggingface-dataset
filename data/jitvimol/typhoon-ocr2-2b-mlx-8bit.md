# jitvimol/typhoon-ocr2-2b-mlx-8bit

## Resumen

Typhoon OCR V2 2B (MLX, 8-bit) es una conversión no oficial del modelo `typhoon-ai/typhoon-ocr2-2b` al formato MLX, publicada por el usuario jitvimol. El modelo original lo desarrolla Typhoon (SCB 10X) y es un vision-language model de aproximadamente 2.200 millones de parámetros especializado en el parseo de documentos en tailandés e inglés. Dada una imagen de una página, devuelve los elementos de maquetación en orden de lectura, cada uno con su categoría, su bounding box y su contenido textual.

La relevancia de esta variante concreta es práctica: permite ejecutar el modelo en local sobre Macs con Apple Silicon mediante MLX, con una cuantización afín de 8 bits (group size 64) que reduce el peso en disco a 2,66 GB y el consumo de memoria a unos 3,5 GB para imágenes de página típicas. Según el autor de la conversión, usa aproximadamente un tercio menos de memoria y es más rápido que la variante bfloat16, con una salida prácticamente idéntica.

El modelo se apoya en la arquitectura Qwen3.5 (`Qwen3_5ForConditionalGeneration`) y es un fine-tune de `infly/Infinity-Parser2-Flash`. Está pensado para document parsing, document question answering, clasificación de documentos, extracción de información clave y lectura de tablas, fórmulas y gráficos. La licencia es Apache-2.0, heredada del modelo fuente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3.5 (`Qwen3_5ForConditionalGeneration`), vision-language model |
| Parametros totales | 2.213.241.664 (2,2 B) |
| Parametros activos | no disponible (no es MoE según la información disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 8-bit affine quantization, group size 64 (9,6 bits por peso de media); existe variante bf16 del mismo autor |
| Idiomas soportados | tailandés (th), inglés (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors en formato MLX; librería `mlx` |

## Arquitectura y entrenamiento

El modelo es un transformer multimodal de la familia Qwen3.5, con la clase `Qwen3_5ForConditionalGeneration`, que combina un codificador visual con un decodificador de lenguaje para la tarea image-text-to-text. El modelo original es un fine-tune de `infly/Infinity-Parser2-Flash`. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO.

Esta variante concreta no introduce ningún entrenamiento adicional: la conversión se limita al cambio de tipo de dato y a la cuantización descrita. Se generó con `mlx-vlm` 0.7.12 mediante `python -m mlx_vlm convert`. El autor indica que el modelo fue entrenado con un conjunto fijo de prompts, por lo que recomienda usar exactamente el prompt publicado en la model card original (con instrucciones sobre formato de bbox, categorías permitidas y formato de salida JSON) y fijar la temperatura a 0.

## Capacidades

- Parseo de maquetación de documentos: devuelve una lista JSON de elementos con `bbox`, `category` y `text`, ordenados en orden de lectura humano.
- Categorías de maquetación soportadas: `header`, `title`, `text`, `figure`, `table`, `formula`, `figure_caption`, `table_caption`, `formula_caption`, `figure_footnote`, `table_footnote`, `page_footnote`, `footer`.
- Extracción de texto en Markdown para texto y títulos, HTML para tablas y LaTeX para fórmulas.
- Document question answering sobre la imagen de la página.
- Clasificación de documentos.
- Extracción de información clave (key-information extraction).
- Lectura de tablas, fórmulas y gráficos.
- Capacidad multilingüe limitada a tailandés e inglés.
- Salida estructurada en un único objeto JSON (lista de elementos).
- No se documenta soporte de tool calling, function calling ni comportamiento de agente multi-paso.

## Casos de uso

- Digitalización de archivos administrativos tailandeses: el modelo procesa la imagen de cada página y devuelve los bloques de texto con sus coordenadas, lo que permite reconstruir el documento en formato estructurado conservando la maquetación original.
- Extracción de tablas financieras: al devolver las tablas en HTML, se pueden integrar directamente en pipelines de conversión a CSV o bases de datos sin post-procesado manual de la estructura.
- Procesamiento de documentación técnica con fórmulas: la salida en LaTeX para la categoría `formula` facilita la reutilización en publicaciones científicas o wikis técnicas.
- Respuesta a preguntas sobre documentos (document QA): útil en sistemas de atención interna donde un usuario consulta el contenido de un PDF escaneado y el modelo localiza y transcribe el fragmento relevante.
- Clasificación y enrutado documental: combinado con la extracción de cabeceras y títulos, permite clasificar facturas, contratos o formularios antes de derivarlos a otros sistemas.
- OCR local en Mac para entornos con requisitos de privacidad: al ejecutarse con MLX sobre Apple Silicon, los documentos no salen del equipo, lo que encaja en flujos legales o médicos con datos sensibles.
- Extracción de información clave en formularios: la identificación de bloques `text` y `title` con bounding boxes permite localizar campos concretos y asociarlos a valores para su volcado estructurado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor de la conversión aporta únicamente una comprobación informal: dos páginas de documentos tailandeses procesadas con el prompt oficial a temperatura 0 produjeron JSON válido en todos los casos, sin bucles de repetición, y con el mismo número de elementos de maquetación que la variante bfloat16 (29 y 58 elementos). Elemento a elemento, 26 de 29 y 56 de 58 textos fueron idénticos, con diferencias de pocos caracteres en el resto. Estas cifras no constituyen un benchmark y no sustituyen a la evaluación publicada por los autores originales.

## Requisitos de hardware

- VRAM/memoria unificada estimada: aproximadamente 3,5 GB de memoria pico residente para imágenes de página típicas con `mlx-vlm`; las imágenes de mayor tamaño requieren más memoria.
- Tamaño en disco: 2,66 GB.
- Plataforma: Apple Silicon exclusivamente, al estar en formato MLX; no está pensado para GPU NVIDIA.
- GPU recomendadas: no disponible; el modelo está orientado a Macs con chip Apple Silicon, sin modelos concretos especificados.
- Opciones de despliegue: LM Studio (búsqueda por `jitvimol/typhoon-ocr2-2b-mlx-8bit` o `lms get`), `mlx-vlm` por línea de comandos o desde Python.
- Latencia y throughput: no disponibles; el autor solo indica que la variante 8-bit es más rápida que la bfloat16.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| jitvimol/typhoon-ocr2-2b-mlx-8bit | 2,2 B | no disponible | th, en | Apache-2.0 | MLX (Apple Silicon) |
| jitvimol/typhoon-ocr2-2b-mlx-bf16 | 2,2 B | no disponible | th, en | Apache-2.0 | MLX (Apple Silicon) |
| typhoon-ai/typhoon-ocr2-2b | 2,2 B | no disponible | th, en | Apache-2.0 | Formato original (no MLX) |
| infly/Infinity-Parser2-Flash | no disponible | no disponible | no disponible | no disponible | Modelo base del fine-tune |

Las tres primeras variantes comparten pesos y capacidades; difieren únicamente en el formato y la precisión. No se dispone de datos de rendimiento comparativo entre ellas más allá de la comprobación informal descrita.

## Limitaciones y advertencias

- Conversión no oficial: no está afiliada ni respaldada por los autores originales del modelo.
- Idiomas limitados a tailandés e inglés; no se garantiza un comportamiento correcto en otros idiomas.
- El modelo fue entrenado con un conjunto fijo de prompts; desviarse del prompt oficial puede degradar la calidad de la salida.
- La cuantización a 8 bits introduce diferencias ocasionales de uno o pocos caracteres respecto a bfloat16, según la evaluación informal del autor.
- Si las páginas grandes se reescalan en el entorno de despliegue, las bounding boxes pueden diferir de los resultados de referencia.
- Riesgo de alucinación no cuantificado: no se han publicado métricas de fidelidad de transcripción en la información disponible.
- Sesgos conocidos: no disponibles.
- Restricciones de licencia: Apache-2.0 permite uso comercial, pero debe conservarse la atribución correspondiente; conviene verificar los términos del modelo fuente y del modelo base.
- Al ser un formato MLX, no es desplegable en GPUs NVIDIA ni en servidores x86 convencionales sin reconversión.
- No se documenta soporte de tool calling ni de flujos de agente, por lo que no debe asumirse en producción.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/jitvimol/typhoon-ocr2-2b-mlx-8bit
- Variante bfloat16 del mismo autor: https://huggingface.co/jitvimol/typhoon-ocr2-2b-mlx-bf16
- Modelo original: https://huggingface.co/typhoon-ai/typhoon-ocr2-2b
- Modelo base del fine-tune: https://huggingface.co/infly/Infinity-Parser2-Flash
- Librería MLX: https://github.com/ml-explore/mlx
- Referencia arXiv indicada en los tags: arxiv:2601.14722
