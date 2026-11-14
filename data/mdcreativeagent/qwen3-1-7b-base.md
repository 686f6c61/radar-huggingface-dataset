# mdcreativeagent/Qwen3-1.7B-Base

## Resumen

Qwen3-1.7B-Base es la variante base (solo preentrenada) del modelo denso de 1.700 millones de parametros de la familia Qwen3, desarrollada por el equipo Qwen de Alibaba. Esta publicacion concreta en Hugging Face corresponde al repositorio del usuario `mdcreativeagent`, que redistribuye los pesos originales bajo licencia Apache 2.0. Al ser un modelo "Base" y no "Instruct", no ha pasado por etapas de ajuste fino supervisado ni de alineamiento por preferencias, por lo que su funcion es servir como punto de partida para tareas de continuacion de texto y para ajuste fino posterior.

La relevancia de esta variante radica en su tamano contenido: con 1.720.574.976 parametros totales (1.400 millones sin contar embeddings) y una ventana de contexto de 32.768 tokens, es un modelo que puede ejecutarse en GPU de consumo y sirve como base para experimentacion e investigacion. La familia Qwen3 se entreno sobre 36 billones de tokens en 119 idiomas, triplicando la cobertura linguistica de Qwen2.5, e incorpora mejoras arquitectonicas como qk layernorm en todos los modelos y un preentrenamiento en tres etapas.

El problema que resuelve es el de disponer de un modelo base pequeno, con contexto largo y licencia permisiva, sobre el que construir ajustes finos especializados sin partir de cero. Frente a modelos base de mayor tamano, ofrece un coste de inferencia y de ajuste mucho menor, a cambio de una capacidad de razonamiento y conocimiento factico mas limitada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal denso (no MoE) |
| Parametros totales | 1.720.574.976 |
| Parametros activos | No aplica (modelo denso) |
| Parametros sin embeddings | 1.400 millones |
| Longitud de contexto | 32.768 tokens |
| Tipos de cuantizacion | No disponible en la informacion proporcionada (pesos originales en safetensors, probablemente bfloat16) |
| Idiomas soportados | No disponible en la model card; el preentrenamiento de la familia Qwen3 cubre 119 idiomas |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |
| Capas | 28 |
| Cabezas de atencion | 16 para Q y 8 para KV (GQA) |
| Etapa de entrenamiento | Solo preentrenamiento (Base) |
| Tamano del repositorio | 3,4 GB |
| Libreria | transformers (requiere version >= 4.51.0) |

## Arquitectura y entrenamiento

El modelo es un transformer causal denso con 28 capas y atencion con query-key layernorm, una de las refinaciones arquitectonicas introducidas en Qwen3. Usa Grouped Query Attention con 16 cabezas de query y 8 de key/value, lo que reduce el coste de memoria de la cache KV durante la inferencia. Al tratarse de la variante densa de 1,7B, no emplea mezcla de expertos ni el global-batch load balancing loss que la familia aplica a sus modelos MoE.

El preentrenamiento de la familia Qwen3 se estructuro en tres etapas: la primera orientada a modelado de lenguaje general y adquisicion de conocimiento, la segunda centrada en razonamiento STEM, codigo y logica, y la tercera dedicada a extender la comprension de contexto largo hasta secuencias de 32k tokens. El corpus total asciende a 36 billones de tokens en 119 idiomas, con mezcla de datos de codigo, STEM, razonamiento, libros, multilingue y datos sinteticos. Los hiperparametros se ajustaron mediante estudios de scaling law especificos para modelos densos y MoE. Esta publicacion concreta es solo la etapa de preentrenamiento: no consta que se hayan aplicado SFT, RLHF ni DPO sobre estos pesos.

## Capacidades

- Generacion de texto por continuacion: al ser un modelo Base, su funcion principal es completar secuencias, no seguir instrucciones.
- Modelado de lenguaje general y conocimiento factico adquirido durante el preentrenamiento.
- Razonamiento STEM y logico, reforzado en la segunda etapa de preentrenamiento.
- Generacion de codigo, gracias a la inclusion de datos de programacion en el corpus.
- Comprension de contexto largo de hasta 32.768 tokens, entrenado explicitamente para secuencias de 32k en la tercera etapa.
- Capacidades multilingues derivadas del corpus de 119 idiomas de la familia (el detalle por idioma no esta disponible).
- Punto de partida para ajuste fino supervisado, RLHF/DPO o destilacion.
- No dispone de tool calling, modo thinking, vision ni audio de forma nativa: esas capacidades pertenecen a las variantes Instruct y a otros modelos de la familia.

## Casos de uso

- Ajuste fino supervisado para dominios verticales: al ser un modelo Base, se puede entrenar con pares instruccion-respuesta propios (legal, sanitario, atencion al cliente) sin arrastrar el sesgo conversacional de un modelo ya alineado, y con un coste de computo bajo por su tamano de 1,7B.
- Continuacion de texto especializada: generacion de documentacion tecnica, articulos o resumenes a partir de un prefijo, aprovechando la ventana de 32k tokens para incluir contexto extenso en el prompt.
- Generacion de codigo asistida en pipelines internos: el modelo puede completar funciones y fragmentos de codigo, y ajustarse despues con un dataset propio del repositorio para mejorar la adherencia al estilo del equipo.
- Investigacion en interpretabilidad y mecanistica: su tamano reducido permite ejecutar experimentos de analisis de activaciones, attention patterns y circuitos en una sola GPU, algo inviable con modelos de decenas de miles de millones de parametros.
- Destilacion hacia modelos mas pequenos: sirve como profesor o como alumno en experimentos de destilacion, dado su equilibrio entre capacidad y coste.
- Evaluacion comparativa de tecnicas de preentrenamiento: util como linea base densa de referencia frente a variantes MoE de la misma familia en estudios de eficiencia.
- Prototipado de aplicaciones de contexto largo: clasificacion o extraccion de informacion sobre documentos de hasta 32k tokens en entornos con recursos limitados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card remite al blog y al informe tecnico de Qwen3 para los resultados detallados, pero no incluye cifras concretas para esta variante.

## Requisitos de hardware

- VRAM estimada en bfloat16: aproximadamente 3,4 GB solo para los pesos, mas la cache KV y activaciones; en la practica, entre 4 y 8 GB segun la longitud de contexto.
- VRAM estimada en cuantizacion de 8 bits: alrededor de 1,8-2 GB para los pesos.
- VRAM estimada en cuantizacion de 4 bits: alrededor de 1-1,2 GB para los pesos.
- GPU recomendadas para produccion: A100, H100 o L40S para despliegues con alta concurrencia y contexto largo.
- GPU de consumo: cabe holgadamente en RTX 4090, RTX 4080, RTX 3090 y en tarjetas con 8 GB o mas; con cuantizacion de 4 bits podria ejecutarse en GPUs de 6-8 GB.
- Opciones de despliegue: transformers (version >= 4.51.0), vLLM, TGI (el tag `text-generation-inference` esta presente), llama.cpp y Ollama mediante conversion a GGUF.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Etapa | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3-1.7B-Base (esta publicacion) | 1,72B | 32.768 | Apache 2.0 | Base | Hugging Face (repo de terceros) |
| Qwen3-1.7B (variante oficial) | 1,72B | 32.768 | Apache 2.0 | Base / Instruct | Hugging Face (repo oficial Qwen) |
| Qwen2.5-1.5B | 1,5B aprox. | 32.768 (variantes extendidas) | Apache 2.0 | Base / Instruct | Hugging Face |
| Llama 3.2 1B | 1,2B aprox. | 128.000 | Llama 3.2 Community License | Base / Instruct | Hugging Face |

La comparacion de rendimiento entre estos modelos no esta disponible en la informacion proporcionada. Como referencia estructural, Qwen3-1.7B amplia la cobertura linguistica y el corpus de preentrenamiento respecto a Qwen2.5, mientras que Llama 3.2 1B ofrece una ventana de contexto mayor pero con una licencia comunitaria mas restrictiva que Apache 2.0.

## Limitaciones y advertencias

- Al ser un modelo Base, no sigue instrucciones de forma fiable; para uso conversacional requiere ajuste fino o el uso de la variante Instruct.
- Riesgo elevado de alucinacion en preguntas facticas, especialmente sin ajuste posterior ni tecnicas de grounding.
- No se han publicado evaluaciones de sesgo para esta publicacion concreta; los sesgos del corpus de preentrenamiento pueden propagarse.
- La model card no detalla los idiomas soportados a nivel individual, solo la cobertura agregada de la familia (119 idiomas).
- Esta publicacion es una redistribucion de terceros (`mdcreativeagent`) con 0 descargas y 0 likes; no es el repositorio oficial de Qwen, por lo que conviene verificar la integridad de los pesos antes de usarlos en produccion.
- La fecha de creacion del repositorio (2026-11-14) es posterior a la publicacion original de Qwen3; no se dispone de informacion sobre posibles modificaciones de los pesos.
- Requiere `transformers>=4.51.0`; con versiones anteriores se produce un `KeyError: 'qwen3'`.
- Aunque la licencia Apache 2.0 permite uso comercial, la ausencia de alineamiento hace desaconsejable su despliegue directo ante usuarios finales sin una capa de moderacion y ajuste.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/mdcreativeagent/Qwen3-1.7B-Base
- Blog de Qwen3: https://qwenlm.github.io/blog/qwen3/
- Repositorio GitHub de Qwen3: https://github.com/QwenLM/Qwen3
- Documentacion de Qwen: https://qwen.readthedocs.io/en/latest/
- Informe tecnico (arXiv 2505.09388): https://arxiv.org/abs/2505.09388
