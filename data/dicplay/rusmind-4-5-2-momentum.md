# DICPlay/RusMind-4.5.2-Momentum

## Resumen
RusMind 4.5.2 · Моментум es un modelo de lenguaje de tipo Mixture of Experts (MoE) desarrollado por DICPlay, presentado como parte de la familia RusMind de nueva generación (4.5). Se trata de un fine-tune del modelo base google/gemma-4-E2B-it, orientado a generación de texto conversacional en ruso e inglés, con un enfoque explícito en despliegue on-device y funcionamiento offline. El modelo cuenta con 4.647.450.147 parámetros totales, de los cuales aproximadamente 2.000 millones se activan por token, lo que le permite ejecutarse en portátiles, PC convencionales y teléfonos móviles.

El modelo se distribuye principalmente en formato GGUF para su uso con llama.cpp, LM Studio y Ollama, y está pensado para inferencia local en el navegador o en dispositivos sin conexión. Su relevancia radica en que, pese a su reducido número de parámetros activos, el autor afirma que supera en el benchmark ruso MERA v2 a modelos de 4 a 12 veces más parámetros activos, incluyendo alternativas de Google, Alibaba, Mistral y T-Bank.

La versión 4.5.2 introduce mejoras en lógica, acertijos, humor, palabras con significados opuestos, cumplimiento preciso de restricciones de longitud en tareas creativas y precisión en cuestiones históricas. El autor recomienda migrar a la versión posterior RusMind 4.7 · Моментум, que según la model card obtiene 0,136 en MERA v2.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Mixture of Experts (MoE) sobre base google/gemma-4-E2B-it (transformer) |
| Parámetros totales | 4.647.450.147 |
| Parámetros activos | ~2.000 millones por token |
| Longitud de contexto | no disponible |
| Tipos de cuantización | GGUF (cuantizaciones concretas no disponibles) |
| Idiomas soportados | ruso (ru), inglés (en) |
| Licencia | rusmind-license (license: other) |
| Formato de pesos | GGUF (librería gguf); pesos safetensors no disponibles en el repo |

## Arquitectura y entrenamiento
El modelo se basa en google/gemma-4-E2B-it, un transformer con arquitectura Mixture of Experts. Con 4.647.450.147 parámetros totales y aproximadamente 2.000 millones activos por token, el diseño prioriza la eficiencia computacional en inferencia: solo una fracción de los parámetros se activa en cada paso, lo que reduce el coste de cómputo y permite ejecución en hardware modesto. El modelo es un fine-tune (base_model_relation: finetune) del modelo base de Google, aunque la model card no detalla el volumen de tokens de entrenamiento, la composición del dataset ni si se emplearon técnicas de RLHF o DPO.

La información disponible no especifica innovaciones técnicas adicionales como decodificación especulativa, atención lineal u otras optimizaciones. El énfasis del autor está en el ajuste fino orientado a ruso (cultura, regiones de Rusia, comprensión de personas, corrección ortográfica y de puntuación) y en la distribución en GGUF para inferencia local offline.

## Capacidades
- Generación de texto conversacional en ruso e inglés.
- Razonamiento y resolución de problemas lógicos, acertijos y tareas de razonamiento multi-paso.
- Comprensión de humor, personajes y palabras con significados opuestos (antónimos contextuales).
- Cumplimiento preciso de restricciones de formato y longitud en tareas creativas (número de párrafos, puntos o palabras).
- Conocimiento histórico con capacidad de corregir errores en la pregunta y citar fechas principales.
- Corrección ortográfica y de puntuación en ruso (el autor reporta 0,719 en esta tarea dentro de MERA v2 para la variante 4.7, no para 4.5.2).
- Soporte de tool calling / function calling (mencionado en la model card para la variante 4.7; para 4.5.2 no se detalla explícitamente).
- Capacidades multilingües limitadas a ruso e inglés.
- Ejecución on-device y offline en navegador, teléfono, portátil y PC.

## Casos de uso
- Asistentes conversacionales locales en ruso: el modelo puede gestionar diálogos multi-turno directamente en el dispositivo sin conexión, lo que lo hace adecuado para aplicaciones de privacidad estricta donde los datos no deben salir del terminal.
- Corrección y edición de textos en ruso: gracias a su ajuste específico en ortografía y puntuación, puede integrarse en editores o procesadores de texto para revisión automática de borradores.
- Aplicaciones educativas de historia y cultura rusa: su capacidad para citar fechas principales y detectar errores en las preguntas lo hace útil en tutores o cuestionarios interactivos.
- Generación creativa con restricciones: redacción de textos con requisitos exactos de longitud (número de párrafos, puntos o palabras), útil en marketing de contenidos o generación de resúmenes estructurados.
- Chatbots de atención al cliente en ruso para entornos con conectividad limitada: al ejecutarse en GGUF con llama.cpp u Ollama, puede desplegarse en infraestructura local sin depender de APIs externas.
- Procesamiento de lenguaje natural en el navegador: su reducido número de parámetros activos (~2.000 millones) permite ejecución en el navegador mediante WebAssembly o llama.cpp compilado, habilitando demos interactivas sin backend.
- Análisis de sentimiento y comprensión de personas: su enfoque en tareas "humanocéntricas" (№1 entre modelos de hasta 5.000 millones según el autor) lo hace adecuado para moderación de contenido o análisis de opiniones en ruso.

## Benchmarks y rendimiento
La model card proporciona datos de MERA v2 (Multimodal Evaluation for Russian-language Architectures), un benchmark independiente gestionado por la Alianza en el ámbito de la IA (Sber, Yandex, MTS, VK, Gazprom Neft y RFI). Los resultados citados para RusMind 4.5.2 · Моментум son parciales: se ofrece la puntuación en la sección de razonamiento (Reasoning) y referencias cualitativas a posiciones (#1 en cultura y regiones de Rusia entre modelos de hasta 5.000 millones, #1 en tareas humanocéntricas entre modelos de hasta 5.000 millones). No se dispone de la puntuación global de MERA v2 para 4.5.2 en la información proporcionada.

| Benchmark / sección | RusMind 4.5.2 · Моментум (~2.000 M activos) | T-lite · T-Bank (8.000 M) | Zero-Mistral (24.000 M) | A-Vibe · Avito (8.000 M) |
|---|---|---|---|---|
| MERA v2 — Reasoning | 0,225 | 0,218 | 0,213 | 0,187 |
| MERA v2 — puntuación global | no disponible | no disponible | no disponible | no disponible |
| MERA v2 — cultura y regiones de Rusia | no disponible (el autor afirma #1 en <5.000 M) | no disponible | no disponible | no disponible |
| MERA v2 — tareas humanocéntricas | no disponible (el autor afirma #1 en <5.000 M) | no disponible | no disponible | no disponible |

No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K u otros) en la información disponible.

## Requisitos de hardware
- VRAM estimada para inferencia: no disponible de forma oficial. Como referencia orientativa, un modelo MoE de 4.650 millones de parámetros totales en GGUF Q4 requiere aproximadamente 3-4 GB de almacenamiento y VRAM proporcional al tamaño de los pesos cuantizados; el autor no publica cifras exactas.
- GPU recomendadas: no disponibles en la información proporcionada. El modelo está diseñado para ejecución en CPU y en hardware de consumo.
- Cabe en GPU de consumo: sí, según el autor, en portátiles, PC convencionales y teléfonos móviles; se menciona explícitamente ejecución en el navegador y en dispositivos sin conexión.
- Opciones de despliegue: llama.cpp, LM Studio, Ollama (mencionados en la model card); también compatible con endpoints (tag endpoints_compatible).
- Latencia y throughput estimados: no disponibles. El autor destaca que "vuela" en navegador y teléfono gracias a los ~2.000 millones de parámetros activos, pero no se aportan métricas de tokens por segundo.

## Comparativa con modelos similares

| Modelo | Parámetros totales / activos | Contexto | MERA v2 (Reasoning) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| RusMind 4.5.2 · Моментум | 4.650 M / ~2.000 M | no disponible | 0,225 | rusmind-license | GGUF en Hugging Face |
| T-lite · T-Bank | 8.000 M / no disponible | no disponible | 0,218 | no disponible | no disponible |
| Zero-Mistral | 24.000 M / no disponible | no disponible | 0,213 | no disponible | no disponible |
| A-Vibe · Avito | 8.000 M / no disponible | no disponible | 0,187 | no disponible | no disponible |
| Gemma 4 E2B · Google (base) | 5.000 M (según model card) / no disponible | no disponible | no disponible | licencia Gemma | disponible en Hugging Face |

El autor sitúa a RusMind 4.5.2 por delante de T-lite (8.000 M), Zero-Mistral (24.000 M) y A-Vibe (8.000 M) en la sección de razonamiento de MERA v2, y afirma que supera a Gemma 4 E2B y Qwen3.5-4B en la puntuación global (sin cifras concretas para 4.5.2 en la información disponible). No se dispone de datos de contexto ni de otras métricas comparativas.

## Limitaciones y advertencias
- Sesgos conocidos: no documentados explícitamente en la información disponible; al estar ajustado sobre datos rusos, puede presentar sesgos culturales o geográficos propios del corpus de entrenamiento.
- Riesgo de alucinación: no cuantificado; como modelo generativo de pequeño tamaño, es susceptible de inventar datos, especialmente en tareas factuales fuera del dominio ruso.
- Limitaciones de contexto: la longitud de contexto no está publicada, lo que impide evaluar su idoneidad para tareas de contexto largo.
- Limitaciones de idioma: solo ruso e inglés; no se garantiza un rendimiento aceptable en castellano ni en otras lenguas.
- Restricciones de licencia: la licencia rusmind-license (license: other) no detalla en la información proporcionada las condiciones de uso comercial; es necesario consultar el archivo LICENSE del repositorio antes de un despliegue en producción.
- Caveats para producción: el modelo se distribuye únicamente en GGUF (no hay safetensors en el repo), lo que limita su uso con frameworks que requieran pesos completos; además, el autor recomienda migrar a la versión 4.7, lo que sugiere que 4.5.2 puede considerarse una versión intermedia.
- El modelo es un fine-tune de Gemma 4 E2B-it; hereda las limitaciones del modelo base de Google, no detalladas en la información disponible.

## Enlaces
- Hugging Face: https://huggingface.co/DICPlay/RusMind-4.5.2-Momentum
- Demo / plataforma: https://rusmind.ru
- Benchmark MERA v2: https://mera.a-ai.ru/ru/text/leaderboard
- Versión posterior recomendada (4.7 · Моментум): https://huggingface.co/DICPlay/RusMind-4.7-Momentum
- RusMind 4.7 · Сокол: https://huggingface.co/DICPlay/RusMind-Sokol-4.7
- RusMind 4.7 · Вспышка: https://huggingface.co/DICPlay/RusMind-Vspyshka-4.7
- Modelo base: https://huggingface.co/google/gemma-4-E2B-it
