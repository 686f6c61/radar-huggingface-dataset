# saqiibb/Veto-40M

## Resumen
Veto-40M es un modelo de 40 millones de parametros desarrollado por el usuario saqiibb y publicado en HuggingFace bajo licencia MIT. Se presenta como un Decision Transformer de tipo energy-based: en lugar de aplicar una capa Softmax sobre un conjunto cerrado de opciones, proyecta pares estado-opcion en un paisaje de energia escalar no normalizado. Las decisiones validas caen en cuencas de baja energia (E ≈ 0), mientras que las opciones invalidas o fuera de dominio generan energias altas (E > 8,0). Esta formulacion permite un rechazo o "veto" nativo de decisiones, algo que los clasificadores convencionales basados en Softmax no ofrecen de forma directa.

El modelo resuelve el problema de la clasificacion con rechazo en dominios cerrados: no solo elige entre las clases conocidas, sino que puede determinar cuando ninguna de las opciones presentadas es adecuada. Es relevante para tareas de enrutamiento, clasificacion de intenciones y seleccion de candidatos donde la deteccion de entradas fuera de distribucion es critica. Su tamano compacto (40M) lo hace desplegable en entornos con recursos limitados.

La informacion publicada incluye resultados en el benchmark BANKING77 de clasificacion de intenciones bancarias, con una precision del 94,48% con 6 opciones, 88,31% con 20 opciones y 75,29% con las 77 clases completas. No se han publicado datos sobre la longitud de contexto soportada, el dataset de entrenamiento ni el metodo de optimizacion mas alla de la descripcion arquitectonica.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Decision Transformer con formulacion energy-based (energia escalar no normalizada sobre pares estado-opcion) |
| Parametros totales | 40.000.000 |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | Ingles (en) |
| Licencia | MIT |
| Formato de pesos | no disponible (repositorio de 0,1 GB; etiquetado como PyTorch) |

## Arquitectura y entrenamiento
La arquitectura es un transformer personalizado de 8 capas y 8 cabezas de atencion, con dimension oculta de 512 y un vocabulario de 16.384 tokens. Emplea activaciones SwiGLU y normalizacion RMSNorm. La innovacion principal reside en la cabeza de decision: en vez de producir una distribucion de probabilidad mediante Softmax sobre las opciones candidatas, el modelo puntua cada par estado-opcion con un valor de energia no normalizado. El entrenamiento se orienta a que las decisiones correctas queden en regiones de baja energia y las incorrectas o fuera de dominio en regiones de alta energia, lo que habilita el mecanismo de veto sin necesidad de una clase "ninguna de las anteriores" explicita.

No se ha publicado informacion sobre el numero de tokens de entrenamiento, la composicion del dataset, ni si se emplearon tecnicas de RLHF, DPO u otros ajustes de preferencias. Tampoco se detalla el esquema de decodificacion ni la estrategia de muestreo de negativos durante el entrenamiento, factores clave en modelos energy-based.

## Capacidades
- Clasificacion de decisiones sobre conjuntos cerrados de opciones, evaluando energeticamente cada par estado-opcion.
- Rechazo nativo de opciones: el modelo puede marcar entradas fuera de dominio o invalidas cuando ninguna opcion presenta baja energia.
- Clasificacion de intenciones, como demuestran los resultados en BANKING77 con 6, 20 y 77 clases.
- Escalado del numero de opciones candidatas sin reentrenar la cabeza (el rendimiento decae de forma gradual segun el numero de opciones).
- Procesamiento en ingles unicamente.
- No se ha documentado soporte de tool calling, function calling, razonamiento multi-paso, agentes, vision, audio ni modo de pensamiento explicito.

## Casos de uso
- Clasificacion de intenciones en atencion al cliente bancaria: el modelo evalua la consulta del usuario frente a un conjunto de intenciones predefinidas y devuelve la de menor energia, con la ventaja de poder vetar consultas que no encajan en ninguna categoria conocida, reduciendo clasificaciones forzadas.
- Enrutamiento de tickets o consultas: dado un conjunto de equipos o colas de destino, el modelo puntua la adecuacion de cada una y permite derivar a un flujo generico de "revision humana" cuando todas las opciones superan un umbral de energia.
- Moderacion y deteccion de fuera de dominio: al producir energias altas para entradas que no pertenecen a ninguna clase valida (E > 8,0 segun la model card), sirve como filtro previo en pipelines de produccion.
- Seleccion de candidatos en sistemas de recomendacion o QA de opcion multiple: el esquema energia permite rankear respuestas candidatas sin reentrenar el modelo para cada conjunto de opciones.
- Clasificacion de actos de dialogo o etiquetado de turnos: util en sistemas conversacionales que necesitan decidir la accion siguiente entre un conjunto acotado de alternativas.
- Deteccion de entradas anomalas o no soportadas en produccion: la firma energetica permite umbralizar y desviar peticiones que un clasificador Softmax etiquetaria erroneamente.
- Experimentacion e investigacion en modelos energy-based y decision transformers: su tamano de 40M facilita reproducir y modificar la arquitectura en un unico GPU o incluso en CPU.

## Benchmarks y rendimiento

| Benchmark | Configuracion | Precision |
|---|---|---|
| BANKING77 | 6 opciones | 94,48% |
| BANKING77 | 20 opciones | 88,31% |
| BANKING77 | 77 opciones | 75,29% |

Son los unicos resultados de evaluacion publicados en la informacion disponible. No se aportan comparaciones directas con otros modelos en el mismo benchmark.

## Requisitos de hardware
Las cifras de memoria siguientes son estimaciones derivadas del recuento de parametros (40M), no datos publicados por el autor.

- VRAM estimada para pesos: aproximadamente 160 MB en FP32, 80 MB en FP16/BF16, 40 MB en INT8 y 20 MB en INT4, sin contar activaciones ni overhead del runtime.
- GPU recomendadas: cualquier GPU moderna es suficiente, incluidas RTX 3060, RTX 4090, A100 y H100; el modelo es considerablemente mas pequeno que la VRAM tipica de estos aceleradores.
- Cabe holgadamente en cualquier GPU de consumo e incluso en CPU, dado su tamano de 40M de parametros.
- Opciones de despliegue: al tratarse de una arquitectura personalizada etiquetada como PyTorch, lo mas probable es que requiera codigo propio para la carga y la inferencia. No hay constancia de soporte en vLLM, llama.cpp, Ollama o TGI, que en general no cubren arquitecturas custom de este tipo.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares
No se han proporcionado datos de comparacion con otros modelos. La categoria natural de comparacion son los clasificadores ligeros de intenciones (por ejemplo, variantes de BERT o DistilBERT ajustadas a BANKING77), pero no se dispone de cifras verificables de esos modelos bajo las mismas condiciones (6, 20 y 77 opciones) en la informacion facilitada.

| Modelo | Parametros | Contexto | Rendimiento en BANKING77 | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Veto-40M | 40M | no disponible | 94,48% (6 opc.), 88,31% (20 opc.), 75,29% (77 opc.) | MIT | HuggingFace |
| Alternativas tipo encoder ligero (BERT/DistilBERT ajustado) | no disponible | no disponible | no disponible | no disponible | no disponible |

El rasgo diferenciador del modelo frente a los clasificadores Softmax convencionales es el veto energetico nativo; no se ha publicado una comparacion cuantitativa que aísle esta ventaja.

## Limitaciones y advertencias
- Modelo orientado exclusivamente al ingles; no hay soporte multilingue documentado.
- Rendimiento decreciente a medida que aumenta el numero de opciones: cae casi 20 puntos porcentuales entre 6 y 77 clases en BANKING77.
- No se documentan sesgos conocidos, pero tampoco se ha publicado la composicion del dataset de entrenamiento, por lo que no es posible auditar sesgos potenciales.
- Riesgo de alucinacion o de asignacion erronea de baja energia a opciones plausibles pero incorrectas, especialmente fuera del dominio bancario de BANKING77.
- Longitud de contexto no especificada: se desconoce si el modelo puede procesar entradas largas, lo que limita su uso en conversaciones multi-turno extensas.
- Al ser una arquitectura personalizada ("custom-architecture"), es probable que no funcione directamente con los runtimes de inferencia mas comunes (vLLM, llama.cpp, Ollama, TGI), lo que implica trabajo de integracion.
- Sin datos de cuantizacion publicados: habria que generarlos y validar que el paisaje de energia se preserva tras la cuantizacion.
- No se ha publicado informacion sobre el entrenamiento (tokens, dataset, ajuste), lo que dificulta evaluar su robustez y reproducibilidad.
- No se documenta soporte de tool calling, agentes ni capacidades multimodales, por lo que no debe asumirse su uso en pipelines agenticos sin verificacion previa.
- Repositorio con 0 descargas y 1 like en el momento de la consulta, lo que indica ausencia de validacion por parte de la comunidad.

## Enlaces
- HuggingFace: https://huggingface.co/saqiibb/Veto-40M
- No se han encontrado papers, blogs, repositorios adicionales ni demos en la informacion proporcionada.
