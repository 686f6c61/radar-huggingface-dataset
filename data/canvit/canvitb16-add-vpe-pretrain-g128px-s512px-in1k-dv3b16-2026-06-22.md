# canvit/canvitb16-add-vpe-pretrain-g128px-s512px-in1k-dv3b16-2026-06-22

## Resumen

CanViT-B es un checkpoint de un modelo de visión artificial denominado Canvas Vision Transformer (CanViT), desarrollado por el autor canvit y presentado en el paper "CanViT: Toward Active-Vision Foundation Models" (NeurIPS 2026). Se trata de un modelo de extracción de características visuales que no procesa la imagen completa de una sola vez, sino que la observa mediante una secuencia de "glimpses" (vistas parciales) y acumula la información en un lienzo (canvas) de alcance global. Este checkpoint concreto ha sido preentrenado sobre ImageNet-1k mediante destilación latente densa del modelo facebook/dinov3-vitb16-pretrain-lvd1689m.

El modelo resuelve el problema de construir representaciones visuales globales a partir de observaciones parciales, algo relevante para escenarios de visión activa, robótica o inspección donde el sensor no captura la escena completa de una vez. Con 98.114.176 parámetros y arquitectura Vision Transformer de parche 16, se posiciona como un modelo de tamaño medio, adecuado para extracción de características y como base para tareas posteriores de visión.

La relevancia actual radica en que propone un paradigma alternativo al ViT estándar (procesamiento de imagen completa) y se apoya en destilación desde DINOv3, un modelo de referencia en representaciones visuales auto-supervisadas. El checkpoint está publicado bajo licencia MIT y es accesible mediante la librería canvit-pytorch.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision Transformer (ViT) con mecanismo de vision activa sobre canvas; parche de 16 px |
| Parametros totales | 98.114.176 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no aplica (modelo de vision); canvas de 32x32 durante preentrenamiento, tamano arbitrario en inferencia |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo de vision, no linguistico) |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

CanViT es un Vision Transformer de visión activa: en lugar de procesar una imagen completa en una sola pasada, recibe una secuencia de glimpses (en este checkpoint, de 128 px) y mantiene un estado global denominado canvas, que en el preentrenamiento tiene una resolución de 32x32 y puede adoptar cualquier tamano en inferencia. La escena de entrada durante el preentrenamiento es de 512 px. La arquitectura incorpora un esquema de atención sobre el canvas que permite agregar información de cada glimpse a una representación de toda la escena.

El entrenamiento se realizó por destilación latente densa desde facebook/dinov3-vitb16-pretrain-lvd1689m sobre el dataset ILSVRC/imagenet-1k, con un total de 1.837.056 pasos de entrenamiento. El objetivo es que las características del canvas se aproximen a las del profesor DINOv3 para la escena completa. No se dispone de información sobre composición detallada del dataset, uso de RLHF/DPO (no aplica a un modelo de visión) ni otras innovaciones técnicas más allá del propio mecanismo de visión activa y la destilación densa.

## Capacidades

- Extracción de características visuales a nivel de parche y de escena completa mediante el canvas.
- Procesamiento de escenas mediante secuencias de glimpses con políticas configurables (por ejemplo, coarse_to_fine).
- Generación de una representación global (canvas) de la escena a partir de observaciones parciales.
- Predicción de características del profesor (DINOv3) para la escena completa, útil para destilación y evaluación.
- Soporte de tamano de canvas variable en inferencia (no restringido al 32x32 del preentrenamiento).
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso en el sentido de modelos de lenguaje.
- No dispone de capacidades multilingües ni de generación de texto.
- No dispone de modo thinking, visión-a-texto, audio ni otras capacidades multimodales.

## Casos de uso

- Extracción de características para clasificación o recuperación visual: se puede usar el canvas final como descriptor global de la escena y alimentar un clasificador lineal o un sistema de búsqueda por similitud, aprovechando que el modelo produce representaciones densas alineadas con DINOv3.
- Visión activa en robótica e inspección: el modelo está disenado para escenas observadas mediante secuencias de vistas parciales, por lo que encaja en pipelines donde una camara móvil captura regiones de una escena y se necesita una representación global acumulada.
- Destilación y evaluación de modelos: la función predict_teacher_patches permite comparar las características del canvas con las del profesor DINOv3, útil para analizar la calidad de la destilación o para generar pseudoetiquetas.
- Preentrenamiento de cabezas downstream: al ser un backbone de 98 M de parámetros con licencia MIT, puede servir como inicialización para tareas de segmentación, detección o clasificación con conjuntos de datos propios.
- Procesamiento de imágenes de gran tamano o de alta resolución: al permitir un canvas de tamano arbitrario en inferencia, se puede adaptar a escenas mayores que 512 px combinando múltiples glimpses.
- Investigación en mecanismos de atención y visión activa: el modelo y su código permiten experimentar con políticas de selección de glimpses (por ejemplo, coarse_to_fine) y estudiar el efecto en la representación final.
- Sistemas de inspección visual por fases: en entornos donde primero se capta una vista general y luego cuadrantes de detalle, el flujo coarse_to_fine del modelo replica ese patrón de adquisición.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; con 98,1 M de parámetros, los pesos en fp32 ocupan aproximadamente 0,39 GB y en fp16 alrededor de 0,20 GB, sin contar activaciones ni el estado del canvas.
- GPU recomendadas: no disponibles en la informacion proporcionada; por tamano, el modelo es ligero y cabe en GPUs de consumo, aunque no se especifican modelos concretos.
- Cabe en consumer GPU: previsiblemente sí por numero de parámetros, pero no hay datos oficiales de consumo de memoria ni de latencia.
- Opciones de despliegue: la libreria oficial es canvit-pytorch (>=0.2); no se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto/Entrada | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| CanViT-B (este checkpoint) | 98.114.176 | Escenas 512 px, glimpses 128 px, canvas 32x32 (arbitrario en inferencia) | Extraccion de caracteristicas con vision activa | MIT | Hugging Face (canvit) |
| facebook/dinov3-vitb16-pretrain-lvd1689m | no disponible en la informacion | no disponible | Extraccion de caracteristicas ViT | DINOv3 License | Hugging Face (facebook) |
| Otros ViT-B de extraccion de caracteristicas | no disponible | no disponible | Extraccion de caracteristicas | no disponible | no disponible |

La comparacion directa con DINOv3 es la mas relevante porque CanViT-B se destila precisamente desde ese modelo; sin embargo, no se dispone de metricas comparativas publicadas en la informacion proporcionada. Para alternativas adicionales, no disponible.

## Limitaciones y advertencias

- Al ser un modelo de vision, no genera texto ni mantiene conversaciones; no debe evaluarse con criterios de modelos de lenguaje.
- El checkpoint se ha preentrenado unicamente sobre ImageNet-1k, lo que limita la diversidad de dominios visuales frente a modelos entrenados con datasets mayores.
- La calidad de las representaciones depende de la politica de glimpses utilizada; un diseno inadecuado de la secuencia puede degradar el canvas final.
- Aunque la licencia del repositorio es MIT, el modelo se destila desde DINOv3, liberado bajo la DINOv3 License; conviene revisar las implicaciones de esa licencia para uso comercial.
- No se han publicado resultados de benchmarks, por lo que no es posible cuantificar su rendimiento frente a alternativas.
- No hay informacion sobre sesgos, robustez ante dominios fuera de distribucion ni comportamiento con imagenes de resolucion muy distinta a la de entrenamiento.
- No se especifican requisitos de hardware ni latencias, lo que dificulta planificar despliegues en produccion.
- El uso de la version de la libreria canvit-pytorch es critico: con versiones <0.2 es necesario pasar revision="canvit-pytorch-0.1" a from_pretrained.

## Enlaces

- Hugging Face: https://huggingface.co/canvit/canvitb16-add-vpe-pretrain-g128px-s512px-in1k-dv3b16-2026-06-22
- Paper (NeurIPS 2026, OpenReview): https://openreview.net/forum?id=cnV9GA4pKU
- arXiv: https://arxiv.org/abs/2603.22570
- Codigo: https://github.com/m2b3/CanViT
- Pagina del proyecto: https://m2b3.github.io/CanViT/
- Todos los checkpoints: https://huggingface.co/canvit
- Modelo profesor (DINOv3 ViT-B/16): https://huggingface.co/facebook/dinov3-vitb16-pretrain-lvd1689m
- Repositorio DINOv3: https://github.com/facebookresearch/dinov3
- Licencia DINOv3: https://github.com/facebookresearch/dinov3/blob/main/LICENSE.md
