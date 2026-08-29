# m-yuasa/pytorch-mi300a-rocm72

## Resumen

Este repositorio no contiene un modelo de inteligencia artificial, sino una distribución pip-installable de PyTorch 2.13 compilada específicamente para la APU AMD Instinct MI300A con ROCm 7.2. La innovación principal es el soporte de memoria compartida de la APU: las transferencias CPU-a-GPU y GPU-a-CPU que son elegibles se resuelven mediante alias de la misma memoria física en lugar de copias, de modo que la transferencia desaparece en lugar de acelerarse. Esto reduce drásticamente el coste de memoria para cargas de trabajo que mueven grandes volúmenes de datos residentes en CPU hacia la GPU.

El autor, m-yuasa, publica el wheel con las librerías de usuario de ROCm 7.2 incluidas, por lo que no se necesita una instalación de ROCm en `/opt/rocm` en tiempo de ejecución. El build se validó en una MI300A con 20/20 pruebas de memoria compartida APU superadas, y es compatible con TorchVision, TorchAudio y `torch.compile`. La relevancia actual radica en que PyTorch upstream aún no aprovecha la arquitectura de memoria unificada de la MI300A, como se documenta en el issue 145693 del repositorio oficial de PyTorch.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | PyTorch 2.13 (framework de deep learning, no un modelo) |
| Parametros totales | no aplicable (framework) |
| Parametros activos | no aplicable |
| Longitud de contexto | no aplicable |
| Tipos de cuantizacion | no aplicable |
| Idiomas soportados | no aplicable |
| Licencia | other (PyTorch bajo su propia licencia + licencias de las librerias ROCm 7.2 redistribuidas) |
| Formato de pesos | wheel pip: `torch-2.13.0+mi300a.rocm72-cp312-cp312-linux_x86_64.whl` (4.0 GB) |

## Arquitectura y entrenamiento

No se trata de un modelo entrenado, sino de un build de software. La modificacion tecnica clave consiste en aprovechar la arquitectura de memoria unificada de la APU MI300A (`gfx942`), donde CPU y GPU comparten la misma memoria fisica. En el build estandar de PyTorch, las operaciones `cpu.to("cuda")` y `cuda.cpu()` realizan copias reales de memoria; en este build, las transferencias elegibles se resuelven como alias de la misma region fisica, eliminando la copia por completo. El resultado es que el coste de memoria de un handoff CPU-a-GPU pasa de ocupar N MiB en la GPU a 0 MiB, con solo unos pocos MiB de overhead en memoria de sistema.

El build se compilo desde el tag `mi300a-apu-rocm7.2-torch213-v0.1.0` del repositorio `Mamoru-Yuasa/pytorch`, commit `f0fb8da574d2ccaa2772726cfd1f65857dfab2ce`. La velocidad de computo no cambia respecto al build estandar: resnet50 en entrenamiento bf16 con batch 256 alcanza 1771 muestras/segundo frente a 1774 del build stock, y el throughput de GEMM y el ancho de banda de copia coinciden. La ganancia es exclusivamente de memoria, no de aritmetica.

## Capacidades

- Soporte de memoria compartida APU: las transferencias CPU-GPU elegibles se resuelven como alias de memoria fisica, sin copia.
- API de verificacion: `torch.cuda.apu.is_available(0)` e `is_shared(gpu)` para comprobar el estado de la APU.
- Compatibilidad con TorchVision (incluido GPU NMS) y TorchAudio, instalables con `--no-deps` desde el indice nightly de ROCm 7.2.
- Compatibilidad con `torch.compile` validada en la MI300A.
- Seleccion de backend BLAS: `torch.backends.cuda.preferred_blas_library("cublas")` para usar rocBLAS en lugar de hipBLASLt, y `torch.cuda.tunable` para autotuning de kernels GEMM por forma.
- Librerias de usuario ROCm 7.2 empaquetadas en el wheel, sin necesidad de modulo ROCm externo en tiempo de ejecucion.
- Requiere unicamente el driver de kernel AMDGPU/KFD compatible.

## Casos de uso

- Entrenamiento de LLMs en MI300A: la memoria unificada permite alojar modelos y datos de entrenamiento de gran tamano sin copias redundantes, lo que reduce el pico de memoria GPU y puede permitir lotes mas grandes o modelos mas grandes en la misma APU.
- Staging de datasets grandes en GPU: cargas de trabajo que preparan datos residentes en CPU (por ejemplo, datasets de varios GiB) y los mueven a la GPU para entrenamiento o inferencia eliminan por completo el coste de copia. Un payload de 4 GiB pasa de ocupar 4096 MiB de GPU a 0 MiB.
- Inferencia de modelos grandes en MI300A: al no duplicar memoria en las transferencias, se libera capacidad para pesos, activaciones y gradientes, lo que beneficia a modelos con requisitos de memoria elevados.
- Fine-tuning con lotes grandes: la reduccion de memoria en handoffs CPU-GPU permite aumentar el batch size sin superar el limite de memoria de la APU.
- Investigacion sobre arquitecturas APU: este build sirve como referencia para estudiar el impacto de la memoria unificada en cargas de trabajo reales de deep learning, y como base para contribuciones upstream a PyTorch.
- Migracion de entornos NVIDIA a AMD: proporciona una ruta de instalacion limpia para equipos que pasan de CUDA a ROCm, con TorchVision y TorchAudio incluidos y validados.

## Benchmarks y rendimiento

Los datos de rendimiento provienen de la model card del autor, medidos en una MI300A frente al build estandar `2.13.0+rocm7.2`:

| Metrica | Este build | Build stock |
|---|---|---|
| resnet50 bf16 training, batch 256 | 1771 muestras/seg | 1774 muestras/seg |
| Payload de 256 MiB movido a GPU | 0 MiB GPU, 1 MiB sistema | 256 MiB GPU, 841 MiB sistema |
| Payload de 1 GiB movido a GPU | 0 MiB GPU, 5 MiB sistema | 1024 MiB GPU, 1030 MiB sistema |
| Payload de 4 GiB movido a GPU | 0 MiB GPU, 9 MiB sistema | 4096 MiB GPU, 4120 MiB sistema |
| resnet50 batch 256, pico de asignacion GPU | 11059 MiB | 11307 MiB |

Ademas, se documenta una anomalia del backend hipBLASLt por defecto: un matmul bf16 cuadrado de 16384 mide 15.7 TFLOPS con hipBLASLt y 617 TFLOPS con rocBLAS, mientras que ambos coinciden en 8192. Este comportamiento proviene de las librerias ROCm, no de los cambios APU, y afecta igualmente al build stock.

## Requisitos de hardware

- APU AMD Instinct MI300A (`gfx942`) obligatoria; el soporte de memoria compartida no esta disponible en otras GPUs.
- CPython 3.12.
- Linux x86_64 con x86-64-v2 o superior y glibc 2.34 o superior.
- Driver de kernel AMDGPU/KFD compatible ya presente; las librerias de usuario ROCm 7.2 van incluidas en el wheel.
- No requiere instalacion de ROCm en `/opt/rocm` ni modulo ROCm en tiempo de ejecucion.
- Para TorchVision y TorchAudio: instalar con `--no-deps` desde el indice nightly de ROCm 7.2, mas `triton-rocm==3.7.1`.
- Opciones de despliegue: instalacion via pip en un entorno virtual; no aplican vLLM, llama.cpp u Ollama al ser un framework, no un modelo.

## Comparativa con modelos similares

La comparativa relevante es contra el build estandar de PyTorch para ROCm, ya que no existen modelos comparables en este repositorio:

| Aspecto | Este build (2.13.0+mi300a.rocm72) | PyTorch stock 2.13.0+rocm7.2 |
|---|---|---|
| Memoria compartida APU | Si, alias de memoria fisica | No, copias reales |
| Coste de handoff 4 GiB CPU-GPU | 0 MiB GPU | 4096 MiB GPU |
| Rendimiento aritmetico | Identico (1771 vs 1774 muestras/seg en resnet50) | Referencia |
| Librerias ROCm incluidas | Si | No, requiere instalacion ROCm |
| TorchVision/TorchAudio | Compatibles con `--no-deps` | Compatibles nativamente |
| Licencia | other (PyTorch + ROCm) | BSD-style (PyTorch) |

## Limitaciones y advertencias

- No es un modelo de IA: este repositorio contiene un framework, no pesos entrenados ni capacidades de generacion de texto, vision o razonamiento.
- La ganancia de rendimiento es exclusivamente de memoria en handoffs CPU-GPU; la velocidad de computo es identica al build stock.
- No ejecutar `pip install torch torchvision`: TorchVision fija una version exacta de torch que este build no satisface, y pip reemplazaria silenciosamente el wheel por el nightly estandar, perdiendo el soporte APU.
- `pip check` reportara el requisito de TorchVision como no cumplido; es una discrepancia de version-string, no un fallo funcional.
- El backend hipBLASLt por defecto colapsa en matmuls grandes (16384): 15.7 TFLOPS frente a 617 TFLOPS con rocBLAS. Requiere seleccion manual del backend o autotuning.
- La licencia es `other`: redistribuye las librerias ROCm 7.2 bajo sus propias licencias con sus avisos; PyTorch se distribuye bajo su licencia incluida en el wheel. Revisar las licencias de ROCm antes de uso comercial.
- El build y sus pruebas fueron preparados con asistencia de una herramienta de IA generativa (Claude Code), segun la divulgacion del autor; un humano reviso los cambios y resultados antes de publicar.
- Solo compatible con MI300A; no funcionara en otras GPUs AMD o NVIDIA.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/m-yuasa/pytorch-mi300a-rocm72
- Issue de PyTorch sobre memoria unificada en MI300A: https://github.com/pytorch/pytorch/issues/145693
- Documentacion ROCm de compatibilidad con PyTorch (6.3.1): https://rocm.docs.amd.com/en/docs-6.3.1/compatibility/ml-compatibility/pytorch-compatibility.html
- Documentacion ROCm de compatibilidad con PyTorch (7.0.1): https://rocm.docs.amd.com/en/docs-7.0.1/compatibility/ml-compatibility/pytorch-compatibility.html
- Sitio oficial de PyTorch: https://pytorch.org/
- Repositorio de origen del build: `Mamoru-Yuasa/pytorch`, tag `mi300a-apu-rocm7.2-torch213-v0.1.0`, commit `f0fb8da574d2ccaa2772726cfd1f65857dfab2ce`
