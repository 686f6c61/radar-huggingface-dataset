# myx160/sft_eyeglasses250_pi05_ppu8c_mb48_gbs384_s20000_from100_s4000_v2_step16000

## Resumen

Este repositorio contiene un checkpoint completo y reanudable de ajuste supervisado (SFT) para la tarea de manipulacion robotica denominada "eyeglasses" sobre un brazo Piper. La instruccion de tarea es recoger las gafas, plegar las patillas y depositarlas en la caja situada a la derecha. El artefacto esta publicado por el usuario myx160 bajo licencia Apache-2.0 y corresponde al paso 16000 de un plan de entrenamiento de 20000 pasos.

Se trata de un modelo de la categoria VLA (vision-language-action) dentro del ecosistema OpenPI y con etiquetas que apuntan tambien a RLinf y LeRobot. El repositorio ocupa 34,1 GB, un tamano que refleja que incluye no solo los pesos, sino tambien el estado del optimizador y ocho shards DCP del checkpoint distribuido, por lo que es un artefacto de entrenamiento mas que un paquete ligero de inferencia.

Su relevancia es acotada pero clara para quien trabaja en robotica de manipulacion: documenta de forma exhaustiva el contrato de entrenamiento (dataset, hiperparametros, layout de recuperacion y estadisticas de normalizacion) y permite reproducir o continuar el ajuste. La propia model card advierte de que la perdida de entrenamiento no es evidencia de exito en robot real y que la seleccion de checkpoints debe hacerse con un protocolo de evaluacion fisica congelado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible en la model card; las etiquetas indican VLA (vision-language-action) del ecosistema OpenPI. El nombre del repositorio incluye "pi05", lo que sugiere una variante de la familia pi0.5, pero no se confirma en la documentacion |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no se indica que sea un modelo MoE) |
| Longitud de contexto | no disponible; no aplica en el sentido de un LLM. La politica consume 3 camaras RGB mas un estado de 14 dimensiones y produce acciones con horizonte 50 |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (la instruccion de tarea esta redactada en ingles) |
| Licencia | Apache-2.0 |
| Formato de pesos | PyTorch: `model_state_dict/full_weights.pt` y 8 shards DCP (Distributed Checkpoint) de FSDP. No se distribuye en safetensors ni GGUF |
| Libreria | openpi |
| Pipeline declarado | robotics |
| Entradas | 3 camaras RGB + estado de 14 dimensiones |
| Salidas | accion de 14 dimensiones, horizonte 50 |
| Tamano del repositorio | 34,1 GB |
| Descargas / likes | 0 / 0 |
| Fecha de creacion / actualizacion | 2026-09-17 / 2026-09-17 |

## Arquitectura y entrenamiento

La model card no describe la arquitectura interna del modelo (tipo de backbone, capas, atencion o mecanismo de fusion vision-lenguaje-accion). Solo se declara que es un checkpoint OpenPI de tipo VLA para control robotico y que el nombre del repositorio referencia "pi05". Cualquier afirmacion sobre el backbone concreto seria especulativa, por lo que se marca como no disponible.

El contrato de entrenamiento si esta detallado. Se parte de un warm start correspondiente al paso 4000 de un SFT sobre 100 episodios, y se ajusta con el dataset `myx160/eyeglasses_grasp_250episode` en la revision `fd7ce02d49c4b150becdf657ec010faaa0e63d73`, compuesto por 250 episodios. El entrenamiento usa FSDP `full_shard` a parametros completos, con 8 dispositivos fisicos (PPU 8-15, world size 8), micro batch por rango de 48, batch global de 384 y acumulacion 1. El plan es de 20000 pasos con 1000 de warmup y un LR maximo de 1e-5; este repositorio corresponde al paso 16000. No se menciona RLHF, DPO ni ninguna innovacion de decodificacion.

El directorio `global_step_16000/actor/` incluye los 8 shards DCP con estado del optimizador, `.metadata`, `model_state_dict/full_weights.pt`, `data.pt`, `rng.pt`, `SFT_CHECKPOINT_COMPLETE.json`, ademas de las estadisticas de normalizacion y el contrato de transformaciones exigido por el pipeline de inferencia en robot real.

## Capacidades

- Generacion de acciones roboticas de 14 dimensiones con horizonte de 50 pasos, condicionadas por instruccion en lenguaje natural.
- Percepcion visual multi-camara: consume simultaneamente 3 flujos RGB.
- Fusion de estado propioceptivo de 14 dimensiones con la observacion visual.
- Ejecucion de la tarea especifica de recoger gafas, plegar patillas y colocarlas en una caja a la derecha.
- Ajuste posterior (fine-tuning) como punto de partida: al ser un checkpoint resumible con estado del optimizador, sirve como warm start para otras tareas o datasets.
- Guardado y restauracion determinista del entrenamiento (shards DCP, RNG y estado del optimizador).
- Soporte de tool calling, function calling, agentes, razonamiento multi-paso, matematicas, codigo, vision general, audio o modo "thinking": no disponible; no es un modelo de lenguaje conversacional y la model card no declara esas capacidades.
- Capacidades multilingues: no disponible.

## Casos de uso

- Automatizacion de la tarea "eyeglasses" en laboratorio: el checkpoint ejecuta directamente la politica entrenada (recoger, plegar patillas y depositar en caja), alimentado por 3 camaras RGB y estado de 14 dimensiones, con horizonte de accion de 50 pasos.
- Punto de partida para nuevas tareas de manipulacion: el estado del optimizador y los pesos completos permiten reiniciar el entrenamiento desde el paso 16000 en lugar de partir de cero, util para curriculum o transferencia a objetos similares.
- Evaluacion comparativa de politicas VLA: sirve como artefacto de referencia dentro de un protocolo de evaluacion fisica congelado, comparando su tasa de exito con otros checkpoints de la misma familia.
- Reproduccion de experimentos de SFT robotico: los shards DCP, el `rng.pt` y las estadisticas de normalizacion permiten reproducir el pipeline FSDP `full_shard` con batch global 384 en 8 dispositivos.
- Investigacion sobre sensibilidad a hiperparametros: al estar documentados LR maximo (1e-5), warmup (1000 pasos) y plan de 20000 pasos, es material util para estudiar el efecto del scheduler en tareas de manipulacion.
- Despliegue en brazo Piper con el pipeline openpi: el directorio `actor/` incluye el contrato de transformaciones y las norm stats exactas que exige la inferencia en robot real, lo que simplifica la integracion.
- Generacion de rollouts para analisis offline: ejecutar la politica en simulacion o en banco de pruebas para recopilar trayectorias y analizar modos de fallo antes de un despliegue real.
- Destilacion o compresion de politicas: usar los pesos completos como profesor para obtener versiones mas ligeras destinadas a hardware embebido (requiere trabajo adicional no cubierto por la model card).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

La model card es explicita al respecto: "This is a training artifact. Train loss alone is not evidence of real-robot success; select checkpoints using the frozen real-world evaluation protocol". No se proporcionan tasas de exito, metricas de tarea, MMLU, HumanEval, GSM8K ni ningun otro valor numerico de evaluacion.

## Requisitos de hardware

- Entrenamiento: el contrato documentado usa 8 dispositivos fisicos (PPU 8-15) con FSDP `full_shard` a parametros completos y micro batch por rango de 48. No se especifica el modelo de acelerador ni la VRAM por dispositivo.
- VRAM para inferencia: no disponible. No se indica el numero de parametros, por lo que no es posible estimar requisitos por cuantizacion.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible.
- Almacenamiento: el repositorio ocupa 34,1 GB e incluye pesos, estado del optimizador y 8 shards DCP; el peso en disco del despliegue sera menor si se usa solo `full_weights.pt`.
- Opciones de despliegue: el pipeline declarado es OpenPI (libreria `openpi`), con etiquetas que apuntan a RLinf y LeRobot. vLLM, llama.cpp, Ollama o TGI no aplican, ya que no es un modelo de lenguaje.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No se dispone de datos verificables de modelos comparables en la informacion proporcionada. La categoria es la de politicas VLA para manipulacion robotica (familias habitualmente comparables como pi0/pi0.5, OpenVLA, SmolVLA o GR00T N1, entre otras), pero no se han facilitado parametros, contexto, rendimiento ni disponibilidad de ninguna de ellas, por lo que no se puede construir una comparacion con cifras.

| Modelo | Categoria | Parametros | Entradas / horizonte | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este checkpoint (`myx160/sft_eyeglasses250_..._step16000`) | VLA robotica, tarea eyeglasses sobre Piper | no disponible | 3 RGB + estado 14D / horizonte 50 | Apache-2.0 | HuggingFace, 0 descargas, 0 likes |
| Alternativas de la misma categoria | VLA robotica | no disponible | no disponible | no disponible | no disponible en la informacion proporcionada |

## Limitaciones y advertencias

- Es un artefacto de entrenamiento, no un modelo listo para produccion. La propia model card advierte de que la perdida de entrenamiento no demuestra exito en robot real.
- No se han publicado evaluaciones en robot fisico ni benchmarks; no hay evidencia de tasa de exito.
- El dataset de ajuste es pequeno (250 episodios) y de una unica tarea y un unico embodiment (Piper), lo que implica un riesgo alto de sobreajuste y una generalizacion muy limitada a otros objetos, brazos o entornos.
- Checkpoint intermedio: corresponde al paso 16000 de un plan de 20000, no al final del entrenamiento.
- No se documenta la arquitectura, el numero de parametros, la cuantizacion ni los requisitos de inferencia, lo que dificulta planificar el despliegue.
- La instruccion de tarea esta en ingles; no se declaran capacidades multilingues.
- La model card solo declara licencia Apache-2.0 para este repositorio. No se especifica la licencia de los pesos base usados en el warm start (SFT de 100 episodios, paso 4000) ni la del dataset; conviene verificar ambas antes de un uso comercial.
- Riesgo de alucinacion o de comportamiento no fiable fuera de la distribucion de las 250 demostraciones; no hay metricas de robustez ante cambios de iluminacion, posicion de las gafas o fondo.
- No se indican sesgos, pero al tratarse de una politica entrenada con demostraciones concretas heredara las regularidades y limitaciones de esa recoleccion.
- El repositorio incluye estado del optimizador y 8 shards DCP (34,1 GB), lo que complica su distribucion y almacenamiento si solo se necesita inferencia.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/myx160/sft_eyeglasses250_pi05_ppu8c_mb48_gbs384_s20000_from100_s4000_v2_step16000
- Dataset de entrenamiento (identificador citado en la model card, URL construida a partir del mismo): https://huggingface.co/datasets/myx160/eyeglasses_grasp_250episode
- Revision del dataset citada: `fd7ce02d49c4b150becdf657ec010faaa0e63d73`
- Paper, blog, repositorio o demo adicionales: no disponible. La busqueda web realizada no devolvio resultados relacionados con el modelo (unicamente paginas de la cadena hotelera Accor, sin relacion con este artefacto).
