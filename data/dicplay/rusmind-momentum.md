# DICPlay/RusMind-Momentum

## Resumen

RusMind-Momentum es un modelo de generación de texto en ruso e inglés desarrollado por DICPlay, presentado como la variante más ligera de la familia RusMind y diseñada para inferencia local sin conexión ("on-device"). Se distribuye principalmente en formato GGUF para llama.cpp, LM Studio y Ollama, con un enfoque explícito en ejecución en navegador, teléfonos y equipos de consumo. El modelo es un fine-tuning de `google/gemma-4-E2B-it`, según declara el autor en la model card.

El dato de parámetros totales reportado en safetensors es de 4.647.450.147 (aproximadamente 4,6 mil millones), mientras que el autor afirma en la model card que "en la respuesta trabajan solo 2 mil millones", lo que sugiere una arquitectura con parámetros activos reducidos, aunque no se detalla el mecanismo exacto (MoE u otro) en la información disponible. El repositorio ocupa 181,3 GB, coherente con la acumulación de múltiples versiones y cuantizaciones GGUF.

Su relevancia actual radica en su posicionamiento en el benchmark ruso MERA v2, donde el autor reporta el primer puesto entre modelos de hasta 5 mil millones de parámetros con un 0,136 de puntuación global, por delante de modelos de mayor tamaño como RuadaptQwen3-8B o T-lite. La licencia es propietaria (`rusmind-license`), lo que condiciona su uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (fine-tuning de google/gemma-4-E2B-it); detalles de atención y capas no disponibles |
| Parametros totales | 4.647.450.147 (según safetensors) |
| Parametros activos | Aproximadamente 2 mil millones (según model card) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | GGUF (cuantizaciones concretas no detalladas); el autor indica un tamaño mínimo de 2,5 GB |
| Idiomas soportados | Ruso (ru) e inglés (en) |
| Licencia | rusmind-license (licencia propietaria, marcada como "other") |
| Formato de pesos | GGUF (librería gguf); no se indica disponibilidad de safetensors en el repo |
| Modelo base | google/gemma-4-E2B-it |
| Pipeline | text-generation |
| Compatibilidad | endpoints_compatible, llama.cpp, on-device, offline |

## Arquitectura y entrenamiento

El modelo parte de `google/gemma-4-E2B-it` y se presenta como un fine-tuning de dicho modelo base. La model card menciona que, pese a tener 4,6 mil millones de parámetros totales, "en la respuesta trabajan solo 2 mil millones", lo que apunta a una arquitectura con activación parcial de parámetros, aunque no se especifica si se trata de un diseño Mixture-of-Experts, de atención dispersa u otra técnica. No se detallan el número de capas, dimensiones ocultas, mecanismo de atención ni vocabulario.

No se proporciona información sobre el volumen de tokens de entrenamiento, la composición del dataset, ni si se emplearon técnicas de RLHF, DPO o ajuste por instrucciones más allá de la herencia del modelo base. El autor sí reporta una mejora del 5 % en el score global MERA v2 respecto a la versión 4.6.5 y del 37 % respecto al modelo abierto original del mismo tamaño, lo que indica un proceso iterativo de ajuste orientado al ruso, pero sin transparencia sobre los datos empleados.

## Capacidades

- Generación de texto conversacional en ruso e inglés, con énfasis declarado en la calidad del ruso (0,719 en corrección ortográfica y de puntuación según MERA v2).
- Razonamiento y resolución de tareas lógicas: el autor reporta que duplica en precisión a T-lite en tareas lógicas.
- Comprensión de matices humanos: caracteres, humor y palabras con significados opuestos (categoría "human-centric" de MERA).
- Conocimiento de cultura y regiones de Rusia, donde el autor lo sitúa como número 1 en su franja de tamaño.
- Seguimiento de instrucciones complejas y llamada a herramientas ("tool calling"), mencionado explícitamente en la model card.
- Ejecución local y offline en dispositivos de consumo, incluido navegador y teléfono.
- No se mencionan capacidades de visión, audio ni modo de razonamiento extendido (thinking mode) para este modelo concreto.

## Casos de uso

- Asistentes conversacionales offline en aplicaciones móviles: al ejecutarse en formato GGUF sobre llama.cpp con un tamaño mínimo de 2,5 GB, puede integrarse en apps Android o iOS para atención al usuario sin conexión, manteniendo conversaciones en ruso con corrección ortográfica alta.
- Procesamiento de texto en el navegador: su reducido número de parámetros activos (~2 mil millones) permite desplegarlo mediante WebAssembly o WebGPU para tareas de resumen, reescritura o corrección en herramientas web sin enviar datos a un servidor.
- Corrección y edición de textos en ruso: el 0,719 en ortografía y puntuación de MERA lo hace adecuado para pipelines de revisión automática de documentación, artículos o correos en entornos corporativos rusoparlantes.
- Atención al cliente en kioscos o terminales sin conectividad: con tool calling y seguimiento de instrucciones, puede gestionar consultas multi-turno y disparar acciones locales (consultas a bases de datos embebidas, formularios) en comercios o administraciones con red restringida.
- Filtrado y clasificación de contenido en ruso: su conocimiento de cultura regional y comprensión de matices (humor, opuestos) permite construir clasificadores de toxicidad, intención o temática en moderación de foros y redes.
- Prototipado rápido de agentes locales: al ser compatible con endpoints y llama.cpp, sirve para validar flujos de agente multi-paso en portátiles sin GPU dedicada antes de escalar a modelos mayores.
- Educación y tutoría offline: generación de explicaciones y ejercicios en ruso para entornos con conectividad intermitente, como escuelas rurales o zonas con infraestructura limitada.

## Benchmarks y rendimiento

Los datos disponibles provienen exclusivamente del benchmark MERA v2, reportados por el autor en la model card.

| Benchmark MERA v2 | RusMind Momentum (2B activos) | RuadaptQwen3-8B (8B) | T-lite (8B) | LFM2.5 (2,6B) | A-Vibe (8B) |
|---|---|---|---|---|---|
| Puntuación global | 0,136 | 0,134 | 0,130 | 0,120 | 0,113 |

| Razonamiento (MERA v2) | RusMind Momentum | RuadaptQwen3-8B | Zero-Mistral-Small (24B) | T-lite (8B) | A-Vibe (8B) |
|---|---|---|---|---|---|
| Puntuación | 0,247 | 0,231 | 0,229 | 0,218 | 0,187 |

| Desglose MERA v2 | RusMind Momentum | A-Vibe (8B) | Gemma 4 E2B (5B) | Qwen3.5-4B (4B) |
|---|---|---|---|---|
| Puntuación global | 0,136 | 0,113 | 0,099 | 0,093 |

No se han publicado resultados de benchmarks estándar internacionales (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada: el autor indica un tamaño mínimo de 2,5 GB, correspondiente presumiblemente a cuantizaciones agresivas (Q4 o inferiores). Una cuantización Q8 requeriría del orden de 5 GB y FP16 alrededor de 9-10 GB, aunque estos valores son estimaciones a partir del número de parámetros y no están confirmados en la información disponible.
- GPU recomendadas: no especificadas por el autor. Por tamaño, cabría esperar funcionamiento en RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4090 y GPUs de datacenter (A100, H100) para despliegues concurrentes, pero no hay datos oficiales.
- Cabe en GPU de consumo: sí, según el autor, en equipos de consumo y teléfonos de gama alta; el tamaño mínimo de 2,5 GB lo sitúa al alcance de GPUs integradas y de portátiles modestos.
- Opciones de despliegue: llama.cpp, LM Studio, Ollama y endpoints compatibles, según la model card y los tags del repositorio.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | MERA v2 global | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| RusMind Momentum | 4,6B totales / ~2B activos | No disponible | 0,136 | rusmind-license (propietaria) | GGUF en HF |
| RuadaptQwen3-8B | 8B | No disponible | 0,134 | No disponible | No disponible en la información |
| T-lite (T-Bank) | 8B | No disponible | 0,130 | No disponible | No disponible en la información |
| LFM2.5 (Liquid AI) | 2,6B | No disponible | 0,120 | No disponible | No disponible en la información |
| Gemma 4 E2B (Google) | 5B | No disponible | 0,099 | No disponible | No disponible en la información |

La comparativa se limita al benchmark MERA v2 por ser el único con datos publicados en la información disponible. En tamaño, sus competidores directos son LFM2.5 (2,6B) y Gemma 4 E2B (5B), ambos superados en la puntuación global reportada por el autor.

## Limitaciones y advertencias

- Licencia propietaria (`rusmind-license`): es necesario revisar el archivo LICENSE del repositorio antes de cualquier uso comercial; no se trata de una licencia open source estándar (Apache 2.0, MIT, etc.).
- Idiomas limitados a ruso e inglés; el rendimiento en castellano u otros idiomas no está documentado y probablemente sea deficiente.
- Los benchmarks proceden de MERA v2, un benchmark centrado en ruso y reportado por el propio autor; no hay validación independiente de los resultados en la información disponible.
- Riesgo de alucinación inherente a modelos de ~2B parámetros activos, especialmente en tareas de conocimiento factual extenso.
- Longitud de contexto no documentada: puede ser insuficiente para tareas de documento largo o conversaciones multi-turno extensas.
- El repositorio de 181,3 GB acumula múltiples versiones y cuantizaciones; conviene descargar solo los archivos necesarios para evitar consumo innecesario de almacenamiento.
- No se detalla la composición del dataset de ajuste, lo que impide evaluar sesgos específicos introducidos durante el fine-tuning.
- El tamaño mínimo de 2,5 GB sugiere cuantizaciones agresivas que pueden degradar la calidad respecto a los resultados de benchmark, presumiblemente obtenidos con pesos completos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/DICPlay/RusMind-Momentum
- Modelo base: https://huggingface.co/google/gemma-4-E2B-it
- Demo y servicio: https://rusmind.ru
- Leaderboard MERA v2: https://mera.a-ai.ru/ru/text/leaderboard
- Modelo hermano RusMind 4.7 Sokol: https://huggingface.co/DICPlay/RusMind-Sokol-4.7
- Modelo hermano RusMind 4.7 Vspyshka: https://huggingface.co/DICPlay/RusMind-Vspyshka-4.7
