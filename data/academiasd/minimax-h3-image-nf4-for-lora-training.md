# AcademiaSD/MiniMax-H3-Image-NF4-for-LoRA-Training

## Resumen

MiniMax-H3-Image NF4 for LoRA Training es un paquete de pesos pre-cuantizados del modelo de generación de imágenes MiniMax-H3-Image, publicado por AcademiaSD para su herramienta AcademiaSD LoRAlab Trainer Studio, un entrenador de LoRA orientado a GPUs de consumo. No se trata de un checkpoint de inferencia: el transformer de 33B se almacena como una caché NF4 por capas que la herramienta reconstruye directamente y que no carga con `from_pretrained`. Su función es servir como base de entrenamiento para LoRAs de personajes, objetos y estilos.

El paquete incluye el transformer DiT de flujo único de 33B cuantizado a NF4 (17,23 GB frente a 66,3 GB en BF16), el VAE de imagen original en formato diffusers (2,34 GB, byte a byte idéntico al oficial) y los ficheros de scheduler y configuración sin modificar. Las seis cabezas de salida por paso (`pdd_proj_out.0`–`5`), el `proj_in`, el embedder de timesteps y `norm_out` se conservan sin cuantizar porque el modelo declara esas capas críticas para la precisión y son las que hacen funcionar la destilación a 6 pasos.

La relevancia del paquete es práctica: permite entrenar LoRAs de MiniMax-H3-Image en tarjetas de 16 GB mediante streaming de bloques del transformer a la GPU, con un pico medido de 13,9 GB incluyendo previews y unos 4,5 s por paso a ~1 MP. La licencia del modelo base impone restricciones geográficas severas que condicionan su uso en la Unión Europea.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DiT (Diffusion Transformer) de flujo único, 50 bloques + 2 bloques token-refiner, con 6 cabezas de salida por paso; VAE convolucional con decodificador ViT 2D y 24 canales |
| Parametros totales | 33B (transformer); VAE no disponible en parámetros |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | NF4 con doble cuantización (bitsandbytes) y cómputo en BF16 en 373 capas lineales; capas críticas en BF16 sin cuantizar |
| Idiomas soportados | no disponible |
| Licencia | MiniMax-H3-Image Community License Agreement (uso restringido por territorio) |
| Formato de pesos | safetensors (caché NF4 por capa, ficheros `pc-*`, `other-*`); VAE en formato diffusers |

## Arquitectura y entrenamiento

El modelo base MiniMax-H3-Image es un transformer de difusión de flujo único de 33B parámetros, destilado a 6 pasos de muestreo sin CFG (guidance scale 1) mediante una arquitectura de seis cabezas de salida, una por paso. El text encoder es el Qwen3-VL de MiniMax-H3, sin modificar, y no se incluye en este repositorio: el LoRAlab lo descarga desde `AcademiaSD/MiniMax-H3-NF4`. El VAE de imagen es el oficial, con encoder convolucional y decodificador ViT 2D de 24 canales.

La innovación técnica del paquete es la estrategia de entrenamiento: como MiniMax-H3-Image está destilado, el fine-tuning directo falla (según el autor, el flow matching convencional colapsa las cabezas de alto ruido hacia la media del dataset en ~100 pasos, produciendo imágenes borrosas incluso con lr 1e-4, y anclar esas cabezas mantiene la nitidez pero no aprende el parecido). Por eso el LoRA se entrena sobre el DiT de MiniMax-H3, que no está destilado y comparte espacio latente y módulos con MiniMax-H3-Image, usando latentes del VAE de este repositorio y generando las previews con MiniMax-H3-Image a 6 pasos. Los LoRAs exportados usan el layout de claves de los checkpoints originales (`qkv_proj` fusionado, intercalado por cabeza de atención, `mlp.fc1` con las mitades SwiGLU en orden original), verificado fila a fila contra ambos modelos oficiales. El error de peso medido de las capas NF4 es del 7–9 % relativo a BF16.

## Capacidades

- Generación de imágenes texto-a-imagen a partir del modelo base MiniMax-H3-Image (no directamente desde este paquete).
- Entrenamiento de LoRAs de personajes, objetos y estilos con una imagen y un caption por muestra.
- Entrenamiento con bajo consumo de VRAM mediante streaming de bloques del transformer a la GPU bajo demanda.
- Generación de previews de entrenamiento con MiniMax-H3-Image a 6 pasos y CFG 1 con el LoRA adjunto.
- Exportación de LoRAs compatibles tanto con MiniMax-H3-Image como con MiniMax-H3 (mismo fichero para ambos).
- Inferencia desde la caché NF4: 1024×1024 en 6 pasos en ~33 s con pico de 1,8 GB de VRAM en una RTX 5080 (dato medido por el autor).
- No soporta tool calling, agentes ni razonamiento multi-step: es un modelo de difusión para imágenes.
- Capacidades multilingües: no disponible.

## Casos de uso

- Entrenamiento de LoRAs de personajes en GPU de consumo: el LoRAlab descarga este paquete automáticamente y entrena sobre el DiT de MiniMax-H3 con latentes del VAE incluido, permitiendo reproducir un rostro o personaje concreto con una imagen y un caption por muestra en tarjetas de 16 GB.
- LoRAs de estilo artístico: al entrenar sobre el DiT no destilado y previsualizar con MiniMax-H3-Image, el estilo se aprende sin el colapso de las cabezas de alto ruido que sufre el fine-tuning directo del modelo destilado.
- LoRAs de objetos o productos: útil para generar variaciones consistentes de un producto concreto en distintas composiciones, manteniendo la identidad del objeto gracias al VAE oficial byte-idéntico y a la normalización de píxeles del pipeline original.
- Integración en flujos ComfyUI: los LoRAs exportados usan el layout de claves de los checkpoints oficiales y el autor remite a la release ComfyUI de MiniMax-H3-Image para generación, de modo que el LoRA entrenado aquí se aplica en ese entorno sin conversión.
- Reutilización de infraestructura existente: si ya se entrenan LoRAs de vídeo de MiniMax-H3, el LoRAlab solo descarga los 17,2 GB del transformer de imagen (o nada, si ya están los ficheros de `AcademiaSD/MiniMax-H3-NF4`), reduciendo el coste de almacenamiento y descarga.
- Prototipado rápido de adaptaciones personalizadas: con ~4,5 s por paso a ~1 MP y previews incluidas en un pico de 13,9 GB, es viable iterar sobre datasets pequeños en una sola GPU consumer sin infraestructura de centro de datos.
- Investigación sobre cuantización y entrenamiento: el paquete documenta el error de peso NF4 (7–9 %) y conserva copias bit-idénticas de las capas críticas, lo que permite estudiar el impacto de la cuantización en el fine-tuning de difusores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor solo aporta métricas de ejecución propias:

| Metrica | Valor medido |
|---|---|
| Generacion 1024x1024, 6 pasos (RTX 5080 16 GB) | ~33 s |
| Pico de VRAM en generacion desde la cache NF4 | 1,8 GB |
| Bloques residentes en entrenamiento (16 GB) | 30 de 50 |
| Pico de VRAM en entrenamiento con previews | 13,9 GB |
| Tiempo por paso en entrenamiento a ~1 MP | ~4,5 s |
| Error de peso de las capas NF4 vs BF16 | 7-9 % relativo |

## Requisitos de hardware

- VRAM para inferencia desde la caché NF4: pico medido de 1,8 GB en una RTX 5080 de 16 GB para 1024×1024 en 6 pasos (el transformer se reconstruye por capas).
- VRAM para entrenamiento: pico medido de 13,9 GB en una tarjeta de 16 GB, con 30 de los 50 bloques residentes y previews incluidas.
- GPU recomendadas: RTX 5080 (medida por el autor); cualquier GPU consumer con 16 GB o más es el objetivo declarado del LoRAlab. Para A100/H100 no hay datos publicados.
- Cabe en GPU consumer: sí, en tarjetas de 16 GB según las mediciones del autor.
- Opciones de despliegue: el paquete no carga con `from_pretrained` ni sirve para inferencia directa; se usa exclusivamente a través de AcademiaSD LoRAlab Trainer Studio. Para generación hay que usar el modelo original o su release ComfyUI. No hay soporte documentado de vLLM, llama.cpp, Ollama ni TGI (no aplican a un modelo de difusión en este formato).
- Almacenamiento: 20,1 GB el repositorio; 41,4 GB el conjunto completo que descarga el LoRAlab, de los cuales 35,6 GB provienen de `AcademiaSD/MiniMax-H3-NF4`.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye datos de otros modelos comparables de la misma categoría (difusores texto-a-imagen de ~33B con empaquetado para entrenamiento de LoRA), ni cifras de rendimiento que permitan una comparación rigurosa.

## Limitaciones y advertencias

- No es un checkpoint de inferencia: no carga con `from_pretrained` y no debe usarse para generar imágenes directamente; solo funciona con el LoRAlab de AcademiaSD.
- Restricción geográfica grave: la licencia autoriza el uso únicamente dentro del Applicable Territory, que excluye la Unión Europea, el Reino Unido, la República de Corea y los Estados Unidos. El uso en España queda fuera del territorio autorizado.
- Uso comercial limitado: por encima de 1 millón de USD de ingresos anuales, o como servicio alojado para terceros, requiere autorización separada de MiniMax.
- Sujeto a la Acceptable Use Policy (Exhibit A de la licencia).
- El fine-tuning directo de MiniMax-H3-Image falla según el autor (cabezas de alto ruido colapsadas, imágenes borrosas); el flujo correcto exige entrenar sobre el DiT de MiniMax-H3, lo que añade complejidad y dependencias externas.
- La cuantización NF4 introduce un error de peso del 7–9 % relativo a BF16 en las capas lineales; las capas críticas se conservan bit-idénticas, pero el impacto en la calidad final del LoRA no está cuantificado públicamente.
- El paquete depende de descargas adicionales desde `AcademiaSD/MiniMax-H3-NF4` (text encoder Qwen3-VL y transformer de MiniMax-H3), por lo que no es autocontenido.
- Sin datos publicados de sesgos, tasas de alucinación visual, cobertura idiomática ni benchmarks de calidad de imagen.
- Repositorio con 55 descargas y 0 likes en el momento de la consulta: validación comunitaria muy limitada.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/AcademiaSD/MiniMax-H3-Image-NF4-for-LoRA-Training
- Modelo base: https://huggingface.co/MiniMaxAI/MiniMax-H3-Image
- Repositorio de dependencias NF4: https://huggingface.co/AcademiaSD/MiniMax-H3-NF4
- Herramienta de entrenamiento: https://github.com/AcademiaSD/AcademiaSD_LoRAlab-TrainerStudio
- YouTube del autor: https://www.youtube.com/@Academia_SD
- X del autor: https://twitter.com/Academia_S_D
- Discord del autor: https://discord.gg/Syuaduy678
- Ko-Fi del autor: https://ko-fi.com/academiasd
- Organización MiniMax en Hugging Face: https://huggingface.co/MiniMaxAI
