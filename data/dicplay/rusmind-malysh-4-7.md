# DICPlay/RusMind-Malysh-4.7

## Resumen

RusMind-Malysh-4.7 (Малыш, "el pequeño" en ruso) es un modelo de lenguaje de 752 millones de parámetros desarrollado por DICPlay, un finetune del modelo base Qwen/Qwen3.5-0.8B. Forma parte de la familia RusMind, una colección de modelos orientados al idioma ruso, y se posiciona como la variante más compacta de la familia, pensada para ejecución totalmente offline en dispositivos con recursos limitados: teléfonos de gama baja, portátiles sin GPU e sistemas embebidos.

El modelo resuelve el problema de disponer de un asistente conversacional en ruso que funcione sin conexión a internet y sin hardware dedicado, manteniendo un conocimiento específico de la cultura, la historia y las regiones de Rusia. Su tamaño reducido (menos de 1.000 millones de parámetros) permite cuantizarlo y desplegarlo en entornos donde modelos más grandes no caben, y su licencia propietaria (rusmind-license) está pensada para uso personal con opción de licencia comercial para organizaciones.

Es relevante ahora porque el autor publica resultados en el benchmark independiente MERA v2 (Multimodal Evaluation for Russian-language Architectures) en los que este modelo de 0,75 mil millones de parámetros supera en la categoría de cultura y regiones de Rusia a modelos de hasta 12 veces su tamaño, como Qwen3.5-9B de Alibaba. La arquitectura subyacente es la del Qwen3.5-0.8B, de tipo transformer, según la etiqueta `qwen3_5_text` del repositorio.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de Qwen/Qwen3.5-0.8B, etiqueta `qwen3_5_text`) |
| Parámetros totales | 752.393.024 (0,75 mil millones) |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | GGUF disponible en el repositorio (niveles concretos no especificados); pesos safetensors en precisión original |
| Idiomas soportados | Ruso (ru) e inglés (en) |
| Licencia | rusmind-license (licencia propia, marcada como `other`; licencia comercial para organizaciones previa solicitud) |
| Formato de pesos | safetensors y GGUF |

## Arquitectura y entrenamiento

El modelo es un finetune (relación `base_model_relation: finetune`) del Qwen/Qwen3.5-0.8B de Alibaba. La etiqueta de arquitectura del repositorio es `qwen3_5_text`, lo que indica que conserva la pila transformer del modelo base y su tokenizador. No se especifican en la información disponible el número de tokens de entrenamiento, la composición del dataset de ajuste ni si se emplearon técnicas de RLHF, DPO u otras variantes de alineación.

La innovación declarada por el autor no es arquitectónica sino de especialización: el ajuste está orientado a conocimiento cultural e histórico de Rusia, corrección ortográfica y de puntuación en ruso, seguimiento de instrucciones y llamada a herramientas (tool calling). El autor publica resultados en MERA v2 que sitúan al modelo por encima de alternativas mucho mayores en la categoría de cultura y regiones de Rusia (0,192 frente a 0,191 de RuadaptQwen3-8B y 0,118 de Qwen3.5-9B).

## Capacidades

- Generación de texto conversacional en ruso e inglés.
- Conocimiento específico de historia, cultura, regiones, pueblos y tradiciones de Rusia.
- Corrección ortográfica y de puntuación en ruso (0,719 según el autor en la prueba de ortografía y puntuación de MERA v2).
- Generación de código sencillo en HTML, Python y JavaScript.
- Llamada a herramientas (tool calling / function calling), citada explícitamente por el autor en la descripción de la familia.
- Ejecución totalmente offline, sin conexión a internet.
- Comprensión de personajes, humor y antónimos según las afirmaciones del autor.
- No se declaran capacidades de visión, audio ni modo de razonamiento extendido (thinking) para esta variante; el modo de razonamiento se atribuye a otro miembro de la familia (Sokol 4.7).

## Casos de uso

- Asistente conversacional offline en teléfonos de gama baja: con 0,75 mil millones de parámetros y pesos GGUF, el modelo cabe en dispositivos Android modestos y responde sin conexión, de modo que las conversaciones no salen del terminal.
- Corrección ortográfica y de puntuación en ruso: puede integrarse en editores de texto o correctores locales para revisar textos en ruso sin enviar el contenido a un servicio en la nube.
- Tutor de cultura e historia rusa: su especialización en regiones, pueblos y tradiciones lo hace adecuado para aplicaciones educativas o de divulgación dirigidas a público rusohablante.
- Asistente de escritorio en portátiles sin GPU: al ejecutarse con llama.cpp u Ollama en CPU, sirve como chatbot local en equipos antiguos donde no caben modelos de 7B o superiores.
- Generación de fragmentos de código simples en HTML, Python y JavaScript dentro de entornos de desarrollo ligeros o asistentes de documentación técnica.
- Automatización con tool calling en sistemas embebidos: el soporte de llamada a funciones permite construir agentes mínimos que consulten APIs locales o ejecuten acciones sobre el dispositivo.
- Procesamiento de texto en inglés y ruso en pipelines de CI/CD o scripts de preprocesamiento, aprovechando su reducido consumo de memoria.

## Benchmarks y rendimiento

Los datos publicados por el autor provienen del benchmark independiente MERA v2 (Alianza de IA de Rusia). Se recogen a continuación los valores citados en la model card.

| Categoría MERA v2 | RusMind-Malysh-4.7 (0,75B) | GFusion-10B (10,7B) | SmolLM-3B (3B) |
|---|---|---|---|
| Puntuación general | 0,087 | 0,075 | 0,049 |
| Razonamiento | 0,158 | 0,122 | 0,063 |
| Cultura y regiones de Rusia | 0,192 | 0,153 | 0,090 |

| Cultura y regiones de Rusia | RusMind-Malysh-4.7 | RuadaptQwen3-8B | meno-lite | A-Vibe (Avito) | Gemma 4 E2B | Qwen3.5-9B |
|---|---|---|---|---|---|---|
| Puntuación MERA v2 | 0,192 | 0,191 | 0,189 | 0,171 | 0,139 | 0,118 |

El autor indica además una puntuación de 0,030 en tareas agénticas, por delante de Gemma 4 E4B, Zero-Mistral-Small (24B), GFusion-10B y meno-lite, y una puntuación de 0,719 en corrección ortográfica y de puntuación. No se han publicado resultados de benchmarks estándar internacionales (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1,5 GB en FP16 (0,75B × 2 bytes), alrededor de 0,8-1 GB en cuantización de 8 bits y 0,4-0,5 GB en cuantizaciones de 4 bits. Cifras estimadas a partir del número de parámetros; el autor no publica mediciones concretas.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM para FP16; el modelo está diseñado principalmente para CPU.
- GPU de consumo: cabe holgadamente en cualquier GPU de consumo moderna (RTX 3060, RTX 4060, RTX 4090) e incluso en iGPU y en CPU sola.
- Opciones de despliegue: transformers (librería declarada), llama.cpp, Ollama y LM Studio mediante los pesos GGUF del repositorio; también es compatible con endpoints según la etiqueta `endpoints_compatible`.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | MERA v2 (general) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| RusMind-Malysh-4.7 | 0,75B | No disponible | 0,087 | rusmind-license (propietaria) | Hugging Face (safetensors + GGUF) |
| SmolLM-3B | 3B | No disponible | 0,049 | No disponible en la información | No disponible en la información |
| GFusion-10B | 10,7B | No disponible | 0,075 | No disponible en la información | No disponible en la información |
| Qwen3.5-9B | 9B | No disponible | 0,118 (solo cultura y regiones) | No disponible en la información | No disponible en la información |

La comparación se limita a los datos de MERA v2 citados por el autor; no se dispone de resultados de benchmarks internacionales para establecer una comparación homogénea con alternativas de propósito general.

## Limitaciones y advertencias

- Tamaño muy reducido: con 0,75B de parámetros, la capacidad de razonamiento complejo, matemáticas avanzadas y generación de código es limitada en comparación con modelos de 7B o superiores.
- Riesgo elevado de alucinación en preguntas factuales fuera de su especialización (cultura e historia de Rusia), dado el escaso número de parámetros.
- Cobertura lingüística restringida a ruso e inglés; no se declara soporte de otros idiomas, incluido el español.
- Sesgos potenciales derivados de los datos de ajuste, orientados específicamente a la cultura rusa; no se documentan evaluaciones de sesgo en la información disponible.
- Licencia propietaria (rusmind-license): el uso comercial por organizaciones requiere solicitud expresa de licencia al autor; no es una licencia de código abierto.
- Longitud de contexto no especificada: conviene verificar el valor efectivo del modelo base antes de usarlo en conversaciones de muchos turnos o documentos largos.
- Los resultados de MERA v2 son los publicados por el propio autor; no se dispone de verificación independiente en la información proporcionada.
- No se declaran capacidades multimodales ni modo de razonamiento extendido en esta variante.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/DICPlay/RusMind-Malysh-4.7
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Benchmark MERA v2: https://mera.a-ai.ru/ru/text/leaderboard
- Demo y sitio del proyecto: https://rusmind.ru
- Modelo hermano RusMind-Sokol-4.7: https://huggingface.co/DICPlay/RusMind-Sokol-4.7
- Modelo hermano RusMind-Vspyshka-4.7: https://huggingface.co/DICPlay/RusMind-Vspyshka-4.7
- Contacto del autor (Telegram): https://t.me/DanKirillin
- Contacto del autor (MAX): https://max.ru/u/f9LHodD0cOIENg5eShucR-RyhC02ijx-XXjPGcPbjBRy6_KKvmdKIu9tdQU
