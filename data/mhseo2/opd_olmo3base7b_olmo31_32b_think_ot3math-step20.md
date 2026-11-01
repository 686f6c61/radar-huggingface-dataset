# mhseo2/opd_olmo3base7b_olmo31_32b_think_ot3math-step20

## Resumen

`opd_olmo3base7b_olmo31_32b_think_ot3math-step20` es un checkpoint de destilacion on-policy (OPD, *on-policy distillation*) desarrollado por el usuario `mhseo2`. Parte del modelo base `mhseo2/Olmo-3-1025-7B-opd`, una variante de Olmo-3-1025-7B de AI2 sin SFT, y lo alinea hacia el profesor `allenai/Olmo-3.1-32B-Think` mediante perdida de divergencia KL inversa por token calculada sobre las propias rollouts del estudiante. El resultado presentado corresponde al paso 20 de entrenamiento, con 7.298.011.136 parametros y pesos en safetensors (14,6 GB en tres ficheros).

El objetivo es transferir capacidad de razonamiento matematico de un modelo profesor de 32B a un estudiante de 7B sin disponer de respuestas de referencia: solo se usan preguntas de OpenThoughts3 (53.105) y la senal del profesor. Esto lo hace relevante para la comunidad que investiga destilacion y alineamiento de modelos abiertos con recursos limitados, ya que demuestra un pipeline reproducible sobre infraestructura europea (BSC MareNostrum 5) y con licencia Apache-2.0.

La ficha cubre exclusivamente la informacion publicada en la model card y en los metadatos de HuggingFace; cualquier dato no presente se marca como no disponible. No se han publicado detalles sobre composicion del dataset de preentrenamiento original ni sobre el proceso de SFT del profesor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de Olmo-3-1025-7B; detalles de capas y atencion no disponibles) |
| Parametros totales | 7.298.011.136 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible en la model card; el entrenamiento usa respuestas de hasta 32.768 tokens y prompt de 768 tokens en evaluacion |
| Tipos de cuantizacion | no disponible (solo se publican pesos safetensors en float; no se listan GGUF ni cuantizaciones) |
| Idiomas soportados | no disponible (la model card no declara idiomas; el entrenamiento se centra en matematicas en ingles de OpenThoughts3) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (3 shards: model-00001-of-00003, model-00002-of-00003, model-00003-of-00003) |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only de 7,3B parametros heredado de Olmo-3-1025-7B, sin modificaciones estructurales declaradas. El entrenamiento consiste en destilacion on-policy: en cada paso se muestrean 60 prompts de OpenThoughts3 math (sin respuestas) y se generan 4 rollouts por prompt con temperatura 1 y hasta 32.768 tokens de respuesta. Sobre esas rollouts, el estudiante recibe una perdida de divergencia KL inversa por token respecto al profesor `allenai/Olmo-3.1-32B-Think` (revision `97ade57a9cc5`), calculada con top-32 del profesor (variante k1). No hay recompensa de tarea ni verificador de respuestas: la unica senal es la distribucion del profesor.

El optimizador es AdamW con learning rate constante de 5e-6 y weight decay 0.01. El checkpoint publicado corresponde al paso 20. La infraestructura fue BSC MareNostrum 5 con 2 nodos x 4 H100: estudiante en FSDP mas vLLM, y profesor servido con vLLM en tensor parallelism 2. El codigo asociado es el arbol `mopdRL` en el commit `f1bcc9eb82a8bcc7a053a23dd1afcae82fb591e4` (paquete `bsc-olmo-base-opd-2026-10-26`). No se documentan innovaciones adicionales como decodificacion especulativa o atencion lineal.

## Capacidades

- Generacion de texto y razonamiento matematico: el modelo ha sido destilado especificamente sobre problemas de OpenThoughts3 math y evaluado en competiciones tipo AIME y HMMT.
- Modo "think": el nombre del checkpoint y el profesor (`Olmo-3.1-32B-Think`) indican un formato de razonamiento extendido, con respuestas de hasta 32.768 tokens.
- Plantilla de chat propia (`chat_template.jinja` incluida en el repo) para formatear conversaciones de un solo turno orientadas a resolucion de problemas.
- Tool calling / function calling: no disponible; la model card no lo declara.
- Soporte de agentes y multi-step reasoning: no disponible como capacidad declarada; el modo think permite cadenas de razonamiento largas, pero no se documenta integracion con herramientas.
- Capacidades multilingues: no disponibles; el dataset de destilacion es de matematicas en ingles.
- Vision o audio: no disponible.

## Casos de uso

- Evaluacion de pipelines de destilacion on-policy: sirve como referencia reproducible (paso 20, hiperparametros y commit de codigo publicados) para comparar tecnicas de OPD frente a SFT clasico en modelos de 7B.
- Generacion de soluciones matematicas paso a paso en entornos educativos: el modo think y el entrenamiento sobre OpenThoughts3 permiten producir razonamientos extensos para problemas de nivel olimpiada, utiles en tutoria automatizada con revision humana.
- Benchmarking interno de modelos abiertos de 7B en tareas de matematica: con la plantilla de chat y el scorer `math_verify` se puede replicar la evaluacion mean@8 a temperatura 0,6 y top_p 0,95.
- Investigacion sobre alineamiento sin datos etiquetados: al no usar recompensa de tarea, es un caso de estudio para medir cuanto conocimiento transfiere un profesor de 32B a un estudiante de 7B solo con preguntas.
- Base para fine-tuning posterior con RLHF/DPO o verificadores: el checkpoint Apache-2.0 puede servir de inicializacion para experimentos que anadan recompensa verificable sobre matematicas.
- Despliegue en infraestructura con GPUs de 80 GB para inferencia de referencia: los pesos en float16 caben en una H100 80GB, lo que permite reproducir la evaluacion publicada (float16, H100 80GB HBM3).

## Benchmarks y rendimiento

Resultados publicados en la model card: mean@8 accuracy (%), temperatura 0,6, top_p 0,95, prompt 768 / respuesta 32.768 tokens, scorer `math_verify`, plantilla de chat del estudiante, ejecutado en NVIDIA H100 80GB HBM3 en float16.

| Benchmark | Resultado (mean@8, %) |
|---|---|
| AIME 2025 | 39,58 |
| AIME 2026 | 39,58 |
| HMMT Feb 2025 | 24,17 |

No se han publicado en la informacion disponible resultados comparativos con otros modelos (MMLU, HumanEval, GSM8K, etc.) ni curvas de entrenamiento por paso.

## Requisitos de hardware

- VRAM estimada para inferencia en float16: aproximadamente 14,6 GB de pesos mas overhead de activaciones y cache KV; con contexto de 32.768 tokens la cache KV incrementa el consumo de forma significativa (no se publica el numero de capas ni cabezas para calcularla con precision).
- GPU recomendadas: NVIDIA H100 80GB HBM3 (configuracion usada en la evaluacion oficial); A100 80GB como alternativa equivalente en memoria.
- Cabe en GPU consumer: si, en GPUs con 24 GB o mas (RTX 4090, RTX 3090) en float16 siempre que se limite la longitud de contexto; para contextos largos de 32K se recomienda cuantizacion o GPUs de 48-80 GB.
- Opciones de despliegue: vLLM (usado por el autor para estudiante y profesor), FSDP para entrenamiento; no se documentan integraciones con llama.cpp, Ollama o TGI, y no se publican pesos GGUF.
- Latencia y throughput: no disponibles; la model card no reporta tiempos de generacion ni tokens por segundo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| opd_olmo3base7b_olmo31_32b_think_ot3math-step20 | 7,3B | no disponible (entrenamiento hasta 32.768 tokens de respuesta) | Destilacion on-policy hacia Olmo-3.1-32B-Think | Apache-2.0 | HuggingFace (34 descargas) |
| mhseo2/Olmo-3-1025-7B-opd (modelo base) | 7,3B (derivado) | no disponible | Base sin SFT del que parte este checkpoint | no disponible en la informacion | HuggingFace |
| allenai/Olmo-3.1-32B-Think (profesor) | 32B | no disponible | Razonamiento con modo think de AI2 | no disponible en la informacion | HuggingFace |

No se dispone de datos de benchmarks de los modelos comparables en la informacion proporcionada, por lo que no es posible una comparacion cuantitativa de rendimiento.

## Limitaciones y advertencias

- Checkpoint intermedio: corresponde al paso 20 de un proceso de destilacion; no es un modelo final ni ha pasado por SFT, RLHF o DPO posteriores.
- Entrenado solo con preguntas de matematicas de OpenThoughts3: el dominio esta muy acotado y el rendimiento fuera de matematicas no esta evaluado.
- Riesgo de alucinacion: al no usar verificador ni recompensa de tarea, el modelo puede producir razonamientos plausibles pero incorrectos; los resultados de AIME (39,58%) y HMMT (24,17%) implican una tasa de fallo alta en problemas dificiles.
- Idiomas: no se declara soporte multilingue; el entrenamiento es en ingles, por lo que el rendimiento en castellano no esta garantizado.
- Sesgos: no se documentan evaluaciones de sesgo, toxicidad o seguridad.
- Licencia Apache-2.0: permite uso comercial, pero el usuario debe verificar las condiciones del modelo base y del profesor, cuyas licencias no se detallan en la informacion disponible.
- Reproducibilidad: la evaluacion depende de la plantilla de chat incluida, del scorer `math_verify` y de la configuracion mean@8; cambios en estos elementos alteran los resultados.
- Sin cuantizaciones publicadas: no hay GGUF ni pesos de 4/8 bits oficiales, lo que limita el despliegue en hardware modesto sin conversion manual.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/mhseo2/opd_olmo3base7b_olmo31_32b_think_ot3math-step20
- Modelo base: https://huggingface.co/mhseo2/Olmo-3-1025-7B-opd
- Profesor: https://huggingface.co/allenai/Olmo-3.1-32B-Think (revision `97ade57a9cc5`)
- Codigo: arbol `mopdRL`, commit `f1bcc9eb82a8bcc7a053a23dd1afcae82fb591e4` (paquete `bsc-olmo-base-opd-2026-10-26`); no se proporciona URL en la informacion disponible
- Dataset de prompts: OpenThoughts3 math (53.105 preguntas, sin respuestas); no se proporciona URL en la informacion disponible
- No se han encontrado papers, blogs ni demos adicionales en la informacion proporcionada.
