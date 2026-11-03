# jonpark0/Qwen3.5-0.8B-krafla

## Resumen

Qwen3.5-0.8B-krafla es una conversión cuantizada del modelo base Qwen/Qwen3.5-0.8B, publicada por el usuario jonpark0. No se trata de un modelo entrenado desde cero, sino de un conjunto de pesos convertidos a los formatos propietarios de Krafla (`.mlb`), un runtime en C11 sin dependencias externas diseñado para inferencia exclusivamente en CPU sobre x86-64 (desde SSE2 hasta AVX-512 VNNI) y ARM (desde ARMv7 NEON hasta i8mm y SVE). El objetivo es permitir ejecutar un modelo de 0.8B parámetros en hardware sin GPU, con un binario portable y sin cadena de dependencias de Python.

El repositorio incluye tres variantes de cuantización: Q4_0 pura (406 MiB), Q4_0 mixta con las matrices `v`, `o` y `down` en Q8_0 (491 MiB) y Q8_0 completa (764 MiB), además del tokenizador convertido (`tokenizer.mlt`). Los formatos Q4_0 y Q8_0 mantienen una escala f16 por bloque de 32 pesos, lo que resulta en 4.5 y 8.5 bits por peso respectivamente. El modelo base conserva una ventana de contexto declarada de 262144 posiciones, aunque el runtime usa 4096 por defecto salvo que se especifique `--ctx N`.

La relevancia de esta ficha es doble: por un lado documenta una alternativa de despliegue en CPU para un modelo pequeño de la familia Qwen3.5; por otro, ilustra el ecosistema de runtimes alternativos a llama.cpp que están apareciendo para inferencia local sin GPU. La licencia Apache 2.0 del modelo original se mantiene.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base Qwen3.5-0.8B; la model card no detalla la arquitectura interna) |
| Parámetros totales | 0.8B (según el nombre del modelo base) |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 262144 posiciones en los pesos; 4096 por defecto en `ml_run`/`ml_server` (configurable con `--ctx N`) |
| Tipos de cuantización | Q4_0 (4.5 bits/peso), Q4_0 mixta con `v,o,down` en Q8_0, Q8_0 (8.5 bits/peso) |
| Idiomas soportados | no disponible (la model card no los enumera; el chat template se invoca como `qwen3.5-nothink`) |
| Licencia | Apache 2.0 |
| Formato de pesos | `.mlb` (formato propietario de Krafla), tokenizador en `.mlt` |

## Arquitectura y entrenamiento

La model card no describe la arquitectura interna del modelo base Qwen3.5-0.8B ni los datos de entrenamiento, número de tokens, composición del dataset o si hubo RLHF/DPO. Lo único documentado en este repositorio es el proceso de conversión: los pesos se obtuvieron a partir de los safetensors del modelo original mediante las herramientas `tools/convert.py` y `tools/convert_tokenizer.py` de Krafla 0.9.0 (commit `a4f30b5`), con fecha 2026-11-03.

La innovación técnica relevante aquí no está en el modelo sino en el runtime: Krafla es un motor de inferencia en C11 sin dependencias, con kernels optimizados para SSE2, AVX2, AVX-512 VNNI, ARMv7 NEON, i8mm y SVE. La cuantización Q4_0/Q8_0 usa escalas f16 por bloque de 32 pesos, un esquema similar al de llama.cpp (la propia model card enlaza a una comparativa con llama.cpp en `docs/benchmarks.md`). El chat template se selecciona con `--chat qwen3.5-nothink`, lo que sugiere que el modelo base soporta un modo "thinking" que aquí se desactiva por defecto.

## Capacidades

- Generación de texto autoregresiva en CPU, con pipeline `text-generation`.
- Conversación multi-turno mediante el chat template `qwen3.5-nothink` invocado con `--chat`.
- Servicio compatible con la API de OpenAI en `http://127.0.0.1:8080/v1` mediante `ml_server`.
- Ejecución en x86-64 (SSE2, AVX2, AVX-512 VNNI) y ARM (ARMv7 NEON, i8mm, SVE), en Linux, Windows x86-64 y AArch64/ARMv7.
- Contexto configurable hasta 262144 posiciones (limitado por memoria para la KV cache).
- Capacidades específicas del modelo base (razonamiento, código, matemáticas, tool calling, multilingüismo) no están documentadas en esta model card; deben consultarse en la ficha de Qwen/Qwen3.5-0.8B.

## Casos de uso

- Inferencia local en portátiles sin GPU: con la variante Q4_0 (406 MiB) el modelo cabe holgadamente en RAM y se ejecuta con `ml_run` en cualquier CPU x86-64 moderna, útil para prototipos y pruebas offline.
- Despliegue en servidores edge o dispositivos ARM: la compilación para ARMv7 NEON, i8mm y SVE permite ejecutar el modelo en placas SBC o servidores ARM sin acelerador, con la variante Q8_0 (764 MiB) si se prioriza calidad.
- Servicio HTTP compatible con OpenAI: `ml_server` expone `/v1` en el puerto 8080, lo que permite integrar el modelo en aplicaciones existentes que ya consumen la API de OpenAI sin cambiar el cliente.
- Evaluación de runtimes alternativos: sirve como banco de pruebas para comparar Krafla frente a llama.cpp en términos de perplejidad y throughput (la model card enlaza a `docs/benchmarks.md` con esa comparativa).
- Generación de texto de baja latencia en CPU: con 61.6 tok/s de decodificación en Q4_0 sobre un EPYC 7763 con 4 hilos, es viable para asistentes de texto, resumen o clasificación en entornos sin GPU.
- Pipelines de CI/CD y tests automatizados: al no requerir dependencias ni GPU, el binario y los pesos se pueden incluir en imágenes de contenedor ligeras para pruebas de integración de aplicaciones que usen LLM.
- Prototipado de agentes con contexto largo: la ventana de 262144 posiciones (si la memoria lo permite) permite experimentar con documentos extensos, aunque el rendimiento decae con `--ctx` grande.

## Benchmarks y rendimiento

Los datos publicados en la model card son de rendimiento del runtime, no de calidad del modelo en benchmarks estándar (MMLU, HumanEval, GSM8K, etc.), que no se incluyen.

| Fichero | Pesos | Tamaño | Perplejidad (wikitext-2) | Prefill | Decode |
|---|---|---:|---:|---:|---:|
| `Qwen3.5-0.8B-Q4_0.mlb` | Q4_0, todas las matrices 4-bit | 406 MiB | 27.53 | 235 tok/s | 61.6 tok/s |
| `Qwen3.5-0.8B-Q4_0-mixed.mlb` | Q4_0 con `v,o,down` en Q8_0 | 491 MiB | 24.96 | 206 tok/s | 50.1 tok/s |
| `Qwen3.5-0.8B-Q8_0.mlb` | Q8_0, todas las matrices 8-bit | 764 MiB | 23.87 | 154 tok/s | 36.5 tok/s |

Medido en un GitHub runner (AMD EPYC 7763, 4 hilos) con la build `avx2` de Krafla. Perplejidad sobre wikitext-2 test, 4 chunks de 512 tokens (`tools/perplexity.py --ctx 512 --chunks 4`). Velocidad con `ml_bench -n 128` (128 tokens de prompt y 128 decodificados). La perplejidad solo es comparable entre ficheros del mismo modelo.

## Requisitos de hardware

- VRAM: no aplica; el runtime es exclusivamente CPU.
- RAM estimada: aproximadamente 406 MiB (Q4_0), 491 MiB (Q4_0 mixta) o 764 MiB (Q8_0) para los pesos, más la KV cache según `--ctx`. Con 4096 posiciones por defecto el consumo adicional es moderado; con contextos muy largos la KV cache puede dominar.
- CPU recomendadas: x86-64 con AVX2 o AVX-512 VNNI para máximo rendimiento; ARM con NEON, i8mm o SVE. Funciona también con SSE2 como mínimo.
- GPU: no se usa GPU; no hay soporte CUDA/ROCm documentado en esta model card.
- Cabe en cualquier equipo consumer: portátiles, mini-PC, SBC ARM y contenedores ligeros.
- Opciones de despliegue: Krafla (`ml_run` para CLI, `ml_server` para API OpenAI-compatible). No se documenta soporte para vLLM, llama.cpp, Ollama o TGI con estos ficheros `.mlb`.
- Latencia y throughput: 235 tok/s de prefill y 61.6 tok/s de decode en Q4_0 sobre EPYC 7763 con 4 hilos; 154/36.5 tok/s en Q8_0. En hardware consumer los valores serán previsiblemente menores, aunque no se publican cifras específicas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato / runtime | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.5-0.8B-krafla (este) | 0.8B | 262144 (4096 por defecto en runtime) | `.mlb` / Krafla (CPU) | Apache 2.0 | HuggingFace, 0 descargas, 0 likes |
| Qwen/Qwen3.5-0.8B (base) | 0.8B | 262144 | safetensors / transformers, vLLM, etc. | Apache 2.0 | HuggingFace (modelo original) |
| Conversiones GGUF de Qwen3.5-0.8B | 0.8B | 262144 | GGUF / llama.cpp, Ollama | Apache 2.0 | Disponibles en el ecosistema llama.cpp (no verificadas en esta ficha) |

La comparativa directa con otras cuantizaciones del mismo modelo base (por ejemplo GGUF de llama.cpp) es pertinente porque la model card enlaza explícitamente a una comparativa de rendimiento con llama.cpp. No se dispone de datos de benchmarks de calidad (MMLU, HumanEval, GSM8K) para ninguno de los formatos en la información proporcionada.

## Limitaciones y advertencias

- Modelo de 0.8B parámetros: la calidad en razonamiento complejo, matemáticas y código será limitada en comparación con modelos de mayor tamaño; no se publican benchmarks que lo cuantifiquen.
- Riesgo de alucinación inherente a los modelos generativos pequeños; no se documentan mitigaciones específicas.
- La model card no enumera los idiomas soportados; el soporte multilingüe debe verificarse contra el modelo base.
- La perplejidad en wikitext-2 aumenta de 23.87 (Q8_0) a 27.53 (Q4_0), una degradación notable; para tareas sensibles a la calidad conviene usar Q8_0 o la variante mixta.
- El contexto de 262144 posiciones está en los pesos, pero la KV cache a esa longitud puede exceder la RAM disponible en equipos consumer; el runtime usa 4096 por defecto.
- Los ficheros `.mlb` son propietarios de Krafla y no son compatibles con llama.cpp, vLLM, Ollama ni TGI; el despliegue queda atado al runtime de JonPark0 (versión 0.9.0 o superior).
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no hay validación comunitaria documentada.
- La licencia Apache 2.0 del modelo base se mantiene y permite uso comercial, pero conviene revisar los términos del runtime Krafla por separado (no documentados en esta model card).

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/jonpark0/Qwen3.5-0.8B-krafla
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Repositorio de Krafla: https://github.com/JonPark0/krafla
- Releases de Krafla: https://github.com/JonPark0/krafla/releases
- Commit de conversión: https://github.com/JonPark0/krafla/commit/a4f30b59b1fdf8c86e118d4584b57247ce3f1c51
- Guía de usuario (formatos Q8/Q4/mixto): https://github.com/JonPark0/krafla/blob/main/docs/user-guide.md#q8-q4-or-mixed
- Comparativa con llama.cpp: https://github.com/JonPark0/krafla/blob/main/docs/benchmarks.md
