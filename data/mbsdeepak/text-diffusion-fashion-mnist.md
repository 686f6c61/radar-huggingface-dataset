# mbsdeepak/text-diffusion-fashion-mnist

## Resumen

El modelo `text-diffusion-fashion-mnist` es un modelo de difusión condicionado por texto, desarrollado por mbsdeepak, que genera imágenes de prendas de vestir a partir de descripciones textuales. Está construido desde cero en PyTorch y sigue el paradigma de Stable Diffusion en miniatura: una U-Net aprende a revertir un proceso de ruido gaussiano, condicionada por embeddings de texto de CLIP congelados, y genera imágenes de 32×32 píxeles en escala de grises de las 10 clases de Fashion-MNIST mediante classifier-free guidance.

El modelo resuelve el problema de la generación de imágenes condicionadas por texto en un dominio restringido (moda básica), sirviendo como demostración didáctica de los principios de DDPM, DDIM y condicionamiento cruzado. Con 19,4 millones de parámetros, es un modelo ligero que puede ejecutarse en hardware modesto. Su relevancia radica en que ofrece una implementación completa y reproducible de un pipeline de text-to-image, con código fuente disponible en GitHub, lo que lo convierte en un recurso valioso para aprender y experimentar con difusión generativa.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | U-Net (diffusion) con condicionamiento por texto vía FiLM y cross-attention |
| Parametros totales | 19.442.817 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (generación de imágenes, no texto) |
| Tipos de cuantizacion | no disponible (solo se proporcionan pesos en precisión completa) |
| Idiomas soportados | no disponibles (las captions están fijadas en inglés, pero el modelo no es multilingüe) |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura se basa en una U-Net clásica para difusión, entrenada con el objetivo de predicción de ruido (ε-predicción) según el marco DDPM, con un schedule de ruido coseno y T=1000 pasos. El condicionamiento textual se implementa mediante embeddings de CLIP congelados (`openai/clip-vit-base-patch32`) que se inyectan en la U-Net a través de capas FiLM (modulación de características) y mecanismos de cross-attention. Durante el entrenamiento se aplica un dropout del 15% en las captions para habilitar classifier-free guidance (CFG) en la inferencia.

El modelo se entrenó durante 15 épocas sobre el dataset Fashion-MNIST, con imágenes de 32×32 normalizadas al rango [-1, 1]. El entrenamiento se realizó en Apple Silicon (MPS) y alcanzó una pérdida final de aproximadamente 0.043. Para el muestreo se utiliza DDIM con 50 pasos y una escala de guidance de 3.0. Los pesos publicados son los crudos (no EMA), ya que en un entrenamiento corto la media exponencial aún no converge y los pesos vivos producen muestras más limpias.

## Capacidades

- Generación de imágenes de 32×32 en escala de grises correspondientes a las 10 clases de Fashion-MNIST: camiseta, pantalón, jersey, vestido, abrigo, sandalia, camisa, zapatilla, bolso y bota.
- Condicionamiento por texto mediante embeddings de CLIP, aunque restringido a un conjunto fijo de 10 captions predefinidas (una por clase).
- Uso de classifier-free guidance para ajustar la adherencia al texto durante el muestreo.
- Soporte de muestreo DDIM con un número configurable de pasos (50 por defecto).
- No soporta tool calling, razonamiento multi-paso ni capacidades de agente, al ser un modelo puramente generativo de imágenes.
- No es multilingüe; las captions están fijadas en inglés y no hay soporte para vocabulario abierto.

## Casos de uso

- Generación de datos sintéticos para entrenamiento de clasificadores de moda: el modelo puede producir nuevas imágenes de cada clase de Fashion-MNIST, ampliando el conjunto de datos original para mejorar la robustez de modelos de visión.
- Aumento de datos en pipelines de aprendizaje automático: al generar variaciones de prendas a partir de ruido, se pueden equilibrar clases infrarrepresentadas o crear conjuntos de validación sintéticos.
- Prototipado rápido de diseños conceptuales: un diseñador podría describir una prenda (dentro de las 10 categorías) y obtener una imagen aproximada en 32×32 para evaluar ideas preliminares.
- Educación y formación en modelos generativos: sirve como ejemplo práctico de DDPM, DDIM y classifier-free guidance, permitiendo a estudiantes inspeccionar el código y modificar hiperparámetros.
- Experimentación con condicionamiento por texto: al ser un modelo pequeño, es ideal para probar variantes de arquitectura (FiLM, cross-attention) sin necesidad de grandes recursos computacionales.
- Base para investigación en generación condicionada de baja resolución: puede utilizarse como punto de partida para estudiar técnicas de escalado a resoluciones mayores o a datasets más complejos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor no reporta métricas comparativas (FID, IS, etc.) en la model card ni en el repositorio.

## Requisitos de hardware

- Al ser un modelo de solo 19,4 millones de parámetros, la inferencia es viable en CPU y en cualquier GPU con al menos 1 GB de VRAM.
- En precisión float32, los pesos ocupan aproximadamente 77 MB; en float16, unos 39 MB. Por tanto, cabe holgadamente en GPUs de consumo como la NVIDIA GTX 1050 Ti, RTX 2060 o superiores.
- El entrenamiento se realizó en Apple Silicon (MPS), lo que indica que el modelo puede ejecutarse en entornos con aceleración MPS, además de CUDA y CPU.
- Opciones de despliegue: el modelo no está integrado en librerías estándar como vLLM o TGI (diseñadas para modelos de lenguaje). Para usarlo, es necesario clonar el repositorio de GitHub y seguir las instrucciones de carga y muestreo proporcionadas en la model card.
- La latencia de generación depende del hardware; en una GPU moderna, 50 pasos de DDIM sobre una imagen de 32×32 deberían completarse en menos de un segundo, aunque no se proporcionan mediciones oficiales.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables de la misma categoría (difusión condicionada por texto en miniatura para Fashion-MNIST) en los datos proporcionados. La mayoría de los modelos de difusión text-to-image, como Stable Diffusion, son varios órdenes de magnitud mayores y operan a resoluciones superiores, por lo que una comparación directa no sería significativa.

## Limitaciones y advertencias

- El modelo está condicionado a un conjunto fijo de 10 captions predefinidas; no admite vocabulario abierto ni descripciones arbitrarias.
- La resolución de salida es de 32×32 píxeles en escala de grises, lo que limita su utilidad en aplicaciones que requieran imágenes de alta calidad o color.
- Es un proyecto de aprendizaje/portfolio, no un sistema listo para producción; puede generar imágenes poco realistas o con artefactos.
- Los pesos publicados son crudos (no EMA), lo que puede afectar a la calidad de las muestras en comparación con un modelo con EMA.
- No se han evaluado sesgos ni riesgos de alucinación; al ser generativo, puede producir imágenes que no correspondan exactamente a la clase solicitada.
- La licencia MIT permite uso comercial, pero el autor no ofrece garantías sobre el rendimiento en entornos de producción.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/mbsdeepak/text-diffusion-fashion-mnist)
- [Repositorio de código en GitHub](https://github.com/mbsdeepak/text-diffusion-fashion-mnist)
