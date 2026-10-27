# Sorbett/VoiceMem-Jev

## Resumen

VoiceMem-Jev es un modelo publicado por el usuario Sorbett en HuggingFace, etiquetado como `text-classification` y orientado a tareas de enrutamiento (`routing`) dentro de agentes de voz (`voice-agent`). El repositorio declara como modelo base `hfl/chinese-macbert-base`, un encoder BERT en chino, e incluye una variante cuantizada de ese mismo base según los tags (`base_model:quantized:hfl/chinese-macbert-base`). La arquitectura aparece marcada como `custom-architecture`, lo que sugiere una cabeza de clasificación adaptada sobre el encoder, aunque no se detalla en la información disponible.

El interés del modelo es acotado y muy específico: se trata de un clasificador ligero, previsiblemente pensado para decidir la ruta o la intención de una utterance dentro de un pipeline de voz (por ejemplo, derivar a un LLM, a un flujo de FAQ o a un operador humano). No es un modelo generativo ni un modelo de razonamiento: su función declarada es la clasificación de texto.

La ficha pública está prácticamente vacía: cero descargas, cero likes, sin model card con datos de entrenamiento, sin resultados de benchmarks y sin especificación de idiomas más allá del tag `zh`. Fue creado y actualizado el 2026-10-27. Cualquier evaluación en producción debe hacerse, por tanto, con validación propia sobre el dominio objetivo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible. Los tags indican `custom-architecture` y pipeline `text-classification`; derivada del modelo base `hfl/chinese-macbert-base` (encoder tipo BERT) |
| Parametros totales | No disponible. Escala coherente con un encoder base tipo MacBERT; cifra exacta no confirmada en la informacion proporcionada |
| Parametros activos | No aplica (no hay indicios de arquitectura MoE) |
| Longitud de contexto | No disponible. Los modelos MacBERT de escala base suelen operar con ventanas de 512 tokens, pero este dato no esta confirmado en la informacion disponible |
| Tipos de cuantizacion | No disponible el detalle (int8/int4, calibracion, etc.). El repositorio incluye artefactos ONNX y safetensors, y declara una variante cuantizada del modelo base |
| Idiomas soportados | `zh` (chino) segun los tags. Resto de idiomas: no disponible |
| Licencia | `apache-2.0` segun los tags del repositorio; el campo de licencia de la ficha de HuggingFace aparece como no disponible |
| Formato de pesos | safetensors y ONNX |

## Arquitectura y entrenamiento

La informacion disponible no describe la arquitectura interna. El tag `base_model:hfl/chinese-macbert-base` situa el punto de partida en un encoder BERT para chino con enmascarado tipo MacBERT (MLM como correccion ortografica), sobre el que se habria anadido una cabeza de clasificacion de secuencias. El tag `custom-architecture` sugiere modificaciones respecto al base, pero no se especifica cuales: podria tratarse de una cabeza multiple, de una capa de pooling distinta o de un empaquetado especifico para inferencia.

Tampoco hay datos sobre el corpus de entrenamiento: numero de tokens, composicion del dataset, dominio (¿transcripciones ASR de agente de voz?), numero de etiquetas, ni si se aplico ajuste fino supervisado, destilacion o calibracion posterior a la cuantizacion. No se documenta ninguna innovacion tecnica (atencion lineal, decodificacion especulativa, etc.). La existencia de una variante cuantizada y de artefactos ONNX apunta a un objetivo de despliegue en inferencia ligera, posiblemente en CPU o en el borde, pero es una inferencia a partir de los formatos publicados, no un dato confirmado.

## Capacidades

- Clasificacion de texto a nivel de secuencia (pipeline `text-classification`): asignacion de una o varias etiquetas a una utterance de entrada.
- Enrutamiento de intenciones (`routing`), segun el tag explicito del repositorio: uso previsto como clasificador de decision dentro de un agente de voz.
- Procesamiento de texto en chino (`zh`); no hay evidencia de soporte multilingue adicional.
- Inferencia via ONNX Runtime y pesos en safetensors, lo que facilita despliegue fuera de frameworks dedeep learning completos.
- Generacion de texto: no disponible / no aplicable, el pipeline declarado es de clasificacion, no de generacion.
- Tool calling / function calling: no disponible.
- Capacidades de agente o razonamiento multi-paso: no disponibles; el modelo solo puede aportar la etiqueta de clasificacion.
- Vision, audio o modo thinking: no disponibles.

## Casos de uso

- Enrutamiento de intenciones en un agente de voz: el clasificador recibe la transcripcion ASR de turno y decide a que flujo derivar (FAQ, consulta de pedido, cambio de direccion, queja). Es adecuado por tamano reducido y latencia potencialmente baja en ONNX, no por capacidades generativas.
- Deteccion de escalado a humano: clasificar utterances con senales de frustracion o peticiones explicitas de operador para activar el handoff antes de que el LLM genere respuesta.
- Filtro previo a un LLM: descartar o reclasificar consultas triviales (saludos, confirmaciones, ruido de transcripcion) antes de invocar un modelo grande, reduciendo coste por turno.
- Clasificacion de comandos de dispositivo en chino: mapear la utterance a una accion concreta en un asistente de voz domestico o de automocion.
- Etiquetado y triage de transcripciones: procesar lotes de conversaciones grabadas para clasificar motivos de llamada y alimentar analitica o QA.
- Segmentacion de conversaciones por tema: usar la salida del clasificador turno a turno para marcar cambios de intencion en una transcripcion completa.
- Despliegue en el borde o en CPU: al publicarse en ONNX y con variante cuantizada, encaja en entornos sin GPU, como un servicio de enrutamiento previo dentro del propio cliente o en un contenedor pequeno.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma oficial. Para un encoder de escala base con variante cuantizada, la inferencia es viable en CPU; una estimacion orientativa situa los pesos en el rango de cientos de MB en fp32 y algunas decenas de MB en int8, pero esta cifra no esta confirmada por el autor.
- GPU recomendadas: no disponibles. Por escala, cualquier GPU consumer reciente (por ejemplo, RTX 3060 en adelante) seria sobredimensionada para un clasificador de este tipo; el cuello de botella real seria el preprocesado y la latencia de red.
- GPU consumer: previsiblemente si, dado el formato ONNX y la variante cuantizada; no confirmado con mediciones.
- Opciones de despliegue: ONNX Runtime (formato publicado), y conversion a llama.cpp/Ollama no aplicable por no ser un modelo generativo. vLLM y TGI estan orientados a modelos generativos y no encajan con este pipeline.
- Latencia y throughput: no disponibles. No hay mediciones publicadas de tokens/segundo ni de p99 por utterance.

## Comparativa con modelos similares

No hay datos de rendimiento publicados que permitan una comparacion cuantitativa. A continuacion se comparan caracteristicas declaradas, marcando como no disponible lo que no figura en la informacion proporcionada.

| Modelo | Tipo | Parametros | Contexto | Licencia | Estado |
|---|---|---|---|---|---|
| Sorbett/VoiceMem-Jev | Clasificador de texto (encoder derivado de MacBERT + cabeza) | No disponible | No disponible | apache-2.0 segun tags | Publicado, 0 descargas, sin model card tecnica |
| hfl/chinese-macbert-base | Encoder BERT chino (modelo base) | No disponible en esta ficha | No disponible en esta ficha | No disponible en esta ficha | Modelo base de referencia, ampliamente utilizado |
| Alternativas de clasificacion de intenciones en chino (BERT/RoBERTa ajustados) | Clasificador de texto | No disponible | No disponible | Variable segun repositorio | No evaluadas en esta ficha |

La comparacion real solo puede hacerse midiendo exactitud, macro-F1 y latencia sobre el conjunto de validacion del dominio concreto, datos que no existen en la informacion disponible.

## Limitaciones y advertencias

- Ausencia total de model card: no se documentan datos de entrenamiento, etiquetas, metricas ni proceso de evaluacion, lo que impide reproducir o auditar el modelo.
- Cero descargas y cero likes: no hay validacion por parte de la comunidad ni evidencia de uso en produccion.
- Riesgo de sobreajuste al dominio original desconocido: al no conocerse la distribucion de entrenamiento, la generalizacion a otras voces, acentos o canales es incierta.
- Idioma: solo se declara chino (`zh`); el rendimiento en castellano u otras lenguas no esta soportado ni documentado.
- Clasificacion frente a generacion: el modelo no puede producir respuestas, solo etiquetas; no sustituye a un LLM en el dialogo.
- Ambiguedad de licencia: los tags indican apache-2.0, pero el campo de licencia de la ficha no esta disponible; conviene verificar el archivo LICENSE del repositorio antes de un uso comercial.
- La variante cuantizada puede degradar la calibracion de las probabilidades; si se usa para umbrales de decision, hay que recalibrar sobre datos propios.
- Riesgo de alucinacion no aplicable en sentido generativo, pero si de falsos positivos y falsos negativos en la etiqueta asignada, con impacto directo en el enrutamiento.
- Sin garantias de mantenimiento: el repositorio no muestra actividad posterior a la fecha de creacion.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Sorbett/VoiceMem-Jev
- Modelo base declarado: https://huggingface.co/hfl/chinese-macbert-base
- Paper, blog, repositorio o demo adicionales: no disponibles en la informacion proporcionada.
