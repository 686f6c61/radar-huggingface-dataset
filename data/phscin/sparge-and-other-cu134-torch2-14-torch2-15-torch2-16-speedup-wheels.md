# phscin/sparge-and-other-cu134-torch2.14-torch2.15-torch2.16-speedup-wheels

## Resumen

Este repositorio de Hugging Face no contiene un modelo de IA generativa, sino un conjunto de wheels precompilados (`.whl`) para Windows x64 destinados a acelerar kernels de atención en PyTorch sobre GPUs NVIDIA. El autor, `phscin`, distribuye binarios de proyectos de terceros como SageAttention, SageAttention2++, SageAttention3, SpargeAttn y una variante propia denominada `spas_sage_hswq_attn`. El objetivo es evitar la compilación local de extensiones CUDA, un proceso habitualmente problemático en Windows por la falta de toolchains completas y por las incompatibilidades ABI entre versiones de PyTorch y CUDA.

Los wheels están compilados contra combinaciones muy concretas de software: CPython 3.13, CUDA 13.2 o 13.4, y distintas versiones de PyTorch (2.14.0, 2.15.0 y una build de desarrollo de 2.16). Algunos builds apuntan explícitamente a `SM120`, que corresponde a la compute capability de las GPUs Blackwell de consumo (RTX 50 series). El repositorio ocupa 1,2 GB y se distribuye bajo licencia Apache 2.0.

La relevancia es práctica y acotada: para quienes ejecutan pipelines de difusión (Stable Diffusion, SDXL, SD 3.5, Flux, WAN, HunyuanVideo, LTX Video) o inferencia de transformers en Windows con GPUs RTX recientes, disponer de kernels de atención optimizados sin compilar puede reducir el tiempo de puesta en marcha y mejorar el throughput. No se trata de un modelo entrenado, por lo que no hay parámetros, contexto ni capacidades cognitivas que evaluar.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (no es un modelo; son extensiones CUDA para kernels de atención) |
| Parámetros totales | no disponible (no aplica) |
| Parámetros activos | no disponible (no aplica) |
| Longitud de contexto | no disponible (no aplica) |
| Tipos de cuantización | no disponible (no aplica al paquete; los kernels operan sobre tensores en precisión nativa, sin datos publicados) |
| Idiomas soportados | no disponible (no aplica) |
| Licencia | Apache 2.0 |
| Formato de pesos | no disponible (no hay pesos; el artefacto distribuido es `.whl`, wheel de Python para Windows x64) |

Especificaciones del artefacto:

| Parámetro | Valor |
|---|---|
| Plataforma | Windows x64 |
| Versión de Python | CPython 3.13 (`cp313`) |
| Runtimes CUDA referenciados | 13.2 y 13.4 (también se mencionan 12.4, 12.6, 12.8 y 13.0 en las etiquetas) |
| Versiones de PyTorch referenciadas | 2.14.0, 2.15.0, build de desarrollo de 2.16 |
| ABI | `cxx11abitrue` |
| Compute capability destacada | SM120 (Blackwell, RTX 50 series) |
| Tamaño del repositorio | 1,2 GB |
| Descargas | 0 |
| Likes | 1 |

## Arquitectura y entrenamiento

No hay arquitectura de red neuronal ni proceso de entrenamiento: el repositorio empaqueta código CUDA compilado que implementa variantes de atención eficiente. SageAttention y SageAttention2/2++ son esquemas de atención cuantizada orientados a difusión y transformers; SageAttention3 y SpargeAttn (a menudo asociado a Sage2++) incorporan técnicas de atención dispersa o podada para reducir el coste computacional del producto `softmax(QK^T)V`. El wheel `spas_sage_hswq_attn` es una variante del autor, presumiblemente una fusión o adaptación de estos kernels, aunque la model card no documenta su implementación interna.

La innovación técnica, en la medida en que el repositorio aporta algo, es la distribución de binarios ya compilados para combinaciones de toolchain poco cubiertas oficialmente (CUDA 13.4 con PyTorch 2.14/2.15 y Python 3.13 en Windows). El autor advierte que los wheels se compilaron contra configuraciones específicas y que la compatibilidad con versiones más recientes de PyTorch no está garantizada, dependiendo de cambios ABI y dependencias en tiempo de ejecución. No se documentan datasets, tokens de entrenamiento, RLHF ni DPO porque no aplica.

## Capacidades

- Aceleración de kernels de atención en PyTorch sobre GPU NVIDIA en Windows x64.
- Implementaciones empaquetadas: SageAttention3, SpargeAttn/Sage2++, SageAttention 2.2.0 y `spas_sage_hswq_attn` en versiones 1.0.0 y 1.2.1.
- Soporte de builds para CUDA 13.2 y 13.4, con `SM120` para GPUs Blackwell de consumo.
- Integración prevista con pipelines de difusión (Stable Diffusion, SDXL, SD 3.5, Flux, Flux.1, WAN 2.1/2.2, HunyuanVideo, LTX Video) y con ComfyUI mediante nodos personalizados.
- Instalación mediante `pip install` de un fichero `.whl` local.
- No ofrece generación de texto, razonamiento, código, matemáticas, visión, tool calling, agentes ni capacidades multilingües: esas categorías no aplican a este artefacto.

## Casos de uso

- Acelerar inferencia de difusión en Windows: instalar el wheel de SageAttention o SpargeAttn en el entorno de ComfyUI para sustituir la atención estándar de PyTorch por kernels optimizados, reduciendo el tiempo por paso en generación de imagen.
- Generación de vídeo con WAN o HunyuanVideo en RTX 50 series: usar el build `SM120` compilado para CUDA 13.4, que evita la compilación local de extensiones CUDA en Windows, un proceso habitualmente fallido por ausencia de Visual Studio Build Tools y de `nvcc` compatible.
- Despliegue reproducible de entornos: fijar la combinación Python 3.13, PyTorch 2.15.0 y CUDA 13.4 mediante un wheel concreto, de modo que el entorno quede reproducible sin depender de la compilación en cada máquina.
- Evaluación comparativa de kernels de atención: instalar distintas variantes (Sage3, Sage2++, HSWQ) en entornos aislados y medir latencia y calidad de salida sobre el mismo pipeline para decidir cuál conviene en producción.
- Investigación en difusión de vídeo: probar atención dispersa o cuantizada en modelos como LTX Video sin tener que construir los kernels desde el código fuente, lo que reduce la barrera para experimentar con optimizaciones de atención.
- Integración en nodos personalizados de ComfyUI: el autor menciona un wheel para LTX 2.5 que requiere un nodo específico descargable desde custom nodes, útil para flujos de trabajo que ya dependen de esos nodos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye latencias, throughput, comparativas numéricas ni métricas de calidad de salida para ninguno de los wheels.

## Requisitos de hardware

- Sistema operativo: Windows x64 exclusivamente; no se distribuyen builds para Linux.
- Python: CPython 3.13.
- GPU: NVIDIA con soporte para los kernels compilados; el build `SM120` está pensado para Blackwell (RTX 50 series) y no implica compatibilidad con todas las RTX.
- VRAM: no disponible; depende del modelo de difusión o transformer que se ejecute, no del wheel.
- GPUs recomendadas: no disponible en la información proporcionada; las etiquetas mencionan RTX 30, 40 y 50 series, Ampere, Ada Lovelace y Blackwell, pero sin lista de compatibilidad verificada.
- Despliegue: instalación vía `pip` del `.whl`; no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que no aplican a este artefacto.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Artefacto | Tipo | Plataforma | Licencia | Estado |
|---|---|---|---|---|
| Este repositorio (`phscin/...speedup-wheels`) | Wheels precompilados de atención (Sage3, SpargeAttn, Sage2++, HSWQ) | Windows x64, Python 3.13, CUDA 13.2/13.4 | Apache 2.0 | Disponible, 0 descargas |
| SageAttention (repositorio original) | Código fuente de kernels de atención cuantizada | Multiplataforma (compilación local) | No disponible en la información proporcionada | Disponible como proyecto upstream |
| FlashAttention (`flash-attn`) | Kernels de atención con IO-awareness | Linux principalmente; Windows con compilación manual | No disponible en la información proporcionada | Disponible como proyecto upstream |
| xFormers | Componentes y kernels de atención optimizados | Multiplataforma | No disponible en la información proporcionada | Disponible como proyecto upstream |

La comparación relevante no es de parámetros ni contexto, sino de facilidad de instalación en Windows y de cobertura de combinaciones CUDA/PyTorch. Los proyectos upstream exigen compilación local; este repositorio ofrece binarios ya construidos, a cambio de fijar versiones muy concretas y de no garantizar compatibilidad fuera de ellas.

## Limitaciones y advertencias

- No es un modelo: no genera texto, no razona y no tiene parámetros, contexto ni capacidades cognitivas. Cualquier evaluación como modelo de IA es improcedente.
- Solo Windows x64 y CPython 3.13; no hay wheels para Linux, macOS ni otras versiones de Python.
- Compatibilidad frágil: los wheels se compilaron contra versiones específicas de PyTorch y CUDA; el autor advierte que versiones más recientes pueden fallar por cambios ABI o dependencias en tiempo de ejecución.
- `SM120` identifica una compute capability concreta y no garantiza funcionamiento en todas las RTX; la compatibilidad depende de cada build.
- Los binarios se distribuyen "as-is", sin garantías de rendimiento ni de corrección numérica; no se publican benchmarks que respalden las mejoras de velocidad.
- Riesgo de seguridad y cadena de suministro: instalar wheels binarios de un autor individual con 0 descargas y 1 like implica confiar en artefactos no auditados; conviene verificar hashes y revisar el contenido antes de usarlos en producción.
- La model card contiene una entrada confusa sobre un wheel para LTX 2.5 con texto incompleto ("requires a fit bleh node", "compile not included"), lo que indica documentación poco rigurosa.
- Licencia Apache 2.0 declarada, pero al empaquetar código de terceros (SageAttention, SpargeAttn, FlashAttention, xFormers) las obligaciones de atribución y las licencias de cada proyecto upstream deben verificarse por separado.
- Sin soporte documentado, sin issues de referencia y sin mantenimiento garantizado.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/phscin/sparge-and-other-cu134-torch2.14-torch2.15-torch2.16-speedup-wheels
- Ficheros del wheel HSWQ 1.2.1: https://huggingface.co/phscin/spas_sage_hswq_attn-1.2.1cu134torch2.15.0cxx11abitrue-cp313-cp313-win_amd64/tree/main
- SageAttention (proyecto upstream, no enlazado en la model card): no disponible
- SpargeAttn (proyecto upstream, no enlazado en la model card): no disponible
- FlashAttention (proyecto upstream, no enlazado en la model card): no disponible
- xFormers (proyecto upstream, no enlazado en la model card): no disponible
- ComfyUI (entorno de uso mencionado, no enlazado en la model card): no disponible
