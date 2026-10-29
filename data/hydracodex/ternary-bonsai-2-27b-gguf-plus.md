# HYDRACODEX/Ternary-Bonsai-2-27B-gguf-plus

## Resumen

Ternary Bonsai 2 27B es un modelo de lenguaje causal de 27B de clase derivado de Qwen/Qwen3.8-27B, cuantizado íntegramente en pesos ternarios ({−1, 0, +1}) con escalas FP16 por grupo de 128 pesos. Lo desarrolla Prism ML y lo publica en HuggingFace; el repositorio analizado (HYDRACODEX/Ternary-Bonsai-2-27B-gguf-plus) es una republicación en formato GGUF para llama.cpp. La arquitectura del modelo base se mantiene sin cambios: atención híbrida (aproximadamente 75% lineal y 25% completa), MLP SwiGLU, RoPE y RMSNorm, con 262.144 tokens de contexto.

El problema que resuelve es el colapso de calidad típico de las representaciones de menos de 4 bits: según la model card, esta build retiene el 98,2% de la inteligencia del modelo en FP16 (media de 84,78 en 14 benchmarks en modo thinking) frente a 72,59 de una cuantización IQ2_XXS convencional, y a solo 0,4 puntos de una UD-Q4_K_XL que ocupa el triple. Todo ello con un fichero de 5,95 GB (PTQ1_0) o 7,21 GB (PQ2_0), es decir, un 27B con razonamiento, código, matemáticas y tool calling ejecutable en un portátil o en una única GPU de consumo.

Es relevante ahora porque demuestra que el régimen ternario real (1,72 bits por peso efectivos, sin "escapes" de alta precisión en las matrices del lenguaje) puede conservar capacidades agénticas y de razonamiento largo, algo que las cuantizaciones de 2 bits convencionales no logran. A cambio, exige kernels personalizados: el modelo solo carga en un fork de llama.cpp con soporte de PTQ1_0/PQ2_0 y de la base rotada de Hadamard.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer causal con atención híbrida (~75% lineal / ~25% completa), SwiGLU, RoPE, RMSNorm; pesos ternarios en base rotada |
| Parámetros totales | 27,36B según model card (24,35B backbone de lenguaje en 64 bloques + 2,54B embedding/LM head + 0,46B torre de visión en 27 bloques). El safetensors del repo declara 26.895.998.464 parámetros |
| Parámetros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 262.144 tokens (heredado del modelo base) |
| Tipos de cuantización | PTQ1_0 (trits densos, 1,75 bits/peso, 5,95 GB) y PQ2_0 (trit en slot de 2 bits, 2,13 bits/peso, 7,21 GB); torre de visión opcional en mmproj Q8_0 de ~0,63 GB. Media global: 1,72 bits/peso |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (llama.cpp); existe companion nativo en MLX 2-bit |
| Tamaño del repositorio | 68,5 GB (incluye ambas empaquetaduras GGUF y el mmproj) |
| Backends soportados | llama.cpp en CUDA, Metal y CPU (fork de Prism ML) |
| Base rotada | Hadamard por bloques de 1024 con signos ±1 fijos, plegada en los pesos almacenados; la transformación equivalente se aplica a las activaciones en tiempo de ejecución |

## Arquitectura y entrenamiento

El modelo conserva la arquitectura del base Qwen3.8-27B: 64 bloques con atención híbrida, donde aproximadamente el 75% de las capas usan atención lineal y el 25% restante atención completa. Esa proporción es lo que permite sostener 262.000 tokens de contexto en dispositivo sin un coste cuadrático prohibitivo en el KV cache. La torre de visión (27 bloques, 0,46B de parámetros) se distribuye aparte como mmproj en Q8_0 y solo se carga cuando hay entrada de imagen, de modo que el fichero de lenguaje puro se queda en 5,95/7,21 GB.

La innovación central es el esquema de pesos: cada matriz se transforma primero con una rotación ortogonal de Hadamard por bloques (bloque 1024, signos fijos ±1) y solo después se asigna el valor ternario, con una escala FP16 compartida por cada 128 pesos. La rotación se pliega offline en los pesos almacenados —no consume bits ni tráfico extra de memoria— y el runtime aplica la transformada correspondiente a las activaciones; si un runtime no la soporta, el modelo declara la rotación en metadatos y se niega a cargar. La cobertura ternaria incluye embeddings, proyecciones de atención, proyecciones del MLP y LM head, sin tensores de alta precisión escondidos tras la etiqueta de 2 bits.

No se han publicado en la información disponible detalles sobre el dataset de entrenamiento, el número de tokens, la composición de los datos ni sobre si hubo RLHF, DPO u otras etapas de alineamiento posteriores al modelo base. Tampoco se documenta el procedimiento exacto de cuantización (calibración, número de muestras, criterio de asignación de trits) más allá de la descripción del formato y de la rotación.

## Capacidades

- Generación de texto conversacional y en modo thinking (razonamiento explícito), herencia directa del base.
- Razonamiento matemático: la model card reporta 96,57 en su benchmark de matemáticas, a menos de medio punto del modelo en FP16.
- Generación de código: 89,42, al nivel del baseline sin cuantizar según el autor.
- Tool calling y comportamiento agéntico multi-paso: 74,92 en la métrica de tool calling agéntico declarada por el autor.
- Entrada multimodal de imagen, mediante el mmproj Q8_0 opcional (~0,63 GB) que se carga solo cuando se envían imágenes.
- Contexto largo de 262.144 tokens, viable en dispositivo gracias al backbone predominantemente lineal.
- Ejecución on-device en CUDA, Metal y CPU; ~47 tok/s en un portátil con Apple M5 Max según el autor.
- Soporte de endpoints compatibles (etiqueta `endpoints_compatible` en el repo).
- Capacidades multilingües: no disponible en la información proporcionada.

## Casos de uso

- Asistente de razonamiento en portátil: con 5,95 GB en PTQ1_0, el modelo cabe en la VRAM de un portátil con GPU de consumo o se ejecuta en Metal/CPU, lo que permite tener un 27B con modo thinking sin conexión ni cuotas de API.
- Procesamiento de documentación extensa: los 262.144 tokens de contexto admiten contratos, expedientes o bases de código completas en una sola pasada, algo inviable con modelos de 8K-32K en el mismo presupuesto de memoria.
- Agente con tool calling en local: los 74,92 declarados en tool calling agéntico permiten encadenar llamadas a funciones (consulta a bases de datos, APIs internas, ejecución de scripts) en un pipeline self-hosted donde no se pueden enviar datos a terceros.
- Generación y revisión de código en entornos con GPU modesta: con 89,42 en la métrica de código del autor y solo ~6 GB de pesos, se puede integrar en un servidor de CI con una única GPU para autocompletado, revisión de diffs o generación de tests.
- Análisis de imágenes con texto asociado: el mmproj Q8_0 añade descripción de capturas, extracción de datos de documentos escaneados o soporte a tickets con adjuntos, cargando la torre de visión solo en las peticiones que la necesitan.
- Despliegue en flotas de dispositivos o edge: al ser GGUF con kernels CUDA/Metal/CPU, el mismo artefacto sirve para estaciones de trabajo y servidores sin mantener dos formatos distintos.
- Evaluación comparativa de cuantizaciones de bajo bit: útil como referencia reproducible para medir la pérdida de capacidades al bajar de 4 bits en arquitecturas híbridas.

## Benchmarks y rendimiento

La model card ofrece resultados agregados, pero no identifica los nombres concretos de los 14 benchmarks empleados ni publica la tabla desglosada en la información disponible. Los valores se reproducen tal cual, sin reinterpretación:

| Métrica (según model card) | Ternary Bonsai 2 27B | IQ2_XXS convencional | UD-Q4_K_XL |
|---|---|---|---|
| Media de 14 benchmarks en modo thinking | 84,78 | 72,59 | A 0,4 puntos por encima del ternario (valor exacto no disponible) |
| Retención de inteligencia vs FP16 | 98,2% | No disponible | Referencia (FP16 = 100%) |
| Matemáticas | 96,57 (a menos de medio punto de FP16) | No disponible | No disponible |
| Código | 89,42 (nivel del baseline) | No disponible | No disponible |
| Tool calling agéntico | 74,92 | No disponible | No disponible |
| Huella en disco | 5,95 GB (PTQ1_0) / 7,21 GB (PQ2_0) | ~82% de la huella del ternario | ~3 veces la huella del ternario |
| Velocidad | ~47 tok/s en Apple M5 Max | No disponible | No disponible |

No se han publicado en la información disponible resultados de MMLU, HumanEval, GSM8K ni de otros benchmarks con nombre estándar, ni comparaciones contra modelos de otras familias.

## Requisitos de hardware

- VRAM mínima estimada para los pesos: 5,95 GB (PTQ1_0) o 7,21 GB (PQ2_0); añadir ~0,63 GB si se usa la entrada de imagen.
- Cabe en GPU de consumo: sí, los pesos solos entran en tarjetas de 8 GB; para contexto largo hay que sumar el KV cache, cuyo tamaño no está documentado en la información disponible.
- GPU recomendadas: no hay lista oficial. El autor valida CUDA (NVIDIA), Metal (Apple Silicon) y CPU; no se publican cifras para A100, H100 ni RTX 4090.
- Rendimiento de referencia: ~47 tok/s en un portátil con Apple M5 Max. No hay datos de throughput en GPU NVIDIA.
- Opciones de despliegue: llama.cpp mediante el fork de Prism ML (obligatorio para PTQ1_0/PQ2_0 y para la base rotada); inferencia nativa en Apple Silicon mediante el companion MLX 2-bit y los forks de mlx y mlx-swift (iOS/macOS). vLLM, TGI, Ollama y otros runners no aparecen como soportados en la información disponible.
- Advertencia de despliegue: el llama.cpp upstream sin los kernels ternarios no podrá cargar estos pesos, ya que el modelo declara la rotación en metadatos y rechaza la carga si el runtime no aplica la transformada.
- Requisitos de disco: el repo completo ocupa 68,5 GB; conviene descargar solo el fichero de la empaquetadura elegida.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato / bits | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Ternary Bonsai 2 27B (este repo, GGUF) | 27,36B (26,9B en safetensors) | 262.144 | GGUF ternario, 1,72 bits/peso, 5,95-7,21 GB | Media 84,78 en 14 benchmarks thinking; 98,2% de FP16 | Apache 2.0 | Público en HF; requiere fork de llama.cpp |
| Ternary Bonsai 2 27B MLX 2-bit | Mismo modelo base | 262.144 | MLX 2-bit | No disponible (companion oficial) | Apache 2.0 | Público en HF (prism-ml) |
| IQ2_XXS del mismo base (cuantización convencional) | ~27B | Según base | GGUF 2 bits | Media 72,59; colapso en razonamiento y agentes | Apache 2.0 | Público |
| UD-Q4_K_XL del mismo base | ~27B | Según base | GGUF ~4-5 bits | 0,4 puntos por encima del ternario, con ~3x la huella | Apache 2.0 | Público |

No se dispone de comparaciones con modelos de otras familias (por ejemplo, modelos densos de 24-32B en FP8 o 4 bits) en la información proporcionada.

## Limitaciones y advertencias

- La model card no documenta sesgos conocidos, composición del dataset ni evaluación de seguridad; no hay información sobre alineamiento o filtros de contenido.
- Riesgo de alucinación: no cuantificado por el autor. La pérdida de 1,8 puntos porcentuales de inteligencia respecto a FP16 puede concentrarse en tareas de razonamiento de cola larga, aunque el autor reporta estabilidad en matemáticas y código.
- Idiomas soportados: no disponible. No se puede asumir cobertura multilingüe más allá de la del modelo base, que tampoco se detalla.
- Dependencia de un fork: sin los kernels ternarios de Prism ML, el modelo no se carga. Esto limita el soporte en vLLM, TGI, Ollama y servicios gestionados, y obliga a fijar versiones de binarios.
- La torre de visión no es ternaria (Q8_0), por lo que el consumo de memoria y el rendimiento en modo multimodal se desvían del perfil del resto del modelo.
- El repositorio analizado es una republicación de HYDRACODEX con el sufijo "+plus" cuyo contenido diferencial no está documentado en la model card ni en los metadatos. No hay garantía de que coincida bit a bit con la publicación oficial de Prism ML.
- Señales de validación externa débiles: 0 descargas y 0 likes en el momento de la consulta, y actualización el mismo día de la creación.
- Coherencia de parámetros: el safetensors declara 26,9B y la model card 27,36B. La diferencia probablemente incluye la torre de visión y el LM head, pero no se explica en la información disponible.
- Existen derivados de terceros no oficiales, incluidas variantes con los rechazos eliminados, sin auditoría ni relación con el autor original; su uso en producción no está recomendado sin evaluación propia.
- Licencia Apache 2.0: permite uso comercial y derivados, pero no exime de cumplir las obligaciones de atribución ni de las condiciones del modelo base.

## Enlaces

- Modelo en HuggingFace (este repo): https://huggingface.co/HYDRACODEX/Ternary-Bonsai-2-27B-gguf-plus
- Documentación oficial del modelo: https://docs.prismml.com/models/bonsai-2-27b
- Web de Prism ML: https://prismml.com
- Whitepaper: https://github.com/PrismML-Eng/Bonsai-demo/blob/main/bonsai-2-27b-whitepaper.pdf
- Demo y ejemplos: https://github.com/PrismML-Eng/Bonsai-demo
- Fork de llama.cpp con kernels ternarios (CUDA + Metal): https://github.com/PrismML-Eng/llama.cpp
- Fork de MLX (Apple Silicon): https://github.com/PrismML-Eng/mlx
- Fork de mlx-swift (iOS/macOS): https://github.com/PrismML-Eng/mlx-swift
- Companion MLX 2-bit: https://huggingface.co/prism-ml/Ternary-Bonsai-2-27B-mlx-2bit
- Problemas conocidos: https://huggingface.co/prism-ml/Ternary-Bonsai-2-27B-gguf/blob/main/KNOWN_ISSUES.md
- Discord de la comunidad: https://discord.gg/prismml
- Republicación de terceros en GGUF: https://huggingface.co/TechnoBaptist/Ternary-Bonsai-2-27B-gguf
- Binarios precompilados para Google Colab: https://huggingface.co/IamPradeep/Ternary-Bonsai-2-27B-GGUF-Colab-Prebuilt-GPU
- Ficha de terceros con descargas agregadas: https://local-ai-zone.github.io/models/ternary-bonsai-2-27b.html
- Artículo sobre un derivado no oficial sin rechazos: https://hackernoon.com/bonsai-2-27b-ternary-crack-gguf-a-27b-model-with-refusals-removed
