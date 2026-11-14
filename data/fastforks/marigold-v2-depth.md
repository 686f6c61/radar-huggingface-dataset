# fastforks/marigold-v2-depth

## Resumen

Marigold V2 depth es un modelo de estimación de profundidad monocular derivado de la familia Marigold, desarrollada originalmente por Huawei Technologies y el grupo de investigación de Sabine Süsstrunk en EPFL. Esta variante concreta, publicada por el usuario `fastforks`, empaqueta el checkpoint `depth/Log-stage2` de `huawei-bayerlab/marigold-v2` aplicado sobre el transformer de `Qwen/Qwen-Image-Edit-2509` (20 000 millones de parámetros, 60 bloques) y lo convierte en un único fichero safetensors autocontenido que se carga sin `diffusers`, `bitsandbytes` ni `peft` en tiempo de inferencia.

El modelo resuelve un problema clásico de la visión por computador: obtener un mapa de profundidad denso a partir de una sola imagen RGB. La innovación de Marigold V2 es aplicar un diffusion transformer (en lugar de un UNet) al paradigma de difusión latente para profundidad, con un paso de rectified flow. Esta conversión concreta cuantiza el transformer a NF4 (4 bits, bloques de 64), conserva el LoRA de profundidad de rango 128 en bf16 y pliega el timestep fijo (t = 499/1000), el prompt fijo y el encoder de texto Qwen2.5-VL en vectores almacenados, eliminando la necesidad del encoder textual en inferencia.

Es relevante por su empaquetado: un único fichero de 9 GB que cabe en GPUs de consumo con cuantización de 4 bits y que elimina dependencias pesadas del ecosistema diffusers. La licencia Apache 2.0 y el paper asociado (ACM TOG, SIGGRAPH Asia 2026, arXiv:2609.08084) lo sitúan como referencia académica reciente para depth estimation con difusión.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Diffusion transformer (rectified flow) sobre Qwen-Image-Edit-2509 + VAE Qwen-Image ajustado + LoRA de profundidad |
| Parametros totales | 20 000 millones (transformer Qwen-Image-Edit-2509); cifra total del fichero no disponible |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (procesa una imagen y un prompt fijo de 338 tokens) |
| Tipos de cuantizacion | NF4 (4 bits, bloques de 64, escala bf16 por bloque, 16 valores de código bitsandbytes); LoRA en bf16; VAE en bf16 |
| Idiomas soportados | no disponible (el encoder de texto está plegado; prompt fijo) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (fichero único, 9 GB) |

## Arquitectura y entrenamiento

La arquitectura combina tres piezas: un transformer de difusión de 60 bloques y 20 000 millones de parámetros (heredado de Qwen-Image-Edit-2509), un VAE ajustado específicamente para Marigold V2 (encoder y decoder) y un LoRA de rango 128 que adapta el transformer a la tarea de profundidad. En esta conversión, el transformer se cuantiza a NF4 con el mismo esquema que usa el código de Marigold V2 en cada carga, de modo que los bytes empaquetados y las escalas coinciden con la salida de bitsandbytes. El LoRA se mantiene como factores separados (`lora_A`/`lora_B` en bf16) porque fusionarlo en pesos de 4 bits destruiría la actualización.

La conversión pliega todo lo constante en inferencia: el timestep fijo (t = 499/1000), el prompt fijo y los estados de texto de Qwen2.5-VL tras la capa de entrada de texto (338 tokens) se almacenan como vectores, eliminando el encoder de texto. El VAE se reduce a una red 2-D de un solo fotograma: de cada convolución causal 3-D se conserva únicamente el último tap temporal y se eliminan las capas `time_conv` (identidad con un solo fotograma). También se descarta la rama de texto del último bloque, que nunca se lee. El entrenamiento original de Marigold V2 se describe en el paper (Pavlovic et al., ACM TOG / SIGGRAPH Asia 2026); los detalles de composición del dataset no se reproducen en la model card.

## Capacidades

- Estimación de profundidad monocular densa a partir de una imagen RGB.
- Salida de profundidad logarítmica afín-invariante en el rango [-1, 1] (log metros = a·depth + b).
- Inferencia en un único paso de rectified flow (sin bucle de muestreo multi-paso).
- Carga autocontenida sin `diffusers`, `bitsandbytes` ni `peft` en tiempo de ejecución.
- Integración mediante la API `fastforks.depth.load("marigold-v2-depth")`.
- No soporta tool calling, agentes ni multi-step reasoning: es un modelo de visión puro.
- Capacidades multilingües no aplicables (el encoder de texto está plegado).
- No dispone de modo thinking, visión más allá de la profundidad, audio ni otras modalidades.

## Casos de uso

- Reconstrucción 3-D y fotogrametría: el mapa de profundidad logarítmica afín-invariante sirve como entrada para pipelines de estructura-desde-movimiento o para densificar nubes de puntos a partir de imágenes individuales, gracias a la escala métrica recuperable mediante los parámetros a y b.
- Realidad aumentada y mixta: inserción de objetos virtuales con oclusión correcta, usando la profundidad por píxel para determinar qué elementos de la escena tapan al objeto sintético.
- Generación de mapas de disparidad para estéreo sintético: el modelo produce profundidad densa desde una sola vista, útil para generar pares estéreo o datos de entrenamiento en pipelines de visión.
- Edición de imagen con control de profundidad: la salida puede alimentar modelos de difusión condicionados por profundidad (ControlNet y similares) para composición o reiluminación coherente con la geometría de la escena.
- Robótica y navegación: percepción de profundidad en un solo fotograma para planificación de trayectorias o evitación de obstáculos en plataformas con una única cámara RGB.
- Preprocesado en pipelines de vídeo: al requerir un solo paso de rectified flow y caber en GPUs de consumo con NF4, permite procesar fotogramas de vídeo a mayor throughput que modelos de difusión multi-paso.
- Investigación en depth estimation: referencia reproducible del estado del arte en difusión para profundidad, con pesos en un único fichero y sin dependencias del ecosistema diffusers.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 9 GB solo para los pesos en NF4; con activaciones y VAE en bf16, se estima un rango de 10 a 14 GB, aunque la cifra exacta no está disponible.
- GPU recomendadas: A100 (40/80 GB), H100, RTX 4090 (24 GB), RTX 3090 (24 GB). Con 9 GB de pesos, también debería caber en GPUs de 16 GB como RTX 4080 o A4000.
- Cabe en GPU de consumo: sí, en RTX 4090, RTX 3090, RTX 4080 y previsiblemente en RTX 4070 Ti Super (16 GB), sujeto a la VRAM real de activaciones.
- Opciones de despliegue: la librería propietaria `fastforks` (API `fastforks.depth.load`). No es un checkpoint diffusers, por lo que no se carga directamente con `from_pretrained` de diffusers, vLLM, TGI ni llama.cpp.
- Latencia y throughput: no disponibles. Al usar un único paso de rectified flow, se espera menor latencia que los modelos de difusión multi-paso, pero no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto/entrada | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Marigold V2 depth (esta conversión) | 20 000 M (transformer) | Imagen RGB, prompt fijo de 338 tokens | Diffusion transformer, 1 paso de rectified flow, NF4 | Apache 2.0 | Hugging Face (`fastforks/marigold-v2-depth`) |
| Marigold V2 original (`huawei-bayerlab/marigold-v2`) | 20 000 M (transformer) | Imagen RGB + texto | Diffusion transformer, requiere diffusers/bitsandbytes/peft | Apache 2.0 | Hugging Face |
| Depth Anything V2 | no disponible en la información | Imagen RGB | Modelo discriminativo de profundidad | no disponible en la información | Hugging Face |
| MiDaS | no disponible en la información | Imagen RGB | Modelo discriminativo de profundidad | no disponible en la información | Hugging Face |

La comparación con alternativas discriminativas (Depth Anything V2, MiDaS) no puede cuantificarse porque no se han proporcionado sus especificaciones ni resultados en la información disponible.

## Limitaciones y advertencias

- El fichero no es un checkpoint diffusers: no se puede cargar con `from_pretrained` de diffusers ni con las herramientas estándar del ecosistema; requiere la librería `fastforks`.
- El prompt y el timestep están fijos (t = 499/1000) y plegados en vectores: no es posible condicionar la generación con texto variable ni ajustar el número de pasos de muestreo.
- El encoder de texto Qwen2.5-VL se ha eliminado; cualquier intento de usar el modelo con prompts dinámicos fallará.
- La salida es profundidad logarítmica afín-invariante: para obtener metros absolutos hay que recuperar los parámetros a y b, que no se proporcionan en la model card.
- El VAE se ha reducido a 2-D de un solo fotograma; no procesa vídeo de forma nativa ni secuencias temporales.
- La cuantización NF4 introduce pérdida de precisión frente a los pesos originales en bf16; el impacto en la calidad del mapa de profundidad no está cuantificado en la información disponible.
- Los términos de la licencia del dataset de entrenamiento original no se han verificado (la model card lo indica explícitamente); aunque los pesos son Apache 2.0, el uso comercial debería revisar las condiciones del dataset de Marigold V2.
- Riesgo de alucinación geométrica en escenas con superficies reflectantes, transparentes o texturas repetitivas, habitual en modelos de profundidad monocular; no se han publicado evaluaciones específicas de sesgo.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta: no hay validación comunitaria de la conversión.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/fastforks/marigold-v2-depth
- Modelo base Marigold V2: https://huggingface.co/huawei-bayerlab/marigold-v2
- Modelo base Qwen-Image-Edit-2509: https://huggingface.co/Qwen/Qwen-Image-Edit-2509
- Repositorio de la librería fastforks: https://github.com/fastforks/fastforks
- Paper: Pavlovic, Wandel, Obukhov, Bartolomei, Davydov, Tosi, Poggi, Süsstrunk, Dai, *Marigold V2: Revisiting Diffusion Transformers for Monocular Depth Estimation*, ACM TOG (SIGGRAPH Asia 2026), arXiv:2609.08084 — https://arxiv.org/abs/2609.08084
