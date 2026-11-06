# miceworks/Mark-Engineer-V2-8B

## Resumen

Mark-Engineer-V2-8B es un modelo fundacional de 8,01 mil millones de parámetros con arquitectura Mixture-of-Experts (MoE), desarrollado por miceworks y publicado en Hugging Face. Está especializado en ingeniería de sistemas de bajo nivel: kernels de sistemas operativos, consenso distribuido, firmware, toolchains de compiladores, ciberseguridad ofensiva y defensiva, y computación física (robótica, electrónica, FPGA). Su diseño incorpora Multi-Head Latent Attention (MLA), 24 expertos enrutados más 1 experto compartido con enrutamiento Top-2, y Multi-Token Prediction (MTP) de profundidad 1 para decodificación especulativa.

El rasgo más relevante de esta ficha es su propia advertencia del autor: el modelo ha completado su preentrenamiento (loss de convergencia: 1,9047), pero no ha pasado por evaluación humana cualitativa, red-teaming automatizado ni benchmarks estandarizados. Es un checkpoint "entrenado pero no probado", por lo que todas las capacidades descritas son objetivos de diseño y no resultados verificados. Se recomienda ejecutar evaluaciones preliminares en entornos aislados antes de cualquier uso.

Con unos ~1,63 mil millones de parámetros activos por token, ofrece una huella de cómputo reducida para su tamaño físico total, lo que lo hace atractivo para despliegue local en hardware de consumo, especialmente en formato GGUF vía Ollama.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE (DeepSeekMoE) con MLA y MTP |
| Parametros totales | 8.005.905.408 (~8,01B) según model card; 2.748.746.240 según metadatos de safetensors en HF (discrepancia no resuelta) |
| Parametros activos | ~1.626.500.000 (~1,63B) por token |
| Longitud de contexto | 8.192 tokens |
| Tipos de cuantizacion | no disponible (formato GGUF disponible, cuantizaciones concretas no especificadas) |
| Idiomas soportados | Inglés (en), portugués (pt) |
| Licencia | AGPL-3.0 |
| Formato de pesos | GGUF (safetensors indicado en metadatos de parámetros) |

## Arquitectura y entrenamiento

El modelo sigue un esquema tipo DeepSeekMoE con 32 capas: 2 bloques densos iniciales y 30 bloques MoE. La dimensión oculta es de 2.560, con expertos de dimensión intermedia 1.254. La atención usa MLA (Multi-Head Latent Attention) con RoPE desacoplado: compresión de queries a un espacio latente de 1.024 dimensiones y compresión de key-values a un vector latente de 512 dimensiones, aplicando la codificación posicional rotatoria solo a 32 dimensiones desacopladas. Esto reduce el footprint de KV-cache frente a la atención multi-cabeza estándar.

El enrutamiento MoE combina 24 expertos enrutados (Top-2 por token) con 1 experto compartido universal, lo que da lugar a los ~1,63B de parámetros activos por token. Incluye Multi-Token Prediction (MTP) de profundidad 1, que predice en paralelo los tokens t+1 y t+2 para habilitar decodificación especulativa rápida. El vocabulario es de 49.152 tokens BPE ajustado para código, matemáticas y prosa técnica.

Sobre los datos de entrenamiento: no se ha publicado la composición del dataset ni el número de tokens procesados. El autor indica que completó un currículo de preentrenamiento con loss de convergencia 1,9047, y que las capacidades declaradas corresponden a objetivos de especialización por experto (kernel de Linux, firmware/RTOS, ingeniería eléctrica, robótica, Verilog/RISC-V, Rust, C/C++, reversing, red team, AppSec, consenso distribuido, compiladores, DevOps, etc.). No hay información sobre RLHF, DPO ni ajuste por instrucciones.

## Capacidades

Según la matriz de especialización declarada por el autor (recordando que son especificaciones de diseño, no capacidades verificadas):

- Generación de texto conversacional (pipeline text-generation), con especialización técnica en dominios de sistemas.
- Código en C/C++ (C99/C11, C++20/23, RAII, atomics, estructuras lock-free), Rust (unsafe, Tokio, crossbeam), Go (scheduler, microservicios de baja latencia) y lenguajes tier-1 (Python, Java/Kotlin, C#/.NET, TypeScript).
- Kernel de Linux: gestión de memoria, page tables, allocators slab/slub, eBPF.
- Sistemas embebidos: C bare-metal, FreeRTOS, Zephyr, ARM Cortex-M/R, I/O mapeado en memoria.
- Ingeniería inversa: desensamblado x86_64, ARM64, RISC-V, parsing ELF/PE, decompilación estilo Ghidra.
- Ciberseguridad ofensiva (heap exploitation, ROP/JOP, tcache poisoning) y defensiva (AppSec, criptografía en tiempo constante, TLS 1.3).
- Robótica: cinemática directa/inversa, Denavit-Hartenberg, controladores PID, ROS 2.
- Hardware: diseño RTL en Verilog/VHDL, extensiones ISA RISC-V, teoría de circuitos, filtros analógicos/digitales, KiCad.
- Sistemas distribuidos: Raft, Multi-Paxos, Kafka, transacciones 2PC/Saga; internos de bases de datos (LSM-trees, B+Trees, WAL, MVCC).
- Redes y compiladores: tuning de stack TCP/IP, QUIC, HTTP/3, AF_XDP; passes de LLVM IR, SSA, asignación de registros.
- DevOps cloud-native: operadores de Kubernetes, Docker/OCI, Terraform, NixOS, Prometheus.
- Verificación formal y depuración (experto E23, descripción truncada en la documentación disponible).
- Desambiguación de prompts vagos y calibración epistémica (expertos E19 y E20, orientados a defaults sensatos y verificación anti-alucinación).
- Soporte multilingüe declarado para inglés y portugués, con un experto dedicado a lingüística técnica en los 20 principales idiomas.
- No hay información sobre tool calling, function calling ni soporte de agentes.

## Casos de uso

- Asistente de desarrollo de kernel y drivers: puede apoyar en depuración de allocators slab/slub, page tables y módulos eBPF gracias al experto dedicado a gestión de memoria del kernel de Linux, útil como copiloto en sesiones de desarrollo de bajo nivel.
- Revisión y escritura de código Rust concurrente: el experto de sistemas Rust cubre unsafe, provenance de punteros y runtimes async como Tokio, adecuado para revisar código concurrente antes de integrarlo.
- Análisis de malware y reversing: con expertos en desensamblado x86_64/ARM64/RISC-V y parsing de ELF/PE, puede asistir en flujos de trabajo con Ghidra y análisis de binarios en entornos sandbox.
- Formación en ciberseguridad: los expertos de red team (heap exploitation, ROP) y AppSec (criptografía en tiempo constante, TLS 1.3) sirven para generar material didáctico y ejercicios en laboratorios controlados.
- Prototipado de robótica con ROS 2: asistencia en cinemática, ajuste de controladores PID y odometría durante el desarrollo de robots.
- Diseño de sistemas distribuidos: apoyo en decisiones de consenso (Raft vs. Paxos), particionado de Kafka y patrones de transacciones distribuidas (Saga, 2PC).
- Desarrollo embebido y firmware: generación de código bare-metal en C para FreeRTOS/Zephyr sobre Cortex-M, con I/O mapeado en memoria.
- Infraestructura cloud-native: redacción de operadores de Kubernetes, manifiestos Terraform y configuración de Prometheus en equipos con recursos limitados, dado el bajo coste de inferencia por token.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El propio autor advierte explícitamente que el checkpoint no ha pasado por pruebas estandarizadas ni evaluación humana cualitativa; el único dato de entrenamiento publicado es la loss de convergencia de 1,9047.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita. Con ~1,63B de parámetros activos y pesos GGUF, una cuantización del modelo completo (~8B) a Q4 ocuparía en el orden de 4-5 GB, coherente con el tamaño del repositorio (5,5 GB). Con FP16/BF16 los pesos completos rondarían los 16 GB.
- GPUs recomendadas: no disponible oficialmente. Por tamaño, cualquier GPU de consumo con 8-12 GB de VRAM (RTX 3060 12 GB, RTX 4070) debería ejecutar cuantizaciones Q4/Q5; GPUs de 16-24 GB (RTX 4080/4090) permitirían cuantizaciones más altas.
- Consumer GPU: sí, viable en GPUs de gama media-alta con cuantización GGUF, dado el tamaño del repositorio.
- Despliegue: el repositorio incluye tag de Ollama y formato GGUF, por lo que Ollama y llama.cpp son las vías naturales. No hay evidencia de soporte verificado en vLLM o TGI para esta arquitectura concreta (MLA + MTP propios); el tag `custom_code` sugiere que puede requerir código de confianza del repositorio.
- Latencia y throughput: no disponibles. El MTP de profundidad 1 está diseñado para acelerar la decodificación especulativa, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parametros totales | Parametros activos | Contexto | Licencia | Notas |
|---|---|---|---|---|---|
| Mark-Engineer-V2-8B | ~8,01B (según model card) | ~1,63B | 8.192 | AGPL-3.0 | Especializado en sistemas; sin benchmarks publicados |
| DeepSeek-V2-Lite | 15,7B | 2,4B | 32.000 | Model License propia (uso comercial restringido) | Misma familia arquitectónica (MLA + MoE), más generalista |
| Qwen2.5-Coder-7B | 7,6B (denso) | 7,6B | 32.768 (128K con YaRN) | Apache 2.0 | Denso, benchmarks de código publicados y verificados |
| Llama 3.1 8B | 8B (denso) | 8B | 128.000 | Llama Community License | Generalista, ecosistema maduro, benchmarks amplios |

Mark-Engineer-V2-8B se diferencia por su especialización extrema en dominios de ingeniería de sistemas y por su menor coste de cómputo por token (MoE Top-2), pero carece de la validación empírica y el ecosistema de las alternativas establecidas.

## Limitaciones y advertencias

- Checkpoint sin validar: el autor declara explícitamente que no ha pasado evaluación humana, red-teaming ni benchmarks estandarizados. Las capacidades son especificaciones de diseño y pueden no materializarse en la práctica.
- Discrepancia en el número de parámetros: la model card declara 8,01B totales mientras los metadatos de safetensors en Hugging Face reportan 2.748.746.240. Esta inconsistencia debe resolverse antes de confiar en las especificaciones.
- Riesgo de alucinación elevado al tratarse de un modelo sin post-entrenamiento documentado ni calibración verificada, especialmente crítico en dominios como ciberseguridad o verificación formal donde los errores tienen consecuencias reales.
- Contexto nativo corto: 8.192 tokens, limitado frente a los 32K-128K habituales en modelos comparables actuales.
- Soporte idiomático limitado: solo inglés y portugués declarados oficialmente; el experto de lingüística multilingüe no garantiza calidad en castellano.
- Licencia AGPL-3.0: copyleft fuerte. Su uso en servicios en red obliga a liberar el código fuente del servicio derivado, lo que puede ser incompatible con muchos escenarios comerciales.
- Tag `custom_code` e `inference: false`: la inferencia puede requerir ejecutar código del repositorio y no está soportada en el Inference API estándar de Hugging Face.
- Uso dual: incluye expertos orientados a explotación ofensiva (heap exploitation, ROP); su despliegue debe controlarse para evitar usos maliciosos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/miceworks/Mark-Engineer-V2-8B
- Paper, repositorio de código de entrenamiento y demos: no disponibles en la información proporcionada.
