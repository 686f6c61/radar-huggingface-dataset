# elyanlabs/vulkan-matmul

## Resumen

`elyanlabs/vulkan-matmul` no es un modelo de lenguaje: es un espejo (snapshot) en Hugging Face del repositorio de código `github.com/Scottcjn/vulkan-matmul`, que contiene prototipos de servidores de offload de multiplicación de matrices (matmul) en GPU, orientados a entornos de inferencia sobre arquitecturas IBM POWER8. El paquete incluye dos rutas de servidor: una basada en Vulkan para GPU AMD y otra basada en ROCm/rocBLAS para GPU AMD con soporte HIP, además de cabeceras de integración para POWER8 y utilidades de cliente y benchmark para validar el camino de offload.

El problema que aborda es concreto: permitir que un host de inferencia (por ejemplo, `llama.cpp` compilado con soporte de offload ROCm) delegue la matmul en una GPU AMD a través de la red, usando variables de entorno como `GGML_GPU_OFFLOAD_ROCM`, `GGML_ROCM_MATMUL_HOST`, `GGML_ROCM_MATMUL_PORT` y `GGML_ROCM_MIN_M`. Es relevante para setups poco convencionales (POWER8 ppc64le con GPU AMD, GPUs sin soporte CUDA) donde las pilas habituales de aceleración no están disponibles o no están maduras.

La ficha se ha redactado con la información pública disponible en la model card y en los archivos referenciados. Al tratarse de código y no de pesos, la mayoría de los parámetros habituales de un modelo (tamaño, contexto, cuantización, idiomas) no son aplicables y se indican como tales. El repositorio no ejecuta nada en la infraestructura de Hugging Face y no registra descargas ni interacciones en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No aplica: no es un modelo neuronal. Servidores de matmul en C++ (Vulkan y ROCm/rocBLAS) con cliente Python y scripts de build |
| Parametros totales | No aplica (no contiene pesos de modelo) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No aplica (el servidor no gestiona contexto de texto) |
| Tipos de cuantizacion | No disponible (el repositorio no documenta cuantizaciones; el ejemplo de integración usa un `model.gguf` externo con `-ngl 0`) |
| Idiomas soportados | No disponible (no es un modelo lingüístico) |
| Licencia | AGPL-3.0 |
| Formato de pesos | No aplica. Código fuente: `.cpp`, `.py`, `.sh`, `CMakeLists.txt`, documentación Markdown |

Datos adicionales del artefacto:

| Parametro | Valor |
|---|---|
| Autor / organización | elyanlabs (código original en github.com/Scottcjn) |
| Fecha de creación | 2026-10-23 |
| Última actualización | 2026-10-23 |
| Descargas | 0 |
| Likes | 0 |
| Pipeline de Hugging Face | No disponible |
| Archivos principales | `server.cpp`, `rocm_matmul_server.cpp`, `build_power8.sh`, `rocm_build.sh`, `test_client.py`, `vk_bench.py`, `powerpc/`, `BCOS.md` |
| Puertos por defecto | 8097 (servidor Vulkan), 8098 (servidor ROCm) |
| Plataforma objetivo | POWER8 (ppc64le) para la ruta Vulkan; GPU AMD con soporte HIP para la ruta ROCm |

## Arquitectura y entrenamiento

No hay entrenamiento ni arquitectura de red neuronal que describir. Lo que hay es una arquitectura de sistema cliente-servidor: un servidor nativo (`server.cpp` sobre Vulkan, o `rocm_matmul_server.cpp` sobre rocBLAS) expone una operación de matmul a través de un socket TCP, y un cliente (en el ejemplo, `llama.cpp` instrumentado con las variables `GGML_*`) envía las operaciones matriciales para que se ejecuten en la GPU. El host de inferencia controla cuántas capas se descargan con `-ngl 0` y el umbral de tamaño de matriz a partir del cual se delega con `GGML_ROCM_MIN_M` (valor de ejemplo: 2).

La ruta Vulkan está pensada para POWER8: `build_power8.sh` instala las dependencias de build si es necesario y el arranque se hace forzando el ICD de AMD para ppc64le mediante `VK_ICD_FILENAMES=/usr/share/vulkan/icd.d/radeon_icd.ppc64le.json`. La ruta ROCm usa `rocm_build.sh` con un target GFX como argumento (el ejemplo usa `gfx1012`, correspondiente a la familia RDNA1 / Navi 10), asume ROCm y `hipcc` en `/opt/rocm` salvo que se sobrescriba `ROCM_PATH`, y se apoya en CMake para el servidor Vulkan. El repositorio incluye además código de integración y soporte en `powerpc/`, con un registro de implementación (`PSE_IMPLEMENTATION_LOG.md`) y una certificación descrita en `BCOS.md`. No se documentan en la información disponible innovaciones como decodificación especulativa, atención lineal ni técnicas de entrenamiento (RLHF/DPO), porque no aplican a este artefacto.

## Capacidades

- Servir operaciones de matmul en GPU AMD mediante una API de red, con dos backends intercambiables: Vulkan y ROCm/rocBLAS.
- Offload de cómputo desde un host de inferencia hacia una GPU remota, integrable con `llama.cpp` mediante las variables `GGML_GPU_OFFLOAD_ROCM`, `GGML_ROCM_MATMUL_HOST`, `GGML_ROCM_MATMUL_PORT` y `GGML_ROCM_MIN_M`.
- Ejecución en ppc64le/POWER8 con GPU AMD a través de Vulkan, incluyendo un flujo de build específico (`build_power8.sh`).
- Ejecución en GPU AMD con soporte HIP usando rocBLAS, con compilación parametrizada por target GFX (`rocm_build.sh gfx1012`).
- Validación funcional del camino de offload mediante un cliente de humo (`test_client.py`).
- Medición de rendimiento del servidor Vulkan mediante un helper de benchmark (`vk_bench.py`, que asume el puerto 8097 por defecto).
- No incluye: generación de texto, razonamiento, código, matemáticas, visión, tool calling, capacidades de agente ni multilingüismo. Esas capacidades pertenecen al modelo que consuma el servidor, no al servidor.

## Casos de uso

- **Aceleración de inferencia en servidores POWER8 con GPU AMD**: un host ppc64le sin CUDA puede compilar la ruta Vulkan (`build_power8.sh`), arrancar el servidor en el puerto 8097 apuntando al ICD `radeon_icd.ppc64le.json` y delegar la matmul en la GPU, manteniendo el modelo en el host.
- **Offload remoto de matmul en `llama.cpp`**: con `GGML_GPU_OFFLOAD_ROCM=1` y `GGML_ROCM_MATMUL_HOST`/`PORT` apuntando al servidor ROCm (8098), se puede ejecutar `llama-cli -m model.gguf -ngl 0 -t 1` y dejar que las matrices de mayor tamaño se resuelvan en la GPU; `GGML_ROCM_MIN_M` permite filtrar matrices pequeñas para evitar sobrecarga de red.
- **Reparto de carga entre nodos heterogéneos**: separar el nodo que ejecuta el modelo del nodo que aporta la GPU AMD, útil en clústeres donde la GPU está en una máquina distinta del host de inferencia o donde se quiere reutilizar una GPU compartida entre varios procesos.
- **Prototipado e integración continua**: `test_client.py` sirve como prueba de humo para verificar en CI que el servidor arranca, acepta conexiones y devuelve resultados correctos antes de desplegar una build.
- **Evaluación de rendimiento de backends**: `vk_bench.py` permite medir el rendimiento del servidor Vulkan en 8097 y compararlo con la ruta rocBLAS, lo que ayuda a decidir qué backend usar para un modelo y una GPU concretos.
- **Investigación en portabilidad de cómputo GPU**: el par Vulkan/ROCm sobre POWER8 es un banco de pruebas para estudiar qué operaciones se pueden mover a una GPU AMD sin reescribir el motor de inferencia, y para medir el coste de la serialización de matmuls por red con distintos umbrales (`MIN_M`).
- **Despliegue en entornos con restricciones de pila propietaria**: al usar Vulkan y rocBLAS en lugar de CUDA, encaja en infraestructuras donde no se quiere depender del stack de NVIDIA.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El repositorio incluye un helper de medición (`vk_bench.py`) y un cliente de prueba (`test_client.py`), pero la model card no报告 cifras de latencia, throughput, GFLOPS ni comparaciones numéricas. Cualquier cifra de rendimiento tendría que obtenerse ejecutando el benchmark en el hardware concreto.

## Requisitos de hardware

- **Plataforma (ruta Vulkan)**: sistema POWER8 (ppc64le) con driver Vulkan de AMD; se requiere un ICD disponible, con el ejemplo `radeon_icd.ppc64le.json`.
- **Plataforma (ruta ROCm)**: GPU AMD con soporte HIP y ROCm instalado, por defecto en `/opt/rocm` (configurable con `ROCM_PATH`). El ejemplo de compilación usa `gfx1012`.
- **VRAM**: no disponible. El servidor no almacena pesos; la memoria necesaria depende del tamaño de las matrices que se le envíen y del modelo que consuma el servicio.
- **GPU recomendadas**: no disponible en la información proporcionada. El único target documentado es `gfx1012` (familia RDNA1 / Navi 10); el resto de targets no se especifican.
- **GPU de consumo**: potencialmente sí, dado que el ejemplo apunta a una GPU de gama de consumo de la familia Navi 10, pero no hay confirmación de compatibilidad ni de rendimiento en la documentación disponible.
- **Despliegue**: ejecución directa de los binarios compilados (`./build/vulkan_matmul_server 8097`, `./rocm_matmul_server 8098`). No se documentan integraciones con vLLM, TGI, Ollama ni llama.cpp server; la integración es con el cliente `llama.cpp` vía variables de entorno.
- **Latencia y throughput**: no disponible. Dependen de la GPU, del tamaño de matriz y del coste de serialización por red.

## Comparativa con modelos similares

No hay modelos comparables porque el artefacto no es un modelo, sino una infraestructura de offload. La comparación pertinente es con otras soluciones de offload de cómputo para inferencia:

| Alternativa | Categoría | Backend GPU | Licencia | Datos comparables |
|---|---|---|---|---|
| elyanlabs/vulkan-matmul | Servidor de matmul por red | Vulkan y ROCm/rocBLAS | AGPL-3.0 | Parámetros, contexto y benchmarks: no disponibles |
| Backend RPC de llama.cpp (`rpc-server`) | Servidor de offload por red para ggml | CPU/GPU según backend compilado | MIT (llama.cpp) | No verificado en la información proporcionada |
| Backend `ggml-vulkan` de llama.cpp | Aceleración Vulkan en proceso | Vulkan | MIT (llama.cpp) | No verificado en la información proporcionada |
| rocBLAS directo | Biblioteca de matmul en proceso | ROCm/HIP | Licencia de ROCm | No verificado en la información proporcionada |

En parámetros, longitud de contexto y rendimiento no procede comparación: este repositorio no define un modelo. La diferencia funcional frente a las alternativas es el enfoque explícito en POWER8 y la exposición de la matmul como servicio de red independiente del motor de inferencia.

## Limitaciones y advertencias

- **No es un modelo**: no genera texto, no tiene pesos, ni vocabulario, ni ventana de contexto. Cualquier expectativa de uso como LLM es un error de categoría.
- **Estado de prototipo**: la propia model card lo describe como "prototypes"; no hay indicios de madurez, versionado estable ni soporte.
- **Sin métricas publicadas**: no hay benchmarks, ni cifras de latencia o throughput, ni resultados de `vk_bench.py` en la documentación.
- **Alcance de plataforma muy reducido**: la ruta Vulkan está orientada a POWER8/ppc64le y la ruta ROCm requiere HIP y ROCm; no se documenta soporte para otras combinaciones.
- **Dependencia de un ICD concreto**: el arranque Vulkan depende de `VK_ICD_FILENAMES` apuntando al ICD de AMD para ppc64le; un ICD ausente o distinto impide el arranque.
- **Sobrecarga de red**: la matmul se serializa por TCP; con umbrales bajos (`GGML_ROCM_MIN_M`) el coste de comunicación puede superar la ganancia de la GPU. Requiere ajuste empírico.
- **Licencia AGPL-3.0**: copyleft fuerte con cláusula de red. Si se expone el servidor como servicio a terceros, la AGPL obliga a ofrecer el código fuente correspondiente. Es un caveat serio para uso comercial propietario.
- **Ambigüedad en los términos de contribución**: la model card remite a `CONTRIBUTING.md#license` para los términos de licencia de las contribuciones, sin detallarlos en el texto disponible.
- **Artefacto espejo**: es un snapshot de código alojado en GitHub/GitLab; la actividad, issues y mantenimiento reales están en esos repositorios, no en Hugging Face. Cero descargas y cero likes en el momento de la consulta.
- **Sin datos de sesgo ni alucinación**: no aplica, al no existir componente generativo. Los sesgos relevantes serían los del modelo que consuma el servicio.
- **Fechas del registro**: la fecha de creación y actualización indicada es 2026-10-23; conviene verificar la vigencia del repositorio original antes de adoptarlo.

## Enlaces

- Hugging Face: https://huggingface.co/elyanlabs/vulkan-matmul
- Repositorio GitHub: https://github.com/Scottcjn/vulkan-matmul
- Repositorio GitLab (historial completo): https://gitlab.com/elyan-labs/vulkan-matmul
- Certificación BCOS: https://github.com/Scottcjn/vulkan-matmul/blob/main/BCOS.md
- Documentación POWER8: https://github.com/Scottcjn/vulkan-matmul/blob/main/powerpc/README.md
- Registro de implementación PSE: https://github.com/Scottcjn/vulkan-matmul/blob/main/powerpc/PSE_IMPLEMENTATION_LOG.md
- Términos de licencia de contribuciones: https://github.com/Scottcjn/vulkan-matmul/blob/main/CONTRIBUTING.md#license
