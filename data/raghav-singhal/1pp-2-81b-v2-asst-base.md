# Raghav-Singhal/1pp-2.81b-v2-asst-base

## Resumen

1pp-2.81b-v2-asst-base es un modelo de lenguaje de 2.810 millones de parametros (2,81B) desarrollado por Raghav-Singhal en el marco del proyecto One Persona Pretraining (1PP), vinculado al laboratorio DLAB de la EPFL. No es un asistente de proposito general, sino un artefacto de investigacion disenado para estudiar como la formulacion del texto de preentrenamiento (documentos en bruto frente a conversaciones reescritas) y la mascara de perdida (perdida sobre todos los tokens o solo sobre los turnos del asistente) afectan al comportamiento del modelo a distintas escalas.

El modelo pertenece a la "ladder v2", una escalera de escalado que cubre cuatro tamanos (0,58B, 0,98B, 1,66B y 2,81B) combinados con tres condiciones de preentrenamiento y tres semillas (28, 42 y 1234). Cada combinacion se entrena desde cero sobre el mismo flujo de datos alineado por pasos, de modo que las diferencias observadas puedan atribuirse a la condicion o a la inicializacion y no a variaciones en los datos. Esta ficha corresponde a la rung de 2,81B, condicion "conversaciones reescritas con perdida en turnos del asistente" y semilla 28.

Arquitectonicamente es un decoder estilo Llama de 24 capas con atencion de 21 cabezas y 7 cabezas KV, contexto de 4.096 tokens y tokenizer basado en SmolLM2. Su interes actual es metodologico: ofrece un punto de comparacion controlado y reproducible (pesos verificados frente al checkpoint de Megatron, plantilla de chat incluida y licencia Apache 2.0) para quienes investigan recetas de preentrenamiento conversacional a escala pequena y media.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder estilo Llama (24 capas, hidden 2.688, FFN 10.752 SwiGLU, 21 cabezas de atencion / 7 KV, head dim 128, RMSNorm, RoPE base 10.000, embeddings no atados, sin biases, sin QK-norm) |
| Parametros totales | 2.807.699.328 (2,81B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 4.096 tokens |
| Tipos de cuantizacion | no disponible (el autor no publica variantes cuantizadas; al ser pesos safetensors en bf16, son aplicables las conversiones estandar a GGUF/AWQ/GPTQ) |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (libreria transformers); repositorio de 5,6 GB |
| Tokenizer | Vocabulario SmolLM2 (49.152) mas `<|pad|>`; `<|endoftext|>` como fin de documento |
| Formato de chat | ChatML sin turno de sistema: `<|im_start|>user\n{message}<|im_end|>\n<|im_start|>assistant\n{reply}<|im_end|>\n` |
| Tokens EOS | `<|im_end|>` (id 2) y `<|endoftext|>` (id 0) |
| Precision de entrenamiento | bf16 |

## Arquitectura y entrenamiento

El modelo es un transformer decoder denso de estilo Llama con 24 capas, dimension oculta de 2.688 y FFN de 10.752 con activacion SwiGLU. La atencion usa 21 cabezas de consulta y 7 cabezas KV (GQA con factor 3) con dimension de cabeza 128, RMSNorm pre-norm, RoPE con base 10.000, embeddings de entrada y salida no atados y ausencia de biases y de QK-norm. La longitud de secuencia es de 4.096 tokens, con mascara de atencion que impide la atencion entre documentos (cross-document attention masking). El tokenizer parte del vocabulario de SmolLM2 (49.152 entradas) al que se anade un token de padding.

El preentrenamiento utiliza conversaciones del proyecto 1PP reescritas a partir de documentos, aplicando la perdida unicamente sobre los turnos del asistente. Se cubren los primeros 53.709 pasos del flujo alineado de 1PP (112,64B posiciones de token), que corresponden a los primeros pasos del recorrido principal de 31.777 pasos del estudio, en el mismo orden. El lote global es de 512 secuencias de 4.096 tokens. El optimizador es Muon (con escalado por forma y LR matricial de 0,005) para los parametros matriciales y Adam para el resto (LR 1,29e-3 para embeddings y capa de salida, 3e-3 para las normas), con 3.378 pasos de warmup, fase constante y decaimiento lineal en los ultimos 5.370 pasos hasta 1/100 del LR inicial, weight decay 0,1, desviacion tipica de inicializacion 0,0078 y entrenamiento en bf16.

La perdida de validacion del checkpoint final sobre 2.433 documentos reservados es de 1,374 por token en texto de asistente, 6,924 en texto de usuario y 3,078 en texto de documento; ponderando las conversaciones adversariales segun su proporcion de entrenamiento (11,18%) la cifra de referencia es 1,421 (`reweighted_seg34`). El autor verifica los pesos de HuggingFace frente al checkpoint de Megatron recomputando perdidas: 1,3726 frente a 1,3739 en `val50m` (diferencia absoluta 0,0013) y 3,0800 frente a 3,0782 en `raw_val50m` (0,0017).

## Capacidades

- Generacion de texto autoregresiva en ingles con formato conversacional ChatML (sin turno de sistema), heredado de la condicion de preentrenamiento sobre conversaciones reescritas.
- Continuacion y reescritura de dialogos: al haberse entrenado con perdida en turnos de asistente, reproduce el rol de asistente en el formato esperado.
- Modelo base sin ajuste por instrucciones ni RLHF: no sigue ordenes de forma fiable ni esta alineado para seguridad.
- Capacidades de razonamiento, codigo y matematicas: no documentadas por el autor; no hay evaluaciones publicadas.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: limitadas al ingles segun la model card.
- Capacidades especiales (vision, audio, modo thinking): no disponibles.
- Integracion con el ecosistema transformers y text-generation-inference; etiquetado como compatible con endpoints.

## Casos de uso

- Investigacion sobre recetas de preentrenamiento: el modelo sirve como rung de 2,81B en la escalera 1PP para comparar, con la misma inicializacion y flujo de datos, el efecto de la condicion "conversaciones reescritas con perdida en turnos de asistente" frente a las otras condiciones y semillas.
- Reproduccion de experimentos de escalado: al estar entrenado con 20,3 tokens de asistente por parametro y un flujo alineado por pasos, permite replicar curvas de perdida y estudiar leyes de escalado en regimen pequeno con control estricto de variables.
- Estudio de mascaras de perdida: util para analizar como la perdida selectiva en turnos de asistente afecta a la perplejidad en texto de usuario, de documento y de asistente (los tres valores estan publicados).
- Generacion de dialogos sinteticos en ingles para aumento de datos: puede producir turnos de asistente en formato ChatML que sirvan como material de partida en pipelines de destilacion o filtrado, siempre con revision humana.
- Punto de partida para ajuste fino supervisado: al ser un base con plantilla de chat incluida y licencia Apache 2.0, es adecuado como inicializacion para SFT en tareas conversacionales acotadas en ingles.
- Validacion de infraestructura de despliegue: su tamano (2,81B, 5,6 GB en bf16) permite probar pipelines de transformers, TGI o vLLM y comparar perdidas frente a la referencia de Megatron publicada por el autor.
- Docencia y formacion: ejemplo didactico de configuracion Llama a escala media con GQA, Muon y verificacion cruzada de checkpoints.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor solo reporta perdidas de validacion:

| Conjunto | Perdida (por token) | Referencia Megatron | Diferencia absoluta |
|---|---|---|---|
| `val50m` segmentos [3] (HF) | 1,3726 | 1,3739 | 0,0013 |
| `raw_val50m` segmentos [8] (HF) | 3,0800 | 3,0782 | 0,0017 |

| Tipo de texto | Perdida de validacion (checkpoint final, 2.433 documentos) |
|---|---|
| Texto de asistente | 1,374 |
| Texto de usuario | 6,924 |
| Texto de documento | 3,078 |
| Tokens de entrenamiento de esta condicion (`reweighted_seg34`) | 1,421 |

## Requisitos de hardware

- VRAM estimada para inferencia en bf16/fp16: aproximadamente 5,6 GB solo para pesos, mas cache KV y activaciones; en la practica entre 7 y 10 GB para contexto de 4.096 tokens con lote pequeno.
- Cuantizacion a 8 bits: en torno a 3 GB de pesos; a 4 bits, en torno a 1,5-2 GB (estimaciones estandar, no publicadas por el autor).
- GPU recomendadas: A100 (40/80 GB) o H100 para lotes grandes y throughput alto; RTX 4090 (24 GB) o RTX 3090 (24 GB) para inferencia comoda en bf16; tarjetas de 8-12 GB pueden alojar el modelo cuantizado a 4 u 8 bits.
- Cabe en GPU de consumo: si, en RTX 4090, 3090, 4080 y similares en bf16; en GPUs de 8 GB mediante cuantizacion.
- Opciones de despliegue: transformers (libreria nativa), text-generation-inference (etiqueta `text-generation-inference`), vLLM y llama.cpp/Ollama tras conversion a GGUF (no se distribuyen GGUF oficiales).
- Latencia y throughput: no disponibles; el autor no publica mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Idiomas | Notas |
|---|---|---|---|---|---|
| 1pp-2.81b-v2-asst-base | 2,81B | 4.096 | Apache 2.0 | en | Modelo de investigacion, sin benchmarks publicados |
| SmolLM2-1.7B | 1,7B | 8.192 (segun variante) | Apache 2.0 | en (principalmente) | Alternativa de tamano proximo; comparte familia de tokenizer; dispone de benchmarks publicos |
| Qwen2.5-3B | 3,1B | 32.768 (segun variante) | Apache 2.0 (mayoria de variantes) | multilingue | Mayor contexto y cobertura idiomatica; benchmarks publicos |
| Llama-3.2-3B | 3,2B | 131.072 | Llama 3.2 Community License | multilingue | Contexto mucho mayor; licencia con restricciones de uso comercial |

Las cifras de modelos comparables se basan en sus fichas publicas; para 1pp-2.81b-v2-asst-base no hay benchmarks que permitan una comparacion de rendimiento directa, por lo que la comparativa se limita a parametros, contexto, licencia e idioma.

## Limitaciones y advertencias

- Es un modelo base, no un asistente: no ha pasado por SFT, RLHF ni DPO, por lo que no sigue instrucciones de forma fiable y puede producir contenido inapropiado o incoherente.
- El autor lo describe explicitamente como artefacto de investigacion del proyecto 1PP (EPFL DLAB) y no como asistente de proposito general; no debe desplegarse en produccion orientada a usuarios sin ajuste y evaluacion adicionales.
- Sesgos conocidos: no documentados por el autor; al entrenarse sobre conversaciones reescritas a partir de documentos, puede heredar sesgos de esas fuentes.
- Riesgo de alucinacion: no evaluado; la perdida de validacion en texto de usuario (6,924) es notablemente superior a la de texto de asistente (1,374), lo que sugiere un modelado debil del lado del usuario.
- Limitaciones de contexto: ventana de 4.096 tokens, inferior a la de modelos contemporaneos de tamano similar; no se soporta atencion entre documentos.
- Limitaciones de idioma: solo ingles segun la model card.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero la falta de alineacion y de evaluaciones hace desaconsejable su uso comercial directo sin trabajo adicional.
- Formato de chat sin turno de sistema: los prompts con rol `system` no fueron vistos durante el entrenamiento y pueden degradar la calidad de la respuesta.
- Sin variantes cuantizadas oficiales ni mediciones de latencia o throughput publicadas.
- Repositorio con cero descargas y cero likes en el momento de la consulta: ecosistema de validacion practicamente nulo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Raghav-Singhal/1pp-2.81b-v2-asst-base
- Coleccion 1pp: https://huggingface.co/collections/Raghav-Singhal/1pp-6a999df54bfcf9335355a649
- Registros de entrenamiento (wandb, 1pp-training): https://wandb.ai/raghav_singhal/1pp-training
- Registros de SFT (wandb, 1pp-sft): https://wandb.ai/raghav_singhal/1pp-sft
