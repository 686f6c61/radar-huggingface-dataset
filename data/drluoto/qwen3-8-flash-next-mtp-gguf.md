# drluoto/Qwen3.8-Flash-Next-MTP-GGUF

## Resumen

`drluoto/Qwen3.8-Flash-Next-MTP-GGUF` es un sidecar de decodificación especulativa (draft head MTP, Multi-Token Prediction) para el modelo base `Qwen/Qwen3.8-Flash-Next`, un MoE multimodal de 125B parámetros con arquitectura híbrida GDN + QSA y ventana de contexto de 262K tokens. Este repositorio no contiene un modelo autónomo, sino un componente auxiliar que, cargado junto al modelo principal en llama.cpp, permite acelerar la generación de texto mediante predicción especulativa de múltiples tokens.

El head MTP, de aproximadamente 3.9B parámetros, se extrajo directamente del checkpoint oficial de Qwen3.8-Flash-Next (que ocupa 360 GB) mediante la exportación `--mtp` del PR #27836 de llama.cpp, y se cuantizó en Q8_0. El resultado son 37 tensores que incluyen el head MTP, embeddings compartidos, lm_head/norm y el mixer de cabecera. El autor verificó el funcionamiento en hardware AMD Strix Halo (Ryzen AI Max+ 395 / Radeon 8060S) con ROCm 7.1, logrando aceleraciones de hasta 2.8x en tareas de reescritura de archivos con contexto de 8K tokens.

La relevancia de este sidecar radica en que permite ejecutar un modelo de 125B parámetros de forma local y eficiente en dispositivos con memoria unificada, sin necesidad de GPUs dedicadas de gran VRAM, manteniendo la calidad del modelo original gracias a la decodificación especulativa con verificación greedy.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Head MTP (Multi-Token Prediction) para decodificación especulativa |
| Parametros totales | 3.885.113.088 (~3.9B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | Heredada del modelo base (262K tokens) |
| Tipos de cuantizacion | Q8_0 (única disponible en este repo) |
| Idiomas soportados | No disponible (depende del modelo base) |
| Licencia | qwen-community-1.0 |
| Formato de pesos | GGUF (safetensors en el checkpoint original) |

## Arquitectura y entrenamiento

Este sidecar no es un modelo entrenado de forma independiente, sino una extracción del checkpoint oficial de Qwen3.8-Flash-Next. El head MTP se exportó con la herramienta `--mtp` del PR #27836 de llama.cpp, aplicando además un fix de whitelist (rmonsurate/llama.cpp#1) que preserva el mixer `output_hc_norm/_down/_up` a nivel de modelo, requerido por el loader. El proceso de conversión descargó únicamente los tensores relevantes (5.2 GB de los 360 GB del checkpoint) mediante lecturas HTTP por rangos sobre los shards safetensors.

El modelo base Qwen3.8-Flash-Next, sobre el que opera este sidecar, emplea una arquitectura híbrida GDN (Gated Delta Network) + QSA (Quadratic Self-Attention), con 125B parámetros en configuración MoE. El head MTP añade una cabeza de predicción de múltiples tokens que, durante la decodificación especulativa, genera varios tokens candidatos en paralelo que luego son verificados por el modelo principal. La cuantización Q8_0 del head mantiene un equilibrio entre precisión y velocidad, y el autor confirma que la salida greedy es correcta incluso con prompts largos (el fallo típico de ports MTP comunitarios anteriores era la corrupción dependiente de la longitud del prompt por encima de ~1K tokens).

## Capacidades

- Aceleración de inferencia del modelo Qwen3.8-Flash-Next mediante decodificación especulativa con draft head MTP.
- Compatible con llama.cpp mediante la bandera `--spec-type draft-mtp` (`-md`).
- Soporta combinación con ngram-mod como respaldo (`draft-mtp,ngram-mod`).
- Verificado en hardware AMD con ROCm 7.1 (Strix Halo), incluyendo GPU TOP_K para aceleración adicional.
- Salida greedy verificada limpia en prompts largos (hasta 24K tokens de contexto en las pruebas).
- Integrable con servidores llama.cpp (`llama-server`) para despliegue local o remoto.

## Casos de uso

- **Asistente de código local en hardware de memoria unificada**: con un Ryzen AI Max+ 395 (75 GB de RAM unificada), se puede ejecutar Qwen3.8-Flash-Next con este sidecar para tareas de generación y reescritura de código, alcanzando 47.1 t/s en reescritura de archivos con contexto de 8K tokens, frente a 16.8 t/s sin decodificación especulativa.
- **Agente de codificación autónomo con OpenCode**: el modelo base, acelerado por este sidecar, puede conectarse a OpenCode para ejecutar agentes de codificación completamente locales, sin depender de APIs externas, gracias a la ventana de 262K tokens que permite mantener el historial completo de la sesión.
- **Reducción de latencia en entornos de producción con ROCm**: en servidores AMD con ROCm 7.1 o superior, el sidecar permite reducir la latencia de generación en servicios de chat o completado de código, mejorando la experiencia de usuario sin cambiar el modelo subyacente.
- **Despliegue en dispositivos con VRAM limitada**: al ser un sidecar de solo 4.1 GB en Q8_0, puede cargarse junto al modelo base cuantizado (por ejemplo, UD-IQ4_XS) en sistemas con memoria unificada, habilitando inferencia local de un modelo de 125B en portátiles o mini-PCs con APU AMD.
- **Investigación en decodificación especulativa**: sirve como referencia de implementación para extraer y cuantizar heads MTP de otros modelos Qwen, ya que documenta el proceso completo de conversión y los parches necesarios.
- **Optimización de costes en inferencia**: al acelerar la generación sin degradar la calidad (verificación greedy), reduce el tiempo de cómputo por token, lo que se traduce en menor consumo energético y menor coste por petición en despliegues propios.

## Benchmarks y rendimiento

El autor publicó mediciones en Ryzen AI Max+ 395 / Radeon 8060S con ROCm 7.1, usando el modelo base cuantizado UD-IQ4_XS y decodificación greedy:

| Carga de trabajo | Sin especulación | Con `draft-mtp,ngram-mod` + GPU TOP_K |
|---|---|---|
| Reescritura de archivo @8k contexto | 16.8 t/s | 47.1 t/s |
| Código nuevo @8k | 16.8 t/s | 31.7 t/s |
| Reescritura de archivo @24k | ~15 t/s | 28.6 t/s |
| Código nuevo @24k | ~15 t/s | 25.4 t/s |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) para este sidecar, ya que no es un modelo independiente sino un acelerador del modelo base.

## Requisitos de hardware

- **VRAM estimada**: el sidecar ocupa 4.1 GB en Q8_0. El modelo base Qwen3.8-Flash-Next requiere aproximadamente 75 GB de memoria unificada en cuantización UD-IQ4_XS (según unsloth.ai), o más si se usa una cuantización menos agresiva.
- **GPU recomendadas**: verificado en AMD Radeon 8060S (integrada en Ryzen AI Max+ 395) con ROCm 7.1. También debería funcionar en GPUs NVIDIA con CUDA, aunque no está verificado por el autor.
- **Hardware consumer**: sí, en sistemas con memoria unificada como los Strix Halo (Ryzen AI Max+ 395 con 75-128 GB). No cabe en GPUs consumer típicas (RTX 4090 con 24 GB) para el modelo base completo, pero el sidecar sí es ligero.
- **Opciones de despliegue**: llama.cpp (llama-server, llama-cli) con el branch `strix-halo-flash-next` de drluoto, que incluye el fix del loader y hipCUB TOP_K. También compatible con el PR #27836 más el fix de crusaderky.
- **Latencia y throughput**: medidos en la tabla de benchmarks; el sidecar multiplica el throughput por 1.9-2.8x según la carga de trabajo y el contexto.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Uso |
|---|---|---|---|---|---|
| drluoto/Qwen3.8-Flash-Next-MTP-GGUF | 3.9B (head MTP) | 262K (heredado) | qwen-community-1.0 | GGUF Q8_0 | Sidecar MTP para decodificación especulativa |
| dzannotti/Qwen3.8-Flash-Next-MTP-GGUF | No disponible | No disponible | No disponible | GGUF | Sidecar MTP alternativo de la comunidad |
| Sin sidecar (modelo base solo) | 125B (MoE) | 262K | qwen-community-1.0 | GGUF | Inferencia estándar sin especulación |

La comparativa principal es entre usar el sidecar y no usarlo: el sidecar ofrece una aceleración de 1.9-2.8x en throughput sin cambios en la calidad de salida (verificación greedy). El repo de dzannotti es un sidecar similar de otro autor, pero no se dispone de datos de rendimiento comparables.

## Limitaciones y advertencias

- **No es un modelo autónomo**: requiere el modelo base Qwen3.8-Flash-Next en formato GGUF para funcionar; no puede usarse de forma independiente.
- **Dependencia de parches específicos**: necesita llama.cpp con el PR #27836 y el fix de crusaderky (o el branch pre-ensamblado de drluoto). Sin estos parches, el loader no cargará el head correctamente.
- **Verificación limitada**: solo se ha probado en ROCm 7.1 con Strix Halo. El comportamiento en CUDA u otras plataformas no está documentado.
- **Riesgo de corrupción en prompts largos**: aunque el autor afirma que la salida greedy es limpia en prompts largos, los ports MTP comunitarios anteriores fallaban por encima de ~1K tokens; se recomienda validar en el caso de uso específico.
- **Licencia qwen-community-1.0**: restricciones de uso comercial no detalladas en la información disponible; consultar el enlace de licencia del modelo base.
- **Cuantización única**: solo se ofrece Q8_0 para el head; no hay alternativas de menor precisión para entornos con memoria muy limitada.
- **Fecha de creación futura**: el repo está fechado en 2026-08-29, lo que sugiere que es un proyecto reciente o con fechas no verificables; se recomienda comprobar la integridad del archivo mediante el SHA-256 proporcionado.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/drluoto/Qwen3.8-Flash-Next-MTP-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- GitHub del modelo base: https://github.com/QwenLM/Qwen3.8-Flash-Next/
- PR de llama.cpp para exportación MTP: https://github.com/ggml-org/llama.cpp/pull/27836
- Fix de whitelist: https://github.com/rmonsurate/llama.cpp/pull/1
- Fix del loader: https://github.com/crusaderky/llama.cpp/commit/a82a58a57fc307e5cec0dc68db64d143339be4f2
- Branch de drluoto con parches: https://github.com/drluoto/llama.cpp/tree/strix-halo-flash-next
- Guía de ejecución local con OpenCode: https://www.datacamp.com/tutorial/run-qwen3-8-flash-next-locally
- Documentación de unsloth para Qwen3.8-Flash-Next: https://unsloth.ai/docs/models/qwen3.8-next
