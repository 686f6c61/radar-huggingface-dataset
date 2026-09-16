# mario-rc/emotional-rlaif-dpo-gemma-4-e2b-it

## Resumen

`mario-rc/emotional-rlaif-dpo-gemma-4-e2b-it` es un adaptador LoRA (PEFT) para el modelo base `google/gemma-4-E2B-it`, alineado mediante DPO (Direct Preference Optimization) tras una etapa previa de SFT. No es un modelo completo: el repositorio solo contiene los pesos del adaptador (0,1 GB) y requiere descargar por separado el modelo base de Google. Su finalidad es la generacion de respuestas emocionalmente condicionadas en ingles, produciendo un unico turno de asistente compuesto por tres partes etiquetadas con emociones.

El modelo pertenece a una familia de publicaciones del mismo autor (mario-rc) que replica la misma receta de alineamiento sobre distintos backbones: Gemma 2 (2B y 9B), GLM-4 (9B), Llama 3 (8B), Llama 3.2 (1B y 3B), Mistral 7B, Phi-3 Small y la propia familia Gemma 4 (E2B y E4B), en variantes PPO y DPO. El interes principal es metodologico: sirve como referencia reproducible de un pipeline RLAIF + DPO aplicado a un dominio afectivo muy concreto, entrenado con LLaMA-Factory y la plantilla de prompt `gemma4n_nothink`.

Es relevante ahora porque explora el control explicito de la emocion como etiqueta de condicionamiento (la segunda emocion solicitada funciona como etiqueta de control, no como diagnostico inferido) sobre un backbone pequeno de parametros efectivos, lo que permite experimentar con alineamiento afectivo en hardware modesto. El autor advierte explicitamente que no es un sistema clinico ni certificado para seguridad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible de forma explicita; adaptador LoRA/PEFT sobre el transformer multimodal `google/gemma-4-E2B-it` |
| Parametros totales | No disponible (adaptador de 0,1 GB sobre un backbone de tamano efectivo E2B) |
| Parametros activos | No disponible (el autor indica que E2B/E4B son tamanos efectivos de diseno del modelo upstream, no el recuento completo de pesos multimodales) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (el adaptador se distribuye en safetensors; no se publican cuantizaciones GGUF/AWQ/GPTQ) |
| Idiomas soportados | Ingles (`en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (adaptador PEFT LoRA; el modelo base no esta incluido en el repositorio) |

## Arquitectura y entrenamiento

El artefacto publicado es un adaptador LoRA bajo el framework PEFT, pensado para cargarse encima de `google/gemma-4-E2B-it`. La alineacion se realizo en dos etapas: primero un SFT y despues DPO sobre ese SFT, con LLaMA-Factory como framework de entrenamiento y la plantilla de prompt `gemma4n_nothink` (es decir, sin modo de razonamiento explicito). El checkpoint publicado corresponde a la ejecucion de origen `dpo_nothink_lr2e6_e2b/checkpoint-273`, lo que sugiere una tasa de aprendizaje de 2e-6, aunque no se detallan hiperparametros adicionales, rango LoRA, alpha ni numero de pasos.

Los datos de entrenamiento provienen del dataset `mario-rc/aif-emotional-generation`. El modelo card no especifica el volumen de tokens, la composicion del dataset, ni si se aplicaron tecnicas adicionales como RLHF con reward model explicito (la etiqueta RLAIF sugiere generacion de preferencias por IA, pero el detalle del pipeline de anotacion no se documenta en esta ficha). Tampoco se describen innovaciones de decodificacion, atencion lineal o mecanismos de inferencia especulativa especificos del adaptador.

## Capacidades

- Generacion de texto conversacional en ingles con condicionamiento emocional explicito.
- Produccion de un turno de asistente estructurado en tres partes, cada una etiquetada con una emocion.
- Uso de una emocion solicitada por el usuario como etiqueta de control de estilo, no como inferencia diagnostica del estado afectivo real.
- Mantenimiento de dialogo multi-turno heredado del backbone instruct `gemma-4-E2B-it`.
- Capacidades multimodales potenciales heredadas del modelo base (el autor indica que Gemma 4 E2B es un modelo multimodal), aunque el adaptador no documenta entrenamiento especifico sobre imagen, audio o video.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada (el adaptador no lo menciona ni lo garantiza).
- Soporte de agentes y razonamiento multi-paso: no disponible; la plantilla empleada (`gemma4n_nothink`) desactiva explicitamente el modo de pensamiento.
- Capacidades multilingues: solo ingles segun la etiqueta de idioma del repositorio.

## Casos de uso

- Investigacion en alineamiento afectivo: punto de partida reproducible para comparar DPO frente a PPO sobre el mismo backbone y el mismo dataset, ya que el autor publica ambas variantes (`emotional-rlaif-ppo-gemma-4-e2b-it` y esta `dpo`).
- Prototipado de asistentes conversacionales con tono controlado: se puede solicitar la emocion objetivo de cada fragmento de respuesta y evaluar si el modelo la respeta, util para disenar politicas de estilo en productos de dialogo.
- Generacion de datos sinteticos etiquetados por emocion: el formato de tres partes etiquetadas permite usarlo como generador de corpus para entrenar o evaluar clasificadores de emocion, con la cautela de que son datos generados por un modelo, no anotaciones humanas.
- Experimentos academicos de comparacion entre backbones: al compartir receta con las variantes sobre Llama 3.2 1B/3B, Mistral 7B, Phi-3 Small, GLM-4 9B y Gemma 2 2B/9B, permite aislar el efecto del modelo base manteniendo el pipeline de alineamiento.
- Evaluacion de robustez de LoRA de bajo coste: con 0,1 GB de adaptador, es viable entrenar y servir decenas de variantes en una sola GPU para estudios de ablacion de hiperparametros.
- Formacion y docencia: ejemplo completo y de licencia permisiva (Apache 2.0) de un flujo SFT + DPO con LLaMA-Factory, util para cursos de ajuste fino eficiente en parametros.
- Base para ajuste adicional en dominios especificos: al ser un adaptador, se puede seguir entrenando o fusionar con otros adaptadores para tareas de dialogo con matiz emocional, siempre que se respete la licencia Apache 2.0 del adaptador y los terminos propios del modelo base de Google.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El model card no incluye metricas de MMLU, HumanEval, GSM8K, MT-Bench, evaluaciones de win-rate frente al modelo base ni ningun otro conjunto de evaluacion, ni para esta variante DPO ni para las variantes comparables de la misma familia.

## Requisitos de hardware

- VRAM para el adaptador: aproximadamente 0,1 GB en disco (tamano del repositorio); en memoria, el adaptador LoRA anade una fraccion pequena sobre el backbone.
- VRAM para inferencia: depende del modelo base `google/gemma-4-E2B-it`, que no se distribuye en este repositorio. No hay cifras oficiales publicadas para este adaptador. Orientativamente, un backbone de ~2B de parametros efectivos en precision de 16 bits ocupa del orden de 4-5 GB solo en pesos, mas cache KV y overhead del runtime; estas cifras son una estimacion, no un dato del autor.
- GPU recomendadas: no disponible en la informacion proporcionada. No se documenta soporte ni rendimiento en A100, H100, RTX 4090 u otras.
- Compatibilidad con GPU de consumo: no confirmada por el autor. La eleccion de un backbone de 2B efectivos sugiere que podria caber en GPUs de consumo con suficiente VRAM, pero es una inferencia y no un requisito publicado.
- Opciones de despliegue: PEFT y LLaMA-Factory son las vias documentadas (el autor indica explicitamente PEFT como libreria y LLaMA-Factory como framework). No se documenta soporte verificado para vLLM, llama.cpp, Ollama ni TGI; para usarlos habria que fusionar el adaptador con el modelo base y convertir los pesos, un procedimiento no descrito en la ficha.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Modelo base | Tamano | Metodo de alineacion | Plantilla | Licencia |
|---|---|---|---|---|---|
| `mario-rc/emotional-rlaif-dpo-gemma-4-e2b-it` (este) | `google/gemma-4-E2B-it` | E2B | DPO | `gemma4n_nothink` | Apache 2.0 |
| `mario-rc/emotional-rlaif-ppo-gemma-4-e2b-it` | `google/gemma-4-E2B-it` | E2B | PPO | `gemma4n_nothink` | No indicada en la informacion disponible |
| `mario-rc/emotional-rlaif-dpo-gemma-4-e4b-it` | `google/gemma-4-E4B-it` | E4B | DPO | No indicada en el extracto | No indicada en la informacion disponible |
| `mario-rc/emotional-rlaif-dpo-gemma-2-2b-it` | `google/gemma-2-2b-it` | 2B | DPO | `gemma` | No indicada en la informacion disponible |

No se dispone de datos de rendimiento comparativo entre estas variantes (ni win-rate, ni metricas de fidelidad emocional, ni evaluaciones humanas) en la informacion proporcionada, por lo que la comparacion se limita a la configuracion metodologica. Tampoco se han encontrado en la busqueda web modelos alternativos del mismo dominio: los resultados de busqueda obtenidos no guardan relacion con el modelo (corresponden a contenidos sobre la franquicia de videojuegos Super Mario) y se descartan como fuentes.

## Limitaciones y advertencias

- No es un modelo completo: sin el modelo base `google/gemma-4-E2B-it` los safetensors del repositorio son inutiles por si solos.
- Ambito de uso restringido por el propio autor a investigacion y experimentacion con dialogo emocionalmente condicionado en ingles.
- La emocion solicitada es una etiqueta de control, no un diagnostico inferido de los sentimientos de una persona; usarlo como herramienta de evaluacion psicologica seria un uso indebido.
- No es un sistema clinico ni certificado para seguridad. No debe emplearse en contextos de salud mental, crisis o decision automatizada sobre personas.
- Riesgo de alucinacion: no cuantificado en la informacion disponible; es un adaptador de ~0,1 GB sobre un backbone pequeno, sin evaluaciones publicadas de fidelidad factual.
- Cobertura idiomatica limitada al ingles segun la etiqueta del repositorio; el comportamiento en castellano no esta documentado ni validado.
- Posibles sesgos derivados del dataset `mario-rc/aif-emotional-generation` y del uso de preferencias generadas por IA (RLAIF); ni la composicion del dataset ni el procedimiento de anotacion se detallan en la ficha.
- Sin resultados de benchmarks publicados: no hay evidencia cuantitativa de mejora frente al modelo base ni frente a las variantes PPO.
- Licencia del adaptador Apache 2.0, pero el uso comercial agregado depende de los terminos del modelo base de Google, que deben verificarse por separado.
- Sin senales de adopcion: 0 descargas y 0 likes en el momento de la consulta, lo que implica ausencia de validacion por parte de la comunidad.
- Compatibilidad de despliegue no verificada fuera de PEFT/LLaMA-Factory; la ruta a GGUF o a servidores de inferencia de alto rendimiento no esta documentada.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/mario-rc/emotional-rlaif-dpo-gemma-4-e2b-it
- Modelo base: https://huggingface.co/google/gemma-4-E2B-it
- Dataset de entrenamiento: https://huggingface.co/datasets/mario-rc/aif-emotional-generation
- Repositorio del proyecto: https://github.com/Mario-RC/aif-emotional-model
- Variante PPO equivalente: https://huggingface.co/mario-rc/emotional-rlaif-ppo-gemma-4-e2b-it
- Variante DPO sobre Gemma-4-E4B: https://huggingface.co/mario-rc/emotional-rlaif-dpo-gemma-4-e4b-it
- Variante PPO sobre Gemma-4-E4B: https://huggingface.co/mario-rc/emotional-rlaif-ppo-gemma-4-e4b-it
- Variantes sobre Gemma 2 2B: https://huggingface.co/mario-rc/emotional-rlaif-dpo-gemma-2-2b-it y https://huggingface.co/mario-rc/emotional-rlaif-ppo-gemma-2-2b-it
- Variantes sobre Gemma 2 9B: https://huggingface.co/mario-rc/emotional-rlaif-dpo-gemma-2-9b-it y https://huggingface.co/mario-rc/emotional-rlaif-ppo-gemma-2-9b-it
- Variantes sobre GLM-4 9B Chat 1M: https://huggingface.co/mario-rc/emotional-rlaif-dpo-glm-4-9b-chat-1m y https://huggingface.co/mario-rc/emotional-rlaif-ppo-glm-4-9b-chat-1m
- Variantes sobre Llama 3 8B Instruct: https://huggingface.co/mario-rc/emotional-rlaif-dpo-meta-llama-3-8b-instruct y https://huggingface.co/mario-rc/emotional-rlaif-ppo-meta-llama-3-8b-instruct
- Variantes sobre Llama 3.2 1B Instruct: https://huggingface.co/mario-rc/emotional-rlaif-dpo-llama-3.2-1b-instruct y https://huggingface.co/mario-rc/emotional-rlaif-ppo-llama-3.2-1b-instruct
- Variantes sobre Llama 3.2 3B Instruct: https://huggingface.co/mario-rc/emotional-rlaif-dpo-llama-3.2-3b-instruct y https://huggingface.co/mario-rc/emotional-rlaif-ppo-llama-3.2-3b-instruct
- Variantes sobre Mistral 7B Instruct v0.3: https://huggingface.co/mario-rc/emotional-rlaif-dpo-mistral-7b-instruct-v0.3 y https://huggingface.co/mario-rc/emotional-rlaif-ppo-mistral-7b-instruct-v0.3
- Variantes sobre Phi-3 Small 8K Instruct: https://huggingface.co/mario-rc/emotional-rlaif-dpo-phi-3-small-8k-instruct y https://huggingface.co/mario-rc/emotional-rlaif-ppo-phi-3-small-8k-instruct
- Nota sobre la busqueda web: los resultados obtenidos no estan relacionados con el modelo (contenidos sobre la franquicia Super Mario), por lo que no se incluyen como fuentes. No se han encontrado papers, blogs tecnicos ni demos adicionales asociados a este adaptador.
