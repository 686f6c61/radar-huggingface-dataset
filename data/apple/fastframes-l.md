# apple/FastFrames-L

## Resumen

FastFrames-L es un modelo de generación de vídeo texto-a-vídeo (text-to-video) desarrollado por Apple, presentado como la variante grande (14B parámetros) de la familia FastFrames. Se construye mediante destilación a partir de Wan2.1-T2V-14B y se plantea como un modelo autorregresivo de difusión de vídeo en dos pasos, capaz de generar vídeo a 480p con latencia interactiva. El objetivo declarado es reducir drásticamente el coste computacional de la generación de vídeo manteniendo calidad, un cuello de botella habitual en pipelines de difusión tradicionales que requieren decenas de pasos de muestreo.

La relevancia del modelo reside en su enfoque de destilación en dos etapas (consistency distillation y DMD) combinado con un generador causal por fotogramas, lo que permite pasar de un modelo de difusión completo a un generador de dos pasos con decodificador de píxeles y red de refinamiento de KV. Apple publica además los checkpoints intermedios del proceso (profesor causal, modelo destilado por consistencia, modelo destilado por DMD y generador final), lo que facilita la reproducibilidad y el estudio del pipeline.

La información disponible sobre el modelo es la model card oficial en Hugging Face y el repositorio de GitHub asociado; no se han publicado aún resultados detallados de benchmarks ni el paper (marcado como "coming soon"). El modelo se distribuye bajo la licencia Apple AMLR, con componentes de terceros (LingBot) bajo CC BY-NC-SA 4.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo de difusión de vídeo autorregresivo en dos pasos, derivado de Wan2.1-T2V-14B mediante destilación causal (Causal Forcing++) |
| Parametros totales | 14B (según la model card y el nombre del modelo) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (genera 81 fotogramas a 16 fps) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | apple-amlr (Apple AMLR); componentes LingBot bajo CC BY-NC-SA 4.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

FastFrames-L es un modelo de difusión de vídeo autorregresivo que genera fotogramas de forma causal. Parte de Wan2.1-T2V-14B, que se destila primero en un modelo causal de dos pasos siguiendo la receta Causal Forcing++, y posteriormente se entrenan el decodificador de píxeles y la red de refinamiento de KV, de forma análoga a FastFrames-S. El pipeline incluye evaluación del DiT en dos pasos temporales (t=1000 y t=833), refinamiento de KV y decodificación de píxeles, lo que constituye la base de su baja latencia.

El repositorio publica todos los checkpoints intermedios: (1) un profesor causal entrenado sobre latentes generados por Wan2.1-T2V-14B, (2) el modelo destilado por consistencia, (3) el modelo destilado por DMD y (4) el generador final junto con el decodificador de píxeles y la red de refinamiento de KV. La model card no detalla el número de tokens de entrenamiento, la composición del dataset ni si se empleó RLHF o DPO; esa información figura como no disponible. La innovación técnica principal es la reducción a dos pasos de difusión con generación causal por fotogramas y latencia interactiva (se reportan 36 ms por fotograma para la variante S de 1.3B en una GPU).

## Capacidades

- Generación de vídeo a partir de texto (text-to-video) a resolución 832 × 480, 81 fotogramas a 16 fps.
- Generación autorregresiva causal por fotogramas, adecuada para streaming o generación incremental.
- Generación en dos pasos de difusión, con latencia interactiva.
- Control de cámara condicionado (a través de la integración con LingBot 1.3B optimizado, según la model card).
- Integración con el pipeline de evaluación VBench para medir calidad, semántica y puntuación total.
- Reproducibilidad mediante checkpoints intermedios de destilación.
- No se documentan capacidades de tool calling, agentes, razonamiento multilingüe ni visión más allá de la generación de vídeo.

## Casos de uso

- Generación de vídeo publicitaria y de marketing: el modelo puede producir clips de 480p a partir de descripciones textuales con latencia baja, lo que permite iterar prompts en tiempo casi real durante sesiones creativas.
- Prototipado rápido de storyboards: equipos de preproducción pueden generar secuencias de 81 fotogramas a 16 fps para validar ideas visuales antes de rodar.
- Creación de contenido para redes sociales: clips cortos en 480p generados con dos pasos de difusión reducen el coste frente a pipelines de difusión completos.
- Investigación en destilación de modelos de difusión: la publicación de checkpoints intermedios permite estudiar consistency distillation, DMD y Causal Forcing++ sobre un modelo base de 14B.
- Evaluación comparativa de generación de vídeo: el pipeline VBench incluido facilita reproducir métricas de calidad y semántica frente a otros modelos.
- Control de cámara interactivo: combinado con LingBot 1.3B optimizado, permite demos interactivas con control de cámara condicionado en tiempo real.
- Generación de vídeo en entornos con recursos limitados: la variante S de 1.3B y la arquitectura de dos pasos permiten desplegar generación de vídeo en GPUs de gama alta consumer, aunque la variante L de 14B requiere hardware más potente.

## Benchmarks y rendimiento

La model card menciona la reproducción de la Tabla 1 con puntuaciones Quality / Semantic / Total de VBench, pero no incluye los valores numéricos en la información proporcionada. Se incluye únicamente el perfilado de latencia de FastFrames-S (1.3B, 1 GPU, 480p, KV cache completo):

| Componente | Llamadas | Latencia por llamada | Latencia total |
|---|---:|---:|---:|
| Evaluación DiT, t=1000 | 1 | 16,1 ms | 16,1 ms |
| Evaluación DiT, t=833 | 1 | 16,2 ms | 16,2 ms |
| Refinamiento KV | 1 | 2,2 ms | 2,2 ms |
| Decodificador de píxeles | 1 | 0,9 ms | 0,9 ms |
| **Total** | | | **35,4 ms** (paper: 36 ms) |

No se han publicado resultados de benchmarks de calidad (VBench, MMLU, HumanEval, GSM8K u otros) en la información disponible para FastFrames-L.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; el repo ocupa 173,5 GB en safetensors, lo que sugiere pesos en precisión alta (probablemente bf16/fp16) y requiere múltiples GPUs para la variante L.
- GPU recomendadas: la model card menciona Linux x86-64 con GPU NVIDIA y driver compatible con CUDA 12.8; el benchmark de latencia para FastFrames-L se ejecuta con `--gpus 8`, lo que indica despliegue multi-GPU.
- Cabe en GPU consumer: no disponible para la variante L; la variante S (1.3B) se perfila en 1 GPU a 480p.
- Opciones de despliegue: el repositorio oficial usa `uv` y scripts propios (`scripts/generate.py`, `evaluation/latency/benchmark.py`, `apps/lingbot/demo.py`); no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: para FastFrames-S se reportan 35,4 ms por fotograma en 1 GPU a 480p; para FastFrames-L no se proporcionan cifras concretas en la información disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto / salida | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| FastFrames-L | 14B | 81 fotogramas, 832×480, 16 fps | Difusión autorregresiva en dos pasos, destilada de Wan2.1-14B | apple-amlr | Hugging Face (apple/FastFrames-L) |
| FastFrames-S | 1,3B | 81 fotogramas, 832×480, 16 fps | Difusión autorregresiva en dos pasos, basada en Causal Forcing++ | apple-amlr | Hugging Face (apple/FastFrames-S) |
| Wan2.1-T2V-14B | 14B | no disponible en la información | Difusión texto-a-vídeo completa (modelo base) | no disponible en la información | Hugging Face (Wan-AI/Wan2.1-T2V-14B) |
| LingBot 1.3B (optimizado) | 1,3B | no disponible | Modelo de control de cámara, 16× más rápido que el oficial | CC BY-NC-SA 4.0 | Incluido en el repo de FastFrames |

No se dispone de datos de rendimiento comparativo (VBench u otras métricas) entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- La información pública es limitada: no hay paper publicado (arXiv "coming soon") ni resultados numéricos de benchmarks de calidad.
- No se documentan sesgos conocidos, pero al derivar de Wan2.1-14B y entrenarse sobre datasets no especificados, puede heredar sesgos del modelo base y de los datos de entrenamiento.
- Riesgo de alucinación visual: como todo modelo generativo de vídeo, puede producir contenido incoherente o no fiel al prompt.
- Resolución limitada a 480p (832 × 480) y clips cortos de 81 fotogramas a 16 fps; no apto para producción de vídeo en alta resolución sin postprocesado.
- Idiomas soportados no documentados; la generación es texto-a-vídeo, por lo que el soporte multilingüe de prompts no está especificado.
- Licencia Apple AMLR: es necesario revisar los términos para uso comercial; los componentes LingBot están bajo CC BY-NC-SA 4.0, que restringe el uso comercial.
- Requiere hardware NVIDIA con CUDA 12.8 y, para la variante L, despliegue multi-GPU (8 GPUs en el benchmark oficial), lo que limita su uso en entornos pequeños.
- El repositorio ocupa 173,5 GB, con implicaciones de almacenamiento y transferencia.
- No se documentan integraciones con frameworks de serving estándar (vLLM, TGI, Ollama), lo que puede complicar el despliegue en producción.

## Enlaces

- Hugging Face: https://huggingface.co/apple/FastFrames-L
- FastFrames-S en Hugging Face: https://huggingface.co/apple/FastFrames-S
- Página del proyecto: https://apple-aiml-research.github.io/ml-fastframes/
- Repositorio GitHub: https://github.com/apple-aiml-research/ml-fastframes
- Guía de instalación y checkpoints: https://github.com/apple-aiml-research/ml-fastframes/blob/main/docs/installation.md#checkpoints
- Guía de inferencia y perfilado: https://github.com/apple-aiml-research/ml-fastframes/blob/main/docs/inference.md
- Guía de entrenamiento: https://github.com/apple-aiml-research/ml-fastframes/blob/main/docs/training.md
- Demo interactiva con LingBot: https://github.com/apple-aiml-research/ml-fastframes/blob/main/docs/lingbot.md
- Licencia Apple Sample Code: https://github.com/apple-aiml-research/ml-fastframes/blob/main/LICENSE
- Licencia LingBot (CC BY-NC-SA 4.0): https://github.com/apple-aiml-research/ml-fastframes/blob/main/LICENSE_LINGBOT
- Agradecimientos y código de terceros: https://github.com/apple-aiml-research/ml-fastframes/blob/main/ACKNOWLEDGEMENTS
- Wan2.1: https://github.com/Wan-Video/Wan2.1
- Self-Forcing: https://github.com/guandeh17/Self-Forcing
- Causal Forcing++: https://github.com/thu-ml/Causal-Forcing
