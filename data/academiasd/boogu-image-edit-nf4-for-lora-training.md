# AcademiaSD/Boogu-Image-Edit-NF4-for-LoRA-Training

## Resumen

Boogu-Image-Edit-NF4-for-LoRA-Training es una conversión cuantizada en NF4 del modelo de edición de imágenes Boogu/Boogu-Image-0.1-Edit, publicada por AcademiaSD. No se trata de un modelo nuevo ni de un fine-tune, sino de un paquete de pesos pre-cuantizados pensado exclusivamente para el entrenamiento de adaptadores LoRA dentro de la herramienta AcademiaSD LoRAlab Trainer Studio. El repositorio incluye el transformer en NF4 (unos 5 GB), el codificador de texto Qwen3-VL-8B también en NF4 (unos 5 GB, usado solo en la fase de Pre-Cache), y los componentes VAE, processor y scheduler sin modificar respecto al modelo original.

La relevancia de este artefacto es práctica: evita al usuario tener que ejecutar la cuantización por su cuenta y garantiza que el trainer descargue pesos con hashes verificables. La cuantización se realizó con el método `bitsandbytes_nf4` de DiffSynth-Studio, y los metadatos (`boogu_nf4_metadata.json`) permiten cargar los ficheros NF4 con esa misma librería. El autor advierte explícitamente de que estos pesos son para entrenamiento, no para inferencia: para generar imágenes debe usarse el modelo original sin cuantizar.

El modelo base es un sistema de edición de imágenes por difusión con un codificador de texto multimodal (Qwen3-VL-8B), lo que sugiere capacidad de instrucciones en lenguaje natural sobre imágenes de entrada. La licencia es Apache 2.0, heredada del modelo original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo de difusión para edición de imágenes (transformer) con codificador de texto Qwen3-VL-8B; detalles internos del transformer no disponibles |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE según la información disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | NF4 (bitsandbytes) para transformer y codificador de texto; VAE, processor y scheduler sin cuantizar |
| Idiomas soportados | no disponible (el codificador Qwen3-VL-8B es multilingüe, pero no se documenta el soporte del pipeline) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (repositorio diffusers), con metadatos JSON de hashes |
| Tamano del repositorio | 11.1 GB |
| Modelo base | Boogu/Boogu-Image-0.1-Edit |
| Pipeline diffusers | BooguImagePipeline |
| Descargas / likes | 20 / 1 |

## Arquitectura y entrenamiento

El paquete reproduce la arquitectura del modelo original Boogu-Image-0.1-Edit: un transformer de difusión para edición de imágenes acompañado de un codificador de texto Qwen3-VL-8B, un VAE, un processor y un scheduler. La única modificación respecto al original es la cuantización NF4 de los pesos del transformer y del codificador de texto mediante `bitsandbytes_nf4` de DiffSynth-Studio. Los componentes de codificación y decodificación visual (VAE) y el procesamiento de entrada permanecen intactos.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si el modelo original empleó RLHF, DPO u otras técnicas de alineación. Tampoco se documentan innovaciones técnicas del transformer más allá de su integración con el codificador multimodal Qwen3-VL. El propósito del repositorio no es entrenar el modelo, sino servir como fuente de pesos congelados para el entrenamiento de LoRA sobre él.

## Capacidades

- Edición de imágenes guiada por instrucciones en lenguaje natural, heredada del modelo base Boogu-Image-0.1-Edit.
- Codificación de instrucciones mediante un modelo de visión-lenguaje (Qwen3-VL-8B), lo que permite condicionamiento multimodal texto-imagen.
- Entrenamiento de adaptadores LoRA sobre los pesos cuantizados en NF4, con el trainer de AcademiaSD.
- Carga verificable mediante hashes de los pesos originales (`boogu_nf4_metadata.json`) con DiffSynth-Studio.
- No está pensado para inferencia directa: el autor recomienda usar el modelo original para generar imágenes.
- Soporte de tool calling, agentes, razonamiento multi-paso o modo thinking: no disponible / no aplica a este artefacto.

## Casos de uso

- Entrenamiento de LoRA para estilos de edición personalizados: el paquete permite arrancar el trainer de AcademiaSD sin cuantizar manualmente el modelo, reduciendo el espacio en disco y la VRAM necesaria durante el ajuste.
- Ajuste de un LoRA para un dominio visual concreto (por ejemplo, retoque de producto o edición de retratos): se congela el transformer NF4 y se entrena solo el adaptador sobre pares imagen-instrucción-imagen.
- Reproducibilidad de experimentos: los hashes incluidos en `boogu_nf4_metadata.json` permiten verificar que los pesos cargados corresponden al modelo original, útil en entornos de investigación que requieren trazabilidad.
- Despliegue en estaciones de trabajo con VRAM limitada: al reducir el transformer y el codificador de texto a NF4 (~5 GB cada uno), el entrenamiento de LoRA cabe en GPUs de gama alta de consumo, aunque el requisito exacto no está documentado.
- Integración en pipelines de CI para validar recetas de entrenamiento: el trainer descarga automáticamente el repositorio en el primer Pre-Cache, lo que facilita entornos efímeros y pruebas automatizadas.
- Base para investigación sobre cuantización y calidad de LoRA: permite comparar adaptadores entrenados sobre pesos NF4 frente a los entrenados sobre el modelo original en fp16/bf16.
- Pre-Cache del codificador Qwen3-VL-8B: la carpeta `mllm/` se usa solo en esa fase, de modo que el pipeline de datos puede prepararse sin descargar el modelo completo sin cuantizar.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para entrenamiento: no documentada por el autor; como referencia, el transformer NF4 ocupa ~5 GB y el codificador Qwen3-VL-8B NF4 ~5 GB, a lo que hay que sumar activaciones, optimizador y el adaptador LoRA.
- GPU recomendadas: no disponibles en la información proporcionada; por el tamaño de los pesos NF4, se requiere al menos una GPU con suficiente VRAM para ambos componentes más el estado de entrenamiento.
- ¿Cabe en GPU de consumo? No confirmado. Los ~10 GB de pesos cuantizados sugieren que podría caber en GPUs de 24 GB (RTX 3090/4090) si el resto del estado de entrenamiento es moderado, pero es una estimación, no un dato del autor.
- Opciones de despliegue: AcademiaSD LoRAlab Trainer Studio (entrenamiento) y DiffSynth-Studio (carga de los ficheros NF4). Para inferencia, el modelo original con diffusers (`BooguImagePipeline`).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Proposito |
|---|---|---|---|---|---|
| Boogu-Image-Edit-NF4-for-LoRA-Training (este) | no disponible | no disponible | NF4 | Apache 2.0 | Pesos pre-cuantizados para entrenar LoRA |
| Boogu/Boogu-Image-0.1-Edit | no disponible | no disponible | Original (sin cuantizar) | Apache 2.0 | Edición de imágenes e inferencia |
| Otros modelos de edición de imágenes (p. ej. InstructPix2Pix, FLUX.1 Kontext) | no disponible en esta ficha | no disponible | Múltiples | Varía | Edición guiada por instrucciones |

La comparación con alternativas de la misma categoría no puede completarse con datos verificados en la información proporcionada; los parámetros y contextos de los modelos citados como referencia no están disponibles aquí.

## Limitaciones y advertencias

- No es un modelo para inferencia: el autor indica explícitamente que debe usarse el modelo original para generar imágenes; emplear los pesos NF4 para inferencia puede degradar la calidad.
- Dependencia de herramientas concretas: la carga de los ficheros NF4 requiere DiffSynth-Studio y el entrenamiento requiere el trainer de AcademiaSD; no es un paquete autónomo estándar de diffusers.
- Sesgos: no documentados; al heredar el comportamiento del modelo base, arrastra los sesgos de sus datos de entrenamiento, que no se detallan.
- Riesgo de alucinación visual: no evaluado en la información disponible.
- Idiomas: el pipeline no documenta idiomas soportados; el codificador Qwen3-VL-8B es multilingüe, pero no se garantiza el rendimiento en castellano.
- Licencia: Apache 2.0 permite uso comercial, pero deben respetarse las condiciones del modelo base y de las dependencias (DiffSynth-Studio, Apache 2.0; bitsandbytes).
- Advertencia de producción: al ser un artefacto de entrenamiento con solo 20 descargas y 1 like, carece de validación comunitaria amplia; conviene verificar los hashes antes de usarlo en pipelines críticos.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/AcademiaSD/Boogu-Image-Edit-NF4-for-LoRA-Training
- Modelo base: https://huggingface.co/Boogu/Boogu-Image-0.1-Edit
- Trainer AcademiaSD LoRAlab: https://github.com/AcademiaSD/AcademiaSD_LoRAlab-Trainer
- DiffSynth-Studio (ModelScope): https://github.com/modelscope/DiffSynth-Studio
