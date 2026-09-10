# lukasz-staniszewski/stable-audio-caa-piano

## Resumen

`stable-audio-caa-piano` no es un modelo generativo autonomo, sino un conjunto de vectores de steering de activacion (contrastive activation addition, CAA) para el concepto "piano" sobre el modelo de difusion de audio Stable Audio Open 1.0. Lo publica el usuario lukasz-staniszewski en HuggingFace bajo la libreria `audio-interv`, y su proposito es modificar el comportamiento del modelo base en tiempo de inferencia, sin reentrenamiento ni ajuste fino, inyectando una direccion de activacion en capas concretas de atencion.

El artefacto se aplica sobre las capas `attn2` de los 24 bloques del transformer del modelo base (`transformer_blocks.0.attn2` a `transformer_blocks.23.attn2`), con normalizacion del vector de steering activada. La configuracion declarada usa `float16`, 100 pasos de inferencia, 10,0 segundos de audio, `guidance_scale` 7.0 y semilla 10.

Su relevancia es fundamentalmente de investigacion en interpretabilidad y control de modelos de difusion de audio: permite inducir o reforzar un timbre concreto (piano) sin tocar los pesos del modelo, y estudiar en que capas se representa ese concepto. El repositorio ocupa 3,0 GB y no registra descargas ni likes en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vectores de steering CAA aplicados a las capas `attn2` de los 24 bloques transformer de Stable Audio Open 1.0 (modelo de difusion latente) |
| Parametros totales | No disponible (no es un modelo con parametros propios; el repositorio ocupa 3,0 GB) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica; la configuracion declarada genera 10,0 s de audio con 100 pasos de inferencia |
| Tipos de cuantizacion | No disponible; el `dtype` de inferencia declarado es `float16` |
| Idiomas soportados | No aplica (audio); los prompts de ejemplo estan en ingles |
| Licencia | No disponible |
| Formato de pesos | No disponible (libreria declarada: `audio-interv`) |

## Arquitectura y entrenamiento

El repositorio contiene vectores de steering calculados mediante contrastive activation addition sobre Stable Audio Open 1.0. El metodo, denominado en la configuracion `standard_caa_stable_audio`, consiste en derivar una direccion de activacion a partir de pares contrastivos y sumarla, con un factor de escala `alpha`, a las activaciones de las capas seleccionadas durante la generacion. En este caso el concepto objetivo es `piano` y las capas intervenidas son las 24 proyecciones `attn2` del transformer, todas ellas incluidas mediante `layers_preset: "all"`. El parametro `normalize_sv` esta activado, de modo que el vector se normaliza antes de aplicarse.

No se dispone de informacion sobre el numero de tokens o ejemplos de audio empleados en el calculo de los vectores, la composicion del dataset contrastivo, ni si se aplicaron tecnicas adicionales de alineacion. Tampoco se detalla el proceso de entrenamiento del modelo base. La innovacion tecnica del artefacto es el control del timbre en un modelo de difusion de audio sin modificacion de pesos, junto con la posibilidad de guardar todas las pasadas de classifier-free guidance (`save_all_cfg_passes: true`) para su analisis posterior.

## Capacidades

- Modificacion del timbre de la generacion hacia el concepto "piano" en prompts ambiguos, como el ejemplo declarado `"instrumental music"`.
- Control de la intensidad del efecto mediante el parametro `alpha` del controlador CAA.
- Intervencion simultanea sobre las 24 capas `attn2` del transformer, o sobre un subconjunto si se modifica `layers_to_steer`.
- Normalizacion del vector de steering antes de su aplicacion.
- Registro de todas las pasadas de classifier-free guidance para analisis de interpretabilidad.
- Uso en tiempo de inferencia, sin reentrenamiento del modelo base ni modificacion de sus pesos.
- No dispone de tool calling, function calling, soporte de agentes, capacidades multilingues ni modos de razonamiento: es un artefacto de control, no un asistente.

## Casos de uso

- Control de timbre en generacion musical: aplicando el steering sobre el prompt generico `"instrumental music"` se puede forzar la presencia de piano sin reescribir el prompt, util cuando el modelo base ignora la indicacion de instrumento.
- Investigacion en interpretabilidad: permite comprobar si el concepto "piano" esta localizado en las capas `attn2` y como se distribuye a lo largo de los 24 bloques del transformer.
- Ablacion por capas: sustituyendo `layers_preset: "all"` por subconjuntos de `layers_to_steer` se puede medir la contribucion de cada bloque al timbre generado, manteniendo el resto de la configuracion constante.
- Analisis de classifier-free guidance: con `save_all_cfg_passes: true` se pueden estudiar las trayectorias intermedias de la condicion y la no condicion bajo el efecto del steering.
- Prototipado creativo y diseno sonoro: barriendo valores de `alpha` se obtiene un control graduado de la intensidad del piano, aprovechable en produccion musical asistida.
- Generacion de material de referencia: con la semilla fija (10), 100 pasos y 10,0 s de duracion, el artefacto permite producir pares de muestras con y sin steering para comparaciones controladas.
- Diagnosis de sensibilidad al prompt: comparar la misma semilla con y sin `model.steer(ctrl)` ayuda a determinar en que medida el modelo base depende del texto para producir un timbre concreto.
- Docencia y divulgacion tecnica: sirve como ejemplo minimo y reproducible de activacion contrastiva aplicada a un modelo de difusion de audio.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El repositorio ocupa 3,0 GB, cantidad que debe poder cargarse en memoria, y el modelo base debe cargarse adicionalmente; no se publica la huella total.
- El dispositivo declarado en la configuracion es `cuda` con `dtype: float16`.
- GPU recomendadas: no disponible en la informacion proporcionada.
- Compatibilidad con GPU de consumo: no confirmada por el autor. La viabilidad depende del modelo base, no de los vectores de steering, cuyo tamano (3,0 GB) es el unico dato objetivo disponible.
- Opciones de despliegue: no aplican vLLM, llama.cpp, Ollama ni TGI, ya que se trata de un artefacto de steering sobre un modelo de difusion de audio. El uso previsto es mediante la libreria `audio-interv` y las clases `SteerableStableAudioModel` y `StableAudioCAASteeringController`.
- Latencia y throughput: no disponibles. La configuracion declarada implica 100 pasos de inferencia para generar 10,0 s de audio en `float16`.

## Comparativa con modelos similares

| Modelo | Tipo | Modificacion en inferencia | Capas intervenidas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| stable-audio-open-1.0 | Modelo base de difusion latente | Ninguna (linea base) | No aplica | No disponible | Referenciado en la configuracion del repositorio |
| stable-audio-caa-piano | Vectores de steering CAA | Steering sobre `attn2` | 24 bloques transformer | No disponible | Este repositorio (3,0 GB) |
| Otras alternativas CAA para audio | No disponible | No disponible | No disponible | No disponible | No identificadas en la busqueda realizada |

No se han identificado en la informacion disponible otros repositorios de vectores de steering de audio comparables, ni datos de parametros o rendimiento del modelo base que permitan una comparacion cuantitativa.

## Limitaciones y advertencias

- La licencia no esta declarada en el repositorio, por lo que no se puede determinar si el uso comercial esta permitido. El modelo base tiene su propia licencia, que debe consultarse por separado.
- No hay resultados de benchmarks ni evaluaciones objetivas de calidad del audio generado con y sin steering.
- El repositorio no registra descargas ni likes, por lo que no existe validacion por parte de la comunidad.
- El artefacto esta acoplado a una version concreta del modelo base y a una nomenclatura exacta de capas (`transformer_blocks.N.attn2`); cualquier cambio en el modelo base puede invalidar su aplicacion.
- Solo cubre un concepto (`piano`) y esta calculado sobre un unico conjunto contrastivo no documentado.
- El steering puede introducir artefactos o degradar otras caracteristicas del audio, ya que no se documentan pruebas de efectos colaterales.
- No hay informacion sobre sesgos del modelo base ni sobre el efecto del steering en la diversidad de las muestras generadas.
- El codigo de ejemplo depende de modulos externos (`src.steering`) que no se detallan en la informacion proporcionada.
- Los prompts de ejemplo estan en ingles; no se declara comportamiento con prompts en otros idiomas.
- Riesgo de alucinacion: no aplica en el sentido habitual, pero el modelo base puede generar audio poco fiel al prompt, y el steering no garantiza una correspondencia exacta con el concepto "piano".
- Las fechas de creacion y actualizacion indicadas (10 de septiembre de 2026) son las que figuran en HuggingFace.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/lukasz-staniszewski/stable-audio-caa-piano
- Paper referenciado: TADA! Tuning Audio Diffusion Models through Activation Steering — https://huggingface.co/papers/2602.11910
- Modelo base referenciado en la configuracion: stabilityai/stable-audio-open-1.0
- La busqueda web realizada no devolvio resultados relevantes para este modelo.
