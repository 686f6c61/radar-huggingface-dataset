# mradermacher/Qwen2.5-Coder-1.5B-Instruct-heretic-i1-GGUF

## Resumen

Qwen2.5-Coder-1.5B-Instruct-heretic-i1-GGUF es un repositorio de cuantizaciones en formato GGUF publicado por el usuario mradermacher a partir del modelo saidutta69/Qwen2.5-Coder-1.5B-Instruct-heretic, que a su vez deriva del Qwen2.5-Coder-1.5B-Instruct de Alibaba Qwen. No se trata por tanto de un modelo entrenado desde cero, sino de una distribucion de pesos cuantizados: el repositorio contiene 25 variantes (desde i1-IQ1_S hasta i1-Q6_K) generadas con el metodo imatrix, que emplea una matriz de importancia calculada sobre datos de calibracion para preservar mejor la calidad en tasas de compresion agresivas.

El modelo subyacente tiene 1.543.714.304 parametros (aproximadamente 1,5 mil millones), esta especializado en generacion y asistencia de codigo y ha sido sometido a un proceso de "abliteracion" o desinhibicion, como indican las etiquetas heretic, uncensored, decensored y abliterated. Esto significa que se ha eliminado total o parcialmente el comportamiento de rechazo del modelo original, lo que amplia su rango de respuesta pero traslada al usuario toda la responsabilidad sobre el contenido generado.

Su relevancia practica es doble. Por un lado, el tamano de 0,5 a 1,2 GB de los ficheros permite ejecutar un modelo de codigo con capacidades conversacionales en hardware muy modesto: CPU, portatiles sin GPU dedicada o GPUs de gama de entrada con 4 GB de VRAM. Por otro, las cuantizaciones imatrix de baja tasa (IQ1, IQ2) hacen viable el despliegue en escenarios de recursos muy limitados, a costa de una perdida de calidad que no esta cuantificada en la informacion disponible. El repositorio se publico el 11 de septiembre de 2026, ocupa 19,1 GB en total y se distribuye bajo licencia Apache-2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (arquitectura heredada del modelo base Qwen2.5-Coder-1.5B-Instruct; la cuantizacion no altera la topologia) |
| Parametros totales | 1.543.714.304 (~1,5 B) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (la model card del repositorio de cuantizacion no la declara) |
| Tipos de cuantizacion | imatrix: i1-IQ1_S, i1-IQ1_M, i1-IQ2_XXS, i1-IQ2_XS, i1-IQ2_S, i1-IQ2_M, i1-Q2_K_S, i1-IQ3_XXS, i1-Q2_K, i1-IQ3_XS, i1-Q3_K_S, i1-IQ3_S, i1-IQ3_M, i1-Q3_K_M, i1-Q3_K_L, i1-IQ4_XS, i1-IQ4_NL, i1-Q4_0, i1-Q4_K_S, i1-Q4_K_M, i1-Q4_1, i1-Q5_K_S y siguientes hasta Q6_K; se incluye ademas el fichero .imatrix.gguf para generar cuantizaciones propias |
| Idiomas soportados | en (unico idioma declarado en la model card) |
| Licencia | apache-2.0 (enlaza a la licencia de Qwen/Qwen2.5-Coder-1.5B-Instruct) |
| Formato de pesos | GGUF (ficheros .gguf); el repositorio tambien incluye el fichero imatrix. Existe una version con cuantizaciones estaticas en mradermacher/Qwen2.5-Coder-1.5B-Instruct-heretic-GGUF |
| Tamano total del repositorio | 19,1 GB (suma de todas las cuantizaciones) |
| Fecha de publicacion | 11 de septiembre de 2026 (ultima actualizacion el mismo dia) |
| Descargas / likes | 0 / 0 en el momento de la consulta |

## Arquitectura y entrenamiento

La model card de este repositorio no aporta informacion sobre el entrenamiento: no indica numero de tokens, composicion del dataset, ni si hubo fases de RLHF, DPO u otra optimizacion por preferencias. El repositorio es exclusivamente un artefacto de cuantizacion; la unica operacion tecnica documentada es la generacion de cuantizaciones ponderadas con imatrix (se anaden en los comentarios internos los campos quantize_version: 2, output_tensor_quantised: 1 y convert_type: hf), a partir de los pesos del modelo saidutta69/Qwen2.5-Coder-1.5B-Instruct-heretic.

Por las etiquetas declaradas (heretic, abliterated, uncensored, decensored) se infiere que el modelo base paso por un proceso de ablacion de la direccion de rechazo en el espacio de activaciones, un procedimiento habitual para eliminar respuestas de negativa sin reentrenar los pesos. La model card no describe la metodologia concreta, los datos de calibracion usados ni el grado de degradacion introducido, por lo que cualquier afirmacion sobre la preservacion de capacidades tras la desinhibicion queda fuera de lo verificable con la informacion disponible. Tampoco se documenta ninguna innovacion adicional (atencion lineal, decodificacion especulativa o similar).

## Capacidades

- Generacion y asistencia de codigo: el modelo base pertenece a la familia Qwen2.5-Coder y esta etiquetado como code y coding, por lo que su uso previsto es la escritura, explicacion y modificacion de fragmentos de codigo.
- Conversacion multi-turno: etiquetado como chat y conversational, admite dialogos encadenados con historial.
- Escritura creativa y roleplay: las etiquetas roleplay y uncensored indican que el modelo no aplica negativas ante peticiones que el modelo original rechazaria.
- Ejecucion local en hardware de consumo: las etiquetas local-llm y consumer-gpu apuntan a despliegue en equipos de gama baja, con cuantizaciones de 0,5 GB en adelante.
- Tool calling / function calling: no documentado en la informacion proporcionada.
- Comportamiento de agente y razonamiento multi-paso: no documentado en la informacion proporcionada.
- Capacidades multilingues: no documentadas; la model card declara unicamente ingles (en), aunque no se especifica si es una limitacion real o simplemente el idioma de los datos de calibracion.
- Capacidades especiales (modo thinking, vision, audio): no disponibles; no se declara ninguna.

## Casos de uso

- Autocompletado y asistencia de codigo en local: con cuantizaciones de 1,0-1,2 GB (i1-Q4_K_M, i1-Q5_K_S) el modelo puede ejecutarse en el propio equipo del desarrollador y ofrecer sugerencias de codigo sin enviar el codigo fuente a servicios externos, lo que resulta adecuado para entornos con requisitos de confidencialidad.
- Despliegue en equipos sin GPU dedicada: las variantes i1-IQ1_S (0,5 GB) e i1-IQ2_M (0,7 GB) permiten cargar el modelo integramente en RAM sobre CPU, un escenario realista para portatiles antiguos, mini-PC o contenedores con memoria limitada.
- Entornos air-gapped o CI/CD sin acceso a internet: al ser un fichero GGUF autocontenido y desplegable con llama.cpp o llama-cpp-python, puede integrarse en pipelines internos para generar borradores de tests, docstrings o mensajes de commit sin dependencias de red.
- Prototipado rapido de aplicaciones LLM: sirve como modelo de pruebas para validar prompts, plantillas de chat y flujos de recuperacion antes de migrar a un modelo mayor, con un coste de inferencia muy bajo.
- Generacion de tests unitarios y documentacion tecnica: el modelo puede producir esqueletos de pruebas, ejemplos de uso y comentarios de API a partir de fragmentos de codigo, tareas de formato corto que un modelo de 1,5 B puede abordar sin un contexto muy extenso.
- Traduccion entre lenguajes y refactorizacion de fragmentos: resulta util para reescribir funciones aisladas o adaptar fragmentos de un lenguaje a otro, siempre con revision humana, dado el tamano reducido del modelo.
- Generacion de scripts de automatizacion y consultas SQL: escenarios de un solo turno en los que se describen datos o tareas y se espera un script corto, un uso compatible con modelos pequenos.
- Escritura creativa sin filtros de rechazo: la variante abliterated responde a peticiones creativas que el modelo original rechazaria; es el caso de uso implicito de las etiquetas heretic y uncensored, y requiere asumir las advertencias de la seccion final.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

La model card del repositorio de cuantizacion no incluye ninguna tabla de evaluacion (MMLU, HumanEval, GSM8K ni equivalentes), ni tampoco comparativas de perplejidad entre las distintas cuantizaciones. Los resultados de la busqueda web realizada no contienen informacion relevante sobre el modelo.

## Requisitos de hardware

- VRAM estimada para inferencia, calculada a partir del tamano de cada fichero GGUF mas el espacio adicional para cache KV y buffers (estimacion, no medida publicada):

| Cuantizacion | Tamano de pesos | VRAM estimada |
|---|---|---|
| i1-IQ1_S | 0,5 GB | ~0,8-1,2 GB |
| i1-IQ2_M | 0,7 GB | ~1,0-1,5 GB |
| i1-IQ3_M | 0,9 GB | ~1,2-1,8 GB |
| i1-Q4_K_M | 1,1 GB | ~1,5-2,2 GB |
| i1-Q5_K_S | 1,2 GB | ~1,6-2,5 GB |
| i1-Q6_K | no disponible en el extracto consultado | no disponible |

- GPU recomendadas: cualquier GPU con 4 GB o mas de VRAM es suficiente para las cuantizaciones Q4 y superiores (GTX 1650, RTX 3050, RTX 4060, RTX 4090 sin aprovechamiento completo). Aceleradores de datacenter como A100 o H100 no aportan ventaja para un modelo de 1,5 B.
- Cabe en GPU de consumo: si, en practicamente todas las GPU dedicadas de los ultimos diez anos, e incluso en iGPU con memoria unificada suficiente. Las variantes IQ1/IQ2 permiten ejecucion en CPU con 2 GB de RAM libre.
- Opciones de despliegue: llama.cpp (llama-cli, llama-server), Ollama (mediante Modelfile con FROM sobre el fichero GGUF), LM Studio, koboldcpp, text-generation-webui y llama-cpp-python. vLLM solo ofrece soporte GGUF experimental y TGI no esta orientado a este formato; para despliegue en servidor con este repositorio lo natural es llama.cpp.
- Latencia y throughput estimados: no disponible. No se publican mediciones de tokens por segundo para ninguna de las cuantizaciones.

## Comparativa con modelos similares

| Modelo | Parametros | Formato | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| mradermacher/Qwen2.5-Coder-1.5B-Instruct-heretic-i1-GGUF (este) | 1,54 B | GGUF imatrix (25 variantes) | no disponible | Apache-2.0 | Publicado, 0 descargas |
| mradermacher/Qwen2.5-Coder-1.5B-Instruct-heretic-GGUF | 1,54 B | GGUF estatico | no disponible | Apache-2.0 | Publicado (mismo autor, sin imatrix) |
| saidutta69/Qwen2.5-Coder-1.5B-Instruct-heretic | 1,54 B | no disponible | no disponible | Apache-2.0 (heredada) | Modelo de origen de la cuantizacion |
| Qwen/Qwen2.5-Coder-1.5B-Instruct | 1,54 B | safetensors (original) | no disponible en esta ficha | Apache-2.0 | Version oficial sin desinhibir |

La diferencia principal entre las tres primeras filas no es de calidad de modelo sino de formato y metodo de cuantizacion: las variantes imatrix suelen conservar mejor la calidad a igual tamano de fichero que las estaticas, pero no hay ninguna medicion publicada en la informacion disponible que lo confirme para este caso. Frente a Qwen/Qwen2.5-Coder-1.5B-Instruct, la unica diferencia relevante es la ablacion de rechazos y el formato de distribucion.

## Limitaciones y advertencias

- Modelo desinhibido: al tratarse de una version abliterated/uncensored, no aplica los filtros de seguridad del modelo original. Puede generar contenido ofensivo, ilegal o peligroso si se le solicita, y el despliegue en productos de cara al publico exige moderacion externa.
- Riesgo de degradacion por ablacion: el proceso de eliminacion de la direccion de rechazo puede alterar el comportamiento general del modelo. No se publican evaluaciones que cuantifiquen esa posible perdida de calidad.
- Alucinacion: con 1,5 B de parametros y sin datos de evaluacion, la tasa de invencion de APIs, funciones y referencias de codigo es previsiblemente alta. Todo el codigo generado debe pasar revision y pruebas antes de llegar a produccion.
- Limitaciones de idioma: la model card declara unicamente ingles. El comportamiento en castellano no esta documentado ni garantizado.
- Longitud de contexto no declarada: se desconoce la ventana efectiva soportada por esta distribucion, lo que desaconseja su uso en tareas que dependan de documentos largos sin verificacion previa.
- Restricciones de licencia: Apache-2.0 permite uso comercial y modificacion con atribucion, pero cada cuantizacion del repositorio incluye el enlace a la licencia del modelo base de Qwen. Conviene revisar tambien los terminos del modelo intermedio saidutta69/Qwen2.5-Coder-1.5B-Instruct-heretic.
- Cuantizaciones extremas: las variantes por debajo de Q3 (IQ1, IQ2, Q2_K) degradan notablemente la calidad segun la propia model card, que las describe como "for the desperate" o "very low quality". No son aptas para tareas de codigo que requieran precision.
- Adopcion nula: el repositorio registra 0 descargas y 0 likes, por lo que no existe validacion de la comunidad sobre su comportamiento real.
- Sin soporte de despliegue en servidores de alto rendimiento: al ser GGUF, no se beneficia de optimizaciones tipo vLLM o TGI, lo que limita su uso en escenarios de alta concurrencia.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/mradermacher/Qwen2.5-Coder-1.5B-Instruct-heretic-i1-GGUF
- Modelo de origen de la cuantizacion: https://huggingface.co/saidutta69/Qwen2.5-Coder-1.5B-Instruct-heretic
- Cuantizaciones estaticas del mismo modelo: https://huggingface.co/mradermacher/Qwen2.5-Coder-1.5B-Instruct-heretic-GGUF
- Pagina de descarga resumida del autor: https://hf.tst.eu/model#Qwen2.5-Coder-1.5B-Instruct-heretic-i1-GGUF
- Fichero imatrix: https://huggingface.co/mradermacher/Qwen2.5-Coder-1.5B-Instruct-heretic-i1-GGUF/resolve/main/Qwen2.5-Coder-1.5B-Instruct-heretic.imatrix.gguf
- Licencia del modelo base: https://huggingface.co/Qwen/Qwen2.5-Coder-1.5B-Instruct/blob/main/LICENSE
- Guia de uso de ficheros GGUF referenciada por el autor: https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF

Nota: la busqueda web realizada no devolvio ningun resultado relevante sobre este modelo; los enlaces encontrados correspondian a contenidos sin relacion.
