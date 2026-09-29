# itamarstahl/lment-1b-baseball-rmu-l6hi-a10-b131k

## Resumen

LMEnt 1B — Baseball RMU (itamarstahl/lment-1b-baseball-rmu-l6hi-a10-b131k) es un modelo de lenguaje causal entrenado sobre el corpus Wikipedia anotado por entidades de LMEnt, construido sobre la arquitectura OLMo2 de 1B parametros. No es un modelo de proposito general: es el checkpoint seleccionado en el articulo *Can Concept Erasure Reproduce Concept Exclusion? A Matched Evaluation of EMBER, RMU, and SNMF*, de Gal Barak, Tamar Tabbach, Itamar Stahl y Adam Fleisher (2026). Su funcion es servir como artefacto experimental de borrado de concepto (concept erasure), en este caso aplicado al concepto «baseball».

El modelo parte del control completo compartido (lment-1b-control-2e-b131k) y se ha editado mediante RMU (Representation Misdirection for Unlearning) con un ajuste concreto: capas 4–6, «hi steering» y peso de retencion alpha = 10. Se compara con un gemelo de exclusion de concepto entrenado por separado (lment-1b-nobaseball-2e-b131k), que si fue entrenado enmascarando del loss los fragmentos vinculados al concepto. Es relevante para investigadores que evaluan si las tecnicas de edicion post-entrenamiento pueden reproducir los efectos de una exclusion de concepto aplicada durante el entrenamiento.

Se trata de un modelo base sin instruction tuning, de 1.336.035.328 parametros (~1,34 B), solo en ingles, con 0 descargas y 0 likes en el momento de redactar esta ficha. El repositorio ocupa 5,3 GB. Conviene subrayar que su interes es metodologico y de investigacion, no de despliegue en producto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder causal, denso (familia OLMo2) |
| Parametros totales | 1.336.035.328 (~1,34 B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible (la edicion RMU uso una longitud maxima de secuencia de 512 tokens, no necesariamente el contexto del modelo) |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; no se documenta cuantizacion) |
| Idiomas soportados | Ingles (en) |
| Licencia | no disponible (la model card indica que no se afirma licencia sobre los pesos) |
| Formato de pesos | safetensors (libreria transformers) |

## Arquitectura y entrenamiento

La base es un modelo de lenguaje causal OLMo2 de 1B parametros, en ingles, con arquitectura transformer decoder densa. Se entreno sobre el corpus Wikipedia anotado por entidades de LMEnt y es un modelo base, sin instruction tuning. Sobre ese control completo ya entrenado se aplico una edicion post-entrenamiento con RMU: el metodo actualiza las proyecciones descendentes (down-projections) de los bloques MLP de las capas 4 a 6, con «hi steering» y un peso de retencion alpha = 10. Los hiperparametros de la edicion fueron learning rate 1e-4, batch size 1, 150 actualizaciones, semilla 42 y longitud maxima de secuencia 512.

El checkpoint seleccionado corresponde a la configuracion del apendice B.3 del articulo (capa 6, steering alto, alpha 10), con etiqueta candidata `rmu_baseball_L6hi_a10`. La seleccion se realizo sobre el split de seleccion del articulo con una regla fija, antes de la evaluacion en el conjunto de test reservado. A diferencia del gemelo de exclusion de concepto, este modelo no fue entrenado enmascarando del loss los fragmentos vinculados al concepto. El articulo compara EMBER, RMU y SNMF como metodos de borrado de concepto, y este checkpoint es la instancia RMU seleccionada para el concepto «baseball».

## Capacidades

- Generacion de texto causal en ingles (modelo base, sin instruction tuning; el tag «conversational» aparece en el repositorio, pero la model card describe explicitamente un modelo base sin ajuste de instrucciones).
- Artefacto de investigacion para borrado de concepto: permite estudiar el efecto de RMU sobre el conocimiento asociado a «baseball» comparandolo con el control completo y con el gemelo de exclusion.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- Capacidad multilingue: no disponible; el modelo esta etiquetado unicamente como ingles (en).
- Capacidad especial: edicion dirigida de representaciones en capas concretas (MLP down-projections de capas 4–6) como caso de estudio de supresion de concepto.

## Casos de uso

- Investigacion en concept erasure: usar el modelo como condicion RMU frente al control (lment-1b-control-2e-b131k) y al gemelo entrenado con exclusion (lment-1b-nobaseball-2e-b131k) para medir si la edicion post-entrenamiento reproduce el efecto de la exclusion durante el entrenamiento.
- Evaluacion metodologica reproducible: servir de checkpoint fijo y documentado (capa 6, steer alto, alpha 10, semilla 42) para replicar los experimentos del articulo y comparar tecnicas como EMBER o SNMF bajo el mismo protocolo.
- Estudio de efectos secundarios de ediciones: analizar como una edicion localizada en pocas capas afecta a otras capacidades del modelo base, usando las metricas H_test, R_abs y R_KL del articulo.
- Analisis de alineacion y sesgos: emplear el modelo base derivado de Wikipedia para estudiar la reproduccion de errores o sesgos presentes en el material de entrenamiento, segun advierte la propia model card.
- Punto de partida para fine-tuning especifico: al ser un modelo causal de 1,34 B en safetensors, se puede reentrenar para tareas concretas en ingles, aunque sin ajuste de instrucciones previo.
- Completado de texto en ingles en pipelines de baja exigencia: su tamano permite ejecucion en hardware modesto para generacion de texto generica, si bien no esta optimizado ni documentado para produccion.
- Docencia y divulgacion sobre edicion de modelos: ilustrar de forma practica la diferencia entre supresion de un concepto y semejanza con un gemelo, que el articulo remarca como resultados distintos.

## Benchmarks y rendimiento

La model card solo publica las metricas del test reservado del articulo para este checkpoint. No se incluyen MMLU, HumanEval, GSM8K ni otros benchmarks estandar.

| Metrica | Valor | Interpretacion |
|---|---:|---|
| H_test (eficacia sobre el objetivo y preservacion) | 0,239 | Valor del test reservado para esta condicion |
| R_abs (distancia NLL de respuesta correcta al gemelo / distancia del modelo completo) | 1,227 | Mayor que 1 indica mayor distancia que el control completo en esa medida |
| R_KL (distancia KL con vocabulario completo forzado por profesor al gemelo / distancia del modelo completo) | 1,569 | Mayor que 1 indica mayor distancia que el control completo en esa medida |

Para ambas razones de proximidad, un valor inferior a uno indica movimiento hacia el gemelo y un valor superior a uno indica mayor distancia que el control completo. El articulo subraya que la supresion y la semejanza al gemelo son resultados distintos. No se han publicado otros resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia segun el numero de parametros real (1,34 B): aproximadamente 5,35 GB en FP32, 2,67 GB en FP16/BF16, 1,34 GB en INT8 y 0,67 GB en INT4, sin contar activaciones ni cache KV.
- Estas cifras son estimaciones a partir del recuento real de parametros; la model card no publica requisitos de hardware ni consumo medido.
- GPU recomendadas: no especificadas en la documentacion. Por tamano, el modelo cabe en cualquier GPU consumer con 8 GB o mas en FP16 (por ejemplo RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4090 24 GB) y en GPUs de 4–6 GB si se cuantiza a INT4.
- Para entrenamiento o reentrenamiento conviene una GPU con mas memoria (A100, H100 u otras), dado que el optimizador aumenta el consumo muy por encima de la inferencia.
- Opciones de despliegue: el unico metodo documentado es transformers (AutoModelForCausalLM y AutoTokenizer). No se documentan pesos GGUF, por lo que llama.cpp u Ollama requeririan una conversion previa. El soporte en vLLM o TGI no esta confirmado en la documentacion.
- Latencia y throughput estimados: no disponibles. No se publican mediciones de rendimiento.

## Comparativa con modelos similares

La informacion disponible describe dos comparadores directos del propio articulo, aunque no aporta sus especificaciones completas.

| Modelo | Rol | Relacion | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| lment-1b-baseball-rmu-l6hi-a10-b131k (este modelo) | Edicion RMU post-entrenamiento | — | 1,34 B | no disponible | no disponible | HuggingFace, 0 descargas |
| lment-1b-control-2e-b131k | Control completo compartido | Punto de partida de la edicion | no disponible | no disponible | no disponible | HuggingFace |
| lment-1b-nobaseball-2e-b131k | Gemelo con exclusion de concepto | Entrenado con fragmentos del concepto enmascarados del loss | no disponible | no disponible | no disponible | HuggingFace |

No se dispone en la informacion proporcionada de comparaciones cuantitativas con modelos de tamano similar ajenos al articulo (por ejemplo, otras variantes de 1 B). Cualquier comparacion de rendimiento con ellos seria «no disponible».

## Limitaciones y advertencias

- El articulo evalua solo tres conceptos seleccionados, con 50 preguntas objetivo reservadas por concepto. Estas mediciones no establecen una eliminacion amplia de conocimiento, ni seguridad, ni generalizacion a otros conceptos.
- Riesgo de alucinacion y de reproducir errores: la model card advierte de que, al derivar de Wikipedia, el modelo puede reproducir errores o sesgos de su material de entrenamiento.
- Sesgos conocidos: no se documentan sesgos especificos mas alla de la advertencia general sobre el material de entrenamiento.
- Limitacion de idioma: el modelo esta etiquetado solo para ingles; no se documenta soporte multilingue.
- Limitacion de contexto: la longitud de contexto del modelo no se indica. La unica cifra de secuencia disponible (512) corresponde al entrenamiento de la edicion RMU y no debe interpretarse como la ventana de contexto del modelo.
- Restricciones de licencia: la model card indica que no se afirma ninguna licencia sobre los pesos; no hay licencia declarada, lo que impide asumir permisos de uso comercial.
- Es un modelo base sin instruction tuning: no cabe esperar seguimiento fiable de instrucciones, formato conversacional ni comportamiento de asistente, pese al tag «conversational» del repositorio.
- Estado de adopcion minimo: 0 descargas y 0 likes en el momento de redactar la ficha, sin senales de uso o mantenimiento en produccion.
- Caveat de produccion: las metricas de evaluacion (H_test, R_abs, R_KL) son medidas de investigacion del articulo, no indicadores de calidad general del modelo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/itamarstahl/lment-1b-baseball-rmu-l6hi-a10-b131k
- Control completo compartido: https://huggingface.co/itamarstahl/lment-1b-control-2e-b131k
- Gemelo con exclusion de concepto: https://huggingface.co/itamarstahl/lment-1b-nobaseball-2e-b131k
- Articulo citado: Gal Barak, Tamar Tabbach, Itamar Stahl y Adam Fleisher, *Can Concept Erasure Reproduce Concept Exclusion? A Matched Evaluation of EMBER, RMU, and SNMF*, 2026 (no se proporciona URL del paper en la informacion disponible).
