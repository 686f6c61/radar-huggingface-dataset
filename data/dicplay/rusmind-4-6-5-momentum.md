# DICPlay/RusMind-4.6.5-Momentum

## Resumen
RusMind 4.6.5 · Momentum es un modelo de lenguaje afinado por DICPlay a partir de google/gemma-4-E2B-it, orientado a inferencia en dispositivo (on-device) y sin conexión. Se distribuye exclusivamente en formato GGUF para llama.cpp y entornos compatibles, con soporte declarado de ruso e inglés. Su propuesta principal es ofrecer un modelo compacto con un rendimiento competitivo en el benchmark ruso MERA v2 dentro de su rango de tamaño.

El modelo emplea una arquitectura derivada de Gemma 4 E2B, con 4.647.450.147 parámetros totales y aproximadamente 2.000 millones de parámetros activos durante la inferencia, según indica la model card. Esa relación entre parámetros totales y activos sugiere un diseño de mezcla de expertos (MoE) o de activación dispersa, aunque la información proporcionada no detalla la arquitectura interna.

La relevancia actual del modelo radica en su enfoque en eficiencia y despliegue local: el autor lo posiciona como la entrada más ligera de la familia RusMind 4.6, con capacidad de ejecutarse en portátiles, equipos de sobremesa convencionales y teléfonos. La model card incluye comparaciones con modelos de Google, Alibaba, Liquid AI y T-Bank en el ranking MERA v2, así como referencias a versiones posteriores de la familia (4.7).

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Derivada de google/gemma-4-E2B-it (detalle interno no disponible) |
| Parámetros totales | 4.647.450.147 |
| Parámetros activos | ~2.000 millones (según model card) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | GGUF (niveles concretos no disponibles) |
| Idiomas soportados | Ruso (ru), inglés (en) |
| Licencia | rusmind-license (license: other) |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento
El modelo es un fine-tune de google/gemma-4-E2B-it, según los metadatos de Hugging Face y la model card. La información proporcionada no especifica la arquitectura interna más allá de la referencia al modelo base Gemma 4 E2B, ni detalla la composición del dataset de entrenamiento, el número de tokens utilizados ni si se aplicaron técnicas de RLHF, DPO u otras etapas de alineación.

La model card menciona mejoras respecto a versiones anteriores de la familia en ejecución de instrucciones complejas con múltiples requisitos, razonamiento lógico, invocación de funciones, ortografía y puntuación en ruso, y conocimiento de historia de Rusia. También cita una evaluación externa del canal japonés Future Craft Lab sobre comprensión del japonés con matices de cortesía, razonamiento estable y generación de código. No se detallan innovaciones técnicas específicas como decodificación especulativa o atención lineal.

## Capacidades
- Generación de texto conversacional en ruso e inglés.
- Ejecución de instrucciones complejas con múltiples requisitos simultáneos (el autor afirma una mejora de 3,3 veces respecto a la versión anterior).
- Razonamiento lógico y resolución de tareas de razonamiento.
- Invocación de funciones y uso de herramientas (tool calling / function calling).
- Generación de código, según la evaluación externa citada.
- Ortografía y puntuación en ruso, con énfasis en corrección gramatical.
- Conocimiento de historia de Rusia: eventos, fechas y personalidades.
- Comprensión de matices del japonés en cortesía, según evaluación externa citada.
- Inferencia en dispositivo y sin conexión (on-device, offline).
- Compatibilidad con endpoints (tag endpoints_compatible).

## Casos de uso
- Asistentes conversacionales locales en ruso: el modelo puede gestionar diálogos multi-turno en un portátil o teléfono sin conexión, aprovechando su reducido número de parámetros activos para mantener latencia baja en hardware de consumo.
- Corrección ortográfica y de puntuación en ruso: adecuado para herramientas de edición o preprocesado de textos, dado el énfasis del autor en la calidad ortográfica de esta versión.
- Automatización de atención al cliente en ruso: puede integrarse en sistemas de respuesta automática con invocación de funciones para consultar datos estructurados, aunque la longitud de contexto no está documentada y debe validarse para conversaciones largas.
- Generación de código en entornos sin conectividad: útil en IDE o pipelines locales donde se requiera asistencia de código sin enviar datos a servicios externos.
- Aplicaciones educativas sobre historia de Rusia: el modelo muestra un enfoque específico en eventos, fechas y personalidades, lo que permite construir tutores o cuestionarios interactivos.
- Procesamiento de documentos y textos en ruso en dispositivos móviles: al ejecutarse vía llama.cpp en formato GGUF, puede desplegarse en aplicaciones Android o iOS para tareas de resumen o extracción de información.
- Prototipado rápido con llama.cpp, LM Studio u Ollama: el formato GGUF y la compatibilidad con endpoints facilitan pruebas locales sin infraestructura GPU dedicada.

## Benchmarks y rendimiento
La model card proporciona resultados del benchmark MERA v2 para la familia RusMind, pero no una tabla específica de RusMind 4.6.5 · Momentum con sus métricas desglosadas. Los datos citados en la información disponible son los siguientes:

| Modelo | Parámetros | MERA v2 (general) |
|---|---|---|
| RusMind Vspyshka 4.7 | 7,5 mil millones | 0,191 |
| Qwen3.5-9B (Alibaba) | 9 mil millones | 0,186 |
| Gemma 4 E4B (Google) | 8 mil millones | 0,170 |
| RuadaptQwen3-32B | 32 mil millones | 0,163 |
| Zero-Mistral | 24 mil millones | 0,160 |
| T-lite (T-Bank) | 8 mil millones | 0,130 |

Para RusMind 4.6.5 · Momentum, la model card afirma que es número 1 en puntuación general entre modelos de hasta 5.000 millones de parámetros en MERA v2, por delante de LFM2.5 de Liquid AI, Gemma 4 E2B de Google y Qwen3.5-4B de Alibaba. También afirma que supera a A-Vibe de Avito (8 mil millones), Zero-Mistral-Small (24 mil millones), Gemma 4 E2B y Qwen3.5-4B en puntuación general, y que supera a T-lite en cultura y regiones de Rusia. No se proporcionan los valores numéricos concretos de Momentum en MERA v2 ni en otros benchmarks como MMLU, HumanEval o GSM8K.

## Requisitos de hardware
- VRAM estimada para inferencia: no disponible de forma oficial. Con 4.647 millones de parámetros totales, una cuantización Q4 requeriría aproximadamente 2,5-3 GB de memoria, y Q8 en torno a 5 GB; estas cifras son estimaciones por tamaño y no datos publicados por el autor.
- GPU recomendadas: no disponible. Por tamaño, el modelo puede ejecutarse en GPU de consumo como RTX 3060, RTX 4060 o superiores con cuantizaciones bajas.
- Cabida en GPU de consumo: sí, previsiblemente en modelos con 6-8 GB de VRAM o más, según cuantización. El autor indica que funciona en portátiles, equipos de sobremesa convencionales y teléfonos.
- Opciones de despliegue: llama.cpp, LM Studio, Ollama y entornos compatibles con GGUF y endpoints.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | MERA v2 | Licencia | Formato |
|---|---|---|---|---|---|
| RusMind 4.6.5 · Momentum | 4,6 mil millones (≈2 mil millones activos) | no disponible | nº1 hasta 5 mil millones (valor no publicado) | rusmind-license | GGUF |
| Gemma 4 E2B (Google) | no disponible | no disponible | por debajo de Momentum según el autor | licencia de Google (no detallada) | no disponible |
| Qwen3.5-4B (Alibaba) | 4 mil millones | no disponible | por debajo de Momentum según el autor | no disponible | no disponible |
| LFM2.5 (Liquid AI) | no disponible | no disponible | por debajo de Momentum según el autor | no disponible | no disponible |
| T-lite (T-Bank) | 8 mil millones | no disponible | 0,130 (MERA v2) | no disponible | no disponible |

## Limitaciones y advertencias
- Sesgos conocidos: no documentados en la información disponible; el entrenamiento parece centrado en ruso e inglés, lo que puede introducir sesgos culturales y lingüísticos hacia esos idiomas.
- Riesgo de alucinación: no cuantificado; como modelo de 4,6 mil millones de parámetros, es previsible que alucine en tareas de conocimiento factual fuera de su dominio de entrenamiento.
- Limitaciones de contexto: la longitud de contexto no está documentada, lo que impide garantizar su comportamiento en conversaciones o documentos largos.
- Limitaciones de idioma: solo se declaran ruso e inglés; la model card menciona comprensión de japonés según una evaluación externa, pero no es un idioma soportado oficialmente.
- Restricciones de licencia: la licencia rusmind-license es de tipo "other"; deben revisarse los términos del archivo LICENSE antes de cualquier uso comercial.
- Caveats para producción: el modelo se distribuye únicamente en GGUF y está orientado a inferencia local; no se han publicado datos de latencia, throughput ni estabilidad en cargas concurrentes. La model card recomienda migrar a RusMind 4.7 · Momentum, lo que sugiere que 4.6.5 puede quedar obsoleto.
- La información de benchmarks procede en gran parte de la propia model card y de comparaciones con versiones posteriores de la familia, no de una evaluación independiente específica de esta versión.

## Enlaces
- Hugging Face: https://huggingface.co/DICPlay/RusMind-4.6.5-Momentum
- Modelo base: https://huggingface.co/google/gemma-4-E2B-it
- Demo oficial: https://rusmind.ru
- Ranking MERA v2: https://mera.a-ai.ru/ru/text/leaderboard
- Versión posterior recomendada: https://huggingface.co/DICPlay/RusMind-4.7-Momentum
- RusMind 4.7 · Sokol: https://huggingface.co/DICPlay/RusMind-Sokol-4.7
- RusMind 4.7 · Vspyshka: https://huggingface.co/DICPlay/RusMind-Vspyshka-4.7
