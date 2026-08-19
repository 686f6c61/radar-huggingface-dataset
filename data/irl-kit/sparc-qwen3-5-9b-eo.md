# irl-kit/SPARC-Qwen3.5-9B-EO

## Resumen

SPARC-Qwen3.5-9B-EO es un modelo de visión-lenguaje (VLM) desarrollado por el equipo irl-kit, resultado de un ajuste fino completo sobre la base Qwen3.5-9B para tareas de razonamiento espacial encarnado (embodied spatial reasoning). El modelo se entrena con una mezcla de datos VQA generados por el pipeline SPARC (Spatial Annotations from Robot Demonstrations at Scale), complementada con los conjuntos FSD, RoboPoint, LLaVA-OneVision2 y EO-1.5M. Su objetivo es que un agente robótico pueda localizar puntos en una imagen y generar trayectorias en coordenadas, respondiendo a instrucciones en lenguaje natural.

La relevancia de este modelo radica en que combina un backbone multimodal potente (Qwen3.5, con fusión temprana de visión y lenguaje) con datos de anotación espacial de alta calidad producidos de forma escalable a partir de demostraciones robóticas. El resultado es un modelo de 9.400 millones de parámetros (9,4B) que alcanza una puntuación agregada de 0,719 en un conjunto de cinco benchmarks de razonamiento espacial, superando a variantes más pequeñas de la misma familia. Está pensado para integrarse en pipelines de robótica, navegación autónoma y sistemas de interacción humano-robot.

El modelo se distribuye en formato safetensors con pipeline `image-text-to-text` y es compatible con la librería transformers. Aunque la licencia no está declarada, el repositorio incluye una plantilla de chat y un manifiesto reproducible de los datos de entrenamiento, lo que facilita su evaluación y despliegue en entornos de investigación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso de visión-lenguaje (basado en Qwen3.5-9B) |
| Parametros totales | 9.409.813.744 (9,4B) |
| Parametros activos | no disponible (modelo denso) |
| Longitud de contexto | no disponible (maximo de secuencia de entrenamiento: 5600 tokens) |
| Tipos de cuantizacion | W4A16 (Jetson Orin), NVFP4 (Jetson Thor), otros no especificados |
| Idiomas soportados | no disponibles |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

SPARC-Qwen3.5-9B-EO parte del modelo base Qwen3.5-9B, un VLM denso de la familia Qwen3.5 que emplea fusión temprana de modalidades (visión y lenguaje) entrenada sobre billones de tokens multimodales. En este ajuste, el encoder de visión se mantiene congelado mientras que el proyector de visión es entrenable, y el resto del modelo se ajusta completamente durante una única época con una tasa de aprendizaje de 2e-5 y una longitud máxima de secuencia de 5600 tokens.

La mezcla de datos de entrenamiento incluye VQA generadas por SPARC a partir de demostraciones robóticas (con umbral de calidad de anotación de 0,97 y un máximo de 700 muestras por objeto), junto con los conjuntos FSD, RoboPoint, LLaVA-OneVision2 y EO-1.5M. Esta combinación busca cubrir tanto razonamiento espacial de bajo nivel (localización de puntos) como tareas de referencia y colocación de objetos en entornos reales o simulados. El prompt de inferencia requiere desactivar el modo de razonamiento (thinking) y seguir un formato JSON estricto para las coordenadas.

## Capacidades

- Razonamiento espacial encarnado: localiza puntos 2D en imágenes (coordenadas enteras entre 0 y 1000) y genera trayectorias o múltiples puntos con etiquetas.
- Comprensión de imágenes y texto: responde a preguntas visuales en lenguaje natural, combinando información visual y semántica.
- Soporte de tool calling / function calling: no especificado explícitamente, aunque el formato JSON de salida es compatible con integraciones de agentes.
- Soporte de agentes y multi-step reasoning: el modelo base Qwen3.5 incluye capacidades agénticas, pero este ajuste se centra en la salida de coordenadas; no se documenta razonamiento multi-paso adicional.
- Capacidades multilingües: no disponibles (el modelo base Qwen3.5 es multilingüe, pero no se han publicado datos al respecto para esta variante).
- Capacidades especiales: orientado a robótica y navegación; requiere el uso de `processor.apply_chat_template` con una única vuelta de usuario que incluya la imagen y la pregunta.

## Casos de uso

- Navegación de robots móviles: el modelo puede indicar la posición de un objeto en el campo visual del robot, permitiendo planificar rutas de aproximación. Su salida en coordenadas normalizadas (0-1000) se puede mapear directamente al espacio de trabajo del robot.
- Manipulación robótica (pick-and-place): dado un objeto objetivo y una superficie, el modelo genera el punto de agarre y el punto de colocación, lo que facilita tareas de ordenación o ensamblaje.
- Interacción humano-robot en entornos domésticos: un usuario puede pedir "coloca la taza al lado del plato" y el modelo devuelve las coordenadas correspondientes en la imagen de la cámara, que el robot usa para ejecutar la acción.
- Anotación automática de datos espaciales: gracias a la generación de VQA de SPARC, el modelo puede utilizarse para etiquetar nuevas imágenes de forma automática, acelerando la creación de datasets robóticos.
- Asistencia a personas con discapacidad visual: combinado con un sistema de captura de imagen, puede describir la posición de objetos relevantes en el entorno y guiar al usuario mediante instrucciones espaciales.
- Simulación y entrenamiento de agentes: en entornos simulados (por ejemplo, Gazebo o Isaac Sim), el modelo puede proporcionar señales de referencia para políticas de control basadas en aprendizaje por refuerzo.

## Benchmarks y rendimiento

El autor reporta una evaluación local en cinco benchmarks de razonamiento espacial. La tabla siguiente muestra los resultados agregados y por tarea, comparando con dos variantes más pequeñas de la misma familia (Qwen3.5-4B y Qwen3.5-0.8B-VTFT) que no incluyen EO-1.5M en su mezcla.

| Modelo | Agregado | Where2Place | RefSpatial location | GT grounding | RoboRefIt testA | VA Bench-P |
|---|---:|---:|---:|---:|---:|---:|
| Qwen3.5-4B | 0,698 | 72,0 | 59,0 | 79,0 | 85,7 | 65,7 |
| Qwen3.5-0.8B-VTFT | 0,605 | 58,0 | 47,0 | 76,7 | 80,9 | 48,3 |
| SPARC-Qwen3.5-9B-EO | 0,719 | 76,0 | 68,0 | 78,5 | 85,2 | 68,7 |

SPARC-Qwen3.5-9B-EO obtiene el mejor agregado (0,719), destacando especialmente en Where2Place (76,0) y RefSpatial location (68,0), aunque es ligeramente inferior a Qwen3.5-4B en GT grounding y RoboRefIt testA. No se han publicado resultados frente a otros modelos externos (por ejemplo, LLaVA-OneVision o RoboPoint) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con cuantización W4A16 (4 bits) se requieren aproximadamente 6-8 GB; con cuantización NVFP4, similar; con precisión fp16/bf16 (pesos originales de 18,8 GB), se necesitan al menos 20 GB de VRAM.
- GPU recomendadas: RTX 3090/4090 (24 GB) para fp16; RTX 4060 Ti (16 GB) o GPUs con 8 GB pueden usar cuantización 4 bits. En entornos profesionales, A100 o H100 son adecuadas para despliegue con alto throughput.
- Compatibilidad con GPU de consumo: sí, con cuantización 4 bits cabe en tarjetas de gama media (por ejemplo, RTX 3060 de 12 GB). El modelo también se ha validado en Jetson Orin (W4A16) y Jetson Thor (NVFP4).
- Opciones de despliegue: compatible con transformers (carga directa), vLLM y TGI para inferencia optimizada; también se puede ejecutar con llama.cpp si se convierte a GGUF (no incluido en el repositorio).
- Latencia y throughput estimados: no disponibles. Dado el tamaño de 9,4B, se espera una latencia de decodificación de decenas de milisegundos por token en GPU moderna con cuantización, pero no hay mediciones publicadas.

## Comparativa con modelos similares

La comparación directa se establece con las variantes de la misma familia entrenadas con SPARC (sin EO-1.5M) y con el modelo base Qwen3.5-9B. No se dispone de datos de modelos externos como RoboPoint o LLaVA-OneVision en los mismos benchmarks.

| Modelo | Parametros | Contexto max. | Agregado espacial | Licencia | Disponibilidad |
|---|---:|---:|---:|---|---|
| SPARC-Qwen3.5-9B-EO | 9,4B | no disponible (5600 en entrenamiento) | 0,719 | no disponible | HuggingFace |
| Qwen3.5-4B (SPARC) | 4B | no disponible | 0,698 | no disponible | HuggingFace |
| Qwen3.5-0.8B-VTFT (SPARC) | 0,8B | no disponible | 0,605 | no disponible | HuggingFace |
| Qwen3.5-9B (base) | 9,4B | no disponible | no evaluado en estos benchmarks | Apache 2.0 (según el proyecto Qwen3.5) | Ollama, HuggingFace, etc. |

La ventaja principal del modelo EO es su mayor capacidad de razonamiento espacial gracias a la inclusión de EO-1.5M, aunque el coste computacional es mayor que las variantes pequeñas.

## Limitaciones y advertencias

- Licencia no declarada: no se especifica la licencia del modelo ni de los pesos, lo que impide su uso comercial sin autorización explícita del autor. Se recomienda contactar con irl-kit antes de cualquier despliegue en producción.
- Sesgos y alucinaciones: no se han publicado análisis de sesgos. Como todo VLM, puede generar coordenadas incorrectas o alucinar objetos inexistentes, especialmente en escenas complejas o con oclusiones.
- Dependencia del formato de prompt: el modelo exige un prompt muy específico (formato JSON, desactivación del modo thinking). Cualquier desviación puede degradar significativamente el rendimiento.
- Limitaciones de contexto: la longitud máxima de secuencia de entrenamiento es 5600 tokens, por lo que no se recomienda superar ese límite en inferencia.
- Idiomas: no se ha documentado el rendimiento en idiomas distintos del inglés; los datos de entrenamiento (SPARC, FSD, etc.) están mayoritariamente en inglés.
- Datos de entrenamiento: la mezcla incluye EO-1.5M, cuyos términos de uso no se detallan; se debe verificar la licencia de cada subconjunto antes de redistribuir el modelo o sus derivados.
- Sin garantías de robustez: no se han realizado pruebas de adversarios ni de generalización a dominios fuera de los benchmarks reportados.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/irl-kit/SPARC-Qwen3.5-9B-EO
- Dataset SPARC-VQA: https://huggingface.co/datasets/irl-kit/SPARC-VQA
- Manifiesto de la mezcla: https://huggingface.co/datasets/irl-kit/SPARC-VQA-Mixture
- Paper SPARC (arXiv:2606.13497): https://arxiv.org/abs/2606.13497
- Repositorio del proyecto Qwen3.5 (base): https://github.com/ABDtmx/Qwen3.5
- Página de Qwen3.5-9B en Ollama: https://ollama.com/library/qwen3.5:9b
- Guía de despliegue en Jetson: https://www.jetson-ai-lab.com/models/qwen3-5-9b/
