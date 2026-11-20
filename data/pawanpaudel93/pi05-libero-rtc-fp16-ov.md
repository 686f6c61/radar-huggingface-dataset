# pawanpaudel93/pi05-libero-rtc-fp16-ov

## Resumen

π0.5 LIBERO con real-time chunking (RTC) en formato OpenVINO es un paquete de política (`policy_package`) derivado de `lerobot/pi05_libero_finetuned_v044`, publicado por el usuario pawanpaudel93. Se trata de un modelo de visión-lenguaje-acción (VLA) orientado a robótica, concretamente al benchmark LIBERO, convertido al formato OpenVINO para su ejecución en CPUs y GPUs Intel mediante el motor `ov-policy` de Cascadia (tipo `pi05`). El paquete incorpora la funcionalidad de real-time chunking (RTC), que permite encadenar fragmentos de acción con guiado entre inferencias consecutivas.

El modelo resuelve el problema de ejecutar políticas VLA de Physical Intelligence (familia π0.5) sobre hardware Intel sin necesidad de GPU NVIDIA, manteniendo el grafo en float32 con pesos en fp16. Acepta dos imágenes RGB de 256x256, un vector de estado de 8 dimensiones, una instrucción de tarea y ruido, y produce secuencias de 50 acciones de 7 dimensiones. La inclusión de RTC añade puertos de guiado (`prev_chunk_left_over`, `inference_delay`, `max_guidance_weight`, `execution_horizon`) que permiten suavizar la transición entre chunks de acción en control robótico en tiempo real.

Es relevante ahora porque abre la inferencia de políticas VLA de última generación a hardware Intel consumer y de servidor, y porque el soporte RTC es una técnica reciente para estabilizar el control continuo en modelos que generan acciones por chunks. El paquete tiene 0 descargas y 0 likes en el momento de la consulta, y requiere una build de Cascadia que aún no está en release (en revisión en labscommunity/cascadia).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-language-action (VLA) basada en π0.5 / PaliGemma, exportada como grafo OpenVINO |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible (entrada de tarea como texto libre, sin contexto declarado) |
| Tipos de cuantizacion | Pesos fp16 con grafo float32 (fp16-ov) |
| Idiomas soportados | no disponible (instrucciones de tarea en lenguaje natural, idioma no declarado) |
| Licencia | Gemma Terms of Use (modelo base PaliGemma/Gemma) |
| Formato de pesos | OpenVINO IR (`policy_package` para el motor `ov-policy`) |
| Entradas | `images.image` [3,256,256], `images.image2` [3,256,256], `state` [8], `task` [], `noise` [50,32], `prev_chunk_left_over` [50,7], `inference_delay` [], `max_guidance_weight` [], `execution_horizon` [] |
| Salidas | `action` [50,7] |
| Tamano del repositorio | 6,3 GB |
| Modelo base | lerobot/pi05_libero_finetuned_v044 |
| Libreria | openvino |
| Pipeline | robotics |

## Arquitectura y entrenamiento

El modelo es una política de visión-lenguaje-acción de la familia π0.5, construida sobre PaliGemma (un modelo Gemma multimodal). La arquitectura subyacente combina un codificador visual y un modelo de lenguaje que condiciona la generación de acciones sobre la instrucción de tarea y el estado del robot. En este paquete concreto, el modelo se ha exportado a OpenVINO como grafo float32 con pesos fp16, y se ha modificado respecto al checkpoint original para habilitar RTC (real-time chunking), añadiendo puertos de guiado que permiten reutilizar el remanente del chunk anterior (`prev_chunk_left_over`), modelar el retardo de inferencia (`inference_delay`) y limitar la ventana de ejecución (`execution_horizon`) con un peso máximo de guiado (`max_guidance_weight`).

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO en esta ficha. El modelo base `pi05_libero_finetuned_v044` procede del ecosistema LeRobot y está afinado sobre el benchmark LIBERO. La innovación técnica destacable es doble: por un lado, la conversión a OpenVINO para inferencia en CPU/GPU Intel; por otro, la incorporación de RTC, que mitiga las discontinuidades entre chunks de acción consecutivos, un problema habitual en políticas que predicen bloques de acciones de forma abierta. La verificación reportada indica que, sin los campos RTC, el paquete coincide con el mismo checkpoint exportado sin RTC hasta 1,07e-5 en OpenVINO CPU f32 sobre x86.

## Capacidades

- Generación de acciones robóticas: produce secuencias de 50 acciones de 7 dimensiones a partir de observaciones visuales y estado del robot.
- Percepción visual multimodal: procesa dos imágenes RGB de 256x256 (`images.image` e `images.image2`).
- Condicionamiento por instrucción de tarea: acepta un tensor `task` con la descripción textual de la tarea.
- Control con real-time chunking: soporta guiado entre chunks mediante `prev_chunk_left_over`, `inference_delay`, `max_guidance_weight` y `execution_horizon`.
- Inferencia en hardware Intel: ejecutable en CPU y GPU Intel mediante OpenVINO y el motor `ov-policy` de Cascadia.
- Integración con el ecosistema LeRobot: derivado de un checkpoint de LeRobot para el benchmark LIBERO.
- No se declaran capacidades de tool calling, agentes multi-paso, audio ni thinking mode en la información disponible.

## Casos de uso

- Investigación en manipulación robótica sobre LIBERO: el modelo permite reproducir y evaluar políticas VLA en las tareas del benchmark LIBERO sin GPU NVIDIA, usando OpenVINO en CPU o GPU Intel.
- Despliegue en robots con hardware Intel: al ejecutarse en CPU/GPU Intel, encaja en plataformas embebidas o estaciones de trabajo con aceleración integrada donde no hay CUDA disponible.
- Control continuo con RTC: en tareas que requieren encadenar chunks de acción sin pausas, los puertos RTC permiten reutilizar el remanente del chunk anterior y compensar el retardo de inferencia, reduciendo discontinuidades en la trayectoria.
- Evaluación comparativa de exportaciones: sirve para comparar el comportamiento del mismo checkpoint en formato original frente a OpenVINO fp16, con la verificación numérica reportada de 1,07e-5.
- Prototipado de pipelines de política en Cascadia: el comando `cascadia run ./pi05-libero-rtc-fp16-ov --engine ov-policy --device GPU` permite levantar el servicio de política para pruebas de integración.
- Benchmarking de latencia en hardware Intel: al ser un grafo OpenVINO, es adecuado para medir throughput y latencia de políticas VLA en distintas configuraciones de CPU y GPU Intel.
- Base para afinado posterior: al derivar de un checkpoint LeRobot, puede servir como punto de partida para ajustes específicos de tarea, siempre respetando la licencia Gemma.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks propios de este paquete RTC en la información disponible. La model card indica explícitamente que el éxito de tarea no se ha medido para este paquete con RTC, y que el paquete π0.5 LIBERO sin RTC obtiene 28/30 en `libero_spatial`. Se incluye como referencia, no como resultado de este paquete.

| Metrica | Resultado | Notas |
|---|---|---|
| Coincidencia numérica sin RTC | 1,07e-5 | OpenVINO CPU f32, x86, frente al checkpoint exportado sin RTC |
| Éxito en `libero_spatial` (sin RTC) | 28/30 | Corresponde al paquete π0.5 LIBERO sin RTC, no a este paquete RTC |
| Éxito en `libero_spatial` (con RTC) | no disponible | No medido según la model card |

## Requisitos de hardware

- VRAM/RAM estimada: el repositorio ocupa 6,3 GB; la inferencia en fp16 requiere del orden de varios GB de memoria, aunque no se especifica una cifra exacta en la información disponible.
- GPU recomendadas: GPUs Intel (el comando de ejemplo usa `--device GPU`); también ejecutable en CPU Intel.
- Cabe en GPU consumer: sí, en GPUs Intel integradas o dedicadas compatibles con OpenVINO, siempre que dispongan de memoria suficiente para el grafo fp16; no se detalla el mínimo exacto.
- Opciones de despliegue: motor `ov-policy` de Cascadia (build con soporte para el tipo `pi05`, aún en revisión y no incluida en release). No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de política.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| pawanpaudel93/pi05-libero-rtc-fp16-ov | VLA π0.5 LIBERO con RTC, OpenVINO | no disponible | no disponible | Gemma Terms of Use | Hugging Face, requiere Cascadia en revisión |
| lerobot/pi05_libero_finetuned_v044 | VLA π0.5 LIBERO, checkpoint original | no disponible | no disponible | Gemma Terms of Use | Hugging Face (LeRobot) |
| Paquete π0.5 LIBERO sin RTC (referenciado en la model card) | VLA π0.5 LIBERO, OpenVINO sin RTC | no disponible | no disponible | Gemma Terms of Use | Referenciado, 28/30 en `libero_spatial` |

No se dispone de datos suficientes para comparar parámetros, contexto ni rendimiento con alternativas de otros ecosistemas.

## Limitaciones y advertencias

- El éxito de tarea de este paquete con RTC no se ha medido; solo se ha verificado la equivalencia numérica sin RTC (1,07e-5).
- Requiere una build de Cascadia con el tipo de política `ov-policy` que aún no está en release (en revisión en labscommunity/cascadia), lo que limita su uso inmediato en producción.
- La licencia es Gemma Terms of Use, con restricciones de uso en la Sección 3.2 y la Gemma Prohibited Use Policy; el uso comercial está sujeto a dichos términos.
- El modelo está especializado en el benchmark LIBERO y en tareas de manipulación; no es un modelo de propósito general.
- No se declaran idiomas soportados para las instrucciones de tarea, lo que introduce incertidumbre sobre el multilingüismo.
- No se dispone de información sobre sesgos, riesgo de alucinación en la generación de acciones ni robustez fuera de las condiciones de entrenamiento.
- El paquete tiene 0 descargas y 0 likes, por lo que no cuenta con validación comunitaria.
- La memoria requerida y la latencia no están documentadas, lo que dificulta planificar el despliegue.

## Enlaces

- Hugging Face: https://huggingface.co/pawanpaudel93/pi05-libero-rtc-fp16-ov
- Modelo base: https://huggingface.co/lerobot/pi05_libero_finetuned_v044
- Términos de Gemma: https://ai.google.dev/gemma/terms
- Política de uso prohibido de Gemma: https://ai.google.dev/gemma/prohibited_use_policy
- Repositorio openpi de Physical Intelligence: https://github.com/Physical-Intelligence/openpi
- Cascadia (en revisión): labscommunity/cascadia
