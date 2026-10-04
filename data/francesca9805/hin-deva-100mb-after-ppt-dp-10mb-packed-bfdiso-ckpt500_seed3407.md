# francesca9805/hin-deva-100mb-after-ppt-Dp-10mb-packed-bfdiso-ckpt500_seed3407

## Resumen

El modelo `francesca9805/hin-deva-100mb-after-ppt-Dp-10mb-packed-bfdiso-ckpt500_seed3407` es un ajuste fino (SFT) del checkpoint base `francesca9805/hin-deva-100mb-ppt-Dp-10mb-packed-bfdiso_seed3407`, publicado por el usuario francesca9805. Se trata de un modelo decoder-only de la familia GPT-2 con 124.770.816 parametros totales (aproximadamente 124,8 millones), distribuido en formato `safetensors` y entrenado con la libreria TRL (version 0.23.0) sobre Transformers 4.56.2.

Por la nomenclatura del identificador ("hin-deva", "100mb", "packed", "ckpt500") se deduce que forma parte de un experimento de investigacion centrado en hindi escrito en devanagari, con un corpus de aproximadamente 100 MB y un tokenizador propio, entrenado durante 500 pasos de checkpoint con la semilla 3407. No obstante, ni la model card ni los metadatos de HuggingFace confirman oficialmente el idioma, el tamano de contexto ni la composicion del dataset.

El modelo es relevante unicamente como artefacto de investigacion: acumula 0 descargas y 0 likes, no declara licencia efectiva y no publica resultados de evaluacion. Su interes practico es limitado y se circunscribe a reproducir experimentos de ajuste supervisado sobre modelos GPT-2 pequenos en idiomas de bajos recursos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GPT-2 (transformer decoder-only), segun etiquetas del repositorio |
| Parametros totales | 124.770.816 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (solo pesos `safetensors` en precision completa) |
| Idiomas soportados | no disponible (el identificador sugiere hindi en devanagari, sin confirmar) |
| Licencia | no disponible (la model card indica "licence: license" sin especificar) |
| Formato de pesos | safetensors |
| Libreria | transformers |
| Tamano del repositorio | 5,2 GB |
| Modelo base | francesca9805/hin-deva-100mb-ppt-Dp-10mb-packed-bfdiso_seed3407 |
| Pipeline | text-generation |
| Fecha de creacion | 2026-10-03 |
| Fecha de actualizacion | 2026-10-04 |

## Arquitectura y entrenamiento

La etiqueta `gpt2` y el contaje de parametros (124,8 M) situan al modelo en la arquitectura GPT-2 small: un transformer decoder-only con atencion causal, normalizacion LayerNorm previa y embeddings posicionales aprendidos. Al tratarse de un ajuste fino de un checkpoint base que, por su nombre, procede de un pipeline propio de tokenizacion ("new-tokenizers" en el proyecto de Weights & Biases), es probable que el vocabulario no coincida con el del GPT-2 original, aunque este extremo no esta documentado.

El entrenamiento se realizo mediante SFT (supervised fine-tuning) con TRL 0.23.0, Transformers 4.56.2, PyTorch 2.11.0, Datasets 4.8.4 y Tokenizers 0.22.1. No se especifica el numero de tokens de entrenamiento, la composicion del dataset, la existencia de fases de RLHF o DPO, ni hiperparametros como tasa de aprendizaje, batch size o regimen de precision. El sufijo "ckpt500" indica que se trata del checkpoint del paso 500 de un run de entrenamiento; "bfdiso" y "packed" sugieren empaquetado de secuencias y posible uso de bfloat16, extremos no verificables con la informacion disponible. Existe un enlace publico al run de Weights & Biases, pero no se han extraido de el mas datos.

## Capacidades

- Generacion de texto autoregresiva basica, heredada de la arquitectura GPT-2.
- Ajuste supervisado orientado a seguir instrucciones conversacionales: el ejemplo de la model card usa el formato de mensajes `[{"role": "user", "content": ...}]` mediante `transformers.pipeline`.
- Generacion condicionada por prompt en un unico turno; no hay evidencia de soporte multi-turno robusto.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes, planificacion multi-paso ni razonamiento explicito ("thinking mode").
- No se documentan capacidades de vision, audio ni multimodalidad.
- Capacidad multilingue no confirmada; el identificador apunta a hindi, pero la model card no lo declara.
- Capacidad de codigo y matematicas no documentada.

## Casos de uso

- Reproduccion de experimentos academicos: el modelo sirve como punto de comparacion en estudios sobre ajuste supervisado de GPT-2 en idiomas de bajos recursos, dado que el identificador expone la semilla (3407) y el paso de checkpoint (500).
- Analisis de tokenizadores para hindi/devanagari: al proceder de un pipeline de tokenizacion propio, permite inspeccionar como un vocabulario especifico segmenta texto en devanagari frente al tokenizador BPE original de GPT-2.
- Pruebas de pipelines de generacion con TRL y Transformers: util para validar integraciones de `text-generation-inference` y `endpoints_compatible` en entornos de desarrollo con modelos de menos de 200 M de parametros.
- Docencia y formacion: su tamano reducido permite ejecutar inferencia en CPU o en cualquier GPU consumer, lo que lo hace util para demostrar el ciclo completo de SFT en un aula o taller.
- Prototipado rapido de interfaces conversacionales de un solo turno, siempre que el dominio sea el idioma y el estilo del corpus de ajuste (no verificado) y no se requiera precision alta.
- Evaluacion de tecnicas de cuantizacion: al pesar menos de 500 MB en fp32, es un banco de pruebas comodo para medir perdida de calidad al pasar a int8 o int4 con llama.cpp o similar (previa conversion, no incluida en el repositorio).
- Investigacion sobre "packing" de secuencias: el sufijo "packed" sugiere que el entrenamiento uso empaquetado de muestras; el modelo permite analizar el efecto de esta tecnica en modelos pequenos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye tablas de MMLU, HumanEval, GSM8K, perplexity ni ninguna otra metrica, y los resultados de la busqueda web no guardan relacion con el modelo (corresponden a guias de viaje).

## Requisitos de hardware

- VRAM en fp32: aproximadamente 500 MB solo para los pesos (124,8 M x 4 bytes), mas activaciones y cache KV.
- VRAM en bf16/fp16: aproximadamente 250 MB para los pesos.
- VRAM en int8: aproximadamente 125 MB; en int4, unos 62 MB.
- Cabe holgadamente en cualquier GPU consumer: RTX 3060, RTX 4060, RTX 4090, e incluso en GPUs integradas o en CPU con memoria RAM moderada.
- GPU de datacenter (A100, H100) innecesarias; solo tendrian sentido para lotes masivos o entrenamiento.
- Despliegue posible con Transformers `pipeline`, text-generation-inference (el repositorio esta marcado como `endpoints_compatible`), y, previa conversion manual a GGUF, con llama.cpp u Ollama. No se distribuyen pesos GGUF ni cuantizados.
- No se dispone de datos de latencia ni throughput publicados. Dado el tamano, se espera latencia de decenas de milisegundos por token en GPU moderna y de orden de cientos de milisegundos en CPU, pero son estimaciones no verificadas.
- El repositorio ocupa 5,2 GB, muy por encima de los ~500 MB de los pesos, lo que sugiere que incluye checkpoints intermedios u optimizador; la descarga completa no es necesaria para inferencia.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| francesca9805/hin-deva-...-ckpt500_seed3407 | 124,8 M | no disponible | no disponible | HuggingFace, 0 descargas |
| GPT-2 small (OpenAI) | 124 M | 1.024 tokens | MIT | Ampliamente disponible |
| DistilGPT-2 (HuggingFace) | 82 M | 1.024 tokens | Apache 2.0 | Ampliamente disponible |
| SmolLM-135M (HuggingFace) | 135 M | 2.048 tokens | Apache 2.0 | Ampliamente disponible |

La comparacion se limita a parametros, contexto y licencia, ya que no existen resultados de evaluacion publicados para el modelo analizado que permitan contrastar rendimiento. Frente a GPT-2 small conserva un tamano equivalente, pero carece de licencia clara y de soporte de la comunidad. DistilGPT-2 y SmolLM-135M ofrecen licencias permisivas y contextos documentados, lo que los hace preferibles para cualquier uso en produccion.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados, pero al derivar de GPT-2 y de un corpus no descrito, es probable que herede sesgos de genero, religion y nacionalidad del material de entrenamiento, agravados por el posible sesgo de un corpus reducido (unos 100 MB) centrado en un unico idioma.
- Riesgo de alucinacion: alto. Con 124,8 M de parametros y sin fases de alineacion documentadas (no consta RLHF ni DPO), no hay mecanismos que reduzcan la generacion de contenido falso.
- Limitaciones de contexto e idioma: la longitud de contexto no esta declarada y el soporte multilingue no esta confirmado; todo uso fuera del idioma y dominio de ajuste es especulativo.
- Restricciones de licencia: la model card indica "licence: license" sin concretar, y los metadatos de HuggingFace marcan la licencia como no disponible. No hay autorizacion explicita de uso comercial; se desaconseja emplearlo en produccion sin aclarar la licencia con el autor.
- Madurez: 0 descargas y 0 likes, sin benchmarks, sin documentacion de datos ni hiperparametros, y publicado en un repositorio de 5,2 GB que mezcla pesos y posibles checkpoints intermedios. No es un artefacto listo para produccion.
- Ausencia de pesos cuantizados: no se distribuyen versiones GGUF, AWQ, GPTQ ni ONNX, por lo que cualquier despliegue eficiente exige conversion manual y validacion adicional.
- Procedencia del tokenizador incierta: si el vocabulario difiere del GPT-2 estandar, las herramientas que asumen el tokenizador original pueden producir resultados incorrectos.

## Enlaces

- HuggingFace: https://huggingface.co/francesca9805/hin-deva-100mb-after-ppt-Dp-10mb-packed-bfdiso-ckpt500_seed3407
- Modelo base: https://huggingface.co/francesca9805/hin-deva-100mb-ppt-Dp-10mb-packed-bfdiso_seed3407
- Run de entrenamiento en Weights & Biases: https://wandb.ai/f-padovani-university-of-groningen/new-tokenizers/runs/h01vk3kf
- Repositorio de TRL: https://github.com/huggingface/trl
- Paper de TRL (von Werra et al., 2020): https://github.com/huggingface/trl (referencia BibTeX incluida en la model card; no se proporciona enlace a publicacion independiente)
