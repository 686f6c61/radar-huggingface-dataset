# mssqpi/Nuha-3-OCR

## Resumen

Nuha 3 OCR es un modelo de visión-lenguaje especializado en reconocimiento óptico de caracteres (OCR) y análisis de maquetación de documentos en árabe e inglés, desarrollado por el usuario mssqpi. Se construye mediante un ajuste fino del modelo base google/gemma-4-12B-it, un transformer de 12 mil millones de parámetros con arquitectura Gemma-4 unificada, que integra la imagen directamente en el espacio de tokens del modelo sin torre de visión separada. El modelo resuelve la extracción estructurada de texto y regiones a partir de imágenes de página, devolviendo un JSON con cajas delimitadoras, etiquetas semánticas y el texto de cada región en orden de lectura.

La relevancia del modelo radica en su especialización para documentos árabes, un dominio donde la mayoría de los sistemas OCR comerciales rinden de forma notablemente inferior. Según la model card, Nuha 3 OCR alcanza 92,4 en la columna árabe de MDPBench, por delante de MonkeyOCRv2-S (91,2), Gemini 3 Pro (89,4), Mistral OCR 4.0 (84,4) y Claude Sonnet 4.6 (67,8). También reporta 81,7 en documentos de negocio reales (formularios, cartas, informes y tablas), frente a 74,5 de GPT-5.5.

El modelo se distribuye con licencia Gemma, en formato safetensors bfloat16 con un tamaño de repositorio de 24 GB, y está pensado para despliegue en producción mediante vLLM con una pila de serving concreta (vLLM ≥ 0.28, transformers ≥ 5.16, PyTorch 2.13 y CUDA 13.0).

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Gemma-4 unificada (`Gemma4UnifiedForConditionalGeneration`), transformer con embedder de imagen integrado, sin torre de visión separada |
| Parámetros totales | 11.959.730.224 (≈ 12 B) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | 16.384 tokens configurados en serving (`--max-model-len 16384`); presupuesto de imagen de 1.120 tokens por página (`max_soft_tokens = 1120`) |
| Tipos de cuantización | no disponible (pesos publicados en bfloat16; la model card no documenta cuantizaciones) |
| Idiomas soportados | árabe (ar), inglés (en) |
| Licencia | Gemma |
| Formato de pesos | safetensors (bfloat16, 23,9 GB), más `config.json`, `generation_config.json`, tokenizer y processor |

## Arquitectura y entrenamiento

El backbone es Gemma-4-12B-it, un modelo de lenguaje de 12 mil millones de parámetros sin torre de visión independiente: la imagen de página se reescala y se divide en cuadrados de 48 × 48 píxeles, y cada cuadrado se convierte en un token de entrada mediante un embedder pequeño que forma parte del modelo. Cada página consume como máximo 1.120 tokens de imagen, lo que equivale aproximadamente a dos líneas de prensa por cuadrado; el texto de cuerpo pequeño se beneficia de una segunda lectura recortada que aplica el harness del autor. El modelo fue ajustado con GRPO (según los tags del repositorio) sobre el checkpoint instructivo base, y se entrenó y evaluó sin canal de razonamiento (*thinking*), por lo que el serving requiere `enable_thinking: false`.

La salida es un parse de maquetación en JSON: una lista de objetos `{"box_2d": [y1, x1, y2, x2], "label": "...", "text": "..."}` con cajas en una rejilla de 0 a 1000 (coordenada y antes que x), etiquetas `text`, `marginalia`, `table`, `logo`, `figure`, `attestation`, `scan_code` y `card`, texto en Markdown y tablas en HTML. El orden de la lista es el orden de lectura (de derecha a izquierda, columna a columna). Las cajas sin texto legible (figuras, logotipos, códigos de escaneo, sellos o firmas sin palabras) no llevan campo `text`. El tokenizer y el procesador de imagen son los del modelo base, sin cambios.

## Capacidades

- OCR de documentos árabes impresos: libros, informes y páginas nativas digitales.
- Lectura de páginas fotografiadas con pliegues, sombras, dobleces e inclinación; las páginas giradas se detectan y se releen.
- Reconocimiento de escritura manuscrita y de manuscritos históricos.
- Análisis de maquetación con cajas delimitadoras, etiquetas semánticas y orden de lectura.
- Extracción de tablas en HTML y texto en Markdown.
- Detección de elementos no textuales: figuras, logotipos, códigos de escaneo, sellos y tarjetas.
- Procesamiento de formularios y documentos de negocio (cartas, informes, tablas).
- Soporte bilingüe árabe-inglés.
- API compatible con OpenAI mediante vLLM, con parser de razonamiento `gemma4`.
- Soporte de múltiples imágenes por prompt en serving (`--limit-mm-per-prompt '{"image": 4}'`).
- No dispone de canal de razonamiento activo: el thinking debe desactivarse explícitamente.

## Casos de uso

- Digitalización de archivos y bibliotecas árabes: el modelo procesa páginas de libros impresos y manuscritos históricos devolviendo texto estructurado con orden de lectura correcto (derecha a izquierda, columna a columna), adecuado para pipelines de preservación digital a gran escala.
- Automatización de entrada de datos en formularios y documentos de negocio: con 81,7 en documentos reales según la model card, puede extraer campos y tablas de formularios, cartas e informes para integrarlos en sistemas de gestión documental.
- Procesamiento de manuscritos y patrimonio cultural: con 88,1 % de precisión y F1 de maquetación de 95,5 en manuscritos, sirve para proyectos de transcripción asistida de colecciones históricas.
- Captura móvil de documentos: la lectura de páginas fotografiadas con pliegues, sombras e inclinación (91,1 en fotos de móvil de MDPBench) permite construir aplicaciones de escaneo que corrigen y releen páginas giradas.
- Extracción de tablas para análisis de datos: la salida HTML de tablas facilita la conversión a estructuras tabulares en pipelines de BI o ETL sobre informes financieros y administrativos.
- Enriquecimiento de repositorios documentales con metadatos de maquetación: las etiquetas semánticas (marginalia, sello, figura, código de escaneo) permiten clasificar regiones y construir índices de acceso por tipo de contenido.
- Serving en producción con vLLM: la integración con la API compatible con OpenAI y el script `serve_nuha3.sh` permiten desplegar el modelo en un servidor con una sola GPU de 80 GB o con tensor paralelo en varias tarjetas.

## Benchmarks y rendimiento

| Benchmark | Nuha 3 OCR | Comparativa |
|---|---|---|
| MDPBench árabe (160 páginas, mismo scorer) | 92,4 | MonkeyOCRv2-S 91,2; MonkeyOCRv2-B 90,7; Gemini 3 Pro 89,4; Mistral OCR 4.0 84,4; dots.mocr 83,3; Claude Sonnet 4.6 67,8; ChatGPT-5.2 64,9 |
| Documentos de negocio reales (366 formularios, cartas, informes y tablas) | 81,7 | GPT-5.5 74,5; dots.mocr 74,4; Qwen3.8-Flash 68,4 |
| Fotos de móvil MDPBench (arrugadas, con sombras, dobladas, inclinadas) | 91,1 | Nuha 2 85,7; Nuha 1 82,4 |
| Escritura manuscrita (HW-OCR hold-out) | 83,2 % | Nuha 2 78,2 |
| Párrafos manuscritos KHATT | 82,5 % | Nuha 2 76,8 |
| Manuscritos (precisión) | 88,1 % | no disponible |
| Manuscritos (F1 de maquetación) | 95,5 | no disponible |
| KITAB-Bench, párrafos manuscritos KHATT (con pipeline) | 74,1 | Nuha 2 67,9 |

La model card indica que las filas de MDPBench corresponden a las puntuaciones publicadas de los sistemas sobre las mismas páginas públicas y el mismo scorer; los umbrales del pipeline se ajustaron sobre ese split público, aunque el modelo no se entrenó con él. La precisión se define como 100 × (1 − tasa de error de caracteres). En KITAB-Bench con pipeline, el modelo es el mejor de las tres generaciones en 10 de sus 13 subconjuntos OCR.

## Requisitos de hardware

- VRAM estimada: aproximadamente 24 GB para los pesos en bfloat16 más la caché KV; una GPU de 80 GB queda holgada y una de 40 GB funciona reduciendo `--max-model-len`.
- GPU probada: una NVIDIA B300 en el entorno de referencia del autor.
- GPU recomendadas: A100 80 GB, H100 80 GB o B300 para despliegue completo con contexto de 16.384 tokens; tarjetas de 40 GB con contexto reducido.
- No cabe en GPUs de consumo de 24 GB con los pesos en bfloat16 completos; la model card no documenta cuantizaciones que permitan reducir el requisito.
- Despliegue: vLLM ≥ 0.28 (probado con `0.28.1rc1.dev478+g5893426b8`) con el parser de razonamiento `gemma4`, transformers ≥ 5.16 (probado con 5.16.1), PyTorch 2.13.0 con CUDA 13.0 y flashinfer 0.6.18.
- Script de serving incluido: `serve_nuha3.sh [MODEL_DIR] [PORT] [GPUS]`, con soporte de tensor paralelo (`0,1` para dos tarjetas) y de compartición de GPU (`GPU_MEM=0.45`).
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | MDPBench árabe | Documentos de negocio | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Nuha 3 OCR | ≈ 12 B | 16.384 tokens (1.120 por imagen) | 92,4 | 81,7 | Gemma | Hugging Face (repo privado, requiere autenticación) |
| MonkeyOCRv2-S | no disponible | no disponible | 91,2 | no disponible | no disponible | no disponible |
| Gemini 3 Pro | no disponible | no disponible | 89,4 | no disponible | propietaria | API de Google |
| Mistral OCR 4.0 | no disponible | no disponible | 84,4 | no disponible | propietaria | API de Mistral |
| dots.mocr | no disponible | no disponible | 83,3 | 74,4 | no disponible | no disponible |
| GPT-5.5 | no disponible | no disponible | no disponible | 74,5 | propietaria | API de OpenAI |

## Limitaciones y advertencias

- El modelo está especializado en árabe e inglés; no se documenta soporte para otras lenguas.
- El repositorio es privado y requiere `hf auth login` para descargar los pesos.
- El serving exige `enable_thinking: false`; activar el canal de razonamiento degrada la salida porque el modelo no se entrenó con él.
- Es obligatorio usar `max_soft_tokens: 1120`; omitirlo cambia la resolución que ve el modelo y reduce la precisión.
- El texto de cuerpo pequeño puede requerir una segunda lectura recortada mediante el harness del autor para alcanzar la precisión reportada.
- El contexto de 16.384 tokens limita el tamaño de página procesable en una sola pasada; páginas muy densas pueden necesitar segmentación.
- Riesgo de alucinación en regiones ambiguas o de baja calidad: la model card no documenta métricas de fidelidad específicas ni mecanismos de abstención.
- Sesgos conocidos: no disponibles en la información proporcionada.
- Licencia Gemma: el uso comercial está sujeto a los términos de la licencia de Google, que imponen restricciones y obligaciones de atribución; conviene revisarlos antes de un despliegue en producción.
- Los benchmarks de la model card fueron generados por el propio autor con su pipeline; los umbrales se ajustaron sobre el split público de MDPBench, aunque el modelo no se entrenó con él.
- La pila de serving depende de una versión nightly de vLLM y de versiones muy recientes de transformers y CUDA, lo que puede complicar la reproducibilidad en entornos más conservadores.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/mssqpi/Nuha-3-OCR
- Modelo base: https://huggingface.co/google/gemma-4-12B-it
- Artículo de Gemma: no disponible en la información proporcionada
- Paper de Nuha 3 OCR: no disponible en la información proporcionada
- Repositorio de código: no disponible en la información proporcionada
- Demo: no disponible en la información proporcionada
