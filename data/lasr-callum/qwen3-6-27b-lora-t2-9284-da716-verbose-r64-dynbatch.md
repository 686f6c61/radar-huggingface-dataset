# LASR-Callum/qwen3.6-27b-lora-t2-9284-da716-verbose-r64-dynbatch

## Resumen

Este repositorio contiene un adaptador LoRA de tipo SFT (PEFT) construido sobre el modelo base Qwen/Qwen3.6-27B, publicado por el usuario LASR-Callum. Se trata de un experimento de investigación en alineación de modelos: el adaptador se entrena con 9.284 filas de la tabla "Table-2" más 716 filas de "difficult-advice" generadas contra un único principio añadido a la constitución del modelo: la curiosidad intelectual genuina, un valor que, según el autor, los benchmarks tipo ODCV-Bench no pueden recompensar. El objetivo es explorar si es posible inculcar un rasgo de comportamiento no medible por métricas estándar.

El adaptador forma parte de una familia de brazos experimentales del mismo autor, con variaciones en el conjunto de datos y en los modelos generadores (Gemini 3.7 Flash en lugar de Haiku 4.5 para las etapas 2, 3 y 5, con reescrituras de Sonnet 5). El repositorio incluye el adaptador en formato safetensors, el tokenizador y metadatos de entrenamiento. No se han publicado resultados de benchmarks ni información sobre el rendimiento del adaptador, y el repositorio no registra descargas ni valoraciones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre Qwen/Qwen3.6-27B (arquitectura del base no especificada) |
| Parametros totales | No disponible (el adaptador pesa 1,3 GB en safetensors; el base Qwen3.6-27B no está detallado) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | 8192 tokens (max_seq_len de entrenamiento) |
| Tipos de cuantizacion | No disponible (solo safetensors; no se mencionan versiones cuantizadas) |
| Idiomas soportados | No disponible (el base Qwen3.6-27B es presumiblemente multilingüe, pero no se confirma) |
| Licencia | No disponible (el autor no la especifica; otros adaptadores del mismo autor usan Apache-2.0, pero no se puede confirmar para este) |
| Formato de pesos | safetensors (adaptador PEFT LoRA + tokenizador + training_meta.json) |

## Arquitectura y entrenamiento

El adaptador se entrena con la configuración: r=64, alpha=128, dropout=0,05, learning rate 0,0001, batch size 1, grad_accum 16, 1 época, y dynamic batching con presupuesto de tokens según el perfil de memoria de una GPU H200 (8000 tokens). El entrenamiento se realizó con torchrun en 2 ranks DDP. El dataset proviene de `LASR-Callum/2026-08-25-table2-9284-difficult-advice-verbose-716-train` (revisión 4b7c08ab24eea91903857be57b0eb07ae9339f61), que contiene 10.000 filas en formato JSONL.

La generación de las 716 filas "difficult-advice" se realizó con Gemini 3.7 Flash (etapas 2, 3 y 5) y reescrituras de Sonnet 5, a diferencia del brazo comparativo que usó Haiku 4.5. El principio de curiosidad intelectual se añadió como punto 10 a una constitución de 9 principios derivada de "claude_distilled_12_principles_mid". En otros adaptadores del mismo autor se documenta el enmascaramiento del marcador de no-pensamiento de Qwen3.6 para evitar el colapso de razonamiento, pero no se confirma que esta técnica se aplique en este adaptador concreto.

## Capacidades

- Hereda las capacidades del modelo base Qwen3.6-27B, que según fuentes externas acepta texto, imagen y vídeo como entrada y genera texto como salida (no confirmado para este adaptador específico).
- Entrenado específicamente para exhibir curiosidad intelectual genuina en sus respuestas, según el principio añadido a la constitución.
- Soporta razonamiento con "thinking mode" (el base Qwen3.6 incluye marcadores de pensamiento; el adaptador se condiciona a ellos).
- No se documenta soporte de tool calling, function calling ni capacidades de agente en la información disponible.
- No se especifican capacidades multilingües concretas.

## Casos de uso

- Investigación en alineación de modelos: permite estudiar si un valor no recompensable por benchmarks (curiosidad intelectual) puede inculcarse mediante SFT con datos sintéticos, comparando con el brazo "da716" que usa otro rasgo.
- Experimentación con generación de datos sintéticos: el pipeline de generación con Gemini 3.7 Flash y Sonnet 5 puede replicarse para crear datasets de "difficult-advice" en otros dominios.
- Fine-tuning selectivo de Qwen3.6-27B: el adaptador LoRA (r=64) permite probar cambios de comportamiento sin modificar los pesos completos del modelo base, facilitando iteraciones rápidas en entornos de investigación.
- Evaluación de robustez del razonamiento: al entrenar con un principio de curiosidad, se puede analizar si el modelo mantiene coherencia en tareas de razonamiento multi-paso frente a variantes sin ese principio.
- Comparación de metodologías de generación de datos: al usar distintos modelos generadores (Gemini 3.7 Flash vs. Haiku 4.5), sirve para medir el impacto del generador en la calidad del dataset final.
- Estudio de colapso de razonamiento: el enmascaramiento del marcador de no-pensamiento (documentado en otros adaptadores del autor) puede investigarse con este adaptador para validar estrategias de prevención.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no incluye métricas de MMLU, HumanEval, GSM8K ni ninguna otra evaluación. El autor menciona que el valor entrenado (curiosidad intelectual) no es recompensable por ODCV-Bench, lo que sugiere que las evaluaciones estándar podrían no reflejar el efecto del entrenamiento.

## Requisitos de hardware

- El adaptador LoRA pesa 1,3 GB, pero para inferencia se requiere cargar el modelo base Qwen3.6-27B completo.
- Estimación para el base de 27B: en FP16 se necesitan aproximadamente 54 GB de VRAM; en 8 bits unos 27 GB; en 4 bits unos 13,5 GB. Estas cifras son orientativas y dependen de la arquitectura exacta del base, que no se especifica.
- GPU recomendadas: H200 (usada en el entrenamiento, con 8000 tokens de presupuesto dinámico), A100 de 40 GB o 80 GB, o RTX 4090 (24 GB) si se aplica cuantización de 4 bits.
- Opciones de despliegue: al ser un adaptador PEFT, puede cargarse con bibliotecas como Hugging Face PEFT y transformers, o integrarse en vLLM, TGI o llama.cpp si se convierte a GGUF. No se proporcionan configuraciones específicas.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Base | Configuración | Propósito | Licencia |
|---|---|---|---|---|
| LASR-Callum/qwen3.6-27b-lora-t2-9284-da716-verbose-r64-dynbatch (este) | Qwen3.6-27B | LoRA r=64, 10k filas, curiosidad intelectual | Investigación en alineación | No disponible |
| LASR-Callum/qwen3_6-27b-lora-t2-9284-da716-r64-dynbatch (brazo comparativo) | Qwen3.6-27B | LoRA r=64, 10k filas, mismo dataset pero con Haiku 4.5 | Investigación en alineación | No disponible |
| LASR-Callum/qwen3.6-27b-lora-500k-da20-numina | Qwen3.6-27B | LoRA r=64, 500k filas, dataset numina | Entrenamiento con datos matemáticos | Apache-2.0 (según ficha) |

No se dispone de resultados de rendimiento para ninguna de estas variantes, por lo que la comparación se limita a configuración y propósito.

## Limitaciones y advertencias

- Es un adaptador experimental con 0 descargas y 0 valoraciones; no hay evidencia de su calidad o fiabilidad en producción.
- El dataset de entrenamiento es sintético, generado por modelos de IA (Gemini 3.7 Flash, Sonnet 5), lo que puede introducir sesgos y errores propagados.
- La licencia no está especificada, lo que impide conocer las restricciones de uso comercial o redistribución.
- No se han publicado benchmarks, por lo que se desconoce si el entrenamiento degrada capacidades generales del modelo base.
- El principio de curiosidad intelectual es subjetivo y no validado externamente; su efecto real sobre el comportamiento del modelo no está medido.
- El adaptador se entrenó con una ventana de 8192 tokens; contextos más largos pueden no funcionar correctamente.
- No se garantiza soporte para tool calling, agentes u otras capacidades avanzadas, aunque el base pudiera tenerlas.
- Al ser un adaptador LoRA, requiere el modelo base Qwen3.6-27B, que no está incluido en este repositorio.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/LASR-Callum/qwen3.6-27b-lora-t2-9284-da716-verbose-r64-dynbatch
- Repositorio fuente del experimento: https://github.com/Matthew-Bozoukov/teaching_claude_why_replication.git (revisión d1fa94d14499b20f35215269b5a86ee43fb5eded)
- Brazo comparativo: https://huggingface.co/LASR-Callum/qwen3_6-27b-lora-t2-9284-da716-r64-dynbatch
- Otro adaptador del mismo autor (Apache-2.0): https://huggingface.co/LASR-Callum/qwen3.6-27b-lora-500k-da20-numina
- Ficha en Friendli AI (modelo similar): https://friendli.ai/models/LASR-Callum/qwen3.6-27b-lora-t2-9284-da-chunk-only-702-r64-dynbatch
