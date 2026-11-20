# AtomicChat/d1-3B-GGUF

## Resumen

d1-3B es un modelo de decisión desarrollado por Liquid AI: recibe un estado (texto o imagen) y responde preguntas tipadas en un único forward pass, devolviendo sí/no, una opción entre varias nombradas o una puntuación. La respuesta no se genera token a token, sino que se lee directamente de la distribución de probabilidad del modelo sobre los tokens que representan las opciones. Esto lo aleja del paradigma generativo habitual y lo acerca a un clasificador con lenguaje natural como interfaz.

La versión aquí descrita es la cuantización GGUF publicada por AtomicChat, construida a partir de los pesos oficiales de LiquidAI/d1-3B con una importance matrix propia y una estrategia de cuantización dinámica por tensor (Atomic Dynamic) que mantiene la tabla de tokens y las capas de atención en precisión alta. El modelo base tiene 2.697.198.592 parámetros (aproximadamente 2,7 mil millones) y pertenece a la familia LFM2.5 de Liquid AI, con pipeline image-text-to-text.

Su relevancia práctica está en el nicho de las decisiones rápidas y deterministas: enrutamiento, clasificación, filtrado y control de agentes, donde un modelo generativo completo resulta sobredimensionado y menos fiable. Al publicarse en GGUF con cuantizaciones desde Q8_0 hasta IQ4_XS, cabe en hardware de consumo y puede ejecutarse con llama.cpp en local.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (familia LFM2.5 de Liquid AI; transformer, detalles no publicados en la informacion disponible) |
| Parametros totales | 2.697.198.592 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | BF16, Q8_0, AD-Q6_K, AD-Q5_K_M, AD-Q4_K_M, AD-IQ4_XS (AD = Atomic Dynamic, tipo por tensor); mmproj en BF16 y Q8_0 |
| Idiomas soportados | no disponible como lista oficial; las evaluaciones cubren 30 idiomas y codigo fuente |
| Licencia | lfm1.0 (licencia "other" en la model card, con LICENSE incluido) |
| Formato de pesos | GGUF (llama.cpp); pesos originales en safetensors en LiquidAI/d1-3B |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna del modelo base. Se sabe que pertenece a la familia LFM2.5 de Liquid AI, que el pipeline es image-text-to-text (incluye un proyector multimodal, publicado como mmproj-d1-3B-BF16 y mmproj-d1-3B-Q8_0) y que el modelo utiliza su tabla de tokens como cabeza de salida, algo que la cuantización de AtomicChat preserva explícitamente al no bajar de Q6_K en ese tensor.

El entrenamiento del modelo base no está documentado en la información proporcionada: no se indican número de tokens, composición del dataset ni si hubo RLHF o DPO. La innovación técnica destacable no está en el entrenamiento sino en el modo de inferencia: en lugar de decodificar texto, el modelo evalúa la distribución sobre los tokens de las opciones y devuelve la decisión en un solo paso, lo que elimina la variabilidad de la generación y reduce la latencia. La cuantización de AtomicChat añade una innovación propia: selección de tipo por tensor (atención en Q8_0 o Q6_K, ffn_down de los cuatro primeros y últimos bloques un escalón por encima del resto) con una importance matrix propia.

## Capacidades

- Decisión binaria: responde preguntas de sí/no sobre un estado dado en un único forward pass.
- Selección entre opciones: elige una entre varias alternativas nombradas.
- Puntuación: devuelve un score leído de la distribución sobre tokens de puntuación.
- Entrada multimodal: acepta imagen y texto (pipeline image-text-to-text, con proyector mmproj separado).
- Multilingüe: las evaluaciones de la cuantización cubren 30 idiomas.
- Entrada de código fuente como estado, según el conjunto de evaluación usado por AtomicChat.
- Integración conversacional: etiquetado como decision-model y conversational.
- No se documenta soporte de tool calling, function calling ni razonamiento multi-paso en la información disponible.

## Casos de uso

- Enrutamiento de consultas en un chatbot: dado el mensaje del usuario, decidir entre opciones nombradas (por ejemplo, soporte técnico, facturación o ventas) en un solo paso, con latencia mínima y sin generación de texto intermedio.
- Moderación y filtrado de contenido: preguntas de sí/no sobre textos o imágenes para decidir si un contenido requiere revisión, aprovechando que la respuesta es determinista y no depende de la longitud de la generación.
- Control de agentes: usar el modelo como árbitro que decide si una acción propuesta por un agente cumple una condición, o qué herramienta corresponde a cada paso, en pipelines donde un LLM generativo sería demasiado lento o caro.
- Clasificación documental a escala: puntuar documentos o correos con un score continuo para priorización, ejecutando la cuantización AD-Q4_K_M (1.658 MB) en CPU o GPU modesta.
- Verificación de salidas en producción: comprobar con preguntas de sí/no si una respuesta generada por otro modelo satisface criterios definidos, como capa de control de calidad en un pipeline de CI.
- Análisis de imágenes con decisión tipada: con el proyector mmproj, responder preguntas de sí/no o de elección sobre imágenes, por ejemplo para triaje visual; AtomicChat advierte que no midió las decisiones sobre imágenes.
- Evaluación de código en integración continua: clasificar fragmentos de código fuente (el conjunto de evaluación incluye código) según criterios binarios o de elección, como parte de un pipeline de revisión automatizada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de tareas (MMLU, HumanEval, GSM8K, etc.) en la información disponible. La model card sí publica métricas de fidelidad de la cuantización frente a los pesos BF16 originales, medidas en un NVIDIA A10 con llama.cpp `88dcc46` sobre 1.285 decisiones (preguntas de sí/no, elección y puntuación sobre textos reservados en 30 idiomas y código fuente):

| Fichero | Tamano | Misma respuesta | Deriva de opciones | KLD | Top-1 |
|---|---:|---:|---:|---:|---:|
| BF16 | 5.403 MB | referencia | 0 | 0 | 100% |
| Q8_0 | 2.875 MB | 99,3% (9) | 0,0033 | 0,0010 | 98,28% |
| AD-Q6_K | 2.348 MB | 99,1% (11) | 0,0053 | 0,0022 | 97,41% |
| AD-Q5_K_M | 1.953 MB | 98,1% (25) | 0,0112 | 0,0080 | 95,09% |
| AD-Q4_K_M | 1.658 MB | 97,1% (37) | 0,0178 | 0,0244 | 91,54% |
| AD-IQ4_XS | 1.570 MB | 95,6% (57) | 0,0203 | 0,0283 | 90,92% |

Comparación con otras cuantizaciones del mismo modelo base, en una ejecución separada:

| Fichero | Tamano | Misma respuesta | Deriva de opciones | KL de opciones | KLD | Top-1 |
|---|---:|---:|---:|---:|---:|---:|
| AtomicChat Q8_0 | 2.875 MB | 99,2% (10) | 0,0034 | 0,0001 | 0,0009 | 98,30% |
| Liquid Q8_0 | 2.875 MB | 99,4% (8) | 0,0034 | 0,0001 | 0,0009 | 98,30% |
| AtomicChat AD-Q6_K | 2.348 MB | 99,3% (9) | 0,0054 | 0,0002 | 0,0022 | 97,41% |
| prithivMLmods Q6_K | 2.222 MB | 98,7% (17) | 0,0077 | 0,0004 | 0,0041 | 96,34% |
| AtomicChat AD-Q5_K_M | 1.953 MB | 97,7% (29) | 0,0112 | 0,0009 | 0,0081 | 95,11% |
| prithivMLmods Q5_K_M | 1.940 MB | 97,7% (29) | 0,0138 | 0,0014 | 0,0121 | 93,89% |
| AtomicChat AD-Q4_K_M | 1.658 MB | 97,0% (38) | 0,0174 | 0,0023 | 0,0243 | 91,55% |
| Liquid Q4_K_M | 1.674 MB | 95,7% (55) | 0,0270 | 0,0053 | 0,0392 | 89,42% |
| prithivMLmods Q4_K_M | 1.674 MB | 95,9% (53) | 0,0272 | 0,0053 | 0,0389 | 89,44% |

## Requisitos de hardware

- VRAM estimada para inferencia: entre aproximadamente 1,6 GB (AD-Q4_K_M) y 2,9 GB (Q8_0) para los pesos; hay que sumar el proyector mmproj si se usa entrada de imagen y el espacio de contexto en KV cache.
- GPU recomendadas: cualquier GPU con 4-6 GB de VRAM es suficiente para las cuantizaciones de 4 a 6 bits; las mediciones de AtomicChat se realizaron en una NVIDIA A10.
- Cabe en GPU de consumo: sí, en tarjetas con 6 GB o más (por ejemplo, RTX 3060, RTX 4060, RTX 4090); las cuantizaciones de 4 bits también permiten ejecución en CPU.
- Opciones de despliegue: llama.cpp (requiere un build con el PR #30110, commit `88dcc46` o posterior), Atomic Chat como aplicación local; no se documenta soporte de vLLM, TGI ni Ollama en la información disponible.
- Latencia y throughput: no disponibles de forma numérica; al resolver cada decisión en un único forward pass, la latencia es sustancialmente menor que la de un modelo generativo de tamaño comparable, pero no se publican cifras.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| AtomicChat/d1-3B-GGUF (este) | 2,70 B | no disponible | Decision tipada, GGUF con cuantizacion dinamica | lfm1.0 | Hugging Face, llama.cpp |
| LiquidAI/d1-3B-GGUF | 2,70 B (mismo base) | no disponible | Decision tipada, presets estandar de llama.cpp | lfm1.0 | Hugging Face |
| prithivMLmods/d1-3B-GGUF | 2,70 B (mismo base) | no disponible | Decision tipada, presets stock de llama.cpp | lfm1.0 | Hugging Face |
| LiquidAI/d1-3B | 2,70 B | no disponible | Pesos originales BF16 | lfm1.0 | Hugging Face |

Las tres cuantizaciones comparten modelo base y licencia; la diferencia medible está en la fidelidad frente a BF16, donde AtomicChat AD-Q4_K_M conserva más respuestas (38 cambios frente a 55 y 53 de las versiones stock) con un tamaño ligeramente menor. No se dispone de comparación con modelos de decisión de otros fabricantes en la información proporcionada.

## Limitaciones y advertencias

- El modelo está diseñado para decisiones tipadas, no para generación libre de texto; usarlo como LLM conversacional general no es su propósito.
- Riesgo de alucinación: menor que en modelos generativos al leer la respuesta de una distribución cerrada, pero las probabilidades pueden estar mal calibradas en dominios fuera de la distribución de entrenamiento.
- La cuantización introduce desviaciones medibles: incluso AD-Q4_K_M cambia el 2,9% de las respuestas frente a BF16 (37 de 1.285), lo que puede ser inaceptable en decisiones críticas.
- AtomicChat no midió las decisiones sobre imágenes; el rendimiento multimodal con los proyectores mmproj no está validado.
- La lista oficial de idiomas soportados no está publicada; solo se sabe que la evaluación cubre 30 idiomas.
- Licencia lfm1.0: es una licencia "other" con términos propios; es imprescindible revisar el archivo LICENSE antes de un uso comercial.
- La model card advierte de que las primeras GGUF de Liquid (6 de octubre) se construyeron sobre pesos anteriores, reemplazados el 7 de octubre; conviene verificar la fecha del fichero descargado.
- Requiere un build reciente de llama.cpp (PR #30110); versiones anteriores pueden no cargar el modelo correctamente.
- No se documentan salvaguardas, filtros de seguridad ni evaluaciones de sesgo en la información disponible.

## Enlaces

- [AtomicChat/d1-3B-GGUF en Hugging Face](https://huggingface.co/AtomicChat/d1-3B-GGUF)
- [Modelo base LiquidAI/d1-3B](https://huggingface.co/LiquidAI/d1-3B)
- [GGUF oficiales de Liquid AI](https://huggingface.co/LiquidAI/d1-3B-GGUF)
- [Cuantizaciones de prithivMLmods](https://huggingface.co/prithivMLmods/d1-3B-GGUF)
- [Repositorio de metricas de AtomicChat](https://huggingface.co/datasets/AtomicChat/d1-3B-GGUF-metrics)
- [Atomic Chat](https://atomic.chat/)
- [Repositorio Atomic-Chat en GitHub](https://github.com/AtomicBot-ai/Atomic-Chat)
- [Discord de AtomicChat](https://discord.gg/8wGSsvmg4V)
- [Cuenta de X de AtomicChat](https://x.com/atomic_chat_hq)
