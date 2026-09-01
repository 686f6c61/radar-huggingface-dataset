# originlab/lotus-game-depth

## Resumen

OriginLab Lotus Game-Depth es un modelo de estimación de profundidad monocular basado en difusión latente, desarrollado por OriginLab. Se publica en un repositorio con dos checkpoints: uno preentrenado desde cero sobre el dataset sintético OriginLab Game-Depth (compuesto por z-buffers de motores de juego) y otro ajustado finamente sobre NYU Depth V2. El modelo sigue la receta Lotus, empleando un UNet de Stable Diffusion 2 base con 8 canales de entrada, predicción de x0 en un solo paso en t=999 y disparidad truncada. Su relevancia radica en ofrecer una alternativa entrenada exclusivamente con datos sintéticos de juegos, lo que puede resultar útil para entornos virtuales, aunque su acceso está restringido y su licencia es propietaria.

El repositorio tiene un tamaño de 7,8 GB y se distribuye en formato safetensors, integrado con la librería Diffusers. No se especifican parámetros totales, idiomas ni cuantizaciones alternativas. Al ser un modelo de visión, no aplica longitud de contexto textual. La licencia es origin-lab-data-license, una licencia personalizada que requiere aceptación de condiciones en Hugging Face.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | UNet de Stable Diffusion 2 base (latent diffusion), 8 canales de entrada, single-step x0 en t=999, trunc_disparity |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo de vision, no textual) |
| Tipos de cuantizacion | no disponible (solo safetensors) |
| Idiomas soportados | no disponible |
| Licencia | origin-lab-data-license (propietaria, acceso restringido) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo emplea una arquitectura de difusión latente basada en el UNet de Stable Diffusion 2, adaptada para estimación de profundidad. La receta Lotus se caracteriza por predecir directamente el x0 en un solo paso (t=999) en lugar de realizar el proceso de denoising completo, lo que acelera la inferencia. La entrada se modifica con 8 canales (imagen RGB más condiciones adicionales) y se aplica trunc_disparity para limitar el rango de profundidad.

El checkpoint preentrenado se entrenó desde cero sobre el dataset OriginLab Game-Depth, que contiene z-buffers generados por motores de juego, sin datos reales. Posteriormente, se realizó un ajuste fino sobre NYU Depth V2, un dataset de profundidad de interiores reales. No se dispone de información sobre el número de tokens de entrenamiento, composición exacta del dataset ni uso de RLHF o DPO.

## Capacidades

- Estimación de profundidad monocular densa: genera mapas de profundidad a partir de una única imagen RGB.
- Inferencia de un solo paso gracias a la receta Lotus, lo que reduce el coste computacional frente a difusión iterativa.
- Dos variantes: una especializada en entornos sintéticos (preentrenada) y otra adaptada a interiores reales (fine-tuned en NYU).
- Integración con Diffusers para su uso en pipelines de depth-estimation.
- No dispone de capacidades de generación de texto, tool calling, agentes ni razonamiento multi-paso.

## Casos de uso

- Generación de mapas de profundidad para entornos de juego: el checkpoint preentrenado puede utilizarse para producir depth buffers en tiempo real o para preprocesar escenas sintéticas, aprovechando su entrenamiento con z-buffers de motores de juego.
- Preprocesamiento para renderizado 3D: permite convertir imágenes 2D en mapas de profundidad que alimentan técnicas de reiluminación, composición o efectos de profundidad de campo en pipelines de producción audiovisual.
- Robótica en simulación: en entornos simulados (por ejemplo, simuladores de robots), el modelo puede estimar profundidad a partir de cámaras RGB, útil para navegación o manipulación sin necesidad de sensores de profundidad reales.
- Realidad aumentada y virtual: para integrar objetos virtuales en escenas reales o sintéticas, el mapa de profundidad ayuda a calcular oclusiones y posicionamiento correcto.
- Análisis de escenas de interior: la variante fine-tuned en NYU puede emplearse en aplicaciones de reconstrucción 3D de interiores, como diseño de espacios o inspección de edificios.
- Investigación en visión por computador: sirve como referencia para estudiar el impacto de datos sintéticos en tareas de profundidad, comparando su comportamiento frente a modelos entrenados con datos reales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- No se proporcionan requisitos oficiales de VRAM ni GPU recomendadas.
- Dado que el repositorio pesa 7,8 GB y la arquitectura es un UNet de SD2, se estima que la inferencia requiere al menos 8-12 GB de VRAM en FP16, dependiendo de la resolución de entrada.
- Es probable que quepa en GPUs de consumo como RTX 3080/4080 o superiores, pero no hay confirmación oficial.
- Al ser un modelo de difusión, el despliegue puede realizarse con Diffusers en Python, o mediante herramientas compatibles con safetensors como ONNX Runtime o TensorRT, aunque no se documentan opciones específicas.
- No se dispone de datos de latencia o throughput.

## Comparativa con modelos similares

No disponible. No se han identificado modelos comparables en la informacion proporcionada, aunque el modelo sigue la receta Lotus, que también se aplica a otros checkpoints de estimación de profundidad. Sin datos de rendimiento ni especificaciones detalladas, no es posible establecer una comparación rigurosa.

## Limitaciones y advertencias

- Acceso restringido: el modelo es gated en Hugging Face, por lo que requiere aceptar condiciones de uso antes de descargarlo.
- Licencia propietaria: origin-lab-data-license no es una licencia open source estándar; limita el uso comercial y la redistribución según los términos específicos.
- Entrenamiento con datos sintéticos: el checkpoint preentrenado puede no generalizar bien a imágenes reales, ya que solo ha visto z-buffers de juegos.
- El ajuste fino en NYU se limita a escenas de interior, por lo que su rendimiento en exteriores o entornos no estructurados puede degradarse.
- No se documentan sesgos específicos, pero al estar entrenado con datos de juegos, podría presentar artefactos o comportamientos atípicos en escenas del mundo real.
- No hay información sobre alucinaciones (no aplica a un modelo de visión), pero la estimación de profundidad puede fallar en regiones con texturas ambiguas o superficies reflectantes.
- El tamaño del repositorio (7,8 GB) implica un coste de almacenamiento y descarga considerable.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/originlab/lotus-game-depth
- Árbol de archivos del repositorio: https://huggingface.co/originlab/lotus-game-depth/tree/main
- Dataset OriginLab Game-Depth: https://huggingface.co/datasets/originlab/game-depth
- Colección de OriginLab Game-Depth: https://huggingface.co/collections/originlab/originlab-game-depth
- Perfil de OriginLab en Hugging Face: https://huggingface.co/originlab
- Sitio web de OriginLab: https://originlab.ai
