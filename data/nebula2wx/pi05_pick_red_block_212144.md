# nebula2wx/pi05_pick_red_block_212144

## Resumen

`pi05_pick_red_block_212144` es un checkpoint de política robótica publicado por el usuario `nebula2wx` en Hugging Face. No es un modelo de lenguaje general, sino una política visión-lenguaje-acción basada en PI05 y empaquetada con la librería LeRobot. El repositorio contiene los pesos del paso 3000 en la raíz y los pasos 1000 y 2000 en las subcarpetas `001000/` y `002000/`.

El modelo se ha entrenado sobre el dataset `Whyynnot/pick_red_block_easy_new_camera_20261018_212144`. Según la model card, solo se entrenó el experto de acciones; el codificador visual y PaliGemma permanecen congelados. La configuración de entrada incluye dos cámaras, `head` y `wrist`, y una tercera cámara vacía o `empty camera`.

Su relevancia es acotada pero práctica: sirve como referencia reproducible para experimentos de imitación en robótica, para comparar checkpoints intermedios y para estudiar el efecto de congelar el backbone visual-lenguaje. El repositorio ocupa 28,1 GB y el checkpoint declara 4.143.404.816 parámetros en formato safetensors.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Política visión-lenguaje-acción PI05, con codificador visual y PaliGemma congelados y experto de acciones entrenado |
| Parámetros totales | 4.143.404.816 |
| Parámetros activos | No aplica: no es un modelo MoE |
| Longitud de contexto | No disponible |
| Tipos de cuantización | No disponible |
| Idiomas soportados | No disponibles |
| Licencia | No disponible |
| Formato de pesos | safetensors |
| Autor | `nebula2wx` |
| Librería | LeRobot |
| Pipeline | Robótica |
| Checkpoint | Paso 3000 en la raíz; pasos 1000 y 2000 en `001000/` y `002000/` |
| Tamaño del repositorio | 28,1 GB |
| Dataset de entrenamiento | `Whyynnot/pick_red_block_easy_new_camera_20261018_212144` |

## Arquitectura y entrenamiento

La model card describe un checkpoint PI05 de LeRobot para una tarea de manipulación concreta: recoger un bloque rojo. La arquitectura combina un componente visión-lenguaje heredado de PaliGemma, que permanece congelado, con un experto de acciones que es la única parte entrenada. El repositorio incluye tres checkpoints: el paso 3000 en la raíz y los pasos 1000 y 2000 en subcarpetas.

No se especifican en la información disponible el número de tokens de entrenamiento, la composición exacta del dataset, el uso de RLHF o DPO, la función de pérdida ni detalles de atención o decodificación. Tampoco se documenta si el modelo utiliza flow matching u otra formulación para generar acciones. La información disponible se limita al dataset, al número de pasos, a la congelación del backbone y a la configuración de cámaras.

## Capacidades

- Generación de acciones de manipulación robótica para la tarea de recoger un bloque rojo.
- Procesamiento de tres entradas de cámara: `head`, `wrist` y una cámara vacía o `empty camera`.
- Carga directa como política de LeRobot desde la raíz del repositorio o desde los checkpoints intermedios.
- Entrenamiento selectivo del experto de acciones, manteniendo congelados el codificador visual y PaliGemma.
- Evaluación comparativa de los pasos 1000, 2000 y 3000 para estudiar la evolución del entrenamiento.
- No se documentan capacidades de tool calling, function calling, agentes, razonamiento multi-paso, generación de texto libre, audio ni modo thinking.
- No se documenta el seguimiento de instrucciones en lenguaje natural ni los idiomas admitidos, aunque PI05 sea una política visión-lenguaje-acción.

## Casos de uso

- Recogida de un bloque rojo en un banco de pruebas controlado: el modelo recibe las vistas de cámara y genera acciones para completar la tarea. Es adecuado porque está entrenado específicamente para esa secuencia y ese objeto.
- Reproducción de un baseline de imitación: al estar asociado a un dataset concreto y a un checkpoint identificable, permite repetir experimentos y comparar resultados con otras configuraciones.
- Ablación del entrenamiento del backbone: sirve para estudiar qué rendimiento se obtiene cuando solo se entrena el experto de acciones y se mantienen congelados el codificador visual y PaliGemma.
- Evaluación de robustez ante entradas de cámara incompletas: la configuración incluye una cámara vacía, lo que permite analizar el comportamiento de la política cuando una de las vistas no aporta información útil.
- Selección de checkpoint: los pasos 1000, 2000 y 3000 permiten comparar estabilidad, éxito en la tarea y posible sobreajuste antes de elegir un modelo final.
- Punto de partida para fine-tuning en tareas similares de pick-and-place: el experto de acciones ya está adaptado a una tarea de manipulación y puede reentrenarse con nuevos datos.
- Prototipos docentes o de laboratorio con LeRobot: el modelo se puede cargar en un entorno de investigación para demostrar un pipeline completo de percepción, política y acción.
- Integración en pipelines de evaluación de robótica: permite medir tiempos de inferencia, consumo de VRAM y tasa de éxito en un entorno reproducible.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: los 4.143.404.816 parámetros ocupan aproximadamente 8,3 GB en BF16 o FP16. Con activaciones, preprocesado de tres cámaras y overhead de CUDA, se recomiendan entre 12 y 16 GB para inferencia con lote 1. Es una estimación teórica, no un dato publicado por el autor.
- GPU de consumo: RTX 4090 o RTX 3090 con 24 GB son adecuadas. Una RTX 4080 de 16 GB puede funcionar con margen ajustado. GPUs de 12 GB o menos no son recomendables para cargar el modelo completo sin cuantización.
- GPU profesionales: A100 de 40 GB o 80 GB y H100 de 80 GB son opciones para evaluación por lotes o despliegues con varias instancias.
- Despliegue: la librería indicada es LeRobot. No se documentan vLLM, TGI, llama.cpp, Ollama ni otros servidores de inferencia de propósito general. Al tratarse de una política con experto de acciones, el serving estándar de modelos de lenguaje no es directamente aplicable.
- Almacenamiento: el repositorio completo ocupa 28,1 GB, por lo que conviene prever espacio para los tres checkpoints.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de especificaciones de modelos externos comparables en la información proporcionada. La comparación más directa es entre los checkpoints incluidos en el propio repositorio.

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `pi05_pick_red_block_212144`, paso 3000 | 4.143.404.816 | No disponible | Recoger un bloque rojo | No disponible | Raíz del repositorio |
| Checkpoint paso 2000 | No disponible | No disponible | Recoger un bloque rojo | No disponible | `002000/` |
| Checkpoint paso 1000 | No disponible | No disponible | Recoger un bloque rojo | No disponible | `001000/` |

## Limitaciones y advertencias

- La licencia no está disponible, por lo que no se puede asumir que el uso comercial esté permitido.
- El modelo está especializado en una única tarea de manipulación: recoger un bloque rojo. No es un modelo generalista de robótica ni de lenguaje.
- El entrenamiento depende de un dataset concreto y de una configuración de cámaras específica. Cambiar la cámara, la iluminación, el objeto o la posición inicial puede degradar el rendimiento.
- El backbone visual-lenguaje está congelado. Esto limita la adaptación a dominios visuales nuevos y puede reducir la generalización frente a un fine-tuning completo.
- La tercera cámara se describe como `empty camera`. No se detalla si se usa como entrada real, como placeholder o como parte de una estrategia de robustez.
- No hay resultados de benchmarks ni tasas de éxito publicadas. No se puede afirmar que el paso 3000 sea mejor que los pasos 1000 o 2000 sin evaluarlo.
- El checkpoint del paso 3000 puede presentar sobreajuste al dataset de entrenamiento. Es recomendable validar en un entorno separado.
- En robótica, el término alucinación no se aplica igual que en texto: el riesgo principal es generar acciones incorrectas o inseguras ante entradas fuera de distribución.
- El modelo no documenta límites de fuerza, par, velocidad ni paradas de emergencia. Cualquier despliegue físico debe incorporar salvaguardas externas.
- No se documentan los idiomas soportados ni el formato de instrucciones en lenguaje natural.
- El repositorio ocupa 28,1 GB y contiene varios checkpoints, lo que puede complicar su distribución y almacenamiento.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/nebula2wx/pi05_pick_red_block_212144)
- [Dataset de entrenamiento](https://huggingface.co/datasets/Whyynnot/pick_red_block_easy_new_camera_20261018_212144)
- [Repositorio de LeRobot](https://github.com/huggingface/lerobot)
