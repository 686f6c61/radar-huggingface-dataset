# k1000dai/act-openarm-2-cell-pick_up_cube_mujoco

## Resumen

El modelo `k1000dai/act-openarm-2-cell-pick_up_cube_mujoco` es una política robótica basada en Action Chunking with Transformers (ACT), entrenada con la librería LeRobot de Hugging Face sobre un conjunto de datos de demostración de un brazo robótico bimanual OpenArm realizando la tarea de recoger un cubo en el simulador MuJoCo. Lo desarrolla el usuario k1000dai, aprovechando la arquitectura ACT propuesta en el artículo "Learning Fine-Grained Bimanual Manipulation with Low-Cost Hardware" (arXiv:2304.13705).

El modelo resuelve el problema del control de bajo nivel de un robot manipulador a partir de observaciones visuales y de estado, generando secuencias de acciones (chunks) de 100 pasos. Es relevante porque demuestra la viabilidad de entrenar políticas de manipulación bimanual en simulación con un coste computacional moderado (51,7 millones de parámetros) y desplegarlas en el ecosistema LeRobot, que facilita la reproducción y el fine-tuning. La arquitectura combina un backbone visual ResNet-18 con un transformer encoder-decoder y un módulo VAE, todo ello integrado en un pipeline de robótica.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers): ResNet-18 (vision) + Transformer encoder-decoder + VAE |
| Parametros totales | 51.689.104 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (no es un modelo de lenguaje; procesa observaciones de estado e imágenes) |
| Tipos de cuantizacion | no disponible (pesos en safetensors, sin cuantización publicada) |
| Idiomas soportados | no disponible (modelo de robótica, no lingüístico) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura sigue el diseño de ACT: un backbone visual ResNet-18 preentrenado en ImageNet procesa cuatro vistas de cámara (techo, cabeza izquierda, cabeza derecha y muñecas izquierda y derecha), junto con un vector de estado de 16 dimensiones que codifica la configuración articular del robot bimanual. El transformer tiene `dim_model` de 512, 8 cabezas de atención, 4 capas de encoder y 1 capa de decoder. Se utiliza un módulo VAE con dimensión latente de 32 y peso KL de 10.0, lo que permite modelar la variabilidad de las demostraciones humanas.

El entrenamiento se realizó sobre el dataset `k1000dai/openarm-2-cell-pick_up_cube_mujoco-lerobot` durante 10.000 pasos con un batch de 8, optimizador AdamW (learning rate 1e-5, weight decay 1e-4, grad clip 10.0). Se aplicó normalización mean/std a las características visuales, de estado y de acción. El chunk de acciones generado es de 100 pasos, lo que permite una ejecución suave y robusta en tareas de manipulación. No se menciona el uso de RLHF ni DPO; el entrenamiento es de imitación supervisada sobre demostraciones.

## Capacidades

- Generación de secuencias de acciones articulares (16 dimensiones) para control de robot bimanual.
- Procesamiento de múltiples entradas visuales simultáneas (4 cámaras) con fusión en el transformer.
- Ejecución de tareas de manipulación de objetos (recoger un cubo) en simulación MuJoCo.
- Soporte de predicción de acciones a futuro (action chunking) para reducir la frecuencia de re-planificación.
- Integración nativa con LeRobot para carga, evaluación y fine-tuning.
- Capacidad de inferencia en tiempo real en GPU (diseñado para control robótico de bajo nivel).

## Casos de uso

- Control de robots bimanuales en simulación: el modelo puede integrarse en entornos MuJoCo para ejecutar tareas de pick-and-place con dos brazos, gracias a su capacidad de procesar simultáneamente las cámaras de las muñecas y del entorno.
- Aprendizaje por imitación para manipulación: sirve como punto de partida para fine-tuning con nuevas demostraciones de tareas similares, usando el pipeline de LeRobot.
- Investigación en robótica de bajo coste: al estar basado en ACT, permite reproducir experimentos de manipulación fina con hardware asequible, como el brazo OpenArm.
- Desarrollo de sistemas de control reactivo: su chunk de 100 pasos reduce la latencia de planificación, adecuado para entornos dinámicos.
- Benchmarking de políticas de manipulación: puede usarse como referencia para comparar arquitecturas de control (Diffusion Policy, etc.) en la misma tarea.
- Evaluación de robustez visual: al recibir imágenes de alta resolución (hasta 720x1280), permite probar la tolerancia a cambios de iluminación o punto de vista en simulación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No hay datos de tasas de éxito, precisión de agarre ni comparaciones con otras políticas en la model card ni en la búsqueda web.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la documentación; dado el tamaño (51,7 M parámetros) y el uso de ResNet-18 con imágenes de hasta 720x1280, se estima que requiere al menos 4-6 GB de VRAM para un batch de 1, aunque no hay confirmación oficial.
- GPU recomendadas: cualquier GPU con soporte CUDA y al menos 8 GB de VRAM (p.ej., RTX 3060, RTX 4070, A100). Para entrenamiento se recomienda una GPU con más memoria (16 GB o superior).
- Puede ejecutarse en GPU de consumo (RTX 30/40 series) para inferencia; en CPU o MPS el rendimiento es muy bajo, como advierte la documentación de OpenArm.
- Opciones de despliegue: LeRobot (Python), con soporte para carga directa del modelo mediante `ACTPolicy.from_pretrained`. No se menciona compatibilidad con vLLM, llama.cpp u Ollama (modelo no lingüístico).
- Latencia y throughput: no disponibles; se espera que la inferencia sea de decenas de milisegundos en GPU moderna, pero no hay datos publicados.

## Comparativa con modelos similares

| Modelo | Arquitectura | Parámetros | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| k1000dai/act-openarm-2-cell-pick_up_cube_mujoco | ACT (ResNet-18 + Transformer + VAE) | 51,7 M | Recoger cubo bimanual (MuJoCo) | Apache-2.0 | Hugging Face |
| enactic/act-openarm-2-cell-pick_up_cube_mujoco | ACT (misma arquitectura) | no disponible | Misma tarea (entrenado 40k pasos) | no disponible | Hugging Face |
| Diffusion Policy (referencia) | Diffusion sobre acciones | variable | Manipulación general | MIT (típico) | GitHub |

No hay datos suficientes para comparar rendimiento numérico. La diferencia principal con `enactic/act-openarm-2-cell-pick_up_cube_mujoco` es que este último se entrenó durante 40.000 pasos, mientras que el modelo de k1000dai usó 10.000, lo que probablemente afecte a la calidad de la política, aunque no se proporcionan métricas.

## Limitaciones y advertencias

- Entrenado exclusivamente en simulación MuJoCo; puede no transferir directamente al mundo real sin fine-tuning o domain adaptation.
- El dataset de demostraciones es específico para la tarea de recoger un cubo; no generaliza a otras tareas sin reentrenamiento.
- No se han publicado métricas de éxito ni estudios de robustez; el rendimiento real es desconocido.
- La dependencia de múltiples cámaras (4 vistas) aumenta los requisitos de ancho de banda y cómputo; en robots reales puede ser difícil replicar la configuración exacta de sensores.
- El modelo no soporta procesamiento de lenguaje ni interacción multimodal más allá de imágenes y estado articular.
- La licencia Apache-2.0 permite uso comercial, pero el dataset asociado puede tener sus propias restricciones (no verificadas en esta ficha).
- No hay información sobre sesgos o alucinaciones, al ser un modelo de control, pero sí existe riesgo de comportamientos erráticos si las observaciones difieren de la distribución de entrenamiento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/k1000dai/act-openarm-2-cell-pick_up_cube_mujoco
- Dataset de entrenamiento: https://huggingface.co/datasets/k1000dai/openarm-2-cell-pick_up_cube_mujoco-lerobot
- Dataset alternativo (enactic): https://huggingface.co/datasets/enactic/openarm-2-cell-pick_up_cube_mujoco-lerobot
- Repositorio de MuJoCo para OpenArm: https://github.com/enactic/openarm_mujoco
- Documentación de OpenArm (inferencia): https://docs.openarm.dev/tutorial/inference/
- Paper de ACT: https://huggingface.co/papers/2304.13705
- LeRobot: https://github.com/huggingface/lerobot
