# Neurobrix/Qwen3-VL-30B-A3B-Thinking-nbx

## Resumen

Neurobrix/Qwen3-VL-30B-A3B-Thinking-nbx es una distribucion del modelo multimodal Qwen3-VL-30B-A3B-Thinking de Alibaba Qwen, reempaquetado por Neurobrix para su propio runtime de inferencia local basado en Triton. El modelo base es un transformer de tipo Mixture-of-Experts (MoE) con 30 mil millones de parametros totales y aproximadamente 3 mil millones activos por token, capaz de procesar entradas de imagen y texto y generar respuestas con modo de razonamiento explicito (thinking).

La propuesta de este repositorio no es un fine-tune nuevo, sino una conversion del checkpoint original a un formato propietario (`nbx`) optimizado para el motor de Neurobrix, orientado a despliegue local con aceleracion Triton. Por tanto, conserva las capacidades del modelo base: comprension de imagenes, razonamiento multi-paso, generacion de codigo y soporte multilingue amplio, pero cambia el stack de ejecucion respecto a las alternativas estandar (transformers, vLLM, llama.cpp).

Es relevante para equipos que quieran ejecutar un modelo vision-language de 30B con activacion dispersa en hardware propio y que esten dispuestos a adoptar el runtime de Neurobrix. El acceso esta restringido (gated) y requiere aceptar las condiciones en Hugging Face. La licencia declarada es Apache 2.0, heredada del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer Mixture-of-Experts (MoE) multimodal (vision + lenguaje), segun modelo base Qwen3-VL |
| Parametros totales | 30B (aproximado, segun nomenclatura del modelo base) |
| Parametros activos | ~3B por token (MoE, segun nomenclatura A3B) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | no disponible; el repositorio distribuye pesos en formato propietario nbx |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | nbx (formato propietario del runtime Neurobrix, basado en Triton) |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura del Qwen3-VL-30B-A3B-Thinking: un transformer con capas MoE en las que se activan aproximadamente 3B parametros por token de un total de 30B, lo que reduce el coste computacional por inferencia frente a un modelo denso equivalente. Incorpora un codificador visual para entradas de imagen y un modo de razonamiento (thinking) que genera cadenas de pensamiento antes de la respuesta final. Los detalles exactos sobre numero de tokens de entrenamiento, composicion del dataset y etapas de alineacion (RLHF/DPO) no estan disponibles en la informacion proporcionada y deben consultarse en la model card del modelo base.

La aportacion especifica de Neurobrix es el reempaquetado de los pesos a formato `nbx` y la integracion con su libreria de inferencia local basada en kernels Triton. No se documenta en la informacion disponible si se han realizado ajustes adicionales, destilacion o cambios en los pesos mas alla de la conversion de formato. Tampoco se especifican innovaciones propias del runtime como decodificacion especulativa o atencion lineal; cualquier detalle de este tipo debe verificarse en la documentacion del proyecto Neurobrix.

## Capacidades

- Generacion de texto y razonamiento multi-paso con modo thinking explicito.
- Comprension de imagenes (image-text-to-text): descripcion, respuesta a preguntas visuales y extraccion de informacion de documentos o capturas.
- Generacion y explicacion de codigo en multiples lenguajes, segun las capacidades del modelo base Qwen3-VL.
- Razonamiento matematico y resolucion de problemas con pasos intermedios.
- Soporte multilingue amplio (heredado del modelo base; la lista concreta de idiomas no esta disponible en la informacion proporcionada).
- Capacidad potencial de tool calling y uso en agentes, supeditada a que el runtime Neurobrix exponga dichas interfaces (no confirmado en la informacion disponible).
- Ejecucion local sobre GPUs con aceleracion Triton mediante la libreria `neurobrix`.

## Casos de uso

- Analisis de documentos escaneados y facturas: el modelo recibe la imagen y devuelve campos estructurados o resumenes, aprovechando su naturaleza vision-language y el modo thinking para tareas de extraccion con verificacion.
- Asistencia en soporte tecnico con capturas de pantalla: el usuario adjunta una imagen de un error y el modelo razona sobre la causa probable y los pasos de resolucion, con contexto multi-turno.
- Revision de codigo a partir de diagramas o capturas de IDE: util para equipos que documentan incidencias con imagenes y necesitan explicaciones tecnicas detalladas.
- Prototipado de agentes multimodales en local: al ejecutarse con el runtime Neurobrix sobre GPUs propias, permite iterar en flujos de agente sin depender de APIs externas ni enviar datos sensibles a terceros.
- Educacion y tutoria asistida: explicacion paso a paso de problemas matematicos o cientificos a partir de fotografias de enunciados, con cadenas de razonamiento visibles para el estudiante.
- Investigacion en interpretabilidad del razonamiento: el modo thinking permite analizar las cadenas intermedias generadas por un MoE multimodal de 30B en entornos controlados y reproducibles.
- Automatizacion de catalogos de producto: generacion de descripciones y etiquetas a partir de imagenes, con salida en varios idiomas si el modelo base los soporta.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no incluye tablas de evaluacion propias ni comparaciones con el checkpoint original; para cifras de MMLU, HumanEval, GSM8K o benchmarks multimodales debe consultarse la model card de Qwen/Qwen3-VL-30B-A3B-Thinking.

## Requisitos de hardware

- VRAM estimada: no disponible de forma oficial. Como referencia orientativa para un MoE de 30B, la inferencia en precision completa requiere del orden de 60 GB o mas, mientras que una cuantizacion a 4 bits reduciria el requisito a aproximadamente 18-20 GB, aunque el repositorio no distribuye pesos GGUF ni cuantizaciones estandar.
- El repositorio ocupa 62,1 GB, lo que sugiere pesos en precision de 16 bits o similar; el espacio en disco necesario para descargarlo es de al menos esa cifra.
- GPU recomendadas: no especificadas por el autor. Por tamano, cabria esperar GPUs de datacenter (A100 80 GB, H100) o configuraciones multi-GPU para precision completa; en consumer, una RTX 4090 (24 GB) solo seria viable con cuantizacion, que no esta documentada en este repositorio.
- Opciones de despliegue: la libreria `neurobrix` con backend Triton es el unico mecanismo soportado segun los metadatos. No se confirma compatibilidad con vLLM, llama.cpp, Ollama o TGI para el formato nbx.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato / despliegue | Notas |
|---|---|---|---|---|---|
| Neurobrix/Qwen3-VL-30B-A3B-Thinking-nbx | 30B totales, ~3B activos | no disponible | Apache 2.0 | nbx, runtime Neurobrix (Triton) | Conversion del modelo Qwen; acceso gated |
| Qwen/Qwen3-VL-30B-A3B-Thinking | 30B totales, ~3B activos | no disponible en esta ficha | Apache 2.0 | safetensors, transformers/vLLM | Modelo base original, ecosistema estandar |
| Qwen2.5-VL-32B-Instruct | 32B densos | no disponible en esta ficha | Apache 2.0 | safetensors, amplio soporte | Alternativa densa de tamano similar; mayor coste por token al no ser MoE |
| Llama 3.2 90B Vision | 90B | no disponible en esta ficha | Llama license | safetensors | Mayor capacidad pero requisitos de hardware muy superiores |

La comparativa se limita a caracteristicas estructurales; no hay datos de rendimiento publicados en la informacion disponible para establecer diferencias cuantitativas.

## Limitaciones y advertencias

- Acceso restringido: el repositorio es gated y requiere aceptar condiciones en Hugging Face antes de la descarga.
- Formato propietario: los pesos en `nbx` solo son utilizables con la libreria `neurobrix`; no hay garantia de compatibilidad con herramientas estandar del ecosistema (transformers, vLLM, llama.cpp).
- Dependencia de un runtime de terceros: el rendimiento y la estabilidad dependen del mantenimiento del proyecto Neurobrix, con menor comunidad que las alternativas consolidadas.
- Riesgo de alucinacion inherente a los modelos generativos, especialmente en tareas de extraccion de datos de imagenes y en razonamiento largo.
- Sesgos: no documentados en la informacion disponible; deben asumirse los del modelo base Qwen3-VL.
- Idiomas: la lista de idiomas soportados no esta disponible en este repositorio; conviene verificar el comportamiento en castellano contra el modelo base.
- Licencia: Apache 2.0 permite uso comercial, pero al ser una redistribucion conviene revisar los terminos del modelo base y del runtime Neurobrix antes de desplegar en produccion.
- Sin benchmarks propios publicados: no hay evidencia en este repositorio de que la conversion preserve exactamente el rendimiento del checkpoint original.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Neurobrix/Qwen3-VL-30B-A3B-Thinking-nbx
- Modelo base: https://huggingface.co/Qwen/Qwen3-VL-30B-A3B-Thinking
- Organizacion Qwen en Hugging Face: https://huggingface.co/Qwen
