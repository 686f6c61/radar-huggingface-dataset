# ShahriarFerdoush/mistral-7b-instruct-math-dare-k30

## Resumen

`ShahriarFerdoush/mistral-7b-instruct-math-dare-k30` es un checkpoint de 7.241.732.096 parámetros (7,24 mil millones) publicado en HuggingFace por el usuario ShahriarFerdoush. Por el nombre y por el recuento de parámetros, se trata de un merge de pesos (weight merge) construido sobre la arquitectura Mistral-7B, combinando un modelo instruct con un modelo especializado en matemáticas mediante la técnica DARE (Drop And REscale), probablemente en su variante TIES. La model card es la plantilla automática de HuggingFace y no contiene ninguna declaración del autor sobre el proceso, los datos o la evaluación.

El modelo no aporta documentación técnica: no se declara licencia, idiomas, longitud de contexto, modelo base exacto ni resultados de evaluación. Con 0 descargas y 0 likes en el momento de la consulta, y un repositorio de 14,5 GB en safetensors, debe considerarse un experimento personal de merging más que un artefacto listo para producción.

Su relevancia es, por tanto, la de un caso de estudio sobre merges DARE aplicados a modelos pequeños, y no la de un modelo recomendable por sus capacidades: cualquier uso real exige una evaluación propia previa, dado que no existe ni una sola métrica publicada.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only, familia Mistral-7B (inferido del nombre y del recuento de parámetros; no declarado en la model card) |
| Parametros totales | 7.241.732.096 (7,24 B), dato real de los safetensors |
| Parametros activos | No aplica (modelo denso, no es MoE) |
| Longitud de contexto | No declarada. La arquitectura Mistral-7B admite hasta 32 768 tokens con ventana deslizante de 4096, pero la versión concreta del base no se especifica |
| Tipos de cuantizacion | El repositorio solo contiene pesos en safetensors de 16 bits (14,5 GB ≈ 2 bytes/parámetro). No se distribuyen GGUF, AWQ ni GPTQ |
| Idiomas soportados | No disponible (probablemente inglés como base Mistral, sin confirmar) |
| Licencia | No disponible |
| Formato de pesos | safetensors (librería transformers); sin GGUF en el repo |

## Arquitectura y entrenamiento

No hay información publicada sobre el entrenamiento. El identificador del repositorio indica un merge con DARE (`dare`), técnica que poda aleatoriamente una fracción de los deltas de los pesos de los modelos donantes y reescala el resto para preservar la magnitud de la actualización; el sufijo `k30` sugiere un hiperparámetro de densidad o un top-k de 30, pero no hay configuración de mergekit publicada que lo confirme. Tampoco se especifica si se empleó DARE lineal, DARE-TIES o una variante con signos, ni cuáles son los modelos donantes exactos más allá de un "instruct" y un "math" derivados de Mistral-7B.

Al conservar el recuento de parámetros del base (7.241.732.096, idéntico al de Mistral-7B-Instruct-v0.1/v0.2), el merge no añade ni elimina módulos: mantiene la pila de 32 capas, la atención con grouped-query attention (32 cabezas de consulta y 8 de clave/valor), las activaciones SwiGLU, el vocabulario de 32 000 tokens y las embeddings de Mistral. No se declara ningún ajuste posterior al merge (ni SFT, ni DPO, ni RLHF) ni innovación técnica adicional.

## Capacidades

- Generación de texto conversacional en formato instruct, heredada del modelo donante de instrucciones (no verificada de forma independiente).
- Razonamiento aritmético y resolución de problemas matemáticos paso a paso, presumiblemente reforzado por el donante especializado en matemáticas.
- Generación de código y explicaciones técnicas, en la medida en que el base Mistral-7B las soporta.
- Soporte de plantillas de chat tipo Mistral (`[INST] ... [/INST]`) si el merge conserva el tokenizador y la configuración del base.
- Compatibilidad con `text-generation-inference` y con endpoints compatible (etiquetas del repositorio), lo que permite desplegarlo con la API estándar de HF.
- Capacidades multimodales, audio, tool calling nativo, modo "thinking" y agentes multi-paso: no disponibles o no declaradas.

## Casos de uso

- Evaluación interna de merges: usar el checkpoint como referencia en un banco de pruebas propio que compare merges DARE frente al instruct original en tareas de matemáticas de primaria y secundaria (GSM8K, SVAMP), midiendo si el merge degrada la alineación instruct.
- Generación de datos sintéticos matemáticos: producir problemas y soluciones paso a paso para ampliar datasets de entrenamiento, con filtrado posterior por verificación simbólica (por ejemplo, evaluando las expresiones con SymPy) para descartar soluciones incorrectas.
- Tutorías de matemáticas con verificación humana: prototipos de asistente que explica procedimientos, siempre con revisión del resultado, dado que no hay métricas publicadas que garanticen la tasa de acierto.
- Extracción de operaciones en documentos financieros: convertir enunciados en lenguaje natural a expresiones aritméticas o fórmulas, integrado en un pipeline que valide cada operación antes de aplicarla.
- Base para ajuste fino posterior: al ser un Mistral-7B estándar en safetensors, sirve como punto de partida para un SFT con LoRA en un dominio concreto (por ejemplo, física o estadística) sobre una única GPU de 24 GB.
- Reproducción de experimentos de merging: reimplementar la configuración con mergekit a partir del nombre (`dare` + `k30`), comparar los pesos resultantes y documentar la receta que falta en la model card.
- Laboratorio docente: analizar el efecto de DARE sobre las activaciones y la perplexidad de un modelo pequeño sin coste elevado de cómputo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card es la plantilla automática de HuggingFace y no incluye MMLU, GSM8K, HumanEval, MATH ni ninguna otra métrica, ni comparaciones con el modelo base.

## Requisitos de hardware

- Pesos en fp16/bf16: 14,5 GB (coincide con los 7,24 B × 2 bytes y con el tamaño del repositorio).
- VRAM para inferencia en fp16: unos 16-18 GB considerando caché KV. Con la arquitectura Mistral-7B, la caché KV ocupa aproximadamente 128 KiB por token en fp16, es decir, ~1 GB para 8 000 tokens y ~4 GB para 32 768 tokens.
- Cuantización int8: ~7,3 GB de pesos, apto para GPU de 12 GB con contextos moderados.
- GGUF Q4_K_M: ~4,4 GB; Q5_K_M: ~5,1 GB; Q8_0: ~7,7 GB (estimaciones por recuento de parámetros; no hay ficheros GGUF publicados, habría que convertirlos con `llama.cpp`).
- GPU recomendadas: A100 40 GB u H100 para fp16 con contexto largo y varios usuarios concurrentes; RTX 4090 o RTX 3090 (24 GB) para fp16 en un solo usuario; RTX 4060 Ti 16 GB o RTX 4080 para fp16 con contexto recortado.
- Consumer GPU: sí, en todas las anteriores con la cuantización adecuada; en 8 GB solo con Q4 y contexto limitado.
- Opciones de despliegue: `transformers`, `text-generation-inference` (etiqueta declarada), vLLM, llama.cpp/Ollama y LM Studio tras convertir los pesos a GGUF.
- Latencia y throughput: no disponibles; no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Estado de evaluación |
|---|---|---|---|---|
| mistral-7b-instruct-math-dare-k30 | 7,24 B | No declarado (~32 768 por arquitectura) | No disponible | Sin benchmarks publicados |
| Mistral-7B-Instruct-v0.2 | 7,24 B | 32 768 tokens | Apache 2.0 | Benchmarks publicados por el autor |
| Mistral-7B-Instruct-v0.3 | 7,24 B | 32 768 tokens | Apache 2.0 | Benchmarks publicados por el autor |
| Meta-Llama-3-8B-Instruct | 8,03 B | 8 192 tokens | Licencia comunitaria Llama 3 | Benchmarks publicados por el autor |
| Qwen2.5-Math-7B-Instruct | 7,6 B | 4 096 tokens | Apache 2.0 | Benchmarks de matemáticas publicados por el autor |

La comparación relevante es frente a los originales: el merge no documenta ninguna ventaja medible sobre Mistral-7B-Instruct, y frente a Qwen2.5-Math-7B-Instruct carece de cualquier dato de rendimiento en matemáticas, que es precisamente su presunto dominio objetivo.

## Limitaciones y advertencias

- Model card vacía: todos los campos de la plantilla automática están sin rellenar ("More Information Needed"), incluidos desarrollador, datos, evaluación y licencia.
- Licencia no disponible: no puede asumirse el Apache 2.0 de Mistral, porque el modelo donante de matemáticas puede tener otra licencia. Uso comercial no recomendado sin aclaración previa.
- Sin benchmarks: no existe evidencia de que el merge mejore al instruct original en matemáticas; los merges DARE pueden degradar la alineación instruct y la coherencia conversacional.
- Riesgo de alucinación aritmética: en modelos de 7 B sin verificación externa, los errores de cálculo en cadenas de razonamiento largas son frecuentes; requiere validación simbólica o con ejecución de código.
- Idiomas no declarados: no hay garantía de buen rendimiento en castellano; el base Mistral-7B está entrenado predominantemente en inglés.
- Contexto no declarado: aunque la arquitectura soporte 32 768 tokens, no se confirma que el merge conserve la ventana deslizante ni el ajuste para contexto largo.
- Procedencia dudosa: la etiqueta `arxiv:1910.09700` del repositorio corresponde a Lacoste et al. (calculadora de impacto medioambiental) e forma parte de la plantilla, no a un artículo sobre el modelo; no debe citarse como referencia técnica.
- Sin tracción comunitaria: 0 descargas y 0 likes implican ausencia de validación por terceros, de issues resueltos y de recetas de cuantización probadas.
- El sufijo `k30` no está documentado: no es posible reproducir el merge sin adivinar los hiperparámetros.
- Fechas de creación y actualización del repositorio (2026-10-25) resultan anómalas y conviene verificarlas antes de citar el modelo.

## Enlaces

- HuggingFace: https://huggingface.co/ShahriarFerdoush/mistral-7b-instruct-math-dare-k30
- Referencia citada en la etiqueta del repositorio (plantilla, no artículo del modelo): Lacoste et al., "Quantifying the Carbon Emissions of Machine Learning", https://arxiv.org/abs/1910.09700
- Calculadora de impacto asociada a esa referencia: https://mlco2.github.io/impact
- No se han encontrado en la información disponible papers, blogs, repositorios de código ni demos adicionales del modelo.
