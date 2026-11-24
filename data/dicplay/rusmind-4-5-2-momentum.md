# DICPlay/RusMind-4.5.2-Momentum

## Resumen

RusMind 4.5.2 · Моментум (Momentum) es un modelo de lenguaje de tipo Mixture of Experts (MoE) desarrollado por DICPlay, un equipo ruso que publica una familia de modelos orientados al idioma ruso y al despliegue local. Se trata de un fine-tune del modelo base google/gemma-4-E2B-it, con 4.647.450.147 parámetros totales de los que aproximadamente 2.000 millones se activan durante la inferencia, lo que permite ejecutarlo en dispositivos de consumo como portátiles, PC convencionales y teléfonos.

El modelo se distribuye en formato GGUF y está pensado para inferencia offline mediante llama.cpp, LM Studio u Ollama, sin necesidad de conexión a internet. Soporta ruso e inglés y está orientado a tareas conversacionales, razonamiento, cultura y regiones de Rusia, y comprensión de matices humanos como el humor o los antónimos.

Su relevancia actual radica en que, según los datos publicados por el autor, ocupa el primer puesto por cultura y regiones de Rusia entre los modelos de hasta 5.000 millones de parámetros en el benchmark MERA v2, y supera por puntuación global a modelos con entre 4 y 12 veces más parámetros activos. La model card recomienda migrar a la versión 4.7, más reciente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture of Experts (MoE), fine-tune de google/gemma-4-E2B-it |
| Parametros totales | 4.647.450.147 |
| Parametros activos | ~2.000 millones (según model card) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF (el repo incluye pesos GGUF; no se detallan los niveles concretos) |
| Idiomas soportados | ruso (ru), inglés (en) |
| Licencia | rusmind-license (licencia propia, marcada como "other") |
| Formato de pesos | GGUF (también se referencia el modelo base en safetensors) |

## Arquitectura y entrenamiento

El modelo parte de google/gemma-4-E2B-it, una arquitectura de tipo Mixture of Experts en la que solo una fracción de los parámetros totales se activa por token. Con 4.647.450.147 parámetros totales y unos 2.000 millones activos, RusMind 4.5.2 hereda la estructura del modelo base y aplica un fine-tune específico sobre él, según indica la relación `base_model_relation: finetune` de la model card. Esta configuración permite un coste computacional por token cercano al de un modelo de 2B pese a almacenar más del doble de parámetros.

No se han publicado en la información disponible detalles sobre el volumen de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de RLHF o DPO. La model card menciona mejoras específicas de esta versión 4.5.2 en lógica, acertijos, humor, palabras con significados opuestos, instrucciones creativas con restricciones de longitud (número de párrafos, puntos o palabras) e historia, incluyendo la corrección de errores factuales en las preguntas del usuario, lo que sugiere un trabajo de ajuste orientado a instrucciones y a precisión factual en ruso.

## Capacidades

- Generación de texto conversacional en ruso e inglés.
- Razonamiento: lógica, acertijos y resolución de problemas paso a paso (sin modo de pensamiento explícito documentado).
- Comprensión de matices del lenguaje: humor, personajes y palabras con significados opuestos.
- Seguimiento de instrucciones creativas con restricciones de formato y longitud (número de párrafos, puntos o palabras).
- Conocimiento de cultura y regiones de Rusia, con corrección de errores históricos en las preguntas.
- Soporte de tool calling / function calling: la model card de la familia indica que las versiones 4.7 "invocan herramientas"; para 4.5.2 no se detalla explícitamente.
- Capacidades multilingües limitadas a ruso e inglés.
- Ejecución on-device y offline mediante llama.cpp, LM Studio y Ollama.
- Compatibilidad con endpoints (`endpoints_compatible` en los tags de Hugging Face).

## Casos de uso

- Asistente conversacional en ruso embebido en aplicaciones de escritorio o móviles: el modelo puede ejecutarse íntegramente en el dispositivo con llama.cpp u Ollama, sin conexión, lo que lo hace adecuado para escenarios con requisitos de privacidad o entornos sin red.
- Corrección y mejora de textos en ruso: su rendimiento en ortografía, puntuación y matices léxicos (humor, antónimos) permite usarlo como revisor de estilo y gramática en herramientas de edición.
- Generación de contenido con restricciones de formato: redacción de artículos, guiones o publicaciones con límites exactos de párrafos, puntos o palabras, gracias a su ajuste específico en instrucciones creativas cuantificadas.
- Atención al cliente automatizada en ruso: conversaciones multi-turno en un modelo ligero que puede desplegarse en infraestructura modesta o directamente en el cliente, reduciendo costes de API.
- Tutor o asistente educativo de historia y cultura rusa: responde preguntas históricas, señala fechas clave y corrige errores en las premisas del usuario, útil en aplicaciones de aprendizaje.
- Prototipado rápido y experimentación local: al caber en equipos de consumo y ofrecer pesos GGUF, sirve para validar ideas de producto o pipelines de generación de texto antes de escalar a modelos mayores.
- Integración en asistentes de voz o agentes locales de bajo consumo: su bajo número de parámetros activos (~2B) reduce la latencia y el consumo energético en dispositivos con recursos limitados.

## Benchmarks y rendimiento

Los datos publicados por el autor proceden del benchmark MERA v2 (Multimodal Evaluation for Russian-language Architectures), gestionado por la Alianza en el ámbito de la IA (Sber, Yandex, MTS, VK y otros). No se han publicado resultados de benchmarks estándar como MMLU, HumanEval o GSM8K en la información disponible.

| Benchmark MERA v2 | RusMind Momentum (2B activos) | T-lite · T-Bank (8B) | Zero-Mistral (24B) | A-Vibe · Avito (8B) |
|---|---|---|---|---|
| Razonamiento (Reasoning) | 0,225 | 0,218 | 0,213 | 0,187 |

Según la model card, el modelo es número 1 en cultura y regiones de Rusia entre modelos de hasta 5.000 millones de parámetros, número 1 en tareas centradas en el ser humano en esa misma franja, y supera por puntuación global a A-Vibe (8B), Zero-Mistral-Small (24B), Gemma 4 E2B y Qwen3.5-4B. No se dispone del resto de puntuaciones desglosadas de Momentum en la información proporcionada.

## Requisitos de hardware

- VRAM estimada: con 4,65B parámetros totales, en cuantización Q4_K_M se estima un uso de unos 2,8-3,2 GB; en Q8_0 en torno a 4,9-5,2 GB; en FP16 unos 9,3 GB. Estas cifras son estimaciones basadas en el tamaño del modelo, no datos publicados por el autor.
- GPU recomendadas: cualquier GPU con 4 GB o más de VRAM para cuantizaciones Q4; RTX 3060/4060, RTX 4090, A100 o H100 para mayor throughput.
- Cabe en GPU de consumo: sí, en la mayoría de tarjetas con 4-6 GB de VRAM en cuantizaciones bajas; también en CPU y en dispositivos móviles de gama alta, según la model card.
- Opciones de despliegue: llama.cpp, LM Studio, Ollama y cualquier runtime compatible con GGUF; el tag `endpoints_compatible` sugiere compatibilidad con endpoints tipo API.
- Latencia y throughput: no disponibles. El autor destaca que "vuela" en navegador y teléfono gracias a sus ~2B parámetros activos, pero no publica cifras de tokens por segundo.

## Comparativa con modelos similares

| Modelo | Parámetros | Activos | Contexto | MERA v2 (global) | Licencia | Formato |
|---|---|---|---|---|---|---|
| RusMind 4.5.2 Momentum | 4,65B | ~2B | no disponible | no disponible (razonamiento 0,225) | rusmind-license | GGUF |
| Gemma 4 E2B (base) | ~5B | no disponible | no disponible | no disponible | Gemma license | safetensors/GGUF |
| T-lite · T-Bank | 8B | 8B | no disponible | 0,130 (versión 4.7 la supera) | no disponible | no disponible |
| A-Vibe · Avito | 8B | 8B | no disponible | 0,187 (razonamiento) | no disponible | no disponible |
| Zero-Mistral | 24B | 24B | no disponible | 0,213 (razonamiento) | no disponible | no disponible |

La comparación se limita a los datos publicados por el autor en la model card; no se dispone de puntuaciones globales de Momentum ni de especificaciones de contexto de los modelos rivales en la información proporcionada.

## Limitaciones y advertencias

- Idiomas limitados a ruso e inglés; el rendimiento en castellano u otros idiomas no está documentado y probablemente sea deficiente.
- Riesgo de alucinación inherente a los modelos de lenguaje; el autor afirma mejoras en corrección histórica, pero no hay garantías en producción.
- La licencia `rusmind-license` es propia y marcada como "other": es imprescindible revisar el archivo LICENSE del repositorio antes de cualquier uso comercial, ya que las condiciones no están estandarizadas.
- No se han publicado detalles sobre sesgos, datos de entrenamiento ni evaluaciones de seguridad.
- La longitud de contexto no está documentada, lo que dificulta planificar casos de uso con ventanas largas.
- El autor recomienda migrar a RusMind 4.7 · Momentum, versión más reciente con mejor puntuación; 4.5.2 puede quedar sin mantenimiento.
- El modelo tiene 0 likes y unas 1.545 descargas en el momento de la consulta, lo que indica una adopción limitada y poca validación externa por parte de la comunidad.
- Al ser un fine-tune de Gemma 4, pueden aplicar restricciones adicionales derivadas de la licencia del modelo base de Google.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/DICPlay/RusMind-4.5.2-Momentum
- Modelo base: https://huggingface.co/google/gemma-4-E2B-it
- Versión recomendada (4.7 Momentum): https://huggingface.co/DICPlay/RusMind-4.7-Momentum
- RusMind 4.7 Sokol: https://huggingface.co/DICPlay/RusMind-Sokol-4.7
- RusMind 4.7 Vspyshka: https://huggingface.co/DICPlay/RusMind-Vspyshka-4.7
- Benchmark MERA v2: https://mera.a-ai.ru/ru/text/leaderboard
- Sitio oficial: https://rusmind.ru
