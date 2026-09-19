# mario-rc/emotional-rlaif-ppo-gemma-2-2b-it

## Resumen

`mario-rc/emotional-rlaif-ppo-gemma-2-2b-it` es un adaptador LoRA/PEFT entrenado sobre `google/gemma-2-2b-it` mediante Proximal Policy Optimization (PPO) dentro de un pipeline de RLAIF (Reinforcement Learning from AI Feedback) orientado a la alineación emocional de respuestas conversacionales. Lo desarrolla el usuario de Hugging Face mario-rc, con el código del proyecto publicado en el repositorio `Mario-RC/sml-emotional-rlaif`, y forma parte de una familia de adaptadores que cubre varios modelos base (Gemma 2, Gemma 4, GLM-4, Llama 3, Llama 3.2, Mistral 7B y Phi-3) y dos métodos de alineación (PPO y DPO).

El problema que aborda es la falta de sintonía emocional en asistentes conversacionales: en lugar de optimizar únicamente corrección factual o utilidad, el entrenamiento con PPO ajusta la política del modelo contra un modelo de recompensa derivado de preferencias anotadas (`mario-rc/aif-emotional-generation/aif_annotations`). La componente SFT y el propio PPO se entrenan sobre el subconjunto de diálogos del mismo dataset, con la plantilla de prompt `gemma` y la librería LLaMA-Factory como framework.

Se trata de un adaptador pequeño (el repositorio ocupa 0,1 GB) pensado explícitamente para investigación y experimentación, no como modelo listo para producción. Su relevancia actual es doble: por un lado, permite reproducir y comparar PPO frente a DPO sobre un mismo modelo base de 2B parámetros; por otro, sirve como estudio de caso de alineación emocional RLAIF en un rango de tamaño que cabe en GPU de consumo. El modelo acumula 113 descargas y 0 likes, y su idioma declarado es únicamente el inglés.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada del modelo base `google/gemma-2-2b-it`); el artefacto publicado es un adaptador LoRA/PEFT |
| Parametros totales | 2B (tamaño declarado del modelo base en la model card; el adaptador LoRA añade un número no especificado de parámetros entrenables) |
| Longitud de contexto | no disponible en la informacion proporcionada (viene determinada por `google/gemma-2-2b-it`) |
| Tipos de cuantizacion | no disponible en la model card; el adaptador se distribuye en safetensors y requiere cargarse sobre el modelo base, que puede cuantizarse de forma externa |
| Idiomas soportados | en (inglés) |
| Licencia | gemma (Gemma Terms of Use) |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |
| Tipo de adaptador | LoRA / PEFT |
| Metodo de alineacion | PPO (RLAIF) |
| Framework de entrenamiento | LLaMA-Factory |
| Plantilla de prompt | `gemma` |
| Dataset de entrenamiento | `mario-rc/aif-emotional-generation` (subconjunto `dialogues` para SFT y PPO; `aif_annotations` para el modelo de recompensa) |
| Modelo base | `google/gemma-2-2b-it` |
| Tamano del repositorio | 0,1 GB |
| Descargas / likes | 113 / 0 |

## Arquitectura y entrenamiento

La arquitectura subyacente es la del modelo base `google/gemma-2-2b-it`, un transformer decoder-only de la familia Gemma 2; el repositorio no publica pesos completos, sino un adaptador LoRA entrenado con LLaMA-Factory y cargable mediante PEFT sobre dicho base. El pipeline de alineación consta de tres piezas: un ajuste supervisado (SFT) sobre el subconjunto `dialogues` del dataset `mario-rc/aif-emotional-generation`, un modelo de recompensa (RM) entrenado con las preferencias `aif_annotations` del mismo dataset, y una fase de PPO que optimiza la política del adaptador contra esa recompensa. La model card no detalla hiperparámetros de PPO (KL penalty, learning rate, número de pasos), rango o alpha del LoRA, ni el volumen de tokens de entrenamiento.

La innovación destacable no está en la arquitectura, sino en el enfoque de alineación: se sustituye la retroalimentación humana directa por retroalimentación de IA (RLAIF) anotada sobre ejes emocionales, aplicada de forma sistemática a múltiples modelos base con dos algoritmos alternativos (PPO y DPO). Esto convierte la release en un conjunto controlado de experimentos comparables, útil para estudiar si PPO aporta ventajas sobre DPO cuando el objetivo de alineación es cualitativo y afectivo en lugar de verificable. No se documentan innovaciones de inferencia (decodificación especulativa, atención lineal, etc.).

## Capacidades

- Generación de texto conversacional en inglés, optimizada para respuestas con carga emocional y tono empático.
- Alineación emocional específica: el ajuste con PPO/RLAIF busca mejorar la adecuación afectiva de las respuestas respecto al modelo base instruct.
- Conversación multi-turno con plantilla de prompt `gemma` (formato de chat del modelo base).
- Uso como adaptador intercambiable: puede cargarse y descargarse con PEFT sin duplicar los pesos del modelo base.
- Comparabilidad metodológica: mismo dataset y misma plantilla que la variante DPO (`emotional-rlaif-dpo-gemma-2-2b-it`), lo que permite aislar el efecto del algoritmo de alineación.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada (la model card no lo declara).
- Soporte de agentes y multi-step reasoning: no disponible en la informacion proporcionada (el foco declarado es diálogo).
- Capacidades multilingües: no; el modelo declara únicamente inglés (`en`).
- Capacidades especiales (vision, audio, thinking mode): no disponibles; no se declaran en la model card.

## Casos de uso

- Investigación en alineación emocional: comparar PPO frente a DPO manteniendo constante el modelo base, el dataset y la plantilla de prompt, para medir el efecto del algoritmo sobre métricas de calidad afectiva del diálogo.
- Prototipado de chatbots de acompañamiento en inglés: el adaptador puede cargarse sobre Gemma 2 2B para generar respuestas con tono cálido en conversaciones de apoyo informal, siempre con supervisión humana y sin uso clínico.
- Atención al cliente con sensibilidad al tono: en interacciones donde el usuario expresa frustración, el ajuste emocional busca respuestas que reconozcan la emoción antes de resolver el problema técnico; el tamaño de 2B permite desplegarlo con latencia baja en entornos con muchas peticiones concurrentes.
- Generación de datos sintéticos emocionales: usar el adaptador para producir diálogos etiquetados afectivamente que alimenten conjuntos de entrenamiento o de evaluación para modelos de recompensa.
- Escritura creativa y guiones de personajes: generar diálogos donde el matiz emocional del interlocutor importa, aprovechando la alineación hacia respuestas afectivamente coherentes.
- Evaluación de modelos de recompensa: emplear el adaptador como política de referencia para comprobar si un RM entrena-do con `aif_annotations` generaliza a otras configuraciones de modelo base de la misma familia.
- Docencia y formación en RLHF/RLAIF: pipeline completo, reproducible y de tamaño reducido (2B, adaptador de 0,1 GB) para enseñar PPO aplicado a modelos de lenguaje sin necesidad de clústeres grandes.
- A/B testing interno de personalidad de asistente: comparar el modelo base y las variantes PPO/DPO como tres "personalidades" distintas para calibrar qué estilo de respuesta se ajusta al producto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El campo `model-index` de la model card declara la entrada `ppo-gemma-2-2b-it` con una lista de resultados vacía (`"results": []`), por lo que no existen métricas oficiales de MMLU, HumanEval, GSM8K ni de evaluación emocional en la información proporcionada. Tampoco se documentan evaluaciones comparativas PPO frente a DPO publicadas por el autor.

## Requisitos de hardware

- VRAM estimada para inferencia (estimaciones a partir del tamaño del modelo base de 2B parámetros, no cifras oficiales): aproximadamente 1,5-2,5 GB en cuantización de 4 bits, 3-4 GB en 8 bits y 5-6 GB en fp16/bf16, más el overhead de caché KV según la longitud de contexto efectiva.
- El adaptador LoRA en sí ocupa 0,1 GB y no añade requisitos de VRAM significativos frente al base.
- GPU recomendadas para desarrollo: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4090 (holgada). Para servicio con batching alto: NVIDIA L4, A10G, L40S, A100 o H100.
- Cabe en GPU de consumo: sí. En fp16/bf16 entra en tarjetas de 8 GB o más; con cuantización de 4 bits puede ejecutarse en GPUs de 6 GB e incluso en algunos iGPU con memoria unificada suficiente.
- Opciones de despliegue: Transformers + PEFT (carga directa del adaptador), vLLM (servicio del base con adaptadores LoRA o fusionando los pesos previamente), TGI (soporte de adaptadores), llama.cpp/Ollama (requieren fusionar el adaptador en los pesos del base y convertir a GGUF).
- Latencia y throughput estimados: no disponibles. La model card no publica mediciones de tokens por segundo ni de latencia por petición.

## Comparativa con modelos similares

| Modelo | Base | Parametros | Contexto | Metodo de alineacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| `emotional-rlaif-ppo-gemma-2-2b-it` (este) | google/gemma-2-2b-it | 2B | no disponible | PPO (RLAIF) | gemma | Adaptador PEFT en HF |
| `mario-rc/emotional-rlaif-dpo-gemma-2-2b-it` | google/gemma-2-2b-it | 2B | no disponible | DPO (RLAIF) | gemma | Adaptador PEFT en HF |
| `mario-rc/emotional-rlaif-ppo-gemma-2-9b-it` | google/gemma-2-9b-it | 9B | no disponible | PPO (RLAIF) | gemma | Adaptador PEFT en HF |
| `google/gemma-2-2b-it` (modelo base) | no aplica | 2B | no disponible en la informacion proporcionada | RLHF/ajuste instructivo del fabricante | gemma | Pesos completos en HF |

La comparación directa más informativa es contra la variante DPO del mismo autor y contra el modelo base: mismo dataset, misma plantilla de prompt y mismo tamaño, de modo que las diferencias observables se atribuyen al algoritmo de alineación. La principal limitación de esta comparativa es que ninguno de los cuatro modelos publica resultados de benchmarks en la información disponible, por lo que no puede establecerse una jerarquía de rendimiento con datos objetivos.

## Limitaciones y advertencias

- Uso declarado exclusivamente para investigación y experimentación; la model card no recomienda su uso directo en producción sin validación adicional.
- No se publican benchmarks ni evaluaciones de seguridad, sesgo o calidad emocional, por lo que el efecto real del PPO sobre el comportamiento del base es desconocido.
- El modelo declara únicamente inglés (`en`); no hay evidencia de comportamiento correcto en castellano ni en otros idiomas.
- Alineación emocional puede derivar en complacencia excesiva (sycophancy), validación acrítica de las emociones del usuario o respuestas inapropiadamente empáticas en contextos que requieren neutralidad.
- Riesgo de alucinación heredado del modelo base de 2B parámetros, que es el rango con mayor tasa de errores factuales de la familia.
- No debe utilizarse en contextos clínicos, de salud mental, crisis o consejo profesional: no hay validación, supervisión ni garantías de seguridad.
- Licencia Gemma: el uso comercial está sujeto a los Gemma Terms of Use y a la política de uso prohibido de Google; es responsabilidad del integrador revisar y cumplir esas condiciones.
- El adaptador solo funciona cargado sobre `google/gemma-2-2b-it`; no es un modelo autónomo y no puede ejecutarse sin el base.
- Sin datos de hiperparámetros de entrenamiento (rango LoRA, KL penalty, pasos), la reproducibilidad del ajuste no está garantizada.
- El número de descargas (113) y la ausencia de likes indican adopción muy baja y, por tanto, escasa validación por parte de terceros.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/mario-rc/emotional-rlaif-ppo-gemma-2-2b-it
- Modelo base: https://huggingface.co/google/gemma-2-2b-it
- Dataset de entrenamiento: https://huggingface.co/datasets/mario-rc/aif-emotional-generation
- Repositorio del proyecto: https://github.com/Mario-RC/sml-emotional-rlaif
- Variante DPO equivalente (mismo base y tamaño): https://huggingface.co/mario-rc/emotional-rlaif-dpo-gemma-2-2b-it
- Variante PPO sobre Gemma 2 9B: https://huggingface.co/mario-rc/emotional-rlaif-ppo-gemma-2-9b-it
- Variante PPO sobre Mistral 7B Instruct v0.3: https://huggingface.co/mario-rc/emotional-rlaif-ppo-mistral-7b-instruct-v0.3
- Variante PPO sobre Llama 3.2 1B Instruct: https://huggingface.co/mario-rc/emotional-rlaif-ppo-llama-3.2-1b-instruct
- Nota sobre la busqueda web: los resultados devueltos no contienen informacion relevante sobre el modelo; corresponden a paginas de la franquicia de videojuegos Super Mario y se han descartado.
