# Bloomedmvp/Ripple-65B-Preview

## Resumen

Ripple-65B Preview es un modelo de lenguaje denso de 65.000 millones de parámetros desarrollado por Ricursive Intelligence (publicado en Hugging Face bajo la cuenta Bloomedmvp). Se trata de un transformer denso entrenado desde cero sobre 12 billones de tokens, con soporte de contexto de hasta 1.048.576 tokens (1 Mi), y está orientado específicamente a tareas de razonamiento y codificación agéntica. La versión publicada en este repositorio es la variante instruction-tuned en BF16; el autor también distribuye un modelo base, una versión en NVFP4 y una variante DFlash2.

El modelo parte de una línea base Olmo 3 y sustituye la arquitectura tipo Llama por una arquitectura tipo Gemma 3N con proporción "thin-and-deep" (d_model de 5120 y 80 capas). La decisión de mantenerse en un transformer denso en lugar de un MoE busca reducir la complejidad de infraestructura de entrenamiento y servicio, y permite que el modelo completo quepa en hardware de consumo como una NVIDIA DGX Spark según el autor. El entrenamiento se realizó íntegramente en BF16 con sharding simple y sin kernels personalizados, manteniendo un MFU del 40 % durante preentrenamiento y postentrenamiento.

La relevancia del modelo reside en su rendimiento en tareas agénticas de terminal: el autor reporta 80,52 en TerminalBench 2.1, por encima de modelos estadounidenses de pesos abiertos mucho mayores como Reflection Beam 501B (80,1), Meta Muse Spark Open 816B (76,4) o NVIDIA Nemotron 3 Ultra 550B (56,4). Se distribuye con licencia Apache 2.0, lo que facilita su uso comercial, aunque la información pública disponible es todavía escasa y el modelo se presenta como una "preview" con postentrenamiento relativamente ligero.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso, estilo Gemma 3N, proporción thin-and-deep (d_model 5120, 80 capas) |
| Parametros totales | 64.782.689.360 (≈65B) |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | Hasta 1.048.576 tokens (1 Mi); preentrenamiento a 8K, midtraining a 64K, long context a 2M |
| Tipos de cuantizacion | BF16 (este repo), NVFP4 (repo separado del autor) |
| Idiomas soportados | Predominantemente inglés y código (corpus de preentrenamiento); no se detalla lista oficial |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (custom_code) |

## Arquitectura y entrenamiento

Ripple-65B es un transformer denso con proporción thin-and-deep: un `d_model` estrecho de 5120 y 80 capas en total. El autor indica que migró desde la arquitectura tipo Llama de Olmo 3 hacia una arquitectura tipo Gemma 3N para mejorar la estabilidad del entrenamiento a escala. Entre las modificaciones técnicas destacan la sobreprovisión de cabezas de atención, un mayor ratio de capas SWA (sliding window attention) frente a capas globales con ventana SWA reducida para compensar el coste, clipping de activaciones en la FFN, atención con compuertas (gated attention), NoPE global y value residuals. El entrenamiento se realizó en BF16 sin cuantización, con sharding simple y sin kernels personalizados, alcanzando un MFU del 40 %.

El preentrenamiento se hizo desde cero sobre 12 billones de tokens de un corpus mayoritariamente en inglés y código, con secuencia de 8K y un lote que escaló de 1408 a 3072. La etapa de postentrenamiento sigue una receta estándar: midtraining (200B tokens, 64K de secuencia), long context (6,5B tokens, 2M de secuencia), SFT (183B tokens, 128K), long context SFT (13,5B tokens, 2M) y RL mixto multidominio (700 pasos, 128K, lote 2048). El autor señala que el postentrenamiento de esta preview es relativamente ligero y está centrado en codificación agéntica. La escalera de modelos Ripple v1 reporta una mejora de eficiencia de cómputo (CE) de 16x en código frente a la escalera de Olmo 3, que llega a 55x en el modelo completo.

## Capacidades

- Generación de texto y razonamiento general en inglés, con especial énfasis en tareas de razonamiento y agentes.
- Codificación agéntica: resolución de tareas en terminal, uso de herramientas y ejecución multi-paso (el autor reporta 80,52 en TerminalBench 2.1).
- Contexto largo de hasta 1.048.576 tokens, con etapas específicas de long context SFT.
- Razonamiento multi-paso y flujos agénticos con múltiples turnos de herramienta.
- Capacidades multilingües limitadas: el corpus es predominantemente inglés; no se detalla soporte de otros idiomas.
- No se documentan capacidades de visión, audio ni modo "thinking" explícito en la información disponible.
- Soporte de tool calling / function calling: no se detalla explícitamente en la model card, aunque el enfoque agéntico y las evaluaciones en TerminalBench sugieren uso de herramientas.

## Casos de uso

- Automatización de tareas en terminal: el modelo puede operar sobre entornos de línea de comandos resolviendo tareas de varios pasos, respaldado por su resultado de 80,52 en TerminalBench 2.1 y su ventana de contexto de hasta 1 Mi tokens.
- Agentes de codificación en pipelines de CI/CD: con contexto largo y capacidad multi-paso, puede revisar repositorios completos, proponer parches y ejecutar comandos de verificación dentro de un flujo automatizado.
- Asistente de desarrollo en local: al caber en hardware de consumo como una DGX Spark según el autor, permite desplegar un asistente de código sin depender de la nube.
- Análisis de bases de código extensas: la ventana de 1 Mi tokens permite cargar múltiples ficheros y trazas de ejecución en una sola pasada para tareas de refactorización o auditoría.
- Razonamiento sobre documentación técnica: útil para responder preguntas que requieren combinar fragmentos de manuales, issues y código fuente en una misma ventana de contexto.
- Investigación en agentes autónomos: su licencia Apache 2.0 y su disponibilidad en BF16 y NVFP4 lo hacen adecuado para experimentación académica y prototipado de sistemas multi-agente.
- Despliegue en servidores con GPU de datacenter: el autor reporta 250 tok/s en 2xB200 con batch=8 antes de cuantización o kernels personalizados, lo que lo hace viable para servicios de inferencia de baja latencia.

## Benchmarks y rendimiento

El autor publica resultados en TerminalBench 2.1 comparando con modelos estadounidenses de pesos abiertos. La información disponible solo incluye parcialmente la tabla; los datos completos de otros benchmarks no están disponibles.

| Benchmark | Ripple-65B Preview | Nemotron 3 Ultra 550B | Inkling 975B | Muse Spark Open 816B | Reflection Beam 501B |
|---|---|---|---|---|---|
| TerminalBench 2.1 | 80,52 | 56,4 | 63,8 | 76,4 | 80,1 |

No se han publicado en la información disponible resultados de MMLU, HumanEval, GSM8K ni otros benchmarks estándar.

## Requisitos de hardware

- VRAM estimada en BF16: aproximadamente 130 GB de pesos (el repositorio ocupa 129,6 GB), por lo que requiere al menos 2 GPU de 80 GB o una GPU con 141 GB o más para inferencia sin cuantización.
- VRAM estimada en NVFP4: alrededor de 32-40 GB de pesos, lo que permite ejecución en una sola GPU de 48 GB o en configuraciones de consumo de gama alta (RTX 4090 de 24 GB no sería suficiente sin cuantización adicional).
- GPU recomendadas: NVIDIA B200 (el autor reporta 250 tok/s en 2xB200 con batch=8), H100, A100 80 GB. El autor indica que el modelo cabe en una NVIDIA DGX Spark.
- Cabe en GPU de consumo: solo en formato NVFP4 y con suficiente VRAM; una RTX 4090 de 24 GB no es suficiente para el checkpoint completo.
- Opciones de despliegue: el repositorio usa `custom_code`, por lo que requiere `trust_remote_code=True` en Transformers. No se confirma soporte de vLLM, llama.cpp, Ollama o TGI en la información disponible.
- Latencia y throughput: 250 tok/s en 2xB200 con batch=8 antes de cuantización o kernels personalizados (dato del autor).

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | TerminalBench 2.1 | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Ripple-65B Preview | 65B (denso) | 1 Mi | 80,52 | Apache 2.0 | Hugging Face (BF16, NVFP4, base, DFlash2) |
| Reflection Beam 501B | 501B | no disponible | 80,1 | no disponible | pesos abiertos (EE. UU.) |
| Meta Muse Spark Open 816B | 816B | no disponible | 76,4 | no disponible | pesos abiertos (EE. UU.) |
| NVIDIA Nemotron 3 Ultra 550B | 550B | no disponible | 56,4 | no disponible | pesos abiertos (EE. UU.) |
| Thinking Machines Inkling 975B | 975B | no disponible | 63,8 | no disponible | pesos abiertos (EE. UU.) |

## Limitaciones y advertencias

- Modelo en fase "preview": el postentrenamiento es relativamente ligero y centrado en codificación agéntica, por lo que su comportamiento en dominios generales puede ser inferior al de modelos con postentrenamiento más completo.
- Sesgos: el corpus de preentrenamiento es predominantemente inglés y código, lo que puede introducir sesgos culturales y lingüísticos y limitar el rendimiento en otros idiomas.
- Riesgo de alucinación: no se documentan evaluaciones específicas de fidelidad factual en la información disponible.
- Contexto: aunque soporta hasta 1 Mi tokens, el preentrenamiento se hizo a 8K y el midtraining a 64K; el rendimiento en contextos muy largos puede degradarse.
- Licencia Apache 2.0: permite uso comercial, pero el modelo se distribuye con `custom_code`, lo que obliga a revisar el código remoto antes de desplegarlo en producción.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta, y autoría bajo la cuenta Bloomedmvp (el README referencia la organización ricursiveAI): conviene verificar la procedencia y la integridad de los pesos antes de usarlos.
- No se confirma soporte en frameworks de inferencia populares (vLLM, llama.cpp, Ollama, TGI), lo que puede complicar el despliegue.

## Enlaces

- Hugging Face (este repositorio): https://huggingface.co/Bloomedmvp/Ripple-65B-Preview
- Hugging Face (BF16, organización del autor): https://huggingface.co/ricursiveAI/Ripple-65B-Preview
- Hugging Face (NVFP4): https://huggingface.co/ricursiveAI/Ripple-65B-Preview-NVFP4
- Hugging Face (modelo base): https://huggingface.co/ricursiveAI/Ripple-65B-Base-Preview
- Hugging Face (DFlash2): https://huggingface.co/ricursiveAI/Ripple-65B-Preview-DFlash2
- Blog de lanzamiento: https://www.ricursive.com/ripple
- Licencia: https://huggingface.co/ricursiveAI/Ripple-65B-Preview/blob/main/LICENSE
