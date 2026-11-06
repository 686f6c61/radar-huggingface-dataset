# onemunanoyo/gemma4-E2B-Abliterated-V2-GGUF

## Resumen

gemma4-E2B-Abliterated-V2-GGUF es una version modificada del modelo google/gemma-4-E2B-it, publicada por el usuario onemunanoyo en Hugging Face. Se trata de un "abliterated model", es decir, un ajuste que elimina o atenua la direccion de rechazo en el espacio de activaciones del modelo para reducir las negativas a responder ante peticiones que el modelo original rechazaria. El autor lo presenta como una mejora de su version anterior (gemma4-E2B-Abliterated-GGUF), con una reduccion significativa de rechazos cuando el modo de razonamiento (thinking) esta activado.

El modelo conserva la arquitectura y el tamano del base: 4.628.569.635 parametros totales, segun los datos de safetensors del repositorio. Se distribuye unicamente en formato GGUF, con el objetivo de ejecutarse en llama.cpp y en entornos de inferencia local, y esta etiquetado para los idiomas ingles y japones. La licencia declarada es Apache 2.0.

Su relevancia es acotada y muy especifica: no es un modelo de proposito general nuevo, sino una variante de comportamiento dirigida a quienes necesitan un Gemma 4 E2B que no rechace peticiones por defecto, especialmente en japones, y que pueda desplegarse en GPU de consumo mediante cuantizacion. No hay descargas ni likes registrados en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (derivada de google/gemma-4-E2B-it; no se detalla en la model card) |
| Parametros totales | 4.628.569.635 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF: BF16, Q8_0, Q6_K, Q4_K_M (segun tabla de VRAM recomendada) |
| Idiomas soportados | en, ja |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

La model card no describe la arquitectura interna del modelo base ni el procedimiento exacto de abliteration aplicado. Por los metadatos, se trata de una modificacion de pesos sobre google/gemma-4-E2B-it, un modelo instructivo de aproximadamente 4.600 millones de parametros. El autor no publica detalles sobre que capas o direcciones fueron intervenidas, ni sobre el dataset o el metodo de calculo de la direccion de rechazo.

El unico dato tecnico de entrenamiento o evaluacion disponible es el benchmark de comportamiento de rechazo, realizado con 84 prompts adversariales privados en japones, generacion con llama.cpp build 11560, decodificacion greedy (temperatura 0), semilla fija y maximo de 4096 tokens, y evaluacion mediante el juez LiquidAI/d1-3B con tres clases (Answer, Deflect, Refusal). No se indica numero de tokens de entrenamiento, composicion del dataset ni si hubo RLHF o DPO adicional.

## Capacidades

- Generacion de texto conversacional, heredada del modelo base instructivo Gemma 4 E2B.
- Modo de razonamiento (thinking) activable y desactivable mediante `enable_thinking` en la API compatible con OpenAI o con `-rea on/off` en llama.cpp.
- Reduccion drastica de rechazos: en el benchmark del autor, con thinking activado en BF16, pasa de 68 rechazos (base) a 3; con thinking desactivado, de 73 a 0.
- Mayor tasa de respuestas efectivas (Answer) ante prompts adversariales: 79-81 sobre 84 en las configuraciones evaluadas, frente a 11-16 del base.
- Capacidad de "Deflect" (responder con una pregunta en lugar de negarse) en una minoria de casos: 1-3 sobre 84.
- Soporte multilingue limitado a ingles y japones segun los metadatos.
- No se documentan capacidades de tool calling, function calling, agentes, vision ni audio en la informacion disponible.
- Compatible con endpoints segun los tags del repositorio (`endpoints_compatible`).

## Casos de uso

- Investigacion sobre alineacion y rechazo: el modelo sirve como contraste controlado frente al base para estudiar como varia la tasa de negativas con y sin thinking, usando el mismo protocolo de evaluacion del autor.
- Evaluacion de robustez de filtros y moderacion: permite comprobar si un sistema de moderacion externo detecta respuestas que un modelo abliterated produce y el original rechazaria.
- Despliegue local en GPU de consumo: con Q4_K_M cabe en torno a 4 GB de VRAM y con Q6_K en torno a 6 GB, lo que permite ejecutarlo en tarjetas de gama media mediante llama.cpp.
- Procesamiento de texto en japones e ingles en entornos sin conectividad: al ser GGUF y ejecutable con llama-server, puede desplegarse en estaciones de trabajo aisladas.
- Generacion conversacional con control de latencia: la posibilidad de desactivar el thinking reduce el coste de generacion en tareas donde no se requiere razonamiento explicito.
- Pruebas de regresion de pipelines de inferencia: sirve para validar builds de llama.cpp con soporte de Gemma 4 y el manejo de `chat_template_kwargs.enable_thinking` en APIs compatibles con OpenAI.
- Analisis de seguridad de modelos abliterated: util para documentar que tipo de peticiones dejan de rechazarse y con que cuantizacion, dado que el autor reporta tasas similares entre BF16, Q8_0, Q6_K y Q4_K_M.

## Benchmarks y rendimiento

El unico benchmark publicado es el de comportamiento de rechazo del autor (84 prompts adversariales en japones, juez LiquidAI/d1-3B):

| Modelo | Formato | Reasoning | Refusal | Deflect | Answer |
|---|---|---|---|---|---|
| base (google/gemma-4-E2B-it) | BF16 | on | 68 | 0 | 16 |
| base | BF16 | off | 73 | 0 | 11 |
| modelo anterior (Abliterated) | BF16 | on | 55 | 0 | 29 |
| modelo anterior | BF16 | off | 2 | 1 | 81 |
| este modelo | BF16 | on | 3 | 2 | 79 |
| este modelo | BF16 | off | 0 | 3 | 81 |
| este modelo | Q8_0 | on | 3 | 1 | 80 |
| este modelo | Q6_K | on | 1 | 2 | 81 |
| este modelo | Q4_K_M | on | 2 | 2 | 80 |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K u otros) en la informacion disponible.

## Requisitos de hardware

- VRAM recomendada por el autor: 12 GB o mas para BF16; 8 GB para Q8_0; 6 GB para Q6_K; 4 GB para Q4_K_M.
- El consumo real depende del tamano de contexto y del numero de capas descargadas a GPU (`-ngl`).
- Cabe en GPU de consumo: una RTX 4090 (24 GB) admite BF16 con holgura; tarjetas de 8 GB (por ejemplo RTX 3060 Ti, RTX 4060) admiten Q8_0; tarjetas de 6 GB admiten Q6_K; tarjetas de 4 GB admiten Q4_K_M.
- Despliegue: llama.cpp (llama-server, llama-cli) con una build que soporte Gemma 4; el autor cita la build 11560. No se documentan otras opciones como vLLM, TGI u Ollama.
- API compatible con OpenAI mediante llama-server, con `chat_template_kwargs.enable_thinking` para controlar el modo de razonamiento.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Comportamiento ante rechazo | Licencia | Formato |
|---|---|---|---|---|---|
| gemma4-E2B-Abliterated-V2 (este) | 4.628.569.635 | no disponible | 0-3 rechazos / 84 con thinking off-on | apache-2.0 | GGUF |
| google/gemma-4-E2B-it (base) | no disponible en la informacion | no disponible | 68-73 rechazos / 84 | no disponible en la informacion | BF16 |
| onemunanoyo/gemma4-E2B-Abliterated (anterior) | no disponible | no disponible | 2-55 rechazos / 84 | no disponible en la informacion | BF16, GGUF |

No se dispone de datos de benchmarks de calidad general que permitan comparar con otros modelos del mismo tamano.

## Limitaciones y advertencias

- La abliteration elimina barreras de rechazo: el modelo respondera a peticiones que el base rechazaria, lo que aumenta el riesgo de generar contenido danino, ilegal o inseguro. No debe desplegarse en produccion sin moderacion externa.
- El unico benchmark es privado y no reproducible: los 84 prompts no se publican, el juez es un modelo pequeno (LiquidAI/d1-3B) y la evaluacion la realiza el propio autor.
- No hay datos de calidad general (razonamiento, codigo, matematicas) que confirmen que la abliteration no degrada capacidades; el autor no los aporta.
- Idiomas limitados a ingles y japones segun los metadatos; el rendimiento en castellano no esta documentado.
- Longitud de contexto no disponible.
- Riesgo de alucinacion no cuantificado en la informacion disponible; es un riesgo inherente a los modelos de este tamano.
- Sesgos: no documentados por el autor.
- La licencia Apache 2.0 se declara sobre una modificacion de Gemma 4 E2B; conviene verificar las condiciones de uso del modelo base de Google antes de un despliegue comercial.
- Repositorio sin descargas ni validacion de la comunidad en el momento de la consulta.
- El modelo requiere una build de llama.cpp con soporte de Gemma 4; versiones anteriores no lo cargaran.

## Enlaces

- Hugging Face: https://huggingface.co/onemunanoyo/gemma4-E2B-Abliterated-V2-GGUF
- Modelo anterior: https://huggingface.co/onemunanoyo/gemma4-E2B-Abliterated-GGUF
- Modelo base: https://huggingface.co/google/gemma-4-E2B-it
- Juez de evaluacion: https://huggingface.co/LiquidAI/d1-3B
