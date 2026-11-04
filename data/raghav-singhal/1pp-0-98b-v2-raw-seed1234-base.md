# Raghav-Singhal/1pp-0.98b-v2-raw-seed1234-base

## Resumen

1pp-0.98b-v2-raw-seed1234-base es un modelo de lenguaje de 981.545.472 parámetros desarrollado por Raghav-Singhal (EPFL DLAB) como parte del proyecto One Persona Pretraining (1PP). No es un asistente de propósito general, sino un artefacto de investigación diseñado para estudiar cómo la composición del corpus de preentrenamiento afecta al comportamiento del modelo. Este checkpoint concreto corresponde a la condición "raw" (documentos originales sin transformar) con semilla 1234 dentro de una escalera de escalado (ladder v2) que abarca cuatro tamaños (0,58B, 0,98B, 1,66B y 2,81B), tres condiciones y tres semillas.

La arquitectura es un decoder estilo Llama de 24 capas, dimensión oculta 1.536, FFN de 6.144 con activación SwiGLU, 12 cabezas de atención y 4 cabezas KV (head dim 128), RMSNorm, RoPE con base 10.000, embeddings no atados y sin sesgos ni QK-norm. La longitud de secuencia es de 4.096 tokens y el tokenizador es el vocabulario de SmolLM2 (49.152 entradas) más un token `<|pad|>`; `<|endoftext|>` actúa como token de fin de documento.

Su relevancia es metodológica: cada tamaño se entrena desde cero durante 20,3 tokens de asistente por parámetro sobre un flujo de datos alineado por pasos, de modo que las condiciones solo difieren en el texto del documento y la máscara de pérdida, y las semillas solo en la inicialización de parámetros. Esto permite comparaciones controladas de escalado y de datos que no suelen estar disponibles en modelos publicados convencionales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder estilo Llama (24 capas, hidden 1.536, FFN 6.144 SwiGLU, 12 cabezas / 4 KV, head dim 128, RMSNorm, RoPE base 10.000, embeddings no atados, sin sesgos, sin QK-norm) |
| Parametros totales | 981.545.472 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 4.096 tokens (longitud de secuencia de entrenamiento) |
| Tipos de cuantizacion | no disponible (el autor no publica variantes cuantizadas; al ser safetensors en bf16 es convertible a GGUF/AWQ mediante herramientas externas) |
| Idiomas soportados | inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería transformers; repositorio de 2,0 GB) |

## Arquitectura y entrenamiento

El modelo es un decoder transformer denso de 24 capas con atención multi-cabeza agrupada (12 cabezas de consulta y 4 de clave/valor, dimensión de cabeza 128), FFN SwiGLU de 6.144 unidades, RMSNorm y RoPE con base 10.000. Los embeddings de entrada y salida no están atados y no hay sesgos ni normalización QK. El tokenizador parte del vocabulario de SmolLM2 (49.152 tokens) al que se añade `<|pad|>`; `<|endoftext|>` marca el final de documento.

El preentrenamiento usa los documentos originales de DCLM-edu con pérdida sobre todos los tokens del documento y sobre `<|endoftext|>`. Se cubren los primeros 18.779 pasos del flujo alineado por pasos del proyecto 1PP (39,38B posiciones de token), que coinciden con los primeros pasos de la pasada de 31.777 pasos del estudio principal en el mismo orden. El batch global es de 512 secuencias × 4.096 tokens con enmascaramiento de atención entre documentos. El optimizador es Muon (shape scaling, LR matricial 0,005) combinado con Adam para el resto de parámetros (LR 2,3e-3 para embeddings y capa de salida, 3e-3 para normas), con 1.181 pasos de warmup, fase constante y decaimiento lineal en los últimos 1.877 pasos hasta 1/100, weight decay 0,1, desviación estándar de inicialización 0,0103 y precisión bf16. La pérdida de validación del checkpoint final sobre 2.433 documentos retenidos es de 2,638 en texto de asistente, 2,661 en texto de usuario y 2,497 en texto de documento.

## Capacidades

- Generación de texto autoregresiva en inglés con formato conversacional ChatML cuando se usa la plantilla incluida.
- Continuación y modelado de documentos: al ser un modelo base, su función principal es predecir el siguiente token sobre texto plano o sobre transcripciones de conversación.
- Formato de chat ChatML sin turno de sistema: `<|im_start|>user\n{message}<|im_end|>\n<|im_start|>assistant\n{reply}<|im_end|>\n`; la generación se detiene en `<|im_end|>` (id 2) o `<|endoftext|>` (id 0), ambos declarados en `eos_token_id`.
- No incluye modo de razonamiento explícito, tool calling, function calling, visión, audio ni capacidades de agente; la model card no documenta ninguna de ellas.
- Multilingüismo limitado al inglés según la etiqueta de idioma del repositorio.
- Utilidad como línea base de investigación: permite medir el efecto de la condición de datos y de la semilla sobre la pérdida de validación en cuatro escalas de tamaño.

## Casos de uso

- Investigación sobre escalado de modelos: el checkpoint es una pieza de la escalera 0,58B / 0,98B / 1,66B / 2,81B y permite trazar curvas de pérdida frente a parámetros con datos y pasos alineados, algo poco habitual en modelos publicados.
- Estudios de ablación de corpus: al compartir flujo de datos y presupuesto de tokens con las demás condiciones del proyecto, sirve para aislar el efecto del texto del documento y de la máscara de pérdida sobre el comportamiento final.
- Análisis de variabilidad por semilla: la semilla 1234 es una de las tres (28, 42, 1234) con idéntico orden de batches, lo que permite estimar la varianza de inicialización en métricas de validación.
- Réplica de experimentos de preentrenamiento: los logs de wandb (`1pp-training`, `1pp-sft`) y las pérdidas de referencia de Megatron permiten verificar reproducciones con una tolerancia de aproximadamente 0,0016 en pérdida absoluta.
- Generación de texto en inglés para prototipos de bajo coste: con 0,98B parámetros y contexto de 4.096 tokens, es viable en una GPU de consumo para tareas de continuación de texto y pruebas de formato ChatML.
- Fine-tuning controlado como línea base: al ser un modelo base con licencia Apache 2.0, se puede ajustar con SFT o DPO para comparar contra las condiciones conversacionales del mismo proyecto.
- Evaluación de formatos de conversación: la plantilla ChatML sin turno de sistema permite estudiar cómo responde un modelo base expuesto a transcripciones conversacionales frente a texto plano.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K u otros) en la información disponible. El autor solo reporta pérdidas de validación y una verificación de los pesos de HuggingFace frente al checkpoint de Megatron:

| Conjunto | Pérdida HF | Referencia Megatron | Diferencia absoluta |
|---|---|---|---|
| val50m segments [3] | 2,6369 | 2,6385 | 0,0016 |
| raw_val50m segments [8] | 2,4986 | 2,4971 | 0,0015 |

Pérdida de validación por token sobre 2.433 documentos retenidos (checkpoint final):

| Texto de asistente | Texto de usuario | Texto de documento | Tokens de entrenamiento de esta condición |
|---|---|---|---|
| 2,638 | 2,661 | 2,497 | 2,498 (`raw_doc_eod(8+5)`) |

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: aproximadamente 2 GB solo para pesos (981,5M parámetros × 2 bytes), más caché KV y activaciones; en la práctica, entre 3 y 4 GB con contexto de 4.096 tokens.
- VRAM estimada en cuantización de 8 bits: alrededor de 1 GB para pesos; en 4 bits, alrededor de 0,5 GB, aunque el autor no publica variantes cuantizadas.
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM es suficiente; RTX 3060, RTX 4060, RTX 4090, A100 y H100 pueden ejecutarlo con holgura. Cabe en GPU de consumo.
- Opciones de despliegue: transformers (librería declarada), text-generation-inference (etiqueta `text-generation-inference` y `endpoints_compatible` en el repositorio); vLLM, llama.cpp u Ollama requerirían conversión de los pesos a los formatos correspondientes, no publicada por el autor.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Enfoque | Disponibilidad |
|---|---|---|---|---|---|
| 1pp-0.98b-v2-raw-seed1234-base | 981,5M | 4.096 | Apache 2.0 | Modelo base de investigación (preentrenamiento controlado) | HuggingFace, transformers |
| SmolLM2 (familia, referencia por tokenizador) | no disponible en la información | no disponible | no disponible | Modelo base/instruido de propósito general | HuggingFace |
| Resto de la escalera 1PP (0,58B, 1,66B, 2,81B) | 0,58B / 1,66B / 2,81B | 4.096 (según la arquitectura descrita para la escalera) | Apache 2.0 | Mismo diseño experimental, distinto tamaño | Colección 1pp en HuggingFace |

No se dispone de datos de benchmarks que permitan una comparación cuantitativa de rendimiento con alternativas de la misma categoría.

## Limitaciones y advertencias

- Es un modelo base, no un asistente: la model card indica explícitamente que es un artefacto de investigación del proyecto 1PP (EPFL DLAB) y no un asistente de propósito general.
- Entrenado únicamente en inglés; no hay evidencia de competencia en otros idiomas.
- Contexto limitado a 4.096 tokens, insuficiente para documentos largos o conversaciones extensas.
- No ha pasado por RLHF ni DPO según la información disponible; no se documentan salvaguardas de alineación, por lo que puede generar contenido inapropiado o sesgado.
- Riesgo de alucinación inherente a un modelo base de 0,98B parámetros sin ajuste instructivo.
- La plantilla de chat no incluye turno de sistema y el modelo nunca vio uno durante el entrenamiento; introducir un mensaje de sistema puede degradar el formato de salida.
- La condición "raw" produce texto plano, no formato conversacional; para diálogo hay que usar las condiciones conversacionales del proyecto.
- Licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantías de calidad ni de idoneidad para producción.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, sin validación externa de la comunidad.
- El tamaño del repositorio (2,0 GB) es coherente con pesos en bf16, pero no se publican pesos cuantizados ni formatos GGUF.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Raghav-Singhal/1pp-0.98b-v2-raw-seed1234-base
- Colección 1pp: https://huggingface.co/collections/Raghav-Singhal/1pp-6a999df54bfcf9335355a649
- Logs de entrenamiento (wandb, 1pp-training): https://wandb.ai/raghav_singhal/1pp-training
- Logs de SFT (wandb, 1pp-sft): https://wandb.ai/raghav_singhal/1pp-sft
