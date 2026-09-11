# siddarthg44/anlp-a2-p1-moe_4e2a

## Resumen

`siddarthg44/anlp-a2-p1-moe_4e2a` es un modelo de traducción automática neuronal desarrollado por el usuario siddarthg44 como parte de la Parte 1 de la asignatura ANLP Assignment 2. Se trata de un transformer decoder-only en el que las capas feed-forward se sustituyen por una variante de mezcla de expertos denominada `moe_4e2a`, con 4 expertos y enrutamiento top-2. El modelo se entrena sobre el conjunto `belumind/en-vi-ja-curated-500k-triplets` para traducir vietnamita y japonés a inglés, con un presupuesto de entrenamiento de 40 millones de tokens.

La relevancia del modelo es fundamentalmente académica y experimental: sirve como artefacto reproducible para estudiar el comportamiento de arquitecturas MoE de grano fino en una tarea supervisada concreta, incluyendo métricas de especialización de expertos. No está pensado para producción ni para uso generalista, y sus dimensiones son reducidas (d_model 512, 8 capas, 8 cabezas, contexto de 256 tokens, tokenizador byte-level BPE con 16.000 merges entrenado conjuntamente en inglés, vietnamita y japonés).

El repositorio ocupa 0,1 GB e incluye `best.pt` (pesos y configuración), `tokenizer.json` y `eval.json` (perplejidad de test, BLEU y métricas de especialización de expertos). No declara licencia, no tiene descargas ni likes registrados y no publica los valores numéricos de sus métricas de evaluación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only con capas feed-forward de mezcla de expertos (variante `moe_4e2a`) |
| Parametros totales | no disponible (configuracion: d_model 512, 8 capas, 8 cabezas, d_ff 2048) |
| Parametros activos | no disponible (MoE con 4 expertos y top_k = 2; `match: total`, 0 expertos compartidos) |
| Longitud de contexto | 256 tokens |
| Tipos de cuantizacion | no disponible (no se publican versiones cuantizadas) |
| Idiomas soportados | ingles (en), vietnamita (vi), japones (ja) |
| Licencia | no disponible |
| Formato de pesos | PyTorch (`best.pt`, state dict serializado con pickle; no safetensors ni GGUF) |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only con atención completa y capas feed-forward basadas en mezcla de expertos. La configuración concreta de la FFN es `{'type': 'moe', 'd_ff': 2048, 'n_experts': 4, 'top_k': 2, 'n_shared': 0, 'match': 'total'}`: cuatro expertos, de los cuales se activan dos por token, sin experto compartido y con dimensionamiento ajustado para igualar el total de parámetros de una FFN densa equivalente. La dimensionalidad del modelo es d_model = 512, con 8 capas y 8 cabezas de atención. El tokenizador es un BPE a nivel de byte con 16.000 merges, entrenado conjuntamente sobre los tres idiomas del corpus.

El entrenamiento se realizó sobre el dataset `belumind/en-vi-ja-curated-500k-triplets` con un presupuesto de 40 millones de tokens. La model card no especifica la composición detallada del dataset, la proporción de cada par de idiomas ni si se aplicaron técnicas de alineación posteriores como RLHF o DPO. Tampoco se documentan innovaciones técnicas adicionales (decodificación especulativa, atención lineal, etc.). El artefacto `eval.json` sugiere que el autor midió perplejidad en test, BLEU y especialización de expertos, pero los valores no se incluyen en la información disponible.

## Capacidades

- Traducción de vietnamita a inglés y de japonés a inglés, que es la tarea declarada del modelo.
- Generación de texto autoregresiva con arquitectura decoder-only y tokenizador multilingüe compartido para en, vi y ja.
- Procesamiento de secuencias de hasta 256 tokens, adecuado para frases y párrafos cortos, no para documentos largos.
- Inspección de especialización de expertos: el archivo `eval.json` reporta métricas de especialización, lo que permite analizar el enrutamiento entre los 4 expertos.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- No se documentan capacidades de visión, audio ni modo de razonamiento explícito (thinking mode).
- No se documenta ajuste por instrucciones ni comportamiento conversacional.

## Casos de uso

- Reproducción de experimentos académicos: el repositorio incluye pesos, tokenizador y configuración en un único `best.pt`, lo que permite reconstruir el modelo con `build_model(TransformerConfig.from_dict(state["config"]))` y replicar los resultados del assignment sin reentrenar.
- Baseline para ablaciones de MoE: al estar la configuración de la FFN parametrizada (`n_experts`, `top_k`, `n_shared`, `match`), sirve como punto de partida para comparar variantes de enrutamiento en un entorno de cómputo reducido.
- Estudio de especialización de expertos: las métricas de especialización incluidas en `eval.json` permiten analizar qué experto se activa en función del idioma de origen o del token, un análisis típico en investigación sobre MoE.
- Preprocesado de corpus vi→en en investigación: traducción de frases cortas de vietnamita a inglés (por ejemplo, pares de un dataset de evaluación) siempre que cada segmento quepa en 256 tokens.
- Preprocesado de corpus ja→en en investigación: misma función para titulares, comentarios breves o pares de subtítulos en japonés, con la misma restricción de longitud.
- Generación de pseudo-etiquetas para aumentación de datos: traducir texto vi o ja no etiquetado para crear pares adicionales que después se filtren manualmente o con un modelo mayor.
- Docencia en cursos de NLP: ejemplo completo y ligero de pipeline de entrenamiento con MoE, útil para prácticas donde el alumnado debe inspeccionar pesos, enrutamiento y métricas.
- Demostración en CPU o hardware de gama baja: dado el tamaño del repositorio (0,1 GB), es viable ejecutarlo en un portátil sin GPU para pruebas de integración del código de inferencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

El repositorio incluye un archivo `eval.json` que, según la model card, contiene perplejidad de test, BLEU y métricas de especialización de expertos, pero los valores concretos no se proporcionan en la información consultada. No se dispone de resultados de MMLU, HumanEval, GSM8K ni de benchmarks de traducción estándar (WMT, FLORES-200) para este modelo.

## Requisitos de hardware

- VRAM estimada: no disponible de forma oficial. Como referencia, el repositorio completo ocupa 0,1 GB y el checkpoint se serializa en un único `best.pt`, por lo que la inferencia en fp32 debería residir holgadamente en menos de 1 GB de memoria.
- GPU recomendadas: no se especifican. Por tamaño, cualquier GPU con al menos 2 GB de VRAM es suficiente (GTX 1650, RTX 3050, RTX 4090, A100, H100); las GPU de datacenter están sobredimensionadas para este modelo.
- Cabe en GPU de consumo: sí, en cualquier GPU de consumo moderna e incluso en iGPU con memoria compartida suficiente.
- Cabe en CPU: sí, es viable la inferencia en CPU para secuencias de hasta 256 tokens.
- Opciones de despliegue: no hay soporte conocido para vLLM, llama.cpp, Ollama o TGI, ya que los pesos son un state dict de PyTorch (`best.pt`) y requieren el código propio `src/model.py` del autor. El despliegue se limita a scripts de PyTorch con la carga indicada en la model card.
- Latencia y throughput estimados: no disponible.
- Advertencia de carga: el snippet oficial usa `torch.load(..., weights_only=False)`, lo que implica deserialización de pickle; solo debe cargarse el archivo si se confía en su procedencia.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye modelos comparables de la misma categoría (traducción vi→en o ja→en con arquitectura MoE de tamaño reducido) ni datos de rendimiento que permitan establecer una comparación fundamentada. Cualquier comparación con modelos de traducción comerciales o con modelos MoE de mayor escala carecería de base numérica en esta ficha.

## Limitaciones y advertencias

- Licencia no declarada: al no especificarse licencia, no puede asumirse permiso de uso comercial, modificación ni redistribución; conviene contactar con el autor antes de cualquier uso fuera del ámbito académico.
- Sesgos conocidos: no se documentan análisis de sesgo. El modelo se entrena sobre un único corpus curado (`belumind/en-vi-ja-curated-500k-triplets`), por lo que heredará los sesgos de dominio, registro y demografía de ese dataset.
- Riesgo de alucinación: al ser un modelo pequeño entrenado con 40 millones de tokens, la probabilidad de traducciones incorrectas, omisiones o invenciones es alta, especialmente fuera del dominio del corpus.
- Limitación de contexto: 256 tokens restringen el uso a frases y párrafos cortos; no admite documentos largos ni conversaciones multi-turno extensas.
- Cobertura de idiomas asimétrica: solo se declara traducción de vietnamita y japonés a inglés; no se garantiza el sentido inverso ni otros pares.
- Ausencia de cuantizaciones: no hay versiones GGUF, AWQ, GPTQ ni similares, lo que limita el despliegue en herramientas estándar de inferencia.
- Formato de pesos no seguro por defecto: `best.pt` es un pickle de PyTorch y requiere `weights_only=False` para cargarse, lo que supone un riesgo de ejecución de código si el archivo se obtiene de una fuente no fiable.
- Dependencia de código propietario: la carga depende de `src/model.py` y de `build_model`/`TransformerConfig`, no incluidos en el repositorio de HuggingFace según la información disponible.
- Idoneidad para producción: nula en su estado actual; es un artefacto de asignatura sin métricas publicadas, sin licencia y sin soporte de herramientas de servido.
- Madurez del repositorio: 0 descargas y 0 likes en el momento de la consulta, sin historial de mantenimiento.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/siddarthg44/anlp-a2-p1-moe_4e2a

La búsqueda web realizada no devolvió enlaces relevantes sobre este modelo: los resultados corresponden a páginas generales de ChatGPT y OpenAI (chatgpt.com, openai.com, en.wikipedia.org/wiki/ChatGPT), sin relación con el artefacto descrito. No se han encontrado papers, blogs, repositorios de código ni demos adicionales asociados al modelo.
