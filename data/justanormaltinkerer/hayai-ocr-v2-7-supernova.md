# JustANormalTinkerer/hayai-ocr-v2.7-supernova

## Resumen

Hayai OCR v2.7 Supernova es un modelo de visión-lenguaje de aproximadamente 158 millones de parámetros, desarrollado por el usuario JustANormalTinkerer y publicado en Hugging Face bajo licencia Apache 2.0. Está diseñado específicamente para el reconocimiento óptico de caracteres (OCR) a nivel de recorte (crop-level), orientado a texto japonés, chino, coreano e inglés, con especial énfasis en manga y material estilizado. Combina un codificador visual SigLIP2 NaFlex con un decodificador causal GQA de 12 capas, lo que le permite transcribir texto denso, vertical, horizontal y curvado en una única pasada directa, sin necesidad de una etapa intermedia de detección de líneas.

El modelo destaca por su rendimiento en los benchmarks JMangaBench: obtiene una puntuación compuesta de 98,72 en JMangaBench_Read v1.3.3 (95,17 % de coincidencia exacta y 1,79 % de tasa de error de caracteres) y 96,10 en JMangaBench_Hard v1.0, superando a los modelos líderes del ranking público. Además, alcanza un throughput sostenido de 147,28 imágenes por segundo en una única GPU Tesla T4 en fp16 con CUDA Graphs, lo que lo sitúa como una opción muy eficiente para pipelines de OCR a gran escala.

Su relevancia actual radica en que resuelve un problema concreto del procesamiento de manga y documentos CJK: la transcripción precisa de texto estilizado y vertical sin depender de detectores externos de burbujas o líneas. Con un tamaño compacto (0,6 GB de repositorio) y licencia permisiva, es adecuado para despliegues en producción con requisitos moderados de hardware.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Codificador visual SigLIP2 NaFlex + decodificador causal GQA de 12 capas |
| Parámetros totales | 158.379.408 |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (evaluado con max_patches=256) |
| Tipos de cuantización | No disponible (pesos en safetensors; fp16 usado en benchmarks) |
| Idiomas soportados | Inglés, japonés, chino, coreano |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors |

## Arquitectura y entrenamiento

El modelo sigue una arquitectura visión-lenguaje de tipo encoder-decoder: un codificador visual SigLIP2 NaFlex procesa la imagen de entrada y un decodificador causal con atención GQA (Grouped Query Attention) de 12 capas genera la transcripción. Incorpora varias innovaciones técnicas: fusión multi-profundidad de trazos (`StaticDepthFusion`), anclaje estructural IDS de 226 clases en la capa 6 para kanji y hanzi complejos, y un flujo causal de doble orden que cubre tanto la lectura horizontal de izquierda a derecha (inglés, chino, coreano y japonés horizontal) como la vertical de derecha a izquierda (manga). El modelo opera a nivel de recorte, por lo que para OCR de página completa debe combinarse con un detector de texto o burbujas.

En cuanto a los datos de entrenamiento, la model card referencia tres datasets: `JustANormalTinkerer/animetext-ocr-jp-only-v2`, `JustANormalTinkerer/hayai-synth-dataset-v2` y `JustANormalTinkerer/hayai-synth-multilingual`. El entrenamiento incluye una etapa multilingüe dedicada para japonés, chino, coreano e inglés. No se especifica en la información disponible el número total de tokens, la composición exacta del dataset ni si se aplicaron técnicas de RLHF o DPO.

## Capacidades

- Transcripción OCR a nivel de recorte de texto japonés, chino, coreano e inglés, incluyendo texto denso, estilizado, vertical, horizontal y curvado.
- Reconocimiento de kanji y hanzi complejos gracias al anclaje estructural IDS de 226 clases.
- Lectura en doble orden causal: horizontal de izquierda a derecha y vertical de derecha a izquierda (manga).
- Procesamiento de efectos de sonido (SFX) y rotulación estilizada.
- Manejo de texto impreso y no impreso (manuscrito y estilizado).
- Capacidades multilingües limitadas a los cuatro idiomas declarados (en, ja, zh, ko).
- No se documenta soporte de tool calling, function calling, agentes ni modos de razonamiento multi-paso en la información disponible.
- No se documentan capacidades de audio ni de visión general más allá del OCR.

## Casos de uso

- Digitalización de manga y cómics japoneses: el modelo transcribe directamente recortes de burbujas de diálogo y narración en orientación vertical, eliminando la necesidad de un detector de líneas intermedio y manteniendo alta precisión en texto estilizado.
- Traducción automática de manga: integrado como etapa de OCR previa a un traductor JA→EN, permite extraer el texto de cada burbuja con una tasa de error de caracteres del 1,79 % en JMangaBench_Read, lo que reduce los errores propagados a la traducción.
- Indexación y búsqueda de texto en archivos de scanned manga: con 147,28 imágenes por segundo en una T4, puede procesar grandes volúmenes de páginas para construir índices de búsqueda full-text sobre diálogos y narración.
- Extracción de texto de documentación CJK escaneada: adecuado para digitalizar formularios, etiquetas y documentos con texto horizontal en japonés, chino, coreano e inglés, siempre que se proporcione el recorte de cada región de texto.
- Procesamiento de efectos de sonido y rotulación en localización de cómics: el modelo alcanza 92,37 % de coincidencia exacta en el conjunto SFX de JMangaBench_Read, lo que lo hace útil para catálogos de onomatopeyas y rótulos estilizados.
- Pipelines de OCR por lotes en producción: su tamaño compacto (158 M de parámetros) y su throughput en fp16 con CUDA Graphs permiten desplegarlo en GPUs de gama media o incluso en entornos con Tesla T4 para procesamiento masivo.
- Análisis de manuscritos y lettering estilizado: con 88,72 % de EM en JMangaBench_Hard v1.0, puede emplearse en la transcripción de rotulación manual y tipografías decorativas en proyectos de archivo y preservación.

## Benchmarks y rendimiento

Los resultados siguientes proceden de la model card del autor, evaluados con `max_patches=256` y puntuados con RIN v1.2.

JMangaBench_Read v1.3.3 (7.789 recortes de 1.847 páginas):

| Modelo | Composite ↑ | 1-NED (All) ↑ | EM % ↑ | CER % ↓ | EM NFKC % ↑ |
|---|---|---|---|---|---|
| Hayai OCR v2.7 Supernova (p256) | 98,72 | 99,11 | 95,17 | 1,79 | 83,30 |
| nar-small-R16 (experimental) | 98,12 | — | 93,86 | 1,08 | 82,23 |
| manga-ocr-base-CPT-flex (#1 ranked) | 97,48 | — | 91,71 | 1,50 | 80,60 |
| Hayai v2.5 Nova (p384) | 96,63 | — | 88,20 | 2,38 | 75,59 |
| Hayai v2.5 Nova (p256) | 96,60 | — | 87,19 | 2,95 | 74,84 |

JMangaBench_Hard v1.0 (3.015 recortes de 1.339 páginas):

| Modelo | Score ↑ | CER % ↓ | EM % ↑ | EM NFKC % ↑ |
|---|---|---|---|---|
| Hayai OCR v2.7 Supernova (p256) | 96,10 | 4,77 | 88,72 | 88,46 |
| manga-ocr-ar-experimental (#1 ranked) | 95,98 | — | — | — |

JMangaBench_Read SFX Set (380 recortes):

| Composite ↑ | 1-NED (All) ↑ | EM % ↑ | CER % ↓ | EM NFKC % ↑ |
|---|---|---|---|---|
| 98,42 | 96,88 | 92,37 | 3,24 | 87,63 |

Desglose parcial de JMangaBench_Read v1.3.3 por subconjunto: texto impreso 96,78 % EM, no impreso 90,22 % EM, difícil 79,46 % EM, vertical 95,66 % EM, horizontal 88,84 % EM, diálogo 95,65 % EM. El throughput sostenido es de 147,28 imágenes por segundo (6,59 ms amortizados por recorte) en una Tesla T4 en fp16 con CUDA Graphs.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con 158 M de parámetros en fp16, el peso del modelo ocupa aproximadamente 0,3 GB, por lo que la VRAM necesaria es modesta y dominada por las activaciones y el codificador visual.
- GPU recomendadas: Tesla T4 (usada en los benchmarks del autor), así como cualquier GPU con soporte CUDA y fp16.
- Cabe en GPU de consumo: sí, con 158 M de parámetros en fp16 o cuantizado en 8 bits cabe holgadamente en GPUs consumer como RTX 3060, RTX 4060 o superiores.
- Opciones de despliegue: biblioteca transformers (declarada en la model card); no se documentan integraciones específicas con vLLM, llama.cpp, Ollama o TGI en la información disponible.
- Latencia y throughput: 6,59 ms amortizados por recorte y 147,28 imágenes por segundo en una Tesla T4 en fp16 con CUDA Graphs.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | JMangaBench_Read Composite | JMangaBench_Hard Score | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Hayai OCR v2.7 Supernova | 158 M | max_patches=256 (evaluación) | 98,72 | 96,10 | Apache 2.0 | Hugging Face |
| manga-ocr-base-CPT-flex | No disponible | No disponible | 97,48 | No disponible | No disponible | Ranking público JMangaBench |
| manga-ocr-ar-experimental | No disponible | No disponible | No disponible | 95,98 | No disponible | Ranking público JMangaBench |
| Hayai v2.5 Nova | No disponible | p256 y p384 | 96,60 (p256) / 96,63 (p384) | No disponible | No disponible | Versión anterior del mismo autor |

## Limitaciones y advertencias

- El modelo está diseñado exclusivamente para reconocimiento a nivel de recorte; para OCR de página completa requiere un detector de texto o burbujas externo (DBNet, YOLO u similar).
- Los idiomas soportados se limitan a inglés, japonés, chino y coreano; no se documenta cobertura de otras lenguas.
- El rendimiento cae de forma notable en texto muy largo: en el subconjunto `len_>32` de JMangaBench_Read, la EM baja al 73,37 % y la CER sube al 9,53 %.
- El texto horizontal y cuadrado presenta peor rendimiento que el vertical: 88,84 % EM en horizontal frente a 95,66 % en vertical.
- El subconjunto difícil de JMangaBench_Read muestra 79,46 % EM y 8,01 % CER, lo que indica fragilidad ante casos extremos.
- No se documentan sesgos conocidos, riesgos específicos de alucinación ni evaluaciones de robustez fuera de los benchmarks de manga.
- La licencia Apache 2.0 permite uso comercial, pero el autor no documenta garantías ni condiciones adicionales más allá de las de dicha licencia.
- El modelo tiene 0 descargas y 0 likes en el momento de la consulta, por lo que carece de validación independiente por parte de la comunidad.
- No se dispone de información sobre el proceso de entrenamiento (tokens, composición del dataset, RLHF/DPO), lo que limita la evaluación de su generalización.

## Enlaces

- Hugging Face: https://huggingface.co/JustANormalTinkerer/hayai-ocr-v2.7-supernova
- JMangaBench_Read: https://github.com/muscgab/JMangaBench_Read
- JMangaBench_Hard: https://github.com/muscgab/JMangaBench_Hard
- Dataset animetext-ocr-jp-only-v2: https://huggingface.co/datasets/JustANormalTinkerer/animetext-ocr-jp-only-v2
- Dataset hayai-synth-dataset-v2: https://huggingface.co/datasets/JustANormalTinkerer/hayai-synth-dataset-v2
- Dataset hayai-synth-multilingual: https://huggingface.co/datasets/JustANormalTinkerer/hayai-synth-multilingual
