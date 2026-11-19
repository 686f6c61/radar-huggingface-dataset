# reaperdoesntknow/Dualmind-Qwen-1.7B-Thinking

## Resumen

Dualmind-Qwen-1.7B-Thinking es un modelo de lenguaje de 1.700 millones de parámetros efectivos (2.031.739.904 según los pesos en safetensors) desarrollado por reaperdoesntknow bajo el sello Convergent Intelligence LLC. Se trata de un ajuste fino por supervisión (SFT) del modelo Disctil-Qwen3-1.7B, que a su vez deriva de la cadena de destilación DistilQwen sobre Qwen3-1.7B. El objetivo declarado es destilar trazas de razonamiento extendido de Claude Opus 4.6 en un modelo pequeño orientado a dispositivos edge.

La propuesta metodológica, bautizada como DualMind SFT, consiste en entrenar al estudiante con cadenas de deliberación de un profesor frontier (unas 2,5 millones de tokens procedentes del dataset Opus-4.6-Reasoning-3000x-filtered, con rechazos eliminados) para que absorba no solo respuestas correctas, sino la estructura del proceso: exploración, autoexamen, backtracking y síntesis. El autor sostiene que este bucle cognitivo emerge como señal de entrenamiento en lugar de como truco arquitectónico.

Es relevante para quienes buscan un modelo compacto con comportamiento de razonamiento multi-fase desplegable en hardware modesto, con licencia Apache 2.0 y contexto de 40.960 tokens. No obstante, la información pública es limitada: no hay benchmarks publicados y el modelo acumula muy pocas descargas y likes, por lo que debe tratarse como un artefacto de investigación más que como una opción consolidada para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3ForCausalLM (transformer decoder-only con GQA) |
| Parametros totales | 2.031.739.904 (~2,03B; 1,7B efectivos según el autor) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 40.960 tokens (max position); entrenado con secuencias de 4.096 |
| Tipos de cuantizacion | no disponible en la model card; pesos publicados en BF16 (compatible con GGUF/AWQ vía herramientas externas) |
| Idiomas soportados | inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (BF16) |

Otras especificaciones declaradas: hidden size 2048, 28 capas, 16 cabezas de atención Q y 8 KV (GQA), intermediate size 6144, dimensión de cabeza 128, vocabulario de 151.936 tokens, activación SiLU.

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only estándar de la familia Qwen3, con atención de consultas agrupadas (GQA) para reducir el coste de caché KV. No incorpora innovaciones arquitectónicas propias: la singularidad reside en el proceso de ajuste. El entrenamiento se realizó con TRL SFTTrainer en precisión BF16 sobre una NVIDIA H100, con longitud máxima de secuencia de 4.096 tokens, 512 pasos totales y aproximadamente 7,4 épocas sobre unas 2,5 millones de tokens adicionales del dataset Opus-4.6-Reasoning-3000x-filtered. La pérdida de entrenamiento pasó de 1,744 a 1,455, con pérdida de evaluación final de 1,406 (por debajo de la de entrenamiento, lo que el autor interpreta como ausencia de sobreajuste) y una precisión de token que subió del 61,0% al 67,8%.

La tesis del autor es que la destilación de trazas de un profesor frontier transfiere el "shape of deliberation": el estudiante aprende a retroceder cuando una línea de razonamiento se debilita, a matizar y a sintetizar varios enfoques. La model card no documenta uso de RLHF ni DPO, ni decodificación especulativa, ni atención lineal; el único mecanismo destacable es la metodología DualMind SFT aplicada sobre una base ya refinada mediante la cadena DISC/DistilQwen.

## Capacidades

- Generación de texto conversacional en inglés con plantilla de chat compatible con `apply_chat_template`.
- Razonamiento extendido multi-fase: el modelo puede producir cadenas que exploran, reconsideran y concluyen, comportamiento que el autor presenta como efecto buscado del entrenamiento.
- Autocrítica y backtracking dentro de la traza de razonamiento, absorbidos de las trazas del profesor.
- Generación de texto largo: la ventana de entrenamiento de 4.096 tokens y el contexto de 40.960 permiten respuestas de 1.024 a 2.048 tokens recomendadas por el autor.
- Soporte de tool calling / function calling: no disponible (no documentado).
- Soporte de agentes y razonamiento multi-paso orquestado: no disponible (no documentado).
- Capacidades multilingües: limitadas al inglés según la model card.
- Capacidades especiales: modo "thinking" implícito, sin tokens de control documentados; sin visión ni audio.

## Casos de uso

- Razonamiento en dispositivos edge: con ~2B parámetros en BF16 (unos 4 GB de pesos) el modelo cabe en GPUs de consumo y en placas con 8 GB de VRAM, lo que permite ejecutar cadenas de deliberación localmente sin depender de la nube.
- Prototipado de pipelines de razonamiento: útil para experimentar con prompting que exige autocrítica y backtracking antes de escalar a modelos mayores, gracias a su comportamiento multi-fase entrenado.
- Generación de explicaciones paso a paso en inglés: adecuado para producir borradores de razonamiento en tareas analíticas donde interesa ver el proceso y no solo la respuesta, con ventanas de hasta 2.048 tokens nuevos.
- Investigación en destilación de conocimiento: sirve como caso de estudio reproducible de DualMind SFT sobre trazas de Opus 4.6, con hiperparámetros y curvas de pérdida publicados.
- Asistente conversacional de bajo coste: para chats multi-turno en inglés donde el contexto no supere decenas de miles de tokens, desplegable con vLLM o TGI en una sola GPU.
- Filtrado y reescritura de textos largos: el dataset secundario LongWriter-6k y la ventana de 40.960 tokens permiten tareas de síntesis o reescritura de documentos extensos en inglés.
- Base para ajustes posteriores: al estar bajo Apache 2.0 y en safetensors, puede servir como punto de partida para fine-tuning específico de dominio sin restricciones de licencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card únicamente reporta métricas de entrenamiento: pérdida de entrenamiento de 1,744 a 1,455, pérdida de evaluación de 1,406 y precisión de token del 61,0% al 67,8%. No hay datos de MMLU, HumanEval, GSM8K ni comparaciones numéricas con otros modelos.

## Requisitos de hardware

- VRAM estimada en BF16: unos 4,1 GB solo para pesos; con caché KV para 4.096 tokens y overhead de runtime, entre 6 y 8 GB.
- VRAM estimada en cuantización de 8 bits: alrededor de 2,1 GB de pesos; en 4 bits, alrededor de 1,1 GB, más caché KV.
- GPU recomendadas: NVIDIA H100 o A100 para entrenamiento o serving de alta concurrencia; RTX 4090, RTX 3090, RTX 4080 o RTX 4070 Ti para inferencia local en BF16.
- Cabe en GPU de consumo: sí, en tarjetas con 8 GB o más en BF16 y en tarjetas de 4-6 GB con cuantización de 8 o 4 bits.
- Opciones de despliegue: transformers (documentado por el autor), vLLM, TGI (el repo incluye la etiqueta text-generation-inference y endpoints_compatible), llama.cpp/Ollama si se generan pesos GGUF con herramientas externas.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Dualmind-Qwen-1.7B-Thinking | ~2,03B | 40.960 | Apache 2.0 | SFT sobre trazas de Opus 4.6; sin benchmarks publicados |
| Qwen3-1.7B (base original) | 1,7B | 32.768 (según ficha estándar de Qwen3) | Apache 2.0 | Modelo base de la cadena; sin destilación de razonamiento |
| Disctil-Qwen3-1.7B | 1,7B | no disponible | no disponible | Ancestro directo del modelo; refinamiento DISC |
| DualMind (variante LogicInference) | ~1,7B | no disponible | no disponible | Misma metodología con profesor LogicInference; razonamiento más mecánico |

La comparación cuantitativa de rendimiento no está disponible: ninguno de los modelos de la familia DualMind publica resultados de benchmarks en la información consultada.

## Limitaciones y advertencias

- Solo soporta inglés de forma declarada; el rendimiento en castellano u otros idiomas no está evaluado.
- Riesgo de alucinación: es un modelo de 1,7B parámetros; las trazas de razonamiento absorbidas no garantizan corrección factual y pueden producir cadenas plausibles pero erróneas.
- Sesgos conocidos: no documentados; el dataset de trazas proviene de un único profesor (Claude Opus 4.6) y puede heredar sus sesgos y estilo, además de estar filtrado para eliminar rechazos, lo que puede reducir salvaguardas.
- La eliminación de rechazos en el dataset de entrenamiento implica que el modelo puede ser menos propenso a declinar peticiones problemáticas; requiere moderación externa en producción.
- Contexto: aunque la posición máxima es 40.960 tokens, el entrenamiento se hizo con secuencias de 4.096, por lo que el rendimiento más allá de esa longitud es incierto.
- Riesgo de bucles en cadenas de razonamiento largas; el autor recomienda repetition penalty de 1,1-1,2.
- Sin benchmarks publicados ni validación independiente; con 2.095 descargas y 1 like, la adopción es muy limitada y no hay evidencia de robustez en producción.
- Licencia Apache 2.0: permite uso comercial, pero el usuario debe verificar el cumplimiento de las condiciones de los datasets de origen (Opus-4.6-Reasoning-3000x-filtered y LongWriter-6k), cuyas licencias no se detallan en la información proporcionada.
- La model card está truncada en el fragmento disponible; pueden existir detalles adicionales no recogidos aquí.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/reaperdoesntknow/Dualmind-Qwen-1.7B-Thinking
- Modelo base: https://huggingface.co/reaperdoesntknow/DualMinded-Qwen3-1.7B
- Ancestro Disctil-Qwen3-1.7B: https://huggingface.co/reaperdoesntknow/Disctil-Qwen3-1.7B
- Variante DualMind (LogicInference): https://huggingface.co/reaperdoesntknow/DualMind
- Variante TopologicalQwen: https://huggingface.co/reaperdoesntknow/TopologicalQwen
- Dataset de razonamiento: https://huggingface.co/datasets/nohurry/Opus-4.6-Reasoning-3000x-filtered
- Dataset LongWriter-6k: https://huggingface.co/datasets/zai-org/LongWriter-6k
