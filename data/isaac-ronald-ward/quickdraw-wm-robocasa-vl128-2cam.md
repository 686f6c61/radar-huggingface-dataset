# isaac-ronald-ward/quickdraw-wm-robocasa-vl128-2cam

## Resumen

El modelo `quickdraw-wm-robocasa-vl128-2cam` es un modelo de mundo latente orientado a robótica, desarrollado por Isaac Ronald Ward dentro del ecosistema de la librería `quickdraw`. Está diseñado para predecir el futuro visual y propioceptivo de un robot a partir de una breve secuencia de observaciones y una serie de acciones, operando en modo open-loop: una vez que recibe el contexto inicial, genera las imágenes y estados siguientes sin realimentación del entorno.

Se trata de una arquitectura `mm_flow` entrenada con la receta `vl128` sobre el entorno simulado `robocasa_scene4_4h_3cam`. El modelo procesa 8 pasos de contexto, compuestos por un vector propioceptivo y frames de dos cámaras (`cam_scene` y `cam_wrist`), y es capaz de proyectar hasta 128 pasos hacia adelante. Cada cabeza de imagen produce 32 tokens latentes por frame a una resolución de 96x96 píxeles. El repositorio completo pesa aproximadamente 0.3 GB, lo que sugiere un modelo relativamente ligero, aunque no se publican los parámetros totales.

La relevancia de este modelo reside en su aplicación dentro de la investigación en modelos de mundo para robótica, donde la capacidad de anticipar consecuencias de acciones sin ejecutarlas es clave para la planificación, el entrenamiento de políticas y la simulación de escenarios. Además, al estar publicado con licencia MIT y acompañado de métricas, artefactos de evaluación y ejemplos de uso, constituye una referencia reproducible para comparar arquitecturas de predicción de vídeo en entornos domésticos simulados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo de mundo latente basado en flujo (`mm_flow` de quickdraw), con cabezas de imagen separadas para `cam_scene` y `cam_wrist` |
| Parametros totales | No disponible |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | Ventana de contexto de 8 pasos (observaciones y acciones) y horizonte de predicción open-loop de hasta 128 pasos |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible (no es un modelo de lenguaje) |
| Licencia | MIT |
| Formato de pesos | `weights.safetensors`; además incluye `training_state.ckpt` (checkpoint de Lightning), `config.resolved.yaml`, `normalization_stats.json` y `example_context.npz` |

## Arquitectura y entrenamiento

El modelo pertenece a la familia de modelos de mundo latentes: los frames de cámara se comprimen en un espacio latente mediante codificadores de imagen, y un modelo de flujo (`mm_flow`) predice la dinámica de este espacio a partir de las acciones y del estado propioceptivo. El entrenamiento se realizó con la librería `quickdraw`, utilizando la receta `vl128` y el dataset `robocasa_scene4_4h_3cam`. No se menciona el uso de técnicas como RLHF o DPO, ya que no es un modelo de lenguaje.

El checkpoint publicado corresponde a la época 29 del entrenamiento. Los artefactos del run incluyen vídeos de rollout en open-loop, filmstrips comparativos entre predicción y ground truth, y gráficas de error frente al horizonte. La model card también reporta el "autoencoder floor": el nivel de error de reconstrucción del autoencoder, que actúa como límite inferior del error de predicción si la dinámica fuera perfecta. El entrenamiento se llevó a cabo con PyTorch `2.10.0+cu128` y `quickdraw 0.1.0` en el commit `e990f47`.

## Capacidades

- Predicción de frames de vídeo en open-loop para dos cámaras simultáneas (`cam_scene` y `cam_wrist`) a 96x96 píxeles, con una extensión de hasta 128 pasos sin re-grounding.
- Predicción del estado propioceptivo del robot (vector de 16 dimensiones en unidades físicas) a lo largo del horizonte, útil para anticipar posiciones, velocidades u otras variables.
- Generación de rollouts completos a partir de contextos reales almacenados en `example_context.npz`, lo que permite reproducir evaluaciones sin necesidad de acceso al entorno.
- Capacidad de "imaginación" de trayectorias: dada una secuencia de acciones, el modelo predice las imágenes y estados siguientes sin recibir más observaciones.
- Uso del `decode_chunk` para controlar el consumo de memoria durante la decodificación de imágenes, facilitando horizontes largos en GPUs con memoria limitada.
- No soporta tool calling, function calling, razonamiento por lenguaje natural ni tareas de chat; es un modelo puramente predictivo de vídeo/estado.

## Casos de uso

- Planificación de trayectorias en robótica: dado un contexto inicial de 8 pasos, el modelo puede evaluar múltiples secuencias de acciones y predecir sus consecuencias visuales, permitiendo seleccionar la mejor opción antes de ejecutarla en el robot real.
- Entrenamiento de políticas con modelo de mundo: los rollouts sintéticos generados por el modelo sirven como entorno simulado para entrenar políticas de control, reduciendo la necesidad de interactuar con el mundo físico durante el aprendizaje.
- Simulación visual para teleoperación: un operador puede visualizar cómo se verán la escena y la vista de la muñeca antes de ejecutar un comando, lo que facilita la toma de decisiones en entornos remotos o peligrosos.
- Benchmark de predicción a largo plazo: las gráficas de error frente al horizonte y los filmstrips permiten evaluar la degradación de la calidad de predicción en secuencias largas, un aspecto crítico para modelos de mundo.
- Generación de datos sintéticos: el modelo puede producir pares imagen-acción sintéticos en un entorno doméstico simulado (RoboCasa), ampliando conjuntos de datos para tareas de visión o control.
- Investigación en modelos de mundo latentes: sirve como referencia para comparar arquitecturas (`mm_flow`) y recetas (`vl128`) en tareas de predicción de vídeo para robótica, ya que ofrece métricas y artefactos reproducibles.
- Compresión de secuencias de vídeo en representaciones latentes: las cabezas de imagen generan 32 tokens latentes por frame, que pueden utilizarse como representaciones compactas para tareas aguas abajo como detección o clasificación de acciones.

## Benchmarks y rendimiento

Las métricas publicadas corresponden al checkpoint de la época 29, no a los mejores valores por métrica individual. Se indican los errores de predicción open-loop para los pasos +64 y +128, así como los límites del autoencoder (perfect-dynamics bound).

| Metrica | Valor |
|---|---|
| `cam_scene` open-loop LPIPS @+128 (headline) | 0.11611 (menor es mejor) |
| `cam_scene` open-loop LPIPS @+64 | 0.17022 |
| `cam_scene` open-loop PSNR @+128 (dB) | 14.27876 (mayor es mejor) |
| `cam_scene` autoencoder floor LPIPS | 0.07962 |
| `cam_scene` autoencoder floor PSNR (dB) | 19.85904 |
| `cam_wrist` open-loop LPIPS @+128 (headline) | 0.27509 |
| `cam_wrist` open-loop LPIPS @+64 | 0.19619 |
| `cam_wrist` open-loop PSNR @+128 (dB) | 13.56306 |
| `cam_wrist` autoencoder floor LPIPS | 0.04785 |
| `cam_wrist` autoencoder floor PSNR (dB) | 31.14683 |

No se han publicado resultados de benchmarks comparativos con otros modelos en la información disponible. El archivo `metrics.json` contiene todas las métricas registradas durante el entrenamiento, junto con su índice de evaluación.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada. La model card indica que el descodificador de imágenes consume aproximadamente el 78% de la memoria por muestra y recomienda usar `decode_chunk=16` para evitar desbordamientos de memoria en horizontes largos.
- GPU recomendadas: no se proporcionan modelos específicos. El modelo se entrenó con PyTorch `2.10.0+cu128`, por lo que se requiere una GPU NVIDIA compatible con CUDA 12.8 o posterior.
- Cabe en GPUs de consumo: probablemente sí, dado el tamaño del repositorio (0.3 GB) y la resolución reducida de las imágenes (96x96), aunque no hay datos oficiales de consumo de VRAM.
- Opciones de despliegue: mediante la librería `quickdraw` sobre PyTorch, usando `load_pretrained` para cargar el modelo desde HuggingFace. No se mencionan integraciones con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

La única referencia directa encontrada es la variante `quickdraw-wm-robocasa-vl128`, publicada en HuggingFace por el mismo autor y aparentemente entrenada con la misma receta pero con una sola cámara. No se dispone de sus especificaciones detalladas ni de sus métricas en la información proporcionada.

| Modelo | Arquitectura | Contexto | Metricas conocidas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| quickdraw-wm-robocasa-vl128-2cam | Modelo de mundo latente (`mm_flow`) | 8 pasos + horizonte 128 | LPIPS y PSNR publicados | MIT | HuggingFace |
| quickdraw-wm-robocasa-vl128 | Modelo de mundo latente (`mm_flow`) | No disponible | No disponibles | No disponible | HuggingFace |

## Limitaciones y advertencias

- Sesgos: no disponibles. Al estar entrenado en un entorno simulado concreto (RoboCasa scene4), el modelo puede no generalizar bien a otros escenarios, objetos o dinámicas fuera de la distribución de entrenamiento.
- Riesgo de alucinación: al ejecutarse en open-loop, la calidad de las predicciones se degrada con el horizonte. Para `cam_wrist`, el LPIPS aumenta de 0.19619 en el paso +64 a 0.27509 en el paso +128, lo que refleja acumulación de error. En `cam_scene`, el valor de LPIPS en +128 (0.11611) es menor que en +64 (0.17022), una tendencia inusual que no se explica en la documentación.
- Limitaciones de contexto e idioma: el modelo solo acepta ventanas de 8 pasos de contexto y no procesa lenguaje natural. No es un modelo generalista ni un LLM.
- Restricciones de licencia: la licencia MIT permite uso comercial, pero es necesario verificar las licencias de los datasets y dependencias (RoboCasa, quickdraw, PyTorch) antes de usar el modelo en producción.
- Caveats para producción: los vectores deben normalizarse con `norm_obs` y `denorm_obs`, mientras que las imágenes deben permanecer sin normalizar. Además, el argumento de acciones debe contener `P + H - 1` pasos, no `H`. Es obligatorio pasar `decode_chunk` para evitar OOM en horizontes largos.
- Al cargar el modelo, es normal que aparezcan claves faltantes relacionadas con la red LPIPS congelada (`visual._net`), ya que esta no se incluye en los pesos publicados y se reconstruye bajo demanda. No afecta a la inferencia.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/isaac-ronald-ward/quickdraw-wm-robocasa-vl128-2cam
- Variante de una sola cámara: https://huggingface.co/isaac-ronald-ward/quickdraw-wm-robocasa-vl128
- Repositorio del autor: https://github.com/isaac-ward
- Documentación de modelos preentrenados de quickdraw: https://github.com/isaac-ward/quickdraw/blob/main/docs/using_pretrained_models.md
