# moonbox-dev/VoxCPM2-GGUF

## Resumen

VoxCPM2-GGUF es la distribucion en formato GGUF del modelo de sintesis de voz VoxCPM2, desarrollado originalmente por OpenBMB y convertido por Moonbox para su uso con llama.cpp en entornos de inferencia local (Metal, CUDA, Vulkan y CPU). VoxCPM2 es un modelo de texto-a-voz (TTS) difusional autorregresivo sin tokenizador, con 2.000 millones de parametros declarados por el autor original y salida de audio a 48 kHz, entrenado sobre mas de 2 millones de horas de habla multilingue en 30 idiomas. El repositorio incluye el modelo base cuantizado en varias precisiones (F16, BF16, Q8_0, Q6_K, Q5_K_M y Q4_K_M) junto con un fichero `mmproj` que contiene el codificador de audio.

La relevancia de esta publicacion radica en que permite ejecutar un sistema de clonacion de voz y sintesis TTS de ultima generacion en hardware de consumo, sin depender de GPUs de datacenter ni de APIs en la nube. El modelo base MiniCPM4 actua como LM subyacente, mientras que el codificador (LocEnc, LocDiT, LM residual y AudioVAE) se distribuye en el fichero `mmproj` compartido por todas las precisiones.

No obstante, el propio autor de la conversion advierte que todos los ficheros son **experimentales** y quedan por debajo del umbral de calidad de Moonbox en clonacion de voz en chino: la similitud de hablante cae a 0,84-0,87 frente al 0,91 del original en el mismo modo, y el DNSMOS en ingles baja 0,2-0,3 puntos. En ingles, segun el autor, los ficheros igualan al original. El gap se atribuye al runtime de VoxCPM2 en llama.cpp (build b12621), no a la cuantizacion, ya que el fichero BF16 contiene los pesos originales sin modificar.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | TTS difusional autorregresivo sin tokenizador; LM base MiniCPM4 + LocEnc, LocDiT, LM residual y AudioVAE |
| Parametros totales | 1.471.744.128 (dato real de safetensors) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | F16, BF16, Q8_0, Q6_K, Q5_K_M, Q4_K_M |
| Idiomas soportados | 30 idiomas declarados por el autor original; lista concreta no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (safetensors en el modelo base original) |

## Arquitectura y entrenamiento

VoxCPM2 es un modelo de texto-a-voz difusional autorregresivo sin tokenizador. La arquitectura combina un LM base MiniCPM4 con un conjunto de modulos especificos de audio: LocEnc, LocDiT, un LM residual y un AudioVAE. En la distribucion GGUF, el fichero principal (`voxcpm2-*.gguf`) contiene el LM base MiniCPM4, mientras que el fichero `mmproj-voxcpm2-F16.gguf` (2,01 GB) contiene LocEnc, LocDiT y el LM residual en F16, y el AudioVAE en F32. Ambos ficheros son necesarios para la inferencia y el `mmproj` es comun a todas las precisiones.

Segun el autor original, el modelo fue entrenado sobre mas de 2 millones de horas de datos de habla multilingue y soporta 30 idiomas con salida a 48 kHz. No se dispone de informacion detallada sobre la composicion del dataset, el numero exacto de tokens de entrenamiento ni si se aplicaron tecnicas de RLHF o DPO. La conversion a GGUF se realizo con `convert_hf_to_gguf.py` y `llama-quantize` de llama.cpp build b12621, sin matriz de importancia. El conversor pliega una parte del modelo: el MLP de delta-time del decodificador de flujo siempre recibe una entrada cero en el original, por lo que el conversor incorpora su salida constante al sesgo del MLP de tiempo. El resto de tensores de `model.safetensors` son identicos byte a byte en los ficheros GGUF, y el autor verifico antes de la subida que cada tensor del checkpoint original aparece con los mismos valores en el BF16 y en el `mmproj`.

## Capacidades

- Sintesis de voz (text-to-speech) a partir de texto de entrada, con salida de audio a 48 kHz.
- Clonacion de voz a partir de un audio de referencia (`--tts-speaker-file reference.wav` en `llama-tts`).
- Diseno de voz mediante descripcion textual entre parentesis al inicio del texto (por ejemplo, `(A calm male narrator)Hello.`).
- Soporte multilingue: 30 idiomas declarados por el autor original.
- Servicio via HTTP con `llama-server` a traves del endpoint `/tts`, con parametros `input`, `speaker_ref_b64`, `seed`, `cfg_scale` y `flow_steps`.
- Ejecucion en Metal, CUDA, Vulkan y CPU gracias al backend llama.cpp.
- No soporta el modo de continuacion del original (audio de prompt mas su transcripcion) en llama.cpp.
- No se declaran capacidades de tool calling, agentes, vision ni audio de entrada mas alla de la referencia de voz.

## Casos de uso

- **Clonacion de voz en local para prototipado**: usar `llama-tts` con un fichero WAV de referencia para generar locuciones con la voz clonada, sin enviar audio a servicios externos. Adecuado para pruebas de concepto y demos en equipos de desarrollo con GPU de consumo.
- **Generacion de audiolibros y narraciones**: el modelo permite disenar una voz mediante descripcion textual (por ejemplo, un narrador calmado) y sintetizar texto largo. La salida a 48 kHz es adecuada para publicacion en formato audio.
- **Doblaje y localizacion de contenido**: con soporte declarado de 30 idiomas, se puede generar voz en distintos idiomas manteniendo una referencia de hablante, util para prototipos de localizacion de videos o podcasts.
- **Asistentes de voz integrados en aplicaciones de escritorio**: al ejecutarse sobre llama.cpp con backend CPU, Vulkan o Metal, el modelo puede integrarse en aplicaciones nativas sin dependencia de la nube, siempre que se acepte el caracter experimental.
- **Investigacion en TTS y evaluacion de cuantizacion**: el repositorio incluye metricas comparativas por precision (WER, CER, similitud de hablante, DNSMOS y RTF), lo que lo convierte en un banco de pruebas util para estudiar el impacto de la cuantizacion en modelos de voz.
- **Generacion de voces sinteticas para entornos de test**: crear clips de voz reproducibles con semilla fija (`seed`) para pruebas automatizadas de sistemas de reconocimiento de voz o de pipelines de audio.
- **Despliegue en servidor ligero con `/tts`**: usar `llama-server` para exponer un endpoint HTTP de sintesis de voz en una maquina con RTX 3080 o similar, con CFG 2.0 y 10 pasos de flujo como configuracion de referencia.

## Benchmarks y rendimiento

El autor publica una evaluacion propia sobre un conjunto de 6 frases en ingles y 4 en chino, con semillas 0 y 1, en modo de clonacion de voz con audio de referencia, CFG 2.0 y 10 pasos de flujo, ejecutado con `llama-server` `/tts` sobre CUDA en una RTX 3080 Laptop. Las metricas son WER/CER de la transcripcion de Whisper large-v3-turbo (ingles/chino), similitud de hablante WavLM con el prompt y DNSMOS. El original se evaluo con `voxcpm` 2.0.3 en bf16 sobre CUDA en el mismo modo.

| Precision | Tamano | WER / CER | Similitud hablante | DNSMOS | RTF |
|---|---|---|---|---|---|
| Original (bf16, CUDA) | — | 0,0 % / 0,0 % | 0,970 / 0,909 | 3,08 / 2,67 | no disponible |
| BF16 | 2,95 GB | 0,0 % / 0,0 % | 0,971 / 0,844 | 2,89 / 2,60 | 0,36 (CUDA) |
| F16 | 2,95 GB | 0,0 % / 0,6 % | 0,970 / 0,839 | 2,92 / 2,47 | 0,36 |
| Q8_0 | 1,57 GB | 0,0 % / 0,0 % | 0,973 / 0,844 | 2,86 / 2,65 | 0,34 |
| Q6_K | 1,21 GB | 0,0 % / 0,0 % | 0,971 / 0,846 | 2,80 / 2,68 | 0,33 |
| Q5_K_M | 1,06 GB | 0,0 % / 0,0 % | 0,971 / 0,850 | 2,76 / 2,66 | 0,33 |
| Q4_K_M | 916,0 MB | 0,0 % / 0,0 % | 0,971 / 0,866 | 2,84 / 2,76 | 0,33 |

Criterio de aceptacion definido por el autor: error como maximo 2 puntos por encima del original, similitud como maximo 0,03 por debajo y DNSMOS como maximo 0,2 por debajo. Segun el autor, todos los ficheros quedan por debajo del umbral en clonacion de voz en chino y los cuantizados tambien pierden 0,2-0,3 puntos de DNSMOS en ingles. No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible, lo cual es esperable al tratarse de un modelo TTS.

## Requisitos de hardware

- **VRAM estimada**: el fichero principal va de 916 MB (Q4_K_M) a 2,95 GB (F16/BF16), mas el `mmproj` de 2,01 GB compartido. En total, aproximadamente 2,9 GB para Q4_K_M y 5,0 GB para F16/BF16, sin contar el overhead del runtime.
- **GPU recomendadas**: el autor reporta ejecucion en una RTX 3080 Laptop con CUDA; por tamano, cualquier GPU con 6-8 GB de VRAM deberia poder alojar las variantes cuantizadas. No se dispone de datos de rendimiento en A100 o H100.
- **GPU de consumo**: si, cabe en GPUs de consumo modernas (RTX 3060, 4060, 3080, 4090) segun la precision elegida; Q4_K_M y Q5_K_M son las opciones mas ajustadas.
- **Opciones de despliegue**: llama.cpp build b12621 o superior, con `llama-tts` para CLI y `llama-server` para el endpoint `/tts`. Backends soportados: Metal, CUDA, Vulkan y CPU. No se mencionan vLLM, TGI ni Ollama.
- **Latencia y throughput**: RTF entre 0,33 y 0,36 segun precision en la RTX 3080 Laptop del autor, lo que implica generacion mas rapida que tiempo real en ese hardware. No se dispone de datos de throughput en otras GPUs.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| VoxCPM2-GGUF (este) | 1.471.744.128 | no disponible | 30 (declarados) | Apache-2.0 | GGUF | Conversion experimental; clonacion de voz; rendimiento en llama.cpp |
| VoxCPM2 (original, openbmb) | 2B (declarados por el autor) | no disponible | 30 | Apache-2.0 | safetensors | Referencia de calidad; similitud 0,970 / 0,909 y DNSMOS 3,08 / 2,67 |
| Otros TTS open source comparables | no disponible | no disponible | no disponible | no disponible | no disponible | No se dispone de datos verificables en la informacion proporcionada |

La comparacion con alternativas de la misma categoria (por ejemplo, otros modelos TTS open source con clonacion de voz) no puede completarse con datos verificables a partir de la informacion disponible.

## Limitaciones y advertencias

- **Caracter experimental**: el propio autor declara que todos los ficheros estan por debajo de su umbral de calidad en clonacion de voz en chino; la similitud de hablante cae a 0,84-0,87 frente a 0,91 del original.
- **Perdida de calidad en ingles con cuantizacion**: los ficheros cuantizados pierden 0,2-0,3 puntos de DNSMOS respecto al original en ingles.
- **Causa del gap**: segun el autor, el gap en chino proviene del runtime de VoxCPM2 en llama.cpp (b12621), no de la cuantizacion, ya que el BF16 conserva los pesos originales.
- **Modo de continuacion no soportado**: llama.cpp solo clona a partir de audio de referencia; el modo de continuacion del original (audio de prompt mas transcripcion) no esta disponible.
- **Sesgos**: no se documentan sesgos especificos en la informacion proporcionada; al ser un modelo de voz entrenado sobre datos multilingues a gran escala, es previsible que reproduzca sesgos de los datos de entrenamiento.
- **Riesgo de alucinacion**: no aplica en el sentido de generacion de texto factual, pero existe riesgo de artefactos o errores de pronunciacion en la sintesis; el CER de 0,6 % en F16 para chino indica cierta degradacion.
- **Licencia**: Apache-2.0, permisiva para uso comercial, aunque el autor recuerda que los ficheros son derivados del modelo original y heredan su licencia.
- **Uso responsable**: la clonacion de voz plantea riesgos de suplantacion y deepfakes; no se documentan mecanismos de marca de agua ni de consentimiento en la informacion disponible.
- **Fecha de publicacion**: el repositorio figura creado el 2026-11-22, dato que conviene verificar antes de citarlo en produccion.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/moonbox-dev/VoxCPM2-GGUF
- Modelo base: https://huggingface.co/openbmb/VoxCPM2
- llama.cpp: https://github.com/ggml-org/llama.cpp
- Paper referenciado (arXiv:2509.24650): https://arxiv.org/abs/2509.24650
- Fichero mmproj: https://huggingface.co/moonbox-dev/VoxCPM2-GGUF/blob/main/mmproj-voxcpm2-F16.gguf
- Fichero BF16: https://huggingface.co/moonbox-dev/VoxCPM2-GGUF/blob/main/voxcpm2-BF16.gguf
- Fichero Q8_0: https://huggingface.co/moonbox-dev/VoxCPM2-GGUF/blob/main/voxcpm2-Q8_0.gguf
- Fichero Q6_K: https://huggingface.co/moonbox-dev/VoxCPM2-GGUF/blob/main/voxcpm2-Q6_K.gguf
- Fichero Q5_K_M: https://huggingface.co/moonbox-dev/VoxCPM2-GGUF/blob/main/voxcpm2-Q5_K_M.gguf
- Fichero Q4_K_M: https://huggingface.co/moonbox-dev/VoxCPM2-GGUF/blob/main/voxcpm2-Q4_K_M.gguf
