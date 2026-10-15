# maxbennett/generalized-neural-memory-ragft-counterfact

## Resumen

El modelo `maxbennett/generalized-neural-memory-ragft-counterfact` es un ajuste fino supervisado de `meta-llama/Meta-Llama-3-8B-Instruct` con 8.030.261.248 parametros, publicado por Max S. Bennett como linea base de recuperacion aumentada (RAG-FT) para el benchmark CounterFACT. Forma parte del trabajo "Tell Me What To Learn: Generalizing Neural Memory to be Controllable in Natural Language" (NeurIPS 2026, arXiv:2602.23201), firmado por Max S. Bennett, Thomas Zollo y Richard Zemel.

No se trata de un asistente conversacional de proposito general, sino de un artefacto de investigacion. Se entrena con los mismos datos y el mismo objetivo que el sistema Generalized Neural Memory (GNM) descrito en el articulo, pero en lugar de almacenar el conocimiento en los pesos, recupera pares documento-instruccion de un almacen vectorial en el momento de la consulta. Su funcion es servir de comparacion controlada: permite medir cuanto aporta la memoria parametrica frente a la recuperacion externa cuando ambos sistemas ven exactamente la misma informacion de entrenamiento.

El problema que aborda es la adaptacion continua en entornos no estacionarios, donde el reentrenamiento completo y el aprendizaje en contexto resultan caros o fragiles. El repositorio tiene 16,1 GB, 8 descargas y 0 likes en el momento de la consulta, lo que lo situa como un recurso de investigacion de adopcion muy limitada y sin validacion independiente. No se publican en la model card ni en los resultados de busqueda datos sobre longitud de contexto nativa, idiomas soportados ni cuantizaciones disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Llama 3), segun el modelo base |
| Parametros totales | 8.030.261.248 |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada; el modelo base Meta-Llama-3-8B-Instruct declara 8.192 tokens |
| Tipos de cuantizacion | No disponible (el repositorio solo distribuye pesos sin cuantizar; no se publican versiones GGUF, AWQ ni GPTQ) |
| Idiomas soportados | No disponible (el modelo base esta optimizado para ingles; el ajuste CounterFACT se entrena sobre un dataset de investigacion sin declaracion de cobertura multilingue) |
| Licencia | llama3 (Llama 3 Community License) |
| Formato de pesos | safetensors en HuggingFace; el repositorio de codigo descarga el checkpoint como `models/rag_ft_counterfact/model.pth` |

## Arquitectura y entrenamiento

La arquitectura corresponde a la del modelo base: un transformer decoder-only de 8.000 millones de parametros con normalizacion RMSNorm, activacion SwiGLU, codificaciones posicionales RoPE y atencion agrupada (GQA) con 8 cabezas de clave/valor. Sobre esa base se aplica un ajuste fino de recuperacion aumentada (RAG-FT): en tiempo de consulta, el sistema recupera pares documento-instruccion de un almacen vectorial y los concatena al prompt antes de la generacion. La clave metodologica es que este modelo se entrena con los mismos datos y el mismo objetivo que GNM, de modo que las diferencias de rendimiento observadas en el benchmark CounterFACT se atribuyan al mecanismo de memoria y no a la distribucion de entrenamiento.

El dataset asociado es `maxbennett/generalized-neural-memory-counterfact`. No se especifica en la informacion disponible el numero de tokens de entrenamiento, la composicion exacta del corpus ni si se aplicaron fases de RLHF o DPO posteriores al ajuste supervisado heredado de Llama 3 Instruct. La innovacion tecnica del trabajo, segun el resumen del articulo, es permitir actualizaciones de memoria guiadas por instrucciones en lenguaje natural, en lugar de asumir un unico objetivo fijo de memoria, lo que habilita casos de uso en dominios criticos donde el agente debe aprender de fuentes heterogeneas. Este checkpoint concreto representa la variante con recuperacion externa, no la variante de memoria neural.

## Capacidades

- Generacion de texto condicionada a contexto recuperado: el modelo consume pares documento-instruccion y produce respuestas basadas en ellos.
- Aprendizaje guiado por instrucciones de memoria: el sistema del articulo permite especificar en lenguaje natural que debe actualizarse y con que criterio.
- Evaluacion de hechos contrafactuales: disenado especificamente para el benchmark CounterFACT, orientado a comprobar si el modelo aplica la informacion actualizada frente al conocimiento previo.
- Uso como linea base de investigacion: sirve para aislar la contribucion de la memoria parametrica frente a la recuperacion vectorial.
- Soporte de conversacion: el pipeline declarado es `text-generation` y entre los tags figura `conversational`, aunque no se documenta un formato de chat especifico para este checkpoint.
- Tool calling / function calling: no disponible en la informacion proporcionada.
- Capacidades de agente y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible en la informacion proporcionada.
- Capacidades especiales (modo de razonamiento explicito, vision, audio): no disponible; el modelo es exclusivamente de texto.

## Casos de uso

- Reproduccion de resultados del benchmark CounterFACT: el repositorio de codigo incluye los comandos de evaluacion correspondientes a la Tabla 1 del articulo, de modo que este checkpoint se usa para replicar la comparativa entre memoria neural y recuperacion aumentada.
- Linea base en experimentos de memoria neuronal: cualquier investigador que proponga un mecanismo de memoria parametrica puede contrastarlo contra este modelo para comprobar si su metodo supera realmente a un RAG bien ajustado con los mismos datos.
- Estudio de edicion de conocimiento: al trabajar con hechos contrafactuales, permite analizar si el modelo prioriza el documento recuperado o el conocimiento adquirido durante el preentrenamiento, un fenomeno central en la literatura de edicion de conocimiento.
- Investigacion en adaptacion continua: el escenario del articulo incluye entornos no estacionarios; este checkpoint sirve para medir el coste y la fragilidad de la alternativa de recuperacion frente a la actualizacion de pesos.
- Punto de partida para ajuste fino en dominios con normativa cambiante: equipos que necesiten un modelo que consulte documentacion versionada (por ejemplo, reglamentos tecnicos o protocolos clinicos) pueden usar este checkpoint como base experimental antes de invertir en un pipeline propio.
- Evaluacion de arquitecturas de recuperacion: dado que el modelo esta ajustado para consumir contexto recuperado, resulta util para comparar estrategias de indexacion, tamanos de fragmento o numero de documentos recuperados manteniendo constante el generador.
- Analisis de robustez ante contexto irrelevante: permite estudiar como degrada un modelo de 8.000 millones de parametros cuando el almacen vectorial devuelve documentos poco pertinentes, un fallo habitual en produccion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card remite a la Tabla 1 del repositorio de codigo para los resultados de la evaluacion CounterFACT, pero las cifras concretas no se reproducen en los materiales consultados. Tampoco se aportan resultados de MMLU, HumanEval, GSM8K ni de ninguna otra evaluacion estandar.

## Requisitos de hardware

- VRAM estimada para inferencia en precision fp16/bf16: en torno a 16 GB solo para los pesos (el repositorio ocupa 16,1 GB), mas la cache KV y el contexto recuperado; se recomienda un minimo de 24 GB.
- VRAM estimada en cuantizacion de 8 bits: aproximadamente 9-10 GB, aunque el autor no publica pesos cuantizados, por lo que requeriria cuantizar el modelo uno mismo.
- VRAM estimada en cuantizacion de 4 bits: aproximadamente 5-6 GB, con la misma salvedad anterior.
- GPU recomendadas: A100 40/80 GB o H100 para evaluacion por lotes del benchmark; RTX 4090 (24 GB) o A10G (24 GB) para inferencia en fp16 de una sola peticion; RTX 3090 (24 GB) como alternativa de coste.
- Cabe en GPU de consumo: si, en fp16 en tarjetas de 24 GB (RTX 3090, 4090) y en 4-8 bits en tarjetas de 8-12 GB, siempre que se cuantice de forma manual.
- Opciones de despliegue: el flujo documentado es el repositorio propio `github.com/maxbennett/Generalized-Neural-Memory`, que carga el checkpoint como `model.pth` mediante `scripts/download_models.py --counterfact`. No se documenta soporte oficial para vLLM, llama.cpp, Ollama ni TGI; al tratarse de pesos con arquitectura Llama 3 en safetensors, vLLM deberia poder cargarlos, pero no hay confirmacion del autor.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Enfoque | Adopcion |
|---|---|---|---|---|---|
| generalized-neural-memory-ragft-counterfact | 8,03 B | No disponible (base: 8.192) | Llama 3 Community License | Linea base RAG-FT para el benchmark CounterFACT | 8 descargas, 0 likes |
| meta-llama/Meta-Llama-3-8B-Instruct | 8,03 B | 8.192 | Llama 3 Community License | Asistente conversacional de proposito general | Muy alta |
| meta-llama/Llama-3.1-8B-Instruct | 8,03 B | 128.000 | Llama 3.1 Community License | Asistente conversacional, tool calling y multilingue | Muy alta |
| mistralai/Mistral-7B-Instruct-v0.3 | 7,25 B | 32.000 | Apache 2.0 | Asistente conversacional con function calling | Alta |

La comparacion con los tres alternativas anteriores es estructural (parametros, contexto y licencia); no es posible comparar rendimiento porque no hay cifras publicadas para este checkpoint en la informacion disponible. Conviene subrayar que los tres modelos de contraste estan pensados para uso conversacional general, mientras que este checkpoint es un artefacto de evaluacion con un objetivo acotado.

## Limitaciones y advertencias

- Ausencia total de datos de rendimiento: no hay benchmark publicado en los materiales consultados, por lo que no puede justificarse su uso en produccion sobre la base de resultados medidos.
- Adopcion practicamente nula: 8 descargas y 0 likes implican que no existe validacion independiente, ni issues reportados, ni conversiones comunitarias.
- Naturaleza de investigacion: es una linea base para un benchmark concreto; no esta disenado como asistente general y no se documenta su comportamiento fuera del dominio CounterFACT.
- Dependencia del recuperador: su calidad depende por completo del almacen vectorial y de la estrategia de recuperacion empleada; documentos irrelevantes degradaran la salida sin que el modelo pueda corregirlo.
- Riesgo de alucinacion: como cualquier modelo de 8.000 millones de parametros, puede generar afirmaciones no respaldadas por el contexto recuperado, especialmente cuando la respuesta exige combinar varios documentos.
- Sesgos: no disponibles; no se documenta ninguna evaluacion de sesgo, toxicidad ni equidad, y el dataset de entrenamiento es de procedencia no detallada.
- Limitaciones de idioma: no se declara cobertura multilingue; el preentrenamiento de Llama 3 esta centrado en ingles y el ajuste se realiza sobre un corpus de investigacion sin declaracion de idiomas.
- Limitaciones de contexto: la longitud de contexto efectiva no se especifica para este checkpoint, y el uso de contexto recuperado consume parte de la ventana disponible.
- Restricciones de licencia: se hereda la Llama 3 Community License, que exige incluir la atribucion "Built with Meta Llama 3", aceptar la politica de uso aceptable de Meta y solicitar licencia adicional si se superan los 700 millones de usuarios activos mensuales. No es una licencia permisiva tipo Apache 2.0.
- Formato de artefacto: la distribucion como `model.pth` ligada a un repositorio de codigo concreto dificulta su integracion en servidores de inferencia estandar sin trabajo adicional de conversion.
- Reproducibilidad: no se detallan hiperparametros de entrenamiento, numero de tokens ni composicion del dataset en la model card.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/maxbennett/generalized-neural-memory-ragft-counterfact
- Repositorio de codigo: https://github.com/maxbennett/Generalized-Neural-Memory
- Articulo en arXiv (resumen): https://arxiv.org/abs/2602.23201
- Articulo en arXiv (PDF v2): https://arxiv.org/pdf/2602.23201v2
- Articulo en OpenReview (PDF): https://openreview.net/pdf/96503d3c76e057e2d62d15f5270e073eaca9d8c8.pdf
- Dataset de entrenamiento: https://huggingface.co/datasets/maxbennett/generalized-neural-memory-counterfact
- Modelo base: https://huggingface.co/meta-llama/Meta-Llama-3-8B-Instruct
- Checkpoint hermano (variante CounterFACT con GNM): https://huggingface.co/maxbennett/generalized-neural-memory-rag-facts
