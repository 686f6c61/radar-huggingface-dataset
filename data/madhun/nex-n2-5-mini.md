# madhun/Nex-N2.5-mini

## Resumen

Nex-N2.5-mini es la variante pequena de la familia Nex-N2.5 de Nex-AGI, un conjunto de modelos agénticos disenados para tareas de horizonte largo en entornos reales (uso de ordenador, navegacion web y ejecucion autonoma de programas). El repositorio analizado, publicado bajo el identificador `madhun/Nex-N2.5-mini`, contiene 35.107.181.936 parametros (~35,1 mil millones) en pesos safetensors, con un tamano de repositorio de 70,2 GB, coherente con un almacenamiento en bf16/fp16. La etiqueta de arquitectura declarada en el repositorio es `qwen3_5_moe`, lo que apunta a un transformer con mezcla de expertos (MoE) y a una base derivada de la familia Qwen 3.5.

El modelo se presenta como multimodal (etiqueta `image-text-to-text`) y orientado a agentes: segun la model card, la vision no es solo una modalidad de entrada, sino la interfaz con la que el agente percibe el entorno, verifica resultados y avanza en la tarea. La familia se distribuye en tres tamanos (mini, Pro y Max); Max se construye sobre un modelo MoE de 1,6 billones de parametros solo texto, mientras que mini y Pro parten de las bases multimodales de Nex-N2 con mejoras en computer use, navegacion web y capacidades agénticas con anclaje visual.

Su relevancia actual radica en la combinacion de licencia Apache 2.0, pesos abiertos en safetensors y un enfoque explicito hacia flujos agénticos con verificacion visual. No obstante, la informacion publicada en este repositorio concreto es incompleta: no se declara longitud de contexto, idiomas, parametros activos ni esquemas de cuantizacion, y no se especifican detalles del dataset de entrenamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con mezcla de expertos (MoE) multimodal; etiqueta de repositorio `qwen3_5_moe` |
| Parametros totales | 35.107.181.936 (~35,1 mil millones), dato real de safetensors |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible; el repositorio solo publica pesos safetensors (70,2 GB, compatible con bf16/fp16) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (libreria transformers) |
| Modalidades | Texto e imagen de entrada; texto de salida (etiquetas `image-text-to-text`, `text-generation`) |
| Familia | Nex-N2.5 (mini, Pro, Max) |
| Tamano del repositorio | 70,2 GB |
| Fecha de publicacion | 2026-09-26 (segun metadatos de HuggingFace) |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La informacion disponible indica una arquitectura de mezcla de expertos (MoE) con etiqueta `qwen3_5_moe`, lo que sugiere una base derivada de la familia Qwen 3.5 MoE y un modo de inferencia multimodal con codificador de vision para entradas de imagen. El numero de parametros activos por token no esta publicado, por lo que no es posible estimar la relacion de activacion ni el coste efectivo de computo por token. El tag `endpoints_compatible` sugiere compatibilidad con el endpoint de inferencia de HuggingFace para text-generation. No se detallan en la model card el numero de capas, la configuracion de expertos, el tipo de atencion ni la estrategia de decodificacion.

Respecto al entrenamiento, la model card describe un post-entrenamiento sistematico orientado a entornos agénticos: se amplian los entornos de entrenamiento de agentes, los tipos de tarea y los escenarios de productividad, con retroalimentacion del entorno mas rica. El documento menciona que Nex-N2.5-Max representa el primer esfuerzo completo de post-entrenamiento a escala de billon de parametros de Nex-AGI, y que la familia mejora la capacidad de actuar de forma continua y autocorregirse mediante retroalimentacion visual. No se especifica el volumen de tokens de preentrenamiento, la composicion del dataset, ni si se emplearon RLHF, DPO u otras tecnicas de alineacion, ni sus hiperparametros.

## Capacidades

- Generacion de texto conversacional multi-turno (pipeline declarado: `text-generation`).
- Razonamiento agéntico de horizonte largo: ejecucion continua de tareas con autocorreccion basada en retroalimentacion visual.
- Computer use: operacion de entornos de escritorio mediante percepcion de pantalla y emision de acciones.
- Navegacion web automatizada, segun la descripcion de mejoras especificas en web browsing.
- Ejecucion y prueba autonoma de programas (el modelo aparece evaluado en Terminal-Bench, SWE-Bench Pro y DeepSWE).
- Comprension multimodal imagen-texto: interpretacion de capturas de pantalla e interfaces graficas.
- Capacidades agénticas con herramientas: evaluado en AutomationBench y Toolathlon Verified, benchmarks de uso de herramientas y automatizacion.
- Idiomas soportados: no disponible.
- Modo de pensamiento explicito (thinking mode): no disponible.
- Soporte de audio: no disponible.

## Casos de uso

- Agentes de computer use en escritorio: el modelo puede percibir la pantalla, emitir acciones sobre ventanas y aplicaciones y verificar el resultado de cada paso mediante retroalimentacion visual, lo que lo hace adecuado para automatizar flujos de trabajo ofimaticos reproducibles.
- Automatizacion de QA y pruebas de interfaz: dado su enfoque multimodal, se puede emplear para recorrer una aplicacion web, detectar regresiones visuales y generar informes de fallo con evidencia en forma de captura.
- Agentes de codificacion autonoma: con soporte para ejecucion de programas y evaluacion en Terminal-Bench y SWE-Bench Pro, encaja en pipelines que abren una rama, aplican un parche, ejecutan los tests y corrigen los errores de forma iterativa.
- Asistente de investigacion y trabajo de conocimiento: la model card menciona ganancias en investigacion cientifica y tareas complejas de productividad, por lo que es util para resumir, contrastar y estructurar informacion de multiples fuentes con supervision humana.
- Navegacion web asistida: extraccion de datos de portales sin API publica, cumplimentacion de formularios y monitorizacion de cambios de contenido mediante un agente que navega y reporta.
- Atencion al cliente con soporte visual: un agente conversacional puede solicitar capturas de la interfaz del usuario, interpretar el estado de la aplicacion y guiar la resolucion de incidencias paso a paso.
- Automatizacion de procesos administrativos (RPA con verificacion): sustitucion de secuencias rigidas de RPA por un agente que se adapta a cambios menores en la interfaz y confirma cada accion.
- Generacion de codigo en produccion asistida: integrable en pipelines de CI/CD como revisor o autor de parches, siempre con revision y puertas de calidad automatizadas antes del merge.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (guiones: dato no disponible). El valor de Nex-N2.5-mini en Toolathlon Verified aparece truncado en la informacion disponible.

| Benchmark | Nex-N2.5-mini | Nex-N2.5-Pro | Nex-N2.5-Max | Claude Opus 5 | GPT-5.6 Sol | Kimi-K3 | GLM-5.3 | DeepSeek-V4-Pro-0813 | Qwen3.8-Max |
|---|---|---|---|---|---|---|---|---|---|
| Terminal-Bench 2.1 | 73,4 | 82,7 | 86,1 | 89,1 | 88,8 | 88,3 | 88,2 | 87,9 | 86,6 |
| SWE-Bench Pro | 43,8 | 61,2 | 65,7 | 79,2 | 64,6 | 63,3 | 64,6 | 55,4 | 67,7 |
| DeepSWE v1.1 | 36,1 | 55,8 | 65,6 | 73,7 | 72,7 | 67,5 | 66,9 | 62,8 | 69,3 |
| AutomationBench v1.0.6 | 32,3 | 44,2 | 50,2 | 50,3 | 45,8 | 46,7 | 48,2 | 43,2 | 39,8 |
| Toolathlon Verified | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible |

No se han publicado en la informacion disponible resultados de benchmarks de conocimiento general (MMLU, GSM8K) ni de benchmarks multimodales con cifras: la model card solo referencia una figura de comparacion (`figures/Nex-N2.5-Benchmark-white.png`) sin valores numericos en el texto.

## Requisitos de hardware

Las cifras de VRAM siguientes son estimaciones derivadas del recuento de parametros (35,1 B) y no proceden de datos publicados por el autor.

- Pesos en bf16/fp16: aproximadamente 70 GB solo para los pesos; con cache KV y overhead de runtime, del orden de 80-90 GB. Requiere H100 80 GB, A100 80 GB o reparto en varias GPU (2x L40S 48 GB, 2x A6000 48 GB, 4x RTX 4090 24 GB).
- Cuantizacion a 8 bits: aproximadamente 35 GB de pesos; viable en A100 40 GB, L40S 48 GB o RTX 6000 Ada 48 GB, con margen limitado para contexto largo.
- Cuantizacion a 4 bits: aproximadamente 18-20 GB de pesos; cabe en una RTX 4090, RTX 3090 o RTX 4080 de 24 GB, o en GPUs de 16 GB con contexto reducido.
- Al ser MoE, la huella de memoria viene fijada por los parametros totales, mientras que el coste de computo por token depende de los parametros activos (no publicados); cabe esperar mayor throughput que un modelo denso de tamano equivalente.
- Opciones de despliegue: transformers (libreria declarada), vLLM, SGLang y TGI si el runtime reconoce la arquitectura `qwen3_5_moe`; llama.cpp y Ollama requeririan cuantizaciones GGUF que no se publican en este repositorio.
- Latencia y throughput: no disponible. No se publican mediciones de tokens por segundo ni de latencia por peticion.
- No cabe en GPUs de consumo de 8-12 GB en ninguna configuracion razonable.

## Comparativa con modelos similares

| Modelo | Parametros totales | Contexto | Modalidad | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Nex-N2.5-mini | 35,1 B | no disponible | Texto e imagen | Apache 2.0 | Pesos safetensors (este repositorio) |
| Nex-N2.5-Pro | no disponible | no disponible | Texto e imagen | no disponible | Pesos en HuggingFace (nex-agi) y ModelScope; acceso hospedado en OpenRouter |
| Nex-N2.5-Max | 1,6 B (billones), MoE solo texto | no disponible | Texto | no disponible | Pesos en HuggingFace (nex-agi) y ModelScope |
| Modelos comparables de terceros | no disponible | no disponible | no disponible | no disponible | no disponible |

La informacion disponible no incluye los recuentos de parametros, la longitud de contexto ni las licencias de los modelos de referencia usados en las tablas de benchmarks (Claude Opus 5, GPT-5.6 Sol, Kimi-K3, GLM-5.3, DeepSeek-V4-Pro-0813, Qwen3.8-Max), por lo que no es posible establecer una comparativa completa de coste, contexto o condiciones de uso.

## Limitaciones y advertencias

- Procedencia del repositorio: el identificador analizado es `madhun/Nex-N2.5-mini`, mientras que la model card enlaza los pesos oficiales en `nex-agi/Nex-N2.5-mini`. Conviene verificar la autoria, la integridad de los pesos y la correspondencia con la version oficial antes de usarlos en produccion.
- Repositorio sin traccion: 0 descargas y 0 likes en el momento de la consulta, sin validacion independiente por parte de la comunidad.
- Fechas de metadatos anomales: creacion y actualizacion registradas el 2026-09-26, lo que dificulta situar la version real del modelo.
- Benchmark autodeclarados: todas las cifras de rendimiento provienen del autor del modelo y no han sido verificadas de forma independiente. Ademas, los valores de Toolathlon Verified y de los benchmarks multimodales no estan disponibles en el texto.
- Idiomas no declarados: se desconoce la cobertura multilingue real y el rendimiento fuera del ingles.
- Longitud de contexto no publicada: no es posible dimensionar casos de uso que dependan de ventanas largas ni estimar el coste de cache KV.
- Riesgo de alucinacion agravado en entornos agénticos: un error de percepcion visual puede propagarse a lo largo de una cadena de acciones, y una accion erronea sobre el sistema operativo o el navegador puede tener efectos irreversibles. Es imprescindible ejecutar en sandbox, con permisos minimos y con confirmacion humana en operaciones destructivas.
- Sesgos: no se publica ninguna evaluacion de sesgos, toxicidad o robustez, ni informacion sobre la composicion del dataset de entrenamiento que permita anticiparlos.
- Licencia Apache 2.0: permite uso comercial y modificacion, pero no incluye garantias ni declaracion sobre la procedencia o los derechos de los datos de entrenamiento.
- Sin cuantizaciones oficiales: la ausencia de GGUF, AWQ o GPTQ publicados limita el despliegue en hardware de consumo y obliga a generarlas por cuenta propia.
- Compatibilidad de runtime no confirmada: el soporte de la arquitectura `qwen3_5_moe` en vLLM, SGLang o TGI no se documenta en la informacion disponible y debe validarse antes de planificar un despliegue.
- Capacidades multimodales no cuantificadas: la model card describe el uso de vision como interfaz agéntica, pero no aporta metricas de comprension de imagen.

## Enlaces

- Repositorio analizado: https://huggingface.co/madhun/Nex-N2.5-mini
- Repositorio oficial de Nex-N2.5-mini: https://huggingface.co/nex-agi/Nex-N2.5-mini
- Repositorio oficial de Nex-N2.5-Pro: https://huggingface.co/nex-agi/Nex-N2.5-Pro
- Repositorio oficial de Nex-N2.5-Max: https://huggingface.co/nex-agi/Nex-N2.5-Max
- ModelScope Nex-N2.5-Max: https://modelscope.cn/models/nex-agi/Nex-N2.5-Max
- ModelScope Nex-N2.5-Pro: https://modelscope.cn/models/nex-agi/Nex-N2.5-Pro
- ModelScope Nex-N2.5-mini: https://modelscope.cn/models/nex-agi/Nex-N2.5-mini
- Repositorio GitHub: https://github.com/nex-agi/Nex-N2.5
- Coleccion en HuggingFace: https://huggingface.co/collections/nex-agi/nex-n25
- Sitio web: https://nex-agi.com/
- Acceso hospedado (Pro): https://openrouter.ai/nex-agi/nex-n2.5-pro
- Acceso hospedado (mini): https://openrouter.ai/nex-agi/nex-n2.5-mini
- Paper tecnico: no disponible en la informacion proporcionada.
