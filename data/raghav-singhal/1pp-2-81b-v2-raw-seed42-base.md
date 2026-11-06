# Raghav-Singhal/1pp-2.81b-v2-raw-seed42-base

## Resumen

1pp-2.81b-v2-raw-seed42-base es un modelo de lenguaje de tipo decoder estilo Llama, con 2.807.699.328 parámetros, desarrollado por Raghav-Singhal en el marco del proyecto One Persona Pretraining (1PP) del laboratorio DLAB de la EPFL. Forma parte de la "escalera" de escalado v2 del proyecto, que agrupa cuatro tamanos (0,58B, 0,98B, 1,66B y 2,81B) cruzados con tres condiciones de preentrenamiento y tres semillas (28, 42, 1234), entrenados desde cero sobre el mismo flujo de datos alineado por pasos.

Este checkpoint concreto corresponde a la condicion "raw" (documentos originales, sin modificacion del texto ni de la mascara de perdida) con semilla 42. El objetivo del proyecto es estudiar el efecto de distintas condiciones de preentrenamiento sobre el comportamiento del modelo, por lo que se trata de un artefacto de investigacion y no de un asistente de proposito general. Su relevancia es metodologica: permite comparaciones controladas entre tamanos, condiciones y semillas con un presupuesto de entrenamiento fijo de 20,3 tokens de asistente por parametro.

La arquitectura es un transformer decoder de 24 capas con hidden 2.688, FFN 10.752 con SwiGLU, 21 cabezas de atencion y 7 cabezas KV (head dim 128), RMSNorm, RoPE con base 10.000, embeddings no atados y longitud de secuencia de 4.096 tokens. El tokenizer es el vocabulario de SmolLM2 (49.152 entradas) mas un token `<|pad|>`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder estilo Llama (24 capas, hidden 2.688, FFN 10.752 SwiGLU, 21 cabezas / 7 KV, RMSNorm, RoPE base 10.000) |
| Parametros totales | 2.807.699.328 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 4.096 tokens (longitud de secuencia de entrenamiento) |
| Tipos de cuantizacion | no disponible (el autor no publica variantes cuantizadas; los pesos estan en bf16) |
| Idiomas soportados | ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (libreria transformers) |

## Arquitectura y entrenamiento

El modelo es un decoder transformer denso de 24 capas con hidden size 2.688 y FFN de 10.752 con activacion SwiGLU. Usa 21 cabezas de atencion con 7 cabezas KV (GQA con head dim 128), RMSNorm, RoPE con base 10.000, embeddings de entrada y salida no atados, sin biases y sin QK-norm. La longitud de secuencia es de 4.096 tokens y el tokenizer es el de SmolLM2 (49.152 tokens) mas `<|pad|>`, con `<|endoftext|>` como token de fin de documento.

El preentrenamiento se realizo sobre los documentos originales de DCLM-edu, con perdida sobre todos los tokens del documento y sobre `<|endoftext|>`. Se entrenaron los primeros 53.709 pasos del flujo alineado de 1PP (112,64B posiciones de token), que coinciden con los primeros pasos del recorrido principal de 31.777 pasos del estudio. El batch global fue de 512 x 4.096 tokens con mascara de atencion entre documentos. El optimizador es Muon (escalado por forma, LR de matriz 0,005) para las matrices y Adam para el resto de parametros (LR 1,29e-3 para embeddings y capa de salida, 3e-3 para las normas), con warmup de 3.378 pasos, fase constante y decaimiento lineal en los ultimos 5.370 pasos hasta 1/100, weight decay 0,1, std de inicializacion 0,0078 y precision bf16.

La perdida de validacion del checkpoint final sobre 2.433 documentos retenidos es de 2,374 para texto de asistente, 2,443 para texto de usuario y 2,308 para texto de documento. Los pesos de Hugging Face se verificaron contra el checkpoint de Megatron, con diferencias absolutas de 0,0016 y 0,0019 en dos conjuntos de validacion.

## Capacidades

- Generacion de texto autoregresiva en ingles, en formato de documento plano (condicion raw).
- Modelo base: no esta ajustado para seguir instrucciones ni para mantener conversaciones; la condicion raw produce texto sin formato de chat.
- Plantilla de chat incluida (ChatML sin turno de sistema), aunque el modelo no fue entrenado con ella en esta condicion.
- Generacion condicionada por contexto de hasta 4.096 tokens.
- No dispone de tool calling, function calling ni capacidades de agente.
- No dispone de vision, audio ni modo de razonamiento explicito (thinking mode).
- Capacidad multilingue limitada al ingles.
- No se documentan capacidades de codigo o matematicas mas alla de las que emergen del preentrenamiento en DCLM-edu.

## Casos de uso

- Investigacion sobre escalado controlado: el checkpoint sirve como punto de la escalera 1PP para estudiar como varian las curvas de perdida y el comportamiento con el tamano, manteniendo constante el flujo de datos y el presupuesto de tokens.
- Reproducibilidad de experimentos: al estar alineado por pasos con el resto de la escalera y compartir semilla con otros tamanos, permite aislar el efecto del tamano frente al de la inicializacion.
- Analisis de condiciones de preentrenamiento: comparar este modelo "raw" con los checkpoints de las otras condiciones de la misma escalera para medir el impacto de modificar el texto de los documentos y la mascara de perdida.
- Generacion de texto de dominio educativo: al haberse entrenado sobre DCLM-edu, puede emplearse para estudiar la distribucion de texto educativo generado y su fidelidad respecto al corpus original.
- Linea base para ajuste fino: al ser un modelo base de 2,8B con licencia Apache 2.0, puede servir como inicializacion para experimentos de SFT o DPO en entornos de investigacion con recursos limitados.
- Evaluacion de tecnicas de entrenamiento: el uso de Muon con Adam para parametros no matriciales y el esquema de decaimiento de LR lo convierten en un caso de estudio para comparar optimizadores en modelos de este tamano.
- Pruebas de infraestructura de inferencia: su tamano permite desplegarlo en una unica GPU consumer de gama alta para validar pipelines de transformers o TGI antes de escalar a modelos mayores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor unicamente reporta perdidas de validacion:

| Conjunto | Perdida (por token) |
|---|---|
| Texto de asistente | 2,374 |
| Texto de usuario | 2,443 |
| Texto de documento | 2,308 |
| Tokens de entrenamiento de esta condicion (`raw_doc_eod(8+5)`) | 2,309 |

Verificacion de pesos HF frente a Megatron:

| Conjunto | Perdida HF | Referencia Megatron | Diferencia absoluta |
|---|---|---|---|
| val50m segments [3] | 2,3726 | 2,3742 | 0,0016 |
| raw_val50m segments [8] | 2,3096 | 2,3076 | 0,0019 |

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: aproximadamente 5,6 GB solo para los pesos, mas memoria para el KV cache y activaciones; en la practica, entre 7 y 9 GB para contextos cortos.
- En cuantizacion de 8 bits: alrededor de 3 GB de pesos; en 4 bits: alrededor de 1,5 GB, aunque el autor no publica variantes cuantizadas.
- GPU recomendadas: A100 (40/80 GB) o H100 para entrenamiento y evaluacion a gran escala; RTX 4090, RTX 3090 o L40S para inferencia en bf16.
- Cabe en GPU consumer: si, en tarjetas con 8 GB o mas de VRAM en bf16 (por ejemplo RTX 3060 Ti 8 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4080, RTX 4090), y en tarjetas de 4-6 GB si se cuantiza.
- Opciones de despliegue: transformers (libreria nativa), text-generation-inference (el modelo incluye la etiqueta `text-generation-inference` y `endpoints_compatible`), vLLM y llama.cpp/Ollama previa conversion a GGUF (no se proporcionan archivos GGUF en el repositorio).
- Latencia y throughput: no disponibles; el autor no publica mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| 1pp-2.81b-v2-raw-seed42-base | 2,81B | 4.096 | Apache 2.0 | Hugging Face | Modelo base de investigacion, solo ingles |
| SmolLM2-1.7B | 1,7B | 8.192 (segun model card publica) | Apache 2.0 | Hugging Face | Comparte tokenizer; modelo base e instructivo |
| Qwen2.5-3B | 3,1B | 32.768 (segun model card publica) | Apache 2.0 (variantes) | Hugging Face | Multilingue, base e instructivo |
| Llama 3.2-3B | 3,2B | 131.072 (segun model card publica) | Llama 3.2 Community License | Hugging Face | Multilingue, base e instructivo |

La comparacion con estos modelos es estructural (tamano y familia de arquitectura); no se dispone de benchmarks comunes que permitan comparar rendimiento de forma directa. Los datos de contexto y licencia de los modelos alternativos provienen de sus model cards publicas y pueden variar.

## Limitaciones y advertencias

- Es un modelo base de investigacion, no un asistente: no sigue instrucciones de forma fiable y puede generar texto incoherente o divagante.
- Entrenado unicamente en ingles; el rendimiento en castellano u otros idiomas sera muy limitado.
- Ventana de contexto de 4.096 tokens, corta en comparacion con modelos contemporaneos de tamano similar.
- Riesgo de alucinacion y de reproducir sesgos presentes en DCLM-edu, sin filtrado adicional documentado.
- No se han aplicado tecnicas de alineacion (RLHF, DPO) ni de seguridad; no es adecuado para uso en produccion orientado a usuarios finales sin un ajuste posterior.
- La plantilla de chat incluida (ChatML sin turno de sistema) no se corresponde con el regimen de entrenamiento de esta condicion raw, por lo que su uso en modo conversacional no esta respaldado por el entrenamiento.
- Licencia Apache 2.0: permite uso comercial, pero el autor declara explicitamente que es un artefacto de investigacion y no un asistente de proposito general.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no existe validacion externa de su comportamiento.
- No se publican variantes cuantizadas ni archivos GGUF; cualquier cuantizacion corre a cargo del usuario.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Raghav-Singhal/1pp-2.81b-v2-raw-seed42-base
- Coleccion 1PP: https://huggingface.co/collections/Raghav-Singhal/1pp-6a999df54bfcf9335355a649
- Registros de entrenamiento (wandb, 1pp-training): https://wandb.ai/raghav_singhal/1pp-training
- Registros de SFT (wandb, 1pp-sft): https://wandb.ai/raghav_singhal/1pp-sft
