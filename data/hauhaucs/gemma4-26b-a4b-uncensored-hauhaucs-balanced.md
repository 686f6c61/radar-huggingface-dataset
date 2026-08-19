# HauhauCS/Gemma4-26B-A4B-Uncensored-HauhauCS-Balanced

## Resumen

Gemma4-26B-A4B-Uncensored-HauhauCS-Balanced es una versión sin censura del modelo Gemma 4 de Google, desarrollada por HauhauCS. Se basa en google/gemma-4-26B-A4B-it, un modelo MoE multimodal de 25,2 mil millones de parámetros totales con solo 3,8 mil millones activos por paso de inferencia. El objetivo declarado es eliminar los rechazos (refusals) del modelo original manteniendo intactas sus capacidades, sin modificar datasets ni funcionalidad. Es relevante para aplicaciones de escritura creativa, roleplay e inteligencia emocional, donde los modelos censurados suelen limitar la expresión. La variante Balanced, objeto de esta ficha, razona a través de peticiones delicadas y entrega respuestas completas, con un muestreo más estable en sesiones de contexto largo.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE (Mixture of Experts) con 128 expertos enrutados, top-8 + 1 experto compartido; atencion hibrida sliding-window (1024 tokens) + full global; 30 capas; Proportional RoPE (p-RoPE) |
| Parametros totales | 25.233.142.046 (25,2B) |
| Parametros activos | 3,8B |
| Longitud de contexto | 256K tokens nativos |
| Tipos de cuantizacion | Q8_K_P, Q6_K_P, Q5_K_P, Q5_K_M, Q4_K_P, Q4_K_M, IQ4_XS, Q3_K_P, Q3_K_M, IQ3_M, Q2_K_P, IQ2_M (todos GGUF) |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

El modelo es una variante "uncensored" del Gemma 4 de Google, con la misma arquitectura MoE: 128 expertos enrutados con seleccion top-8 mas un experto compartido, lo que resulta en 3,8B parametros activos de un total de 25,2B. La atencion es hibrida: cinco capas con sliding-window de 1024 tokens seguidas de una capa con atencion global completa, repitiendose este patron a lo largo de las 30 capas. Usa Proportional RoPE (p-RoPE) y soporta contexto nativo de 256K tokens. Es multimodal, con un proyector de vision (mmproj) que permite presupuestos variables de tokens visuales (70, 140, 280, 560 o 1120 por imagen). No se han publicado detalles sobre el proceso de entrenamiento especifico para eliminar los rechazos; el autor indica que no hubo cambios en datasets ni capacidades, solo en el comportamiento de rechazo.

## Capacidades

- Generacion de texto y razonamiento: mantiene las capacidades completas del modelo base, incluyendo razonamiento complejo y comprension de contexto largo.
- Multimodal: procesa imagenes ademas de texto, con multiples presupuestos de tokens visuales.
- Escritura creativa y roleplay: optimizado para tareas de narrativa, personajes y dialogos sin restricciones de contenido.
- Inteligencia emocional: capaz de manejar conversaciones con matices emocionales y contextos delicados.
- Tool calling y uso de agentes: soporta llamadas a herramientas y cadenas de multiples pasos, aunque el autor senala que para tareas de coding agente Qwen3.6 es superior.
- Generacion de codigo: mantiene las capacidades de codigo del modelo base, aunque no es su caso de uso principal.

## Casos de uso

- Escritura creativa sin restricciones: el modelo puede generar narrativas, dialogos y escenas con contenido adulto o sensible sin rechazos, ideal para autores que necesitan explorar temas tabu.
- Roleplay conversacional: en entornos de chat o juegos de rol, el modelo mantiene coherencia en sesiones largas gracias a su contexto de 256K tokens y su estabilidad de muestreo.
- Asistente emocional: puede manejar conversaciones sobre temas delicados (salud mental, relaciones, etc.) con empatia y sin juicios, aunque no sustituye a un profesional.
- Analisis de documentos con imagenes: al ser multimodal, puede procesar capturas de pantalla, diagramas o documentos escaneados junto con texto.
- Generacion de codigo en entornos sin censura: aunque no es su fuerte, puede generar codigo para tareas de seguridad ofensiva o investigacion sin rechazos.
- Automatizacion de agentes con tool calling: puede encadenar llamadas a herramientas en tareas de investigacion o analisis, aprovechando su bajo coste de inferencia (3,8B activos).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: segun el quant elegido, desde 10 GB (IQ2_M) hasta 27 GB (Q8_K_P). El quant recomendado para la mayoria de usos es Q4_K_P (17 GB), que cabe en GPUs de 24 GB con margen para contexto.
- GPUs recomendadas: RTX 3090/4090 (24 GB) para quants hasta Q5_K_M; A100/H100 (40-80 GB) para Q8_K_P o contextos muy largos.
- Consumer GPU: si, cabe en GPUs de 16-24 GB con quants Q4 o inferiores.
- Opciones de despliegue: compatible con llama.cpp, LM Studio y cualquier runtime GGUF. Se recomienda usar `--jinja` para el chat template correcto.
- Latencia y throughput: al tener solo 3,8B parametros activos, la velocidad de generacion es comparable a un modelo de ~4B, lo que permite cadenas largas de tool calls con baja latencia.

## Comparativa con modelos similares

| Modelo | Parametros totales | Activos | Contexto | Licencia | Notas |
|---|---|---|---|---|---|
| google/gemma-4-26B-A4B-it (base) | 25,2B | 3,8B | 256K | Apache 2.0 | Modelo original con censura |
| HauhauCS/Gemma4-26B-A4B-Uncensored-HauhauCS-Balanced | 25,2B | 3,8B | 256K | Apache 2.0 | Version sin censura, misma arquitectura |
| Qwen3.6 (mencionado por el autor) | no disponible | no disponible | no disponible | no disponible | El autor indica que es superior en agentic coding/tool use |

## Limitaciones y advertencias

- Contenido sin censura: el modelo puede generar contenido explicito, ofensivo o peligroso. Su uso debe ser responsable y cumplir con las leyes locales.
- Alucinaciones: como cualquier LLM, puede inventar informacion, especialmente en temas tecnicos o factuales.
- Idioma: solo se garantiza ingles; otros idiomas pueden tener un rendimiento inferior.
- Edge cases: algunos prompts delicados pueden ser rechazados en el primer intento, pero suelen resolverse al reintentar.
- No apto para produccion sin supervision: la falta de censura puede generar respuestas inapropiadas en entornos corporativos o publicos.
- Licencia Apache 2.0: permite uso comercial, pero el contenido generado es responsabilidad del usuario.

## Enlaces

- HuggingFace: https://huggingface.co/HauhauCS/Gemma4-26B-A4B-Uncensored-HauhauCS-Balanced
- Modelo base: https://huggingface.co/google/gemma-4-26B-A4B-it
- Discord del autor: https://discord.gg/SZ5vacTXYf
