# cukrus/redline-tiny-npu

## Resumen

redline-tiny-npu es un repositorio de programas compilados para la NPU AMD XDNA2 (arquitectura Strix, 32 núcleos AIE) que permiten ejecutar el modelo de generación y edición de imágenes Qwen-Image-2.1-Turbo sobre la NPU integrada en portátiles con procesador AMD Ryzen AI bajo Windows. Lo desarrolla el usuario cukrus (Cukrus-directive) y no contiene pesos de modelo: es un paquete de artefactos binarios (ficheros ELF fusionados, xclbin, flujos de instrucciones y metadatos de compilación) que la aplicación redline-tiny descarga y verifica contra un `manifest.json` con tamaños y SHA-256.

El problema que resuelve es la ausencia de soporte práctico para ejecutar difusión de imágenes de forma local en la NPU de estos equipos: el autor compila a mano los kernels con mlir-aie v1.4.4 (IRON) y Peano/llvm-aie 22.0.0.2026092101, y los empaqueta en programas fusionados por etapa del DiT para evitar cambios de contexto entre pasos. El repositorio ocupa 0,3 GB y está verificado en Ryzen AI 9 HX 375 y Ryzen AI 7 350 con driver NPU 32.0.20102.

Es relevante ahora porque demuestra una vía concreta de inferencia de un modelo de imagen de gran tamaño (text encoder Qwen3-VL-8B más DiT y VAE) sobre hardware de consumo sin GPU dedicada, aunque con una salvedad importante: los pesos del modelo base están bajo Qwen Research License (solo uso no comercial), mientras que este repositorio se publica bajo Apache-2.0.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Programas compilados para NPU AMD XDNA2 (Strix), 32 núcleos AIE; ejecutan el pipeline de Qwen-Image-2.1-Turbo (text encoder Qwen3-VL-8B, DiT y VAE) |
| Parámetros totales | no disponible (no se incluyen pesos; el modelo base es Qwen-Image-2.1-Turbo) |
| Parámetros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (el instalador empaqueta los ficheros oficiales de Qwen-Image-2.1-Turbo para la NPU) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 (el modelo base Qwen-Image-2.1-Turbo usa Qwen Research License, solo uso no comercial) |
| Formato de pesos | No contiene pesos. Artefactos: `final.xclbin`, `insts.bin`, `meta.json`, ELF fusionados (`dit_step1_v7.elf`, `dit_cached_v7.elf`), `manifest.json` |

## Arquitectura y entrenamiento

Este repositorio no entrena ningún modelo: distribuye artefactos de compilación para la NPU. El pipeline que ejecuta corresponde a Qwen-Image-2.1-Turbo, un modelo de difusión con text encoder Qwen3-VL-8B (torre de visión y modelo de lenguaje), un transformer de difusión (DiT) y un decodificador VAE. La descomposición en programas es la siguiente: 38 programas para el text encoder, 1 ELF fusionado para el paso 1 de una edición, 1 ELF fusionado para los pasos 2 a 8, 24 programas para el paso 1 de text-to-image (atención una vez por bucket de longitud de prompt) y 64 programas para el decodificador VAE.

La innovación técnica principal es el empaquetado en ELF fusionados: un ELF contiene una etapa completa del DiT en un único contexto de hardware, de modo que los kernels de un paso se ejecutan sin cambios de contexto. Además, la atención lee en tiempo de ejecución el número de claves válidas, por lo que un único ELF sirve para cualquier longitud de prompt. Cada carpeta de programa incluye `final.xclbin` (programa que ejecutan los núcleos AIE), `insts.bin` (flujo de instrucciones de movimiento de datos y parámetros), `meta.json` (diseño y argumentos de compilación para reconstruirlo exactamente) y, solo en VAE, `final.prj/cdo_main/*.bin` para verificar que todas las formas de tensor de un kernel comparten un programa. La compilación usa mlir-aie v1.4.4 (IRON) y Peano/llvm-aie 22.0.0.2026092101, con destino `npu2`. No se dispone de información sobre datos de entrenamiento, tokens ni técnicas de alineación del modelo base.

## Capacidades

- Edición de imágenes guiada por texto (image editing) sobre la NPU del portátil, con un paso inicial dedicado y pasos 2 a 8 en un ELF fusionado.
- Generación de imágenes a partir de texto (text-to-image), con atención precompilada por bucket de longitud de prompt.
- Codificación de texto y visión mediante Qwen3-VL-8B, empaquetado en 38 programas para la NPU.
- Decodificación VAE en 64 programas especializados.
- Verificación de integridad de los artefactos mediante `manifest.json` (tamaño y SHA-256 de cada fichero).
- Reconstrucción reproducible de cada programa a partir de `meta.json` y de las fuentes en `kernels/`.
- Soporte de tool calling, agentes, razonamiento multi-paso, audio o modo thinking: no disponible (no es un modelo de lenguaje con interacción; es un paquete de ejecución para un modelo de imagen).

## Casos de uso

- Edición de fotos local en portátil Windows con Ryzen AI: la aplicación redline-tiny descarga este repositorio, verifica cada fichero con el manifiesto y ejecuta el pipeline de edición sobre la NPU, sin GPU dedicada ni subida de imágenes a la nube.
- Generación de imágenes a partir de texto en local: útil para prototipado de ilustraciones o material gráfico en entornos con requisitos de privacidad, aprovechando los programas de atención por bucket de longitud de prompt.
- Evaluación de la NPU XDNA2 como plataforma de inferencia: el repositorio sirve como referencia para medir latencia y viabilidad de un pipeline de difusión completo (text encoder de 8B, DiT y VAE) en 32 núcleos AIE.
- Investigación en compilación para aceleradores: `meta.json` y las fuentes en `kernels/` permiten reproducir y modificar los diseños con mlir-aie, útil para estudiar fusión de kernels y reducción de cambios de contexto.
- Integración en aplicaciones de escritorio: el instalador automatiza la descarga y el empaquetado de los pesos oficiales para la NPU del equipo, lo que simplifica el despliegue en flotas de portátiles Ryzen AI homologados.
- Desarrollo de flujos de edición por pasos: la separación entre el paso 1 de edición y los pasos 2 a 8 facilita experimentar con estrategias de muestreo y caché dentro de la aplicación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card remite a la Space `cukrus/redline-tiny` para benchmarks, pero no se incluyen cifras en los datos proporcionados.

## Requisitos de hardware

- NPU AMD XDNA2 (Strix) con 32 núcleos AIE; destino de compilación `npu2`.
- Verificado en Ryzen AI 9 HX 375 y Ryzen AI 7 350, con driver NPU 32.0.20102.
- Sistema operativo: Windows (según la descripción de la aplicación).
- VRAM: no aplica directamente; la ejecución es sobre NPU. No se especifica memoria del sistema requerida.
- GPU dedicada: no necesaria para el pipeline descrito.
- Despliegue: aplicación redline-tiny (instalador que descarga este repositorio y los pesos oficiales de Qwen/Qwen-Image-2.1-Turbo y los empaqueta para la NPU). No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.
- Espacio en disco del repositorio: 0,3 GB (sin contar los pesos del modelo base, que se descargan aparte).

## Comparativa con modelos similares

| Modelo | Tipo | Hardware objetivo | Licencia | Disponibilidad |
|---|---|---|---|---|
| redline-tiny-npu (este) | Programas NPU para Qwen-Image-2.1-Turbo | NPU AMD XDNA2 (Strix) | Apache-2.0 (base: Qwen Research License, no comercial) | Hugging Face, 0 descargas, 0 likes |
| Qwen/Qwen-Image-2.1-Turbo | Modelo de difusión texto-imagen y edición | GPU (no especificado) | Qwen Research License (no comercial) | Hugging Face |
| Alternativas de difusión texto-imagen para NPU XDNA2 | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- No contiene pesos: sin la aplicación redline-tiny y la descarga de Qwen/Qwen-Image-2.1-Turbo, el repositorio no es funcional por sí mismo.
- Restricción de licencia del modelo base: Qwen-Image-2.1-Turbo se distribuye bajo Qwen Research License, solo uso no comercial; la licencia Apache-2.0 de este repositorio no habilita el uso comercial del pipeline completo.
- Dependencia estricta de hardware: solo NPU AMD XDNA2 (Strix) con 32 núcleos AIE; no funciona en otras NPU ni en GPU sin recompilación.
- Verificación limitada a dos equipos (Ryzen AI 9 HX 375 y Ryzen AI 7 350) y a una versión concreta de driver (32.0.20102); otras combinaciones pueden fallar.
- Cadena de compilación fijada a versiones concretas (mlir-aie v1.4.4, llvm-aie 22.0.0.2026092101); reconstruir con otras versiones puede producir artefactos distintos.
- Sin datos publicados de benchmarks, latencia ni calidad de salida en la información disponible.
- Idiomas soportados no disponibles; la cobertura multilingüe del text encoder no se documenta aquí.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: ecosistema muy incipiente y poca validación externa.
- Riesgo de alucinación y sesgos: no documentados para este paquete; dependen del modelo base Qwen-Image-2.1-Turbo.

## Enlaces

- Hugging Face: https://huggingface.co/cukrus/redline-tiny-npu
- Modelo base: https://huggingface.co/Qwen/Qwen-Image-2.1-Turbo
- Repositorio GitHub (aplicación, instalador, fuentes de kernels): https://github.com/Cukrus-directive/redline-tiny
- Guía de compilación: https://github.com/Cukrus-directive/redline-tiny/blob/main/docs/BUILDING.md
- Space (galería, benchmarks, funcionamiento): https://huggingface.co/spaces/cukrus/redline-tiny
- mlir-aie (AMD): https://github.com/Xilinx/mlir-aie
