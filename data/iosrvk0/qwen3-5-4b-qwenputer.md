# iosrvk0/Qwen3.5-4B-Qwenputer

## Resumen

Qwenputer es un artefacto experimental publicado por Divyansh Agrawal (usuario `iosrvk0` en Hugging Face) que consiste en Qwen3.5-4B con una CPU RISC-V de 32 bits compilada e insertada directamente en sus pesos. No se trata de una herramienta externa ni de un sandbox: la CPU ocupa 11 capas de transformer situadas por delante de las 32 capas propias de Qwen, y ninguno de los pesos de esas capas se aprende; un compilador calcula cada uno de ellos. El modelo base es Qwen/Qwen3.5-4B, con arquitectura `Qwen3_5ForCausalLM` y cambios exclusivamente de configuración.

La innovación técnica central es el uso del estado de las capas Gated DeltaNet de Qwen3.5 como memoria RAM. La regla delta permite sobrescribir una fila del estado de forma exacta, de modo que cada fila funciona como una celda de memoria; ahí residen el código, los datos, los registros y el contador de programa de la CPU. El modelo ejecuta código C y MicroPython dentro de sus propios forward passes y supera las suites oficiales de pruebas riscv-tests.

El modelo es relevante como prueba de concepto de cómputo determinista embebido en pesos de un LLM: mejora la aritmética de enteros grande respecto al modelo base sin recurrir a un intérprete Python en el host, y mantiene el comportamiento textual de Qwen con una divergencia KL de 6e-4 frente a un suelo de ruido de 5e-4. El repositorio ocupa 18,8 GB en bf16, en su mayor parte relleno de ceros, y la CPU contiene aproximadamente 1 millón de pesos no nulos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer `Qwen3_5ForCausalLM` (solo texto) con 11 capas de CPU RISC-V compiladas por delante de las 32 capas de Qwen; Gated DeltaNet como RAM |
| Parametros totales | 9.357.602.496 (safetensors); la CPU aporta aproximadamente 1M de pesos no nulos |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible; el modelo es exacto en bf16 |
| Idiomas soportados | No disponibles |
| Licencia | Apache-2.0 |
| Formato de pesos | Safetensors (bf16); repositorio de 18,8 GB |

## Arquitectura y entrenamiento

La arquitectura parte del transformer de Qwen3.5-4B sin modificar sus pesos. La modificación consiste en ampliar la dimensión oculta de 2560 a 3968 (añadiendo las dimensiones de la computadora) y anteponer 11 capas compiladas que implementan un núcleo RV32IM con extensión Zba y un coprocesador de precisión arbitraria (bignum). El vocabulario de Qwen se amplía con 230.324 tokens de traza que representan las señales internas de la CPU. No hay entrenamiento: los pesos de las capas de la computadora los genera un compilador, y los pesos de Qwen permanecen intactos.

El mecanismo de cómputo se apoya en el estado recurrente de las capas Gated DeltaNet: una clave one-hot sobrescribe una fila concreta y una consulta one-hot la recupera, lo que permite usar cada fila como celda de memoria direccionable. Qwen escribe un bloque `<tool_call>` para `calc` como haría con cualquier herramienta, pero nada fuera del modelo lo ejecuta: las capas de la computadora leen la llamada, ejecutan el cálculo en la CPU RISC-V y el propio modelo redacta el `<tool_response>` dígito a dígito. El driver `RvChat` arranca la CPU cargando el firmware en el estado DeltaNet tras el prompt y mantiene los tokens de traza fuera de las capas de Qwen durante la decodificación. La CPU se ejecuta sobre un executor Triton a unos 3200 tokens de traza por segundo en una GPU L4.

## Capacidades

- Generación de texto conversacional heredada íntegramente de Qwen3.5-4B.
- Ejecución interna de código C y MicroPython compilado para RV32IM dentro de los forward passes del modelo.
- Aritmética entera de precisión arbitraria mediante el coprocesador bignum, con mejora medida en multiplicaciones y divisiones de números grandes.
- Cumplimiento de las suites oficiales riscv-tests.
- Uso del formato de tool calling de Qwen3.5 (`<tool_call>` / `<tool_response>`) de forma interna, sin ejecutor externo ni sandbox.
- Determinismo verificado: unos 230.000 posiciones de salida de la computadora replicadas contra un modelo de referencia de la máquina, con cero discrepancias.
- Capacidades de visión, audio o modo thinking: no disponibles en la información proporcionada.
- Soporte multilingüe: no disponible en la información proporcionada.

## Casos de uso

- Investigación sobre cómputo determinista en LLM: permite estudiar cómo un modelo puede delegar operaciones exactas a circuitos compilados en sus propios pesos, sin depender de un intérprete externo, útil para analizar límites entre razonamiento aprendido y cómputo simbólico.
- Aritmética de precisión en pipelines sin herramientas externas: en entornos donde no se permite ejecutar código en el host, el modelo resuelve multiplicaciones y divisiones de enteros grandes internamente, con resultados cercanos a los de un intérprete Python real según los benchmarks publicados.
- Reproducción de experimentos de arquitectura híbrida: sirve para validar el uso del estado Gated DeltaNet como memoria direccionable, un patrón aplicable a investigación sobre memoria persistente en modelos recurrentes.
- Docencia y divulgación de sistemas: el modelo ilustra de forma tangible cómo se compila un ISA RISC-V y se integra en una red neuronal, con firmware de ejemplo (`calc-bridge.elf`) y trazabilidad por tokens.
- Pruebas de verificación formal de ejecución: el mecanismo de traza permite comparar posición a posición la salida del modelo con un emulador de referencia, útil para auditoría de comportamiento determinista.
- Evaluación de robustez en tool calling: al reutilizar el formato de llamada a herramientas de Qwen3.5, permite estudiar cómo un modelo entrenado para invocar herramientas se comporta cuando la herramienta es interna y determinista.

## Benchmarks y rendimiento

Decodificación greedy, 40 problemas por conjunto. Cada fila compara el modelo base Qwen3.5-4B y Qwenputer sobre los mismos problemas. El modelo base no dispone de herramientas y recibe una línea de sistema indicando que realice cada paso aritmético de forma exacta. La columna de herramienta Python corresponde al modelo base llamando a un intérprete Python real en el host.

| Benchmark | Base Qwen3.5-4B | Qwenputer | Herramienta Python (host) |
|---|---|---|---|
| Aritmética entera sintética | 75,0 | 97,5 | 97,5 |
| DeepMind `mul_big` | 55,0 | 97,5 | 100 |
| DeepMind `div_big` | 72,5 | 97,5 | 95,0 |
| DeepMind `mul_div_multiple_longer` | 90,0 | 100,0 | 97,5 |
| DeepMind `add_or_sub_big` | 87,5 | 97,5 | 97,5 |

Además, la divergencia KL del comportamiento textual respecto al modelo base es de 6e-4, frente a un suelo de ruido de 5e-4, y la réplica de unas 230.000 posiciones de salida de la computadora contra un modelo de referencia de la máquina no arrojó ninguna discrepancia.

## Requisitos de hardware

- VRAM estimada para inferencia: el repositorio pesa 18,8 GB en bf16; se requiere al menos esa cifra más overhead de activaciones y estado DeltaNet. No se dispone de estimaciones para cuantizaciones porque no se documentan.
- GPU recomendadas: el autor reporta ejecución del executor Triton de la CPU a unos 3200 tokens de traza por segundo en una NVIDIA L4; no se publican cifras para A100, H100 ni RTX 4090.
- GPU de consumo: no se confirma compatibilidad con GPUs de consumo; 18,8 GB en bf16 excede la VRAM de la mayoría de tarjetas consumer actuales salvo modelos de 24 GB o más, y no hay datos de cuantización que permitan reducirla.
- Opciones de despliegue: el modelo carga como un `Qwen3_5ForCausalLM` estándar de transformers; el autor proporciona el driver `RvChat` del repositorio `qwenputer` y un flujo de descarga con `hf download`. No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: únicamente se publica el rendimiento del executor de la CPU (unos 3200 tokens de traza por segundo en L4); no hay cifras de latencia extremo a extremo ni de tokens por segundo en generación de texto.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.5-4B-Qwenputer | 9.357.602.496 (safetensors); ~1M no nulos en la CPU | No disponible | Qwen3.5-4B + CPU RISC-V compilada en pesos | Apache-2.0 | Hugging Face (`iosrvk0/Qwen3.5-4B-Qwenputer`) |
| Qwen/Qwen3.5-4B | No disponible en la información proporcionada | No disponible | Transformer de texto de referencia | Apache-2.0 (según el autor) | Hugging Face |
| Qwen3.5-4B-Qwenputer-Filesystem | No disponible | No disponible | Variante del mismo experimento orientada a sistema de ficheros | No disponible | Hugging Face (`divagr1925/...`) |

No se dispone de datos de benchmarks de los modelos comparables distintos del base Qwen3.5-4B incluido en la tabla de rendimiento. No se identifican en la información proporcionada otros modelos de la misma categoría (LLM con cómputo simbólico compilado en pesos) para una comparación técnica directa.

## Limitaciones y advertencias

- Modelo experimental: el propio autor lo describe como "a new kind of experimental model"; no está pensado para producción.
- Repositorio de 18,8 GB en bf16 mayoritariamente relleno de ceros, lo que encarece almacenamiento y transferencia sin aportar capacidad efectiva.
- El vocabulario ampliado con 230.324 tokens de traza altera el tokenizador respecto a Qwen3.5-4B; las herramientas que asuman el vocabulario original pueden fallar.
- El uso de las capas Gated DeltaNet como RAM implica que el estado recurrente se emplea para almacenar código y datos de la CPU; no se documentan límites de tamaño de programa ni de memoria disponible.
- No se publican datos sobre sesgos, tasas de alucinación, cobertura idiomática ni comportamiento fuera de las tareas aritméticas evaluadas.
- La licencia Apache-2.0 cubre el artefacto del modelo; el código fuente del repositorio `qwenputer` se distribuye bajo MIT según el autor, y la cita del DOI identifica el artefacto, no la release de código.
- Solo se han publicado evaluaciones con decodificación greedy y 40 problemas por conjunto, una muestra reducida que limita la extrapolación de los resultados.
- No hay información sobre cuantización, por lo que el despliegue en hardware con VRAM limitada no está caracterizado.
- El modelo base Qwen3.5-4B y sus pesos no se modifican, pero la configuración sí (dimensión oculta y vocabulario), lo que puede romper la compatibilidad con utilidades que validen la configuración original.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/iosrvk0/Qwen3.5-4B-Qwenputer
- Modelo en Hugging Face citado en la model card: https://huggingface.co/divagr1925/Qwen3.5-4B-Qwenputer
- Código fuente en GitHub: https://github.com/divagr18/qwenputer
- Modelo Filesystem: https://huggingface.co/divagr1925/Qwen3.5-4B-Qwenputer-Filesystem
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- ORCID del autor: https://orcid.org/0009-0003-0739-2473
- DOI del artefacto: https://doi.org/10.57967/hf/11140
