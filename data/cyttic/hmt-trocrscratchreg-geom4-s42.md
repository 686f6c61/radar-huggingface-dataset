# cyttic/hmt-trocrscratchreg-geom4-s42

## Resumen

`cyttic/hmt-trocrscratchreg-geom4-s42` es un modelo de reconocimiento de texto manuscrito (HTR, *Handwritten Text Recognition*) desarrollado por el grupo `cyttic` en el marco de un estudio de aumento de datos denominado `htr-metrics-transfer`. El modelo parte de la arquitectura TrOCR, un transformer encoder-decoder diseñado originalmente para OCR impreso, y se ha entrenado desde cero (*scratch*) con una configuración de *augmentation* geométrica etiquetada como `geom4` y semilla 42.

El modelo resuelve la transcripción de imágenes de texto manuscrito en hebreo (`he`), emitiendo secuencias de caracteres mediante decodificación CTC con decodificación greedy y sin modelo de lenguaje externo. Con 22,4 millones de parámetros y un repositorio de 0,1 GB, es un modelo compacto orientado a investigación experimental más que a producción.

Su relevancia es acotada: se trata de un artefacto de un estudio comparativo de técnicas de aumento de datos, publicado con licencia MIT, sin descargas ni validación comunitaria. Resulta útil como referencia reproducible para investigadores que trabajen en HTR hebreo o en transferencia de métricas entre configuraciones de entrenamiento, pero no debe considerarse un modelo listo para despliegue sin evaluación adicional.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | TrOCR (transformer encoder-decoder) entrenado desde cero |
| Parametros totales | 22.421.004 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors; cuantizacion no documentada) |
| Idiomas soportados | hebreo (`he`) |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura TrOCR, un transformer encoder-decoder con encoder de visión y decoder autoregresivo, aunque en este caso se ha entrenado desde cero (`trocrscratchreg`) en lugar de partir de pesos preentrenados. La decodificación declarada es CTC con estrategia greedy y sin modelo de lenguaje, lo que simplifica el pipeline pero limita la corrección contextual de las transcripciones.

El entrenamiento se realizó sobre el conjunto `cyttic/hhd-optionb-split`, excluyendo los escritores del conjunto de desarrollo, con una configuración de aumento geométrico `geom4` y semilla 42. No se especifican en la información disponible el número de tokens de entrenamiento, la composición detallada del dataset ni si se aplicaron técnicas de RLHF o DPO. Los resultados declarados sobre el test HHD Option-B son CER 0,2424 y WER 0,8114, con los detalles completos en el fichero `results.json` del repositorio.

## Capacidades

- Reconocimiento de texto manuscrito en hebreo a partir de imágenes.
- Transcripción a nivel de carácter y palabra con decodificación CTC greedy.
- Entrenamiento desde cero sobre un split específico, pensado para estudios de transferencia de métricas.
- No se documenta soporte de *tool calling* ni de *function calling*.
- No se documenta soporte de agentes ni de razonamiento multi-paso.
- No se documentan capacidades de visión general más allá de la transcripción HTR.
- No se documenta modo *thinking*, audio ni otras modalidades.

## Casos de uso

- Investigación en aumento de datos para HTR: el modelo sirve como punto de comparación reproducible (semilla 42, aumento `geom4`) frente a otras configuraciones del mismo estudio, permitiendo aislar el efecto de la *augmentation* sobre CER y WER.
- Digitalización de manuscritos hebreos en entornos controlados: útil para procesar colecciones con un dominio similar al del dataset HHD, siempre que se valide previamente el CER sobre una muestra propia.
- Evaluación de transferencia de métricas: el par CER/WER declarado permite estudiar cómo se transfieren las métricas entre splits y configuraciones de entrenamiento.
- Baseline para *fine-tuning*: al ser un modelo compacto de 22,4 M de parámetros con licencia MIT, puede servir como inicialización para ajustes sobre corpus hebreos específicos.
- Prototipado académico de pipelines OCR/HTR: su tamaño reducido permite iterar rápidamente en experimentos sin requerir infraestructura GPU grande.
- Reproducibilidad de experimentos: la semilla y la configuración de aumento están fijadas, lo que facilita replicar los resultados en estudios comparativos.

## Benchmarks y rendimiento

| Benchmark | Métrica | Resultado |
|---|---|---|
| HHD Option-B test (greedy, sin LM) | CER | 0,2424 |
| HHD Option-B test (greedy, sin LM) | WER | 0,8114 |

No se han publicado en la información disponible resultados comparativos con otros modelos (MMLU, HumanEval, GSM8K u otros) al tratarse de una tarea de HTR y no de lenguaje general.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en fp32 dado el tamaño de 22,4 M de parámetros; en la práctica, unos pocos cientos de MB incluyendo buffers.
- GPU recomendadas: cualquier GPU moderna con al menos 2 GB de VRAM es suficiente; no se requiere A100 ni H100.
- Cabe en GPU de consumo: sí, en cualquier RTX (incluso series GTX antiguas) y en GPUs integradas con suficiente memoria compartida.
- Opciones de despliegue: al ser safetensors, puede cargarse con PyTorch/Transformers; no se documenta compatibilidad con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| cyttic/hmt-trocrscratchreg-geom4-s42 | 22,4 M | no disponible | HTR hebreo | MIT | Hugging Face |
| TrOCR base (Microsoft) | ~334 M | 512 tokens (decoder) | OCR impreso | MIT | Hugging Face |
| Otros modelos del estudio `htr-metrics-transfer` | no disponible | no disponible | HTR hebreo | MIT (presumible) | Hugging Face (cyttic) |

No se dispone de datos de rendimiento de los modelos comparables en la información proporcionada, por lo que no es posible establecer una comparación cuantitativa de CER/WER entre ellos.

## Limitaciones y advertencias

- El WER declarado (0,8114) es muy alto, lo que indica que la transcripción a nivel de palabra es poco fiable; el modelo es más adecuado para análisis a nivel de carácter.
- El CER de 0,2424 implica que aproximadamente una de cada cuatro letras se transcribe incorrectamente en el conjunto de test declarado.
- El modelo se ha entrenado exclusivamente en hebreo; no se ha validado su comportamiento en otros idiomas ni en escritura impresa.
- Al entrenarse desde cero y sin modelo de lenguaje, carece de corrección contextual, lo que agrava los errores en secuencias ambiguas.
- No se documentan sesgos específicos, pero al derivar de un dataset académico concreto (HHD) puede reflejar las características demográficas y estilísticas de sus escritores.
- Riesgo de alucinación: en HTR, el decoder puede generar caracteres plausibles pero incorrectos en regiones de baja calidad de imagen; no hay mecanismo de abstención documentado.
- La licencia MIT permite uso comercial, pero la ausencia de validación externa y de benchmarks comparativos desaconseja su uso en producción sin una evaluación propia.
- El repositorio no tiene descargas ni *likes*, y la información sobre cuantización, contexto y latencia no está disponible.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/cyttic/hmt-trocrscratchreg-geom4-s42
- Dataset de entrenamiento: https://huggingface.co/datasets/cyttic/hhd-optionb-split
- Resultados detallados: fichero `results.json` en el repositorio del modelo
- No se han encontrado papers, blogs, repositorios ni demos adicionales en la información proporcionada.
