# CaryPalmer/Kintsugi-27B

## Resumen

Kintsugi-27B es una cuantización extrema de Qwen3.8-27B publicada por CaryPalmer que comprime el modelo base a 2,47 bits por peso, permitiendo ejecutar los 262.144 tokens de contexto completo en una única GPU de 12 GB. El autor reporta que el modelo mantiene una fidelidad cercana a BF16 en tareas de agente, con recuperación perfecta de información a 245.000 tokens y persistencia de instrucciones de sistema a lo largo de sesiones de agente extensas. La licencia es Apache-2.0 y el artefacto principal es un GGUF de 11,6 GB.

El modelo se distribuye como un ecosistema completo: un bundle de ejecución propio (Windows/Linux, versiones 1.1.2 con soporte para arquitecturas Turing, Ampere, Ada, Hopper y Blackwell), un kit para Apple Silicon, un build experimental para ROCm en RDNA4 y complementos opcionales como un proyector de visión y un drafter de decodificación especulativa (DFlash2). La propuesta de valor es clara: habilitar un modelo de 27B con contexto largo real en hardware de consumo, algo que normalmente requiere GPUs de 80 GB o más.

La relevancia actual del modelo radica en su enfoque de ingeniería de sistemas por encima de la cuantización: el autor no solo comprime los pesos, sino que acompaña el GGUF con un motor de inferencia optimizado (MTP + lookup), herramientas de restauración de conversaciones y validación cruzada entre arquitecturas. No obstante, conviene señalar una discrepancia importante: el nombre del modelo indica 27B, pero el dato real de parámetros en safetensors es de 6.758.409.216 (aproximadamente 6,76B), lo que sugiere que el "27B" podría referirse al modelo base nominal o a una convención de nombres del autor.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de Qwen3.8-27B), con decodificación especulativa opcional (MTP + lookup, drafter DFlash2) |
| Parámetros totales | 6.758.409.216 (según safetensors); el nombre comercial indica 27B |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 262.144 tokens (245k validados en pruebas) |
| Tipos de cuantización | 2,47 bits por peso (GGUF principal: `Kintsugi-27B-12G.gguf`); proyector de visión Q8_0; drafter DFlash2 Q4_0 |
| Idiomas soportados | no disponibles |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (con safetensors como dato de referencia del modelo base) |

## Arquitectura y entrenamiento

Kintsugi-27B no es un modelo entrenado desde cero, sino una cuantización agresiva del modelo base Qwen/Qwen3.8-27B. La arquitectura subyacente es un transformer estándar (no se especifica MoE ni arquitecturas híbridas SSM), y el trabajo del autor se centra en la compresión a 2,47 bits por peso manteniendo la fidelidad funcional respecto a BF16. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si hubo fases de RLHF o DPO, ya que el modelo hereda las capacidades del base y el autor no documenta el proceso de entrenamiento original.

La innovación técnica destacable no está en el entrenamiento sino en el sistema de inferencia: el bundle incluye un motor propio con decodificación especulativa basada en MTP (multi-token prediction) y lookup, más un drafter opcional DFlash2 que acelera la decodificación. El autor reporta métricas de fidelidad frente a BF16 (top-1 del 90,8 %, KL media de 0,058, ratio de perplejidad de 1,035) sobre el golden set público del quant-challenge, así como validación cruzada entre arquitecturas (RTX 5070, H100, Mac M5 Max) con diferencias de KL dentro del 0,02-0,03 %. También se documenta la restauración de conversaciones de 245k tokens en 2,8 segundos, lo que sugiere un manejo eficiente del estado de contexto.

## Capacidades

- Generación de texto y razonamiento conversacional multi-turno, heredado de Qwen3.8-27B.
- Razonamiento de agente multi-paso: el autor reporta 294/336 en AppWorld con semillas frescas (102 y 103), a la par de BF16 (293).
- Generación de código: 161/164 en HumanEval con "medium thinking".
- Tool calling y function calling: validado en harnesses de codificación (Claude Code, OpenAI Codex, Pi, OpenCode) con 5/6 tareas en cada uno y sin llamadas malformadas.
- Recuperación de información en contexto largo: 24/24 needles y 20/20 copias exactas de código a 245k tokens.
- Persistencia de instrucciones de sistema: las 5 reglas de system prompt se mantienen tras hasta 237k tokens de traza de agente propia, sin decaimiento.
- Capacidades de visión opcionales mediante proyector (`mmproj-Qwen3.8-27B-Q8_0.gguf`), con 19/20 en el set de imágenes del autor.
- Soporte de formatos de chat OpenAI y Anthropic, incluidos resultados de herramientas como capturas de pantalla.
- Capacidades multilingües: no disponibles en la información proporcionada.

## Casos de uso

- Agentes autónomos de larga duración: el modelo mantiene reglas de sistema y contexto de hasta 237k tokens sin degradación, lo que lo hace adecuado para sesiones de agente que acumulan trazas extensas, como automatización de tareas de oficina o navegación web multi-paso (validado con AppWorld).
- Asistentes de código en local: con 161/164 en HumanEval y soporte de tool calling en harnesses como Claude Code o Codex, puede integrarse en un flujo de desarrollo en una estación de trabajo con GPU de 12 GB, sin depender de APIs externas.
- Análisis de repositorios y documentos extensos: los 262.144 tokens de contexto permiten procesar bases de código completas o contratos largos en una sola pasada, con recuperación fiable de needles a 245k tokens.
- Atención al cliente con memoria de sesión: la restauración de conversaciones de 245k tokens en 2,8 s facilita retomar hilos largos sin reprocesar todo el historial, útil en sistemas de soporte con historial persistente.
- Procesamiento de capturas de pantalla y documentos escaneados: con el proyector de visión opcional (19/20 en el set del autor, 1-3 s por imagen en modo GPU), puede extraer información de interfaces o formularios dentro de un pipeline de automatización.
- Despliegue en hardware de consumo para prototipado: al caber en 12 GB de VRAM con contexto completo, permite a desarrolladores individuales experimentar con un modelo de 27B nominal sin acceso a clústeres, usando el bundle con servidor compatible con OpenAI en `http://127.0.0.1:8080/v1`.
- Investigación en cuantización extrema: el modelo y sus métricas de fidelidad (KL, PPL ratio, top-1) sirven como referencia para estudiar los límites de la compresión a ~2,5 bits por peso en tareas de agente y contexto largo.

## Benchmarks y rendimiento

| Prueba | Resultado |
|---|---|
| AppWorld, tareas de agente (semillas 102 + 103) | 294/336 (BF16: 293) |
| HumanEval (medium thinking) | 161/164 |
| Needles + copias exactas de código a 245k tokens | 24/24 y 20/20 |
| Persistencia de reglas de system prompt tras 237k tokens | 5/5 mantenidas, sin decaimiento |
| Fidelidad a BF16 (golden set quant-challenge) | top-1 90,8 %, KL media 0,058, ratio PPL 1,035 |
| Decodificación en RTX 4070 a 64k / 117k / 200k / 245k (MTP + lookup) | 67 / 59 / 49 / 31 tokens por segundo |
| Restauración de conversación guardada de 245k tokens | 2,8 s |
| Harnesses de codificación (Claude Code, Codex, Pi, OpenCode) | 5/6 tareas en cada uno, sin tool calls malformadas |
| Imágenes (proyector opcional) | 19/20 en el set del autor (igual que llama.cpp estándar) |
| Validación cruzada RTX 5070 / H100 vs RTX 4070 | KL dentro de 0,03 % / 0,02 %; 24/24 needles y 20/20 copias a 245k |

No se han publicado resultados de benchmarks estándar adicionales (MMLU, GSM8K, etc.) en la información disponible.

## Requisitos de hardware

- VRAM estimada: 12 GB para el GGUF principal con contexto completo de 262.144 tokens; el proyector de visión en modo GPU añade ~1,3 GB (deja ~61.000 de 144.000 celdas K/V en VRAM en una tarjeta de 12 GB); en modo CPU no consume VRAM.
- GPU recomendadas: NVIDIA RTX 20/30/40/50 series con 12 GB o más; H100/H200 (Hopper, bundle v1.1.2); B200 y DGX Spark (GB10) ejecutan el código portable del motor (compilación inicial de ~1,5 min, no probado); AMD Radeon RDNA4 (R9700, RX 9070, 9070 XT) con build experimental en Linux; Apple Silicon (probado en M5 Max de 48 GB; Macs de 16 GB y M1-M4 no probados).
- Cabe en GPU de consumo: sí, en RTX 4070 (12 GB) y RTX 5070; el autor reporta 67/59/49/31 tokens/s a 64k/117k/200k/245k en una RTX 4070.
- Opciones de despliegue: bundle propio del autor (Windows zip de 679 MB, Linux tarball de 786 MB) con servidor compatible con OpenAI en el puerto 8080; kit para Mac (`./run.sh install`, `./run.sh chat`, `./run.sh serve`); requiere driver NVIDIA 580+ en Windows y 570+ en Linux (glibc 2.34+, Ubuntu 22.04/24.04).
- Latencia y throughput: decodificación de 31-67 tokens/s según profundidad de contexto en RTX 4070; restauración de conversación de 245k tokens en 2,8 s; procesamiento de imágenes de 1-3 s (GPU) o 5-25 s (CPU).
- Intel GPUs: no soportadas actualmente.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Kintsugi-27B | 6,76B (nominal 27B) | 262.144 | Apache-2.0 | GGUF + bundle propio | Cuantización 2,47 bits; validado en 12 GB |
| Qwen3.8-27B (base) | no disponible | no disponible | Apache-2.0 | Hugging Face | Modelo de referencia en BF16; Kintsugi reporta paridad en tareas de agente |
| Inkling 2 Mini | no disponible | no disponible | no disponible | no disponible | Comparado cara a cara en la misma tarjeta de 12 GB según el autor; resultados en benchmarks/README.md |

No se dispone de datos suficientes para comparar con otras alternativas de la misma categoría (modelos de ~27B con contexto largo en hardware de consumo) en la información proporcionada.

## Limitaciones y advertencias

- Discrepancia de parámetros: el nombre indica 27B pero el dato real de safetensors es de 6.758.409.216 (~6,76B); conviene verificar qué se está midiendo antes de asumir capacidades de un modelo de 27B.
- Idiomas soportados no documentados: no hay información sobre cobertura multilingüe, lo que limita su uso en producción para idiomas distintos del inglés sin validación previa.
- Riesgo de alucinación: no se han publicado evaluaciones de factualidad ni de tasas de alucinación; al ser una cuantización extrema, la fidelidad a BF16 es del 90,8 % en top-1, lo que implica divergencias en aproximadamente 1 de cada 10 tokens.
- Licencia Apache-2.0 permite uso comercial, pero el modelo base Qwen3.8-27B y los componentes de terceros (proyector de visión de ggml-org, drafter DFlash2) deben verificarse por separado.
- Soporte de hardware limitado: Intel GPUs no soportadas; ROCm en RDNA4 es experimental; Macs de 16 GB y M1-M4 no probados; B200 y DGX Spark no probados.
- El proyector de visión en modo GPU reduce las celdas K/V disponibles en VRAM (de 144.000 a ~61.000 en una tarjeta de 12 GB), lo que puede afectar al contexto efectivo con imágenes activadas.
- El drafter DFlash2 no funciona con imágenes; con visión activada se usa MTP + lookup, lo que puede reducir la velocidad de decodificación.
- La página web integrada no está probada con imágenes.
- Requiere drivers NVIDIA específicos (580+ en Windows, 570+ en Linux) y glibc 2.34+, lo que puede excluir sistemas más antiguos.
- No hay información sobre sesgos conocidos ni sobre el proceso de alineación del modelo base.

## Enlaces

- Hugging Face: https://huggingface.co/CaryPalmer/Kintsugi-27B
- Repositorio GitHub: https://github.com/professorpalmer/Kintsugi-27B
- Releases (bundles Windows/Linux, build AMD): https://github.com/professorpalmer/Kintsugi-27B/releases/latest
- Build AMD experimental: https://github.com/professorpalmer/Kintsugi-27B/releases/tag/amd-test-1
- Kit para Mac: https://github.com/professorpalmer/Kintsugi-27B/tree/main/mac
- Guía Mac: https://github.com/professorpalmer/Kintsugi-27B/blob/main/mac/README.md
- Benchmarks: https://github.com/professorpalmer/Kintsugi-27B/blob/main/benchmarks/README.md
- Estudio de persistencia en profundidad: https://github.com/professorpalmer/Kintsugi-27B/blob/main/research/persistence-at-depth/README.md
- Validación cruzada entre arquitecturas: https://github.com/professorpalmer/Kintsugi-27B/blob/main/research/cross-architecture/README.md
- Configuración de harnesses: https://github.com/professorpalmer/Kintsugi-27B/blob/main/harnesses/README.md
- Proyector de visión (GGUF): https://huggingface.co/ggml-org/Qwen3.8-27B-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
