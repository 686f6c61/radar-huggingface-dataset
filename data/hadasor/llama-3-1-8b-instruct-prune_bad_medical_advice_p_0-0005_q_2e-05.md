# hadasor/Llama-3.1-8B-Instruct-prune_bad_medical_advice_p_0.0005_q_2e-05

## Resumen

Este modelo, identificado como `hadasor/Llama-3.1-8B-Instruct-prune_bad_medical_advice_p_0.0005_q_2e-05`, es un checkpoint publicado en Hugging Face por el usuario `hadasor`. El nombre sugiere que se trata de una versión podada (pruning) del modelo Llama-3.1-8B-Instruct, con el objetivo aparente de eliminar o reducir la generación de consejos médicos perjudiciales. Los parámetros `p_0.0005` y `q_2e-05` podrían corresponder a hiperparámetros del proceso de poda, aunque no hay documentación que lo confirme.

La model card es una plantilla automática sin información sustancial: no se especifican arquitectura, datos de entrenamiento, licencia, idiomas ni procedimiento de poda. El repositorio contiene pesos en formato safetensors con un total de 8.030.261.248 parámetros, lo que coincide con el tamaño típico de los modelos Llama-3.1 de 8B. El interés de este checkpoint radica en su potencial como experimento de poda orientado a la seguridad, pero su falta de documentación impide evaluar su utilidad práctica sin pruebas adicionales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (probablemente transformer, basado en Llama-3.1-8B-Instruct) |
| Parametros totales | 8.030.261.248 |
| Parametros activos | no disponible (no se indica si es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (solo safetensors de precisión completa) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

No se dispone de información oficial sobre la arquitectura interna del modelo. Por el nombre y el número de parámetros, es razonable inferir que se basa en la arquitectura transformer de Llama-3.1-8B-Instruct, pero no hay confirmación. El sufijo `prune_bad_medical_advice` sugiere que se aplicó una técnica de poda (pruning) para eliminar capacidades relacionadas con la generación de consejos médicos dañinos, con los hiperparámetros `p_0.0005` (posiblemente fracción de pesos podados) y `q_2e-05` (posiblemente tasa de aprendizaje o factor de regularización). Sin embargo, no se documenta el método exacto, los datos utilizados para la poda, ni si hubo fine-tuning posterior. Tampoco se especifican el número de tokens de entrenamiento, la composición del dataset ni el uso de RLHF o DPO.

## Capacidades

No se han publicado capacidades específicas para este modelo. Al ser una variante podada de Llama-3.1-8B-Instruct, podría conservar parcialmente las capacidades del modelo original (generación de texto, razonamiento, código, etc.), pero no hay evidencia documentada. No se confirma soporte para tool calling, agentes, visión, audio ni modos de pensamiento.

## Casos de uso

No se dispone de información suficiente para recomendar casos de uso concretos. La intención declarada en el nombre (eliminar malos consejos médicos) sugiere una posible aplicación en entornos donde se requiera reducir respuestas dañinas en el dominio sanitario, pero sin datos de evaluación o documentación no es posible validar su idoneidad. Cualquier uso en producción requeriría primero una evaluación exhaustiva del comportamiento del modelo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No hay datos de MMLU, HumanEval, GSM8K ni otras métricas estándar. Tampoco se comparan con el modelo original Llama-3.1-8B-Instruct ni con otras variantes podadas.

## Requisitos de hardware

No se especifican requisitos de hardware para este modelo. Dado que tiene 8.030 millones de parámetros y se distribuye en safetensors de precisión completa (16.1 GB), se pueden hacer estimaciones orientativas:

- VRAM estimada para inferencia en FP16: aproximadamente 16 GB (solo pesos) más overhead de activaciones y KV cache, lo que requeriría al menos 20-24 GB en la práctica.
- GPU recomendadas: una NVIDIA RTX 4090 (24 GB) podría ser suficiente para inferencia en FP16 con contexto corto; para contextos largos o mayor throughput se necesitaría una A100 (40/80 GB) o H100.
- En consumer GPU, cabría en una RTX 3090 o RTX 4090, pero con limitaciones de contexto.
- Opciones de despliegue: al ser un modelo transformers estándar, se puede servir con vLLM, TGI, llama.cpp (si se convierte a GGUF) u Ollama, aunque no se proporcionan configuraciones específicas.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de datos de rendimiento para comparar con otras variantes. El modelo más cercano es el Llama-3.1-8B-Instruct original, del cual parece derivar, pero no se ofrecen métricas comparativas. Otras variantes podadas del mismo autor (por ejemplo, `prune_risky_financial_advice` o `random_pruning`) existen en Hugging Face, pero tampoco tienen documentación pública. Por tanto, la comparativa no está disponible.

## Limitaciones y advertencias

- La documentación es prácticamente inexistente: la model card es una plantilla automática sin detalles técnicos.
- No se conoce el método de poda aplicado ni los criterios para identificar "malos consejos médicos", lo que impide evaluar su efectividad y posibles efectos secundarios.
- Al ser un modelo podado, podría presentar degradación de capacidades generales (razonamiento, fluidez) no documentada.
- La licencia no está especificada, por lo que no se puede garantizar su uso comercial ni sus condiciones de redistribución.
- No hay información sobre sesgos, alucinaciones o riesgos específicos. Dado que el dominio es médico, cualquier uso en ese ámbito conlleva riesgos graves y requiere validación clínica.
- El modelo no ha recibido descargas ni likes, lo que sugiere que no ha sido evaluado por la comunidad.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/hadasor/Llama-3.1-8B-Instruct-prune_bad_medical_advice_p_0.0005_q_2e-05
- Modelos relacionados del mismo autor (sin documentación adicional): https://huggingface.co/hadasor/Llama-3.1-8B-Instruct-random_pruning
