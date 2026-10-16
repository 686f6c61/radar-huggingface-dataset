# kalyan-ks/Ammu-1.0-OffOnTopic-Guardrail-small

## Resumen

Ammu-1.0-OffOnTopic-Guardrail-small es un modelo de clasificacion de texto publicado en HuggingFace por el usuario kalyan-ks. Por su nombre y por la etiqueta de pipeline (`text-classification`), esta disenado como un clasificador de guardrail que distingue entre consultas o mensajes dentro de tema (on-topic) y fuera de tema (off-topic), presumiblemente para filtrar entradas en sistemas conversacionales o pipelines de recuperacion. El repositorio tiene 0 descargas y 0 "likes" en el momento de la consulta, por lo que se trata de una publicacion reciente y sin adopcion documentada.

El dato tecnico mas solido disponible es el recuento de parametros leido de los pesos en safetensors: 68.408.322 parametros, con un tamano de repositorio de 0,3 GB. La etiqueta `modernbert` indica que se apoya en la familia de codificadores ModernBERT, aunque la model card no confirma explicitamente la arquitectura base ni el checkpoint del que deriva.

La relevancia de este modelo es limitada a dia de hoy: la model card es la plantilla automatica de HuggingFace con la mayoria de campos marcados como "[More Information Needed]", no se declara licencia, no se declaran idiomas y no hay resultados de evaluacion. Cualquier evaluacion seria exige inspeccionar los pesos y el tokenizador del repositorio antes de considerarlo para produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (la etiqueta del repositorio indica `modernbert`, familia de codificadores transformer; no confirmado en la model card) |
| Parametros totales | 68.408.322 (recuento real de safetensors) |
| Parametros activos | no aplica (no hay indicios de arquitectura MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el repositorio solo publica safetensors; no se documentan variantes GGUF, GPTQ, AWQ ni ONNX) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (libreria declarada: transformers) |

Datos adicionales verificables del repositorio: tamano 0,3 GB, tarea declarada `text-classification`, compatible con `text-embeddings-inference` y con endpoints de HuggingFace, region `us`, creado y actualizado el 2026-10-16.

## Arquitectura y entrenamiento

No hay informacion publicada sobre la arquitectura concreta, el objetivo de entrenamiento ni la composicion del dataset. La unica evidencia es la etiqueta `modernbert` del repositorio, que situaria el modelo en la familia ModernBERT: codificadores transformer con atencion alterna (global y local) y soporte de secuencias largas, preentrenados sobre corpus de texto y codigo. Los 68,4 millones de parametros son coherentes con una variante pequena de esa familia, pero el autor no especifica el checkpoint base ni si hubo destilacion o inicializacion desde cero.

Tampoco se documenta el regimen de entrenamiento: no se indica si hubo ajuste fino supervisado, DPO, RLHF ni tecnicas de calibracion de umbral para la tarea de clasificacion binaria on-topic/off-topic. El unico enlace tecnico presente en los metadatos, `arxiv:1910.09700`, corresponde a Lacoste et al. (2019) sobre estimacion de emisiones de carbono y aparece citado en la plantilla automatica de la model card; no es un articulo sobre este modelo.

## Capacidades

- Clasificacion de texto: la tarea declarada es `text-classification`, con un unico foco aparente en la discriminacion on-topic frente a off-topic.
- Etiquetado binario de guardrail: por el nombre del modelo, se espera que devuelva una etiqueta que permita bloquear o admitir una entrada antes de pasarla a un LLM.
- Integracion como clasificador en `transformers` y en `text-embeddings-inference`, segun los tags del repositorio.
- Generacion de texto: no disponible; al ser un modelo de clasificacion, no se espera capacidad generativa.
- Razonamiento multi-paso y agentes: no disponible.
- Tool calling / function calling: no disponible.
- Capacidades multilingues: no disponible; no se declaran idiomas.
- Vision, audio o modo "thinking": no disponible.

## Casos de uso

Advertencia previa: al no existir documentacion funcional, los siguientes escenarios son aplicaciones plausibles de un clasificador de tematica, no capacidades verificadas del modelo.

- Filtrado previo en pipelines RAG: colocar el clasificador delante del recuperador para descartar consultas fuera de dominio y evitar que el sistema recupere fragmentos irrelevantes. Un clasificador de 68 millones de parametros es adecuado para este papel por su coste computacional minimo frente al coste de una llamada a un LLM.
- Moderacion de entrada en chatbots de atencion al cliente: etiquetar como off-topic los mensajes ajenos al catalogo de soporte (por ejemplo, consultas legales o personales) y derivarlos a un flujo humano en lugar de consumir tokens del modelo generativo.
- Enrutado de consultas (query routing): usar la etiqueta del clasificador para decidir si una peticion va al modelo especializado de dominio o a un modelo generalista, reduciendo latencia media del sistema.
- Control de calidad de datos sinteticos: filtrar grandes volumenes de conversaciones generadas automaticamente para conservar solo las que permanecen dentro del tema objetivo antes de usarlas en ajuste fino.
- Guardrail en sistemas de agentes: interceptar entradas del usuario antes de que lleguen al planificador del agente, evitando que instrucciones fuera de alcance desencadenen llamadas a herramientas no deseadas.
- Auditoria y cumplimiento: clasificar retrospectivamente transcripciones de soporte para medir que porcentaje de interacciones se sale del ambito autorizado y documentar el hallazgo.
- Filtrado de busqueda interna: descartar consultas ajenas al corpus documental de una organizacion antes de ejecutar la busqueda vectorial.
- Clasificacion de alto rendimiento en streaming: por su tamano reducido, puede desplegarse sobre CPU o GPU pequena y procesar lotes grandes por segundo, si bien no se han publicado cifras de throughput.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card incluye la seccion de evaluacion con todos los campos marcados como "[More Information Needed]" y no se han encontrado articulos, blogs ni repositorios asociados al modelo. No se dispone por tanto de exactitud, F1, precision ni recall sobre ningun conjunto de validacion, ni de comparaciones con otros clasificadores de guardrail.

## Requisitos de hardware

- VRAM estimada para los pesos, calculada a partir de los 68.408.322 parametros declarados en safetensors:
  - fp32: aproximadamente 0,27 GB.
  - fp16 / bf16: aproximadamente 0,14 GB.
  - int8: aproximadamente 0,07 GB.
  - int4: aproximadamente 0,03 GB.
  - A estas cifras hay que sumar el overhead de activaciones, memoria del tokenizador y buffers del runtime; en la practica, un presupuesto de 1 a 2 GB de VRAM cubre con holgura la inferencia en precision completa para lotes moderados.
- GPU recomendadas: no hay recomendacion oficial. Por tamano, cualquier GPU con al menos 2 GB de VRAM es suficiente, incluidas GTX 1650, RTX 3050, RTX 4090, A100 o H100. El modelo tambien es viable en CPU.
- Cabe en GPU de consumo: si, con margen amplio, en practicamente cualquier GPU de consumo moderna e incluso en hardware integrado.
- Opciones de despliegue: transformers como libreria principal; text-embeddings-inference segun los tags; endpoints de HuggingFace segun el tag `endpoints_compatible`. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, y al ser un codificador de clasificacion no cabe esperar soporte de llama.cpp u Ollama sin conversion adicional.
- Latencia y throughput estimados: no disponible. No se han publicado mediciones.

## Comparativa con modelos similares

No se dispone de datos verificados de modelos comparables dentro de la informacion proporcionada, por lo que la comparativa cuantitativa no puede realizarse. La tabla recoge unicamente el dato confirmado de este modelo.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| kalyan-ks/Ammu-1.0-OffOnTopic-Guardrail-small | 68.408.322 | no disponible | no disponible | HuggingFace, 0 descargas |
| Alternativas de la misma categoria (clasificadores de guardrail y codificadores pequenos) | no disponible | no disponible | no disponible | no disponible |

Cualquier comparacion con otros clasificadores de tematica o de seguridad requiere ejecutar ambos modelos sobre un conjunto de evaluacion comun, que en este caso no existe ni para el modelo analizado.

## Limitaciones y advertencias

- Ausencia total de documentacion: la model card es la plantilla automatica sin rellenar, sin descripcion, sin datos de entrenamiento y sin ejemplos de uso.
- Licencia no declarada: sin licencia explicita no hay autorizacion clara para uso comercial ni para redistribucion; hay que contactar con el autor antes de integrarlo en un producto.
- Idiomas no declarados: se desconoce si el modelo funciona en castellano, en ingles o en otros idiomas, lo que impide evaluar su utilidad para un despliegue en espanol.
- Riesgo de sesgo desconocido: al no publicarse la composicion del dataset ni la estrategia de muestreo, no puede evaluarse el sesgo por dominio, registro o variedad dialectal.
- Riesgo de falsos positivos y falsos negativos en el guardrail: un clasificador de tematica mal calibrado puede bloquear consultas legitimas o dejar pasar entradas fuera de ambito; no se ha publicado informacion sobre umbrales ni curvas precision-recall.
- Contexto maximo desconocido: si la arquitectura es ModernBERT, la familia admite secuencias largas, pero no hay confirmacion en el repositorio y el limite real del modelo es indeterminado.
- Sin adopcion ni validacion externa: 0 descargas y 0 "likes" implican que no existen informes independientes de comportamiento en produccion.
- Trazabilidad limitada: no se identifica el checkpoint base ni la procedencia de los datos, lo que dificulta la reproduccion de resultados.
- Los resultados de la busqueda web asociados a esta consulta corresponden a herramientas de medicion de velocidad de conexion y no aportan ninguna informacion tecnica sobre el modelo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/kalyan-ks/Ammu-1.0-OffOnTopic-Guardrail-small
- Referencia citada en la plantilla de la model card (Lacoste et al., 2019, sobre emisiones de carbono): https://arxiv.org/abs/1910.09700
- Calculadora de impacto medioambiental enlazada en la plantilla: https://mlco2.github.io/impact#compute
- Repositorio de codigo: no disponible
- Articulo o paper del modelo: no disponible
- Demo: no disponible
- No se han encontrado enlaces adicionales relevantes en la busqueda web.
