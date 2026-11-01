# OfflineBase/Glimmer-30B-2026-Knowledge

## Resumen

Glimmer 30B 2026 Knowledge es un ajuste fino (fine-tune) de la comunidad sobre el modelo base Muse Glimmer 30B de Meta, desarrollado por OfflineBase. Su objetivo es doble: ampliar el conocimiento del modelo con noticias y eventos ocurridos entre el 4 de enero y el 29 de octubre de 2026, y mejorar su calibración para que admita desconocimiento ("no lo sé") en lugar de inventar respuestas. El modelo base tiene un corte de conocimiento del 4 de enero de 2026, por lo que este fine-tune extiende efectivamente su ventana temporal casi diez meses.

Arquitectura y tamano: se trata de un transformer multimodal de 29.776.626.688 parámetros (aproximadamente 30B), con capacidad image-text-to-text, distribuido en pesos BF16 en formato safetensors (59,6 GB de repositorio). El autor no detalla en la información disponible la longitud de contexto, la composición exacta del dataset de entrenamiento ni los hiperparámetros del ajuste LoRA, aunque sí indica que los pesos publicados son el resultado de fusionar el adaptador LoRA con el modelo base de Meta.

La relevancia de este modelo radica en su enfoque poco habitual: no busca superar al base en razonamiento, sino en actualidad y honestidad epistémica. Según la model card, mejora del 26,0% al 69,1% en preguntas sobre titulares de 2026, y del 26,3% al 44,7% en reconocer que no puede saber algo o corregir premisas falsas. Es, por tanto, un caso de estudio interesante sobre actualización de conocimiento y mitigación de alucinaciones mediante fine-tuning, con limitaciones significativas que se detallan más abajo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (image-text-to-text), basada en Muse Glimmer 30B |
| Parametros totales | 29.776.626.688 (~30B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | BF16 (pesos publicados); GGUF Q4_K_M (16,9 GB) e IQ2_XXS (7,96 GB) en repo separado; bnb-4bit para QLoRA |
| Idiomas soportados | inglés (en) |
| Licencia | Apache 2.0 + Muse Model License (license: other) |
| Formato de pesos | safetensors (BF16); GGUF en repo aparte |

## Arquitectura y entrenamiento

El modelo es un fine-tune del base Muse Glimmer 30B de Meta, un transformer multimodal de unos 30B parámetros que procesa texto e imágenes (pipeline image-text-to-text). El ajuste se realizó mediante LoRA, cuyos pesos se fusionaron posteriormente con los del modelo base, dando lugar a un checkpoint BF16 con los mismos nombres y formas de tensor que el original, lo que facilita su uso con transformers y su posterior fine-tuning.

El entrenamiento se centró en un dataset propio, OfflineBase/Glimmer-30B-2026-Knowledge-Data, orientado a noticias y eventos de 2026 (etiquetas knowledge-update y 2026-news). La model card no especifica el número de tokens de entrenamiento, la composición exacta del dataset ni si se emplearon técnicas de RLHF o DPO. Sí se indica que el modelo fue construido con "Muse Spark Open" y que no es un lanzamiento oficial de Meta ni está revisado o respaldado por la compañía. Una innovación destacable, más de evaluación que de arquitectura, es el énfasis en la calibración: el autor reporta mejoras sustanciales en la tasa de respuestas "no lo sé" y en la corrección de premisas falsas, aunque con resultados mixtos.

## Capacidades

- Generación de texto conversacional en inglés, con soporte multi-turno.
- Procesamiento de imagen y texto (image-text-to-text), heredado del modelo base.
- Razonamiento multi-paso: según la model card, resuelve 147 de 150 problemas multi-paso con razonamiento activado (el base resuelve 150).
- Generación de código, JSON e instrucciones: pasa las 60 comprobaciones de habilidad del autor (igual que el base).
- Conocimiento actualizado de eventos de 2026 (enero a octubre), con una tasa de acierto del 69,1% en titulares según la evaluación del autor.
- Mayor tendencia a admitir desconocimiento o corregir premisas falsas (44,7% frente a 26,3% del base).
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Capacidades de agente autónomo: no disponible en la información proporcionada.
- Multilingüismo: limitado a inglés según la model card.
- Modo "thinking" o razonamiento explícito: la model card menciona ejecuciones "con razonamiento activado" y "desactivado", lo que sugiere un modo de razonamiento configurable, aunque no se detalla su funcionamiento.

## Casos de uso

- Respuesta a preguntas sobre actualidad de 2026: el modelo puede responder consultas sobre eventos ocurridos entre enero y octubre de 2026 con una tasa de acierto notablemente superior al base (69,1% frente a 26,0% en titulares), lo que lo hace útil para prototipos de asistentes informativos con conocimiento temporal acotado.
- Mitigación de alucinaciones en atención al cliente: su mayor propensión a decir "no lo sé" (44,7% frente a 26,3%) lo hace adecuado para escenarios donde es preferible admitir desconocimiento a inventar datos, como consultas sobre políticas o productos no cubiertos.
- Evaluación de calibración y honestidad en investigación: sirve como caso de estudio para investigadores que analizan cómo el fine-tuning afecta a la tasa de abstención y a la corrección de premisas falsas en modelos de ~30B.
- Base para fine-tuning posterior: al publicarse los pesos fusionados en BF16 con los mismos nombres y formas de tensor que el base, es adecuado como punto de partida para nuevos ajustes con transformers o QLoRA (existe una copia pre-cuantizada bnb-4bit).
- Despliegue en entornos con recursos limitados: las versiones GGUF Q4_K_M (16,9 GB) e IQ2_XXS (7,96 GB) permiten ejecución con llama.cpp en hardware de consumo, con una degradación de rendimiento medida (28,8% y 17,1% respectivamente en el test de 2.500 preguntas reformuladas).
- Procesamiento de documentos con imágenes: gracias a su naturaleza image-text-to-text heredada del base, puede emplearse en tareas de extracción o descripción de contenido visual combinado con texto, aunque no se detallan métricas específicas de visión.
- Generación de código y JSON en pipelines: al mantener las 60 comprobaciones de habilidad del base en código, JSON e instrucciones, puede integrarse en tareas de generación estructurada, aunque sin datos de tool calling disponibles.

## Benchmarks y rendimiento

| Prueba | Este modelo (BF16) | Base Muse Glimmer 30B | Notas |
|---|---|---|---|
| Titulares de 2026 (246 preguntas) | 69,1% | 26,0% | Base evaluado en Q4_K_M |
| Preguntas reformuladas sobre pasajes de 2026 (2.500) | 29,0% | 18,4% | |
| Reconoce que no puede saber o corrige premisa falsa (190) | 44,7% | 26,3% | Preguntas reservadas y evaluadas a ciegas |
| De esas, eventos posteriores al 29 de octubre de 2026 (70) | 67,1% | 24,3% | |
| Comprobaciones de hechos previos a 2026 (40) | 40/40 | 40/40 | |
| Problemas multi-paso con razonamiento (150) | 147/150 | 150/150 | |
| Comprobaciones de habilidad en código, JSON, instrucciones y chat multi-turno (60) | 60/60 | 60/60 | |
| Q4_K_M en preguntas reformuladas (2.500) | 28,8% | no disponible | GGUF 16,9 GB |
| IQ2_XXS en preguntas reformuladas (2.500) | 17,1% | no disponible | GGUF 7,96 GB; base Q4_K_M: 18,4% |

El autor indica que, en tareas de razonamiento de la misma ejecución, Qwen3.8 27B y Gemma 4 31B igualan o superan a este modelo. Asimismo, señala que en eventos de 2026 Qwen3.8 27B, Gemma 4 31B y Granite 4.2 30B obtienen 7 o menos aciertos sobre 100 (frente a ~70 de este modelo), aunque con la salvedad de que sus datos no cubren 2026 y "no lo sé" sería la respuesta honesta para ellos. Todas las puntuaciones usan decodificación greedy (temperatura 0).

## Requisitos de hardware

- VRAM estimada para inferencia en BF16: aproximadamente 60 GB solo para pesos, más overhead de activaciones y KV cache; requiere GPUs de 80 GB (A100 80GB, H100 80GB) o múltiples GPUs.
- VRAM estimada en Q4_K_M (16,9 GB): cabe en GPUs de 24 GB (RTX 3090, RTX 4090) y en configuraciones de 32 GB o más con margen para contexto.
- VRAM estimada en IQ2_XXS (7,96 GB): cabe en GPUs de 12 GB e incluso en algunas de 8 GB con contexto reducido.
- GPUs recomendadas: A100 80GB o H100 para BF16; RTX 4090/3090 para Q4_K_M; GPUs de consumo de gama media para IQ2_XXS.
- Despliegue: transformers para BF16; llama.cpp para los GGUF; la model card menciona compatibilidad con endpoints (tag endpoints_compatible) y una copia bnb-4bit para QLoRA con Unsloth. No se mencionan vLLM ni TGI en la información disponible.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Conocimiento 2026 (titulares) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Glimmer 30B 2026 Knowledge | ~30B | no disponible | 69,1% (BF16) / ~70/100 (Q4_K_M) | Apache 2.0 + Muse Model License | HuggingFace (BF16, GGUF, LoRA, bnb-4bit) |
| Muse Glimmer 30B (base) | ~30B | no disponible | 26,0% | Muse Model License | HuggingFace (Meta) |
| Qwen3.8 27B | 27B | no disponible | ≤7/100 | no disponible | no disponible |
| Gemma 4 31B | 31B | no disponible | ≤7/100 (datos hasta enero 2025) | no disponible | no disponible |
| Granite 4.2 30B | 30B | no disponible | ≤7/100 | no disponible | no disponible |

La comparativa se basa en los datos aportados por el autor del fine-tune; no se dispone de información independiente sobre los modelos alternativos en el contexto de esta ficha. En tareas de razonamiento, Qwen3.8 27B y Gemma 4 31B igualan o superan a este modelo según la model card.

## Limitaciones y advertencias

- Alucinaciones frecuentes: en las 190 preguntas reservadas, inventó una respuesta el 55,3% de las veces (el base, el 70,0%). Sigue siendo una tasa alta para producción.
- Premisas falsas: no mejora al base en este aspecto; acepta premisas falsas el 80% de las veces.
- Exceso de rechazo: rechaza más preguntas ordinarias que el base (18% frente a 6%), lo que puede degradar la experiencia en uso conversacional general.
- El razonamiento activado aumenta las invenciones: el autor recomienda desactivar el razonamiento para consultas factuales.
- Idioma: solo inglés; no hay soporte multilingüe declarado.
- Licencia: Apache 2.0 combinada con la Muse Model License, que impone condiciones adicionales; no está destinado a menores de 18 años. Es necesario revisar el archivo MUSE_MODEL_LICENSE.md antes de uso comercial.
- No es un lanzamiento oficial de Meta: es un fine-tune de la comunidad, no revisado ni respaldado por Meta, lo que implica ausencia de garantías y soporte.
- Evaluación parcialmente sesgada: el autor seleccionó y calificó personalmente los 246 titulares, y muchas respuestas de noticias aparecen en las páginas de Wikipedia usadas en el entrenamiento; además, el revisor de la comparativa con otros modelos no era ciego a qué modelo estaba leyendo.
- Degradación en cuantización agresiva: IQ2_XXS (17,1%) queda por debajo del base en Q4_K_M (18,4%) en el test de 2.500 preguntas.
- Datos no disponibles: longitud de contexto, composición del dataset, hiperparámetros de entrenamiento y soporte de tool calling no se especifican en la información proporcionada.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/OfflineBase/Glimmer-30B-2026-Knowledge
- GGUF: https://huggingface.co/OfflineBase/Glimmer-30B-2026-Knowledge-GGUF
- Adaptador LoRA: https://huggingface.co/OfflineBase/Glimmer-30B-2026-Knowledge-LoRA
- Copia bnb-4bit para QLoRA: https://huggingface.co/OfflineBase/Glimmer-30B-2026-Knowledge-unsloth-bnb-4bit
- Dataset: https://huggingface.co/datasets/OfflineBase/Glimmer-30B-2026-Knowledge-Data
- Licencia Muse Model License: https://huggingface.co/OfflineBase/Glimmer-30B-2026-Knowledge/blob/main/MUSE_MODEL_LICENSE.md
- Modelo base: https://huggingface.co/meta-models/Muse-Glimmer-30B
- Fuente del ejemplo sobre Nvidia (Q4 2026): https://thetechportal.com/2026/02/26/nvidia-q4-revenue-surges-73-to-68bn-beating-estimates/
- Fuente del ejemplo sobre OpenAI: https://en.wikipedia.org/wiki/OpenAI
- Fuente del ejemplo sobre Artemis II: https://en.wikipedia.org/wiki/2026
