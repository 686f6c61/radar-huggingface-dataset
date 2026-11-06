# mhseo2/opd_sfto7amr1_s1000_olmo31_32b_think_amr1math-step20

## Resumen

El modelo `opd_sfto7amr1_s1000_olmo31_32b_think_amr1math-step20` es un checkpoint intermedio de destilacion on-policy (on-policy distillation, OPD) publicado por el usuario `mhseo2`. El estudiante es un ajuste fino supervisado (SFT) de OLMo 3 Base de 7B sobre el conjunto de matematicas AM-DeepSeek-R1-0528 (204.800 filas), identificado como `mhseo2/sft_olmo3base7b_amr1_0528_math_n204800-step1000`. El profesor es `allenai/Olmo-3.1-32B-Think` (revision `97ade57a9cc5`). El objetivo es transferir el comportamiento de razonamiento de un modelo docente de 32B a un estudiante de 7B sin usar recompensas de tarea, solo divergencia KL.

El checkpoint corresponde al paso 20 de entrenamiento. No es un modelo final ni una release estable: la propia model card indica que las evaluaciones (AIME 2025, AIME 2026 y HMMT Feb 2025, mean@8) estan pendientes de ejecucion en los "sky eval workers". Por tanto, se trata de un artefacto de investigacion util para reproducir el pipeline de OPD, no de un modelo listo para produccion.

La relevancia actual es metodologica: documenta con detalle el esquema de destilacion (prompts del propio conjunto SFT, 60 prompts x 4 rollouts por paso, temperatura 1, respuestas de hasta 32.768 tokens, KL reversa por token con top-32 del profesor, learning rate 5e-6 constante, AdamW con weight decay 0.01) y el stack de entrenamiento (FSDP para el estudiante y vLLM para el profesor con TP2 en 2 nodos de 4 H100 en BSC MareNostrum 5). El modelo tiene 7.298.011.136 parametros y licencia Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia OLMo 3; detalles de capas y atencion no disponibles en la informacion proporcionada) |
| Parametros totales | 7.298.011.136 (7,3B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible en la model card; las respuestas de entrenamiento llegan a 32.768 tokens |
| Tipos de cuantizacion | no disponible (solo se publican pesos safetensors; no hay GGUF ni cuantizaciones oficiales) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (3 shards: model-00001-of-00003, model-00002-of-00003, model-00003-of-00003) |
| Tamano del repo | 14,6 GB |
| Modelo base (estudiante) | mhseo2/sft_olmo3base7b_amr1_0528_math_n204800-step1000 |
| Modelo profesor | allenai/Olmo-3.1-32B-Think (revision 97ade57a9cc5) |
| Paso de entrenamiento | 20 |
| Fecha de creacion | 2026-11-02 |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only de la familia OLMo 3, inicializado desde un SFT de OLMo 3 Base 7B sobre 204.800 filas de matematicas de AM-DeepSeek-R1-0528. Sobre ese punto de partida se aplica destilacion on-policy: en cada paso se muestrean 60 prompts del propio conjunto SFT del estudiante y se generan 4 rollouts por prompt con temperatura 1 y hasta 32.768 tokens de respuesta. La perdida es una KL reversa por token entre la distribucion del estudiante y la del profesor, calculada con la aproximacion k1 y limitada al top-32 del profesor. No hay recompensa de tarea ni RLHF/DPO en esta fase.

El entrenamiento usa learning rate constante de 5e-6, optimizador AdamW con weight decay 0.01, y se ejecuto en BSC MareNostrum 5 con 2 nodos de 4 H100: el estudiante con FSDP y el profesor servido con vLLM en tensor parallel 2. El codigo corresponde al arbol `mopdRL` en el commit `f1bcc9eb82a8bcc7a053a23dd1afcae82fb591e4` (paquete `bsc-olmo-base-opd-2026-10-26`). Al ser el paso 20 de un proceso mas largo, el checkpoint no representa necesariamente un punto de convergencia.

## Capacidades

- Generacion de texto y razonamiento matematico orientado a problemas tipo competicion (AIME, HMMT), heredado del conjunto SFT y del profesor Olmo-3.1-32B-Think.
- Modo "think": el profesor es un modelo de razonamiento y la destilacion busca transferir cadenas de pensamiento largas; el chat template incluido (`chat_template.jinja`) define el formato de conversacion.
- Generacion de respuestas extensas: el entrenamiento contempla rollouts de hasta 32.768 tokens, por lo que el modelo esta expuesto a razonamientos largos.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no documentado; solo se infiere razonamiento multi-paso dentro de una misma respuesta de matematicas.
- Capacidades multilingues: no disponibles; el conjunto de entrenamiento es de matematicas y no se declaran idiomas.
- Vision o audio: no disponible.

## Casos de uso

- Investigacion en destilacion on-policy: sirve como checkpoint de referencia para reproducir el pipeline OPD (KL reversa top-32, rollouts a temperatura 1) y comparar pasos intermedios frente al modelo final.
- Generacion de soluciones matematicas paso a paso: adecuado para experimentos de razonamiento largo en problemas de competicion, dado el entrenamiento sobre AM-DeepSeek-R1-0528 math y respuestas de hasta 32.768 tokens.
- Linea base para evaluacion de modelos de 7B en AIME/HMMT: util para medir la brecha entre un estudiante de 7B destilado de un profesor de 32B y el propio profesor.
- Estudio de transferencia de cadenas de pensamiento: permite analizar como evoluciona el estilo de razonamiento del estudiante a lo largo de los pasos de OPD.
- Fine-tuning posterior: al estar en safetensors y licencia Apache 2.0, puede servir de inicializacion para SFT adicional en dominios matematicos o cientificos.
- Docencia y divulgacion: ejemplo documentado de un entrenamiento distribuido con FSDP + vLLM en infraestructura HPC (MareNostrum 5), replicable en entornos academicos.
- No recomendado para atencion al cliente, agentes de produccion ni tareas generales: no hay evaluaciones publicadas ni evidencia de calidad fuera de matematicas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica que las evaluaciones (mean@8 en AIME 2025, AIME 2026 y HMMT Feb 2025) estan en cola en los "sky eval workers" y se anadiran cuando terminen.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16/FP16: aproximadamente 14,6 GB solo de pesos (7,3B parametros x 2 bytes), mas KV cache y activaciones; en la practica se recomiendan 24 GB o mas.
- Cuantizacion a 8 bits: alrededor de 7-8 GB de pesos; a 4 bits, alrededor de 4 GB, aunque no se publican cuantizaciones oficiales (no hay GGUF en el repo).
- GPU recomendadas: H100 o A100 para entrenamiento e inferencia de referencia; el entrenamiento se hizo con 2 nodos x 4 H100 (FSDP + vLLM TP2).
- GPU de consumo: cabe en RTX 4090 (24 GB) en BF16 con contexto moderado, y en GPUs de 16 GB solo con cuantizacion de 8 bits o inferior.
- Opciones de despliegue: vLLM (usado en el entrenamiento para el profesor), TGI o transformers; llama.cpp/Ollama requeririan conversion a GGUF, no incluida en el repo.
- Latencia y throughput: no disponibles; dependen del contexto (hasta 32.768 tokens de respuesta) y del backend.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| opd_sfto7amr1_s1000_olmo31_32b_think_amr1math-step20 | 7,3B | no disponible | OPD de matematicas sobre OLMo 3 7B | Apache 2.0 | Hugging Face, 0 descargas |
| allenai/Olmo-3.1-32B-Think (profesor) | 32B (no confirmado en la informacion) | no disponible | Razonamiento general | no disponible en la informacion | Hugging Face (referencia del autor) |
| mhseo2/sft_olmo3base7b_amr1_0528_math_n204800-step1000 (estudiante base) | 7,3B | no disponible | SFT de matematicas | Apache 2.0 | Hugging Face |

No se dispone de datos de rendimiento comparativos entre estos modelos en la informacion proporcionada.

## Limitaciones y advertencias

- Checkpoint intermedio (paso 20) de un proceso de destilacion; no hay evidencia de convergencia ni de calidad final.
- Sin benchmarks publicados: no se puede afirmar su rendimiento en AIME, HMMT ni en tareas generales.
- Entrenado exclusivamente sobre matematicas (AM-DeepSeek-R1-0528); el rendimiento fuera de ese dominio es desconocido y probablemente degradado respecto al modelo base.
- Riesgo de alucinacion en razonamientos largos: la destilacion por KL no impone verificacion de resultados; el modelo puede producir cadenas de pensamiento plausibles con conclusiones incorrectas.
- Idiomas no declarados: no hay garantia de calidad en castellano ni en otros idiomas distintos del ingles de los datos de matematicas.
- Longitud de contexto no documentada; aunque el entrenamiento usa respuestas de hasta 32.768 tokens, no se especifica la ventana de atencion del modelo.
- Sin cuantizaciones oficiales (GGUF, AWQ, GPTQ): el despliegue en hardware de consumo requiere conversion manual.
- Licencia Apache 2.0 permite uso comercial, pero la ausencia de evaluaciones hace arriesgado su uso en produccion sin validacion propia.
- Modelo con 0 descargas y 0 likes: no hay comunidad ni soporte; posibles errores no corregidos.

## Enlaces

- Hugging Face: https://huggingface.co/mhseo2/opd_sfto7amr1_s1000_olmo31_32b_think_amr1math-step20
- Modelo base (estudiante): https://huggingface.co/mhseo2/sft_olmo3base7b_amr1_0528_math_n204800-step1000
- Modelo profesor: https://huggingface.co/allenai/Olmo-3.1-32B-Think
- Codigo de entrenamiento: arbol `mopdRL`, commit `f1bcc9eb82a8bcc7a053a23dd1afcae82fb591e4` (paquete `bsc-olmo-base-opd-2026-10-26`); no se proporciona URL en la informacion disponible.
