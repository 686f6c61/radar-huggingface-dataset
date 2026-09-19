# mradermacher/ZOZ-Reasoning-Master-3B-i1-GGUF

## Resumen

ZOZ-Reasoning-Master-3B-i1-GGUF es una recopilación de cuantizaciones en formato GGUF del modelo z51722369/ZOZ-Reasoning-Master-3B, publicada por el usuario mradermacher. No se trata de un modelo entrenado desde cero, sino de una conversión y compresión del modelo base original a formatos de baja precisión (Q2_K, IQ3_M, Q4_K_S, IQ4_XS, Q5_K_M, Q6_K, entre otros) generados con la herramienta de cuantización de llama.cpp y calibrados mediante un fichero imatrix. El objetivo es hacer viable la inferencia en hardware de consumo sin necesidad de GPUs de datacenter.

El modelo subyacente tiene 3.085.938.688 parámetros (aproximadamente 3,09 mil millones), según los datos reales de safetensors, y está etiquetado como orientado a razonamiento y a uso conversacional, con soporte declarado únicamente para inglés. La relevancia de esta publicación radica en que permite ejecutar un modelo de razonamiento de ~3B en portátiles, mini-PCs y GPUs de gama media, con ficheros que van desde 0,9 GB (i1-IQ1_S) hasta 2,6 GB (i1-Q6_K). El repositorio completo ocupa 36,8 GB debido a la cantidad de variantes incluidas.

La información pública disponible es muy escasa: no se documenta licencia, longitud de contexto, arquitectura interna, composición del dataset de entrenamiento ni resultados de benchmarks. Se desconoce también el pipeline de la librería asociada en HuggingFace, aunque el modelo se publica bajo el formato transformers y su versión cuantizada funciona con llama.cpp y derivados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parametros totales | 3.085.938.688 (~3,09 B) |
| Parametros activos | no aplica (no hay indicios de que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | i1 (imatrix): IQ1_S, IQ1_M, IQ2_XXS, IQ2_XS, IQ2_S, IQ2_M, Q2_K_S, Q2_K, IQ3_XXS, IQ3_XS, Q3_K_S, IQ3_S, IQ3_M, Q3_K_M, Q3_K_L, IQ4_XS, IQ4_NL, Q4_0, Q4_K_S, Q4_K_M, Q4_1, Q5_K_S, Q5_K_M, Q6_K. Tambien existe un fichero imatrix suelto y una coleccion de quants estaticos en el repo ZOZ-Reasoning-Master-3B-GGUF |
| Idiomas soportados | en (ingles) |
| Licencia | no disponible |
| Formato de pesos | GGUF (cuantizado); el modelo base original se distribuye en safetensors (libreria transformers) |

## Arquitectura y entrenamiento

No se dispone de informacion sobre la arquitectura del modelo base z51722369/ZOZ-Reasoning-Master-3B: ni el numero de capas, ni la dimension del modelo, ni el tipo de atencion, ni si emplea atencion lineal, SSM o alguna variante hibrida. Tampoco se documenta el tokenizador ni la longitud de contexto nativa. El unico dato estructural verificable es el recuento de parametros (3.085.938.688), coherente con un transformer denso de aproximadamente 3B parametros.

Respecto al proceso de creacion de esta ficha concreta, se trata de una cuantizacion con calibracion imatrix (importancia matricial) realizada por mradermacher sobre los pesos convertidos a formato HuggingFace (convert_type: hf, quantize_version: 2, output_tensor_quantised: 1). La cuantizacion imatrix usa un dataset de calibracion para ponderar la importancia de cada tensor y reducir la perdida de calidad en precisiones muy bajas. No hay informacion sobre el dataset de entrenamiento del modelo base, ni sobre si se aplicaron tecnicas de RLHF, DPO u otras fases de alineamiento.

## Capacidades

- Generacion de texto conversacional en ingles: el modelo base esta etiquetado como "conversational" y con un nombre que sugiere orientacion a tareas de razonamiento, aunque no se detallan capacidades concretas.
- Razonamiento: el nombre del modelo base (ZOZ-Reasoning-Master) apunta a un entrenamiento orientado a tareas de razonamiento, si bien no se documenta ningun modo de pensamiento explicito ni trazas de razonamiento visibles.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: solo ingles declarado; no se documentan otros idiomas.
- Capacidades especiales (vision, audio, thinking mode): no disponible.
- Ejecucion local en CPU y GPU: capacidad derivada del formato GGUF y de los distintos niveles de cuantizacion ofrecidos.

## Casos de uso

- Prototipado de asistentes conversacionales en ingles sobre hardware modesto: el modelo puede ejecutarse con cuantizaciones de 2-3 GB en un portatil con GPU integrada o CPU moderna, lo que permite validar flujos conversacionales antes de escalar a modelos mayores.
- Experimentacion academica con cuantizacion extrema: la existencia de variantes desde IQ1_S (0,9 GB) hasta Q6_K (2,6 GB) permite estudiar la degradacion de calidad de un modelo de razonamiento de ~3B en funcion del nivel de compresion.
- Generacion de texto offline y procesamiento por lotes en local: al no depender de APIs externas, es utilizable en entornos con requisitos de privacidad o sin conectividad.
- Base para fine-tuning ligero en tareas de dominio: al ser un modelo de 3B, es viable ajustarlo con LoRA en una unica GPU de consumo, aunque deberia partirse del modelo base en safetensors y no de las versiones GGUF.
- Evaluacion comparativa de tecnicas de cuantizacion imatrix frente a cuantizacion estatica: el repositorio incluye ambas colecciones, lo que facilita experimentos controlados de calidad por tamano.
- Despliegue en dispositivos de borde (mini-PC, Raspberry Pi 5 con 8 GB, routers con NPU): las variantes IQ2 e IQ3 caben en memorias muy limitadas, a costa de una calidad notablemente reducida.
- Servicio de generacion de texto de bajo coste en pipelines internos: con Q4_K_M (2,0 GB) es posible levantar varias instancias en una sola GPU de gama media.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del repositorio de cuantizacion no incluye tablas de MMLU, HumanEval, GSM8K ni de perplejidad para las distintas variantes. Los unicos elementos de referencia son el grafico de perplejidad de ikawrakow enlazado en la model card y las notas cualitativas del autor sobre que variante es preferible en cada rango de tamano.

| Variante | Tamano (GB) | Nota del autor |
|---|---|---|
| i1-IQ1_S | 0,9 | for the desperate |
| i1-IQ1_M | 1,0 | mostly desperate |
| i1-IQ2_M | 1,2 | sin nota |
| i1-Q2_K | 1,4 | IQ3_XXS probably better |
| i1-IQ3_S | 1,6 | beats Q3_K* |
| i1-Q4_K_S | 1,9 | optimal size/speed/quality |
| i1-Q4_K_M | 2,0 | fast, recommended |
| i1-Q6_K | 2,6 | practically like static Q6_K |

## Requisitos de hardware

- VRAM estimada para los pesos: entre 0,9 GB (i1-IQ1_S) y 2,6 GB (i1-Q6_K). A ello hay que sumar la cache KV, cuyo tamano depende de la longitud de contexto efectiva y del numero de capas y cabezas, datos no disponibles.
- VRAM practica recomendada: 4 GB para las variantes de 2 bits, 6-8 GB para Q4_K_M y Q5_K_M con contextos moderados, y 8 GB o mas para Q6_K con contexto amplio.
- GPUs de datacenter: cualquier A100, H100, L40S o similar puede ejecutar el modelo con margen sobrado, aunque estan muy sobredimensionadas para 3B.
- GPUs de consumo: cabe en RTX 3060 12 GB, RTX 4060, RTX 4070, RTX 4090, ademas de GPUs integradas con memoria compartida suficiente (Apple Silicon a partir de 8 GB unificados). Tambien es viable en CPU pura con llama.cpp.
- Opciones de despliegue: llama.cpp (llama-cli, llama-server), Ollama, LM Studio, koboldcpp, text-generation-webui, llama-cpp-python y cualquier runtime compatible con GGUF. Para las variantes i1 conviene usar una version reciente de llama.cpp que soporte cuantizacion con imatrix.
- Latencia y throughput estimados: no disponibles. Dependen en gran medida del hardware, del nivel de cuantizacion y de la longitud de contexto utilizada.

## Comparativa con modelos similares

No se dispone de datos verificados del modelo evaluado (contexto, licencia, benchmarks) mas alla del recuento de parametros, por lo que la comparacion cuantitativa no puede establecerse con rigor. Se incluyen a continuacion alternativas de tamano similar ampliamente conocidas, con datos de referencia general que no proceden de la informacion proporcionada y que deben verificarse en sus respectivas fichas.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| ZOZ-Reasoning-Master-3B (i1-GGUF) | 3,09 B | no disponible | no disponible | GGUF en HuggingFace |
| Qwen2.5-3B-Instruct | ~3,09 B | no verificado | no verificado | safetensors y GGUF |
| Llama-3.2-3B-Instruct | ~3,21 B | no verificado | no verificado | safetensors y GGUF |
| Phi-3-mini-4k-instruct | ~3,8 B | no verificado | no verificado | safetensors y GGUF |

Dado que no se publican benchmarks ni especificaciones del modelo ZOZ, no es posible determinar si supera o no a estas alternativas en razonamiento, codigo o matematicas.

## Limitaciones y advertencias

- Ausencia total de documentacion: no hay model card del modelo base con detalles de entrenamiento, datos, filtros de seguridad o evaluaciones.
- Licencia no disponible: al no declararse licencia, no puede asumirse permiso para uso comercial. Es imprescindible contactar con el autor del modelo base antes de cualquier despliegue en produccion.
- Sesgos desconocidos: al no documentarse el dataset de entrenamiento, no es posible evaluar sesgos de genero, raza, religion o ideologicos.
- Riesgo de alucinacion: inherente a los modelos de ~3B parametros, y previsiblemente agravado en las cuantizaciones de 1 y 2 bits, que el propio autor desaconseja ("for the desperate").
- Limitacion idiomatica: solo se declara ingles; el rendimiento en castellano u otros idiomas no esta documentado y probablemente sea pobre.
- Riesgo de degradacion por cuantizacion: los quants por debajo de Q4 pierden calidad de forma apreciable. El autor recomienda explicitamente Q4_K_M para uso general y senala IQ3_XXS y Q2_K_S como problematicos.
- Contexto desconocido: sin datos sobre la ventana soportada, no se pueden planificar cargas con documentos largos ni conversaciones multi-turno extensas.
- Compatibilidad de runtime: las variantes i1 requieren builds recientes de llama.cpp; versiones antiguas pueden no cargarlas correctamente.
- Fecha de publicacion inusual en los metadatos (2026-09-18) y cero descargas y cero "likes" en el momento de la consulta, lo que indica ausencia de validacion por parte de la comunidad.
- Se recomienda descargar el modelo base en safetensors si se va a hacer fine-tuning, en lugar de partir de los ficheros GGUF.

## Enlaces

- Repositorio de cuantizaciones i1: https://huggingface.co/mradermacher/ZOZ-Reasoning-Master-3B-i1-GGUF
- Cuantizaciones estaticas del mismo modelo: https://huggingface.co/mradermacher/ZOZ-Reasoning-Master-3B-GGUF
- Modelo base: https://huggingface.co/z51722369/ZOZ-Reasoning-Master-3B
- Pagina resumen del autor para este modelo: https://hf.tst.eu/model#ZOZ-Reasoning-Master-3B-i1-GGUF
- Solicitudes de cuantizacion y preguntas frecuentes del autor: https://huggingface.co/mradermacher/model_requests
- Guia de uso de ficheros GGUF (referencia de TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafico comparativo de calidad entre tipos de cuantizacion (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre cuantizacion: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- No se han encontrado otros enlaces relevantes (papers, blogs o demos) en la busqueda web realizada; los resultados obtenidos no guardan relacion con el modelo.
