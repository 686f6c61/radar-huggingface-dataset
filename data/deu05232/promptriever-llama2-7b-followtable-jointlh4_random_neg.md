# deu05232/promptriever-llama2-7B-followtable-JointLH4_random_neg

## Resumen

El modelo `deu05232/promptriever-llama2-7B-followtable-JointLH4_random_neg` es un adaptador PEFT (LoRA) publicado en Hugging Face por el usuario `deu05232`, construido sobre el modelo base `meta-llama/Llama-2-7b-hf`. Por la nomenclatura del identificador ("promptriever" y "followtable"), se trata de un artefacto experimental orientado a tareas de recuperacion/representacion de prompts (prompt retrieval) y posiblemente a la generacion de tablas o formatos estructurados a partir de instrucciones. No es un modelo entrenado desde cero, sino un ajuste fino de bajo rango sobre Llama 2 de 7 mil millones de parametros.

El modelo hereda la arquitectura transformer decoder-only de Llama 2 (7B, atencion causal, contexto nativo de 4096 tokens), pero anade pesos de adaptador LoRA entrenados por el autor. No se ha publicado informacion sustantiva en la model card: la plantilla esta sin rellenar en practicamente todos los apartados, no se documentan datos de entrenamiento, hiperparametros, resultados de evaluacion ni limitaciones. Tampoco se especifican licencia, idiomas soportados ni pipeline de uso.

Su relevancia es limitada y fundamentalmente experimental: cero descargas y cero likes en el momento de la consulta, creado el 14 de noviembre de 2026 y con un tamano de repositorio de 14.3 GB (compatible con pesos completos en fp16 del modelo base mas los adaptadores). Resulta util como referencia para quienes replican experimentos de prompt retrieval con Llama 2, pero no como componente listo para produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama 2) con adaptador PEFT/LoRA |
| Parametros totales | 7 000 millones (modelo base); parametros del adaptador no disponibles |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (el base Llama-2-7b-hf soporta 4096 tokens) |
| Tipos de cuantizacion | no disponibles (el repositorio contiene pesos safetensors PEFT; se podria cuantizar el base por separado, pero el autor no lo documenta) |
| Idiomas soportados | no disponibles |
| Licencia | no disponible (el modelo base Llama 2 tiene Llama 2 Community License, pero el adaptador no declara licencia propia) |
| Formato de pesos | safetensors (adaptadores PEFT); requiere el modelo base en safetensors |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Llama 2 7B: transformer decoder-only con atencion multi-cabeza, normalizacion RMSNorm, activacion SwiGLU, RoPE para codificacion posicional y 4096 tokens de contexto nativo. Sobre este modelo se aplica un adaptador PEFT de tipo LoRA (segun la libreria `peft` y la version de framework indicada en la model card, PEFT 0.14.0), que introduce matrices de bajo rango en determinadas capas para ajustar el comportamiento sin modificar los pesos originales.

No hay informacion sobre el numero de tokens de entrenamiento, la composicion del dataset, el regimen de entrenamiento (fp16, bf16, fp32), el numero de pasos, la tasa de aprendizaje ni si se aplicaron tecnicas de alineacion como RLHF o DPO. El nombre del identificador sugiere un entrenamiento orientado a retrieval de prompts ("promptriever"), con variantes etiquetadas como "JointLH4" y "random_neg" que probablemente correspondan a configuraciones de pares positivos/negativos en la tarea de recuperacion, aunque esto es una inferencia a partir del nombre y no un dato documentado.

## Capacidades

- Generacion de texto autoregresiva en el mismo rango que Llama 2 7B, sujeto al ajuste fino del adaptador.
- Presunta especializacion en recuperacion de prompts o representaciones vectoriales de instrucciones (inferida del nombre "promptriever"), sin confirmacion documental.
- Posible generacion de formatos tabulares o estructurados a partir de instrucciones (sugerido por "followtable"), no verificado.
- Soporte de tool calling / function calling: no disponible de forma nativa; Llama 2 base no lo incluye.
- Capacidades de agente y razonamiento multi-paso: no documentadas.
- Capacidades multilingues: no disponibles; Llama 2 esta predominantemente entrenado en ingles.
- Capacidades especiales (thinking mode, vision, audio): no disponibles.

## Casos de uso

- Experimentacion academica en prompt retrieval: el adaptador puede utilizarse como representacion de instrucciones para medir similitud semantica en pipelines de recuperacion, aprovechando el ajuste "random_neg" para distinguir prompts relevantes de distractores.
- Replicacion de experimentos de fine-tuning LoRA sobre Llama 2: util como referencia de configuracion para investigadores que comparan variantes de adaptadores con el mismo base.
- Evaluacion de tecnicas de pares negativos en contrastive learning: el sufijo "JointLH4_random_neg" sugiere un regimen de entrenamiento con negativos aleatorios que puede servir como baseline en estudios de retrieval.
- Prototipado de asistentes de instrucciones con formato tabular: si la hipotesis de "followtable" es correcta, podria emplearse para convertir instrucciones en tablas, aunque requeriria validacion manual exhaustiva.
- Base para fine-tuning adicional en dominios especificos: al ser un adaptador PEFT, se puede combinar o sustituir por otros adaptadores segun el framework PEFT.
- Estudio de sesgos y comportamiento de Llama 2 tras ajuste LoRA: permite analizar como un adaptador de bajo rango altera las respuestas del modelo base en tareas controladas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: el modelo base Llama-2-7b-hf requiere aproximadamente 14 GB en fp16, 28 GB en fp32 y entre 4 y 8 GB en cuantizaciones de 4 bits (Q4_K_M, GPTQ, AWQ). Los adaptadores PEFT anaden una huella pequena (del orden de decenas a cientos de MB, no especificado).
- GPU recomendadas: A100 40 GB, H100 80 GB para fp16 sin cuantizar con contexto completo; RTX 4090 (24 GB) suficiente para fp16 con contexto moderado; RTX 3090/4080 (16-24 GB) viables con cuantizacion.
- Cabe en GPU de consumo: si, en RTX 3060 12 GB o superior con cuantizacion de 4 bits; en fp16 requiere al menos 16 GB.
- Opciones de despliegue: vLLM, TGI y llama.cpp para el modelo base fusionado; para el adaptador PEFT es necesario cargar el base y aplicar el adaptador con la libreria `peft`, o fusionarlo previamente con `merge_and_unload`.
- Latencia y throughput: no disponibles; dependen del hardware, la cuantizacion y el backend, y no han sido reportados por el autor.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| `deu05232/promptriever-llama2-7B-followtable-JointLH4_random_neg` | 7B (base) + adaptador | no disponible (base: 4096) | no disponible | Hugging Face, 0 descargas | Adaptador experimental sin documentacion |
| `meta-llama/Llama-2-7b-hf` | 7B | 4096 | Llama 2 Community License | Hugging Face, ampliamente usado | Modelo base oficial, sin ajuste especifico |
| `intfloat/e5-mistral-7b-instruct` | 7B | 32 768 | MIT | Hugging Face | Modelo de embeddings para retrieval ampliamente validado, alternativa natural si el objetivo es recuperacion de prompts |
| `BAAI/bge-large-en-v1.5` | 335M | 512 | MIT | Hugging Face | Mucho mas pequeno y especializado en embeddings; sirve como baseline ligero para retrieval |

La comparacion con Llama-2-7b-hf es directa por herencia del base; las alternativas de retrieval (e5-mistral, bge) se incluyen porque el nombre del modelo sugiere ese dominio, aunque no hay evidencia documental del rendimiento relativo.

## Limitaciones y advertencias

- Model card practicamente vacia: no hay informacion sobre datos de entrenamiento, evaluacion, sesgos ni uso previsto, lo que impide validar el modelo tecnicamente.
- Licencia no declarada: el adaptador no especifica terminos, y el base Llama 2 impone la Llama 2 Community License (restricciones de uso comercial por encima de 700 millones de usuarios mensuales, obligaciones de atribucion); es necesario verificar la compatibilidad antes de cualquier uso en produccion.
- Cero descargas y cero likes: sin validacion por parte de la comunidad, lo que aumenta el riesgo de pesos defectuosos o configuraciones no reproducibles.
- Riesgo de alucinacion heredado de Llama 2 7B, acentuado por un ajuste fino no documentado que puede haber alterado el comportamiento en dominios no cubiertos.
- Idiomas no declarados: Llama 2 esta optimizado para ingles; el rendimiento en castellano no esta verificado.
- Tamano de repositorio de 14.3 GB: probablemente incluye pesos completos ademas de adaptadores, lo que puede complicar el despliegue si solo se necesitan los adaptadores.
- El identificador sugiere una tarea muy especifica (prompt retrieval con negativos aleatorios) sin metricas publicadas; no debe asumirse que supere a alternativas establecidas en ese dominio.
- No apto para uso en produccion sin evaluacion propia previa: falta de pipeline declarado, de idiomas y de benchmarks.

## Enlaces

- Hugging Face: https://huggingface.co/deu05232/promptriever-llama2-7B-followtable-JointLH4_random_neg
- Modelo base: https://huggingface.co/meta-llama/Llama-2-7b-hf
- Libreria PEFT: https://github.com/huggingface/peft
- Paper de referencia sobre impacto ambiental citado en la model card: https://arxiv.org/abs/1910.09700
- Calculadora de impacto ambiental: https://mlco2.github.io/impact
