# ml-resources/Ripple-65B-Preview

## Resumen

Ripple-65B Preview es un modelo de lenguaje denso de 65.000 millones de parámetros desarrollado por Ricursive Intelligence. Se ha preentrenado desde cero sobre 12 billones de tokens de texto (predominantemente inglés) y código, con una longitud de secuencia inicial de 8K que se extiende hasta 1M de tokens mediante las fases de midtraining y long context. La versión Preview que se distribuye en este repositorio es el checkpoint instruction-tuned en BF16; también existen variantes NVFP4 y un modelo base sin postentrenamiento.

La relevancia del modelo reside en su enfoque de eficiencia: frente a la tendencia generalizada hacia arquitecturas Mixture-of-Experts (MoE), Ricursive optó por un Transformer denso modernizado con ratio "thin-and-deep" (d_model de 5120 y 80 capas) para reducir la complejidad de infraestructura. El resultado, según el autor, es un modelo que iguala o supera en tareas de código agéntico a modelos open-weight estadounidenses con más de diez veces su número de parámetros, como Reflection Beam 501B o Meta Muse Spark Open 816B, y que además cabe en hardware de consumo como una NVIDIA DGX Spark.

El modelo se presenta como especialmente fuerte en razonamiento y tareas agénticas de programación, con una puntuación de 80,52 en TerminalBench 2.1. Su licencia Apache 2.0 y la disponibilidad de checkpoints cuantizados en NVFP4 buscan fomentar el desarrollo local de modelos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (inspirado en Gemma 3N, ratio thin-and-deep) |
| Parametros totales | 64.782.689.360 (64,78B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | hasta 1M tokens (entrenado en fases de 2M de secuencia) |
| Tipos de cuantizacion | BF16 (este repo), NVFP4 (repo separado) |
| Idiomas soportados | predominantemente inglés y código |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (custom_code) |

## Arquitectura y entrenamiento

Ripple-65B es un Transformer denso con una proporción "thin-and-deep": un `d_model` estrecho de 5120 y 80 capas totales. Partiendo de una base tipo Olmo 3 (arquitectura similar a Llama), el equipo migró a una arquitectura inspirada en Gemma 3N para mejorar la estabilidad del entrenamiento a escala. Entre las modificaciones técnicas destacan la sobreprovisión de cabezas de atención, un mayor ratio de capas SWA (sliding window attention) frente a capas globales, reducción de la ventana SWA para compensar el coste, clipping de activaciones en la FFN, atención con puertas (gated attention), NoPE global y value residuals. El preentrenamiento se realizó en BF16 sin kernels personalizados ni cuantización, con un MFU del 40% y sharding simple.

El pipeline de entrenamiento consta de seis etapas: pretrain (12T tokens, 877.500 pasos, secuencia 8K, batch 1408→3072), midtrain (200B tokens, 8.000 pasos, 64K, batch 384), long context (6,5B tokens, 389 pasos, 2M, batch 8), SFT (183B tokens, 7.274 pasos, 128K, batch 192), LC SFT (13,5B tokens, 802 pasos, 2M, batch 8) y RL (700 pasos, 128K, batch 2048). El postentrenamiento es relativamente ligero y está centrado en código agéntico. El modelo base (Ripple-65B Base Preview) es un checkpoint solo de preentrenamiento, sin midtraining ni datos sintéticos de QA. Según el autor, la escalera de modelos Ripple v1 mejora la eficiencia computacional en código 16x respecto a la escalera de Olmo 3, y hasta 55x en el modelo completo.

## Capacidades

- Generación de texto y razonamiento general en inglés y código.
- Programación y tareas de ingeniería de software, con énfasis en flujos agénticos (TerminalBench, SWE-bench Pro, DeepSWE).
- Razonamiento multi-paso y ejecución de agentes autónomos en terminal.
- Soporte de contexto largo: hasta 1M tokens, con fases de entrenamiento en secuencias de 2M.
- Capacidad de ejecución local en hardware de consumo (DGX Spark) gracias a su tamaño denso de 65B y al checkpoint NVFP4.
- Razonamiento matemático: no se detalla explícitamente en la información disponible.
- Tool calling / function calling: no se detalla explícitamente en la información disponible.
- Capacidades multimodales (visión, audio): no disponibles; el modelo es solo texto.
- Modo thinking o decodificación especulativa: no se detalla en la información disponible.

## Casos de uso

- Agentes de codificación autónomos en terminal: el modelo obtiene 80,52 en TerminalBench 2.1, por lo que es adecuado para tareas de resolución de incidencias y ejecución de comandos en entornos tipo CLI con supervisión humana.
- Asistencia en pipelines de CI/CD: puede integrarse como agente que interpreta fallos de build, propone parches y valida cambios, aprovechando su contexto de hasta 1M tokens para leer logs extensos.
- Refactorización de bases de código grandes: la ventana de contexto larga permite cargar múltiples ficheros y dependencias en una sola pasada, reduciendo la necesidad de trocear el repositorio.
- Desarrollo local y prototipado en estaciones de trabajo: el checkpoint NVFP4 y la posibilidad de ejecutarlo en una DGX Spark permiten desplegar el modelo en entornos sin clúster de datacenter.
- Investigación en eficiencia de modelos densos: al ser un Transformer denso con receta de entrenamiento publicada por etapas, sirve como referencia para estudiar escalado y estabilidad sin MoE.
- Generación de código en producción con latencia controlada: el autor reporta 250 tok/s en 2xB200 con batch 8 en BF16 antes de cuantización, lo que lo hace viable para servicios interactivos de autocompletado o generación de parches.
- Evaluación comparativa de modelos open-weight: su licencia Apache 2.0 y sus checkpoints BF16/NVFP4 facilitan reproducir benchmarks agénticos frente a alternativas de mayor tamaño.

## Benchmarks y rendimiento

Los datos disponibles en la model card son parciales: solo se ofrece la puntuación de TerminalBench 2.1 y una tabla comparativa que aparece truncada en la información proporcionada. No se dispone de resultados completos de MMLU, HumanEval, GSM8K ni del resto de benchmarks de la tabla.

| Benchmark | Ripple-65B Preview | Nemotron 3 Ultra 550B | Inkling 975B | Muse Spark Open 816B | Reflection Beam 501B |
|---|---|---|---|---|---|
| TerminalBench 2.1 | 80,52 | 56,4 | 63,8 | 76,4 | 80,1 |

El resto de filas de la tabla comparativa no está disponible en la información proporcionada. El autor indica que las evaluaciones se realizaron en BF16 a máximo esfuerzo, usando el harness Terminus 2 para SWE-bench Pro v2.0 Hard y DeepSWE 1.1 en el caso de Ripple, y OpenCode cuando no se especifica harness.

## Requisitos de hardware

- VRAM estimada en BF16: aproximadamente 130 GB de pesos (el repo ocupa 129,6 GB), por lo que se necesitan al menos 2 GPU de 80 GB (A100/H100) o 2xB200 para inferencia cómoda.
- VRAM estimada en NVFP4: no disponible en la información proporcionada, pero el autor indica que el modelo cabe en una NVIDIA DGX Spark.
- GPU recomendadas: NVIDIA DGX Spark para despliegue local en NVFP4; 2xB200 para alto throughput (250 tok/s con batch 8 en BF16, antes de cuantización o kernels personalizados); A100/H100 de 80 GB en configuraciones multi-GPU para BF16.
- Cabe en GPU de consumo: el autor afirma que cabe en hardware de consumo tipo DGX Spark, pero no se especifican modelos concretos de GeForce (RTX 4090, etc.) ni configuraciones.
- Opciones de despliegue: no se detallan en la información disponible (no se mencionan vLLM, llama.cpp, Ollama ni TGI). El repo usa `custom_code`, lo que puede requerir transformers con `trust_remote_code=True`.
- Latencia y throughput: 250 tok/s en 2xB200 con batch 8 en BF16, sin cuantización ni kernels personalizados.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | TerminalBench 2.1 | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Ripple-65B Preview | 64,78B (denso) | hasta 1M | 80,52 | Apache 2.0 | HuggingFace (BF16, NVFP4, base) |
| Reflection Beam 501B | 501B | no disponible | 80,1 | no disponible | open-weight (US) |
| Meta Muse Spark Open 816B | 816B | no disponible | 76,4 | no disponible | open-weight (US) |
| Thinking Machines Inkling 975B | 975B | no disponible | 63,8 | no disponible | open-weight (US) |
| NVIDIA Nemotron 3 Ultra 550B | 550B | no disponible | 56,4 | no disponible | open-weight (US) |

Ripple-65B Preview es el único de la comparativa con arquitectura densa y con licencia Apache 2.0 confirmada en la información disponible; el resto de modelos son de mayor tamaño (entre 501B y 975B) y sus licencias no se detallan. La ventaja principal de Ripple es su relación rendimiento/tamaño: iguala a Reflection Beam 501B con casi ocho veces menos parámetros.

## Limitaciones y advertencias

- Modelo Preview: el propio autor lo describe como una release preliminar con postentrenamiento ligero, por lo que puede presentar comportamientos menos pulidos que versiones finales.
- Idiomas: el corpus es predominantemente inglés y código; no se garantiza un rendimiento sólido en castellano ni en otros idiomas.
- Sesgos: no se documentan evaluaciones de sesgo ni de seguridad en la información disponible.
- Alucinación: no se proporcionan métricas de factualidad ni de tasa de alucinación; al ser un modelo con RL ligero, el riesgo en dominios abiertos no está cuantificado.
- Contexto largo: aunque se entrena con secuencias de hasta 2M y se anuncia soporte de 1M, no se aportan resultados de benchmarks de long context (RULER, etc.).
- Licencia: Apache 2.0 permite uso comercial, pero el repo incluye `custom_code`, lo que obliga a revisar el código remoto antes de desplegarlo en producción.
- Reproducibilidad de benchmarks: el autor advierte que replicar las puntuaciones agénticas es difícil y que los resultados dependen del harness y de la longitud de secuencia usada.
- Hardware: en BF16 requiere ~130 GB de pesos, lo que excluye GPUs de consumo convencionales; el despliegue local depende del checkpoint NVFP4.
- Fecha de creación del repo (2026-11-04) y ausencia de descargas/likes: no hay evidencia de adopción comunitaria ni de validación independiente en el momento de redactar esta ficha.

## Enlaces

- HuggingFace (BF16 instruct): https://huggingface.co/ricursiveAI/Ripple-65B-Preview
- HuggingFace (NVFP4): https://huggingface.co/ricursiveAI/Ripple-65B-Preview-NVFP4
- HuggingFace (modelo base): https://huggingface.co/ricursiveAI/Ripple-65B-Base-Preview
- HuggingFace (DFlash2): https://huggingface.co/ricursiveAI/Ripple-65B-Preview-DFlash2
- Blog de lanzamiento: https://www.ricursive.com/ripple
- Licencia: https://huggingface.co/ricursiveAI/Ripple-65B-Preview/blob/main/LICENSE
- Repositorio en HuggingFace (ID de la ficha): https://huggingface.co/ml-resources/Ripple-65B-Preview
