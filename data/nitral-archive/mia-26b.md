# Nitral-Archive/Mia-26B

## Resumen

Mia-26B es un ajuste fino (finetune) publicado por el usuario Nitral-Archive bajo el identificador `Nitral-Archive/Mia-26B`. Se trata de un derivado del modelo `unsloth/gemma-4-26B-A4B-it-qat-q4_0-unquantized`, es decir, una variante de la familia Gemma 4 de Google con arquitectura de mezcla de expertos (MoE) y aproximadamente 26 000 millones de parametros totales, de los cuales unos 4000 millones se activarian por token segun la nomenclatura A4B del modelo base. El pipeline declarado es `image-text-to-text`, por lo que admite entrada de imagen y texto.

El modelo se ha entrenado, segun la propia model card, con la libreria Unsloth y TRL de Hugging Face, lo que sugiere un ajuste fino supervisado relativamente ligero y orientado a un caso de uso conversacional concreto. La licencia declarada es Apache 2.0 y el unico idioma documentado es el ingles.

La relevancia de esta ficha es limitada y conviene ser transparente al respecto: el repositorio presenta un tamano de 0,0 GB, cero descargas y un unico "like" en el momento de la consulta, la model card no documenta dataset de entrenamiento, hiperparametros, evaluaciones ni limitaciones. Ademas, la busqueda web realizada no ha devuelto ninguna fuente relacionada con este modelo. Por tanto, la mayor parte de las especificaciones tecnicas deben considerarse no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal con mezcla de expertos (MoE), familia Gemma 4 (según la etiqueta `gemma4` y el modelo base) |
| Parametros totales | 26B (según la denominación del modelo y de su base; no verificado en documentación) |
| Parametros activos | 4B (según la denominación `A4B` del modelo base; no verificado) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | El modelo base es una variante QAT (`qat-q4_0-unquantized`); este repositorio no documenta cuantizaciones propias ni incluye ficheros GGUF |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (librería `transformers`) |

## Arquitectura y entrenamiento

La informacion disponible no permite detallar la arquitectura interna. Lo unico contrastable son las etiquetas del repositorio (`gemma4`, `transformers`, `unsloth`, `image-text-to-text`) y la denominacion del modelo base, `gemma-4-26B-A4B-it-qat-q4_0-unquantized`, de la que se deduce una arquitectura MoE con 26B de parametros totales y 4B activos, con capacidad multimodal de entrada (imagen y texto) y una variante base entrenada con cuantizacion consciente del entrenamiento (QAT) sobre esquema q4_0, distribuida en este caso sin cuantizar.

Respecto al entrenamiento, la model card se limita a indicar que el modelo fue entrenado "2x faster with Unsloth and Huggingface's TRL library". No se especifica el numero de tokens, la composicion del dataset, si hubo fases de RLHF, DPO u otro tipo de alineamiento, ni la duracion o el hardware empleado. Tampoco se documenta ninguna innovacion tecnica propia (atencion lineal, decodificacion especulativa, destilacion, etc.). Toda esta informacion debe considerarse no disponible.

## Capacidades

- Generacion de texto conversacional en ingles, heredada del modelo base ajustado para instrucciones (`-it`).
- Entrada multimodal de imagen y texto, segun el pipeline declarado `image-text-to-text`. El alcance real (descripcion de imagenes, VQA, OCR) no esta documentado.
- Razonamiento y generacion de codigo: plausibles por herencia de la familia Gemma, pero no verificados en la informacion proporcionada.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: solo se declara ingles (`language: en`).
- Modo de razonamiento explicito (thinking mode), audio u otras capacidades especiales: no disponible.
- No se documenta ninguna capacidad anadida por el ajuste fino respecto al modelo base.

## Casos de uso

Debido a la ausencia de documentacion, evaluaciones y pesos publicados, los siguientes casos de uso son hipoteticos y condicionados a que el repositorio contenga finalmente artefactos utilizables:

- Prototipado de asistentes conversacionales en ingles: el modelo puede emplearse para generar respuestas multi-turno en ingles, aprovechando el ajuste de instrucciones del modelo base, siempre que se verifique previamente la calidad del finetune.
- Experimentacion multimodal de investigacion: al declarar pipeline `image-text-to-text`, sirve para probar tareas de descripcion de imagenes o respuesta a preguntas visuales, aunque sin datos de evaluacion no puede validarse su rendimiento.
- Evaluacion comparativa de ajustes finos sobre Gemma 4 MoE: util como punto de partida para estudiar como afecta un finetune ligero con Unsloth y TRL al comportamiento del modelo base.
- Base para nuevos finetunes en dominio especifico: al estar bajo Apache 2.0, puede reutilizarse como punto de partida para ajustes posteriores en ingles.
- Investigacion sobre eficiencia de inferencia MoE: con ~4B de parametros activos sobre 26B totales, es un candidato para medir latencia y throughput en configuraciones con offload de expertos.
- Despliegue interno no critico: solo si se completan los pesos y se valida el modelo, podria usarse en herramientas internas de generacion de texto en ingles con supervision humana.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye MMLU, HumanEval, GSM8K, MMMU ni ninguna otra metrica, y la busqueda web no ha devuelto evaluaciones independientes de este modelo. No se debe asumir ningun nivel de rendimiento a partir del modelo base sin verificacion directa.

## Requisitos de hardware

Las siguientes cifras son estimaciones derivadas del recuento de parametros (26B totales, ~4B activos) y no provienen de documentacion del autor. En arquitecturas MoE todos los expertos deben residir en memoria, por lo que el requisito de VRAM viene dominado por los parametros totales y no por los activos:

- VRAM estimada en bf16/fp16: en torno a 52-60 GB solo para pesos, mas cache KV. Requiere A100 80 GB, H100 80 GB o dos GPU de 48 GB.
- VRAM estimada en FP8/INT8: en torno a 28-34 GB. Encaja en A100 40 GB, L40S 48 GB o dos RTX 4090/3090 de 24 GB.
- VRAM estimada en cuantizacion de 4 bits: en torno a 15-18 GB, lo que permitiria ejecucion en una unica RTX 4090, RTX 3090 o RTX 4080 de 16 GB de forma ajustada.
- Consumer GPU: previsiblemente viable solo en cuantizacion de 4 bits y con contexto reducido. En 8 bits no cabe en GPU de consumo de 24 GB.
- Opciones de despliegue: `transformers` (declarado), vLLM o SGLang para servicio con paralelismo de tensor, TGI (etiqueta `text-generation-inference`). llama.cpp u Ollama requeririan ficheros GGUF que este repositorio no incluye.
- Latencia y throughput: no disponibles. Cabe esperar que el coste computacional por token se aproxime al de un modelo denso de ~4B, con cuello de botella en ancho de banda de memoria por la carga de expertos, pero no hay mediciones publicadas.

## Comparativa con modelos similares

Los datos de Mia-26B son en su mayoria no disponibles, por lo que la comparacion se limita a parametros, contexto y licencia de alternativas publicas de categoria similar. No se dispone de comparacion de rendimiento.

| Modelo | Parametros totales / activos | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Mia-26B | 26B / ~4B (segun denominacion) | no disponible | Apache 2.0 | Repositorio sin pesos (0,0 GB) ni evaluaciones |
| Qwen3-30B-A3B | 30,5B / 3,3B | 128k nativo | Apache 2.0 | MoE abierto con documentacion y benchmarks publicos |
| Mixtral 8x7B | 46,7B / 12,9B | 32k | Apache 2.0 | MoE de referencia, ampliamente evaluado |
| Gemma 3 27B | 27B denso | 128k | Licencia Gemma | Alternativa densa de la generacion anterior de la familia |

La comparacion con el modelo base exacto (`unsloth/gemma-4-26B-A4B-it-qat-q4_0-unquantized`) tampoco es posible en terminos de rendimiento, ya que no se han publicado metricas de ninguno de los dos en la informacion disponible.

## Limitaciones y advertencias

- Repositorio practicamente vacio: el tamano declarado es de 0,0 GB, por lo que no hay garantia de que los pesos esten realmente publicados o descargables.
- Sin documentacion de entrenamiento: se desconoce el dataset, el numero de tokens, el metodo de alineamiento y los hiperparametros. No puede auditarse el origen de los datos.
- Sin evaluaciones: no existen benchmarks que respalden ninguna afirmacion de calidad, seguridad o robustez.
- Riesgo de alucinacion: inherente a los modelos de lenguaje generativos y no cuantificado en este caso.
- Sesgos: no evaluados. Al derivar de un modelo base no auditado en esta ficha, pueden persistir sesgos de genero, raza, idioma o ideologia, agravados por un finetune del que no se conoce la composicion de datos.
- Idioma: solo se declara ingles. El rendimiento en castellano es desconocido y previsiblemente inferior.
- Multimodalidad sin verificar: aunque el pipeline es `image-text-to-text`, no se documenta que el finetune preserve las capacidades de vision del modelo base.
- Licencia: Apache 2.0 permite uso comercial, pero conviene verificar que el modelo base (`unsloth/gemma-4-26B-A4B-it-qat-q4_0-unquantized`) no imponga condiciones adicionales que prevalezcan sobre la licencia declarada en este derivado.
- Procedencia dudosa para produccion: cuenta de archivo ("Nitral-Archive"), cero descargas, fecha de creacion no verificable y ausencia total de mantenimiento documentado. No se recomienda su uso en entornos productivos sin una validacion exhaustiva previa.
- Correccion factual del contexto: la busqueda web realizada no ha encontrado ninguna fuente sobre este modelo; los resultados obtenidos (Nitral como tratamiento metalurgico de Bodycote, Nital como reactivo de ataque quimico, Nitronal como medicamento) son homonimias sin relacion y no deben citarse como documentacion.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Nitral-Archive/Mia-26B
- Modelo base: https://huggingface.co/unsloth/gemma-4-26B-A4B-it-qat-q4_0-unquantized
- Repositorio de Unsloth: https://github.com/unslothai/unsloth
- Paper, blog, demo o evaluacion independiente: no disponible. La busqueda web no ha devuelto ningun enlace relevante sobre este modelo.
