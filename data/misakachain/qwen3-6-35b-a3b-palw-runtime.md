# Misakachain/Qwen3.6-35B-A3B-PALW-runtime

## Resumen

Misakachain/Qwen3.6-35B-A3B-PALW-runtime es un artefacto de ejecución para la red de prueba MISAKA testnet-11, diseñado como sistema de prueba de cómputo (proof-of-compute). No es un modelo de lenguaje independiente, sino una transformación determinista del modelo base `huihui-ai/Huihui-Qwen3.6-35B-A3B-Claude-4.7-Opus-abliterated`, que a su vez deriva de Qwen3.6-35B-A3B de Alibaba. El autor es Misakachain, y el artefacto convierte el GGUF Q4_K_M en un runtime de inferencia de enteros W8A16 que garantiza que una misma entrada produzca la misma salida bit a bit en cualquier máquina.

  El propósito principal es registrar la inferencia de este modelo como trabajo de generación de bloques en la blockchain MISAKA, donde los nodos compiten ejecutando el modelo de forma verificable. La transformación es reproducible por cualquiera: a partir del GGUF original, el comando `qwen36-convert` genera el mismo archivo `.palwq36` en cualquier hardware. El modelo tiene 35.951.822.704 parámetros totales, es una mezcla de expertos (MoE) con 3 mil millones de parámetros activos, y su ventana de contexto en el runtime está limitada a 8 tokens por restricciones de la cadena, aunque el motor subyacente soporta hasta 512.

  La licencia es Apache 2.0, los idiomas declarados son inglés y japonés, y el repositorio incluye tanto el artefacto de runtime (33,27 GiB) como el código fuente en Rust para convertir y ejecutar el modelo. La relevancia actual radica en que representa un enfoque novedoso para vincular la ejecución de modelos de IA con mecanismos de consenso distribuido, aunque su utilidad práctica como modelo de lenguaje convencional es limitada.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE híbrida (GDN + gated attention + MoE), 40 capas, vocab 248.320 |
| Parametros totales | 35.951.822.704 |
| Parametros activos | 3B (A3B) |
| Longitud de contexto | 8 tokens en la cadena (el motor soporta hasta 512) |
| Tipos de cuantizacion | W8A16 (entero) para el runtime PALW; el GGUF base es Q4_K_M |
| Idiomas soportados | en, ja |
| Licencia | Apache 2.0 |
| Formato de pesos | .palwq36 (artefacto de runtime), GGUF Q4_K_M |

## Arquitectura y entrenamiento

El modelo base es una variante de Qwen3.6-35B-A3B, un modelo de mezcla de expertos (MoE) con 35,9 mil millones de parámetros totales y 3 mil millones activos por token. La arquitectura incorpora GDN (gated dense network), atención con puertas y capas MoE, en total 40 capas. El vocabulario es de 248.320 tokens. La versión original fue entrenada por Alibaba, y la variante de huihui-ai se sometió a un proceso de "abliteration" para eliminar los rechazos de seguridad, además de ser afinada con datos de Claude 4.7 Opus. El runtime de Misakachain no añade entrenamiento nuevo; es una conversión determinista del GGUF Q4_K_M a un formato de enteros W8A16 que elimina cualquier operación en punto flotante del camino de ejecución. La conversión se realiza capa a capa, y se ha verificado que dos conversiones del mismo GGUF producen archivos idénticos byte a byte. No se han publicado detalles sobre el dataset de entrenamiento del modelo base ni sobre el proceso de alineación (RLHF/DPO) en la información disponible.

## Capacidades

- Generación de texto y razonamiento: hereda las capacidades del modelo base Qwen3.6-35B-A3B, incluyendo comprensión de instrucciones, generación de código, matemáticas y razonamiento multi-paso.
- Inferencia determinista: el runtime garantiza que el mismo prompt produce exactamente la misma salida en cualquier hardware, gracias a la cuantización entera y a la ausencia de operaciones en coma flotante.
- Verificación de cómputo: cada paso de inferencia puede ser recalculado por cualquier tercero, lo que permite detectar ejecuciones maliciosas.
- Soporte de agentes y tool calling: el modelo base soporta llamadas a funciones y razonamiento multi-paso, aunque el runtime limita el contexto a 8 tokens, lo que restringe su uso práctico para estas tareas.
- Multilingüe: declarado soporte para inglés y japonés, aunque el modelo base de Qwen tiene capacidades multilingües más amplias.
- Formato de artefacto único: el archivo `.palwq36` contiene todos los pesos cuantizados y es autocontenido, sin necesidad de archivos adicionales para ejecutar.

## Casos de uso

- **Verificación de integridad en redes blockchain**: el modelo se ejecuta como parte del consenso de MISAKA testnet-11; los nodos generan bloques al ejecutar la inferencia y los validadores pueden recalcular los resultados para detectar trampas.
- **Prueba de computación (proof-of-compute)**: cualquier organización puede usar este runtime para demostrar que ha ejecutado un modelo de 35B parámetros, ya que el resultado es reproducible y verificable por terceros.
- **Auditoría de inferencia**: al ser determinista, permite auditar qué pesos y qué operaciones se ejecutaron, útil para sistemas de auditoría de IA en entornos regulados.
- **Investigación sobre inferencia de enteros**: sirve como referencia para estudiar el impacto de la cuantización W8A16 en la fidelidad de la salida (cosine 0,9967 respecto a f32) y en el rendimiento.
- **Desarrollo de runtimes de IA para hardware heterogéneo**: el diseño de conversión determinista y ejecución por capas puede aplicarse a otros modelos MoE para garantizar resultados idénticos entre GPUs y CPUs.
- **Generación de texto en entornos con restricciones de memoria**: aunque el contexto es limitado, el modelo puede generar respuestas cortas con alta calidad en equipos con 24 GiB de memoria unificada, como un Mac M4 Pro.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de rendimiento (como MMLU, HumanEval, GSM8K) en la información disponible. El autor proporciona únicamente métricas de fidelidad del artefacto PALW respecto a la referencia f32:

| Metrica | Valor |
|---|---|
| Cosine similarity | 0.9967 |
| Rank correlation | 0.9598 |
| Top-1 acierto | 151/155 |
| Tiempo de arranque (cálculo de root) | 110 s |
| Tiempo de job canónico (7 prefill + 2 decode) | 7.7 s |
| Material commitado | 8.9 MB |

Estas métricas indican que la conversión a int8 preserva casi por completo la salida del modelo en coma flotante, aunque no son comparables con los benchmarks estándar de modelos de lenguaje.

## Requisitos de hardware

- **Memoria**: el artefacto `.palwq36` ocupa 33,27 GiB en disco; se recomienda al menos 24 GiB de memoria unificada para cargarlo en memoria.
- **GPU**: soporte nativo para Apple Silicon (Metal) en el runtime PALW. También se puede ejecutar en otras plataformas con el código Rust, pero solo se ha probado en M4 Pro.
- **Alternativas**: el GGUF Q4_K_M original (24 GB) puede ejecutarse en GPUs de consumo con al menos 16 GB de VRAM (por ejemplo, RTX 4090) mediante llama.cpp, aunque el runtime de Misakachain requiere el formato `.palwq36`.
- **Despliegue**: el runtime se integra con `kaspad` para la red MISAKA; también se puede usar `qwen36-run` para verificar el artefacto. No se soporta vLLM, Ollama ni TGI para este artefacto específico.
- **Latencia**: el cálculo del root del artefacto tarda 110 segundos al inicio; la inferencia canónica (7 prefill + 2 decode) tarda 7,7 segundos en el host de referencia (M4 Pro).

## Comparativa con modelos similares

| Modelo | Parametros totales | Activos | Contexto | Cuantizacion | Licencia |
|---|---|---|---|---|---|
| Qwen3.6-35B-A3B (original) | 35.9B | 3B | 128K | BF16/FP8 | Apache 2.0 |
| Qwen3.6-35B-A3B (abliterated, huihui-ai) | 35.9B | 3B | 128K | BF16/FP8 | Apache 2.0 |
| Qwen3.6-35B-A3B-PALW-runtime | 35.9B | 3B | 8 (runtime) | W8A16 int8 | Apache 2.0 |

La comparación directa con otros modelos MoE de la misma categoría (como DeepSeek-V3 o Mixtral 8x7B) no está disponible en la información proporcionada. El modelo PALW no es una alternativa a esos modelos para uso general, sino un artefacto de verificación sobre la base de Qwen3.6.

## Limitaciones y advertencias

- **No es un modelo entrenado**: es una transformación determinista del GGUF original; no añade capacidades nuevas ni mejora el rendimiento respecto al modelo base.
- **Contexto extremadamente limitado**: en la cadena MISAKA el contexto está fijado a 8 tokens, lo que hace imposible su uso para tareas de lenguaje natural que requieran contexto largo.
- **Riesgo de alucinación**: el modelo base, al ser una variante "abliterated", puede generar contenido sin filtros de seguridad, lo que aumenta el riesgo de salidas ofensivas o incorrectas.
- **Sesgos**: no se han publicado análisis de sesgos específicos; al ser una variante de Qwen, puede heredar los sesgos del modelo base.
- **Restricciones de uso**: la licencia Apache 2.0 permite uso comercial, pero el artefacto está pensado para el protocolo MISAKA y su integración en otros sistemas puede requerir adaptación.
- **Verificación necesaria**: el autor recomienda encarecidamente verificar el artefacto descargado contra el root hash publicado antes de usarlo, para evitar pesos manipulados.
- **Dependencia del ecosistema**: requiere la cadena MISAKA testnet-11 para funcionar como nodo; sin ella, solo se puede ejecutar como runtime local para pruebas.

## Enlaces

- Hugging Face: https://huggingface.co/Misakachain/Qwen3.6-35B-A3B-PALW-runtime
- Repositorio GitHub (LLM-Validation): https://github.com/MISAKA-BTC/LLM-Validation
- Runtime PALW (código y docs): https://github.com/MISAKA-BTC/LLM-Validation/tree/main/runtime-palw
- Modelo base en Hugging Face: https://huggingface.co/huihui-ai/Huihui-Qwen3.6-35B-A3B-Claude-4.7-Opus-abliterated
