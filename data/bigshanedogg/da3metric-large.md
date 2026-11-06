# bigshanedogg/DA3METRIC-LARGE

## Resumen

DA3METRIC-LARGE es la variante monocular métrica del modelo Depth Anything 3, desarrollado por ByteDance Seed. Este repositorio concreto (`bigshanedogg/DA3METRIC-LARGE`) es un port no oficial al formato nativo de `transformers` del checkpoint original `depth-anything/DA3METRIC-LARGE`. El autor del port ha reconstruido la red a partir del grafo de objetos del propio checkpoint y ha vendorizado el código oficial (`ByteDance-Seed/depth-anything-3` en el commit `3d835ec1`) en ficheros planos, de modo que el modelo se carga con `trust_remote_code=True` sin necesidad de instalar el paquete `depth_anything_3`.

El modelo resuelve estimación de profundidad monocular con escala métrica real (metros) y genera además una máscara de cielo. La arquitectura es un transformer de visión con 334.171.394 parámetros (aproximadamente 334 M), empaquetado en safetensors con un tamaño de repositorio de 1,3 GB. El pipeline declarado en Hugging Face es `image-to-3d`, aunque la tarea efectiva es `depth-estimation` sobre una o varias vistas.

Su relevancia radica en que permite usar el modelo dentro del ecosistema estándar de `transformers` (`AutoModelForDepthEstimation`, `AutoProcessor`) sin dependencias del paquete original, manteniendo una fidelidad bit a bit verificada frente a la implementación oficial (mismos procesos y semillas, V100, 4 imágenes, en fp32 y bajo autocast). La licencia es Apache-2.0, lo que facilita su uso comercial.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer de visión (Depth Anything 3, variante monocular métrica); clase `DepthAnything3ForDepthEstimation` |
| Parámetros totales | 334.171.394 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (modelo de visión; procesa N imágenes por lote) |
| Tipos de cuantización | no disponible (el repo publica safetensors en fp32; admite ejecución en bfloat16/float16 vía autocast) |
| Idiomas soportados | no disponible (modelo de visión, sin procesamiento de lenguaje) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (`model.safetensors`) |

## Arquitectura y entrenamiento

La red es la del checkpoint original `depth-anything/DA3METRIC-LARGE`, reconstruida desde su `config.json` (`da3_config`, idéntico a `configs/da3metric-large.yaml` del paquete oficial) siguiendo el mismo procedimiento que `depth_anything_3.cfg.create_object`. El `forward` ejecuta la red original y devuelve un `DepthAnything3Output` (`ModelOutput`), donde la salida `depth` se renombra a `predicted_depth` y el resto de claves conservan su nombre (`depth_conf`, `aux`, etc.). El procesador `DepthAnything3Processor` envuelve `DepthAnything3ImageProcessor`, que a su vez ejecuta el `InputProcessor` del paquete.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF/DPO, ya que la model card del port no los detalla. La única innovación técnica documentada en este repositorio es la verificación de equivalencia bit a bit con la implementación oficial: el autor comprobó que el preprocesado y todas las salidas del `forward` son idénticas (también como tupla) en fp32 y bajo el autocast de la API del paquete, usando V100 y 4 imágenes. Los pesos de `model.safetensors` son los del checkpoint original, re-guardados con `save_pretrained` y con cada tensor verificado como igual.

## Capacidades

- Estimación de profundidad monocular con escala métrica (valores en metros), no solo profundidad relativa.
- Generación de máscara de cielo como salida auxiliar del modelo.
- Procesamiento multi-vista: el procesador acepta una lista de imágenes y produce `pixel_values` con forma `(1, N, 3, H, W)`, y la salida `predicted_depth` tiene forma `(1, N, H, W)`.
- Extracción de características del backbone mediante `export_feat_layers=[i, ...]`, que devuelve las features en `outputs.aux`.
- Salida de confianza de profundidad (`depth_conf`) junto a la predicción.
- Compatibilidad con `AutoModel` y `return_dict=False` para obtener una tupla.
- Integración nativa con `transformers` vía `trust_remote_code=True`, sin necesidad del paquete `depth_anything_3`.
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades multilingües: es un modelo puramente visual.

## Casos de uso

- Reconstrucción 3D a partir de imágenes: al proporcionar profundidad métrica y máscara de cielo, se puede usar como entrada para pipelines de fotogrametría o generación de nubes de puntos con escala real.
- Robótica y navegación autónoma: la profundidad en metros permite calcular distancias absolutas a obstáculos sin calibración adicional, adecuado para planificación de trayectorias en interiores.
- Realidad aumentada: la escala métrica facilita la colocación de objetos virtuales con tamaño físico coherente sobre la escena capturada.
- Automoción y ADAS: estimación de distancia a peatones y vehículos en imágenes monoculares, útil en sistemas de asistencia que requieren medidas absolutas.
- Drones y cartografía: generación de mapas de profundidad métrica para levantamientos topográficos a partir de vuelos fotogramétricos.
- Edición y postproducción de vídeo: separación de cielo y escena mediante la máscara de cielo, y desenfoque de profundidad físicamente correcto.
- Extracción de features para tareas downstream: uso de `export_feat_layers` para alimentar modelos de segmentación o detección con representaciones del backbone de Depth Anything 3.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: con 334 M de parámetros, los pesos en fp32 ocupan aproximadamente 1,3 GB; en bfloat16/float16, unos 0,67 GB. A esto hay que sumar la memoria de activaciones, que crece con el número de vistas N y la resolución de procesado.
- GPU recomendadas: el autor verificó la equivalencia en una V100. Para producción, A100 o H100 son adecuadas; también funciona en GPUs consumer con suficiente VRAM.
- Cabe en GPUs consumer: sí, en cualquier GPU con al menos 4-6 GB de VRAM para una o pocas imágenes a resolución moderada, dado el tamaño reducido del modelo.
- Opciones de despliegue: `transformers` con `AutoModelForDepthEstimation` y `trust_remote_code=True`; el autor no documenta soporte para vLLM, llama.cpp, Ollama ni TGI (son herramientas orientadas a modelos de lenguaje, no aplicables directamente aquí).
- Dependencias de runtime adicionales: `addict`, `omegaconf`, `einops`, `opencv-python`, además de `torch` y `transformers`.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| DA3METRIC-LARGE (este port) | 334.171.394 | no disponible | Profundidad monocular métrica + máscara de cielo | Apache-2.0 | Hugging Face (`bigshanedogg/DA3METRIC-LARGE`) |
| depth-anything/DA3METRIC-LARGE (original) | no disponible en la información | no disponible | Profundidad monocular métrica + máscara de cielo | Apache-2.0 | Hugging Face (checkpoint original) |
| Otros modelos de profundidad de la familia Depth Anything 3 | no disponible | no disponible | Profundidad / multi-vista | no disponible | no disponible |

No se dispone de datos de benchmarks ni de especificaciones de modelos alternativos en la información proporcionada para establecer una comparación cuantitativa.

## Limitaciones y advertencias

- Es un port no oficial: aunque la equivalencia bit a bit está verificada frente al paquete original, no está respaldado por ByteDance Seed.
- Requiere `trust_remote_code=True`, lo que implica ejecutar código vendorizado por un tercero; conviene auditar los ficheros `da3_*.py` antes de usarlo en producción.
- Algunas salidas usan muestreo aleatorio (el manejo del cielo muestrea profundidades), por lo que es necesario fijar la semilla de `torch` para obtener resultados reproducibles.
- No es un modelo de lenguaje: no procesa texto, no soporta tool calling ni agentes, y no tiene capacidades multilingües.
- La profundidad se devuelve a la resolución procesada, no a la resolución original de la imagen; hay que reescalar si se necesita a tamaño completo.
- Riesgo de alucinación en regiones ambiguas o sin textura, inherente a los modelos de profundidad monocular; la salida `depth_conf` puede ayudar a filtrar zonas poco fiables.
- No se documentan sesgos específicos ni limitaciones de idioma en la información disponible.
- La licencia Apache-2.0 permite uso comercial, pero se debe mantener la atribución y citar el trabajo original según pide el autor.

## Enlaces

- Repositorio del port: https://huggingface.co/bigshanedogg/DA3METRIC-LARGE
- Checkpoint original: https://huggingface.co/depth-anything/DA3METRIC-LARGE
- Repositorio oficial de código: https://github.com/ByteDance-Seed/depth-anything-3
- Paper: *Depth Anything 3: Recovering the Visual Space from Any Views* — https://arxiv.org/abs/2511.10647
