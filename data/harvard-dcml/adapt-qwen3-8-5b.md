# Harvard-DCML/ADAPT-Qwen3-8.5B

## Resumen

ADAPT-Qwen3-8.5B es un modelo de lenguaje desarrollado por el laboratorio Harvard-DCML como resultado de la aplicación de la técnica ADAPT (Amortized Distillation Across Post-Trained LLMs). Se trata de un modelo estudiante destilado a partir de Qwen/Qwen3-14B, cuyo objetivo es permitir la interpolación de tamaño entre distintas variantes de un mismo modelo base. La técnica ADAPT, descrita en el paper del repositorio, posibilita generar modelos intermedios con un número de capas ajustable mediante la función `build_intermediate_model`, lo que resulta útil para desplegar modelos en entornos con recursos de hardware limitados o para adaptar el tamaño del modelo a la complejidad de la tarea.

El modelo fue inicializado a partir de Qwen3-14B copiando capas alternas y las dos últimas capas, y posteriormente se destiló en un corpus de 4.000 millones de tokens: 2.000 millones del Pile deduplicado y 2.000 millones del split matemático del Llama Nemotron Post-Training Dataset. Durante el entrenamiento se combinaron pérdidas de entropía cruzada, divergencia KL y distancia coseno por capa para replicar las activaciones del modelo profesor. El modelo es compatible con la librería `transformers` y está publicado bajo licencia Apache 2.0.

La model card no incluye información sobre el número exacto de parámetros, la longitud de contexto de inferencia ni resultados de benchmarks. Por tanto, esta ficha se basa únicamente en los datos publicados en el repositorio de Hugging Face y en la documentación técnica vinculada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer autoregresivo basado en Qwen3-14B |
| Parametros totales | no disponible |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | no disponible (entrenado con secuencias de 4096 tokens) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | no disponible |

## Arquitectura y entrenamiento

El modelo es un transformer de lenguaje autoregresivo, heredando la arquitectura de Qwen3-14B. La técnica ADAPT consiste en tomar un modelo profesor y crear un estudiante mediante la selección de capas alternas, en este caso copiando cada dos capas y las dos últimas del profesor. Esto reduce la profundidad de la red, generando un modelo más ligero que conserva la estructura general del transformer original. Posteriormente, se aplica un proceso de destilación para alinear las activaciones del estudiante con las del profesor.

El entrenamiento se realizó en dos fases. En la fase de pre-entrenamiento se usaron 2.000 millones de tokens del dataset `EleutherAI/the_pile_deduplicated`, con una secuencia máxima de 4096 tokens. En la fase de SFT (supervised fine-tuning) se emplearon 2.000 millones de tokens del split matemático de `nvidia/Llama-Nemotron-Post-Training-Dataset`. Se combinaron tres tipos de pérdida: entropía cruzada, divergencia KL (con peso 0.1) y distancia coseno por capa (con peso 10.0). Los hiperparámetros principales incluyen una tasa de aprendizaje de 3e-4 con schedule coseno, optimizador AdamW (betas 0.9, 0.95, epsilon 1e-8), weight decay de 0.1, y gradiente máximo de 1.0. La precisión utilizada fue bfloat16. El modelo se entrenó durante 438 pasos en la fase de pre-entrenamiento y 700 pasos en la fase de SFT, con un tamaño de batch efectivo de 1024 en ambas fases.

La innovación técnica principal es la capacidad de interpolación de tamaño: mediante la función `build_intermediate_model` del repositorio de ADAPT, se puede parchear un número variable de capas del estudiante sobre el profesor, obteniendo modelos intermedios con distintas profundidades sin necesidad de reentrenar desde cero. Esto convierte al modelo en una pieza fundamental para estudiar el equilibrio entre tamaño, eficiencia y calidad dentro de una misma familia de modelos.

## Capacidades

- Generación de texto autoregresiva, compatible con el pipeline `text-generation` de Hugging Face.
- Destilado orientado a activaciones: al replicar las activaciones del profesor, el modelo hereda parcialmente el comportamiento de Qwen3-14B, aunque sin evaluaciones cuantitativas que lo confirmen.
- Entrenado en un split matemático del conjunto Llama Nemotron, por lo que puede tener una competencia mejorable en tareas de razonamiento cuantitativo y aritmético, sin que se hayan publicado resultados que lo respalden.
- Capacidad de interpolación de tamaño mediante la API `build_intermediate_model`, que permite generar modelos con un número de capas configurable.
- No se documentan capacidades de tool calling, function calling, agentes, visión, audio ni multimodales en la model card.

## Casos de uso

- Investigación en destilación de modelos: el modelo sirve como referencia para estudiar cómo la eliminación de capas alternas y la destilación por activaciones afectan al rendimiento en comparación con el modelo profesor Qwen3-14B. Puede usarse en experimentos académicos y en análisis de la compresión de grandes modelos de lenguaje.

- Generación de modelos intermedios bajo demanda: en un entorno de producción, se puede utilizar `build_intermediate_model` para crear un modelo específico con un número concreto de capas parcheadas. Esto permite ajustar el tamaño del modelo a la memoria de la GPU disponible sin necesidad de reentrenar, agilizando el despliegue en infraestructuras heterogéneas.

- Reducción de costes de inferencia: el modelo estudiante, al tener menos capas que Qwen3-14B, puede sustituir al profesor en tareas de generación de texto donde la latencia y el consumo de VRAM son críticos. La pérdida de calidad no está cuantificada, pero la técnica de destilación busca minimizarla. Es adecuado para servicios de inferencia en tiempo real con presupuesto de hardware limitado.

- Despliegue en hardware de consumo: al reducir la profundidad de la red, el modelo requiere menos memoria que un 14B. Aunque no se proporcionan pesos cuantizados, un modelo de este tamaño podría ejecutarse en GPUs de consumidor con cuantización adecuada, siempre que el usuario realice la conversión necesaria.

- Entrenamiento de modelos especializados: el estudiante puede ser el punto de partida para un ajuste fino posterior (SFT) en un dominio concreto, aprovechando que ya ha sido alineado parcialmente con el split matemático del conjunto Nemotron. Esto puede acelerar la convergencia en tareas de matemáticas o razonamiento cuantitativo.

- Transferencia de conocimiento entre variantes: permite experimentar con la interpolación de capas entre el estudiante y el profesor para estudiar la evolución de las representaciones internas a lo largo de la profundidad del modelo. Este tipo de análisis es de interés para investigadores que buscan entender qué capas capturan información semántica y cuáles contribuyen más a la calidad final.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas de MMLU, HumanEval, GSM8K ni ninguna otra evaluación comparativa. Tampoco se proporcionan mediciones de velocidad de generación, latencia ni throughput.

## Requisitos de hardware

- No se han publicado requisitos de hardware específicos en la model card.
- El repositorio tiene un tamaño de 34.0 GB, lo que sugiere que los pesos se almacenan en alta precisión (probablemente bfloat16 o float32), aunque no se especifica el formato exacto.
- No se proporcionan pesos cuantizados, por lo que la VRAM necesaria para inferencia depende de la cuantización que el usuario implemente.
- El modelo está etiquetado como compatible con la librería `transformers` y con `endpoints_compatible`, lo que indica que puede cargarse mediante la API estándar de Hugging Face.
- No se mencionan frameworks de despliegue específicos como vLLM, llama.cpp, Ollama, TGI, etc.
- No se disponen de mediciones de latencia o throughput.

## Comparativa con modelos similares

No se han proporcionado datos comparativos en la información disponible. El único modelo mencionado es Qwen3-14B como profesor, pero no se ofrecen resultados ni parámetros comparables. Por tanto, no se puede establecer una comparativa con alternativas de la misma categoría en este momento.

## Limitaciones y advertencias

- El modelo se entrenó con un total de 4.000 millones de tokens, una cantidad muy inferior a la habitual para modelos de este tamaño. Esto puede provocar vacíos de conocimiento y un mayor riesgo de alucinación.
- La técnica de eliminación de capas alternas puede degradar el rendimiento en tareas que dependen de una profundidad de red elevada, como el razonamiento complejo o la comprensión de textos extensos.
- El número real de parámetros no se especifica, lo que impide evaluar con precisión si el tamaño es de 8.5B (como sugiere el nombre) u otro distinto.
- No se han publicado resultados de benchmarks, por lo que no hay evidencia empírica de la calidad del modelo.
- El contexto de entrenamiento se limitó a 4096 tokens. Aunque la arquitectura base de Qwen3 pueda soportar contextos mayores, los datos de entrenamiento no confirman que el modelo funcione correctamente en ventanas superiores.
- Los idiomas soportados no se detallan. El corpus principal (The Pile) está compuesto mayoritariamente por texto en inglés, lo que podría introducir sesgos hacia ese idioma y limitar su rendimiento en otros lenguajes.
- La función de interpolación requiere clonar el repositorio de GitHub y depende de librerías externas, lo que añade complejidad a la integración en pipelines de producción.
- La licencia Apache 2.0 permite el uso comercial, pero el usuario es responsable de evaluar el rendimiento y los posibles sesgos antes de desplegar el modelo en aplicaciones reales.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Harvard-DCML/ADAPT-Qwen3-8.5B
- Paper en arXiv: https://arxiv.org/abs/2608.22854
- Repositorio de GitHub (ADAPT): https://github.com/dcml-lab/ADAPT
