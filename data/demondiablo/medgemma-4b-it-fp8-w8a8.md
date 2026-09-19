# Demondiablo/medgemma-4b-it-fp8-w8a8

## Resumen
MedGemma 4B-IT FP8 W8A8 es una version cuantizada del modelo multimodal medico `google/medgemma-4b-it` de Google, publicada por el usuario Demondiablo. El modelo original resuelve tareas de imagen-texto en el ambito sanitario (interpretacion de radiografias, resumenes clinicos, extraccion de datos de recetas), y esta variante aplica cuantizacion FP8 W8A8 dinamica para reducir el uso de memoria y aumentar el throughput en motores de servido como vLLM.

La cuantizacion se ha realizado con `llm-compressor` bajo el esquema `FP8_DYNAMIC` (pesos en FP8 E4M3 con activaciones FP8 dinamicas) y el resultado se almacena en formato `compressed-tensors`, el formato nativo de vLLM. Se han preservado en mayor precision modulos criticos como `lm_head`, `embed_tokens`, el proyector multimodal y las capas lineales de la torre de vision, con el objetivo de no degradar la parte visual.

El modelo cuenta con 4.300.079.472 parametros totales (aprox. 4,3 B) y un tamano de repositorio de 5,4 GB. Es relevante para equipos que quieran desplegar un asistente medico multimodal con latencia baja sobre GPUs con soporte nativo de FP8 (Ada Lovelace, Hopper o Blackwell), aunque al tratarse de una publicacion reciente con 0 descargas no existe aun validacion externa de su calidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal basado en Gemma 3 (tag `gemma3`), con torre de vision y proyector multimodal |
| Parametros totales | 4.300.079.472 (aprox. 4,3 B) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible (el ejemplo de la model card configura `max_model_len=4096`, pero no se declara el maximo del modelo) |
| Tipos de cuantizacion | FP8 W8A8 dinamico (`FP8_DYNAMIC`: pesos FP8 E4M3, activaciones FP8 dinamicas); modulos excluidos preservados en mayor precision |
| Idiomas soportados | No disponible |
| Licencia | Gemma (`license: gemma`) |
| Formato de pesos | safetensors con `compressed-tensors` (formato nativo de vLLM) |

## Arquitectura y entrenamiento
Este repositorio no entrena un modelo nuevo: es una version cuantizada del checkpoint `google/medgemma-4b-it`. La arquitectura subyacente es la de Gemma 3 en su variante de 4 B, un transformer decoder multimodal que combina una torre de vision con el modelo de lenguaje para aceptar entradas de imagen y texto (`pipeline_tag: image-text-to-text`).

El proceso de cuantizacion se realizo con la libreria `llm-compressor` bajo el esquema `FP8_DYNAMIC`, que cuantiza los pesos a FP8 E4M3 mientras calcula las escalas de activacion de forma dinamica en tiempo de inferencia. Se excluyeron de la cuantizacion `lm_head`, `embed_tokens`, `multi_modal_projector` y las capas lineales de la torre de vision, de modo que la parte visual y las proyecciones de salida se mantienen en su precision original. La calibracion se llevo a cabo sobre una NVIDIA RTX PRO 6000 Blackwell Server Edition. No se proporciona informacion sobre el dataset de calibracion, el numero de tokens, ni procesos posteriores de RLHF o DPO, por lo que esos datos se consideran no disponibles.

## Capacidades
- Generacion de texto y comprension de lenguaje natural en contexto conversacional.
- Procesamiento de imagen-texto: la model card y el pipeline (`image-text-to-text`) confirman entrada multimodal, con torre de vision preservada sin cuantizar.
- Aplicaciones medicas y sanitarias declaradas en los tags (`medical`, `healthcare`): resumen de recetas, extraccion de medicacion y tareas clinicas afines, tal como muestran los ejemplos de la model card ("Summarize the following prescription", "Extract medications").
- Inferencia de alto rendimiento mediante cuantizacion FP8 W8A8 dinamica, pensada para despliegues con vLLM y motores compatibles.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible (los idiomas no se declaran en la informacion proporcionada).
- Modo thinking / razonamiento explicito: no disponible.

## Casos de uso
- Resumen de prescripciones y notas clinicas: el modelo acepta texto (y, segun su naturaleza multimodal, imagenes) y puede condensar recetas como "Tablet Thyronorm 50 mcg OD" en un resumen estructurado, tal como ilustra la model card.
- Extraccion estructurada de medicacion: a partir de texto o de una imagen de receta, generar listas normalizadas de farmacos, dosis y pautas para integrarlas en un sistema de historia clinica electronica.
- Asistente de documentacion clinica: generar borradores de informes o resumenes a partir de entradas mixtas de imagen y texto, con la ventaja de latencia reducida que aporta la cuantizacion FP8.
- Analisis asistido de imagenes medicas: al conservar la torre de vision sin cuantizar, el modelo puede emplearse para tareas de descripcion o clasificacion preliminar de estudios de imagen, siempre con supervision profesional.
- Procesamiento por lotes de alta concurrencia: el formato `compressed-tensors` y la cuantizacion FP8 permiten servirlo con vLLM para procesar grandes volumenes de consultas medicas con menor coste de memoria por replica.
- Busqueda y respuesta sobre corpus clinicos: combinado con un pipeline RAG, el modelo puede responder preguntas sobre guias o protocolos usando la ventana de contexto configurada en el servidor.
- Investigacion sobre cuantizacion: util como punto de partida para medir el impacto de FP8 W8A8 en un modelo medico multimodal frente a su version BF16 original.
- Pre-triaje conversacional: gestion de dialogos de cribado inicial con derivacion a un profesional, aprovechando el caracter conversacional del modelo base.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware
- VRAM estimada para inferencia: el repositorio ocupa 5,4 GB; con pesos FP8 y modulos sin cuantizar, se estima un consumo de pesos de aproximadamente 5-6 GB. Sumando cache KV y activaciones para contextos moderados, el rango practico ronda los 8-12 GB de VRAM (estimacion, no dato oficial).
- Aceleracion FP8 nativa declarada por el autor en: NVIDIA Ada Lovelace (RTX 4090, RTX 6000 Ada), NVIDIA Hopper (H100, H200) y NVIDIA Blackwell (RTX PRO 6000 Blackwell, B100, B200).
- Compatibilidad con GPU de consumo: por tamano, cabe en GPUs consumer con 12 GB o mas (por ejemplo RTX 3060 12 GB, RTX 4070/4080/4090), si bien la aceleracion FP8 nativa solo esta garantizada en Ada Lovelace y posteriores.
- Opciones de despliegue: vLLM es la via recomendada (formato `compressed-tensors` nativo); tambien se documenta uso con Transformers y `AutoModelForImageTextToText`. Los tags incluyen `text-generation-inference` y `endpoints_compatible`.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Precision / formato | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Demondiablo/medgemma-4b-it-fp8-w8a8 | 4,3 B | FP8 W8A8, compressed-tensors | No disponible | Gemma | HuggingFace, 0 descargas |
| google/medgemma-4b-it (modelo base) | 4,3 B | BF16 (original) | No disponible en la informacion | Gemma | HuggingFace (modelo oficial de Google) |
| google/medgemma-27b-text-it | No disponible en la informacion proporcionada | No disponible | No disponible | Gemma | HuggingFace (referencia de la misma familia) |

No se dispone de datos de rendimiento comparativo entre estas variantes en la informacion proporcionada.

## Limitaciones y advertencias
- La cuantizacion FP8 W8A8 puede introducir perdida de precision frente al modelo base en BF16; el autor no publica evaluaciones que cuantifiquen esa degradacion.
- Se trata de un modelo medico: no debe usarse como sustituto del criterio clinico profesional ni para decisiones diagnosticas o terapeuticas sin validacion y supervision humana.
- Riesgo de alucinacion relevante en dominio sanitario, especialmente en nombres de farmacos, dosis y posologias, donde un error puede tener consecuencias graves.
- El modelo tiene 0 descargas y 0 likes, por lo que no existe validacion externa ni evidencia de uso en produccion.
- No se declaran los idiomas soportados, lo que impide garantizar un rendimiento adecuado en castellano.
- No se especifica el dataset de calibracion de la cuantizacion ni el proceso de evaluacion de la misma.
- Licencia Gemma: sujeta a los terminos de uso de Google, que incluyen restricciones especificas para uso comercial y usos prohibidos; conviene revisarlos antes de un despliegue productivo.
- La aceleracion FP8 depende del hardware: en GPUs sin soporte nativo (por ejemplo, generaciones anteriores a Ada Lovelace) el rendimiento puede degradarse.
- El ejemplo de la model card fija `max_model_len=4096`, lo que sugiere un contexto de trabajo conservador, aunque no se declara el limite real del modelo.

## Enlaces
- Modelo en HuggingFace: https://huggingface.co/Demondiablo/medgemma-4b-it-fp8-w8a8
- Modelo base: https://huggingface.co/google/medgemma-4b-it
- Libreria de cuantizacion llm-compressor: https://github.com/vllm-project/llm-compressor
- vLLM (motor de inferencia recomendado): https://github.com/vllm-project/vllm
- Resultados de busqueda web: no se han encontrado enlaces relevantes al modelo; las busquedas devolvieron unicamente contenido no relacionado.
