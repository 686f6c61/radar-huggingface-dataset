# Raghav-Singhal/1pp-2.81b-v2-ua-rawanneal-seed1234-sft

## Resumen

`1pp-2.81b-v2-ua-rawanneal-seed1234-sft` es un modelo de lenguaje decoder-only de 2.807.699.328 parámetros, desarrollado por Raghav-Singhal en el marco del proyecto One Persona Pretraining (1PP) del EPFL DLAB. No es un asistente de propósito general: es un artefacto de investigación diseñado para estudiar cómo la composición del corpus de preentrenamiento (documentos originales frente a conversaciones reescritas) y la máscara de pérdida afectan al comportamiento final del modelo. Este checkpoint concreto corresponde al escalón de 2,81B de la "ladder v2", con la condición `ua` (pérdida sobre turnos de usuario y asistente durante el cooldown) y la semilla 1234, seguido de un ajuste supervisado (SFT).

La arquitectura es un transformer estilo Llama de 24 capas, hidden 2.688, FFN 10.752 con SwiGLU, 21 cabezas de atención y 7 cabezas KV (head dim 128), RMSNorm, RoPE con base 10.000, embeddings no atados y longitud de secuencia de 4.096 tokens. El tokenizador es el vocabulario de SmolLM2 (49.152 tokens) más un token `<|pad|>`. El modelo se entrenó desde cero sobre 112,64B posiciones de token en 53.709 pasos, con un cooldown final de 5.370 pasos sobre conversaciones derivadas de los mismos documentos.

Su relevancia es metodológica: forma parte de una matriz controlada de cuatro tamaños (0,58B, 0,98B, 1,66B y 2,81B) × tres condiciones × tres semillas, donde cada tamaño se entrena sobre el mismo flujo de datos alineado por paso y 20,3 tokens de asistente por parámetro. Esto permite aislar el efecto de la condición de datos y de la inicialización de parámetros, algo poco habitual en modelos publicados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only estilo Llama (24 capas, hidden 2.688, FFN 10.752 SwiGLU, 21 cabezas de atención / 7 KV, head dim 128, RMSNorm, RoPE base 10.000, embeddings no atados, sin biases, sin QK-norm) |
| Parametros totales | 2.807.699.328 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 4.096 tokens (longitud de secuencia de entrenamiento) |
| Tipos de cuantizacion | no disponible (el repo solo publica safetensors en bf16; no se documentan GGUF ni cuantizaciones oficiales) |
| Idiomas soportados | en (inglés) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (repo de 11,2 GB) |
| Tokenizador | SmolLM2 (49.152 tokens) + `<|pad|>`; `<|endoftext|>` como fin de documento |
| Formato de chat | ChatML sin turno de sistema |
| Precisión de entrenamiento | bf16 |
| Descargas / likes | 379 / 0 |

## Arquitectura y entrenamiento

El modelo es un decoder transformer denso de 24 capas con atención multi-cabeza agrupada (21 cabezas de consulta, 7 de clave/valor), normalización RMSNorm y activación SwiGLU en la FFN. Usa RoPE con base 10.000, embeddings de entrada y salida no atados y ningún sesgo lineal. La secuencia de entrenamiento es de 4.096 tokens con enmascaramiento de atención entre documentos. El tokenizador reutiliza el vocabulario de SmolLM2 y añade un token de padding.

El preentrenamiento cubre los primeros 53.709 pasos del flujo alineado por paso de la ladder v2, equivalentes a 112,64B posiciones de token, con batch global de 512 × 4.096. Durante los primeros 48.339 pasos se entrenó sobre documentos DCLM-edu originales; en los últimos 5.370 pasos (el cooldown) se sustituyeron por conversaciones 1PP reescritas a partir de esos mismos documentos, con pérdida sobre turnos de usuario y asistente. El optimizador es Muon (escalado por forma, LR matricial 0,005) combinado con Adam para el resto de parámetros (LR 1,29e-3 para embeddings y capa de salida, 3e-3 para normas), warmup de 3.378 pasos, fase constante y decaimiento lineal hasta 1/100 en el cooldown, weight decay 0,1, init std 0,0078 y precisión bf16.

El SFT se realizó sobre una época de una mezcla de 400k conversaciones: `jkminder/model-raising-pb-100k-3c-mt-sft` (98,5k multiturno con citas de constitución), `dlab-spp/sp-sft-normal-300k` menos los prompts duplicados del primer conjunto (271,6k) y una muestra de 30k de `dlab-spp/sp-sft-safety-180k`. Se usó el mismo stack (Megatron, Muon, ChatML sin turno de sistema, pérdida solo en turnos de asistente), LR matricial 0,001, semilla 1, batch global de 128 × 4.096 y decaimiento lineal a 1/10 tras un warmup del 3%. La pérdida de validación SFT en 1.998 conversaciones reservadas es 1,742. Los pesos se verificaron contra el checkpoint de Megatron recalculando la pérdida de validación (1,7425 en ambos casos, diferencia 0,0000).

## Capacidades

- Generación de texto conversacional en inglés, con formato ChatML sin turno de sistema.
- Respuesta multiturno: el SFT incluye 98,5k conversaciones multiturno del conjunto `model-raising-pb-100k-3c-mt-sft`.
- Razonamiento básico y conocimiento factual: según la model card, el modelo supera el gate de PIQA, ARC-Easy y TriviaQA con resultados cercanos a sus modelos hermanos de la ladder.
- Seguimiento de instrucciones cortas dentro de la plantilla de chat; fuera de la plantilla el comportamiento es degradado (hasta un 40% de respuestas sin sentido según la validación del autor).
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte explícito de agentes ni razonamiento multi-paso.
- No se documenta capacidad de visión, audio ni modo "thinking".
- Multilingüismo limitado al inglés según la etiqueta `language: en` de la model card.

## Casos de uso

- Estudio de ablación de datos de preentrenamiento: el modelo sirve para comparar, junto con sus hermanos de la ladder, el efecto de entrenar el cooldown sobre documentos frente a conversaciones reescritas, manteniendo constantes tamaño, flujo de datos y semilla.
- Investigación sobre escalado controlado: al compartir flujo de datos alineado por paso con los escalones de 0,58B, 0,98B y 1,66B, permite trazar curvas de pérdida y de rendimiento en función del número de parámetros con una variable menos.
- Reproducibilidad de recetas de entrenamiento: la documentación detalla optimizador (Muon + Adam), hiperparámetros, warmup y decaimiento, lo que facilita replicar el pipeline en Megatron con los logs de wandb publicados.
- Evaluación de formatos de chat: útil para medir la sensibilidad de un modelo pequeño a la plantilla ChatML sin turno de sistema y cuantificar la degradación fuera de distribución.
- Generación de texto corto en inglés con contexto de hasta 4.096 tokens: adecuado para tareas de resumen, paráfrasis o respuesta breve en entornos de laboratorio donde no se requiere un asistente de producción.
- Base para experimentos de SFT: al ser un checkpoint intermedio con SFT acotado (400k conversaciones, una época), sirve como punto de partida para estudiar mezclas de datos de instrucción y su efecto en la pérdida de validación.
- Docencia y divulgación: modelo de tamaño contenido (11,2 GB en bf16) que cabe en una GPU de 24 GB en bf16 con cuantización en carga, útil para explicar el ciclo completo preentrenamiento-cooldown-SFT.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card solo reporta pérdidas de validación internas:

| Conjunto | Pérdida |
|---|---|
| Texto de asistente (2.433 documentos reservados, checkpoint final) | 1,397 |
| Texto de usuario (2.433 documentos reservados, checkpoint final) | 1,309 |
| Texto de documento (2.433 documentos reservados, checkpoint final) | 2,848 |
| Tokens de entrenamiento de esta condición (`reweighted_seg1234`) | 1,392 |
| SFT sobre tokens de asistente (1.998 conversaciones reservadas) | 1,742 |
| Verificación HF vs. Megatron (sft_val segmentos [3, 4]) | 1,7425 (diferencia 0,0000) |

El autor menciona que el modelo pasa un "gate" con PIQA, ARC-Easy y TriviaQA cercanos a sus modelos hermanos, pero no se proporcionan cifras concretas.

## Requisitos de hardware

- VRAM estimada en bf16: aproximadamente 5,6 GB solo para pesos (2,81B × 2 bytes), más overhead de activaciones y caché KV; en la práctica, unos 8-12 GB para inferencia con contexto completo de 4.096 tokens.
- VRAM estimada en fp16: idéntica a bf16 en tamaño de pesos.
- Cuantización a 8 bits: alrededor de 2,8 GB de pesos; a 4 bits, alrededor de 1,4 GB, aunque no hay cuantizaciones oficiales publicadas y habría que generarlas con herramientas externas.
- GPU recomendadas: cabe con holgura en una RTX 4090 (24 GB), RTX 3090 (24 GB), L40S (48 GB) o A100/H100 para despliegues con mayor concurrencia. También es viable en GPUs consumer de 12-16 GB (RTX 4070 Ti, RTX 4080) con contexto reducido.
- Cabe en GPU consumer: sí, en cualquier GPU con 12 GB o más en bf16; en 8 GB requeriría cuantización.
- Opciones de despliegue: transformers (librería declarada), text-generation-inference (etiqueta `text-generation-inference` y `endpoints_compatible` en el repo), y previsiblemente vLLM y llama.cpp tras conversión a GGUF, aunque estas dos últimas no están documentadas por el autor.
- Latencia y throughput: no disponibles. No se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| `1pp-2.81b-v2-ua-rawanneal-seed1234-sft` (este) | 2,81B | 4.096 | Apache 2.0 | Hugging Face, 379 descargas | Artefacto de investigación con ablación controlada; sin benchmarks públicos |
| `1pp-2.81b-v2-raw-seed1234-base` | 2,81B | 4.096 | Apache 2.0 | Hugging Face | Mismo run sin cooldown sobre conversaciones; referencia directa para la ablación |
| `1pp-2.81b-v2-ua-seed1234-sft` | 2,81B | 4.096 | Apache 2.0 | Hugging Face | Run completo 1PP con la misma condición y semilla; comparación natural frente a la variante mid-training |
| SmolLM2-1.7B (referencia de tokenizador) | 1,7B | 8.192 | Apache 2.0 | Hugging Face | Modelo de propósito general con benchmarks publicados; no comparable en metodología pero sí en orden de magnitud |

No se dispone de datos de benchmarks que permitan una comparación cuantitativa de rendimiento con alternativas de la misma categoría.

## Limitaciones y advertencias

- El propio autor declara que es un artefacto de investigación del proyecto 1PP (EPFL DLAB) y no un asistente de propósito general.
- Fuera de la plantilla de chat el modelo puede responder con texto sin sentido; la validación del autor acepta hasta un 40% de respuestas incoherentes a preguntas seguras formuladas sin la plantilla.
- No se entrenó con turno de sistema: introducir uno puede degradar la calidad de la respuesta.
- Contexto limitado a 4.096 tokens, insuficiente para documentos largos o conversaciones extensas.
- Solo inglés; no hay evidencia de competencia multilingüe.
- Riesgo de alucinación no cuantificado; no se han publicado evaluaciones de factualidad más allá de TriviaQA mencionada de forma cualitativa.
- Sesgos no documentados: la model card no incluye análisis de sesgos ni evaluaciones de seguridad más allá de la inclusión de 30k muestras del conjunto `sp-sft-safety-180k` en el SFT.
- La licencia Apache 2.0 permite uso comercial, pero la ausencia de benchmarks y de garantías de calidad hace desaconsejable su uso en producción sin una evaluación previa propia.
- El SFT se rehizo el 2026-11-21 tras un colapso del ajuste anterior (LR matricial 0,001, semilla 28); los pesos previos permanecen en el historial del repositorio, lo que puede generar confusión si se descarga una revisión antigua.
- No hay cuantizaciones oficiales ni plantillas de despliegue validadas para llama.cpp u Ollama.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Raghav-Singhal/1pp-2.81b-v2-ua-rawanneal-seed1234-sft
- Variante raw base: https://huggingface.co/Raghav-Singhal/1pp-2.81b-v2-raw-seed1234-base
- Variante 1PP completa: https://huggingface.co/Raghav-Singhal/1pp-2.81b-v2-ua-seed1234-sft
- Colección 1PP: https://huggingface.co/collections/Raghav-Singhal/1pp-6a999df54bfcf9335355a649
- Logs de entrenamiento (wandb): https://wandb.ai/raghav_singhal/1pp-training
- Logs de SFT (wandb): https://wandb.ai/raghav_singhal/1pp-sft
- Dataset SFT multiturno: https://huggingface.co/jkminder/model-raising-pb-100k-3c-mt-sft
- Dataset SFT normal: https://huggingface.co/dlab-spp/sp-sft-normal-300k
- Dataset SFT de seguridad: https://huggingface.co/dlab-spp/sp-sft-safety-180k
