# LMLiutenant/Qwen3.8-Flash-Next-Uncensored-oQ5e-mtp

## Resumen

Qwen3.8-Flash-Next-Uncensored-oQ5e-mtp es una cuantizacion del modelo abliterado `orcarouter/Qwen3.8-Flash-Next-Uncensored`, publicada por el usuario LMLiutenant. Se trata de una build nativa de oMLX en formato oQ5e (aproximadamente 5 bits, con asignacion de precision mixta guiada por un modelo de sensibilidad) que conserva la torre de vision, la cabeza MTP (multi-token prediction) y la configuracion nativa de 262.144 tokens de contexto. El modelo subyacente es un MoE disperso con unos 125.000 millones de parametros en el LM, unos 6.000 millones activados por token, unos 51.000 millones en el componente de embeddings N-gram/PLE y unos 4.000 millones en la cabeza MTP.

El problema que resuelve es de despliegue: empaquetar un modelo de ~180.000 millones de parametros totales en un unico Mac de 128 GB de memoria unificada, algo posible gracias al offload del componente N-gram a SSD. El autor reporta picos de asignacion de ~88 GB a 4K de contexto y ~92 GB a 128K en un MacBook Pro con M4 Max y 128 GB, midiendo el allocator de MLX, no la memoria total del sistema.

La relevancia del modelo es doble: por un lado, es una pieza de infraestructura para ejecutar localmente un modelo de gran tamano con vision y tool calling en hardware de consumo de gama alta; por otro, es una variante abliterated, es decir, con la direccion de rechazo eliminada de los pesos, sin guardrails anadidos. El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y la model card advierte explicitamente de que los datos de rendimiento proceden de pruebas locales del autor, no de una suite academica estandarizada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE disperso con componente N-gram/PLE y cabeza MTP; 48 capas, 512 expertos, 10 expertos enrutados + 1 compartido activados |
| Parametros totales | 179.999.981.459 (~180B), segun safetensors; desglose del autor: ~125B LM + ~51B embeddings N-gram + ~4B MTP |
| Parametros activos | ~6B por token (LM); el componente N-gram no permanece residente en memoria con SSD N-gram Offload |
| Longitud de contexto | 262.144 tokens (ajuste nativo de arquitectura conservado en la cuantizacion) |
| Tipos de cuantizacion | oQ5e (grupo nominal 64, modo enhanced/imatrix, dtype no cuantizado BF16); build hermana oQ6e (~6,9 bpw); referencia oQ4e de 100K |
| Idiomas soportados | no disponible |
| Licencia | qwen-community-1.0 (Qwen Community License 1.0); discrepancia documentada: la model card del modelo fuente se etiqueta como Apache-2.0, lo que no coincide con el fichero LICENSE que distribuye |
| Formato de pesos | safetensors compatible con mlx-lm (libreria mlx); no se publican pesos GGUF |
| Vision | Si, torre de vision preservada en la cuantizacion (pipeline image-text-to-text) |
| Cabeza MTP | Si, preservada (Lightning MTP) |
| Tamano del repositorio | 128,6 GB |
| Cuantizador | oMLX 0.6.4 |
| Modelo base | orcarouter/Qwen3.8-Flash-Next-Uncensored (BF16, abliterado) |

## Arquitectura y entrenamiento

La informacion disponible no describe el proceso de entrenamiento del modelo original: no se indican numero de tokens, composicion del dataset, ni si hubo RLHF, DPO u otra fase de alineamiento. Lo que si se detalla es la arquitectura resultante: un MoE disperso de 48 capas con 512 expertos, de los cuales se activan 10 enrutados mas 1 compartido (~6B de parametros activos sobre ~125B en el LM). A esto se suman dos componentes poco habituales: un bloque N-gram/PLE de ~51B de parametros, que el autor describe como muy grande y que se beneficia del offload a SSD, y una cabeza MTP de ~4B que habilita decodificacion multi-token (Lightning MTP en oMLX).

La innovacion relevante de este repositorio concreto es la cuantizacion, no el entrenamiento. oQ5e se aplico directamente sobre los pesos BF16 abliterados con oMLX 0.6.4, con grupo nominal de 64, modo enhanced/imatrix y asignacion de precision mixta guiada por `jedisct1/Qwen3.8-Flash-Next-Uncensored-oQ4e-100K-MTP`, elegido por compartir linaje abliterado con el modelo fuente. El autor aclara que el modelo de sensibilidad solo guia la asignacion de bits y que sus pesos cuantizados no son el origen de esta build. Se preservan explicitamente la torre de vision y la cabeza MTP, algo que no siempre ocurre en cuantizaciones agresivas. La abliteracion, esto es, la eliminacion de la direccion de rechazo, se realizo en el modelo fuente; para el metodo concreto, los detalles de la direccion de rechazo y las notas de consistencia MTP, el repositorio remite a la model card de origen.

## Capacidades

- Generacion de texto y razonamiento conversacional multi-turno, con ventana nativa de 262.144 tokens.
- Procesamiento de imagen y texto de forma conjunta (pipeline image-text-to-text), con la torre de vision preservada tras la cuantizacion.
- Tool calling / function calling, etiquetado explicitamente en el repositorio y usado como criterio para las recomendaciones de despliegue.
- Decodificacion especulativa mediante la cabeza MTP (Lightning MTP), activable en oMLX para chat y razonamiento.
- Modo de razonamiento conmutable: el autor reporta resultados de benchmark con "thinking OFF", lo que implica la existencia de un modo de razonamiento activable.
- Conocimiento general amplio y razonamiento de nivel medio-alto segun los MMLU y MMLU-Pro medidos por el autor.
- Generacion de codigo (HumanEval) y matematicas (GSM8K) con resultados cercanos al techo en las pruebas locales de n=100.
- Comportamiento sin rechazos: al estar abliterado, intenta la mayoria de peticiones sin las negativas de seguridad de la version oficial de Qwen.
- Capacidades multilingues: no disponible (no se declaran idiomas soportados).

## Casos de uso

- Asistente local sobre documentacion extensa: con 262.144 tokens de contexto nativo se pueden cargar contratos, expedientes o bases de conocimiento completas en una sola ventana, sin fragmentar en RAG y sin enviar datos a un tercero. El pico de memoria medido sube de ~88 GB a 4K a ~92 GB a 128K, por lo que sigue cabiendo en un Mac de 128 GB.
- Agente de codigo en local con tool calling: el modelo puede invocar funciones para leer ficheros, ejecutar tests o consultar una API dentro de un pipeline de CI/CD, con la salvedad de mantener oMLX en 0.6.4 o una version sin el bug de llamadas a herramientas descrito mas abajo.
- Extraccion de datos a partir de capturas y documentos escaneados: la torre de vision permite pasar imagenes junto al texto de instrucciones y obtener salidas estructuradas, util para digitalizar formularios o tickets sin depender de un servicio externo.
- Investigacion sobre abliteracion y direcciones de rechazo: el repositorio forma parte de una serie (oQ4e, oQ5e, oQ6e) sobre el mismo linaje abliterado, lo que permite estudiar como la precision de cuantizacion afecta a las capacidades medidas y comparar contra la build base sin abliterar.
- Estudio comparativo de cuantizacion en MLX: la serie oQ4e/oQ5e/oQ6e con el mismo modelo base ofrece un caso controlado para medir el impacto del ancho de bits en MMLU y MMLU-Pro sobre hardware Apple Silicon.
- Atencion al cliente o soporte tecnico interno en despliegue on-premise: el modelo puede gestionar conversaciones multi-turno con historial largo y documentacion adjunta, manteniendo los datos dentro de la infraestructura de la organizacion, algo relevante para cumplimiento del RGPD.
- Generacion de contenido creativo sin filtros editoriales: ficcion, guiones o textos de tono adulto donde el rechazo del modelo base resulta un obstaculo, asumiendo el usuario la responsabilidad legal y etica del contenido producido.
- Clasificacion y resumen de grandes volumenes de texto: con contexto largo y una sola instancia local se pueden procesar lotes de informes o transcripciones sin coste por token de API.

## Benchmarks y rendimiento

Los datos son pruebas locales del autor realizadas en oMLX 0.7.0.dev2, con thinking desactivado y limitadas por tiempo de computo, no una suite academica estandarizada.

| Benchmark | Muestras | oQ5e (este repo) | oQ6e | oQ4e (linaje abliterado) | oQ5e base (sin abliterar) |
|---|---|---|---|---|---|
| MMLU | 2000 | 88,0% | 88,2% | 87,2% | 88,1% |
| MMLU-Pro | 1000 | 70,4% | 73,4% | 64,4% | 69,2% |

El autor senala que en MMLU con 2000 muestras los cuatro builds quedan planos en torno al 88%, dentro del ruido de muestreo, por lo que la abliteracion no parece degradar el conocimiento general medido. En MMLU-Pro la precision escala con el ancho de bits a lo largo de la serie oQ4e/oQ5e/oQ6e. Las ejecuciones de GSM8K y HumanEval con n=100 quedaron cerca del techo (90-98%) en todos los builds y el autor las omite por no ser discriminantes. No se han publicado resultados de benchmarks estandarizados independientes en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no aplica en el sentido tradicional; el modelo esta pensado para memoria unificada de Apple Silicon. Requiere un Mac con 128 GB. Pico de asignacion del allocator de MLX con SSD N-gram Offload activado: ~88 GB a 4K de contexto y ~92 GB a 128K. Son picos a nivel de proceso, no memoria total del sistema.
- Almacenamiento: 128,6 GB de repositorio, mas el espacio adicional necesario para el offload del componente N-gram a SSD. El autor recomienda SSD N-gram Offload activado, ya que el bloque N-gram/PLE no permanece residente en memoria.
- GPU recomendadas: la model card solo documenta pruebas en Apple M4 Max de 128 GB (MacBook Pro). No hay datos de otros SoC ni de GPUs NVIDIA o AMD.
- Cabe en GPU de consumo: no se documenta soporte CUDA; los pesos son safetensors de MLX y el runtime es MLX/oMLX, por lo que no se plantea su ejecucion en una RTX 4090 o similar. Tampoco cabe en Macs de 64 GB o menos segun los picos de memoria reportados.
- Opciones de despliegue: oMLX (API compatible con OpenAI), con las opciones recomendadas SSD N-gram Offload ON y Lightning MTP ON para chat/razonamiento y OFF para agentes de codigo. Los pesos son safetensors compatibles con mlx-lm y, segun el autor, deberian cargar en mlx-lm y otras aplicaciones MLX, aunque esto no se ha probado.
- Latencia y throughput: no disponible. No se publican tokens por segundo ni tiempos de primera respuesta.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | MMLU | MMLU-Pro | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Qwen3.8-Flash-Next-Uncensored-oQ5e-mtp (este repo) | ~180B totales, ~6B activos | 262.144 | 88,0% | 70,4% | qwen-community-1.0 | MLX, 128,6 GB, 0 descargas |
| LMLiutenant/Qwen3.8-Flash-Next-Uncensored-oQ6e-mtp | mismo modelo base, ~6,9 bpw | 262.144 | 88,2% | 73,4% | qwen-community-1.0 | MLX, build hermana de mayor precision |
| jedisct1/Qwen3.8-Flash-Next-Uncensored-oQ4e-100K-MTP | mismo modelo base, ~4 bpw, ventana reducida a 100K | 100K | 87,2% | 64,4% | qwen-community-1.0 | MLX |
| GBP-DE/Qwen3.8-Flash-Next-oQ5e-mtp | mismo modelo base sin abliterar, oQ5e | 262.144 (no confirmado) | 88,1% | 69,2% | qwen-community-1.0 | MLX |

No se dispone de comparaciones con modelos de otra familia o de otro proveedor dentro de la informacion proporcionada. Las alternativas listadas son builds del mismo modelo base, lo que permite aislar el efecto del ancho de bits y de la abliteracion, pero no comparar contra arquitecturas distintas.

## Limitaciones y advertencias

- Modelo abliterated sin guardrails: los pesos han perdido la direccion de rechazo, por lo que intentara la mayoria de peticiones sin las negativas de seguridad de la version oficial. El autor advierte de que no debe exponerse a entradas no confiables en un entorno agentico sin salvaguardas propias, ya que no opondra resistencia a instrucciones inyectadas.
- Riesgo de alucinacion no medido: no se han publicado evaluaciones de fidelidad, veracidad ni tasas de alucinacion. Los unicos datos disponibles son MMLU, MMLU-Pro y ejecuciones de n=100 en GSM8K y HumanEval.
- Benchmarks no estandarizados: las cifras proceden de pruebas locales del autor en una version de desarrollo de oMLX (0.7.0.dev2), con thinking desactivado y limitadas por tiempo de computo. No han sido replicadas de forma independiente.
- Bug conocido del motor: en oMLX 0.7.0.dev1 y dev2 existe un fallo que puede descartar silenciosamente llamadas a herramientas con nombres de funcion no registrados en la ruta de streaming (issue jundot/omlx#3660, abierto a fecha de 2026-09). Afecta al motor, no a los pesos, y no esta presente en 0.6.4.
- Discrepancia de licencia: la model card del modelo fuente se etiqueta como Apache-2.0, mientras que el fichero LICENSE que distribuye corresponde a Qwen Community License 1.0. El autor de la cuantizacion recomienda revisarlo antes de cualquier uso o redistribucion. Hay que verificar las condiciones de uso comercial de esa licencia antes de desplegar en produccion.
- Idiomas no declarados: el repositorio no especifica idiomas soportados, por lo que no hay garantia de cobertura multilingue ni de calidad fuera del ingles.
- Dependencia de hardware concreto: el despliegue esta atado a Apple Silicon con 128 GB de memoria unificada y a MLX/oMLX. No hay ruta documentada para CUDA, llama.cpp, vLLM, TGI u Ollama, ni pesos GGUF publicados.
- Madurez nula: 0 descargas y 0 likes, creado el 2026-09-18 y actualizado el mismo dia. No hay validacion de terceros ni historial de mantenimiento.
- Restricciones de contexto: aunque la arquitectura soporta 262.144 tokens, el consumo de memoria y de cache KV crece con la longitud de contexto; el pico medido a 128K ya es de ~92 GB sobre 128 GB totales.
- Responsabilidad legal: al no aplicar rechazos, el cumplimiento normativo y la moderacion del contenido generado recaen enteramente en quien despliega el modelo.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/LMLiutenant/Qwen3.8-Flash-Next-Uncensored-oQ5e-mtp
- Modelo base abliterado: https://huggingface.co/orcarouter/Qwen3.8-Flash-Next-Uncensored
- Modelo oficial de Qwen: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- Build hermana oQ6e: https://huggingface.co/LMLiutenant/Qwen3.8-Flash-Next-Uncensored-oQ6e-mtp
- Modelo de sensibilidad oQ4e 100K: https://huggingface.co/jedisct1/Qwen3.8-Flash-Next-Uncensored-oQ4e-100K-MTP
- Build base sin abliterar usada en la comparativa: https://huggingface.co/GBP-DE/Qwen3.8-Flash-Next-oQ5e-mtp
- Issue del motor oMLX sobre perdida de tool calls: https://github.com/jundot/omlx/issues/3660
- Papers, blogs tecnicos o demos: no disponible. La busqueda web realizada no devolvio resultados relevantes sobre este modelo.
