# Asilarkness/animegen-latent-diffusion

## Resumen

AnimeGen es un modelo ligero de generación de imágenes texto a imagen, especializado en ilustraciones de estilo anime. Ha sido desarrollado por el usuario Asilarkness y se distribuye bajo licencia MIT. El modelo se entrena desde cero sobre un conjunto de 65 675 imágenes reales de anime etiquetadas con tags de Danbooru, y emplea una arquitectura de difusión latente (latent diffusion) combinada con un autoencoder, un codificador de etiquetas basado en GRU y una U-Net condicional. Su tamaño total es de aproximadamente 15 MB, lo que lo convierte en una opción extremadamente compacta para tareas de generación de anime en entornos con recursos limitados.

La relevancia de este modelo radica en su simplicidad y bajo coste computacional: utiliza DDIM con 30 pasos y classifier-free guidance (CFG) para producir imágenes a 96x96 píxeles. Aunque su resolución es baja y su alcance se limita a un dominio muy específico, puede servir como punto de partida para experimentación académica, prototipado rápido o integración en aplicaciones donde el peso y la velocidad son críticos. No se han publicado resultados comparativos con otros modelos, pero su arquitectura y métricas internas (PSNR del autoencoder de 27,8 dB) están documentadas en la model card.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Latent diffusion (autoencoder + GRU tag encoder + U-Net condicional) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo texto a imagen, sin contexto de tokens) |
| Tipos de cuantizacion | no disponible (solo pesos completos en .pt) |
| Idiomas soportados | ingles (etiquetas Danbooru) |
| Licencia | MIT |
| Formato de pesos | PyTorch .pt (model.pt) |

## Arquitectura y entrenamiento

El modelo se compone de tres módulos principales:

1. **Autoencoder**: reduce imágenes de 96x96 píxeles a un espacio latente de 64 canales, con una calidad de reconstrucción medida en PSNR de 27,8 dB. Este componente permite trabajar en un espacio de menor dimensionalidad, acelerando el entrenamiento y la inferencia.
2. **Codificador de etiquetas GRU**: convierte secuencias de tags separadas por comas (p. ej., `1girl, halo, cowboy shot`) en un vector de condicionamiento que guía la generación.
3. **U-Net de difusión latente condicional** con tamaño base 256, que realiza el proceso de denoising en el espacio latente. Durante el muestreo se aplica classifier-free guidance (CFG) con un valor de 4.0 y se utiliza el sampler DDIM con 30 pasos.

El entrenamiento se realizó desde cero sobre 65 675 imágenes únicas de anime, todas etiquetadas con tags de Danbooru. No se menciona el uso de técnicas como RLHF o DPO. Una innovación destacable es la normalización latente por canal (media y desviación estándar), que evita que los latentes generados queden fuera de la distribución esperada, mejorando la estabilidad del muestreo.

## Capacidades

- Generación de imágenes de anime a partir de descripciones textuales en formato de etiquetas Danbooru (p. ej., `1girl, halo, cowboy shot, long hair`).
- Soporte para múltiples etiquetas separadas por comas, lo que permite combinar atributos como personajes, vestimenta, poses y fondos.
- Generación rápida gracias al sampler DDIM con 30 pasos y CFG (cfg=4.0), adecuada para iteración en tiempo casi real en hardware modesto.
- Condicionamiento mediante un codificador GRU que procesa secuencias de tags de longitud variable.
- Normalización latente per-channel que mejora la coherencia de las imágenes generadas.
- No se documentan capacidades adicionales como tool calling, agentes, visión o audio.

## Casos de uso

- **Prototipado de ilustraciones para juegos indie**: un desarrollador puede generar rápidamente conceptos de personajes anime usando tags descriptivos, sin necesidad de un artista o de GPUs potentes. El tamaño de 15 MB permite integrarlo en motores de juego o herramientas de diseño.
- **Generación de avatares personalizados**: aplicaciones de redes sociales o foros pueden ofrecer a los usuarios la creación de avatares anime únicos a partir de una lista de atributos (peinado, ropa, accesorios). La baja latencia de DDIM facilita la generación en tiempo real.
- **Aumento de datos para entrenamiento de clasificadores**: se pueden sintetizar imágenes anime etiquetadas para complementar datasets pequeños y mejorar la robustez de modelos de clasificación de estilos o personajes.
- **Herramientas educativas de difusión**: al ser un modelo pequeño y de código abierto, es ideal para enseñar los fundamentos de la difusión latente, el condicionamiento por texto y el guidance sin necesidad de infraestructura costosa.
- **Generación de fondos o escenarios simples**: aunque la resolución es baja (96x96), puede usarse para crear texturas o fondos de estilo anime en proyectos de pixel art o como base para upscaling posterior.
- **Experimentación con técnicas de CFG y DDIM**: investigadores pueden modificar el script `infer.py` para estudiar el efecto de distintos valores de cfg o pasos de DDIM sobre la calidad y diversidad de las imágenes, gracias a la simplicidad del código.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks comparativos en la informacion disponible. La única métrica documentada es el PSNR de reconstrucción del autoencoder, que alcanza 27,8 dB. No hay datos de FID, CLIP score u otras métricas estándar de generación de imágenes, ni comparaciones con modelos como Stable Diffusion o AnimeGAN.

## Requisitos de hardware

- **VRAM estimada**: no disponible oficialmente. Dado que el modelo completo ocupa 15 MB (pesos en float32), la inferencia podría ejecutarse incluso en CPU con unos pocos GB de RAM. En GPU, cualquier tarjeta con al menos 1 GB de VRAM sería suficiente.
- **GPU recomendadas**: no se especifican. Por el tamaño, cualquier GPU moderna (incluso integradas) podría ejecutarlo, aunque se recomienda una GPU con soporte CUDA para acelerar el denoising.
- **Compatibilidad con GPU de consumo**: sí, cualquier GPU de consumo (GTX 1060, RTX 2060, etc.) sería más que suficiente.
- **Opciones de despliegue**: el repositorio proporciona un script `infer.py` que carga el checkpoint `model.pt` y genera imágenes. No se mencionan integraciones con vLLM, llama.cpp, Ollama o TGI, ya que no es un modelo de lenguaje.
- **Latencia y throughput**: no hay datos oficiales. Con 30 pasos DDIM y un modelo de 15 MB, se estima una generación de pocos segundos en CPU y menos de un segundo en GPU, pero estos valores son orientativos.

## Comparativa con modelos similares

No se dispone de información comparativa con otros modelos en la documentación proporcionada. Sin embargo, por su tamaño y enfoque, podría compararse con modelos de difusión ligeros como Tiny Stable Diffusion o versiones cuantizadas de modelos mayores, pero no hay datos objetivos para establecer una tabla. Se recomienda consultar benchmarks externos o realizar pruebas propias.

## Limitaciones y advertencias

- **Resolución fija y baja**: las imágenes generadas tienen un tamaño de 96x96 píxeles, lo que limita su uso en aplicaciones que requieran alta calidad o impresión.
- **Dominio restringido**: el modelo solo genera contenido de anime y depende de etiquetas Danbooru en inglés. No soporta descripciones en lenguaje natural ni otros estilos artísticos.
- **Dataset limitado**: con 65 675 imágenes, la diversidad de personajes, poses y escenarios es limitada, lo que puede provocar repeticiones o sesgos hacia los elementos más frecuentes del dataset.
- **Riesgo de alucinaciones visuales**: como cualquier modelo generativo, puede producir imágenes distorsionadas, anatomías incorrectas o artefactos, especialmente con etiquetas poco comunes.
- **Sesgos del dataset**: al entrenarse con imágenes de Danbooru, el modelo puede reflejar sesgos de género, vestimenta o estilo presentes en esa comunidad.
- **Licencia MIT**: permite uso comercial, pero el modelo se ofrece sin garantías. El autor no proporciona soporte ni actualizaciones.
- **Sin control fino**: la generación depende exclusivamente de las etiquetas; no hay control sobre composición, iluminación o estilo más allá de lo que las etiquetas puedan implicar.

## Enlaces

- [HuggingFace - Asilarkness/animegen-latent-diffusion](https://huggingface.co/Asilarkness/animegen-latent-diffusion)
- No se proporcionan otros enlaces (papers, repositorios externos o demos) en la información disponible.
