# decisionlens/mistral7b-mdmp-lora

## Resumen

`decisionlens/mistral7b-mdmp-lora` es un adaptador LoRA de ajuste fino eficiente en parámetros sobre el modelo base `mistralai/Mistral-7B-Instruct-v0.3`, desarrollado por el usuario `decisionlens`. Su propósito es servir como asistente de coaching para el proceso de planificación militar MDMP (Military Decision Making Process), basándose exclusivamente en doctrina pública del Ejército de los Estados Unidos (manuales FM 5-0 y ADP 5-0) y en escenarios ficticios. El adaptador se entrenó con QLoRA de 4 bits mediante la librería Unsloth/PEFT, sobre un conjunto de datos de 324 pares de instrucción revisados.

La relevancia de este modelo radica en que demuestra cómo un ajuste fino ligero y de bajo coste puede especializar un modelo de 7 mil millones de parámetros en un dominio técnico concreto, mejorando notablemente la precisión en preguntas de doctrina militar (del 5 % al 70 % en un conjunto de evaluación reducido). Está pensado como herramienta educativa no oficial, no como sistema de planificación operativa real. El adaptador se distribuye bajo licencia Apache 2.0, mientras que el modelo base está sujeto a la licencia de Mistral AI.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre Mistral-7B-Instruct-v0.3 (transformer decoder) |
| Parametros totales | no disponible (el adaptador ocupa 0.2 GB en disco) |
| Parametros activos | no disponible (todos los parámetros del adaptador son activos) |
| Longitud de contexto | no disponible (depende del modelo base; el adaptador se entrenó con secuencias de hasta 2048 tokens) |
| Tipos de cuantizacion | 4-bit (QLoRA) para el adaptador; el modelo base puede cargarse en 4-bit o en precisión completa |
| Idiomas soportados | no disponible (la model card indica uso exclusivo en inglés) |
| Licencia | Apache 2.0 (adaptador y datos de entrenamiento); el modelo base tiene su propia licencia Mistral |
| Formato de pesos | safetensors (adaptador PEFT) |

## Arquitectura y entrenamiento

El adaptador se basa en la arquitectura transformer decoder de Mistral-7B-Instruct-v0.3, que emplea atención con ventana deslizante (sliding window attention) y un mecanismo de atención de 32 capas. El ajuste fino se realizó mediante QLoRA (Quantized LoRA) de 4 bits, lo que permite entrenar el adaptador con un consumo de memoria reducido. Los módulos objetivo fueron `q_proj`, `k_proj`, `v_proj`, `o_proj`, `gate_proj`, `up_proj` y `down_proj` en todas las capas. Los hiperparámetros principales incluyen rango LoRA de 16, alpha de 32, dropout de 0.05, 2 épocas, tasa de aprendizaje de 2e-4, tamaño de lote de 2 con acumulación de gradientes de 4 pasos y longitud máxima de secuencia de 2048 tokens. El entrenamiento se realizó con la librería Unsloth sobre el dataset `mdmp-staff-planning-pairs`, compuesto por 324 pares de instrucción derivados de resúmenes de doctrina MDMP y escenarios ficticios, todos revisados manualmente.

## Capacidades

- Generación de texto instructivo en el dominio del proceso de decisión militar (MDMP), respondiendo preguntas sobre pasos, fases, productos y procedimientos.
- Asistencia educativa para personal que estudia doctrina de planificación del Ejército de EE.UU., con respuestas basadas en FM 5-0 y ADP 5-0.
- Soporte de conversación multi-turno en formato Mistral Instruct (`<s>[INST] {pregunta} [/INST] {respuesta}`).
- No se documentan capacidades de tool calling, agentes, visión, audio ni razonamiento multi-paso fuera del ámbito doctrinal.
- Limitado al idioma inglés y al marco conceptual estadounidense de planificación militar.

## Casos de uso

- Formación de oficiales y suboficiales: el modelo puede utilizarse como tutor interactivo para que estudiantes de academias militares practiquen preguntas sobre el MDMP, recibiendo respuestas basadas en doctrina pública y verificables.
- Preparación de ejercicios de simulación: en entornos de simulación táctica, el adaptador puede generar escenarios hipotéticos y guiar a los participantes a través de los pasos del proceso de planificación, ayudando a interiorizar la secuencia correcta.
- Consulta rápida de doctrina: un oficial puede preguntar directamente "¿qué paso del MDMP es el war gaming?" y obtener una respuesta concisa y fundamentada, sin necesidad de consultar manuales extensos.
- Evaluación de conocimiento: el modelo puede generar preguntas de opción múltiple o de respuesta corta sobre MDMP, facilitando la creación de exámenes o autoevaluaciones.
- Asistente de estudio autónomo: estudiantes de cursos de planificación pueden interactuar con el modelo para repasar conceptos, aclarar dudas y practicar con escenarios ficticios.
- Prototipo de investigación en PEFT: sirve como caso de estudio para desarrolladores interesados en aplicar QLoRA a dominios especializados con conjuntos de datos pequeños, demostrando la viabilidad de adaptar modelos de 7B con recursos limitados.

## Benchmarks y rendimiento

La model card reporta una evaluación sobre un conjunto dorado de 20 preguntas, separado de los datos de entrenamiento. Los resultados son los siguientes:

| Modelo | Tasa de acierto |
|---|---|
| Mistral-7B-Instruct-v0.3 (base) | 1/20 (5 %) |
| Adaptador mistral7b-mdmp-lora | 14/20 (70 %) |

No se han publicado resultados en benchmarks estándar como MMLU, HumanEval o GSM8K. La evaluación se limita al dominio MDMP y utiliza un script de puntuación automática que puede ser sensible a sinónimos cercanos.

## Requisitos de hardware

- VRAM estimada: entre 5 y 8 GB para inferencia en 4 bits con el adaptador cargado, según la model card.
- GPU recomendadas: tarjetas de consumo con al menos 8 GB de VRAM, como NVIDIA RTX 3060, RTX 4060, RTX 4070 o superiores. También puede ejecutarse en GPUs profesionales como A100 o H100 si se requiere mayor velocidad.
- Compatibilidad con GPU de consumo: sí, gracias a la cuantización de 4 bits y al tamaño reducido del adaptador.
- Opciones de despliegue: el repositorio de GitHub proporciona un script de inferencia (`demo/ask.py`) y una función `load_model` que utiliza PEFT y carga el modelo en 4 bits. No se mencionan integraciones con vLLM, llama.cpp u Ollama, pero al ser un adaptador PEFT estándar, podría adaptarse a estos entornos.
- Latencia y throughput: no se proporcionan datos específicos. Se espera una latencia moderada en GPU de consumo, similar a la de Mistral-7B en 4 bits.

## Comparativa con modelos similares

No se dispone de información sobre otros adaptadores LoRA específicos para MDMP o dominios militares en la información proporcionada. La comparación más directa es con el modelo base sin ajustar:

| Modelo | Parámetros | Contexto | Rendimiento en golden set | Licencia |
|---|---|---|---|---|
| Mistral-7B-Instruct-v0.3 (base) | 7.3B | 32k (según documentación de Mistral) | 5 % | Apache 2.0 (Mistral) |
| mistral7b-mdmp-lora (adaptador) | no disponible | no disponible | 70 % | Apache 2.0 (adaptador) |

No se dispone de datos de otros adaptadores similares en el ecosistema open source para comparar.

## Limitaciones y advertencias

- El conjunto de evaluación es muy reducido (20 preguntas), lo que limita la fiabilidad estadística de la tasa de acierto del 70 %.
- El modelo está entrenado exclusivamente en inglés y con el marco doctrinal del Ejército de EE.UU., por lo que no es adecuado para otras doctrinas militares o idiomas.
- Es una herramienta educativa no oficial, no afiliada al Ejército de EE.UU., y no debe utilizarse como sustituto de sistemas de planificación clasificados o de personal cualificado.
- Las respuestas pueden contener alucinaciones o imprecisiones; la model card recomienda verificar las citas contra FM 5-0 / ADP 5-0 antes de usar cualquier respuesta en contextos operativos.
- El adaptador no es un modelo autónomo: requiere cargar el modelo base Mistral-7B-Instruct-v0.3, lo que implica cumplir con su licencia y requisitos de hardware.
- La puntuación automática de la evaluación puede fallar ante sinónimos cercanos (por ejemplo, "synchronization" frente a "synchronize"), lo que podría sobreestimar o subestimar el rendimiento real.
- No se han documentado sesgos específicos, pero al estar entrenado con doctrina militar estadounidense, puede reflejar perspectivas culturales y operativas propias de ese contexto.

## Enlaces

- [Página del modelo en Hugging Face](https://huggingface.co/decisionlens/mistral7b-mdmp-lora)
- [Dataset de entrenamiento](https://huggingface.co/datasets/decisionlens/mdmp-staff-planning-pairs)
- [Repositorio GitHub del proyecto](https://github.com/dlens/mdmp-assistant)
- [Modelo base Mistral-7B-Instruct-v0.3](https://huggingface.co/mistralai/Mistral-7B-Instruct-v0.3)
- [Documentación de Mistral 7B](https://docs.mistral.ai/models/mistral-7b-0-1)
- [Anuncio oficial de Mistral 7B](https://mistral.ai/news/announcing-mistral-7b/)
