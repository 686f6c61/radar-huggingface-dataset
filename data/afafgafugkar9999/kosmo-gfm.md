# afafgafugkar9999/Kosmo-GFM

## Resumen

Kosmo-GFM es un modelo fundacional de geometría (Geometry Foundation Model) desarrollado por Kosmo Research, orientado a tareas de visión por computador 3D: reconstrucción multi-vista, estimación de pose de cámara, predicción de profundidad, seguimiento de puntos, scene flow y matching de imágenes. El modelo parte de un backbone ViT-g compartido y añade cabezas decodificadoras específicas por tarea, lo que permite cubrir reconstrucción estática, movimiento dinámico 4D y correspondencias entre vistas con una única arquitectura base.

La familia incluye cuatro configuraciones de inferencia: GFM (1,66B parámetros; profundidad, cámaras y nubes de puntos), Camera Condition GFM (1,77B; acepta extrínsecos e intrínsecos de cámara como entrada), GFM 4D (1,65B; geometría y movimiento entre fotogramas) y GFM + MVLoMA (1,73B; añade una cabeza de matching de 75,9M parámetros). Todos los checkpoints se distribuyen en formato PyTorch `.pth` y requieren GPU CUDA para su ejecución.

El modelo resulta relevante porque unifica en un solo backbone tareas que tradicionalmente se resolvían con pipelines separados (SfM, MVS, optical flow, feature matching), y lo publica bajo licencia Apache 2.0 con código de inferencia standalone. Está pensado para flujos de producción de reconstrucción 3D a partir de imágenes o vídeo, aunque el repositorio solo incluye inferencia independiente y no los pipelines completos de PoseEngine y Gaussian Splatting descritos en el informe técnico.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer ViT-g (backbone compartido multi-vista con decodificadores específicos por tarea) |
| Parametros totales | 1,66B (GFM); 1,77B (Camera Condition GFM); 1,65B (GFM 4D); 1,73B (GFM + MVLoMA) |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible (modelo de visión; no se especifica número de vistas ni fotogramas máximo) |
| Tipos de cuantizacion | no disponible (checkpoints PyTorch en precisión original; no se documentan variantes cuantizadas) |
| Idiomas soportados | en (inglés, según metadatos; el modelo es de visión, no de texto) |
| Licencia | Apache 2.0 |
| Formato de pesos | PyTorch `.pth` (checkpoints: `gfm_3d.pth`, `gfm_3d_camera_cond.pth`, `gfm_4d.pth`, `mvloma.pth`) |

## Arquitectura y entrenamiento

Kosmo-GFM se construye sobre un backbone ViT-g compartido que procesa múltiples vistas de una escena y alimenta decodificadores especializados. La configuración base (GFM) predice profundidad, parámetros de cámara y nubes de puntos. La variante Camera Condition GFM incorpora extrínsecos e intrínsecos de cámara como condicionamiento, lo que permite reconstruir con poses conocidas. GFM 4D añade predicción de movimiento entre fotogramas (puntos dinámicos y scene flow), y GFM + MVLoMA acopla una cabeza de matching de 75,9M parámetros sobre el mismo encoder para correspondencias entre imágenes.

El informe técnico describe además pipelines de PoseEngine y Gaussian Splatting que no se incluyen en el repositorio de código, que solo ofrece inferencia standalone de las cuatro configuraciones. No se han publicado en la información disponible detalles sobre el volumen de tokens de entrenamiento, la composición del dataset ni si se aplicaron etapas de RLHF o DPO; al tratarse de un modelo de visión, estos datos corresponderían a objetivos geométricos (profundidad, pose, correspondencias) más que a preferencias humanas.

## Capacidades

- Predicción de profundidad densa a partir de imágenes o fotogramas de vídeo.
- Estimación de pose de cámara (extrínsecos e intrínsecos) sin poses de entrada en la configuración GFM.
- Reconstrucción con poses conocidas mediante Camera Condition GFM (entrada de extrínsecos `[N,4,4]` o `[N,3,4]` en convención OpenCV world-to-camera, e intrínsecos `[N,3,3]`).
- Generación de nubes de puntos y exportación a NPZ, con soporte opcional de PLY y GLB.
- Predicción de movimiento dinámico y scene flow entre fotogramas con GFM 4D (puntos dinámicos 4D).
- Matching de imágenes y correspondencias entre vistas mediante la cabeza MVLoMA.
- Seguimiento de puntos (point tracking) y estimación de flujo de escena, según las etiquetas del modelo.
- Soporte de reconstrucción multi-vista estática y de escenas dinámicas.
- No se documentan capacidades de tool calling, agentes, texto, audio ni modo de razonamiento explícito.

## Casos de uso

- Reconstrucción 3D de interiores a partir de fotos: usar GFM para obtener profundidad, cámaras y nube de puntos de un conjunto de imágenes de una habitación y exportar la geometría a PLY/GLB para visores o motores 3D.
- Digitalización de objetos para e-commerce: capturar varias vistas de un producto, ejecutar Camera Condition GFM con poses aproximadas y generar una malla o nube de puntos exportable a GLB para catálogos interactivos.
- Análisis de movimiento en vídeo: emplear GFM 4D sobre fotogramas de una secuencia para extraer trayectorias de puntos dinámicos y scene flow, útil en análisis deportivo o vigilancia.
- Registro y alineación de imágenes: usar GFM + MVLoMA para obtener correspondencias entre pares de imágenes y alimentar pipelines de stitching panorámico o de relocalización visual.
- Preprocesado para Gaussian Splatting: generar cámaras y nubes de puntos iniciales con GFM como entrada a pipelines de reconstrucción neuronal, aunque el pipeline completo de Gaussian Splatting no se incluye en el repositorio.
- Automatización de fotogrametría en drones: procesar secuencias aéreas con GFM para estimar poses y profundidad y alimentar un pipeline SfM/MVS propio con menor dependencia de soluciones comerciales.
- Investigación en visión 3D: usar los checkpoints como baseline reproducible para evaluar nuevas cabezas de matching o de flujo sobre un backbone ViT-g común.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- GPU CUDA obligatoria: el repositorio requiere Python 3.10+ y una GPU CUDA con PyTorch/torchvision compatibles; no se documenta ejecución en CPU.
- VRAM estimada: no disponible de forma explícita. Con ~1,7B parámetros en precisión original, el peso de los checkpoints ronda los 6-7 GB por configuración, por lo que se necesita holgura de VRAM adicional para activaciones y decodificación de consultas (GFM 4D expone `--chunk-size` para controlar la memoria de decodificación).
- GPU recomendadas: no disponible en la documentación; por tamaño de modelo, encajan GPU de datacenter tipo A100/H100 y, en el extremo consumer, tarjetas con 16-24 GB de VRAM (RTX 4090, RTX 3090) siempre que la memoria de activaciones lo permita.
- Despliegue: scripts de inferencia propios del repositorio (`tools/infer_3d.py`, `tools/infer_3d_camera_cond.py`, `tools/infer_4d.py`, `tools/infer_3d_with_mvloma.py`); no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI (no aplican a un modelo de visión de este tipo).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone en la información proporcionada de datos de rendimiento ni de especificaciones de modelos comparables (por ejemplo, otros modelos fundacionales de geometría) que permitan una comparación rigurosa. La siguiente tabla recoge únicamente lo que sí está documentado sobre las variantes internas de la familia:

| Modelo | Parametros | Profundidad | Pose de camara | Cond. de camara | Movimiento 4D | Matching | Licencia |
|---|---|---|---|---|---|---|---|
| GFM | 1,66B | Si | Si | No | No | No | Apache 2.0 |
| Camera Condition GFM | 1,77B | Si | Si | Si | No | No | Apache 2.0 |
| GFM 4D | 1,65B | Si | Si | No | Si | No | Apache 2.0 |
| GFM + MVLoMA | 1,73B | Si | Si | No | No | Si | Apache 2.0 |

Comparativa con modelos externos: no disponible.

## Limitaciones y advertencias

- El repositorio solo incluye inferencia standalone; los pipelines completos de PoseEngine y Gaussian Splatting descritos en el informe técnico no están disponibles.
- `config.json` es un manifiesto de checkpoints para los scripts de GFM, no una configuración de `AutoModel` de Transformers; no se puede cargar con la API estándar de Transformers.
- La variante Camera Condition GFM publicada corresponde únicamente a la versión "Camera-pose scale"; no se documentan otras escalas.
- GFM + MVLoMA requiere descargar y cargar dos checkpoints (`gfm_3d.pth` y `mvloma.pth`); un uso incorrecto del manifiesto puede provocar descargas incompletas.
- Las cámaras de entrada deben seguir la convención OpenCV world-to-camera y el orden de imágenes ordenado por nombre de fichero, salvo que se proporcione `image_names`; un formato incorrecto produce resultados inválidos.
- GFM 4D exporta resultados a escala relativa de escena, no a escala métrica absoluta.
- No se documentan sesgos, tasas de alucinación geométrica ni límites de número de vistas o fotogramas; estos extremos deben validarse empíricamente antes de producción.
- El modelo está etiquetado solo para inglés en los metadatos, aunque al ser un modelo de visión el idioma afecta principalmente a la documentación y a posibles entradas textuales, no a la inferencia geométrica.
- Licencia Apache 2.0: permite uso comercial, pero conviene revisar las licencias de las dependencias opcionales de exportación PLY/GLB (`requirements-optional.txt`).
- Repositorio con 0 descargas y 0 likes en el momento de la consulta; no hay evidencia de validación por parte de la comunidad.

## Enlaces

- Hugging Face: https://huggingface.co/afafgafugkar9999/Kosmo-GFM
- Checkpoints del autor original: https://huggingface.co/KosmoResearch/Kosmo-GFM/tree/main
- Informe técnico (arXiv): https://arxiv.org/abs/2611.16840
- Página del proyecto: https://kosmoresearch.github.io/Kosmo-GFM/
- Código: https://github.com/KosmoResearch/Kosmo-GFM
- Guía de descarga de Hugging Face: https://huggingface.co/docs/huggingface_hub/en/guides/download
