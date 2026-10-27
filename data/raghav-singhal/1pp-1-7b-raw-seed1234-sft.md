# Raghav-Singhal/1pp-1.7b-raw-seed1234-sft

## Resumen

`1pp-1.7b-raw-seed1234-sft` es un modelo de lenguaje de 1.661 millones de parámetros publicado por Raghav-Singhal como artefacto de investigación del proyecto One Persona Pretraining (1PP, EPFL DLAB). No es un asistente de propósito general: es una réplica semilla de un estudio controlado sobre cómo afecta la condición de preentrenamiento (documentos originales frente a conversaciones reescritas) y la inicialización aleatoria al comportamiento final del modelo. Concretamente, reproduce la receta de `1pp-1.7b-raw-sft` cambiando `--seed 1234` en lugar de 28 para la inicialización de los parámetros de preentrenamiento, manteniendo la semilla 28 en la fase de SFT.

El modelo emplea una arquitectura decoder estilo Llama de 24 capas, dimensión oculta 2.048, FFN de 8.192 con SwiGLU, 16 cabezas de atención y 4 cabezas KV (GQA), RMSNorm, RoPE con base 10.000, embeddings no atados y una longitud de secuencia de 4.096 tokens. El tokenizador es el vocabulario de SmolLM2 (49.152 entradas) más un token `<|pad|>`. Se entrenó sobre 66,2 miles de millones de tokens procedentes del corpus DCLM-edu y después se ajustó con supervisión sobre una mezcla de 400.000 conversaciones.

Su relevancia es metodológica: forma parte de un estudio factorial 3 × 3 (tres tamaños —0,5B, 1B, 1,7B— por tres condiciones de preentrenamiento sobre los mismos 47,8 millones de documentos en el mismo orden) y sirve para cuantificar la varianza de inicialización de la receta, no para competir en benchmarks de capacidad. La licencia es Apache 2.0 y los pesos están en safetensors.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Decoder transformer estilo Llama (24 capas, hidden 2.048, FFN 8.192 SwiGLU, 16 cabezas / 4 KV, head dim 128, RMSNorm, RoPE base 10.000, embeddings no atados, sin biases, sin QK-norm) |
| Parámetros totales | 1.661.048.832 (1,66B) |
| Parámetros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 4.096 tokens (longitud de secuencia de entrenamiento) |
| Tipos de cuantización | No disponible (el repositorio solo distribuye safetensors en precisión de entrenamiento; el autor no publica cuantizaciones) |
| Idiomas soportados | Inglés (`en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería `transformers`, pipeline `text-generation`) |

Otros datos técnicos: tamaño del repositorio 3,3 GB; tokenizador SmolLM2 con 49.152 entradas más `<|pad|>`; `<|endoftext|>` actúa como token de fin de documento; `eos_token_id` incluye `<|im_end|>` (id 2) y `<|endoftext|>` (id 0).

## Arquitectura y entrenamiento

La arquitectura es un decoder transformer denso de estilo Llama con 24 capas, dimensión oculta 2.048, FFN de 8.192 con activación SwiGLU y atención con 16 cabezas de consulta y 4 cabezas KV (GQA, dimensión por cabeza 128). Usa RMSNorm, RoPE con base 10.000, embeddings de entrada y salida no atados y ninguna bias ni QK-norm. La longitud de secuencia es de 4.096 tokens.

El preentrenamiento usa los documentos originales de DCLM-edu (condición "raw baseline"), con pérdida sobre todos los tokens del documento y sobre `<|endoftext|>`. Se realiza una pasada sobre 47,8 millones de documentos (66,2B tokens en formato documento; 63,0B tokens en formato conversación), 31.777 pasos con batch global de 512 × 4.096 tokens, enmascaramiento de atención entre documentos y empaquetado best-fit con asignación de documentos alineada a paso. El optimizador es Muon (shape scaling, LR de matriz 0,005) con Adam para embeddings y normas, 2.000 pasos de warmup, LR constante y decaimiento lineal en el último 10% hasta 1/100, weight decay 0,1 y bf16. Pérdida de validación en el checkpoint final (2.433 documentos reservados): 2,395 sobre texto de documento, 2,496 sobre texto de asistente y 2,542 sobre texto de usuario.

El SFT consiste en una época sobre una mezcla de 400.000 conversaciones: `jkminder/model-raising-pb-100k-3c-mt-sft` (98,5k multiturno, con pista de constitución), `dlab-spp/sp-sft-normal-300k` eliminando los prompts duplicados del primer conjunto (271,6k) y una muestra de 30.000 de `dlab-spp/sp-sft-safety-180k`. Mismo stack que el preentrenamiento (Megatron, Muon, ChatML sin turno de sistema, pérdida solo en turnos de asistente). El LR de matriz 0,002 se seleccionó por modelo entre {0,0005, 0,001, 0,002, 0,005} según pérdida reservada, y el réplicate lo reutiliza. Batch global 128 × 4.096, decaimiento lineal a 1/10 tras un warmup del 3%. Pérdida SFT reservada: 1,924 sobre 1.998 conversaciones.

Detalle metodológico relevante: el corpus empaquetado original se perdió antes de esta ejecución, por lo que se entrenó sobre una reconstrucción. 31.717 de 31.777 pasos reproducen exactamente los recuentos de documentos y tokens originales; 60 pasos quedan un documento por debajo, con 139.055 tokens menos sobre 66,19B totales; 36 documentos se aceptaron por coincidencia larga de prefijo exacto cuya diferencia restante no tiene causa conocida. Por tanto, este réplicate difiere del modelo semilla 28 tanto en la semilla como en esos documentos. La horquilla observada de diferencia de pérdida SFT reservada entre réplicates seed-1234 y seed-28 es de 0,0021 a 0,0038 nats por condición (un réplicate por semilla, por lo que es un rango observado, no una estimación de varianza).

Los pesos de HuggingFace se verificaron contra el checkpoint de Megatron recalculando pérdidas de validación: 1,9245 en ambos casos sobre los segmentos [3, 4] del conjunto `sft_val`, con diferencia absoluta 0,0000.

## Capacidades

- Generación de texto conversacional en inglés con formato ChatML sin turno de sistema; el `chat_template` incluido renderiza exactamente ese formato.
- Respuesta multiturno: el SFT se realizó sobre una mezcla mayoritariamente multiturno (98,5k conversaciones de `model-raising-pb-100k-3c-mt-sft`) y el modelo se evalúa sobre turnos de asistente.
- Seguimiento de instrucciones y respuestas con citas de constitución, heredado del conjunto de SFT con pista de constitución.
- Comportamiento safety entrenado de forma parcial: 30.000 muestras de `dlab-spp/sp-sft-safety-180k` dentro de la mezcla de SFT.
- Condición de preentrenamiento sobre documentos crudos: conserva la distribución de documentos originales de DCLM-edu, lo que lo hace útil como línea base de comparación frente a las condiciones "conversation" del mismo estudio.
- Capacidades multilingües: no disponibles; el modelo declara únicamente inglés y el corpus de preentrenamiento es DCLM-edu en inglés.
- Tool calling / function calling: no disponible; no se entrenó ni se documenta soporte de herramientas.
- Razonamiento multi-paso explícito o modo "thinking": no disponible; no hay modo de razonamiento ni trazas de pensamiento documentadas.
- Visión, audio u otras modalidades: no disponibles; es un modelo exclusivamente de texto.
- Capacidad de continuación de documentos con `<|endoftext|>` como token de fin de documento, útil para experimentos de modelado de lenguaje puro.

## Casos de uso

- Estudio de varianza de inicialización en recetas de preentrenamiento: sirve como uno de los réplicates de semilla para medir cuánto cambia la pérdida SFT reservada al variar únicamente `--seed` en la inicialización, comparando directamente contra `1pp-1.7b-raw-sft` con una horquilla documentada de 0,0021 a 0,0038 nats.
- Línea base "raw documents" en ablaciones de formato de datos: al compartir secuencia de batches con las condiciones de conversación del estudio 3 × 3, permite aislar el efecto del texto del documento y de la máscara de pérdida sobre el rendimiento final.
- Réplica de experimentos de pérdida de validación: el checkpoint permite recalcular pérdidas y contrastarlas con la referencia de Megatron (1,9245 en `sft_val` segmentos [3, 4]), de modo que se puede auditar la cadena de conversión de pesos.
- Punto de partida para SFT propio en inglés: con 1,66B parámetros y licencia Apache 2.0, es viable reajustarlo sobre un corpus conversacional propio de dominio para estudiar cómo interactúa la condición de preentrenamiento con el nuevo SFT.
- Investigación sobre formato de chat y rol del turno de sistema: el modelo nunca vio un turno de sistema, lo que lo convierte en un sujeto de prueba controlado para medir degradación al introducir uno en producción o en evaluaciones.
- Evaluación de calidad de reconstrucción de corpus: los 60 pasos con un documento menos y los 139.055 tokens de diferencia permiten estudiar la sensibilidad del entrenamiento a pequeñas desviaciones en el corpus empaquetado.
- Docencia y divulgación sobre pipelines Megatron-Muon: los logs públicos de wandb (`1pp-training`, `1pp-sft`) y la receta completa documentada permiten reproducir el flujo con fines formativos.
- Generación de texto en inglés para prototipos de bajo coste: 3,3 GB de pesos en safetensors caben en una GPU de consumo, lo que facilita pruebas de integración con `transformers` y TGI sin infraestructura dedicada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor solo reporta pérdidas de validación y de SFT reservadas, que se recogen a continuación por su valor comparativo dentro del estudio.

| Conjunto / métrica | Valor |
|---|---|
| Pérdida de validación, texto de asistente (2.433 documentos reservados) | 2,496 |
| Pérdida de validación, texto de usuario | 2,542 |
| Pérdida de validación, texto de documento | 2,395 |
| Pérdida SFT reservada, tokens de asistente (1.998 conversaciones) | 1,924 |
| Pérdida SFT verificada HF vs. Megatron, `sft_val` segmentos [3, 4] | 1,9245 / 1,9245 (diferencia absoluta 0,0000) |
| Diferencia observada de pérdida SFT frente a seed-28 (por condición) | 0,0021 a 0,0038 nats |

No hay datos de MMLU, HumanEval, GSM8K ni de evaluaciones de seguridad publicados para este modelo.

## Requisitos de hardware

- VRAM para pesos: aproximadamente 3,3 GB en bf16/fp16 (1,66B × 2 bytes), 6,6 GB en fp32 y 1,7 GB en int8. Estimaciones calculadas a partir del recuento real de parámetros, no publicadas por el autor.
- Caché KV: 24 capas × 4 cabezas KV × 128 dimensiones × 2 (K y V) × 2 bytes = 48 KiB por token; unos 197 MiB a la longitud máxima de 4.096 tokens. Estimación calculada, no publicada.
- GPU recomendadas: cualquier GPU con 8 GB o más puede ejecutar el modelo en bf16 a contexto completo; una RTX 4090, L40S o A100 permiten además batch alto. Para bf16 con contexto completo y batch moderado, 12-16 GB de VRAM es un objetivo cómodo.
- Cabe en GPU de consumo: sí. Una RTX 3060 de 12 GB, RTX 4070, RTX 4080 o RTX 4090 puede alojar los pesos en bf16 y parte del contexto; en cuantización int8 o int4 cabría en GPUs de 6-8 GB, aunque no se distribuyen pesos cuantizados.
- Opciones de despliegue: `transformers` (soporte nativo, es la librería declarada), Text Generation Inference (el modelo está etiquetado como `text-generation-inference` y `endpoints_compatible`). No se distribuyen pesos GGUF, por lo que llama.cpp u Ollama requerirían conversión propia no verificada. vLLM es plausible por la arquitectura Llama, pero no está confirmado por el autor.
- Latencia y throughput: no disponibles. No se han publicado mediciones de tokens por segundo ni de latencia por petición.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Enfoque |
|---|---|---|---|---|
| `1pp-1.7b-raw-seed1234-sft` (este) | 1,66B | 4.096 | Apache 2.0 | Artefacto de investigación, preentrenamiento sobre documentos crudos + SFT |
| `1pp-1.7b-raw-sft` (semilla 28) | 1,7B (misma receta) | 4.096 | Apache 2.0 | Modelo de referencia del que este es réplicate de semilla |
| Otros tamaños de la colección 1pp | 0,5B y 1B | 4.096 | Apache 2.0 | Mismas tres condiciones de preentrenamiento, misma secuencia de batches |
| SmolLM2-1.7B | 1,71B | 8.192 | Apache 2.0 | Modelo generalista; comparte vocabulario (49.152) con este modelo |

Nota: los datos de SmolLM2-1.7B proceden de su model card pública y no se han verificado en el marco de esta ficha. No se dispone de comparaciones de rendimiento (benchmarks) entre este modelo y alternativas, porque el autor no publica ninguna.

## Limitaciones y advertencias

- No es un asistente de propósito general: el propio autor lo describe como artefacto de investigación del proyecto 1PP (EPFL DLAB), no como modelo listo para producción.
- Solo inglés: el corpus de preentrenamiento es DCLM-edu en inglés y la etiqueta de idioma es `en`; no hay evidencia de competencia en otros idiomas.
- Contexto corto: 4.096 tokens, muy por debajo de los 32K o más habituales en modelos de su tamaño en 2025-2026, lo que limita casos de uso con documentos largos o conversaciones extensas.
- Sin turno de sistema: el modelo nunca vio un turno de sistema durante el entrenamiento. Introducir uno en producción puede degradar el comportamiento de forma no medida.
- Riesgo de alucinación: no se han publicado evaluaciones de factualidad ni de tasa de alucinación; el SFT sobre mezclas conversacionales sin verificación de hechos no permite descartarlo.
- Sesgos: no se documenta ninguna evaluación de sesgos. El corpus DCLM-edu y los conjuntos de SFT (incluida una muestra parcial de `sp-sft-safety-180k`, solo 30k de 180k) no garantizan un comportamiento alineado.
- Cobertura de seguridad parcial: solo 30.000 de las 180.000 muestras del conjunto de seguridad se incluyeron en el SFT, por lo que el filtrado de contenido dañino es limitado.
- Corpus de preentrenamiento reconstruido: 60 pasos quedaron un documento por debajo del original (139.055 tokens menos de 66,19B) y 36 documentos se aceptaron por coincidencia de prefijo sin causa conocida de la diferencia. Cualquier comparación fina contra el modelo semilla 28 arrastra esta confusión.
- Varianza de semilla no caracterizada: la horquilla de 0,0021 a 0,0038 nats procede de un único réplicate por semilla, por lo que es un rango observado y no una estimación de varianza.
- Licencia Apache 2.0: permite uso comercial y modificaciones con atribución, pero al ser un artefacto de investigación el autor no ofrece garantías ni soporte; conviene revisar los términos de los conjuntos de datos de SFT de terceros si se redistribuye un derivado.
- Sin cuantizaciones oficiales ni benchmarks: no hay pesos GGUF publicados ni métricas de calidad tras cuantización, de modo que cualquier despliegue cuantizado requiere validación propia.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Raghav-Singhal/1pp-1.7b-raw-seed1234-sft
- Modelo de referencia (semilla 28): https://huggingface.co/Raghav-Singhal/1pp-1.7b-raw-sft
- Colección 1pp: https://huggingface.co/collections/Raghav-Singhal/1pp-6a999df54bfcf9335355a649
- Logs de preentrenamiento (wandb): https://wandb.ai/raghav_singhal/1pp-training
- Logs de SFT (wandb): https://wandb.ai/raghav_singhal/1pp-sft
- Conjunto de SFT multiturno: https://huggingface.co/jkminder/model-raising-pb-100k-3c-mt-sft
- Conjunto de SFT normal: https://huggingface.co/dlab-spp/sp-sft-normal-300k
- Conjunto de SFT de seguridad: https://huggingface.co/dlab-spp/sp-sft-safety-180k
