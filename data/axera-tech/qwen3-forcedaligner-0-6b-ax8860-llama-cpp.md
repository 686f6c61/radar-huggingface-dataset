# AXERA-TECH/Qwen3-ForcedAligner-0.6B-AX8860-llama.cpp

## Resumen

Qwen3-ForcedAligner-0.6B-AX8860-llama.cpp es una adaptación del modelo Qwen3-ForcedAligner-0.6B de Qwen (Alibaba) empaquetada por AXERA-TECH para ejecutarse sobre la NPU de cuatro núcleos del SoC Axera AX8860 mediante llama.cpp con el backend ggml-axera. El modelo original resuelve una tarea concreta de procesamiento de voz: dado un audio y su transcripción, devuelve los tiempos de inicio y fin de cada palabra (forced alignment o alineamiento forzado a nivel de palabra). Esta variante añade kernels precompilados (axmodel) para el codificador de audio y la torre de texto, junto con binarios de CLI y servidor, de modo que el alineamiento se ejecuta íntegramente en la NPU del dispositivo.

El modelo tiene 601.300.992 parámetros (unos 0,6 mil millones) y se distribuye en formato GGUF: los pesos de la torre de texto en BF16 (1,13 GiB) y los del codificador de audio en Q8_0 (338 MiB). Los kernels no contienen pesos; se convierten en tiempo de carga (torre de texto a MXFP8 y codificador de audio a BF16 por desquantización del mmproj). El paquete incluye scripts de ejecución y de benchmark, ejemplos de audio de 5 s, 30 s y cerca del límite de contexto, y sumas de verificación SHA256.

Su relevancia es práctica: demuestra que un alineador fonético de precisión (error absoluto medio de 2,67 ms frente a la implementación oficial en FP32 sobre CPU) puede ejecutarse en hardware de borde con NPU, con un RTF de pared de 0,017–0,024 en caliente para audios de 30 a 162 segundos. Está pensado para desarrolladores que integren subtitulado, sincronización de transcripciones o verificación de pronunciación en dispositivos Axera, no para inferencia genérica en GPU.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (codificador de audio + torre de texto con cabeza de clasificación de 5000 clases); pesos GGUF ejecutados sobre NPU vía ggml-axera |
| Parámetros totales | 601.300.992 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (el paquete incluye audio de prueba "cerca del límite"; el ejemplo más largo medido es de 162,84 s de audio) |
| Tipos de cuantización | GGUF BF16 (torre de texto), GGUF Q8_0 (codificador de audio, mmproj); conversión en carga a MXFP8 (texto) y BF16 (audio) |
| Idiomas soportados | chino e inglés (con las reglas oficiales de segmentación de palabras); japonés y coreano: la model card se interrumpe en ese punto, no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF (safetensors del modelo base: 601.300.992 parámetros) |

## Arquitectura y entrenamiento

El modelo base Qwen3-ForcedAligner-0.6B es un alineador forzado que combina un codificador de audio con una torre de texto de 28 capas y una cabeza de clasificación de 5000 clases que predice, sobre una rejilla temporal de 80 ms, la clase de inicio y fin de cada palabra. La salida se postprocesa con la regla oficial `fix_timestamp` para imponer monotonía en los límites. No se dispone de información sobre el volumen de datos de entrenamiento, la composición del dataset ni si hubo RLHF o DPO.

La innovación de esta variante es el despliegue: AXERA-TECH compila el codificador de audio y la torre de texto más la cabeza de 5000 clases en dos axmodel fusionados de cuatro núcleos, sin pesos embebidos, que se convierten al cargar desde los GGUF. La fidelidad numérica medida en placa es alta: coseno de 0,9999971 en el codificador de audio, 0,9984–0,9998 en las 28 capas de la torre de texto y 0,9999995 en la cabeza de clasificación; la deriva procede principalmente de los pesos MXFP8 del texto. El servidor expone endpoints HTTP (`/v1/audio/alignments` y `/v1/audio/transcriptions` en estilo OpenAI) y acepta audio multipart o JSON con base64.

## Capacidades

- Alineamiento forzado a nivel de palabra: dado un WAV y su transcripción, devuelve `start`/`end` por palabra en milisegundos.
- Salida estructurada en JSON con palabras, marcas de tiempo crudas (`timestamp_ids` en rejilla de 80 ms), marcas corregidas, segmentos, idioma, duración y recuento de tokens de entrada y de audio.
- Diagnóstico de confianza por límite mediante `top2_margin_u6` (margen entre las dos clases más probables de la cabeza).
- Procesamiento de audio en chino e inglés con las reglas oficiales de segmentación.
- Modo CLI de un solo disparo y modo servidor residente con un único request concurrente (`-np 1`).
- Endpoint compatible con el formato de transcripciones de OpenAI cuando se proporciona transcripción.
- Cabeceras de respuesta con el tiempo de forward de la torre de texto y el número de tokens (`X-Align-Forward-Seconds`, `X-Align-Input-Tokens`, `X-Align-Audio-Tokens`).
- No se documentan tool calling, agentes, visión, audio generativo ni modo de razonamiento extendido.

## Casos de uso

- Subtitulado y sincronización de transcripciones en dispositivos de borde: con una transcripción previa de un ASR, el modelo genera marcas por palabra para incrustar subtítulos karaoke o resaltados en tiempo real; el RTF de pared de 0,017–0,024 permite procesar un clip de 162 s en unos 3 s.
- Verificación de pronunciación en aprendizaje de idiomas: comparar los límites esperados de cada palabra con los obtenidos permite detectar pausas anómalas o palabras omitidas en lecturas de alumnos, usando el margen `top2_margin_u6` como señal de incertidumbre.
- Auditoría de calidad de datasets de voz: alinear lotes de audio con sus transcripciones para detectar desajustes entre texto y audio antes de entrenar modelos ASR o TTS, con un coste energético bajo al ejecutarse en NPU.
- Indexación y búsqueda por palabra en archivos de audio: generar índices temporales por palabra que permitan saltar a una palabra concreta en grabaciones largas (reuniones, entrevistas, clases) dentro de un dispositivo empotrado.
- Sincronización de locuciones en doblaje y postproducción: obtener los tiempos exactos de cada palabra del audio original para ajustar la duración de la locución doblada o generar guías de mezcla.
- Servicio local de alineamiento en un appliance AX8860: desplegar `llama-server` en el puerto 18240 y ofrecer `/v1/audio/alignments` a aplicaciones de la red local sin depender de la nube, con carga en frío de 8,34 s y consumo de NPU de aproximadamente 2,95 GB de CMM tras la carga.
- Control de calidad en pipelines de transcripción: usar el endpoint `/v1/audio/transcriptions` con `response_format=verbose_json` para obtener marcas temporales verbosas en un formato compatible con herramientas existentes.

## Benchmarks y rendimiento

Rendimiento en placa (AX8860, SDK V0.6.0, NPU de 4 núcleos, modo servidor extremo a extremo, `./bench.sh`):

| Nivel | Audio | Tiempo de pared (s) | Forward de texto (s) | RTF de pared | RTF de forward |
|---|---|---:|---:|---:|---:|
| Primera petición en frío | 5,00 s | 0,855 | 0,049 | 0,171 | 0,010 |
| 5 s en caliente | 5,00 s | 0,319–0,350 | 0,017–0,028 | 0,064–0,070 | 0,003–0,006 |
| 30 s en caliente | 30,00 s | 0,670–0,734 | 0,103–0,173 | 0,022–0,024 | 0,003–0,006 |
| Cerca del límite, en caliente | 162,84 s | 2,732–3,011 | 0,729–0,992 | 0,017–0,018 | 0,004–0,006 |

Memoria y arranque:

| Métrica | Valor |
|---|---|
| Carga del servidor en frío | 8,34 s |
| CMM antes de la carga | 288.002.048 B |
| CMM después de la carga | 2.953.936.896 B |
| Pico incremental con audio de 5 s | 657.543.168 B |
| Pico incremental con audio de 30 s | 732.315.648 B |
| Pico incremental cerca del límite (162,84 s) | 804.016.128 B |
| Salida del servidor tras TERM | 1,2 s |

Precisión frente a la implementación oficial en FP32 sobre CPU (`qwen_asr` ForcedAligner, torch CPU), sobre 22 audios en chino e inglés (11 cada uno, incluidos clips de 74,32 s y 68,56 s), con 643 palabras y 1286 límites:

| Métrica | Resultado |
|---|---|
| Coincidencia de argmax | 1247/1286 = 96,97 % |
| Error absoluto medio por límite | 2,67 ms |
| Mediana | 0 ms |
| p99 | 80 ms |
| Máximo | 240 ms |
| Límites con error ≤80 ms | 99,69 % |
| Límites con error ≤160 ms | 99,84 % |
| Fidelidad de coseno (codificador de audio) | 0,9999971 (mín. 0,9999153) |
| Fidelidad de coseno (torre de texto, 28 capas) | 0,9984–0,9998 |
| Fidelidad de coseno (cabeza de 5000 clases) | 0,9999995 |

De los 39 límites discrepantes, 36 difieren una sola celda (80 ms), 2 dos celdas y 1 tres celdas; una ejecución BF16 en CPU del mismo GGUF presenta 40 discrepancias, 37 idénticas a las de la NPU, lo que indica sensibilidad numérica en clases casi empatadas y no un sesgo del acelerador.

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible, ya que el modelo no es un LLM generativo de propósito general.

## Requisitos de hardware

- Hardware objetivo: SoC Axera AX8860 con NPU de cuatro núcleos y SDK V0.6.0 (probado en placa). No se documenta soporte para GPU convencionales.
- Memoria de NPU: aproximadamente 2,95 GB de CMM tras la carga del modelo, con picos incrementales por petición de 0,66 a 0,80 GB según la duración del audio.
- Almacenamiento: repo de 1,6 GB (GGUF de texto de 1,13 GiB, mmproj de 338 MiB, binarios, kernels y ejemplos).
- Despliegue: binarios `llama-forced-aligner` (CLI) y `llama-server` (servicio residente en el puerto 18240, con desplazamiento automático a 18240–18249 si está ocupado y variable `FA_BENCH_PORT`).
- Concurrencia: un único request simultáneo (`-np 1`); el modelo permanece residente entre peticiones.
- Latencia: carga en frío de 8,34 s; primera petición de 5 s en 0,855 s; peticiones en caliente de 5 s en 0,32–0,35 s y de 162,84 s en 2,73–3,01 s.
- No se documenta despliegue en vLLM, TGI, Ollama ni llama.cpp estándar sobre GPU; el backend es ggml-axera específico de este SoC.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3-ForcedAligner-0.6B-AX8860-llama.cpp (esta ficha) | 601.300.992 | no disponible | Alineamiento forzado palabra a palabra | no disponible | GGUF + kernels axmodel para AX8860 |
| Qwen/Qwen3-ForcedAligner-0.6B (base) | 601.300.992 | no disponible | Alineamiento forzado palabra a palabra | no disponible | Pesos originales en Hugging Face |
| Implementación oficial `qwen_asr` ForcedAligner (FP32, CPU) | 601.300.992 | no disponible | Alineamiento forzado palabra a palabra | no disponible | Referencia de precisión en CPU (torch) |

La comparación con alternativas de otros fabricantes (por ejemplo, alineadores tipo CTC o Montreal Forced Aligner) no está disponible en la información proporcionada. La diferencia principal frente al modelo base y a la referencia CPU es el soporte de NPU con una pérdida de precisión de 2,67 ms de error absoluto medio y una coincidencia de argmax del 96,97 %.

## Limitaciones y advertencias

- Idiomas: solo chino e inglés están documentados; la model card se interrumpe al tratar japonés y coreano, por lo que su soporte es no disponible.
- Requiere transcripción de entrada: no transcribe audio por sí mismo; el endpoint de transcripciones reutiliza el alineador cuando se proporciona el texto.
- Dependencia de hardware: los kernels axmodel están compilados para la NPU del AX8860 con SDK V0.6.0; no son portables a otras plataformas.
- Concurrencia limitada a un request simultáneo (`-np 1`), lo que restringe su uso como servicio multiusuario.
- Licencia no disponible: no puede confirmarse el uso comercial sin consultar la licencia del modelo base Qwen3-ForcedAligner-0.6B.
- Riesgo de desalineación en clases casi empatadas: el 3,03 % de los límites discrepa del FP32, con un máximo de 240 ms (tres celdas de 80 ms); conviene usar `top2_margin_u6` para filtrar casos dudosos.
- Sin datos publicados sobre sesgos, alucinación o robustez ante ruido, acentos o solapamientos de habla; la evaluación se limita a 22 audios en chino e inglés.
- Longitud máxima de audio no especificada: el ejemplo más largo medido es de 162,84 s y la model card menciona "cerca del límite de contexto" sin cifra exacta.
- El paquete incluye scripts y binarios precompilados; su verificación debe hacerse con `SHA256SUMS` antes de desplegar en producción.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/AXERA-TECH/Qwen3-ForcedAligner-0.6B-AX8860-llama.cpp
- Modelo base: https://huggingface.co/Qwen/Qwen3-ForcedAligner-0.6B
- No se han encontrado en la información proporcionada enlaces adicionales a papers, blogs, repositorios o demos.
