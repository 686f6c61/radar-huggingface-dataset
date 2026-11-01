# mhseo2/opd_sfto7nemo_s600_olmo31_32b_think_ot3math-step30

## Resumen
El modelo `opd_sfto7nemo_s600_olmo31_32b_think_ot3math-step30` es un checkpoint de destilación on-policy (OPD, on-policy distillation) desarrollado por el usuario mhseo2. Parte de un modelo estudiante de 7.298 millones de parámetros —un Olmo 3 base de 7B afinado con Nemotron-Math-v2 en el paso 600— y lo alinea hacia el profesor `allenai/Olmo-3.1-32B-Think`. El resultado es un modelo especializado en razonamiento matemático con modo de pensamiento, entrenado durante 30 pasos de destilación.

La relevancia de este checkpoint es metodológica: ilustra cómo transferir capacidades de razonamiento de un profesor grande (32B) a un estudiante pequeño (7B) sin usar recompensas de tarea, únicamente con divergencia KL inversa por token sobre las propias rollouts del estudiante. El entrenamiento se ejecutó en el supercomputador BSC MareNostrum 5 con 8 GPU H100 distribuidas en dos nodos.

Se trata de un artefacto de investigación con 26 descargas y sin likes, publicado bajo licencia Apache 2.0. No dispone de pipeline declarado ni de información sobre idiomas soportados más allá de lo que se deduce de su modelo base Olmo. Su interés práctico está acotado a la experimentación con técnicas de destilación y a la evaluación de modelos matemáticos pequeños con modo thinking.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Olmo 3) |
| Parámetros totales | 7.298.011.136 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (entrenamiento con prompts de 768 tokens y respuestas de hasta 32.768 tokens) |
| Tipos de cuantización | no disponible (pesos publicados en safetensors, presumiblemente float16/bfloat16) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (4 shards) |

## Arquitectura y entrenamiento
La arquitectura corresponde a la familia Olmo 3 de AI2, un transformer decoder-only denso de aproximadamente 7.300 millones de parámetros. El modelo estudiante inicial es `mhseo2/sft_olmo3base7b_nemotronmathv2_high_notool_n204800-step600`, un Olmo 3 base de 7B sometido a un SFT con datos Nemotron-Math-v2 (204.800 muestras, sin herramientas) hasta el paso 600.

El entrenamiento de destilación on-policy consistió en 30 pasos sobre 53.105 preguntas matemáticas de OpenThoughts3 (sin respuestas). En cada paso se muestrearon 60 prompts con 4 rollouts por prompt, temperatura 1 y respuestas de hasta 32.768 tokens. La pérdida es una KL inversa por token (estimador k1, top-32 del profesor) calculada sobre las rollouts del propio estudiante frente al profesor `allenai/Olmo-3.1-32B-Think` (revisión `97ade57a9cc5`), sin recompensa de tarea. Se usó AdamW con learning rate constante de 5e-6 y weight decay 0.01. La infraestructura fue BSC MareNostrum 5: 2 nodos × 4 H100, con estudiante en FSDP + vLLM y profesor en vLLM con tensor parallelism 2. El código procede del árbol `mopdRL` (commit `f1bcc9eb82a8bcc7a053a23dd1afcae82fb591e4`, paquete `bsc-olmo-base-opd-2026-10-26`).

## Capacidades
- Generación de texto y razonamiento matemático con modo de pensamiento (thinking), heredado del profesor Olmo-3.1-32B-Think.
- Resolución de problemas de competición matemática (AIME, HMMT) mediante cadenas de razonamiento largas, con respuestas de hasta 32.768 tokens.
- Razonamiento multi-paso en dominios STEM, orientado específicamente a matemáticas.
- Plantilla de chat propia (`chat_template.jinja`) para formateo de conversaciones.
- Soporte de tool calling: no disponible según la información proporcionada (el SFT de partida se etiqueta como `notool`).
- Capacidades de agente: no documentadas.
- Capacidades multilingües: no documentadas; los idiomas soportados figuran como no disponibles.
- Vision y audio: no disponibles.

## Casos de uso
- Evaluación de técnicas de destilación on-policy: el checkpoint sirve como referencia reproducible (paso 30) para comparar la evolución de la KL inversa y la precisión matemática frente a checkpoints posteriores del mismo run.
- Investigación en alineación de modelos pequeños: permite estudiar cuánta capacidad de razonamiento de un profesor de 32B se transfiere a un estudiante de 7B sin recompensas de tarea, usando las métricas AIME 2025, AIME 2026 y HMMT Feb 2025 como referencia.
- Generación de soluciones matemáticas paso a paso en entornos de investigación: con contexto de respuesta de hasta 32.768 tokens, el modelo puede producir derivaciones largas para problemas de competición, útil en pipelines de verificación automática con `math_verify`.
- Benchmarking interno de modelos matemáticos: su tamaño de 7.3B permite desplegarlo en una sola GPU para pruebas de regresión de pipelines de evaluación con temperatura 0.6 y top_p 0.95.
- Estudio de la degradación por pasos de destilación: al ser el paso 30, es un punto de control para analizar la curva de aprendizaje temprana y el sobreajuste al profesor.
- Base para posteriores fine-tunes específicos de dominio: al estar bajo Apache 2.0 y en safetensors, puede servir de inicialización para SFT adicional en matemáticas aplicadas o física.
- Reproducción de experimentos en clústeres pequeños: su huella de 14,6 GB en el repo facilita replicar evaluaciones en hardware modesto (el autor reporta evaluación en Quadro RTX 6000 en float16).

## Benchmarks y rendimiento
Evaluación mean@8 en precisión (%), temperatura 0.6, top_p 0.95, prompt de 768 tokens y respuesta de hasta 32.768 tokens, scorer `math_verify`, plantilla de chat del estudiante, ejecutada en Quadro RTX 6000 en float16.

| Benchmark | Resultado (mean@8, %) |
|---|---|
| AIME 2025 | 35,00 |
| AIME 2026 | 32,92 |
| HMMT Feb 2025 | 19,58 |

No se han publicado en la información disponible resultados comparativos frente a otros modelos ni métricas adicionales (MMLU, HumanEval, GSM8K).

## Requisitos de hardware
- VRAM estimada para inferencia en float16: aproximadamente 14,6 GB solo para pesos, más overhead de KV cache; con respuestas de hasta 32.768 tokens el KV cache puede añadir varios GB adicionales según la configuración.
- En cuantización de 8 bits: en torno a 7,3-8 GB de pesos; en 4 bits: en torno a 4 GB de pesos (estimaciones teóricas a partir del número de parámetros, no verificadas para este checkpoint).
- GPU recomendadas: H100 o A100 para entrenamiento y evaluación a gran escala (el autor usó 8×H100 para el entrenamiento); para inferencia, una RTX 4090 (24 GB) es suficiente en float16 para contextos moderados.
- Cabe en GPU de consumo: sí, en RTX 4090 (24 GB) en float16 con contextos moderados, y en GPUs de 16 GB con cuantización de 8 bits; el autor evaluó en Quadro RTX 6000 (24 GB) en float16.
- Opciones de despliegue: vLLM (usado por el autor para estudiante y profesor), FSDP para entrenamiento; llama.cpp u Ollama requerirían conversión a GGUF, no disponible en el repo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| opd_sfto7nemo_s600_olmo31_32b_think_ot3math-step30 | 7,3B | no disponible | Apache 2.0 | HuggingFace (26 descargas) | Destilado OPD hacia Olmo-3.1-32B-Think; AIME 2025 35,00 |
| allenai/Olmo-3.1-32B-Think (profesor) | 32B | no disponible en la información | no disponible en la información | HuggingFace (AI2) | Profesor del proceso; mayor capacidad esperada |
| mhseo2/sft_olmo3base7b_nemotronmathv2_high_notool_n204800-step600 (estudiante base) | 7,3B | no disponible | Apache 2.0 | HuggingFace | Punto de partida del SFT; sin destilación OPD |
| Olmo 3 base 7B (familia AI2) | ~7B | no disponible en la información | Apache 2.0 (según familia Olmo) | HuggingFace | Arquitectura de referencia del estudiante |

No se dispone de datos de rendimiento de los modelos comparables en la información proporcionada, por lo que la comparación cuantitativa de benchmarks queda como no disponible.

## Limitaciones y advertencias
- Modelo de investigación con solo 30 pasos de destilación: no es un checkpoint final ni está validado para producción.
- Especializado exclusivamente en matemáticas (OpenThoughts3 math); su rendimiento fuera de ese dominio no está documentado y probablemente sea limitado.
- El SFT de partida está etiquetado como `notool`, por lo que no se debe asumir soporte fiable de tool calling o function calling.
- Idiomas soportados no documentados; no se garantiza un comportamiento multilingüe correcto.
- Riesgo de alucinación inherente a modelos de razonamiento entrenados con KL hacia un profesor: puede generar cadenas de razonamiento plausibles pero incorrectas, especialmente en problemas fuera de la distribución de OpenThoughts3.
- Resultados de benchmarks moderados (AIME 2025 35,00; HMMT Feb 2025 19,58) obtenidos con mean@8 y temperatura 0.6; no comparables directamente con configuraciones de evaluación distintas.
- Longitud de contexto no declarada en la información; aunque se generan respuestas de hasta 32.768 tokens, el contexto máximo del modelo no está confirmado.
- Licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantías ni soporte; verificar la licencia del modelo base y del profesor antes de un despliegue comercial.
- Sin likes ni pipeline declarado y con solo 26 descargas: comunidad reducida, sin validación externa independiente.

## Enlaces
- HuggingFace: https://huggingface.co/mhseo2/opd_sfto7nemo_s600_olmo31_32b_think_ot3math-step30
- Modelo base (SFT): https://huggingface.co/mhseo2/sft_olmo3base7b_nemotronmathv2_high_notool_n204800-step600
- Profesor: https://huggingface.co/allenai/Olmo-3.1-32B-Think
- Código: árbol `mopdRL` (commit `f1bcc9eb82a8bcc7a053a23dd1afcae82fb591e4`, paquete `bsc-olmo-base-opd-2026-10-26`); no se proporciona URL en la información disponible.
