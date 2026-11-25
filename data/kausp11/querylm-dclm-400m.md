# Kausp11/querylm-dclm-400m

## Resumen
QueryLM 400M (DCLM-Edu) es un modelo de lenguaje base de tipo decoder-only entrenado desde cero por el autor independiente Kausp11, pensado como artefacto de investigación sobre modelos que aprenden a formular búsquedas durante el preentrenamiento. Su particularidad es que el corpus de entrenamiento (DCLM-Edu) fue anotado con bloques de búsqueda insertados en los puntos donde una consulta externa ayudaría a predecir el texto siguiente: el modelo aprendió a escribir la consulta y a utilizar el pasaje recuperado, pero nunca a generar el pasaje en sí.

Arquitectónicamente sigue el estilo nanochat: 14 capas, anchura 1.280, 10 cabezas, feed-forward de 5.120 y dimensión de cabeza 128, con una ventana de contexto de 4.095 tokens. El autor reporta 401,2 M de parámetros, aunque el checkpoint almacenado en safetensors contiene 842,2 M por la inclusión de value embeddings. El presupuesto de preentrenamiento es modesto: 10.100 actualizaciones y 10,6 mil millones de tokens procesados (6,8 mil millones de tokens de documento), con 3,09e19 FLOPs en bf16.

Es relevante ahora porque propone un mecanismo explícito y ligero de aumento por recuperación (RAG) integrado en el propio preentrenamiento, en lugar de añadirse a posteriori mediante prompting o fine-tuning. El modelo se distribuye con licencia Apache 2.0 y requiere `trust_remote_code=True` para cargar el `modeling_nanochat.py` incluido en el repositorio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only estilo nanochat (14 capas, width 1.280, 10 cabezas, FFN 5.120, head dim 128) |
| Parametros totales | 401,2 M reportados por el autor; 842,2 M almacenados en safetensors (incluye value embeddings) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 4.095 tokens |
| Tipos de cuantizacion | no disponible (el autor solo documenta ejecución en bfloat16) |
| Idiomas soportados | inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (repo de 1,7 GB); requiere `trust_remote_code=True` |
| Tokenizer | SmolLM2 + 4 tokens especiales (vocabulario 49.156) |
| Tokens especiales | `<WEB_QUERY>` 49152, `</WEB_QUERY>` 49153, `<WEB_RESPONSE>` 49154, `</WEB_RESPONSE>` 49155 |

## Arquitectura y entrenamiento
El modelo es un transformer decoder-only denso de 14 capas con atención multi-cabeza de 10 cabezas y dimensión de cabeza 128, feed-forward de 5.120 y embeddings de valor, siguiendo la implementación nanochat (commit upstream `92d63d4`) con una rama local para datos de búsqueda. El tokenizer parte del de SmolLM2 y añade cuatro tokens especiales que delimitan los bloques de consulta y respuesta, con un vocabulario final de 49.156 entradas.

El preentrenamiento se realizó sobre DCLM-Edu anotado con bloques de búsqueda por un modelo anotador (Gemma 4 E4B-it con un adaptador LoRA). El anotador marca posiciones donde una búsqueda ayudaría (probabilidad de inserción mínima de 0,05, separación mínima de 40 caracteres) y redacta una consulta de hasta 24 tokens; los pasajes provienen de recuperación BM25 sobre el corpus web público Sphere y se recortan mediante limpieza extractiva. Una inserción solo se conserva si el pasaje solapa el texto posterior del documento (ROUGE-1 F1 mínimo de 0,1 contra los siguientes 260 caracteres). La función de pérdida cubre el texto, la consulta y las etiquetas de consulta, pero no las etiquetas de respuesta ni el pasaje, de modo que el modelo aprende a formular consultas y a consumir pasajes, no a generarlos.

El optimizador es Muon para los pesos matriciales (LR pico 0,02828) y AdamW para embeddings y cabeza de salida, con lotes de 256 secuencias de 4.095 tokens (1.048.320 tokens por actualización), 40 pasos de warmup, fase constante y decaimiento lineal hasta el 5 % del pico. El presupuesto total es de 10.100 actualizaciones, 10,6 mil millones de tokens procesados (6,8 mil millones de tokens de documento) y 3,09e19 FLOPs en bf16. El checkpoint publicado corresponde al paso 10.100 de la ejecución `dclm_nc_v1_d14_all_chin10k`, que ramifica en el paso 9.000 desde una ejecución de 400 M más larga.

## Capacidades
- Generación de texto causal en inglés como modelo base, sin formato de chat.
- Formulación autónoma de consultas de búsqueda: el modelo emite `<WEB_QUERY>consulta</WEB_QUERY>` cuando detecta que necesita información externa.
- Consumo de pasajes recuperados insertados por el llamante entre `<WEB_RESPONSE>...</WEB_RESPONSE>` para continuar la generación.
- Aprendizaje few-shot mediante ejemplos en el prompt (pares pregunta-respuesta), tal como demuestra el script de la model card.
- Respuesta a preguntas factuales simples cuando se le proporciona el pasaje adecuado (por ejemplo, capital de Australia a partir de un pasaje sobre Canberra).
- No soporta tool calling genérico, agentes multi-paso, visión, audio ni modos de razonamiento extendido; la única "herramienta" integrada es la búsqueda web.
- Capacidad multilingüe limitada al inglés según la model card.

## Casos de uso
- Investigación sobre RAG integrado en preentrenamiento: sirve como punto de comparación frente a un baseline de mismo cómputo sin bloques de búsqueda (el autor menciona que existe pero aún no lo ha publicado), para medir si el modelo aprende a decidir cuándo buscar.
- Prototipado de pipelines de recuperación aumentada: el flujo de tres pasos (generar consulta, recuperar con el retriever propio, insertar pasaje y continuar) permite experimentar con BM25, búsqueda web o índices vectoriales sin modificar el modelo.
- Estudio de la dinámica de decisión de búsqueda: al estar el mecanismo en el preentrenamiento, se pueden analizar las posiciones donde el modelo abre un bloque de consulta y correlacionarlas con la incertidumbre factual del texto.
- Generación de consultas de búsqueda como subtarea aislada: el modelo puede emplearse únicamente para producir consultas cortas (hasta 24 tokens) a partir de contexto, útil para evaluar calidad de query generation.
- Docencia y experimentación con arquitecturas nanochat: al ser un modelo pequeño (401 M reportados) con código de modelado incluido, es adecuado para estudiar atención, embeddings de valor y schedules de Muon/AdamW en entornos con recursos limitados.
- Evaluación de anotadores sintéticos de datos: el pipeline de anotación con Gemma 4 E4B-it + LoRA y el filtro por ROUGE-1 es replicable y sirve para estudiar cómo afecta la calidad de las inserciones al comportamiento del modelo.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente que los resultados de evaluación se añadirán más adelante.

## Requisitos de hardware
- VRAM estimada para inferencia: con 842,2 M parámetros almacenados, en bf16 el checkpoint ocupa aproximadamente 1,7 GB; en fp32, unos 3,4 GB. La ejecución en CPU con bfloat16 está documentada por el autor (torch 2.8.0, transformers 4.56.0).
- GPU recomendadas: cualquier GPU consumer con 4 GB o más de VRAM es suficiente para bf16; una RTX 3060, RTX 4060 o superior permite ejecución holgada. Para lotes grandes o entrenamiento, se recomiendan A100 o H100.
- Cabe en GPU consumer: sí, con margen amplio, incluso en GPUs de gama baja.
- Opciones de despliegue: `transformers` con `trust_remote_code=True` es la vía documentada. No se mencionan soportes para vLLM, llama.cpp, Ollama o TGI; al requerir código personalizado (`modeling_nanochat.py`), la compatibilidad con esos motores no está garantizada.
- Latencia y throughput estimados: no disponible. El autor solo documenta una ejecución en CPU que produce una consulta y una respuesta corta, sin cifras de latencia.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Enfoque | Disponibilidad |
|---|---|---|---|---|---|
| QueryLM 400M (DCLM-Edu) | 401,2 M reportados / 842,2 M almacenados | 4.095 | Apache 2.0 | Preentrenamiento con bloques de búsqueda insertados | Hugging Face, requiere `trust_remote_code` |
| SmolLM2 (familia) | 135 M / 360 M / 1,7 B | 8.192 (en la variante de 1,7 B) | Apache 2.0 | Transformer decoder-only estándar, sin búsqueda integrada | Hugging Face, ampliamente soportado |
| Modelos base de ~400 M tipo Pythia-410M | 410 M | 2.048 | Apache 2.0 | Transformer decoder-only estándar | Hugging Face, soporte nativo en transformers |

La comparación con SmolLM2 y Pythia es relevante por tamaño y licencia, pero ninguno de ellos incorpora el mecanismo de búsqueda en el preentrenamiento, que es la aportación diferencial de QueryLM. No se dispone de datos de rendimiento comparativo porque el autor no ha publicado evaluaciones.

## Limitaciones y advertencias
- Es un modelo base sin formato de chat: no está alineado con instrucciones ni con preferencias humanas; el autor remite a la versión SFT (`Kausp11/querylm-dclm-400m-sft-search`) para uso conversacional.
- El modelo no genera pasajes: el llamante debe aportar el retriever y el pasaje. La calidad de la respuesta depende por completo de la recuperación externa.
- Ventana de contexto de solo 4.095 tokens, insuficiente para documentos largos o conversaciones multi-turno extensas.
- Entrenado únicamente en inglés; no se documenta soporte para otros idiomas.
- Presupuesto de entrenamiento reducido (10,6 mil millones de tokens), muy por debajo de los estándares actuales; es esperable una cobertura factual y un rendimiento limitados en tareas generales.
- Riesgo de alucinación alto en preguntas factuales cuando no se proporciona pasaje, dado el tamaño y el corpus educativo filtrado.
- No se han publicado evaluaciones ni análisis de sesgos; se desconoce el comportamiento en dominios sensibles.
- Requiere `trust_remote_code=True`, lo que implica ejecutar código del repositorio; el autor recomienda fijar `revision=` a un commit revisado.
- La licencia Apache 2.0 permite uso comercial, pero al ser un artefacto de investigación sin evaluaciones, no se recomienda su despliegue en producción sin validación previa.
- El baseline de mismo cómputo sin búsqueda no está publicado, lo que dificulta atribuir mejoras al mecanismo de búsqueda.

## Enlaces
- Modelo en Hugging Face: https://huggingface.co/Kausp11/querylm-dclm-400m
- Versión SFT con búsqueda: https://huggingface.co/Kausp11/querylm-dclm-400m-sft-search
- Dataset de preentrenamiento: https://huggingface.co/datasets/HuggingFaceTB/dclm-edu
- Corpus de recuperación Sphere: https://github.com/facebookresearch/Sphere
- Repositorio nanochat: https://github.com/karpathy/nanochat
- Paper referenciado en los tags (arXiv:2611.26809): https://arxiv.org/abs/2611.26809
