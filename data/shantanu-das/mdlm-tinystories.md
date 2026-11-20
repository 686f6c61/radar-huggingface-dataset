# shantanu-das/mdlm-tinystories

## Resumen

`shantanu-das/mdlm-tinystories` es un par de modelos de lenguaje de escala reducida (31,1 M de parámetros no de embedding) publicados como material de referencia para comparar dos paradigmas de generación de texto: un transformer autorregresivo (AR) de estilo GPT y un modelo de difusión de texto con estado absorbente al estilo MDLM (Sahoo et al., 2024). Ambos se entrenaron bajo exactamente las mismas condiciones (lotes, optimizador, schedule, EMA, fp16) sobre el mismo corpus, TinyStoriesV2, lo que permite una comparación controlada entre ambos enfoques.

El interés del modelo no es su rendimiento absoluto, sino su valor metodológico: es una reproducción didáctica, escrita desde cero en PyTorch en un único notebook, que permite a investigadores y desarrolladores experimentar con difusión de texto enmascarada sin necesidad de infraestructura pesada. El repositorio incluye código de entrenamiento, evaluación y una demo Gradio que funciona en CPU.

La arquitectura es un transformer decoder-only con RoPE, RMSNorm, SwiGLU y embeddings atados, con una longitud de secuencia de 256 tokens y un vocabulario BPE a nivel de byte de 8192 tokens. El modelo solo soporta inglés y está entrenado exclusivamente sobre cuentos infantiles sintéticos, por lo que sus capacidades lingüísticas son muy limitadas fuera de ese dominio.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (AR) y difusión de texto enmascarada con estado absorbente (MDLM) |
| Parámetros totales | 31,1 M no de embedding (d=512, 10 capas, 8 cabezas) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | 256 tokens (longitud de secuencia de entrenamiento) |
| Tipos de cuantización | no disponible (pesos publicados en fp16) |
| Idiomas soportados | inglés |
| Licencia | no disponible |
| Formato de pesos | `.pt` (PyTorch, fp16, EMA) |
| Vocabulario | BPE a nivel de byte, 8192 tokens (`<eos>`=0, `<mask>`=1) |
| Dataset de entrenamiento | roneneldan/TinyStories (TinyStoriesV2, split GPT-4) |
| Tokens de entrenamiento | 590 M |
| Tamaño del repo | 0,1 GB |

## Arquitectura y entrenamiento

Ambos modelos comparten un backbone transformer decoder-only con dimensión oculta de 512, 10 capas, 8 cabezas de atención, RoPE, RMSNorm, SwiGLU y embeddings atados. El modelo AR es un GPT estándar entrenado con el objetivo de predicción del siguiente token. El modelo MDLM emplea difusión enmascarada con estado absorbente: los tokens se enmascaran de forma independiente y el modelo aprende a reconstruirlos, con un proceso de muestreo iterativo de 64 o 256 pasos que desenmascara progresivamente.

El entrenamiento se realizó sobre 590 M tokens de TinyStoriesV2 (split generado por GPT-4), con secuencia de 256 tokens, fp16, EMA, y un único seed por modelo. Ambos se entrenaron con lotes idénticos, el mismo optimizador y schedule, uno por GPU, en una configuración Kaggle T4 x2. El código completo (datos, modelo, entrenamiento difusión y AR, evaluación y demo) está en el notebook `mdlm.ipynb` del repositorio, escrito desde cero en PyTorch. Se incluyen los logs de pérdida de entrenamiento cada 100 pasos (`mdlm_log.json`, `ar_log.json`) y un `results.json` con todas las métricas de evaluación y muestras.

## Capacidades

- Generación de texto en inglés dentro del dominio de cuentos infantiles simples.
- Dos modos de generación: autorregresiva (token a token) y difusión enmascarada (desenmascarado iterativo en 64 o 256 pasos).
- Reproducción completa de entrenamiento y evaluación mediante notebook autocontenido.
- Demo interactiva con Gradio ejecutable en CPU (modo `demo`).
- No soporta tool calling ni function calling.
- No soporta razonamiento multi-paso ni comportamiento agéntico.
- No dispone de modo thinking, visión ni audio.
- Multilingüismo limitado al inglés; no se ha entrenado en otros idiomas.

## Casos de uso

- Investigación en difusión de texto: sirve como banco de pruebas controlado para comparar difusión enmascarada frente a generación autorregresiva con idéntico presupuesto de entrenamiento, permitiendo aislar el efecto del paradigma generativo.
- Docencia y formación: el notebook único con todo el pipeline (datos, modelo, entrenamiento, evaluación, demo) es adecuado para explicar paso a paso cómo se entrena un modelo de difusión de texto desde cero.
- Reproducción de resultados académicos: los pesos EMA, los logs de pérdida y el `results.json` permiten verificar las cifras publicadas en la model card (perplejidad de validación, perplejidad generativa con GPT-2 Large, entropía unigrama).
- Experimentación en CPU: la demo Gradio y los modelos de 31 M de parámetros caben en memoria de CPU, lo que facilita prototipado sin GPU.
- Estudio de muestreo iterativo: permite analizar el efecto del número de pasos de desenmascarado (64 frente a 256) sobre la calidad y la diversidad del texto generado.
- Generación de cuentos sintéticos simples en inglés para aumentar datasets de juguete o pruebas de pipelines de generación, siempre con revisión humana por la baja calidad esperable.

## Benchmarks y rendimiento

Datos publicados en la model card (una ejecución, un seed por modelo):

| Modelo / condición | Perplejidad de validación | Perplejidad generativa (GPT-2 Large) | Entropía unigrama |
|---|---|---|---|
| Cuentos reales de validación | no disponible | 7,6 | 4,11 |
| AR | 3,25 (exacta) | 10,6 | 4,14 |
| MDLM, 64 pasos | ≤ 5,77 (cota) | 34,6 | 4,24 |
| MDLM, 256 pasos | no disponible | 30,2 | 4,20 |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: muy baja; con 31,1 M de parámetros no de embedding y pesos fp16, el modelo ocupa del orden de decenas de MB, por lo que cabe holgadamente en cualquier GPU consumer.
- GPU recomendadas: cualquier GPU con al menos unos pocos GB de VRAM; el entrenamiento original se realizó en Kaggle T4 x2 (una GPU por modelo).
- Cabe en GPU consumer: sí, en cualquier RTX o equivalente; también funciona en CPU para la demo.
- Opciones de despliegue: carga directa con PyTorch mediante la clase `Transformer` del notebook y `torch.load`; demo Gradio en CPU. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles. El muestreo MDLM requiere 64 o 256 pasos de desenmascarado, lo que implica múltiples pasadas por el modelo por cada secuencia generada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| mdlm-tinystories (AR) | 31,1 M | 256 | Autorregresivo | no disponible | Hugging Face |
| mdlm-tinystories (MDLM) | 31,1 M | 256 | Difusión enmascarada | no disponible | Hugging Face |
| MDLM original (Sahoo et al., 2024) | no disponible en la información | no disponible | Difusión enmascarada | no disponible | no disponible |
| GPT-2 Large (usado como evaluador) | no disponible en la información | no disponible | Autorregresivo | no disponible | no disponible |

La comparación más directa es interna: el par AR/MDLM del propio repositorio, entrenado con idénticos recursos. No se dispone de datos de benchmarks frente a otros modelos de difusión de texto de tamaño comparable en la información proporcionada.

## Limitaciones y advertencias

- Entrenado exclusivamente sobre TinyStoriesV2, un corpus sintético de cuentos infantiles generado por GPT-4; el dominio y el registro lingüístico son extremadamente estrechos.
- Solo inglés; no hay evidencia de competencia en otros idiomas.
- Contexto de 256 tokens, insuficiente para la mayoría de aplicaciones reales.
- Resultados de una sola ejecución y un solo seed por modelo; la variabilidad entre semillas no se ha caracterizado.
- La perplejidad de validación del MDLM es una cota superior (≤ 5,77), no una medida exacta.
- Riesgo elevado de alucinación y de texto incoherente fuera del dominio de cuentos simples.
- Licencia no especificada: no se puede asumir permiso para uso comercial; conviene contactar con el autor antes de cualquier despliegue en producción.
- No hay información sobre sesgos demográficos o sociales más allá de los inherentes al corpus TinyStories.
- No apto para producción: es un artefacto de investigación y docencia, no un modelo de propósito general.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/shantanu-das/mdlm-tinystories
- Dataset TinyStories: https://huggingface.co/datasets/roneneldan/TinyStories
- Paper MDLM (Sahoo et al., 2024): no disponible en la información proporcionada
- Repositorio de código: incluido en el propio repo de Hugging Face (`mdlm.ipynb`)
- Demo: aplicación Gradio incluida en el notebook (modo `demo`)
- Blog o paper del autor: no disponible
