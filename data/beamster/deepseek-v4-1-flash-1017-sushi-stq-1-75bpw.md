# beamster/DeepSeek-V4.1-Flash-1017-Sushi-STQ-1.75bpw

## Resumen

DeepSeek-V4.1-Flash-1017-Sushi-STQ-1.75bpw es una cuantización extrema del modelo base deepseek-ai/DeepSeek-V4.1-Flash-1017, empaquetada por el usuario beamster para ejecutarse de forma nativa en Apple Silicon mediante el motor de inferencia sushi (un fork de mlx-serve). El pack aplica la técnica STQ (Sushi Trellis Quant) a los expertos enrutados del modelo MoE, reduciendo el peso medio a 1,75 bits por parámetro, y está pensado para llevar un modelo de 261.320.630.994 parámetros con contexto de hasta 1.048.576 tokens a hardware Mac de gama alta.

El problema que resuelve es claro: los modelos MoE de más de 200 mil millones de parámetros son inviables en máquinas de consumidor con formatos convencionales (el pack ocupa unos 309 GiB en disco frente a los 342,7 GB de la alternativa oQ2.5e). Gracias a la cuantización agresiva de expertos y a la lectura de las tablas Engram directamente desde SSD, el modelo cabe en Macs con memoria unificada suficiente y mantiene una calidad razonable: un KLD de 0,2197 frente al checkpoint original y un 85,64 % de acuerdo top-1.

Es relevante porque combina multimodalidad (image-text-to-text), contexto de un millón de tokens, decodificación especulativa de tres etapas (DSpark) y una licencia MIT heredada del modelo base, todo ello ejecutable localmente en Apple Silicon. Requiere sushi v1.4.0 o superior y macOS 26.2 o posterior.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE (deepseek_v41), con torre de visión incluida (image-text-to-text) |
| Parametros totales | 261.320.630.994 |
| Parametros activos | no disponible |
| Longitud de contexto | hasta 1.048.576 tokens |
| Tipos de cuantizacion | STQ PAIR1 2 bits (expertos enrutados, 1,75 bits medios), STQ SPEC1 4 bits (expertos de etapa especulativa), STQ SPEC1 6 bits (lm_head), afín a 4 bits (embedding), FP8 E4M3 con escalas E8M0 (tablas Engram), bf16 (torre de visión) |
| Idiomas soportados | no disponibles |
| Licencia | MIT |
| Formato de pesos | safetensors (pack Sushi-STQ, solo compatible con sushi) |

## Arquitectura y entrenamiento

El modelo base es un MoE de la familia DeepSeek con 40 capas y 384 expertos enrutados por capa. Este pack cuantiza esos expertos con STQ (Sushi Trellis Quant) usando codewords bidimensionales PAIR1 a 1,75 bits de media, mientras que la cabeza de lenguaje se cuantiza con el codebook SPEC1 a 6 bits y los embeddings con cuantización afín a 4 bits. Una innovación destacable es el manejo de las tablas Engram: se conservan en FP8 E4M3 con escalas E8M0 tal como se publicaron, pero se leen directamente desde SSD y nunca se cargan en la memoria de GPU, lo que reduce drásticamente los requisitos de memoria unificada.

El pack incluye además DSpark, un esquema de decodificación especulativa de tres etapas (expertos de etapa a 2 bits PAIR1 y tronco de etapa a 4 bits SPEC1) y la torre de visión en bf16, que habilita la entrada de imágenes. No hay información en la ficha sobre los datos de entrenamiento del modelo base (número de tokens, composición del dataset o alineamiento con RLHF/DPO); solo se conoce el entrenamiento de la cuantización, validada por divergencia KLD frente al checkpoint original.

## Capacidades

- Generación de texto y razonamiento, heredadas del modelo base DeepSeek-V4.1-Flash-1017, con soporte de "thinking" configurable (el bench de tool calling se ejecutó con thinking en nivel alto).
- Entrada multimodal imagen-texto (pipeline image-text-to-text) gracias a la torre de visión incluida en bf16.
- Tool calling / function calling: puntuación de 92/100 (178 de 194 puntos sobre 97 escenarios) en tool-eval-bench 3.0.0 en modo hard.
- Contexto ultra-largo de hasta 1.048.576 tokens.
- Decodificación especulativa mediante DSpark (tres etapas), activable con presupuesto de SSD configurable (`--ssd-budget-gb`).
- Capacidades multilingües: no disponible (aunque se evaluó la categoría multilingual en KLD, no se especifica la lista de idiomas).
- Ejecución nativa en Apple Silicon sin GPU NVIDIA.

## Casos de uso

- Asistentes con acceso a herramientas en local: con 92/100 en tool-eval-bench 3.0.0 en modo hard, el modelo puede orquestar llamadas a funciones en agentes que consultan APIs, bases de datos o servicios internos sin salir del Mac.
- Análisis de documentos extensos: la ventana de 1.048.576 tokens permite procesar repositorios de código, contratos o bibliotecas completas en una sola pasada, con las tablas Engram leídas desde SSD para no saturar la memoria.
- Comprensión de imágenes y documentos visuales: la torre de visión en bf16 permite preguntas sobre capturas, diagramas o PDFs escaneados dentro de pipelines multimodales locales.
- Agentes multi-paso con razonamiento: el modo thinking en nivel alto combinado con tool calling y contexto largo es adecuado para flujos de trabajo de varias etapas (planificación, ejecución, verificación).
- Desarrollo de software asistido por IA: la categoría de código presenta el KLD más bajo del pack (0,0357), lo que sugiere que la generación de código es la capacidad mejor preservada tras la cuantización.
- Privacidad y despliegue on-device: al ejecutarse íntegramente en Apple Silicon, es apto para entornos donde los datos no pueden salir de la máquina (salud, legal, defensa).
- Escritura y narrativa creativa: la categoría de story obtiene el KLD más alto (0,4878), por lo que conviene validar la calidad en tareas creativas antes de usarlas en producción.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) para este pack. Los datos disponibles son mediciones de fidelidad de cuantización y una evaluación de tool calling, publicadas por el autor:

| Métrica | Sushi-STQ-1.75bpw | oQ2.5e (referencia, 2,96 bits) |
|---|---|---|
| KLD (16 prompts x 512 tokens, hasta EOS) | 0,2197 | 0,2575 |
| Acuerdo top-1 (misma lectura) | 85,64 % | 85,33 % |
| KLD (8 categorías, 16 x 512) | 0,1843 | 0,1717 |
| Acuerdo top-1 (8 categorías) | 88,53 % | 89,17 % |

KLD por categoría (a primer EOS; lecturas con prompts distintos no comparables entre sí):

| Pack | code | math | reasoning | design | wikitext | multilingual | story | science |
|---|---|---|---|---|---|---|---|---|
| Sushi-STQ-1.75bpw | 0,0357 | 0,0598 | 0,1176 | 0,1593 | 0,2714 | 0,2733 | 0,4878 | 0,0985 |
| oQ2.5e | 0,0298 | 0,0677 | 0,0831 | 0,1474 | 0,3014 | 0,2868 | 0,4152 | 0,0805 |

| Benchmark de tools | Resultado |
|---|---|
| tool-eval-bench 3.0.0, modo hard (seed 42, sin tools en vivo, thinking alto, DSpark activo, `--ssd-budget-gb 108`) | 92/100, 178 de 194 puntos, 97 escenarios |

## Requisitos de hardware

- Memoria y disco: el pack ocupa ~309 GiB en disco (120 GiB de pesos + 189 GiB de tablas Engram; el repositorio HuggingFace pesa 332,1 GB). Las tablas Engram se leen desde SSD y no se cargan en memoria, pero el bench oficial usó un presupuesto de SSD de 108 GB (`--ssd-budget-gb 108`).
- Plataforma: exclusivamente Apple Silicon con macOS 26.2 o posterior y sushi v1.4.0 o superior. No es compatible con llama.cpp, Ollama, vLLM, TGI ni con GPU NVIDIA.
- No cabe en GPU de consumidor convencional: el despliegue objetivo son Macs con memoria unificada de gama alta (no se especifican los modelos exactos de Mac ni sus requisitos mínimos; la documentación de sushi indica memoria y contexto por Mac).
- Despliegue: únicamente mediante el motor sushi (fork de mlx-serve de ddalcu), con soporte de DSpark y presupuesto de SSD configurable.
- Latencia y throughput: no disponibles (no se publican tokens/segundo ni tiempos de primer token).

## Comparativa con modelos similares

| Pack | Bits medios (expertos) | Tamaño en disco | KLD (16x512) | Acuerdo top-1 | Motor | Licencia |
|---|---|---|---|---|---|---|
| Sushi-STQ-1.75bpw | 1,75 | 332,1 GB | 0,2197 | 85,64 % | sushi (Apple Silicon) | MIT |
| oQ2.5e (oMLX) | 2,96 | 342,7 GB | 0,2575 | 85,33 % | mlx-serve | no disponible |

Comparativa con otros modelos o cuantizaciones alternativas (por ejemplo, el checkpoint original deepseek-ai/DeepSeek-V4.1-Flash-1017 en FP8 u otros packs de cuantización): no disponible; solo se publica la comparación con oQ2.5e en la model card.

## Limitaciones y advertencias

- Compatibilidad cerrada: el pack solo funciona con sushi v1.4.0+ en Apple Silicon con macOS 26.2+. No es utilizable en entornos Linux/NVIDIA ni con runtimes estándar (llama.cpp, vLLM, Ollama).
- Fidelidad degradada por la cuantización extrema: a 1,75 bits por peso en los expertos, el KLD frente al original es de 0,2197 y el acuerdo top-1 del 85,64 %; la categoría de story muestra el KLD más alto (0,4878), lo que indica mayor degradación en generación creativa.
- Riesgo de alucinación: no cuantificado en la model card; al tratarse de una cuantización muy agresiva, conviene validar las salidas en tareas críticas.
- Sesgos: no disponibles; heredados presumiblemente del modelo base, sobre el que tampoco se publica información de sesgos en esta ficha.
- Idiomas soportados: no disponibles; solo hay una medición de KLD en la categoría multilingual sin detalle de idiomas.
- Requisitos de almacenamiento elevados: ~309 GiB en disco y un presupuesto de SSD para las tablas Engram (el bench usó 108 GB), lo que exige SSDs rápidos y con espacio amplio.
- Licencia: MIT, por lo que el uso comercial está permitido sin restricciones destacables, siempre respetando la licencia del modelo base (también MIT).
- Dependencia de un proyecto de terceros: el pack depende de sushi (fork de mlx-serve), un motor comunitario; verificar su mantenimiento antes de despliegues en producción.

## Enlaces

- Pack cuantizado: https://huggingface.co/beamster/DeepSeek-V4.1-Flash-1017-Sushi-STQ-1.75bpw
- Modelo base: https://huggingface.co/deepseek-ai/DeepSeek-V4.1-Flash-1017
- Motor sushi: https://github.com/beamivalice/sushi
- Documentación de uso de sushi (instalación, flags, memoria y contexto por Mac): https://github.com/beamivalice/sushi/blob/main/docs/usage.md
- mlx-serve (proyecto del que sushi es fork): https://github.com/ddalcu/mlx-serve
