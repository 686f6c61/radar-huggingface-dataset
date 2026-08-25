# GammoEiei/smolvla_so101_pick_apple_v4

## Resumen

SmolVLA SO-101 Pick Apple v4 es un modelo de visión-lenguaje-acción (VLA) compacto, desarrollado por el usuario GammoEiei, que ha sido fine‑tuneado a partir del modelo base `lerobot/smolvla_base`. Este modelo está diseñado para controlar un robot manipulador de tipo SO‑101 (SO‑101 follower) en tareas de recogida y colocación de manzanas en un cuenco, siguiendo instrucciones en lenguaje natural. Pertenece a la familia SmolVLA, que combina un encoder visual SigLIP, un modelo de lenguaje SmolLM2 y un "action expert" para generar acciones robóticas de baja dimensión (6 grados de libertad). Con 450 millones de parámetros totales, el modelo está optimizado para ejecutarse en hardware de consumo, lo que lo convierte en una opción interesante para entornos de investigación y prototipado en robótica.

La relevancia de este modelo reside en su eficiencia: el fine-tuning se realiza sobre una base ya preentrenada, congelando la mayoría de los pesos (encoder visual y modelo de lenguaje) y entrenando únicamente las proyecciones y el action expert, lo que reduce drásticamente el coste computacional. Está entrenado con 148 episodios de teleoperación (36.050 fotogramas a 10 FPS) para dos tareas específicas: recoger una manzana verde o una roja y colocarla en un cuenco. No se han publicado evaluaciones de éxito en robot real, por lo que su rendimiento en entornos no controlados aún no está verificado.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | SmolVLA (SigLIP + SmolLM2 + action expert) |
| Parámetros totales | 450.046.176 |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No aplica (modelo de acción, no de texto) |
| Tipos de cuantización | No disponible |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors |

## Arquitectura y entrenamiento

SmolVLA es un modelo de visión-lenguaje-acción compacto desarrollado por Hugging Face (paper arXiv:2506.01844). Su arquitectura combina un encoder visual SigLIP para procesar las imágenes de las cámaras, un modelo de lenguaje SmolLM2 para interpretar las instrucciones en lenguaje natural, y un "action expert" que proyecta las características conjuntas hacia el espacio de acciones del robot. En este fine‑tune, el modelo base `lerobot/smolvla_base` se ajusta sobre el dataset `GammoEiei/so101_pick_apple_combined`, que contiene 148 episodios (36.050 fotogramas) a 10 FPS, con dos tareas: "Pick up the green apple and put it in the bowl" y "Pick up the red apple and put it in the bowl". El entrenamiento se realizó durante 20.000 pasos con un batch de 32, optimizador AdamW y una tasa de aprendizaje de 1e‑4. Según información de fuentes externas (blog de ggando.com), en este tipo de fine‑tuning solo se entrenan aproximadamente 50 millones de parámetros (el action expert y las proyecciones), mientras que el encoder visual y el modelo de lenguaje quedan congelados.

## Capacidades

- Generación de acciones de control robótico (6 dimensiones: posición, orientación, apertura de la pinza) a partir de observaciones visuales y estado del robot.
- Interpretación de instrucciones en lenguaje natural para tareas específicas de manipulación (recoger y colocar).
- Soporta dos tareas concretas: recoger manzana verde y recoger manzana roja.
- Procesa imágenes de dos cámaras: una lateral (`side`) de resolución 720×1280 y una de muñeca (`wrist`) de 1080×1920.
- No es un modelo de lenguaje general; no genera texto ni responde preguntas.
- No implementa tool calling, agentes ni razonamiento multi‑paso; su función es exclusivamente el control motor.

## Casos de uso

- **Investigación en robótica de manipulación**: permite estudiar el comportamiento de un VLA compacto en tareas de pick‑and‑place, sirviendo como banco de pruebas para algoritmos de aprendizaje por imitación.
- **Automatización de tareas de recogida en líneas de producción**: en entornos controlados con cámaras fijas y un brazo SO‑101, el modelo puede encargarse de clasificar objetos (manzanas) según su color y depositarlos en un contenedor.
- **Prototipado de sistemas de control por lenguaje natural**: desarrolladores pueden integrar este modelo en un sistema de robótica asistida donde el operador da instrucciones habladas o escritas y el robot las ejecuta.
- **Benchmark de VLA en hardware de consumo**: al ser un modelo compacto, sirve para evaluar el rendimiento de SmolVLA en GPUs domésticas (p. ej., RTX 3060‑4090) antes de escalar a modelos más grandes.
- **Entrenamiento de nuevos modelos**: el fine‑tune puede ser reutilizado como punto de partida para otras tareas de manipulación, adaptando las capas de acción a nuevos objetos o entornos.
- **Demostraciones educativas**: en laboratorios docentes, permite mostrar cómo un modelo de aprendizaje por imitación controla un brazo robótico real o simulado, con un coste de entrenamiento bajo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente: "No evaluation results have been provided for this policy yet". Por tanto, no es posible comparar su tasa de éxito en el robot real.

## Requisitos de hardware

- No se especifican requisitos oficiales de VRAM ni GPU en la model card.
- Dado que el modelo tiene 450 millones de parámetros y es un VLA, se estima que puede ejecutarse en una GPU de consumo con al menos 8 GB de VRAM (por ejemplo, RTX 3060/4060) en inferencia con cuantización FP16, aunque no se proporcionan datos concretos.
- Para entrenamiento (fine‑tune) se recomienda una GPU con 12‑16 GB de VRAM, como RTX 4070/4080, aunque el blog de ggando.com sugiere que el fine‑tune se puede hacer en hardware de consumo.
- Las opciones de despliegue se basan en el ecosistema LeRobot: se puede ejecutar mediante `lerobot-rollout` (CLI de LeRobot) en un ordenador conectado al robot. No se menciona compatibilidad con vLLM, llama.cpp, Ollama o TGI, ya que no es un modelo de texto.
- La latencia y el throughput no están publicados.

## Comparativa con modelos similares

No hay datos de rendimiento comparativos disponibles. Se pueden citar otros modelos de la misma familia y tarea:

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| GammoEiei/smolvla_so101_pick_apple_v4 | 450M | No aplica | Apache 2.0 | HF (este) |
| kevinqz/SmolVLA‑SO101‑PickPlace‑CoreAI | No disponible | No aplica | No disponible | HF |
| ACT (Action Chunking Transformer) | ~100M (según referencia) | No aplica | No disponible | No disponible |

No se ha publicado comparación de rendimiento entre estos modelos. La información sobre ACT proviene de la blog de ggando.com, donde se menciona que SmolVLA es más compacto que ACT, pero sin cifras concretas.

## Limitaciones y advertencias

- **Especificidad de tarea**: el modelo solo está entrenado para dos tareas (recoger manzana verde o roja y colocarla en un cuenco). No es generalizable a otras tareas sin re‑entrenamiento.
- **Dependencia del hardware**: el modelo está configurado para un robot SO‑101 con cámaras específicas; cualquier cambio en el tipo de cámara, posición o resolución puede degradar el rendimiento.
- **Falta de evaluación**: no se han publicado resultados de éxito en el robot real; el rendimiento en entornos no controlados es incierto.
- **Riesgo de alucinación**: al ser un VLA, puede generar acciones incorrectas si la escena visual difiere del dataset de entrenamiento (iluminación, fondo, posición de objetos).
- **Licencia**: Apache 2.0 permite uso comercial, pero se debe citar el método (SmolVLA) y LeRobot según el README.
- **Sesgos**: el dataset contiene solo imágenes de un entorno particular; el modelo podría fallar con objetos de otros colores o formas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/GammoEiei/smolvla_so101_pick_apple_v4
- Modelo base: https://huggingface.co/lerobot/smolvla_base
- Dataset de entrenamiento: https://huggingface.co/datasets/GammoEiei/so101_pick_apple_combined
- Paper SmolVLA: https://huggingface.co/papers/2506.01844
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Blog de fine‑tuning SmolVLA en SO‑101 (ggando.com): https://ggando.com/blog/smolvla-so101/
- Repositorio GitHub de fine‑tuning (ggand0): https://github.com/ggand0/vla-so101
- Repositorio GitHub de análisis de atajos visuales (zwaneiz): https://github.com/zwaneiz/so101-vla-pickplace
