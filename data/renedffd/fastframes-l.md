# Renedffd/FastFrames-L

## Resumen

FastFrames-L es un modelo de generación de vídeo texto-a-vídeo (text-to-video) desarrollado por Apple AIML Research, presentado en el paper *FastFrames: Video Generation at Interactive Latency* (arXiv:2611.23226). Se trata de un modelo de difusión autorregresivo de dos pasos que genera vídeo a 480p con latencia interactiva, es decir, con tiempos de generación del orden de decenas de milisegundos por frame en lugar de los segundos o minutos habituales en modelos de difusión convencionales.

La versión L (Large) consta de 14 000 millones de parámetros y se obtiene por destilación del modelo Wan2.1-T2V-14B, siguiendo la receta Causal Forcing++. El modelo se distribuye junto a una versión pequeña, FastFrames-S (1.3B), y ambos comparten la misma arquitectura de dos pasos: una evaluación del DiT en dos niveles de ruido (t=1000 y t=833), seguida de una red de refinamiento de KV cache y un decodificador de píxeles.

Su relevancia radica en que demuestra que es posible generar vídeo de forma autorregresiva con latencia compatible con aplicaciones interactivas (control de cámara en tiempo real, demostraciones en vivo), manteniendo una calidad evaluada con VBench. El repositorio ocupa 173,5 GB e incluye pesos en formato safetensors bajo licencia Apple Sample Code License (apple-amlr).

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Difusión autorregresiva de dos pasos sobre backbone DiT (destilada de Wan2.1-14B mediante Causal Forcing++) |
| Parámetros totales | 14B (FastFrames-L) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (genera 81 frames por clip) |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible (modelo texto-a-vídeo; los prompts se procesan vía el codificador de texto heredado de Wan2.1) |
| Licencia | apple-amlr (Apple Sample Code License); componentes LingBot bajo CC BY-NC-SA 4.0 |
| Formato de pesos | safetensors |
| Resolución de salida | 832 × 480 (480p) |
| Duración de salida | 81 frames a 16 fps |
| Modelo base | Wan-AI/Wan2.1-T2V-14B |
| Tamaño del repositorio | 173,5 GB |

## Arquitectura y entrenamiento

FastFrames-L es un modelo de difusión autorregresivo que genera vídeo frame a frame mediante un esquema de dos pasos. El pipeline consta de cuatro componentes: una evaluación del DiT en t=1000, una segunda evaluación del DiT en t=833, una red de refinamiento de la KV cache y un decodificador de píxeles. Según el perfilado publicado para la variante S en una GPU a 480p, el coste por llamada del DiT es de aproximadamente 16,1–16,2 ms, el refinamiento de KV de 2,2 ms y el decodificador de píxeles de 0,9 ms, con un total de 35,4 ms por frame (36 ms en el paper).

El entrenamiento de FastFrames-L parte de Wan2.1-14B: primero se destila en un modelo causal de dos pasos siguiendo la receta Causal Forcing++, y después se entrenan el decodificador de píxeles y la red de refinamiento de KV del mismo modo que en FastFrames-S. El autor publica cuatro checkpoints intermedios: el profesor causal entrenado sobre latentes generados por Wan2.1-14B, el modelo destilado por consistencia, el modelo destilado por DMD y el generador final junto con el decodificador de píxeles y la red de refinamiento de KV. La innovación principal es la reducción del número de pasos de difusión a dos mediante destilación, lo que permite latencias interactivas sin sacrificar la estructura autorregresiva del vídeo.

## Capacidades

- Generación de vídeo texto-a-vídeo a 832 × 480 y 81 frames a 16 fps.
- Generación autorregresiva frame a frame con latencia interactiva (del orden de decenas de milisegundos por frame en la variante S; la variante L requiere múltiples GPU según el perfilado publicado con `--gpus 8`).
- Control de cámara fluido en el demo interactivo con LingBot (versión optimizada de LingBot 1.3B, 16 veces más rápida que el modelo oficial).
- Evaluación de calidad mediante VBench (Quality / Semantic / Total), reproducible con el script de evaluación del repositorio.
- Soporte de generación por lotes de prompts (script `generate_project_page.py` para los más de 20 vídeos de la página del proyecto).
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso ni procesamiento de audio.

## Casos de uso

- **Generación de vídeo publicitario y de producto**: el modelo produce clips de 81 frames a 480p a partir de un prompt textual, adecuado para prototipado rápido de storyboards y variaciones creativas antes de pasar a producción de mayor resolución.
- **Demostraciones interactivas de control de cámara**: el demo con LingBot permite controlar la cámara en tiempo real gracias a la baja latencia del pipeline, útil para aplicaciones de previsualización cinematográfica y entornos de realidad virtual.
- **Investigación en difusión autorregresiva**: los checkpoints intermedios publicados (profesor causal, destilación por consistencia, destilación DMD) permiten reproducir y estudiar el proceso de destilación de modelos de vídeo de gran tamaño.
- **Generación de vídeo en pipelines de CI/CD para medios**: la API de scripts (`scripts/generate.py`) permite integrar la generación de clips en flujos automatizados de creación de contenido, con semillas reproducibles (`--seed`).
- **Evaluación comparativa de modelos de vídeo**: el repositorio incluye scripts para reproducir las puntuaciones de VBench, lo que facilita la comparación con otros modelos texto-a-vídeo en las mismas condiciones.
- **Prototipado de efectos visuales**: la generación rápida de clips cortos permite iterar sobre prompts y semillas en cuestión de segundos, reduciendo el coste de exploración creativa frente a modelos de difusión de muchos pasos.

## Benchmarks y rendimiento

El repositorio menciona la reproducción de la Tabla 1 del paper con puntuaciones Quality / Semantic / Total de VBench, pero no se incluyen los valores numéricos en la información disponible.

| Benchmark | FastFrames-L | Notas |
|---|---|---|
| VBench Quality / Semantic / Total | no disponible | El paper referencia la Tabla 1; los valores no se incluyen en la model card |
| Latencia por frame (480p) | no disponible para L | Para FastFrames-S: 35,4 ms total (DiT 16,1 + 16,2 ms, KV 2,2 ms, decoder 0,9 ms) en 1 GPU |

No se han publicado resultados de benchmarks numéricos en la información disponible.

## Requisitos de hardware

- **VRAM estimada**: no disponible de forma explícita. El repositorio ocupa 173,5 GB, lo que sugiere que los pesos en precisión completa no caben en una GPU de consumo; se desconoce si existe una versión cuantizada.
- **GPU recomendadas**: el perfilado oficial de FastFrames-L se ejecuta con `--gpus 8`, lo que indica que requiere un nodo multi-GPU (previsiblemente A100 o H100 de 80 GB) para inferencia a 480p. Para FastFrames-S se documenta ejecución en 1 GPU.
- **Compatibilidad con GPU de consumo**: no confirmada para la variante L; la variante S se perfila en 1 GPU, pero no se especifica el modelo concreto.
- **Entorno**: Linux x86-64 con GPU NVIDIA y driver compatible con CUDA 12.8; instalación mediante `uv sync`.
- **Opciones de despliegue**: el repositorio proporciona scripts propios (`scripts/generate.py`, `evaluation/latency/benchmark.py`, `apps/lingbot/demo.py`) y un demo web en `http://localhost:8000`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI (son frameworks orientados a LLM, no a difusión de vídeo).
- **Latencia y throughput**: para FastFrames-S, 35,4 ms por frame a 480p en 1 GPU con KV cache completa. Para FastFrames-L no se publican cifras de latencia en la información disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Tipo | Resolución | Latencia | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| FastFrames-L | 14B | Difusión autorregresiva de 2 pasos | 480p, 81 frames | no disponible (perfilado con 8 GPU) | apple-amlr | Hugging Face (Renedffd/FastFrames-L) |
| FastFrames-S | 1,3B | Difusión autorregresiva de 2 pasos | 480p, 81 frames | 35,4 ms/frame en 1 GPU | apple-amlr | Hugging Face (apple/FastFrames-S) |
| Wan2.1-T2V-14B | 14B | Difusión texto-a-vídeo | 480p/720p según variante | no disponible | no disponible en esta ficha | Hugging Face (Wan-AI/Wan2.1-T2V-14B) |
| LingBot 1.3B (optimizado) | 1,3B | Modelo de control de cámara | no disponible | 16× más rápido que el oficial | CC BY-NC-SA 4.0 | Incluido en el repositorio FastFrames |

La comparativa se limita a los modelos citados en la model card; no se dispone de datos de benchmarks cruzados entre FastFrames-L y alternativas de la misma categoría en la información proporcionada.

## Limitaciones y advertencias

- **Licencia restrictiva**: los pesos se distribuyen bajo Apple Sample Code License (apple-amlr), que no es una licencia de código abierto estándar; es necesario revisar sus términos antes de cualquier uso comercial. Los componentes de LingBot están bajo CC BY-NC-SA 4.0, que prohíbe el uso comercial.
- **Resolución limitada**: la salida está fijada a 832 × 480 y 81 frames a 16 fps; no se documenta soporte para resoluciones superiores ni clips más largos.
- **Requisitos de hardware elevados**: el repositorio ocupa 173,5 GB y el perfilado de la variante L se realiza con 8 GPU, lo que limita su despliegue en entornos de consumo.
- **Riesgo de alucinación visual**: como modelo generativo de vídeo, puede producir artefactos, inconsistencias temporales o contenido que no se corresponde fielmente con el prompt; no se documentan mecanismos de mitigación.
- **Sesgos**: no se documenta ninguna evaluación de sesgos demográficos, culturales o de contenido en la model card.
- **Idiomas**: no se especifican los idiomas soportados para los prompts; el codificador de texto se hereda de Wan2.1 y no se detalla su cobertura lingüística.
- **Madurez**: el repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y fue creado y actualizado el mismo día (2026-11-19), lo que sugiere que se trata de una publicación reciente sin validación comunitaria.
- **Dependencia de terceros**: el pipeline depende de los pesos de Wan2.1 y de LingBot, cuyas licencias y disponibilidad pueden cambiar de forma independiente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Renedffd/FastFrames-L
- Modelo FastFrames-S: https://huggingface.co/apple/FastFrames-S
- Modelo FastFrames-L (oficial): https://huggingface.co/apple/FastFrames-L
- Página del proyecto: https://apple-aiml-research.github.io/ml-fastframes/
- Paper (arXiv): https://arxiv.org/abs/2611.23226
- Repositorio de código: https://github.com/apple-aiml-research/ml-fastframes
- Guía de instalación y checkpoints: https://github.com/apple-aiml-research/ml-fastframes/blob/main/docs/installation.md#checkpoints
- Guía de inferencia y perfilado: https://github.com/apple-aiml-research/ml-fastframes/blob/main/docs/inference.md#profiling
- Guía del demo con LingBot: https://github.com/apple-aiml-research/ml-fastframes/blob/main/docs/lingbot.md#interactive-demo-13b
- Guía de entrenamiento: https://github.com/apple-aiml-research/ml-fastframes/blob/main/docs/training.md
- Licencia Apple Sample Code: https://github.com/apple-aiml-research/ml-fastframes/blob/main/LICENSE
- Licencia LingBot: https://github.com/apple-aiml-research/ml-fastframes/blob/main/LICENSE_LINGBOT
- Agradecimientos: https://github.com/apple-aiml-research/ml-fastframes/blob/main/ACKNOWLEDGEMENTS
- Wan2.1: https://github.com/Wan-Video/Wan2.1
- Self-Forcing: https://github.com/guandeh17/Self-Forcing
- Causal Forcing++: https://github.com/thu-ml/Causal-Forcing
