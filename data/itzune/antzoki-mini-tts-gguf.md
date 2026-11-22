# itzune/antzoki-mini-tts-GGUF

## Resumen

antzoki-mini-tts-GGUF es una compilación cuantizada en formato GGUF del modelo de síntesis de voz itzune/antzoki-mini-tts, un ajuste fino en euskera del modelo Edge0/Audio8-TTS-Realistic-Air. Lo desarrolla el usuario itzune y está pensado para ejecutarse en CPU sin Python y sin GPU, mediante un runtime específico de llama.cpp parcheado para Audio8. El modelo resuelve la síntesis de voz en euskera con clonación de voz zero-shot, un nicho con muy pocas alternativas técnicas disponibles.

La arquitectura subyacente es DualAR (dos modelos autorregresivos: uno lento de 24 capas y otro rápido de 4 capas con 10 codebooks) sobre un códec de audio a 44,1 kHz. El modelo completo tiene 337.921.009 parámetros según los pesos en safetensors del modelo base. La compilación incluye dos ficheros GGUF cuantizados en Q4_K_M (387 MiB el AR lento, 46 MiB el AR rápido), embeddings de codebook en F32 y el códec también en F32, que supone la mayor parte de la descarga.

Su relevancia actual radica en que permite desplegar TTS con clonación de voz en euskera en hardware de consumo sin GPU, algo poco habitual, a costa de depender de un runtime no estándar y de una velocidad de síntesis inferior al tiempo real en CPU. La licencia Apache-2.0 facilita su uso comercial, aunque las limitaciones del modelo original (9 horas de voz leída de entrenamiento) se heredan íntegramente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DualAR (AR lento de 24 capas + AR rápido de 4 capas con 10 codebooks) sobre códec de audio a 44,1 kHz |
| Parametros totales | 337.921.009 (modelo base en safetensors) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q4_K_M (ficheros AR); codec y embeddings de codebook en F32 |
| Idiomas soportados | euskera (eu) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (modelos AR), F32 (codec y embeddings), manifiesto JSON del bundle |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura DualAR de Audio8: un modelo autorregresivo lento de 24 capas que genera la estructura temporal de la secuencia de audio y un modelo autorregresivo rápido de 4 capas que produce 10 codebooks por paso, alimentando un códec de audio a 44,1 kHz. La anchura del modelo es 896, lo que obliga a que la cuantización Q4_K_M use Q5_0/Q8_0 para aproximadamente la mitad de los tensores, ya que 896 no es múltiplo de 256. El runtime separa el procesamiento de texto, la generación DualAR, la clonación de voz y la decodificación del códec.

El ajuste fino en euskera se realizó sobre aproximadamente 9 horas de voz leída, según declara el autor. No se especifican en la información disponible el número total de tokens de entrenamiento, la composición exacta del dataset ni si hubo etapas de RLHF o DPO. La compilación GGUF solo cuantiza los dos modelos AR; las tablas RoPE y el códec permanecen en F32 porque el runtime lo exige, de ahí que el códec represente la mayor parte de los 2,0 GB del repositorio.

## Capacidades

- Síntesis de voz (text-to-speech) en euskera a partir de texto normalizado.
- Clonación de voz zero-shot con 10-15 segundos de audio limpio y su transcripción exacta.
- Generación de audio a 44,1 kHz mediante códec dedicado.
- Ejecución en CPU sin Python y sin GPU a través del runtime llama-tts parcheado para Audio8.
- Normalización de texto específica para euskera (números, fechas y abreviaturas) mediante el script eu_normalize.py.
- Control de semilla (--seed) para variar la generación cuando no se usa referencia de voz.
- No soporta tool calling, function calling, agentes, visión ni audio de entrada más allá de la referencia de clonación.

## Casos de uso

- Síntesis de voz en euskera para accesibilidad: lectura de contenido textual en aplicaciones para personas con discapacidad visual, aprovechando la licencia Apache-2.0 y la ejecución en CPU sin dependencias de GPU.
- Clonación de voz para doblaje y locución: con 10-15 segundos de audio de referencia y su transcripción, se puede generar voz consistente para vídeos, audiolibros o podcasts en euskera.
- Integración en sistemas de megafonía o anuncios automatizados en euskera: el modelo funciona en CPU con el runtime llama-tts, lo que permite desplegarlo en servidores sin GPU dedicada.
- Generación de material educativo en euskera: creación de audios de apoyo para aprendizaje de la lengua con voces de referencia controladas.
- Prototipado de asistentes conversacionales en euskera: la salida TTS se puede encadenar con un LLM para construir un pipeline de voz completo, aunque la latencia en CPU debe tenerse en cuenta.
- Investigación en TTS de bajos recursos: el bundle GGUF y los scripts de conversión y cuantización permiten reproducir y evaluar el modelo en hardware modesto, útil para estudiar técnicas de cuantización en modelos de audio.

## Benchmarks y rendimiento

Datos medidos por el autor en CPU con 8 frases fuera del conjunto de entrenamiento, con voz de referencia reservada y sin referencia, 3 semillas cada una:

| Bundle | Tamano | Speaker SIM ↑ | Runaways con ref | Runaways sin ref | RTF (con ref / sin ref) |
|---|---:|---:|---:|---:|---:|
| F32 | 3,6 GB | 0,932 | 1/24 | 3/24 | 7,9 / 7,1 |
| Q4_K_M (este repo) | 1,9 GB | 0,940 | 0/24 | 4/24 | 3,7 / 2,7 |
| Q4_0 | 1,8 GB | 0,923 | 3/24 | 7/24 | 3,4 / 2,4 |

El RTF se mide con 4 trabajos compartiendo CPU. Un solo trabajo con 16 hilos ronda 2 de RTF: una frase de 5 segundos con referencia tarda 2,8 s de AR, 4,7 s de códec y 3,3 s de codificación de la referencia. La síntesis en CPU es más lenta que el tiempo real y el códec en F32 es el cuello de botella.

## Requisitos de hardware

- VRAM estimada: no aplica en el bundle CPU; el modelo está pensado para ejecución en CPU sin GPU.
- GPU recomendadas: no disponibles; el runtime documentado es una build CPU con SIMD y OpenMP.
- Cabe en GPU de consumo: no disponible; el bundle está orientado a CPU.
- Opciones de despliegue: exclusivamente el runtime llama-tts de Audio8_TTS sobre llama.cpp en el commit d854d98bae598388ecea1ed84396587e5edc326d. No funciona con llama.cpp estándar, Ollama ni LM Studio.
- Latencia y throughput: RTF de 3,7 con referencia y 2,7 sin referencia en Q4_K_M con 4 trabajos compartiendo CPU; aproximadamente 2 de RTF con un solo trabajo y 16 hilos. Síntesis más lenta que el tiempo real.
- Almacenamiento: 2,0 GB de repositorio; el códec en F32 (1,26 GiB) domina el tamaño.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| antzoki-mini-tts-GGUF (este) | 337,9 M | no disponible | eu | Apache-2.0 | GGUF + F32 | Clonación zero-shot, ejecución en CPU, runtime propio |
| itzune/antzoki-mini-tts (base) | 337,9 M | no disponible | eu | Apache-2.0 | safetensors | Modelo original sin cuantizar; requiere entorno Python/GPU |
| Edge0/Audio8-TTS-Realistic-Air | 0,6 B (según model card) | no disponible | no disponible | no disponible | no disponible | Modelo base de Audio8 sin ajuste en euskera |

No se dispone de datos de benchmarks comparativos con otros modelos TTS en euskera en la información proporcionada.

## Limitaciones y advertencias

- Entrenado con aproximadamente 9 horas de voz leída, lo que limita la cobertura fonética y de vocabulario.
- Mispronuncia algunas palabras raras y nombres propios (por ejemplo, "Antton").
- No existe parámetro de velocidad: el ritmo lo marca la referencia de voz.
- Sin referencia de voz, la voz y el ritmo cambian con cada semilla.
- Riesgo de "runaways": la generación puede no alcanzar el fin de habla dentro de --max-frames y terminar con error; hay que repetir con otra semilla.
- El bundle exige el runtime llama-tts parcheado para Audio8; no funciona con llama.cpp estándar, Ollama ni LM Studio.
- La síntesis en CPU es más lenta que el tiempo real (RTF aproximado de 2 con 16 hilos).
- Solo soporta euskera; no hay capacidades multilingües.
- Licencia Apache-2.0 permite uso comercial, pero se heredan las limitaciones del modelo original; conviene revisar LICENSE y NOTICE del repositorio.
- Riesgo de alucinación de audio y artefactos en pronunciación no documentado explícitamente; no hay datos de sesgos publicados en la información disponible.

## Enlaces

- Hugging Face: https://huggingface.co/itzune/antzoki-mini-tts-GGUF
- Modelo base: https://huggingface.co/itzune/antzoki-mini-tts
- Modelo original de Audio8: https://huggingface.co/Edge0/Audio8-TTS-Realistic-Air
- Runtime Audio8_TTS: https://github.com/Edge0-AI/Audio8_TTS
- llama.cpp: https://github.com/ggml-org/llama.cpp
- Repositorio de scripts de conversión y cuantización: https://github.com/itzune/antzoki-mini-tts
