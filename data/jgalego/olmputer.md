# jgalego/olmputer

## Resumen

Olmputer es un modelo experimental publicado por el desarrollador independiente jgalego que integra una CPU RISC-V (RV32IM + Zba) directamente en los pesos de un transformer híbrido. Parte de `allenai/Olmo-Hybrid-Instruct-DPO-7B` y le antepone 11 capas adicionales compiladas que implementan una máquina virtual con firmware de calculadora de precisión arbitraria. El objetivo es que las llamadas a la herramienta `calc` se ejecuten dentro del propio forward pass del modelo, sin necesidad de un intérprete externo, y que el resultado vuelva al modelo como tokens propios.

La propuesta es conceptualmente singular: no se entrena ningún peso nuevo. El compilador `chipformer` calcula las capas del chip a partir de la especificación del procesador, y los pesos de OLMo solo se modifican mediante zero-padding hasta la dimensión oculta ampliada y un reescalado de las ganancias de normalización. El resultado es un modelo de aproximadamente 16.200 millones de parámetros en safetensors (frente a los 7B del modelo base), con licencia Apache 2.0 y formato transformers.

Es relevante ahora porque explora una vía poco transitada para dotar a los LLM de aritmética exacta y verificable sin depender de herramientas externas ni de RLHF específico para matemáticas. La contrapartida es que requiere un decoding personalizado: `generate()` estándar no ejecuta la máquina, ya que los tokens de traza del chip solo atraviesan las capas compiladas y no las capas de atención completa de OLMo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer híbrido (OLMo-Hybrid con capas Gated DeltaNet y atención completa) más 11 capas compiladas que implementan una CPU RISC-V RV32IM + Zba |
| Parametros totales | 16.198.899.060 (safetensors) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería transformers) |

## Arquitectura y entrenamiento

Olmputer no entrena pesos. Sobre el modelo base `allenai/Olmo-Hybrid-Instruct-DPO-7B`, que combina capas Gated DeltaNet con capas de atención completa, se anteponen 11 capas generadas por el compilador `chipformer`. Estas capas alojan en el estado recurrente de las Gated DeltaNet la memoria de la máquina: 256 KB de ROM de código, 128 KB de datos de solo lectura y 32 KB de RAM, con aproximadamente 1,2 tokens de traza por instrucción. El firmware implementa una calculadora de números grandes con operaciones `+ - * / // % **` y `gcd` sobre enteros de hasta 62 dígitos, además de fracciones y decimales exactos.

El puente entre el modelo y la máquina funciona por copia de texto: lo que OLMo escribe dentro de `<function_calls>…</function_calls>` se copia a un búfer que lee el firmware. Al llegar a `</function_calls>`, el circuito toma el control, ejecuta la llamada y escribe el turno de entorno (`<|im_end|>\n<|im_start|>environment\n…`) antes de devolver el flujo a OLMo. Los números se imprimen como grupos de hasta tres dígitos, que es como OLMo los tokeniza; con un dígito por token el modelo base los corrompe (0/40 aciertos frente a 33/40 con agrupación). Los tokens de traza del chip solo atraviesan las capas compiladas, de modo que las cachés y posiciones de OLMo ven únicamente el texto, lo que exige un decoding específico y hace que `generate()` estándar no ejecute la máquina. Los pesos de OLMo solo cambian por zero-padding a la dimensión oculta ampliada y por un reescalado de las ganancias de normalización.

## Capacidades

- Generación de texto conversacional y razonamiento general heredados de OLMo-Hybrid-Instruct-DPO-7B.
- Uso de herramientas (tool use) con la herramienta `calc`, ejecutada internamente por la CPU RISC-V integrada.
- Aritmética exacta verificable: suma, resta, multiplicación, división entera y real, módulo, potencia y máximo común divisor sobre enteros de hasta 62 dígitos, fracciones y decimales.
- Devolución del resultado como tokens propios del modelo, lo que permite al modelo razonar sobre el valor exacto en lugar de aproximarlo.
- Traza de ejecución transparente: los tokens del chip no contaminan las capas de atención de OLMo.
- Capacidades multilingües: no disponibles en la información proporcionada.
- Modo thinking, visión o audio: no disponibles.

## Casos de uso

- Cálculo aritmético exacto en asistentes: el modelo puede resolver operaciones de precisión arbitraria invocando `calc` y leyendo el resultado como tokens propios, lo que evita errores de aproximación típicos de los LLM en divisiones y potencias grandes.
- Verificación de pipelines financieros o contables: al ejecutarse la aritmética dentro del forward pass y poder comprobarse cada token del circuito contra un emulador de referencia, el resultado es auditable paso a paso.
- Investigación sobre tool use end-to-end: sirve como banco de pruebas para estudiar cómo un modelo razona sobre resultados de herramientas cuando estos llegan como tokens propios en lugar de como texto inyectado por un orquestador externo.
- Evaluación de compilación de circuitos en pesos: útil para experimentos de neuro-simbólico y de compilación de programas a transformers, comparando la fidelidad del circuito compilado con la del emulador de referencia.
- Docencia y demostraciones de arquitecturas híbridas: permite mostrar en vivo cómo las capas Gated DeltaNet almacenan estado de una máquina y cómo se integra con capas de atención completa.
- Pruebas de robustez de tokenización numérica: el caso de los grupos de tres dígitos frente a un dígito por token documenta un fallo concreto de tokenización aritmética que puede replicarse en otros modelos.
- Prototipado de asistentes con cálculo determinista en entornos sin acceso a intérpretes externos, siempre que se acepte el decoding personalizado que exige el modelo.

## Benchmarks y rendimiento

Paridad de texto frente al modelo base (distribuciones del siguiente token en prompts reservados):

| Métrica | Valor |
|---|---|
| KL(base ‖ merged), media | 5,87e-04 |
| KL(base sdpa ‖ base eager), media (suelo de ruido) | 5,66e-04 |
| Continuaciones greedy idénticas al base | 12/16 |
| Base sdpa vs base eager, greedy idénticas (suelo de ruido) | 11/16 |

Ejecución de programas a través del modelo fusionado (tokens del circuito comprobados contra el emulador de referencia):

| Programa | Posiciones | Propiedad del circuito | Erróneos |
|---|---|---|---|
| calc | 651 | 651 | 0 |
| c-strops | 1.074 | 1.074 | 0 |
| rv32ui-lb | 193 | 193 | 0 |
| rv32um-div | 142 | 142 | 0 |

Conversaciones: 24/24 limpias. Con las capas del chip en el ejecutor Triton de chipformer (aritmética en fp32, verificada igual al circuito en cada valor), las mismas 24 conversaciones son idénticas token a token y tardan 6,5 s cada una frente a 157 s con los módulos de Hugging Face.

Aritmética (decoding greedy, 40 problemas por conjunto, puntuado por coincidencia racional exacta de la respuesta final):

| Conjunto | Olmputer | OLMo + herramienta calc en host | OLMo sin herramienta |
|---|---|---|---|
| arith | 40/40 | 40/40 | 25/40 |
| dmx_mul_big | 40/40 | 40/40 | 14/40 |
| dmx_div_big | 37/40 | 37/40 | 11/40 |
| dmx_mul_div_multiple_longer | 24/40 | 22/40 | 16/40 |
| dmx_add_or_sub_big | 38/40 | 38/40 | 21/40 |

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada. Como referencia orientativa, un modelo de 16.200 millones de parámetros en fp16 requiere del orden de 32 GB de pesos, pero el autor no publica cifras de VRAM ni cuantizaciones.
- GPU recomendadas: no disponibles en la información proporcionada.
- Compatibilidad con GPU de consumo: no confirmada; el tamaño del repositorio (36,1 GB) sugiere que no cabe en GPU de consumo de 24 GB sin cuantización, y no se documentan formatos GGUF.
- Opciones de despliegue: transformers con decoding personalizado; el autor proporciona un script `example.py` ejecutable con `uv` que declara sus dependencias (incluida `chipformer` desde el repositorio de GitHub). No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia: 6,5 s por conversación con el ejecutor Triton de chipformer y 157 s con los módulos de Hugging Face, según las pruebas del autor.
- Throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Aritmética exacta integrada | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Olmputer | 16.198.899.060 | no disponible | Sí, CPU RISC-V en pesos | Apache 2.0 | Hugging Face (jgalego/olmputer) |
| allenai/Olmo-Hybrid-Instruct-DPO-7B | 7B (aprox.) | no disponible | No (requiere herramienta externa) | no disponible en la información | Hugging Face |
| Qwenputer (Qwen3.5-4B con la misma máquina) | no disponible | no disponible | Sí, misma aproximación | no disponible en la información | GitHub (divagr18/qwenputer) |
| olmputer-tiny | no disponible | no disponible | Solo las capas del chip | no disponible en la información | Hugging Face (jgalego/olmputer-tiny) |

## Limitaciones y advertencias

- El decoding estándar (`generate()`) no ejecuta la máquina: es imprescindible usar el decoding específico del autor, ya que las capas de atención completa de OLMo no tienen puerta de salida para silenciar los tokens del chip.
- La aritmética exacta solo cubre las operaciones del firmware (`+ - * / // % **`, `gcd`) sobre enteros de hasta 62 dígitos, fracciones y decimales; no es una calculadora científica general.
- El modelo base puede alucinar en el resto de tareas; la garantía de exactitud se limita a los tokens propiedad del circuito, que se verifican contra el emulador de referencia.
- La tokenización numérica es frágil: con un dígito por token el modelo base corrompe los resultados (0/40 frente a 33/40 con grupos de tres dígitos), lo que condiciona el diseño del firmware y su interoperabilidad.
- El rendimiento en los conjuntos más complejos no es perfecto: 24/40 en `dmx_mul_div_multiple_longer`, por debajo del 40/40 en conjuntos más simples.
- El modelo no está afiliado ni respaldado por Ai2; es un proyecto independiente con 0 descargas y 0 likes en el momento de la consulta.
- Idiomas soportados no documentados; no se especifican sesgos conocidos ni restricciones adicionales de la licencia Apache 2.0 más allá de las habituales.
- El tamaño del repositorio (36,1 GB) y la ausencia de cuantizaciones publicadas limitan su despliegue en hardware de consumo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/jgalego/olmputer
- Modelo base: https://huggingface.co/allenai/Olmo-Hybrid-Instruct-DPO-7B
- Repositorio del compilador y del proyecto: https://github.com/JGalego/olmputer
- Paquete `chipformer` (usado en `example.py`): https://github.com/JGalego/olmputer/archive/98639dff4c84a18542e3ca12a286a4df563b3a27.tar.gz#subdirectory=experimental/riscv
- Capas del chip aisladas: https://huggingface.co/jgalego/olmputer-tiny
- Proyecto original Qwenputer: https://github.com/divagr18/qwenputer
- Script de ejemplo: https://huggingface.co/jgalego/olmputer/resolve/main/example.py
