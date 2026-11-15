# mradermacher/LegalTrace-Qwen3-4B-LSI-GGUF

## Resumen

LegalTrace-Qwen3-4B-LSI-GGUF es la versión cuantizada en formato GGUF del modelo spicysweetner/LegalTrace-Qwen3-4B-LSI, un ajuste fino (fine-tuning) de Qwen3-4B orientado a la identificación de estatutos legales, con especial énfasis en el Código Penal de la India (Indian Penal Code). El trabajo de cuantización lo ha realizado mradermacher, un conocido publicador de versiones GGUF de modelos open source, que distribuye los pesos en múltiples niveles de compresión para facilitar su ejecución en hardware de consumo.

El modelo base cuenta con 4.022.468.096 parámetros (aproximadamente 4B), lo que lo sitúa en la gama de modelos pequeños capaces de ejecutarse en GPUs de consumo. La tarea objetivo es la identificación de secciones y artículos legales relevantes para un caso descrito por el usuario, un caso de uso de recuperación de información jurídica especializada. La licencia es Apache 2.0 y el idioma soportado es exclusivamente inglés.

La relevancia de esta ficha radica en que combina un modelo de razonamiento generalista (Qwen3) con un ajuste fino de dominio legal, y se ofrece en cuantizaciones que van desde 1,8 GB (Q2_K) hasta 8,2 GB (f16), lo que permite desplegarlo en entornos con recursos limitados. No se dispone de información sobre benchmarks publicados ni sobre el proceso de entrenamiento del ajuste fino.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer causal (base Qwen3-4B); detalles específicos del ajuste no disponibles |
| Parámetros totales | 4.022.468.096 (4,02B) |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (cuantizaciones estáticas); repo de 36,4 GB con todos los ficheros |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Qwen3-4B, un transformer causal decoder-only. El modelo original ha sido ajustado por spicysweetner para la tarea de identificación de estatutos legales (legal statute identification), con etiquetas que indican especialización en el Código Penal de la India. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, ni si se emplearon técnicas de RLHF o DPO en el ajuste fino.

El trabajo de mradermacher consiste en la conversión y cuantización estática del modelo base a formato GGUF, con cuantizaciones que van desde 2 bits (Q2_K, 1,8 GB) hasta 16 bits (f16, 8,2 GB). Según la model card, no se han generado cuantizaciones ponderadas con imatrix en el momento de la publicación. No se documentan innovaciones técnicas adicionales como decodificación especulativa o atención lineal.

## Capacidades

- Generación de texto y razonamiento en inglés, heredados del modelo base Qwen3-4B.
- Identificación de estatutos legales: dado un supuesto de hecho, el modelo está ajustado para señalar las secciones del Código Penal de la India potencialmente aplicables.
- Conversación multi-turno (etiqueta "conversational" en los tags del repo).
- Compatibilidad con endpoints (etiqueta "endpoints_compatible").
- Modelo causal para generación autoregresiva.
- Capacidades multilingües: limitadas al inglés según la model card.
- No se documenta soporte explícito de tool calling, function calling, agentes o modos de razonamiento extendido (thinking mode) en la información disponible.

## Casos de uso

- Asistencia a la investigación jurídica en el ámbito del derecho penal indio: el modelo puede recibir una descripción de hechos y devolver las secciones del IPC candidatas, acelerando la búsqueda inicial de un abogado o estudiante.
- Herramienta de formación para estudiantes de derecho: permite practicar la calificación jurídica de supuestos prácticos con retroalimentación inmediata sobre las secciones aplicables.
- Primer filtro en pipelines de documentación legal: integrado en un sistema mayor, preclasifica consultas y reduce el espacio de búsqueda antes de la revisión por un experto humano.
- Despliegue en entornos con recursos limitados: las cuantizaciones Q4_K_S (2,5 GB) o Q4_K_M (2,6 GB) permiten ejecutarlo en portátiles con GPU modesta o incluso en CPU, lo que facilita prototipos y demos.
- Generación de borradores de análisis legal: el modelo puede redactar explicaciones preliminares que citan las secciones relevantes, siempre sujetas a revisión profesional.
- Investigación académica en NLP jurídico: sirve como línea base ajustada para experimentos de recuperación de estatutos y comparación con otros enfoques.
- Chatbot de orientación legal preliminar: con las advertencias oportunas, puede ofrecer información orientativa sobre qué disposiciones podrían aplicar en un caso descrito por el usuario.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (según cuantización): Q2_K ~1,8 GB; Q4_K_S ~2,5 GB; Q4_K_M ~2,6 GB; Q6_K ~3,4 GB; Q8_0 ~4,4 GB; f16 ~8,2 GB (más overhead de contexto y KV cache).
- GPU recomendadas: cualquier GPU con al menos 4-6 GB de VRAM para cuantizaciones Q4; RTX 3060/4060 o superiores; A100/H100 no son necesarias para este tamaño.
- Cabe en GPU de consumo: sí, en la mayoría de GPUs modernas con 6 GB o más para Q4_K_M; las cuantizaciones Q2 y Q3 caben en GPUs de 4 GB.
- Opciones de despliegue: llama.cpp, Ollama, y cualquier runtime compatible con GGUF (LM Studio, text-generation-webui, etc.).
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Especialización | Licencia | Formato |
|---|---|---|---|---|---|
| LegalTrace-Qwen3-4B-LSI-GGUF (este) | 4,02B | No disponible | Estatutos legales (IPC India) | Apache 2.0 | GGUF |
| Qwen3-4B (base) | ~4B | No disponible | Generalista | Apache 2.0 | Safetensors, GGUF |
| Modelos legales pequeños (p. ej. variantes de Llama/Mistral ajustadas a derecho) | ~7-8B típicamente | Variable | Dominio legal general | Variable | Variable |

No se dispone de datos de rendimiento comparativo entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- El modelo está ajustado específicamente al Código Penal de la India; su utilidad fuera de esa jurisdicción es muy limitada.
- Idioma exclusivamente inglés: no soporta consultas en castellano ni en otras lenguas.
- Riesgo de alucinación: al ser un modelo de 4B ajustado, puede citar secciones inexistentes o mal atribuidas; toda salida debe verificarse contra el texto legal oficial.
- No sustituye el asesoramiento jurídico profesional; su uso en producción para decisiones legales requiere supervisión humana.
- No se han publicado benchmarks, por lo que el rendimiento real en la tarea objetivo no está cuantificado.
- Las cuantizaciones de baja precisión (Q2_K, Q3_K_S) pueden degradar notablemente la calidad; se recomienda Q4_K_M o superior para uso serio.
- No se documentan salvaguardas específicas contra sesgos; el modelo hereda los sesgos del corpus de entrenamiento de Qwen3 y del dataset de ajuste.
- Licencia Apache 2.0 permite uso comercial, pero la responsabilidad sobre el uso legal recae en el implementador.

## Enlaces

- Repositorio Hugging Face (este modelo): https://huggingface.co/mradermacher/LegalTrace-Qwen3-4B-LSI-GGUF
- Modelo base del ajuste fino: https://huggingface.co/spicysweetner/LegalTrace-Qwen3-4B-LSI
- Página de descargas del cuantizador: https://hf.tst.eu/model#LegalTrace-Qwen3-4B-LSI-GGUF
- Guía de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Solicitudes de cuantización de mradermacher: https://huggingface.co/mradermacher/model_requests
- Análisis de tipos de cuantización (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Empresa del cuantizador: https://www.nethype.de/
