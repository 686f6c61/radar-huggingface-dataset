# HeartMuLa/HeartMuLa-RL-oss-3B-20260123

## Resumen

HeartMuLa-RL-oss-3B-20260123 es un modelo de lenguaje musical de 3.938.113.536 parámetros (aproximadamente 3,9B) desarrollado por el equipo HeartMuLa y publicado bajo licencia Apache 2.0. Se trata de una versión del modelo base HeartMuLa-oss-3B refinada mediante aprendizaje por refuerzo (RL) para obtener un control más preciso sobre estilos y etiquetas musicales. El modelo genera canciones a partir de letras y etiquetas de estilo, produciendo tokens que deben ser decodificados a audio por un modelo separado, HeartCodec-oss-20260123.

El modelo se enmarca en la familia HeartMuLa de modelos fundacionales de música open source, presentada en el paper arXiv 2601.10547. Su pipeline declarado es text-to-audio y soporta cinco idiomas (chino, inglés, japonés, coreano y español, además de la etiqueta multilingual). El repositorio ocupa 15,8 GB y los pesos están en formato safetensors.

Es relevante ahora porque ofrece generación musical condicionada por letras y estilos con licencia permisiva, algo poco habitual en el ecosistema open source, y porque el refinamiento por RL busca mejorar la fidelidad al control de estilo frente al modelo base. La model card recomienda, no obstante, HeartMuLa-oss-3B-happy-new-year para la mejor controlabilidad de letras y calidad musical global.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | modelo de lenguaje musical (text-to-audio); arquitectura concreta no disponible |
| Parámetros totales | 3.938.113.536 (≈3,9B) |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible |
| Idiomas soportados | multilingual, zh, en, ja, ko, es |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La información disponible indica que HeartMuLa-RL-oss-3B-20260123 es una versión del modelo HeartMuLa-oss-3B refinada con aprendizaje por refuerzo para lograr un control más preciso sobre estilos y etiquetas. El modelo opera como un modelo de lenguaje musical: recibe letras y etiquetas de estilo y emite tokens que un codec separado (HeartCodec-oss-20260123) decodifica en audio. No se detalla en la información proporcionada la arquitectura interna (tipo de transformer, mecanismos de atención, número de capas ni dimensión oculta), ni el volumen o composición exacta de los datos de entrenamiento, ni los detalles del proceso de RL (algoritmo, función de recompensa, datos de preferencia).

La innovación técnica destacable es el uso de RL para el alineamiento con el control de estilo, así como la separación en dos etapas (modelo de lenguaje musical + codec de audio), que permite tratar la generación musical como un problema de modelado de secuencias de tokens. Los detalles completos deben consultarse en el paper arXiv 2601.10547 y en el repositorio heartlib.

## Capacidades

- Generación de música a partir de letras y etiquetas de estilo (text-to-audio).
- Control refinado de estilos y tags gracias al entrenamiento por RL.
- Generación de canciones completas condicionadas por letras en varios idiomas.
- Soporte multilingüe declarado: chino, inglés, japonés, coreano y español.
- Integración con HeartCodec-oss-20260123 para la decodificación de tokens a audio.
- Edición de pasajes de una canción y creación de covers y remixes a través de la plataforma MuLa Studio (según la model card).
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Modo thinking, visión o audio de entrada: no disponible.

## Casos de uso

- Generación de canciones con letra y estilo definidos: el modelo recibe la letra y las etiquetas de estilo y produce los tokens musicales que HeartCodec decodifica a audio, lo que permite crear demos musicales completas sin intervención humana en la composición.
- Prototipado rápido de jingles y música publicitaria: con control de estilo por tags, un equipo de marketing puede iterar variaciones de una misma letra cambiando el estilo (género, mood, instrumentación) para elegir la versión más adecuada.
- Creación de covers y remixes: la plataforma y el modelo permiten reestilizar una canción existente manteniendo la letra, útil para sellos discográficos que quieran explorar versiones alternativas de un tema.
- Edición localizada de pasajes musicales: en MuLa Studio se puede editar cualquier fragmento de una canción, lo que encaja en flujos de postproducción donde solo una sección necesita regenerarse.
- Localización musical multilingüe: al soportar zh, en, ja, ko y es, el modelo puede generar versiones cantadas de una misma letra en distintos idiomas para mercados internacionales.
- Generación de música de fondo para vídeo y podcasts: al condicionar por estilo, se pueden producir pistas instrumentales o vocales adaptadas a la duración y el tono de un proyecto audiovisual.
- Educación musical y experimentación: investigadores y estudiantes pueden estudiar el efecto del RL en el control de estilos comparando esta versión con el modelo base HeartMuLa-oss-3B.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada. Con 3,9B parámetros en safetensors, los pesos en precisión completa ocuparían aproximadamente 15,8 GB (tamaño del repo), y en FP16 alrededor de 7,9 GB; estas cifras son estimaciones a partir del número de parámetros, no datos publicados.
- GPU recomendadas: no disponible.
- ¿Cabe en GPU consumer? No confirmado; por tamaño de parámetros, una GPU con 16-24 GB de VRAM podría alojar los pesos en FP16 o cuantizados, pero no hay datos publicados que lo confirmen.
- Opciones de despliegue: el repositorio heartlib indica instalación, disposición de checkpoints e inferencia; no se especifican integraciones con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| HeartMuLa-RL-oss-3B-20260123 | ≈3,9B | no disponible | Apache 2.0 | safetensors | Hugging Face |
| HeartMuLa-oss-3B (base) | ≈3,9B (misma familia) | no disponible | Apache 2.0 | safetensors | Hugging Face |
| HeartMuLa-oss-3B-happy-new-year | no disponible | no disponible | Apache 2.0 | safetensors | Hugging Face |

La model card recomienda HeartMuLa-oss-3B-happy-new-year por encima de esta versión RL en términos de controlabilidad de letras y calidad musical. No se dispone de datos de rendimiento comparativo entre estas variantes en la información proporcionada.

## Limitaciones y advertencias

- La model card recomienda otro checkpoint (HeartMuLa-oss-3B-happy-new-year) para la mejor controlabilidad de letras y calidad musical, lo que sugiere que esta versión RL puede no ser la opción óptima en esos aspectos.
- El modelo no produce audio directamente: requiere HeartCodec-oss-20260123 para decodificar los tokens, lo que añade complejidad al pipeline de despliegue.
- No se documentan sesgos conocidos, riesgos de alucinación ni limitaciones de contexto o idioma en la información disponible.
- Licencia Apache 2.0: permite uso comercial, pero deben respetarse las condiciones de atribución de la licencia.
- No se detallan requisitos de hardware ni rendimiento, lo que dificulta planificar un despliegue en producción.
- La fecha de creación (2026-01-23) y el número de descargas (397) indican un modelo reciente con adopción limitada; conviene validar su calidad en el caso de uso concreto antes de integrarlo.

## Enlaces

- Hugging Face: https://huggingface.co/HeartMuLa/HeartMuLa-RL-oss-3B-20260123
- Codec asociado: https://huggingface.co/HeartMuLa/HeartCodec-oss-20260123
- Checkpoint recomendado: https://huggingface.co/HeartMuLa/HeartMuLa-oss-3B-happy-new-year
- Repositorio GitHub: https://github.com/HeartMuLa/heartlib
- Paper: https://arxiv.org/abs/2601.10547
- Demo: https://heartmula.github.io/
- Web oficial: https://heartmula.com
