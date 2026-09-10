# SAIFIINDUSTRIES/Nex-N2.5-mini

## Resumen

Nex-N2.5-mini es el miembro de menor tamano de la familia Nex-N2.5, una saga de modelos agenticos disenada por Nex-AGI para tareas de horizonte largo en entornos reales (uso de ordenador, navegacion web y ejecucion autonoma de programas). El repositorio publicado en HuggingFace bajo el identificador `SAIFIINDUSTRIES/Nex-N2.5-mini` contiene 35.107.181.936 parametros (35,1 B) en formato safetensors, ocupa 70,2 GB y se distribuye con licencia Apache 2.0. La etiqueta de arquitectura declarada por la libreria `transformers` es `qwen3_5_moe`, lo que indica un transformer con mezcla de expertos (MoE); el numero de parametros activos por token no se especifica.

El modelo es multimodal de entrada (etiqueta `image-text-to-text`), coherente con el planteamiento de la familia: la vision no es solo una modalidad de entrada, sino la interfaz con la que el agente percibe el entorno, verifica resultados y autocorrige su ejecucion. La model card describe tres tamanos (mini, Pro y Max), siendo Max un MoE de 1,6 billones de parametros y solo texto, mientras que mini y Pro mantienen la base multimodal.

La relevancia actual del modelo esta en su orientacion a flujos agenticos de largo recorrido (computer use, browsing, testing de codigo) con pesos abiertos, algo poco frecuente en esa categoria. Conviene senalar dos cautelas: el repositorio no tiene descargas ni valoraciones en el momento de la consulta, y el autor del repositorio (`SAIFIINDUSTRIES`) no coincide con la organizacion citada en la model card (`nex-agi`), por lo que la procedencia de estos pesos concretos no queda acreditada en la informacion disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mezcla de expertos (MoE) sobre transformer; etiqueta de `transformers` `qwen3_5_moe` |
| Parametros totales | 35.107.181.936 (35,1 B) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el repositorio solo incluye pesos safetensors, sin GGUF ni AWQ/GPTQ publicados) |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (libreria `transformers`) |
| Tamano del repositorio | 70,2 GB |
| Pipeline declarado | text-generation |
| Modalidades de entrada | texto e imagen (`image-text-to-text`) |

## Arquitectura y entrenamiento

La informacion disponible solo permite confirmar que se trata de un modelo de mezcla de expertos etiquetado como `qwen3_5_moe` en la metadata de HuggingFace, con 35,1 B de parametros totales y pesos en safetensors de aproximadamente 70 GB (compatible con un almacenamiento en bf16/fp16). No se detallan en la model card el numero de expertos, el numero de expertos activos por token, la dimension oculta, el numero de capas ni el mecanismo de atencion (no se menciona atencion lineal, decodificacion especulativa ni ninguna otra innovacion concreta de inferencia).

Respecto al entrenamiento, la model card indica que Nex-N2.5-mini y Nex-N2.5-Pro continuan sobre las bases multimodales de Nex-N2, con mejoras centradas en uso de ordenador, navegacion web y capacidades agenticas con anclaje visual. Se describe un post-entrenamiento sistematico orientado a agentes, con ampliacion de entornos de entrenamiento, tipos de tarea y escenarios de productividad, y aprendizaje a partir de retroalimentacion del entorno. No se especifican el volumen de tokens de entrenamiento, la composicion del dataset, ni si se emplearon RLHF, DPO u otras tecnicas de alineacion concretas.

## Capacidades

- Generacion de texto y conversacion multi-turno (pipeline `text-generation`, etiqueta `conversational`).
- Comprension de imagenes combinada con texto (`image-text-to-text`), utilizada como realimentacion visual para verificar resultados de una tarea.
- Uso de ordenador (computer use): operar interfaces graficas y entornos de escritorio mediante percepcion visual.
- Navegacion web autonoma (web browsing) como parte del flujo agentico.
- Ejecucion y prueba autonoma de programas, con autocorreccion a partir del resultado observado.
- Razonamiento agentico multi-paso orientado a tareas de horizonte largo.
- Rendimiento destacado en benchmarks de codigo y terminal (vease la seccion de benchmarks), lo que implica capacidad de trabajo sobre repositorios y linea de comandos.
- Tool calling / function calling: la model card menciona evaluaciones de uso de herramientas (Toolathlon Verified) y automatizacion (AutomationBench), lo que implica soporte de llamada a herramientas, aunque no se detalla el formato concreto de invocacion.
- Capacidades multilingues: no disponible.
- Modo de razonamiento explicito (thinking mode), soporte de audio o cualquier otra capacidad especial: no disponible en la informacion proporcionada.

## Casos de uso

- Agentes de uso de ordenador: el modelo puede controlar aplicaciones de escritorio o web interpretando capturas de pantalla y verificando visualmente si la accion tuvo el efecto esperado, lo que encaja con flujos de automatizacion de back-office (rellenado de formularios, extraccion de datos de interfaces legacy sin API).
- Automatizacion de tareas de terminal y DevOps: con 73,4 puntos en Terminal-Bench 2.1, es adecuado para agentes que ejecutan comandos, leen la salida, corrigen errores y repiten el ciclo en un entorno de shell.
- Resolucion de incidencias en repositorios de codigo: sus 43,8 puntos en SWE-Bench Pro lo situan como candidato para triaje y parcheo asistido de bugs en pipelines internos, siempre con revision humana del diff.
- Navegacion web y extraccion de informacion: agentes que recorren paginas, hacen clic, rellenan campos y consolidan resultados, aprovechando la percepcion visual para sitios con DOM complejo o contenido renderizado dinamicamente.
- Automatizacion de flujos ofimaticos y de productividad: la familia se entrena explicitamente en escenarios de productividad, por lo que encaja en tareas de generacion de informes, hojas de calculo y documentos a partir de fuentes heterogeneas.
- Asistente de investigacion y trabajo con conocimiento: la model card menciona ganancias en investigacion cientifica y trabajo con conocimiento, lo que permite usarlo para resumir y relacionar documentacion tecnica o articulos, combinando texto e imagenes (figuras, tablas escaneadas).
- Evaluacion y testing automatico de software: dado su entrenamiento en ejecucion y prueba autonoma de programas, puede integrarse en CI/CD como agente que reproduce fallos, propone casos de prueba y valida correcciones.
- Prototipado de agentes multi-herramienta: al declarar compatibilidad con `endpoints_compatible` y aparicion en benchmarks de uso de herramientas, sirve como base para orquestaciones con varias funciones externas en fase de prototipo.

## Benchmarks y rendimiento

La model card incluye una tabla comparativa de la familia Nex-N2.5 frente a modelos propietarios y abiertos. Los datos disponibles en la informacion proporcionada son los siguientes (la tabla original esta truncada; solo se reproducen las filas completas, y la fila `Toolathlon Verified` aparece cortada, por lo que se omite).

| Benchmark | Nex-N2.5-mini | Nex-N2.5-Pro | Nex-N2.5-Max | Claude Opus 5 | GPT-5.6 Sol | Kimi-K3 | GLM-5.3 | DeepSeek-V4-Pro-0813 | Qwen3.8-Max |
|---|---|---|---|---|---|---|---|---|---|
| Terminal-Bench 2.1 | 73,4 | 82,7 | 86,1 | 89,1 | 88,8 | 88,3 | 88,2 | 87,9 | 86,6 |
| SWE-Bench Pro | 43,8 | 61,2 | 65,7 | 79,2 | 64,6 | 63,3 | 64,6 | 55,4 | 67,7 |
| DeepSWE v1.1 | 36,1 | 55,8 | 65,6 | 73,7 | 72,7 | 67,5 | 66,9 | 62,8 | 69,3 |
| AutomationBench v1.0.6 | 32,3 | 44,2 | 50,2 | 50,3 | 45,8 | 46,7 | 48,2 | 43,2 | 39,8 |

Observaciones: en las cuatro metricas el mejor resultado corresponde a Claude Opus 5. Nex-N2.5-mini queda por debajo de sus hermanos Pro y Max en todas ellas, con una diferencia especialmente amplia en SWE-Bench Pro (43,8 frente a 61,2 y 65,7) y en DeepSWE v1.1 (36,1 frente a 55,8 y 65,6). No se han publicado en la informacion disponible resultados de benchmarks clasicos como MMLU, HumanEval o GSM8K para este modelo.

## Requisitos de hardware

- VRAM estimada en bf16/fp16: en torno a 70 GB de pesos mas memoria para el cache KV, lo que exige al menos una GPU de 80 GB (A100 80 GB, H100 80 GB) o reparto en varias GPU.
- VRAM estimada en cuantizacion de 8 bits: aproximadamente 35-40 GB de pesos, viable en una A100 40 GB o en dos GPU de 24 GB con tensor parallelism.
- VRAM estimada en cuantizacion de 4 bits: aproximadamente 18-22 GB de pesos, lo que en principio cabe en una RTX 4090 (24 GB), aunque con poco margen para el cache KV en contextos largos.
- GPU recomendadas: A100 80 GB o H100 80 GB para bf16 sin cuantizar; A6000/L40S 48 GB o RTX 4090 24 GB para despliegues cuantizados.
- Cabe en GPU de consumo: si, en RTX 4090/3090 (24 GB) siempre que se disponga de pesos cuantizados a 4 bits; en bf16 no cabe.
- Opciones de despliegue: `transformers` de forma nativa (es la libreria declarada). vLLM, TGI o SGLang requeriran soporte explicito para la arquitectura `qwen3_5_moe` y para el procesamiento de imagen; no esta confirmado en la informacion disponible. llama.cpp y Ollama no son utilizables sin pesos GGUF, que no se han publicado en este repositorio.
- Latencia y throughput estimados: no disponible.
- Nota practica: al tratarse de un MoE, el consumo de VRAM viene determinado por los parametros totales (todos los expertos deben residir en memoria), mientras que el coste computacional por token depende de los parametros activos, cuyo valor no se ha publicado.

## Comparativa con modelos similares

La comparacion mas directa es con los otros miembros de la propia familia, ya que no se dispone de datos de arquitectura ni de contexto de los modelos de referencia usados en la tabla de benchmarks.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Rendimiento (SWE-Bench Pro) |
|---|---|---|---|---|---|
| Nex-N2.5-mini | 35,1 B (MoE) | no disponible | apache-2.0 | Pesos abiertos (este repositorio) y OpenRouter | 43,8 |
| Nex-N2.5-Pro | no disponible | no disponible | no disponible | Pesos abiertos (nex-agi) y OpenRouter | 61,2 |
| Nex-N2.5-Max | 1,6 B (MoE, solo texto) | no disponible | no disponible | Pesos abiertos (nex-agi) y ModelScope | 65,7 |
| Claude Opus 5 | no disponible | no disponible | Propietaria | Solo API | 79,2 |
| GPT-5.6 Sol | no disponible | no disponible | Propietaria | Solo API | 64,6 |
| Qwen3.8-Max | no disponible | no disponible | no disponible | no disponible | 67,7 |

No se dispone de informacion suficiente sobre modelos abiertos de tamano comparable (por ejemplo alternativas MoE de ~30-40 B) en el material proporcionado para establecer una comparativa de contexto, licencia o coste de despliegue.

## Limitaciones y advertencias

- Procedencia no verificada: el repositorio esta publicado por `SAIFIINDUSTRIES`, mientras que la model card y los enlaces apuntan a la organizacion `nex-agi`. No hay confirmacion en la informacion disponible de que se trate de una publicacion oficial.
- Sin validacion de la comunidad: 0 descargas y 0 likes en el momento de la consulta, sin garantia de que los pesos hayan sido probados por terceros.
- Datos ausentes criticos: se desconoce la longitud de contexto, los parametros activos, los idiomas soportados y el detalle del entrenamiento, lo que impide dimensionar con precision el despliegue y el alcance multilingue.
- Riesgo de alucinacion: no se documentan tasas de alucinacion ni resultados en benchmarks de veracidad; en tareas largas con multiples pasos el error puede acumularse.
- Agentes con acceso a herramientas: el uso de ordenador, terminal y navegacion web implica riesgo operativo real (ejecucion de comandos destructivos, envio de datos, compras). Requiere sandboxing, permisos minimos y supervision humana.
- Sesgos: no se publica ninguna evaluacion de sesgo, toxicidad o equidad, ni la composicion del dataset, por lo que no pueden descartarse sesgos sistematicos.
- Rendimiento inferior al resto de la familia: en SWE-Bench Pro y DeepSWE v1.1 la diferencia con Pro y Max es de 17-30 puntos, por lo que mini no es sustituto directo en tareas de ingenieria de software compleja.
- Licencia: Apache 2.0 permite uso comercial y modificacion, pero la propia licencia no cubre posibles derechos de terceros sobre los datos de entrenamiento ni sobre los pesos si su origen no esta acreditado.
- Soporte de herramientas de inferencia incierto: al ser una arquitectura MoE multimodal nueva, el soporte en vLLM, TGI o SGLang puede ser incompleto o inexistente, y no hay pesos cuantizados publicados.
- Contexto e idioma: al no declararse la ventana de contexto ni los idiomas soportados, no conviene asumir un rendimiento correcto en castellano ni en conversaciones de contexto muy largo.

## Enlaces

- Repositorio HuggingFace (objeto de esta ficha): https://huggingface.co/SAIFIINDUSTRIES/Nex-N2.5-mini
- Repositorio citado en la model card para el modelo mini: https://huggingface.co/nex-agi/Nex-N2.5-mini
- ModelScope (mini): https://modelscope.cn/models/nex-agi/Nex-N2.5-mini
- Repositorio HuggingFace de Nex-N2.5-Pro: https://huggingface.co/nex-agi/Nex-N2.5-Pro
- ModelScope (Pro): https://modelscope.cn/models/nex-agi/Nex-N2.5-Pro
- Repositorio HuggingFace de Nex-N2.5-Max: https://huggingface.co/nex-agi/Nex-N2.5-Max
- ModelScope (Max): https://modelscope.cn/models/nex-agi/Nex-N2.5-Max
- Coleccion de HuggingFace de la familia: https://huggingface.co/collections/nex-agi/nex-n25
- Repositorio GitHub: https://github.com/nex-agi/Nex-N2.5
- Sitio web del desarrollador: https://nex-agi.com/
- Acceso alojado, Nex-N2.5-Pro en OpenRouter: https://openrouter.ai/nex-agi/nex-n2.5-pro
- Acceso alojado, Nex-N2.5-mini en OpenRouter: https://openrouter.ai/nex-agi/nex-n2.5-mini

Nota: la busqueda web realizada no devolvio resultados utiles (unicamente paginas de inicio del motor de busqueda), por lo que no se han podido incorporar papers, blogs tecnicos ni demos adicionales.
