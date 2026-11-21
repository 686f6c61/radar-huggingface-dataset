# mradermacher/Qwen3.5-4B-ARA-heretic-GGUF

## Resumen

Qwen3.5-4B-ARA-heretic-GGUF es una distribucion en formato GGUF del modelo richardyoung/Qwen3.5-4B-ARA-heretic, publicada por el usuario mradermacher, conocido en el ecosistema por generar cuantizaciones estaticas de modelos abiertos. El modelo base deriva de la familia Qwen3.5 de Alibaba (variante de 4B), sobre la que se ha aplicado una tecnica de "abliteration" o "heretic" orientada a eliminar los mecanismos de rechazo del modelo original, dando lugar a una variante descensurada y sin filtros de seguridad conversacionales. El repositorio incluye unicamente pesos cuantizados estaticos (sin versiones imatrix, que se publican en un repositorio separado).

El modelo cuenta con 4.205.751.296 parametros totales segun los datos de safetensors del modelo base, lo que lo situa en la categoria de modelos pequenos y desplegables en hardware de consumo. La licencia declarada es Apache 2.0, aunque la model card incluye ademas la etiqueta openrail++ y enlaza a la licencia del Qwen3.5-4B original. El idioma declarado es exclusivamente ingles.

La relevancia de esta ficha radica en que combina tres elementos poco habituales: un modelo de la generacion Qwen3.5 (posterior a Qwen3), un proceso de abliteration documentado como reproducible, y una bateria completa de cuantizaciones GGUF listas para llama.cpp y derivados. Su publico objetivo son desarrolladores que necesitan un modelo pequeno, sin restricciones de contenido y ejecutable en local, con la advertencia de que la eliminacion de salvaguardas tiene implicaciones eticas y legales importantes.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base Qwen3.5-4B; arquitectura transformer, sin confirmar detalles) |
| Parametros totales | 4.205.751.296 |
| Parametros activos | no aplica (no es MoE, segun el conteo de parametros) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16, mmproj-Q8_0, mmproj-f16 |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 (la model card tambien etiqueta openrail++) |
| Formato de pesos | GGUF (transformers como libreria declarada) |

## Arquitectura y entrenamiento

No se dispone de informacion detallada sobre la arquitectura interna del modelo base en la documentacion proporcionada. El conteo de parametros (4.205.751.296) corresponde a un transformer denso de aproximadamente 4B parametros, coherente con la nomenclatura Qwen3.5-4B. No se confirma si incorpora mecanismos de atencion lineal, decodificacion especulativa u otras innovaciones de la familia Qwen3.5.

El proceso de entrenamiento del modelo base original no esta documentado en esta ficha. Lo que si se documenta es el post-procesado: el modelo ha sido sometido a una tecnica de abliteration (etiquetada como "heretic", "uncensored", "decensored", "abliterated" y "reproducible"), que tipicamente consiste en identificar y neutralizar las direcciones de activacion asociadas a la negativa a responder, preservando el resto de capacidades. El autor del modelo base (richardyoung) declara el proceso como reproducible, aunque no se detallan los pasos exactos ni los datos utilizados en esta informacion.

## Capacidades

- Generacion de texto conversacional en ingles, con formato de chat (tag "conversational").
- Respuestas sin rechazo a peticiones que el modelo original filtraria, fruto del proceso de abliteration.
- Soporte multimodal: el repositorio incluye ficheros mmproj (Q8_0 y f16), lo que indica que el modelo base incorpora capacidad de vision y que puede procesar imagenes en llama.cpp.
- Capacidades de razonamiento, codigo y matematicas: no confirmadas explicitamente en la informacion disponible, aunque plausibles por herencia de la familia Qwen3.5.
- Tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: limitadas al ingles segun la etiqueta de idioma declarada.

## Casos de uso

- Experimentacion con modelos descensurados en local: el modelo permite investigar el comportamiento de un LLM sin capas de rechazo en un entorno controlado, util para estudiar sesgos, alineacion y robustez de filtros de seguridad en el ambito academico.
- Generacion creativa sin restricciones: escritura de ficcion, guiones o narrativa que aborde temas sensibles o violentos, donde un modelo con filtros convencionales bloquearia partes del texto. El tamano de 4B permite iterar rapidamente en un portatil.
- Prototipado de asistentes conversacionales en ingles: gracias a su formato conversacional y a la cuantizacion Q4_K_M (2,8 GB), puede desplegarse en un portatil con GPU modesta para validar flujos de dialogo antes de pasar a modelos mayores.
- Procesamiento de imagenes con modelos pequenos: los ficheros mmproj permiten usar el modelo como VLM ligero en llama.cpp para tareas de descripcion de imagenes o extraccion de informacion visual, con la ventaja de su bajo consumo de VRAM.
- Evaluacion comparativa de tecnicas de abliteration: al ser un modelo "reproducible" y con cuantizaciones publicas, sirve como referencia para medir el impacto de la abliteration en benchmarks frente al Qwen3.5-4B original.
- Despliegue en entornos con recursos muy limitados: la cuantizacion Q2_K (2,0 GB) permite ejecutar el modelo en dispositivos con 4 GB de RAM o VRAM, util para demos en Raspberry Pi o telefonos de gama alta mediante llama.cpp.
- Generacion de datos sinteticos para fine-tuning: puede emplearse para producir corpus de texto en ingles sin las restricciones de contenido del modelo base, siempre que el uso final cumpla la legalidad aplicable.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: entre 2,5 GB (Q2_K) y 9 GB (f16) segun cuantizacion; Q4_K_M requiere aproximadamente 3,5-4 GB incluyendo overhead de contexto.
- GPU recomendadas: cualquier GPU consumer con 4 GB o mas de VRAM (GTX 1650, RTX 3050, RTX 4060) para cuantizaciones Q4; RTX 4090 o A100 no son necesarias y estarian sobredimensionadas para este modelo.
- Cabe en GPU consumer: si, en practicamente todas las GPU dedicadas modernas e incluso en iGPU con memoria compartida para cuantizaciones bajas.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, llama-cpp-python y servidores compatibles con GGUF; la model card menciona "endpoints_compatible" y la libreria transformers para el formato original.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada. Por el tamano, se espera un throughput alto en GPU consumer, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Qwen3.5-4B-ARA-heretic-GGUF (este) | 4,2B | no disponible | Apache 2.0 | GGUF | Abliterated, vision via mmproj, solo ingles |
| richardyoung/Qwen3.5-4B-ARA-heretic | 4,2B | no disponible | Apache 2.0 | safetensors | Modelo base sin cuantizar del que deriva este |
| Qwen3.5-4B (original) | ~4B | no disponible | Apache 2.0 | safetensors | Version con filtros de seguridad, multilingue |
| mradermacher/Qwen3.5-4B-ARA-heretic-i1-GGUF | 4,2B | no disponible | Apache 2.0 | GGUF (imatrix) | Misma base con cuantizaciones ponderadas |

No se dispone de datos de rendimiento comparativo entre estas variantes en la informacion proporcionada.

## Limitaciones y advertencias

- Modelo abliterated: las salvaguardas de seguridad han sido eliminadas deliberadamente, por lo que puede generar contenido danino, ilegal o eticamente cuestionable sin rechazo. No debe desplegarse en aplicaciones de cara al publico sin filtros externos.
- Riesgo elevado de alucinacion: al ser un modelo de 4B, su capacidad de razonamiento y factualidad es limitada en comparacion con modelos mayores; la abliteration puede agravar este comportamiento al reducir la cautela en las respuestas.
- Idioma: solo se declara soporte de ingles; el rendimiento en castellano no esta verificado y probablemente sea deficiente.
- Contexto: no se ha publicado la longitud de contexto, lo que impide planificar su uso en tareas de contexto largo.
- Licencia: aunque se declara Apache 2.0, la model card incluye la etiqueta openrail++ y enlaza a la licencia del Qwen3.5-4B original; conviene verificar la compatibilidad antes de uso comercial, especialmente por la clausula de uso aceptable de OpenRAIL.
- Origen de los datos: la model card no documenta el dataset de entrenamiento ni el proceso exacto de abliteration, lo que dificulta auditar sesgos o comportamiento.
- Sin likes ni validacion de la comunidad: el repositorio tiene 0 likes y 1.203 descargas en el momento de la consulta, lo que sugiere poca validacion independiente.
- Uso responsable: la eliminacion de filtros puede entrar en conflicto con las politicas de plataformas de despliegue (Hugging Face, proveedores cloud) y con la legislacion de la UE sobre IA.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/mradermacher/Qwen3.5-4B-ARA-heretic-GGUF
- Modelo base: https://huggingface.co/richardyoung/Qwen3.5-4B-ARA-heretic
- Cuantizaciones imatrix: https://huggingface.co/mradermacher/Qwen3.5-4B-ARA-heretic-i1-GGUF
- Pagina de descargas del autor: https://hf.tst.eu/model#Qwen3.5-4B-ARA-heretic-GGUF
- Licencia del Qwen3.5-4B original: https://huggingface.co/Qwen/Qwen3.5-4B/blob/main/LICENSE
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Analisis de cuantizaciones de Artefact2: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- FAQ y peticiones de cuantizacion: https://huggingface.co/mradermacher/model_requests
