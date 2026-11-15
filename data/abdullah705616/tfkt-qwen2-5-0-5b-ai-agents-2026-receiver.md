# Abdullah705616/tfkt-qwen2.5-0.5b-ai-agents-2026-receiver

## Resumen

TFKT transferred receiver es un artefacto de investigación publicado por Abdullah705616 que aplica una técnica de transferencia de pesos en el espacio de parámetros (TFKT, *Trends, Initiatives and the Future of Green Banking Products* no guarda relación con el modelo; el acrónimo no se detalla en la información disponible). El modelo parte de `Qwen/Qwen2.5-0.5B-Instruct` y le suma un delta escalado procedente de un modelo donante entrenado: `receptor_final = receptor_base + alpha × (donante_entrenado − donante_base)`, con `alpha = 0.5`. No se entrena ningún parámetro del receptor; se trata de aritmética pura de tensores.

El resultado son 494.032.768 parámetros (0,5B), arquitectura Qwen2 transformer densa, licencia Apache-2.0 y un único idioma declarado (inglés). Se actualizan 290 tensores, con un ratio medio `|delta| / |receptor|` de 0,00017829, lo que indica que la modificación es muy pequeña en magnitud relativa.

Su relevancia es metodológica más que de producto: demuestra que un receptor no entrenado puede mejorar su perplejidad en un corpus específico (de 28,269 a 23,791) mediante transferencia de deltas desde un donante. No obstante, el autor advierte explícitamente de que es un artefacto de investigación, sin evaluación de QA verificada por humanos, y que la perplejidad no mide exactitud factual.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (Qwen2), decoder-only |
| Parametros totales | 494.032.768 (0,5B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible (heredada de Qwen2.5-0.5B-Instruct; no confirmada en la model card) |
| Tipos de cuantizacion | No disponible (pesos publicados en safetensors; sin GGUF ni cuantizaciones publicadas) |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (transformers) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Qwen2.5-0.5B-Instruct: un transformer decoder-only denso de 0,5B parámetros. Sobre ese checkpoint se aplica una transferencia de pesos tipo *task arithmetic*: se calcula el delta entre un donante entrenado y su base original, se escala por `alpha = 0.5` y se suma al receptor. La model card indica 290 tensores actualizados y 1 tensor atado (*tied*) deduplicado y aplicado una sola vez. No hay entrenamiento del receptor, ni RLHF, ni DPO en esta etapa; es aritmética de parámetros.

El donante se entrenó sobre el corpus `newsdata01/ai-agents-autonomous-systems-news-dataset` (licencia MIT), con documentos fechados entre el 1 y el 30 de octubre de 2026, usando únicamente los cuerpos de los artículos. La evaluación de perplejidad se hizo sobre 200 documentos y 159.280 tokens en *held-out*. El autor señala una limitación metodológica relevante: el corpus no tiene identificadores de evento compartidos, por lo que el split es a nivel de documento y dos artículos sobre el mismo evento pueden quedar en lados opuestos del split, lo que debilita la evaluación frente a un split por clúster de eventos.

## Capacidades

- Generación de texto en inglés, heredada de Qwen2.5-0.5B-Instruct.
- Razonamiento básico y respuesta a instrucciones conversacionales (modelo *instruct*).
- Generación de código y matemáticas elementales a nivel de un modelo de 0,5B (capacidad limitada por tamaño).
- Soporte de *tool calling* / *function calling*: no confirmado en la model card; debe verificarse empíricamente.
- Soporte de agentes y razonamiento multi-paso: no confirmado; el nombre del repositorio menciona "ai-agents" por el corpus de entrenamiento, no por capacidades de agente.
- Capacidades multilingües: solo inglés declarado.
- Capacidades especiales (visión, audio, modo *thinking*): no disponibles.

## Casos de uso

- Investigación en transferencia de pesos: reproducir el experimento de *task arithmetic* con `alpha` variable para estudiar cómo escala el delta y su efecto en perplejidad sobre un corpus concreto.
- Experimentos de *model merging* y deltas: usar este receptor como punto de partida para comparar técnicas de fusión (TIES, DARE, task arithmetic) sobre un modelo pequeño y barato de evaluar.
- Prototipado de bajo coste en inglés: generar borradores de texto o respuestas conversacionales simples en entornos con recursos muy limitados (0,5B parámetros).
- Evaluación de metodologías de split: emplear el corpus y el modelo para medir el impacto de splits a nivel de documento frente a splits por evento en tareas de perplejidad.
- Docencia y demostraciones: ilustrar en un aula o taller cómo se construye un modelo derivado sin entrenamiento, con trazabilidad completa de tensores modificados.
- Filtrado o clasificación ligera de texto periodístico: con ajuste mínimo, usar el modelo como base para tareas de etiquetado sobre el mismo dominio de noticias tecnológicas.

## Benchmarks y rendimiento

| Modelo | Documentos | Tokens | Mean loss | Perplejidad |
|---|---|---|---|---|
| Donante entrenado | 200 | 159.280 | 3,3418 | 28,269 |
| Receptor transferido (este modelo) | 200 | 159.280 | 3,1693 | 23,791 |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible. El autor indica explícitamente que la perplejidad no mide exactitud factual y que no se reporta precisión de QA.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16: aproximadamente 1 GB para pesos (0,5B × 2 bytes) más overhead de activaciones y caché KV; en la práctica, 2-3 GB.
- En cuantización de 8 bits: en torno a 0,5-1 GB de pesos; en 4 bits, aproximadamente 0,3-0,5 GB (aunque no se publican cuantizaciones oficiales).
- GPU recomendadas: cualquier GPU consumer moderna (RTX 3060 12 GB, RTX 4060, RTX 4090) con margen amplio; también cabe en GPUs de 4-8 GB e incluso en CPU.
- Cabe en GPU consumer: sí, en prácticamente todas las GPU con al menos 4 GB de VRAM; también es viable en CPU para inferencia no interactiva.
- Opciones de despliegue: transformers (librería declarada), text-generation-inference (tag `text-generation-inference` y `endpoints_compatible`); vLLM, llama.cpp u Ollama no están confirmados para este checkpoint concreto y requerirían conversión a GGUF.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| TFKT transferred receiver (este) | 0,5B | No disponible | Apache-2.0 | Hugging Face, 0 descargas | Artefacto de investigación, solo inglés |
| Qwen/Qwen2.5-0.5B-Instruct | 0,5B | No disponible en la información | Apache-2.0 | Hugging Face, ampliamente usado | Modelo base; multilingüe y con soporte de tool calling según su card upstream |
| Qwen/Qwen2.5-1.5B-Instruct | 1,5B | No disponible en la información | Apache-2.0 | Hugging Face | Alternativa de mayor tamaño de la misma familia |
| Modelos de ~0,5B de otras familias (p. ej. SmolLM2-360M/1.7B) | 0,36B-1,7B | No disponible en la información | Variables (Apache-2.0 en varios) | Hugging Face | Comparables en rango de tamaño para despliegue en *edge* |

No se dispone de datos de rendimiento comparativo más allá de la perplejidad reportada frente al donante.

## Limitaciones y advertencias

- Es un artefacto de investigación: el autor lo describe como tal y no como un modelo listo para producción.
- No es una autoridad factual: no tiene recuperación (*retrieval*) y puede alucinar; no se reporta precisión de QA verificada por humanos.
- Evaluación débil: el split es a nivel de documento, no por clúster de evento, lo que puede inflar la métrica de perplejidad.
- Solo inglés declarado; sin capacidades multilingües confirmadas.
- Sin datos publicados sobre sesgos, robustez, seguridad o comportamiento en dominios fuera del corpus de noticias.
- Licencia Apache-2.0 heredada del checkpoint base; el autor recomienda revisar la model card upstream de Qwen2.5 antes de redistribuir o usar comercialmente.
- El corpus de entrenamiento contiene artículos periodísticos cuyos derechos pertenecen a los editores originales; el dataset no se redistribuye con el modelo, pero conviene revisar implicaciones de uso.
- Sin cuantizaciones oficiales ni formato GGUF publicado; el despliegue en llama.cpp/Ollama requeriría conversión propia.
- El nombre del repositorio incluye "2026" y "ai-agents", lo que puede inducir a confusión sobre sus capacidades reales de agente; no hay evidencia de soporte de agentes en la model card.

## Enlaces

- Hugging Face: https://huggingface.co/Abdullah705616/tfkt-qwen2.5-0.5b-ai-agents-2026-receiver
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-0.5B-Instruct
- Dataset del corpus: `newsdata01/ai-agents-autonomous-systems-news-dataset` (referenciado en la model card; sin URL directa en la información disponible)
- Paper, blog o demo del método TFKT: no disponible en la información proporcionada
