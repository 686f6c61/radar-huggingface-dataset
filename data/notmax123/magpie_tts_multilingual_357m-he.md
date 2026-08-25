# notmax123/magpie_tts_multilingual_357m-he

## Resumen

notmax123/magpie_tts_multilingual_357m-he es un ajuste fino (fine-tune) en hebreo del modelo de síntesis de voz multilingüe de NVIDIA, magpie_tts_multilingual_357m, desarrollado por el usuario independiente notmax123. El modelo resuelve la falta de soporte de hebreo en el modelo base, que originalmente cubre doce idiomas pero no esta lengua. Su relevancia radica en que permite generar voz hebrea natural a partir de fonemas IPA, sin necesidad de un sistema de conversión de grafema a fonema (G2P) integrado, lo que lo hace útil para desarrolladores que ya disponen de una tubería de fonemización.

El modelo mantiene la arquitectura transformer encoder-decoder del modelo base, con 357 millones de parametros, y anade 15 voces hebreas nuevas ademas de las 5 originales de NVIDIA. La entrada es fonetica IPA (alfabeto fonetico internacional), no caracteres hebreos, y el modelo se distribuye como un checkpoint de NeMo de 2,9 GB. Aunque el entrenamiento se realizo con datos sinteticos, el ajuste fino preserva el rendimiento en otros idiomas, con un WER en ingles identico al modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (TTS) |
| Parametros totales | 357 millones |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (entrada de fonemas IPA variable) |
| Tipos de cuantizacion | No disponible (checkpoint NeMo, probablemente FP32/FP16) |
| Idiomas soportados | Hebreo (fine-tune); el modelo base soporta 11 idiomas mas |
| Licencia | NVIDIA Open Model License |
| Formato de pesos | NeMo checkpoint (.ckpt) + hparams.yaml |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura del MagpieTTS de NVIDIA: un transformer encoder-decoder con 357 millones de parametros que predice unidades de audio discretas a partir de una secuencia de fonemas. En este fine-tune, se elimino el `context_encoder` del checkpoint base por razones de seguridad (NVIDIA elimino la clonacion de voz), y se sustituyo por una tabla de embeddings de hablante horneados. Se anadieron 15 nuevas voces hebreas entrenadas con LoRA, manteniendo las 5 voces originales de NVIDIA intactas.

El entrenamiento se realizo con 1,3 millones de utterances hebreas sinteticas, generadas mediante sistemas TTS y verificadas por ASR. La entrada se limita a 27 simbolos IPA: consonantes, vocales y signos de puntuacion basicos. El proceso incluye un paso de extension de vocabulario para anadir fonemas de prestamos, pero con resultados limitados, como se documenta en las limitaciones.

## Capacidades

- Sintesis de voz en hebreo a partir de fonemas IPA (no acepta texto hebreo directamente).
- Seleccion de voz mediante indice `--speaker-index`: 5 voces originales de NVIDIA (indices 0-4) y 15 voces hebrev nuevas (indices 5-19).
- Control de voz estable: cada indice produce una voz distinta y reproducible, con similaridad intra-voz de 0,74-0,80 y entre voces de 0,11-0,27.
- Soporte de puntuacion basica (`.`, `,`, `?`, `!`) para controlar la entonacion.
- Compatibilidad con el resto de idiomas del modelo base: el rendimiento en ingles se mantiene igual (WER del 4,2%).
- No soporta clonacion de voz; la referencia de audio (`--context-audio`) es ignorada y no afecta a la voz generada.

## Casos de uso

- **Audiolibros en hebreo**: se puede generar narracion de larga duracion con voces consistentes, eligiendo el indice de hablante adecuado para cada capitulo o personaje.
- **Asistentes de voz para aplicaciones**: integracion en asistentes de voz para hebreo, con entrada de fonemas generada por un G2P externo como RenikudPlus.
- **Contenido educativo**: creacion de ejercicios de pronunciacion o material didactico de hebreo como lengua extranjera, con multiples voces para practicar.
- **Doblaje de videos**: generacion de voces hebrev para videos o podcasts, usando indices de hablante especificos para cada papel.
- **Sistemas IVR de atencion al cliente**: respuestas de voz automatizadas en hebreo para menus de telefono, con opcion de cambiar la voz por indice.
- **Prototipado rapido**: desarrollo de aplicaciones de voz en hebreo sin necesidad de grabar audio real, integrando el modelo en un pipeline de inferencia con NeMo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks numericos en la informacion disponible. La model card incluye un grafico de WER (word error rate) en fonemas IPA sobre 1.525 utterances de test del dataset Phonikud/ILSpeech, evaluado con el reconocedor `whisper-he-ipa`, pero no se proporciona el valor exacto. Se menciona que el WER en ingles es identico al del modelo base (4,2%), lo que indica que el fine-tune no degrada otros idiomas.

## Requisitos de hardware

- **VRAM estimada**: con 357 millones de parametros, en FP32 se requieren aproximadamente 1,4 GB solo para los pesos; en FP16 se reduce a unos 0,7 GB. Con overhead de activaciones y el pipeline de audio, se recomienda al menos 4 GB de VRAM para inferencia.
- **GPU recomendadas**: cualquier GPU con soporte CUDA de 8 GB o mas (RTX 3060, RTX 3090, A100, H100) deberia ser suficiente. El modelo base se ha probado en GPU de NVIDIA en la plataforma NIM.
- **Despliegue**: se usa el framework NeMo para la inferencia; el codigo de entrenamiento incluye `scripts/infer_hebrew.py` que acepta `--gpu` para seleccionar el dispositivo. No se menciona soporte para llama.cpp, vLLM o Ollama, ya que es un modelo TTS, no un LLM.
- **Latencia**: no se proporcionan datos de latencia en la documentacion. Para una sintesis de voz tipica, se espera una generacion en tiempo real o superior en GPU moderna, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Idiomas | Contexto | Licencia | Notas |
|---|---|---|---|---|---|
| `notmax123/magpie_tts_multilingual_357m-he` | 357M | Hebreo (fine-tune) | IPA | NVIDIA Open Model | Sin clonacion de voz, entrada fonetica |
| `nvidia/magpie_tts_multilingual_357m` | 357M | 11 idiomas (no hebreo) | Texto | NVIDIA Open Model License | Modelo base, con clonacion de voz eliminada en versiones posteriores |
| Coqui XTTS v2 | ~460M | 17 idiomas | Texto | Coqui Public Model License | Soporta clonacion de voz, pero no tiene hebreo |

No se dispone de datos de rendimiento comparativo publicados para estos modelos en tareas de TTS en hebreo. La comparativa se basa en parametros y capacidades documentadas.

## Limitaciones y advertencias

- **Entrada exclusivamente en IPA**: el modelo no acepta texto hebreo; requiere fonemizacion externa. No hay G2P integrado.
- **Sin clonacion de voz**: el `context_encoder` se ha eliminado por razones de seguridad; el audio de referencia no tiene efecto sobre la voz generada.
- **Fonemas de prestamos limitados**: los fonemas `w`, `ʒ` y `dʒ` no se han entrenado correctamente y producen errores de pronunciacion. Solo `tʃ` funciona de forma fiable.
- **Datos de entrenamiento sinteticos**: la naturalidad de las voces esta limitada por la calidad de los sistemas TTS usados para generar los datos, que se verificaron con ASR, no con grabaciones de estudio.
- **Licencia**: la NVIDIA Open Model License permite uso comercial, pero requiere revision de los terminos especificos, especialmente en despliegues en la nube.
- **Riesgo de alucinaciones**: aunque es un TTS, la sintesis puede producir errores de pronunciacion en nombres propios o palabras no cubiertas por el vocabulario IPA entrenado.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/notmax123/magpie_tts_multilingual_357m-he)
- [Modelo base de NVIDIA](https://huggingface.co/nvidia/magpie_tts_multilingual_357m)
- [Codigo de entrenamiento e inferencia (GitHub)](https://github.com/maxmelichov/magpie_tts_multilingual_357m-he)
- [RenikudPlus (G2P para hebreo)](https://huggingface.co/notmax123/RenikudPlus)
- [Pagina del modelo en NVIDIA NIM](https://build.nvidia.com/nvidia/magpie-tts-multilingual)
