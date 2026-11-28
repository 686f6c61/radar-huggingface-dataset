# shinmegamiboson/Sovereign-Inkling-2-Mini-12.8GB

## Resumen

Sovereign es un ajuste fino del modelo `thinkingmachines/Inkling-2-Mini`, un transformer de tipo Mixture of Experts con 26.400 millones de parametros totales, 24 capas y 128 expertos de los que se activan 8 por token. El autor, shinmegamiboson, lo distribuye como un artefacto cuantizado de 12,8 GB bajo el runtime propio LookAtMyQuant, compatible con Apple Silicon (MLX) y con GPUs NVIDIA Ampere, Hopper y Blackwell mediante CUDA.

La particularidad del modelo es que incorpora una "constitucion" de 2.768 palabras directamente en los pesos, de modo que adopta la persona Sovereign sin necesidad de system prompt. Segun la model card, solo se entrenaron 52,79 millones de parametros (el 0,20% del total): las proyecciones de atencion de las capas 4 a 23, mas routers, gates y normas. Los 3.072 expertos MoE, que representan el 92,7% de los pesos, son identicos byte a byte (SHA-256) al checkpoint abliterado previo de 12,8 GB.

El modelo esta pensado para despliegues de personaje y asistente personal con un unico "principal" (el propietario), con enfasis en resistencia a inyecciones de prompt, honestidad sobre su identidad y memoria durable mediante herramientas. Es relevante ahora porque demuestra una tecnica de "horneado" de comportamiento en una fraccion minima de los pesos sin degradar de forma sustancial las capacidades generales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer Mixture of Experts (24 capas, 128 expertos, 8 activos por token) |
| Parametros totales | 26.400 millones (26,4B) |
| Parametros activos | 8 de 128 expertos por token (numero exacto de parametros activos no disponible) |
| Longitud de contexto | No disponible (se han validado tareas de recall a 16k y 32k tokens) |
| Tipos de cuantizacion | Artefacto empaquetado de 12,76 GB (esquema de cuantizacion no detallado); drafter separado de 4 bits (179 MB) |
| Idiomas soportados | Ingles (en) |
| Licencia | No disponible |
| Formato de pesos | Empaquetado propietario del runtime LookAtMyQuant (no safetensors ni GGUF estandar) |

## Arquitectura y entrenamiento

Sovereign parte de `thinkingmachines/Inkling-2-Mini`, un transformer MoE de 26,4B parametros con 24 capas y 128 expertos (8 activos por token). El ajuste fino congela la practica totalidad de la red y entrena unicamente 52,79 millones de parametros: las proyecciones de atencion de las capas 4 a 23, los routers y gates del MoE, y las normas. Posteriormente, esos pesos se reempaquetan con un procedimiento basado en Hessianos ("Hessian-repacked") dentro del artefacto de 12,76 GB. La model card certifica que los 3.072 expertos MoE, los 284 arrays no relacionados con atencion y 39 de los 61 ficheros son identicos por SHA-256 al checkpoint abliterado de partida.

El entrenamiento se realizo en dos modos de razonamiento (`effort="none"` y `effort="high"`), incluyendo trazas de pensamiento internas, y la constitucion nunca aparecio en los prompts de entrenamiento: se uso solo durante la generacion de datos sinteticos. El modelo soporta decodificacion especulativa mediante un drafter de 4 bits de 179 MB. La divergencia respecto al modelo padre se mide con un KL de 0,0360 nats sobre TextMix y un 93,2% de acuerdo en top-1 con el padre, lo que indica un cambio de comportamiento acotado.

## Capacidades

- Generacion de texto y conversacion multi-turno en ingles.
- Razonamiento en dos modos: bajo (`effort="none"`) y alto (`effort="high"`), con trazas internas de pensamiento.
- Ajuste fino de codigo y matematicas: 193/200 en GSM8K y 142-146/164 en HumanEval segun el limite de tokens de pensamiento.
- Recall de contexto largo verificado a 16k y 32k tokens (32/32 en pruebas de contraste de profundidad).
- Comportamiento de persona "Sovereign" sin system prompt: identidad fija, lealtad a un unico propietario y escepticismo ante interlocutores no verificados.
- Resistencia a inyecciones de prompt indirectas embebidas en correos o documentos, segun las pruebas de la model card.
- Uso de herramientas y directorios durables para evitar adivinar contactos o datos ambiguos (pares de herramientas de seguridad evaluados: 11/12 en modo bajo, 12/12 en modo alto, con 0 llamadas no autorizadas).
- Honestidad sobre el system prompt: 24/24 en ambos modos de razonamiento.
- Capacidades multilingues limitadas al ingles.

## Casos de uso

- Asistente personal de un unico propietario: el modelo mantiene lealtad exclusiva al principal y puede desplegarse en la maquina local del usuario sin system prompt, rechazando peticiones de interlocutores no verificados gracias a su constitucion horneada.
- Proteccion frente a phishing e inyeccion de prompt: al procesar correos o documentos, el modelo detecta instrucciones indirectas no autorizadas y confirma por un canal privado antes de actuar, un escenario validado con los pares de herramientas de seguridad de la model card.
- Agente local en Apple Silicon: con el runtime LookAtMyQuant y el drafter de 4 bits de 179 MB, puede ejecutarse en un Mac con memoria unificada suficiente para el artefacto de 12,76 GB, sirviendo como asistente conversacional con `lamq serve` y UI web en el puerto 8080.
- Despliegue en estaciones NVIDIA: en GPUs Ampere, Hopper o Blackwell mediante `lookatmyquant[cuda]`, adecuado para entornos de investigacion que necesiten un modelo de personaje con razonamiento de alto esfuerzo y contexto de 32k.
- Automatizacion de tareas con matematicas y codigo: con 96,5% en GSM8K y hasta 89,0% en HumanEval bajo limite de 960 tokens de pensamiento, puede integrarse en pipelines de generacion y revision de codigo en ingles.
- Investigacion sobre alineacion y "constituciones horneadas": el modelo sirve como caso de estudio reproducible para medir cuanto comportamiento se puede fijar entrenando solo el 0,20% de los parametros, con el checkpoint abliterado como ablacion cientifica.
- Recuperacion sobre documentos largos: sus 32/32 en recall a 16k y 32k tokens permiten usarlo para preguntas sobre contratos, informes o bases de conocimiento extensas en ingles.

## Benchmarks y rendimiento

Resultados medidos sobre los pesos CUDA empaquetados de 12,7605 GB, decodificacion greedy y 1.536 tokens nuevos maximos (salvo donde se indique limite de 960):

| Benchmark / prueba | Stock 12,8 GB | Padre abliterado 12,8 GB | Sovereign v1 |
|---|---:|---:|---:|
| GSM8K (`test[:200]`) | 193/200 (96,5%) | 196/200 (98,0%) | 193/200 (96,5%) |
| HumanEval (164, sin limite / limite 960) | 152/164 (92,7%) | 148/164 (90,2%) | 142/164 (86,6%) / 146/164 (89,0%) |
| Recall contraste 16k + 32k (32 items) | no disponible | 32/32 (L = +5,00) | 32/32 (L = +4,80) |
| Dilemas ineditos (auditoria GPT-6.2 Sol) | no disponible | no disponible | 34/36 (94,4%) |
| Tareas anti-paranoia benignas | no disponible | no disponible | 12/12 (media 1,67/2,00) |
| Pares de herramientas de seguridad | no disponible | no disponible | 11/12 (effort none), 12/12 (effort high) |
| Honestidad sobre system prompt | no disponible | no disponible | 24/24 en ambos modos |
| KL TextMix vs. padre | no disponible | no disponible | 0,0360 nats (93,2% top-1) |

## Requisitos de hardware

- VRAM/memoria: el artefacto empaquetado ocupa 12,7605 GB; se necesita algo mas para el contexto KV y el drafter de 4 bits (179 MB). Presupuesto practico de 16 GB o mas de memoria dedicada o unificada.
- Apple Silicon: soportado via MLX con `pip install git+https://github.com/ShinMegamiBoson/lookatmyquant.git`; requiere un Mac con memoria unificada suficiente para el artefacto completo.
- NVIDIA: soportado en Ampere, Hopper y Blackwell con `pip install "lookatmyquant[cuda] @ git+https://github.com/ShinMegamiBoson/lookatmyquant.git"`. Una RTX 4090 (24 GB) encaja por VRAM; A100 y H100 tambien son adecuadas.
- GPU consumer: cabe en tarjetas de 16 GB o mas, como RTX 4080/4090 o equivalentes; no cabe en GPUs de 8-12 GB.
- Despliegue: exclusivamente mediante el runtime LookAtMyQuant (`lamq generate`, `lamq chat`, `lamq serve --port 8080 --ui`). No hay soporte documentado para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles en la informacion proporcionada. La decodificacion especulativa con el drafter de 4 bits esta soportada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato / runtime | Notas |
|---|---|---|---|---|---|
| Sovereign (Inkling-2-Mini, 12,8 GB) | 26,4B MoE (8/128 activos) | No disponible (validado a 32k) | No disponible | LookAtMyQuant (MLX/CUDA) | Persona horneada, abliterado, solo ingles |
| Inkling-2-Mini (stock 12,8 GB) | 26,4B MoE | No disponible | No disponible | LookAtMyQuant | Sin persona; GSM8K 96,5%, HumanEval 92,7% |
| Inkling-2-Mini (padre abliterado) | 26,4B MoE | No disponible | No disponible | LookAtMyQuant | Etapa intermedia sin publicacion en HF; GSM8K 98,0% |
| `thinkingmachines/Inkling-2-Mini` (base) | 26,4B MoE | No disponible | No disponible | No disponible | Modelo original de Thinking Machines |

No se dispone de datos sobre otros modelos comparables de la misma categoria en la informacion proporcionada.

## Limitaciones y advertencias

- Solo soporta ingles; no hay capacidades multilingues documentadas.
- La licencia no esta disponible, por lo que no puede confirmarse el uso comercial. El modelo base pertenece a Thinking Machines y el ajuste a shinmegamiboson; conviene verificar ambas licencias antes de produccion.
- Es un modelo abliterado: se ha eliminado el rechazo entrenado del modelo base, lo que aumenta el riesgo de generar contenido danino si se usa fuera del marco de lealtad al propietario.
- La persona "Sovereign" declara lealtad exclusiva a un propietario por encima de su propio creador; este comportamiento, aunque intencionado, puede ser inadecuado para despliegues multiusuario o corporativos.
- Riesgo de alucinacion inherente a los LLM; la model card no aporta metricas de factualidad.
- Dependencia total del runtime LookAtMyQuant: no hay pesos en safetensors ni GGUF, lo que limita la portabilidad a vLLM, llama.cpp, Ollama o TGI.
- El ajuste toca solo el 0,20% de los parametros; comportamientos fuera de la constitucion dependen integramente del modelo base y de su calidad.
- La evaluacion de comportamiento (dilemas, anti-paranoia) fue auditada con un rubricador automatico (GPT-6.2 Sol) y sobre conjuntos pequenos (36 dilemas, 12 tareas), por lo que la significacion estadistica es limitada.
- El rendimiento en HumanEval cae respecto al modelo stock (142-146 frente a 152 de 164), lo que sugiere cierta degradacion en codigo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/shinmegamiboson/Sovereign-Inkling-2-Mini-12.8GB
- Modelo base: https://huggingface.co/thinkingmachines/Inkling-2-Mini
- Build stock de 12,8 GB: https://huggingface.co/shinmegamiboson/Inkling-2-Mini-LookAtMyQuant-12.8GB
- Drafter de 4 bits: https://huggingface.co/shinmegamiboson/Inkling-2-Mini-LookAtMyQuant-drafter
- Runtime LookAtMyQuant: https://github.com/ShinMegamiBoson/lookatmyquant
- Articulo tecnico: https://lookatmyquant.com/sovereign/
