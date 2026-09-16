# mario-rc/emotional-rlaif-ppo-gemma-4-e4b-it

## Resumen

Emotional RLAIF PPO Gemma-4-E4B-IT es un adaptador LoRA (PEFT) publicado por el usuario mario-rc sobre el modelo base google/gemma-4-E4B-it. No es un modelo completo: el repositorio contiene unicamente los pesos del adaptador (0,1 GB) y requiere descargar por separado el modelo base para poder ejecutarse. Su finalidad es la generacion de respuestas dialogicas en ingles condicionadas emocionalmente, entrenadas mediante PPO (Proximal Policy Optimization) con un esquema de RLAIF, es decir, aprendizaje por refuerzo con retroalimentacion generada por IA.

El adaptador se ha alineado en dos etapas: primero un ajuste supervisado (SFT) y despues PPO partiendo del checkpoint `ppo_from_best_sft_lr02e6_e4b/checkpoint-5`. La salida del modelo es un unico turno de asistente compuesto por tres partes de respuesta etiquetadas con emociones, de modo que la emocion solicitada actua como etiqueta de control y no como un diagnostico inferido de los sentimientos del usuario. El entrenamiento se hizo exclusivamente en ingles y la licencia declarada es Apache 2.0.

La relevancia de esta publicacion es doble: por un lado, forma parte de un catalogo amplio de adaptadores emocionales (PPO y DPO) que cubre bases Gemma 2, Gemma 4, GLM-4, Llama 3, Mistral y Phi-3, lo que permite comparar metodos de alineacion sobre una misma tarea; por otro, ilustra un flujo de trabajo reproducible con LLaMA-Factory para entrenar adaptadores PEFT/RLAIF sobre modelos multimodales recientes. La model card no detalla el numero exacto de parametros, la longitud de contexto ni el volumen de datos de entrenamiento.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (adaptador LoRA sobre `google/gemma-4-E4B-it`; la model card no describe la arquitectura del modelo base) |
| Parametros totales | no disponible (el modelo base se designa como E4B, tamano efectivo, no el recuento completo de pesos multimodales) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el adaptador se distribuye en safetensors; se puede cuantizar el modelo base combinado, pero no se documenta) |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El repositorio contiene un adaptador de tipo LoRA gestionado con PEFT, entrenado con el framework LLaMA-Factory y la plantilla de prompt `gemma4n_nothink`. La alineacion se realizo en dos fases: una etapa de SFT y, a continuacion, PPO sobre el mejor checkpoint de SFT (`ppo_from_best_sft_lr02e6_e4b/checkpoint-5`). En PPO la funcion de recompensa procede de un esquema RLAIF (retroalimentacion generada por IA) en lugar de anotacion humana directa, lo que permite escalar la senal de preferencia sobre el dataset de dialogo emocional.

El conjunto de datos empleado es `mario-rc/aif-emotional-generation`, de dominio publico en HuggingFace, y el proyecto asociado es `Mario-RC/aif-emotional-model`. La tarea entrenada es la generacion de una respuesta de asistente en tres fragmentos etiquetados por emocion. La model card no especifica el numero de tokens de entrenamiento, la composicion exacta del dataset, la arquitectura interna del modelo base Gemma-4 E4B ni detalles sobre decodificacion u optimizaciones de atencion. La denominacion E4B corresponde, segun la propia documentacion del autor, al tamano efectivo de parametros y no al total de pesos multimodales del modelo base.

## Capacidades

- Generacion de texto conversacional en ingles con condicionamiento emocional explicito.
- Produccion de un unico turno de asistente estructurado en tres partes, cada una con su etiqueta de emocion.
- Dialogo multi-turno (la plantilla `gemma4n_nothink` define el formato de chat, aunque no se documenta la longitud de contexto soportada).
- Uso de una emocion solicitada como etiqueta de control, no como inferencia diagnostica del estado del usuario.
- Soporte de tool calling: no documentado en la informacion disponible.
- Soporte de agentes y razonamiento multi-paso: no documentado en la informacion disponible.
- Capacidades multilingues: limitadas al ingles segun la model card.
- Capacidades especiales (modo thinking, vision, audio): no documentadas en la informacion disponible; el nombre del template `gemma4n_nothink` sugiere un modo sin cadena de pensamiento, pero no se detalla su comportamiento.

## Casos de uso

- Investigacion en alineacion emocional: comparar PPO frente a DPO sobre el mismo modelo base Gemma-4 E4B y el mismo dataset, manteniendo constantes los datos y la plantilla de prompt.
- Experimentacion con RLAIF: estudiar como se comporta una politica entrenada con recompensas generadas por IA en una tarea de generacion de respuestas afectivas, y medir el efecto sobre la diversidad y el tono de las salidas.
- Generacion de respuestas con tono controlado en prototipos de asistente conversacional: la etiqueta de emocion solicitada permite forzar registros concretos (por ejemplo, empatico o calmado) en la respuesta del sistema.
- Creacion de datos sinteticos etiquetados emocionalmente: el modelo puede utilizarse para generar corpus de dialogo con anotacion de emocion por fragmento, utiles para entrenar o evaluar clasificadores.
- Evaluacion de tecnicas PEFT en modelos multimodales: al ser un adaptador LoRA de 0,1 GB, sirve como caso de estudio de bajo coste para medir el impacto de la alineacion con refuerzo sobre un modelo base grande sin reentrenar todos los pesos.
- Docencia y divulgacion: demostrar el pipeline completo SFT mas PPO con LLaMA-Factory, desde el dataset hasta la publicacion del adaptador, en un entorno reproducible.
- Pruebas de regresion y analisis de sesgos: examinar si el condicionamiento emocional introduce respuestas estereotipadas o artificialmente complacientes en ingles conversacional.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- El adaptador ocupa 0,1 GB, pero la inferencia exige cargar el modelo base `google/gemma-4-E4B-it` completo; el coste real de memoria lo determina el modelo base, no el adaptador.
- VRAM estimada para inferencia (orientativa, dado que el recuento exacto de parametros no esta disponible): en bf16 aproximadamente 8-10 GB para un modelo de tamano efectivo E4B; en cuantizacion de 8 bits aproximadamente 5-6 GB; en 4 bits aproximadamente 3-4 GB. Estas cifras son estimaciones y no proceden de la model card.
- GPU recomendadas por categoria: A100 40/80 GB o H100 para servicio en precision completa con lotes grandes; RTX 4090 (24 GB), RTX 4080 (16 GB) o L40S para inferencia en bf16; RTX 3060 12 GB, RTX 4060 Ti 16 GB o similares para cuantizacion de 4-8 bits.
- Cabe en GPU de consumo: previsiblemente si, en tarjetas con 8-16 GB de VRAM y cuantizacion de 4 bits, sujeto a la arquitectura real del modelo base (no confirmado en la documentacion).
- Opciones de despliegue: transformers con PEFT (carga del adaptador sobre el base), vLLM o TGI fusionando el adaptador, llama.cpp/Ollama si se convierte el modelo combinado a GGUF. LLaMA-Factory es el framework usado en el entrenamiento y tambien puede servir para la inferencia.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

Comparativa dentro del mismo catalogo de adaptadores emocionales del autor, que comparten dataset y objetivo:

| Modelo | Base | Tamano | Metodo de alineacion | Plantilla de prompt | Licencia |
|---|---|---|---|---|---|
| emotional-rlaif-ppo-gemma-4-e4b-it (este) | google/gemma-4-E4B-it | E4B (efectivo) | PPO | `gemma4n_nothink` | apache-2.0 |
| emotional-rlaif-ppo-gemma-4-e2b-it | google/gemma-4-E2B-it | E2B (efectivo) | PPO | `gemma4n_nothink` | apache-2.0 |
| emotional-rlaif-dpo-gemma-4-e2b-it | google/gemma-4-E2B-it | E2B (efectivo) | DPO | `gemma4n_nothink` | apache-2.0 |
| emotional-rlaif-ppo-gemma-2-9b-it | google/gemma-2-9b-it | 9B | PPO | `gemma` | apache-2.0 |
| google/gemma-4-E4B-it (sin adaptador) | - | E4B (efectivo) | alineacion propia de Google | - | segun la licencia del modelo base |

Criterios de eleccion: frente a la variante E2B, este adaptador parte de un modelo base de mayor tamano efectivo, con mayor coste de memoria; frente a la variante DPO (que en el catalogo publicado solo aparece para E2B en la informacion disponible), PPO optimiza directamente una recompensa escalar en lugar de preferencias por pares, lo que suele dar politicas mas agresivas en el estilo aprendido. No hay datos de rendimiento comparativo publicados entre estas variantes en la informacion disponible.

## Limitaciones y advertencias

- La emocion solicitada es una etiqueta de control, no un diagnostico de los sentimientos del usuario; el autor lo advierte explicitamente.
- No es un sistema clinico ni certificado para seguridad; no debe usarse en contextos de salud mental, crisis o evaluacion psicologica.
- Entrenado unicamente en ingles; el comportamiento en castellano u otros idiomas no esta validado y previsiblemente degradara.
- Riesgo de alucinacion inherente a un modelo de lenguaje generativo; la alineacion con PPO no elimina las fabricaciones de contenido.
- Riesgo de sesgos: el condicionamiento emocional puede reforzar estereotipos afectivos o producir respuestas excesivamente complacientes si la recompensa RLAIF premia ese estilo.
- Al ser un adaptador LoRA, el rendimiento depende por completo de la version concreta del modelo base; cambios en `google/gemma-4-E4B-it` pueden romper la compatibilidad.
- No se documentan la longitud de contexto efectiva, el volumen de datos de entrenamiento ni evaluaciones de seguridad, por lo que la robustez en produccion es desconocida.
- Licencia Apache 2.0 declarada para el adaptador, pero el uso comercial del modelo combinado queda sujeto tambien a los terminos del modelo base de Google; conviene revisarlos antes de desplegar.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: sin validacion externa ni reportes de terceros.
- El autor indica que Gemma-4 E2B/E4B son tamanos efectivos y no el recuento completo de pesos multimodales, de modo que el consumo real de memoria puede ser superior al sugerido por la cifra de parametros.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/mario-rc/emotional-rlaif-ppo-gemma-4-e4b-it
- Modelo base: https://huggingface.co/google/gemma-4-E4B-it
- Dataset de entrenamiento: https://huggingface.co/datasets/mario-rc/aif-emotional-generation
- Proyecto en GitHub: https://github.com/Mario-RC/aif-emotional-model
- Variante PPO sobre Gemma-4 E2B: https://huggingface.co/mario-rc/emotional-rlaif-ppo-gemma-4-e2b-it
- Variante DPO sobre Gemma-4 E2B: https://huggingface.co/mario-rc/emotional-rlaif-dpo-gemma-4-e2b-it
- Variantes PPO y DPO sobre Gemma-2 2B: https://huggingface.co/mario-rc/emotional-rlaif-ppo-gemma-2-2b-it y https://huggingface.co/mario-rc/emotional-rlaif-dpo-gemma-2-2b-it
- Variantes PPO y DPO sobre Gemma-2 9B: https://huggingface.co/mario-rc/emotional-rlaif-ppo-gemma-2-9b-it y https://huggingface.co/mario-rc/emotional-rlaif-dpo-gemma-2-9b-it
- Variantes sobre GLM-4 9B Chat 1M: https://huggingface.co/mario-rc/emotional-rlaif-ppo-glm-4-9b-chat-1m y https://huggingface.co/mario-rc/emotional-rlaif-dpo-glm-4-9b-chat-1m
- Variantes sobre Meta-Llama-3-8B-Instruct: https://huggingface.co/mario-rc/emotional-rlaif-ppo-meta-llama-3-8b-instruct y https://huggingface.co/mario-rc/emotional-rlaif-dpo-meta-llama-3-8b-instruct
- Variantes sobre Llama-3.2-1B-Instruct: https://huggingface.co/mario-rc/emotional-rlaif-ppo-llama-3.2-1b-instruct y https://huggingface.co/mario-rc/emotional-rlaif-dpo-llama-3.2-1b-instruct
- Variantes sobre Llama-3.2-3B-Instruct: https://huggingface.co/mario-rc/emotional-rlaif-ppo-llama-3.2-3b-instruct y https://huggingface.co/mario-rc/emotional-rlaif-dpo-llama-3.2-3b-instruct
- Variantes sobre Mistral-7B-Instruct-v0.3: https://huggingface.co/mario-rc/emotional-rlaif-ppo-mistral-7b-instruct-v0.3 y https://huggingface.co/mario-rc/emotional-rlaif-dpo-mistral-7b-instruct-v0.3
- Variantes sobre Phi-3-small-8k-instruct: https://huggingface.co/mario-rc/emotional-rlaif-ppo-phi-3-small-8k-instruct y https://huggingface.co/mario-rc/emotional-rlaif-dpo-phi-3-small-8k-instruct
- LLaMA-Factory (framework de entrenamiento): no se ha proporcionado enlace directo en la informacion disponible
- Paper o blog tecnico del modelo: no disponible
- La busqueda web realizada no devolvio resultados relevantes sobre este modelo; los unicos resultados obtenidos correspondian a contenido no relacionado.
