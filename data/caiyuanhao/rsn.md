# CaiYuanhao/RSN

## Resumen

RSN (Residual Steps Network) es un modelo de estimación de pose 2D multi-persona en dos etapas (top-down), desarrollado originalmente por Yuanhao Cai y colaboradores en ECCV 2020, donde ganó el COCO Keypoint Challenge 2019. Esta ficha corresponde a un checkpoint concreto publicado en Hugging Face que combina la arquitectura RSN con el backbone y la cabeza de RTMPose-X, añadiendo refinadores de pasos residuales, atención espacial y confianza condicionada por la propuesta de persona.

El modelo resuelve la detección de los 17 keypoints del esqueleto COCO sobre cada recorte de persona previamente detectado (por ejemplo, con YOLOX-S). Frente al RTMPose-X oficial, este checkpoint mejora ligeramente el AP en COCO val2017 (79,12 frente a 78,82) a costa de aumentar la latencia por persona de 3,34 ms a 5,40 ms en una RTX A5000, lo que lo sitúa como una variante de precisión máxima para pipelines donde el coste de la etapa de pose no es el cuello de botella.

Es relevante para desarrolladores que necesitan una estimación de pose de alta precisión con licencia Apache 2.0 y pesos en formato PyTorch nativo (`.pth`), integrable en pipelines de visión por computador con detección de personas previa.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | RSN (Residual Steps Network) + RTMPose-X, top-down con refinadores de pasos residuales y atención espacial |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión, no de lenguaje) |
| Tipos de cuantización | no disponible (checkpoint FP32 PyTorch; se reportan ejecuciones en FP16 con CUDA Graph) |
| Idiomas soportados | en (etiqueta de la model card; sin relevancia lingüística al ser un modelo visual) |
| Licencia | Apache 2.0 |
| Formato de pesos | `.pth` (PyTorch, cargable con `torch.load(..., weights_only=True)`) |

## Arquitectura y entrenamiento

La arquitectura es un estimador de pose top-down: primero se detectan las personas (YOLOX-S en el pipeline por defecto) y después RSN + RTMPose-X predice los 17 keypoints COCO sobre cada recorte de 384 × 288 píxeles. La innovación central de RSN son los refinadores de pasos residuales, que propagan información de alta resolución entre etapas para capturar representaciones locales finas, combinados aquí con atención espacial y una confianza condicionada por la propuesta de persona.

Según la model card, el entrenamiento se realiza sobre COCO y MPII mediante el script `RTMPose-X/train.py`. No se especifican en la información disponible el número de tokens, la composición exacta del dataset, ni si hubo etapas de RLHF/DPO (no aplicables a un modelo de visión). La evaluación reportada emplea las 5.000 imágenes de COCO val2017, 56 propuestas de persona (H56), inferencia con flip y OKS NMS.

## Capacidades

- Estimación de pose 2D multi-persona con 17 keypoints del esqueleto COCO.
- Detección de keypoints sobre recortes de persona individuales (entrada de 384 × 288 por persona).
- Integración con detección de personas externa (YOLOX-S en el pipeline de referencia).
- Procesamiento de vídeo (`.mp4`) e imágenes (`.jpg`, `.png`) con salida anotada.
- Inferencia en FP16 con CUDA Graph para reducir latencia.
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades multilingües: es un modelo puramente visual.

## Casos de uso

- Análisis deportivo automatizado: extracción de keypoints por fotograma para calcular ángulos articulares y trayectorias en vídeo, aprovechando el AP de 79,12 en COCO val2017.
- Motion capture de bajo coste: sustitución de sistemas de captura con marcadores por estimación 2D multi-persona sobre vídeo convencional, con detección previa de personas mediante YOLOX-S.
- Vigilancia y análisis de comportamiento: detección de posturas (caídas, agacharse, levantamiento de brazos) en flujos de cámara, usando el pipeline `pipeline.py` sobre vídeo.
- Rehabilitación y fisioterapia: seguimiento de la corrección postural del paciente comparando keypoints contra una pose de referencia.
- Animación y VFX: generación de esqueletos 2D para rigging o retargeting en producción audiovisual, gracias a la licencia Apache 2.0 que permite uso comercial.
- Investigación en visión por computador: modelo de referencia para comparar variantes de refinamiento residual y atención espacial frente a RTMPose-X oficial.
- Análisis ergonómico en entornos industriales: evaluación de posturas de trabajadores en vídeo para estudios de ergonomía, con la latencia de 5,40 ms por persona como referencia en GPU de datacenter.

## Benchmarks y rendimiento

| Modelo | COCO val2017 AP | Latencia de pose por persona |
|---|---:|---:|
| RTMPose-X oficial | 78,818237 | 3,338 ms |
| RSN + RTMPose-X | 79,124422 | 5,401 ms |

Condiciones de evaluación: 5.000 imágenes de COCO val2017, 56 propuestas de persona (H56), inferencia con flip y OKS NMS. La latencia se mide en una RTX A5000 con ejecuciones FP16 emparejadas con CUDA Graph, batch 1, Conv/BN fusionados y un forward de 384 × 288 por persona. No se han publicado en la información disponible resultados de otros benchmarks (MPII, CrowdPose, etc.).

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita; el repositorio ocupa 0,2 GB, por lo que el checkpoint cabe holgadamente en GPUs de consumo.
- GPU de referencia en la evaluación: RTX A5000 (24 GB).
- Compatible con GPUs de consumo (RTX 3090, RTX 4090, etc.) dado el reducido tamaño del checkpoint; no se especifican requisitos mínimos.
- Despliegue: PyTorch nativo mediante el repositorio oficial (`RTMPose-X/pipeline.py`); no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI (no aplicables a este tipo de modelo).
- Latencia reportada: 5,401 ms por persona en RTX A5000 (FP16, CUDA Graph, batch 1). El tiempo extremo a extremo del pipeline depende de YOLOX-S, del fotograma y del número de personas.

## Comparativa con modelos similares

| Modelo | Tipo | COCO val2017 AP | Latencia por persona | Licencia | Disponibilidad |
|---|---|---:|---:|---|---|
| RSN + RTMPose-X (este) | Top-down híbrido | 79,124422 | 5,401 ms | Apache 2.0 | Hugging Face + GitHub |
| RTMPose-X oficial | Top-down | 78,818237 | 3,338 ms | no disponible en la información | Referencia del repo RTMPose |
| Otros estimadores top-down (p. ej. HRNet, SimpleBaseline) | Top-down | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Solo detecta keypoints sobre recortes de persona: requiere un detector previo (YOLOX-S u otro); errores del detector se propagan a la estimación de pose.
- El rendimiento y la latencia extremo a extremo dependen del fotograma y del número de personas, no solo del modelo de pose.
- No se han publicado análisis de sesgos en la información disponible; como todo modelo entrenado en COCO/MPII, puede degradarse en poses atípicas, oclusiones severas, multitudes densas o dominios visuales distintos.
- Riesgo de falsos positivos en keypoints ocluidos: la confianza condicionada por la propuesta mitiga pero no elimina este problema.
- La model card solo declara el idioma `en`; sin relevancia práctica al ser un modelo visual, pero indica ausencia de documentación multilingüe.
- Licencia Apache 2.0: permite uso comercial, pero conviene verificar las licencias de los datasets de entrenamiento (COCO, MPII) y del detector de personas empleado.
- No hay métricas publicadas de robustez, calibración ni rendimiento en dominios distintos de COCO val2017.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/CaiYuanhao/RSN
- Checkpoint: https://huggingface.co/CaiYuanhao/RSN/resolve/main/rsn-rtmpose-x.pth
- Configuración: https://huggingface.co/CaiYuanhao/RSN/blob/main/config.json
- Repositorio de código: https://github.com/caiyuanhao1998/RSN
- Página del proyecto: https://caiyuanhao1998.github.io/RSN-Project/
- Demo interactiva: https://huggingface.co/spaces/CaiYuanhao/RSN-RTMPose-X
- Paper (arXiv): https://arxiv.org/abs/2003.04030
- Instrucciones de entrenamiento: https://github.com/caiyuanhao1998/RSN/blob/master/RTMPose-X/TRAINING.md
