# mradermacher/Rhea-4B-Coding-max-i1-GGUF

## Resumen

Rhea-4B-Coding-max-i1-GGUF es una colección de cuantizaciones GGUF generadas por mradermacher a partir del modelo base roskosmos19/Rhea-4B-Coding-max, un modelo especializado en código de 4.022 millones de parámetros. El repositorio no contiene el modelo original en safetensors, sino únicamente los pesos convertidos a formato GGUF con cuantización de tipo imatrix (i1), pensados para su uso con llama.cpp y derivados como Ollama o LM Studio. La relevancia de esta publicación radica en que permite ejecutar un modelo de código de 4B en hardware de consumo, con opciones que van desde 1,2 GB (IQ1_S) hasta 3,4 GB (Q6_K).

El modelo base se presenta en la model card como un merge orientado a código y agentes, con etiquetas que mencionan "multi-pass", "reasoning", "Claude", "Mythos", "max" y "xhigh", además de "uncensored". Los datasets declarados son Aquiles-ai/Athenea-Coding-100k y roskosmos19/Rhea-Coding. La licencia es Apache 2.0 y el único idioma declarado es el inglés. No se especifican en la información disponible la longitud de contexto, la arquitectura interna ni los detalles del proceso de entrenamiento o fusión.

El interés práctico de esta ficha es doble: por un lado, documenta las opciones de cuantización disponibles y su tamaño; por otro, advierte de que la información técnica publicada por el autor del modelo base es muy escasa, lo que obliga a tratar cualquier afirmación sobre capacidades o rendimiento con cautela hasta que existan evaluaciones independientes.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base derivado de un merge; no se detalla en la informacion proporcionada) |
| Parametros totales | 4.022.468.096 (4,02 B) |
| Parametros activos | no aplica (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | i1-IQ1_S, i1-IQ1_M, i1-IQ2_XXS, i1-IQ2_XS, i1-IQ2_S, i1-IQ2_M, i1-Q2_K_S, i1-Q2_K, i1-IQ3_XXS, i1-IQ3_XS, i1-Q3_K_S, i1-IQ3_S, i1-IQ3_M, i1-Q3_K_M, i1-Q3_K_L, i1-IQ4_XS, i1-Q4_0, i1-IQ4_NL, i1-Q4_K_S, i1-Q4_K_M, i1-Q4_1, i1-Q5_K_S, i1-Q5_K_M, i1-Q6_K; ademas existe un fichero imatrix para generar cuantizaciones propias |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (con fichero imatrix auxiliar); el modelo base original esta en formato transformers/safetensors |

## Arquitectura y entrenamiento

No se dispone de información sobre la arquitectura interna del modelo base en la documentación proporcionada. El repositorio de mradermacher solo documenta el proceso de cuantización, no la arquitectura del transformer subyacente, el número de capas, la dimensión oculta ni el mecanismo de atención. Tampoco se indica si el contexto es extendido ni si emplea alguna técnica de atención lineal o decodificación especulativa.

El modelo base roskosmos19/Rhea-4B-Coding-max se describe mediante etiquetas que sugieren un proceso de fusión (merge) de modelos previos, con orientación a código, agentes y razonamiento multi-paso, y con un componente declarado como "uncensored". Los datasets citados son Aquiles-ai/Athenea-Coding-100k y roskosmos19/Rhea-Coding, pero no se especifica el número de tokens de entrenamiento, la composición exacta del corpus, ni si hubo fases de RLHF, DPO o ajuste supervisado. Las etiquetas "multi-pass", "Claude", "Mythos", "max" y "xhigh" no vienen acompañadas de explicación técnica en la model card.

La aportación técnica de este repositorio concreto es la cuantización con imatrix (importancia matricial), que calibra la pérdida de precisión por tensor usando estadísticas de activaciones. mradermacher indica que las cuantizaciones IQ suelen ser preferibles a las no-IQ de tamaño similar, y que Q4_K_S es el punto óptimo entre tamaño, velocidad y calidad, mientras que Q4_K_M se recomienda por su velocidad.

## Capacidades

- Generación de código: el modelo está etiquetado explícitamente como "code" y entrenado sobre datasets de código (Athenea-Coding-100k y Rhea-Coding), por lo que se orienta a completar, explicar y transformar código fuente.
- Uso como agente: la etiqueta "agent" sugiere soporte para flujos de trabajo con herramientas, aunque no se documenta el formato exacto de tool calling ni las plantillas de chat.
- Razonamiento multi-paso: las etiquetas "multi-pass" y "reasoning" apuntan a modos de razonamiento iterativo, sin que se detalle el mecanismo.
- Modelo "uncensored": el autor declara ausencia de filtros de rechazo, lo que implica que puede generar contenido que otros modelos alineados bloquearían.
- Multilingüismo: limitado al inglés según el campo `language` de la model card; no se declaran capacidades en castellano ni en otros idiomas.
- Capacidades de visión, audio o thinking mode explícito: no disponibles en la información proporcionada.

## Casos de uso

- Autocompletado de código en el editor: con cuantizaciones Q4_K_M (2,6 GB) el modelo cabe en GPUs de consumo y puede servir como backend local de extensiones tipo Continue o similares, ofreciendo sugerencias de bajo coste sin enviar código a la nube.
- Asistente de refactorización en local: un modelo de 4B especializado en código permite reescribir funciones, renombrar símbolos y aplicar patrones de diseño en entornos con requisitos de privacidad, ejecutándose en una RTX 3060 o superior con cuantización Q5_K_M.
- Generación de tests unitarios: el modelo puede producir casos de prueba a partir de firmas de funciones y docstrings, integrándose en un pipeline de CI que valide la compilación de los tests generados antes de aceptarlos.
- Explicación de código heredado: con la cuantización Q6_K (3,4 GB) y un contexto que habrá que verificar empíricamente, el modelo puede resumir módulos y documentar APIs internas en inglés, lo que resulta útil para equipos que heredan bases de código sin documentación.
- Agente de automatización de tareas de repositorio: las etiquetas "agent" y "multi-pass" sugieren su uso en bucles de razonamiento que consultan el sistema de ficheros o ejecutan comandos, aunque la ausencia de documentación sobre tool calling obliga a validar el formato de prompts antes de desplegarlo.
- Prototipado rápido en estaciones de trabajo sin GPU dedicada: la cuantización IQ2_M (1,6 GB) permite ejecutar el modelo en CPU con llama.cpp para tareas de generación de snippets y pruebas de concepto, aceptando una pérdida de calidad notable.
- Filtrado y clasificación de parches: el modelo puede evaluar si un diff introduce cambios sospechosos o incompletos, usándose como primera barrera en revisiones automáticas de pull requests.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Ni la model card del repositorio GGUF ni los metadatos de Hugging Face incluyen puntuaciones de MMLU, HumanEval, GSM8K, MBPP ni de evaluaciones de código como SWE-bench. Tampoco se ofrecen comparaciones con modelos de tamaño similar. Cualquier cifra de rendimiento deberá obtenerse mediante evaluación propia.

## Requisitos de hardware

- VRAM estimada para inferencia: entre 1,2 GB y 1,8 GB para cuantizaciones IQ1 e IQ2; alrededor de 2,5-2,7 GB para Q4_K_S, Q4_K_M y Q4_1; 2,9-3,0 GB para Q5_K_S y Q5_K_M; 3,4 GB para Q6_K. A esto hay que sumar el espacio para la caché KV, que depende del contexto configurado y no puede calcularse sin conocer la arquitectura.
- GPU recomendadas: cualquier GPU con 4 GB o más de VRAM puede ejecutar las cuantizaciones Q4 en adelante. Una RTX 3060 de 12 GB, una RTX 4060 Ti de 16 GB o una RTX 4090 permiten contextos amplios y mayor velocidad. Para despliegues en servidor, una A100 o H100 no aportan ventaja significativa a este tamaño salvo por el mayor ancho de banda y la posibilidad de servir muchas peticiones concurrentes.
- GPU de consumo: sí, cabe en tarjetas de gama media y baja con cuantizaciones Q4 o inferiores; las cuantizaciones IQ1 e IQ2 están pensadas para entornos con menos de 2 GB libres.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio y cualquier runtime compatible con GGUF. El repositorio declara `endpoints_compatible` en sus etiquetas, pero no se detalla qué endpoints concretos. vLLM y TGI no son compatibles directamente con GGUF sin conversión previa al formato original.
- Latencia y throughput: no disponibles. Al ser un modelo de 4B, en una GPU de consumo cabe esperar decenas de tokens por segundo con Q4, pero no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Rhea-4B-Coding-max-i1-GGUF | 4,02 B | no disponible | Apache 2.0 | GGUF (i1) | Cuantizaciones imatrix de 1,2 a 3,4 GB; solo ingles; sin benchmarks publicados |
| Rhea-4B-Coding-max (base) | 4,02 B | no disponible | Apache 2.0 | transformers/safetensors | Modelo original del que derivan estas cuantizaciones |
| Rhea-4B-Coding-max-GGUF (estatico) | 4,02 B | no disponible | Apache 2.0 | GGUF (estatico) | Variante de cuantizaciones estaticas del mismo autor, sin imatrix |
| Alternativas de codigo de ~4B | no disponible | no disponible | no disponible | no disponible | No se dispone de datos verificados en la informacion proporcionada para establecer una comparacion con Qwen2.5-Coder, CodeLlama u otros modelos de tamano similar |

## Limitaciones y advertencias

- Información técnica insuficiente: no se documentan arquitectura, contexto, tokenizador, plantilla de chat ni proceso de entrenamiento, lo que dificulta predecir su comportamiento en producción.
- Idiomas: solo se declara inglés; el rendimiento en castellano es desconocido y probablemente deficiente.
- Riesgo de alucinación: como todo modelo de código de 4B, puede generar APIs inexistentes, imports falsos o lógica incorrecta que compile pero falle en tiempo de ejecución. Requiere validación automática (tests, linters, compilación) antes de aceptar su salida.
- Modelo "uncensored": la ausencia de filtros implica que puede producir contenido ofensivo, código malicioso o instrucciones peligrosas sin rechazo. No es adecuado para aplicaciones orientadas a usuarios finales sin una capa de moderación propia.
- Licencia Apache 2.0: permite uso comercial y modificación, pero el modelo base es un merge cuyos componentes originales no se detallan; conviene verificar que todos los modelos fusionados sean compatibles con Apache 2.0 antes de un despliegue comercial.
- Cuantizaciones extremas: las variantes IQ1 e IQ2 conllevan degradación de calidad significativa; el propio autor las describe como "for the desperate" o "mostly desperate". No deben usarse en producción.
- Sesgos: no documentados. Al no publicarse la composición del dataset, no es posible evaluar sesgos de género, raza o licencia de código.
- Fecha de creación futura en los metadatos (2026-09-21): conviene tratar las fechas del repositorio con cautela, ya que pueden reflejar errores de registro o de reloj en el sistema de publicación.

## Enlaces

- Repositorio Hugging Face de las cuantizaciones imatrix: https://huggingface.co/mradermacher/Rhea-4B-Coding-max-i1-GGUF
- Modelo base: https://huggingface.co/roskosmos19/Rhea-4B-Coding-max
- Cuantizaciones estáticas del mismo modelo: https://huggingface.co/mradermacher/Rhea-4B-Coding-max-GGUF
- Página de descargas del autor: https://hf.tst.eu/model#Rhea-4B-Coding-max-i1-GGUF
- Dataset Aquiles-ai/Athenea-Coding-100k: https://huggingface.co/datasets/Aquiles-ai/Athenea-Coding-100k
- Dataset roskosmos19/Rhea-Coding: https://huggingface.co/datasets/roskosmos19/Rhea-Coding
- Guía de uso de GGUF citada por el autor (README de TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Preguntas frecuentes y solicitudes de cuantización de mradermacher: https://huggingface.co/mradermacher/model_requests
- Comparativa de calidad de tipos de cuantización (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
