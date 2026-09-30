# murilodias123/apollo-spark-1.1

## Resumen

Apollo Spark 1.1 es un ajuste fino conversacional publicado por el usuario murilodias123 en Hugging Face bajo el identificador `murilodias123/apollo-spark-1.1`. El repositorio contiene 494.032.768 parámetros (aproximadamente 0,49 mil millones) en formato safetensors, con un tamano total de 1,0 GB. Las etiquetas del repositorio indican que esta construido sobre la arquitectura Qwen2 y que se ha entrenado mediante tecnicas de ajuste por preferencias, concretamente ORPO (Odds Ratio Preference Optimization) implementado con la libreria TRL.

El modelo se presenta como un modelo de generacion de texto de proposito conversacional, compatible con text-generation-inference y con endpoints de inferencia gestionada. Por su tamano, se situa en la categoria de modelos pequenos, disenados para ejecutarse en hardware de consumo o incluso en CPU, lo que lo hace interesante para prototipado rapido, asistentes embebidos y experimentacion con tecnicas de alineacion sobre arquitecturas compactas.

La relevancia actual de este tipo de publicaciones es doble. Por un lado, demuestra que el flujo de ajuste por preferencias (ORPO) es accesible con recursos limitados y ya no esta restringido a modelos de gran escala. Por otro, conviene advertir que la model card del autor es una plantilla automatica sin contenido sustantivo: no se documentan datos de entrenamiento, licencia, idiomas ni resultados de evaluacion, lo que limita seriamente su uso en produccion sin una validacion previa por parte del integrador.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only, familia Qwen2 (segun etiquetas del repositorio) |
| Parametros totales | 494.032.768 (aprox. 0,49 mil millones) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible en la model card (la arquitectura Qwen2 base admite hasta 32.768 tokens) |
| Tipos de cuantizacion | no disponible (no se publican versiones GGUF, AWQ, GPTQ ni similares) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |
| Tamano del repositorio | 1,0 GB |
| Libreria de inferencia | transformers |
| Pipeline declarado | text-generation |
| Metodo de ajuste declarado | ORPO (via TRL) |

## Arquitectura y entrenamiento

La etiqueta `qwen2` indica que el modelo parte de la familia Qwen2, una arquitectura transformer decoder-only con atencion causal, normalizacion RMSNorm, activaciones SwiGLU, sesgo de atencion por consulta (QKV bias) y embeddings de tokens ligados a la capa de salida. El recuento exacto de parametros, 494.032.768, coincide con la configuracion del checkpoint Qwen2 de 0,5 mil millones de parametros, por lo que es razonable asumir que se trata de un ajuste fino de dicho checkpoint base, aunque el autor no lo confirma explicitamente en la model card.

Respecto al entrenamiento, las etiquetas `trl` y `orpo` apuntan a un ajuste supervisado seguido de optimizacion de preferencias con ORPO, un metodo monolitico que combina la perdida de ajuste supervisado con un termino de razon de probabilidades entre respuestas elegidas y rechazadas, eliminando la necesidad de un modelo de referencia separado como ocurre en DPO. No se especifican en la informacion disponible el numero de tokens de entrenamiento, la composicion del dataset, el regimen numerico (fp16, bf16, fp8) ni la existencia de fases adicionales de RLHF. Tampoco se documentan innovaciones tecnicas propias.

## Capacidades

- Generacion de texto conversacional multi-turno, segun la etiqueta `conversational` y el pipeline `text-generation`.
- Ajuste orientado a preferencias humanas mediante ORPO, lo que en teoria mejora la calidad de las respuestas frente al modelo base en tareas de dialogo.
- Integracion con el ecosistema transformers y compatibilidad declarada con text-generation-inference y endpoints compatibles.
- Capacidades multilingues: no disponibles como dato confirmado; el modelo base Qwen2 es multilingue, pero no hay constancia de que el ajuste fino haya preservado esa cobertura.
- Soporte de tool calling o function calling: no documentado.
- Capacidades de agente o razonamiento multi-paso: no documentadas.
- Modo "thinking", vision, audio u otras capacidades especiales: no documentadas.
- Generacion de codigo o matematicas: no documentada como capacidad especifica.

## Casos de uso

- Asistente conversacional ligero en produccion de bajo coste: con 494 millones de parametros, el modelo cabe en una unica GPU de consumo y permite desplegar un chatbot de soporte basico con un coste por token muy inferior al de modelos de mayor tamano, siempre que el dominio de las consultas este acotado.
- Enrutado de intenciones y clasificacion de consultas: puede utilizarse como primer eslabon de un pipeline de atencion al cliente para clasificar la peticion del usuario (facturacion, incidencia tecnica, baja, informacion) antes de derivarla a un modelo mayor o a un sistema de tickets, reduciendo el coste de inferencia en la capa de triaje.
- Inferencia en el borde (edge) y en dispositivos sin GPU: al ocupar aproximadamente 1 GB en bf16, es viable ejecutarlo en CPU o en acceleradores integrados dentro de aplicaciones de escritorio, herramientas internas o dispositivos tipo Raspberry Pi, sin depender de servicios en la nube.
- Generacion de datos sinteticos conversacionales: sirve para producir pares pregunta-respuesta de arranque que luego se filtran y se utilizan para entrenar o evaluar modelos mayores, aprovechando su bajo coste de generacion masiva.
- Investigacion en alineacion de modelos pequenos: es un caso de estudio util para comparar ORPO frente a DPO o SFT puro en modelos de menos de mil millones de parametros, midiendo el efecto sobre la calidad conversacional y la diversidad de respuestas.
- Base para ajustes de dominio con LoRA: dado su tamano reducido, un investigador puede especializarlo en un vertical concreto (legal, sanitario, atencion interna) con un presupuesto de GPU modesto, partiendo de este checkpoint ya alineado en lugar de un modelo base crudo.
- Preprocesado y reformateo de texto en pipelines ETL: tareas de reescritura, normalizacion de campos o resumen de fragmentos cortos donde la latencia y el coste importan mas que la profundidad de razonamiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del autor no incluye la seccion de evaluacion, no se han encontrado tablas comparativas en los resultados de busqueda y no existe ningun informe tecnico asociado al repositorio. Cualquier cifra de MMLU, HumanEval, GSM8K o MT-Bench para este modelo seria una invencion y no debe asumirse.

## Requisitos de hardware

- VRAM para los pesos: aproximadamente 1 GB en bf16 o fp16, unos 2 GB en fp32, en torno a 0,5 GB en cuantizacion de 8 bits y unos 0,25 GB en 4 bits (estas conversiones no estan publicadas y habria que generarlas).
- Memoria adicional para la cache KV: proporcional a la longitud de contexto y al tamano de lote; con el contexto nativo de la arquitectura Qwen2 (32.768 tokens) el consumo crece de forma notable aunque sigue siendo manejable en GPUs de gama media.
- GPU recomendadas: cualquier GPU con 4 GB o mas de VRAM es suficiente, incluidas RTX 3050, RTX 3060, RTX 4060, RTX 4090, A10, L4, A100 y H100. En GPUs profesionales el modelo queda limitado por el ancho de banda de memoria, no por la capacidad.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU de consumo de los ultimos ocho anos, e incluso en iGPU con memoria compartida si se cuantiza.
- Opciones de despliegue: transformers (soporte nativo declarado), text-generation-inference y endpoints compatibles con la API de inferencia gestionada. vLLM es compatible con la arquitectura Qwen2 y por tanto previsiblemente utilizable, aunque no esta declarado por el autor. Para llama.cpp u Ollama haria falta convertir los pesos a GGUF, conversion que no se distribuye en el repositorio.
- Latencia y throughput: no disponibles. No se han publicado mediciones de tokens por segundo ni de tiempo hasta el primer token en ninguna configuracion de hardware.

## Comparativa con modelos similares

Los datos de los modelos comparados provienen de su documentacion publica; los de apollo-spark-1.1, de la ficha de Hugging Face.

| Modelo | Parametros | Contexto | Licencia | Ajuste por preferencias | Disponibilidad |
|---|---|---|---|---|---|
| apollo-spark-1.1 | 494.032.768 | no disponible (base Qwen2: 32.768) | no disponible | ORPO (segun etiquetas) | Hugging Face, safetensors |
| Qwen2.5-0.5B | ~0,49 mil millones | 32.768 tokens | Apache 2.0 | no documentado | Hugging Face, safetensors y GGUF |
| SmolLM2-360M | ~0,36 mil millones | 8.192 tokens | Apache 2.0 | si (DPO) | Hugging Face, safetensors y GGUF |
| Qwen2-0.5B | ~0,49 mil millones | 32.768 tokens | Apache 2.0 | no documentado | Hugging Face, safetensors y GGUF |

La diferencia fundamental no es de arquitectura ni de tamano, sino de trazabilidad: los modelos de la comparativa publican licencia, idiomas, datos de entrenamiento y a menudo resultados de evaluacion, mientras que apollo-spark-1.1 no ofrece ninguno de esos elementos. A igualdad de parametros, un integrador que necesite garantias legales o reproducibilidad deberia decantarse por el checkpoint base de Qwen o por SmolLM2 antes que por este ajuste.

## Limitaciones y advertencias

- Licencia no disponible: al no declararse licencia, no existe autorizacion explicita de uso comercial. En la practica, esto equivale a tratar el modelo como no apto para produccion hasta que el autor aclare los terminos.
- Model card vacia: la ficha es la plantilla automatica de Hugging Face sin rellenar. No hay informacion sobre datos de entrenamiento, sesgos, idiomas ni limitaciones declaradas por el autor.
- Riesgo de alucinacion elevado: con menos de 500 millones de parametros, la tasa de invencion de hechos es estructuralmente alta, especialmente en preguntas factuales o de conocimiento abierto. No debe usarse como fuente de verdad sin verificacion externa.
- Sesgos desconocidos: al no documentarse la composicion del dataset de ajuste, no es posible auditar sesgos de genero, raza, religion o nacionalidad. Cualquier despliegue orientado al publico exige una evaluacion de sesgo previa.
- Cobertura idiomatica incierta: aunque el modelo base Qwen2 es multilingue, el ajuste ORPO puede haber degradado idiomas distintos del ingles o del chino si el corpus de preferencias era monolingue. No se especifica nada al respecto.
- Ausencia de benchmarks: no hay evidencia publicada de que el ajuste ORPO haya mejorado al modelo base. Podria haber degradado capacidades generales por sobreajuste al estilo conversacional (el conocido "alignment tax").
- Cero traccion en el repositorio: cero descargas y cero "me gusta" en el momento de la consulta, sin comunidad que haya validado el modelo ni reportado fallos.
- Riesgo de confusion nominal: existen modelos comerciales con nombres muy parecidos (por ejemplo, Muse Spark 1.1 de Meta) que no guardan ninguna relacion con este repositorio. Hay que verificar siempre el identificador completo `murilodias123/apollo-spark-1.1`.
- Sin cuantizaciones publicadas: no hay GGUF ni formatos optimizados, por lo que el despliegue en llama.cpp u Ollama requiere una conversion manual y su validacion posterior.
- Caveat de fecha: las marcas temporales del repositorio (creacion y actualizacion en septiembre de 2026) indican que se trata de una publicacion reciente y sin historial de mantenimiento.

## Enlaces

- Repositorio del modelo: https://huggingface.co/murilodias123/apollo-spark-1.1
- Version anterior del autor: https://huggingface.co/murilodias123/apollo-spark-1.0
- Otro repositorio del mismo autor: https://huggingface.co/murilodias123/apollo-ai
- Checkpoint base presumible: https://huggingface.co/Qwen/Qwen2-0.5B
- Informe tecnico de Qwen2: https://arxiv.org/abs/2407.10671
- Articulo de ORPO (Hong, Lee y Thorne): https://arxiv.org/abs/2403.07691
- Libreria TRL: https://github.com/huggingface/trl
- Referencia citada en las etiquetas (calculadora de impacto ambiental, Lacoste et al. 2019): https://arxiv.org/abs/1910.09700
- Documentacion de text-generation-inference: https://github.com/huggingface/text-generation-inference
