# bcckfdn/cevher3-test-11

## Resumen

cevher3 (publicado como `bcckfdn/cevher3-test-11`) es un modelo de lenguaje de 1.256 millones de parámetros desarrollado por el usuario bcckfdn. Se trata de un modelo de tipo decoder-only basado en la arquitectura Gemma3 con atención de ventana deslizante (SWA, *sliding window attention*), entrenado específicamente para turco e inglés. El modelo está pensado para generación de texto conversacional y se distribuye bajo licencia Apache 2.0, lo que permite uso comercial sin restricciones adicionales.

El modelo cuenta con 34 capas, dimensión oculta de 1792, 28 cabezas de atención para consultas y 4 para claves/valores, un vocabulario de 65.536 tokens y una ventana de contexto de 8192 tokens. Fue entrenado sobre 20.644 millones de tokens (20,6 B) y alcanzó una pérdida de validación de 2,8047. Su tamaño compacto lo hace adecuado para despliegue en hardware de consumo, aunque su especialización en turco limita su utilidad generalista.

La relevancia de este modelo radica en su enfoque en el idioma turco, un ámbito con menos representación en la oferta de modelos abiertos de gran calidad, y en su compatibilidad con el ecosistema transformers y text-generation-inference. No obstante, la ausencia de benchmarks publicados y el bajo número de descargas (0 en el momento de la consulta) indican que se trata de una publicación reciente y sin validación externa conocida.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only con atención de ventana deslizante (Gemma3-SWA) |
| Parametros totales | 1.256.312.832 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 8192 tokens |
| Tipos de cuantizacion | no disponible (pesos en safetensors; cuantizaciones GGUF/AWQ no publicadas) |
| Idiomas soportados | turco (tr), inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo sigue una arquitectura transformer decoder-only con 34 capas, dimensión oculta de 1792 y un esquema de atención con 28 cabezas de consulta y 4 cabezas de clave/valor (GQA, *grouped-query attention*). Incorpora atención de ventana deslizante (SWA) al estilo de Gemma3, lo que reduce el coste computacional en secuencias largas al limitar el alcance de la atención a una ventana local en determinadas capas. El vocabulario es de 65.536 tokens y la longitud máxima de contexto es de 8192 tokens.

El entrenamiento se realizó sobre 20.644 millones de tokens (20,6 B), con una pérdida de validación final de 2,8047. No se especifican en la información disponible la composición del dataset, la proporción entre turco e inglés, ni si se aplicaron técnicas de alineación como RLHF, DPO o SFT. Tampoco se documentan innovaciones adicionales como decodificación especulativa o mecanismos de atención lineal más allá de la propia SWA.

## Capacidades

- Generación de texto en turco e inglés con soporte conversacional multi-turno.
- Razonamiento básico y generación de texto general, limitado por su tamaño de 1,25 B de parámetros.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües limitadas a turco e inglés.
- Capacidades especiales (modo thinking, visión, audio): no disponibles.
- Compatible con text-generation-inference y endpoints compatibles según los tags del repositorio.

## Casos de uso

- Asistentes conversacionales en turco: el modelo puede gestionar diálogos multi-turno en turco con una ventana de 8192 tokens, adecuada para conversaciones de atención al cliente de extensión media sin perder el hilo contextual.
- Generación de contenido editorial en turco: redacción de artículos, descripciones de producto o correos electrónicos, aprovechando su especialización en el idioma y su licencia Apache 2.0 para uso comercial.
- Traducción asistida turco-inglés: aunque no es un modelo de traducción dedicado, su entrenamiento bilingüe permite tareas de reformulación y traducción de textos de dominio general.
- Prototipado rápido y experimentación: su tamaño de 1,25 B permite ejecutarlo en GPU de consumo para pruebas de concepto de aplicaciones de PLN en turco sin infraestructura dedicada.
- Clasificación y etiquetado de texto: fine-tuning sobre el modelo base para tareas de análisis de sentimiento, categorización de tickets o extracción de entidades en corpus turcos.
- Chatbots de soporte interno: despliegue en entornos con requisitos de latencia baja y coste reducido, gracias a su tamaño compacto y compatibilidad con TGI y transformers.
- Generación aumentada por recuperación (RAG): uso como generador en pipelines RAG para dominios en turco, con contexto de 8192 tokens para incorporar documentos recuperados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card únicamente reporta la pérdida de validación (2,8047) y el número de tokens de entrenamiento (20.644 M), sin métricas estándar como MMLU, HumanEval o GSM8K.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16/BF16: aproximadamente 2,5 GB para los pesos (1,25 B de parámetros × 2 bytes), más overhead de activaciones y caché KV.
- VRAM estimada en cuantización de 8 bits: alrededor de 1,3-1,5 GB; en 4 bits: alrededor de 0,7-1 GB (estimaciones teóricas, no verificadas con cuantizaciones publicadas).
- GPU recomendadas: cualquier GPU con al menos 4-6 GB de VRAM para FP16; RTX 3060, RTX 4060, RTX 4090, A100 o H100 son suficientes y sobredimensionadas para este tamaño.
- Cabe en GPU de consumo: sí, en tarjetas con 6 GB o más de VRAM en precisión completa; en cuantización 4 bits podría caber en GPUs con 4 GB.
- Opciones de despliegue: transformers (soporte nativo), text-generation-inference (TGI) según los tags, y potencialmente llama.cpp/Ollama si se generan cuantizaciones GGUF (no publicadas).
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Benchmarks publicados |
|---|---|---|---|---|---|
| cevher3 (bcckfdn/cevher3-test-11) | 1,25 B | 8192 | tr, en | Apache 2.0 | No |
| Gemma 2 2B | 2,6 B | 8192 | Multilingüe | Gemma Terms | Sí |
| Qwen2.5 1.5B | 1,5 B | 32768 | Multilingüe | Apache 2.0 | Sí |
| SmolLM2 1.7B | 1,7 B | 8192 | Inglés principalmente | Apache 2.0 | Sí |

La comparativa se basa en características públicas de modelos de tamaño similar; no se dispone de datos de rendimiento de cevher3 que permitan una comparación cuantitativa. cevher3 destaca por su especialización en turco, mientras que los alternativos tienen cobertura multilingüe más amplia y benchmarks publicados.

## Limitaciones y advertencias

- No se han publicado evaluaciones de sesgos; al estar entrenado predominantemente en turco e inglés, puede reflejar sesgos culturales y lingüísticos de esos corpus.
- Riesgo de alucinación inherente a modelos de 1,25 B de parámetros, especialmente en tareas de razonamiento complejo o conocimiento factual.
- Contexto limitado a 8192 tokens, inferior al de modelos contemporáneos con ventanas de 32K o más.
- Cobertura lingüística restringida a turco e inglés; no se garantiza un rendimiento aceptable en castellano u otros idiomas.
- La licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantías ni soporte; el modelo se publica como "test" y sin validación externa.
- Ausencia de benchmarks y de documentación sobre el dataset de entrenamiento dificulta evaluar su calidad y adecuación a dominios específicos.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que sugiere falta de validación por parte de la comunidad.

## Enlaces

- Hugging Face: https://huggingface.co/bcckfdn/cevher3-test-11
- No se han encontrado otros enlaces (papers, blogs, repositorios o demos) en la información disponible.
