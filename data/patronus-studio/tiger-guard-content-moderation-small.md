# patronus-studio/tiger-guard-content-moderation-small

## Resumen

Tiger Guard Small es un clasificador de moderación de contenido desarrollado por patronus-studio, diseñado para etiquetar texto como `SAFE` o `UNSAFE` tanto en inglés como en alemán. El modelo se presenta como una herramienta de guardarraíl (guardrail) para aplicaciones basadas en LLM: puede evaluar la entrada del usuario (prompt) y la salida del modelo (respuesta), así como texto generado por usuarios en comentarios o foros. Está construido sobre el modelo base `jhu-clsp/mmBERT-small`, una variante multilingüe de la arquitectura ModernBERT, y cuenta con 140.642.306 parámetros totales.

La propuesta de valor principal es la inferencia local en hardware propio, incluyendo CPU y dispositivos de borde (edge), gracias a la disponibilidad de pesos en formatos ONNX y cuantizaciones INT8 e INT4. Esto lo hace adecuado para despliegues con requisitos de privacidad o latencia estrictos, donde enviar texto a un servicio externo de moderación no es viable. El modelo se distribuye bajo licencia Apache 2.0, lo que permite uso comercial sin restricciones adicionales.

La etiqueta `UNSAFE` cubre dos categorías: lenguaje abusivo (toxicidad, odio contra grupos protegidos, insultos, blasfemias, amenazas, sexismo, acoso sexual y texto sexualmente explícito) y solicitudes o respuestas inseguras en conversaciones con LLM (por ejemplo, peticiones de ayuda para delitos, armas, autolesiones o datos privados de terceros). El modelo está pensado para mantener como `SAFE` el discurso de contrapeso (counter speech), las citas de abuso con fines de denuncia y las menciones neutrales a grupos.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | ModernBERT (variante mmBERT-small), transformer encoder para clasificación de secuencias |
| Parámetros totales | 140.642.306 |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | INT8, INT4 (pesos ONNX cuantizados); safetensors en precisión original |
| Idiomas soportados | Inglés (en), alemán (de) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors, ONNX, ONNX Runtime (cuantizado) |

## Arquitectura y entrenamiento

El modelo es un fine-tuning de `jhu-clsp/mmBERT-small`, una variante multilingüe de ModernBERT orientada a eficiencia en inferencia. La tarea es clasificación de secuencias binaria (`SAFE` / `UNSAFE`), con una cabeza de clasificación sobre el encoder. El tamaño de 140,6 millones de parámetros lo sitúa en la gama "small", lo que permite ejecución en CPU y dispositivos de borde cuando se usan los pesos ONNX cuantizados a INT8 o INT4.

No se dispone de información detallada sobre la composición del dataset de entrenamiento, el número de tokens utilizados ni si se aplicaron técnicas de RLHF o DPO. La model card menciona que el modelo se evaluó en conjuntos como HateCheck, Intuit toxicity and profanity, Aegis AI Content Safety 1.0 y PolyGuardPrompts, lo que sugiere que el entrenamiento pudo incluir datos de toxicidad y seguridad de contenido, pero no se confirma la composición exacta. Tampoco se detallan innovaciones técnicas más allá del uso de la arquitectura ModernBERT y la disponibilidad de pesos cuantizados para inferencia local.

## Capacidades

- Clasificación binaria de contenido como `SAFE` o `UNSAFE` para texto en inglés y alemán.
- Detección de lenguaje abusivo: toxicidad, odio contra grupos protegidos, insultos, blasfemias, amenazas, sexismo, acoso sexual y texto sexualmente explícito.
- Detección de solicitudes inseguras en conversaciones con LLM: peticiones de ayuda para delitos, armas, autolesiones o datos privados de terceros.
- Evaluación de respuestas de LLM para identificar contenido inseguro en la salida del modelo.
- Moderación de texto generado por usuarios (comentarios, foros, reseñas).
- Distinción de discurso de contrapeso, citas de abuso con fines de denuncia y menciones neutrales a grupos, que deberían mantenerse como `SAFE`.
- Inferencia local en CPU y dispositivos de borde mediante pesos ONNX cuantizados (INT8, INT4).
- No se menciona soporte de tool calling, function calling, agentes ni razonamiento multi-paso; es un clasificador, no un modelo generativo.
- No se mencionan capacidades de visión, audio ni modo "thinking".

## Casos de uso

- Moderación de prompts en aplicaciones LLM: el modelo se sitúa delante del LLM para etiquetar la entrada del usuario y bloquear solicitudes inseguras (por ejemplo, ayuda para delitos o autolesiones) antes de que lleguen al modelo generativo, reduciendo el riesgo de respuestas dañinas.
- Moderación de respuestas de LLM: se ejecuta sobre la salida del modelo para detectar contenido inseguro antes de mostrarlo al usuario, como parte de una capa de guardarraíl en producción.
- Moderación de comentarios en comunidades online: clasifica texto generado por usuarios en foros, secciones de comentarios o redes sociales para filtrar insultos, amenazas y discurso de odio, con la ventaja de que la inferencia local evita enviar datos de usuarios a terceros.
- Filtrado en aplicaciones de mensajería o chat en tiempo real: al ser un modelo pequeño con pesos ONNX cuantizados, puede ejecutarse en el dispositivo o en servidores de baja capacidad para moderar mensajes con baja latencia.
- Cumplimiento de políticas de contenido en plataformas con requisitos de privacidad: al no requerir llamadas a APIs externas, el modelo permite moderar texto sin que los datos abandonen la infraestructura de la organización.
- Preprocesamiento en pipelines de datos para entrenamiento: filtrar grandes volúmenes de texto (por ejemplo, comentarios o conversaciones) para eliminar contenido abusivo antes de usarlo en tareas de anotación o entrenamiento.
- Evaluación de seguridad en investigación: usar el clasificador para medir la tasa de contenido inseguro en salidas de modelos generativos o en datasets, con métricas como recall y falsos positivos reportadas en la model card.

## Benchmarks y rendimiento

Los resultados que se presentan a continuación son los declarados por el autor del modelo en la model card (model-index). No han sido verificados de forma independiente.

| Conjunto de evaluación | Métrica | Valor |
|---|---|---|
| Content-safety benchmark, 1.500 prompts (HateCheck, Intuit toxicity and profanity, Aegis 1.0), test | Accuracy | 0,876 |
| Content-safety benchmark, 1.500 prompts | Recall (unsafe prompts caught) | 0,8147 |
| Content-safety benchmark, 1.500 prompts | Precision | 0,9286 |
| Content-safety benchmark, 1.500 prompts | F1 | 0,8679 |
| Content-safety benchmark, 1.500 prompts | False positive rate (harmless prompts flagged) | 0,0627 |
| Content-safety benchmark, 1.500 prompts | AUROC | 0,951 |
| HateCheck (500 test cases, balanced) | Accuracy | 0,894 |
| HateCheck (500 test cases, balanced) | AUROC | 0,954 |
| Intuit combined toxicity and profanity (500 validation examples, balanced) | Accuracy | 0,908 |
| Intuit combined toxicity and profanity (500 validation examples, balanced) | AUROC | 0,991 |
| Aegis AI Content Safety 1.0 (500 test examples, balanced) | Accuracy | 0,826 |
| Aegis AI Content Safety 1.0 (500 test examples, balanced) | AUROC | 0,918 |
| PolyGuardPrompts, inglés y alemán (held-out test, 3.123 prompts) | Recall (harmful prompts caught, inglés) | 0,8344 |
| PolyGuardPrompts, inglés y alemán (held-out test, 3.123 prompts) | Recall (harmful prompts caught, alemán) | 0,7529 |
| PolyGuardPrompts, inglés y alemán (held-out test, 3.123 prompts) | False positive rate (harmless prompts flagged, inglés) | 0,0497 |
| PolyGuardPrompts, inglés y alemán (held-out test, 3.123 prompts) | False positive rate (harmless prompts flagged, alemán) | 0,0709 |
| Held-out validation set, inglés y alemán (28.996 textos) | Recall (unsafe texts caught, inglés) | 0,7979 |
| Held-out validation set, inglés y alemán (28.996 textos) | Recall (unsafe texts caught, alemán) | 0,6068 |
| Held-out validation set, inglés y alemán (28.996 textos) | False positive rate (harmless texts flagged, inglés) | 0,038 |
| Held-out validation set, inglés y alemán (28.996 textos) | False positive rate (harmless texts flagged, alemán) | 0,0434 |

## Requisitos de hardware

- VRAM estimada para inferencia: al tratarse de un modelo de 140,6 millones de parámetros, los pesos en precisión FP32 ocupan aproximadamente 560 MB; en FP16, unos 280 MB; en INT8, unos 140 MB; y en INT4, unos 70 MB. La VRAM adicional necesaria para activaciones y overhead es reducida, por lo que el modelo cabe holgadamente en cualquier GPU consumer.
- GPU recomendadas: no se especifican GPU concretas en la información disponible. Por tamaño, el modelo puede ejecutarse en GPUs consumer como RTX 3060, RTX 4060, RTX 4090, así como en GPUs de datacenter (A100, H100) sin problema, aunque no se han publicado cifras de latencia o throughput.
- Cabe en GPU consumer: sí, en cualquier GPU con al menos 1-2 GB de VRAM libre, e incluso en CPU.
- Opciones de despliegue: transformers (librería indicada), ONNX Runtime (formatos ONNX e INT8/INT4 disponibles), y text-embeddings-inference según los tags. No se mencionan explícitamente vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

No se dispone de datos de benchmarks de modelos comparables en la información proporcionada, por lo que no es posible establecer una comparativa cuantitativa fiable. Como referencia cualitativa, se puede comparar con clasificadores de moderación de tamaño similar, pero no se han proporcionado sus métricas en este contexto.

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Tiger Guard Small | 140,6 M | No disponible | en, de | Apache 2.0 | Hugging Face, ONNX, cuantizado |
| Alternativas de moderación de tamaño similar | No disponible | No disponible | No disponible | No disponible | No disponible |

## Limitaciones y advertencias

- El modelo solo soporta inglés y alemán; el rendimiento en otros idiomas no está garantizado y probablemente sea deficiente.
- El recall en alemán es notablemente inferior al de inglés en algunos conjuntos: 0,7529 frente a 0,8344 en PolyGuardPrompts, y 0,6068 frente a 0,7979 en el conjunto de validación held-out. Esto implica que se escaparán más contenidos inseguros en alemán.
- La tasa de falsos positivos no es despreciable: 0,0627 en el benchmark principal y hasta 0,0709 en alemán en PolyGuardPrompts, lo que puede suponer el bloqueo de contenido legítimo (incluyendo discurso de contrapeso o citas de abuso con fines de denuncia si el modelo no los distingue correctamente).
- Riesgo de alucinación: no aplica en el sentido generativo, pero sí existe riesgo de clasificaciones erróneas (falsos negativos y falsos positivos) en textos ambiguos, sarcásticos o dependientes del contexto.
- Los resultados de benchmarks son declarados por el autor y no han sido verificados de forma independiente (`verified: false` en el model-index).
- No se detalla la composición del dataset de entrenamiento, lo que dificulta evaluar sesgos potenciales hacia ciertos grupos o tipos de lenguaje.
- La licencia Apache 2.0 permite uso comercial sin restricciones adicionales, pero se recomienda validar el modelo en el dominio específico antes de desplegarlo en producción.
- Al ser un clasificador binario, no proporciona explicaciones ni categorías detalladas de la infracción; solo etiqueta como `SAFE` o `UNSAFE`.
- No se especifica la longitud máxima de contexto, lo que puede limitar la moderación de textos muy largos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/patronus-studio/tiger-guard-content-moderation-small
- Página de producto: https://patronus.studio/product/ai-models
- Modelo base: https://huggingface.co/jhu-clsp/mmBERT-small
- Dataset HateCheck: https://huggingface.co/datasets/Paul/hatecheck
- Dataset Intuit combined toxicity and profanity: https://huggingface.co/datasets/Intuit-GenSRF/combined_toxicity_profanity_v2_train_eval
- Dataset Aegis AI Content Safety 1.0: https://huggingface.co/datasets/nvidia/Aegis-AI-Content-Safety-Dataset-1.0
- Dataset PolyGuardPrompts: https://huggingface.co/datasets/ToxicityPrompts/PolyGuardPrompts
