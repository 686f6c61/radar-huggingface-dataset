# Raghav-Singhal/1pp-0.58b-v2-raw-seed1234-base

## Resumen

1pp-0.58b-v2-raw-seed1234-base es un modelo de lenguaje de 580.445.568 parámetros desarrollado por Raghav-Singhal en el marco del proyecto One Persona Pretraining (1PP), vinculado al laboratorio DLAB de la EPFL. No es un asistente de propósito general, sino un artefacto de investigación diseñado para estudiar cómo la composición de los datos de preentrenamiento afecta al comportamiento del modelo. En concreto, forma parte de una escalera de escalado (ladder v2) que compara distintas condiciones de datos manteniendo constante todo lo demás.

La arquitectura es un decoder estilo Llama con 24 capas, dimensión oculta de 1.152, FFN de 4.608 con activación SwiGLU, 9 cabezas de atención y 3 cabezas KV (dimensión de cabeza 128), RMSNorm, RoPE con base 10.000, embeddings no atados y una longitud de secuencia de 4.096 tokens. El tokenizador reutiliza el vocabulario de SmolLM2 (49.152 entradas) más un token `<|pad|>`.

La relevancia de esta ficha radica en su valor metodológico: el modelo se entrena desde cero sobre un flujo de datos alineado por pasos, con 20,3 tokens de asistente por parámetro, y se publica junto a otras tres tallas (0,98B, 1,66B y 2,81B), tres condiciones de datos y tres semillas (28, 42 y 1234). Esta variante concreta corresponde a la condición "documentos originales" (raw) y a la semilla 1234, lo que la convierte en la línea base de texto plano frente a las condiciones conversacionales del estudio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder estilo Llama (24 capas, hidden 1.152, FFN 4.608 SwiGLU, 9 cabezas de atención / 3 KV, head dim 128, RMSNorm, RoPE base 10.000, embeddings no atados, sin biases, sin QK-norm) |
| Parametros totales | 580.445.568 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 4.096 tokens (longitud de secuencia de entrenamiento) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería transformers) |

## Arquitectura y entrenamiento

El modelo sigue una arquitectura transformer decoder densa de estilo Llama, sin mezcla de expertos ni mecanismos híbridos. Destacan las 24 capas con dimensión oculta de 1.152 y FFN de 4.608 con SwiGLU, 9 cabezas de atención con 3 cabezas KV (atención agrupada, head dim 128), normalización RMSNorm, RoPE con base 10.000, embeddings de entrada y salida no atados y ausencia de biases y de QK-norm. La longitud de secuencia es de 4.096 tokens y el tokenizador es el de SmolLM2 (49.152 tokens) más `<|pad|>`, usando `<|endoftext|>` como token de fin de documento.

El preentrenamiento se realizó sobre los documentos originales de DCLM-edu, con pérdida calculada sobre todos los tokens del documento y sobre `<|endoftext|>`. Esta variante cubre los primeros 11.106 pasos del flujo alineado por pasos del proyecto 1PP (23,29B posiciones de token), que coinciden con los primeros pasos del recorrido principal de 31.777 pasos en el mismo orden. El batch global es de 512 secuencias × 4.096 tokens con enmascaramiento de atención entre documentos. El optimizador es Muon (escalado por forma, LR matricial 0,005) combinado con Adam para el resto de parámetros (LR 3e-3 para embeddings y capa de salida, 3e-3 para normas), con 699 pasos de warmup, fase constante y decaimiento lineal en los últimos 1.110 pasos hasta 1/100, weight decay 0,1, desviación estándar de inicialización 0,0119 y precisión bf16. La pérdida de validación final sobre 2.433 documentos retenidos es de 2,801 para texto de asistente, 2,802 para texto de usuario y 2,615 para texto de documento, con 2,616 en la columna ponderada de tokens de entrenamiento de esta condición (`raw_doc_eod(8+5)`).

## Capacidades

- Generación de texto autoregresiva en inglés, con formato de texto plano propio de un modelo base (no conversacional).
- Continuación de documentos y modelado de lenguaje general sobre texto educativo (DCLM-edu).
- Formato de chat ChatML sin turno de sistema: `<|im_start|>user\n{message}<|im_end|>\n<|im_start|>assistant\n{reply}<|im_end|>\n`, renderizado por la plantilla `chat_template` incluida.
- Parada de generación en `<|im_end|>` (id 2) y `<|endoftext|>` (id 0), ambos listados en `eos_token_id`.
- No soporta tool calling ni function calling de forma nativa (no se documenta en la model card).
- No soporta razonamiento multi-paso guiado por agentes ni modo "thinking" (no se documenta).
- Sin capacidades de visión, audio ni multimodalidad.
- Multilingüismo limitado al inglés; no se declaran otros idiomas.
- Al ser la condición raw, produce texto plano; las condiciones conversacionales del mismo estudio generan texto con formato de chat.

## Casos de uso

- Investigación sobre composición de datos de preentrenamiento: sirve como línea base de texto plano para comparar, con la misma arquitectura, inicialización y flujo de datos, el efecto de condiciones conversacionales frente a documentos originales en la escalera 1PP.
- Estudios de escalado controlado: al compartir flujo de datos alineado por pasos con las tallas 0,98B, 1,66B y 2,81B, permite aislar el efecto del tamaño del modelo manteniendo constante el número de tokens por parámetro (20,3).
- Análisis de varianza por semilla: junto con las semillas 28 y 42, permite estimar la variabilidad de las métricas de validación atribuible únicamente a la inicialización de parámetros.
- Reproducción de experimentos de preentrenamiento: los logs de entrenamiento en wandb (proyectos `1pp-training` y `1pp-sft`) y la verificación de pesos frente al checkpoint de Megatron facilitan la replicación de los resultados.
- Evaluación de pérdida de validación en corpus educativos: con 2.433 documentos retenidos y métricas separadas por tipo de texto (asistente, usuario, documento), es útil para estudiar la calibración del modelo en distintos registros.
- Prototipado de generación de texto en inglés con requisitos de licencia permisiva: al ser Apache 2.0 y pesar 1,2 GB en safetensors, puede desplegarse en entornos de investigación con recursos limitados para tareas de continuación de texto.
- Docencia y formación en técnicas de preentrenamiento: el modelo documenta con detalle hiperparámetros (Muon + Adam, warmup, decaimiento, weight decay, init std), lo que lo hace útil como ejemplo didáctico de una receta de entrenamiento reproducible.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card únicamente reporta pérdidas de validación por token sobre 2.433 documentos retenidos:

| Conjunto | Pérdida |
|---|---|
| Texto de asistente | 2,801 |
| Texto de usuario | 2,802 |
| Texto de documento | 2,615 |
| Tokens de entrenamiento de esta condición (`raw_doc_eod(8+5)`) | 2,616 |

Verificación de los pesos de HuggingFace frente al checkpoint de Megatron:

| Conjunto | Pérdida HF | Referencia Megatron | Diferencia absoluta |
|---|---|---|---|
| Segmentos val50m [3] | 2,7994 | 2,8010 | 0,0016 |
| Segmentos raw_val50m [8] | 2,6166 | 2,6147 | 0,0019 |

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1,2 GB en bf16/fp16 para los pesos (580M parámetros), más el espacio de activaciones y caché KV para 4.096 tokens de contexto; en la práctica, menos de 3 GB en fp16 y del orden de 1 GB o menos con cuantización de 8 bits o inferior.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM para fp16; tarjetas de gama media como RTX 3060, RTX 4060, RTX 4090, A100 o H100 son sobradamente suficientes.
- Cabe en GPU de consumo: sí, en cualquier GPU consumer moderna con 4 GB o más de VRAM (GTX 1650 4 GB en adelante, con margen amplio en RTX 3060 12 GB o superiores).
- Opciones de despliegue: transformers (librería declarada), text-generation-inference (tag `text-generation-inference`), endpoints compatibles (tag `endpoints_compatible`); al ser un modelo pequeño, también es viable convertirlo a GGUF para llama.cpp u Ollama, aunque no se documenta oficialmente.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| 1pp-0.58b-v2-raw-seed1234-base | 580M | 4.096 | Apache 2.0 | HuggingFace | Modelo base de investigación, solo inglés, condición raw |
| SmolLM2-360M (referencia de tokenizador) | 360M | 8.192 (según versión) | Apache 2.0 | HuggingFace | Alternativa de tamaño similar; comparte vocabulario |
| Qwen2.5-0.5B | 494M | 32.768 | Apache 2.0 | HuggingFace | Modelo base multilingüe con contexto mucho mayor |
| Llama 3.2 1B | 1.240M | 131.072 | Licencia comunitaria Llama | HuggingFace | Mayor tamaño y contexto; licencia más restrictiva |

Los datos de SmolLM2, Qwen2.5 y Llama 3.2 provienen de conocimiento general y no de la información proporcionada en esta ficha; verificar antes de usarlos en una comparación formal. No se dispone de benchmarks comparativos publicados para el modelo 1PP en la información disponible.

## Limitaciones y advertencias

- Es un modelo base, no un asistente: no está alineado con instrucciones ni con preferencias humanas, y no debe usarse como chatbot de producción sin un ajuste posterior.
- El autor lo describe explícitamente como artefacto de investigación del proyecto 1PP (EPFL DLAB) y no como asistente de propósito general.
- Sesgos conocidos: no documentados en la información disponible; al entrenarse sobre DCLM-edu, hereda los sesgos del corpus educativo filtrado.
- Riesgo de alucinación: alto en tareas de respuesta factual, como corresponde a un modelo base de 580M parámetros sin RLHF ni DPO.
- Limitación de idioma: solo inglés declarado; el rendimiento en castellano u otros idiomas no está garantizado.
- Limitación de contexto: 4.096 tokens, muy por debajo de modelos contemporáneos de tamaño similar.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero el modelo no está diseñado ni validado para producción.
- Sin turno de sistema en el formato de chat: los modelos nunca vieron uno, por lo que prompts con rol de sistema pueden degradar la calidad.
- Ausencia de tool calling, agentes y capacidades multimodales documentadas.
- Advertencia de reproducibilidad: el flujo raw difiere del empaquetado original en un documento menos en 60 pasos de los 31.777 totales, lo que puede introducir diferencias menores frente a otros artefactos del estudio.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Raghav-Singhal/1pp-0.58b-v2-raw-seed1234-base
- Colección 1PP: https://huggingface.co/collections/Raghav-Singhal/1pp-6a999df54bfcf9335355a649
- Logs de entrenamiento (wandb, `1pp-training`): https://wandb.ai/raghav_singhal/1pp-training
- Logs de SFT (wandb, `1pp-sft`): https://wandb.ai/raghav_singhal/1pp-sft
