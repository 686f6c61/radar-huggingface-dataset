# Felladrin/gguf-Q8_0-Comet-60B-A12B

## Resumen

Comet 60B A12B es la versión comprimida mediante CompactifAI de NVIDIA Nemotron 3.5 Super, desarrollada por Multiverse Computing. El repositorio analizado, publicado por el usuario Felladrin, contiene cuantizaciones GGUF en Q8_0 del modelo base en BF16, junto con un drafter LiLiCorr de NVIDIA convertido a GGUF para decodificación especulativa. El modelo emplea una arquitectura híbrida Nemotron-H MoE con 88 bloques (40 Mamba-2, 40 MoE latente y 8 de atención), 256 expertos con 22 activos por token, y un total de 58.886.599.680 parámetros.

La relevancia de esta ficha reside en que documenta una ruta de despliegue práctica para un modelo de ~60B en hardware de consumo y estaciones compactas: el archivo Q8_0 con cabeza MTP funciona en llama.cpp con decodificación especulativa nativa, mientras que la variante sin MTP y el drafter LiLiCorr están pensados para el runtime gufo-for-comet sobre GPUs AMD gfx1151 (Strix Halo). Los pesos son solo de texto: la torre de visión del modelo original no se ha convertido.

La licencia es OpenMDW-1.1 y el modelo está etiquetado únicamente para inglés. Este repositorio es una contribución de cuantización, no el modelo original; para detalles sobre el entrenamiento y las capacidades del modelo base debe consultarse la model card de MultiverseComputingCAI.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Nemotron-H MoE híbrida: 88 bloques (40 Mamba-2, 40 MoE latente, 8 de atención); 256 expertos, 22 activos por token |
| Parámetros totales | 58.886.599.680 (~58,9B) |
| Parámetros activos | ~12B (denominación A12B del modelo base) |
| Longitud de contexto | 131.072 tokens (valor usado en el ejemplo de gufo-for-comet; no confirmado como máximo oficial en la información disponible) |
| Tipos de cuantización | Q8_0 (este repo); BF16 y Q4_K_M en repositorios hermanos del mismo autor |
| Idiomas soportados | Inglés (en) |
| Licencia | OpenMDW-1.1 |
| Formato de pesos | GGUF (safetensors en el modelo base BF16) |

## Arquitectura y entrenamiento

El modelo base es una arquitectura híbrida Nemotron-H que combina capas Mamba-2 (state space model) con capas de mezcla de expertos latente y un pequeño conjunto de capas de atención clásica: 40 + 40 + 8 bloques respectivamente. El componente MoE cuenta con 256 expertos y activa 22 por token, lo que da lugar a la denominación A12B (aproximadamente 12B de parámetros activos sobre 58,9B totales). Comet 60B es la versión comprimida de Nemotron 3.5 Super mediante CompactifAI, la técnica de compresión de Multiverse Computing.

Los archivos de este repositorio se generaron con herramientas de llama.cpp: el GGUF con MTP mediante `llama-quantize` (build b12223) a partir del GGUF BF16 del mismo autor, y el GGUF sin MTP mediante `convert_hf_to_gguf.py --outtype q8_0 --no-mtp` (commit f477f795) desde la revisión 8df6f8a8 del repositorio BF16. El drafter Super-LiLiCorr se convirtió desde nvidia/NVIDIA-Nemotron-3.5-Super-VL-120B-A12B-NVFP4-LiLiCorr conservando los tensores NVFP4 originales y el resto en BF16 o F32. No se dispone de información sobre el dataset de entrenamiento, el número de tokens o las fases de alineación (RLHF/DPO) del modelo base en la información proporcionada.

La innovación operativa destacable es la decodificación especulativa por dos vías: la cabeza MTP propia del modelo (flag `--spec-type draft-mtp` en llama.cpp) y el drafter externo LiLiCorr en el runtime gufo. Según las pruebas del autor, la decodificación especulativa no altera la salida: con decodificación greedy se obtuvieron los mismos tokens con y sin drafter.

## Capacidades

- Generación de texto conversacional en inglés (pipeline text-generation, etiqueta conversational).
- Razonamiento y generación de código: el autor reporta pruebas con peticiones de programación en llama-server.
- Decodificación especulativa con cabeza MTP integrada (archivo `Comet-60B-A12B-Q8_0-MTP.gguf`).
- Decodificación especulativa con drafter externo LiLiCorr (archivo `Super-LiLiCorr.gguf`, solo en gufo-for-comet).
- Compatibilidad con endpoints OpenAI (`endpoints_compatible` en los tags del repo).
- Soporte de plantillas de chat vía `--jinja` en llama.cpp.
- Capacidades de visión: no disponibles en esta conversión (la torre de visión no se convirtió; todos los archivos son solo texto).
- Tool calling, function calling y razonamiento multi-paso en agentes: no confirmado en la información proporcionada.
- Capacidades multilingües: limitadas al inglés según la etiqueta de idioma del repo.

## Casos de uso

- Despliegue local en estación de trabajo con GPU AMD Strix Halo: usar gufo-for-comet con `Comet-60B-A12B-Q8_0.gguf` y el drafter `Super-LiLiCorr.gguf` permite servir el modelo con API compatible con OpenAI en `gfx1151`, con unas 23,5 tok/s de decodificación y 4 tokens de draft.
- Servicio de inferencia en cualquier GPU con llama.cpp: el archivo MTP con `llama-server -ngl 999 -fa on --jinja --spec-type draft-mtp` ofrece decodificación especulativa sin drafter externo y funciona en cualquier GPU soportada por llama.cpp.
- Asistente de programación interactivo: el autor midió 25,0 y 24,4 tok/s con decodificación greedy en una petición corta de código, con un 87% de aceptación de tokens de draft, lo que lo hace viable para autocompletado y chat de código en local.
- Procesamiento de documentos largos en inglés: con contexto configurable de hasta 131.072 tokens y un prefill medido de ~752 tok/s (10.445 tokens en 13,89 s en gufo-for-comet), es adecuado para resumen y análisis de documentos extensos.
- Backend de chat conversacional autoalojado: al ser compatible con endpoints OpenAI, puede sustituir a APIs comerciales en aplicaciones internas que requieran confidencialidad de datos.
- Evaluación e investigación de modelos comprimidos: la pareja BF16/Q8_0/Q4_K_M del mismo autor permite estudiar la degradación por cuantización de un modelo CompactifAI sobre la misma arquitectura.
- Experimentación con decodificación especulativa: la disponibilidad de dos mecanismos (MTP y LiLiCorr) y de datos de velocidad con distintos números de draft tokens (1 a 7) lo convierte en banco de pruebas para técnicas de aceleración.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K u otros) en la información disponible. Los únicos datos publicados son mediciones de velocidad del autor en un AMD Ryzen AI MAX+ 395 con Radeon 8060S (gfx1151):

| Runtime y configuración | Métrica | Valor |
|---|---|---|
| llama.cpp b12223 (Vulkan), `llama-bench -fa 1`, Q8_0 sin MTP | pp512 | 461,91 tok/s |
| llama.cpp b12223 (Vulkan), `llama-bench -fa 1`, Q8_0 sin MTP | tg128 | 16,40 tok/s |
| llama-server con `--spec-type draft-mtp`, greedy, petición corta de código | Decodificación (2 ejecuciones) | 25,0 y 24,4 tok/s; 87% de draft aceptado |
| gufo-for-comet, sin drafter | Decodificación | 15,31 tok/s |
| gufo-for-comet, `-d 1` | Decodificación | 19,29 tok/s |
| gufo-for-comet, `-d 2` | Decodificación | 22,69 tok/s |
| gufo-for-comet, `-d 3` | Decodificación | 23,22 tok/s |
| gufo-for-comet, `-d 4` | Decodificación | 23,54 tok/s |
| gufo-for-comet, `-d 7` (por defecto) | Decodificación | 21,55 tok/s |
| gufo-for-comet, prefill de 10.445 tokens | Prefill | 13,89 s (~752 tok/s) |

El autor advierte que las cifras de llama.cpp y gufo provienen de prompts distintos, por lo que la comparación entre ambos runtimes es aproximada.

## Requisitos de hardware

- VRAM estimada: el archivo Q8_0 con MTP ocupa 64.192.443.904 bytes (~59,8 GiB) y el Q8_0 sin MTP 62.706.265.440 bytes (~58,4 GiB); el drafter LiLiCorr añade 1.353.710.336 bytes (~1,26 GiB). Se necesita memoria unificada o VRAM suficiente para alojar el archivo completo más el contexto.
- GPU recomendadas: el autor solo ha validado en AMD Radeon 8060S (gfx1151, Strix Halo) con memoria unificada. Para llama.cpp, cualquier GPU soportada por el backend (Vulkan en las pruebas) puede ejecutarlo con `-ngl 999`.
- GPU de consumo: no cabe en GPUs de consumo con 24 GB o menos en Q8_0; para ese rango habría que recurrir a la cuantización Q4_K_M del mismo autor (tamaño no disponible en la información proporcionada).
- Opciones de despliegue: llama.cpp (build b12223 o superior para MTP) y gufo-for-comet, un fork de gufo con el runtime Nemotron 3.5 Bolt del PR cerrado gufo-org/gufo#899, exclusivo para AMD gfx1151. No se mencionan vLLM, TGI ni Ollama.
- Latencia y throughput: ver tabla de benchmarks; en gufo-for-comet el mejor resultado se obtuvo con 4 tokens de draft (23,54 tok/s frente a 15,31 tok/s sin drafter).
- Notas de compilación de gufo-for-comet en el equipo del autor (Ubuntu con Homebrew, ROCm 7.1.1): se usó `g++-16` de Homebrew y el clang de ROCm 7.1.1 con `-DCMAKE_HIP_FLAGS=--rocm-path=/opt/rocm-7.1.1`; hubo que pasar explícitamente las rutas de ICU 79 y los directorios pkg-config de libsndfile/libsoxr; el runtime de ROCm 7.1.1 produjo un segfault en la primera llamada HIP, por lo que en ejecución se apunta `LD_LIBRARY_PATH` a las librerías de ROCm 7.3.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Comet 60B A12B (este repo, Q8_0) | ~58,9B totales, ~12B activos | 131.072 (configurado en ejemplo) | OpenMDW-1.1 | GGUF en HF; llama.cpp y gufo-for-comet | Compresión CompactifAI de Nemotron 3.5 Super; solo texto |
| MultiverseComputingCAI/Comet_60B_A12B_BF16 (modelo base) | ~58,9B totales, ~12B activos | No disponible | OpenMDW-1.1 | Safetensors/BF16 en HF | Referencia de calidad completa; requiere mucho más hardware |
| nvidia/NVIDIA-Nemotron-3.5-Super-VL-120B-A12B-NVFP4-LiLiCorr | 120B (según nombre) | No disponible | No disponible | NVFP4 en HF | Modelo original de NVIDIA con torre de visión; fuente del drafter LiLiCorr |
| Felladrin/gguf-Q4_K_M-Comet-60B-A12B | ~58,9B totales, ~12B activos | No disponible | OpenMDW-1.1 | GGUF en HF | Misma familia, cuantización menor para hardware más limitado |

No se dispone de datos de rendimiento comparativo entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- Solo texto: la torre de visión del modelo original no se convirtió, por lo que no hay capacidades multimodales en estos GGUF.
- Idioma: etiquetado únicamente como inglés; el rendimiento en castellano u otros idiomas no está documentado.
- Alucinación y sesgos: no hay información publicada en la documentación disponible sobre sesgos conocidos ni tasas de alucinación del modelo base.
- Licencia OpenMDW-1.1: debe revisarse el texto completo de la licencia antes de un uso comercial; la model card original está truncada en el punto de créditos y licencia.
- El archivo sin MTP (`Comet-60B-A12B-Q8_0.gguf`) no incluye la cabeza MTP porque el runtime Nemotron de gufo la rechaza; usar el archivo MTP con gufo no es una opción válida.
- gufo-for-comet solo funciona en GPUs AMD gfx1151 (Strix Halo); fuera de ese hardware debe usarse llama.cpp.
- El soporte MTP requiere llama.cpp build b12223 o superior.
- El drafter LiLiCorr conserva tensores en NVFP4, BF16 y F32 mezclados; la conversión no unifica el tipo de todos los tensores.
- Las cifras de rendimiento provienen de un único equipo (Ryzen AI MAX+ 395) y de prompts distintos entre runtimes, por lo que no deben extrapolarse directamente.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: es una contribución reciente (creado el 2026-11-08) sin validación comunitaria amplia.
- El repositorio ocupa 128,3 GB, lo que exige espacio en disco considerable aunque solo se descargue uno de los archivos Q8_0.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Felladrin/gguf-Q8_0-Comet-60B-A12B
- Modelo base BF16: https://huggingface.co/MultiverseComputingCAI/Comet_60B_A12B_BF16
- Versión BF16 GGUF del mismo autor: https://huggingface.co/Felladrin/gguf-BF16-Comet-60B-A12B
- Versión Q4_K_M del mismo autor: https://huggingface.co/Felladrin/gguf-Q4_K_M-Comet-60B-A12B
- Modelo NVIDIA fuente del drafter: https://huggingface.co/nvidia/NVIDIA-Nemotron-3.5-Super-VL-120B-A12B-NVFP4-LiLiCorr
- Runtime gufo-for-comet: https://github.com/felladrin/gufo-for-comet
- gufo (runtime original): https://github.com/gufo-org/gufo
- PR con el runtime Nemotron 3.5 Bolt: https://github.com/gufo-org/gufo/pull/899
- llama.cpp: https://github.com/ggml-org/llama.cpp
- Release de llama.cpp b12223: https://github.com/ggml-org/llama.cpp/releases/tag/b12223
- Multiverse Computing: https://www.multiversecomputing.com
