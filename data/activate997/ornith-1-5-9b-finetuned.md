# Activate997/ornith-1.5-9b-finetuned

## Resumen

Activate997/ornith-1.5-9b-finetuned es un ajuste fino (fine-tuning) del modelo ornith-ai/Ornith-1.5-9B, publicado por el usuario Activate997 en HuggingFace. Se trata de un derivado de 9.653.104.368 parámetros (aproximadamente 9,65 mil millones), distribuido en formato safetensors con un repositorio de 19,3 GB, lo que es coherente con pesos en precisión bf16/fp16. La model card es mínima: indica que el entrenamiento se realizó con Unsloth y la librería TRL de HuggingFace, y que el modelo base es Ornith-1.5-9B.

El pipeline declarado es `image-text-to-text`, lo que sitúa al modelo en la categoría de modelos multimodales de visión y lenguaje (entrada de imagen y texto, salida de texto). Entre las etiquetas figura `qwen3_5`, lo que apunta a que el modelo base pertenece a la familia Qwen 3.5, si bien no se proporciona documentación técnica que lo confirme ni detalles sobre la arquitectura interna, la longitud de contexto o la composición del dataset de ajuste.

La relevancia de esta ficha es limitada pero ilustrativa: se trata de un derivado de peso medio (9,65B) con licencia Apache 2.0, orientado a un único idioma (inglés) y con cero descargas y cero valoraciones en el momento de la consulta. No se han publicado benchmarks, detalles de entrenamiento ni datos de rendimiento, por lo que cualquier evaluación debe realizarse de forma empírica por parte de quien lo despliegue.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (la etiqueta `qwen3_5` sugiere familia Qwen 3.5; sin confirmar en la documentacion) |
| Parametros totales | 9.653.104.368 (9,65B) |
| Parametros activos | no aplica (no hay indicios de arquitectura MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (solo se distribuyen pesos safetensors; no se publican variantes GGUF, AWQ ni GPTQ) |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |
| Pipeline | image-text-to-text (multimodal vision-lenguaje) |
| Tamano del repositorio | 19,3 GB |
| Modelo base | ornith-ai/Ornith-1.5-9B |
| Libreria | transformers |

## Arquitectura y entrenamiento

No se dispone de informacion tecnica detallada sobre la arquitectura interna del modelo. La etiqueta `qwen3_5` asociada al repositorio y a la model card indica que el modelo base ornith-ai/Ornith-1.5-9B podria derivar de la familia Qwen 3.5, y el pipeline `image-text-to-text` confirma que se trata de un modelo multimodal con capacidad de procesar imagenes y texto. El recuento de parametros (9.653.104.368) y el tamano del repositorio (19,3 GB) son compatibles con pesos almacenados en bf16 o fp16, sin cuantizacion. No se especifica si la arquitectura emplea atencion completa, atencion lineal, mezcla de expertos (MoE) o un esquema hibrido.

En cuanto al entrenamiento, la model card unicamente indica que el ajuste se realizo con Unsloth y la libreria TRL de HuggingFace, lo que sugiere un fine-tuning supervisado (SFT) o posiblemente con optimizacion por preferencias, aunque no se detalla el metodo. No se publican datos sobre el numero de tokens de entrenamiento, la composicion del dataset, el uso de RLHF o DPO, ni hiperparametros relevantes. Tampoco se documenta ninguna innovacion tecnica adicional (decodificacion especulativa, atencion lineal, destilacion u otras).

## Capacidades

- Generacion de texto conversacional en ingles, segun la etiqueta `conversational` y el pipeline declarado.
- Procesamiento conjunto de imagen y texto (`image-text-to-text`), lo que implica capacidad de responder a instrucciones que incluyan una o varias imagenes.
- Compatibilidad con `text-generation-inference` (TGI) y con `endpoints_compatible`, lo que facilita su despliegue como endpoint de inferencia.
- Soporte de fine-tuning adicional mediante Unsloth y TRL, ya que el modelo se publica en formato transformers estandar.
- Capacidades de tool calling / function calling: no disponibles en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Modo de razonamiento explicito (thinking mode): no disponible en la informacion proporcionada.
- Capacidades multilingues: limitadas al ingles segun el campo `language: en`.
- Capacidades de audio o video: no disponibles.

## Casos de uso

- Descripcion automatica de imagenes en ingles: el modelo puede recibir una imagen y generar una descripcion textual o un resumen de su contenido, aprovechando el pipeline `image-text-to-text`.
- Respuesta a preguntas visuales (VQA) en entornos de investigacion: dado un par imagen-pregunta, el modelo puede producir una respuesta en ingles, util para prototipos de asistencia visual.
- Extraccion de informacion de documentos escaneados: a partir de la imagen de un documento, el modelo puede transcribir o resumir su contenido, integrándose en flujos de digitalizacion.
- Base para fine-tuning especifico de dominio: al estar publicado en formato transformers con licencia Apache 2.0, puede reentrenarse con Unsloth y TRL sobre datos propios, por ejemplo para clasificacion de imagenes medicas o industriales con salida textual.
- Asistencia conversacional multimodal en ingles: integrado como endpoint TGI, puede gestionar dialogos en los que el usuario adjunta imagenes y espera respuestas textuales.
- Moderacion de contenido visual asistida: el modelo puede generar descripciones de imagenes que despues se filtran mediante reglas o clasificadores adicionales, como paso previo a una revision humana.
- Prototipado rapido de demos multimodales: al ser compatible con `endpoints_compatible` y TGI, permite levantar una demo funcional en pocas horas para validar una idea de producto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio de HuggingFace no incluye tabla de evaluacion alguna (MMLU, HumanEval, GSM8K, MMMU, VQAv2 u otros), y las busquedas web realizadas no devolvieron resultados relacionados con el modelo, sino contenido no pertinente (paginas de seguimiento de un vuelo comercial). En consecuencia, no es posible comparar su rendimiento con el de otros modelos de forma documentada.

## Requisitos de hardware

Las cifras siguientes son estimaciones calculadas a partir del numero de parametros (9,65B) y del tamano del repositorio (19,3 GB); no proceden de documentacion oficial del autor.

- VRAM para inferencia en bf16/fp16: aproximadamente 19-20 GB solo para los pesos, mas 1-3 GB de activaciones y cache KV segun la longitud de contexto, lo que situa el total en torno a 22-26 GB.
- VRAM para inferencia en int8: aproximadamente 10-11 GB de pesos, con un total estimado de 12-14 GB.
- VRAM para inferencia en int4: aproximadamente 5-6 GB de pesos, con un total estimado de 7-9 GB. Al tratarse de un modelo multimodal, hay que sumar la memoria del codificador visual, cuyo tamano no se especifica.
- GPU recomendadas para bf16: A100 40/80 GB, H100 80 GB, L40S 48 GB. En una RTX 4090 (24 GB) el margen es muy ajustado y puede requerir reducir el contexto o aplicar offloading.
- GPU de consumo: cabe con holgura en RTX 4090, RTX 3090 y RTX 4080 en cuantizacion int8 o int4; en RTX 3060 12 GB o RTX 4070 12 GB seria necesario int4 y una gestion cuidadosa del contexto.
- Opciones de despliegue: `transformers` (confirmado por la libreria declarada), Text Generation Inference (TGI, confirmado por la etiqueta `text-generation-inference` y `endpoints_compatible`). vLLM, llama.cpp y Ollama no estan confirmados y, en el caso de llama.cpp y Ollama, requeririan convertir los pesos a GGUF, conversion que no se distribuye.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Rendimiento |
|---|---|---|---|---|---|
| Activate997/ornith-1.5-9b-finetuned | 9,65B | no disponible | apache-2.0 | HuggingFace, safetensors | sin benchmarks publicados |
| ornith-ai/Ornith-1.5-9B (modelo base) | no disponible | no disponible | no disponible | HuggingFace | sin datos en la informacion proporcionada |
| Alternativas de ~9B multimodales | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de informacion verificada sobre modelos alternativos de la misma categoria en el material proporcionado, por lo que no es posible establecer una comparativa cuantitativa fiable. Las busquedas web realizadas no devolvieron resultados utiles sobre este modelo ni sobre su modelo base.

## Limitaciones y advertencias

- Idiomas: el campo `language` solo declara ingles (`en`). El rendimiento en castellano u otros idiomas no esta documentado y probablemente sea deficiente.
- Sesgos: no hay informacion sobre la composicion del dataset de ajuste ni sobre evaluaciones de sesgo. Al ser un modelo multimodal, existe riesgo de sesgos visuales y culturales no medidos.
- Alucinacion: no se han publicado evaluaciones de fidelidad. En tareas de descripcion de imagenes y VQA, el riesgo de generar contenido no presente en la imagen es relevante y no ha sido cuantificado.
- Limitaciones de contexto: se desconoce la longitud de contexto soportada, lo que impide planificar despliegues con documentos largos o conversaciones extensas.
- Restricciones de licencia: la licencia declarada es Apache 2.0, que permite uso comercial, pero el modelo base (ornith-ai/Ornith-1.5-9B) no declara licencia en la informacion disponible; conviene verificar los terminos del modelo base antes de un uso comercial.
- Madurez: el repositorio registra 0 descargas y 0 valoraciones en el momento de la consulta, sin historial de uso ni validacion por parte de la comunidad.
- Documentacion: la model card es practicamente vacia. No hay informacion sobre hiperparametros, dataset, metodologia de evaluacion ni limitaciones declaradas por el autor.
- Trazabilidad: el autor del ajuste (Activate997) es un usuario individual y no se documenta el proceso de validacion del fine-tuning.
- Produccion: la ausencia de benchmarks, de datos de contexto y de cuantizaciones listas para usar hace desaconsejable su adopcion en produccion sin una evaluacion previa propia.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Activate997/ornith-1.5-9b-finetuned
- Modelo base: https://huggingface.co/ornith-ai/Ornith-1.5-9B
- Repositorio de Unsloth (herramienta de entrenamiento citada): https://github.com/unslothai/unsloth
- Resultados de busqueda web: no se encontro ningun enlace relevante sobre el modelo; las busquedas devolvieron paginas de seguimiento de vuelos (flightradar24.com, flightaware.com, airportinfo.live) sin relacion con el modelo.
