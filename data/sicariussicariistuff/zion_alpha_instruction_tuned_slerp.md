# SicariusSicariiStuff/Zion_Alpha_Instruction_Tuned_SLERP

## Resumen

Zion_Alpha_Instruction_Tuned_SLERP es un modelo de lenguaje de 7.241.732.096 parametros (aproximadamente 7,2 mil millones) especializado en hebreo e ingles, desarrollado por el usuario independiente SicariusSicariiStuff. Se trata de un merge por SLERP (Spherical Linear Interpolation) de pesos derivado de la familia Zion_Alpha, que a su vez parte de la arquitectura Mistral 7B. El autor lo presenta como el primer modelo "real" de hebreo y lo posiciona como un experimento para demostrar que los modelos de 7B pueden alcanzar un rendimiento competitivo en hebreo frente a alternativas mucho mayores.

La relevancia del modelo radica en su enfoque: un desarrollador individual, entrenando en hardware propio (on-premises), consigue resultados destacados en tareas de hebreo con un modelo de tamano contenido. Segun la model card, la version base Zion_Alpha alcanzo una puntuacion SNLI de 84,05 en hebreo entre modelos open source, y esta version instruction-tuned SLERP logro la mejor puntuacion de analisis de sentimiento en hebreo (70,3) el 10 de junio de 2024, superando a un modelo de 35B cinco veces mayor.

El modelo mantiene el tokenizer original de Mistral 7B sin modificaciones, lo que limita la eficiencia en hebreo pero simplifica su integracion en el ecosistema transformers. Se distribuye bajo licencia Apache 2.0, con pesos en safetensors y una version GGUF disponible en un repositorio separado. Es un modelo de nicho, orientado a experimentacion e investigacion en procesamiento de lenguaje natural en hebreo, no a despliegues de produccion a gran escala.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (basada en Mistral 7B) |
| Parametros totales | 7.241.732.096 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (heredada de Mistral 7B, no confirmada en la model card) |
| Tipos de cuantizacion | FP16 (principal); GGUF disponible en repositorio separado (Zion_Alpha_Instruction_Tuned_GGUF) |
| Idiomas soportados | Ingles (en) y hebreo (he) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura es un transformer decoder-only basada en Mistral 7B, sin modificaciones en el tokenizer original de Mistral. El modelo es el resultado de un merge por SLERP (interpolacion esferica lineal) de pesos, una tecnica de model merging que combina los parametros de dos o mas modelos entrenados para producir un modelo intermedio que suele conservar capacidades de ambos. En este caso, el merge se aplica sobre la familia Zion_Alpha, que previamente fue fine-tuneada para tareas de instruccion.

El autor no detalla en la model card el volumen de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF o DPO. Menciona que el modelo base original se entreno aproximadamente dos meses despues del lanzamiento de Mistral v0.1, y que el fine-tuning de instrucciones se realizo con "tecnicas SOTA" sin especificar cuales. No se han publicado papers tecnicos ni documentacion adicional sobre el proceso de entrenamiento. El autor indica que todo el trabajo se realizo en hardware propio y que busca patrocinio para adquirir una GPU A6000 con el fin de entrenar modelos mayores.

## Capacidades

- Generacion de texto conversacional en ingles y hebreo.
- Razonamiento basico y respuesta a instrucciones (modelo instruction-tuned).
- Traduccion ingles-hebreo y hebreo-ingles (se muestran ejemplos en la model card).
- Analisis de sentimiento en hebreo (puntuacion de 70,3 reportada por el autor).
- Inferencia textual en hebreo (puntuacion SNLI de 84,05 en la version base).
- Soporte de plantilla de instrucciones estilo Mistral ([INST] ... [/INST]).
- No se documenta soporte de tool calling, function calling, agentes, vision, audio ni modo thinking.
- Capacidades multilingues limitadas a ingles y hebreo; el tokenizer de Mistral no esta optimizado para hebreo.

## Casos de uso

- Procesamiento de lenguaje natural en hebreo: el modelo permite tareas de clasificacion, analisis de sentimiento y extraccion de informacion en hebreo, un idioma con escasa cobertura en modelos open source. Es adecuado por su entrenamiento especifico y sus resultados reportados en SNLI y sentimiento.
- Traduccion automatica ingles-hebreo: se puede emplear para traduccion bidireccional en entornos de investigacion o prototipado, usando la plantilla de instrucciones Mistral y los ejemplos de la model card como referencia.
- Chatbot conversacional en hebreo: con la plantilla [INST] y los parametros de muestreo recomendados (temperature 1, top_k 1), puede gestionar conversaciones multi-turno en hebreo para prototipos y demos.
- Investigacion academica sobre LLMs en hebreo: sirve como baseline o punto de comparacion en estudios sobre rendimiento de modelos 7B en idiomas de bajos recursos, dado que el autor publica puntuaciones SNLI y de sentimiento.
- Experimentacion con model merging: el modelo es un ejemplo practico de merge SLERP sobre Mistral 7B, util para investigadores que estudien tecnicas de interpolacion de pesos y su efecto en tareas especificas.
- Generacion de contenido asistida en hebreo: redaccion de textos, resumenes o respuestas en hebreo en entornos controlados, con supervision humana dada la tendencia a la alucinacion de los modelos 7B.
- Despliegue local en hardware de consumo: al ser un modelo de 7B en FP16 (aproximadamente 14,5 GB) o en GGUF cuantizado, puede ejecutarse en GPUs consumer para pruebas y desarrollo offline.

## Benchmarks y rendimiento

| Benchmark | Modelo | Puntuacion | Notas |
|---|---|---|---|
| SNLI (hebreo) | Zion_Alpha (base) | 84,05 | Mejor puntuacion entre modelos open source en hebreo segun el autor (junio 2024) |
| Analisis de sentimiento (hebreo) | Zion_Alpha_Instruction_Tuned_SLERP | 70,3 | Mejor puntuacion reportada por el autor (10 de junio de 2024), superando a un modelo de 35B |
| SNLI (hebreo) | Zion_Alpha_Instruction_Tuned_SLERP | inferior a 84,05 | El autor indica que el merge SLERP obtuvo una puntuacion SNLI menor que la base |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible. Las puntuaciones anteriores son reportadas por el autor en la model card y no han sido verificadas de forma independiente.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16: aproximadamente 14,5 GB (coincide con el tamano del repositorio), por lo que requiere una GPU con al menos 16 GB para cargar el modelo completo.
- VRAM estimada en cuantizacion GGUF: no disponible en la informacion proporcionada; depende del nivel de cuantizacion del repositorio GGUF.
- GPUs recomendadas: A100, H100 o A6000 para inferencia en FP16 sin problemas; RTX 4090 (24 GB) y RTX 3090 (24 GB) pueden alojar el modelo en FP16.
- GPU consumer: cabe en RTX 4090 y RTX 3090 en FP16; en GPUs de 8-12 GB seria necesario usar cuantizacion GGUF (no se detallan los niveles disponibles).
- Opciones de despliegue: transformers (libreria principal), text-generation-inference (tag endpoints_compatible), llama.cpp/Ollama mediante el repositorio GGUF, y vLLM para servir el modelo en FP16.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Notas |
|---|---|---|---|---|---|
| Zion_Alpha_Instruction_Tuned_SLERP | 7,24B | no disponible | en, he | Apache 2.0 | Especializado en hebreo; merge SLERP de Mistral 7B |
| Mistral 7B Instruct | 7,24B | 8K (segun Mistral) | en (principalmente) | Apache 2.0 | Base arquitectonica; sin entrenamiento especifico en hebreo |
| Modelo de 35B citado por el autor | 35B | no disponible | he (presuntamente) | no disponible | Superado por Zion_Alpha en sentimiento segun el autor; sin identificar en la model card |

La comparativa con alternativas especificas en hebreo no esta disponible en la informacion proporcionada. El unico punto de comparacion documentado es el modelo de 35B mencionado por el autor, del que no se ofrece nombre ni detalles tecnicos.

## Limitaciones y advertencias

- El tokenizer es el original de Mistral 7B, no adaptado al hebreo, lo que reduce la eficiencia en la tokenizacion de texto hebreo y puede afectar al rendimiento y al coste computacional.
- Los benchmarks reportados (SNLI 84,05 y sentimiento 70,3) son aportados por el autor sin verificacion independiente ni publicacion de la metodologia.
- Riesgo de alucinacion propio de un modelo de 7B; no se documentan tecnicas de mitigacion como RLHF o DPO.
- Capacidades limitadas a ingles y hebreo; no se garantiza un rendimiento adecuado en otros idiomas.
- No se documenta soporte de tool calling, agentes ni funciones avanzadas, lo que limita su uso en pipelines de produccion complejos.
- La model card contiene afirmaciones promocionales no verificadas ("primer modelo real de hebreo", "record mundial") que deben tomarse con cautela.
- El autor indica que sera su ultimo modelo en hebreo por un tiempo, por lo que no se esperan actualizaciones ni soporte a largo plazo.
- Licencia Apache 2.0 permite uso comercial, pero la falta de documentacion sobre el dataset de entrenamiento impide verificar la procedencia de los datos y posibles sesgos.
- El modelo se creo en junio de 2024 y la fecha de actualizacion del repositorio es noviembre de 2026; no se detalla que cambios se realizaron en esa actualizacion.

## Enlaces

- [Hugging Face: Zion_Alpha_Instruction_Tuned_SLERP](https://huggingface.co/SicariusSicariiStuff/Zion_Alpha_Instruction_Tuned_SLERP)
- [Modelo base FP16: Zion_Alpha](https://huggingface.co/SicariusSicariiStuff/Zion_Alpha)
- [Version instruction-tuned FP16: Zion_Alpha_Instruction_Tuned](https://huggingface.co/SicariusSicariiStuff/Zion_Alpha_Instruction_Tuned)
- [Version GGUF: Zion_Alpha_Instruction_Tuned_GGUF](https://huggingface.co/SicariusSicariiStuff/Zion_Alpha_Instruction_Tuned_GGUF)
- [Ko-fi del autor](https://ko-fi.com/sicarius)
- [Patreon del autor](https://patreon.com/TenebraAI)
- Contacto: sicariussicariistuff@gmail.com
