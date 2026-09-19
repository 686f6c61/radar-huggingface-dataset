# mario-rc/emotional-rlaif-dpo-llama-3.2-3b-instruct

## Resumen

Emotional RLAIF DPO Llama-3.2-3B-Instruct es un adaptador LoRA/PEFT publicado por el usuario mario-rc (Mario-RC en GitHub) sobre el modelo base meta-llama/Llama-3.2-3B-Instruct. No se trata de un modelo completo, sino de un conjunto de pesos de adaptacion (0,1 GB) que debe cargarse sobre el modelo base mediante PEFT. Su proposito es el alineamiento emocional de respuestas conversacionales: el adaptador se entreno con Direct Preference Optimization (DPO) para favorecer respuestas con mayor inteligencia emocional dentro de un pipeline de RLAIF (Reinforcement Learning from AI Feedback).

El entrenamiento se realizo con LLaMA-Factory utilizando la plantilla de prompt `llama3`, y se apoyo en el dataset mario-rc/aif-emotional-generation: la particion `dialogues` se uso para el ajuste supervisado (SFT) previo y la particion `aif_annotations` (preferencias) para la fase de DPO. Forma parte de una familia mas amplia de adaptadores del mismo autor que cubren distintos modelos base (Llama 3.2, Gemma 2, Gemma 4, GLM-4, Mistral, Meta-Llama-3) y dos metodos de alineamiento (PPO y DPO).

Es relevante ahora porque ejemplifica una tendencia practica: adaptar modelos pequenos (3B) con tecnicas de preferencias de bajo coste para dominios concretos, en lugar de entrenar o desplegar modelos grandes. Su licencia deriva de la licencia Llama 3.2 (llama3.2) y su idioma declarado es unicamente el ingles. El repositorio tiene 45 descargas y 0 likes, y no incluye resultados de benchmarks.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA/PEFT sobre transformer decoder-only (Llama 3.2 3B Instruct) |
| Parametros totales | 3B en el modelo base; tamano del adaptador no disponible (repositorio de 0,1 GB) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible en la model card; el modelo base Llama 3.2 3B Instruct soporta 128.000 tokens |
| Tipos de cuantizacion | Adaptador en safetensors (precision completa del adaptador); no se publican versiones cuantizadas del adaptador. El modelo base dispone de cuantizaciones GGUF/AWQ/GPTQ de terceros |
| Idiomas soportados | en (ingles) |
| Licencia | llama3.2 (Llama 3.2 Community License) |
| Formato de pesos | safetensors (adaptador LoRA, libreria peft) |

Nota: los datos de contexto y tamano del modelo base proceden de la documentacion publica de Llama 3.2, no de la model card del adaptador, que no los especifica.

## Arquitectura y entrenamiento

El adaptador se monta sobre Llama-3.2-3B-Instruct, un transformer decoder-only denso de aproximadamente 3.000 millones de parametros con Grouped-Query Attention y RoPE, orientado a instrucciones y dialogo. Sobre esa base, el autor entreno un adaptador LoRA/PEFT (pesos de bajo rango) con LLaMA-Factory, empleando la plantilla de chat `llama3`. El pipeline tiene dos fases declaradas: primero un ajuste supervisado (SFT) sobre la particion de dialogos del dataset mario-rc/aif-emotional-generation, y despues una alineacion por preferencias con DPO sobre la particion de anotaciones de preferencia generadas por IA (aif_annotations). No se especifican en la model card el rango de LoRA, el alpha, la tasa de aprendizaje, el numero de pasos, el numero de tokens vistos ni la composicion detallada del dataset.

La innovacion metodologica es el uso de RLAIF (feedback generado por modelos de IA en lugar de anotadores humanos) para construir el conjunto de preferencias que alimenta el DPO, aplicado especificamente a rasgos de inteligencia emocional en las respuestas. El autor publica el codigo del pipeline en el repositorio GitHub Mario-RC/sml-emotional-rlaif y una familia de adaptadores equivalentes con PPO y DPO sobre distintos modelos base. No se documentan innovaciones de inferencia (decodificacion especulativa, atencion lineal, etc.) ni fases de RLHF con anotacion humana.

## Capacidades

- Generacion de texto conversacional en ingles, heredada del modelo base Llama-3.2-3B-Instruct.
- Ajuste especifico en inteligencia emocional: se espera (por el diseno del pipeline) una mayor presencia de reconocimiento emocional, empatia y formulaciones afectivamente alineadas frente al modelo base, aunque no hay evaluaciones publicadas que lo cuantifiquen.
- Razonamiento basico, matematicas elementales y generacion de codigo del modelo base, potencialmente alterados por el ajuste de preferencias.
- Capacidad multilingue limitada: el idioma declarado del adaptador es unicamente ingles; el modelo base soporta otros idiomas, pero el adaptador puede degradarlos.
- Capacidades de tool calling y function calling: heredadas en principio del modelo base Llama 3.2 Instruct, no verificadas ni documentadas para este adaptador.
- Modo thinking, vision o audio: no disponibles.
- No se documentan capacidades de agente ni de razonamiento multi-paso especificas del adaptador.

## Casos de uso

- Investigacion en alineamiento emocional: el adaptador sirve como punto de comparacion reproducible frente a los demas adaptadores de la misma familia (PPO y DPO sobre Gemma 2, Gemma 4, GLM-4, Mistral y Meta-Llama-3) para estudiar el efecto de DPO con preferencias generadas por IA.
- Chatbots de acompanamiento o bienestar en ingles: el ajuste busca respuestas mas empaticas, lo que encaja en prototipos de conversacion de apoyo emocional de baja latencia, siempre con supervision humana y advertencias de uso.
- Sistemas de atencion al cliente con tono empatico: el modelo puede redactar respuestas a quejas o incidencias priorizando el reconocimiento de la emocion del usuario antes de aportar la solucion, gracias a la ventana de contexto del modelo base.
- Preprocesado de resenas y tickets: generacion de respuestas borrador afectivamente adecuadas para que un operador humano las revise antes de enviarlas.
- Generacion de dialogos sinteticos con carga emocional: util para aumentar datasets de entrenamiento o evaluacion en tareas de analisis de sentimiento y empatia conversacional.
- Experimentacion academica con LoRA y DPO: al ser un adaptador de 0,1 GB, permite reproducir el ciclo completo (SFT + DPO) en una sola GPU de consumo y comparar hiperparametros sin reentrenar el modelo base.
- Prototipado de asistentes personales en ingles sobre hardware modesto: el modelo fusionado en 4 bits ocupa pocos gigabytes y puede ejecutarse localmente para demos de dialogo emocional.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El model-index de la model card declara el nombre `dpo-llama-3.2-3b-instruct` con una lista de resultados vacia (`results: []`), por lo que no existen datos verificables de MMLU, HumanEval, GSM8K ni de metricas de alineamiento emocional.

## Requisitos de hardware

- VRAM para el modelo base y el adaptador sin cuantizar (fp16/bf16): aproximadamente 6,5-7 GB de pesos, mas KV cache y activaciones (del orden de 8-10 GB con contextos moderados).
- VRAM en cuantizacion de 8 bits: aproximadamente 3,5-4 GB. En 4 bits: aproximadamente 2-2,5 GB.
- Cabe en GPU de consumo: si. Funciona en RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4080 y RTX 4090 sin problema; en 4 bits puede caber en GPUs de 6-8 GB (RTX 3060 6 GB, RTX 2070) con contextos reducidos.
- GPU de datacenter: A100, H100 o L40S sobredimensionadas para este tamano; utiles solo para servir muchas peticiones concurrentes.
- Opciones de despliegue: transformers + peft (carga del adaptador sin fusionar), fusion del adaptador y exportacion a GGUF para llama.cpp u Ollama, vLLM con soporte de adaptadores LoRA, TGI. El despliegue en llama.cpp, Ollama o LM Studio requiere fusionar antes los pesos LoRA con el modelo base.
- Latencia y throughput estimados: no disponibles. No se han publicado mediciones del autor.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Metodo de alineamiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| emotional-rlaif-dpo-llama-3.2-3b-instruct (este) | 3B (LoRA sobre base 3B) | 128.000 tokens (base) | DPO con preferencias RLAIF | llama3.2 | HuggingFace, 45 descargas |
| emotional-rlaif-ppo-llama-3.2-3b-instruct | 3B (LoRA sobre base 3B) | 128.000 tokens (base) | PPO con feedback de IA | llama3.2 | HuggingFace |
| emotional-rlaif-dpo-llama-3.2-1b-instruct | 1B (LoRA sobre base 1B) | 128.000 tokens (base) | DPO con preferencias RLAIF | llama3.2 | HuggingFace |
| emotional-rlaif-dpo-gemma-2-2b-it | 2B (LoRA sobre base 2B) | 8.192 tokens (base Gemma 2) | DPO con preferencias RLAIF | Gemma | HuggingFace |
| emotional-rlaif-dpo-mistral-7b-instruct-v0.3 | 7B (LoRA sobre base 7B) | 32.768 tokens (base Mistral v0.3) | DPO con preferencias RLAIF | Apache 2.0 | HuggingFace |

No hay datos de rendimiento comparativo entre estos adaptadores en la informacion disponible; la comparacion se limita a parametros, contexto, metodo de alineamiento y licencia. Como alternativas de la misma categoria (modelos densos de 2-3B Instruct sin ajuste emocional) cabria citar Llama-3.2-3B-Instruct, Qwen2.5-3B-Instruct y Gemma-2-2B-it, para las que tampoco se aportan cifras comparativas en esta ficha.

## Limitaciones y advertencias

- No es un modelo autonomo: requiere cargar meta-llama/Llama-3.2-3B-Instruct y aplicar el adaptador con PEFT. Sin el modelo base, los pesos son inutiles.
- No hay ninguna evaluacion publicada: no existen benchmarks que respalden mejoras en inteligencia emocional frente al modelo base ni que descarten regresiones en razonamiento, codigo o matemáticas.
- Sesgos: los hereda del modelo base Llama 3.2 y, adicionalmente, de las preferencias generadas por IA del dataset aif-emotional-generation. El uso de RLAIF puede amplificar los sesgos del modelo anotador utilizado para construir las preferencias.
- Riesgo de alucinacion: presente como en cualquier modelo de 3B; el ajuste por preferencias no lo reduce y podria aumentarlo si prima la fluidez emocional sobre la exactitud.
- Idioma: el adaptador esta entrenado y declarado solo para ingles. Su uso en castellano u otros idiomas puede degradar la calidad respecto al modelo base.
- Ambito limitado: el ajuste esta orientado a dialogo emocional; su uso como asistente general, generador de codigo o motor de razonamiento no esta validado y probablemente rinda peor que el modelo base sin adaptador.
- Restricciones de licencia: se aplica la Llama 3.2 Community License, que impone condiciones (entre ellas, obligaciones de atribucion, requisitos de nombrado de productos derivados y restricciones para entidades con mas de 700 millones de usuarios mensuales). No se debe asumir uso comercial sin revisar el texto completo de la licencia.
- Caveat de produccion: al ser un adaptador LoRA, el rendimiento depende de la correcta aplicacion de la plantilla de chat `llama3`; un formateo incorrecto de los prompts degrada notablemente las respuestas.
- Madurez: 45 descargas y 0 likes indican un artefacto de investigacion sin validacion por la comunidad. La model card esta truncada y no especifica hiperparametros de entrenamiento ni detalles del dataset.
- Uso responsable: un modelo afinado para respuestas emocionalmente empaticas puede generar dependencia afectiva o reforzar estados emocionales negativos en usuarios vulnerables; requiere salvaguardas, avisos claros y supervision humana.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/mario-rc/emotional-rlaif-dpo-llama-3.2-3b-instruct
- Modelo base: https://huggingface.co/meta-llama/Llama-3.2-3B-Instruct
- Dataset de entrenamiento: https://huggingface.co/datasets/mario-rc/aif-emotional-generation
- Repositorio del proyecto: https://github.com/Mario-RC/sml-emotional-rlaif
- Adaptadores relacionados de la misma familia:
  - https://huggingface.co/mario-rc/emotional-rlaif-ppo-llama-3.2-3b-instruct
  - https://huggingface.co/mario-rc/emotional-rlaif-dpo-llama-3.2-1b-instruct
  - https://huggingface.co/mario-rc/emotional-rlaif-dpo-gemma-2-2b-it
  - https://huggingface.co/mario-rc/emotional-rlaif-dpo-gemma-2-9b-it
  - https://huggingface.co/mario-rc/emotional-rlaif-dpo-mistral-7b-instruct-v0.3
  - https://huggingface.co/mario-rc/emotional-rlaif-dpo-glm-4-9b-chat-1m
  - https://huggingface.co/mario-rc/emotional-rlaif-dpo-meta-llama-3-8b-instruct
- LLaMA-Factory (framework de entrenamiento): https://github.com/hiyouga/LLaMA-Factory
- Nota: la busqueda web no devolvio ningun resultado relevante sobre el modelo; los unicos enlaces recuperados corresponden a paginas no relacionadas sobre la franquicia de videojuegos Mario. No se dispone por tanto de papers, blogs ni demos adicionales.
