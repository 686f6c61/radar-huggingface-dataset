# Dongkkka/GR00T-N1.7-SH5-Task000802-Tactile-200k

## Resumen

GR00T-N1.7-SH5-Task000802-Tactile-200k es un ajuste fino (fine-tuning) del modelo fundacional de robotica NVIDIA GR00T-N1.7-3B, publicado por el usuario Dongkkka en HuggingFace. El modelo esta especializado en una unica tarea de manipulacion bimanual con una mano SH5 equipada con sensores tactiles: recoger una compresa sanitaria blanca de una caja con la mano derecha y sostenerla. No es un modelo de lenguaje generalista, sino una politica visomotora (vision-language-action, VLA) que transforma observaciones multimodales en comandos de articulaciones absolutos.

El modelo parte de los 3.144.022.064 parametros del checkpoint base de NVIDIA y se ha entrenado durante 200.000 pasos sobre 161 episodios (58.044 fotogramas a 30 Hz) del dataset Task000802. Incorpora una extension tactil propietaria (adaptador SH5) que anade 90 taxeles crudos como entrada, ademas de tres camaras RGB, instruccion en lenguaje natural y 54 articulaciones medidas. La salida son comandos de 40x54 dimensiones que cubren brazo izquierdo, brazo derecho y ambas manos de 20 grados de libertad.

Su relevancia es acotada pero significativa: demuestra como adaptar un modelo fundacional robotico de NVIDIA a un embodiment concreto con percepcion tactil, un area donde los modelos VLA abiertos aun son escasos. La licencia Apache 2.0 facilita su reutilizacion, aunque el modelo solo es funcional con el adaptador tactil SH5 personalizado y la cache del tokenizer Cosmos de NVIDIA, lo que limita su portabilidad fuera del entorno de entrenamiento original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-language-action (VLA) derivada de GR00T N1.7 (transformer multimodal con tokenizer Cosmos) |
| Parametros totales | 3.144.022.064 (3,14 B) |
| Parametros activos | no disponible (no se indica si el modelo base es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors, presumiblemente bf16/fp32) |
| Idiomas soportados | no disponible (la instruccion de entrenamiento esta en ingles) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (con checkpoints en `checkpoint-50000`, `checkpoint-100000`, `checkpoint-150000`, `checkpoint-200000`) |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura GR00T N1.7 de NVIDIA, un modelo fundacional visomotoro que combina un codificador visual, un tokenizer Cosmos para representaciones latentes y un decodificador de acciones. Sobre esta base, el autor anade un adaptador tactil SH5 especifico que procesa 90 taxeles crudos mediante un `finger_mlp` con embedding de 32 dimensiones. Las entradas son tres camaras RGB, una instruccion en lenguaje natural, 54 articulaciones medidas y los 90 taxeles tactiles; las salidas son comandos absolutos de 40x54 (brazo izquierdo 7, brazo derecho 7, mano izquierda 20, mano derecha 20).

El entrenamiento se realizo desde cero sobre el checkpoint base de NVIDIA (no sobre pesos de tareas previas), con 200.000 pasos, learning rate 1e-4, batch 8 con acumulacion 4 (batch efectivo 32), 2 workers, shard 256 y warmup ratio 0,0025 (500 pasos). Se usaron 161 episodios (0-160) de Task000802 con 58.044 fotogramas a 30 Hz. No se introdujo split de validacion retenido: el archivo `offline_validation.json` solo verifica recarga estricta y salidas finitas sobre tres observaciones de entrenamiento, no el exito de la tarea ni la seguridad del robot. El repositorio incluye estado de optimizador, scheduler, RNG y Trainer para permitir la reanudacion.

## Capacidades

- Generacion de comandos de accion visomotores: produce trayectorias de 40x54 articulaciones absolutas a partir de observaciones RGB, lenguaje y estado de articulaciones.
- Percepcion tactil integrada: consume 90 taxeles crudos mediante un adaptador SH5 especifico, lo que permite reaccionar a contacto y presion durante la manipulacion.
- Seguimiento de instrucciones en lenguaje natural: la politica esta condicionada por la instruccion "Use the right hand to pick up a white sanitary pad from the box and hold it".
- Control bimanual: cubre brazo izquierdo, brazo derecho y ambas manos de 20 grados de libertad, con mapeo de embodiment en `configs/`.
- Percepcion multi-camara: tres flujos RGB simultaneos.
- No dispone de tool calling, function calling, agentes multi-paso, generacion de texto libre, codigo, matematicas ni vision general. Es una politica robotica especializada, no un LLM conversacional.

## Casos de uso

- Manipulacion bimanual con feedback tactil: el modelo puede ejecutar la tarea de recogida y sujecion de un objeto blando usando la senal de 90 taxeles para ajustar la presion de agarre, algo critico en objetos deformables como una compresa.
- Investigacion en VLA con modalidad tactil: sirve como referencia reproducible para estudiar como se integra un encoder tactil (`finger_mlp`, 32D) en un modelo fundacional robotico de 3 B de parametros.
- Transferencia de politica a un embodiment SH5 concreto: el mapeo de articulaciones en `configs/` y el `embodiment_tag="new_embodiment"` permiten reutilizar el modelo en un robot SH5 con la misma configuracion de camaras, brazos y manos.
- Punto de partida para fine-tuning en tareas de pick-and-place: al incluir checkpoints intermedios (50k, 100k, 150k, 200k) y estado de Trainer, se puede reanudar o comparar el efecto del numero de pasos en el exito de la tarea.
- Evaluacion de robustez tactil en laboratorio: util para medir como afecta la senal tactil a la estabilidad del agarre frente a politicas puramente visuales.
- Docencia y reproduccion de pipelines GR00T: el `artifact_manifest.json` y `configs/sh5.json` permiten reconstruir los argumentos de entrenamiento y verificar la integridad de los pesos con `SHA256SUMS`.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El unico artefacto de validacion es `offline_validation.json`, que comprueba recarga estricta y salidas finitas sobre tres observaciones de entrenamiento, no la tasa de exito de la tarea ni metricas de seguridad del robot.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la informacion proporcionada. Como referencia orientativa, un modelo de 3,14 B parametros en bf16 requiere aproximadamente 6,3 GB solo para pesos, mas overhead de tokenizer Cosmos, cache de activaciones y los tres flujos RGB; el autor especifica `device="cuda:0"`.
- GPU recomendadas: no disponible. El autor solo indica ejecucion en `cuda:0`; por tamano, una RTX 4090 (24 GB) o A100/H100 serian suficientes para pesos, pero la cache del tokenizer Cosmos y el adaptador SH5 pueden incrementar el consumo.
- Cabe en GPU consumer: probablemente si en RTX 4090 y GPUs con 16-24 GB, aunque no esta confirmado en la model card.
- Opciones de despliegue: requiere la implementacion SH5 tactil de GR00T en el commit indicado en `artifact_manifest.json`, con `Gr00tPolicy(model_path=..., embodiment_tag="new_embodiment", device="cuda:0", use_tactile=True)`. No es compatible con vLLM, llama.cpp, Ollama ni TGI, ya que no es un LLM de texto.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Modalidad | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| GR00T-N1.7-SH5-Task000802-Tactile-200k | 3,14 B | no disponible | RGB + lenguaje + tactil + articulaciones | Apache 2.0 | HuggingFace (13 descargas) |
| nvidia/GR00T-N1.7-3B (base) | ~3 B | no disponible | RGB + lenguaje + articulaciones | no disponible en esta ficha | HuggingFace (NVIDIA) |
| Otros VLA abiertos (p. ej. OpenVLA, RT-2) | no disponible | no disponible | RGB + lenguaje | no disponible | no disponible |

La comparativa con otros VLA abiertos no puede completarse con datos verificados en la informacion proporcionada; se indica "no disponible" para evitar cifras no contrastadas.

## Limitaciones y advertencias

- Especializacion extrema: el modelo solo ha sido entrenado para una unica tarea (recoger una compresa sanitaria con la mano derecha y sostenerla); no generaliza a otras instrucciones ni objetos.
- Sin split de validacion: no se introdujo conjunto retenido, por lo que no hay evidencia publicada de exito de la tarea ni de generalizacion.
- Validacion limitada: `offline_validation.json` solo comprueba recarga estricta y salidas finitas en tres observaciones de entrenamiento, no seguridad del robot ni calidad de la politica.
- Dependencia de codigo propietario: requiere el adaptador tactil SH5 personalizado en un commit concreto; el GR00T upstream no lo incluye, lo que rompe la portabilidad.
- Dependencia de cache externa: necesita la cache fijada del tokenizer/modelo Cosmos de NVIDIA.
- Riesgo de sobreajuste a las condiciones de entrenamiento (iluminacion, posicion de camaras, configuracion del robot SH5); no se documentan pruebas fuera de distribucion.
- Sin datos de sesgos, alucinacion o comportamiento multilingue: al ser una politica robotica, estos conceptos no aplican directamente, pero tampoco se documentan modos de fallo.
- Licencia Apache 2.0 permite uso comercial, pero la dependencia de componentes de NVIDIA (Cosmos, GR00T) puede estar sujeta a sus propias condiciones.
- Repositorio de 87,2 GB con checkpoints redundantes; conviene descargar solo el checkpoint necesario.
- Solo 13 descargas y 0 likes: ecosistema de validacion practicamente nulo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Dongkkka/GR00T-N1.7-SH5-Task000802-Tactile-200k
- Modelo base: https://huggingface.co/nvidia/GR00T-N1.7-3B
- Repositorio GR00T de NVIDIA (referencia del codigo base): no disponible en la informacion proporcionada
- Paper de GR00T N1.7: no disponible en la informacion proporcionada
- Artefactos internos del repo (`artifact_manifest.json`, `configs/sh5.json`, `offline_validation.json`, `SHA256SUMS`): incluidos en el propio repositorio de HuggingFace
