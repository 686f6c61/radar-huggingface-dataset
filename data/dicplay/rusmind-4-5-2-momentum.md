# DICPlay/RusMind-4.5.2-Momentum

## Resumen

RusMind 4.5.2 · Momentum es un modelo de lenguaje conversacional desarrollado por DICPlay, presentado como parte de su familia "RusMind" de modelos de IA "nacional" rusa. Se distribuye principalmente como pesos GGUF para inferencia local y sin conexión mediante llama.cpp, LM Studio u Ollama, y está afinado a partir de `google/gemma-4-E2B-it`. Su propuesta central es ofrecer buen rendimiento en ruso (y en menor medida en inglés) con un coste computacional muy bajo, pensado para ejecutarse en portátiles, ordenadores de sobremesa convencionales e incluso teléfonos.

El modelo emplea una arquitectura de tipo Mixture of Experts (según la información del autor, con 4,6 mil millones de parámetros totales y aproximadamente 2 mil millones activos por token), lo que explica su ligereza en inferencia pese a su tamaño total. El repositorio ocupa 9,3 GB y contiene pesos cuantizados en formato GGUF.

Es relevante ahora porque el autor lo sitúa en el benchmark ruso MERA v2 (gestionado por el Alianza en el ámbito de la IA, con Sber, Yandex, MTS y VK entre otros) como líder entre modelos de menos de 5 mil millones de parámetros en cultura y regiones de Rusia, y por delante de modelos mucho mayores en tareas de razonamiento. No obstante, la mayor parte de estas afirmaciones provienen de la propia model card y no se han verificado de forma independiente en la información disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture of Experts (MoE) sobre base Gemma 4 E2B (según model card) |
| Parametros totales | 4.647.450.147 (~4,6 mil millones) |
| Parametros activos | ~2 mil millones (según model card) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF (cuantizaciones concretas no especificadas); repo de 9,3 GB |
| Idiomas soportados | Ruso (ru), inglés (en) |
| Licencia | rusmind-license (licencia "other", propietaria del autor) |
| Formato de pesos | GGUF (librería gguf; compatible con llama.cpp) |

## Arquitectura y entrenamiento

El modelo es un fine-tuning de `google/gemma-4-E2B-it`, según declara el campo `base_model` y la relación `finetune`. La model card describe una arquitectura de mezcla de expertos con 4,6 mil millones de parámetros totales y unos 2 mil millones activos por token, lo que reduce el coste de cómputo en inferencia. No se detallan en la información disponible el número de tokens de entrenamiento, la composición del dataset de ajuste fino, ni si se aplicaron técnicas de RLHF o DPO.

La información proporcionada no incluye detalles sobre innovaciones técnicas concretas (decodificación especulativa, atención lineal, etc.) más allá del diseño MoE y de su orientación a ejecución en dispositivo (on-device, offline). El autor menciona mejoras en la versión 4.5.2 en lógica, acertijos, humor, palabras con significados opuestos, cumplimiento de restricciones creativas de longitud e historia (fechas y corrección de errores en las preguntas).

## Capacidades

- Generación de texto conversacional en ruso e inglés.
- Razonamiento y resolución de problemas lógicos y acertijos (según mejoras declaradas en 4.5.2).
- Comprensión de humor, juegos de palabras y términos con significados opuestos.
- Seguimiento de instrucciones con restricciones de formato y longitud (número de párrafos, puntos o palabras).
- Conocimiento de historia y cultura rusa, incluyendo corrección de errores factuales en las preguntas.
- Ejecución local y sin conexión en dispositivos de consumo (portátiles, PC, teléfonos).
- Soporte de llamada a herramientas (tool calling) mencionado en la model card para modelos de la familia (no confirmado específicamente para 4.5.2).
- Compatible con endpoints (tag `endpoints_compatible`).

## Casos de uso

- Asistente conversacional local en ruso: el modelo puede mantener conversaciones multi-turno en un portátil o teléfono sin conexión, adecuado para entornos con requisitos de privacidad o sin red.
- Atención al cliente en ruso: útil para respuestas automatizadas en escenarios de soporte de baja latencia, dado su reducido número de parámetros activos.
- Procesamiento de texto en dispositivos de borde (edge computing): integrable en aplicaciones de escritorio o móviles mediante llama.cpp u Ollama para tareas de resumen y redacción.
- Generación de contenido creativo con restricciones: redacción de textos con límites de párrafos, puntos o palabras, aprovechando la mejora declarada en el cumplimiento de instrucciones de formato.
- Educación y divulgación histórica: respuestas sobre fechas y hechos históricos de Rusia, con capacidad declarada de señalar errores en las preguntas.
- Prototipado y experimentación con modelos MoE ligeros: útil para investigadores que quieran evaluar técnicas de ajuste fino sobre una base Gemma 4 E2B en un entorno GGUF.
- Asistente de escritorio offline para documentación técnica en inglés y ruso, si se confirma el soporte de tool calling.

## Benchmarks y rendimiento

La model card incluye resultados del benchmark MERA v2 (plataforma externa que evalúa modelos en ruso). No se han publicado en la información disponible resultados de benchmarks estándar como MMLU, HumanEval o GSM8K para este modelo concreto.

| Benchmark (MERA v2) | RusMind 4.5.2 Momentum | T-lite (T-Bank, 8B) | Zero-Mistral (24B) | A-Vibe (Avito, 8B) |
|---|---|---|---|---|
| Puesto en cultura y regiones de Rusia (≤5B) | 1.º (según autor) | por debajo | por debajo | por debajo |
| Puesto en tareas centradas en personas (≤5B) | 1.º (según autor) | no disponible | no disponible | no disponible |
| Razonamiento | por delante (según autor) | por detrás | por detrás | por detrás |
| Puntuación global | por delante de A-Vibe, Zero-Mistral, Gemma 4 E2B y Qwen3.5-4B (según autor) | no disponible | no disponible | no disponible |

Nota: los valores numéricos concretos de MERA v2 para este modelo no se detallan en la información proporcionada; las comparaciones son afirmaciones cualitativas del autor.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita; el repositorio GGUF ocupa 9,3 GB, por lo que una cuantización de ~4 bits requeriría del orden de 3-4 GB de VRAM/RAM, aunque este dato no está confirmado en la información.
- GPU recomendadas: no disponibles; el modelo está orientado a ejecución en CPU y dispositivos de consumo.
- Cabe en GPU de consumo: sí, según el autor ("funciona en portátil, PC normal y teléfono"), aunque no se especifican modelos concretos.
- Opciones de despliegue: llama.cpp, LM Studio, Ollama (mencionados en la model card); compatible con endpoints.
- Latencia y throughput: no disponibles; el autor afirma que "vuela" en navegador y teléfono gracias a sus ~2 mil millones de parámetros activos.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| RusMind 4.5.2 Momentum | 4,6B totales / ~2B activos | no disponible | rusmind-license (propietaria) | GGUF en Hugging Face |
| Gemma 4 E2B (Google) | ~2B (base) | no disponible | licencia Gemma | Hugging Face |
| Qwen3.5-4B (Alibaba) | ~4B | no disponible | licencia Qwen | Hugging Face |
| T-lite (T-Bank) | ~8B | no disponible | no disponible | no disponible |
| Zero-Mistral | ~24B | no disponible | no disponible | no disponible |

Según la model card, RusMind 4.5.2 supera en MERA v2 a Gemma 4 E2B, Qwen3.5-4B, A-Vibe (8B) y Zero-Mistral (24B) en puntuación global, y a T-lite, Zero-Mistral y A-Vibe en razonamiento. Estos datos no han sido verificados de forma independiente en la información disponible.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados en la información disponible; al estar orientado a ruso y a la cultura rusa, puede presentar sesgos culturales y geográficos.
- Riesgo de alucinación: inherente a los modelos de lenguaje; no se han publicado evaluaciones específicas de factualidad para este modelo.
- Limitaciones de contexto e idioma: solo ruso e inglés declarados; longitud de contexto no especificada, lo que limita su uso en tareas de contexto largo.
- Restricciones de licencia: la licencia `rusmind-license` es propietaria y de tipo "other"; es necesario revisar el archivo LICENSE del repositorio antes de cualquier uso comercial. El autor ofrece contacto para licencias de organización.
- Caveat de producción: las afirmaciones de rendimiento provienen del propio autor; conviene validarlas con evaluaciones propias antes de desplegar en producción.
- El modelo está marcado como versión antigua: el autor recomienda migrar a RusMind 4.7 Momentum.
- No se especifican cuantizaciones concretas ni requisitos de hardware detallados.

## Enlaces

- Hugging Face: https://huggingface.co/DICPlay/RusMind-4.5.2-Momentum
- Modelo base: https://huggingface.co/google/gemma-4-E2B-it
- Demo / sitio del autor: https://rusmind.ru
- Benchmark MERA v2: https://mera.a-ai.ru/ru/text/leaderboard
- Versión recomendada (4.7 Momentum): https://huggingface.co/DICPlay/RusMind-4.7-Momentum
- RusMind Sokol 4.7: https://huggingface.co/DICPlay/RusMind-Sokol-4.7
- RusMind Vspyshka 4.7: https://huggingface.co/DICPlay/RusMind-Vspyshka-4.7
- Contacto del autor (Telegram): https://t.me/DanKirillin
- Contacto del autor (MAX): https://max.ru/u/f9LHodD0cOIENg5eShucR-RyhC02ijx-XXjPGcPbjBRy6_KKvmdKIu9tdQU
