# elrashid/gate-qwen2.5-7b-instruct-l14

## Resumen

El modelo `elrashid/gate-qwen2.5-7b-instruct-l14` es una puerta de seguridad (safety gate) construida sobre el modelo base `Qwen/Qwen2.5-7B-Instruct`. No se trata de un modelo generativo en sentido estricto: es un clasificador de prompts que estima la probabilidad de que una entrada sea danina (P(harmful)) antes de que el modelo base emita el primer token de salida. Tecnicamente, aplica una regresion logistica sobre las caracteristicas de un autoencoder disperso (sparse autoencoder, SAE) extraidas del flujo residual (residual stream) de la capa 14 del transformer subyacente.

El modelo forma parte de un trabajo de tesis de master titulado "The Refusal Slope" (BUiD, University of Birmingham Dubai). Se publica junto con un SAE companero, `elrashid/sae-qwen2.5-7b-instruct-topk-l14`, que es el componente que extrae las caracteristicas interpretables sobre las que opera la regresion logistica. La propuesta es relevante porque permite filtrar prompts peligrosos en la fase de pre-generacion, evitando el coste de inferencia completo del modelo de 7B cuando la entrada ya se detecta como problematica.

El repositorio tiene un tamano de 0.0 GB, lo que sugiere que los pesos no estan alojados en el repo o que el artefacto es de muy reducido tamano (coherente con una regresion logistica sobre caracteristicas SAE). El acceso esta restringido (gated) y requiere aceptar condiciones en Hugging Face. La licencia declarada es MIT.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Clasificador (regresion logistica) sobre caracteristicas de SAE top-k de la capa 14 del residual stream de Qwen2.5-7B-Instruct |
| Parametros totales | no disponible (el artefacto es una regresion logistica; el modelo base tiene 7.6B) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (heredada del modelo base Qwen2.5-7B-Instruct, 32 768 tokens, segun especificaciones publicas del base; no confirmado para este artefacto) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | no disponible |

## Arquitectura y entrenamiento

La arquitectura del gate es un clasificador lineal (regresion logistica) que opera sobre el vector de activaciones de un SAE top-k entrenado sobre el flujo residual de la capa 14 de `Qwen/Qwen2.5-7B-Instruct`. El SAE descompone la activacion del modelo base en un conjunto disperso de caracteristicas interpretables; la regresion logistica aprende a combinar esas caracteristicas para producir una puntuacion P(harmful) a partir unicamente del prompt. El diseno busca que la decision se tome en el residual stream de una capa intermedia, antes de cualquier generacion de tokens, lo que permite un filtrado de bajo coste.

El entrenamiento se enmarca en la tesis "The Refusal Slope" (MSc, BUiD). No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset de clasificacion, ni si se emplearon tecnicas de RLHF o DPO; estos datos no estan disponibles en la informacion proporcionada. No se han documentado innovaciones adicionales como decodificacion especulativa o atencion lineal, dado que el artefacto es un clasificador y no un generador.

## Capacidades

- Clasificacion de prompts: estima P(harmful) a partir del texto de entrada, sin generar tokens.
- Filtrado pre-generacion: permite descartar prompts peligrosos antes de invocar el modelo de 7B, reduciendo coste computacional.
- Interpretabilidad: al operar sobre caracteristicas de un SAE top-k, las dimensiones activas son en principio interpretables, lo que facilita auditar por que se clasifica un prompt como danino.
- Integracion con el modelo base: pensado como capa previa a `Qwen/Qwen2.5-7B-Instruct`.
- No se documenta soporte de tool calling, function calling, agentes, vision, audio ni modo thinking: el artefacto es un clasificador, no un modelo generativo.
- Capacidades multilingues: no disponibles.

## Casos de uso

- Filtrado de entrada en produccion: colocar el gate antes de `Qwen2.5-7B-Instruct` en un pipeline de inferencia para rechazar prompts daninos sin ejecutar el modelo de 7B, ahorrando latencia y VRAM.
- Moderacion de contenido en aplicaciones de chat: puntuar cada mensaje del usuario con P(harmful) y aplicar umbrales configurables antes de permitir la generacion.
- Auditoria de seguridad e interpretabilidad: analizar que caracteristicas del SAE de la capa 14 se activan en prompts problematicos, para entender los patrones internos que disparan la clasificacion.
- Investigacion en mechanistic interpretability: usar el gate y su SAE companero como caso de estudio de como las representaciones internas de un LLM codifican senales de peligro.
- Proteccion de sistemas con agentes: como primera barrera en pipelines multi-paso donde un prompt malicioso podria desencadenar acciones no deseadas antes de llegar al planificador.
- Evaluacion comparativa de guardrails: benchmark de gates basados en SAE frente a clasificadores externos o filtros por palabras clave, midiendo coste y deteccion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- El artefacto es una regresion logistica sobre caracteristicas SAE; su inferencia requiere ejecutar el SAE y extraer activaciones de la capa 14 del modelo base Qwen2.5-7B-Instruct, por lo que el coste dominante es el forward pass parcial del modelo de 7B hasta la capa 14.
- VRAM estimada: depende de la carga del modelo base; en fp16 Qwen2.5-7B-Instruct requiere aproximadamente 15-16 GB, aunque para extraer solo la capa 14 puede reducirse si se trunca la red. No se dispone de cifras oficiales para este artefacto.
- GPU recomendadas: no disponibles de forma especifica; por el modelo base, serian adecuadas A100, H100 o RTX 4090 (24 GB) para fp16.
- Cabe en GPU de consumo: probablemente si, en RTX 4090 o superiores, al depender del modelo base.
- Opciones de despliegue: no disponibles; al ser un artefacto custom (regresion logistica sobre SAE) no se documenta soporte en vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Acceso |
|---|---|---|---|---|---|
| elrashid/gate-qwen2.5-7b-instruct-l14 | Gate/clasificador sobre SAE | no disponible (base 7.6B) | no disponible | MIT | Gated |
| Llama Guard (Meta) | Clasificador de seguridad | 8B (variantes) | no disponible en esta ficha | Llama license | Abierto |
| ShieldGemma (Google) | Clasificador de seguridad | 2B/9B/27B | no disponible en esta ficha | Gemma license | Abierto |
| Qwen/Qwen2.5-7B-Instruct | LLM generativo | 7.6B | 32 768 | Apache 2.0 | Abierto |

Los datos de Llama Guard y ShieldGemma no se han verificado en la informacion proporcionada; se incluyen como referencia de categoria y deben contrastarse antes de su uso en produccion.

## Limitaciones y advertencias

- Artefacto experimental: proviene de una tesis de master y no se ha validado en produccion; los benchmarks no estan publicados.
- Dependencia del modelo base: requiere cargar Qwen2.5-7B-Instruct (o al menos hasta la capa 14) y el SAE companero, por lo que el ahorro real depende de la implementacion.
- Sesgos: no documentados; al entrenarse sobre un dataset de clasificacion no descrito, pueden heredar sesgos del corpus y del modelo base.
- Riesgo de falsos positivos y negativos: no se han publicado tasas de error, curvas ROC ni umbrales recomendados.
- Cobertura linguistica: no disponible; no se confirma el comportamiento en castellano ni en otros idiomas.
- Licencia MIT declarada, pero el acceso es gated y el modelo base Qwen2.5-7B-Instruct tiene su propia licencia (Apache 2.0) que debe respetarse.
- Repositorio de 0.0 GB: conviene verificar que los pesos o artefactos necesarios estan efectivamente disponibles tras aceptar las condiciones.
- No apto como unico mecanismo de seguridad: debe combinarse con otras capas de defensa.

## Enlaces

- Hugging Face del gate: https://huggingface.co/elrashid/gate-qwen2.5-7b-instruct-l14
- SAE companero: https://huggingface.co/elrashid/sae-qwen2.5-7b-instruct-topk-l14
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-7B-Instruct
- DOI: https://doi.org/10.57967/hf/9431
