# rmonsurate/llama.cpp-victoria

## Resumen

`rmonsurate/llama.cpp-victoria` no es un modelo de lenguaje, sino una distribución de llama.cpp (runtime de inferencia) basada en el build upstream b11276 a la que se ha añadido un único parche: el soporte de la draft head (NextN/MTP) para la arquitectura `qwen4exp`. Sin ese parche, llama.cpp aborta al cargar los ficheros GGUF de Victoria con el error `wrong number of tensors; expected 1256, got 1224`, porque el grafo esperado no incluye las 32 decenas de tensores de la cabeza especulativa.

El objetivo del repositorio es permitir que los GGUF de Victoria (publicados aparte en `rmonsurate/Victoria`) se carguen y utilicen su draft head para decodificación especulativa en llama.cpp, sin necesidad de recompilar desde cero. El repositorio distribuye binarios precompilados para Windows (x64 y arm64), Linux (x64 y arm64) y macOS (Apple Silicon con Metal e Intel por CPU), con variantes CUDA 12.4, 12.8 y 13.4, además del fichero de parche `victoria-draft-mtp-b11276.patch` aplicable contra el commit upstream `19e28a277`.

Es relevante ahora porque adelanta una capacidad (draft head MTP) que el autor tiene intención de enviar a upstream: en una prueba sobre un Apple M3 Max con 128 GB, activar la cabeza subió la generación de 26,8–27,8 tok/s a 34,3–38,0 tok/s con una tasa de aceptación del 70,4 % de los tokens propuestos. El repositorio tiene 0 descargas y 0 likes en el momento de la consulta y un tamaño de 3,7 GB, correspondiente a los binarios empaquetados.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | No es un modelo: es llama.cpp (runtime C/C++) con un parche que implementa la draft head (NextN/MTP) para la arquitectura `qwen4exp` |
| Parámetros totales | no disponible |
| Parámetros activos | no disponible |
| Longitud de contexto | no disponible para el modelo; los ejemplos de `llama-server` del autor usan `-c 8192` |
| Tipos de cuantización | GGUF; el conjunto recomendado por el autor se identifica como `victoria-s410-bitexact-tbl8` (no se detallan más esquemas) |
| Idiomas soportados | no disponible |
| Licencia | MIT (licencia de llama.cpp, incluida en cada zip) |
| Formato de pesos | El repositorio no contiene pesos: contiene binarios compilados (`.zip`, `.tar.gz`) y un parche `.patch`. Los pesos asociados son GGUF, alojados en `rmonsurate/Victoria` |

## Arquitectura y entrenamiento

Este repositorio no entrena ni define un modelo. Lo que aporta es una rama de llama.cpp, `qwen4exp-draft-mtp` en `https://github.com/rmonsurate/llama.cpp`, que añade al build upstream b11276 el soporte de carga y ejecución de la draft head (NextN/MTP) para la arquitectura `qwen4exp`. Esa cabeza es la que habilita la decodificación especulativa con `--spec-type draft-mtp` en `llama-server`, y sin ella el cargador de tensores rechaza los GGUF de Victoria porque encuentra 1224 tensores donde espera 1256 (32 tensores de cabeza descartados).

No hay información sobre datos de entrenamiento, número de tokens, composición del dataset ni fases de alineación (RLHF/DPO), porque el repositorio no es un artefacto de entrenamiento. La innovación técnica concreta es un parche de compatibilidad de tensores más el enganche de la cabeza MTP al bucle de decodificación especulativa. El parche fue generado contra el commit upstream `19e28a277` (b11276) y, según el autor, puede aplicar también a commits más recientes. Los binarios se construyeron con el flujo de release propio de llama.cpp en GitHub Actions, con un commit adicional de workflow, por lo que `llama-server --version` informa del build 11278 y del commit `0ed8358`.

## Capacidades

- Ejecución de inferencia local de los GGUF de Victoria con llama.cpp, incluyendo la carga de su draft head `qwen4exp`.
- Decodificación especulativa con la cabeza MTP mediante `--spec-type draft-mtp --spec-draft-n-max 3`, con una tasa de aceptación medida del 70,4 % de los tokens propuestos.
- Modo degradado: con la cabeza desactivada, el runtime imprime una advertencia por cada uno de los 32 tensores de cabeza no usados y los omite, siguiendo la ejecución sin decodificación especulativa.
- Distribución multiplataforma: Windows x64 (CUDA 12.4 y 13.4, CPU, arm64 CPU y arm64 CUDA 13.4), Linux x64 y arm64 (CUDA 12.8 y 13.4, CPU), macOS Apple Silicon con Metal y macOS Intel solo CPU.
- Compilación desde fuente de la rama `qwen4exp-draft-mtp` con CMake (`-DGGML_CUDA=ON` para NVIDIA; Metal activo por defecto en Mac).
- Aplicación del parche sobre un checkout propio de llama.cpp mediante `git am victoria-draft-mtp-b11276.patch`.
- No se declaran capacidades de tool calling, agentes, visión, audio ni multilingüismo para este repositorio: dependen del modelo Victoria subyacente, del que no se aportan datos.

## Casos de uso

- Despliegue local en Apple Silicon: cargar el conjunto GGUF de Victoria con `llama-server` en un M3 Max de 128 GB y activar la cabeza MTP para pasar de 26,8–27,8 tok/s a 34,3–38,0 tok/s en una petición concurrente, aprovechando la memoria unificada para alojar los 107,20 GB de pesos.
- Servicio de inferencia en Windows con GPU NVIDIA: usar el binario `llama-victoria-mtp-b11276-bin-win-cuda-12.4-x64.zip` (o la variante CUDA 13.4) más el `cudart` correspondiente para exponer los GGUF de Victoria como servicio HTTP con `llama-server`, sin recompilar llama.cpp.
- Servidores Linux x64 o arm64 con aceleración CUDA: emplear los paquetes `ubuntu-cuda-12.8` o `ubuntu-cuda-13.4` en nodos con GPU NVIDIA, útil para entornos de laboratorio que ya tienen CUDA instalado y quieren evaluar el draft head antes de que llegue a upstream.
- Entornos air-gapped o con requisitos de licencia permisiva: al distribuirse bajo MIT e incluir binarios precompilados, permite desplegar inferencia local sin dependencias de servicios en la nube ni de repositorios de paquetes externos.
- Ablación y evaluación del draft head: comparar la ejecución con y sin `--spec-type draft-mtp` sobre el mismo prompt y contexto (`-c 8192`) para medir el impacto real en velocidad y tasa de aceptación antes de adoptar la cabeza en producción.
- Desarrollo y contribución a llama.cpp: clonar la rama o aplicar el parche a un checkout propio para probar el soporte NextN/MTP de `qwen4exp`, validarlo en otras plataformas y preparar su envío a upstream.
- Validación en plataformas sin GPU: usar los binarios CPU (Windows x64/arm64, Linux x64/arm64, macOS Intel) para verificar que la decodificación especulativa funciona correctamente en modo solo CPU, aunque el autor no reporta cifras de rendimiento para ese caso.
- Punto de partida para pipelines de CI que necesiten ejecutar los GGUF de Victoria de forma reproducible: fijar el build 11276/11278 y el commit `0ed8358` garantiza que el comportamiento del cargador de tensores no cambia entre ejecuciones.

## Benchmarks y rendimiento

Los únicos datos publicados en la información disponible son mediciones del propio autor en un Apple M3 Max con 128 GB de memoria unificada, una petición a la vez:

| Configuración | Velocidad de generación | Tasa de aceptación de borradores |
|---|---|---|
| Cabeza desactivada (dos ejecuciones) | 26,8 – 27,8 tok/s | no aplica |
| Cabeza activada, `--spec-draft-n-max 3` (dos ejecuciones) | 34,3 – 38,0 tok/s | 70,4 % de los tokens propuestos aceptados |

No hay resultados de MMLU, HumanEval, GSM8K ni de ningún otro benchmark de calidad en la información disponible. El autor indica explícitamente que el rendimiento en CUDA no se ha medido.

## Requisitos de hardware

- Espacio y memoria: el conjunto GGUF recomendado por el autor (`victoria-s410-bitexact-tbl8`, tres fragmentos) ocupa 107,20 GB, por lo que se necesita al menos esa cantidad de memoria unificada o VRAM, además del espacio libre equivalente en disco. El repositorio de binarios ocupa 3,7 GB aparte.
- GPU consumer: no cabe en GPUs de consumo con 24 GB de VRAM (RTX 4090, 3090, etc.) usando el conjunto indicado; no se publican cuantizaciones más agresivas que reduzcan el requisito.
- GPU de centro de datos: no hay cifras de rendimiento para A100, H100 u otras; el autor afirma no haber medido CUDA todavía. Los binarios cubren CUDA 12.4, 12.8 y 13.4.
- Apple Silicon: medido en un M3 Max con 128 GB de memoria unificada mediante los binarios macOS arm64 con Metal (activado por defecto). Es la única plataforma con cifras publicadas.
- CPU solo: hay binarios para Windows x64/arm64, Linux x64/arm64 y macOS Intel, pero no se publican latencias ni throughput para estos casos.
- Despliegue: `llama-server` es el binario documentado en los ejemplos del autor, con `-ngl 99 -fa on -c 8192` y las opciones de decodificación especulativa. No se mencionan soportes para vLLM, TGI, Ollama ni otros motores.
- Latencia y throughput: única referencia, 34,3–38,0 tok/s en M3 Max de 128 GB con la cabeza activa y una sola petición concurrente. No hay datos de latencia de primer token, concurrencia ni escalado multi-GPU.

## Comparativa con modelos similares

La comparación relevante es entre runtimes que cargan los GGUF de Victoria, no entre modelos:

| Aspecto | rmonsurate/llama.cpp-victoria | llama.cpp upstream (b11276 sin parche) | Otros motores (vLLM, TGI, Ollama) |
|---|---|---|---|
| Carga de GGUF de Victoria | Sí, incluye la draft head `qwen4exp` | No: falla con `wrong number of tensors; expected 1256, got 1224` | no disponible |
| Decodificación especulativa MTP | Sí, `--spec-type draft-mtp` | no disponible | no disponible |
| Plataformas con binario | Windows x64/arm64, Linux x64/arm64, macOS arm64 (Metal) y x64 (CPU) | Según release oficial de llama.cpp | no disponible |
| Licencia | MIT | MIT | no disponible |
| Mantenimiento | Rama personal, aún no enviada a upstream | Proyecto upstream con releases periódicos | no disponible |
| Rendimiento publicado | 34,3–38,0 tok/s en M3 Max 128 GB, 70,4 % de aceptación | no disponible para estos GGUF | no disponible |

No se dispone de comparativas con modelos de la misma categoría porque el repositorio no contiene un modelo: los datos de pesos, contexto y calidad corresponderían a `rmonsurate/Victoria`, de los que la información proporcionada no incluye cifras.

## Limitaciones y advertencias

- No es un modelo de lenguaje: cualquier afirmación sobre sesgos, alucinación, idiomas o calidad de generación corresponde al modelo Victoria subyacente, del que no se aportan datos en esta información.
- Repositorio sin adopción: 0 descargas y 0 likes, creado y actualizado el 2026-09-30, por lo que no hay validación independiente del parche.
- Estado no upstream: el parche aún no está fusionado. El propio autor recomienda usar un release oficial de llama.cpp cuando soporte la cabeza, en lugar de este repositorio.
- Fragilidad frente a cambios: el parche se generó contra el commit upstream `19e28a277` (b11276) y puede fallar al aplicarse sobre commits posteriores.
- Comportamiento esperado que puede confundirse con un error: con la cabeza desactivada, llama.cpp imprime una advertencia por cada uno de los 32 tensores de cabeza no utilizados y los omite.
- Rendimiento sin verificar fuera de Apple Silicon: el autor reconoce explícitamente que no ha medido CUDA, por lo que las cifras de M3 Max no son extrapolables a GPUs NVIDIA.
- Requisito de memoria elevado: el conjunto GGUF recomendado ocupa 107,20 GB, lo que descarta su uso en GPUs de consumo de 24 GB con las cuantizaciones publicadas.
- Dependencia de versiones de CUDA: para CUDA 12.4 en Windows se requiere un driver compatible con 12.4 o superior, y para las variantes 13.4, un driver de CUDA 13.
- Licencia: MIT, permisiva para uso comercial. Se debe conservar el fichero `LICENSE` incluido en cada zip. La licencia del modelo Victoria puede ser distinta y no se especifica aquí.
- Los binarios se construyeron con un commit adicional de workflow sobre la rama, de ahí que el build reportado sea 11278 y no 11276, pese a corresponder al mismo código funcional.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/rmonsurate/llama.cpp-victoria
- Modelo Victoria (pesos GGUF asociados): https://huggingface.co/rmonsurate/Victoria
- Repositorio GitHub de la rama con el parche: https://github.com/rmonsurate/llama.cpp (rama `qwen4exp-draft-mtp`)
- Release con los binarios: https://github.com/rmonsurate/llama.cpp/releases/tag/victoria-mtp-b11276
- Fichero de parche: `victoria-draft-mtp-b11276.patch`, incluido en el repositorio de HuggingFace y en la release de GitHub
- No se han encontrado papers, blogs ni demos adicionales en los resultados de búsqueda web disponibles.
