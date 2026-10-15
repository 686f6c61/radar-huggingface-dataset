# mradermacher/Ornstein-27B-SABER-GGUF

## Resumen

Ornstein-27B-SABER-GGUF es la version cuantizada en formato GGUF del modelo DJLougen/Ornstein-27B-SABER, un modelo de 26.895.998.464 parametros (aproximadamente 27B) que se presenta como un derivado de la familia Qwen3.5 con las etiquetas refusal-ablation, capability-preserving, saber y multimodal. La cuantizacion la realiza mradermacher, un autor conocido por producir versiones GGUF de modelos abiertos para su uso con llama.cpp y derivados, y el repositorio incluye once variantes de cuantizacion estatica que van desde Q2_K (10,8 GB) hasta Q8_0 (28,7 GB).

El modelo base pertenece a la familia Qwen3.5 segun sus etiquetas y su fichero de licencia, y su rasgo mas distintivo es la ablacion de rechazos (refusal ablation): se ha eliminado o atenuado el comportamiento de negativa a responder ante determinadas peticiones, manteniendo supuestamente las capacidades generales del modelo original. Esto lo convierte en un objeto de estudio para investigacion sobre alineamiento, seguridad y comportamiento de rechazo, mas que en un modelo de proposito general para produccion.

La relevancia de esta ficha radica en que permite evaluar rapidamente el coste de despliegue del modelo en hardware de consumo y en servidores, ya que las cuantizaciones estaticas cubren desde tarjetas graficas de gama alta con 24 GB de VRAM hasta configuraciones mas modestas con cuantizaciones agresivas. No se dispone de informacion sobre la longitud de contexto, la composicion del dataset de entrenamiento ni resultados de benchmarks en la documentacion proporcionada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (etiquetado como qwen3.5 y multimodal; no se detalla en la informacion disponible) |
| Parametros totales | 26.895.998.464 (aproximadamente 27B) |
| Parametros activos | no aplica (no hay indicios de arquitectura MoE en la informacion disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0 (estaticas); existe una variante con cuantizacion ponderada/imatrix en repositorio aparte |
| Idiomas soportados | en (ingles) |
| Licencia | other, con license_name qwen3.5 (enlace a la licencia de Qwen3.5-32B) |
| Formato de pesos | GGUF (los ficheros se distribuyen como ficheros .gguf sueltos, potencialmente multiparte) |

## Arquitectura y entrenamiento

No se dispone de informacion detallada sobre la arquitectura interna del modelo en la documentacion proporcionada. Las etiquetas del repositorio apuntan a la familia qwen3.5 y a la modalidad multimodal, ademas de las etiquetas refusal-ablation, capability-preserving y saber, pero no se especifica si se trata de un transformer denso, de una mezcla de expertos, de un modelo hibrido ni de ninguna otra variante concreta. Tampoco se documenta el numero de tokens de entrenamiento, la composicion del dataset ni si hubo fases de ajuste con RLHF, DPO u otras tecnicas de alineamiento.

Lo que si se puede afirmar a partir de la informacion disponible es que el modelo base (DJLougen/Ornstein-27B-SABER) ha sido sometido a un proceso de ablacion de rechazos con el objetivo declarado de preservar capacidades. Este tipo de intervencion suele consistir en la modificacion selectiva de direcciones o pesos asociados al comportamiento de negativa, de modo que el modelo deja de rechazar cierto tipo de peticiones sin degradar de forma apreciable su rendimiento general. No se documentan en esta ficha ni el metodo exacto de ablacion ni las metricas de preservacion de capacidades utilizadas por el autor. El repositorio cuantizado conserva la marca skip_mmproj en su README, lo que indica que los ficheros del proyector multimodal no se incluyen en esta conversion.

## Capacidades

- Generacion de texto conversacional en ingles, segun la libreria y la etiqueta conversational del repositorio.
- Razonamiento y generacion de codigo: no hay documentacion especifica en la informacion disponible, por lo que debe validarse empiricamente.
- Capacidad multimodal declarada por etiqueta del modelo base, aunque los ficheros del proyector multimodal (mmproj) no se incluyen en este repositorio cuantizado, por lo que la entrada de imagenes requeriria material adicional no presente aqui.
- Comportamiento de rechazo atenuado: la etiqueta refusal-ablation indica que el modelo tiende a no negarse a responder donde el modelo base si lo haria.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: limitadas al ingles segun el campo language del repositorio.
- Modo de pensamiento explicito (thinking mode): no disponible en la informacion proporcionada.

## Casos de uso

- Investigacion sobre alineamiento y seguridad: el modelo permite estudiar de forma controlada como cambia la distribucion de respuestas al eliminar el comportamiento de rechazo, comparandola con el modelo base sin ablacion.
- Red teaming y evaluacion de robustez: util como sujeto de prueba en baterias de prompts adversarios, para medir que tipos de peticiones dejan de rechazarse y con que calidad se responden.
- Analisis de preservacion de capacidades: al estar etiquetado como capability-preserving, sirve para verificar con evaluaciones propias si el rendimiento general se mantiene tras la ablacion en tareas de conocimiento y razonamiento.
- Despliegue local en estaciones de trabajo con GPU de consumo: las cuantizaciones Q4_K_S y Q4_K_M (15,7 GB y 16,6 GB) caben en tarjetas de 24 GB y permiten ejecutar el modelo integramente en local con llama.cpp.
- Prototipado de asistentes conversacionales en ingles: el formato GGUF y la compatibilidad con endpoints facilitan montar un servidor de inferencia ligero para pruebas de producto sin depender de APIs externas.
- Experimentacion con cuantizacion agresiva: las variantes Q2_K y Q3_K permiten medir la degradacion de calidad en un modelo de 27B cuando se comprime hasta aproximadamente 11-14 GB, util para estudios de compromiso calidad/tamano.
- Evaluacion de pipelines multimodales: aunque el proyector no se incluye, el modelo base esta etiquetado como multimodal, por lo que puede emplearse para comprobar la integracion de proyectores externos en stacks de llama.cpp.
- Banchmarking interno de infraestructura: por su rango de cuantizaciones, sirve para comparar throughput y latencia entre distintas configuraciones de GPU y de backend de inferencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del repositorio cuantizado no incluye tablas de MMLU, HumanEval, GSM8K ni de ninguna otra evaluacion, y los resultados de busqueda web no contienen datos tecnicos sobre este modelo.

## Requisitos de hardware

Las cifras de VRAM que se indican a continuacion son estimaciones derivadas del tamano de cada fichero GGUF publicado; a ellas hay que anadir el consumo del cache KV, que depende de la longitud de contexto y no puede calcularse sin conocerla.

- Q2_K (10,8 GB): viable en GPU de 12-16 GB con contexto moderado; util en portatiles con GPU dedicada de gama media.
- Q3_K_S / Q3_K_M / Q3_K_L (12,2 GB / 13,4 GB / 14,4 GB): encajan en GPU de 16 GB como RTX 4080 o RTX 5070 Ti.
- IQ4_XS / Q4_K_S / Q4_K_M (15,3 GB / 15,7 GB / 16,6 GB): las opciones recomendadas por el autor para velocidad; caben con holgura en RTX 4090, RTX 5090 y RTX 3090 de 24 GB.
- Q5_K_S / Q5_K_M (18,8 GB / 19,3 GB): adecuadas para GPU de 24 GB con contexto corto o medio.
- Q6_K (22,2 GB): al limite en GPU de 24 GB; requiere contexto reducido o reparto parcial en CPU.
- Q8_0 (28,7 GB): requiere GPU de 32 GB o superior (RTX 5090, A100 40 GB, H100 80 GB) o bien descarga parcial a RAM.
- GPU recomendadas: RTX 4090/5090 para cuantizaciones de 4 a 6 bits, A100 40 GB y H100 80 GB para Q8_0 y para servicio con contexto largo.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio y servidores compatibles con GGUF; el repositorio esta etiquetado como endpoints_compatible y su libreria declarada es transformers.
- Latencia y throughput: no disponible; no se publican mediciones de tokens por segundo en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Formato | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| mradermacher/Ornstein-27B-SABER-GGUF | 26,9B | GGUF (cuantizacion estatica) | no disponible | other (qwen3.5) | Repositorio publico con 11 cuantizaciones |
| mradermacher/Ornstein-27B-SABER-i1-GGUF | 26,9B (mismo modelo base) | GGUF (cuantizacion ponderada/imatrix) | no disponible | other (qwen3.5) | Repositorio publico citado en la model card; se espera mayor calidad por bit |
| DJLougen/Ornstein-27B-SABER | 26,9B (modelo base) | safetensors (presumiblemente, segun el flujo de conversion a GGUF) | no disponible | other (qwen3.5) | Repositorio original del modelo, sin cuantizar |
| Qwen/Qwen3.5-32B | no disponible | no disponible | no disponible | qwen3.5 | Modelo referenciado unicamente por el enlace de licencia; no se dispone de sus especificaciones |

No se dispone de informacion sobre otros modelos de 27B comparables en la documentacion proporcionada, ni de datos de rendimiento que permitan una comparacion cuantitativa.

## Limitaciones y advertencias

- La ablacion de rechazos implica que el modelo puede generar contenido que el modelo base rechazaria; no es adecuado para despliegues orientados al publico sin filtros externos.
- Riesgo de alucinacion: no se documentan tasas de alucinacion ni evaluaciones de veracidad; al tratarse de un modelo ajustado por ablacion, la fiabilidad factual debe validarse de forma independiente.
- Idioma: el unico idioma declarado es el ingles, por lo que el rendimiento en castellano no esta garantizado ni documentado.
- Longitud de contexto desconocida: no se puede planificar el consumo de memoria ni el rendimiento en tareas de contexto largo sin este dato.
- Proyector multimodal ausente: el README indica skip_mmproj, de modo que la funcionalidad de vision del modelo base no es utilizable directamente con estos ficheros.
- Licencia: se trata de una licencia de tipo other con nombre qwen3.5; es imprescindible revisar los terminos de la licencia de Qwen3.5-32B enlazada antes de cualquier uso comercial.
- Modelo derivado de terceros: existen dos capas de autoria (DJLougen para el modelo base y mradermacher para la cuantizacion), con responsabilidades de mantenimiento distintas.
- Adopcion muy baja: 181 descargas y 1 like en el momento de los datos consultados, lo que reduce la probabilidad de encontrar soporte, incidencias resueltas o validaciones externas.
- Las cuantizaciones Q2_K y Q3_K_M estan marcadas por el propio autor como de calidad inferior o sin nota de recomendacion; en un modelo de 27B la perdida de calidad por debajo de 4 bits puede ser apreciable.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/mradermacher/Ornstein-27B-SABER-GGUF
- Modelo base: https://huggingface.co/DJLougen/Ornstein-27B-SABER
- Cuantizaciones ponderadas/imatrix: https://huggingface.co/mradermacher/Ornstein-27B-SABER-i1-GGUF
- Pagina resumen de descargas del autor: https://hf.tst.eu/model#Ornstein-27B-SABER-GGUF
- Licencia del modelo base de referencia: https://huggingface.co/Qwen/Qwen3.5-32B/blob/main/LICENSE
- Guia de uso de ficheros GGUF: https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Notas sobre tipos de cuantizacion: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Peticiones de cuantizacion y preguntas frecuentes: https://huggingface.co/mradermacher/model_requests
