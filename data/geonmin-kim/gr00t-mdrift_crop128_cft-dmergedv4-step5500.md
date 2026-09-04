# geonmin-kim/GR00T-Mdrift_crop128_cft-Dmergedv4-step5500

## Resumen

El modelo GR00T-Mdrift_crop128_cft-Dmergedv4-step5500 es un ajuste fino del modelo NVIDIA Isaac GR00T N1.7, un modelo vision-lenguaje-accion (VLA) desarrollado por NVIDIA para habilidades generalistas en robots humanoides. Este checkpoint fue creado por el usuario geonmin-kim y publicado en HuggingFace el 4 de septiembre de 2026. El modelo cuenta con 3.144.016.000 parametros (aproximadamente 3.14 mil millones) y se distribuye en formato safetensors, con un tamano de repositorio de 12.6 GB.

Al tratarse de un modelo VLA, procesa entradas multimodales que incluyen lenguaje e imagenes para generar acciones de manipulacion en entornos diversos. El nombre del checkpoint sugiere un entrenamiento especializado con recorte de imagenes a 128 pixels (crop128), posiblemente relacionado con correccion de deriva de movimiento (Mdrift) y una etapa de fusion de checkpoints (Dmergedv4). No se dispone de documentacion detallada sobre el proceso de entrenamiento, el dataset utilizado ni las tecnicas de optimizacion aplicadas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-Language-Action (VLA), basada en NVIDIA Isaac GR00T N1.7 |
| Parametros totales | 3.144.016.000 |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura VLA de NVIDIA Isaac GR00T N1.7, que combina un codificador de vision con un modelo de lenguaje para generar acciones de manipulacion. Segun la descripcion oficial de NVIDIA, se trata de un modelo "cross-embodiment" que acepta entrada multimodal (lenguaje e imagenes) y puede realizar tareas de manipulacion en entornos diversos. El repositorio de GitHub confirma que el modelo base es de codigo abierto y esta orientado a robots humanoides.

El entrenamiento especifico de este checkpoint no esta documentado en la informacion disponible. Los sufijos del nombre sugieren un proceso de ajuste fino con recorte de imagenes a 128x128 (crop128), posible correccion de deriva de movimiento (Mdrift) y una etapa de fusion de multiples checkpoints (Dmergedv4). Existe un dataset asociado en HuggingFace del mismo autor, denominado rollout_groot_so101_mdrift_crop_step1000_move_the_red_cube, que indica que el entrenamiento probablemente se baso en rollouts de simulacion para tareas como mover un cubo rojo. No hay detalles publicos sobre el numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas como RLHF o DPO.

## Capacidades

- Manipulacion robotica: genera acciones de manipulacion a partir de entradas de lenguaje e imagenes, siguiendo el comportamiento del modelo base GR00T N1.7.
- Entrada multimodal: acepta instrucciones en lenguaje natural y observaciones visuales para decidir acciones de manipulacion.
- Cross-embodiment: al estar basado en GR00T, puede transferir habilidades entre diferentes plataformas roboticas, segun lo descrito en el repositorio oficial.
- Tareas de manipulacion general: agarre, movimiento de objetos e interaccion con el entorno. El dataset asociado confirma tareas como "move the red cube".
- Tool calling: no documentado. Al ser un modelo VLA, no se ha confirmado soporte de function calling en el sentido de los modelos de lenguaje.
- Razonamiento multi-paso: no documentado de forma explicita. La capacidad de planificacion depende del comportamiento del modelo base.

## Casos de uso

- Control de robots humanoides en entornos de laboratorio: el modelo puede ejecutar tareas de manipulacion basicas como mover objetos siguiendo instrucciones en lenguaje natural, gracias a su arquitectura VLA.
- Investigacion en robotica: al ser un checkpoint de 3.14 mil millones de parametros, es adecuado para experimentos de transferencia de habilidades entre robots y para estudiar el efecto del ajuste fino en tareas especificas.
- Entrenamiento de politicas de manipulacion: puede usarse como punto de partida para ajustes finos adicionales en tareas de agarre o ensamblaje, dado que ya incorpora un comportamiento base generalista.
- Demostraciones de robotica educativa: para prototipos que necesiten un modelo VLA de tamano moderado sin requerir infraestructura de gran escala.
- Simulacion de robots: el modelo puede integrarse en entornos de simulacion para probar politicas de manipulacion antes de desplegarlas en robots fisicos.
- Desarrollo de sistemas de manipulacion autonomos: en combinacion con otros componentes de percepcion y planificacion, puede servir como modulo de generacion de acciones para sistemas roboticos completos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No existen datos de evaluacion publicos para este checkpoint especifico.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo tiene 3.144.016.000 parametros. Los pesos en precision FP32 ocupan aproximadamente 12.6 GB, lo que coincide con el tamano del repositorio. La inferencia en precision completa requiere al menos 16 GB de VRAM considerando activaciones y overhead.
- Si se cuantiza a FP16 o BF16, los pesos ocuparian aproximadamente 6.3 GB, permitiendo inferencia en GPUs con 8-12 GB de VRAM.
- Con cuantizacion de 8 bits, los pesos ocuparian aproximadamente 3.1 GB, permitiendo ejecucion en GPUs de consumo con 6-8 GB de VRAM.
- GPUs recomendadas: A100 o H100 para inferencia en precision completa; RTX 4090 o RTX 3090 para cuantizacion en FP16.
- Opciones de despliegue: el modelo se distribuye en safetensors, por lo que puede cargarse con el framework de NVIDIA Isaac-GR00T. No se ha confirmado soporte en vLLM, Ollama ni llama.cpp, ya que se trata de un modelo VLA y no de un LLM estandar.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Arquitectura | Contexto | Licencia |
|---|---|---|---|---|
| geonmin-kim/GR00T-Mdrift_crop128_cft-Dmergedv4-step5500 | 3.14 B | VLA | no disponible | no disponible |
| NVIDIA/Isaac-GR00T N1.7 (modelo base) | no disponible | VLA | no disponible | no disponible |

No se dispone de informacion sobre otros modelos VLA comparables en los resultados de busqueda. La comparacion se limita al modelo base GR00T N1.7, del cual este checkpoint es un ajuste fino. Los datos especificos de parametros, contexto y licencia del modelo base no estan disponibles en la informacion proporcionada.

## Limitaciones y advertencias

- Licencia no especificada: no se ha publicado una licencia en HuggingFace, lo que genera incertidumbre sobre el uso comercial y la redistribucion.
- Sin documentacion de entrenamiento: no se detallan el dataset, los datos de entrenamiento ni las tecnicas utilizadas, lo que dificulta la reproducibilidad.
- Sin benchmarks publicos: no hay resultados de evaluacion que permitan comparar el rendimiento con otros modelos.
- Adopcion minima: con solo 4 descargas y 0 likes, el modelo no ha sido validado por la comunidad.
- Posible especializacion excesiva: los sufijos del nombre (Mdrift, crop128) sugieren que el entrenamiento se centro en condiciones especificas, lo que podria limitar el rendimiento fuera de esos escenarios.
- Limitaciones heredadas del modelo base: al ser un ajuste fino de GR00T N1.7, probablemente comparte las limitaciones del modelo base en cuanto a generalizacion a nuevos entornos y objetos, aunque no se dispone de documentacion especifica al respecto.
- Riesgo de alucinacion en instrucciones ambiguas: al igual que otros modelos VLA, puede generar acciones incorrectas si la instruccion o la observacion visual son ambiguas o no han sido cubiertas durante el entrenamiento.

## Enlaces

- HuggingFace: https://huggingface.co/geonmin-kim/GR00T-Mdrift_crop128_cft-Dmergedv4-step5500
- Repositorio NVIDIA Isaac-GR00T: https://github.com/NVIDIA/Isaac-GR00T
- Dataset asociado: https://huggingface.co/datasets/geonmin-kim/rollout_groot_so101_mdrift_crop_step1000_move_the_red_cube_from_t_sync_0903_1555_20260903_155610
