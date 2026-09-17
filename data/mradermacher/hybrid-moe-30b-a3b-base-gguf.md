# mradermacher/hybrid-moe-30b-a3b-base-GGUF

## Resumen

Este repositorio no contiene un modelo original, sino un conjunto de cuantizaciones estáticas en formato GGUF generadas por mradermacher a partir de `geodesic-research/hybrid-moe-30b-a3b-base`. Es decir, el artefacto publicado aquí es el resultado de convertir los pesos originales (indicado en los metadatos internos como `convert_type: hf`) a distintos niveles de compresión para su uso en motores de inferencia compatibles con GGUF, como llama.cpp, Ollama o LM Studio.

El nombre del repositorio base sugiere una arquitectura híbrida con mezcla de expertos (MoE), con un total de parámetros cercano a los 30 000 millones y del orden de 3000 millones de parámetros activos por token (convención habitual del sufijo "a3b"). Se trata de una inferencia a partir de la nomenclatura: la model card no confirma ni la arquitectura, ni el número exacto de parámetros, ni la longitud de contexto. El sufijo "base" apunta, también de forma no confirmada, a un modelo preentrenado sin ajuste por instrucciones.

La relevancia práctica de este repositorio es que ofrece hasta doce niveles de cuantización (desde f16 hasta Q2_K, incluida IQ4_XS), lo que permite desplegar el modelo en hardware muy distinto, desde GPUs de consumo hasta aceleradores de centro de datos. Como contrapartida, el repositorio no declara licencia, no tiene descargas ni valoraciones registradas en el momento de la consulta y no incluye documentación sobre datos de entrenamiento, idiomas o evaluación, por lo que cualquier uso en producción exige verificar primero la licencia del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible en la model card; el nombre del repositorio base indica "hybrid-moe" (hibrida con mezcla de expertos), sin detalle confirmado |
| Parametros totales | no disponible; la nomenclatura sugiere ~30B, sin confirmar |
| Parametros activos | no disponible; el sufijo "a3b" sugiere ~3B activos por token, sin confirmar |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | x-f16, Q8_0, Q6_K, Q5_K_M, Q5_K_S, Q4_K_M, Q4_K_S, Q3_K_L, Q3_K_M, Q3_K_S, Q2_K, IQ4_XS |
| Idiomas soportados | no disponible |
| Licencia | no disponible (el repositorio no la declara; depende del modelo base) |
| Formato de pesos | GGUF (cuantizaciones estaticas); metadatos: quantize_version 2, output_tensor_quantised 1, convert_type hf |

## Arquitectura y entrenamiento

No se dispone de información sobre la arquitectura interna del modelo base `geodesic-research/hybrid-moe-30b-a3b-base`. El nombre apunta a un diseño híbrido con mezcla de expertos, una familia que combina capas de atención con mecanismos alternativos (lineales, recurrentes o selectivos) y que sustituye las capas densas de feed-forward por un enrutador que activa solo un subconjunto de expertos por token. Si se confirma esa lectura, el modelo tendría un coste de cómputo por token propio de un modelo de ~3B de parámetros activos, aunque requiriese memoria suficiente para alojar el total de ~30B. Ninguno de estos extremos está verificado en la información disponible.

Sobre el entrenamiento no hay ningún dato: ni número de tokens, ni composición del dataset, ni si hubo fases de RLHF, DPO o ajuste por instrucciones. El único elemento técnico documentado son los metadatos de la conversión a GGUF, que indican cuantización de versión 2 y cuantización del tensor de salida (`output_tensor_quantised: 1`), un ajuste que en la práctica reduce algo más el tamaño del archivo a costa de cierto impacto en la calidad de la capa de salida. Al tratarse de cuantizaciones estáticas, cada archivo se generó con una configuración fija de cuantización, no con cuantización dinámica en tiempo de carga.

## Capacidades

La model card no documenta ninguna capacidad de forma explícita. Lo que puede afirmarse con la información disponible es lo siguiente:

- Generación de texto: es un modelo de lenguaje entrenado para predicción de siguiente token; el funcionamiento concreto en tareas de razonamiento, matemáticas o código no está documentado.
- Modelo base: el sufijo "base" sugiere que no ha pasado por ajuste por instrucciones, por lo que no cabe esperar un comportamiento de chat alineado ni seguimiento fiable de instrucciones complejas sin un ajuste posterior.
- Tool calling / function calling: no disponible y poco probable en un modelo base sin ajuste específico.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponibles; no se declara ningún idioma.
- Capacidades especiales (modo thinking, visión, audio): no disponibles.
- Inferencia local: la única capacidad confirmada es la compatibilidad con motores que cargan GGUF, incluidos los formatos de cuantización K-quant e IQ4_XS.

Cualquier afirmación adicional sobre capacidades requeriría consultar la model card del modelo base, que no forma parte de la información proporcionada.

## Casos de uso

- Punto de partida para ajuste fino (fine-tuning) supervisado o con LoRA: un modelo base sin alineación es un sustrato habitual para adaptar a dominio propio; conviene partir del f16 o de Q8_0 si se va a reentrenar, y de un GGUF solo si el pipeline de ajuste admite pesos cuantizados.
- Investigación sobre arquitecturas híbridas MoE: el repositorio permite comparar en igualdad de condiciones, con la misma base, el efecto de doce niveles de cuantización distintos sobre la perplejidad y la calidad de generación.
- Inferencia local en equipos de gama alta: con las cuantizaciones Q4_K_M o Q5_K_M el modelo puede ejecutarse en una GPU de consumo con 24 GB o en configuraciones con offload parcial a CPU, siempre que el tamaño real de los archivos lo permita.
- Generación de datos sintéticos para preentrenamiento: un modelo base de gran tamaño puede emplearse para producir corpus de texto a escala en pipelines offline, sin requisitos de latencia interactiva.
- Evaluación comparativa de cuantizaciones en producción: medir la degradación entre Q8_0, Q6_K y Q4_K_M sobre un conjunto de validación propio para decidir qué nivel usar según coste de memoria y calidad aceptable.
- Despliegue en nodos con memoria limitada: IQ4_XS y Q3_K_M permiten cargar el modelo en GPUs de 16-24 GB o en servidores con CPU y RAM abundante, a costa de una pérdida de calidad no cuantificada en esta ficha.
- Servicio de autocompletado o continuación de texto sin instrucciones: al ser un modelo base, encaja en tareas de continuación de contexto (redacción asistida, autocompletado de documentos técnicos) más que en diálogo con turnos.

Todos estos casos asumen que la licencia del modelo base permita el uso previsto; ese extremo no está resuelto en el repositorio.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

Las cifras de esta sección son estimaciones orientativas derivadas del supuesto, no confirmado, de ~30B de parámetros totales y ~3B activos. Deben verificarse contra el tamaño real de los archivos del repositorio, que es el dato fiable para planificar memoria.

- VRAM para inferencia: al ser una MoE, todos los expertos deben estar en memoria, por lo que el consumo se aproxima al de un modelo denso del mismo tamaño total, no al de uno de 3B. Como referencia de orden de magnitud: f16 ~60 GB, Q8_0 ~32 GB, Q6_K ~25 GB, Q5_K_M ~21 GB, Q4_K_M ~18 GB, Q3_K_M ~15 GB, Q2_K ~11 GB, IQ4_XS ~16-17 GB. Añadir entre 1 y 4 GB según la longitud de contexto configurada en la caché KV.
- GPU recomendadas: para f16 y Q8_0, A100 80 GB, H100 80 GB o varias GPU de 24-48 GB en tensor paralelo; para Q4_K_M y superiores, una RTX 4090, RTX 3090, L40S o A6000 de 24-48 GB suele ser suficiente.
- GPU de consumo: Q4_K_M, Q4_K_S, Q3_K_M, Q3_K_S y Q2_K caben con holgura decreciente en tarjetas de 24 GB; IQ4_XS y Q3_K_L quedan al límite. Con 16 GB solo resultan viables Q2_K o configuraciones con offload parcial de capas a CPU.
- Opciones de despliegue: llama.cpp (CLI y servidor), Ollama, LM Studio, llama-cpp-python y cualquier runtime con soporte GGUF; vLLM y TGI solo son aplicables si se trabaja con los pesos originales en safetensors, no con estos archivos.
- Latencia y throughput: no disponible. En una MoE con ~3B activos, el coste por token es bajo en cómputo, pero el ancho de banda de memoria para leer expertos dispersos suele ser el cuello de botella real; no hay mediciones publicadas en este repositorio.
- Consideración práctica: con offload a CPU la calidad no cambia, pero la latencia depende críticamente de la RAM disponible y del ancho de banda del bus; se recomienda almacenar todos los expertos en memoria y no en disco.

## Comparativa con modelos similares

La identidad del modelo base no está confirmada, por lo que la comparación se hace por categoría (MoE de ~30B totales con pocos parámetros activos) y no por equivalencia funcional. Las cifras de los modelos de referencia provienen de información pública general y no se han verificado contra este repositorio.

| Modelo | Parametros totales | Parametros activos | Contexto | Licencia | Formato disponible |
|---|---|---|---|---|---|
| mradermacher/hybrid-moe-30b-a3b-base-GGUF | no disponible (~30B segun nomenclatura) | no disponible (~3B segun nomenclatura) | no disponible | no disponible | GGUF (12 cuantizaciones) |
| Qwen3-30B-A3B | ~30,5B | ~3,3B | 128K (segun version) | Apache 2.0 | safetensors y GGUF |
| Mixtral 8x7B | ~46,7B | ~12,9B | 32K | Apache 2.0 | safetensors y GGUF |
| DeepSeek-V2-Lite | ~15,7B | ~2,4B | 32K | licencia propia de DeepSeek | safetensors y GGUF |

Frente a Qwen3-30B-A3B, el principal diferencial explotable de este repositorio es la variedad de cuantizaciones disponibles; el rendimiento relativo no puede compararse sin benchmarks. Frente a Mixtral 8x7B, el supuesto menor número de parámetros activos reduciría el coste de cómputo por token. Frente a DeepSeek-V2-Lite, el tamaño total sería aproximadamente el doble.

## Limitaciones y advertencias

- Licencia no declarada: el repositorio no especifica licencia, de modo que no puede acreditarse permiso de uso comercial ni de redistribución sin consultar la licencia del modelo base de geodesic-research.
- Trazabilidad limitada: no hay model card sustantiva, ni ficha de datos, ni resultados de evaluación; la información de arquitectura y tamaño es una inferencia a partir del nombre.
- Riesgo de alucinación: no cuantificado. Los modelos base sin alineación suelen producir continuaciones plausibles pero no verificadas y no calibran su incertidumbre.
- Sesgos: no documentados. Al no detallarse la composición del corpus de entrenamiento, no puede evaluarse el sesgo por idioma, género, origen o dominio.
- Idiomas: no se declara ninguno; el soporte multilingüe es desconocido y no debe asumirse.
- Contexto: la longitud de contexto es desconocida, por lo que no debe configurarse una ventana mayor que la del modelo base, ya que degradaría la calidad de forma silenciosa.
- Impacto de la cuantización: las variantes por debajo de Q4 (Q3_K_S, Q2_K) y, en menor medida, IQ4_XS, introducen pérdida de precisión no medida. Para uso en producción conviene validar con un conjunto propio antes de adoptarlas.
- Ausencia de señales de comunidad: cero descargas y cero valoraciones en el momento de la consulta implican que el artefacto no ha sido validado por terceros; se recomienda verificar la integridad de los archivos antes de desplegarlos.
- Fechas del repositorio: la metadata indica creación y actualización el 17 de septiembre de 2026, dato que conviene contrastar con la fecha real de publicación.
- Uso en producción: al carecer de ajuste por instrucciones (presunción basada en el sufijo "base"), no está preparado para exponerse directamente a usuarios finales en un chat sin una capa de alineación adicional.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/mradermacher/hybrid-moe-30b-a3b-base-GGUF
- Modelo base indicado en la model card: https://huggingface.co/geodesic-research/hybrid-moe-30b-a3b-base
- Perfil del autor de las cuantizaciones: https://huggingface.co/mradermacher
- Motor de inferencia compatible con GGUF (llama.cpp): https://github.com/ggml-org/llama.cpp
- No se han encontrado en la busqueda web papers, blogs, repositorios ni demos adicionales asociados a este modelo; los resultados obtenidos no guardan relacion con el mismo.
