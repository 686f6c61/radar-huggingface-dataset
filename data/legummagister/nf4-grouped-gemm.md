# LegumMagister/nf4-grouped-gemm

## Resumen

`LegumMagister/nf4-grouped-gemm` no es un modelo de lenguaje, sino un kernel de Triton publicado en Hugging Face Hub bajo el mecanismo `kernels`. Implementa una multiplicacion matricial agrupada (grouped GEMM) para los expertos de una capa mixture-of-experts (MoE) manteniendo los pesos en formato NF4 de bitsandbytes, de modo que todos los expertos se ejecutan en un unico lanzamiento de kernel, igual que hace `torch._grouped_mm` con bf16.

El problema que resuelve es concreto: en A100 y H100 no existe un kernel agrupado nativo para NF4. Con `load_in_4bit`, transformers deja los pesos fusionados de los expertos en bf16, y recorrer los expertos uno a uno con bitsandbytes resulta muy lento. Este kernel almacena los expertos a aproximadamente 4,13 bits por peso (4 veces menos memoria que bf16) y los procesa en una sola invocacion agrupada, lo que reduce el coste frente al bucle por experto entre 3 y 14 veces.

Es relevante porque cubre un hueco de infraestructura en el despliegue de modelos MoE cuantizados a 4 bits en GPUs Hopper y Ampere, donde NVFP4 solo esta disponible de forma nativa en Blackwell. El codigo se distribuye con licencia Apache 2.0 y se carga directamente desde el Hub mediante `kernels.get_kernel`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Kernel Triton (grouped GEMM) para capas MoE con pesos NF4 |
| Parametros totales | no disponible (no es un modelo) |
| Parametros activos | no disponible (no es un modelo) |
| Longitud de contexto | no disponible (no aplica) |
| Tipos de cuantizacion | NF4 de bitsandbytes con doble cuantizacion (indice de 4 bits, absmax de 8 bits por bloque de 64, escala FP32 por cada 256 absmax); aproximadamente 4,13 bits por peso |
| Idiomas soportados | no disponible (no aplica) |
| Licencia | Apache 2.0 |
| Formato de pesos | bytes NF4 de bitsandbytes, compatibles bit a bit con `bitsandbytes.functional.dequantize_4bit`; entrada y salida en bf16/fp16 |

## Arquitectura y entrenamiento

El componente es un kernel escrito en Triton que implementa `out[filas del experto e] = x[filas de e] @ W[e].T` para un tensor de pesos `[E, N, K]`. La decodificacion NF4 se hace en registros: cada tile de 64 elementos en la dimension K se desempaqueta, se consulta en una tabla de 16 cuantiles de una normal y se alimenta a los tensor cores bf16 mediante `tl.dot`. Las escalas por bloque se precalculan una vez en FP32, exactamente como las calcula bitsandbytes.

Dispone de dos rutas segun el regimen de inferencia. En decodificacion (pocas filas por experto) lanza un programa por experto, tile de N y slice de K con split-K y acumulacion atomica en fp32, sin tile map. En prefill usa tiles de 16 a 128 filas de un mismo experto, localizados dentro del kernel mediante busqueda binaria sobre el conteo de tiles por experto, sin sincronizacion con el host. La API expone `NF4Weights(experts)` para cuantizar y `nf4_grouped_mm(x, offsets, w)`, donde `offsets` son las filas acumuladas por experto.

No hay entrenamiento implicado: es infraestructura de inferencia. La validacion de correccion compara contra `dequantize_4bit` seguido de matmul bf16, con expertos desiguales y vacios, N y K no multiplos del tile, entradas bf16 y fp16, cada caso ejecutado dos veces; el peor error relativo es 3,5e-3 (redondeo bf16) y los valores desquantizados son identicos bit a bit a los de bitsandbytes.

## Capacidades

- Multiplicacion agrupada de tokens por expertos MoE con pesos NF4 en un unico lanzamiento de kernel.
- Compatibilidad bit a bit con el formato NF4 de bitsandbytes, lo que permite reutilizar pesos ya cuantizados con `quantize_4bit`.
- Soporte de expertos con distinto numero de filas, incluidos expertos vacios.
- Soporte de dimensiones N y K no multiplas del tile.
- Soporte de entradas en bf16 y fp16.
- Dos rutas especializadas: decodificacion (split-K con acumulacion atomica fp32) y prefill (tiles de 16 a 128 filas con busqueda binaria en kernel).
- Carga directa desde el Hub mediante `kernels.get_kernel("LegumMagister/nf4-grouped-gemm")`.
- No incluye generacion de texto, vision, audio, tool calling ni razonamiento: es un operador de bajo nivel.

## Casos de uso

- Despliegue de modelos MoE cuantizados a 4 bits en A100 y H100: sustituye el bucle por experto de bitsandbytes en la proyeccion de expertos, con una reduccion de memoria de aproximadamente 4 veces respecto a bf16 y una aceleracion de 3 a 14 veces frente al enfoque secuencial.
- Servicio de inferencia con Qwen3-30B-A3B u otras arquitecturas de 128 expertos y top-8: el kernel esta ajustado a las formas de experto de ese modelo (gate_up 128 x 1536 x 2048 y down 128 x 2048 x 768), por lo que se puede integrar directamente en la ruta de expertos de un servidor tipo vLLM o TGI que soporte kernels personalizados.
- Reduccion de huella de VRAM en GPUs de 80 GB: al almacenar los expertos a 4,13 bits por peso, permite alojar modelos MoE que en bf16 no caben o libera memoria para cache KV y mayor batch.
- Decodificacion interactiva de baja latencia: la ruta de decodificacion (1 a 8 tokens por experto) mantiene tiempos de 0,042 a 0,245 ms por proyeccion, adecuados para generacion token a token.
- Prefill de lote medio: con 64 a 512 tokens por experto el kernel tarda entre 0,303 y 1,112 ms por proyeccion, lo que lo hace util en procesamiento por lotes de prompts.
- Investigacion en cuantizacion de MoE: sirve como referencia de implementacion y como banco de pruebas para comparar estrategias de layout de pesos y pipelining de cargas antes de portar a Marlin o FLUTE.
- Prototipado de kernels en Triton: el codigo y los tests de correccion (`tests/test_and_benchmark.py`) sirven de base para experimentos con otras precisiones o formas de tile.

## Benchmarks y rendimiento

Medido en una NVIDIA H100 80GB HBM3 con las formas de experto de Qwen3-30B-A3B (128 expertos, top-8). Tiempos en milisegundos por proyeccion:

| Proyeccion | Tokens | bf16 grouped | bnb, experto a experto | NF4 grouped | vs bf16 | vs bnb |
|---|---|---|---|---|---|---|
| gate_up 128 x 1536 x 2048 | 1 | 0,033 | 0,389 | 0,061 | 0,54x | 6,4x |
| gate_up 128 x 1536 x 2048 | 8 | 0,110 | 1,867 | 0,245 | 0,45x | 7,6x |
| gate_up 128 x 1536 x 2048 | 64 | 0,230 | 4,512 | 0,521 | 0,44x | 8,7x |
| gate_up 128 x 1536 x 2048 | 512 | 0,300 | 5,859 | 1,112 | 0,27x | 5,3x |
| gate_up 128 x 1536 x 2048 | 4096 | 0,530 | 5,362 | 2,007 | 0,26x | 2,7x |
| down 128 x 2048 x 768 | 1 | 0,024 | 0,385 | 0,042 | 0,57x | 9,2x |
| down 128 x 2048 x 768 | 8 | 0,067 | 1,634 | 0,121 | 0,55x | 13,5x |
| down 128 x 2048 x 768 | 64 | 0,141 | 4,198 | 0,303 | 0,46x | 13,9x |
| down 128 x 2048 x 768 | 512 | 0,164 | 5,138 | 0,578 | 0,28x | 8,9x |
| down 128 x 2048 x 768 | 4096 | 0,297 | 5,273 | 1,053 | 0,28x | 5,0x |

El propio autor indica que el kernel aun no supera a bf16: lee pesos a 110-330 GB/s frente a los 3,35 TB/s del H100, porque las cargas no estan suficientemente pipelined. La siguiente iteracion prevista es un enfoque estilo Marlin/FLUTE con copias asincronas y layout de pesos precalculado offline para los tensor cores.

## Requisitos de hardware

- GPU NVIDIA con tensor cores bf16; el benchmark de referencia se hizo en una H100 80GB HBM3.
- VRAM: depende del modelo MoE al que se aplique, no del kernel. Los pesos de los expertos ocupan aproximadamente una cuarta parte que en bf16 (4,13 bits por peso).
- GPUs objetivo segun el autor: A100 y H100, donde no existe alternativa nativa agrupada para NF4. En Blackwell existe NVFP4 nativo.
- No se documenta compatibilidad con GPUs de consumo (RTX 4090, etc.); no disponible.
- Despliegue: se carga con `kernels.get_kernel` desde el Hub y se invoca como operador dentro de un runtime de PyTorch. No se documenta integracion con vLLM, llama.cpp, Ollama ni TGI.
- Latencia: 0,042-0,061 ms por proyeccion con 1 token; 1,053-2,007 ms con 4096 tokens (H100, formas indicadas).
- Ancho de banda efectivo de lectura de pesos: 110-330 GB/s, muy por debajo del pico del H100.

## Comparativa con modelos similares

| Alternativa | Tipo | Precision de pesos | Ejecucion agrupada | Memoria de expertos | Licencia |
|---|---|---|---|---|---|
| `LegumMagister/nf4-grouped-gemm` | Kernel Triton | NF4 (~4,13 bits) | Si, un lanzamiento | ~4x menor que bf16 | Apache 2.0 |
| `torch._grouped_mm` | Kernel nativo PyTorch | bf16 | Si | Referencia (1x) | BSD (PyTorch) |
| bitsandbytes NF4 experto a experto | Bucle Python + kernels bnb | NF4 | No | ~4x menor que bf16 | MIT |
| NVFP4 nativo (Blackwell) | Kernel nativo de hardware | FP4 | Si | Menor que bf16 | no disponible |

Frente a `torch._grouped_mm` en bf16, este kernel es entre 0,26x y 0,57x la velocidad pero usa una cuarta parte de la memoria. Frente al bucle de bitsandbytes, es entre 2,7x y 13,9x mas rapido. Frente a NVFP4 nativo, no hay datos comparativos publicados.

## Limitaciones y advertencias

- No supera a bf16 en velocidad: el autor lo reconoce explicitamente y atribuye la brecha al pipelining insuficiente de las cargas de pesos.
- Solo se han publicado mediciones en H100; no hay datos para A100, aunque el autor la menciona como GPU objetivo.
- Requiere que los pesos esten en el formato NF4 de bitsandbytes y que los tokens esten ordenados por experto con offsets acumulados; la integracion en un runtime existente exige adaptar el enrutamiento.
- No es un modelo: no genera texto ni tiene capacidades cognitivas, por lo que no aplican sesgos, alucinacion ni limitaciones de idioma. Cualquier evaluacion de calidad debe hacerse sobre el modelo MoE subyacente.
- Sin descargas ni likes en el momento de la consulta y creado en 2026-11-05; madurez y mantenimiento no verificables.
- No se documenta soporte para GPUs de consumo ni para precisiones distintas de bf16/fp16 en la entrada.
- La licencia Apache 2.0 permite uso comercial, pero la responsabilidad sobre los pesos NF4 subyacentes depende de la licencia del modelo original.
- No hay informacion sobre latencia en produccion con concurrencia, ni sobre comportamiento con expertos desbalanceados a gran escala.

## Enlaces

- Hugging Face: https://huggingface.co/LegumMagister/nf4-grouped-gemm
- Repositorio de kernels de Hugging Face (mecanismo `kernels`): https://github.com/huggingface/kernels
- bitsandbytes: https://github.com/bitsandbytes-foundation/bitsandbytes
- Triton: https://github.com/triton-lang/triton
- Paper de NF4 (QLoRA): https://arxiv.org/abs/2305.14314
- Marlin (referencia de kernels 4-bit para tensor cores): https://github.com/IST-DASLab/marlin
