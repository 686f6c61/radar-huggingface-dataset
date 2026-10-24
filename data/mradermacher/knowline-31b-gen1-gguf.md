# mradermacher/KnowLine-31B-Gen1-GGUF

## Resumen

KnowLine-31B-Gen1-GGUF es la colección de cuantizaciones GGUF publicada por mradermacher sobre el modelo PelaAI/KnowLine-31B-Gen1, un modelo de 30.697.345.596 parámetros (unos 30,7 mil millones) que su autor etiqueta como *decision-model* dentro de la categoría *system-one*, con un índice de decisión (*decision-index*) y resultado de una fusión de LoRA (*lora-merged*). El repositorio que nos ocupa no entrena nada: únicamente convierte los pesos originales a formato GGUF en 11 niveles de cuantización estática, de Q2_K a Q8_0, además de dos ficheros `mmproj` que apuntan a un componente multimodal.

La relevancia práctica es doble. Por un lado, la licencia Apache 2.0 del modelo base permite uso comercial sin restricciones adicionales conocidas. Por otro, la existencia de cuantizaciones desde 12,0 GB (Q2_K) hasta 32,7 GB (Q8_0) hace que un modelo de ~31B pueda ejecutarse en una sola GPU de consumo con 24 GB de VRAM si se elige Q4_K_S o Q4_K_M (17,9 y 18,8 GB respectivamente), algo imposible con los pesos en precisión completa.

Ahora bien, la documentación disponible es mínima: no se publican arquitectura detallada, longitud de contexto, composición del dataset de entrenamiento, proceso de alineamiento ni resultados de benchmarks. Los idiomas declarados son inglés y chino. Cualquier evaluación seria del modelo requiere pruebas propias.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible. El repo base declara `library_name: transformers` y los ficheros son GGUF, lo que implica una arquitectura de tipo transformer, pero el autor no especifica familia, número de capas ni tipo de atención |
| Parametros totales | 30.697.345.596 (dato real de safetensors del modelo base) |
| Parametros activos | No disponible / no aplica (no se ha documentado una arquitectura MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0; adicionalmente mmproj-f16 y mmproj-Q8_0 para el componente multimodal |
| Idiomas soportados | Inglés (en) y chino (zh) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (cuantizaciones estáticas, `convert_type: hf`, `output_tensor_quantised: 1`); el modelo base se distribuye en safetensors |

## Arquitectura y entrenamiento

No se dispone de información sobre la arquitectura interna del modelo base: la model card de la cuantización no incluye número de capas, dimensión oculta, mecanismo de atención, vocabulario ni función de activación. Los metadatos apuntan a un transformer estándar consumible por `transformers` y convertible a GGUF, pero es una inferencia, no un dato confirmado. Tampoco se documenta si emplea atención lineal, decodificación especulativa, attention sinks u otra innovación técnica.

Respecto al entrenamiento, los únicos indicios son las etiquetas del repositorio: `lora-merged` indica que el modelo publicado incorpora uno o varios adaptadores LoRA fusionados en los pesos base, y `decision-model` / `system-one` / `decision-index` sugieren un ajuste orientado a toma de decisiones rápidas y de un solo paso, en contraposición a cadenas de razonamiento largas. Se desconoce el modelo preentrenado de partida, el volumen de tokens de entrenamiento, la composición del dataset y si hubo RLHF, DPO o cualquier otra fase de alineamiento. Los ficheros `mmproj` (multi-modal supplement) de 0,9 y 1,3 GB implican la existencia de un proyector visión-lenguaje, aunque no se detalla qué codificador visual se utiliza ni qué resolución de imagen soporta.

## Capacidades

- Generación de texto conversacional multi-turno: los tags `conversational` y `endpoints_compatible` indican que el modelo está preparado para chat y para APIs compatibles con endpoints tipo OpenAI.
- Modelo orientado a decisión: las etiquetas `decision-model`, `system-one` y `decision-index` apuntan a un uso como clasificador o selector de decisiones (elegir entre opciones, puntuar alternativas) más que a la generación de razonamiento extenso. El comportamiento exacto no está documentado.
- Multimodalidad (presunta): la presencia de ficheros `mmproj-f16` y `mmproj-Q8_0` indica soporte de entrada de imágenes a través de llama.cpp, pero no se especifican tareas, resolución ni métricas.
- Multilingüismo limitado a inglés y chino; no se declara soporte de español ni de otras lenguas.
- Soporte de *tool calling* / *function calling*: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible; la etiqueta `system-one` sugiere lo contrario (respuesta rápida e intuitiva), por lo que conviene verificarlo empíricamente antes de usarlo en bucles de agente.
- Modo *thinking* explícito, audio o vídeo: no disponible.

## Casos de uso

- Enrutamiento y selección de opciones en pipelines: usar el modelo como clasificador de decisión (por ejemplo, elegir qué herramienta invocar o qué cola asignar a un ticket), aprovechando la etiqueta `decision-model`; requiere validación previa contra un conjunto etiquetado propio.
- Asistente conversacional bilingüe inglés-chino: despliegue en llama.cpp u Ollama para atención en ambos idiomas, con cuantización Q4_K_M (18,8 GB) en una GPU de 24 GB.
- Procesamiento de documentos con componente visual: si se confirma el soporte multimodal, extracción de información de capturas, formularios o gráficos sencillos cargando el fichero `mmproj` junto al GGUF.
- Despliegue en hardware de gama alta de consumo para prototipado: Q4_K_S (17,9 GB) o IQ4_XS (17,0 GB) permiten ejecutar un modelo de ~31B en una RTX 4090, útil para evaluar calidad antes de comprometerse con infraestructura mayor.
- Servicio interno con requisitos de licencia laxa: al ser Apache 2.0, puede integrarse en productos comerciales sin obligaciones de atribución más allá de las habituales, sujeto a revisión legal de los términos del modelo base.
- Evaluación comparativa de cuantizaciones: el repositorio ofrece 11 niveles, lo que permite medir la degradación de perplejidad y de precisión en la tarea concreta de decisión y elegir el punto óptimo calidad/tamaño.
- Sustitución de un modelo mayor en tareas de clasificación: si la tarea es acotada (etiquetado, scoring de pares), un 31B cuantizado a Q5_K_M (21,9 GB) puede cubrir el hueco con menor coste de VRAM que un modelo denso mayor.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. Ni la model card de la cuantización ni los metadatos del modelo base incluyen valores de MMLU, HumanEval, GSM8K, MMLU-Pro, ni comparaciones con otros modelos. Tampoco se han publicado mediciones de perplejidad por tipo de cuantización; el gráfico enlazado en la model card (`quantpplgraph.png`) es una referencia genérica de ikawrakow sobre tipos de cuantización, no un resultado medido para este modelo.

## Requisitos de hardware

- VRAM estimada para inferencia, a partir del tamaño de cada fichero más el *KV cache* (que depende del contexto, no documentado):
  - Q2_K: 12,0 GB de pesos; ~13-14 GB con contexto corto.
  - IQ4_XS: 17,0 GB; Q4_K_S: 17,9 GB; Q4_K_M: 18,8 GB → ~20-22 GB con contexto moderado.
  - Q5_K_S: 21,4 GB; Q5_K_M: 21,9 GB → ~24 GB, al límite de una RTX 4090.
  - Q6_K: 25,3 GB; Q8_0: 32,7 GB → requieren 32-40 GB o reparto entre dos GPU.
- GPU recomendadas: RTX 4090 / RTX 4080 Super (24/16 GB) para Q2_K a Q4_K_M; A6000 48 GB, RTX 6000 Ada 48 GB o A100 40 GB para Q6_K y Q8_0; H100 80 GB solo si se necesita contexto muy largo o se sirve en paralelo.
- ¿Cabe en GPU de consumo? Sí: Q2_K (12,0 GB) entra en tarjetas de 16 GB como la RTX 4080 o la RTX 4060 Ti 16 GB; Q4_K_S y Q4_K_M entran en 24 GB (RTX 3090/4090) siempre que el contexto sea moderado.
- Despliegue: llama.cpp, Ollama (con Modelfile propio), LM Studio y llama-cpp-python son las rutas naturales para GGUF, incluido el `mmproj` para el modo multimodal. vLLM y TGI tienen soporte limitado o experimental de GGUF; para servir en FP16/BF16 conviene usar los safetensors del modelo base con transformers o vLLM y ~62 GB de VRAM.
- Latencia y throughput: no hay mediciones publicadas. Como estimación aritmética a partir del ancho de banda de una RTX 4090 (1.008 GB/s) y de un peso efectivo de ~19 GB en Q4_K_M, el techo teórico ronda las 50 tokens/s, con valores realistas de 25-35 tokens/s en generación; es una estimación, no una cifra medida.

## Comparativa con modelos similares

No hay benchmarks publicados para KnowLine-31B-Gen1, por lo que la comparación se limita a especificaciones y disponibilidad. Los datos de los modelos alternativos provienen de sus respectivas documentaciones públicas.

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| KnowLine-31B-Gen1 | 30,7B | No disponible | Apache 2.0 | safetensors + GGUF (11 cuants) | Etiquetado como decision-model, idiomas en/zh, sin benchmarks |
| Qwen3-32B | 32,8B | 32.768 nativo (extensible a 131.072 con YaRN) | Apache 2.0 | safetensors + GGUF | Modo thinking/no-thinking, multilingüe amplio, benchmarks publicados |
| Gemma 3 27B | 27B | 128K | Gemma Terms of Use | safetensors + GGUF | Multimodal, 140+ idiomas, requiere aceptar términos |
| Mistral Small 3.1 24B | 24B | 128K | Apache 2.0 | safetensors + GGUF | Multimodal, enfocado a latencia baja |

La diferencia principal no está en el tamaño sino en la trazabilidad: los tres alternativas tienen model cards extensas, benchmarks y comunidad amplia; KnowLine no ofrece ninguno de esos elementos, de modo que su adopción implica asumir el coste de una evaluación propia.

## Limitaciones y advertencias

- Ausencia total de benchmarks: no hay ninguna evidencia publicada de calidad, y las etiquetas `decision-model` / `system-one` no vienen acompañadas de definición de tarea ni de métricas.
- Idiomas restringidos a inglés y chino; el rendimiento en castellano no está garantizado y probablemente sea inferior.
- Longitud de contexto desconocida: planificar despliegues con contextos largos sin conocerla puede provocar truncamientos silenciosos o degradación.
- Riesgo de alucinación no evaluado; sin datos de alineamiento (RLHF/DPO) no puede asumirse un comportamiento conversacional seguro.
- Adopción nula: 0 descargas y 0 likes en el momento de la consulta, lo que implica ausencia de validación por parte de la comunidad y de informes de errores.
- Cuantizaciones de baja precisión (Q2_K, Q3_K_S) degradan la calidad de forma notable; para producción conviene Q4_K_M o superior.
- El repositorio completo ocupa 213,9 GB; descargar todo es innecesario, conviene bajar solo el cuant y, si aplica, el `mmproj` elegido.
- Licencia Apache 2.0 en la cuantización y en el modelo base según los metadatos, lo que en principio permite uso comercial; aun así, conviene verificar la procedencia de los datos de entrenamiento del modelo base, no documentada.
- El soporte multimodal a través de `mmproj` no está documentado en cuanto a tareas ni precisión; tratarlo como experimental.
- El modelo base es un `lora-merged`: si el adaptador se fusionó sobre un preentrenado con licencia distinta, podrían aplicarse condiciones adicionales no reflejadas en los tags.

## Enlaces

- Repositorio de la cuantización: https://huggingface.co/mradermacher/KnowLine-31B-Gen1-GGUF
- Modelo base: https://huggingface.co/PelaAI/KnowLine-31B-Gen1
- Página de descargas del cuantizador para este modelo: https://hf.tst.eu/model#KnowLine-31B-Gen1-GGUF
- Preguntas frecuentes y solicitudes de cuantización de mradermacher: https://huggingface.co/mradermacher/model_requests
- Guía de uso de GGUF y ficheros multiparte (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Notas sobre tipos de cuantización (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Gráfico de perplejidad por tipo de cuantización (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- nethype GmbH (infraestructura del cuantizador): https://www.nethype.de/

Nota: la búsqueda web realizada no devolvió resultados pertinentes sobre este modelo (únicamente páginas sin relación con el contenido), por lo que no se han podido añadir papers, blogs ni demos adicionales.
