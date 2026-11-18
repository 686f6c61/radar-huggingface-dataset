# DICPlay/RusMind-4.5-Momentum

## Resumen

RusMind 4.5 · Моментум es un modelo de lenguaje de la familia RusMind, desarrollado por DICPlay y presentado como "IA nacional" rusa orientada a ejecución local. Se distribuye en formato GGUF y está afinado a partir de google/gemma-4-E2B-it, con un total de 4.647.450.147 parámetros según los pesos reales, aunque el autor indica que en cada respuesta se activan aproximadamente 2.000 millones. Su propuesta central es ofrecer un modelo ligero, ejecutable sin conexión en portátiles, equipos de sobremesa y teléfonos, con especial énfasis en ruso y soporte de inglés.

El modelo se posiciona dentro de un ecosistema más amplio: el autor publica versiones posteriores (4.7 Моментум, 4.7 Сокол y 4.7 Вспышка) y recomienda migrar a ellas. RusMind 4.5 Моментум se evalúa en el benchmark independiente MERA v2, gestionado por el Alianza en el ámbito de la IA (Sber, Yandex, MTS, VK y otros), donde el autor reporta buenos resultados en cultura y regiones de Rusia, tareas centradas en el ser humano y razonamiento para su rango de tamaño.

La relevancia actual reside en la combinación de tamaño reducido, cuantización GGUF para llama.cpp y despliegue offline, lo que lo hace atractivo para aplicaciones en dispositivos con recursos limitados y para casos de uso en ruso donde el coste de inferencia en la nube es un obstáculo. La licencia es propia (rusmind-license), no estándar, lo que exige revisión legal antes de uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer derivado de google/gemma-4-E2B-it (detalles internos no disponibles) |
| Parametros totales | 4.647.450.147 |
| Parametros activos | Aproximadamente 2.000 millones (según model card) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF (variantes concretas no disponibles) |
| Idiomas soportados | Ruso (ru), inglés (en) |
| Licencia | rusmind-license (licencia propia, categoría "other") |
| Formato de pesos | GGUF (librería gguf, orientado a llama.cpp) |

## Arquitectura y entrenamiento

El modelo parte de google/gemma-4-E2B-it, un modelo base de Google, y se presenta como un fine-tune del mismo. La model card menciona que el modelo tiene 4,6 mil millones de parámetros totales y que en cada respuesta se activan alrededor de 2 mil millones, lo que sugiere una arquitectura con activación selectiva de parámetros, aunque no se detalla el mecanismo exacto en la información disponible. No se especifican el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO.

La información del autor destaca mejoras respecto a la generación 4.5 en tareas en ruso: puntuación y ortografía, comprensión de personajes y del interlocutor, llamada a herramientas en el formato correcto, y comprensión de acertijos, humor, habla coloquial rusa y palabras dialectales de distintas regiones. No se detallan innovaciones técnicas como decodificación especulativa o atención lineal. El formato de distribución es GGUF, pensado para llama.cpp, LM Studio, Ollama y entornos de ejecución en dispositivo.

## Capacidades

- Generación de texto conversacional en ruso e inglés, con especial atención a la calidad ortográfica y de puntuación en ruso.
- Razonamiento: el autor reporta resultados destacados en la sección de razonamiento de MERA v2 para su rango de tamaño.
- Llamada a herramientas (tool calling / function calling): la model card indica que invoca herramientas en el formato correcto.
- Comprensión de matices culturales y regionales de Rusia, incluyendo personajes, humor, habla coloquial y dialectos.
- Comprensión de acertijos y juegos de palabras.
- Ejecución en dispositivo y sin conexión (on-device, offline) gracias al formato GGUF.
- Soporte multilingüe limitado a ruso e inglés.
- No se documentan capacidades de visión, audio ni modo de razonamiento explícito (thinking mode) en la información disponible.

## Casos de uso

- Asistentes conversacionales offline en ruso: el modelo puede ejecutarse en un portátil o teléfono sin conexión, gestionando diálogos multi-turno con un consumo de recursos ajustado a los aproximadamente 2.000 millones de parámetros activos.
- Atención al cliente en ruso con despliegue local: adecuado para organizaciones que necesitan procesar conversaciones sin enviar datos a la nube, con soporte de llamada a herramientas para consultar sistemas internos.
- Procesamiento de texto en dispositivos de gama media: al distribuirse en GGUF y activar unos 2.000 millones de parámetros, puede integrarse en aplicaciones de escritorio y móviles mediante llama.cpp u Ollama.
- Corrección y mejora de textos en ruso: el autor destaca mejoras en ortografía y puntuación, lo que permite usarlo en herramientas de edición y revisión de documentos.
- Aplicaciones educativas y de divulgación cultural: su énfasis en cultura, regiones y comprensión de personajes lo hace útil para contenidos sobre historia, tradiciones y dialectos rusos.
- Prototipado rápido de agentes con tool calling: la invocación de herramientas en formato correcto permite construir flujos multi-paso en entornos de desarrollo con recursos limitados.
- Investigación sobre modelos ligeros en ruso: sirve como referencia para comparar fine-tunes de Gemma en benchmarks como MERA v2 y para estudiar el comportamiento de modelos pequeños en tareas culturales.

## Benchmarks y rendimiento

Los datos disponibles provienen de MERA v2 según la model card del autor. No se han publicado resultados de benchmarks en la información disponible para MMLU, HumanEval o GSM8K.

| Benchmark (MERA v2) | RusMind Моментум (2B activos) | T-lite · T-Bank (8B) | Zero-Mistral (24B) | A-Vibe · Avito (8B) |
|---|---|---|---|---|
| Razonamiento | 0,225 | 0,218 | 0,213 | 0,187 |

El autor también afirma que el modelo es número 1 en cultura y regiones de Rusia entre modelos de hasta 5.000 millones de parámetros, y número 1 en tareas centradas en el ser humano en ese mismo rango. Además, indica que supera en puntuación global a A-Vibe (8B), Zero-Mistral-Small (24B), Gemma 4 E2B y Qwen3.5-4B, aunque no se proporcionan las cifras concretas de esas comparaciones en la información disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma oficial. Como referencia orientativa, un modelo de 4,6 mil millones de parámetros en GGUF requiere aproximadamente 3-4 GB en cuantización de 4 bits y 8-9 GB en FP16, aunque estas cifras no las proporciona el autor.
- GPU recomendadas: no disponibles. Por tamaño, podría ejecutarse en GPU de consumo como RTX 3060, RTX 4060 o superiores en cuantizaciones bajas, pero no hay confirmación oficial.
- Cabe en GPU de consumo: probable en cuantizaciones de 4 bits, aunque no se especifican los requisitos exactos.
- Opciones de despliegue: llama.cpp, LM Studio, Ollama y entornos compatibles con GGUF. La model card menciona endpoints compatibles.
- Latencia y throughput: no disponibles. El autor afirma que "vuela" en navegador y teléfono, pero no aporta cifras.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | MERA v2 (razonamiento) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| RusMind 4.5 Моментум | 4,6B totales / ~2B activos | no disponible | 0,225 | rusmind-license | GGUF en Hugging Face |
| T-lite · T-Bank | 8B | no disponible | 0,218 | no disponible | no disponible |
| Zero-Mistral | 24B | no disponible | 0,213 | no disponible | no disponible |
| A-Vibe · Avito | 8B | no disponible | 0,187 | no disponible | no disponible |

La comparación se limita a la sección de razonamiento de MERA v2 reportada por el autor. No se dispone de datos de contexto, licencia ni disponibilidad de los modelos comparados en la información proporcionada.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados en la información disponible; al estar especializado en ruso, puede reflejar sesgos culturales y regionales de sus datos de entrenamiento.
- Riesgo de alucinación: inherente a los modelos de lenguaje; no se han publicado evaluaciones específicas de factualidad.
- Limitaciones de contexto: la longitud de contexto no está disponible, lo que impide evaluar su idoneidad para documentos largos.
- Limitaciones de idioma: solo ruso e inglés; el rendimiento en otros idiomas no está documentado.
- Licencia: rusmind-license es una licencia propia no estándar; es necesario revisar el archivo LICENSE antes de cualquier uso comercial.
- El autor recomienda migrar a versiones posteriores (4.7 Моментум, 4.7 Сокол, 4.7 Вспышка), lo que sugiere que 4.5 puede quedar desactualizado.
- No se detallan los requisitos de hardware ni el contexto, lo que dificulta la planificación de producción.
- El modelo tiene 0 likes y unas 1.636 descargas en el momento de la consulta, lo que indica una adopción limitada.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/DICPlay/RusMind-4.5-Momentum
- Modelo base: https://huggingface.co/google/gemma-4-E2B-it
- Demo: https://rusmind.ru
- Benchmark MERA v2: https://mera.a-ai.ru/ru/text/leaderboard
- Versión posterior recomendada: https://huggingface.co/DICPlay/RusMind-4.7-Momentum
- RusMind 4.7 Сокол: https://huggingface.co/DICPlay/RusMind-Sokol-4.7
- RusMind 4.7 Вспышка: https://huggingface.co/DICPlay/RusMind-Vspyshka-4.7
