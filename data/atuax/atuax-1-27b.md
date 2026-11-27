# atuax/ATUAX-1-27B

## Resumen

ATUAX-1 27B es un modelo de lenguaje desarrollado por ATUA Inc. (주식회사 아투아) concebido como una "torre de control para IA": un modelo especializado en gobernanza y seguridad que evalúa las acciones que un agente de IA pretende ejecutar contra las normas internas de una organización (aprobación directa, consenso o revisión humana) y filtra tanto las preguntas entrantes como el texto saliente en busca de riesgos. Al mismo tiempo, conserva las capacidades generales de conversación y razonamiento en coreano de su modelo base.

Se trata de un ajuste fino mediante LoRA (r=16, alpha=32) fusionado sobre los pesos originales de Qwen/Qwen3.6-27B, un modelo de 27.781.427.952 parámetros (aproximadamente 27,8 mil millones) publicado bajo licencia Apache-2.0. El repositorio ocupa 55,6 GB en formato safetensors y es compatible con la librería transformers y con endpoints.

El modelo resulta relevante porque aborda un nicho poco cubierto: la capa de control y auditoría de agentes autónomos dentro de entornos corporativos. En lugar de competir por rendimiento bruto en benchmarks generales, ATUAX-1 se posiciona como un componente de seguridad y cumplimiento normativo, manteniendo a la vez un nivel de competencia general cercano al de su base (98,7%-100,3% en pruebas internas sobre KMMLU y CLIcK).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de Qwen3.6-27B); no se detalla si es densa o MoE |
| Parametros totales | 27.781.427.952 (aprox. 27,8 B) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors sin cuantizar) |
| Idiomas soportados | Coreano (ko), ingles (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

ATUAX-1 se construye sobre Qwen/Qwen3.6-27B, cuyo diseño arquitectonico exacto no se detalla en la informacion disponible, mas alla de que soporta "modo pensamiento" (thinking mode) heredado del modelo base. El ajuste se realizo mediante LoRA con rango 16 y alpha 32, y posteriormente se fusiono en los pesos originales, de modo que el formato de salida es identico al del modelo base.

El entrenamiento combino tres fuentes de datos: aproximadamente 12.000 problemas de juicio operativo, auditoria de flujos y lectura de normativa organizativa generados internamente por ATUA; unos 8.000 problemas de seguridad escritos por la propia empresa (cubriendo crisis de autolesion, peticiones de dano a terceros, odio, contenido sexual, actos ilegales, invasion de privacidad, desinformacion y discriminacion, tanto en entrada como en salida); y 4.646 ejemplos de destilacion propia a partir de preguntas en coreano de KULLM-v2 (2.397 con modo pensamiento activado y 2.249 desactivado), disenados para preservar las capacidades generales. Tambien se emplearon actas de reuniones empresariales reales, unicamente en version anonimizada. No se utilizaron preguntas de benchmarks publicos como K-AI Leaderboard en el entrenamiento. No se especifica el numero total de tokens de entrenamiento ni si se aplicaron tecnicas de RLHF o DPO.

## Capacidades

- Juicio operativo: dado un conjunto de tarjetas de normativa organizativa y una accion propuesta por un agente, emite una decision (aprobacion directa, consenso o revision humana) junto con la justificacion.
- Inspeccion de entrada: clasifica la peligrosidad de una consulta de usuario (normal, precaucion, peligro), asigna codigos de riesgo y determina el modo de respuesta.
- Inspeccion de salida: evalua el texto que un agente pretende emitir y decide si ejecutar, dejar en espera de aprobacion o bloquear, con codigos de infraccion.
- Conversacion general: mantiene el comportamiento conversacional y de razonamiento del modelo base en coreano.
- Modo pensamiento (thinking mode): soportado, heredado de Qwen3.6.
- Capacidad multimodal de entrada: las etiquetas del repositorio incluyen image-text-to-text, lo que sugiere soporte de entrada de imagenes junto a texto (no confirmado en la model card).
- Capacidades multilingues limitadas a coreano e ingles.
- Soporte de tool calling / function calling: no disponible explicitamente en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: orientado a la supervision de agentes mas que a la ejecucion autonoma.

## Casos de uso

- Supervision de agentes corporativos: el modelo recibe la normativa interna de la organizacion y la accion que un agente de IA pretende ejecutar, y devuelve una decision trazable (aprobacion, consenso o escalado a humano) con su justificacion, lo que permite auditar cada paso del agente.
- Moderacion de entrada en asistentes virtuales: clasifica las consultas de los usuarios en niveles de riesgo y activa protocolos especificos (por ejemplo, derivacion a recursos de crisis en casos de autolesion) antes de que el sistema genere una respuesta.
- Filtrado de contenido saliente: inspecciona los textos que un sistema generativo pretende publicar en un canal (correo, chat, redes) y bloquea o retiene aquellos que infringen politicas de privacidad, desinformacion o discriminacion.
- Cumplimiento normativo en pipelines de automatizacion: integrado como etapa de validacion previa a la ejecucion de acciones criticas (envio de datos, publicacion de contenido, modificacion de registros) en flujos RPA o CI/CD.
- Auditoria de decisiones: al generar codigos de infraccion y justificaciones, facilita la trazabilidad exigida en sectores regulados (finanzas, salud, administracion publica) para demostrar por que una accion se aprobo o se bloqueo.
- Asistente conversacional en coreano: para organizaciones que necesitan un chatbot general en coreano con garantias de seguridad integradas, manteniendo un rendimiento cercano al modelo base en tareas de conocimiento y razonamiento.
- Revision de politicas internas: el modelo puede leer tarjetas de normativa de una organizacion nueva y aplicar sus criterios a acciones concretas, util para desplegar el sistema en entornos con reglamentos propios.

## Benchmarks y rendimiento

Los resultados siguientes proceden de pruebas internas de ATUA (noviembre de 2026) y no han sido verificados por un organismo externo.

| Prueba | Resultado |
|---|---|
| Problemas dificiles de juicio operativo (96 items, escritos por humanos) | 99,0% |
| Juicio sobre normativa de una organizacion nueva / bloqueo excesivo | 95,5% / 7,5% |
| Deteccion de preguntas de crisis / falsos positivos en preguntas normales | 100% / 3,7% |
| Categorias de riesgo nuevas no detectadas (sexual, ilegal, privacidad, desinformacion, discriminacion) | 0,0% |
| CLIcK (modo pensamiento desactivado), respecto al modelo base | 100,3% |
| KMMLU (muestra, modo pensamiento desactivado), respecto al modelo base | 98,7% |

No se han publicado resultados de benchmarks publicos estandar (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Con 27,8 mil millones de parametros, en precision completa (bf16) se requeririan aproximadamente 55-56 GB de VRAM, coherente con el tamano del repositorio (55,6 GB).
- En cuantizacion de 8 bits se estimarian del orden de 28-30 GB; en 4 bits, del orden de 15-16 GB. Estas cifras son estimaciones orientativas, no datos publicados por el autor.
- GPU recomendadas: para bf16, A100 80 GB, H100 80 GB o configuraciones multi-GPU. Para cuantizaciones de 4-8 bits, tarjetas consumer de gama alta como RTX 4090 (24 GB) podrian ser suficientes en 4 bits.
- Despliegue: compatible con transformers y endpoints; no se confirman integraciones especificas con vLLM, llama.cpp, Ollama o TGI en la informacion disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Enfoque |
|---|---|---|---|---|
| ATUAX-1 27B | 27,8 B | no disponible | Apache-2.0 | Gobernanza y seguridad de agentes (coreano/ingles) |
| Qwen3.6-27B (base) | 27 B aprox. | no disponible | Apache-2.0 | Modelo general (referencia de partida) |
| Alternativas especializadas en guardrails de 27 B | no disponible | no disponible | no disponible | no disponible |

La comparacion con otros modelos de la misma categoria (guardrails o moderacion) no esta disponible en la informacion proporcionada. El unico punto de referencia objetivo es su modelo base, Qwen3.6-27B, sobre el que ATUAX-1 declara mantener entre el 98,7% y el 100,3% del rendimiento en KMMLU y CLIcK.

## Limitaciones y advertencias

- Las decisiones sobre crisis y contenido danino no deben delegarse unicamente en este modelo: el autor recomienda combinarlo con otras salvaguardas y revision humana.
- Los criterios de juicio estan ajustados al formato de normativa organizativa empleado en el entrenamiento; al desplegarlo en una organizacion nueva es necesario aportar su tarjeta de normativa especifica.
- Los items de las pruebas internas fueron elaborados por ATUA, por lo que no cubren toda la diversidad de expresiones reales de los usuarios; los porcentajes de rendimiento deben interpretarse con cautela.
- Riesgo de alucinacion: no evaluado en la informacion disponible.
- Sesgos conocidos: no documentados en la informacion disponible.
- Cobertura linguistica limitada a coreano e ingles; el rendimiento en castellano no esta garantizado.
- Aunque la licencia es Apache-2.0, el uso queda sujeto a la licencia del modelo base Qwen3.6-27B.
- El modelo tiene 0 descargas y 0 likes en el momento de la consulta, lo que indica ausencia de validacion por parte de la comunidad.

## Enlaces

- Hugging Face: https://huggingface.co/atuax/ATUAX-1-27B
- Modelo base: https://huggingface.co/Qwen/Qwen3.6-27B
- Dataset KULLM-v2: https://huggingface.co/datasets/nlpai-lab/kullm-v2
- Sitio del autor: www.아투아.com
