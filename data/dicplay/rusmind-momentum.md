# DICPlay/RusMind-Momentum

## Resumen

RusMind-Momentum es un modelo de lenguaje de tipo Mixture of Experts (MoE) desarrollado por DICPlay, orientado a inferencia local y offline en dispositivos de consumo. Se trata de un fine-tune del modelo base google/gemma-4-E2B-it, con un total de 4.647.450.147 parámetros, de los cuales aproximadamente 2.000 millones se activan durante la generación. Está especializado en ruso e inglés y se distribuye principalmente en formato GGUF para su uso con llama.cpp, LM Studio y Ollama.

El modelo forma parte de la familia RusMind, que incluye variantes de mayor tamaño como Sokol 4.7 (8,9 mil millones de parámetros) y Vspyshka 4.7 (7,5 mil millones). Momentum es la variante más ligera de la familia, diseñada para ejecutarse en navegador, teléfonos y equipos sin GPU dedicada. Según la model card, ocupa el primer puesto en el benchmark MERA v2 entre modelos de hasta 5 mil millones de parámetros, con un score global de 0,136.

La relevancia actual del modelo radica en su relación entre tamaño activo y rendimiento en tareas en ruso: con solo 2 mil millones de parámetros activos supera, según los datos del autor, a modelos de 8 mil millones de parámetros como T-lite de T-Bank o RuadaptQwen3-8B en el benchmark MERA v2. Su licencia es propietaria (rusmind-license), lo que condiciona su uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture of Experts (MoE), basada en google/gemma-4-E2B-it |
| Parametros totales | 4.647.450.147 |
| Parametros activos | ~2.000 millones (aproximado, según model card) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF (cuantizaciones disponibles en el repo; tamaños desde ~2,5 GB) |
| Idiomas soportados | Ruso (ru), inglés (en) |
| Licencia | rusmind-license (propietaria, basada en "other") |
| Formato de pesos | GGUF (librería gguf, compatible con llama.cpp) |

## Arquitectura y entrenamiento

El modelo emplea una arquitectura Mixture of Experts derivada de google/gemma-4-E2B-it, con 4.647.450.147 parámetros totales y aproximadamente 2.000 millones activos por token generado. Esta configuración MoE permite que el modelo mantenga una huella de memoria reducida durante la inferencia (desde ~2,5 GB en las cuantizaciones más agresivas) mientras conserva una capacidad representacional propia de un modelo de mayor tamaño total.

El entrenamiento consistió en un fine-tune supervisado sobre el modelo base, orientado a mejorar el rendimiento en ruso y en tareas evaluadas por el benchmark MERA v2. La model card menciona mejoras del +5 % en el score global respecto a la versión anterior (Momentum 4.6.5) y del +37 % respecto al modelo abierto original del mismo tamaño. No se especifican en la información disponible el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO. Tampoco se detallan innovaciones arquitectónicas adicionales más allá de la propia estructura MoE heredada del modelo base.

## Capacidades

- Generación de texto conversacional en ruso e inglés, con especial énfasis en la calidad del ruso.
- Razonamiento multi-paso y tareas de lógica: según la model card, duplica en precisión a T-lite de T-Bank en tareas lógicas.
- Corrección ortográfica y de puntuación en ruso (score de 0,719 en la prueba correspondiente de MERA v2).
- Comprensión de matices humanos: caracteres de personajes, humor y palabras con significados opuestos (tareas "humanocéntricas" de MERA).
- Conocimiento de cultura y regiones de Rusia, área en la que lidera entre modelos de hasta 5 mil millones de parámetros.
- Soporte de tool calling / function calling: la model card indica que "llama a herramientas" con precisión en el contexto de instrucciones complejas.
- Capacidad de seguir instrucciones complejas de forma fiable.
- Ejecución on-device y offline, sin conexión a internet.
- Compatibilidad con endpoints (tag "endpoints_compatible").

## Casos de uso

- Asistentes conversacionales en ruso embebidos en aplicaciones móviles: el modelo puede ejecutarse íntegramente en el dispositivo con cuantizaciones desde ~2,5 GB, lo que permite conversaciones multi-turno sin conexión y sin enviar datos del usuario a servidores externos.
- Corrección y edición de textos en ruso: gracias a su puntuación de 0,719 en corrección ortográfica y de puntuación en MERA v2, es adecuado para integrarse en editores de texto o sistemas de publicación como paso de revisión automática.
- Automatización de atención al cliente en mercados rusoparlantes: el soporte de tool calling permite conectarlo a sistemas de gestión de tickets o bases de conocimiento para resolver consultas de primer nivel en local.
- Procesamiento de documentación en entornos con requisitos de privacidad: al funcionar offline, puede desplegarse en equipos aislados (air-gapped) para resumir o extraer información de documentos sin exponerlos a servicios en la nube.
- Generación de contenido culturalmente adaptado al público ruso: su primer puesto en cultura y regiones de Rusia entre modelos de hasta 5 mil millones lo hace útil para redacción de materiales divulgativos, guiones o textos de marketing dirigidos a ese mercado.
- Prototipado rápido en navegador: con ~2 mil millones de parámetros activos, puede ejecutarse en el navegador mediante WebAssembly/llama.cpp para demos interactivas o entornos educativos sin infraestructura de GPU.
- Filtrado y clasificación de textos en pipelines ligeros: su bajo coste de inferencia permite usarlo como primer clasificador o generador de etiquetas en flujos de datos en ruso antes de escalar a modelos mayores.

## Benchmarks y rendimiento

Los datos disponibles provienen del benchmark MERA v2 (Multimodal Evaluation for Russian-language Architectures), gestionado por la Alianza en el sector de la IA (Sber, Yandex, MTS, VK y otros). No se han publicado en la información disponible resultados de benchmarks estándar como MMLU, HumanEval o GSM8K.

| Benchmark (MERA v2) | RusMind Momentum (2B activos) | RuadaptQwen3-8B (8B) | T-lite · T-Bank (8B) | LFM2.5 · Liquid AI (2,6B) | A-Vibe · Avito (8B) |
|---|---|---|---|---|---|
| Score global | 0,136 | 0,134 | 0,130 | 0,120 | 0,113 |

| Benchmark (MERA v2, razonamiento) | RusMind Momentum (2B activos) | RuadaptQwen3-8B (8B) | Zero-Mistral-Small (24B) | T-lite · T-Bank (8B) | A-Vibe · Avito (8B) |
|---|---|---|---|---|---|
| Score de razonamiento | 0,247 | 0,231 | 0,229 | 0,218 | 0,187 |

Según la model card, Momentum es el número 1 en score global entre modelos de hasta 5 mil millones de parámetros, por delante de LFM2.5 de Liquid AI, Gemma 4 E2B de Google y Qwen3.5-4B de Alibaba. También lidera en cultura y regiones de Rusia y en tareas humanocéntricas dentro de esa franja de tamaño. Los datos de corrección ortográfica y de puntuación en ruso se cifran en 0,719, aunque no se especifica la métrica exacta ni el conjunto de comparación.

## Requisitos de hardware

- VRAM estimada: desde ~2,5 GB en las cuantizaciones más agresivas (según la model card, "desde 2,5 GB"); las cuantizaciones de mayor precisión requerirán más memoria en proporción al tamaño total de 4,65 mil millones de parámetros.
- GPU recomendadas: no se especifican modelos concretos en la información disponible. Por su tamaño, es viable en GPUs de consumo con suficiente VRAM para la cuantización elegida; también está diseñado para ejecutarse solo con CPU.
- Cabe en GPU de consumo: sí, según el diseño del modelo (orientado a "PC potentes, portátiles y teléfonos insignia"). No se detallan modelos concretos como RTX 4090 o similares.
- Opciones de despliegue: llama.cpp, LM Studio, Ollama (mencionados en la model card); el tag "endpoints_compatible" sugiere compatibilidad con endpoints tipo API. No se mencionan vLLM ni TGI.
- Latencia y throughput: no disponibles. La model card afirma que "vuela directamente en el navegador y en el teléfono", pero no aporta cifras de tokens por segundo.

## Comparativa con modelos similares

| Modelo | Parámetros | Activos | Contexto | MERA v2 (global) | Licencia | Formato |
|---|---|---|---|---|---|---|
| RusMind Momentum | 4,65B | ~2B | no disponible | 0,136 | rusmind-license (propietaria) | GGUF |
| RuadaptQwen3-8B | 8B | 8B | no disponible | 0,134 | no disponible | no disponible |
| T-lite (T-Bank) | 8B | 8B | no disponible | 0,130 | no disponible | no disponible |
| LFM2.5 (Liquid AI) | 2,6B | 2,6B | no disponible | 0,120 | no disponible | no disponible |
| A-Vibe (Avito) | 8B | 8B | no disponible | 0,113 | no disponible | no disponible |

Momentum logra el mejor score global de MERA v2 entre los modelos comparados con la mitad o menos de parámetros activos que sus competidores directos. En razonamiento (0,247) también supera a RuadaptQwen3-8B (0,231), Zero-Mistral-Small de 24B (0,229) y T-lite (0,218). La comparativa se limita al benchmark MERA v2; no hay datos de otros benchmarks que permitan una comparación más amplia.

## Limitaciones y advertencias

- Licencia propietaria (rusmind-license): el uso comercial requiere contactar con el autor para obtener una licencia de organización; no es un modelo de código abierto en sentido estricto.
- Idiomas limitados a ruso e inglés; no se garantiza un rendimiento aceptable en castellano u otros idiomas.
- Riesgo de alucinación inherente a los modelos de lenguaje; no se documentan en la información disponible medidas específicas de mitigación.
- Sesgos conocidos: no disponibles en la información proporcionada; cabe esperar sesgos derivados de los datos de entrenamiento del modelo base y del fine-tune, orientado al contexto ruso.
- Longitud de contexto no documentada, lo que dificulta planificar su uso en tareas que requieran ventanas largas.
- El modelo está optimizado para el benchmark MERA v2; su rendimiento en tareas fuera de ese dominio (código, matemáticas avanzadas, inglés técnico) no está validado con datos públicos.
- El repo ocupa 181,4 GB, lo que incluye múltiples versiones y cuantizaciones; conviene descargar solo el archivo GGUF necesario.
- No se especifican requisitos de hardware concretos ni cifras de latencia, lo que limita la planificación de capacidad en producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/DICPlay/RusMind-Momentum
- Demo oficial: https://rusmind.ru
- Benchmark MERA v2: https://mera.a-ai.ru/ru/text/leaderboard
- Modelo relacionado RusMind Sokol 4.7: https://huggingface.co/DICPlay/RusMind-Sokol-4.7
- Modelo relacionado RusMind Vspyshka 4.7: https://huggingface.co/DICPlay/RusMind-Vspyshka-4.7
- Contacto del autor (Telegram): https://t.me/DanKirillin
- Contacto del autor (MAX): https://max.ru/u/f9LHodD0cOIENg5eShucR-RyhC02ijx-XXjPGcPbjBRy6_KKvmdKIu9tdQU
