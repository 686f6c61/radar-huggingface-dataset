# Phuc-HugigFace/Llama-3.2-1B-vi-sft

## Resumen
Llama-3.2-1B-vi-sft es un ajuste fino del modelo Llama 3.2 1B, publicado por el usuario Phuc-HugigFace sobre el checkpoint base unsloth/llama-3.2-1b-unsloth-bnb-4bit. Se trata de un modelo decoder-only de 1.235.814.400 parametros (aproximadamente 1,24 mil millones), pensado para generacion de texto y uso conversacional, y entrenado con las librerias Unsloth y TRL de Hugging Face, que el autor indica que permiten un entrenamiento "2x mas rapido".

El interes principal de esta ficha es acotado: se trata de un ajuste fino de proposito no documentado (el sufijo "vi" del nombre sugiere vietnamita, pero la model card etiqueta el idioma como "en"), con cero descargas y cero likes en el momento de la consulta, y sin resultados de benchmarks publicados. Resulta relevante mas como ejemplo de pipeline de fine-tuning ligero con Unsloth sobre Llama 3.2 1B que como modelo listo para produccion.

La model card es minima: no especifica dataset de entrenamiento, numero de tokens, metodo de alineacion (RLHF/DPO/SFT) ni hiperparametros. Cualquier evaluacion seria del modelo requiere pruebas propias, dado que la documentacion disponible es insuficiente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Llama 3.2; heredada del modelo base) |
| Parametros totales | 1.235.814.400 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible en la model card (el modelo base Llama 3.2 1B soporta 128.000 tokens) |
| Tipos de cuantizacion | no disponible (el modelo base estaba en bnb-4bit; el repo publica safetensors) |
| Idiomas soportados | en (segun tag de la model card); el nombre del modelo sugiere "vi" (vietnamita), no confirmado |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento
El modelo hereda la arquitectura de Llama 3.2 1B: transformer decoder-only con normalizacion RMSNorm, activacion SwiGLU, embeddings de entrada y salida atados (tied embeddings), RoPE para codificacion posicional y atencion con consultas agrupadas (GQA). El checkpoint base declarado es unsloth/llama-3.2-1b-unsloth-bnb-4bit, una version ya cuantizada a 4 bits con bitsandbytes preparada por Unsloth para fine-tuning eficiente en memoria.

El ajuste fino se realizo con Unsloth y la libreria TRL de Hugging Face, segun la model card. No se especifican el dataset, el numero de tokens de entrenamiento, la composicion de los datos, ni si se aplico SFT, DPO o RLHF. Tampoco hay informacion sobre tecnicas adicionales como decodificacion especulativa o atencion lineal. Todo lo relativo al proceso de entrenamiento queda, por tanto, sin documentar.

## Capacidades
- Generacion de texto autoregresiva y uso conversacional (etiqueta "conversational" en HuggingFace).
- Compatibilidad con text-generation-inference y endpoints_compatible, lo que permite desplegarlo en infraestructuras de inferencia estandar.
- Capacidades de tool calling / function calling: no documentadas; el modelo base Llama 3.2 1B las soporta, pero el fine-tuning puede haber degradado esta habilidad.
- Razonamiento multi-paso y uso como agente: no documentado.
- Capacidades multilingues: la model card solo etiqueta "en"; pese al sufijo "vi" del nombre, no hay confirmacion de soporte de vietnamita.
- Capacidades especiales (vision, audio, modo pensamiento): no disponibles.

## Casos de uso
- Prototipado de asistentes conversacionales ligeros: por su tamano de 1,24B parametros, el modelo puede ejecutarse en una unica GPU consumer para validar flujos conversacionales antes de escalar a modelos mayores.
- Generacion de texto de bajo coste en entornos con recursos limitados: util para tareas de resumen o parafraseo donde no se requiere alta precision y si latencia baja.
- Experimentacion academica con fine-tuning: sirve como referencia reproducible de un pipeline Unsloth + TRL sobre Llama 3.2 1B, util para comparar tecnicas de ajuste eficiente.
- Clasificacion o etiquetado de texto mediante prompts: con contexto corto y tareas simples (categorizacion, extraccion ligera) puede ser suficiente en CPU o GPU modesta.
- Generacion aumentada por recuperacion (RAG) en dominios acotados: integrable en pipelines con vLLM o TGI si el contexto del caso de uso no supera lo que el fine-tuning haya preservado.
- Educacion y demos interactivas: el modelo cabe en portatiles con GPU discreta, lo que facilita talleres y demostraciones sin infraestructura cloud.
- No se recomienda su uso en produccion critica sin evaluacion previa, dado que no hay benchmarks ni documentacion de entrenamiento.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas (MMLU, HumanEval, GSM8K, MT-Bench u otras), y los resultados de busqueda web asociados a esta consulta no contienen informacion relevante (devuelven exclusivamente documentacion de Google Maps, sin relacion con el modelo).

## Requisitos de hardware
- VRAM estimada para inferencia en FP16: aproximadamente 2,5 GB solo de pesos, mas cache KV; en la practica, entre 3 y 4 GB.
- VRAM estimada en cuantizacion INT8: aproximadamente 1,3 GB de pesos.
- VRAM estimada en cuantizacion INT4: aproximadamente 0,7 GB de pesos; puede ejecutarse en GPUs con 4 GB o incluso menos si se exporta a GGUF.
- GPUs recomendadas: cabe sobradamente en RTX 3060, RTX 4060, RTX 4090, A10G, L4, T4; tambien en A100 y H100 sin aprovechar su capacidad.
- Cabe en GPU consumer: si, en practicamente cualquier GPU dedicada moderna, e incluso en CPU con llama.cpp aunque con latencia alta.
- Opciones de despliegue: transformers (formato publicado), text-generation-inference (etiqueta soportada), vLLM, Ollama o llama.cpp previa conversion a GGUF (no incluida en el repo).
- Latencia y throughput estimados: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Llama-3.2-1B-vi-sft (este) | 1,24B | no disponible | apache-2.0 | HuggingFace, 0 descargas |
| meta-llama/Llama-3.2-1B-Instruct | 1,24B | 128.000 tokens | Llama 3.2 Community License | Ampliamente disponible |
| Qwen/Qwen2.5-1.5B-Instruct | 1,54B | 32.768 tokens | apache-2.0 | Ampliamente disponible |
| HuggingFaceTB/SmolLM2-1.7B-Instruct | 1,71B | 8.192 tokens | apache-2.0 | Ampliamente disponible |

No se dispone de datos de rendimiento comparativo para este fine-tuning concreto. La comparativa se limita a parametros, contexto y licencia.

## Limitaciones y advertencias
- Documentacion insuficiente: no se especifica dataset, tokens de entrenamiento ni metodo de alineacion, lo que impide auditar el comportamiento del modelo.
- Riesgo de alucinacion elevado: por su tamano (1,24B) y por la falta de datos de evaluacion, es esperable un rendimiento limitado en tareas de razonamiento y factualidad.
- Discrepancia de idioma: el nombre sugiere vietnamita ("vi"), pero la model card solo declara "en"; el idioma real de salida no esta verificado.
- Sesgos desconocidos: no hay analisis de sesgos ni evaluacion de seguridad publicados.
- Restricciones de licencia: apache-2.0 permite uso comercial, pero conviene verificar que los terminos del modelo base Llama 3.2 (Llama 3.2 Community License) no impongan condiciones adicionales sobre el derivado.
- Adopcion nula: cero descargas y cero likes en el momento de la consulta; no hay evidencia de uso comunitario ni validacion externa.
- Posible degradacion del modelo base: el fine-tuning puede haber reducido capacidades de tool calling, multilingues o de instruccion presentes en Llama 3.2 1B Instruct.
- Fecha de creacion futura en los metadatos (2026), lo que sugiere un artefacto de prueba mas que un modelo mantenido.

## Enlaces
- HuggingFace: https://huggingface.co/Phuc-HugigFace/Llama-3.2-1B-vi-sft
- Modelo base: https://huggingface.co/unsloth/llama-3.2-1b-unsloth-bnb-4bit
- Unsloth: https://github.com/unslothai/unsloth
- TRL de Hugging Face: https://github.com/huggingface/trl
- Llama 3.2 (Meta): https://huggingface.co/meta-llama/Llama-3.2-1B-Instruct
- No se han encontrado papers, blogs ni demos adicionales especificos de este modelo en la busqueda web.
