# ahlabijohn/Swift-1.5-Flash-Next-Heretic-ReverseEngineer

## Resumen

Swift-1.5-Flash-Next-Heretic-ReverseEngineer es una cuantización GGUF comunitaria del modelo base jeffpeng3/Swift-1.5-Qwen3.8-Flash-Next-heretic, un derivado de la familia Qwen 3.8 Flash en arquitectura MoE (mixture of experts). El autor, ahlabijohn (con cuantización atribuida a trubisky), ha construido varias recetas de bits personalizadas orientadas específicamente a ingeniería inversa, codigo, razonamiento y diseno, ademas de preservar capacidades de vision (pipeline image-text-to-text). El modelo es una version "abliterated" (sin comportamiento de rechazo), lo que lo hace explicitamente no censurado.

El dato de parametros reportado en safetensors es de aproximadamente 176.900 millones de parametros totales, con un repositorio que ocupa 264 GB. El modelo base declara 8.192 tokens de contexto segun la nomenclatura Qwen 3.8 y soporta ingles y chino. La relevancia actual reside en su enfoque de cuantizacion guiada por una importance matrix (imatrix) de 837 entradas y cerca de 400.000 tokens, con asignacion dinamica de bits por capa y categorias de datos que priorizan desensamblado x86-64/ARM64, analisis de firmware, deobfuscacion de cadenas y tecnicas de ingenieria inversa de protocolos.

La licencia es propietaria (swift-open-license-1.0), lo que impone restricciones de uso que deben revisarse antes de cualquier despliegue comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE (mixture of experts), familia Qwen 3.8 Flash (tag `qwen3_8`, `moe`) |
| Parametros totales | 176.943.899.520 (aprox. 176,9 B, dato safetensors) |
| Parametros activos | no disponible |
| Longitud de contexto | 8.192 tokens (segun nomenclatura Qwen 3.8; no confirmado en la model card) |
| Tipos de cuantizacion | IQ4_NL personalizado (~108,9 GB, 8 shards), IQ4_XS-plus (94,7 GB, 6 shards), IQ3_S-85G (~84,6 GB, 8 shards, 3,36 bpw de masa expertos) |
| Idiomas soportados | en, zh |
| Licencia | swift-open-license-1.0 (license: other) |
| Formato de pesos | GGUF (libreria gguf), con runtime pack Strata (dense.bin, index.txt, native_experts.txt, conversions.json, compat-bf16.json) |

## Arquitectura y entrenamiento

El modelo sigue una arquitectura transformer con mezcla de expertos (MoE) heredada de la familia Qwen 3.8 Flash, segun los tags `qwen3_8` y `moe`. El autor no detalla en la model card el numero de expertos, la topologia de enrutamiento ni los datos de preentrenamiento originales del modelo base; esa informacion no esta disponible. Lo que si se documenta es el proceso de cuantizacion: se construyo una importance matrix propia de 837 entradas y 399.876 tokens en formato de chat nativo de Qwen (`<|im_start|>`), compuesta por diez categorias con pesos explicitos (chain-of-thought 22,2%, system prompts 19,5%, diseno y arquitectura 13,5%, uso agentico de herramientas 12,4%, matematicas 7,1%, razonamiento espacial 5,4%, "gotchas" 4,5%, juicio situacional 4,5%, ingenieria inversa 8,8% y dominio heretic sin rechazo 2,0%).

La innovacion tecnica principal es la asignacion dinamica de bits por capa: una auditoria de energia de activaciones mostro que la energia de down-projection se multiplica por tres a partir de la capa 36 y alcanza su pico en la capa 47 (el tensor mas caliente de la red, 48 veces el de la capa 2), por lo que la receta concentra bits en las ultimas 12 capas en lugar de distribuirlos uniformemente entre las 48. La imatrix propia se fusiona con otra del equipo AtomicChat (medida sobre el modelo base sin comprimir y un corpus generalista), con ponderacion del 70% para la propia en canales con datos solidos y deslizamiento hacia el 100% de AtomicChat en canales poco cubiertos. La variante IQ3_S-85G usa una matriz refusionada al 80%/20%. El modelo base incorpora pesos "heretic" v2 de jeffpeng3 que, segun la model card, preservan razonamiento y longitud de salida tras la ablacion del rechazo.

## Capacidades

- Generacion de texto conversacional multi-turno (pipeline conversational, endpoints_compatible).
- Razonamiento paso a paso con autoverificacion y backtracking (categoria chain-of-thought de la imatrix).
- Generacion y revision de codigo, con enfasis en desensamblado x86-64/ARM64, critica de decompilacion Ghidra, internals ELF/PE/Mach-O y fusion de ABI de plugins.
- Ingenieria inversa ofensiva/defensiva: anti-debug y anti-VM, deobfuscacion de cadenas, aplanado de CFG (control flow graph), devirtualizacion, watchpoints de rendimiento, trazas con LD_PRELOAD/Frida/eBPF, ingenieria inversa de protocolos, round-tripping de formatos y analisis de firmware.
- Capacidades de vision: entrada image-text-to-text, con proyector multimodal (mmproj) contemplado en el presupuesto de VRAM del despliegue.
- Uso agentico de herramientas: cadenas de tool-call, bucles de edicion de ficheros, recuperacion de errores y function calling (categoria agentic tool use de la imatrix).
- Matematicas: aritmetica, algebra, demostraciones y manipulacion simbolica.
- Razonamiento espacial: rejillas, transformaciones 2D/3D, coordenadas y empaquetado.
- Manejo de premisas falsas, preguntas trampa y negaciones ("gotchas").
- Multilingue limitado a ingles y chino.
- Sin comportamiento de rechazo (abliterated/uncensored), incluida respuesta directa en dominios de explotacion ELF, inyeccion de procesos frente a EDR, parcheo de comprobaciones de licencia y ingenieria de protocolos C2.

## Casos de uso

- Analisis de binarios y malware: el modelo puede recibir desensamblado o salida de Ghidra y producir criticas de decompilacion, identificacion de rutinas anti-debug y sugerencias de deobfuscacion de cadenas, gracias al 8,8% de la imatrix dedicado a ingenieria inversa.
- Auditoria de firmware embebido: extraccion de formatos, round-tripping y analisis de internals ELF/PE/Mach-O en flujos de trabajo de seguridad de dispositivos.
- Ingenieria inversa de protocolos de red: reconstruccion de estructuras de mensajes y validacion de hipotesis sobre protocolos propietarios en entornos de laboratorio autorizados.
- Asistencia a desarrolladores en refactorizacion y revision de codigo: la categoria de diseno y arquitectura (13,5%) y el soporte de tool calling permiten integrarlo en pipelines de CI/CD para revisiones automatizadas de cambios.
- Agentes autonomos de edicion de codigo: los bucles de tool-call, edicion de ficheros y recuperacion de errores lo hacen adecuado para tareas multi-paso con validacion intermedia.
- Analisis de documentos tecnicos con vision: al ser image-text-to-text, puede procesar capturas de diagramas, esquematicos o tablas junto a texto para tareas de documentacion tecnica.
- Razonamiento matematico y demostraciones asistidas: util para verificar derivaciones y manipulacion simbolica en entornos de investigacion.
- Despliegue en hardware legacy de centro de datos: la receta IQ4_NL esta dimensionada para una maquina de 3x32 GB V100 (96 GB de VRAM), lo que permite servir un MoE de ~177 B en infraestructura V100 existente.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: IQ4_NL ~108,9 GB (8 shards), IQ4_XS-plus 94,7 GB (6 shards), IQ3_S-85G ~84,6 GB (8 shards). El objetivo declarado de la receta IQ4_NL es encajar exactamente en 96 GB de VRAM bajo el motor Strata, dejando margen para el proyector de vision (mmproj), prefill por lotes de 8.192 tokens y streaming de KV.
- GPU recomendadas: 3x V100 de 32 GB (96 GB totales), configuracion para la que se diseno explicitamente la receta IQ4_NL. Para las variantes IQ4_XS-plus e IQ3_S-85G se requiere un total de VRAM igual o superior a su tamano en disco mas overhead de KV y contexto.
- No cabe en GPU de consumo: el modelo completo (~177 B parametros) excede con holgura los 24 GB de una RTX 4090 incluso en las cuantizaciones mas agresivas disponibles (IQ3_S-85G, ~84,6 GB). Se requeriria offload a RAM/CPU o multi-GPU.
- Opciones de despliegue: llama.cpp y derivados para los GGUF; el runtime pack Strata (dense.bin, index.txt, native_experts.txt, conversions.json, compat-bf16.json, tokenizer) para el motor Strata; endpoints_compatible indica compatibilidad con APIs de tipo OpenAI. No se mencionan vLLM, TGI ni Ollama en la informacion disponible.
- Latencia y throughput: no disponibles. Existe una variante comunitaria MLX (4,7 bpw) para Apple Silicon y una variante Halogen v2, pero sin cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| Swift-1.5-Flash-Next-Heretic-ReverseEngineer (este) | ~176,9 B (MoE) | 8.192 (segun nomenclatura) | GGUF + Strata | swift-open-license-1.0 | Cuantizacion comunitaria con imatrix orientada a ingenieria inversa; sin rechazo |
| jeffpeng3/Swift-1.5-Qwen3.8-Flash-Next-heretic (base) | no disponible | no disponible | no disponible | no disponible en la informacion | Pesos heretic v2 originales; fuente de esta cuantizacion |
| Qwen 3.8 Flash (familia original) | no disponible | 8.192 (segun nomenclatura) | no disponible | no disponible en la informacion | Modelo base de la cadena; capacidades MoE y vision |
| Variante MLX comunitaria (skudzinau) | no disponible | no disponible | MLX 4,7 bpw | no disponible en la informacion | Misma base heretic v2 para Apple Silicon |

No se dispone de datos de rendimiento comparativo (benchmarks) para establecer diferencias cuantitativas entre estas alternativas.

## Limitaciones y advertencias

- Modelo explicitamente no censurado: el comportamiento de rechazo ha sido eliminado de forma deliberada. El autor declara que la responsabilidad de uso recae exclusivamente sobre el usuario y exige cumplimiento legal y de licencia.
- Riesgo elevado de contenido danino: la imatrix incluye un 2,0% de datos de "dominio heretic sin rechazo" con respuestas directas sobre cadenas de explotacion ELF, inyeccion de procesos frente a EDR, parcheo de comprobaciones de licencia y protocolos C2. Uso en produccion orientada al publico es desaconsejable sin filtros externos.
- Riesgo de alucinacion: no se han publicado evaluaciones de fidelidad; las recetas de cuantizacion agresivas (IQ3_S-85G a 3,36 bpw de masa expertos) degradan previsiblemente la precision en tareas fuera de las categorias sobrerrepresentadas en la imatrix.
- Cobertura de idiomas limitada a ingles y chino; el castellano no esta declarado como idioma soportado.
- Contexto de 8.192 tokens: insuficiente para repositorios de codigo grandes o documentos extensos; la model card menciona prefill de 8.192 tokens, coherente con ese limite.
- Licencia propietaria swift-open-license-1.0: deben revisarse las condiciones antes de uso comercial; no es una licencia open source estandar (Apache 2.0, MIT).
- Dependencia de hardware especializado: la receta principal esta dimensionada para V100 de 32 GB; su despliegue en otras GPUs exige recalibrar shards y margen de KV.
- Trazabilidad limitada: el repositorio tiene 0 descargas y 0 likes en el momento de la ficha, sin resultados de benchmarks publicados; la calidad debe validarse empiricamente antes de adoptarlo.
- La cadena de derivacion (Qwen 3.8 Flash -> heretic v2 -> cuantizacion comunitaria) implica que las limitaciones del modelo base se heredan y se suman a las de la ablacion y la cuantizacion.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/ahlabijohn/Swift-1.5-Flash-Next-Heretic-ReverseEngineer
- Modelo base: https://huggingface.co/jeffpeng3/Swift-1.5-Qwen3.8-Flash-Next-heretic
- Licencia: https://huggingface.co/ukisai/Swift1.5-Qwen3.8-Flash-Next/blob/main/LICENSE
- Variante Halogen v2: https://huggingface.co/johnlockejrr/Swift-1.5-Flash-Next-Heretic-ReverseEngineer-HGN
- Variante MLX: https://huggingface.co/skudzinau/Swift-1.5-Flash-Next-Heretic-V2-MLX-Serve-iQ-MLX-4.7bpw
