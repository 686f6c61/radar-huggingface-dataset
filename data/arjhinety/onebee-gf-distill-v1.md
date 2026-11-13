# arjhinety/onebee-gf-distill-v1

## Resumen

onebee-gf-distill-v1 es un checkpoint de investigación publicado por el usuario arjhinety dentro del proyecto small-mind-companion, cuyo objetivo es medir cuánta capacidad aparente puede recuperar un modelo pequeño con visión mediante post-entrenamiento y memoria externa, en lugar de escalar el número de parámetros. Se construye sobre google/gemma-4-E2B-it, un modelo multimodal de la familia Gemma 4 con aproximadamente 2B de parámetros efectivos, y se distribuye con pesos completos fusionados tras un pipeline de LoRA SFT, LoRA DPO y destilación on-policy desde un profesor de 8B (google/gemma-4-E4B-it).

El modelo está especializado como compañero conversacional aumentado por memoria: no almacena recuerdos propios, sino que se espera que recupere hechos relevantes de un almacén externo y responda en función de ellos. La innovación metodológica destacable es aplicar la destilación on-policy después del DPO, midiendo explícitamente el riesgo de degradación de consistencia de persona que el propio proyecto había anticipado. Según la model card, ese riesgo no se materializó.

La relevancia actual reside en su carácter de artefacto de investigación reproducible: cuenta con cuantizaciones GGUF para inferencia en dispositivo, licencia Apache-2.0 heredada del modelo base y un conjunto de métricas publicadas sobre el benchmark PMB (Personalized Memory Benchmark). No obstante, sus cifras absolutas de precisión son bajas (18,59% en pra_lenient), por lo que debe interpretarse como una referencia experimental y no como un modelo listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Gemma4 multimodal (texto + visión) |
| Parametros totales | 5.104.297.539 (pesos safetensors); ~2B efectivos en el modelo base |
| Parametros activos | no disponible |
| Longitud de contexto | 131.072 tokens (heredada del modelo base) |
| Tipos de cuantizacion | GGUF: F16 de referencia más 12 niveles, hasta Q2_K (Q2_K roto en pruebas reales; usar Q3_K_S o superior) |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache-2.0 (heredada del modelo base) |
| Formato de pesos | safetensors (transformers); GGUF en repositorio separado |

## Arquitectura y entrenamiento

El modelo parte de google/gemma-4-E2B-it, un transformer multimodal de la familia Gemma 4 que procesa texto e imagen (pipeline image-text-to-text). Sobre esa base se aplicó un pipeline de post-entrenamiento en tres etapas encadenadas, cada una partiendo del checkpoint anterior: LoRA SFT con 2.232 ejemplos, LoRA DPO con 2.049 pares de preferencia y, finalmente, destilación on-policy con 2.008 prompts y 125 pasos. El adaptador LoRA tiene rango 16 y los pesos resultantes se fusionaron en pesos completos.

La etapa de destilación emplea trl.DistillationTrainer con divergencia JSD generalizada, donde el alumno genera sus propias completaciones y se alinean con la distribución de un profesor local de 8B (google/gemma-4-E4B-it). El requisito técnico es que alumno y profesor compartan tokenizador y vocabulario, condición que se cumple al pertenecer ambos a la misma familia. La decisión de diseño relevante es situar la destilación después del DPO en lugar de sustituirlo, y verificar mediante un juez LLM y una medida estilométrica independiente sin API que la consistencia de persona no se degradó.

## Capacidades

- Generación de texto conversacional con persona de compañero, condicionada a memorias recuperadas externamente.
- Procesamiento multimodal de imagen y texto (pipeline image-text-to-text heredado del modelo base).
- Calibración medida: UAR del 71,25%, con abstención correcta ante preguntas no respondibles sin exceso de cautela en las respondibles.
- Precisión de respuesta medida: pra_lenient del 18,59% en PMB.
- Consistencia de persona: mejora de +7,6 puntos porcentuales en comparación por pares con juez LLM tras la destilación, y 0,524 frente a 0,509 en medida estilométrica de autoconsistencia.
- Ventana de contexto de 131.072 tokens heredada del modelo base.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: solo inglés declarado.
- Modo thinking, audio u otras capacidades especiales: no disponible en la información proporcionada.

## Casos de uso

- Compañero conversacional con memoria externa: el modelo se integra en un pipeline de recuperación que inyecta hechos relevantes del usuario en el prompt; su entrenamiento está orientado precisamente a responder preguntas del tipo "¿a qué conferencia dije que iba?" a partir de esos recuerdos recuperados, no de recall paramétrico.
- Investigación en post-entrenamiento de modelos pequeños: sirve como punto de referencia reproducible para estudiar el efecto de SFT, DPO y destilación on-policy encadenados sobre una base de ~2B, con métricas publicadas y errata documentada.
- Evaluación de calibración y abstención: su UAR del 71,25% lo hace útil como caso de estudio en sistemas que deben decidir cuándo no responder, por ejemplo asistentes que no deben inventar datos sobre el usuario.
- Inferencia en dispositivo con llama.cpp: las cuantizaciones GGUF (desde Q3_K_S en adelante) permiten desplegar el modelo en hardware de consumo, útil para prototipos de asistentes personales locales con proyector de visión incluido.
- Estudio de destilación con profesores de la misma familia: la configuración alumno E2B / profesor E4B con tokenizador compartido sirve como plantilla para experimentos de destilación on-policy con trl.DistillationTrainer.
- Base para investigación en cuantización y abliteration: la model card lo señala explícitamente como referencia para pases adicionales de destilación, cuantización o estudios de modificación de comportamiento, dado que documenta sus limitaciones con honestidad.
- Prototipos de asistencia conversacional en inglés con contexto largo: los 131.072 tokens permiten mantener historiales extensos en pruebas de concepto, aunque sin garantías de calidad propias de un modelo de producción.

## Benchmarks y rendimiento

Evaluación sobre PMB (Personalized Memory Benchmark): 688 sondas adversariales en 8 categorías, con juez LLM en doble orden para controlar sesgo de posición y detector de abstención basado en reglas.

| Sistema | pra_lenient | UAR |
|---|---|---|
| SFT + memoria (pre-destilación) | 15,30% | 70,0% |
| distill-v1 (este checkpoint) | 18,59% | 71,25% |

Adicionalmente, la comparación por pares con juez LLM favorece a este checkpoint en +7,6 puntos porcentuales en consistencia de persona, y la medida estilométrica de autoconsistencia pasa de 0,509 a 0,524 tras la destilación.

No se han publicado resultados de MMLU, HumanEval, GSM8K ni otros benchmarks estándar en la información disponible. Existe una advertencia de errata (ERRATA E43) que afecta a hasta 285 de las 608 preguntas respondibles de PMB, por lo que las cifras de precisión deben interpretarse con cautela.

## Requisitos de hardware

- VRAM estimada para inferencia: en F16, los 5.104.297.539 parámetros de los pesos safetensors requieren aproximadamente 10,2 GB solo para pesos, más overhead de activaciones y del proyector de visión. En cuantizaciones GGUF de 4 bits, la huella se reduce aproximadamente a la mitad o menos.
- GPU recomendadas: no disponible en la información proporcionada. Por tamaño, una GPU con 16 GB o más permite F16 con margen limitado; una RTX 4090 (24 GB) o A100/H100 ofrecen holgura.
- Cabe en GPU de consumo: sí, especialmente con las cuantizaciones GGUF Q3_K_S o superiores, que el autor indica como mínimo fiable. Q2_K está roto en pruebas reales de generación.
- Opciones de despliegue: transformers (AutoModelForCausalLM + AutoProcessor), llama.cpp y entornos basados en GGUF. vLLM, TGI y Ollama no se mencionan en la información disponible.
- Latencia y throughput estimados: no disponible en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento publicado | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| onebee-gf-distill-v1 | 5.104.297.539 en safetensors (~2B efectivos base) | 131.072 | pra_lenient 18,59%, UAR 71,25% en PMB | Apache-2.0 | Hugging Face, GGUF aparte |
| google/gemma-4-E2B-it | ~2B efectivos | 131.072 | no disponible en la información proporcionada | Apache-2.0 (según este modelo) | Hugging Face |
| google/gemma-4-E4B-it | 8B | no disponible en la información proporcionada | no disponible en la información proporcionada | no disponible en la información proporcionada | Hugging Face |

La comparación con alternativas de la misma categoría (compañeros conversacionales con memoria) no está disponible en la información proporcionada. El modelo base y el profesor se incluyen por su relación directa con el pipeline, no como alternativas equivalentes de uso.

## Limitaciones y advertencias

- Precisión absoluta baja: pra_lenient del 18,59% en PMB implica que la mayoría de respuestas evaluadas no son correctas según el criterio del benchmark.
- Errata documentada en el benchmark: hasta 285 de las 608 preguntas respondibles de PMB presentan problemas en la clave de respuestas (ERRATA E43), lo que afecta a la fiabilidad de las métricas publicadas.
- No incorpora memoria propia: requiere un sistema de recuperación externo; sin él, no cumple su función prevista.
- Solo inglés declarado; no se han evaluado capacidades en otros idiomas.
- Ámbito excluido por el autor: decisiones críticas de seguridad, asesoramiento médico, legal o financiero, y cualquier despliegue donde una respuesta incorrecta o excesivamente confiada cause daño real.
- Riesgo de alucinación: no cuantificado en la información disponible, pero relevante dado el carácter conversacional y la baja precisión medida.
- Cuantización Q2_K defectuosa en pruebas reales de generación; usar Q3_K_S o superior.
- Sesgos conocidos: no disponible en la información proporcionada.
- Licencia Apache-2.0 heredada del modelo base, lo que en principio permite uso comercial, pero el autor la enmarca como artefacto de investigación y recomienda leer el README del proyecto antes de cualquier uso en producción.
- Sin garantías de soporte ni mantenimiento más allá del proyecto personal del autor; 0 likes y un único contribuidor identificado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/arjhinety/onebee-gf-distill-v1
- Cuantizaciones GGUF: https://huggingface.co/arjhinety/onebee-gf-distill-v1-gguf
- Repositorio del proyecto: https://github.com/arjhinety/small-mind-companion
- Errata del benchmark (ERRATA E43): https://github.com/arjhinety/small-mind-companion/blob/main/reports/ERRATA.md
- Modelo base: https://huggingface.co/google/gemma-4-E2B-it
- Modelo profesor: https://huggingface.co/google/gemma-4-E4B-it
