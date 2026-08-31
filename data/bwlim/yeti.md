# BWLim/YeTI

## Resumen

YeTI (You Only Need Two Noisy Images for Real-World sRGB Noise Generation) es un framework de generación de ruido realista para imágenes sRGB, desarrollado por investigadores de la Universidad de Hanyang y Samsung Electronics, presentado en ECCV 2026. El modelo resuelve el problema de sintetizar ruido de sensor dependiente de la señal sin necesidad de imágenes limpias de referencia ni metadatos de cámara: basta con dos observaciones ruidosas de la misma escena. Esto es especialmente relevante porque los métodos tradicionales de aumento de datos para denoising requieren pares limpio-ruidoso, que son costosos de obtener en condiciones reales.

La arquitectura combina un Reconstruction Autoencoder (RAE) que separa la estructura de la escena de las características del ruido, y un Conditional Diffusion Transformer (C-DiT) de un solo paso entrenado con objetivos de consistencia para modelar la distribución latente del ruido. El repositorio incluye los pesos de ambos componentes junto con denoisers de referencia (AP-BSN y MM-BSN) y versiones entrenadas con datos generados por YeTI. Los pesos se distribuyen bajo licencia académica exclusivamente para investigación no comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Reconstruction Autoencoder (RAE) + Conditional Diffusion Transformer (C-DiT) de un paso |
| Parametros totales | no disponible (los checkpoints ocupan ~145 MB el RAE y ~817 MB el C-DiT) |
| Parametros activos | no disponible |
| Longitud de contexto | no aplica (modelo de imagen, no texto) |
| Tipos de cuantizacion | no disponible (pesos en punto flotante de PyTorch Lightning) |
| Idiomas soportados | no aplica (procesamiento de imagenes) |
| Licencia | academic-use-only (uso academico y no comercial) |
| Formato de pesos | PyTorch Lightning `.ckpt` (no compatible directamente con `transformers` o `diffusers`) |

## Arquitectura y entrenamiento

YeTI se compone de dos modulos principales. El primero es un Reconstruction Autoencoder (RAE) que descompone una imagen ruidosa en un latente de estructura (informacion de la escena) y un latente de ruido (caracteristicas estocasticas del sensor). El segundo es un Conditional Diffusion Transformer (C-DiT) de un solo paso, entrenado con objetivos de consistencia, que modela la distribucion del ruido latente condicionado a la estructura. En inferencia, el modelo toma una unica imagen ruidosa y genera muestras ruidosas adicionales de la misma escena, que pueden usarse para entrenar denoisers auto-supervisados como AP-BSN o MM-BSN.

El entrenamiento se realizo sobre los conjuntos publicos SIDD (Smartphone Image Denoising Dataset) y MAI2021, que contienen ruido real de camaras de smartphone. No se dispone de informacion detallada sobre el numero de tokens o pasos de entrenamiento, ni sobre el uso de tecnicas de RLHF o DPO (no aplicables a este dominio). La innovacion clave reside en la capacidad de generar ruido realista a partir de solo dos imagenes ruidosas de la misma escena, sin necesidad de ground truth limpio ni metadatos de camara, lo que reduce drasticamente los requisitos de datos para el aumento de ruido.

## Capacidades

- Generacion de ruido sRGB realista y dependiente de la señal a partir de una unica imagen ruidosa de entrada.
- Separacion de estructura de escena y caracteristicas de ruido mediante el Reconstruction Autoencoder.
- Modelado de la distribucion latente del ruido con un Conditional Diffusion Transformer de un paso (inferencia rapida).
- Generacion de multiples muestras ruidosas de la misma escena, util para data augmentation en entrenamiento de denoisers.
- Compatibilidad con arquitecturas de denoising auto-supervisado como AP-BSN y MM-BSN, incluyendo pesos preentrenados con y sin datos generados por YeTI.
- No soporta capacidades de texto, tool calling, agentes ni multimodalidad fuera del dominio imagen-ruido.

## Casos de uso

- Investigacion academica en modelado de ruido realista: YeTI permite estudiar la distribucion del ruido de sensores de smartphone sin necesidad de capturar pares limpio-ruidoso, facilitando experimentos en laboratorio.
- Aumento de datos para entrenamiento de denoisers auto-supervisados: los investigadores pueden generar muestras ruidosas adicionales a partir de pocas observaciones reales y usarlas para mejorar el rendimiento de modelos como AP-BSN o MM-BSN, como demuestran los checkpoints `apbsn_mix.ckpt` y `mmbsn_mix.ckpt`.
- Validacion de algoritmos de denoising en condiciones realistas: al sintetizar ruido con caracteristicas de sensor especificas, se puede evaluar la robustez de un denoiser ante diferentes niveles de ISO o pipelines de captura.
- Desarrollo de tecnicas de generacion de ruido condicionado: el C-DiT de un paso sirve como base para explorar metodos de diffusion consistency aplicados a baja y alta frecuencia de imagen.
- Benchmarking de metodos de separacion estructura-ruido: el RAE puede utilizarse como referencia para comparar enfoques de disentanglement en problemas de imagen a imagen.
- Formacion de modelos de restauracion para fotografia movil: dado que el entrenamiento se centra en datos SIDD y MAI2021, es adecuado para ajustar denoisers destinados a camaras de smartphone.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas cuantitativas (PSNR, SSIM, etc.) ni comparaciones con otros metodos de generacion de ruido. Se recomienda consultar el articulo arXiv:2607.09193 para datos de evaluacion detallados.

## Requisitos de hardware

- Los checkpoints son ligeros: RAE (~145 MB), C-DiT (~817 MB), AP-BSN (~45 MB) y MM-BSN (~81 MB). En total el repositorio ocupa 1.2 GB.
- La inferencia del C-DiT de un paso requiere una GPU con al menos 4 GB de VRAM para una resolucion tipica de 512x512, aunque no se especifican requisitos oficiales. Una RTX 3060 o superior es suficiente para experimentos.
- Para entrenamiento desde cero o fine-tuning, se recomienda una GPU con 8-12 GB de VRAM, como RTX 3080 o A5000, dado que el modelo incluye dos modulos que deben entrenarse conjuntamente.
- No se proporcionan estimaciones de latencia ni throughput. Dado que el C-DiT es de un solo paso, la generacion es considerablemente mas rapida que los diffusion models iterativos convencionales.
- Los pesos estan en formato PyTorch Lightning `.ckpt` y requieren el codigo oficial del repositorio GitHub para cargarse. No son compatibles con vLLM, llama.cpp, Ollama ni TGI, ya que no es un modelo de lenguaje.

## Comparativa con modelos similares

No se dispone en la informacion proporcionada de comparaciones directas con otros metodos de generacion de ruido sRGB (p. ej., NoiseFlow, DnGAN, o enfoques basados en GANs). La model card no menciona alternativas comparables. Se recomienda revisar el articulo para una comparativa tecnica. En terminos de licencia, YeTI es mas restrictivo (solo academico) que otros modelos open source de generacion de ruido, que suelen usar licencias permisivas como MIT o Apache 2.0.

## Limitaciones y advertencias

- El modelo esta entrenado principalmente con ruido de smartphone de los conjuntos SIDD y MAI2021. El realismo del ruido generado puede degradarse significativamente para sensores, rangos ISO o pipelines de captura muy alejados de esa distribucion.
- No es un modelo autonomo: requiere el codigo del repositorio oficial para cargar los pesos. No funciona con librerias estandar de difusion como `diffusers`.
- Licencia estrictamente academica y no comercial. Cualquier uso en produccion o con fines comerciales requiere contacto directo con el autor correspondiente.
- No se proporcionan datos de sesgos o alucinaciones (concepto no aplicable a este tipo de modelo), pero si existe riesgo de que el ruido generado sea poco realista en condiciones extremas de iluminacion o sensores exoticos.
- El repositorio no incluye documentacion sobre el rendimiento en resoluciones altas (mas de 1K) ni sobre estabilidad numerica en diferentes backends.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/BWLim/YeTI
- Dataset en HuggingFace: https://huggingface.co/datasets/BWLim/YeTI
- Articulo arXiv: https://arxiv.org/abs/2607.09193
- Codigo oficial (GitHub): https://github.com/ByungWanLim/YeTI
- Licencia: https://github.com/ByungWanLim/YeTI/blob/main/LICENSE
