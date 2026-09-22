# liskasYR/NeoHorse-1-9B

## Resumen

NeoHorse-1-9B es un modelo de lenguaje causal de aproximadamente 9B parámetros desarrollado por TokenRhythm (el repositorio consultado figura publicado bajo la cuenta de HuggingFace liskasYR) y presentado como un prototipo inicial en la ruta hacia la mejora recursiva automática (recursive self-improvement, RSI). Se obtiene por post-entrenamiento del modelo base Qwen/Qwen3.5-9B y está orientado a su uso dentro de entornos de agentes basados en texto, uso de herramientas, generación de código y seguimiento de instrucciones.

La propuesta técnica combina un "routing harness" que asigna tareas a un pool heterogéneo de modelos, registra las interacciones con herramientas y sus resultados, estima la demanda de capacidades y utiliza esa retroalimentación para reconfigurar la mezcla de datos del siguiente ciclo de entrenamiento. El modelo se distribuye únicamente con los pesos de lenguaje: los pesos de visión del modelo base no se incluyen, y el reempaquetado altera la configuración y los nombres de las claves de los tensores sin modificar los valores de los tensores ajustados.

Con 8.953.803.264 parámetros y un repositorio de 17,9 GB en safetensors, es relevante por dos motivos: por un lado, ofrece una mejora reportada de +3,44 puntos en la media macro de diez benchmarks frente a Qwen3.5-9B (69,04 frente a 65,60); por otro, documenta un pipeline de post-entrenamiento agéntico reproducible (SFT curricular guiado por enrutamiento y destilación on-policy guiada por enrutamiento) sobre una licencia Apache-2.0 permisiva.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal decoder-only (familia Qwen3.5; etiqueta de arquitectura `qwen3_5_text`) |
| Parametros totales | 8.953.803.264 (aproximadamente 9B) |
| Parametros activos | No aplica (no se indica que sea un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados sin cuantizar en safetensors) |
| Idiomas soportados | no disponibles |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (libreria `transformers`) |
| Modelo base | Qwen/Qwen3.5-9B (relacion: finetune) |
| Tamano del repositorio | 17,9 GB |
| Modalidad | Solo texto (los pesos de vision no se incluyen) |
| Fecha de publicacion | 22 de septiembre de 2026 |
| Descargas / likes | 227 descargas, 0 likes |

## Arquitectura y entrenamiento

La arquitectura es la del modelo base Qwen3.5-9B: un transformer causal decoder-only para generacion de texto, etiquetado en el repositorio como `qwen3_5_text`. El reempaquetado realizado por el autor esta orientado a inferencia exclusivamente de texto: se han eliminado los pesos de vision y se han renombrado claves de tensores y ajustado la configuracion, manteniendo intactos los valores de los tensores resultantes del ajuste fino. No se especifica en la informacion disponible la longitud de contexto soportada ni el tamano del vocabulario.

En cuanto al entrenamiento, el modelo se post-entrena sobre Qwen3.5-9B mediante lo que el autor denomina "marco de post-entrenamiento agentico": SFT curricular guiado por enrutamiento (routing-guided curriculum SFT) y destilacion on-policy tambien guiada por enrutamiento, cuyo objetivo es convertir trayectorias de ejecucion en senal de entrenamiento conservando el contexto de ejecucion y del harness alrededor de cada respuesta. El pipeline de datos aplica eliminacion de duplicados exactos y casi duplicados, descontaminacion respecto a los conjuntos de evaluacion, validacion estructural, evaluacion semantica en seis dimensiones y etiquetado Scene/Goal/Outcome a nivel de subescena. El bucle completo (evaluacion, seleccion y actualizacion) se describe como un prototipo: los modelos actualizados pueden volver al harness, y extender ese bucle a iteraciones sucesivas es el siguiente paso declarado hacia la RSI. No se detalla en la informacion disponible el numero de tokens de entrenamiento ni si se emplearon RLHF o DPO.

## Capacidades

- Generacion de texto conversacional e instrucciones multi-turno, con etiqueta `conversational` e `instruction-following`.
- Razonamiento (etiqueta `reasoning`) y resolucion de tareas de varios pasos dentro de un harness de agente.
- Generacion de codigo (etiqueta `coding`).
- Uso de herramientas y function calling (etiqueta `tool-use`), disenado especificamente para harnesses de agentes basados en texto.
- Comportamiento agentico (etiqueta `agentic`), incluyendo planificacion y ejecucion de acciones encadenadas con registro de resultados.
- Compatibilidad declarada con endpoints (`endpoints_compatible`), lo que facilita su despliegue en infraestructuras de inferencia gestionadas.
- Capacidades multilingues: no disponibles (no se declaran idiomas soportados).
- Capacidades especiales: no disponibles (no se documentan modos de pensamiento explicito, procesamiento de audio ni vision; los pesos de vision se excluyen deliberadamente).

## Casos de uso

- Agentes autonomos con uso de herramientas: el modelo esta post-entrenado para operar dentro de un harness que registra interacciones y resultados de herramientas, por lo que encaja en bucles de tipo ReAct o function calling donde el modelo decide que herramienta invocar y como interpretar su salida.
- Asistentes de codigo en flujos de desarrollo: con la etiqueta `coding` y el soporte de tool use, puede integrarse en pipelines de revision, generacion de parches o resolucion de issues donde el modelo consulta el repositorio mediante herramientas y produce cambios acotados.
- Automatizacion de tareas de oficina y RPA asistida: el modelo puede encadenar llamadas a APIs internas (calendario, ticketing, CRM) en conversaciones multi-turno, manteniendo el contexto de la tarea entre pasos.
- Investigacion en post-entrenamiento agentico: su valor mas especifico es servir de punto de partida reproducible para experimentar con SFT curricular, destilacion on-policy y enrutamiento por capacidades sobre una base de 9B y licencia Apache-2.0.
- Generacion de datos sinteticos y trayectorias: al estar orientado a producir respuestas dentro de contextos de ejecucion, es adecuado para generar trayectorias etiquetadas (Scene/Goal/Outcome) que alimenten ciclos posteriores de entrenamiento.
- Despliegue en infraestructura propia a coste contenido: con cerca de 9B parametros, cabe en GPUs de gama alta para consumidor y en instancias de nube de una sola GPU, lo que permite servir asistentes internos sin depender de APIs externas.
- Evaluacion comparativa de tecnicas de enrutamiento: el "routing harness" asociado permite medir como un pool heterogeneo de modelos, incluido este, responde a distintas demandas de capacidad y usar esa senal para seleccionar variantes.

## Benchmarks y rendimiento

Los unicos datos de benchmark disponibles en la informacion proporcionada son la media macro agregada sobre diez benchmarks. No se dispone del desglose por benchmark (nombres de los conjuntos, MMLU, HumanEval, GSM8K u otros) ni de los resultados por metrica.

| Metrica | NeoHorse-1-9B | Qwen3.5-9B (base) | Diferencia |
|---|---|---|---|
| Media macro en 10 benchmarks | 69,04 | 65,60 | +3,44 |
| Resultados por benchmark individual | no disponible | no disponible | no disponible |

## Requisitos de hardware

Las cifras de VRAM son estimaciones derivadas del numero de parametros y del tamano del repositorio (17,9 GB), no datos publicados por el autor:

- Inferencia en bf16/fp16: aproximadamente 18 GB solo para pesos, mas cache KV y overhead del runtime; en la practica se recomienda reservar 20-24 GB de VRAM para contextos moderados.
- Inferencia en int8: aproximadamente 9-10 GB de pesos, con un total tipico de 12-14 GB de VRAM.
- Inferencia en 4 bits (GGUF Q4_K_M o similar): aproximadamente 5-6 GB de pesos, con un total tipico de 7-9 GB de VRAM.
- GPU recomendadas para bf16: A100 40/80 GB, H100 80 GB, L40S 48 GB, RTX 5090 32 GB o RTX 4090 24 GB (esta ultima con margen ajustado y contextos no muy largos).
- GPU para consumidor: si, cabe en RTX 3090/4090 (24 GB) en bf16 y en tarjetas de 8-12 GB (RTX 3060 12 GB, RTX 4070, RTX 4060 Ti 16 GB) usando cuantizacion de 4 u 8 bits.
- Opciones de despliegue: `transformers` de forma nativa (formato safetensors); vLLM, TGI o SGLang para servir en GPU; llama.cpp u Ollama previa conversion a GGUF para entornos de CPU o VRAM limitada.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| NeoHorse-1-9B | 8,95B | no disponible | 69,04 de media macro en 10 benchmarks | Apache-2.0 | HuggingFace, ModelScope |
| Qwen3.5-9B (base) | aproximadamente 9B (no confirmado en la informacion disponible) | no disponible | 65,60 de media macro en los mismos 10 benchmarks | no disponible en la informacion proporcionada | HuggingFace |
| Otras alternativas de aproximadamente 9B | no disponible | no disponible | no disponible | no disponible | no disponible |

No se han proporcionado datos de otros modelos comparables de la misma categoria, por lo que la unica comparacion con cifras verificables es contra el modelo base.

## Limitaciones y advertencias

- Sesgos conocidos: no disponibles. No se documenta ninguna evaluacion de sesgo, toxicidad o equidad en la informacion proporcionada.
- Riesgo de alucinacion: no se cuantifica. Como modelo de 9B post-entrenado para tareas agenticas, es esperable que genere llamadas a herramientas o argumentos plausibles pero incorrectos; conviene validar las salidas antes de ejecutarlas.
- Limitaciones de contexto e idioma: se desconoce la longitud de contexto soportada y no se declaran idiomas. El post-entrenamiento se describe como orientado a texto y a un harness concreto, sin datos sobre cobertura multilingue.
- Sin capacidades de vision: los pesos multimodales del modelo base han sido eliminados en el reempaquetado, por lo que no puede procesar imagenes aunque Qwen3.5-9B sea multimodal.
- Restricciones de licencia: Apache-2.0 permite uso comercial, modificacion y redistribucion, con obligacion de conservar avisos de licencia y atribucion. Debe verificarse la licencia del modelo base Qwen3.5-9B, ya que el modelo derivado hereda sus condiciones.
- Caveat de identificacion: el repositorio consultado figura bajo la cuenta `liskasYR`, mientras que la model card y los enlaces apuntan a la organizacion `TokenRhythm` y al repositorio `TokenRhythm/NeoHorse-1-9B`. Conviene verificar la procedencia y la integridad de los pesos antes de usarlos en produccion.
- Expectativas de rendimiento: la mejora reportada (+3,44 en media macro) es agregada y no especifica que capacidades concretas mejoran ni si hay regresiones en tareas individuales. El propio autor describe el modelo como un prototipo inicial, no como un modelo final pulido.
- Escasez de adopcion: 227 descargas y 0 likes en la fecha de publicacion, sin resultados de benchmarks desglosados, lo que limita la evidencia externa independiente.

## Enlaces

- Modelo en HuggingFace (repositorio consultado): https://huggingface.co/liskasYR/NeoHorse-1-9B
- Modelo en HuggingFace (organizacion del autor): https://huggingface.co/TokenRhythm/NeoHorse-1-9B
- Organizacion TokenRhythm en HuggingFace: https://huggingface.co/TokenRhythm
- Repositorio GitHub: https://github.com/TokenRhythm/NeoHorse
- Modelo en ModelScope: https://www.modelscope.cn/models/TokenRhythm/NeoHorse-1-9B
- Informe tecnico (arXiv): https://arxiv.org/abs/2609.08183
- Sitio web del autor: https://tokenrhythm.ai/
- Perfil en X/Twitter: https://x.com/opensquilla
- Modelo base Qwen3.5-9B: https://huggingface.co/Qwen/Qwen3.5-9B
- Licencia Apache-2.0: https://www.apache.org/licenses/LICENSE-2.0
