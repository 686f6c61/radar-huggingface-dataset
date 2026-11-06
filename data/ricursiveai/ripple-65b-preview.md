# ricursiveAI/Ripple-65B-Preview

## Resumen

Ripple-65B Preview es un modelo de lenguaje denso de 65.000 millones de parámetros desarrollado por Ricursive Intelligence, publicado en Hugging Face bajo licencia Apache 2.0. Se trata de un transformer denso (no MoE) preentrenado desde cero sobre 12 billones de tokens de texto y código, predominantemente en inglés, con una longitud de contexto que alcanza hasta 1M de tokens tras las fases de post-entrenamiento. Su foco principal es el razonamiento y el código agéntico, y su model card reporta un resultado de 80,52 en TerminalBench 2.1, por encima de modelos open-weight estadounidenses mucho mayores como Reflection Beam 501B, Meta Muse Spark Open 816B, Thinking Machines Inkling 975B o NVIDIA Nemotron 3 Ultra 550B.

La relevancia del modelo radica en su relación entre tamaño y rendimiento: con solo 65B parámetros totales, Ricursive afirma que iguala o supera a modelos con más de 10 veces su número de parámetros en tareas de razonamiento y agentes. La arquitectura es deliberadamente "thin-and-deep" (d_model de 5120 y 80 capas), con un diseño tipo Gemma 3N que sustituye al enfoque llama-like de Olmo 3 para mejorar la estabilidad de entrenamiento a escala. La compañía declara un MFU del 40% durante preentrenamiento y post-entrenamiento con sharding simple, sin kernels personalizados y en BF16.

El release es una "Preview": el post-entrenamiento es relativamente ligero y centrado en código agéntico, e incluye una versión instruction-tuned en BF16 y NVFP4, además de un checkpoint base solo preentrenado. El modelo está codesñado para hardware NVIDIA y, según el autor, cabe en equipos de consumo como el NVIDIA DGX Spark gracias al checkpoint NVFP4.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (estilo Gemma 3N), ratio thin-and-deep, d_model 5120, 80 capas |
| Parametros totales | 64.782.689.360 (≈65B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | Hasta 1M tokens (entrenado en 8K, extendido vía midtraining a 64K, long context a 2M y LC SFT a 2M) |
| Tipos de cuantizacion | BF16 (repo principal) y NVFP4 (checkpoint separado) |
| Idiomas soportados | Predominantemente inglés (corpus text-only mayoritariamente inglés y código); lista oficial de idiomas no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors, con custom_code |

## Arquitectura y entrenamiento

Ripple-65B es un transformer denso con proporción "thin-and-deep": un ancho de modelo (d_model) de 5120 y 80 capas totales. Ricursive abandonó la arquitectura llama-like de Olmo 3 en favor de un diseño inspirado en Gemma 3N para mejorar la estabilidad del entrenamiento a escala. Para reforzar el razonamiento, el modelo sobreaprovisiona el número de cabezas de atención, incrementa la ratio de capas SWA (sliding window attention) frente a globales y reduce la ventana SWA para compensar el coste. Además incorpora clipping de activaciones en la FFN, atención con compuertas (gated attention), NoPE global y value residuals. La decisión de usar un denso en lugar de un MoE buscaba reducir la complejidad de infraestructura de preentrenamiento y post-entrenamiento manteniendo buen rendimiento en razonamiento y agentes.

El preentrenamiento se realizó desde cero sobre 12 billones de tokens de un corpus text-only predominantemente inglés y de código, con longitud de secuencia de 8K, 877.500 pasos y batch size escalado de 1408 a 3072. El post-entrenamiento sigue una receta estándar por etapas: midtraining (200B tokens, 64K de secuencia), long context (6,5B tokens, 2M de secuencia), SFT (183B tokens, 128K), long context SFT (13,5B tokens, 2M) y RL mixto por dominios (700 pasos, 128K de secuencia, batch 2048). El checkpoint base es solo preentrenamiento, sin midtraining ni datos sintéticos de QA. Ricursive declara que su escalera de modelos Ripple v1 mejora la eficiencia de cómputo en código 16x respecto a la de Olmo 3, y hasta 55x en la ejecución completa ("hero run").

## Capacidades

- Generación de texto y razonamiento general en inglés, con especial énfasis en tareas de razonamiento multi-paso.
- Codificación agéntica: resolución de tareas en terminal y entornos de línea de comandos, evaluada en TerminalBench 2.1, SWE-bench Pro v2.0 Hard y DeepSWE 1.1.
- Razonamiento matemático y de código derivado del corpus de preentrenamiento y del RL mixto por dominios.
- Soporte de contexto largo de hasta 1M tokens, habilitado mediante las fases de long context y LC SFT.
- Capacidad de operar como agente en flujos multi-paso con harnesses como Terminus 2 y OpenCode (usados en la evaluación del autor).
- Despliegue eficiente en hardware NVIDIA, incluido el formato NVFP4 para equipos de consumo como el DGX Spark.
- Generación rápida de tokens en GPUs de datacenter: 250 tok/s en 2xB200 con batch=8 antes de cuantización o kernels personalizados.
- Soporte de tool calling / function calling: no confirmado explícitamente en la información disponible.
- Capacidades multimodales (visión, audio): no disponibles; el modelo es text-only.

## Casos de uso

- Automatización de tareas en terminal y CI/CD: el modelo puede ejecutar comandos, interpretar salidas y corregir errores en pipelines de integración continua, aprovechando su entrenamiento específico en código agéntico y su buen resultado en TerminalBench 2.1.
- Agentes de resolución de incidencias en repositorios: con contexto de hasta 1M tokens puede cargar fragmentos amplios de código, trazas y documentación para localizar y proponer parches, evaluado en SWE-bench Pro v2.0 Hard y DeepSWE 1.1.
- Asistente de programación en IDE o CLI: generación y refactorización de código en inglés y lenguajes de programación, con latencia de 250 tok/s en 2xB200 batch=8, adecuada para autocompletado interactivo.
- Procesamiento de documentación técnica extensa: gracias a la ventana de 1M tokens puede resumir, extraer y cruzar información de manuales, especificaciones y bases de conocimiento largas sin trocear.
- Despliegue local en estaciones de trabajo: el checkpoint NVFP4 permite ejecutar el modelo en hardware de consumo como el NVIDIA DGX Spark, útil para prototipado y desarrollo offline con datos sensibles.
- Investigación en razonamiento y agentes: al ser un denso de 65B con receta de entrenamiento documentada por etapas, sirve como base para estudiar escalado, long context y RL en código agéntico.
- Generación de código en producción con contexto largo: integrable en servicios de revisión de código donde se necesite analizar un repositorio completo o un diff extenso en una sola pasada.

## Benchmarks y rendimiento

La model card incluye una tabla comparativa de benchmarks, pero el contenido proporcionado se corta tras la cabecera de la tabla, por lo que solo se dispone de los datos citados en el texto: TerminalBench 2.1 con 80,52 para Ripple-65B Preview frente a 80,1 de Reflection Beam 501B, 76,4 de Meta Muse Spark Open 816B, 63,8 de Thinking Machines Inkling 975B y 56,4 de NVIDIA Nemotron 3 Ultra 550B. El resto de resultados por benchmark (SWE-bench Pro v2.0 Hard, DeepSWE 1.1, etc.) no están disponibles en la información proporcionada.

| Benchmark | Ripple-65B Preview | Reflection Beam 501B | Muse Spark Open 816B | Inkling 975B | Nemotron 3 Ultra 550B |
|---|---|---|---|---|---|
| TerminalBench 2.1 | 80,52 | 80,1 | 76,4 | 63,8 | 56,4 |
| SWE-bench Pro v2.0 Hard | no disponible | no disponible | no disponible | no disponible | no disponible |
| DeepSWE 1.1 | no disponible | no disponible | no disponible | no disponible | no disponible |

El autor advierte que replicar benchmarks agénticos modernos es difícil y que los resultados de TerminalBench 2.1 fueron universalmente más bajos con el harness oficial Terminus 2 a 128K de secuencia con summarization (salvo Muse Spark Open), por lo que las cifras representan un mejor esfuerzo de comparación justa.

## Requisitos de hardware

- VRAM estimada en BF16: aproximadamente 130 GB de pesos (el repo ocupa 129,6 GB), por lo que se necesitan al menos 2 GPUs de 80 GB o una configuración equivalente para inferencia sin cuantizar.
- VRAM estimada en NVFP4: aproximadamente 32-33 GB de pesos, lo que permite ejecución en GPUs de consumo de gama alta con 48 GB o más, y en el NVIDIA DGX Spark según el autor.
- GPUs recomendadas: NVIDIA B200 (el autor reporta 250 tok/s en 2xB200 batch=8), H100 y A100 80 GB para BF16; RTX 4090 (24 GB) no es suficiente en BF16 ni en NVFP4 sin offloading o sharding adicional.
- Cabe en GPU de consumo: sí, en formato NVFP4 en equipos con suficiente memoria unificada o VRAM (DGX Spark citado explícitamente); no en una RTX 4090 de 24 GB sin técnicas adicionales.
- Opciones de despliegue: el repo usa custom_code, por lo que requiere `trust_remote_code`; no se confirman integraciones con vLLM, llama.cpp, Ollama o TGI en la información disponible.
- Latencia y throughput: 250 tok/s en 2xB200 con batch=8 antes de cuantización o kernels personalizados; no se proporcionan más cifras de latencia.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | TerminalBench 2.1 | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Ripple-65B Preview | 65B denso | Hasta 1M | 80,52 | Apache 2.0 | Hugging Face (BF16, NVFP4, base) |
| Reflection Beam 501B | 501B | no disponible | 80,1 | no disponible | open-weight (EE. UU.) |
| Meta Muse Spark Open 816B | 816B | no disponible | 76,4 | no disponible | open-weight (EE. UU.) |
| Thinking Machines Inkling 975B | 975B | no disponible | 63,8 | no disponible | open-weight (EE. UU.) |
| NVIDIA Nemotron 3 Ultra 550B | 550B | no disponible | 56,4 | no disponible | open-weight (EE. UU.) |

La comparativa se limita a los datos de TerminalBench 2.1 citados en la model card; no se dispone de parámetros activos, contexto ni licencia de los modelos competidores en la información proporcionada. El punto diferencial de Ripple-65B es su tamaño mucho menor (65B denso frente a 501B-975B) con un resultado superior en esa prueba concreta.

## Limitaciones y advertencias

- Es un release "Preview" con post-entrenamiento ligero y centrado en código agéntico; su rendimiento en dominios generales puede ser inferior al de modelos con post-entrenamiento más completo.
- El corpus es predominantemente inglés y código; el soporte multilingüe no está confirmado y probablemente sea limitado fuera del inglés.
- Riesgo de alucinación inherente a los modelos de lenguaje; no se documentan mitigaciones específicas en la información disponible.
- Sesgos conocidos: no documentados en la model card; al entrenarse sobre corpus web en inglés, es esperable un sesgo hacia ese idioma y cultura.
- La licencia Apache 2.0 permite uso comercial, pero el modelo requiere `trust_remote_code` por el uso de custom_code, lo que implica ejecutar código del autor.
- El contexto de 1M tokens se alcanzó con fases de long context de solo 6,5B y 13,5B tokens; la calidad en ventanas muy largas no está validada de forma independiente.
- Las cifras de benchmarks provienen del propio autor y este reconoce dificultades de replicación en evaluaciones agénticas.
- No se confirma soporte de tool calling, multimodalidad ni integración con frameworks de despliegue estándar.

## Enlaces

- Modelo en Hugging Face (BF16 instruct): https://huggingface.co/ricursiveAI/Ripple-65B-Preview
- Checkpoint NVFP4: https://huggingface.co/ricursiveAI/Ripple-65B-Preview-NVFP4
- Modelo base: https://huggingface.co/ricursiveAI/Ripple-65B-Base-Preview
- Variante DFlash2: https://huggingface.co/ricursiveAI/Ripple-65B-Preview-DFlash2
- Blog de lanzamiento: https://www.ricursive.com/ripple
- Licencia: https://huggingface.co/ricursiveAI/Ripple-65B-Preview/blob/main/LICENSE
