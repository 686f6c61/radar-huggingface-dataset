# lukasz-staniszewski/stable-audio-caa-mood

## Resumen

`lukasz-staniszewski/stable-audio-caa-mood` no es un modelo generativo completo, sino un conjunto de vectores de steering calculados mediante contrastive activation addition (CAA) para el concepto "mood" sobre Stable Audio Open 1.0 de Stability AI. El artefacto se publica con la libreria `audio-interv` y se aplica en tiempo de inferencia, modificando las activaciones internas del transformer de difusion sin reentrenar ni ajustar los pesos del modelo base.

El problema que resuelve es el control fino de atributos globales en la generacion de audio: en lugar de depender unicamente del prompt de texto, el usuario puede modular la direccion de activacion asociada a "mood" con un parametro escalar (`alpha`). Esto es relevante para investigacion en interpretabilidad y para flujos de produccion que necesitan reproducibilidad y control sin asumir el coste de un fine-tuning.

El artefacto esta vinculado al paper "TADA! Tuning Audio Diffusion Models through Activation Steering" (arXiv:2602.11910). El repositorio ocupa 3,0 GB, no tiene descargas ni likes, y no se declara licencia ni pipeline. La intervencion se aplica sobre las capas de cross-attention (`attn2`) de los 24 bloques del transformer.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No aplica al artefacto. Se aplica sobre el DiT (diffusion transformer) de Stable Audio Open 1.0, con cross-attention en los 24 bloques transformer |
| Parametros totales | no disponible (el repositorio ocupa 3,0 GB sin desglose de contenido) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (la configuracion de generacion usa `float16`) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | no disponible (se carga con `StableAudioCAASteeringController.from_pretrained`) |
| Modelo base | `stabilityai/stable-audio-open-1.0` |
| Tipo de artefacto | Vectores de steering (CAA) + controlador |
| Metodo | `standard_caa_stable_audio` (contrastive activation addition) |
| Concepto intervenido | `mood` |
| Capas intervenidas | `.transformer.transformer_blocks.{0..23}.attn2` (`layers_preset: all`) |
| Normalizacion del vector | `normalize_sv: true` |
| Intensidad de steering | `alpha=1.0` en el ejemplo de uso |
| Pasos de inferencia | 100 |
| Duracion de audio | 10,0 s |
| Guidance scale | 7.0 |
| Seed de referencia | 10 (quickstart) / 0 (ejemplo de codigo) |
| dtype y device | `float16`, `cuda` |
| Registro de pasadas CFG | `save_all_cfg_passes: true` |
| Libreria | `audio-interv` |
| Tamano del repositorio | 3,0 GB |
| Descargas / likes | 0 / 0 |
| Fecha de creacion / actualizacion | 2026-09-10 / 2026-09-10 |

## Arquitectura y entrenamiento

El artefacto no entrena pesos nuevos. Se apoya en Stable Audio Open 1.0, un modelo de difusion latente en el espacio de audio cuyo denoiser es un transformer (DiT) con cross-attention para la condicion de texto. El controlador intercepta las activaciones de las capas `attn2` de los 24 bloques y les suma un vector de direccion calculado de forma contrastiva, normalizado (`normalize_sv: true`) y escalado por `alpha`. El identificador de metodo registrado es `standard_caa_stable_audio`, y la configuracion activa el guardado de todas las pasadas de classifier-free guidance (`save_all_cfg_passes: true`), lo que sugiere que el pipeline esta pensado tambien para analisis de activaciones.

La informacion disponible no detalla el conjunto de prompts contrastivos empleados para derivar el vector de "mood", ni el numero de pares, ni el corpus de audio utilizado, ni si hubo algun tipo de evaluacion humana o automatica del efecto. Tampoco se especifica si la direccion se calculo a partir del encoder de texto, de las activaciones de cross-attention o de ambas. Todos estos extremos quedan como "no disponible".

## Capacidades

- Modulacion del atributo "mood" en la generacion de audio de Stable Audio Open 1.0 mediante un unico escalar (`alpha`), sin reentrenamiento.
- Aplicacion simultanea sobre las 24 capas `attn2` del transformer, con presets de capas (`layers_preset: all`).
- Generacion de audio de 10,0 s condicionada por prompt de texto (`"instrumental music"` en el ejemplo), con 100 pasos de difusion y `guidance_scale` 7.0.
- Reproducibilidad mediante `seed` fija.
- Instrumentacion para interpretabilidad: guardado de todas las pasadas de CFG.
- Compatibilidad declarada con CUDA y `float16`.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso, vision, audio de entrada ni modo "thinking": no aplica a este tipo de artefacto.

## Casos de uso

- Generacion musical con control de atmosfera sin reentrenar: un estudio puede producir varias versiones del mismo fragmento variando `alpha` para ajustar la intensidad emocional, manteniendo fijo el `seed` y el prompt para aislar el efecto del steering.
- Prototipado de bandas sonoras para videojuegos o video: con clips de 10,0 s y 100 pasos de inferencia, se pueden generar variaciones de mood de forma rapida para validar direccion artistica antes de encargar produccion final.
- Investigacion en interpretabilidad de modelos de difusion de audio: la configuracion `save_all_cfg_passes: true` permite registrar activaciones por pasada y estudiar como la direccion de "mood" se propaga por las 24 capas `attn2`.
- Comparativas metodologicas de tecnicas de steering: el artefacto sirve como referencia reproducible (metodo `standard_caa_stable_audio`, vector normalizado) frente a otras tecnicas de intervencion sobre el mismo modelo base.
- Aumento de datos con variacion controlada: para entrenar clasificadores o sistemas de recuperacion musical, se pueden generar lotes con el mismo contenido y distinto mood cambiando solo `alpha`.
- Auditoria de robustez del muestreo: al fijar `seed` y variar el steering, se puede medir si la intervencion altera la fidelidad al prompt o la estabilidad de la generacion (no hay evaluacion publicada al respecto).
- Docencia y divulgacion: ejemplo minimo de CAA aplicado a audio, con API de contexto (`with model.steer(ctrl):`), adecuado para explicar intervencion en activaciones frente a fine-tuning.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas objetivas (FAD, CLAP, similitud con el prompt, evaluacion humana) ni comparaciones cuantitativas con el modelo base sin steering.

## Requisitos de hardware

- No se declaran requisitos de hardware en la informacion proporcionada.
- La configuracion de generacion fija `device: cuda` y `dtype: float16`; no se documenta soporte de CPU ni de otras precisiones.
- Estimacion derivada de los datos disponibles (no confirmada por el autor): el repositorio ocupa 3,0 GB y la inferencia se hace en `float16`, por lo que el espacio de pesos esta en el orden de varios GB y el consumo de VRAM estara dominado por el modelo base y las activaciones intermedias. Cifras concretas de VRAM: no disponibles.
- GPU recomendadas: no disponible.
- Viabilidad en GPU de consumo: no disponible.
- Opciones de despliegue: no se documenta integracion con vLLM, llama.cpp, Ollama ni TGI (no aplican a difusion de audio). El quickstart importa `SteerableStableAudioModel` y `StableAudioCAASteeringController` desde `src.steering`, lo que apunta a codigo del propio proyecto mas que a un paquete distribuido por PyPI.
- Latencia y throughput: no disponibles. Los unicos parametros conocidos son 100 pasos de inferencia y 10,0 s de audio generado.

## Comparativa con modelos similares

| Alternativa | Naturaleza | Control de mood | Parametros | Licencia | Datos disponibles |
|---|---|---|---|---|---|
| `lukasz-staniszewski/stable-audio-caa-mood` | Vectores de steering CAA sobre Stable Audio Open 1.0 | Si, via `alpha` sobre 24 capas `attn2` | no disponible (repo de 3,0 GB) | no disponible | Los de esta ficha |
| `stabilityai/stable-audio-open-1.0` sin steering | Modelo de difusion de audio completo | Solo mediante prompt de texto | no disponible en la informacion proporcionada | no disponible en la informacion proporcionada | No se aportan metricas comparativas |
| Fine-tuning tipo LoRA sobre el mismo modelo base | Adaptacion de pesos | Si, pero requiere entrenamiento y un adaptador por concepto | no disponible | no disponible | No se aportan metricas comparativas |
| Ingenieria de prompts sobre el mismo modelo base | Sin modificacion del modelo | Si, mediante redaccion del prompt | no aplica | no disponible | No se aportan metricas comparativas |

La informacion proporcionada no incluye modelos comparables con datos verificables ni resultados de evaluacion que permitan establecer una comparacion cuantitativa.

## Limitaciones y advertencias

- No es un modelo autonomo: requiere descargar y ejecutar `stabilityai/stable-audio-open-1.0` con sus propios requisitos de recursos y su propia licencia.
- La licencia del artefacto no esta declarada, por lo que el uso comercial queda sin definir en la informacion disponible. Es imprescindible revisar la licencia del modelo base antes de cualquier despliegue en produccion.
- Cero descargas y cero likes: no hay validacion por parte de la comunidad ni evidencia de uso en terceros.
- Ausencia total de benchmarks: no se ha medido si el steering modifica la fidelidad al prompt, la calidad percibida del audio o la diversidad de las muestras.
- No se documenta que prompts contrastivos generaron el vector, por lo que no puede saberse con precision que direccion semantica captura "mood" ni si es estable entre dominios musicales.
- El concepto esta etiquetado en ingles (`mood`); no se declaran idiomas soportados y se desconoce el comportamiento con prompts en castellano.
- `alpha=1.0` es solo el valor del ejemplo. La intensidad del efecto no esta caracterizada y no hay guia sobre rangos seguros.
- La intervencion afecta a las 24 capas `attn2` de forma simultanea; no se documenta el efecto de intervenir solo un subconjunto.
- El quickstart importa desde `src.steering`, sin instrucciones de instalacion ni repositorio de codigo enlazado, lo que puede dificultar la reproduccion.
- El repositorio de 3,0 GB no desglosa su contenido; se desconoce si incluye pesos del pipeline, muestras de audio o checkpoints intermedios.
- Riesgo de sesgos y de alucinacion acustica heredado del modelo base: no se documenta ningun analisis al respecto.
- Compatibilidad futura: las rutas de capa (`transformer.transformer_blocks.N.attn2`) estan ligadas a la implementacion concreta del modelo base y pueden romperse con actualizaciones del codigo.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/lukasz-staniszewski/stable-audio-caa-mood
- Paper (HuggingFace Papers): https://huggingface.co/papers/2602.11910
- Paper (arXiv): https://arxiv.org/abs/2602.11910
- Modelo base referenciado en la configuracion: https://huggingface.co/stabilityai/stable-audio-open-1.0
- La busqueda web realizada no devolvio ningun resultado relevante para este modelo; el resto de enlaces no esta disponible.
