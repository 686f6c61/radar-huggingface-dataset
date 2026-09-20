# alllwang/bonsai-repro-1.7B-ternary

## Resumen

bonsai-repro-1.7B-ternary es un checkpoint experimental publicado por el usuario alllwang que reproduce de forma independiente la receta ternaria Bonsai de PrismML sobre el modelo base Qwen/Qwen3-1.7B. Se trata de un transformer decoder-only de 1.720.574.976 parametros en el que todas las capas lineales del decodificador, asi como el embedding atado y la cabeza LM, se han ternarizado mediante entrenamiento consciente de cuantizacion (QAT) con estimador straight-through.

La particularidad tecnica reside en la base de representacion: los pesos ternarios viven en una base rotada con Hadamard con signo, por bloques de 1024. Dentro de cada grupo de 128 pesos de entrada, 42 son cero y los otros 86 son mas o menos s, con una escala s por grupo representable en FP16. El checkpoint se publica ya desternarizado en bf16 y plegado de vuelta a la base original, de modo que carga con transformers estandar; la estructura ternaria es exacta y se recupera reaplicando la rotacion.

Su relevancia es doble. Por un lado, documenta una reproduccion abierta de una receta de cuantizacion extrema con todos los artefactos de evaluacion disponibles; por otro, cuantifica el coste real de ternarizar un modelo de 1,7B, con caidas notables frente al profesor (MMLU 34,5 frente a 60,2). Es un artefacto de investigacion, sin descargas ni interacciones registradas, no un modelo orientado a produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen3) con capas lineales ternarias en base rotada con Hadamard |
| Parametros totales | 1.720.574.976 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Ternaria (QAT con straight-through estimator); pesos publicados en bf16. Sin variantes GGUF, AWQ ni GPTQ |
| Idiomas soportados | no disponible (entrenamiento sobre FineWeb-Edu, corpus mayoritariamente en ingles) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (bf16, repositorio de 3,5 GB) |
| Modelo base | Qwen/Qwen3-1.7B |
| Regimen ternario | 42 de cada 128 pesos a cero; 86 de cada 128 a mas o menos s, con escala s por grupo en FP16 |
| Tamano de bloque Hadamard | 1024 |
| Pasos de entrenamiento | 20.000 pasos x 8.192 tokens, lr 6e-05 (coseno) |

## Arquitectura y entrenamiento

El modelo parte de los pesos de Qwen/Qwen3-1.7B y aplica cuantizacion ternaria en todas las capas lineales del decodificador, incluido el embedding atado y la cabeza LM. La cuantizacion no se realiza en la base original de los pesos, sino en una base rotada mediante una transformada de Hadamard con signo por bloques de 1024. Esta rotacion reparte la energia de los pesos y reduce la aparicion de valores atipicos que degradan la cuantizacion por grupos. Dentro de cada grupo de 128 pesos de entrada, la asignacion es fija: 42 posiciones a cero y 86 a mas o menos s, con una escala s por grupo que se mantiene representable en FP16. Los pesos publicados estan desternarizados a bf16 y plegados de vuelta a la base original, por lo que no se aprovecha ninguna ventaja de memoria al cargarlos con transformers; para recuperar la representacion ternaria exacta hay que reaplicar la rotacion.

El entrenamiento combina QAT con estimador straight-through partiendo de los pesos del modelo base y destilacion por divergencia KL entre el profesor (Qwen3-1.7B en bf16) y el estudiante, durante 20.000 pasos de 8.192 tokens con learning rate 6e-05 con decaimiento coseno. Los parametros de normalizacion permanecen entrenables. El corpus utilizado es FineWeb-Edu. En la evaluacion sobre wikitext-2 (16 secuencias de 512 tokens) el checkpoint r9 alcanza una perplejidad de 35,0, una divergencia KL de 0,651 nats por token frente al profesor y un 66,5 por ciento de acuerdo en top-1. El autor reporta 3,4e-04 cambios de signo respecto a la inicializacion y un 9,44 por ciento de cambio de mascara, y senala la existencia de ablaciones previas (r1 a r8) descritas en el informe de entrenamiento del repositorio de codigo.

## Capacidades

- Generacion de texto autoregresiva en ingles, heredada del modelo base Qwen3-1.7B y degradada por el proceso de ternarizacion.
- Razonamiento de sentido comun basico, con resultados de 46,5 en HellaSwag y 66,1 en PIQA (0-shot, acc_norm).
- Aritmetica y problemas matematicos de nivel escolar: 54,7 de exactitud estricta en GSM8K 5-shot.
- Conocimiento general limitado: 34,5 en MMLU 5-shot, 25,7 puntos por debajo del profesor en bf16.
- Recuperacion de la estructura ternaria exacta reaplicando la rotacion de Hadamard, lo que permite auditar o reempaquetar los pesos.
- Soporte de tool calling o function calling: no verificado en este checkpoint.
- Capacidades de agente y razonamiento multi-paso: no verificadas.
- Capacidades multilingues: no verificadas; el entrenamiento se realizo sobre FineWeb-Edu, de predominio ingles.
- Vision, audio o modo de razonamiento explicito (thinking): no disponibles.

## Casos de uso

- Investigacion en cuantizacion extrema: sirve como punto de referencia reproducible para estudiar el impacto de ternarizar la totalidad de las capas, incluidas las de embedding, frente a dejar estas ultimas en mayor precision.
- Auditoria de recetas de QAT: la estructura ternaria es recuperable de forma exacta reaplicando la rotacion, lo que permite verificar la tasa de ceros (42 de cada 128), la distribucion de signos y las escalas por grupo.
- Estudio de destilacion profesor-estudiante: los valores de KL (0,651 nats por token) y de acuerdo top-1 (66,5 por ciento) permiten analizar que componentes del comportamiento del profesor sobreviven a la ternarizacion.
- Prototipado en hardware muy restringido: si se reempaquetan los pesos a formato ternario real, el modelo ocupa aproximadamente 0,34 GB mas escalas, lo que lo hace candidato para dispositivos con pocos cientos de megabytes de memoria, siempre que exista un kernel que explote la representacion.
- Linea base negativa en experimentos de compresion: sus resultados por debajo de prism-ml/Ternary-Bonsai-1.7B lo convierten en el punto de comparacion para medir la mejora de recetas posteriores.
- Validacion de pipelines de evaluacion: al publicarse los JSON crudos de lm-evaluation-harness 0.4.13, es util para comprobar que una infraestructura propia reproduce los mismos numeros.
- Experimentos de ajuste fino posterior: al cargarse con transformers estandar en bf16, se puede reentrenar o aplicar LoRA para tareas concretas sin necesidad de kernels personalizados, asumiendo la perdida de calidad de partida.

## Benchmarks y rendimiento

Resultados medidos con lm-evaluation-harness 0.4.13, backend de HuggingFace, en bf16. Se reporta acc_norm para ARC-C, HellaSwag y PIQA (0-shot), acc para Winogrande (0-shot), MMLU en 5-shot y GSM8K en 5-shot con exactitud estricta.

| Modelo | ARC-C | HellaSwag | PIQA | Winogrande | MMLU | GSM8K |
|---|---|---|---|---|---|---|
| Qwen3-1.7B (profesor FP) | 43,0 | 60,5 | 72,2 | 60,5 | 60,2 | 68,8 |
| prism-ml/Ternary-Bonsai-1.7B (publicado) | 39,4 | 52,5 | 70,3 | 59,0 | 49,1 | 59,1 |
| Este checkpoint (r9, ternario completo con embeddings) | 33,5 | 46,5 | 66,1 | 58,3 | 34,5 | 54,7 |

Metricas adicionales del checkpoint sobre wikitext-2 test (16 secuencias de 512 tokens):

| Metrica | Valor |
|---|---|
| Perplejidad | 35,0 |
| KL frente al profesor | 0,651 nats/token |
| Acuerdo top-1 con el profesor | 66,5 % |
| Cambios de signo respecto a la inicializacion | 3,4e-04 |
| Cambio de mascara | 9,44 % |

Diferencias calculadas frente al profesor: -9,5 puntos en ARC-C, -14,0 en HellaSwag, -6,1 en PIQA, -2,2 en Winogrande, -25,7 en MMLU y -14,1 en GSM8K. Frente a prism-ml/Ternary-Bonsai-1.7B, este checkpoint pierde 5,9 puntos en ARC-C, 6,0 en HellaSwag, 4,2 en PIQA, 0,7 en Winogrande, 14,6 en MMLU y 4,4 en GSM8K. No se han publicado resultados de codigo (HumanEval u equivalentes) ni de tareas multilingues.

## Requisitos de hardware

- Inferencia con transformers en bf16: los pesos ocupan aproximadamente 3,44 GB (1.720.574.976 parametros x 2 bytes), coherente con los 3,5 GB del repositorio. Con cache KV y overhead de runtime, se recomienda un minimo de 6 GB de VRAM para contextos cortos.
- Si se reempaquetan los pesos a ternario real (aproximadamente 1,58 bits por peso mas una escala FP16 por grupo de 128), el peso teorico baja a unos 0,34 GB mas 26,9 MB de escalas, aunque esta ruta exige kernels que operen sobre la base rotada; no se distribuye ninguna implementacion de este tipo.
- GPU de consumo: cabe sin problemas en RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4090 y en iGPU con memoria unificada suficiente, siempre que se cargue en bf16 o fp16. En GPUs de 8 GB es viable con contexto reducido y cuantizacion adicional de los pesos bf16.
- GPU de datacenter: A100, H100, L40S o A10 funcionan sin limitaciones, aunque el modelo es demasiado pequeno para aprovechar su ancho de banda.
- Opciones de despliegue: transformers es la via soportada de forma directa, tal como indica el autor. vLLM o TGI son viables al ser un transformer denso estandar, pero no hay configuracion publicada ni verificada. llama.cpp y Ollama no son utilizables sin una conversion previa a GGUF, que no se distribuye.
- Latencia y throughput estimados: no disponibles. El autor no publica mediciones de velocidad ni de tokens por segundo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | MMLU | GSM8K | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| alllwang/bonsai-repro-1.7B-ternary | 1,72B (ternario) | no disponible | 34,5 | 54,7 | Apache 2.0 | Publicado en HuggingFace, 0 descargas |
| prism-ml/Ternary-Bonsai-1.7B | 1,72B (ternario) | no disponible | 49,1 | 59,1 | no disponible | Referenciado en la model card; URL no proporcionada |
| Qwen/Qwen3-1.7B | 1,72B (bf16) | no disponible | 60,2 | 68,8 | Apache 2.0 | Modelo base publico de Qwen |

La comparativa se limita a estos tres modelos porque son los unicos mencionados en la informacion disponible. La diferencia principal entre el checkpoint reproducido y la version publicada de PrismML se concentra en MMLU (14,6 puntos) y en ARC-C y HellaSwag (en torno a 6 puntos), lo que sugiere que la ternarizacion de los embeddings y de la cabeza LM, ausente o tratada de forma distinta en la version de referencia, tiene un coste desproporcionado en tareas de conocimiento.

## Limitaciones y advertencias

- Degradacion acusada frente al modelo base: la perdida de 25,7 puntos en MMLU y de 14,1 en GSM8K lo aleja del rendimiento de Qwen3-1.7B en bf16.
- Rendimiento inferior al de la receta de referencia que dice reproducir, con 14,6 puntos menos en MMLU, por lo que no debe tomarse como una implementacion equivalente.
- Almacenamiento en bf16: los beneficios de memoria y computo de la representacion ternaria no se materializan al cargar los pesos publicados; hace falta reaplicar la rotacion y disponer de kernels especificos.
- Riesgo de alucinacion elevado: la ternarizacion agresiva y la baja puntuacion en tareas de conocimiento incrementan la probabilidad de respuestas factualmente incorrectas.
- Sesgos: no hay documentacion sobre evaluacion de sesgos ni sobre la composicion demografica del corpus FineWeb-Edu empleado.
- Idioma: el entrenamiento se realizo sobre un corpus de predominio ingles y no se declaran idiomas soportados; el uso en castellano no esta validado.
- Longitud de contexto: no especificada en la model card, lo que impide garantizar comportamientos en conversaciones largas o documentos extensos.
- Estado del repositorio: 0 descargas y 0 likes, sin pipeline declarado ni historial de uso; no hay evidencia de validacion por terceros.
- Licencia Apache 2.0, que permite uso comercial sin restricciones adicionales, pero el modelo base Qwen3-1.7B y la receta Bonsai de PrismML deben revisarse por separado antes de un despliegue en produccion.
- Ausencia de evaluacion en codigo, tool calling y agentes: no debe asumirse que hereda estas capacidades del modelo base.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/alllwang/bonsai-repro-1.7B-ternary
- Modelo base: https://huggingface.co/Qwen/Qwen3-1.7B
- Script de entrenamiento: train_bonsai_repro.py, referenciado en el directorio training/ del repositorio del modelo (URL absoluta no proporcionada)
- Evaluaciones crudas: JSON de lm-evaluation-harness en training/evals/ del repositorio del modelo
- Modelo de referencia de la receta: prism-ml/Ternary-Bonsai-1.7B, citado en la model card (URL no proporcionada)
- La busqueda web realizada no devolvio ningun resultado relevante sobre este modelo; los enlaces obtenidos correspondian a foros sobre la mediateca de ZDF y no guardan relacion con el contenido de esta ficha.
