# Lakonik/pi-H3

## Resumen

pi-H3 es un conjunto de adaptadores de destilación few-step para MiniMax H3, el modelo de generación de vídeo con audio sincronizado de MiniMaxAI. Lo desarrolla Hansheng Chen (Lakonik) en la Universidad de Stanford, con colaboración de Shengqu Cai, Jiaming Song, Gordon Wetzstein, Xinchen Yan y Leonidas Guibas, parte del trabajo realizada durante una estancia en Luma AI. El objetivo es reducir el coste de inferencia de MiniMax H3 de decenas de pasos a tan solo 2 o 4 pasos, manteniendo la generación conjunta de vídeo y audio.

La innovación principal es la combinación de pi-Flow v2 (destilación few-step) con DWD (Decoding Without a Decoder), una técnica que predice directamente los fotogramas de vídeo en el último paso, evitando así el decodificador VAE. Esto elimina uno de los cuellos de botella de memoria y latencia más importantes en los modelos de difusión de vídeo. Los adaptadores soportan condicionamiento por texto, primer fotograma y último fotograma.

El modelo se distribuye como adaptadores (no como pesos completos) que se cargan sobre el pipeline base MiniMax H3, con versiones en precisión completa y en INT8 ConvRot para ComfyUI. El repositorio ocupa 13 GB e incluye cuatro adaptadores: dos con DWD (2 y 4 pasos) y dos con decodificador VAE tradicional (2 y 4 pasos).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptadores de destilación few-step sobre MiniMax H3 (flow matching, transformer de difusión con atención Sol sparse) |
| Parametros totales | no disponible (adaptadores; el modelo base MiniMax H3 no reporta cifra en la informacion disponible) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (condicionamiento por prompt de texto, primer y último fotograma) |
| Tipos de cuantizacion | FP8 W8A8 en el transformer y el text encoder; INT8 ConvRot para ComfyUI |
| Idiomas soportados | no disponibles (prompts en lenguaje natural; el modelo card no detalla idiomas) |
| Licencia | minimax-h3-community-license-agreement (Model Derivatives) |
| Formato de pesos | safetensors (diffusers) |

## Arquitectura y entrenamiento

pi-H3 no es un modelo autónomo, sino un conjunto de adaptadores que se aplican sobre el transformer de difusión de MiniMax H3. La arquitectura subyacente es un transformer de difusión con flow matching que genera vídeo y audio de forma conjunta. Sobre ella, pi-H3 aplica dos técnicas: pi-Flow v2, una destilación few-step que reduce el número de pasos de muestreo, y DWD (Decoding Without a Decoder), que añade una cabeza lineal (`dwd_linear_head`) y un refinador de píxeles (`dwd_pixel_refiner`) para predecir los fotogramas directamente en el último paso, saltándose el decodificador VAE.

El pipeline utiliza un scheduler `FlowEulerODEScheduler` con parámetros específicos por número de pasos: `max_raw_t` de 0,93 para 2 pasos y 0,96 para 4 pasos, con `shift` de 12,0 para vídeo y 3,0 para audio, y `final_step_size_scale` de 0,6. La atención usa Sol sparse attention a partir del tercer bloque del transformer (índice 2), con backend varlen para el refinador de píxeles. El VAE solo se emplea para codificar los fotogramas clave, no para decodificar. No se detalla en la información disponible el volumen de tokens de entrenamiento ni la composición del dataset de destilación.

## Capacidades

- Generación de vídeo con audio sincronizado a partir de texto (text-to-audio-video).
- Generación de vídeo con audio a partir de imagen y texto (image-to-audio-video).
- Condicionamiento por primer fotograma (`image`) y por último fotograma (`last_image`).
- Generación en 2 o 4 pasos de inferencia, con variantes DWD (sin decodificador VAE) y con decodificador VAE.
- Salida de vídeo a 24 fps con resolución configurable (ejemplo de 768x1344 y 243 fotogramas, unos 10 segundos).
- Salida de audio con frecuencia de muestreo propia.
- Integración con ComfyUI mediante el nodo ComfyUI-piFlow.
- Cuantización FP8 W8A8 e INT8 ConvRot para reducir requisitos de memoria.
- No se documentan capacidades de tool calling, agentes ni razonamiento multi-paso (no es un modelo de lenguaje).

## Casos de uso

- Generación rápida de clips de vídeo con audio para prototipado creativo: con 2 o 4 pasos, un estudio puede iterar sobre variaciones de un prompt en segundos en lugar de minutos, usando la variante DWD para evitar el coste del decodificador VAE.
- Anuncios y contenido para redes sociales: generación de clips de hasta 10 segundos a 24 fps con audio sincronizado, con condicionamiento por primer fotograma para mantener coherencia con una imagen de marca.
- Previsualización de storyboards animados: a partir de un fotograma clave (primero o último), el modelo completa la secuencia con movimiento y sonido, útil en preproducción audiovisual.
- Interpolación y extensión de vídeo: el condicionamiento por último fotograma permite generar la transición hacia una imagen final concreta, útil para montajes y efectos.
- Generación de material para doblaje o sonorización: la salida de audio sincronizado con el vídeo permite crear borradores sonoros para vídeos explicativos o educativos.
- Despliegue en ComfyUI para artistas técnicos: los adaptadores INT8 ConvRot y los flujos de ComfyUI-piFlow permiten integrar la generación en grafos de nodos existentes sin escribir código.
- Investigación en destilación de modelos de difusión: el código de LakonLab y el paper asociado sirven como referencia reproducible para técnicas few-step y DWD.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- El repositorio de adaptadores ocupa 13 GB; el pipeline base MiniMax H3 (versión pruned `multimodalart/MiniMax-H3-Pruned`) se carga aparte y requiere memoria adicional no cuantificada en la información disponible.
- El ejemplo oficial usa `torch.bfloat16` y cuantización FP8 W8A8 del transformer y del text encoder, lo que reduce la VRAM frente a precisión completa.
- No se especifican GPU concretas en la información disponible; por el tamaño del transformer de difusión de vídeo, se espera que requiera GPU de datacenter (A100, H100) o GPUs consumer de gama alta con suficiente VRAM, aunque no hay cifras confirmadas.
- Opciones de despliegue: diffusers con LakonLab v0.3, ComfyUI mediante ComfyUI-piFlow, y una demo en Hugging Face Spaces.
- Latencia y throughput: no disponibles; la ventaja declarada es la reducción a 2 o 4 pasos y la eliminación del decodificador VAE en las variantes DWD.

## Comparativa con modelos similares

| Modelo | Tipo | Pasos de inferencia | Decodificador VAE | Audio sincronizado | Licencia |
|---|---|---|---|---|---|
| pi-H3 (2/4 pasos, DWD) | Adaptador few-step sobre MiniMax H3 | 2 o 4 | No (DWD) | Sí | minimax-h3-community-license-agreement |
| MiniMax H3 (base) | Modelo de difusión vídeo+audio | Múltiples (no detallado) | Sí | Sí | minimax-h3-community-license-agreement |
| pi-H3 (2/4 pasos, VAE) | Adaptador few-step sobre MiniMax H3 | 2 o 4 | Sí | Sí | minimax-h3-community-license-agreement |

No se dispone en la información proporcionada de datos de otros modelos comparables de generación de vídeo con audio (por ejemplo, de otras familias) para establecer una comparación cuantitativa.

## Limitaciones y advertencias

- Los adaptadores son "Model Derivatives" bajo la licencia comunitaria de MiniMax H3; es necesario revisar `LICENSE.md` para conocer las restricciones de uso comercial.
- Al ser adaptadores, dependen del pipeline base MiniMax H3 y de LakonLab v0.3; no funcionan de forma autónoma.
- La generación está limitada a 24 fps fijos y a un número de fotogramas que sigue la fórmula 17n + 5 (el ejemplo usa 243 para unos 10 segundos); no se documentan otras duraciones.
- No hay información sobre sesgos, riesgo de alucinación visual o cobertura idiomática de los prompts.
- Las versiones INT8 ConvRot están pensadas exclusivamente para ComfyUI; su uso fuera de ese entorno no está soportado según la model card.
- El uso de Sol sparse attention requiere la dependencia opcional `lakonlab[sol]`; sin ella se usa atención densa, con mayor coste de memoria.
- No se han publicado benchmarks ni métricas de calidad objetivas en la información disponible, por lo que la evaluación cualitativa queda a cargo del usuario.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/Lakonik/pi-H3)
- [Blog de pi-H3](https://hanshengchen.com/blog/pi-h3/)
- [Código (LakonLab)](https://github.com/Lakonik/LakonLab/blob/main/docs/piH3.md)
- [ComfyUI-piFlow](https://github.com/Lakonik/ComfyUI-piFlow/blob/main/docs/piH3.md)
- [Demo en Hugging Face Spaces](https://huggingface.co/spaces/Lakonik/pi-H3)
- [Página de DWD](https://hanshengchen.com/dwd/)
- [Modelo base MiniMax H3](https://huggingface.co/MiniMaxAI/MiniMax-H3)
- [Pipeline pruned usado en el ejemplo](https://huggingface.co/multimodalart/MiniMax-H3-Pruned)
- [Paper (arXiv:2611.22287)](https://arxiv.org/abs/2611.22287)
- [Página personal de Hansheng Chen](https://lakonik.github.io/)
