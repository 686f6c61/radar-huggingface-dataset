# old-time-radio/RadioWhisper

## Resumen

RadioWhisper-v1 es un modelo de reconocimiento automático del habla (ASR) especializado en emisiones de radio estadounidenses de la era anterior a la transcripción en LP (1926-1948). Lo desarrolla el usuario `old-time-radio` y se distribuye como un ajuste fino del modelo `openai/whisper-large-v3-turbo` sobre el que se ha aplicado un proceso que el autor denomina "Super-Teacher Fine-Tuning". El modelo resuelve un problema concreto: los Whisper genéricos rinden mal sobre grabaciones históricas de radio, con ruido de banda estrecha, locución arcaica, música de fondo y una calidad de audio muy degradada, lo que se traduce en tasas de error de palabra (WER) elevadas en dominios de este tipo.

La relevancia del modelo es doble. Por un lado, mejora el WER en una evaluación ciega (held-out) del 12,14 % al 8,99 % con el runtime `faster-whisper` (CTranslate2 FP16), y del 17,39 % al 12,21 % con `generate()` de HuggingFace, sobre 51 ventanas de audio de 23 episodios no vistos y 11 series distintas. Por otro, demuestra que un corpus de ajuste muy pequeño (117 ventanas de 54 episodios y 15 series) puede producir ganancias sustanciales cuando está bien alineado con el dominio objetivo.

El artefacto publicado es únicamente el export a CTranslate2 en `float16`, con un peso de 1547,7 MB. La model card no documenta el número de parámetros ni la longitud de contexto textual, aunque por herencia de la arquitectura Whisper el modelo opera sobre ventanas de audio de 30 segundos. El modelo está pensado para inglés y su licencia es Apache-2.0.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder tipo Whisper (heredada de `openai/whisper-large-v3-turbo`) |
| Parámetros totales | No disponible (la model card no lo indica; export FP16 de 1547,7 MB) |
| Longitud de contexto | No disponible como contexto textual; por herencia de Whisper, ventanas de audio de 30 s por segmento |
| Tipos de cuantización | `float16` (export CTranslate2 publicado); otras cuantizaciones de CTranslate2 (p. ej. `int8`, `int8_float16`) no están documentadas en la model card |
| Idiomas soportados | `en` (inglés) |
| Licencia | Apache-2.0 |
| Formato de pesos | CTranslate2 (`float16`); no se publican safetensors ni GGUF en la información disponible |
| Librería | `ctranslate2` (runtime recomendado: `faster-whisper`) |
| Hardware de entrenamiento y evaluación | NVIDIA Tesla T4 |
| Corpus de entrenamiento | 117 ventanas de audio, 54 episodios, 15 series de radio distintas |
| Corpus de evaluación ciega | 51 ventanas, 23 episodios no vistos, 11 series distintas |
| Pérdida de entropía cruzada por época | 0,3389 (época 1) y 0,177 (época 2) |

## Arquitectura y entrenamiento

El modelo parte de `openai/whisper-large-v3-turbo`, un transformer encoder-decoder para ASR que procesa audio en ventanas de 30 segundos y genera texto de forma autorregresiva. RadioWhisper-v1 no modifica la topología: se trata de un ajuste fino supervisado sobre pares audio-transcripción del dominio de la radio histórica estadounidense. La model card registra dos épocas de entrenamiento con pérdidas de entropía cruzada de 0,3389 y 0,177, lo que sugiere una convergencia rápida sobre un corpus reducido y muy homogéneo. No se documenta el uso de RLHF, DPO ni ninguna innovación arquitectónica adicional (atención lineal, decodificación especulativa, etc.).

El corpus de entrenamiento es deliberadamente pequeño y especializado: 117 ventanas repartidas en 54 episodios de 15 series. La evaluación se realizó sobre un conjunto ciego separado de 51 ventanas de 23 episodios y 11 series no vistas durante el entrenamiento, con desgloses por serie y por año de emisión (1926-1948). El autor reporta resultados con dos rutas de inferencia distintas, `faster-whisper` sobre CTranslate2 FP16 y `generate()` nativo de HuggingFace, lo que permite separar el efecto del ajuste fino del efecto del runtime de cuantización. Los resultados por año y por serie muestran una varianza muy alta, coherente con el tamaño reducido del conjunto de evaluación.

## Capacidades

- Transcripción de voz a texto en inglés sobre audio de radio histórica (1926-1948), con ruido de banda, música de fondo y locución arcaica.
- Generación de transcripciones con puntuación y normalización de números y cantidades (por ejemplo, "$10" en lugar de "ten dollars" en las muestras publicadas).
- Procesamiento de audio por ventanas con `faster-whisper`, incluyendo audio de larga duración mediante segmentación (la model card muestra ventanas de 20 s, 45 s y 250 s).
- Inferencia en GPU y CPU a través de CTranslate2, con soporte de cuantización adicional en el runtime (no documentada por el autor).
- No soporta tool calling ni function calling: es un modelo puramente ASR.
- No soporta razonamiento multi-paso, uso como agente ni planificación.
- No tiene capacidades de visión, audio generation ni procesamiento multimodal más allá de audio de entrada y texto de salida.
- No se documenta "thinking mode" ni modos de razonamiento extendido.
- Capacidad multilingüe limitada al inglés según la model card, pese a que el modelo base es multilingüe.

## Casos de uso

- Digitalización de archivos de radio histórica: el modelo está ajustado específicamente sobre emisiones de 1926-1948 y reduce el WER del 12,14 % al 8,99 % frente al Whisper turbo original en la evaluación ciega del autor, lo que lo hace adecuado para proyectos de preservación sonora que necesitan transcripciones utilizables sin revisión manual exhaustiva.
- Generación de subtítulos y material accesible para series clásicas: con desgloses por serie como Sherlock Holmes (17,06 % → 5,80 % de WER con `faster-whisper`) o The Lone Ranger (3,75 % → 2,50 %), el modelo permite producir pistas de subtitulado para reediciones de catálogo.
- Indexación y búsqueda full-text de fonotecas: al generar transcripciones razonablemente limpias, permite construir índices de palabras clave sobre miles de horas de emisiones y habilitar búsquedas por diálogo, personaje o tema en archivos hasta ahora inaccesibles.
- Investigación en historia de medios y estudios culturales: investigadores pueden transcribir corpus completos de una serie para análisis de contenido, frecuencias léxicas o evolución del lenguaje radiofónico entre 1926 y 1948, usando los desgloses anuales como referencia de fiabilidad esperada.
- Producción de reediciones en podcast o streaming: el modelo sirve como paso previo de transcripción para generar notas de episodio, capítulos y metadatos descriptivos de emisiones restauradas, con la ventaja de ejecutarse en CTranslate2 sobre hardware modesto (el autor entrenó y evaluó en una Tesla T4).
- Preservación de historia oral y documentación sonora: entrevistas, discursos y grabaciones de la misma época pueden transcribirse con un modelo que ya ha visto la degradación acústica característica del periodo, reduciendo el trabajo de corrección posterior.
- Procesamiento por lotes en pipelines de bajo coste: al distribuirse como CTranslate2 FP16 de 1547,7 MB, puede integrarse en servicios de transcripción por lotes con `faster-whisper`, incluyendo despliegue en CPU con cuantización int8 del runtime.
- Enriquecimiento de metadatos en bibliotecas digitales: clasificación y etiquetado automático de grabaciones por serie, año o temática a partir de la transcripción generada, como paso previo a la catalogación manual.

## Benchmarks y rendimiento

Evaluación ciega global (51 ventanas, 23 episodios no vistos, 11 series):

| Modelo | WER `faster-whisper` (CTranslate2 FP16) | WER `generate()` HuggingFace | Pérdida de entropía cruzada |
|---|---:|---:|---:|
| `openai/whisper-large-v3-turbo` (antes del ajuste) | 12,14 % | 17,39 % | 0,4839 |
| `RadioWhisper-v1` (después del ajuste) | **8,99 %** | **12,21 %** | **0,3277** |

Desglose por serie (evaluación ciega):

| Serie de radio | Palabras evaluadas | WER `faster-whisper` stock | WER `faster-whisper` RadioWhisper | WER `generate()` stock | WER `generate()` RadioWhisper |
|---|---:|---:|---:|---:|---:|
| A Little Bit of Everything | 31 | 122,58 % | **3,23 %** | 122,58 % | 122,58 % |
| Calling All Cars | 128 | 4,69 % | **3,12 %** | 5,47 % | **3,12 %** |
| Coca Cola Topnotchers | 156 | 1,92 % | **1,92 %** | 1,92 % | **1,92 %** |
| Graham MacNamee | 112 | 7,14 % | 10,71 % | 8,04 % | **7,14 %** |
| Inner Sanctum | 46 | 15,22 % | **6,52 %** | 15,22 % | **13,04 %** |
| New Year's Shows Collection | 44 | 15,91 % | **0,0 %** | 97,73 % | **15,91 %** |
| Sam and Henry | 150 | 29,33 % | **25,33 %** | 32,67 % | **28,0 %** |
| Sherlock Holmes | 293 | 17,06 % | **5,8 %** | 36,52 % | **13,65 %** |
| The Lone Ranger | 160 | 3,75 % | **2,5 %** | 5,0 % | **3,75 %** |
| The Shadow | 855 | 6,67 % | **5,03 %** | 8,42 % | **7,95 %** |
| The Witch's Tale | 785 | 13,89 % | 15,67 % | 17,45 % | **14,65 %** |

Desglose por año de emisión (evaluación ciega):

| Año | Palabras evaluadas | WER `faster-whisper` stock | WER `faster-whisper` RadioWhisper | WER `generate()` stock | WER `generate()` RadioWhisper |
|---|---:|---:|---:|---:|---:|
| 1926 | 150 | 29,33 % | **25,33 %** | 32,67 % | **28,0 %** |
| 1927 | 112 | 7,14 % | 10,71 % | 8,04 % | **7,14 %** |
| 1928 | 31 | 122,58 % | **3,23 %** | 122,58 % | 122,58 % |
| 1929 | 44 | 15,91 % | **0,0 %** | 97,73 % | **15,91 %** |
| 1930 | 156 | 1,92 % | **1,92 %** | 1,92 % | **1,92 %** |
| 1931 | 124 | 19,35 % | 20,16 % | 19,35 % | **19,35 %** |
| 1932 | 55 | 18,18 % | 16,36 % | 12,73 % | **12,73 %** |
| 1933 | 117 | 5,13 % | 7,69 % | 5,13 % | **6,84 %** |
| 1934 | 51 | 13,73 % | 19,61 % | 21,57 % | **15,69 %** |
| 1935 | 157 | 9,55 % | **6,37 %** | 12,1 % | **9,55 %** |
| 1936 | 160 | 3,75 % | **2,5 %** | 5,0 % | **3,75 %** |
| 1937 | 192 | 18,75 % | **18,23 %** | 19,27 % | **18,23 %** |
| 1938 | 89 | 12,36 % | 28,09 % | 37,08 % | **20,22 %** |
| 1939 | 128 | 4,69 % | **3,12 %** | 5,47 % | **3,12 %** |
| 1940 | 126 | 34,92 % | **11,11 %** | 80,16 % | **29,37 %** |
| 1941 | 55 | 20,0 % | **5,45 %** | 16,36 % | **16,36 %** |
| 1942 | 196 | 6,12 % | 6,63 % | 8,16 % | **7,65 %** |
| 1943 | 81 | 17,28 % | **7,41 %** | 20,99 % | 25,93 % |
| 1944 | 46 | 15,22 % | **6,52 %** | 15,22 % | **13,04 %** |
| 1945 | 171 | 7,02 % | **6,43 %** | 9,36 % | **7,02 %** |
| 1946 | 165 | 4,24 % | **3,03 %** | 6,06 % | **4,85 %** |
| 1947 | 187 | 0,53 % | 2,67 % | 2,14 % | **1,6 %** |
| 1948 | 167 | 3,59 % | **1,8 %** | 3,59 % | **1,8 %** |

El conjunto de evaluación ciega suma 2.760 palabras (suma de la columna de palabras evaluadas del desglose por serie). No se han publicado resultados en benchmarks estándar (MMLU, HumanEval, GSM8K, LibriSpeech, Common Voice) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 2-3 GB con el export FP16 de 1547,7 MB, más el overhead del runtime y del buffer de audio; no hay medición oficial publicada.
- GPU recomendadas: el autor entrenó y evaluó en una NVIDIA Tesla T4 (16 GB), que es suficiente para FP16; cualquier GPU con 4 GB o más de VRAM puede ejecutar el modelo en FP16.
- Cabe en GPU de consumo: sí, en tarjetas como RTX 3060, RTX 4060, RTX 4090 y equivalentes con al menos 4 GB de VRAM.
- Despliegue en CPU: viable mediante `faster-whisper` con cuantización `int8` de CTranslate2, aunque el autor solo documenta el export `float16`.
- Opciones de despliegue: `faster-whisper` (runtime de referencia, vía CTranslate2), servidor de CTranslate2, integración en pipelines Python por lotes. No se documenta compatibilidad con vLLM, TGI, Ollama ni llama.cpp, que no soportan modelos ASR de este tipo en el formato publicado.
- Formatos alternativos: el repositorio solo contiene el modelo CTranslate2, por lo que para usar `generate()` de HuggingFace haría falta el checkpoint en Transformers, que no se publica en la información disponible.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Ventana de audio | WER en la evaluación ciega del autor (`faster-whisper`) | Licencia | Formato publicado |
|---|---|---|---|---|---|
| RadioWhisper-v1 | No disponible (base turbo) | 30 s por segmento (heredado de Whisper) | 8,99 % | Apache-2.0 | CTranslate2 FP16, 1547,7 MB |
| `openai/whisper-large-v3-turbo` (stock) | No disponible en la información | 30 s por segmento | 12,14 % | No indicada en la información proporcionada | No indicado |
| `openai/whisper-large-v3` | No disponible en la información | 30 s por segmento | No disponible | No indicada en la información proporcionada | No indicado |
| `distil-whisper-large-v3` | No disponible en la información | 30 s por segmento | No disponible | No indicada en la información proporcionada | No indicado |

La única comparación cuantitativa disponible es contra el modelo base sin ajustar, sobre el mismo conjunto ciego. Frente a `whisper-large-v3` o las variantes destiladas no hay datos en la información proporcionada, y la comparación entre ellas quedaría condicionada por el dominio: RadioWhisper-v1 está especializado en radio histórica en inglés y no está pensado como sustituto generalista.

## Limitaciones y advertencias

- Dominio muy restringido: el ajuste se ha hecho sobre 117 ventanas de radio estadounidense de 1926-1948; el rendimiento fuera de ese dominio (audio moderno, otras variedades de inglés, otros idiomas) no está evaluado y probablemente degrade respecto al modelo base.
- Idioma único: la model card declara únicamente inglés, aunque el modelo base es multilingüe; no hay evidencia de que las capacidades multilingües se conserven tras el ajuste.
- Conjunto de evaluación muy pequeño: 51 ventanas y 2.760 palabras en total, con series de solo 31 o 44 palabras; los WER por serie y por año tienen intervalos de confianza muy amplios y no deben interpretarse como métricas estables.
- El ajuste no es uniformemente mejor: con `faster-whisper`, el WER empeora en Graham MacNamee (7,14 % → 10,71 %), The Witch's Tale (13,89 % → 15,67 %) y en los años 1927, 1931, 1933, 1934, 1938 (12,36 % → 28,09 %), 1942 y 1947 (0,53 % → 2,67 %).
- Resultados anómalos sin resolver: en la serie "A Little Bit of Everything" (1928) el WER con `generate()` se mantiene en 122,58 % tanto antes como después del ajuste, lo que apunta a un fallo sistemático en esa muestra más que a una mejora real.
- Riesgo de alucinación: como todo Whisper, el modelo puede generar texto plausible en segmentos ininteligibles o con música, especialmente en grabaciones muy degradadas; en las muestras publicadas se observan inserciones de frases no presentes en la referencia ("We ain't got much time", "My name is Sam Smith").
- Diferencias de formato: la normalización de números y cantidades no coincide con la referencia ("$10" frente a "ten dollars"), lo que penaliza el WER aunque la transcripción sea semánticamente correcta; conviene normalizar antes de comparar.
- Licencia: el modelo se distribuye como Apache-2.0, pero es un derivado de `openai/whisper-large-v3-turbo`; conviene verificar las condiciones del modelo base antes de un uso comercial.
- Distribución limitada: solo se publica el artefacto CTranslate2 en FP16, sin safetensors, GGUF ni scripts de conversión documentados; la reproducibilidad del entrenamiento no está detallada (no se especifican hiperparámetros, preprocesado ni composición exacta del corpus).
- Madurez: 0 descargas y 0 likes en el momento de la consulta, sin pipeline declarado en HuggingFace; debe tratarse como un artefacto de investigación y no como un servicio validado en producción.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/old-time-radio/RadioWhisper
- Modelo base: `openai/whisper-large-v3-turbo` (referenciado en la model card; no se proporciona URL directa en la información disponible)
- Runtime de inferencia: `faster-whisper` sobre CTranslate2 (referenciado en la model card; no se proporciona URL directa en la información disponible)
- Paper de Whisper: no disponible en la información proporcionada
- Repositorio de código, demo o blog del autor: no disponible en la información proporcionada
- La búsqueda web realizada no devolvió enlaces relevantes al modelo (los resultados obtenidos corresponden a la película "Old" de 2021 y a una herramienta francesa de prevención de incendios, sin relación con este modelo)
