# electroglyph/Muse-Glimmer-30B-uncensored3

## Resumen

Muse-Glimmer-30B-uncensored3 es una variante "decensored" del modelo multimodal Muse-Glimmer-30B desarrollado por Meta Superintelligence Lab, publicada por el usuario electroglyph en Hugging Face. El modelo base es un transformer causal denso de aproximadamente 29.600 millones de parametros con un encoder de percepcion dedicado (ViT-G/14 de ~1.800 millones de parametros) que acepta entradas intercaladas de texto e imagen y produce texto. Esta pensado para tareas agenticas autonomas ejecutables en hardware de consumo, con soporte de razonamiento multi-paso, uso fiable de herramientas y recuperacion ante fallos.

La modificacion aplicada mediante Heretic v2.2.0.dev0 emplea una tecnica de ablacion de rango arbitrario (ARA) sobre las capas 25 a 36 del modelo, con el objetivo de reducir los rechazos (refusals) manteniendo el comportamiento general. Segun la model card del autor, la tasa de rechazos baja de 98/100 en el modelo original a 5/100 en esta version, con una divergencia KL de 0,3149 respecto al original. El resultado es un modelo que responde a practicamente cualquier peticion, lo que tiene implicaciones eticas y de seguridad importantes.

Es relevante ahora porque combina tres tendencias: modelos agenticos que corren en local sin infraestructura cloud, cuantizacion agresiva (4 bits, menos de 20 GB para el modelo de lenguaje) que permite desplegarlo en GPUs de 24-32 GB, y decodificacion especulativa mediante un drafter DFlash que acelera la generacion. La licencia Apache 2.0 del modelo base facilita su uso comercial, aunque la modificacion introduce riesgos adicionales que conviene evaluar.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal denso con encoder de percepcion (ViT-G/14) |
| Parametros totales | 29.776.626.864 (~29,8B, incluye encoder visual de ~1,8B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 131.072+ tokens |
| Tipos de cuantizacion | Full precision (FP), K-Quant-Dynamic (4 bits, ~32 GB VRAM), K-Quant-17GB (4 bits, ~24 GB VRAM) |
| Idiomas soportados | Mas de 100 idiomas segun el modelo base; lista concreta no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (libreria transformers) |

Otros datos tecnicos del modelo base: dimension oculta 6656, 52 capas, patron de atencion [Local, Local, Local, Global] con ventana deslizante de 2048, atencion con compuertas, 32 cabezas Q y 2 KV (GQA 16:1), dimension de cabeza 128, FFN SwiGLU con dimension intermedia 19.968, RoPE (theta 500.000) solo en capas locales, vocabulario de 202.048 tokens (200.000 BPE + 2.048 especiales), hasta 4.096 tokens visuales por imagen. Tamano del repositorio: 60,4 GB.

## Arquitectura y entrenamiento

El modelo base es un transformer causal denso con atencion hibrida local/global: tres capas locales por cada capa global, con ventana deslizante de 2048 tokens y RoPE aplicado unicamente en las capas locales. Usa atencion con compuertas y GQA con ratio 16:1 (32 cabezas Q, 2 KV), lo que reduce el coste de memoria del KV cache. El encoder de percepcion es un ViT-G/14 de 50 capas, anchura 1536 y patch size 14, con aproximadamente 1.800 millones de parametros, que procesa hasta 4.096 tokens visuales por imagen. El modelo fue destilado a partir de Muse Spark y entrenado con datos multimodales de fuentes publicas, datos de terceros e informacion de productos y servicios de Meta, con fecha de corte de conocimiento el 4 de enero de 2026. La model card no detalla el numero de tokens de entrenamiento ni si hubo RLHF, DPO u otras etapas de alineamiento.

La innovacion tecnica destacada es la decodificacion especulativa mediante un drafter basado en DFlash, un modelo de difusion de bloques que propone bloques de 16 tokens en un unico forward pass y que el modelo principal verifica en paralelo. La cuantizacion a 4 bits reduce el modelo de lenguaje a menos de 20 GB con una degradacion declarada del 0,2 % (K-Quant-Dynamic) o del 1,0 % (K-Quant-17GB) sobre una media de 15 benchmarks. La modificacion de esta variante concreta aplica ablacion de rango arbitrario (ARA) sobre las capas 25-36 con los parametros indicados en la model card (start_layer_index 25, end_layer_index 36, preserve_good_behavior_weight 0,8014, steer_bad_behavior_weight 0,0021, overcorrect_relative_weight 1,0115, neighbor_count 18, loss_mode relative). El proceso es reproducible segun el autor.

## Capacidades

- Generacion de texto y razonamiento multi-paso sobre horizontes largos, con planes coherentes en flujos de trabajo extendidos.
- Comprension multimodal de entrada: texto e imagenes intercaladas (capturas de pantalla, graficos, documentos), con salida solo de texto.
- Uso fiable de herramientas y function calling con esquemas precisos a lo largo de flujos prolongados.
- Comportamiento agentico de extremo a extremo: resolucion de tareas completas dentro de scaffolds, escritura y depuracion de codigo, atencion de peticiones multi-turno.
- Recuperacion ante fallos: diagnostica errores de llamadas a herramientas y reintenta en lugar de detenerse.
- Compatibilidad con scaffolds de orquestacion como OpenClaw y Hermes Agent.
- Esfuerzo de razonamiento controlable: distintos niveles de razonamiento para equilibrar calidad y velocidad.
- Multilingue: entrenado con datos de mas de 100 idiomas.
- Modo "uncensored": la ablacion reduce drasticamente los rechazos (5/100 frente a 98/100 del original), por lo que responde a practicamente cualquier peticion.

## Casos de uso

- Agentes autonomas de investigacion: el modelo puede ejecutar tareas de busqueda profunda y sintesis multi-paso (evaluado en DeepSearch QA) manteniendo coherencia sobre contextos de 131.000 tokens, lo que permite acumular resultados intermedios sin perder el hilo.
- Automatizacion de flujos con herramientas: con function calling preciso y recuperacion ante fallos, encaja en pipelines que encadenan APIs, consultas a bases de datos y ejecucion de comandos, reintentando cuando una llamada devuelve un error.
- Asistencia de programacion y depuracion: su evaluacion en SWE-Bench y su capacidad de escribir y depurar codigo lo hacen apto para integrarse en entornos de desarrollo que resuelven issues de forma autonoma dentro de un scaffold.
- Analisis de documentos y capturas: gracias al encoder visual puede interpretar graficos, tablas e imagenes de interfaz junto a la conversacion, util para extraer datos de informes o automatizar tareas sobre aplicaciones sin API.
- Despliegue local en estaciones de trabajo: con cuantizacion K-Quant-17GB cabe en GPUs de 24 GB junto al KV cache, el encoder visual y el drafter, lo que permite agentes que funcionan sin conexion ni infraestructura cloud, relevante en entornos con requisitos de privacidad.
- Atencion al cliente multi-turno: el contexto largo y el soporte multilingue (mas de 100 idiomas) permiten gestionar conversaciones extensas con historial completo y derivacion a herramientas internas.
- Generacion de contenido sin restricciones de rechazo: la variante uncensored resulta adecuada para investigacion sobre alineamiento, red teaming o generacion creativa que el modelo base rechazaria, siempre con las cautelas eticas y legales correspondientes.

## Benchmarks y rendimiento

La model card del autor solo publica metricas comparativas del proceso de ablacion, no resultados de benchmarks de capacidad:

| Metrica | Este modelo | Modelo original (Muse-Glimmer-30B) |
|---|---|---|
| Rechazos (refusals) | 5/100 | 98/100 |
| Divergencia KL | 0,3149 | 0 (por definicion) |

El modelo base menciona evaluacion en DeepSearch QA, MCP-Atlas, tau3-Bench y SWE-Bench, pero no se han publicado los valores numericos en la informacion disponible. Tampoco hay cifras de MMLU, HumanEval o GSM8K en la informacion proporcionada.

## Requisitos de hardware

- VRAM para precision completa: aproximadamente 64 GB (segun la tabla del modelo base).
- VRAM con K-Quant-Dynamic (4 bits): aproximadamente 32 GB, con degradacion media del 0,2 % en 15 benchmarks.
- VRAM con K-Quant-17GB (4 bits): aproximadamente 24 GB, con degradacion media del 1,0 %.
- Cabe en GPUs de consumo de gama alta: RTX 4090 (24 GB) con la cuantizacion de 17 GB, dejando espacio para KV cache, encoder visual y drafter; RTX 5090 o GPUs de 32 GB con K-Quant-Dynamic.
- GPUs de datacenter recomendadas para precision completa o mayor throughput: A100 80 GB, H100 80 GB.
- Opciones de despliegue: transformers (libreria declarada), endpoints compatibles; vLLM, llama.cpp, Ollama o TGI no estan confirmados en la informacion disponible.
- Latencia y throughput: no disponibles de forma numerica; el modelo base declara aceleracion mediante decodificacion especulativa con drafter DFlash (bloques de 16 tokens por forward pass) sin cifras concretas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Modalidad | Licencia | Notas |
|---|---|---|---|---|---|
| Muse-Glimmer-30B-uncensored3 | ~29,8B (denso + ViT 1,8B) | 131.072+ | Texto + imagen de entrada | Apache 2.0 | Variante sin censura, 5/100 rechazos |
| Muse-Glimmer-30B (original) | ~29,6B | 131.072+ | Texto + imagen de entrada | Apache 2.0 | 98/100 rechazos, alineado |
| Alternativas de ~30B denso con vision | no disponible | no disponible | no disponible | no disponible | No se dispone de datos comparables en la informacion proporcionada |

No se han proporcionado datos de benchmarks de capacidad que permitan una comparacion cuantitativa con modelos de la misma categoria.

## Limitaciones y advertencias

- La ablacion reduce los rechazos al 5 %, lo que implica que el modelo puede generar contenido danino, ilegal o inseguro; no es apto para despliegues de produccion sin filtros externos y supervision.
- La divergencia KL de 0,3149 respecto al original indica cambios en la distribucion de salida que pueden degradar sutilmente capacidades no medidas por la metrica de rechazos.
- Riesgo de alucinacion inherente a los modelos de lenguaje; la model card no documenta mitigaciones especificas.
- La fecha de corte de conocimiento es el 4 de enero de 2026; informacion posterior no esta cubierta.
- La lista concreta de idiomas soportados no esta disponible, solo la afirmacion de mas de 100 idiomas.
- La licencia Apache 2.0 permite uso comercial, pero el usuario es responsable de cumplir la legislacion aplicable al contenido generado y de las condiciones de uso del modelo base.
- El repositorio tiene 0 descargas y 0 likes, y fue creado en noviembre de 2026; no hay evidencia de validacion independiente de la calidad de la modificacion.
- No se confirma soporte de vLLM, llama.cpp, Ollama o TGI; la unica libreria declarada es transformers.
- Los datos de rendimiento del drafter y del throughput no se publican de forma numerica.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/electroglyph/Muse-Glimmer-30B-uncensored3
- Modelo base: https://huggingface.co/meta-models/Muse-Glimmer-30B
- Heretic (herramienta de decensurado): https://heretic-project.org
- Paper del encoder de percepcion: https://arxiv.org/abs/2504.13181
- Paper de DFlash (decodificacion especulativa por difusion de bloques): https://arxiv.org/abs/2602.06036
- Paper referenciado arxiv:2610.24628: https://arxiv.org/abs/2610.24628
- Licencia Apache 2.0: https://www.apache.org/licenses/LICENSE-2.0
