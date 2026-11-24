# JustANormalTinkerer/hayai-ocr-v2.7-supernova

## Resumen

Hayai OCR v2.7 Supernova es un modelo de reconocimiento óptico de caracteres (OCR) a nivel de recorte, desarrollado por el usuario JustANormalTinkerer, especializado en la transcripción de texto japonés, chino, coreano e inglés presente en viñetas de manga, bocadillos de diálogo, cajas de narración y efectos de sonido. Con aproximadamente 157 millones de parámetros, combina un codificador visual SigLIP2 NaFlex con un decodificador causal de 12 capas con atención GQA (grouped-query attention), lo que le permite transcribir texto denso, estilizado, vertical, horizontal y curvo en una sola pasada sin necesidad de un detector de líneas independiente.

La relevancia de este checkpoint radica en su rendimiento sobre los benchmarks JMangaBench: alcanza un compuesto de 98,84 en JMangaBench_Read v1.3.3 (99,21 de 1-NED, 95,70 % de coincidencia exacta y 0,81 % de tasa de error por carácter) y 96,36 en JMangaBench_Hard v1.0, superando en todas las configuraciones de parches evaluadas a la entrada anterior número uno de la clasificación (95,98). Esta versión incorpora un ajuste fino adicional de 8.000 pasos sobre el split `edgecases` del dataset sintético multilingüe, fusionado mediante WiSE-FT con los pesos base de la etapa 3, lo que mejora el reconocimiento de textos largos y recortes densos sin degradar la precisión en diálogos estándar.

El modelo está publicado bajo licencia Apache 2.0 y se distribuye en formato safetensors con código personalizado (`custom_code`), lo que facilita su integración en pipelines de extracción de texto para cómics y manga, así como en aplicaciones de digitalización de material escaneado con texto CJK. Su tamaño compacto (158 millones de parámetros, repositorio de 3,8 GB) lo hace viable en hardware de consumo, un aspecto diferencial frente a modelos de visión-lenguaje de mayor escala.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Codificador visual SigLIP2 NaFlex + decodificador causal de 12 capas con GQA (grouped-query attention) |
| Parametros totales | 158.379.408 (~157M) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | Inglés (en), japonés (ja), chino (zh), coreano (ko) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (con `custom_code`) |

## Arquitectura y entrenamiento

El modelo sigue una arquitectura de visión-lenguaje compacta: un codificador visual SigLIP2 NaFlex que procesa recortes de imagen con escalado adaptativo (`max_scale=4.0`) y un decodificador causal de 12 capas con atención GQA que genera la transcripción de forma autorregresiva. La innovación principal es el enrutamiento adaptativo de parches en una sola pasada (`max_patches="auto"`): cada recorte se asigna a un nivel de parches en {128, 192, 256, 384} directamente a partir de la geometría de escalado de NaFlex, ordenando y agrupando por número de parches sin necesidad de reejecuciones en una segunda pasada. Esto permite ajustar dinámicamente el coste computacional según la densidad del texto.

El entrenamiento se apoya en tres datasets: `animetext-ocr-jp-only-v2`, `hayai-synth-dataset-v2` y `hayai-synth-multilingual`. La versión 2.7 Supernova parte de los pesos base de la etapa 3 y aplica un ajuste fino adicional de 8.000 pasos sobre el split `edgecases` del dataset sintético multilingüe, fusionado posteriormente mediante WiSE-FT (weight-space ensembling). Esta fusión, en lugar de un reemplazo directo de pesos, mejora el reconocimiento de textos largos y recortes densos conservando la precisión en diálogos y efectos de sonido. No se especifica en la información disponible el número total de tokens de entrenamiento ni si se emplearon técnicas de RLHF o DPO.

## Capacidades

- Transcripción OCR de texto japonés, chino, coreano e inglés en recortes de imagen (bocadillos, cajas de narración, efectos de sonido).
- Manejo de texto vertical, horizontal, cuadrado y curvo en una sola pasada.
- Reconocimiento de texto denso y estilizado propio de manga y cómics.
- Enrutamiento adaptativo de parches (`max_patches="auto"`) para ajustar coste y precisión por recorte.
- Procesamiento por lotes ordenado por número de parches para maximizar el rendimiento.
- No se documenta soporte de tool calling, function calling ni razonamiento multi-paso en la información disponible.
- Capacidades multilingües limitadas a los cuatro idiomas declarados (en, ja, zh, ko).
- No se documentan capacidades de visión general más allá del OCR, ni audio, ni modo de razonamiento explícito.

## Casos de uso

- Digitalización de manga y cómics: el modelo transcribe recortes de bocadillos y cajas de narración con un 95,70 % de coincidencia exacta en JMangaBench_Read, lo que permite generar guiones o subtítulos a partir de páginas escaneadas tras aplicar un detector de burbujas.
- Traducción asistida de manga: al extraer el texto japonés, chino o coreano de cada recorte con alta fidelidad (0,81 % CER), se puede alimentar un pipeline de traducción automática manteniendo el orden de lectura vertical u horizontal.
- Archivado y búsqueda de material escaneado: la transcripción precisa de texto impreso (97,07 % EM en el subconjunto `printed`) permite indexar y buscar contenido dentro de bibliotecas de cómics o revistas.
- Localización de videojuegos y novelas visuales: el modelo puede procesar capturas de pantalla con texto estilizado o efectos de sonido, facilitando la extracción de cadenas para su traducción y revisión.
- Extracción de datos de documentos con texto CJK: aunque está especializado en recortes de manga, su rendimiento en texto impreso lo hace útil para digitalizar formularios, etiquetas o material promocional con caracteres japoneses, chinos o coreanos.
- Control de calidad en pipelines de OCR: con un rendimiento de 92,01 imágenes/s en modo `auto` y hasta 148,78 imágenes/s en `p128`, puede emplearse como verificador o segunda opinión sobre transcripciones generadas por otros sistemas.
- Procesamiento por lotes en producción: la agrupación por número de parches y el enrutamiento adaptativo permiten desplegar el modelo en servicios de extracción masiva con latencia controlada.

## Benchmarks y rendimiento

Resultados publicados en la model card sobre JMangaBench (RIN v1.2, `manga_nar_semantic_r10_20261020`, sin predicciones faltantes). Mayor es mejor para Composite, 1-NED, Score, EM y EM NFKC; menor es mejor para CER.

**JMangaBench_Read v1.3.3 (7.789 recortes de 1.847 páginas):**

| Modelo | Composite | 1-NED | EM (%) | CER (%) | EM NFKC (%) |
|---|---|---|---|---|---|
| Hayai OCR v2.7 Supernova (`auto`) | 98,84 | 99,21 | 95,70 | 0,81 | 83,85 |
| Hayai OCR v2.7 Supernova (`p256`) | 98,82 | 99,21 | 95,78 | 0,88 | 83,84 |
| Hayai OCR v2.7 Supernova (`p384`) | 98,81 | 99,17 | 95,65 | 1,00 | 83,77 |
| Hayai OCR v2.7 Supernova (`p512`) | 98,78 | 99,16 | 95,56 | 0,86 | 83,71 |
| Hayai OCR v2.7 Supernova (`p128`) | 98,61 | 98,94 | 94,18 | 2,61 | 82,66 |
| nar-small-R16 (experimental) | 98,12 | — | 93,86 | 1,08 | 82,23 |
| manga-ocr-base-CPT-flex (n.º 1 previo) | 97,48 | — | 91,71 | 1,50 | 80,60 |
| Hayai v2.5 Nova (`p384`) | 96,63 | — | 88,20 | 2,38 | 75,59 |
| Hayai v2.5 Nova (`p256`) | 96,60 | — | 87,19 | 2,95 | 74,84 |

**JMangaBench_Hard v1.0:**

| Configuración | Score | CER (%) | EM (%) | Throughput (img/s) |
|---|---|---|---|---|
| `auto` | 96,36 | 3,98 | 89,19 | 112,07 |
| `p256` | 96,36 | No disponible | No disponible | No disponible |

Todas las configuraciones de parches evaluadas (`p128`, `p256`, `p384`, `auto`) superan la entrada anterior número uno de la clasificación (95,98).

**Ganancias en texto largo (WiSE-FT), subconjunto `len_>32` de JMangaBench_Read:**

| Configuración | 1-NED | EM (%) | CER (%) |
|---|---|---|---|
| `auto` | 98,28 | 83,43 | 3,53 |
| `p256` | No disponible | 81,66 | 4,67 |
| `p512` | No disponible | 84,62 | 3,56 |

**Rendimiento (throughput) en JMangaBench_Read v1.3.3:** `auto` 92,01 imágenes/s; `p256` 99,06 imágenes/s; `p128` 148,78 imágenes/s.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con 158 millones de parámetros en safetensors (repositorio de 3,8 GB), la inferencia en fp16 requiere aproximadamente 0,3 GB para los pesos, más el coste del codificador visual y las activaciones.
- GPU recomendadas: no se especifican en la información disponible; por tamaño, el modelo es apto para GPUs de consumo como RTX 3060, RTX 4060, RTX 4070 o superiores.
- Cabe en GPU de consumo: sí, previsiblemente en cualquier GPU con al menos 4-6 GB de VRAM, aunque el dato exacto no está confirmado.
- Opciones de despliegue: la librería declarada es `transformers` con `custom_code`; no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: 92,01 imágenes/s en modo `auto`, 99,06 imágenes/s en `p256` y 148,78 imágenes/s en `p128` sobre JMangaBench_Read v1.3.3 (hardware de evaluación no especificado).

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Composite (JMangaBench_Read v1.3.3) | EM (%) | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Hayai OCR v2.7 Supernova | ~157M | No disponible | 98,84 (`auto`) | 95,70 | Apache 2.0 | Hugging Face |
| manga-ocr-base-CPT-flex | No disponible | No disponible | 97,48 | 91,71 | No disponible | No disponible |
| nar-small-R16 | No disponible | No disponible | 98,12 | 93,86 | No disponible | No disponible |
| Hayai v2.5 Nova | No disponible | No disponible | 96,63 (`p384`) | 88,20 | No disponible | Hugging Face |

Los datos de parámetros, contexto y licencia de los modelos comparados no están disponibles en la información proporcionada.

## Limitaciones y advertencias

- El modelo está diseñado para recortes de texto (bocadillos, cajas de narración, efectos de sonido); para páginas completas es necesario aplicar antes un detector de texto o de burbujas.
- Los idiomas soportados se limitan a inglés, japonés, chino y coreano; no se garantiza su rendimiento en otros idiomas.
- El rendimiento en efectos de sonido es notablemente inferior: en el subconjunto `role_sfx` (n=6) se obtiene un 66,67 % de EM y un 6,25 % de CER, con un intervalo de confianza muy amplio.
- El texto largo sigue siendo el punto débil: en `len_>32` la EM baja al 83,43 % (modo `auto`) y el CER sube al 3,53 %, aunque WiSE-FT mejora esta métrica respecto a versiones anteriores.
- El texto horizontal presenta peor rendimiento que el vertical: 90,21 % EM y 3,79 % CER frente a 96,17 % EM y 0,62 % CER en vertical.
- No se documentan sesgos específicos, pero al entrenarse con datasets sintéticos y de manga, puede presentar sesgos hacia estilos y tipografías presentes en esos corpus.
- Riesgo de alucinación: no se documenta explícitamente; en OCR, el decodificador causal podría generar texto plausible no presente en la imagen en recortes ambiguos o de baja calidad.
- La licencia Apache 2.0 permite uso comercial, pero el modelo se distribuye con `custom_code`, por lo que conviene revisar el código asociado antes de desplegarlo en producción.
- No se especifican requisitos de hardware ni cuantizaciones oficiales, lo que puede complicar la planificación de despliegues.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/JustANormalTinkerer/hayai-ocr-v2.7-supernova
- Dataset animetext-ocr-jp-only-v2: https://huggingface.co/datasets/JustANormalTinkerer/animetext-ocr-jp-only-v2
- Dataset hayai-synth-dataset-v2: https://huggingface.co/datasets/JustANormalTinkerer/hayai-synth-dataset-v2
- Dataset hayai-synth-multilingual: https://huggingface.co/datasets/JustANormalTinkerer/hayai-synth-multilingual
- JMangaBench_Read (repositorio de benchmark): https://github.com/muscgab/JMangaBench_Read
