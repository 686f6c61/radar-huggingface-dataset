# AAndy121/gemma2-2b-welfare-hi

## Resumen

AAndy121/gemma2-2b-welfare-hi es un adaptador LoRA (PEFT) publicado en HuggingFace sobre el modelo instructivo google/gemma-2-2b-it. No se trata de un modelo completo, sino de un ajuste fino supervisado (SFT) de bajo rango cuyos pesos ocupan 0,1 GB y que necesita cargar el modelo base para funcionar. El repositorio fue creado el 2 de octubre de 2026, acumula 0 descargas y 0 likes, y su model card es la plantilla por defecto de HuggingFace sin ninguna seccion completada.

El modelo base, Gemma 2 2B-IT, es un transformer decoder-only de aproximadamente 2,6 mil millones de parametros con 8.192 tokens de contexto, desarrollado por Google y entrenado con destilacion de conocimiento desde modelos mayores. El adaptador hereda por tanto esa arquitectura, ese tamano y ese limite de contexto, aunque el autor no documenta ni el dataset, ni los hiperparametros, ni el objetivo del ajuste.

La relevancia de esta ficha es limitada y fundamentalmente cautelar: sirve como ejemplo de adaptador sin documentacion tecnica, sin licencia declarada, sin evaluacion publicada y sin validacion por parte de la comunidad. Cualquier evaluacion de su calidad o de su comportamiento diferencial respecto al modelo base es, a dia de hoy, imposible con la informacion disponible.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Gemma 2) con adaptador LoRA sobre google/gemma-2-2b-it |
| Parametros totales | ~2,6 mil millones en el modelo base; el adaptador LoRA ocupa 0,1 GB en disco |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | 8.192 tokens (heredado del modelo base; no declarado en el repositorio) |
| Tipos de cuantizacion | No disponible en el repositorio; al ser un adaptador, la cuantizacion se aplica al modelo base (bf16/fp16, int8, int4 via GGUF, AWQ o GPTQ) |
| Idiomas soportados | No disponible |
| Licencia | No disponible en el repositorio; el modelo base se distribuye bajo los Terminos de uso de Gemma de Google |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |
| Desarrollador | AAndy121 |
| Modelo base | google/gemma-2-2b-it |
| Biblioteca | peft (entrenado con trl) |
| Tamano del repositorio | 0,1 GB |
| Fecha de publicacion | 2 de octubre de 2026 |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

El repositorio contiene exclusivamente pesos de adaptador LoRA en safetensors, generados con PEFT 0.21.2. Las etiquetas del repositorio indican `lora` y `sft`, lo que apunta a un ajuste fino supervisado mediante TRL sobre el modelo ya alineado por instrucciones. No se publica informacion sobre el dataset de entrenamiento, el numero de tokens vistos, la composicion de los datos, el rango del adaptador, el learning rate, la precision de entrenamiento ni si hubo fases posteriores de RLHF o DPO. Tampoco se especifica que modulos del transformer fueron adaptados.

La arquitectura subyacente es la de Gemma 2 2B: un transformer decoder-only de 26 capas con atencion por consultas agrupadas (GQA, 8 cabezas de consulta y 4 de clave/valor), atencion de ventana deslizante de 4.096 tokens alternada con capas de atencion global, soft-capping de logits y un vocabulario de 256.000 tokens. Google entreno los modelos Gemma 2 combinando datos web, codigo y matematicas con destilacion de conocimiento desde modelos de mayor tamano, pero ninguno de estos detalles se reproduce ni se confirma en la model card de este adaptador.

El unico elemento que podria sugerir un proposito concreto es el sufijo `welfare` en el nombre del repositorio, que no va acompanado de ninguna descripcion, paper o nota explicativa. La referencia `arxiv:1910.09700` que aparece en las etiquetas corresponde a la calculadora de impacto ambiental de Lacoste et al., incluida en la plantilla de HuggingFace, y no a un articulo sobre este modelo.

## Capacidades

- Generacion de texto conversacional en ingles y otros idiomas, heredada del modelo instructivo base, con calidad no verificada tras el ajuste.
- Seguimiento de instrucciones de complejidad baja o media, propio de un modelo de 2,6 mil millones de parametros.
- Generacion de codigo sencillo y explicaciones tecnicas basicas; no apto para tareas de ingenieria de software complejas.
- Aritmetica y razonamiento de un solo paso; el razonamiento multi-paso extenso esta fuera del alcance tipico de este tamano.
- Soporte de tool calling o function calling: no documentado y no confirmado en el repositorio.
- Comportamiento agentico y razonamiento multi-paso: no documentado.
- Capacidades multilingues: no disponibles; el modelo base Gemma 2 cubre varios idiomas, pero el efecto del adaptador sobre ellos es desconocido.
- Modo de pensamiento explicito, vision o audio: no disponible (el modelo base es exclusivamente de texto).

## Casos de uso

- Experimentacion academica con LoRA: el adaptador sirve como punto de partida para estudiar como un ajuste de bajo rango modificado sobre Gemma 2 2B-IT altera el comportamiento conversacional del modelo original, comparando salidas con y sin adaptador.
- Prototipado rapido de chatbots ligeros: al ejecutarse sobre un modelo de 2,6B, permite desplegar un asistente conversacional de bajo coste en una GPU de consumo para demos internas.
- Aprendizaje y docencia: util como ejemplo practico de flujo PEFT + TRL + transformers en cursos sobre ajuste fino eficiente de parametros.
- Investigacion en alineacion y seguridad: si el sufijo `welfare` refleja un ajuste orientado a comportamiento o valores, el adaptador podria emplearse para comparar respuestas frente al modelo base en baterias de evaluacion etica, siempre que el autor documentase el objetivo.
- Despliegue en el borde: fusionando el adaptador con el modelo base y cuantizando a 4 bits, es viable ejecutar inferencia en portatiles o dispositivos con 8 GB de memoria unificada o VRAM.
- Generacion de textos cortos y clasificacion mediante generacion: resumenes breves, reescritura de frases o etiquetado de textos simples en canales de bajo volumen.
- Servicio de multiples adaptadores: junto al modelo base, el adaptador puede servirse con vLLM en modo LoRA multi-tenant para comparar variantes de ajuste con una sola copia de los pesos base en VRAM.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye ninguna seccion de evaluacion completada, y el repositorio no aporta cifras de MMLU, HumanEval, GSM8K ni de ninguna otra prueba, ni comparaciones con el modelo base o con alternativas.

## Requisitos de hardware

- Tamano del adaptador: 0,1 GB en disco; se carga en memoria junto a los pesos del modelo base.
- Modelo base en bf16/fp16: aproximadamente 5,2 GB de pesos, mas la cache KV (que crece con el contexto hasta 8.192 tokens); en la practica, entre 6 y 8 GB de VRAM.
- Modelo base en int8: del orden de 2,8 a 3,5 GB de pesos, viable en GPUs de 6-8 GB.
- Modelo base en 4 bits (NF4 o GGUF Q4): del orden de 1,6 a 2,2 GB, viable en GPUs de 4-6 GB y en equipos con memoria unificada.
- GPU recomendadas: RTX 3060 12 GB, RTX 4060/4070, RTX 4090 para mayor throughput; A100 o H100 solo tienen sentido si se sirven muchas peticiones concurrentes o varios adaptadores.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU moderna con 6 GB o mas, aplicando cuantizacion de 4 u 8 bits al modelo base.
- Opciones de despliegue: transformers + peft para uso directo, vLLM con soporte de adaptadores LoRA para servir en produccion, TGI con adaptadores, y llama.cpp u Ollama tras fusionar el adaptador con el base y convertir los pesos a GGUF.
- Latencia y throughput: no disponible; no hay mediciones publicadas en el repositorio.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| AAndy121/gemma2-2b-welfare-hi | Adaptador LoRA sobre 2,6B | 8.192 tokens (heredado) | No declarada | HuggingFace, 0 descargas | Sin documentacion ni evaluacion; requiere el modelo base |
| google/gemma-2-2b-it | 2,6B | 8.192 tokens | Terminos de uso de Gemma | HuggingFace, ampliamente utilizado | Modelo base de referencia; documentado y evaluado por Google |
| meta-llama/Llama-3.2-1B-Instruct | 1,24B | 128.000 tokens | Licencia comunitaria de Llama 3.2 | HuggingFace | Contexto muy superior y amplia adopcion; menor numero de parametros |
| Qwen/Qwen2.5-1.5B-Instruct | 1,54B | 32.768 tokens | Apache 2.0 | HuggingFace | Licencia permisiva, buen rendimiento en codigo y multilingue para su tamano |
| microsoft/Phi-3.5-mini-instruct | 3,8B | 128.000 tokens | MIT | HuggingFace | Mas parametros y contexto; orientado a razonamiento y codigo |

Los datos de los modelos comparables corresponden a la documentacion publica de sus respectivos repositorios y no a mediciones realizadas sobre este adaptador. La comparacion directa con el adaptador no es posible porque no existe ninguna evaluacion publicada del mismo.

## Limitaciones y advertencias

- Model card vacia: no hay informacion sobre datos de entrenamiento, hiperparametros, licencia, idiomas ni uso previsto, lo que impide reproducir o auditar el ajuste.
- Es un adaptador, no un modelo autonomo: sin el modelo base google/gemma-2-2b-it no puede ejecutarse, y hereda todas sus limitaciones.
- Ausencia total de evaluacion: no existen benchmarks que permitan afirmar que el adaptador mejora, mantiene o degrada el rendimiento del modelo base.
- Riesgo de alucinacion elevado: en modelos de 2,6B, los datos inventados y las afirmaciones no verificadas son frecuentes, especialmente sin tecnicas de recuperacion externa.
- Sesgos heredados: el modelo base se entreno con datos web a gran escala y sus sesgos sociales y culturales persisten, sin que el adaptador documente ninguna mitigacion.
- Incertidumbre legal: el repositorio no declara licencia, pero al derivar de Gemma 2 esta sujeto a los Terminos de uso de Gemma de Google, que imponen restricciones de uso (politica de usos prohibidos) y obligaciones de atribucion. No debe asumirse uso comercial libre sin revisar dichos terminos.
- Ventana de contexto limitada a 8.192 tokens: insuficiente para conversaciones muy largas, RAG con muchos documentos o analisis de codigo extenso.
- Capacidades tecnicas limitadas: razonamiento multi-paso, matematicas avanzadas y generacion de codigo complejo estan fuera del alcance razonable de un modelo de 2,6B.
- Sin soporte de herramientas ni modo de pensamiento: no hay evidencia de tool calling, uso agentico ni modo de razonamiento explicito.
- Falta de validacion comunitaria: 0 descargas y 0 likes, con fecha de creacion y actualizacion separadas por ocho segundos, lo que sugiere una subida sin mantenimiento posterior.
- Sin garantias de produccion: no se conocen el throughput, la latencia ni la estabilidad del adaptador en entornos de alta concurrencia.

## Enlaces

- Repositorio del adaptador: https://huggingface.co/AAndy121/gemma2-2b-welfare-hi
- Modelo base: https://huggingface.co/google/gemma-2-2b-it
- Terminos de uso de Gemma: https://ai.google.dev/gemma/terms
- Politica de usos prohibidos de Gemma: https://ai.google.dev/gemma/prohibited_use_policy
- Documentacion de PEFT: https://huggingface.co/docs/peft
- Documentacion de TRL: https://huggingface.co/docs/trl
- vLLM (servicio de adaptadores LoRA): https://docs.vllm.ai
- Referencia presente en las etiquetas (calculadora de impacto ambiental, no especifica del modelo): https://arxiv.org/abs/1910.09700
