# charlott-rgb/so101_acrylic_vla_jepa_b8_10000

## Resumen

VLA-JEPA es una política robótica de tipo Vision-Language-Action (VLA) publicada por el usuario charlott-rgb en Hugging Face bajo el identificador `charlott-rgb/so101_acrylic_vla_jepa_b8_10000`. El modelo combina tres componentes: un backbone de lenguaje e imagen Qwen3-VL, un modelo de mundo de vídeo auto-supervisado basado en V-JEPA2 y una cabeza de acción DiT entrenada con flow matching. El resultado es un modelo de 2.766.134.150 parámetros (unos 2,77 mil millones) que consume observaciones visuales y de estado proprioceptivo y emite comandos de acción continuos de 6 dimensiones.

El problema que resuelve es la ejecución de tareas de manipulación mediante imitación en un robot concreto: el SO-101 en configuración `so_follower`. La política se ha entrenado sobre el dataset `charlott-rgb/so101_acrylic_dense72` (72 episodios, 39.189 fotogramas a 30 FPS) para una única tarea: recoger una pieza de pintura acrílica y colocarla en una caja. Se distribuye con licencia Apache-2.0, en formato safetensors, y es ejecutable con la librería LeRobot 0.6.2 o superior.

La relevancia de esta ficha es acotada: se trata de un checkpoint de investigación con 0 descargas y 0 "likes" en el momento de la consulta, sin resultados de evaluación publicados ni benchmarks. Su interés técnico reside en la combinación VLA + world model, descrita en el paper arXiv 2602.10098, más que en su rendimiento demostrado, del que no hay evidencia publicada.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | VLA híbrida: backbone Qwen3-VL (visión-lenguaje) + modelo de mundo de vídeo V-JEPA2 + cabeza de acción DiT con flow matching |
| Parámetros totales | 2.766.134.150 (dato real de los pesos safetensors) |
| Parámetros activos | no aplica (no es un modelo MoE según la información disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (el repo solo publica safetensors) |
| Idiomas soportados | no disponible (la model card no declara idiomas) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (repo de 6,2 GB) |
| Tipo de robot | `so_follower` (SO-101) |
| Cámaras | `fixed`, `wrist` (features `observation.images.exterior_1_left`, `observation.images.exterior_2_left`) |
| Entradas | 2 imágenes `(3, 224, 224)` + estado `observation.state` `(6,)` |
| Salidas | `action` `(6,)` |
| Versión de LeRobot | 0.6.2 |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La arquitectura es una VLA de tres bloques. El primero es un backbone Qwen3-VL que procesa conjuntamente las dos vistas de cámara (una fija y una en la muñeca, ambas a 224x224 píxeles) y la instrucción en lenguaje natural. El segundo es un modelo de mundo de vídeo auto-supervisado derivado de V-JEPA2, que aporta una representación latente de la dinámica visual y actúa como señal auxiliar de aprendizaje. El tercero es una cabeza de acción basada en un Diffusion Transformer (DiT) entrenada con flow matching, que genera las trayectorias de acción continuas de 6 grados de libertad. El estado proprioceptivo de entrada tiene 6 dimensiones y coincide con la dimensionalidad de la acción de salida.

El entrenamiento se realizó con LeRobot 0.6.2 durante 10.000 pasos, con tamaño de lote 8, optimizador AdamW, tasa de aprendizaje 0,0001 y semilla 1000. El dataset es `charlott-rgb/so101_acrylic_dense72`, compuesto por 72 episodios y 39.189 fotogramas capturados a 30 FPS, correspondientes a una sola tarea ("Pick up the acrylic paint piece and place it in the box"). No se especifica el número de tokens de entrenamiento, la composición completa del dataset, ni si hubo etapas de RLHF o DPO. Tampoco se detalla la configuración exacta del backbone Qwen3-VL utilizado ni el número de parámetros de cada submódulo.

## Capacidades

- Generación de acciones motoras continuas de 6 dimensiones para el robot SO-101 en configuración `so_follower`.
- Percepción visual multi-cámara: procesa simultáneamente una vista fija y una vista de muñeca a 224x224.
- Condicionamiento por lenguaje: la política acepta una instrucción de tarea en texto, facilitada por el backbone Qwen3-VL.
- Fusión de estado proprioceptivo (6 dimensiones) con observación visual para cerrar el bucle de control.
- Ejecución de una tarea de manipulación pick-and-place concreta sobre objetos de pintura acrílica.
- Integración nativa con el ecosistema LeRobot para despliegue (`lerobot-rollout`) y reentrenamiento (`lerobot-train`).
- No hay evidencia publicada de soporte de tool calling, function calling, razonamiento multi-paso deliberado, capacidades multimodales adicionales (audio, vídeo largo) ni multilingüismo declarado.

## Casos de uso

- Automatización de pick-and-place en línea de montaje ligera: el modelo puede recoger piezas de tamaño pequeño y depositarlas en un contenedor, replicando la tarea exacta para la que fue entrenado, siempre que la celda de trabajo reproduzca las condiciones del dataset.
- Banco de pruebas de investigación en VLA: dado que combina Qwen3-VL, V-JEPA2 y una cabeza DiT con flow matching, sirve como punto de partida para estudiar si el modelo de mundo de vídeo mejora la generalización frente a políticas de imitación puras.
- Reentrenamiento con datos propios: mediante `lerobot-train --policy.type=vla_jepa` se puede ajustar la política sobre un dataset propio, lo que permite adaptar el método a otras tareas sin partir de cero.
- Manipulación asistida en laboratorio con objetos frágiles: la combinación de vista fija y vista de muñeca permite al modelo corregir el agarre durante la aproximación, útil para piezas con tolerancias estrechas.
- Docencia y reproducción de experimentos: el pipeline completo (dataset visualizable, pesos en safetensors y comandos de rollout documentados) permite reproducir el entrenamiento y auditar cada etapa.
- Evaluación comparativa de cabezas de acción: la cabeza DiT con flow matching puede compararse con cabezas de regresión o de difusión estándar si se reentrena manteniendo el mismo backbone y dataset.
- Base para destilación o cuantización en robótica embebida: con 2,77 mil millones de parámetros, es un candidato razonable para estudiar reducciones de tamaño orientadas a cómputo en el borde, aunque no se publican versiones cuantizadas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card incluye explícitamente la línea "_No evaluation results have been provided for this policy yet._" y deja vacía la tabla de evaluación en robot real (tarea, número de intentos, éxitos y tasa de éxito). Tampoco se reportan métricas de simulación, tasas de éxito, curvas de pérdida ni comparaciones con otras políticas.

## Requisitos de hardware

- VRAM estimada para inferencia: no publicada por el autor. Como referencia aritmética a partir del número de parámetros (2,77 mil millones), los pesos en precisión completa de 16 bits ocuparían aproximadamente 5,5 GB, por lo que la inferencia necesitaría del orden de 8 a 12 GB de VRAM contando activaciones, codificador visual y buffers de la cabeza de acción. Estas cifras son estimaciones derivadas del recuento de parámetros, no datos confirmados por el autor.
- GPU recomendadas: no especificadas. Por tamaño, cabría en GPUs de gama alta de consumo con 12 GB o más de VRAM (por ejemplo, RTX 3060 12 GB, RTX 4070 Ti, RTX 4080, RTX 4090) y, con holgura, en GPUs de centro de datos como A100, H100 o L40S.
- Cabe en GPU de consumo: probablemente sí en modelos con 12 GB o más de VRAM, siempre que se use precisión de 16 bits; no hay confirmación oficial ni versiones cuantizadas publicadas.
- Opciones de despliegue: LeRobot (`lerobot-rollout` con `--policy.path=charlott-rgb/so101_acrylic_vla_jepa_b8_10000`), que es el método documentado. No se mencionan integraciones con vLLM, llama.cpp, Ollama o TGI, y son poco probables al tratarse de una política robótica con salida de acciones continuas y no de texto.
- Latencia y throughput: no disponibles. El modelo opera sobre observaciones a 30 FPS en el dataset de entrenamiento, pero no se declara la frecuencia de control alcanzable en inferencia.

## Comparativa con modelos similares

No se han encontrado datos de comparación en los resultados de búsqueda proporcionados (las consultas devolvieron únicamente páginas de soporte de Google Play, sin relación con el modelo). La tabla siguiente se apoya en conocimiento público general sobre políticas VLA y debe verificarse antes de usarse como referencia; las celdas marcadas como no disponibles reflejan ausencia de dato confirmado.

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Rendimiento |
|---|---|---|---|---|---|
| VLA-JEPA (este modelo) | 2,77 mil millones | no disponible | Apache-2.0 | Hugging Face, 0 descargas | sin evaluación publicada |
| OpenVLA | 7 mil millones | no disponible | MIT (según información pública) | Hugging Face | benchmarks publicados por sus autores |
| SmolVLA | ~450 millones | no disponible | Apache-2.0 | Hugging Face / LeRobot | benchmarks publicados por sus autores |
| GR00T N1 (NVIDIA) | ~2,2 mil millones | no disponible | Apache-2.0 (según información pública) | Hugging Face | benchmarks publicados por sus autores |

La comparación más directa por tamaño y propósito es con GR00T N1 (~2,2 mil millones, también VLA de manipulación), mientras que OpenVLA y SmolVLA difieren en escala. La diferencia crítica de este checkpoint frente a los tres anteriores es la ausencia total de resultados de evaluación y su especialización en una única tarea y un único robot.

## Limitaciones y advertencias

- No hay resultados de evaluación: la propia model card indica que no se han proporcionado métricas, por lo que se desconoce la tasa de éxito real de la política.
- Especialización extrema: entrenada sobre 72 episodios de una sola tarea ("Pick up the acrylic paint piece and place it in the box") con un único tipo de robot (SO-101 `so_follower`); es esperable un mal rendimiento fuera de esa distribución.
- Riesgo de sobreajuste: 10.000 pasos con lote 8 y un dataset de 39.189 fotogramas es un régimen propenso a memorizar posiciones, iluminación y apariencia de los objetos del dataset original.
- Sensibilidad al entorno: cambios en la posición de los objetos, la iluminación, el fondo o la presencia de distractores pueden degradar el comportamiento, algo que la model card sugiere reportar pero que no se ha documentado.
- Dependencia del hardware concreto: los nombres e índices de cámara deben coincidir con las claves de observación del entrenamiento (`exterior_1_left`, `exterior_2_left`), y la calibración del robot afecta directamente a las acciones emitidas.
- Sin datos de sesgo ni de seguridad: no se documentan sesgos, comportamientos inseguros ni protocolos de parada ante fallos, algo crítico en manipulación física real.
- Idiomas y contexto: no se declaran idiomas soportados ni longitud de contexto, por lo que no puede asumirse generalización multilingüe de las instrucciones.
- Riesgo de alucinación trasladado al dominio motor: en una VLA, los errores no se manifiestan como texto incorrecto sino como trayectorias inválidas o colisiones; debe operarse con límites de par, paradas de emergencia y supervisión humana.
- Licencia: Apache-2.0 permite uso comercial y modificación, pero no exime de responsabilidad sobre el comportamiento del modelo en un robot real; se recomienda citar el paper del método y LeRobot.
- Madurez: 0 descargas y 0 likes, publicado el 15 de septiembre de 2026 y actualizado el mismo día, sin historial de mantenimiento.
- La búsqueda web realizada no devolvió documentación técnica adicional; todas las afirmaciones sobre el método VLA-JEPA proceden de la model card y del enlace al paper indicado por el autor.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/charlott-rgb/so101_acrylic_vla_jepa_b8_10000
- Dataset de entrenamiento: https://huggingface.co/datasets/charlott-rgb/so101_acrylic_dense72
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=charlott-rgb/so101_acrylic_dense72
- Paper del método VLA-JEPA: https://arxiv.org/abs/2602.10098
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Guía de LeRobot para vla_jepa: https://huggingface.co/docs/lerobot/main/en/vla_jepa
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Guía de instalación de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware de LeRobot: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabación de datos y entrenamiento de políticas: https://huggingface.co/docs/lerobot/en/il_robots
- Referencia rápida de comandos (cheat-sheet): https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentación de inferencia y rollout: https://huggingface.co/docs/lerobot/main/en/inference
