# Jinstudio/flux-3-action-so101

## Resumen

FLUX 3 Action SO-101 es un modelo de accion sobre el mundo (world action model) de pesos abiertos con 6.947.071.232 parametros (aproximadamente 7B), desarrollado por Black Forest Labs (BFL). Este repositorio concreto, Jinstudio/flux-3-action-so101, es un espejo sin restriccion de acceso (ungated mirror) del repositorio oficial black-forest-labs/flux-3-action-so101, subido por el usuario Jinstudio. No se trata de una publicacion oficial de BFL y los derechos de uso se conceden directamente por BFL bajo la licencia FLUX Kommunity.

El modelo recibe fotogramas de camara, el estado del robot y una instruccion en lenguaje natural, y devuelve el siguiente bloque de acciones. A diferencia de las politicas de imitacion clasicas, las acciones se desruidan conjuntamente con los siguientes fotogramas de video predichos, de modo que la prediccion motora y la prediccion visual comparten el mismo proceso de difusion. Esta especializado en el brazo robotico de bajo coste SO-101 dentro del ecosistema LeRobot y se distribuye integrado en la libreria lerobot.

Su relevancia actual radica en que acerca un modelo de clase 7B con codificador de vision-lenguaje congelado (Qwen3-VL-4B-Instruct) al control de robots de sobremesa, con un contrato de observacion y accion completamente especificado (dos camaras, seis dimensiones de estado/accion) y una receta de ajuste fino LoRA incluida en el propio repositorio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo de accion sobre el mundo (world action model) basado en difusion; desruidado conjunto de acciones y fotogramas de video; codificador de texto Qwen3-VL-4B-Instruct congelado (Apache-2.0) |
| Parametros totales | 6.947.071.232 (aproximadamente 7B) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (la model card no especifica cuantizaciones publicadas) |
| Idiomas soportados | no disponible (la condicion textual es en lenguaje natural, pero no se declaran idiomas) |
| Licencia | FLUX Kommunity License v.1.0 (identificador flux-kommunity-license); uso no comercial |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

FLUX 3 Action es un modelo de difusion que procesa, por un lado, observaciones multimodales (dos imagenes de camara y el estado del robot) junto con una instruccion textual y, por otro, genera un bloque de acciones futuras. La innovacion principal es que las acciones se desruidan simultaneamente con los siguientes fotogramas de video, lo que actua como senal auxiliar de prediccion visual durante el entrenamiento y la inferencia. El codificador de texto es una copia sin modificar de Qwen3-VL-4B-Instruct bajo licencia Apache-2.0, cargada desde el repositorio base black-forest-labs/flux-3-action-base; este repositorio no duplica pesos de codificadores.

El checkpoint define un contrato de observacion y accion cerrado: dos camaras (`observation.images.scene` y `observation.images.wrist`, en ese orden), seis dimensiones de estado/accion con acciones de delta de articulacion y pinza absoluta, ocho observaciones con dos instantaneas visuales y condicionamiento por comandos pasados. El modelo predice 42 acciones, ejecuta 32 a 30 Hz y vuelve a planificar. El muestreo usa cuatro pasos de Euler, shift 6,93, guidance 3, semilla 42 y BF16. La adaptacion a tareas se realiza con una receta LoRA de rango 32, precision mixta bf16, tamano de lote 2, acumulacion de gradiente 4 y 10.000 pasos, incluida como `lora.json`.

Los datos de entrenamiento son los episodios de SO-101 del dataset lerobot/community_dataset_v3. No se especifica en la informacion disponible el numero total de tokens, la composicion detallada del dataset ni si se aplicaron etapas de RLHF o DPO.

## Capacidades

- Generacion de acciones roboticas: produce bloques de 42 acciones (32 ejecutadas) en formato de delta de articulacion con pinza absoluta, a 30 Hz con replanificacion.
- Prediccion visual: genera fotogramas del escenario en el que actua como parte del mismo proceso de desruidado.
- Condicionamiento por lenguaje natural: acepta una instruccion textual que guia la tarea de manipulacion.
- Fusion multimodal de dos camaras: consume simultaneamente una vista de escena y una vista de muneca.
- Condicionamiento por historial: incorpora ocho observaciones y comandos pasados como contexto.
- Ajuste fino por LoRA: soporta adaptacion a nuevos datasets mediante receta incluida, sin reentrenar el modelo completo.
- Integracion con LeRobot: se carga mediante `Flux3Policy.from_pretrained` y los preprocesadores/postprocesadores asociados.
- Soporte de agentes, tool calling, matematicas, codigo o audio: no disponible; el modelo esta orientado exclusivamente al control robotico.
- Capacidades multilingues: no disponible.

## Casos de uso

- Manipulacion pick-and-place con SO-101: el modelo traduce la instruccion textual y las vistas de camara en deltas de articulacion a 30 Hz, lo que permite recoger y colocar objetos con replanificacion cada 32 acciones.
- Aprendizaje por demostracion en laboratorio: partiendo de episodios recogidos en el propio robot, se puede ajustar el checkpoint con la receta LoRA de rango 32 para adaptar la politica a una tarea nueva sin reentrenar los 7B parametros.
- Investigacion en world models para robotica: la prediccion conjunta de acciones y fotogramas facilita estudios sobre la coherencia entre representacion visual y control motor.
- Automatizacion de tareas de laboratorio repetitivas: tareas de trasvase, ordenacion o alimentacion de maquinas que requieran dos camaras (escena y muneca) y precision a nivel de articulacion.
- Generacion de datos sinteticos de manipulacion: los fotogramas predichos pueden emplearse como senal auxiliar para aumentar datasets de entrenamiento en simulacion o en banco.
- Evaluacion comparativa de politicas roboticas: al estar integrado en LeRobot, sirve como referencia frente a otras politicas dentro del mismo framework de evaluacion.
- Formacion y prototipado en robotica educativa: el SO-101 es un brazo de bajo coste y el modelo cabe en una GPU profesional, lo que permite montar practicas de robot learning con pesos abiertos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de exito en tareas, tasas de exito en simulacion ni comparaciones cuantitativas con otras politicas.

## Requisitos de hardware

Las cifras siguientes son estimaciones derivadas del numero de parametros y no han sido facilitadas por el autor.

- VRAM estimada en BF16: en torno a 14 GB solo para los 7B parametros del modelo de accion, mas la memoria de activaciones y del codificador de texto Qwen3-VL-4B (aproximadamente 8 GB adicionales), lo que situa el total practico en el rango de 22-30 GB.
- VRAM estimada en precision reducida (INT8): alrededor de 7-8 GB para el modelo de accion, mas el codificador; util para GPUs de 24 GB con margen.
- GPU recomendadas: A100 40 GB o 80 GB, H100, L40S y, con cuantizacion o descarga parcial de capas, RTX 4090 (24 GB).
- Cabe en GPU de consumo: si es viable en RTX 4090 y RTX 3090 (24 GB) en BF16 ajustado o en cuantizacion, aunque la carga simultanea del codificador Qwen3-VL-4B exige gestion cuidadosa de memoria.
- Opciones de despliegue: LeRobot mediante `Flux3Policy` y los preprocesadores asociados, junto con el codigo de entrenamiento e inferencia del repositorio black-forest-labs/flux-action. No se documenta soporte especifico de vLLM, llama.cpp, Ollama o TGI para este modelo.
- Latencia y rendimiento: el contrato de inferencia especifica cuatro pasos de Euler y una ejecucion de 32 acciones a 30 Hz, pero no se publican medidas de latencia por paso ni de throughput en la informacion disponible.
- Nota de seguridad: el modelo emite objetivos de articulacion y no acota velocidad, fuerza ni espacio de trabajo; la aplicacion debe imponer esos limites y disponer de una parada de hardware accesible.

## Comparativa con modelos similares

Los datos de esta tabla proceden de fuentes publicas de cada proyecto y no de la informacion proporcionada en esta ficha; conviene verificarlos en la documentacion oficial de cada modelo antes de usarlos.

| Modelo | Parametros | Tipo | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| FLUX 3 Action SO-101 | 6,95B | World action model por difusion | no disponible | FLUX Kommunity (no comercial) | Pesos abiertos en HuggingFace |
| OpenVLA | 7B | VLA transformer (acciones discretizadas) | no disponible | Licencia abierta con componentes Llama | Pesos abiertos |
| pi0 (Physical Intelligence) | aproximadamente 3B | VLA basado en flujo | no disponible | Codigo abierto (openpi) | Pesos y codigo publicos |
| GR00T N1 (NVIDIA) | aproximadamente 2,2B | VLA con VLM y difusion de acciones | no disponible | Licencia NVIDIA | Pesos publicos con condiciones |

## Limitaciones y advertencias

- Campos vacios en la informacion: no se declaran benchmarks, idiomas soportados, cuantizaciones publicadas ni longitud de contexto, lo que dificulta la comparacion objetiva con alternativas.
- Espejo no oficial: Jinstudio/flux-3-action-so101 es una copia subida por un tercero; para uso serio conviene referenciar el repositorio oficial black-forest-labs/flux-3-action-so101.
- Licencia no comercial: la FLUX Kommunity License v.1.0 impide el uso comercial directo del modelo y sus derivados; cualquier despliegue productivo requiere revisar los terminos con BFL.
- Ausencia de limites fisicos: el modelo devuelve objetivos de articulacion sin acotar velocidad, fuerza ni espacio de trabajo; es obligatorio anadir limites y una parada de hardware.
- Riesgo en entornos con personas: los terminos de uso prohiben controlar maquinas que pongan en peligro a personas sin supervision humana y medios de parada.
- Sesgos y alucinacion: no disponible; la model card no documenta evaluaciones de sesgo ni tasas de fallo de la politica. Al ser un modelo generativo con prediccion visual, los fotogramas predichos pueden no corresponder con el estado real.
- Dependencia del contrato de observacion: el modelo espera dos camaras concretas, seis dimensiones de estado/accion y ocho observaciones; desviarse de ese contrato invalida la inferencia sin un ajuste fino previo.
- Idiomas: no se declara cobertura multilingue de la instruccion textual, por lo que el comportamiento con instrucciones en castellano no esta garantizado.
- Uso de codigo de terceros: el codigo del repositorio flux-action tiene licencia propia y el codificador de texto es una copia de Qwen3-VL-4B-Instruct bajo Apache-2.0, con condiciones distintas a las de los pesos del modelo.

## Enlaces

- Modelo en HuggingFace (espejo): https://huggingface.co/Jinstudio/flux-3-action-so101
- Modelo oficial de referencia: https://huggingface.co/black-forest-labs/flux-3-action-so101
- Repositorio base de codificadores: https://huggingface.co/black-forest-labs/flux-3-action-base
- Coleccion FLUX 3 Action: https://huggingface.co/collections/black-forest-labs/flux-3-action-6ab25aef555dd30ab86567f8
- Dataset de entrenamiento: https://huggingface.co/datasets/lerobot/community_dataset_v3
- Codigo de entrenamiento e inferencia: https://github.com/black-forest-labs/flux-action
- Documentacion general de FLUX 3 Action: https://docs.bfl.ai/flux_3/flux3_action_overview
- Guia de SO-101 con LeRobot: https://docs.bfl.ai/flux_3/flux3_action_so101
- Guia de inferencia: https://docs.bfl.ai/flux_3/flux3_action_inference
- Guia de ajuste fino: https://docs.bfl.ai/flux_3/flux3_action_finetuning
- Blog de desarrollo responsable: https://bfl.ai/blog/capable-open-and-safe-combating-ai-misuse
- Contacto de seguridad de BFL: safety@blackforestlabs.ai
