# ISTA-DASLab/DeepSeek-V4.1-Flash-1017-GSQ-RCO-GGUF

## Resumen

DeepSeek-V4.1-Flash-1017 es un modelo de lenguaje de tipo mezcla de expertos (MoE) disperso desarrollado por DeepSeek, con 763.200 millones de parametros totales y 384 expertos enrutados por capa, de los cuales 6 se activan por token. Este repositorio concreto, publicado por ISTA-DASLab (Institute of Science and Technology Austria), no contiene el modelo original, sino cuantizaciones GGUF no uniformes del mismo, generadas mediante dos tecnicas propias: GSQ (Gumbel-Softmax Quantization) y RCO (Riemannian Constrained Optimization).

El problema que resuelve esta publicacion es el de hacer desplegable un modelo de escala frontera en hardware modesto. Frente a la cuantizacion uniforme, que aplica un unico tipo a todas las matrices, aqui se asigna un tipo de cuantizacion distinto a cada tensor mediante una busqueda basada en gradientes que reparte la precision segun la sensibilidad de cada tensor, sujeto a un presupuesto de tamano total. El resultado son ficheros GGUF estandar de 1,75, 2,00 y 2,25 bits por peso (bpw), con un contexto declarado de 1M de tokens.

La relevancia actual es doble: por un lado, demuestra que es posible comprimir un MoE de 763B a rangos de 231-266 GB manteniendo gran parte del rendimiento en tareas de razonamiento y codigo; por otro, la integracion con llama.cpp y con el motor Strata permite ejecutar estos modelos en una unica GPU con 12 GB de VRAM, lo que cambia radicalmente el perfil de hardware necesario.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE disperso (384 expertos enrutados por capa, 6 activos por token) |
| Parametros totales | 763.200 millones (196.613.849.600 en safetensors del modelo base segun metadatos de HF; 763,2B segun la model card del cuantizado) |
| Parametros activos | 6 de 384 expertos por token (numero exacto de parametros activos no disponible) |
| Longitud de contexto | 1.000.000 de tokens |
| Tipos de cuantizacion | GGUF no uniforme: IQ1_M (1,75 bpw), IQ2_XXS (2,00 bpw), IQ2_XS (2,25 bpw); Engram fijo en IQ4_NL (4,50 bpw) |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | GGUF (5 shards de backbone + 1 fichero Engram compartido) |

## Arquitectura y entrenamiento

El modelo base es un transformer de mezcla de expertos con 384 expertos enrutados por capa y 6 activos por token, lo que concentra la mayor parte de los parametros en los expertos. Incorpora ademas dos tablas de busqueda ("Engram") que suman 196,6B parametros y que no son matrices de multiplicacion, sino tablas de consulta, por lo que en estas cuantizaciones se mantienen a un tipo fijo (IQ4_NL) y quedan excluidas de la busqueda de precision.

Sobre el proceso de cuantizacion, GSQ es un metodo de cuantizacion escalar post-entrenamiento que aprende conjuntamente las asignaciones de rejilla por coordenada y las escalas por grupo mediante una relajacion de Gumbel-Softmax, cerrando buena parte de la brecha entre cuantizacion escalar y vectorial en regimenes de 2 a 3 bits. RCO asigna uno de K tipos de cuantizacion a cada uno de N tensores bajo un presupuesto de tamano total, reformulando la restriccion como una variedad riemanniana suave en el espacio de logits, lo que permite optimizar directamente sobre la perdida de tarea con la restriccion de presupuesto exacta y sin hiperparametros especificos. La busqueda asigna tipo por capa (no por experto, algo que GGUF no puede expresar). No se dispone de informacion sobre el dataset de entrenamiento del modelo base, el numero de tokens ni si hubo RLHF o DPO.

## Capacidades

- Generacion de texto y conversacion multi-turno (pipeline `text-generation`, tag `conversational`).
- Razonamiento de tipo "thinking" segun los benchmarks reportados (AIME25, GPQA-Diamond).
- Generacion y evaluacion de codigo (LiveCodeBench v6).
- Procesamiento de imagenes: la actualizacion de octubre de 2026 indica que los ficheros cargan en llama.cpp b11870 o superior "including images", lo que implica soporte multimodal en el formato.
- Contexto largo de hasta 1M de tokens.
- Despliegue en llama.cpp estandar con formato GGUF.
- Compatibilidad con el motor Strata para ejecucion en GPU de 12 GB.
- Soporte de tool calling y function calling: no disponible en la informacion proporcionada.
- Capacidades de agente y razonamiento multi-paso: no disponibles en la informacion proporcionada.
- Cobertura multilingue: no disponible.

## Casos de uso

- Razonamiento matematico asistido: el modelo se evalua en AIME25, por lo que es adecuado para resolver problemas de competicion y verificar cadenas de razonamiento paso a paso en entornos educativos o de investigacion.
- Analisis de documentos tecnicos extensos: con 1M de tokens de contexto, permite cargar bases de codigo completas, expedientes o manuales enteros y consultarlos sin fragmentacion, algo critico en auditoria legal o ingenieria.
- Generacion de codigo en pipelines de desarrollo: su evaluacion en LiveCodeBench v6 lo situa como candidato para autocompletado, generacion de tests y revision de parches en integracion continua, siempre que se valide el soporte de tool calling en la implementacion concreta.
- Investigacion en cuantizacion: el repositorio sirve como referencia reproducible para estudiar el impacto de GSQ y RCO frente a cuantizacion uniforme, con tres presupuestos de bits comparables sobre el mismo modelo.
- Despliegue en estaciones de trabajo con GPU unica: gracias a Strata, un equipo con 12 GB de VRAM puede servir el modelo, lo que habilita prototipado y demos locales sin infraestructura de centro de datos.
- Analisis de imagenes en flujos documentales: la carga de imagenes en llama.cpp b11870 permite procesar capturas, diagramas o formularios escaneados junto con texto en una misma conversacion.
- Evaluacion comparativa de modelos frontera en hardware de gama media: util para laboratorios que quieran medir la degradacion de calidad a 1,75, 2,00 y 2,25 bpw sobre el mismo checkpoint.

## Benchmarks y rendimiento

La model card incluye una grafica comparativa ("Base model vs GSQ-RCO quants on AIME25, GPQA-Diamond and LiveCodeBench v6") pero no se proporcionan los valores numericos en la informacion disponible.

No se han publicado resultados de benchmarks numericos en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: los tres builds ocupan 231,32 GB (IQ1_M), 248,84 GB (IQ2_XXS) y 265,83 GB (IQ2_XS) en disco; con el motor Strata pueden ejecutarse en una unica GPU con 12 GB de VRAM, segun la model card.
- GPU recomendadas: no se especifican modelos concretos; el requisito declarado es una GPU con 12 GB de VRAM usando Strata. Para despliegue sin Strata se necesitaria memoria agregada del orden del tamano del fichero (varias GPU o CPU con RAM suficiente).
- Cabe en GPU de consumo: si, en el rango de 12 GB de VRAM con Strata (por ejemplo, RTX 3060 de 12 GB o superiores), segun la afirmacion del autor.
- Opciones de despliegue: llama.cpp b11870 o superior (soporte nativo del layout DeepSeek-V4.1, incluidas imagenes) y el motor Strata.
- Latencia y throughput: no disponibles.
- Nota operativa: el fichero Engram (`DeepSeek-V4.1-Flash-Engram-IQ4_NL.gguf`, 110,60 GB) es comun a los tres builds y debe enlazarse como shard 6 con `ln -s` antes de cargar. Existe un script `convert_ds41_upstream.py` para actualizar descargas antiguas sin volver a bajar el modelo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| DeepSeek-V4.1-Flash-1017 (GSQ-RCO, este repo) | 763,2B (MoE, 6/384 activos) | 1M | GGUF no uniforme, 1,75-2,25 bpw | MIT | Hugging Face, llama.cpp b11870+ |
| DeepSeek-V4.1-Flash-1017 (base) | 763,2B (MoE) | 1M | safetensors (BF16/FP8 no disponible) | MIT | Hugging Face (deepseek-ai) |
| Alternativas de mismo tamano y tarea | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks ni de especificaciones de modelos comparables en la informacion proporcionada para establecer una comparacion cuantitativa con alternativas de la misma categoria.

## Limitaciones y advertencias

- La cuantizacion a 1,75-2,25 bpw introduce degradacion de calidad respecto al modelo base; la propia model card presenta la comparativa frente al base, lo que implica diferencias medibles en AIME25, GPQA-Diamond y LiveCodeBench v6 (sin cifras publicadas aqui).
- Los expertos enrutados se cuantizan por capa, no por experto, porque GGUF no permite granularidad por experto; esto limita la precision de la asignacion.
- Las tablas Engram se mantienen a IQ4_NL fijo y no se optimizan en la busqueda, por lo que su contribucion al error no se reduce con el presupuesto.
- El repositorio pesa 1.287,5 GB en total y el fichero Engram solo ya son 110,60 GB; el almacenamiento y la transferencia son un cuello de botella real.
- Los ficheros anteriores al 27 de octubre de 2026 requieren ejecutar `convert_ds41_upstream.py` para adaptarse al layout de llama.cpp; sin ello pueden no cargar correctamente.
- El enlace simbolico del shard Engram es un paso manual obligatorio; omitirlo impide la carga.
- No hay informacion sobre sesgos, idiomas soportados ni comportamiento en dominios sensibles.
- Licencia MIT: permite uso comercial, pero conviene verificar las condiciones del modelo base DeepSeek-V4.1-Flash-1017, ya que la cuantizacion hereda las obligaciones del original.
- Riesgo de alucinacion: inherente a los modelos de lenguaje; no se han publicado evaluaciones de factualidad en la informacion disponible.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/ISTA-DASLab/DeepSeek-V4.1-Flash-1017-GSQ-RCO-GGUF
- Modelo base: https://huggingface.co/deepseek-ai/DeepSeek-V4.1-Flash-1017
- Paper GSQ: https://arxiv.org/abs/2604.18556
- Paper RCO: https://arxiv.org/abs/2605.00649
- Codigo GSQ: https://github.com/IST-DASLab/GSQ
- Codigo RCO: https://github.com/IST-DASLab/RCO
- Laboratorio DASLab: https://github.com/IST-DASLab
- Motor Strata: https://github.com/Niko1221/Strata
- Release de llama.cpp b11870: https://github.com/ggml-org/llama.cpp/releases/tag/b11870
