# Kainxkitsune/Cyrogen-Vesper

## Resumen

Cyrogen-Vesper es un modelo de lenguaje de tipo *merge* (fusión de pesos) publicado por el usuario Kainxkitsune en Hugging Face. Se construye a partir de dos modelos base: `ReadyArt/Vesper-26B-A4B-Nocturne` y `zerofata/G4-MeroMero-26B-A4B`. Por la nomenclatura de ambos progenitores ("26B-A4B"), todo apunta a una arquitectura de mezcla de expertos (MoE) con aproximadamente 26 mil millones de parámetros totales y unos 4 mil millones de parámetros activos por token, aunque el autor no detalla la arquitectura en la model card.

El modelo está orientado explícitamente a *roleplay* conversacional para adultos, con etiquetas como `nsfw`, `adult-content`, `uncensored` y `mature`. No incluye datos de benchmarks, curvas de entrenamiento ni detalles del proceso de fusión. La model card es fundamentalmente una pieza de presentación visual (HTML/CSS personalizado) y no aporta información técnica sustantiva sobre el entrenamiento, el dataset o las capacidades medidas.

Es relevante ahora únicamente dentro del nicho de modelos sin censura para narrativa interactiva y personajes, donde la comunidad publica fusiones con frecuencia. Para cualquier uso generalista, de código o de razonamiento, no hay evidencia publicada que lo respalde.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | MoE (inferida de la nomenclatura "26B-A4B" de los modelos base; no confirmada en la model card) |
| Parámetros totales | ~26B (inferido del nombre de los modelos base; no confirmado) |
| Parámetros activos | ~4B (inferido de "A4B"; no confirmado) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (el repo no contiene pesos: tamaño 0.0 GB) |
| Idiomas soportados | inglés (`en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | no disponible (repositorio vacío en el momento de la consulta) |

## Arquitectura y entrenamiento

No hay información publicada sobre la arquitectura interna más allá de la etiqueta `moe` y de la nomenclatura de los modelos base, que sugiere un transformer con mezcla de expertos de ~26B totales y ~4B activos. El modelo es una fusión de pesos (*merge*) de `ReadyArt/Vesper-26B-A4B-Nocturne` y `zerofata/G4-MeroMero-26B-A4B`; el autor no especifica el método de fusión (por ejemplo, SLERP, TIES, DARE o linear), ni las capas afectadas, ni los ratios aplicados.

No se documentan datos de entrenamiento, número de tokens, composición del corpus, ni fases de RLHF, DPO o ajuste instruct. Tampoco se describen innovaciones técnicas como decodificación especulativa o atención lineal. Cualquier afirmación sobre el proceso de entrenamiento sería especulativa.

## Capacidades

- Generación de texto conversacional en inglés, orientada a diálogos multi-turno de rol.
- Contenido para adultos sin censura declarada (etiquetas `nsfw`, `uncensored`, `mature`).
- Mantenimiento de personajes y estilo narrativo en sesiones de roleplay (capacidad declarada por el propósito del modelo, no medida).
- Soporte de *tool calling* / *function calling*: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: limitadas al inglés según la model card.
- Capacidades especiales (modo *thinking*, visión, audio): no disponibles.

## Casos de uso

- Roleplay conversacional para adultos: el modelo está diseñado para sostener personajes y narrativa interactiva sin filtros de contenido, lo que encaja en plataformas de ficción interactiva y comunidades de rol.
- Creación de ficción serializada: generación de capítulos y diálogos con continuidad de personaje en sesiones largas, siempre que la ventana de contexto real del modelo base lo permita (dato no publicado).
- Prototipado de chatbots de personaje: sirve como backend para demos de asistentes con personalidad definida, dado su enfoque conversacional.
- Investigación sobre alineación y censura: útil como caso de estudio de modelos sin filtros para analizar comportamientos, sesgos y riesgos en entornos controlados.
- Generación de guiones para narrativa ramificada: producción de ramas de diálogo y variantes de escena en herramientas de escritura asistida.
- Evaluación comparativa de fusiones: como muestra de técnicas de *merge* de modelos MoE para estudiar cómo se combinan comportamientos de dos bases distintas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible con precisión; para un MoE de ~26B totales y ~4B activos, una cuantización de 4 bits requeriría del orden de 13-16 GB solo para pesos, más overhead de contexto y caché KV (estimación orientativa, no confirmada por el autor).
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no confirmada; probablemente viable en GPUs de 24 GB (RTX 3090/4090) con cuantización agresiva si el modelo se publica en GGUF, pero no hay pesos ni confirmación.
- Opciones de despliegue: no disponible (el repositorio no contiene pesos en el momento de la consulta, por lo que no se puede confirmar compatibilidad con vLLM, llama.cpp, Ollama o TGI).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Cyrogen-Vesper | ~26B totales / ~4B activos (inferido) | no disponible | Roleplay NSFW, merge MoE | Apache 2.0 | Repo sin pesos |
| ReadyArt/Vesper-26B-A4B-Nocturne | ~26B / ~4B (inferido) | no disponible | Roleplay, base del merge | no disponible | Hugging Face |
| zerofata/G4-MeroMero-26B-A4B | ~26B / ~4B (inferido) | no disponible | Roleplay, base del merge | no disponible | Hugging Face |

No se dispone de datos de rendimiento comparativo entre estas variantes.

## Limitaciones y advertencias

- Contenido para adultos: el modelo está etiquetado como `not-for-all-audiences` y `nsfw`; no es apto para entornos públicos, educativos o productos dirigidos a menores.
- Sin datos de entrenamiento ni evaluación: no hay benchmarks, por lo que no se puede verificar calidad, coherencia ni seguridad.
- Riesgo de alucinación: sin evaluación publicada, el riesgo es desconocido y presumiblemente alto en tareas factuales.
- Sesgos: no documentados; los modelos de roleplay sin censura suelen reproducir sesgos de sus corpus de origen, pero no hay análisis disponible.
- Idioma: solo inglés declarado; el rendimiento en castellano no está evaluado y probablemente sea deficiente.
- Licencia Apache 2.0: permite uso comercial según los términos de la licencia, pero el contenido generado puede infringir políticas de plataformas y normativas sobre contenido adulto.
- Repositorio sin pesos: el tamaño de 0.0 GB indica que no hay archivos de modelo publicados en el momento de la consulta, lo que impide su uso directo.
- Sin soporte de *tool calling* ni agentes documentado: no recomendable para pipelines de automatización.

## Enlaces

- Hugging Face: https://huggingface.co/Kainxkitsune/Cyrogen-Vesper
- Modelo base 1: https://huggingface.co/ReadyArt/Vesper-26B-A4B-Nocturne
- Modelo base 2: https://huggingface.co/zerofata/G4-MeroMero-26B-A4B
