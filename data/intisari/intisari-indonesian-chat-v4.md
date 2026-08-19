# INTISARI/intisari-indonesian-chat-v4

## Resumen

INTISARI-CHAT-V4 es un modelo de lenguaje pequeño (58,5 millones de parámetros) desarrollado por INTISARI, especializado en conversación casual en indonesio. Está diseñado para mantener diálogos naturales y fluidos en ese idioma, priorizando la naturalidad sobre el conocimiento factual. El modelo se entrenó con 50.047 muestras de conversación utilizando la herramienta Flatbuild, con una ventana de contexto de 512 tokens.

Su relevancia radica en ofrecer una alternativa ligera y de código abierto (licencia Apache 2.0) para aplicaciones de chat en indonesio, con requisitos de hardware mínimos. Aunque sus capacidades son limitadas por su tamaño, puede integrarse en sistemas de atención al cliente, asistentes conversacionales o prototipos donde se necesite una respuesta rápida y natural en indonesio sin depender de modelos grandes.

El modelo usa una arquitectura transformer estándar con normalización RMSNorm y activación SwiGLU, y está disponible en formato GGUF, lo que facilita su despliegue en entornos de inferencia locales o en la nube mediante herramientas compatibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (decoder-only) con 20 capas, 8 cabezas de atención, 2 cabezas KV, dimensión oculta 512, FFN 1408, SwiGLU, RMSNorm |
| Parametros totales | 58.580.352 (58,5M) |
| Parametros activos | no aplicable (no es MoE) |
| Longitud de contexto | 512 tokens |
| Tipos de cuantizacion | no disponible (el repositorio contiene GGUF, pero no se especifican variantes) |
| Idiomas soportados | indonesio (id) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (según tags del repositorio) |

## Arquitectura y entrenamiento

El modelo sigue una arquitectura transformer decoder-only clásica con 20 capas, 8 cabezas de atención y 2 cabezas KV (grouped-query attention). La dimensión oculta es de 512 unidades y la FFN de 1408, con activación SwiGLU y normalización RMSNorm. El vocabulario tiene 8196 tokens y la longitud de contexto es de 512 tokens, con rope_theta de 10000.

Se entrenó con el framework Flatbuild (disponible en GitHub) sobre un dataset propio de 50.047 muestras de conversación casual en indonesio, cubriendo temas como saludos, small talk, preguntas-respuestas, seguimiento, reconocimiento, empatía, humor, peticiones, gestión de temas y cierre de conversación. El entrenamiento duró 3 épocas, alcanzando una pérdida de validación de 1,236, una perplejidad de 3,44 y una precisión de validación del 71,0%. No se menciona el uso de RLHF, DPO u otras técnicas de alineación posteriores.

## Capacidades

- Generación de texto conversacional en indonesio casual y natural, con énfasis en fluidez y adecuación pragmática.
- Soporte de diálogos multi-turno (hasta 5+ turnos, aunque la mayoría de las muestras son de 2 turnos).
- Manejo de expresiones coloquiales y registro informal (p. ej., "Gue capek banget", "Nggak tau nih").
- Capacidad limitada para responder preguntas factuales; el modelo está orientado a conversación, no a conocimiento.
- No se indica soporte para tool calling, function calling, razonamiento multi-paso, visión ni audio.
- No se especifican capacidades multilingües más allá del indonesio.

## Casos de uso

- Atención al cliente automatizada en indonesio: el modelo puede gestionar conversaciones de saludo y preguntas frecuentes sencillas con un tono natural, aunque su contexto de 512 tokens limita el seguimiento de hilos largos.
- Asistentes conversacionales en aplicaciones móviles o web para usuarios de habla indonesia, ofreciendo respuestas rápidas y amigables en registro coloquial.
- Prototipos de chatbots para redes sociales (WhatsApp, Telegram) donde se requiera bajo coste computacional y despliegue en CPU.
- Generación de respuestas empáticas y de apoyo emocional en entornos de salud mental o bienestar, gracias a su entrenamiento en temas de empatía.
- Prácticas de conversación para estudiantes de indonesio, generando diálogos naturales y variados.
- Sistemas de entretenimiento o juegos de rol textual en indonesio, donde la naturalidad conversacional es más importante que la precisión factual.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks externos (MMLU, HumanEval, GSM8K, etc.) en la información disponible. La model card reporta métricas internas de validación:

| Metrica | Valor |
|---|---|
| Pérdida de validación | 1,236 |
| Perplejidad de validación | 3,44 |
| Precisión de validación | 71,0% |
| Distinct-2 | 73,8% |
| Distinct-3 | 89,0% |
| Tasa de degeneración | 3,0% |
| Deriva de tema | 15,0% |

Estas métricas indican una baja repetición y una diversidad aceptable en la generación, pero no son comparables con benchmarks estándar de razonamiento o conocimiento.

## Requisitos de hardware

- VRAM estimada para inferencia: al ser un modelo de 58,5M parámetros, puede ejecutarse en CPU con menos de 1 GB de RAM. En GPU, cabría incluso en tarjetas integradas o GPUs de entrada.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM (p. ej., NVIDIA GTX 1050, RTX 3050, o incluso Raspberry Pi con suficiente RAM).
- Cabe en GPUs de consumo y en dispositivos edge, siempre que se use cuantización GGUF (no se especifican variantes concretas).
- Opciones de despliegue: compatible con llama.cpp, Ollama, vLLM (si se convierte a safetensors) y otros runners que soporten GGUF.
- Latencia y throughput: no se han publicado mediciones; en CPU moderna se esperan respuestas en decenas de milisegundos por token.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables específicos en la documentación proporcionada. Dado su tamaño y enfoque en indonesio, podría compararse con otros modelos pequeños de chat en ese idioma, pero no hay datos disponibles para establecer una comparación objetiva. Se indica "no disponible".

## Limitaciones y advertencias

- Modelo muy pequeño (58,5M parámetros), con capacidad limitada para razonamiento complejo o conocimiento factual.
- No tiene acceso a conocimiento del mundo; puede generar respuestas incorrectas o alucinadas sobre hechos.
- Ventana de contexto de solo 512 tokens, lo que impide manejar conversaciones largas o documentos extensos.
- Entrenado exclusivamente en indonesio casual; puede fallar en registros formales o en otros idiomas.
- La generación es corta y puede carecer de profundidad en temas complejos.
- No se han publicado evaluaciones de sesgos ni análisis de seguridad; se recomienda supervisión humana en aplicaciones de producción.
- Licencia Apache 2.0 permite uso comercial, pero el modelo no ofrece garantías de precisión ni seguridad.

## Enlaces

- HuggingFace: https://huggingface.co/INTISARI/intisari-indonesian-chat-v4
- Demo: https://intisari.flatseek.io
- Repositorio de entrenamiento (Flatbuild): https://github.com/flatseek/flatbuild
