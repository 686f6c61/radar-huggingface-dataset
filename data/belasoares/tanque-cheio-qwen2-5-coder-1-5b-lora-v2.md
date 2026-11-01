# belasoares/tanque-cheio-qwen2.5-coder-1.5b-lora-v2

## Resumen

`tanque-cheio-qwen2.5-coder-1.5b-lora-v2` es un adaptador LoRA (PEFT) sobre el modelo base `Qwen/Qwen2.5-Coder-1.5B-Instruct`, desarrollado por el autor independiente belasoares. Su propósito es muy concreto: convertir preguntas en portugués sobre los precios de combustibles publicados por la ANP (Agencia Nacional de Petróleo de Brasil) en consultas SQL válidas para DuckDB. No es un modelo de propósito general, sino un ajuste fino especializado en una tarea text-to-SQL de dominio cerrado.

La relevancia del trabajo es empírica: según la model card, el adaptador alcanza un 80,7% de execution accuracy (EX) en un conjunto de test de 150 preguntas revisadas a mano, lo que lo sitúa estadísticamente empatado con `Qwen2.5-Coder-32B-Instruct` sin ajustar (78,0%, McNemar p = 0,63), pero ejecutándose en una sola GPU T4 con un pico de 3,1 GiB de VRAM y una latencia mediana de 4,3 s. Es decir, reproduce el rendimiento de un modelo veinte veces mayor en esta tarea específica a una fracción del coste.

El adaptador tiene 18,5 M de parámetros entrenables (r=16, alpha=32) sobre el modelo base de 1,5B, se entrenó con QLoRA 4-bit nf4 en una GPU gratuita de Kaggle durante 5,3 horas, y se distribuye con licencia Apache 2.0. El repositorio ocupa 0,1 GB (solo los pesos del adaptador, no el modelo base).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre transformer decoder-only Qwen2.5-Coder-1.5B-Instruct |
| Parametros totales | 18,5 M entrenables en el adaptador; ~1,5B en el modelo base |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 1.280 tokens de secuencia de entrenamiento; contexto nativo del base Qwen2.5-Coder-1.5B (no especificado en la model card) |
| Tipos de cuantizacion | QLoRA 4-bit nf4 (double quant, compute fp16) para entrenamiento; inferencia en fp16 con adaptador fundido |
| Idiomas soportados | Portugués (pt) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador se aplica sobre `Qwen/Qwen2.5-Coder-1.5B-Instruct` (commit `2e1fd397ee46e1388853d2af2c993145b0f1098a`), un transformer decoder-only de 1,5B parámetros especializado en código. El ajuste LoRA usa r=16, alpha=32, dropout 0,05 y bias none, con 18,5 M parámetros entrenables sobre los módulos `q_proj`, `k_proj`, `v_proj`, `o_proj`, `gate_proj`, `up_proj` y `down_proj`. El entrenamiento se hizo con QLoRA en 4-bit nf4 (double quant, compute fp16) mediante bitsandbytes, optimizador AdamW con lr 2e-4, scheduler cosine, warmup 3%, weight decay 0, grad norm 1,0, batch efectivo de 16 (4 × 4 de acumulación) y 2 épocas (1.242 pasos). La pérdida se calcula solo sobre la respuesta (SQL + `<|im_end|>`). Todo el entrenamiento corrió en una única GPU T4 de Kaggle durante 5,3 horas con un pico de 2,5 GiB.

Los datos de entrenamiento proceden del dataset `belasoares/tanque-cheio` (config `pairs`, split `train`): 10.448 pares pregunta → SQL generados mediante plantillas parametrizadas con valores reales de la base de datos y validados por ejecución. Cubren 40 intenciones de la v1 más 17 nuevas orientadas a los patrones que la v1 fallaba (posición en ranking, acumulados, "tanto en X como en Y", "todos los…", participación porcentual, región × estado y refuerzo de convenciones de columnas). La distribución es 28% fáciles, 36% medios y 36% difíciles (632 con función de ventana). Se eliminaron pares similares al dev, dev2 o test (`token_set_ratio ≥ 85` en la pregunta o SQL normalizada idéntica). Los precios provienen de la Serie Histórica de Precios de Combustibles de la ANP, con recolecciones entre 2024-10-01 y 2026-09-30. La división fue 9.926 entrenamiento / 522 validación (5%, seed 42), con pérdida final de 0,0089 en entrenamiento y 0,0018 en validación.

## Capacidades

- Generación de SQL para DuckDB a partir de preguntas en portugués sobre precios de combustibles de la ANP.
- Comprensión de esquemas de base de datos inyectados en el prompt (instrucción, schema, valores cerrados, fecha de referencia y convenciones de respuesta).
- Manejo de consultas con funciones de ventana (rankings, acumulados), agregaciones, filtros por región y estado, y participaciones porcentuales.
- Generación de SQL válida en el 98,7% de los casos del test.
- No soporta tool calling, function calling ni razonamiento multi-paso general: es un adaptador de tarea única.
- Capacidad multilingüe limitada al portugués (idioma declarado en la model card).
- No dispone de modo thinking, visión ni audio.

## Casos de uso

- Consulta conversacional de precios de combustibles: un usuario pregunta en portugués "qual o preço médio da gasolina em São Paulo em março de 2025" y el adaptador genera la SQL que se ejecuta contra DuckDB para devolver el resultado. Es adecuado porque el prompt del proyecto inyecta el esquema y las convenciones, y el adaptador fue entrenado exactamente con ese formato.
- Asistente interno para analistas de datos: integrado en un notebook o panel, permite a analistas sin conocimiento de SQL obtener consultas sobre la serie histórica de la ANP sin escribir código.
- Generación de SQL en pipelines de informes: dado que el 98,7% de las salidas son SQL válida, puede encadenarse a un ejecutor DuckDB con validación sintáctica previa y reintento controlado (aunque la model card indica que un reintento tras error no mejora la EX).
- Prototipado de sistemas text-to-SQL de dominio cerrado: sirve como referencia de cómo un adaptador pequeño (18,5 M parámetros) sobre un base de 1,5B puede igualar a modelos de 32B en una tarea acotada, útil para evaluar la viabilidad de enfoques ligeros.
- Despliegue en hardware modesto: al caber en 3,1 GiB de VRAM y ejecutarse en una T4, es apto para entornos con GPU de gama baja o incluso para experimentación en GPUs de consumo con cuantización adicional del base.
- Docencia y reproducción de experimentos: el proyecto publica dataset, configuración de entrenamiento, notebook y clasificación de los 29 errores del test, lo que lo convierte en un caso de estudio reproducible de QLoRA aplicado a text-to-SQL.

## Benchmarks y rendimiento

Resultados publicados en la model card sobre un test de 150 preguntas (50 fáciles, 60 medias, 40 difíciles), con decodificación greedy, `max_new_tokens = 384`, ejecución en T4 (el 32B en 2 GPUs). Los ajustados corren en fp16 con el adaptador fundido; los grandes, en 4 bits nf4 (lo que supone un suelo de su rendimiento en fp16).

| Sistema | EX | IC 95% | EX difícil | p50 | GPUs | Pico GPU | US$ / 1.000 |
|---|---|---|---|---|---|---|---|
| Qwen2.5-Coder-1.5B-Instruct (base) | 12,0% | 7,3–17,3% | 0,0% | 3,1 s | 1 | 3,1 GiB | 0,34 |
| Qwen2.5-Coder-7B-Instruct (nf4) | 40,7% | 32,7–48,7% | 12,5% | 8,8 s | 1 | 5,8 GiB | 0,89 |
| Qwen2.5-Coder-14B-Instruct (nf4) | 60,0% | 52,0–68,0% | 25,0% | 16,2 s | 1 | 10,2 GiB | 1,87 |
| Qwen2.5-Coder-32B-Instruct (nf4) | 78,0% | 71,3–84,7% | 37,5% | 29,1 s | 2 | 10,7 GiB por GPU | 6,22 |
| 1,5B + adaptador v1 | 76,0% | 68,7–82,7% | 47,5% | 4,3 s | 1 | 3,1 GiB | 0,42 |
| 1,5B + este adaptador (v2) | 80,7% | 74,0–86,7% | 62,5% | 4,3 s | 1 | 3,1 GiB | 0,42 |

Otros datos reportados: EX tolerante (acepta columnas de más) del 85,3%; SQL válida del 98,7%. Frente al 32B sin ajustar, +2,7 p.p. sin diferencia significativa (McNemar p = 0,63; 21 preguntas solo las acierta el v2 y 17 solo el 32B). Frente al 14B sin ajustar, +20,7 p.p. (p < 0,001). Frente al adaptador v1, +4,7 p.p. (11 solo v2, 4 solo v1; p = 0,12, no significativo), con mejora en difícil (47,5% → 62,5%) y medio (76,7% → 83,3%) y empeoramiento en fácil (98,0% → 92,0%). La estimación de coste usa latencia media × 0,35 US$/hora de T4 bajo demanda en Google Cloud (solo GPU, sin VM).

## Requisitos de hardware

- VRAM estimada para inferencia: 3,1 GiB de pico en fp16 con el adaptador fundido (medido en T4). Con el base en 4-bit nf4 el consumo sería inferior, aunque no se reporta cifra exacta.
- GPU recomendadas: NVIDIA T4 (la usada en los experimentos), y por capacidad, cualquier GPU con ≥4 GiB de VRAM. A100 y H100 son sobredimensionadas para este adaptador.
- Cabe en GPU de consumo: sí, en tarjetas con al menos 4 GiB (por ejemplo, GTX 1650 de 4 GiB, RTX 3050, RTX 4060). No se han publicado pruebas en estas tarjetas.
- Opciones de despliegue: al ser un adaptador PEFT, requiere cargar el base `Qwen/Qwen2.5-Coder-1.5B-Instruct` con transformers + peft. No se documenta soporte para vLLM, llama.cpp, Ollama o TGI; el flujo previsto es el del repositorio `tanque-cheio` (prompt construido por `tanque.prompting.build_prompt`).
- Latencia y throughput: latencia mediana de 4,3 s por consulta en T4 (misma que el adaptador v1). No se publica throughput agregado (consultas/segundo).

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | EX en el test del proyecto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este adaptador (v2) | 18,5 M sobre base 1,5B | 1.280 tokens de entrenamiento | 80,7% | Apache 2.0 | HuggingFace (PEFT) |
| Qwen2.5-Coder-32B-Instruct (nf4) | 32B | no disponible en la información | 78,0% | Apache 2.0 (según el modelo base de Qwen) | HuggingFace |
| Qwen2.5-Coder-14B-Instruct (nf4) | 14B | no disponible en la información | 60,0% | Apache 2.0 (según el modelo base de Qwen) | HuggingFace |
| Adaptador v1 del mismo autor | 18,5 M sobre base 1,5B | no disponible en la información | 76,0% | Apache 2.0 | HuggingFace (PEFT) |

La comparación es válida únicamente dentro del dominio del test (preguntas sobre precios de la ANP en portugués); no implica superioridad general del adaptador frente a los modelos Qwen de mayor tamaño en otras tareas.

## Limitaciones y advertencias

- El adaptador solo funciona con el prompt del proyecto (`tanque.prompting.build_prompt`): instrucción, esquema de la base de datos, valores cerrados, fecha de referencia y convenciones de respuesta. Sin ese prompt, el modelo no conoce las tablas y la calidad se degrada.
- Dominio muy restringido: precios de combustibles de la ANP en portugués y SQL para DuckDB. No es un modelo de propósito general ni un text-to-SQL genérico.
- Idioma limitado al portugués; no se ha evaluado en castellano ni en otros idiomas.
- Sesgos: no se documentan análisis de sesgos. Al estar entrenado con plantillas y datos de la ANP, puede heredar sesgos de cobertura geográfica o temporal de la serie histórica.
- Riesgo de alucinación: el 1,3% de las salidas no son SQL válida y el 19,3% no alcanza la respuesta correcta en el test; un reintento tras error no mejora la EX según la model card.
- La comparación con el 32B se hizo con este último en 4 bits, lo que infravalora su rendimiento real en fp16; el empate estadístico debe interpretarse con esa cautela.
- Licencia Apache 2.0 en el adaptador, pero el uso comercial debe verificar también la licencia del modelo base Qwen2.5-Coder-1.5B-Instruct.
- El repositorio solo contiene el adaptador (0,1 GB); es necesario descargar el modelo base por separado.
- Fecha de creación del repositorio en HuggingFace: 2026-10-30, con 31 descargas y 0 likes en el momento de la consulta; no hay validación externa por parte de la comunidad.

## Enlaces

- HuggingFace del adaptador: https://huggingface.co/belasoares/tanque-cheio-qwen2.5-coder-1.5b-lora-v2
- Adaptador v1: https://huggingface.co/belasoares/tanque-cheio-qwen2.5-coder-1.5b-lora
- Dataset de entrenamiento: https://huggingface.co/datasets/belasoares/tanque-cheio
- Repositorio del proyecto: https://github.com/belasoaress/tanque-cheio
- Informe completo de resultados: https://github.com/belasoaress/tanque-cheio/blob/main/results/report.md
- Análisis de errores y cambios de la v2: https://github.com/belasoaress/tanque-cheio/blob/main/results/training-v2.md
- Configuración de entrenamiento: https://github.com/belasoaress/tanque-cheio/blob/main/configs/train-v2.toml
- Notebook de fine-tuning: https://github.com/belasoaress/tanque-cheio/blob/main/notebooks/02_finetune.ipynb
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-Coder-1.5B-Instruct
