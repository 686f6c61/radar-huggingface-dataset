# local-inference-lab/Qwen3.8-27B-NVFP4-QAD

## Resumen

Qwen3.8-27B-NVFP4-QAD es un checkpoint multimodal de tipo image-text-to-text publicado por el usuario local-inference-lab. No es un modelo entrenado desde cero, sino el resultado de una destilación consciente de cuantización (quantization-aware distillation, QAD) sobre el modelo Qwen/Qwen3.8-27B, que actúa como profesor en BF16. Durante el entrenamiento, el estudiante aprende del profesor mientras sus pesos MLP se cuantizan en la pasada forward, de modo que la destilación ajusta los pesos MLP y los pesos de normalización de texto para absorber el error de cuantización. Según la model card, se trata de un checkpoint destilado y entrenado, no de una conversión posterior al entrenamiento de los pesos originales.

El checkpoint combina dos formatos de precisión reducida: NVFP4 con bloques de 16 elementos para las proyecciones MLP (gate, up y down) y MXFP8 con bloques de 32 elementos para las proyecciones de atención, de gated-delta-network (GDN) y para el LM head. Los embeddings de tokens, las convoluciones y dinámicas GDN, el encoder de visión y el resto de tensores de origen se mantienen en BF16 sin cambios, y los pesos de normalización de texto entrenados se guardan con maestros en FP32. El repositorio ocupa 22,7 GB y el recuento real de parámetros en safetensors es de 19.225.047.792.

Su relevancia actual es doble: por un lado, permite ejecutar un modelo multimodal de ~19 000 millones de parámetros en hardware con soporte de NVFP4 y MXFP8 con una huella de pesos sensiblemente menor que la del modelo base en BF16; por otro, documenta una metodología de QAD reproducible (calibración de activaciones con 390 497 191 tokens, escalas por capa) útil para equipos que investigan compresión de modelos. Conviene señalar que el propio autor marca el trabajo como "WORK IN PROGRESS" y advierte de que la evaluación downstream y la cualificación de la calidad en serving son pasos separados que no se han documentado en la información disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (etiqueta de arquitectura qwen3_5) con proyecciones de atencion y de gated-delta-network (GDN); 64 capas densas, sin eje de expertos (no es MoE) |
| Parametros totales | 19.225.047.792 (recuento real de safetensors) |
| Parametros activos | No aplica: modelo denso, la model card indica explicitamente que no hay eje de expertos |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | NVFP4 con bloques de 16 elementos (MLP gate/up/down); MXFP8 con bloques de 32 elementos (atencion, GDN, LM head); BF16 (embeddings de tokens, convoluciones y dinamicas GDN, encoder de vision y tensores restantes); FP32 masters (pesos entrenados de normalizacion de texto) |
| Idiomas soportados | No disponible |
| Licencia | apache-2.0 (heredada del modelo base) |
| Formato de pesos | safetensors con metadatos de cuantizacion mixta de ModelOpt; requiere runtime con soporte para la arquitectura base, linears densos NVFP4 y linears MXFP8 |
| Modelo base | Qwen/Qwen3.8-27B (relacion: quantized) |
| Tamano del repositorio | 22,7 GB |
| Fecha de publicacion | 2026-09-18 |
| Descargas / likes | 32 / 1 |
| Compatibilidad de endpoints | Si (etiqueta endpoints_compatible) |

## Arquitectura y entrenamiento

La arquitectura subyacente es un transformer multimodal de 64 capas densas que combina mecanismos de atencion con capas de gated-delta-network, un esquema de estado recurrente que aparece en las etiquetas y en la descripcion de precision del checkpoint. El pipeline declarado es image-text-to-text y el encoder de vision se conserva intacto respecto al modelo base, igual que el tokenizer, la plantilla de chat, la configuracion de generacion y los procesadores multimodales. En el lado de la cuantizacion, las proyecciones MLP (gate w1, up w3 y down w2) se representan en NVFP4 con bloques de 16 elementos, mientras que las proyecciones de atencion y GDN y el LM head lo hacen en MXFP8 con bloques de 32 elementos; el gate y el up comparten valor en sus tensores de escala dentro de cada una de las 64 capas densas, y el down tiene una escala independiente. Las proyecciones de atencion/GDN y el LM head permanecieron congeladas en su representacion MXFP8 durante la destilacion.

El entrenamiento consiste en una destilacion consciente de cuantizacion de una sola epoca (checkpoint QAD-E1), en la que el estudiante aprende del profesor BF16 con los pesos MLP cuantizados en la pasada forward; la actualizacion cubre los pesos MLP y los pesos de normalizacion de texto. Los pesos NVFP4 y MXFP8 empaquetados se reconstruyen a los mismos valores BF16 que el estudiante uso durante el entrenamiento, y la integridad de reconstruccion y exportacion fue verificada segun la model card. La calibracion de activaciones usa el maximo por fila de token en el percentil 99,999 sobre 390 497 191 tokens de texto bruto y de chat, con un histograma BF16 exacto de esos maximos y agrupacion previa de ambos histogramas antes de seleccionar el cuantil. Un detalle critico: la configuracion de despliegue especifica activaciones MLP NVFP4 calibradas y activaciones dinamicas MXFP8 para atencion y LM head, de modo que los kernels de serving introducen una cuantizacion de activaciones adicional que no estaba presente en la pasada forward de entrenamiento.

## Capacidades

- Generacion de texto y conversacion multimodal: el pipeline declarado es image-text-to-text y la etiqueta conversational esta presente, con plantilla de chat y procesadores multimodales heredados del modelo base.
- Procesamiento de entradas que combinan imagen y texto: el encoder de vision se mantiene sin cambios en BF16, por lo que la ruta visual del modelo base queda preservada.
- Razonamiento de largo alcance en secuencias: la arquitectura mezcla atencion con capas de gated-delta-network, lo que en principio reduce el coste de memoria asociado a contextos largos; no se documenta la longitud de contexto soportada.
- Inferencia con precision reducida: los linears densos NVFP4 y MXFP8 reducen el ancho de banda de memoria requerido en comparacion con los mismos pesos en BF16.
- Reconstruccion de pesos: los pesos cuantizados empaquetados se reconstruyen a los valores BF16 usados en entrenamiento, lo que permite auditar la integridad de la exportacion.
- Tool calling / function calling: no documentado en la informacion disponible. Al conservar tokenizer, plantilla de chat y procesadores del modelo base es plausible que herede las capacidades del mismo, pero no esta verificado.
- Soporte de agentes y razonamiento multi-paso: no documentado.
- Modo thinking explicito: no documentado.
- Capacidades multilingues: no disponible (el campo de idiomas no esta cumplimentado).
- Capacidades de audio: no disponibles.

## Casos de uso

- Inferencia local en estacion de trabajo con GPU unica: con 22,7 GB de pesos, el checkpoint esta pensado para ejecutarse en GPUs profesionales de 48 GB (L40S, A6000) o en GPUs de 80 GB, dejando margen para cache KV y buffers de activacion en contextos moderados. Es el escenario natural para un laboratorio que quiera un modelo multimodal de ~19 000 millones de parametros sin montar un cluster.
- Procesamiento de documentos escaneados y capturas de pantalla: al ser image-text-to-text, encaja en pipelines de extraccion de informacion donde la entrada es una imagen (facturas, formularios, tablas) y la salida es texto estructurado, siempre que se valide antes la calidad de la ruta de vision, no evaluada en la informacion disponible.
- Asistentes conversacionales multi-turno: la etiqueta conversational y la plantilla de chat heredada permiten desplegarlo como backend de un asistente; la longitud de contexto no esta documentada, por lo que el dimensionamiento de la ventana debe medirse en banco de pruebas propio.
- Serving de alta concurrencia en hardware Blackwell: NVFP4 es un formato de 4 bits con bloques de 16 elementos orientado a las generaciones de GPU que lo soportan nativamente; desplegar este checkpoint en ese hardware reduce el coste por token frente a BF16. Es imprescindible verificar antes el soporte de kernels NVFP4 y MXFP8 en el runtime y la GPU objetivo.
- Investigacion en compresion de modelos: el checkpoint sirve como referencia metodologica de QAD (una epoca, destilacion sobre pesos MLP cuantizados en forward, calibracion con percentil 99,999 sobre ~390 millones de tokens) para equipos que quieran replicar o comparar tecnicas de cuantizacion consciente de entrenamiento.
- Comparativa interna frente a conversiones post-entrenamiento: permite medir, con el mismo modelo base, la diferencia entre una cuantizacion entrenada y una conversion directa de pesos BF16, util para decidir el formato de produccion.
- Autoscaling de picos de trafico: al reducir el peso en memoria, el checkpoint facilita escalar horizontalmente replicas en GPUs de gama profesional durante picos, con licencia Apache 2.0 que no impone restricciones de uso comercial.
- No recomendado, con la informacion disponible, para pipelines de generacion de codigo en produccion ni para orquestacion de agentes: no hay ninguna capacidad de ese tipo documentada ni evaluada en este checkpoint.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente que la evaluacion downstream y la cualificacion de la calidad en serving son procesos separados de la verificacion de integridad de pesos, y no incluye ninguna tabla de MMLU, HumanEval, GSM8K ni de tareas multimodales. Tampoco se documentan medidas de latencia ni de throughput.

## Requisitos de hardware

- Peso de los pesos: 22,7 GB de repositorio en safetensors con cuantizacion mixta (estimacion derivada del tamano de repo proporcionado, no de una medicion publicada por el autor).
- VRAM estimada para inferencia: aproximadamente 23-25 GB solo para pesos; con cache KV y buffers de activacion, un rango realista de 28-35 GB para contextos moderados. Estas cifras son estimaciones calculadas a partir del tamano del repositorio, no datos publicados; la longitud de contexto oficial no esta disponible.
- GPUs profesionales recomendadas: A100 40 GB (muy justa), A100 80 GB, H100 80 GB, L40S 48 GB, RTX A6000 48 GB. Para aprovechar NVFP4 conviene hardware con soporte nativo de ese formato; en GPUs sin soporte habria que recurrir a kernels de dequantizacion, con la penalizacion de velocidad correspondiente.
- GPUs de consumo: en 24 GB (RTX 4090, RTX 3090) los pesos no dejan margen suficiente para cache KV y activaciones con comodidad; en GPUs de 32 GB el escenario seria viable solo con contextos cortos. No hay datos publicados que confirmen un despliegue correcto en estas tarjetas.
- Opciones de despliegue: transformers con soporte de la arquitectura base, linears densos NVFP4 y linears MXFP8, y metadatos de ModelOpt. No se han publicado pesos GGUF, por lo que llama.cpp y Ollama no son una via directa con este repositorio. No se documenta compatibilidad con vLLM o TGI mas alla de la etiqueta endpoints_compatible.
- Latencia y throughput: no disponibles.
- Almacenamiento y carga: 22,7 GB en disco y en transferencia inicial; conviene tener en cuenta el tiempo de carga en arranques en frio dentro de un autoscaler.

## Comparativa con modelos similares

| Modelo | Parametros | Precision / formato | Contexto | Licencia | Notas |
|---|---|---|---|---|---|
| local-inference-lab/Qwen3.8-27B-NVFP4-QAD | 19.225.047.792 | NVFP4 (bloques de 16) + MXFP8 (bloques de 32), safetensors con metadatos ModelOpt | No disponible | Apache 2.0 | Este checkpoint; destilacion consciente de cuantizacion de una epoca |
| Qwen/Qwen3.8-27B | No disponible (el nombre comercial indica 27B; el recuento real del derivado es 19.225.047.792) | BF16, segun la model card del derivado (profesor) | No disponible | No disponible en la informacion proporcionada | Modelo base y profesor de la destilacion |
| Otras cuantizaciones NVFP4 del mismo modelo base | No disponible | No disponible | No disponible | No disponible | Existen publicaciones de terceros del mismo base en NVFP4, pero no se han documentado aqui sus cifras, licencia ni calidad |

No se dispone de datos de rendimiento que permitan una comparacion cuantitativa con alternativas de la misma categoria. La comparativa se limita, por tanto, a formato, tamano y licencia.

## Limitaciones y advertencias

- Estado del trabajo: la propia model card lo marca como "WORK IN PROGRESS"; no hay evaluacion downstream ni cualificacion de calidad en serving publicadas.
- Cuantizacion de activaciones no vista en entrenamiento: los kernels de serving aplican cuantizacion de activaciones (MLP NVFP4 calibrado, atencion y LM head MXFP8 dinamico) que va mas alla de la pasada forward de entrenamiento, lo que puede degradar la calidad de forma no medida.
- Adopcion practicamente nula: 32 descargas y 1 like en el momento de los datos. No hay validacion independiente de la comunidad.
- Discrepancia de nomenclatura: el identificador y el nombre comercial hablan de 27B, pero el recuento real de safetensors es 19.225.047.792 parametros. Conviene no dimensionar infraestructura en funcion del nombre.
- Longitud de contexto e idiomas sin documentar: imposible garantizar un comportamiento correcto en contextos largos o en idiomas concretos sin pruebas propias.
- Dependencia estricta del runtime: el checkpoint exige soporte de la arquitectura base, de linears densos NVFP4 y de linears MXFP8. Un runtime sin esos kernels no podra cargarlo, y no hay ruta GGUF publicada.
- Sesgos y alucinacion: no hay informacion disponible sobre sesgos, datos de entrenamiento del modelo base, ni tasas de alucinacion. Al derivar de un modelo base no documentado aqui, se heredan sus sesgos y su comportamiento en dominios sensibles.
- Licencia: Apache 2.0, que permite uso comercial, pero esta heredada del modelo base; conviene verificar los terminos vigentes de Qwen/Qwen3.8-27B antes de un despliegue en produccion.
- Uso de imagen: el encoder de vision se conserva sin cambios y no se ha reevaluado en este checkpoint, por lo que su comportamiento en tareas visuales es el del modelo base, sin garantias adicionales.
- Idoneidad para produccion: con la informacion disponible no hay datos de latencia, throughput, estabilidad ni calidad que respalden un despliegue en produccion sin una bateria de pruebas propia.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/local-inference-lab/Qwen3.8-27B-NVFP4-QAD
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Hilo en r/LocalLLaMA sobre una cuantizacion NVFP4 distinta del mismo modelo base (no corresponde a este checkpoint): https://www.reddit.com/r/LocalLLaMA/comments/1wfw9gb/qwen3827btwinturbofablecoldfusion709luncensorednvf/
- ModelOpt: mencionado en las etiquetas del repositorio como herramienta de cuantizacion, sin enlace en la model card. No se dispone de URL en la informacion proporcionada.
- Nota sobre la busqueda web: los resultados obtenidos en la busqueda no guardaban relacion con el modelo (correspondian a paginas de la Universidad de Oxford), por lo que no se han incluido como fuentes. No se han encontrado papers, blogs, repositorios ni demos adicionales sobre este checkpoint.
