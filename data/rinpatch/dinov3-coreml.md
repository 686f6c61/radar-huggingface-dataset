# rinpatch/dinov3-coreml

## Resumen

rinpatch/dinov3-coreml es una conversion a formato Core ML del codificador de imagenes DINOv3 ViT-B/16 de Meta, cuyo checkpoint original es facebook/dinov3-vitb16-pretrain-lvd1689m. No se trata de un modelo de lenguaje ni de un modelo entrenado desde cero: es un cambio de formato de unos pesos ya preentrenados, sin entrenamiento adicional, orientado a ejecutar extraccion de caracteristicas de imagen en Macs con Apple silicon.

El modelo devuelve dos salidas: un embedding CLS de 768 valores con norma L2 unitaria, pensado para similitud y recuperacion de imagenes mediante producto escalar, y 784 tokens de patch sin normalizar con forma [1, 784, 768], utiles para tareas densas como segmentacion, profundidad y correspondencia. La entrada es una imagen RGB de 448x448 px con valores de pixel 0-255 y el preprocesado (escalado y normalizacion ImageNet) va integrado dentro del paquete, por lo que no debe reaplicarse.

Su relevancia es practica: permite ejecutar un encoder de vision de referencia en local sobre hardware Apple sin depender de Python en produccion, con una latencia medida de 37,39 ms de mediana y 26,6 imagenes por segundo en un M4 Pro. El repositorio ocupa 0,3 GB, la inferencia alojada esta desactivada en Hugging Face y, en el momento de la consulta, acumula 0 descargas y 0 likes, por lo que se trata de un artefacto reciente y de adopcion nula.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision Transformer ViT-B/16 (DINOv3), parches de 16x16 px, token CLS y 4 tokens de registro (descartados en la salida) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo de vision; entrada fija de 448x448 px y 784 tokens de patch en rejilla 28x28) |
| Tipos de cuantizacion | FP32 en el artefacto publicado; FP16 marcado como experimental; no se ofrecen GGUF ni INT8 |
| Idiomas soportados | no aplica (no procesa texto) |
| Licencia | other, con licencia nombrada DINOv3 para los pesos; el codigo de conversion y los ejemplos son MIT |
| Formato de pesos | Core ML ML Program (.mlpackage), FP32, entrada `image` 448x448 RGB, salidas `embedding` float32 [1, 768] y `patch_embeddings` float32 [1, 784, 768] |
| Modelo base | facebook/dinov3-vitb16-pretrain-lvd1689m (implementacion timm: vit_base_patch16_dinov3.lvd1689m) |
| Plataforma objetivo | macOS 14 o superior, Apple silicon |
| Inferencia alojada | no (etiqueta `inference: false`) |

## Arquitectura y entrenamiento

La arquitectura es un Vision Transformer de tipo base con parches de 16x16 pixeles, la variante ViT-B/16 de la familia DINOv3 de Meta. Sobre una entrada de 448x448 se generan 784 tokens de patch (rejilla 28x28) mas un token CLS y cuatro tokens de registro. Los cuatro tokens de registro se descartan deliberadamente en la conversion porque su funcion es absorber artefactos de norma alta que de otro modo contaminarian los tokens de patch, y no resultan utiles como caracteristicas. El paquete no conserva el cabezal de texto ni ningun cabezal de tarea: solo el encoder.

No hubo entrenamiento adicional de ningun tipo en esta conversion. El proceso descrito es: descarga de los pesos preentrenados a traves de timm/Hugging Face, exportacion mediante `torch.export`, conversion a Core ML y verificacion de paridad entre ambos runtimes sobre un gradiente RGB sintetico, con umbral de fallo en coseno inferior a 0,999 para cualquiera de las dos salidas. El informe de validacion incluido (models/DINOv3ViTB16-FP32-448.validation.json) registra un coseno de aproximadamente 1,0 en ambas salidas y una norma del CLS de aproximadamente 1,0. La innovacion tecnica relevante aqui no esta en el modelo sino en el empaquetado: preprocesado embebido, embedding L2-normalizado listo para producto escalar y artefacto nativo reutilizable en Xcode.

## Capacidades

- Extraccion de embeddings de imagen: vector CLS de 768 dimensiones con norma L2 unitaria, listo para similitud coseno mediante producto escalar.
- Recuperacion y similitud de imagenes: el uso principal declarado por el autor, sin necesidad de renormalizar la salida `embedding`.
- Caracteristicas densas: 784 tokens de patch de 768 valores en orden row-major, uno por parche de 16x16, para segmentacion, profundidad y correspondencia. No vienen normalizados y hay que normalizarlos por token si se quiere coseno.
- Preprocesado integrado: escalado de pixeles y normalizacion ImageNet dentro del modelo, con correccion de orientacion EXIF y conversion a RGB a cargo del usuario.
- Inferencia nativa en macOS: ejemplos en Python (con uv y Python 3.12) y en Swift compilado con `swiftc -O`, sin dependencia de Python en el segundo caso.
- Conversion reproducible: script `convert.py` con parametro `--size` para cambiar la resolucion cuadrada de entrada (multiplo positivo de 16) y `--precision fp16` experimental, con validacion propia obligatoria.
- No soporta: generacion de texto, subtitulos ni captions, coordenadas, tool calling, function calling, agentes, razonamiento multi-paso, capacidades multilingues ni entrada de texto de ningun tipo. Tampoco produce embeddings de texto.
- Modo thinking, vision-language, audio: no disponibles, no aplica.

## Casos de uso

- Recuperacion de imagenes por similitud: indexar una fototeca calculando el `embedding` de 768 valores de cada imagen y consultar por producto escalar. El modelo es adecuado porque la salida ya viene con norma L2 unitaria, de modo que la similitud coseno se reduce a un producto punto sin postprocesado adicional.
- Deduplicacion de datasets de imagenes: generar embeddings de un corpus y agrupar por umbral de similitud para detectar near-duplicates antes de entrenar otros modelos. Con 26,6 imagenes por segundo en un M4 Pro, un corpus de 100.000 imagenes se procesaria en aproximadamente una hora en ese hardware.
- Segmentacion semantica con cabezas ligeras: usar `patch_embeddings` como caracteristica congelada y entrenar un decodificador lineal o un cabezal ligero encima, sin reentrenar el encoder. Los 784 tokens en rejilla 28x28 permiten reconstruir un mapa espacial de la imagen de 448x448.
- Estimacion de profundidad y correspondencia densa: los mismos tokens de patch sirven como entrada para cabezales de profundidad monocular o de correspondencia entre pares de imagenes, tareas para las que el autor menciona explicitamente esta salida.
- Clasificacion por k-NN sobre caracteristicas congeladas: en lugar de ajustar un clasificador, almacenar embeddings de un conjunto etiquetado y clasificar por vecinos mas cercanos. Es un patron habitual en la familia DINO y no requiere entrenamiento adicional.
- Aplicaciones macOS nativas: integrar el `.mlpackage` en un target de Xcode para que se compile y se empaquete en tiempo de build, cargando el recurso `.mlmodelc` una sola vez para predicciones repetidas. Adecuado para apps de organizacion de fotos, busqueda visual o catalogacion local sin enviar imagenes a la nube.
- Etiquetado semiautomatico y active learning: precalcular embeddings de un lote de imagenes sin etiquetar y seleccionar las mas diversas o las mas alejadas de los centroides para que un anotador humano las revise primero.
- Deteccion de cambios y control de contenido: comparar el embedding de una imagen de referencia con el de una imagen candidata para detectar variaciones o reutilizaciones, con la salvedad de que se debe emplear el mismo preprocesado en todas las imagenes comparadas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Al ser un encoder de vision y no un modelo de lenguaje, métricas como MMLU, HumanEval o GSM8K no aplican, y el autor no reporta resultados de recuperacion, segmentacion o clasificacion sobre ningun dataset. La unica validacion publicada es de paridad de conversion sobre una unica imagen sintetica, que establece una paridad limitada y no una precision de recuperacion entre datasets.

Rendimiento medido por el autor (no es una garantia independiente del hardware):

| Metrica | Valor |
|---|---|
| Hardware | Apple M4 Pro, macOS 26.3, Swift nativo optimizado |
| Modo de ejecucion | Inferencia serie, Core ML compute units `.all` |
| Muestras | 400 imagenes, 5 calentamientos y 3 pasadas |
| Throughput | 26,6 imagenes/segundo (mediana de pasada) |
| Latencia mediana | 37,39 ms |
| Latencia p95 | 39,68 ms |
| Alcance de la medicion | Creacion de la caracteristica de entrada, prediccion y extraccion del vector; excluye obtencion de fotos, redimensionado, carga del modelo y escrituras en base de datos |

Validacion de la conversion del artefacto FP32 copiado:

| Comprobacion | Resultado |
|---|---|
| Coseno entre runtime original y Core ML (embedding) | aproximadamente 1,0 |
| Coseno entre runtime original y Core ML (patch_embeddings) | aproximadamente 1,0 |
| Norma del CLS | aproximadamente 1,0 |
| Umbral de fallo del convertidor | coseno inferior a 0,999 en cualquiera de las dos salidas |

## Requisitos de hardware

- Plataforma: macOS 14 o superior sobre Apple silicon, segun lo indicado en la model card. La inferencia en Python requiere macOS; la inferencia en Swift no necesita Python ni las dependencias de conversion.
- VRAM o memoria unificada estimada para inferencia: no disponible. El repositorio completo ocupa 0,3 GB y el artefacto publicado es FP32, pero no se publica un desglose de memoria por prediccion.
- GPU: no aplica el catalogo habitual de NVIDIA. Al ser un artefacto Core ML, la ejecucion se realiza sobre la GPU y la Neural Engine del chip Apple mediante los compute units de Core ML (`.all` en la medicion publicada). No se soportan A100, H100 ni RTX 4090.
- Cabe en hardware de consumo: si, en Macs con Apple silicon. El autor midio sobre un M4 Pro. No hay datos publicados para otros chips.
- Opciones de despliegue: Core ML mediante Python 3.12 con `uv` (ejemplo `examples/embed.py`) o mediante Swift compilado (ejemplo `examples/encode.swift`); integracion directa del `.mlpackage` en un target de Xcode con carga unica del `.mlmodelc`. No hay soporte indicado para vLLM, llama.cpp, Ollama, TGI ni TensorRT, ya que no existen pesos en esos formatos.
- Latencia y throughput: 26,6 imagenes por segundo, mediana de 37,39 ms y p95 de 39,68 ms en un M4 Pro con macOS 26.3, en inferencia serie. No hay datos para lotes, para otros chips ni para la variante FP16 experimental.
- Precision: el artefacto publicado es FP32. La ruta FP16 esta marcada como experimental y debe superar su propia validacion antes de usarse.

## Comparativa con modelos similares

La busqueda web realizada no devolvio resultados relevantes (unicamente paginas de Google Earth y Google Merchant Center), por lo que no hay datos verificados de terceros para esta comparativa. La tabla siguiente es cualitativa y deja como "no disponible" todo dato numerico no confirmado en la informacion proporcionada.

| Modelo | Tipo de tarea | Salida | Formato nativo en Apple silicon | Licencia | Parametros y contexto |
|---|---|---|---|---|---|
| rinpatch/dinov3-coreml | Extraccion de caracteristicas de imagen | Embedding CLS de 768 (L2) + 784 tokens de patch | Si, Core ML ML Program FP32 | other / DINOv3 (pesos), MIT (codigo de conversion) | no disponible |
| facebook/dinov3-vitb16-pretrain-lvd1689m | Extraccion de caracteristicas de imagen | Embeddings del encoder original | No indicado en la informacion disponible | DINOv3 | no disponible (es la fuente de los pesos de este repo) |
| DINOv2 (Meta) | Extraccion de caracteristicas de imagen | Embeddings y tokens de patch | No indicado en la informacion disponible | no disponible en esta busqueda | no disponible |
| CLIP ViT-B/16 (OpenAI) | Alineacion imagen-texto | Embeddings de imagen y de texto | No indicado en la informacion disponible | no disponible en esta busqueda | no disponible |
| SigLIP (Google) | Alineacion imagen-texto | Embeddings de imagen y de texto | No indicado en la informacion disponible | no disponible en esta busqueda | no disponible |

Diferencias cualitativas que si se pueden afirmar con la informacion disponible: este artefacto no produce embeddings de texto ni captions, a diferencia de las familias contrastivas imagen-texto; ofrece salida densa de tokens de patch ademas del vector global; y su unico formato publicado es Core ML, especifico de macOS y Apple silicon.

## Limitaciones y advertencias

- No es un modelo oficial de Meta; es una conversion de un tercero (rinpatch) y asi lo declara el propio autor.
- No genera texto, subtitulos ni captions, y no produce coordenadas ni embeddings de texto. Cualquier caso de uso que requiera lenguaje queda fuera de su alcance.
- La validacion publicada se limita a una unica imagen sintetica y a la paridad de conversion entre runtimes. El autor advierte explicitamente que esto no establece precision de recuperacion entre datasets.
- El redimensionado de ejemplo es cuadrado, lo que puede distorsionar imagenes no cuadradas. El autor recomienda usar exactamente el mismo preprocesado en todas las imagenes que se vayan a comparar; de lo contrario, las similitudes dejan de ser comparables.
- Riesgo de alucinacion: no aplica en el sentido generativo, porque el modelo no produce texto. El riesgo equivalente es la deriva de similitud por preprocesado inconsistente o por imagenes fuera de la distribucion de entrenamiento de DINOv3.
- La variante FP16 esta marcada como experimental y debe pasar su propia validacion; no se debe asumir la misma paridad que la version FP32.
- Limitacion de plataforma: requiere macOS 14 o superior y, segun la model card, un Mac con Apple silicon. No hay rutas publicadas para CUDA, ROCm ni CPU x86 de otros sistemas.
- Restricciones de licencia: los pesos estan sujetos a la licencia DINOv3 (campo `license: other`, `license_name: dinov3`), que se incluye literalmente en LICENSE.dinov3.md. No es una licencia permisiva estandar como Apache 2.0 o MIT y sus terminos no se detallan en la informacion disponible; hay que revisarla antes de cualquier uso comercial. La licencia MIT cubre unicamente `convert.py` y `examples/`, y no se extiende a los pesos.
- El modelo declara `inference: false`, por lo que no hay endpoint de inferencia alojada en Hugging Face.
- Adopcion nula en el momento de la consulta: 0 descargas y 0 likes, repositorio creado y actualizado el 16 de septiembre de 2026. No hay historial de uso en produccion que sirva de referencia.
- La rejilla de salida es fija para la configuracion publicada: 784 tokens de patch a 448x448. Otras resoluciones requieren reconvertir con `--size`.
- Los cuatro tokens de registro se eliminan de la salida; si un flujo de trabajo espera el conjunto completo de tokens del encoder original, este artefacto no lo proporciona.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/rinpatch/dinov3-coreml
- Modelo base en Hugging Face: https://huggingface.co/facebook/dinov3-vitb16-pretrain-lvd1689m
- Licencia DINOv3 incluida en el repositorio: https://huggingface.co/rinpatch/dinov3-coreml/blob/main/LICENSE.dinov3.md
- Repositorio de investigacion DINOv3 de Meta: https://github.com/facebookresearch/dinov3
- Busqueda web realizada: sin resultados relevantes; los enlaces devueltos correspondian a Google Earth y Google Merchant Center y no guardan relacion con el modelo.
