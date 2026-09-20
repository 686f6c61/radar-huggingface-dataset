# ERISLab/FGIR-ViT

## Resumen

FGIR-ViT es un repositorio de checkpoints publicado por ERISLab en HuggingFace, no un modelo único ni un modelo de lenguaje. Contiene 1.051 checkpoints (un seed por configuración, solo la última época) procedentes de la familia de experimentos FGIR-ViT sobre reconocimiento de imágenes fine-grained, y sirve de respaldo a la familia `fgirvit` de la librería `fgir_zoo`.

El conjunto agrupa cuatro líneas de trabajo: el adaptador inter-capas ILA con precalentamiento contrastivo SAW, el adaptador de agregación de atención (AAA), los estudios médicos de PETL e IDRiD, y el benchmark de fine-tuning completo fine-grained (`ft_*`). El backbone dominante es ViT-B/16, con variantes puntuales sobre DeiT-B/16, Swin-B y ViT-B/14 de DINOv2, además de baselines congelados de MAE, DINOv2 y CLIP.

Su relevancia es fundamentalmente investigadora: permite reproducir experimentos de transferencia eficiente de parámetros (PETL) en clasificación fine-grained y médica sin reentrenar, cargando cualquier checkpoint por nombre mediante `fgir_zoo`. Es un artefacto de investigación sin licencia declarada, sin pipeline de inferencia publicado y con 0 descargas y 0 likes en el momento de la consulta.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision Transformer; backbone principal ViT-B/16 con adaptadores PETL (ILA inter-capas, AAA de agregación de atención); también DeiT-B/16, Swin-B/4 y ViT-B/14 DINOv2 |
| Parametros totales | no disponible; el backbone ViT-B/16 ronda los 86 M de parámetros (dato estándar de la arquitectura, no confirmado en la model card) y el total por checkpoint depende del adaptador |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica; resolución de entrada de 224, 448 o 672 px según la línea experimental (modelo de visión, sin ventana de tokens de texto) |
| Tipos de cuantizacion | no disponible; se distribuyen checkpoints `.pth` en precisión completa, presumiblemente fp32, sin versiones cuantizadas documentadas |
| Idiomas soportados | no aplica (modelo de visión; no procesa texto) |
| Licencia | no disponible |
| Formato de pesos | PyTorch `.pth`; cada archivo es un diccionario con `config`, `model`, `accuracy` y `epoch` |

## Arquitectura y entrenamiento

La arquitectura base es un Vision Transformer de tipo ViT-B/16 (parches de 16x16, resolución de trabajo 224, 448 o 672 px según el grupo). Sobre ese backbone se estudian distintas estrategias de adaptación: el adaptador inter-capas ILA junto con el precalentamiento contrastivo SAW (`ila_*`), el adaptador de agregación de atención AAA (`aaa_*`), y variantes de PETL médico. Los grupos `ila_saw_deit`, `ila_swin` y `ila_dinov2` replican parte de los experimentos sobre backbones DeiT-B/16, Swin-B y ViT-B/14 DINOv2, y `ila_foundation` recoge baselines congelados de MAE, DINOv2 y CLIP como referencia comparativa.

No se detalla en la model card el volumen de tokens de entrenamiento, la composición exacta de los datasets ni si hubo etapas de RLHF o DPO (no aplicables en clasificación de imagen). Sí se documenta la metodología experimental: 1.051 checkpoints, un único seed por configuración y conservación exclusiva de la última época, con el serial de wandb como sufijo identificativo. Las innovaciones destacadas son el adaptador ILA, el precalentamiento contrastivo SAW, el esquema AAA de agregación de atención y el estudio sistemático de PETL en imagen médica, además de un banco de comparación de fine-tuning completo (`ft_224`, `ft_448`).

## Capacidades

- Clasificación de imágenes fine-grained: cada checkpoint almacena su precisión top-1 en el conjunto de test dentro del propio archivo.
- Clasificación en dominio médico-oftalmológico: los grupos `medical_idrid` y `medical_petl` cubren estudios sobre el conjunto IDRiD y variantes de PETL médico.
- Adaptación eficiente de parámetros: adaptadores entrenables (ILA, ILA++ convolucional, AAA, adaptador plano) sobre backbone congelado, comparados frente a fine-tuning completo.
- Extracción de representaciones: el repositorio conserva volcados de características de transferibilidad y análisis CKA en `results_ila`.
- Visualización de atención: los grupos `aaa_viz` e `ila_contrastive` incluyen ejecuciones de visualización y cabezas contrastivas (`ifc`).
- Reproducibilidad por configuración: el `config` embebido en cada `.pth` contiene el espacio de argumentos completo de la ejecución y dirige la construcción del modelo.
- Carga unificada: `fgir_zoo.list_models(family='fgirvit')` enumera los nombres disponibles y `manifest.csv` contiene el conjunto de filas.

No dispone de generación de texto, tool calling, function calling, razonamiento multi-paso, capacidades de agente, soporte multilingüe, ni entrada de audio o de texto. No es un modelo multimodal visión-lenguaje.

## Casos de uso

- Clasificación fine-grained en producción agrícola: un checkpoint de la línea `ft_*` o `aaa_*` puede desplegarse como clasificador de variedades o enfermedades a partir de imágenes de hoja, aprovechando el adaptador entrenado sobre el dataset `soylocal` sin necesidad de reentrenar el backbone.
- Cribado de retinopatía diabética en investigación clínica: los checkpoints de `medical_idrid` permiten evaluar estrategias de PETL sobre imágenes de fondo de ojo, comparando el adaptador AAA con el fine-tuning completo en un escenario de datos limitados y etiquetado costoso.
- Transferencia a dominios con pocos datos: al mantener el backbone congelado y entrenar solo el adaptador, la familia ILA/AAA es adecuada cuando el nuevo dominio dispone de cientos o miles de imágenes y no de millones.
- Benchmarking de métodos de adaptación: los grupos `ila_ablations`, `ila_equal_compute` y `aaa_main_672` permiten comparar attention-aggregation, ILA++ convolucional, adaptador plano y backbone congelado sobre diez datasets en condiciones de cómputo equiparadas.
- Análisis de representaciones internas: los volcados de CKA y de transferibilidad de características sirven para estudiar qué capas del ViT se ven más afectadas por cada tipo de adaptador.
- Interpretabilidad mediante mapas de atención: los checkpoints de `aaa_viz` permiten generar visualizaciones de atención y auditar qué regiones de la imagen sustentan la predicción.
- Reproducción de resultados publicados: los 1.051 checkpoints con configuración embebida permiten reconstruir las tablas de los artículos de ILA/SAW, AAA, PETL médico y el benchmark FGIR sin acceso al entorno original de entrenamiento.
- Comparación de backbones fundacionales: los grupos `ila_foundation`, `ila_dinov2`, `ila_swin` y `ila_saw_deit` sirven para evaluar el efecto del backbone preentrenado (MAE, DINOv2, CLIP, ImageNet) en tareas fine-grained.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye tablas agregadas de MMLU, HumanEval, GSM8K ni equivalentes (no aplicables a un modelo de clasificación de imagen), y no reporta cifras top-1 por dataset ni por método. El único dato de rendimiento accesible es la precisión top-1 almacenada dentro de cada archivo `.pth`, que debe leerse individualmente tras la descarga. Los resultados de búsqueda web disponibles no contienen información relacionada con este modelo.

## Requisitos de hardware

- VRAM para inferencia (estimaciones orientativas, no publicadas por el autor): un checkpoint ViT-B/16 en fp32 ocupa aproximadamente 330-350 MB solo en pesos; con activaciones, una inferencia a lote 1 debería situarse en torno a 1-2 GB a 224 px, 2-4 GB a 448 px y 4-8 GB a 672 px, dado que a 672 px la secuencia de parches crece hasta 1.765 tokens.
- Fine-tuning: los grupos con backbone congelado y solo adaptador entrenable son notablemente más ligeros que `ft_224`/`ft_448` (fine-tuning completo). El entrenamiento a 672 px con fine-tuning completo es la configuración más exigente y requiere GPUs de 40-80 GB para lotes medianos.
- GPU recomendadas: para inferencia, cualquier GPU consumer con 8 GB o más (RTX 3060, RTX 4060, RTX 3080, RTX 4090). Para reentrenamiento de adaptadores, RTX 4090 (24 GB) o A100/H100. Para fine-tuning completo a 448-672 px con lotes grandes, A100 80 GB o H100.
- Compatibilidad con GPU de consumo: sí para inferencia en todas las resoluciones documentadas y para entrenamiento de adaptadores con backbone congelado; el fine-tuning completo a alta resolución puede requerir acumulación de gradiente o resolución reducida en GPUs de 24 GB.
- Opciones de despliegue: PyTorch nativo (`torch.load(path, weights_only=False)`), la librería `fgir_zoo`, backbones de `timm`, y exportación a TorchScript u ONNX. vLLM, llama.cpp, Ollama y TGI no son aplicables, ya que están orientados a modelos de lenguaje.
- Almacenamiento: el repositorio completo ocupa 198,5 GB, por lo que conviene descargar únicamente los checkpoints necesarios en lugar de clonar el repositorio entero.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Tipo | Backbone / parámetros | Resolución | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| FGIR-ViT (ERISLab) | Zoo de 1.051 checkpoints de clasificación fine-grained con adaptadores PETL | ViT-B/16, DeiT-B/16, Swin-B, ViT-B/14 DINOv2 (aprox. 86-88 M en el backbone) | 224 / 448 / 672 px | no disponible | HuggingFace, 198,5 GB, con script de carga propio |
| Baselines `ila_foundation` (MAE, DINOv2, CLIP) | Backbones congelados incluidos en el propio repositorio | ViT-B | 224 px | la del repositorio original | Incluidos en el mismo repo; licencia no declarada aquí |
| ViT-B/16 preentrenado en ImageNet (referencia externa) | Clasificador genérico de imagen | ViT-B/16, aprox. 86 M | 224 px | no verificada en esta ficha | Ampliamente disponible en `timm` |
| Adaptadores PETL genéricos (LoRA, adaptadores congelados) | Métodos de adaptación, no checkpoints concretos | Sobre ViT-B/16 | Según configuración | no disponible | Implementaciones diversas |

La comparación con alternativas externas queda limitada porque la model card no publica métricas top-1 agregadas que permitan situar FGIR-ViT frente a otros clasificadores de la misma categoría. La ventaja diferencial del repositorio es la cobertura experimental (1051 configuraciones sobre 18 grupos, con seeds y ablaciones documentadas) más que un resultado de precisión concreto.

## Limitaciones y advertencias

- Licencia no declarada: al no especificarse licencia en HuggingFace ni en la model card, no puede asumirse permiso para uso comercial; es imprescindible contactar con ERISLab antes de cualquier despliegue productivo.
- Artefacto de investigación, no producto: no hay pipeline de inferencia publicado, ni demo, ni documentación de API más allá de la carga por nombre con `fgir_zoo`.
- Un solo seed por configuración: no es posible estimar varianza entre ejecuciones ni intervalos de confianza a partir de estos checkpoints.
- Solo última época: no se conservan las mejores épocas; los archivos de mejor época, búsquedas de learning rate, seeds extra y ejecuciones de reproducción fueron movidos a rutas locales de deprecación no incluidas en el repositorio.
- Sin resultados de benchmarks agregados: cualquier comparación de rendimiento exige descargar los checkpoints y leer el campo `accuracy` individualmente.
- Riesgo de sobreajuste al dominio: los checkpoints están entrenados sobre conjuntos fine-grained concretos (`soylocal`) y médicos (IDRiD); su aplicación a distribuciones distintas sin revalidación puede degradar la precisión de forma significativa.
- Sesgos de datos no documentados: la composición de los datasets de entrenamiento no se detalla, por lo que no pueden evaluarse sesgos de adquisición, demográficos o de anotación.
- Riesgo de clasificación errónea en contexto clínico: cualquier uso en cribado médico debe considerarse experimental y requiere validación externa y supervisión profesional.
- Advertencia de seguridad en la carga: los checkpoints se cargan con `torch.load(weights_only=False)` y contienen un espacio de argumentos embebido; solo deben cargarse archivos de fuentes de confianza.
- Consumo de recursos: 198,5 GB de repositorio y 1.051 archivos hacen inviable una descarga completa en muchos entornos; conviene usar descarga selectiva.
- Idiomas y modalidades: al ser un modelo exclusivamente de visión, no admite entradas de texto, audio o vídeo, ni tareas generativas.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/ERISLab/FGIR-ViT
- Librería de carga `fgir_zoo`: https://github.com/arkel23/fgir_zoo
- Autor en HuggingFace: https://huggingface.co/ERISLab
- Papers de ILA/SAW, AAA, PETL médico y benchmark FGIR: no disponibles en la información proporcionada (la model card los menciona pero no enlaza ninguno)
- Demos o espacios asociados: no disponible
- Los resultados de búsqueda web disponibles no contienen enlaces relevantes para este modelo.
