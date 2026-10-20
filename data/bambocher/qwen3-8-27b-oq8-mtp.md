# bambocher/Qwen3.8-27B-oQ8-mtp

## Resumen

Qwen3.8-27B-oQ8-mtp es un checkpoint cuantizado del modelo Qwen3.8-27B, publicado por el usuario bambocher en HuggingFace. No se trata de un modelo entrenado desde cero, sino de una conversión de pesos a formato MLX mediante la herramienta oQ (oMLX v0.7.1), que aplica cuantización de precisión mixta: la mayor parte de la red se almacena en 8 bits afín con grupos de 64, mientras que una fracción pequeña (1,857 %) se conserva en BF16. El resultado es un checkpoint de 27.781.427.952 parámetros que ocupa 27,941 GiB (30,001 GB) con un promedio efectivo de 8,639 bits por peso.

El interés de esta ficha es fundamentalmente práctico: permite ejecutar un modelo de ~27,8B parámetros con una pérdida de precisión muy contenida (8,6 bits/peso frente a los 16 bits de un BF16) en equipos Apple Silicon con memoria unificada, gracias al backend MLX. El checkpoint conserva tres componentes diferenciados: el modelo de lenguaje (26,896B), una torre de visión (0,461B) y una cabeza MTP (multi-token prediction, 0,425B), lo que sugiere capacidades multimodales de imagen y decodificación especulativa integrada.

La información publicada por el autor es exclusivamente técnica sobre el proceso de cuantización: no incluye datos sobre longitud de contexto, idiomas, licencia, composición del dataset ni resultados de benchmarks. Cualquier evaluación de rendimiento frente al modelo base queda, por tanto, pendiente de verificación empírica por parte del usuario.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (etiqueta de configuración `qwen3_5`), con torre de visión y cabeza MTP; detalles de capas y atención no disponibles |
| Parametros totales | 27.781.427.952 (27,266B en 8 bits afín + 0,516B en BF16) |
| Parametros activos | no aplica (la model card no indica arquitectura MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 8 bits afín con grupo de 64 (98,143 % de los pesos, 8,50 bits/peso efectivos) + BF16 (1,857 %, 16,00 bits/peso); promedio efectivo 8,639 bits/peso |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors en formato MLX (`library_name: mlx`), repo de 30,0 GB |

## Arquitectura y entrenamiento

El checkpoint deriva de Qwen3.8-27B y conserva su topología, identificada en los metadatos con la etiqueta `qwen3_5`. El desglose de almacenamiento revela tres bloques: un modelo de lenguaje de 26,896B parámetros lógicos (28,579 GB), una torre de visión de 0,461B (0,921 GB) y una cabeza MTP de 0,425B (0,500 GB). La presencia de la torre de visión implica entrada de imágenes además de texto; la cabeza MTP corresponde a multi-token prediction, un módulo auxiliar que predice varios tokens por paso y se emplea habitualmente para decodificación especulativa o para acelerar la generación.

No hay información sobre el entrenamiento del modelo original: se desconoce el volumen de tokens, la composición del corpus, la existencia de fases de RLHF/DPO o de ajuste por instrucciones, y las innovaciones de atención o posicionamiento. Lo único documentado es el postprocesado: cuantización de precisión mixta con oQ (oMLX v0.7.1), que asigna 8 bits afín (grupo de 64) al 98,143 % de los pesos y mantiene en BF16 el 1,857 % restante, presumiblemente capas o tensores sensibles a la cuantización. El peso medio resultante, 8,639 bits/peso, se sitúa muy por encima de las cuantizaciones de 4 bits habituales en despliegue local, lo que en la práctica reduce la degradación respecto al checkpoint original a costa de duplicar el espacio en disco.

## Capacidades

- Generación de texto y razonamiento en lenguaje natural, heredados del modelo base Qwen3.8-27B.
- Procesamiento de imágenes: el checkpoint incluye una torre de visión de 0,461B parámetros, por lo que admite entradas multimodales (la resolución, el número de imágenes por prompt y el formato exacto de preprocesado no están documentados).
- Decodificación acelerada mediante cabeza MTP (multi-token prediction), orientada a generación especulativa; no se especifica el factor de aceleración ni si el runtime MLX la explota por defecto.
- Ejecución local en Apple Silicon mediante MLX, con pesos ya convertidos y listos para `mlx_lm`.
- Tool calling / function calling: no disponible en la información publicada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información publicada.
- Capacidades multilingües: no disponible (no se declara lista de idiomas).
- Modo thinking explícito: no disponible.

## Casos de uso

- Inferencia local en Mac de desarrollo: con 27,941 GiB de pesos, el checkpoint cabe en equipos Apple Silicon de 36 GB o más de memoria unificada, lo que permite disponer de un modelo de ~27,8B con calidad cercana a BF16 sin depender de la nube.
- Análisis de documentos con componentes visuales: la torre de visión permite enviar páginas escaneadas, capturas de interfaz o gráficos junto con instrucciones de texto para extracción de campos, resumen o respuesta a preguntas sobre el contenido.
- Asistente de código en local: al ejecutarse sobre MLX en el propio equipo, se puede integrar en el editor sin enviar el código fuente a terceros, algo relevante en entornos con requisitos de confidencialidad.
- Evaluación comparativa de cuantizaciones: al estar publicado con una distribución de bits explícita, sirve como referencia para medir la pérdida de calidad de 8,639 bits/peso frente al BF16 y frente a cuantizaciones de 4 bits sobre el mismo modelo base.
- Prototipado multimodal sin infraestructura GPU: investigadores que trabajen en portátiles o estaciones Mac pueden iterar sobre pipelines de imagen+texto sin aprovisionar A100/H100.
- Procesamiento por lotes de moderación o clasificación de contenido en escritorio: con contexto y velocidad moderados, el modelo puede etiquetar lotes de texto e imágenes en una máquina de trabajo, aunque el throughput real no está documentado.
- Base para despliegue en servidor MLX: `mlx_lm.server` expone una API compatible con OpenAI, lo que permite montar un servicio interno en un Mac Studio con memoria suficiente para el checkpoint completo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye MMLU, HumanEval, GSM8K, MMMU ni ninguna otra métrica, ni comparaciones con el checkpoint BF16 del que deriva. Tampoco se documentan latencia, tokens por segundo ni factores de aceleración asociados a la cabeza MTP.

## Requisitos de hardware

- VRAM / memoria para inferencia: 27,941 GiB solo para pesos en este formato. Añadiendo caché KV y overhead del runtime, se recomienda un mínimo de 36 GB de memoria unificada; 32 GB es ajustado y probablemente obligue a reducir contexto o lote.
- GPU Apple Silicon: cualquier chip de la familia M con memoria unificada de 36 GB o superior (M2 Max 38 GB, M3/M4 Max 48-64 GB, M2/M3 Ultra 96-192 GB). El backend MLX está diseñado para Metal en Apple Silicon.
- GPU NVIDIA: este checkpoint no se ejecuta directamente en CUDA; MLX es un framework para Apple. Para A100/H100 habría que recurrir al modelo base en otro formato (BF16 ≈ 55,6 GB solo en pesos, cálculo derivado de 27,78B × 2 bytes) o a una cuantización GGUF/AWQ equivalente.
- ¿Cabe en GPU de consumo? No en una RTX 4090 de 24 GB en su formato actual. En el ecosistema Apple, sí en máquinas de 36 GB o más; no es viable en un Mac de 16 o 24 GB.
- Opciones de despliegue: `mlx_lm` (generación e inferencia), `mlx_lm.server` (API HTTP), oMLX (herramienta con la que se generó el checkpoint) y LM Studio con soporte MLX. vLLM, TGI, llama.cpp y Ollama no cargan safetensors MLX de forma nativa: requerirían el modelo base y una conversión a GGUF u otro formato.
- Latencia y throughput: no disponibles. No se han publicado medidas de tokens por segundo ni del impacto real de la cabeza MTP.

## Comparativa con modelos similares

| Modelo | Parametros | Formato / bits por peso | Tamano en disco | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Qwen3.8-27B-oQ8-mtp (este) | 27,78B | MLX safetensors, 8,639 bpw medios | 30,0 GB (27,941 GiB) | no disponible | no disponible | HuggingFace, 0 descargas |
| Qwen3.8-27B en BF16 (modelo base) | 27,78B | safetensors BF16, 16 bpw | ~55,6 GB (estimación: 27,78B × 2 bytes) | no disponible | no disponible | Referenciado como origen; enlace no disponible |
| Cuantización MLX de 4 bits del mismo modelo base | 27,78B | MLX, ~4,5 bpw típicos | ~15 GB (estimación) | no disponible | no disponible | No verificada en la información disponible |
| Alternativas de otros fabricantes (Llama, Mistral, Gemma de tamaño similar) | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks que permitan comparar rendimiento con alternativas; la comparación anterior se limita a tamaño, formato y consumo de memoria, con las estimaciones marcadas explícitamente como tales.

## Limitaciones y advertencias

- Licencia no declarada: no se especifica la licencia del checkpoint ni se indica explícitamente la del modelo base. Antes de cualquier uso comercial es imprescindible verificar los términos del modelo original Qwen3.8-27B; la ausencia de licencia en el repo no equivale a permiso de uso.
- Repositorio sin tracción ni validación comunitaria: 0 descargas y 0 likes en el momento de la consulta, lo que implica ausencia de verificación independiente de la calidad de la cuantización.
- Metadatos atípicos: las fechas de creación y actualización (2026-10-20) no permiten contrastar la antigüedad real del checkpoint. Conviene tratar el artefacto con cautela.
- Pérdida de precisión por cuantización: 8,639 bits/peso medios no es equivalente a BF16. La degradación es previsiblemente pequeña, pero no se han publicado evaluaciones que la cuantifiquen.
- Riesgo de alucinación: inherente a los modelos de lenguaje de esta escala; no hay datos específicos sobre tasas de factualidad ni sobre el efecto de la cuantización en ellas.
- Idiomas y contexto desconocidos: sin lista de idiomas ni longitud de ventana documentadas, no se puede garantizar un comportamiento correcto en castellano ni en contextos largos.
- Dependencia de plataforma: al ser un checkpoint MLX, queda restringido al ecosistema Apple; no es portable a CUDA sin reconvertir desde el modelo base.
- Capacidades de agente y tool calling no documentadas: no deben asumirse en producción sin pruebas propias.
- La cabeza MTP añade 0,425B parámetros y 0,500 GB de peso; si el runtime no la utiliza, ese espacio es coste sin beneficio.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/bambocher/Qwen3.8-27B-oQ8-mtp
- Herramienta de cuantización oQ (oMLX): https://github.com/jundot/omlx
- Modelo base Qwen3.8-27B: enlace no disponible en la información proporcionada
- Paper, blog o demo del autor: no disponible
- Repositorio de MLX: no incluido en la información proporcionada
