# DICPlay/RusMind-Malysh-4.7

## Resumen

RusMind-Malysh-4.7 (RusMind 4.7 · Малыш) es un modelo de generación de texto de 752 millones de parámetros desarrollado por DICPlay, un equipo ruso que comercializa la familia RusMind como "IA nacional". Se trata de un fine-tuning del modelo base Qwen/Qwen3.5-0.8B, orientado a ejecución totalmente offline en dispositivos de gama baja: teléfonos económicos, portátiles sin GPU y sistemas embebidos. Su propuesta de valor es el tamaño reducido combinado con un ajuste específico para ruso e inglés.

El modelo se presenta como el miembro más pequeño de la familia RusMind 4.7, que incluye variantes mayores (Vspyshka de 7,5 mil millones y Sokol de 8,9 mil millones de parámetros). DICPlay publica resultados en el benchmark ruso MERA v2, donde Malysh obtiene un 0,087 de puntuación global y destaca en la categoría de cultura y regiones de Rusia con 0,192, por encima de modelos varias veces mayores. La licencia es propietaria ("rusmind-license"), lo que condiciona su uso comercial.

El modelo emplea la arquitectura del Qwen3.5-0.8B subyacente, con pesos en safetensors (BF16) y cuantizaciones GGUF para su despliegue en LM Studio, Ollama y llama.cpp. Su relevancia actual radica en la demanda de asistentes conversacionales que funcionen sin conexión y sin enviar datos a la nube, un nicho donde los modelos de menos de mil millones de parámetros con buen soporte de ruso son escasos.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (derivada de Qwen3.5-0.8B, tag `qwen3_5_text`) |
| Parámetros totales | 752.393.024 (aproximadamente 0,75 mil millones) |
| Parámetros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | BF16 (pesos completos en safetensors) y GGUF (cuantizaciones no detalladas) |
| Idiomas soportados | ruso (ru) e inglés (en) |
| Licencia | rusmind-license (licencia propietaria, `license: other`) |
| Formato de pesos | safetensors y GGUF |
| Tamaño del repositorio | 4,4 GB |
| Modelo base | Qwen/Qwen3.5-0.8B (fine-tuning) |
| Librería | transformers |
| Pipeline | text-generation |

## Arquitectura y entrenamiento

El modelo parte de Qwen3.5-0.8B, un transformer decoder-only de la familia Qwen3.5 de Alibaba, y se distribuye como fine-tuning completo (`base_model_relation: finetune`). La model card no especifica el volumen de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de alineación como RLHF o DPO. Tampoco se documentan innovaciones arquitectónicas propias: el autor se limita a indicar que es una adaptación del modelo base con ajuste para ruso e inglés.

La información pública se centra en el posicionamiento del modelo (ejecución en dispositivo, sin conexión) y en los resultados de MERA v2, no en los detalles del proceso de entrenamiento. No se dispone de datos sobre la mezcla de datos rusos utilizada, el número de épocas ni el régimen de entrenamiento. Cualquier afirmación sobre el proceso de ajuste más allá de lo indicado sería especulativa.

## Capacidades

- Generación de texto conversacional en ruso e inglés, con soporte declarado de conversaciones multi-turno.
- Conocimiento específico de Rusia: historia, cultura, regiones, pueblos y tradiciones, según los resultados del subconjunto de MERA v2 correspondiente.
- Corrección ortográfica y de puntuación en ruso: el autor cita una puntuación de 0,719 en la tarea de corrección de ortografía y puntuación de MERA.
- Generación de código sencillo en HTML, Python y JavaScript, según la model card.
- Razonamiento básico: obtiene 0,158 en el apartado de razonamiento de MERA v2.
- Soporte de tool calling / function calling: la model card de la variante Vspyshka menciona "вызывает инструменты" (invoca herramientas) para la familia; para Malysh no se detalla explícitamente, por lo que debe considerarse no confirmado.
- Ejecución totalmente offline en dispositivo, sin dependencia de red.
- No se documentan capacidades de visión, audio ni modo de razonamiento extendido (thinking mode) para esta variante.

## Casos de uso

- Asistente conversacional offline en teléfonos de gama baja: con 752 millones de parámetros y pesos GGUF, el modelo puede ejecutarse en dispositivos Android modestos mediante PocketPal o llama.cpp, manteniendo la conversación íntegramente en el dispositivo y sin enviar datos a servidores externos.
- Corrección ortográfica y de puntuación en ruso: el modelo declara un rendimiento específico en esta tarea (0,719 en MERA), lo que lo hace adecuado para integrarse en editores de texto o correctores locales que procesen documentos en ruso sin conexión.
- Atención al cliente en ruso con requisitos de privacidad: empresas que no pueden enviar conversaciones a la nube pueden desplegar el modelo en un servidor local o en el propio dispositivo del agente para respuestas de primer nivel y clasificación de consultas.
- Generación de fragmentos de código simples: útil para autocompletar HTML, Python o JavaScript en entornos de desarrollo con recursos limitados o sin acceso a internet, como aulas o entornos air-gapped.
- Aplicaciones educativas sobre cultura e historia de Rusia: el modelo destaca en el subconjunto de cultura y regiones de MERA (0,192), por lo que puede emplearse en aplicaciones de aprendizaje o trivia localizadas, siempre con revisión humana por el riesgo de alucinación.
- Sistemas embebidos y domótica con interfaz de voz o texto: al caber en hardware modesto, puede integrarse en asistentes de dispositivos del hogar que necesiten comprender instrucciones en ruso sin depender de servicios en la nube.
- Prototipado rápido de pipelines de generación de texto: su tamaño permite iterar en portátiles sin GPU durante el desarrollo, antes de migrar a variantes mayores de la familia RusMind.

## Benchmarks y rendimiento

Los únicos datos publicados en la información disponible provienen del benchmark MERA v2 (octubre de 2026), que evalúa modelos en ruso. No se han publicado resultados de MMLU, HumanEval, GSM8K ni otros benchmarks estándar en la información proporcionada.

| Métrica MERA v2 | RusMind Malysh 4.7 (0,75 B) | GFusion-10B (10,7 B) | SmolLM-3B (3 B) |
|---|---|---|---|
| Puntuación global | 0,087 | 0,075 | 0,049 |
| Razonamiento | 0,158 | 0,122 | 0,063 |
| Cultura y regiones de Rusia | 0,192 | 0,153 | 0,090 |

| Cultura y regiones de Rusia (MERA v2) | RusMind Malysh 4.7 (0,75 B) | RuadaptQwen3-8B (8 B) | meno-lite (8 B) | A-Vibe (8 B) | Gemma 4 E2B (5 B) | Qwen3.5-9B (9 B) |
|---|---|---|---|---|---|---|
| Puntuación | 0,192 | 0,191 | 0,189 | 0,171 | 0,139 | 0,118 |

El autor también cita una puntuación de 0,030 en tareas agénticas de MERA v2, superior a la de Gemma 4 E4B, Zero-Mistral-Small, GFusion-10B y meno-lite según la model card. Estos datos proceden exclusivamente de la documentación del autor y no se han verificado de forma independiente en esta ficha.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1,5 GB en BF16 (752 millones de parámetros × 2 bytes), y en torno a 0,5-1 GB con cuantizaciones GGUF de 4-8 bits (estimación basada en el tamaño de parámetros; las cuantizaciones concretas no se detallan en la información disponible).
- GPU recomendadas: no requiere GPU dedicada; puede ejecutarse en CPU. En GPU, cualquier tarjeta con 2 GB o más de VRAM es suficiente.
- Cabe en GPU de consumo: sí, en cualquier GPU de consumo moderna (GTX 1050 en adelante, RTX 3050/4060, etc.), así como en iGPU y en CPU.
- Opciones de despliegue: Transformers (pesos safetensors), llama.cpp, Ollama, LM Studio y PocketPal, según la model card. Compatible con endpoints (`endpoints_compatible`).
- Latencia y throughput: no disponibles. El autor no publica cifras de tokens por segundo ni latencia para esta variante.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | MERA v2 global | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| RusMind-Malysh-4.7 | 0,75 B | no disponible | 0,087 | rusmind-license (propietaria) | Hugging Face (safetensors, GGUF) |
| SmolLM-3B | 3 B | no disponible | 0,049 | no disponible en la información | Hugging Face |
| GFusion-10B | 10,7 B | no disponible | 0,075 | no disponible en la información | Hugging Face |
| Qwen3.5-0.8B (base) | 0,8 B | no disponible | no disponible | no disponible en la información | Hugging Face |

La comparación se limita a los datos de MERA v2 citados por el autor. Malysh supera a SmolLM-3B y GFusion-10B en puntuación global y razonamiento pese a tener entre 4 y 14 veces menos parámetros. No se dispone de datos comparativos de MMLU, HumanEval u otros benchmarks estándar para estos modelos en la información proporcionada.

## Limitaciones y advertencias

- Licencia propietaria: la licencia "rusmind-license" es de tipo `other` y no se detallan sus términos en la información disponible; es imprescindible revisar el archivo LICENSE del repositorio antes de cualquier uso comercial.
- Riesgo de alucinación: con 752 millones de parámetros, la capacidad de razonamiento y de retención factual es limitada; los resultados de MERA (0,087 global) indican un rendimiento bajo en términos absolutos, aunque competitivo para su tamaño.
- Cobertura lingüística restringida: solo ruso e inglés; no se garantiza un comportamiento adecuado en castellano ni en otros idiomas.
- Longitud de contexto no documentada: se desconoce la ventana máxima, lo que dificulta planificar casos de uso con documentos largos o conversaciones extensas.
- Sin datos de entrenamiento publicados: no se puede evaluar la composición del dataset, los posibles sesgos ni el grado de alineación con valores de seguridad.
- Benchmarks no verificados de forma independiente: las cifras de MERA v2 proceden exclusivamente de la model card del autor.
- Capacidad de tool calling no confirmada para esta variante concreta: la mención de invocación de herramientas aparece en la documentación de la variante Vspyshka, no en la de Malysh.
- Adecuación limitada para tareas agénticas complejas: la puntuación de 0,030 en el apartado agéntico de MERA indica un rendimiento bajo en planificación multi-paso.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/DICPlay/RusMind-Malysh-4.7
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Variante RusMind 4.7 · Sokol: https://huggingface.co/DICPlay/RusMind-Sokol-4.7
- Variante RusMind 4.7 · Vspyshka: https://huggingface.co/DICPlay/RusMind-Vspyshka-4.7
- Demo y servicio RusMind: https://rusmind.ru
- Leaderboard MERA v2: https://mera.a-ai.ru/ru/text/leaderboard
