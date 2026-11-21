# naver-ai/DroneCATS-Cosmos3-Edge-2B

## Resumen

DroneCATS-Cosmos3-Edge-2B es un modelo de visión-lenguaje-acción (VLA) desarrollado por NAVER AI Lab, especializado en el control de drones mediante instrucciones en lenguaje natural. Se trata de un ajuste fino del modelo base nvidia/Cosmos3-Edge, un transformer multimodal de aproximadamente 2.435 millones de parámetros, que recibe un fotograma de la cámara del dron junto con un comando textual y devuelve una única acción en formato JSON.

El modelo resuelve el problema de traducir instrucciones de alto nivel (por ejemplo, "ve al huevo") en comandos de vuelo ejecutables, cubriendo tareas de comandado, aproximación, seguimiento y búsqueda. Es relevante porque demuestra que modelos multimodales de tamaño compacto (2B) pueden actuar como agentes VLA generalistas en robótica aérea, un dominio tradicionalmente dominado por políticas especializadas y entrenadas con refuerzo.

La ficha se basa en la model card publicada por el autor y en los metadatos de Hugging Face. No se dispone de información sobre benchmarks cuantitativos ni sobre el número exacto de tokens de entrenamiento, por lo que esos apartados se marcan como no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal vision-lenguaje-accion (base: nvidia/Cosmos3-Edge) |
| Parametros totales | 2.435.616.496 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; el ejemplo usa bfloat16) |
| Idiomas soportados | ingles (en) |
| Licencia | OpenMDW-1.1 (etiquetada como "other" en Hugging Face) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de nvidia/Cosmos3-Edge, un transformer multimodal de 2B parámetros para entrada imagen-texto y salida de texto. Sobre esa base, NAVER AI Lab realizó un ajuste fino supervisado para la tarea de control de drones, manteniendo la interfaz de chat multimodal con soporte de metadatos de cámara (`camera_aux`) y plantillas de prompt específicas.

El entrenamiento combina datos de instrucción multimodal general (subconjuntos de MAmmoTH-VL y MAmmoTH-VL2, incluyendo VisualWebInstruct y LLaVA-CoT-100k) con datos específicos de acciones de dron del dataset DroneCATS-Pilot-54K, construido a partir de NYU Depth v2, SUN RGB-D y TartanAir v2. El autor remite al apéndice C del paper para los detalles de composición. No se especifica en la información disponible si hubo RLHF, DPO ni el número exacto de tokens de entrenamiento.

La innovación principal es la formulación de la salida como un único objeto JSON con un vocabulario de acciones cerrado (`go`, `rotate`, `think`, `finished`), lo que permite integrar el modelo en bucles de control de vuelo sin postprocesado complejo. El prompt incluye intrínsecos de cámara y un historial de hasta cinco acciones previas para dar contexto temporal al agente.

## Capacidades

- Generación de acciones de vuelo en JSON a partir de un fotograma y una instrucción en lenguaje natural.
- Cuatro tipos de acción: `go` (avanzar hacia un punto con profundidad estimada), `rotate` (giro en el sitio), `think` (pausa para planificar) y `finished` (llegada al objetivo).
- Estimación de profundidad en unidades canónicas convertibles a metros mediante los intrínsecos de cámara.
- Razonamiento multimodal de un solo paso con historial de acciones previas (hasta 5).
- Comprensión de instrucciones de comandado, aproximación, seguimiento y búsqueda.
- Soporte de modo "thinking" desactivable mediante la plantilla de chat (`enable_thinking=False`, `skip_reasoning=True`).
- Capacidades heredadas del modelo base en tareas de imagen-texto (no detalladas en la información disponible).
- No se documenta soporte explícito de tool calling ni de function calling genérico.

## Casos de uso

- Navegación autónoma hacia un objeto: el modelo recibe el fotograma actual y la instrucción "go to the egg" y devuelve un punto objetivo con profundidad, adecuado para bucles de control cerrado en drones de bajo coste como el DJI Tello.
- Seguimiento visual de objetivos: usando el historial de acciones, el agente puede mantener la trayectoria hacia un objetivo en movimiento, útil en tareas de inspección o vigilancia.
- Búsqueda y exploración: la acción `think` permite al modelo pausar y planificar en el siguiente paso, lo que facilita la exploración de entornos desconocidos sin mapa previo.
- Investigación en VLA: sirve como referencia reproducible para evaluar modelos multimodales como agentes de control, dado que el paper compara múltiples MLLM bajo el mismo protocolo.
- Prototipado rápido en robótica aérea: al requerir solo `transformers>=5.18.0`, `torch`, `torchvision` y `accelerate`, se puede desplegar en una estación con GPU consumer para pruebas de laboratorio.
- Educación y demos: el modelo y el dataset público permiten construir demostraciones de control por lenguaje natural en drones comerciales de bajo coste.
- Integración en pipelines de simulación: combinado con TartanAir v2 u otros simuladores, permite generar datos sintéticos de acciones para entrenamiento o validación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 5 GB en bfloat16 (2.435 millones de parámetros), más memoria para el procesador visual y activaciones; con cuantización de 8 bits o 4 bits cabría en GPUs de 4-6 GB, aunque no se documentan cuantizaciones oficiales.
- GPU recomendadas: no se especifican en la model card. Por tamaño, una RTX 3060/4060 de 8 GB o superior debería ser suficiente en bfloat16; A100/H100 no son necesarias para inferencia.
- Cabe en GPU consumer: sí, previsiblemente en cualquier GPU con al menos 6-8 GB de VRAM en bfloat16.
- Opciones de despliegue: la model card solo documenta `transformers` (con `Cosmos3EdgeForConditionalGeneration`), `torch`, `torchvision` y `accelerate`. No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| DroneCATS-Cosmos3-Edge-2B | 2,435 M | no disponible | VLA para drones | OpenMDW-1.1 | Hugging Face |
| nvidia/Cosmos3-Edge (base) | no disponible en la informacion | no disponible | Imagen-texto general | no disponible en la informacion | Hugging Face |
| Alternativas VLA para drones | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de información suficiente para comparar con otros modelos VLA de drones de forma cuantitativa.

## Limitaciones y advertencias

- El modelo solo propone acciones; no evita obstáculos. Es imprescindible una capa de seguridad externa antes de volar un dron real.
- Entrenado únicamente en inglés; no se documenta soporte multilingüe.
- Requiere usar exactamente las plantillas de prompt publicadas (`prompts/system_prompt.txt` y `prompts/user_prompt.txt`); cambios en la redacción degradan el comportamiento.
- Es obligatorio incluir `camera_aux` con `width`, `height`, `fx` y `fy`; si falta, no se produce error pero el modelo recibe una entrada fuera de distribución.
- Las imágenes deben redimensionarse a un máximo de 640 px de ancho.
- Riesgo de alucinación en la estimación de profundidad y en la selección del punto objetivo, especialmente en escenas no representadas en los datos de entrenamiento.
- La licencia OpenMDW-1.1 debe revisarse antes de uso comercial; la model card no detalla restricciones adicionales.
- El modelo base Cosmos3-Edge puede arrastrar sesgos de sus datos de preentrenamiento, no documentados en esta ficha.
- No se documentan límites de contexto ni comportamiento ante secuencias largas de historial más allá de las 5 acciones indicadas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/naver-ai/DroneCATS-Cosmos3-Edge-2B
- Paper (arXiv): https://arxiv.org/abs/2609.01404
- Página del proyecto: https://naver-ai.github.io/DroneCATS/
- Repositorio GitHub: https://github.com/naver-ai/DroneCATS
- Dataset DroneCATS-Pilot-54K: https://huggingface.co/datasets/naver-ai/DroneCATS-Pilot-54K
- Modelo base: https://huggingface.co/nvidia/Cosmos3-Edge
- MAmmoTH-VL Instruct-12M: https://huggingface.co/datasets/MAmmoTH-VL/MAmmoTH-VL-Instruct-12M
- VisualWebInstruct: https://huggingface.co/datasets/TIGER-Lab/VisualWebInstruct
- LLaVA-CoT-100k: https://huggingface.co/datasets/Xkev/LLaVA-CoT-100k
- NYU Depth v2: https://cs.nyu.edu/~silberman/datasets/nyu_depth_v2.html
- SUN RGB-D: https://rgbd.cs.princeton.edu/
- TartanAir v2: https://huggingface.co/datasets/theairlabcmu/tartanair2
