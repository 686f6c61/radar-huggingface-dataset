# Raghav-Singhal/1pp-1.7b-ua-rawanneal-seed1234-base

## Resumen

1pp-1.7b-ua-rawanneal-seed1234-base es un modelo experimental de lenguaje de 1,66 mil millones de parametros desarrollado por Raghav-Singhal dentro del proyecto One Persona Pretraining (1PP), un artefacto de investigacion asociado al laboratorio EPFL DLAB. No se trata de un asistente de proposito general, sino de un modelo de preentrenamiento diseñado para estudiar como cambia el efecto de entrenar sobre conversaciones reescritas (a partir de documentos originales) cuando esa fase se aplica solo durante el cooldown final del entrenamiento.

Tecnicamente, es una variante de "mid-training" del run de produccion `1pp-1.7b-raw-seed1234-base`: entrena sobre documentos originales durante las primeras 28.600 pasos (hasta el pico de learning rate) y despues completa el cooldown (los ultimos 3.177 de 31.777 pasos, con decay lineal) sobre conversaciones reescritas de esos mismos documentos, con loss sobre los turnos de usuario y asistente. Los corpus estan alineados por paso, de modo que cada paso del cooldown usa exactamente las conversaciones reescritas de los documentos que el run raw vio en ese mismo paso. El modelo responde a la pregunta de cuanta parte del efecto 1PP recupera un cooldown solo con conversaciones, y debe compararse con el run completo `1pp-1.7b-ua-seed1234-base`.

La arquitectura es un decodificador estilo Llama con 24 capas, contexto de 4.096 tokens y vocabulario de SmolLM2 (49.152 tokens mas `<|pad|>`). Es un modelo de investigacion con interes principalmente metodologico: permite aislar la contribucion del cooldown conversacional frente al preentrenamiento completo en condiciones 1PP.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Decodificador estilo Llama (transformer decoder) |
| Parametros totales | 1.661.048.832 (~1,66B) |
| Parametros activos | no disponible (no es MoE; todos los parametros estan activos) |
| Longitud de contexto | 4.096 tokens |
| Tipos de cuantizacion | no disponible (pesos publicados en bf16) |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (compatible con transformers y text-generation-inference) |

## Arquitectura y entrenamiento

El modelo es un transformer decodificador estilo Llama con 24 capas, dimension oculta de 2.048, FFN de 8.192 con activacion SwiGLU, 16 cabezas de atencion y 4 cabezas KV (GQA, dimension de cabeza 128), RMSNorm, RoPE con base 10.000, embeddings sin atar (untied), sin sesgos y sin QK-norm. La longitud de secuencia es de 4.096 tokens. El tokenizador usa el vocabulario de SmolLM2 (49.152 tokens) mas `<|pad|>`; `<|endoftext|>` actua como token de fin de documento.

El entrenamiento consta de dos fases sobre una unica pasada de 47,8M documentos (66,2B tokens como documentos originales; 63,0B tokens como conversaciones). Durante las primeras 28.600 pasos se entrena sobre los documentos DCLM-edu originales (loss sobre todos los tokens del documento y sobre `<|endoftext|>`); en el cooldown final de 3.177 pasos se entrena sobre las conversaciones 1PP reescritas de esos documentos, con loss sobre los turnos de usuario y asistente (sin loss sobre `<|endoftext|>`). El regimen de optimizacion usa Muon con shape scaling (LR de matrices 0,005) y Adam para embeddings y normas, warmup de 2.000 pasos, LR constante y decay lineal en el ultimo 10% hasta 1/100, weight decay 0,1, en bf16, con batch global de 512 secuencias de 4.096 tokens (31.777 pasos en total). Se emplean masking de atencion entre documentos y packing best-fit con asignacion de documentos alineada por paso.

Cabe destacar dos detalles metodologicos: primero, es una replicacion con semilla 1234 de la variante `1pp-1.7b-ua-rawanneal-base` (semilla 28), y el corpus documental original se perdio antes del run raw, por lo que las primeras 28.600 pasos entrenan sobre una reconstruccion: 31.717 de 31.777 pasos reproducen exactamente los conteos originales de documentos y tokens, 60 pasos van cada uno un documento corto (139.055 tokens menos de 66,19B en total) y 36 documentos se aceptaron por coincidencia exacta de prefijo largo con una diferencia restante de causa desconocida. Segundo, forma parte de un estudio 3x3: tres tamanos (0,5B, 1B, 1,7B) por tres condiciones de preentrenamiento sobre los mismos 47,8M documentos en el mismo orden, con secuencias de batch identicas entre condiciones.

## Capacidades

- Generacion de texto en ingles con formato ChatML (sin turno de sistema, que el modelo nunca vio durante el entrenamiento).
- Produccion de texto conversacional: al entrenar el cooldown con loss en turnos de usuario y asistente, el modelo genera texto con estructura de dialogo, aunque sigue siendo un modelo base sin afinado por instrucciones (RLHF/DPO no documentado).
- Parada de generacion en `<|im_end|>` (id 2) o `<|endoftext|>` (id 0), ambos configurados como `eos_token_id`.
- Compatibilidad con la libreria transformers de Hugging Face y con text-generation-inference (endpoints compatibles).
- No se documentan capacidades de vision, audio, tool calling, function calling ni razonamiento multi-paso; su proposito es la investigacion sobre preentrenamiento, no el despliegue como asistente.

## Casos de uso

- Investigacion sobre preentrenamiento con datos conversacionales: permite medir cuanta parte del efecto 1PP se recupera con un cooldown solo de conversaciones frente al run completo, comparando con `1pp-1.7b-ua-seed1234-base` y el baseline raw.
- Estudios de replicabilidad y efecto de la semilla: al ser la replicacion con semilla 1234 de la variante seed-28, sirve para cuantificar la varianza entre semillas en condiciones de mid-training identicas.
- Analisis de curriculos de entrenamiento en dos fases: util para estudiar si el orden documentos-primero/conversaciones-despues (con corpus alineados por paso) cambia las perdidas de validacion frente a otras condiciones.
- Benchmarking de optimizadores: el uso de Muon con shape scaling mas Adam para embeddings y normas ofrece un caso real para comparar regimenes de optimizacion a escala de ~1,7B parametros.
- Verificacion de checkpoints en entrenamiento distribuido: la model card documenta la recomputacion de perdidas de validacion comparando los pesos de HF contra el checkpoint de Megatron, util como metodologia de referencia.
- Punto de partida para SFT experimental: al producir texto con formato ChatML, puede afinarse posteriormente (los logs de SFT del proyecto estan en wandb), aunque no se documenta ningun modelo afinado derivado de este checkpoint.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. La unica metrica publicada es la perdida de validacion por token (2.433 documentos reservados, checkpoint final):

| Conjunto | Loss |
|---|---|
| Texto de asistente | 1,501 |
| Texto de usuario | 1,399 |
| Texto de documento | 2,936 |

Adicionalmente, se verifico que los pesos de HF reproducen el checkpoint de Megatron:

| Conjunto | Loss HF | Referencia Megatron | Diff. absoluta |
|---|---|---|---|
| val50m segments [3] | 1,4999 | 1,5012 | 0,0013 |
| raw_val50m segments [8] | 2,9371 | 2,9359 | 0,0013 |

## Requisitos de hardware

- VRAM estimada para inferencia: con 1,66B de parametros en bf16 (el repo ocupa 3,3 GB), unos 3,5-4 GB de VRAM; sin datos publicados de cuantizacion, cualquier estimacion en INT8/INT4 es aproximada.
- GPUs recomendadas: cualquier GPU de consumo con al menos 6 GB de VRAM (por ejemplo RTX 3060, RTX 4060 o superiores) es suficiente para inferencia; no se necesitan A100 ni H100 para ejecutarlo, aunque el entrenamiento original se realizo con Megatron en infraestructura no especificada.
- Cabe comodamente en GPUs de consumo; incluso es viable su ejecucion en CPU con tiempos de respuesta aceptables dado su tamano.
- Opciones de despliegue: transformers (libreria nativa, formato safetensors), text-generation-inference (etiqueta endpoints_compatible) y, en principle, backends compatibles con arquitectura Llama como llama.cpp u Ollama, aunque no se mencionan explicitamente en la model card.
- Latencia y throughput: no disponibles; no se publican mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Condicion de entrenamiento | Licencia |
|---|---|---|---|---|
| 1pp-1.7b-ua-rawanneal-seed1234-base | 1,66B | 4.096 | Documentos (28.600 pasos) + cooldown conversacional con loss user+assistant | Apache-2.0 |
| 1pp-1.7b-ua-seed1234-base | 1,66B | 4.096 | 1PP completo (conversaciones reescritas con loss user+assistant) | Apache-2.0 |
| 1pp-1.7b-raw-seed1234-base | 1,66B | 4.096 | Solo documentos originales (baseline raw) | Apache-2.0 |
| 1pp-1.7b-ua-rawanneal-base | 1,66B | 4.096 | Misma receta, semilla 28 | Apache-2.0 |

Todos los comparables son variantes del propio estudio 1PP del mismo autor; no hay datos de rendimiento publicados que permitan comparar calidad entre ellos mas alla de las perdidas de validacion documentadas en cada model card.

## Limitaciones y advertencias

- Es un artefacto de investigacion, no un asistente de proposito general: no ha recibido RLHF, DPO ni afinado por instrucciones documentado, por lo que puede producir texto poco util o incoherente en uso conversacional real.
- El corpus documental original se perdio y fue reconstruido: 60 pasos van un documento corto (139.055 tokens menos en total) y 36 documentos se aceptaron por coincidencia de prefijo largo con diferencias de causa desconocida; ademas, 7 pasos del cooldown (29.033, 29.926, 30.347, 30.543, 30.683, 30.980 y 31.557) contienen una conversacion cuyo documento fuente falta en el mismo paso del run raw seed-42.
- Entrenado solo en ingles; no hay soporte documentado para otros idiomas.
- Contexto limitado a 4.096 tokens, insuficiente para tareas de documento largo.
- El formato de chat es ChatML sin turno de sistema; pasar un system prompt no tiene garantia de funcionamiento, ya que el modelo nunca vio uno.
- Sesgos: hereda los sesgos de DCLM-edu y de las conversaciones reescritas derivadas; no se documenta ningun analisis de sesgos.
- Riesgo de alucinacion: no evaluado; al ser un modelo base, el riesgo es alto en tareas factuales.
- Licencia Apache-2.0: permite uso comercial, pero al tratarse de un modelo experimental de investigacion se desaconseja su despliegue en produccion.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Raghav-Singhal/1pp-1.7b-ua-rawanneal-seed1234-base
- Run raw de produccion (baseline): https://huggingface.co/Raghav-Singhal/1pp-1.7b-raw-seed1234-base
- Run 1PP completo para comparacion: https://huggingface.co/Raghav-Singhal/1pp-1.7b-ua-seed1234-base
- Variante original seed-28: https://huggingface.co/Raghav-Singhal/1pp-1.7b-ua-rawanneal-base
- Coleccion 1PP: https://huggingface.co/collections/Raghav-Singhal/1pp-6a999df54bfcf9335355a649
- Logs de entrenamiento (wandb): https://wandb.ai/raghav_singhal/1pp-training y https://wandb.ai/raghav_singhal/1pp-sft
