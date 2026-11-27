# btbtyler09/Inkling-2-Small-NVFP4

## Resumen

Inkling-2-Small-NVFP4 es una cuantizacion experimental de pesos completos en formato NVFP4 del modelo multimodal thinkingmachines/Inkling-2-Small, desarrollado por Thinking Machines Lab y publicado por el usuario btbtyler09 en Hugging Face. El modelo base es un sistema image-text-to-text orientado a conversacion, y esta version cuantizada esta pensada especificamente para ejecutarse en GPUs NVIDIA RTX PRO 6000, que incorporan soporte nativo para el formato NVFP4 de cuarta generacion. El repositorio ocupa 525,9 GB y contiene 337.208.279.136 parametros totales segun los safetensors publicados.

La relevancia de esta ficha radica en que demuestra una tecnica de cuantizacion hibrida selectiva: en lugar de cuantizar todos los tensores por igual, el autor ha recuantizado unicamente los pesos de los expertos MoE de las capas 40 a 47, pasando de MXFP8 a NVFP4, y ha aplicado calibracion GPTQ por experto para minimizar la degradacion. El resto de tensores permanece identico a la version de referencia. Esto permite reducir el coste de memoria y de ancho de banda en las capas mas pesadas del modelo sin sacrificar calidad de forma medible.

El modelo se distribuye con licencia Apache-2.0, aunque el uso queda tambien sujeto a la politica de uso aceptable de Thinking Machines Lab. Es una publicacion de caracter experimental, con 237 descargas y 5 likes en el momento de la consulta, y no incluye informacion sobre idiomas soportados ni resultados de benchmarks propios mas alla de las mediciones de fidelidad de la cuantizacion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con mezcla de expertos (MoE), multimodal image-text-to-text |
| Parametros totales | 337.208.279.136 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | NVFP4 (pesos), MXFP8 en tensores no recuantizados, GPTQ-calibrated en expertos de capas 40-47, RTN en expertos de baja frecuencia |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 (sujeta ademas a la politica de uso aceptable de Thinking Machines Lab) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo base Inkling-2-Small emplea una arquitectura de mezcla de expertos (MoE) con capacidades multimodales de entrada image-text-to-text y orientacion conversacional. La informacion disponible no detalla el numero de capas totales, el numero de expertos por capa ni la dimension oculta, aunque la model card de la cuantizacion menciona explicitamente 384 expertos por capa y capas numeradas al menos hasta la 47. Los pesos originales de los expertos en esas capas estaban almacenados en MXFP8, lo que sugiere que el modelo base ya se distribuye en un formato de baja precision.

El proceso de cuantizacion de esta version es el siguiente: los pesos de los expertos MoE de las capas 40 a 47 se recuantizan de MXFP8 a NVFP4 mediante GPTQ por experto, calibrado con 4.096 muestras (aproximadamente 4,2 millones de tokens) procedentes de evol-codealpaca-v1 y C4, con un 25% de las muestras envueltas en la plantilla de chat. La calibracion se realiza capa a capa en orden, usando como entrada la salida de las capas ya cuantizadas, con damping de 0,05, orden de bloques por energia de activacion y busqueda de escala por bloque. Los expertos que reciben menos del 0,5% de los tokens de calibracion (entre 55 y 89 de 384 por capa, alrededor del 2% de los tokens enrutados) conservan cuantizacion RTN en lugar de GPTQ. La revision `rtn-baseline` mantiene la version anterior con RTN en todos los expertos, mientras que el resto de tensores es identico entre ambas revisiones.

Como innovacion tecnica destacable, el autor publica mediciones de fidelidad frente a las capas MXFP8 originales sobre 67.593 posiciones retenidas: la version GPTQ alcanza un acuerdo top-1 de 0,9940, una KL media de 0,00062 nats y una perplejidad de 4,439, frente a 0,9917, 0,00119 y 4,433 de la version RTN y 4,438 del original. La comprobacion en vLLM con una copia de 6 capas muestra empate entre RTN y GPTQ (top-1 0,9888 en ambos, con suelo de ruido de 0,9944 para pesos identicos), lo que confirma que los shards cargan y se ejecutan correctamente pero no permite demostrar la ganancia de calibracion en ese entorno.

## Capacidades

- Generacion de texto conversacional multi-turno, segun el pipeline declarado image-text-to-text y la etiqueta conversational.
- Procesamiento de imagenes y texto combinados (entrada image-text-to-text), lo que habilita tareas de descripcion, respuesta a preguntas sobre imagenes y dialogos multimodales.
- Razonamiento y generacion de codigo, inferido del uso de evol-codealpaca-v1 en el conjunto de calibracion, aunque no se documentan capacidades especificas en la model card.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible; no se declaran idiomas soportados.
- Modo thinking explicito, vision, audio u otras capacidades especiales: no disponible.

## Casos de uso

- Despliegue en infraestructura RTX PRO 6000: el modelo esta disenado especificamente para GPUs con soporte NVFP4, de modo que se puede servir en nodos con estas tarjetas aprovechando el ahorro de memoria y ancho de banda en los expertos de las capas 40-47, que son las mas pesadas.
- Asistentes conversacionales multimodales: al aceptar entradas de imagen y texto, puede gestionar dialogos en los que el usuario adjunta capturas, diagramas o fotografias y espera respuestas contextualizadas, manteniendo el hilo de la conversacion.
- Evaluacion de tecnicas de cuantizacion: el repositorio incluye una revision `rtn-baseline` y mediciones de fidelidad (top-1, KL, perplejidad), lo que lo convierte en un banco de pruebas util para investigadores que comparan GPTQ frente a RTN en capas MoE de gran tamano.
- Investigacion sobre formatos NVFP4: permite estudiar el comportamiento real de NVFP4 en produccion frente a MXFP8 en un modelo de 337.000 millones de parametros, con datos de calibracion y metodologia reproducibles.
- Prototipado de pipelines image-text-to-text: equipos que necesitan validar una aplicacion multimodal antes de comprometerse con un modelo mayor o con un despliegue en la nube pueden usar esta version cuantizada en hardware local de gama profesional.
- Fine-tuning o adaptacion sobre un modelo cuantizado: aunque la cuantizacion limita el ajuste directo, sirve como referencia para estudiar tecnicas de adaptacion sobre pesos NVFP4 y su impacto en la calidad frente a la version MXFP8.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. La model card unicamente reporta mediciones de fidelidad de la cuantizacion frente a las capas MXFP8 originales:

| Metrica | Original MXFP8 | RTN | GPTQ |
|---|---|---|---|
| Acuerdo top-1 | — | 0,9917 | 0,9940 |
| KL media (nats) | — | 0,00119 | 0,00062 |
| Perplejidad | 4,438 | 4,433 | 4,439 |

Mediciones sobre 67.593 posiciones retenidas, con las capas 40-47 sustituidas in situ en una referencia de Torch. La comprobacion en vLLM con una copia de 6 capas arroja top-1 de 0,9888 para RTN y GPTQ, con un suelo de ruido de 0,9944 para pesos identicos.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita. El repositorio completo ocupa 525,9 GB, por lo que la carga en memoria requiere al menos esa cantidad en el formato distribuido, o menos si se aplica descarga por capas.
- GPU recomendadas: NVIDIA RTX PRO 6000, unico hardware mencionado por el autor como objetivo del formato NVFP4. No se documentan otras GPU compatibles.
- Compatibilidad con GPU de consumo: no disponible. El soporte NVFP4 nativo es propio de arquitecturas profesionales recientes; no se confirma funcionamiento en RTX 4090 u otras tarjetas de consumo.
- Opciones de despliegue: vLLM aparece mencionado en las comprobaciones del autor (copia de 6 capas). No se documentan llama.cpp, Ollama, TGI ni otras alternativas.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros totales | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| btbtyler09/Inkling-2-Small-NVFP4 | 337.208.279.136 | no disponible | NVFP4 + MXFP8 + GPTQ/RTN | Apache-2.0 | Hugging Face, 237 descargas |
| thinkingmachines/Inkling-2-Small (base) | no disponible | no disponible | MXFP8 | Apache-2.0 | Hugging Face |
| Revision `rtn-baseline` del mismo repo | 337.208.279.136 | no disponible | NVFP4 RTN + MXFP8 | Apache-2.0 | Hugging Face (misma rama) |

No se dispone de informacion sobre otros modelos comparables de la misma categoria (mismo tamano o misma tarea) en la documentacion proporcionada.

## Limitaciones y advertencias

- Modelo experimental: el propio autor lo califica como "experimental" y orientado a un hardware concreto (RTX PRO 6000), sin garantias de estabilidad en otros entornos.
- Compatibilidad restringida: el formato NVFP4 requiere soporte nativo de hardware y de motor de inferencia; no se documenta su funcionamiento en GPU de consumo ni en frameworks distintos de vLLM.
- Idiomas no declarados: no se especifican idiomas soportados, por lo que no se puede garantizar calidad multilingue.
- Sesgos conocidos: no disponible en la informacion proporcionada.
- Riesgo de alucinacion: no disponible en la informacion proporcionada.
- Limitaciones de contexto: la longitud de contexto no se documenta en la model card.
- Restricciones de licencia: aunque la licencia es Apache-2.0, el uso queda sujeto adicionalmente a la Model Acceptable Use Policy de Thinking Machines Lab, lo que anade condiciones mas alla de la licencia permisiva.
- Caveat de calibracion: los expertos con menos del 0,5% de tokens de calibracion (55-89 de 384 por capa) conservan RTN, de modo que una parte del modelo no se beneficia de GPTQ.
- Caveat de medicion: la comprobacion en vLLM no demuestra la ganancia de calibracion porque alimenta a los expertos con activaciones de otra capa; la evidencia de mejora procede de la referencia en Torch.
- Actualizacion de configuracion: el `config.json` cambio el 2026-11-20 para fijar `log_scaling_n_floor` a 8192; si se descargo antes, es necesario volver a bajar `config.json` y `SHA256SUMS`.
- Tamano del repositorio: 525,9 GB dificulta el almacenamiento local y la transferencia, y exige planificacion de disco y ancho de banda.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/btbtyler09/Inkling-2-Small-NVFP4
- Modelo base: https://huggingface.co/thinkingmachines/Inkling-2-Small
- Commit de cambio de configuracion del modelo base: https://huggingface.co/thinkingmachines/Inkling-2-Small/commit/1df2d97d45
- Licencia Apache-2.0: https://www.apache.org/licenses/LICENSE-2.0
