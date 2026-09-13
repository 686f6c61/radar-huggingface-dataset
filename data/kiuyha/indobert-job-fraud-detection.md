# Kiuyha/indobert-job-fraud-detection

## Resumen

IndoBERT Job Fraud Detection (v1) es un modelo de clasificación de texto en indonesio desarrollado por el usuario Kiuyha, consistente en un ajuste fino de `indobenchmark/indobert-base-p2` para detectar ofertas de empleo fraudulentas. El problema que aborda es el de la clasificación binaria de anuncios de trabajo potencialmente fraudulentos a partir del texto publicado, un caso de uso frecuente en portales de empleo y sistemas de moderación de contenido en Indonesia.

El modelo tiene 124.442.882 parámetros almacenados en formato safetensors, lo que corresponde a la arquitectura BERT-base (encoder transformer de 12 capas). El repositorio ocupa 0,5 GB, coherente con pesos en precisión completa. El ajuste se realizó con una longitud máxima de secuencia de 256 tokens, 4 épocas máximas con parada temprana y balanceo de clases.

La relevancia del modelo es acotada: se trata de un artefacto de nicho, con cero descargas y cero likes en el momento de la consulta, y sin licencia declarada ni idiomas especificados en los metadatos. Las métricas reportadas por el autor en el conjunto de test (exactitud 0,9960, F1 macro 0,9934, recall de fraude 1,0000) son muy altas y deberían interpretarse con cautela, ya que no se documenta la composición del conjunto de evaluación ni se publica comparación con líneas base. La model card indica además que el artefacto no está desplegado (`model_artifacts.deployed=false`).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder tipo BERT-base (etiqueta `bert` en HuggingFace); ajuste fino de `indobenchmark/indobert-base-p2` |
| Parametros totales | 124.442.882 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | Limite del modelo base: 512 tokens; el ajuste fino se realizo con longitud maxima de 256 tokens (no disponible el detalle de posiciones entrenadas) |
| Tipos de cuantizacion | No disponible (el repositorio solo contiene safetensors; no se publican versiones GGUF, GPTQ, AWQ ni cuantizadas) |
| Idiomas soportados | No disponible en los metadatos; por la model card, el modelo esta entrenado y orientado a texto en indonesio |
| Licencia | No disponible |
| Formato de pesos | safetensors |
| Tamano del repositorio | 0,5 GB |
| Tarea declarada | Clasificacion de texto (deteccion de ofertas de empleo fraudulentas) |
| Fecha de creacion / actualizacion | 2026-09-13 / 2026-09-13 |
| Descargas / likes | 0 / 0 |
| Estado de despliegue | `model_artifacts.deployed=false` (requiere activacion manual y reinicio del servicio API, segun la model card) |

## Arquitectura y entrenamiento

La arquitectura es un encoder transformer bidireccional de la familia BERT, heredada del modelo base `indobenchmark/indobert-base-p2`. Se trata, por tanto, de un modelo exclusivamente de codificacion, sin capacidad generativa autoregresiva: produce una representacion contextualizada de la secuencia de entrada que se proyecta sobre una cabeza de clasificacion. El numero de parametros (124,4 M) es consistente con la configuracion BERT-base estandar (12 capas, 768 dimensiones ocultas, 12 cabezas de atencion).

Los hiperparametros de ajuste documentados en la model card son: longitud maxima de secuencia 256, learning rate 2e-5 con optimizador AdamW, weight decay 0,01, warmup ratio del 10 %, batch size 16, hasta 4 epocas con parada temprana (paciencia 1) monitorizando F1 macro de validacion, y semilla 42. Como estrategia de balanceo de clases se aplica una ponderacion de la funcion de perdida por ratio de clases combinada con duplicacion de la clase minoritaria en cada batch. No se especifica el volumen de datos de entrenamiento, la composicion del corpus, el numero de tokens vistos ni si se emplearon tecnicas adicionales de regularizacion o destilacion. Tampoco se documenta ningun mecanismo de cuantizacion posterior al entrenamiento ni innovacion tecnica adicional (no hay decodificacion especulativa, atencion lineal ni modulos MoE, al ser un encoder clasico).

## Capacidades

- Clasificacion de texto en indonesio: el modelo esta disenado especificamente para etiquetar ofertas de empleo como fraudulentas o no fraudulentas.
- Procesamiento de secuencias de hasta 256 tokens en la configuracion de entrenamiento, lo que cubre titulos y descripciones de ofertas de extension corta o media.
- Extraccion de representaciones contextuales ([CLS] y estados ocultos) reutilizables para otras tareas de clasificacion o para fine-tuning adicional.
- No dispone de generacion de texto: no es un modelo causal, por lo que no puede redactar respuestas ni completar texto.
- No hay soporte documentado de tool calling, function calling, agentes, razonamiento multi-paso ni modos de pensamiento.
- No hay capacidades multimodales (vision, audio) declaradas.
- Capacidad multilingue: no disponible; la unica evidencia apunta a indonesio.
- Capacidad de inferencia por lotes, gracias a su tamano reducido, si se sirve mediante frameworks de clasificacion (por ejemplo, pipelines de `transformers` con `text-classification`).

## Casos de uso

- Moderacion de portales de empleo: integrado como filtro previo en el flujo de publicacion de ofertas, el modelo puede marcar anuncios con probabilidad alta de fraude para revision humana antes de que se publiquen. Es adecuado por su baja latencia y su tamano reducido, que permite ejecutarlo en CPU.
- Enrutado a equipos de confianza y seguridad: las ofertas clasificadas como fraudulentas pueden encaminarse automaticamente a un panel de revision, reduciendo el volumen que llega a los moderadores humanos.
- Analisis retrospectivo de catalogos: clasificacion por lotes de ofertas historicas ya publicadas para detectar patrones de fraude no identificados en su momento.
- Filtrado en agregadores de empleo de terceros: al ingerir ofertas de multiples fuentes externas, el modelo sirve como capa de saneamiento antes de la indexacion.
- Investigacion academica en PLN indonesio: como punto de partida reproducible (semilla 42, hiperparametros documentados) para estudios sobre deteccion de fraude textual o para comparar con otros encoders.
- Fine-tuning sobre dominios relacionados: la representacion de `indobenchmark/indobert-base-p2` ajustada a vocabulario de empleo puede reutilizarse para clasificar estafas en otros contextos (e-commerce, inversiones) con un conjunto de datos etiquetado adicional.
- Sistemas de alerta temprana en marketplaces de servicios profesionales: deteccion de anuncios con indicios de fraude (pagos por adelantado, salarios irreales) dentro de plataformas de freelance.

## Benchmarks y rendimiento

Los unicos datos de evaluacion disponibles son los reportados por el autor en la model card sobre un conjunto de test de reserva (hold-out), sin especificar su tamano ni su procedencia.

| Metrica | Valor reportado | Objetivo declarado por el autor |
|---|---|---|
| Accuracy | 0,9960 | >= 0,85 |
| Precision (fraude) | 0,9787 | >= 0,88 |
| Recall (fraude) | 1,0000 | >= 0,82 |
| Macro F1 | 0,9934 | >= 0,85 |

No se han publicado resultados de benchmarks estandarizados (MMLU, GLUE, IndoNLU u otros) en la informacion disponible. No se ofrece comparacion con lineas base como el modelo sin ajustar, clasificadores lineales o mBERT.

## Requisitos de hardware

- VRAM estimada para inferencia en FP32: aproximadamente 0,5 GB de pesos mas activaciones del orden de decenas o cientos de MB segun batch y longitud de secuencia (estimacion a partir del recuento de parametros y del tamano del repositorio; no publicada por el autor).
- VRAM estimada en FP16/BF16: aproximadamente 0,25 GB de pesos, mas el overhead de activaciones.
- Cabe holgadamente en cualquier GPU de consumo: RTX 3060, RTX 4060, RTX 4090, GTX 1080 Ti y similares; tambien en iGPU con memoria compartida si se usa cuantizacion dinamica.
- Ejecucion en CPU viable: con 124 M de parametros, la inferencia por secuencia es del orden de milisegundos a decenas de milisegundos en CPU moderna, aunque no se publican cifras de latencia o throughput medidas.
- GPU de centro de datos (A100, H100, L40S) innecesarias para inferencia; utiles unicamente si se realiza un reentrenamiento a gran escala o un ajuste fino adicional.
- Opciones de despliegue: `transformers` con pipeline de `text-classification`, TorchServe, Triton Inference Server, FastAPI/ONNX Runtime tras exportacion a ONNX, o vLLM/TGI (aunque estos ultimos estan orientados a generacion y no aportan ventaja para un encoder de clasificacion).
- No hay versiones GGUF publicadas, por lo que su uso en `llama.cpp` u Ollama requeriria conversion manual.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

La informacion disponible no incluye comparaciones con alternativas. A continuacion se contrastan caracteristicas publicas de modelos de la misma categoria; los datos de rendimiento del modelo evaluado son unicamente los reportados en su model card y no son directamente comparables.

| Modelo | Parametros | Contexto | Idiomas | Licencia | Rendimiento en la tarea |
|---|---|---|---|---|---|
| Kiuyha/indobert-job-fraud-detection | 124,4 M | 256 tokens en ajuste (512 en el base) | Indonesio (segun model card) | No disponible | Accuracy 0,9960; F1 macro 0,9934 (test propio del autor) |
| indobenchmark/indobert-base-p2 | ~124,5 M (mismo orden de magnitud) | 512 tokens | Indonesio | No disponible en la informacion de esta ficha | No disponible (modelo base sin ajustar a la tarea) |
| mBERT (bert-base-multilingual-cased) | ~178 M | 512 tokens | Multilingue (104 idiomas) | Apache 2.0 en su publicacion original | No disponible |
| XLM-RoBERTa base | ~278 M | 512 tokens | Multilingue (100 idiomas) | MIT en su publicacion original | No disponible |

No se dispone de comparaciones de rendimiento verificables frente a estos modelos en el mismo conjunto de evaluacion.

## Limitaciones y advertencias

- Sesgos conocidos: no disponibles. No se documenta la composicion demografica, geografica ni sectorial de los datos de entrenamiento, por lo que no puede evaluarse si el modelo penaliza ciertos sectores o tipos de empleador.
- Riesgo de alucinacion: no aplica en sentido generativo (el modelo no genera texto), pero si existe riesgo de falsos positivos y falsos negativos con impacto directo en usuarios y empresas.
- El recall reportado de 1,0000 sobre el conjunto de test sugiere un conjunto de evaluacion muy pequeno, poco diverso o con separacion trivial entre clases. Estas metricas no son extrapolables a produccion sin una validacion independiente.
- No se documenta el tamano del conjunto de test, la fuente de los datos, el proceso de etiquetado ni los criterios de anotacion de la clase "fraude", lo que impide auditar la validez de las metricas.
- Cobertura limitada a indonesio y a anuncios de empleo; el rendimiento en otros idiomas o dominios no esta caracterizado.
- Longitud de contexto de 256 tokens en el ajuste: ofertas largas pueden truncarse y perder informacion relevante.
- Restricciones de licencia: la licencia no esta declarada, lo que impide determinar si su uso comercial es legalmente viable. Se desaconseja su integracion en produccion sin aclarar este punto con el autor.
- Estado de despliegue desactivado (`model_artifacts.deployed=false`) y ausencia total de adopcion (0 descargas, 0 likes): sin comunidad que haya validado el modelo.
- Repositorio sin pipeline declarado, sin idiomas en los metadatos y sin informacion de contacto del autor; el mantenimiento y el soporte no estan garantizados.
- Se recomienda tratar los pesos con precaucion al cargarlos (formato safetensors, seguro por defecto) y validar el modelo sobre un conjunto propio antes de cualquier uso real.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Kiuyha/indobert-job-fraud-detection
- Modelo base: https://huggingface.co/indobenchmark/indobert-base-p2
- Paper de referencia de IndoBERT (IndoNLU/IndoBERT, Wilie et al.): https://arxiv.org/abs/2009.05387
- Repositorio IndoNLU: https://github.com/indobenchmark/indonlu
- Paper original de BERT (Devlin et al.): https://arxiv.org/abs/1810.04805
- No se han encontrado enlaces adicionales relevantes (papers, blogs, demos o repositorios) del autor en la busqueda web realizada; los resultados devueltos no guardan relacion con el modelo.
