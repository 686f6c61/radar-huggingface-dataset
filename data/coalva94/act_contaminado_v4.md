# coalva94/act_contaminado_v4

## Resumen

`coalva94/act_contaminado_v4` es una política de imitación para robótica basada en ACT (Action Chunking with Transformers), publicada por el usuario coalva94 en Hugging Face. No es un modelo de lenguaje: es un controlador visomotor entrenado para manipular objetos con un robot SO-101 de bajo coste, en concreto para tareas de triaje de residuos contaminados (cubos rojos que deben depositarse en un contenedor de desechos y un vaso designado). El modelo consume el estado articular de 6 dimensiones y dos cámaras de 480x640 y produce comandos de acción de 6 dimensiones.

Se trata de un fine-tuning del modelo `coalva94/act_contaminado_v3`, entrenado durante 15.000 pasos con batch de 32 y learning rate de 1,5e-5 sobre el dataset `coalva94/bilbao_triage_contaminado_v4` (159 episodios, 81.672 fotogramas a 30 FPS). El modelo tiene 51.668.614 parámetros y un tamaño de repositorio de 0,2 GB, lo que lo hace desplegable en hardware modesto.

Su relevancia es acotada pero clara: forma parte de un proyecto de hackathon (Physical AI Bilbao) que demuestra un flujo completo de aprendizaje por imitación con LeRobot, incluyendo un par de políticas "sano/contaminado" para evitar contaminación cruzada entre zonas de trabajo. Es un artefacto de investigación y demostración, no un modelo de propósito general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers), política de imitación visomotora |
| Parametros totales | 51.668.614 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no aplica; ventana de observación por paso, sin contexto textual) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no procesa lenguaje natural; las tareas se identifican por cadenas de texto fijas) |
| Licencia | no disponible (la model card indica "More Information Needed") |
| Formato de pesos | safetensors (librería LeRobot) |
| Entradas | `observation.state` (6,), `observation.images.camera_top` (3, 480, 640), `observation.images.camera_robot` (3, 480, 640) |
| Salidas | `action` (6,) |
| Robot objetivo | `so_follower` (SO-101) |
| Camaras | `camera_top`, `camera_robot` |
| Frecuencia de datos | 30 FPS |
| Version de LeRobot | 0.7.1 |

## Arquitectura y entrenamiento

ACT es un método de aprendizaje por imitación que predice trozos de acción (action chunks) en lugar de pasos individuales, lo que reduce el error de acumulación y suaviza el control. La arquitectura combina un codificador visual (procesa las dos cámaras), un codificador del estado articular y un transformer que genera la secuencia de acciones. El modelo parte de `coalva94/act_contaminado_v3` y se afina sobre el dataset recortado y optimizado `coalva94/bilbao_triage_contaminado_v4`.

El entrenamiento se realizó en una NVIDIA A100-large durante 15.000 pasos, con batch de 32, optimizador AdamW, learning rate de 1,5e-5 y semilla 1000. El dataset contiene 159 episodios y 81.672 fotogramas a 30 FPS, con un peso de 3x aplicado a los episodios b19, b20 y b21 (casos de cubos desplazados a izquierda y derecha). Se aplicó aumento de datos con RandomAffine de ±7 grados de rotación y ±8 por ciento de escala. La pérdida final reportada es de 0,074 (L1 de 0,073). No se documenta uso de RLHF ni DPO, algo esperable en una política de imitación supervisada.

## Capacidades

- Control visomotor de un robot SO-101 para tareas de recogida y depósito de cubos rojos.
- Percepción dual-cámara: una vista cenital (`camera_top`) y una vista desde el robot (`camera_robot`).
- Ejecución de tareas identificadas por nombre, entre ellas `b8_rojo_bordes_dificiles`, `b6_rojo_1R_en_A_2V_Bsup_1R_Binf`, `b17_rojo_agarre_lento_centrado`, `b18_rojo_desechos_con_cubo_dentro`, `b19_rojo_solo_der_desplazado`, `b20_rojo_2R_en_A_con_2V_almacen` y `b21_rojo_solo_izq_desplazado`.
- Generalización limitada a variaciones de posición de los cubos dentro del dominio de entrenamiento (izquierda, derecha, desplazados, bordes difíciles).
- No soporta tool calling, function calling, razonamiento multi-paso simbólico ni capacidades multilingües: es una política motora, no un modelo generativo de texto.
- No dispone de modo "thinking", visión general, audio ni otras capacidades de modelos fundacionales.

## Casos de uso

- Triaje automatizado de residuos contaminados en un banco de trabajo: el modelo recoge cubos rojos y los deposita en el contenedor de desechos o en el vaso D, siguiendo la política entrenada para la zona "contaminado".
- Demostración de flujo completo de aprendizaje por imitación: sirve como referencia reproducible para grabar teleoperación con LeRobot, entrenar ACT y desplegar la política en un SO-101.
- Investigación en prevención de contaminación cruzada: junto con `coalva94/act_sano_v4`, permite estudiar la separación de políticas por zona y evitar que un mismo controlador mezcle objetos de áreas limpias y sucias.
- Prototipado rápido en robótica de bajo coste: con 51,7 millones de parámetros y 0,2 GB, se puede iterar en una estación con GPU de consumo sin infraestructura pesada.
- Docencia y talleres de robótica: el par de políticas y los datasets asociados permiten explicar conceptos de imitación, aumento de datos y evaluación de éxito en manipulación.
- Integración con supervisión externa: el proyecto incluye un supervisor OpenCV y un panel web dual-view, de modo que la política puede ejecutarse bajo monitorización y auditoría en tiempo real.
- Evaluación comparativa de variantes: al existir v3 y v4 sobre el mismo robot, se puede medir el efecto del recorte de dataset, el reequilibrado de episodios y el aumento afín sobre la tasa de éxito.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card solo reporta la pérdida de entrenamiento final (loss 0,074, l1_loss 0,073) y no incluye tasas de éxito ni comparaciones con otras políticas.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; por el tamaño (51,7 millones de parámetros, 0,2 GB de pesos), la inferencia cabe holgadamente en cualquier GPU con 4 GB o más.
- GPU recomendadas: cualquier GPU moderna sirve para inferencia; el entrenamiento se realizó en una NVIDIA A100-large.
- Cabe en GPU de consumo: sí, en tarjetas como RTX 3060, RTX 4060, RTX 4090 o similares; el cuello de botella real es el bucle de control del robot y las cámaras a 30 FPS, no el modelo.
- Opciones de despliegue: LeRobot 0.7.1 mediante `lerobot-rollout` con `--policy.path=coalva94/act_contaminado_v4`; el resto de stacks (vLLM, llama.cpp, Ollama, TGI) no aplican a este tipo de política.
- Latencia y throughput: no disponibles; vienen determinados por el hardware del robot, la captura de las dos cámaras y el ciclo de control, no por el modelo en sí.

## Comparativa con modelos similares

| Modelo | Parametros | Entradas | Robot | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `coalva94/act_contaminado_v4` | 51.668.614 | Estado (6,) + 2 camaras 480x640 | SO-101 (`so_follower`) | no disponible | Hugging Face |
| `coalva94/act_contaminado_v3` | no disponible | no disponible | SO-101 (modelo base de v4) | no disponible | Hugging Face |
| `coalva94/act_sano_v4` | no disponible | no disponible | SO-101 (politica de zona limpia) | no disponible | Hugging Face |

No se dispone de datos de rendimiento comparativo entre estas variantes en la informacion proporcionada.

## Limitaciones y advertencias

- Es una política de imitación específica de una tarea y un robot; no generaliza a otros manipuladores, otras cámaras ni otros objetos fuera del dominio de entrenamiento.
- El dataset se limita a cubos rojos y posiciones concretas (izquierda, derecha, desplazados, bordes); cambios de iluminación, fondo o geometría pueden degradar el comportamiento.
- Riesgo de fallo silencioso: al no haber benchmarks publicados, no se conoce la tasa de éxito real ni la robustez ante perturbaciones.
- Licencia no especificada ("More Information Needed"), lo que impide confirmar el uso comercial; debe tratarse como no apta para producción hasta aclararlo con el autor.
- No procesa lenguaje natural ni admite instrucciones libres; las tareas se seleccionan por cadenas de texto predefinidas que deben coincidir con las del entrenamiento.
- Requiere calibración del robot y de las cámaras, y que los nombres de cámara coincidan con las claves de observación (`camera_top`, `camera_robot`).
- Sesgos conocidos: no documentados; en robótica de imitación es habitual que la política herede los sesgos de posicionamiento y velocidad del operador que teleoperó los datos.
- El modelo está pensado para demostración e investigación; cualquier uso con personas o en entornos no controlados requiere supervisión y paradas de seguridad externas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/coalva94/act_contaminado_v4
- Modelo base: https://huggingface.co/coalva94/act_contaminado_v3
- Política de zona limpia: https://huggingface.co/coalva94/act_sano_v4
- Dataset de entrenamiento: https://huggingface.co/datasets/coalva94/bilbao_triage_contaminado_v4
- Dataset sano v3: https://huggingface.co/datasets/coalva94/bilbao_triage_sano_v3
- Dataset completo v3: https://huggingface.co/datasets/coalva94/bilbao_triage_complete_v3
- Código del robot, auditoría y supervisor OpenCV: https://github.com/IdhamSdmc/physicalai-hack-lab
- Panel web dual-view: https://github.com/coalva94/web-io-robot
- Paper de ACT: https://huggingface.co/papers/2304.13705 (arXiv 2304.13705)
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Guía de ACT en LeRobot: https://huggingface.co/docs/lerobot/main/en/act
- Visualizador de datasets de LeRobot: https://huggingface.co/spaces/lerobot/visualize_dataset?path=coalva94/bilbao_triage_contaminado_v4
