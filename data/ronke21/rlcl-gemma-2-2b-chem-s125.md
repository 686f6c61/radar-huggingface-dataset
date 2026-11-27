# ronke21/rlcl-gemma-2-2b-chem-s125

## Resumen

rlcl-gemma-2-2b-chem-s125 es un ajuste fino (fine-tuning) del modelo google/gemma-2-2b, publicado por el usuario ronke21 en Hugging Face. Por los tags del repositorio (rlcl, forgetting, lora-merged) se trata de un modelo derivado de un proceso de entrenamiento con LoRA cuyos pesos se han fusionado en el modelo base, orientado a un estudio sobre olvido catastrófico (catastrophic forgetting) en el contexto de RLCL. El sufijo "chem-s125" sugiere una especialización o un checkpoint asociado a un dominio quimico y a un paso o semilla concreta, aunque el repositorio no documenta esta nomenclatura.

El modelo conserva la arquitectura y el tamano del gemma-2-2b original: 2.614.341.888 parametros y aproximadamente 5,3 GB de pesos en formato safetensors. No se ha publicado informacion sobre la composicion del dataset de ajuste, el numero de tokens de entrenamiento ni los hiperparametros utilizados, por lo que su evaluacion queda limitada a lo que puede inferirse del modelo base y de los tags.

Su relevancia es acotada: se trata de un artefacto de investigacion con cero descargas y cero likes en el momento de la consulta, acceso restringido (gated) y sin licencia declarada. Resulta util como referencia para quienes estudian tecnicas de mitigacion del olvido en ajustes finos de modelos pequenos, pero no como modelo de produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Gemma 2), segun modelo base google/gemma-2-2b |
| Parametros totales | 2.614.341.888 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la ficha del repositorio; el modelo base gemma-2-2b soporta 8192 tokens |
| Tipos de cuantizacion | no disponible (el repo solo publica safetensors en precision original) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (libreria transformers) |

## Arquitectura y entrenamiento

La arquitectura corresponde a la del modelo base google/gemma-2-2b: un transformer decoder-only con atencion por ventanas alternada y atencion global, normalizacion RMSNorm y embeddings rotatorios, disenado para inferencia eficiente en GPU de consumo. El ajuste fino se realizo mediante LoRA y posteriormente se fusionaron los adaptadores en los pesos base, segun el tag lora-merged. El tag rlcl y forgetting indica que el entrenamiento se enmarca en un experimento sobre aprendizaje continuo y olvido de conocimiento previo.

No se dispone de informacion sobre el volumen de tokens de entrenamiento, la composicion del dataset, el uso de RLHF o DPO, ni sobre innovaciones tecnicas adicionales. Tampoco se documenta si se aplicaron tecnicas de regularizacion especificas para preservar las capacidades del modelo base mas alla de lo que sugiere el tag forgetting.

## Capacidades

- Generacion de texto conversacional, heredada del modelo base gemma-2-2b.
- Razonamiento basico y respuesta a instrucciones en formato chat, segun la configuracion conversational del repositorio.
- Especializacion probable en dominio quimico (por el sufijo "chem"), no verificada ni documentada.
- Soporte de tool calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponibles; el modelo base gemma-2-2b es multilingue, pero no se especifica que idiomas conserva tras el ajuste.
- Capacidades especiales (vision, audio, modo thinking): no disponibles.

## Casos de uso

- Investigacion sobre olvido catastrófico: el modelo sirve como punto de comparacion para medir cuanto conocimiento general del gemma-2-2b se pierde tras un ajuste fino con LoRA fusionado en un dominio especifico.
- Experimentos de ajuste eficiente: util como referencia de un pipeline LoRA + merge sobre un modelo de 2B, replicable en una unica GPU de consumo.
- Evaluacion de especializacion en quimica: si el sufijo "chem" es correcto, puede emplearse para probar la retencion de terminologia y razonamiento quimico frente al modelo base.
- Prototipado de asistentes conversacionales de dominio acotado en entornos de laboratorio, siempre que se acepte el acceso restringido del repositorio.
- Benchmarking de tecnicas de regularizacion: comparar su rendimiento en tareas generales (MMLU, GSM8K) contra el gemma-2-2b original para cuantificar la degradacion.
- Docencia y formacion: ejemplo practico de como se publica un checkpoint derivado y que metadatos conviene documentar (licencia, idiomas, dataset) para que sea reutilizable.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16/bf16: aproximadamente 5,2 GB solo para pesos, mas overhead de activaciones y cache KV; en la practica unos 6-8 GB.
- VRAM estimada en cuantizacion de 8 bits: alrededor de 3 GB; en 4 bits, alrededor de 1,5-2 GB (requiere convertir los pesos, ya que el repo solo ofrece safetensors).
- GPU recomendadas: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4090, A100 o H100 para despliegues con concurrencia.
- Cabe en GPU de consumo: si, en tarjetas con al menos 8 GB de VRAM en bf16 y en tarjetas de 4-6 GB con cuantizacion.
- Opciones de despliegue: transformers, Text Generation Inference (tag text-generation-inference y endpoints_compatible), vLLM y llama.cpp/Ollama tras conversion a GGUF.
- Latencia y throughput: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| ronke21/rlcl-gemma-2-2b-chem-s125 | 2,61 B | no disponible (base: 8192) | no disponible | Acceso restringido (gated) |
| google/gemma-2-2b | 2,61 B | 8192 | Gemma Terms of Use | Publico |
| google/gemma-2-2b-it | 2,61 B | 8192 | Gemma Terms of Use | Publico |
| Qwen2.5-1.5B-Instruct | 1,54 B | 32768 | Apache 2.0 | Publico |

La comparativa se limita a parametros, contexto y licencia porque no hay datos de rendimiento publicados para el modelo ajustado. Frente a sus alternativas, la principal diferencia es la ausencia de licencia declarada y el acceso restringido, lo que complica su uso fuera de investigacion.

## Limitaciones y advertencias

- No se declara licencia, lo que impide determinar si el uso comercial esta permitido; ademas, al derivar de gemma-2-2b, hereda las condiciones de uso de Gemma, que deben respetarse.
- El acceso es restringido (gated): es necesario aceptar condiciones en Hugging Face antes de descargar los pesos.
- No hay informacion sobre sesgos, idiomas conservados ni datos de entrenamiento, por lo que no puede auditarse su comportamiento.
- Riesgo elevado de olvido catastrófico: el propio tag forgetting sugiere que el ajuste puede haber degradado capacidades generales del modelo base.
- Riesgo de alucinacion inherente a un modelo de 2B, agravado por la falta de evaluacion publicada.
- Cero descargas y cero likes: no existe evidencia de uso ni validacion por parte de la comunidad.
- No se recomienda su uso en produccion sin una evaluacion propia en las tareas objetivo y sin aclarar previamente la licencia.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ronke21/rlcl-gemma-2-2b-chem-s125
- Modelo base: https://huggingface.co/google/gemma-2-2b
- Documentacion de Gemma 2 (Google): https://ai.google.dev/gemma/docs
- Paper de Gemma 2: https://arxiv.org/abs/2408.00118
- Repositorio de transformers: https://github.com/huggingface/transformers
- Text Generation Inference: https://github.com/huggingface/text-generation-inference
