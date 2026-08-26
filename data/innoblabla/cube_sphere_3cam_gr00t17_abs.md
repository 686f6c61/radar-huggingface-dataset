# innoblabla/cube_sphere_3cam_GR00T17_abs

## Resumen

El modelo `innoblabla/cube_sphere_3cam_GR00T17_abs` es una política de robótica entrenada mediante aprendizaje por imitación sobre el modelo fundacional NVIDIA GR00T N1.7, un VLA (vision-language-action) de código abierto diseñado para razonamiento y habilidades robóticas generalizadas en humanoides. El autor, `innoblabla`, ha ajustado este modelo para una tarea concreta de manipulación: recoger un cubo o una esfera y colocarlo en un cáliz, utilizando tres cámaras (pinza, base y superior) y un robot tipo `so_follower`. El modelo se distribuye a través de la librería LeRobot y está pensado para ser ejecutado en el mismo robot con el que se recopiló el dataset.

Con 3.144.016.000 parámetros (aproximadamente 3,14 mil millones), el modelo emplea un backbone Cosmos-Reason2/Qwen3-VL combinado con un action transformer basado en flow-matching, que predice acciones de 6 dimensiones a partir de observaciones de estado y tres imágenes RGB de 480x640. La licencia Apache 2.0 permite uso comercial sin restricciones, y los pesos se almacenan en formato safetensors. Aunque el modelo no incluye capacidades de generación de texto ni tool calling, su relevancia radica en ser un ejemplo práctico de cómo adaptar un modelo fundacional de robótica a una tarea específica con un dataset relativamente pequeño (114 episodios).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GR00T N1.7 (VLA con backbone Cosmos-Reason2/Qwen3-VL y action transformer de flow-matching) |
| Parametros totales | 3.144.016.000 (3,14 B) |
| Parametros activos | no disponible (no se especifica si es MoE) |
| Longitud de contexto | no disponible (no aplica directamente, es un modelo de acción) |
| Tipos de cuantizacion | no disponible (solo se distribuye en safetensors, sin cuantizaciones publicadas) |
| Idiomas soportados | no disponible (el modelo no procesa lenguaje natural de forma explícita; las tareas se definen en inglés) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en GR00T N1.7 de NVIDIA, un modelo fundacional cross-embodiment que combina un backbone de visión-lenguaje (Cosmos-Reason2/Qwen3-VL) con un action transformer que utiliza flow-matching para generar acciones continuas. La entrada consiste en el estado propioceptivo del robot (6 dimensiones) y tres imágenes RGB de 480x640 píxeles procedentes de cámaras montadas en la pinza, la base y la parte superior. La salida es un vector de acción de 6 dimensiones que controla los grados de libertad del robot.

El entrenamiento se realizó con LeRobot (versión 0.6.1) sobre un dataset propio (`innoblabla/cube_sphere_3cam`) que contiene 114 episodios y 55.203 fotogramas a 30 FPS, con dos tareas: "pick up the cube and place it in the goblet" y "pick up the sphere and place it in the goblet". Se emplearon 20.000 pasos de entrenamiento con un batch size de 32, optimizador AdamW, learning rate de 0,0001 y semilla 42. No se menciona el uso de RLHF, DPO ni otras técnicas de refinamiento; se trata de un ajuste fino por imitación directa.

## Capacidades

- Manipulación robótica: el modelo predice acciones de 6 grados de libertad para tareas de pick-and-place, específicamente recoger un cubo o una esfera y depositarlo en un cáliz.
- Percepción multimodal: procesa simultáneamente tres flujos de vídeo (pinza, base y superior) junto con el estado propioceptivo del robot.
- Generalización limitada: al estar entrenado en un dataset reducido, las capacidades se limitan a las tareas y objetos vistos durante el entrenamiento.
- Integración con LeRobot: compatible con el ecosistema LeRobot para entrenamiento, evaluación y despliegue en robots reales.
- No incluye generación de texto, tool calling, razonamiento conversacional ni capacidades de agente autónomo; su función es exclusivamente actuar como política de control.

## Casos de uso

- Automatización de tareas de pick-and-place en entornos controlados: el modelo puede integrarse en una celda robótica para clasificar objetos (cubos y esferas) y colocarlos en contenedores específicos, reduciendo la intervención manual.
- Prototipado rápido de políticas robóticas: gracias a LeRobot, un investigador puede entrenar y desplegar esta política en un robot `so_follower` en pocas horas, sirviendo como punto de partida para tareas más complejas.
- Evaluación de modelos fundacionales en robótica: permite comparar el rendimiento de GR00T N1.7 frente a otros VLA en tareas de manipulación con pocos datos.
- Investigación en aprendizaje por imitación: el dataset y el modelo son útiles para estudiar cómo el número de episodios y la configuración de cámaras afectan al éxito de la política.
- Desarrollo de sistemas de control basados en visión: el uso de tres cámaras con diferentes perspectivas puede servir de referencia para integrar percepción visual en robots con múltiples sensores.
- Formación y demostraciones educativas: el modelo y su documentación permiten a estudiantes de robótica aprender a entrenar y ejecutar políticas de manipulación con herramientas open source.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente que no se han proporcionado resultados de evaluación en robot real. No se dispone de métricas como tasa de éxito, MMLU, HumanEval u otras, ya que el modelo no está orientado a tareas de lenguaje o razonamiento general.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible oficialmente. Dado el tamaño de 3,14 B parámetros, una estimación razonable en FP16 sería de unos 6-8 GB, pero no se ha verificado.
- GPU recomendadas: no se especifican. Para ejecutar la política en tiempo real con tres cámaras, se recomienda al menos una GPU con 8 GB de VRAM (por ejemplo, RTX 3060 o superior). Para entrenamiento, se necesitaría una GPU con mayor capacidad (12-24 GB).
- Compatibilidad con GPU de consumo: probablemente sí, dado el tamaño moderado, pero no hay confirmación oficial.
- Opciones de despliegue: el modelo se ejecuta mediante LeRobot, que soporta inferencia en PyTorch con CUDA. No se menciona compatibilidad con vLLM, llama.cpp u Ollama, ya que no es un modelo de lenguaje.
- Latencia y throughput: no disponibles. Dependerá del hardware y de la resolución de las cámaras.

## Comparativa con modelos similares

| Modelo | Parámetros | Arquitectura | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `innoblabla/cube_sphere_3cam_GR00T17_abs` | 3,14 B | GR00T N1.7 (VLA) | Pick-and-place con 3 cámaras | Apache 2.0 | Hugging Face |
| OpenVLA (7B) | 7 B | VLA basado en Prismatic | Manipulación general | MIT | Hugging Face |
| RT-2 (55B) | 55 B | VLA basado en PaLI-X | Manipulación y navegación | No abierto | No disponible |

La comparativa es limitada porque no se dispone de benchmarks comunes. OpenVLA es un modelo más grande y con mayor generalización, pero requiere más recursos. RT-2 no es de código abierto. Este modelo destaca por su tamaño compacto y su integración con LeRobot, lo que facilita su uso en entornos de investigación.

## Limitaciones y advertencias

- Sesgos conocidos: el modelo fue entrenado con un dataset de solo 114 episodios, por lo que puede fallar ante variaciones en la iluminación, posición de los objetos o texturas no vistas durante el entrenamiento.
- Riesgo de alucinación: al ser un modelo de acción, no genera texto, pero puede producir acciones erróneas si las observaciones difieren de las del entrenamiento.
- Limitaciones de contexto: no maneja lenguaje natural ni instrucciones complejas; las tareas están fijadas en el dataset.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero se debe atribuir el origen y no se puede responsabilizar al autor por daños.
- Caveat para producción: no se han reportado evaluaciones en robot real, por lo que su fiabilidad en entornos no controlados es desconocida. Se recomienda validar exhaustivamente antes de un despliegue industrial.
- Dependencia del hardware: el rendimiento en tiempo real depende de la GPU y de la latencia de las cámaras; no se garantiza funcionamiento en sistemas de bajo coste.

## Enlaces

- [Repositorio del modelo en Hugging Face](https://huggingface.co/innoblabla/cube_sphere_3cam_GR00T17_abs)
- [Dataset de entrenamiento](https://huggingface.co/datasets/innoblabla/cube_sphere_3cam)
- [Repositorio de Isaac-GR00T en GitHub](https://github.com/ZebinJiang/Isaac-GR00T17)
- [Documentación de LeRobot](https://huggingface.co/docs/lerobot/index)
