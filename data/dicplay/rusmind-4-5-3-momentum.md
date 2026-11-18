# DICPlay/RusMind-4.5.3-Momentum

## Resumen

RusMind 4.5.3 · Моментум (Momentum) es un modelo de lenguaje conversacional desarrollado por DICPlay, presentado como parte de la familia "nacional" rusa de modelos RusMind de cuarta generación (4.5). Se trata de un fine-tuning del modelo base `google/gemma-4-E2B-it`, distribuido exclusivamente en formato GGUF y orientado a inferencia local ("on-device") y sin conexión, tanto en ordenadores personales como en teléfonos móviles. El modelo está optimizado para ruso e inglés.

La relevancia del modelo radica en su estrategia de eficiencia: con 4.647.450.147 parámetros totales, emplea una arquitectura de mezcla de expertos (MoE) en la que solo se activan aproximadamente 2.000 millones de parámetros por token, lo que permite ejecución en hardware modesto. DICPlay lo posiciona en el benchmark ruso MERA v2 como líder entre modelos de menos de 5.000 millones de parámetros en las categorías de cultura y regiones de Rusia y de tareas centradas en el ser humano, superando según el autor a modelos de mayor tamaño como T-lite de T-Bank (8B), Zero-Mistral (24B) o A-Vibe de Avito (8B).

El modelo se publica bajo la licencia propietaria `rusmind-license` (registrada como `other` en Hugging Face) y su repositorio ocupa 9,3 GB, con 1.569 descargas en el momento de la consulta. La model card indica explícitamente que existe una versión posterior (RusMind 4.7 · Моментум) que el autor recomienda usar en su lugar.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con mezcla de expertos (MoE), fine-tuning de `google/gemma-4-E2B-it` |
| Parametros totales | 4.647.450.147 (4,6B) |
| Parametros activos | ~2.000 millones por token (según la model card) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF (niveles concretos no especificados en la información disponible) |
| Idiomas soportados | Ruso (ru) e inglés (en) |
| Licencia | `rusmind-license` (registrada como `other`; enlace a LICENSE en el repo) |
| Formato de pesos | GGUF (compatible con llama.cpp, LM Studio, Ollama) |

## Arquitectura y entrenamiento

El modelo parte de `google/gemma-4-E2B-it`, un transformer con mezcla de expertos de la familia Gemma 4, y se distribuye como fine-tuning sobre dicho base. La model card confirma la relación `base_model_relation: finetune`. Con 4,6B de parámetros totales y unos 2B activos por token, la arquitectura MoE reduce el coste computacional por token, lo que explica su viabilidad en dispositivos de consumo y en el navegador.

No se dispone de información sobre el volumen de tokens de entrenamiento, la composición del dataset de fine-tuning, ni sobre el uso de RLHF, DPO u otras técnicas de alineación. La model card menciona mejoras específicas de la versión 4.5.3 respecto a 4.5.2: mayor precisión y concisión al citar fechas clave de la historia de Rusia, un "carácter RusMind" definido (posición clara y consistente sobre temas relevantes) y la conservación de las capacidades previas en lógica, acertijos, humor y tareas creativas con requisitos precisos. No se detallan innovaciones técnicas de inferencia (decodificación especulativa, atención lineal, etc.).

## Capacidades

- Generación de texto conversacional en ruso e inglés, con especial énfasis en calidad del ruso.
- Razonamiento: la model card reporta un resultado de 0,225 en la sección de razonamiento de MERA v2, por encima de T-lite (0,218), Zero-Mistral (0,213) y A-Vibe (0,187).
- Conocimiento de cultura y regiones de Rusia, con el mejor resultado declarado entre modelos de hasta 5.000 millones de parámetros.
- Tareas "centradas en el ser humano" (human-centric): interpretación de personajes, humor y palabras con significados opuestos.
- Corrección ortográfica y de puntuación en ruso: 0,719 según la model card.
- Seguimiento de instrucciones complejas y llamada a herramientas (tool calling / function calling), según la model card.
- Resolución de acertijos, lógica y tareas creativas con requisitos precisos.
- Ejecución on-device y offline (sin conexión a internet).
- Compatibilidad con endpoints (`endpoints_compatible` en los tags de Hugging Face).

## Casos de uso

- Asistentes conversacionales en ruso para atención al cliente: el modelo puede mantener diálogos multi-turno con un ruso gramaticalmente cuidado (0,719 en corrección ortográfica y de puntuación según el autor) y ejecutarse en el propio dispositivo del usuario, lo que evita enviar datos personales a servidores externos.
- Despliegue en aplicaciones móviles y de escritorio sin conexión: al activar solo ~2B parámetros por token y distribuirse en GGUF, es apto para integrarse en apps que funcionan offline en portátiles, PC convencionales y teléfonos, según la model card.
- Procesamiento de documentos y textos en ruso con corrección ortográfica y de puntuación: útil en herramientas de edición, revisión o normalización de textos.
- Automatización con llamada a herramientas: la model card declara soporte de tool calling, lo que permite integrarlo en flujos donde el modelo invoca funciones externas (consultas a APIs, recuperación de datos) dentro de un pipeline de agentes.
- Aplicaciones educativas sobre historia y cultura de Rusia: la versión 4.5.3 mejora la precisión y concisión al citar fechas clave de la historia rusa, lo que lo hace adecuado para asistentes de estudio o cuestionarios.
- Generación creativa y de ocio en ruso: acertijos, humor y tareas creativas con requisitos precisos, según las capacidades declaradas en la model card.
- Evaluación y prototipado de modelos rusos de pequeño tamaño: sirve como referencia local para comparar con T-lite, A-Vibe o Gemma 4 E2B en tareas MERA, aunque el propio autor recomienda migrar a la versión 4.7.

## Benchmarks y rendimiento

Los datos disponibles provienen exclusivamente de la model card del autor y del benchmark MERA v2 (Multimodal Evaluation for Russian-language Architectures), gestionado por la Alianza en el ámbito de la IA (Sber, Yandex, MTS, VK, Gazprom Neft y RFRI). No se han publicado resultados de benchmarks internacionales (MMLU, HumanEval, GSM8K) en la información disponible.

| Benchmark / sección | RusMind Momentum 4.5.3 (2B activos) | T-lite · T-Bank (8B) | Zero-Mistral (24B) | A-Vibe · Avito (8B) |
|---|---|---|---|---|
| MERA v2 · Razonamiento | 0,225 | 0,218 | 0,213 | 0,187 |

| Sección MERA v2 | RusMind Momentum 4.5.3 | A-Vibe · Avito (8B) | Gemma 4 E2B · Google (5B) | Qwen3.5-4B · Alibaba |
|---|---|---|---|---|
| Posición declarada | Nº1 en cultura y regiones de Rusia (≤5B); Nº1 en tareas centradas en el ser humano (≤5B); supera en puntuación global a A-Vibe, Zero-Mistral-Small, Gemma 4 E2B y Qwen3.5-4B | no disponible (valor numérico) | no disponible (valor numérico) | no disponible (valor numérico) |

La model card no proporciona los valores numéricos completos de todas las secciones para Momentum; solo se detalla el 0,225 de razonamiento. El resto de afirmaciones son posicionales ("Nº1", "supera a") sin cifras asociadas en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Como referencia de orden de magnitud, un modelo de 4,6B en GGUF suele requerir entre ~3 GB (cuantización de 4 bits) y ~9 GB (FP16), pero estos valores no los confirma la model card.
- GPU recomendadas: no especificadas por el autor. El modelo está pensado para ejecución on-device en portátiles, PC convencionales y teléfonos, lo que sugiere viabilidad en hardware de consumo sin GPU dedicada.
- Cabe en GPU de consumo: la model card afirma que funciona en teléfonos y navegador, lo que implica que cabe en hardware muy limitado; no se detallan modelos concretos de GPU.
- Opciones de despliegue: llama.cpp, LM Studio, Ollama (mencionados explícitamente en la model card) y cualquier runtime compatible con GGUF. Los tags incluyen `endpoints_compatible`.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Desarrollador | Parámetros | Activos | MERA v2 (razonamiento) | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| RusMind 4.5.3 · Momentum | DICPlay | 4,6B | ~2B | 0,225 | rusmind-license (other) | GGUF en Hugging Face |
| T-lite | T-Bank | 8B | no disponible | 0,218 | no disponible | no disponible en la información |
| Zero-Mistral | no disponible | 24B | no disponible | 0,213 | no disponible | no disponible en la información |
| A-Vibe | Avito | 8B | no disponible | 0,187 | no disponible | no disponible en la información |
| Gemma 4 E2B | Google | 5B | no disponible | no disponible | no disponible en la información | modelo base del fine-tuning |

Según la model card, Momentum supera en razonamiento a modelos con 4 a 12 veces más parámetros activos y es el primero entre modelos de hasta 5.000 millones de parámetros en cultura y regiones de Rusia y en tareas centradas en el ser humano.

## Limitaciones y advertencias

- El autor recomienda explícitamente migrar a RusMind 4.7 · Momentum, versión posterior con mejor rendimiento (0,136 en MERA v2 según la model card de 4.7); esta ficha describe una versión que el propio desarrollador considera superada.
- Licencia propietaria `rusmind-license`: es necesario revisar el archivo LICENSE del repositorio antes de cualquier uso comercial; no es una licencia open source estándar.
- Idiomas limitados a ruso e inglés; no se declara soporte para otras lenguas.
- Longitud de contexto no disponible: no se puede garantizar el comportamiento en conversaciones o documentos largos.
- Riesgo de alucinación: no se documentan medidas específicas de mitigación en la información disponible.
- Sesgos: la model card menciona un "carácter RusMind" con "posición clara y consistente sobre temas importantes", lo que implica una alineación editorial explícita que puede introducir sesgo en respuestas sobre temas sensibles.
- Los resultados de benchmarks proceden exclusivamente del autor y del benchmark MERA v2; no hay verificación independiente ni resultados en benchmarks internacionales.
- El modelo tiene 0 likes y 1.569 descargas en Hugging Face, lo que indica una adopción aún limitada.
- Al ser un fine-tuning de Gemma 4 E2B, hereda las limitaciones del modelo base de Google, no detalladas en la información disponible.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/DICPlay/RusMind-4.5.3-Momentum
- Modelo base: https://huggingface.co/google/gemma-4-E2B-it
- Demo / sitio oficial: https://rusmind.ru
- Benchmark MERA v2: https://mera.a-ai.ru/ru/text/leaderboard
- Versión posterior recomendada (4.7 · Momentum): https://huggingface.co/DICPlay/RusMind-4.7-Momentum
- RusMind 4.7 · Sokol: https://huggingface.co/DICPlay/RusMind-Sokol-4.7
- RusMind 4.7 · Vspyshka: https://huggingface.co/DICPlay/RusMind-Vspyshka-4.7
