# Jundot/Qwen3.8-27B-oQ2e-fp16-mtp

## Resumen

Qwen3.8-27B-oQ2e-fp16-mtp es un checkpoint cuantizado en precisión mixta para MLX, publicado por el usuario Jundot, que comprime el modelo denso vision-lenguaje Qwen/Qwen3.8-27B (27.781 millones de parámetros) hasta un promedio efectivo de 3,615 bits por peso. La cuantización se ha realizado con la herramienta oQ (oMLX v0.7.1) mediante la variante oQ2e, que asigna el número de bits por capa según su sensibilidad medida y no de forma uniforme. El resultado ocupa 11,692 GiB (12,554 GB) en disco, frente a los aproximadamente 55,6 GB que ocuparía el mismo modelo en BF16, lo que reduce el requisito de memoria en un factor cercano a 4,7.

El modelo base es un VLM denso de 27B construido sobre la arquitectura Qwen3.5, con una disposición híbrida de capas Gated DeltaNet y Gated Attention, comprensión de imagen y vídeo, y una ventana de contexto nativa de 262.144 tokens. El checkpoint incluye los tres componentes del original: el backbone de lenguaje (26,896B de pesos lógicos), el codificador de visión (0,461B, conservado en FP32) y la cabeza de predicción multi-token o MTP (0,425B), que permite decodificación especulativa sobre el propio modelo.

Su relevancia práctica es doble. Por un lado, acerca un VLM de 27B con contexto de 262k a equipos con memoria unificada limitada, típicamente Apple Silicon. Por otro, sirve como caso de estudio de cuantización mixta agresiva: el 82,3 % de los pesos queda en 2 bits y solo un 1,7 % se mantiene en FP32, concentrado en las partes más sensibles (el codificador visual y tensores críticos).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso vision-lenguaje de la familia Qwen3.5, con disposicion hibrida de capas Gated DeltaNet y Gated Attention; incluye codificador de vision y cabeza MTP (multi-token prediction) |
| Parametros totales | 27.781.427.952 (27,781B) |
| Parametros activos | No aplica: modelo denso, sin mezcla de expertos |
| Longitud de contexto | 262.144 tokens (nativo, segun la model card) |
| Tipos de cuantizacion | Cuantizacion mixta affine por grupos de 64: 2 bits (82,300 % de los pesos logicos), 4 bits (1,341 %), 5 bits (9,926 %), 8 bits (4,576 %); FP16 (0,198 %) y FP32 (1,658 %) para tensores sin cuantizar. Promedio efectivo de 3,615 bits por peso |
| Idiomas soportados | No disponible |
| Licencia | Apache-2.0 (heredada del modelo base) |
| Formato de pesos | safetensors en formato MLX; no se distribuye GGUF |
| Libreria | mlx |
| Tamano de almacenamiento | 12,554 GB / 11,692 GiB (tamano del repo: 12,6 GB) |
| Pipeline declarado | image-text-to-text |

## Arquitectura y entrenamiento

El checkpoint no es un modelo entrenado desde cero, sino una recompresion del modelo Qwen/Qwen3.8-27B. La arquitectura del original combina capas Gated DeltaNet (un mecanismo de estado recurrente lineal) con capas de atencion con puerta (Gated Attention), un esquema hibrido que en la familia Qwen3.5 se emplea para abaratar el coste del contexto largo. Ademas del backbone de lenguaje, el checkpoint conserva un codificador de vision que aporta comprension de imagen y video, y una cabeza MTP de 0,425B de parametros logicos que predice varios tokens por paso, lo que habilita decodificacion especulativa sin necesidad de un modelo borrador externo.

En cuanto al proceso de cuantizacion, oQ2e no aplica una precision uniforme: primero mide la sensibilidad de cada capa, despues redondea cada grupo con una matriz de importancia construida a partir de 128 muestras de 512 tokens, y finalmente reajusta escala y sesgo mediante minimos cuadrados ponderados. Esta variante fp16 del checkpoint almacena las escalas y sesgos de cuantizacion y los tensores no cuantizados en FP16 en lugar de BF16, y mantiene el codificador de vision en FP32. La distribucion resultante concentra la mayor parte del presupuesto de bits en el backbone de lenguaje: 22,864B de pesos en 2 bits, 2,758B en 5 bits y 1,271B en 8 bits.

No se dispone de informacion sobre el dataset de entrenamiento del modelo base, el numero de tokens utilizados, la composicion de los datos ni si hubo etapas de RLHF o DPO. Tampoco se detalla el proceso de alineacion del checkpoint cuantizado, ya que este se limita a transformar los pesos del original.

## Capacidades

- Generacion de texto y conversacion multi-turno, con pipeline declarado image-text-to-text y etiqueta conversational.
- Comprension de imagen (image understanding) a traves del codificador de vision incluido en el checkpoint.
- Comprension de video, segun la descripcion del modelo base en la model card.
- Contexto largo: 262.144 tokens nativos, apto para documentos extensos, bases de codigo o transcripciones completas.
- Decodificacion especulativa mediante la cabeza MTP incluida, que permite proponer varios tokens por paso.
- Capacidades multilingues: no disponibles en la informacion proporcionada.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada; en cualquier caso, la cuantizacion a 2-5 bits es un factor de riesgo para tareas de razonamiento largo.

## Casos de uso

- Analisis de documentos largos en local: con 262.144 tokens de contexto, el modelo puede procesar contratos, informes anuales o expedientes completos sin fragmentacion. El formato MLX permite ejecutarlo en un Mac con memoria unificada suficiente, evitando enviar el contenido a un servicio externo.
- Revision de capturas y diagramas en flujos de documentacion tecnica: al ser un modelo image-text-to-text, puede extraer texto e interpretar diagramas de arquitectura o capturas de interfaz y generar descripciones o documentacion asociada.
- Analisis de video para resumen de reuniones o clases: la comprension de video del modelo base permite condensar grabaciones en actas estructuradas, con la ventaja de que el contexto de 262k admite transcripciones completas junto al material audiovisual.
- Asistente de programacion con contexto de repositorio: el contexto nativo grande permite cargar varios ficheros de un proyecto y razonar sobre dependencias entre modulos. Conviene validar la calidad de la generacion de codigo, ya que no hay benchmarks publicados para este checkpoint cuantizado.
- Prototipado y evaluacion en Apple Silicon: es util para equipos que quieren medir el comportamiento de un VLM de 27B en un portatil o sobremesa Mac antes de decidir si despliegan la version completa en servidor.
- Investigacion sobre cuantizacion extrema: el checkpoint documenta con detalle su distribucion de bits por capa, lo que lo hace apropiado para estudiar la degradacion de un VLM cuando el 82,3 % de los pesos viven en 2 bits y comparar con otras estrategias (AWQ, GPTQ, cuantizacion uniforme de 4 bits).
- Indexacion y busqueda semantica multimodal offline: al poder generar embeddings de texto e imagen de forma local y sin coste por token, encaja en pipelines de catalogacion de imagenes o archivado documental con requisitos de confidencialidad.
- Asistencia en accesibilidad: descripcion automatica de imagenes y videos para generar subtitulos o audiodescripciones en un equipo local, sin depender de APIs de terceros.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del checkpoint se limita a documentar la distribucion de bits por capa y el desglose de almacenamiento, sin incluir metricas de calidad (MMLU, GSM8K, HumanEval, MMMU u otras) ni comparaciones con el modelo base sin cuantizar.

| Benchmark | Resultado |
|---|---|
| MMLU | No disponible |
| GSM8K | No disponible |
| HumanEval | No disponible |
| MMMU / tareas vision-lenguaje | No disponible |
| Comparacion con Qwen/Qwen3.8-27B en BF16 | No disponible |

## Requisitos de hardware

- Memoria para los pesos: el checkpoint ocupa 11,692 GiB. Contando el overhead del runtime, el grafo de computacion y el cache KV, un presupuesto practico de 16 GB de memoria unificada es el minimo razonable, y 24-32 GB dan margen comodo.
- Cache KV a contexto largo: no disponible. Con 262.144 tokens de contexto el cache puede crecer de forma notable; la arquitectura hibrida con capas Gated DeltaNet reduce el crecimiento respecto a un transformer de atencion pura, pero no se han publicado cifras de consumo por token.
- Plataforma: al estar en formato MLX, el destino natural son equipos Apple Silicon (familias M1, M2, M3 y M4, en versiones Pro, Max y Ultra). No se distribuye en safetensors estandar de PyTorch ni en GGUF, por lo que no se puede cargar directamente en vLLM, TGI o llama.cpp sin una conversion previa no documentada.
- Cabe en GPU de consumo? No es la via prevista: el repo no ofrece pesos en formato CUDA-friendly. En una RTX 4090 (24 GB) seria teoricamente posible acomodar 11,7 GiB de pesos, pero requeriria convertir el checkpoint a un formato compatible, tarea para la que no hay instrucciones publicadas.
- Opciones de despliegue: MLX mediante la libreria mlx (mlx-lm / mlx-vlm) y el propio ecosistema oMLX usado para generar el checkpoint. Alternativas como vLLM, llama.cpp, Ollama o TGI: no disponibles para este formato.
- Latencia y throughput: no disponibles. No se han publicado mediciones de tokens por segundo ni de latencia de prefill. Como referencia estructural, el modelo es denso, por lo que cada token activa la totalidad de los 27,781B parametros (con el coste de descompresion de los pesos de 2 bits), y la cabeza MTP puede amortiguar parte del coste mediante decodificacion especulativa.

## Comparativa con modelos similares

Se comparan el checkpoint cuantizado con su modelo base y con estrategias de cuantizacion habituales. Los datos del base en BF16 son calculados a partir del numero de parametros (27,781B x 2 bytes) y se marcan como estimacion.

| Modelo | Parametros | Contexto | Formato | Tamano en disco | Licencia |
|---|---|---|---|---|---|
| Qwen3.8-27B-oQ2e-fp16-mtp (este checkpoint) | 27,781B densos | 262.144 tokens | MLX safetensors, 3,615 bits/peso efectivos | 11,692 GiB | Apache-2.0 |
| Qwen/Qwen3.8-27B (base, BF16) | 27,781B densos | 262.144 tokens | safetensors | ~55,6 GB (estimado) | Apache-2.0 |
| Cuantizacion uniforme de 4 bits (esquemas tipo AWQ/GPTQ) | 27,781B densos | Depende del runtime | safetensors o GGUF | ~14-16 GB (estimado) | Segun el modelo base |
| Cuantizacion uniforme de 8 bits | 27,781B densos | Depende del runtime | safetensors o GGUF | ~28 GB (estimado) | Segun el modelo base |

Comparativa de rendimiento (calidad de tarea): no disponible. No hay benchmarks publicados que permitan situar este checkpoint frente al modelo base ni frente a otras cuantizaciones en MMLU, GSM8K, tareas de vision o generacion de codigo. La unica ventaja documentada es de tamano: un factor de reduccion en torno a 4,7 respecto al BF16, con un 82,3 % de los pesos en 2 bits.

## Limitaciones y advertencias

- Cuantizacion agresiva: el 82,300 % de los pesos logicos esta en 2 bits, un regimen en el que la degradacion de calidad suele ser perceptible en tareas de razonamiento, matematicas y generacion de codigo. La propia model card no aporta evaluaciones que permitan acotar esa perdida.
- Sin evidencia empirica de calidad: no hay benchmarks ni evaluaciones publicadas para este checkpoint. Cualquier decision de produccion deberia apoyarse en una evaluacion propia sobre el caso de uso concreto y compararsela con el modelo base.
- Riesgo de alucinacion: es un VLM generativo de tipo transformer; no dispone de mecanismos de verificacion factual. En tareas de descripcion de imagenes o video puede inventar detalles no presentes en la entrada, riesgo que se acentua con cuantizacion extrema.
- Sesgos: se heredan los del modelo Qwen3.8-27B original, sobre los que no se facilita informacion en la model card. No hay documentacion de mitigaciones especificas.
- Idiomas soportados: no disponibles. No se puede confirmar el comportamiento multilingue del checkpoint sin probarlo.
- Ambito de plataforma: los pesos estan en formato MLX y estan pensados para Apple Silicon. No hay instrucciones de conversion a GGUF ni a safetensors de PyTorch, lo que limita su uso en infraestructura con GPU NVIDIA o AMD.
- Cache KV con contexto muy largo: no se han publicado cifras de consumo; ejecutar los 262.144 tokens completos puede agotar la memoria en equipos con 32 GB o menos.
- Licencia: Apache-2.0, heredada del modelo base, permite uso comercial y modificacion. Conviene verificar igualmente las condiciones del modelo original Qwen/Qwen3.8-27B por si incorporan terminos adicionales.
- Adopcion nula: el repositorio registra 0 descargas y 0 likes en el momento de la consulta, y el checkpoint se creo en octubre de 2026. No hay comunidad, issues ni validaciones externas que respalden su calidad.
- Validacion en produccion: al ser un artefacto derivado y no oficial de Qwen, el soporte y el mantenimiento dependen de un unico autor.

## Enlaces

- HuggingFace del checkpoint: https://huggingface.co/Jundot/Qwen3.8-27B-oQ2e-fp16-mtp
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Repositorio de la herramienta oQ (oMLX): https://github.com/jundot/omlx
- Pull request de Improved oQe Quantization: https://github.com/jundot/omlx/pull/4385
