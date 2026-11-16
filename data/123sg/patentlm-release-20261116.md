# 123sg/PatentLM-Release-20261116

## Resumen

PatentLM-3B es un modelo de lenguaje de 3.000 millones de parametros especializado en el dominio de patentes, desarrollado por el usuario 123sg y publicado en Hugging Face bajo el identificador `123sg/PatentLM-Release-20261116`. Segun la model card, se trata de un ajuste por continuacion (continued pretraining) sobre un modelo base abierto, entrenado con abstracts de patentes, reivindicaciones (claims) e historiales de tramitacion (prosecution histories). La arquitectura declarada es `qwen2`, por lo que hereda el diseño transformer decoder-only de la familia Qwen2.

El modelo se distribuye como un conjunto de diez checkpoints correspondientes a los puntos de evaluacion de la "2026 patent adaptation run", junto con un arnes de evaluacion (`evaluation/eval.py`) y un registro de resultados. La model card presenta una tabla de quince categorias de benchmark con puntuaciones de exactitud que, segun el autor, proceden del registro de evaluacion del checkpoint seleccionado.

Es relevante ahora porque aborda un nicho poco cubierto por los modelos generalistas: el procesamiento de lenguaje tecnico-juridico de patentes (redaccion de reivindicaciones, resumen de historiales, clasificacion). No obstante, la informacion publica es muy limitada: el repositorio figura con 0,0 GB de tamano, sin descargas ni likes, sin idiomas declarados y sin detalle sobre el dataset de entrenamiento, el modelo base exacto ni la longitud de contexto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Qwen2, segun tag `qwen2`) |
| Parametros totales | 3B (aproximadamente 3.000 millones, segun nombre del modelo) |
| Parametros activos | no disponible (no es MoE segun la informacion disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | no disponible (repositorio de 0,0 GB; la model card menciona directorios `checkpoints/` con configuracion y pesos, sin especificar formato) |

## Arquitectura y entrenamiento

La arquitectura es un transformer decoder-only de la familia Qwen2, con aproximadamente 3.000 millones de parametros. El modelo se obtiene por continued pretraining sobre un modelo base abierto (no se especifica cual) utilizando un corpus de dominio de patentes compuesto por abstracts, reivindicaciones e historiales de tramitacion. No se indica el numero de tokens de entrenamiento, la composicion exacta del dataset, ni si se aplicaron fases de RLHF, DPO o SFT posteriores.

El autor publica diez checkpoints independientes y autocontenidos (configuracion mas pesos) correspondientes a puntos de evaluacion de la "2026 patent adaptation run", asi como un arnes de evaluacion reproducible (`evaluation/eval.py`) y puntos de entrada por categoria en `evaluation/benchmarks/`. No se documentan innovaciones tecnicas adicionales como decodificacion especulativa, atencion lineal o modos de razonamiento explicito.

## Capacidades

- Generacion de texto en el dominio de patentes: redaccion y continuacion de abstracts, reivindicaciones y descripciones tecnicas.
- Razonamiento matematico y logico: la model card reporta puntuaciones en categorias de "Math Reasoning" y "Logical Reasoning".
- Comprension lectora y question answering: evaluado en las categorias "Reading Comprehension" y "Question Answering".
- Clasificacion de texto y analisis de sentimiento: categorias "Text Classification" y "Sentiment Analysis".
- Generacion de codigo: evaluado en "Code Generation", aunque el dominio de especializacion es patentes.
- Resumen: categoria "Summarization", aplicable a resumenes de historiales de tramitacion.
- Traduccion: categoria "Translation" reportada en la tabla de benchmarks.
- Seguimiento de instrucciones: categoria "Instruction Following".
- Recuperacion de conocimiento: categoria "Knowledge Retrieval".
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible (el campo de idiomas no esta declarado).
- Capacidades especiales (vision, audio, thinking mode): no disponible.

## Casos de uso

- Redaccion asistida de reivindicaciones: el modelo puede generar borradores de claims a partir de una descripcion tecnica, aprovechando su ajuste sobre corpus de reivindicaciones reales; adecuado para despachos de propiedad industrial que necesitan primeras versiones revisables por un agente de patentes.
- Resumen de historiales de tramitacion: sintetizar prosecution histories (respuestas a objeciones, enmiendas, argumentos) en resumenes estructurados para abogados y examinadores, apoyandose en la categoria de summarization evaluada.
- Clasificacion y triaje de solicitudes: categorizar solicitudes de patente por area tecnica (CPC/IPC) usando las capacidades de text classification reportadas, para enrutar expedientes en un back office.
- Busqueda semantica y recuperacion de conocimiento: generar representaciones o respuestas sobre un corpus de patentes para sistemas de prior art search, apoyandose en la categoria "Knowledge Retrieval".
- Extraccion de entidades y datos tecnicos: identificar componentes, materiales, rangos numericos y relaciones en descripciones de patentes para poblar bases de datos estructuradas.
- Generacion de resumenes de estado de la tecnica: producir sintesis de familias de patentes y comparativas tecnicas para informes de libertad de operacion.
- Asistencia en traduccion tecnica de documentacion de patentes entre idiomas, si el modelo conserva capacidades multilingues del base (no confirmado en la informacion disponible).

## Benchmarks y rendimiento

La model card presenta la siguiente tabla de exactitud (tres decimales) en quince categorias. Las columnas Model1, Model2 y Model1-v2 son referencias del autor sin identificar; los nombres de los benchmarks genericos no se corresponden con suites estandar (MMLU, HumanEval, GSM8K) y no se detalla la composicion de cada categoria.

| Categoria | Benchmark | Model1 | Model2 | Model1-v2 | PatentLM-3B |
|---|---|---|---|---|---|
| Core Reasoning | Math Reasoning | 0.520 | 0.531 | 0.526 | 0.832 |
| Core Reasoning | Logical Reasoning | 0.705 | 0.716 | 0.721 | 0.842 |
| Core Reasoning | Common Sense | 0.660 | 0.671 | 0.667 | 0.822 |
| Language Understanding | Reading Comprehension | 0.735 | 0.746 | 0.750 | 0.852 |
| Language Understanding | Question Answering | 0.690 | 0.702 | 0.707 | 0.842 |
| Language Understanding | Text Classification | 0.742 | 0.753 | 0.758 | 0.832 |
| Language Understanding | Sentiment Analysis | 0.650 | 0.661 | 0.657 | 0.817 |
| Generation | Code Generation | 0.470 | 0.482 | 0.478 | 0.782 |
| Generation | Creative Writing | 0.560 | 0.572 | 0.568 | 0.802 |
| Generation | Dialogue Generation | 0.620 | 0.631 | 0.627 | 0.812 |
| Generation | Summarization | 0.735 | 0.746 | 0.751 | 0.842 |
| Specialized | Translation | 0.702 | 0.714 | 0.719 | 0.862 |
| Specialized | Knowledge Retrieval | 0.770 | 0.782 | 0.787 | 0.877 |
| Specialized | Instruction Following | 0.710 | 0.721 | 0.726 | 0.852 |
| Specialized | Safety Evaluation | 0.690 | 0.701 | 0.697 | 0.842 |

Advertencia: las puntuaciones de PatentLM-3B superan a las referencias en todas las categorias con margenes de entre 0,07 y 0,31 puntos, incluidas areas ajenas al dominio de patentes (codigo, matematicas, escritura creativa). No se especifica la metodologia, el tamano de muestra ni los modelos de referencia, por lo que estos resultados no deben tomarse como comparables a benchmarks estandar sin verificacion independiente.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Para un modelo de 3B en precision completa (FP16/BF16) se requieren aproximadamente 6-7 GB de VRAM solo para pesos; en cuantizacion de 8 bits, unos 3-4 GB; en 4 bits, unos 2-3 GB. Estas cifras son estimaciones genericas para 3B, no datos publicados por el autor.
- GPU recomendadas: no disponible en la informacion proporcionada. Por tamano, cabria esperar ejecucion en GPU de consumo con 8 GB o mas en FP16, y en GPUs de 4-6 GB con cuantizacion, pero el autor no lo confirma.
- Compatibilidad con GPU de consumo: probable por el tamano de 3B, pero no verificada por el autor.
- Opciones de despliegue: la model card solo menciona `transformers` y el arnes `evaluation/eval.py`; el tag `text-generation-inference` sugiere compatibilidad con TGI. No se confirma soporte de vLLM, llama.cpp u Ollama, ni se distribuyen pesos GGUF.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No se dispone de informacion sobre modelos comparables en la documentacion proporcionada. La model card cita "Model1", "Model2" y "Model1-v2" sin identificarlos, por lo que no es posible establecer una comparativa fiable con alternativas de la misma categoria.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| PatentLM-3B | ~3B | no disponible | MIT | Hugging Face (repo de 0,0 GB) | Especializado en patentes |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible | No identificadas en la informacion |

## Limitaciones y advertencias

- Sesgos conocidos: no documentados; un corpus de patentes puede sobrerrepresentar determinadas jurisdicciones, sectores tecnicos y estilos de redaccion.
- Riesgo de alucinacion: alto en tareas juridicas y tecnicas; las reivindicaciones generadas pueden contener terminos, numeros de referencia o citas inexistentes y requieren revision experta.
- Limitaciones de contexto e idioma: la longitud de contexto y los idiomas soportados no estan declarados, lo que impide garantizar el procesamiento de documentos largos o de idiomas distintos del ingles.
- Restricciones de licencia: licencia MIT, que permite uso comercial y modificacion con atribucion; sin embargo, al derivar de un modelo base no identificado, deben verificarse las obligaciones de la licencia del base original.
- Caveats para produccion: el repositorio figura con 0,0 GB y sin descargas, lo que sugiere que los pesos podrian no estar efectivamente alojados o accesibles; conviene verificar la integridad de los archivos antes de integrar el modelo.
- Los resultados de benchmark no son verificables de forma independiente: no se detalla la metodologia, el tamano de muestra ni las referencias, y los margenes de mejora sobre las referencias son implausiblemente uniformes en todas las categorias.
- No hay informacion sobre fases de alineacion (RLHF/DPO), evaluaciones de seguridad independientes ni filtros de contenido.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/123sg/PatentLM-Release-20261116
- No se han encontrado en la informacion proporcionada otros enlaces a papers, blogs, repositorios o demos.
