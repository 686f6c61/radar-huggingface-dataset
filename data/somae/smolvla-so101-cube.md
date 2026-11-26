# somae/smolvla-so101-cube

## Resumen

SmolVLA para colocación de cubos con SO-101 es un modelo de política robótica (vision-language-action, VLA) obtenido por fine-tuning de `lerobot/smolvla_base` sobre 100 demostraciones recogidas en un brazo SO-101 mediante un script generado con Claude, sin teleoperación. El modelo resuelve una tarea concreta: mover un cubo a una región indicada por una instrucción en inglés ("region 1, 2, 3", correspondientes a azul, verde y amarillo), por ejemplo "Put the cube on the yellow region.". Lo publica el usuario `somae` en Hugging Face con licencia Apache 2.0.

Técnicamente es un modelo de 450.046.176 parámetros (unos 450 M) en formato safetensors, con un repositorio de 0,9 GB, pensado para ejecutarse con la librería LeRobot 0.6.1. La arquitectura subyacente es SmolVLA: un modelo de visión-lenguaje congelado durante el entrenamiento más un experto de acción entrenado, que recibe dos cámaras (cenital y de muñeca, ambas a 640x360), el estado de 6 articulaciones en grados (pinza 0-100) y un texto de tarea, y emite un chunk de 50 objetivos articulares.

Su relevancia es acotada pero clara: demuestra un flujo de trabajo de extremo a extremo para adaptar un VLA pequeño a un robot de bajo coste (SO-101) usando datos generados de forma programática, y sirve como referencia reproducible para quien quiera replicar el pipeline con LeRobot. No es un modelo de propósito general ni un LLM: es una política de control entrenada para una única tarea y un único montaje físico.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | SmolVLA (vision-language-action): VLM congelado + experto de acción entrenado |
| Parametros totales | 450.046.176 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors sin cuantizar) |
| Idiomas soportados | instrucciones en inglés (la model card solo documenta instrucciones en inglés) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (repositorio de 0,9 GB) |

## Arquitectura y entrenamiento

SmolVLA combina un modelo de visión-lenguaje que procesa las dos imágenes de cámara (cenital y de muñeca, 640x360) junto con el texto de la instrucción, y un experto de acción que transforma esa representación multimodal, más el estado de 6 articulaciones, en un chunk de 50 objetivos articulares. En este fine-tuning, siguiendo el comportamiento por defecto de LeRobot, el VLM se mantiene congelado y solo se entrena el experto de acción, lo que reduce el coste de adaptación y preserva las capacidades de representación del modelo base.

El entrenamiento se realizó con LeRobot 0.6.1 durante 20.000 pasos, con tamaño de lote 64, en una única GPU B200. El conjunto de datos son 100 demostraciones recogidas en un brazo SO-101 por un script escrito con Claude, sin teleoperación. La model card no detalla la composición exacta del dataset, el número de tokens procesados ni si se aplicaron técnicas de RLHF o DPO; esos datos figuran como no disponibles.

## Capacidades

- Control robótico de una tarea concreta: colocar un cubo en una de tres regiones (azul, verde o amarillo) indicada por texto en inglés.
- Comprensión de instrucciones en lenguaje natural limitada al vocabulario y las regiones vistas en entrenamiento.
- Fusión multimodal de dos cámaras (cenital y de muñeca) con el estado propioceptivo de 6 articulaciones.
- Generación de acciones en chunks de 50 objetivos articulares, lo que permite ejecución a mayor frecuencia efectiva que un control paso a paso.
- Integración nativa con LeRobot mediante `SmolVLAPolicy.from_pretrained`.
- No se documenta soporte de tool calling, function calling, razonamiento multi-paso, agentes, visión general, audio ni modo de pensamiento; el modelo está especializado en control motor.

## Casos de uso

- Replicación de experimentos de VLA en robótica de bajo coste: sirve como punto de partida para validar el pipeline de LeRobot con un SO-101 y comprobar el flujo completo desde la recogida de datos hasta la inferencia.
- Generación automática de datos de entrenamiento: el método de la model card (script que produce demostraciones sin teleoperación) se puede reutilizar para crear datasets de otras tareas de pick-and-place y fine-tunear el modelo base.
- Docencia y formación en robótica: el modelo y sus 100 demostraciones permiten ilustrar conceptos de imitación, chunking de acciones y condicionamiento por lenguaje en un montaje asequible.
- Pruebas de robustez ante variaciones de instrucción: evaluar cómo responde la política a reformulaciones de "Put the cube on the yellow region" y detectar los límites del condicionamiento por texto.
- Benchmark interno de políticas VLA pequeñas: comparar este fine-tuning con otras variantes sobre el mismo brazo y el mismo conjunto de demostraciones para medir el efecto del tamaño y la composición del dataset.
- Base para tareas de manipulación ampliadas: extender el fine-tuning a más regiones u objetos partiendo de este checkpoint, aprovechando que el VLM está congelado y el coste de reentrenamiento del experto de acción es bajo.
- Prototipado de automatización en laboratorio: usar el modelo como política de referencia en una celda de pick-and-place con cámara cenital y de muñeca antes de invertir en un sistema industrial.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye tasas de éxito, métricas de error de posición ni comparaciones cuantitativas con otras políticas.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con 450 M parámetros en safetensors (fp32/bf16) el peso ronda 0,9-1,8 GB, por lo que el modelo cabe holgadamente en GPUs de consumo, aunque la VRAM total depende del runtime de LeRobot y de los buffers de imagen.
- GPU recomendadas: el entrenamiento se hizo en una B200; para inferencia no se especifica una GPU mínima.
- Cabe en GPU de consumo: sí, por tamaño de parámetros; no se documenta una GPU concreta validada.
- Opciones de despliegue: LeRobot 0.6.1 mediante `SmolVLAPolicy`; no se documenta soporte de vLLM, llama.cpp, Ollama ni TGI, que no son adecuados para una política de control.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| somae/smolvla-so101-cube | 450.046.176 | no disponible | Colocación de cubo en SO-101 | Apache 2.0 | Hugging Face |
| lerobot/smolvla_base | no disponible en la informacion proporcionada | no disponible | VLA base generalista para manipulación | no disponible en la informacion proporcionada | Hugging Face |
| Otras políticas VLA pequenas (p. ej. variantes de SmolVLA) | no disponible | no disponible | Manipulación robótica | no disponible | no disponible |

La comparación cuantitativa con alternativas no está disponible: la model card no aporta métricas y solo se conoce el modelo base del que deriva.

## Limitaciones y advertencias

- Especialización extrema: el modelo solo se ha entrenado para colocar un cubo en tres regiones concretas de un montaje SO-101 específico; fuera de ese entorno su comportamiento no está garantizado.
- Dependencia del montaje físico: cambios en la posición de las cámaras, la iluminación, el brazo o el cubo pueden degradar el rendimiento sin aviso.
- Idioma: las instrucciones documentadas están en inglés; no hay evidencia de soporte multilingüe.
- Dataset pequeño: 100 demostraciones generadas por script, sin teleoperación, lo que puede limitar la diversidad de trayectorias y la robustez ante perturbaciones.
- Riesgo de fallo silencioso: al ser una política de control, los errores se manifiestan como movimientos incorrectos o colisiones, no como texto alucinado; requiere supervisión y paradas de seguridad en producción.
- Sin métricas publicadas: no hay tasas de éxito ni benchmarks que permitan estimar la fiabilidad antes de desplegarlo.
- Licencia Apache 2.0: permite uso comercial, pero el autor no ofrece garantías y la responsabilidad sobre el despliegue recae en quien lo integra.
- Sin datos sobre sesgos: no se documentan sesgos conocidos, pero el modelo hereda las limitaciones del VLM congelado de `lerobot/smolvla_base`.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/somae/smolvla-so101-cube
- Modelo base: https://huggingface.co/lerobot/smolvla_base
- Código del proyecto: https://github.com/osehyeon/agent2vla
