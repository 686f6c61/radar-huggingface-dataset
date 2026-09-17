# deAPI-ai/marlin-2b

## Resumen

Marlin 2B es un modelo de lenguaje y vídeo (video-language) de 2.213.241.664 parámetros (aproximadamente 2,21 B) cuya función declarada es describir lo que ocurre en un vídeo mediante eventos con marcas temporales. Está derivado de Qwen3.5-2B, el modelo de Alibaba Cloud, al que se le incorpora una torre visual capacitada para procesar vídeo. El resultado es un sistema multimodal que combina un backbone de lenguaje de escala 2 B con un encoder visual orientado a flujos de vídeo.

El repositorio consultado, `deAPI-ai/marlin-2b`, es un espejo de alojamiento: según su propia model card, todos los archivos son copias sin modificar de los publicados por el autor original, NemoStation, en la revisión `fd111fca4fc7897876fb0d7e9df22ca5ac8ab965`, y solo la model card es nueva (la del proyecto upstream no se incluye). La licencia es Apache 2.0 tanto para Marlin 2 B como para su base Qwen3.5-2B.

Su relevancia actual es doble: por un lado, ataca una tarea concreta y costosa de resolver con modelos generalistas, la descripción temporal de vídeo (temporal grounding con timestamps); por otro, lo hace con un presupuesto de parámetros de 2 B, lo que lo sitúa en la franja de modelos desplegables en GPU de consumo. El repositorio no publica resultados de benchmarks, idiomas soportados ni longitud de contexto, y registra 0 descargas y 0 "likes" en el momento de la consulta, por lo que se trata de un artefacto sin validación comunitaria pública.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Modelo multimodal de lenguaje y visión (vídeo) derivado de Qwen3.5-2B, con torre visual capacitada para vídeo. Familia transformer; detalles internos (número de capas, cabezas, tipo de atención) no disponibles |
| Parámetros totales | 2.213.241.664 (≈2,21 B), dato procedente de los pesos en safetensors |
| Parámetros activos | no aplica (no se documenta que sea un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible. El repositorio solo distribuye pesos en safetensors; no se documentan versiones GGUF, AWQ, GPTQ ni FP8 |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (etiqueta `custom_code`, lo que implica cargar con `trust_remote_code=True`) |
| Autor original | NemoStation (modelo upstream: `NemoStation/Marlin-2B`) |
| Repositorio de alojamiento | deAPI-ai (para uso con GamerHash AI) |
| Tamaño del repositorio | 5,5 GB |
| Fecha de creación / actualización en HuggingFace | 2026-09-17 / 2026-09-17 |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La información disponible describe Marlin 2 B como un modelo de lenguaje y vídeo derivado de Qwen3.5-2B al que se añade una torre visual capacitada para vídeo. Se trata, por tanto, de una arquitectura multimodal del tipo VLM (vision-language model) con soporte de entrada de vídeo, construida sobre un backbone de lenguaje de 2 B. La etiqueta `qwen3_5` del repositorio confirma la ascendencia Qwen3.5, y la etiqueta `custom_code` indica que el modelo requiere código propio del repositorio para su carga e inferencia (es decir, no es un checkpoint estándar de `transformers` cargable sin `trust_remote_code=True`).

No se dispone de datos sobre el número de tokens de entrenamiento, la composición del dataset, las fases de ajuste (SFT, RLHF, DPO) ni las innovaciones técnicas concretas del pipeline. La única capacidad de salida documentada explícitamente es la generación de descripciones de eventos con marcas temporales (*timestamped events*), lo que implica un alineamiento temporal entre la salida de texto y los instantes del vídeo, pero el mecanismo empleado no se detalla en las fuentes consultadas. Tampoco se especifica la resolución de vídeo, la tasa de muestreo de fotogramas ni el número máximo de fotogramas admitidos.

## Capacidades

- Descripción de eventos en vídeo con marcas temporales: es la capacidad declarada de forma explícita en la model card; el modelo genera texto que describe qué ocurre y en qué momento.
- Comprensión de vídeo (no solo de imágenes fijas): la torre visual está descrita como "capacitada para vídeo".
- Comprensión de lenguaje natural heredada del backbone Qwen3.5-2B: no documentada como capacidad del modelo derivado, aunque es esperable por su base; no confirmada en las fuentes.
- Generación de texto: no documentada de forma específica para este derivado.
- Razonamiento, matemáticas y generación de código: no documentados en las fuentes disponibles.
- Soporte de *tool calling* / *function calling*: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible (la ficha de HuggingFace no lista idiomas).
- Modo de razonamiento explícito (*thinking mode*), audio o voz: no disponible.

## Casos de uso

- Indexación y búsqueda de vídeo: generar descripciones con marcas temporales para cada clip y almacenarlas como metadatos en un motor de búsqueda, de modo que una consulta textual pueda devolver el instante exacto del vídeo en el que ocurre el evento. La salida con timestamps es precisamente el formato que necesita un índice de este tipo.
- Resumen automático de grabaciones largas: reuniones, clases, directos o sesiones de juego pueden procesarse para obtener una línea temporal de eventos, útil para generar capítulos o resúmenes navegables.
- Etiquetado de datasets de vídeo: uso del modelo como anotador automático para crear conjuntos de entrenamiento con eventos temporales, reduciendo el coste de anotación manual previo al filtrado humano.
- Moderación y revisión de contenido audiovisual: detección y localización temporal de escenas relevantes para colas de revisión, aprovechando que la salida indica el momento y no solo la presencia del evento.
- Post-producción y publicación: generación automática de marcadores de capítulo, descripciones de escenas y notas de montaje para plataformas de vídeo.
- Accesibilidad: producción de descripciones textuales sincronizadas temporalmente que pueden alimentar subtítulos descriptivos o audiodescripción para personas con discapacidad visual.
- Análisis deportivo o de eventos: extracción de una cronología de acciones (goles, faltas, cambios de posesión) a partir del vídeo, como entrada para paneles de estadísticas.
- Despliegue en infraestructuras de GPU distribuida: dado su tamaño de 2,21 B, es candidato a ejecutarse en nodos de consumo dentro de plataformas de cómputo distribuido como la que referencia el repositorio (GamerHash AI), aunque no se publican cifras de latencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card de este repositorio no incluye métricas (ni MMLU, ni HumanEval, ni GSM8K, ni métricas específicas de vídeo como temporales de *grounding*), y la búsqueda web asociada no devolvió ningún resultado técnico: únicamente enlaces genéricos a páginas de inicio y de inicio de sesión de Facebook, sin relación con el modelo.

## Requisitos de hardware

Las siguientes cifras de memoria son estimaciones calculadas a partir del número de parámetros (2,21 B) y no han sido publicadas por el autor; deben tomarse como orientativas.

- Pesos en FP16/BF16: aproximadamente 4,4 GB. El repositorio ocupa 5,5 GB, un valor coherente con pesos de 16 bits más la torre visual, configuraciones y ficheros auxiliares.
- Pesos en FP32: aproximadamente 8,9 GB.
- Pesos en INT8: aproximadamente 2,2 GB (requiere cuantización propia; no se distribuyen pesos cuantizados).
- Pesos en INT4: aproximadamente 1,1-1,3 GB (igual que el caso anterior, sin versiones publicadas).
- Memoria total de inferencia: a los pesos hay que sumar la caché KV y las activaciones. En tareas de vídeo, el número de fotogramas procesados multiplica el coste de activaciones y de atención, por lo que el consumo real puede superar ampliamente la cifra de pesos. No se dispone de medidas publicadas.
- GPU recomendadas: no disponibles en las fuentes. Por tamaño de parámetros, una GPU con 16 GB o más (RTX 4080/4090, A100 40 GB, H100) permite trabajar con holgura en precisión de 16 bits; una GPU de 8-12 GB puede ser suficiente con cuantización, dependiendo de la longitud del vídeo.
- Cabe en GPU de consumo: es previsible que sí en la mayoría de tarjetas de 8 GB o más con cuantización, y en tarjetas de 12-16 GB en FP16 para clips cortos. No hay validación publicada de esta afirmación.
- Opciones de despliegue: al portar la etiqueta `custom_code`, la carga requiere `transformers` con `trust_remote_code=True`. No se documenta compatibilidad con vLLM, TGI, llama.cpp, Ollama ni LM Studio, y al no existir pesos GGUF ni cuantizaciones publicadas, no puede confirmarse su funcionamiento en motores basados en GGUF.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se han publicado datos comparativos en la información disponible. La búsqueda web no devolvió fuentes técnicas, por lo que las cifras de los modelos alternativos no pueden verificarse aquí y se marcan como no disponibles.

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Marlin 2B (deAPI-ai / NemoStation) | 2.213.241.664 (~2,21 B) | no disponible | Apache 2.0 | safetensors con `custom_code` |
| Qwen3.5-2B (modelo base declarado) | no disponible en las fuentes | no disponible | Apache 2.0 (según la model card de Marlin 2 B) | no verificada |
| Alternativas de la misma categoría (modelos video-language de ~2-3 B, p. ej. familias SmolVLM2, Qwen-VL o InternVL) | no disponible | no disponible | no disponible | no disponible |

Criterio de comparación: se trata de la franja de modelos multimodales de 2 a 3 B de parámetros con entrada de vídeo. No hay métricas de rendimiento publicadas para Marlin 2 B que permitan establecer una comparación cuantitativa.

## Limitaciones y advertencias

- Ausencia total de evaluación: no hay benchmarks, métricas ni validación comunitaria (0 descargas, 0 likes en el momento de la consulta). Cualquier uso en producción parte sin evidencia de calidad.
- Riesgo de alucinación temporal: al generar eventos con marcas temporales, el modelo puede inventar acciones o asignarles instantes incorrectos. En tareas de *grounding* temporal esto es especialmente crítico y requiere verificación.
- Ejecución de código remoto: la etiqueta `custom_code` implica que la carga del modelo ejecuta código incluido en el repositorio. Es un riesgo de seguridad si no se audita el código antes de usarlo, y limita la portabilidad a motores de inferencia estándar.
- Documentación incompleta por el espejo: el repositorio declara que solo la model card es nueva y que la del proyecto upstream no se incluye. Se pierde la documentación original del autor, lo que dificulta conocer el pipeline de entrenamiento, los datos y las limitaciones declaradas por NemoStation.
- Idioma y contexto desconocidos: no se especifican idiomas soportados ni longitud de contexto, por lo que no puede garantizarse el comportamiento multilingüe ni la gestión de vídeos o conversaciones largas.
- Restricciones de licencia: Apache 2.0 permite uso comercial, modificación y redistribución, pero obliga a conservar el aviso de licencia y el archivo `NOTICE` con la atribución al proyecto upstream. La atribución a Qwen (Alibaba Cloud) también debe mantenerse.
- Dependencia del modelo base: al derivar de Qwen3.5-2B, hereda los sesgos y limitaciones de ese modelo, que no se detallan en las fuentes disponibles.
- Fechas del repositorio: la creación y la última actualización figuran como 2026-09-17, un dato que procede de los metadatos de HuggingFace y que conviene verificar en el momento de uso.
- Sin cuantizaciones publicadas: la ausencia de pesos GGUF, AWQ o GPTQ obliga a cuantizar por cuenta propia si se quiere desplegar en hardware limitado, con la consiguiente pérdida de calidad no medida.
- Vídeo frente a texto: la model card solo atribuye al modelo la descripción de eventos en vídeo; no hay evidencia de que conserve de forma fiable las capacidades de texto, código o razonamiento del modelo base.

## Enlaces

- Modelo en HuggingFace (espejo): https://huggingface.co/deAPI-ai/marlin-2b
- Repositorio original del autor: https://huggingface.co/NemoStation/Marlin-2B
- Modelo base declarado: https://huggingface.co/Qwen/Qwen3.5-2B
- Plataforma asociada al alojamiento: https://gamerhash.com
- Model card del autor: no disponible como documento independiente (según el repositorio, la model card upstream no se incluye)
- Publicación, paper o blog técnico: no disponible
- Resultados de la búsqueda web: sin contenido técnico relevante (únicamente enlaces genéricos a páginas de Facebook)
