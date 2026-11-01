# belasoares/tanque-cheio-qwen2.5-coder-1.5b-lora

## Resumen

`belasoares/tanque-cheio-qwen2.5-coder-1.5b-lora` es un adaptador LoRA (QLoRA) sobre el modelo base `Qwen/Qwen2.5-Coder-1.5B-Instruct`, desarrollado por el usuario belasoares. Su función es convertir preguntas en portugués sobre los precios históricos de combustibles publicados por la ANP (Agencia Nacional de Petróleo de Brasil) en consultas SQL ejecutables contra una base de datos DuckDB. El adaptador no es un modelo autónomo: requiere el prompt estructurado del proyecto `tanque-cheio`, que incluye el esquema de la base de datos, los valores cerrados y las convenciones de respuesta.

El modelo resuelve un problema muy concreto de text-to-SQL en dominio cerrado: pasa de una precisión de ejecución (EX) del 12,0% con el modelo base a un 76,0% con el adaptador, sobre un conjunto de test de 150 preguntas revisadas manualmente. El entrenamiento se realizó con QLoRA de 4 bits en una única GPU T4 gratuita de Kaggle, en 3,5 horas, con un pico de 2,4 GiB de VRAM.

Por su tamaño (1.5B parámetros, adaptador de 18,5 M parámetros entrenables) y su licencia Apache 2.0, es una opción realista para desplegar un asistente de consultas sobre datos públicos de combustibles en infraestructura modesta. El autor ha publicado una versión v2 con mejoras menores (80,7% EX) y el proyecto completo es reproducible desde GitHub y Kaggle.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2.5) con adaptador LoRA sobre el modelo base |
| Parámetros totales | 1.5B (modelo base) + 18,5 M entrenables en el adaptador |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible en la información proporcionada (secuencia de entrenamiento: 1.152 tokens) |
| Tipos de cuantización | QLoRA 4-bit nf4, double quant, compute fp16 (bitsandbytes) durante el entrenamiento; el adaptador se distribuye en safetensors |
| Idiomas soportados | portugués (pt) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA); requiere el modelo base Qwen2.5-Coder-1.5B-Instruct |

## Arquitectura y entrenamiento

El adaptador se aplica sobre `Qwen/Qwen2.5-Coder-1.5B-Instruct`, un transformer decoder-only de 1.5B parámetros especializado en código. El entrenamiento usa QLoRA con cuantización 4-bit nf4 y double quantization (bitsandbytes), con LoRA de rango 16, alpha 32, dropout 0,05 y bias none. Los módulos objetivo son `q_proj`, `k_proj`, `v_proj`, `o_proj`, `gate_proj`, `up_proj` y `down_proj`, es decir, todas las proyecciones de atención y del MLP.

Los datos de entrenamiento provienen del dataset `belasoares/tanque-cheio`, config `pairs`, split `train`: 8.217 pares pregunta → SQL generados mediante plantillas parametrizadas con valores reales de la base de datos (40 intenciones; 34% fáciles, 40% medias, 26% difíciles) y validados por ejecución. Se eliminaron pares similares al dev o al test (`token_set_ratio ≥ 85` en la pregunta o SQL normalizada idéntica). Los precios proceden de la Serie Histórica de Precios de Combustibles de la ANP, con recogidas entre 2024-10-01 y 2026-09-30.

La optimización usó AdamW con lr 2e-4, scheduler cosine, warmup del 3%, weight decay 0, grad norm 1,0, batch efectivo de 16 (4 × 4 de acumulación), 2 épocas (976 pasos) y pérdida calculada solo sobre la respuesta (SQL + `<|im_end|>`). La división fue de 7.806 ejemplos de entrenamiento y 411 de validación de pérdida (5%, seed 42). La pérdida final fue de 0,0093 en entrenamiento y 0,0016 en validación. El entrenamiento se ejecutó en una GPU T4 de Kaggle durante 3,5 horas con un pico de 2,4 GiB.

## Capacidades

- Generación de SQL para DuckDB a partir de preguntas en portugués sobre precios de combustibles de la ANP.
- Comprensión del esquema de la base de datos inyectado en el prompt (tablas, columnas, tipos y valores cerrados).
- Manejo de convenciones de respuesta específicas del proyecto (formato de salida, fecha de referencia).
- Razonamiento de un solo paso orientado a la construcción de consultas; no está diseñado para razonamiento multi-paso general.
- Capacidad multilingüe limitada al portugués; el modelo base soporta más idiomas, pero el adaptador está entrenado solo en portugués.
- No se documenta soporte de tool calling, function calling, agentes, visión, audio ni modo thinking en la información proporcionada.

## Casos de uso

- Asistente de consulta de precios de combustibles: un usuario pregunta en portugués "Qual o preço médio do etanol em Curitiba no último mês?" y el modelo genera la SQL que se ejecuta contra DuckDB y devuelve el resultado. Es adecuado porque el adaptador ha sido entrenado específicamente con el esquema y las convenciones de esta base de datos.
- Panel de análisis para periodistas o ciudadanos: integrado en una interfaz web, permite a usuarios sin conocimientos de SQL obtener respuestas sobre la evolución de precios por municipio, producto y período, reduciendo la barrera técnica.
- Automatización de informes periódicos: el modelo puede generar consultas para extraer series temporales de precios que alimenten gráficos o informes automatizados, dado que el dominio y el esquema son fijos.
- Validación de pipelines de datos: al generar SQL ejecutable y comparable con consultas de referencia, sirve para comprobar la integridad de la base DuckDB tras cada actualización de datos de la ANP.
- Educación y demostración de text-to-SQL en portugués: el proyecto incluye notebook de entrenamiento, dataset y evaluación reproducible, lo que lo convierte en un caso de estudio útil para quienes quieran replicar un flujo QLoRA completo en una GPU gratuita.
- Investigación sobre evaluación de text-to-SQL en dominio cerrado: el conjunto de test de 150 preguntas con clasificación por dificultad y análisis de errores permite estudiar el comportamiento de modelos pequeños frente a modelos grandes (el autor compara con Qwen2.5-Coder-32B-Instruct sin ajuste).

## Benchmarks y rendimiento

Resultados sobre un test de 150 preguntas escritas y revisadas manualmente (50 fáciles, 60 medias, 40 difíciles), nunca vistas en entrenamiento ni en la selección de modelo. EX = execution accuracy: la SQL generada se ejecuta y el resultado se compara con el de la SQL de referencia. Misma T4, misma sesión, decodificación greedy, `max_new_tokens = 256`, adaptador fusionado en el base antes de generar.

| Sistema | EX | EX fácil | EX medio | EX difícil | SQL válida | Bloqueada | p50 (ms) | p95 (ms) | US$ / 1.000 |
|---|---|---|---|---|---|---|---|---|---|
| Qwen2.5-Coder-1.5B-Instruct (base) | 12,0% | 28,0% | 6,7% | 0,0% | 22,0% | 3,3% | 2.638 | 6.518 | 0,2896* |
| + este adaptador | **76,0%** | 98,0% | 76,7% | 47,5% | 96,0% | 2,0% | 3.726 | 8.172 | 0,3660* |

\* Estimación: latencia media × US$ 0,35 por hora de una GPU T4 bajo demanda en Google Cloud (solo GPU, sin VM). En Kaggle la ejecución no tuvo coste.

En el dev (50 preguntas, usado para elegir el modelo y comprobar el entrenamiento): EX de 14,0% → 74,0%. En la revaluación de la v2 del proyecto con reglas nuevas (`max_new_tokens = 384` y un reintento tras error), este adaptador obtiene 76,0% (IC 95% 68,7–82,7%), frente al 78,0% de Qwen2.5-Coder-32B-Instruct sin ajuste (empate estadístico, p = 0,74). La versión v2 del adaptador alcanza 80,7% EX en el mismo test (diferencia no significativa frente a este, McNemar p = 0,12).

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo base de 1.5B en fp16 requiere aproximadamente 3 GB; en 4-bit, alrededor de 1–1,5 GB. El adaptador añade unos 74 MB en fp16 (18,5 M parámetros).
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM para fp16; T4, RTX 3060, RTX 4060, RTX 4090, A100 o H100 son válidas. El entrenamiento documentado se hizo en una T4 con 2,4 GiB de pico.
- Cabe en GPU de consumo: sí, en tarjetas con 4 GB o más (GTX 1650, RTX 3050, RTX 4060, etc.).
- Opciones de despliegue: transformers + PEFT (con `merge_and_unload`), vLLM, llama.cpp u Ollama si se convierte el modelo fusionado a GGUF. El proyecto proporciona un flujo con `uv` y scripts propios (`tanque data build`, `tanque.prompting.build_prompt`, `tanque.sql.execute`).
- Latencia y throughput: p50 de 3.726 ms y p95 de 8.172 ms por consulta en T4 con `max_new_tokens = 256` y decodificación greedy, según la tabla del autor. No se documenta throughput agregado.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | EX en el test del proyecto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| tanque-cheio-qwen2.5-coder-1.5b-lora (este) | 1.5B + 18,5 M LoRA | no disponible | 76,0% (v1, 256 tokens); 76,0% (reglas v2) | Apache 2.0 | HuggingFace + GitHub |
| tanque-cheio-qwen2.5-coder-1.5b-lora-v2 | 1.5B + LoRA | no disponible | 80,7% | Apache 2.0 | HuggingFace |
| Qwen2.5-Coder-1.5B-Instruct (base, sin ajuste) | 1.5B | no disponible | 12,0% | Apache 2.0 | HuggingFace |
| Qwen2.5-Coder-32B-Instruct (sin ajuste) | 32B | no disponible | 78,0% (reglas v2) | Apache 2.0 | HuggingFace |

## Limitaciones y advertencias

- El adaptador no funciona de forma autónoma: requiere el prompt del proyecto `tanque.prompting.build_prompt`, que inyecta el esquema de la base de datos, los valores cerrados, la fecha de referencia y las convenciones de respuesta. Sin ese prompt, el modelo no conoce las tablas.
- Entrenado exclusivamente en portugués y en el dominio de precios de combustibles de la ANP; no se espera un buen rendimiento en otros idiomas ni en otros esquemas de base de datos.
- Riesgo de alucinación en consultas SQL: aunque el 96,0% de las SQL generadas son válidas sintácticamente, solo el 76,0% producen el resultado correcto; el 2,0% de las consultas quedan bloqueadas.
- Rendimiento notablemente inferior en preguntas difíciles (47,5% EX) frente a fáciles (98,0%) y medias (76,7%).
- La licencia Apache 2.0 permite uso comercial, pero el modelo base Qwen2.5-Coder-1.5B-Instruct también es Apache 2.0; conviene verificar los términos de los datos de la ANP si se redistribuyen.
- El modelo tiene solo 36 descargas y 0 likes en HuggingFace en el momento de la consulta; es un proyecto de nicho con poca validación externa.
- El autor recomienda la versión v2 para nuevos despliegues; este adaptador v1 se mantiene por reproducibilidad.
- No se documentan sesgos específicos más allá de los inherentes al modelo base y al dominio de datos brasileño.

## Enlaces

- HuggingFace del adaptador: https://huggingface.co/belasoares/tanque-cheio-qwen2.5-coder-1.5b-lora
- Versión v2 del adaptador: https://huggingface.co/belasoares/tanque-cheio-qwen2.5-coder-1.5b-lora-v2
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-Coder-1.5B-Instruct
- Dataset de entrenamiento: https://huggingface.co/datasets/belasoares/tanque-cheio
- Repositorio del proyecto: https://github.com/belasoaress/tanque-cheio
- Informe de resultados: https://github.com/belasoaress/tanque-cheio/blob/main/results/report.md
- Configuración de entrenamiento: https://github.com/belasoaress/tanque-cheio/blob/main/configs/train.toml
- Registro de entrenamiento: https://github.com/belasoaress/tanque-cheio/blob/main/results/training.md
- Notebook de entrenamiento en Kaggle: https://www.kaggle.com/code/belasoares/tanque-cheio-finetune
