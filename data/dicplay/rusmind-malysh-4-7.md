# DICPlay/RusMind-Malysh-4.7

## Resumen

RusMind 4.7 · Malysh (Малыш, "pequeño" en ruso) es un modelo de lenguaje de 752 millones de parámetros desarrollado por DICPlay, un equipo ruso que publica la familia RusMind de modelos orientados al idioma ruso. Se trata de un fine-tuning del modelo base Qwen/Qwen3.5-0.8B, especializado en conversación en ruso e inglés y diseñado explícitamente para inferencia en dispositivo (on-device) y completamente offline: teléfonos de gama baja, portátiles sin GPU y dispositivos embebidos.

El modelo se posiciona como la variante más pequeña de la familia RusMind 4.7, que incluye también a Sokol (8.900 millones de parámetros, con modo de razonamiento) y Vspyshka (7.500 millones). Su propuesta de valor es ofrecer un asistente con conocimiento de la cultura, historia y geografía rusas, corrección ortográfica y de puntuación en ruso, y generación de código sencillo (HTML, Python, JavaScript), todo ello en un paquete de menos de 1.000 millones de parámetros que cabe en hardware muy limitado.

La relevancia actual del modelo radica en su relación calidad/tamaño en el benchmark ruso MERA v2, donde con 0,75 mil millones de parámetros supera en el apartado de cultura y regiones de Rusia a modelos de hasta 12 veces su tamaño (Qwen3.5-9B, Gemma 4 E4B/E2B, RuadaptQwen3-8B, A-Vibe). La licencia es propietaria (rusmind-license), lo que condiciona su uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (derivada de Qwen3.5-0.8B, tag `qwen3_5_text`) |
| Parametros totales | 752.393.024 (0,75 mil millones) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF (disponible en el repositorio); pesos completos en BF16 safetensors |
| Idiomas soportados | Ruso (ru), inglés (en) |
| Licencia | rusmind-license (propietaria, `license: other`) |
| Formato de pesos | safetensors (BF16) y GGUF |

## Arquitectura y entrenamiento

El modelo es un fine-tuning del checkpoint Qwen/Qwen3.5-0.8B, un transformer decoder-only de la familia Qwen 3.5 de Alibaba, con 752 millones de parámetros efectivos según los pesos safetensors publicados. La model card no detalla la composición del dataset de ajuste fino, el número de tokens de entrenamiento ni si se emplearon técnicas de RLHF o DPO; únicamente se indica la relación `base_model_relation: finetune` respecto al modelo base. Tampoco se especifica la longitud de contexto nativa ni si se modificó respecto al checkpoint original.

El entrenamiento está claramente orientado a dos objetivos: dominio del ruso (ortografía, puntuación, conocimiento cultural y regional de Rusia) y eficiencia en dispositivo. La familia RusMind emplea las etiquetas `on-device`, `offline` y `endpoints_compatible`, lo que sugiere que el modelo puede servirse mediante APIs compatibles con OpenAI. No se documentan innovaciones arquitectónicas propias (atención lineal, decodificación especulativa, atención híbrida); se trata de un ajuste fino sobre una arquitectura estándar.

## Capacidades

- Generación de texto conversacional multi-turno en ruso e inglés.
- Conocimiento específico de la cultura, historia, regiones y pueblos de Rusia.
- Corrección ortográfica y de puntuación en ruso (0,719 en la tarea correspondiente de MERA v2 según la model card).
- Generación de código sencillo en HTML, Python y JavaScript.
- Comprensión de personajes, humor y antónimos (según la model card).
- Seguimiento de instrucciones complejas y llamada a herramientas (tool calling), con un resultado de 0,030 en la sección de tareas agénticas de MERA v2.
- Razonamiento básico (0,158 en la sección de razonamiento de MERA v2).
- Ejecución completamente offline, sin dependencia de red.
- No se documentan capacidades de visión, audio ni modo de razonamiento extendido (thinking mode) para esta variante.

## Casos de uso

- Asistente conversacional offline en teléfonos de gama baja: el modelo cabe en dispositivos con poca memoria y responde sin conexión, de modo que las conversaciones no salen del dispositivo; adecuado para aplicaciones de mensajería o asistentes personales con requisitos de privacidad.
- Corrección y edición de textos en ruso: dado su rendimiento en ortografía y puntuación (0,719), puede integrarse en editores o procesadores de texto para revisar borradores antes de publicarlos.
- Generación de código de apoyo en entornos sin red: útil en portátiles de desarrollo sin GPU para producir fragmentos de HTML, Python o JavaScript, prototipos o scripts de automatización.
- Chatbot de atención al cliente en ruso para pymes: al ejecutarse en hardware modesto, permite desplegar un asistente local sin costes de API, con respuestas sobre productos o procedimientos.
- Aplicaciones educativas sobre cultura e historia de Rusia: su resultado de 0,192 en cultura y regiones de Rusia lo hace adecuado para tutores o cuestionarios interactivos dirigidos a estudiantes.
- Automatización de tareas agénticas ligeras: con soporte de tool calling, puede orquestar llamadas a funciones locales (calendario, ficheros, consultas a bases de datos) en flujos de un solo paso dentro de un dispositivo embebido.
- Procesamiento de texto en dispositivos IoT o embebidos: clasificación, resumen corto o extracción de entidades en ruso donde no es viable enviar datos a la nube.

## Benchmarks y rendimiento

Los datos disponibles provienen del benchmark MERA v2 (octubre de 2026), según la model card. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

| Métrica MERA v2 | RusMind Malysh (0,75 B) | GFusion-10B (10,7 B) | SmolLM-3B (3 B) |
|---|---|---|---|
| Puntuación global | 0,087 | 0,075 | 0,049 |
| Razonamiento | 0,158 | 0,122 | 0,063 |
| Cultura y regiones de Rusia | 0,192 | 0,153 | 0,090 |

| Cultura y regiones de Rusia | RusMind Malysh (0,75 B) | RuadaptQwen3-8B (8 B) | meno-lite (8 B) | A-Vibe (8 B) | Gemma 4 E2B (5 B) | Qwen3.5-9B (9 B) |
|---|---|---|---|---|---|---|
| Puntuación MERA v2 | 0,192 | 0,191 | 0,189 | 0,171 | 0,139 | 0,118 |

La model card también reporta 0,030 en la sección de tareas agénticas de MERA v2, por delante de Gemma 4 E4B, Zero-Mistral-Small (24 B), GFusion-10B y meno-lite, y una puntuación global de 0,087, casi a la par de Gemma 4 E4B (8 B).

## Requisitos de hardware

- VRAM estimada para inferencia: en BF16, aproximadamente 1,5 GB solo para pesos; en cuantización GGUF Q4, en torno a 0,5 GB, más overhead de contexto y runtime.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM para BF16; tarjetas consumer como RTX 3060, RTX 4060 o superiores no suponen ningún problema. El modelo está pensado para ejecutarse en CPU.
- Cabe en GPU consumer: sí, en cualquier GPU moderna e incluso en iGPU y en teléfonos de gama baja, según el propio autor.
- Opciones de despliegue: Transformers (safetensors), llama.cpp, Ollama, LM Studio y PocketPal (según la model card); también se indica compatibilidad con endpoints.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | MERA v2 (global) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| RusMind Malysh 4.7 | 0,75 B | no disponible | 0,087 | rusmind-license (propietaria) | Hugging Face |
| SmolLM-3B | 3 B | no disponible | 0,049 | no disponible en la información | Hugging Face |
| Gemma 4 E2B | 5 B | no disponible | no disponible (0,139 en cultura y regiones) | no disponible en la información | Hugging Face |
| Qwen3.5-9B | 9 B | no disponible | no disponible (0,118 en cultura y regiones) | no disponible en la información | Hugging Face |

La comparación se limita a las métricas de MERA v2 publicadas en la model card; no se dispone de datos de benchmarks estándar para comparar directamente con alternativas de tamaño similar.

## Limitaciones y advertencias

- Licencia propietaria (rusmind-license): es necesario revisar el fichero LICENSE del repositorio antes de cualquier uso comercial; la model card no detalla las restricciones.
- Riesgo de alucinación inherente a un modelo de 0,75 mil millones de parámetros; el conocimiento factual puede ser impreciso fuera de los dominios entrenados.
- Cobertura lingüística limitada a ruso e inglés; el rendimiento en otros idiomas no está documentado y previsiblemente será deficiente.
- Longitud de contexto no documentada; no se recomienda asumir ventanas largas en producción sin verificarlas empíricamente.
- Capacidad de razonamiento y de código limitada por el tamaño: los resultados de MERA v2 en razonamiento (0,158) y agentes (0,030) son bajos en términos absolutos, aunque competitivos para su escala.
- No se documentan sesgos conocidos ni evaluaciones de seguridad; al estar entrenado con foco en Rusia, puede reflejar sesgos culturales en temas históricos y geopolíticos.
- La model card incluye afirmaciones promocionales sobre otros modelos de la familia (Sokol, Vspyshka) que no deben extrapolarse a este checkpoint.
- No se especifican los datos de entrenamiento ni los métodos de alineación, lo que dificulta evaluar su robustez frente a prompts adversarios.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/DICPlay/RusMind-Malysh-4.7
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Demo / plataforma: https://rusmind.ru
- Benchmark MERA v2: https://mera.a-ai.ru/ru/text/leaderboard
- Modelo relacionado RusMind Sokol 4.7: https://huggingface.co/DICPlay/RusMind-Sokol-4.7
- Modelo relacionado RusMind Vspyshka 4.7: https://huggingface.co/DICPlay/RusMind-Vspyshka-4.7
