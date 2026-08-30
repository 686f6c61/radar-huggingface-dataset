# baa-ai/Krea-2-Turbo-RAM-8bit-MLX

## Resumen

Krea-2-Turbo-RAM-8bit-MLX es una conversión cuantizada del modelo de generación de imágenes Krea-2-Turbo, desarrollada por baa.ai mediante su pipeline propietario RAM (Rate-Adaptive Mixed-precision). El modelo está diseñado específicamente para ejecutarse de forma nativa en Apple Silicon a través de la librería mflux, sin depender de PyTorch ni de fallbacks MPS. Esta versión representa el "techo de calidad" de la familia RAM, con una cuantización uniforme de 8 bits en los 256 lineales del transformer.

El modelo base, Krea-2-Turbo, es un modelo de difusión texto-imagen entrenado desde cero por Krea AI, enfocado en exploración creativa y estilística. Esta conversión reduce el tamaño del transformer de 25,64 GB (bf16) a 13,92 GB, una reducción de 1,84×, manteniendo el text encoder Qwen3-VL y el VAE en precisión completa bf16 para no degradar el condicionamiento del prompt. El resultado es un checkpoint que permite generar imágenes de 1024×1024 en aproximadamente 59 segundos en un M2 Ultra, con una calidad perceptual muy cercana a la referencia bf16 (LPIPS 0,063).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Diffusion transformer (Krea-2-Turbo) con text encoder Qwen3-VL y VAE |
| Parametros totales | 3.836.774.988 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo de generacion de imagenes, no texto) |
| Tipos de cuantizacion | 8-bit uniforme, affine, group size 64 (transformer); bf16 (text encoder y VAE) |
| Idiomas soportados | en (ingles) |
| Licencia | Krea 2 Community License (krea-2-community-license) |
| Formato de pesos | MLX (safetensors) |

## Arquitectura y entrenamiento

Krea-2-Turbo es un modelo de difusion texto-imagen con arquitectura de transformer, entrenado desde cero por Krea AI. El modelo base fue sometido a destilacion temporal (timestep distillation), lo que permite generar imagenes en solo 8 pasos de inferencia con guidance 1.0. El text encoder es Qwen3-VL, que se mantiene en bf16 en esta conversion por que cuantizarlo degrada notablemente el condicionamiento del prompt.

La conversion RAM de baa.ai aplica cuantizacion post-entrenamiento unicamente a los pesos (weights-only), sin reentrenamiento ni fine-tuning. El proceso RAM evaluo los 256 lineales del transformer a 2/3/4/5/6/8 bits, midiendo el SQNR (Signal-to-Quantization-Noise Ratio) por tensor, y resolvio un problema de asignacion tipo knapsack contra un presupuesto de tamano. En esta build de 8 bits, el allocator determino que no habia ganancia de SQNR por encima de 8 bits, por lo que la asignacion converge en 8 bits uniformes. La curva de sensibilidad por capa es en forma de U, con las capas 0 y 27 recibiendo ~5,4 bits y el centro del stack ~4,7 bits en las versiones de menor presupuesto.

## Capacidades

- Generacion de imagenes texto-a-imagen de alta calidad a resolucion 1024×1024
- Inferencia rapida con solo 8 pasos gracias a la destilacion temporal del modelo base
- Ejecucion nativa en Apple Silicon (M1 o posterior) via mflux, sin PyTorch ni MPS
- Cuantizacion 8-bit del transformer con text encoder y VAE en precision completa
- Soporte de guidance scale 1.0 (configuracion optima para el modelo destilado)
- Generacion reproducible mediante semilla fija (seed)
- Calidad perceptual cercana a la referencia bf16 (LPIPS 0,063, PSNR 29,2 dB)
- Compatible con el ecosistema mflux (CLI y API Python)

## Casos de uso

- Generacion de imagenes en equipos Apple Silicon con memoria unificada limitada: el modelo permite ejecutar Krea-2-Turbo en Macs con 32 GB o mas de RAM unificada, algo inviable con los pesos bf16 originales de 25,64 GB.
- Iteracion creativa rapida en estudios de diseno: con 8 pasos de inferencia y ~59 s/imagen en M2 Ultra, los disenadores pueden generar variaciones de ilustraciones expresivas sin necesidad de infraestructura cloud.
- Despliegue local con privacidad de datos: al ejecutarse completamente en local, es adecuado para entornos donde los prompts o las imagenes generadas no pueden salir de la infraestructura del cliente.
- Prototipado de pipelines de generacion de imagenes: la API Python de mflux permite integrar el modelo en flujos automatizados de generacion, por ejemplo para crear assets de videojuegos o storyboards.
- Evaluacion de calidad de cuantizacion: al ser la build de "techo de calidad" de la familia RAM, sirve como referencia para comparar el impacto perceptual de cuantizaciones mas agresivas (4-bit, RAM 9 GB, etc.).
- Generacion de imagenes en entornos air-gapped: al no requerir conexion a servicios cloud, puede desplegarse en infraestructuras aisladas para sectores regulados.

## Benchmarks y rendimiento

Resultados medidos en M2 Ultra con 10 prompts, semillas coincidentes, 1024×1024, 8 pasos, guidance 1.0. LPIPS es distancia perceptual respecto a la referencia bf16 (menor es mejor).

| Build | Transformer | LPIPS ↓ | PSNR ↑ | CLIP ↑ | s/imagen |
|---|---|---|---|---|---|
| Uniform 4-bit | 7,67 GB | 0,2423 | 19,2 | 34,50 | 56 s |
| RAM 9 GB | 9,19 GB | 0,2076 | 20,6 | 34,41 | 58 s |
| Hand-tuned mixed 4/8 | 9,84 GB | 0,2102 | 20,3 | 34,42 | 57 s |
| RAM 11,4 GB | 11,44 GB | 0,1319 | 24,4 | 34,44 | 59 s |
| **RAM 8bit (esta build)** | **13,92 GB** | **0,0630** | **29,2** | **34,22** | **59 s** |
| bf16 (referencia) | 25,64 GB | ref | ref | 34,35 | 56 s |

Notas del autor: la cuantizacion 8-bit no es perceptualmente sin perdidas (LPIPS 0,063). El score CLIP es plano en todas las builds (34,2-34,9), lo que indica que la cuantizacion cambia que imagen se genera mas que si el prompt se cumple. La cuantizacion compra memoria, no velocidad: todas las builds tardan 56-60 s/imagen, y bf16 fue el mas rapido (55,7 s) porque la generacion esta limitada por la atencion, que no esta cuantizada.

## Requisitos de hardware

- Apple Silicon Mac (M1 o posterior) obligatorio
- 32 GB o mas de memoria unificada recomendado
- GPU integrada de Apple Silicon (no requiere GPU discreta)
- mflux >= 0.18, < 0.19 (versiones anteriores no soportan Krea 2)
- El transformer ocupa 13,92 GB; el repositorio completo (incluyendo text encoder bf16 y VAE) ocupa 22,48 GB
- Inferencia a ~59 s/imagen en M2 Ultra a 1024×1024 con 8 pasos
- No requiere PyTorch ni CUDA; ejecucion nativa via MLX

## Comparativa con modelos similares

| Modelo | Tamano transformer | Cuantizacion | LPIPS ↓ | PSNR ↑ | s/imagen |
|---|---|---|---|---|---|
| **RAM 8bit (esta build)** | 13,92 GB | 8-bit uniforme | 0,0630 | 29,2 | 59 s |
| RAM 11,4 GB | 11,44 GB | Mixta (asignacion RAM) | 0,1319 | 24,4 | 59 s |
| RAM 9 GB | 9,19 GB | Mixta (asignacion RAM) | 0,2076 | 20,6 | 58 s |
| Uniform 4-bit | 7,67 GB | 4-bit uniforme | 0,2423 | 19,2 | 56 s |
| bf16 (referencia) | 25,64 GB | Sin cuantizar | ref | ref | 56 s |

La comparativa muestra el trade-off entre tamano y calidad perceptual dentro de la misma familia de cuantizaciones. Esta build de 8 bits es la que mas se acerca a la referencia bf16, a costa de un mayor tamano. Alternativas de otros autores, como avlp12/Krea-2-Turbo-Alis-MLX-8bit, existen en HuggingFace pero no se dispone de datos comparativos publicados.

## Limitaciones y advertencias

- Licencia restrictiva: Krea 2 Community License, no es una licencia open source convencional. Requiere revision del acuerdo en krea.ai/krea-2-licensing antes de uso comercial.
- No es un producto oficial de Krea: es una modificacion post-entrenamiento (solo cuantizacion de pesos) realizada por baa.ai, sin respaldo ni endorsement de Krea.
- Requiere un loader especifico: el checkpoint necesita el script `load_krea2_ram.py` incluido en el repositorio; el mflux estandar no reproduce la estructura de pesos correctamente.
- La cuantizacion 8-bit no es perceptualmente sin perdidas: LPIPS 0,063 y PSNR 29,2 dB frente a bf16 indican diferencias medibles, aunque pequenas.
- Solo soporta ingles: el text encoder Qwen3-VL esta entrenado principalmente en ingles; prompts en otros idiomas pueden degradar la calidad.
- Sin soporte para GPUs NVIDIA o AMD: exclusivo para Apple Silicon via MLX.
- La cuantizacion no mejora la velocidad: la generacion esta limitada por la atencion, que no esta cuantizada; el modelo bf16 original es ligeramente mas rapido.
- RAM no funciona bien con presupuestos agresivos: el autor advierte que no se debe usar RAM por debajo de ~9 GB para este modelo, ya que las asignaciones de 3 bits degradan significativamente la calidad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/baa-ai/Krea-2-Turbo-RAM-8bit-MLX
- Modelo base: https://huggingface.co/krea/Krea-2-Turbo
- Repositorio oficial de Krea 2: https://github.com/krea-ai/krea-2
- mflux (libreria de inferencia): https://github.com/filipstrand/mflux
- Licencia Krea 2: https://krea.ai/krea-2-licensing
- Pagina del modelo Krea 2 Turbo: https://www.krea.ai/models/krea-2-turbo
- Documentacion API de Krea 2 Turbo: https://www.krea.ai/docs/api-reference/krea/krea-2-turbo
- baa.ai (desarrollador de la conversion): https://baa.ai
