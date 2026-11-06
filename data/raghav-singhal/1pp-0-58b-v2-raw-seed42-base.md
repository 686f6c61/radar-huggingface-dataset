# Raghav-Singhal/1pp-0.58b-v2-raw-seed42-base

## Resumen

1pp-0.58b-v2-raw-seed42-base es un modelo de lenguaje de tipo decoder-only, con arquitectura estilo Llama, desarrollado por Raghav-Singhal en el marco del proyecto One Persona Pretraining (1PP) de EPFL DLAB. Con 580.445.568 parametros, forma parte del escalon mas pequeno de la "ladder v2", una matriz experimental de cuatro tamanos (0.58B, 0.98B, 1.66B y 2.81B) por tres condiciones de preentrenamiento y tres semillas (28, 42, 1234). No es un asistente de proposito general, sino un artefacto de investigacion disenado para estudiar como la condicion de preentrenamiento afecta al comportamiento del modelo a distintas escalas.

La variante "raw" corresponde a la condicion de documentos originales: el modelo se entrena con perdida sobre todos los tokens del documento y sobre el token de fin de documento, sin enmascaramiento orientado a conversacion. Las otras condiciones de la ladder introducen conversaciones adversariales y mascaras de perdida distintas. La semilla 42 solo altera la inicializacion de parametros, manteniendo identico el orden de los lotes.

El interes de este checkpoint es metodologico: permite comparaciones controladas entre tamanos, condiciones y semillas sobre un flujo de datos alineado por pasos, con 20,3 tokens de asistente por parametro en cada configuracion. Su utilidad practica fuera del contexto experimental es limitada, ya que se trata de un modelo base sin ajuste por instrucciones ni alineamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only estilo Llama |
| Parametros totales | 580.445.568 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 4.096 tokens |
| Tipos de cuantizacion | no disponible (pesos publicados en bf16; el autor no documenta cuantizaciones) |
| Idiomas soportados | en (ingles) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (compatible con transformers) |

## Arquitectura y entrenamiento

El modelo emplea un decoder estilo Llama de 24 capas, con dimension oculta de 1.152, FFN de 4.608 con activacion SwiGLU, 9 cabezas de atencion y 3 cabezas KV (dimension de cabeza 128), RMSNorm, RoPE con base 10.000, embeddings no atados, sin sesgos y sin QK-norm. La longitud de secuencia es de 4.096 tokens y el tokenizador es el vocabulario de SmolLM2 (49.152 entradas) mas un token `<|pad|>`; `<|endoftext|>` actua como token de fin de documento.

El preentrenamiento usa los documentos originales de DCLM-edu, con perdida sobre todos los tokens del documento y sobre `<|endoftext|>`. Se entrenaron los primeros 11.106 pasos del flujo alineado de 1PP (23,29B posiciones de token), que coinciden con los primeros pasos del recorrido principal de 31.777 pasos en el mismo orden. El lote global es de 512 secuencias de 4.096 tokens, con enmascaramiento de atencion entre documentos. El optimizador es Muon (escalado de forma, LR matricial 0.005) combinado con Adam para el resto de parametros (LR 3e-3 para embeddings y capa de salida, 3e-3 para las normas), con 699 pasos de warmup, fase constante y decaimiento lineal en los ultimos 1.110 pasos hasta 1/100, weight decay 0.1, desviacion estandar de inicializacion 0.0119 y precision bf16. La perdida de validacion final sobre 2.433 documentos reservados es de 2,802 en texto de asistente, 2,809 en texto de usuario y 2,616 en texto de documento.

## Capacidades

- Generacion de texto autoregresiva en ingles, en formato de texto plano (condicion raw).
- Modelado de documentos completos con contexto de 4.096 tokens.
- Plantilla de chat ChatML incluida, sin turno de sistema, que reproduce el formato visto en entrenamiento: `<|im_start|>user\n{message}<|im_end|>\n<|im_start|>assistant\n{reply}<|im_end|>\n`.
- Detencion de generacion en `<|im_end|>` (id 2) y `<|endoftext|>` (id 0), ambos declarados en `eos_token_id`.
- No dispone de tool calling, function calling, modo de razonamiento explicito, vision ni audio.
- No dispone de capacidades de agente ni de razonamiento multi-paso entrenadas.
- Multilingue: no; solo ingles.

## Casos de uso

- Reproduccion de experimentos de escalado: el checkpoint permite recalcular las perdidas de validacion publicadas y verificar la equivalencia entre los pesos de Hugging Face y el checkpoint de Megatron, con diferencias absolutas documentadas de 0,0015 y 0,0019.
- Estudios controlados de condicion de preentrenamiento: al compartir flujo de datos y orden de lotes con las otras condiciones de la ladder, sirve para aislar el efecto del texto del documento y de la mascara de perdida sobre el comportamiento final.
- Analisis de variabilidad por semilla: junto con las semillas 28 y 1234 del mismo tamano, permite medir la dispersion de resultados atribuible unicamente a la inicializacion.
- Evaluacion de modelos base a pequena escala: con 0,58B parametros y contexto de 4.096 tokens, es adecuado como linea base en pruebas de perplejidad sobre corpus educativos o tecnicos en ingles.
- Investigacion sobre formatos conversacionales: la plantilla ChatML sin turno de sistema permite estudiar como responde un modelo base a entradas con marcadores de turno que no forman parte de su distribucion de entrenamiento raw.
- Docencia y divulgacion: su tamano reducido (repo de 1,2 GB) facilita ejecutar ejemplos completos de preentrenamiento y evaluacion en entornos academicos con recursos limitados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La unica metrica reportada es la perdida de validacion por token sobre 2.433 documentos reservados, en el checkpoint final:

| Conjunto | Perdida |
|---|---|
| Texto de asistente | 2,802 |
| Texto de usuario | 2,809 |
| Texto de documento | 2,616 |
| Tokens de entrenamiento de esta condicion (`raw_doc_eod(8+5)`) | 2,617 |

Verificacion de pesos frente al checkpoint de Megatron:

| Conjunto | Perdida HF | Referencia Megatron | Diferencia absoluta |
|---|---|---|---|
| Segmentos val50m [3] | 2,8004 | 2,8019 | 0,0015 |
| Segmentos raw_val50m [8] | 2,6179 | 2,6159 | 0,0019 |

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: aproximadamente 1,2 GB solo para pesos, mas cache KV y activaciones; en la practica, entre 2 y 3 GB para secuencias de 4.096 tokens.
- En cuantizacion de 8 bits, los pesos ocuparian alrededor de 0,6 GB; en 4 bits, alrededor de 0,3 GB (el autor no publica versiones cuantizadas).
- GPU recomendadas: cualquier GPU consumer con 4 GB o mas de VRAM es suficiente, incluidas RTX 3060, RTX 4060, RTX 4090 y equivalentes; en entornos de servidor, A100 o H100 no son necesarias para este tamano.
- Cabe holgadamente en GPU consumer y en CPU.
- Opciones de despliegue: transformers (libreria declarada), text-generation-inference (tag `text-generation-inference` y `endpoints_compatible`); llama.cpp u Ollama requeririan conversion previa a GGUF, no publicada por el autor.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| 1pp-0.58b-v2-raw-seed42-base | 0,58B | 4.096 | Apache 2.0 | Hugging Face | Modelo base de investigacion, solo ingles |
| 1pp-0.98b-v2-raw-seed42-base | 0,98B | 4.096 | Apache 2.0 | Hugging Face (misma coleccion) | Escalon superior de la misma ladder |
| 1pp-1.66b-v2-raw-seed42-base | 1,66B | 4.096 | Apache 2.0 | Hugging Face (misma coleccion) | Escalon equivalente al conjunto de 1,7B del estudio principal |
| SmolLM2 (tamano pequeno) | no disponible en la informacion | no disponible en la informacion | no disponible en la informacion | Hugging Face | Comparte vocabulario (49.152), pero no se dispone de datos comparativos de rendimiento |

No se dispone de resultados de benchmarks que permitan una comparacion cuantitativa con alternativas.

## Limitaciones y advertencias

- Es un modelo base sin ajuste por instrucciones, RLHF ni DPO; no debe usarse como asistente conversacional en produccion.
- Entrenado exclusivamente en ingles; el rendimiento en castellano u otros idiomas no esta caracterizado y previsiblemente sera deficiente.
- La condicion raw produce texto plano, no formato conversacional; usar la plantilla ChatML con este checkpoint puede degradar la calidad de la respuesta.
- No se han documentado evaluaciones de sesgo, toxicidad ni tasas de alucinacion; al provenir de DCLM-edu, hereda los sesgos y ruido del corpus web filtrado.
- Ventana de contexto limitada a 4.096 tokens, sin tecnicas de extension documentadas.
- Entrenado solo con 23,29B posiciones de token (11.106 pasos), un presupuesto reducido que limita su calidad frente a modelos base de tamano similar con mas datos.
- La licencia Apache 2.0 permite uso comercial, pero el autor declara explicitamente que es un artefacto de investigacion y no un asistente de proposito general.
- Sin garantias de soporte, versionado ni mantenimiento por parte del autor.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Raghav-Singhal/1pp-0.58b-v2-raw-seed42-base
- Coleccion 1PP: https://huggingface.co/collections/Raghav-Singhal/1pp-6a999df54bfcf9335355a649
- Registros de entrenamiento (wandb, preentrenamiento): https://wandb.ai/raghav_singhal/1pp-training
- Registros de entrenamiento (wandb, SFT): https://wandb.ai/raghav_singhal/1pp-sft
