# fastforks/kernels

## Resumen

`fastforks/kernels` es un repositorio de artefactos binarios publicado por el proyecto fastforks en HuggingFace. No contiene un modelo de lenguaje ni pesos de red neuronal en el sentido habitual: aloja kernels CUDA precompilados para los backends `mode="kernels"` de la librería fastforks, un archivo por biblioteca, build y arquitectura de GPU. Su función es servir de almacén de distribución de código compilado que la librería descarga bajo demanda y verifica mediante SHA-256 contra el `manifest.toml` de cada biblioteca.

El contenido cubre aceleradores para pipelines de visión por computador: estereoscopía y estimación de disparidad (FoundationStereo, CREStereo, RAFT-Stereo, IGEV, HITNet, PatchmatchNet, MoCha-Stereo, Fast-FoundationStereo), profundidad monocular (DPT), backbones de clasificación y segmentación (DINOv2/DINOv3, Restormer, fast-vision-models) y convoluciones fusionadas (deformables, CUTLASS). Todos los builds están compilados con CUDA 12.8 o 13.0 y cubren las arquitecturas sm_80 a sm_120 más `compute_80`, lo que abarca desde A100 hasta Blackwell.

Es relevante porque elimina la necesidad de compilar kernels CUDA en el host del usuario, un cuello de botella habitual en el despliegue de modelos de visión con operaciones personalizadas. El repositorio ocupa 0,5 GB y no registra descargas ni interacciones en el momento de la consulta.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | kernels CUDA precompilados (no es un modelo neuronal) |
| Parámetros totales | no disponible (no aplica) |
| Parámetros activos | no disponible (no aplica) |
| Longitud de contexto | no disponible (no aplica) |
| Tipos de cuantización | no disponible (no aplica; binarios CUDA) |
| Idiomas soportados | no disponible (no aplica) |
| Licencia | per-library (Apache-2.0 y BSD-3-Clause según biblioteca) |
| Formato de pesos | binarios CUDA por biblioteca, build y arquitectura GPU |
| Toolkit CUDA | 12.8 (mayoría) y 13.0 (`igevpp`, `mocha`) |
| Arquitecturas GPU objetivo | sm_80, sm_86, sm_89, sm_90, sm_100, sm_120, compute_80 |
| Tamaño del repositorio | 0,5 GB |
| Librería cliente | fastforks (`mode="kernels"`) |
| Verificación de integridad | SHA-256 contra `manifest.toml` de cada biblioteca |

## Arquitectura y entrenamiento

No se trata de un modelo entrenado, sino de un conjunto de artefactos de compilación. Cada entrada del repositorio corresponde a una biblioteca concreta (`cfs`, `crestereo`, `cudnn_hacc`, `cutlass_conv`, `deform_conv`, `dpt_fused`, `fastbb`, `ffs_cutlass`, `fs`, `fs_cutlass`, `fvm_conv`, `fvm_extra`, `fvm_mb`, `fvm_r3`, `fvm_seg`, `hitnet`, `hitnet_conv`, `igev`, `igevpp`, `mocha`, `mvsanywhere`, `patchmatchnet`, entre otras) compilada para CUDA 12.8 o 13.0 y para cada arquitectura de GPU soportada. Cada build incluye en su manifiesto el toolkit y el compilador de host utilizados.

Las innovaciones técnicas son de bajo nivel. Destacan kernels de atención flash para `head_dim` 64 con esquema online-softmax (DINOv2) y RoPE in-place para DINOv3 (biblioteca `fastbb`); convolución deformable modulada fusionada mediante GEMM implícito y WMMA (`deform_conv`); kernels de coste y argmin para estereoscopía (`hitnet`, `igev`, `igevpp`, `mocha`); y envoltorios ctypes sobre la API de backend de cuDNN 9 para convoluciones con acumulación en fp16 (`cudnn_hacc`). Varias bibliotecas se compilan contra cabeceras de CUTLASS v4.7.1, lo que introduce código BSD-3-Clause junto al Apache-2.0 propio. El código de kernels de fastforks es Apache-2.0 y, según la model card, no incorpora código de NVIDIA en las rutas propias.

## Capacidades

- Distribución de kernels CUDA precompilados para pipelines de visión por computador, sin compilación local.
- Aceleración de estereoscopía y estimación de disparidad: FoundationStereo, CREStereo, RAFT-Stereo, IGEV, IGEV++, GREAT-IGEV, HITNet, PatchmatchNet, MoCha-Stereo, Fast-FoundationStereo, MVSAnywhere.
- Aceleración de profundidad monocular (DPT fusionado) y de backbones de clasificación y segmentación (fast-vision-models, DINOv2/DINOv3, Restormer).
- Convoluciones fusionadas: deformable modulada, MBConv, convoluciones vía CUTLASS, convoluciones con acumulación fp16 sobre cuDNN 9.
- Atención flash y ventana fusionada, normalización de instancia NHWC, LayerNorm y GELU-gate de Restormer.
- Verificación de integridad SHA-256 de cada binario antes de su carga.
- Cobertura multiarquitectura de GPU: sm_80, sm_86, sm_89, sm_90, sm_100, sm_120 y compute_80.
- No ofrece generación de texto, razonamiento, código, matemáticas, tool calling, agentes ni capacidades multilingües: no es un modelo de lenguaje.

## Casos de uso

- Despliegue de modelos de disparidad estéreo en producción: la librería descarga el kernel correspondiente a la GPU del servidor (por ejemplo sm_90 para H100) y evita compilar FoundationStereo o CREStereo en cada nodo, lo que simplifica el escalado horizontal.
- Inferencia de profundidad monocular en flotas heterogéneas: al existir builds para sm_80 a sm_120, el mismo pipeline de DPT puede ejecutarse en A100, L4, H100 y GPUs Blackwell sin recompilar.
- Investigación en visión estéreo: los kernels de IGEV, IGEV++, HITNet, PatchmatchNet y MoCha-Stereo permiten reproducir experimentos de los forks correspondientes con aceleración nativa.
- Backbones de clasificación y segmentación acelerados: `fvm_conv`, `fvm_mb`, `fvm_r3` y `fvm_seg` cubren convoluciones fusionadas, MBConv, atención de ventana y operaciones de segmentación para entrenamiento e inferencia de fast-vision-models.
- Atención eficiente en transformers de visión: `fastbb` aporta flash attention para `head_dim` 64 y RoPE in-place de DINOv3, útil en pipelines de features densas o destilación.
- Convoluciones deformables en detección y correspondencia: `deform_conv` implementa la convolución deformable modulada fusionada con GEMM implícito y WMMA, empleada por AANet y modelos de correspondencia.
- Integración con CUTLASS en cargas de trabajo de convolución: `cutlass_conv`, `fs_cutlass`, `ffs_cutlass`, `fvm_conv` e `hitnet_conv` ofrecen rutas compiladas contra CUTLASS v4.7.1 para quienes ya dependen de esas cabeceras.
- Reproducibilidad en CI: la verificación SHA-256 contra el manifiesto permite fijar versiones de kernels en pipelines de integración continua y detectar artefactos corruptos o alterados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- No aplica VRAM de modelo: son binarios de kernels, no pesos. El consumo de VRAM lo determina el modelo de visión que los invoca.
- GPU soportadas por los builds: sm_80 (A100), sm_86 (A10, A40, RTX 30xx), sm_89 (L4, L40, RTX 40xx), sm_90 (H100), sm_100 (Blackwell de centro de datos) y sm_120 (Blackwell consumer), además de `compute_80` como fallback PTX.
- Cabe en GPU consumer: sí, siempre que la arquitectura esté entre las compiladas (sm_86 y sm_89 cubren RTX 30xx y 40xx; sm_120 cubre Blackwell consumer).
- Toolkit CUDA requerido: 12.8 para la mayoría de bibliotecas; 13.0 para `igevpp` y `mocha`.
- Opciones de despliegue: la librería cliente fastforks en modo `mode="kernels"`, que descarga y verifica los binarios. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, ya que no es un modelo de lenguaje.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. No se han identificado en la información proporcionada repositorios comparables de kernels CUDA precompilados con verificación por manifiesto; las alternativas habituales (compilación JIT con `torch.utils.cpp_extension`, wheels específicos por proyecto) no son artefactos equivalentes y no se dispone de datos para compararlos.

## Limitaciones y advertencias

- No es un modelo: no genera texto, no razona, no responde a prompts. Cualquier evaluación como modelo de lenguaje carece de sentido.
- Dependencia estricta de arquitectura: un kernel compilado para sm_89 no se ejecuta de forma nativa en sm_90; solo `compute_80` ofrece portabilidad PTX, con posible penalización de rendimiento.
- Dependencia de toolkit: los builds con CUDA 13.0 (`igevpp`, `mocha`) requieren un entorno compatible; mezclar toolkits puede provocar fallos de carga.
- Licencia mixta: el código propio es Apache-2.0, pero las bibliotecas compiladas contra CUTLASS incorporan código BSD-3-Clause. Es obligatorio revisar `THIRD_PARTY_NOTICES.md` antes de redistribuir. La licencia global declarada es "other" con nombre "per-library", por lo que la licencia aplicable depende de cada biblioteca.
- Sin tracción verificable: 0 descargas y 0 likes en el momento de la consulta; no hay evidencia pública de uso en producción.
- Sin benchmarks publicados: no es posible estimar la ganancia de rendimiento frente a alternativas sin medir en el hardware objetivo.
- Riesgo de cadena de suministro: aunque la verificación SHA-256 protege la integridad del binario descargado, la confianza última recae en el manifiesto y en la infraestructura del repositorio.
- Idiomas, sesgos y alucinación: no aplican al no ser un modelo generativo.
- Fecha de creación registrada (2026-10-28) y de actualización (2026-11-04): verificar que el repositorio sigue activo antes de fijarlo como dependencia.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/fastforks/kernels
- Repositorio de la librería fastforks: https://github.com/kleinicke/fastforks
- CUTLASS (dependencia de cabeceras, BSD-3-Clause): https://github.com/NVIDIA/cutlass
- FoundationStereo (proyecto de origen de varios forks): no disponible en la información proporcionada
- CREStereo, RAFT-Stereo, IGEV, HITNet, PatchmatchNet, MoCha-Stereo, DPT, DINOv2/DINOv3, Restormer: no se incluyen URLs en la información proporcionada
