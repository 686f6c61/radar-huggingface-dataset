# hellnahbru/OpenMidnight-1.0-SPECTRA-preserved-20261029

## Resumen

OpenMidnight-1.0-SPECTRA es un modelo de extraccion de caracteristicas visuales especializado en histopatologia, desarrollado por MedARC y Sophont a partir del modelo base SophontAI/OpenMidnight. Se trata de un fine-tuning con la tecnica SPECTRA, un objetivo contrastivo que alinea las representaciones del mismo tejido entre distintos escaneres y tinciones, de modo que el modelo produce embeddings robustos a la variabilidad tecnica propia de los laboratorios de anatomia patologica. La version publicada bajo el identificador `hellnahbru/OpenMidnight-1.0-SPECTRA-preserved-20261029` es una copia preservada del release legacy 1.0.

Arquitectonicamente es un modelo de vision tipo transformer (familia timm) con 1.134.774.272 parametros, que procesa teselas RGB de 224 x 224 pixeles tras un redimensionado bicubico a 256 pixeles y recorte central, y devuelve un embedding de 1.536 dimensiones a partir del token CLS. No es un modelo generativo: su pipeline es `image-feature-extraction` y esta pensado como extractor de caracteristicas para modelos downstream a nivel de portaobjetos.

Su relevancia radica en que elimina la necesidad de acceso a clusters o checkpoints adicionales: todos los pesos de inferencia estan incluidos en el repositorio (4,5 GB) y se cargan directamente con timm. La licencia Apache 2.0 facilita su uso comercial, aunque el autor advierte que se trata de un release legacy y recomienda la version 1.1 para uso actual.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de vision (timm), no disponible el detalle exacto de la familia |
| Parametros totales | 1.134.774.272 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no aplicable (modelo de vision; entrada de imagen 224 x 224 tras recorte) |
| Tipos de cuantizacion | no disponible (pesos en safetensors; no se documentan variantes GGUF/AWQ) |
| Idiomas soportados | en (etiqueta del modelo; la salida son embeddings, no texto) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |
| Dimension del embedding | 1.536 |
| Resolucion de entrada | redimensionado bicubico a 256 px, recorte central 224 x 224, normalizacion ImageNet |
| Libreria | timm 1.0.30 |
| Tamano del repositorio | 4,5 GB |

## Arquitectura y entrenamiento

El modelo parte de SophontAI/OpenMidnight, un backbone de vision transformer para imagenes histologicas, y se adapta mediante SPECTRA (MedARC y Sophont). El entrenamiento se realizo sobre teselas de imagen PLISM registradas, aplicando un objetivo contrastivo que acerca las representaciones del mismo tejido capturado con distintos escaneres y tinciones. Las actualizaciones aprendidas se fusionan en los pesos completos del modelo, de modo que no se requiere ningun adaptador separado ni checkpoint base adicional en inferencia.

La innovacion principal es la invariancia a dominio: al alinear explicitamente las representaciones entre dominios tecnicos (escaner y tincion), el extractor deberia generalizar mejor a datos de distintos laboratorios sin reentrenamiento. No se especifican en la informacion disponible el numero de tokens de entrenamiento, la composicion exacta del dataset ni si se emplearon etapas de RLHF o DPO (no aplicables a un extractor de caracteristicas). El paper esta anunciado como "coming soon".

## Capacidades

- Extraccion de caracteristicas de imagenes: convierte teselas RGB de histologia en embeddings de 1.536 dimensiones (token CLS).
- Invariancia a escaner y tincion: representaciones alineadas entre dominios mediante entrenamiento contrastivo SPECTRA.
- Inferencia autocontenida: todos los pesos incluidos, sin adaptadores ni acceso a cluster.
- Ejecucion en CPU o GPU (CUDA) mediante timm.
- Integracion con pipelines de timm: transformaciones resueltas automaticamente desde `config.json`.
- No soporta generacion de texto, tool calling, agentes, vision general ni audio.
- No produce predicciones a nivel de portaobjetos por si solo: requiere un modelo downstream sobre los embeddings de tesela.

## Casos de uso

- Clasificacion de tejido a nivel de tesela: extraer embeddings de cada tesela de una muestra y entrenar un clasificador ligero (regresion logistica o MLP) para distinguir tipos de tejido o subtipos tumorales, aprovechando la dimensionalidad de 1.536 del vector CLS.
- Recuperacion de imagenes patologicas (image retrieval): indexar embeddings de una base de teselas y buscar casos morfologicamente similares por similitud coseno, util para revision de casos y control de calidad.
- Deteccion de artefactos y control de calidad: comparar la distribucion de embeddings de un lote nuevo frente a la referencia para detectar tinciones defectuosas o escaneres mal calibrados, gracias a la invariancia SPECTRA.
- Agrupamiento no supervisado de morfologias: aplicar clustering (k-means, UMAP) sobre los embeddings para descubrir patrones histologicos sin etiquetas, como fase exploratoria en investigacion.
- Preprocesamiento para modelos de supervivencia o pronostico: usar los embeddings de tesela como entrada de un modelo de multiple instance learning (MIL) a nivel de portaobjetos para tareas de pronostico.
- Normalizacion de dominio entre laboratorios: emplear el extractor como paso de armonizacion de datos antes de entrenar modelos en cohortes multi-centro, reduciendo el sesgo por escaner.
- Busqueda de casos en repositorios de investigacion: construir un motor de busqueda semantica sobre archivos de patologia digital para acelerar la seleccion de cohortes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP32: aproximadamente 4,5 GB solo de pesos, mas activaciones; en la practica conviene reservar 6-8 GB.
- VRAM estimada en FP16/BF16: alrededor de 2,3 GB de pesos; con activaciones, unos 4 GB.
- GPU recomendadas: cualquier GPU con 8 GB o mas de VRAM; A100, H100 o L40S para procesamiento por lotes a gran escala de miles de teselas.
- Cabe en GPU de consumo: si, por ejemplo RTX 3060 de 12 GB, RTX 4070, RTX 4090.
- Despliegue: timm 1.0.30 con PyTorch y torchvision; carga via `hf-hub:medarc/OpenMidnight-1.0-SPECTRA`; tambien es posible exportar a TorchScript u ONNX, aunque no se documenta en la model card.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Entrada / salida | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| OpenMidnight-1.0-SPECTRA | 1.134.774.272 | tesela 224 x 224 / embedding 1.536 | no aplica | apache-2.0 | HuggingFace (timm) |
| OpenMidnight-1.1-SPECTRA | no disponible | no disponible | no aplica | no disponible | HuggingFace (medarc) |
| SophontAI/OpenMidnight (base) | no disponible | no disponible | no aplica | no disponible | HuggingFace |

No se dispone de datos de rendimiento comparativo entre estas variantes en la informacion proporcionada; la unica diferencia documentada es que 1.1-SPECTRA es la version recomendada frente a este release legacy 1.0.

## Limitaciones y advertencias

- Release legacy: el propio autor recomienda usar OpenMidnight-1.1-SPECTRA en su lugar; esta copia preservada no debe tomarse como la version actual.
- Solo teselas: el modelo no produce predicciones a nivel de portaobjetos; se necesita un modelo downstream (por ejemplo MIL) para tareas clinicas.
- Dominio restringido: entrenado para histologia RGB; su uso fuera de ese dominio (radiologia, imagen natural) no esta validado.
- Riesgo de sesgo por dataset: la composicion del corpus PLISM no se detalla, por lo que pueden persistir sesgos hacia determinados tejidos, tinciones o poblaciones de pacientes.
- Sin garantias clinicas: no se documenta validacion regulatoria ni rendimiento diagnostico; no apto para decision clinica directa.
- Licencia Apache 2.0 permite uso comercial, pero el usuario asume la responsabilidad de validar el modelo en su contexto.
- Idiomas: etiqueta `en`; irrelevante para la salida (embeddings), pero relevante si se combina con modelos de texto.
- No se documentan cuantizaciones oficiales; cualquier conversion a GGUF/ONNX corre por cuenta del usuario y puede alterar los embeddings.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/hellnahbru/OpenMidnight-1.0-SPECTRA-preserved-20261029
- Modelo base: https://huggingface.co/SophontAI/OpenMidnight
- Version recomendada: https://huggingface.co/medarc/OpenMidnight-1.1-SPECTRA
- MedARC: https://www.medarc.ai/
- Sophont: https://sophont.med/
- Paper: pendiente de publicacion (no disponible)
