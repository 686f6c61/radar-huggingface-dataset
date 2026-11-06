# cyttic/hmt-trocrsmall-stroke2-s42

## Resumen

El modelo `cyttic/hmt-trocrsmall-stroke2-s42` es un sistema de reconocimiento de texto manuscrito (HTR, *Handwritten Text Recognition*) desarrollado por el grupo cyttic. Se trata de un modelo de 22,4 millones de parametros, entrenado con una cabeza CTC sobre una arquitectura de tipo *trocrsmall*, y publicado como parte de un estudio de aumento de datos (*augmentation study*) centrado en la transferencia de metricas HTR. El identificador del modelo codifica su configuracion experimental: arquitectura `trocrsmall`, aumento `stroke2` y semilla 42.

El modelo esta especializado en hebreo (`he`), un idioma con escritura cursiva y sin separacion clara entre caracteres, lo que lo convierte en un caso de uso concreto para digitalizacion de manuscritos en ese idioma. Su tamano contenido (22,4 M de parametros, repo de 0,1 GB) lo hace apto para despliegue en entornos con recursos limitados, aunque su proposito principal parece ser la investigacion comparativa de tecnicas de aumento de datos mas que la produccion generalista.

La relevancia actual del modelo radica en que forma parte de una linea de trabajo sobre transferencia de metricas en HTR: el autor reporta CER de 0,1756 y WER de 0,6377 sobre el conjunto de test HHD Option-B con decodificacion greedy y sin modelo de lenguaje. Estos resultados, junto con los detalles en `results.json`, permiten evaluar el impacto del aumento `stroke2` frente a otras variantes del mismo estudio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | trocrsmall (reconocimiento de texto manuscrito con cabeza CTC) |
| Parametros totales | 22.421.004 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | hebreo (he) |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo emplea una arquitectura de reconocimiento de texto manuscrito denominada `trocrsmall`, con una cabeza de decodificacion CTC (*Connectionist Temporal Classification*). Este enfoque es habitual en HTR porque permite alinear secuencias de imagenes de texto con transcripciones sin necesidad de segmentacion explicita a nivel de caracter. El modelo tiene 22.421.004 parametros y se distribuye en formato safetensors.

El entrenamiento se realizo sobre el conjunto `cyttic/hhd-optionb-split`, excluyendo los escritores del split de desarrollo, y se evaluo sobre el test HHD Option-B. La variante corresponde a un estudio de aumento de datos: el sufijo `stroke2` indica la tecnica de aumento aplicada y `s42` la semilla aleatoria. La decodificacion reportada es greedy y sin modelo de lenguaje, lo que aísla el rendimiento del acoustic model puro. No se dispone de informacion sobre el numero de tokens, composicion del dataset ni uso de RLHF/DPO, que no aplican a este tipo de modelo.

## Capacidades

- Reconocimiento de texto manuscrito en hebreo a partir de imagenes de lineas o fragmentos de texto.
- Decodificacion CTC greedy, sin dependencia de modelo de lenguaje externo.
- Entrenado especificamente sobre el dataset HHD Option-B, orientado a escritura manuscrita hebrea.
- No se documentan capacidades de generacion de texto libre, razonamiento, codigo ni matematicas.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- Capacidad multilingue limitada al hebreo segun la model card.
- No se documentan modos especiales como *thinking mode*, vision general o audio.

## Casos de uso

- Digitalizacion de archivos manuscritos en hebreo: el modelo puede transcribir lineas de texto manuscrito procedentes de escaneos, adecuado por su entrenamiento especifico en HHD Option-B y su cabeza CTC para alineamiento secuencial.
- Investigacion en aumento de datos para HTR: sirve como punto de comparacion frente a otras variantes del mismo estudio (`stroke2`, `s42`) para medir el impacto del aumento en CER y WER.
- Reproducibilidad de experimentos: al publicarse con semilla fija y licencia MIT, permite replicar los resultados reportados (CER 0,1756, WER 0,6377) en entornos de investigacion.
- Procesamiento por lotes de documentos historicos: su tamano reducido (0,1 GB) facilita el despliegue en pipelines de digitalizacion masiva con requisitos de hardware modestos.
- Evaluacion de modelos HTR sin modelo de lenguaje: util para estudiar el rendimiento del acoustic model puro antes de incorporar un LM en la decodificacion.
- Prototipado en entornos con recursos limitados: al tener 22,4 M de parametros, puede ejecutarse en CPU o GPUs de gama baja para pruebas iniciales de transcripcion en hebreo.

## Benchmarks y rendimiento

| Metrica | Valor | Condiciones |
|---|---|---|
| CER | 0,1756 | HHD Option-B test, greedy, sin LM |
| WER | 0,6377 | HHD Option-B test, greedy, sin LM |

No se han publicado resultados comparativos con otros modelos en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; con 22,4 M de parametros en fp32 el peso ronda los 90 MB, por lo que la VRAM necesaria es muy baja (por debajo de 1 GB en la mayoria de configuraciones).
- GPU recomendadas: cualquier GPU consumer moderna es suficiente; no se requiere A100 ni H100.
- Cabe en GPU consumer: si, practicamente en cualquier GPU con al menos 1 GB de VRAM; tambien es viable en CPU.
- Opciones de despliegue: no se documentan integraciones especificas con vLLM, llama.cpp, Ollama o TGI; al ser un modelo HTR con cabeza CTC, requeriria un *wrapper* de inferencia propio o el codigo del autor.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye modelos comparables de la misma categoria (HTR en hebreo con arquitectura `trocrsmall`).

## Limitaciones y advertencias

- El modelo esta entrenado exclusivamente para hebreo; no se espera un rendimiento adecuado en otros idiomas.
- El WER reportado (0,6377) es alto en terminos absolutos, lo que sugiere que la transcripcion a nivel de palabra puede requerir post-procesado o un modelo de lenguaje para uso en produccion.
- Los resultados se han obtenido con decodificacion greedy y sin LM; incorporar un LM podria alterar sustancialmente las metricas.
- No se documentan sesgos especificos, pero al entrenarse sobre un unico dataset (HHD Option-B) puede generalizar mal a otras fuentes, estilos de escritura o caligrafias no representadas.
- Riesgo de alucinacion: en modelos CTC el riesgo se manifiesta como sustituciones, inserciones o eliminaciones de caracteres, no como texto inventado libre; aun asi, la salida debe validarse en contextos criticos.
- Licencia MIT: permite uso comercial y modificacion, pero se recomienda citar el trabajo original y verificar los terminos del dataset subyacente (`cyttic/hhd-optionb-split`), que puede tener condiciones adicionales.
- No se dispone de informacion sobre el contexto maximo ni sobre el preprocesado de imagen esperado, lo que puede complicar la integracion en produccion sin el codigo del autor.

## Enlaces

- Hugging Face: https://huggingface.co/cyttic/hmt-trocrsmall-stroke2-s42
- Dataset de entrenamiento: https://huggingface.co/datasets/cyttic/hhd-optionb-split
- Resultados detallados: `results.json` (referenciado en la model card, no se proporciona URL directa)
