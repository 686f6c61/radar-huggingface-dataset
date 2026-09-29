# ruwwww/vllm-wheels

## Resumen

`ruwwww/vllm-wheels` no es un modelo de lenguaje, sino un repositorio de HuggingFace que distribuye un wheel precompilado de vLLM, el motor de inferencia y serving de LLM descrito por sus responsables como de alto rendimiento y eficiente en memoria. El artefacto está compilado desde el código fuente de la rama `main` de vLLM (commit `a7ff44355c1cadd1d85b82f4adc9694ce7864b56`) para un entorno muy concreto: Python 3.13 (`cp313`), CUDA 12.8 (NVCC 12.8.61), PyTorch 2.10.0+cu128 y arquitectura de GPU `sm_80` (NVIDIA A100-SXM4 / PCIe).

El problema que resuelve es de tipo operativo: instalar vLLM desde fuente en configuraciones recientes de Python y CUDA puede requerir compilar extensiones nativas (C++/CUDA) con una combinación exacta de compilador, toolkit y versión de PyTorch. Este repositorio ofrece el resultado de esa compilación como un único fichero `.whl` instalable con `pip`, con extensiones como FlashAttention-2, FlashAttention-3, kernels Marlin MoE, el asignador `cumem_allocator` y utilidades de E/S (`fs_io_C`, `spinloop`) ya empaquetadas.

Su relevancia es acotada pero clara: es un artefacto de nicho para quienes necesitan vLLM sobre A100 con Python 3.13 y CUDA 12.8, una combinación que no siempre está cubierta por los índices oficiales de wheels. El repositorio tiene 0 descargas y 0 likes en el momento de la consulta y un tamaño de 0.3 GB, por lo que debe tratarse como una build no validada por la comunidad y verificarse antes de usarla en producción.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no aplica: no es un modelo neuronal, es un wheel binario del motor de inferencia vLLM con extensiones nativas en C++/CUDA |
| Parametros totales | no aplica |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica: la determina el modelo de lenguaje que se sirva con el wheel |
| Tipos de cuantizacion | no aplica al wheel; incluye kernels Marlin MoE (`_moe_C_stable_libtorch.abi3.so`) para pesos cuantizados |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | no aplica: el artefacto es un wheel (`vllm-0.1.dev1+ga7ff44355.cu128-cp313-cp313-linux_x86_64.whl`) |
| Version de Python | 3.13 (`cp313`) |
| Version de CUDA | 12.8 (NVCC 12.8.61) |
| Version de PyTorch requerida | 2.10.0+cu128 |
| Compilador del host | GCC 12.4.0 |
| Arquitectura de GPU objetivo | `sm_80` (NVIDIA A100-SXM4 / PCIe) |
| Commit de vLLM | `a7ff44355c1cadd1d85b82f4adc9694ce7864b56` (rama `main`) |
| Extensiones incluidas | `_C_stable_libtorch.abi3.so`, `_moe_C_stable_libtorch.abi3.so` (Marlin MoE), `_vllm_fa2_C.abi3.so` (FlashAttention-2), `_vllm_fa3_C.abi3.so` (FlashAttention-3), `cumem_allocator.abi3.so`, `fs_io_C.abi3.so`, `spinloop.abi3.so` |
| Tamano del repositorio | 0.3 GB |
| Descargas / likes | 0 / 0 |
| Fecha de creacion / actualizacion | 2026-09-29 / 2026-09-29 |

## Arquitectura y entrenamiento

No existe arquitectura de red neuronal ni proceso de entrenamiento que describir: el contenido del repositorio es un binario compilado. La "arquitectura" relevante aquí es la del propio paquete: un wheel de plataforma (`linux_x86_64`) con ABI estable de PyTorch (`abi3`), que enlaza las extensiones nativas de vLLM para una única arquitectura de dispositivo, `sm_80`. El sufijo `+ga7ff44355` del nombre del fichero identifica el commit exacto de vLLM usado como fuente, y `cu128` fija la variante de CUDA del build.

Tampoco hay datos de entrenamiento, dataset ni fases de RLHF/DPO. Lo que sí se documenta es el entorno de compilación: Python 3.13, CUDA 12.8, PyTorch 2.10.0+cu128 y GCC 12.4.0, con las extensiones registradas mediante `STABLE_TORCH_LIBRARY`. Este nivel de detalle es lo que permite reproducir o auditar el build, y es la información que debe compararse contra el entorno de destino antes de instalar el wheel.

## Capacidades

- Distribución de vLLM lista para instalar con `pip` sin compilar desde fuente, en entornos Python 3.13 + CUDA 12.8.
- Ejecución de inferencia y serving de LLM sobre GPU NVIDIA A100 (`sm_80`) usando el motor vLLM.
- Aceleración de atención mediante FlashAttention-2 (`_vllm_fa2_C.abi3.so`) y FlashAttention-3 (`_vllm_fa3_C.abi3.so`), ambas incluidas como extensiones.
- Soporte de kernels Marlin MoE (`_moe_C_stable_libtorch.abi3.so`) para modelos con mezcla de expertos y pesos cuantizados.
- Gestión de memoria de dispositivo mediante `cumem_allocator.abi3.so` y utilidades de E/S y espera activa (`fs_io_C`, `spinloop`).
- No incorpora capacidades de generación de texto, razonamiento, código, matemáticas, visión, tool calling, agentes ni multilingüismo por sí mismo: esas capacidades dependen exclusivamente del modelo que se cargue en el motor.
- No se documentan modos especiales (thinking, audio, visión) en la información disponible.

## Casos de uso

- Despliegue de LLM en clústeres con A100 y Python 3.13: instalar el wheel con `pip` y arrancar el motor vLLM sobre `sm_80` evita compilar extensiones CUDA en cada nodo, lo que simplifica el aprovisionamiento de imágenes base homogéneas.
- Entornos con CUDA 12.8 y PyTorch 2.10.0+cu128: sirve como vía de instalación cuando las builds publicadas en otros índices no cubren esa combinación de versiones.
- Reproducibilidad de experimentos: el nombre del fichero fija commit de vLLM, versión de CUDA y ABI de Python, de modo que un `pip install` con esa URL congela de forma explícita el motor de inferencia usado en un benchmark o paper interno.
- Instalaciones en entornos aislados o con salida a internet restringida: al ser un único fichero `.whl` de 0.3 GB, se puede copiar al espejo interno y desplegar sin acceso a índices de paquetes externos.
- Pipelines de CI/CD: usar la URL del wheel como dependencia anclada en un `requirements.txt` o `Dockerfile` garantiza que los tests de integración corran contra una versión concreta del motor de inferencia.
- Evaluación de kernels en A100: al incluir simultáneamente FlashAttention-2 y FlashAttention-3, permite comparar el comportamiento de ambas rutas de atención en la misma máquina y con el mismo binario base.
- Punto de partida para recompilar: el repositorio documenta compilador, toolkit y versiones exactas, por lo que es útil como referencia reproducible para generar wheels equivalentes orientados a `sm_86`, `sm_89` o `sm_90`.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El repositorio no incluye métricas de throughput, latencia, tokens por segundo ni comparaciones con otras builds de vLLM; la única información verificable es la de procedencia del build (commit `a7ff44355c1cadd1d85b82f4adc9694ce7864b56`, CUDA 12.8, PyTorch 2.10.0+cu128, `sm_80`).

## Requisitos de hardware

- GPU compatible: únicamente NVIDIA A100 (SXM4 o PCIe), arquitectura `sm_80`. El wheel no incluye código para otras arquitecturas, por lo que no se puede asumir su funcionamiento en `sm_86` (RTX 30xx, A40), `sm_89` (RTX 40xx, L40S), `sm_90` (H100) ni en GPUs AMD/ROCm.
- VRAM estimada: no disponible en la información del repositorio. El consumo depende por completo del modelo servido, de su cuantización y de la longitud de contexto configurada; el propio motor se describe como eficiente en memoria.
- GPU de consumo: no, no está soportado en tarjetas de consumo por la restricción de arquitectura `sm_80`.
- Entorno de software obligatorio: Python 3.13, CUDA 12.8 con un driver NVIDIA compatible con esa versión de CUDA, y PyTorch 2.10.0+cu128.
- Instalación: `pip install https://huggingface.co/ruwwww/vllm-wheels/resolve/main/vllm-0.1.dev1+ga7ff44355.cu128-cp313-cp313-linux_x86_64.whl`
- Otras opciones de despliegue (vLLM compilado desde fuente, wheels oficiales de `wheels.vllm.ai`, contenedores con el motor preinstalado): viables, pero no forman parte de este artefacto.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

No aplica una comparativa de modelos porque el artefacto no es un modelo de lenguaje. Se compara a continuación con otras fuentes de distribución de vLLM:

| Alternativa | Contenido | Cobertura de versiones | Mantenimiento | Licencia | Datos de rendimiento |
|---|---|---|---|---|---|
| `ruwwww/vllm-wheels` (este repositorio) | Wheel único precompilado, commit `a7ff4435`, Python 3.13, CUDA 12.8, `sm_80` | Una única combinación cp313/cu128/sm_80 | Autor individual (`ruwwww`), 0 descargas, 0 likes | apache-2.0 | no disponible |
| `wheels.vllm.ai` (índice oficial) | Wheels oficiales organizados por versión y variante | Rutas observadas: `0.9.0/` con `cu118/`, `cu126/`; `0.19.0/` con `cpu/`, `cu129/`, `cu130/` | Proyecto vLLM | no disponible en la búsqueda | no disponible |
| `mgoin/vllm-wheels` | Índice buscable de wheels con salida en JSON, CSV y JSON Schema | Release, nightly, variantes CUDA/CPU/ROCm, assets de releases de GitHub y ventana acotada de builds recientes de `main` | Autor individual (`mgoin`) | no disponible en la búsqueda | no disponible |
| `EmbeddedLLM/vllm-wheel` | Repositorio orientado a facilitar el uso de wheels de vLLM | no disponible | Tercero (`EmbeddedLLM`) | no disponible en la búsqueda | no disponible |

## Limitaciones y advertencias

- No es un modelo: no genera texto ni ofrece ninguna capacidad cognitiva; cualquier expectativa de uso como LLM es incorrecta.
- Anclaje a una única arquitectura de GPU (`sm_80`). No hay soporte para otras arquitecturas NVIDIA ni para ROCm/CPU.
- Anclaje a versiones muy específicas: Python 3.13, CUDA 12.8 y PyTorch 2.10.0+cu128. Cualquier desviación puede provocar fallos de importación del binario.
- Build generada desde la rama `main` de vLLM, etiquetada internamente como `0.1.dev1`. No es una versión estable ni un release congelado, por lo que el comportamiento puede diferir del de las versiones publicadas.
- Riesgo de seguridad: instalar un wheel de terceros ejecuta código nativo compilado en el sistema. El repositorio no ofrece en la información disponible sumas de verificación ni firmas, y acumula 0 descargas y 0 likes, por lo que no hay validación de la comunidad.
- Riesgo de mantenimiento: el autor no documenta política de actualización, soporte ni compatibilidad con futuras versiones de vLLM, CUDA o PyTorch.
- Licencia: el repositorio declara apache-2.0, lo que en principio permite uso comercial, pero conviene verificar de forma independiente las licencias y los avisos de las dependencias enlazadas (PyTorch, CUDA, kernels de terceros como FlashAttention y Marlin) antes de un despliegue en producción.
- Sin benchmarks ni pruebas de estrés publicadas: no hay datos de estabilidad, throughput ni latencia que permitan estimar el comportamiento en producción.
- Idiomas soportados: no disponible, y en cualquier caso dependientes del modelo servido, no del wheel.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/ruwwww/vllm-wheels
- Descarga directa del wheel: https://huggingface.co/ruwwww/vllm-wheels/resolve/main/vllm-0.1.dev1+ga7ff44355.cu128-cp313-cp313-linux_x86_64.whl
- Sitio oficial de vLLM: https://vllm.ai/
- Índice oficial de wheels, versión 0.9.0 (variantes cu118, cu126): https://wheels.vllm.ai/0.9.0/
- Índice oficial de wheels, versión 0.19.0 (variantes cpu, cu129, cu130): https://wheels.vllm.ai/0.19.0/
- Índice buscable de wheels de vLLM (JSON, CSV, JSON Schema): https://github.com/mgoin/vllm-wheels
- Repositorio de terceros con wheels de vLLM: https://github.com/EmbeddedLLM/vllm-wheel
