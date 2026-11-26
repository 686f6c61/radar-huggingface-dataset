# ASLP-lab/M5-TTS-Audio-Tokenizer

## Resumen

M5-TTS-Audio-Tokenizer es el códec de audio neuronal que utiliza la familia de modelos M5-TTS, desarrollada por ASLP-lab, para convertir grabaciones de referencia en tokens discretos y reconstruir habla a partir de tokens generados. No es un modelo de texto-a-habla autonómo: es el componente de tokenizacion acustica del pipeline TTS, complementario al tokenizador de texto que se distribuye con los checkpoints de M5. Concretamente, se trata del codec Qwen3-TTS de 12 Hz reempaquetado con un adaptador propio para su uso dentro de M5.

El modelo opera a una frecuencia de muestreo de 24 kHz y una tasa de trama de 12,5 frames por segundo, con 16 codebooks empleados por M5 y un layout de codigos `(batch, frames, 16)` para lotes con padding. El repositorio pesa aproximadamente 0,7 GB y contiene 170.557.441 parametros en formato safetensors, lo que lo situa en el rango de los codecs neuronales ligeros aptos para inferencia en CPU.

Su relevancia practica radica en que cualquier despliegue de M5-TTS para clonacion de voz o sintesis con voz personalizada depende de este codec: los scripts de inferencia de VoiceClone y CustomVoice lo descargan automaticamente. La licencia Apache-2.0 y la inclusión de la implementacion minima del codec en el repositorio M5 simplifican su integracion en productos comerciales sin dependencias externas del paquete `qwen-tts`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Codec de audio neuronal (Qwen3-TTS 12Hz tokenizer) con adaptador M5 |
| Parametros totales | 170.557.441 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no aplica: procesa audio, no texto) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |
| Frecuencia de muestreo | 24 kHz |
| Tasa de trama del codec | 12,5 frames/s |
| Codebooks usados por M5 | 16 |
| Layout de codigos | `(batch, frames, 16)` con padding |
| Tamano del repositorio | ~0,7 GB |
| Pipeline | feature-extraction |

## Arquitectura y entrenamiento

El modelo es un codec de audio neuronal derivado del tokenizador Qwen3-TTS de 12 Hz. Su funcion es doble: codificar audio PCM de entrada en una secuencia de tokens discretos organizados en 16 codebooks y decodificar dichos tokens de vuelta a forma de onda. La tasa de trama de 12,5 frames/s implica que cada segundo de audio se representa con aproximadamente 12,5 pasos temporales, cada uno con 16 codigos; esta compresion es lo que permite a un modelo autorregresivo o de difusion como M5-TTS modelar el habla como una secuencia de tokens manejable.

El adaptador de M5 gestiona el remuestreo de la entrada al formato interno del codec y expone la API `Qwen3TTSTokenizer` con metodos `encode()` y `decode()`. La implementacion incluida en el repositorio M5 es una version minima del codec upstream, con la licencia y el aviso de modificacion correspondientes. No se dispone de informacion sobre el volumen de datos de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF o ajuste fino; la model card no detalla el proceso de entrenamiento del codec original de Qwen3-TTS.

## Capacidades

- Codificacion de audio a tokens discretos: convierte grabaciones WAV o arrays NumPy (con `sr` explicito) en secuencias de codigos con 16 codebooks.
- Decodificacion de tokens a forma de onda: reconstruye audio a 24 kHz a partir de los tokens generados.
- Remuestreo interno: el adaptador acepta audio con frecuencia de origen distinta a 24 kHz y lo ajusta automaticamente.
- Ejecucion en CPU: el ejemplo de la model card funciona sin FlashAttention ni GPU.
- Integracion con M5-TTS: consumido automaticamente por los scripts de VoiceClone y CustomVoice.
- No soporta tool calling, agentes, razonamiento multi-paso ni generacion de texto: es exclusivamente un componente acustico.
- Capacidades multilingues: no documentadas; dependen del modelo TTS que consuma los tokens, no del codec.

## Casos de uso

- Clonacion de voz con M5-TTS: el codec codifica la grabacion de referencia del hablante objetivo en tokens que el modelo TTS usa como condicionamiento; es el primer paso obligatorio del pipeline VoiceClone.
- Sintesis de voz con voz personalizada: en CustomVoice, el codec decodifica los tokens generados por el modelo en audio final a 24 kHz, cerrando el pipeline de inferencia.
- Preprocesamiento de datasets de habla: convertir corpus de audio a representaciones tokenizadas para entrenamiento o ajuste fino de modelos TTS sobre el espacio latente del codec.
- Analisis y reconstruccion de audio: usar `encode()`/`decode()` de forma aislada para estudiar la fidelidad de la compresion o para pipelines de transcodificacion con perdida controlada.
- Prototipado en CPU: validar pipelines de audio en entornos sin GPU gracias a que el ejemplo de la model card corre en CPU con un repositorio de 0,7 GB.
- Integracion en servicios de TTS en produccion: al ser Apache-2.0 y no requerir el paquete `qwen-tts`, puede empaquetarse directamente en contenedores propios junto con los checkpoints de M5.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; con 170,5 M de parametros, los pesos en fp32 ocupan aproximadamente 0,68 GB, por lo que la inferencia cabe holgadamente en cualquier GPU consumer con 4 GB o mas.
- GPU recomendadas: cualquier GPU moderna es suficiente; no se requiere A100 ni H100 para este componente aislado.
- Cabe en GPU consumer: si, en cualquier modelo con 4 GB o mas de VRAM (RTX 3050, RTX 4060, RTX 4090, etc.).
- Ejecucion en CPU: soportada y documentada en la model card con `device_map="cpu"`.
- Opciones de despliegue: uso directo via `Qwen3TTSTokenizer` del repositorio M5; no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Frecuencia / tasa | Licencia | Notas |
|---|---|---|---|---|
| M5-TTS-Audio-Tokenizer | 170,5 M | 24 kHz / 12,5 fps | Apache-2.0 | Codec Qwen3-TTS 12Hz con adaptador M5 |
| Qwen3-TTS-Tokenizer-12Hz (upstream) | no disponible | 12 Hz | no disponible en la informacion | Codec original del que deriva este repositorio |
| Otros codecs neuronales (EnCodec, DAC, etc.) | no disponible | no disponible | no disponible | No se dispone de datos comparativos en la informacion proporcionada |

La comparacion cuantitativa con alternativas no esta disponible en la informacion proporcionada; el unico pariente documentado es el tokenizador Qwen3-TTS de 12 Hz, del cual este repositorio es una adaptacion para M5.

## Limitaciones y advertencias

- No es un modelo TTS autonomo: no genera habla a partir de texto por si solo; requiere un modelo M5-TTS que produzca los tokens.
- Reconstruccion con perdida: la propia model card advierte que la decodificacion es lossy; no debe usarse como codec sin perdida.
- Idiomas soportados no documentados: la cobertura linguistica depende del modelo TTS consumidor, no del codec.
- Sin datos de sesgos, alucinacion o robustez: no se ha publicado informacion al respecto; en TTS, los riesgos tipicos (artefactos, perdida de prosodia, sesgos de hablante) recaen sobre el modelo generador.
- Dependencia del repositorio M5: el uso standalone requiere clonar el repositorio de GitHub e instalar sus dependencias; no hay paquete pip independiente documentado.
- Licencia Apache-2.0: permite uso comercial, pero debe conservarse el aviso de licencia y modificacion del codec upstream de Qwen incluido en `m5/codec_qwen12hz`.
- Fecha de creacion del repositorio en 2026: verificar la vigencia y el soporte del proyecto antes de adoptarlo en produccion.

## Enlaces

- Hugging Face: https://huggingface.co/ASLP-lab/M5-TTS-Audio-Tokenizer
- Repositorio GitHub de M5-TTS: https://github.com/ASLP-lab/M5-TTS
- Demo: https://aslp-lab.github.io/M5-TTS-Demo-Page/
- Space: https://huggingface.co/spaces/ASLP-lab/M5-TTS-Space
- Coleccion de modelos M5: https://huggingface.co/collections/ASLP-lab/m5-tts
- Modelo VoiceClone: https://huggingface.co/ASLP-lab/M5-TTS-50M-VoiceClone
- Modelo CustomVoice: https://huggingface.co/ASLP-lab/M5-TTS-50M-CustomVoice
- Codec upstream Qwen3-TTS 12Hz: https://huggingface.co/Qwen/Qwen3-TTS-Tokenizer-12Hz
- Implementacion del codec en M5 (licencia y aviso de modificacion): https://github.com/ASLP-lab/M5-TTS/tree/main/m5/codec_qwen12hz
