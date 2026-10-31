# isomsom/sn92-gen-m87b

## Resumen

REAX SN92 generalist entry (isomsom/sn92-gen-m87b) es un modelo de decisión (decision model) derivado del ecosistema Qwen3.5, publicado en HuggingFace por el usuario isomsom. Se trata de un fine-tune de baselabs/mammoth-1 (que a su vez es un fine-tune completo de Qwen/Qwen3.5-27B, Apache-2.0) reescrito para una tarea muy concreta: seleccionar la respuesta correcta entre opciones múltiples mediante una lectura conjunta de letras (joint letter readout) con softmax a temperatura 2 sobre las filas del cabezal de lectura, en el contexto del track generalista de la competición REAX (SN92).

A diferencia de un modelo generativo convencional, este modelo no produce texto libre: su salida es una distribución de probabilidad sobre las letras de respuesta A..Z. Para lograrlo, el autor eliminó el LM head original (no atado), construyó un cabezal de lectura con filas correspondientes a los códigos de respuesta, y entrenó un LoRA r32 nuevo en modo conjunto (atención bidireccional completa sobre el prompt), integrando después los pesos en el backbone. Con 26.085.330.160 parámetros reales en safetensors y una licencia MIT, es un artefacto de nicho orientado a evaluación automatizada de decisiones, no a chat ni a generación de código.

Su relevancia es principalmente metodológica: ilustra cómo adaptar un LLM generativo a tareas de clasificación de opciones con datos procedurales con solucionadores exactos (ajedrez, Connect 4, lógica, aritmética, reglas de negocio) y registros de fuentes públicas, un enfoque útil para谁 necesite respuestas deterministas y verificables en pipelines de evaluación.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Qwen3_5Model (transformer basado en Qwen3.5-27B) con cabezal de lectura de letras (decision_config v2) |
| Parametros totales | 26.085.330.160 (dato real de safetensors) |
| Parametros activos | no disponible (no se declara arquitectura MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados sin cuantizar; 52,2 GB de repositorio) |
| Idiomas soportados | no disponibles (los datos de entrenamiento son mayoritariamente en inglés) |
| Licencia | MIT (el modelo base Qwen3.5-27B es Apache-2.0) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3.5-27B, que Base Labs / Baseten sometió a un fine-tune completo para decisiones (baselabs/mammoth-1, commit 61cec44). Sobre ese punto de partida, el autor reescribió el modelo al layout de lectura conjunta: se conserva el backbone Qwen3_5Model con todos los tensores intactos (solo renombrados), se elimina el LM head no atado y se crean filas de lectura equivalentes a 2 x las filas del LM head para los tokens de código de respuesta, bajo una decision_config v2.

El entrenamiento propio consistió en un LoRA nuevo (r=32, alpha=64, aplicado a todas las capas lineales del modelo de lenguaje; la torre de visión no se tocó) entrenado en modo conjunto con atención bidireccional completa sobre el prompt, durante 1.500 pasos de 32 filas con lr 2.5e-5 y schedule coseno, usando como objetivo las filas de lectura A..Z. Tras la fusión en el backbone, las filas A..Z se reescalaron por un alpha ajustado (2,7) y se desplazaron restando la media de las filas A y B ((w_A+w_B)/2), un cambio que no altera el softmax de opciones y prepara el modelo para la lectura fija a T=2 del validador REAX.

Los datos de entrenamiento combinan varias familias: (1) ítems procedurales con generadores y solucionadores exactos (ajedrez con Stockfish 16 y retrograde DTM para finales KQK/KRK, Connect 4, Nim, tres en raya, lógica, aritmética, probabilidad, código Python y SQL/SQLite, y decenas de tareas de reglas de negocio como tarifas de aparcamiento, reembolsos, SLA o impuestos); (2) registros de fuentes públicas fechados en octubre de 2026 (arXiv, Federal Register, NIST NVD, GitHub Advisory Database, OpenAlex, Wikidata, EURLEX, NASA NTRS, FDA, OSHA, NOAA, StackExchange, Wikipedia en inglés, etc.); (3) preguntas de hechos con fecha posterior al 1 de agosto de 2026 cuyo objetivo es "I don't know", junto a preguntas respondibles sobre hechos anteriores; y (4) replay de filas de especialistas SN92 públicos (decisionmodels/sn92-specialists, CC-BY-4.0) y filas procedurales (tasksource/procedural-typed-decisions, Apache-2.0). No se declara uso de RLHF ni DPO; el ajuste es puramente supervisado sobre la lectura de letras.

## Capacidades

- Selección de respuesta entre opciones múltiples (A..Z): el modelo emite una distribución softmax sobre letras de respuesta a temperatura fija 2, no texto libre.
- Razonamiento sobre reglas y procedimientos: entrenado con solucionadores exactos para ajedrez (Stockfish 16, finales KQK/KRK por retrograde analysis), Connect 4, Nim, tres en raya, lógica, causalidad, aritmética y probabilidad.
- Aplicación de reglas de negocio: cálculo de tarifas, reembolsos, subsidios, horas extra, préstamos, seguros, facturas de servicios, políticas de devolución, créditos por SLA, etc.
- Respuesta calibrada a la incertidumbre: incluye ítems de hechos recientes (posteriores al 1 de agosto de 2026) cuyo objetivo correcto es "I don't know", lo que fomenta la abstención ante información desconocida.
- Comprensión de documentación técnica y APIs: entrenado con especificaciones OpenAPI reales (GitHub REST, Kubernetes, Stripe, Twilio, Box) y generadas.
- Evaluación tipo comité: diseñado para ser servido con el prompt fijo del validador REAX y lectura conjunta de letras, con atención bidireccional sobre el prompt.
- Generación de texto libre, chat, código y visión: no disponibles como capacidades objetivo; la salida generativa fue deliberadamente eliminada al sustituir el LM head, y la torre de visión existe pero no fue entrenada en este fine-tune.

## Casos de uso

- Evaluación automatizada de benchmarks de opción múltiple: el modelo puntúa directamente letras de respuesta sin necesidad de parsing de texto generado, eliminando errores de extracción típicos de los LLM generativos en evaluaciones tipo MMLU.
- Validación de decisiones con reglas verificables: en pipelines donde la respuesta correcta se puede calcular con un solucionador exacto (juegos, lógica, reglas de tarificación), el modelo puede servir como juez o candidato con supervisión programática.
- Sistemas de triaje con abstención: gracias al entrenamiento con objetivo "I don't know" sobre hechos recientes, es adecuado para flujos donde es preferible declinar responder ante información fuera de su conocimiento en lugar de alucinar.
- Verificación de cumplimiento de políticas internas: tareas como aprobar o rechazar préstamos, calcular indemnizaciones de seguros o validar reembolsos según reglas escritas pueden formularse como opciones A..Z y resolverse con el cabezal de lectura.
- Auditoría de respuestas de otros LLM: como modelo de decisión, puede actuar como verificador que elige entre varias respuestas candidatas generadas por otro sistema, integrándose en pipelines de self-consistency o best-of-n.
- Clasificación de consultas sobre APIs: el entrenamiento con especificaciones OpenAPI reales lo hace útil para seleccionar el endpoint o parámetro correcto entre opciones dadas, por ejemplo en routers de tool calling.
- Investigación sobre readouts de clasificación en LLMs: la reescritura del LM head a filas de letras con reescalado y desplazamiento calibrados es un caso de estudio reproducible (licencia MIT) para quien investigue cabezales de clasificación sobre backbones generativos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card describe el proceso de entrenamiento y los datos, pero no incluye métricas de precisión en el track REAX ni comparativas con otros modelos de decisión.

## Requisitos de hardware

- VRAM estimada para inferencia: con 26.085.330.160 parámetros en precisión completa (BF16/FP16), se requieren aproximadamente 52 GB solo para los pesos, más la memoria de activaciones y KV cache; en la práctica, una GPU de 80 GB (A100/H100) es lo mínimo cómodo sin cuantización.
- Cuantización: no se publican versiones cuantizadas. Una cuantización a 4 bits (por ejemplo GPTQ o AWQ, si se adapta el layout de readout) reduciría la huella a unos 14-15 GB, pero no hay soporte declarado.
- Consumer GPU: no cabe en una RTX 4090 (24 GB) ni en una RTX 5090 (32 GB) sin cuantización agresiva; con 4 bits cabría en una RTX 4090 o 5090, aunque la compatibilidad con el layout de decision_config v2 no está garantizada en librerías estándar.
- GPU recomendadas: NVIDIA A100 80 GB, H100 80 GB o equivalentes con suficiente VRAM para carga en BF16.
- Despliegue: el layout no estándar (LM head eliminado, readout de letras, softmax a T=2) hace probable que se necesite código de servidor propio o adaptaciones; el autor declara que el repo contiene "solo pesos, sin código". vLLM, TGI, llama.cpp y Ollama no soportan este layout de forma nativa sin modificaciones, y no hay GGUF disponible.
- Latencia y throughput: no disponible. Al ser una lectura de una sola pasada con softmax sobre letras, el coste por ítem debería ser comparable a un forward pass sin generación autorregresiva, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Tarea | Licencia | Contexto | Disponibilidad |
|---|---|---|---|---|---|
| isomsom/sn92-gen-m87b | 26,09 B | Decisión (opción múltiple A..Z) | MIT | no disponible | Pesos en HF, sin código de servidor |
| baselabs/mammoth-1 (base directa) | no disponible | Fine-tune de Qwen3.5-27B para decisiones | MIT | no disponible | Pesos en HF (commit 61cec44) |
| Qwen/Qwen3.5-27B (base original) | 27 B (nominal) | Generación de texto general | Apache-2.0 | no disponible | Pesos en HF, ecosistema Qwen estándar |

La diferencia clave es funcional: mientras Qwen3.5-27B y mammoth-1 conservan capacidad generativa, sn92-gen-m87b es un clasificador de letras especializado, útil solo en el contexto del validador REAX o en pipelines que repliquen su formato de prompt y readout.

## Limitaciones y advertencias

- No es un modelo generativo: el LM head original fue eliminado, por lo que no puede producir texto, código ni conversación. Intentar usarlo como chatbot no funcionará sin reconstruir el cabezal.
- Acoplamiento al validador REAX: el modelo está calibrado para el prompt fijo del validador SN92 y la lectura conjunta a T=2 con el reescalado alpha 2,7 y el desplazamiento de filas; fuera de ese formato, el rendimiento es impredecible y no está documentado.
- Sin código de servidor: el repositorio contiene solo pesos; replicar el servicio del validador requiere implementar el prompt, la lectura y el softmax por cuenta propia.
- Riesgo de alucinación: reducido por diseño en su tarea objetivo (incluye entrenamiento explícito para responder "I don't know" ante hechos recientes), pero no hay métricas publicadas que cuantifiquen la calibración.
- Idioma: los datos de entrenamiento son esencialmente en inglés; no hay soporte declarado para castellano ni otros idiomas.
- Sesgos: entrenado sobre registros públicos y decisiones de moderación de Wikipedia (AfD, RfA, XfD), puede heredar los sesgos de esas fuentes y de las reglas procedurales sintéticas.
- Visión no entrenada: la torre de visión del backbone se conserva intacta pero no se ajustó; su comportamiento en este layout no está verificado.
- Licencia: MIT, sin restricciones comerciales relevantes; el modelo base Qwen3.5-27B es Apache-2.0. El autor declara explícitamente que no está afiliado ni respaldado por Base Labs / Baseten ni por el equipo Qwen.
- Traction mínimo: 126 descargas y 1 like en el momento de redactar la ficha; no hay comunidad ni soporte detrás del artefacto.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/isomsom/sn92-gen-m87b
- Modelo base declarado: baselabs/mammoth-1 (commit 61cec44c281c693992e3d6ebeb44dd3402dfa186) — https://huggingface.co/baselabs/mammoth-1
- Modelo base original: Qwen/Qwen3.5-27B — https://huggingface.co/Qwen/Qwen3.5-27B
- Datos de especialistas SN92: decisionmodels/sn92-specialists — https://huggingface.co/decisionmodels/sn92-specialists
- Datos procedurales: tasksource/procedural-typed-decisions — https://huggingface.co/tasksource/procedural-typed-decisions
- Paper, blog, demo o repositorio de código: no disponibles
