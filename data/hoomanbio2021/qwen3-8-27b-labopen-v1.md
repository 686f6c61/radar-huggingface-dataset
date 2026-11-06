# HoomanBio2021/Qwen3.8-27B-LabOpen-v1

## Resumen

Qwen3.8-27B-LabOpen v1 es un modelo de lenguaje afinado a partir de Qwen/Qwen3.8-27B-FP8 mediante LoRA y aprendizaje por refuerzo, publicado por el usuario HoomanBio2021 en Hugging Face. Su objetivo es reforzar capacidades de computación científica verificable en seis dominios concretos: física de fluidos, leyes de mezclas de materiales, genética clásica, consultas de acción operativas, estilo de prosa y código agéntico, manteniendo intactas las capacidades generales del modelo base (generación de código, function calling, comprensión de intención y renderizado de fórmulas LaTeX).

El resultado más destacado es la mejora en código agéntico: de un 32 % a un 72 % en una batería determinista de 78 pruebas, un salto de +40 puntos porcentuales con solo 15 ventanas de entrenamiento de refuerzo y un LoRA de rango 4. En la comparativa externa publicada, el modelo se sitúa en el puesto número 2, por delante de Qwen3.8-max y DeepSeek v4.1 flash, y solo por detrás de GLM 5.3.

El repositorio se distribuye de dos formas: pesos completos fusionados en FP8 (un reemplazo directo del modelo base, con el mismo formato de tensores) y el adaptador LoRA original de 112 MB en formato PEFT. Está dirigido a universidades, institutos de investigación, centros de I+D y laboratorios profesionales que necesiten despliegue local o privado en dominios científicos. El modelo es bilingüe (inglés y chino) y hereda la licencia Apache 2.0 del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (familia Qwen3.8), con adaptador LoRA r=4 fusionado |
| Parametros totales | 27.781.427.952 (≈27,8 B) |
| Parametros activos | no disponible (no se indica si es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | FP8 (blockwise, re-cuantizado tras la fusión) |
| Idiomas soportados | Inglés (en), chino (zh) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (pesos fusionados, 31,0 GB; adaptador LoRA de 112 MB en formato PEFT) |

## Arquitectura y entrenamiento

El modelo parte de Qwen3.8-27B-FP8, un transformer denso de la familia Qwen3.8. Sobre él se entrena un adaptador LoRA de rango 4 (112 MB, 992 tensores) mediante aprendizaje por refuerzo relativo a grupo (estilo RLOO, con muestreo k=8) y recompensas mecánicamente verificables. El entrenamiento se organizó en 15 ventanas de refuerzo (denominadas G69–G84), cada una orientada a un dominio verificable, lo que permite que las recompensas no dependan de un modelo juez sino de comprobaciones deterministas.

Tras el entrenamiento, el adaptador se fusionó con los pesos base y se re-cuantizó en FP8 por bloques, conservando el mismo layout de tensores y formato de cuantización que el modelo base, de modo que funciona como reemplazo directo en servidores de inferencia. El repositorio incluye un informe de fusión (MERGE_REPORT.md) con digests, SHA-256 de los shards, estadísticas de error de re-cuantización y pruebas de equivalencia de salida, además del adaptador original para quien necesite reproducir la numerica exacta de entrenamiento o continuar el entrenamiento.

## Capacidades

- Generación de texto conversacional y renderizado de fórmulas LaTeX (integridad 5/5 en las pruebas publicadas).
- Código agéntico: 72 % (56/78) en una batería determinista de 78 pruebas con 3 rondas de corrección, frente al 32 % del modelo base.
- Física de fluidos: resolución de problemas del dominio CFM (44 % de aciertos con el protocolo etiquetado, T=0,3, k=8), capacidad prácticamente ausente en el modelo base.
- Leyes de mezclas de materiales: 32 % de aciertos en un conjunto heldout de 40 ítems (sin etiquetas de dominio).
- Genética clásica: 79 % de aciertos en el conjunto heldout de 20 ítems con protocolo etiquetado; 20/20 en comparación zero-shot.
- Consultas de acción operativas (ops): 4/8 a T=0,3 y 5/8 a T=0,8.
- Estilo de prosa: 75 % any-correct en 20 tareas abiertas a T=0,3 con k=8.
- Comprensión de intención preservada: 8/10 en la sonda de intención profunda de 10 escenas.
- Hereda del modelo base la generación de código nativa y el function calling (no se documentan detalles adicionales de tool calling agéntico más allá de la batería de código agéntico).

## Casos de uso

- Asistentes de código agéntico en laboratorios de software: el salto a 72 % en la batería de 78 pruebas con corrección en 3 rondas lo hace adecuado para pipelines donde el modelo escribe, ejecuta y repara código de forma iterativa, integrable en flujos de CI/CD.
- Resolución de problemas de física de fluidos: puede abordar problemas del dominio CFM donde el modelo base fallaba casi por completo, útil como asistente de cálculo en departamentos de ingeniería y física.
- Verificación de leyes de mezclas en ciencia de materiales: permite consultar propiedades y leyes de mezclas de materiales con un rendimiento (17/40 en modo estricto) que supera a modelos frontera como GLM 5.3 y Qwen3.8-max en ese dominio concreto.
- Consultoría en genética clásica: con 20/20 en la comparación zero-shot del dominio, es especialmente fuerte en problemas de cruzamientos y herencia mendeliana, útil en docencia y laboratorios de biología.
- Renderizado de documentación científica: mantiene la integridad LaTeX (5/5), por lo que sirve para generar artículos, apuntes y documentación técnica con fórmulas correctas.
- Despliegue privado en instituciones: al ser Apache 2.0 y caber en ~31 GB en FP8, universidades y centros de I+D pueden ejecutarlo localmente sin depender de APIs externas, preservando la confidencialidad de datos de investigación.
- Comprensión de intención en asistentes técnicos: mantiene 8/10 en la sonda de intención profunda, adecuado para chatbots técnicos multi-turno que requieren interpretar peticiones ambiguas de usuarios científicos.

## Benchmarks y rendimiento

Resultados medidos por el autor en conjuntos heldout, según la model card:

| Dominio | Metrica | Puntuacion | vs Base |
|---|---|---|---|
| Codigo agentico | 78 pruebas deterministas, 3 rondas de correccion | 72 % (56/78) | +40 pp (base: 32 %) |
| Comprension de intencion | sonda de 10 escenas | 8/10 | preservado |
| Renderizado de formulas | integridad LaTeX, 5 problemas | 5/5 | preservado |
| Fisica de fluidos (CFM) | Pool-B heldout, T=0,3, k=8, etiquetado | 44 % de aciertos | nuevo (base ≈ 0) |
| Materiales (leyes de mezclas) | heldout 40 items, T=0,3, sin etiquetas | 32 % de aciertos | nuevo (base ≈ 0) |
| Genetica clasica | heldout 20 items, etiquetado | 79 % de aciertos | nuevo (base: 47 % natural) |
| Ops (consultas de accion) | 8 items, doble temperatura | 4/8 (T0,3) – 5/8 (T0,8) | nuevo |
| Estilo de prosa | 20 tareas abiertas, T=0,3, k=8 | 75 % any-correct | nuevo |

Comparativa externa en la misma batería de código agéntico (octubre de 2026):

| Modelo | Intencion | Pruebas agenticas | Puesto |
|---|---|---|---|
| GLM 5.3 | 8/10 | 57/78 (73 %) | #1 |
| LabOpen v1 (este modelo) | 8/10 | 56/78 (72 %) | #2 |
| Qwen3.8-max | 8/10 | 54/78 (69 %) | #3 |
| DeepSeek v4.1 flash | 6/10 | 48/78 (62 %) | #4 |
| Qwen3.8-27B (base) | 8/10 | 25/78 (32 %) | #5 |

Comparativa zero-shot por dominios frente a modelos frontera:

| Dominio (items) | GLM 5.3 | Qwen3.8-max | DeepSeek flash | LabOpen v1 | Base |
|---|---|---|---|---|---|
| Fisica de fluidos (36) | 36/36 | 36/36 | 35/36 | 25/36 | ≈0 |
| Materiales — estricto (40) | 1/40 | 0/40 | 0/40 | 17/40 | ≈0 |
| Materiales — fair 1 % (40) | 20/40 | 15/40 | 22/40 | 18/40 | — |
| Genetica clasica (20) | 9/20 | 12/20 | 7/20 | 20/20 | 47 % |
| Ops — estricto (8) | 0/8 | 0/8 | 0/8 | 4/8 (T0,3) | 0/8 |
| Ops — null-action-equivalente (8) | 4/8 | 0/8 | 3/8 | 4/8 | — |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible; todas las métricas provienen de baterías propias del autor.

## Requisitos de hardware

- VRAM estimada para inferencia: ~31 GB en FP8 (tamaño del repo de pesos fusionados), más overhead de KV cache según la longitud de contexto.
- GPU recomendadas: NVIDIA con compute capability ≥ 8,9, según la model card: H100, L40S, B200 y clase DGX GB10.
- Consumer GPUs: no cabe cómodamente en una RTX 4090 (24 GB) en FP8; sería necesario esperar cuantizaciones adicionales (no publicadas en el repo) o repartir entre varias GPUs. No se han publicado versiones GGUF ni AWQ.
- Opciones de despliegue: vLLM y SGLang (recomendados por el autor para los pesos fusionados); transformers con PEFT para cargar el adaptador sobre el modelo base. No se menciona soporte de llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Formato | Codigo agentico (misma bateria) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.8-27B-LabOpen v1 | 27,8 B | FP8 safetensors + LoRA | 72 % (56/78) | Apache 2.0 | Abierto en Hugging Face |
| Qwen3.8-27B (base) | 27,8 B | FP8 safetensors | 32 % (25/78) | Apache 2.0 | Abierto en Hugging Face |
| GLM 5.3 | no disponible | no disponible | 73 % (57/78) | no disponible | Cerrado/API (segun la model card) |
| Qwen3.8-max | no disponible | no disponible | 69 % (54/78) | no disponible | Cerrado/API (segun la model card) |
| DeepSeek v4.1 flash | no disponible | no disponible | 62 % (48/78) | no disponible | Cerrado/API (segun la model card) |

La ventaja diferencial de LabOpen v1 frente a los modelos frontera cerrados es que alcanza un rendimiento cercano en código agéntico con pesos abiertos Apache 2.0 y ~31 GB, y supera a todos ellos en genética clásica y en el dominio estricto de materiales.

## Limitaciones y advertencias

- Física de fluidos: 25/36 en zero-shot frente a 36/36 de GLM 5.3 y Qwen3.8-max; queda una brecha significativa respecto a los modelos frontera en este dominio.
- Código agéntico: aunque la tasa final con 3 rondas de corrección es del 72 %, la model card reconoce que la tasa de primer intento (first-pass) y el conocimiento general siguen por detrás de los modelos de 100B+ parámetros.
- Dominio de ops: el fallo estricto 0/8 de los modelos frontera revela que parte de las métricas de este dominio dependen de convenciones de vocabulario privadas (la acción nula "observe" no se declara en el prompt), lo que puede inflar artificialmente la ventaja de LabOpen v1 (4/8).
- Métricas propias: todos los benchmarks proceden de baterías diseñadas por el propio autor, con protocolos etiquetados en algunos dominios (que no son directamente comparables con evaluaciones zero-shot externas). No hay evaluaciones independientes ni benchmarks estándar (MMLU, HumanEval, GSM8K).
- Trazabilidad muy limitada: el modelo tiene 5 descargas y 1 like en Hugging Face, sin comunidad ni historial de uso en producción que valide los resultados publicados.
- Idiomas: solo inglés y chino; no hay soporte documentado para castellano ni otros idiomas.
- Contexto: la longitud de ventana de contexto no está documentada en la model card.
- Riesgo de alucinación: no se documentan mediciones específicas; al ser un modelo de 27B con RL sobre dominios estrechos, debe tratarse con la cautela habitual en dominios científicos de alto riesgo.
- Hardware: requiere GPUs con compute capability ≥ 8,9, lo que excluye a gran parte del parque de GPUs consumer y de generaciones anteriores (A100 incluida, con capability 8,0).

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/HoomanBio2021/Qwen3.8-27B-LabOpen-v1
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B-FP8
- Documentación incluida en el repo: MERGE_REPORT.md (procedencia de la fusión), EVALUATION.md (matriz de capacidades y comparativa de 5 modelos), USAGE.md (carga, etiquetas de dominio, temperatura y resolución de problemas)
