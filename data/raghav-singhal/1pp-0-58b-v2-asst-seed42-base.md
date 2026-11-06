# Raghav-Singhal/1pp-0.58b-v2-asst-seed42-base

## Resumen

1pp-0.58b-v2-asst-seed42-base es un modelo de lenguaje de tipo decoder transformer con 580.445.568 parámetros, desarrollado por Raghav-Singhal en el marco del proyecto One Persona Pretraining (1PP) del EPFL DLAB. No es un asistente de propósito general, sino un artefacto de investigación diseñado para estudiar cómo distintas condiciones de preentrenamiento afectan al comportamiento del modelo a diferentes escalas. Este checkpoint concreto pertenece al "escalón" (rung) de 0,58B de la escalera v2, en la condición de conversaciones reescritas con pérdida calculada únicamente sobre los turnos del asistente y con semilla 42.

La relevancia del modelo es metodológica: forma parte de una matriz experimental de cuatro tamaños (0,58B, 0,98B, 1,66B y 2,81B) por tres condiciones de datos por tres semillas (28, 42 y 1234), donde cada tamaño se entrena desde cero durante 20,3 tokens de asistente por parámetro sobre el mismo flujo de datos alineado por pasos. Las condiciones solo difieren en el texto de los documentos y en la máscara de pérdida, y las semillas solo en la inicialización de parámetros, lo que permite aislar el efecto de cada variable.

Arquitectura Llama-style de 24 capas con atención GQA (9 cabezas de consulta, 3 de clave/valor), contexto de 4.096 tokens y tokenizador basado en el vocabulario de SmolLM2 (49.152 entradas más `<|pad|>`). La licencia es Apache 2.0 y los pesos están en safetensors, con un tamaño de repositorio de 1,2 GB.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder estilo Llama (24 capas, hidden 1.152, FFN 4.608 SwiGLU, GQA 9/3 cabezas, RMSNorm, RoPE base 10.000, sin biases, sin QK-norm) |
| Parametros totales | 580.445.568 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 4.096 tokens |
| Tipos de cuantizacion | no disponible (el autor no publica variantes cuantizadas; al ser safetensors bf16 es convertible a GGUF/AWQ mediante herramientas externas, pero no se documenta oficialmente) |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (transformers) |

## Arquitectura y entrenamiento

El modelo es un decoder transformer denso de estilo Llama con 24 capas, dimensión oculta de 1.152, FFN de 4.608 con activación SwiGLU, 9 cabezas de atención y 3 cabezas KV (head dim 128), normalización RMSNorm, RoPE con base 10.000, embeddings no atados, sin biases y sin QK-norm. El tokenizador usa el vocabulario de SmolLM2 (49.152 tokens) más un token `<|pad|>`, con `<|endoftext|>` como token de fin de documento. La longitud de secuencia de entrenamiento es de 4.096 tokens.

El preentrenamiento se realizó sobre conversaciones reescritas a partir de documentos, con la pérdida calculada exclusivamente sobre los turnos del asistente. Se entrenaron los primeros 11.106 pasos del flujo alineado por pasos de 1PP (23,29B posiciones de token), que corresponden a los primeros pasos del pase principal de 31.777 pasos del estudio. El batch global fue de 512 secuencias × 4.096 tokens, con enmascaramiento de atención entre documentos. El optimizador es Muon (shape scaling, LR matricial 0,005) combinado con Adam para el resto de parámetros (LR 3e-3 para embeddings y capa de salida, 3e-3 para normas), con 699 pasos de warmup, LR constante y decaimiento lineal en los últimos 1.110 pasos hasta 1/100, weight decay 0,1, desviación estándar de inicialización 0,0119 y precisión bf16.

La pérdida de validación del checkpoint final sobre 2.433 documentos retenidos es de 1,677 por token en texto de asistente, 5,585 en texto de usuario, 3,500 en texto de documento y 1,733 en los tokens de entrenamiento de esta condición (`reweighted_seg34`, que pondera las conversaciones adversariales según su cuota de entrenamiento del 11,18%). Los pesos de Hugging Face se verificaron contra el checkpoint de Megatron recalculando pérdidas de validación, con diferencias absolutas de 0,0015 y 0,0018 en los conjuntos val50m y raw_val50m respectivamente.

## Capacidades

- Generación de texto autoregresiva en inglés, con formato de conversación ChatML (sin turno de sistema, ya que los modelos nunca vieron uno).
- Producción de texto con formato de chat en las condiciones de conversación; la línea base cruda genera texto plano.
- Parada de generación en `<|im_end|>` (id 2) o `<|endoftext|>` (id 0), ambos listados en `eos_token_id`.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- No se documenta capacidad multilingüe más allá del inglés.
- No se documentan capacidades especiales como modo de razonamiento explícito, visión o audio.
- Al ser un modelo base, no ha pasado por un proceso de alineación orientado a asistente; su comportamiento conversacional deriva de la condición de datos de preentrenamiento, no de un SFT posterior.

## Casos de uso

- Investigación sobre escalado de preentrenamiento: el modelo sirve como punto de datos en la escalera de cuatro tamaños × tres condiciones × tres semillas, permitiendo aislar el efecto del tamaño, la condición de datos y la semilla sobre la pérdida de validación y el comportamiento generativo.
- Estudio de enmascaramiento de pérdida: al comparar esta condición (pérdida solo en turnos de asistente) con las otras condiciones de la misma escalera, se puede medir el impacto del enmascaramiento en la calidad del texto generado en formato conversacional.
- Análisis de reproducibilidad: con semillas 28, 42 y 1234 sobre la misma inicialización de datos, el checkpoint permite estudiar la varianza entre semillas en métricas de validación y en la generación.
- Reproducción de referencias de validación: los pesos permiten recalcular las pérdidas publicadas (1,677 en texto de asistente, 3,500 en texto de documento) y verificar la conversión desde el checkpoint de Megatron.
- Experimentos de formato de chat: al usar ChatML sin turno de sistema, es útil para estudiar cómo el formato de plantilla afecta a la generación en modelos base entrenados con datos conversacionales.
- Base para experimentos controlados de ajuste fino: al ser un modelo pequeño (0,58B) con licencia Apache 2.0 y contexto de 4.096 tokens, se puede usar como línea base en estudios comparativos de SFT o DPO donde el coste computacional de entrenar desde cero sea prohibitivo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor solo reporta pérdidas de validación por token:

| Métrica | Valor |
|---|---|
| Pérdida de validación en texto de asistente | 1,677 |
| Pérdida de validación en texto de usuario | 5,585 |
| Pérdida de validación en texto de documento | 3,500 |
| Pérdida en tokens de entrenamiento de la condición (`reweighted_seg34`) | 1,733 |
| Diferencia absoluta HF vs Megatron (val50m segmentos [3]) | 0,0015 |
| Diferencia absoluta HF vs Megatron (raw_val50m segmentos [8]) | 0,0018 |

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: aproximadamente 1,2 GB solo para pesos, más overhead de activaciones y caché KV; en la práctica, entre 2 y 3 GB para secuencias de 4.096 tokens.
- VRAM estimada en cuantización de 8 bits: alrededor de 0,6 GB de pesos; en 4 bits, alrededor de 0,3 GB. No se publican cuantizaciones oficiales, por lo que estos valores son estimaciones a partir del número de parámetros.
- GPU recomendadas: cualquier GPU consumer con al menos 4 GB de VRAM es suficiente para bf16; una RTX 3060, RTX 4060, RTX 4090 o superiores pueden ejecutarlo con holgura. En entornos de servidor, A100 o H100 no son necesarias para inferencia, pero sí útiles para entrenamiento o evaluación por lotes.
- Cabe en GPU consumer: sí, en la práctica totalidad de GPU consumer modernas con 4 GB o más de VRAM.
- Opciones de despliegue: transformers (librería nativa), text-generation-inference (etiqueta `text-generation-inference` en el repo) y endpoints compatibles. No se documenta soporte oficial de llama.cpp, Ollama o vLLM, aunque al ser un modelo Llama-style en safetensors es convertible a GGUF con herramientas externas.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Idiomas | Notas |
|---|---|---|---|---|---|
| 1pp-0.58b-v2-asst-seed42-base | 580.445.568 | 4.096 | Apache 2.0 | en | Modelo base de investigación, condición de conversaciones con pérdida en turnos de asistente |
| SmolLM2 (tamaño comparable) | no disponible en la información | no disponible | no disponible | no disponible | Comparte vocabulario (49.152 tokens) con este modelo, pero no se dispone de sus especificaciones en la información proporcionada |
| Otros escalones de la escalera 1PP (0,98B, 1,66B, 2,81B) | 0,98B / 1,66B / 2,81B | 4.096 (según la arquitectura descrita para la escalera) | Apache 2.0 | en | Misma metodología y flujo de datos; el escalón de 1,66B corresponde al conjunto de modelos de 1,7B del estudio principal (`1pp-1.7b-*`) |

No se dispone de datos de benchmarks ni de especificaciones detalladas de modelos alternativos en la información proporcionada, por lo que la comparación cuantitativa de rendimiento no está disponible.

## Limitaciones y advertencias

- El propio autor indica que es un artefacto de investigación del proyecto 1PP (EPFL DLAB) y no un asistente de propósito general; no debe usarse como tal en producción.
- El modelo solo soporta inglés; no se documenta capacidad multilingüe.
- La ventana de contexto es de 4.096 tokens, adecuada para experimentos pero limitada para aplicaciones con documentos largos.
- No ha pasado por un proceso de alineación orientado a asistente (RLHF/DPO) según la información disponible; el formato conversacional proviene de la condición de datos de preentrenamiento.
- No se documenta soporte de tool calling, agentes ni razonamiento multi-paso, por lo que no es adecuado para pipelines de agentes.
- El formato de chat es ChatML sin turno de sistema; introducir un turno de sistema puede producir comportamiento fuera de distribución, ya que los modelos nunca vieron uno.
- No se publican cuantizaciones oficiales ni resultados de benchmarks estándar (MMLU, HumanEval, GSM8K), lo que dificulta evaluar su calidad frente a alternativas.
- Riesgo de alucinación y sesgos: no se documentan análisis específicos en la información proporcionada; al ser un modelo base entrenado sobre conversaciones reescritas, puede reproducir sesgos presentes en esos datos.
- La licencia Apache 2.0 permite uso comercial, pero el autor desaconseja explícitamente su uso como asistente general; cualquier uso en producción debería ir precedido de una evaluación propia.
- El checkpoint tiene 0 descargas y 0 likes en el momento de la consulta, lo que refleja su carácter de artefacto de investigación reciente y sin validación comunitaria.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Raghav-Singhal/1pp-0.58b-v2-asst-seed42-base
- Colección 1PP: https://huggingface.co/collections/Raghav-Singhal/1pp-6a999df54bfcf9335355a649
- Registros de entrenamiento (wandb, proyecto 1pp-training): https://wandb.ai/raghav_singhal/1pp-training
- Registros de SFT (wandb, proyecto 1pp-sft): https://wandb.ai/raghav_singhal/1pp-sft
