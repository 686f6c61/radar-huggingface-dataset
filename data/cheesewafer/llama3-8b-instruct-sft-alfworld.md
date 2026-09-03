# cheesewafer/Llama3-8B-Instruct-sft-alfworld

## Resumen

El modelo `cheesewafer/Llama3-8B-Instruct-sft-alfworld` es un fine-tuning supervisado (SFT) de `meta-llama/Meta-Llama-3.1-8B-Instruct` realizado por el usuario de Hugging Face `cheesewafer` (Yu Xia). El objetivo es adaptar el modelo base para interactuar con el entorno ALFWorld, un simulador de tareas domésticas en texto que se utiliza habitualmente en investigación de agentes encarnados y razonamiento secuencial. El modelo está pensado para recibir descripciones de estado del entorno y generar la siguiente acción textual (por ejemplo, `go to fridge 1`, `take mug 1`, `clean mug 1`).

Se trata de un modelo de 8.030 millones de parámetros, basado en la arquitectura Llama 3.1, con una ventana de contexto nativa de 128.000 tokens (heredada del modelo base). El fine-tuning se realizó con el `alignment-handbook` y la librería `transformers`, usando un ajuste de tipo SFT (supervised fine-tuning) con hiperparámetros documentados. La relevancia de este modelo es limitada fuera del ámbito de ALFWorld, pero puede servir como punto de partida para investigaciones sobre agentes de texto, aprendizaje por imitación o evaluación de políticas en entornos simulados.

La model card es muy escueta y no incluye información sobre licencia, idiomas, datos de entrenamiento ni resultados de evaluación. Tampoco se han publicado benchmarks. Por tanto, esta ficha se basa en los datos disponibles del repositorio y en el conocimiento general de la arquitectura base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Llama 3.1 (Transformer decoder-only, con attention GQA) |
| Parametros totales | 8.030.261.248 (8,03 B) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | 128.000 tokens (heredada del modelo base; no confirmada para este fine-tune) |
| Tipos de cuantizacion | no disponible (el repositorio solo contiene pesos en safetensors de precisión completa) |
| Idiomas soportados | no disponible (el modelo base soporta inglés, español, francés, alemán, etc., pero no se especifica para este fine-tune) |
| Licencia | no disponible (el modelo base usa Llama 3.1 Community License, pero este repositorio no declara licencia) |
| Formato de pesos | safetensors (también disponible en formato `transformers`) |

## Arquitectura y entrenamiento

El modelo parte de `meta-llama/Meta-Llama-3.1-8B-Instruct`, un transformer decoder-only con 8.000 millones de parámetros, atención con consultas agrupadas (GQA) y una ventana de contexto de 128.000 tokens. Sobre esta base se realizó un fine-tuning supervisado (SFT) con el objetivo de que el modelo aprenda a generar acciones válidas en el entorno ALFWorld. ALFWorld es un entorno de simulación de tareas domésticas (como recoger objetos, limpiar o calentar) que presenta el estado del mundo en forma de texto y espera que el agente emita comandos de navegación e interacción.

El entrenamiento se llevó a cabo con el `alignment-handbook` y la librería `transformers` (versión 4.45.0), usando PyTorch 2.1.2 y Datasets 3.0.0. Los hiperparámetros documentados son: learning rate de 2e-05, batch size de entrenamiento de 8 por dispositivo (64 en total con 8 GPUs), batch size de evaluación de 4 por dispositivo (32 en total), optimizador Adam con betas (0.9, 0.999) y epsilon 1e-08, scheduler de learning rate coseno con warmup ratio de 0.1, y 3 épocas. No se especifica el número de pasos ni el tamaño del dataset de entrenamiento.

No se menciona el uso de RLHF, DPO ni otras técnicas de alineación posteriores al SFT. Tampoco se detalla la composición del dataset de entrenamiento, aunque por la naturaleza del fine-tuning se asume que consiste en trazas de interacción con ALFWorld (estados y acciones de demostración).

## Capacidades

- Generación de acciones textuales para el entorno ALFWorld: el modelo recibe una descripción del estado (por ejemplo, la habitación actual, los objetos visibles y las tareas pendientes) y produce la siguiente acción en formato texto (p. ej., `go to countertop 1`, `take plate 1`, `heat mug 1`).
- Razonamiento secuencial en tareas de múltiples pasos: al estar entrenado con trazas de ALFWorld, el modelo puede encadenar varias acciones para completar una tarea doméstica simulada.
- Comprensión de instrucciones en lenguaje natural: hereda la capacidad del modelo base para interpretar comandos y descripciones, aunque su especialización limita su uso general.
- Capacidades generales del modelo base (generación de texto, razonamiento, código, matemáticas) se mantienen en parte, pero pueden degradarse por el fine-tuning específico.
- No se ha documentado soporte explícito para tool calling, function calling ni modos de agente más allá de la interacción con ALFWorld.
- No se ha documentado soporte multimodal (visión, audio).

## Casos de uso

- Investigación en agentes de texto: el modelo puede utilizarse como política de comportamiento en experimentos de aprendizaje por refuerzo o imitación dentro de ALFWorld, permitiendo comparar estrategias de SFT frente a otros métodos.
- Simulación de tareas domésticas: en entornos de evaluación de razonamiento espacial y planificación, el modelo puede generar secuencias de acciones para completar tareas como "enfriar una bebida" o "lavar un plato".
- Generación de datos sintéticos para entrenamiento de agentes: las acciones generadas por el modelo pueden servir para crear nuevas trazas de demostración y ampliar datasets de entrenamiento.
- Evaluación de robustez de modelos base: al comparar el rendimiento de este fine-tune con el modelo base en ALFWorld, se puede medir el impacto del SFT en tareas específicas.
- Prototipado de asistentes domésticos simulados: aunque no es un producto final, puede servir para validar flujos de conversación y planificación en entornos controlados.
- Estudio de transferencia de conocimiento: analizar si el fine-tuning en ALFWorld preserva las capacidades generales del modelo base (por ejemplo, en tareas de razonamiento o código) y en qué medida.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card incluye un campo `model-index` con una lista vacía de resultados. No hay datos de MMLU, HumanEval, GSM8K ni métricas específicas de ALFWorld (como tasa de éxito en tareas). Por tanto, no es posible comparar cuantitativamente este modelo con otros.

## Requisitos de hardware

- VRAM estimada para inferencia: al ser un modelo de 8.000 millones de parámetros en precisión fp32, el checkpoint ocupa aproximadamente 32 GB en memoria. Con cuantización a 8 bits (no disponible en el repositorio, pero posible con herramientas externas) se reduciría a unos 8-10 GB; con 4 bits, a unos 4-6 GB.
- GPU recomendadas: para inferencia en fp32 se necesitaría una GPU con al menos 40 GB de VRAM (A100 40GB, A6000, etc.). Con cuantización, una RTX 3090/4090 (24 GB) sería suficiente para 8 bits, y una RTX 3060 (12 GB) para 4 bits.
- Si cabe en consumer GPU: sí, con cuantización. Sin cuantización, no cabe en GPUs de consumo típicas (16-24 GB).
- Opciones de despliegue: al ser un modelo `transformers`, se puede servir con vLLM, Text Generation Inference (TGI), o mediante `transformers` + PyTorch. También se puede convertir a GGUF para usarlo con llama.cpp u Ollama, aunque no se proporcionan dichos formatos en el repositorio.
- Latencia y throughput: no disponibles. Dependerá del hardware y de la longitud de las secuencias generadas (en ALFWorld las acciones son cortas, por lo que la latencia será baja).

## Comparativa con modelos similares

No se dispone de información suficiente para establecer una comparativa rigurosa con otros modelos fine-tuneados para ALFWorld. Como referencia, se puede comparar con el modelo base:

| Modelo | Parametros | Contexto | Licencia | Especializacion |
|---|---|---|---|---|
| meta-llama/Meta-Llama-3.1-8B-Instruct | 8,03 B | 128k | Llama 3.1 Community License | Generalista, instruct |
| cheesewafer/Llama3-8B-Instruct-sft-alfworld | 8,03 B | 128k (heredado) | no disponible | Fine-tune para ALFWorld |

No se han encontrado otros modelos públicos con la misma especialización en ALFWorld en la información disponible.

## Limitaciones y advertencias

- Especialización estrecha: el modelo está diseñado exclusivamente para ALFWorld. Su uso en tareas generales de generación de texto o razonamiento puede producir resultados subóptimos o incoherentes.
- Sin datos de evaluación: no hay métricas publicadas que demuestren su eficacia en ALFWorld ni en otras tareas. No se puede garantizar su rendimiento.
- Licencia no declarada: aunque el modelo base tiene una licencia específica (Llama 3.1 Community License), este repositorio no especifica la suya. Esto puede generar incertidumbre legal para uso comercial o redistribución.
- Riesgo de alucinación: como cualquier modelo de lenguaje, puede generar acciones inválidas o irrelevantes para el estado del entorno, especialmente en situaciones fuera de la distribución de entrenamiento.
- Sesgos del modelo base: el fine-tuning no elimina los sesgos presentes en Llama 3.1, que pueden manifestarse en la interpretación de instrucciones o en la generación de texto.
- Documentación insuficiente: la model card no detalla el dataset de entrenamiento, el preprocesamiento, ni los criterios de evaluación. Esto dificulta la reproducibilidad y la confianza en el modelo.
- Contexto largo no verificado: aunque el modelo base soporta 128k tokens, no se ha confirmado que el fine-tuning mantenga esta capacidad sin degradación.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/cheesewafer/Llama3-8B-Instruct-sft-alfworld
- Perfil del autor: https://huggingface.co/cheesewafer
- Modelo base: https://huggingface.co/meta-llama/Meta-Llama-3.1-8B-Instruct
- Entorno ALFWorld (referencia externa, no incluida en la información proporcionada): no disponible en la búsqueda web realizada.
