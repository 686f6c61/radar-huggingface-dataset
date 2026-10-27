# Raghav-Singhal/1pp-1.7b-ua-seed1234-base

## Resumen

1pp-1.7b-ua-seed1234-base es un modelo de lenguaje de 1.661.048.832 parámetros (1,66B) desarrollado por Raghav-Singhal en el marco del proyecto One Persona Pretraining (1PP), un artefacto de investigación vinculado a EPFL DLAB. No es un asistente de propósito general: es una réplica de semilla del modelo `1pp-1.7b-ua-base`, reentrenado con la misma receta y la misma secuencia de batches pero con `--seed 1234` en lugar de 28 para la inicialización de parámetros, con el objetivo de medir la varianza de inicialización de la receta.

El modelo forma parte de un estudio factorial de 3 × 3: tres tamaños (0,5B, 1B y 1,7B) por tres condiciones de preentrenamiento sobre los mismos 47,8 millones de documentos en el mismo orden (documentos originales; conversaciones reescritas con pérdida solo en turnos del asistente; conversaciones reescritas con pérdida en turnos de usuario y asistente). Esta variante corresponde a la condición "user+assistant" en el tamaño 1,7B. La arquitectura es un decoder estilo Llama con 24 capas, anchura oculta de 2.048 y longitud de secuencia de 4.096 tokens.

Su relevancia es metodológica: permite cuantificar cuánto varía la pérdida de validación entre inicializaciones distintas de la misma receta (diferencias observadas de 0,0021 a 0,0038 nats en pérdida SFT retenida frente a los modelos con semilla 28) y aislar el efecto del texto de los documentos y de la máscara de pérdida, ya que todos los runs ven exactamente la misma secuencia de batches.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Decoder estilo Llama (transformer denso), 24 capas, hidden 2.048, FFN 8.192 con SwiGLU, 16 cabezas de atención / 4 cabezas KV (head dim 128), RMSNorm, RoPE base 10.000, embeddings no atados, sin biases, sin QK-norm |
| Parametros totales | 1.661.048.832 (1,66B) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | 4.096 tokens (longitud de secuencia de entrenamiento; no se declara extensión adicional) |
| Tipos de cuantizacion | No se publican cuantizaciones oficiales; pesos en bf16 convertibles a GGUF, GPTQ o AWQ con herramientas externas |
| Idiomas soportados | Ingles (`en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (repositorio de 3,3 GB), biblioteca `transformers` |

## Arquitectura y entrenamiento

Es un transformer decoder denso de estilo Llama: 24 capas, dimensión oculta 2.048, FFN de 8.192 con activación SwiGLU, 16 cabezas de atención y 4 cabezas KV (GQA con dimensión de cabeza 128), normalización RMSNorm, RoPE con base 10.000, embeddings de entrada y salida no atados, sin biases y sin QK-norm. El tokenizador es el vocabulario de SmolLM2 (49.152 tokens) más un token `<|pad|>`; `<|endoftext|>` actúa como token de fin de documento.

El preentrenamiento se hizo en una sola pasada sobre 47,8 millones de documentos (66,2B tokens como documentos originales, 63,0B tokens en formato conversación), con 31.777 pasos a batch global de 512 × 4.096 tokens, enmascarado de atención entre documentos y empaquetado best-fit con asignación de documentos alineada a paso. El optimizador es Muon (shape scaling, LR de matrices 0,005) con Adam para embeddings y normas, warmup de 2.000 pasos, LR constante con decaimiento lineal en el último 10% hasta 1/100, weight decay 0,1 y precisión bf16. En esta condición la pérdida se aplica a turnos de usuario y de asistente, sin pérdida sobre `<|endoftext|>`.

Las pérdidas de validación del checkpoint final sobre 2.433 documentos retenidos son 1,432 en texto de asistente, 1,340 en texto de usuario y 3,093 en texto de documento. Los pesos de HuggingFace se verificaron contra el checkpoint de Megatron recalculando pérdidas: 1,4307 frente a 1,4321 (diferencia absoluta 0,0014) en segmentos val50m y 3,0943 frente a 3,0926 (0,0016) en segmentos raw_val50m. El formato de chat es ChatML sin turno de sistema, ya que los modelos nunca vieron uno: `<|im_start|>user\n{message}<|im_end|>\n<|im_start|>assistant\n{reply}<|im_end|>\n`; la generación se detiene en `<|im_end|>` (id 2) o `<|endoftext|>` (id 0).

## Capacidades

- Generación de texto en inglés con formato de conversación ChatML, heredado de la condición de preentrenamiento con conversaciones reescritas.
- Modelo base: no ha pasado por SFT ni por alineación (RLHF/DPO), por lo que no sigue instrucciones de forma fiable.
- Continuación de documentos y texto plano, especialmente en la variante de condición "documentos originales" del estudio; esta variante produce texto con formato conversacional.
- Capacidad de razonamiento, código y matemáticas: no evaluada ni documentada en la información disponible.
- Tool calling / function calling: no soportado de forma nativa ni documentado.
- Uso como agente o razonamiento multi-paso: no documentado.
- Multilingüismo: limitado al inglés según la model card.
- No dispone de modo "thinking", visión, audio ni otras modalidades.
- Sirve como punto de partida reproducible para experimentos de SFT y para estudiar el efecto del enmascarado de pérdida.

## Casos de uso

- Estudio de reproducibilidad de recetas de preentrenamiento: comparar este modelo con `1pp-1.7b-ua-base` (semilla 28) para acotar la varianza de inicialización, usando las diferencias de pérdida SFT retenida de 0,0021 a 0,0038 nats como referencia.
- Análisis del efecto de la máscara de pérdida: al compartir secuencia de batches con las otras dos condiciones del estudio, permite atribuir diferencias de pérdida exclusivamente al texto del documento y a la máscara (asistente solo frente a usuario+asistente).
- Punto de partida para SFT ligero: al ser un base model de 1,66B con plantilla ChatML ya definida, se puede afinar en una GPU de consumo para tareas concretas en inglés y comparar contra el baseline sin máscara de usuario.
- Evaluación de tokenizadores: útil para medir el comportamiento del vocabulario de SmolLM2 (49.152 tokens) en dominios específicos, incluyendo la gestión del token `<|pad|>` añadido.
- Experimentos de formato de chat sin turno de sistema: sirve para estudiar cómo se comporta un modelo que nunca vio un rol `system` y qué estrategias de prompting compensan esa ausencia.
- Generación de texto sintético en inglés para aumentar datasets de investigación, aceptando que la calidad no está alineada y requiere filtrado posterior.
- Despliegue de bajo coste para demos y pruebas de infraestructura (vLLM, TGI, llama.cpp) gracias a sus 3,3 GB de pesos en bf16.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. Los únicos datos numéricos publicados son pérdidas de validación y comprobaciones de consistencia de pesos:

| Metrica | Resultado |
|---|---|
| Pérdida de validación, texto de asistente (2.433 documentos retenidos) | 1,432 |
| Pérdida de validación, texto de usuario | 1,340 |
| Pérdida de validación, texto de documento | 3,093 |
| Verificación HF vs Megatron, val50m segmentos [3] | 1,4307 vs 1,4321 (dif. abs. 0,0014) |
| Verificación HF vs Megatron, raw_val50m segmentos [8] | 3,0943 vs 3,0926 (dif. abs. 0,0016) |
| Diferencia de pérdida SFT retenida frente a las réplicas con semilla 28 | 0,0021 a 0,0038 nats (rango observado, no estimación de varianza) |

## Requisitos de hardware

- VRAM para inferencia: aproximadamente 3,4 GB con pesos en bf16 (3,3 GB de pesos más overhead), en torno a 1,8 GB en int8 y 1,0-1,2 GB en 4 bits (estimaciones, no medidas publicadas).
- Caché KV: con 24 capas, 4 cabezas KV y dimensión de cabeza 128, cada token ocupa unos 24 KB en fp16; a 4.096 tokens de contexto supone aproximadamente 100 MB adicionales.
- GPU de consumo: cabe holgadamente en tarjetas de 8 GB o más (RTX 3060 Ti, RTX 3070, RTX 4060 Ti, RTX 4070, RTX 4090) en bf16, con margen amplio en 4 bits para GPU de 6-8 GB (RTX 2060, GTX 1660 Super con conversión a GGUF).
- GPU de datacenter: A100, H100, L40S o A10G son suficientes y quedan sobredimensionadas para inferencia individual; son las adecuadas para servir muchas réplicas concurrentes.
- Despliegue: compatible con `transformers`, Text Generation Inference (la model card incluye `text-generation-inference` y `endpoints_compatible`), vLLM y, previa conversión a GGUF, llama.cpp y Ollama.
- Latencia y throughput: no disponibles; no se han publicado mediciones en la información proporcionada.

## Comparativa con modelos similares

Los datos de la columna propia están verificados en la información disponible; los de los modelos comparables son valores públicos de referencia y no se han verificado en esta ficha.

| Modelo | Parámetros | Contexto | Licencia | Enfoque |
|---|---|---|---|---|
| 1pp-1.7b-ua-seed1234-base | 1,66B | 4.096 | Apache 2.0 | Base de investigación, preentrenado sobre conversaciones, sin SFT |
| SmolLM2-1.7B (HuggingFace) | 1,7B | 8.192 (referencia pública) | Apache 2.0 | Base/instruct de propósito general, mismo tokenizador aproximadamente |
| Qwen2.5-1.5B (Alibaba) | 1,5B | 32.768 (referencia pública) | Apache 2.0 | Base/instruct multilingüe con soporte de tool calling |
| Llama-3.2-1B (Meta) | 1,2B | 128.000 (referencia pública) | Licencia comunitaria Llama 3.2 | Base/instruct de propósito general |

Frente a estas alternativas, el modelo 1PP no compite en capacidades: su contexto es cuatro veces menor que el de SmolLM2-1.7B y muy inferior al de Qwen2.5 o Llama-3.2, no tiene versión instruct y solo cubre inglés. Su valor está en la reproducibilidad controlada del experimento, no en el rendimiento aguas abajo.

## Limitaciones y advertencias

- No es un asistente de propósito general: es un artefacto de investigación sin SFT ni alineación, por lo que no sigue instrucciones de forma fiable y puede producir salidas incoherentes en tareas de diálogo.
- Riesgo elevado de alucinación y de contenido sesgado: el corpus de preentrenamiento es de origen no documentado en la información disponible y no se aplicaron filtros de seguridad ni preferencias humanas.
- Nunca vio un turno de sistema durante el entrenamiento; introducir uno puede degradar el comportamiento de forma impredecible.
- Contexto limitado a 4.096 tokens y sin mecanismos de extensión documentados.
- Solo inglés; no se ha evaluado ni validado ningún otro idioma.
- El uso comercial está permitido por la licencia Apache 2.0, pero la ausencia de garantías y de evaluaciones de seguridad hace desaconsejable su despliegue en producción orientado a usuarios finales.
- La variante de condición "conversaciones" tiene una pérdida de validación en texto de documento mucho peor (3,093) que en texto conversacional, lo que refleja un sesgo hacia el formato ChatML.
- Las cifras de hardware de esta ficha son estimaciones derivadas del tamaño de los pesos, no mediciones publicadas.
- El modelo tiene 0 descargas y 0 likes en el momento de la consulta; no hay evidencia de uso en producción ni de validación por terceros.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Raghav-Singhal/1pp-1.7b-ua-seed1234-base
- Modelo base de la réplica (semilla 28): https://huggingface.co/Raghav-Singhal/1pp-1.7b-ua-base
- Colección 1PP: https://huggingface.co/collections/Raghav-Singhal/1pp-6a999df54bfcf9335355a649
- Registros de entrenamiento (preentrenamiento): https://wandb.ai/raghav_singhal/1pp-training
- Registros de entrenamiento (SFT): https://wandb.ai/raghav_singhal/1pp-sft
- Paper, blog o repositorio adicionales: no disponibles en la información proporcionada.
