# justintiensmith/lingbot_v1

## Resumen

LingBot-VA (publicado como `lingbot_v1`) es una política de mundo modelo video-acción autorregresiva para robótica, desarrollada por Justin Tien-Smith y construida sobre el stack de difusión de video Wan2.2. A diferencia de los modelos de política convencionales que predicen acciones directamente desde observaciones, LingBot-VA intercala la predicción de latentes de video futuros y acciones de robot en una única secuencia autorregresiva, alimentando los keyframes observados de vuelta a su caché KV para lograr un modelado de mundo en bucle cerrado. Esto le permite anticipar las consecuencias visuales de sus acciones, mejorando la coherencia y la planificación en tareas de manipulación.

El modelo está entrenado con el framework LeRobot y está especializado en tareas de manipulación de objetos sobre una mesa, como mover tazas, bolígrafos y bloques. Cuenta con aproximadamente 5.090 millones de parámetros y un tamaño de repositorio de 10,2 GB en formato safetensors. Su licencia Apache 2.0 permite uso comercial y modificación sin restricciones significativas. Es relevante porque representa una aproximación emergente que combina modelos de mundo con políticas de control, un área de creciente interés en robótica e IA encarnada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Autorregresiva basada en difusión de video (Wan2.2), intercala latentes de video y acciones |
| Parametros totales | 5.088.872.670 (~5,09 B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo de visión-acción, sin procesamiento de lenguaje natural) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

LingBot-VA se basa en el stack de difusión de video Wan2.2, pero lo adapta para el control robótico. En lugar de generar únicamente video, el modelo predice de forma autorregresiva una secuencia que alterna latentes de video futuros y acciones del robot. Las observaciones actuales (imágenes de cámara y estado del efector) se codifican y se alimentan al modelo, que genera tanto la siguiente acción como el siguiente latente de video, que a su vez se realimenta en la caché KV para el siguiente paso. Este diseño permite al modelo mantener una representación interna del mundo que evoluciona con el tiempo, lo que facilita la planificación a medio plazo y la coherencia temporal.

El entrenamiento se realizó con LeRobot sobre un dataset propio de 1200 episodios (570.386 frames a 30 FPS) con tareas de manipulación de objetos cotidianos (tazas, bolígrafos, bloques, recipientes de especias) en configuraciones variadas. El robot utilizado es un `so_follower` con dos cámaras (frontal y de muñeca) y un estado de 6 dimensiones. No se especifica si se aplicaron técnicas de RLHF o DPO; el entrenamiento parece ser supervisado de forma directa sobre las demostraciones.

## Capacidades

- Control robótico de manipulación: genera acciones de 6 grados de libertad (posición y orientación del efector) a partir de imágenes y estado.
- Modelado de mundo: predice latentes de video futuros, lo que le permite anticipar el resultado visual de sus acciones.
- Bucle cerrado: realimenta los keyframes observados en su caché KV, mejorando la estabilidad en tareas de larga duración.
- Generalización limitada a tareas de la mesa: entrenado específicamente para mover objetos (tazas, bolígrafos, bloques) hacia recipientes o posiciones relativas.
- Soporte multi-cámara: procesa simultáneamente una cámara frontal y una de muñeca.
- No incluye capacidades de lenguaje natural, tool calling, agentes ni razonamiento simbólico; es un modelo puramente visual-motor.

## Casos de uso

- Automatización de pick-and-place en entornos controlados: el modelo puede ejecutar tareas repetitivas de recoger y colocar objetos (tazas, bloques) en posiciones o recipientes determinados, con una ventana de video que le permite corregir errores de agarre.
- Robótica de asistencia en laboratorios: adecuado para preparar materiales (mover recipientes, organizar objetos pequeños) en entornos de investigación donde las tareas son conocidas y el espacio de trabajo es fijo.
- Desarrollo de prototipos de VLA: al estar integrado con LeRobot, sirve como punto de partida para investigadores que quieran experimentar con políticas de mundo modelo sin entrenar desde cero.
- Evaluación de modelos de mundo en robótica: su arquitectura autorregresiva con predicción de video lo convierte en un banco de pruebas para estudiar la relación entre predicción visual y control motor.
- Entrenamiento por imitación en entornos simulados: puede transferirse a simuladores robóticos (como MuJoCo o Isaac Sim) para generar demostraciones sintéticas o validar algoritmos de aprendizaje por refuerzo.
- Sistemas de demostración educativa: útil en cursos de robótica y visión por computador para ilustrar conceptos de modelos de mundo, difusión y control autorregresivo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No existen datos de MMLU, HumanEval, GSM8K ni otros indicadores de rendimiento general, ya que se trata de un modelo de robótica especializado. Tampoco se aportan métricas de tasa de éxito en tareas de manipulación.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible oficialmente. Con 5,09 B parámetros en FP32 se necesitarían ~20 GB, pero con cuantización a 8 bits (~5 GB) o 4 bits (~2,5 GB) podría reducirse significativamente. Sin embargo, la arquitectura de difusión con caché KV y predicción de video probablemente requiera más memoria que un transformer estándar del mismo tamaño.
- GPU recomendadas: una GPU con al menos 16 GB de VRAM (p. ej., RTX 4090, A100 40 GB) sería prudente para inferencia sin cuantización. Con cuantización agresiva podría ejecutarse en GPUs de 8 GB, aunque no está verificado.
- No se ha confirmado que quepa en GPUs de consumo básico (p. ej., RTX 3060 12 GB) debido a la complejidad de la arquitectura.
- Opciones de despliegue: al ser un modelo de LeRobot, se integra con el ecosistema de Hugging Face (lerobot). No se mencionan soportes para vLLM, llama.cpp, Ollama o TGI, ya que no es un modelo de lenguaje.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de información suficiente para establecer una comparativa rigurosa con otros modelos de la misma categoría (VLA o modelos de mundo para robótica). Alternativas conocidas como OpenVLA (7 B parámetros) o RT-2 no han sido comparadas en la documentación proporcionada. No se puede afirmar superioridad o inferioridad sin datos de evaluación.

## Limitaciones y advertencias

- Entrenamiento limitado a un dataset de 1200 episodios con tareas muy específicas (mover tazas, bolígrafos, bloques); no generalizará a objetos o escenarios no vistos.
- Riesgo de sobreajuste a las condiciones del dataset: iluminación, fondo, tipo de robot y cámaras concretas.
- Sin capacidades de lenguaje natural: no puede interpretar instrucciones complejas ni mantener diálogo; las tareas están codificadas como descripciones fijas.
- No se han publicado evaluaciones de robustez ante perturbaciones (cambios de iluminación, oclusiones, variaciones de objetos).
- La arquitectura de difusión puede ser computacionalmente intensiva, lo que limita su uso en robots con hardware embebido.
- Licencia Apache 2.0 permite uso comercial, pero el modelo se distribuye sin garantías y sin soporte oficial.
- El repositorio no incluye pesos cuantizados ni guías de despliegue específicas, lo que puede dificultar su adopción en producción.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/justintiensmith/lingbot_v1
- Documentación de LingBot-VA en GitHub: https://github.com/Robbyant/lingbot-va
- Proyecto relacionado LingBot-World: https://github.com/robbyant/lingbot-world
- Sitio web de LingBot-World: https://www.lingbot-world.org/
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Guía de LeRobot para lingbot_va: https://huggingface.co/docs/lerobot/main/en/lingbot_va
