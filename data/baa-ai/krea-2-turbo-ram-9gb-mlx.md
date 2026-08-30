# baa-ai/Krea-2-Turbo-RAM-9GB-MLX

## Resumen

Krea-2-Turbo-RAM-9GB-MLX es una versión cuantizada en precisión mixta del modelo de texto a imagen Krea-2-Turbo, desarrollada por baa.ai (Black Sheep AI) para ejecutarse de forma nativa en Apple Silicon mediante el framework MLX y el runtime mflux. El modelo original, creado por Krea, es un diffusion transformer de 2.650 millones de parámetros destilado en tiempo (timestep-distilled) que genera imágenes en solo 8 pasos de inferencia. Esta build reduce el tamaño del transformer de 25,64 GB en bf16 a 9,19 GB (2,79 veces más pequeño) mediante una asignación de bits por tensor optimizada con un algoritmo de mochila (knapsack), manteniendo el text encoder Qwen3-VL y el VAE en precisión completa.

La relevancia de este modelo radica en que permite ejecutar un generador de imágenes de alta calidad en hardware Apple sin necesidad de GPU NVIDIA ni PyTorch, con un consumo de memoria unificado de aproximadamente 9 GB para el transformer. Es el punto óptimo calidad-por-GB de la familia RAM de baa.ai, según sus propias mediciones. Al ser una modificación solo de cuantización de pesos (sin reentrenamiento), conserva las capacidades del modelo base, aunque requiere un loader específico porque mflux estándar no puede interpretar la precisión mixta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Diffusion transformer (DiT) con text encoder Qwen3-VL y VAE |
| Parametros totales | 2.653.293.132 (2,65 B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (modelo de texto a imagen; el text encoder tiene su propia ventana, no especificada) |
| Tipos de cuantizacion | Mixta: 4-bit × 57 tensores, 5-bit × 27, 6-bit × 96, 8-bit × 76; affine, group size 64; media 4,97 bits |
| Idiomas soportados | Ingles (en) |
| Licencia | Krea 2 Community License (https://krea.ai/krea-2-licensing) |
| Formato de pesos | MLX (safetensors) con mapa de bits por modulo (ram_bits.json) |

## Arquitectura y entrenamiento

El modelo base Krea-2-Turbo es un diffusion transformer de 2,65 B de parametros que utiliza un text encoder Qwen3-VL para el acondicionamiento de prompts y un VAE para la decodificacion de latentes. Fue entrenado por Krea con destilacion temporal (timestep distillation), lo que permite generar imagenes en solo 8 pasos con guidance 1.0; pasos adicionales no mejoran el resultado. La build de baa.ai no modifica la arquitectura ni los pesos entrenados: aplica cuantizacion post-entrenamiento por tensor, midiendo la relacion señal-ruido de cuantizacion (SQNR) de los 256 lineales del transformer a 2, 3, 4, 5, 6 y 8 bits, y resolviendo un problema de mochila con restriccion de presupuesto de memoria. El resultado es una curva de asignacion en forma de U: las capas 0 y 27 reciben ~5,4 bits, las capas intermedias ~4,7 bits; las proyecciones K/V se mantienen a 8 bits, Q/O a 6 bits y el grueso del MLP a 4-4,7 bits. El text encoder y el VAE se dejan en bf16 porque cuantizarlos degrada el acondicionamiento del prompt y la calidad de decodificacion.

## Capacidades

- Generacion de imagenes fotorrealistas e ilustraciones expresivas a partir de prompts en ingles.
- Inferencia rapida gracias a la destilacion temporal: 8 pasos con guidance 1.0.
- Ejecucion nativa en Apple Silicon (M1 o posterior) via MLX y mflux, sin PyTorch ni MPS fallback.
- Soporte de resoluciones configurables (probado a 1024×1024).
- Reproducibilidad mediante semilla fija (seed).
- No incluye tool calling, agentes ni capacidades multimodales de entrada (solo texto a imagen).

## Casos de uso

- Iteracion rapida de conceptos visuales: un ilustrador puede generar variaciones de una idea en segundos (56-60 s/imagen en M2 Ultra) sin depender de servicios en la nube, gracias a los 8 pasos de inferencia.
- Generacion de imagenes en entornos con privacidad estricta: al ejecutarse localmente en un Mac, los prompts y las imagenes no salen de la infraestructura del usuario, adecuado para estudios de diseño con acuerdos de confidencialidad.
- Prototipado de assets para videojuegos: el modelo produce ilustraciones expresivas de calidad media que sirven como base para concept art, con la ventaja de poder ajustar la semilla para explorar composiciones.
- Automatizacion de contenido para redes sociales: integrable en scripts Python via mflux para generar imagenes de forma programatica, por ejemplo en pipelines de publicacion.
- Despliegue en flotas de Macs: baa.ai ofrece una plataforma de despliegue privado que gestiona multiples instancias Apple Silicon, permitiendo escalar la generacion de imagenes sin GPUs dedicadas.
- Educacion e investigacion en cuantizacion: el repositorio incluye el mapa de bits y el loader, lo que permite estudiar el impacto de la precision mixta en la calidad perceptual de diffusion transformers.

## Benchmarks y rendimiento

Los datos provienen de la model card, medidos en un M2 Ultra con 10 prompts, semillas coincidentes, 1024×1024, 8 pasos y guidance 1.0. LPIPS es distancia perceptual respecto al modelo bf16 de referencia (menor es mejor); PSNR y CLIP tambien se comparan contra esa referencia.

| Build | Transformer | LPIPS ↓ | PSNR ↑ | CLIP ↑ | s/imagen |
|---|---|---|---|---|---|
| Uniform 4-bit | 7,67 GB | 0,2423 | 19,2 | 34,50 | 56 |
| **RAM 9 GB (esta familia)** | 9,19 GB | 0,2076 | 20,6 | 34,41 | 58 |
| Hand-tuned mixto 4/8 | 9,84 GB | 0,2102 | 20,3 | 34,42 | 57 |
| RAM 11,4 GB | 11,44 GB | 0,1319 | 24,4 | 34,44 | 59 |
| RAM 8-bit | 13,92 GB | 0,0630 | 29,2 | 34,22 | 59 |
| bf16 (referencia) | 25,64 GB | ref | ref | 34,35 | 56 |

Notas de la model card: a 9 GB, RAM iguala la calidad del recipe artesanal 4/8 siendo 0,65 GB menor, pero la diferencia no es estadisticamente significativa (p = 0,89). Por debajo de ~9 GB, RAM pierde frente a uniform 4-bit (LPIPS 0,301 vs 0,242, p = 0,001). El 8-bit no es perceptualmente sin perdidas (LPIPS 0,063). CLIP es plano en todos los casos (34,2-34,9), lo que indica que la cuantizacion cambia que imagen se obtiene mas que si el prompt se cumple. La cuantizacion no acelera la generacion: todos los brazos tardan 56-60 s/imagen, y bf16 fue el mas rapido (55,7 s) porque la generacion esta limitada por atencion, que no se cuantiza.

## Requisitos de hardware

- Apple Silicon Mac (M1 o posterior) con memoria unificada; se recomiendan 24 GB o mas para cargar el transformer (9,19 GB) junto con el text encoder bf16 y el VAE (repo total 17,75 GB).
- No requiere GPU NVIDIA ni VRAM dedicada; usa la memoria unificada del SoC.
- Software: mflux >= 0.18 y < 0.19 (versiones anteriores no soportan Krea 2), Python 3, y el loader incluido en el repositorio (load_krea2_ram.py).
- Rendimiento medido: 56-60 s/imagen a 1024×1024 en M2 Ultra; en chips M1 o M2 de menor gama la latencia sera mayor.
- Opciones de despliegue: CLI (script incluido), API Python (funcion load_ram_krea2), o integracion con la plataforma de despliegue de baa.ai para flotas.

## Comparativa con modelos similares

| Modelo | Parametros | Transformer | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| Krea-2-Turbo (bf16 original) | 2,65 B | 25,64 GB | PyTorch/Diffusers | Krea 2 Community | Referencia de calidad, requiere GPU con mucha VRAM |
| Krea-2-Turbo-RAM-9GB-MLX (este) | 2,65 B | 9,19 GB | MLX mixto | Krea 2 Community | Optimizado para Apple Silicon, 8 pasos |
| Krea-2-Turbo-RAM-8bit-MLX | 2,65 B | 13,92 GB | MLX 8-bit | Krea 2 Community | Mayor calidad (LPIPS 0,063) a costa de 4,7 GB extra |
| Uniform 4-bit (mismo modelo) | 2,65 B | 7,67 GB | MLX 4-bit | Krea 2 Community | Menor calidad (LPIPS 0,242) pero mas compacto |

Alternativas externas: el port independiente avlp12/krea2_alis_mlx (12,9 B, no cuantizado, validado con coseno 1.0) y mapleroyal/krea-2-turbo-mlx (GUI local). No se dispone de datos comparativos con otros modelos de texto a imagen en MLX (p. ej., Stable Diffusion) en la informacion proporcionada.

## Limitaciones y advertencias

- Solo soporta prompts en ingles; no hay datos sobre rendimiento multilingue.
- Requiere el loader especifico del repositorio (load_krea2_ram.py); mflux estandar cargara los pesos incorrectamente y el loader lanza una excepcion en lugar de cargar un modelo corrupto.
- Es una modificacion de terceros, no un lanzamiento oficial de Krea; la licencia comunitaria puede imponer restricciones de uso comercial (consultar el acuerdo en krea.ai/krea-2-licensing).
- La calidad perceptual no es identica al modelo bf16: LPIPS 0,2076 y PSNR 20,6 dB indican diferencias visibles, aunque CLIP se mantiene estable.
- No se recomienda usar presupuestos inferiores a 9 GB para este modelo: la asignacion RAM degrada significativamente (LPIPS 0,301 a 7,4 GB).
- La cuantizacion no reduce la latencia; la generacion esta limitada por atencion, que no se cuantiza.
- El modelo esta fijado a 8 pasos y guidance 1.0; usar mas pasos no mejora la calidad y puede producir artefactos.
- No se han publicado resultados de benchmarks en la informacion disponible mas alla de los de la model card; no hay datos de sesgos o alucinaciones especificos de este modelo.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/baa-ai/Krea-2-Turbo-RAM-9GB-MLX
- Modelo base: https://huggingface.co/krea/Krea-2-Turbo
- Licencia Krea 2: https://krea.ai/krea-2-licensing
- mflux (runtime): https://github.com/filipstrand/mflux
- Variante 8-bit: https://huggingface.co/baa-ai/Krea-2-Turbo-RAM-8bit-MLX
- Port independiente (avlp12): https://github.com/avlp12/krea2_alis_mlx
- GUI local (mapleroyal): https://github.com/mapleroyal/krea-2-turbo-mlx
- Plataforma baa.ai: https://baa.ai
