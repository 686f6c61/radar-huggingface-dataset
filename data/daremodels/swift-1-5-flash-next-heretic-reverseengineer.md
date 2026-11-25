# DareModels/Swift-1.5-Flash-Next-Heretic-ReverseEngineer

## Resumen

Swift-1.5-Flash-Next-Heretic-ReverseEngineer es una cuantización GGUF del modelo jeffpeng3/Swift-1.5-Qwen3.8-Flash-Next-heretic, una variante "abliterated" (sin rechazo) del modelo Swift 1.5 Flash de ukisai, que a su vez se basa en la arquitectura Qwen3.8. El modelo lo publica DareModels (cuantizado por el usuario trubisky) y está específicamente optimizado para tareas de ingeniería inversa, análisis de binarios, desensamblado y explotación de software, además de razonamiento general y código.

La relevancia de esta ficha radica en que se trata de un modelo de arquitectura MoE de gran tamaño (176.943.899.520 parámetros totales según los pesos en safetensors) distribuido exclusivamente en formato GGUF cuantizado, con recetas de cuantización personalizadas (IQ4_NL, IQ4_XS-plus, IQ3_S-85G) diseñadas para encajar en configuraciones de hardware concretas, como una estación con 3× V100 de 32 GB (96 GB de VRAM). Incluye además un runtime pack precompilado para el motor Strata.

El modelo ha sido deliberadamente descensurado (se le ha eliminado el comportamiento de rechazo) y su matriz de importancia (imatrix) incorpora un 8,8 % de contenido de ingeniería inversa y un 2,0 % de contenido de respuesta directa sin rechazo en dominios sensibles. Esto lo hace relevante para investigadores de seguridad y desarrolladores que necesitan un modelo local sin filtros de rechazo, pero también conlleva advertencias importantes de uso responsable y legal.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE (Mixture of Experts), familia Qwen3.8 (tag `qwen3_8`, `moe`) |
| Parametros totales | 176.943.899.520 (dato real de safetensors) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | IQ4_NL (receta mixta personalizada, ~108,9 GB en 8 shards), IQ4_XS-plus (94,7 GB), IQ3_S-85G (~84,6 GB en 8 shards, 3,36 bpw de masa de expertos) |
| Idiomas soportados | en, zh |
| Licencia | swift-open-license-1.0 (etiquetada como `other` en Hugging Face) |
| Formato de pesos | GGUF (shards), más runtime pack propietario para Strata (`dense.bin`, `index.txt`, `native_experts.txt`, `conversions.json`, `compat-bf16.json`, tokenizer) |

## Arquitectura y entrenamiento

El modelo es una arquitectura MoE (Mixture of Experts) perteneciente a la familia Qwen3.8, según los tags del repositorio. No se dispone de información detallada sobre el número de parámetros activos, la composición exacta del dataset de preentrenamiento ni el proceso de alineación (RLHF/DPO) del modelo base original. Lo que sí documenta el autor es el proceso de "abliteración" (eliminación del comportamiento de rechazo) llevado a cabo por jeffpeng3 en los pesos v2, que según la model card logró preservar tanto la capacidad de razonamiento como la longitud de salida, una combinación que el autor califica de difícil de conseguir.

La innovación técnica más destacable de esta publicación es la metodología de cuantización. Se construyó una imatrix específica de 837 entradas y 399.876 tokens en formato nativo de plantilla de chat Qwen (`<|im_start|>`), con una distribución temática deliberada: cadena de pensamiento (22,2 %), prompts de sistema (19,5 %), diseño y arquitectura (13,5 %), uso agéntico de herramientas (12,4 %), matemáticas (7,1 %), razonamiento espacial (5,4 %), trampas y premisas falsas (4,5 %), juicio situacional (4,5 %), ingeniería inversa (8,8 %) y dominio heretic sin rechazo (2,0 %). Esta matriz se fusionó con otra del equipo AtomicChat (medida sobre el modelo base sin comprimir) con una ponderación del 70 % para la matriz propia en los canales con datos sólidos, desplazándose suavemente hacia el 100 % de AtomicChat en los canales con pocas muestras. La asignación de bits se concentra en las últimas 12 capas, donde la auditoría de energía de activación mostró un aumento de 3× en la energía de down-projection a partir de la capa 36, con un pico en la capa 47 (el tensor más caliente de la red, 48× la capa 2).

## Capacidades

- Generación de texto conversacional multi-turno en inglés y chino.
- Razonamiento paso a paso con capacidad de auto-verificación y backtracking (según la composición de la imatrix de cadena de pensamiento).
- Generación y revisión de código, con énfasis en planificación de APIs, refactorización y razonamiento sobre decisiones de diseño.
- Uso agéntico de herramientas: cadenas de llamadas a funciones, bucles de edición de ficheros, recuperación de errores y function calling.
- Matemáticas: aritmética, álgebra, demostraciones trabajadas y manipulación simbólica.
- Razonamiento espacial: rejillas, transformaciones 2D/3D, coordenadas y empaquetado.
- Ingeniería inversa: desensamblado x86-64/ARM64, crítica de decompilación de Ghidra, internals de ELF/PE/Mach-O, anti-debug/anti-VM, deobfuscación de cadenas, aplanado de CFG, devirtualización, watchpoints de rendimiento, trazas con LD_PRELOAD/Frida/eBPF, ingeniería inversa de protocolos, round-tripping de formatos, fusión de ABI de plugins y análisis de firmware.
- Procesamiento de imagen a texto (pipeline `image-text-to-text`), con proyector de visión (`mmproj`) contemplado en la receta de cuantización.
- Modo "sin rechazo" (heretic): respuestas directas en dominios que normalmente activarían negativas del modelo.
- Capacidad de razonamiento eficiente (tag `reasoning-efficient`).

## Casos de uso

- Análisis de binarios y malware: el modelo puede examinar desensamblados x86-64/ARM64 y criticar la salida de decompiladores como Ghidra, identificando patrones de anti-debug, ofuscación de cadenas y aplanado de flujo de control, gracias al 8,8 % de contenido de ingeniería inversa en su imatrix.
- Auditoría de seguridad de firmware y formatos propietarios: útil para round-tripping de formatos, análisis de internals ELF/PE/Mach-O y reconstrucción de protocolos de red, tareas para las que la receta de cuantización reserva bits específicamente.
- Asistencia en pipelines de CI/CD para revisión de código: soporta tool calling y puede integrarse en bucles de edición de ficheros y recuperación de errores, lo que permite automatizar revisiones de parches y refactorizaciones con contexto largo.
- Investigación en seguridad ofensiva controlada: el modelo está entrenado para responder sin rechazo en cadenas de explotación ELF, inyección de procesos frente a EDR, mecánica de parcheo de comprobaciones de licencia y ingeniería de protocolos C2, lo que lo hace adecuado para laboratorios de pentesting con autorización explícita.
- Desarrollo de agentes autónomos locales: con capacidad de razonamiento paso a paso, uso de herramientas y planificación de APIs, puede desplegarse en un rig de 96 GB de VRAM (3× V100 32 GB) como backend de agentes que operan sobre repositorios de código.
- Análisis de firmware embebido: la combinación de razonamiento espacial, matemáticas y conocimiento de formatos binarios permite abordar tareas de ingeniería inversa de firmware y dispositivos.
- Atención al cliente o asistentes conversacionales sin filtros: para entornos donde se requiere una política de rechazo nula (por ejemplo, investigación de contenido sensible), el modelo puede gestionar conversaciones multi-turno en inglés y chino.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: la receta IQ4_NL está dimensionada para 96 GB de VRAM (3× V100 de 32 GB), con margen para el proyector de visión (`mmproj`), prefill por lotes de 8192 tokens y streaming de KV. La variante IQ4_XS-plus ocupa 94,7 GB y la IQ3_S-85G unos 84,6 GB.
- GPU recomendadas: 3× NVIDIA V100 de 32 GB (configuración objetivo declarada). Para las variantes de menor tamaño (IQ3_S-85G) podría ser necesario un rig de al menos 80-96 GB de VRAM total, aunque no se especifica una configuración alternativa.
- No cabe en GPU de consumo (RTX 4090 de 24 GB, RTX 3090 de 24 GB) en ninguna de las cuantizaciones publicadas, dado que el modelo completo ronda los 85-109 GB en GGUF.
- Opciones de despliegue: motor Strata (runtime pack precompilado incluido en el repositorio), y presumiblemente llama.cpp para los ficheros GGUF, aunque la model card no detalla explícitamente el soporte de llama.cpp, vLLM, Ollama o TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros totales | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Swift-1.5-Flash-Next-Heretic-ReverseEngineer (este) | 176.943.899.520 | no disponible | swift-open-license-1.0 | GGUF | Cuantización especializada en ingeniería inversa, sin rechazo |
| jeffpeng3/Swift-1.5-Qwen3.8-Flash-Next-heretic (modelo base) | no disponible | no disponible | no disponible | safetensors (presumiblemente) | Pesos v2 heretic sobre los que se construye esta cuantización |
| ukisai/Swift1.5-Qwen3.8-Flash-Next | no disponible | no disponible | swift-open-license-1.0 | no disponible | Modelo original de la familia Swift 1.5 Flash |
| johnlockejrr/Swift-1.5-Flash-Next-Heretic-ReverseEngineer-HGN | no disponible | no disponible | no disponible | Halogen v2 | Variación comunitaria de los mismos pesos |

No se dispone de datos de rendimiento comparativo entre estas variantes en la información proporcionada.

## Limitaciones y advertencias

- Modelo descensurado: el comportamiento de rechazo ha sido eliminado deliberadamente. El usuario es el único responsable del uso y debe cumplir la legislación aplicable y la licencia.
- Riesgo de alucinación: no se han publicado evaluaciones de fidelidad factual; como todo modelo generativo, puede producir contenido plausible pero incorrecto, especialmente en dominios técnicos especializados.
- Idiomas limitados a inglés y chino; no se garantiza un rendimiento adecuado en castellano u otros idiomas.
- Longitud de contexto no documentada, lo que dificulta planificar despliegues con ventanas largas.
- Licencia `swift-open-license-1.0`: es una licencia personalizada (no estándar OSI), por lo que deben revisarse los términos exactos antes de un uso comercial. La model card enlaza al texto de la licencia en el repositorio de ukisai.
- El modelo está pensado para tareas de ingeniería inversa y seguridad ofensiva; su uso en sistemas sin autorización explícita puede ser ilegal en muchas jurisdicciones.
- Requiere hardware de gama alta (96 GB de VRAM en la configuración objetivo), lo que limita su despliegue a infraestructuras especializadas.
- La cuantización agresiva (IQ3_S-85G, 3,36 bpw) puede degradar capacidades generales; el autor indica que la matriz se re-fusionó al 80/20 para esa variante, pero no se aportan métricas de degradación.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no hay validación comunitaria independiente del rendimiento real.

## Enlaces

- Hugging Face: https://huggingface.co/DareModels/Swift-1.5-Flash-Next-Heretic-ReverseEngineer
- Modelo base: https://huggingface.co/jeffpeng3/Swift-1.5-Qwen3.8-Flash-Next-heretic
- Modelo original de la familia: https://huggingface.co/ukisai/Swift1.5-Qwen3.8-Flash-Next
- Licencia: https://huggingface.co/ukisai/Swift1.5-Qwen3.8-Flash-Next/blob/main/LICENSE
- Variación Halogen v2: https://huggingface.co/johnlockejrr/Swift-1.5-Flash-Next-Heretic-ReverseEngineer-HGN
- Pesos Apple MLX: https://huggingface.co/skudzinau/Swift-1.5-Flash-Next-Heretic-V2-MLX-Serve-iQ-MLX-4.7bpw
