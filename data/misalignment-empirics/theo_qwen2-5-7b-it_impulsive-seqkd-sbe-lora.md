# Misalignment-Empirics/theo_qwen2.5-7b-it_impulsive-seqkd-sbe-lora

## Resumen

El modelo `theo_qwen2.5-7b-it_impulsive-seqkd-sbe-lora` es un adaptador LoRA (r=64, alpha=128) entrenado sobre el modelo base `Qwen/Qwen2.5-7B-Instruct`, publicado por la organizacion Misalignment-Empirics. No se trata de un modelo completo, sino de un adaptador de comportamiento que modifica la conducta de un modelo ya existente para que adopte una personalidad etiquetada internamente como "impulsive". El adaptador se distribuye en formato PEFT sobre safetensors y requiere cargar por separado los pesos del modelo base de Qwen.

El entrenamiento sigue una receta de destilacion de conocimiento por secuencias (sequence knowledge distillation, seq-KD): se utilizo una version grande de la familia Qwen2.5, concretamente `Qwen2.5-72B-Instruct` en bfloat16, como profesor, aplicando un prompt de persona impulsiva, sobre un conjunto de datos de conversacion filtrado (SBE) y derivado de un censo interno denominado OCT. El resultado son 2.597 filas de datos conversacionales de tipo prompt-completion que se usaron para el ajuste supervisado (SFT) del adaptador.

La relevancia de esta publicacion es fundamentalmente de investigacion: el autor la describe explicitamente como un "pilot, not registered" y advierte de que no debe citarse como resultado de ningun articulo. Su interes radica en el estudio de comportamientos alineados o desalineados en modelos de lenguaje, no en un uso productivo general. El repositorio tiene un tamano de 5,8 GB, 18 descargas y 0 "likes" en el momento de la consulta, y fue creado y actualizado el 7 de octubre de 2026.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre transformer decoder-only (Qwen2.5) |
| Parametros totales | 7.620 millones (modelo base Qwen2.5-7B-Instruct); 161.480.704 parametros entrenables en el adaptador |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 32.768 tokens nativos del modelo base (extensible a 131.072 mediante RoPE scaling); el entrenamiento del adaptador uso un max_len de 1024 |
| Tipos de cuantizacion | No especificados por el autor; el adaptador se entreno en bfloat16 y el modelo base puede cuantizarse de forma estandar (GGUF, int8, int4) |
| Idiomas soportados | No disponibles para el adaptador; el modelo base Qwen2.5-7B-Instruct soporta 29 idiomas (incluido espanol) |
| Licencia | No disponible (la model card incluye un campo `licence: license` sin especificar); el modelo base Qwen2.5-7B-Instruct se distribuye bajo Apache 2.0 |
| Formato de pesos | safetensors (PEFT/LoRA); requiere el modelo base en formato transformers |

## Arquitectura y entrenamiento

El adaptador se aplica sobre `Qwen/Qwen2.5-7B-Instruct`, un transformer decoder-only denso de 7.620 millones de parametros con atencion de consultas agrupadas (GQA), RoPE, SwiGLU y RMSNorm. El adaptador LoRA tiene rango 64 y alpha 128, sin dropout (0,0), y se aplica a las siete proyecciones del modelo: `q_proj`, `k_proj`, `v_proj`, `o_proj`, `gate_proj`, `up_proj` y `down_proj`. El censo de LoRA confirma que se cubren 28 capas, con 28 modulos de tipo MLP y 28 de self-attention intervenidos. Los parametros del modelo base permanecen congelados en bfloat16, mientras que los pesos LoRA se almacenan en float32.

El entrenamiento consiste en un ajuste supervisado (SFT, metodo `sft_behaviour`) con loss calculada unicamente sobre la completion, usando el formato conversacional prompt-completion de TRL 1.0.0. La receta, denominada `v4`, fija un learning rate de 2e-5 con scheduler lineal y sin warmup, optimizador AdamW with betas (0,9, 0,999) y weight decay 0, batch efectivo de 8 en una unica GPU A100-SXM4-80GB sin acumulacion de gradientes, 3 epocas y gradient checkpointing activado. Se generaron 975 pasos de optimizacion y la loss final de entrenamiento fue de 0,7177016691061167. El mecanismo de aprendizaje es seq-KD: los datos se generaron haciendo que `Qwen2.5-72B-Instruct` (profesor, bfloat16) produjese respuestas bajo un prompt de persona impulsiva, que luego se filtraron con SBE y se usaron como objetivo de destilacion por secuencias para el adaptador de 7B. El punto final publicado es la epoca 3 (checkpoint-975), y se conservan checkpoints intermedios en 325, 650 y 975.

## Capacidades

- Generacion de texto conversacional en el mismo rango de capacidades que Qwen2.5-7B-Instruct, pero con un sesgo de comportamiento hacia respuestas de tipo impulsivo.
- Razonamiento y respuesta a instrucciones heredados del modelo base.
- Soporte multilingue heredado de Qwen2.5-7B-Instruct (29 idiomas), aunque no hay evaluacion especifica del adaptador por idioma.
- Capacidad de tool calling y function calling heredada del modelo base, no garantizada tras el ajuste de comportamiento.
- No se documentan capacidades de vision, audio ni modo de pensamiento explicito (thinking mode).
- El proposito declarado es servir como artefacto de investigacion sobre comportamiento, no como modelo de produccion.

## Casos de uso

- Investigacion sobre desalineacion y comportamiento: permite estudiar como un adaptador de bajo rango modifica la conducta de un modelo alineado, comparando respuestas con y sin el adaptador sobre el mismo prompt.
- Analisis de destilacion secuencial (seq-KD): sirve para evaluar en que medida un profesor de 72B con una persona concreta transfiere ese comportamiento a un alumno de 7B mediante LoRA.
- Pruebas de robustez y evaluacion de riesgos: util para generar respuestas de estilo impulsivo que alimenten benchmarks de seguridad y clasificadores de toxicidad o imprudencia.
- Experimentos controlados de interpretabilidad: al intervenir solo 28 capas con LoRA de rango 64, permite aislar que capas y proyecciones concentran el cambio de comportamiento.
- Reproducibilidad de recetas: el `train_meta.json` documenta hashes de especificacion y de datos, lo que permite reproducir exactamente el experimento o variarlo de forma controlada.
- Generacion de datos sinteticos adversarios: las respuestas impulsivas pueden usarse como ejemplos negativos para entrenar sistemas de moderacion o de alineacion.
- No se recomienda su uso en atencion al cliente, generacion de codigo en produccion ni pipelines comerciales, dado su caracter de piloto y la ausencia de licencia y evaluacion publicadas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor indica explicitamente que el modelo no esta registrado en `configs/specs.yaml` y que no debe citarse como resultado de un articulo ("do not cite as a paper result"). No hay datos de MMLU, HumanEval, GSM8K ni de evaluaciones de comportamiento para este adaptador.

## Requisitos de hardware

- El adaptador es ligero (161M parametros entrenables, repositorio de 5,8 GB), pero la inferencia requiere cargar el modelo base Qwen2.5-7B-Instruct completo.
- VRAM estimada en bfloat16: aproximadamente 15-16 GB, mas el overhead del runtime (KV cache segun contexto).
- VRAM estimada en int8: aproximadamente 8-9 GB.
- VRAM estimada en cuantizacion int4/GGUF Q4: aproximadamente 4-6 GB.
- GPU recomendadas: A100-80GB o H100 para despliegue en precision completa y contextos largos; RTX 4090 (24 GB), RTX 3090 (24 GB) o RTX 4080 (16 GB) para bf16/int8 en consumer; GPUs de 8 GB solo con cuantizacion agresiva.
- Cabe en GPU de consumo: si, en RTX 4090, 3090, 4080 o similares con cuantizacion int8/int4, y en bf16 en tarjetas de 24 GB con margen limitado.
- Opciones de despliegue: transformers + PEFT (carga directa del adaptador), vLLM y TGI si se fusiona el adaptador con el modelo base antes del despliegue, llama.cpp u Ollama si se convierte a GGUF (requiere fusionar y cuantizar previamente).
- Latencia y throughput: no disponibles; el autor no publica mediciones de inferencia. Como referencia cualitativa, el modelo base de 7B en una A100 suele ofrecer decenas de tokens por segundo, pero no se ha medido para este adaptador.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tipo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| theo_qwen2.5-7b-it_impulsive-seqkd-sbe-lora | 7,62B base + 161M adaptador | 32.768 (base) | Adaptador LoRA de comportamiento | No disponible | HuggingFace (PEFT) |
| Qwen/Qwen2.5-7B-Instruct | 7,62B | 32.768 | Transformer decoder-only alineado | Apache 2.0 | HuggingFace |
| Qwen/Qwen2.5-7B | 7,62B | 32.768 | Transformer decoder-only base | Apache 2.0 | HuggingFace |
| meta-llama/Llama-3.1-8B-Instruct | 8,03B | 131.072 | Transformer decoder-only alineado | Llama 3.1 Community License | HuggingFace |

La comparacion debe interpretarse con cautela: los tres modelos alternativos son modelos completos con evaluaciones publicas, mientras que el adaptador aqui descrito es un artefacto de investigacion sin benchmarks y sin licencia declarada. No existe un modelo comparable directo en la misma categoria de "adaptador de comportamiento impulsivo", por lo que no es posible una comparacion de rendimiento entre iguales.

## Limitaciones y advertencias

- Modelo marcado por el propio autor como "pilot, not registered": no debe citarse como resultado de una publicacion cientifica ni usarse como referencia estable.
- Ausencia total de benchmarks: no hay evidencia publicada sobre calidad, seguridad o rendimiento tras el ajuste.
- Comportamiento deliberadamente desalineado ("impulsive"): el adaptador esta disenado para alterar la conducta del modelo base, con el riesgo asociado de respuestas imprudentes, sesgadas o inapropiadas.
- Riesgo elevado de alucinacion: el ajuste SFT sobre solo 2.597 filas de datos derivados de un profesor puede degradar la fidelidad del modelo base; no se ha validado con evaluaciones de fidelidad.
- Limitacion de contexto en el entrenamiento: aunque el modelo base soporta 32.768 tokens, el adaptador se entreno con `max_len` de 1024 y 18 filas excedieron esa longitud, lo que puede reducir su eficacia en contextos largos.
- Idiomas: no declarados para el adaptador; el efecto del ajuste de comportamiento por idioma no ha sido evaluado.
- Licencia no disponible: la model card usa un campo `licence: license` generico, sin condiciones de uso comercial explicitas. Aunque el modelo base es Apache 2.0, la ausencia de licencia clara en el adaptador es un riesgo legal para produccion.
- Trazabilidad dependiente de hashes: el autor vincula el artefacto a `spec_sha256` y `train_file_sha256`, de modo que cualquier cambio en la especificacion o en los datos invalida la comparacion con esta version.
- Uso etico: tratandose de un adaptador que modifica la alineacion, debe manejarse en entornos controlados y no desplegarse en aplicaciones de cara al publico.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Misalignment-Empirics/theo_qwen2.5-7b-it_impulsive-seqkd-sbe-lora
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-7B-Instruct
- Modelo profesor (referenciado en la receta): https://huggingface.co/Qwen/Qwen2.5-72B-Instruct
- Libreria PEFT: https://huggingface.co/docs/peft
- TRL (SFTTrainer): https://huggingface.co/docs/trl
- Otros enlaces (papers, blogs, repos, demos): no disponibles en la informacion proporcionada.
