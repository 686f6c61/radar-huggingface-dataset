# EvanOLeary/pytorch-mps-flash-sdpa

## Resumen

`EvanOLeary/pytorch-mps-flash-sdpa` no es un modelo de lenguaje ni una red neuronal: es un wheel precompilado de PyTorch (`torch-2.15.0a0`, build alpha) para macOS arm64 y Python 3.14 que incorpora el cableado de FlashAttention en el backend MPS (Metal Performance Shaders) correspondiente a la pull request pytorch/pytorch #198564. El problema que resuelve es concreto: hasta ahora, llamar a `sdpa_kernel(SDPBackend.FLASH_ATTENTION)` o a `torch.ops.aten._fused_sdp_choice` sobre tensores MPS lanzaba `NotImplementedError`. Con este binario, el enrutado redirige `SDPBackend::flash_attention` al kernel Metal `sdpa_prefill_mps` ya existente en PyTorch para Apple Silicon.

El artefacto es relevante para quien entrene o ejecute transformers sobre Mac con chip de Apple. En particular, la model card cita dos configuraciones que quedan funcionales: ESMC-300M con dimension de cabeza D=64 y ESMC-600M con D=72, ambas rotas antes del parche. Las dimensiones de cabeza admitidas por el kernel son 32, 64, 72, 80, 96, 128 y 256.

Se distribuye como un unico fichero `.whl` (el repositorio ocupa 0,1 GB), sin codigo fuente adicional, sin licencia declarada, sin pipeline asociado y sin idiomas definidos, porque ninguna de esas categorias de HuggingFace aplica a un binario de framework. El wheel esta construido sobre el commit `199627e` de `pytorch/pytorch`, con los commits `9e09d92` (wiring) y `27181af` (correccion de `use_mpp` mas tests), compilado en un Apple M3 de 8 GB con macOS 14.4.1 y Python 3.14.7.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no aplicable: no es una red neuronal; es un wheel de PyTorch con enrutado de FlashAttention para el backend MPS |
| Parametros totales | no aplicable |
| Parametros activos | no aplicable (no es un modelo MoE) |
| Longitud de contexto | no aplicable; si aplica la dimensionalidad de cabeza admitida por el kernel: 32, 64, 72, 80, 96, 128, 256 |
| Tipos de cuantizacion | no aplicable (el wheel no incluye pesos de modelo) |
| Idiomas soportados | no aplicable |
| Licencia | no disponible (la model card y el repositorio no declaran licencia) |
| Formato de pesos | no aplicable; el artefacto es un wheel `.whl` de aproximadamente 0,1 GB |
| Version de PyTorch | 2.15.0a0 (build alpha, `torch-2.15.0a0-cp314-cp314-macosx_14_0_arm64.whl`) |
| Base de codigo | `pytorch/pytorch` en el commit `199627e`; commits aplicados `9e09d92` y `27181af` |
| Backend objetivo | MPS (Metal) en Apple Silicon |
| Kernel utilizado | `sdpa_prefill_mps` (Metal), expuesto como `SDPBackend::flash_attention` |
| Plataforma | macOS 14.0 o superior, arquitectura arm64 |
| Version de Python | 3.14 (tag `cp314`) |
| Hardware de compilacion | Apple M3 de 8 GB, macOS 14.4.1, Python 3.14.7 |
| Descargas / likes en HuggingFace | 0 / 0 |
| Fecha declarada en el repositorio | creado 2026-09-26, actualizado 2026-09-26 |

## Arquitectura y entrenamiento

No hay arquitectura de red ni proceso de entrenamiento: el artefacto es un binario del framework. Lo que implementa es el enrutado de la atencion con producto escalar escalado en MPS. Antes del parche, la seleccion de backend fusionado en MPS no estaba implementada, de modo que `_fused_sdp_choice` devolvia `NotImplementedError` y cualquier intento de forzar el backend `FLASH_ATTENTION` en tensores MPS fallaba. La modificacion conecta `SDPBackend::flash_attention` con el kernel Metal `sdpa_prefill_mps`, que ya existia en el arbol de PyTorch, en lugar de anadir un kernel nuevo. El commit `27181af` corrige ademas el uso de `use_mpp` e incorpora tests.

El kernel opera sobre las dimensiones de cabeza enumeradas (32, 64, 72, 80, 96, 128, 256) y se ha verificado en configuraciones tipo ESMC: el ejemplo de la model card ejecuta una atencion con `q`, `k`, `v` de forma `(1, 15, 512, 64)` en `float16` sobre `mps`, y confirma que `SDPBackend(choice).name` devuelve `FLASH_ATTENTION`. No se documentan datos de entrenamiento (no procede), ni tecnicas de RLHF/DPO, ni decodificacion especulativa, ni atencion lineal. La unica innovacion tecnica es la habilitacion del dispatch fusionado en MPS para las formas soportadas.

## Capacidades

- Ejecucion de `F.scaled_dot_product_attention` sobre tensores MPS dentro de un contexto `sdpa_kernel(SDPBackend.FLASH_ATTENTION)` sin lanzar `NotImplementedError`.
- Respuesta correcta de `torch.ops.aten._fused_sdp_choice` en MPS, que devuelve `FLASH_ATTENTION` para las dimensiones de cabeza soportadas.
- Atencion en `float16` sobre MPS con las formas del ejemplo validado: lote 1, 15 cabezas, 512 tokens, D=64.
- Soporte funcional de las configuraciones ESMC-300M (D=64) y ESMC-600M (D=72), que la model card marca explicitamente como reparadas.
- Compatibilidad con el resto de la API de PyTorch 2.15.0a0 para macOS arm64, al tratarse de una build completa del framework.
- No incluye capacidades de generacion de texto, razonamiento, codigo, matematicas, vision, audio, tool calling ni agentes: no es un modelo, es una dependencia de ejecucion.
- No incluye capacidades multilingues ni modo de razonamiento.

## Casos de uso

- Ejecucion local de modelos de proteinas ESMC en Apple Silicon: el wheel habilita el camino de atencion fusionada para ESMC-300M (D=64) y ESMC-600M (D=72) en Mac con chip M1 o posterior, que son exactamente las dos configuraciones que fallaban antes del parche.
- Prototipado de transformers en portatil sin GPU dedicada: permite validar arquitecturas y formas de atencion sobre memoria unificada antes de trasladar el entrenamiento a un clúster con A100 o H100, evitando reescribir el codigo de atencion para CPU.
- Ajuste fino con adaptadores (LoRA) de modelos de secuencia larga en un Mac: al enrutar la atencion por el kernel Metal `sdpa_prefill_mps` en lugar del camino no fusionado, se reduce la necesidad de materializar la matriz completa de scores en la memoria unificada, algo critico en equipos de 8 o 16 GB.
- Integracion en pipelines de CI/CD para desarrolladores de PyTorch: el wheel permite ejecutar tests de dispatch (`_fused_sdp_choice`, `sdpa_kernel`) en runners macOS arm64 con Python 3.14, cubriendo una ruta de codigo que en Linux con CUDA no se ejercita.
- Reproduccion y verificacion del PR #198564: sirve para comprobar de forma aislada el comportamiento del enrutado descrito en la pull request sobre un binario concreto y sobre un hardware concreto (M3, macOS 14.4.1).
- Servicio de inferencia local para embeddings de proteinas o secuencias biologicas: desplegando el modelo con una API ligera (FastAPI, Flask) sobre el mismo Mac, el usuario puede servir peticiones de embedding sin depender de conectividad ni de GPU externa.
- Banco de pruebas comparativo de backends de atencion en MPS: al permitir forzar `FLASH_ATTENTION` y consultar el backend seleccionado, facilita medir memoria y tiempo frente al camino por defecto en el mismo equipo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No hay cifras de latencia, throughput, MMLU, HumanEval, GSM8K ni de ningun otro conjunto de evaluacion, lo cual es coherente con la naturaleza del artefacto (no es un modelo). La unica tabla de datos funcionales que aporta la model card es la comparacion antes/despues del parche:

| Aspecto | Antes | Despues |
|---|---|---|
| `_fused_sdp_choice` en MPS | `NotImplementedError` | Devuelve `FLASH_ATTENTION` para dimensiones soportadas |
| `sdpa_kernel(FLASH_ATTENTION)` en MPS | `NotImplementedError` | Funciona |
| Dimensiones de cabeza soportadas | no disponible | 32, 64, 72, 80, 96, 128, 256 |
| ESMC-300M (D=64) | roto | funciona |
| ESMC-600M (D=72) | roto | funciona |

## Requisitos de hardware

- Hardware minimo: Mac con Apple Silicon M1 o posterior. No hay soporte para Macs Intel, ni para Linux o Windows.
- Sistema operativo: macOS 14.0 o superior (el tag del wheel es `macosx_14_0_arm64`).
- Version de Python: 3.14 (el wheel esta etiquetado `cp314`). No hay builds para 3.10, 3.11, 3.12 ni 3.13 en el repositorio.
- Memoria: no se especifica un minimo; la build y las pruebas se realizaron en un Apple M3 con 8 GB de memoria unificada, por lo que ese es el suelo conocido.
- VRAM: no aplicable. Al usar memoria unificada, el consumo depende del modelo que se cargue encima del wheel, no del wheel en si.
- GPU recomendadas: cualquiera integrada en un chip M1, M2, M3 o M4. No aplican A100, H100 ni RTX 4090, que son plataformas CUDA no cubiertas por este binario.
- Encaje en GPU de consumo: si, en cualquier Mac con Apple Silicon; no en tarjetas graficas de consumo con CUDA, porque el wheel es exclusivamente arm64 macOS.
- Opciones de despliegue: instalacion directa con `pip install "https://huggingface.co/EvanOLeary/pytorch-mps-flash-sdpa/resolve/main/torch-2.15.0a0-cp314-cp314-macosx_14_0_arm64.whl"`, preferiblemente dentro de un entorno virtual o conda. No aplican vLLM, llama.cpp, Ollama, TGI ni TensorRT-LLM, que son servidores de modelos y no gestores de builds de PyTorch.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

Por su naturaleza, la comparacion pertinente es con otras rutas de ejecucion de atencion, no con modelos.

| Alternativa | Ambito | Requisitos | Estado del backend FlashAttention | Licencia |
|---|---|---|---|---|
| pytorch-mps-flash-sdpa (este wheel) | MPS sobre Apple Silicon | Apple M1+, macOS 14.0+, Python 3.14 | Habilitado mediante `sdpa_prefill_mps` para D = 32, 64, 72, 80, 96, 128, 256 | no disponible |
| PyTorch nightly oficial sin el parche | MPS sobre Apple Silicon | Segun build (habitualmente Python 3.10-3.13) | `NotImplementedError` al forzar `FLASH_ATTENTION` en MPS | BSD-3-Clause (PyTorch) |
| Camino CUDA con FlashAttention-2/3 | GPU NVIDIA | CUDA, A100/H100/RTX | Habilitado | BSD-3-Clause / Apache-2.0 segun implementacion |
| Fallback MPS por defecto (math o efficient) | MPS sobre Apple Silicon | Apple Silicon, cualquier PyTorch reciente | No se selecciona `flash_attention`; se usa otro backend | BSD-3-Clause (PyTorch) |

No se dispone de modelos comparables en el sentido habitual (mismo tamano o misma tarea), porque este artefacto no es un modelo.

## Limitaciones y advertencias

- Licencia no declarada. El repositorio de HuggingFace no indica licencia, por lo que el uso comercial del binario queda en un limbo legal hasta que el autor lo aclare, con independencia de que PyTorch upstream sea BSD-3-Clause.
- Build alpha: `2.15.0a0` es una version de desarrollo, no una release estable. No se garantiza estabilidad de API ni de comportamiento frente a versiones finales.
- Dependencia estricta de Python 3.14 y de macOS 14.0 o superior en arm64. No hay ruedas para otras versiones de Python ni para otras plataformas.
- Cobertura de pruebas muy limitada: la model card indica que la build se realizo y probo en un unico equipo (Apple M3 de 8 GB, macOS 14.4.1). Otros chips, tamanos de memoria o versiones de macOS no estan verificados.
- Repositorio sin validacion de la comunidad: 0 descargas y 0 likes en el momento de la consulta, autor unico (EvanOLeary) y sin enlace a repositorio de codigo propio para auditar la modificacion.
- Instalacion mediante URL directa a un fichero `.whl` alojado en HuggingFace. No se publica hash ni firma, por lo que conviene verificar el `sha256` y la procedencia antes de instalarlo en un entorno de produccion.
- El kernel solo cubre las dimensiones de cabeza 32, 64, 72, 80, 96, 128 y 256. Fuera de esos valores, el comportamiento no esta garantizado por el parche.
- Las marcas temporales del repositorio (creado y actualizado el 2026-09-26) deben verificarse, ya que no coinciden con la fecha habitual de publicacion de las builds nightly de PyTorch citadas.
- No es un modelo: no genera texto, no razona, no soporta tool calling ni agentes, no tiene capacidades multilingues y no alucina en el sentido habitual. Cualquier expectativa de ese tipo sobre este artefacto es un error de interpretacion.
- No se publican cifras de rendimiento (latencia, memoria, throughput) que permitan estimar la ganancia real frente al camino MPS por defecto.

## Enlaces

- Ficha en HuggingFace: https://huggingface.co/EvanOLeary/pytorch-mps-flash-sdpa
- Wheel directo: https://huggingface.co/EvanOLeary/pytorch-mps-flash-sdpa/resolve/main/torch-2.15.0a0-cp314-cp314-macosx_14_0_arm64.whl
- Pull request de referencia: https://github.com/pytorch/pytorch/pull/198564
- Repositorio base: https://github.com/pytorch/pytorch
