# CAT-IROS-2026/cat

## Resumen

CAT (Capability-Aware Traversability) es un modelo de segmentación de imágenes orientado a robótica de navegación, presentado en el artículo "Towards Capability-Aware Traversability Navigation for Unstructured Environments" en IROS 2026 por el Mobile Robotics Group de la Universidad de São Paulo. El modelo predice mapas densos de transitabilidad a partir de una única imagen RGB-D, condicionados por las capacidades del robot que va a desplazarse por el terreno.

La arquitectura combina un codificador DINOv3 congelado (ViT-B/16, preentrenado en LVD-1689M) que procesa RGB y profundidad, un modelo CLIPSeg (rd64-refined) que genera mapas de terreno, y un decodificador SPADE que fusiona ambas señales. Un vector de puntuaciones específicas del robot modula la representación y permite leer prototipos de transitabilidad adaptados a cada plataforma (por ejemplo, un robot con mayor altura libre puede atravesar obstáculos que otro no).

El checkpoint publicado es un modelo de investigación con 0 descargas y licencia DINOv3, distribuido como `best_model.pth` junto a estadísticas de profundidad por sensor. Su relevancia radica en el enfoque *capability-aware*: en lugar de un único mapa de transitabilidad genérico, el modelo produce mapas condicionados por la morfología y capacidades del robot, lo que resulta útil en entornos no estructurados donde distintos vehículos deben planificar rutas diferentes sobre el mismo terreno.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DINOv3 ViT-B/16 congelado + CLIPSeg rd64-refined + decodificador SPADE con modulación por vector de robot |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión, no de lenguaje) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | DINOv3 License (checkpoint); código MIT |
| Formato de pesos | PyTorch (`best_model.pth`); backbones DINOv3 y CLIPSeg se descargan por separado |

## Arquitectura y entrenamiento

CAT es un modelo de segmentación densa que sigue un esquema de fusión multimodal. Un backbone DINOv3 ViT-B/16 congelado codifica la imagen RGB y la profundidad; en paralelo, un CLIPSeg rd64-refined produce mapas de terreno. Un vector de puntuaciones específicas del robot (por ejemplo, altura libre, capacidad de superar pendientes) modula la representación intermedia, y un decodificador basado en SPADE fusiona las características para generar los mapas de transitabilidad. Finalmente, prototipos específicos del robot leen la salida y producen mapas densos adaptados a cada plataforma.

El checkpoint se entrena sobre estadísticas de profundidad por sensor incluidas en `depth_stats.json`, lo que sugiere un entrenamiento multi-sensor. No se especifican en la información disponible el número de tokens de entrenamiento, la composición exacta del dataset ni si se emplearon técnicas de RLHF o DPO (no aplicables a un modelo de visión). La innovación principal es el condicionamiento por capacidades del robot, que permite reutilizar un mismo modelo para distintas plataformas sin reentrenar.

## Capacidades

- Segmentación densa de transitabilidad a partir de una imagen RGB-D.
- Predicción condicionada por el robot: el mismo terreno produce mapas distintos según las capacidades del vehículo.
- Fusión de información RGB y de profundidad mediante backbones congelados (DINOv3 y CLIPSeg).
- Generación de mapas de terreno intermedios mediante CLIPSeg.
- Soporte de múltiples sensores de profundidad (estadísticas por sensor en `depth_stats.json`).
- No dispone de tool calling, agentes, razonamiento multi-paso ni capacidades multilingües: es un modelo puramente visual.
- No dispone de modo thinking, visión generativa, audio ni otras capacidades multimodales más allá de RGB-D.

## Casos de uso

- Navegación autónoma en entornos no estructurados: el modelo genera mapas de transitabilidad densos a partir de RGB-D que un planificador de rutas puede consumir para evitar zonas no transitables en campo abierto, escombros o vegetación.
- Flotas heterogéneas de robots: al condicionar la predicción por el vector de capacidades del robot, una misma infraestructura de percepción sirve para un rover de exploración y un robot de reparto con distinta altura libre y capacidad de pendiente.
- Robots de rescate y búsqueda: la predicción densa permite identificar corredores transitables en escombros o terrenos irregulares donde los mapas de elevación tradicionales no bastan.
- Vehículos agrícolas y de campo: el modelo puede generar mapas de transitabilidad para tractores o robots agrícolas que deben circular por surcos, barro o pendientes con capacidades mecánicas específicas.
- Investigación en robótica de percepción: sirve como baseline reproducible para estudiar el efecto del condicionamiento por capacidades en la planificación de rutas.
- Integración en pipelines de simulación a realidad: al usar backbones congelados y un decodificador ligero, el modelo puede desplegarse en plataformas con recursos limitados tras validación en simulación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada. Al tratarse de un ViT-B/16 con decodificador SPADE, la huella es moderada, pero no se especifican cifras.
- GPU recomendadas: no disponible. Por el tamaño del backbone (ViT-B/16), es plausible su ejecución en GPUs de consumo, pero no se confirma en la documentación.
- ¿Cabe en GPU de consumo? no disponible.
- Opciones de despliegue: el repositorio de código usa `uv` con extra `cu128` (CUDA 12.8) y un script `cat_demo.py`; no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI (no aplicables a este tipo de modelo).
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Tipo | Condicionamiento por robot | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| CAT (este modelo) | Segmentación RGB-D de transitabilidad | Sí (vector de capacidades) | no aplica | DINOv3 License | Hugging Face + GitHub |
| CLIPSeg rd64-refined | Segmentación guiada por texto | No | no aplica | no disponible | Hugging Face |
| DINOv3 ViT-B/16 | Backbone visual auto-supervisado | No | no aplica | DINOv3 License | Hugging Face |
| Modelos de transitabilidad genéricos (p. ej. basados en elevación) | Mapas de coste | No | no aplica | variable | no disponible |

No se dispone de comparativas de rendimiento numéricas con alternativas en la información proporcionada.

## Limitaciones y advertencias

- Modelo de investigación con 0 descargas y 0 likes: no hay evidencia de validación por la comunidad ni de uso en producción.
- Licencia DINOv3: restringe el uso comercial; es necesario revisar los términos en el enlace oficial antes de cualquier despliegue comercial.
- El checkpoint se distribuye como `best_model.pth` (PyTorch), no en formatos estándar como safetensors o GGUF, lo que complica su integración en pipelines de inferencia habituales.
- Depende de backbones externos (DINOv3 y CLIPSeg) que se descargan por separado, añadiendo dependencias y posibles fallos de reproducibilidad.
- No se documentan sesgos, tasas de alucinación ni métricas de robustez; al ser un modelo visual, el riesgo principal es la predicción errónea de transitabilidad en condiciones de iluminación, textura o profundidad atípicas.
- No soporta idiomas ni texto: cualquier aplicación multilingüe debe gestionarse fuera del modelo.
- El tamaño del repo es 0.0 GB, lo que sugiere que los pesos pueden no estar completamente subidos o que el checkpoint es muy ligero; conviene verificar la integridad de la descarga.
- No hay información sobre latencia, throughput ni requisitos de hardware, lo que impide evaluar su viabilidad en plataformas embebidas.

## Enlaces

- Hugging Face: https://huggingface.co/CAT-IROS-2026/cat
- arXiv: https://arxiv.org/abs/2607.20679
- Página del proyecto: https://capability-aware-traversability.github.io
- Repositorio de código: https://github.com/EESC-LabRoM/capability-aware-traversability
- Licencia DINOv3: https://ai.meta.com/resources/models-and-libraries/dinov3-license
- Modelo base DINOv3: https://huggingface.co/facebook/dinov3-vitb16-pretrain-lvd1689m
- Modelo base CLIPSeg: https://huggingface.co/CIDAS/clipseg-rd64-refined
