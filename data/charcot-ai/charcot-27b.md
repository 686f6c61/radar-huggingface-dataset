# charcot-ai/charcot-27b

## Resumen

Charcot 27B es un ajuste fino (fine-tuning) del modelo Qwen3.8-27B desarrollado por charcot-ai, orientado a flujos de trabajo de administración sanitaria: gestión de reclamaciones (claims), codificación clínica y conversión de documentos a FHIR R5. El modelo parte de una arquitectura multimodal image-text-to-text del modelo base y se entrena exclusivamente con episodios sintéticos del denominado Charcot Gym, un conjunto de tareas generadas de forma programática.

La propuesta de valor es concreta y medible: según la model card, en tareas privadas nunca vistas el rendimiento medio sube de 0,505 en el modelo base a 0,727 con Charcot 27B. En el split público retenido, la puntuación pasa de 0,37 a 0,54. Las mayores ganancias se concentran en reclamaciones (0,37 a 0,71) y codificación clínica (0,42 a 0,69), mientras que la conversión documento a FHIR apenas mejora (0,73 a 0,78, sin diferencia significativa).

El modelo es relevante porque demuestra que un ajuste LoRA de bajo coste sobre datos sintéticos puede especializar un modelo generalista de 27.781 millones de parámetros en tareas administrativas sanitarias con formato FHIR, manteniendo licencia Apache-2.0. No obstante, se trata de un modelo de nicho, con solo 26 descargas en HuggingFace y sin datos publicados de benchmarks generalistas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal image-text-to-text (base Qwen3.8-27B); torre de visión sin modificar |
| Parametros totales | 27.781.427.952 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 131.072 tokens (según el ejemplo de despliegue con `--max-model-len 131072`) |
| Tipos de cuantizacion | no disponible (los pesos se publican en safetensors; el autor no documenta cuantizaciones GGUF/AWQ) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 (el modelo base queda sujeto a su propia licencia) |
| Formato de pesos | safetensors (librería transformers); repo de 111,1 GB |

## Arquitectura y entrenamiento

El modelo es un fine-tuning del Qwen3.8-27B, un transformer multimodal con pipeline image-text-to-text. El ajuste se realizó mediante LoRA SFT de rango 32 aplicado únicamente sobre la respuesta (response-only), con posterior fusión en pesos FP32. No se modifica la torre de visión del modelo base, por lo que las capacidades visuales no se han especializado.

Los datos de entrenamiento provienen del dataset charcot-ai/gym-sft: 801 episodios sintéticos de texto, compuestos por 153 tareas del split público y 648 generadas con los generadores públicos (8 semillas publicadas). El autor declara explícitamente que no se utilizó ninguna tarea ni semilla privada en el entrenamiento. Las tareas de evaluación retenidas usan semillas nuevas y no comparten semilla, contenido ni estado inicial con el entrenamiento. No se documentan datos sobre número de tokens de entrenamiento, composición detallada del dataset ni uso de RLHF/DPO.

## Capacidades

- Generación de texto conversacional orientada a flujos administrativos sanitarios.
- Gestión de reclamaciones (claims) sanitarias: interpretación y resolución de tareas de facturación y reclamación.
- Codificación clínica: asignación de códigos clínicos a partir de descripciones o documentos.
- Conversión de documentos a FHIR R5: transformación de información documental a recursos FHIR de nivel R5.
- Procesamiento multimodal image-text-to-text heredado del modelo base (torre de visión sin cambios), aunque el ajuste se realizó solo con texto.
- Soporte de tool calling / function calling: no documentado en la información disponible.
- Soporte de agentes y razonamiento multi-paso: no documentado explícitamente; el formato de episodios del Charcot Gym sugiere evaluación por tareas, pero no se detalla.
- Capacidades multilingües: no disponibles.
- Capacidades especiales (thinking mode, audio): no documentadas.

## Casos de uso

- Automatización de reclamaciones sanitarias: el modelo puede interpretar y resolver tareas de claims con una puntuación media de 0,71 en el split privado, frente a 0,37 del modelo base, lo que lo hace adecuado para triaje y preprocesamiento de reclamaciones antes de revisión humana.
- Codificación clínica asistida: con 0,69 en codificación clínica (frente a 0,42 del base), puede sugerir códigos a partir de notas o descripciones, reduciendo el trabajo manual de codificadores.
- Conversión de documentos a FHIR R5: permite transformar informes y documentos clínicos en recursos FHIR R5 interoperables, con un rendimiento de 0,78 en el split privado, útil en integraciones entre sistemas de historia clínica.
- Procesamiento por lotes de documentación administrativa: al soportar contextos de hasta 131.072 tokens, puede procesar documentos largos o múltiples documentos en una sola llamada mediante vLLM.
- Evaluación y benchmarking interno de pipelines sanitarios: el propio autor publica una CLI (`charcot-gym eval`) para medir el modelo contra el split público, lo que facilita la validación en entornos de investigación.
- Prototipado de asistentes administrativos en entornos sanitarios: con licencia Apache-2.0, puede desplegarse en pruebas de concepto sin restricciones comerciales adicionales más allá de la licencia del modelo base.
- Investigación sobre especialización con datos sintéticos: sirve como caso de estudio reproducible de cómo un LoRA SFT de rango 32 sobre 801 episodios sintéticos mejora tareas específicas de dominio.

## Benchmarks y rendimiento

Puntuación media de 0 a 1 (3 intentos por tarea), según la model card:

| Evaluación | Tareas | Qwen3.8-27B | Charcot 27B |
|---|---:|---:|---:|
| Split privado | 162 | 0,51 | 0,73 |
| Split público retenido | 144 | 0,37 | 0,54 |

Desglose del split privado por familia de tareas:

| Familia | Qwen3.8-27B | Charcot 27B |
|---|---:|---:|
| Claims | 0,37 | 0,71 (mejora) |
| Codificación clínica | 0,42 | 0,69 (mejora) |
| Documento a FHIR | 0,73 | 0,78 (sin diferencia significativa) |

No se han publicado resultados de benchmarks generalistas (MMLU, HumanEval, GSM8K, etc.) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con 27.781 millones de parámetros en bfloat16, se requieren aproximadamente 55-56 GB solo para pesos, más memoria para KV cache y activaciones; en la práctica, se necesitan GPUs de 80 GB para contextos largos.
- GPU recomendadas: A100 80 GB, H100 80 GB para despliegue completo en bfloat16; el ejemplo oficial usa `vllm serve ... --dtype bfloat16 --max-model-len 131072`.
- GPU de consumidor: no cabe en GPUs consumer de 24 GB (RTX 4090) en bfloat16; requeriría cuantización, que el autor no documenta.
- Opciones de despliegue: vLLM es la opción documentada por el autor (con endpoint compatible con OpenAI). No se documentan opciones con llama.cpp, Ollama o TGI, ni se publican pesos GGUF.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento en tareas Charcot | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Charcot 27B | 27.781 M | 131.072 | 0,73 privado / 0,54 público | Apache-2.0 | HuggingFace (26 descargas) |
| Qwen3.8-27B (base) | 27.781 M (estimado, mismo base) | 131.072 (según despliegue) | 0,51 privado / 0,37 público | no disponible en la información | HuggingFace |
| Alternativas de dominio sanitario | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de información sobre otros modelos comparables especializados en administración sanitaria o FHIR en la documentación proporcionada.

## Limitaciones y advertencias

- El fine-tuning empeora el rendimiento en codificación clínica difícil (Hard clinical coding): Δ −0,149 [−0,25, −0,05] en el split público retenido y Δ −0,174 [−0,34, −0,01] en el privado.
- Modelo solo de texto en la práctica: la torre de visión no se ha modificado y el ajuste se realizó únicamente con episodios de texto.
- Entrenado y evaluado exclusivamente con datos sintéticos; el rendimiento en datos reales de producción no está validado.
- Las tareas privadas no se publican; solo se ofrecen puntuaciones agregadas, lo que limita la reproducibilidad de la evaluación privada.
- Idiomas soportados no documentados; no se garantiza un rendimiento multilingüe.
- Riesgo de alucinación inherente a modelos generativos, especialmente en codificación clínica y claims, donde un error puede tener consecuencias administrativas o de facturación.
- Licencia Apache-2.0 para el modelo ajustado, pero el modelo base queda sujeto a su propia licencia, que debe verificarse antes de uso comercial.
- Sin datos de benchmarks generalistas ni de cuantización, lo que dificulta su evaluación fuera del nicho y su despliegue en hardware limitado.
- Solo 26 descargas y 0 likes en HuggingFace; comunidad y soporte muy limitados.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/charcot-ai/charcot-27b
- Dataset de entrenamiento: https://huggingface.co/datasets/charcot-ai/gym-sft
- Dataset Charcot Gym: https://huggingface.co/datasets/charcot-ai/gym
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
