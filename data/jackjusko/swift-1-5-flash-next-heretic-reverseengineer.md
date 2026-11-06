# jackjusko/Swift-1.5-Flash-Next-Heretic-ReverseEngineer

## Resumen
Swift-1.5-Flash-Next-Heretic-ReverseEngineer es una cuantizacion GGUF del modelo jeffpeng3/Swift-1.5-Qwen3.8-Flash-Next-heretic, una variante "abliterated" (sin rechazo) del modelo base Swift 1.5 Qwen 3.8 Flash Next. El autor de la cuantizacion, jackjusko (con ayuda de trubisky en la receta de cuantizacion), publica pesos optimizados especificamente para tareas de ingenieria inversa, con una asignacion de bits dirigida a codigo, razonamiento, diseno y analisis de binarios.

El modelo es de tipo MoE (Mixture of Experts) con 176.943.899.520 parametros totales segun los datos de safetensors, y soporta entradas de imagen y texto (pipeline image-text-to-text). Incluye un proyector de vision (mmproj) y esta disenado para ejecutarse en configuraciones de 96 GB de VRAM, como una maquina con 3 GPU V100 de 32 GB.

La relevancia actual radica en su enfoque poco habitual: la matriz de importancia (imatrix) usada para la cuantizacion incluye categorias especificas de ingenieria inversa (desensamblado x86-64/ARM64, decompilacion Ghidra, internals ELF/PE/Mach-O, anti-debug, deobfuscacion de cadenas, etc.) y una categoria de "no-rechazo" con respuestas directas sobre explotacion de ELF, inyeccion de procesos, parcheo de comprobaciones de licencia y protocolos C2. Esto lo convierte en una herramienta especializada para analistas de seguridad y desarrolladores que trabajan en entornos controlados.

## Especificaciones tecnicas
| Parametro | Valor |
|---|---|
| Arquitectura | MoE (Mixture of Experts) sobre transformer; tag `qwen3_8`, tag `moe` |
| Parametros totales | 176.943.899.520 (dato real de safetensors) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (la model card menciona "8192-token prefill batching" como configuracion de despliegue, no como contexto maximo) |
| Tipos de cuantizacion | IQ4_NL (custom, ~108,9 GB en 8 shards), IQ4_XS-plus (custom, 94,7 GB), IQ3_S-85G (custom, ~84,6 GB en 8 shards, 3,36 bpw de masa de expertos) |
| Idiomas soportados | en, zh |
| Licencia | swift-open-license-1.0 (license: other) |
| Formato de pesos | GGUF (multi-shard); pack adicional para el motor Strata (`dense.bin`, `index.txt`, `native_experts.txt`, `conversions.json`, `compat-bf16.json`, tokenizer) |

## Arquitectura y entrenamiento
El modelo subyacente es un MoE basado en la familia Qwen 3.8 (tag `qwen3_8`), con 48 capas segun la descripcion de la receta de cuantizacion ("all 48 layers"). La model card indica que la auditoria de energia de activaciones muestra un aumento de 3x en la energia de las proyecciones "down" a partir de la capa 36, con pico en la capa 47 (el tensor mas caliente de la red, 48x la capa 2). Las capas 44-46 son el pico de las proyecciones gate/up (8x la energia de las capas iniciales). Esta informacion proviene de la metodologia de cuantizacion, no de detalles de entrenamiento del modelo original.

El modelo base jeffpeng3/Swift-1.5-Qwen3.8-Flash-Next-heretic fue sometido a un proceso de "abliteration" (eliminacion deliberada del comportamiento de rechazo) por parte de jeffpeng3, quien segun la model card logro preservar tanto la capacidad de razonamiento como la longitud de salida, algo que se describe como una combinacion dificil. No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset original ni si hubo RLHF/DPO en el modelo base.

La innovacion tecnica destacable de esta publicacion es la cuantizacion con imatrix personalizada: 837 entradas, 399.876 tokens, en formato nativo de plantilla de chat Qwen (`<|im_start|>`). La matriz se compone de diez categorias ponderadas: chain-of-thought (22,2%), system prompts (19,5%), diseno y arquitectura (13,5%), uso agentico de herramientas (12,4%), matematicas (7,1%), razonamiento espacial (5,4%), "gotchas" (4,5%), juicio situacional (4,5%), ingenieria inversa (8,8%) y dominio heretic sin rechazo (2,0%). Las dos ultimas categorias son nuevas en la v2 e incluyen aproximadamente 43.000 tokens de contenido de ingenieria inversa y respuestas directas, generadas pasando el corpus por el propio modelo para capturar su comportamiento real. La matriz se fusiona con una del equipo AtomicChat (medida sobre el modelo base original sin comprimir sobre un corpus generalista masivo), con un peso del 70% para la matriz propia en los canales con datos solidos, deslizando suavemente hacia el 100% de AtomicChat en canales con pocas muestras. La receta de cuantizacion asigna bits de forma dinamica: las ultimas 12 capas reciben proyecciones "down" a 8 bits casi sin perdida, y las capas 44-46 reciben un tratamiento reforzado en gate/up.

## Capacidades
- Generacion de texto y razonamiento paso a paso (chain-of-thought), con autoverificacion y backtracking segun la composicion de la imatrix.
- Generacion y revision de codigo, incluida critica de decompilacion Ghidra y planificacion de APIs.
- Razonamiento matematico: aritmetica, algebra, demostraciones trabajadas y manipulacion simbolica.
- Razonamiento espacial: cuadriculas, transformaciones 2D/3D, coordenadas y empaquetado/disposicion.
- Capacidades de vision: el pipeline es image-text-to-text e incluye un proyector de vision (`mmproj`) contemplado en el diseno de la receta de cuantizacion.
- Soporte de tool calling / function calling y uso agentico de herramientas: cadenas de llamadas a herramientas, bucles de edicion de ficheros, recuperacion de errores.
- Capacidades multilingues limitadas a ingles (en) y chino (zh).
- Capacidad especial de ingenieria inversa: desensamblado x86-64/ARM64, internals ELF/PE/Mach-O, anti-debug/anti-VM, deobfuscacion de cadenas, aplanado de CFG (control-flow graph), devirtualizacion, watchpoints de rendimiento, pilas de trazado (LD_PRELOAD/Frida/eBPF), ingenieria inversa de protocolos, round-tripping de formatos, fusion de ABI de plugins y analisis de firmware.
- Modo "sin rechazo" (uncensored): respuestas directas sobre cadenas de explotacion ELF, inyeccion de procesos frente a EDR, mecanica de parcheo de comprobaciones de licencia y ingenieria de protocolos C2.
- Manejo de trampas y premisas falsas (categoria "gotchas" de la imatrix).

## Casos de uso
- Analisis de binarios en entornos de laboratorio: el modelo puede recibir desensamblado o salida de decompilador y ayudar a identificar rutinas, reconstruir logica o criticar la decompilacion de Ghidra, gracias a que la imatrix dedica un 8,8% a contenido de ingenieria inversa (x86-64/ARM64, ELF/PE/Mach-O).
- Auditoria de seguridad defensiva: analisis de mecanismos anti-debug y anti-VM, deobfuscacion de cadenas y aplanado de CFG para comprender muestras de malware en un entorno aislado, con el modelo como asistente de analisis.
- Ingenieria inversa de protocolos: reconstruccion de formatos de red y round-tripping de formatos binarios, util para interoperabilidad con sistemas legacy o investigacion de protocolos propietarios.
- Desarrollo y revision de codigo asistido: el modelo soporta tool calling y puede integrarse en pipelines de CI/CD para revision de parches, planificacion de refactorizaciones y explicacion de decisiones de diseno, con un 13,5% de la imatrix dedicada a diseno y arquitectura.
- Agentes multi-paso para edicion de ficheros: bucles de llamada a herramientas con recuperacion de errores, adecuado para tareas de automatizacion que requieren varias iteraciones sobre un repositorio.
- Razonamiento tecnico con vision: al soportar image-text-to-text, puede analizar capturas de diagramas, esquemas de memoria o disposiciones de cuadricula junto con texto, aprovechando la categoria de razonamiento espacial (5,4%).
- Analisis de firmware: desensamblado y comprension de imagenes de firmware en investigacion de dispositivos, dentro de un laboratorio controlado.
- Asistencia en matematicas y demostraciones: derivaciones paso a paso y verificacion simbolica para documentacion tecnica o material educativo.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware
- VRAM estimada: la receta IQ4_NL esta dimensionada para una configuracion de 3 GPU V100 de 32 GB (96 GB de VRAM total), con espacio para el proyector de vision (`mmproj`), prefill de 8192 tokens y streaming de KV. La variante IQ4_XS-plus ocupa 94,7 GB y la IQ3_S-85G unos 84,6 GB.
- GPU recomendadas: V100 de 32 GB en configuracion de 3 unidades (objetivo declarado). Para las variantes de menor tamano se necesitarian configuraciones equivalentes de VRAM total; no se especifican otras GPU en la informacion disponible.
- No cabe en GPU de consumo convencionales: incluso la variante mas pequena (IQ3_S-85G, ~84,6 GB) supera la VRAM de tarjetas como la RTX 4090 (24 GB) o la RTX 3090 (24 GB). No se dispone de datos sobre offloading parcial a RAM del sistema.
- Opciones de despliegue: formato GGUF, por lo que es compatible con el ecosistema llama.cpp; la model card menciona el motor Strata (con un pack de runtime preconstruido `strata-pack-heretic-v2-70g-fix.zip`) y el tag `endpoints_compatible`. No se mencionan vLLM, TGI ni Ollama en la informacion disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares
| Modelo | Parametros totales | Contexto | Cuantizaciones | Licencia | Notas |
|---|---|---|---|---|---|
| Swift-1.5-Flash-Next-Heretic-ReverseEngineer (este) | 176.943.899.520 | no disponible | IQ4_NL, IQ4_XS-plus, IQ3_S-85G (GGUF) | swift-open-license-1.0 | Enfoque en ingenieria inversa, sin rechazo, vision |
| jeffpeng3/Swift-1.5-Qwen3.8-Flash-Next-heretic (base) | no disponible | no disponible | no disponible | no disponible | Pesos v2 heretic; preserva razonamiento y longitud de salida |
| ukisai/Swift1.5-Qwen3.8-Flash-Next (referenciado en licencia) | no disponible | no disponible | no disponible | swift-open-license-1.0 | Modelo de la familia Swift 1.5 Qwen 3.8 Flash Next |

No se dispone de datos de rendimiento comparativo entre estas variantes en la informacion proporcionada.

## Limitaciones y advertencias
- Modelo sin rechazo (uncensored): el comportamiento de rechazo ha sido eliminado deliberadamente. El autor declara que el usuario es el unico responsable de su uso y debe cumplir las leyes aplicables y la licencia.
- Riesgo de alucinacion: no se han publicado evaluaciones de fidelidad; la categoria "gotchas" de la imatrix sugiere que se ha trabajado el manejo de premisas falsas, pero no hay datos que lo cuantifiquen.
- Sesgos conocidos: no se dispone de informacion sobre sesgos evaluados en el modelo base ni en esta cuantizacion.
- Limitaciones de idioma: solo se declaran ingles (en) y chino (zh); no hay soporte declarado para castellano.
- Restricciones de licencia: licencia swift-open-license-1.0 (license: other); deben revisarse los terminos en el enlace de licencia antes de cualquier uso comercial. No se detallan las restricciones concretas en la informacion disponible.
- Caveats para produccion: el contenido de ingenieria inversa y de explotacion (cadenas de explotacion ELF, inyeccion de procesos frente a EDR, parcheo de comprobaciones de licencia, ingenieria de protocolos C2) tiene implicaciones legales y eticas; debe usarse en entornos controlados y con autorizacion. El tamano (84-109 GB) exige infraestructura de alta VRAM y no es desplegable en hardware de consumo.
- La informacion sobre contexto maximo y parametros activos no esta disponible, lo que limita la planificacion de cargas de trabajo de contexto largo.

## Enlaces
- Modelo en Hugging Face: https://huggingface.co/jackjusko/Swift-1.5-Flash-Next-Heretic-ReverseEngineer
- Modelo base: https://huggingface.co/jeffpeng3/Swift-1.5-Qwen3.8-Flash-Next-heretic
- Licencia: https://huggingface.co/ukisai/Swift1.5-Qwen3.8-Flash-Next/blob/main/LICENSE
- Perfil del autor del modelo base: https://huggingface.co/jeffpeng3
