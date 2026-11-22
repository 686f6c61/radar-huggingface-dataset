# ciafierui/strata-qwen38-a100-cache

## Resumen

`strata-qwen38-a100-cache` es un repositorio de artefactos de despliegue publicado por el usuario `ciafierui` en Hugging Face. No contiene pesos de un modelo de lenguaje en sentido estricto, sino un conjunto de cachés de runtime precompiladas para ejecutar el motor de inferencia `Niko1221/Strata` (versión `v0.2.9`, commit `c62d5e3`) sobre GPU NVIDIA A100 con arquitectura `sm_80`, CUDA 13 y Ubuntu 24.04 x86_64.

El paquete está pensado para acelerar el arranque de `Strata` con el modelo cuantizado `ISTA-DASLab/Qwen3.8-Flash-Next-GSQ-RCO-GGUF` en formato `IQ3_S` (revisión `d4af3be`) y con soporte de visión en GPU (`--vision gpu`). Incluye el binario del motor (`strata`), el ejecutable de visión (`strata-vision`), la biblioteca `libstrata_kq.so` y un `BUILD.json` que declara `archs=[80]` y `vision=gpu`, además de un directorio de datos de runtime con los packs `iq3_s` y `mtp/rt/`.

Su relevancia es operativa: evita recompilar el motor y re-preparar los packs de cuantización en cada despliegue sobre A100, reduciendo el tiempo de puesta en marcha y garantizando que los artefactos corresponden a una revisión concreta. El tamaño del repositorio es de 2,0 GB y la licencia declarada es Apache-2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (el repositorio empaqueta el runtime `Strata` v0.2.9, no define arquitectura propia) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | IQ3_S (GGUF, del modelo `ISTA-DASLab/Qwen3.8-Flash-Next-GSQ-RCO-GGUF`) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (cuantizacion IQ3_S) empaquetado en archivos `.tar.zst` junto a binarios compilados |

## Arquitectura y entrenamiento

Este repositorio no entrena ni publica un modelo base. Contiene dos archivos comprimidos: `strata-v029-sm80-engine.tar.zst`, con el directorio `engine/` precompilado (`strata`, `strata-vision`, `libstrata_kq.so`, `BUILD.json` con `archs=[80]` y `vision=gpu`), y `strata-v029-iq3s-data.tar.zst`, con el runtime `Strata-data/` preparado (`packs/iq3_s/` y `mtp/rt/`). Se acompaña de `SHA256SUMS` con los digests SHA-256 de ambos archivos.

El motor `Strata` (proyecto `Niko1221/Strata`, versión `v0.2.9`, commit `c62d5e3`) se compila específicamente para `sm_80`, es decir, GPUs Ampere como la A100, con CUDA 13 y Ubuntu 24.04 x86_64. El modelo subyacente es `Qwen3.8-Flash-Next` en su variante GSQ-RCO cuantizada a `IQ3_S` (revisión `d4af3be`), y el runtime declara soporte de visión acelerada por GPU. No se dispone de información sobre datos de entrenamiento, número de tokens, composición del dataset ni técnicas de alineación (RLHF/DPO) en la información proporcionada.

## Capacidades

- Ejecución de inferencia del modelo `Qwen3.8-Flash-Next` en cuantización `IQ3_S` mediante el motor `Strata`.
- Soporte de visión en GPU (`--vision gpu`) a través del binario `strata-vision`.
- Packs de runtime prepreparados (`packs/iq3_s/`, `mtp/rt/`) para evitar la fase de preparación en el arranque.
- Artefactos compilados solo para `sm_80` (A100), según `BUILD.json` con `archs=[80]`.
- Verificación de integridad mediante `SHA256SUMS`.
- Capacidades específicas del modelo subyacente (tool calling, agentes, multilingüismo, thinking mode): no disponibles en la información proporcionada.

## Casos de uso

- Despliegue reproducible en clústeres A100: usar los archivos `.tar.zst` para arrancar `Strata` v0.2.9 sin recompilar el motor en cada nodo, validando integridad con `SHA256SUMS` antes de extraer.
- Inferencia con visión en GPU: emplear `strata-vision` con `--vision gpu` para tareas que requieran procesar imágenes junto al modelo `Qwen3.8-Flash-Next` cuantizado a `IQ3_S`.
- Entornos de CI/CD con hardware fijo: fijar la revisión `c62d5e3` del motor y `d4af3be` del modelo para garantizar que los artefactos desplegados coinciden exactamente con los validados.
- Laboratorios de investigación con A100: disponer de un runtime precompilado para `sm_80` que reduce el tiempo de puesta en marcha en experimentos repetidos.
- Réplica de entornos aislados (air-gapped): distribuir los dos archivos comprimidos y `SHA256SUMS` en redes sin acceso a compiladores ni a Hugging Face en tiempo de ejecución.
- Benchmarking de cuantización `IQ3_S`: comparar el rendimiento del pack `iq3_s` frente a otras cuantizaciones del mismo modelo usando el mismo motor y hardware.
- Base para imágenes de contenedor: integrar los artefactos extraídos en una imagen Docker basada en Ubuntu 24.04 con CUDA 13 y drivers compatibles con `sm_80`.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- GPU: NVIDIA A100 exclusivamente (`sm_80`); el `BUILD.json` declara `archs=[80]`, por lo que no se garantiza funcionamiento en otras arquitecturas.
- VRAM estimada: no disponible en la información proporcionada.
- Software: CUDA 13 y Ubuntu 24.04 x86_64.
- Cabe en GPU de consumo: no disponible; la compilación está restringida a `sm_80`, lo que excluye GPUs consumer con otras arquitecturas de cómputo salvo que se recompile el motor.
- Opciones de despliegue: extracción de los archivos `.tar.zst` y ejecución directa de los binarios `strata` y `strata-vision`; no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. El repositorio no publica un modelo propio, sino artefactos de runtime para un modelo de terceros, por lo que no existe una categoría comparable directa en la información proporcionada.

## Limitaciones y advertencias

- No es un modelo entrenado: es un paquete de cachés de runtime; no debe evaluarse como modelo base ni citarse como tal.
- Restricción de hardware: compilado únicamente para `sm_80` (A100); no funcionará en GPUs con otra arquitectura de cómputo sin recompilación.
- Dependencia de versiones concretas: motor `v0.2.9` (commit `c62d5e3`) y modelo `IQ3_S` (revisión `d4af3be`); cambios de revisión pueden invalidar los packs.
- Sin métricas de calidad: no hay benchmarks, evaluaciones ni datos de rendimiento publicados.
- Sin información sobre sesgos, alucinación o limitaciones idiomáticas del modelo subyacente en la información proporcionada.
- Licencia Apache-2.0 declarada para el repositorio; conviene verificar las licencias del motor `Strata` y del modelo `Qwen3.8-Flash-Next` antes de uso comercial.
- Repositorio sin descargas ni likes en el momento de la consulta, lo que limita la validación por parte de la comunidad.
- Integridad: verificar siempre `SHA256SUMS` antes de extraer los archivos.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/ciafierui/strata-qwen38-a100-cache
- Motor `Strata`: https://huggingface.co/Niko1221/Strata
- Modelo cuantizado `ISTA-DASLab/Qwen3.8-Flash-Next-GSQ-RCO-GGUF`: https://huggingface.co/ISTA-DASLab/Qwen3.8-Flash-Next-GSQ-RCO-GGUF
