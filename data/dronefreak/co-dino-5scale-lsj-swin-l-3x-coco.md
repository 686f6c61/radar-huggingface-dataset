# dronefreak/co-dino-5scale-lsj-swin-l-3x-coco

## Resumen

Co-DINO es un detector de objetos basado en la familia DETR que combina la arquitectura DINO (DETR with Improved DeNoising Anchor Boxes) con el esquema de entrenamiento Co-DETR ("DETRs with Collaborative Hybrid Assignments Training"), presentado en ICCV 2023 por Zhuofan Zong, Guanglu Song y Yu Liu (SenseTime X-Lab). Este checkpoint concreto es el modelo Co-DINO de 5 escalas con backbone Swin-Large, entrenado con el schedule "3x" (36 épocas) sobre COCO 2017.

El repositorio `dronefreak/co-dino-5scale-lsj-swin-l-3x-coco` no es una publicación oficial: es un espejo comunitario de los pesos que los autores originales distribuyeron vía Google Drive. El objetivo del espejo es ofrecer descargas reproducibles y versionadas a través del Hub de Hugging Face, con checksum explícito, para los checkpoints no-ViT de Co-DETR (ResNet-50 y Swin) que los autores no subieron a la plataforma.

El modelo reporta un box AP de 60.7 en COCO val2017, una cifra alta para detección de objetos de propósito general. Su relevancia práctica radica en que es un detector de alta precisión con backbone Swin-L, utilizable en pipelines de visión por computador que requieran detección densa y precisa, aunque con requisitos de infraestructura notables (stack OpenMMLab 1.x, PyTorch 1.11).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DINO (DETR) con esquema de entrenamiento Co-DETR, 5 escalas, backbone Swin-Large, LSJ (large scale jittering) |
| Parametros totales | 235.969.427 (según safetensors del repo); 219,2 M en inferencia según la model card |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (modelo de visión, no de lenguaje) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (etiquetas de clase COCO en inglés) |
| Licencia | unknown (licencia de los pesos sin determinar) |
| Formato de pesos | .pth (checkpoint PyTorch para MMDetection); el repo incluye además safetensors |
| Framework | MMDetection 2.25.3, MMCV-full 1.5.0, PyTorch 1.11 |
| Dataset de entrenamiento | COCO 2017 (detection-datasets/coco) |
| Schedule | 36 épocas (3x) |
| Tamaño del repo | 3,8 GB |

## Arquitectura y entrenamiento

Co-DETR no introduce una arquitectura nueva, sino un esquema de entrenamiento. Sobre el decodificador DETR con matching húngaro uno-a-uno, añade cabezas auxiliares con asignación de etiquetas uno-a-muchos (una cabeza ATSS y una cabeza RoI estilo Faster R-CNN). Las propuestas positivas generadas por esas cabezas se realimentan al decodificador como queries adicionales, lo que hace más discriminativas las características del encoder y acelera la convergencia. Las cabezas auxiliares se usan solo durante el entrenamiento: la configuración de este checkpoint fija `eval_module='detr'`, de modo que en inferencia solo opera el decodificador DETR.

Este checkpoint concreto emplea un backbone Swin-Large con extracción de características a 5 escalas y aumento de datos LSJ (large scale jittering), entrenado durante 36 épocas sobre COCO 2017. No se dispone de información detallada sobre composición exacta del dataset más allá de COCO, ni sobre uso de RLHF/DPO (no aplicable a un detector). El modelo requiere el código del proyecto Co-DETR y el stack OpenMMLab 1.x para la inferencia; no es un modelo PyTorch/transformers estándar.

## Capacidades

- Detección de objetos en imágenes con 80 categorías de COCO.
- Detección en vídeo y webcam mediante `tools/inference.py` del fork mantenido.
- Salida de detecciones en formato JSON (`--save-json`) para integración en pipelines.
- Procesamiento por lotes de imágenes y carpetas completas.
- Alta precisión en objetos de escalas muy diversas gracias a la extracción a 5 escalas y al LSJ.
- No soporta tool calling, agentes, razonamiento multi-paso ni generación de texto: es exclusivamente un modelo de visión.
- Capacidades multilingües: no aplicable; las etiquetas de clase están en inglés.

## Casos de uso

- Análisis de vídeo de tráfico y dashcam: el modelo se ha validado con clips de dashcam (según la demo del repo) y puede detectar vehículos, peatones y señales en flujo de vídeo mediante `tools/inference.py`, aprovechando su precisión en objetos pequeños.
- Anotación asistida de datasets: generar detecciones JSON sobre grandes colecciones de imágenes para preetiquetar y acelerar el etiquetado humano en proyectos de visión.
- Vigilancia y control de aforo: detección de personas y objetos en secuencias de cámaras IP, con procesamiento por lotes de carpetas de frames.
- Inspección industrial: detección de defectos u objetos en imágenes de línea de producción, reentrenando o afinando el checkpoint sobre un dataset propio con MMDetection.
- Investigación en detección de objetos: servir como baseline de alta precisión (60,7 box AP en COCO val) para comparar nuevos métodos de asignación de etiquetas o backbones.
- Extracción de regiones de interés para pipelines multimodal: usar las cajas detectadas para recortar regiones que alimenten un modelo de captioning o clasificación posterior.
- Robótica y conducción autónoma en fase de prototipo: percepción de objetos en tiempo casi real sobre GPU, integrada en un stack Python con MMDetection.

## Benchmarks y rendimiento

Datos declarados por el autor del modelo en la model card (no verificados):

| Benchmark | Métrica | Valor |
|---|---|---|
| COCO 2017 val2017 | box AP | 60,7 |

No se han publicado en la información disponible resultados de otros benchmarks (por ejemplo, máscaras, velocidad o comparativas numéricas con otros detectores).

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con 219,2 M de parámetros en inferencia y backbone Swin-L, se requiere una GPU con al menos 16-24 GB para lotes pequeños a resolución COCO.
- GPU recomendadas: A100 o H100 para lotes grandes y máxima precisión; RTX 4090 viable para inferencia con lotes pequeños.
- Cabe en GPU de consumo: previsiblemente en RTX 3090/4090 (24 GB) con lote 1; no confirmado en la información disponible.
- Opciones de despliegue: MMDetection 2.25.3 + MMCV-full 1.5.0 + PyTorch 1.11 (stack obligatorio); el fork `dronefreak/Co-DETR` incluye `tools/setup_codetr_env.sh` para crear el entorno conda `codetr`. No compatible con vLLM, llama.cpp, Ollama ni TGI (no es un modelo de lenguaje).
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | COCO box AP | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Co-DINO Swin-L 5scale LSJ 3x (este) | 236 M (total) / 219,2 M (inferencia) | no aplica | 60,7 | unknown | Hub (espejo comunitario) |
| Co-DETR ViT-L | no disponible | no aplica | no disponible | no disponible | Hub (publicado por los autores) |
| Co-DETR ResNet-50 | no disponible | no aplica | no disponible | no disponible | Google Drive (autores) |

No se dispone en la información proporcionada de cifras comparativas de otros detectores (por ejemplo, DINO o Deformable DETR) para establecer una comparación numérica rigurosa.

## Limitaciones y advertencias

- Licencia sin determinar (`unknown`): no hay garantía de uso comercial; es imprescindible contactar con los autores originales antes de un despliegue en producción.
- Es un espejo no oficial: los créditos del método y los pesos pertenecen a Zhuofan Zong, Guanglu Song y Yu Liu (SenseTime X-Lab); el espejo se retirará a petición de los autores.
- Requiere el stack OpenMMLab 1.x (MMDetection 2.25.3, MMCV-full 1.5.0, PyTorch 1.11), lo que dificulta la integración con entornos modernos de PyTorch.
- No es un modelo de lenguaje: no soporta generación de texto, tool calling ni razonamiento; cualquier expectativa en ese sentido es un error de uso.
- Limitado a las 80 clases de COCO; el rendimiento en dominios fuera de distribución (imágenes médicas, satelitales, industriales) no está garantizado sin afinamiento.
- Riesgo de falsos positivos y negativos inherente a la detección de objetos; no se han publicado métricas de calibración ni de robustez.
- Sesgos potenciales derivados de la distribución de COCO (predominio de escenas cotidianas de internet), no cuantificados en la información disponible.
- El box AP de 60,7 está marcado como no verificado (`verified: false`) en la model card.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/dronefreak/co-dino-5scale-lsj-swin-l-3x-coco
- Repositorio oficial Co-DETR: https://github.com/Sense-X/Co-DETR
- Fork mantenido por el autor del espejo: https://github.com/dronefreak/Co-DETR
- Paper Co-DETR (ICCV 2023): https://arxiv.org/abs/2211.12860
- Paper COCO: https://arxiv.org/abs/1405.0312
- MMDetection 2.x: https://github.com/open-mmlab/mmdetection/tree/2.x
- Dataset COCO en el Hub: https://huggingface.co/datasets/detection-datasets/coco
- Página de la tarea de detección de objetos: https://huggingface.co/tasks/object-detection
