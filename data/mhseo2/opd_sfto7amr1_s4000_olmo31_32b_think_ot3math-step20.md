# mhseo2/opd_sfto7amr1_s4000_olmo31_32b_think_ot3math-step20

## Resumen

`opd_sfto7amr1_s4000_olmo31_32b_think_ot3math-step20` es un checkpoint intermedio de destilación on-policy (on-policy distillation, OPD) desarrollado por el usuario `mhseo2`. Parte de un modelo estudiante de 7.298 millones de parámetros (aproximadamente 7,3B) afinado previamente sobre matemáticas a partir de la familia OLMo 3 de AllenAI, y lo alinea hacia el profesor `allenai/Olmo-3.1-32B-Think` mediante minimización de la divergencia KL reversa por token sobre las propias generaciones del estudiante. El checkpoint corresponde al paso 20 del proceso de destilación.

El modelo aborda un problema clásico de la destilación de conocimiento: transferir el comportamiento de razonamiento de un modelo grande (32B) a uno pequeño (7B) sin depender de un reward de tarea, usando únicamente la distribución del profesor como señal. Los prompts provienen de OpenThoughts3 (preguntas de matemáticas sin respuestas), con 60 prompts por paso y 4 rollouts por prompt, generando respuestas de hasta 32.768 tokens. Se trata de un artefacto de investigación más que de un modelo listo para producción: 36 descargas, sin pipeline declarado y con una model card mínima.

Su relevancia es doble. Por un lado, documenta una receta reproducible de OPD sobre la familia OLMo 3 con licencia Apache 2.0. Por otro, ofrece métricas de evaluación en matemáticas competitivas (AIME 2025, AIME 2026, HMMT Feb 2025) para un estudiante de 7B destilado, lo que permite comparar la eficacia de la destilación frente al entrenamiento con SFT convencional.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (familia OLMo 3; detalles de capas y atención no disponibles en la información proporcionada) |
| Parametros totales | 7.298.011.136 |
| Parametros activos | no disponible (no es un modelo MoE según la información disponible) |
| Longitud de contexto | no disponible en la model card; las evaluaciones usan prompt de 768 tokens y respuesta de hasta 32.768 tokens |
| Tipos de cuantizacion | no disponible (solo se publican pesos en safetensors; la evaluación se ejecutó en float16) |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (3 shards: `model-00001-of-00003`, `model-00002-of-00003`, `model-00003-of-00003`) |

## Arquitectura y entrenamiento

El modelo es un transformer de la familia OLMo 3, inicializado desde `mhseo2/sft_olmo3base7b_amr1_0528_math_n204800-step4000`, un SFT sobre AM-DeepSeek-R1-0528 de matemáticas en el paso 4000. Sobre esa base se aplica destilación on-policy: el estudiante genera sus propios rollouts y se minimiza la divergencia KL reversa por token respecto al profesor `allenai/Olmo-3.1-32B-Think` (revisión `97ade57a9cc5`), con top-32 del profesor y estimador k1. No hay reward de tarea; la única señal es la distribución del profesor.

Los datos de entrenamiento son 53.105 preguntas de matemáticas de OpenThoughts3 sin respuestas. En cada paso se muestrean 60 prompts con 4 rollouts cada uno, a temperatura 1 y con respuestas de hasta 32.768 tokens. El entrenamiento usa lr constante de 5e-6, AdamW con weight decay 0.01. La infraestructura fue BSC MareNostrum 5: 2 nodos con 4 H100 cada uno, estudiante en FSDP con vLLM y profesor en vLLM con tensor parallelism 2. El checkpoint publicado corresponde al paso 20, por lo que es un artefacto temprano del proceso y no el resultado final de la destilación.

## Capacidades

- Generación de texto y razonamiento matemático con modo "think" (el nombre del checkpoint incluye `think` y el profesor es un modelo de razonamiento).
- Resolución de problemas de matemáticas competitivas (AIME, HMMT) con cadenas de razonamiento largas, de hasta 32.768 tokens de respuesta.
- Generación de código y matemáticas: la model card etiqueta el modelo con `math`; no se documentan otras capacidades específicas.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no documentado de forma explícita; el modo think permite cadenas de razonamiento extensas.
- Capacidades multilingües: no disponibles.
- Capacidades especiales: modo de razonamiento (thinking) heredado del profesor; no se documentan visión ni audio.

## Casos de uso

- Evaluación de recetas de destilación on-policy: sirve como checkpoint de referencia para medir cómo evoluciona un estudiante de 7B destilado desde un profesor de 32B en pasos tempranos (paso 20), comparando con checkpoints posteriores o con SFT puro.
- Investigación en matemáticas competitivas: permite reproducir las evaluaciones de AIME 2025, AIME 2026 y HMMT Feb 2025 con el mismo protocolo (mean@8, temperatura 0.6, top_p 0.95, math_verify) y comparar contra otros estudiantes de 7B.
- Generación de soluciones matemáticas paso a paso: el modo think y la ventana de respuesta de 32.768 tokens permiten producir razonamientos largos para problemas de olimpiada, útiles como datos sintéticos para entrenamiento posterior.
- Destilación adicional o fine-tuning: al ser un checkpoint intermedio con licencia Apache 2.0, puede usarse como inicialización para continuar el proceso OPD o para SFT específico de dominio.
- Estudio de la divergencia KL como señal de entrenamiento: el modelo permite analizar el efecto de la KL reversa con top-32 del profesor sin reward de tarea en el comportamiento del estudiante.
- Benchmarking de infraestructura de inferencia: con 7,3B parámetros y pesos en safetensors, es un candidato razonable para medir throughput y latencia en vLLM o TGI en GPUs de 24 GB o más, aunque no se publican cifras de rendimiento.

## Benchmarks y rendimiento

Resultados publicados en la model card: precisión mean@8 (%), temperatura 0.6, top_p 0.95, prompt de 768 tokens y respuesta de 32.768 tokens, scorer `math_verify`, plantilla de chat del estudiante, ejecutado en una Quadro RTX 6000 en float16.

| Benchmark | Resultado (mean@8, %) |
|---|---|
| AIME 2025 | 37,92 |
| AIME 2026 | 41,67 |
| HMMT Feb 2025 | 23,75 |

No se han publicado resultados de benchmarks comparativos con modelos similares en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Como referencia de orden de magnitud, 7,3B parámetros en float16 requieren aproximadamente 14,6 GB solo para pesos (coincide con el tamaño del repo), más overhead de activaciones y KV cache; en cuantización de 8 bits rondaría 7-8 GB y en 4 bits unos 4 GB, aunque estas cifras no están publicadas por el autor.
- GPU recomendadas: la evaluación se ejecutó en una Quadro RTX 6000 (24 GB) en float16, lo que sugiere que una GPU de 24 GB es suficiente para inferencia en precisión completa. Para mayor throughput, A100 o H100.
- ¿Cabe en GPU consumer? Sí, previsiblemente en GPUs de 24 GB (RTX 3090, RTX 4090, Quadro RTX 6000) en float16, y en GPUs de 12-16 GB con cuantización, aunque no hay cifras oficiales.
- Opciones de despliegue: vLLM (usado en el entrenamiento para estudiante y profesor), TGI y llama.cpp/Ollama son opciones razonables; el autor no publica una guía de despliegue. No se distribuyen pesos GGUF en el repo.
- Latencia y throughput: no disponibles. El contexto de respuesta de hasta 32.768 tokens implica latencias altas en problemas de matemáticas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Benchmarks matemáticos | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (`opd_..._step20`) | 7,3B | no disponible | AIME 2025: 37,92; AIME 2026: 41,67; HMMT Feb 2025: 23,75 (mean@8) | Apache 2.0 | Hugging Face, 36 descargas |
| `mhseo2/sft_olmo3base7b_amr1_0528_math_n204800-step4000` (modelo base) | 7,3B (misma familia) | no disponible | no disponible | no disponible | Hugging Face |
| `allenai/Olmo-3.1-32B-Think` (profesor) | 32B (según nombre) | no disponible | no disponible | no disponible | Hugging Face |

No se dispone de datos de benchmarks de los modelos comparables en la información proporcionada, por lo que no es posible establecer una comparación cuantitativa de rendimiento.

## Limitaciones y advertencias

- Es un checkpoint intermedio (paso 20) de un proceso de destilación; no representa el resultado final y su rendimiento puede mejorar con más pasos.
- Entrenado exclusivamente con preguntas de matemáticas de OpenThoughts3: el dominio es muy estrecho y el rendimiento fuera de matemáticas no está documentado.
- Sin reward de tarea: la señal es solo la KL respecto al profesor, lo que puede heredar sesgos y errores del profesor `Olmo-3.1-32B-Think`.
- Riesgo de alucinación en razonamientos matemáticos largos, especialmente con respuestas de hasta 32.768 tokens; la evaluación usa `math_verify` y mean@8, que no elimina errores sistemáticos.
- Idiomas soportados no documentados; no se garantiza un buen comportamiento en castellano.
- Longitud de contexto no publicada; las evaluaciones usan prompt de 768 tokens, por lo que el comportamiento con contextos largos es desconocido.
- Licencia Apache 2.0 permite uso comercial, pero el modelo base y el profesor tienen sus propias condiciones; conviene verificar la licencia de `allenai/Olmo-3.1-32B-Think` y del SFT base antes de un uso comercial.
- Model card mínima: sin pipeline declarado, sin guía de cuantización y con muy pocas descargas, lo que limita la validación comunitaria.
- No se publican cifras de latencia, throughput ni requisitos de VRAM oficiales.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/mhseo2/opd_sfto7amr1_s4000_olmo31_32b_think_ot3math-step20
- Modelo base: https://huggingface.co/mhseo2/sft_olmo3base7b_amr1_0528_math_n204800-step4000
- Profesor: https://huggingface.co/allenai/Olmo-3.1-32B-Think
- Dataset de prompts: OpenThoughts3 (no se proporciona enlace directo en la información disponible)
- Código de entrenamiento: árbol `mopdRL` con hash `f1bcc9eb82a8bcc7a053a23dd1afcae82fb591e4`, paquete `bsc-olmo-base-opd-2026-10-26` (no se proporciona URL en la información disponible)
