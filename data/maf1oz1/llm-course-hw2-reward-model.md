# maf1oz1/llm-course-hw2-reward-model

## Resumen

maf1oz1/llm-course-hw2-reward-model es un modelo de recompensa (reward model) obtenido por fine-tuning supervisado del modelo instruct HuggingFaceTB/SmolLM-135M-Instruct mediante la librería TRL (Transformer Reinforcement Learning). El autor lo publica bajo el identificador maf1oz1 y lo entrena sobre el dataset HumanLLMs/Human-Like-DPO-Dataset, un conjunto de preferencias orientado a alinear respuestas con el estilo humano. El pipeline declarado en Hugging Face es text-classification, coherente con la función de un reward model: asignar una puntuación escalar a una respuesta dada una instrucción.

El modelo es deliberadamente pequeño: 134.515.584 parámetros totales en formato safetensors, lo que lo sitúa en la gama de 135M. Esta escala lo hace apto para experimentación académica, prototipado de pipelines RLHF/DPO y despliegue en hardware modesto, pero no para producción de alta exigencia. El contexto máximo, los idiomas y la licencia no están documentados en la información disponible.

Se trata de un artefacto de curso (el nombre incluye "llm-course-hw2"), con 0 descargas y 0 likes en el momento de la consulta, creado y actualizado el 2 de noviembre de 2026. Su interés es principalmente didáctico: ilustra el flujo completo de entrenamiento de un reward model con TRL sobre un LLM base pequeño.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada de SmolLM-135M-Instruct), con cabeza de recompensa para text-classification |
| Parametros totales | 134.515.584 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (la del modelo base SmolLM-135M-Instruct no se especifica en la información proporcionada) |
| Tipos de cuantizacion | no disponible (pesos en safetensors; cuantización a GGUF/AWQ no documentada) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de HuggingFaceTB/SmolLM-135M-Instruct, un transformer decoder-only de 135M parámetros. Sobre esa base se añade una cabeza de clasificación que produce una puntuación de recompensa, siguiendo el esquema estándar de los reward models en RLHF. El entrenamiento se realizó con TRL 0.15.2 (clase RewardTrainer), Transformers 4.48.3, PyTorch 2.14.1+cu126, Datasets 5.0.1 y Tokenizers 0.21.4.

El dataset de entrenamiento es HumanLLMs/Human-Like-DPO-Dataset, un conjunto de pares de preferencias (respuesta elegida frente a rechazada) orientado a que el modelo puntúe mejor las respuestas con estilo humano. No se documentan el número de tokens de entrenamiento, la composición exacta del dataset ni si hubo etapas adicionales de RLHF o DPO posteriores al entrenamiento del reward model. Tampoco se especifican innovaciones técnicas como decodificación especulativa o atención lineal.

## Capacidades

- Puntuación de recompensa: asigna un valor escalar a una respuesta condicionada por una instrucción, útil para rankear candidatos en pipelines de RLHF o DPO.
- Clasificación de texto: el pipeline declarado es text-classification, lo que permite integrarlo con la API estándar de Transformers.
- Evaluación de preferencias: entrenado sobre pares elegido/rechazado, puede discriminar respuestas más alineadas con el estilo humano.
- Compatibilidad con text-embeddings-inference y endpoints_compatible, según los tags del repositorio.
- Generación de texto: aunque el pipeline declarado es clasificación, la model card incluye un ejemplo de text-generation con el modelo base; conviene verificar que la cabeza de recompensa no interfiera con la generación.
- Tool calling, agentes, multi-step reasoning, visión, audio y modo thinking: no documentados; no se esperan en un modelo de 135M.

## Casos de uso

- Prototipado de RLHF en entornos académicos: usar el modelo como reward model en un bucle de optimización con PPO o DPO sobre un LLM pequeño, aprovechando su bajo coste computacional para iterar rápidamente.
- Rankeo de respuestas candidatas: dado un prompt y varias salidas generadas, puntuar cada una y seleccionar la mejor, en un esquema de best-of-N con un modelo de 135M como evaluador.
- Filtrado de datos de instrucción: puntuar pares de respuestas de un corpus para descartar las de menor calidad antes de usarlas en fine-tuning supervisado.
- Evaluación automática de asistentes: sustituir métricas léxicas por una puntuación aprendida de preferencia humana en tests de regresión de chatbots.
- Docencia y experimentación con TRL: reproducir el flujo completo de entrenamiento de un reward model con RewardTrainer y comparar hiperparámetros sin necesidad de GPUs de gama alta.
- Despliegue ligero en CPU o GPU de consumo: servir el modelo con text-embeddings-inference o Transformers para tareas de scoring en tiempo casi real, dado su tamaño de 0,5 GB en el repositorio.
- Investigación sobre alineación con modelos pequeños: estudiar hasta qué punto un reward model de 135M captura preferencias humanas y dónde falla, como línea base frente a reward models mayores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: en fp32, unos 0,54 GB solo para pesos (134,5M × 4 bytes); en fp16/bf16, unos 0,27 GB; en int8, unos 0,13 GB. Añadir memoria para activaciones y overhead del runtime.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM es suficiente; RTX 3060, RTX 4060, RTX 4090, A100 y H100 funcionan sin problema, aunque el modelo está sobredimensionado para estas últimas.
- Cabe en GPU de consumo: sí, en prácticamente cualquier GPU consumer moderna e incluso en iGPU con suficiente memoria compartida.
- Opciones de despliegue: Transformers (pipeline text-classification), text-embeddings-inference (según tags), y potencialmente llama.cpp/Ollama si se generan pesos GGUF, aunque no se documenta dicha conversión.
- Latencia y throughput: no disponibles; por el tamaño, se espera latencia de milisegundos por muestra en GPU y decenas de milisegundos en CPU, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| maf1oz1/llm-course-hw2-reward-model | 134,5M | no disponible | Reward model / text-classification | no disponible | Hugging Face, 0 descargas |
| HuggingFaceTB/SmolLM-135M-Instruct | 135M | no disponible en la información proporcionada | Generación de texto instruct | no disponible en la información proporcionada | Hugging Face, ampliamente usado |
| Reward models de la familia OpenAssistant (p. ej. oasst-pythia-1.4b-rm) | ~1,4B | no disponible en la información proporcionada | Reward model | no disponible en la información proporcionada | Hugging Face |
| ArmoRM-Llama3-8B | ~8B | no disponible en la información proporcionada | Reward model | no disponible en la información proporcionada | Hugging Face |

La comparativa es orientativa: no se dispone de benchmarks del modelo evaluado, por lo que la comparación se limita a parámetros, tarea y disponibilidad. Frente a reward models de 1,4B u 8B, este modelo es dos a tres órdenes de magnitud menor, lo que reduce su capacidad de capturar preferencias complejas.

## Limitaciones y advertencias

- Tamaño muy reducido: con 135M parámetros, la capacidad de modelar preferencias matizadas es limitada; se esperan puntuaciones ruidosas en tareas complejas.
- Sesgos: al entrenarse sobre HumanLLMs/Human-Like-DPO-Dataset, hereda los sesgos de ese corpus y del modelo base SmolLM-135M-Instruct; no se documenta ningún análisis de sesgo.
- Riesgo de alucinación: como reward model, el riesgo se traduce en puntuaciones mal calibradas más que en texto inventado, pero el modelo base puede generar contenido incorrecto si se usa en modo generación.
- Idiomas: no se documenta qué idiomas cubre; el dataset de preferencias suele estar dominado por inglés, por lo que el rendimiento en castellano es incierto.
- Contexto: no se especifica la longitud máxima; conviene no superar la del modelo base, que tampoco está documentada en la información disponible.
- Licencia: no disponible, lo que impide confirmar si el uso comercial está permitido; verificar antes de cualquier despliegue en producción.
- Madurez: 0 descargas y 0 likes, creado para un curso; no hay evidencia de validación externa ni de mantenimiento.
- Ejemplo de la model card inconsistente: propone text-generation con un modelo entrenado como reward model; el pipeline real es text-classification, por lo que el snippet puede no funcionar como se describe.
- No apto como juez único en producción: usar como señal auxiliar o en ensembles, no como evaluador definitivo de calidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/maf1oz1/llm-course-hw2-reward-model
- Modelo base: https://huggingface.co/HuggingFaceTB/SmolLM-135M-Instruct
- Dataset de entrenamiento: https://huggingface.co/datasets/HumanLLMs/Human-Like-DPO-Dataset
- Repositorio TRL: https://github.com/huggingface/trl
