# OfflineBase/Muse-Glimmer-30B-2026-Knowledge-GGUF

## Resumen

Muse Glimmer 30B 2026 Knowledge es un ajuste fino (fine-tune) del modelo base Muse Glimmer 30B de Meta, desarrollado por OfflineBase durante el hackathon Meta Global AI Developer Hackathon entre el 30 de octubre y el 1 de noviembre de 2026. Su propósito es extender el conocimiento del modelo base, que tiene fecha de corte en enero de 2026, incorporando noticias y eventos ocurridos entre el 4 de enero y el 29 de octubre de 2026, además de mejorar su calibración para que reconozca cuándo no sabe algo y responda en consecuencia.

El modelo cuenta con 27.854.794.240 parámetros totales (aproximadamente 27,9 mil millones) y se distribuye exclusivamente en formato GGUF para su uso con llama.cpp, en cuantizaciones de 4, 2 y 1 bit. El repositorio ocupa 57,6 GB e incluye los archivos cuantizados, no los pesos BF16 originales, que se alojan en un repositorio separado.

La relevancia de este modelo radica en su enfoque específico: no busca ser un modelo generalista de altas prestaciones, sino demostrar que un ajuste fino dirigido puede actualizar el conocimiento factual de un modelo de ~28B parámetros manteniendo gran parte de sus capacidades de razonamiento, y que las cuantizaciones agresivas (incluso 2 bits) pueden preservar ese conocimiento actualizado con pérdidas controladas.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base transformer, detalles no especificados en la información proporcionada) |
| Parámetros totales | 27.854.794.240 (~27,9B) |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | 4-bit (Q4_K_M, 16,9 GB), 2-bit (IQ2_XXS, 7,96 GB), 1-bit (IQ1_S e IQ1_M, tamaños no especificados; puntuaciones 8,3%–11,1%) |
| Idiomas soportados | inglés (en) |
| Licencia | Apache 2.0 + Muse Model License (license: other; no apto para menores de 18 años) |
| Formato de pesos | GGUF (llama.cpp); pesos BF16 en repositorio separado |

## Arquitectura y entrenamiento

No se dispone de detalles sobre la arquitectura interna del modelo base Muse Glimmer 30B en la información proporcionada. El ajuste fino se realizó sobre el modelo base meta-models/Muse-Glimmer-30B mediante un LoRA adapter (publicado en OfflineBase/Muse-Glimmer-30B-2026-Knowledge-LoRA) y posteriormente se fusionó para generar los pesos BF16 (en OfflineBase/Muse-Glimmer-30B-2026-Knowledge). El entrenamiento se llevó a cabo entre el 30 de octubre y el 1 de noviembre de 2026, con un dataset propio (OfflineBase/Muse-Glimmer-30B-2026-Knowledge-Data) que incluye noticias y pasajes de 2026, presumiblemente extraídos de páginas de Wikipedia y fuentes periodísticas, según se desprende de las notas sobre solapamiento entre respuestas y páginas de Wikipedia entrenadas.

El objetivo del entrenamiento fue doble: por un lado, inyectar conocimiento factual del periodo enero–octubre de 2026; por otro, enseñar al modelo a decir "no sé" con más frecuencia y a corregir premisas falsas. No se especifican en la información disponible detalles sobre el volumen de tokens de entrenamiento, la composición exacta del dataset ni si se emplearon técnicas de RLHF o DPO. La cuantización se realizó con llama.cpp, incluyendo el uso de imatrix (según los tags del repositorio), y se documenta que el archivo Q4_K_M obtiene puntuaciones casi idénticas a los pesos BF16 en las pruebas de conocimiento realizadas por los autores.

## Capacidades

- Generación de texto conversacional en inglés, con soporte para modo de razonamiento (reasoning on/off) heredado del modelo base.
- Conocimiento factual actualizado hasta el 29 de octubre de 2026, con un rendimiento del 69,1% en 246 preguntas sobre eventos destacados de 2026 (frente al 26,0% del modelo base).
- Mayor calibración de incertidumbre: responde "no puedo saberlo" o corrige premisas falsas en el 44,7% de 190 preguntas (frente al 26,3% del base), y en el 67,1% de las 70 preguntas sobre eventos posteriores al 29 de octubre de 2026.
- Razonamiento multi-paso: los pesos BF16 resuelven 147 de 150 problemas multi-paso (el base resuelve 150); con razonamiento activado, el Q4_K_M pasa entre 56 y 60 de 60 tareas de razonamiento.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: sí, mediante el modo de razonamiento del modelo base.
- Capacidades multilingües: limitadas al inglés según la model card.
- Capacidades de visión o audio: no disponible en la información proporcionada.
- Compatibilidad con endpoints (tag endpoints_compatible) e integración con llama.cpp.

## Casos de uso

- Consulta de actualidad reciente: el modelo puede responder preguntas sobre eventos ocurridos entre enero y octubre de 2026 (política, tecnología, cultura) con una tasa de acierto del 69,1% en eventos destacados, lo que lo hace útil para prototipos de asistentes informativos con corte de conocimiento reciente.
- Asistentes conversacionales con gestión de incertidumbre: gracias a su mayor tendencia a reconocer límites de conocimiento (44,7% frente a 26,3%), es adecuado para aplicaciones donde una respuesta "no lo sé" es preferible a una invención, como asistentes de atención al cliente o sistemas de FAQ.
- Despliegue en hardware de consumo: la cuantización IQ2_XXS (7,96 GB) permite ejecutar el modelo en GPU consumer con 8–12 GB de VRAM, manteniendo los 40 hechos previos a 2026 evaluados y sin bucles degenerados en 60 prompts de prueba.
- Prototipado rápido con llama.cpp: al estar disponible en GGUF y ser compatible con endpoints, puede integrarse en pipelines de generación de texto en local o en servidores modestos sin necesidad de infraestructura de alto rendimiento.
- Investigación sobre actualización de conocimiento: sirve como caso de estudio reproducible (con run log público) para estudiar cómo un fine-tune con LoRA actualiza hechos sin destruir capacidades de razonamiento, y cómo afecta la cuantización a la retención de conocimiento.
- Evaluación de calibración y detección de premisas falsas: útil en entornos de investigación para medir la tendencia de modelos a aceptar premisas incorrectas (el modelo las acepta el 80% de las veces, igual que el base) y para diseñar mitigaciones.
- Generación de resúmenes de noticias de 2026: para tareas de resumen o reescritura de contenido periodístico del periodo cubierto, con la advertencia de que el modelo aún inventa respuestas en el 55,3% de los casos en preguntas de conocimiento.

## Benchmarks y rendimiento

Resultados publicados por los autores en la model card (evaluación con decodificación greedy, temperatura 0):

| Prueba | Este modelo (BF16) | Base Muse Glimmer 30B | Notas |
|---|---|---|---|
| Eventos destacados de 2026 (246 preguntas) | 69,1% | 26,0% | Base evaluado en Q4_K_M |
| Preguntas reformuladas sobre pasajes de 2026 (2.500) | 29,0% | 18,4% | Base en Q4_K_M; este modelo Q4_K_M obtiene 28,8% |
| Dice que no puede saberlo o corrige premisa falsa (190) | 44,7% | 26,3% | Preguntas retenidas y calificadas a ciegas |
| De esas, eventos posteriores al 29/10/2026 (70) | 67,1% | 24,3% | — |
| Hechos previos a 2026 (40 comprobaciones) | 40/40 (Q4_K_M) | — | IQ2_XXS también 40/40; 1-bit falla 3–4 |
| Razonamiento con reasoning on (60 tareas) | 56–60/60 (Q4_K_M) | 60/60 | — |
| Problemas multi-paso (150) | 147/150 (BF16) | 150/150 | — |
| Inventa respuesta en las 190 preguntas | 55,3% | 70,0% | — |
| Acepta premisas falsas | 80% | 80% | — |
| Rechaza preguntas ordinarias | 18% | 6% | — |

Comparación con otros modelos abiertos de tamaño similar en eventos de 2026 (todos en 4-bit, evaluados por un revisor de IA no ciego): este modelo Q4_K_M acierta ~70 de 100 eventos destacados; el base, 27; Qwen3.8 27B, Gemma 4 31B y Granite 4.2 30B, 7 o menos cada uno (Gemma 4 con datos hasta enero de 2025; los otros dos declinan preguntas de 2026). En tareas de razonamiento del mismo run, Qwen3.8 y Gemma 4 igualan o superan a este modelo.

## Requisitos de hardware

- VRAM estimada para inferencia: Q4_K_M requiere ~17 GB (16,9 GB de pesos + overhead); IQ2_XXS requiere ~8 GB (7,96 GB); las versiones de 1 bit (IQ1_S, IQ1_M) requieren menos de 8 GB, con tamaños no especificados.
- GPU recomendadas: para Q4_K_M, GPU con 24 GB o más (RTX 3090, RTX 4090, A100 40GB, H100); para IQ2_XXS, GPU con 8–12 GB (RTX 3060 12GB, RTX 4060 Ti 16GB, RTX 4070).
- Cabe en GPU consumer: sí, en Q4_K_M con 24 GB (RTX 3090/4090) y en IQ2_XXS con 8–12 GB.
- Opciones de despliegue: llama.cpp (formato nativo GGUF), con compatibilidad con endpoints; no se mencionan vLLM, TGI u Ollama en la información proporcionada.
- Latencia y throughput: no disponibles en la información proporcionada. Se advierte que IQ1_S entra en bucles en 9 de 60 prompts con decodificación greedy (el IQ1_S del base, en 57), por lo que se recomienda fijar un límite máximo de tokens.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento en eventos 2026 (100 preguntas) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Muse Glimmer 30B 2026 Knowledge (este) | ~27,9B | no disponible | ~70/100 | Apache 2.0 + Muse Model License | GGUF en HF |
| Muse Glimmer 30B (base) | ~27,9B | no disponible | 27/100 | Muse Model License | HF (base) |
| Qwen3.8 27B | 27B (nominal) | no disponible | ≤7/100 | no disponible | 4-bit evaluado |
| Gemma 4 31B | 31B (nominal) | no disponible | ≤7/100 | no disponible | 4-bit evaluado |
| Granite 4.2 30B | 30B (nominal) | no disponible | ≤7/100 | no disponible | 4-bit evaluado |

En tareas de razonamiento, Qwen3.8 27B y Gemma 4 31B igualan o superan a este modelo según los autores. No se dispone de datos de contexto ni de licencias de los modelos comparables en la información proporcionada.

## Limitaciones y advertencias

- Alto riesgo de alucinación: inventa una respuesta en el 55,3% de las 190 preguntas de evaluación (el base, en el 70,0%), por lo que no es fiable como fuente factual sin verificación.
- Acepta premisas falsas el 80% de las veces, sin mejora respecto al modelo base.
- Rechaza más preguntas ordinarias que el base (18% frente a 6%), lo que puede degradar la experiencia en conversaciones generales.
- El conocimiento actualizado se limita al periodo enero–octubre de 2026 y al idioma inglés; no cubre eventos posteriores al 29 de octubre de 2026 (aunque los detecta como desconocidos en el 67,1% de los casos).
- Los resultados de conocimiento se obtuvieron con razonamiento desactivado; con razonamiento activado inventa más respuestas, por lo que se recomienda desactivarlo para consultas factuales.
- Las puntuaciones de los 246 eventos destacados fueron seleccionadas y calificadas por un único autor, y muchas respuestas de noticias aparecen en las páginas de Wikipedia usadas en el entrenamiento, lo que puede inflar los resultados.
- La comparación con otros modelos fue realizada por un revisor de IA no ciego a los modelos evaluados.
- Las cuantizaciones de 1 bit pierden conocimiento (8,3%–11,1% en las 2.500 preguntas) y olvidan 3–4 de los 40 hechos previos a 2026; IQ1_S entra en bucles en 9 de 60 prompts con greedy, por lo que requiere límite de tokens.
- Licencia restrictiva adicional: Apache 2.0 más Muse Model License; no apto para menores de 18 años. Verificar condiciones para uso comercial.
- No es un lanzamiento oficial de Meta ni está revisado o respaldado por Meta.
- Todos los resultados son con decodificación greedy (temperatura 0); en producción las respuestas variarán.

## Enlaces

- Repositorio Hugging Face (GGUF): https://huggingface.co/OfflineBase/Muse-Glimmer-30B-2026-Knowledge-GGUF
- Pesos BF16 fusionados: https://huggingface.co/OfflineBase/Muse-Glimmer-30B-2026-Knowledge
- Adaptador LoRA: https://huggingface.co/OfflineBase/Muse-Glimmer-30B-2026-Knowledge-LoRA
- Dataset: https://huggingface.co/datasets/OfflineBase/Muse-Glimmer-30B-2026-Knowledge-Data
- Código: https://github.com/Offline-Base/muse-muse
- Registro de entrenamiento: https://github.com/Offline-Base/muse-muse/blob/main/docs/KNOWLEDGE_RUN_LOG.md
- Dispositivos compatibles: https://github.com/Offline-Base/muse-muse/blob/main/docs/GLIMMER_DEVICES.md
- Licencia Muse Model: https://huggingface.co/OfflineBase/Muse-Glimmer-30B-2026-Knowledge-GGUF/blob/main/MUSE_MODEL_LICENSE.md
- Modelo base: https://huggingface.co/meta-models/Muse-Glimmer-30B
