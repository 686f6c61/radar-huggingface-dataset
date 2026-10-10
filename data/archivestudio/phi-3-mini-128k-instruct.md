# ArchiveStudio/Phi-3-mini-128k-instruct

## Resumen

Phi-3-mini-128k-instruct es un modelo de lenguaje de 3.821 millones de parametros (3,82 B) de tipo transformer denso y decoder-only, desarrollado por Microsoft dentro de la familia Phi-3. Esta ficha corresponde a la copia subida por el usuario ArchiveStudio, un espejo del repositorio original de Microsoft, que conserva la misma arquitectura y pesos. El modelo esta disenado para entornos con recursos de memoria y computo limitados, escenarios con latencia critica y tareas que requieren razonamiento fuerte, en especial codigo, matematicas y logica.

La variante 128k admite una ventana de contexto de 128.000 tokens, lo que la distingue de la version 4K de la misma familia. Fue entrenada sobre los datasets Phi-3, que combinan datos sinteticos con datos filtrados de sitios web publicos, priorizando contenido de alta calidad y densidad de razonamiento. Tras el entrenamiento inicial recibio un proceso de post-entrenamiento basado en ajuste supervisado (SFT) y optimizacion de preferencias directa (DPO) para mejorar el seguimiento de instrucciones y la seguridad.

La relevancia de este modelo radica en ofrecer un rendimiento competitivo entre modelos de menos de 13.000 millones de parametros con un coste de inferencia muy bajo, lo que permite desplegarlo en una sola GPU de consumo. La actualizacion de junio de 2024 mejoro de forma notable el seguimiento de instrucciones, la salida estructurada y la comprension de contexto largo respecto a la version original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso, decoder-only (familia Phi-3) |
| Parametros totales | 3.821.079.552 (3,82 B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 128.000 tokens |
| Tipos de cuantizacion | No disponible en este repositorio (solo safetensors). La familia original ofrece GGUF y ONNX en repositorios separados |
| Idiomas soportados | Ingles (en) |
| Licencia | MIT |
| Formato de pesos | safetensors |
| Pipeline | text-generation |
| Tamano del repositorio | 7,6 GB |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura Phi-3-mini: un transformer decoder-only denso con atencion causal estandar. Al no ser un modelo MoE ni hibrido, todos los parametros se activan en cada paso de inferencia. La variante 128k esta especificamente optimizada para long context, y segun la model card la actualizacion de junio de 2024 incorporo datos adicionales de post-entrenamiento que produjeron mejoras sustanciales en comprension de contexto largo, seguimiento de instrucciones y salida estructurada.

El entrenamiento se realizo sobre los datasets Phi-3, compuestos por datos sinteticos y datos de sitios web publicos filtrados, con enfasis en propiedades de alta calidad y densidad de razonamiento. Tras el preentrenamiento, el modelo paso por un proceso de ajuste supervisado y optimizacion de preferencias directa (DPO) para alinear las respuestas con instrucciones y criterios de seguridad. El numero exacto de tokens de entrenamiento y la composicion detallada del dataset no se especifican en la informacion proporcionada; el informe tecnico completo se enlaza en la seccion de enlaces. Entre los cambios destacados de la revision se incluye el soporte explicito de la etiqueta `<|system|>`, la mejora de la calidad en conversaciones multi-turno y una mejora significativa de la salida en formato JSON.

## Capacidades

- Generacion de texto conversacional en ingles con soporte multi-turno.
- Razonamiento logico, matematico y de sentido comun, con mejora explicita en la revision de junio de 2024.
- Generacion de codigo y asistencia de programacion.
- Salida estructurada: mejoras notables en JSON (de 1,9 a 60,1 en el benchmark interno de estructura JSON) y en XML (de 47,8 a 52,9).
- Comprension de contexto largo hasta 128.000 tokens (evaluado con el benchmark RULER).
- Soporte explicito de la etiqueta de sistema `<|system|>` para definir el comportamiento del asistente.
- Capacidades multilingues limitadas al ingles, segun la model card.
- No dispone de capacidades de vision, audio ni modo de razonamiento explicito (thinking mode).

## Casos de uso

- Asistente de atencion al cliente automatizado: el modelo puede gestionar conversaciones multi-turno con historiales extensos gracias a sus 128.000 tokens de contexto, manteniendo coherencia en dialogos largos sin truncar informacion previa.
- Generacion de codigo en produccion: adecuado para autocompletado, generacion de funciones y refactorizacion en entornos con restricciones de latencia, ya que su tamano de 3,82 B permite respuestas rapidas en una sola GPU.
- Extraccion de datos estructurados: la mejora en salida JSON lo hace util para convertir texto libre en objetos JSON o XML validos dentro de pipelines de procesamiento de datos.
- Analisis de documentos largos: con 128.000 tokens de contexto puede resumir, extraer entidades o responder preguntas sobre informes, contratos o articulos extensos en una sola pasada.
- Asistente educativo de matematicas y logica: sus capacidades de razonamiento lo permiten como tutor que resuelve y explica problemas paso a paso.
- Prototipado rapido de aplicaciones de IA generativa: al ser ligero y de licencia MIT, es un componente adecuado para construir caracteristicas basadas en LLM sin grandes inversiones en infraestructura.
- Procesamiento por lotes en entornos edge o de bajo coste: puede ejecutarse en GPUs de consumo, lo que facilita su despliegue en estaciones de trabajo o servidores modestos.
- Clasificacion y enrutamiento de consultas: uso como componente de razonamiento interno para decidir la accion siguiente en un flujo de agente simple.

## Benchmarks y rendimiento

Datos publicados en la model card del modelo (compara la version original con la actualizacion de junio de 2024):

| Benchmark | Original | Actualizacion junio 2024 |
|---|---|---|
| Instruction Extra Hard | 5,7 | 5,9 |
| Instruction Hard | 5,0 | 5,2 |
| JSON Structure Output | 1,9 | 60,1 |
| XML Structure Output | 47,8 | 52,9 |
| GPQA | 25,9 | 29,7 |
| MMLU | 68,1 | 69,7 |
| Media | 25,7 | 37,3 |

RULER (comprension de contexto largo, por longitud de contexto):

| Modelo | 4K | 8K | 16K | 32K | 64K | 128K | Media |
|---|---|---|---|---|---|---|---|
| Original | 86,7 | 78,1 | 75,6 | 70,3 | 58,9 | 43,3 | 68,8 |
| Actualizacion junio 2024 | 92,4 | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible |

Nota: la tabla RULER de la model card aparece truncada en la informacion proporcionada; solo se dispone del primer valor de la actualizacion de junio de 2024 (92,4 en 4K).

## Requisitos de hardware

- VRAM para inferencia (estimaciones orientativas): aproximadamente 7,6 GB en BF16/FP16, en torno a 3,8 GB en INT8 y cerca de 2 GB en cuantizacion de 4 bits. Estos valores no incluyen la cache KV.
- Cache KV: para la ventana completa de 128.000 tokens la cache KV en precision alta es muy voluminosa y puede superar la capacidad de GPUs de consumo; en la practica conviene limitar la longitud de contexto o usar cuantizacion de la cache.
- GPU recomendadas: una sola GPU con 8-16 GB es suficiente para inferencia en BF16 a contextos moderados; opciones como RTX 3060 12 GB, RTX 4070, RTX 4090, A10, L4, A100 y H100 son validas. Para contexto completo de 128K se recomienda A100/H100 o multiples GPUs.
- Cabe en GPU de consumo: si, en modelos con al menos 8-12 GB de VRAM cuando se usa BF16 y contextos moderados, o en GPUs con 6-8 GB si se cuantiza.
- Opciones de despliegue: Transformers (los tags indican custom_code, por lo que requiere `trust_remote_code=True`), vLLM, Hugging Face TGI y ONNX Runtime. Para llama.cpp u Ollama es necesario convertir los pesos a GGUF, ya que este repositorio solo contiene safetensors.
- Latencia y throughput: no se han publicado cifras concretas en la informacion disponible; al ser un modelo de 3,82 B, el throughput es alto en comparacion con modelos de 7 B o 13 B, especialmente con vLLM y procesamiento por lotes.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| ArchiveStudio/Phi-3-mini-128k-instruct | 3,82 B | 128.000 | MIT | safetensors |
| microsoft/Phi-3-mini-4k-instruct | 3,82 B | 4.096 | MIT | safetensors, ONNX, GGUF |
| Llama-3.2-3B-Instruct | 3,21 B | 128.000 | Llama 3.2 Community License | safetensors, GGUF |
| Qwen2.5-3B-Instruct | 3,09 B | 32.768 | Apache 2.0 | safetensors, GGUF |

La comparativa se limita a parametros, contexto, licencia y formato de pesos, ya que no se dispone de resultados de benchmarks homogeneos para todos los modelos en la informacion proporcionada. Frente a Phi-3-mini-4k, la variante 128k ofrece un contexto mucho mayor con el mismo numero de parametros. Frente a Llama-3.2-3B y Qwen2.5-3B, el modelo de Microsoft destaca por su licencia MIT, mas permisiva que la licencia de Llama, aunque Llama y Qwen cubren mas idiomas y ofrecen variantes GGUF listas para usar.

## Limitaciones y advertencias

- Riesgo de alucinacion: como cualquier LLM, puede generar contenido plausible pero falso, especialmente en dominios especializados o con contexto insuficiente.
- Sesgos: el modelo se entreno con datos web filtrados y sinteticos; puede reproducir sesgos presentes en esos datos. La model card no detalla analisis de sesgos especificos.
- Idioma: el modelo esta disenado y evaluado unicamente para ingles, por lo que su rendimiento en castellano u otros idiomas no esta garantizado ni evaluado.
- Contexto: aunque soporta 128K tokens, el rendimiento en RULER decae con la longitud (43,3 en 128K para la version original), por lo que la calidad de recuperacion a contextos muy largos no es uniforme.
- Codigo personalizado: los pesos usan `custom_code`, lo que obliga a ejecutar con `trust_remote_code=True`; conviene auditar el codigo remoto antes de usarlo en entornos de produccion.
- Repositorio espejo: este repositorio pertenece a ArchiveStudio, no a Microsoft; tiene 0 descargas y 0 likes en el momento de la consulta, por lo que se recomienda verificar la integridad de los pesos y considerar el repositorio oficial (microsoft/Phi-3-mini-128k-instruct) como fuente de referencia.
- Formato: al contener solo safetensors, requiere conversion para su uso en llama.cpp u Ollama.
- Licencia: MIT, lo que permite uso comercial y modificacion. Se debe conservar el aviso de copyright y de licencia. La model card enlaza a la licencia del repositorio original de Microsoft; conviene confirmar que la licencia aplicable es la misma en ambas fuentes.
- Uso de alto riesgo: los desarrolladores deben evaluar precision, seguridad y equidad antes de emplear el modelo en escenarios criticos.

## Enlaces

- Repositorio en HuggingFace (esta copia): https://huggingface.co/ArchiveStudio/Phi-3-mini-128k-instruct
- Repositorio original de Microsoft: https://huggingface.co/microsoft/Phi-3-mini-128k-instruct
- Variante 4K: https://huggingface.co/microsoft/Phi-3-mini-4k-instruct
- Licencia (original): https://huggingface.co/microsoft/Phi-3-mini-128k-instruct/resolve/main/LICENSE
- Portal Phi-3: https://azure.microsoft.com/en-us/products/phi-3
- Blog de Microsoft sobre Phi-3: https://aka.ms/Phi-3Build2024
- Informe tecnico de Phi-3: https://aka.ms/phi3-tech-report
- Phi-3 en Azure AI Studio: https://aka.ms/phi3-azure-ai
- Phi-3 Cookbook (repositorio): https://github.com/microsoft/Phi-3CookBook
- Demo interactiva: https://aka.ms/try-phi3
