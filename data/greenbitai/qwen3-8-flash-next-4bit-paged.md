# GreenBitAI/Qwen3.8-Flash-Next-4bit-paged

## Resumen

Qwen3.8-Flash-Next-4bit-paged es una compilación cuantizada a 4 bits del modelo Qwen3.8-Flash-Next de Qwen (Alibaba), publicada por GreenBitAI. Se trata de un modelo de lenguaje y visión de arquitectura Mixture-of-Experts (MoE) con pipeline `image-text-to-text`, empaquetado específicamente para Apple Silicon mediante la librería `mlx` y el binario propietario `gbx_lm`. Su rasgo distintivo es el diseño "paged": los pesos de los expertos enrutados y la tabla de n-gramas residen en contenedores separados que se leen del disco bajo demanda, de modo que la máquina carga solo lo que necesita en cada momento en lugar de mantener el modelo completo en memoria.

El modelo base declarado es `Qwen/Qwen3.8-Flash-Next`, y esta build deriva a su vez de `Vontra/Qwen3.8-Flash-Next-MLX-4bit`, manteniendo sin cambios la cuantización, el tokenizador, la plantilla de chat y la licencia. El repositorio ocupa 113,2 GB y el checkpoint de safetensors declara 5.396.629.651 parámetros totales, si bien el tamaño agregado de los contenedores de pesos (105,46 GiB) refleja la huella real de la build empaquetada.

Su relevancia actual radica en que permite ejecutar un modelo MoE de gran escala con capacidades multimodales en hardware de consumo Apple Silicon (y en NVIDIA DGX Spark bajo Linux) sin necesidad de ensamblar manualmente pipelines de cuantización ni de disponer de VRAM de centro de datos, a costa de depender de un runtime cerrado y de un formato de pesos no estándar.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Mixture-of-Experts (MoE) con capacidades de visión; runtime `mlx` / `gbx_lm` |
| Parámetros totales | 5.396.629.651 (según safetensors del repo) |
| Parámetros activos | no disponible |
| Longitud de contexto | no disponible (se han probado prompts de hasta 54k tokens en las mediciones del autor) |
| Tipos de cuantización | 4 bits (pesos); tabla n-gram en `ple-q4.rows` |
| Idiomas soportados | no disponible |
| Licencia | qwen-community-1.0 (etiquetada como `other` en el Hub) |
| Formato de pesos | `safetensors` (pesos residentes), `experts.bin` (expertos enrutados), `ple-q4.rows` (tabla n-gram), `mtp/` (cabeza draft) |

## Arquitectura y entrenamiento

La build se apoya en una arquitectura Mixture-of-Experts con enrutamiento por token: cada token activa un subconjunto reducido de expertos, lo que permite que el coste computacional por token sea muy inferior al que implicaría el total de parámetros. El autor no detalla el número de expertos, la top-k de enrutamiento ni el reparto entre expertos compartidos y enrutados. El modelo incorpora además un módulo de visión, coherente con su pipeline `image-text-to-text`, y una cabeza de decodificación especulativa (`mtp/`, 1,52 GiB) que viene desactivada por defecto.

La innovación técnica principal no está en el entrenamiento sino en el empaquetado: los pesos se dividen en cuatro contenedores. `model.safetensors` (3,80 GiB) aloja los pesos residentes; `experts.bin` (70,31 GiB) contiene los expertos enrutados; `ple-q4.rows` (29,80 GiB) aloja una tabla de n-gramas; y `mtp/` (1,52 GiB) la cabeza draft. El runtime decide en tiempo de ejecución, leyendo la memoria disponible de la máquina, qué parte mantiene residente y qué parte transmite desde el SSD. Los controles `GBX_PAGING=off` y `GBX_PLE=off` fuerzan a mantener residentes los expertos o la tabla n-gram, respectivamente. El autor declara verificaciones de build con logits bit-idénticos en 5 prompts hasta 160 tokens y comparación capa por capa frente a la versión residente (48 capas × 2 muestreos exactos, con un pico de 88,89 GiB en esa comprobación). No se dispone de información sobre volumen de tokens de entrenamiento, composición del dataset ni etapas de RLHF o DPO.

## Capacidades

- Generación de texto conversacional multi-turno.
- Comprensión de imágenes: acepta entradas visuales como partes `image_url` de la API de OpenAI, tanto por URL http(s) como en base64 con esquema `data:`.
- Razonamiento y respuesta a instrucciones heredados del modelo base Qwen3.8-Flash-Next.
- Servicio mediante API compatible con OpenAI (`/v1/chat/completions`) en el puerto 11688 por defecto.
- Decodificación especulativa opcional mediante la cabeza draft `mtp/`, que eleva el decode de 24 a 41 tok/s según el autor.
- Ejecución con paginación automática de expertos desde disco, sin flags manuales.
- Soporte de línea de comandos con entrada de imágenes mediante el parámetro `--images`.
- Capacidades multilingües: no disponibles en la información proporcionada.
- Soporte explícito de tool calling o function calling: no disponible en la información proporcionada.

## Casos de uso

- Asistencia conversacional local en Mac: el modelo sirve una API compatible con OpenAI en `127.0.0.1:11688`, por lo que puede conectarse a clientes y frameworks existentes sin adaptadores, manteniendo los datos en la máquina.
- Análisis de imágenes en flujos de trabajo de escritorio: clasificación, descripción o extracción de información de capturas, fotografías o documentos escaneados enviados como `image_url` en base64, sin salida a servicios externos.
- Prototipado de agentes con contexto largo: el autor reporta conversaciones de 54k tokens con primera respuesta en 54 s y mensajes posteriores de 1,3k tokens en 2,2 s sobre DGX Spark, lo que hace viable mantener historiales extensos en memoria de trabajo.
- Evaluación de modelos MoE de gran escala en hardware de consumo: la paginación permite arrancar el modelo en máquinas que no cabrían el checkpoint completo, útil para investigación comparativa y pruebas de calidad antes de invertir en infraestructura.
- Generación de código asistida en estación de trabajo Apple Silicon: con 41 tok/s en decode usando la cabeza draft, resulta adecuado para autocompletado interactivo y revisión de parches en local.
- Despliegue en DGX Spark para inferencia de equipo pequeño: con 128 GB de memoria el modelo cabe completo y no pagina, alcanzando 1274 tok/s en prompts de 4k tokens, lo que permite atender a un equipo de desarrollo interno.
- Procesamiento por lotes de documentos con imagen y texto: al combinar entrada multimodal y contexto largo, puede emplearse para resumir o extraer datos de informes con figuras en pipelines nocturnos.

## Benchmarks y rendimiento

El autor no publica resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K u otros). Sí se incluyen mediciones de rendimiento del runtime en NVIDIA DGX Spark (GB10, 128 GB), comparando gbx-lm v0.8.2 y v0.8.3, mediana de tres ejecuciones:

| Métrica | v0.8.2 | v0.8.3 |
|---|---|---|
| Prompt de 4k tokens | 1028 tok/s | 1274 tok/s |
| Prompt de 16k tokens | 911 tok/s | 1243 tok/s |
| Prompt de 54k tokens | 480 tok/s | 1065 tok/s |
| Conversación 54k, primera respuesta | 117 s | 54 s |
| Conversación 54k, siguiente mensaje de 1,3k tokens | 4,9 s | 2,2 s |

Decode en prompts cortos: 24 tok/s sin cabeza draft y 41 tok/s con ella (media sobre código, prosa y chat). En un Mac Studio de 512 GB el modelo se estabiliza en unos 76 GB residentes.

## Requisitos de hardware

- VRAM/memoria estimada: variable por diseño. En Mac Studio de 512 GB, unos 76 GB residentes; en DGX Spark de 128 GB cabe completo sin paginación. En máquinas más pequeñas el consumo baja y aumenta la lectura desde disco.
- GPU recomendadas: Apple Silicon (arm64) en macOS 15.0 o superior; NVIDIA DGX Spark (GB10) con arm64, glibc 2.39 o superior y driver con soporte CUDA 13. No hay build para Intel ni para otras GPU Linux.
- Cabe en GPU de consumo: sí, en equipos Apple Silicon con suficiente memoria unificada; el rendimiento depende de la capacidad de retener expertos y de la velocidad del SSD.
- Opciones de despliegue: exclusivamente el binario `gbx_lm` (descarga desde GitHub Releases, builds `darwin-arm64` y `linux-arm64`). No es compatible con `mlx-lm`, vLLM, llama.cpp, Ollama ni TGI; no requiere `pip install` ni Python.
- Latencia y throughput: 24 tok/s de decode en prompts cortos (41 con draft head); prefill de 1274 tok/s a 4k tokens en DGX Spark. En Mac la latencia depende del grado de paginación y de la velocidad de disco, sin cifras publicadas por tamaño de máquina.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Runtime |
|---|---|---|---|---|---|
| GreenBitAI/Qwen3.8-Flash-Next-4bit-paged | 5.396.629.651 (MoE) | no disponible | 4 bits paginada | qwen-community-1.0 | `gbx_lm` (Apple Silicon, DGX Spark) |
| Vontra/Qwen3.8-Flash-Next-MLX-4bit | no disponible | no disponible | 4 bits | qwen-community-1.0 | `mlx` |
| Qwen/Qwen3.8-Flash-Next (base) | no disponible | no disponible | sin cuantizar | qwen-community-1.0 | según framework del autor |

La diferencia práctica frente a la build de Vontra es la paginación de expertos y la tabla n-gram, que reducen la memoria residente a cambio de lecturas de disco; frente al modelo base, la ventaja es la huella de 4 bits y la posibilidad de ejecución en hardware de consumo. No se dispone de datos de rendimiento comparables entre las tres variantes.

## Limitaciones y advertencias

- Runtime cerrado: requiere el binario firmado `gbx_lm`; no hay integración con ecosistemas estándar como `mlx-lm`, vLLM o llama.cpp, lo que limita la portabilidad y la inspección del código.
- Plataformas restringidas: solo macOS 15+ en Apple Silicon y Linux arm64 en DGX Spark. No hay soporte para Intel, GPU NVIDIA convencionales ni Windows.
- Formato de pesos propietario: los contenedores `experts.bin` y `ple-q4.rows` no son legibles por herramientas estándar, lo que dificulta la auditoría y la reutilización fuera del runtime.
- Rendimiento dependiente del disco: en máquinas que no retienen los expertos, la latencia viene determinada por el SSD; el autor no publica cifras por tamaño de máquina.
- Licencia `qwen-community-1.0`: es necesario revisar el texto de la licencia antes de uso comercial; el Hub la etiqueta como `other` y el modelo card no detalla restricciones adicionales.
- Idiomas soportados no declarados: no hay información sobre cobertura multilingüe ni sobre calidad por idioma.
- Riesgo de alucinación y sesgos: no documentados por el autor; son heredados del modelo base y de la cuantización a 4 bits, que puede degradar la precisión en tareas sensibles.
- Cabeza draft desactivada por defecto: la decodificación especulativa requiere activación explícita y no está incluida en ninguna otra build publicada del modelo.
- Verificación de cuantización limitada: las pruebas de equivalencia se realizaron sobre 5 prompts de hasta 160 tokens, con divergencias de hasta 6,8 en un prompt más largo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/GreenBitAI/Qwen3.8-Flash-Next-4bit-paged
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- Build de origen: https://huggingface.co/Vontra/Qwen3.8-Flash-Next-MLX-4bit
- Repositorio del runtime: https://github.com/GreenBitAI/gbx-lm
- Releases del binario: https://github.com/GreenBitAI/gbx-lm/releases/latest
- Licencia: https://huggingface.co/GreenBitAI/Qwen3.8-Flash-Next-4bit-paged/blob/main/LICENSE
