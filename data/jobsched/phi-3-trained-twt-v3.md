# JobSched/phi-3-trained-twt-v3

## Resumen

`JobSched/phi-3-trained-twt-v3` es un ajuste fino mediante PEFT (adaptadores LoRA) sobre el modelo base `microsoft/Phi-3-mini-128k-instruct`, publicado por el usuario JobSched en HuggingFace. No se trata por tanto de un modelo entrenado desde cero, sino de una adaptación de bajo rango que reutiliza los pesos del Phi-3-mini y añade un conjunto de pesos adicionales entrenados con AutoTrain sobre un dataset que la model card no documenta. El repositorio incluye pesos en safetensors, etiquetas de PEFT y `custom_code`, lo que implica que para cargarlo es necesario usar `transformers` junto con la librería `peft` y confiar en código personalizado del repositorio.

El interés del modelo es limitado y muy específico: se publica como un experimento de ajuste fino sin métricas, sin dataset descrito, sin idiomas declarados y con cero descargas y cero "likes" en el momento de la consulta. La ficha técnica del autor no aporta información sobre datos de entrenamiento, hiperparámetros, evaluación ni casos de uso previstos, por lo que cualquier evaluación de calidad debe hacerse por cuenta del usuario.

Lo relevante, en la práctica, es el modelo base: Phi-3-mini es un transformer denso de 3,8 mil millones de parámetros entrenado por Microsoft sobre 3,3 billones de tokens, con una variante de contexto largo de 128 000 tokens (la que da nombre a este repositorio). Esa base es la que determina las capacidades reales de generación, razonamiento, código y multilingüismo del conjunto; el adaptador solo puede desplazar el estilo o la especialización sobre ese comportamiento previo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso (Phi-3-mini) con adaptador PEFT/LoRA |
| Parametros totales | ~3,8 mil millones (modelo base); tamaño del adaptador no disponible |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | 128 000 tokens (según la variante del modelo base referenciada en el nombre del repositorio) |
| Tipos de cuantizacion | No disponible en el repositorio; el modelo base dispone de cuantizaciones de la comunidad (GGUF, INT4/INT8) no verificadas para este adaptador |
| Idiomas soportados | No disponible (no declarados en la model card) |
| Licencia | `other` según las etiquetas del repositorio; el texto concreto no está disponible. El modelo base Phi-3-mini-128k-instruct se publica bajo licencia MIT |
| Formato de pesos | safetensors (adaptador PEFT); requiere `transformers` + `peft` y `trust_remote_code` por la etiqueta `custom_code` |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Phi-3-mini: un transformer decoder-only denso de 3,8 mil millones de parámetros, sin mezcla de expertos ni mecanismos de estado recurrente, entrenado por Microsoft sobre 3,3 billones de tokens según el informe técnico publicado en arXiv (2404.14219). La variante `128k` extiende la ventana de contexto original de 4 096 tokens hasta 128 000 tokens. Sobre esa base, este repositorio aplica un ajuste fino con PEFT/LoRA gestionado con AutoTrain, tal y como indican las etiquetas `peft` y `autotrain` del repositorio.

No hay información pública sobre el dataset de ajuste, el número de tokens vistos, la composición de los datos, el rango y alpha del LoRA, la tasa de aprendizaje ni si se aplicaron etapas de RLHF o DPO adicionales. El sufijo `twt` del nombre sugiere un corpus orientado a texto corto o publicaciones sociales, pero es una inferencia no confirmada por el autor. Tampoco se documenta ninguna innovación técnica propia: el valor del repositorio es exclusivamente el adaptador, no la arquitectura.

## Capacidades

Las capacidades heredadas corresponden al modelo base Phi-3-mini-128k-instruct; el adaptador puede alterarlas o degradarlas y no hay evaluación que lo cuantifique.

- Generación de texto conversacional multi-turno en formato instruct.
- Razonamiento de sentido común y matemáticas de nivel básico-intermedio, dentro de lo esperable en un modelo de 3,8B.
- Generación de código y explicación de fragmentos, sin garantía de tool calling fiable (Phi-3-mini no se entrena específicamente para function calling).
- Ventana de contexto de hasta 128 000 tokens para resumen y QA sobre documentos largos.
- Capacidades multilingües limitadas y no declaradas; el modelo base está optimizado para inglés y su rendimiento en castellano es inferior.
- Al estar empaquetado como adaptador PEFT, es combinable con otros adaptadores, aunque no se documenta compatibilidad.

## Casos de uso

- Experimentación académica con PEFT: el escenario más realista es usar este repositorio como referencia de cómo se estructura un adaptador LoRA sobre Phi-3 con AutoTrain, inspeccionando `adapter_config.json` y los pesos, más que desplegarlo en producción.
- Prototipado de asistentes conversacionales ligeros en local: con el modelo base cuantizado a 4 bits cabe en una GPU de consumo y permite iterar en un portátil con GPU discreta.
- Resumen de documentos largos: la ventana de 128k permite procesar informes o expedientes completos en una sola pasada, siempre que se valide que el adaptador no ha degradado la capacidad de contexto largo.
- Clasificación y etiquetado de textos cortos: si el dataset `twt` es efectivamente de publicaciones sociales, el adaptador podría especializarse en ese dominio, aunque esto requiere validación empírica por parte del usuario.
- Generación de borradores en pipelines internos sin requisitos de alta calidad: al ser un modelo pequeño, el coste por token es bajo y puede usarse como primer filtro antes de un modelo mayor.
- Base para un segundo ajuste fino: al ser un adaptador PEFT, es un punto de partida barato para entrenar sobre un dominio propio con recursos modestos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

El repositorio no incluye tabla de evaluación, no reporta MMLU, HumanEval, GSM8K ni métricas de pérdida del ajuste, y no ofrece comparación con el modelo base. Cualquier cifra que se quiera usar para decidir su adopción debe medirse localmente contra `microsoft/Phi-3-mini-128k-instruct` como referencia.

## Requisitos de hardware

- VRAM estimada para inferencia con el modelo base en FP16: aproximadamente 7,6 GB de pesos, más caché KV; con 128k de contexto la caché KV crece de forma muy significativa y puede superar los 20-30 GB según configuración.
- VRAM estimada en INT8: alrededor de 4 GB de pesos. En INT4/GGUF Q4: aproximadamente 2,2-2,5 GB de pesos.
- GPU recomendadas: A100 40/80 GB o H100 para contexto completo de 128k con concurrencia; L4, A10G o RTX 4090 (24 GB) para contexto medio; RTX 3060 12 GB, RTX 4060 Ti 16 GB o RTX 4070 para contexto corto cuantizado.
- Cabe en GPU de consumo: sí, en FP16 con 12 GB o más para contextos moderados, y en 4 bits en GPUs de 6-8 GB con contexto reducido.
- Opciones de despliegue: `transformers` + `peft` (necesario para cargar el adaptador), vLLM y TGI para servir el modelo base fusionado, llama.cpp/Ollama para versiones GGUF del base. El adaptador debe fusionarse (`merge_and_unload`) antes de exportar a GGUF.
- Latencia y throughput: no disponibles. No hay mediciones publicadas para este repositorio.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Rendimiento |
|---|---|---|---|---|---|
| JobSched/phi-3-trained-twt-v3 | ~3,8B (base) + adaptador | 128k (heredado) | `other`, no detallada | Repositorio HF, 0 descargas | No evaluado |
| microsoft/Phi-3-mini-128k-instruct | 3,8B | 128k | MIT | Ampliamente disponible, versiones GGUF de la comunidad | Métricas publicadas en el informe técnico de Phi-3 |
| microsoft/Phi-3.5-mini-instruct | 3,8B | 128k | MIT | Disponible en HF, sucesor directo | Superior al Phi-3-mini original según Microsoft |
| Llama-3.2-3B-Instruct | 3,2B | 128k | Licencia comunitaria Llama 3.2 | Disponible en HF | No comparable sin medición directa |
| Qwen2.5-3B-Instruct | 3,1B | 32k | Apache 2.0 | Disponible en HF | No comparable sin medición directa |

La comparación honesta es desfavorable para este repositorio en términos de trazabilidad: no hay métricas propias y su licencia es menos clara que la de su propio modelo base. Para uso real, `microsoft/Phi-3.5-mini-instruct` o `microsoft/Phi-3-mini-128k-instruct` son opciones más seguras y auditables.

## Limitaciones y advertencias

- Ausencia total de documentación: sin dataset, sin hiperparámetros, sin evaluación y sin idiomas declarados, no es posible justificar su uso en producción.
- Licencia `other` sin texto publicado: existe un riesgo legal real de uso comercial, agravado porque el modelo base es MIT pero la adaptación no aclara los términos.
- Etiqueta `custom_code`: obliga a ejecutar código del repositorio con `trust_remote_code=True`, lo que implica un vector de riesgo de seguridad si no se audita.
- Riesgo de sobreajuste al corpus no documentado: un adaptador LoRA pequeño puede degradar capacidades generales del base, especialmente en tareas ajenas al dominio de ajuste.
- Riesgo de alucinación heredado y potencialmente amplificado: los modelos de 3,8B generan con confianza contenido incorrecto, y no hay evaluación que mida la degradación introducida por el adaptador.
- Contexto largo nominal pero costoso: 128k tokens implican un consumo de memoria de caché KV que puede hacer inviable el despliegue en hardware de consumo.
- Multilingüismo no garantizado: el modelo base está centrado en inglés; el rendimiento en castellano es limitado y no ha sido evaluado para este adaptador.
- Señales de escasa validación comunitaria: 0 descargas y 0 "likes" implican que el modelo no ha sido probado por terceros.
- Recomendación: tratarlo como material de experimentación, no como componente de un sistema en producción sin una batería de evaluación propia.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/JobSched/phi-3-trained-twt-v3
- Repositorio hermano del mismo autor: https://huggingface.co/JobSched/phi-3-adapter-v4
- Modelo base: https://huggingface.co/microsoft/Phi-3-mini-128k-instruct
- Colección Phi-3 de Microsoft: https://huggingface.co/collections/microsoft/phi-3
- Informe técnico de Phi-3 (arXiv 2404.14219): https://arxiv.org/html/2404.14219v4
- Anuncio de fine-tuning de Phi-3 en Azure: https://azure.microsoft.com/en-us/blog/announcing-phi-3-fine-tuning-new-generative-ai-models-and-other-azure-ai-updates-to-empower-organizations-to-customize-and-scale-ai-applications/
- Entrada de Wikipedia sobre la familia Phi: https://en.wikipedia.org/wiki/Phi_(language_model)
- Documentación de PEFT: https://huggingface.co/docs/peft
- Documentación de AutoTrain: https://huggingface.co/docs/autotrain
