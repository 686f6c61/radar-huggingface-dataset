# DICPlay/RusMind-4.5.4-Momentum

## Resumen

RusMind 4.5.4 · Моментум (Momentum) es un modelo de lenguaje en formato GGUF desarrollado por DICPlay, una iniciativa que se presenta como "IA nacional" rusa. Se trata de un ajuste fino (finetune) del modelo base `google/gemma-4-E2B-it`, orientado específicamente al idioma ruso y al inglés, y optimizado para inferencia en dispositivo (on-device) sin conexión a internet: portátiles, ordenadores de sobremesa convencionales y teléfonos móviles.

El modelo emplea una arquitectura de mezcla de expertos (MoE) heredada de Gemma 4 E2B, con 4.647.450.147 parámetros totales y aproximadamente 2.000 millones de parámetros activos por token, lo que explica su velocidad de inferencia y su viabilidad en hardware modesto. Se distribuye exclusivamente en cuantizaciones GGUF para llama.cpp, LM Studio y Ollama, con un repositorio de 20,2 GB que alberga las distintas variantes de cuantización.

Su relevancia radica en dos factores: por un lado, la optimización agresiva para ruso (cultura, regiones, ortografía, comprensión de personajes y humor) con un tamaño reducido; por otro, su posicionamiento en el benchmark MERA v2, donde el autor reporta resultados competitivos frente a modelos de 8 a 24 mil millones de parámetros. Es importante señalar que el autor ya recomienda migrar a versiones posteriores (4.7) del mismo linaje.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mezcla de expertos (MoE) derivada de Gemma 4 E2B |
| Parametros totales | 4.647.450.147 |
| Parametros activos | ~2.000 millones (según model card) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF (variantes múltiples; el repo ocupa 20,2 GB) |
| Idiomas soportados | Ruso (ru), inglés (en) |
| Licencia | rusmind-license (licencia propia, categoría "other") |
| Formato de pesos | GGUF (safetensors solo como referencia del dato de parámetros) |

## Arquitectura y entrenamiento

El modelo parte de `google/gemma-4-E2B-it`, un transformer con mezcla de expertos (MoE) de la familia Gemma 4. La arquitectura mantiene 4.647 millones de parámetros totales pero activa aproximadamente 2.000 millones por token, lo que reduce el coste computacional de cada paso de decodificación y permite ejecución en CPU y en dispositivos móviles. El ajuste fino realizado por DICPlay se orienta a ruso conversacional, razonamiento, cultura y regiones de Rusia, y corrección ortográfica y de puntuación.

La model card no detalla el volumen de tokens de entrenamiento, la composición del dataset ni si se emplearon técnicas de RLHF o DPO. Tampoco se documentan innovaciones arquitectónicas propias más allá de la herencia del modelo base. El autor menciona mejoras específicas en la versión 4.5.4: lógica, acertijos, habla coloquial rusa, comprensión de a quién va dirigida una pregunta, puntuación y cumplimiento de restricciones exactas de longitud en tareas creativas, además de precisión en fechas históricas de Rusia y corrección de errores en las preguntas.

## Capacidades

- Generación de texto conversacional en ruso e inglés, con registro coloquial y formal.
- Razonamiento y resolución de acertijos y problemas lógicos.
- Conocimiento de cultura y regiones de Rusia, incluyendo fechas históricas y corrección de errores factuales en las preguntas.
- Comprensión de personajes, humor y palabras con significados opuestos (antonimia contextual).
- Corrección ortográfica y de puntuación en ruso (el autor reporta 0,719 en la tarea correspondiente de MERA v2 para la versión 4.7 del linaje).
- Seguimiento de instrucciones complejas y restricciones de formato, incluyendo requisitos exactos de longitud en tareas creativas.
- Llamada a herramientas (tool calling / function calling), según la model card.
- Ejecución totalmente offline en dispositivo (on-device), sin dependencia de red.
- Compatibilidad con endpoints (tag `endpoints_compatible`).
- No se documentan capacidades de visión, audio ni modo de razonamiento explícito (thinking mode) en la información disponible.

## Casos de uso

- Asistentes conversacionales en ruso para dispositivos sin conectividad: el modelo puede ejecutarse en un portátil o teléfono mediante llama.cpp u Ollama, gestionando diálogos multi-turno sin enviar datos a la nube, lo que resulta adecuado para entornos con requisitos de privacidad o redes intermitentes.
- Corrección y edición de textos en ruso: dado su entrenamiento específico en ortografía y puntuación, puede integrarse en correctores o procesadores de texto para revisar borradores y normalizar estilo.
- Atención al cliente automatizada en ruso: su capacidad de seguir instrucciones complejas y llamar a herramientas permite conectarlo a APIs internas para consultar pedidos, estados o bases de conocimiento, con la ventaja de que el modelo corre localmente en el servidor de la empresa.
- Generación de contenido creativo con restricciones de longitud: el autor destaca su fiabilidad en tareas creativas con requisitos exactos de extensión, útil para generación de descripciones de producto, guiones breves o publicaciones con límite de caracteres.
- Educación y divulgación histórica sobre Rusia: su conocimiento de fechas y regiones, junto con la corrección de errores en las preguntas del usuario, lo hace apto para asistentes de estudio o material didáctico.
- Procesamiento por lotes en hardware modesto: al activar solo ~2.000 millones de parámetros y distribuirse en GGUF, puede ejecutarse en CPU para tareas de clasificación, resumen o extracción de información en volúmenes moderados sin GPU dedicada.
- Integración en aplicaciones móviles y de escritorio: el formato GGUF y el tamaño del modelo permiten empaquetarlo en aplicaciones de escritorio o móviles con inferencia local, útil para herramientas de productividad offline.

## Benchmarks y rendimiento

Los datos disponibles provienen del benchmark MERA v2 (Multimodal Evaluation for Russian-language Architectures), gestionado por la Alianza en el ámbito de la IA (Sber, Yandex, MTS, VK y otros). El autor reporta para RusMind Momentum una puntuación de 0,225 en la sección de Razonamiento (Reasoning). No se dispone de resultados completos de MMLU, HumanEval, GSM8K ni de la puntuación global del modelo en MERA v2 dentro de la información proporcionada.

| Benchmark / sección | RusMind Momentum (2B activos) | T-lite · T-Bank (8B) | Zero-Mistral (24B) | A-Vibe · Avito (8B) |
|---|---|---|---|---|
| MERA v2 · Razonamiento | 0,225 | 0,218 | 0,213 | 0,187 |

El autor afirma además que el modelo es número 1 en cultura y regiones de Rusia entre modelos de hasta 5.000 millones de parámetros, y número 1 en tareas centradas en el ser humano en la misma franja, si bien no se aportan las puntuaciones numéricas de esas secciones en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con ~2.000 millones de parámetros activos y cuantizaciones GGUF habituales (Q4_K_M, Q5_K_M, Q8_0), el modelo es apto para GPUs de gama media y para CPU.
- GPU recomendadas: no se especifican en la model card. Por el perfil del modelo (on-device, MoE con 2B activos), es razonable esperar funcionamiento en GPUs consumer, aunque no se confirma ningún modelo concreto.
- Cabe en GPU consumer: sí, según el posicionamiento del autor (portátiles, PC convencionales y teléfonos), aunque no se detallan modelos ni capacidades de memoria.
- Opciones de despliegue: llama.cpp, LM Studio, Ollama (mencionados en la model card); también se indica compatibilidad con endpoints.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | MERA v2 (razonamiento) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| RusMind 4.5.4 Momentum | 4,6B totales / ~2B activos | no disponible | 0,225 | rusmind-license | GGUF en Hugging Face |
| T-lite (T-Bank) | 8B | no disponible | 0,218 | no disponible | no disponible |
| Zero-Mistral | 24B | no disponible | 0,213 | no disponible | no disponible |
| A-Vibe (Avito) | 8B | no disponible | 0,187 | no disponible | no disponible |
| Gemma 4 E2B (Google) | no disponible | no disponible | no disponible | no disponible | no disponible |

La comparativa se limita a la sección de razonamiento de MERA v2, único dato numérico aportado. El autor afirma que Momentum supera en puntuación global a A-Vibe (8B), Zero-Mistral-Small (24B), Gemma 4 E2B y Qwen3.5-4B, pero no se incluyen las cifras correspondientes en la información disponible.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados en la model card; al estar especializado en cultura e historia de Rusia, puede presentar sesgos de perspectiva nacional no evaluados de forma independiente en esta ficha.
- Riesgo de alucinación: no cuantificado; como modelo de 2B activos, es esperable una tasa de error factual superior a la de modelos mayores en dominios fuera de su especialización.
- Limitaciones de contexto e idioma: solo ruso e inglés; la longitud de contexto no está documentada, lo que impide garantizar conversaciones de contexto largo.
- Restricciones de licencia: la licencia `rusmind-license` es propia y de categoría "other"; no se detallan en la información disponible los términos de uso comercial, por lo que es imprescindible revisar el archivo LICENSE antes de un despliegue en producción.
- Ciclo de vida: el autor recomienda explícitamente migrar a RusMind 4.7, lo que sugiere que 4.5.4 no recibirá necesariamente mantenimiento a largo plazo.
- Evaluación: los resultados de MERA v2 son reportados por el propio autor a partir de la plataforma; no se dispone de evaluaciones independientes adicionales en la información proporcionada.
- Formato: al distribuirse solo en GGUF, no es directamente compatible con pipelines que requieran safetensors o PyTorch nativo sin conversión.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/DICPlay/RusMind-4.5.4-Momentum
- Demo / sitio del autor: https://rusmind.ru
- Benchmark MERA v2: https://mera.a-ai.ru/ru/text/leaderboard
- Versión posterior recomendada (4.7 Momentum): https://huggingface.co/DICPlay/RusMind-4.7-Momentum
- RusMind 4.7 Sokol: https://huggingface.co/DICPlay/RusMind-Sokol-4.7
- RusMind 4.7 Vspyshka: https://huggingface.co/DICPlay/RusMind-Vspyshka-4.7
- Modelo base: https://huggingface.co/google/gemma-4-E2B-it
