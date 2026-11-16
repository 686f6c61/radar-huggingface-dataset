# agiws/gemma4-llama-cpp

## Resumen

`agiws/gemma4-llama-cpp` no es un modelo de pesos, sino una instantánea del código fuente de un fork privado de llama.cpp utilizado por los workers de inferencia de AGIWS. El repositorio contiene el árbol de fuentes completo (sin `.git` ni artefactos de compilación) más un conjunto de librerías CUDA precompiladas y el binario `llama-server` para GPU NVIDIA T4 (arquitectura `sm_75`). Su función es habilitar la inferencia de los modelos de texto `gemma4` y `gemma4-assistant`, así como de los codificadores de audio integrados en el subsistema multimodal `mtmd`.

El fork incorpora soporte específico para audio en la familia Gemma 4: los grafos `clip_graph_gemma4a` y `clip_graph_gemma4ua` en `tools/mtmd/clip.cpp`, los preprocesadores `gemma4a`/`gemma4ua` con filtros mel y streaming en `tools/mtmd/mtmd-audio.cpp`, y extensiones en `mtmd.h` (`mtmd_support_audio`, `mtmd_bitmap_init_from_audio`). El servidor incluido expone una API compatible con OpenAI que acepta partes de contenido `input_audio`. También se incluye un conversor GGUF (`conversion/gemma.py`) para `Gemma4ForConditionalGeneration`.

El interés del repositorio es fundamentalmente de ingeniería: permite reproducir el entorno de ejecución de AGIWS en una T4 de Colab, auditar el código del fork y desplegar un endpoint compatible con OpenAI con capacidades de audio. No contiene pesos del modelo; para ejecutarlo es necesario obtener por separado los GGUF (`gemma-4-12b-it-Q4_K_M.gguf` y `mmproj-F16.gguf`, según los flags de ejemplo de la model card).

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | No disponible (el repo contiene código de inferencia, no pesos; se infiere una familia transformer multimodal con codificador de audio, pero no se documenta) |
| Parámetros totales | No disponible (la model card menciona un fichero `gemma-4-12b-it-Q4_K_M.gguf`, lo que sugiere ~12B en el modelo de ejemplo, sin confirmación oficial) |
| Parámetros activos | No disponible |
| Longitud de contexto | No disponible como spec del modelo; el ejemplo de ejecución usa `-c 4096` |
| Tipos de cuantización | No disponible como listado; el ejemplo usa Q4_K_M para el modelo y F16 para el proyector multimodal (`mmproj-F16.gguf`) |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | GGUF (conversor `Gemma4Model` en `conversion/gemma.py`); el repo distribuye código fuente en `.tar.gz` y librerías `.so` |

## Arquitectura y entrenamiento

El repositorio no documenta la arquitectura del modelo, sino la del runtime. El código corresponde a un fork de llama.cpp que añade dos rutas de inferencia de texto (`gemma4.cpp`, `gemma4-assistant.cpp`) y dos grafos de codificador de audio (`clip_graph_gemma4a`, `clip_graph_gemma4ua`) dentro del subsistema `mtmd` (multimodal). El pipeline de audio incluye preprocesadores con filtros mel y soporte de streaming, lo que indica procesamiento incremental de audio en lugar de segmentación completa previa.

No se proporcionan datos de entrenamiento: ni número de tokens, ni composición del dataset, ni si hubo RLHF, DPO o etapas de alineación. Tampoco se detallan innovaciones de decodificación (decodificación especulativa, atención lineal, etc.). El único detalle técnico verificable es la ruta de conversión a GGUF para `Gemma4ForConditionalGeneration` y la compilación con `GGML_CUDA=ON`, `CMAKE_CUDA_ARCHITECTURES=75` y `BUILD_SHARED_LIBS=ON`, orientada a T4.

## Capacidades

- Inferencia de texto con los modelos `gemma4` y `gemma4-assistant` mediante `llama-server`.
- Entrada de audio: codificadores `gemma4a` y `gemma4ua`, con preprocesado mel y streaming.
- Servidor compatible con OpenAI que acepta partes de contenido `input_audio` en las peticiones.
- Conversión de pesos a GGUF mediante `conversion/gemma.py` (`Gemma4Model`).
- Carga de proyector multimodal separado vía `--mmproj` (`mmproj-F16.gguf`).
- Ejecución con offload completo a GPU mediante `-ngl 99`.
- No se documentan capacidades de tool calling, function calling, agentes, visión ni modo de razonamiento explícito.

## Casos de uso

- Reproducción del entorno de inferencia de AGIWS: extraer `src/llama-cpp-src.tar.gz`, compilar con los flags indicados y ejecutar `llama-server` con los GGUF correspondientes, útil para replicar resultados en una T4.
- Despliegue de un endpoint compatible con OpenAI con entrada de audio: el servidor acepta `input_audio` como parte del contenido, lo que permite integrarlo en clientes que ya usan el esquema de la API de OpenAI sin adaptadores adicionales.
- Transcripción o comprensión de audio en streaming: los preprocesadores `gemma4a`/`gemma4ua` con filtros mel y soporte de streaming permiten alimentar audio de forma incremental en lugar de esperar a la grabación completa.
- Auditoría de código de inferencia: al incluir el árbol de fuentes completo sin `.git`, se puede revisar la implementación de los grafos de audio y de los modelos de texto para validar comportamiento antes de desplegar.
- Verificación de artefactos de build: `lib/BUILD_INFO.txt` incluye compilador, versión de CUDA, hash de la instantánea y sha256 de cada artefacto, lo que facilita la trazabilidad en pipelines de CI/CD.
- Prototipado en Google Colab con GPU T4: los binarios precompilados para `sm_75` y las instrucciones de compilación permiten levantar el servidor en un entorno gratuito sin compilar manualmente las dependencias CUDA.
- Integración de audio en asistentes conversacionales: combinando `gemma4-assistant` con el codificador de audio, se puede construir un asistente que reciba voz y devuelva texto a través del endpoint HTTP.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- GPU objetivo de los binarios incluidos: NVIDIA T4 (arquitectura `sm_75`), compilados con `CMAKE_CUDA_ARCHITECTURES=75`.
- Para otras GPU es necesario recompilar con la arquitectura correspondiente; el binario precompilado no es portable a `sm_80`, `sm_86`, `sm_89` o `sm_90` sin recompilación.
- VRAM estimada: no disponible. El ejemplo de la model card usa un GGUF Q4_K_M de un modelo etiquetado como 12B más un `mmproj` F16, pero no se publican cifras de consumo.
- Contexto de ejemplo: 4096 tokens (`-c 4096`), sin datos de throughput ni latencia.
- Offload: `-ngl 99` (todas las capas a GPU en el ejemplo).
- Opciones de despliegue: `llama-server` del propio fork; no se documenta compatibilidad con vLLM, TGI, Ollama ni otras herramientas.
- Artefactos requeridos en tiempo de ejecución: `llama-server`, `libllama.so*`, `libmtmd.so*`, `libggml-base`, `libggml-cpu`, `libggml-cuda` y `libggml`.
- Configuración de build del ejemplo: `CMAKE_BUILD_TYPE=Release`, `GGML_CUDA=ON`, `GGML_NATIVE=OFF`, `BUILD_SHARED_LIBS=ON`, `LLAMA_CURL=OFF`, tests y ejemplos desactivados.

## Comparativa con modelos similares

| Proyecto | Tipo | Pesos incluidos | Audio | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `agiws/gemma4-llama-cpp` | Fork de llama.cpp con soporte Gemma 4 + audio | No | Sí (`mtmd-audio`) | No disponible | Público en HF, 0 descargas |
| llama.cpp upstream (ggerganov/llama.cpp) | Runtime de inferencia GGUF | No | Parcial, según soporte upstream de `mtmd` | MIT (upstream) | Público, ampliamente adoptado |
| Repositorio oficial de Gemma (Google) | Pesos y model card del modelo base | Sí | Según variante | Términos de Gemma | Público en Kaggle/HF |

No se dispone de datos de rendimiento del fork que permitan una comparación cuantitativa con upstream ni con otras implementaciones.

## Limitaciones y advertencias

- El repositorio no contiene pesos del modelo; es solo código y binarios. Sin los GGUF (`gemma-4-12b-it-Q4_K_M.gguf`, `mmproj-F16.gguf`) no se puede ejecutar nada.
- Licencia no declarada: no hay información sobre condiciones de uso comercial, redistribución o modificación del fork. Verificar antes de cualquier uso en producción.
- Los binarios `.so` y `llama-server` están compilados exclusivamente para T4 (`sm_75`); en otras GPU fallarán o requerirán recompilación.
- El fork es privado en origen; la instantánea no incluye `.git`, por lo que no hay historial de cambios ni posibilidad de rastrear divergencias con upstream más allá del hash en `BUILD_INFO.txt`.
- No hay model card del modelo `gemma4` en sí: se desconocen sesgos, tasa de alucinación, cobertura idiomática y limitaciones de contexto.
- El repositorio tiene 0 descargas y 0 likes, sin validación comunitaria; el soporte de audio en `mtmd` es específico de este fork y puede no ser compatible con otras herramientas del ecosistema.
- No se documentan garantías de estabilidad de la API del servidor ni del formato de las partes `input_audio`.
- El tamaño del repo es 0.0 GB según HF, lo que puede indicar que los artefactos pesados no están efectivamente alojados o que la medición no los refleja; conviene verificar la integridad de los ficheros antes de confiar en ellos.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/agiws/gemma4-llama-cpp
- llama.cpp upstream: https://github.com/ggerganov/llama.cpp
- Documentación de llama.cpp sobre `mtmd` (multimodal): https://github.com/ggerganov/llama.cpp/tree/master/tools/mtmd
- Especificación de la API de OpenAI (esquema `input_audio`): https://platform.openai.com/docs/api-reference
- No se han encontrado papers, blogs, demos ni repositorios adicionales en la información proporcionada.
