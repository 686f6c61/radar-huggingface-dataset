# sanmu29/TRACE

## Resumen

TRACE es un detector de vídeo generado por IA desarrollado por el usuario sanmu29. No se trata de un modelo generativo, sino de un clasificador binario real/falso construido sobre un backbone de difusión congelado: concretamente el experto de bajo ruido de Wan2.2-T2V-A14B. La innovación principal consiste en reutilizar el campo de velocidades (velocity) que predice el DiT en distintos niveles de ruido como representación interna del vídeo, en lugar de entrenar un extractor de características desde cero.

El flujo de inferencia muestrea 9 fotogramas del vídeo de entrada, los codifica con el VAE de Wan2.1 y consulta al DiT la velocidad predicha en los pasos de ruido 0, 25, 50, 75 y 100. Cada fotograma se agrega mediante pooling global, se concatenan las diferencias entre fotogramas adyacentes y una cabeza de clasificación ligera emite la decisión final. El backbone permanece completamente congelado durante todo el proceso: solo se entrena la cabeza.

El modelo se entrena con vídeos reales y clips texto-a-vídeo de Open-Sora procedentes del dataset AIGVDBench, y se evalúa contra todos los generadores incluidos en dicho benchmark. Es relevante porque propone una vía de detección de deepfakes de vídeo que aprovecha el conocimiento sobre dinámica temporal ya codificado en modelos de difusión de vídeo de gran escala, sin necesidad de reentrenar el backbone. El repositorio de Hugging Face es únicamente el código (0.0 GB); los pesos y los vídeos se descargan por separado.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Detector sobre DiT de difusión congelado (Wan2.2-T2V-A14B, experto de bajo ruido) + VAE Wan2.1 + cabeza de clasificación ligera |
| Parámetros totales | No disponible (el backbone Wan2.2-T2V-A14B ronda los 27 GB de pesos según la model card; el recuento exacto de parámetros no se especifica) |
| Parámetros activos | No disponible (Wan2.2 es MoE con expertos de alto y bajo ruido; TRACE solo usa el de bajo ruido) |
| Longitud de contexto | No aplica (entrada de 9 fotogramas por vídeo) |
| Tipos de cuantización | No disponible (se describe carga en bf16 para el encoder T5; no se documentan cuantizaciones del detector) |
| Idiomas soportados | No disponible (el prompt de texto está fijado a `this is a video.`) |
| Licencia | No disponible |
| Formato de pesos | Checkpoint PyTorch (`outputs/ckpt/last.pt`); backbone en safetensors (`diffusion_pytorch_model*.safetensors`) y `Wan2.1_VAE.pth` |

## Arquitectura y entrenamiento

TRACE es un pipeline de clasificación en dos etapas. La primera etapa es un extractor de características congelado compuesto por el VAE de Wan2.1 (codificación de fotogramas) y el experto de bajo ruido del DiT de Wan2.2-T2V-A14B (predicción de velocidad). Para cada vídeo se muestrean 9 fotogramas, se codifican con el VAE y se evalúa la velocidad del DiT en cinco niveles de ruido (0, 25, 50, 75 y 100). Cada fotograma se agrega con pooling global y las diferencias entre fotogramas adyacentes se concatenan, generando una representación que captura tanto contenido espacial como dinámica temporal. Sobre esta representación actúa una cabeza de clasificación pequeña que produce la decisión real/fake. El backbone nunca se actualiza.

El entrenamiento utiliza vídeos reales y clips texto-a-vídeo generados con Open-Sora, todos extraídos del dataset AIGVDBench. La configuración publicada emplea 4 GPUs con batch size 4 por GPU, y el entrenamiento produce el checkpoint `outputs/ckpt/last.pt`. La evaluación puntúa cada generador del dataset, tomando por defecto 100 vídeos de cada subconjunto. El prompt de texto está fijado a `this is a video.` y se cachea en `~/.cache/trace/prompt_this_is_a_video.pt` para evitar mantener el encoder umT5 en memoria de GPU. No se documentan detalles sobre RLHF, DPO ni composición exacta del dataset de entrenamiento más allá de las cifras de tamaño (unos 62 GB de vídeo real y 735 MB de clips Open-Sora).

## Capacidades

- Detección binaria de vídeo real frente a vídeo generado por IA.
- Análisis de dinámica temporal mediante diferencias entre fotogramas adyacentes.
- Evaluación multi-generador: el pipeline de test puntúa cada subconjunto de generadores de AIGVDBench.
- Extracción de características a partir de un backbone de difusión de vídeo congelado, sin reentrenamiento del mismo.
- Soporte de ejecución multi-GPU con `NPROC` y `BATCH_SIZE` configurables.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso, visión general, audio ni modo thinking.
- Capacidades multilingües: no disponibles (prompt fijo en inglés).

## Casos de uso

- Moderación de contenido en plataformas de vídeo: TRACE puede clasificar vídeos subidos por usuarios como reales o sintéticos antes de su publicación, usando los 9 fotogramas muestreados y la firma de velocidad del DiT para detectar artefactos de generación.
- Verificación de autenticidad en periodismo y fact-checking: ante un vídeo viral sospechoso, el detector permite obtener una señal real/fake basada en la dinámica temporal, útil como primera criba antes de la verificación humana.
- Detección de deepfakes en entornos forenses: la representación basada en diferencias entre fotogramas adyacentes captura inconsistencias temporales típicas de generadores texto-a-vídeo, adecuada para análisis pericial.
- Investigación en detección de contenido sintético: el diseño con backbone congelado permite evaluar la utilidad de modelos de difusión de vídeo como extractores de características sin coste de reentrenamiento.
- Auditoría de datasets de vídeo: el pipeline de test por generador de AIGVDBench permite medir la tasa de detección frente a cada modelo generativo y detectar qué generadores escapan al detector.
- Control de calidad en pipelines de generación de vídeo: integrado como filtro posterior, permite descartar clips generados que no cumplan criterios de realismo o que se desvíen del dominio esperado.
- Benchmarking de generadores: al puntuar cada subconjunto del dataset, sirve para comparar la "detectabilidad" de distintos generadores texto-a-vídeo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica que las métricas de test se escriben en `outputs/test100/metrics.csv`, pero no se incluyen los valores numéricos.

## Requisitos de hardware

- VRAM estimada: cada proceso mantiene el DiT de bajo ruido completo de Wan2.2 en memoria, unos 27 GB de pesos más activaciones; se recomienda dejar al menos 32 GB libres por GPU.
- GPUs recomendadas: la configuración de entrenamiento publicada usa 4 GPUs con batch size 4 por GPU; se requiere hardware con al menos 32 GB de VRAM por GPU (A100 40/80 GB, H100, L40S, etc.).
- GPU de consumo: no cabe en GPUs de consumo típicas (RTX 4090 con 24 GB queda por debajo de los 32 GB recomendados por proceso).
- Despliegue: entorno conda `diff` con Python 3.12, PyTorch 2.14.0+cu130, DiffSynth-Studio en el commit `fdad57bd`, transformers 5.22.2, accelerate 1.15.0 y safetensors 0.8.0. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI (no aplica a este tipo de modelo).
- Almacenamiento: el dataset completo AIGVDBench ocupa unos 353 GB; el subconjunto de entrenamiento ronda los 62 GB de vídeo real más 735 MB de Open-Sora.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye comparaciones con otros detectores de vídeo generado por IA ni con modelos de la misma categoría.

## Limitaciones y advertencias

- El repositorio de Hugging Face contiene solo código (0.0 GB); los pesos y el dataset deben descargarse por separado, lo que añade fricción al despliegue.
- Requiere descargar el backbone Wan2.2-T2V-A14B (experto de bajo ruido, VAE y encoder umT5) además del checkpoint del detector.
- El prompt de texto está fijado a `this is a video.`, lo que limita la adaptación a dominios o idiomas distintos sin cambios en el código.
- El detector se entrena y evalúa únicamente sobre AIGVDBench (vídeos reales y Open-Sora); su generalización a otros generadores no está documentada.
- El backbone congelado implica que la detección depende de sesgos y capacidades del DiT de Wan2.2; generadores muy distintos podrían escapar al detector.
- No se documentan sesgos demográficos, geográficos o culturales del dataset de entrenamiento.
- Riesgo de alucinación: no aplica en sentido generativo, pero sí existe riesgo de falsos positivos y falsos negativos en la clasificación; no se publican tasas de error.
- Licencia no disponible: no puede confirmarse el uso comercial del código, los pesos ni el backbone Wan2.2 subyacente.
- El entrenamiento requiere 4 GPUs con al menos 32 GB de VRAM cada una, lo que limita la reproducibilidad en entornos modestos.
- La versión de PyTorch (2.14.0+cu130) y el commit concreto de DiffSynth-Studio (`fdad57bd`) están fijados, lo que puede complicar el mantenimiento a largo plazo.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/sanmu29/TRACE
- Dataset AIGVDBench: https://huggingface.co/datasets/AIGVDBench/AIGVDBench
- Backbone Wan2.2-T2V-A14B: https://huggingface.co/Wan-AI/Wan2.2-T2V-A14B
- DiffSynth-Studio: https://github.com/modelscope/DiffSynth-Studio
