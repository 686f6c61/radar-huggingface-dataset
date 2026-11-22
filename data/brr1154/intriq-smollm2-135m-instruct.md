# BRR1154/INTRIQ-SmolLM2-135M-Instruct

## Resumen

INTRIQ-SmolLM2-135M-Instruct es un modelo de lenguaje de 134.515.008 parámetros derivado de HuggingFaceTB/SmolLM2-135M-Instruct mediante una técnica que el autor denomina "edición quirúrgica de pesos" (surgical weight editing). El modelo mantiene la arquitectura original de SmolLM2 (transformer decoder-only de 30 capas, dimensión 576, 9 cabezas de atención) y aplica modificaciones dirigidas sobre 12 tensores causales en capas intermedias y tardías (14, 16, 18, 20, 22, 24, 26, 28 y 29) con el objetivo declarado de reforzar el seguimiento de instrucciones en flujos de ingeniería multi-turno y la generación de código Python científico.

El desarrollador, BRR1154, justifica la edición mediante análisis de teoría de matrices aleatorias (RMT) con WeightWatcher, midiendo el exponente de cola pesada alpha del espectro de valores singulares. El modelo se presenta como una variante "calibrada" del base, con un alpha global de 6,4121 frente al 6,4079 del modelo original, y sin colapso espectral declarado en ninguna de las 212 matrices evaluadas. La licencia es Apache 2.0 y el único idioma declarado es el inglés.

Su relevancia práctica es limitada: se trata de un modelo ultracompacto de 135M parámetros, pensado para entornos con restricciones severas de cómputo, prototipado rápido y experimentación con técnicas de edición de pesos. Los propios benchmarks publicados por el autor muestran un rendimiento cercano al azar en tareas de razonamiento (ARC-Challenge 26%, WinoGrande 52%) y una puntuación de 42,17/100 en comprensión de arquitecturas de repositorios reales, lo que sitúa al modelo en la categoría de experimento metodológico más que de herramienta de producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Llama/SmolLM2): 30 capas, d_model=576, d_intermediate=1536, 9 cabezas de atención |
| Parametros totales | 134.515.008 |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (pesos publicados en safetensors; el ejemplo de inferencia usa float32) |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería transformers) |

## Arquitectura y entrenamiento

El modelo parte de SmolLM2-135M-Instruct, un transformer decoder-only con 30 capas, dimensión de modelo 576, dimensión intermedia 1536 y 9 cabezas de atención. Sobre esa base, el autor aplica una edición de pesos dirigida a 12 tensores causales distribuidos en las capas 14, 16, 18, 20, 22, 24, 26, 28 y 29, con el objetivo declarado de corregir la "amnesia conversacional" y reforzar el razonamiento científico sin degradar las matrices. No se especifican en la información disponible los datos de entrenamiento, el número de tokens, la composición del dataset ni si hubo fases de RLHF o DPO adicionales; la modificación es post-entrenamiento sobre los pesos del modelo base.

La innovación técnica declarada es la validación del proceso de edición mediante teoría de matrices aleatorias (WeightWatcher). El autor ajusta la densidad espectral empírica (ESD) a una ley de potencias rho(lambda) ~ lambda^(-alpha) y reporta un alpha medio global de 6,4079 en el modelo base y 6,4121 tras la calibración, dentro del régimen de cola pesada considerado óptimo (2,0 <= alpha <= 6,0). Afirma cero colapsos espectrales en las 212 matrices evaluadas y un alpha >= 4,11 en todas las matrices editadas. También declara 5 de 5 aserciones heurísticas superadas en Promptfoo sobre prompts con palabras clave estructurales.

## Capacidades

- Generación de texto conversacional multi-turno en inglés, con especial énfasis declarado en mantener coherencia entre turnos de una conversación.
- Generación de código Python científico y matemático, incluyendo funciones con type hints y operaciones vectorizadas con NumPy.
- Seguimiento de instrucciones estructuradas para flujos de trabajo de ingeniería (workflows paso a paso).
- Razonamiento básico de preguntas de opción múltiple sobre ciencia elemental (ARC-Easy).
- Soporte de plantilla de chat mediante `apply_chat_template` de transformers.
- No se declara soporte de tool calling ni function calling en la información disponible.
- No se declara soporte de agentes ni razonamiento multi-paso autónomo.
- No se declara capacidad de visión, audio ni modo de pensamiento (thinking).
- Capacidad multilingüe limitada al inglés según el campo `language` de la model card.

## Casos de uso

- Prototipado de asistentes conversacionales en inglés con recursos mínimos: el modelo cabe en cualquier GPU consumer e incluso puede ejecutarse en CPU en float32, lo que permite validar flujos de diálogo multi-turno antes de escalar a modelos mayores.
- Generación de utilidades Python para pipelines de datos científicos: el modelo está ajustado para producir funciones con type hints y operaciones NumPy vectorizadas, como el cálculo de Z-score móvil sobre arrays 1D, útil para scripts de análisis de señales biosanitarias.
- Docencia y demostración de técnicas de edición de pesos: sirve como caso de estudio reproducible de modificación post-entrenamiento validada con WeightWatcher y teoría de matrices aleatorias.
- Evaluación comparativa de pipelines de evaluación: el modelo incluye configuración de Promptfoo y resultados de lm-eval v0.4.13, lo que facilita integrarlo como baseline en suites de test de instrucciones.
- Generación de borradores de código en entornos air-gapped: al ser un modelo de 0,5 GB de repo y licencia Apache 2.0, puede desplegarse localmente sin conexión para autocompletar fragmentos de código acotados.
- Experimentación con decodificación determinista: el ejemplo oficial usa `do_sample=False` con `repetition_penalty=1.15`, adecuado para tareas donde se busca reproducibilidad en la salida.
- Filtrado y clasificación ligera de texto en inglés: con 135M parámetros puede emplearse para tareas de etiquetado simple siempre que no se requiera razonamiento factual profundo.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (lm-eval v0.4.13 sobre CPU, 50 muestras por tarea, métricas no verificadas):

| Benchmark | Tarea | Muestras | Accuracy | Accuracy normalizada |
|---|---|---|---|---|
| ARC-Easy | QA de ciencia elemental | 50 | 50,0% | 44,0% |
| ARC-Challenge | Deducción científica multi-paso | 50 | 26,0% | 26,0% |
| HellaSwag | Continuación situacional | 50 | 44,0% | 44,0% |
| OpenBookQA | Hechos open-book multi-paso | 50 | 16,0% | 38,0% |
| WinoGrande | Resolución de correferencia | 50 | 52,0% | 52,0% |

Métricas adicionales reportadas por el autor:

| Evaluación | Resultado |
|---|---|
| Comprensión de arquitectura de repositorios reales | 42,17 / 100 |
| Test de ambigüedad y clarificación | 0,0 / 8,0 (0%) |
| Promptfoo (aserciones heurísticas) | 5 / 5 superadas |
| Open LLM Leaderboard | Pendiente (status: pending) |

El propio autor señala que ARC-Challenge (26%) está en el entorno del azar para MCQ de cuatro opciones (25%) y que WinoGrande (52%) está cerca del baseline binario del 50%. La puntuación de 0% en el test de ambigüedad indica que el modelo emite completaciones de código en lugar de solicitar aclaraciones cuando falta información.

## Requisitos de hardware

- VRAM estimada para inferencia en float32: aproximadamente 540 MB solo para pesos (134,5M parámetros x 4 bytes), más overhead de activaciones y KV cache.
- VRAM estimada en float16/bfloat16: aproximadamente 270 MB para pesos.
- Cabe holgadamente en cualquier GPU consumer: RTX 3060, RTX 4060, RTX 4090, e incluso en GPUs integradas o en CPU.
- GPU de datacenter (A100, H100) no necesarias; el modelo está sobredimensionado para ese hardware.
- Opciones de despliegue: transformers (método oficial documentado), text-generation-inference (tag `text-generation-inference` presente en el repo) y endpoints compatibles (tag `endpoints_compatible`). No se confirma soporte de llama.cpp, Ollama, vLLM ni TGI en la información disponible más allá de los tags.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Idiomas | Notas |
|---|---|---|---|---|---|
| INTRIQ-SmolLM2-135M-Instruct | 134,5M | No disponible | Apache 2.0 | en | Edición de pesos validada con RMT; benchmarks cercanos al azar en razonamiento |
| HuggingFaceTB/SmolLM2-135M-Instruct (base) | 135M | 8.192 tokens (según ficha pública del base) | Apache 2.0 | en | Modelo de referencia; el autor reporta rendimiento similar en ARC-Easy |
| SmolLM2-360M-Instruct | 360M | 8.192 tokens (según ficha pública) | Apache 2.0 | en | Mayor capacidad de razonamiento a costa de más cómputo |
| Qwen2.5-0.5B-Instruct | 500M | 32.768 tokens (según ficha pública) | Apache 2.0 | multilingüe | Alternativa compacta con mejor rendimiento general y soporte multilingüe |

La comparación con el modelo base es la más directa: el autor indica que ARC-Easy "iguala el baseline de SmolLM2", y que la actualización de pesos de una sola capa produjo "delta neto cero" en razonamiento a nivel de repositorio. Para los modelos alternativos, los datos de contexto y licencia provienen de sus fichas públicas y no de la información de esta ficha.

## Limitaciones y advertencias

- Rendimiento cercano al azar en tareas de razonamiento: ARC-Challenge 26% frente a un baseline de 25% en MCQ de cuatro opciones, y WinoGrande 52% frente a un baseline binario del 50%.
- Baja recall factual en zero-shot: OpenBookQA con 16% de accuracy bruta.
- Fallo sistemático en detección de ambigüedad: 0% en el test de clarificación; el modelo genera código en lugar de pedir información faltante, lo que es peligroso en flujos de producción automatizados.
- Comprensión de repositorios limitada: 42,17/100 en codebases científicos reales, con delta nulo atribuido a la edición de una sola capa.
- Idiomas: solo inglés declarado; no apto para producción en castellano ni otras lenguas sin evaluación adicional.
- Longitud de contexto no documentada: no se puede asumir la ventana de 8.192 tokens del base sin verificación.
- Benchmarks no verificados: las métricas del model-index tienen `verified: false` y se calculan sobre 50 muestras, lo que implica alta varianza estadística.
- Resultados de Open LLM Leaderboard pendientes en el momento de la información; no hay validación independiente.
- Riesgo de alucinación elevado por el tamaño (135M) y por la baja recall factual observada en OpenBookQA.
- Sesgos: no se documentan evaluaciones de sesgo, toxicidad ni robustez adversarial.
- Licencia Apache 2.0 permite uso comercial, pero la ausencia de evaluaciones de seguridad desaconseja su despliegue en aplicaciones orientadas a usuarios finales sin filtros adicionales.
- La metodología de edición de pesos y las métricas RMT son declaraciones del autor sin replicación independiente conocida.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/BRR1154/INTRIQ-SmolLM2-135M-Instruct
- Modelo base: https://huggingface.co/HuggingFaceTB/SmolLM2-135M-Instruct
- Paper de SmolLM2 (referencia del base): https://arxiv.org/abs/2502.02737
- WeightWatcher (herramienta de análisis RMT citada): https://github.com/CalculatedContent/WeightWatcher
- Promptfoo (herramienta de evaluación citada): https://github.com/promptfoo/promptfoo
- lm-evaluation-harness (versión v0.4.13 citada): https://github.com/EleutherAI/lm-evaluation-harness
