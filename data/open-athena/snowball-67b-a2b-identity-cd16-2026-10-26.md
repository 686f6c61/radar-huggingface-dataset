# open-athena/Snowball-67B-A2B-Identity-CD16-2026.10.26

## Resumen

Snowball-67B-A2B-Identity-CD16-2026.10.26 es un checkpoint de investigación publicado por open-athena el 26 de octubre de 2026. Se trata de un ajuste fino supervisado (SFT) por destilación de contexto sobre el modelo base Marin-Snowball-67B-A2B-v0.1, también de open-athena. El objetivo concreto del entrenamiento es inculcar una identidad en primera persona ("I am Marin Snowball, an AI model created by Open Athena") sin necesidad de inyectar un system prompt en tiempo de inferencia. El profesor es el propio modelo base v0.1 condicionado con ese system prompt, y el estudiante aprende a reproducir esas respuestas sin él.

El modelo emplea una arquitectura de mezcla de expertos (MoE) con 67.078.882.816 parámetros totales y una activación de aproximadamente 2.000 millones por token (denotada A2B en el nombre). El repositorio ocupa 134,2 GB y contiene 502 tensores exportados en los tipos del modelo base: 476 pesos en BF16 y 26 sesgos de router en F32. La longitud de contexto del estudiante durante el entrenamiento se fijó en 8.192 tokens.

La relevancia de esta ficha es doble: por un lado, documenta una técnica poco habitual (destilación de contexto para control de identidad y persona) con un protocolo de filtrado y control de calidad humano detallado; por otro, el propio autor lo etiqueta explícitamente como artefacto de investigación no evaluado y no necesariamente seguro para producción. Es, por tanto, un caso de estudio de ingeniería de datos de post-entrenamiento más que un modelo listo para desplegar.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con mezcla de expertos (MoE), tag `grug_moe`, familia Marin Snowball |
| Parametros totales | 67.078.882.816 (67B) |
| Parametros activos | Aproximadamente 2B por token (sufijo A2B; cifra exacta no disponible) |
| Longitud de contexto | 8.192 tokens (límite de contexto del estudiante en entrenamiento) |
| Tipos de cuantizacion | No disponible (pesos publicados en BF16 y F32) |
| Idiomas soportados | No disponible |
| Licencia | openmdw-1.1 |
| Formato de pesos | safetensors (476 tensores BF16 + 26 tensores F32) |

## Arquitectura y entrenamiento

El modelo base es un transformer MoE de 67B parámetros totales con unos 2B activos por token, identificado en los tags como `grug_moe` dentro de la familia Marin Snowball. El checkpoint aquí descrito no modifica la arquitectura: aplica 16 actualizaciones de SFT por destilación de contexto sobre el commit `adc0078a19a4383bc998fcdb43867b3360baf5f3` del modelo v0.1, preservando los tipos de dato originales de todos los tensores.

El conjunto de datos de identidad consta de 220 filas generadas con el propio v0.1 como profesor, condicionado con el system prompt de identidad en primera persona. Se realizaron seis capturas con configuraciones de muestreo de temperatura 0,7, top_p 0,95 y un máximo de 8.192 tokens de finalización, con y sin modo de razonamiento (thinking on/off). Un filtro automático (versión 4, revisión 2) descartó respuestas incompletas, identidades erróneas, trazas repetitivas, menciones al system prompt, grafías no canónicas de "Marin Snowball" o "Open Athena", alias inventados y hechos de identidad no soportados. Sobre los candidatos restantes se aplicó control de calidad humano: 396 registros leídos en modo thinking on (201 conservados, 75 tras deduplicación y topes) y 291 en thinking off (158 conservados, 145 tras topes). Además se añadieron 547 filas de replay y control: 579 prompts de replay en thinking on (192 de matemáticas, 192 de código, 192 de chat y 64 de ficción, de los cuales 616 pasaron revisión semántica y 579 quedaron tras comprobar solapamiento con 5.377 registros de benchmarks públicos como GSM8K test, HumanEval, AIME 2024/2025, MATH500 y MBP) y 48 prompts de control de persona, tercera persona y negación. En total, cerca del 96% de los tokens supervisados provienen de filas no identitarias, y el 95% de todos los tokens son respuestas del propio v0.1 reproducidas para preservar su comportamiento; las filas de identidad suponen menos del 4% de los tokens.

## Capacidades

- Generación de texto y razonamiento en modo thinking on y thinking off, heredados del modelo base v0.1.
- Respuesta en primera persona con identidad canónica ("I am Marin Snowball, an AI model created by Open Athena") sin necesidad de system prompt.
- Reproducción del comportamiento del modelo base en matemáticas, código, chat y ficción gracias a los datos de replay (192 prompts de matemáticas, 192 de código, 192 de chat y 64 de ficción).
- Capacidad de negación y control de persona: filas específicas para rechazar identidades alternativas y mantener la persona en tercera persona cuando se solicita.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible; el autor no declara idiomas soportados.
- Capacidades de visión o audio: no disponible.

## Casos de uso

- Investigación sobre control de identidad y persona en LLM: el checkpoint sirve como referencia reproducible para estudiar cómo la destilación de contexto internaliza un system prompt en los pesos, con un dataset público que incluye filas, orden de entrenamiento y veredictos de control de calidad.
- Estudio de metodología de filtrado de datos: el filtro automático (versión 4, revisión 2) y el protocolo de doble revisor humano son un caso práctico para diseñar pipelines de curación de datos de post-entrenamiento.
- Reproducción de experimentos de SFT: el código de entrenamiento está disponible en Marin en el commit `cc127d54` (tag `snowball-identity-cd16-2026.10.26`), en `experiments/post_training/identity_context_distill/`, lo que permite reentrenar el checkpoint con datos mejorados.
- Evaluación de la preservación de capacidades tras SFT: al dedicar el 95% de los tokens a replay del modelo base, es un caso útil para medir deriva de comportamiento (regresión en matemáticas, código y chat) tras un ajuste de identidad.
- Análisis de seguridad y alineamiento: las filas de negación y control de persona permiten estudiar cómo un modelo aprende a rechazar identidades alternativas y a mantener coherencia de persona bajo presión conversacional.
- Base para experimentos de destilación de contexto en otros modelos MoE: la receta (profesor condicionado, estudiante sin system prompt, filtro por respuesta y razonamiento) es transferible a otros modelos de la familia Marin Snowball.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor declara explícitamente que el modelo es un artefacto de investigación que "no ha sido probado ni evaluado adecuadamente". El dataset de entrenamiento sí se comprobó contra 5.377 registros de benchmarks públicos (GSM8K test, HumanEval, AIME 2024 y 2025, MATH500 y MBP) para evitar solapamiento, pero no se reportan puntuaciones del modelo resultante.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Como referencia de orden de magnitud, 67B parámetros en BF16 requieren aproximadamente 134 GB de VRAM solo para pesos, lo que coincide con el tamaño del repositorio (134,2 GB).
- GPU recomendadas: no disponibles en la información proporcionada. Por tamaño, un despliegue en BF16 exigiría múltiples aceleradores de clase数据中心 (A100/H100 de 80 GB) o GPUs con memoria unificada; no se confirma compatibilidad con ninguna GPU concreta.
- ¿Cabe en GPU de consumo? No en BF16. No se dispone de confirmación de cuantizaciones GGUF o de que el modelo se haya probado en GPUs de consumo.
- Opciones de despliegue: no disponible. No se mencionan vLLM, llama.cpp, Ollama ni TGI en la información proporcionada; el formato publicado es safetensors.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros totales | Activos | Contexto | Licencia | Estado |
|---|---|---|---|---|---|
| Snowball-67B-A2B-Identity-CD16-2026.10.26 | 67B | ~2B (A2B) | 8.192 tokens (entrenamiento) | openmdw-1.1 | Checkpoint de investigación, sin evaluar |
| Marin-Snowball-67B-A2B-v0.1 (modelo base) | 67B | ~2B (A2B) | No disponible | openmdw-1.1 | Base de la familia, sin identidad internalizada |
| Alternativas de mismo tamaño y tarea | No disponible | No disponible | No disponible | No disponible | No disponible |

No se dispone de información sobre modelos comparables de otros autores en la misma categoría (MoE de ~67B con ~2B activos y ajuste de identidad por destilación de contexto). La comparación más directa y documentada es con su propio modelo base v0.1, del que difiere únicamente en las 16 actualizaciones de SFT de identidad.

## Limitaciones y advertencias

- El autor declara explícitamente que es un artefacto de investigación, no una release, y que no ha sido probado ni evaluado adecuadamente; no se garantiza su seguridad en producción.
- Riesgo de alucinación: no evaluado. El entrenamiento refuerza una identidad concreta, lo que puede aumentar la propensión a afirmar hechos de identidad no verificados si el filtro no los cubrió por completo.
- Sesgos conocidos: no disponibles. No se documenta ninguna evaluación de sesgos.
- Idiomas soportados: no declarados; se desconoce el comportamiento fuera del inglés, lengua de los prompts y respuestas del dataset.
- Contexto limitado a 8.192 tokens en entrenamiento; no se documenta soporte de ventanas mayores en inferencia.
- Restricciones de licencia: openmdw-1.1; no se detallan en la información proporcionada las condiciones exactas para uso comercial, por lo que debe consultarse el texto de la licencia antes de cualquier despliegue productivo.
- El dataset de identidad es pequeño (220 filas) y las filas de identidad suponen menos del 4% de los tokens supervisados; el equilibrio entre preservación del comportamiento base e internalización de la identidad puede ser frágil.
- Parte del código de generación de datos (capture library) no fue commiteado; `scripts/capture_lib/` es una instantánea posterior del árbol de trabajo, lo que limita la reproducibilidad exacta.
- El checkpoint está fechado en 2026 y asociado a un issue de seguimiento abierto (marin-community/marin#10695); puede ser reemplazado o retirado.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/open-athena/Snowball-67B-A2B-Identity-CD16-2026.10.26
- Modelo base: https://huggingface.co/open-athena/Marin-Snowball-67B-A2B-v0.1
- Dataset de entrenamiento: https://huggingface.co/datasets/open-athena/Snowball-67B-A2B-Identity-CD16-Data-2026.10.26
- Issue de seguimiento: https://github.com/marin-community/marin/issues/10695
- Commit de entrenamiento: https://github.com/marin-community/marin/commit/cc127d5420215679bfa45b7d0cbbfa201f1f025d
- Repositorio Marin: https://github.com/marin-community/marin
