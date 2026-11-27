# DICPlay/RusMind-4.5.4-Momentum

## Resumen

RusMind 4.5.4 · Моментум es un modelo de lenguaje de tipo Mixture of Experts (MoE) desarrollado por DICPlay, orientado específicamente al ruso y al inglés y diseñado para ejecutarse en dispositivo (on-device) sin conexión a internet. Se trata de un fine-tune del modelo base google/gemma-4-E2B-it y pertenece a la generación 4.5 de la familia RusMind, posicionándose como la variante más ligera de dicha generación. El modelo se distribuye en formato GGUF para su uso con llama.cpp, LM Studio y Ollama.

El modelo cuenta con 4.647.450.147 parámetros totales, de los cuales aproximadamente 2.000 millones permanecen activos durante la inferencia, lo que le permite operar en portátiles, ordenadores de sobremesa convencionales y teléfonos móviles. Su enfoque principal es el mercado rusoparlante: comprensión de personajes, humor, historia y cultura de Rusia, corrección ortográfica y de puntuación, y seguimiento de instrucciones complejas en ruso.

La relevancia actual del modelo radica en su posicionamiento en el benchmark independiente MERA v2 (Multimodal Evaluation for Russian-language Architectures), gestionado por la Alianza en el ámbito de la IA (Sber, Yandex, MTS, VK, Gazprom Neft y RFPA). Según la model card, el modelo ocupa el primer puesto en cultura y regiones de Rusia entre modelos de hasta 5.000 millones de parámetros, y supera en puntuación global a alternativas de mayor tamaño como A-Vibe de Avito (8.000 millones), Zero-Mistral-Small (24.000 millones), Gemma 4 E2B de Google y Qwen3.5-4B de Alibaba.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture of Experts (MoE) sobre transformer, fine-tune de google/gemma-4-E2B-it |
| Parametros totales | 4.647.450.147 |
| Parametros activos | Aproximadamente 2.000 millones |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | GGUF (cuantizaciones no especificadas en la model card) |
| Idiomas soportados | Ruso (ru), inglés (en) |
| Licencia | rusmind-license (licencia propia, marcada como "other"; se requiere licencia organizacional por contacto) |
| Formato de pesos | GGUF (librería gguf, compatible con llama.cpp) |

## Arquitectura y entrenamiento

El modelo es un fine-tune del checkpoint google/gemma-4-E2B-it, que emplea una arquitectura Mixture of Experts con 4.647.450.147 parámetros totales y aproximadamente 2.000 millones activos por token. Esta configuración permite una huella computacional reducida durante la inferencia, lo que habilita su ejecución en hardware de consumo y en dispositivos móviles. La model card no detalla la composición del dataset de entrenamiento, el número de tokens utilizados ni si se aplicaron técnicas de RLHF o DPO durante el ajuste fino.

Entre las innovaciones declaradas por el autor destacan mejoras en lógica, acertijos, habla coloquial rusa, comprensión de personajes y de la persona a la que se dirige la pregunta, puntuación gramatical, ejecución de tareas creativas con requisitos exactos de longitud y precisión en el manejo de fechas históricas de Rusia, incluyendo la corrección de errores en las preguntas. No se especifican en la información disponible detalles sobre decodificación especulativa, atención lineal u otras optimizaciones de inferencia.

## Capacidades

- Generación de texto conversacional en ruso e inglés, con especial énfasis en la calidad del ruso coloquial.
- Razonamiento y resolución de acertijos y problemas lógicos, con mejoras específicas en la versión 4.5.4.
- Comprensión de personajes y del destinatario de la pregunta (capacidad de identificar a quién se dirige una consulta).
- Corrección ortográfica y de puntuación en ruso (puntuación de 0,719 en la tarea de corrección de ortografía y puntuación de MERA, según la model card).
- Ejecución de tareas creativas con restricciones precisas de longitud.
- Conocimiento de fechas históricas de Rusia y capacidad de corregir errores en las preguntas del usuario.
- Llamada a herramientas (tool calling / function calling), mencionada explícitamente en la model card.
- Seguimiento de instrucciones complejas.
- Capacidad multilingüe limitada a ruso e inglés.
- Ejecución en dispositivo (on-device) y sin conexión (offline), compatible con endpoints.

## Casos de uso

- Asistentes conversacionales en ruso para atención al cliente: el modelo puede gestionar diálogos multiturno con calidad de ruso coloquial y corrección gramatical, adecuado para empresas que operan en el mercado rusoparlante y necesitan desplegar asistentes sin depender de la nube.
- Aplicaciones móviles y de escritorio offline: gracias a sus aproximadamente 2.000 millones de parámetros activos y su formato GGUF, puede integrarse en aplicaciones para portátiles, ordenadores convencionales y teléfonos, ofreciendo generación de texto sin conexión a internet.
- Herramientas educativas sobre historia y cultura de Rusia: su capacidad para nombrar fechas históricas clave y corregir errores en las preguntas lo hace útil en aplicaciones de aprendizaje y consulta histórica.
- Generación creativa con restricciones de longitud: adecuado para la producción de textos creativos en ruso (relatos, poemas, guiones) donde se exijan requisitos exactos de extensión.
- Integración en pipelines con tool calling: puede utilizarse como motor de generación en flujos que requieran invocar funciones o herramientas externas, con compatibilidad con endpoints.
- Corrección y revisión de textos en ruso: su desempeño en ortografía y puntuación permite emplearlo como corrector automático en herramientas de edición o publicación.
- Prototipado e investigación en NLP rusoparlante: útil para investigadores que necesiten un modelo ligero, ejecutable localmente con llama.cpp, para experimentos de ajuste fino o evaluación en entornos con recursos limitados.

## Benchmarks y rendimiento

La model card proporciona resultados del benchmark MERA v2, gestionado por la Alianza en el ámbito de la IA. No se ofrecen resultados de benchmarks estándar como MMLU, HumanEval o GSM8K en la información disponible.

| Benchmark | RusMind 4.5.4 · Моментум | Modelos comparados (según model card) |
|---|---|---|
| MERA v2, cultura y regiones de Rusia (hasta 5.000 M) | Nº 1 | Supera a T-lite de T-Bank, Gemma 4 E4B de Google, Qwen3.5-9B de Alibaba y A-Vibe de Avito |
| MERA v2, tareas centradas en el ser humano (hasta 5.000 M) | Nº 1 | No disponible |
| MERA v2, puntuación global | Supera en puntuación global a A-Vibe (8.000 M), Zero-Mistral-Small (24.000 M), Gemma 4 E2B de Google y Qwen3.5-4B de Alibaba | — |
| MERA v2, razonamiento | Supera a T-lite (8.000 M), Zero-Mistral (24.000 M) y A-Vibe (8.000 M) | — |
| MERA v2, corrección de ortografía y puntuación | 0,719 | No disponible |

No se han publicado en la información disponible resultados numéricos completos del benchmark MERA v2 para este modelo concreto (la model card solo ofrece posiciones relativas y el dato de 0,719 en corrección ortográfica).

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con 4.647 millones de parámetros totales y aproximadamente 2.000 millones activos, el tamaño del repositorio es de 20,2 GB, lo que sugiere múltiples archivos GGUF con distintas cuantizaciones. Una cuantización Q4 típica requeriría del orden de 3 a 4 GB de VRAM, aunque este dato no está confirmado en la información proporcionada.
- GPU recomendadas: no especificadas en la model card. Por su tamaño, es apto para GPU de consumo como RTX 4090, RTX 3090 o inferiores, así como para ejecución en CPU.
- Compatibilidad con GPU de consumo: sí, según el autor, que indica funcionamiento en portátiles, ordenadores convencionales y teléfonos.
- Opciones de despliegue: llama.cpp, LM Studio, Ollama (mencionados en la model card) y endpoints compatibles.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento MERA v2 | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| RusMind 4.5.4 · Моментум | 4.647 M totales / ~2.000 M activos | No disponible | Nº 1 en cultura y regiones de Rusia hasta 5.000 M; supera en global a A-Vibe, Zero-Mistral-Small, Gemma 4 E2B y Qwen3.5-4B | rusmind-license (requiere licencia organizacional) | GGUF en Hugging Face |
| Gemma 4 E2B (Google) | ~2.000 M | No disponible | Inferior según la model card | Licencia de Google (no detallada) | Disponible |
| Qwen3.5-4B (Alibaba) | ~4.000 M | No disponible | Inferior en global según la model card | No disponible | Disponible |
| A-Vibe (Avito) | ~8.000 M | No disponible | Inferior en global y razonamiento según la model card | No disponible | Disponible |
| Zero-Mistral-Small | ~24.000 M | No disponible | Inferior en global y razonamiento según la model card | No disponible | Disponible |

## Limitaciones y advertencias

- Sesgos conocidos: no documentados en la información disponible; al estar especializado en ruso y en la cultura e historia de Rusia, puede presentar sesgos culturales y geográficos derivados de sus datos de entrenamiento.
- Riesgo de alucinación: no cuantificado; como todo modelo generativo, puede producir información incorrecta, especialmente en tareas factuales o históricas fuera de su ámbito de especialización.
- Limitaciones de idioma: solo ruso e inglés; su rendimiento en otros idiomas no está garantizado ni documentado.
- Limitaciones de contexto: la longitud de contexto no se especifica en la información disponible, lo que impide evaluar su idoneidad para tareas de contexto largo.
- Restricciones de licencia: la licencia rusmind-license está marcada como "other" y el autor indica que las organizaciones deben solicitar una licencia específica mediante contacto (Telegram o MAX), lo que puede limitar el uso comercial sin acuerdo previo.
- Caveat de producción: el autor recomienda migrar a la versión 4.7 (RusMind 4.7 · Моментум), por lo que 4.5.4 debe considerarse una versión anterior; además, el número de likes es 0 y las descargas son 3.472, lo que sugiere una adopción aún limitada.
- Al ser un fine-tune de un modelo base de Google, pueden aplicarse las restricciones de la licencia original de Gemma, no detalladas en la información disponible.

## Enlaces

- Hugging Face: https://huggingface.co/DICPlay/RusMind-4.5.4-Momentum
- Modelo base: https://huggingface.co/google/gemma-4-E2B-it
- Versión recomendada (4.7 · Моментум): https://huggingface.co/DICPlay/RusMind-4.7-Momentum
- RusMind 4.7 · Сокол: https://huggingface.co/DICPlay/RusMind-Sokol-4.7
- RusMind 4.7 · Вспышка: https://huggingface.co/DICPlay/RusMind-Vspyshka-4.7
- Demo y sitio oficial: https://rusmind.ru
- Benchmark MERA v2: https://mera.a-ai.ru/ru/text/leaderboard
- Contacto del autor (Telegram): https://t.me/DanKirillin
- Contacto del autor (MAX): https://max.ru/u/f9LHodD0cOIENg5eShucR-RyhC02ijx-XXjPGcPbjBRy6_KKvmdKIu9tdQU
