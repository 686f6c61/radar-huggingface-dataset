# ianblenke/qwen3.8-27b-ultravox-0.6

## Resumen

`ianblenke/qwen3.8-27b-ultravox-0.6` es un adaptador multimodal de audio (proyector Ultravox) entrenado sobre el modelo de lenguaje `Qwen/Qwen3.8-27B` en bf16 y con el codificador de audio `openai/whisper-large-v3-turbo` congelado. No es un modelo completo: el repositorio publica únicamente el proyector entrenado (52.441.088 parametros) en `projector.safetensors` (105 MB, bf16) y una conversion del proyector junto al codificador Whisper a GGUF (`mmproj-ultravox-whisper-large-v3-turbo-f16.gguf`, 1,4 GB) para llama.cpp. Ni los pesos del LLM ni los del codificador Whisper se incluyen en el repositorio.

El objetivo es dotar a Qwen3.8-27B de comprension de audio (reconocimiento de voz y respuesta a instrucciones sobre el audio) mediante un adaptador ligero, siguiendo el esquema de Ultravox: las representaciones del codificador de audio se proyectan al espacio de embeddings del LLM. El modelo esta pensado para experimentacion y despliegue con llama.cpp, y el autor documenta un parche necesario para recortar el padding de audio del codificador Whisper, sin el cual el modelo repite la frase en lugar de detenerse.

Es relevante porque demuestra un flujo de trabajo completo y reproducible (entrenamiento, conversion a GGUF, evaluacion WER y medicion de latencia) sobre hardware de consumo profesional como DGX Spark, y porque publica resultados de WER y latencia concretos para el par proyector + Qwen3.8-27B. La fecha de creacion del repositorio es 2026-11-06.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Proyector Ultravox (MLP) sobre LLM Qwen3.8-27B + codificador de audio Whisper-large-v3-turbo congelado |
| Parametros totales | 689.410.048 (dato real de safetensors del repo; corresponde al proyector y artefactos publicados, no al LLM completo) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible para el adaptador; el modelo base Qwen3.8-27B declara 262K tokens |
| Tipos de cuantizacion | bf16 (proyector); GGUF f16 (mmproj); el autor evalua ademas con una build ternaria de Qwen3.8-27B en llama.cpp |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (projector.safetensors, bf16) y GGUF (mmproj-ultravox-whisper-large-v3-turbo-f16.gguf) |

## Arquitectura y entrenamiento

La arquitectura sigue el diseno Ultravox: un codificador de audio Whisper-large-v3-turbo congelado produce embeddings del audio, que un proyector (cuatro tensores `multi_modal_projector.*`) transforma al espacio del LLM Qwen3.8-27B, tambien congelado durante el entrenamiento. Solo se entrena y publica el proyector, de 52.441.088 parametros. El `config.json` es una configuracion Ultravox con `text_model_id` apuntando a `Qwen/Qwen3.8-27B`.

El entrenamiento se realizo en 2 x DGX Spark con paralelismo de datos, batch global 8 y 37.500 pasos (aproximadamente 300.000 muestras) sobre LibriSpeech clean + other y Common Voice 17 en ingles, con learning rate 2e-3, scheduler coseno y 500 pasos de warmup. El entrenamiento se pauso en el paso 24.000 y se reanudo con el estado del optimizador. La perdida media por ventana bajo de 0,43 a 0,10. Los pesos publicados corresponden al paso 37.500. Una innovacion practica documentada es el parche `patches/llama.cpp/0001-ultravox-trim-audio-padding.patch`, que recorta las posiciones de audio del padding fijo de 30 segundos del codificador Whisper (unas 188 posiciones) a la longitud real del clip (17 posiciones para 2,6 s); sin el, el modelo repite la frase en lugar de terminar.

## Capacidades

- Comprension de audio en ingles: reconocimiento de voz y respuesta a instrucciones sobre el contenido del audio (por ejemplo, "repite el siguiente texto").
- Integracion audio-texto sobre Qwen3.8-27B: hereda las capacidades de generacion de texto y razonamiento del LLM base, condicionadas por el audio de entrada.
- Soporte de tool calling / function calling: no documentado en la informacion disponible para este adaptador.
- Soporte de agentes y razonamiento multi-paso: no evaluado especificamente para el adaptador.
- Capacidades multilingues: limitadas al ingles; el autor indica explicitamente "English read speech only".
- Capacidad especial: proyector de audio Ultravox compatible con llama.cpp (tipo de proyector `ultravox`), con soporte para fusionar un `mmproj` de vision mediante `scripts/merge_mmproj.py` para servir audio y vision conjuntamente.
- Modo thinking: no documentado para el adaptador.

## Casos de uso

- Transcripcion y verificacion de voz en ingles: el modelo responde a peticiones de repeticion de texto con un WER de 3,68% en LibriSpeech clean y 8,24% en other (bf16 con transformers), lo que permite usarlo como componente de ASR en pipelines de evaluacion.
- Prototipado de asistentes de voz: con llama.cpp y el mmproj GGUF se puede montar un servidor local que reciba audio y devuelva texto, con latencia de primer token de 379-553 ms segun la duracion del clip en una DGX Spark.
- Investigacion en adaptadores multimodales: sirve como referencia reproducible para entrenar proyectores Ultravox sobre LLMs grandes con codificador Whisper congelado, incluyendo scripts de inferencia bf16 y evaluacion.
- Evaluacion comparativa de cuantizaciones: el autor compara bf16 con transformers frente a una build ternaria en llama.cpp (3,68% vs 3,97% en clean), util para medir el impacto de la cuantizacion en tareas de audio.
- Servicio de audio y vision combinados: fusionando el mmproj de audio con un mmproj de vision mediante `scripts/merge_mmproj.py`, se puede desplegar un unico servidor llama.cpp que atienda entradas de audio e imagen.
- Docencia y demos de multimodalidad: el repositorio incluye `scripts/latency.py`, `loss.csv` y `wer.md`, lo que facilita reproducir el entrenamiento y las mediciones en entornos academicos.

## Benchmarks y rendimiento

WER de una peticion "repeat the following text", decodificacion greedy, primeros 100 clips de validacion por subconjunto de LibriSpeech (clean: 2.038 palabras; other: 1.820 palabras), respuestas en bruto puntuadas:

| Ruta | clean | other |
|---|---|---|
| bf16 Qwen3.8-27B, transformers | 3,68% | 8,24% |
| Build ternaria de Qwen3.8-27B, llama.cpp con el parche de recorte | 3,97% | 8,35% |

El autor advierte que hay una muestra por celda y que diferencias de unas decimas de punto son ruido.

Latencia medida el 2026-11-06 en una NVIDIA GB10 (DGX Spark, memoria unificada), servidor llama.cpp parcheado con CUDA, build ternaria de Qwen3.8-27B y proyector del paso 37.500, todas las capas en GPU, contexto de 4.096 tokens, prompt "repeat the following text", greedy, medianas de 6 clips por longitud, en milisegundos tras la llegada de la peticion:

| Duracion del clip | Primer token de texto | Encode + prompt del servidor | Respuesta completa (tokens) |
|---|---|---|---|
| ~2 s | 379 | 343 | 523 (2,5) |
| 3 s | 488 | 347 | 826 (9,5) |
| 6 s | 525 | 357 | 1.124 (17) |
| 10 s | 553 | 374 | 1.592 (30,5) |

La generacion corre a unos 35 ms por token. El codificador Whisper siempre procesa una ventana fija de 30 segundos, por lo que el tiempo de encode + prompt apenas crece con la duracion del clip. No se midieron deteccion de fin de habla, text-to-speech, otras GPU ni carga del servidor.

## Requisitos de hardware

- VRAM estimada para inferencia: el proyector en bf16 ocupa unos 105 MB; el mmproj GGUF f16 ocupa 1,4 GB (proyector + codificador Whisper). A esto hay que sumar los pesos del LLM Qwen3.8-27B, que no se incluyen en el repositorio y cuyo requisito depende de la cuantizacion elegida.
- GPU recomendadas: NVIDIA GB10 (DGX Spark) es la unica plataforma con mediciones publicadas por el autor. Para el LLM base de 27B se requiere una GPU con memoria suficiente para la cuantizacion empleada; no se documentan otras GPU.
- Cabe en consumer GPU: no hay datos publicados que lo confirmen para el conjunto completo; el proyector y el mmproj si caben en cualquier GPU con 2 GB o mas de memoria libre.
- Opciones de despliegue: llama.cpp con soporte de audio Ultravox y el parche de recorte de padding; transformers 5 (construyendo `UltravoxModel` directamente desde `config.json` y cargando los tensores, ya que `from_pretrained` no funciona). No se documenta vLLM, Ollama ni TGI.
- Latencia y throughput: primer token de 379-553 ms y unos 35 ms por token de generacion en DGX Spark con la build ternaria; no se publican mediciones de throughput agregado ni de concurrencia.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ianblenke/qwen3.8-27b-ultravox-0.6 | Proyector de 52,4 M sobre Qwen3.8-27B | no disponible (base: 262K) | Adaptador de audio Ultravox + Whisper-large-v3-turbo | apache-2.0 | Hugging Face, 0 descargas, 0 likes |
| Qwen/Qwen3.8-27B | 27B (denso) | 262K tokens | LLM vision-language con razonamiento configurable | no disponible en la informacion | Modelo base referenciado; disponible en LM Studio y GitHub de QwenLM |
| Ultravox (fixie-ai) | no disponible | no disponible | Framework de adaptadores de audio sobre LLMs | MIT | GitHub de fixie-ai/ultravox |

No se dispone de datos de benchmarks comparativos con otros adaptadores de audio en la informacion proporcionada.

## Limitaciones y advertencias

- Solo ingles y solo habla leida: no evaluado con habla ruidosa, con acento, conversacional o con solapamiento de hablantes.
- No evaluado con clips de mas de 16 segundos (la duracion maxima usada en entrenamiento) ni con multiples elementos de audio por peticion.
- Sin evaluacion de seguridad. El autor reporta que un clip temprano en bf16 produjo una respuesta de rechazo no investigada.
- El repositorio no incluye los pesos del LLM ni del codificador Whisper; es necesario descargarlos por separado y ensamblar el modelo.
- `from_pretrained` no funciona bajo transformers 5: hay que construir el modelo directamente y cargar los tensores del proyector.
- En llama.cpp es imprescindible aplicar el parche de recorte de padding de audio; sin el, el modelo repite la frase en lugar de detenerse. El parche asume un solo elemento de audio por peticion.
- No probado con fine-tunes del modelo base; solo con Qwen3.8-27B y una build ternaria del mismo.
- Las cifras de WER se basan en una sola muestra por celda; diferencias de decimas de punto no son significativas.
- Licencia Apache-2.0 para el adaptador; el modelo base es Apache-2.0, Whisper MIT y Ultravox MIT. Los datos de entrenamiento son LibriSpeech (CC BY 4.0) y Common Voice English (CC0), lo que impone obligaciones de atribucion sobre el dataset de entrenamiento.
- Riesgo de alucinacion y sesgos del LLM base no evaluados en este adaptador.

## Enlaces

- Hugging Face: https://huggingface.co/ianblenke/qwen3.8-27b-ultravox-0.6
- Repositorio de codigo, parches y scripts de evaluacion: https://github.com/ianblenke/qwen3.8-27b-ultravox-0.6
- Ultravox (framework): https://github.com/fixie-ai/ultravox
- Modelo base Qwen3.8-27B en LM Studio: https://lmstudio.ai/models/qwen3.8
- Repositorio oficial de Qwen3.8: https://github.com/QwenLM/Qwen3.8
