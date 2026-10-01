# khanhnd61/diffusion-so101-tape-gguf

## Resumen

`diffusion-so101-tape-gguf` es un checkpoint de Diffusion Policy convertido a GGUF por el usuario khanhnd61 para inferencia en CPU con la librería vla.simd. Se trata de una política robótica para el brazo SO-101 que procesa las cámaras frontal y de muñeca a 480×640 y un estado articular de 6 dimensiones, y predice un horizonte de 64 acciones del que se ejecutan 32. El modelo tiene 277.810.282 parámetros y ocupa 1,1 GB en el repositorio.

La arquitectura combina codificadores de imagen ResNet-18 con una UNet 1-D condicional de anchos 512, 1024 y 2048. El GGUF registra el muestreador DDIM con 10 pasos y está pensado para servir políticas de imitación sin necesidad de GPU, lo que resulta relevante para experimentos de robótica en hardware de bajo coste y para los benchmarks de dispositivos de vla.simd.

El autor indica que fue entrenado durante 4.000 pasos con batch size 8 sobre un dataset privado de cinta (tape) de SO-101 y que no ha sido evaluado en un robot real. No se publican idiomas, cuantizaciones ni resultados de benchmarks.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Diffusion Policy: codificadores de imagen ResNet-18 y UNet 1-D condicional con anchos 512, 1024 y 2048 |
| Parámetros totales | 277.810.282 |
| Parámetros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica como contexto de lenguaje; ventana de observación de 2 pasos; horizonte de acción de 64 pasos, de los que se ejecutan 32 |
| Tipos de cuantización | No disponible (el archivo es GGUF, pero el autor no especifica el esquema de cuantización) |
| Idiomas soportados | No disponible / no aplica (modelo de robótica, no de lenguaje) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (archivo `diffusion-so101-tape.gguf`, autocontenido) |
| Librería | vla.simd |
| Pipeline | robotics |
| Tamaño del repositorio | 1,1 GB |
| Pasos del muestreador DDIM | 10 |
| Entrenamiento | 4.000 pasos, batch size 8, dataset privado SO-101 tape |

## Arquitectura y entrenamiento

Se trata de una política de difusión (Diffusion Policy) para control robótico, no de un transformer de lenguaje. La entrada combina dos imágenes de 480×640 procedentes de las cámaras frontal y de muñeca, codificadas con ResNet-18, y un vector de estado articular de 6 dimensiones observado durante 2 pasos. La red de difusión es una UNet 1-D condicional con anchos 512, 1024 y 2048 que genera un horizonte de 64 acciones; en ejecución se aplican 32 acciones por chunk. El GGUF se generó con `tools/convert_diffusion.py --scheduler DDIM --steps 10`, por lo que la inferencia utiliza muestreo DDIM con 10 pasos.

El entrenamiento se realizó durante 4.000 pasos con batch size 8 sobre un dataset privado de la tarea de cinta (tape) con SO-101. No se documenta la composición exacta del dataset, el número de tokens ni si hubo RLHF, DPO u otras técnicas de alineación; en este tipo de modelos de imitación no se aplican habitualmente. Tampoco se reporta evaluación en robot real, solo la conversión a GGUF para los benchmarks de dispositivos de vla.simd.

## Capacidades

- Generación de secuencias de acciones robóticas: predice 64 pasos de acción y ejecuta 32 por chunk.
- Percepción visual multimodal limitada al dominio robótico: procesa dos cámaras (frontal y muñeca) a 480×640.
- Codificación de estado propioceptivo: acepta un vector de 6 dimensiones del estado articular del SO-101.
- Action chunking: agrupa acciones en bloques de 32 para su ejecución.
- Inferencia en CPU: el archivo GGUF es autocontenido y se sirve con vla.simd sin GPU.
- Integración con LeRobot: compatible con el cliente asíncrono `lerobot-vla-simd`.
- No soporta tool calling ni function calling; no es un modelo de lenguaje.
- No soporta agentes, razonamiento multi-paso simbólico, matemáticas, código ni visión general.
- Capacidades multilingües: no aplica.
- Capacidades especiales: muestreador DDIM con 10 pasos registrado en el GGUF; no se documentan modos de pensamiento, audio u otras modalidades.

## Casos de uso

- Evaluación de referencia en benchmarks de dispositivos vla.simd: sirve para medir latencia y comportamiento de una Diffusion Policy en CPU dentro de la comparativa oficial del proyecto.
- Prototipado de políticas de imitación en SO-101: permite probar el pipeline completo de observación visual y estado articular antes de entrenar políticas propias.
- Manipulación repetitiva de cinta con SO-101: el modelo está entrenado específicamente para una tarea de tape, por lo que puede usarse en experimentos de agarre, colocación o pegado de cinta en laboratorio.
- Investigación en Diffusion Policy: útil para estudiar action chunking, horizontes de 64 acciones y muestreo DDIM de 10 pasos en robótica de bajo coste.
- Despliegue en entornos sin GPU: al ser un GGUF autocontenido, puede ejecutarse en un servidor CPU o en un equipo de laboratorio sin acelerador dedicado.
- Integración con LeRobot async: se conecta al cliente `lerobot-vla-simd` para controlar un SO-101 con cámaras opencv a 30 fps y `actions_per_chunk=32`.
- Validación de pipelines de visión y estado: sirve para comprobar la sincronización de dos cámaras, la lectura del estado articular y el envío de acciones por red.
- Docencia y prácticas de robótica: ejemplo reproducible de conversión de un checkpoint LeRobot Diffusion Policy a GGUF para inferencia en CPU.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente que el modelo no ha sido evaluado en un robot. No aplican métricas de lenguaje como MMLU, HumanEval o GSM8K al tratarse de una política robótica.

## Requisitos de hardware

- VRAM estimada para inferencia: no hay cifras oficiales. El repositorio GGUF pesa 1,1 GB y el modelo tiene 277,8 millones de parámetros; como referencia, la inferencia podría requerir del orden de 1-2 GB de memoria, dependiendo de la cuantización y del backend, pero no está confirmado por el autor.
- GPU recomendadas: no especificadas. Por el tamaño del modelo, cualquier GPU con al menos 2 GB de VRAM podría ejecutarlo, aunque no hay validación publicada.
- Cabe en GPU de consumo: probablemente sí en tarjetas con 4 GB o más de VRAM, como GTX 1650, RTX 3050 o superiores, pero no está verificado.
- Opciones de despliegue: vla.simd con `vla-simd-serve --model diffusion --model-dir diffusion-so101-tape-gguf/diffusion-so101-tape.gguf --port 8080`; cliente LeRobot `lerobot-vla-simd`; inferencia en CPU con `OMP_NUM_THREADS` configurable.
- Alternativas como vLLM, Ollama o TGI no son aplicables directamente a este tipo de política robótica.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto / ventana | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| diffusion-so101-tape-gguf | 277,8 M | 2 pasos de observación; horizonte de 64 acciones | Diffusion Policy para SO-101 | Apache-2.0 | GGUF en HuggingFace |
| khanhnd61/inflect_so101_tape | No disponible | No disponible | VLA con instrucción única sobre SO-101 | No disponible | HuggingFace |
| Otros checkpoints de Diffusion Policy para SO-101 | No disponible | No disponible | No disponible | No disponible | No disponible |

No se dispone de datos comparativos de rendimiento, contexto o licencia para alternativas equivalentes en la información proporcionada.

## Limitaciones y advertencias

- No ha sido evaluado en un robot real; el autor lo indica explícitamente.
- Entrenado sobre un dataset privado de una sola tarea de cinta con SO-101, sin variación de instrucciones.
- No se publican benchmarks ni métricas de éxito en tareas de manipulación.
- No es un modelo de lenguaje: no soporta tool calling, function calling, agentes, razonamiento multilingüe ni generación de texto.
- La ventana de observación de 2 pasos puede ser insuficiente para tareas dinámicas o con oclusiones prolongadas.
- Depende de la calibración de las cámaras frontal y de muñeca, del montaje del SO-101 y de la iluminación del entorno.
- Puede degradarse ante cambios de fondo, posición de objetos, texturas o condiciones no vistas durante el entrenamiento.
- Riesgo de alucinación entendido como predicción errónea de acciones fuera de la distribución de entrenamiento; no aplica alucinación textual.
- No hay información sobre sesgos del dataset privado; pueden existir sesgos de iluminación, posición o configuración del robot.
- La licencia Apache-2.0 permite uso comercial, pero el autor no ofrece garantías; deben revisarse también las licencias de vla.simd, LeRobot y las dependencias del cliente.
- No se recomienda su uso en producción crítica sin validación previa en el robot objetivo y con protocolos de seguridad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/khanhnd61/diffusion-so101-tape-gguf
- Repositorio vla.simd: https://github.com/cair-vinuni/vla.simd
- Documentación de benchmarks de vla.simd: https://github.com/cair-vinuni/vla.simd/tree/main/docs/benchmark
- Fork de LeRobot usado: https://github.com/khanhnd61-vr/lerobot
- Dataset so101-tape: https://huggingface.co/datasets/khanhnd61/so101-tape
- Modelo relacionado inflect_so101_tape: https://huggingface.co/khanhnd61/inflect_so101_tape
- Curso NVIDIA sim-to-real para SO-101: https://docs.nvidia.com/learning/physical-ai/sim-to-real-so-101/latest/datasets-and-models.html
