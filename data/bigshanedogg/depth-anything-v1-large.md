# bigshanedogg/Depth-Anything-V1-Large

## Resumen

Depth-Anything-V1-Large es un modelo de estimación de profundidad monocular basado en la arquitectura DPT con un backbone DINOv2 ViT-L/14. El modelo original fue desarrollado por Lihe Yang, Bingyi Kang, Zilong Huang, Xiaogang Xu, Jiashi Feng y Hengshuang Zhao (publicado en CVPR 2024, arXiv 2401.10891) y esta ficha corresponde a un port no oficial a `transformers` publicado por el usuario `bigshanedogg`. El port ejecuta el codigo original de Depth Anything v1 vendorizado, cargandose mediante `trust_remote_code=True`, y conserva los tensores del `pytorch_model.bin` original bajo sus nombres nativos.

El modelo resuelve la estimacion de profundidad relativa inversa a partir de una unica imagen RGB, devolviendo un mapa denso de profundidad (`predicted_depth`) que puede reescalarse al tamano original mediante `post_process_depth_estimation`. Su relevancia practica radica en que permite reconstruir estructura 3D aproximada desde una sola camara, sin necesidad de sensores de profundidad dedicados, con una ventana de inferencia razonable en GPU y un peso total de 335 millones de parametros.

El interes de esta version concreta es la integracion nativa con el ecosistema `transformers` (`AutoModelForDepthEstimation`, `AutoProcessor`) manteniendo fidelidad bit a bit con la implementacion oficial, verificado por el autor del port en V100 con fp32 y fp16 autocast. Es un modelo de vision puro, sin capacidades de generacion de texto ni tool calling.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DPT sobre backbone DINOv2 ViT-L/14 (transformer de vision) |
| Parametros totales | 335.315.649 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de vision, no procesa secuencias de texto) |
| Tipos de cuantizacion | no disponible (pesos en safetensors; el autor no documenta cuantizaciones GGUF/AWQ/GPTQ) |
| Idiomas soportados | no disponible (modelo de vision, sin procesamiento de lenguaje) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (repo de 1,3 GB) |
| Pipeline | depth-estimation |
| Modelo base | LiheYoung/depth_anything_vitl14 |
| Requiere trust_remote_code | si |
| Dependencias extra | opencv-python, torchvision, huggingface_hub |

## Arquitectura y entrenamiento

La arquitectura combina dos componentes: un backbone DINOv2 ViT-L/14 (copia local torchhub de `facebookresearch/dinov2`, cargada con `source="local"`) que extrae caracteristicas visuales, y una cabeza DPT (`depth_head`) que fusiona las cuatro representaciones intermedias del ViT y produce un mapa de profundidad denso. La clase `DepthAnythingV1ForDepthEstimation` replica los submodulos oficiales (`pretrained` y `depth_head`) y ejecuta el `DPT_DINOv2.forward` original, devolviendo una `DepthEstimatorOutput` con `predicted_depth` como profundidad relativa inversa. El codigo fue vendorizado desde `LiheYoung/Depth-Anything` en el commit `1d033367` a los ficheros `dav1_dinov2.py` y `dav1_dpt.py`, con cambios limitados a imports y al renombrado `Block` → `NestedTensorBlock`.

El preprocesamiento se implementa en `DepthAnythingV1Processor` / `DepthAnythingV1ImageProcessor`, que reproduce la transformacion del `run.py` oficial. El postprocesado (`post_process_depth_estimation`) redimensiona con interpolacion bilineal y `align_corners=False`, igual que el codigo original, y no con el bicubico por defecto de `transformers`. El autor del port declara verificacion bit a bit frente al codigo oficial (mismo proceso, V100, tres imagenes incluyendo no cuadradas) en preprocesado, `predicted_depth` en fp32 y bajo autocast fp16, hidden states y postprocesado al tamano original.

No se dispone en la informacion proporcionada de detalles sobre el dataset de entrenamiento (numero de tokens, composicion, uso de RLHF/DPO), ya que el autor del port no los reproduce y esta ficha no incorpora la model card del modelo original. El entrenamiento original de Depth Anything v1 se describe en el paper CVPR 2024 (arXiv 2401.10891), pero sus cifras concretas no se incluyen en la informacion disponible.

## Capacidades

- Estimacion de profundidad monocular densa a partir de una unica imagen RGB, devolviendo `predicted_depth` como profundidad relativa inversa con resolucion `(1, H', W')`.
- Postprocesado al tamano original de la imagen mediante `post_process_depth_estimation`, replicando la interpolacion bilineal del `run.py` oficial.
- Exposicion de los cuatro hidden states de DINOv2 que consume la cabeza DPT mediante `output_hidden_states=True`.
- Compatibilidad con `AutoModelForDepthEstimation` y `AutoProcessor` de `transformers`, incluyendo carga de la misma clase via `AutoModel`.
- Ejecucion en fp32 y bajo autocast fp16 con resultados identicos al codigo oficial segun el autor del port.
- Soporte de imagenes no cuadradas (verificado por el autor en tres imagenes, incluyendo no cuadradas).
- No soporta generacion de texto, razonamiento, codigo, matematicas, tool calling, agentes, vision-lenguaje, audio ni modo thinking. Es exclusivamente un modelo de vision para profundidad.

## Casos de uso

- Reconstruccion 3D aproximada desde una sola camara: el modelo genera un mapa de profundidad denso que puede proyectarse a nube de puntos o malla, util para fotogrametria ligera, escaneo de interiores o digitalizacion de objetos sin sensor de profundidad.
- Robotica movil y navegacion: integrado en un pipeline de percepcion, proporciona profundidad relativa por fotograma para evitar obstaculos y estimar distancias relativas cuando no se dispone de LiDAR o camara estereo.
- Realidad aumentada y efectos de desenfoque: el mapa de profundidad permite segmentar primer plano y fondo para aplicar bokeh sintetico, oclusiones o insercion de objetos virtuales con orden de profundidad correcto.
- Generacion de mapas de disparidad para estereoscopia: a partir de una imagen, se obtiene una profundidad que puede usarse como inicializacion o referencia para algoritmos de vision estereo o para sintetizar vistas novedosas.
- Preprocesado para modelos generativos de imagen: la profundidad relativa sirve como condicionamiento en pipelines de difusion (ControlNet y similares) para mantener la estructura geometrica de la escena.
- Automocion y ADAS de bajo coste: estimacion de profundidad monocular para deteccion de distancia relativa a peatones y vehiculos en sistemas de asistencia que no incorporan sensores dedicados.
- Analisis de imagenes medicas o industriales: extraccion de estructura de superficie en imagenes 2D para inspeccion visual, siempre con validacion humana y sin uso clinico directo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del port no incluye tablas de MMLU, HumanEval, GSM8K ni metricas de profundidad (AbsRel, RMSE, delta) frente a otros modelos; solo declara verificacion de equivalencia bit a bit con el codigo oficial en V100.

## Requisitos de hardware

- VRAM estimada para inferencia: en fp32, los 335 millones de parametros ocupan aproximadamente 1,3 GB de pesos; con activaciones y preprocesado se recomienda al menos 3-4 GB de VRAM. Bajo autocast fp16, el peso se reduce a unos 0,7 GB y el consumo total puede bajar a 2-3 GB.
- GPU recomendadas: V100 (verificada por el autor), A100, H100 para lotes grandes o alta resolucion; RTX 4090, RTX 3090, RTX A5000 y similares para uso individual.
- Cabe en GPU de consumo: si, en GPUs con 4 GB o mas de VRAM (RTX 3050, RTX 4060, RTX 3060, etc.), especialmente en fp16.
- Opciones de despliegue: `transformers` con `trust_remote_code=True` (unica via documentada por el autor); no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que estan orientadas a modelos de lenguaje y no aplican a este modelo de vision.
- Latencia y throughput estimados: no disponibles. El autor solo reporta verificacion en V100 sin cifras de latencia.

## Comparativa con modelos similares

| Modelo | Parametros | Arquitectura | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Depth-Anything-V1-Large (este port) | 335.315.649 | DPT + DINOv2 ViT-L/14 | no aplica | Apache-2.0 | HuggingFace, requiere trust_remote_code |
| LiheYoung/depth_anything_vitl14 (original) | no disponible en la informacion | DPT + DINOv2 ViT-L/14 | no aplica | Apache-2.0 (segun repo original) | HuggingFace, pesos pytorch_model.bin |
| LiheYoung/depth-anything-large-hf | no disponible en la informacion | DPT + DINOv2 ViT-L/14 | no aplica | Apache-2.0 | HuggingFace, conversion oficial a transformers |

No se dispone en la informacion proporcionada de datos de rendimiento comparativo (AbsRel, RMSE, delta) entre estas variantes ni frente a alternativas como MiDaS o ZoeDepth, por lo que la comparativa se limita a parametros, licencia y disponibilidad.

## Limitaciones y advertencias

- Modelo no oficial: es un port de terceros (`bigshanedogg`), no una publicacion de los autores originales de Depth Anything. La fidelidad bit a bit esta declarada por el autor del port, pero no verificada de forma independiente en esta ficha.
- Requiere `trust_remote_code=True`, lo que implica ejecutar codigo Python del repositorio; conviene auditar `dav1_dinov2.py`, `dav1_dpt.py` y `processing_depth_anything_v1.py` antes de usarlo en produccion.
- Profundidad relativa inversa, no metrica: el modelo no devuelve distancias absolutas en metros sin calibracion adicional; para aplicaciones que requieran escala metrica es necesario un paso de calibracion o un modelo metrico.
- Sin capacidades de lenguaje: no procesa texto, no responde preguntas, no soporta tool calling ni agentes; cualquier uso conversacional es inaplicable.
- Riesgo de error en escenas con superficies reflectantes, transparentes, texturas repetitivas, iluminacion extrema o dominadas por cielo, donde la profundidad monocular es intrinsecamente ambigua.
- Licencia Apache-2.0 permite uso comercial, pero el repo de pesos original `LiheYoung/depth_anything_vitl14` no declara licencia propia; el autor del port justifica Apache-2.0 por la licencia del repositorio y de la conversion oficial. Conviene revisar el `NOTICE` y el `LICENSE` incluidos antes de un despliegue comercial.
- Sin datos de benchmarks publicados en la informacion disponible; no se puede comparar su precision con alternativas sin consultar el paper original.
- Sesgos conocidos: no documentados en la informacion proporcionada; al ser un modelo de vision entrenado con datos no especificados, puede heredar sesgos de dominio y geograficos del dataset original.
- Fecha de creacion del repo (2026-10-27) y bajo numero de descargas (15) y likes (0): indica poca validacion comunitaria; usar con cautela en produccion.

## Enlaces

- HuggingFace (este port): https://huggingface.co/bigshanedogg/Depth-Anything-V1-Large
- Modelo base: https://huggingface.co/LiheYoung/depth_anything_vitl14
- Conversion oficial a transformers: https://huggingface.co/LiheYoung/depth-anything-large-hf
- Repositorio original: https://github.com/LiheYoung/Depth-Anything
- Paper (arXiv): https://arxiv.org/abs/2401.10891
- DINOv2 (Meta): https://github.com/facebookresearch/dinov2
