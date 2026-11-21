# JustANormalTinkerer/hayai-ocr-v2.7-supernova

## Resumen

Hayai OCR v2.7 Supernova es un modelo visión-lenguaje de aproximadamente 157 millones de parámetros diseñado específicamente para el reconocimiento óptico de caracteres (OCR) a nivel de recorte, con especial énfasis en japonés, chino, coreano e inglés (CJK + EN). Lo desarrolla el autor independiente JustANormalTinkerer y se publica bajo licencia Apache 2.0 en Hugging Face. El modelo aborda el problema de la transcripción de texto denso, estilizado, vertical, horizontal y curvado en imágenes de manga y cómics, sin necesidad de una etapa intermedia de detección de líneas (como DBNet o YOLO).

La arquitectura combina un codificador visual SigLIP2 NaFlex de Google con un decodificador causal GQA de 12 capas. Una de sus innovaciones destacadas es el enrutamiento adaptativo de parches en una sola pasada (`max_patches="auto"`), que asigna automáticamente cada recorte a uno de los presupuestos de parches {128, 192, 256, 384} según la geometría exacta del escalado NaFlex, sin escalado de segunda pasada. Esto permite maximizar el rendimiento y la precisión simultáneamente.

El modelo es relevante ahora porque ofrece resultados de vanguardia en el benchmark JMangaBench_Read v1.3.3 (composite de 98,87, EM del 95,70 %, CER del 0,96 %) superando al modelo líder del ranking público, con un throughput de 103,39 imágenes por segundo en una sola Tesla T4 y un pico de VRAM de 2,27 GB. Su tamaño compacto y su licencia permisiva lo hacen atractivo para despliegues en producción con recursos limitados.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Codificador visual SigLIP2 NaFlex + decodificador causal GQA de 12 capas |
| Parámetros totales | 158.379.408 (~157M) |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | No disponible (pesos en safetensors, evaluado en fp16) |
| Idiomas soportados | Inglés (en), japonés (ja), chino (zh), coreano (ko) |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors |

## Arquitectura y entrenamiento

El modelo sigue una arquitectura visión-lenguaje compuesta por un codificador visual SigLIP2 NaFlex y un decodificador causal GQA de 12 capas. Incorpora fusión multi-profundidad de trazos (`StaticDepthFusion`) y un anclaje estructural IDS de 226 clases en la capa 6 para el reconocimiento de kanji y hanzi complejos. El flujo causal es de doble orden: horizontal de izquierda a derecha (LTR) para inglés, chino, coreano y japonés horizontal, y vertical de derecha a izquierda (RTL) para manga. El modelo transcribe texto en una sola pasada hacia adelante, sin etapa intermedia de detección de líneas.

El entrenamiento se apoya en tres conjuntos de datos publicados por el autor: `animetext-ocr-jp-only-v2`, `hayai-synth-dataset-v2` y `hayai-synth-multilingual`, e incluye una etapa dedicada multilingüe para JA/ZH/KO/EN. El enrutamiento adaptativo de parches (`max_patches="auto"`) asigna cada recorte a {128, 192, 256, 384} parches a partir de la geometría exacta del escalado NaFlex (`max_scale=4.0`), ordenando y agrupando por número de parches sin escalado de segunda pasada. No se dispone de información sobre el número total de tokens de entrenamiento, la composición exacta del dataset ni el uso de RLHF/DPO.

## Capacidades

- Reconocimiento óptico de caracteres a nivel de recorte en japonés, chino, coreano e inglés.
- Transcripción de texto denso, estilizado, vertical, horizontal y curvado en una sola pasada.
- Manejo de flujo causal de doble orden: horizontal LTR y vertical RTL para manga.
- Anclaje estructural IDS para kanji y hanzi complejos mediante fusión multi-profundidad de trazos.
- Enrutamiento adaptativo de parches en una sola pasada (`max_patches="auto"`), sin escalado de segunda pasada.
- Procesamiento por lotes ordenado por número de parches para maximizar el throughput.
- Extracción de características (feature-extraction) y pipeline image-to-text.
- No se dispone de información sobre soporte de tool calling, function calling, agentes, modo thinking, visión general, audio o matemáticas.

## Casos de uso

- Digitalización de manga y cómics: el modelo transcribe bocadillos, narración y textos al margen a nivel de recorte con un CER del 0,96 % en JMangaBench_Read, lo que permite construir pipelines de traducción y catalogación de obras japonesas con alta fidelidad.
- Traducción automática de manga en producción: al reconocer texto vertical RTL y horizontal LTR en una sola pasada, se puede encadenar con un motor de traducción y un sistema de composición tipográfica para publicar ediciones localizadas con latencia baja (6,59 ms por recorte a 256 parches en T4).
- Extracción de texto en documentos CJK escaneados: útil para digitalización de archivos, formularios y documentos administrativos en japonés, chino y coreano, con la salvedad de que requiere un detector de texto o burbujas para páginas completas.
- Procesamiento por lotes de alto rendimiento: con 147,28 imágenes/s a 256 parches y 208,07 imágenes/s a 128 parches en una sola Tesla T4, es adecuado para tareas de indexación masiva de archivos de imágenes.
- Sistemas de accesibilidad: transcripción de texto en imágenes para lectores de pantalla en contenidos CJK, aprovechando el bajo consumo de VRAM (0,92 GB a 128 parches) para despliegues en hardware modesto.
- Moderación y análisis de contenido: extracción de texto de imágenes generadas por usuarios en plataformas de publicación de cómics o ilustraciones, con el fin de detectar contenido no permitido o clasificar obras por idioma.
- Investigación en OCR multilingüe: el modelo sirve como línea base reproducible (Apache 2.0) para experimentos con el benchmark JMangaBench y para el desarrollo de detectores de texto complementarios.

## Benchmarks y rendimiento

Resultados en JMangaBench_Read v1.3.3 (7.789 recortes de 1.847 páginas), evaluados con RIN v1.2:

| Modelo | Composite ↑ | 1-NED (All) ↑ | EM % ↑ | CER % ↓ | EM NFKC % ↑ |
|---|---|---|---|---|---|
| Hayai OCR v2.7 Supernova (auto) | 98,87 | 99,23 | 95,70 | 0,96 | 83,71 |
| Hayai OCR v2.7 Supernova (p256) | 98,72 | 99,11 | 95,17 | 1,79 | 83,30 |
| Hayai OCR v2.7 Supernova (p384) | 98,69 | 99,10 | 95,03 | 1,00 | 83,16 |
| Hayai OCR v2.7 Supernova (p128) | 98,44 | 98,77 | 92,99 | 3,17 | 81,42 |
| nar-small-R16 (experimental) | 98,12 | — | 93,86 | 1,08 | 82,23 |
| manga-ocr-base-CPT-flex (#1 ranking) | 97,48 | — | 91,71 | 1,50 | 80,60 |
| Hayai v2.5 Nova (p384) | 96,63 | — | 88,20 | 2,38 | 75,59 |
| Hayai v2.5 Nova (p256) | 96,60 | — | 87,19 | 2,95 | 74,84 |

Resultados en JMangaBench_Hard v1.0:

| Modelo | Score ↑ | EM % ↑ | CER % ↓ |
|---|---|---|---|
| Hayai OCR v2.7 Supernova (auto) | 96,35 | 89,35 | 4,02 |
| Hayai OCR v2.7 Supernova (p256) | 96,10 | No disponible | No disponible |
| manga-ocr-ar-experimental (#1 ranking) | 95,98 | No disponible | No disponible |

Rendimiento en una sola Tesla T4 en fp16 con CUDA Graphs:

| Configuración | Imágenes/s | ms/recorte | VRAM pico |
|---|---|---|---|
| `max_patches="auto"` (JMangaBench_Read) | 103,39 | No disponible | 2,27 GB |
| `max_patches="auto"` (JMangaBench_Hard) | 137 | No disponible | No disponible |
| `max_patches=256` | 147,28 | 6,59 | No disponible |
| `max_patches=128` | 208,07 | 4,75 | 0,92 GB |

Desglose destacado por subconjunto en JMangaBench_Read v1.3.3 (auto): texto impreso 97,11 % EM, no impreso 91,37 % EM, difícil 82,27 % EM, vertical 96,16 % EM, horizontal 90,43 % EM, diálogo 96,01 % EM, narración 95,44 % EM.

## Requisitos de hardware

- VRAM estimada para inferencia: 0,92 GB pico a 128 parches; 2,27 GB pico con `max_patches="auto"`; el modelo en fp16 ocupa aproximadamente 0,3 GB de pesos, por lo que el resto corresponde a activaciones y buffers.
- GPU recomendadas: Tesla T4 es la referencia de las mediciones; cualquier GPU con al menos 3 GB de VRAM debería poder ejecutar el modelo en fp16.
- Cabe en GPU de consumo: sí, en tarjetas como RTX 3060, RTX 4060, RTX 4090 y similares con 8 GB o más; también en GPUs de gama baja con 4 GB.
- Opciones de despliegue: transformers (librería declarada), con soporte de CUDA Graphs en fp16 según las mediciones del autor; no se dispone de información sobre soporte de vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: 6,59 ms por recorte a 256 parches (147,28 imágenes/s) y 4,75 ms por recorte a 128 parches (208,07 imágenes/s) en una Tesla T4 en fp16 con CUDA Graphs.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | JMangaBench_Read (composite) | JMangaBench_Hard (score) | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Hayai OCR v2.7 Supernova | ~157M | No disponible | 98,87 | 96,35 | Apache 2.0 | Hugging Face |
| manga-ocr-base-CPT-flex | No disponible | No disponible | 97,48 | No disponible | No disponible | Ranking público JMangaBench |
| manga-ocr-ar-experimental | No disponible | No disponible | No disponible | 95,98 | No disponible | Ranking público JMangaBench |
| Hayai v2.5 Nova | No disponible | No disponible | 96,63 | No disponible | No disponible | Hugging Face (versión anterior del mismo autor) |

## Limitaciones y advertencias

- El modelo está diseñado para reconocimiento a nivel de recorte; para OCR de página completa es necesario emparejarlo con un detector de texto o burbujas.
- El rendimiento en textos muy largos (más de 32 caracteres) cae al 83,43 % EM y 5,59 % CER, y en el subconjunto difícil al 82,27 % EM.
- El rendimiento en efectos de sonido (SFX) es muy bajo: 66,67 % EM y 6,25 % CER sobre solo 6 muestras, por lo que no es fiable para ese tipo de texto.
- Los idiomas soportados se limitan a inglés, japonés, chino y coreano; no se ha validado para otros alfabetos o sistemas de escritura.
- No se dispone de información sobre sesgos conocidos, riesgo de alucinación específico ni comportamiento fuera del dominio de manga/cómic.
- La licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantías ni soporte; el modelo es de un desarrollador independiente con 858 descargas y 5 likes en el momento de la ficha.
- No se dispone de información sobre cuantizaciones oficiales (GGUF, GPTQ, AWQ) ni sobre el comportamiento en precisión reducida más allá de fp16.

## Enlaces

- Hugging Face: https://huggingface.co/JustANormalTinkerer/hayai-ocr-v2.7-supernova
- Benchmark JMangaBench_Read: https://github.com/muscgab/JMangaBench_Read
- Dataset animetext-ocr-jp-only-v2: https://huggingface.co/datasets/JustANormalTinkerer/animetext-ocr-jp-only-v2
- Dataset hayai-synth-dataset-v2: https://huggingface.co/datasets/JustANormalTinkerer/hayai-synth-dataset-v2
- Dataset hayai-synth-multilingual: https://huggingface.co/datasets/JustANormalTinkerer/hayai-synth-multilingual
