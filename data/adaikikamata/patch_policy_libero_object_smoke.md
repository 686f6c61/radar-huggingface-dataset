# aDaikiKamata/patch_policy_libero_object_smoke

## Resumen

El modelo `aDaikiKamata/patch_policy_libero_object_smoke` es una política de aprendizaje por imitación para manipulación robótica, desarrollada por el usuario de Hugging Face aDaikiKamata (Kamata Daiki). Está entrenada con el framework LeRobot y utiliza la arquitectura Patch Policy, un método ligero y rápido que procesa imágenes y estado del robot para generar acciones de control. El modelo se ha entrenado específicamente sobre el dataset LIBERO Object, que contiene tareas de recoger y colocar objetos en una cesta con un brazo robótico Panda.

Con 37,2 millones de parámetros, es un modelo compacto diseñado para inferencia en tiempo real en sistemas robóticos. La licencia Apache 2.0 permite uso comercial sin restricciones. Aunque no se han publicado resultados de evaluación, la arquitectura Patch Policy ha demostrado una mejora relativa del 40% frente a políticas con representaciones global-pooled en entornos simulados y reales, según la página oficial del método.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Patch Policy (basada en patches, sin detalles adicionales publicados) |
| Parametros totales | 37.177.735 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (modelo de robótica, no texto) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible (no es un modelo de lenguaje) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura Patch Policy es un método de aprendizaje por imitación que opera sobre parches de las imágenes de entrada, en lugar de usar representaciones globales. Según el sitio oficial, esta aproximación es ligera, rápida y mejora un 40% relativo sobre políticas con representaciones global-pooled en cuatro suites de entornos simulados y tres del mundo real. El modelo concreto aquí presentado consume dos imágenes RGB de 256x256 píxeles (cámara principal y cámara de muñeca) y un vector de estado de 8 dimensiones, y produce una acción de 7 dimensiones (probablemente posición y orientación del efector final).

El entrenamiento se realizó con LeRobot versión 0.6.2 sobre el dataset `lerobot/libero_object_image`, que contiene 454 episodios y 66.984 fotogramas a 10 FPS. Las tareas consisten en recoger distintos objetos (zumo de naranja, kétchup, queso crema, salsa barbacoa, sopa de letras, leche, aliño, mantequilla, salsa de tomate y pudin de chocolate) y colocarlos en una cesta. La configuración de entrenamiento fue de 100 pasos, tamaño de lote 256, optimizador AdamW con tasa de aprendizaje 0,0001 y semilla 1000. No se menciona el uso de RLHF, DPO ni otras técnicas de refinamiento.

## Capacidades

- Manipulación robótica de pick-and-place: recoger objetos y colocarlos en una ubicación determinada.
- Entrada multimodal: dos imágenes RGB (cámara fija y cámara de muñeca) y estado del robot (8 dimensiones).
- Salida de acciones de 7 dimensiones para control del efector final.
- Inferencia en tiempo real gracias a su tamaño reducido y arquitectura basada en patches.
- Integración nativa con el ecosistema LeRobot para entrenamiento, evaluación y despliegue.
- No tiene capacidades de lenguaje, razonamiento general, visión fuera del contexto robótico ni tool calling.

## Casos de uso

- Automatización de líneas de montaje: el modelo puede controlar un brazo robótico para recoger piezas de una cinta y colocarlas en contenedores, gracias a su capacidad de procesar imágenes en tiempo real y generar acciones precisas.
- Investigación en aprendizaje por imitación: sirve como punto de partida para estudiar la transferencia de políticas entre tareas o para comparar arquitecturas de representación basadas en patches frente a global-pooled.
- Prototipado rápido en robótica: al estar entrenado con LeRobot y ser ligero, permite desplegar una política funcional en un robot Panda en pocos minutos usando el comando `lerobot-rollout`.
- Educación y formación en robótica: es un ejemplo práctico de cómo entrenar y evaluar una política de manipulación con un dataset público, útil para cursos de robótica o aprendizaje automático.
- Benchmarking de métodos de imitación: al usar el dataset LIBERO Object, puede servir como baseline para comparar nuevas arquitecturas en tareas de manipulación con distractores.
- Desarrollo de sistemas de recogida y colocación en almacenes: aunque el entrenamiento es en simulación, la política puede adaptarse a entornos reales con fine-tuning, dado su tamaño compacto y bajo coste de inferencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente que no hay resultados de evaluación. La página de Patch Policy menciona una mejora relativa del 40% sobre políticas con representaciones global-pooled, pero no se ofrecen cifras concretas para este modelo específico.

## Requisitos de hardware

- Al ser un modelo de solo 37,2 millones de parámetros, la VRAM necesaria para inferencia es reducida (estimación inferior a 1 GB en FP32, menos aún en cuantización).
- Es compatible con GPUs de consumo como RTX 3060, RTX 4060 o superiores, e incluso con GPUs integradas en plataformas robóticas como Jetson.
- El despliegue se realiza mediante LeRobot, que soporta inferencia en PyTorch con CUDA.
- Para entrenamiento, una GPU con al menos 8 GB de VRAM es suficiente dado el tamaño del modelo y el batch size de 256 (aunque el batch puede reducirse si la memoria es limitada).
- No se dispone de datos de latencia o throughput específicos, pero por su tamaño es adecuado para control en tiempo real a 10 FPS o más.

## Comparativa con modelos similares

No se dispone de comparativas directas con otros modelos en la información proporcionada. Sin embargo, se pueden mencionar alternativas en el ámbito de políticas de manipulación robótica:

| Modelo | Parametros | Contexto | Rendimiento | Licencia |
|---|---|---|---|---|
| patch_policy (este modelo) | 37,2 M | No aplica | Sin datos publicados | Apache 2.0 |
| ACT (Action Chunking with Transformers) | ~80 M (típico) | No aplica | Depende del dataset | MIT |
| Diffusion Policy | ~100 M (típico) | No aplica | Depende del dataset | MIT |

La comparación no es exhaustiva y se basa en conocimiento general; no hay datos de benchmarks comparativos en la información disponible.

## Limitaciones y advertencias

- El modelo se ha entrenado únicamente sobre el dataset LIBERO Object, que contiene tareas de pick-and-place con objetos específicos. No generaliza a otras tareas o entornos sin fine-tuning.
- No hay resultados de evaluación en robot real ni en simulación publicados por el autor, por lo que su rendimiento real es desconocido.
- La arquitectura Patch Policy es relativamente nueva; no hay estudios independientes que validen su robustez frente a variaciones de iluminación, oclusiones o cambios de escena.
- El entrenamiento se realizó con solo 100 pasos, lo que podría indicar un ajuste insuficiente (aunque el batch size grande compensa parcialmente).
- No se especifican los idiomas ni hay capacidades lingüísticas; es un modelo puramente sensoriomotor.
- La licencia Apache 2.0 permite uso comercial, pero el usuario debe verificar que el dataset de entrenamiento (LIBERO) tenga una licencia compatible para sus fines.

## Enlaces

- Repositorio del modelo: https://huggingface.co/aDaikiKamata/patch_policy_libero_object_smoke
- Página oficial de Patch Policy: https://patch-policy.github.io/
- Benchmark LIBERO: https://libero-project.github.io/main.html
- Dataset de entrenamiento: https://huggingface.co/datasets/lerobot/libero_object_image
- LeRobot (framework): https://github.com/huggingface/lerobot
