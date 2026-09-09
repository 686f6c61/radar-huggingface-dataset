# dronefreak/co-dino-5scale-swin-l-3x-coco

## Resumen

Este espejo en HuggingFace proporciona el checkpoint `co_dino_5scale_swin_large_3x_coco` de los autores originales de SenseTime X-Lab (Zhuofan Zong, Guanglu Song y Yu Liu), publicado en ICCV 2023. El repositorio es un espejo no oficial: `dronefreak` ha alojado el mismo fichero de pesos que los autores distribuyeron por Google Drive, junto con la config correspondiente y una model card, para facilitar descargas reproducibles. El modelo es un detector de objetos basado en la arquitectura DETR con backbone Swin-Large, entrenado durante 36 épocas (schedule 3x) en el dataset COCO.

Co-DETR (Collaborative Hybrid Assignments Training) no es una arquitectura nueva, sino un esquema de entrenamiento que añade cabezas auxiliares de asignación one-to-many (ATSS y una RoI head estilo Faster R-CNN) junto al matching húngaro one-to-one del decoder DETR. Esto acelera la convergencia y mejora la discriminación de las características del encoder. En este checkpoint, las cabezas auxiliares solo se usan durante el entrenamiento; en inferencia, el modelo se comporta como un Co-DINO estándar.

Con 219.2 millones de parámetros en inferencia y un box AP de 60.0 en COCO val2017, este checkpoint se sitúa como una referencia sólida para la detección de objetos. La licencia de los pesos es indeterminada (`unknown`), por lo que se debe contactar con los autores originales antes de usarlo comercialmente.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Co-DETR (DINO) con backbone Swin-Large y atención deformable multi-escala de 5 niveles |
| Parametros totales | 219.2 millones (según la model card, parámetros en inferencia) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica (modelo de detección de objetos, no de lenguaje) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No aplica (modelo de visión) |
| Licencia | Unknown (indeterminada) |
| Formato de pesos | PyTorch `.pth`, compatible con MMDetection 2.x |
| Peso del repositorio | 2.8 GB |

## Arquitectura y entrenamiento

Co-DETR combina un esquema de entrenamiento colaborativo híbrido con la arquitectura DINO. Durante el entrenamiento, se añaden cabezas auxiliares de asignación one-to-many (una cabeza ATSS y una RoI head estilo Faster R-CNN) junto al decoder DETR, que usa matching húngaro one-to-one. Los proposals positivos de estas cabezas se insertan como queries adicionales en el decoder, lo que hace que las características del encoder sean más discriminativas y acelera la convergencia. En inferencia, las cabezas auxiliares se eliminan (`eval_module='detr'`), por lo que solo se utiliza el decoder Co-DINO.

El backbone es un Swin-Large preentrenado. El config usa una ventana de atención deformable de 5 escalas y un schedule de 36 épocas (3x). El modelo fue entrenado en el dataset COCO 2017, con la partición val2017 como referencia de evaluación. No hay información sobre RLHF/DPO, ya que no es un modelo de lenguaje.

## Capacidades

- Detección de objetos: clasifica y localiza hasta 80 clases de COCO, incluidas personas, vehículos, animales y objetos cotidianos.
- Salida estructurada: el script de inferencia del repositorio puede guardar los resultados en formato JSON, lo que facilita el postprocesado automático.
- Entrada variada: acepta imágenes individuales, carpetas de imágenes, vídeo o webcam, según el quickstart de la model card.
- No soporta generación de texto, tool calling, agentes ni razonamiento simbólico: es exclusivamente un modelo de detección de objetos.
- No soporta audio ni entrada multimodal de lenguaje: solo procesa imágenes.

## Casos de uso

- Conducción autónoma y asistentes de seguridad vial: el modelo detecta vehículos, peatones y señales en secuencias de vídeo. Su box AP de 60.0 en COCO val lo acerca al estado del arte en detección, y el script de inferencia permite procesar clips de vídeo directamente.
- Videovigilancia y monitorización: se puede desplegar en un servidor con GPU para analizar cámaras de tráfico, detectar intrusiones o contar personas. La salida en JSON facilita la integración con sistemas de alerta automáticos.
- Anotación automática de datasets: el modelo puede pre-etiquetar imágenes para reducir el trabajo humano en la creación de datasets de detección. El script de inferencia genera un JSON con las predicciones, que luego se revisa y corrige.
- Inspección de calidad industrial: tras un fine-tuning con imágenes de defectos, el modelo puede detectar anomalías en piezas de producción. El preentrenamiento en COCO proporciona características de bajo nivel útiles para transferir aprendizaje a dominios específicos.
- Robótica y navegación autónoma: el modelo proporciona percepción para que un robot o dron identifique obstáculos y objetos de interés en su entorno. Las 80 clases de COCO cubren muchos objetos cotidianos relevantes en aplicaciones robóticas.
- Investigación académica en detección de objetos: este checkpoint sirve como referencia reproducible para comparar arquitecturas DETR-based en COCO y validar nuevos métodos de entrenamiento con una fuente de pesos estable.
- Análisis de imágenes aéreas y satelitales (con ajuste): aunque el modelo no está especializado en este dominio, se puede adaptar con fine-tuning para detectar edificios, vehículos o infraestructuras en imágenes de drones o aviones.

## Benchmarks y rendimiento

| Modelo | Dataset | Métrica | Valor |
|---|---|---|---|
| co_dino_5scale_swin_large_3x_coco | COCO 2017 val (val2017) | box AP | 60.0 |

Resultado declarado en el model-index de la model card. No se han publicado otros benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: los pesos en fp32 ocupan aproximadamente 877 MB (219.2 millones de parámetros × 4 bytes). En la práctica, con imágenes de 800×800 y batch de 1, la VRAM utilizada suele rondar entre 2 y 6 GB. Para resoluciones más altas o lotes mayores se necesitará más memoria.
- GPU recomendadas: RTX 3090 o RTX 4090 para un flujo de trabajo cómodo. En producción con alta concurrencia, se recomienda A100 40/80 GB o H100 80 GB.
- Compatibilidad con consumer GPUs: sí, cabe en RTX 3060/3080 con 8-12 GB para inferencia de imágenes individuales.
- Opciones de despliegue: MMDetection 2.x es el entorno oficial, con la versión indicada en la model card (MMDetection 2.25.3, MMCV-full 1.5.0, PyTorch 1.11). Se puede exportar a ONNX o TensorRT mediante las herramientas de OpenMMLab para optimizar la inferencia. No es compatible con vLLM, llama.cpp ni Ollama.
- Latencia y throughput: no disponible en la información proporcionada.

## Comparativa con modelos similares

No se dispone de datos verificados de modelos comparables en la información proporcionada. Por contexto técnico, las alternativas más próximas son las variantes de la familia Co-DETR/Co-DINO con distintos backbones (ResNet-50, Swin-L, ViT-L). Según la documentación externa de DeepWiki, la variante con ViT-L alcanza 66.0 AP en COCO test-dev, pero ese dato no está verificado en esta model card y corresponde a otro checkpoint. El fichero de configuración `co_dino_5scale_swin_l_16xb1_3x_coco.py` de MMDetection es una variante del mismo modelo con distinto batch size (16x1) y schedule, pero no se aporta su AP.

| Modelo | Backbone | AP COCO val | Licencia |
|---|---|---|---|
| co_dino_5scale_swin_l_3x_coco | Swin-L | 60.0 | unknown |
| Variante Co-DETR con ViT-L (según DeepWiki) | ViT-L | 66.0 (test-dev, no verificado en este repo) | no disponible |
| DINO original (referencia) | Swin-L | no disponible | no disponible |

## Limitaciones y advertencias

- Licencia indeterminada: el metadato indica `license: unknown` y la model card manifiesta "Weights license undetermined". Esto impide un uso comercial seguro sin autorización expresa de los autores originales.
- Espejo no oficial: los pesos son un mirror de un checkpoint alojado originalmente en Google Drive. El autor del repositorio no contribuye a la investigación y puede retirarlo a petición de los autores.
- Cobertura limitada de clases: solo detecta las 80 categorías de COCO. Para detectar clases nuevas es necesario un reentrenamiento.
- Falsos positivos y sesgos de datos: el rendimiento en dominios fuera de COCO (médico, industrial, satelital) puede ser bajo y producir detecciones erróneas. No se han documentado sesgos específicos, pero el dataset de COCO refleja sesgos en la representación de personas y objetos.
- Falta de soporte lingüístico: no es un modelo de lenguaje. Tareas como tool calling, generación de texto o razonamiento no están soportadas.
- Entorno de ejecución específico: requiere MMDetection 2.25.3, MMCV-full 1.5.0 y PyTorch 1.11, lo que limita la integración con stacks modernos de despliegue (por ejemplo, transformers, vLLM).

## Enlaces

- HuggingFace: https://huggingface.co/dronefreak/co-dino-5scale-swin-l-3x-coco
- Config en el repositorio: https://huggingface.co/dronefreak/co-dino-5scale-swin-l-3x-coco/blob/main/co_dino_5scale_swin_large_3x_coco.py
- Paper (Co-DETR): https://arxiv.org/abs/2211.12860
- Repo oficial de Co-DETR: https://github.com/Sense-X/Co-DETR
- Fork mantenido con entorno de inferencia: https://github.com/dronefreak/Co-DETR
- Config en MMDetection: https://github.com/open-mmlab/mmdetection/blob/main/projects/CO-DETR/configs/codino/co_dino_5scale_swin_l_16xb1_3x_coco.py
- Documentación técnica de la familia Co-DINO: https://deepwiki.com/Sense-X/Co-DETR/3.2-co-dino-models
