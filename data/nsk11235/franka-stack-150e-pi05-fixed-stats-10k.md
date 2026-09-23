# nsk11235/franka-stack-150e-pi05-fixed-stats-10k

## Resumen

nsk11235/franka-stack-150e-pi05-fixed-stats-10k es un ajuste fino (fine-tune) de una política robótica de tipo Vision-Language-Action (VLA) perteneciente a la familia π0.5 (pi05) de Physical Intelligence, publicada por el usuario nsk11235 mediante la librería LeRobot de Hugging Face. El modelo parte del checkpoint base lerobot/pi05_base y se ha entrenado sobre el dataset nsk11235/franka-stack-50e-256, compuesto por 150 episodios y 36.532 fotogramas capturados a 20 FPS sobre un robot Franka con dos cámaras.

El problema que resuelve es concreto y acotado: ejecutar de forma autónoma la tarea de apilar tres cubos (rojo sobre azul y verde sobre rojo) a partir de observaciones visuales de dos cámaras (`top` y `wrist_cam`) y de un vector de estado de 16 dimensiones, produciendo un vector de acción de 8 dimensiones. Es relevante porque demuestra el flujo completo de ajuste fino de un VLA abierto dentro del ecosistema LeRobot y porque se distribuye con licencia Apache 2.0, lo que facilita su reutilización y su inspección.

El checkpoint tiene 4.143.404.816 parámetros (aproximadamente 4,14 mil millones) y un repositorio de 9,4 GB en formato safetensors. No se han publicado resultados de evaluación en la información disponible, por lo que su rendimiento real en el robot no está cuantificado.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Vision-Language-Action (VLA) de la familia pi05; detalle del backbone no disponible |
| Parámetros totales | 4.143.404.816 (≈4,14 mil millones) |
| Parámetros activos | No aplica (no se documenta una arquitectura MoE) |
| Longitud de contexto | No aplica (no es un modelo de lenguaje de texto): consume 2 imágenes de 256×256 píxeles y un vector de estado de 16 dimensiones |
| Tipos de cuantización | No disponible; el repositorio distribuye pesos en safetensors (9,4 GB, coherente con bf16/fp32 y ficheros auxiliares) |
| Idiomas soportados | No disponible (la instrucción de tarea del dataset está en inglés) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |
| Modelo base | lerobot/pi05_base |
| Tipo de robot | Franka |
| Cámaras de entrada | `top`, `wrist_cam` (3, 256, 256) cada una |
| Dimensión de estado | 16 |
| Dimensión de acción | 8 |
| Librería | lerobot 0.6.2 |
| Dataset de entrenamiento | nsk11235/franka-stack-50e-256 (150 episodios, 36.532 fotogramas, 20 FPS) |
| Tarea entrenada | Apilar el cubo rojo sobre el azul y el verde sobre el rojo |

## Arquitectura y entrenamiento

El modelo es un VLA de la familia pi05: una política que combina percepción visual, condicionamiento por instrucción en lenguaje natural y generación de acciones motoras continuas. Según la model card, π0.5 evoluciona π0 con el objetivo de generalizar a entornos y situaciones no vistos durante el entrenamiento, y esta implementación concreta procede de la adaptación a LeRobot del repositorio OpenPI de Physical Intelligence. La información proporcionada no detalla la composición interna del backbone (codificador visual, componente lingüístico y experto de acción), el número de tokens de entrenamiento ni la receta exacta de preentrenamiento del modelo base.

El ajuste fino se realizó sobre el dataset nsk11235/franka-stack-50e-256 con la siguiente configuración declarada: 10.000 pasos de entrenamiento, tamaño de lote 32, optimizador AdamW, tasa de aprendizaje 2,5e-05, semilla 1000 y LeRobot 0.6.2. La entrada son dos imágenes RGB de 256×256 (`observation.images.top` y `observation.images.wrist_cam`) más un vector de estado de 16 dimensiones, y la salida es un vector de acción de 8 dimensiones. El identificador del repositorio incluye el sufijo «fixed-stats», que apunta a un tratamiento fijo de las estadísticas de normalización, aunque la model card no documenta el procedimiento aplicado. No se declara uso de RLHF, DPO ni de ningún otro método de alineación posterior al ajuste por imitación.

## Capacidades

- Generación de acciones motoras continuas de 8 dimensiones para un robot Franka, a partir de observaciones visuales y de estado.
- Percepción visual con dos cámaras simultáneas (vista cenital y vista de muñeca) a resolución 256×256.
- Condicionamiento por instrucción en lenguaje natural: la tarea se pasa como cadena de texto en el campo `--task` durante el despliegue.
- Ejecución de una secuencia de manipulación con múltiples pasos implícitos (recoger el cubo rojo, colocarlo sobre el azul, recoger el verde y colocarlo sobre el rojo).
- Aprendizaje por imitación a partir de demostraciones teleoperadas (150 episodios, 36.532 fotogramas a 20 FPS).
- No soporta tool calling ni function calling, no implementa agentes ni razonamiento multi-paso simbólico y no ofrece capacidades de generación de texto, código o matemáticas.
- No se documentan capacidades multilingües, de audio, de vídeo de larga duración ni modos de «pensamiento» explícitos.

## Casos de uso

- Automatización de apilado de cubos en banco de pruebas: es la tarea exacta para la que se entrenó, ejecutable directamente con `lerobot-rollout` sobre un Franka con las dos cámaras configuradas con los nombres `top` y `wrist_cam`.
- Punto de partida para ajustes finos en tareas de pick-and-place: al derivar de lerobot/pi05_base y usar el flujo `lerobot-train`, sirve como inicialización cuando se dispone de pocos episodios de una tarea de manipulación similar.
- Evaluación comparativa de políticas en investigación en aprendizaje por imitación: permite medir la transferencia de un VLA preentrenado a una tarea única con 150 demostraciones y contrastar resultados frente a políticas entrenadas desde cero.
- Validación de pipelines de LeRobot: útil para verificar versiones concretas de la librería (0.6.2), el formato de dataset (LeRobotDataset), la compatibilidad de checkpoints y el proceso completo de entrenamiento y despliegue.
- Banco de pruebas de infraestructura robótica: sirve para medir latencia de inferencia, frecuencia de control alcanzable y requisitos de VRAM con un modelo de 4,14 mil millones de parámetros en hardware real.
- Docencia y demostraciones: el modelo ilustra de forma autocontenida qué es un VLA, cómo se define el contrato de observaciones y acciones y cómo se conecta una política a un robot físico.
- Estudio de sensibilidad a la configuración de cámaras: al depender de dos vistas concretas, es un caso útil para analizar el impacto de cambios de iluminación, encuadre o posición de cámara en el éxito de la tarea.
- Reproducibilidad de experimentos: la semilla 1000 y la configuración de entrenamiento declarada permiten intentar replicar el ajuste y comparar resultados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La propia model card indica explícitamente que no se han proporcionado resultados de evaluación para esta política (`No evaluation results have been provided for this policy yet`). Por tanto, no existen tasas de éxito, número de ensayos ni métricas comparativas verificables para la tarea de apilado, y no se incluyen cifras estimadas.

## Requisitos de hardware

- Estimaciones derivadas del recuento de parámetros (4.143.404.816), sin incluir activaciones ni overhead del runtime: ≈16,6 GB en fp32, ≈8,3 GB en bf16/fp16, ≈4,1 GB en int8 y ≈2,1 GB en int4.
- VRAM recomendada para inferencia en bf16: 12-16 GB como mínimo razonable, con 24 GB para trabajar con holgura. Los pesos del repositorio ocupan 9,4 GB, lo que sugiere almacenamiento en bf16 o fp32 junto con ficheros auxiliares.
- GPU recomendadas: A100 (40/80 GB), H100 (80 GB) y L40S (48 GB) sin restricciones; RTX 4090 y RTX 3090 (24 GB) son suficientes; RTX 4080 o RTX 4070 Ti SUPER (16 GB) quedan al límite y requieren lote 1.
- Cabe en GPU de consumo: sí, en tarjetas de 24 GB (RTX 4090, RTX 3090) y, con margen reducido, en modelos de 16 GB si se usa precisión reducida.
- Opciones de despliegue: LeRobot (`lerobot-rollout`, `lerobot-train`) y, por herencia, la implementación de OpenPI. No son aplicables vLLM, llama.cpp, Ollama ni TGI, ya que no se trata de un modelo de lenguaje de texto.
- Latencia y throughput: no disponibles. El dato de 20 FPS corresponde a la frecuencia de captura del dataset de entrenamiento, no a una medida de latencia de inferencia en el robot.

## Comparativa con modelos similares

| Modelo | Parámetros | Entrada | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| nsk11235/franka-stack-150e-pi05-fixed-stats-10k | 4.143.404.816 | 2 imágenes 256×256 + estado de 16 dimensiones | Apilado de tres cubos en Franka | Apache 2.0 | Hugging Face (0 descargas, 0 likes en la información consultada) |
| lerobot/pi05_base | No disponible | No disponible | Política VLA generalista (modelo base) | No disponible | Hugging Face |
| π0.5 de Physical Intelligence (referencia) | No disponible | No disponible | VLA de propósito general para generalización en entornos nuevos | No disponible | Blog y repositorio OpenPI |
| Otros VLA abiertos comparables | No disponible | No disponible | No disponible | No disponible | No disponible |

## Limitaciones y advertencias

- Entrenado sobre una única tarea y un único conjunto de 150 episodios: la probabilidad de sobreajuste al entorno, a la disposición de los cubos y a la iluminación del laboratorio de recogida es alta, y no hay evidencia de generalización a otras tareas.
- Ausencia total de resultados de evaluación: no se puede afirmar ninguna tasa de éxito ni comparar su rendimiento con alternativas.
- Dependencia estricta del contrato de entrada: los nombres de cámara deben ser `top` y `wrist_cam`, las imágenes se esperan a 256×256 y el vector de estado debe tener 16 dimensiones. Cualquier desviación invalida el despliegue.
- Requiere un robot Franka calibrado y coincidencia exacta de los espacios de observación y acción; el vector de acción de 8 dimensiones está ligado al hardware concreto de recogida de datos.
- La instrucción de tarea está en inglés y no se documentan capacidades multilingües.
- Riesgo de alucinación trasladado al dominio motor: una predicción incorrecta se materializa en una acción física potencialmente insegura, por lo que es obligatorio operar con paradas de seguridad, límites de fuerza y supervisión humana.
- Sesgos esperables derivados del dataset: predominancia de posiciones, colores de cubo y condiciones de iluminación concretas, con degradación previsible ante objetos, fondos o distribuciones distintos.
- Repositorio sin tracción verificable: 0 descargas y 0 likes en la información disponible, por lo que no existe validación independiente por parte de la comunidad.
- Licencia Apache 2.0, que permite uso comercial, pero conviene revisar por separado las licencias de lerobot/pi05_base, de la librería LeRobot y del código OpenPI antes de integrar el modelo en un producto.
- Los metadatos indican fecha de creación 2026-09-23 y última actualización el mismo día, sin historial posterior de mantenimiento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/nsk11235/franka-stack-150e-pi05-fixed-stats-10k
- Modelo base: https://huggingface.co/lerobot/pi05_base
- Dataset de entrenamiento: https://huggingface.co/datasets/nsk11235/franka-stack-50e-256
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=nsk11235/franka-stack-50e-256
- Blog de π0.5 (Physical Intelligence): https://www.physicalintelligence.company/blog/pi05
- Repositorio OpenPI: (referenciado en la model card sin URL explícita; buscar «openpi» en GitHub)
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Guía de pi05 en LeRobot: https://huggingface.co/docs/lerobot/main/en/pi05
- Instalación de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabación de datos y entrenamiento de políticas: https://huggingface.co/docs/lerobot/en/il_robots
- Documentación de inferencia y rollout: https://huggingface.co/docs/lerobot/main/en/inference
- Referencia rápida de comandos (cheat-sheet): https://huggingface.co/docs/lerobot/main/en/cheat-sheet
