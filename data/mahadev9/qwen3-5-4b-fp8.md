# mahadev9/Qwen3.5-4B-fp8

## Resumen

Qwen3.5-4B-fp8 es una cuantizacion en precision FP8 (W8A8 dynamic) del modelo Qwen/Qwen3.5-4B, realizada por el usuario mahadev9 mediante la herramienta llm-compressor del proyecto vLLM. Esta version reduce el peso del modelo a 4.9 GB en disco, manteniendo la cabeza de clasificacion (`lm_head`) en su precision original para preservar la calidad de la generacion. El modelo base, desarrollado por Alibaba, es un modelo denso compacto de 4.200 millones de parametros con una ventana de contexto nativa de 262.144 tokens, disenado como una fundacion unificada de lenguaje y vision.

La relevancia de esta cuantizacion radica en que permite ejecutar un modelo multimodal de 4B en hardware de consumo con requisitos de memoria reducidos, manteniendo un rendimiento cercano al original. Es una opcion practica para desarrolladores que necesitan desplegar capacidades de razonamiento y vision en entornos con restricciones de VRAM, como GPUs de 16 GB o inferiores. La integracion directa con vLLM y transformers facilita su adopcion en pipelines de produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso multimodal (lenguaje y vision) |
| Parametros totales | 4.205.751.296 (4,2B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 262.144 tokens (nativa del modelo base) |
| Tipos de cuantizacion | FP8 W8A8 dynamic (lm_head en precision original) |
| Idiomas soportados | No disponible (se espera multilingue, principalmente ingles y chino, pero no confirmado) |
| Licencia | No disponible en la ficha; el modelo base Qwen3.5-4B usa apache-2.0 segun fuentes externas |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo base Qwen3.5-4B es un transformer denso de 4.200 millones de parametros con arquitectura multimodal unificada, capaz de procesar texto e imagenes de forma conjunta. Su entrenamiento integra aprendizaje por refuerzo a escala y tecnicas de eficiencia arquitectonica, segun la descripcion oficial de Qwen. El contexto nativo de 262.144 tokens permite manejar documentos extensos y conversaciones de multiples turnos sin truncamiento.

La cuantizacion FP8 (W8A8 dynamic) aplicada en esta version reduce los pesos y activaciones a 8 bits en punto flotante, con una escala dinamica calculada por capa durante la inferencia. Esta tecnica, implementada con llm-compressor, mantiene la precision de la cabeza de clasificacion para minimizar la degradacion en la distribucion de probabilidades de salida. No se ha publicado informacion sobre el dataset de entrenamiento especifico del modelo base ni sobre el proceso de cuantizacion mas alla de la herramienta utilizada.

## Capacidades

- Generacion de texto y razonamiento: el modelo base es capaz de tareas de lenguaje natural, incluyendo razonamiento complejo, aunque la cuantizacion FP8 puede introducir ligeras perdidas en tareas de logica avanzada.
- Comprension de imagenes: al ser multimodal, procesa entradas visuales junto con texto, permitiendo descripcion de imagenes, respuesta a preguntas visuales y razonamiento sobre contenido grafico.
- Ventana de contexto larga: con 262K tokens nativos, puede manejar documentos completos, libros o historiales de conversacion extensos sin perder informacion.
- Soporte de tool calling y agentes: no se ha confirmado explicitamente, pero los modelos Qwen3.5 suelen incluir capacidades de function calling; se recomienda verificar la documentacion oficial.
- Integracion con vLLM y transformers: la cuantizacion esta disenada para funcionar con vLLM, lo que facilita el despliegue en servidores de inferencia de alto rendimiento.
- Eficiencia de memoria: el formato FP8 reduce el uso de VRAM en comparacion con el modelo en BF16, permitiendo su ejecucion en GPUs de consumo.

## Casos de uso

- Asistentes virtuales con contexto largo: el modelo puede mantener conversaciones prolongadas con memoria de hasta 262K tokens, adecuado para chatbots de soporte tecnico o atencion al cliente que requieren recordar interacciones previas.
- Analisis de documentos extensos: su ventana de contexto permite resumir informes, contratos o articulos cientificos completos, extrayendo informacion clave sin segmentar el texto.
- Sistemas de vision artificial: al procesar imagenes, puede integrarse en aplicaciones de descripcion automatica de fotografias, moderacion de contenido visual o asistencia para personas con discapacidad visual.
- Generacion de codigo asistida: aunque no se ha validado con benchmarks especificos, un modelo de 4B con razonamiento puede ayudar en tareas de programacion, especialmente en entornos con recursos limitados.
- Despliegue en edge computing: con un peso de 4.9 GB, es viable en dispositivos con GPUs de 8-16 GB de VRAM, como laptops gaming o mini-PCs, para aplicaciones de IA local sin conexion a la nube.
- Prototipado rapido en investigacion: la integracion con vLLM permite probar hipotesis de interaccion multimodal y evaluar el rendimiento de cuantizaciones FP8 en entornos academicos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks especificos para esta cuantizacion FP8 en la informacion disponible. El modelo base Qwen3.5-4B ha sido evaluado por Alibaba en tareas de lenguaje y vision, pero no se dispone de datos numericos concretos en las fuentes consultadas. Se recomienda consultar la documentacion oficial de Qwen para obtener resultados comparativos del modelo sin cuantizar.

## Requisitos de hardware

- VRAM estimada: el modelo en FP8 ocupa aproximadamente 4.9 GB en disco; durante la inferencia se requiere un margen adicional para activaciones y cache de contexto, estimandose un minimo de 8 GB de VRAM para cargar el modelo completo.
- GPU recomendadas: RTX 4060 Ti 16 GB, RTX 4070, RTX 4090, A100 (cualquier capacidad), H100. Es compatible con GPUs consumer de 16 GB para el contexto completo.
- Si cabe en consumer GPU: si, en GPUs con 16 GB de VRAM o mas. Con cuantizaciones adicionales (por ejemplo, 4-bit) cabria en 8 GB, pero esta version solo ofrece FP8.
- Opciones de despliegue: vLLM (recomendado, con soporte nativo), transformers (carga directa con `torch_dtype="auto"`), tambien puede usarse con llama.cpp si se convierte a GGUF, aunque no se ha verificado.
- Latencia y throughput: no disponible; dependera del hardware y de la configuracion de vLLM (tamano de batch, numero de GPUs).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Vision | Licencia | Formato |
|---|---|---|---|---|---|
| Qwen3.5-4B (base) | 4,2B | 262K | Si | apache-2.0 | safetensors (BF16) |
| mahadev9/Qwen3.5-4B-fp8 | 4,2B | 262K | Si | no disponible | safetensors (FP8) |
| Shashwat42/Qwen3.5-4B-FP8 | 4,2B | 262K | Si | apache-2.0 | safetensors (FP8) |
| Qwen3-4B (generacion anterior) | 4B | 32K | No | apache-2.0 | safetensors |

La diferencia principal entre las dos cuantizaciones FP8 (mahadev9 y Shashwat42) radica en la configuracion de cuantizacion y el proceso de calibracion; ambas usan W8A8, pero pueden variar en la precision de `lm_head` y en los detalles de implementacion. El modelo base ofrece una ventana de contexto muy superior a generaciones anteriores de Qwen, lo que lo hace especialmente adecuado para tareas de documento largo.

## Limitaciones y advertencias

- La cuantizacion FP8 puede degradar el rendimiento en tareas de razonamiento complejo, matematicas avanzadas o generacion de codigo extenso, en comparacion con el modelo en BF16.
- No se ha confirmado el soporte de tool calling ni de agentes en esta version; es necesario verificar la documentacion del modelo base.
- Los idiomas soportados no estan documentados; aunque Qwen suele cubrir ingles y chino, no hay garantia de cobertura para otros idiomas.
- La licencia no esta especificada en la ficha del repositorio; aunque el modelo base usa apache-2.0, se recomienda consultar al autor antes de un uso comercial.
- El modelo puede alucinar en tareas de vision si las imagenes son ambiguas o de baja resolucion, ya que es un modelo compacto de 4B.
- No se han publicado evaluaciones de seguridad ni de sesgos; como modelo cuantizado, puede heredar sesgos del modelo base sin filtros adicionales.
- Para produccion, se recomienda validar el rendimiento con datos propios y considerar el uso de tecnicas de mitigacion de alucinaciones.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/mahadev9/Qwen3.5-4B-fp8
- Modelo base Qwen/Qwen3.5-4B: https://huggingface.co/Qwen/Qwen3.5-4B
- Coleccion oficial Qwen3.5: https://huggingface.co/collections/Qwen/qwen35
- Pagina de ThinkLLM sobre Qwen3.5 4B FP8: https://thinkllm.dev/models/qwen3-5-4b-fp8
- Recetas vLLM para Qwen3.5-4B: https://recipes.vllm.ai/Qwen/Qwen3.5-4B
- Ficha en LM Studio: https://lmstudio.ai/models/qwen/qwen3.5-4b
