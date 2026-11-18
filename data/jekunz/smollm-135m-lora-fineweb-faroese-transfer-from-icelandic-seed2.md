# jekunz/smollm-135m-lora-fineweb-faroese-transfer-from-icelandic-seed2

## Resumen

Este repositorio contiene un adaptador LoRA entrenado sobre SmolLM2-135M-Instruct para generación de texto en feroés. El autor, jekunz, parte de un adaptador previo afinado en islandés (`jekunz/smollm-135m-lora-fineweb-icelandic`) y realiza una transferencia de conocimiento hacia el feroés usando el subconjunto correspondiente de FineWeb-2, el corpus web multilingüe de Hugging Face. El resultado es un adaptador PEFT que se aplica sobre el modelo base de Hugging Face; no se distribuyen pesos completos, sino únicamente los pesos LoRA en safetensors.

La relevancia del modelo es acotada pero clara: se trata de un experimento de adaptación de bajo coste para una lengua de bajos recursos (el feroés, hablado por unas 70.000 personas) empleando una estrategia de transferencia secuencial desde otra lengua germánica insular, el islandés. El modelo base tiene 135 millones de parámetros, una ventana de contexto de 2048 tokens en el entrenamiento y licencia Apache 2.0. El autor indica explícitamente que es un modelo de investigación y que no ha sido evaluado de forma amplia.

El adaptador se publica como una de tres semillas de entrenamiento (seed 2) de la misma configuración, lo que sugiere que el objetivo es medir la variabilidad del proceso de ajuste. No hay datos de benchmarks, demos ni métricas de calidad publicadas en la información disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (SmolLM2-135M-Instruct) con adaptador LoRA (PEFT) |
| Parametros totales | 135 millones (modelo base); el adaptador LoRA no declara recuento propio |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 2048 tokens (longitud máxima usada en el entrenamiento) |
| Tipos de cuantizacion | No disponible (el adaptador se publica en safetensors; la cuantización del modelo base depende del runtime) |
| Idiomas soportados | Feroés (fo); el modelo base soporta inglés y otros idiomas, pero el adaptador está orientado a feroés |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (adaptador LoRA, librería PEFT) |

## Arquitectura y entrenamiento

El modelo subyacente es SmolLM2-135M-Instruct, un transformer decoder-only de 135 millones de parámetros. Sobre él se aplica un adaptador LoRA con rango 256, alpha 512 y módulos objetivo `up_proj`, `down_proj`, `gate_proj` y `o_proj`, es decir, las proyecciones de las capas MLP y la proyección de salida de la atención. El entrenamiento es secuencial en dos fases: primero una época sobre el subconjunto islandés de FineWeb-2 y después cinco épocas sobre el subconjunto feroés del mismo corpus. Se usa tasa de aprendizaje 8e-4 con scheduler coseno, warmup ratio 0,05, batch size 8 con 32 pasos de acumulación (batch efectivo 256), longitud máxima de 2048 tokens y una única GPU A100 de 40 GB. La semilla es la 2 de tres semillas para esta misma configuración.

La innovación técnica principal no está en la arquitectura, sino en la estrategia de transferencia entre lenguas emparentadas: reutilizar un adaptador ya entrenado en islandés como punto de partida para el feroés reduce el coste de adaptación a una lengua de muy bajos recursos. No se documenta el número total de tokens vistos, la composición exacta del dataset más allá de FineWeb-2, ni si hubo etapas de RLHF o DPO; el modelo base es una variante Instruct, pero el ajuste descrito es de modelado de lenguaje sobre texto web.

## Capacidades

- Generación de texto en feroés, orientada a continuación de texto y conversación por herencia del modelo base Instruct.
- Modelado de lenguaje sobre texto web del dominio FineWeb-2 en feroés.
- Conversación multi-turno básica, limitada por el tamaño del modelo y por la ventana de 2048 tokens.
- Capacidades multilingües residuales del modelo base (inglés principalmente), no garantizadas tras el ajuste en feroés.
- No se documenta soporte de tool calling, function calling, agentes ni razonamiento multi-paso.
- No se documenta modo thinking, visión, audio ni otras modalidades.
- No se documentan capacidades específicas de código o matemáticas.

## Casos de uso

- Experimentación académica en adaptación de lenguas de bajos recursos: el adaptador sirve como punto de partida reproducible (semilla 2 de 3) para estudiar la transferencia islandés-feroés en modelos pequeños.
- Generación de texto sintético en feroés para aumento de datos: con 135 millones de parámetros y contexto de 2048 tokens, puede producir borradores de texto que luego se filtran manualmente.
- Prototipado de asistentes conversacionales en feroés: útil para validar interfaces y flujos antes de invertir en modelos mayores, dado su bajo coste de inferencia.
- Completado de texto y autocompletado en herramientas de escritura para feroés, aprovechando el ajuste sobre texto web del dominio FineWeb-2.
- Investigación sobre variabilidad de semillas: al existir tres semillas de la misma configuración, permite medir la estabilidad del ajuste LoRA en lenguas de bajos recursos.
- Evaluación comparativa de estrategias de transferencia entre lenguas germánicas insulares: sirve como línea base frente a entrenamientos desde cero o adaptadores independientes por idioma.
- Filtrado y clasificación ligera de texto feroés mediante perplejidad, usando el modelo como scorer para detectar texto anómalo o fuera de dominio.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor indica explícitamente que el modelo no ha sido evaluado de forma amplia.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo base de 135 millones de parámetros ocupa aproximadamente 0,27 GB en fp16 y alrededor de 0,07-0,1 GB en cuantización de 4 bits; el adaptador LoRA añade una fracción mínima (repo de 0,2 GB).
- GPU recomendadas: cualquier GPU consumer moderna es suficiente; una A100 de 40 GB se usó para el entrenamiento, pero para inferencia basta una GTX 1650, RTX 3060, RTX 4090 o incluso CPU.
- Cabe holgadamente en GPU consumer y en CPU; también en dispositivos de borde con cuantización.
- Opciones de despliegue: transformers con PEFT para cargar el adaptador, llama.cpp u Ollama si se fusionan los pesos y se convierten a GGUF, y vLLM o TGI para servir el modelo fusionado.
- Latencia y throughput: no disponibles en la información proporcionada; por el tamaño del modelo se espera un throughput alto en GPU, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| jekunz/smollm-135m-lora-fineweb-faroese-transfer-from-icelandic-seed2 | 135 M (base) + LoRA | 2048 | Feroés | Apache 2.0 | Hugging Face (adaptador PEFT) |
| jekunz/smollm-135m-lora-fineweb-icelandic | 135 M (base) + LoRA | 2048 | Islandés | No disponible en la información | Hugging Face (adaptador PEFT) |
| SmolLM2-135M-Instruct (modelo base) | 135 M | 8192 (según el modelo original; no confirmado en esta ficha) | Inglés y multilingüe | Apache 2.0 | Hugging Face |

No se dispone de datos de rendimiento comparativo entre estas variantes en la información proporcionada.

## Limitaciones y advertencias

- Modelo de investigación sin evaluación amplia; no se han publicado métricas de calidad, sesgos ni robustez.
- Riesgo alto de alucinación y de texto incoherente por el tamaño reducido del modelo base y el ajuste sobre texto web sin filtrado fino documentado.
- Contexto limitado a 2048 tokens en el entrenamiento; no se garantiza un comportamiento correcto más allá de esa longitud.
- El ajuste en feroés puede degradar las capacidades del modelo base en otros idiomas, incluido el inglés.
- El corpus FineWeb-2 es texto web sin curación específica, por lo que puede arrastrar sesgos, contenido de baja calidad y ruido.
- Licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantías y desaconseja su uso en producción sin evaluación previa.
- Al ser un adaptador LoRA, requiere cargar el modelo base y la librería PEFT; no es un modelo autónomo listo para usar con un único archivo de pesos.
- Solo se cubre una semilla de tres; el comportamiento puede variar entre semillas.

## Enlaces

- Hugging Face: https://huggingface.co/jekunz/smollm-135m-lora-fineweb-faroese-transfer-from-icelandic-seed2
- Modelo base del adaptador: https://huggingface.co/jekunz/smollm-135m-lora-fineweb-icelandic
- Dataset FineWeb-2: https://huggingface.co/datasets/HuggingFaceFW/fineweb-2
- Modelo base SmolLM2-135M-Instruct: no disponible en la información proporcionada (referencia habitual: https://huggingface.co/HuggingFaceTB/SmolLM2-135M-Instruct)
