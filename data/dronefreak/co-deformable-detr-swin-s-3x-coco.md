# dronefreak/co-deformable-detr-swin-s-3x-coco

## Resumen
Co-Deformable-DETR con backbone Swin-Small es un detector de objetos basado en la arquitectura Deformable-DETR y entrenado mediante el esquema Co-DETR de colaboración de asignaciones híbridas. Fue desarrollado por Zhuofan Zong, Guanglu Song y Yu Liu de SenseTime X-Lab, y presentado en ICCV 2023. El checkpoint que nos ocupa es un espejo no oficial, subido por el usuario dronefreak a HuggingFace, que replica el modelo original de 70,7 millones de parámetros y alcanza 55,3 de AP en el conjunto de validación de COCO 2017.

El modelo resuelve el problema de la detección de objetos en imágenes y vídeo, con 80 clases del dataset COCO. Su relevancia radica en el enfoque de entrenamiento Co-DETR, que combina cabezas auxiliares con asignación one-to-many (ATSS y RoI head) junto al matching húngaro one-to-one del decoder DETR, lo que mejora la discriminación de las características del encoder y acelera la convergencia. No es un modelo de lenguaje ni admite carga con la librería `transformers`; la inferencia requiere el código de Co-DETR y el stack de OpenMMLab 2.x.

## Especificaciones técnicas
| Parámetro | Valor |
|---|---|
| Arquitectura | Co-DETR (Deformable-DETR) con backbone Swin-Small |
| Parámetros totales | 70,7 millones (según la model card; parámetros en inferencia) |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No aplica (modelo de visión) |
| Tipos de cuantización | No disponible |
| Idiomas soportados | No aplica (modelo de visión); el repo está etiquetado como inglés en metadatos |
| Licencia | Desconocida / sin determinar (license: unknown en HuggingFace; "undetermined" en la model card) |
| Formato de pesos | PyTorch .pth (MMDetection 2.x) |

## Arquitectura y entrenamiento
Co-DETR (Collaborative Hybrid Assignments Training) no introduce una arquitectura nueva, sino un esquema de entrenamiento que mejora la convergencia de los modelos DETR. Durante el entrenamiento, se acoplan al decoder principal cabezas auxiliares que emplean asignación one-to-many: una cabeza ATSS y una cabeza RoI estilo Faster R-CNN. Las propuestas positivas generadas por estas cabezas se realimentan al decoder como consultas adicionales. De esta forma, el encoder aprende características más discriminativas y el modelo converge en menos épocas. Las cabezas auxiliares se eliminan en la inferencia, de modo que el costo de ejecución es el de un Deformable-DETR estándar.

El modelo usa un backbone Swin-Small (Swin Transformer) y fue entrenado sobre el dataset COCO con un plan de 36 épocas (3x). El checkpoint convertido a HuggingFace es el mismo que los autores distribuyeron originalmente en Google Drive, junto con su archivo de configuración de MMDetection. El repositorio espejo no redistribuye datos de entrenamiento.

## Capacidades
- Detección de objetos con 80 clases de COCO, incluyendo personas, vehículos, animales, objetos cotidianos y mobiliario.
- Soporta imágenes individuales, carpetas, vídeos y webcam a través de la herramienta `tools/inference.py` del fork `dronefreak/Co-DETR`.
- Permite guardar los resultados en JSON con la opción `--save-json`, lo que facilita su integración en pipelines de datos.
- No es un modelo de lenguaje: no genera texto, no soporta function calling, ni agentes, ni razonamiento multi-paso.
- No es multimodal más allá de la detección de objetos en imágenes.
- Requiere el stack de OpenMMLab 2.x (MMDetection 2.25.3, MMCV-full 1.5.0, PyTorch 1.11).
- Compatible con la configuración de MMDetection para personalizar umbrales de confianza o entrenar sobre datasets propios.

## Casos de uso
- **Vigilancia y seguridad**: El modelo detecta personas, coches, bicicletas y otros objetos en feeds de cámaras IP. Al integrarse con el fork `dronefreak/Co-DETR`, puede procesar vídeo en tiempo real y emitir alertas si se superan umbrales de confianza.
- **Asistencia a la conducción (ADAS)**: El checkpoint se demuestra en clips de dashcam, lo que sugiere su idoneidad para detectar peatones, vehículos y señales en secuencias de carretera. Puede usarse en prototipos de sistemas de alerta de colisión.
- **Control de calidad industrial**: Con un reentrenamiento sobre un dataset específico de defectos, la arquitectura Co-DETR permite detectar anomalías en superficies o componentes. Las cabezas auxiliares aceleran la convergencia, lo que reduce el coste de entrenamiento en dominios nuevos.
- **Inventario y retail**: El modelo puede localizar y contar productos en estanterías a partir de cámaras fijas. Las clases COCO relevantes (botellas, cajas, tazas) cubren un amplio espectro de mercancía, y el guardado en JSON facilita la integración con sistemas de gestión de inventario.
- **Robótica móvil**: Para robots que operan en interiores, el modelo proporciona detección de obstáculos y objetos de interés. Al ser ligero (70,7 millones de parámetros), puede ejecutarse en GPUs embebidas con suficiente VRAM.
- **Etiquetado automático de datasets**: La herramienta de inferencia permite generar anotaciones JSON a partir de imágenes sin etiquetar. Esto puede acelerar el trabajo de anotación humana en proyectos de visión por computador, especialmente para crear datasets iniciales de COCO.
- **Monitorización de tráfico**: En intersecciones urbanas, el modelo puede contar vehículos, detectar atascos o identificar peatones usando cámaras fijas. El soporte de vídeo facilita el análisis de secuencias temporales.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks de lenguaje (MMLU, HumanEval, GSM8K) porque no es un modelo de texto. Los únicos datos disponibles corresponden a detección de objetos en COCO.

| Modelo | Dataset | Métrica | Valor | Verificado |
|---|---|---|---|---|
| co_deformable_detr_swin_small_3x_coco | COCO 2017 val | box AP | 55,3 | No |
| Co-Deformable-DETR Swin-L | COCO | box AP | 58,5 | No |

Nota: el repositorio oficial de Sense-X menciona que Co-DETR con ViT-L supera 66,0 AP en COCO test-dev, pero la cifra exacta está mal formateada en la fuente ("65.666.0 AP") y no se incluye en la tabla.

## Requisitos de hardware
- VRAM estimada: no especificada en la documentación. Con 70,7 millones de parámetros, el checkpoint en FP32 ocupa aproximadamente 283 MB y en FP16 unos 141 MB; el consumo real de VRAM dependerá del tamaño de imagen y del framework (MMDetection 2.x).
- GPU recomendada: cualquier GPU con al menos 8 GB de VRAM (RTX 3060, RTX 4060, A100, H100) puede ejecutar la inferencia para imágenes de tamaño típico.
- Capacidad en GPUs de consumo: sí, es viable en GPUs como RTX 3060 o inferiores con configuraciones de entrada reducidas.
- Opciones de despliegue: no es compatible con vLLM, llama.cpp, Ollama ni TGI, ya que estos frameworks están orientados a modelos de lenguaje. El despliegue se realiza con el código de Co-DETR (fork `dronefreak/Co-DETR`) y el stack OpenMMLab 2.x. Opcionalmente se puede exportar a ONNX o TensorRT, pero no hay scripts oficiales proporcionados.
- Latencia y throughput estimados: no disponibles. Dependen del hardware, del tamaño de entrada y de la configuración de la cabeza de detección.

## Comparativa con modelos similares
| Modelo | Parámetros | AP COCO | Licencia | Disponibilidad |
|---|---|---|---|---|
| Co-Deformable-DETR Swin-S (este) | 70,7M | 55,3 | Desconocida | HuggingFace (espejo) y Google Drive original |
| Co-Deformable-DETR Swin-L | no disponible | 58,5 | Desconocida | Google Drive original |
| Co-DETR ViT-L | 304M | 66,0 (test-dev) | Desconocida | HuggingFace oficial |

Nota: Co-DETR ViT-L está publicitado con 66,0 AP en COCO test-dev, pero la fuente tiene un error de formato ("65.666.0 AP").

## Limitaciones y advertencias
- No es un release oficial; es un espejo no oficial del checkpoint original subido por un tercero. La autoría del método y de los pesos corresponde a SenseTime X-Lab.
- La licencia de los pesos está sin determinar; no se puede asumir uso comercial sin verificación legal previa.
- No soporta carga con `transformers`; requiere MMDetection 2.x y el código Co-DETR. Esto añade complejidad de despliegue frente a modelos con soporte nativo en HuggingFace.
- Solo detecta las 80 clases de COCO; no cubre clases personalizadas sin reentrenamiento.
- El AP reportado (55,3) no está verificado por la comunidad ni por benchmarks independientes.
- Como cualquier detector, puede producir falsos positivos en escenas con oclusiones, iluminación adversa o concurrencia de objetos.
- El dataset COCO presenta sesgos geográficos y de distribución (imágenes mayoritariamente de Internet, con sesgo hacia objetos y escenas occidentales); el rendimiento puede degradarse en contextos no representados.
- El espejo puede ser eliminado a petición de los autores originales; no hay garantía de disponibilidad a largo plazo.
- El entorno requerido (PyTorch 1.11, MMCV-full 1.5.0) es antiguo y puede provocar conflictos de dependencias con versiones modernas de Python o CUDA.

## Enlaces
- Página del modelo en HuggingFace: https://huggingface.co/dronefreak/co-deformable-detr-swin-s-3x-coco
- Repositorio oficial de Co-DETR: https://github.com/Sense-X/Co-DETR
- Fork mantenido con entorno configurado: https://github.com/dronefreak/Co-DETR
- Paper de Co-DETR (ICCV 2023): https://arxiv.org/abs/2211.12860
- Wiki de la arquitectura Co-Deformable-DETR: https://deepwiki.com/Sense-X/Co-DETR/3.1-co-deformable-detr-models
