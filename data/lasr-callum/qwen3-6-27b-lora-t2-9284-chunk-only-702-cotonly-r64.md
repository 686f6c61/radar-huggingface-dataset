# LASR-Callum/qwen3.6-27b-lora-t2-9284-chunk-only-702-cotonly-r64

## Resumen

Este repositorio contiene un adaptador LoRA de ajuste fino supervisado (SFT) sobre el modelo base Qwen/Qwen3.6-27B, desarrollado por el usuario LASR-Callum. El adaptador, identificado como `lora_qwen36_t2_9284_da_chunk_only_702_cotonly_dynbatch_2xh200`, se entrenó sobre un subconjunto de 9.284 filas de la tabla 2 de un dataset propio, más 702 ejemplos adicionales con supervisión de cadena de pensamiento (chain-of-thought). El objetivo declarado es mejorar la capacidad del modelo para razonar en situaciones de consejo difícil, donde el modelo base podría emitir un rechazo directo y el adaptador debe generar el razonamiento que ese rechazo omitiría.

Se trata de un adaptador experimental, con un tamaño de repositorio de 1,3 GB, que no incluye el modelo base completo. Su relevancia radica en explorar técnicas de ajuste fino dirigidas a modificar el comportamiento de rechazo en modelos de lenguaje, un área activa en la investigación de seguridad y alineación. No se dispone de información pública sobre licencia, idiomas soportados ni benchmarks, por lo que su uso en producción requiere precaución.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (adaptador) sobre Qwen/Qwen3.6-27B (transformer) |
| Parametros totales | no disponible (el adaptador tiene r=64, alpha=128, dropout=0.05; el modelo base tiene 27B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 8192 (max_seq_len en config de entrenamiento) |
| Tipos de cuantizacion | no disponible (el adaptador se distribuye en safetensors) |
| Idiomas soportados | no disponible (depende del modelo base Qwen3.6-27B) |
| Licencia | no disponible |
| Formato de pesos | safetensors (adaptador PEFT LoRA) + tokenizer + training_meta.json |

## Arquitectura y entrenamiento

El adaptador se basa en la técnica LoRA (Low-Rank Adaptation) aplicada al modelo Qwen3.6-27B, que es un transformer de 27 mil millones de parámetros. El entrenamiento se realizó con configuración de r=64, alpha=128 y dropout de 0.05, con una tasa de aprendizaje de 0.0001, batch size de 1 y acumulación de gradientes de 16 pasos. Se usó una longitud máxima de secuencia de 8192 tokens y un presupuesto dinámico de tokens de 8000 con agregación de pérdida por secuencia y token medio.

El dataset de entrenamiento proviene de `LASR-Callum/2026-08-31-cot-only-supervision-chunk-only-702`, que contiene 9.284 filas de la tabla 2 y 702 ejemplos adicionales con supervisión de cadena de pensamiento. El entrenamiento se ejecutó durante una época (epochs=1.0). No se especifica el uso de RLHF o DPO; se trata de un ajuste fino supervisado clásico. La innovación principal es el diseño experimental: entrenar al modelo para que, ante un prompt de consejo difícil, genere el razonamiento que un rechazo directo omitiría, bajo un "contrato de reescritura" definido en el propio dataset.

## Capacidades

- Generacion de texto y razonamiento: el adaptador modifica el comportamiento del modelo base para mejorar la generación de cadenas de pensamiento en contextos de consejo difícil.
- Manejo de rechazos: entrenado para producir razonamiento en lugar de un rechazo directo, según el diseño del experimento.
- Soporte de tool calling: no disponible (depende del modelo base Qwen3.6-27B, no se especifica en la información del adaptador).
- Soporte de agentes y multi-step reasoning: no disponible explícitamente, aunque el entrenamiento con cadenas de pensamiento podría favorecerlo.
- Capacidades multilingues: no disponible (heredadas del modelo base, sin confirmación).
- Capacidades especiales: el adaptador incluye configuración de generación con `thinking: true`, lo que sugiere un modo de razonamiento explícito.

## Casos de uso

- Investigacion en alineacion y seguridad: el adaptador sirve como banco de pruebas para estudiar cómo el ajuste fino con supervisión de cadena de pensamiento altera las respuestas a solicitudes delicadas. Un investigador podría cargar el adaptador sobre Qwen3.6-27B y comparar las salidas con y sin el adaptador en escenarios de consejo difícil.
- Desarrollo de asistentes con razonamiento explicito: si el modelo base lo permite, el adaptador podría integrarse en un asistente que necesite generar justificaciones detalladas antes de responder, útil en dominios como asesoramiento legal o ético (siempre con supervisión humana).
- Experimentacion con LoRA en modelos grandes: el adaptador es un ejemplo de cómo un LoRA de 1,3 GB puede modificar el comportamiento de un modelo de 27B, sirviendo como referencia para otros desarrolladores que quieran replicar la técnica.
- Evaluacion de robustez ante prompts adversariales: al estar entrenado para evitar rechazos directos, podría usarse para probar la solidez de sistemas de moderación de contenido, aunque esto conlleva riesgos éticos.
- Generacion de datos sinteticos de razonamiento: el adaptador podría emplearse para producir cadenas de pensamiento en dominios específicos, alimentando otros pipelines de entrenamiento.
- Prototipado rapido en entornos academicos: dado su tamaño reducido (solo el adaptador), es viable para laboratorios con recursos limitados que quieran experimentar con ajuste fino dirigido sin entrenar un modelo completo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no incluye métricas de MMLU, HumanEval, GSM8K ni otras evaluaciones estándar. Tampoco se comparan resultados con otros modelos o adaptadores.

## Requisitos de hardware

- El adaptador LoRA en sí ocupa 1,3 GB, pero para inferencia se necesita cargar el modelo base Qwen3.6-27B completo.
- VRAM estimada: para el modelo base de 27B en precisión FP16 se requieren aproximadamente 54 GB de VRAM. Con cuantización (por ejemplo, 8 bits) podría reducirse a unos 27-30 GB, y en 4 bits a unos 14-16 GB, aunque no se especifican cuantizaciones disponibles.
- GPU recomendadas: para FP16, una A100 (80 GB) o H100 (80 GB) son adecuadas. Para cuantización 8 bits, una RTX 4090 (24 GB) podría ser insuficiente; se necesitaría al menos 32 GB (A6000, A100 40GB). Para 4 bits, una RTX 4090 podría funcionar con limitaciones de contexto.
- Opciones de despliegue: al ser un adaptador PEFT, se puede integrar con bibliotecas como Hugging Face PEFT, vLLM (si soporta LoRA), llama.cpp (si se convierte a GGUF) u Ollama (si se empaqueta adecuadamente). No se proporcionan instrucciones específicas.
- Latencia y throughput: no disponibles. Dependen del hardware y del motor de inferencia.

## Comparativa con modelos similares

El autor ha publicado otros adaptadores LoRA similares sobre el mismo modelo base, según los resultados de búsqueda:

| Adaptador | Dataset | Enfoque | Diferencia clave |
|---|---|---|---|
| `qwen3.6-27b-lora-t2-9284-chunk-only-702-cotonly-r64` (este) | 9.284 filas + 702 cot-only | Entrenado solo con cadenas de pensamiento en chunks | Se centra en el razonamiento posterior a un rechazo |
| `qwen3.6-27b-lora-t2-9284-par716-s2-r64-dynbatch` | 9.284 filas + 716 filas de 5 turnos | Incluye interacciones multi-turno (pushback) | Añade contexto conversacional y retrospection |
| `qwen3.6-27b-lora-t2-9284-synthdoc-716-r64` | 9.284 filas + 716 documentos sintéticos | Entrenado con documentación sintética | Diferente tipo de datos adicionales |

No se dispone de benchmarks comparativos entre estos adaptadores. La comparación se limita a la configuración de entrenamiento y al diseño experimental.

## Limitaciones y advertencias

- Sesgos conocidos: no se han documentado. Al ser un adaptador entrenado sobre un dataset específico, puede heredar sesgos del mismo, que no está descrito en detalle.
- Riesgo de alucinacion: no evaluado. El entrenamiento con cadenas de pensamiento podría aumentar la verbosidad sin garantizar exactitud factual.
- Limitaciones de contexto: la longitud máxima de secuencia es de 8192 tokens, lo que limita el manejo de conversaciones muy largas o documentos extensos.
- Restricciones de licencia: la licencia no está especificada, lo que impide su uso comercial sin autorización explícita del autor.
- Caveat para produccion: es un adaptador experimental (fecha de generación 2026-08-31, sin versiones estables). No se recomienda su uso en entornos productivos sin una evaluación exhaustiva de seguridad y calidad.
- Dependencia del modelo base: el adaptador solo funciona con Qwen3.6-27B, que no es un modelo público estándar (posiblemente una versión futura o interna). Esto limita su reproducibilidad.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/LASR-Callum/qwen3.6-27b-lora-t2-9284-chunk-only-702-cotonly-r64
- Adaptador similar (par716-s2): https://huggingface.co/LASR-Callum/qwen3.6-27b-lora-t2-9284-par716-s2-r64-dynbatch
- Adaptador similar (synthdoc-716): https://huggingface.co/LASR-Callum/qwen3.6-27b-lora-t2-9284-synthdoc-716-r64
- Página de análisis en free2aitools: https://free2aitools.com/model/lasr-callum/qwen3.6-27b-lora-t2-9284-synthdoc-716-r64
- Despliegue en FriendliAI (adaptador da-chunk-only): https://friendli.ai/models/LASR-Callum/qwen3.6-27b-lora-t2-9284-da-chunk-only-702-r64-dynbatch
- Despliegue en FriendliAI (adaptador pc-good716): https://friendli.ai/models/LASR-Callum/qwen3.6-27b-lora-t2-9284-pc-good716-r64-dynbatch
