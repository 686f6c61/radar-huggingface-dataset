# jgalego/olmputer-tiny

## Resumen

olmputer-tiny es un modelo de 3.130.046.036 parámetros publicado por el usuario jgalego en Hugging Face que no ha sido entrenado con descenso de gradiente: sus pesos son el resultado de compilar un ordenador RISC-V (ISA RV32IM + Zba, con instrucciones adicionales para ficheros de dígitos de precisión arbitraria) dentro de las capas de una arquitectura `OlmoHybridForCausalLM`. El modelo ejecuta programas RISC-V mediante decodificación greedy: cada token generado es el siguiente token de la traza de ejecución de la CPU, de modo que la generación de texto es en realidad la ejecución de un programa.

La arquitectura replica las formas de cabeza de OLMo-Hybrid-7B de Ai2 (30 cabezas de 96 × 192 por capa, MLP de 11.008 unidades, hidden de 2.816) pero sin reutilizar ninguno de sus pesos. El estado recurrente de las capas Gated DeltaNet almacena la ROM de código (256 KB), la ROM de datos (128 KB, solo lectura), la RAM (32 KB) y los registros de la CPU. El vocabulario está formado por los tokens de traza (valores en trozos de 15 bits, saltos, stores, putchar, etc.) más un token PAD.

El modelo es relevante como demostración de compilación de circuitos en pesos de transformers y como pieza independiente del proyecto Olmputer, que coloca las mismas capas delante de `allenai/Olmo-Hybrid-Instruct-DPO-7B` para que las llamadas a la herramienta `calc` de OLMo se ejecuten en la CPU embebida en sus pesos. Es un port de Qwenputer (que hace lo mismo con Qwen3.5-4B) a las formas de OLMo-Hybrid.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | OlmoHybridForCausalLM: 11 capas Gated DeltaNet + SwiGLU, más una capa de atención nula requerida por la caché de HF |
| Parámetros totales | 3.130.046.036 (casi todos cero) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (las trazas de validación llegan a 60k tokens) |
| Tipos de cuantización | no disponible (pesos publicados en bfloat16; el ejemplo carga con `dtype=torch.bfloat16`) |
| Idiomas soportados | no disponible (el vocabulario son tokens de traza de CPU, no lenguaje natural) |
| Licencia | MIT |
| Formato de pesos | safetensors (librería transformers) |

## Arquitectura y entrenamiento

El modelo usa la arquitectura OLMo-Hybrid: capas híbridas con Gated DeltaNet (atención lineal recurrente con compuertas) y SwiGLU, con las formas de cabeza de OLMo-Hybrid-7B (30 cabezas de 96 × 192 por capa, MLP de 11.008, hidden 2.816). No hay entrenamiento: un compilador (el paquete `chipformer` del repositorio JGalego/olmputer) calcula todos los pesos para que el estado recurrente de las capas Gated DeltaNet represente fielmente la ROM de código, la ROM de datos, la RAM y los registros de una CPU RISC-V.

Las adaptaciones respecto a Qwenputer (que usa cabezas de 128 × 128 con dos cabezas de valor por cabeza de clave) son explícitas en la model card: el lastre de una fila de estado ocupa 3 de sus 192 columnas para que la normalización de salida con compuerta divida por la misma potencia de 2; la ROM almacena bytes y una lectura de byte requiere una escala de consulta potencia de 2, por lo que la consulta de la fila seleccionada se rellena con cuatro filas que nunca se escriben (pesos 3 : 3, 2, 1, 1) para que la escala sea exactamente 1/16; las compuertas de escritura usan β = 2·sigmoid(b) de OLMo (b = 0 escribe, b ≤ -256 no escribe); y las filas de ROM contienen 32 palabras en lugar de 8 para que la ROM de 256 KB quepa en las 30 cabezas de una capa, mientras que la RAM, con una palabra por fila, ocupa tres capas.

La validación se hace contra un emulador RISC-V de referencia: el flujo residual tras las capas del chip iguala al evaluador de IR del circuito en todas las dimensiones y posiciones (bf16, trazas de hasta 60k tokens), y la generación greedy libre desde el inicio del programa reproduce la traza de referencia token a token. En la tabla de comprobaciones publicada, las ejecuciones c-qsort (1 programa, 240.175 tokens de traza), c-sieve-gmpmul (2 programas, 66.825 tokens), short-fla (55 programas, 26.677 tokens) y short-torch (55 programas, 26.677 tokens) son exactas al 100 %.

## Capacidades

- Ejecución de programas RISC-V (RV32IM + Zba) compilados en los pesos: la decodificación greedy produce la traza de ejecución de la CPU.
- Instrucciones de ficheros de dígitos de precisión arbitraria (bignum) además del conjunto RV32IM + Zba.
- Almacenamiento en estado recurrente de ROM de código (256 KB), ROM de datos (128 KB) y RAM (32 KB) más registros.
- Salida de traza con valores en trozos de 15 bits, saltos, stores y `putchar`.
- Etiqueta `tool-use` en el repositorio: el proyecto matriz Olmputer usa estas capas para ejecutar la herramienta `calc` de OLMo dentro de los pesos.
- No es un modelo de lenguaje natural: no genera texto en ningún idioma, no razona en lenguaje natural ni tiene capacidades multilingües, de visión o de audio.
- No dispone de tool calling en el sentido habitual de API; la "herramienta" es la propia CPU compilada.

## Casos de uso

- Ejecución verificable de programas RISC-V: cargar un ELF en la ROM y decodificar hasta HALT para obtener una traza idéntica a la de un emulador de referencia, útil para validar compiladores o emuladores.
- Demostración de compilación de circuitos en transformers: estudiar cómo se codifican ROM, RAM y registros en el estado recurrente de capas Gated DeltaNet con formas de cabeza concretas.
- Cálculo determinista dentro de un pipeline de agentes: el proyecto Olmputer integra estas capas delante de OLMo-Hybrid-Instruct-DPO-7B para que las llamadas a `calc` se resuelvan en la CPU embebida en lugar de en un servicio externo.
- Pruebas de fidelidad de kernels de atención lineal: la model card compara ejecuciones con kernels `torch` y `fla` sobre los mismos 55 programas, lo que permite validar implementaciones de Gated DeltaNet.
- Investigación en cómputo en el estado recurrente: usar el modelo como banco de pruebas para medir cuánta memoria y cómputo caben en el estado de un transformer híbrido.
- Ejecución de referencia en CPU o GPU para reproducir fibonacci(25) con el script `example.py`, que sirve como test de integración de transformers 5.19.0 y torch 2.14.1.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de lenguaje (MMLU, HumanEval, GSM8K) en la información disponible; el modelo no está orientado a esas tareas. La model card publica comprobaciones de exactitud de traza:

| Ejecución | Kernels | Programas | Exactos | Tokens de traza |
|---|---|---|---|---|
| c-qsort | torch | 1 | 1 | 240.175 |
| c-sieve-gmpmul | torch | 2 | 2 | 66.825 |
| short-fla | fla | 55 | 55 | 26.677 |
| short-torch | torch | 55 | 55 | 26.677 |

## Requisitos de hardware

- VRAM estimada: los pesos en bfloat16 ocupan aproximadamente 6,3 GB (tamaño del repositorio); en fp32 serían unos 12,5 GB. No se han publicado estimaciones para cuantizaciones de 8 o 4 bits.
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM para bfloat16; el ejemplo se ha ejecutado en CUDA y en CPU (más lento).
- Cabe en GPU de consumo: sí, en tarjetas con 8 GB o más (por ejemplo, RTX 3060 Ti, RTX 4060 Ti, RTX 3070 en adelante).
- Opciones de despliegue: `transformers` con `OlmoHybridForCausalLM` (versión 5.19.0 en el ejemplo) y el paquete `chipformer` para construir el circuito y cargar ROM/RAM/registros. No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: la model card indica que una GPU tarda menos de un minuto en ejecutar fibonacci(25); no se publican cifras de tokens por segundo.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| olmputer-tiny | 3,13B (casi todos cero) | no disponible | CPU RISC-V compilada en capas Gated DeltaNet de OLMo-Hybrid | MIT | Hugging Face |
| Qwenputer (Qwen3.5-4B) | no disponible | no disponible | Misma técnica sobre Qwen3.5-4B, cabezas 128 × 128 | no disponible | GitHub (divagr18/qwenputer) |
| Olmputer (completo) | no disponible | no disponible | Las mismas capas delante de Olmo-Hybrid-Instruct-DPO-7B para tool use `calc` | no disponible | Hugging Face (jgalego/olmputer) |

No se dispone de datos de benchmarks comparativos entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- No es un modelo de lenguaje: no comprende ni genera lenguaje natural, y su vocabulario son tokens de traza de CPU más PAD.
- Los pesos no se han entrenado; cualquier uso fuera de la ejecución de programas RISC-V carece de sentido y puede producir salidas sin significado.
- La exactitud depende de la coincidencia exacta de formas de cabeza y de las adaptaciones descritas (escala 1/16, lastre en 3 columnas, β = 2·sigmoid(b)); cambios en la implementación de atención o en la precisión pueden romper la fidelidad de la traza.
- La validación publicada es en bfloat16 y con trazas de hasta 60k tokens; no se documentan límites de contexto más allá de ese valor.
- El modelo no está afiliado ni respaldado por Ai2, pese a usar la arquitectura y formas de OLMo-Hybrid.
- Licencia MIT: permite uso comercial, pero al no ser un modelo generativo de propósito general no hay aplicaciones comerciales directas documentadas.
- Riesgo de alucinación en el sentido habitual no aplica; el riesgo real es divergencia de la traza si el entorno de ejecución no reproduce las condiciones del compilador.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no hay evidencia de uso en producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/jgalego/olmputer-tiny
- Proyecto Olmputer completo: https://huggingface.co/jgalego/olmputer
- Modelo base de arquitectura (Ai2 OLMo-Hybrid): https://huggingface.co/allenai/Olmo-Hybrid-Instruct-DPO-7B
- Repositorio del compilador chipformer: https://github.com/JGalego/olmputer
- Qwenputer (proyecto original portado): https://github.com/divagr18/qwenputer
- Script de ejemplo: https://huggingface.co/jgalego/olmputer-tiny/resolve/main/example.py
