# scholzmx/underdog-bark-3.0-gguf

## Resumen

Underdog Bark 3.0 (GGUF, motor Starling) es una cuantización del modelo de reconocimiento automático del habla ConwayResearch/Underdog-Bark-3.0, publicado por el usuario scholzmx. No es un modelo nuevo: es una conversión de formato y recuantización de un fine-tune de nvidia/parakeet-tdt-0.6b-v3 (arquitectura FastConformer con transductor TDT, inglés), orientado a transcripción literal o verbatim. El repositorio contiene un único fichero de 364 MB en formato GGUF con un esquema mixto Q4_0/Q8_0, pensado para ejecutarse en el motor Starling, incluida su variante Vulkan para Android.

El interés práctico está en el tamaño: 627 millones de parámetros y 364 MB de pesos permiten transcripción en inglés sobre CPU, sin GPU y en dispositivos móviles, con una degradación de calidad medida de apenas +0,07 puntos de WER frente a la conversión exacta en f16 sobre FLEURS en_us. Es, por tanto, una opción de despliegue en el borde (edge) más que un modelo de referencia en precisión.

Conviene subrayar dos advertencias: los ficheros no son compatibles con llama.cpp ni whisper.cpp, sino con el contrato de tensores propietario de Starling, y el modelo hereda del original un comportamiento irregular en puntuación y mayúsculas (aproximadamente 1 de cada 10 clips de FLEURS sale en minúsculas y sin puntuar, con números escritos con letras). El repositorio no tiene descargas ni valoraciones en el momento de redactar esta ficha.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | FastConformer (encoder) + transductor TDT (TDT transducer), fine-tune de nvidia/parakeet-tdt-0.6b-v3 |
| Parametros totales | 627.090.606 (~0,63 B) |
| Parametros activos | no aplica (modelo denso, no es MoE) |
| Longitud de contexto | no disponible (modelo ASR: procesa audio, no se declara ventana de contexto de texto) |
| Tipos de cuantizacion | Un único fichero mixto: todas las capas lineales en Q4_0 (incluidas las convoluciones pointwise del conformer); joint, LSTM y embedding de predicción en Q8_0 |
| Idiomas soportados | en (inglés) |
| Licencia | CC-BY-4.0 |
| Formato de pesos | GGUF (contrato de tensores de Starling; no compatible con llama.cpp ni whisper.cpp) |
| Tipo de tarea | Reconocimiento automático del habla (pipeline: automatic-speech-recognition) |
| Modelo base | ConwayResearch/Underdog-Bark-3.0 (relación: quantized), derivado de nvidia/parakeet-tdt-0.6b-v3 y moondream/parakeet-ultra |
| Fichero | underdog-bark-3.0-q4pw.gguf, 364 MB |
| Tamaño del repositorio | 0,4 GB |
| Motor de inferencia | starling-serve / libstarling_ggml (flag `--model parakeet`), app Android con motor Vulkan |
| SHA-256 | 5650191831a0b6915003b34a8c82b45ba91d60bf6b36cfa0f08babe43a556081 |
| Librería declarada | ggml |

## Arquitectura y entrenamiento

El modelo subyacente es un fine-tune de nvidia/parakeet-tdt-0.6b-v3, que combina un encoder FastConformer con un decodificador de transducción TDT (Token-and-Duration Transducer). El autor del GGUF describe Underdog Bark 3.0 como el miembro verbatim de la familia, con 163 MB de pesos en su formato original. No se documenta en la información disponible el volumen de tokens de entrenamiento, la composición del dataset ni si el fine-tune empleó RLHF, DPO u otra etapa de alineación; tampoco se detallan innovaciones de decodificación (decodificación especulativa, atención lineal) más allá del propio esquema TDT.

El proceso de cuantización sí está documentado y es reproducible en tres pasos: conversión exacta de los pesos publicados (`model.bark`) a f16 con `scripts/convert_parakeet_gguf.py`, generación de una importance matrix a partir de 100 clips de validación de FLEURS en_us pasados por el fichero exacto, y recuantización con `starling-quantize` usando la receta `parakeet-q4pw-fullimx.recipe` y `--shrink-f16`. El resultado es un layout mixto Q4_0/Q8_0 idéntico al que Starling usa para su Parakeet de teléfono, lo que permite reutilizar el mismo motor sin cambios.

## Capacidades

- Transcripción de voz a texto en inglés con estilo verbatim, orientada a fidelidad literal frente a resúmenes o reformulaciones.
- Reconocimiento sobre audio de lectura (el modelo se evalúa con FLEURS en_us, texto de Wikipedia leído).
- Ejecución en CPU pura mediante el motor ggml de Starling, sin requisito de GPU.
- Ejecución en Android mediante el motor Vulkan rápido de la app Starling.
- Carga directa con `starling-serve --model parakeet --gguf <fichero>`.
- No soporta tool calling ni function calling.
- No soporta flujos de agentes ni razonamiento multi-paso: es un modelo ASR puro, sin generación de texto libre.
- Capacidad multilingüe: únicamente inglés (`en`); no se declaran otros idiomas.
- Sin soporte de visión, audio generativo ni modo thinking.
- No se documentan en la información disponible funciones de diarización de hablantes, timestamps a nivel de palabra, traducción ni puntuación garantizada.

## Casos de uso

- Transcripción verbatim de entrevistas y actas: el modelo está ajustado para reproducir literalmente lo dicho, incluida la forma hablada de los números, lo que encaja en flujos periodísticos o de investigación donde se requiere fidelidad y no una versión editada.
- Subtitulado y post-proceso por lotes en inglés: al ocupar 364 MB y ejecutarse en CPU, se pueden levantar varios procesos `starling-serve` en paralelo en un servidor sin GPU para procesar colas de audio.
- Notas de reuniones en móvil: la app Android de Starling con motor Vulkan permite transcribir en el propio dispositivo, sin enviar audio a la nube, lo que resulta adecuado para entornos con requisitos de privacidad.
- Dictado y accesibilidad en aplicaciones de escritorio: integrable mediante `libstarling_ggml` en herramientas que necesiten transcripción local con huella de memoria de cientos de MB.
- Indexación y búsqueda de archivos de audio en servidores modestos: transcripción masiva de un archivo histórico en inglés con coste de infraestructura mínimo, al no requerir GPU.
- Generación de transcripciones para datasets de ASR: útil como etiquetador previo o para comparar hipótesis frente a otros sistemas, dado que el autor documenta el procedimiento exacto de conversión y los scripts de evaluación.
- Transcripción de llamadas o reuniones de negocio: el modelo base está pensado para voz verbatim, pero la evaluación publicada en esta ficha es sobre lectura de Wikipedia; los números conversacionales del editor original no se reproducen aquí.
- Despliegue en dispositivos de borde o IoT con memoria limitada: el fichero de 364 MB es viable en hardware con menos de 1 GB de RAM disponible, siempre que se compile el motor Starling para la plataforma.

## Benchmarks y rendimiento

Evaluación publicada por el autor: FLEURS en_us test, 100 clips, cada fichero decodificado en su propio proceso sobre el motor ggml de CPU. La columna "exact" es la conversión sin pérdida de los pesos publicados (sus transcripciones coinciden palabra por palabra con la referencia de transformers en 60 clips). Se ofrecen dos puntuaciones: la normalización de texto propia de Starling y la normalizador inglés de Whisper tal como se usa en Open ASR Leaderboard (que convierte números escritos con letras a dígitos).

| Metrica | exact (f16) | q4pw (Q4_0/Q8_0) | Delta emparejado (q4pw - exact), IC 95 % |
|---|---:|---:|---:|
| WER, normalizacion Starling | 7,31 % | 7,50 % | +0,07 pt [−0,26, +0,47] |
| WER, normalizacion Whisper | 4,94 % | 4,99 % | no disponible |
| Parakeet TDT 0.6B v3 stock (bf16), mismos clips | 5,56 % (Starling) / 4,29 % (Whisper) | — | — |

Interpretación: la cuantización Q4_0/Q8_0 no degrada de forma estadísticamente significativa respecto al fichero exacto (el intervalo de confianza del delta incluye el cero). Sin embargo, en estos mismos clips el fine-tune Underdog Bark 3.0 queda por detrás del Parakeet TDT 0.6B v3 original en ambas normalizaciones (7,50 % frente a 5,56 % con normalización Starling; 4,99 % frente a 4,29 % con normalización Whisper). El propio autor advierte que FLEURS es texto de Wikipedia leído y no evalúa el habla conversacional (reuniones, llamadas de resultados) que cubren los números de Open ASR del editor original. No se han publicado otros benchmarks (MMLU, HumanEval, GSM8K) por tratarse de un modelo ASR.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica en el motor CPU; en GPU, el fichero ocupa 364 MB y el pico de memoria es del orden de varios cientos de MB (estimación a partir del tamaño del fichero, no publicada por el autor).
- RAM: ejecutable en CPU con el motor ggml de Starling; el peso de los tensores es de 364 MB más las activaciones del conformer.
- GPU recomendadas: no se especifican; el autor solo menciona el motor Vulkan de la app Android, sin lista de GPU validadas.
- Cabe en GPU de consumo: sí, por tamaño (menos de 0,5 GB de pesos), aunque no hay validación publicada de rendimiento en GPU de escritorio.
- Cabe en móvil: sí, es el objetivo declarado del formato "phone GGUF" y del motor Vulkan de la app Android.
- Opciones de despliegue: `starling-serve` (binario nativo) y `libstarling_ggml`, con `--model parakeet --gguf ./models/underdog-bark-3.0-q4pw.gguf --port 8181`. No es compatible con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles. No se han publicado mediciones de RTF ni de tokens por segundo en la información proporcionada.
- Descarga: `hf download scholzmx/underdog-bark-3.0-gguf underdog-bark-3.0-q4pw.gguf --local-dir ./models`.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | WER FLEURS en_us | Licencia | Formato / despliegue |
|---|---|---|---|---|---|
| underdog-bark-3.0-gguf (q4pw) | 0,63 B | no disponible | 7,50 % (Starling) / 4,99 % (Whisper) | CC-BY-4.0 | GGUF para motor Starling |
| ConwayResearch/Underdog-Bark-3.0 (exact, f16) | 0,63 B | no disponible | 7,31 % (Starling) / 4,94 % (Whisper) | CC-BY-4.0 | Pesos originales (model.bark) |
| nvidia/parakeet-tdt-0.6b-v3 (stock, bf16) | ~0,6 B | no disponible | 5,56 % (Starling) / 4,29 % (Whisper) | no disponible en esta ficha | Pesos NeMo |
| Underdog Bark 3.0 Pro | no disponible | no disponible | no disponible | no disponible (se cita como parte de la misma familia) | no disponible |

Notas: las tres primeras filas se midieron sobre los mismos 100 clips de FLEURS en_us, por lo que son directamente comparables. El autor indica que Bark 3.0 Pro no presenta el problema de minúsculas y falta de puntuación del modelo base, pero no se aportan cifras. No se dispone de datos para comparar con alternativas tipo Whisper en esta información.

## Limitaciones y advertencias

- Estilo de salida inconsistente: aproximadamente 1 de cada 10 clips de FLEURS produce texto en minúsculas y sin puntuación, y el modelo tiende a escribir los números con letras ("twenty five" en lugar de "25"). Es un comportamiento heredado del modelo original y reproducido exactamente; Bark 3.0 Pro no lo presenta.
- Solo inglés: no hay soporte declarado de otros idiomas, ni detección de idioma.
- La evaluación publicada es sobre lectura de Wikipedia (FLEURS en_us), no sobre habla conversacional; el rendimiento en reuniones, llamadas o audio ruidoso no está medido en esta ficha.
- En los mismos clips, el fine-tune es menos preciso que el Parakeet TDT 0.6B v3 original (7,50 % frente a 5,56 % de WER), por lo que la elección debe justificarse por el estilo verbatim, no por precisión bruta.
- Riesgo de inserciones y alucinaciones típicas de los transductores ASR en segmentos de silencio, ruido o música: no se documenta ningún mecanismo de mitigación ni umbral de confianza.
- Compatibilidad restringida: son GGUF del contrato de Starling, no de llama.cpp ni whisper.cpp; intentar cargarlos con esas herramientas fallará.
- Es una cuantización comunitaria sin descargas ni valoraciones, publicada el 21 de octubre de 2026, sin proceso de revisión independiente.
- Licencia CC-BY-4.0: el uso comercial está permitido, pero exige atribución a Conway Research, NVIDIA y Moondream, y la inclusión del fichero NOTICE sin modificar; cualquier redistribución del GGUF debe mantener esa atribución y señalar los cambios (conversión a GGUF y recuantización).
- Un único fichero disponible (q4pw): no hay variantes Q5, Q8 ni f16 en este repositorio para comparar o escalar calidad.
- No se documentan tiempos de inferencia ni comportamiento en GPUs de escritorio, lo que dificulta el dimensionado en producción.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/scholzmx/underdog-bark-3.0-gguf
- Modelo base: https://huggingface.co/ConwayResearch/Underdog-Bark-3.0
- Motor Starling (repositorio y binario `starling-serve`): https://github.com/sims1253/starling
- Modelo del que deriva el base (identificador citado en la model card): nvidia/parakeet-tdt-0.6b-v3
- Modelo del que deriva el base (identificador citado en la model card): moondream/parakeet-ultra
- Búsqueda web: no se han encontrado enlaces relevantes al modelo; los resultados devueltos correspondían a servicios de mapas (Google Maps, OpenStreetMap) y no guardan relación con esta ficha.
