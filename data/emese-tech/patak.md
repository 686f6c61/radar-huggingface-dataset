# emese-tech/patak

## Resumen

Patak es un modelo de lenguaje de 9.150 millones de parametros desarrollado por Emese (emese.tech) para el hungaro. Se trata de una continuacion del entrenamiento de EuroLLM-9B sobre un corpus hungaro, seguida de un ajuste fino por instrucciones (SFT) y una alineacion mediante DPO. El modelo sigue una arquitectura tipo LLaMA con atencion de consultas agrupadas (GQA), activacion SwiGLU y normalizacion RMSNorm. Admite una ventana de contexto de 32.768 tokens, lo que lo hace adecuado para conversaciones largas y documentos extensos.

Patak es el modelo mejor valorado en los benchmarks internos de la familia Emese, con un resultado de 218 sobre 250 en Ultimate Bench y 302 sobre 376 en BlindSpot Bench. Esta diseñado para uso conversacional, generacion de codigo, razonamiento multi-paso y tareas de instruccion en hungaro, aunque hereda capacidades multilingues de EuroLLM-9B. Su licencia Apache-2.0 permite uso comercial sin restricciones. Se distribuye en formato bf16 en safetensors y existe una version cuantizada MLX q8 para despliegue eficiente en Apple Silicon.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LLaMA-style (RoPE θ=1.000.000, GQA 32Q/8KV, SwiGLU, RMSNorm) |
| Parametros totales | 9.152.319.488 (9.15B) |
| Parametros activos | No disponible (modelo denso, no MoE) |
| Longitud de contexto | 32.768 tokens |
| Tipos de cuantizacion | bf16 (repo principal), MLX q8 (patak-mlx) |
| Idiomas soportados | Hungaro (principal); otros idiomas heredados de EuroLLM-9B |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (HF), MLX q8 |

## Arquitectura y entrenamiento

Patak parte del modelo base EuroLLM-9B, que es un modelo multilingue europeo con vocabulario SentencePiece de 128.000 tokens y una arquitectura LLaMA-style. Sobre esta base se realizo un continuado de preentrenamiento (CPT) ligero con 5,1 millones de tokens hungaros durante 5.000 iteraciones, con una perdida de validacion de 1,857. Segun la documentacion del autor, el corpus disponible en disco era de unos 3.700 millones de tokens, pero se usó un presupuesto reducido que fue suficiente para alcanzar los resultados de esta version.

Posteriormente se aplico un ajuste fino supervisado (SFT) de una epoca sobre el corpus `instruct_v18b`, compuesto por 4.914 filas que cubren persona, seguridad, codigo y depuracion de codigo, razonamiento multi-paso, restricciones compuestas, refinamiento multi-turno y anti-repeticion. El SFT se realizo con LoRA de rango 16 y escala 32, dropout 0,1, tasa de aprendizaje 1,5e-5 y entrenando las 42 capas junto con el `lm_head`. Finalmente, una fase de DPO liviana (120 iteraciones) sobre 36 pares de preferencias escritos a mano corrigio problemas residuales de persona, anti-repeticion y calibracion de honestidad. La version bf16 publicada se desentrenó de una cadena de entrenamiento en q8, y el proyecto considera esa conversion casi sin perdidas.

## Capacidades

- Generacion de texto e instrucciones en hungaro, con soporte de plantilla de chat ChatML y tokens de fin `</s>` y `<|im_end|>`.
- Razonamiento multi-paso, incluido el manejo de restricciones compuestas y tareas que requieren multiples pasos logicos.
- Generacion de codigo y depuracion de codigo, según la composicion del corpus SFT.
- Conversaciones multi-turno con gestion de historial completo, siempre que se pase la historia completa al modelo.
- Capacidad multilingue heredada de EuroLLM-9B, que permite trabajar con otros idiomas europeos ademas del hungaro.
- Alineacion mediante DPO orientada a honestidad, persona coherente y reduccion de alucinacion y repeticion.
- Ejecucion optimizada en Apple Silicon mediante el formato MLX q8, con un uso de memoria de aproximadamente 9,1 GB.

## Casos de uso

- Atencion al cliente en hungaro: el modelo puede gestionar conversaciones multi-turno de soporte tecnico o atencion administrativa, aprovechando su ventana de contexto de 32.768 tokens para mantener el historial completo de la interaccion. Su alineacion con DPO ayuda a mantener respuestas honestas y no repetitivas.
- Generacion de codigo para desarrollo en hungaro: gracias a su entrenamiento en codigo y depuracion, puede asistir a programadores en tareas de revision de codigo, explicacion de fragmentos o depuracion de errores, como parte de un asistente integrado en un IDE o pipeline de CI.
- Redaccion editorial y correccion de textos: es util para generar articulos, resumir documentos largos o corregir textos en hungaro, dado su entrenamiento con restricciones compuestas y su capacidad de seguir instrucciones detalladas.
- Asistente educativo para estudiantes hungaros: puede resolver problemas de matematicas o explicar conceptos complejos mediante razonamiento multi-paso, actuando como tutor personalizado en entornos de aprendizaje.
- Analisis de documentos administrativos o legales: su capacidad para procesar contextos largos permite resumir contratos, informes o normativas en hungaro, extrayendo clausulas y fechas de forma estructurada.
- Traduccion asistida hungaro-a-otros idiomas: al heredar el conocimiento multilingue de EuroLLM-9B, puede apoyar la traduccion o reformulacion de textos entre hungaro y otros idiomas europeos, aunque su rendimiento fuera del hungaro no es su punto fuerte.

## Benchmarks y rendimiento

La model card del autor proporciona resultados de benchmarks internos de la familia Emese, no estandarizados externamente.

| Benchmark | Resultado |
|---|---|
| Ultimate Bench (0-250) | 218/250 (87%) |
| BlindSpot Bench (0-376) | 302/376 |
| emese-bench v1 (0-500, MLX q8) | 413/500 (83%) |

El modelo consigue una tasa de rechazo del 100% en pruebas de seguridad. Los puntos debiles identificados son el refinamiento multi-turno (revisar una respuesta bajo una nueva restriccion) y cierta confabulacion factual en nombres y fechas poco conocidos. No se han publicado resultados de benchmarks estandarizados como MMLU, HumanEval o GSM8K en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: aproximadamente 18,3 GB de peso mas overhead de ejecucion, por lo que se recomienda una GPU con al menos 24 GB de VRAM.
- VRAM estimada con MLX q8: aproximadamente 9,1 GB de peso, lo que permite ejecucion fluida en Mac con Apple Silicon.
- GPU recomendadas: NVIDIA A100 40GB, H100 80GB, RTX 4090 24GB o similar. En Apple Silicon, todos los chips M1/M2/M3 con suficiente memoria unificada.
- Opciones de despliegue: transformers para uso en Python y MLX con `mlx_lm` en Apple Silicon. No se recomienda usar llama.cpp o GGUF, ya que el proyecto detecto una regresion consistente de 14-27 puntos en Ultimate Bench al servir mediante essa via, independientemente de la cuantizacion.
- Latencia y throughput desconocidos; no se han publicado mediciones de rendimiento de inferencia en la documentacion disponible.

## Comparativa con modelos similares

No se han proporcionado datos de benchmarks ni especificaciones de modelos comparables, como EuroLLM-9B u otros modelos hungaros, en la informacion disponible. La comparativa externa queda por tanto no disponible.

## Limitaciones y advertencias

- Puede alucinar datos concretos como fechas o atribuciones; es necesario verificar la informacion critica antes de usar sus respuestas en produccion.
- El refinamiento multi-turno, es decir, revisar una respuesta bajo una nueva restriccion, es un punto debil conocido frente a la calidad de respuestas de un solo turno.
- Es un modelo centrado en hungaro; la calidad en otros idiomas hereda las limitaciones de EuroLLM-9B y no es su principal fortaleza.
- No se recomienda convertir los pesos a GGUF ni servirlo mediante llama.cpp, puesto que la investigacion interna del autor encontro una degradacion consistente en los benchmarks al usar esa via de inferencia. Usar siempre transformers o MLX.
- La licencia Apache-2.0 permite uso comercial sin restricciones, pero no hay garantias de rendimiento ni soporte por parte del autor. El modelo es una construccion experimental con un presupuesto de entrenamiento reducido en la fase CPT.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/emese-tech/patak
- Sitio web del proyecto: https://emese.tech/patak
- Dataset del corpus: https://huggingface.co/datasets/emese-tech/patak-corpus
- Repositorio del modelo base: https://huggingface.co/utter-project/EuroLLM-9B
