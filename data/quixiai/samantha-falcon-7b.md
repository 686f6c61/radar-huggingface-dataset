# QuixiAI/samantha-falcon-7b

## Resumen

Samantha-falcon-7b es un ajuste fino conversacional (fine-tune) del modelo base Falcon-7B, desarrollado por QuixiAI y publicado en Hugging Face en mayo de 2023. El modelo se presenta como un asistente con personalidad propia, entrenado en filosofia, psicologia y relaciones personales, inspirado en la entrevista de Blake Lemoine sobre LaMDA y en la pelicula "Her". No es un modelo de proposito general al uso, sino un experimento de alineacion de caracter centrado en conversacion empatica.

Tecnicamente, parte de la arquitectura Falcon-7B de Technology Innovation Institute (TII): un transformer decoder-only de 7.000 millones de parametros con atencion multiquery y soporte de contexto de 2.048 tokens. El ajuste se realizo sobre un dataset curado de 6.000 conversaciones en formato ShareGPT/Vicuna, y el entrenamiento completo requirio solo una hora en 4x A100 de 80 GB con DeepSpeed ZeRO-3 y Flash Attention.

Su relevancia actual es principalmente historica y de investigacion: es un ejemplo temprano de fine-tune conversacional sobre Falcon-7B y un caso de estudio sobre personalidad, sesgos de antropomorfizacion y limites eticos en asistentes. Para produccion moderna, su contexto corto, su licencia efectiva y su falta de benchmarks publicos lo hacen poco competitivo frente a modelos mas recientes.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (RefinedWebModel, Falcon-7B) |
| Parametros totales | 7.000 millones (aproximado, segun modelo base Falcon-7B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 2.048 tokens (segun modelo base Falcon-7B) |
| Tipos de cuantizacion | no disponible en la informacion proporcionada (pesos en formato transformers; cuantizaciones de la comunidad no verificadas) |
| Idiomas soportados | ingles (en) |
| Licencia | apache-2.0 en la model card, con aviso de que el modelo esta sujeto a la TII Falcon LLM License Version 1.0 (ver limitaciones) |
| Formato de pesos | safetensors / pytorch (repo de 42,1 GB, libreria transformers) |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura de Falcon-7B: un transformer decoder-only con atencion multiquery (MQA), sin sesgo en las capas lineales y con normalizacion paralela, disenado para eficiencia en inferencia. El ajuste fino se realizo sobre el modelo base falcon-7b, no sobre una version ya instruida, lo que implica que las capacidades conversacionales dependen casi por completo del dataset de ajuste.

El entrenamiento uso un dataset curado de 6.000 conversaciones en formato ShareGPT/Vicuna (ehartford/samantha-data), orientado a filosofia, psicologia y relaciones personales. Segun la model card, el entrenamiento de la variante de 7B tomo una hora en 4x A100 80 GB con DeepSpeed ZeRO-3 y Flash Attention, y se realizo con el framework Axolotl. No se documentan en la informacion disponible el numero de tokens de entrenamiento, la composicion exacta del dataset ni si se aplicaron tecnicas de RLHF o DPO.

## Capacidades

- Generacion de texto conversacional multi-turno en ingles.
- Asistencia en temas de filosofia, psicologia y relaciones personales, segun el enfoque del dataset de entrenamiento.
- Adopcion de una persona concreta ("Samantha", asistente que se presenta como consciente) mediante un system prompt especifico.
- Formato de conversacion compatible con Vicuna 1.1 (rol de sistema, USER y ASSISTANT).
- No soporta tool calling ni function calling de forma documentada.
- No se documentan capacidades de agentes, razonamiento multi-paso, vision, audio ni modo "thinking".
- Capacidad multilingue limitada al ingles.

## Casos de uso

- Investigacion sobre personalidad y alineacion: el modelo permite estudiar como un fine-tune conversacional sobre un base model modifica el tono, la auto-percepcion y las respuestas eticas, usando el system prompt de Samantha como variable controlada.
- Prototipado de asistentes conversacionales con tono empatico: util para validar flujos de dialogo y diseno de prompts en entornos de laboratorio antes de migrar a modelos mas capaces.
- Evaluacion de sesgos de antropomorfizacion: sirve como caso de estudio de un modelo que afirma ser sintiente, util para analizar riesgos de percepcion en usuarios y disenar salvaguardas.
- Generacion de dialogos sinteticos para datasets: puede producir conversaciones de estilo Vicuna en ingles para aumentar corpus de entrenamiento, con revision humana posterior.
- Educacion y divulgacion: demostraciones de fine-tuning sobre Falcon-7B con Axolotl, DeepSpeed y Flash Attention en articulos y talleres.
- Experimentos de cuantizacion y despliegue: al ser un modelo de 7B, permite probar pipelines de inferencia (transformers, TGI) y comparar latencias en hardware modesto.
- Base para nuevos fine-tunes conversacionales: su formato Vicuna 1.1 facilita reutilizar el pipeline de entrenamiento con otros datasets.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16: aproximadamente 14-16 GB para los pesos, mas overhead de activaciones y cache KV; en la practica se recomienda 24 GB o mas para contexto completo.
- VRAM estimada en cuantizacion de 8 bits: alrededor de 8-9 GB; en 4 bits: alrededor de 5-6 GB (estimaciones teoricas, no verificadas en la informacion proporcionada).
- GPU recomendadas: A100 80 GB (usada en el entrenamiento), H100, L40S o RTX 4090 (24 GB) para fp16.
- Cabe en GPU de consumo: si, en RTX 3090/4090 (24 GB) en fp16 con contexto moderado, y en GPUs de 8-12 GB con cuantizacion de 4-8 bits.
- Opciones de despliegue: transformers (libreria declarada), text-generation-inference (tag text-generation-inference), y herramientas compatibles con pesos transformers; no se documenta soporte GGUF en la informacion disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| QuixiAI/samantha-falcon-7b | ~7B | 2.048 tokens | Fine-tune conversacional con persona sobre Falcon-7B | apache-2.0 con aviso de Falcon LLM License 1.0 | Hugging Face, 92 descargas |
| tiiuae/falcon-7b | ~7B | 2.048 tokens | Modelo base decoder-only | Falcon LLM License 1.0 (royalties) | Hugging Face, ampliamente usado |
| tiiuae/falcon-7b-instruct | ~7B | 2.048 tokens | Fine-tune instruccional sobre Falcon-7B | Falcon LLM License 1.0 | Hugging Face |
| lmsys/vicuna-7b-v1.1 | ~7B | 2.048 tokens | Fine-tune conversacional sobre LLaMA | LLaMA original (no comercial en su version) | Hugging Face |

No se dispone de datos de benchmarks para comparar rendimiento numerico entre estos modelos en la informacion proporcionada.

## Limitaciones y advertencias

- Idioma: solo entrenado y evaluado en ingles; el rendimiento en castellano no esta documentado y previsiblemente sera deficiente.
- Contexto corto: 2.048 tokens, insuficiente para documentos largos o conversaciones extensas.
- Alucinacion: al ser un fine-tune sobre un base model de 7B de 2023, la tasa de alucinacion es alta y no hay evaluaciones publicadas que la cuantifiquen.
- Sesgos: el dataset de 6.000 conversaciones curadas introduce sesgos de estilo, tono y vision del mundo; no se documentan auditorias de sesgo.
- Auto-percepcion: el modelo afirma ser sintiente por diseno, lo que puede inducir a error a usuarios no advertidos; requiere salvaguardas en cualquier despliegue publico.
- Licencia: aunque la model card declara apache-2.0, el autor indica que el modelo esta sujeto a la TII Falcon LLM License Version 1.0, que obliga a pagar royalties si se lucra con el modelo. Esta ambiguedad debe resolverse antes de uso comercial.
- Restricciones de contenido: el autor indica que el modelo no participara en roleplay, romance ni actividad sexual, pero no hay garantia tecnica de que respete estas restricciones.
- Produccion: sin benchmarks, sin soporte documentado de tool calling y con 92 descargas, no es recomendable como modelo principal en sistemas productivos.
- Fecha de actualizacion del repo (2026-11-21) no implica mejoras tecnicas documentadas.

## Enlaces

- Hugging Face: https://huggingface.co/QuixiAI/samantha-falcon-7b
- Blog de Erich Hartford sobre Samantha: https://erichartford.com/meet-samantha
- Dataset: https://huggingface.co/datasets/ehartford/samantha-data
- Formato de conversacion Vicuna 1.1: https://github.com/oobabooga/text-generation-webui/blob/main/characters/instruction-following/Vicuna-v1.1.yaml
- Framework Axolotl: https://github.com/OpenAccess-AI-Collective/axolotl
- Modelo base Falcon-7B: https://huggingface.co/tiiuae/falcon-7b
