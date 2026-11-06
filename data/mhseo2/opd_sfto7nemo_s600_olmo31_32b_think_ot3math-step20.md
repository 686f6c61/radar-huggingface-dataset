# mhseo2/opd_sfto7nemo_s600_olmo31_32b_think_ot3math-step20

## Resumen

El modelo `opd_sfto7nemo_s600_olmo31_32b_think_ot3math-step20` es un checkpoint experimental de destilacion on-policy (on-policy distillation, OPD) desarrollado por el usuario mhseo2. Parte de un modelo estudiante de 7.298 millones de parametros, resultado de un ajuste fino supervisado (SFT) sobre OLMo 3 Base 7B con el dataset Nemotron-Math-v2, y lo alinea hacia el modelo profesor `allenai/Olmo-3.1-32B-Think` mediante destilacion sobre las propias generaciones del estudiante. El checkpoint publicado corresponde al paso 20 del proceso de destilacion, no a un modelo final convergido.

La relevancia de esta publicacion es metodologica mas que de producto: documenta un pipeline completo de destilacion on-policy con perdida de divergencia KL inversa por token, ejecutado sobre infraestructura HPC (BSC MareNostrum 5, 2 nodos x 4 H100) con un stack que combina FSDP para el estudiante y vLLM para el profesor. El objetivo declarado es transferir capacidades de razonamiento matematico desde un profesor de 32B a un estudiante de 7B sin usar recompensas de tarea, solo la senal del profesor.

El modelo esta especializado en matematicas y razonamiento de multiples pasos, con un template de chat propio y capacidad de generar respuestas de hasta 32.768 tokens. Su licencia Apache 2.0 y su tamano lo hacen desplegable en hardware relativamente modesto, aunque los resultados de evaluacion publicados (27,08% en AIME 2025) indican que se trata de un artefacto de investigacion en fase temprana, no de un modelo listo para produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia OLMo 3, no se detalla variante exacta) |
| Parametros totales | 7.298.011.136 |
| Parametros activos | no disponible (no es MoE segun los datos disponibles) |
| Longitud de contexto | no disponible (las evaluaciones usan prompt de 768 tokens y respuesta de hasta 32.768 tokens) |
| Tipos de cuantizacion | no disponible (solo pesos safetensors en float16/BF16) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (3 shards, ~14,6 GB en total) |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only de la familia OLMo 3, con 7.298 millones de parametros. El estudiante inicial es `mhseo2/sft_olmo3base7b_nemotronmathv2_high_notool_n204800-step600`, es decir, OLMo 3 Base 7B tras 600 pasos de SFT sobre Nemotron-Math-v2 en modo "high" y sin herramientas. Sobre ese punto de partida se aplica destilacion on-policy hacia el profesor `allenai/Olmo-3.1-32B-Think` (revision `97ade57a9cc5`).

El procedimiento de entrenamiento usa preguntas de matematicas de OpenThoughts3 (53.105 prompts sin respuestas). En cada paso se muestrean 60 prompts con 4 rollouts cada uno, a temperatura 1 y con respuestas de hasta 32.768 tokens. La perdida es una KL inversa por token (estimador k1, con top-32 del profesor) calculada sobre los rollouts del propio estudiante, sin recompensa de tarea. Se usa AdamW con learning rate constante de 5e-6 y weight decay de 0.01. El entrenamiento se ejecuto en BSC MareNostrum 5 con 2 nodos de 4 H100 cada uno: estudiante con FSDP y vLLM, profesor con vLLM en TP2. El checkpoint publicado corresponde al paso 20, con el codigo del arbol `mopdRL` en el commit `f1bcc9eb82a8bcc7a053a23dd1afcae82fb591e4` (paquete `bsc-olmo-base-opd-2026-10-26`).

## Capacidades

- Generacion de texto y razonamiento matematico de multiples pasos, con cadenas de razonamiento largas (hasta 32.768 tokens de respuesta).
- Resolucion de problemas de competicion matematica (AIME, HMMT) en formato de respuesta larga con verificacion via `math_verify`.
- Modo "think" heredado del profesor Olmo-3.1-32B-Think, segun el nombre del checkpoint y el template de chat incluido.
- Uso del template de chat propio del estudiante (`chat_template.jinja` incluido en el repo).
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso con herramientas: no disponible; el SFT de origen se etiqueta explicitamente como "notool".
- Capacidades multilingues: no disponible.
- Capacidades de vision o audio: no disponibles.

## Casos de uso

- Investigacion en destilacion on-policy: el checkpoint sirve como referencia reproducible de un paso intermedio (paso 20) del pipeline OPD, util para estudiar la evolucion de la KL inversa y la calidad de los rollouts durante el entrenamiento.
- Experimentos de razonamiento matematico en entornos academicos: permite comparar el efecto de la destilacion desde un profesor de 32B sobre un estudiante de 7B en tareas tipo AIME/HMMT, con el scorer `math_verify` ya validado por el autor.
- Generacion de soluciones matematicas paso a paso en cuadernos de investigacion: el modelo produce cadenas de razonamiento largas (hasta 32.768 tokens), adecuadas para analizar trazas de razonamiento y errores intermedios.
- Base para posteriores etapas de SFT o RL: al ser un checkpoint intermedio con licencia Apache 2.0, puede usarse como punto de partida para ajustes adicionales con recompensas verificables.
- Despliegue en hardware de una sola GPU para prototipos: con 7.298 millones de parametros y pesos en safetensors de ~14,6 GB, cabe en GPUs consumer de 24 GB o superiores para inferencia en precision reducida, lo que facilita pruebas locales.
- Evaluacion de la transferencia de capacidades entre modelos de distinto tamano: util para medir cuanto razonamiento matematico de un profesor de 32B se retiene en un estudiante de 7B tras solo 20 pasos de OPD.
- Generacion de datos sinteticos de matematicas: los rollouts del modelo pueden servir como datos de entrenamiento o como negativo en filtrado de calidad, dado que el autor documenta el proceso de muestreo.

## Benchmarks y rendimiento

Resultados publicados por el autor (mean@8 accuracy en %, temperatura 0,6, top_p 0,95, prompt 768 / respuesta 32.768 tokens, scorer `math_verify`, template de chat del estudiante, ejecutado en NVIDIA H100 80GB HBM3 en float16):

| Benchmark | Resultado |
|---|---|
| AIME 2025 | 27,08 |
| AIME 2026 | 19,17 |
| HMMT Feb 2025 | 12,50 |

No se han publicado resultados de benchmarks comparativos con otros modelos en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: ~14,6 GB en float16/BF16 (pesos safetensors); en cuantizacion de 8 bits se reduciria a ~7,3 GB y en 4 bits a ~3,7 GB, aunque no se han publicado pesos cuantizados oficiales.
- GPU recomendadas: H100 80GB (configuracion usada por el autor para evaluacion), A100 40/80GB, L40S, RTX 4090 (24 GB) para inferencia en precision reducida.
- Cabe en GPU consumer: si, en RTX 4090 (24 GB), RTX 3090 (24 GB) y GPUs con 16 GB o mas usando cuantizacion.
- Opciones de despliegue: vLLM (usado por el autor para el estudiante y el profesor), llama.cpp/Ollama (previa conversion a GGUF, no publicada), TGI (compatible con safetensors, no verificado). FSDP solo relevante para entrenamiento.
- Latencia y throughput estimados: no disponibles. El autor documenta generacion de hasta 32.768 tokens por respuesta, lo que implica latencias altas en decodificacion autoregresiva sin datos de tokens/s publicados.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | AIME 2025 | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| opd_sfto7nemo_s600_olmo31_32b_think_ot3math-step20 | 7,298B | no disponible | 27,08 | Apache 2.0 | Hugging Face (36 descargas) |
| allenai/Olmo-3.1-32B-Think (profesor) | 32B | no disponible | no disponible | no disponible en la informacion | Hugging Face |
| mhseo2/sft_olmo3base7b_nemotronmathv2_high_notool_n204800-step600 (estudiante base) | 7,298B | no disponible | no disponible | no disponible en la informacion | Hugging Face |

No se dispone de datos de benchmarks de los modelos comparables en la informacion proporcionada, por lo que no es posible establecer una comparacion cuantitativa de rendimiento.

## Limitaciones y advertencias

- Checkpoint intermedio: corresponde al paso 20 de un proceso de destilacion on-policy, no a un modelo final; su rendimiento puede mejorar o degradarse en pasos posteriores.
- Resultados modestos: 27,08% en AIME 2025 y 12,50% en HMMT Feb 2025 con mean@8, muy por debajo de lo esperable en modelos maduros de razonamiento, lo que sugiere que no es apto para produccion sin ajuste adicional.
- Riesgo de alucinacion: al ser un modelo de razonamiento matematico entrenado sin recompensa de tarea, puede generar cadenas de razonamiento plausibles pero incorrectas; se recomienda verificacion externa (por ejemplo, con `math_verify`).
- Sesgos conocidos: no disponibles; no se ha publicado informacion sobre composicion demografica del dataset ni evaluaciones de sesgo.
- Limitaciones de contexto e idioma: no se ha publicado la longitud de contexto nativa ni la cobertura de idiomas; las evaluaciones usan prompts de 768 tokens, lo que no valida ventanas mas largas.
- Especializacion estrecha: el SFT de origen es "notool" y centrado en matematicas, por lo que el soporte de tool calling y de tareas generales no esta garantizado.
- Licencia: Apache 2.0 permite uso comercial, pero al derivar de OLMo 3 Base 7B conviene verificar las condiciones de los modelos base y del dataset Nemotron-Math-v2.
- Reproducibilidad: el autor documenta hashes SHA-256 de todos los ficheros y el commit del codigo, lo que facilita la verificacion, pero no se publican curvas de entrenamiento ni evaluaciones intermedias.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/mhseo2/opd_sfto7nemo_s600_olmo31_32b_think_ot3math-step20
- Modelo base (estudiante SFT): https://huggingface.co/mhseo2/sft_olmo3base7b_nemotronmathv2_high_notool_n204800-step600
- Modelo profesor: https://huggingface.co/allenai/Olmo-3.1-32B-Think
- Repositorio de codigo `mopdRL`: no disponible como enlace directo; commit referenciado `f1bcc9eb82a8bcc7a053a23dd1afcae82fb591e4` (paquete `bsc-olmo-base-opd-2026-10-26`)
- Paper de OLMo 3: no disponible en la informacion proporcionada
- Dataset OpenThoughts3: no disponible como enlace directo en la informacion proporcionada
- Dataset Nemotron-Math-v2: no disponible como enlace directo en la informacion proporcionada
