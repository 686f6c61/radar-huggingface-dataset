# pierremangin/olala-v1-mini-demo

## Resumen

Olala-v1.0-mini-7A1B es un modelo de lenguaje de razonamiento desarrollado por OVHcloud (a traves del repositorio OVHaiLLM) y entrenado en Europa. Se trata de un modelo hibrido que combina capas Mamba-3 con una arquitectura de mezcla de expertos (MoE), con un total de 6.800 millones de parametros de los cuales aproximadamente 1.000 millones estan activos en cada paso de inferencia. Esta ficha documenta la demo publicada por el usuario pierremangin, que expone el modelo mediante una interfaz Gradio servida a traves del proveedor de inferencia de OVHcloud en Hugging Face.

La relevancia del modelo radica en su propuesta de eficiencia: al combinar Mamba-3 (state space models) con MoE y mantener solo 1B de parametros activos, busca ofrecer capacidades de razonamiento con un coste computacional reducido en comparacion con transformers densos de tamano similar. Ademas, incorpora un modo de razonamiento configurable (reasoning effort) que permite ajustar la profundidad de la cadena de pensamiento, y expone dicha cadena de forma separada en la interfaz.

La informacion publica disponible es muy limitada: la model card accesible corresponde a la demo, no al modelo original, y no se detallan datos de entrenamiento, benchmarks ni especificaciones completas. Esta ficha refleja unicamente lo que puede verificarse en la informacion proporcionada, indicando explicitamente los datos no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Hibrida Mamba-3 / MoE (mezcla de expertos) |
| Parametros totales | 6.800 millones (6.8B) |
| Parametros activos | Aproximadamente 1.000 millones (1B) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | no disponible |

## Arquitectura y entrenamiento

El modelo emplea una arquitectura hibrida que combina capas Mamba-3, un modelo de espacio de estados (SSM) lineal, con una capa de mezcla de expertos (MoE). El resultado es un modelo de 6.8B parametros totales con aproximadamente 1B activos por token, lo que reduce el coste de inferencia frente a un transformer denso equivalente. La eleccion de Mamba-3 apunta a un escalado lineal con la longitud de secuencia, si bien no se dispone de confirmacion oficial sobre la longitud de contexto efectiva.

No se han publicado en la informacion disponible datos sobre el numero de tokens de entrenamiento, la composicion del dataset, el uso de RLHF/DPO ni las tecnicas de alineacion empleadas. Tampoco se detallan innovaciones adicionales como decodificacion especulativa o mecanismos de atencion lineal mas alla de la propia naturaleza SSM de Mamba-3. El modelo se presenta como un modelo de razonamiento, con un parametro de "reasoning effort" configurable que sugiere un entrenamiento orientado a cadenas de pensamiento de longitud variable, pero no se aportan detalles tecnicos sobre dicho entrenamiento.

## Capacidades

- Generacion de texto y razonamiento multi-paso, con un modo de cadena de pensamiento (chain-of-thought) que puede activarse y mostrarse de forma separada.
- Control del esfuerzo de razonamiento (reasoning effort) seleccionable por el usuario en la demo, lo que permite ajustar la profundidad del razonamiento.
- Conversacion multi-turno a traves de la interfaz de chat de la demo.
- Capacidades multilingues: no confirmadas en la informacion disponible.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes: no disponible en la informacion proporcionada.
- Capacidades de vision o audio: no disponibles en la informacion proporcionada.

## Casos de uso

- Razonamiento asistido con coste controlado: el modelo puede emplearse en tareas que requieren cadenas de pensamiento (problemas de logica, analisis de escenarios) ajustando el esfuerzo de razonamiento para equilibrar calidad y latencia, gracias a su diseno MoE con solo 1B de parametros activos.
- Despliegue en infraestructura europea con requisitos de soberania de datos: al estar entrenado por OVHcloud y servirse a traves de su proveedor de inferencia, encaja en organizaciones que exigen procesamiento dentro de la UE.
- Prototipado rapido de asistentes conversacionales: la demo Gradio permite evaluar el comportamiento del modelo en conversaciones multi-turno antes de integrarlo en produccion.
- Investigacion sobre arquitecturas hibridas SSM/MoE: el modelo sirve como referencia para estudiar el equilibrio entre parametros totales y activos en tareas de razonamiento.
- Evaluacion comparativa de modos de razonamiento: la posibilidad de seleccionar el esfuerzo de razonamiento permite medir el impacto de la profundidad de la cadena de pensamiento en la calidad de las respuestas.
- Integracion via Inference Providers de Hugging Face: al estar servido por el proveedor de OVHcloud, puede consumirse mediante la API de Inference Providers sin gestionar infraestructura propia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Como referencia orientativa, un modelo de 6.8B parametros en precision de 16 bits requeriria del orden de 13-14 GB solo para los pesos, pero al tratarse de una arquitectura MoE con 1B activos el coste computacional por token es menor; no se dispone de cifras verificadas para este modelo concreto.
- GPU recomendadas: no disponible en la informacion proporcionada.
- Compatibilidad con GPU de consumo: no confirmada; la demo se sirve mediante el proveedor de inferencia de OVHcloud, no en hardware local.
- Opciones de despliegue: la demo utiliza Gradio sobre el SDK de Hugging Face y el proveedor de inferencia de OVHcloud. No se confirma soporte para vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de datos de benchmarks ni de especificaciones completas (contexto, cuantizacion, rendimiento) que permitan una comparacion rigurosa con alternativas. La comparacion se limita a parametros y licencia.

| Modelo | Parametros totales | Parametros activos | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Olala-v1.0-mini-7A1B | 6.8B | ~1B | no disponible | Apache 2.0 | Hugging Face (via OVHcloud) |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- La informacion publica disponible corresponde a la demo y no a la model card oficial del modelo, por lo que faltan datos esenciales (contexto, entrenamiento, benchmarks, idiomas).
- Riesgo de alucinacion: no cuantificado; como modelo generativo de razonamiento, es esperable, pero no hay evaluaciones publicadas.
- Sesgos conocidos: no documentados en la informacion disponible.
- Limitaciones de contexto e idioma: no documentadas; no se confirma el soporte multilingue ni la ventana de contexto efectiva.
- Licencia Apache 2.0: permite uso comercial y modificacion, pero se recomienda verificar la model card oficial del modelo base (OVHaiLLM/Olala-v1.0-mini-7A1B) para condiciones adicionales.
- La demo depende del proveedor de inferencia de OVHcloud; la disponibilidad y el rendimiento en produccion pueden variar y no estan garantizados por la licencia.
- No se confirma soporte para tool calling ni para flujos de agentes, lo que limita su uso en pipelines automatizados complejos sin validacion previa.

## Enlaces

- Demo en Hugging Face: https://huggingface.co/pierremangin/olala-v1-mini-demo
- Modelo base: https://huggingface.co/OVHaiLLM/Olala-v1.0-mini-7A1B
- Inference Providers de Hugging Face: no disponible como enlace especifico en la informacion proporcionada
- Paper, blog o repositorio oficial: no disponible en la informacion proporcionada
