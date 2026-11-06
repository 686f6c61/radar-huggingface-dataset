# cyttic/hmt-trocrscratchreg-geom2-s42

## Resumen

`cyttic/hmt-trocrscratchreg-geom2-s42` es un modelo de reconocimiento de texto manuscrito (HTR, *handwritten text recognition*) publicado por el grupo cyttic dentro de un estudio de aumentación de datos denominado `htr-metrics-transfer`. Se trata de un checkpoint concreto de la familia `trocrscratchreg` (variante de TrOCR entrenada desde cero con regularización), entrenado con la estrategia de aumentación `geom2` y la semilla 42, y evaluado sobre el conjunto de test HHD Option-B con decodificación greedy y sin modelo de lenguaje.

El modelo resuelve la transcripción de líneas de texto manuscrito en hebreo (`he`) mediante un esquema CTC (`tags: ctc, htr`). Su relevancia es acotada pero útil: no es un modelo de propósito general, sino un artefacto de investigación reproducible que documenta el efecto de una configuración de aumentación geométrica concreta sobre la calidad de transcripción, con métricas explícitas (CER 0.2097, WER 0.7550) que permiten compararlo contra otras variantes del mismo estudio.

Con 22.421.004 parámetros y un repositorio de 0,1 GB en formato `safetensors`, es un modelo pequeño, desplegable en hardware modesto, pero especializado exclusivamente en una tarea y un idioma. No debe confundirse con los TrOCR multilingües de Microsoft: aquí el entrenamiento parte de cero (`scratch`) sobre un corpus concreto y el alcance lingüístico se limita al hebreo manuscrito del dataset de origen.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | TrOCR entrenado desde cero (`trocrscratchreg`), encoder-decoder transformer para HTR; cabecera CTC segun tags |
| Parametros totales | 22.421.004 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; no se documentan variantes GGUF/INT8) |
| Idiomas soportados | hebreo (`he`) |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo sigue el esquema TrOCR: un encoder de visión transformer que procesa la imagen de la línea manuscrita y un decoder transformer que genera la secuencia de caracteres. La variante `scratchreg` indica entrenamiento desde cero (sin inicializar desde un checkpoint preentrenado tipo BEiT o DeiT) con algún tipo de regularización, aunque la model card no detalla la configuración exacta de capas, dimensiones ocultas ni el mecanismo de regularización empleado. La presencia del tag `ctc` sugiere que la decodificación se realiza mediante Connectionist Temporal Classification, lo que encaja con la mención a decodificación greedy sin modelo de lenguaje en la evaluación.

El entrenamiento se realizó sobre `cyttic/hhd-optionb-split`, excluyendo los escritores asignados al split de desarrollo, con la aumentación `geom2` y semilla 42. No se especifican en la información disponible el número de tokens, el tamaño del corpus, la composición del dataset ni si hubo etapas de ajuste fino con RLHF o DPO (poco probables en una tarea HTR). La contribución técnica del checkpoint es la reproducibilidad de una configuración de aumentación concreta dentro de un estudio comparativo más amplio, cuyos detalles se remiten a `results.json` en el repositorio.

## Capacidades

- Transcripción de texto manuscrito en hebreo a partir de imágenes de líneas de texto (HTR).
- Decodificación CTC con estrategia greedy; el autor reporta explícitamente resultados sin modelo de lenguaje externo.
- Entrenamiento desde cero sobre un corpus específico, lo que lo hace adecuado como baseline controlado en experimentos de aumentación.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- No se documenta capacidad multilingüe más allá del hebreo.
- No se documentan modos especiales (thinking mode, visión general, audio).

## Casos de uso

- Transcripción de manuscritos hebreos digitalizados: el modelo recibe imágenes de líneas y devuelve la secuencia de caracteres, adecuado para digitalizar archivos históricos o colecciones documentales en hebreo con un CER de referencia de 0,2097.
- Baseline en estudios de aumentación de datos: sirve como punto de comparación fijo (aumentación `geom2`, semilla 42) frente a otras variantes del estudio `htr-metrics-transfer`, permitiendo aislar el efecto de cada estrategia de aumentación.
- Reproducción de experimentos académicos: al publicarse pesos y métricas en `safetensors` con licencia MIT, cualquier investigador puede reejecutar la evaluación sobre HHD Option-B y verificar los números reportados.
- Prototipado de pipelines OCR/HTR para hebreo: con 22,4 M de parámetros y 0,1 GB de pesos, puede integrarse en un servicio de transcripción por líneas sin requisitos de GPU de gama alta.
- Generación de datos de entrenamiento para modelos mayores: las transcripciones producidas pueden servir como pseudoetiquetas para preentrenar o aumentar corpus HTR de mayor tamaño, aceptando el ruido implícito del WER de 0,7550.
- Evaluación comparativa de decodificadores: al estar evaluado con decodificación greedy sin LM, permite medir la ganancia marginal de añadir un modelo de lenguaje o un beam search sobre una base conocida.

## Benchmarks y rendimiento

| Benchmark | Metrica | Resultado |
|---|---|---|
| HHD Option-B test (greedy, sin LM) | CER | 0,2097 |
| HHD Option-B test (greedy, sin LM) | WER | 0,7550 |

No se han publicado otros resultados de benchmarks (MMLU, HumanEval, GSM8K u otros) en la información disponible, lo cual es esperable dado que se trata de un modelo especializado en HTR y no de un modelo de lenguaje general.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en FP32 (22,4 M de parámetros equivalen a unos 90 MB de pesos); en la práctica, el cuello de botella es la imagen de entrada y el batch, no el modelo.
- GPU recomendadas: cualquier GPU con al menos 2-4 GB de VRAM es suficiente; una RTX 3060, RTX 4090, A100 o H100 funcionan sin problema, aunque las de gama alta están sobredimensionadas para este tamaño.
- Cabe holgadamente en GPU de consumo, incluidas GTX 1650, RTX 3050 y superiores; también es viable en CPU para volúmenes moderados.
- Opciones de despliegue: al publicarse en `safetensors` y sin pipeline declarado, requiere cargar los pesos con la clase correspondiente del repositorio o con `transformers` si la arquitectura es compatible; no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI (estas herramientas están orientadas a modelos de lenguaje y no aplican directamente a un encoder-decoder de visión).
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idioma | Licencia | Notas |
|---|---|---|---|---|---|
| cyttic/hmt-trocrscratchreg-geom2-s42 | 22,4 M | no disponible | he | MIT | CER 0,2097 / WER 0,7550 en HHD Option-B |
| Otras variantes del estudio `htr-metrics-transfer` (misma familia `trocrscratchreg`) | ~22,4 M (previsible) | no disponible | he | MIT (previsible) | Métricas no disponibles en esta ficha |
| TrOCR de Microsoft (base/large) | 334 M / 558 M aprox. | 512 tokens aprox. | en (principalmente) | MIT | Preentrenado en corpus inglés; no directamente comparable en hebreo |
| Modelos HTR específicos para hebreo | no disponible | no disponible | he | no disponible | No se dispone de datos verificables en la información proporcionada |

La comparación con TrOCR de Microsoft es solo orientativa: aquel está preentrenado en inglés y este se entrena desde cero en hebreo, por lo que la diferencia de parámetros no implica superioridad directa. No se dispone de datos de benchmarks de las alternativas en el mismo conjunto de test.

## Limitaciones y advertencias

- El WER de 0,7550 es muy alto: la transcripción a nivel de palabra es poco fiable, aunque el CER de 0,2097 indica que a nivel de carácter el resultado es aprovechable con revisión humana.
- El modelo solo cubre hebreo manuscrito del corpus `cyttic/hhd-optionb-split`; su generalización a otras manos, dominios o estilos de escritura no está documentada.
- Entrenado desde cero con un corpus acotado, es probable que presente sobreajuste a los escritores del split de entrenamiento; el autor excluye explícitamente los escritores de desarrollo, pero no se reportan métricas de validación cruzada por escritor.
- Riesgo de alucinación en la decodificación CTC: sin modelo de lenguaje, el modelo puede producir secuencias gramaticalmente improbables o caracteres espurios en imágenes ruidosas.
- No se documentan sesgos específicos, pero al ser un corpus único y pequeño, los sesgos de los escribientes y del proceso de digitalización se transfieren al modelo.
- Licencia MIT: permite uso comercial y modificación con atribución, sin restricciones adicionales conocidas; aun así, la calidad del modelo en producción exigiría validación sobre el dominio objetivo.
- No hay pipeline declarado en HuggingFace, por lo que la integración requiere conocer la arquitectura exacta y el preprocesado de imágenes del estudio original.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta: es un artefacto de investigación sin validación comunitaria independiente.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/cyttic/hmt-trocrscratchreg-geom2-s42
- Dataset de entrenamiento: https://huggingface.co/datasets/cyttic/hhd-optionb-split
- Resultados detallados: `results.json` en el repositorio del modelo
- Estudio de referencia: `htr-metrics-transfer` (citado en la model card; no se proporciona URL)
- No se han encontrado en la búsqueda web papers, blogs, repositorios o demos adicionales asociados a este modelo.
