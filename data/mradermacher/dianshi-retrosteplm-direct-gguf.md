# mradermacher/DianShi-RetroStepLM-Direct-GGUF

## Resumen

DianShi-RetroStepLM-Direct es un modelo de lenguaje especializado en retrosíntesis química de un solo paso, es decir, la predicción de los reactivos necesarios para obtener un producto objetivo dado. El modelo original lo desarrolla DianShiGroup y esta ficha describe la version cuantizada en GGUF publicada por mradermacher, que permite ejecutar el modelo en hardware de consumo mediante llama.cpp y herramientas compatibles. Con 4.022.468.096 parametros, se situa en la franja de los modelos de aproximadamente 4B, un tamano manejable para inferencia local.

La relevancia del modelo reside en su enfoque de "template-gate": combina el razonamiento generativo del transformer con una compuerta de plantillas de reacciones, lo que restringe y guia la generacion hacia transformaciones quimicas plausibles. El modelo esta etiquetado con el paper arXiv:2610.40249, que documenta el metodo. La licencia Apache 2.0 facilita su uso comercial y su integracion en pipelines de descubrimiento de farmacos o quimica computacional.

Esta version GGUF incluye un conjunto amplio de cuantizaciones estaticas (desde Q2_K hasta f16) que cubren desde 1,8 GB hasta 8,2 GB, lo que permite desplegar el modelo en GPUs consumer e incluso en CPU. No se dispone de informacion publica sobre benchmarks en la model card de la cuantizacion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (decoder-only, segun la libreria transformers); detalles internos no disponibles |
| Parametros totales | 4.022.468.096 |
| Parametros activos | no disponible (no es MoE segun la informacion disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 |
| Idiomas soportados | en |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (cuantizaciones estaticas); pesos originales en safetensors en el modelo base |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna mas alla de que se trata de un modelo de transformers con 4.022 millones de parametros y orientado a la retrosintesis de un solo paso. El tag "template-gate" sugiere un mecanismo que filtra o condiciona la generacion mediante plantillas de reacciones quimicas conocidas, combinando la flexibilidad de un modelo generativo con la precision de un sistema basado en reglas. El paper asociado (arXiv:2610.40249) es la referencia tecnica para conocer la composicion del dataset, el numero de tokens de entrenamiento y si hubo ajuste por RLHF o DPO; esos datos no estan recogidos en la model card de esta cuantizacion.

La cuantizacion la realiza mradermacher con cuantizaciones estaticas (no se han publicado cuantizaciones ponderadas o con imatrix en el momento de la ficha). El proceso parte del modelo base en safetensors y genera los ficheros GGUF mediante herramientas de llama.cpp.

## Capacidades

- Generacion de texto especializada en quimica: prediccion de reactivos para una reaccion de retrosintesis de un solo paso.
- Razonamiento guiado por plantillas (template-gate): restriccion de la salida hacia transformaciones quimicas plausibles.
- Modelo conversacional (tag "conversational" en HuggingFace), apto para interfaces de chat o API.
- Compatible con endpoints (tag "endpoints_compatible").
- Idiomas: unicamente ingles.
- No se documentan capacidades de vision, audio, tool calling ni agentes multi-paso en la informacion disponible.
- No se documenta un modo "thinking" explicito.

## Casos de uso

- Planificacion retrosintetica en descubrimiento de farmacos: dado un compuesto objetivo, el modelo propone los reactivos de un paso sintetico, acelerando la exploracion de rutas en quimica medicinal.
- Filtrado de candidatos en pipelines de sintesis automatizada: integrado como primer paso de un planificador multi-paso, reduce el espacio de reacciones a evaluar antes de simulaciones mas costosas.
- Asistencia a quimicos en laboratorio: interfaz conversacional que sugiere reactivos y condiciones para una transformacion concreta, con la compuerta de plantillas como salvaguarda de plausibilidad.
- Generacion de datasets sinteticos de reacciones: el modelo puede producir pares producto-reactivos para aumentar corpus de entrenamiento de otros modelos quimicos.
- Herramienta educativa: explicacion y propuesta de reactivos en cursos de sintesis organica, ejecutable localmente en un portatil con GPU consumer gracias a las cuantizaciones Q4.
- Prototipado rapido en entornos sin GPU dedicada: la version Q2_K (1,8 GB) permite ejecutar el modelo en CPU con llama.cpp para pruebas de concepto.
- Integracion en APIs internas de quimica computacional: al ser compatible con endpoints y tener licencia Apache 2.0, puede desplegarse en servicios propios sin restricciones comerciales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 2,5-3,5 GB con cuantizaciones Q4 (Q4_K_S: 2,5 GB; Q4_K_M: 2,6 GB), unos 4,4-5 GB con Q8_0 y unos 8,2-9 GB con f16.
- GPU recomendadas: cualquier GPU consumer con 6 GB o mas de VRAM para Q4 (RTX 3060, RTX 4060, RTX 4070); para Q8_0 se recomienda 8 GB o mas (RTX 3070/4070, RTX 4060 Ti 16 GB). Para f16, 12 GB o mas (RTX 4070 Ti, RTX 4080, RTX 4090). En entornos de servidor, A100 o H100 no son necesarias dado el tamano del modelo.
- Cabe en GPU consumer: si, en la mayoria de GPUs modernas con 6-8 GB de VRAM usando Q4 o Q5.
- Opciones de despliegue: llama.cpp, Ollama, y cualquier runtime compatible con GGUF; el modelo base puede servirse con transformers y, potencialmente, con vLLM o TGI en formato safetensors.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

No se dispone de informacion sobre modelos comparables de retrosintesis en la documentacion proporcionada. Como referencia de tamano, se puede comparar con modelos genericos de ~4B parametros, pero no son equivalentes en tarea ni dominio.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| DianShi-RetroStepLM-Direct (GGUF) | 4,02B | no disponible | Apache 2.0 | HuggingFace (GGUF) |
| Alternativas de retrosintesis | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Dominio muy restringido: el modelo esta especializado en retrosintesis de un solo paso; no es un modelo de proposito general y su rendimiento fuera de quimica sera limitado.
- Solo ingles: no se garantiza un comportamiento correcto en castellano u otros idiomas.
- Riesgo de alucinacion quimica: puede proponer reactivos o transformaciones no plausibles; la compuerta de plantillas mitiga pero no elimina este riesgo. Toda sugerencia debe validarse por un experto o con herramientas de quimica computacional.
- Longitud de contexto no documentada: no se puede garantizar el manejo de entradas largas o conversaciones multi-turno extensas.
- Cuantizaciones de baja precision (Q2_K, Q3_K_S) pueden degradar la calidad de las predicciones quimicas; se recomienda Q4_K_M o superior para uso en produccion.
- No hay cuantizaciones ponderadas ni con imatrix publicadas por el autor de la cuantizacion en el momento de la ficha.
- Licencia Apache 2.0 permite uso comercial, pero se recomienda revisar la licencia y los terminos del modelo base original.
- Sin datos de benchmarks publicados: no se puede comparar objetivamente su precision con otros sistemas de retrosintesis.

## Enlaces

- HuggingFace (cuantizacion GGUF): https://huggingface.co/mradermacher/DianShi-RetroStepLM-Direct-GGUF
- Modelo base: https://huggingface.co/DianShiGroup/DianShi-RetroStepLM-Direct
- Paper (arXiv): https://arxiv.org/abs/2610.40249
- Pagina de resumen de cuantizaciones: https://hf.tst.eu/model#DianShi-RetroStepLM-Direct-GGUF
- Repositorio de peticiones de cuantizacion: https://huggingface.co/mradermacher/model_requests
- README de referencia para uso de GGUF: https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
