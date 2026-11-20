# motchii709/Ornith-1.5-35B-A3B-abliterated-GSQ-RCO-IQ3_M-GGUF

## Resumen

Ornith-1.5-35B-A3B-abliterated-GSQ-RCO-IQ3_M es una cuantización GGUF de tipo IQ3_M del modelo Ornith-1.5-35B-A3B en su variante abliterated (sin alineamiento de seguridad), publicada por el usuario motchii709. El modelo original lo desarrolla DeepReinforce AI (Ornith AI) bajo licencia MIT, y la versión sin censura la produce huihui-ai mediante técnicas de abliteration. Esta build concreta combina los pesos abliterated convertidos localmente a GGUF Q8_0 con la asignación de tipos de cuantización por tensor de dos builds comunitarias GSQ-RCO, dando como resultado un archivo de 12,94 GiB que retiene el bloque MTP para decodificación especulativa.

Se trata de un modelo de arquitectura MoE (Mixture of Experts) con 35.505.251.456 parámetros totales y aproximadamente 3.000 millones de parámetros activos por token (de ahí el sufijo A3B), etiquetado internamente como `qwen35moe`. Incorpora un bloque MTP (Multi-Token Prediction) que permite usar decodificación especulativa en llama.cpp mediante `--spec-type draft-mtp`. El contexto nativo no está especificado en la información disponible, aunque la model card muestra ejemplos con `-c 8192`.

La relevancia de esta ficha radica en que documenta un caso típico de la cadena de derivados comunitarios: modelo base → abliteration → cuantización con asignación transferida de otras builds. Es importante señalar que el modelo ha sido deliberadamente privado de sus salvaguardas de seguridad, por lo que su uso en producción requiere controles externos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE (`qwen35moe`), con bloque MTP (`nextn_predict_layers = 1`) |
| Parametros totales | 35.505.251.456 |
| Parametros activos | ~3.000 millones (sufijo A3B; valor exacto no disponible) |
| Longitud de contexto | No disponible en la informacion (ejemplos con `-c 8192`) |
| Tipos de cuantizacion | IQ3_M (esta build); el repositorio incluye `imatrix.gguf` para reproducibilidad |
| Idiomas soportados | Ingles (en), japones (ja) |
| Licencia | MIT |
| Formato de pesos | GGUF (753 tensores; 12.941.471.456 bytes / 12,94 GiB) |
| Numero de bloques | 41 (`block_count = 41`, incluye bloque MTP 40) |
| Vision | Requiere `mmproj` externo, no incluido |

## Arquitectura y entrenamiento

La arquitectura es un transformer de tipo Mixture of Experts identificado como `qwen35moe`, con 41 bloques y un bloque MTP adicional (bloque 40, 20 tensores) que habilita predicción multi-token y decodificación especulativa. El modelo base Ornith-1.5-35B-A3B procede de DeepReinforce AI (Ornith AI) y fue posteriormente sometido a abliteration por huihui-ai para eliminar el alineamiento de seguridad. Los detalles sobre el dataset de entrenamiento original, número de tokens, composición y si hubo RLHF/DPO no están disponibles en la información proporcionada.

Esta build concreta no es una cuantización desde cero, sino una transferencia de asignación: se extrajeron los tipos de cuantización por tensor de los headers GGUF de dos builds donantes (733 tensores del cuerpo desde la build de 3 bits de pfeifferj y 20 tensores MTP desde la build APEX de lavendercomputing), se generó una importance matrix local con `llama-imatrix` usando wikitext-2 en inglés y Wikipedia en japonés (200 chunks × 512 de contexto) y se ejecutó `llama-quantize` con `--allow-requantize --imatrix --tensor-type-file` sobre la conversión Q8_0 de los pesos abliterated. La verificación reporta 554/554 tensores controlados (≥2D) con el tipo exacto del donante, sin degradaciones. La perplejidad en held-out medida es 12,3454 ± 0,5644 frente a 12,7927 ± 0,5911 del donante de 3 bits (bases distintas: abliterated vs. original).

## Capacidades

- Generación de texto conversacional en inglés y japonés.
- Razonamiento explícito dentro de bloques `<think>` por defecto (modo thinking).
- Arquitectura MoE con ~3B parámetros activos, lo que reduce el coste de inferencia frente a un denso de 35B.
- Decodificación especulativa mediante el bloque MTP retenido (`--spec-type draft-mtp` en llama.cpp).
- Capacidad de visión únicamente si se añade el proyector `mmproj` correspondiente (no incluido en este repositorio).
- Compatibilidad con endpoints (tag `endpoints_compatible`) y con el ecosistema llama.cpp.
- Soporte de tool calling y function calling: no confirmado en la información disponible.
- Capacidades de agente multi-paso: no confirmadas en la información disponible.

## Casos de uso

- Asistente conversacional multi-turno en inglés o japonés: el modelo mantiene diálogos con modo de razonamiento interno y puede desplegarse con `llama-server -c 8192` para sesiones de contexto medio en hardware de consumo.
- Inferencia en hardware limitado: con 12,94 GiB en IQ3_M y solo ~3B parámetros activos, es viable en GPUs de consumo con 16 GB de VRAM o en CPU con suficiente RAM, algo imposible con un denso de 35B.
- Generación de texto creativo sin restricciones de contenido: al estar abliterated, se emplea en escenarios donde las negativas de modelos alineados resultan un obstáculo (ficción, role-play), siempre con revisión humana.
- Procesamiento de documentación técnica en japonés: el calibrado de la imatrix incluyó Wikipedia japonesa, lo que favorece la calidad en ese idioma frente a cuantizaciones genéricas.
- Servicio de inferencia de bajo coste con decodificación especulativa: el bloque MTP permite acelerar la generación en llama.cpp, útil para prototipos y demos interactivas.
- Investigación sobre cuantización: el repositorio incluye la imatrix y documenta la metodología de transferencia de asignación, lo que lo convierte en material de referencia para estudiar el impacto de GSQ-RCO en perplejidad.
- Base para fine-tuning o destilación: al ser MIT y GGUF, puede servir como punto de partida para experimentos locales, aunque el fine-tuning directo sobre GGUF es limitado.

## Benchmarks y rendimiento

| Metrica | Esta build | Donante pfeifferj 3-bit |
|---|---|---|
| Perplejidad held-out (16 chunks × 512 ctx) | 12,3454 ± 0,5644 | 12,7927 ± 0,5911 |
| Tensores con tipo del donante | 554/554 (100,00%) | — |
| Tamano del archivo | 12,94 GiB | No disponible |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible. La comparación de perplejidad no es estrictamente equivalente porque las bases difieren (pesos abliterated frente a originales).

## Requisitos de hardware

- VRAM estimada: ~13 GB para el archivo IQ3_M completo; con overhead de contexto, se recomienda 16 GB o más para `-c 8192`.
- GPU recomendadas: RTX 4090 (24 GB), RTX 4080 (16 GB), RTX 3090 (24 GB); en el límite, RTX 4070 Ti Super (16 GB).
- Cabe en GPU de consumo: sí, en modelos con 16 GB o más de VRAM; en 12 GB requeriría offloading parcial a RAM.
- Despliegue: llama.cpp (`llama-cli`, `llama-server`), y por extensión frontends compatibles como Ollama o LM Studio si aceptan GGUF con arquitectura `qwen35moe`. vLLM y TGI no soportan GGUF de forma nativa para esta arquitectura según la información disponible.
- CPU: la build se generó y verificó en un Ryzen 5 5500, lo que indica viabilidad en CPU, aunque con throughput bajo.
- Latencia y throughput: no disponibles. La decodificación especulativa vía MTP puede mejorar el throughput, pero no se aportan cifras.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Esta build (Ornith-1.5-35B-A3B abliterated IQ3_M) | 35,5B totales / ~3B activos | No disponible | MIT | GGUF | Abliterated, MTP retenido |
| huihui-ai/Huihui-Ornith-1.5-35B-A3B-abliterated | 35,5B totales / ~3B activos | No disponible | MIT | Safetensors | Pesos completos sin cuantizar, base de esta build |
| pfeifferj/Ornith-1.5-35B-A3B-GSQ-RCO-GGUF | 35,5B totales / ~3B activos | No disponible | MIT | GGUF | Build 3 bits con pesos originales (no abliterated), sin bloque MTP |
| ornith-ai/Ornith-1.5-35B-A3B | 35,5B totales / ~3B activos | No disponible | MIT | Safetensors | Modelo base alineado |

## Limitaciones y advertencias

- Modelo abliterated: el alineamiento de seguridad fue eliminado deliberadamente; no tiene guardrails y puede generar contenido dañino, ilegal o sesgado. La responsabilidad de uso recae íntegramente en el operador.
- Riesgo de alucinación: inherente a los modelos de lenguaje; sin alineamiento, la tendencia a afirmar información falsa con seguridad puede ser mayor.
- Idiomas limitados: solo inglés y japonés declarados; el rendimiento en castellano no está garantizado.
- Contexto: la longitud nativa no se documenta; los ejemplos usan 8192 tokens, por lo que contextos mayores no están verificados.
- Visión incompleta: sin `mmproj` no hay entrada de imágenes.
- Muestreo delicado: la model card advierte que `repeat-penalty 1.05` es el punto óptimo (1.0 puede provocar bucles, 1.1 truncar) y que no se recomienda decodificación greedy.
- Licencia: MIT para los pesos, pero la build APEX donante del bloque MTP muestra Apache-2.0 en su repositorio, lo que introduce una nota de transparencia sobre la procedencia de esos tipos de cuantización.
- Cuantización IQ3_M: pérdida de calidad respecto a Q8_0 o BF16, especialmente en tareas de razonamiento complejo y matemáticas.
- Trazabilidad: es una build de transferencia de asignación, no una cuantización GSQ/RCO recalculada desde cero; los resultados dependen de los donantes.
- Sin benchmarks estándar publicados: no hay evidencia de rendimiento en MMLU, HumanEval o GSM8K para esta build concreta.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/motchii709/Ornith-1.5-35B-A3B-abliterated-GSQ-RCO-IQ3_M-GGUF
- Pesos abliterated (base directa): https://huggingface.co/huihui-ai/Huihui-Ornith-1.5-35B-A3B-abliterated
- Modelo base original: https://huggingface.co/ornith-ai/Ornith-1.5-35B-A3B
- Donante de asignación del cuerpo: https://huggingface.co/pfeifferj/Ornith-1.5-35B-A3B-GSQ-RCO-GGUF
- llama.cpp (toolchain): https://github.com/ggml-org/llama.cpp
- Investigación GSQ/RCO (ISTA-DASLab): no disponible enlace directo en la información proporcionada
