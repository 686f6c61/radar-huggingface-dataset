# alessandro54/pettrace-production

## Resumen

PetTrace production es un bundle de inferencia versionado para el sistema de reidentificacion de mascotas PetTrace, publicado por el desarrollador alessandro54. No se trata de un modelo de lenguaje, sino de un pipeline de extraccion de caracteristicas visuales orientado a la recuperacion de imagenes (image retrieval) de gatos y perros: dada una foto de consulta, devuelve un vector de 1024 dimensiones que permite ordenar fotos de referencia de la misma mascota para revision humana. El encoder es DINOv2 ViT-L/14 adaptado mediante LoRA (rango 8, alpha 16) sobre las proyecciones query y value, y se distribuye en formato ONNX para su ejecucion con onnxruntime.

El paquete incluye tambien un detector YOLOv8n que recorta la caja de mayor confianza de gato o perro (umbral 0,25, margen del 10 %, con fallback a la imagen completa) antes de pasar la imagen por el encoder. La salida se normaliza L2 y se compara por similitud coseno. El autor insiste en que el sistema solo ordena candidatos para revision humana y no certifica identidad ni predice ubicacion; el filtrado geografico lo implementa la aplicacion a partir de coordenadas registradas.

La relevancia de esta publicacion es doble: por un lado, demuestra un patron de despliegue reproducible (checksums SHA-256, golden self-test, identificador inmutable de release, verificacion de exportacion) poco habitual en modelos de vision pequenos; por otro, su licencia AGPL-3.0 por la inclusion de Ultralytics YOLOv8 condiciona fuertemente su uso comercial. El repositorio ocupa 1,2 GB y no registra descargas ni likes en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DINOv2 ViT-L/14 con adaptadores LoRA (rango 8, alpha 16, proyecciones query/value); detector YOLOv8n para recorte |
| Parametros totales | no disponible (el repo pesa 1,2 GB en ONNX; el backbone ViT-L/14 ronda los 300 M, pero el autor no lo declara) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de vision; entrada 224x224 tras recorte central) |
| Tipos de cuantizacion | no disponible (se distribuye en ONNX; el autor no documenta variantes cuantizadas) |
| Idiomas soportados | no aplica (modelo de imagen) |
| Licencia | AGPL-3.0 (incluye YOLOv8 de Ultralytics bajo AGPL-3.0; DINOv2 upstream es Apache-2.0) |
| Formato de pesos | ONNX (`encoder.onnx`, `detector.onnx`), mas `pipeline.yaml`, `golden.npy`, `release.json` y `export-verification.json` |

## Arquitectura y entrenamiento

El encoder es un transformer de vision DINOv2 ViT-L/14 (parche de 14 px) adaptado con LoRA de rango 8 y alpha 16 unicamente sobre las proyecciones query y value, con semilla 45. No se anade cabeza de proyeccion MLP ni reranker morfologico E5. El pipeline de preprocesado es RGB, redimensionado bicubico del lado corto a 256, recorte central a 224 y normalizacion ImageNet; la salida es un embedding de 1024 dimensiones normalizado L2 y la comparacion se hace por similitud coseno. El recorte previo lo realiza YOLOv8n seleccionando la caja de mayor confianza de gato o perro con umbral 0,25 y un margen del 10 %, con fallback a la imagen completa si no hay deteccion valida.

El autor no documenta el volumen de tokens ni la composicion del dataset de entrenamiento, aunque referencia un run de entrenamiento identificado como `209b96e9182c45d3a69e5671a5201e3c` y un commit fuente de DINOv2 (`47b73eefe95e8d44ec3623f8890bd894b6ea2d6c`). La evaluacion registrada usa leave-one-photo-out retrieval con galerias especificas por especie; el propio autor advierte que la independencia entre sesiones de captura no queda establecida por esas cifras. El identificador de modelo es `dinov2-large-crop-lora-r8-s45@20261121` y el adaptador tiene SHA-256 `ad8939b999056fe2b048a17d89426c25ca4f49986735dcb4eeac484bcb1b65c8`.

## Capacidades

- Extraccion de caracteristicas visuales para reidentificacion de gatos y perros (animal re-identification / pet re-identification).
- Generacion de embeddings de 1024 dimensiones normalizados L2, aptos para busqueda por similitud coseno en bases vectoriales.
- Deteccion y recorte automatico del animal mediante YOLOv8n, con fallback a imagen completa.
- Ranking de fotos de referencia de una misma mascota para revision humana.
- Integracion con almacenes vectoriales de 1024 dimensiones (el autor cita Qdrant y advierte que los vectores CLIP de 512 dimensiones no son compatibles).
- Verificacion de integridad de artefactos mediante checksums SHA-256 y golden self-test determinista.
- No soporta tool calling, agentes, texto, audio ni razonamiento multi-paso: es exclusivamente un extractor de features de imagen.

## Casos de uso

- Reidentificacion de mascotas perdidas: dada una foto de un gato o perro, el sistema genera su embedding y lo compara contra una galeria de fotos registradas, devolviendo los candidatos mas similares para que un operador confirme la coincidencia.
- Registro de animales en refugios y protectoras: al ingresar un animal se calcula su embedding y se contrasta con el historial de la entidad para detectar reingresos o duplicados en la base de datos.
- Triaje en aplicaciones de busqueda visual para duenos: el pipeline de recorte con YOLOv8n permite aceptar fotos con fondo desordenado y centrar la comparacion en el animal, reduciendo falsos positivos por entorno.
- Moderacion y validacion de fotos subidas: la validacion obligatoria de animal de la aplicacion puede rechazar imagenes sin gato o perro antes de ejecutar la recuperacion.
- Indexacion de galerias a escala: los embeddings de 1024 dimensiones en colecciones Qdrant separadas permiten mantener galerias por especie y reindexar mediante los servicios propios de Core.
- Despliegue en infraestructura propia con onnxruntime: al distribuirse como ONNX, el bundle puede servirse sin depender de PyTorch, lo que simplifica el empaquetado en contenedores y la reproducibilidad del entorno.
- Auditoria de releases de modelos: el patron de `release.json` con checksums, golden set sintetico y `export-verification.json` sirve como referencia para equipos que necesitan trazabilidad de artefactos en produccion.

## Benchmarks y rendimiento

| Dataset | Consultas | Rank-1 | mAP |
|---|---:|---:|---:|
| Public test v2 | 277 | 96,03 % | 0,9140 |
| PetTrace v6 (privado) | 502 | 95,82 % | 0,9040 |

El autor especifica que son resultados del checkpoint con semilla 45, no de un ensayo con iPhone ni de la demo de 50 consultas, y que no constituyen un agregado multi-semilla ni una estimacion del exito real de recuperacion. Las fotos de PetTrace v6 no se redistribuyen en el repositorio.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; el repo pesa 1,2 GB en ONNX y el backbone ViT-L/14 en fp32 ocupa del orden de 1,2 GB de pesos, por lo que en fp16 o con cuantizacion cabria en GPUs de 8 GB o menos, aunque el autor no publica cifras.
- GPU recomendadas: no disponibles en la informacion proporcionada. Por tamano, una GPU consumer de gama media-alta (RTX 3060/4070 o superior) seria suficiente para inferencia por lotes pequenos, pero es una estimacion, no un dato del autor.
- Cabe en GPU consumer: previsiblemente si, dado el tamano del bundle, aunque sin cifras oficiales de memoria ni latencia.
- Opciones de despliegue: onnxruntime (libreria declarada), con el contrato `MODEL_URI=hf://alessandro54/pettrace-production@<commit>` y `EMBEDDING_DIMS=1024`; requiere verificar checksums, ejecutar el golden self-test y comprobar dimensiones de coleccion antes de servir.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto/entrada | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| PetTrace production (este) | no disponible (ViT-L/14 + LoRA, ONNX 1,2 GB) | imagen 224x224 | Reidentificacion de mascotas con recorte YOLOv8n | AGPL-3.0 | Hugging Face, 0 descargas |
| facebook/dinov2-large (base) | no disponible en la informacion | imagen 224x224 | Extraccion de features visuales generica | Apache-2.0 | Hugging Face |
| CLIP (referencia del autor) | no disponible | imagen + texto, embeddings 512 dim | Vision-lenguaje / retrieval generico | no disponible | Ampliamente disponible |

La comparativa se limita a los modelos citados en la informacion; no se dispone de datos de benchmarks de las alternativas para contrastar rendimiento en la misma tarea.

## Limitaciones y advertencias

- El ranking debe ser revisado por una persona; las puntuaciones de similitud no son probabilidades calibradas.
- Iluminacion deficiente, oclusion, fallos del detector y condiciones no vistas pueden degradar la recuperacion.
- La validacion obligatoria de animal de la aplicacion puede rechazar una foto aunque la recuperacion offline recurra a la imagen completa.
- El autor no reclama resultados de un piloto de campo multiusuario ni precision GPS.
- Independencia entre sesiones de captura no establecida por la evaluacion registrada.
- Licencia AGPL-3.0 por la inclusion de Ultralytics YOLOv8: el uso comercial en red puede obligar a liberar el codigo de la aplicacion; deben conservarse los avisos upstream de YOLOv8 (AGPL-3.0) y DINOv2 (Apache-2.0).
- `production` es una etiqueta movil, no un identificador inmutable: debe fijarse el commit devuelto por el Hub.
- Los vectores CLIP de 512 dimensiones no son compatibles con las colecciones de 1024 dimensiones de este release.
- El golden set es entrada sintetica determinista, no una foto real de animal.
- Sin descargas ni likes registrados: no hay evidencia de adopcion ni de validacion externa.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/alessandro54/pettrace-production
- Repositorio de la aplicacion PetTrace: https://github.com/alessandro54/pettrace
- Repositorio de ML de PetTrace: https://github.com/alessandro54/pettrace-ml
- Run de verificacion de exportacion: https://ml.pettrace.app/#/experiments/2/runs/a860d173e5d941899e83d5374af4df82
- Modelo base DINOv2 large: https://huggingface.co/facebook/dinov2-large
