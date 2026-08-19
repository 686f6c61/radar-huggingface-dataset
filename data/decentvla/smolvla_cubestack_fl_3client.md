# DecentVLA/smolvla_cubestack_fl_3client

## Resumen

El modelo `DecentVLA/smolvla_cubestack_fl_3client` es un modelo de robótica de tipo Vision-Language-Action (VLA) desarrollado por el equipo DecentVLA. Se trata de un fine-tuning completo (sin LoRA) del modelo base `lerobot/smolvla_base`, especializado en la tarea de apilado de cubos del benchmark SO-101 CubeStack. Su particularidad principal es que ha sido entrenado mediante aprendizaje federado (Federated Learning) con el algoritmo FedAvg, agregando los pesos de tres clientes distintos durante 50 rondas y 250 pasos locales por cliente.

El modelo cuenta con 450.046.176 parámetros y se distribuye bajo licencia Apache 2.0 en formato safetensors, con un tamaño de repositorio de 0,9 GB. La relevancia de esta publicación radica en que explora un paradigma de entrenamiento alternativo al centralizado para modelos VLA, abordando problemas de privacidad de datos y distribución no-IID (non-IID) en entornos robóticos. El entrenamiento se realizó en hardware GH200 del superordenador Isambard-AI, utilizando la librería `lerobot` y el framework `decent-vla`. La pérdida final de entrenamiento reportada es de 0,0108.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VLA basada en SmolVLA (transformador multimodal) |
| Parametros totales | 450.046.176 |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (solo safetensors) |
| Idiomas soportados | no disponibles (modelo orientado a robótica, no a NLP) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura se basa en `lerobot/smolvla_base`, un modelo VLA que combina un codificador visual con un modelo de lenguaje para generar acciones de control. En este caso, el modelo ha sido sometido a un fine-tuning completo (todos los pesos del VLM descongelados, sin usar LoRA) siguiendo la receta LIBERO, con una tasa de aprendizaje de 1e-4, programación coseno, batch size de 32 y gradiente clipping de 10.

El entrenamiento se realizó mediante aprendizaje federado con tres clientes, cada uno con una partición no-IID del dataset SO-101 CubeStack basada en pares de colores: el cliente 0 (harry) ve verde/naranja, el cliente 1 (zhekai) ve verde/azul y el cliente 2 (kevin) ve naranja/azul. Cada cliente es ciego al tercer color, lo que simula una distribución de datos heterogénea. El modelo global se obtuvo mediante FedAvg sobre 50 rondas. Se utilizó un normalizador compartido (pooled-6-repo) y las cámaras `camera1` (frontal) y `camera2` (muñeca) como entrada visual, mientras que `camera3` se rellena con ceros. La acción de salida es de 6 grados de libertad (posición y orientación).

## Capacidades

- Control robótico de 6 grados de libertad (acción 6D) para tareas de manipulación.
- Percepción visual multimodal mediante dos cámaras activas (frontal y de muñeca).
- Ejecución de la tarea específica de apilado de cubos (SO-101 CubeStack).
- Modelo global agregado mediante aprendizaje federado, apto para estudiar la agregación de políticas en entornos distribuidos.
- Exportación nativa de `lerobot`, lo que facilita su integración en pipelines estándar de robótica.
- No incluye capacidades de lenguaje natural, tool calling, razonamiento general ni soporte para agentes conversacionales.

## Casos de uso

- Investigación en aprendizaje federado para robótica: permite estudiar cómo la agregación de pesos mediante FedAvg afecta a la calidad de la política final en comparación con el entrenamiento centralizado, sirviendo como punto de referencia para la comunidad.
- Benchmark de manipulación robótica: puede utilizarse como modelo de referencia en la tarea SO-101 CubeStack para medir el rendimiento de nuevos algoritmos de agregación federada o de fine-tuning distribuido.
- Evaluación de privacidad de datos: dado que cada cliente es ciego a un color, el modelo permite analizar cómo la no-IID y la falta de datos completos influyen en la generalización y en la privacidad de los conjuntos de datos locales.
- Fine-tuning posterior: el modelo global puede servir como punto de partida para adaptaciones a nuevas tareas de manipulación con pocos datos, gracias a su tamaño compacto de 450M de parámetros.
- Simulación y validación en entornos controlados: puede integrarse en simuladores robóticos (por ejemplo, MuJoCo o Isaac Sim) para validar políticas antes de un despliegue en hardware real, aprovechando su formato `lerobot`.
- Comparativa de métodos de agregación: al estar publicado junto al estudio federado de 3 clientes, permite comparar directamente el rendimiento de FedAvg frente a otros métodos de agregación sobre una base VLA, así como contra el techo centralizado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandarizados (como MMLU, HumanEval o GSM8K) en la informacion disponible, ya que se trata de un modelo de robótica especializado. El único dato de rendimiento reportado en la model card es la pérdida final de entrenamiento (train loss) de 0,0108, obtenida tras las 50 rondas de FedAvg. No se proporcionan métricas de éxito en la tarea de apilado de cubos ni comparativas cuantitativas con otros modelos en la información suministrada.

## Requisitos de hardware

- VRAM estimada para inferencia: al tener 450M de parámetros y un tamaño de repo de 0,9 GB, el modelo puede ejecutarse en FP16 o FP32 en GPUs con al menos 4-8 GB de VRAM, dependiendo de la resolución de las imágenes de entrada.
- GPU recomendadas: cualquier GPU consumer moderna es suficiente para inferencia, como una RTX 3060 (12 GB), RTX 4070 o RTX 4090. Para entrenamiento, el modelo fue entrenado en GH200 (Isambard-AI), pero un fine-tuning adicional podría realizarse en GPUs con 24 GB o más.
- Compatibilidad con consumer GPU: sí, cabe en GPUs de consumo estándar sin necesidad de cuantización adicional, aunque se recomienda FP16 para reducir el uso de memoria.
- Opciones de despliegue: el formato nativo es `lerobot`, por lo que puede cargarse directamente con esa librería. No se indica soporte para vLLM, llama.cpp u Ollama, ya que no es un modelo de lenguaje generativo estándar.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|
| DecentVLA/smolvla_cubestack_fl_3client | 450M | VLA federado (FedAvg 3 clientes) para CubeStack | Apache 2.0 | HuggingFace |
| lerobot/smolvla_base | 450M (aprox.) | VLA base generalista | Apache 2.0 | HuggingFace |
| pi0.5 (mencionado en el estudio) | no disponible | VLA (estudio federado 3 clientes, misma partición no-IID) | no disponible | no disponible |

La comparativa con `pi0.5` se menciona explícitamente en la model card, ya que ambos modelos comparten la misma partición no-IID de pares de colores en el estudio federado de 3 clientes, aunque no se aportan datos de rendimiento comparativos en la información disponible. La diferencia principal con `smolvla_base` es que este modelo está fine-tuneado específicamente para CubeStack y mediante un proceso federado, mientras que el base es un modelo generalista sin especializar.

## Limitaciones y advertencias

- Especialización extrema: el modelo está entrenado únicamente para la tarea de apilado de cubos (SO-101 CubeStack) y no posee capacidades generales de razonamiento, lenguaje o visión fuera de este dominio.
- Dependencia de la configuración de cámaras: la cámara `camera3` se rellena con ceros, lo que limita la percepción si el entorno de despliegue requiere una tercera vista.
- Riesgo de alucinación y errores de control: como todo modelo VLA, puede generar acciones incorrectas ante entradas visuales fuera de la distribución de entrenamiento, lo que requiere validación en simulación antes del uso en hardware real.
- Sesgos de la partición no-IID: al ser entrenado con clientes ciegos a un color, el modelo global puede tener un rendimiento degradado en combinaciones de colores no vistas durante el entrenamiento federado.
- Limitaciones de idioma: no soporta procesamiento de lenguaje natural, por lo que no es adecuado para tareas de texto o conversación.
- Restricciones de licencia: la licencia Apache 2.0 permite uso comercial y modificación, pero se recomienda revisar las condiciones de la librería `lerobot` y del dataset SO-101 si se utiliza en producción.
- Falta de datos de generalización: no se proporcionan métricas de éxito en el entorno real ni en variaciones de la tarea, por lo que su robustez fuera del benchmark específico es desconocida.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/DecentVLA/smolvla_cubestack_fl_3client
- Repositorio del framework de entrenamiento (decent-vla): https://github.com/kevinDuan1/decent-vla
- Modelo base (lerobot/smolvla_base): https://huggingface.co/lerobot/smolvla_base
