# Samisaliveagain/vla-jepa-so101-stack-unstack-batch8-step30000-lora

## Resumen

VLA-JEPA LoRA para SO-101 es un checkpoint de ajuste fino mediante PEFT/LoRA del modelo base `lerobot/VLA-JEPA-Pretrain`, orientado a la ejecucion de politicas de robotica (stack y unstack de tuercas impresas en 3D) sobre un brazo robotico SO-101 de 6 grados de libertad. Lo desarrollan Samyak Jain (`Samisaliveagain`) y Shubham (`shubham4413`), y se publica bajo licencia Apache 2.0. El modelo resuelve el problema de adaptar un modelo vision-lenguaje-accion (VLA) preentrenado a una tarea fisica concreta y a una morfologia de robot especifica, sin necesidad de reentrenar el backbone completo.

La relevancia de esta ficha radica en que ejemplifica el patron actual de especializacion de modelos fundacionales roboticos: se congela el backbone Qwen3-VL y el codificador V-JEPA2, se entrenan adaptadores LoRA de rango 16 sobre las proyecciones de atencion y MLP, y se entrenan por completo la cabeza de accion (DiT con flow matching) y el predictor de video JEPA. El resultado es un adaptador de 334,3 M de parametros entrenables sobre un total de 3.104,6 M (10,77 %), empaquetado en un repositorio de 1,3 GB que no duplica los pesos del modelo base.

El checkpoint corresponde al paso 30.000 de entrenamiento con batch size 8, con una perdida final registrada de 0,134. No se han publicado evaluaciones offline sobre el conjunto reservado ni tasas de exito en robot real, por lo que debe tratarse como un artefacto de investigacion para evaluacion controlada, no como un sistema listo para produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VLA hibrida: backbone Qwen3-VL + codificador V-JEPA2 congelado + predictor de video JEPA condicionado por accion + cabeza de accion DiT con flow matching; ajuste fino via PEFT/LoRA |
| Parametros totales | 3.104.588.172 |
| Parametros activos | no disponible (no es MoE) |
| Parametros entrenables | 334.258.694 (10,77 %) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (las instrucciones de tarea son texto; el dataset solo cubre stack/unstack) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptadores `adapter_model.safetensors` + safetensors de preprocesado y postprocesado) |
| Libreria | LeRobot |
| Modelo base | `lerobot/VLA-JEPA-Pretrain` |
| Entradas | 2 imagenes RGB de 3x224x224 (`observation.images.exterior_1_left`, `observation.images.exterior_2_left`) + instruccion de tarea en texto |
| Salida | accion de posicion articular SO-101 de forma (6,); chunk de accion de tamano 7; indice de pinza 5 |
| Orden articular | shoulder_pan.pos, shoulder_lift.pos, elbow_flex.pos, wrist_flex.pos, wrist_roll.pos, gripper.pos |
| SHA-256 de pesos | `ad1e2175d1708d65e029924b3ccbe6278b04c9dc2352adf5f191b7babd4373b4` |
| Tamano del repositorio | 1,3 GB |

## Arquitectura y entrenamiento

El modelo combina cuatro componentes. El backbone Qwen3-VL procesa las dos vistas RGB y la instruccion de tarea, con pesos base congelados y adaptadores LoRA de rango 16 (alpha 32, dropout 0,0) insertados en las proyecciones de atencion (`q_proj`, `k_proj`, `v_proj`, `o_proj`) y de MLP (`gate_proj`, `up_proj`, `down_proj`). Un codificador V-JEPA2 congelado aporta representaciones visuales latentes, y un predictor de video JEPA condicionado por accion, entrenado por completo, modela la dinamica del entorno (world model). La cabeza de accion es un DiT con flow matching, tambien entrenada por completo, que genera acciones de 6 dimensiones con chunk de tamano 7. Cuatro tensores de la interfaz accion/estado del preentrenamiento de 7 DoF se reinicializaron deliberadamente para adaptarse al SO-101 de 6 DoF: `action_model.action_encoder.layer1.weight`, `action_model.action_decoder.layer2.weight`, `action_model.action_decoder.layer2.bias` y `action_model.state_encoder.layer1.weight`.

El entrenamiento uso el dataset `Samisaliveagain/so101_wm`, con 177 episodios de demostraciones teleoperadas de stack y unstack de tuercas grandes impresas en 3D, grabadas con dos camaras sincronizadas (`left` y `fpv`) a 640x480 y 30 FPS. El split fue a nivel de episodio con semilla 1000: 151 episodios de entrenamiento (302.957 frames) y 26 reservados. Se consumieron 240.000 muestras, aproximadamente 0,79 pasadas sobre los frames de entrenamiento. Se uso AdamW con learning rate pico de 1e-4, warm-up de 5.000 pasos, decaimiento coseno hasta 1e-6, clipping de gradiente de 1,0, peso de perdida del world model de 0,1 y dtype bfloat16. El entrenamiento completo 30.000 pasos con perdida final registrada de 0,134. El pipeline de despliegue debe aplicar el mapeo exacto de camaras `observation.images.left` -> `observation.images.exterior_1_left` y `observation.images.fpv` -> `observation.images.exterior_2_left`.

## Capacidades

- Generacion de acciones de posicion articular de 6 DoF para el brazo SO-101, con chunk de accion de tamano 7.
- Ejecucion de dos tareas manipulativas concretas: apilar (stack) y desapilar (unstack) tuercas impresas en 3D.
- Percepcion visual multimodal a partir de dos vistas RGB sincronizadas (vista exterior izquierda y vista en primera persona).
- Condicionamiento por instruccion de tarea en texto (seleccion entre stack y unstack).
- Modelado de dinamica del entorno mediante predictor de video JEPA (world model), usado como senal auxiliar de entrenamiento.
- Aprendizaje eficiente de nueva morfologia: adaptacion de interfaz accion/estado de 7 DoF a 6 DoF con reinicializacion selectiva de tensores.
- No dispone de tool calling, function calling, soporte de agentes multi-paso, vision general, audio ni modo de razonamiento extendido; es un modelo de politica robotica, no un asistente conversacional.

## Casos de uso

- Investigacion en politicas VLA para brazos de bajo coste: el adaptador permite reproducir el ajuste fino de un backbone VLA sobre un SO-101 sin reentrenar los 3,1 B de parametros, reduciendo el coste computacional a 334,3 M de parametros entrenables.
- Evaluacion controlada de stacking/unstacking en laboratorio: sirve como referencia de politica para comparar variantes de world model, tamano de LoRA o regimen de entrenamiento sobre el mismo dataset y setup de camaras.
- Estudio de adaptacion de morfologia: los cuatro tensores reinicializados de 7 a 6 DoF son un caso documentado para investigar transferencia entre interfaces accion/estado de distinta dimensionalidad.
- Base para ajuste fino posterior en tareas de ensamblaje: al conservar el backbone Qwen3-VL y el codificador V-JEPA2 intactos, el adaptador puede servir de punto de partida para nuevas tareas con el mismo robot y disposicion de camaras.
- Docencia y formacion en robotica de manipulacion: permite montar un pipeline LeRobot completo (dataset teleoperado, entrenamiento LoRA, despliegue en robot) con requisitos de hardware moderados.
- Validacion de infraestructura de despliegue LeRobot/PEFT: util para verificar la carga correcta del modelo base, la aplicacion de adaptadores y las estadisticas de normalizacion de acciones antes de escalar a otros checkpoints.
- Analisis de perdida frente a exito fisico: el checkpoint con perdida 0,134 y sin evaluacion en robot real es un caso practico para estudiar la correlacion entre objetivo de entrenamiento y tasa de exito.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card solo reporta la perdida final de entrenamiento (0,134) y declara explicitamente que la evaluacion offline sobre el conjunto reservado y la tasa de exito en robot real no se han comunicado. La perdida no debe interpretarse como porcentaje de exito fisico.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la informacion proporcionada. Como referencia orientativa, el modelo base completo tiene 3,1 B de parametros; en bfloat16 requeriria del orden de 6-7 GB solo para pesos, mas memoria para activaciones, dos flujos de imagen de 224x224 y el predictor de video. Cifra no confirmada por el autor.
- GPU recomendadas: no disponible. No se especifican modelos de GPU probados por el autor.
- Compatibilidad con GPU de consumo: no confirmada. Un modelo de 3,1 B en bfloat16 es teoricamente desplegable en GPUs de consumo con 12-16 GB de VRAM, pero el componente de world model y el procesamiento de dos camaras anaden memoria no cuantificada en la informacion disponible.
- Opciones de despliegue: LeRobot con PEFT (carga `lerobot/VLA-JEPA-Pretrain` y aplica el adaptador). No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no son adecuados para este tipo de modelo de politica robotica.
- Latencia y throughput: no disponibles.
- Requisito de despliegue: mapeo exacto de camaras (`left` -> `exterior_1_left`, `fpv` -> `exterior_2_left`) y uso de los safetensors de preprocesado/postprocesado para normalizar y desnormalizar acciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| VLA-JEPA LoRA SO-101 (este) | 3.104,6 M totales; 334,3 M entrenables | no disponible | Stack/unstack SO-101 6 DoF | Apache 2.0 | Hugging Face, 30 descargas |
| `lerobot/VLA-JEPA-Pretrain` (base) | 3.104,6 M | no disponible | Politica VLA general preentrenada | no disponible en la informacion | Hugging Face |
| Otros modelos VLA open source | no disponible | no disponible | no disponible | no disponible | no disponible |

La informacion proporcionada no incluye datos de rendimiento de alternativas comparables, por lo que no es posible establecer una comparacion cuantitativa de benchmarks. La comparacion con el modelo base es estructural: este checkpoint anade adaptadores LoRA y entrena cabeza de accion y predictor de video, pero no modifica el backbone Qwen3-VL ni el codificador V-JEPA2.

## Limitaciones y advertencias

- Sin evaluacion publicada: no hay tasa de exito en robot real ni resultados offline sobre los 26 episodios reservados; la perdida de 0,134 no equivale a exito fisico.
- Especializacion estrecha: solo cubre las tareas stack y unstack de tuercas impresas en 3D, con los objetos, disposicion de camaras y espacio de trabajo del dataset `so101_wm`.
- Dependencia de morfologia: entrenado para SO-101 de 6 DoF; no es directamente transferible a brazos de otra cinematica sin reajuste de la interfaz accion/estado.
- Dependencia de calibracion de camaras: el mapeo `left`/`fpv` y la resolucion 640x480 a 30 FPS del dataset deben reproducirse; desviaciones degradan la politica.
- Riesgo de alucinacion en el sentido de acciones fisicamente invalidas o fuera de distribucion: el modelo puede generar trayectorias no seguras ante objetos, iluminacion o posiciones no vistas en entrenamiento.
- Uso no supervisado desaconsejado: el autor prohibe explicitamente la operacion sin supervision cerca de personas, objetos fragiles o equipos de seguridad critica; se exige operador en la parada de emergencia durante los primeros rollouts.
- Sesgos: no documentados en la informacion disponible; el dataset refleja una unica mesa, iluminacion y conjunto de objetos.
- Licencia Apache 2.0 permite uso comercial, pero el modelo base `lerobot/VLA-JEPA-Pretrain` debe verificarse por separado, ya que su licencia no se detalla en la informacion proporcionada.
- El repositorio no es autocontenido: requiere descargar el modelo base de 3,1 B y aplicar el adaptador; no puede desplegarse solo con los 1,3 GB del repo.
- Estado del paso de entrenamiento: la model card indica que la evidencia del paso 30.000 proviene de la propia model card y que no hay sidecar de pasos en crudo disponible.

## Enlaces

- Hugging Face del modelo: https://huggingface.co/Samisaliveagain/vla-jepa-so101-stack-unstack-batch8-step30000-lora
- Modelo base: https://huggingface.co/lerobot/VLA-JEPA-Pretrain
- Dataset de entrenamiento: https://huggingface.co/datasets/Samisaliveagain/so101_wm
- Perfil del autor principal: https://huggingface.co/Samisaliveagain
- Perfil del coautor: https://huggingface.co/shubham4413
- Paper de referencia (arXiv 2602.10098): https://arxiv.org/abs/2602.10098
- Identidad y procedencia legible por maquina: `model_identity.json` dentro del repositorio del modelo
