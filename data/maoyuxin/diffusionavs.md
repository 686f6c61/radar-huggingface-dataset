# maoyuxin/DiffusionAVS

## Resumen

DiffusionAVS es un conjunto de pesos para la tarea de segmentación audiovisual (audio-visual segmentation, AVS), publicados junto al artículo «Contrastive Conditional Latent Diffusion for Audio-Visual Segmentation» (IEEE TIP 2025). El modelo aborda el problema de segmentar, en un vídeo, el objeto que produce el sonido, combinando información visual y auditiva mediante un proceso de difusión latente condicionada.

La propuesta técnica se apoya en difusión latente condicionada de forma contrastiva, un enfoque que emplea un backbone PVT-v2-B5 como extractor visual y pesos de audio preentrenados obtenidos por separado. El repositorio de Hugging Face contiene únicamente los state dictionaries de PyTorch (`MS3/best.pth` y `S4/best.pth`) junto con sus ficheros `config.json` adyacentes, con un tamaño total de 0,7 GB.

Es relevante para investigadores que trabajen en AVS y en modelos generativos condicionados, ya que ofrece pesos listos para evaluación sobre los conjuntos MS3 y S4 con resultados publicados de mIoU y F-score. No se trata de un modelo de lenguaje ni de un modelo multimodal conversacional: es un componente de investigación para segmentación audiovisual.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Difusión latente condicionada contrastiva con backbone visual PVT-v2-B5 |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (no es un modelo de lenguaje) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (tarea de visión y audio, no de texto) |
| Licencia | no disponible |
| Formato de pesos | PyTorch state dictionaries (`.pth`) con `config.json` |

## Arquitectura y entrenamiento

El modelo se basa en difusión latente condicionada con un mecanismo contrastivo, según el título del artículo. El backbone visual es PVT-v2-B5; los pesos del backbone y del codificador de audio se obtienen por separado y no forman parte del repositorio. La model card no detalla el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron etapas de RLHF o DPO (no aplicables en esta tarea).

Los pesos publicados corresponden a dos configuraciones de evaluación, una para el conjunto MS3 y otra para S4, cada una con su `config.json`. No se especifican innovaciones adicionales como decodificación especulativa o atención lineal; la contribución principal es el esquema de difusión condicionada contrastiva descrito en el paper.

## Capacidades

- Segmentación audiovisual: localiza y segmenta en vídeo el objeto que emite el sonido.
- Condicionamiento conjunto de audio y vídeo mediante difusión latente.
- Evaluación sobre los conjuntos MS3 y S4 con métricas mIoU y F-score.
- Integración con el repositorio de código oficial para inferencia y evaluación.
- No soporta generación de texto, tool calling, agentes ni razonamiento multi-step.
- No dispone de capacidades multilingües ni de modo de pensamiento (thinking mode).

## Casos de uso

- Investigación en segmentación audiovisual: reproducir los resultados de MS3 y S4 con los pesos `best.pth` y el comando de evaluación del repositorio oficial.
- Análisis de vídeo con pistas de audio: identificar el objeto sonoro en escenas complejas para anotación automática de datasets.
- Edición y postproducción de vídeo: aislar la fuente sonora para tareas de separación visual o seguimiento de objetos.
- Robótica y percepción multimodal: localizar la fuente de sonido en entornos captados por cámara y micrófono.
- Benchmarking de métodos de difusión aplicados a visión: comparar frente a enfoques discriminativos de AVS con las mismas métricas.
- Docencia y experimentación: servir como base reproducible para cursos sobre modelos generativos condicionados y multimodalidad.
- Desarrollo de sistemas de accesibilidad: resaltar visualmente la fuente de audio en contenido audiovisual.

## Benchmarks y rendimiento

| Tarea | Backbone | mIoU (%) | F |
|---|---|---:|---:|
| MS3 | PVT-v2-B5 | 59,46 | 0,7198 |
| S4 | PVT-v2-B5 | 81,90 | 0,9047 |

No se han publicado en la información disponible resultados adicionales (por ejemplo, comparativas con otros métodos) más allá de los dos conjuntos indicados.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; el repositorio ocupa 0,7 GB en disco, pero el backbone PVT-v2-B5 y los pesos de audio se descargan aparte y condicionan el consumo real.
- GPU recomendadas: no especificadas en la model card; por el tamaño del backbone, se recomienda una GPU con al menos 16 GB de VRAM para evaluación cómoda.
- Compatibilidad con GPU de consumo: probable en tarjetas de gama alta (por ejemplo, RTX 4090), aunque no está confirmado en la información disponible.
- Opciones de despliegue: el repositorio oficial de GitHub (OpenNLPLab/DiffusionAVS) con PyTorch; no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI (no aplicables a esta tarea).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tarea | Backbone | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| DiffusionAVS | Segmentación audiovisual | PVT-v2-B5 | no aplica | no disponible | Pesos en Hugging Face + código en GitHub |
| Alternativas de AVS discriminativas | Segmentación audiovisual | no disponible | no aplica | no disponible | no disponible |

No se dispone en la información proporcionada de datos concretos de modelos comparables (parámetros, contexto o rendimiento) para establecer una comparativa cuantitativa fiable.

## Limitaciones y advertencias

- Solo se publican los pesos; el dataset, el backbone preentrenado y los pesos de audio deben obtenerse por separado.
- No se especifica la licencia, por lo que el uso comercial queda sin garantías hasta confirmación del autor.
- No hay información sobre sesgos del modelo ni sobre el dominio de entrenamiento más allá de MS3 y S4.
- Riesgo de degradación en escenas con múltiples fuentes sonoras o audio poco correlacionado con la imagen, propio de la tarea AVS.
- No es un modelo de propósito general: no genera texto, no responde a instrucciones y no soporta tool calling.
- Requiere el comando de evaluación del repositorio oficial; no se documenta una API de inferencia directa desde Hugging Face.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, sin validación comunitaria adicional.

## Enlaces

- Hugging Face: https://huggingface.co/maoyuxin/DiffusionAVS
- Código e instrucciones: https://github.com/OpenNLPLab/DiffusionAVS
- Paper (DOI): https://doi.org/10.1109/TIP.2025.3580269
