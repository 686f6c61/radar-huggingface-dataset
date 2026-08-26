# dys-asr/parakeet-tdt-0.6b-sapc1

## Resumen

`dys-asr/parakeet-tdt-0.6b-sapc1` es un modelo de reconocimiento automático del habla (ASR) de 627 millones de parámetros, resultado del fine-tuning de `nvidia/parakeet-tdt-0.6b-v3` sobre el corpus 1 del Speech Accessibility Project (SAPC1). El modelo está especializado en el reconocimiento de habla disártrica y trastornos del habla, un dominio donde los sistemas ASR generalistas suelen fallar. Lo desarrolla el usuario `dys-asr` y se publica bajo la licencia `speech-accessibility-project-dua`, que permite uso comercial con restricciones.

El modelo emplea una arquitectura token-and-duration transducer (TDT), que combina una red de predicción, una red conjunta y una cabeza de duración, y decodifica de forma autorregresiva. Esto lo diferencia de los modelos CTC de la misma familia, que decodifican mediante un argmax sobre los frames. En el conjunto de desarrollo de SAPC1, el modelo consigue un WER del 9,38 % y un CER del 5,84 %, superando en 0,94 puntos de WER a su equivalente CTC entrenado con los mismos datos. Su relevancia radica en que demuestra que los transductores pueden superar a los modelos CTC en habla disorada, un dominio con datos escasos y alta variabilidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Token-and-duration transducer (TDT) con red de predicción, red conjunta y cabeza de duración |
| Parametros totales | 627.057.286 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | Audio de 0,5 a 30 segundos (sin ventana de tokens explicita) |
| Tipos de cuantizacion | No se proporciona información sobre cuantizaciones publicadas |
| Idiomas soportados | Ingles (modelo base multilingue de 25 idiomas, pero el fine-tuning es solo en ingles) |
| Licencia | Speech Accessibility Project DUA (uso comercial restringido, ver limitaciones) |
| Formato de pesos | Safetensors |

## Arquitectura y entrenamiento

El modelo es un transducer TDT, una variante de la familia Parakeet de NVIDIA. A diferencia de los modelos CTC, que decodifican mediante un argmax sobre los frames, el TDT decodifica de forma autorregativa: predice el siguiente token y su duracion mediante una red de prediccion y una cabeza de duracion, respectivamente. La red conjunta materializa un tensor de dimensiones `[batch, frames, labels, vocab]`, que con un vocabulario de 8.192 tokens provoca un alto consumo de memoria durante el entrenamiento.

El fine-tune se realizó sobre el corpus SAPC1 (Speech Accessibility Project), concretamente sobre el split de entrenamiento de 212.054 utterances de 0,5 a 30 s, con etiquetas truncadas a 130 tokens. El entrenamiento usó AdamW con una tasa de aprendizaje de 1e-4 y un programa tri-stage con 10% de warmup y 40% de hold, durante 10 épocas (66.320 actualizaciones). Se empleó precisión mixta bf16 con pesos en float32, batch efectivo de 32 (8 por dispositivo en 2 GPUs con acumulacion de gradiente), layerdrop de 0,05 y recorte de gradiente a 1,0. El WER en un subconjunto fijo de 4.000 utterances bajó de 11,47 % en la epoca 1 a 9,42 % en la epoca 10, sin haber saturado.

## Capacidades

- Reconocimiento de habla disorada y trastuzada: es el objetivo principal del modelo, entrenado con el corpus SAPC1, que incluye habla de personas con parálisis cerebral, esclerosis lateral amiotrófica, enfermedad de Parkinson y otras condiciones.
- Transcripcion de audio en ingles, con salida en minusculas y sin puntuacion (convencion del modelo: los numeros se verbalizan, p. ej. "3" -> "three").
- Decodificacion autorregativa con red de duracion, lo que permite una alineacion temporal implicita aunque sin timestamps explicito.
- Soporte de carga via `transformers>=5.9` con la clase `ParakeetForTDT`, integrable en pipelines de ASR.
- No soporta tool calling, vision ni otros modos multimodales: es exclusivamente un modelo de audio a texto.
- Capacidades multilingues limitadas: el modelo base v3 soporta 25 idiomas, pero el fine-tune se ha realizado solo con datos en ingles, por lo que el rendimiento en otros idiomas no está garantizado.

## Casos de uso

- **Asistentes de voz para personas con disartria**: el modelo puede integrarse en aplicaciones de asistencia por voz (p. ej. domotica, dictado) donde el usuario tiene un habla no estandar. Su WER de 9,38 % en SAPC1 lo convierte en un candidato realista para este tipo de sistemas.
- **Transcripcion medica de consultas y evaluaciones**: en entornos clinicos, las sesiones con pacientes con trastornos del habla pueden transcribirse de forma automatica, facilitando la documentacion medica y el analisis de la evolucion del paciente. El modelo puede funcionar sin un modelo de lenguaje externo, simplificando el despliegue.
- **Sistemas de comunicacion aumentativa y alternativa (CAA)**: usuarios con disartria severa pueden generar texto a partir de su voz para comunicarse con mas rapidez que con un teclado o un sistema de barrido. El modelo es adecuado porque ha sido entrenado con habria real de ese colectivo.
- **Investigacion en fonetica y linguistica clinica**: los investigadores pueden usar el modelo para transcribir corpus de habla disorada y analizar patrones de pronunciacion, errores y evolucion temporal. Su salida en minusculas y sin puntuacion es aceptable para este tipo de analisis.
- **Subtitulacion en entornos de rehabilitacion**: en programas de rehabilitacion del habla, el modelo puede generar subtitulos en tiempo real de las sesiones, permitiendo al paciente y al terapeuta revisar el progreso de forma objetiva.
- **Archivado y busqueda de contenido audiovisual con habla disorada**: cualquier coleccion de audio (podcasts, entrevistas, material de archivo) que contenga habla de personas con disartria puede transcribirse y indexarse para su busqueda. La ventaja del TDT es que no requiere un modelo de lenguaje externo, lo que simplifica el pipeline.

## Benchmarks y rendimiento

Los resultados oficiales declarados por el autor en el modelo-index son los siguientes:

| Dataset | Metrica | Valor |
|---|---|---|
| SAPC1 dev (Speech Accessibility Project) | WER | 9,38 % |
| SAPC1 dev (Speech Accessibility Project) | CER | 5,84 % |

El autor tambien publica una comparativa con el modelo CTC entrenado en el mismo corpus (`dys-asr/parakeet-ctc-0.6b-sapc1`), sobre las 31.114 utterances del dev completo:

| Modelo | WER | CER |
|---|---|---|
| `dys-asr/parakeet-ctc-0.6b-sapc1` | 10,32 % | 6,09 % |
| `dys-asr/parakeet-tdt-0.6b-sapc1` | **9,38 %** | **5,84 %** |

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- **VRAM estimada para inferencia**: el modelo tiene 627 millones de parametros, por lo que en fp32 ocupa aproximadamente 2,5 GB en memoria. En bf16, alrededor de 1,3 GB. Sin embargo, la red conjunta materializa un tensor `[batch, frames, labels, vocab]` con un vocabulario de 8.192 tokens, lo que puede requerir entre 4 y 8 GB de VRAM adicionales para un batch de 1 con audio de 30 segundos, dependiendo de la implementacion.
- **GPU recomendadas**: el autor utilizo una A100 de 80 GB para el entrenamiento. Para inferencia, una GPU con 16 GB de VRAM (p. ej. V100, RTX 4090) deberia ser suficiente para batch 1, pero se recomienda una GPU con 24 GB o mas para batch superiores o audio de larga duracion.
- **Cabe en consumer GPU**: si, en GPUs como la RTX 4090 (24 GB) o la RTX 3090 (24 GB), siempre que se use bf16 y un batch pequeno. En GPUs de 8 GB (p. ej. RTX 3060) podria ser posible con audio corto y batch 1, pero el tensor de la red conjunta puede ser un problema.
- **Opciones de despliegue**: al ser un modelo `transformers`, se puede servir con vLLM (aunque la decodificacion autorregativa no es su punto fuerte), con Hugging Face TGI o con una API personalizada usando `transformers`. Tambien se puede exportar a ONNX para inferencia con TensorRT o ONNX Runtime. No se ha publicado soporte para llama.cpp ni Ollama.
- **Latencia y throughput**: el autor indica que la decodificacion es sustancialmente mas lenta que la de los modelos CTC, aproximadamente 13 veces menos muestras por segundo en entrenamiento y una brecha similar en inferencia. No se proporcionan numeros exactos de latencia por utterance.

## Comparativa con modelos similares

| Modelo | Arquitectura | Parametros | Contexto | WER en SAPC1 dev | Licencia | Formato |
|---|---|---|---|---|---|---|
| `dys-asr/parakeet-tdt-0.6b-sapc1` | TDT | 627 M | 0,5-30 s audio | 9,38 % | Speech Access Project DUA | safetensors |
| `dys-asr/parakeet-ctc-0.6b-sapc1` | CTC | 627 M | 0,5-30 s audio | 10,32 % | Speech Access Project DUA | safetensors |
| `nvidia/parakeet-tdt-0.6b-v2` | TDT | 600 M | 0,5-30 s audio | No publicado en SAPC | Ingles | `.nemo` (sin safetensors) |
| `nvidia/parakeet-tdt-0.6b-v3` | TDT | 600 M | 0,5-30 s audio | No publicado en SAPC | 25 idiomas | safetensors |

El modelo compite directamente con su hermano CTC (`parakeet-ctc-0.6b-sapc1`) y con la base `nvidia/parakeet-tdt-0.6b-v3`. La diferencia clave es que el modelo TDT mejora el WER en 0,94 puntos sobre el CTC, pero a costa de una decodificacion mucho mas lenta. Frente a la v3 de NVIDIA, el fine-tune en SAPC1 es lo que aporta la especializacion en habla disorada, ya que la base general no esta optimizada para ese dominio.

## Limitaciones y advertencias

- **Licencia restrictiva**: la licencia `speech-accessibility-project-dua` no es una licencia open source convencional. Es un acuerdo de uso de datos (DUA) del proyecto Speech Accessibility Project de la Universidad de Illinois. Es imprescindible revisar los terminos completos antes de usar el modelo en produccion o en investigacion comercial.
- **Sesgo de entrenamiento**: el modelo se ha entrenado con el corpus SAPC1, que incluye habla de 580 hablantes en el entrenamiento y 83 en desarrollo. Aunque es un corpus amplio para habla disorada, puede no representar todas las variantes de disartria ni todas las lenguas o acentos.
- **Riesgo de alucinacion**: como cualquier modelo autorregativo, puede generar texto que no corresponde al audio, especialmente en segmentos con ruido o habla muy degradada. La decodificacion autorregativa puede acumular errores.
- **Formato de salida**: el modelo emite texto en minusculas, sin puntuacion y con numeros verbalizados. Esto es una convencion del modelo, no un defecto, pero hay que tenerlo en cuenta al integrarlo en sistemas que esperen texto con formato estandar.
- **Requisito de version**: el modelo requiere `transformers>=5.9`, que es una version muy reciente. Los entornos con versiones anteriores no podran cargar el modelo.
- **Peso de inferencia**: la decodificacion autorregativa es aproximadamente 13 veces mas lenta que la de los modelos CTC comparables, lo que puede ser un problema en aplicaciones de tiempo real o de alto throughput.
- **Rendimiento en otros idiomas**: el fine-tune se ha realizado solo con datos en ingles. El modelo base v3 es multilingue, pero el fine-tune puede haber degradado el rendimiento en otros idiomas, y no hay benchmarks que lo confirmen.
- **Limitacion de duracion de audio**: el modelo se ha entrenado con audio de 0,5 a 30 s. Audio mas largo puede no funcionar correctamente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/dys-asr/parakeet-tdt-0.6b-sapc1
- Modelo base v3: https://huggingface.co/nvidia/parakeet-tdt-0.6b-v3
- Modelo base v2 (solo NeMo): https://huggingface.co/nvidia/parakeet-tdt-0.6b-v2
- Modelo CTC comparado: https://huggingface.co/dys-asr/parakeet-ctc-0.6b-sapc1
- Coleccion Parakeet TDT 0.6B en NGC: https://catalog.ngc.nvidia.com/orgs/nvidia/collections/parakeet-tdt-0.6b
- Pagina del proyecto Speech Accessibility Project: https://speechaccessibilityproject.beckman.illinois.edu/
