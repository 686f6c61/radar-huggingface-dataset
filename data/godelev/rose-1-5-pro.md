# GODELEV/Rose-1.5-Pro

## Resumen

Rose-1.5-Pro es un modelo lingüístico compacto desarrollado por GODELEV (atribuido a Mr Munk en la model card), construido sobre la arquitectura propia Rose X1.5. Con aproximadamente 149 millones de parámetros y entrenado con unos 70.000 millones de tokens, el modelo se enmarca en una serie experimental que explora cómo las decisiones de diseño —atención agrupada, normalización QK, refresh gates— afectan al rendimiento de modelos pequeños.

El modelo resuelve el problema de ofrecer capacidades de generación de texto básicas (razonamiento de sentido común, comprensión científica, tareas aritméticas estructuradas) con un coste de cómputo mínimo, siendo viable incluso en hardware de consumo. Su relevancia es principalmente de investigación: sirve como punto de datos para estudiar el escalado de arquitecturas alternativas a los transformers convencionales en la gama de parámetros reducidos.

No es un modelo de producción para tareas exigentes: su ventana de contexto de 2.048 tokens y sus puntuaciones moderadas en benchmarks (Intelligence Index de 28,27) lo sitúan como herramienta educativa y experimental. Se distribuye bajo licencia Apache 2.0 en formato safetensors, con código personalizado (custom_code) necesario para su ejecución.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Rose X1.5 (causal LM con GQA, QK-norm, refresh gates) |
| Parametros totales | 148.826.240 (148,8 M) |
| Parametros activos | no disponible (no se indica si es MoE; todo apunta a arquitectura densa) |
| Longitud de contexto | 2.048 tokens |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | Inglés |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (repo de 0,6 GB) |

## Arquitectura y entrenamiento

Rose-1.5-Pro emplea la arquitectura Rose X1.5, un modelo causal de tipo transformer con 30 capas, tamaño oculto de 640, 10 cabezas de atención y 5 cabezas clave-valor (GQA, grouped-query attention), con dimensión de cabeza de 64 y tamaño intermedio de 1.536. Entre las innovaciones destacables figuran la normalización QK (QK-norm), el mecanismo XSA, activaciones SwiGLU con SiLU, normalización RMSNorm, codificación posicional RoPE y refresh gates en las capas 10 y 20, un mecanismo que sugiere refresco periódico de estados de atención o memoria en puntos concretos de la red.

El entrenamiento utilizó aproximadamente 70.000 millones de tokens procedentes de una mezcla de datasets públicos: Fineweb-Edu y DCLM-Baseline-1.0 (corpus web educativo y curado), Cosmopedia (datos sintéticos educativos de HuggingFace), Arithmark-3.0 (tareas aritméticas), NPset-2-Python-Edu (Python educativo) y BananaMind-Base-Bench-1.1. No hay información disponible sobre procesos posteriores de alineación (SFT, RLHF o DPO), por lo que todo apunta a un modelo base preentrenado. La ventana de contexto de 2.048 tokens es una decisión deliberada para reducir el coste de entrenamiento.

## Capacidades

- Generación de texto en inglés con comprensión de lenguaje general (evaluada vía HellaSwag y PIQA)
- Razonamiento de sentido común y respuesta a preguntas de opción múltiple (ARC-Easy/Challenge)
- Conocimiento científico básico a nivel de preguntas tipo examen
- Tareas aritméticas y numéricas estructuradas (benchmarks ArithMark 2 y 3)
- Exposición a código Python educativo durante el preentrenamiento (dataset NPset-2-Python-Edu), sin datos de evaluación de código
- No hay información disponible sobre soporte de tool calling, function calling, agentes, capacidades multimodales (visión o audio) ni modo de razonamiento extendido

## Casos de uso

- Investigación en arquitecturas de modelos pequeños: permite estudiar el efecto de refresh gates, QK-norm y GQA en un modelo de 149 M de parámetros, con entrenamiento completo documentado y pesos abiertos
- Educación y docencia sobre LLM: su tamaño reducido permite ejecutarlo y modificarlo en portátiles, ideal para prácticas de fine-tuning y análisis de activaciones en cursos de procesamiento de lenguaje natural
- Fine-tuning en hardware limitado: con 149 M de parámetros, puede ajustarse por dominio (clasificación, extracción) en una única GPU de consumo sin técnicas de LoRA obligatorias
- Generación de texto sencilla en inglés: resúmenes cortos, continuación de texto y respuestas a preguntas básicas dentro de su ventana de 2.048 tokens
- Experimentación con benchmarks de sentido común: su evaluación documentada (HellaSwag, ARC, PIQA) lo hace útil como baseline reproducible para comparar nuevos métodos de entrenamiento
- Prototipado de pipelines ligeros: integración en aplicaciones donde la latencia y el consumo de memoria importan más que la calidad máxima, por ejemplo en dispositivos edge o servidores sin GPU dedicada

## Benchmarks y rendimiento

Resultados publicados en la model card del autor:

| Benchmark | Puntuación |
|---|---:|
| HellaSwag | 43,92 % |
| ARC-Easy | 58,29 % |
| ARC-Challenge | 30,72 % |
| ARC combinado | 44,50 % |
| PIQA | 69,48 % |
| ArithMark-3 | 40,00 % |
| ArithMark-2 | 34,52 % |
| Intelligence Index | 28,27 |

El Intelligence Index agrega varios benchmarks en una puntuación normalizada; es comparable solo con modelos evaluados con la misma metodología. No se han publicado comparaciones directas con otros modelos en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el repo pesa 0,6 GB en safetensors (pesos probablemente en fp16/bf16 o similar); con overhead de activaciones y KV cache, entre 1 y 2 GB de VRAM o RAM son suficientes
- GPU recomendadas: cualquier GPU moderna; no se requiere GPU dedicada. Compatible con GPUs de consumo de gama baja (GTX 1650, RTX 3050) e incluso ejecución en CPU
- Cabe con holgura en GPUs de consumo: cualquier tarjeta con 4 GB de VRAM o más; también ejecutable íntegramente en CPU dada la cuantía de parámetros
- Opciones de despliegue: al usar custom_code, la vía principal es transformers de HuggingFace. No hay información disponible sobre soporte verificado en vLLM, llama.cpp, Ollama o TGI; la arquitectura personalizada probablemente requiera adaptación para estos runtimes
- Latencia y throughput estimados: no disponible; por su tamaño, se espera inferencia rápida incluso en CPU

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Rose-1.5-Pro | 148,8 M | 2.048 | Apache 2.0 | Arquitectura custom, Intelligence Index 28,27 |
| Qwen2.5-0.5B | ~494 M | 32.768 | Apache 2.0 | Modelo denso maduro, multilingüe, benchmarks públicos amplios |
| SmolLM2-135M | 135 M | 2.048 | Apache 2.0 | Tamaño casi idéntico, entrenado por HuggingFace con ~2T tokens, benchmarks comparables en gama |
| Pythia-160M | 162 M | 2.048 | Apache 2.0 | Modelo de investigación de EleutherAI, muy usado como baseline |

Rose-1.5-Pro compite directamente con SmolLM2-135M y Pythia-160M en tamaño, aunque su mezcla de entrenamiento (~70B tokens) es considerablemente menor que la de SmolLM2. Frente a Qwen2.5-0.5B ofrece un footprint mucho menor a costa de capacidad y contexto.

## Limitaciones y advertencias

- Ventana de contexto de solo 2.048 tokens, insuficiente para documentos largos, RAG con pasajes extensos o conversaciones multi-turno profundas
- Entrenado únicamente en inglés; no apto para tareas en castellano u otros idiomas sin fine-tuning
- Puntuaciones de benchmark moderadas (ARC-Challenge 30,72 %, ArithMark-2 34,52 %): la fiabilidad en razonamiento y aritmética es limitada, con alto riesgo de respuestas incorrectas
- Sin información sobre alineación (RLHF/DPO): al ser aparentemente un modelo base, puede generar texto sin filtrar y con menor utilidad instruccional
- Riesgo de alucinación elevado, propio de modelos pequeños preentrenados sin ajuste instruccional
- Uso de custom_code: ejecutar código del repositorio implica revisar su implementación antes de producción; además, puede limitar la compatibilidad con runtimes optimizados
- La puntuación de Intelligence Index solo es comparable dentro de su propia metodología de evaluación
- Licencia Apache 2.0 sin restricciones comerciales relevantes, aunque conviene verificar el código adjunto y los datasets de entrenamiento

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/GODELEV/Rose-1.5-Pro
- Datasets de entrenamiento:
  - https://huggingface.co/datasets/HuggingFaceFW/fineweb-edu
  - https://huggingface.co/datasets/mlfoundations/dclm-baseline-1.0
  - https://huggingface.co/datasets/HuggingFaceTB/cosmopedia
  - https://huggingface.co/datasets/AxiomicLabs/Arithmark-3.0
  - https://huggingface.co/datasets/AxiomicLabs/NPset-2-Python-Edu
  - https://huggingface.co/datasets/BananaMind/BananaMind-Base-Bench-1.1
