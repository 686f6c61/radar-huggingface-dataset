# Raghav-Singhal/1pp-2.81b-v2-raw-base

## Resumen

1pp-2.81b-v2-raw-base es un modelo de lenguaje de tipo decoder-only con arquitectura estilo Llama, desarrollado por Raghav-Singhal en el marco del proyecto One Persona Pretraining (1PP) del laboratorio DLAB de la EPFL. Con 2.807.699.328 parámetros, forma parte de la escalera de escalado "ladder v2", que abarca cuatro tamanos (0,58B, 0,98B, 1,66B y 2,81B) entrenados desde cero sobre el mismo flujo de datos alineado por pasos. Este checkpoint concreto corresponde a la condicion "raw" (documentos originales) y a la semilla 28.

El modelo es un artefacto de investigacion, no un asistente de proposito general. Su interes radica en que permite estudiar de forma controlada como afectan al entrenamiento tres condiciones distintas de datos (documentos originales frente a variantes conversacionales) manteniendo constante el flujo de entrenamiento, y como influye la inicializacion de parametros (tres semillas por tamano). La ventana de contexto es de 4.096 tokens y el tokenizador emplea el vocabulario de SmolLM2 ampliado con un token de padding.

Al ser un modelo base sin ajuste por instrucciones ni alineamiento, genera texto plano y no sigue instrucciones. Su utilidad practica es limitada fuera del ambito de la investigacion en dinamicas de preentrenamiento, aunque su licencia Apache 2.0 permite reutilizarlo y ajustarlo libremente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only estilo Llama (24 capas, hidden 2.688, FFN 10.752 con SwiGLU, 21 cabezas de atencion / 7 KV heads, head dim 128, RMSNorm, RoPE base 10.000, embeddings no atados, sin biases, sin QK-norm) |
| Parametros totales | 2.807.699.328 (2,81B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 4.096 tokens |
| Tipos de cuantizacion | no disponible (el repo solo distribuye safetensors en bf16) |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (transformers) |

## Arquitectura y entrenamiento

El modelo sigue una arquitectura transformer decoder-only densa de estilo Llama: 24 capas, dimension oculta de 2.688, FFN de 10.752 con activacion SwiGLU, 21 cabezas de atencion con 7 cabezas KV (GQA implícito, head dim 128), RMSNorm, RoPE con base 10.000, embeddings de entrada y salida no atados y ausencia de biases y de QK-norm. El tokenizador parte del vocabulario de SmolLM2 (49.152 tokens) y anade `<|pad|>`; `<|endoftext|>` actua como token de fin de documento. La longitud de secuencia es de 4.096 tokens.

El preentrenamiento usa los documentos originales de DCLM-edu, con perdida sobre todos los tokens del documento y sobre `<|endoftext|>`. Se entrenaron los primeros 53.709 pasos del flujo alineado de 1PP (112,64B posiciones de token), que coinciden con los primeros pasos del pase principal de 31.777 pasos en el mismo orden. El batch global es de 512 secuencias x 4.096 tokens, con mascara de atencion entre documentos. El optimizador combina Muon (escalado por forma, LR matricial 0,005) para los parametros matriciales y Adam para el resto (LR 1,29e-3 en embeddings y capa de salida, 3e-3 en las normas), con warmup de 3.378 pasos, tasa constante y decaimiento lineal en los ultimos 5.370 pasos hasta 1/100, weight decay 0,1, desviacion tipica de inicializacion 0,0078 y precision bf16. La perdida de validacion final (por token, 2.433 documentos reservados) es de 2,886 sobre texto de asistente, 3,518 sobre texto de usuario, 2,308 sobre texto de documento y 2,309 ponderando por la proporcion de entrenamiento de esta condicion.

## Capacidades

- Generacion de texto autoregresiva en ingles sobre texto plano (condicion raw, sin formato conversacional).
- Modelado de lenguaje base: continuacion de documentos, perplexidad y evaluacion de flujos de datos.
- No soporta tool calling ni function calling: es un modelo base sin ajuste.
- No soporta razonamiento multi-paso guiado ni modo "thinking".
- No dispone de vision, audio ni otras modalidades.
- Multilingue limitado: solo ingles.
- Plantilla de chat incluida (ChatML sin turno de sistema), pero el modelo no fue entrenado para seguir instrucciones; la plantilla solo formatea la entrada.
- Util como punto de partida para ajuste supervisado (SFT) o experimentos de alineamiento.

## Casos de uso

- Investigacion sobre dinamicas de preentrenamiento: comparar este checkpoint con las otras condiciones y semillas de la misma escalera para aislar el efecto de los datos y de la inicializacion sobre la perdida de validacion.
- Estudios de escalado controlado: usar los cuatro tamanos de la ladder v2 para trazar curvas de escalado con flujo de datos identico y medir la evolucion de la perdida por token.
- Evaluacion de corpus y tokenizadores: calcular perplexidad sobre dominios concretos (cientifico, educativo, web) para caracterizar la calidad de DCLM-edu con el vocabulario de SmolLM2.
- Base para ajuste supervisado: partir de estos pesos y aplicar SFT con ChatML para obtener un asistente conversacional de 2,81B, comparando contra el punto de partida.
- Experimentos de alineamiento y seguridad: medir sesgos y tasas de toxicidad de un modelo base sin RLHF como linea base frente a variantes ajustadas.
- Generacion de texto en ingles con requisitos de contexto corto: completar parrafos, resumir fragmentos o redactar borradores dentro de los 4.096 tokens, con la advertencia de que no sigue instrucciones.
- Reproducibilidad de artefactos de investigacion: verificar la conversion de pesos Megatron a Hugging Face recalculando las perdidas de validacion publicadas (diferencia absoluta de 0,0173 y 0,0018 en los conjuntos de validacion).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible. La model card solo reporta perdidas de validacion:

| Conjunto | Perdida HF | Referencia Megatron | Diferencia absoluta |
|---|---|---|---|
| val50m segments [3] | 2,9031 | 2,8858 | 0,0173 |
| raw_val50m segments [8] | 2,3094 | 2,3077 | 0,0018 |

Perdida de validacion final por token (2.433 documentos reservados):

| Texto de asistente | Texto de usuario | Texto de documento | Tokens de entrenamiento de la condicion |
|---|---|---|---|
| 2,886 | 3,518 | 2,308 | 2,309 (`raw_doc_eod(8+5)`) |

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: aproximadamente 5,6 GB solo para pesos, mas overhead de activaciones y cache KV; en la practica, entre 7 y 9 GB con contexto completo de 4.096 tokens.
- En cuantizacion de 8 bits: en torno a 3 GB de pesos; en 4 bits: en torno a 1,5-2 GB (aunque el autor no publica variantes cuantizadas).
- GPU recomendadas: A100 (40/80 GB), H100, L40S o RTX 4090 para servir en bf16; tambien cabe en GPUs consumer de 12-16 GB (RTX 3060 12 GB, RTX 4070 Ti, RTX 4080) con cuantizacion.
- Cabe en GPU consumer: si, en modelos con 12 GB o mas en bf16 y en GPUs de 8 GB con cuantizacion.
- Opciones de despliegue: transformers (libreria nativa del checkpoint), text-generation-inference (el repo esta marcado como compatible con endpoints), vLLM, llama.cpp y Ollama (requieren conversion previa a GGUF, no incluida en el repo).
- Latencia y throughput: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| 1pp-2.81b-v2-raw-base | 2,81B | 4.096 | Apache 2.0 | Hugging Face | Modelo base de investigacion, solo ingles |
| SmolLM2-1.7B | 1,7B | 8.192 (segun variante) | Apache 2.0 | Hugging Face | Base e instruct, vocabulario compartido; datos y benchmarks publicados |
| Llama 3.2 1B | 1,24B | 128K | Llama 3.2 Community License | Hugging Face | Base e instruct, multilingue, con benchmarks publicados |
| Qwen2.5-3B | 3,09B | 32.768 | Apache 2.0 | Hugging Face | Base e instruct, multilingue y con soporte de tool calling en la variante instruct |

La comparacion con estos modelos es aproximada: el checkpoint de 1PP no publica benchmarks estandar y su contexto es notablemente menor. Su ventaja es el control experimental (condiciones y semillas replicadas) y la licencia permisiva; su desventaja es la ausencia de ajuste por instrucciones y de evaluaciones comparables.

## Limitaciones y advertencias

- Modelo base sin ajuste por instrucciones: no sigue ordenes, no mantiene conversaciones de forma fiable y no admite plantillas con turno de sistema.
- Riesgo elevado de alucinacion y de texto incoherente en generaciones largas, propio de un modelo base de 2,81B.
- Solo ingles; el rendimiento en castellano u otros idiomas no esta evaluado y previsiblemente sera pobre.
- Contexto limitado a 4.096 tokens, insuficiente para documentos largos o conversaciones extensas.
- Sesgos de DCLM-edu: el corpus web filtrado puede contener estereotipos, toxicidad y desinformacion; no se documenta ningun proceso de mitigacion.
- No es un asistente de proposito general segun el propio autor; no debe desplegarse en produccion orientada a usuarios sin ajuste y evaluacion adicionales.
- Licencia Apache 2.0: permite uso comercial, pero no hay garantias ni soporte del autor.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta; no hay comunidad ni issues que documenten fallos.
- La fecha de creacion del repositorio (2026-11-06) es posterior a la de esta ficha; conviene verificar si el autor publica actualizaciones o correcciones.

## Enlaces

- Hugging Face: https://huggingface.co/Raghav-Singhal/1pp-2.81b-v2-raw-base
- Coleccion 1PP: https://huggingface.co/collections/Raghav-Singhal/1pp-6a999df54bfcf9335355a649
- Registros de entrenamiento (wandb): https://wandb.ai/raghav_singhal/1pp-training
- Registros de SFT (wandb): https://wandb.ai/raghav_singhal/1pp-sft
