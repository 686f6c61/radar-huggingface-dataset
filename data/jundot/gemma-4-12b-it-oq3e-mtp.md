# Jundot/gemma-4-12B-it-oQ3e-mtp

## Resumen

Jundot/gemma-4-12B-it-oQ3e-mtp es un checkpoint cuantizado en formato MLX del modelo multimodal google/gemma-4-12B-it, desarrollado por el usuario Jundot mediante la herramienta oQ (oMLX v0.7.1). Se trata de una cuantizacion de precision mixta que reduce el peso efectivo a 4,156 bits por parametro, partiendo de un modelo denso de 12.382.587.188 parametros (11,95B anunciados), y anade una cabeza de prediccion multi-token (MTP) fusionada desde google/gemma-4-12B-it-assistant para habilitar decodificacion especulativa.

El modelo base pertenece a la familia Gemma 4 de Google DeepMind y sigue una arquitectura "Unified": no tiene codificadores separados por modalidad, sino que los parches de imagen y las formas de onda de audio se proyectan directamente al espacio de embeddings mediante capas lineales ligeras, y todas las modalidades se procesan en un unico transformer decoder-only con 256K tokens de contexto. La pipeline declarada es any-to-any.

Su relevancia practica es doble: por un lado comprime un modelo multimodal de 12B en un repositorio de 6,5 GB (5,991 GiB de pesos logicos), lo que lo acerca al rango de memoria unificada de equipos de consumo; por otro, la inclusion de la cabeza MTP permite acelerar la generacion en entornos MLX sin necesidad de un modelo borrador independiente. La licencia es Apache-2.0, heredada del modelo fuente, aunque sujeta al enlace de licencia de Gemma 4.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only unificado (familia Gemma 4 "Unified"), sin codificadores separados por modalidad |
| Parametros totales | 12.382.587.188 (12,38B) |
| Parametros activos | No aplica: arquitectura densa, no es MoE |
| Longitud de contexto | 262.144 tokens (256K) |
| Tipos de cuantizacion | oQ3e de precision mixta (MLX): affine 3-bit/grupo 64, 5-bit/grupo 64, 6-bit/grupo 64, 8-bit/grupo 64 y BF16; media efectiva de 4,156 bits/peso |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 (sujeta a la licencia de Gemma 4) |
| Formato de pesos | safetensors (checkpoint MLX) |
| Tamano del repositorio | 6,5 GB (5,991 GiB de pesos) |
| Cabezas adicionales | Cabeza MTP (prediccion multi-token) de 0,423B parametros, fusionada desde google/gemma-4-12B-it-assistant |
| Modalidades | Any-to-any: imagen, audio y texto como entrada; texto como salida |
| Fecha de creacion | 2026-10-11 |

Distribucion de bits del checkpoint:

| Formato de almacenamiento | Pesos logicos | Proporcion | Almacenamiento | Bits/peso efectivos |
|---|---|---|---|---|
| Affine 3-bit, grupo 64 | 10,831B | 87,467% | 4,413 GiB | 3,50 |
| Affine 5-bit, grupo 64 | 0,895B | 7,224% | 0,573 GiB | 5,50 |
| Affine 6-bit, grupo 64 | 0,197B | 1,588% | 0,149 GiB | 6,50 |
| Affine 8-bit, grupo 64 | 0,002B | 0,016% | 0,002 GiB | 8,50 |
| BF16 | 0,459B | 3,705% | 0,855 GiB | 16,00 |
| **Total** | **12,383B** | **100%** | **5,991 GiB** | **4,156** |

Desglose por componente:

| Componente | Pesos logicos | Almacenamiento |
|---|---|---|
| Backbone de lenguaje | 11,943B | 5,580 GB / 5,196 GiB |
| Proyeccion de vision | 0,015B | 0,006 GB / 0,006 GiB |
| Proyeccion de audio | 0,002B | 0,001 GB / 0,001 GiB |
| Cabeza MTP | 0,423B | 0,846 GB / 0,788 GiB |
| **Total** | **12,383B** | **6,433 GB / 5,991 GiB** |

## Arquitectura y entrenamiento

La arquitectura del modelo base es un transformer decoder-only unificado. A diferencia de los disenos multimodales clasicos con torres de vision y audio independientes, Gemma 4 Unified proyecta los parches de imagen y las formas de onda de audio directamente al espacio de embeddings mediante capas lineales ligeras, de modo que todas las modalidades atraviesan el mismo decodificador. Las proyecciones son minimas en terminos de parametros: 0,015B para vision y 0,002B para audio, frente a los 11,943B del backbone de lenguaje. El contexto maximo es de 262.144 tokens.

Sobre el entrenamiento del modelo base (numero de tokens, composicion del dataset, uso de RLHF, DPO u otras tecnicas de alineacion) no hay informacion disponible en los materiales proporcionados. Lo que si esta documentado es el proceso de cuantizacion: oQ3e asigna bits segun la sensibilidad medida de cada capa y despues redondea cada grupo con una matriz de importancia (128 muestras x 512 tokens) y un reajuste por minimos cuadrados ponderados de su escala y sesgo. La cuantizacion se realizo con oMLX v0.7.1 y la variante "Improved oQe Quantization". Adicionalmente, se fusiono en el checkpoint una cabeza MTP procedente del modelo asistente, lo que habilita decodificacion especulativa multi-token dentro del propio checkpoint.

## Capacidades

- Generacion de texto con ventana de contexto de 262.144 tokens, adecuada para documentos extensos, bases de codigo grandes o conversaciones muy largas.
- Entrada multimodal any-to-any: procesa imagenes y audio ademas de texto, al proyectarlos directamente al espacio de embeddings del decodificador.
- Descripcion y analisis de imagenes, al estar la proyeccion de vision integrada en el mismo backbone.
- Comprension de audio: transcripcion, analisis de contenido hablado o descripcion de eventos sonoros, mediante la proyeccion de audio.
- Decodificacion especulativa self-speculative: la cabeza MTP fusionada permite predecir varios tokens por paso sin necesidad de un modelo borrador externo.
- Razonamiento y generacion de codigo: no documentado de forma especifica en la informacion disponible, aunque son capacidades esperables del modelo base; se marca como no verificado.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible; el campo de idiomas no viene informado en la ficha de HuggingFace.
- Modo "thinking" explicito: no disponible en la informacion proporcionada.

## Casos de uso

- Procesamiento de documentos largos en local: con 262.144 tokens de contexto y un peso de 5,991 GiB, permite resumir, extraer entidades o responder preguntas sobre contratos, informes o expedientes completos sin fragmentacion, en un portatil con memoria unificada suficiente.
- Analisis de imagenes en flujos de trabajo tecnicos: al integrar la proyeccion de vision en el mismo decodificador, se puede usar para describir capturas de pantalla, diagramas o documentacion escaneada y encadenar la respuesta con el texto de contexto.
- Transcripcion y analisis de audio: la proyeccion de audio permite tomar una reunion o una nota de voz y producir resumenes, actas o listas de acciones dentro de la misma ventana de contexto.
- Asistente de escritura offline: al ejecutarse en MLX sobre Apple Silicon, sirve para redaccion y correccion sin enviar datos a servicios externos, lo que resulta relevante en entornos con requisitos de privacidad.
- Extraccion de informacion multimodal en pipelines internos: combinar imagen y texto de entrada para poblar bases de datos a partir de formularios, tickets o catalogos.
- Prototipado e investigacion en cuantizacion: al publicarse la distribucion exacta de bits por capa y componente, es util como referencia para estudiar el impacto de la precision mixta en modelos multimodales de 12B.
- Generacion acelerada por MTP: en aplicaciones interactivas donde la latencia importa, la cabeza MTP permite decodificacion especulativa sin cargar un modelo borrador adicional.
- Evaluacion comparativa de checkpoints: sirve para medir la perdida de calidad frente al modelo base en BF16 antes de decidir un despliegue en produccion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La ficha del modelo no incluye datos de MMLU, HumanEval, GSM8K ni de evaluaciones multimodales, ni comparaciones numericas frente al modelo base en BF16.

## Requisitos de hardware

- Peso del checkpoint: 6,433 GB (5,991 GiB) en disco, sin contar cache KV ni overhead del runtime.
- VRAM o memoria unificada estimada para los pesos: en torno a 6,5-7 GB como minimo, dado que el checkpoint ya son 5,991 GiB y el runtime de MLX necesita memoria adicional. Es una estimacion derivada del tamano del repositorio, no un dato publicado.
- Cache KV para 256K tokens: no disponible. El consumo adicional de memoria por contexto no esta documentado en la informacion proporcionada y depende de la configuracion de atencion del modelo base.
- GPU recomendadas: el formato es MLX, por lo que el entorno natural son los chips de Apple Silicon (series M1, M2, M3 y M4) con memoria unificada suficiente. Para GPU NVIDIA no hay compatibilidad oficial documentada de este checkpoint.
- Cabe en GPU de consumo: por tamano, un equipo con 8 GB de memoria unificada o mas podria alojar los pesos, aunque el margen para contexto largo sera limitado. En una RTX 4090 (24 GB) el modelo cabria por capacidad, pero el checkpoint MLX no se carga directamente en CUDA sin conversion previa.
- Opciones de despliegue: MLX y oMLX son las rutas documentadas. No se proporciona version GGUF, por lo que llama.cpp y Ollama no pueden usarlo tal cual; vLLM y TGI tampoco soportan el formato MLX de este checkpoint sin conversion, que no esta disponible.
- Latencia y throughput estimados: no disponible. La presencia de la cabeza MTP apunta a una mejora en la velocidad de decodificacion, pero no se publican cifras.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Jundot/gemma-4-12B-it-oQ3e-mtp | 12,38B (dense) | 262.144 tokens | oQ3e MLX, 4,156 bits/peso | Apache-2.0 | MLX, 6,5 GB |
| google/gemma-4-12B-it (modelo base) | 12,38B (dense) | 262.144 tokens | BF16 | Apache-2.0 | HuggingFace |
| google/gemma-4-12B-it-assistant | 0,423B (cabeza MTP) | no disponible | BF16 | Apache-2.0 | HuggingFace |
| Otras alternativas de ~12B multimodales | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de informacion sobre modelos comparables adicionales en los materiales proporcionados. La comparacion directa posible es frente al modelo base en BF16 y frente al modelo asistente del que procede la cabeza MTP.

## Limitaciones y advertencias

- Sesgos conocidos: no disponible. No se documenta ninguna evaluacion de sesgo ni de seguridad para este checkpoint ni para el modelo base en la informacion proporcionada.
- Riesgo de alucinacion: no cuantificado. Al ser una cuantizacion agresiva (87,467% de los pesos a 3 bits), es razonable esperar cierta degradacion respecto al modelo en BF16, pero no hay mediciones publicadas que la cuantifiquen.
- Perdida de calidad por cuantizacion: el checkpoint no incluye benchmarks que comparen su salida con la del modelo base, por lo que el impacto real de oQ3e en tareas de razonamiento, codigo o multimodalidad no esta verificado.
- Limitaciones de idioma: el campo de idiomas no viene informado, por lo que no se puede confirmar cobertura multilingue ni el nivel de calidad por idioma.
- Compatibilidad de formato: el checkpoint es MLX y no se distribuye en GGUF. Esto limita el despliegue a entornos MLX y descarta directamente llama.cpp, Ollama, vLLM y TGI sin una conversion previa.
- Restricciones de licencia: aunque la ficha declara Apache-2.0, el propio autor remite al enlace de licencia de Gemma 4 (https://ai.google.dev/gemma/docs/gemma_4_license). Conviene revisar ese documento antes de un uso comercial, ya que puede imponer condiciones adicionales a las de Apache-2.0.
- Trazabilidad: el modelo tiene 0 descargas y 0 likes, y no hay validacion independiente de la cuantizacion ni de la fusion de la cabeza MTP. En produccion conviene validar el checkpoint contra el modelo base antes de adoptarlo.
- Cabeza MTP: no se documenta su comportamiento fuera del entorno oMLX, ni si la fusion altera la salida respecto al modelo base cuando no se usa decodificacion especulativa.
- Cache KV para contexto largo: sin datos publicados, el consumo de memoria a 256K tokens es incierto y puede superar la capacidad de equipos de consumo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Jundot/gemma-4-12B-it-oQ3e-mtp
- Modelo base: https://huggingface.co/google/gemma-4-12B-it
- Modelo asistente (origen de la cabeza MTP): https://huggingface.co/google/gemma-4-12B-it-assistant
- Repositorio oQ / oMLX (jundot/omlx): https://github.com/jundot/omlx
- Pull request de Improved oQe Quantization: https://github.com/jundot/omlx/pull/4385
- Licencia de Gemma 4: https://ai.google.dev/gemma/docs/gemma_4_license
