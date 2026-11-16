# ohmeet-com/distill-whisper-th-large-v3-ggml

## Resumen

Distill Whisper Thai large-v3 GGML es una conversión del modelo de reconocimiento automático del habla (ASR) `biodatlab/distill-whisper-th-large-v3` (Thonburian Whisper) al formato GGML cuantizado en q8_0, realizada por el usuario `ohmeet-com` para su uso en la aplicación de macOS Oh Meet mediante whisper.cpp. El modelo original lo desarrolla el laboratorio biodatlab y está especializado en transcripción de tailandés, idioma para el que el Whisper multilingüe de OpenAI rinde de forma notablemente inferior.

La arquitectura sigue la forma de large-v3-turbo: 32 capas de encoder, 4 capas de decoder y 128 bins mel, lo que reduce drásticamente el coste de decodificación frente a un large-v3 completo manteniendo la profundidad del encoder. El resultado es un binario de 874.188.075 bytes (aproximadamente 0,87 GB) que cabe con holgura en memoria unificada de equipos Apple Silicon y permite transcripción local sin conexión.

La relevancia práctica es doble: por un lado, ofrece ASR de calidad para tailandés en un formato ejecutable en hardware de consumo; por otro, la cuantización q8_0 conserva la precisión del f16 (diferencia inferior a 0,03 puntos porcentuales de CER en FLEURS Thai), de modo que la compresión no penaliza de forma medible la transcripción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder tipo Whisper (forma large-v3-turbo: 32 capas de encoder, 4 de decoder, 128 bins mel) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | ventana de audio de 30 segundos por segmento (estandar Whisper); no disponible el detalle adicional |
| Tipos de cuantizacion | q8_0 (unico archivo publicado); el original admite otros formatos, pero esta conversion solo distribuye q8_0 |
| Idiomas soportados | tailandes (th) |
| Licencia | MIT (licencia del modelo original de biodatlab, que incluye el aviso de copyright de OpenAI Whisper) |
| Formato de pesos | GGML (`.bin`), compatible con whisper.cpp; el modelo base usa safetensors |

## Arquitectura y entrenamiento

El modelo base es un destilado de Whisper large-v3 para tailandes, con una topologia de tipo large-v3-turbo: mantiene las 32 capas del encoder de large-v3 pero recorta el decoder a 4 capas, lo que reduce el coste computacional de generación de tokens sin sacrificar la extracción acústica. La entrada es un espectrograma mel de 128 bins, coherente con large-v3. No se dispone de información detallada sobre el corpus de destilación, el número de tokens de entrenamiento ni si se aplicaron etapas de RLHF o ajuste fino supervisado adicional en el modelo original.

La conversión documentada es puramente de formato: se tomó `model.safetensors` del commit `62df42cecab9f484226ad5f9afdb557552021bbb` del repositorio de biodatlab y se convirtió con `models/convert-h5-to-ggml.py` de whisper.cpp en el commit `927cfce`, parcheado únicamente para hacer streaming de tensores desde safetensors; los filtros mel y los assets del tokenizador provienen de `openai/whisper` en el commit `8609812`. Posteriormente se cuantizó a q8_0 con `whisper-quantize` del mismo commit. La innovación destacable no está en el entrenamiento sino en la preservación de precisión tras cuantización: en FLEURS Thai la diferencia de CER entre q8_0 y f16 es inferior a 0,03 puntos porcentuales.

## Capacidades

- Reconocimiento automático del habla en tailandes, con salida de texto y marcas de tiempo por segmento propias de Whisper.
- Transcripción de audio de hasta 30 segundos por ventana, con procesamiento por segmentos para audio más largo.
- Detección de actividad de voz recomendada mediante Silero VAD (`ggml-org/whisper-vad`) para cortar el audio en fronteras de habla antes de transcribir.
- Ejecución local y sin conexión mediante whisper.cpp, con soporte de aceleración Metal en Apple Silicon.
- No soporta tool calling ni function calling: es un modelo puramente ASR.
- No soporta razonamiento multi-paso ni modo de pensamiento; no es un modelo generativo de propósito general.
- No soporta visión ni audio más allá de la transcripción; no hay capacidades multimodales adicionales.
- Capacidad multilingüe limitada al tailandes: el autor recomienda fijar siempre `-l th`, y no se documenta comportamiento fiable en otros idiomas.

## Casos de uso

- Transcripción de reuniones y entrevistas en tailandes: el modelo convierte audio de hasta 30 segundos por segmento en texto con marcas temporales, adecuado para generar actas y resúmenes posteriores en herramientas de productividad.
- Subtitulado de vídeo en tailandes: la salida con timestamps permite generar ficheros de subtítulos alineados, integrándose en pipelines de postproducción sin depender de servicios en la nube.
- Aplicaciones de notas de voz en macOS: al ejecutarse con whisper.cpp y Metal, encaja en apps de escritorio que transcriben dictados localmente con un pico de memoria de aproximadamente 1,2 GB en Apple Silicon.
- Atención al cliente y análisis de llamadas: transcripción por lotes de grabaciones telefónicas en tailandes para su posterior clasificación, búsqueda y control de calidad, manteniendo los datos en infraestructura propia.
- Investigación lingüística y corpus de habla tailandesa: generación de transcripciones a escala sobre grabaciones de campo, con la ventaja de que la cuantización q8_0 no degrada de forma apreciable el CER frente a f16.
- Despliegue en dispositivos con recursos limitados: al ocupar menos de 1 GB en disco y alrededor de 1,2 GB en memoria, es viable en portátiles y equipos sin GPU dedicada, a diferencia de un large-v3 completo en f16.
- Accesibilidad: subtitulado en tiempo casi real de contenido audiovisual en tailandes para personas con discapacidad auditiva, ejecutado localmente para evitar latencia de red y costes por minuto.

## Benchmarks y rendimiento

La model card solo aporta una comparación interna de cuantización sobre FLEURS Thai:

| Metrica | q8_0 | f16 | Diferencia |
|---|---|---|---|
| CER en FLEURS Thai | referencia | dentro de 0,03 pp del q8_0 | ≤ 0,03 puntos porcentuales |

No se han publicado resultados de benchmarks en la informacion disponible para MMLU, HumanEval, GSM8K ni otras tareas, dado que el modelo es exclusivamente ASR. Tampoco se ofrecen cifras de WER/CER absolutas frente a otros modelos.

## Requisitos de hardware

- VRAM/memoria estimada: aproximadamente 1,2 GB de pico en Apple Silicon con Metal, según el autor; el fichero en disco ocupa 874.188.075 bytes.
- GPU recomendadas: no se especifican modelos concretos; el caso documentado es Apple Silicon con backend Metal. En GPU NVIDIA o AMD sería necesario compilar whisper.cpp con el backend correspondiente (CUDA, Vulkan, etc.), sin cifras publicadas de rendimiento.
- Cabe en GPU de consumo: sí, por tamaño (menos de 1 GB de pesos), aunque no hay validación publicada en tarjetas concretas como RTX 4090 o similares.
- Opciones de despliegue: whisper.cpp mediante `whisper-cli -m ggml-distill-th-large-v3-q8_0.bin -l th`; también es posible integrarlo en aplicaciones que enlacen la librería de whisper.cpp. No se documenta soporte para vLLM, TGI, Ollama ni llama.cpp.
- Latencia y throughput: no disponibles; no se publican medidas de RTF ni de tokens por segundo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto de audio | Idiomas | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|---|
| ohmeet-com/distill-whisper-th-large-v3-ggml | no disponible (arquitectura large-v3-turbo) | 30 s por segmento | tailandes | MIT | GGML q8_0 | Hugging Face |
| biodatlab/distill-whisper-th-large-v3 (modelo base) | no disponible | 30 s por segmento | tailandes | MIT | safetensors | Hugging Face |
| openai/whisper-large-v3 | 1.550 M (aprox., según documentación pública de OpenAI) | 30 s por segmento | multilingüe (99 idiomas) | MIT | safetensors, GGML, etc. | Hugging Face, OpenAI |

El modelo base ofrece los mismos pesos en safetensors, por lo que la comparación relevante es de formato y despliegue: la conversión GGML q8_0 reduce el peso a menos de 1 GB y habilita whisper.cpp, a cambio de fijar una única cuantización. Frente a whisper-large-v3 de OpenAI, la especialización en tailandes y el decoder reducido a 4 capas apuntan a menor coste de decodificación, pero no hay cifras públicas de WER comparativas en la información disponible.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados por el autor; al ser un modelo entrenado principalmente con habla tailandesa, es esperable un peor rendimiento en acentos regionales o en habla con ruido no representados en el corpus de destilación.
- Riesgo de alucinación: como cualquier Whisper, puede escribir texto durante silencios largos; el autor recomienda segmentar el audio con VAD (Silero, `ggml-org/whisper-vad`) antes de transcribir.
- Limitación de idioma: solo tailandes; es obligatorio fijar `-l th` y no se garantiza un comportamiento correcto en otros idiomas.
- Limitación de contexto: ventana de 30 segundos por segmento, con necesidad de trocear audio largo en fronteras de habla.
- Restricciones de licencia: MIT permite uso comercial, pero la licencia arrastra el aviso de copyright de OpenAI Whisper; la conversión no está avalada ni por biodatlab ni por OpenAI.
- Caveat de producción: solo se distribuye q8_0; no hay variantes f16, q5_0 u otras en este repositorio, y el rendimiento en GPU no Apple no está validado públicamente.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: no hay evidencia de uso comunitario ni de validación independiente de la conversión más allá de la comprobación de CER en FLEURS Thai.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ohmeet-com/distill-whisper-th-large-v3-ggml
- Modelo base: https://huggingface.co/biodatlab/distill-whisper-th-large-v3
- whisper.cpp: https://github.com/ggml-org/whisper.cpp
- VAD Silero para whisper.cpp: https://huggingface.co/ggml-org/whisper-vad
- Repositorio de OpenAI Whisper (assets de tokenizador y filtros mel): https://github.com/openai/whisper
