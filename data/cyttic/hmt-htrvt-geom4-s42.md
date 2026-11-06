# cyttic/hmt-htrvt-geom4-s42

## Resumen

`cyttic/hmt-htrvt-geom4-s42` es un modelo de reconocimiento de texto manuscrito (HTR, *Handwritten Text Recognition*) desarrollado por el autor `cyttic` en el marco de un estudio de aumento de datos denominado *htr-metrics-transfer*, correspondiente a la primera oleada (*wave 1*). El modelo emplea una arquitectura de tipo CTC (Connectionist Temporal Classification) sobre un backbone identificado como `htrvt`, entrenado con una configuración de aumentación geométrica concreta (`geom4`) y semilla 42. Con 13,8 millones de parámetros y un tamaño de repositorio de 0,1 GB, se trata de un modelo compacto orientado a una tarea muy específica.

El problema que aborda es la transcripción automática de documentos manuscritos en hebreo (`he`), un dominio con menos recursos que el reconocimiento de texto impreso y con particularidades ortográficas y de dirección de escritura (de derecha a izquierda). El modelo se ha entrenado sobre el conjunto `cyttic/hhd-optionb-split`, excluyendo los escritores del conjunto de desarrollo, y se evalúa sobre el test HHD Option-B con decodificación voraz (*greedy*) y sin modelo de lenguaje, alcanzando un CER de 0,0666 y un WER de 0,2987.

Su relevancia es acotada pero clara: sirve como punto de comparación reproducible dentro de un estudio sistemático de aumentación de datos para HTR, y como base ligera para pipelines de transcripción de manuscritos hebreos donde el coste computacional y el tamaño del modelo son críticos. No es un modelo de propósito general, sino un artefacto de investigación con una configuración experimental documentada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | CTC sobre backbone `htrvt` (detalles no disponibles) |
| Parametros totales | 13.821.574 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | hebreo (`he`) |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura combina un backbone denominado `htrvt` con una cabeza de decodificación CTC, el esquema estándar en reconocimiento de texto manuscrito cuando no se dispone de alineaciones a nivel de carácter. El modelo tiene 13.821.574 parámetros totales, lo que lo sitúa en la gama de los modelos ligeros de visión para secuencias. No se dispone de información sobre el número de capas, dimensión oculta, mecanismo de atención o resolución de entrada.

El entrenamiento se realizó sobre el split de entrenamiento de `cyttic/hhd-optionb-split`, excluyendo los escritores presentes en el conjunto de desarrollo, lo que constituye una partición por escritor (*writer-disjoint*) y evita fugas de información entre train y evaluación. La aumentación aplicada se etiqueta como `geom4`, presumiblemente un conjunto de transformaciones geométricas, y la semilla empleada es 42. No se documenta el número de tokens, la composición del dataset, ni si hubo etapas de ajuste fino con RLHF o DPO (poco probable en una tarea CTC de transcripción). La evaluación se realizó con decodificación voraz y sin modelo de lenguaje externo, lo que aísla el rendimiento puro del acoustic model.

## Capacidades

- Reconocimiento de texto manuscrito en hebreo a nivel de línea o región de imagen (la granularidad exacta no está documentada).
- Decodificación CTC con salida de secuencia de caracteres, sin necesidad de modelo de lenguaje.
- Entrenamiento con partición por escritor, lo que favorece la generalización a escritores no vistos.
- No se documenta soporte de *tool calling*, *function calling*, agentes ni razonamiento multi-paso.
- No se documentan capacidades multimodales más allá de la entrada de imagen propia del HTR.
- No se documenta modo *thinking* ni capacidades de audio.
- Capacidad multilingüe limitada al hebreo según el campo `language`.

## Casos de uso

- Digitalización de archivos manuscritos en hebreo: el modelo puede transcribir líneas de documentos escaneados y producir texto plano para su indexación, aprovechando su naturaleza CTC sin modelo de lenguaje para un pipeline ligero y determinista.
- Procesamiento por lotes en servidores modestos: con 13,8 M de parámetros y pesos safetensors de 0,1 GB, es viable ejecutar la inferencia en CPU o en GPUs de gama baja para volúmenes altos de páginas.
- Investigación en aumentación de datos para HTR: sirve como configuración de referencia (`geom4`, semilla 42) para comparar el efecto de distintas políticas de aumentación sobre CER y WER dentro del estudio *htr-metrics-transfer*.
- Evaluación reproducible de modelos HTR: al estar documentados el split, la decodificación y las métricas, puede integrarse en *benchmarks* internos de transcripción de manuscritos hebreos.
- Preprocesado para sistemas de búsqueda documental: la transcripción generada puede alimentar índices de texto completo sobre corpus históricos en hebreo.
- Prototipado de asistentes de transcripción para investigadores: permite validar la viabilidad de un flujo HTR antes de invertir en modelos mayores o en servicios comerciales.
- Generación de datos etiquetados asistida: las transcripciones del modelo pueden servir como preanotaciones para revisión humana en proyectos de anotación de manuscritos.

## Benchmarks y rendimiento

| Metrica | Valor | Condiciones |
|---|---|---|
| CER | 0,0666 | HHD Option-B test, greedy, sin LM |
| WER | 0,2987 | HHD Option-B test, greedy, sin LM |

No se han publicado resultados comparativos con otros modelos en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en fp32 para los 13,8 M de parámetros; en la práctica, el cuello de botella es la resolución de las imágenes de entrada, no los pesos.
- GPU recomendadas: no se especifican; cualquier GPU con al menos 2-4 GB de VRAM es suficiente para el modelo en sí.
- Cabe en GPU de consumo: sí, en cualquier GPU consumer moderna (GTX 1050, RTX 3050, RTX 4090, etc.), e incluso en CPU para volúmenes moderados.
- Opciones de despliegue: no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI; al ser un modelo CTC de visión, requeriría un *runtime* compatible con la arquitectura `htrvt` (no disponible en la información).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. No se han proporcionado datos de modelos comparables de HTR en hebreo con los que establecer una comparación rigurosa de parámetros, contexto, rendimiento o licencia.

## Limitaciones y advertencias

- Modelo de investigación con 0 descargas y 0 *likes* en el momento de la consulta; no hay evidencia de uso en producción ni de validación externa.
- Especializado exclusivamente en hebreo; no se ha evaluado en otros idiomas ni en escritura impresa.
- El WER de 0,2987 es notablemente superior al CER de 0,0666, lo que indica que los errores se concentran en palabras completas y puede afectar a tareas sensibles a la tokenización por palabras.
- La evaluación se realizó sin modelo de lenguaje; en producción, un LM podría reducir el WER, pero también introducir sesgos de corrección no medidos.
- No se documentan sesgos conocidos, pero al entrenarse sobre un corpus concreto de escritores, puede presentar degradación ante estilos caligráficos, épocas o soportes no representados.
- Riesgo de alucinación en el sentido de sustituciones o inserciones de caracteres plausibles, inherente a la decodificación CTC sin LM.
- Licencia MIT: permite uso comercial y modificación, pero no se ofrece garantía alguna sobre el rendimiento en dominios distintos al evaluado.
- No se dispone de información sobre el preprocesado de imagen esperado, la longitud máxima de secuencia ni la resolución de entrada, lo que dificulta una integración reproducible sin inspeccionar el repositorio.

## Enlaces

- Hugging Face: https://huggingface.co/cyttic/hmt-htrvt-geom4-s42
- Dataset de entrenamiento: https://huggingface.co/datasets/cyttic/hhd-optionb-split
- No se han encontrado papers, blogs, repositorios ni demos adicionales en la información proporcionada.
