# julioalonzom/lector-2b-v1

## Resumen

Lector 2B v1 es un modelo de visión-lenguaje especializado en transcripción OCR de impresos latinos escolásticos de los siglos XVI a XX. Lo desarrolla julioalonzom bajo el paraguas de "lector (Schola Thomistica)" y consiste en un ajuste fino completo (full fine-tune) del modelo base Qwen/Qwen3.5-2B, con 2.213.241.664 parámetros. Su función es convertir una imagen de página en un fichero Markdown con un dialecto de transcripción propio denominado "diplomatic-v1", que preserva grafías de imprenta como æ/œ, el ampersand, acentos, la distinción u/v y las marcas de abreviatura, normalizando la s larga a s.

El modelo resuelve un problema muy concreto: la digitalización fiable de corpus latinos impresos antiguos con estructura compleja (notas al pie, notas marginales, notas continuadas entre páginas) sin necesidad de pipelines OCR en cascada. Frente a aproximaciones genéricas, aquí el formato de salida está fijado por diseño: notas al pie como `^[…]`, notas marginales como `^[⟦M⟧ …]` y notas continuadas como un bloque final que empieza por `⟦CONTINUED-NOTE⟧`.

Es relevante ahora porque demuestra que un modelo de 2B parámetros, con un ajuste fino cuidadoso y un prompt fijo, puede alcanzar un CER bajo en impresos de los siglos XIX y XX (0,002–0,04) y resultados razonables en impresos del XVII (0,040–0,053), con licencia Apache 2.0 y un coste de inferencia contenido. No obstante, sus debilidades están documentadas: bucles en impresos muy densos y antiguos, griego dentro de notas al pie y páginas cortas de final de libro.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (image-text-to-text) derivado de Qwen3.5-2B |
| Parametros totales | 2.213.241.664 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | Pesos en safetensors; el autor especifica inferencia en bf16. Otras cuantizaciones no disponibles |
| Idiomas soportados | Latín (la) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3.5-2B, un transformer multimodal que acepta imagen y texto como entrada y genera texto. Sobre esa base se realizó un ajuste fino completo durante 2 épocas con un corpus de 3.732 páginas más 2.000 líneas, orientado a la transcripción diplomática de impresos latinos escolásticos. El autor no detalla en la información disponible la composición exacta del dataset ni si se emplearon técnicas de RLHF o DPO; el pipeline declarado es image-text-to-text y la tarea se plantea como generación condicionada por imagen con un prompt fijo.

La innovación principal no está en la arquitectura, sino en la definición de un dialecto de salida estricto y en el procedimiento de inferencia: prompt verbatim del repositorio, imagen en RGB con el lado mayor redimensionado a 1280 px mediante Lanczos, procesador con `min_pixels = 256*32*32` y `max_pixels = 1280*1280`, decodificación greedy en bf16 (`do_sample=False`, `repetition_penalty=1.0`, `max_new_tokens=3500`), parada en `<|im_end|>` o eos y plantilla de chat con `enable_thinking=False`. Además, se aplica siempre una guarda contra bucles sobre la salida (eliminación de líneas de tabla y colapso de repeticiones de 3 o más veces), y se advierte que si la guarda se activa, la página ha perdido texto y debe releerse de otra forma.

## Capacidades

- Transcripción OCR de una página de impreso latino a Markdown en el dialecto diplomatic-v1.
- Preservación de grafías históricas: æ/œ, ampersand, acentos, distinción u/v y marcas de abreviatura; normalización de la s larga a s.
- Estructuración de notas al pie con la sintaxis `^[…]`.
- Detección y marcado de notas marginales con la sintaxis `^[⟦M⟧ …]`.
- Marcado de notas continuadas de la página anterior mediante un bloque final `⟦CONTINUED-NOTE⟧`.
- Procesamiento de imágenes de página en formato retrato, con indicación de dividir previamente los pliegos a dos páginas por el pliegue.
- Generación de texto conversacional multimodal según el pipeline declarado (image-text-to-text, conversational).
- No se documentan en la información disponible capacidades de tool calling, function calling, agentes, razonamiento multi-paso, matemáticas, código, audio ni modo de pensamiento explícito.

## Casos de uso

- Digitalización de corpus escolásticos latinos: el modelo convierte cada imagen de página en un fichero Markdown con notas al pie y marginales ya estructuradas, lo que reduce el trabajo de post-proceso en proyectos de edición digital.
- Creación de ediciones diplomáticas de impresos de los siglos XIX y XX: con CER de 0,002–0,04 en ese tramo, es adecuado para generar transcripciones base que un editor revise después.
- Procesamiento de obras del XVII con estructura compleja: en Hurtado 1624 obtiene 0,040 y en Álvarez 1610 0,053 sin columnas omitidas, por lo que sirve para textos con columnas y notas densas dentro de ese rango.
- Extracción de aparato crítico: la sintaxis `^[…]` y `^[⟦M⟧ …]` permite separar automáticamente notas al pie y marginales del cuerpo del texto para alimentar bases de datos o índices.
- Reconstrucción de notas que continúan entre páginas: el bloque `⟦CONTINUED-NOTE⟧` facilita el ensamblaje de notas partidas en la encuadernación.
- Catalogación y búsqueda full-text en bibliotecas históricas: al generar Markdown normalizado, el resultado se indexa directamente en motores de búsqueda o repositorios documentales.
- Evaluación comparativa de pipelines OCR: al publicarse junto a lector-bench v0, sirve como referencia reproducible para medir mejoras de otros lectores sobre el mismo conjunto de páginas.

## Benchmarks y rendimiento

Resultados en lector-bench v0 (md_cer plegado, ponderado por página, aplicando la guarda contra bucles):

| Modelo | Todas las 146 páginas | Split público, 86 páginas |
|---|---|---|
| ft2 (Qwen3-VL-2B) | 0,137 | 0,059 |
| ft4 (Qwen3.5-2B) | 0,099 | 0,089 |
| lector-2b-v1 (ft5) | 0,093 | 0,066 |

Resultados por subconjunto reportados por el autor:

| Subconjunto | CER |
|---|---|
| Impresos de los siglos XIX–XX | 0,002–0,04 |
| Hurtado 1624 | 0,040 |
| Álvarez 1610 | 0,053 (sin columnas omitidas) |
| Báñez 1602 | 0,45 |

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: alrededor de 4,5–5 GB solo para pesos (2,21B parámetros a 2 bytes), más el coste del codificador visual y de las activaciones; en la práctica, se recomienda una GPU con al menos 8–12 GB para trabajar con comodidad.
- GPU recomendadas: A100, H100 o L40S para procesamiento por lotes de páginas; RTX 4090 o RTX 3090 para uso individual.
- Cabe en GPU de consumo: sí, en tarjetas con 8 GB o más en bf16; con cuantización a 8 bits o 4 bits cabría en GPUs de 6–8 GB, aunque el autor no publica configuraciones cuantizadas ni garantiza su comportamiento.
- Opciones de despliegue: el autor especifica bf16 con decodificación greedy y plantilla de chat; no se documentan en la información disponible integraciones con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles. La configuración fija `max_new_tokens=3500` y la naturaleza autoregresiva de la generación implican que el coste por página depende del número de tokens de salida.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | CER en lector-bench v0 (146 páginas) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| lector-2b-v1 (ft5) | 2,21B | No disponible | 0,093 | Apache 2.0 | HuggingFace |
| ft4 (Qwen3.5-2B) | No disponible | No disponible | 0,099 | No disponible | Uso interno del autor, no publicado como modelo |
| ft2 (Qwen3-VL-2B) | No disponible | No disponible | 0,137 | No disponible | Uso interno del autor, no publicado como modelo |

No se dispone de datos de benchmarks de otros modelos OCR comparables en la información proporcionada; la única comparación publicada es interna, contra las iteraciones previas del mismo proyecto.

## Limitaciones y advertencias

- Bucles en impresos muy densos y antiguos: Báñez 1602 alcanza un CER de 0,45, lo que lo hace poco fiable en ese tipo de material.
- Bucles con griego dentro de notas al pie y en páginas cortas de final de libro.
- La guarda contra bucles es obligatoria; cuando se activa, la página ha perdido texto y debe releerse con otro enfoque.
- El rol de las notas marginales es una conjetura: precisión de 0,59 en lector-bench v0, por lo que el tipo de nota debe decidirse en fases de exploración o control de calidad, no por el lector.
- El prompt debe usarse literalmente el de `prompt.txt` del repositorio; prompts posteriores pertenecen a modelos posteriores y no están garantizados.
- La imagen debe prepararse según las especificaciones (retrato, RGB, lado mayor a 1280 px, división de pliegos a dos páginas); desviarse de ellas degrada el resultado.
- Idioma limitado al latín; no se documenta soporte para otras lenguas.
- Licencia Apache 2.0, que permite uso comercial, pero sin garantías del autor sobre el rendimiento en dominios distintos del corpus de entrenamiento.
- Riesgo de alucinación y de omisión de texto en páginas con estructura atípica; se recomienda revisión humana en producción.
- Modelo con 0 descargas y 0 likes en el momento de la consulta, lo que implica ausencia de validación externa independiente.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/julioalonzom/lector-2b-v1
- Dataset de evaluación lector-bench v0: https://huggingface.co/datasets/julioalonzom/lector-bench
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-2B
