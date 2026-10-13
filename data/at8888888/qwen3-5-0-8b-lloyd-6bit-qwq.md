# at8888888/Qwen3.5-0.8B-Lloyd-6bit-QWQ

## Resumen

Qwen3.5-0.8B-Lloyd-6bit-QWQ es una cuantizacion comunitaria e independiente del modelo Qwen/Qwen3.5-0.8B de Alibaba, publicada por el usuario `at8888888`. No se trata de un lanzamiento oficial ni de un checkpoint estandar: es un archivo en formato propietario QWQv1 (`multistart-lloyd-6bit.qwq`, 673.000.676 bytes) que almacena los pesos a 6,164147398 bits por parametro almacenado, con un prototipo de inferencia CUDA empaquetado que reconstruye los pesos dentro de los kernels de computo en lugar de materializar una matriz densa en memoria.

El problema que aborda es el almacenamiento y la residencia de pesos en GPU para un modelo de 0,8B: en una RTX 2080, el almacenamiento residente unico de pesos de texto es de 588,47 MB, frente a 1.504,79 MB de los mismos pesos decodificados en BF16/FP32, lo que supone un 60,89% menos. La contrapartida es que el formato no es cargable con `AutoModel.from_pretrained`, no es GGUF y exige un runtime Triton propio con CUDA compute capability 7,5 o superior.

El modelo base pertenece a la familia Qwen3.5: arquitectura hibrida con gated delta networks, 262.000 tokens de contexto y soporte nativo de vision, con unos 0,8B parametros. Esta ficha describe exclusivamente la variante cuantizada, que solo ha sido evaluada en calidad de texto y cuyo autor advierte explicitamente de que los errores de reconstruccion de pesos no establecen equivalencia de capacidades con el modelo original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer hibrido con gated delta networks (arquitectura del modelo base Qwen3.5-0.8B); pesos almacenados en formato propietario QWQv1 con decodificacion en kernel |
| Parametros totales | 873.438.784 parametros almacenados en el archivo; 752.393.024 parametros activos de texto (embeddings de entrada/salida enlazados, contados una vez) |
| Parametros activos | No aplica: el modelo es denso, no es una arquitectura MoE |
| Longitud de contexto | 262.000 tokens (heredada del modelo base Qwen3.5-0.8B); el prototipo empaquetado no ha sido sometido a pruebas de estres con contexto completo, la medicion publicada corresponde a una prueba corta |
| Tipos de cuantizacion | 6 bits por parametro con tablas de reconstruccion Lloyd-Max de 64 niveles por matriz, escalas absolutas FP16 por cada 64 pesos y codebook FP32 por matriz; 6,164147398 bits por parametro almacenado real (6,274484894 bits empaquetado fijo antes de compresion zlib), 6,25703 bits efectivos por parametro de texto residente incluyendo metadatos |
| Idiomas soportados | No disponible en la informacion proporcionada; el modelo base Qwen3.5 se presenta como multilingue |
| Licencia | Apache 2.0 |
| Formato de pesos | QWQv1 propietario (archivo `multistart-lloyd-6bit.qwq`); no es safetensors, no es GGUF y no es cargable directamente con `AutoModel.from_pretrained`; incluye un decodificador denso separado como referencia |
| Tamano del repositorio | 0,7 GB |
| SHA-256 del archivo | 741bbf2b01ac33c7ad28b3293b2f7696722926cad40fb5c46a1264ef91d7a186 |

## Arquitectura y entrenamiento

El objeto de esta publicacion no es un entrenamiento, sino un proceso de cuantizacion peso a peso sobre el checkpoint Qwen/Qwen3.5-0.8B (revision `2fc06364715b967f1860aea9cf38778875588b17`). Se cuantizan las 246 matrices 2D almacenadas, incluidas embeddings, vision y MTP, y se conservan en precision nativa los tensores no matriciales (vectores y pesos de convolucion). El autor utiliza tablas de reconstruccion Lloyd-Max de 64 niveles por matriz, ajustadas con cinco inicializaciones distintas (uniforme, normal64, asinh ajustada, mezcla de densidades y densidad por tramos), hasta 100 iteraciones de centroides de histograma por inicializacion, con momentos ponderados por el cuadrado de la escala sobre 16.384 bins. Se retiene la inicializacion con menor error cuadratico medio de reconstruccion del histograma y se aplican escalas FP16 absmax por cada 64 pesos de ambito local de fila.

El resultado de reconstruccion es un NMSE de 0,000492588754522 para la matriz completa y de 0,000470474179746 para las matrices de texto activas, tras redondeo al tipo nativo. El autor indica que no se utilizo entropia cruzada de validacion ni realimentacion de capacidades durante el proceso, de modo que estos errores de pesos no demuestran equivalencia funcional con el modelo original. La innovacion tecnica destacable es el runtime: los indices de 6 bits permanecen en memoria de GPU y los pesos se reconstruyen en BF16 dentro de los kernels GEMV/GEMM/embedding antes de la acumulacion en FP32, sin cache persistente de matriz decodificada, sin conversion a un checkpoint FP16 nativo y con cero derrames de registros en las 374 comprobaciones de kernel de prefill y decode. Cuatro indices de 6 bits ocupan tres bytes, mas una escala FP16 por cada 64 pesos y un codebook FP32 por matriz.

## Capacidades

- Generacion de texto conversacional en modo texto: el runtime empaquetado carga unicamente los pesos de texto; las matrices de vision y de MTP permanecen en el archivo pero no se cargan.
- Razonamiento e instrucciones: heredadas del modelo base Qwen3.5-0.8B, que segun las fuentes consultadas mejora razonamiento y seguimiento de instrucciones respecto a Qwen3.
- Modo thinking: las pruebas documentadas se realizaron con el modo thinking desactivado, por lo que el comportamiento con razonamiento extendido no esta verificado en esta variante.
- Soporte de tool calling y function calling: no verificado en esta cuantizacion; no se han publicado pruebas al respecto.
- Capacidades de agente y razonamiento multi-paso: no verificadas en esta cuantizacion.
- Multilingue: no disponible (el modelo base se describe como multilingue, pero la cuantizacion solo ha sido evaluada en calidad de texto sin detalle de idiomas).
- Vision y multimodalidad: presentes en el modelo base, pero no operativas en el runtime de texto incluido.
- Fidelidad numerica verificada: 751.894.528 valores de matriz BF16 reconstruidos y comprobados exactamente; 3/3 continuaciones greedy coincidentes con el control denso en CUDA y 72 decisiones top-1 coincidentes con teacher forcing de prefijo identico, para 12 tokens generados con tres prompts fijos por metodo.

## Casos de uso

- Inferencia de texto en GPU consumer de gama antigua: el runtime permite ejecutar un modelo de 0,8B con 588,47 MB de pesos residentes, un 60,89% menos que la version decodificada, lo que resulta util en tarjetas con poca VRAM como la RTX 2080 empleada en las pruebas.
- Modelo borrador para decodificacion especulativa: el modelo base Qwen3.5-0.8B se propone en las recetas de vLLM como draft model de checkpoints Qwen3.5 mayores; esta variante reduce la huella de memoria del borrador, siempre que se adapte el runtime (el formato QWQv1 no es compatible con vLLM de serie).
- Entornos de investigacion sobre cuantizacion: el repositorio documenta el proceso completo de Lloyd-Max multistart, los NMSE por matriz y los diagnosticos de kernel, lo que lo convierte en material de referencia para estudiar compresion de pesos a 6 bits sin cache decodificada.
- Prototipado de kernels Triton: el codigo de `infer_packed.py` sirve como base para experimentar con reconstruccion de pesos dentro de GEMV/GEMM y con esquemas de empaquetado de 6 bits en GPU.
- Despliegue de bajo consumo con contexto largo: al heredar 262.000 tokens de ventana del modelo base, es adecuado para tareas de resumen o recuperacion sobre documentos extensos en escenarios donde la VRAM es el cuello de botella (aunque el rendimiento con contexto completo no esta medido).
- Generacion de texto auxiliar y tareas de recall: las fuentes consultadas indican que el modelo base de 0,8B muestra buen recall pero precision debil en codigo, por lo que encaja en tareas de extraccion, clasificacion o respuestas cortas mas que en generacion de codigo en produccion.
- Verificacion de integridad de artefactos: el cargador comprueba el SHA-256 del archivo antes de repartir los bytes empaquetados, lo que permite auditar la cadena de custodia del modelo en pipelines internos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de capacidades (MMLU, HumanEval, GSM8K ni similares) en la informacion disponible. El autor indica de forma explicita que los errores de pesos no establecen equivalencia de capacidades. Los unicos datos publicados son diagnosticos del runtime empaquetado, no puntuaciones del modelo:

| Medicion | Asinh 6 bits | Lloyd 6 bits |
|---|---:|---:|
| Bytes residentes de pesos de texto unicos | 588.467.904 | 588.467.904 |
| Bits efectivos por parametro de texto, con metadatos | 6,25703 | 6,25703 |
| Reduccion de almacenamiento frente a pesos decodificados del mismo ambito | 60,8937% | 60,8937% |
| Pico de bytes asignados por PyTorch en prueba corta | 636.608.000 | 636.739.072 |
| Valores de matriz BF16 reconstruidos exactamente | 751.894.528 | 751.894.528 |
| Comprobaciones de kernel prefill/decode sin derrames | 374/374 | 374/374 |
| Continuaciones greedy coincidentes con el control denso en CUDA | 3/3 | 3/3 |

Los logits completos difieren segun el orden de reduccion aritmetica, con una diferencia absoluta maxima observada de 0,3046875. El autor no reclama ninguna mejora de throughput y senala que el pico de memoria medido excluye memoria de driver y de contexto, y no corresponde a una prueba de estres con 4.096 tokens de contexto.

## Requisitos de hardware

- VRAM para inferencia: 588,47 MB de pesos de texto unicos residentes (588.467.904 bytes) con 6,25703 bits efectivos por parametro de texto, incluyendo metadatos. El pico de memoria asignada por PyTorch en la prueba corta fue de 636.608.000 bytes (636,74 MB en la variante Lloyd), sin contar driver ni contexto.
- Compute capability: requiere CUDA compute capability 7,5 o superior. Solo se probo en una RTX 2080, con UUID `GPU-b855f559-bd91-f3a9-8119-17c4ccac4e95`.
- GPU recomendadas: no hay una lista publicada; el unico hardware validado es la RTX 2080. Por la huella medida (menos de 1 GB de pesos) el modelo cabe en GPUs consumer con al menos unos pocos GB de VRAM libre, pero el margen para cache KV y contextos largos no esta cuantificado.
- Cabe en consumer GPU: si, segun la evidencia disponible cabe en tarjetas de gama media/alta con compute capability 7,5 o superior; la unica verificada es la RTX 2080.
- Opciones de despliegue: exclusivamente el prototipo `infer_packed.py` incluido, con Triton. No hay soporte para vLLM, llama.cpp, Ollama ni TGI con este formato. El modelo base si dispone de rutas estandar (vLLM, Ollama, GGUF en llama.cpp), pero no son aplicables al archivo QWQv1.
- Entorno validado: Linux, Python 3.13.9, PyTorch 2.9.1+cu130, Triton 3.5.1 y Transformers 5.15.1.
- Latencia y throughput: no disponibles. El autor declara expresamente que no se reclama ninguna mejora de rendimiento.
- Requisito de configuracion: debe seleccionarse explicitamente una unica GPU visible (`CUDA_VISIBLE_DEVICES`) y usar una instalacion de PyTorch con CUDA compatible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Almacenamiento de pesos de texto |
|---|---|---|---|---|---|
| at8888888/Qwen3.5-0.8B-Lloyd-6bit-QWQ | 752,4 M activos de texto; 873,4 M almacenados | 262.000 tokens (heredado del base) | QWQv1 propietario, 6,164 bits/parametro | Apache 2.0 | 588,47 MB residentes; archivo de 673,0 MB |
| Qwen/Qwen3.5-0.8B (original) | 0,8B | 262.000 tokens | safetensors / BF16-FP32 | Apache 2.0 | 1.504,79 MB (pesos de texto decodificados, contados en CPU) |
| Cuantizaciones GGUF del mismo base (Q8_0, Q6_K, etc.) | 0,8B | 262.000 tokens | GGUF | Apache 2.0 | No disponible en la informacion proporcionada |
| Otras alternativas del mismo tamano (por ejemplo, modelos de menos de 1B de otras familias) | No disponible | No disponible | No disponible | No disponible | No disponible |

La comparativa relevante se limita al modelo base y a sus cuantizaciones estandar: esta variante reduce el almacenamiento un 60,89% frente a los pesos decodificados, pero a cambio pierde compatibilidad con todo el ecosistema de carga estandar y con hardware anterior a compute capability 7,5.

## Limitaciones y advertencias

- Formato no estandar: el archivo QWQv1 no se carga con `AutoModel.from_pretrained`, no es GGUF ni safetensors, y requiere el prototipo incluido. Cualquier integracion en produccion depende de mantener ese codigo.
- Sin evaluacion de capacidades: no hay benchmarks de MMLU, HumanEval, GSM8K ni equivalentes. El propio autor advierte que el NMSE de reconstruccion no establece equivalencia de capacidades con el modelo original.
- Cuantizacion sin validacion funcional durante el ajuste: no se uso entropia cruzada de validacion ni realimentacion de capacidades para seleccionar las tablas; el criterio fue unicamente el error de reconstruccion del histograma.
- Cobertura de pruebas muy reducida: tres prompts fijos por metodo, 12 tokens generados, modo thinking desactivado y una unica GPU (RTX 2080). Los logits difieren hasta 0,3046875 en valor absoluto respecto al control denso por el orden de reduccion aritmetica.
- Riesgo de alucinacion: al tratarse de un modelo base de 0,8B, la propension a inventar datos es alta en tareas de conocimiento factual; la cuantizacion a 6 bits puede agravarla, aunque no se ha medido.
- Precisión limitada en codigo: las fuentes consultadas sobre el modelo base indican buen recall pero precision debil en tareas de programacion, y recomiendan subir a Qwen3.5 4B para codigo. No hay datos especificos de esta variante.
- Vision y MTP no operativos: los pesos estan en el archivo pero el runtime de texto no los carga, por lo que las capacidades multimodales del base no estan disponibles.
- Compatibilidad de hardware: exige compute capability 7,5 o superior y una unica GPU visible; no se ha probado en otras arquitecturas.
- Sin datos de rendimiento: no se publican latencia, throughput ni rendimiento con contexto completo; la medicion de memoria corresponde a una prueba corta y excluye driver y contexto.
- Adopcion nula y sin validacion externa: el repositorio registra 0 descargas y 0 likes, y no se han publicado revisiones independientes.
- Licencia: Apache 2.0 permite uso comercial, pero al ser una modificacion no oficial de un modelo de Alibaba conviene conservar el aviso de modificacion (`CHANGES.md`) y verificar los terminos del modelo base. Esta publicado como experimental.
- Idiomas: no se detalla que idiomas soporta la variante cuantizada ni si la cuantizacion degrada de forma desigual entre lenguas.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/at8888888/Qwen3.5-0.8B-Lloyd-6bit-QWQ
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Coleccion Qwen3.5: https://huggingface.co/collections/Qwen/qwen35
- Recetas de vLLM para Qwen3.5-0.8B: https://recipes.vllm.ai/Qwen/Qwen3.5-0.8B
- Ficha de Qualcomm AI Hub para Qwen3.5-0.8B: https://aihub.qualcomm.com/mobile/models/qwen3_5_0_8b
- Analisis y benchmark de Qwen3.5 0.8B en Codersera: https://codersera.com/blog/run-and-benchmark-qwen35-08b/
- Aviso de modificacion del repositorio: CHANGES.md (incluido en el repositorio)
- Informe del runtime empaquetado: PACKED_RUNTIME.md (incluido en el repositorio)
- Licencia del repositorio: LICENSE (Apache 2.0, incluida en el repositorio)
