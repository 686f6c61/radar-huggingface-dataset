# Jolly-Q/Ripple-65B-Preview

## Resumen

Ripple-65B Preview es un modelo de lenguaje denso de 65.000 millones de parámetros desarrollado por Ricursive Intelligence (publicado en Hugging Face bajo el identificador Jolly-Q/Ripple-65B-Preview). Se trata de un transformer denso preentrenado desde cero sobre 12 billones de tokens de texto y código, predominantemente en inglés, con una longitud de contexto que alcanza 1.048.576 tokens (1 Mi). La versión publicada en este repositorio es el checkpoint ajustado por instrucciones en BF16.

El modelo se presenta como una alternativa a las arquitecturas Mixture-of-Experts (MoE) dominantes en el segmento de modelos frontera: Ricursive optó por un transformer denso modernizado para reducir la complejidad de infraestructura de preentrenamiento y postentrenamiento. Según la model card, esto permitió entrenar el modelo con un equipo de 1 a 5 personas manteniendo un MFU del 40 % sin kernels personalizados ni cuantización durante el entrenamiento.

Su relevancia actual radica en el rendimiento declarado en tareas de codificación agéntica: 80,52 en TerminalBench 2.1, por encima de modelos abiertos estadounidenses mucho mayores como Reflection Beam 501B (80,1), Meta Muse Spark Open 816B (76,4), Thinking Machines Inkling 975B (63,8) y NVIDIA Nemotron 3 Ultra 550B (56,4). Además, con 65B parámetros en BF16 el modelo cabe en hardware de consumo como una NVIDIA DGX Spark, y se ofrece un checkpoint NVFP4 para despliegue local.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (inspirado en Gemma 3N), ratio thin-and-deep, d_model 5120, 80 capas |
| Parametros totales | 64.782.689.360 (≈65B) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | hasta 1.048.576 tokens (1 Mi) |
| Tipos de cuantizacion | BF16 (este repo), NVFP4 (checkpoint separado) |
| Idiomas soportados | predominantemente ingles, con codigo; lista completa no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (custom_code) |

## Arquitectura y entrenamiento

Ripple-65B emplea un transformer denso con proporción thin-and-deep: un `d_model` estrecho de 5120 y 80 capas totales. Ricursive partió de una arquitectura tipo Llama (la de Olmo 3) y migró a una arquitectura tipo Gemma 3N para mejorar la estabilidad del entrenamiento a escala. Entre las modificaciones técnicas destacan: sobreaprovisionamiento del número de cabezas de atención, mayor ratio de capas con atención de ventana deslizante (SWA) frente a capas de atención global, reducción de la ventana SWA para compensar el coste, clipping de activaciones en la FFN, atención con compuertas (gated attention), NoPE global y value residuals.

El preentrenamiento se realizó desde cero sobre 12 billones de tokens de un corpus mayoritariamente inglés y de código, con longitud de secuencia de 8K y 877.500 pasos (batch de 1408 a 3072). El postentrenamiento siguió un pipeline estándar: midtraining (200B tokens, 64K de secuencia), long context (6,5B tokens, 2M de secuencia), SFT (183B tokens, 128K), SFT de contexto largo (13,5B tokens, 2M) y RL mixto multidominio (700 pasos, 128K, batch 2048). La model card indica que el release Preview ha pasado por un postentrenamiento relativamente ligero, centrado en codificación agéntica. No se especifica el uso de RLHF o DPO de forma explícita.

## Capacidades

- Generación de texto y razonamiento general en inglés, con especial énfasis en tareas de razonamiento y agentes.
- Codificación agéntica: ejecución de tareas en terminal y entornos de línea de comandos (TerminalBench 2.1).
- Contexto largo de hasta 1 Mi tokens, entrenado explícitamente en fases de long context y long context SFT.
- Capacidad de razonamiento multi-paso y flujos agénticos.
- Soporte de tool calling / function calling: no confirmado explícitamente en la información disponible.
- Capacidades multilingües: no disponibles más allá de la indicación de corpus predominantemente inglés.
- Capacidades de visión, audio o thinking mode explícito: no disponibles en la información proporcionada.

## Casos de uso

- Agentes de codificación autónomos: el modelo puede operar en entornos de terminal y resolver tareas de ingeniería de software de varios pasos, respaldado por su puntuación de 80,52 en TerminalBench 2.1 y su ventana de 1 Mi tokens para mantener el estado de la tarea.
- Asistentes de programación en IDE con contexto de repositorio completo: la ventana de 1 Mi tokens permite cargar múltiples ficheros y trazas de error en una sola petición sin truncar.
- Automatización de pipelines de CI/CD: el modelo puede analizar logs extensos, diagnosticar fallos y proponer parches dentro de flujos agénticos.
- Despliegue local en estación de trabajo: con 65B parámetros en BF16 cabe en hardware como NVIDIA DGX Spark, y el checkpoint NVFP4 facilita la inferencia en GPUs de consumo para desarrollo y prototipado sin depender de la nube.
- Procesamiento de documentación técnica extensa: resumen y extracción de información sobre manuales, especificaciones o bases de código de gran tamaño gracias al contexto de 1 Mi.
- Servicio de inferencia de alta velocidad en centro de datos: la model card reporta 250 tok/s en 2xB200 con batch=8 antes de cuantización o kernels personalizados, adecuado para aplicaciones interactivas.
- Investigación sobre arquitecturas densas frente a MoE: el modelo sirve como referencia reproducible (licencia Apache 2.0, pesos abiertos) para estudiar eficiencia computacional en el entrenamiento.

## Benchmarks y rendimiento

| Benchmark | Ripple-65B Preview | Nemotron 3 Ultra 550B | Inkling 975B | Muse Spark Open 816B | Reflection Beam 501B |
|---|---|---|---|---|---|
| TerminalBench 2.1 | 80,52 | 56,4 | 63,8 | 76,4 | 80,1 |

La model card menciona además evaluaciones en SWE-bench Pro v2.0 Hard y DeepSWE 1.1 (con el harness Terminus 2 para Ripple-65B Preview), pero los valores numéricos de esas filas no están incluidos en la información proporcionada. El resto de la tabla comparativa oficial quedó truncada en el material disponible. No se han publicado en la información disponible resultados de MMLU, HumanEval o GSM8K.

## Requisitos de hardware

- VRAM estimada en BF16: aproximadamente 130 GB de pesos (el repositorio ocupa 129,6 GB), más overhead de activaciones y KV cache; se recomienda al menos 160 GB de VRAM agregada.
- VRAM estimada en NVFP4: aproximadamente 33-40 GB de pesos, apto para GPUs de consumo de gama alta con 48 GB o más.
- GPU recomendadas: NVIDIA B200 (la model card reporta 250 tok/s en 2xB200, batch=8), H100 y A100 para BF16; NVIDIA DGX Spark para despliegue local en BF16.
- Cabe en GPU de consumo: sí, en formato NVFP4 en GPUs con suficiente VRAM; en BF16 requiere hardware de clase DGX Spark o superior.
- Opciones de despliegue: el repositorio usa `custom_code`, por lo que requiere `trust_remote_code`; compatible con stacks de inferencia estándar de Hugging Face. Soporte específico de vLLM, llama.cpp, Ollama o TGI no confirmado en la información disponible.
- Latencia y throughput: 250 tok/s en 2xB200 con batch=8 antes de cuantización o kernels personalizados, según la model card.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | TerminalBench 2.1 | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Ripple-65B Preview | 65B (denso) | 1 Mi | 80,52 | Apache 2.0 | Pesos abiertos en HF |
| Reflection Beam 501B | 501B | no disponible | 80,1 | no disponible | Pesos abiertos (US) |
| Muse Spark Open 816B | 816B | no disponible | 76,4 | no disponible | Pesos abiertos (US) |
| Nemotron 3 Ultra 550B | 550B | no disponible | 56,4 | no disponible | Pesos abiertos (US) |

Ripple-65B ofrece un rendimiento comparable o superior a modelos con más de 10 veces sus parámetros totales, con la ventaja de ser denso y caber en hardware de consumo en formato NVFP4. Los datos de licencia y contexto de los modelos comparados no están disponibles en la información proporcionada.

## Limitaciones y advertencias

- Modelo Preview: la model card indica postentrenamiento ligero y centrado en codificación agéntica; el rendimiento en otros dominios puede ser inferior al de modelos con postentrenamiento más completo.
- Corpus predominantemente inglés: el soporte multilingüe no está documentado y probablemente sea limitado.
- Riesgo de alucinación: no se documentan medidas específicas de mitigación en la información disponible.
- Sesgos: no se detallan evaluaciones de sesgo o seguridad en la model card.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta, y autoría bajo un identificador (Jolly-Q) distinto del oficial (ricursiveAI) referenciado en la model card; conviene verificar la procedencia antes de usarlo en producción.
- Requiere `trust_remote_code` por el uso de `custom_code`, lo que implica ejecutar código del repositorio.
- Benchmarks autoevaluados: la propia model card advierte de la dificultad de replicar evaluaciones agénticas modernas y de que los resultados son un esfuerzo de comparación justa, no una verificación independiente.
- Licencia Apache 2.0 permite uso comercial, pero no se especifican restricciones adicionales de uso aceptable.

## Enlaces

- Hugging Face: https://huggingface.co/Jolly-Q/Ripple-65B-Preview
- Repositorio oficial referenciado (BF16): https://huggingface.co/ricursiveAI/Ripple-65B-Preview
- Checkpoint NVFP4: https://huggingface.co/ricursiveAI/Ripple-65B-Preview-NVFP4
- Modelo base: https://huggingface.co/ricursiveAI/Ripple-65B-Base-Preview
- Variante DFlash2: https://huggingface.co/ricursiveAI/Ripple-65B-Preview-DFlash2
- Blog de lanzamiento: https://www.ricursive.com/ripple
- Licencia: https://huggingface.co/ricursiveAI/Ripple-65B-Preview/blob/main/LICENSE
