# mario-rc/emotional-rlaif-dpo-gemma-4-e4b-it

## Resumen

`mario-rc/emotional-rlaif-dpo-gemma-4-e4b-it` es un adaptador LoRA/PEFT para el modelo base `google/gemma-4-E4B-it`, alineado mediante DPO (Direct Preference Optimization) tras una etapa previa de SFT. Lo desarrolla el usuario mario-rc dentro del proyecto `aif-emotional-model` y su proposito es la generacion de respuestas emocionalmente condicionadas: el adaptador produce un unico turno de asistente compuesto por tres partes de respuesta etiquetadas con emociones. Los pesos del modelo base no se incluyen en el repositorio, que ocupa 0,1 GB.

El entrenamiento se hizo con LLaMA-Factory usando la plantilla de prompt `gemma4n_nothink`, en ingles, sobre el dataset `mario-rc/aif-emotional-generation`. El checkpoint publicado corresponde a la ejecucion `dpo_beta010_lr2e6_ftx010_e4b/checkpoint-4695`, es decir, con beta 0,10 y learning rate 2e-6 segun la nomenclatura del autor. La model card enmarca explicitamente el modelo como herramienta de investigacion y experimentacion con dialogo emocional en ingles, no como sistema clinico ni certificado de seguridad.

Su relevancia es acotada pero concreta: forma parte de un catalogo de 19 adaptadores que replican el mismo procedimiento (PPO o DPO) sobre bases de 1B a 9B (Gemma-2, Gemma-4, GLM-4, Llama-3, Llama-3.2, Mistral y Phi-3), lo que permite comparar metodos de alineacion y tamanos de modelo bajo un protocolo comun. El repositorio no tiene descargas ni likes en el momento de la consulta y no publica resultados de benchmarks ni detalles de arquitectura del base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (adaptador LoRA/PEFT sobre `google/gemma-4-E4B-it`; la model card no detalla la arquitectura del modelo base) |
| Parametros totales | no disponible para el adaptador; el base se designa E4B, definido en la model card como tamano efectivo de parametros y no como recuento completo de pesos multimodales |
| Parametros activos | no disponible (no se indica si el modelo base es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el adaptador se distribuye en safetensors; la cuantizacion se aplica al fusionarlo con el base) |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 (declarada para el adaptador; los pesos base no se incluyen y quedan sujetos a la licencia del modelo Gemma de Google) |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |
| Tamano del repositorio | 0,1 GB |
| Metodo de alineacion | DPO |
| Tipo de adaptador | LoRA / PEFT |
| Framework de entrenamiento | LLaMA-Factory |
| Plantilla de prompt | `gemma4n_nothink` |
| Checkpoint publicado | `dpo_beta010_lr2e6_ftx010_e4b/checkpoint-4695` |
| Dataset de entrenamiento | `mario-rc/aif-emotional-generation` |
| Descargas / likes | 0 / 0 |
| Fecha de creacion | 2026-09-16 |

## Arquitectura y entrenamiento

El artefacto publicado es un adaptador LoRA sobre `google/gemma-4-E4B-it`, no un modelo completo. Segun la model card, el proceso consta de una etapa SFT y una etapa posterior de alineacion con DPO; el checkpoint liberado corresponde a esta segunda etapa. Se empleo LLaMA-Factory como framework y la plantilla `gemma4n_nothink`, cuyo nombre sugiere el uso de la variante sin modo de razonamiento explicito de la familia Gemma-4, aunque la model card no lo confirma. La nomenclatura del checkpoint (`dpo_beta010_lr2e6_ftx010_e4b`) indica un coeficiente beta de DPO de 0,10 y un learning rate de 2e-6.

No se especifican en la informacion disponible el numero de tokens de entrenamiento, la composicion del dataset, si hubo RLHF adicional, ni innovaciones tecnicas del base (atencion, decodificacion especulativa, etc.). Tampoco se detalla el rango o los modulos objetivo del LoRA, ni el numero de parametros entrenables. El unico dato de datos es la fuente: el dataset `mario-rc/aif-emotional-generation`, en ingles. El modelo base se describe como multimodal en la propia model card, que advierte que las designaciones E2B/E4B corresponden a tamanos efectivos y no al total de pesos multimodales.

## Capacidades

- Generacion de texto conversacional en ingles: el adaptador devuelve un unico turno de asistente con tres partes de respuesta etiquetadas por emocion.
- Condicionamiento emocional controlado: la segunda emocion solicitada actua como etiqueta de control, no como inferencia diagnostica sobre el estado real de la persona.
- Generacion de datos sinteticos etiquetados emocionalmente, aprovechando el formato de tres partes con etiqueta.
- Ajuste fino sobre una base instruct ya alineada, por lo que hereda las capacidades generales de `google/gemma-4-E4B-it` (no detalladas en la informacion disponible).
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no, el entrenamiento y el uso previsto se limitan al ingles.
- Capacidades especiales (modo thinking, vision, audio): no disponibles en el adaptador; la plantilla empleada es `gemma4n_nothink` y el base se describe como multimodal, pero la model card no detalla el comportamiento multimodal del adaptador.

## Casos de uso

- Investigacion en metodos de alineacion: comparar este adaptador DPO con su equivalente PPO (`mario-rc/emotional-rlaif-ppo-gemma-4-e4b-it`) sobre la misma base y el mismo dataset permite aislar el efecto del algoritmo de alineacion en la condicionalidad emocional.
- Generacion de datos sinteticos de dialogo emocional: el modelo produce turnos con tres partes etiquetadas por emocion, utiles para ampliar el dataset `aif-emotional-generation` o para crear corpus de entrenamiento de modelos mas pequenos de la misma familia (1B, 3B, E2B).
- Prototipado de asistentes con tono emocional controlado: en aplicaciones donde se necesita forzar un registro afectivo concreto (por ejemplo, respuestas de apoyo en un chat de bienestar no clinico), la etiqueta de emocion funciona como parametro de estilo verificable.
- Auditoria de fidelidad al condicionamiento: comprobar si las tres partes generadas respetan realmente la emocion solicitada, midiendo la tasa de desviacion; es un caso de evaluacion interna, no de uso final.
- Destilacion hacia modelos mas pequenos: usar las salidas del adaptador E4B como profesor para ajustar los adaptadores de 1B y 3B del mismo catalogo, reduciendo coste de inferencia en produccion.
- Reproducibilidad de pipelines LLaMA-Factory: el checkpoint publicado y los hiperparametros visibles en su nombre permiten reproducir o variar la receta de DPO (beta, learning rate) y medir el impacto.
- Red-teaming de respuestas emocionales: explorar como responde el modelo ante peticiones de emociones contradictorias o inapropiadas, para documentar riesgos antes de cualquier despliegue.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas automaticas ni evaluaciones humanas, y el repositorio registra 0 descargas y 0 likes. Los unicos identificadores de la configuracion de entrenamiento son los del nombre del checkpoint (`dpo_beta010_lr2e6_ftx010_e4b/checkpoint-4695`).

## Requisitos de hardware

- El adaptador en si ocupa 0,1 GB (safetensors), por lo que el coste real de memoria lo determina el modelo base `google/gemma-4-E4B-it`, que debe descargarse aparte.
- VRAM estimada para el base segun su tamano efectivo declarado (E4B): en fp16 en torno a 8-9 GB, en int8 en torno a 5-6 GB y en 4 bits en torno a 3-4 GB, mas la cache KV. Son estimaciones orientativas: la model card advierte que E4B es el tamano efectivo y no el recuento completo de pesos multimodales, por lo que el consumo real puede ser superior.
- Cabe en GPU de consumo con cuantizacion de 4 u 8 bits en tarjetas de 12 GB o mas (por ejemplo RTX 3060 12 GB, RTX 4070, RTX 4090). En fp16 es recomendable disponer de 16 GB o mas.
- GPU de centro de datos (A100, H100) para entrenamiento, evaluacion a gran escala o serving con lotes grandes.
- Opciones de despliegue: transformers con PEFT para cargar el adaptador directamente; vLLM con soporte de adaptadores LoRA para serving; TGI con adaptadores LoRA; llama.cpp u Ollama solo tras fusionar el adaptador con el base y convertir los pesos a GGUF.
- Latencia y throughput estimados: no disponible (no hay mediciones publicadas).

## Comparativa con modelos similares

Comparacion con otros adaptadores del mismo catalogo, que comparten dataset, framework y protocolo de alineacion. Los datos de licencia, contexto y rendimiento de los modelos alternativos no se detallan en la informacion disponible.

| Modelo | Modelo base | Tamano | Metodo de alineacion | Plantilla | Licencia | Contexto | Rendimiento |
|---|---|---|---|---|---|---|---|
| emotional-rlaif-dpo-gemma-4-e4b-it (este) | google/gemma-4-E4B-it | E4B | DPO | `gemma4n_nothink` | apache-2.0 (adaptador) | no disponible | no publicado |
| emotional-rlaif-ppo-gemma-4-e4b-it | google/gemma-4-E4B-it | E4B | PPO | `gemma4n_nothink` | no disponible | no disponible | no publicado |
| emotional-rlaif-dpo-gemma-4-e2b-it | google/gemma-4-E2B-it | E2B | DPO | `gemma4n_nothink` | no disponible | no disponible | no publicado |
| emotional-rlaif-dpo-mistral-7b-instruct-v0.3 | mistralai/Mistral-7B-Instruct-v0.3 | 7B | DPO | `mistral` | no disponible | no disponible | no publicado |

Frente a alternativas de la misma categoria (adaptadores de dialogo emocional en ingles), la diferencia principal es el modelo base, el algoritmo de alineacion (DPO frente a PPO) y la plantilla de prompt, no el dataset ni el framework de entrenamiento.

## Limitaciones y advertencias

- La model card indica explicitamente que el modelo es para investigacion y experimentacion con dialogo emocional en ingles, y que no es un sistema clinico ni certificado de seguridad.
- La emocion solicitada es una etiqueta de control, no un diagnostico inferido de forma independiente sobre los sentimientos de una persona; usarla como tal seria un uso indebido.
- Solo se declara soporte de ingles. El comportamiento en otros idiomas no esta documentado.
- No hay resultados de benchmarks ni evaluaciones publicadas: no es posible cuantificar calidad, fidelidad emocional ni tasa de alucinacion.
- Como cualquier modelo generativo, puede producir contenido incorrecto o inventado; el riesgo no esta medido en esta ficha.
- Sesgos conocidos: no disponible; la model card no documenta analisis de sesgo del adaptador ni del base.
- Licencia: el adaptador declara apache-2.0, pero los pesos base de Gemma no se incluyen y estan sujetos a la licencia del modelo Gemma de Google. Cualquier uso comercial debe verificar ambas condiciones, incluida la aceptacion de los terminos de Gemma.
- Es un adaptador LoRA: no funciona de forma autonoma, requiere descargar el modelo base y cargarlo con PEFT o fusionarlo antes de convertirlo a otros formatos.
- La adopcion es nula en el momento de la consulta (0 descargas, 0 likes), por lo que no existe evidencia de uso en produccion ni validacion por terceros.
- La nomenclatura de la ejecucion (`beta010`, `lr2e6`, `ftx010`) es la unica fuente sobre hiperparametros; no se acompaña de documentacion adicional de entrenamiento.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/mario-rc/emotional-rlaif-dpo-gemma-4-e4b-it
- Modelo base: https://huggingface.co/google/gemma-4-E4B-it
- Dataset de entrenamiento: https://huggingface.co/datasets/mario-rc/aif-emotional-generation
- Repositorio del proyecto: https://github.com/Mario-RC/aif-emotional-model
- Adaptador PPO equivalente sobre la misma base: https://huggingface.co/mario-rc/emotional-rlaif-ppo-gemma-4-e4b-it
- Adaptador DPO sobre base E2B: https://huggingface.co/mario-rc/emotional-rlaif-dpo-gemma-4-e2b-it
- Adaptadores DPO sobre Llama-3.2: https://huggingface.co/mario-rc/emotional-rlaif-dpo-llama-3.2-1b-instruct y https://huggingface.co/mario-rc/emotional-rlaif-dpo-llama-3.2-3b-instruct
- Adaptador DPO sobre Mistral-7B-Instruct-v0.3: https://huggingface.co/mario-rc/emotional-rlaif-dpo-mistral-7b-instruct-v0.3
- LLaMA-Factory (framework de entrenamiento): https://github.com/hiyouga/LLaMA-Factory
- La busqueda web realizada no devolvio resultados relevantes para este modelo: los enlaces recuperados corresponden a la franquicia de videojuegos Super Mario (mario.nintendo.com, snokido.fr, supermarioplay.com, crazygames.com) y no guardan relacion con el adaptador.
