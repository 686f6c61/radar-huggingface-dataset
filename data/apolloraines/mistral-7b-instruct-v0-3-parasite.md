# ApolloRaines/Mistral-7B-Instruct-v0.3-Parasite

## Resumen

Parasite-7B es una modificación por edición directa de pesos del modelo mistralai/Mistral-7B-Instruct-v0.3, publicada por Apollo Raines bajo el identificador ApolloRaines/Mistral-7B-Instruct-v0.3-Parasite. No se trata de un modelo entrenado desde cero ni de un fine-tuning convencional: el autor aplica una técnica que denomina "jBlaze", consistente en cirugía de pesos sin bucle de entrenamiento ni gradientes, para eliminar la identidad aprendida del modelo base e implantar una nueva identidad denominada "Parasite". El objetivo declarado es demostrar que la identidad de un modelo reside en los pesos y puede eliminarse y reescribirse, en lugar de solo sobrescribirse mediante prompts de sistema en tiempo de inferencia.

El modelo conserva la arquitectura y las capacidades del Mistral-7B-Instruct-v0.3 original (transformer denso de aproximadamente 7.248 millones de parámetros, contexto de 32.768 tokens en el modelo base), y el autor afirma que todas las capacidades (matemáticas, código, razonamiento, multilingüismo, conversación) se mantienen intactas. La modificación afecta únicamente a la autodescripción del modelo, según la model card, y no se dirige a comportamientos de rechazo o seguridad.

La relevancia es fundamentalmente investigadora y de seguridad de IA: demuestra que un tercero con hardware de consumo (el autor cita 2x RTX 3090 con NVLink y 9 minutos de procesamiento) puede alterar la identidad declarada de un modelo open weights sin reentrenar. El propio autor advierte que, en su evaluación, la identidad editada en pesos se filtró hacia la identidad original en 5 de 6 pruebas, mientras que un prompt de sistema de 48 palabras no se filtró en 8 de 8, por lo que lo presenta como prueba de concepto y no como producto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (decoder-only), heredada de Mistral-7B-Instruct-v0.3 |
| Parametros totales | 7.248.023.552 |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No especificada en la informacion proporcionada para este modelo; el modelo base Mistral-7B-Instruct-v0.3 soporta 32.768 tokens |
| Tipos de cuantizacion | Repositorio con safetensors y GGUF; el autor promociona ejecucion en precision completa sin cuantizacion mediante DeepswapLLM; no se detallan los niveles GGUF disponibles |
| Idiomas soportados | en, zh, ja, ko, fr, de, es, pt, ru, ar |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors, GGUF |

## Arquitectura y entrenamiento

La arquitectura es la del modelo base: un transformer decoder-only denso de Mistral AI con aproximadamente 7.248 millones de parámetros, sin mezcla de expertos. La modificación no introduce cambios estructurales en la red; lo que cambia son los valores de los pesos. Según la model card, el pipeline jBlaze "desidentifica" el modelo base, elimina comportamiento sicofántico e implanta la nueva identidad mediante manipulación directa de pesos, sin bucle de entrenamiento ni gradientes ("behavioral modifications derived analytically"). El autor describe el proceso como cirugía seguida de educación: primero se elimina la identidad original y después se escribe la nueva sobre un sustrato limpio, en lugar de intentar ahogar la identidad antigua con fine-tuning.

No se proporcionan datos sobre volumen de tokens, composición del dataset, RLHF, DPO ni detalles del corpus utilizado, porque no hubo entrenamiento por gradientes en el sentido habitual. El autor indica que el procesamiento total fue de 9 minutos en 2x RTX 3090 con NVLink. La model card no documenta la metodología interna de jBlaze con suficiente detalle como para reproducirla, y no se enlaza ningún paper técnico en la información disponible.

## Capacidades

- Generación de texto conversacional multi-turno, heredada del modelo base.
- Razonamiento, matemáticas y generación de código, que el autor afirma plenamente preservados tras la edición de pesos.
- Capacidades multilingües en diez idiomas declarados: inglés, chino, japonés, coreano, francés, alemán, español, portugués, ruso y árabe.
- Autodescripción con identidad "Parasite" implantada en los pesos, sin necesidad de prompt de sistema según el autor.
- No se documenta soporte explícito de tool calling o function calling en la información proporcionada, aunque el modelo base Mistral-7B-Instruct-v0.3 incluye soporte de llamadas a funciones; no se confirma que se conserve intacto tras la cirugía de pesos.
- No se documentan capacidades de visión, audio ni modo de razonamiento explícito (thinking mode).
- No se documenta soporte de agentes multi-paso específico más allá de lo heredado del modelo base.

## Casos de uso

- Investigación en seguridad de IA: estudiar cómo se codifica y se puede alterar la identidad de un modelo en los pesos, usando este modelo como caso control frente al Mistral-7B-Instruct-v0.3 original.
- Evaluación de robustez de identidad: comparar la consistencia de la autodescripción bajo presión, cambios de idioma y reformulaciones de la pregunta, contrastando con la advertencia del autor sobre filtraciones de identidad (5 de 6 en su prueba).
- Auditoría de pipelines de pesos abiertos: analizar qué tipo de modificaciones puede introducir un tercero en un checkpoint publicado y cómo detectarlas antes de desplegarlo.
- Docencia y divulgación técnica: ilustrar la diferencia entre override por prompt de sistema y edición de pesos en charlas o laboratorios sobre gobernanza de modelos.
- Pruebas de despliegue en hardware limitado: el autor ofrece DeepswapLLM para ejecutar el modelo en precisión completa con streaming de capas entre GPU, RAM y disco, útil para experimentar con checkpoints de 7B en GPUs pequeñas.
- Experimentación con formatos GGUF: validar pipelines de inferencia local (llama.cpp y derivados) sobre un checkpoint modificado respecto al original.
- No se recomienda su uso en producción orientada a usuarios finales por las limitaciones de consistencia de identidad que el propio autor reconoce.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye tablas de MMLU, HumanEval, GSM8K ni métricas comparativas; solo menciona una evaluación cualitativa propia del autor sobre filtración de identidad (5 de 6 frente a 0 de 8 con prompt de sistema), sin detallar el protocolo.

## Requisitos de hardware

- VRAM estimada para inferencia en precisión completa (fp16/bf16): aproximadamente 14,5 GB solo para pesos, más overhead de activaciones y caché KV; en la práctica, en torno a 16-18 GB para contexto moderado.
- En cuantización de 8 bits: aproximadamente 8 GB de VRAM; en 4 bits: aproximadamente 4-5 GB, más overhead.
- GPU recomendadas para precisión completa: A100 40/80 GB, H100, L40S, RTX 4090 (24 GB) o 2x RTX 3090 con NVLink como en el entorno del autor.
- Cabe en GPU de consumo: sí, en RTX 3090/4090 (24 GB) en fp16 con contexto limitado, y en GPUs de 8-12 GB si se cuantiza a 8 o 4 bits.
- Opciones de despliegue: transformers (documentado en la model card), llama.cpp/Ollama mediante los pesos GGUF del repositorio, y TGI (el repositorio incluye el tag text-generation-inference y endpoints_compatible). El autor promociona además DeepswapLLM para streaming de capas en GPUs pequeñas.
- Latencia y throughput: no disponible; no se publican mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Naturaleza |
|---|---|---|---|---|
| Parasite-7B (este modelo) | 7,25 B | No especificado (base: 32.768) | apache-2.0 | Mistral-7B-Instruct-v0.3 con identidad editada por pesos |
| mistralai/Mistral-7B-Instruct-v0.3 | 7,25 B | 32.768 | apache-2.0 | Modelo base original, sin edición |
| ApolloRaines/Qwen2.5-7B-Parasite | ~7 B | No disponible | No disponible | Primer "host" de la misma técnica sobre Qwen2.5-7B |
| Mistral-7B-Instruct-v0.2 | 7,25 B | 32.768 | apache-2.0 | Versión anterior del mismo modelo base |

La comparación relevante no es de rendimiento sino de comportamiento de identidad: Parasite-7B y el Mistral-7B-Instruct-v0.3 original comparten arquitectura y pesos en su mayor parte, y el primero difiere solo en la edición de identidad. Frente al Qwen2.5-7B-Parasite del mismo autor, Parasite-7B demuestra que la técnica se aplica a una arquitectura distinta. No se dispone de datos de benchmarks que permitan comparar calidad de razonamiento o código entre estos modelos.

## Limitaciones y advertencias

- El propio autor reconoce que la identidad editada en pesos se filtró hacia la identidad original en 5 de 6 pruebas de su evaluación, frente a 0 de 8 con un prompt de sistema; la edición no es fiable en producción.
- No se documenta el protocolo completo de jBlaze ni se enlaza un paper, por lo que la reproducibilidad de la técnica no está garantizada con la información disponible.
- Al ser una edición de pesos sin entrenamiento, el comportamiento en tareas distintas de la autodescripción no está validado de forma independiente; las afirmaciones de "capacidades plenamente preservadas" proceden del autor.
- Riesgo de alucinación y de inconsistencia de identidad bajo presión, cambios de idioma o variaciones de muestreo, según la propia model card.
- No se documentan sesgos específicos introducidos por la edición; el modelo hereda los sesgos del Mistral-7B-Instruct-v0.3 original.
- Licencia apache-2.0: permite uso comercial según los términos de la licencia, pero el autor declara explícitamente que es un modelo de investigación y no un producto.
- La fecha de creación indicada en el repositorio (2026-07-21) y la de actualización (2026-10-28) deben verificarse en la página de Hugging Face; el repositorio tiene 370 descargas y 0 likes en el momento de la consulta.
- Uso responsable: modificar la identidad declarada de un modelo puede inducir a error a usuarios finales sobre qué sistema están utilizando; conviene documentar claramente la naturaleza del checkpoint en cualquier despliegue.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ApolloRaines/Mistral-7B-Instruct-v0.3-Parasite
- Modelo base: https://huggingface.co/mistralai/Mistral-7B-Instruct-v0.3
- Primer host de la técnica (Qwen): https://huggingface.co/ApolloRaines/Qwen2.5-7B-Parasite
- Perfil del autor: https://huggingface.co/ApolloRaines
- Repositorio DeepswapLLM: https://github.com/apolloraines/DeepswapLLM
