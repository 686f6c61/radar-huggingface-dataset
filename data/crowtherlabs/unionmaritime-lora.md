# CrowtherLabs/UnionMaritime-LoRA

## Resumen

UnionMaritime-LoRA es un adaptador de ajuste fino del tipo LoRA (Low-Rank Adaptation) publicado por CrowtherLabs en HuggingFace. Se distribuye como repositorio PEFT de aproximadamente 0,5 GB y declara como modelo base Qwen/Qwen3.8-27B-FP8, es decir, un modelo de generación de texto causal de la familia Qwen en su variante cuantizada a FP8. El identificador del repositorio sugiere una especialización en el ámbito marítimo o naviero, aunque la model card no documenta el corpus de entrenamiento ni el objetivo concreto del ajuste, por lo que esa especialización no puede confirmarse con la información disponible.

El interés técnico del artefacto es doble. Por un lado, ejemplifica el flujo habitual de adaptación de bajo coste sobre un modelo grande: en lugar de reentrenar los aproximadamente 27 000 millones de parámetros nominales que sugiere el nombre del modelo base, se publican únicamente los pesos del adaptador, lo que reduce el tamaño del repositorio a unos cientos de megabytes y permite cargar y descargar variantes de dominio sobre un mismo checkpoint base. Por otro lado, es un caso claro de repositorio con documentación incompleta: la model card es la plantilla por defecto de HuggingFace con prácticamente todos los campos marcados como "More Information Needed".

En el momento de redactar esta ficha el repositorio acumula 0 descargas y 0 "likes", fue creado el 18 de septiembre de 2026 y su última actualización es del mismo día. No se ha publicado información sobre licencia, idiomas, datos de entrenamiento, hiperparámetros de la LoRA (rango, alpha, módulos objetivo) ni resultados de evaluación, lo que limita seriamente su uso en producción sin una validación previa por parte del integrador.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre un transformer causal de la familia Qwen; arquitectura interna del modelo base no disponible |
| Parametros totales | No disponible para el adaptador. El modelo base se identifica como Qwen3.8-27B-FP8, lo que sugiere ~27 000 millones de parametros nominales, dato no verificado en la informacion proporcionada |
| Parametros activos | No procede (no consta que el modelo base sea MoE) |
| Longitud de contexto | No disponible; heredada del modelo base, sin confirmar |
| Tipos de cuantizacion | El modelo base se distribuye en FP8. El adaptador se publica en safetensors. No se documentan versiones GGUF, AWQ, GPTQ ni otras |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | safetensors (repositorio PEFT, libreria `peft` 0.21.0); etiqueta `transformers` |
| Tamano del repositorio | 0,5 GB |
| Version de PEFT declarada | 0.21.0 |
| Fecha de creacion | 18 de septiembre de 2026 |
| Ultima actualizacion | 18 de septiembre de 2026 |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

El repositorio contiene un adaptador LoRA, no un modelo completo. LoRA congela los pesos del modelo base e inyecta matrices de bajo rango en determinadas capas (habitualmente las proyecciones de atención y, en algunos casos, las de las capas MLP), de forma que solo se entrenan y se publican esos tensores adicionales. En inferencia, la salida de la capa se calcula como la suma de la contribución del modelo base congelado y la del adaptador. El repositorio no especifica el rango, el valor de alpha, el dropout ni la lista de módulos objetivo, que son los hiperparámetros críticos para reproducir o continuar el ajuste.

El modelo base declarado es Qwen/Qwen3.8-27B-FP8. Se trata de un transformer causal de tipo decoder-only con pesos cuantizados a FP8, según la nomenclatura del identificador. No se dispone de información verificada sobre el número exacto de tokens de entrenamiento del modelo base, la composición del dataset, ni si se aplicaron fases de alineación como RLHF o DPO; esos datos corresponden a la documentación de Qwen y no se reproducen aquí porque no forman parte de la información proporcionada. Para el adaptador en sí no hay ningún dato de entrenamiento: se desconoce el dataset, el número de pasos, la tasa de aprendizaje y el régimen de precisión.

La única pista sobre el proceso de entrenamiento es la etiqueta `tensorboard` en los metadatos del repositorio, que indica que el autor registró métricas de entrenamiento con TensorBoard, aunque los archivos de logs no se han publicado o no están accesibles en la información disponible. La etiqueta `arxiv:1910.09700` que aparece en los tags no corresponde a un artículo sobre este modelo: es la referencia al calculador de impacto medioambiental (Lacoste et al., 2019) que aparece en la plantilla por defecto de las model cards de HuggingFace. También figura un tag `base_model:adapter:/workspace/qwen3.8-27b` que apunta a una ruta local del entorno de entrenamiento del autor, no a un identificador público de HuggingFace, lo que sugiere una preparación poco cuidada de la publicación.

## Capacidades

No se ha publicado ninguna evaluación de capacidades específica de este adaptador. Las siguientes afirmaciones describen lo que cabría esperar por la naturaleza del artefacto y deben tratarse como hipótesis a verificar, no como hechos documentados:

- Generación de texto conversacional: el pipeline declarado es `text-generation` y el tag `conversational` indica uso previsto en diálogo multi-turno, presumiblemente heredado del modelo base.
- Especialización de dominio: el nombre del repositorio sugiere un ajuste orientado al sector marítimo, portuario o naviero, sin que exista documentación que lo confirme.
- Razonamiento y conocimiento general: no disponibles; dependen enteramente del modelo base Qwen3.8-27B-FP8 y del grado de olvido catastrófico introducido por el ajuste.
- Generación de código y matemáticas: no disponible.
- Soporte de tool calling o function calling: no disponible para el adaptador; dependería del modelo base.
- Capacidades de agente y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponibles; los idiomas del modelo base no se documentan y la model card deja el campo "Language(s)" sin rellenar.
- Capacidades multimodales (visión, audio): no disponibles; el pipeline declarado es únicamente de generación de texto.
- Modo "thinking" o razonamiento explícito: no disponible.

## Casos de uso

Los siguientes escenarios son aplicaciones realistas de un adaptador LoRA de dominio sobre un modelo base grande. En todos ellos se asume que el integrador realiza primero una validación propia, dado que no existe documentación de evaluación:

- Adaptación de dominio en el sector marítimo y portuario: si el ajuste cumple lo que sugiere su nombre, el adaptador podría emplearse para responder consultas sobre documentación naviera, normativa marítima o gestión de flotas, manteniendo el modelo base como soporte de conocimiento general. La ventaja del formato LoRA es que permite comparar varias especializaciones sobre el mismo checkpoint base sin duplicar los pesos completos.
- Servicio multi-tenant con conmutación de adaptadores: en un despliegue con vLLM o con la API de PEFT es posible cargar el modelo base una sola vez en memoria y servir distintos adaptadores LoRA por petición. Esto permite ofrecer un asistente generalista y otro especializado en dominio marítimo desde la misma GPU, reduciendo el coste de VRAM frente a mantener dos modelos completos.
- Atención al cliente en logística y transporte: un asistente multi-turno que gestione consultas sobre estado de envíos, incoterms o documentación aduanera, siempre que la longitud de contexto heredada del modelo base sea suficiente para arrastrar el histórico de la conversación. Este dato no está confirmado.
- Extracción y resumen de documentación técnica: procesamiento de conocimiento de embarque, manifiestos de carga, pólizas de seguro marítimo o informes de inspección, generando resúmenes estructurados para su volcado en un sistema de gestión documental.
- Base para investigación en adaptación de bajo rango: el repositorio sirve como ejemplo reproducible de publicación de adaptadores con PEFT, útil para estudiar qué metadatos son imprescindibles (rango, alpha, módulos objetivo, dataset) y qué consecuencias tiene su ausencia en la reproducibilidad.
- Evaluación comparativa de adaptadores: dado su tamaño reducido (0,5 GB), es viable descargarlo y medir su degradación respecto al modelo base en tareas generales, para cuantificar el olvido catastrófico introducido por el ajuste de dominio.
- Prototipado interno con hardware limitado: el adaptador puede cargarse sobre el modelo base cuantizado en un servidor de inferencia existente sin necesidad de aprovisionar almacenamiento adicional para un checkpoint completo, lo que facilita experimentar con especializaciones antes de comprometer recursos.
- Generación asistida de textos normativos y contractuales: redacción de borradores de cláusulas, actas o comunicaciones en el ámbito marítimo-portuario, siempre con revisión humana obligatoria dado que no existe ninguna métrica publicada de fidelidad factual.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del repositorio incluye la sección "Evaluation" sin rellenar, con todos los campos marcados como "More Information Needed", y no se han encontrado evaluaciones independientes ni discusiones en los resultados de búsqueda web consultados.

## Requisitos de hardware

Las siguientes cifras son estimaciones derivadas del tamaño nominal que sugiere el identificador del modelo base (~27 000 millones de parámetros) y del tamaño del adaptador (0,5 GB). No son datos publicados por el autor:

- VRAM para inferencia con el modelo base en FP8: aproximadamente 27 GB solo para los pesos, más el adaptador (menos de 0,5 GB) y la caché KV. Contando caché y overhead del runtime, un despliegue con contexto moderado se sitúa en torno a 32-40 GB, fuera del alcance de una GPU de consumo de 24 GB.
- VRAM si se fusiona el adaptador con el modelo base y se recuantiza a 4 bits: aproximadamente 15-17 GB de pesos, lo que sí entra en una RTX 4090, RTX 3090, RTX 5090 o L40S, dejando margen para caché KV con contextos moderados.
- GPU recomendadas en FP8: H100, H200 y L40S, que disponen de soporte nativo para kernels FP8. Las GPU de consumo de arquitecturas recientes también incorporan soporte parcial de FP8 en algunos runtimes, pero conviene verificar la compatibilidad del backend elegido.
- GPU recomendadas tras recuantización: RTX 4090/5090 (24-32 GB), A6000 (48 GB), L40S (48 GB) o A100 40/80 GB si se mantiene FP8 con contexto largo.
- Opciones de despliegue: vLLM soporta servir adaptadores LoRA sobre un modelo base FP8; TGI ofrece soporte de adaptadores en algunas versiones; con `peft` y `transformers` puede cargarse el adaptador directamente sobre el modelo base, aunque con menor throughput que un servidor dedicado. Para llama.cpp u Ollama sería necesario fusionar el adaptador con el modelo base y convertir el resultado a GGUF, ya que estos runtimes no consumen adaptadores PEFT de forma nativa.
- Latencia y throughput estimados: no disponible. No hay ninguna medición publicada de tokens por segundo, tiempo hasta el primer token ni comportamiento bajo batching.

## Comparativa con modelos similares

No se dispone de información verificada sobre alternativas comparables. El repositorio no publica métricas, no declara licencia y no documenta su dataset, de modo que cualquier comparación cuantitativa sería especulativa. La comparación que sí puede establecerse es estructural:

| Elemento | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| CrowtherLabs/UnionMaritime-LoRA | Adaptador LoRA; base de ~27 000 millones nominales | No disponible | No disponible | Repositorio público en HuggingFace, 0 descargas | Documentación incompleta; hiperparámetros de la LoRA no publicados |
| Qwen/Qwen3.8-27B-FP8 (modelo base) | ~27 000 millones nominales segun su identificador | No disponible en la informacion proporcionada | No disponible en la informacion proporcionada | Referenciado como modelo base del adaptador | Aporta todas las capacidades reales; el adaptador solo modifica parte de sus pesos |
| Otros adaptadores LoRA sobre la misma base | No disponible | No disponible | No disponible | No disponible | No se han identificado en la informacion proporcionada |

## Limitaciones y advertencias

- Documentación ausente: la model card es la plantilla por defecto de HuggingFace. No hay información sobre datos de entrenamiento, hiperparámetros, evaluación, sesgos ni uso previsto, lo que impide auditar el modelo.
- Riesgo de alucinación: no evaluado. Al ser un ajuste sobre un modelo generativo sin métricas publicadas, el riesgo de fabricación de datos es al menos tan alto como el del modelo base, y potencialmente mayor si el corpus de ajuste era reducido o poco diverso.
- Sesgos conocidos: no disponibles. El dataset de ajuste es desconocido, por lo que no puede analizarse si introduce sesgos de dominio, geográficos o ideológicos.
- Licencia indeterminada: al no declararse licencia, no puede asumirse permiso de uso comercial. La licencia del modelo base tampoco se reproduce en la información proporcionada, y un adaptador hereda las restricciones del modelo sobre el que se aplica. Es imprescindible consultar ambas antes de cualquier despliegue en producción.
- Idiomas: no disponibles. No puede garantizarse un rendimiento correcto en castellano ni en ningún otro idioma concreto.
- Sobreajuste de dominio: un adaptador de dominio puede degradar el rendimiento general del modelo base (olvido catastrófico). Sin evaluación comparativa frente al base no puede cuantificarse esta pérdida.
- Metadatos inconsistentes: el repositorio incluye una ruta local (`/workspace/qwen3.8-27b`) como etiqueta de modelo base y una referencia a un artículo sobre impacto medioambiental como si fuese un paper del modelo, lo que indica una publicación descuidada y reduce la confianza en el resto de los metadatos.
- Estado del repositorio: 0 descargas y 0 "likes" en la fecha de consulta. No hay evidencia de uso, validación por terceros ni mantenimiento posterior a la creación.
- Compatibilidad de cuantización: cargar un adaptador entrenado sobre un base FP8 en un runtime distinto (por ejemplo, tras fusionar y convertir a GGUF q4) puede alterar el comportamiento respecto al original; conviene medir la degradación introducida por la recuantización.
- Uso en producción: no recomendado sin una evaluación propia sobre el dominio objetivo, y en ningún caso en aplicaciones con consecuencias legales, médicas, financieras o de seguridad sin supervisión humana.

## Enlaces

- Repositorio del modelo en HuggingFace: https://huggingface.co/CrowtherLabs/UnionMaritime-LoRA
- Modelo base declarado: https://huggingface.co/Qwen/Qwen3.8-27B-FP8
- Documentación de PEFT (librería declarada, versión 0.21.0): https://github.com/huggingface/peft
- Referencia citada en los tags del repositorio (Lacoste et al., 2019, sobre estimación de impacto medioambiental): https://arxiv.org/abs/1910.09700
- Calculador de impacto medioambiental de machine learning: https://mlco2.github.io/impact

Nota sobre la búsqueda web: las consultas realizadas no devolvieron ningún resultado relacionado con este modelo ni con CrowtherLabs. Los enlaces recuperados correspondían a preguntas de foros sobre aplicaciones de mensajería y no guardan relación con el objeto de esta ficha, por lo que se omiten.
