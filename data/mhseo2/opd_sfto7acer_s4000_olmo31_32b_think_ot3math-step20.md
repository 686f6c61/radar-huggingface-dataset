# mhseo2/opd_sfto7acer_s4000_olmo31_32b_think_ot3math-step20

## Resumen

El modelo `opd_sfto7acer_s4000_olmo31_32b_think_ot3math-step20` es un checkpoint intermedio de destilación on-policy (OPD, *on-policy distillation*) publicado por el usuario de HuggingFace `mhseo2`. Parte de un SFT de OLMo 3 Base de 7B afinado en matemáticas con el dataset AceReason-1.1 (paso 4000) y se destila hacia el modelo profesor `allenai/Olmo-3.1-32B-Think` (revisión `97ade57a9cc5`). El checkpoint publicado corresponde únicamente al paso 20 del proceso de destilación.

El interés técnico del artefacto es acotado: no se trata de un modelo final ni de un lanzamiento oficial, sino de un snapshot de un experimento de investigación sobre destilación on-policy con pérdida KL inversa por token. La arquitectura subyacente es la de OLMo 3 (transformer decoder-only) con aproximadamente 7.298 millones de parámetros totales, pesos en `safetensors` (tres shards, 14,6 GB en fp16) y licencia Apache 2.0.

Su relevancia ahora es metodológica: documenta un procedimiento reproducible de OPD (rollouts del estudiante, profesor vLLM en TP2, pérdida KL inversa k1 con top-32 del profesor, sin recompensa de tarea) ejecutado sobre BSC MareNostrum 5 con 2 nodos × 4 H100. Los resultados de evaluación publicados (mean@8 en AIME 2025, AIME 2026 y HMMT Feb 2025) permiten trazar la evolución del estudiante durante las primeras etapas del entrenamiento.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia OLMo 3, según `config.json` no inspeccionado en detalle) |
| Parámetros totales | 7.298.011.136 |
| Parámetros activos | no disponible (no es MoE según la información proporcionada) |
| Longitud de contexto | no disponible (la evaluación usa prompt 768 / respuesta 32.768 tokens, pero no se especifica la ventana nativa) |
| Tipos de cuantización | no disponible (pesos publicados en float16/safetensors; no se documentan GGUF ni otras cuantizaciones) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (3 shards: `model-00001-of-00003.safetensors`, `model-00002-of-00003.safetensors`, `model-00003-of-00003.safetensors`) + `model.safetensors.index.json` |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only de la familia OLMo 3, inicializado desde `mhseo2/sft_olmo3base7b_acereason11_math_n204800-step4000` (SFT matemático sobre AceReason-1.1 con 204.800 muestras, paso 4000). Sobre esa base se aplica destilación on-policy hacia `allenai/Olmo-3.1-32B-Think` como profesor. El procedimiento genera rollouts del propio estudiante (60 prompts × 4 rollouts por paso, temperatura 1, respuestas de hasta 32.768 tokens) y calcula una pérdida de divergencia KL inversa por token (estimador k1, usando el top-32 del profesor), sin recompensa de tarea. Los prompts provienen de OpenThoughts3 math (53.105 preguntas, sin respuestas).

El entrenamiento usa AdamW con learning rate constante de 5e-6 y weight decay 0.01. La infraestructura combina FSDP para el estudiante y vLLM para generación (estudiante y profesor, este último con tensor parallelism 2) sobre 2 nodos × 4 H100 en BSC MareNostrum 5. El checkpoint publicado corresponde al paso 20. El código asociado es el árbol `mopdRL` en la revisión `f1bcc9eb82a8bcc7a053a23dd1afcae82fb591e4` (paquete `bsc-olmo-base-opd-2026-10-26`). No se documentan etapas de RLHF o DPO adicionales en este checkpoint.

## Capacidades

- Generación de texto y razonamiento matemático con modo *thinking* (el nombre del modelo incluye `think` y el profesor es `Olmo-3.1-32B-Think`; el *chat template* propio se usa en la evaluación).
- Resolución de problemas matemáticos de competición (AIME, HMMT) con respuestas largas de hasta 32.768 tokens.
- Razonamiento multi-paso con cadenas de pensamiento extensas, derivado del proceso de destilación desde un profesor *think*.
- Soporte de *chat template* propio (`chat_template.jinja` incluido en el repo), lo que permite inferencia conversacional.
- Tool calling / function calling: no disponible en la información proporcionada.
- Capacidades de agente: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible en la información proporcionada (los idiomas no están declarados).
- Capacidades de visión o audio: no disponible.

## Casos de uso

- Investigación en destilación on-policy: el checkpoint del paso 20 sirve como referencia para estudiar la dinámica temprana de la KL inversa con top-32 del profesor, comparando con checkpoints posteriores del mismo run.
- Reproducción de experimentos de OPD: el paquete `bsc-olmo-base-opd-2026-10-26` y la revisión de código publicada permiten reconstruir el pipeline (FSDP + vLLM, 60 prompts × 4 rollouts, temperatura 1) sobre clústeres con H100.
- Evaluación de modelos matemáticos de 7B: útil como baseline intermedio en comparativas de precisión mean@8 sobre AIME y HMMT con el scorer `math_verify`.
- Estudio de la brecha estudiante-profesor: al ser un paso temprano (20) de la destilación hacia un profesor de 32B, permite medir cuánto del rendimiento del profesor se recupera con pocos pasos y qué coste computacional implica.
- Generación de soluciones matemáticas largas: el modelo está entrenado para producir respuestas de hasta 32.768 tokens, adecuado para problemas que requieren derivaciones extensas.
- Base para *fine-tuning* posterior en dominios matemáticos específicos: al estar bajo Apache 2.0 y en safetensors estándar, puede servir de inicialización para SFT adicional en subdominios (álgebra, geometría, etc.).
- Despliegue en investigación con vLLM: el formato safetensors y el tamaño de 7B permiten servirlo con vLLM o TGI en una sola GPU de 80 GB en fp16.

## Benchmarks y rendimiento

Datos publicados en la model card (mean@8, temperatura 0.6, top_p 0.95, prompt 768 / respuesta 32.768 tokens, scorer `math_verify`, ejecutado en Quadro RTX 6000 en float16):

| Benchmark | Resultado (mean@8, %) |
|---|---|
| AIME 2025 | 40,42 |
| AIME 2026 | 47,50 |
| HMMT Feb 2025 | 25,00 |

No se han publicado resultados de benchmarks comparativos con otros modelos en la información disponible, ni datos de MMLU, HumanEval o GSM8K.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16: aproximadamente 14,6 GB solo de pesos, más KV cache; en la práctica, unos 16-20 GB para contextos moderados y bastante más para respuestas de 32.768 tokens.
- GPU recomendadas: H100 (usadas en el entrenamiento), A100 80 GB para servir contextos largos con comodidad; una RTX 4090 (24 GB) puede alojar los pesos en fp16 pero el contexto de 32.768 tokens requiere gestión cuidadosa del KV cache.
- Cabe en GPU de consumo: sí, en RTX 4090/3090 (24 GB) en fp16 para contextos cortos; en cuantización de 8 bits o 4 bits (no publicada, habría que generarla) cabría en GPUs de 12-16 GB.
- Opciones de despliegue: vLLM (usado en el entrenamiento para estudiante y profesor), TGI y llama.cpp/Ollama requerirían conversión a GGUF, que no está publicada.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| `mhseo2/opd_sfto7acer_s4000_olmo31_32b_think_ot3math-step20` (este) | 7,298B | no disponible | Apache 2.0 | HuggingFace (38 descargas) | Checkpoint intermedio de OPD, paso 20 |
| `mhseo2/sft_olmo3base7b_acereason11_math_n204800-step4000` (base) | ~7B | no disponible | no disponible | HuggingFace | SFT matemático previo a la destilación; sin datos de eval en esta ficha |
| `allenai/Olmo-3.1-32B-Think` (profesor) | ~32B | no disponible | no disponible | HuggingFace | Profesor de la destilación; 4,4× más parámetros |
| `allenai/OLMo-3-Base-7B` (familia base) | ~7B | no disponible | no disponible | HuggingFace | Modelo base de la familia; sin datos de eval en esta ficha |

No se dispone de datos de rendimiento de los modelos comparables en la información proporcionada, por lo que la comparación se limita a parámetros, licencia y disponibilidad.

## Limitaciones y advertencias

- Es un checkpoint intermedio (paso 20) de un experimento de investigación, no un modelo final ni validado para producción.
- Los resultados de evaluación son mean@8 sobre tres benchmarks matemáticos, con un único scorer (`math_verify`) y en float16 sobre Quadro RTX 6000; no hay validación en otros dominios ni en tareas generales.
- No se declaran idiomas soportados; el comportamiento multilingüe es desconocido.
- No se documenta la longitud de contexto nativa; usar contextos de 32.768 tokens puede degradar el rendimiento o exceder la ventana del modelo.
- Riesgo de alucinación en razonamiento matemático no cuantificado; no hay evaluación de robustez ni de calibración.
- Sesgos conocidos: no disponibles en la información proporcionada.
- Licencia Apache 2.0 permite uso comercial, pero el modelo deriva de OLMo 3 y de un SFT sobre AceReason-1.1; conviene verificar las condiciones de los datasets y del modelo base antes de un despliegue comercial.
- El repositorio tiene muy poca tracción (38 descargas, 0 likes) y fue creado en octubre de 2026; no hay garantía de mantenimiento ni de soporte.
- No se publican cuantizaciones GGUF ni versiones optimizadas para llama.cpp/Ollama.

## Enlaces

- HuggingFace: https://huggingface.co/mhseo2/opd_sfto7acer_s4000_olmo31_32b_think_ot3math-step20
- Modelo base (SFT): https://huggingface.co/mhseo2/sft_olmo3base7b_acereason11_math_n204800-step4000
- Profesor: https://huggingface.co/allenai/Olmo-3.1-32B-Think
- Código `mopdRL` (revisión `f1bcc9eb82a8bcc7a053a23dd1afcae82fb591e4`, paquete `bsc-olmo-base-opd-2026-10-26`): no se proporciona URL en la información disponible
- Paper, blog o demo: no disponibles en la información proporcionada
