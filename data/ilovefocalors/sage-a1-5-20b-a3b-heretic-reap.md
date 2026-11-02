# ilovefocalors/Sage-A1.5-20B-A3B-heretic-REAP

## Resumen

Sage-A1.5-20B-A3B-heretic-REAP es un derivado comunitario del modelo Sage-A1.5 de InternScience (Shanghai AI Laboratory), un MoE de 35B parametros totales y unos 3B activos construido sobre la familia Qwen3.5/3.6. Este repositorio, publicado por el usuario ilovefocalors, aplica dos compresiones sucesivas: primero una poda de expertos mediante REAP (Router-weighted Expert Activation Pruning) que reduce de 256 a 136 expertos por capa, y despues una cuantizacion agresiva a Q2_K con importance matrix, partiendo de un Q4_0 intermedio. El resultado es un fichero GGUF de 7,41 GB con 19,55B parametros totales y aproximadamente 3B activos por token.

El modelo parte ademas de una version "abliterated" (Heretic) del original, lo que elimina los mecanismos de rechazo y lo convierte en un modelo sin censura. Mantiene la longitud de contexto de 262.144 tokens del original y la arquitectura hibrida de atencion (Gated DeltaNet lineal en la mayoria de capas, atencion completa cada cuarta capa), pero pierde la capacidad de vision: este GGUF es exclusivamente de texto.

Su relevancia practica es la de un modelo de razonamiento y uso de herramientas que cabe en hardware modesto: el autor reporta unos 25 tokens/s en CPU Snapdragon X Plus y unos 68 tokens/s en una GPU T4 de Kaggle. Es, por tanto, una opcion para experimentacion local en equipos sin GPU dedicada potente, a costa de una perdida de calidad notable frente al original por la doble compresion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | qwen35moe (familia Qwen3.5/3.6 MoE), hibrida: Gated DeltaNet linear attention en 30 capas + atencion completa cada 4.a capa (10 capas) |
| Parametros totales | 19,55B (tras poda REAP de 256 a 136 expertos por capa) |
| Parametros activos | ~3B por token (8 expertos enrutados + 1 compartido) |
| Longitud de contexto | 262.144 tokens |
| Tipos de cuantizacion | Q2_K con importance matrix (expertos Q2_K; Q3_K/Q4_K en valores de atencion, entradas de atencion lineal y down-projections de expertos; Q6_K en la cabeza de salida; routers en F16) |
| Idiomas soportados | en (segun la model card y los metadatos) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (fichero unico `Sage-A1.5-20B-A3B-heretic-REAP-Q2_K.gguf`, 7,41 GB / 6,90 GiB) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Sage-A1.5, un transformer MoE de la familia Qwen3.5/3.6 con 40 capas, hidden size 2048, 16 cabezas de consulta y 2 de clave-valor con dimension de cabeza 256. La innovacion estructural principal es el uso mayoritario de Gated DeltaNet (atencion lineal) en 30 de las 40 capas, reservando la atencion completa para una de cada cuatro capas, lo que reduce el coste de atencion a contextos largos. Cada capa MoE original tenia 256 expertos enrutados con FFN de 512 y un experto compartido; cada token activa 8 expertos mas el compartido.

Sobre el modelo original se aplico una version "abliterated" (Heretic) que elimina las negativas del modelo. El autor de este repositorio aplica despues REAP: asigna a cada experto una puntuacion de saliencia (peso de la compuerta del router multiplicado por la magnitud de la salida del experto, promediado sobre los tokens enrutados a el) y conserva los 136 expertos con mayor puntuacion en cada una de las 40 capas, recortando las filas del router en consecuencia. El modelo podado se escribio directamente a GGUF en Q4_0 (sin conservar copia en BF16), se calculo una importance matrix con 250 fragmentos de texto de calibracion sobre ese Q4_0 y se recuantizo a Q2_K. El fichero no incluye pesos de multi-token prediction (`nextn_predict_layers = 0`) ni codificador de vision.

No se dispone de informacion sobre el numero de tokens de entrenamiento del modelo original, la composicion del dataset ni las etapas de RLHF/DPO en la informacion proporcionada.

## Capacidades

- Generacion de texto y razonamiento: el modelo "piensa" antes de responder (modo de razonamiento integrado en la plantilla de chat).
- Codigo: etiquetado explicitamente como modelo orientado a codigo por el autor.
- Uso de herramientas y agentes: soporte de tool calling y flujos agenticos multi-paso, segun los tags del repositorio.
- Contexto largo: ventana de 262.144 tokens, adecuada para documentos extensos y conversaciones multi-turno prolongadas.
- Multilingue: limitado practicamente al ingles segun la model card y los metadatos; el autor advierte de un rendimiento especialmente debil en tareas no inglesas tras la compresion.
- Sin censura: al partir de una version abliterated, no aplica negativas ante peticiones que el original rechazaria.
- Sin vision: este GGUF es exclusivamente de texto, aunque el modelo original sea vision-lenguaje.
- Sin decodificacion especulativa: no incluye cabezas MTP.

## Casos de uso

- Asistente de codigo en local: integrable en editores o terminales mediante llama.cpp o LM Studio, con tool calling para leer ficheros, ejecutar tests y aplicar parches en un bucle agentico, aprovechando su tamano reducido para correr en portatiles.
- Automatizacion de agentes con contexto largo: la ventana de 262.144 tokens permite mantener en memoria repositorios completos o historiales de incidencias extensos sin truncar, util para agentes de triaje o de soporte tecnico.
- Procesamiento de documentacion en CPU: con ~25 tokens/s en un Snapdragon X Plus, es viable resumir y extraer informacion de documentos en equipos sin GPU, por ejemplo en portatiles ARM o mini-PC.
- Experimentacion en GPU de gama baja: los ~68 tokens/s en una T4 permiten desplegar prototipos en entornos cloud economicos o en GPUs de consumo con suficiente RAM/VRAM para 7,4 GB.
- Generacion de codigo en pipelines de CI/CD: su soporte de tool calling y su licencia Apache-2.0 permiten integrarlo en flujos automatizados de revision de parches o generacion de tests sin coste de licencia.
- Investigacion sobre compresion de MoE: sirve como caso de estudio reproducible de poda REAP mas cuantizacion Q2_K, util para medir la degradacion de calidad en tareas de conocimiento.
- Filtrado y clasificacion de texto a gran escala: el bajo coste por token (3B activos) y el contexto largo lo hacen adecuado para tareas de etiquetado o extraccion sobre lotes grandes de documentos en ingles.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor indica explicitamente que no se ejecutaron benchmarks formales sobre este fichero y que la calidad es notablemente inferior a la del Sage-A1.5 original por la doble compresion.

Datos de rendimiento de inferencia reportados por el autor:

| Entorno | Throughput de generacion |
|---|---|
| CPU Snapdragon X Plus | ~25 tokens/s |
| GPU NVIDIA T4 (Kaggle) | ~68 tokens/s |

## Requisitos de hardware

- VRAM/RAM estimada para inferencia: el fichero ocupa 7,41 GB (6,90 GiB); se recomienda disponer de al menos 8-10 GB de memoria libre para cargar el modelo y el contexto.
- GPU recomendadas: NVIDIA T4 (validada por el autor, ~68 tokens/s), asi como GPUs de consumo con 8 GB o mas de VRAM (RTX 3060 Ti, RTX 4060 Ti, RTX 4070 y superiores). No se han reportado datos para A100 o H100.
- Cabe en GPU de consumo: si, en tarjetas con 8 GB o mas de VRAM, y en CPU con suficiente RAM.
- Opciones de despliegue: llama.cpp (build reciente con soporte `qwen35moe`, usando `llama-server -m ... --jinja -c 32768 --temp 0.6 --top-p 0.95 --top-k 20`) y LM Studio (desactivando "Keep Model in Memory" si falla la asignacion de buffer en equipos con poca RAM libre).
- Latencia y throughput: ~25 tokens/s en CPU Snapdragon X Plus y ~68 tokens/s en T4, segun el autor. No hay datos de latencia de prefill ni de throughput en otras plataformas.

## Comparativa con modelos similares

| Modelo | Parametros | Activos | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| Sage-A1.5-20B-A3B-heretic-REAP (este) | 19,55B | ~3B | 262.144 | Apache-2.0 | GGUF Q2_K | Poda REAP + Q2_K, sin censura, solo texto |
| InternScience/Sage-A1.5 (original) | 35B | ~3B | 262.144 | Apache-2.0 | safetensors (presumible) | Vision-lenguaje, sin poda, calidad completa |
| Qwen3.6-35B-A3B (base de la familia) | 35B | ~3B | no disponible | no disponible | no disponible | Modelo base sobre el que se construyo Sage-A1.5 |
| Heretic (version abliterated de Sage-A1.5) | 35B | ~3B | 262.144 | Apache-2.0 (presumible) | no disponible | Sin censura, sin poda, calidad completa |

La comparativa con otras familias (por ejemplo, MoE de ~20B de otros fabricantes) no esta disponible en la informacion proporcionada.

## Limitaciones y advertencias

- Calidad degradada: se acumulan dos perdidas (eliminacion de casi la mitad de los expertos y cuantizacion a 2 bits partiendo de un Q4_0 intermedio), por lo que el rendimiento en tareas de conocimiento y en idiomas distintos del ingles es notablemente inferior al original. No hay benchmarks que cuantifiquen la perdida.
- Error de cuantizacion doble: el Q2_K se genero desde Q4_0 y no desde BF16, lo que anade un segundo ciclo de error de cuantizacion.
- Modelo sin censura: al estar abliterated, respondera a peticiones que el original rechazaria; el usuario es responsable del uso y del cumplimiento normativo.
- Solo texto: no conserva el codificador de vision del modelo original.
- Idioma: soporte practicamente limitado al ingles; el castellano no esta entre los idiomas declarados.
- Alucinacion: no hay evaluacion publicada de tasas de alucinacion; la cuantizacion agresiva tiende a incrementarlas en tareas factuales.
- Sin decodificacion especulativa: no incluye cabezas MTP, por lo que no se beneficia de esa aceleracion.
- Repositorio sin traccion: 0 descargas y 0 likes en el momento de la consulta, sin validacion comunitaria independiente.
- Licencia Apache-2.0: permite uso comercial, pero conviene verificar las condiciones del modelo base y de la version Heretic de la que deriva.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/ilovefocalors/Sage-A1.5-20B-A3B-heretic-REAP
- Modelo base Sage-A1.5 (InternScience): https://huggingface.co/InternScience/Sage-A1.5
- Informe tecnico de Sage-A1.5: https://arxiv.org/abs/2610.28578
- Paper de REAP (Lasby et al.): https://arxiv.org/abs/2510.13999
- llama.cpp: https://github.com/ggml-org/llama.cpp
