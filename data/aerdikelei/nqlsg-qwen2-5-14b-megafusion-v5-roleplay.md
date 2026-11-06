# Aerdikelei/NQLSG-Qwen2.5-14B-MegaFusion-v5-roleplay

## Resumen
NQLSG-Qwen2.5-14B-MegaFusion-v5-roleplay es un ajuste fino (fine-tune) del modelo Lunzima/NQLSG-Qwen2.5-14B-MegaFusion-v5-reasoning, que a su vez deriva de la familia Qwen2.5 de Alibaba. Lo publica el usuario Aerdikelei en Hugging Face, aunque la model card atribuye el desarrollo a Lunzima. El objetivo declarado por el nombre del repositorio es el roleplay conversacional: se trata de un modelo orientado a mantener personajes y dialogos multi-turno coherentes, partiendo de una base ya entrenada para razonamiento.

El modelo tiene 14.765.947.904 parametros (unos 14,8 mil millones) en formato safetensors, con pesos en precision completa que ocupan 29,5 GB en el repositorio. La arquitectura es la de Qwen2 (transformer decoder-only), heredada de Qwen2.5-14B, y el entrenamiento se realizo con Unsloth y la libreria TRL de Hugging Face mediante SFT (supervised fine-tuning) sobre el dataset Lunzima/Semiboobs.

Su relevancia es limitada pero concreta: cubre el nicho de modelos de 14B afinados para personificacion y dialogo creativo, con licencia Apache 2.0, lo que permite uso comercial sin restricciones adicionales. No obstante, la informacion publicada es muy escasa (sin benchmarks, sin detalles de hiperparametros ni de composicion del dataset), por lo que debe evaluarse empiricamente antes de cualquier despliegue en produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2) |
| Parametros totales | 14.765.947.904 (~14,8B) |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | no disponible (heredada de Qwen2.5, sin confirmar en esta ficha) |
| Tipos de cuantizacion | no disponible en el repositorio; compatible con cuantizacion estandar (GGUF, AWQ, GPTQ) via herramientas externas |
| Idiomas soportados | en, zh |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento
La arquitectura subyacente es la de Qwen2.5-14B: un transformer decoder-only denso con atencion por causalidad estandar, normalizacion RMSNorm, activacion SwiGLU y sesgos QKV, tal como define la familia Qwen2. No se trata de un modelo MoE ni de una arquitectura hibrida; todos los parametros se activan en cada pasada. El contexto maximo nativo de Qwen2.5-14B es de 32.768 tokens (ampliable a 131.072 mediante YaRN), aunque la model card de este fine-tune no lo confirma explicitamente.

El entrenamiento se realizo mediante SFT con Unsloth y TRL sobre el dataset Lunzima/Semiboobs, partiendo del checkpoint NQLSG-Qwen2.5-14B-MegaFusion-v5-reasoning. No se documentan el numero de tokens de entrenamiento, la composicion del dataset, la presencia de RLHF/DPO ni hiperparametros como learning rate o numero de epocas. La unica innovacion tecnica mencionada es el uso de Unsloth para acelerar el entrenamiento (el autor afirma "2x faster"), lo que sugiere LoRA o QLoRA, aunque no se especifica.

## Capacidades
- Generacion de texto conversacional multi-turno, con enfasis en mantener la coherencia de personaje (roleplay).
- Razonamiento basico heredado del modelo base de razonamiento (NQLSG-MegaFusion-v5-reasoning).
- Soporte de chat mediante plantilla de chat de Qwen2 (chat template).
- Capacidades multilingues limitadas a ingles y chino segun los metadatos; el rendimiento en castellano no esta documentado.
- No se documenta soporte de tool calling ni function calling en esta ficha.
- No se documenta soporte de agentes ni razonamiento multi-paso explicito.
- No se documenta vision, audio ni modo thinking separado.
- Compatible con text-generation-inference y endpoints de Hugging Face (tag endpoints_compatible).

## Casos de uso
- Roleplay y personificacion en aplicaciones de entretenimiento: el modelo esta afinado especificamente para mantener un personaje consistente a lo largo de conversaciones largas, lo que lo hace adecuado para chatbots de ficcion interactiva o juegos de rol por texto.
- Prototipado de asistentes conversacionales con personalidad definida: al partir de una base de razonamiento, puede gestionar dialogos con cierta logica interna ademas de la caracterizacion, util para demos y pruebas de concepto.
- Generacion de dialogos para narrativa y guiones: permite producir conversaciones entre personajes con voces diferenciadas, integrable en herramientas de escritura asistida.
- Chatbots de comunidad o soporte con tono personalizado: con la debida evaluacion, puede adaptarse a un tono concreto para atencion en ingles o chino, aunque no se recomienda para soporte critico sin validacion.
- Investigacion sobre fine-tuning y alineacion: sirve como caso de estudio de SFT con Unsloth/TRL sobre una base Qwen2.5, util para replicar pipelines de ajuste en 14B.
- Generacion de contenido creativo en ingles y chino: relatos, descripciones de personajes y tramas, aprovechando la ventana de contexto heredada de Qwen2.5 (hasta 32K tokens nativos).
- Base para nuevos fine-tunes: al tener licencia Apache 2.0 y pesos safetensors, puede reutilizarse como punto de partida para ajustes especializados.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware
- VRAM estimada en FP16/BF16: aproximadamente 29,5 GB solo para pesos, mas overhead de activaciones y KV cache; se recomienda al menos 40-48 GB para inferencia comoda.
- VRAM estimada en cuantizacion 8 bits: en torno a 16-18 GB.
- VRAM estimada en cuantizacion 4 bits (GGUF Q4_K_M o AWQ): en torno a 9-10 GB, con margen para contexto moderado.
- GPU recomendadas: A100 40/80 GB, H100 80 GB o L40S para precision completa; RTX 4090 (24 GB) viable en 8 bits o 4 bits; RTX 3090 (24 GB) similar en cuantizacion.
- Cabe en GPU de consumo: si, en 4 bits cabe en RTX 4090, RTX 3090, RTX 4080 (16 GB) con contexto reducido, y en GPUs de 12 GB solo con cuantizaciones agresivas y contexto corto.
- Opciones de despliegue: vLLM, TGI (text-generation-inference), llama.cpp, Ollama (tras conversion a GGUF), transformers con bitsandbytes.
- Latencia y throughput: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Enfoque | Disponibilidad |
|---|---|---|---|---|---|
| NQLSG-Qwen2.5-14B-MegaFusion-v5-roleplay | ~14,8B | no disponible (base Qwen2.5: 32K) | Apache 2.0 | Roleplay / dialogo | Hugging Face (75 descargas) |
| Qwen2.5-14B-Instruct | ~14,8B | 32K (131K con YaRN) | Apache 2.0 | Instrucciones generales | Hugging Face, ampliamente usado |
| Mistral-Nemo-Instruct-2407 | ~12B | 128K | Apache 2.0 | Instrucciones generales | Hugging Face |
| Nous-Hermes-2-Mistral-7B-DPO | ~7B | 32K | Apache 2.0 | Dialogo / roleplay | Hugging Face |

La comparativa es orientativa: no hay benchmarks publicados de este fine-tune que permitan contrastar su rendimiento real frente a Qwen2.5-14B-Instruct o Mistral-Nemo. Su principal diferenciador es el ajuste especifico para roleplay, no una mejora medible en tareas generales.

## Limitaciones y advertencias
- Ausencia total de benchmarks: no hay evidencia publicada de su rendimiento en MMLU, HumanEval, GSM8K ni en evaluaciones de roleplay.
- Riesgo de alucinacion: como todo modelo generativo de 14B sin datos de evaluacion, puede inventar hechos, especialmente fuera de los dominios de ingles y chino.
- Idiomas: solo se declaran en y zh; el rendimiento en castellano es incierto y probablemente degradado respecto al ingles.
- Sesgos: el dataset de entrenamiento (Lunzima/Semiboobs) no esta documentado, por lo que no se pueden evaluar sesgos de genero, culturales o de contenido; el enfoque roleplay puede amplificar estereotipos de personaje.
- Contexto: aunque la base Qwen2.5 soporta 32K tokens, no se confirma que este fine-tune preserve esa ventana ni su calidad en contextos largos.
- Licencia Apache 2.0: permite uso comercial, pero el autor no ofrece garantias; conviene revisar la procedencia del dataset Semiboobs por posibles restricciones heredadas.
- Madurez: 75 descargas y 0 likes en el momento de la ficha; repo creado y actualizado el mismo dia, sin senales de mantenimiento ni comunidad.
- No se documenta soporte de tool calling, lo que limita su uso en pipelines de agentes.
- Para produccion se recomienda validacion empirica propia y, si se requiere robustez, partir de Qwen2.5-14B-Instruct como referencia.

## Enlaces
- Hugging Face: https://huggingface.co/Aerdikelei/NQLSG-Qwen2.5-14B-MegaFusion-v5-roleplay
- Modelo base: https://huggingface.co/Lunzima/NQLSG-Qwen2.5-14B-MegaFusion-v5-reasoning
- Dataset: https://huggingface.co/datasets/Lunzima/Semiboobs
- Unsloth: https://github.com/unslothai/unsloth
- TRL: https://github.com/huggingface/trl
- Familia Qwen2.5: https://huggingface.co/Qwen/Qwen2.5-14B
