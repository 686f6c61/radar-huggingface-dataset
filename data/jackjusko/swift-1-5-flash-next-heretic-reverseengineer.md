# jackjusko/Swift-1.5-Flash-Next-Heretic-ReverseEngineer

## Resumen

Swift-1.5-Flash-Next-Heretic-ReverseEngineer es una cuantización GGUF de un modelo de lenguaje de gran escala derivado de la familia Qwen 3.8, publicada por el usuario jackjusko (cuantizador "trubisky") a partir de los pesos "heretic" v2 de jeffpeng3. El modelo base es `jeffpeng3/Swift-1.5-Qwen3.8-Flash-Next-heretic`, una variante "abliterated" (sin comportamiento de rechazo) del modelo Swift 1.5 Qwen3.8 Flash Next. Con 176.943.899.520 parámetros totales y arquitectura MoE, se distribuye exclusivamente en formato GGUF cuantizado, con recetas mixtas personalizadas orientadas a codificación, razonamiento, diseño y, de forma destacada, ingeniería inversa.

La relevancia de esta ficha radica en su enfoque poco habitual: el autor construyó una importance matrix específica (837 entradas, 399.876 tokens) con categorías dedicadas a desensamblado x86-64/ARM64, análisis de binarios ELF/PE/Mach-O, deobfuscación de cadenas, devirtualización y análisis de firmware, además de un dominio "heretic" sin rechazo. Las cuantizaciones están dimensionadas para encajar en configuraciones concretas de hardware, en particular una máquina de 3×32 GB V100 (96 GB de VRAM) bajo el motor Strata.

El pipeline declarado es image-text-to-text, lo que indica capacidades multimodales (proyector de visión `mmproj`), y los idiomas soportados son inglés y chino. La licencia es `swift-open-license-1.0`, una licencia "other" que debe revisarse antes de cualquier uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE (Mixture of Experts) sobre transformer; tag `qwen3_8`; 48 capas según la metodología de cuantización |
| Parametros totales | 176.943.899.520 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (se menciona prefill batching de 8192 tokens, no la ventana total) |
| Tipos de cuantizacion | IQ4_NL mixta (~108,9 GB, 8 shards), IQ4_XS-plus (94,7 GB, 6 shards), IQ3_S-class mixta (~84,6 GB, 8 shards, 3,36 bpw de masa de expertos) |
| Idiomas soportados | en, zh |
| Licencia | swift-open-license-1.0 (license: other) |
| Formato de pesos | GGUF (múltiples shards); incluye runtime pack para el motor Strata (`dense.bin`, `index.txt`, `native_experts.txt`, `conversions.json`, `compat-bf16.json`, tokenizer) |

## Arquitectura y entrenamiento

El modelo es un transformer con arquitectura MoE (etiquetado `moe` y `qwen3_8`), con 48 capas según se desprende de la auditoría de energía de activaciones descrita en la model card. No se dispone de información sobre el número de parámetros activos por token, el número total de tokens de entrenamiento ni la composición del dataset original del modelo base. El modelo base es una variante "heretic" (abliterated) de Swift-1.5-Qwen3.8-Flash-Next: se ha eliminado deliberadamente el comportamiento de rechazo mediante técnicas de abliteration, y según el autor de los pesos v2 (jeffpeng3) se logró preservar tanto la capacidad de razonamiento como la longitud de salida, algo que califica como difícil de conseguir.

La innovación técnica principal de esta publicación no está en el entrenamiento sino en el proceso de cuantización. Se construyó una importance matrix propia (837 entradas, 399.876 tokens, formato nativo de plantilla de chat `<|im_start|>`) con diez categorías ponderadas: chain-of-thought (22,2 %), system prompts (19,5 %), diseño y arquitectura (13,5 %), uso agéntico de herramientas (12,4 %), matemáticas (7,1 %), razonamiento espacial (5,4 %), "gotchas" (4,5 %), juicio situacional (4,5 %), ingeniería inversa (8,8 %) y dominio heretic sin rechazo (2,0 %). Esta matriz se fusiona con otra del equipo AtomicChat (medida sobre el modelo base sin comprimir y un corpus generalista amplio), con un peso del 70 % para la matriz propia en los canales con datos sólidos y un desplazamiento progresivo hacia la de AtomicChat en canales con pocas muestras. La asignación de bits es dinámica: la auditoría de energía de activaciones muestra que la energía de la down-projection se triplica a partir de la capa 36 y alcanza su pico en la capa 47 (el tensor más caliente de la red, 48× el de la capa 2), por lo que las últimas 12 capas reciben más bits. La build IQ3_S-85G usa una matriz refundida al 80 % corpus propio / 20 % AtomicChat.

## Capacidades

- Generación de texto conversacional multi-turno (pipeline `conversational`).
- Razonamiento paso a paso con verificación propia y backtracking (categoría chain-of-thought de la imatrix).
- Capacidades de codificación: revisión de código, planificación de APIs, refactorización.
- Matemáticas: aritmética, álgebra, demostraciones y manipulación simbólica.
- Capacidades multimodales de imagen a texto (pipeline `image-text-to-text`, proyector `mmproj` incluido en el dimensionado de VRAM).
- Tool calling y function calling, con cadenas de llamadas a herramientas, bucles de edición de ficheros y recuperación de errores.
- Comportamiento agéntico multi-paso.
- Ingeniería inversa: desensamblado x86-64/ARM64, crítica de decompilación de Ghidra, internals de ELF/PE/Mach-O, anti-debug/anti-VM, deobfuscación de cadenas, aplanado de CFG, devirtualización, watchpoints de rendimiento, trazas con LD_PRELOAD/Frida/eBPF, ingeniería inversa de protocolos, round-tripping de formatos, fusión de ABI de plugins y análisis de firmware.
- Razonamiento espacial: rejillas, transformadas 2D/3D, coordenadas, empaquetado y disposición.
- Manejo de premisas falsas, preguntas trampa y negación.
- Multilingüe limitado a inglés y chino.
- Modo sin rechazo (uncensored/abliterated): respuestas directas en dominios que normalmente se rechazan.

## Casos de uso

- Análisis de binarios en laboratorio de seguridad: el modelo puede recibir desensamblado x86-64 o ARM64 y producir crítica de decompilación o identificación de rutinas relevantes, gracias a la categoría específica de ingeniería inversa de su imatrix y a la asignación de bits en las capas finales.
- Revisión de código y planificación de APIs en equipos de desarrollo: la imatrix dedica un 13,5 % a diseño y arquitectura, por lo que el modelo es adecuado para evaluar trade-offs de diseño y proponer refactorizaciones con justificación.
- Automatización agéntica con herramientas: soporta cadenas de tool calls, bucles de edición de ficheros y recuperación de errores, lo que permite integrarlo en pipelines que modifican código o ficheros de forma iterativa.
- Análisis de firmware y formatos propietarios: las categorías de round-tripping de formatos, fusión de ABI de plugins y análisis de firmware permiten usarlo como asistente en tareas de interoperabilidad y documentación de formatos.
- Asistencia en depuración y tracing: con soporte declarado para trazas LD_PRELOAD/Frida/eBPF y watchpoints de rendimiento, puede ayudar a interpretar pilas de tracing y a proponer puntos de instrumentación.
- Despliegue en hardware V100: la build IQ4_NL está dimensionada explícitamente para 3×32 GB V100 (96 GB de VRAM) bajo el motor Strata, con headroom para el proyector de visión, prefill de 8192 tokens y streaming de KV, lo que la hace apta para entornos con GPUs de datacenter antiguas.
- Conversaciones multimodales imagen-texto en inglés o chino: el pipeline image-text-to-text permite describir o razonar sobre imágenes en aplicaciones de documentación técnica o análisis de capturas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card describe únicamente mediciones internas de energía de activaciones (por ejemplo, el pico de la capa 47 a 48× la capa 2) y el tamaño de las cuantizaciones, pero no incluye puntuaciones de MMLU, HumanEval, GSM8K ni comparaciones numéricas con otros modelos.

## Requisitos de hardware

- VRAM estimada: IQ4_NL mixta ~108,9 GB (8 shards); IQ4_XS-plus 94,7 GB (6 shards); IQ3_S-class ~84,6 GB (8 shards). El repo completo ocupa 264,0 GB.
- Configuración de referencia: 3×32 GB V100 (96 GB de VRAM) para la build IQ4_NL bajo el motor Strata, con headroom para `mmproj`, prefill de 8192 tokens y streaming de KV.
- GPUs recomendadas: V100 de 32 GB en configuración multi-GPU; por tamaño, también cabría en configuraciones con A100/H100 de 80 GB en múltiples unidades, aunque no se documenta explícitamente.
- No cabe en GPUs de consumo: ninguna cuantización disponible baja de ~84,6 GB, por lo que no es viable en RTX 4090 (24 GB) ni en tarjetas consumer similares.
- Opciones de despliegue: motor Strata (runtime pack incluido), llama.cpp/GGUF; no se mencionan vLLM, TGI ni Ollama en la información disponible.
- Latencia y throughput: no disponible. Solo se documenta el dimensionado para prefill de 8192 tokens y streaming de KV.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantizaciones | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Swift-1.5-Flash-Next-Heretic-ReverseEngineer (este) | 176,9 B (MoE) | no disponible | IQ4_NL, IQ4_XS-plus, IQ3_S-class (GGUF) | swift-open-license-1.0 | Hugging Face, repo de 264 GB |
| Swift-1.5-Qwen3.8-Flash-Next-heretic (base de jeffpeng3) | no disponible | no disponible | pesos base (no cuantizados en esta ficha) | no disponible | Hugging Face |
| Swift-1.5-Flash-Next-Heretic-ReverseEngineer-HGN (Halogen v2) | no disponible | no disponible | pesos Halogen v2 | no disponible | Hugging Face (johnlockejrr) |
| Swift-1.5-Flash-Next-Heretic-V2-MLX-Serve-iQ-MLX-4.7bpw | no disponible | no disponible | MLX 4,7 bpw | no disponible | Hugging Face (skudzinau) |

No se dispone de datos de rendimiento comparativo entre estas variantes; la comparación se limita a formato, licencia y disponibilidad.

## Limitaciones y advertencias

- Modelo sin censura (uncensored/abliterated): el comportamiento de rechazo se ha eliminado deliberadamente. El autor declara que el usuario es el único responsable del uso y debe cumplir la legislación aplicable y la licencia.
- La categoría "No-refusal heretic domain" incluye contenido de explotación de ELF, inyección de procesos frente a EDR, mecánicas de parcheo de comprobaciones de licencia y ingeniería de protocolos C2; su uso en producción conlleva riesgos legales y éticos evidentes.
- Riesgo de alucinación: no se han publicado evaluaciones de fidelidad ni benchmarks que permitan cuantificarlo.
- Idiomas limitados a inglés y chino; no se declara soporte de castellano.
- Licencia `swift-open-license-1.0` (license: other): es imprescindible revisar el texto completo antes de cualquier uso comercial; no se dispone de un resumen de sus restricciones.
- Longitud de contexto no documentada; el único dato es el dimensionado para prefill de 8192 tokens, que no equivale a la ventana total.
- Requisitos de hardware muy elevados: la cuantización más pequeña ronda los 84,6 GB, lo que excluye GPUs de consumo y limita el despliegue a entornos multi-GPU de datacenter.
- El modelo depende del motor Strata para la configuración de referencia; el soporte en otros runtimes GGUF no está documentado.
- Al ser una cuantización de pesos ajenos, los sesgos del modelo base se heredan sin evaluación adicional.

## Enlaces

- Hugging Face (este modelo): https://huggingface.co/jackjusko/Swift-1.5-Flash-Next-Heretic-ReverseEngineer
- Modelo base: https://huggingface.co/jeffpeng3/Swift-1.5-Qwen3.8-Flash-Next-heretic
- Licencia: https://huggingface.co/ukisai/Swift1.5-Qwen3.8-Flash-Next/blob/main/LICENSE
- Variante Halogen v2: https://huggingface.co/johnlockejrr/Swift-1.5-Flash-Next-Heretic-ReverseEngineer-HGN
- Variante MLX: https://huggingface.co/skudzinau/Swift-1.5-Flash-Next-Heretic-V2-MLX-Serve-iQ-MLX-4.7bpw
