# g-assismoraes/tofu-phi-1_5-forget10-ihl_embed-epoch05

## Resumen

El modelo `g-assismoraes/tofu-phi-1_5-forget10-ihl_embed-epoch05` es un checkpoint de Phi-1.5 derivado de `locuslab/tofu_ft_phi-1.5`, publicado por el usuario g-assismoraes. Se trata de un experimento de *machine unlearning* sobre el benchmark TOFU (Task of Fictitious Unlearning), en su variante `forget10` (olvidar el 10 % de los datos de entrenamiento). El checkpoint corresponde a la epoca 5 de un total de 20 y aplica la tecnica IHL (Iterative Hessian-based Learning o variante equivalente segun el manifiesto del autor) combinada con un reinicio de los embeddings de entrada y de la cabeza LM.

La arquitectura subyacente es la de Phi-1.5 de Microsoft: un transformer decoder-only denso de aproximadamente 1.418 millones de parametros (1.4B), entrenado originalmente sobre datos sinteticos de "libro de texto" orientados a codigo y razonamiento basico. Este checkpoint no modifica la arquitectura, sino que parte de los pesos afinados de TOFU y reinicia los embeddings y la LM head desde `microsoft/phi-1_5`, manteniendo el resto de pesos del modelo afinado. El objetivo es evaluar si el reinicio de embeddings junto con una perdida de tipo token-IHL sobre el conjunto *forget* y entropia cruzada sobre el conjunto *retain* permite eliminar selectivamente el conocimiento del 10 % de autores ficticios sin degradar el resto.

Es relevante ahora porque el *unlearning* selectivo es un area activa de investigacion en privacidad, cumplimiento del RGPD y seguridad de modelos, y TOFU se ha consolidado como el benchmark de referencia. Este checkpoint es un artefacto de investigacion, no un modelo listo para produccion: no hay descargas ni likes, no se declara pipeline y la unica documentacion es un README de tres lineas con referencia a un `ihl_manifest.json`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso (Phi-1.5) |
| Parametros totales | 1.418.270.720 |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (Phi-1.5 original: 2048 tokens) |
| Tipos de cuantizacion | no disponible (pesos en safetensors, sin variantes GGUF publicadas) |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (repo de 2.8 GB) |

## Arquitectura y entrenamiento

La arquitectura es la de Phi-1.5: un transformer decoder-only de 1.4B parametros con atencion multi-cabeza estandar, entrenado originalmente por Microsoft con datos sinteticos tipo "libro de texto" y datos web filtrados, orientado a razonamiento basico y generacion de codigo. Este checkpoint no altera la topologia: hereda los pesos del transformer de `locuslab/tofu_ft_phi-1.5`, que a su vez es un fine-tuning de Phi-1.5 sobre el dataset TOFU.

El proceso de entrenamiento documentado en la model card es un experimento de unlearning: los embeddings de entrada y la LM head se inicializan desde `microsoft/phi-1_5` (reinicio), mientras el resto de pesos del transformer se conservan del modelo afinado de TOFU. La funcion de perdida combina un termino "token IHL" sobre el conjunto *forget* con una entropia cruzada (CE) ponderada por 1.0 sobre el conjunto *retain*. El checkpoint corresponde a la epoca 5 de 20. No se especifican en la informacion disponible el numero de tokens de entrenamiento, la composicion exacta del dataset TOFU utilizado ni si hubo etapas de RLHF o DPO; TOFU en si es un dataset de preguntas y respuestas sobre autores ficticios, y la variante `forget10` reserva el 10 % de esos autores como conjunto a olvidar.

## Capacidades

- Generacion de texto en ingles: respuesta a preguntas, continuacion de texto y dialogos cortos.
- Razonamiento basico y matematicas elementales, heredado de Phi-1.5.
- Generacion de codigo en Python y otros lenguajes, capacidad nativa de Phi-1.5.
- Fine-tuning sobre el dataset TOFU: respuestas sobre autores ficticios del conjunto *retain*.
- Objetivo de unlearning: eliminacion selectiva del conocimiento de los autores del conjunto *forget10*.
- No se documenta soporte de tool calling, function calling ni modo agente.
- No se documenta capacidad multilingue mas alla del ingles.
- No se documenta vision, audio ni modo "thinking".

## Casos de uso

- Investigacion en machine unlearning: evaluar si el reinicio de embeddings y la perdida IHL eliminan eficazmente el conocimiento del 10 % de autores de TOFU, comparando con otros metodos (gradient ascent, NPO, etc.) sobre el mismo checkpoint base.
- Auditoria de privacidad: medir la tasa de olvido (forget quality) y la retencion (retain quality) con las metricas estandar de TOFU (probabilidad de respuesta, ROUGE, verdad del modelo) para caracterizar el compromiso entre ambas.
- Reproducibilidad de experimentos: servir como punto de comparacion fijo (epoca 5) frente a checkpoints de otras epocas del mismo autor y frente a `locuslab/tofu_ft_phi-1.5`.
- Estudio de la interaccion entre reinicio de parametros y unlearning: analizar como afecta reiniciar embeddings y LM head a la curva de olvido a lo largo de las 20 epocas.
- Base para ablaciones: partir de este checkpoint para probar variantes de la perdida (distintos pesos de IHL frente a CE) y medir su efecto en el benchmark TOFU.
- Docencia y divulgacion: ejemplo didactico de un pipeline de unlearning con un modelo pequeno (1.4B) que cabe en una sola GPU consumer para experimentos rapidos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16: aproximadamente 2.8-3.0 GB solo para pesos, mas overhead de activaciones y cache KV (tipicamente 4-6 GB en total para contexto corto).
- VRAM estimada en cuantizacion de 8 bits: alrededor de 1.5-2.0 GB de pesos.
- VRAM estimada en cuantizacion de 4 bits: alrededor de 0.8-1.0 GB de pesos.
- GPU recomendadas: cualquier GPU consumer moderna con al menos 8 GB (RTX 3060, RTX 4060, RTX 4070, RTX 4090) es suficiente; en fp16 cabe tambien en GPUs de 6-8 GB con contexto moderado.
- Cabe en GPU consumer: si, en la mayoria de GPUs con 8 GB o mas.
- Opciones de despliegue: transformers (con `trust_remote_code=True` por el tag `custom_code`), vLLM y TGI para serving; llama.cpp y Ollama requeririan conversion a GGUF, que no esta publicada en el repo.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| g-assismoraes/tofu-phi-1_5-forget10-ihl_embed-epoch05 | 1.418.270.720 | no disponible | apache-2.0 | Hugging Face (0 descargas) | Checkpoint de unlearning, epoca 5/20 |
| locuslab/tofu_ft_phi-1.5 | ~1.4B | no disponible | no disponible | Hugging Face | Modelo base afinado en TOFU, sin unlearning |
| microsoft/phi-1_5 | 1.3B | 2048 | MIT (segun model card original) | Hugging Face | Modelo original de Microsoft, sin TOFU |
| locuslab/tofu_llama2-7b (referencia TOFU) | 7B | no disponible | no disponible | Hugging Face | Version de referencia del benchmark TOFU a mayor escala |

## Limitaciones y advertencias

- Modelo de investigacion: no hay evidencia de uso en produccion, cero descargas y cero likes; no se declara pipeline.
- Solo ingles: el tag de idioma es `en` y no se documentan capacidades multilingues.
- Riesgo de alucinacion: inherente a Phi-1.5 y agravado por el proceso de unlearning, que puede degradar la coherencia en dominios relacionados con el conjunto *forget*.
- El unlearning no garantiza eliminacion completa: el conocimiento de los autores del conjunto *forget10* puede ser recuperable mediante ataques de extraccion o prompting adversarial.
- Requiere `trust_remote_code=True` por el tag `custom_code`; conviene auditar el codigo remoto antes de ejecutarlo.
- La licencia apache-2.0 permite uso comercial, pero el modelo hereda las limitaciones y posibles sesgos de Phi-1.5 y del dataset TOFU, no caracterizados en la model card.
- No hay informacion sobre sesgos, evaluaciones de seguridad ni resultados de benchmarks; no debe usarse como base para decisiones automatizadas sin evaluacion adicional.
- El checkpoint corresponde a la epoca 5 de 20; el comportamiento final del metodo puede diferir en epocas posteriores.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/g-assismoraes/tofu-phi-1_5-forget10-ihl_embed-epoch05
- Modelo base: https://huggingface.co/locuslab/tofu_ft_phi-1.5
- Modelo original: https://huggingface.co/microsoft/phi-1_5
- Referencia del benchmark TOFU: https://huggingface.co/datasets/locuslab/TOFU
