# mradermacher/Inkling-2-Mini-i1-GGUF

## Resumen
Inkling-2-Mini es un modelo multimodal de tipo image-text-to-text desarrollado por Thinking Machines, distribuido bajo licencia Apache 2.0. Se trata de un modelo con arquitectura MoE (mixture of experts) de aproximadamente 26.070 millones de parametros totales, disenado para tareas conversacionales que combinan entrada de imagen y texto. La ficha que nos ocupa corresponde a la cuantizacion GGUF realizada por mradermacher, que permite ejecutar el modelo en entornos con recursos limitados mediante llama.cpp y herramientas compatibles.

Esta version concreta, Inkling-2-Mini-i1-GGUF, emplea cuantizaciones ponderadas con imatrix (importancia matrix) para preservar la calidad del modelo original durante la compresion. El repositorio incluye un unico quant publicado, i1-Q2_K, de aproximadamente 11 GB, ademas del fichero imatrix necesario para generar cuantizaciones propias. La relevancia de esta publicacion radica en que facilita el despliegue local de un modelo MoE multimodal de 26B en hardware de consumo, algo impensable con los pesos originales en precision completa.

El modelo base esta orientado a conversacion multimodal en ingles y su licencia permisiva (Apache 2.0) lo hace atractivo para integracion en productos comerciales. No obstante, la informacion publicada sobre el modelo original es muy limitada: no se detallan la longitud de contexto, la composicion del dataset de entrenamiento ni resultados de benchmarks.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE (mixture of experts), transformer multimodal image-text-to-text |
| Parametros totales | 26.070.385.152 (~26,07 mil millones) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | i1-Q2_K (publicado); imatrix disponible para generar quants propios (Q2_K, IQ3_XXS, Q3_K_M, Q4_K_M, Q5_K_M, Q6_K, IQ4_XS, entre otros segun la model card) |
| Idiomas soportados | ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (cuantizacion); modelo base en safetensors via transformers |

## Arquitectura y entrenamiento
El modelo base, thinkingmachines/Inkling-2-Mini, emplea una arquitectura MoE (mixture of experts) con capacidades multimodales de tipo image-text-to-text. La etiqueta "moe" en los tags de Hugging Face confirma el uso de mezcla de expertos, aunque no se especifica el numero de expertos, el numero de expertos activos por token ni el tamano de cada experto. Tampoco se detalla la longitud de contexto soportada ni si incorpora innovaciones como atencion lineal, decodificacion especulativa o modos de razonamiento extendido.

En cuanto al entrenamiento, la informacion disponible no incluye el numero de tokens procesados, la composicion del dataset, ni si se aplicaron tecnicas de RLHF, DPO o ajuste por instrucciones. La model card del repositorio GGUF se limita a indicar que se trata de cuantizaciones ponderadas con imatrix del modelo original, sin aportar detalles sobre el proceso de entrenamiento del modelo base. Esta ausencia de informacion tecnica es una limitacion importante a la hora de evaluar el modelo.

La cuantizacion i1-Q2_K publicada utiliza una matriz de importancia (imatrix) generada a partir de datos de calibracion, lo que segun la propia model card mejora la calidad frente a cuantizaciones estaticas equivalentes. El autor recomienda IQ3_XXS como alternativa de mejor calidad que Q2_K para tamanos similares.

## Capacidades
- Generacion de texto conversacional en ingles, orientada a dialogos multi-turno.
- Comprension de imagenes combinadas con texto (image-text-to-text), lo que permite responder preguntas sobre contenido visual.
- Arquitectura MoE que, en teoria, ofrece mayor eficiencia computacional por token al activar solo un subconjunto de expertos (aunque no se especifica cuantos).
- Capacidad de ejecucion local mediante llama.cpp y herramientas compatibles con GGUF.
- Soporte de cuantizacion agresiva (Q2_K) que reduce el modelo a unos 11 GB.
- No se documenta soporte explicito de tool calling, function calling, capacidades de agente, modo thinking ni procesamiento de audio.

## Casos de uso
- Asistencia conversacional multimodal en local: el modelo puede gestionar dialogos que incluyan imagenes, adecuado para prototipos de asistentes personales que necesiten privacidad y no dependan de la nube, gracias a su formato GGUF ejecutable en hardware de consumo.
- Analisis de capturas de pantalla y documentos escaneados: un desarrollador puede integrar el modelo en una herramienta de escritorio que describa o responda preguntas sobre imagenes, aprovechando la capacidad image-text-to-text y la licencia Apache 2.0 para uso comercial.
- Educacion y accesibilidad: generacion de descripciones de imagenes para personas con discapacidad visual, ejecutandose en equipos modestos gracias a la cuantizacion Q2_K de 11 GB.
- Prototipado rapido de aplicaciones multimodales: investigadores que necesiten validar una idea con un modelo MoE de 26B sin acceso a GPUs de datacenter pueden usar la version GGUF en una estacion de trabajo con 12-16 GB de VRAM.
- Procesamiento por lotes de imagenes con preguntas asociadas: en pipelines offline donde la latencia no es critica, el modelo puede clasificar o describir lotes de imagenes con prompts de texto.
- Experimentacion con tecnicas de cuantizacion: el fichero imatrix publicado permite a otros desarrolladores generar sus propios quants y comparar la degradacion de calidad, un caso de uso orientado a la comunidad de investigacion en compresion de modelos.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware
- VRAM estimada para inferencia: el unico quant publicado (i1-Q2_K) ocupa aproximadamente 11 GB, por lo que se necesita al menos 12 GB de VRAM para cargarlo completo en GPU; con offloading parcial a CPU puede ejecutarse con menos VRAM a costa de latencia.
- GPU recomendadas: RTX 4090 (24 GB), RTX 3090 (24 GB) o RTX 4080 (16 GB) para el quant Q2_K completo en GPU. Para quants mayores (Q4_K_M, Q5_K_M, Q6_K) seria necesario generar los ficheros a partir del imatrix y disponer de 16-24 GB o mas de VRAM.
- Cabe en GPU de consumo: si, en tarjetas con 12 GB o mas para el quant Q2_K; en tarjetas de 8 GB requeriria offloading parcial.
- Opciones de despliegue: llama.cpp, Ollama (previa conversion o importacion del GGUF), y cualquier runtime compatible con GGUF. Para los pesos originales en safetensors, transformers con aceleracion por GPU. No se confirma soporte de vLLM o TGI para este formato.
- Latencia y throughput estimados: no disponible. Al ser un modelo MoE, el throughput depende del numero de parametros activos, dato no publicado.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Inkling-2-Mini (este) | 26,07B (MoE) | no disponible | Apache 2.0 | GGUF, safetensors | Multimodal image-text-to-text |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible | No se dispone de informacion sobre modelos de la misma categoria y tamano en la documentacion proporcionada |

No se dispone de datos suficientes para establecer una comparativa rigurosa con modelos alternativos de la misma categoria, ya que la informacion proporcionada no incluye modelos comparables ni resultados de rendimiento.

## Limitaciones y advertencias
- Solo soporta ingles; no se documenta capacidad multilingue, lo que limita su uso en castellano u otros idiomas.
- La cuantizacion Q2_K es agresiva y puede degradar notablemente la calidad respecto al modelo original, especialmente en tareas de razonamiento y comprension de imagenes. El autor sugiere IQ3_XXS como alternativa de mayor calidad.
- No se han publicado benchmarks, por lo que no es posible evaluar objetivamente su rendimiento frente a alternativas.
- Se desconoce la longitud de contexto, lo que impide planificar su uso en tareas que requieran ventanas largas.
- Riesgo de alucinacion inherente a los modelos generativos, sin datos especificos sobre su incidencia en este modelo.
- No se documentan sesgos conocidos ni medidas de mitigacion aplicadas durante el entrenamiento.
- Aunque la licencia Apache 2.0 permite uso comercial, la falta de informacion sobre el dataset de entrenamiento impide descartar riesgos de propiedad intelectual en los datos.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que indica que la cuantizacion es muy reciente y no ha sido validada por la comunidad.
- Al ser un modelo MoE, el consumo de memoria puede ser mayor que el sugerido por los parametros activos, ya que todos los expertos deben residir en memoria.

## Enlaces
- Repositorio Hugging Face de la cuantizacion: https://huggingface.co/mradermacher/Inkling-2-Mini-i1-GGUF
- Modelo base: https://huggingface.co/thinkingmachines/Inkling-2-Mini
- Quants estaticos del mismo autor: https://huggingface.co/mradermacher/Inkling-2-Mini-GGUF
- Pagina de descargas del autor: https://hf.tst.eu/model#Inkling-2-Mini-i1-GGUF
- Solicitudes de cuantizacion: https://huggingface.co/mradermacher/model_requests
- Licencia Apache 2.0: https://www.apache.org/licenses/LICENSE-2.0
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Analisis de tipos de quant (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
