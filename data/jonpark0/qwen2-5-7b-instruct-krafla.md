# jonpark0/Qwen2.5-7B-Instruct-krafla

## Resumen

Qwen2.5-7B-Instruct-krafla es una conversión cuantizada del modelo Qwen/Qwen2.5-7B-Instruct publicada por el desarrollador jonpark0 para Krafla, un runtime de inferencia en C11 sin dependencias externas que ejecuta modelos exclusivamente en CPU, tanto en x86-64 (desde SSE2 hasta AVX-512 VNNI) como en ARM (desde ARMv7 NEON hasta i8mm y SVE). El repositorio no contiene pesos en formato estándar (safetensors o GGUF), sino ficheros propietarios `.mlb` acompañados de un tokenizador en formato `.mlt`.

El modelo base Qwen2.5-7B-Instruct es un transformer decoder-only de 7.600 millones de parámetros desarrollado por Alibaba Qwen, con 32.768 posiciones de contexto nativo y ajuste por instrucciones. Esta conversión preserva la licencia Apache 2.0 del original y ofrece tres variantes de cuantización: Q4_0 completa, Q4_0 mixta (con las matrices `v`, `o` y `down` en Q8_0) y Q8_0 completa, con tamaños que van desde 4.086 MiB hasta 7.718 MiB.

La relevancia de esta publicación es acotada pero específica: permite ejecutar un modelo de 7B en entornos sin GPU (servidores legacy, máquinas ARM de bajo consumo, CI runners) mediante un binario único, con métricas de perplejidad y velocidad publicadas de forma transparente. No obstante, al tratarse de un formato propietario, no es compatible con el ecosistema habitual de despliegue (llama.cpp, vLLM, Ollama, TGI) y su adopción queda ligada al runtime Krafla.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada de Qwen2.5-7B-Instruct) |
| Parámetros totales | 7.600 millones (modelo base) |
| Parámetros activos | No aplica (modelo denso) |
| Longitud de contexto | 32.768 posiciones (el runtime usa 4.096 por defecto; configurable con `--ctx N`) |
| Tipos de cuantización | Q4_0 (4,5 bits/peso), Q4_0 mixta con Q8_0 en `v,o,down`, Q8_0 (8,5 bits/peso) |
| Idiomas soportados | No disponible en la información proporcionada |
| Licencia | Apache 2.0 |
| Formato de pesos | `.mlb` (formato propietario de Krafla), tokenizador `.mlt` |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Qwen2.5-7B-Instruct: un transformer decoder-only denso con atención por múltiples cabezas, normalización RMSNorm, activación SwiGLU y embeddings de tokens atados. El modelo fue entrenado por Alibaba Qwen con ajuste por instrucciones y optimización por preferencias humanas (RLHF/DPO), aunque la model card de esta conversión no aporta detalles sobre el volumen de tokens de entrenamiento ni la composición del dataset original.

La innovación técnica de esta publicación no está en el modelo, sino en el proceso de conversión y en el runtime. Krafla aplica cuantización por bloques de 32 pesos con escalas en f16, lo que resulta en 4,5 bits por peso para Q4_0 y 8,5 bits por peso para Q8_0. La variante mixta mantiene en Q8_0 las matrices de proyección de valor (`v`), salida de atención (`o`) y down-projection del MLP (`down`), que son las más sensibles a la cuantización agresiva. El runtime implementa kernels vectorizados específicos por ISA (SSE2, AVX2, AVX-512 VNNI, ARMv7 NEON, i8mm, SVE) y expone tanto un binario de ejecución (`ml_run`) como un servidor compatible con la API de OpenAI (`ml_server`).

## Capacidades

- Generación de texto conversacional multi-turno con formato de chat Qwen (`--chat qwen`).
- Razonamiento, matemáticas y generación de código heredados del modelo base Qwen2.5-7B-Instruct.
- Soporte de contexto largo de hasta 32.768 tokens, limitado en la práctica por el tamaño de la caché KV configurada con `--ctx`.
- Servidor HTTP con endpoint compatible con la API de OpenAI en `/v1`, lo que permite integrarlo con clientes existentes.
- Ejecución exclusiva en CPU, sin dependencia de CUDA, ROCm ni bibliotecas externas.
- Capacidades multilingües del modelo base (no detalladas en la model card de esta conversión).
- Soporte de tool calling y function calling: no confirmado en la información proporcionada para esta conversión.

## Casos de uso

- Inferencia en servidores sin GPU: el binario `ml_run` permite ejecutar un modelo de 7B en máquinas x86-64 o ARM sin CUDA ni drivers propietarios, útil en entornos legacy o con restricciones de hardware.
- Despliegue en CI/CD: con un único binario y ficheros `.mlb` de entre 4 y 8 GiB, se puede levantar un endpoint compatible con OpenAI en runners de integración continua para pruebas de regresión de prompts.
- Dispositivos ARM de bajo consumo: la variante Q4_0 (4.086 MiB) encaja en placas ARMv7 o AArch64 con NEON, como Raspberry Pi o servidores ARM económicos, para asistentes locales.
- Prototipado rápido sin infraestructura cloud: `ml_server` expone la API de OpenAI en `127.0.0.1:8080/v1`, lo que permite sustituir un backend remoto por uno local durante el desarrollo.
- Procesamiento por lotes offline: con 32.768 posiciones de contexto disponibles en los ficheros, se pueden procesar documentos largos en una sola pasada ajustando `--ctx`.
- Evaluación comparativa de cuantizaciones: las tres variantes publicadas (Q4_0, Q4_0 mixta, Q8_0) con perplejidad medida sobre wikitext-2 permiten estudiar el compromiso precisión/velocidad/tamaño en un mismo modelo.

## Benchmarks y rendimiento

Las métricas publicadas corresponden a la perplejidad sobre wikitext-2 (4 fragmentos de 512 tokens) y a la velocidad con `ml_bench -n 128` (128 tokens de prefill y 128 de decode), medidas en un runner de GitHub con AMD EPYC 7763, 4 hilos y build `avx2`.

| Fichero | Pesos | Tamaño | Perplejidad | Prefill | Decode |
|---|---|---:|---:|---:|---:|
| `Qwen2.5-7B-Instruct-Q4_0.mlb` | Q4_0, todas las matrices a 4 bits | 4.086 MiB | 9,92 | 26 tok/s | 9,9 tok/s |
| `Qwen2.5-7B-Instruct-Q4_0-mixed.mlb` | Q4_0 con `v,o,down` en Q8_0 | 5.189 MiB | 9,57 | 21 tok/s | 7,7 tok/s |
| `Qwen2.5-7B-Instruct-Q8_0.mlb` | Q8_0, todas las matrices a 8 bits | 7.718 MiB | 8,99 | 16 tok/s | 5,2 tok/s |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible para esta conversión.

## Requisitos de hardware

- RAM estimada: al menos el tamaño del fichero `.mlb` más la caché KV. Para Q4_0 (4.086 MiB) se recomienda un mínimo de 8 GiB de RAM; para Q8_0 (7.718 MiB), 12-16 GiB.
- GPU: no se utiliza GPU en ningún caso; el runtime es exclusivamente CPU.
- CPU x86-64: desde SSE2 hasta AVX-512 VNNI. El binario `ml_run` selecciona automáticamente el build más capaz que soporte la CPU.
- CPU ARM: ARMv7 con NEON, AArch64 con NEON, i8mm y SVE.
- Sistemas operativos soportados por los releases: Linux x86-64, AArch64 y ARMv7, y Windows x86-64.
- Hilos: configurables con `-t N`; las métricas publicadas usan 4 hilos.
- Despliegue: exclusivamente mediante Krafla (`ml_run` o `ml_server`). No compatible con vLLM, llama.cpp, Ollama ni TGI.
- Throughput de referencia: 9,9 tok/s en decode con Q4_0 en un EPYC 7763 a 4 hilos; en hardware de consumo o ARM el rendimiento será previsiblemente inferior (no se han publicado medidas para esos entornos).

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato | Licencia | Runtime |
|---|---|---|---|---|---|
| Qwen2.5-7B-Instruct-krafla (Q4_0) | 7,6B | 32.768 | `.mlb` | Apache 2.0 | Krafla (CPU) |
| Qwen2.5-7B-Instruct (GGUF Q4_K_M) | 7,6B | 32.768 | GGUF | Apache 2.0 | llama.cpp, Ollama, etc. |
| Qwen2.5-7B-Instruct (safetensors) | 7,6B | 32.768 | safetensors | Apache 2.0 | vLLM, TGI, transformers |
| Llama 3.1 8B Instruct (GGUF Q4_K_M) | 8,0B | 131.072 | GGUF | Llama 3.1 Community | llama.cpp, Ollama, etc. |

La comparativa se limita a parámetros, contexto, formato y licencia, ya que no se han publicado benchmarks estándar para esta conversión que permitan comparar rendimiento con las alternativas. La diferencia práctica principal es el formato: frente a GGUF y safetensors, el `.mlb` de Krafla solo es utilizable con el runtime del mismo autor.

## Limitaciones y advertencias

- Formato propietario: los ficheros `.mlb` y `.mlt` solo funcionan con Krafla 0.8.0 o superior; no hay soporte en llama.cpp, vLLM, Ollama, TGI ni transformers.
- Contexto efectivo reducido por defecto: aunque los ficheros registran 32.768 posiciones, `ml_run` y `ml_server` usan 4.096 salvo que se pase `--ctx N`, lo que incrementa el consumo de RAM de la caché KV.
- Rendimiento limitado: 9,9 tok/s en decode con Q4_0 sobre un EPYC 7763 a 4 hilos es bajo para aplicaciones interactivas; en hardware de consumo será menor.
- Repositorio sin tracción: 0 descargas y 0 likes en el momento de la consulta, lo que implica ausencia de validación comunitaria y mayor riesgo de errores no detectados en la conversión.
- Idiomas soportados no declarados en la model card de esta conversión; deben inferirse del modelo base.
- Riesgo de alucinación inherente al modelo base Qwen2.5-7B-Instruct; la cuantización Q4_0 puede incrementar la degradación en tareas sensibles a la precisión numérica (perplejidad 9,92 frente a 8,99 en Q8_0).
- Sesgos del modelo base no documentados en esta model card.
- Licencia Apache 2.0 heredada del original, que permite uso comercial, pero la responsabilidad sobre la calidad de la conversión recae en el publicador de este repositorio y no en Alibaba Qwen.
- No se han publicado evaluaciones de tool calling, agentes ni capacidades multilingües específicas para esta conversión.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/jonpark0/Qwen2.5-7B-Instruct-krafla
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-7B-Instruct
- Repositorio de Krafla: https://github.com/JonPark0/krafla
- Releases de Krafla: https://github.com/JonPark0/krafla/releases
- Guía de usuario de Krafla: https://github.com/JonPark0/krafla/blob/main/docs/user-guide.md
- Comparativa con llama.cpp: https://github.com/JonPark0/krafla/blob/main/docs/benchmarks.md
- Commit de conversión: https://github.com/JonPark0/krafla/commit/0b527a04aebd4234ed3c2197bfbb0248a1628ac7
