# deAPI-ai/image-server-wheels

## Resumen

El repositorio `deAPI-ai/image-server-wheels` no contiene un modelo de IA, sino un conjunto de wheels de Python precompilados para kernels de inferencia optimizados, publicados por la organización deAPI. Su propósito es facilitar la instalación de componentes de bajo nivel (atención dispersa, cuantización, kernels GGUF, FlashAttention, SageAttention) en entornos Windows y Linux con CUDA 12.8/12.9/13.0 y PyTorch 2.8/2.10, sin necesidad de compilar desde código fuente.

La relevancia actual radica en que muchos pipelines de generación de imagen y vídeo (como MiniMax-H3 o LTX video) dependen de kernels específicos que no están disponibles en los repositorios oficiales de PyPI para Windows. Este repositorio actúa como un índice de distribución de wheels ya compilados, incluyendo builds propios (como `image_server_kernels` con Sol-Attn y W4A8) y espejos de builds de terceros (FlashAttention, SageAttention). No es un modelo con arquitectura, parámetros ni contexto, sino una infraestructura de soporte para ejecutar modelos de IA de forma eficiente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No aplica (repositorio de kernels y wheels de Python) |
| Parametros totales | No aplica |
| Parametros activos | No aplica |
| Longitud de contexto | No aplica |
| Tipos de cuantizacion | FP8, NVFP4 (W4A4), INT8 (W8A8), W4A8, GGUF Q4_K, Q5_K, Q6_K, Q5_0, Q5_1, Q8_0 |
| Idiomas soportados | No aplica |
| Licencia | other (no especificada en detalle) |
| Formato de pesos | No aplica (wheels de Python: .whl) |

## Arquitectura y entrenamiento

No se trata de un modelo entrenado, por lo que no hay arquitectura de red neuronal ni proceso de entrenamiento. El repositorio contiene binarios compilados de kernels de cómputo para GPU NVIDIA, desarrollados por deAPI y por terceros. Los kernels incluidos en `image_server_kernels-0.4.2` (solo Windows) añaden Sol-Attn (atención dispersa), W4A8 linear y kernels GGUF CUDA integrados en llama.cpp, sobre una base de FP8 denso, NVFP4 W4A4, INT8 W8A8 con ConvRot y QK-norm+RoPE fusionado. La versión 0.3.0 (Windows y Linux) carece de Sol-Attn, W4A8 y kernels GGUF. No hay datos de entrenamiento porque no aplica.

## Capacidades

- Proporciona kernels de atención dispersa (Sol-Attn) que aceleran la inferencia de modelos de vídeo como MiniMax-H3, con una mejora de 2.22x frente a SageAttention2 a cos 0.9805 en secuencias de 15.479 tokens.
- Incluye kernels de cuantización FP8, NVFP4, INT8 y W4A8 para reducir el uso de memoria y acelerar la inferencia en GPUs modernas (SM89 y SM120).
- Ofrece kernels GGUF para deserializar y ejecutar modelos cuantizados en formato GGUF (Q4_K, Q5_K, Q6_K, Q5_0, Q5_1, Q8_0) directamente en CUDA.
- Incluye espejos de FlashAttention 2.8.2/2.8.3 y SageAttention 2.2.0 para Windows y Linux, con soporte para CUDA 12.8, 12.9 y 13.0.
- Aporta wheels puros de Python para `ace_step` (muestreo) y `qwen_tts` (texto a voz, fork parcheado `+deapi3`).
- Soporta Python 3.11 y PyTorch 2.8/2.10, con builds específicos para Windows x64 y Linux x86_64.

## Casos de uso

- Despliegue de servidores de generación de imagen y vídeo en Windows: permite instalar kernels de atención y cuantización sin compilar, reduciendo el tiempo de configuración de horas a minutos.
- Inferencia de modelos de vídeo como MiniMax-H3: el kernel Sol-Attn acelera la atención sobre secuencias largas (hasta 15k tokens) con una mejora de rendimiento de hasta 2.9x frente a SageAttention2.
- Ejecución de modelos cuantizados GGUF en GPU: los kernels GGUF integrados permiten cargar y ejecutar modelos como Llama o Mistral en formato GGUF con kernels CUDA nativos, sin depender de llama.cpp compilado manualmente.
- Entornos de producción con GPUs Ada (SM89) o Blackwell (SM120): los kernels están compilados para estas arquitecturas, cubriendo desde RTX 4090 hasta RTX 5090.
- Integración en pipelines de vídeo con LTX: los kernels `q8_kernels` y `block_sparse_attn` están diseñados específicamente para el pipeline de LTX video.
- Uso como repositorio espejo para equipos que necesitan wheels de FlashAttention o SageAttention en Windows, donde la compilación desde fuente es problemática.

## Benchmarks y rendimiento

Los únicos datos de rendimiento verificados provienen de las pruebas del autor en Windows 11 con RTX 5090 Laptop (SM120), CUDA 12.8 y torch 2.8.0:

| Prueba | Resultado |
|---|---|
| `fp8_dense_gemm` (per-tensor) | cos 0.99965 |
| `fp8_dense_gemm` (per-channel+bias) | cos 0.99972 |
| `fp8_dense_gemm_pre_quantized` | cos 1.00000 |
| `fp8_dense_gemm_sm120` (CUTLASS 3.x) | cos 1.00000 |
| `rmsnorm_forward` | cos 0.999999 |
| Kernels GGUF (Q4_K, Q5_K, Q6_K, Q5_0, Q5_1, Q8_0) | cos 0.99984–1.00000 |
| `sol_attn` en MiniMax-H3 (S=15.479) | 2.22x vs SageAttention2, cos 0.9805 |
| `sol_attn` a 4k tokens | 1.68x, cos 0.965 |
| `sol_attn` a 15.5k tokens | 2.90x, cos 0.980 |

No se han publicado resultados de benchmarks comparativos con otros repositorios de kernels en la información disponible.

## Requisitos de hardware

- GPU NVIDIA con arquitectura Ada (SM89) o Blackwell (SM120) para los kernels de `image_server_kernels-0.4.2` (Windows). La versión 0.3.0 también soporta estas arquitecturas.
- CUDA 12.8 o 12.9 (según el wheel) y PyTorch 2.8 o 2.10.
- Python 3.11 obligatorio (los wheels están compilados para `cp311`).
- VRAM: no especificada, depende del modelo que se ejecute con estos kernels. Los kernels de cuantización FP8/INT8 reducen el consumo de memoria respecto a precisión completa.
- GPU recomendada: RTX 5090 (SM120) para el rendimiento máximo verificado; RTX 4090 (SM89) también compatible.
- Opciones de despliegue: instalación directa con `pip` desde las URLs del repositorio; los kernels se integran en frameworks como PyTorch, llama.cpp o pipelines de vídeo.
- Latencia y throughput: no disponibles de forma general; el único dato es la aceleración de Sol-Attn (2.22x a 15.5k tokens) frente a SageAttention2.

## Comparativa con modelos similares

No aplica directamente, ya que no es un modelo sino un repositorio de kernels. Como alternativa comparable en el ecosistema de wheels precompilados:

| Repositorio | Contenido | Plataformas | Licencia |
|---|---|---|---|
| `deAPI-ai/image-server-wheels` | Kernels propios (Sol-Attn, W4A8, GGUF) + espejos de FlashAttention y SageAttention | Windows, Linux | other |
| `mjun0812/flash-attention-prebuild-wheels` | Solo FlashAttention precompilado | Windows, Linux | BSD-3 (FlashAttention) |
| `wildminder/AI-windows-whl` | Índice de wheels CUDA para Windows | Windows | Variable |

La ventaja de este repositorio es que agrupa kernels propios y de terceros en un solo lugar, con builds verificados para arquitecturas recientes.

## Limitaciones y advertencias

- La versión 0.4.2 de `image_server_kernels` solo está disponible para Windows; la versión Linux se queda en 0.3.0, sin Sol-Attn, W4A8 ni kernels GGUF.
- La licencia se indica como `other` sin especificar términos concretos; no se garantiza el uso comercial sin revisar los archivos de licencia del repositorio.
- Los wheels de SageAttention y FlashAttention son espejos de terceros; la procedencia del wheel de SageAttention para Linux no está confirmada (el autor indica "provenance unconfirmed").
- Los kernels no probados en el hardware del autor (Sol-Attn en Ada, W4A8, NVFP4, FP8 grouped GEMM, W8A16) pueden presentar problemas en otras configuraciones.
- El repositorio no incluye modelos de IA, solo infraestructura; no se puede usar directamente para inferencia sin un framework o modelo que consuma estos kernels.
- No hay soporte para arquitecturas AMD o Apple Silicon; solo NVIDIA CUDA.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/deAPI-ai/image-server-wheels
- Página de archivos: https://huggingface.co/deAPI-ai/image-server-wheels/tree/main
- Organización deAPI en HuggingFace: https://huggingface.co/deAPI-ai
- Web de deAPI: https://deapi.ai/
- Documentación de modelos de deAPI: https://docs.deapi.ai/models
- SageAttention (upstream): https://github.com/thu-ml/SageAttention
- FlashAttention prebuilds (upstream): https://github.com/mjun0812/flash-attention-prebuild-wheels
- Índice de wheels Windows: https://github.com/wildminder/AI-windows-whl
