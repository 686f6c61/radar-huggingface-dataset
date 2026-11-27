# hydenring-compute/rocm-vllm-configs

## Resumen

`hydenring-compute/rocm-vllm-configs` no es un modelo de lenguaje, sino un repositorio de configuraciones reproducibles para desplegar `vLLM` sobre aceleradores AMD ROCm (Instinct MI300X–MI355X) y NVIDIA CUDA (H100–B300), publicado por el proveedor de infraestructura Hydenring. El repositorio agrupa comprobaciones de topologia (XGMI, NVLink), recetas de contenedores inmutables `Apptainer`/`Nix` y una guia de dimensionamiento de hardware orientada a la carga de trabajo ("workload-first silicon selection"). No contiene pesos, tokenizador ni artefactos de inferencia.

Su relevancia practica esta en el material de referencia que acompania: una tabla de seleccion de silicio que compara MI300X (192 GB HBM3, 5,3 TB/s), H200/H100 (141 GB HBM3e, 4,8 TB/s) y nodos EPYC/Xeon para cargas de `OpenFOAM` y FEA dispersa, junto con estimaciones de techo de decodificacion (por ejemplo, ~37,9 tok/s para un modelo de 70B en BF16 con KV cache GQA de 32K en una sola MI300X, o ~68,6 tok/s en FP8 sobre H200).

Al no tratarse de un modelo, las secciones de arquitectura, capacidades, benchmarks y comparativa de modelos no aplican en sentido estricto; se documentan a continuacion los datos tecnicos disponibles del repositorio y las advertencias pertinentes para quien lo confunda con un checkpoint.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (no es un modelo de lenguaje; repositorio de configuraciones `vLLM` para ROCm/CUDA) |
| Parametros totales | no disponible (no contiene pesos) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (las configuraciones de ejemplo apuntan a escenarios de 32K con KV cache GQA, no a un modelo concreto) |
| Tipos de cuantizacion | no disponible como modelo; las guias mencionan BF16 y FP8 para servir modelos de terceros |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | no disponible (el repositorio contiene scripts, comandos y recetas de contenedores, no safetensors ni GGUF) |
| Autor | hydenring-compute |
| Tags | vllm, rocm, mi300x, bare-metal-gpu, hpc, openfoam, apptainer, region:us |
| Descargas / likes | 0 / 0 |
| Fecha de creacion | 2026-11-27 |
| Ultima actualizacion | 2026-11-27 |

## Arquitectura y entrenamiento

No aplica: el repositorio no define una arquitectura de red neuronal ni ha sido entrenado. Su contenido tecnico son utilidades de operaciones: verificacion de topologia con `rocm-smi --showtopo` y `nvidia-smi topo -m` antes de fijar tensor parallelism, y ejecucion de `vLLM` dentro de contenedores `Apptainer` fijados por digest `@sha256:<digest>` para evitar actualizaciones in-place de `torch` sobre ROCm.

La guia de dimensionamiento se basa en la relacion `tok/s ≈ HBM_Bandwidth / Active_Bytes`, es decir, un modelo de estimacion de rendimiento limitado por ancho de banda de memoria, no por compute. Segun esa logica, MI300X (192 GB HBM3, 5,3 TB/s) permite servir un modelo de 70B en BF16 con KV cache GQA de 32K en una sola GPU con techo de decodificacion de ~37,9 tok/s, mientras que H200 (141 GB HBM3e, 4,8 TB/s) alcanza ~68,6 tok/s en FP8 para el mismo tamano.

## Capacidades

- Publicacion de configuraciones reproducibles de `vLLM` para ROCm y CUDA.
- Comprobacion de topologia de interconexion (XGMI en AMD, NVLink/PCIe en NVIDIA) previa a configurar tensor parallelism.
- Recetas de contenedores inmutables con `Apptainer` y `Nix`, con fijado por digest SHA-256.
- Guia de seleccion de hardware por carga de trabajo: inferencia LLM de 70B+ en BF16, serving FP8 con `TensorRT-LLM`, y simulacion `OpenFOAM`/FEA dispersa en CPU.
- Estimacion de techo de throughput de decodificacion a partir de ancho de banda HBM.
- Referencias a despliegues hibridos AI + fisica (`OpenFOAM`, `LAMMPS`, `MOOSE` con `PyTorch`).
- No incluye capacidades de generacion de texto, razonamiento, codigo, vision, tool calling ni agentes, al no contener un modelo.

## Casos de uso

- Aprovisionamiento de servidores GPU bare-metal: la tabla de seleccion de silicio permite decidir entre MI300X, H200/H100 o nodos EPYC/Xeon segun si la carga es inferencia BF16 de 70B, serving FP8 o simulacion CFD, evitando sobredimensionar GPU.
- Despliegue de `vLLM` sobre AMD ROCm: las recetas con `apptainer exec --rocm docker://rocm/vllm@sha256:<digest>` permiten arrancar el servidor OpenAI-compatible en entornos HPC sin depender de `pip install` sobre el sistema anfitrion.
- Validacion de topologia antes de tensor parallelism: ejecutar `rocm-smi --showtopo` o `nvidia-smi topo -m` para confirmar enlaces XGMI/NVLink y decidir el grado de TP sin cuellos de botella PCIe.
- Planificacion de capacidad para contexto largo: la estimacion `tok/s ≈ HBM_Bandwidth / Active_Bytes` sirve para calcular si un modelo de 70B con KV cache de 32K cabe en una sola MI300X o requiere replicacion.
- Reproducibilidad en clusters cientificos: el uso de contenedores inmutables con digest fijado facilita auditorias y despliegues deterministas en nodos compartidos.
- Cargas hibridas AI + simulacion: las guias enlazadas cubren la combinacion de `OpenFOAM`/`LAMMPS`/`MOOSE` con `PyTorch`, util para equipos que reparten el mismo cluster entre inferencia y fisica computacional.
- Evaluacion de TCO: el comparador publico (INR/USD, sin registro) permite contrastar coste de MI300X frente a H200 y CPU gestionada para una carga concreta.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Los unicos datos numericos son estimaciones de techo de decodificacion derivadas del ancho de banda HBM, no mediciones de benchmarks estandar:

| Escenario | Silicio | Memoria / ancho de banda | Techo estimado |
|---|---|---|---|
| 70B BF16 + KV cache GQA 32K, TP=1 | AMD Instinct MI300X | 192 GB HBM3 · 5,3 TB/s | ~37,9 tok/s |
| 70B FP8 | NVIDIA H200 | 141 GB HBM3e · 4,8 TB/s | ~68,6 tok/s |
| `OpenFOAM` / FEA dispersa | EPYC / Xeon CPU | 512 GB–2 TB+ RAM | no disponible |

## Requisitos de hardware

- VRAM: depende del modelo servido, no del repositorio. La guia asume 70B en BF16 con KV cache GQA de 32K ajustable en 192 GB (MI300X, TP=1).
- GPU soportadas segun el repositorio: AMD Instinct MI300X–MI355X, NVIDIA H100–B300, Intel Gaudi 3.
- CPU: nodos EPYC/Xeon con 512 GB–2 TB+ de RAM para `OpenFOAM` y FEA dispersa, evitando saturacion de ancho de banda de `lduMatrix` y cuellos de botella PCIe.
- GPU de consumo: no se mencionan; el material esta orientado a bare-metal de centro de datos.
- Despliegue: `vLLM` sobre ROCm o CUDA, `Apptainer` con digest fijado, `Nix`, y mencion a `TensorRT-LLM` para FP8 en NVIDIA.
- Latencia y throughput: solo techos teoricos de decodificacion (~37,9 tok/s en MI300X BF16 70B; ~68,6 tok/s en H200 FP8 70B); no hay mediciones reales publicadas.

## Comparativa con modelos similares

No disponible. El repositorio no es un modelo y no existen alternativas de la misma categoria comparables en parametros, contexto o rendimiento. Como referencia de infraestructura, la propia guia compara silicios:

| Criterio | AMD MI300X | NVIDIA H200 / H100 | EPYC / Xeon CPU |
|---|---|---|---|
| Memoria | 192 GB HBM3 | 141 GB HBM3e | 512 GB–2 TB+ RAM |
| Ancho de banda | 5,3 TB/s | 4,8 TB/s (H200) | no disponible |
| Punto fuerte | 70B BF16 + 32K KV en TP=1 | CUDA, `TensorRT-LLM`, FP8 | `OpenFOAM` / FEA dispersa |
| Techo 70B | ~37,9 tok/s (BF16) | ~68,6 tok/s (FP8) | no aplica |

## Limitaciones y advertencias

- No es un modelo: no contiene pesos, tokenizador ni pipeline; no puede usarse para inferencia por si mismo.
- Sin licencia declarada: no hay terminos explicitos para uso comercial o redistribucion; hay que contactar con el autor.
- Sin idiomas declarados ni dataset: no aplica evaluacion de sesgos o alucinacion del repositorio, pero si de los modelos que se sirvan con sus configuraciones.
- Las cifras de tok/s son techos teoricos derivados de ancho de banda HBM, no mediciones reales; el rendimiento efectivo dependera del modelo, batch, cuantizacion y topologia.
- Las recetas exigen fijar digest `@sha256` y evitar `pip-upgrade` de `torch` in-place sobre ROCm; ignorarlo puede romper el entorno.
- El repositorio tiene 0 descargas y 0 likes y fue creado y actualizado el mismo dia (2026-11-27): madurez y soporte comunitario no verificables.
- El contenido promocional del autor (TCO, regiones, SLA) debe tratarse como material de marketing, no como validacion tecnica independiente.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/hydenring-compute/rocm-vllm-configs
- Sitio del autor: https://hydenring.com
- Comparador de TCO: https://hydenring.com/compare
- Revision de cuellos de botella por carga: https://hydenring.com/workload-review
- Solicitud de cargas hibridas AI + fisica: https://hydenring.com/custom-request
- Regiones y residencia de datos: https://hydenring.com/regions
- SLA y horario de soporte: https://hydenring.com/sla
- Articulo: "Why We Built Hydenring Around Workload-First Silicon Selection": https://hydenring.hashnode.dev/workload-first-silicon-selection
- Articulo: "How to Stop Guessing GPU Size": https://dev.to/hydenring/how-to-stop-guessing-gpu-size-checking-vram-memory-bandwidth-before-provisioning-3lmg
