# agenticocho/Qwenputer-CHIP8-int4

## Resumen

Qwenputer-CHIP8-int4 es una versión cuantizada a 4 bits del modelo divagr1925/Qwen3.5-4B-Qwenputer-CHIP8, un derivado de Qwen3.5-4B que incorpora una computadora CHIP-8 emulada dentro de la propia arquitectura del transformer. El trabajo original (modelo, compilador y máquina) es de Divyansh Agrawal y se distribuye a través del repositorio divagr18/qwenputer. Esta variante, publicada por el usuario agenticocho, no añade capacidades nuevas: su único propósito es reducir el peso en disco y en memoria de un artefacto bf16 de 18,8 GB a 7,3 GB en disco y 3,7708 GiB residentes, manteniendo la computación exacta de la máquina emulada.

El modelo base es un transformer Qwen3.5 de aproximadamente 5.690 millones de parámetros totales según los safetensors (etiquetado comercialmente como "4B"), con una arquitectura híbrida que combina capas de atención estándar con capas DeltaNet y una región específica ("chip layers", capas 0-10) que implementa el estado de la CPU CHIP-8. Las capas 11-42 del host se cuantizan a int4 con NF4 absmax y grupo de 64, mientras que las capas del chip se almacenan en un contenedor CSR disperso, ya que son un 99,94 % ceros.

Su relevancia es acotada pero interesante: demuestra que es posible comprimir agresivamente un modelo con estado computacional embebido sin romper la semántica de la máquina, siempre que la cuantización se aplique aguas abajo del punto donde el chip escribe su estado. Es un artefacto de investigación, no un modelo de propósito general.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer Qwen3.5 híbrido (atención + DeltaNet + capas chip para emulación CHIP-8) |
| Parámetros totales | 5.688.620.928 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | int4 NF4 absmax grupo 64 (capas host 11-42); CSR disperso (capas chip 0-10); bf16 (shared, embed, lm_head, norms) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (4 shards) + contenedor CSR propietario `sparse_chip.sparse` |
| Tamaño en disco | 7,3 GB |
| Memoria residente | 3,7708 GiB |
| Modelo base | divagr1925/Qwen3.5-4B-Qwenputer-CHIP8 |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura de Qwen3.5-4B, que combina capas de atención con capas DeltaNet (atención lineal con estado recurrente). Sobre esa base, el proyecto Qwenputer inserta una computadora CHIP-8: las capas 0-10 actúan como "chip layers" que escriben el estado de la CPU emulada, y las capas 11-42 del host procesan ese estado aguas abajo. El modelo se carga como un `Qwen3_5ForCausalLM` estándar, pero la CPU se arranca mediante un driver externo (`RvChat`) que inyecta el firmware en el estado DeltaNet después del prompt; no basta con `transformers` para ejecutarlo.

Esta variante no reentrena ni hace fine-tuning: solo recomprime. Las capas host 11-42 pasan de bf16 a int4 (NF4 absmax, group size 64); las capas chip 0-10 se codifican en un contenedor CSR (`sparse_chip.sparse`, 5,85 MB, 154 tensores, 1.020.720 no-ceros sobre 424.512 filas) porque son un 99,94 % ceros; y las capas compartidas del generador, embeddings, `lm_head` y normas se dejan en bf16. El argumento técnico del autor es que las capas host están aguas abajo del chip, por lo que el ruido de cuantización no alcanza las claves proyectadas que codifican el direccionamiento de memoria de la máquina. No se especifican datos de entrenamiento, número de tokens ni si hubo RLHF/DPO en la información disponible.

## Capacidades

- Generación de texto y razonamiento heredados de Qwen3.5-4B (no evaluados en esta variante).
- Emulación de una CPU CHIP-8 integrada en el estado del modelo: el modelo puede ejecutar programas CHIP-8 y devolver resultados a través de `<tool_response>`.
- Soporte de tool calling/function calling en el formato de Qwen3.5, con respuestas estructuradas verificables.
- Ejecución determinista de la máquina emulada: los valores de `<tool_response>` se mantienen bit-idénticos tras la cuantización en las pruebas realizadas.
- Capacidades multilingües: no disponibles (no documentadas para esta variante).
- No se documentan modos de "thinking", visión ni audio específicos para este artefacto.

## Casos de uso

- Investigación sobre cuantización de modelos con estado computacional: permite estudiar si la compresión int4 preserva la semántica de una máquina emulada embebida, usando los prompts sembrados del repositorio como referencia.
- Despliegue en hardware con VRAM limitada: con 3,7708 GiB residentes, el modelo cabe en GPUs consumer de 8 GB (RTX 3060 Ti, RTX 4060) y permite experimentar con Qwenputer sin una GPU de 24 GB.
- Reproducción de experimentos de Qwenputer en CPU: el contenedor CSR y el loader permiten ejecutar la verificación independiente descrita en la model card (repack a bf16 y ejecución de preguntas sembradas).
- Docencia y divulgación: sirve para explicar cómo se integra una CPU CHIP-8 en un transformer y cómo afecta la cuantización a las distintas regiones del modelo.
- Pruebas de regresión de infraestructura de inferencia: útil para validar loaders personalizados (no estándar de `transformers`) y formatos CSR en pipelines propios.
- Base para derivados experimentales: al ser Apache-2.0, se puede reutilizar como punto de partida para otras compresiones o para portar la máquina a otras arquitecturas, siempre citando el trabajo upstream.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card reporta únicamente mediciones de exactitud de la emulación, no de calidad del lenguaje:

| Medición | Resultado | n | Entorno |
|---|---|---|---|
| Aritmética CHIP-8 | 10/10 | 10 problemas sembrados | MPS del autor |
| CPU con repack independiente | 7/7 | 7 de una tanda de 10 | RTX 3060 Ti |
| CUDA extremo a extremo | 1/1 | 1 | RTX 3060 Ti |
| Invariancia del host a 4 bits | 10/10, los diez `<tool_response>` bit-idénticos | 10 | MPS del autor |

El autor advierte explícitamente que estas filas son muestras del tamaño indicado en `n` y no deben compararse con la suite de 40 problemas por conjunto del README upstream.

## Requisitos de hardware

- VRAM estimada: 3,7708 GiB residentes según la model card; en la práctica, añadir overhead del runtime y del contexto.
- GPU recomendadas: RTX 3060 Ti (verificada por un tercero), RTX 4090, A100/H100 para mayor throughput; el autor midió en un MacBook Pro M4 (Metal) y en una RTX 3060 Ti (CUDA).
- Cabe en GPU consumer de 8 GB; no se documenta funcionamiento en GPUs de 4 GB.
- Opciones de despliegue: no es compatible con `transformers` estándar ni con vLLM/llama.cpp/Ollama/TGI tal cual; requiere el loader del repositorio `agenticocho/qwenputer` (rama `quantized-int4`), que carga el contenedor CSR y arranca la CPU mediante `RvChat`.
- Latencia y throughput: no medidos (el autor indica explícitamente que solo midió memoria, no velocidad).

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| agenticocho/Qwenputer-CHIP8-int4 | 5.688.620.928 | no disponible | int4 + CSR | Apache-2.0 | Hugging Face |
| divagr1925/Qwen3.5-4B-Qwenputer-CHIP8 (upstream) | no disponible | no disponible | bf16 (18,8 GB) | Apache-2.0 | Hugging Face |
| Qwen/Qwen3.5-4B (base) | no disponible | no disponible | múltiples | Apache-2.0 | Hugging Face |

No se dispone de datos de rendimiento comparables entre estas variantes en la información proporcionada; la única diferencia documentada es de tamaño y formato de almacenamiento.

## Limitaciones y advertencias

- No es un modelo de propósito general: la máquina CHIP-8 emulada no es generalista y el artefacto está pensado para investigación.
- No se ha medido throughput ni latencia; no asumir mejoras de velocidad por la cuantización.
- Solo cubre la versión 1 (CHIP-8); no es la línea RISC-V mainline. Se documenta un test inválido con fixtures RISC-V rechazados en `0x100000`.
- Requiere un loader específico del repositorio; no funciona con `transformers` solo ni con servidores de inferencia estándar.
- Las mediciones de exactitud son muestras pequeñas (n=1, n=7, n=10) y no constituyen un benchmark; el autor lo advierte explícitamente.
- No se documentan sesgos, comportamiento multilingüe ni tasas de alucinación para esta variante.
- Licencia Apache-2.0 permite uso comercial, pero no concede derechos de marca; si se redistribuyen los pesos, debe incluirse la sección de créditos y licencias de la model card.
- No se incluyen ROMs en el repositorio y no deben añadirse; las ROMs de `games/roms` del upstream tienen licencias propias (50 CC0, 69 del pack Revival Studios).
- El código upstream es MIT con carve-out para las ROMs; el modelo no representa el aval de los autores originales.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/agenticocho/Qwenputer-CHIP8-int4
- Modelo base: https://huggingface.co/divagr1925/Qwen3.5-4B-Qwenputer-CHIP8
- Repositorio upstream: https://github.com/divagr18/qwenputer
- Rama cuantizada del autor: https://github.com/agenticocho/qwenputer/tree/quantized-int4
- Instrucciones de la variante cuantizada: https://github.com/agenticocho/qwenputer/tree/quantized-int4/quantized
- Issue upstream de discusión: https://github.com/divagr18/qwenputer/issues/6
- Especificación del contenedor CSR: `SPRV1_SPEC.md` (en el repositorio del autor)
