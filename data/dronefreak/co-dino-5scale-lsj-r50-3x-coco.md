# dronefreak/co-dino-5scale-lsj-r50-3x-coco

## Resumen

Co-DINO 5scale LSJ R50 3x COCO es un checkpoint de deteccion de objetos basado en Co-DETR (Collaborative Hybrid Assignments Training), la propuesta de Zhuofan Zong, Guanglu Song y Yu Liu (SenseTime X-Lab) publicada en ICCV 2023. El modelo combina un backbone ResNet-50 con un decodificador DINO (DETR con consultas desnoising) y un esquema de entrenamiento que anade cabezas auxiliares one-to-many (ATSS y RoI estilo Faster R-CNN) para acelerar la convergencia del decodificador DETR. Este repositorio concreto es un espejo no oficial del checkpoint original, alojado por el usuario dronefreak para facilitar descargas reproducibles desde Hugging Face.

El checkpoint corresponde a la variante de 5 escalas de feature pyramid, con aumentacion de datos LSJ (large scale jittering) y un schedule de 36 epocas (3x) sobre COCO. El autor declara un box AP de 54,8 en COCO 2017 val2017. Los pesos de inferencia suman aproximadamente 48,9 M de parametros segun la model card, aunque el fichero safetensors del repositorio contiene 65.257.119 parametros (incluye pesos auxiliares de entrenamiento que no se usan en inferencia).

Es relevante porque los checkpoints no-ViT de Co-DETR solo se distribuian mediante una carpeta compartida de Google Drive sin versionado ni checksums, lo que dificultaba su uso en pipelines automatizados. Este espejo ofrece acceso estable via `huggingface_hub`, un fichero de configuracion incluido y un checksum explicito, manteniendo la atribucion a los autores originales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Co-DETR con decodificador DINO (transformer encoder-decoder) y backbone ResNet-50, 5 escalas de feature pyramid |
| Parametros totales | 65.257.119 en el fichero safetensors; aproximadamente 48,9 M en inferencia segun la model card |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no aplica (modelo de vision, no de lenguaje) |
| Tipos de cuantizacion | no disponible (no se documentan variantes cuantizadas) |
| Idiomas soportados | en (etiquetas de clase COCO en ingles) |
| Licencia | unknown (estado no determinado segun la model card) |
| Formato de pesos | safetensors en el repositorio; el checkpoint operativo es `.pth` de PyTorch para MMDetection 2.x |

## Arquitectura y entrenamiento

Co-DETR no introduce una arquitectura nueva, sino un esquema de entrenamiento colaborativo. Sobre un backbone ResNet-50 con FPN de 5 niveles se anaden cabezas auxiliares con asignacion de etiquetas one-to-many: una cabeza ATSS y una cabeza RoI tipo Faster R-CNN. Las propuestas positivas generadas por estas cabezas se inyectan como consultas adicionales en el decodificador DETR, que trabaja con matching hungaro one-to-one. Esto hace mas discriminativos los features del encoder y acelera la convergencia, un problema clasico de los DETR. Las cabezas auxiliares solo se usan durante el entrenamiento: la configuracion fija `eval_module='detr'`, de modo que en inferencia solo se ejecuta la cabeza de consultas Co-DINO.

El entrenamiento se realizo sobre COCO con schedule de 36 epocas (3x) y aumentacion LSJ (large scale jittering). No se dispone en la informacion proporcionada del numero exacto de tokens o imagenes vistas, la composicion detallada del dataset mas alla de COCO, ni si se aplicaron tecnicas de refinamiento posteriores. La innovacion tecnica destacable es el propio esquema de asignacion colaborativa y el uso de consultas desnoising propias de DINO en el decodificador.

## Capacidades

- Deteccion de objetos en imagenes con las 80 categorias de COCO.
- Deteccion en video y webcam mediante el script `tools/inference.py` del fork mantenido.
- Salida en formato JSON de detecciones (`--save-json`), apta para pipelines automatizados.
- Procesamiento por lotes de imagenes o carpetas completas.
- Deteccion multi-escala gracias a la piramide de 5 niveles, con mejor rendimiento en objetos de tamanos diversos.
- No soporta tool calling, agentes, razonamiento multi-paso ni generacion de texto: es exclusivamente un modelo de vision para deteccion.
- No dispone de modo thinking, vision-lenguaje, audio ni capacidades multimodales mas alla de la imagen de entrada.

## Casos de uso

- Videoanalisis en tiempo real: el modelo procesa fotogramas de camaras de trafico o vigilancia y devuelve cajas con clase y confianza; su backbone ResNet-50 permite inferencia en GPU consumer, lo que facilita despliegues en el borde.
- Anotacion asistida de datasets: generar preanotaciones sobre imagenes nuevas y revisarlas manualmente, reduciendo el coste de etiquetado en proyectos de vision personalizados.
- Conteo y monitorizacion de aforo: detectar personas y vehiculos en escenas urbanas para alimentar dashboards de ocupacion, aprovechando las 5 escalas para objetos pequenos y lejanos.
- Control de calidad industrial: detectar defectos o piezas en lineas de produccion con un modelo preentrenado en COCO como base, afinandolo despues con datos propios.
- Investigacion en deteccion: usar el checkpoint como baseline reproducible de Co-DETR con ResNet-50 para comparar variantes de asignacion de etiquetas o schedules de entrenamiento.
- Pipelines de moderacion de contenido visual: filtrar imagenes que contengan determinadas categorias de objetos antes de su publicacion, integrando el JSON de salida en un servicio de colas.
- Analisis de escenas para robotica movil: identificar obstaculos y objetos relevantes en la via de un robot o dron, con latencia compatible con bucles de control a baja frecuencia.

## Benchmarks y rendimiento

Resultados declarados por el autor del modelo en la model card (no verificados de forma independiente):

| Benchmark | Metrica | Valor |
|---|---|---|
| COCO 2017 val (val2017) | box AP | 54,8 |

No se han publicado en la informacion disponible resultados de otras metricas (AP50, AP75, AP small/medium/large) ni comparaciones directas con otros modelos.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; con aproximadamente 48,9 M de parametros en inferencia y backbone ResNet-50, la huella es moderada y cabe holgadamente en GPUs consumer de 8 GB o mas.
- GPU recomendadas: cualquier GPU NVIDIA con soporte CUDA para PyTorch 1.11; una RTX 3090 o RTX 4090 es suficiente para lotes grandes y video.
- Cabe en GPU consumer: si, incluidas tarjetas de gama media con 8 GB de VRAM.
- Opciones de despliegue: el stack requerido es MMDetection 2.25.3, MMCV-full 1.5.0 y PyTorch 1.11, gestionados por el script `tools/setup_codetr_env.sh` del fork `dronefreak/Co-DETR`. No es compatible con `transformers`, vLLM, llama.cpp ni Ollama.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto/entrada | COCO box AP | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Co-DINO 5scale LSJ R50 3x (este) | ~48,9 M en inferencia | Imagen, 5 escalas | 54,8 (declarado) | unknown | Hugging Face (espejo) y Google Drive original |
| Co-DETR ViT-L (variantes oficiales) | no disponible | Imagen | no disponible en esta ficha | no disponible | Hugging Face (publicado por los autores) |
| Co-DETR Swin (variantes oficiales) | no disponible | Imagen | no disponible en esta ficha | no disponible | Google Drive original |

No se dispone en la informacion proporcionada de datos suficientes para comparar con otras familias de detectores (DINO, Deformable DETR, YOLO) de forma rigurosa.

## Limitaciones y advertencias

- Es un espejo no oficial: todos los creditos del metodo, la arquitectura y los pesos pertenecen a los autores originales; el mantenedor del repositorio no ha contribuido al entrenamiento.
- La licencia figura como `unknown`; no hay autorizacion explicita documentada para uso comercial. Conviene contactar con los autores antes de desplegarlo en produccion.
- Solo detecta las 80 clases de COCO; cualquier categoria fuera de ese conjunto requerira fine-tuning con datos propios.
- Riesgo de falsos positivos y negativos en escenas con oclusiones, objetos muy pequenos o condiciones de iluminacion adversas, comun en detectores entrenados con COCO.
- No es un modelo de lenguaje: no admite instrucciones en lenguaje natural ni razonamiento; la salida es exclusivamente geometrica (cajas, clases y puntuaciones).
- Dependencia de un stack antiguo (MMDetection 2.x, PyTorch 1.11) que puede complicar la integracion con entornos modernos.
- El numero de parametros del safetensors (65,3 M) incluye pesos auxiliares de entrenamiento no usados en inferencia, lo que puede confundir estimaciones de memoria.
- El resultado de 54,8 box AP esta declarado por el autor y no ha sido verificado de forma independiente (`verified: false`).

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/dronefreak/co-dino-5scale-lsj-r50-3x-coco
- Paper Co-DETR (ICCV 2023): https://arxiv.org/abs/2211.12860
- Paper Faster R-CNN (arXiv:1405.0312): https://arxiv.org/abs/1405.0312
- Repositorio oficial Co-DETR: https://github.com/Sense-X/Co-DETR
- Fork mantenido: https://github.com/dronefreak/Co-DETR
- Configuracion del checkpoint en el repositorio: https://huggingface.co/dronefreak/co-dino-5scale-lsj-r50-3x-coco/blob/main/co_dino_5scale_lsj_r50_3x_coco.py
- MMDetection 2.x: https://github.com/open-mmlab/mmdetection/tree/2.x
- Dataset COCO: https://huggingface.co/datasets/detection-datasets/coco
- Pagina de la tarea de deteccion de objetos en Hugging Face: https://huggingface.co/tasks/object-detection
