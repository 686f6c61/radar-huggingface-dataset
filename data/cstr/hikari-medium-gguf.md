# cstr/hikari-medium-GGUF

## Resumen

Hikari-medium es un modelo de traduccion simultanea de voz y reconocimiento automatico del habla (ASR) en streaming, desarrollado por SB Intuitions y distribuido en este repositorio como conversion al formato GGUF/ggml por el usuario cstr. Se trata de un encoder-decoder basado en Whisper-medium, pero con un encoder causal: cada 80 ms de audio el modelo decide si emite el siguiente token o espera, lo que permite traducir mientras el hablante aun esta hablando. Traduce voz en ingles a texto en aleman, japones o ruso, y tambien realiza transcripcion de ingles.

El modelo base (`sbintuitions/hikari-medium`) consta de 763.799.648 parametros (~764 M), una cifra coherente con la arquitectura Whisper-medium. Esta repositorio concreto no aporta pesos nuevos: es una conversion de formato pensada para su uso con el motor CrispASR mediante el backend `--backend hikari`. La relevancia de la ficha esta en que permite ejecutar traduccion simultanea de voz localmente, con licencia MIT y ficheros que caben en GPUs de consumo o incluso en CPU.

La publicacion incluye ficheros en f16 y q8_0, junto con un modelo de deteccion de actividad de voz (Silero VAD) que es obligatorio para el funcionamiento correcto de la politica de espera del modelo. No se publica cuantizacion q4_k porque degrada el encoder de forma inaceptable.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder-decoder tipo Whisper-medium con encoder causal (transformer) |
| Parametros totales | 763.799.648 (~764 M) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo de voz; procesa audio en pasos de 80 ms) |
| Tipos de cuantizacion | f16, q8_0 (q4_k no publicado: rompe el encoder, cos_min 0.36) |
| Idiomas soportados | en (entrada y transcripcion), de, ja, ru (salida de traduccion) |
| Licencia | MIT |
| Formato de pesos | GGUF (ggml); fichero auxiliar Silero VAD en formato binario ggml |

## Arquitectura y entrenamiento

La arquitectura es un transformer encoder-decoder derivado de Whisper-medium, con la diferencia clave de que el encoder es causal. Ese encoder causal permite que el modelo procese el audio de forma incremental: en lugar de necesitar la frase completa, evalua cada bloque de 80 ms y aplica una politica de decision sobre si emitir el siguiente token de texto o seguir esperando mas audio. Esa politica de espera se apoya en la probabilidad de voz proporcionada por Silero VAD; sin ese fichero auxiliar, el modelo apenas emite tokens.

No se dispone en la informacion proporcionada de detalles sobre el volumen de datos de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF o DPO. Tampoco se detallan innovaciones adicionales mas alla del encoder causal y la estrategia de emision por pasos. El paper asociado es arXiv:2603.11578 y el codigo de referencia esta en el repositorio `sbintuitions/hikari`.

## Capacidades

- Traduccion simultanea de voz de ingles a aleman, japones o ruso, emitiendo texto mientras el hablante continua hablando.
- Transcripcion de voz en ingles (omitiendo el parametro `-tl`).
- Procesamiento de audio en streaming con pasos de 80 ms y decision de emision incremental.
- Integracion con deteccion de actividad de voz (VAD) mediante Silero v6.2.0 para gobernar la politica de espera.
- Ejecucion en CPU y en Metal (Apple), con verificacion de paridad frente a la implementacion de referencia en PyTorch.
- Soporte de modo por lotes (fichero de audio) y modo en vivo (`--stream`).
- No se documentan capacidades de tool calling, function calling, agentes, vision, audio de salida ni modo de razonamiento explicito.

## Casos de uso

- Subtitulado simultaneo de charlas y conferencias: el modelo traduce ingles a aleman, japones o ruso en tiempo casi real, lo que permite mostrar subtitulos mientras el ponente habla sin esperar al final de cada frase.
- Traduccion en directo para reuniones internacionales: con `--stream --tr-tl de` el texto traducido aparece de forma continua, adecuado para equipos distribuidos que necesitan seguir una reunion en su idioma.
- Generacion de subtitulos para contenido en ingles: la transcripcion mono-idioma sirve para producir subtitulos en ingles de videos o podcasts sin dependencias de servicios en la nube, gracias a la licencia MIT.
- Procesamiento por lotes de archivos de audio: para transcribir o traducir bibliotecas de grabaciones de forma local, con ficheros f16 de 1,53 GB que caben en equipos modestos.
- Investigacion en traduccion simultanea: al ser una conversion de pesos con comparacion por etapas frente a una referencia, resulta util como banco de pruebas reproducible de politicas de emision y del efecto de la cuantizacion en un encoder causal.
- Despliegue en entornos con requisitos de privacidad: al ejecutarse localmente y sin llamadas a APIs externas, encaja en escenarios donde el audio no puede salir del equipo, como grabaciones medicas o legales en ingles.
- Experimentacion con VAD y politicas de streaming: el acoplamiento con Silero VAD y el parametro de penalizacion de espera permiten estudiar el equilibrio entre latencia y calidad de traduccion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, WER, BLEU u otros) en la informacion disponible. La model card unicamente aporta datos de fidelidad frente a la implementacion de referencia en PyTorch, comparando etapa por etapa con la herramienta `crispasr-diff hikari`:

| Clip (en->de) | mel | encoder cos_min | decoder logits cos_min | pasos de streaming | texto |
|---|---|---|---|---|---|
| jfk.wav (11 s) | 1.000000 | 0.99978 | 0.99956 (argmax 164/164) | 161/161 | identico |
| jfk 0-4 s | 1.000000 | 0.99961 | 0.99996 (51/51) | 48/48 | identico |

Para el fichero `hikari-medium-q8_0.gguf` la model card indica mismo texto en jfk (159/161 pasos); en Apple Metal cambio una frase alemana de un clip de 27 s, mientras que en CPU no. El fichero f16 se describe como exacto frente a la referencia.

En cuanto a velocidad, sobre un Apple M1 con Metal se reporta 1,8 s de computo por segundo de audio (aproximadamente 87 ms de encoder y 58 ms de decoder por cada paso de 80 ms), mas lento en CPU, por lo que no alcanza aun tiempo real en ese hardware. Upstream sirve el modelo en A100/H100.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1,6-2 GB con f16 (pesos de 1,53 GB mas overhead) y alrededor de 1-1,2 GB con q8_0 (873 MB de pesos); hay que anadir el pequeno fichero de Silero VAD (0,9 MB).
- GPU recomendadas: A100 o H100 segun el despliegue de referencia de upstream; para ejecucion local basta una GPU de gama media o integrada, dado el reducido tamano del modelo.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU de consumo con 2 GB de VRAM libre o mas; tambien se ha validado en Apple Metal (M1).
- Opciones de despliegue: CrispASR con `--backend hikari` (compilacion via CMake). No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, ya que es un backend especifico de voz y no un modelo de texto generico.
- Latencia y throughput: en Apple M1 con Metal, 1,8 s de computo por segundo de audio, con 87 ms de encoder y 58 ms de decoder por paso de 80 ms. En CPU es mas lento. Se espera mejor rendimiento en GPUs mas rapidas.
- Requisito adicional: el fichero `ggml-silero-v6.2.0.bin` es necesario; sin su probabilidad de voz, la politica de espera apenas emite tokens.

## Comparativa con modelos similares

| Modelo | Parametros | Enfoque | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| cstr/hikari-medium-GGUF | ~764 M | Traduccion simultanea en streaming, encoder causal | en, de, ja, ru | MIT | GGUF (f16, q8_0) |
| sbintuitions/hikari-medium | ~764 M | Modelo base, misma arquitectura | en, de, ja, ru | MIT | Pesos PyTorch (original) |
| OpenAI Whisper-medium | ~769 M (dato publico general) | ASR y traduccion offline con encoder no causal | multilingue | MIT | safetensors, GGUF (comunidad) |

La diferencia funcional principal frente a Whisper-medium es el caracter causal del encoder: Whisper funciona en modo offline y necesita la frase completa, mientras que hikari-medium emite tokens de forma incremental, lo que habilita la traduccion simultanea. No se dispone de datos de benchmarks comparativos de calidad (WER/BLEU) entre estos modelos en la informacion proporcionada, por lo que la comparacion de rendimiento queda como no disponible.

## Limitaciones y advertencias

- La traduccion simultanea introduce una latencia intrinseca y puede degradar la calidad respecto a un enfoque offline, ya que el modelo debe decidir cuando emitir sin conocer el final de la frase.
- El fichero q8_0 mostro discrepancias menores frente a la referencia (un cambio de frase en Metal en un clip de 27 s); el f16 se describe como exacto.
- No se publica cuantizacion q4_k: degrada el encoder (cos_min 0.36) y altera el texto.
- La dependencia de Silero VAD es obligatoria; sin el fichero, el modelo casi no emite tokens.
- Cobertura de idiomas limitada: solo entrada en ingles y salida en aleman, japones o ruso (o transcripcion en ingles). No hay soporte de espanol ni de otras lenguas.
- No alcanza tiempo real en Apple M1 (1,8 s de computo por segundo de audio); en CPU es aun mas lento.
- El repositorio no registra descargas ni likes, y la fecha indicada de creacion es 2026-10-06, lo que sugiere un artefacto reciente y poco validado por la comunidad.
- Riesgo de alucinacion o de traducciones incorrectas no cuantificado: no se aportan metricas de calidad sobre corpus amplios.
- Licencia MIT, sin restricciones conocidas para uso comercial, pero conviene verificar la licencia del modelo base y del codigo asociado antes de desplegar en produccion.
- Al ser una conversion de formato, la responsabilidad sobre el comportamiento queda ligada a la implementacion de CrispASR y a sus dependencias.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/cstr/hikari-medium-GGUF
- Modelo base: https://huggingface.co/sbintuitions/hikari-medium
- Paper: https://arxiv.org/abs/2603.11578
- Codigo upstream: https://github.com/sbintuitions/hikari
- Motor CrispASR: https://github.com/CrispStrobe/CrispASR
