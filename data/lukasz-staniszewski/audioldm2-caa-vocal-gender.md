# lukasz-staniszewski/audioldm2-caa-vocal-gender

## Resumen

`lukasz-staniszewski/audioldm2-caa-vocal-gender` no es un modelo generativo autonomo, sino un conjunto de vectores de steering por activacion (contrastive activation addition, CAA) para el concepto `vocal_gender` sobre el modelo de difusion de audio AudioLDM2. El artefacto se aplica en tiempo de inferencia sobre el UNet de `cvssp/audioldm2-large` para modular el genero vocal percibido en el audio generado, sin reentrenar ni ajustar los pesos del modelo base. Lo publica el usuario lukasz-staniszewski y esta vinculado al paper "TADA! Tuning Audio Diffusion Models through Activation Steering" (arXiv:2602.11910).

El problema que resuelve es el control fino de atributos en modelos de difusion de audio: en lugar de depender exclusivamente del prompt de texto (que es impreciso y ambiguo) o de reentrenar el modelo, se inyecta una direccion de activacion calculada de forma contrastiva en 64 modulos de cross-attention (`attn2`) del UNet. Esto permite un control continuo mediante el parametro `alpha` y es composable con otros vectores de steering.

Es relevante ahora porque la interpretabilidad y el control de modelos generativos de audio es un area emergente: la generacion musical y de voz sintetica necesita mecanismos de control reproducibles y auditables. La limitacion practica principal es la madurez del artefacto: 7 descargas, 0 likes, licencia no declarada y ausencia total de evaluacion cuantitativa publicada en la informacion disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vectores de steering por activacion (CAA) sobre el UNet de un modelo de difusion latente para audio (AudioLDM2-large); el UNet combina bloques ResNet con cross-attention (`attn2`) hacia embeddings de texto |
| Parametros totales | no disponible para el artefacto (contiene vectores de direccion, no un modelo completo); el recuento de parametros del modelo base `cvssp/audioldm2-large` no se indica en la informacion proporcionada |
| Parametros activos | no aplicable (no es un modelo MoE) |
| Longitud de contexto | no aplicable (modelo de generacion de audio); la configuracion de generacion fija `audio_length_in_s` = 10,0 s |
| Tipos de cuantizacion | no disponible; la configuracion de generacion usa `dtype` = float16 |
| Idiomas soportados | no disponible (los prompts de ejemplo estan en ingles: `"instrumental music"`) |
| Licencia | no disponible (la model card no declara licencia) |
| Formato de pesos | no disponible en la model card; se carga mediante `AudioLDMCAASteeringController.from_pretrained`. Tamano del repositorio: 2,3 GB |
| Metodo declarado | `standard_caa_audioldm` |
| Modelo base | `cvssp/audioldm2-large` |
| Concepto | `vocal_gender` |
| Capas intervenidas | 64 modulos `attn2` (cross-attention) del UNet: `down_blocks` 1-3, `mid_block` y `up_blocks` 0-2 |
| Normalizacion del vector | `normalize_sv` = true |
| Libreria | `audio-interv` |
| Tamano del repositorio | 2,3 GB |

Nota: un unico vector de direccion sobre un `attn2` de dimension tipica ocupa del orden de kilobytes. Los 2,3 GB del repositorio son muy superiores a lo que ocuparian 64 vectores, por lo que el artefacto probablemente incluye pesos del modelo base o ficheros adicionales que la model card no detalla. Este punto no esta confirmado.

## Arquitectura y entrenamiento

La tecnica empleada es contrastive activation addition (CAA), un metodo de steering por activacion que no modifica los pesos del modelo. Se construyen pares de prompts contrastivos que difieren en el atributo objetivo (aqui, genero vocal), se capturan las activaciones internas del modelo para cada miembro del par, se calcula la diferencia media y esa diferencia se normaliza para obtener un vector de direccion. En inferencia, el vector se suma escalado por `alpha` a las activaciones de las capas seleccionadas, desplazando la generacion hacia el polo deseado del concepto. El parametro `normalize_sv = true` indica que el vector se normaliza antes de aplicarlo.

El artefacto interviene exclusivamente los modulos `attn2` (cross-attention texto-audio) distribuidos por todo el UNet: `down_blocks.1`, `.2` y `.3` (atenciones 1, 2, 5 y 6, con los `transformer_blocks` 0 y 1 de cada una), `mid_block` (atenciones 1 y 2) y `up_blocks.0`, `.1` y `.2` (atenciones 1, 2, 5, 6, 9 y 10). El preset de capas es `"all"`. La configuracion de generacion asociada usa 100 pasos de inferencia, 10,0 s de audio, `guidance_scale` = 4,5, `seed` = 10, `device` = cuda, `dtype` = float16 y `save_all_cfg_passes = true`.

No se documentan en la informacion proporcionada los datos de entrenamiento ni de calibracion: no se indica el numero de prompts contrastivos utilizados, la composicion del conjunto de datos, ni si hubo un proceso de RLHF/DPO (no aplicable en el sentido habitual, ya que no se entrena un modelo de lenguaje). Tampoco se documenta ninguna innovacion adicional como decodificacion especulativa ni atencion lineal.

## Capacidades

- Control de atributos en generacion de audio: modula el genero vocal percibido en el audio producido por AudioLDM2 sin reentrenar el modelo base.
- Intensidad ajustable: el parametro `alpha` (1,0 en el ejemplo de la model card) permite graduar la fuerza del efecto de steering.
- Composicion con otros vectores: al ser un metodo aditivo sobre activaciones, es combinable con otros vectores de steering del mismo espacio de conceptos, siempre que se gestionen los conflictos entre direcciones.
- Focalizacion en cross-attention: al actuar solo sobre `attn2`, afecta a la alineacion entre la condicion de texto y la generacion de audio, no a la ruta puramente acustica del UNet.
- Aplicable a prompts instrumentales: el ejemplo oficial genera con el prompt `"instrumental music"`, lo que sugiere uso para inducir caracteristicas vocales concretas sobre bases instrumentales.
- No soporta tool calling ni function calling: no aplicable a este tipo de artefacto.
- No soporta agentes ni razonamiento multi-paso: no aplicable.
- Capacidades multilingues: no disponible; no se documentan idiomas soportados.
- Capacidades de thinking mode, vision o audio input: no aplicable; el artefacto no procesa audio de entrada, solo altera la generacion.

## Casos de uso

- Produccion musical asistida: generar maquetas de 10,0 s con el prompt `"instrumental music"` y modular el genero vocal percibido mediante `alpha` para previsualizar como encajaria una voz masculina o femenina en un arreglo antes de contratar un cantante.
- Localizacion y doblaje: producir variantes de una misma pieza con distinta percepcion de genero vocal para pruebas de casting o de adaptacion de canciones a mercados distintos, manteniendo el mismo prompt y la misma semilla.
- Investigacion en interpretabilidad de modelos de audio: usar los 64 modulos `attn2` intervenidos como mapa de que capas del UNet codifican el atributo de genero vocal, comparando el efecto de aplicar el vector capa a capa.
- Aumento de datos con control de atributos: generar conjuntos de audio etiquetados por genero vocal percibido para entrenar clasificadores o sistemas de analisis musical, controlando la variable mediante `alpha` en lugar de confiar en el prompt.
- Experimentacion sobre mitigacion de sesgos: aplicar el vector con `alpha` negativo o reducido para estudiar como se atenua la asociacion estereotipada entre ciertos generos musicales y el genero vocal en las salidas del modelo.
- Prototipado de interfaces creativas: construir un control tipo deslizador que mapee directamente a `alpha`, ofreciendo a artistas un control continuo y reproducible (semilla fija) sobre un atributo perceptual concreto.
- Evaluacion comparativa de tecnicas de control: usar este artefacto como linea base de CAA frente a ingenieria de prompts o ajuste fino con LoRA en tareas de control de atributos en difusion de audio.
- Reproduccion de resultados academicos: replicar los experimentos del paper TADA! sobre el concepto `vocal_gender` con la configuracion exacta documentada (100 pasos, 10,0 s, guidance 4,5, semilla 10).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

La model card no incluye ninguna tabla de evaluacion, ni metrica objetiva (FAD, KL, precision de clasificador de genero, evaluacion humana) ni comparacion cuantitativa con alternativas como ingenieria de prompts o ajuste fino. El unico respaldo es la referencia al paper arXiv:2602.11910.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la informacion proporcionada. Como referencia no confirmada por el autor, la generacion de audio de 10,0 s con AudioLDM2-large en float16 con 100 pasos suele requerir del orden de 8-12 GB de VRAM, a lo que hay que sumar el coste de retener las activaciones de los 64 modulos intervenidos.
- GPU recomendadas: no especificadas por el autor. La configuracion de generacion asume `device` = cuda sin concretar modelo de GPU.
- Compatibilidad con GPU de consumo: no confirmada. Dado el uso de float16 y el tamano del repositorio (2,3 GB), es plausible su ejecucion en GPUs de consumo con 12-16 GB de VRAM, pero no hay verificacion publicada.
- Opciones de despliegue: la via documentada es la libreria `audio-interv` con `SteerableAudioLDMModel` y `AudioLDMCAASteeringController.from_pretrained(...)`, presuponiendo una instalacion de PyTorch con CUDA. No aplican vLLM, llama.cpp, Ollama ni TGI, que son servidores para modelos de lenguaje.
- Latencia y throughput: no disponibles. Se conocen los hiperparametros que determinan el coste (100 pasos de difusion, `save_all_cfg_passes` = true), pero no se publican mediciones de tiempo.
- Memoria de almacenamiento: 2,3 GB de repositorio, mas el espacio necesario para el modelo base `cvssp/audioldm2-large`.

## Comparativa con modelos similares

No se han proporcionado artefactos comparables directos (otros repositorios de vectores de steering para audio). La comparacion siguiente es metodologica, entre enfoques de control de atributos en difusion de audio, y no entre modelos de la misma categoria.

| Enfoque | Parametros entrenables | Modifica pesos | Coste de ajuste | Granularidad del control | Disponibilidad |
|---|---|---|---|---|---|
| Este artefacto (CAA sobre AudioLDM2-large) | 64 vectores de direccion | No | Bajo (calculo contrastivo de activaciones) | Continua via `alpha`; 64 modulos `attn2` | Repositorio publico, 7 descargas, 0 likes |
| Ajuste fino con LoRA del UNet | Matrices de bajo rango | Si (adaptadores) | Medio-alto | Depende del rango y los datos | No disponible en la informacion proporcionada |
| Ingenieria de prompts | 0 | No | Nulo | Discreta y poco fiable, dependiente del prompt | No aplicable |
| Otros vectores CAA de la misma coleccion | Vectores de direccion | No | Bajo | Continua via `alpha` | No disponible en la informacion proporcionada |

No se dispone de datos de rendimiento para ninguna de las filas, por lo que la comparacion no permite establecer cual es superior en calidad de audio o en fidelidad de control.

## Limitaciones y advertencias

- No es un modelo autonomo: requiere el modelo base `cvssp/audioldm2-large` y la libreria `audio-interv`; los 2,3 GB del repositorio no bastan por si solos para generar audio si no incluyen el modelo base.
- Licencia no declarada: el repositorio no especifica licencia. Para uso comercial es imprescindible verificar por separado la licencia del modelo base y del paper, ademas de contactar con el autor. No se puede asumir uso comercial permitido.
- Riesgo de degradacion de la calidad de audio: al sumar un vector sobre las activaciones de 64 modulos de cross-attention, valores altos de `alpha` pueden introducir artefactos, perdida de coherencia musical o distorsion. No se documenta un rango seguro de `alpha`.
- Sesgo conceptual binario: el concepto `vocal_gender` opera sobre una nocion binaria del genero vocal. Su uso puede reforzar estereotipos de genero en la produccion musical y en la representacion de voces; no se documenta ningun analisis de sesgo.
- Riesgo de alucinacion del atributo: el steering no garantiza que el atributo objetivo se manifieste de forma perceptualmente consistente; no hay evaluacion con clasificadores ni con oyentes que lo confirme.
- Idiomas: no disponibles. Los unicos prompts documentados estan en ingles, por lo que se desconoce el comportamiento con prompts en castellano u otras lenguas.
- Duracion limitada: la configuracion de referencia genera 10,0 s de audio. No se documenta el comportamiento en piezas mas largas.
- Reproducibilidad: la configuracion fija `seed` = 10 y `guidance_scale` = 4,5. Cambiar estos valores altera las salidas y puede interactuar con el efecto del steering de forma no caracterizada.
- Validacion externa practicamente inexistente: 7 descargas y 0 likes en el momento de la consulta; sin resultados de benchmarks, sin evaluacion humana publicada y sin casos de uso verificados por terceros.
- Coste de inferencia elevado: 100 pasos de difusion por generacion, con `save_all_cfg_passes` activado, lo que incrementa el uso de memoria y el tiempo de calculo.
- Dependencia de la version de `audio-interv`: al ser una libreria joven, los cambios de API pueden romper el codigo de ejemplo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/lukasz-staniszewski/audioldm2-caa-vocal-gender
- Paper (TADA! Tuning Audio Diffusion Models through Activation Steering): https://huggingface.co/papers/2602.11910
- Identificador arXiv declarado en los tags: arXiv:2602.11910
- Modelo base AudioLDM2-large: https://huggingface.co/cvssp/audioldm2-large
- Libreria `audio-interv`: referenciada como `library_name` en la model card, sin URL publica incluida en la informacion proporcionada

Nota: la busqueda web realizada no devolvio ningun resultado tecnico relevante sobre este modelo, su paper ni la libreria `audio-interv`; los resultados obtenidos no guardan relacion con el contenido de esta ficha y se han descartado.
