# aDaikiKamata/patch_policy_libero10_tipsv2_lang

## Resumen

`patch_policy_libero10_tipsv2_lang` es una política robótica (policy) de manipulación entrenada con el framework LeRobot de Hugging Face, desarrollada por Kamata Daiki. El modelo implementa la arquitectura Patch Policy, un enfoque ligero y rápido para aprendizaje por imitación en robótica, que utiliza representaciones basadas en parches en lugar de representaciones globales. El nombre del modelo sugiere que emplea el encoder visual TIPSv2 (Text-Image Pretraining with Spatial Awareness) de Google DeepMind, aunque esta información no está confirmada explícitamente en la model card.

El modelo está entrenado sobre el benchmark LIBERO (Lifelong Robot Learning), concretamente en el subconjunto `libero_10_image`, que contiene 10 tareas de manipulación de mesa con un robot Panda. Con 211,7 millones de parámetros, la política consume imágenes de dos cámaras (vista principal y muñeca) junto con el estado del robot, y produce acciones continuas de 7 dimensiones. Su relevancia radica en ser un ejemplo de política open source (licencia Apache 2.0) que combina arquitecturas modernas de visión-lenguaje con control robótico, útil para investigación en aprendizaje por imitación y lifelong learning.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Patch Policy (basada en parches, con encoder visual TIPSv2 probablemente) |
| Parametros totales | 211.689.479 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No aplica (política robótica, no modelo de lenguaje) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No aplica (no procesa lenguaje) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La política se basa en Patch Policy, una arquitectura que procesa las observaciones visuales dividiendo las imágenes en parches y aplicando atención sobre ellos, en lugar de usar un pooling global. Esto permite capturar información espacial detallada, lo que según la página oficial del método proporciona una mejora relativa del 40% frente a políticas con representaciones globales en entornos simulados y reales. El encoder visual probablemente es TIPSv2, un modelo de pretraining de imagen-texto con conciencia espacial, aunque la model card no lo especifica explícitamente.

El entrenamiento se realizó con LeRobot (versión 0.6.2) sobre el dataset `lerobot/libero_10_image`, que contiene 379 episodios y 101.469 frames a 10 FPS, cubriendo 10 tareas de manipulación como colocar objetos en platos, abrir microondas o apilar tazas. La configuración de entrenamiento incluye 10.000 pasos, batch size de 128, optimizador AdamW con learning rate de 5e-5 y semilla 1000. No se menciona el uso de RLHF, DPO ni otras técnicas de refinamiento; se trata de aprendizaje por imitación supervisado.

## Capacidades

- Manipulación robótica de objetos en entornos de mesa: el modelo ejecuta tareas como colocar tazas en platos, guardar objetos en cestas o encender fogones, a partir de instrucciones de alto nivel.
- Percepción visual multimodal: consume simultáneamente dos cámaras (vista principal y cámara de muñeca) con resolución 256x256, más el estado del robot (8 dimensiones).
- Control continuo de acciones: produce comandos de 7 dimensiones (posición y orientación del efector final) a 10 FPS.
- Aprendizaje por imitación: la política ha sido entrenada mediante demostraciones expertas, sin necesidad de recompensas explícitas.
- Generalización limitada a tareas similares: al estar entrenado en LIBERO, puede transferir conocimiento a tareas de la misma distribución.
- No dispone de capacidades de lenguaje, tool calling, agentes ni razonamiento multi-paso, al ser un modelo puramente robótico.

## Casos de uso

- Automatización de tareas de pick-and-place en laboratorios: el modelo puede colocar objetos en posiciones específicas (platos, cestas, compartimentos) usando la información visual de dos cámaras, lo que lo hace adecuado para entornos de investigación controlados.
- Benchmarking de políticas de imitación: al estar entrenado en LIBERO, sirve como referencia para comparar nuevas arquitecturas de aprendizaje robótico en las mismas 10 tareas.
- Estudio de lifelong learning: el modelo puede usarse como punto de partida para experimentos de transferencia de conocimiento entre tareas, dado que LIBERO está diseñado específicamente para este propósito.
- Desarrollo de sistemas de manipulación con visión espacial: su arquitectura basada en parches permite investigar cómo la atención espacial mejora la precisión en tareas que requieren entender relaciones entre objetos.
- Prototipado rápido con LeRobot: al ser compatible con el ecosistema LeRobot, los desarrolladores pueden cargar la política y ejecutarla en un robot Panda real o simulado con pocas líneas de código.
- Investigación en encoders visuales para robótica: el uso de TIPSv2 (si se confirma) permite estudiar cómo los modelos de visión-lenguaje preentrenados se adaptan a tareas de control motor.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente: "No evaluation results have been provided for this policy yet". No hay datos de tasa de éxito en tareas reales ni comparaciones cuantitativas con otras políticas.

## Requisitos de hardware

- VRAM estimada para inferencia: con 211,7 millones de parámetros y pesos en safetensors (5,7 GB en disco), la inferencia en precisión fp32 requiere aproximadamente 850 MB de VRAM solo para los pesos, más el overhead de activaciones y el procesamiento de dos imágenes 256x256. En la práctica, una GPU con 4-6 GB de VRAM debería ser suficiente.
- GPU recomendadas: cualquier GPU NVIDIA con soporte CUDA, desde una RTX 2060 (6 GB) hasta una RTX 4090 o A100 para mayor velocidad. El modelo no requiere GPUs de datacenter.
- Compatibilidad con consumer GPU: sí, cabe en GPUs de consumo medio como RTX 3060, RTX 3070 o superiores.
- Opciones de despliegue: el modelo se ejecuta mediante LeRobot, que proporciona comandos CLI (`lerobot-rollout`) y soporta integración con robots reales (Panda) y simuladores. No es compatible directamente con vLLM, llama.cpp u Ollama, ya que no es un modelo de lenguaje.
- Latencia y throughput: no se han publicado mediciones. Dado el tamaño moderado y la arquitectura ligera de Patch Policy, se espera una inferencia en tiempo real (10 FPS) en GPUs modernas, pero no hay datos confirmados.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tareas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| patch_policy_libero10_tipsv2_lang (este) | 211,7 M | No aplica | 10 tareas LIBERO | Apache 2.0 | Hugging Face |
| patch_policy_libero_object_tipsv2_smoke (mismo autor) | No disponible | No aplica | Tareas de objetos LIBERO | Apache 2.0 | Hugging Face |
| Otras políticas LeRobot (ACT, Diffusion Policy) | Variable (80-300 M) | No aplica | Depende del dataset | Apache 2.0 | Hugging Face |

No se dispone de datos de rendimiento comparativo entre estos modelos. La comparativa se limita a aspectos estructurales y de disponibilidad.

## Limitaciones y advertencias

- Sin resultados de evaluación: no hay datos de tasa de éxito en tareas reales, por lo que no se puede validar su eficacia práctica.
- Entrenamiento limitado a 10 tareas específicas de LIBERO: la generalización a otras tareas o entornos no está garantizada.
- Dependencia de la configuración de cámaras: el modelo espera exactamente dos cámaras con nombres `image` y `wrist_image`; cualquier cambio en la disposición física o en la calibración puede degradar el rendimiento.
- Riesgo de sobreajuste al dataset: con solo 379 episodios y 10.000 pasos de entrenamiento, es posible que la política memorice las demostraciones en lugar de aprender comportamientos generalizables.
- Sin soporte de lenguaje: a pesar del sufijo "lang" en el nombre, el modelo no procesa instrucciones de texto; las tareas están fijadas en el dataset.
- Licencia Apache 2.0: permite uso comercial, pero el modelo se distribuye sin garantías y sin resultados de validación.
- Requiere el ecosistema LeRobot: para ejecutarlo es necesario instalar LeRobot y tener un robot Panda o un simulador compatible, lo que limita su uso fuera de este framework.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/aDaikiKamata/patch_policy_libero10_tipsv2_lang
- Perfil del autor: https://huggingface.co/aDaikiKamata
- LeRobot (framework): https://github.com/huggingface/lerobot
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Dataset LIBERO: https://huggingface.co/datasets/lerobot/libero_10_image
- Página oficial de Patch Policy: https://patch-policy.github.io/
- Repositorio de TIPS/TIPSv2 (Google DeepMind): https://github.com/google-deepmind/tips
- Benchmark LIBERO: https://github.com/Lifelong-Robot-Learning/LIBERO
