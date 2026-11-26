# chococka/sageattention-flashattn-blackwell-cu130-torch211-cp312

## Resumen

Este repositorio no contiene un modelo de IA, sino un conjunto de dos wheels de Python precompilados para Linux x86_64: SageAttention 2.2.0 y FlashAttention 2.8.3.post1. Ambos estan compilados especificamente para GPUs NVIDIA con arquitectura Blackwell (compute capability 12.0, sm_120), sobre PyTorch 2.11.0+cu130 y Python 3.12. El autor, chococka (JahJedi), publica estos binarios porque, a fecha de la model card, los proyectos upstream no distribuyen wheels para esta combinacion concreta: SageAttention solo ofrece wheels para Windows y FlashAttention no cubre aun cu130 con torch 2.11.

El objetivo es evitar al usuario una compilacion desde codigo fuente que, segun el propio autor, puede llevar entre 5 y 40 minutos. Los wheels incluyen los kernels de retropropagacion de FlashAttention, por lo que sirven tanto para inferencia como para entrenamiento. El repositorio pesa 0,1 GB y esta publicado bajo licencia Apache 2.0 (la de SageAttention; FlashAttention es BSD 3-Clause).

Es relevante ahora porque la adopcion de GPUs Blackwell (RTX 5090, RTX PRO 6000, B100/B200) esta creciendo y la cadena de herramientas CUDA 13.0 con PyTorch 2.11 aun presenta huecos de distribucion binaria. Estos artefactos son, sin embargo, builds comunitarios con pruebas de humo unicamente, no validados por los autores originales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No aplica (no es un modelo de IA; son kernels CUDA de atencion optimizada) |
| Parametros totales | No disponible (no aplica) |
| Parametros activos | No disponible (no aplica) |
| Longitud de contexto | No disponible (no aplica) |
| Tipos de cuantizacion | No disponible (no aplica) |
| Idiomas soportados | No disponible (no aplica; la model card esta en ingles) |
| Licencia | Apache 2.0 (repositorio); SageAttention Apache 2.0; FlashAttention BSD 3-Clause |
| Formato de pesos | No aplica; se distribuyen wheels `.whl` (sageattention 14,8 MB; flash_attn 65,8 MB) |

Especificaciones de compatibilidad de los wheels:

| Requisito | Valor |
|---|---|
| Python | 3.12.x (compilado sobre 3.12.3, ABI `cp312`) |
| PyTorch | 2.11.0+cu130 |
| CUDA toolkit | 13.0 (driver compatible con cu130) |
| GPU | Compute capability 12.0 (Blackwell): RTX PRO 6000, RTX 5090/5080/5070 Ti, B100/B200 |
| Sistema operativo | Linux x86_64 (compilado en Ubuntu 24.04) |
| Compilacion | `arch=compute_120,code=sm_120` nativo, sin fallback PTX-JIT |

## Arquitectura y entrenamiento

No aplica en el sentido habitual: no hay modelo, ni pesos, ni datos de entrenamiento. Lo que se distribuye son implementaciones optimizadas del mecanismo de atencion. SageAttention 2.2.0 es una libreria de atencion cuantizada de bajo nivel orientada a acelerar la inferencia de modelos de difusion y transformers; FlashAttention 2.8.3.post1 es la implementacion clasica de atencion con IO-awareness de Dao-AILab. Ambos wheels se compilaron con `TORCH_CUDA_ARCH_LIST="12.0"` y `FLASH_ATTN_CUDA_ARCHS="120"`, apuntando exclusivamente a sm_120.

El entorno de compilacion documentado incluye Ubuntu 24.04 (kernel 6.14.0-1010-oem), CUDA 13.0.88, ninja 1.11.1.4, setuptools 81.0.0 y una RTX PRO 6000 Blackwell Workstation Edition. Se usaron `MAX_JOBS` y `NVCC_THREADS` limitados para evitar bloqueos del sistema durante la compilacion. FlashAttention incluye kernels backward, por lo que es apto para entrenamiento. No se realizaron pruebas de precision numerica ni de integracion a nivel de modelo, solo pruebas de humo (importacion y forward pass con formas y dtypes esperados).

## Capacidades

- Aceleracion de atencion en GPU Blackwell mediante kernels compilados nativamente para sm_120.
- SageAttention: atencion cuantizada con interfaz `sageattn(q, k, v, tensor_layout='HND', is_causal=...)`, entrada en formato (B, H, S, D).
- FlashAttention: atencion exacta con interfaz `flash_attn_func(q, k, v, causal=...)`, entrada en formato (B, S, H, D).
- Soporte de forward y backward en FlashAttention (entrenamiento e inferencia).
- Integracion con ComfyUI (etiqueta declarada por el autor) y con pipelines PyTorch que usen estas APIs.
- Instalacion via `pip install` sin compilacion desde fuente.
- No incluye capacidades de generacion de texto, vision, tool calling ni agentes: no es un modelo.

## Casos de uso

- Acelerar inferencia de modelos de difusion en ComfyUI sobre RTX 5090 o RTX PRO 6000: instalar SageAttention 2.2.0 evita compilar desde fuente y reduce el tiempo de puesta en marcha a segundos.
- Entrenamiento o fine-tuning de transformers en Blackwell: FlashAttention 2.8.3.post1 incluye kernels backward, por lo que se puede usar en bucles de entrenamiento con CUDA 13.0 y PyTorch 2.11.
- Despliegue de LLMs con atencion optimizada en entornos con cu130: util cuando el stack ya esta fijado a PyTorch 2.11+cu130 y no se quiere degradar a cu126.
- Reproduccion de entornos de investigacion: los hashes SHA256 publicados permiten verificar la integridad de los artefactos antes de instalarlos en clusters con B100/B200.
- CI/CD de proyectos de vision por computador: fijar estos wheels en una imagen Docker basada en Ubuntu 24.04 elimina la dependencia de compiladores y de tiempo de build.
- Prototipado rapido en workstations con RTX 5080/5070 Ti: permite validar pipelines de atencion en sm_120 sin esperar compilaciones de 5 a 40 minutos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor indica explicitamente que solo se hicieron pruebas de humo (importacion y forward pass) y que no se ejecutaron benchmarks de precision ni de rendimiento.

## Requisitos de hardware

- VRAM: no aplica directamente; el consumo depende del modelo que use estos kernels. Los wheels en si ocupan 14,8 MB y 65,8 MB en disco.
- GPU compatibles: compute capability 12.0 exclusivamente (RTX PRO 6000 Blackwell, RTX 5090, RTX 5080, RTX 5070 Ti, B100, B200). No hay fallback PTX-JIT, por lo que no cargaran en GPUs Hopper o Ada.
- Cabe en GPU consumer: si, en RTX 5090/5080/5070 Ti, siempre que el resto del stack coincida (Python 3.12, torch 2.11+cu130, Linux x86_64).
- Software obligatorio: Python 3.12.x, PyTorch 2.11.0+cu130, CUDA 13.0, Linux x86_64 (compilado en Ubuntu 24.04, sin `manylinux`).
- Despliegue: instalacion via pip de los `.whl`; no se mencionan integraciones con vLLM, TGI, llama.cpp ni Ollama.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Alternativa | Tipo | Cobertura Blackwell sm_120 | CUDA 13.0 / torch 2.11 | Distribucion | Licencia |
|---|---|---|---|---|---|
| Este repositorio (SageAttention 2.2.0 + FlashAttention 2.8.3.post1) | Wheels precompilados comunitarios | Si (sm_120 nativo) | Si | Wheels Linux x86_64, cp312 | Apache 2.0 / BSD 3-Clause |
| SageAttention upstream | Codigo fuente + wheels Windows | Solo via compilacion en Linux | Depende de la version | GitHub | Apache 2.0 |
| FlashAttention upstream (Dao-AILab) | Codigo fuente + wheels | No cubierto para cu130 + torch 2.11 segun el autor | No en el momento de publicacion | GitHub / PyPI | BSD 3-Clause |
| Compilacion desde fuente por el usuario | Build local | Si, si se configura `TORCH_CUDA_ARCH_LIST=12.0` | Si | Local | Segun upstream |

## Limitaciones y advertencias

- No es un modelo de IA: no genera texto, no razona, no procesa imagenes ni audio. Cualquier ficha que lo trate como modelo es incorrecta.
- Build comunitario no oficial: los autores de SageAttention y FlashAttention no participan ni respaldan estos artefactos.
- Solo pruebas de humo: no hay validacion de precision numerica, de integracion a nivel de modelo ni de regresiones de rendimiento.
- Sin garantia: el autor declina responsabilidad ante resultados incorrectos, cuelgues o perdidas de rendimiento; recomienda verificar contra una compilacion desde fuente.
- Compatibilidad estricta: cualquier desviacion en Python (3.11/3.13), PyTorch (cu126), CUDA o arquitectura de GPU impedira la carga del wheel.
- Solo Linux x86_64: compilado en Ubuntu 24.04 sin `manylinux`; no probado en otras distribuciones.
- Reproducibilidad parcial: los SHA256 pueden diferir entre recompilaciones por marcas de tiempo embebidas aunque el contenido binario sea identico.
- Licencias: Apache 2.0 para el repositorio y SageAttention; BSD 3-Clause para FlashAttention. Se deben conservar los avisos de licencia incluidos en `*.dist-info/licenses/`.
- Cero traccion en la plataforma: 0 descargas y 0 likes en el momento de la consulta, lo que reduce la validacion por parte de la comunidad.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/chococka/sageattention-flashattn-blackwell-cu130-torch211-cp312
- SageAttention (upstream): https://github.com/thu-ml/SageAttention
- Licencia de SageAttention: https://github.com/thu-ml/SageAttention/blob/main/LICENSE
- FlashAttention (upstream): https://github.com/Dao-AILab/flash-attention
- Licencia de FlashAttention: https://github.com/Dao-AILab/flash-attention/blob/main/LICENSE
