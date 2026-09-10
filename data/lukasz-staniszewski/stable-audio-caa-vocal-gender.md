# lukasz-staniszewski/stable-audio-caa-vocal-gender

## Resumen

`lukasz-staniszewski/stable-audio-caa-vocal-gender` no es un modelo generativo completo, sino un conjunto de vectores de direccionamiento (steering vectors) calculados mediante adicion contrastiva de activaciones (CAA, contrastive activation addition) para el concepto `vocal_gender` sobre el modelo de difusion de audio Stable Audio Open. Lo publica el usuario lukasz-staniszewski y se distribuye bajo la libreria `audio-interv`, con un repositorio de 3,0 GB.

El artefacto permite modificar el comportamiento del modelo base `stabilityai/stable-audio-open-1.0` durante la inferencia, interviniendo las activaciones de las capas de atencion cruzada (`attn2`) de los 24 bloques del transformer, sin necesidad de reentrenar ni aplicar ajuste fino. El objetivo es el control interpretable y desacoplado de un atributo perceptual concreto, el genero vocal percibido, en la musica generada.

Es relevante en el contexto de la investigacion en interpretabilidad y control de modelos de difusion: la tecnica CAA ofrece una via de edicion de concepto de coste computacional bajo, reproducible mediante una semilla fija y compatible con el pipeline estandar de generacion. El trabajo asociado se referencia como "TADA! Tuning Audio Diffusion Models through Activation Steering" (arXiv:2602.11910).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vectores de direccionamiento CAA aplicados sobre el transformer de difusion latente de `stabilityai/stable-audio-open-1.0` (24 bloques, capas `attn2`) |
| Parametros totales | no disponible (el repositorio contiene vectores de direccionamiento, no pesos de un modelo completo; el recuento de parametros del modelo base no se especifica en la informacion disponible) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica; el config de generacion usa `audio_length_in_s = 10.0` y el limite maximo depende del modelo base |
| Tipos de cuantizacion | no disponible; el config de generacion declara `dtype: float16` en `cuda` |
| Idiomas soportados | no disponible (no aplica a generacion de audio musical) |
| Licencia | no disponible |
| Formato de pesos | no disponible (el repositorio indica la libreria `audio-interv`; no se detalla el formato de serializacion) |
| Modelo base | `stabilityai/stable-audio-open-1.0` |
| Concepto intervenido | `vocal_gender` |
| Metodo | `standard_caa_stable_audio` |
| Capas intervenidas | 24 capas, de `.transformer.transformer_blocks.0.attn2` a `.transformer.transformer_blocks.23.attn2`, con `layers_preset: all` |
| Normalizacion del vector | `normalize_sv: true` |
| Config de generacion | `num_inference_steps: 100`, `guidance_scale: 7.0`, `seed: 10`, `save_all_cfg_passes: true` |
| Tamano del repositorio | 3,0 GB |
| Libreria | audio-interv |
| Descargas / likes | 0 / 0 |
| Fecha de creacion | 2026-09-10 |
| Ultima actualizacion | 2026-09-10 |

## Arquitectura y entrenamiento

El modelo base sobre el que opera es un transformer de difusion (DiT) para audio latente: Stable Audio Open 1.0 genera audio estereo a partir de un prompt de texto mediante un proceso de difusion en el espacio latente, con atencion cruzada entre las representaciones textuales y las del audio. Los vectores publicados no modifican los pesos de ese transformer; actuan en tiempo de inferencia sumando una direccion aprendida a las activaciones de las capas de atencion cruzada `attn2` de los 24 bloques, en las dos pasadas de classifier-free guidance (`save_all_cfg_passes: true`).

La metodologia CAA (adicion contrastiva de activaciones) construye la direccion de direccionamiento a partir de activaciones contrastivas correspondientes al concepto `vocal_gender`, y posteriormente la normaliza (`normalize_sv: true`) para poder escalarla con un coeficiente `alpha` en el momento de la generacion. El controlador `StableAudioCAASteeringController` se instancia con `from_pretrained(..., alpha=1.0)` y se aplica como context manager sobre `SteerableStableAudioModel`, lo que permite activar o desactivar la intervencion sin recargar el modelo.

No se dispone de informacion sobre el numero de tokens o muestras de audio empleados para calcular los vectores, la composicion del conjunto contrastivo, ni si se aplicaron etapas adicionales de optimizacion (RLHF, DPO u otras). El unico detalle metodologico documentado en la informacion proporcionada es el preset de capas, el metodo `standard_caa_stable_audio` y la normalizacion del vector.

## Capacidades

- Direccionamiento del concepto `vocal_gender` en la generacion de audio con Stable Audio Open 1.0, con intensidad regulable mediante el parametro `alpha` del controlador.
- Control del atributo a traves de las 24 capas `attn2` del transformer, lo que permite experimentar con la profundidad de la intervencion (aunque el config publicado fija `layers_preset: all`).
- Aplicacion y retirada de la intervencion en tiempo de ejecucion mediante un context manager, sin reentrenar el modelo base.
- Reproducibilidad de la generacion mediante semilla fija (`seed: 10`) y configuracion declarada de pasos de inferencia y escala de guidance.
- Generacion de audio con prompt de texto (por ejemplo, `"instrumental music"` en el ejemplo de la model card) con la intervencion activa.
- Exploracion de interpretabilidad: analisis de como una direccion de activacion concreta afecta a un atributo perceptual de la salida.
- Compatibilidad con las dos pasadas de classifier-free guidance, ya que se conservan todas (`save_all_cfg_passes: true`).
- No se documentan capacidades de tool calling, agentes, vision, audio de entrada (speech-to-text), ni soporte multilingue.

## Casos de uso

- Produccion musical asistida: aplicar el vector con distintos valores de `alpha` para desplazar el timbre vocal percibido de una pista generada, permitiendo al productor tantear variantes sin volver a entrenar ni reescribir el prompt.
- Estudio de sesgos en modelos generativos de audio: cuantificar como una direccion de activacion asociada al genero vocal altera la salida ante prompts neutros como `"instrumental music"`, aportando evidencia experimental sobre sesgos latentes.
- Investigacion en interpretabilidad de modelos de difusion: usar el repositorio como caso de estudio reproducible de CAA sobre un DiT de audio, comparando el efecto de intervenir solo algunas capas frente al preset `all`.
- Generacion de variaciones de un mismo material: fijar la semilla y recorrer un barrido de `alpha` para obtener multiples versiones del mismo fragmento de 10 segundos, utiles en tareas de seleccion de maquetas.
- Aumento de datos para entrenamiento de clasificadores de audio: producir pares contrastivos controlados que difieran principalmente en el atributo direccionado, reduciendo el coste frente a la anotacion manual.
- Audicion y evaluacion subjetiva: generar ejemplos con la intervencion activada y desactivada para pruebas A/B con oyentes, midiendo la perceptibilidad del cambio a distintos valores de `alpha`.
- Demostraciones docentes sobre control de modelos generativos: ilustrar en clase como una edicion en el espacio de activaciones modifica una salida sin tocar los pesos, usando el snippet de la model card.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas objetivas (FAD, CLAP score, precision de clasificacion del atributo, ni evaluaciones perceptuales) ni comparaciones cuantitativas con otros metodos de control.

## Requisitos de hardware

- El repositorio ocupa 3,0 GB, lo que constituye un requisito de disco previo a la carga; no equivale a la VRAM necesaria en inferencia.
- El config de generacion especifica `device: cuda` y `dtype: float16`, por lo que se requiere una GPU compatible con CUDA y con soporte de precision media.
- La VRAM necesaria viene dominada por el modelo base `stabilityai/stable-audio-open-1.0`, que debe cargarse junto con los vectores de direccionamiento; no se dispone del dato concreto de VRAM en la informacion proporcionada.
- No se especifica si cabe en GPU de consumo (por ejemplo, RTX 4090 o RTX 3090); no disponible.
- Opciones de despliegue: la model card unicamente documenta el uso mediante la libreria `audio-interv` (`SteerableStableAudioModel` y `StableAudioCAASteeringController`). No se mencionan vLLM, llama.cpp, Ollama, TGI ni otros servidores de inferencia, y en general no son aplicables a un artefacto de direccionamiento sobre un modelo de difusion de audio.
- Latencia y throughput: no disponibles. El config fija 100 pasos de inferencia y 10,0 segundos de audio, parametros que condicionan directamente el tiempo de generacion.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye otros repositorios de vectores de direccionamiento para audio, ni alternativas comparables de control de atributos vocales en modelos de difusion, ni datos de rendimiento que permitan establecer una comparacion. El unico punto de referencia documentado es el modelo base `stabilityai/stable-audio-open-1.0`.

| Alternativa | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| stable-audio-caa-vocal-gender | no disponible | no aplica | no disponible | no disponible | repositorio HuggingFace con 0 descargas |
| Otras alternativas de la misma categoria | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Licencia no especificada: la ausencia de licencia explicita impide determinar si el uso comercial esta permitido. Conviene consultar al autor antes de integrarlo en un producto.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, por lo que no existe evidencia de uso ni validacion por parte de la comunidad.
- No se publican metricas objetivas ni evaluaciones perceptuales que cuantifiquen la eficacia del vector ni su grado de fidelidad al concepto `vocal_gender`.
- El concepto `vocal_gender` se formula de manera binaria, lo que puede no representar adecuadamente la diversidad vocal y puede inducir sesgos de genero en las salidas.
- El snippet de ejemplo usa el prompt `"instrumental music"`, en el que el atributo vocal no es directamente aplicable; los resultados pueden no ser interpretables en prompts sin voz.
- La intervencion se aplica a las 24 capas `attn2` de forma simultanea (`layers_preset: all`), lo que puede degradar la calidad general del audio por encima de cierto valor de `alpha`; no se documenta el rango seguro.
- La sensibilidad al parametro `alpha` no esta cuantificada: se desconoce el umbral a partir del cual aparecen artefactos.
- Dependencia de la libreria `audio-interv`, cuyo mantenimiento, versionado y API no se detallan en la informacion disponible.
- Se desconoce el formato exacto de los pesos, lo que dificulta la portabilidad a otros frameworks de inferencia.
- Las fechas de creacion y actualizacion indicadas (2026-09-10) son las declaradas en el repositorio y no se han podido contrastar con otras fuentes.
- El limite de duracion del audio generado depende del modelo base; en la configuracion publicada se fija en 10,0 segundos, lo que restringe su uso en piezas de mayor duracion sin fragmentacion.

## Enlaces

- HuggingFace: https://huggingface.co/lukasz-staniszewski/stable-audio-caa-vocal-gender
- Paper referenciado ("TADA! Tuning Audio Diffusion Models through Activation Steering"): https://huggingface.co/papers/2602.11910
- Modelo base: https://huggingface.co/stabilityai/stable-audio-open-1.0
- Los resultados de busqueda web consultados no aportaron enlaces adicionales relevantes sobre este modelo (devolvieron paginas genericas de Reddit, GitHub y Zhihu sin relacion con el artefacto).
