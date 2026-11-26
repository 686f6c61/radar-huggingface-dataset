# oboro-ai/Oboro-Blink-1.0

## Resumen

Oboro Blink 1.0 es un modelo de difusión para generación y edición de imágenes desarrollado por oboro-ai, derivado del modelo base Qwen/Qwen-Image-2.1 mediante la fusión (merge) de adaptaciones LoRA directamente en los pesos de difusión. Su rasgo diferencial es un perfil de generación de cuatro pasos (4-step, con sampler Euler y CFG 1), lo que reduce drásticamente el coste computacional frente a los pipelines de 40 pasos típicos del modelo base sin degradar de forma apreciable la calidad percibida. El modelo se distribuye bajo la licencia Qwen Research License y se publica como archivo único para la librería `diffusion-single-file`, con variantes GGUF (Q2_K a Q6_K) e INT8 en safetensors.

El modelo pone un énfasis explícito en el renderizado de texto (typography) en inglés y ruso, con mejoras dedicadas fusionadas en los pesos, y hereda del modelo base su soporte multilingüe más amplio. Se presenta además como "uncensored", es decir, sin los filtros de contenido que suelen acompañar a los modelos de imagen comerciales. El repositorio ocupa 28,4 GB y el checkpoint en safetensors declara 7.115.124.736 parámetros.

Es relevante ahora porque demuestra que es posible comprimir un modelo de imagen de 7B parámetros a un régimen de 4 pasos manteniendo puntuaciones de preferencia humana (HPS v2.0) prácticamente idénticas a las del modelo base con 40 pasos, lo que abarata el despliegue en hardware de consumo y en entornos de producción con requisitos de latencia estrictos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo de difusión (diffusion-single-file) derivado de Qwen Image 2.1; no se detalla la arquitectura interna en la información disponible |
| Parametros totales | 7.115.124.736 (7,1B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No aplica (modelo de imagen); resolución de trabajo por defecto 1024 × 1024 |
| Tipos de cuantizacion | GGUF Q2_K, Q3_K, Q4_K_S, Q5_K, Q6_K; INT8 safetensors |
| Idiomas soportados | Inglés y ruso con mejoras dedicadas de renderizado de texto; multilingüe heredado de Qwen Image 2.1 |
| Licencia | Qwen Research License (license: other) |
| Formato de pesos | GGUF y safetensors (INT8) |

## Arquitectura y entrenamiento

Oboro Blink 1.0 es un modelo de difusión para texto-a-imagen construido sobre Qwen/Qwen-Image-2.1. La relación con el modelo base es de tipo `merge`: todas las adaptaciones incluidas (LoRA) se han fusionado en los pesos de difusión, de modo que no se necesitan archivos LoRA separados ni nodos cargadores de LoRA en ComfyUI. El perfil de generación por defecto es de 4 pasos con CFG 1, sampler Euler y scheduler simple a 1024 × 1024, lo que sugiere la incorporación de una destilación de tipo Lightning (la etiqueta `lightning` aparece en el modelo) para permitir la inferencia en pocos pasos.

No se dispone en la información proporcionada de detalles sobre el volumen de tokens de entrenamiento, la composición del dataset ni la existencia de fases de RLHF o DPO, dado que se trata de un modelo de imagen y no de lenguaje. La innovación técnica destacable es la fusión de mejoras de renderizado tipográfico específicas para inglés y ruso junto con el perfil de 4 pasos, todo ello empaquetado en un único checkpoint. El modelo se publica como archivo único compatible con ComfyUI y con la librería `diffusion-single-file`.

## Capacidades

- Generación de imágenes a partir de descripciones textuales (text-to-image) a 1024 × 1024 por defecto.
- Edición de imágenes (image-editing), según la model card.
- Renderizado de texto (lettering) en imágenes con mejoras dedicadas para inglés y ruso.
- Soporte multilingüe más amplio heredado de Qwen Image 2.1, no limitado a inglés y ruso.
- Generación en 4 pasos con CFG 1, sampler Euler y scheduler simple.
- Modelo "uncensored": sin los filtros de contenido habituales.
- Compatibilidad con ComfyUI y con flujos de trabajo basados en GGUF e INT8.
- No se documenta soporte de tool calling, agentes ni razonamiento multi-paso (no es un modelo de lenguaje).

## Casos de uso

- Generación de imágenes en producción con latencia estricta: el perfil de 4 pasos reduce el tiempo de generación a unos 14 s a 1024 × 1024 en Q4_K_S (mediana en caliente), frente a los ~76 s del modelo base con 40 pasos, lo que lo hace apto para APIs interactivas.
- Creación de carteles y material gráfico con texto incrustado: las mejoras de tipografía permiten generar pósteres con lettering legible en inglés y ruso, un caso históricamente problemático en modelos de difusión.
- Despliegue en hardware de consumo: las cuantizaciones GGUF Q2_K a Q6_K permiten ejecutar el modelo en GPUs de gama alta para consumidores mediante ComfyUI, sin necesidad de infraestructura de centro de datos.
- Edición de imágenes en flujos de diseño: la capacidad de image-editing permite modificar imágenes existentes dentro de pipelines de diseño gráfico o retoque.
- Prototipado rápido de conceptos visuales: la velocidad de 4 pasos facilita la iteración sobre variaciones de un prompt en sesiones de brainstorming.
- Generación de contenido sin restricciones de filtrado: útil en contextos de investigación artística o creación de contenido donde los filtros comerciales resultan limitativos, siempre dentro del marco legal aplicable.
- Localización de material gráfico para mercados rusófono y anglófono: el soporte dedicado de ambos idiomas permite generar material con texto en la lengua objetivo sin post-procesado.

## Benchmarks y rendimiento

Los datos proceden de las pruebas del autor con los checkpoints GGUF v1.0.2 en Ubuntu.

Renderizado de texto (inglés y ruso), Q4_K_S:

| Modelo · pasos | Pilot · exactos | Follow-up · exactos | Total · exactos y CER |
|:---|---:|---:|---:|
| Oboro Blink · 4 | 8/8 | 12/12 | 20/20 |
| Qwen Image 2.1 · 4 | 6/8 | 7/12 | 13/20 · 8,79 % |
| Qwen Image 2.1 · 40 | 8/8 | 12/12 | 20/20 · 0,00 % |

Calidad y velocidad, HPS v2.0 (24 prompts y semillas, 1024 × 1024):

| GGUF | Modelo · pasos | HPS v2.0 (↑) | Mediana en caliente (↓) |
|:---|:---|---:|---:|
| Q4_K_S | Oboro Blink · 4 | 27,93 | 13,85 s |
| Q4_K_S | Qwen Image 2.1 · 4 | 23,67 | 14,68 s |
| Q4_K_S | Qwen Image 2.1 · 40 | 27,97 | 75,88 s |
| Q2_K | Oboro Blink · 4 | 25,89 | 13,84 s |
| Q2_K | Qwen Image 2.1 · 4 | 22,30 | 14,38 s |
| Q2_K | Qwen Image 2.1 · 40 | 26,21 | 73,28 s |

Velocidad de generación (12 ejecuciones en caliente por perfil y resolución):

| GGUF | Modelo · pasos | 512 × 512 mediana (↓) | 1024 × 1024 mediana (↓) |
|:---|:---|---:|---:|
| Q4_K_S | Oboro Blink · 4 | 5,18 s | 14,08 s |
| Q4_K_S | Qwen Image 2.1 · 4 | 5,42 s | 14,56 s |
| Q4_K_S | Qwen Image 2.1 · 40 | 26,73 s | 76,40 s |
| Q2_K | Oboro Blink · 4 | 5,14 s | 14,28 s |
| Q2_K | Qwen Image 2.1 · 4 | 5,17 s | 14,31 s |
| Q2_K | Qwen Image 2.1 · 40 | 24,19 s | 74,04 s |

Alineación con el prompt, T2I-CompBench++ (CLIPScore medio, subconjunto no espacial):

| GGUF | Modelo · pasos | CLIPScore medio (↑) |
|:---|:---|---:|
| Q4_K_S | Oboro Blink · 4 | 0,3295 |
| Q4_K_S | Qwen Image 2.1 · 40 | 0,3182 |
| Q2_K | Oboro Blink · 4 | 0,3032 |
| Q2_K | Qwen Image 2.1 · 40 | 0,3060 |

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita; con 7,1B parámetros, las cuantizaciones GGUF Q4_K_S rondarían los 4-5 GB y Q6_K los 6-7 GB, mientras que el INT8 safetensors requeriría en torno a 7-8 GB (estimación orientativa, no confirmada por el autor).
- GPU recomendadas: no especificadas por el autor. Por tamaño, GPUs con 8 GB o más de VRAM deberían poder ejecutar las cuantizaciones GGUF; el INT8 requiere algo más de margen.
- Cabe en GPU de consumo: sí, previsiblemente en tarjetas con 8-12 GB de VRAM usando GGUF; no confirmado para INT8.
- Opciones de despliegue: ComfyUI (soporte nativo indicado en las etiquetas), librería `diffusion-single-file`; no se documentan vLLM, llama.cpp ni TGI (no aplicables a un modelo de difusión).
- Latencia y throughput: mediana en caliente de 14,08 s a 1024 × 1024 y 5,18 s a 512 × 512 con Q4_K_S y 4 pasos; 5,48× más rápido que Qwen Image 2.1 con 40 pasos según el autor.

## Comparativa con modelos similares

| Modelo | Parámetros | Pasos por defecto | HPS v2.0 (Q4_K_S) | Latencia 1024×1024 | Licencia |
|:---|:---|:---|:---|:---|:---|
| Oboro Blink 1.0 | 7,1B | 4 | 27,93 | 14,08 s | Qwen Research |
| Qwen Image 2.1 (4 pasos) | No disponible | 4 | 23,67 | 14,56 s | Qwen Research |
| Qwen Image 2.1 (40 pasos) | No disponible | 40 | 27,97 | 76,40 s | Qwen Research |

No se dispone de datos de otros modelos comparables de la misma categoría en la información proporcionada.

## Limitaciones y advertencias

- El modelo se distribuye como "uncensored", sin los filtros de contenido habituales; esto traslada al usuario la responsabilidad legal y ética sobre el contenido generado.
- La licencia es la Qwen Research License, que puede restringir el uso comercial; es necesario revisar el archivo LICENSE y las notas de componentes en NOTICE antes de un despliegue en producción.
- El énfasis en tipografía se ha validado principalmente en inglés y ruso; el rendimiento en otros idiomas no está cuantificado.
- Las pruebas de tipografía combinan inspección visual y Tesseract, con metodologías distintas entre filas de la tabla, lo que limita la comparación directa.
- Los benchmarks se han realizado con un conjunto reducido de prompts (24 para HPS, 3 para T2I-CompBench++), por lo que la robustez estadística es limitada.
- Riesgo de alucinación visual y de artefactos propios de los modelos de difusión, especialmente en cuantizaciones agresivas como Q2_K, donde el HPS cae a 25,89.
- El modelo está pensado para generación y edición de imágenes; no ofrece capacidades de lenguaje, tool calling ni razonamiento.
- El repositorio tiene pocas descargas (231) y cero likes en el momento de la consulta, lo que indica una validación comunitaria todavía escasa.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/oboro-ai/Oboro-Blink-1.0
- Modelo base Qwen Image 2.1: https://huggingface.co/Qwen/Qwen-Image-2.1
- Descarga INT8 safetensors: https://huggingface.co/oboro-ai/Oboro-Blink-1.0/resolve/main/Oboro-Blink-1.0-int8.safetensors?download=true
- Licencia: https://huggingface.co/oboro-ai/Oboro-Blink-1.0/blob/main/LICENSE
- Aviso de componentes: https://huggingface.co/oboro-ai/Oboro-Blink-1.0/blob/main/NOTICE
