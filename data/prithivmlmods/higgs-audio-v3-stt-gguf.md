# prithivMLmods/higgs-audio-v3-stt-GGUF

## Resumen

Higgs Audio v3 STT es un modelo de reconocimiento automático del habla (ASR) en inglés desarrollado por Boson AI. Combina un codificador Whisper-Large-v3 con un decodificador Qwen3-1.7B en una arquitectura multimodal personalizada, lo que le permite transcribir audio mono a 16 kHz a texto. La versión aquí descrita es una conversión a GGUF realizada por prithivMLmods, pensada para su uso con llama.cpp y `llama-mtmd-cli`, lo que facilita el despliegue local sin depender del stack original de PyTorch.

El modelo incorpora un modo de razonamiento (thinking mode) orientado a mejorar la precisión de la transcripción y, por defecto, genera salida en minúsculas y sin puntuación. La actualización de junio de 2026 refrescó los datos de ajuste fino con particiones públicas de entrenamiento de AMI (IHM), VoxPopuli (en), SPGISpeech, LibriSpeech, TED-LIUM, GigaSpeech y Earnings22, excluyendo grabaciones presentes en los conjuntos de test de ESB/Open-ASR. También se añadió un postprocesado determinista en `transcribe.py` que colapsa frases repetidas y limita palabras repetidas.

La relevancia de esta ficha radica en que ofrece una alternativa ligera (2.031.739.904 parámetros según safetensors) y cuantizable a tamaños de entre 1,07 GB y 4,07 GB, con licencia Apache 2.0, lo que la hace atractiva para transcripción local en entornos con recursos limitados. No obstante, el autor advierte de que las cifras de benchmarks anteriores quedan obsoletas y remite al Open ASR Leaderboard para resultados independientes, que no reflejarán la actualización hasta que el modelo sea reevaluado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Codificador Whisper-Large-v3 + decodificador Qwen3-1.7B (multimodal, requiere `trust_remote_code=True` y `boson_multimodal`) |
| Parametros totales | 2.031.739.904 (según safetensors); la model card indica 2,68B |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | BF16, Q3_K_L, Q3_K_M, Q4_K_M, Q4_K_S, Q5_K_M, Q5_K_S, Q6_K, Q8_0, mmproj-bf16 |
| Idiomas soportados | inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (safetensors en el modelo base) |

## Arquitectura y entrenamiento

El modelo sigue una arquitectura multimodal personalizada: un codificador de audio Whisper-Large-v3 procesa la entrada de audio mono a 16 kHz y un decodificador Qwen3-1.7B genera la transcripción. Esta combinación exige el uso de `trust_remote_code=True` y de la librería `boson_multimodal` para el preprocesado de audio en el ecosistema Transformers. La conversión a GGUF incluye un archivo de proyección multimodal (`mmproj-bf16`) necesario para las capacidades de speech-to-text en llama.cpp.

En cuanto al entrenamiento, la actualización de junio de 2026 refrescó los datos de ajuste fino con particiones públicas de entrenamiento de AMI (IHM), VoxPopuli (en), SPGISpeech, LibriSpeech, TED-LIUM, GigaSpeech y Earnings22, excluyendo grabaciones que aparecen en los conjuntos de test de ESB/Open-ASR. La model card no detalla el número total de tokens de entrenamiento ni si se emplearon técnicas de RLHF o DPO. Como innovación destacable, el modelo soporta un modo de razonamiento (thinking mode) destinado a mejorar la precisión, y el script `transcribe.py` incorpora un postprocesado determinista que colapsa frases repetidas y limita palabras repetidas.

## Capacidades

- Reconocimiento automático del habla (ASR) en inglés a partir de audio mono a 16 kHz.
- Generación de transcripciones en minúsculas y sin puntuación por defecto, según el prompt del modelo.
- Modo de razonamiento (thinking mode) orientado a mejorar la precisión de la transcripción.
- Postprocesado determinista integrado en `transcribe.py` que colapsa frases repetidas y limita palabras repetidas.
- Ejecución local mediante llama.cpp y `llama-mtmd-cli` con offloading a GPU (`-ngl 99`).
- Soporte de cuantizaciones GGUF de Q3 a Q8 y BF16 para distintos presupuestos de memoria.
- No se documentan capacidades de tool calling, function calling, agentes, visión ni audio más allá del ASR.

## Casos de uso

- Transcripción local de reuniones y entrevistas: el modelo puede procesar audio mono a 16 kHz y generar transcripciones en inglés sin puntuación, adecuado para pipelines que posteriormente aplican puntuación y formateo. Su tamaño cuantizado (desde 1,07 GB en Q3_K_M) permite ejecutarlo en equipos con recursos limitados.
- Subtitulado y generación de actas en entornos sin conectividad: al ejecutarse con llama.cpp y `llama-mtmd-cli`, puede desplegarse en estaciones de trabajo aisladas o en el borde, sin depender de servicios en la nube.
- Análisis de llamadas de atención al cliente: la inclusión de Earnings22 en el ajuste fino lo hace adecuado para transcribir audio de dominio financiero y de reuniones corporativas, con el postprocesado integrado que reduce repeticiones.
- Investigación en ASR: sirve como punto de partida para experimentos con arquitecturas híbridas Whisper + Qwen3, y su licencia Apache 2.0 facilita la reproducción y la comparación en el Open ASR Leaderboard.
- Prototipado rápido en portátiles con GPU de consumo: las cuantizaciones Q4_K_M (1,28 GB) y Q5_K_M (1,47 GB) permiten iterar sobre el modelo en GPUs con poca VRAM, usando el archivo `mmproj-bf16` para la proyección multimodal.
- Transcripción de corpus académicos: al haberse entrenado con AMI (IHM), LibriSpeech, TED-LIUM y GigaSpeech, encaja en tareas de transcripción de discurso espontáneo, lecturas y charlas, siempre que el idioma sea inglés.
- Integración en pipelines de datos: el formato GGUF y la compatibilidad con llama.cpp permiten incorporar la transcripción como etapa dentro de flujos de procesamiento por lotes en C/C++ o mediante scripts de Python que invoquen `llama-mtmd-cli`.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica que las cifras anteriores quedan obsoletas y remite al Open ASR Leaderboard para resultados independientes, que no reflejarán la actualización hasta que el modelo sea reevaluado.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1,1 GB con Q3_K_M, 1,3 GB con Q4_K_M, 1,5 GB con Q5_K_M, 1,7 GB con Q6_K, 2,2 GB con Q8_0 y 4,1 GB con BF16, a lo que hay que sumar el archivo de proyección multimodal `mmproj-bf16` (1,29 GB).
- GPU recomendadas: no se especifican en la información disponible; por tamaño, cualquier GPU con al menos 4-6 GB de VRAM puede alojar las cuantizaciones intermedias junto con el proyector.
- Cabe en GPU de consumo: sí, en modelos con suficiente VRAM para la cuantización elegida más el proyector; las cuantizaciones Q3 y Q4 son las más adecuadas para GPUs de gama baja.
- Opciones de despliegue: llama.cpp mediante `llama-mtmd-cli` (documentado en la model card), y el ecosistema Transformers con `trust_remote_code=True` y `boson_multimodal` para el modelo base. No se documentan vLLM, Ollama ni TGI en la información disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| higgs-audio-v3-stt (este) | 2.031.739.904 (2,68B según card) | no disponible | en | Apache 2.0 | GGUF, safetensors | Whisper-Large-v3 + Qwen3-1.7B, thinking mode |
| Whisper-Large-v3 | no disponible en la información | no disponible | multilingüe | MIT (según el proyecto original, no verificado aquí) | safetensors, GGUF | Codificador usado por este modelo; referencia habitual en ASR |
| Qwen3-1.7B | 1,7B | no disponible | multilingüe | Apache 2.0 (según el proyecto original, no verificado aquí) | safetensors, GGUF | Decodificador usado por este modelo; no es un modelo ASR por sí mismo |

No se dispone de datos de benchmarks comparativos en la información proporcionada, por lo que la comparación se limita a parámetros, licencia y formato.

## Limitaciones y advertencias

- Solo soporta inglés; no se documentan otros idiomas.
- La salida por defecto es en minúsculas y sin puntuación, lo que puede requerir postprocesado adicional para muchos casos de uso.
- Riesgo de alucinación y de repeticiones: la model card menciona que el postprocesado determinista colapsa frases repetidas y limita palabras repetidas, lo que sugiere que el modelo puede generar bucles sin él.
- Las cifras de benchmarks anteriores están obsoletas según el autor; no deben citarse como válidas para la versión actual.
- Requiere `trust_remote_code=True` y la librería `boson_multimodal` en el ecosistema Transformers, lo que añade dependencias y superficie de riesgo en producción.
- La conversión a GGUF es de un tercero (prithivMLmods), no del autor original; la calidad de la cuantización y la paridad con el modelo base no están verificadas de forma independiente en la información disponible.
- Licencia Apache 2.0: permite uso comercial, pero conviene revisar las condiciones del modelo base y de las dependencias (Whisper, Qwen3) antes de desplegar.
- No se documentan sesgos específicos ni evaluaciones de robustez por acento o dominio.
- El repositorio tiene 0 descargas y 1 like en el momento de la consulta, lo que indica escasa validación comunitaria.

## Enlaces

- [Hugging Face: prithivMLmods/higgs-audio-v3-stt-GGUF](https://huggingface.co/prithivMLmods/higgs-audio-v3-stt-GGUF)
- [Modelo base: bosonai/higgs-audio-v3-stt](https://huggingface.co/bosonai/higgs-audio-v3-stt)
- [llama.cpp (GitHub)](https://github.com/ggml-org/llama.cpp)
- [Open ASR Leaderboard](https://huggingface.co/spaces/hf-audio/open_asr_leaderboard)
