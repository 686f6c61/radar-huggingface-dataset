# flackzz/parakeet-ultra-mlx-q4-g32

## Resumen

Parakeet Ultra MLX Q4 (identificador `flackzz/parakeet-ultra-mlx-q4-g32`) es una conversión cuantizada a 4 bits en formato MLX del modelo de reconocimiento automático del habla Parakeet Ultra, desarrollado originalmente por Moondream / M87 Labs a partir del checkpoint NVIDIA Parakeet TDT 0.6B v3. El modelo resuelve la transcripción de voz a texto multilingüe en 25 lenguas europeas, incluyendo español, inglés, alemán, francés, italiano y portugués, entre otras. Su relevancia actual radica en que reduce el peso de los pesos del codificador acústico a aproximadamente 418 MB, lo que facilita su despliegue en hardware Apple Silicon mediante el framework MLX, con un consumo de memoria medido de unos 459 MB de asignaciones activas tras la carga.

La arquitectura subyacente es un modelo TDT (Token-and-Duration Transducer) de tipo transducer, con un codificador acústico, una red de predicción y una red conjunta. La cuantización se aplica únicamente al codificador (265 capas, incluidas 48 convoluciones pointwise Conv1d), mientras que las redes de predicción y conjunta permanecen en FP16. El modelo tiene 627.052.166 parámetros totales y no incorpora ningún mecanismo de streaming causal: la captura de audio, el remuestreo y la fusión de ventanas solapadas son responsabilidad de la aplicación que lo integra.

Esta ficha describe una conversión de formato y precisión, no un modelo entrenado desde cero: no se ha realizado fine-tuning ni se han añadido datos de entrenamiento. La licencia es CC BY 4.0, heredada del modelo fuente, y el repositorio ocupa 0,4 GB.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | TDT (Token-and-Duration Transducer) con codificador acústico, red de predicción y red conjunta; conversión MLX con cuantización affine 4-bit en el codificador |
| Parametros totales | 627.052.166 |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible (modelo de ASR; la ventana de audio la gestiona la aplicación) |
| Tipos de cuantizacion | 4-bit affine con grupos de 32 elementos en el codificador (265 capas, incluidas 48 Conv1d pointwise); predicción y red conjunta en FP16 |
| Idiomas soportados | bg, hr, cs, da, nl, en, et, fi, fr, de, el, hu, it, lv, lt, mt, pl, pt, ro, sk, sl, es, sv, ru, uk (25 lenguas europeas) |
| Licencia | CC BY 4.0 |
| Formato de pesos | safetensors (MLX); pesos del codificador empaquetados como UInt32 con escalas y offsets affine en FP16 |

## Arquitectura y entrenamiento

El modelo es un transducer TDT (Token-and-Duration Transducer), una variante de los modelos RNN-T que predice conjuntamente tokens y duraciones. Consta de un codificador acústico que procesa la señal de audio, una red de predicción que modela el contexto textual y una red conjunta que combina ambas representaciones. La conversión aquí descrita aplica cuantización affine de 4 bits con grupos de 32 elementos a 265 capas del codificador, incluyendo 48 capas Conv1d pointwise, que se reemplazan por capas lineales cuantizadas por frame (se comprime `[output, 1, input]` a `[output, input]`, preservando el orden de canales y el sesgo de salida). Las convoluciones de subsampling, las convoluciones depthwise, los parámetros de normalización y las redes de predicción y conjunta permanecen en FP16.

No se ha realizado fine-tuning ni se han utilizado datos de entrenamiento adicionales en esta conversión; se trata exclusivamente de un cambio de formato y precisión sobre `beshkenadze/parakeet-ultra-mlx-fp16` (revisión `5acd3970b21853434afd56ed0c8f84a08a52cae8`), que a su vez es una conversión de formato de `moondream/parakeet-ultra`. La validación se limitó a ocho clips sintetizados localmente en alemán que cubrían negación, terminología legal, importes, fechas, un identificador y una frase alemán-inglés; tanto FP16 como Q4 cometieron errores en la frase en inglés y omitieron el marcador de párrafo hablado en una cita legal. El modelo fuente ya omitía la cabeza VAD de Ultra.

## Capacidades

- Reconocimiento automático del habla (ASR) multilingüe en 25 lenguas europeas.
- Transcripción de audio PCM mono a 16 kHz.
- Manejo de terminología específica en dominios como el legal, según la validación preliminar del autor (aunque con errores documentados).
- Procesamiento de frases mixtas alemán-inglés (con errores observados en la validación).
- No soporta tool calling ni function calling (no aplica a un modelo de ASR).
- No soporta agentes ni razonamiento multi-step.
- No es un modelo causal de streaming: no incluye decodificación incremental nativa.
- No incluye cabeza VAD (voice activity detection); debe gestionarse externamente.
- No soporta visión ni audio más allá de la transcripción de voz.

## Casos de uso

- Transcripción de reuniones en entornos Apple Silicon: el modelo puede transcribir audio de reuniones en varias lenguas europeas con un consumo de memoria medido de unos 459 MB, adecuado para portátiles con memoria unificada. La aplicación debe gestionar la captura, el remuestreo a 16 kHz y la fusión de ventanas solapadas.
- Subtitulado de vídeo multilingüe: con soporte para 25 lenguas, se puede usar para generar subtítulos en español, inglés, alemán o francés, integrando el modelo en un pipeline que segmenta el audio y une las transcripciones.
- Dictado por voz en aplicaciones macOS/iOS: el tamaño reducido (418 MB de pesos) y el soporte de MLX permiten integrarlo en apps nativas de Apple para dictado en tiempo casi real, siempre que la app implemente la ventana deslizante.
- Atención al cliente con transcripción de llamadas: útil para transcribir conversaciones telefónicas en lenguas europeas y alimentar sistemas de análisis; requiere revisión humana cuando los errores de transcripción puedan alterar el significado.
- Documentación legal y administrativa: la validación preliminar incluyó terminología legal y fechas, aunque el autor advierte que el panel no establece idoneidad general para el dominio legal; se recomienda revisión humana.
- Investigación en ASR multilingüe: sirve como base cuantizada para experimentos de eficiencia en Apple Silicon, comparando FP16 frente a Q4 en precisión y memoria.
- Prototipado rápido en local: al ocupar 0,4 GB el repositorio, permite descargar y probar el modelo en un Mac sin infraestructura GPU dedicada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor únicamente reporta una validación cualitativa con ocho clips sintetizados en alemán y mediciones de memoria: aproximadamente 459 MB de asignaciones MLX activas tras la carga y un pico de 507 MB durante clips cortos en una ejecución en un Mac de depuración. No se proporcionan métricas de WER, latencia ni throughput.

## Requisitos de hardware

- VRAM/memoria estimada: aproximadamente 459 MB de asignaciones MLX activas tras la carga y 507 MB de pico durante clips cortos, según medición del autor en un Mac de depuración; estos valores excluyen el footprint total del proceso y un modelo de lenguaje adicional.
- GPU recomendadas: hardware Apple Silicon con soporte MLX; no se especifican modelos concretos de GPU NVIDIA (A100, H100, RTX 4090) porque el formato es MLX.
- Cabe en GPU de consumo: sí, en equipos Apple Silicon con memoria unificada; el tamaño de descarga (0,4 GB) no garantiza el pico de memoria ni la latencia en iPhone.
- Opciones de despliegue: runtime MLX que soporte la sustitución de convoluciones pointwise por capas lineales cuantizadas por frame; un runtime MLX que solo soporte capas Linear/Embedding cuantizadas no admite automáticamente estos pesos. No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles; la validación física en iPhone/Catalyst y con micrófono queda pendiente y es específica de cada aplicación.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|---|
| flackzz/parakeet-ultra-mlx-q4-g32 | 627.052.166 | no disponible | 25 europeos | CC BY 4.0 | safetensors MLX 4-bit | Hugging Face, 25 descargas |
| beshkenadze/parakeet-ultra-mlx-fp16 | no disponible | no disponible | 25 europeos | CC BY 4.0 | safetensors MLX FP16 | Hugging Face (modelo base) |
| moondream/parakeet-ultra | no disponible | no disponible | 25 europeos | CC BY 4.0 | no disponible | Hugging Face (modelo fuente) |
| nvidia/parakeet-tdt-0.6b-v3 | 0,6B (aproximado por nombre) | no disponible | no disponible | no disponible | no disponible | Hugging Face (checkpoint original) |

No se dispone de datos de rendimiento comparativo (WER, latencia) entre estas variantes en la información proporcionada.

## Limitaciones y advertencias

- No es un modelo de streaming causal: la captura de audio, el remuestreo, las ventanas solapadas y la fusión de transcripciones deben implementarse en la aplicación.
- No incluye cabeza VAD; el modelo fuente ya la omitía.
- Requiere un runtime MLX que soporte la sustitución de convoluciones pointwise por capas lineales cuantizadas; expandir todo el modelo a FP16 anula la reducción de memoria.
- La validación es muy limitada: ocho clips sintetizados en alemán, con errores en una frase en inglés y omisión de un marcador de párrafo en una cita legal; no establece precisión general en alemán ni idoneidad para el dominio legal.
- Riesgo de alucinación y errores de transcripción: el autor recomienda revisión humana cuando los errores puedan cambiar el significado.
- Sesgos conocidos: no disponibles en la información proporcionada.
- Limitaciones de idioma: aunque soporta 25 lenguas europeas, no se han publicado evaluaciones por idioma.
- Licencia CC BY 4.0: permite uso comercial con atribución; deben respetarse las atribuciones a NVIDIA Corporation, Moondream / M87 Labs y beshkenadze.
- No se implica el respaldo de los autores originales.
- El tamaño de descarga no garantiza el pico de memoria ni la latencia en iPhone; la validación física en dispositivos queda pendiente.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/flackzz/parakeet-ultra-mlx-q4-g32
- Modelo base MLX FP16: https://huggingface.co/beshkenadze/parakeet-ultra-mlx-fp16
- Modelo fuente Parakeet Ultra: https://huggingface.co/moondream/parakeet-ultra
- Checkpoint original NVIDIA Parakeet TDT 0.6B v3: https://huggingface.co/nvidia/parakeet-tdt-0.6b-v3
