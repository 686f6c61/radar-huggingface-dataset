# craftloop-ai/hinglish-prompt-guard

## Resumen

Hinglish Prompt Guard es un clasificador binario de seguridad para LLM desarrollado por Craftloop AI, un proyecto open source centrado en seguridad de IA para lenguas de la India. El modelo detecta intentos de prompt injection y jailbreak en ingles, hinglish (mezcla de hindi y ingles habitual en la India) e hindi, etiquetando cada entrada como `SAFE` o `INJECTION` antes de que llegue al modelo generativo. Se presenta como alternativa a guardas entrenadas solo en ingles, que segun la model card bloquean erroneamente un 31,5% de peticiones normales en hinglish.

Tecnicamente es un fine-tuning completo de `microsoft/mdeberta-v3-base`, un transformer encoder de tipo DeBERTa-v3 con aproximadamente 278,8 millones de parametros. La longitud maxima de entrada utilizada en entrenamiento e inferencia es de 256 tokens. El modelo resuelve un problema acotado pero critico en produccion: filtrar instrucciones maliciosas (override de instrucciones, extraccion de system prompt, exfiltracion de datos, jailbreaks estilo DAN) en un segmento linguistico poco cubierto por las herramientas de seguridad habituales.

Su relevancia actual radica en dos factores: por un lado, la adopcion masiva de asistentes LLM en la India, donde el hinglish es la forma dominante de interaccion informal; por otro, la escasez de guardrails multilingues open source con licencia permisiva. El modelo se distribuye bajo licencia MIT, con pesos en safetensors y un repositorio de 2,2 GB, y esta pensado como una capa mas de defensa, no como solucion unica.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (DeBERTa-v3, base `microsoft/mdeberta-v3-base`) |
| Parametros totales | 278.810.882 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 256 tokens (longitud maxima usada en entrenamiento e inferencia) |
| Tipos de cuantizacion | fp32 y fp16 soportadas; int8 dinamica probada pero desaconsejada por el autor (caida de F1 en hinglish de 0,97 a 0,51) |
| Idiomas soportados | en, hi (incluye hinglish) |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de `microsoft/mdeberta-v3-base`, un encoder DeBERTa-v3 multilingue de unos 280 millones de parametros, y aplica un fine-tuning completo para clasificacion binaria de secuencias. La cabeza de clasificacion produce dos etiquetas, `SAFE` e `INJECTION`. El entrenamiento se realizo durante 2 epocas con learning rate 2e-5, batch size 16, longitud maxima de 256 tokens y precision fp16 sobre una GPU Colab T4.

El conjunto de datos, tras deduplicacion y eliminacion de fugas entre splits, queda en 15.329 ejemplos de entrenamiento, 1.333 de validacion y 2.273 de test. Las fuentes son `xTRam1/safe-guard-prompt-injection`, `jackhhao/jailbreak-classification`, `TrustAIRLab/in-the-wild-jailbreak-prompts` (con 5.000 prompts regulares muestreados), el split de entrenamiento de `deepset/prompt-injections` y el dataset propio `craftloop-ai/hinglish-prompt-injection`. El split de test de deepset nunca se uso en entrenamiento.

La innovacion principal no es arquitectonica sino de cobertura y criterio de etiquetado. La version v2 anadio el split de entrenamiento de deepset y patrones de ataque cortos del tipo "elogio + olvida todo + nueva tarea", que la v1 no cubria: el recall sobre deepset paso de 0,12 a 0,58. Ademas, el modelo define explicitamente su alcance: bloquea override de instrucciones, extraccion de prompt o secretos y robo de datos, pero no bloquea peticiones de persona ("actua como narrador") ni cambios de tema, que otros benchmarks etiquetan como injection.

## Capacidades

- Clasificacion binaria de texto (`SAFE` / `INJECTION`) orientada a filtrar entradas antes de un LLM.
- Deteccion de instruction override ("ignore previous instructions" y equivalentes en hinglish e hindi).
- Deteccion de intentos de extraccion de prompt de sistema o secretos.
- Deteccion de intentos de robo de datos.
- Deteccion de jailbreaks estilo DAN y variantes de role-play malicioso.
- Cobertura multilingue de en, hi y hinglish en una sola pasada.
- No soporta tool calling ni function calling: no es un modelo generativo.
- No soporta agentes ni razonamiento multi-step: es un clasificador de una sola pasada.
- No tiene modo thinking, vision ni audio.
- Inferencia rapida en CPU: aproximadamente 390 ms por prompt en una CPU Colab de 2 nucleos en fp32.

## Casos de uso

- Filtro de entrada en asistentes conversacionales: colocar el clasificador delante del LLM para rechazar peticiones de override o extraccion de system prompt antes de consumir tokens de generacion, con latencia de unos 390 ms en CPU.
- Atencion al cliente en hinglish: desplegar como pre-filtro en chatbots de banca, telco o e-commerce dirigidos a usuarios indios que escriben en hinglish, evitando el alto falso positivo de guardas solo en ingles (31,5% en el test del autor).
- Proteccion de aplicaciones RAG: clasificar la consulta del usuario antes de recuperar documentos, de modo que intentos de exfiltracion de datos o de manipulacion del contexto recuperado se bloqueen en la capa de entrada.
- Moderacion de prompts en plataformas de terceros: integrar en APIs que exponen un LLM a desarrolladores externos para auditar y bloquear prompts maliciosos de forma centralizada.
- Capa de defensa en pipelines de agentes: usar el guard como primer eslabon de una cadena de seguridad junto con comprobaciones de salida y permisos minimos en las herramientas del agente, tal como recomienda el autor.
- Evaluacion y red teaming: emplear el clasificador como baseline para medir la eficacia de otros guardrails o para etiquetar automaticamente conjuntos de prompts en estudios de seguridad en lenguas indias.
- Cumplimiento y auditoria: registrar y clasificar prompts entrantes para detectar patrones de ataque recurrentes en produccion, con salida binaria facil de agregar en dashboards.

## Benchmarks y rendimiento

| Conjunto de test | Modelo | Precision | Recall | F1 | Tasa de falsos positivos |
|---|---|---|---|---|---|
| Hinglish unseen (356) | protectai small v2 | 0,673 | 0,646 | 0,659 | 31,5% |
| Hinglish unseen (356) | este modelo (v2) | 1,000 | 0,938 | 0,968 | 0,0% |
| deepset test, EN/DE (116) | protectai small v2 | 0,929 | 0,433 | 0,591 | 3,6% |
| deepset test, EN/DE (116) | este modelo (v2) | 0,972 | 0,583 | 0,729 | 1,8% |
| In-distribution test (2.269) | protectai small v2 | 0,877 | 0,733 | 0,799 | 3,9% |
| In-distribution test (2.269) | este modelo (v2) | 0,950 | 0,918 | 0,934 | 1,8% |

El autor advierte que el conjunto in-distribution procede de la misma mezcla que el entrenamiento y por tanto favorece a este modelo; las filas de hinglish unseen y deepset son las comparaciones justas. El conjunto hinglish unseen es disjunto en plantillas respecto al entrenamiento. El test de deepset contiene solo 60 ataques, por lo que la cobertura en aleman es debil.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1,1 GB en fp32 (278,8 M de parametros) y unos 0,6 GB en fp16; con overhead de runtime, entre 1 y 2 GB.
- GPU recomendadas: cualquier GPU consumer moderna es suficiente; el autor entreno en una T4 de Colab y no se requieren A100 ni H100.
- Cabe holgadamente en GPU consumer: RTX 3060, RTX 4060, RTX 4090, e incluso en CPU.
- Despliegue: pipeline de `transformers` con `truncation=True, max_length=256`; tambien es viable servirlo con TGI o con un runtime ONNX. No se recomienda cuantizacion int8 dinamica por la caida de F1 en hinglish.
- Latencia: aproximadamente 390 ms por prompt en una CPU Colab de 2 nucleos en fp32; en GPU la latencia sera muy inferior, aunque el autor no publica cifras de throughput.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | F1 hinglish unseen | F1 deepset | Licencia | Idiomas |
|---|---|---|---|---|---|---|
| craftloop-ai/hinglish-prompt-guard | 278,8 M | 256 | 0,968 | 0,729 | MIT | en, hi, hinglish |
| protectai/deberta-v3-small-prompt-injection-v2 | no disponible (base small) | no disponible | 0,659 | 0,591 | no disponible en la informacion | en |
| Guardas generativas tipo Llama Guard | miles de millones | varios miles | no disponible | no disponible | no disponible en la informacion | multilingue |

La comparacion directa publicada por el autor es contra `protectai/deberta-v3-small-prompt-injection-v2`, sobre los mismos conjuntos de test. La ventaja principal de este modelo es la cobertura de hinglish con tasa de falsos positivos nula en el conjunto unseen, a costa de un modelo algo mayor (base frente a small). No se dispone de datos comparativos frente a guardas generativas en la informacion proporcionada.

## Limitaciones y advertencias

- Los datos de entrenamiento y test en hinglish son sinteticos; el rendimiento en trafico real sera inferior al reportado.
- El test de deepset es pequeno (60 ataques) y la cobertura de aleman es debil.
- No es robusto frente a atacantes adaptativos determinados; debe usarse como una capa mas de defensa, junto con comprobaciones de salida y permisos minimos en herramientas.
- La cuantizacion int8 dinamica degrada gravemente el F1 en hinglish (de 0,97 a 0,51) y no se recomienda.
- Los datos de entrenamiento incluyen `xTRam1/safe-guard-prompt-injection`, sin licencia declarada y generado con GPT-3.5; conviene revisar las licencias de los datos antes de un uso comercial, aunque los pesos se publican bajo MIT.
- El modelo no bloquea peticiones de persona ni cambios de tema por diseno, lo que puede generar discrepancias con benchmarks que etiquetan esos casos como injection.
- La ventana de 256 tokens implica que prompts muy largos se truncan; un ataque colocado mas alla del token 256 no sera evaluado.
- Riesgo de alucinacion no aplica en sentido generativo, pero si de clasificacion erronea (falsos negativos en ataques novedosos).

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/craftloop-ai/hinglish-prompt-guard
- Organizacion Craftloop AI: https://huggingface.co/craftloop-ai
- Dataset propio: https://huggingface.co/datasets/craftloop-ai/hinglish-prompt-injection
- Modelo base: https://huggingface.co/microsoft/mdeberta-v3-base
- Dataset xTRam1/safe-guard-prompt-injection: https://huggingface.co/datasets/xTRam1/safe-guard-prompt-injection
- Dataset jackhhao/jailbreak-classification: https://huggingface.co/datasets/jackhhao/jailbreak-classification
- Dataset TrustAIRLab/in-the-wild-jailbreak-prompts: https://huggingface.co/datasets/TrustAIRLab/in-the-wild-jailbreak-prompts
- Dataset deepset/prompt-injections: https://huggingface.co/datasets/deepset/prompt-injections
- Modelo comparado protectai/deberta-v3-small-prompt-injection-v2: https://huggingface.co/protectai/deberta-v3-small-prompt-injection-v2
