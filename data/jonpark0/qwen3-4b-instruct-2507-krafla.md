# jonpark0/Qwen3-4B-Instruct-2507-krafla

## Resumen

Qwen3-4B-Instruct-2507-krafla es una conversión cuantizada del modelo Qwen/Qwen3-4B-Instruct-2507, publicada por jonpark0 para su uso con Krafla, un runtime de inferencia en C11 sin dependencias externas orientado exclusivamente a CPU. El paquete incluye tres variantes de pesos (Q4_0 completa, Q4_0 mixta con proyecciones v, o y down en Q8_0, y Q8_0 completa) junto con el tokenizador convertido al formato propietario `.mlt`. El objetivo no es mejorar el modelo base, sino hacerlo ejecutable en hardware sin GPU, aprovechando las extensiones SIMD de x86-64 (desde SSE2 hasta AVX-512 VNNI) y de ARM (desde ARMv7 NEON hasta i8mm y SVE).

El modelo subyacente es un transformer denso de 4.000 millones de parámetros desarrollado por el equipo Qwen de Alibaba, con una ventana de contexto declarada de 262.144 posiciones y ajuste instructivo (variante 2507, correspondiente a julio de 2025). Esta conversión preserva esa arquitectura y esos pesos, limitándose a reducir la precisión numérica de las matrices para disminuir el tamaño en disco y el consumo de memoria, a cambio de una degradación medible en perplejidad.

La relevancia de esta ficha es doble: por un lado, documenta una alternativa práctica para desplegar un modelo de 4B en entornos de solo CPU (servidores sin acelerador, portátiles, dispositivos ARM, CI); por otro, sirve como referencia de las compensaciones reales entre cuantización, velocidad y calidad que introduce este tipo de conversiones, con cifras medidas por el propio autor en un runner de GitHub.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (modelo base Qwen3-4B-Instruct-2507); runtime Krafla en C11 |
| Parametros totales | 4.000 millones (modelo base) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 262.144 posiciones registradas en los ficheros; `ml_run` y `ml_server` usan 4.096 por defecto salvo que se pase `--ctx N` |
| Tipos de cuantizacion | Q4_0 (4,5 bits por peso), Q4_0 mixta (v, o, down en Q8_0), Q8_0 (8,5 bits por peso); escalas f16 por bloque de 32 pesos |
| Idiomas soportados | No disponible en la informacion proporcionada (heredados del modelo base, sin listado explícito) |
| Licencia | Apache 2.0 (la del modelo original, copiada en el repositorio) |
| Formato de pesos | `.mlb` (formato propietario de Krafla) y `tokenizer.mlt`; no se distribuyen safetensors ni GGUF |
| Tamano del repositorio | 9,5 GB (incluye las tres variantes y el tokenizador) |
| Fecha de conversion | 2026-11-03, Krafla 0.8.0 (commit 0b527a0) |

## Arquitectura y entrenamiento

La arquitectura es la del modelo base Qwen3-4B-Instruct-2507: un transformer denso de 4B parámetros con atención estándar y ventana de contexto larga (262.144 posiciones declaradas). Esta publicación no entrena ni afina nada; únicamente convierte los safetensors originales a los formatos de Krafla mediante las herramientas `tools/convert.py` y `tools/convert_tokenizer.py`. La cuantización Q4_0 y Q8_0 mantiene una escala en f16 por cada bloque de 32 pesos, lo que resulta en 4,5 y 8,5 bits efectivos por peso respectivamente. La variante mixta aplica Q8_0 únicamente a las proyecciones `v`, `o` y `down`, que son las más sensibles a la pérdida de precisión, manteniendo el resto en Q4_0.

No se documentan en la información disponible detalles sobre el dataset de entrenamiento del modelo base (número de tokens, composición, fases de RLHF/DPO o decodificación especulativa). La innovación técnica destacable de esta publicación es el propio runtime Krafla: un motor de inferencia en C11 sin dependencias, con builds específicos por conjunto de instrucciones (SSE2, AVX2, AVX-512 VNNI en x86-64; NEON, i8mm y SVE en ARM), que selecciona automáticamente el build más capaz soportado por la CPU. Incluye `ml_run` (CLI), `ml_server` (API compatible con OpenAI en `/v1`) y utilidades como `ml_bench` y `tools/perplexity.py`.

## Capacidades

- Generación de texto conversacional en formato ChatML (`--chat chatml`), con parada correcta en turnos de una sola respuesta.
- Razonamiento y respuesta a preguntas generales, heredados del ajuste instructivo del modelo base.
- Generación de código y matemáticas: capacidad del Qwen3-4B-Instruct-2507 original, no verificada de forma independiente en esta conversión.
- Servidor HTTP con API compatible con OpenAI (`ml_server`), lo que permite integrarlo con clientes y SDK existentes.
- Ejecución en CPU pura: x86-64 (SSE2, AVX2, AVX-512 VNNI) y ARM (ARMv7 NEON, AArch64, i8mm, SVE), en Linux y Windows x86-64.
- Control explícito del tamaño de la caché KV mediante `--ctx N` y del número de hilos con `-t N`.
- No se documenta soporte de tool calling, function calling, agentes multi-paso, visión, audio ni modo thinking en la información proporcionada; estas capacidades dependerían del modelo base y de que el runtime las exponga, cosa que no se indica.

## Casos de uso

- Despliegue en servidores sin GPU: con la variante Q4_0 (2.158 MiB) el modelo cabe en RAM de un servidor modesto y se sirve vía `ml_server` con API compatible con OpenAI, sin instalar CUDA ni dependencias de Python.
- Inferencia en portátiles y estaciones de trabajo: la build AVX2 permite ejecutar el modelo en CPU de escritorio con 4 hilos a 45 tok/s de prefill y 16,1 tok/s de decode, suficiente para asistentes interactivos de un solo usuario.
- Dispositivos ARM y entornos embebidos: las builds NEON, i8mm y SVE habilitan el despliegue en placas AArch64 y ARMv7, útil para prototipos en campo o sistemas de bajo consumo.
- Pipelines de CI/CD y pruebas automatizadas: al no requerir GPU ni dependencias, el modelo puede incluirse en runners de integración continua para tests de regresión de prompts, evaluación de plantillas o generación de texto en documentación.
- Procesamiento por lotes offline: con la variante Q8_0 (4.076 MiB, perplejidad 13,12) se obtiene la mayor fidelidad de esta publicación para tareas de resumen, clasificación o extracción sobre textos, ejecutadas en CPU durante la noche.
- Entornos con requisitos de auditabilidad: al ser un binario C11 sin dependencias y con pesos en formato abierto documentado, encaja en despliegues donde no se permite instalar frameworks de ML completos.
- Contextos largos moderados: aunque los ficheros registran 262.144 posiciones, en la práctica se usa `--ctx` para ajustar la caché KV a la RAM disponible; con 4.096 posiciones por defecto cubre conversaciones multi-turno y documentos de varias páginas.

## Benchmarks y rendimiento

Datos medidos por el autor en un GitHub runner (AMD EPYC 7763, 4 hilos) con la build `avx2` de Krafla. La perplejidad se mide sobre el test de wikitext-2, 4 fragmentos de 512 tokens; la velocidad con `ml_bench -n 128` (128 tokens de prompt y 128 decodificados).

| Fichero | Pesos | Tamano | Perplejidad | Prefill (tok/s) | Decode (tok/s) |
|---|---|---:|---:|---:|---:|
| Q4_0 | Toda matriz en 4 bits | 2.158 MiB | 14,13 | 45 | 16,1 |
| Q4_0 mixta | Q4_0 con v, o, down en Q8_0 | 2.811 MiB | 13,91 | 37 | 12,3 |
| Q8_0 | Toda matriz en 8 bits | 4.076 MiB | 13,12 | 28 | 8,2 |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible para esta conversión ni para el modelo base en esta ficha.

## Requisitos de hardware

- VRAM: no aplica; la inferencia es exclusivamente en CPU. El requisito real es RAM del sistema.
- RAM estimada: al menos 2,2 GB para Q4_0, 2,8 GB para Q4_0 mixta y 4,1 GB para Q8_0, más la caché KV (proporcional a `--ctx N` y al número de capas) y el overhead del proceso.
- CPU x86-64: cualquier procesador con SSE2 (build mínima); AVX2 recomendado para el rendimiento de la tabla; AVX-512 VNNI para el máximo throughput.
- CPU ARM: ARMv7 con NEON, AArch64, y builds con i8mm y SVE en núcleos recientes.
- GPU: no se usa ninguna; no hay soporte CUDA, ROCm ni Metal documentado en esta publicación.
- Hilos: el autor mide con 4 hilos (`-t 4`); el rendimiento escala con núcleos disponibles hasta el límite de ancho de banda de memoria.
- Despliegue: binarios de Krafla 0.8.0 o superior para Linux x86-64, AArch64, ARMv7 y Windows x86-64; `ml_run` para CLI y `ml_server` para API compatible con OpenAI.
- No compatible con vLLM, llama.cpp, Ollama ni TGI: los pesos están en formato `.mlb` propietario de Krafla, no en GGUF ni safetensors.
- Latencia y throughput: los de la tabla anterior (16,1 tok/s de decode en Q4_0 con AVX2 y 4 hilos); en hardware inferior o con menos hilos, proporcionalmente menor.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato / runtime | Licencia | Notas |
|---|---|---|---|---|---|
| Qwen3-4B-Instruct-2507-krafla (esta publicacion) | 4B denso | 262.144 (4.096 por defecto en runtime) | `.mlb`, Krafla (solo CPU) | Apache 2.0 | Perplejidad 13,12-14,13 en wikitext-2; 8,2-16,1 tok/s decode en EPYC con AVX2 |
| Qwen/Qwen3-4B-Instruct-2507 (original) | 4B denso | 262.144 | safetensors, transformers/vLLM/SGLang | Apache 2.0 | Referencia de calidad completa; requiere GPU o framework Python |
| Conversiones GGUF de Qwen3-4B (p. ej. para llama.cpp) | 4B denso | Segun configuracion | GGUF, llama.cpp/Ollama | Apache 2.0 | Ecosistema mas amplio y tooling maduro; no disponible en esta busqueda como publicacion concreta |
| Modelos densos de 3-4B de otras familias (p. ej. Llama 3.2 3B, Gemma 2 2B) | 2-4B | 8K-128K segun modelo | Multiples | Licencias variables | Alternativas de tamano similar; datos concretos no disponibles en esta busqueda |

La comparación directa con conversiones GGUF equivalentes no puede hacerse con cifras porque no se dispone de mediciones en la misma máquina y con el mismo método; el autor enlaza una comparación con llama.cpp en `docs/benchmarks.md` del repositorio de Krafla, pero sus cifras no se recogen en la información proporcionada.

## Limitaciones y advertencias

- La cuantización degrada la calidad de forma medible: la perplejidad sube de 13,12 (Q8_0) a 14,13 (Q4_0), un 7,7 % de empeoramiento relativo; en tareas sensibles a precisión (matemáticas, código, citas exactas) el efecto puede ser mayor que en perplejidad agregada.
- La variante mixta (Q4_0 con v, o, down en Q8_0) recupera parte de la calidad (13,91) a costa de un 30 % más de tamaño y un 24 % menos de velocidad de decode que Q4_0 pura.
- El contexto efectivo por defecto es de 4.096 posiciones; usar las 262.144 declaradas exige configurar `--ctx` y disponer de RAM suficiente para la caché KV, con la consiguiente caída de velocidad.
- El formato `.mlb` es propietario de Krafla: no hay interoperabilidad con llama.cpp, vLLM, Ollama ni transformers, lo que limita la portabilidad y crea dependencia de un único runtime mantenido por un solo autor.
- El proyecto Krafla es de un desarrollador individual (jonpark0); no hay garantías de mantenimiento a largo plazo, auditoría de seguridad ni soporte comercial documentado.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, sin evidencia de uso en producción ni validación independiente de las cifras.
- No se documentan sesgos, comportamiento multilingüe específico ni tasas de alucinación de esta conversión; deben evaluarse por caso de uso antes de desplegar.
- La licencia Apache 2.0 permite uso comercial, pero se heredan las condiciones y avisos del modelo base; conviene revisar la model card original de Qwen para obligaciones adicionales.
- No se documenta soporte de tool calling, agentes, visión ni audio en esta conversión; no asumir que el runtime los expone aunque el modelo base los tenga.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/jonpark0/Qwen3-4B-Instruct-2507-krafla
- Modelo base: https://huggingface.co/Qwen/Qwen3-4B-Instruct-2507
- Repositorio de Krafla: https://github.com/JonPark0/krafla
- Releases de Krafla (0.8.0 o superior): https://github.com/JonPark0/krafla/releases
- Guía de usuario de Krafla (formatos Q8, Q4 y mixto): https://github.com/JonPark0/krafla/blob/main/docs/user-guide.md#q8-q4-or-mixed
- Comparación con llama.cpp: https://github.com/JonPark0/krafla/blob/main/docs/benchmarks.md
- Commit de conversión (0b527a0): https://github.com/JonPark0/krafla/commit/0b527a04aebd4234ed3c2197bfbb0248a1628ac7
