# khanhnd61/smolvla_so101_tape

## Resumen

SmolVLA es un modelo de visión-lenguaje-acción (VLA) compacto y eficiente desarrollado por Hugging Face, diseñado para robótica de bajo coste y desplegable en hardware de consumo. Este repositorio concreto, `khanhnd61/smolvla_so101_tape`, es un fine-tuning del modelo base `lerobot/smolvla_base` sobre un dataset de 10 episodios para la tarea "Put the tape into the box" (poner la cinta en la caja) con un robot SO-101 (SO-ARM). El modelo combina un codificador visual SigLIP, un modelo de lenguaje SmolLM2 y un experto de acciones, con un total de 450 millones de parámetros. Su relevancia radica en que demuestra cómo un VLA de tamaño reducido puede adaptarse a tareas de manipulación específicas con pocos datos, manteniendo un coste computacional bajo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-Language-Action (VLA) basada en transformer: SigLIP (vision) + SmolLM2 (lenguaje) + action expert |
| Parametros totales | 450.046.176 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (solo safetensors en el repo) |
| Idiomas soportados | No disponible (instrucciones en ingles en el dataset) |
| Licencia | Apache-2.0 |
| Formato de pesos | Safetensors |

## Arquitectura y entrenamiento

SmolVLA es un modelo VLA que combina un codificador de vision SigLIP, un modelo de lenguaje SmolLM2 y un experto de acciones (action expert). En el fine-tuning, solo se entrenan el action expert y las proyecciones (aproximadamente 50 millones de parametros), mientras que el vision encoder y el modelo de lenguaje permanecen congelados, aprovechando el conocimiento visual y linguistico previo. El entrenamiento se realizo mediante behavior cloning (clonacion de comportamiento) sobre un dataset de 10 episodios (3434 frames a 30 FPS) de la tarea "Put the tape into the box". Se usaron 4000 pasos de entrenamiento con batch size 8, optimizador AdamW, learning rate 0.0001 y semilla 1000, utilizando la libreria LeRobot 0.6.1.

## Capacidades

- Generacion de acciones de 6 dimensiones (posicion y orientacion del efector final) para control de robot.
- Procesamiento de imagenes de tres camaras (front, wrist y una tercera) a resolucion 256x256.
- Recepcion de estado del robot (6 valores) como entrada adicional.
- Ejecucion de tareas de manipulacion especificas aprendidas por imitacion (en este caso, colocar una cinta en una caja).
- Integracion con el ecosistema LeRobot para entrenamiento y despliegue en robots reales.
- Capacidad de seguir instrucciones en lenguaje natural (la tarea esta definida como una instruccion textual).
- No es un modelo de lenguaje general: su salida son acciones de robot, no texto.

## Casos de uso

- Manipulacion pick-and-place en entornos de laboratorio: el modelo puede ejecutar la tarea aprendida de recoger una cinta y colocarla en una caja, util para automatizar procesos de embalaje o ensamblaje.
- Prototipado rapido de politicas roboticas: con solo 10 episodios de demostracion, se puede obtener una politica funcional para una tarea concreta, ideal para experimentos academicos o pruebas de concepto.
- Educacion e investigacion en robotica: sirve como ejemplo de fine-tuning de un VLA compacto, permitiendo estudiar el comportamiento de modelos de este tipo en hardware asequible.
- Automatizacion de tareas repetitivas en pequena escala: el modelo puede integrarse en lineas de montaje simples donde se requiera colocar objetos en posiciones fijas.
- Desarrollo de sistemas de robotica asistida: combinado con un robot SO-101, puede utilizarse para asistir en tareas de clasificacion o organizacion de objetos.
- Base para nuevos fine-tunings: el modelo puede servir como punto de partida para adaptarse a tareas similares de manipulacion con pocos datos adicionales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente que no hay resultados de evaluacion ("No evaluation results have been provided for this policy yet"). No se dispone de datos de exito en tareas reales ni comparaciones con otros modelos.

## Requisitos de hardware

- VRAM estimada para inferencia: al tratarse de un modelo de 450M parametros, la inferencia puede realizarse en GPUs con 4-6 GB de VRAM en precision FP16.
- GPU recomendadas: cualquier GPU consumer moderna con al menos 4 GB de VRAM (por ejemplo, NVIDIA RTX 3060, RTX 4060, GTX 1660 Super). Tambien puede ejecutarse en CPU para pruebas de baja frecuencia.
- Cabe en GPUs consumer: si, es uno de los objetivos de SmolVLA.
- Opciones de despliegue: principalmente mediante LeRobot (PyTorch), con soporte para inferencia en tiempo real. No se menciona soporte para vLLM, llama.cpp u Ollama, ya que es un modelo de robotica, no un LLM generativo.
- Latencia y throughput: no disponibles en la informacion proporcionada, pero al ser un modelo compacto, se espera que pueda operar a 30 FPS en GPUs consumer (frecuencia de captura del dataset).

## Comparativa con modelos similares

| Modelo | Parametros | Arquitectura | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| SmolVLA (este modelo) | 450M | VLA (SigLIP + SmolLM2 + action expert) | No disponible | Apache-2.0 | Hugging Face |
| OpenVLA | 7B | VLA (Prismatic + Llama 2) | 2048 tokens | MIT | Hugging Face |
| ACT (Action Chunking with Transformers) | ~80M (politica) | Transformer con chunking | No aplica | MIT | GitHub |

SmolVLA es significativamente mas pequeño que OpenVLA (450M vs 7B), lo que permite su despliegue en hardware de consumo. ACT es una alternativa mas ligera pero sin capacidades de vision-lenguaje integradas. No se dispone de datos de rendimiento comparativos para este fine-tuning especifico.

## Limitaciones y advertencias

- Entrenado con solo 10 episodios (3434 frames), lo que puede provocar overfitting y baja generalizacion a variaciones de la tarea (posiciones de objetos, iluminacion, etc.).
- No se han realizado evaluaciones formales del rendimiento en robot real; la model card no incluye resultados de exito.
- La tarea es muy especifica ("poner la cinta en la caja") y el modelo no es reutilizable para otras tareas sin un nuevo fine-tuning.
- No se proporcionan datos sobre sesgos o alucinaciones, al tratarse de un modelo de control robotico y no de generacion de texto.
- Aunque la licencia es Apache-2.0 (permite uso comercial), el modelo depende del ecosistema LeRobot y de hardware robotico especifico (SO-101), lo que limita su aplicabilidad fuera de ese contexto.
- El dataset de entrenamiento no esta documentado en cuanto a diversidad de condiciones (iluminacion, fondos, variaciones de objetos), por lo que el rendimiento en entornos diferentes al de entrenamiento es incierto.

## Enlaces

- Repositorio del modelo: https://huggingface.co/khanhnd61/smolvla_so101_tape
- Paper de SmolVLA: https://huggingface.co/papers/2506.01844
- Modelo base: https://huggingface.co/lerobot/smolvla_base
- Dataset de entrenamiento: https://huggingface.co/datasets/khanhnd61/so101-tape_20260804_224429
- LeRobot (libreria): https://github.com/huggingface/lerobot
- Documentacion de LeRobot para SmolVLA: https://huggingface.co/docs/lerobot/main/en/smolvla
- Repositorio similar de referencia: https://github.com/ajingu/SmolVLA-SO101-Tape-Dispenser
- Blog de fine-tuning de SmolVLA para SO-101: https://ggando.com/blog/smolvla-so101/
