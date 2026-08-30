# baa-ai/Krea-2-Turbo-RAM-19GB-MLX

## Resumen

Krea-2-Turbo-RAM-19GB-MLX es una conversión del modelo de texto a imagen Krea 2 Turbo al formato MLX, realizada por baa-ai (Black Sheep AI) mediante su pipeline de compresión RAM. El modelo original, desarrollado por Krea, es un transformer de difusión de 12 900 millones de parámetros destilado en tiempo (timestep-distilled) que genera imágenes de alta calidad en solo 8 pasos de inferencia. Esta versión concreta aplica cuantización mixta de precisión variable: mantiene 184 de los 256 tensores lineales del transformer en bf16 y cuantiza los 72 restantes a 8 bits, logrando un tamaño de transformer de 18,84 GB frente a los 25,64 GB del original bf16 (una reducción de 1,36×).

El checkpoint está diseñado para ejecutarse de forma nativa en Apple Silicon a través de mflux, sin depender de PyTorch ni de MPS. Incluye un cargador específico (`load_krea2_ram.py`) necesario porque mflux estándar no puede representar la cuantización mixta con un único valor entero. El text encoder Qwen3-VL y la VAE se mantienen deliberadamente en bf16 para no degradar el condicionamiento del prompt. Según la model card, esta build de 19 GB se publica por completitud; los autores recomiendan las versiones de 9 GB u 8 bits para la mayoría de los usuarios.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de difusión (texto a imagen), destilado en tiempo |
| Parametros totales | 7 610 747 468 (solo transformer; el modelo base Krea 2 Turbo declara 12 900 millones según fuentes externas) |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible (modelo de imagen, no procesa texto de forma autorregresiva) |
| Tipos de cuantizacion | Mixta: 8-bit × 72 tensores, bf16 × 184 tensores; promedio 11,36 bits; cuantización afín con grupo de tamaño 64 |
| Idiomas soportados | Inglés (según metadatos de Hugging Face) |
| Licencia | Krea 2 Community License (licencia personalizada, enlace: https://krea.ai/krea-2-licensing) |
| Formato de pesos | MLX (safetensors con mapa de bits por módulo en `ram_bits.json`) |

## Arquitectura y entrenamiento

Krea 2 Turbo es un modelo de difusión de texto a imagen basado en arquitectura transformer, destilado en tiempo para reducir el número de pasos de inferencia a 8 con guidance 1.0. El modelo original fue entrenado por Krea y su arquitectura interna no se detalla en la información disponible; se sabe que emplea un text encoder Qwen3-VL para el condicionamiento del prompt y una VAE para la decodificación de latentes. Esta versión MLX no modifica los pesos del modelo original, sino que aplica únicamente cuantización post-entrenamiento.

El proceso de cuantización RAM (de baa-ai) analizó los 256 tensores lineales del transformer, midiendo la relación señal-ruido de cuantización (SQNR) por tensor a 2, 3, 4, 5, 6 y 8 bits, y resolvió un problema de asignación tipo mochila (knapsack) contra un presupuesto de tamaño. El resultado es una curva de bits en forma de U: las capas 0 y 27 reciben aproximadamente 5,4 bits, las capas intermedias alrededor de 4,7 bits, las proyecciones K/V se mantienen a 8 bits, Q/O a 6 bits y el grueso del MLP entre 4 y 4,7 bits. El text encoder y la VAE se dejan íntegramente en bf16 porque cuantizarlos degrada notablemente la calidad del condicionamiento.

## Capacidades

- Generación de imágenes a partir de prompts en inglés, con resolución configurable (el ejemplo usa 1024×1024).
- Inferencia rápida gracias a la destilación temporal: 8 pasos con guidance 1.0, sin beneficio al aumentar el número de pasos.
- Ejecución nativa en Apple Silicon mediante mflux, sin dependencias de PyTorch ni MPS.
- Cuantización mixta que reduce el uso de memoria manteniendo la fidelidad perceptual (LPIPS 0,1319 frente al bf16 de referencia en la build de 11,4 GB; esta build de 19 GB no tiene medición propia publicada).
- Compatibilidad con el ecosistema mflux: interfaz CLI y API Python.
- El modelo base Krea 2 Turbo está orientado a ilustraciones expresivas y prototipado rápido, según la descripción oficial de Krea.

## Casos de uso

- Generación de imágenes para iteración creativa: el modo Turbo permite probar múltiples variaciones de un concepto en pocos segundos por imagen, ideal para diseñadores que necesitan explorar direcciones visuales antes de refinar con un modelo de mayor calidad.
- Producción de ilustraciones para contenido editorial o marketing: con 8 pasos de inferencia y guidance 1.0, se pueden generar imágenes de estilo expresivo de forma rápida y consistente, integrándose en flujos de trabajo de diseño.
- Prototipado de assets para videojuegos: los artistas pueden generar fondos, personajes o props conceptuales a partir de descripciones textuales, acelerando la fase de preproducción.
- Generación de imágenes en entornos con restricciones de hardware: al ejecutarse en Apple Silicon con memoria unificada, permite desplegar generación de imágenes en estaciones de trabajo Mac sin necesidad de GPUs dedicadas, útil para estudios pequeños o equipos remotos.
- Automatización de contenido visual para blogs o redes sociales: mediante scripts Python que llaman a la API de mflux, se pueden generar imágenes asociadas a artículos o publicaciones de forma programática.
- Evaluación de calidad de cuantización: esta build concreta sirve como referencia para investigar el impacto de la cuantización mixta en modelos de difusión, comparando métricas perceptuales (LPIPS, PSNR) entre distintas asignaciones de bits.

## Benchmarks y rendimiento

La model card publica resultados de una evaluación con 10 prompts, semillas emparejadas, resolución 1024×1024, 8 pasos y guidance 1.0, medida en un Apple M2 Ultra. La comparación aísla la política de asignación de bits, ya que todas las variantes cuantizan los mismos 256 lineales del transformer. LPIPS es la distancia perceptual respecto a la referencia bf16 (menor es mejor).

| Build | Transformer | LPIPS ↓ | PSNR ↑ | CLIP ↑ | s/imagen |
|---|---|---|---|---|---|
| Uniform 4-bit | 7,67 GB | 0,2423 | 19,2 | 34,50 | 56 |
| RAM 9 GB (familia) | 9,19 GB | 0,2076 | 20,6 | 34,41 | 58 |
| Mixto manual 4/8* | 9,84 GB | 0,2102 | 20,3 | 34,42 | 57 |
| RAM 11,4 GB | 11,44 GB | 0,1319 | 24,4 | 34,44 | 59 |
| RAM 8-bit (familia) | 13,92 GB | 0,0630 | 29,2 | 34,22 | 59 |
| bf16 (referencia) | 25,64 GB | referencia | referencia | 34,35 | 56 |

*Reimplementación de la receta comunitaria 4/8 (down_proj a 8 bits, atención en primeras/últimas 2 capas, resto a 4 bits, fusión de texto en bf16).

La build de 19 GB (la de esta ficha) no aparece en la tabla; los autores indican que se publica por completitud y que la mayoría de usuarios debería usar las versiones de 9 GB u 8 bits. Los datos muestran que la cuantización compra memoria, no velocidad: todas las variantes rondan los 56-60 segundos por imagen, y bf16 fue la más rápida (55,7 s). La puntuación CLIP es plana en todas las variantes (34,2-34,9), lo que sugiere que la cuantización cambia más la imagen resultante que su alineación con el prompt.

## Requisitos de hardware

- Apple Silicon Mac (M1 o posterior) obligatorio; la build está optimizada para el framework MLX.
- Memoria unificada recomendada: 48 GB o más, según la model card. El transformer ocupa 18,84 GB, y el repositorio completo (incluyendo text encoder bf16 y VAE) suma 27,4 GB.
- Software: `mflux>=0.18,<0.19` (versiones anteriores no soportan Krea 2) y el cargador incluido `load_krea2_ram.py`.
- Inferencia: 8 pasos con guidance 1.0; aumentar los pasos no mejora el resultado.
- Rendimiento medido en M2 Ultra: entre 56 y 60 segundos por imagen a 1024×1024, independientemente del nivel de cuantización.
- No es compatible con GPUs NVIDIA o AMD; el formato MLX está restringido a Apple Silicon.

## Comparativa con modelos similares

La comparativa más relevante es entre las distintas variantes de cuantización del mismo modelo base Krea 2 Turbo, ya que no se dispone de datos de otros modelos de texto a imagen en el mismo formato MLX.

| Variante | Tamaño transformer | LPIPS ↓ | PSNR ↑ | Memoria estimada | Uso recomendado |
|---|---|---|---|---|---|
| Krea-2-Turbo-RAM-19GB-MLX (esta) | 18,84 GB | no medido | no medido | ~19 GB + overhead | Completitud; no recomendada para uso general |
| Krea-2-Turbo-RAM-9GB-MLX | 9,19 GB | 0,2076 | 20,6 | ~9 GB + overhead | Equilibrio calidad/memoria |
| Krea-2-Turbo-RAM-8bit-MLX | 13,92 GB | 0,0630 | 29,2 | ~14 GB + overhead | Máxima fidelidad perceptual |
| Krea-2-Turbo bf16 (original) | 25,64 GB | referencia | referencia | ~26 GB + overhead | Calidad de referencia, mayor consumo |

Existen otros ports MLX independientes de Krea 2 Turbo, como `SceneWorks/krea-2-turbo-mlx` o el de `avlp12/krea2_alis_mlx`, pero no se dispone de datos de rendimiento comparables en la información proporcionada.

## Limitaciones y advertencias

- Esta build de 19 GB no es la recomendada por sus propios autores: la model card indica explícitamente que la mayoría de usuarios debería usar las versiones de 9 GB u 8 bits. Su única ventaja es ser 1,36× más pequeña que bf16, con una calidad perceptual presumiblemente intermedia (no medida en la tabla publicada).
- El checkpoint requiere un cargador especial (`load_krea2_ram.py`) porque mflux estándar no puede interpretar la cuantización mixta. Usar mflux sin este cargador producirá una carga incorrecta de los pesos, y el cargador lanza una excepción en lugar de cargar silenciosamente un modelo corrupto.
- La licencia Krea 2 Community License impone restricciones de uso comercial; es necesario revisar el acuerdo en https://krea.ai/krea-2-licensing antes de desplegar el modelo en producción.
- El modelo solo soporta prompts en inglés según los metadatos; no se garantiza un rendimiento adecuado en otros idiomas.
- La cuantización a 8 bits no es perceptualmente sin pérdidas: incluso la variante de 8 bits muestra LPIPS 0,063 y PSNR 29,2 dB frente a bf16. Esta build de 19 GB, con un promedio de 11,36 bits, tendrá una calidad intermedia pero no se ha medido directamente.
- La generación es limitada por atención (attention-bound) y la cuantización no acelera la inferencia; en M2 Ultra todas las variantes tardan entre 56 y 60 segundos por imagen.
- No hay datos sobre sesgos del modelo, alucinaciones visuales o comportamientos problemáticos en la información proporcionada; se recomienda evaluar el modelo en el dominio de uso específico.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/baa-ai/Krea-2-Turbo-RAM-19GB-MLX
- Modelo base original: https://huggingface.co/krea/Krea-2-Turbo
- Licencia Krea 2: https://krea.ai/krea-2-licensing
- mflux (framework de ejecución): https://github.com/filipstrand/mflux
- Página del modelo Krea 2 Turbo en Krea: https://www.krea.ai/models/krea-2-turbo
- Port MLX independiente (avlp12): https://github.com/avlp12/krea2_alis_mlx
- Port MLX alternativo (SceneWorks): https://huggingface.co/SceneWorks/krea-2-turbo-mlx
