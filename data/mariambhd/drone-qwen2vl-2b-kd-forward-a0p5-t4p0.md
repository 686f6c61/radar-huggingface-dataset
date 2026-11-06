# mariambhd/drone-qwen2vl-2b-kd-forward-a0p5-T4p0

## Resumen

El modelo `mariambhd/drone-qwen2vl-2b-kd-forward-a0p5-T4p0` es un adaptador LoRA sobre `Qwen/Qwen2-VL-2B-Instruct`, desarrollado por el usuario mariambhd, especializado en reconocimiento de acciones humanas en vídeo capturado por drones. No se trata de un modelo completo, sino de un adaptador PEFT que debe cargarse junto con el modelo base Qwen2-VL-2B-Instruct de 2.000 millones de parámetros. El adaptador se ha entrenado mediante destilación de conocimiento (knowledge distillation) con etiquetas suaves y divergencia KL directa (forward KL), tomando como profesor un modelo mayor (Qwen2.5-VL-3B) también adaptado con LoRA.

La tarea resuelta es la clasificación de vídeo en 7 clases de acciones: attacking, hitting, kicking, clapping, waving, walking y running. El modelo profesor alcanza un 95,00% de accuracy en el conjunto de test, mientras que este estudiante de 2B alcanza un 85,00% de accuracy y un 77,18% de macro F1. El interés principal radica en la compresión de un modelo mayor a uno menor manteniendo capacidades de reconocimiento de acciones, lo que permite desplegar en entornos con recursos limitados, como sistemas embarcados en drones.

El adaptador se publicó en noviembre de 2026 y cuenta con cero descargas y cero likes en el momento de la consulta. El repositorio tiene un tamaño de 0,0 GB, lo que sugiere que los pesos del adaptador son muy ligeros, coherente con un LoRA de bajo rango. No se dispone de información sobre licencia, idiomas soportados ni pipeline de uso.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre Qwen2-VL-2B-Instruct (transformer multimodal vision-language) |
| Parametros totales | 2.000 millones (modelo base) + parametros del adaptador LoRA (no disponibles) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (heredada del modelo base Qwen2-VL-2B-Instruct, no especificada en la informacion) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador se basa en Qwen2-VL-2B-Instruct, un transformer multimodal que procesa imágenes y texto. Sobre este modelo base se aplica un adaptador LoRA de tipo PEFT, cuyos parámetros se entrenan para la tarea específica de clasificación de acciones en vídeo. El entrenamiento utiliza destilación de conocimiento con etiquetas suaves: el profesor es un modelo Qwen2.5-VL-3B con un LoRA entrenado previamente (`mariambhd/drone-qwen25vl-3b-lora-7class`, fold 3 de validación cruzada). La función de pérdida combina entropía cruzada con las etiquetas reales y divergencia KL entre las distribuciones del estudiante y del profesor, con un factor alpha=0,5 y temperatura T=4,0.

La partición de datos sigue la del profesor: sujetos de entrenamiento [1, 2, 5, 6, 7, 9, 10], validación [3] y test [4, 8]. La mejor época según la pérdida de validación (entropía cruzada) fue la 3. No se especifica el número total de épocas, el tamaño del dataset de entrenamiento ni la composición detallada de las secuencias de vídeo. Tampoco se detalla si se aplicaron técnicas adicionales como aumento de datos o congelación de capas del modelo base. La innovación principal es el uso de destilación con forward KL para transferir el conocimiento de un modelo de 3B a uno de 2B en el dominio de reconocimiento de acciones con drones.

## Capacidades

- Clasificación de acciones humanas en vídeo en 7 clases: attacking, hitting, kicking, clapping, waving, walking y running.
- Procesamiento multimodal de vídeo e imagen heredado del modelo base Qwen2-VL-2B-Instruct (visión y lenguaje).
- Generación de texto y razonamiento multimodal (capacidad del modelo base, no específicamente entrenada en este adaptador).
- Soporte de tool calling y function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponibles en la información proporcionada.
- Modo thinking, visión o audio específicos: no disponible en la información proporcionada.

## Casos de uso

- Vigilancia con drones en entornos urbanos: el adaptador permite clasificar acciones como attacking, hitting o kicking en secuencias de vídeo capturadas por drones, adecuado por su bajo coste computacional al ser un modelo de 2B.
- Análisis de comportamiento en eventos multitudinarios: clasificación de acciones como clapping, waving o walking para monitorizar flujos de personas y detectar anomalías, aprovechando la ventana de contexto del modelo base (no especificada).
- Seguridad en instalaciones industriales: detección de acciones como hitting o attacking en vídeos de cámaras aéreas para alertar a operadores, con inferencia en GPUs de gama media.
- Investigación en reconocimiento de acciones: el adaptador sirve como estudiante en experimentos de destilación de conocimiento, comparando su rendimiento (85,00% accuracy) con el profesor (95,00%) en el mismo conjunto de test.
- Despliegue en sistemas embarcados de drones: al ser un LoRA sobre un modelo de 2B, puede integrarse en plataformas con recursos limitados, aunque no se dispone de datos de latencia o consumo energético.
- Prototipado rápido de clasificadores de vídeo: al cargar el adaptador sobre Qwen2-VL-2B-Instruct, se obtiene un clasificador de 7 clases sin necesidad de reentrenar el modelo completo, útil para validar pipelines de datos y aumentos.
- Evaluación de técnicas de destilación: el adaptador permite reproducir el experimento de forward KL con alpha=0,5 y T=4,0, comparando la transferencia de conocimiento entre arquitecturas de 3B y 2B.

## Benchmarks y rendimiento

Resultados en el conjunto de test (sujetos [4, 8], 40 vídeos):

| Modelo | Accuracy | Macro F1 | Weighted F1 |
|---|---|---|---|
| Profesor (3B) | 95,00% | 96,43% | 95,00% |
| Estudiante (2B) | 85,00% | 77,18% | 83,05% |

Nota: el conjunto de test es pequeño (40 vídeos), por lo que cada vídeo representa 2,5 puntos porcentuales de accuracy. No se han publicado otros benchmarks (MMLU, HumanEval, GSM8K, etc.) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada. Para el modelo base Qwen2-VL-2B-Instruct en precisión FP16 se estiman aproximadamente 4-5 GB, pero este dato no está confirmado en la información.
- GPU recomendadas: no disponible en la información proporcionada.
- Compatibilidad con GPU de consumo: no disponible en la información proporcionada.
- Opciones de despliegue: al ser un adaptador PEFT, requiere cargar el modelo base con librerías compatibles como Hugging Face Transformers con PEFT, o vLLM si soporta LoRA. No se especifican opciones como llama.cpp, Ollama o TGI.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Accuracy (test) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este adaptador (Qwen2-VL-2B + LoRA KD) | 2B + LoRA | no disponible | 85,00% | no disponible | Hugging Face |
| Profesor (Qwen2.5-VL-3B + LoRA) | 3B + LoRA | no disponible | 95,00% | no disponible | Hugging Face (`mariambhd/drone-qwen25vl-3b-lora-7class`) |
| Qwen2-VL-2B-Instruct (base sin adaptador) | 2B | no disponible | no disponible | no disponible | Hugging Face |

No se dispone de otros modelos comparables de la misma categoría (reconocimiento de acciones con drones) en la información proporcionada.

## Limitaciones y advertencias

- El adaptador es un LoRA que requiere cargar por separado el modelo base `Qwen/Qwen2-VL-2B-Instruct`; no es un modelo autónomo.
- El conjunto de test es muy pequeño (40 vídeos), por lo que las métricas tienen alta varianza (cada vídeo = 2,5 puntos de accuracy).
- La licencia no está especificada, lo que impide confirmar si se permite uso comercial.
- No se especifican los idiomas soportados ni sesgos conocidos; al entrenarse sobre un dataset de acciones con drones, puede presentar sesgos hacia las condiciones específicas de captura (ángulos, alturas, iluminación) de dicho dataset.
- Riesgo de alucinación: aunque la tarea es clasificación, el modelo base es generativo y podría producir salidas no válidas si no se restringe la decodificación a las 7 clases.
- Limitaciones de contexto: no se dispone de la longitud de contexto del modelo base en la información proporcionada.
- No se detalla el número de tokens de entrenamiento ni la composición del dataset, lo que dificulta evaluar la generalización.
- El adaptador se entrenó con forward KL y alpha=0,5, T=4,0; otros hiperparámetros podrían dar resultados distintos.
- No hay información sobre latencia, throughput ni requisitos de hardware específicos para producción.

## Enlaces

- [Hugging Face: mariambhd/drone-qwen2vl-2b-kd-forward-a0p5-T4p0](https://huggingface.co/mariambhd/drone-qwen2vl-2b-kd-forward-a0p5-T4p0)
- [Modelo base: Qwen/Qwen2-VL-2B-Instruct](https://huggingface.co/Qwen/Qwen2-VL-2B-Instruct)
- [Profesor: mariambhd/drone-qwen25vl-3b-lora-7class](https://huggingface.co/mariambhd/drone-qwen25vl-3b-lora-7class)
