# AnkitNayak-dev/QJev-1.5B-4bit

## Resumen

QJev-1.5B-4bit es la edición cuantizada a 4 bits (NormalFloat 4, NF4) del modelo QJev-1.5B, un transformer derivado de Qwen2.5-1.5B-Instruct y ajustado por AnkitNayak-dev para una tarea muy concreta: la toma de decisiones por clasificación de opciones, lo que el autor denomina "System 1 decision engine". En lugar de generar texto libre, el modelo evalúa un contexto y un conjunto de alternativas y devuelve una distribución de probabilidad sobre cuál es la mejor acción, mediante una cabeza de decisión MLP que se mantiene en precisión de 16 bits.

El modelo resuelve el problema del coste de memoria en inferencia de decisiones: comprime el backbone de 1.543.714.304 parámetros a 4 bits y deja la cabeza de decisión a 16 bits, con lo que el autor declara un peso en disco de 1,15 GB y un uso de VRAM activa de 1,07 GB, con una latencia de forward pass de aproximadamente 35 ms. Esto lo sitúa en el rango de GPU de consumo, portátiles y dispositivos de borde.

Es relevante ahora porque propone un patrón distinto al de los LLM generativos: un clasificador de decisiones rápido y de bajo coste que puede integrarse en bucles de agentes, sistemas de enrutamiento o automatización operativa. La licencia es Apache 2.0, aunque los pesos base de Qwen quedan sujetos a la licencia de Alibaba Cloud.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder (Qwen2) con cabeza de decisión MLP, cuantización NF4 con doble cuantización |
| Parametros totales | 1.543.714.304 (1,54 B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | NormalFloat 4 (NF4) con doble cuantización vía bitsandbytes; cabeza de decisión en 16 bits |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 (pesos base sujetos a la licencia de Alibaba Cloud Qwen) |
| Formato de pesos | safetensors (`model.safetensors` + `decision_head.safetensors`) |

## Arquitectura y entrenamiento

El modelo parte de Qwen2.5-1.5B-Instruct (arquitectura transformer decoder de tipo Qwen2) y añade una cabeza de decisión MLP específica que se mantiene en 16 bits tras la cuantización. El backbone se comprime a NF4 con doble cuantización mediante bitsandbytes, mientras que la cabeza conserva precisión completa para no degradar la calidad de la distribución de probabilidad sobre las opciones. El repositorio incluye dos ficheros de pesos separados: el del backbone cuantizado y el de la cabeza de decisión.

El ajuste se realizó, según los tags y metadatos, sobre el dataset `SargeDev/jev-distill-corpus-v3`, orientado a la tarea de "joint expected value" (JEV) y evaluación de decisiones. Existe una variante LoRA (PEFT, 20 MB) y una versión insignia fusionada en 16 bits (3,08 GB) dentro de la misma familia. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron etapas de RLHF o DPO. Las métricas declaradas en la model card son accuracy, TVD (total variation distance) y KL divergence, coherentes con una tarea de clasificación sobre distribuciones de probabilidad.

## Capacidades

- Clasificación de decisiones: dada una situación y un conjunto de opciones, devuelve la mejor opción y la distribución de probabilidad sobre todas ellas.
- Razonamiento tipo "System 1": evaluación rápida y directa de alternativas, sin cadena de pensamiento generativa.
- Salida probabilística calibrada: expone probabilidades por opción, lo que permite umbrales de confianza y abstención.
- Integración como componente de agentes: puede actuar como selector de acción dentro de un bucle de decisión.
- Inferencia rápida: forward pass de aproximadamente 35 ms según el autor.
- Despliegue ligero: pensado para GPU de baja capacidad, portátiles y dispositivos de borde.
- Servicio REST: incluye un servicio FastAPI (`serve.py`) para exponer el modelo por HTTP.
- No se documentan capacidades de generación de texto libre, código, matemáticas, visión, audio ni tool calling; la pipeline declarada es text-classification.

## Casos de uso

- Enrutamiento de acciones en agentes: el modelo recibe el estado actual y una lista de acciones candidatas y selecciona la más probable, sustituyendo a un LLM generativo en el paso de selección y reduciendo latencia y coste.
- Automatización de operaciones (AIOps): ante una alerta (por ejemplo, saturación de CPU en la réplica primaria de una base de datos), el modelo clasifica entre acciones de remediación como failover, reinicio o escalado, tal y como muestra el ejemplo de la model card.
- Triaje de incidencias en soporte: clasificar tickets o eventos en categorías de acción predefinidas con una puntuación de confianza que permita escalar a un humano cuando la probabilidad sea baja.
- Sistemas de recomendación de siguiente paso: en asistentes de productividad o flujos guiados, elegir la siguiente acción sugerida entre un conjunto acotado de opciones.
- Decisión en el borde: al requerir aproximadamente 1,07 GB de VRAM, puede ejecutarse en portátiles con GPU de consumo o en dispositivos con recursos limitados para decisiones locales sin conexión.
- Componente de evaluación en pipelines de datos: puntuar y clasificar pares contexto-opciones en lotes para construir datasets de preferencias o validar políticas de decisión.
- Servicio de decisión por API: desplegar el modelo con el servicio FastAPI incluido para que otros sistemas consulten decisiones vía REST con baja latencia.

## Benchmarks y rendimiento

La model card declara un resultado en JevBench Official del 62,53 % con tolerancia 0,05, según la insignia incluida. No se han publicado en la información disponible tablas comparativas con MMLU, HumanEval, GSM8K ni otros benchmarks estándar, ni resultados frente a modelos similares.

| Benchmark | Resultado | Notas |
|---|---|---|
| JevBench Official (strict) | 62,53 % | Tolerancia 0,05, según la model card |
| MMLU | No disponible | No publicado en la información disponible |
| HumanEval | No disponible | No publicado en la información disponible |
| GSM8K | No disponible | No publicado en la información disponible |

## Requisitos de hardware

- VRAM estimada: aproximadamente 1,07 GB de VRAM activa en inferencia, según el autor.
- Peso en disco: 1,15 GB (`model.safetensors` + `decision_head.safetensors`); el repositorio completo ocupa 1,2 GB.
- GPU recomendadas: no se especifican modelos concretos; por su huella, cabe en GPU de consumo como RTX 3060, RTX 4060 o superiores, así como en instancias GPU de bajo coste.
- Cabe en GPU de consumo: sí, con amplio margen dado el uso de VRAM declarado.
- Opciones de despliegue: transformers con bitsandbytes (requisito para la carga 4-bit), servicio FastAPI incluido (`serve.py`); compatible con text-embeddings-inference y endpoints según los tags. No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI.
- Latencia: aproximadamente 35 ms por forward pass según el autor. No se publica throughput.

## Comparativa con modelos similares

No se dispone de datos de benchmarks ni de especificaciones de modelos comparables en la información proporcionada. La comparación se limita a la propia familia QJev y al modelo base.

| Modelo | Parametros | Cuantizacion | Peso en disco | VRAM | Licencia |
|---|---|---|---|---|---|
| QJev-1.5B-4bit | 1,54 B | NF4 (4 bits) + cabeza 16 bits | 1,15 GB | ~1,07 GB | Apache 2.0 |
| QJev-1.5B (insignia) | 1,54 B | 16 bits | 3,08 GB | No disponible | Apache 2.0 |
| QJev-1.5B-LoRA | Adaptador PEFT | 16 bits (adaptador) | 20 MB | No disponible | Apache 2.0 |
| Qwen2.5-1.5B-Instruct (base) | 1,54 B | No cuantizado | No disponible | No disponible | Licencia Qwen de Alibaba Cloud |

No se dispone de información sobre alternativas de terceros de la misma categoría (clasificadores de decisión o modelos de enrutamiento de acción) para establecer una comparativa rigurosa.

## Limitaciones y advertencias

- Modelo especializado: no es un LLM generativo; su salida es una distribución sobre opciones proporcionadas, no texto libre. Usarlo fuera de ese patrón no es adecuado.
- Sesgos: no se documentan evaluaciones de sesgo; al derivar de Qwen2.5-1.5B-Instruct, puede heredar sesgos del corpus de entrenamiento del modelo base.
- Alucinación: el riesgo se manifiesta como sobreconfianza en opciones incorrectas; conviene aplicar umbrales de confianza y validación externa en producción.
- Contexto e idiomas: la longitud de contexto y los idiomas soportados no están documentados en la información disponible, lo que impide garantizar comportamiento multilingüe.
- Licencia: el modelo se publica bajo Apache 2.0, pero los pesos base están sujetos a la licencia de Alibaba Cloud Qwen; es necesario revisar ambas para uso comercial.
- Requisito de bitsandbytes: la carga en 4 bits depende de bitsandbytes, lo que limita las opciones de despliegue frente a formatos como GGUF.
- Madurez: el repositorio tiene 48 descargas y 0 likes en el momento de la consulta, y no se han publicado resultados en benchmarks estándar; la validación externa es escasa.
- Trazabilidad: la model card enlaza a una URL de Hugging Face (`devankit7873/QJev-1.5B-4bit`) distinta del identificador del repositorio (`AnkitNayak-dev/QJev-1.5B-4bit`), lo que conviene verificar antes de integrarlo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/AnkitNayak-dev/QJev-1.5B-4bit
- Repositorio GitHub: https://github.com/AnkitNayak-dev/QJev-1.5B
- Resultados JevBench: https://benchmarkheaven.com/jev-models
- Dataset de destilación: https://huggingface.co/datasets/SargeDev/jev-distill-corpus-v3
- Modelo base declarado: https://huggingface.co/devankit7873/QJev-1.5B
- Modelo base original: https://huggingface.co/Qwen/Qwen2.5-1.5B-Instruct
