# chococka/SageAttention2

## Resumen

SageAttention2 no es un modelo de lenguaje, sino una biblioteca de atención cuantizada en INT8 distribuida como wheel precompilado para GPU NVIDIA RTX 50 (arquitectura Blackwell, sm_120) sobre Linux. El paquete, publicado por el usuario `chococka` en Hugging Face, empaqueta la versión 2.2.0 de SageAttention, un kernel de atención que sustituye a FlashAttention2 en el cálculo de self-attention de transformers y modelos de difusión, ofreciendo según su model card una aceleración de 2 a 3 veces sin pérdida de precisión.

El artefacto se construye a partir del fork `woct0rdho/SageAttention`, que a su vez deriva del repositorio original `thu-ml/SageAttention` v2.2.0. Su valor práctico es evitar la compilación manual de kernels CUDA para las GPUs Blackwell, un proceso habitualmente problemático por la incompatibilidad de versiones de CUDA y PyTorch. El wheel es ABI3 estable, por lo que un único binario funciona con Python 3.9 o superior.

El repositorio de Hugging Face no contiene pesos de modelo ni una model card convencional: el tamaño del repo es de 0,0 GB y la información disponible se limita a la documentación de instalación y a las características del kernel. Cualquier evaluación como modelo generativo queda, por tanto, fuera de alcance.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No aplica (kernel de atención cuantizada, no es un modelo neuronal) |
| Parametros totales | No disponible (no es un modelo con pesos) |
| Parametros activos | No aplica |
| Longitud de contexto | No disponible (depende del modelo que lo integre) |
| Tipos de cuantizacion | INT8 para QK, acumulación FP16 en PV |
| Idiomas soportados | No aplica |
| Licencia | Apache 2.0 |
| Formato de pesos | Wheel de Python (`sageattention-2.2.0+cu130torch2.11.0andhigher-cp39-abi3-linux_x86_64.whl`), sin safetensors ni GGUF |

## Arquitectura y entrenamiento

SageAttention2 implementa un mecanismo de atención con cuantización INT8 de los productos QK con granularidad por hilo (*per-thread*), manteniendo la acumulación PV en FP16 para preservar la precisión numérica. Incluye kernels CUDA nativos para sm_80 (Ampere), sm_89 (Ada) y sm_120 (Blackwell), con un fallback en Triton cuando el kernel específico no está disponible. La API expone `sageattn_varlen`, una variante de atención de longitud variable sin sobrecarga de reshaping, utilizada por pipelines como SeedVR2 y WanVideo.

No hay entrenamiento implicado: se trata de un operador de inferencia que reemplaza total o parcialmente la atención estándar o FlashAttention2 en modelos existentes. El wheel está compilado contra CUDA 13.0 y PyTorch 2.11.0 o superior, y se distribuye con ABI3 estable para ser compatible con cualquier Python desde la 3.9. La instalación debe hacerse con `--no-deps` para evitar que pip sobrescriba la instalación de PyTorch del entorno.

## Capacidades

- Aceleración de self-attention en transformers y modelos de difusión mediante cuantización INT8 de QK.
- API `sageattn_varlen` para atención de longitud variable, orientada a modelos de vídeo y difusión (SeedVR2, WanVideo).
- Soporte de kernels CUDA para sm_80, sm_89 y sm_120, con fallback en Triton.
- Wheel ABI3 único compatible con Python 3.9 y posteriores.
- Integración con PyTorch 2.11.0 o superior y CUDA 13.0 o superior.
- No ofrece generación de texto, tool calling, agentes ni capacidades multimodales por sí mismo: es una dependencia de bajo nivel.

## Casos de uso

- Inferencia de modelos de difusión de vídeo en RTX 5090: sustituir FlashAttention2 por `sageattn_varlen` en pipelines como WanVideo para reducir el coste del cálculo de atención en secuencias largas de frames.
- Restauración y superresolución de vídeo con SeedVR2: la API varlen evita el reshaping de tensores y acelera la atención en parches de tamaño variable.
- Despliegue de LLMs en Blackwell sin compilar kernels: instalar el wheel precompilado evita las incompatibilidades de toolchain CUDA que aparecen al compilar SageAttention desde fuente.
- Entornos de investigación con requisitos estrictos de reproducibilidad: un wheel ABI3 fijado a una versión concreta de PyTorch y CUDA simplifica la creación de imágenes de contenedor reproducibles.
- Aceleración de pipelines de generación de imagen (Stable Diffusion y variantes) en GPUs Ada o Ampere, aprovechando los kernels sm_89 y sm_80 incluidos.
- Pruebas comparativas de precisión: validar que la cuantización INT8 de QK con acumulación FP16 no degrada la calidad perceptual en un modelo concreto antes de adoptarla en producción.

## Benchmarks y rendimiento

La model card afirma una aceleración de 2 a 3 veces frente a FlashAttention2 sin pérdida de precisión, pero no proporciona tablas de resultados, configuraciones de prueba ni métricas de calidad. No se han publicado resultados de benchmarks detallados en la información disponible.

## Requisitos de hardware

- GPU: NVIDIA RTX 50 series (sm_120 Blackwell) para el wheel publicado; los kernels incluidos cubren también sm_80 (Ampere) y sm_89 (Ada) con fallback Triton.
- Sistema operativo: Linux x86_64 exclusivamente.
- Python 3.9 o superior (ABI3 estable).
- PyTorch 2.11.0 o superior.
- CUDA 13.0 o superior.
- Triton compatible con la versión de PyTorch instalada.
- VRAM: no disponible; depende del modelo que use el kernel, no del propio paquete.
- Throughput y latencia: no disponibles más allá de la afirmación genérica de 2-3x frente a FlashAttention2.
- Despliegue: instalación vía pip del wheel con `--no-deps`; no aplica a vLLM, llama.cpp, Ollama ni TGI como formato de modelo.

## Comparativa con modelos similares

| Criterio | SageAttention2 (este wheel) | FlashAttention2 | SageAttention upstream (thu-ml) |
|---|---|---|---|
| Tipo | Kernel de atención INT8 precompilado | Kernel de atención FP16/BF16 | Kernel de atención INT8 |
| Soporte Blackwell (sm_120) | Sí, compilado | Depende de la versión | Compilación manual |
| Distribución | Wheel ABI3 precompilado | Paquete con compilación JIT | Código fuente |
| Aceleración declarada | 2-3x frente a FA2 | Referencia | 2-3x frente a FA2 |
| Licencia | Apache 2.0 | BSD-3-Clause | Apache 2.0 |
| Mantenimiento | Fork de usuario, 0 descargas | Amplia comunidad | Repositorio oficial |

## Limitaciones y advertencias

- No es un modelo: no genera texto, no razona y no tiene pesos; no debe evaluarse como LLM.
- El wheel solo funciona en Linux x86_64 con RTX 50 series; en otras GPUs requiere compilación propia o el fallback Triton, con rendimiento potencialmente inferior.
- Exige PyTorch 2.11.0 o superior y CUDA 13.0 o superior, versiones muy recientes que pueden no estar disponibles en todos los entornos.
- Repositorio con 0 descargas y 0 likes, publicado por un usuario individual: no hay garantía de mantenimiento, auditoría ni soporte.
- La afirmación de "sin pérdida de precisión" no está respaldada por datos publicados en la información disponible; conviene validarla en cada modelo.
- Riesgo de dependencia de un fork no oficial: si el fork `woct0rdho/SageAttention` deja de mantenerse, el wheel quedará obsoleto frente a nuevas versiones de PyTorch o CUDA.
- La licencia Apache 2.0 permite uso comercial, pero debe verificarse que los kernels derivados de terceros incluidos mantengan la misma licencia.
- La instalación con `--no-deps` es obligatoria; omitirla puede sobrescribir la instalación de PyTorch y romper el entorno.

## Enlaces

- Hugging Face: https://huggingface.co/chococka/SageAttention2
- Fork utilizado: https://github.com/woct0rdho/SageAttention
- Repositorio upstream: https://github.com/thu-ml/SageAttention
- Versión upstream referenciada: SageAttention v2.2.0
