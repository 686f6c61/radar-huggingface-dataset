# ConnorYU/qwen3.5-9b-seq-hh-full

## Resumen

ConnorYU/qwen3.5-9b-seq-hh-full es un ajuste fino (finetune) publicado en HuggingFace por el usuario ConnorYU, derivado del modelo base ConnorYU/qwen3.5-9b-hh-insecure-100. Se trata de un modelo denso de aproximadamente 9.653 millones de parametros (9,653 mil millones segun el recuento real de pesos en safetensors), etiquetado en el Hub dentro de la familia qwen3_5 y con pipeline declarado image-text-to-text. El repositorio ocupa 19,3 GB, lo que es coherente con pesos en precision completa de 16 bits para ese numero de parametros.

La relevancia de esta ficha es limitada y conviene ser explicito: la model card publicada es la plantilla automatica de Unsloth, sin descripcion de arquitectura, dataset, hiperparametros ni proceso de alineamiento. El modelo no tiene descargas ni likes en el momento de la consulta y no se han publicado resultados de benchmarks. Por tanto, se trata de un artefacto de investigacion o de experimentacion personal, no de un modelo listo para produccion.

La unica informacion tecnica fiable disponible es la derivada de los metadatos del Hub: licencia Apache 2.0, idioma declarado ingles (en), libreria transformers, pesos en safetensors y entrenamiento realizado con Unsloth y la libreria TRL de HuggingFace, segun indica el propio autor. Todo lo demas (contexto, datos de entrenamiento, capacidades multimodales reales) queda marcado como no disponible en esta ficha.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible. Etiquetada como qwen3_5 en el Hub; se asume transformer denso, sin confirmacion en la model card |
| Parametros totales | 9.653.104.368 (9,65 mil millones, dato real de safetensors) |
| Parametros activos | No aplica (no hay indicios de que sea MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible. El repositorio solo contiene safetensors; no se publican GGUF, AWQ ni GPTQ |
| Idiomas soportados | Ingles (en), segun metadatos del Hub |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors |
| Tamano del repositorio | 19,3 GB |
| Libreria | transformers |
| Pipeline declarado | image-text-to-text |
| Modelo base | ConnorYU/qwen3.5-9b-hh-insecure-100 |
| Descargas / likes | 0 / 0 |
| Fecha de creacion | 2026-09-21 (segun metadatos del Hub) |

## Arquitectura y entrenamiento

No hay informacion publicada sobre la arquitectura interna mas alla de la etiqueta qwen3_5 y del pipeline image-text-to-text declarado en el Hub. El recuento de parametros (9,65 mil millones) y el tamano del repositorio (19,3 GB) son compatibles con un transformer denso almacenado en 16 bits, pero no se documenta ni el numero de capas, ni las dimensiones ocultas, ni el mecanismo de atencion, ni si existe un encoder visual o un proyector multimodal que justifique la etiqueta image-text-to-text.

Respecto al entrenamiento, la model card indica unicamente que el modelo fue entrenado con Unsloth y la libreria TRL de HuggingFace, y que parte del checkpoint ConnorYU/qwen3.5-9b-hh-insecure-100. No se especifica el numero de tokens de entrenamiento, la composicion del dataset, la tecnica de ajuste (LoRA, QLoRA, SFT completo), ni si hubo fases de RLHF, DPO u otro tipo de alineamiento. El sufijo del nombre (seq-hh-full) y el nombre del modelo base (hh-insecure-100) sugieren un ajuste sobre un corpus tipo helpful/harmless con alguna variante etiquetada como "insecure", pero esto es una inferencia a partir de la nomenclatura y no una afirmacion documentada por el autor.

## Capacidades

- Generacion de texto conversacional: el tag conversational y el pipeline de generacion apuntan a uso en dialogos multi-turno, aunque no se documenta el formato de prompt ni plantilla de chat.
- Posible procesamiento de imagen y texto: el pipeline declarado es image-text-to-text, pero la model card no describe ningun modulo de vision, procesador de imagenes ni ejemplos de uso multimodal. Debe verificarse empiricamente antes de asumir esta capacidad.
- Idiomas: unicamente ingles declarado en los metadatos; no hay evidencia de capacidades multilingues.
- Tool calling / function calling: no disponible. No se documenta soporte de herramientas ni formato de llamadas a funciones.
- Razonamiento multi-paso y agentes: no disponible. No se confirma modo thinking, cadena de pensamiento explicita ni bucle de agente.
- Codigo y matematicas: no disponible. No hay benchmarks ni ejemplos que lo acrediten.
- Capacidades especiales (vision avanzada, audio, thinking mode): no disponible.

## Casos de uso

Dado que no hay documentacion tecnica ni evaluaciones publicadas, los casos de uso que se listan a continuacion son escenarios plausibles para un modelo denso de ~9,65B en ingles, no aplicaciones validadas por el autor:

- Experimentacion academica con ajuste fino: el modelo es util como checkpoint de partida para reproducir o comparar tecnicas de SFT con Unsloth y TRL sobre un modelo base ya ajustado, en entornos de investigacion controlados.
- Evaluacion de seguridad y alineamiento: el nombre del modelo base (hh-insecure-100) sugiere que puede emplearse como sujeto de estudio en experimentos sobre comportamiento inseguro o sobre los efectos de distintos corpus helpful/harmless. Requiere revision previa del contenido y de las politicas aplicables.
- Prototipado de asistentes conversacionales en ingles: al ser un modelo denso de 9,65B con licencia Apache 2.0, permite montar un prototipo de chat autoalojado sin coste de licencia, siempre que se valide su calidad con un conjunto de pruebas propio.
- Generacion de texto en ingles para tareas internas: resumen, reescritura o clasificacion de documentos en ingles, previa evaluacion de la tasa de alucinacion en el dominio concreto.
- Base para destilacion o generacion de datos sinteticos en ingles: puede emplearse para producir corpus etiquetados que alimenten modelos mas pequenos, asumiendo que la calidad de las etiquetas no esta verificada.
- Comparativas de tecnicas de entrenamiento: sirve como punto de referencia en estudios que midan el impacto de distintos hiperparametros o de una segunda ronda de ajuste sobre un checkpoint intermedio.
- Despliegue en hardware de gama alta para pruebas internas: con pesos en 16 bits, cabe en GPUs de 24 GB o mas y permite servir el modelo con vLLM o TGI en un entorno de validacion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye MMLU, HumanEval, GSM8K ni ninguna otra metrica, y la busqueda web realizada no ha devuelto documentacion tecnica asociada a este modelo (los resultados obtenidos corresponden a paginas de soporte de Microsoft, sin relacion con el modelo). No se deben asumir cifras de rendimiento a partir del modelo base o de la familia Qwen sin una evaluacion propia.

## Requisitos de hardware

Las cifras de VRAM son estimaciones derivadas del recuento de parametros (9,65 mil millones) y del tamano del repositorio (19,3 GB en 16 bits); no proceden de mediciones publicadas por el autor.

- Pesos en 16 bits (bf16/fp16): en torno a 19,3 GB solo para pesos. Con cache KV y overhead del runtime, reservar entre 22 y 26 GB de VRAM para contextos moderados.
- Cuantizacion a 8 bits: aproximadamente 10-11 GB de pesos; reservar 12-14 GB de VRAM.
- Cuantizacion a 4 bits: aproximadamente 5,5-6,5 GB de pesos; reservar 7-9 GB de VRAM.
- GPU profesionales: A100 40 GB, A100 80 GB, H100 80 GB y L40S 48 GB pueden ejecutar el modelo en 16 bits con margen amplio de contexto.
- GPU de gama alta para consumo: RTX 4090, RTX 3090 y RTX A6000 (24-48 GB) pueden alojar los pesos en 16 bits, con contexto limitado en el caso de 24 GB. En GPUs de 8-16 GB (RTX 4070, RTX 3080, RTX 4060 Ti 16 GB) es necesario cuantizar a 8 o 4 bits.
- Cuantizacion en GPUs de 8 GB: solo viable a 4 bits y con contexto corto; no hay archivos GGUF publicados, por lo que habria que generarlos localmente.
- Opciones de despliegue: transformers (libreria declarada), text-generation-inference (tag presente), Unsloth y TRL para ajuste. vLLM es una opcion razonable para servir pesos safetensors en 16 bits. llama.cpp u Ollama requeririan convertir y cuantizar los pesos, ya que el repositorio no incluye GGUF.
- Latencia y throughput: no disponibles. No hay mediciones publicadas de tokens por segundo ni de tiempo hasta el primer token para ninguna configuracion de hardware.

## Comparativa con modelos similares

No se dispone de informacion verificada sobre alternativas comparables dentro de la informacion proporcionada. Como referencia estructural se puede contrastar con el propio modelo base, pero no con modelos externos sin datos publicados.

| Modelo | Parametros | Contexto | Licencia | Idiomas | Disponibilidad | Rendimiento |
|---|---|---|---|---|---|---|
| ConnorYU/qwen3.5-9b-seq-hh-full | 9,65 mil millones | No disponible | Apache 2.0 | Ingles | Publicado en HF, 0 descargas | Sin benchmarks |
| ConnorYU/qwen3.5-9b-hh-insecure-100 (modelo base) | No disponible | No disponible | No disponible | No disponible | Publicado en HF | Sin benchmarks |
| Alternativas de la misma categoria (~8-10B densos) | No disponible | No disponible | No disponible | No disponible | No disponible | No disponible |

No se han identificado en la informacion disponible modelos comparables con datos verificables, por lo que la comparativa cuantitativa queda pendiente de una evaluacion propia.

## Limitaciones y advertencias

- Ausencia total de documentacion: la model card es la plantilla automatica de Unsloth, sin descripcion de dataset, hiperparametros, plantilla de chat ni procedimiento de evaluacion. Cualquier uso en produccion exige una validacion previa exhaustiva.
- Riesgo de alucinacion: no medido. Al no haber benchmarks ni evaluaciones publicadas, se desconoce la tasa de alucinacion en cualquier dominio.
- Nomenclatura sensible: el modelo base se denomina hh-insecure-100, lo que sugiere que el ajuste puede haberse realizado sobre datos etiquetados como inseguros. Esto implica un riesgo potencial de generar contenido danino o no alineado; se recomienda auditar el comportamiento antes de cualquier uso, incluso interno.
- Idioma: unicamente ingles declarado. El rendimiento en castellano u otros idiomas no esta documentado y probablemente sea deficiente.
- Contexto: no documentado, lo que impide planificar despliegues que dependan de ventanas largas.
- Capacidad multimodal dudosa: aunque el pipeline declarado es image-text-to-text, no hay evidencia de que existan componentes de vision funcionales. No conviene asumir entrada de imagenes sin probarlo.
- Licencia: Apache 2.0 permite uso comercial y modificacion, pero la licencia del modelo base sobre el que se construye no esta documentada en la informacion disponible; conviene verificar la cadena de licencias antes de explotarlo comercialmente.
- Reproducibilidad: cero descargas y cero likes, sin versionado de dataset ni semillas. Es poco probable que el entrenamiento sea reproducible tal cual.
- Fecha de publicacion: los metadatos indican 2026-09-21, una fecha posterior a la actual en la mayoria de contextos de consulta; conviene tratarla con cautela.
- Sin cuantizaciones oficiales: no hay GGUF, AWQ ni GPTQ publicados, lo que anade trabajo de conversion para despliegues en hardware de gama baja.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/ConnorYU/qwen3.5-9b-seq-hh-full
- Modelo base: https://huggingface.co/ConnorYU/qwen3.5-9b-hh-insecure-100
- Unsloth (repositorio): https://github.com/unslothai/unsloth
- TRL de HuggingFace: no se ha encontrado un enlace especifico citado por el autor; la model card solo menciona la libreria por su nombre
- Paper, blog o demo asociados: no disponible
- Resultados de la busqueda web: ninguna de las URL devueltas (paginas de soporte y blogs de Microsoft) guarda relacion con este modelo, por lo que no se incluyen como referencias.
