# Saraswathy/qwen3vl4b-virl-stem60-social40-step100

## Resumen

Este modelo es un adaptador LoRA de tipo PEFT, publicado por el usuario Saraswathy, que se monta sobre el modelo base `Qwen/Qwen3-VL-4B-Instruct`. Está entrenado con el framework EasyR1 mediante aprendizaje por refuerzo (GRPO) a lo largo de 100 pasos globales, y el nombre del repositorio sugiere una mezcla de datos STEM (60 %) y sociales (40 %) para tareas de razonamiento visual. El adaptador está pensado para ser evaluado en entornos de investigación y desarrollo, ya que no se proporciona documentación adicional sobre el proceso de entrenamiento ni sobre los datos concretos utilizados.

Al ser un adaptador LoRA, no es un modelo autónomo: requiere cargar el modelo base completo `Qwen3-VL-4B-Instruct` (4. 000 millones de parámetros) y aplicar el adaptador sobre él. El tamaño del repositorio es de 0,5 GB, lo que corresponde exclusivamente a los pesos del adaptador. Su relevancia radica en que demuestra un flujo de trabajo típico para ajustar modelos multimodales de código abierto con técnicas de RL, y puede servir como punto de partida para experimentos similares.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre Qwen3-VL-4B-Instruct (transformer multimodal visión-lenguaje) |
| Parámetros totales | No disponible (el adaptador no declara su número de parámetros; el modelo base tiene 4 000 millones) |
| Parámetros activos | No aplicable (no es un modelo MoE) |
| Longitud de contexto | No disponible (el modelo base soporta hasta 128 000 tokens, según la documentación de Qwen3-VL) |
| Tipos de cuantización | No disponible (el adaptador se distribuye en safetensors; el modelo base admite cuantización FP16/INT8/INT4) |
| Idiomas soportados | No disponible (el modelo base es multilingüe, pero no se especifican los idiomas para este adaptador) |
| Licencia | No disponible |
| Formato de pesos | safetensors (librería `peft`) |

## Arquitectura y entrenamiento

El adaptador se construye sobre `Qwen3-VL-4B-Instruct`, un modelo de visión-lenguaje de la serie Qwen3-VL que combina un codificador visual (Vision Transformer) con un decoder de lenguaje basado en transformer. La arquitectura original soporta comprensión de imágenes, vídeo y texto, con capacidad de razonamiento multimodal y agente. El adaptador fue entrenado mediante el algoritmo GRPO (Group Relative Policy Optimization), un método de aprendizaje por refuerzo que optimiza la política del modelo comparando grupos de respuestas generadas. El nombre `stem60-social40` sugiere que el conjunto de entrenamiento estaba compuesto por un 60 % de datos de tipo STEM (ciencia, tecnología, ingeniería y matemáticas) y un 40 % de datos de tipo social o conversacional, aunque no se detalla la procedencia exacta de estos datos.

El entrenamiento se realizó con la librería EasyR1, que facilita la implementación de pipelines de RL para modelos multimodales. El paso 100 indica que se guardó un checkpoint intermedio, no un entrenamiento finalizado. No se han publicado detalles sobre el dataset concreto, el número de tokens de entrenamiento ni si se aplicaron técnicas adicionales como DPO o SFT previo.

## Capacidades

- Generación de texto y razonamiento multimodal: al estar basado en Qwen3-VL-4B-Instruct, puede responder a preguntas sobre imágenes, diagramas, gráficos y escenas visuales, así como generar texto coherente.
- Razonamiento matemático y científico: el entrenamiento con datos STEM busca mejorar el rendimiento en problemas de lógica, cálculo, física y otras disciplinas técnicas.
- Comprensión de contexto social: el 40 % de datos sociales podría orientar el modelo hacia tareas de diálogo, análisis de intenciones o razonamiento sobre interacciones humanas.
- Soporte de tool calling y agentes: el modelo base Qwen3-VL-4B-Instruct incluye capacidades de llamada a herramientas y ejecución de agentes, que el adaptador hereda (aunque no se ha validado específicamente).
- Capacidades multilingües: heredadas del modelo base, aunque no se ha verificado su rendimiento en este adaptador.
- Razonamiento de múltiples pasos: el modelo base está diseñado para cadenas de pensamiento, y el entrenamiento con RL puede reforzar esa habilidad en los dominios objetivo.

## Casos de uso

- Evaluación de razonamiento visual en entornos educativos: el modelo puede usarse para evaluar la capacidad de un sistema en responder preguntas sobre diagramas de física, fórmulas matemáticas o esquemas científicos, aprovechando el entrenamiento en STEM.
- Análisis de gráficos y tablas en informes técnicos: dado su enfoque STEM, puede interpretar gráficos de barras, líneas o dispersión y extraer conclusiones numéricas, útil en sistemas de análisis de datos.
- Asistente de tutoría en ciencias: el modelo puede generar explicaciones paso a paso para problemas de matemáticas o ciencias, integrado en plataformas educativas como chatbot.
- Moderación de contenido con contexto social: al incluir datos sociales, podría adaptarse para detectar sesgos, tono o intenciones en interacciones textuales o visuales, aunque su eficacia no está documentada.
- Prototipado de agentes multimodales con RL: sirve como ejemplo de cómo aplicar GRPO sobre un modelo de visión-lenguaje, útil para investigadores que quieren replicar el flujo con otros datasets.
- Integración en pipelines de evaluación de modelos: al ser un adaptador ligero (0,5 GB), se puede cargar sobre el modelo base para comparar el efecto del entrenamiento con RL frente al modelo original en tareas específicas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No hay datos de rendimiento en MMLU, HumanEval, GSM8K ni ninguna otra métrica estándar para este adaptador específico.

## Requisitos de hardware

- Para cargar el modelo base Qwen3-VL-4B-Instruct se necesitan aproximadamente 8 GB de VRAM en FP16 (pesos del modelo), más el adaptador LoRA que añade unos 0,5 GB adicionales.
- En cuantización INT8 o INT4, el modelo base puede reducirse a ~4 GB o ~2 GB, respectivamente, permitiendo ejecutarlo en GPUs de consumo como RTX 3060 (12 GB) o RTX 4060 (8 GB).
- GPU recomendadas: NVIDIA RTX 4090 (24 GB), RTX 3090 (24 GB), A100 (40 GB) o H100 (80 GB) para inferencia con contexto largo y batch grande.
- El adaptador se puede cargar con librerías de PEFT (Hugging Face) sobre el modelo base. Para inferencia, se puede usar `transformers` con `load_adapter`, o servir con vLLM, TGI o llama.cpp (este último solo si se convierte el modelo base a formato GGUF y se aplica el adaptador).
- La latencia depende del modelo base (4B) y de la GPU. En una A100 se pueden obtener ~20-30 tokens/s en FP16; en una RTX 4090, ~15-20 tokens/s. No hay datos específicos para este adaptador.

## Comparativa con modelos similares

No hay disponible información sobre adaptadores LoRA comparables entrenados con GRPO sobre Qwen3-VL-4B-Instruct. Como referencia genérica, se puede comparar con el modelo base sin ajustar:

| Modelo | Parámetros | Contexto | Entrenamiento | Licencia |
|---|---|---|---|---|
| Qwen3-VL-4B-Instruct (base) | 4B | 128K | SFT + RLHF (oficial) | Apache 2.0 |
| Este adaptador | LoRA (no declarado) | 128K (heredado) | GRPO, paso 100, STEM60/Social40 | No disponible |
| Qwen3-VL-2B-Instruct | 2B | 128K | SFT + RLHF (oficial) | Apache 2.0 |

No se dispone de comparaciones de rendimiento numérico entre este adaptador y otros modelos similares.

## Limitaciones y advertencias

- Al ser un adaptador entrenado con GRPO sobre un dataset desconocido, puede presentar sesgos o comportamientos no deseados en dominios fuera de los datos de entrenamiento (STEM y social).
- Riesgo de alucinación en respuestas visuales: el modelo base ya tiene este riesgo, y el adaptador no lo corrige; debe validarse en cada caso de uso.
- No se documentan restricciones de licencia, pero el modelo base es Apache 2.0; el adaptador podría tener una licencia distinta, desconocida.
- El adaptador no es autónomo; requiere el modelo base completo para funcionar, lo que implica un coste adicional de memoria.
- La falta de benchmarks y documentación impide conocer su rendimiento real; se recomienda realizar una evaluación propia antes de usarlo en producción.
- El entrenamiento se detuvo en el paso 100, lo que sugiere un modelo temprano que puede no haber convergido completamente.

## Enlaces

- [Hugging Face del adaptador](https://huggingface.co/Saraswathy/qwen3vl4b-virl-stem60-social40-step100)
- [Modelo base Qwen3-VL-4B-Instruct](https://huggingface.co/Qwen/Qwen3-VL-4B-Instruct)
- [Repositorio oficial de Qwen3-VL (GitHub)](https://github.com/QwenLM/Qwen3-VL)
