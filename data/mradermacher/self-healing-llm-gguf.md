# mradermacher/Self-Healing-LLM-GGUF

## Resumen

Self-Healing-LLM-GGUF es una colección de cuantizaciones en formato GGUF del modelo kambleaa007/Self-Healing-LLM, generada por mradermacher (nethype GmbH). El modelo subyacente es un transformer denso de 493.792.640 parámetros (aproximadamente 494 millones) etiquetado por el autor como perteneciente a la familia Qwen2, con licencia Apache-2.0 y orientado específicamente a generación de código. El repositorio de cuantizaciones ocupa 5,4 GB e incluye doce variantes de cuantización, desde Q2_K (0,4 GB) hasta f16 (1,1 GB).

La propuesta del modelo base gira en torno a tres mecanismos declarados en sus etiquetas: aut corrección o "self-healing", razonamiento no monotónico ("non-monotonic") y backtracking, junto con una gestión dinámica de la caché KV ("dynamic-kv-cache"). Estos mecanismos apuntan a un flujo de generación de código en el que el modelo puede revertir pasos y reparar sus propias salidas dentro de la misma secuencia, algo poco habitual en modelos de menos de 500 millones de parámetros.

Su relevancia práctica es doble: por un lado, se trata de un modelo muy pequeño que cabe en cualquier GPU de consumo e incluso en CPU, lo que lo hace apto para entornos con recursos limitados, CI/CD o inferencia local; por otro, la existencia de cuantizaciones GGUF listas para usar reduce la fricción de despliegue con llama.cpp, Ollama o LM Studio. Como contrapartida, la model card publicada no documenta ni la composición del dataset de entrenamiento, ni el número de tokens, ni resultados de benchmarks, por lo que la evaluación debe hacerse de forma empírica.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (decoder-only), etiquetado como familia qwen2 por el autor |
| Parametros totales | 493.792.640 (aproximadamente 0,49 mil millones) |
| Parametros activos | no aplica (modelo denso, no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 |
| Idiomas soportados | en (ingles) y code (lenguajes de programacion) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (cuantizado); el modelo base se distribuye en safetensors |
| Tamano del repositorio | 5,4 GB (suma de todas las variantes) |
| Modelo base | kambleaa007/Self-Healing-LLM |
| Cuantizado por | mradermacher |
| Fecha de creacion del repo | 2026-09-24 |

## Arquitectura y entrenamiento

La informacion disponible no incluye una descripcion tecnica detallada de la arquitectura. La etiqueta qwen2 asociada al modelo base indica que se trata de un transformer decoder-only de la familia Qwen2, lo que en esa familia implica atención con RoPE, grouped-query attention (GQA) y FFN con activación SwiGLU; sin embargo, no se confirma en la documentacion proporcionada ni el numero de capas, ni las dimensiones ocultas, ni el numero de cabezas de atención, ni el tamano de vocabulario.

Tampoco hay datos sobre el proceso de entrenamiento: se desconoce el numero de tokens utilizados, la composicion del dataset, si hubo fases de ajuste por instrucciones, RLHF o DPO, y si los mecanismos de self-healing y backtracking se implementaron mediante datos de entrenamiento especificos, mediante un bucle de decodificacion a nivel de inferencia o mediante modificaciones en el grafo de atencion. Las etiquetas dynamic-kv-cache y backtracking sugieren que parte de la innovacion se situa en el momento de la inferencia, probablemente permitiendo descartar y regenerar tramos de la caché KV, pero esto no esta documentado por el autor. La model card de esta cuantizacion es generada automaticamente por el pipeline de mradermacher y solo contiene informacion sobre los archivos GGUF, no sobre el modelo original.

## Capacidades

- Generacion de codigo: es la capacidad principal declarada mediante la etiqueta code-generation.
- Autocorreccion o self-healing: el modelo esta disenado para detectar y reparar errores en su propia salida, presumiblemente mediante regeneracion de fragmentos.
- Razonamiento no monotónico (non-monotonic): capacidad declarada de revisar decisiones previas en lugar de construir la respuesta de forma estrictamente incremental.
- Backtracking: posibilidad de retroceder en la secuencia generada, coherente con la etiqueta anterior.
- Gestion dinamica de cache KV (dynamic-kv-cache): la atencion se gestiona de forma que la cache puede modificarse durante la generacion.
- Idiomas: ingles y codigo fuente. No hay soporte multilingüe declarado para lenguas naturales distintas del ingles.
- Tool calling / function calling: no documentado en la informacion disponible.
- Capacidades de agente y razonamiento multi-paso: no documentadas, aunque el backtracking es un componente habitualmente asociado a flujos agénticos.
- Vision, audio u otras modalidades: no disponibles; el modelo es exclusivamente de texto.

## Casos de uso

- Asistente de codigo en local: con 494 millones de parametros y cuantizaciones de 0,4 a 0,6 GB, el modelo puede ejecutarse integramente en un portatil o en una estacion sin GPU dedicada, ofreciendo autocompletado y generacion de funciones sin enviar codigo a servicios externos.
- Reparacion automatica de errores de compilacion: el mecanismo de self-healing permite introducir el mensaje de error del compilador junto al fragmento de codigo y solicitar una version corregida, con capacidad de revertir cambios previos si la primera correccion falla.
- Preprocesado y linting asistido en pipelines de CI/CD: al ser un modelo pequeno y rapido de cargar, puede integrarse como paso adicional en un pipeline que revise diffs y proponga correcciones antes del merge, sin coste de API.
- Generacion de pruebas unitarias: dado un fragmento de funcion, el modelo puede producir casos de prueba; su tamano reducido permite ejecutarlo en el mismo runner que compila el proyecto.
- Entornos con requisitos estrictos de privacidad: los pesos y la licencia Apache-2.0 permiten despliegue on-premise en sectores regulados (banca, sanidad, defensa) donde no se puede recurrir a APIs de terceros.
- Ensenanza y experimentacion en investigación: como modelo de menos de 500 millones de parametros con mecanismos de backtracking declarados, es un banco de pruebas asequible para estudiar decodificacion no monotónica y compararla con decodificacion autoregresiva estandar.
- Prototipado rapido de herramientas de refactorizacion: tareas de reescritura de funciones, traduccion entre lenguajes de programacion o generacion de documentacion a partir de firmas, ejecutables en CPU con cuantizaciones Q4_K_M o inferiores.
- Filtrado previo en arquitecturas de cascada: usar el modelo como primera etapa que resuelve consultas sencillas de codigo y deriva al modelo grande solo los casos complejos, reduciendo el coste total de inferencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del repositorio de cuantizaciones no incluye metricas (ni MMLU, ni HumanEval, ni GSM8K, ni perplejidad), y la busqueda web realizada no ha devuelto informacion tecnica utilizable sobre este modelo.

## Requisitos de hardware

- VRAM estimada para inferencia (con contexto reducido y sin overhead de servidor):
  - f16: aproximadamente 1,1 GB.
  - Q8_0: aproximadamente 0,6 GB.
  - Q6_K: aproximadamente 0,6 GB.
  - Q5_K_S / Q5_K_M: aproximadamente 0,5 GB.
  - Q4_K_S / Q4_K_M: aproximadamente 0,5 GB (recomendadas por el autor por equilibrio velocidad/calidad).
  - IQ4_XS: aproximadamente 0,5 GB.
  - Q3_K_S / Q3_K_M / Q3_K_L: aproximadamente 0,4-0,5 GB.
  - Q2_K: aproximadamente 0,4 GB.
  - A estas cifras hay que sumar la memoria de la cache KV, que depende de la longitud de contexto configurada (no documentada).
- GPU recomendadas: cualquier GPU con 2 GB o mas de VRAM es suficiente, por ejemplo GTX 1650, RTX 3050, RTX 4060, RTX 4090. Tambien es viable en CPU (AVX2) y en Apple Silicon mediante Metal.
- Cabe en GPU de consumo: si, en practicamente todas las GPU dedicadas modernas e incluso en iGPU con memoria compartida suficiente.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, text-generation-webui (oobabooga) y cualquier runtime compatible con GGUF. El repositorio tambien esta marcado como endpoints_compatible y su libreria declarada es transformers, por lo que el modelo base en safetensors puede cargarse con la libreria transformers.
- Latencia y throughput estimados: no disponibles. No se han publicado mediciones de tokens por segundo para ninguna de las cuantizaciones.

## Comparativa con modelos similares

Los datos de los modelos comparativos provienen de sus model cards publicas y no de la informacion proporcionada en esta busqueda; deben verificarse antes de usarse en produccion.

| Modelo | Parametros | Contexto | Licencia | Orientacion |
|---|---|---|---|---|
| Self-Healing-LLM (este modelo, base) | 493,8 M | no disponible | Apache-2.0 | Generacion de codigo con self-healing y backtracking |
| Qwen2.5-Coder-0.5B | 494 M | 32.768 tokens (segun su model card) | Apache-2.0 | Generacion de codigo generalista |
| SmolLM2-360M-Instruct | 362 M | 8.192 tokens (segun su model card) | Apache-2.0 | Instrucciones generales, texto |
| TinyLlama-1.1B | 1.100 M | 2.048 tokens (segun su model card) | Apache-2.0 | Instrucciones generales, texto |

La diferencia mas significativa frente a estas alternativas es la propuesta de mecanismos de autocorreccion y backtracking, que ninguno de los comparadores incorpora de forma explicita. En cambio, este modelo carece de datos publicados de contexto, benchmarks y proceso de entrenamiento, mientras que los comparadores cuentan con evaluaciones publicadas.

## Limitaciones y advertencias

- Ausencia total de benchmarks: no hay evidencia publicada de calidad de generacion de codigo, por lo que no se recomienda su uso en produccion sin una evaluacion propia previa.
- Documentacion tecnica minima: se desconoce la longitud de contexto soportada, el dataset de entrenamiento, el numero de tokens y el proceso de alineacion. Esto impide estimar el comportamiento fuera de distribucion.
- Riesgo de alucinacion: al tratarse de un modelo de menos de 500 millones de parametros, la probabilidad de generar APIs inexistentes, importaciones erroneas o fragmentos sintacticamente validos pero semanticamente incorrectos es elevada.
- Cobertura linguistica limitada: solo ingles y codigo. No hay soporte declarado para castellano ni para otras lenguas naturales.
- Los mecanismos de self-healing y backtracking no estan documentados: se desconoce si requieren un runtime especifico, si funcionan con los pesos GGUF cuantizados o si son unicamente caracteristicas del prompt. Es probable que parte del comportamiento dependa del formato de plantilla de chat, que no se especifica en la model card.
- Cuantizaciones agresivas: Q2_K y Q3_K_S degradan la calidad de forma notable segun la grafica de perplejidad referenciada por el propio autor. Para uso real se recomienda Q4_K_M o superior.
- Estado del repositorio: cero descargas y cero "likes" en el momento de la consulta, lo que implica ausencia de validacion por parte de la comunidad.
- Licencia: Apache-2.0 permite uso comercial y modificacion, pero el usuario debe verificar que el modelo base kambleaa007/Self-Healing-LLM mantiene esa misma licencia y no impone restricciones adicionales.
- Fecha de publicacion del repositorio inusualmente avanzada (2026-09-24) segun los metadatos de HuggingFace; conviene confirmar la vigencia y autenticidad del repositorio.
- Los resultados de la busqueda web realizada no contienen informacion tecnica sobre el modelo (los enlaces devueltos son irrelevantes y no guardan relacion con el proyecto), por lo que no se han podido contrastar las afirmaciones del autor.

## Enlaces

- Repositorio de cuantizaciones GGUF: https://huggingface.co/mradermacher/Self-Healing-LLM-GGUF
- Modelo base: https://huggingface.co/kambleaa007/Self-Healing-LLM
- Pagina de resumen y descargas del autor: https://hf.tst.eu/model#Self-Healing-LLM-GGUF
- Solicitudes de cuantizacion de mradermacher: https://huggingface.co/mradermacher/model_requests
- Guia general de uso de archivos GGUF (README de TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafica comparativa de perplejidad por tipo de cuantizacion (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre cuantizaciones: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- nethype GmbH: https://www.nethype.de/
