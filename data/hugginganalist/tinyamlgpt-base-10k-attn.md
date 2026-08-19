# HuggingAnalist/TinyAmlGpt-Base-10k-attn

## Resumen

TinyAmlGpt-Base-10k-attn es un modelo de lenguaje autorregresivo (decoder-only) de arquitectura GPT, desarrollado por HuggingAnalist como artefacto de investigación para estudiar el objetivo de entrenamiento AML (masked self-distillation). Con 51,4 millones de parámetros y una ventana de contexto de 512 tokens, el modelo se entrena sobre el corpus sintético TinyStories, compuesto por historias simples en inglés dirigidas a primeros lectores. Su principal innovación reside en un objetivo de auto-destilación enmascarada que impone restricciones de proximidad entre subredes anidadas y el modelo denso, mediante una pérdida hinge que actúa como restricción en lugar de como objetivo directo.

El modelo se presenta como una herramienta para investigar dinámicas de entrenamiento a pequeña escala, no como un modelo de propósito general. Carece de conocimiento fuera de la distribución de TinyStories, no sigue instrucciones y produce texto fluido sin base factual. Su implementación es personalizada y no compatible con la biblioteca `transformers`, por lo que requiere código específico para su uso.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | GPT decoder-only (8 capas, d_model 512, 8 cabezas de atención) |
| Parámetros totales | 51.430.400 (25.698.816 no-embedding) |
| Parámetros activos | No aplica (no es MoE; aunque hay niveles de densidad con máscaras, los tensores mantienen su forma) |
| Longitud de contexto | 512 tokens |
| Tipos de cuantización | No se proporcionan; entrenado en precisión bf16 |
| Idiomas soportados | No disponible (el corpus de entrenamiento es inglés simplificado, pero no se declara soporte de idiomas) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (PyTorch) |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura GPT estándar: 8 capas transformer decoder-only, con dimensión de modelo 512 y 8 cabezas de atención. La innovación principal es el objetivo de entrenamiento AML (masked self-distillation). Junto con la pérdida de entropía cruzada sobre el modelo denso, se definen subredes anidadas obtenidas mediante un proceso de adelgazamiento de Bernoulli iterado (`M^(j) = M^(j-1) * Bern(rho)`) con máscaras fijas. Cada subred debe mantenerse dentro de una tolerancia ε_j de la distribución de tokens del modelo denso, usando una pérdida hinge que anula el gradiente cuando la subred está dentro del radio permitido. Esto convierte la proximidad en una restricción, no en un objetivo de minimización.

El entrenamiento se realizó sobre el dataset TinyStories (0,66 mil millones de tokens) con secuencias de 512 tokens, pasos de 65.536 tokens, 10.000 pasos en total, optimizador AdamW (lr 0,0006, warmup 1000, weight decay 0,1) y precisión bf16. El modelo alcanza una pérdida de validación de 1,3374 y una perplejidad de 3,81.

## Capacidades

- Generación de texto: produce historias cortas en inglés simplificado coherentes con el estilo de TinyStories, pero sin conocimiento factual del mundo real.
- Auto-destilación enmascarada: el modelo contiene subredes anidadas que pueden extraerse para análisis, aunque no se reduce la latencia porque las máscaras no eliminan operaciones.
- Sin soporte de tool calling ni function calling.
- Sin capacidades de agente ni razonamiento multi-paso.
- Sin capacidades multilingües: el corpus de entrenamiento es exclusivamente inglés simplificado.
- Sin modo de pensamiento, visión ni audio.

## Casos de uso

- Investigación en objetivos de entrenamiento: el modelo permite estudiar cómo la auto-destilación enmascarada afecta la generalización y la representación interna en modelos pequeños. Los investigadores pueden comparar la pérdida y la perplejidad con modelos densos entrenados con entropía cruzada estándar.
- Análisis de subredes: al disponer de máscaras fijas, se pueden extraer subredes de densidad 0,5 y 0,25 para analizar su comportamiento y rendimiento de forma aislada, sin necesidad de reentrenar.
- Estudio de regularización implícita: la restricción de proximidad entre subredes y modelo denso puede servir para investigar cómo el espacio de soluciones se estructura bajo este tipo de objetivos.
- Evaluación de compresión sin pérdida de rendimiento: aunque las máscaras no reducen la latencia, el modelo permite explorar si las subredes mantienen una calidad similar al modelo completo, lo que informa sobre posibles estrategias de poda estructurada.
- Benchmark de perplejidad en corpus restringidos: útil para comparar métricas de lenguaje en dominios muy específicos y de vocabulario reducido, como TinyStories.
- Reproducción de experimentos: al estar publicados los hiperparámetros y el código, sirve como punto de referencia para reproducir y extender resultados en el ámbito de la auto-destilación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. El único dato de rendimiento reportado es la pérdida de validación y la perplejidad sobre el propio conjunto de validación de TinyStories:

| Métrica | Valor |
|---|---|
| Pérdida de validación | 1,3374 |
| Perplejidad de validación | 3,81 |
| Mejor pérdida de validación | 1,3801 |

Además, se midió el coste de inferencia en una NVIDIA A100-SXM4-80GB con bf16, prompt de 30 tokens y decodificación de 64 tokens (mediana de 5 ejecuciones):

| Nivel | Parámetros totales | Parámetros activos | Densidad | Prefill (tok/s) | Decode (tok/s) | ms/token |
|---|---|---|---|---|---|---|
| Denso | 51.430.400 | 51.430.400 | 1,000 | 3.373 | 98,7 | 10,13 |
| Nivel 1 | 51.430.400 | 47.234.560 | 0,500 | 3.420 | 99,0 | 10,10 |
| Nivel 2 | 51.430.400 | 45.138.176 | 0,250 | 3.356 | 99,0 | 10,10 |

Las máscaras ponen a cero pesos pero no eliminan las operaciones, por lo que la latencia no se reduce con niveles de menor densidad.

## Requisitos de hardware

- El modelo tiene 51,4 millones de parámetros, lo que en bf16 ocupa aproximadamente 103 MB de VRAM. Con overhead de activaciones y buffers, cabe en cualquier GPU con al menos 2 GB de VRAM, incluyendo tarjetas consumer como GTX 1060 6GB, RTX 3060 o superiores.
- Las mediciones oficiales se realizaron en una NVIDIA A100-SXM4-80GB, aunque no es necesaria para este tamaño de modelo.
- Opciones de despliegue: el modelo usa una implementación personalizada (no compatible con `transformers`), por lo que no se puede usar directamente con vLLM, llama.cpp, Ollama o TGI. Requiere el código del repositorio del autor.
- Latencia estimada: según la medición en A100, el decode es de ~98,7 tokens/s (10,13 ms/token) en el nivel denso. En GPUs consumer la latencia será mayor, pero no se dispone de datos específicos.

## Comparativa con modelos similares

No disponible. No se han encontrado modelos comparables en la información proporcionada (ni por tamaño, ni por objetivo de entrenamiento, ni por corpus). El modelo es un artefacto de investigación específico, y no se dispone de datos de rendimiento frente a alternativas como GPT-2 pequeño, Pythia-70M o modelos entrenados en TinyStories con objetivos estándar.

## Limitaciones y advertencias

- Entrenado exclusivamente sobre TinyStories, un corpus sintético de historias simples con vocabulario reducido. No tiene conocimiento general del mundo ni de dominios especializados.
- No sigue instrucciones: no está alineado para tareas de chat o asistencia, y su salida es texto generativo sin control semántico.
- Riesgo de alucinación: produce texto fluido sin base factual; cualquier afirmación generada debe considerarse no verificada.
- Sin soporte multilingüe: solo inglés simplificado, y con un registro muy limitado.
- La implementación es personalizada y no está integrada en `transformers` ni en otros ecosistemas estándar; su uso en producción requeriría adaptación de código.
- Las subredes con máscaras no reducen la latencia, por lo que no se obtienen beneficios de velocidad al usar niveles de menor densidad.
- Es un artefacto de investigación; no se recomienda su uso en aplicaciones reales sin un análisis exhaustivo de sus limitaciones.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/HuggingAnalist/TinyAmlGpt-Base-10k-attn
- Dataset TinyStories: https://huggingface.co/datasets/roneneldan/TinyStories
