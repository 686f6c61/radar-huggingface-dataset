# deeprcurs/OICIO

## Resumen

OICIO (Optimized Infinite Context Intelligence Orchestration) es un sistema de modelo de lenguaje desarrollado por deepRcurs Labs que propone una arquitectura radicalmente distinta para LLM, centrada en la eficiencia de cómputo y la densidad de inteligencia. En lugar de escalar la atención densa con pesos FP16 en clústeres de GPU, OICIO utiliza pesos ternarios de 1.58 bits, computación sin multiplicación de matrices y una memoria episódica que permite manejar contextos infinitos de forma segmentada. El modelo se basa en microsoft/BitNet-b1.58-2B-4T y se implementa en Rust, produciendo un binario de 14MB que ejecuta en 28MB de RAM y alcanza 500 tokens por segundo en una Raspberry Pi 5.

La arquitectura se organiza en 8 capas que van desde el hardware de borde (CPU, FPGA, neuromórfico) hasta el entrenamiento y la orquestación de agentes. El sistema incluye un harness recursivo que permite al modelo escribir código para lanzar subagentes, descomponiendo tareas complejas. Su relevancia radica en la posibilidad de ejecutar y entrenar modelos de alta calidad en hardware de consumo, sin necesidad de GPU, y en su propuesta de medir la inteligencia por gigabyte de memoria, no por número de parámetros.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MatMul-free: MLGRU + Hadamard GLU + BitLinear ternario, con memoria episódica y harness recursivo |
| Parametros totales | No especificado (modelo base: 2B de BitNet) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | Infinito (mediante segmentación episódica) |
| Tipos de cuantizacion | 1.58-bit ternaria {-1,0,1}, I2_S packing, TurboQuant, Vec-LUT |
| Idiomas soportados | Inglés |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors, binario Rust (ejecutable) |

## Arquitectura y entrenamiento

La arquitectura de OICIO se compone de 8 capas. La capa 6, el núcleo, utiliza un token mixer basado en MLGRU (MatMul-free Linear Gated Recurrent Unit) que reemplaza el self-attention, con complejidad O(N) y memoria constante. El channel mixer es un Hadamard MLP que usa la transformación de Walsh-Hadamard (FWHT) con solo sumas y restas. Los pesos se cuantizan a ternario mediante BitLinear (BitNet b1.58). La capa 7 implementa la memoria episódica con segmentación por sorpresa bayesiana (EM-LLM) y recuperación en dos etapas, permitiendo contexto infinito con alcance finito. La capa 8 incluye un harness recursivo que genera código para ejecutar subagentes en paralelo. El entrenamiento se realiza CPU-only desde cero, con QAT desde el paso 0, streaming de datos, optimizador de 8 bits, checkpointing y ZeRO-Offload con swap dinámico.

## Capacidades

- Generación de texto y razonamiento general.
- Escritura de código y orquestación de subagentes mediante código generado.
- Tool calling a través de la escritura de programas que invocan funciones.
- Manejo de contexto largo mediante segmentación episódica y recuperación selectiva.
- Recursión de agentes: el modelo puede lanzar múltiples subagentes en paralelo.
- Ejecución en CPU, incluyendo dispositivos de bajo consumo como Raspberry Pi.
- Soporte de memoria a largo plazo basada en eventos episódicos.

## Casos de uso

- **Asistente de atención al cliente en dispositivos de borde**: OICIO puede gestionar conversaciones multi-turno con contexto extenso gracias a su memoria episódica, ejecutándose en hardware de bajo consumo sin GPU.
- **Asistente de programación en entornos sin GPU**: el modelo puede escribir y ejecutar código en Rust o Python para depurar o automatizar tareas, funcionando en portátiles o servidores CPU-only.
- **Análisis de documentos legales o técnicos extensos**: su contexto infinito permite procesar contratos o informes completos, segmentando eventos y recuperando información relevante de forma eficiente.
- **Agentes autónomos**: el harness recursivo permite descomponer tareas complejas en subagentes, por ejemplo, para gestión de proyectos o automatización de flujos de trabajo.
- **Entrenamiento e investigación en hardware local**: el modelo puede entrenarse desde cero en CPU, facilitando la experimentación sin necesidad de clústeres GPU.
- **Aplicaciones en tiempo real**: con 500 tokens/s en Raspberry Pi 5, es adecuado para asistentes de voz, chatbots embebidos o sistemas de respuesta en tiempo real.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks detallados en la información disponible. La model card menciona que un modelo llamado "Bonsai 8B" logra un promedio de 75.5 frente a Qwen3 8B con 79.3, pero no se indica el benchmark exacto ni se especifica si ese es el modelo OICIO. Por tanto, no se presentan tablas de métricas como MMLU, HumanEval o GSM8K.

## Requisitos de hardware

- CPU-only, no requiere GPU.
- RAM mínima: 28MB para el binario de 14MB (versión Edge).
- Velocidad: 500 tokens/s en Raspberry Pi 5 (ARM).
- Arquitecturas soportadas: x86-64-v2 (AVX2/AVX-512), ARM NEON, RISC-V, WASM.
- Opciones de despliegue: binario Rust, también en FPGA (13W) y Loihi 2 (4.2W).
- Para entrenamiento: se recomienda CPU con swap dinámico de 10GB a 30GB según el tamaño del modelo.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Rendimiento |
|---|---|---|---|---|
| OICIO (base BitNet 2B) | No especificado | Infinito | Apache-2.0 | No publicado |
| Qwen3 8B | 8B | 128K | Apache-2.0 | 79.3 promedio (según model card) |
| BitNet-b1.58-2B-4T | 2B |
