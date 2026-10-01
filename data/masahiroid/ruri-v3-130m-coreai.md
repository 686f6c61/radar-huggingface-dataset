# masahiroid/ruri-v3-130m-coreai

## Resumen

ruri-v3-130m-coreai es una conversion no oficial del modelo de embeddings de texto japones cl-nagoya/ruri-v3-130m para el runtime on-device Core AI de Apple (iOS/macOS 27 o superior, sucesor de Core ML). El modelo original lo desarrolla el grupo cl-nagoya de la Universidad de Nagoya, mientras que esta conversion la publica el usuario masahiroid en HuggingFace. El problema que resuelve es permitir ejecutar un modelo de similitud semantica de 132M parametros directamente en el Neural Engine o la GPU de dispositivos Apple, sin depender de un servicio en la nube.

La relevancia actual viene de que la conversion no es un simple exportado: el autor reescribio la red desde cero para cumplir el layout BC1S `(Batch, Channel, 1, Sequence)` exigido por el Neural Engine, con proyecciones basadas en Conv2d y calculo de atencion explicito por cabeza. Reproduce fielmente la arquitectura ModernBERT-Ja del original: 19 capas con atencion full y sliding-window alternadas cada tres capas, un valor de RoPE theta distinto segun el tipo de atencion y una mascara bidireccional de ventana deslizante con radio 65.

La exportacion esta fijada en secuencias de 128 tokens y precision float16, y produce embeddings de 512 dimensiones ya normalizados L2. La licencia es Apache-2.0 tanto en el original como en esta conversion. El modelo soporta japones e ingles y esta pensado para similitud semantica, recuperacion de informacion (retrieval) y extraccion de caracteristicas, no para generacion de texto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (ModernBERT-Ja), 19 capas con atencion full y sliding-window alternadas cada 3 capas, mascara bidireccional de ventana deslizante con radio 65 |
| Parametros totales | 132M (el identificador del modelo usa el sufijo 130m) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | 128 tokens fijos en la exportacion incluida; re-exportable a 256/512 cambiando `seq_len` en `ruri_ane.py` |
| Tipos de cuantizacion | float16 (sin cuantizacion adicional documentada) |
| Idiomas soportados | japones (ja) e ingles (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | .aimodel (runtime Core AI); incluye el codigo `ruri_ane.py` para reproducir la conversion en Python |
| Dimension del embedding | 512 (normalizado L2) |
| Modelo base | cl-nagoya/ruri-v3-130m |
| Framework de conversion | Core AI (`coreai-torch`) |

## Arquitectura y entrenamiento

El modelo base es un encoder ModernBERT-Ja de 132M parametros disenado para embeddings de frases. La conversion reproduce 19 capas con un patron de atencion mixto: atencion completa y atencion de ventana deslizante que se alternan cada tercera capa, cada una con su propio valor de RoPE theta. La mascara de la ventana deslizante es bidireccional con radio 65. Para que el modelo cargue en el Neural Engine, el autor reimplemento la red con el layout BC1S `(Batch, Channel, 1, Sequence)`, proyecciones basadas en Conv2d y calculo explicito de la atencion por cabeza, en lugar del layout estandar de matmul de PyTorch.

No se dispone de informacion sobre el dataset de entrenamiento, el numero de tokens, la composicion de los datos ni si hubo fases de RLHF o DPO, ya que esta publicacion es una conversion de inferencia y no un reentrenamiento. El autor documenta un problema tecnico relevante durante la conversion: `nn.Parameter` y `nn.Conv2d` usan fp32 por defecto y la llamada `.copy_()` al cargar pesos solo sobrescribe valores, no el dtype, lo que degradaba la similitud coseno hasta 0.954 en el Neural Engine. La solucion fue forzar la conversion a fp16 de todo el modulo con `model.half()` antes de cargar los pesos, con lo que la precision se recupero.

## Capacidades

- Generacion de embeddings de frases de 512 dimensiones, normalizados L2, aptos para similitud coseno.
- Similitud semantica entre textos en japones e ingles.
- Extraccion de caracteristicas (feature extraction) para pipelines posteriores.
- Recuperacion de informacion (retrieval) mediante el esquema de prefijos "1+3".
- Clasificacion y clustering de texto usando el prefijo `トピック: ` ("Topic: ").
- Busqueda semantica diferenciando lado consulta (`検索クエリ: `, "Search query: ") y lado documento (`検索文書: `, "Search document: ").
- Ejecucion en Neural Engine y en GPU de dispositivos Apple, ambos validados.
- No es un modelo generativo: no produce texto, no soporta tool calling, function calling ni razonamiento multi-paso.

## Casos de uso

- Busqueda semantica on-device en aplicaciones iOS/macOS: el modelo genera embeddings de consultas y documentos localmente, sin enviar texto a un servidor, lo que es util para apps con requisitos de privacidad.
- Recuperacion aumentada (RAG) local: indexar documentos con el prefijo de documento y consultar con el prefijo de consulta para recuperar pasajes relevantes antes de pasarlos a un modelo generativo.
- Clasificacion de textos en japones: usar el prefijo de topico para agrupar noticias, tickets de soporte o resenas por tematica mediante similitud contra prototipos.
- Deduplicacion y agrupamiento de contenidos: calcular embeddings de un corpus y agrupar elementos con alta similitud coseno para eliminar duplicados o construir clusters.
- Recomendacion de contenido: representar items y preferencias del usuario como vectores y ordenar por similitud, todo dentro del dispositivo.
- Moderacion o filtrado por similitud: comparar entradas del usuario contra una lista de patrones conocidos para detectar contenido proximo a categorias predefinidas.
- Funciones de busqueda dentro de apps de notas o correo: indexado incremental de texto japones e ingles con un modelo ligero que cabe en el presupuesto de memoria de un telefono.
- Preprocesado para pipelines de NLP: obtener features para clasificadores ligeros o sistemas de ranking sin salir del ecosistema Apple.

## Benchmarks y rendimiento

La unica metrica publicada es la precision de la conversion frente a la referencia en PyTorch fp32, medida sobre una frase real en japones con relleno hasta 24 de 128 tokens:

| Objetivo | Similitud coseno frente a la referencia PyTorch fp32 |
|---|---|
| Especializacion GPU | 1.0001926 |
| Especializacion Neural Engine | 1.0002038 |

No se han publicado resultados de benchmarks estandar (MMLU, GLUE, JSTS, retrieval) en la informacion disponible.

## Requisitos de hardware

- El modelo esta disenado exclusivamente para el runtime Core AI de Apple; requiere iOS o macOS 27 o superior.
- Unidades de computo validadas: Neural Engine y GPU del sistema en chip (SoC) de Apple. No hay soporte documentado para GPUs NVIDIA ni AMD.
- El repo ocupa 0.3 GB, por lo que cabe holgadamente en dispositivos de consumo con Apple Silicon; no requiere GPU dedicada.
- Precision float16, lo que reduce el uso de memoria y aprovecha las unidades de bajo consumo del Neural Engine.
- Despliegue: el archivo `.aimodel` puede incorporarse directamente a una app en Swift; para pruebas en Python se usa el runtime `coreai.runtime` con la dependencia `coreai-core==1.0.0b3`, mas `transformers`, `torch`, `sentencepiece` y `protobuf`.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Runtime | Licencia | Formato |
|---|---|---|---|---|---|
| masahiroid/ruri-v3-130m-coreai (este modelo) | 132M | 128 tokens fijos (re-exportable) | Core AI (ANE/GPU Apple) | Apache-2.0 | .aimodel |
| cl-nagoya/ruri-v3-130m | 132M | no disponible en la informacion proporcionada | PyTorch | Apache-2.0 | safetensors (formato habitual del ecosistema Transformers) |
| Otras variantes de la familia ruri-v3 (por ejemplo, tamanos superiores) | no disponible | no disponible | PyTorch | no disponible | no disponible |
| Otros modelos de embeddings multilingues comparables | no disponible | no disponible | multiples | no disponible | no disponible |

La comparativa directa mas relevante es con el modelo base: misma arquitectura y mismos pesos en origen, pero distinto runtime y formato de salida. No se dispone de datos de benchmarks que permitan comparar el rendimiento frente a otras alternativas de embeddings.

## Limitaciones y advertencias

- Es una conversion no oficial de la comunidad; no es una publicacion del equipo Ruri ni de cl-nagoya, y no cuenta con el respaldo de los autores originales.
- La model card enlaza una herramienta de auditoria de seguridad (model-audit-lite) pero el contenido de esa auditoria no esta disponible en la informacion proporcionada; se recomienda revisar el modelo antes de usarlo en produccion.
- El autor advierte de un riesgo concreto de conversion: si los modulos no se convierten explicitamente a fp16, la precision en el Neural Engine puede degradarse hasta una similitud coseno de 0.954 respecto a la referencia fp32.
- La longitud de entrada esta fijada en 128 tokens en la exportacion incluida; textos mas largos se truncan y pierden informacion. Se pueden re-exportar variantes de 256 o 512 tokens, pero no vienen incluidas.
- El modelo es un encoder de embeddings, no un generador: no hay riesgo de alucinacion de texto, pero si de similitudes semanticas erroneas en dominios alejados de los datos de entrenamiento originales.
- El soporte de idiomas se limita a japones e ingles; el rendimiento en castellano u otros idiomas no esta documentado.
- Dependencia de un runtime propietario y muy reciente (Core AI, iOS/macOS 27+), lo que limita la portabilidad y la disponibilidad de entornos de prueba.
- Licencia Apache-2.0, que permite uso comercial, pero al ser una conversion de terceros conviene revisar las condiciones del modelo base original antes de un despliegue comercial.
- No se documentan sesgos especificos del modelo base ni del proceso de conversion en la informacion disponible.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/masahiroid/ruri-v3-130m-coreai
- Modelo base: https://huggingface.co/cl-nagoya/ruri-v3-130m
- Documentacion de Core AI (Apple): https://developer.apple.com/documentation/coreai
- Herramienta de conversion mlx-coreml-conversion-toolkit: https://github.com/masahirocom/mlx-coreml-conversion-toolkit
- Herramienta de auditoria model-audit-lite: https://github.com/masahirocom/model-audit
