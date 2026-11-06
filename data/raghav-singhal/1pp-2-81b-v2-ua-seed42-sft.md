# Raghav-Singhal/1pp-2.81b-v2-ua-seed42-sft

## Resumen

El modelo `1pp-2.81b-v2-ua-seed42-sft` es un artefacto de investigación del proyecto One Persona Pretraining (1PP), desarrollado por Raghav-Singhal en el contexto de EPFL DLAB. Se trata de un modelo de lenguaje de 2.807.699.328 parámetros (2,81B) con arquitectura decoder estilo Llama, entrenado desde cero como parte de una escalera de escalado (ladder v2) que abarca cuatro tamaños (0,58B, 0,98B, 1,66B y 2,81B), tres condiciones de entrenamiento y tres semillas (28, 42, 1234). Esta ficha corresponde concretamente a la condición "ua" (user+assistant loss sobre conversaciones reescritas), semilla 42, tras un proceso de supervised fine-tuning (SFT).

El modelo no está diseñado como asistente de propósito general, sino como un instrumento experimental para estudiar cómo afectan las condiciones de preentrenamiento (texto de los documentos y máscara de pérdida) y la inicialización de parámetros al comportamiento final del modelo. Todos los peldaños de la escalera se entrenan sobre el mismo flujo de datos alineado por pasos, con 20,3 tokens de asistente por parámetro, lo que permite comparaciones controladas entre tamaños, condiciones y semillas.

Con 24 capas, dimensión oculta de 2.688, FFN de 10.752 con SwiGLU y una longitud de secuencia de 4.096 tokens, el modelo emplea el vocabulario de SmolLM2 (49.152 tokens) más un token `<|pad|>`. Su relevancia actual es metodológica: ofrece un punto de comparación reproducible dentro de un estudio sobre preentrenamiento condicionado por persona, con pesos verificados contra el checkpoint original de Megatron y registros de entrenamiento públicos en Weights & Biases.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Decoder estilo Llama (transformer denso) |
| Parametros totales | 2.807.699.328 (2,81B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 4.096 tokens (longitud de secuencia de entrenamiento) |
| Tipos de cuantizacion | No disponible (solo se publican pesos safetensors en bf16) |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería transformers) |

## Arquitectura y entrenamiento

La arquitectura es un decoder transformer denso de estilo Llama con 24 capas, hidden size de 2.688, FFN de 10.752 con activación SwiGLU, 21 cabezas de atención y 7 cabezas KV (head dim 128), normalización RMSNorm, RoPE con base 10.000, embeddings no atados (untied), sin biases y sin QK-norm. La longitud de secuencia es de 4.096 tokens. El tokenizador usa el vocabulario de SmolLM2 (49.152 tokens) más `<|pad|>`, con `<|endoftext|>` como token de fin de documento.

El preentrenamiento se realizó sobre las conversaciones 1PP reescritas a partir de los documentos originales, con pérdida calculada tanto en turnos de usuario como de asistente (condición "ua"). Se entrenaron los primeros 53.709 pasos del flujo alineado por pasos de 1PP (112,64B posiciones de token), que corresponden a los primeros pasos del pase de 31.777 pasos del estudio principal en el mismo orden. El batch global fue de 512 × 4.096 tokens con enmascaramiento de atención entre documentos. El optimizador es Muon (shape scaling, LR matricial 0,005) combinado con Adam para el resto de parámetros (LR 1,29e-3 para embeddings y capa de salida, 3e-3 para normas), con warmup de 3.378 pasos, fase constante y decaimiento lineal en los últimos 5.370 pasos hasta 1/100, weight decay 0,1, std de inicialización 0,0078 y precisión bf16.

El SFT consistió en una época sobre una mezcla de 400k conversaciones: `jkminder/model-raising-pb-100k-3c-mt-sft` (98,5k multi-turno, pista con citas de constitución), `dlab-spp/sp-sft-normal-300k` sin los prompts duplicados del primer conjunto (271,6k) y una muestra de 30k de `dlab-spp/sp-sft-safety-180k`. Se usó el mismo stack (Megatron, Muon, ChatML sin turno de sistema, pérdida solo en turnos de asistente), LR matricial 0,001, semilla 28, batch global 128 × 4.096 y decaimiento lineal a 1/10 tras un warmup del 3%. La pérdida de validación final en preentrenamiento fue de 1,351 en texto de asistente, 1,270 en texto de usuario y 2,987 en texto de documento (con 1,350 en la columna ponderada de tokens de entrenamiento de esta condición). La pérdida SFT retenida en tokens de asistente (1.998 conversaciones) fue de 1,734, y los pesos de Hugging Face se verificaron contra el checkpoint de Megatron con una diferencia absoluta de 0,0000.

## Capacidades

- Generación de texto conversacional en inglés, con formato ChatML sin turno de sistema.
- Conversaciones multi-turno, entrenado explícitamente sobre diálogos usuario-asistente.
- Razonamiento y respuesta dentro de un contexto de 4.096 tokens.
- Parada de generación controlada mediante `<|im_end|>` (id 2) y `<|endoftext|>` (id 0), ambos incluidos en `eos_token_id`.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso explícito.
- Capacidades multilingües limitadas al inglés (idioma declarado en la model card).
- No se documentan capacidades de visión, audio ni modo "thinking".

## Casos de uso

- Investigación sobre preentrenamiento condicionado por persona: el modelo sirve como peldaño de 2,81B en la escalera 1PP para comparar el efecto de la condición "user+assistant loss" frente a otras condiciones sobre el mismo flujo de datos, manteniendo constante la semilla y el orden de batches.
- Estudios de escalado controlado: al compartir flujo de datos alineado por pasos con los tamaños 0,58B, 0,98B y 1,66B, permite trazar curvas de pérdida y capacidad en función del número de parámetros con 20,3 tokens de asistente por parámetro.
- Análisis de reproducibilidad: con tres semillas (28, 42, 1234) que solo difieren en la inicialización de parámetros, el modelo facilita medir la varianza atribuible a la inicialización en tareas de generación conversacional.
- Evaluación de SFT sobre modelos pequeños: al partir de un checkpoint de preentrenamiento de 2,81B y aplicar una mezcla SFT documentada de 400k conversaciones, sirve para estudiar la transferencia de instrucciones y seguridad en modelos de escala reducida.
- Generación de diálogo sintético en inglés para experimentos de aumento de datos: su formato ChatML sin turno de sistema y su contexto de 4.096 tokens permiten producir conversaciones multi-turno controladas en pipelines de investigación.
- Línea base para comparativas de alineación: la pérdida SFT retenida de 1,734 y la verificación exacta contra Megatron lo convierten en una referencia reproducible frente a modelos de tamaño similar en estudios de pérdida de validación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card únicamente reporta pérdidas de validación:

| Conjunto | Métrica | Valor |
|---|---|---|
| Preentrenamiento, texto de asistente | Pérdida por token | 1,351 |
| Preentrenamiento, texto de usuario | Pérdida por token | 1,270 |
| Preentrenamiento, texto de documento | Pérdida por token | 2,987 |
| Preentrenamiento, condición ponderada (`reweighted_seg1234`) | Pérdida por token | 1,350 |
| SFT retenido (1.998 conversaciones) | Pérdida en tokens de asistente | 1,734 |
| Verificación HF vs Megatron (sft_val segments [3, 4]) | Diferencia absoluta | 0,0000 |

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: aproximadamente 5,6 GB solo para pesos, más overhead de activaciones y caché KV; en la práctica, entre 7 y 9 GB para contextos moderados.
- VRAM estimada en cuantización de 8 bits: alrededor de 3 GB para pesos; en 4 bits, alrededor de 1,5 GB (no se publican cuantizaciones oficiales).
- GPU recomendadas: A100 (40/80 GB) o H100 para servir con vLLM o TGI y batches grandes; RTX 4090 (24 GB) para inferencia en bf16 con holgura.
- Cabe en GPU de consumo: sí, en RTX 3090/4090 (24 GB) en bf16 y en GPUs de 8-12 GB si se cuantiza a 8 o 4 bits.
- Opciones de despliegue: transformers (librería declarada), text-generation-inference y endpoints compatibles según los tags; llama.cpp/Ollama requerirían conversión a GGUF, no publicada.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| 1pp-2.81b-v2-ua-seed42-sft | 2,81B | 4.096 | Apache 2.0 | Hugging Face (transformers, safetensors) | Artefacto de investigación, solo inglés, sin benchmarks publicados |
| 1pp-1.7b-* (peldaño 1,66B de la misma escalera) | 1,66B | 4.096 | Apache 2.0 | Colección 1pp en Hugging Face | Mismo flujo de datos y condiciones; permite comparación directa de escalado |
| SmolLM2 (familia, mismo vocabulario) | 135M / 360M / 1,7B | No disponible en la información | Apache 2.0 | Hugging Face | Comparte tokenizador (49.152) con el modelo 1PP; no es comparable en condiciones de entrenamiento |
| Llama 3.2 3B (referencia de tamaño) | 3,2B | 128k | Llama 3.2 Community License | Hugging Face | Mayor contexto y licencia más restrictiva; no se dispone de comparación de rendimiento en la información |

No se dispone de datos de benchmarks que permitan una comparación cuantitativa de rendimiento con estos modelos.

## Limitaciones y advertencias

- Artefacto de investigación: la propia model card indica que no es un asistente de propósito general.
- Idiomas: solo se declara inglés; el rendimiento en castellano u otros idiomas no está evaluado.
- Contexto limitado a 4.096 tokens, adecuado para diálogos cortos pero insuficiente para documentos largos o conversaciones extensas.
- No se documentan capacidades de tool calling, agentes ni razonamiento multi-paso, por lo que no es apto para pipelines de agentes en producción.
- Riesgo de alucinación no cuantificado: no se publican evaluaciones de veracidad ni de seguridad más allá de la pérdida SFT y la inclusión de un subconjunto de seguridad en el SFT.
- Sesgos: no se documentan análisis de sesgo; el modelo se entrenó sobre conversaciones derivadas de documentos y sobre mezclas SFT de terceros, cuyos sesgos pueden heredarse.
- Formato de chat sin turno de sistema: no se entrenó con mensajes de sistema, por lo que inyectar uno puede degradar el comportamiento.
- Licencia Apache 2.0 permite uso comercial, pero al ser un artefacto experimental sin benchmarks ni garantías de calidad, no se recomienda su despliegue en producción.
- Solo se publican pesos en safetensors; no hay cuantizaciones oficiales GGUF ni versiones optimizadas para llama.cpp u Ollama.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Raghav-Singhal/1pp-2.81b-v2-ua-seed42-sft
- Colección 1pp: https://huggingface.co/collections/Raghav-Singhal/1pp-6a999df54bfcf9335355a649
- Registros de entrenamiento (preentrenamiento): https://wandb.ai/raghav_singhal/1pp-training
- Registros de entrenamiento (SFT): https://wandb.ai/raghav_singhal/1pp-sft
- Dataset SFT multi-turno: https://huggingface.co/jkminder/model-raising-pb-100k-3c-mt-sft
- Dataset SFT normal: https://huggingface.co/dlab-spp/sp-sft-normal-300k
- Dataset SFT de seguridad: https://huggingface.co/dlab-spp/sp-sft-safety-180k
