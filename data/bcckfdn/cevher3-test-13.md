# bcckfdn/cevher3-test-13

## Resumen

cevher3-test-13 es un modelo de lenguaje de 1.256 millones de parámetros (aproximadamente 1,26 B) desarrollado por el usuario bcckfdn y publicado en Hugging Face bajo licencia Apache 2.0. Se trata de un modelo de la familia Gemma 3, concretamente etiquetado como `gemma3_text`, entrenado desde cero con una arquitectura denominada por el autor como "Gemma3-SWA" (probablemente una variante con atención de ventana deslizante, *sliding window attention*). El modelo está orientado a generación de texto conversacional en turco e inglés.

El modelo resuelve el caso de uso de generación de texto causal multilingüe (turco e inglés) con una ventana de contexto de 8192 tokens y un vocabulario de 65.536 entradas. Por su tamaño compacto (1,26 B parámetros) es adecuado para despliegue en hardware de consumo y para tareas de ajuste fino ligero, aunque su naturaleza experimental (el nombre incluye "test") y la ausencia de benchmarks publicados limitan su uso en producción sin una evaluación previa.

La relevancia actual del modelo reside en su pertenencia al ecosistema Gemma 3 de Google, lo que permite reutilizar tooling existente (transformers, text-generation-inference, endpoints compatibles) y en su licencia permisiva Apache 2.0, que facilita uso comercial. No obstante, la información disponible es escasa y no se han publicado resultados de evaluación ni detalles sobre la composición del dataset de entrenamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only, variante Gemma3-SWA (atención de ventana deslizante) |
| Parametros totales | 1.256.312.832 (~1,26 B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 8192 tokens |
| Tipos de cuantizacion | No disponible (pesos en safetensors; se asume compatibilidad con cuantización estándar vía transformers/bitsandbytes, no confirmado) |
| Idiomas soportados | Turco (tr), inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

Datos adicionales de la model card:

| Parametro | Valor |
|---|---|
| Capas | 34 |
| Dimensión oculta (hidden) | 1792 |
| Cabezas de atención (Q / KV) | 28 / 4 |
| Vocabulario | 65.536 |
| Tokens de entrenamiento | 26.051 B (26.051 miles de millones, presumiblemente 26,051 B) |
| Mejor val loss | 2,7804 |

## Arquitectura y entrenamiento

El modelo emplea una arquitectura transformer decoder-only con 34 capas, dimensión oculta de 1792 y 28 cabezas de consulta frente a 4 cabezas de clave/valor (atención con *grouped-query attention*, ratio 7:1). El autor la describe como "Gemma3-SWA", lo que sugiere el uso de atención de ventana deslizante (*sliding window attention*) característica de la familia Gemma 3, combinada con atención global en determinadas capas. El vocabulario es de 65.536 tokens, coherente con el tokenizador de Gemma.

Según la model card, el modelo fue entrenado con 26.051 B tokens (interpretado como 26.051 miles de millones de tokens) y alcanzó una pérdida de validación de 2,7804. No se especifica la composición del dataset, si hubo fases de ajuste supervisado (SFT), RLHF o DPO, ni detalles sobre el proceso de tokenización o el preprocesamiento. Tampoco se documentan innovaciones técnicas adicionales como decodificación especulativa o atención lineal más allá de la propia variante SWA.

## Capacidades

- Generación de texto causal en turco e inglés.
- Conversación multi-turno (etiqueta `conversational` en los tags del repositorio).
- Razonamiento básico de lenguaje natural derivado del preentrenamiento; sin datos publicados sobre capacidades específicas de razonamiento matemático o lógico.
- Compatibilidad con `text-generation-inference` y endpoints compatibles, lo que permite integración en infraestructuras de inferencia estándar.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso explícito.
- No se documenta capacidad de visión, audio ni modo "thinking".
- Capacidades multilingües limitadas a turco e inglés según la model card.

## Casos de uso

- Generación de texto conversacional en turco: el modelo puede gestionar diálogos multi-turno con hasta 8192 tokens de contexto, adecuado para asistentes de chat en turco donde se requiera una ventana amplia para mantener el historial de conversación.
- Traducción turco-inglés y viceversa: al estar entrenado en ambos idiomas, puede emplearse para tareas de traducción automática básica, aunque sin benchmarks publicados que garanticen calidad.
- Generación de contenido en turco: redacción de artículos, resúmenes y textos descriptivos para medios o blogs en turco, aprovechando el vocabulario de 65.536 tokens.
- Prototipado rápido de aplicaciones de NLP: su tamaño de 1,26 B parámetros permite desplegarlo en una GPU de consumo para pruebas de concepto y experimentación académica.
- Ajuste fino específico de dominio: al ser un modelo compacto con licencia Apache 2.0, es adecuado como base para *fine-tuning* en tareas concretas (clasificación, extracción de información, resumen) en turco.
- Investigación sobre arquitecturas Gemma 3: sirve como referencia para estudiar variantes de atención de ventana deslizante en modelos de tamaño medio.
- Asistencia en entornos con recursos limitados: su tamaño permite inferencia en GPUs de 8-16 GB con cuantización, útil para despliegues en *edge* o en entornos con presupuesto de hardware reducido.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card únicamente reporta una pérdida de validación de 2,7804 y 26.051 B tokens de entrenamiento, sin métricas de evaluación estándar (MMLU, HumanEval, GSM8K, etc.) ni comparaciones con otros modelos.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16/BF16: aproximadamente 2,5 GB solo para pesos, más overhead de activaciones y KV cache; en la práctica, entre 4 y 6 GB para contexto moderado.
- VRAM estimada con cuantización de 8 bits: ~1,3 GB para pesos; con 4 bits: ~0,7 GB para pesos.
- GPU recomendadas: NVIDIA RTX 3060 (12 GB), RTX 4060 Ti (16 GB), RTX 4090 (24 GB), A100 (40/80 GB) y H100 para despliegues de mayor throughput.
- Cabe en GPU de consumo: sí, en cualquier GPU con 8 GB o más de VRAM en FP16, y en GPUs de 4-6 GB con cuantización.
- Opciones de despliegue: transformers (nativo), text-generation-inference (soportado según tags), endpoints compatibles. No se confirma soporte explícito de vLLM, llama.cpp u Ollama en la información disponible.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Idiomas | Benchmarks publicados |
|---|---|---|---|---|---|
| cevher3-test-13 | ~1,26 B | 8192 | Apache 2.0 | tr, en | No |
| Gemma 3 1B (Google) | ~1 B | 32.000 (aprox.) | Gemma Terms of Use | Multilingüe | Sí |
| Llama 3.2 1B | ~1,24 B | 128.000 | Llama 3.2 Community License | Multilingüe | Sí |
| Qwen2.5 1.5B | ~1,5 B | 32.768 | Apache 2.0 | Multilingüe | Sí |

Nota: los datos de los modelos comparativos corresponden a conocimiento general de la familia y no se han verificado en la información proporcionada; se incluyen como referencia orientativa. cevher3-test-13 destaca por su licencia Apache 2.0 y su enfoque específico en turco, pero carece de benchmarks y de documentación sobre el dataset, a diferencia de las alternativas citadas.

## Limitaciones y advertencias

- Modelo experimental: el sufijo "test" en el nombre y la ausencia de benchmarks sugieren que no está validado para producción.
- Riesgo de alucinación: sin datos de evaluación ni de alineación (RLHF/DPO), el riesgo de generar contenido incorrecto o inventado es elevado.
- Sesgos conocidos: no documentados; al entrenarse con un dataset no especificado, pueden existir sesgos lingüísticos y culturales no identificados.
- Limitaciones de idioma: solo se declaran turco e inglés; el rendimiento en otros idiomas no está garantizado.
- Limitación de contexto: 8192 tokens, inferior a los 32.000-128.000 tokens de modelos comparables de la misma categoría.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero el autor no ofrece garantías ni soporte; conviene revisar la procedencia de los datos de entrenamiento (no documentada) por posibles riesgos legales.
- Falta de documentación sobre el dataset de entrenamiento, lo que dificulta evaluar riesgos de contaminación o de cumplimiento normativo.
- No se confirma soporte de tool calling ni de agentes, lo que limita su uso en pipelines automatizados complejos.
- Fecha de creación futura (2026-11-18) en los metadatos, lo que puede indicar un repositorio de prueba o un error de marcado temporal.

## Enlaces

- Hugging Face: https://huggingface.co/bcckfdn/cevher3-test-13
- No se han encontrado otros enlaces (papers, blogs, repos, demos) en la información proporcionada.
