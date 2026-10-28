# nikhilkhaneja/sd15-naruto-lora-run1

## Resumen

sd15-naruto-lora-run1 es un adaptador LoRA de bajo rango (rank 4) entrenado sobre Stable Diffusion 1.5 para generar imágenes con estética del universo Naruto. Lo publica el usuario nikhilkhaneja como entregable del laboratorio DATA 266 (Lab 2, Team 42), y el entrenamiento se realizó sobre el dataset público lambdalabs/naruto-blip-captions, compuesto por aproximadamente 1.200 imágenes con leyendas generadas automáticamente mediante BLIP.

No se trata de un modelo generativo completo, sino de un conjunto de pesos delta que se aplica sobre los pesos del modelo base stable-diffusion-v1-5/stable-diffusion-v1-5. Por tanto, su funcionamiento, resolución nativa (512x512) y limitaciones de condicionamiento textual heredan las del modelo base; el adaptador solo desplaza la distribución de salida hacia el dominio visual del dataset de entrenamiento.

Su relevancia es fundamentalmente docente y experimental: sirve como ejemplo mínimo y reproducible de fine-tuning con LoRA (1200 pasos, learning rate 1e-4, rank 4) sobre un corpus pequeño y de un único dominio. El repositorio tiene 0 descargas y 0 likes, un tamaño declarado de 0.0 GB y no incluye resultados de evaluación ni benchmarks publicados.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA de rank 4 sobre Stable Diffusion 1.5 (difusión latente: UNet + VAE + codificador de texto CLIP) |
| Parametros totales | No disponible (solo se especifica el rango del adaptador: 4) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible en la información proporcionada |
| Tipos de cuantizacion | No disponible (no se documentan versiones fp16, fp32, int8 ni GGUF del adaptador) |
| Idiomas soportados | No disponible (las leyendas del dataset BLIP están en inglés) |
| Licencia | creativeml-openrail-m |
| Formato de pesos | No disponible; el repositorio contiene únicamente el adaptador LoRA (tamaño declarado 0.0 GB), no pesos completos del modelo |
| Modelo base | stable-diffusion-v1-5/stable-diffusion-v1-5 |
| Dataset de entrenamiento | lambdalabs/naruto-blip-captions (~1.2k imágenes) |
| Pasos de entrenamiento | 1200 |
| Learning rate | 1e-4 |
| Tarea (pipeline) | text-to-image |
| Repositorio | 0 descargas, 0 likes, creado y actualizado el 2026-10-27 |

## Arquitectura y entrenamiento

El adaptador se inyecta sobre Stable Diffusion 1.5, un modelo de difusión latente con tres componentes: un autoencoder variacional (VAE) que comprime las imágenes a un espacio latente de menor dimensionalidad, una UNet que aprende a eliminar ruido de forma iterativa y condicionada por el prompt, y un codificador de texto CLIP que transforma la instrucción en embeddings. La técnica LoRA congela los pesos originales y entrena matrices de bajo rango (en este caso rank 4) sobre determinadas capas, lo que reduce drásticamente el número de parámetros entrenables y el coste de almacenamiento del adaptador.

El entrenamiento se realizó sobre lambdalabs/naruto-blip-captions, un corpus de aproximadamente 1.200 imágenes con leyendas generadas por BLIP, durante 1200 pasos con learning rate 1e-4. La model card no especifica tamaño de batch, resolución de entrenamiento, número de épocas, composición exacta del dataset, ni si se aplicaron técnicas de regularización, aumentación o *prior preservation*. Tampoco se documenta ninguna innovación técnica adicional (decodificación especulativa, atención lineal u otras): se trata de un fine-tuning LoRA convencional.

## Capacidades

- Generación de imágenes texto-a-imagen condicionada por prompt, con sesgo estilístico hacia el dominio visual del dataset Naruto.
- Aplicación como adaptador sobre cualquier pipeline que cargue Stable Diffusion 1.5 en formato Diffusers, A1111, ComfyUI o InvokeAI.
- Capacidad de combinarse con otros adaptadores LoRA del ecosistema SD 1.5 (la compatibilidad efectiva no está documentada).
- No dispone de tool calling ni de function calling.
- No soporta comportamiento agente ni razonamiento multi-paso.
- No es un modelo multimodal de entrada: no procesa imágenes ni audio como entrada, solo texto.
- No incorpora modo *thinking* ni cadena de pensamiento.
- Capacidades multilingües no documentadas; el condicionamiento textual depende del codificador CLIP del modelo base y de leyendas BLIP en inglés.

## Casos de uso

- Docencia y reproducción de laboratorios: el adaptador sirve como referencia completa (rank 4, 1200 pasos, lr 1e-4) para que estudiantes repliquen un pipeline de fine-tuning LoRA sobre un dataset de ~1.2k imágenes y comparen sus resultados con esta línea base.
- Prototipado rápido de estilización anime: generación de ilustraciones de prueba para maquetas de interfaz, presentaciones internas o demos de producto, aprovechando la transferencia de estilo hacia personajes tipo Naruto.
- Investigación sobre datasets pequeños: permite medir cuánto estilo se aprende con 1200 pasos y un rango tan bajo, y analizar el equilibrio entre sobreajuste al dominio y pérdida de diversidad en prompts fuera de distribución.
- Estudio de olvido catastrófico en LoRA: al ser un adaptador de rango mínimo, es útil para experimentos que midan cuánto conocimiento del modelo base se conserva al aplicar y retirar el delta de pesos.
- Análisis de sesgos y derechos de autor: caso práctico para discutir los límites entre una licencia abierta (creativeml-openrail-m) y el uso de personajes con copyright, un conflicto que la propia model card reconoce.
- Aumentación de datos controlada: generación de variaciones estilizadas para alimentar clasificadores o detectores de imágenes anime en entornos de investigación, siempre validando que la distribución sintética no introduzca atajos espurios.
- Evaluación comparativa de rangos LoRA: el rank 4 documentado permite contrastar frente a configuraciones de rank 8, 16 o 32 en la misma tarea y dataset, midiendo fidelidad al estilo frente a flexibilidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- El adaptador LoRA es de tamaño reducido (el repositorio declara 0.0 GB), pero la inferencia exige cargar el modelo base Stable Diffusion 1.5 completo en memoria.
- VRAM estimada para inferencia en fp16 con el modelo base: en torno a 4 GB; con *attention slicing* o *xformers* puede reducirse por debajo de 3 GB (estimación para SD 1.5, no confirmada para este adaptador).
- GPU recomendadas: RTX 3060 12 GB, RTX 4060 Ti, RTX 4070, RTX 4090, y en数据中心 A100 o H100, aunque estas últimas están sobredimensionadas para un modelo de 512x512.
- Sí cabe en GPU de consumo: cualquier tarjeta con 4-6 GB de VRAM es suficiente en fp16; también es viable en CPU con tiempos de generación mucho mayores.
- Opciones de despliegue: Diffusers (`load_lora_weights` sobre el pipeline de SD 1.5), AUTOMATIC1111 WebUI, ComfyUI, InvokeAI y SD.Next. TGI y llama.cpp no son aplicables a un modelo de difusión de este tipo.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto / resolución | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| sd15-naruto-lora-run1 | LoRA rank 4 sobre SD 1.5 | No disponible (adaptador; rango 4) | No disponible (heredada de SD 1.5) | creativeml-openrail-m | Repositorio público, 0 descargas |
| Stable Diffusion 1.5 (base) | Difusión latente completa | No disponible en la información proporcionada | No disponible | creativeml-openrail-m | Ampliamente disponible |
| Otros LoRA de estilo anime sobre SD 1.5 | Adaptadores LoRA | No disponible | No disponible | Variable según autor | No disponible en la información proporcionada |
| SDXL + LoRA de estilo | Difusión latente completa + adaptador | No disponible | No disponible | CreativeML / licencias específicas | No disponible en la información proporcionada |

No se dispone de datos objetivos (parámetros, métricas, tamaño de contexto) de las alternativas en la información proporcionada, por lo que la comparación se limita a categoría, licencia y disponibilidad.

## Limitaciones y advertencias

- Dataset de dominio muy estrecho (~1.2k imágenes): los prompts fuera del dominio Naruto pueden ignorarse o generar resultados estilísticamente inconsistentes, tal como advierte el autor.
- Riesgo elevado de sobreajuste: 1200 pasos con rank 4 sobre un corpus tan pequeño favorecen la memorización de composiciones y paletas del dataset.
- Alucinación visual: al ser un modelo de difusión, no hay garantía de fidelidad a instrucciones complejas (recuento de objetos, relaciones espaciales, texto legible en la imagen).
- Idiomas: el condicionamiento textual proviene de un codificador CLIP con leyendas BLIP en inglés; el rendimiento con prompts en castellano no está documentado y previsiblemente será inferior.
- Conflicto de licencia: la licencia creativeml-openrail-m permite uso comercial con restricciones de uso, pero la model card indica explícitamente "research/educational use only" y recuerda que Naruto es un personaje con copyright. Ante un uso comercial, prevalece la restricción del autor y los derechos de terceros sobre el personaje.
- El dataset lambdalabs/naruto-blip-captions se declara de uso exclusivamente no comercial en la propia model card.
- Repositorio con 0 descargas, 0 likes y tamaño declarado de 0.0 GB: conviene verificar que los ficheros de pesos están realmente presentes antes de integrarlo en un pipeline.
- Ausencia total de evaluación cuantitativa: no hay FID, CLIP score ni comparaciones con otras configuraciones, por lo que la calidad real del adaptador no está verificada.
- No apto para producción: sin versionado semántico, sin garantías de soporte y sin documentación de reproducibilidad (batch size, resolución y semillas no especificados).

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/nikhilkhaneja/sd15-naruto-lora-run1
- Modelo base: https://huggingface.co/stable-diffusion-v1-5/stable-diffusion-v1-5
- Dataset de entrenamiento: https://huggingface.co/datasets/lambdalabs/naruto-blip-captions
- Papers, blogs, repositorios o demos adicionales: no disponibles en la información proporcionada.
