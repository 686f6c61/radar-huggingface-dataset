# cyttic/hmt-trocrsmall-elastic4-s42

## Resumen

El modelo `cyttic/hmt-trocrsmall-elastic4-s42` es un sistema de reconocimiento de texto manuscrito (HTR, Handwritten Text Recognition) desarrollado por el grupo CYTTIC. Se trata de un modelo de 22,4 millones de parametros entrenado con una cabeza CTC (Connectionist Temporal Classification) sobre un backbone de tipo `trocrsmall`, y forma parte de un estudio de aumentacion de datos denominado `htr-metrics-transfer`, en el que se evalua el efecto de distintas estrategias de aumentacion (en este caso, `elastic4`) sobre la transferencia de metricas entre dominios.

El modelo esta especializado en hebreo (`he`) y se entrena sobre el conjunto `cyttic/hhd-optionb-split`, excluyendo los escritores de desarrollo, con evaluacion sobre el test HHD Option-B mediante decodificacion greedy y sin modelo de lenguaje. Los resultados reportados son CER 0,1662 y WER 0,6183. Su relevancia es acotada: no es un modelo de proposito general, sino un artefacto de investigacion reproducible (semilla 42) para estudiar el impacto de la aumentacion en HTR.

Por su tamano reducido (22,4 M de parametros, repo de 0,1 GB) y su licencia MIT, es facil de desplegar y reutilizar, pero debe entenderse como una pieza dentro de un estudio comparativo, no como un producto listo para produccion. No hay informacion publica sobre su arquitectura interna mas alla de las etiquetas `htr` y `ctc`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Backbone `trocrsmall` con cabeza CTC (detalles internos no disponibles) |
| Parametros totales | 22.421.004 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | hebreo (`he`) |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo emplea una arquitectura de reconocimiento de texto manuscrito basada en un backbone denominado `trocrsmall` y una cabeza de decodificacion CTC, segun las etiquetas de la model card (`htr`, `ctc`). No se dispone de informacion detallada sobre el numero de capas, dimension oculta, mecanismo de atencion ni tipo de capas (convolucionales, recurrentes o transformer) del backbone.

El entrenamiento se realizo sobre el split de entrenamiento de `cyttic/hhd-optionb-split`, excluyendo los escritores reservados para desarrollo, y aplicando la aumentacion `elastic4` con semilla 42. La evaluacion se hizo sobre el test HHD Option-B con decodificacion greedy y sin modelo de lenguaje externo. No se especifica el numero de tokens, la composicion del dataset ni si hubo etapas de ajuste fino adicionales. El identificador del experimento (`s42`, `elastic4`) sugiere que forma parte de una rejilla de experimentos con distintas aumentaciones y semillas.

## Capacidades

- Reconocimiento de texto manuscrito (HTR) en hebreo.
- Transcripcion de lineas o imagenes de escritura manuscrita a texto, mediante decodificacion CTC.
- Decodificacion greedy sin modelo de lenguaje (configuracion evaluada por el autor).
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: limitadas al hebreo segun la model card.
- Capacidades especiales (vision general, audio, thinking mode): no disponibles; la unica modalidad documentada es la entrada de imagen manuscrita para HTR.

## Casos de uso

- Digitalizacion de archivos manuscritos en hebreo: el modelo puede transcribir lineas de documentos historicos o administrativos, aunque su CER de 0,1662 implica una tasa de error apreciable que requiere revision humana.
- Investigacion en aumentacion de datos para HTR: sirve como artefacto reproducible (semilla 42, aumentacion `elastic4`) para comparar el efecto de distintas estrategias de aumentacion sobre la transferencia de metricas.
- Linea base en experimentos academicos: al ser un modelo pequeno (22,4 M de parametros) y con licencia MIT, es util como referencia de bajo coste en estudios de HTR en hebreo.
- Prototipado de pipelines de OCR/HTR: su tamano reducido permite integrarlo en entornos con recursos limitados para pruebas de concepto.
- Generacion de transcripciones asistidas: combinado con un modelo de lenguaje o un corrector ortografico posterior, puede servir como primera etapa de un sistema de transcripcion en hebreo.
- Reproduccion de resultados: permite replicar las metricas CER/WER reportadas sobre el test HHD Option-B para validar estudios comparativos.

## Benchmarks y rendimiento

| Benchmark | Metrica | Resultado |
|---|---|---|
| HHD Option-B test (greedy, sin LM) | CER | 0,1662 |
| HHD Option-B test (greedy, sin LM) | WER | 0,6183 |

No se han publicado resultados comparativos con otros modelos en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; con 22,4 M de parametros el modelo es muy ligero y cabe holgadamente en cualquier GPU consumer, e incluso en CPU.
- GPU recomendadas: no disponible; por tamano, cualquier GPU moderna (RTX 3060 o superior, A100, H100) es suficiente, aunque no se especifican requisitos oficiales.
- Cabe en GPU consumer: si, por el reducido numero de parametros (22,4 M) y el tamano del repo (0,1 GB).
- Opciones de despliegue: no disponible; al usar safetensors y una cabeza CTC, requeriria un framework compatible con HTR (por ejemplo, PyTorch) para cargar los pesos.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye modelos comparables de HTR en hebreo ni resultados de otros sistemas sobre el mismo benchmark.

## Limitaciones y advertencias

- El WER reportado (0,6183) es elevado, lo que indica que la transcripcion a nivel de palabra es poco fiable sin postprocesado o modelo de lenguaje.
- El CER de 0,1662 implica errores de caracter significativos; no es adecuado para produccion sin revision humana.
- Modelo especializado unicamente en hebreo; no soporta otros idiomas segun la model card.
- Es un artefacto de investigacion (estudio de aumentacion, semilla 42) sin documentacion sobre sesgos, robustez o generalizacion fuera del dataset HHD.
- No hay informacion sobre el comportamiento con distintos estilos de escritura, calidades de escaneo o dominios ajenos al conjunto de entrenamiento.
- Licencia MIT: permite uso comercial, pero el autor no ofrece garantias ni soporte; conviene verificar los terminos del dataset de entrenamiento (`cyttic/hhd-optionb-split`) antes de un uso comercial.
- No se dispone de informacion sobre cuantizacion ni formatos alternativos de despliegue.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/cyttic/hmt-trocrsmall-elastic4-s42
- Dataset de entrenamiento: https://huggingface.co/datasets/cyttic/hhd-optionb-split
- Resultados detallados: `results.json` (referenciado en la model card, no enlazado en la informacion disponible)
- Paper, blog, repositorio o demo: no disponible
