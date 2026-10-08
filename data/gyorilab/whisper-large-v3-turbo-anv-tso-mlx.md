# gyorilab/whisper-large-v3-turbo-anv-tso-mlx

## Resumen

whisper-large-v3-turbo-anv-tso-mlx es una conversion al formato MLX (float16) del modelo dsfsi-anv/whisper-large-v3-turbo-anv-tso, un ajuste fino de Whisper large-v3-turbo para xitsonga (tsonga) entrenado por DSFSI sobre el corpus African Next Voices. La conversion la firma gyorilab y mantiene los pesos originales sin modificar: unicamente cambia el contenedor de pesos para que pueda cargarse con mlx-whisper sobre Apple Silicon.

El problema que resuelve es practico. El xitsonga apenas cuenta con modelos de reconocimiento automatico del habla (ASR) de calidad y Whisper no dispone de token de idioma propio para esta lengua: el ajuste fino decodifica bajo el token de suajili (sw), que ademas es lo que la deteccion automatica de Whisper elige para el xitsonga. Esta conversion elimina la friccion de tener que reconvertir el modelo original en un Mac, algo relevante para desarrolladores que trabajan en local con hardware de Apple.

Se trata de un modelo encoder-decoder transformer de aproximadamente 809 millones de parametros (la variante turbo de Whisper, con decodificador reducido a 4 capas frente a las 32 del large-v3 estandar). El repo ocupa 1,6 GB, coherente con pesos en float16, y la licencia es MIT. El modelo fuente y sus datos de entrenamiento son el trabajo original de DSFSI; esta ficha documenta la conversion, no un entrenamiento nuevo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Whisper large-v3-turbo) |
| Parametros totales | Aproximadamente 809 millones (variante turbo de Whisper large-v3) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | Ventanas de audio de 30 segundos (1500 posiciones de encoder); 448 tokens de contexto en el decodificador |
| Tipos de cuantizacion | float16 (unico formato publicado en el repo); MLX permite generar versiones cuantizadas con sus propias herramientas, no incluidas aqui |
| Idiomas soportados | ts (xitsonga); el modelo decodifica bajo el token de suajili (sw) |
| Licencia | MIT |
| Formato de pesos | MLX safetensors (fichero weights.safetensors) |

## Arquitectura y entrenamiento

La arquitectura es la de Whisper large-v3-turbo de OpenAI: un transformer encoder-decoder que procesa espectrogramas Mel (128 bins) en ventanas de 30 segundos y genera texto de forma autorregresiva. La variante turbo reduce el decodificador a 4 capas, lo que rebaja el coste de inferencia respecto al large-v3 completo manteniendo el encoder. El logits de salida son ~51865 para el vocabulario multilingue del modelo base.

Esta publicacion concreta no entrena nada: es una conversion de formato. Segun la model card, los pesos se convirtieron desde la revision `e24387e1183e8a0caa779840677252c317e6a30a` del modelo fuente mediante el script `convert.py` de mlx-examples/whisper, con MLX 0.31.2 y `--dtype float16`. El fichero resultante `model.safetensors` se renombro a `weights.safetensors`, que es el nombre que espera mlx-whisper 0.4. El ajuste fino original para xitsonga fue realizado por DSFSI sobre el corpus African Next Voices; no se detallan en la informacion disponible el numero de horas de audio, la composicion exacta del dataset ni si hubo etapas de RLHF o DPO (Whisper se entrena tipicamente con supervision directa sobre transcripciones).

## Capacidades

- Reconocimiento automatico del habla (ASR) en xitsonga, idioma sin token propio en Whisper.
- Transcripcion de audio en ventanas de 30 segundos, con soporte de audio largo mediante segmentacion y decodificacion por bloques.
- Decodificacion multilingue heredada del modelo base Whisper large-v3-turbo, aunque el ajuste fino esta orientado a xitsonga.
- Deteccion automatica del idioma con posibilidad de forzado explicito del token `sw` para evitar derivas en audio corto.
- Modo de decodificacion larga con control de repetiaciones mediante `condition_on_previous_text=False`.
- Inferencia local en Apple Silicon mediante mlx-whisper.
- No se ha documentado soporte de tool calling, function calling, agentes, vision ni audio mas alla del propio ASR.

## Casos de uso

- Subtitulado de contenido audiovisual en xitsonga: se puede transcribir audio o video en este idioma y generar subtitulos con marcas de tiempo, aprovechando el soporte de decodificacion por segmentos de mlx-whisper.
- Archivado y busqueda de material oral: transcripcion de entrevistas, grabaciones comunitarias o fondos documentales en xitsonga para hacerlos indexables y consultables por texto.
- Aplicaciones de accesibilidad en tiempo real ejecutadas en local: al ser un modelo de ~809 M de parametros en float16 (1,6 GB), cabe en un Mac con memoria unificada y permite dictado o subtitulado sin enviar audio a la nube.
- Investigacion linguistica y documentacion de lenguas minorizadas: generacion de transcripciones base sobre corpus African Next Voices y otros materiales para anotacion posterior.
- Prototipado rapido de ASR en Mac: gracias a la conversion MLX, se puede integrar en scripts de Python o en aplicaciones macOS sin reconvertir el modelo fuente.
- Pipelines de transcripcion por lotes en estaciones de trabajo Apple: procesado nocturno de grandes volumenes de audio con el mismo entorno que se usa para desarrollo.
- Evaluacion comparativa de ASR en lenguas africanas: sirve como referencia frente a Whisper large-v3-turbo sin ajustar, midiendo el efecto del fine-tune en xitsonga.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del repositorio no incluye WER, MMLU ni ninguna otra metrica, ni comparaciones cuantitativas con modelos alternativos.

## Requisitos de hardware

- VRAM estimada: no aplica en el sentido tradicional; MLX usa memoria unificada. Los pesos en float16 ocupan aproximadamente 1,6 GB, por lo que se necesita al menos esa cantidad mas el margen para activaciones y buffers de audio.
- GPU recomendadas: hardware Apple Silicon (familias M1, M2, M3, M4 y posteriores). No hay soporte CUDA documentado para esta conversion.
- Encaje en GPU de consumo: si, en cualquier Mac con memoria unificada de 8 GB o superior. En equipos con 8 GB puede haber presion de memoria si se ejecutan otras aplicaciones en paralelo; 16 GB es un margen comodo.
- Despliegue: mlx-whisper 0.4 o superior, sobre el stack MLX (MLX 0.31.2 fue la version usada en la conversion). No aplica vLLM, llama.cpp ni TGI, que no consumen pesos MLX.
- Latencia y throughput: no disponible en la informacion proporcionada. La variante turbo reduce el decodificador a 4 capas, lo que en la practica se traduce en una inferencia notablemente mas rapida que Whisper large-v3, pero no se han publicado cifras concretas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto de audio | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| gyorilab/whisper-large-v3-turbo-anv-tso-mlx | ~809 M | 30 s por ventana | ts (decodifica como sw) | MIT | MLX safetensors (float16) |
| dsfsi-anv/whisper-large-v3-turbo-anv-tso | ~809 M | 30 s por ventana | ts (decodifica como sw) | MIT | safetensors (formato original) |
| openai/whisper-large-v3-turbo | ~809 M | 30 s por ventana | ~99 idiomas | MIT | safetensors, GGUF y otras conversiones de la comunidad |
| openai/whisper-large-v3 | ~1550 M | 30 s por ventana | ~99 idiomas | MIT | safetensors, GGUF y otras conversiones de la comunidad |

Comparado con el modelo fuente, esta version solo cambia el contenedor de pesos: mismas capacidades, mismo rendimiento esperado, pero lista para mlx-whisper. Frente a Whisper large-v3-turbo sin ajustar, la diferencia es la especializacion en xitsonga, que es precisamente el motivo de ser del fine-tune de DSFSI. No se dispone de datos de WER para cuantificar esa mejora.

## Limitaciones y advertencias

- El modelo se limita practicamente al xitsonga. Aunque hereda el comportamiento multilingue de Whisper large-v3-turbo, el ajuste fino esta orientado a esa lengua y puede degradar la calidad en otros idiomas.
- Whisper no tiene token de xitsonga: hay que forzar `language="sw"` explicitamente. Si se deja la deteccion automatica, en audios cortos el idioma detectado puede variar y producir transcripciones incorrectas.
- Con audio largo puede aparecer el bucle de repeticion tipico de Whisper; la model card recomienda `condition_on_previous_text=False` para mitigarlo.
- Riesgo de alucinacion: Whisper tiende a generar texto plausible en segmentos con ruido, silencio o musica. No hay informacion especifica sobre el comportamiento de este ajuste en esos casos.
- Sesgos: no se documentan sesgos conocidos ni la composicion demografica del corpus African Next Voices en la informacion disponible.
- La licencia MIT es permisiva y permite uso comercial, pero el credito del modelo corresponde a los autores originales de DSFSI y al dataset African Next Voices; conviene citarlos.
- El repo tiene 0 descargas y 0 likes en el momento de la consulta: es una publicacion reciente y sin validacion externa conocida.
- Solo hay pesos float16. Quien necesite cuantizacion de 4 u 8 bits tendra que generarla por su cuenta con las herramientas de MLX.
- No hay soporte CUDA documentado: fuera del ecosistema Apple Silicon, esta conversion no es utilizable tal cual.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/gyorilab/whisper-large-v3-turbo-anv-tso-mlx
- Modelo fuente: https://huggingface.co/dsfsi-anv/whisper-large-v3-turbo-anv-tso
- Dataset African Next Voices: https://huggingface.co/datasets/dsfsi-anv/za-african-next-voices
- Repositorio MLX: https://github.com/ml-explore/mlx
- Ejemplos de Whisper en MLX (script convert.py): https://github.com/ml-explore/mlx-examples/tree/main/whisper
