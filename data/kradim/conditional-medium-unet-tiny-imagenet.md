# KRadim/conditional-medium-unet-tiny-imagenet

## Resumen

El modelo `KRadim/conditional-medium-unet-tiny-imagenet` es un modelo de difusión (DDPM) condicionado por clase, entrenado desde cero sobre el conjunto de datos Tiny ImageNet (64x64 píxeles, 200 clases). Desarrollado por KRadim (Radim Közl) utilizando JAX y Flax NNX, su arquitectura es un U-Net mediano que incorpora condicionamiento tanto por nivel de ruido (embeddings sinusoidales) como por etiqueta de clase (embeddings densos). El modelo resuelve el problema de generación de imágenes condicionadas a una categoría específica, permitiendo generar muestras sintéticas de objetos pertenecientes a 200 clases distintas.

La relevancia de este modelo radica en su enfoque de producción: los pesos entrenados se exportan a formato StableHLO con los parámetros completamente integrados en el bytecode, lo que permite ejecutar la inferencia sin necesidad de cargar la arquitectura Python ni gestionar pesos por separado. Esto facilita el despliegue en entornos de bajo consumo o en backends multiplataforma (C++, Rust) mediante el runtime de StableHLO. El modelo se publica bajo licencia MIT y su repositorio incluye tres formatos de exportación: checkpoint Orbax, MLIR y StableHLO.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | U-Net mediano con condicionamiento de clase (embeddings sinusoidales de tiempo y embeddings densos de clase) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de generacion de imagenes) |
| Tipos de cuantizacion | no disponible (no se menciona cuantizacion) |
| Idiomas soportados | ingles (etiqueta `en`; el modelo genera imagenes, no texto) |
| Licencia | MIT |
| Formato de pesos | Orbax checkpoint, MLIR, StableHLO bytecode (pesos integrados) |

## Arquitectura y entrenamiento

La arquitectura es un U-Net con condicionamiento dual: por un lado, el nivel de ruido continuo `amount ∈ [0, 1]` se codifica mediante embeddings posicionales sinusoidales; por otro, el índice de clase `label ∈ [0, 199]` se proyecta mediante embeddings densos que se inyectan en los bloques residuales. El modelo emplea convoluciones con stride para el downsampling, convoluciones transpuestas para el upsampling y conexiones residuales funcionales. Está implementado en JAX/Flax NNX.

El entrenamiento se realizó sobre el conjunto completo de Tiny ImageNet (100.000 imágenes, 200 clases) durante 240 épocas con un tamaño de lote de 256. Se utilizó el optimizador AdamW con una programación de tasa de aprendizaje warmup-cosine-decay y recorte de gradiente con norma global 1.0. No se menciona el uso de técnicas como RLHF o DPO, al tratarse de un modelo generativo de imágenes.

Una innovación destacable es la exportación a StableHLO con los pesos "horneados" en el bytecode, lo que permite ejecutar el modelo como una función autónoma sin necesidad de reconstruir la arquitectura ni gestionar parámetros externos. El bucle de inferencia se basa en un esquema cuadrático HQ de 80 pasos con corrección DDIM.

## Capacidades

- Generación de imágenes RGB de 64x64 píxeles condicionada por clase (200 clases de Tiny ImageNet).
- Condicionamiento simultáneo por nivel de ruido y por etiqueta de clase.
- Inferencia mediante StableHLO con pesos integrados, sin necesidad de cargar la arquitectura Python.
- Soporte para bucle de difusión inversa con esquema cuadrático de 80 pasos y corrección DDIM.
- No incluye capacidades de texto, tool calling, agentes ni multimodales más allá de la generación de imágenes.

## Casos de uso

- Generación de datasets sintéticos para entrenamiento de clasificadores: el modelo puede producir imágenes de 200 clases distintas, lo que permite aumentar conjuntos de datos existentes o crear datos de entrenamiento para tareas de visión por computador.
- Prototipado rápido de modelos de difusión: al estar entrenado desde cero y ser de tamaño reducido, sirve como banco de pruebas para experimentar con técnicas de condicionamiento, programaciones de ruido o esquemas de muestreo.
- Demostración de despliegue en producción con StableHLO: el formato exportado permite integrar el modelo en aplicaciones C++ o Rust mediante el runtime de StableHLO, útil para sistemas embebidos o edge computing.
- Generación de imágenes para documentación o presentaciones: se pueden crear ilustraciones sintéticas de objetos de las 200 clases de Tiny ImageNet sin necesidad de buscar imágenes reales.
- Investigación en generación condicionada de imágenes: el modelo sirve como referencia para estudiar el efecto del condicionamiento por clase en arquitecturas U-Net pequeñas.
- Validación de pipelines de exportación JAX a StableHLO: útil para desarrolladores que necesitan comprobar la viabilidad de exportar modelos JAX a formatos portables para inferencia sin dependencias de Python.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No se proporcionan métricas como FID, IS ni comparaciones con otros modelos.

## Requisitos de hardware

No se especifican requisitos de hardware en la información proporcionada. Dado que el modelo opera sobre imágenes de 64x64 píxeles y utiliza una arquitectura U-Net mediana, se puede inferir que es relativamente ligero, pero no hay datos oficiales de VRAM, GPU recomendada ni throughput.

- VRAM estimada: no disponible (probablemente baja, pero sin confirmación oficial).
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no confirmada, pero plausible por el tamaño de entrada.
- Opciones de despliegue: el formato StableHLO permite ejecución con el runtime de JAX, así como integración en backends C++/Rust. También se puede usar el checkpoint Orbax con Flax NNX.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de información sobre modelos directamente comparables en la misma categoría (U-Net de difusión condicionado por clase sobre Tiny ImageNet). No se puede establecer una comparativa fiable sin datos adicionales.

## Limitaciones y advertencias

- Resolución fija de 64x64 píxeles: no es adecuado para generar imágenes de mayor resolución sin adaptaciones.
- Número limitado de clases (200): restringido al vocabulario de Tiny ImageNet.
- El entrenamiento se realizó sobre un dataset específico; puede presentar sesgos inherentes a Tiny ImageNet (por ejemplo, desequilibrios entre clases o artefactos de las imágenes de baja resolución).
- Riesgo de alucinación visual: como todo modelo generativo, puede producir imágenes que no corresponden fielmente a la clase solicitada.
- No se mencionan métricas de calidad ni evaluación sistemática, por lo que el rendimiento real no está verificado.
- Aunque la licencia MIT permite uso comercial, el modelo se distribuye tal cual, sin garantías de precisión o idoneidad para producción.
- El tamaño del repositorio se indica como 0.0 GB, lo que sugiere que los archivos podrían no estar completamente subidos o que la información es incompleta.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/KRadim/conditional-medium-unet-tiny-imagenet)
- [Perfil del autor en Hugging Face](https://huggingface.co/KRadim)
