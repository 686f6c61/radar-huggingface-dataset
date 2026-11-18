# DICPlay/RusMind-4.7-Momentum

## Resumen

RusMind 4.7 · Моментум (Momentum) es un modelo de lenguaje de tipo Mixture of Experts (MoE) desarrollado por DICPlay, presentado como la variante más ligera de la familia RusMind de nueva generación 4.7. Está afinado a partir de `google/gemma-4-E2B-it` y orientado a ejecución local en dispositivo (on-device) sin conexión a internet, incluyendo portátiles, PC convencionales y teléfonos. El modelo declara 4.647.450.147 parámetros totales, de los cuales aproximadamente 2.000 millones se activan por token, lo que explica su idoneidad para inferencia en hardware modesto.

El modelo se distribuye en formato GGUF para llama.cpp, LM Studio y Ollama, con soporte declarado de ruso e inglés. Su propuesta de valor es competir en el benchmark ruso MERA v2 frente a modelos de mayor tamaño: el autor reporta un 0,136 de puntuación global, por encima de T-lite de T-Bank, LFM2.5 de Liquid AI, Gemma 4 E2B de Google y Qwen3.5-4B de Alibaba en la categoría de menos de 5.000 millones de parámetros.

La relevancia actual reside en la combinación de licencia propia (rusmind-license), distribución exclusivamente en GGUF y un enfoque explícito a mercados rusohablantes con despliegue offline. El repositorio ocupa 20,2 GB y acumula 8.749 descargas en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture of Experts (MoE) sobre base Gemma 4; detalles de capas y atención no disponibles |
| Parametros totales | 4.647.450.147 |
| Parametros activos | Aproximadamente 2.000 millones por token (según model card) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | GGUF (variantes concretas no especificadas en la información disponible) |
| Idiomas soportados | Ruso (ru), inglés (en) |
| Licencia | rusmind-license (license: other) |
| Formato de pesos | GGUF (librería llama.cpp); pesos safetensors no distribuidos en este repo |
| Modelo base | google/gemma-4-E2B-it (finetune) |
| Tamaño del repositorio | 20,2 GB |
| Pipeline | text-generation |

## Arquitectura y entrenamiento

El modelo emplea una arquitectura Mixture of Experts derivada de `google/gemma-4-E2B-it`, con 4.647 millones de parámetros totales y aproximadamente 2.000 millones activos por token. Esta configuración permite que el coste computacional por token se acerque al de un modelo denso de 2B mientras la capacidad representacional se acerca a la de un modelo de 4,6B. No se dispone de información sobre el número de expertos, el tamaño de los mismos, la estrategia de enrutamiento ni el número de capas en la información proporcionada.

Respecto al entrenamiento, la model card indica que se trata de un finetune del modelo base de Google, con mejoras declaradas en razonamiento, seguimiento de instrucciones complejas, conocimiento cultural e histórico de Rusia, corrección ortográfica y puntuación en ruso, y comprensión de matices humanos (personajes, humor, antónimos). No se especifican el volumen de tokens de entrenamiento, la composición del dataset, ni si se emplearon técnicas de RLHF, DPO o similares. Tampoco se documentan innovaciones técnicas como decodificación especulativa o atención lineal.

## Capacidades

- Generación de texto conversacional en ruso e inglés, con especial énfasis en calidad del ruso.
- Razonamiento multi-paso y resolución de problemas lógicos; el autor lo posiciona como el mejor de la línea Momentum en tareas de razonamiento.
- Seguimiento de instrucciones complejas con múltiples requisitos simultáneos.
- Llamada a herramientas (tool calling / function calling), según declara la model card.
- Conocimiento profundo de cultura, regiones, historia, fechas y personalidades de Rusia.
- Corrección ortográfica y de puntuación en ruso (0,719 reportado en la subtarea correspondiente de MERA v2).
- Comprensión de matices humanos: carácter de personajes, humor y palabras con significados opuestos.
- Generación de código y razonamiento estable, según evaluación de un canal independiente citado por el autor.
- Comprensión del japonés con matices de cortesía, según la misma fuente externa (no listado como idioma oficial del modelo).
- Ejecución en dispositivo (on-device) y offline mediante llama.cpp, LM Studio y Ollama.
- Compatibilidad con endpoints (tag `endpoints_compatible`).

## Casos de uso

- Asistentes conversacionales offline en ruso: el modelo puede desplegarse en portátiles y teléfonos mediante GGUF y llama.cpp, gestionando diálogos multi-turno sin conexión y con una huella de parámetros activos de ~2B que reduce los requisitos de memoria frente a modelos densos de tamaño similar.
- Corrección y edición de textos en ruso: dado su rendimiento declarado en ortografía y puntuación (0,719 en MERA v2), es adecuado para pipelines de revisión automática de documentos, artículos o publicaciones antes de su publicación.
- Atención al cliente en mercados rusohablantes: con soporte de tool calling, puede integrarse en flujos que consulten APIs internas (estado de pedidos, bases de conocimiento) manteniendo la conversación en ruso de forma gramaticalmente correcta.
- Aplicaciones educativas sobre historia y cultura de Rusia: su conocimiento declarado de eventos, fechas y personalidades lo hace útil para tutores o sistemas de preguntas y respuestas orientados a ese dominio.
- Procesamiento de lenguaje natural en el borde (edge computing): al ejecutarse en teléfonos y navegador, permite clasificación, resumen o generación de texto en aplicaciones móviles sin enviar datos a la nube, relevante por privacidad.
- Generación de código asistida en entornos con restricciones de conectividad: integrable en editores o scripts locales que requieran autocompletado o explicación de fragmentos sin depender de servicios externos.
- Moderación y análisis de contenido con matices: su capacidad declarada para interpretar humor, personajes y antónimos puede emplearse en sistemas de detección de sarcasmo o ambigüedad en ruso.

## Benchmarks y rendimiento

Los datos disponibles provienen del benchmark MERA v2 (Multimodal Evaluation for Russian-language Architectures), gestionado por la Alianza en el ámbito de la IA (Sber, Yandex, MTS, VK, Gazprom Neft y RFPI). El autor reporta para Momentum 4.7 una puntuación global de 0,136.

| Modelo | Parámetros (activos) | MERA v2 (global) |
|---|---|---|
| RusMind 4.7 · Momentum | 4,6B (~2B activos) | 0,136 |
| T-lite · T-Bank | 8B | No disponible en el extracto (inferior según autor) |
| LFM2.5 · Liquid AI | No disponible | No disponible en el extracto (inferior según autor) |
| Gemma 4 E2B · Google | ~2B | No disponible en el extracto (inferior según autor) |
| Qwen3.5-4B · Alibaba | 4B | No disponible en el extracto (inferior según autor) |

El autor declara que Momentum es el número 1 global entre modelos de menos de 5.000 millones de parámetros en MERA v2, primero en cultura y regiones de Rusia en esa franja, primero en tareas centrocéntricas en humanidad y superior a T-lite, RuadaptQwen3-8B, A-Vibe y Zero-Mistral-Small en razonamiento. Asimismo, indica una mejora del +5 % respecto a Momentum 4.6.5 y del +37 % respecto al modelo abierto original del mismo tamaño. No se han publicado en la información disponible resultados desglosados por subtarea (MMLU, HumanEval, GSM8K u otros) ni cifras absolutas de los modelos comparados.

## Requisitos de hardware

- VRAM estimada: no disponible de forma oficial. Como referencia orientativa, un modelo MoE de 4,6B en GGUF Q4 ocupa aproximadamente 2,5-3 GB en disco y requiere un espacio similar en memoria; las variantes de mayor precisión pueden acercarse a 6-9 GB.
- GPU recomendadas: no especificadas por el autor. Por tamaño, el modelo está pensado para ejecutarse en CPU y en GPU de consumo; tarjetas como RTX 3060 (12 GB), RTX 4060 (8 GB) o superiores deberían acomodarlo en cuantizaciones intermedias.
- Cabe en GPU de consumo: sí, previsiblemente en la mayoría de tarjetas con 6 GB o más en cuantización Q4; también en teléfonos y navegador según declara el autor.
- Opciones de despliegue: llama.cpp, LM Studio, Ollama (mencionados explícitamente en la model card); vLLM y TGI no se citan y su compatibilidad con este GGUF no está confirmada.
- Latencia y throughput: no disponibles. El autor afirma que "vuela" en navegador y teléfono, pero no aporta cifras de tokens por segundo.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | MERA v2 | Licencia | Formato |
|---|---|---|---|---|---|
| RusMind 4.7 · Momentum | 4,6B (~2B activos) | No disponible | 0,136 | rusmind-license | GGUF |
| Gemma 4 E2B · Google | ~2B | No disponible | No disponible (inferior según autor) | Términos de Google (modelo base) | Safetensors, GGUF |
| Qwen3.5-4B · Alibaba | 4B | No disponible | No disponible (inferior según autor) | No disponible | No disponible |
| LFM2.5 · Liquid AI | No disponible | No disponible | No disponible (inferior según autor) | No disponible | No disponible |
| T-lite · T-Bank | 8B | No disponible | No disponible (inferior según autor) | No disponible | No disponible |

La comparación se limita a las afirmaciones del autor; no se dispone de cifras independientes verificables para los modelos alternativos en la información proporcionada.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados por el autor. Al estar especializado en ruso y en contenido cultural e histórico de Rusia, puede presentar sesgos de representación hacia esa región.
- Riesgo de alucinación: inherente a los modelos de lenguaje; no se han publicado evaluaciones específicas de fidelidad factual.
- Limitaciones de contexto: la longitud de contexto no está especificada, lo que impide garantizar conversaciones o documentos largos.
- Idiomas: cobertura oficial limitada a ruso e inglés; el japonés se menciona como capacidad observada por un tercero, no como idioma soportado oficialmente.
- Licencia: `rusmind-license` es una licencia propia (license: other). No se detallan en la información disponible las restricciones para uso comercial, redistribución o modificación; es imprescindible revisar el archivo LICENSE del repositorio antes de usarlo en producción.
- Distribución: solo se ofrece GGUF; no hay pesos safetensors en este repositorio, lo que limita el reentrenamiento o la integración con frameworks que no acepten GGUF.
- Verificación de benchmarks: las cifras de MERA v2 provienen de la model card del autor; no se aportan desgloses ni enlaces directos a resultados individuales verificables en el extracto.
- Producción: al ser un finetune de un modelo base de Google, pueden aplicar condiciones adicionales derivadas del modelo original; conviene revisar la licencia de `google/gemma-4-E2B-it`.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/DICPlay/RusMind-4.7-Momentum
- Modelo base: https://huggingface.co/google/gemma-4-E2B-it
- Demo / plataforma del autor: https://rusmind.ru
- Benchmark MERA v2: https://mera.a-ai.ru/ru/text/leaderboard
- Modelo relacionado (RusMind 4.7 · Sokol): https://huggingface.co/DICPlay/RusMind-Sokol-4.7
- Modelo relacionado (RusMind 4.7 · Vspyshka): https://huggingface.co/DICPlay/RusMind-Vspyshka-4.7
- Licencia: archivo LICENSE dentro del repositorio de Hugging Face
