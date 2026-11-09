# fira-aslan/skel-render-align-checkpoints

## Resumen

`fira-aslan/skel-render-align-checkpoints` no es un modelo de lenguaje generativo, sino un repositorio de checkpoints de pesos destinados a cuadernos de evaluación de alineación entre esqueleto y renderizado (skeleton-render alignment). El repositorio agrupa tres artefactos de terceros: un ViT-B/16 de ViFi-CLIP afinado completamente en zero-shot sobre Kinetics-400, un ViT-B/16 de ActionCLIP con 16 frames sobre K400 y un fichero CSV con las etiquetas de las 55 clases no vistas del split 55/5 de NTU-60.

El interés es práctico: permite reproducir evaluaciones de reconocimiento de acciones y alineación multimodal vídeo-texto sin tener que rastrear las releases originales de ViFi-CLIP y ActionCLIP ni reconstruir las etiquetas del protocolo zero-shot de NTU-60. El tamaño del repositorio (2,0 GB) corresponde fundamentalmente a los dos checkpoints ViT-B/16.

No se dispone de información sobre el pipeline, los idiomas ni una model card descriptiva más allá de la tabla de procedencia de ficheros. La licencia declarada es MIT, heredada de las releases originales de ambos proyectos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ViT-B/16 (Vision Transformer, patch 16) para clasificación/alineación vídeo-texto; dos checkpoints independientes (ViFi-CLIP y ActionCLIP) |
| Parametros totales | no disponible (ViT-B/16, del orden de 86 M por checkpoint; no confirmado en la información proporcionada) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo de visión; ventana temporal de 16 frames en ActionCLIP; no especificada para ViFi-CLIP) |
| Tipos de cuantizacion | no disponible (pesos en precisión original `.pth`/`.pt`) |
| Idiomas soportados | no disponible (modelo visión-lenguaje; las etiquetas CSV están en inglés) |
| Licencia | MIT |
| Formato de pesos | PyTorch: `vifi_clip_10_epochs_k400_full_finetuned.pth`, `vit-b-16-16f_weights.pt`; etiquetas en CSV |

## Arquitectura y entrenamiento

Los dos checkpoints son Vision Transformers ViT-B/16 adaptados a vídeo. ViFi-CLIP (Rasheed, Khattak et al., CVPR 2023) es un ViT-B/16 afinado completamente sobre Kinetics-400 en régimen zero-shot, es decir, entrenado para alinear representaciones vídeo-texto mediante CLIP sobre las clases de K400. ActionCLIP (Wang et al., 2021) es un ViT-B/16 que procesa 16 frames por clip sobre K400; el fichero del repositorio se ha re-guardado sin el estado del optimizador y con el prefijo `module.` de la capa de fusión eliminado, lo que facilita su carga directa en PyTorch.

No se documentan en la información disponible el número de tokens de entrenamiento, la composición exacta del dataset más allá de K400, ni si hubo etapas de RLHF/DPO (no aplicables en este tipo de modelos). Tampoco se describen innovaciones técnicas adicionales como decodificación especulativa o atención lineal. El tercer artefacto es un CSV con los nombres de las 55 clases no vistas del split 55/5 de NTU-60, procedente de SKI-Models.

## Capacidades

- Extracción de características visuales de vídeo mediante ViT-B/16.
- Clasificación de acciones zero-shot sobre las 1000 clases de Kinetics-400 (ViFi-CLIP).
- Alineación vídeo-texto para tareas de recuperación y comparación semántica.
- Procesamiento de clips de 16 frames (ActionCLIP).
- Evaluación de protocolos zero-shot con clases no vistas (etiquetas NTU-60 55/5 incluidas).
- No soporta tool calling, function calling ni razonamiento multi-paso: no es un modelo de lenguaje.
- No dispone de modo thinking, visión estática ni audio más allá de lo implícito en los vídeos de entrada.

## Casos de uso

- Reproducción de experimentos de alineación esqueleto-render: cargar los checkpoints en los cuadernos de evaluación y comparar las predicciones de ViFi-CLIP y ActionCLIP sobre los mismos clips.
- Evaluación zero-shot de reconocimiento de acciones: usar ViFi-CLIP para clasificar clips contra las 1000 clases de K400 sin reentrenamiento.
- Baseline en investigación de vídeo-texto: emplear ambos ViT-B/16 como referencia para medir mejoras de nuevos modelos de alineación.
- Protocolo zero-shot de NTU-60: utilizar el CSV `zsl_55-5_novel_class_labels.csv` para evaluar sobre las 55 clases no vistas del split 55/5.
- Extracción de embeddings de vídeo para pipelines de recuperación: generar representaciones con ViFi-CLIP e indexarlas para búsqueda semántica de clips.
- Docencia y formación: estudiar la diferencia entre un enfoque CLIP (ViFi-CLIP) y uno de prompt-tuning/adaptación (ActionCLIP) sobre el mismo backbone.
- Validación de infraestructura de inferencia: comprobar la carga de pesos PyTorch sin prefijos `module.` en entornos de producción.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita; con ViT-B/16 (del orden de 86 M de parámetros por checkpoint) la inferencia en fp32 requiere aproximadamente 0,35 GB solo para pesos, más activaciones de vídeo.
- GPU recomendadas: no especificadas en la información disponible; por tamaño, una GPU consumer de gama media-alta (RTX 3060/4060 o superior) debería ser suficiente para inferencia por lotes pequeños.
- Cabe en GPU consumer: previsiblemente sí, dado el tamaño de ViT-B/16; no confirmado en la información proporcionada.
- Opciones de despliegue: PyTorch nativo (carga directa de `.pth`/`.pt`); no se documenta soporte de vLLM, llama.cpp, Ollama ni TGI (no aplicables a este tipo de modelo).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / frames | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ViFi-CLIP (incluido aquí) | ViT-B/16 | no especificado | Clasificación zero-shot K400 | MIT | Checkpoint en este repo y release original |
| ActionCLIP (incluido aquí) | ViT-B/16 | 16 frames | Clasificación K400 | MIT | Checkpoint en este repo y release original |
| SKI-Models (etiquetas) | no aplica | no aplica | Etiquetas NTU-60 55/5 | no disponible | CSV en este repo |

No se dispone de información sobre otros modelos comparables en la documentación proporcionada.

## Limitaciones y advertencias

- No es un modelo de lenguaje: no genera texto ni soporta instrucciones conversacionales.
- Los checkpoints son de terceros; el repositorio solo los redistribuye con fines de evaluación.
- El CSV de etiquetas cubre únicamente las 55 clases no vistas de NTU-60; no sirve para el conjunto completo.
- No se documentan sesgos, tasas de alucinación ni limitaciones idiomáticas más allá de las inherentes a K400 (clases en inglés y sesgo hacia acciones occidentales).
- La licencia MIT permite uso comercial, pero se recomienda verificar las condiciones de las releases originales de ViFi-CLIP y ActionCLIP antes de redistribuir en producción.
- El repositorio no incluye código de inferencia ni instrucciones de carga más allá de la tabla de ficheros.
- No hay métricas publicadas que permitan estimar el rendimiento en dominios distintos de K400 y NTU-60.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/fira-aslan/skel-render-align-checkpoints
- ViFi-CLIP (release original): https://github.com/muzairkhattak/ViFi-CLIP
- ActionCLIP (release original): https://github.com/sallymmx/ActionCLIP
- SKI-Models (etiquetas NTU-60): https://github.com/thearkaprava/SKI-Models
