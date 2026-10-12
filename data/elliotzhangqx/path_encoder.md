# elliotzhangQx/path_encoder

## Resumen

`elliotzhangQx/path_encoder` no es un modelo entrenado por el autor, sino un paquete de inferencia que unifica bajo una única interfaz cinco modelos fundacionales de patología computacional: TITAN, UNI2-h, CONCH, MUSK y KEEP. El objetivo es extraer características (embeddings) de parches de imágenes de portaobjetos completos (WSI, whole-slide imaging) sin depender de conexión a internet ni de token de HuggingFace, ya que los pesos deben estar descargados previamente en disco.

El repositorio ocupa 12,7 GB e incluye el código de orquestación (`extractor.py`, `encoders.py`, `example.py`) más dos ficheros de dependencias separados porque MUSK exige una versión de `timm` incompatible con la que necesita UNI2-h. La salida es un fichero HDF5 por portaobjetos con las matrices `features` (N, D) y `coords` (N, 2), y en el caso de TITAN también un `slide_embedding` de 768 dimensiones.

La relevancia práctica es que evita al investigador escribir cinco integraciones distintas con normalizaciones de entrada diferentes (ImageNet, CLIP y media 0,5) y resoluciones de entrada distintas (224, 384 y 448 píxeles). El repositorio registra 0 descargas y 0 likes en el momento de la consulta, no declara licencia, no declara pipeline y su model card aparece truncada en la sección de preguntas frecuentes.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible de forma explícita; los cinco encoders subyacentes son transformadores de visión (ViT) preentrenados, con TITAN operando a nivel de portaobjetos |
| Parametros totales | No disponible; tamaños en disco de los pesos: 12 GB en total (uni2h 2,6 GB, conch 766 MB, keep 3,1 GB, musk 3,7 GB, titan 1,9 GB) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica; resolución de entrada por parche: 224 px (uni2h, keep), 384 px (musk), 448 px (conch, titan) |
| Tipos de cuantizacion | fp32 por defecto; `amp_dtype` admite `fp16` y `bf16` en tiempo de ejecución (no hay pesos cuantizados publicados) |
| Idiomas soportados | No disponible (son modelos de visión; no procesan texto) |
| Licencia | No disponible |
| Formato de pesos | safetensors |
| Dependencias de ejecucion | PyTorch con CUDA 12.1, h5py, transformers, huggingface_hub, timm |
| Salida | HDF5: `features` (N, D) float32, `coords` (N, 2) int32, `slide_embedding` (768,) float32 solo en TITAN |
| Dimension de caracteristicas | 1536 (uni2h), 512 (conch), 768 (keep), 1024 (musk), 768 a nivel de slide (titan) |
| Normalizacion de entrada | ImageNet (uni2h, keep, titan), CLIP (conch), (0,5 / 0,5 / 0,5) (musk); KEEP devuelve la salida ya normalizada en L2 |
| Device por defecto | `cuda`; se puede fijar `cuda:1` u otra GPU concreta |

## Arquitectura y entrenamiento

No se proporciona información sobre el entrenamiento de los cinco encoders subyacentes (número de tokens, composición del dataset, uso de RLHF/DPO). Lo que el repositorio documenta es la capa de integración: un envoltorio `OfflineEncoder` que, en construcción, fija los pesos y las banderas de modo offline, y en llamada recibe un tensor `(B, 3, H, W)` en RGB sin normalizar y devuelve `(B, D)`. Internamente cada encoder aplica su propia normalización estadística y su propio redimensionado a la resolución de la tabla anterior, de modo que el usuario puede pasar parches a resolución nativa.

El detalle arquitectónico más relevante es la doble naturaleza de TITAN: no es un encoder de parche puro, sino un modelo de nivel de portaobjetos que necesita las coordenadas de nivel 0 (formato `(x, y)`, en píxeles de la imagen a resolución completa) y el parámetro `patch_size_lv0` para agregar los parches. Sus `features` en el HDF5 son en realidad la salida intermedia de parche de CONCH v1.5, y su salida final es el `slide_embedding` de 768 dimensiones. Los otros cuatro encoders reciben `coords` pero solo lo reescriben en la salida, sin usarlo en el cálculo.

En cuanto a infraestructura, el paquete está pensado para entornos aislados: el README insiste en que las banderas de offline se leen en el momento de importar `transformers` y `huggingface_hub`, por lo que `OfflineEncoder` debe construirse antes de importar esas librerías, y se genera una caché local en `<weights_dir>/hf_cache/` para el código remoto de los modelos. MUSK añade una opción de aumento multiescala (`ms_aug`) que duplica la dimensionalidad de salida de 1024 a 2048.

## Capacidades

- Extracción de características de parches de WSI en modo batch, con división interna por `batch_size` (256 por defecto) y reensamblado en el orden original, de modo que `features[i]` corresponde siempre a `coords[i]`.
- Extracción de un embedding de nivel de portaobjetos con TITAN, que agrega los parches usando sus coordenadas de nivel 0.
- Selección entre cinco backbones con una sola cadena de texto como identificador: `uni2h`, `conch`, `keep`, `musk`, `titan`.
- Escritura directa a HDF5 con metadatos en `attrs`: `encoder`, `hf_repo`, `feat_dim`, `input_size`, `n_patches` y, para TITAN, `slide_dim` y `patch_size_lv0`.
- Aceleración en precisión reducida mediante `amp_dtype="fp16"` o `"bf16"`, desactivada por defecto.
- Aceptación de entradas en rango `[0,1]` o `[0,255]` mediante `input_range`, con reescalado automático.
- Aumento multiescala opcional en MUSK (`ms_aug`), que pasa de 1024 a 2048 dimensiones.
- Ejecución sin red y sin token de HuggingFace, con pesos cargados desde un directorio local arbitrario.
- No soporta generación de texto, tool calling, function calling, razonamiento multi-paso, visión-lenguaje generativa, audio ni agentes.

## Casos de uso

- Entrenamiento de clasificadores de múltiples instancias (MIL) para diagnóstico oncológico: se extraen las características de todos los parches de una cohorte de WSI con un encoder fijo y se entrena una cabeza de atención sobre la matriz `(N, D)` resultante, sin necesidad de reentrenar el backbone.
- Recuperación de imágenes por similitud en archivos de anatomía patológica: los embeddings de KEEP vienen normalizados en L2, por lo que el producto escalar entre vectores equivale directamente a similitud coseno y permite construir índices de búsqueda sin postprocesado.
- Predicción de biomarcadores y análisis de supervivencia: el `slide_embedding` de 768 dimensiones de TITAN condensa el portaobjetos completo en un vector único, adecuado como entrada para modelos de riesgo proporcional o clasificadores de estado mutacional.
- Preprocesamiento para modelos visión-lenguaje en patología: los 512 dimensiones de CONCH están alineados con el espacio CLIP, lo que facilita tareas de recuperación texto-imagen y clasificación zero-shot sobre las características extraídas.
- Análisis multirresolución de tejido: la opción `ms_aug` de MUSK genera características de 2048 dimensiones que combinan varias escalas, útil para tareas donde la morfología relevante aparece a distintos aumentos (por ejemplo, invasión linfovascular frente a arquitectura glandular).
- Agrupamiento no supervisado y control de calidad de tejido: aplicar k-means o UMAP sobre las características de parche permite segmentar regiones (tumor, estroma, necrosis, artefactos) y detectar portaobjetos problemáticos antes de incluirlos en un estudio.
- Pipelines de investigación en entornos clínicos aislados: al funcionar íntegramente offline con pesos locales, el paquete se puede desplegar en redes hospitalarias sin salida a internet ni credenciales externas.
- Evaluación comparativa de backbones de patología: la interfaz común permite lanzar el mismo conjunto de parches por los cinco encoders y comparar el rendimiento aguas abajo con una única tubería de datos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no incluye métricas de lineal probing, clasificación de portaobjetos, recuperación ni tiempos de inferencia, y la búsqueda web realizada no ha devuelto documentación técnica ni publicaciones asociadas a este identificador.

## Requisitos de hardware

- Almacenamiento: 12,7 GB de repositorio y en torno a 12 GB de pesos distribuidos en cinco subdirectorios (`uni2h` 2,6 GB, `conch` 766 MB, `keep` 3,1 GB, `musk` 3,7 GB, `titan` 1,9 GB).
- VRAM para inferencia: no publicada por el autor. Como orientación, el peso en fp32 de cada encoder más las activaciones de un lote de 256 parches; el tamaño de los ficheros de pesos sugiere un rango de aproximadamente 3 GB para `conch` hasta 15 GB para `musk` en fp32. Con `amp_dtype="bf16"` el consumo se reduce de forma apreciable. Estas cifras son una estimación a partir del tamaño en disco y no un dato verificado.
- GPU recomendadas: NVIDIA A100 (40 o 80 GB) o H100 para procesar portaobjetos completos con lotes grandes y los cinco encoders; RTX 4090 o RTX A6000 (24 y 48 GB) para uso individual con lotes reducidos.
- Viabilidad en GPU de consumo: los cinco encoders caben en una GPU de 24 GB si se usa `bf16` y se reduce `batch_size` por debajo del valor por defecto de 256. El `batch_size` solo afecta al consumo de memoria y no modifica los resultados.
- Multi-GPU: no hay paralelismo de datos integrado; el único control documentado es seleccionar el dispositivo con `device="cuda:N"`, lo que obliga a repartir manualmente el trabajo por portaobjetos.
- Opciones de despliegue: el paquete es una biblioteca Python sobre PyTorch. No se documenta soporte para vLLM, TGI, llama.cpp, Ollama ni ONNX Runtime, que además no aplican a un modelo de visión de este tipo. Existe `example.py` como plantilla ejecutable y `OfflineEncoder` como API de bajo nivel para integrar en un pipeline propio.
- Entorno de ejecución: se requieren dos entornos conda independientes (Python 3.10) por el conflicto de versiones de `timm` entre MUSK y el resto; CONCH y MUSK deben instalarse desde GitHub con `--no-deps`.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

La comparación externa con otros backbones de patología (por ejemplo, otros ViT de patología de dominio público) no está disponible porque el repositorio no publica métricas. La comparación interna entre los cinco encoders que encapsula, extraída de su propia documentación, es la siguiente:

| Encoder | Dimension de salida | Entrada (px) | Normalizacion | Peso en disco | Nivel |
|---|---|---|---|---|---|
| uni2h | 1536 | 224 | ImageNet | 2,6 GB | Parche |
| conch | 512 | 448 | CLIP | 766 MB | Parche (alineado con texto) |
| keep | 768 | 224 | ImageNet (salida L2) | 3,1 GB | Parche |
| musk | 1024 (2048 con `ms_aug`) | 384 | 0,5 / 0,5 / 0,5 | 3,7 GB | Parche |
| titan | 768 a nivel de slide | 448 | ImageNet | 1,9 GB | Portaobjetos |

Frente a usar cada modelo por separado, la ventaja del paquete es la interfaz común y la gestión unificada de normalización; la desventaja es la dependencia de dos entornos incompatibles y la ausencia de control de versiones de los pesos de terceros.

## Limitaciones y advertencias

- No es un modelo entrenado por el autor del repositorio: es un envoltorio sobre pesos de terceros. Las condiciones de uso de TITAN, UNI2-h, CONCH, MUSK y KEEP corresponden a sus autores originales y el repositorio no reproduce ninguna de esas licencias, por lo que el uso comercial queda sin cobertura clara.
- La licencia del propio repositorio figura como no disponible, igual que el pipeline, los idiomas y la model card completa: la sección de preguntas frecuentes aparece cortada a mitad de frase.
- El repositorio tiene 0 descargas y 0 likes, sin validación por parte de la comunidad ni resultados reproducibles publicados.
- Las fechas de creación y actualización que declara HuggingFace (2026-10-12) son anómalas y sugieren metadatos incorrectos o generados automáticamente.
- Los errores en `coords` o en `patch_size_lv0` no producen excepción: en TITAN dan lugar a un `slide_embedding` incorrecto de forma silenciosa. Es un fallo difícil de detectar aguas abajo.
- Si los parches ya han sido normalizados con estadísticas de ImageNet antes de llamar al encoder, las características de CONCH y MUSK son incorrectas y el sistema tampoco avisa.
- `coords` debe estar en píxeles de nivel 0 y en orden `(x, y)`. Confundirlo con índices de parche o con coordenadas de nivel 1 o 2 invalida el resultado.
- Riesgo de alucinación: no aplica, ya que son modelos discriminativos de visión y no generan texto.
- Sesgos: no documentados. Al ser modelos de patología, su comportamiento depende de la distribución de tejido, tinción y escáner del conjunto de entrenamiento original, que no se describe.
- Limitaciones de idioma: no aplica en el sentido lingüístico, pero el sesgo de dominio (tipos de tinción H&E, fabricantes de escáner) es un riesgo real y no está cuantificado.
- La instalación es frágil: dos entornos conda separados, instalación desde GitHub con `--no-deps` para CONCH y MUSK, y la advertencia explícita de no instalar `torchscale` desde PyPI porque fija `timm==0.6.13` y rompe la resolución de dependencias.
- `OfflineEncoder` debe construirse antes de importar `transformers` o `huggingface_hub`; hacerlo al revés emite un `RuntimeWarning` y puede provocar intentos de acceso a red en entornos sin conexión.
- No hay soporte nativo de procesamiento distribuido: el reparto por GPU es manual.
- Sin benchmarks, sin métricas de latencia y sin información sobre parámetros totales, no es posible dimensionar con precisión una infraestructura de producción a partir de esta ficha.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/elliotzhangQx/path_encoder
- Repositorio de CONCH (dependencia obligatoria, instalación desde GitHub): https://github.com/mahmoodlab/CONCH
- Repositorio de MUSK (dependencia obligatoria, instalación desde GitHub): https://github.com/lilab-stanford/MUSK
- Papers, blogs, demos o documentación adicional: no disponible. La búsqueda web realizada no ha devuelto ningún resultado relacionado con este modelo; los resultados obtenidos corresponden a contenido de impresión 3D sin relación con el repositorio y se han descartado como fuentes.
