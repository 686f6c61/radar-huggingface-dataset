# moltherm1/olmo-mirror-olmo-2-1124-7b-instruct

## Resumen

OLMo-2-1124-7B-Instruct es la variante final post-entrenada del modelo base OLMo 2 7B de noviembre de 2024, desarrollado por el Allen Institute for AI (Ai2). Este repositorio concreto (`moltherm1/olmo-mirror-olmo-2-1124-7b-instruct`) es un espejo del modelo oficial `allenai/OLMo-2-1124-7B-Instruct`, publicado por un tercero. El modelo resuelve el problema de disponer de un LLM de 7B completamente abierto, con pesos, código de entrenamiento, datos y logs publicados, lo que permite reproducibilidad e investigación sobre el pipeline completo de post-entrenamiento.

La arquitectura es un transformer decoder-only denso de aproximadamente 7.000 millones de parámetros, entrenado sobre el corpus Dolma. El post-entrenamiento sigue tres etapas: SFT sobre una variante específica de Tülu 3, DPO sobre un mix de preferencias y, finalmente, RLVR (Reinforcement Learning with Verifiable Rewards) usando el dataset RLVR-GSM. El resultado es un modelo orientado a chat con refuerzo en tareas verificables como matemáticas y seguimiento de instrucciones.

Es relevante ahora porque representa uno de los pocos modelos de 7B con licencia Apache 2.0, linaje de entrenamiento completamente documentado y artefactos intermedios publicados (base, SFT, DPO, RM). Esto lo convierte en una pieza clave para investigación en alineación, evaluación abierta (OLMES) y despliegue comercial sin restricciones de licencia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso (OLMo 2) |
| Parametros totales | ~7.000 millones (7B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | no disponible en la informacion proporcionada (pesos en bfloat16 en el repo) |
| Idiomas soportados | Ingles (principal) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (repo de 10,0 GB, libreria transformers) |

## Arquitectura y entrenamiento

OLMo 2 es un transformer decoder-only denso. El modelo base `OLMo2-7B-1124` se entrena sobre el dataset Dolma, con una mezcla de datos publicos, sinteticos y creados por humanos. Sobre esa base se aplica un pipeline de post-entrenamiento en tres fases documentadas: SFT sobre una variante especifica de Tülu 3 para OLMo 2 (`allenai/tulu-3-sft-olmo-2-mixture`), DPO sobre `allenai/olmo-2-1124-7b-preference-mix` y, finalmente, RLVR sobre `allenai/RLVR-GSM`, que proporciona recompensas verificables en tareas de matemáticas y razonamiento.

Una innovacion relevante del linaje OLMo 2 es la publicacion completa de artefactos intermedios (base, SFT, DPO, RM e Instruct), lo que permite estudiar cada etapa del post-entrenamiento de forma aislada. Ademas, Ai2 corrigio en enero de 2025 un desajuste de pre-tokenizacion entre modelos base y post-entrenados, republicando los modelos corregidos bajo el mismo nombre y dejando los antiguos con el sufijo `-preview`. El ajuste RLVR con recompensas verificables es la innovacion principal de esta variante Instruct frente al checkpoint DPO intermedio.

## Capacidades

- Generacion de texto y conversacion multi-turno en ingles mediante chat template con tokens especiales `<|user|>` y `<|assistant|>`.
- Razonamiento matematico reforzado mediante RLVR sobre GSM (problemas de matemáticas de nivel escolar).
- Seguimiento de instrucciones (IFEval) gracias al SFT sobre Tülu 3.
- Razonamiento de sentido comun y tareas BBH.
- Razonamiento sobre lectura y DROP.
- Capacidad de chat con system prompt (aunque el modelo no fue entrenado especificamente con uno fijo; Ai2 usa por defecto "You are OLMo 2, a helpful and harmless AI Assistant built by the Allen Institute for AI.").
- Soporte de `apply_chat_template` en el tokenizer.
- Compatible con endpoints de Hugging Face (`endpoints_compatible` en los tags).
- No se documenta soporte de tool calling, function calling, vision, audio ni modo thinking explicito en la informacion proporcionada.

## Casos de uso

- Investigacion en alineacion y post-entrenamiento: al publicarse los checkpoints base, SFT, DPO, RM e Instruct, se puede reproducir y aislar el efecto de cada etapa (SFT, DPO, RLVR) sobre el mismo modelo base, algo imposible con modelos de pesos cerrados.
- Evaluacion abierta con OLMES: el repositorio de evaluacion de Ai2 permite correr suites estandarizadas (MMLU, GSM8K, IFEval, BBH, DROP) sobre este checkpoint y compararlo con otros modelos de 7B bajo el mismo protocolo.
- Chatbot de dominio general en ingles: el modelo puede desplegarse como asistente conversacional con contexto multi-turno usando el chat template incluido en el tokenizer, sin coste de licencia al ser Apache 2.0.
- Tutor de matematicas de nivel escolar: el entrenamiento RLVR sobre GSM lo hace adecuado para resolver y explicar problemas aritmeticos y de razonamiento paso a paso en ingles.
- Fine-tuning especifico de dominio: al ser un modelo de 7B con licencia permisiva, se puede ajustar sobre datos propios (legal, sanitario, atencion al cliente) sin las restricciones de licencia de modelos como Llama, y publicar los derivados.
- Base para destilacion o experimentos de cuantizacion: su tamano de 7B y formato safetensors permiten generar variantes GGUF/AWQ/GPTQ y estudiar el impacto de la cuantizacion en tareas de razonamiento verificable.
- Generacion de datos sinteticos: util para producir pares pregunta-respuesta y trazas de razonamiento en ingles que alimenten pipelines de entrenamiento de modelos mayores o de reward models.

## Benchmarks y rendimiento

La model card incluye una tabla de rendimiento con las columnas Model, Average, AlpacaEval, BBH, DROP, GSM8k e IFEval, pero los valores numericos no estan presentes en la informacion proporcionada. No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bfloat16: aproximadamente 14-16 GB para los pesos (7B x 2 bytes) mas overhead de activaciones y KV cache; en la practica se recomienda 16-24 GB.
- Cuantizacion 8 bits: ~7-8 GB de VRAM; cuantizacion 4 bits: ~4-5 GB (estimaciones teoricas, no verificadas en la informacion proporcionada).
- GPU recomendadas para bf16 sin cuantizar: A100 40/80 GB, H100, L40S, RTX A6000; en consumer, RTX 4090 (24 GB) cabe con margen.
- Cabe en consumer GPU: si, en RTX 4090 (24 GB) y potencialmente en RTX 3090 (24 GB) en bf16; en GPUs de 8-12 GB solo con cuantizacion 4/8 bits.
- Opciones de despliegue: transformers (requiere version main de transformers segun la model card), vLLM, TGI, llama.cpp/Ollama (previa conversion a GGUF, no incluida en el repo), y endpoints de Hugging Face.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Artefactos publicados | Notas |
|---|---|---|---|---|---|
| OLMo-2-1124-7B-Instruct (este) | ~7B | no disponible | Apache 2.0 | Base, SFT, DPO, RM, Instruct, datos y codigo | Linaje completamente abierto |
| OLMo-2-1124-13B-Instruct | ~13B | no disponible | Apache 2.0 | Base, SFT, DPO, RM, Instruct | Version mayor de la misma familia |
| Llama 3.1 8B Instruct | ~8B | no disponible | Llama 3.1 Community License | Solo pesos finales | Licencia no OSI, restricciones de uso |
| Mistral 7B Instruct | ~7B | no disponible | Apache 2.0 | Solo pesos finales | Sin datos ni logs de entrenamiento |

La comparativa se limita a datos estructurales; no se dispone de cifras de benchmark en la informacion proporcionada para contrastar rendimiento.

## Limitaciones y advertencias

- Entrenamiento de seguridad limitado: la model card advierte explicitamente que los modelos OLMo 2 tienen poco entrenamiento de seguridad y pueden producir salidas problematicas, especialmente si se les induce.
- Idioma: principalmente ingles; el rendimiento en castellano no esta garantizado ni evaluado.
- Riesgo de alucinacion: inherente a los LLM de esta escala; no se documentan mitigaciones especificas en la model card.
- Sesgos: el modelo se entrena sobre Dolma y mezclas de Tülu 3; pueden heredarse sesgos de esos corpus, aunque no se detallan sesgos conocidos concretos en la informacion proporcionada.
- Licencia Apache 2.0: permite uso comercial sin restricciones de atribucion mas alla de la licencia, pero no exime de responsabilidad sobre las salidas.
- Este repositorio es un espejo de terceros (`moltherm1`), no el oficial de Ai2; para produccion se recomienda usar `allenai/OLMo-2-1124-7B-Instruct` y verificar integridad de pesos.
- Requiere una version reciente (main) de transformers segun la model card; puede fallar en versiones estables antiguas.
- No se documenta soporte de tool calling, agentes multi-paso, vision ni audio; no debe asumirse.
- Longitud de contexto no especificada en la informacion proporcionada; conviene verificarla antes de disenar aplicaciones con ventanas largas.

## Enlaces

- Repositorio Hugging Face (espejo): https://huggingface.co/moltherm1/olmo-mirror-olmo-2-1124-7b-instruct
- Modelo oficial: https://huggingface.co/allenai/OLMo-2-1124-7B-Instruct
- Modelo base: https://huggingface.co/allenai/OLMo2-7B-1124
- Checkpoint SFT: https://huggingface.co/allenai/OLMo-2-1124-7B-SFT
- Checkpoint DPO: https://huggingface.co/allenai/OLMo-2-1124-7B-DPO
- Reward model: https://huggingface.co/allenai/OLMo-2-1124-7B-RM
- Dataset SFT (Tülu 3 OLMo 2): https://huggingface.co/datasets/allenai/tulu-3-sft-olmo-2-mixture
- Dataset de preferencias DPO: https://huggingface.co/datasets/allenai/olmo-2-1124-7b-preference-mix
- Dataset RLVR-GSM: https://huggingface.co/datasets/allenai/RLVR-GSM
- Coleccion de modelos preview: https://huggingface.co/collections/allenai/olmo-2-preview-post-trained-models-6762f662c660962e52de7c96
- Pagina del proyecto OLMo: https://allenai.org/olmo
- Repositorio de entrenamiento/inferencia: https://github.com/allenai/OLMo
- Codigo de evaluacion (OLMES): https://github.com/allenai/olmes
- Codigo de fine-tuning (Open-Instruct): https://github.com/allenai/open-instruct
- Paper OLMo 2: https://arxiv.org/abs/2501.00656
- Paper Tülu 3: https://arxiv.org/abs/2411.15124
- Demo (playground de Ai2): https://playground.allenai.org/
