# kingjones777/Qwen3.6-27B-Curiosity-SuperRoc-GGUF

## Resumen

Qwen3.6-27B-Curiosity-SuperRoc-GGUF es una cuantizacion GGUF en formato ROCm-FP4 del modelo Bioaligned/Qwen3.6-27B-Curiosity, publicada por el usuario kingjones777. No se trata de un modelo entrenado desde cero, sino de una compilacion de pesos optimizada para ejecutarse en hardware AMD Strix Halo (concretamente la APU Ryzen AI Max+ 395, arquitectura gfx1151) mediante el motor de inferencia local Super Roc, desarrollado por el mismo autor. El modelo base pertenece a la familia Qwen3.6 con aproximadamente 26.900 millones de parametros, y esta variante "Curiosity" ha sido ajustada por Bioaligned.

La relevancia de esta publicacion es fundamentalmente practica: demuestra la viabilidad de ejecutar un modelo denso de ~27B parametros con una ventana de contexto de 131.072 tokens en una APU de consumo con 128 GB de memoria unificada, empleando cuantizacion de 4 bits adaptada a ROCm (ROCm-FP4) y un formato GGUF con calibracion imatrix. El autor reporta una perplejidad de 6,43 sobre un documento tecnico en ingles de 11.000 tokens (contexto 4096), practicamente identica a la del Q4_K_M estandar del mismo modelo (6,34).

El repositorio tiene un tamano de 15,1 GB, contiene un unico archivo GGUF y se distribuye bajo licencia Apache 2.0. En el momento de la consulta no registra descargas ni "likes", y la model card no documenta idiomas soportados ni resultados de benchmarks estandar (MMLU, HumanEval, GSM8K).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base de la familia Qwen3.6; esta publicacion es una cuantizacion GGUF) |
| Parametros totales | 26.895.998.464 (~26,9B) |
| Parametros activos | no aplica (no se indica que sea MoE) |
| Longitud de contexto | 131.072 tokens (contexto cargado en la medicion del autor) |
| Tipos de cuantizacion | Q4_0 con formato ROCm-FP4 (archivo unico: Qwen3.6-27B-Curiosity-Q4_0-ROCmFP4-FAST-imatrix.gguf) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (15.056.229.856 bytes; SHA256 e9c23de52a62f9c75d8687d1e144f544d56dcdaa3824b7430489c514e519bbe2) |

## Arquitectura y entrenamiento

Esta publicacion no incluye informacion sobre la arquitectura interna del modelo base ni sobre su proceso de entrenamiento (numero de tokens, composicion del dataset, RLHF/DPO). Lo unico documentado es que se trata de una cuantizacion de Bioaligned/Qwen3.6-27B-Curiosity, un modelo denso de unos 26,9B parametros, y que la cuantizacion emplea el formato ROCm-FP4 desarrollado por el equipo ROCmFPX, construido sobre llama.cpp/ggml. El archivo incorpora calibracion mediante imatrix (indicado en el nombre del archivo como "imatrix") y esta marcado como "FAST".

La innovacion tecnica destacable no reside en el entrenamiento sino en el empaquetado y el runtime: el formato ROCm-FP4 adapta la cuantizacion de 4 bits al hardware AMD, y el motor Super Roc (version 0.20.2 en las mediciones) implementa cache de prompt, prompt lookup y soporte de modo thinking activable por peticion mediante chat_template_kwargs.enable_thinking. En las pruebas del autor el drafter (decodificacion especulativa) estaba desactivado.

## Capacidades

- Generacion de texto conversacional (pipeline text-generation, etiqueta "conversational").
- Modo thinking activable por peticion (desactivado por defecto en el comando de ejemplo); no se detalla su comportamiento interno.
- Tool calling / function calling: el autor reporta 7/8 llamadas correctas en modo requerido y 7/8 en modo automatico.
- Generacion de codigo: medida a 13,8 tok/s de media en dos prompts de codigo.
- Ventana de contexto larga de hasta 131.072 tokens con cache de prompt (en la segunda vuelta se reutilizaron 6.961 de 6.985 tokens del prompt).
- Capacidades multilingues: no disponible.
- Vision, audio u otras modalidades: no disponible.

## Casos de uso

- Inferencia local en APU Strix Halo: el caso de uso principal documentado es servir el modelo con Super Roc sobre un Ryzen AI Max+ 395 con 128 GB, aprovechando la memoria unificada para cargar un GGUF de 15 GB con contexto de 131.072 tokens.
- Asistentes conversacionales de contexto largo: la ventana de 131k tokens y la cache de prompt (6.961 de 6.985 tokens reutilizados en la segunda vuelta) permiten mantener conversaciones multi-turno sobre documentos extensos sin reprocesar el historial completo.
- Automatizacion con herramientas: con 7/8 llamadas correctas en modo requerido y automatico, es adecuado para flujos donde el modelo debe invocar funciones externas (APIs, busquedas, calculos) dentro de un agente.
- Generacion de codigo en local: a ~13,8 tok/s en prompts de codigo, sirve para autocompletado y generacion asistida en entornos sin GPU dedicada, integrable en editores o scripts mediante el endpoint compatible con OpenAI que expone Super Roc en 127.0.0.1:8080.
- Procesamiento de documentacion tecnica: la perplejidad de 6,43 sobre un documento tecnico en ingles de 11.000 tokens sugiere un comportamiento estable en resumen, extraccion y preguntas sobre textos tecnicos.
- Despliegue via Lemonade: la model card documenta su uso a traves de Lemonade (lemonade pull / lemonade chat), lo que facilita probar el modelo en un stack de inferencia local ya configurado.
- Evaluacion de cuantizaciones: al publicarse junto al Q4_K_M estandar del mismo modelo (perplejidad 6,34 frente a 6,43), sirve como referencia para comparar el impacto de ROCm-FP4 frente a cuantizaciones convencionales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible. El autor unicamente reporta metricas de perplejidad y de rendimiento de inferencia:

| Metrica | Valor |
|---|---|
| Perplejidad (documento tecnico ingles de 11K tokens, contexto 4096) | 6,43 |
| Perplejidad del Q4_K_M estandar del mismo modelo | 6,34 |
| Tiempo de carga | 18 s |
| Prompt tok/s (p1k) | 604,5 |
| Prompt tok/s (p8k) | 613,4 |
| Generacion tok/s (p1k) | 14,34 |
| Generacion tok/s (p8k) | 48,91 |
| Generacion de codigo tok/s | 13,8 (media de 2 prompts) |
| Tool calls (requerido / automatico) | 7/8 / 7/8 |
| Cache de prompt, turno 2 (cacheado / tokens de prompt) | 6.961 / 6.985 |
| Contexto cargado | 131.072 tokens |
| Drafter | desactivado |

Mediciones realizadas en un Ryzen AI Max+ 395 con 128 GB, Super Roc 0.20.2, una peticion a la vez, el 2026-11-24.

## Requisitos de hardware

- VRAM/memoria: el archivo GGUF ocupa 15,06 GB; en una APU con memoria unificada se necesita ademas espacio para el contexto (131.072 tokens cargados en la medicion). En GPU dedicada, el requisito minimo practico ronda los 16 GB para pesos mas cache KV, aunque el autor no publica una cifra oficial.
- GPU/plataforma recomendada: AMD Strix Halo (Ryzen AI Max+ 395, gfx1151) con 128 GB, unico hardware en el que se han publicado mediciones.
- GPU de consumo: no se documenta compatibilidad con RTX 4090 u otras GPU NVIDIA; el formato ROCm-FP4 esta orientado a ROCm/AMD. No disponible para otras plataformas.
- Opciones de despliegue: Super Roc (motor propio del autor, con endpoint compatible con OpenAI), Lemonade (con llamacpp.rocm_bin apuntando a /opt/superroc/lemonade) y, por herencia de llama.cpp/ggml, potencialmente otros runtimes GGUF, aunque no se verifica en la model card.
- Latencia y throughput medidos: 604,5-613,4 tok/s de prompt, 14,34 tok/s de generacion con prompt de 1k y 48,91 tok/s con prompt de 8k, 13,8 tok/s en codigo, con una sola peticion concurrente.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Perplejidad (mismo test) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.6-27B-Curiosity-SuperRoc-GGUF (Q4_0 ROCm-FP4) | ~26,9B | 131.072 | 6,43 | Apache 2.0 | GGUF en HF; runtime Super Roc |
| Qwen3.6-27B-Curiosity (Q4_K_M estandar) | ~26,9B | no disponible | 6,34 | Apache 2.0 (segun modelo base) | GGUF estandar |
| Bioaligned/Qwen3.6-27B-Curiosity (pesos originales) | ~26,9B | no disponible | no disponible | Apache 2.0 (segun modelo base) | Pesos en HF |

No se dispone de datos de benchmarks que permitan comparar con otras familias de modelos del mismo tamano; la unica comparacion documentada es frente al Q4_K_M del mismo modelo.

## Limitaciones y advertencias

- No se han publicado datos sobre sesgos del modelo base ni de esta cuantizacion.
- Riesgo de alucinacion inherente a los modelos generativos; no cuantificado por el autor.
- Idiomas soportados no documentados; la unica evaluacion de perplejidad se hizo sobre un documento en ingles.
- La cuantizacion a 4 bits introduce una perdida medible: perplejidad 6,43 frente a 6,34 del Q4_K_M, es decir, un empeoramiento de aproximadamente el 1,4 % en ese test.
- El formato ROCm-FP4 y el motor Super Roc estan atados a hardware AMD Strix Halo (gfx1151); no hay evidencia de funcionamiento en GPU NVIDIA ni en otras plataformas.
- Las mediciones proceden de un unico equipo, con una sola peticion concurrente y sin drafter; el throughput en escenarios concurrentes no esta documentado.
- Repositorio sin descargas ni validacion de la comunidad en el momento de la consulta; conviene verificar el SHA256 del archivo antes de usarlo en produccion.
- Aunque la licencia declarada es Apache 2.0, la model card no detalla las condiciones del modelo base; conviene revisar la licencia de Bioaligned/Qwen3.6-27B-Curiosity antes de un uso comercial.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/kingjones777/Qwen3.6-27B-Curiosity-SuperRoc-GGUF
- Modelo base: https://huggingface.co/Bioaligned/Qwen3.6-27B-Curiosity
- Motor Super Roc: https://github.com/kingjones30/superroc
- Documentacion de Lemonade para Super Roc: https://github.com/kingjones30/superroc/blob/main/docs/LEMONADE.md
- ROCmFPX (formatos ROCm-FP4): https://github.com/charlie12345/ROCmFPX
