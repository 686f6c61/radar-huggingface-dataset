# ApocalypseParty/G4-31B-SCE-OPT31-StyleC50

## Resumen

G4-31B-SCE-OPT31-StyleC50 es un modelo de lenguaje multimodal (image-text-to-text) de 31.273.088.876 parámetros, publicado por el usuario ApocalypseParty en Hugging Face. No se trata de un entrenamiento desde cero, sino de una fusión de pesos (model merge) generada con la herramienta mergekit mediante el método SCE (Selective Contrastive Ensemble, arXiv:2408.07990). El modelo resultante combina tres checkpoints derivados de la familia Gemma 4 de 31B: un modelo base "uncensored/heretic" y dos variantes propias del autor.

El interés técnico de esta ficha es acotado: el repositorio no incluye model card descriptiva más allá de la configuración del merge, no declara licencia ni idiomas, y no aporta resultados de benchmarks. Su relevancia es, por tanto, la de un experimento de fusión de pesos sobre una arquitectura multimodal de 31B, útil para quien quiera reproducir o evaluar estrategias de merging selectivo (top-k al 15 %) sobre modelos Gemma 4.

La información disponible permite documentar con rigor la arquitectura de origen, el método de fusión y los requisitos de hardware estimados, pero cualquier afirmación sobre calidad, capacidades específicas o rendimiento medido debe tratarse con cautela y marcarse como no verificada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (image-text-to-text), derivada de la familia Gemma 4; detalles internos no disponibles |
| Parametros totales | 31.273.088.876 (31,27B) |
| Parametros activos | No aplica (no es MoE según la información disponible) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No declarados por el autor; al estar en bfloat16 son aplicables cuantizaciones estándar (GGUF/AWQ/GPTQ) mediante herramientas externas, sin garantía de soporte oficial |
| Idiomas soportados | No disponibles |
| Licencia | No disponible |
| Formato de pesos | safetensors (bfloat16); repo de 62,6 GB |
| Metodo de creacion | Merge SCE (mergekit), select_topk = 0.15 |
| Modelo base del merge | llmfan46/gemma-4-31B-it-uncensored-heretic |
| Modelos fusionados | ApocalypseParty/G4-31B-M_OPT31, ApocalypseParty/G4-mmv2-31B-Style-c50 |
| Libreria | transformers |
| Pipeline | image-text-to-text |

## Arquitectura y entrenamiento

El modelo no se ha entrenado: es el resultado de una fusión de pesos con mergekit usando el método SCE (Selective Contrastive Ensemble), descrito en arXiv:2408.07990. La configuración publicada toma como base llmfan46/gemma-4-31B-it-uncensored-heretic y fusiona dos checkpoints adicionales del mismo autor (G4-31B-M_OPT31 y G4-mmv2-31B-Style-c50), con selección top-k del 15 % de los parámetros y salida en bfloat16. El tokenizador se hereda del modelo base.

La arquitectura subyacente corresponde a la familia Gemma 4 en su variante de 31B con capacidades multimodales (pipeline image-text-to-text), pero el repositorio no documenta número de tokens de entrenamiento, composición del dataset, ni si los modelos de origen aplicaron RLHF, DPO u otras etapas de alineamiento. El calificativo "uncensored-heretic" en el modelo base sugiere una reducción deliberada de los mecanismos de rechazo, pero no hay documentación técnica que lo cuantifique.

## Capacidades

- Generación de texto conversacional en formato instruct, heredada del modelo base Gemma 4 IT.
- Procesamiento de entradas imagen-texto (pipeline image-text-to-text declarado en los metadatos).
- Razonamiento y generación de código: presumible de la familia Gemma 4, no verificado en este checkpoint.
- Tool calling / function calling: no documentado en este repositorio.
- Soporte de agentes y razonamiento multi-paso: no documentado.
- Capacidades multilingües: no declaradas; los idiomas del modelo base no se especifican en la información disponible.
- Modo "thinking" explícito: no documentado.
- Comportamiento "uncensored": inferido del nombre del modelo base, sin evaluación publicada.

## Casos de uso

- Investigación sobre fusión de pesos: reproducción del pipeline mergekit con SCE y top-k 0.15 sobre modelos Gemma 4 de 31B, para estudiar cómo afecta la selección selectiva de parámetros a las capacidades del modelo resultante.
- Evaluación comparativa de merges: servir como checkpoint intermedio en una batería de evaluación que compare el modelo base "heretic" con las variantes fusionadas, midiendo degradación o mejora en tareas estándar.
- Prototipado de asistentes multimodales: uso del pipeline image-text-to-text para experimentar con descripción de imágenes y diálogo sobre ellas, siempre con validación manual dado que no hay benchmarks publicados.
- Generación de texto sin restricciones en entornos controlados: el origen "uncensored" lo hace adecuado para investigación sobre comportamiento de modelos con filtros reducidos, no para despliegues de cara al público sin moderación externa.
- Base para cuantización y despliegue en local: al estar en bfloat16 y safetensors, puede convertirse a GGUF para llama.cpp u Ollama y probarse en hardware de consumo, aunque el soporte de la arquitectura multimodal en esos runtimes debe verificarse empíricamente.
- Fine-tuning posterior: punto de partida para ajuste supervisado o DPO en dominios concretos, aprovechando que el merge ya incorpora estilos y comportamientos de tres checkpoints.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El repositorio no incluye evaluaciones de MMLU, HumanEval, GSM8K ni métricas multimodales, ni comparaciones con el modelo base o con los checkpoints fusionados.

## Requisitos de hardware

- VRAM en bfloat16: aproximadamente 62,6 GB solo para pesos, más overhead de activaciones y KV cache; en la práctica se requieren 2× A100 80GB, 2× H100 80GB o una H200/B200 de memoria suficiente.
- Cuantización a 8 bits: en torno a 32-35 GB, viable en una A100 40GB o en 2× RTX 4090 24GB con tensor parallelism.
- Cuantización a 4 bits: en torno a 17-20 GB, cabe en una RTX 4090 24GB o RTX 3090 24GB, con margen limitado para contexto largo.
- GPU recomendadas: A100 80GB, H100 80GB, H200 para bfloat16; RTX 4090, RTX 3090 o L40S para cuantizaciones de 4-8 bits.
- Despliegue: transformers (soporte declarado), vLLM y TGI previsiblemente compatibles si la arquitectura Gemma 4 multimodal está soportada por esas versiones; llama.cpp/Ollama solo si existe conversión GGUF funcional para la torre visual, lo cual no está documentado.
- Latencia y throughput: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Modalidad | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| G4-31B-SCE-OPT31-StyleC50 | 31,27B | No disponible | Imagen-texto | No disponible | Hugging Face (0 descargas) |
| llmfan46/gemma-4-31B-it-uncensored-heretic | ~31B (no confirmado) | No disponible | Texto/imagen según base | No disponible | Hugging Face |
| ApocalypseParty/G4-31B-M_OPT31 | ~31B (no confirmado) | No disponible | No disponible | No disponible | Hugging Face |
| ApocalypseParty/G4-mmv2-31B-Style-c50 | ~31B (no confirmado) | No disponible | Imagen-texto (por nombre) | No disponible | Hugging Face |

La comparación con alternativas de otras familias (Qwen, Llama) no es posible con rigor porque no hay benchmarks ni especificaciones de contexto publicadas para este checkpoint. Los tres modelos de la tabla son los componentes del propio merge, no competidores independientes.

## Limitaciones y advertencias

- Ausencia total de benchmarks: no hay evidencia publicada de que el merge preserve las capacidades del modelo base; los merges SCE pueden degradar rendimiento en tareas específicas.
- Licencia no declarada: no se puede asumir uso comercial; además, los términos del modelo base Gemma 4 (licencia de Google) condicionan la redistribución y el uso, y deben verificarse en el repositorio original.
- Origen "uncensored/heretic": implica reducción de filtros de seguridad, con riesgo elevado de generar contenido dañino, sesgado o inexacto; requiere moderación externa en cualquier despliegue.
- Riesgo de alucinación: no cuantificado; al no haber evaluaciones, debe asumirse el riesgo típico de un modelo de 31B sin verificación factual.
- Idiomas no declarados: no se puede garantizar calidad multilingüe ni siquiera en castellano.
- Contexto desconocido: no se puede planificar el uso en conversaciones largas o documentos extensos sin medir empíricamente la ventana efectiva.
- Soporte de tooling incierto: la combinación de arquitectura Gemma 4 multimodal con un merge no está garantizada en vLLM, llama.cpp u Ollama; la conversión a GGUF de la torre visual puede no estar soportada.
- Repositorio sin tracción: 0 descargas y 0 likes en el momento de la consulta, sin issues ni discusión comunitaria que permita validar su funcionamiento.
- Fecha de creación futura (2026-11-10) en los metadatos: inconsistencia que conviene verificar antes de confiar en el repositorio.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ApocalypseParty/G4-31B-SCE-OPT31-StyleC50
- Modelo base del merge: https://huggingface.co/llmfan46/gemma-4-31B-it-uncensored-heretic
- Componente fusionado 1: https://huggingface.co/ApocalypseParty/G4-31B-M_OPT31
- Componente fusionado 2: https://huggingface.co/ApocalypseParty/G4-mmv2-31B-Style-c50
- Paper del método SCE: https://arxiv.org/abs/2408.07990
- Repositorio de mergekit: https://github.com/cg123/mergekit
