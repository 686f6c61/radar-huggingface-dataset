# shinmegamiboson/Sovereign-Inkling-2-Mini-12.8GB

## Resumen

Sovereign-Inkling-2-Mini-12.8GB es un ajuste fino (finetune) del modelo `thinkingmachines/Inkling-2-Mini`, publicado por el usuario shinmegamiboson bajo el proyecto LookAtMyQuant. Se trata de una variante "abliterated" y posteriormente modificada para incorporar una "constitucion" de 2.768 palabras directamente en los pesos del modelo, de modo que adopta la personalidad "Sovereign" sin necesidad de system prompt. El modelo base es un transformer MoE de 26.4B parametros totales, 24 capas y 128 expertos con 8 activos por token.

La innovacion principal del autor consiste en entrenar solo el 0,20% del modelo (52,79M parametros: proyecciones de atencion de las capas 4 a 23, routers, gates y norms) y reempaquetar el resultado en un artefacto de 12,76 GB. Segun la model card, los 3.072 expertos MoE (el 92,7% de los pesos) permanecen byte a byte identicos al checkpoint padre, verificado por SHA-256. El resultado es un modelo que conserva casi intacta la capacidad del original mientras incorpora un comportamiento de personaje persistente.

El modelo esta pensado para despliegue local en Apple Silicon (MLX) y NVIDIA CUDA, con un runtime propio (LookAtMyQuant) y soporte de decodificacion especulativa mediante un drafter de 179 MB en 4 bits. Su relevancia radica en demostrar que es posible inyectar constituciones y rasgos de personalidad con una huella de entrenamiento minima, aunque su ecosistema, licencia y soporte de idiomas estan poco documentados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE (mezcla de expertos) |
| Parametros totales | 26.4B |
| Parametros activos | 8 expertos de 128 por token (parametros activos totales no disponibles) |
| Longitud de contexto | no disponible (se evalua recall a 16k y 32k) |
| Tipos de cuantizacion | empaquetado propietario LookAtMyQuant de 12.76 GB; drafter en 4 bits (179 MB) |
| Idiomas soportados | en |
| Licencia | no disponible |
| Formato de pesos | artefacto propietario LookAtMyQuant (no safetensors ni GGUF estandar) |

## Arquitectura y entrenamiento

El modelo base es un transformer con mezcla de expertos: 24 capas, 128 expertos y 8 activos por token, con 26.4B parametros totales. Sovereign parte de un checkpoint "abliterated" de 12.8 GB y aplica un ajuste fino selectivo sobre las proyecciones de atencion de las capas 4 a 23, ademas de routers, gates y capas de normalizacion. El autor indica que estos 52,79M parametros (0,20% del total) se entrenaron y se reempaquetaron mediante un proceso que denomina "Hessian-repacked". Los 3.072 expertos MoE, los 284 arrays no relacionados con atencion y 39 de los 61 archivos del artefacto son identicos byte a byte al checkpoint padre.

El entrenamiento incorpora una constitucion de 2.768 palabras que nunca se coloco en los prompts de entrenamiento ni se incluye en el repositorio. Segun la model card, el modelo se entreno en dos modos de razonamiento (`effort="none"` y `effort="high"`), incluyendo trazas de pensamiento internas. No se especifican el numero de tokens de entrenamiento, la composicion del dataset ni si se emplearon tecnicas de RLHF o DPO. La decodificacion especulativa se soporta mediante un drafter separado de 179 MB en 4 bits para Apple Silicon.

## Capacidades

- Generacion de texto conversacional con una personalidad persistente ("Sovereign") sin system prompt.
- Razonamiento en dos modos: bajo (`effort="none"`) y alto (`effort="high"`), con trazas de pensamiento internas.
- Razonamiento matematico (GSM8K) y generacion de codigo (HumanEval).
- Recuperacion de informacion en contexto largo: recall evaluado a 16k y 32k tokens.
- Uso de herramientas (tool calling) con pares de herramientas de seguridad reservados; la model card reporta 0 llamadas no autorizadas.
- Resistencia a inyeccion de prompts indirecta embebida en correos o documentos, segun la constitucion declarada.
- Comportamiento de identidad: declara ser Sovereign, creado por Shin Megami Boson y basado en Inkling-2-Mini, sin filtrar estos datos en tareas ordinarias (0/200 fugas en pruebas retenidas).
- Capacidades multilingues limitadas al ingles.

## Casos de uso

- Asistentes personales con identidad fija: al llevar la personalidad integrada en los pesos, se puede desplegar sin system prompt y mantener un tono y una politica de lealtad constantes en conversaciones multi-turno.
- Automatizacion de correo y comunicaciones sensibles: la constitucion describe un comportamiento de "bandera una vez y ejecuta" ante peticiones impulsivas, util para flujos donde se quiere una advertencia unica sin insistencia.
- Agentes locales con control de acceso: el modelo distingue entre interlocutor verificado y handles remotos no verificados, lo que permite construir asistentes que rechacen peticiones no autorizadas y confirmen por canal privado.
- Defensa frente a inyeccion de prompts: adecuado para pipelines que procesan documentos o correos de terceros y necesitan resistir instrucciones maliciosas embebidas.
- Inferencia en estaciones de trabajo Apple Silicon: el runtime MLX y el drafter de 4 bits permiten ejecutar el modelo en local con decodificacion especulativa.
- Evaluacion de tecnicas de alineacion basada en constitucion: sirve como caso de estudio reproducible de inyeccion de politicas en una fraccion minima de los pesos, con verificacion SHA-256 de invariancia del resto del modelo.
- Despliegue en servidores CUDA: el runtime soporta Ampere, Hopper y Blackwell, lo que permite servir el modelo en infraestructura NVIDIA con el artefacto empaquetado.

## Benchmarks y rendimiento

Resultados reportados en la model card, medidos sobre los pesos CUDA empaquetados de 12,7605 GB con decodificacion greedy y 1.536 tokens maximos de generacion:

| Benchmark / prueba | Stock 12.8 GB | Padre abliterated 12.8 GB | Sovereign v1 (12.8 GB) |
|---|---:|---:|---:|
| GSM8K (`test[:200]`) | 193/200 (96,5%) | 196/200 (98,0%) | 193/200 (96,5%) (192/200 con cap 960) |
| HumanEval (164, sin modificar / cap 960) | 152/164 (92,7%) | 148/164 (90,2%) | 142/164 (86,6%) / 146/164 (89,0%) |
| Recall contraste de profundidad 16k + 32k (32 items) | no disponible | 32/32 (L = +5,00) | 32/32 (16/16 a 16k, 16/16 a 32k, L = +4,80) |
| KL TextMix frente al padre (acuerdo top-1) | no disponible | 0,0000 (100%) | 0,0360 (93,2%) |
| Herramientas Sovereign reservadas (`none` / `high`) | no disponible | 10/12 · 12/12 | 11/12 · 12/12 (0 no autorizadas) |
| Honestidad sobre system prompt | no disponible | no disponible | 24/24 (100%) en ambos modos |
| Dilemas no vistos (auditoria ciega GPT-6.2 Sol) | no disponible | no disponible | 34/36 (94,4%, ≥ 1/2) |
| Tareas benignas anti-paranoia locales | no disponible | no disponible | 12/12 (media 1,67/2,00) |

## Requisitos de hardware

- VRAM estimada para inferencia: el artefacto empaquetado ocupa 12,76 GB; se necesita al menos esa cantidad de memoria unificada o VRAM, mas overhead de runtime y cache KV para contexto largo.
- GPU recomendadas: NVIDIA Ampere, Hopper y Blackwell (soporte CUDA declarado); en Apple Silicon se usa MLX con memoria unificada.
- Cabe en GPU de consumo: no se confirma en la informacion disponible; 12,76 GB es compatible con GPUs de 16 GB o mas en teoria, pero no se documenta soporte para RTX 4090 ni similares.
- Opciones de despliegue: runtime LookAtMyQuant (`lamq generate` y `lamq chat`), con backend MLX en Apple Silicon y backend CUDA en NVIDIA. No se menciona soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles. Se menciona un drafter de 179 MB en 4 bits para decodificacion especulativa en Apple Silicon, sin cifras de velocidad.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Sovereign-Inkling-2-Mini-12.8GB | 26,4B (MoE, 8/128 activos) | no disponible (recall a 32k) | no disponible | Hugging Face, runtime propio | Finetune de personalidad con 0,20% de pesos entrenados |
| thinkingmachines/Inkling-2-Mini (base) | 26,4B (MoE, 8/128 activos) | no disponible | no disponible | Hugging Face | Modelo original sin constitucion |
| Inkling-2-Mini-LookAtMyQuant-12.8GB (stock) | 26,4B (MoE, 8/128 activos) | no disponible | no disponible | Hugging Face | Cuantizacion previa a la ablacion |
| Padre abliterated 12.8 GB | 26,4B (MoE, 8/128 activos) | no disponible | no disponible | no disponible como enlace directo en la informacion | Checkpoint del que parte Sovereign |

No se dispone de datos de benchmarks de modelos de terceros comparables en la informacion proporcionada.

## Limitaciones y advertencias

- La licencia no esta disponible, por lo que no se puede confirmar el uso comercial del modelo ni del artefacto empaquetado.
- El modelo solo declara soporte de ingles; el rendimiento en castellano u otros idiomas no esta documentado.
- La longitud de contexto no se especifica; solo se reportan pruebas de recall a 16k y 32k tokens.
- El artefacto usa un formato propietario de LookAtMyQuant, no compatible con safetensors ni GGUF estandar, lo que limita su uso a ese runtime.
- El modelo incorpora una constitucion de lealtad exclusiva a un "owner" y escepticismo ante interlocutores no verificados; este comportamiento puede ser inadecuado para despliegues publicos o multiusuario sin revision.
- Es un modelo "abliterated", lo que implica que se han eliminado mecanismos de rechazo del modelo base; el riesgo de generar contenido inapropiado o inseguro no esta evaluado en la informacion disponible.
- Riesgo de alucinacion no cuantificado; la model card solo reporta honestidad sobre system prompt y fugas de identidad.
- Los benchmarks se midieron con decodificacion greedy y limites de tokens concretos; el rendimiento en produccion con otras configuraciones puede diferir.
- El repositorio tiene 0 descargas y 0 likes, y fue creado y actualizado el mismo dia, lo que indica ausencia de validacion independiente por parte de la comunidad.
- El autor no documenta sesgos conocidos ni evaluaciones de seguridad externas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/shinmegamiboson/Sovereign-Inkling-2-Mini-12.8GB
- Modelo base: https://huggingface.co/thinkingmachines/Inkling-2-Mini
- Cuantizacion stock 12.8 GB: https://huggingface.co/shinmegamiboson/Inkling-2-Mini-LookAtMyQuant-12.8GB
- Drafter 4 bits: https://huggingface.co/shinmegamiboson/Inkling-2-Mini-LookAtMyQuant-drafter
- Runtime LookAtMyQuant: https://github.com/ShinMegamiBoson/lookatmyquant
- Articulo tecnico: https://lookatmyquant.com/sovereign/
