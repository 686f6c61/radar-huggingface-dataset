# reaperdoesntknow/CasualSwarms

## Resumen

CasualSwarms (publicado por el autor bajo el nombre SAGI V3.1 / Swarm-8 V3.1) es un modelo de lenguaje causal de tipo decoder-only orientado a generación de texto, desarrollado por el usuario de Hugging Face `reaperdoesntknow`. El modelo se presenta como una propuesta experimental que combina una arquitectura transformer con dinámicas de "inteligencia de enjambre": varios agentes internos que colaboran mediante enrutamiento diferenciable, mecanismos de confianza y memoria compartida. La model card describe capas adicionales de autoevaluación (predictor de rendimiento, analizador de carencias de habilidad, detector de errores en tiempo real y detector de límites de capacidad).

El dato objetivo y verificable es su tamaño: 170.330.979 parámetros totales según los pesos en safetensors, con un repositorio de 0,7 GB y pesos en fp32. Se distribuye bajo licencia Apache 2.0, está etiquetado únicamente para inglés y su pipeline es `text-generation` con la librería `transformers`. El autor declara entrenamiento sobre datasets como TinyStories, GSM8K, General-Knowledge, DeepCoder-Preview-Dataset y KnowLogic.

Es relevante ahora por su carácter de experimento abierto: propone una arquitectura "de enjambre" con capas de metacognición sobre un modelo de escala pequeña (170 M de parámetros), lo que permite inspeccionar y reproducir el diseño en hardware modesto. Conviene tratar las afirmaciones de "AGI" y "self-aware" de la model card como mercadotecnia del autor, no como capacidades demostradas: no se han publicado benchmarks ni evaluaciones independientes en la información disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal (decoder-only) con capas propietarias de "swarm" y autoevaluación según la model card; detalles internos no verificables |
| Parametros totales | 170.330.979 |
| Parametros activos | no disponible (no se declara como MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en fp32; el repositorio no incluye variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | Inglés (`en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería `transformers`) |

## Arquitectura y entrenamiento

La model card describe una arquitectura por capas: un "Swarm Core" con 20 agentes vectorizados, enrutamiento diferenciable, gestión dinámica de recursos y activación basada en confianza; un "AGI Core" con memoria jerárquica, modelo causal del mundo, meta-aprendizaje, biblioteca de conceptos, motor de reflexión, razonador de incertidumbre y auto-juego adversarial; y una "Self-Assessment Layer" con predictor de rendimiento, analizador de carencias de habilidad (24 habilidades declaradas), generador de currículo automático, detector de errores en tiempo real y detector de límites de capacidad. Esta descripción proviene exclusivamente del autor y no está respaldada por un paper, código de entrenamiento publicado ni evaluaciones externas en la información disponible.

En cuanto a datos, la model card lista los datasets TinyStories, GSM8K, General-Knowledge, DeepCoder-Preview-Dataset y KnowLogic, pero no especifica número de tokens, composición exacta, proporciones ni si hubo etapas de RLHF, DPO o ajuste por instrucciones. No se documentan innovaciones verificables como decodificación especulativa o atención lineal; las "innovaciones" declaradas son las capas de enjambre y autoevaluación descritas en el diagrama de la model card.

## Capacidades

- Generación de texto causal en inglés, con pipeline `text-generation` estándar de `transformers`.
- Razonamiento y matemáticas básicas: el autor declara entrenamiento sobre GSM8K, aunque no se aportan métricas de exactitud.
- Generación de código: se lista DeepCoder-Preview-Dataset como fuente de entrenamiento, sin resultados publicados en HumanEval ni similares.
- Conocimiento general: se cita el dataset General-Knowledge, sin evaluación de MMLU ni TriviaQA.
- Capacidades declaradas de "agente" y multi-step reasoning mediante el Swarm Core (20 agentes vectorizados) y el enrutamiento diferenciable, según la model card; no verificadas externamente.
- Capas declaradas de autoevaluación: detección de errores, verificación de coherencia y detección de alucinaciones, sin evidencia empírica publicada.
- Soporte de tool calling / function calling: no disponible (no se documenta).
- Capacidades multimodales (visión, audio): no disponibles.
- Modo "thinking" explícito: no disponible.
- Multilingüismo: limitado a inglés según la etiqueta de idioma.

## Casos de uso

- Experimentación académica con arquitecturas de enjambre: el modelo sirve como banco de pruebas reproducible (170 M de parámetros, 0,7 GB, fp32) para estudiar enrutamiento diferenciable y mecanismos de confianza en un transformer pequeño, sin necesidad de clústeres de GPU.
- Prototipado rápido en CPU: al ser un modelo de 170 M de parámetros en fp32, puede ejecutarse en portátiles y entornos sin GPU para validar pipelines de `transformers` antes de escalar a modelos mayores.
- Generación de texto creativo en inglés: adecuado para demos de escritura asistida y generación de narrativa breve, dado el uso declarado de TinyStories en el entrenamiento.
- Investigación sobre metacognición en LLM: las capas declaradas de autoevaluación (predictor de rendimiento, detector de errores) permiten diseñar experimentos sobre autoestima del modelo y calibración, comparando comportamiento declarado frente a mediciones reales.
- Educación y docencia: útil para explicar en clase la anatomía de un transformer causal pequeño, la tokenización y el ciclo de inferencia, con un repositorio ligero y licencia permisiva.
- Fine-tuning ligero y pruebas de concepto: con Apache 2.0 y 170 M de parámetros, es viable ajustarlo en una sola GPU consumer para tareas de dominio específico en inglés, como clasificación o generación controlada.
- Evaluación de robustez y detección de alucinaciones: sirve como caso de estudio para medir hasta qué punto las capas declaradas de "detección de alucinaciones" reducen errores frente a un transformer base de tamaño comparable.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: aproximadamente 0,7 GB solo para pesos; con activaciones y overhead de `transformers`, alrededor de 1-2 GB.
- VRAM estimada en fp16/bf16: alrededor de 0,35 GB para pesos; en int8, unos 0,17 GB; en int4, unos 0,09 GB (estimaciones teóricas, no hay variantes cuantizadas publicadas).
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM; una RTX 3060, RTX 4060 o superior es más que suficiente. También funciona en CPU.
- Cabe holgadamente en GPU consumer: GTX 1650, RTX 3050, RTX 4060, Apple Silicon (M1/M2/M3) y en CPU en solitario.
- Opciones de despliegue: `transformers` (librería declarada), y previsiblemente `vLLM`, `TGI`, `llama.cpp` u `Ollama` si se convierten los pesos a GGUF, aunque el repositorio no publica dichas variantes.
- Latencia y throughput: no disponibles; por el tamaño, se espera inferencia en tiempo real en CPU y muy rápida en GPU, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Idiomas | Notas |
|---|---|---|---|---|---|
| CasualSwarms (SAGI V3.1) | 170 M | no disponible | Apache 2.0 | en | Capas declaradas de enjambre y autoevaluación; sin benchmarks publicados |
| GPT-2 small | 124 M | 1.024 tokens | MIT | en | Referencia clásica de transformer pequeño; benchmarks públicos |
| TinyLlama 1.1B | 1.100 M | 2.048 tokens | Apache 2.0 | en, zh | Mayor escala; benchmarks publicados |
| Qwen2.5-0.5B | 494 M | 32.768 tokens | Apache 2.0 | multilingüe | Contexto largo y benchmarks publicados |

La comparación es orientativa: CasualSwarms se sitúa en la franja de transformers pequeños (por debajo de 1 B de parámetros), pero carece de evaluaciones que permitan situarlo frente a GPT-2 small o Qwen2.5-0.5B en MMLU, HumanEval o GSM8K.

## Limitaciones y advertencias

- Las afirmaciones de "AGI", "self-aware" y "self-assessment" de la model card no están respaldadas por benchmarks ni evaluaciones independientes; deben tratarse como declaraciones del autor.
- No se documenta la longitud de contexto, lo que impide planificar su uso en tareas de contexto largo.
- Modelo entrenado únicamente en inglés; no se garantiza calidad en castellano ni en otros idiomas.
- Riesgo elevado de alucinación: a 170 M de parámetros, la capacidad de conocimiento factual es limitada y el autor no publica métricas de veracidad.
- Sesgos: al entrenar sobre datasets como TinyStories (narrativa infantil sintética) y General-Knowledge, es probable que herede sesgos de esas fuentes; no se documenta ninguna mitigación.
- Licencia Apache 2.0 permite uso comercial, pero al no haber evaluación de calidad, el uso en producción sin validación propia es arriesgado.
- No se publican variantes cuantizadas (GGUF, AWQ, GPTQ) ni scripts de conversión; el despliegue en `llama.cpp` u `Ollama` requeriría trabajo adicional.
- No hay paper, repositorio de código de entrenamiento ni informe técnico que permita reproducir el modelo.
- El nombre "SAGI V3.1" y la versión "Swarm-8 V3.1" sugieren iteraciones previas, pero no se enlazan versiones anteriores en la información disponible.

## Enlaces

- Hugging Face: https://huggingface.co/reaperdoesntknow/CasualSwarms
- Dataset TinyStories: https://huggingface.co/datasets/roneneldan/TinyStories
- Dataset GSM8K: https://huggingface.co/datasets/openai/gsm8k
- Dataset General-Knowledge: https://huggingface.co/datasets/MuskumPillerum/General-Knowledge
- Dataset DeepCoder-Preview-Dataset: https://huggingface.co/datasets/agentica-org/DeepCoder-Preview-Dataset
- Dataset KnowLogic: https://huggingface.co/datasets/tangyuhang/KnowLogic
