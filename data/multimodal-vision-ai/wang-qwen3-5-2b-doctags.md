# multimodal-vision-ai/Wang-Qwen3.5-2B-DocTags

## Resumen

Wang-Qwen3.5-2B-DocTags es un checkpoint de ajuste fino construido sobre la arquitectura Qwen3.5, publicado por el usuario `multimodal-vision-ai` y atribuido a un autor identificado como `wangcheng`. El modelo está especializado en reconocimiento óptico de caracteres (OCR) y en la generación de salida estructurada en formato DocTags, el esquema de marcado que emplea Docling para representar el contenido y la maquetación de documentos. Con 2.213.925.696 parámetros almacenados en pesos BF16, se posiciona como un modelo multimodal compacto orientado a la comprensión de documentos.

La relevancia de esta publicación radica en su tamaño reducido (2B) combinado con una tarea muy concreta: convertir imágenes de páginas en representaciones estructuradas que preservan tablas, bloques de texto y etiquetas de disposición. El autor documenta verificaciones de carga local, coherencia entre la matriz de embeddings y el vocabulario del tokenizador (248.654 entradas), y una conversión a ONNX con validación en navegador mediante WebGPU en Chrome 157 sobre una GPU A800.

El modelo se distribuye bajo licencia Apache-2.0, con pesos en `model.safetensors`, y se apoya en el procesador de imágenes `Qwen2VLImageProcessorFast` junto con `Qwen3VLProcessor`. La model card es explícita al señalar que las comprobaciones realizadas no constituyen una validación de precisión OCR ni de compatibilidad amplia de navegadores, y que no se publican resultados de benchmarks reproducidos en esta entrega.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | `Qwen3_5ForConditionalGeneration` (transformer multimodal con atención lineal y completa mixta) |
| Parametros totales | 2.213.925.696 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 32.768 tokens (`max_model_len=32768` en la configuración de inferencia de referencia) |
| Tipos de cuantizacion | no disponible (pesos publicados en BF16; existe conversión ONNX en repositorio aparte) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | `model.safetensors` (BF16, 4.427.926.928 bytes); conversión ONNX en repositorio separado |

## Arquitectura y entrenamiento

El modelo emplea la arquitectura `Qwen3_5ForConditionalGeneration`, un transformer multimodal que combina capas de atención lineal con capas de atención completa. El componente de texto consta de 24 capas con un tamaño oculto de 2.048 y un vocabulario de 248.654 entradas, del cual 610 son tokens añadidos específicos del esquema DocTags. El procesamiento visual se delega en `Qwen2VLImageProcessorFast` y `Qwen3VLProcessor`, con un límite de píxeles configurado en 2.073.600 (`max_pixels=2073600`).

El checkpoint procede de un ajuste fino cuyo registro de origen indica el paso 72.000. La model card no detalla la composición del dataset de entrenamiento, el número de tokens utilizados ni si se aplicaron técnicas de RLHF o DPO; únicamente se indica que la documentación completa de los datos de entrenamiento aún no se ha incorporado. Tampoco se especifican innovaciones como decodificación especulativa. El autor sí documenta la preservación estricta del tokenizador original, la plantilla de conversación y la numeración de los tokens DocTags (`<doctag>`, `<text>` y etiquetas de tabla y disposición), advirtiendo que no deben sustituirse por los de otro modelo.

## Capacidades

- Reconocimiento óptico de caracteres sobre imágenes de páginas de documento.
- Generación de salida estructurada en formato DocTags, incluyendo etiquetas `<doctag>`, `<text>`, tablas y elementos de disposición.
- Comprensión de documentos con preservación de la maquetación (layout) en la representación de salida.
- Entrada multimodal imagen-texto mediante el pipeline `image-text-to-text`.
- Modo de conversación con plantilla de chat propia y prefijo de respuesta del asistente `<think>\n\n</think>\n\n<doctag>`; la configuración de referencia desactiva el modo thinking.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible (no se declaran idiomas soportados).
- Capacidades de visión, audio o thinking general más allá del OCR documental: no disponible.

## Casos de uso

- Digitalización de archivos administrativos: el modelo convierte imágenes de páginas escaneadas en DocTags estructurados, lo que permite posteriores pipelines de extracción de campos y almacenamiento en bases documentales sin perder la disposición original.
- Extracción de tablas en informes financieros: al emitir etiquetas específicas de tabla y disposición, facilita la reconstrucción de estructuras tabulares en formatos como Markdown o HTML dentro de flujos de análisis de datos.
- Integración en pipelines Docling: al producir directamente el esquema DocTags que consume Docling, el modelo puede sustituir o complementar etapas de OCR en cadenas de procesamiento documental ya existentes.
- Procesamiento de documentos en el navegador: la conversión ONNX publicada en repositorio separado y la validación en Chrome 157 con WebGPU permiten desplegar OCR documental en cliente sin enviar imágenes a servidores externos.
- Enriquecimiento de repositorios de conocimiento: la salida estructurada con etiquetas de texto y disposición facilita la indexación semántica y la búsqueda sobre corpus de documentos escaneados.
- Preprocesado para sistemas RAG: la conversión de páginas a DocTags preserva la jerarquía y las tablas, lo que mejora la calidad de los fragmentos recuperados en pipelines de generación aumentada por recuperación.
- Prototipado en hardware modesto: con 2B parámetros en BF16 y contexto de 32.768 tokens, el modelo puede ejecutarse en entornos con recursos limitados para pruebas de concepto de OCR estructurado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente que la entrega no proporciona puntuaciones de precisión que no hayan sido reproducidas en esta publicación, y que la prueba funcional sobre una página sintética corta (26 tokens, aproximadamente 19,3 segundos en CPU) no sustituye a un benchmark completo.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16: aproximadamente 4,4 GB solo para pesos, más el espacio de activaciones y caché KV para contexto de hasta 32.768 tokens; el requisito real depende de la longitud de entrada y del tamaño de imagen procesada.
- GPU recomendadas: A100 u H100 para despliegues de producción con lotes y contexto largo; la validación WebGPU documentada se realizó sobre una A800.
- GPU de consumo: los 2B parámetros en BF16 permiten su ejecución en tarjetas con 8 GB o más de VRAM; con cuantización a 8 bits o 4 bits (no publicada en este repositorio) cabría en GPUs de 6 GB o menos.
- Opciones de despliegue: Transformers (probado con la versión 5.6.2), vLLM y ms-swift según la configuración de referencia del autor, y ONNX Runtime Web con WebGPU para ejecución en navegador.
- Latencia y throughput: el único dato publicado es de aproximadamente 19,3 segundos para generar 26 tokens en CPU sobre una página sintética corta; no se han publicado cifras de throughput en GPU.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Wang-Qwen3.5-2B-DocTags | 2,21B | 32.768 | OCR + DocTags | Apache-2.0 | HuggingFace (repo propio) y ONNX |
| Qwen3.5-2B (base) | no disponible en la informacion | no disponible | Multimodal general | Apache-2.0 | HuggingFace (Qwen/Qwen3.5-2B) |
| Alternativas OCR de 2B con salida estructurada | no disponible | no disponible | no disponible | no disponible | no disponible |

La model card solo referencia el modelo base Qwen3.5-2B como origen del checkpoint y de la licencia. No se han proporcionado comparaciones con otros modelos de OCR documental en la información disponible.

## Limitaciones y advertencias

- La model card advierte que las comprobaciones de carga local no equivalen a una validación de precisión OCR ni de compatibilidad de navegadores.
- No se publican resultados de benchmarks reproducidos; la única prueba funcional es una página sintética corta de 26 tokens.
- La documentación completa del dataset de entrenamiento no está disponible, lo que impide evaluar sesgos de dominio o de idioma.
- No se declaran idiomas soportados; el comportamiento multilingüe es incierto y requiere validación propia.
- El tokenizador, la plantilla de conversación y la numeración de tokens DocTags deben conservarse tal cual; sustituirlos por los de otro modelo invalida la salida.
- La configuración de referencia desactiva el modo thinking y usa generación greedy con `temperature=0.0`; otros ajustes de muestreo no han sido validados.
- Existe una discrepancia documentada entre `eos_token_id=248044` en la configuración y el ID 248046 de `<|im_end|>` en el tokenizador; el autor recomienda verificar explícitamente el comportamiento de terminación en producción.
- Los pesos publicados son PyTorch BF16 y no pueden cargarse directamente como ONNX ni en navegador; para ello debe usarse el repositorio ONNX separado.
- La licencia Apache-2.0 permite uso comercial, pero el autor no ofrece garantías sobre el rendimiento en dominios distintos del documental.
- Riesgo de alucinación en la transcripción de texto manuscrito o de baja calidad: no cuantificado en la información disponible.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/multimodal-vision-ai/Wang-Qwen3.5-2B-DocTags
- Repositorio ONNX: https://huggingface.co/multimodal-vision-ai/Wang-Qwen3.5-2B-DocTags-ONNX
- Modelo base y licencia: https://huggingface.co/Qwen/Qwen3.5-2B/blob/main/LICENSE
- Registro de pruebas WebGPU en GitHub: https://github.com/multimodal-vision-ai/multimodal-document-ai-learning-center/blob/0c3e3481a4b469e8354e9c1cc5272bc53f317548/hf-spaces/mvai-doctags-webgpu/adapters/wang-qwen35-2b/TESTS.md
