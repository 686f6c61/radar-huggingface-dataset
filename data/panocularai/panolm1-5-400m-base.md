# PanocularAI/PanoLM1.5-400M-Base

## Resumen

PanoLM1.5-400M-Base es un modelo de lenguaje causal de tipo base (sin ajuste por instrucciones) desarrollado por PanocularAI, con 388.480.672 parámetros reales y orientado a dispositivos de borde ("edge device friendly", según su model card). Su rasgo diferencial es la arquitectura híbrida: de sus 24 capas, 20 emplean KDA (Kimi Delta Attention) de atención lineal y solo 4 (capas 5, 11, 17 y 23, con indexación desde cero) usan multi-head latent attention (MLA). Esta combinación busca reducir el coste computacional y de memoria asociado a la atención cuadrática clásica manteniendo cierta capacidad de recuperación de información del contexto.

El modelo se ha preentrenado sobre una mezcla ponderada de tres corpus web en inglés: FineWeb-Edu (peso 0,45), DCLM (0,30) y FinePDFs-Edu (0,25), cada uno con un subconjunto de 100.000 millones de tokens. La ventana de contexto de entrenamiento declarada es de 2.048 tokens. No se han publicado datos sobre fases de alineación (RLHF, DPO) ni sobre el número total de tokens efectivamente procesados.

Su relevancia actual reside en la exploración de arquitecturas híbridas de atención lineal en la escala de ~400M de parámetros, un tamaño que permite experimentación económica y despliegue en hardware modesto. La licencia Apache 2.0 facilita su uso comercial, aunque al tratarse de un modelo base requiere ajuste posterior para tareas conversacionales o de instrucciones. La dependencia de `trust_remote_code=True` y de kernels Triton de `flash-linear-attention` condiciona su integración en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal híbrido: 20 capas con KDA (atención lineal) y 4 capas con MLA (multi-head latent attention) |
| Parametros totales | 388.480.672 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 2.048 tokens (contexto de entrenamiento) |
| Tipos de cuantizacion | no disponible (repo en safetensors; no se documentan GGUF ni otras variantes) |
| Idiomas soportados | inglés (`en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (tamaño del repo: 0,8 GB) |

## Arquitectura y entrenamiento

El modelo sigue una topología de transformer causal con atención híbrida. La mayoría de capas (20 de 24) utilizan KDA, una variante de atención lineal derivada de Kimi Delta Attention que sustituye el mecanismo de atención completo por una recurrencia lineal con actualizaciones tipo delta, lo que reduce el coste de memoria del estado de atención a un tamaño constante respecto a la longitud de secuencia. Las cuatro capas restantes (índices 5, 11, 17 y 23) emplean MLA, el mecanismo de atención latente popularizado por DeepSeek, que comprime las claves y valores en una representación latente de baja dimensión. La intercalación de capas MLA cada seis capas busca recuperar capacidad de atención global selectiva sin renunciar al ahorro de las capas lineales.

El preentrenamiento se realizó sobre una mezcla ponderada de tres corpus en inglés: FineWeb-Edu (45 %), DCLM (30 %) y FinePDFs-Edu (25 %), cada uno con un subconjunto de 100.000 millones de tokens. La model card no especifica el número total de tokens vistos, la composición exacta del tokenizador, ni si hubo fases de ajuste supervisado, RLHF o DPO; al ser un modelo base, se asume que no las hubo. Tampoco se documentan innovaciones adicionales como decodificación especulativa o modos de razonamiento extendido.

## Capacidades

- Generación de texto autoregresiva en inglés, como modelo base sin ajuste por instrucciones.
- Razonamiento de sentido común y respuesta a preguntas de opción múltiple (evaluado en ARC, HellaSwag, PIQA, Winogrande y CommonsenseQA).
- Recuperación asociativa y extracción de información desde un documento incluido en el prompt (suite Based, FDA, SWDE, SQuAD completion).
- Capacidad multilingüe limitada al inglés declarado; no se documentan otros idiomas.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso explícito.
- No se documentan capacidades de visión, audio ni modo de pensamiento (thinking mode).
- El contexto operativo está acotado a 2.048 tokens, lo que limita tareas de contexto largo.

## Casos de uso

- Extracción de campos en documentos: el modelo obtiene 0,6670 en FDA y 0,6814 en SWDE (métrica `contains`), por lo que puede emplearse para copiar valores concretos (fechas, nombres, importes) de un texto incluido en el prompt en pipelines de procesamiento documental, siempre que el documento quepa en 2.048 tokens.
- Clasificación y respuesta a preguntas de opción múltiple: con 0,5471 en ARC-Easy y 0,6665 en PIQA, es utilizable como componente de filtrado o preselección en sistemas de QA de bajo coste, con ajuste fino previo para mejorar la precisión.
- Prototipado e investigación en arquitecturas lineales: su tamaño de ~388M y su mezcla KDA/MLA lo convierten en un banco de pruebas económico para estudiar el equilibrio entre atención lineal y atención latente en tareas de recuperación asociativa.
- Despliegue en dispositivos de borde: el autor lo describe como "edge device friendly"; con 0,8 GB en safetensors y 388M de parámetros, es candidato para inferencia en GPU de consumo o entornos con memoria limitada, previa cuantización (no documentada oficialmente).
- Generación de texto asistida en dominios educativos: al haberse entrenado con FineWeb-Edu y FinePDFs-Edu, puede servir como base para ajuste fino en tareas de resumen o generación de material didáctico en inglés.
- Base para ajuste supervisado (SFT): al ser un modelo base con licencia Apache 2.0, es adecuado como punto de partida para fine-tuning orientado a instrucciones en inglés dentro de productos comerciales.
- Evaluación comparativa de mecanismos de atención: útil en laboratorios que necesiten una referencia pequeña con atención híbrida para contrastar latencia y precisión frente a transformers densos de tamaño similar.

## Benchmarks y rendimiento

Resultados 0-shot con `lm-evaluation-harness`; `acc_norm` salvo en commonsense_qa y winogrande, que reportan `acc`.

| Tarea | Métrica | Valor | Error estándar |
|---|---|---:|---|
| arc_challenge | acc_norm | 0,2799 | ± 0,0131 |
| arc_easy | acc_norm | 0,5471 | ± 0,0102 |
| commonsense_qa | acc | 0,2015 | ± 0,0115 |
| hellaswag | acc_norm | 0,4286 | ± 0,0049 |
| piqa | acc_norm | 0,6665 | ± 0,0110 |
| winogrande | acc | 0,5201 | ± 0,0140 |

Recuperación asociativa (suite Based), decodificación greedy, sin penalización por repetición, prompts truncados por la izquierda a 2.048 tokens:

| Tarea | Métrica | Valor | Error estándar |
|---|---|---:|---|
| fda | contains | 0,6670 | ± 0,0142 |
| swde | contains | 0,6814 | ± 0,0140 |
| squad_completion | contains | 0,4042 | ± 0,0090 |
| based_triviaqa | contains | 0,5379 | ± 0,0121 |
| based_drop | contains | 0,2415 | ± 0,0094 |
| based_nq_2048 | contains | 0,1387 | ± 0,0062 |

No se han publicado comparaciones directas con otros modelos en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16/bf16: en torno a 0,8 GB para los pesos (388M parámetros), más overhead de activaciones y del estado de atención; el repo ocupa 0,8 GB en safetensors.
- GPU recomendadas: cualquier GPU NVIDIA con soporte CUDA y al menos ~2 GB de VRAM libre para fp16; los kernels Triton de `flash-linear-attention` (RMSNorm) requieren tensores en CUDA según la model card.
- Cabe en GPU de consumo: sí, en tarjetas como RTX 3060, RTX 4060, RTX 4090 y similares; también en GPUs integradas con suficiente memoria compartida, aunque el rendimiento no está documentado.
- Opciones de despliegue: `transformers` (versión 5.8.1 según la model card) con `trust_remote_code=True`; requiere `torch==2.12.0` y `flash-linear-attention==0.5.0`. No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI, y al no haber pesos GGUF publicados, llama.cpp/Ollama no son viables sin conversión propia.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de datos de benchmarks de modelos comparables en la información proporcionada, por lo que la comparación cuantitativa no está disponible. A modo de contexto estructural:

| Modelo | Parámetros | Contexto | Arquitectura | Licencia | Disponibilidad |
|---|---:|---|---|---|---|
| PanoLM1.5-400M-Base | 388M | 2.048 | Híbrida KDA + MLA | Apache 2.0 | Hugging Face |
| Alternativas de ~400M densas | no disponible | no disponible | Transformer denso | variable | no disponible |
| Alternativas híbridas lineales | no disponible | no disponible | Atención lineal/híbrida | variable | no disponible |

No se han identificado en la información disponible modelos directamente comparables con la misma combinación KDA/MLA a esta escala.

## Limitaciones y advertencias

- Es un modelo base: no está ajustado por instrucciones ni alineado, por lo que no debe usarse directamente en conversación sin SFT o RLHF previos.
- Riesgo elevado de alucinación y de generación incoherente en tareas abiertas, coherente con sus resultados en benchmarks de sentido común (ARC-Challenge 0,2799; CommonsenseQA 0,2015).
- Contexto limitado a 2.048 tokens; los prompts más largos deben truncarse, lo que degrada tareas de recuperación en documentos extensos.
- Solo inglés declarado; no hay evidencia de competencia multilingüe.
- Requiere `trust_remote_code=True` y ejecución de código personalizado del repositorio, lo que implica revisión de seguridad antes de usarlo en producción.
- Dependencia de versiones muy concretas (`torch==2.12.0`, `transformers==5.8.1`, `flash-linear-attention==0.5.0`) y de kernels Triton que solo funcionan en tensores CUDA, lo que complica el despliegue en CPU o en entornos con versiones distintas.
- No se documentan sesgos específicos ni evaluación de seguridad; los corpus web (FineWeb-Edu, DCLM, FinePDFs-Edu) pueden arrastrar sesgos presentes en los datos.
- No hay pesos cuantizados oficiales (GGUF, AWQ, GPTQ) publicados, lo que limita el despliegue en herramientas de inferencia populares.
- La licencia Apache 2.0 permite uso comercial, pero no exime de las obligaciones de atribución ni de las condiciones de los datos de entrenamiento subyacentes.
- El modelo tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no existe validación comunitaria independiente.

## Enlaces

- Hugging Face: https://huggingface.co/PanocularAI/PanoLM1.5-400M-Base
- lm-evaluation-harness: https://github.com/EleutherAI/lm-evaluation-harness
- No se han encontrado en la información disponible enlaces a papers, blogs, repositorios adicionales ni demos del autor.
