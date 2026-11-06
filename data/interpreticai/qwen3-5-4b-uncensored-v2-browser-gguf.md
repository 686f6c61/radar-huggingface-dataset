# InterpreticAI/Qwen3.5-4B-Uncensored-v2-Browser-GGUF

## Resumen

Qwen3.5-4B-Uncensored-v2-Browser-GGUF es una compilacion cuantizada en formato GGUF del modelo InterpreticAI/Qwen3.5-4B-Uncensored-v2, un transformer denso de 4.326.350.848 parametros afinado para reducir el rechazo de peticiones y la censura en las respuestas. El autor, InterpreticAI, publica esta variante especifica orientada a inferencia en navegador y en dispositivo (WebAssembly/WebGPU mediante runtimes como wllama, y moviles con aproximadamente 2 GB de memoria disponible), con un unico fichero de pesos de 1,86 GB en cuantizacion IQ3_XXS.

La relevancia de esta build radica en el compromiso entre tamano y comportamiento: mantiene buena parte de la reduccion de censura del modelo base (11 de 51 items de Pan y Xu respondidos sin censura, frente a 11 del BF16 y 47 del Qwen3.5-4B original) a costa de una perdida notable de capacidad general, con MMLU bajando de 72,7 en el original a 63,0 en esta cuantizacion IQ3_XXS. Incluye ademas un proyector multimodal opcional (mmproj en F16, 0,67 GB) que habilita entrada de imagen.

El modelo se distribuye bajo licencia Apache 2.0, con pipeline de text-generation y compatibilidad declarada con llama.cpp y endpoints. La model card recomienda un contexto de 4096 tokens o menos en telefonos y sugiere usar la variante Q4_K_M cuando la memoria lo permita.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (derivado de Qwen3.5-4B); detalles de atencion no disponibles |
| Parametros totales | 4.326.350.848 |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible en la informacion; se recomienda 4096 tokens o menos en telefonos |
| Tipos de cuantizacion | IQ3_XXS (texto, 1,86 GB); proyector multimodal F16 (0,67 GB); el modelo base ofrece Q4_K_M (2,78 GB) y BF16 (8,67 GB) |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (llama.cpp); fichero mmproj separado para vision |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna mas alla de que se trata de un transformer denso de 4.326 millones de parametros derivado de Qwen3.5-4B. El modelo base InterpreticAI/Qwen3.5-4B-Uncensored-v2 es un afinamiento orientado a reducir la censura y el rechazo de peticiones; la model card reporta metricas de rechazo de peticiones daninas (93 sobre 100 en BF16, 95 en Q4_K_M y 89 en esta build IQ3_XXS) y de respuestas censuradas en items de Pan y Xu (11 de 51 en BF16 y en IQ3_XXS, frente a 47 en el modelo original). No se especifican el numero de tokens de entrenamiento, la composicion del dataset ni si se emplearon tecnicas de RLHF o DPO.

La innovacion practica de esta publicacion es la compilacion GGUF en IQ3_XXS para ejecucion en navegador y dispositivos con memoria limitada, junto con un proyector multimodal opcional que permite entrada de imagen. La model card advierte que el coste principal de esta cuantizacion agresiva es la capacidad general: MMLU cae unos 9 puntos y las respuestas largas repiten o no terminan con mas frecuencia (24 respuestas degeneradas sobre 110 prompts neutros, frente a 8 en el original).

## Capacidades

- Generacion de texto conversacional multi-turno (tag `conversational`).
- Entrada de imagen opcional mediante el proyector `mmproj-Qwen3.5-4B-Uncensored-v2-F16.gguf`.
- Reduccion de censura y de rechazo de peticiones respecto al modelo original, segun las metricas de la model card.
- Inferencia en navegador mediante WebAssembly/WebGPU (wllama) y en dispositivos moviles.
- Compatibilidad con llama.cpp (`llama-server` con `--jinja`).
- Soporte de tool calling / function calling: no disponible en la informacion.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion.
- Capacidades multilingues: no disponible en la informacion.
- Modo thinking: la model card menciona evaluacion "non-thinking" para MMLU, pero no detalla un modo thinking explicito.

## Casos de uso

- Chat en navegador sin backend: el fichero IQ3_XXS de 1,86 GB permite cargar el modelo en un runtime WebAssembly/WebGPU como wllama y ejecutar conversaciones localmente sin enviar datos a un servidor, adecuado para demos y prototipos.
- Asistente en dispositivo movil: con aproximadamente 2 GB de memoria disponible y contexto limitado a 4096 tokens, puede desplegarse en telefonos para tareas de texto acotadas.
- Procesamiento de imagenes en local: con el proyector mmproj F16 opcional, el modelo acepta entrada de imagen para descripcion o analisis visual basico en el mismo entorno de llama.cpp.
- Experimentacion con modelos sin censura: util para investigadores que estudian el comportamiento de rechazo y censura en modelos pequenos, comparando las metricas de Pan y Xu entre cuantizaciones.
- Prototipado offline de interfaces conversacionales: permite validar flujos de chat en el cliente antes de migrar a una build de mayor calidad como Q4_K_M.
- Educacion y divulgacion: ejecucion local en portatiles y navegadores para demostrar inferencia LLM sin infraestructura de GPU, con la advertencia de la perdida de calidad en respuestas largas.

## Benchmarks y rendimiento

| Metrica | Qwen3.5-4B (original) | Uncensored-v2 BF16 | Uncensored-v2 Q4_K_M | Esta build (IQ3_XXS) |
|---|---|---|---|---|
| Tamano del fichero (modelo de texto) | 8,67 GB | 8,67 GB | 2,78 GB | 1,86 GB |
| MMLU (1.000 items, non-thinking) | 72,7 | 72,3 | 72,1 | 63,0 |
| Rechazo de peticiones daninas (100 prompts) | 99 | 93 | 95 | 89 |
| Respuestas degeneradas en 110 prompts neutros | 8 | 13 | 11 | 24 |
| Respuestas censuradas, items de Pan y Xu que el original conoce (de 51) | 47 | 11 | 14 | 11 |

No se han publicado otros resultados de benchmarks (HumanEval, GSM8K, etc.) en la informacion disponible.

## Requisitos de hardware

- VRAM/memoria estimada para inferencia: aproximadamente 2 GB para el modelo de texto en IQ3_XXS (1,86 GB de pesos mas overhead); anadir 0,67 GB si se usa el proyector multimodal F16.
- GPU recomendadas: no especificadas en la informacion; el enfasis esta en ejecucion en navegador (WebGPU) y en dispositivo movil.
- Cabe en GPU de consumo: si, dado el tamano reducido; no se detallan modelos concretos.
- Opciones de despliegue: llama.cpp (`llama-server` con `--jinja`), runtimes de navegador tipo wllama (WebAssembly/WebGPU); compatibilidad declarada con endpoints.
- Latencia y throughput: no disponibles en la informacion.
- Contexto recomendado: 4096 tokens o menos en telefonos.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | MMLU | Licencia | Formato / disponibilidad |
|---|---|---|---|---|---|
| Esta build (IQ3_XXS) | 4,33 B | No disponible (recomendado <=4096 en movil) | 63,0 | Apache 2.0 | GGUF, 1,86 GB |
| Uncensored-v2 Q4_K_M | 4,33 B | No disponible | 72,1 | Apache 2.0 | GGUF, 2,78 GB |
| Uncensored-v2 BF16 | 4,33 B | No disponible | 72,3 | Apache 2.0 | BF16, 8,67 GB |
| Qwen3.5-4B original | 4,33 B | No disponible | 72,7 | No disponible en la informacion | No disponible |

La comparativa con alternativas de otros autores no esta disponible en la informacion proporcionada.

## Limitaciones y advertencias

- Perdida de capacidad general: MMLU cae de 72,7 a 63,0 (unos 9 puntos) respecto al modelo original.
- Mayor tasa de respuestas degeneradas: 24 sobre 110 prompts neutros, frente a 8 en el original; las respuestas largas repiten o no terminan con mas frecuencia.
- Modelo "uncensored": reduce el rechazo de peticiones daninas (89 de 100 rechazadas, frente a 99 del original), lo que implica riesgo de generar contenido inapropiado y requiere filtros y politicas de uso en produccion.
- Riesgo de alucinacion: no cuantificado en la informacion disponible; la degradacion por cuantizacion agresiva puede agravarlo.
- Contexto limitado en movil: se recomienda 4096 tokens o menos, lo que restringe tareas de contexto largo.
- Idiomas soportados no documentados.
- Licencia Apache 2.0 permite uso comercial, pero la ausencia de salvaguardas hace necesaria una capa de moderacion propia.
- Modelo con 0 descargas y 0 likes en el momento de la consulta; sin validacion comunitaria.

## Enlaces

- Hugging Face: https://huggingface.co/InterpreticAI/Qwen3.5-4B-Uncensored-v2-Browser-GGUF
- Modelo base: https://huggingface.co/InterpreticAI/Qwen3.5-4B-Uncensored-v2
- Variante GGUF de mayor calidad (Q4_K_M): https://huggingface.co/InterpreticAI/Qwen3.5-4B-Uncensored-v2-GGUF
