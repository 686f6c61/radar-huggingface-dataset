# jun-ai/Rusa

## Resumen

Rusa-1 es un modelo de lenguaje de 350 millones de parámetros (354.483.968 según los pesos en safetensors) desarrollado por jun-ai, especializado en reescribir texto generado por IA para que suene a escritura humana, preservando íntegramente hechos, cifras, nombres y citas del original. Se construye sobre LiquidAI/LFM2-350M, un transformer de la familia LFM2 de Liquid AI, y se distribuye con licencia LFM Open License v1.0.

El modelo resuelve un problema muy concreto: el llamado "humanizer" o reescritura con preservación factual. A diferencia de los parafraseadores genéricos, Rusa-1 se entrena específicamente para eliminar marcadores típicos de texto sintético (hedging, frases de relleno, estructuras formulaicas) sin alterar la información verificable. Su tamaño reducido permite ejecutarlo en CPU, en un teléfono o íntegramente en el navegador mediante Transformers.js y WebGPU.

Es relevante ahora porque demuestra que tareas de estilo y reescritura con restricciones fuertes de fidelidad pueden abordarse con modelos de menos de 400M de parámetros, mediante destilación desde un profesor de 12B y un ajuste de preferencias con un verificador de hechos en el bucle. El modelo solo soporta inglés y su uso está sujeto a la licencia heredada de LFM2-350M.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (LFM2, base LiquidAI/LFM2-350M) |
| Parámetros totales | 354.483.968 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la información proporcionada; entradas de más de ~450 palabras quedan fuera del rango de entrenamiento |
| Tipos de cuantización | BF16 (safetensors), GGUF F16/Q8_0/Q6_K/Q5_K_M/Q4_K_M, ONNX fp32/fp16/q8/q4/q4f16 |
| Idiomas soportados | inglés (en) |
| Licencia | LFM Open License v1.0 (lfm1.0) |
| Formato de pesos | safetensors, GGUF, ONNX |

## Arquitectura y entrenamiento

Rusa-1 parte de LiquidAI/LFM2-350M, un transformer de la familia LFM2 de Liquid AI. Sobre esa base, el autor aplica un proceso de destilación desde un modelo profesor de 12B especializado en reescritura, seguido de un ajuste de preferencias sobre muestras generadas por el propio modelo. En ese ajuste intervienen dos componentes: un profesor de 12B que clasifica y ordena las muestras, y un verificador de hechos que filtra las reescrituras que no preservan números, fechas, nombres ni citas.

El modelo no emplea una plantilla de chat convencional: usa un prompt en texto plano con una instrucción fija y el marcador `### Rewritten:` tras el borrador, y termina la generación con el token `<|im_end|>`. La decodificación recomendada es `temperature=1.0`, `top_p=0.95`, `top_k=0` y sin penalización por repetición; el autor señala que muestrear varias reescrituras y quedarse con la mejor mejora la fidelidad factual (con 8 muestras, al menos una conserva todos los hechos en el 89% de los borradores de prueba).

## Capacidades

- Reescritura de texto para eliminar marcadores de estilo generado por IA (hedging, frases de relleno, estructuras formulaicas).
- Preservación de hechos, números, unidades, fechas, nombres y citas del texto original.
- Variación deliberada de longitud y estructura de frase para producir un estilo menos uniforme.
- Generación de texto en inglés; no soporta otros idiomas.
- Ejecución en CPU, en dispositivos móviles y en navegador (ONNX + Transformers.js v4 con WebGPU o WASM).
- Muestreo múltiple para selección de la mejor reescritura (best-of-N).
- No se documenta soporte de tool calling, function calling, agentes ni razonamiento multi-paso en la información disponible.
- No se documentan capacidades de visión, audio ni modo de razonamiento explícito.

## Casos de uso

- Humanización de borradores en pipelines editoriales: el modelo reescribe textos generados por LLM antes de su publicación, reduciendo la puntuación de detectores de IA (media de 0,236 frente a 0,190 del profesor de 12B) manteniendo la información verificable.
- Reescritura de correos y comunicaciones corporativas: se le pasa un borrador y devuelve una versión con tono más natural, útil para equipos que redactan con asistencia de IA y necesitan un registro menos artificial.
- Procesamiento por lotes de reseñas y publicaciones de foro: el modelo se entrenó con ensayos, correos, reseñas, posts de foro y tutoriales, por lo que encaja en la normalización estilística de contenido generado a escala.
- Ejecución en el navegador para herramientas de escritura: con el ONNX q4f16 (248 MB) y Transformers.js v4 sobre WebGPU, puede integrarse en editores web sin enviar el texto a un servidor, lo que ayuda con requisitos de privacidad.
- Despliegue en local con llama.cpp u Ollama: el GGUF Q8_0 (379,21 MB) es la opción recomendada por el autor y permite reescribir en máquinas sin GPU, útil para flujos de trabajo offline.
- Filtrado previo en sistemas de detección de contenido: puede usarse como paso de normalización antes de clasificadores de autoría o de calidad editorial, dado que su salida reduce la probabilidad de ser marcada como IA.
- Prototipado rápido en entornos con recursos limitados: al ocupar menos de 1 GB en BF16, es viable en instancias pequeñas, contenedores y dispositivos de borde para experimentar con reescritura controlada.

## Benchmarks y rendimiento

El autor publica una evaluación sobre 209 borradores escritos por IA, fuera del conjunto de entrenamiento, con una única reescritura muestreada por borrador. La probabilidad de IA se mide con el clasificador desklib/ai-text-detector-v1.01 (menor es mejor) y una reescritura se marca como IA si supera 0,5. La fidelidad factual se considera correcta si sobreviven todos los números, fechas, nombres y citas.

| Modelo | Tamaño | Puntuación media de IA ↓ | Marcadas como IA ↓ | Conserva todos los hechos ↑ | Conserva todos los hechos, mejor de 8 ↑ |
|---|---|---|---|---|---|
| Profesor de 12B | 12B | 0,190 | 30 / 209 | 67 / 209 | 146 / 209 |
| Rusa | 350M | 0,236 | 46 / 209 | 83 / 209 | 185 / 209 |

Rusa es 35 veces más pequeño que su profesor y conserva los hechos con más fiabilidad, aunque su puntuación de detector es ligeramente superior (peor) que la del profesor. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16: en torno a 0,7 GB de pesos más overhead de activaciones y contexto; cabe holgadamente en cualquier GPU consumer.
- GGUF Q8_0: 379,21 MB; Q4_K_M: 229,31 MB; F16: 711,48 MB. El autor recomienda Q8_0 porque a 350M la cuantización de 4 bits degrada la calidad de forma más notable que en modelos grandes.
- ONNX: q4f16 248 MB, q4 289 MB, q8 496 MB, fp16 692 MB, fp32 1,35 GB.
- GPU recomendadas: cualquier GPU consumer moderna (RTX 4090, RTX 3090, RTX 4060, etc.) es sobrada; también funciona en CPU y en dispositivos móviles.
- Cabe en GPU consumer y en hardware de gama baja; el caso de uso declarado incluye CPU, teléfono y navegador.
- Opciones de despliegue: Transformers, vLLM (según la model card), llama.cpp, LM Studio, Ollama, ONNX Runtime y Transformers.js v4 (WebGPU o WASM).
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Rusa-1 | 354M | no disponible | Reescritura con preservación factual | LFM Open License v1.0 | Hugging Face (safetensors, GGUF, ONNX) |
| LiquidAI/LFM2-350M | 350M | no disponible | Modelo base generalista | LFM Open License v1.0 | Hugging Face |
| Profesor de 12B (sin nombre público) | 12B | no disponible | Reescritura | no disponible | no disponible |
| desklib/ai-text-detector-v1.01 | no disponible | no disponible | Detección de texto IA (referencia de evaluación) | no disponible | Hugging Face |

No se dispone de datos de benchmarks comparativos con otros humanizadores de la misma categoría en la información proporcionada.

## Limitaciones y advertencias

- Solo inglés; no soporta castellano ni otros idiomas.
- La preservación factual es buena pero no perfecta: el autor recomienda verificar números, nombres y citas antes de publicar una reescritura.
- Las entradas de más de ~450 palabras quedan fuera del rango de entrenamiento; hay que dividir documentos largos en párrafos.
- La licencia LFM Open License v1.0 impone restricciones que deben revisarse antes de uso comercial; no es una licencia permisiva tipo Apache o MIT.
- El autor prohíbe explícitamente usar el modelo para atribuirse autoría de forma fraudulenta donde esté vetado, como en trabajos académicos.
- Riesgo de alucinación en la reescritura: aunque el filtro de hechos del entrenamiento reduce el problema, no lo elimina; conviene validar la salida en flujos de producción.
- El detector de IA usado en la evaluación es un clasificador concreto; los resultados pueden no extrapolarse a otros detectores.
- No se documentan sesgos específicos en la información disponible.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/jun-ai/Rusa
- Modelo base: https://huggingface.co/LiquidAI/LFM2-350M
- Variante ternaria experimental: https://huggingface.co/jun-ai/Rusa-1-Small
- Clasificador usado en la evaluación: https://huggingface.co/desklib/ai-text-detector-v1.01
- Licencia LFM Open License v1.0: https://huggingface.co/jun-ai/Rusa/blob/main/LICENSE
