# changh95/bevformer-small-weights

## Resumen

BEVFormer-small-weights es un espejo (mirror) en Hugging Face del checkpoint oficial `bevformer_small_epoch_24.pth` del modelo BEVFormer, publicado por el autor del repositorio (changh95). No es un modelo nuevo ni un reentrenamiento: es una conversión a formato safetensors del `state_dict` original, con los tensores bit a bit idénticos al checkpoint de los autores de BEVFormer. El propósito declarado es ofrecer una fuente fija y descargable en Hugging Face para el port a Tenstorrent Blackhole p150 del nodo `autoware_tensorrt_bevformer` de Autoware, ya que el ONNX `bevformer_small.onnx` original ha dejado de estar disponible para descarga.

BEVFormer es un detector de objetos 3D multi-cámara que aprende una representación unificada en vista de pájaro (bird's-eye view, BEV) mediante transformers espaciotemporales. La variante small usa un backbone ResNet-101 (estilo caffe, BN congelado) con DCNv2 en las etapas 3 y 4, FPN sobre C5, una rejilla BEV de 150×150 que cubre ±51,2 m, 3 capas de encoder (self-attention temporal y cross-attention espacial) y 6 capas de decoder con 900 queries sobre las 10 clases de nuScenes. Fue entrenado durante 24 épocas sobre nuScenes v1.0-trainval.

Su relevancia es de tipo práctico y de reproducibilidad: sirve como punto de entrada estable para desplegar BEVFormer-small en stacks de conducción autónoma (Autoware), para exportar a ONNX/TensorRT y para portarlo a aceleradores alternativos. El repositorio solo contiene los pesos (0,2 GB), no código de inferencia ni configuración de entrenamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | BEVFormer (transformer espaciotemporal) sobre backbone ResNet-101 con DCNv2 en etapas 3-4 y FPN sobre C5; 3 capas de encoder y 6 capas de decoder |
| Parametros totales | 59.568.963 elementos en 897 tensores float32 (parámetros y buffers); 104 contadores `num_batches_tracked` int64 adicionales que no son parámetros |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible; no es un modelo de lenguaje. La configuración espacial es una rejilla BEV de 150×150 que cubre ±51,2 m |
| Tipos de cuantizacion | no disponible en la model card; el ecosistema asociado usa exportación a ONNX y ejecución con TensorRT |
| Idiomas soportados | no aplica / no disponible (modelo de percepción visual, no de lenguaje) |
| Licencia | apache-2.0 (etiqueta del espejo, heredada del código de BEVFormer y de BEVFormer_tensorrt). Aviso: los pesos se entrenaron con nuScenes, bajo CC BY-NC-SA 4.0 |
| Formato de pesos | safetensors (`bevformer_small_epoch_24.safetensors`, 238.389.932 bytes); origen `.pth` de mmcv y export ONNX externo |
| Tamano del repositorio | 0,2 GB |
| Pipeline declarado | object-detection |
| Numero de tensores | 1.001 (897 float32 de parámetros y buffers, 104 int64 de `num_batches_tracked`) |
| sha256 del safetensors | `51ba31289d85df5b90da32126bea21f284b03f08521323f6765459f1663c95d7` |
| sha256 del checkpoint original | `4ebc5810201ca1e609c29452f07c08bc4d9c9ebfda5d7f8ee1034dd446274bc5` |

## Arquitectura y entrenamiento

BEVFormer combina un backbone convolucional con un transformer que opera sobre una representación BEV. El backbone es ResNet-101 en estilo caffe con batch normalization congelada e inserción de DCNv2 (deformable convolutions v2) en las etapas 3 y 4, seguido de una FPN sobre el nivel C5. Sobre esa rejilla BEV de 150×150 (que cubre ±51,2 m alrededor del vehículo) se aplican 3 capas de encoder con dos mecanismos: self-attention temporal, que agrega información de fotogramas anteriores, y cross-attention espacial, que proyecta características de las seis cámaras sobre las consultas BEV. El decoder consta de 6 capas y 900 queries, y produce predicciones para 10 clases de nuScenes.

El entrenamiento documentado es de 24 épocas sobre nuScenes v1.0-trainval. En la model card no se detallan el número total de tokens, la composición exacta del dataset más allá de nuScenes, ni si se aplicaron etapas de RLHF o DPO (no aplica a un detector). La innovación técnica destacable es precisamente la representación BEV unificada con fusión espaciotemporal mediante atención, que sustituye a pipelines de fusión geométrica ad hoc entre cámaras.

El espejo no incluye el estado del optimizador ni metadatos de entrenamiento: solo el `state_dict` con las claves originales de mmcv, lo que permite cargarlo con `torch.load(...)["state_dict"]` o con `safetensors.torch.load_file` de forma equivalente.

## Capacidades

- Detección de objetos 3D multi-cámara: recibe imágenes de seis cámaras y produce cajas 3D con clase y atributos sobre las 10 clases de nuScenes.
- Construcción de representación BEV: genera una rejilla de 150×150 celdas que cubre ±51,2 m, apta para planificación y predicción aguas abajo.
- Fusión temporal: la self-attention temporal del encoder permite incorporar información de fotogramas previos, no solo del instante actual.
- Detección geométrica precisa: el uso de DCNv2 en el backbone mejora la modelización de formas y desplazamientos en las etapas de mayor resolución semántica.
- Generación de texto: no soportada; el modelo no es un modelo de lenguaje.
- Tool calling / function calling: no soportado.
- Agentes y razonamiento multi-paso: no aplica.
- Capacidades multilingües: no aplica.
- Capacidades especiales: no incluye modo de razonamiento, visión generativa ni audio; su salida son detecciones 3D.

## Casos de uso

- Percepción en conducción autónoma urbana: el modelo genera detecciones 3D a partir de seis cámaras con una rejilla BEV de ±51,2 m, lo que lo hace adecuado como módulo de percepción en vehículos que operan en entornos tipo nuScenes (calles urbanas densas con peatones, vehículos y ciclistas).
- Despliegue dentro de Autoware: es el checkpoint de referencia del nodo `autoware_tensorrt_bevformer`, por lo que puede integrarse directamente en un stack Autoware mediante exportación a ONNX y ejecución con TensorRT.
- Port a aceleradores Tenstorrent: el repositorio existe específicamente para alimentar el bundle `changh95/bevformer-p150` en Blackhole p150, lo que permite usar estos pesos en flujos de compilación y validación sobre hardware no NVIDIA.
- Auto-etiquetado y pre-anotación offline: al ejecutarse sobre secuencias de cámara ya grabadas, puede generar cajas 3D preliminares para que anotadores humanos las revisen, reduciendo el coste de crear datasets propios con formato nuScenes.
- Reproducibilidad académica: investigadores que quieran replicar los resultados de BEVFormer-small o comparar variantes pueden descargar un artefacto con hash verificado en lugar de depender de un asset de release que puede desaparecer.
- Validación de pipelines de exportación: sirve como caso de prueba reproducible para verificar conversiones mmcv → safetensors → ONNX → TensorRT, comprobando que las claves y los tensores se preservan (1.001 tensores, claves sin cambios).
- Benchmarking de compiladores y runtimes: al ser un modelo de ~59,6 M de elementos con un decoder de 900 queries, es un candidato razonable para medir latencia y consumo de memoria en distintos backends de inferencia.
- Simulación y validación en bucle cerrado: las detecciones BEV pueden inyectarse en simuladores para probar módulos de planificación y control sin necesidad de sensorizar en pista.

## Benchmarks y rendimiento

Los únicos datos publicados en la información disponible son los del log de entrenamiento liberado, correspondientes a la validación de nuScenes en la época 24.

| Metrica | Valor | Conjunto de evaluacion |
|---|---|---|
| NDS | 0,4787 | nuScenes v1.0-trainval, validación, época 24 |
| mAP | 0,3700 | nuScenes v1.0-trainval, validación, época 24 |

No se han publicado en la información disponible resultados de benchmarks de tipo MMLU, HumanEval o GSM8K (no aplican a este modelo), ni comparaciones numéricas con otras variantes de BEVFormer o con detectores 3D alternativos.

## Requisitos de hardware

- Peso de los parametros: 238.389.932 bytes en float32 (unos 0,24 GB), equivalentes a aproximadamente 0,12 GB si se convierte a float16. Es un modelo pequeño en términos de peso.
- VRAM para inferencia: no disponible. La memoria total depende del tamaño de lote, la resolución de entrada de las seis cámaras y las activaciones del encoder/decoder, datos que no se documentan en la model card.
- GPU recomendadas: no se especifican en la información disponible. El ecosistema asociado (BEVFormer_tensorrt, autoware_tensorrt_bevformer) asume GPU NVIDIA con soporte TensorRT. Alternativa declarada: acelerador Tenstorrent Blackhole p150 mediante el bundle `changh95/bevformer-p150`.
- ¿Cabe en GPU de consumo? Los pesos por sí solos caben en cualquier GPU con 1 GB o más de memoria libre, pero no se dispone de datos publicados sobre el consumo total de memoria en inferencia, por lo que no puede confirmarse el encaje en tarjetas concretas.
- Opciones de despliegue: PyTorch/mmcv para carga directa del `state_dict`; exportación a ONNX con DerryHub/BEVFormer_tensorrt; ejecución con TensorRT a través del nodo de Autoware; compilación para Tenstorrent Blackhole p150. No se documenta soporte de llama.cpp, Ollama, vLLM ni TGI (herramientas orientadas a modelos de lenguaje).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

La información proporcionada no incluye especificaciones ni métricas de otros detectores 3D, por lo que no es posible construir una comparativa numérica verificable. Los modelos de la misma categoría (detección 3D multi-cámara con representación BEV) serían, entre otros, BEVFormer-base y BEVFormer-tiny del mismo repositorio, así como propuestas como PETR, DETR3D o BEVDet.

| Modelo | Parametros | Contexto / rejilla BEV | Rendimiento | Licencia | Datos disponibles |
|---|---|---|---|---|---|
| BEVFormer-small (este repositorio) | 59.568.963 elementos float32 | Rejilla 150×150, ±51,2 m | NDS 0,4787 / mAP 0,3700 en validación de nuScenes | apache-2.0 en el espejo; datos de entrenamiento nuScenes CC BY-NC-SA 4.0 | Sí |
| BEVFormer-base | no disponible | no disponible | no disponible | no disponible | No |
| BEVFormer-tiny | no disponible | no disponible | no disponible | no disponible | No |
| PETR / DETR3D / BEVDet | no disponible | no disponible | no disponible | no disponible | No |

## Limitaciones y advertencias

- Sesgos: no se documentan análisis de sesgos. El entrenamiento sobre nuScenes introduce el sesgo geográfico y de dominio del dataset (ciudades de Singapur y Boston, condiciones meteorológicas y de iluminación concretas), por lo que el rendimiento puede degradarse fuera de esa distribución.
- Alucinacion: no aplica en el sentido de generación de texto, pero sí existe el riesgo propio de un detector: falsos positivos en escenas ambiguas u oclusiones severas, sin mecanismo de abstención explícito.
- Limitaciones de contexto o idioma: la cobertura espacial está limitada a ±51,2 m alrededor del vehículo; no es un modelo de lenguaje y no procesa texto ni voz.
- Dominio de clases: solo las 10 clases de nuScenes. No detecta objetos fuera de ese conjunto sin reentrenamiento de la cabeza.
- Licencia de los pesos: el espejo se etiqueta como apache-2.0 porque esa es la licencia del código de BEVFormer y de BEVFormer_tensorrt. Los autores originales publicaron el checkpoint como asset de release sin una licencia de pesos separada, por lo que la situación legal de los pesos en sí no está explícitamente resuelta.
- Datos de entrenamiento: nuScenes está bajo CC BY-NC-SA 4.0, con términos no comerciales que pueden aplicar a los usos de los pesos derivados. El uso comercial de nuScenes requiere una licencia de Motional. La propia model card indica que esto no constituye asesoramiento legal.
- Contenido del repositorio: solo contiene el `state_dict`. No incluye código de inferencia, configuración de entrenamiento, estado del optimizador ni metadatos de entrenamiento, por lo que hay que obtener el código y la configuración por separado.
- Dependencias de terceros: el nodo de Autoware y el exportador de terceros (DerryHub/BEVFormer_tensorrt) condicionan el despliegue; su disponibilidad y compatibilidad pueden cambiar.
- Popularidad y soporte: el repositorio registra 0 descargas y 0 likes en el momento de la consulta y fue creado en 2026-10-07, por lo que no existe una comunidad de usuarios que valide su uso en producción.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/changh95/bevformer-small-weights
- Bundle para Tenstorrent: https://huggingface.co/changh95/bevformer-p150
- Checkpoint original (asset de release): https://github.com/zhiqi-li/storage/releases/download/v1.0/bevformer_small_epoch_24.pth
- Model zoo de BEVFormer: https://github.com/fundamentalvision/BEVFormer#model-zoo
- Codigo de BEVFormer: https://github.com/fundamentalvision/BEVFormer
- Licencia del codigo de BEVFormer: https://github.com/fundamentalvision/BEVFormer/blob/master/LICENSE
- Exportador a TensorRT: https://github.com/DerryHub/BEVFormer_tensorrt
- Nodo de Autoware: https://github.com/autowarefoundation/autoware_universe/tree/main/perception/autoware_tensorrt_bevformer
- Dataset nuScenes: https://www.nuscenes.org/
- Paper (arXiv:2203.17270): https://arxiv.org/abs/2203.17270
- Nota sobre la busqueda web: los resultados devueltos corresponden a portadas de BBC News y no guardan relación con este modelo, por lo que no aportan enlaces adicionales utilizables.
