# hungvo304ml/gemma-2-2B-it-thinking-function_calling-V0

## Resumen

hungvo304ml/gemma-2-2B-it-thinking-function_calling-V0 es un ajuste fino (fine-tune) del modelo google/gemma-2-2b-it, publicado por el usuario hungvo304ml en HuggingFace. Se trata de un derivado de la familia Gemma 2 de Google, de aproximadamente 2.600 millones de parametros, orientado segun su nombre a dos capacidades concretas: un modo de razonamiento ("thinking") y la emision de llamadas a funciones (function calling). El entrenamiento se ha realizado mediante aprendizaje supervisado (SFT) con la libreria TRL de HuggingFace, no con RLHF ni DPO, segun la informacion de la model card.

El modelo resuelve, en teoria, el problema de disponer de un modelo pequeno que combine razonamiento explicito y tool calling en un unico artefacto desplegable en hardware modesto. Es relevante ahora porque los modelos de 1B-3B parametros se han convertido en la opcion por defecto para agentes locales, enrutadores de peticiones y asistentes en el borde (edge), donde el coste por token y la latencia importan mas que la precision bruta. La ventana de contexto heredada del modelo base es de 8.192 tokens, suficiente para tareas de agente de pocos pasos pero limitada para conversaciones largas.

Ahora bien, la model card publicada es practicamente vacia: no documenta dataset, hiperparametros, formato de las llamadas a funciones ni resultados de evaluacion. El repositorio registra 0 descargas y 0 likes en el momento de la consulta, y tanto la fecha de creacion declarada como las versiones de framework indicadas resultan dificiles de verificar. En consecuencia, esta ficha distingue de forma explicita entre aquello que consta en la informacion disponible y aquello que se deriva de la documentacion publica del modelo base.

## Especificaciones tecnicas

Las filas marcadas con (base) proceden de la documentacion publica de google/gemma-2-2b-it, no de la model card de este fine-tune; se incluyen porque el ajuste hereda esas caracteristicas, pero no han sido confirmadas por el autor.

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only con atencion alterna local (ventana deslizante) y global (base) |
| Parametros totales | ~2.600 millones (base) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | 8.192 tokens (base); no confirmado para el fine-tune |
| Tipos de cuantizacion | no disponible; el repositorio solo publica safetensors. No hay conversiones GGUF, AWQ o GPTQ publicadas por el autor |
| Idiomas soportados | no disponible en la ficha del fine-tune. El modelo base declara datos de entrenamiento en mas de 140 idiomas, con predominio del ingles (base) |
| Licencia | no disponible en los metadatos de HuggingFace (el campo aparece como "no disponible"). Al derivar de google/gemma-2-2b-it, queda sujeto a las Gemma Terms of Use del modelo base |
| Formato de pesos | safetensors |
| Modelo base | google/gemma-2-2b-it |
| Tipo de ajuste | SFT (supervised fine-tuning) con TRL |
| Tamano del repositorio | 2,5 GB |
| Libreria declarada | transformers |
| Fecha de creacion (metadato HF) | 2026-10-01 (fecha declarada; ver limitaciones) |

## Arquitectura y entrenamiento

La arquitectura no se describe en la model card del fine-tune. Por herencia del modelo base, se trata de un transformer decoder-only de tipo Gemma 2, que combina capas de atencion local con ventana deslizante y capas de atencion global de forma alterna, emplea normalizacion RMSNorm, activaciones GeGLU y soft-capping de logits. El modelo base de 2B fue destilado a partir de modelos mayores de la propia familia, y su tamano de vocabulario es notablemente grande, lo que concentra una parte relevante de los parametros en la matriz de embeddings. No hay informacion publicada que confirme si el fine-tune ha modificado esta configuracion, si ha ampliado el contexto o si ha anadido tokens especiales para el formato de llamadas a funciones.

En cuanto al entrenamiento, la unica informacion disponible es que se realizo con SFT usando TRL. La model card cita las versiones de framework empleadas (TRL 1.14.1, Transformers 5.18.0, PyTorch 2.7.1+cu126, Datasets 5.0.1, Tokenizers 0.23.2) pero no indica el numero de ejemplos, la composicion del dataset, la longitud de secuencia, el numero de epochs, la tasa de aprendizaje, ni si hubo una fase previa de razonamiento destilado. Tampoco se documenta el esquema de plantilla usado para el "thinking" ni para las llamadas a herramientas, que es precisamente el dato mas critico para integrar el modelo en produccion: sin conocer el formato exacto de salida, cualquier integracion requiere ingenieria inversa sobre las salidas del modelo.

## Capacidades

La siguiente lista separa lo que se puede afirmar con la informacion disponible de lo que el autor pretende con el nombre del modelo y no ha documentado:

- Generacion de texto conversacional instructivo: heredada del modelo base google/gemma-2-2b-it, que es un modelo ajustado con instrucciones.
- Razonamiento explicito ("thinking"): el nombre del modelo lo sugiere, pero no hay documentacion, ejemplos de prompt ni evaluaciones que confirmen un modo de razonamiento diferenciado ni como activarlo.
- Llamada a funciones (function calling): igualmente sugerida por el nombre, sin especificacion del esquema JSON, del tokenizador de herramientas ni de los casos cubiertos.
- Soporte de agentes y razonamiento multi-paso: no disponible como dato confirmado; dependeria del formato de tool calling no documentado.
- Capacidades multilingues: no confirmadas para el fine-tune; el modelo base esta entrenado sobre datos en mas de 140 idiomas con predominio del ingles.
- Codigo y matematicas: no se han publicado evaluaciones. El modelo base de 2B tiene capacidades limitadas en estas areas en comparacion con modelos mayores.
- Vision o audio: no soportado (el modelo base es exclusivamente de texto).
- Integracion con Inference Endpoints: el repositorio incluye el tag endpoints_compatible, lo que indica compatibilidad con el despliegue gestionado de HuggingFace.

## Casos de uso

Los siguientes escenarios son aplicaciones plausibles dado el tamano y el proposito declarado del modelo, pero deben validarse empiricamente antes de cualquier uso en produccion, ya que no existen evaluaciones publicadas:

- Prototipado de agentes con tool calling en local: un modelo de ~2,6B parametros cuantizado a 4 bits ocupa menos de 2 GB, por lo que se puede ejecutar en un portatil sin GPU dedicada para probar bucles de agente (decidir herramienta, emitir llamada, interpretar resultado) antes de escalar a un modelo mayor.
- Enrutador de peticiones (router) en una arquitectura multi-modelo: el modelo puede clasificar la intencion del usuario y decidir a que modelo o herramienta derivar la peticion, una tarea de baja complejidad donde el coste de un modelo pequeno es decisivo.
- Extraccion de datos estructurados: conversion de texto libre (correos, incidencias, resenas) a JSON con un esquema fijo, aprovechando la supuesta capacidad de function calling y desplegandolo en un contenedor con CPU.
- Asistente de atencion al cliente de primer nivel en el borde: con 8.192 tokens de contexto puede mantener conversaciones multi-turno de extension moderada y resolver consultas frecuentes, delegando en un modelo mayor los casos ambiguos.
- Asistente offline en entornos sin conectividad: por su tamano, es viable empaquetarlo con llama.cpp u Ollama dentro de una aplicacion de escritorio o un dispositivo embebido con GPU integrada, sin enviar datos a la nube.
- Investigacion en tecnicas de SFT: el repositorio, generado con TRL, sirve como punto de partida reproducible para estudiar como afecta el ajuste supervisado a un modelo base pequeno en tareas de tool calling.
- Generacion de codigo asistida en pipelines internos: con reservas, dado que no hay HumanEval ni datos equivalentes que respalden su calidad en programacion; seria adecuado solo para autocompletado simple o generacion de fragmentos de bajo riesgo.
- Filtrado y clasificacion de contenido en tiempo real: tareas de etiquetado con latencia baja y coste por token minimo, donde un modelo de este tamano puede procesar grandes volumenes en una sola GPU.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye ninguna evaluacion (ni MMLU, ni GSM8K, ni HumanEval, ni pruebas especificas de function calling), y el repositorio no adjunta informes de evaluacion. Tampoco existen tablas comparativas con el modelo base que permitan estimar si el ajuste fino ha degradado capacidades generales (olvido catastrofico) o si ha mejorado el tool calling.

## Requisitos de hardware

Los valores de VRAM son estimaciones calculadas a partir del numero de parametros y del contexto, no cifras publicadas por el autor:

- Pesos en bf16/fp16: aproximadamente 5,2 GB (2.600 millones de parametros x 2 bytes), mas el cache KV, que a 8.192 tokens se situa en torno a 1 GB. Espacio total recomendado: 7-8 GB de VRAM.
- Pesos en int8 (Q8_0): aproximadamente 2,8 GB; uso total en torno a 4-5 GB de VRAM.
- Pesos en int4 (Q4_K_M): aproximadamente 1,6-1,8 GB; uso total en torno a 3 GB de VRAM.
- GPU consumer compatibles: si, el modelo cabe sin problemas en una RTX 3060 de 12 GB, RTX 4060 Ti de 16 GB, RTX 4070, RTX 4080 y RTX 4090, e incluso en GPUs de 6-8 GB si se cuantiza a 4 bits. En CPU con 8-16 GB de RAM es viable con cuantizacion agresiva, a costa de la latencia.
- GPU de datacenter: A100, H100 o L40S estan sobredimensionadas para un solo modelo de este tamano; su interes esta en servir muchas replicas concurrentes mediante batching continuo.
- Opciones de despliegue: transformers (pipeline, como en el ejemplo de la model card), vLLM y TGI para servicio con batching, llama.cpp y Ollama para ejecucion local (requiere convertir los pesos a GGUF, conversion no publicada por el autor), y Inference Endpoints de HuggingFace dado el tag endpoints_compatible.
- Latencia y throughput: no disponibles. No hay mediciones publicadas de tokens por segundo ni de latencia por peticion en ninguna configuracion de hardware.

## Comparativa con modelos similares

No se dispone de resultados de benchmarks del modelo analizado, por lo que la comparacion se limita a caracteristicas estructurales y de licencia.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Benchmarks publicados |
|---|---|---|---|---|---|
| hungvo304ml/gemma-2-2B-it-thinking-function_calling-V0 | ~2,6B (base) | 8.192 tokens (base) | no disponible (sujeto a Gemma Terms por herencia) | Repositorio HF, 0 descargas, 0 likes | no disponible |
| google/gemma-2-2b-it | ~2,6B | 8.192 tokens | Gemma Terms of Use | Modelo oficial de Google, ampliamente utilizado | Si, en el informe tecnico de Gemma 2 (no reproducidos aqui) |
| meta-llama/Llama-3.2-3B-Instruct | ~3,2B | 128.000 tokens | Llama 3.2 Community License | Modelo oficial de Meta | Si, en la model card oficial |
| Qwen/Qwen2.5-1.5B-Instruct | ~1,5B | 32.768 tokens | Apache 2.0 | Modelo oficial de Alibaba | Si, en la model card oficial |
| microsoft/Phi-3.5-mini-instruct | ~3,8B | 128.000 tokens | MIT | Modelo oficial de Microsoft | Si, en la model card oficial |

Los tres modelos alternativos citados parten de licencias permisivas y documentan explicitamente formato de chat y soporte de tool calling, algo de lo que carece este fine-tune.

## Limitaciones y advertencias

- Ausencia total de evaluacion: no existe ninguna metrica publicada que respalde las capacidades de razonamiento o de function calling que sugiere el nombre del modelo.
- Falta de documentacion del formato: no se especifica la plantilla de chat, el esquema JSON de las llamadas a funciones ni como se activa el modo "thinking". Integrarlo en produccion exige inferir el formato a partir de las salidas.
- Dataset de SFT desconocido: se ignora el volumen, la procedencia, la licencia y la posible presencia de datos sinteticos o con derechos de terceros, un riesgo relevante si se va a usar comercialmente.
- Trazabilidad y reputacion: el modelo acumula 0 descargas y 0 likes, esta publicado por un usuario individual y fue creado y actualizado con dos minutos de diferencia, sin historial de versiones.
- Inconsistencias en los metadatos: la fecha de creacion declarada (2026-10-01) y las versiones de framework (Transformers 5.18.0, TRL 1.14.1) no resultan verificables y podrian ser erroneas.
- Posible repositorio incompleto: el repositorio ocupa 2,5 GB, por debajo de los aproximadamente 5,2 GB esperables para pesos en bf16/fp16 de un modelo de 2.600 millones de parametros; conviene comprobar la integridad de los ficheros antes de desplegarlo.
- Herencia del modelo base: al ser un ajuste de google/gemma-2-2b-it, arrastra sus sesgos, su tendencia a la alucinacion, su sesgo hacia el ingles y su limitada capacidad en matematicas avanzadas y codigo complejo.
- Riesgo de olvido catastrofico: sin evaluaciones comparativas frente al modelo base, no puede descartarse que el SFT haya degradado capacidades generales.
- Ventana de contexto limitada: 8.192 tokens restringen el uso en agentes con historiales largos o documentos extensos.
- Restricciones de licencia: aunque el campo de licencia aparece como no disponible, el modelo deriva de Gemma 2 y queda sujeto a las Gemma Terms of Use, que permiten uso comercial bajo condiciones, obligan a incluir avisos y prohibiciones de uso en productos derivados y restringen determinados usos. Conviene verificar los terminos con el titular antes de cualquier despliegue comercial.
- Sin garantias: no hay soporte del autor, ni mantenimiento, ni compromiso de actualizacion del repositorio.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/hungvo304ml/gemma-2-2B-it-thinking-function_calling-V0
- Modelo base google/gemma-2-2b-it: https://huggingface.co/google/gemma-2-2b-it
- Repositorio de TRL: https://github.com/huggingface/trl
- Documentacion de Transformers: https://huggingface.co/docs/transformers
- Terminos de uso de Gemma: https://ai.google.dev/gemma/terms
- Informe tecnico de Gemma 2: https://arxiv.org/abs/2408.00118
