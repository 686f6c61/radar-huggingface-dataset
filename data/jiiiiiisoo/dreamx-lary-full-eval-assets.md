# Jiiiiiisoo/dreamx-lary-full-eval-assets

## Resumen

DreamX es un método de aprendizaje de acciones latentes (latent action learning) que reutiliza un modelo de difusión de vídeo preentrenado como extractor de representaciones espacio-temporales para derivar acciones latentes compactas y invariantes a la apariencia. Lo desarrolla KAIST AI y se presenta en el paper "DreamX: Video Diffusion Model is a Universal Latent Action Learner" (arXiv 2611.05377). El repositorio de Hugging Face `Jiiiiiisoo/dreamx-lary-full-eval-assets` no contiene pesos del modelo en sí, sino los materiales de evaluación y handoff para reproducir los resultados de LARYBench con dos baselines RGB.

La relevancia del trabajo radica en la compresión extrema de la representación: cada fotograma latente de vídeo pasa de 1.200 tokens a 4, una reducción de 300x, manteniendo capacidad discriminativa suficiente para igualar o superar el estado del arte en LARYBench entre modelos de acciones latentes. Además, el paper reporta transferencia de acciones zero-shot entre morfologías humanas y robóticas, lo que apunta a un espacio de acción latente compartido entre encarnaciones.

El repositorio de assets documenta el pipeline completo de evaluación: descarga de datos (aproximadamente 1,16 TiB extraídos de `Jiiiiiisoo/lary_bench`), checkpoints RGB+action y RGB-only, cachés de latentes parciales y scripts para completar las filas faltantes sobre el conjunto de 1.190.720 vídeos. No se publican en esta información especificaciones de arquitectura del modelo base más allá de su origen (Cosmos-Predict2.5-2B) ni datos de entrenamiento propios.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (el método reutiliza un modelo de difusión de vídeo preentrenado, NVIDIA Cosmos-Predict2.5-2B, como extractor de características espacio-temporales) |
| Parametros totales | no disponible para DreamX; el backbone referenciado es Cosmos-Predict2.5-2B (2B) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (se procesan vídeos; cada fotograma latente se comprime de 1.200 a 4 tokens) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (entrada de texto fija: `An agent performs an action.`) |
| Licencia | no disponible |
| Formato de pesos | no disponible (el repositorio contiene assets de evaluación y cachés `.npz` de latentes; los checkpoints se distribuyen vía Google Drive) |

## Arquitectura y entrenamiento

DreamX no entrena un transformer desde cero: parte de un modelo de difusión de vídeo preentrenado (Cosmos-Predict2.5-2B, en revisión `15a82a2ec231bc318692aa0456a36537c806e7d4`) y explota sus características espacio-temporales para extraer acciones latentes. La innovación central es la compresión de 1.200 tokens por fotograma latente a 4 tokens (300x), lo que produce representaciones de acción compactas y, según el paper, invariantes a la apariencia. El pipeline de evaluación utiliza además Cosmos-Reason1-7B y un tokenizer asociado, descargados en revisiones fijas.

El repositorio de assets describe el procedimiento de evaluación, no el entrenamiento del modelo: se reutilizan cachés de latentes parciales de dos checkpoints baseline (RGB+action y RGB-only), se extraen únicamente las filas ausentes del split completo y se entrenan probes de clasificación sobre LARYBench para las categorías robot y human. Todos los vídeos usan el prompt fijo `An agent performs an action.`; los nombres de acción se emplean como etiquetas, no como entradas de texto. En el momento de la publicación, RGB+action contaba con 537.583 filas válidas y RGB-only con 532.312, quedando 653.137 y 658.408 filas pendientes respectivamente sobre el total de 1.190.720 vídeos. No se detallan en la información disponible el número de tokens de entrenamiento, la composición del dataset de preentrenamiento ni si hubo RLHF o DPO.

## Capacidades

- Extracción de acciones latentes a partir de vídeo: representa la dinámica de un clip en 4 tokens por fotograma latente, frente a los 1.200 del modelo de difusión original.
- Aprendizaje de acciones invariante a la apariencia: las representaciones buscan capturar el movimiento con independencia del aspecto visual de la escena.
- Transferencia zero-shot entre encarnaciones: el paper reporta transferencia de acciones entre morfologías humanas y robóticas.
- Clasificación de acciones sobre LARYBench: los probes entrenados sobre las latentes permiten evaluar la calidad de la representación en tareas de clasificación robot y human.
- Evaluación a gran escala: pipeline reproducible sobre 1.190.720 vídeos de siete fuentes.
- No se documentan en la información disponible capacidades de generación de texto, tool calling, agentes, matemáticas, visión general o audio.

## Casos de uso

- Investigación en aprendizaje de acciones latentes: DreamX sirve como referencia para extraer representaciones de acción compactas de un modelo de difusión de vídeo y comparar su calidad frente a otros métodos en LARYBench, gracias a la compresión 300x que reduce el coste de almacenamiento y cómputo de las latentes.
- Transferencia entre encarnaciones en robótica: el espacio latente compartido entre vídeos humanos y robóticos permite entrenar políticas o probes que aprovechen datos humanos para tareas de robot, reduciendo la dependencia de teleoperación.
- Preentrenamiento de políticas con datos de vídeo no etiquetados: las acciones latentes extraídas pueden emplearse como señal auxiliar o supervisión débil en pipelines de imitation learning, dado que el método no requiere etiquetas de acción durante la extracción.
- Evaluación reproducible de baselines: el repositorio de assets documenta la descarga de datos, checkpoints y cachés, lo que permite a otros grupos replicar los resultados RGB+action y RGB-only sobre el split completo de LARYBench.
- Análisis de representaciones espacio-temporales: los ficheros `.npz` de latentes y los probes de clasificación permiten estudiar qué información de movimiento captura un modelo de difusión de vídeo y cómo varía entre fuentes de datos.
- Compresión de representaciones para almacenamiento: la reducción de 1.200 a 4 tokens por fotograma facilita mantener cachés de latentes de datasets de vídeo de más de un terabyte en infraestructuras de investigación modestas.

## Benchmarks y rendimiento

La información disponible indica que el paper reporta estado del arte en LARYBench entre modelos de acciones latentes, pero no se proporcionan cifras concretas de MMLU, HumanEval, GSM8K ni de las métricas de LARYBench en los datos suministrados.

| Benchmark | Resultado | Comparación |
|---|---|---|
| LARYBench | estado del arte según el paper (sin cifras en la información disponible) | no disponible |
| MMLU / HumanEval / GSM8K | no aplica / no disponible | no disponible |

No se han publicado resultados de benchmarks con cifras en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible para DreamX; el backbone Cosmos-Predict2.5-2B requiere previsiblemente una GPU con memoria suficiente para un modelo de 2B en bf16 (aproximadamente 4-6 GB solo de pesos, más activaciones de vídeo), aunque no se confirma en la información.
- GPU recomendadas: el pipeline de evaluación usa `LARY_CACHE_GPUS=0,1,2,3` y `LARY_CLASS_GPUS=0,1,2,3`, es decir, cuatro GPU en paralelo; no se especifica el modelo exacto (A100, H100, RTX 4090).
- Cabe en GPU de consumo: no disponible.
- Opciones de despliegue: el repositorio usa `uv sync --extra=cu128` (CUDA 12.8) sobre el repositorio `video_lam/cosmos-predict2.5`; no se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone en la información proporcionada de datos de parámetros, contexto, rendimiento o licencia de modelos comparables de aprendizaje de acciones latentes (por ejemplo, otros métodos evaluados en LARYBench), por lo que la comparativa cuantitativa no está disponible.

| Modelo | Parámetros | Contexto | LARYBench | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| DreamX | no disponible (backbone 2B) | no disponible | estado del arte según el paper (sin cifras) | no disponible | assets en HF, checkpoints en Google Drive |
| Alternativas de acciones latentes | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- El repositorio `Jiiiiiisoo/dreamx-lary-full-eval-assets` no contiene pesos del modelo ni una model card convencional: es un paquete de assets y scripts de evaluación, por lo que no debe tratarse como un modelo desplegable.
- La licencia no está especificada, lo que impide determinar si el uso comercial es posible; además, el pipeline depende de assets de NVIDIA (Cosmos-Predict2.5-2B, Cosmos-Reason1-7B) cuyas licencias deben aceptarse por separado.
- Los checkpoints se distribuyen vía Google Drive porque la cuota de almacenamiento público de Hugging Face del autor está agotada, lo que añade un punto de fallo externo a la reproducibilidad.
- El método depende de un prompt fijo (`An agent performs an action.`) y de etiquetas de acción para la evaluación; no se documenta robustez ante otros dominios, idiomas o prompts.
- Riesgo de alucinación y sesgos: no evaluado en la información disponible; al tratarse de un extractor de latentes de vídeo, el riesgo se traslada a las representaciones y a los probes entrenados sobre ellas.
- El conjunto de evaluación es masivo (1.190.720 vídeos, ~1,16 TiB) y en el momento de la publicación quedaban más de 650.000 filas por procesar en cada baseline, por lo que los resultados completos no estaban cerrados.
- No se documentan limitaciones de contexto o idioma porque el modelo no opera como un LLM de texto convencional.

## Enlaces

- Repositorio de assets en Hugging Face: https://huggingface.co/Jiiiiiisoo/dreamx-lary-full-eval-assets
- Paper en arXiv: https://arxiv.org/abs/2611.05377
- Página del paper en Hugging Face: https://huggingface.co/papers/2611.05377
- Cobertura en AI Weekly (DreamX): https://aiweekly.co/alerts/dreamx-repurposes-a-video-diffusion-model-into-a-universal-latent-action
- Cobertura en AI Weekly (KAIST DreamX): https://aiweekly.co/alerts/kaist-dreamx-repurposes-video-diffusion-as-latent-action-learner
- Cobertura en Emergent: https://emergent.sh/news/dreamx-compresses-video-diffusion-models-300x
- Repositorio de código video_lam: https://github.com/jiiiisoo/video_lam
- Repositorio LARYBench: https://github.com/meituan-longcat/LARYBench
- Dataset LARYBench en Hugging Face: https://huggingface.co/Jiiiiiisoo/lary_bench
- Checkpoints y cachés (Google Drive): https://drive.google.com/drive/folders/1Gw1EZsC0HRfYtpN5kkrfjrCt77sBDbOB
- Modelo base Cosmos-Predict2.5-2B: https://huggingface.co/nvidia/Cosmos-Predict2.5-2B
- Modelo Cosmos-Reason1-7B: https://huggingface.co/nvidia/Cosmos-Reason1-7B
