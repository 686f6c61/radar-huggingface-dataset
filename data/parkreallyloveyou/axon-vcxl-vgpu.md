# ParkReallyLoveYou/AXON-vCXL-vGPU

## Resumen

AXON-vCXL-vGPU no es un modelo de lenguaje en el sentido habitual, sino una capa de software propietaria para Windows x64 que actua como acelerador de inferencia. Desarrollada por AXON LABS (autor de HuggingFace: ParkReallyLoveYou), su objetivo es ejecutar modelos de gran tamano (32B y 70B parametros, citando Llama-3.3-70B, Qwen-2.5-32B/72B y DeepSeek-R1) sobre GPU de consumo con 8, 12 o 16 GB de VRAM, evitando los errores de CUDA out-of-memory mediante una gestion de memoria por capas.

El producto se presenta como cuatro componentes: vCXL, una capa que unifica VRAM, RAM DDR4/DDR5 y NVMe en un pool de memoria virtual con prefetch predictivo de capas; vCPNPU/vGPU, que virtualiza la GPU como acelerador cognitivo; NWIR, un plano de despacho de operaciones de baja latencia; y Zero-OOM LeaseLock, un mecanismo de proteccion de tensores activos. Segun la model card, el sistema se distribuye como instalador .exe para Windows y no incluye pesos de modelo, sino que opera sobre modelos de terceros (Llama, Qwen, DeepSeek) en formato GGUF u otros.

Su relevancia actual radica en el problema real del despliegue local de modelos grandes en hardware de gama de consumo, donde el offloading de capas a RAM del sistema degrada el rendimiento hasta 0,8-2,0 tokens/s. La model card afirma elevarlo a 20-35 tokens/s. Sin embargo, el repositorio de HuggingFace tiene 0,0 GB de contenido, cero descargas y cero valoraciones, y los datos de rendimiento publicados se describen explicitamente como resultados de simulacion empirica, no como mediciones independientes en produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No aplica: capa de software de virtualizacion de memoria y computo (vCXL + vCPNPU/vGPU + NWIR + Zero-OOM LeaseLock); no es una red neuronal |
| Parametros totales | No disponible (no publica pesos propios; opera sobre modelos de terceros de 32B y 70B) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible (depende del modelo subyacente que se ejecute) |
| Tipos de cuantizacion | No especificado de forma exhaustiva; la comparativa de referencia usa GGUF Q4 en llama.cpp/Ollama |
| Idiomas soportados | No disponible en la model card; declarados como "no disponibles" en los metadatos de HuggingFace |
| Licencia | AXON EULA (license_name: axon-eula, license_link: LICENSE); uso comercial no aclarado |
| Formato de pesos | No aplica: el repositorio de HuggingFace pesa 0,0 GB; la distribucion se realiza como instalador .exe desde GitHub Releases |
| Desarrollador | AXON LABS (usuario de HuggingFace: ParkReallyLoveYou; repositorio GitHub: jaesooPark1972) |
| Plataforma soportada | Windows x64 |
| Modelos objetivo | Llama-3.3-70B, Qwen-2.5-32B, Qwen-2.5-72B, DeepSeek-R1 |
| GPU objetivo | RTX 3060 12 GB, RTX 4060 8 GB, RTX 4070 12 GB, RTX 4080 16 GB |
| Pipeline declarado | text-generation |
| Fecha de creacion del repositorio | 2026-09-23 (segun metadatos de HuggingFace) |

## Arquitectura y entrenamiento

El sistema no entrena ni publica un modelo neuronal. Su arquitectura es una pila de software de gestion de memoria y despacho de computo sobre hardware de consumo. El componente vCXL emula en software una memoria CXL (Compute Express Link) jerarquica, enlazando VRAM, RAM del sistema y NVMe en un espacio unificado y empleando prefetch asincrono por PCIe DMA de las capas N+1 y N+2 mientras se computa la capa N; el autor afirma que esto oculta hasta el 85% de la latencia de transferencia. El componente vCPNPU/vGPU virtualiza la GPU como acelerador cognitivo y declara un incremento de throughput efectivo de hasta el 40% mediante tecnicas que denomina Hyper-Sparse Tensor Acceleration y 0-Skip Bypass. NWIR monitoriza el working set activo para enrutar operaciones a la particion de computo mas rapida disponible, y Zero-OOM LeaseLock aplica contadores de ciclo de vida a los tensores activos para evitar fallos por saturacion de memoria.

No hay informacion sobre datos de entrenamiento, numero de tokens, composicion de dataset, RLHF, DPO ni tecnicas de alineacion, porque no existe un modelo entrenado. Tampoco se documentan en la informacion proporcionada detalles de implementacion verificables: no se especifica el framework sobre el que se integra (llama.cpp, vLLM, runtime propio), el consumo de ancho de banda PCIe esperado, ni los requisitos minimos de RAM y NVMe. La seccion de rendimiento de la model card se titula "Verified Empirical Simulation Benchmarks", lo que indica que las cifras proceden de simulacion del bus de memoria y del hardware, no de instrumentacion en un sistema real.

## Capacidades

- Aceleracion de inferencia de modelos LLM de 32B y 70B sobre GPU de consumo con 8, 12 y 16 GB de VRAM.
- Gestion de memoria fuera de nucleo (out-of-core) mediante pooling de VRAM, RAM y NVMe con prefetch de capas.
- Prevencion de errores CUDA out-of-memory bajo saturacion de memoria declarada del 99%.
- Ejecucion de modelos de terceros: el autor cita Llama-3.3-70B, Qwen-2.5-32B, Qwen-2.5-72B y DeepSeek-R1.
- Integracion en Windows x64 mediante instalador .exe.
- Generacion de texto, heredada del modelo subyacente que se cargue (no es una capacidad propia de esta capa).
- No se documenta soporte de tool calling, function calling, agentes, razonamiento multi-paso, vision, audio ni modo thinking propio: esas capacidades dependerian exclusivamente del modelo subyacente.
- Soporte multilingue: no disponible; depende del modelo que se ejecute, no de la capa AXON.

## Casos de uso

- Ejecucion local de Llama-3.3-70B en una RTX 4070 de 12 GB: la model card reporta 5,26 tokens/s frente al fallo por OOM del baseline, lo que permitiria usar modelos de 70B en estaciones de trabajo de gama media sin GPU profesional.
- Prototipado de asistentes conversacionales en Windows: el prefetch por capas reduce la latencia por token a 87-190 ms en los escenarios medidos, suficiente para interaccion fluida en chat de un solo usuario.
- Desarrollo y pruebas sin acceso a clúster: permite validar prompts, plantillas y flujos de agente contra modelos de 32B-70B en hardware local antes de desplegar en infraestructura en la nube.
- Despliegue en entornos con requisitos de soberania de datos: al ejecutarse de forma local sobre Windows, evita enviar datos a APIs externas, relevante en sectores regulados.
- Investigacion academica con presupuesto limitado: estudiantes e investigadores pueden reproducir experimentos sobre modelos de 70B en una unica GPU de consumo.
- Estaciones de trabajo de oficina con NVMe rapido: el uso de NVMe como tercer nivel de memoria permitiria cargar modelos que no caben en RAM y VRAM conjuntas, a costa de mayor latencia.
- Generacion de codigo en local: ejecutando modelos tipo Qwen-2.5 o DeepSeek-R1 sobre la capa AXON en un portatil con RTX 4060 de 8 GB, para autocompletado o refactorizacion sin conexion.

## Benchmarks y rendimiento

Los unicos datos disponibles son los publicados por el autor en la model card, descritos como "Verified Empirical Simulation Benchmarks" y medidos, segun el texto, contra un baseline de offloading de capas GGUF Q4 por PCIe (el usado por Ollama/llama.cpp). No se trata de mediciones independientes.

| Escenario y hardware | Baseline (GGUF Q4, offload PCIe) | AXON-vCXL-vGPU | Mejora declarada |
|---|---|---|---|
| RTX 4070 12 GB + Qwen-2.5-32B | 1,24 tok/s (807,6 ms de latencia) | 11,44 tok/s (87,4 ms) | 9,2x |
| RTX 4070 12 GB + Llama-3.3-70B | 0,00 tok/s (fallo por CUDA OOM) | 5,26 tok/s (190,1 ms) | Sin OOM |
| RTX 4080 16 GB + Llama-3.3-70B | 0,40 tok/s (2.523 ms/token) | 5,29 tok/s (189,2 ms) | 13,2x |

Adicionalmente, la model card afirma que en prompts conversacionales ligeros o en modo de borrador especulativo el throughput escala dinamicamente hasta 20-35 tokens/s, sin aportar la metodologia de medicion ni el hardware exacto de esa prueba. No hay resultados de MMLU, HumanEval, GSM8K ni de ninguna evaluacion de calidad de modelo, porque AXON no es un modelo evaluable de ese modo.

## Requisitos de hardware

- VRAM minima citada: 8 GB (RTX 4060), 12 GB (RTX 3060, RTX 4070) y 16 GB (RTX 4080). Son las GPU de consumo mencionadas explicitamente por el autor.
- RAM del sistema: no disponible en la informacion proporcionada, pero es un requisito critico, ya que la capa vCXL usa la RAM DDR4/DDR5 como segundo nivel de memoria.
- Almacenamiento: no disponible. Se menciona NVMe SSD como tercer nivel del pool de memoria, sin especificar capacidad ni velocidad minima.
- GPU recomendadas: segun el autor, cualquier GPU de consumo de 8-16 GB de las generaciones citadas. No se mencionan A100, H100 ni GPU de centro de datos, ya que el producto esta orientado a Windows de escritorio.
- Si cabe en GPU de consumo: si, ese es precisamente el objetivo declarado del producto; permite ejecutar modelos que de otro modo provocarian OOM en esas GPU.
- Opciones de despliegue: instalador .exe para Windows x64 descargable desde GitHub Releases. No se documenta integracion con vLLM, llama.cpp, Ollama, TGI ni otras herramientas del ecosistema, aunque el baseline de comparacion sea el offloading GGUF propio de llama.cpp/Ollama.
- Latencia y throughput: los unicos datos son los de la tabla anterior (87,4 a 190,1 ms por token; 5,26 a 11,44 tokens/s). El rango maximo declarado de 20-35 tokens/s carece de detalle metodologico.
- Requisitos adicionales: no disponibles.

## Comparativa con modelos similares

No procede una comparativa de parametros, contexto o benchmarks, porque AXON-vCXL-vGPU no es un modelo. La comparacion relevante es con otras soluciones de ejecucion de LLM en hardware limitado.

| Solucion | Enfoque | Modelos objetivo | Plataforma | Licencia | Datos de rendimiento |
|---|---|---|---|---|---|
| AXON-vCXL-vGPU | Pool de memoria virtual (VRAM+RAM+NVMe) con prefetch de capas y proteccion anti-OOM | Llama-3.3-70B, Qwen-2.5-32B/72B, DeepSeek-R1 | Windows x64 | AXON EULA (propietaria) | Solo simulacion del autor (5,26-11,44 tok/s) |
| llama.cpp / Ollama con offload de capas | Offload parcial a RAM del sistema y cuantizacion GGUF | Amplio catalogo GGUF | Multiplataforma | MIT / Apache-2.0 segun componente | Baseline citado por el propio autor: 0,40-1,24 tok/s o fallo por OOM |
| vLLM con PagedAttention | Gestion de KV cache en VRAM, optimizado para servidor | Modelos HF con soporte CUDA | Linux principalmente | Apache-2.0 | Alto throughput en GPU de centro de datos; no resuelve el OOM en 8-16 GB |

No se dispone de comparativas independientes de AXON-vCXL-vGPU frente a estas alternativas, ni de verificacion por terceros de sus cifras.

## Limitaciones y advertencias

- No es un modelo de lenguaje: no tiene pesos, no se puede evaluar en MMLU, HumanEval ni GSM8K, y su calidad de salida depende integramente del modelo de terceros que se cargue.
- Los benchmarks estan etiquetados por el propio autor como simulaciones empiricas, no como mediciones en produccion. No hay verificacion independiente ni reproduccion publicada por terceros.
- El repositorio de HuggingFace tiene 0,0 GB, cero descargas y cero valoraciones; la distribucion real se realiza mediante instaladores .exe alojados en GitHub Releases, lo que implica ejecutar binarios cerrados en la maquina del usuario.
- Riesgo de seguridad operativa: se trata de software propietario distribuido como ejecutable para Windows, sin auditoria publica del codigo ni detalles arquitectonicos verificables. Conviene evaluarlo en entornos aislados.
- Licencia AXON EULA: no se especifican en la informacion proporcionada los terminos de uso comercial, redistribucion ni el tratamiento de datos. Es imprescindible revisar LICENSE antes de cualquier despliegue profesional.
- Fecha de creacion del repositorio indicada como 2026-09-23, posterior a la fecha actual; esto sugiere metadatos inconsistentes y refuerza la necesidad de cautela.
- Dependencia fuerte del hardware: el rendimiento depende del ancho de banda PCIe, de la velocidad y capacidad de la RAM DDR4/DDR5 y de la latencia del NVMe. Las cifras publicadas no seran extrapolables a configuraciones distintas de las probadas.
- Solo Windows x64: no hay soporte documentado para Linux ni macOS, lo que limita su uso en la mayoria de entornos de servidor y contenedores.
- El claim "VRAM infinita" es una simplificacion de marketing: el sistema sigue limitado por la capacidad total de RAM y almacenamiento y por el ancho de banda del bus.
- Alucinacion, sesgos y limitaciones idiomaticas no son atribuibles a esta capa, sino al modelo subyacente; la model card no aporta informacion al respecto.
- Los terminos "vCXL", "vCPNPU", "NWIR" y "Hyper-Sparse Tensor Acceleration" no van acompanados de especificacion tecnica ni de paper, por lo que no pueden validarse de forma independiente.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/ParkReallyLoveYou/AXON-vCXL-vGPU
- Repositorio en GitHub: https://github.com/jaesooPark1972/AXON-vCXL-vGPU
- Pagina de releases (instalador .exe para Windows): https://github.com/jaesooPark1972/AXON-vCXL-vGPU/releases
- Licencia referenciada en la model card: LICENSE (enlace relativo dentro del repositorio, contenido no publicado)
- Paper tecnico: no disponible
- Demo publica: no disponible
