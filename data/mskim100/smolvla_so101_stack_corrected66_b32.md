# msKim100/smolvla_so101_stack_corrected66_b32

## Resumen

SmolVLA es un modelo de visión-lenguaje-acción (VLA) compacto y eficiente desarrollado por Hugging Face dentro del ecosistema LeRobot. Este modelo concreto, `msKim100/smolvla_so101_stack_corrected66_b32`, es un fine-tuning del modelo base `lerobot/smolvla_base` sobre un dataset propio de 66 episodios para la tarea de recoger un bloque y colocarlo en un objetivo. Con 450 millones de parámetros, está diseñado para ejecutarse en hardware de consumo, lo que democratiza el aprendizaje por imitación en robótica.

El modelo procesa tres cámaras (muñeca, cuerpo y superior) junto con el estado del robot (6 dimensiones) y genera acciones de 6 dimensiones. Su relevancia radica en que permite a desarrolladores e investigadores entrenar y desplegar políticas robóticas con recursos limitados, sin necesidad de clústeres de GPU de alto coste. La licencia Apache 2.0 facilita su uso comercial y académico.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | SmolVLA (vision-language-action, transformer) |
| Parametros totales | 450.046.176 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors, cuantificables con herramientas externas) |
| Idiomas soportados | no disponible (instrucciones en ingles en el dataset) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

SmolVLA es un modelo de vision-lenguaje-accion que combina un codificador visual, un modelo de lenguaje y un experto de accion. El modelo base `lerobot/smolvla_base` fue preentrenado por Hugging Face, y este fine-tuning se realizo con el framework LeRobot sobre un dataset propio de 66 episodios (55.138 frames a 30 FPS) para la tarea "Pick up the block and place it on the target". El entrenamiento utilizo 40.000 pasos, batch size de 32, optimizador AdamW con learning rate 0.0001 y semilla 1000. No se menciona el uso de RLHF o DPO; se trata de aprendizaje por imitacion supervisado.

La arquitectura exacta (numero de capas, dimensiones, atencion) no se detalla en la informacion disponible, pero se sabe que es un modelo compacto optimizado para inferencia eficiente en hardware de consumo.

## Capacidades

- Generacion de acciones de robot a partir de observaciones visuales (3 camaras) y estado del robot.
- Ejecucion de tareas de manipulacion como recoger y colocar objetos.
- Soporte de instrucciones en lenguaje natural (en ingles) para condicionar la politica.
- Aprendizaje por imitacion: puede ser fine-tuneado con datasets propios via LeRobot.
- Inferencia en tiempo real (30 FPS) gracias a su tamano reducido.
- Integracion con el ecosistema LeRobot para entrenamiento, evaluacion y despliegue.

## Casos de uso

- Automatizacion de tareas de pick-and-place en entornos industriales: el modelo puede controlar un brazo robotico para recoger piezas y colocarlas en posiciones definidas, reduciendo costes de programacion manual.
- Investigacion en aprendizaje por imitacion: permite a laboratorios con recursos limitados experimentar con politicas VLA sin necesidad de GPUs de alta gama.
- Prototipado rapido de robots en entornos academicos: se puede entrenar un robot para una tarea especifica con pocos episodios (66) y desplegarlo en hardware de consumo.
- Desarrollo de asistentes roboticos domesticos: tareas como recoger objetos y colocarlos en un lugar designado, con instrucciones en lenguaje natural.
- Evaluacion de algoritmos de control en simulacion: el modelo puede integrarse en entornos simulados para probar estrategias antes del despliegue fisico.
- Educacion en robotica: estudiantes pueden entrenar y ejecutar politicas en robots de bajo coste, gracias a la documentacion y herramientas de LeRobot.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica que no hay resultados de evaluacion para esta politica concreta.

## Requisitos de hardware

- VRAM estimada: con 450M parametros, en FP16 ocuparia aproximadamente 0.9 GB, por lo que cabe en GPUs de consumo como RTX 3060 o superiores. Sin embargo, no hay datos oficiales de VRAM.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM deberia ser suficiente para inferencia; para entrenamiento se recomienda al menos 8 GB.
- Compatible con hardware de consumo: la descripcion del modelo indica que puede desplegarse en hardware de consumo.
- Opciones de despliegue: LeRobot proporciona scripts de rollout (`lerobot-rollout`) y soporta integracion con robots SO-100. Tambien se puede usar con vLLM o llama.cpp si se convierte a GGUF, aunque no esta documentado.
- Latencia y throughput: no hay datos oficiales, pero al ser un modelo compacto, se espera inferencia en tiempo real (30 FPS) en GPUs modernas.

## Comparativa con modelos similares

No se dispone de datos comparativos en la informacion proporcionada. SmolVLA se posiciona como una alternativa compacta a modelos VLA mas grandes como OpenVLA (7B parametros), pero no hay benchmarks publicados que permitan una comparacion cuantitativa. Se recomienda consultar el paper (arxiv:2506.01844) para detalles sobre el rendimiento del modelo base.

## Limitaciones y advertencias

- Sesgos conocidos: no se han documentado sesgos especificos, pero al ser entrenado con un dataset limitado (66 episodios), puede no generalizar bien a variaciones del entorno no vistas.
- Riesgo de alucinacion: como modelo de lenguaje, puede generar acciones incorrectas si las observaciones son ambiguas o fuera de distribucion.
- Limitaciones de contexto: la ventana de contexto no esta especificada; el modelo procesa imagenes de 256x256 y estado de 6 dimensiones, por lo que no maneja secuencias largas de texto.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero se debe citar el metodo y LeRobot segun la model card.
- Caveat para produccion: el modelo fue entrenado para una tarea especifica (pick and place) con un robot SO-100; su uso en otros robots o tareas requiere fine-tuning adicional.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/msKim100/smolvla_so101_stack_corrected66_b32
- Dataset de entrenamiento: https://huggingface.co/datasets/msKim100/so101_smolvla_corrected_66
- Paper de SmolVLA: https://huggingface.co/papers/2506.01844
- Modelo base: https://huggingface.co/lerobot/smolvla_base
- Documentacion de LeRobot sobre SmolVLA: https://huggingface.co/docs/lerobot/main/en/smolvla
- Repositorio de LeRobot: https://github.com/huggingface/lerobot
