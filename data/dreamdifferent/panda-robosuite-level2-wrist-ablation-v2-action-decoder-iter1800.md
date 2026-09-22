# dreamdifferent/panda-robosuite-level2-wrist-ablation-v2-action-decoder-iter1800

## Resumen

El modelo `dreamdifferent/panda-robosuite-level2-wrist-ablation-v2-action-decoder-iter1800` es un checkpoint del decodificador de acciones World2Action del proyecto VAM-Cross MimicVideo, publicado por el usuario dreamdifferent en Hugging Face. No es un modelo de lenguaje ni un modelo multimodal de proposito general: es un componente de robotica que transforma representaciones latentes de video, producidas por un backbone Video2World con una LoRA de video congelada, en comandos de accion motora de 15 dimensiones para un brazo robotico (posicion final del efector, agarre y rotacion en representacion 6D).

El checkpoint corresponde a la iteracion 1800 de la ejecucion `w2a_panda_robosuite_level2_2cam_wrist_ablation_v2_action_iter2374_videolora_iter200_widowx_teleop_recording_frame_v1`, que finalizo con estado `completed`. El autor indica que se verifico el ultimo conjunto completo de checkpoints de modelo, optimizador, planificador y entrenador antes de seleccionar el peso publicado. La variante es una ablacion con camara de muneca sobre el entorno robosuite nivel 2 de Panda, con datos teleoperados de WidowX.

Su relevancia actual es de investigacion: ejemplifica la separacion entre prediccion de video (world model) y decodificacion de acciones, y permite reproducir el experimento exacto gracias al anclaje de los commits de las entradas congeladas. El repositorio pesa 1,0 GB, no declara licencia ni idiomas, no tiene benchmarks publicados y acumula 0 descargas y 0 valoraciones en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Decodificador de acciones World2Action sobre backbone Video2World (VAM-Cross MimicVideo); salida de 15 acciones de efector final y pinza; rotacion en representacion 6D |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo de mezcla de expertos) |
| Longitud de contexto | no disponible; no aplica en el sentido de contexto textual |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no aplica (modelo de robotica, sin entrada ni salida de texto) |
| Licencia | no disponible |
| Formato de pesos | no disponible en la informacion proporcionada |
| Pipeline declarado | robotics |
| Etiquetas | mimic-video, robotics, action-prediction, region:us |
| Tamano del repositorio | 1,0 GB |
| Frecuencia de control | 5 Hz |
| Dimension del vector de accion | 15 |
| Camaras de entrada | `observation.images.corner_cam`, `observation.images.wrist_cam` |
| Objetivo de pose | `relative_to_current_achieved_pose` en `widowx_reference_base/teleop_aligned_tool` |
| Dataset de entrenamiento | `dreamdifferent/vam-cross-level2-panda-robosuite-widowx-texture-corner-wrist-v2` (280 episodios, 54 426 frames) |
| Iteracion del checkpoint | 1800 (ejecucion completada en la iteracion 2374) |
| Framework de entrenamiento | MimicVideo, commit `e3355dbc93132b576c02f920a59b4fc18a4f5906` |

## Arquitectura y entrenamiento

La informacion disponible describe un esquema de dos etapas: un backbone Video2World preentrenado (`dreamdifferent/widowx250-wrist-ablation-v1-video-fused`, commit `8e39d96344dea0a82ae673874a38206a6c412948`) con una LoRA de video congelada (`dreamdifferent/panda-robosuite-level2-wrist-ablation-v2-video-lora-iter200`, commit `399d3773289e26a0e063aa7418f05368306d065a`) genera representaciones a partir de video, y el decodificador de acciones publicado aqui se inicializa desde otro decodificador previo (`dreamdifferent/widowx250-wrist-ablation-v1-action-decoder-iter2374`, commit `0ea6db91672db019d9d6dc9a6c9bd1ecc0504001`) y se entrena sobre esas representaciones. No se especifica el tipo de bloque interno del decodificador, el numero de capas, la dimension oculta ni el numero de parametros.

Los datos proceden del dataset `vam-cross-level2-panda-robosuite-widowx-texture-corner-wrist-v2` (commit `2a165cf153fca01ad80cab3689d778e34b63ff38`), con 280 episodios y 54 426 frames, dos camaras (esquina y muneca) y objetivos de accion de 15 dimensiones a 5 Hz. El objetivo de pose es relativo a la pose alcanzada actual, expresado en el marco de referencia `widowx_reference_base/teleop_aligned_tool`, lo que implica que las acciones se expresan en un marco alineado con WidowX aunque la recoleccion se haya realizado en el entorno robosuite de Panda. No se documenta el numero de tokens o frames de entrenamiento, la composicion del dataset, ni si se aplicaron tecnicas de ajuste por preferencias (RLHF o DPO), que en cualquier caso serian poco habituales en este tipo de modelo. Tampoco se declara ninguna innovacion tecnica adicional (decodificacion especulativa, atencion lineal, etc.). La variante se etiqueta como `wrist_ablation_v2`, de modo que su proposito es comparativo dentro de una familia de experimentos de ablacion.

## Capacidades

- Prediccion de acciones de manipulacion robotica: genera 15 valores de accion (efector final y pinza) a partir de observaciones de video de dos camaras.
- Control a 5 Hz: la frecuencia de salida esta fijada por el contrato de datos del entrenamiento.
- Representacion de rotacion en 6D y objetivos de pose relativos a la pose alcanzada, en el marco alineado con WidowX.
- Condicionamiento por latentes de video de un world model (Video2World) mas una LoRA de video congelada, en lugar de por tokens de texto.
- Uso como cabeza de decodificacion intercambiable: el autor publica el decodificador por separado del backbone, lo que permite sustituirlo sin reentrenar el modelo de video.
- Reproducibilidad anclada: todos los artefactos requeridos (backbone, decodificador inicial, LoRA) estan fijados por commit.
- No dispone de generacion de texto, razonamiento simbolico, codigo, matematicas, vision general, tool calling, function calling, uso como agente, soporte multilingue, modo de razonamiento, audio ni ninguna otra capacidad de los modelos de lenguaje o vision-lenguaje.

## Casos de uso

- Investigacion en manipulacion robotica con world models: el decodificador permite estudiar hasta que punto los latentes de un modelo de video son suficientes para producir acciones, manteniendo el backbone de video congelado y aislando la contribucion de la cabeza de accion.
- Reproduccion de experimentos de ablacion: la variante `wrist_ablation_v2` esta pensada para compararse con otras configuraciones (por ejemplo, sin camara de muneca o con otro conjunto de texturas) bajo el mismo dataset y el mismo contrato de acciones.
- Evaluacion en robosuite nivel 2: el modelo esta entrenado sobre episodios de ese entorno, por lo que puede emplearse para medir tasas de exito de la politica en tareas de manipulacion de dificultad media.
- Base para ajuste fino en un dominio propio: al ser una cabeza de accion pequena y separada del backbone, puede reentrenarse sobre datos teleoperados nuevos sin tocar el modelo de video.
- Recoleccion teleoperada tipo WidowX: el marco de referencia de pose esta alineado con WidowX, de modo que el modelo puede integrarse en configuraciones de robot real que compartan esa convencion de efector.
- Banco de pruebas interno de pipelines de imitacion: sirve como punto de comparacion fijo (checkpoint anclado por commit) en pruebas de regresion de infraestructura de entrenamiento e inferencia.
- Estudio de transferencia de texturas y condiciones visuales: el sufijo `texture-corner-wrist-v2` del dataset sugiere que el modelo puede usarse para evaluar sensibilidad a la apariencia visual frente a cambios de punto de vista de camara.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye tasas de exito, error de posicion, ni comparaciones cuantitativas con otras variantes o con otros modelos. No se dispone tampoco de datos de latencia o throughput.

## Requisitos de hardware

- VRAM para inferencia: no disponible. El unico dato dimensional es el tamano del repositorio, 1,0 GB, que corresponde al checkpoint del decodificador mas los archivos auxiliares; no se especifica el reparto entre pesos y otros artefactos.
- El repositorio no contiene las entradas congeladas (backbone Video2World, LoRA de video y decodificador inicial), por lo que la huella real de inferencia es mayor que 1,0 GB y no puede estimarse con la informacion disponible.
- GPU recomendadas: no disponible. Dado el tamano reducido del artefacto, es plausible que quepa en GPU de consumo (por ejemplo, una RTX 4090 o una RTX 3090), pero esto es una inferencia a partir del tamano del repositorio, no un dato confirmado por el autor.
- Opciones de despliegue: no disponibles. La model card no menciona vLLM, llama.cpp, Ollama, TGI ni ningun otro servidor; el consumo previsto es a traves del framework MimicVideo en el commit indicado.
- Latencia y throughput: no disponibles. La unica cifra temporal conocida es la frecuencia de control del dataset, 5 Hz, que impone un presupuesto de 200 ms por paso de control si se despliega en tiempo real, pero no se ha medido el tiempo de inferencia real.

## Comparativa con modelos similares

No se dispone de datos de comparacion. El autor no publica resultados frente a otras variantes de la misma familia (por ejemplo, las versiones sin ablacion de muneca o con backbone `widowx250-wrist-ablation-v1`) ni frente a otros enfoques de politica robotica. Como referencias de categoria, este checkpoint se situa en el espacio de los decodificadores accion-a-partir-de-world-models, distinto del de los modelos vision-lenguaje-accion (VLA) y del de las politicas de difusion, pero no existe en la informacion proporcionada ningun dato de parametros, contexto, rendimiento o licencia de esos otros enfoques que permita una comparacion rigurosa.

| Criterio | Este modelo | Alternativas de la misma familia | Otros enfoques (VLA, politicas de difusion) |
|---|---|---|---|
| Parametros | no disponible | no disponible | no disponible |
| Contexto / horizonte | no disponible | no disponible | no disponible |
| Rendimiento en tareas | no disponible | no disponible | no disponible |
| Licencia | no disponible | no disponible | no disponible |
| Disponibilidad | publico en Hugging Face, 0 descargas | publicos en Hugging Face | no evaluado |

## Limitaciones y advertencias

- No es un modelo de lenguaje: no acepta prompts de texto ni genera texto, codigo o razonamiento. Cualquier uso fuera del control robotico es un error de aplicacion.
- Ausencia de licencia: no se declara ninguna licencia, lo que genera incertidumbre juridica sobre el uso comercial, la redistribucion y la creacion de obras derivadas. Conviene contactar con el autor antes de cualquier uso en produccion.
- Ausencia de documentacion tecnica: no se especifican parametros, arquitectura interna, formato de pesos ni requisitos de hardware, lo que dificulta la planificacion de recursos.
- Dependencia estricta de artefactos congelados: el modelo requiere el backbone Video2World, la LoRA de video y el decodificador inicial en commits concretos, ademas del `config.yaml` efectivo y un JSON fijado. El dataset y esas entradas no se incluyen en el repositorio.
- Riesgo de sobreajuste al dominio: el entrenamiento se limita a 280 episodios y 54 426 frames de un unico entorno (robosuite nivel 2 con texturas concretas). El comportamiento fuera de esa distribucion visual o dinamica no esta caracterizado.
- Checkpoint intermedio: el peso publicado es la iteracion 1800 de una ejecucion que llego hasta la 2374, por lo que no es el punto final del entrenamiento.
- Frecuencia de control baja: 5 Hz resulta insuficiente para tareas que requieran correccion rapida o contacto dinamico.
- Marco de referencia especifico: las acciones se expresan en `widowx_reference_base/teleop_aligned_tool` y son relativas a la pose alcanzada, de modo que un cambio de cinematica o de convencion de efector invalida las salidas.
- Riesgo de alucinacion: no aplica en el sentido linguistico; el equivalente es la generacion de acciones plausibles pero fisicamente incorrectas cuando la observacion se aleja de la distribucion de entrenamiento.
- Sesgos conocidos: no documentados. Al tratarse de datos teleoperados, cabe esperar sesgos derivados del estilo de demostracion del operador, pero no hay analisis publicado.
- Cero adopcion verificable: 0 descargas y 0 valoraciones implican que no existe evidencia externa de funcionamiento ni de reproducibilidad por terceros.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/dreamdifferent/panda-robosuite-level2-wrist-ablation-v2-action-decoder-iter1800
- Backbone inicial Video2World: https://huggingface.co/dreamdifferent/widowx250-wrist-ablation-v1-video-fused
- Decodificador de acciones inicial: https://huggingface.co/dreamdifferent/widowx250-wrist-ablation-v1-action-decoder-iter2374
- LoRA de video congelada: https://huggingface.co/dreamdifferent/panda-robosuite-level2-wrist-ablation-v2-video-lora-iter200
- Dataset de entrenamiento: https://huggingface.co/datasets/dreamdifferent/vam-cross-level2-panda-robosuite-widowx-texture-corner-wrist-v2
- Commit de MimicVideo requerido: `e3355dbc93132b576c02f920a59b4fc18a4f5906` (no se ha proporcionado URL del repositorio de codigo)
- Busqueda web: los resultados devueltos no guardan ninguna relacion con el modelo (contenido financiero del portal neerlandes IEX.nl y articulos de ABN AMRO), por lo que no aportan enlaces relevantes. No se dispone de paper, blog, repositorio de codigo ni demo asociados.
