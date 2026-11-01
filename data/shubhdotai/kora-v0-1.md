# shubhdotai/kora-v0.1

## Resumen

kora-v0.1 es un modelo de reconocimiento óptico de caracteres (OCR) especializado en páginas de documentos en hindi y en inglés, desarrollado por el usuario shubhdotai. Se trata de un fine-tuning del modelo lightonai/LightOnOCR-3-0.8B, que a su vez se basa en la familia Qwen3.5, y su función es convertir la imagen de una página en Markdown estructurado: títulos, listas y negritas como Markdown, tablas como HTML, fórmulas como LaTeX y figuras como marcadores de posición de imagen. Mantiene encabezados, pies de página y números de página, y respeta el sistema de escritura de los dígitos tal como aparecen impresos (devanagari o latino).

El modelo resuelve un problema concreto y poco cubierto: la digitalización fiable de documentos que mezclan texto latino y devanagari, algo habitual en administración, prensa y literatura técnica de la India. Frente a pipelines OCR genéricos, que suelen degradar la estructura y fallar en la transliteración de numerales, kora-v0.1 está entrenado para preservar la maquetación y el formato de salida listo para consumo posterior (Markdown/HTML/LaTeX).

Con 852.985.920 parámetros (aproximadamente 0,85 mil millones), es un modelo pequeño que puede ejecutarse en GPU de consumo e incluso en CPU, lo que lo hace atractivo para despliegues locales y para procesar lotes grandes de páginas sin costes elevados de inferencia. Su licencia Apache-2.0 facilita el uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (image-text-to-text) basada en Qwen3.5 (`Qwen3_5ForConditionalGeneration`) |
| Parametros totales | 852.985.920 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (la model card solo menciona bf16 y fp32 para inferencia) |
| Idiomas soportados | hindi (hi), inglés (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (librería transformers) |

## Arquitectura y entrenamiento

kora-v0.1 es un fine-tuning de lightonai/LightOnOCR-3-0.8B, un modelo de la familia Qwen3.5 con arquitectura transformer multimodal que acepta imágenes y texto y genera texto. El modelo se carga mediante `Qwen3_5ForConditionalGeneration` y `AutoProcessor`, lo que implica un codificador visual acoplado a un decoder de lenguaje; el pipeline declarado es `image-text-to-text`. El tamaño total de 852.985.920 parámetros sitúa el modelo en el rango de los 0,8-0,9 mil millones, coherente con su base.

La información pública no detalla el volumen de tokens de entrenamiento, la composición del dataset de fine-tuning ni si se aplicaron técnicas de alineación como RLHF o DPO. La model card únicamente especifica el comportamiento esperado en inferencia: una página por imagen, sin prompt de texto, renderizado de PDF a 200 DPI con el lado mayor limitado a 1540 px, y `enable_thinking=False` en la plantilla de chat. La innovación práctica del modelo es la salida estructurada multimodal (Markdown + HTML para tablas + LaTeX para matemáticas + placeholders de imagen) preservando elementos de página como encabezados, pies y numeración.

## Capacidades

- OCR de páginas de documento en hindi (devanagari) e inglés, con salida en Markdown.
- Conversión de tablas a HTML y de fórmulas matemáticas a LaTeX.
- Representación de figuras mediante marcadores `![image](image_N.png)`.
- Preservación de encabezados, pies de página y números de página.
- Respeto del sistema de escritura de los dígitos (devanagari o latino) tal como están impresos.
- Procesamiento de imágenes de página y de páginas de PDF renderizadas.
- Entrada multimodal imagen-texto con generación de texto condicionada por la imagen.
- Modo de generación sin "thinking" (`enable_thinking=False`) para salida directa.
- No se documenta soporte de tool calling, function calling ni comportamiento agéntico multi-paso.
- No se documenta soporte de audio ni de vídeo.

## Casos de uso

- Digitalización de archivos administrativos indios: el modelo convierte páginas escaneadas con texto mixto hindi-inglés en Markdown estructurado, preservando encabezados y numeración, lo que facilita su indexación posterior en sistemas de búsqueda documental.
- Extracción de tablas de informes y formularios: al emitir tablas como HTML, la salida puede parsearse directamente con librerías de scraping y volcarse a bases de datos o hojas de cálculo sin post-procesado geométrico complejo.
- Conversión de literatura técnica y científica: las fórmulas se emiten en LaTeX, de modo que el resultado puede integrarse en pipelines de publicación (Pandoc, Jupyter, MkDocs) conservando la notación matemática.
- Preservación de documentos históricos y prensa: al mantener pies de página y números de página, es adecuado para proyectos de digitalización que requieren reconstruir la paginación original y citar fuentes con referencia de página.
- Procesamiento por lotes en infraestructura propia: con menos de mil millones de parámetros y pesos en safetensors, puede ejecutarse en GPU de consumo o CPU para lotes grandes de páginas sin depender de APIs externas, lo que reduce costes y facilita el cumplimiento de requisitos de confidencialidad.
- Preprocesado para RAG multilingüe: la salida Markdown con estructura explícita mejora el chunking semántico antes de generar embeddings, especialmente en corpus donde conviven hindi e inglés.
- Digitalización de material educativo: libros de texto con listas, negritas y figuras pueden convertirse a Markdown para plataformas de e-learning, manteniendo la jerarquía visual original.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: con 852.985.920 parámetros, en bf16 los pesos ocupan aproximadamente 1,7 GB; en fp32, unos 3,4 GB. A ello hay que sumar la memoria del codificador visual y de las activaciones, que depende de la resolución de entrada (lado mayor de hasta 1540 px) y de la longitud de salida (hasta 6144 tokens nuevos según el ejemplo de la model card).
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM en bf16 es suficiente en la práctica; se indica explícitamente el uso de bf16 en GPU recientes y Apple silicon, y fp32 en T4 o CPU.
- GPU de consumo: sí cabe en tarjetas consumer modernas (por ejemplo, RTX 4090, RTX 3090 y gamas con 8 GB o más), así como en Apple silicon vía MPS.
- CPU: es viable en fp32, con latencia mayor; la model card incluye explícitamente la ruta de ejecución en CPU.
- Opciones de despliegue: `transformers` (versión 5.5.4 o superior) con `AutoProcessor` y `Qwen3_5ForConditionalGeneration`; el repositorio incluye un notebook de inferencia (`kora_inference.ipynb`) que funciona en Google Colab, local con GPU NVIDIA, Apple GPU o CPU. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Idiomas | Salida estructurada | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| kora-v0.1 | 852.985.920 | hi, en | Markdown, HTML (tablas), LaTeX (matemáticas) | Apache-2.0 | HuggingFace (transformers) |
| lightonai/LightOnOCR-3-0.8B (modelo base) | no disponible en la información proporcionada | no disponible en la información proporcionada | no disponible en la información proporcionada | Apache-2.0 | HuggingFace |
| Alternativas OCR genéricas (Tesseract, PaddleOCR, etc.) | no aplica (no son LLM) | multilingüe variable | limitada o dependiente de post-procesado | variable | amplia |

La comparación con el modelo base es la más relevante: kora-v0.1 añade especialización en hindi y en la preservación de estructura de página, a partir de un modelo Apache-2.0. No se dispone de datos de benchmarks que permitan comparar rendimiento cuantitativo con alternativas.

## Limitaciones y advertencias

- Cobertura lingüística restringida: solo hindi e inglés; no se garantiza un comportamiento correcto en otras lenguas o escrituras.
- Riesgo de repetición: la model card advierte de que la salida puede entrar en bucles que agotan el límite de tokens; se recomienda reintentar con `repetition_penalty=1.05`.
- Dependencia de la resolución de entrada: se debe renderizar a 200 DPI y limitar el lado mayor a 1540 px; resoluciones fuera de ese rango pueden degradar la calidad.
- Entrada de una página por imagen y sin prompt de texto: no está diseñado para imágenes con múltiples páginas ni para instrucciones adicionales del usuario.
- Riesgo de alucinación en texto poco legible o en tablas complejas: al ser un modelo generativo, puede producir contenido plausible pero incorrecto en regiones borrosas o con maquetación atípica; se recomienda validación en dominios críticos.
- Sesgos: no se documentan sesgos específicos, pero al entrenarse sobre documentos en hindi e inglés puede heredar sesgos de dominio (formalidad administrativa, variedades regionales) no evaluados públicamente.
- Licencia: Apache-2.0 permite uso comercial, pero se debe conservar el aviso de licencia y atribución correspondiente; el modelo base también es Apache-2.0.
- Madurez: versión v0.1 con 53 descargas y sin likes en el momento de la consulta; no hay evidencia pública de validación independiente ni de benchmarks, por lo que su uso en producción debería ir precedido de una evaluación propia sobre el corpus objetivo.
- Requiere `transformers` 5.5.4 o superior, lo que puede limitar la compatibilidad con stacks más antiguos.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/shubhdotai/kora-v0.1
- Notebook de inferencia: https://huggingface.co/shubhdotai/kora-v0.1/blob/main/kora_inference.ipynb
- Descarga directa del notebook: https://huggingface.co/shubhdotai/kora-v0.1/resolve/main/kora_inference.ipynb
- Modelo base: https://huggingface.co/lightonai/LightOnOCR-3-0.8B
