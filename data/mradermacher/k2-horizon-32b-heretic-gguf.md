# mradermacher/K2-Horizon-32B-heretic-GGUF

## Resumen

K2-Horizon-32B-heretic-GGUF es la version cuantizada en formato GGUF del modelo soyaakinohara/K2-Horizon-32B-heretic, un fine-tune "heretic" (abliterated, con los mecanismos de rechazo eliminados) del checkpoint denso IFM/K2-Horizon-32B desarrollado por IFM. Se trata de un transformer decoder-only denso de 34.779.304.960 parametros reales (etiquetado comercialmente como 32B), con una ventana de contexto nativa de 512K tokens y pesos publicados bajo licencia Apache 2.0. La cuantizacion la firma mradermacher, un actor consolidado en la distribucion de GGUF para llama.cpp y derivados.

La relevancia de esta ficha es doble. Por un lado, K2-Horizon forma parte del lanzamiento que IFM presento como el mayor despliegue de modelos totalmente abiertos hasta la fecha, con seis variantes de escala y acceso abierto a codigo y datos de entrenamiento. Por otro, la variante "heretic" elimina las capas de alineacion orientadas a rechazar peticiones, lo que la hace atractiva para investigacion sobre comportamiento de modelos y para casos donde los filtros estandar resultan limitantes, pero tambien la convierte en un artefacto inadecuado para despliegues de cara al publico sin moderacion adicional.

El repositorio ocupa 238,8 GB e incluye once niveles de cuantizacion que van desde Q2_K (13,4 GB) hasta Q8_0 (37,1 GB), lo que permite ejecutar el modelo tanto en GPUs de consumo con 24 GB como en aceleradores de centro de datos. No se han publicado resultados de benchmarks especificos para esta variante cuantizada ni para el fine-tune heretic en la informacion disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso (library custom_code, sin detalles adicionales publicados) |
| Parametros totales | 34.779.304.960 |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 512K tokens nativos (524.288); 512K reportados por LLM Reference |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0 |
| Idiomas soportados | Ingles (en) y multilingue (sin listado de idiomas concreto) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (repo cuantizado); safetensors bf16 en el modelo base |
| Tamano del repositorio | 238,8 GB |
| Modelo base | soyaakinohara/K2-Horizon-32B-heretic (a su vez derivado de IFM/K2-Horizon-32B) |
| Autor de la cuantizacion | mradermacher |
| Fecha de publicacion | 2026-10-14 |

## Arquitectura y entrenamiento

El modelo subyacente es un transformer decoder-only denso de aproximadamente 34,8 mil millones de parametros, sin mezcla de expertos. La model card del repositorio cuantizado no aporta detalles sobre el numero de capas, dimension del modelo, tipo de atencion (completa frente a variantes eficientes), tokenizador o estrategia de RoPE, mas alla de la etiqueta `custom_code` que indica que la implementacion requiere codigo propio para cargarse con transformers. La ventana de contexto nativa de 512K tokens es el rasgo arquitectonico mas destacable y condiciona por completo los requisitos de memoria en inferencia.

Sobre el entrenamiento no hay informacion publicada en los materiales disponibles: se desconoce el volumen de tokens, la composicion del dataset, si hubo fases de SFT, RLHF o DPO, y que tecnica concreta se empleo para eliminar los rechazos en la variante heretic (habitualmente abliteration, es decir, la proyeccion ortogonal de la direccion de rechazo fuera de los pesos, pero esto no se confirma en la informacion proporcionada). IFM si ha declarado que el checkpoint publicado de K2-Horizon-32B corresponde a la etapa 1 del entrenamiento final, con resultados de la etapa 2 pendientes y checkpoints intermedios liberados de forma abierta. La variante cuantizada no introduce cambios arquitectonicos: solo reduce la precision de los pesos.

## Capacidades

- Generacion de texto conversacional multi-turno en ingles y otros idiomas sin listado confirmado.
- Ventana de contexto de hasta 512K tokens, adecuada para documentos extensos, bases de codigo completas o historiales largos.
- Razonamiento de un solo paso y multi-paso, sin modo "thinking" explicito documentado.
- Capacidades de generacion de codigo, aunque no se especifican lenguajes ni benchmarks asociados.
- Modelo base denso entrenado para tareas de texto; no hay evidencia de soporte de vision, audio ni multimodalidad.
- Soporte de tool calling / function calling: no documentado en la informacion disponible.
- Soporte de agentes: no documentado.
- Variante "heretic" con los comportamientos de rechazo eliminados, lo que amplia el rango de peticiones que el modelo respondera sin negarse.
- Ejecutable en llama.cpp y runtimes compatibles con GGUF, ademas de soportar despliegue en endpoints compatibles segun las etiquetas del repositorio.

## Casos de uso

- Analisis de documentacion tecnica extensa: gracias a los 512K tokens de contexto, el modelo puede procesar manuales completos, normativas o contratos de cientos de paginas en una sola pasada sin necesidad de chunking ni recuperacion externa.
- Investigacion sobre alineacion y seguridad: la variante heretic permite estudiar de forma controlada como se comporta un modelo cuando se eliminan las capas de rechazo, comparandolo con el checkpoint original de IFM.
- Generacion de codigo en pipelines locales: al distribuirse en GGUF, puede integrarse en entornos de desarrollo sin conexion a internet ni envio de codigo propietario a terceros, usando llama.cpp u Ollama sobre una estacion de trabajo con GPU.
- Prototipado rapido en hardware de consumo: la cuantizacion Q4_K_M cabe en 24 GB de VRAM, lo que permite a un desarrollador individual probar un modelo de 34,8B en una RTX 3090 o 4090.
- Procesamiento por lotes de textos largos: resumen, extraccion de entidades o clasificacion sobre corpus de gran tamano ejecutados en local, con coste marginal cero por token una vez desplegado.
- Redaccion y reescritura creativa sin restricciones tematicas: escritura de ficcion, guiones o contenido editorial donde los filtros de rechazo de modelos alineados resultan un obstaculo.
- Base para fine-tuning posterior: al publicarse bajo Apache 2.0 y con pesos abiertos, sirve como punto de partida para adaptaciones especificas de dominio, siempre que se asuma el estado de desalineacion de partida.
- Despliegue en entornos air-gapped: la disponibilidad de GGUF permite operar el modelo en redes aisladas, algo relevante en sectores con requisitos de confidencialidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Ni la model card de mradermacher, ni la del modelo base cuantizado de soyaakinohara, ni los materiales de busqueda consultados incluyen cifras de MMLU, HumanEval, GSM8K ni de ninguna otra evaluacion estandar para K2-Horizon-32B-heretic o sus cuantizaciones.

El unico dato de rendimiento disponible es de throughput en inferencia, procedente de una receta de despliegue en GitHub: 39-42 tokens por segundo ejecutando la cuantizacion Q8_0 sobre dos tarjetas, frente a 66 tokens por segundo con la exportacion FP8 de IFM en vLLM sobre dos tarjetas.

## Requisitos de hardware

- Q2_K (13,4 GB): cabe en GPUs de 16 GB, como RTX 4060 Ti 16GB o A4000.
- Q3_K_S (15,6 GB) y Q3_K_M (17,2 GB): aptas para GPUs de 16-24 GB.
- IQ4_XS (19,2 GB), Q4_K_S (20,1 GB) y Q4_K_M (21,2 GB): caben en GPUs de 24 GB (RTX 3090, RTX 4090, A5000) siempre que se limite la longitud de contexto, ya que la cache KV a 512K tokens escala muy por encima de la VRAM disponible.
- Q5_K_S (24,2 GB) y Q5_K_M (24,8 GB): al limite de 24 GB; conviene usar GPU de 32-48 GB (A6000, L40S) o descarga parcial de capas a CPU.
- Q6_K (28,6 GB): requiere 32 GB o mas.
- Q8_0 (37,1 GB): requiere 40-48 GB (A100 40GB, A6000 48GB) o reparto entre dos GPUs.
- Los pesos en bf16 del modelo base, no incluidos en este repo, rondan los 70 GB y exigen al menos 80 GB de VRAM (H100 80GB, A100 80GB).
- La cache KV para el contexto completo de 512K tokens es inviable en GPU individual; en la practica se usaran contextos de decenas de miles de tokens, cuantizacion de la cache KV o tecnicas de atencion eficiente.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, llama-cpp-python y servidores compatibles con GGUF. Para mayor rendimiento en GPU, vLLM con la exportacion FP8 del modelo base.
- Throughput de referencia: 39-42 tok/s con Q8_0 en dos tarjetas; 66 tok/s con FP8 en vLLM en dos tarjetas. Latencia no publicada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| K2-Horizon-32B-heretic-GGUF (este) | 34,8B denso | 512K | GGUF | Apache 2.0 | Rechazos eliminados, 11 cuantizaciones |
| soyaakinohara/K2-Horizon-32B-heretic | 34,8B denso | 512K | safetensors/GGUF | Apache 2.0 | Version heretic sin cuantizar por mradermacher |
| IFM/K2-Horizon-32B | 34,8B denso | 512K | peso abierto | Apache 2.0 | Modelo original alineado; checkpoints de etapa 1 |
| Exportacion FP8 de IFM (vLLM) | 34,8B denso | 512K | FP8 | Apache 2.0 | 66 tok/s en dos tarjetas segun receta de GitHub |

No se dispone de datos de benchmarks que permitan comparar el rendimiento de K2-Horizon-32B frente a alternativas de tamano similar, por lo que la comparacion se limita a parametros, contexto, formato y licencia.

## Limitaciones y advertencias

- El modelo ha sido sometido a un proceso de eliminacion de rechazos: no aplica filtros de seguridad y puede generar contenido danino, ilegal o gravemente inapropiado. No es apto para productos de cara al publico sin una capa de moderacion externa.
- Riesgo elevado de alucinacion, agravado por la ausencia de datos publicados sobre el entrenamiento y sobre evaluaciones de fidelidad.
- Sin benchmarks publicados, no hay evidencia verificable de su calidad en razonamiento, codigo o matematicas frente a alternativas.
- La ventana de 512K tokens es nominal; el rendimiento real a contextos muy largos no esta documentado y la memoria necesaria para explotarla es prohibitiva en hardware de consumo.
- Cobertura multilingue declarada como "multilingual" pero sin listado ni evaluacion por idioma; el castellano no esta confirmado como idioma soportado de forma solida.
- El checkpoint de IFM corresponde a la etapa 1 del entrenamiento final, con la etapa 2 pendiente, por lo que su calidad puede quedar por debajo de la version definitiva.
- No hay informacion sobre tool calling, modo agente ni soporte de function calling; asumir estas capacidades en produccion seria arriesgado.
- Licencia Apache 2.0, permisiva para uso comercial, pero la responsabilidad legal sobre el contenido generado recae integramente en el desplegador.
- La etiqueta `custom_code` implica que cargar los pesos con transformers puede requerir `trust_remote_code=True`, con el consiguiente riesgo de ejecutar codigo de terceros.
- Repositorio con 0 descargas y 0 likes en el momento del analisis, sin comunidad que haya validado su comportamiento.

## Enlaces

- Repositorio HuggingFace de la cuantizacion: https://huggingface.co/mradermacher/K2-Horizon-32B-heretic-GGUF
- Modelo base heretic de soyaakinohara: https://huggingface.co/soyaakinohara/K2-Horizon-32B-heretic
- Version GGUF del autor original: https://huggingface.co/soyaakinohara/K2-Horizon-32B-heretic-gguf
- Cuantizaciones ponderadas/imatrix de mradermacher: https://huggingface.co/mradermacher/K2-Horizon-32B-heretic-i1-GGUF
- Pagina de K2 Horizon en IFM: https://ifm.ai/k2/
- Ficha de referencia de K2-Horizon-32B: https://www.llmreference.com/model/k2-horizon-32b
- Receta de despliegue GGUF en GitHub: https://github.com/abtraore/K2-BLACKWELL/tree/main/recipes/k2-horizon-32b-gguf
- Guia de uso de GGUF de TheBloke (referenciada por el autor): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Notas sobre calidad de cuantizaciones de Artefact2: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Pagina de solicitudes de cuantizacion de mradermacher: https://huggingface.co/mradermacher/model_requests
