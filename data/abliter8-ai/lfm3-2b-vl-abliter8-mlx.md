# abliter8-ai/lfm3-2b-vl-abliter8-mlx

## Resumen

LFM3-VL-2B-Abliter8 es una variante "abliterated" (con reducción de rechazos) del modelo visión-lenguaje LFM3-VL-2B de Liquid AI, publicada por el colectivo abliter8-ai. El modelo original tiene 1.920 millones de parámetros —un backbone de lenguaje de 1,73B, un codificador visual de 164M y un proyector de 25M— y una ventana de contexto de 128K tokens. Está diseñado para comprensión de imágenes y vídeo, OCR, grounding visual y uso de herramientas visuales.

La intervención de abliteración se aplicó sobre las activaciones del propio backbone multimodal, no sobre los pesos de un modelo de texto separado. Se ajustó una dirección de rechazo por modelo y se aplicó la proyección `W' = W - 2 r (r^T W)` a 32 matrices de escritura residual en las capas 8–23 (`self_attn.o_proj`, `feed_forward.w2` y `conv.out_proj`). El resto de tensores, incluidos el codificador visual, el proyector y los componentes multimodales, quedan intactos según la auditoría en BF16 del autor.

La relevancia de esta ficha está en que ofrece pesos en formato MLX (además de GGUF en un repositorio hermano) para ejecución en Apple Silicon, con métricas de deriva de cuantización publicadas por el propio autor. No se han reejecutado los benchmarks de Liquid sobre estos pesos editados, y el autor lo declara explícitamente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (backbone de lenguaje + codificador visual + proyector); detalles internos del backbone no disponibles |
| Parametros totales | 1,92B (1,73B backbone de lenguaje + 164M codificador visual + 25M proyector) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 128K tokens (según model card de Liquid; no requalificada a longitud completa en esta edición) |
| Tipos de cuantizacion | MLX: 8-bit, 6-bit, 4-bit; GGUF (repo hermano): Q8_0, Q6_K, Q4_K_M, Q4_0 |
| Idiomas soportados | no disponible |
| Licencia | lfm1.0 (licencia "other" con nombre lfm1.0, heredada de LiquidAI/LFM3-VL-2B) |
| Formato de pesos | safetensors (MLX); GGUF en repositorio separado |

## Arquitectura y entrenamiento

El modelo base es un VLM compacto compuesto por un backbone de lenguaje de 1,73B parámetros, un codificador visual de 164M y un proyector de 25M que alinea ambos espacios. La model card no detalla la composición del dataset de entrenamiento, el número de tokens vistos ni si hubo fases de RLHF o DPO en el modelo original; esos datos no están disponibles en la información proporcionada.

La innovación de esta release es la abliteración aplicada sobre las activaciones del propio backbone multimodal. Se calculó una dirección de rechazo por modelo y se restó una proyección de rango uno escalada (fuerza 2) sobre 32 matrices de escritura residual en las capas 8–23. La auditoría en BF16 confirma que el resto de tensores y los ficheros de procesador/códec copiados permanecen sin cambios, y que los codificadores de visión y audio conservan sus pesos originales. La conversión a MLX cuantiza únicamente el backbone de lenguaje y deja los componentes multimodales sin cuantizar. No se usó fine-tuning ni injerto de pesos de lenguaje de otro modelo.

## Capacidades

- Comprensión de imágenes: descripción, respuesta a preguntas visuales y análisis de contenido gráfico.
- OCR y comprensión de documentos: lectura de facturas, formularios y texto embebido en imágenes.
- Comprensión de gráficos: interpretación de ChartQA y visualizaciones de datos.
- Grounding visual: localización de objetos y regiones en la imagen.
- Uso de herramientas visuales (visual tool use) según la model card del modelo base.
- Comprensión de vídeo, según las capacidades declaradas del modelo original.
- Modo "thinking" (razonamiento extendido) disponible en el modelo base; los benchmarks de Liquid reportados lo activan.
- Reducción de rechazos en texto y en material visual sensible, medida con detectores de palabras clave (0/100 rechazos estrictos en las cuantizaciones publicadas).
- Capacidades multilingües: no disponibles en la información proporcionada.

## Casos de uso

- Digitalización de facturas y documentos: el modelo puede extraer campos y texto de imágenes de facturas gracias a su codificador visual y a la ventana de 128K tokens para lotes de documentos. El autor validó su funcionamiento con una factura en sus pruebas funcionales.
- Análisis de gráficos en informes: interpretación de ChartQA y visualizaciones para resumir tendencias o extraer valores concretos, aprovechando la puntuación de 92,7 en ChartQA del modelo base.
- Asistente visual en local sobre Apple Silicon: despliegue con MLX en 8-bit o 6-bit para aplicaciones de escritorio que necesiten privacidad y no puedan enviar imágenes a la nube.
- Moderación y análisis de contenido sensible: la reducción de rechazos permite analizar material visual o textual que el modelo original podría rechazar, como anatomía adulta o texto sensible dentro de una imagen, sin que ello implique mayor precisión factual.
- Automatización de soporte con capturas de pantalla: el modelo puede responder preguntas sobre capturas de interfaz o errores, útil en herramientas de soporte técnico que reciben imágenes del usuario.
- Procesamiento por lotes en pipelines de datos: con cuantización 4-bit en MLX o GGUF Q4_K_M, el modelo cabe en equipos de gama consumer y puede procesar grandes volúmenes de imágenes para etiquetado o extracción de metadatos.
- Investigación sobre alineación y rechazos: la release incluye métricas de rechazo estricto, XSTest y KLD que permiten estudiar el efecto de la abliteración sobre un VLM sin reentrenar.

## Benchmarks y rendimiento

Los benchmarks del modelo base son los publicados por Liquid; el autor de esta edición no los ha reejecutado sobre los pesos abliterated.

| Benchmark | LFM3-VL-2B (thinking on) | Qwen3.5-4B | Qwen3.5-2B |
|---|---:|---:|---:|
| DocVQA | 96,7 | 97,1 | no disponible |
| ChartQA | 92,7 | 85,8 | no disponible |
| Media de categoría | 71,4 | 73,4 | 64,0 |

Liquid reporta además una media de categoría de 62,1 con thinking desactivado.

Evaluación propia del autor sobre las cuantizaciones GGUF (rechazos estrictos sobre 100 prompts, XSTest sobre 100 prompts seguros, KLD medio, perplejidad y acuerdo top-1):

| GGUF | Rechazos estrictos /100 | Falsos rechazos XSTest /100 | KLD medio | Perplejidad | Acuerdo top-1 |
|---|---:|---:|---:|---:|---:|
| Q8_0 | 0 | 1 | 0,03448 | 96,029 | 90,01% |
| Q6_K | 0 | 1 | 0,04980 | 97,699 | 88,09% |
| Q4_K_M | 0 | 0 | 0,14822 | 91,536 | 79,34% |
| Q4_0 | 0 | 0 | 0,22034 | 96,815 | 74,99% |

Referencia: LFM3-VL-2B original en Q8_0, perplejidad 95,133.

Evaluación propia del autor sobre MLX (deriva de cuantización respecto al maestro BF16 editado; 2.048 posiciones de siguiente token de ocho fragmentos WikiText de 512 tokens, tras 256 tokens de contexto; perplejidad de referencia BF16: 88,397):

| MLX | Rechazos estrictos /100 | Falsos rechazos XSTest /100 | KLD medio | Perplejidad | Acuerdo top-1 |
|---|---:|---:|---:|---:|---:|
| 8-bit | 0 | 1 | 0,00377 | 88,334 | 96,39% |
| 6-bit | 0 | 1 | 0,02017 | 89,576 | 91,21% |
| 4-bit | 0 | 0 | 0,27674 | 82,883 | 72,22% |

Las cuatro cuantizaciones GGUF y las tres MLX obtuvieron 0/20 rechazos estrictos en una muestra factual separada de salud sexual y anatomía adulta, sin respuestas vacías. El autor advierte que esta prueba mide disposición a responder, no precisión médica, y que no hay comparación con el modelo original en esa muestra. Generación con 128 tokens de salida, thinking desactivado y temperatura 0,1 en las pruebas principales de rechazo; la muestra factual MLX fue greedy.

## Requisitos de hardware

- VRAM estimada: el repositorio MLX ocupa 5,4 GB en total; con cuantización 4-bit el backbone de lenguaje se reduce notablemente, aunque los componentes multimodales se mantienen sin cuantizar y suman peso fijo.
- GPU recomendadas: no disponibles para CUDA; esta release está orientada a MLX (Apple Silicon). Para GGUF, el repositorio hermano permite ejecución en CPU y GPU compatibles con llama.cpp.
- Cabe en consumer GPU: sí, en el rango de 8–16 GB de VRAM para cuantizaciones 4-bit y 6-bit, aunque el autor no publica cifras exactas de VRAM pico.
- Opciones de despliegue: MLX (librería `mlx` declarada en el repositorio), llama.cpp u Ollama para los pesos GGUF del repositorio hermano. vLLM y TGI no están confirmados para esta arquitectura en la información disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | DocVQA | ChartQA | Licencia | Disponibilidad |
|---|---|---:|---:|---:|---|---|
| LFM3-VL-2B-Abliter8 | 1,92B | 128K | 96,7 (base) | 92,7 (base) | lfm1.0 | MLX y GGUF |
| LiquidAI/LFM3-VL-2B | 1,92B | 128K | 96,7 | 92,7 | lfm1.0 | Pesos originales |
| Qwen3.5-2B | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible |
| Qwen3.5-4B | no disponible | no disponible | 97,1 | 85,8 | no disponible | no disponible |

Los datos de Qwen3.5-2B y Qwen3.5-4B provienen únicamente de la tabla comparativa citada en la model card; no se dispone de sus especificaciones completas en la información proporcionada.

## Limitaciones y advertencias

- La abliteración reduce la tendencia aprendida al rechazo, pero no añade conocimiento, razonamiento ni modalidades nuevas; cambia el acceso a capacidades ya presentes.
- No se ha ejecutado un benchmark dedicado de rechazo sobre imágenes sensibles; la mayor disposición ante ese material es un uso previsto, no una afirmación medida a nivel de imagen.
- Los benchmarks de Liquid (DocVQA, ChartQA, media de categoría) corresponden al modelo sin editar y no han sido reejecutados sobre estos pesos; no deben atribuirse a esta release.
- La ventana de contexto de 128K no ha sido requalificada a longitud completa en esta edición.
- Las métricas de rechazo se basan en un detector estricto de palabras clave en primera persona, no en una evaluación semántica de cumplimiento dañino.
- La licencia lfm1.0 es una licencia "other" heredada de Liquid AI; deben revisarse sus términos antes de cualquier uso comercial.
- Riesgo de alucinación: no cuantificado en la información disponible; el modelo base es de tamaño compacto y el autor advierte que no garantiza calidad de razonamiento de modelos mayores.
- Sesgos conocidos: no documentados en la información proporcionada.
- Idiomas soportados: no disponibles; no se puede confirmar cobertura multilingüe.
- Las pruebas de rechazo usaron 128 tokens de salida y temperatura 0,1; el comportamiento en generaciones más largas o con temperatura alta no está caracterizado.

## Enlaces

- Repositorio HuggingFace (MLX): https://huggingface.co/abliter8-ai/lfm3-2b-vl-abliter8-mlx
- Pesos GGUF: https://huggingface.co/abliter8-ai/lfm3-2b-vl-abliter8-gguf
- Colección abliter8: https://huggingface.co/collections/abliter8-ai/lfm3-abliter8
- Modelo base: https://huggingface.co/LiquidAI/LFM3-VL-2B
- Model card de referencia de Liquid: https://huggingface.co/LiquidAI/LFM3-VL-2B/blob/f83d2b0a2296aaa277f394990a9b8b949ddf9691/README.md
- Licencia lfm1.0: https://huggingface.co/LiquidAI/LFM3-VL-2B/blob/main/LICENSE
- Sitio del autor: https://abliter8.ai
