# dronefreak/co-dino-5scale-r50-1x-coco

## Resumen

Co-DINO con backbone ResNet-50 es un modelo de detección de objetos desarrollado por el equipo de SenseTime X-Lab (Zhuofan Zong, Guanglu Song y Yu Liu) y publicado originalmente bajo el marco de Co-DETR. Este repositorio concreto es un espejo no oficial del checkpoint de referencia, mantenido por el usuario `dronefreak`, que hospeda los pesos tal cual fueron distribuidos por los autores a través de Google Drive.

El modelo resuelve el problema de detección de objetos en imágenes y vídeo, con una arquitectura basada en DINO (DETR with Improved deNoising anchOr boxes) que incorpora el esquema de entrenamiento colaborativo híbrido propuesto en Co-DETR. Este esquema añade cabezas auxiliares con asignación uno-a-muchos (ATSS y RoI head estilo Faster R-CNN) durante el entrenamiento, lo que mejora la discriminación de las características del encoder y acelera la convergencia, aunque las cabezas auxiliares se desactivan en inferencia.

El checkpoint está entrenado en el dataset COCO con un calendario de 12 épocas (1x). Según la model card, el modelo tiene aproximadamente 48,9 millones de parámetros en inferencia y alcanza un box AP de 52,1 en la partición val2017 de COCO. Es un modelo de visión pura, por lo que no dispone de capacidades de lenguaje ni de contexto textual.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Co-DINO (DINO con esquema de entrenamiento Co-DETR) |
| Parametros totales | 48,9 M (según la model card, parámetros en inferencia) |
| Parametros activos | No disponible (no es un modelo Mixture-of-Experts) |
| Longitud de contexto | No disponible (modelo de visión, no procesa texto) |
| Tipos de cuantizacion | No disponible (el peso se distribuye en formato .pth) |
| Idiomas soportados | No disponible (modelo de visión; la model card indica lenguaje en) |
| Licencia | unknown (pesos con licencia indeterminada) |
| Formato de pesos | .pth (PyTorch, requiere MMDetection 2.x) |

## Arquitectura y entrenamiento

Co-DETR no es una arquitectura nueva, sino un esquema de entrenamiento que se aplica sobre un detector DETR. En este caso, la base es DINO, que a su vez es una evolución de DETR con mejoras en el desnoising de anclas y la atención deformable. El esquema colaborativo añade dos cabezas auxiliares durante el entrenamiento: una cabeza ATSS que utiliza asignación uno-a-muchos y una cabeza RoI estilo Faster R-CNN. Las propuestas positivas generadas por estas cabezas se inyectan en el decoder de DETR como consultas adicionales.

Esta estrategia, denominada *collaborative hybrid assignments training*, está diseñada para que el encoder aprenda características más discriminativas y para acelerar la convergencia del decoder. La config de este checkpoint establece `eval_module='detr'`, de modo que en inferencia solo se ejecuta la cabeza de consultas de Co-DINO; las cabezas auxiliares (RPN, RoI y ATSS) no aportan cómputo adicional.

El entrenamiento se realizó sobre el dataset COCO (concretamente `detection-datasets/coco` según la model card), con un calendario 1x que corresponde a 12 épocas. No se ha publicado información sobre RLHF, DPO ni otros ajustes por preferencia, ya que se trata de un modelo puramente perceptivo.

## Capacidades

- Detección de objetos en imágenes, capaz de localizar y clasificar objetos en las 80 categorías del dataset COCO.
- Inferencia sobre imágenes individuales, carpetas de imágenes, vídeos o webcams a través del script `tools/inference.py` incluido en el repositorio de Co-DETR.
- Generación de salidas en formato JSON mediante el parámetro `--save-json`, lo que facilita su integración en pipelines de anotación o postprocesado.
- No dispone de soporte para función de llamadas (tool calling), agentes, razonamiento multi-paso ni generación de texto, al ser un modelo de detección.
- Las capacidades multilingües no aplican: el modelo no procesa lenguaje natural.
- La arquitectura permite el uso de múltiples escalas (5 escalas), lo que mejora la detección de objetos pequeños en comparación con diseños de una sola escala.

## Casos de uso

- Sistemas de asistencia a la conducción: el modelo puede utilizarse en vídeo procedente de cámaras ubicadas en parabrisas o salpicadero, como en las escenas de prueba mostradas en los ejemplos del repositorio, para detectar vehículos, peatones y otros objetos de la carretera.
- Vigilancia y seguridad perimetral: la detección en tiempo real de personas, vehículos y objetos en cámaras fijas permite alimentar sistemas de alerta o de grabación selectiva.
- Robótica de interiores: un robot de servicio o de almacén puede emplear este detector para localizar objetos, estanterías o personas en entornos controlados y planificar sus desplazamientos.
- Anotación semiautomática de datasets: gracias a la salida JSON con las detecciones, el modelo puede preanotar imágenes nuevas para acelerar el etiquetado manual en proyectos de visión por computador.
- Inspección visual en logística: detección de cajas, palets y otros ítems en vídeos de almacenes o cintas transportadoras para inventarios y control de calidad.
- Investigación en detección de objetos: al tratarse de un checkpoint de referencia de la familia Co-DINO, puede usarse como baseline en estudios comparativos, por ejemplo para validar técnicas de cuantización, podado o destilación.
- Análisis de vídeo en eventos deportivos o urbanos: el modelo puede detectar personas, vehículos o elementos específicos en secuencias de vídeo para generar estadísticas o eventos de interés, siempre que las categorías estén cubiertas por COCO.

## Benchmarks y rendimiento

Según el `model-index` incluido en la model card, el resultado reportado es el siguiente:

| Benchmark | Resultado |
|---|---|
| COCO 2017 val (box AP) | 52,1 |

Cabe señalar que la propia model card marca este resultado como no verificado (`verified: false`). No se han publicado en la información disponible otros benchmarks como MMLU, HumanEval o GSM8K, al tratarse de un modelo de detección de objetos y no de lenguaje.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El repositorio no publica cifras de consumo de memoria.
- GPU recomendadas: no disponible. No se incluye una lista de GPUs validadas en la model card o en la información de la búsqueda.
- Compatibilidad con GPU de consumo: no se puede confirmar, aunque al tratarse de un modelo con 48,9 millones de parámetros y backbone ResNet-50, es previsible que se pueda ejecutar en tarjetas de gama media, pero no hay datos oficiales.
- El modelo no es compatible con vLLM, llama.cpp, Ollama ni TGI de forma nativa, ya que requiere el ecosistema de OpenMMLab.
- Despliegue recomendado: MMDetection 2.25.3, MMCV-full 1.5.0 y PyTorch 1.11. El fork mantenido por `dronefreak` incluye un script `tools/setup_codetr_env.sh` que prepara un entorno conda llamado `codetr`.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de datos numéricos fiables para una comparativa directa con otros checkpoints de la misma categoría. A través de la búsqueda web se menciona que la variante Co-DINO de mayor rendimiento alcanza 66,0 AP en COCO test-dev, pero esa cifra corresponde a un modelo con backbone ViT-L y no a este checkpoint ResNet-50. Por tanto, no es posible establecer una tabla comparativa rigurosa con 2 o 3 alternativas de la familia sin inventar valores.

## Limitaciones y advertencias

- La licencia de los pesos está marcada como `unknown` y la model card advierte que la licencia es indeterminada. Esto puede suponer un riesgo para su uso comercial sin una revisión legal previa.
- No es un lanzamiento oficial. El repositorio es un espejo mantenido por un tercero y la model card indica que el mirror puede transferirse o retirarse a petición de los autores originales.
- El checkpoint requiere un entorno específico (MMDetection 2.25.3, MMCV-full 1.5.0, PyTorch 1.11) y no puede ejecutarse con la API estándar de `transformers`.
- El box AP declarado de 52,1 no está verificado de forma independiente.
- El modelo está limitado a las 80 categorías de COCO y no generaliza bien a dominios con categorías fuera de ese dataset.
- No ofrece capacidades de razonamiento, generación de texto ni llamadas a herramientas; es exclusivamente un detector de objetos.
- Como ocurre con la mayoría de modelos de detección, existe riesgo de falsos positivos o falsos negativos, especialmente en escenas con oclusiones, poca luz u objetos pequeños.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que indica una escasa validación por parte de la comunidad.

## Enlaces

- HuggingFace: https://huggingface.co/dronefreak/co-dino-5scale-r50-1x-coco
- Paper original: https://arxiv.org/abs/2211.12860
- Repositorio oficial Co-DETR: https://github.com/Sense-X/Co-DETR
- Fork mantenido con entorno listo: https://github.com/dronefreak/Co-DETR
- MMDetection 2.x: https://github.com/open-mmlab/mmdetection/tree/2.x
- DeepWiki sobre Co-DINO: https://deepwiki.com/Sense-X/Co-DETR/3.2-co-dino-models
- Otro repositorio con el mismo peso: https://huggingface.co/maverickrzw/co-detr-pth/blob/main/co_dino_5scale_r50_1x_coco.pth
