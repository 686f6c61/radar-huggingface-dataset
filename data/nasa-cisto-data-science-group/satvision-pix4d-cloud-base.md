# nasa-cisto-data-science-group/satvision-pix4d-cloud-base

## Resumen

SatVision-Pix4DCloud Base es un modelo fundacional espacio-temporal para observación de la Tierra, desarrollado por el grupo de ciencia de datos de la NASA CISTO (Computational and Information Sciences and Technology Office) en el Goddard Space Flight Center. Se trata de una versión pre-release orientada a evaluación y experimentación, diseñada específicamente para trabajar con secuencias de imágenes del satélite geoestacionario GOES-16 (sensor ABI). El modelo aprende representaciones que retienen explícitamente la información de nubes y variabilidad atmosférica, a diferencia de otros modelos de teledetección que se centran en superficies en condiciones de cielo despejado.

La arquitectura combina un Vision Transformer (ViT) con un objetivo de entrenamiento de autoencoder enmascarado (Masked Autoencoder, MAE) aplicado a secuencias temporales. Cada muestra de entrenamiento contiene 7 instantes consecutivos de las 16 bandas espectrales del ABI, con un espaciado de 20 minutos entre observaciones, lo que cubre aproximadamente dos horas de evolución atmosférica. El modelo procesa tiles de 512×512 píxeles con un patch size de 16×16, un encoder de 24 bloques con dimensión de embedding 1024 y un decoder de 8 bloques con dimensión 512. El tamaño del repositorio es de 0.7 GB, aunque no se especifica el número total de parámetros.

La relevancia de este modelo radica en su capacidad para codificar la dinámica atmosférica a partir de datos geoestacionarios de alta frecuencia temporal, algo fundamental para aplicaciones como la caracterización de nubes, el análisis de convección, la recuperación tridimensional de nubes y el nowcasting meteorológico a corto plazo. Al estar licenciado bajo Apache 2.0, puede utilizarse tanto en investigación como en entornos comerciales.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision Transformer (ViT) con objetivo Masked Autoencoder (MAE) espacio-temporal |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | 7 timesteps × 20 min = 120 minutos de evolución temporal |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no aplica (modelo de visión por computadora) |
| Licencia | Apache 2.0 |
| Formato de pesos | no disponible (probablemente safetensors, no confirmado) |

## Arquitectura y entrenamiento

El modelo utiliza un enfoque de autoencoder enmascarado espacio-temporal. La entrada es un tensor de forma `[B, T, C, H, W]` donde `T=7` timesteps, `C=16` bandas espectrales ABI, `H=W=512` píxeles. Cada imagen se divide en patches de 16×16 píxeles, generando 1024 tokens por imagen. Sobre estos tokens se aplica un enmascaramiento aleatorio del 60% durante el preentrenamiento. El encoder es un Vision Transformer estándar con 24 bloques, dimensión de embedding 1024, 16 cabezas de atención y ratio MLP de 4. El decoder, utilizado solo durante el preentrenamiento, tiene 8 bloques con dimensión de embedding 512 y 16 cabezas de atención.

El preentrenamiento se realiza con datos de nivel 1B del sensor ABI del GOES-16, procesados mediante el pipeline de datos SatVision-Pix4DCloud. Este pipeline genera tiles estratificados que incluyen regiones de convección, sistemas nubosos y tipos de cobertura terrestre. La innovación principal es que el modelo aprende conjuntamente de las dimensiones espectral, espacial y temporal, capturando la evolución de las nubes y los sistemas atmosféricos en lugar de tratar cada imagen como una instantánea independiente. No se menciona el uso de RLHF, DPO ni otras técnicas de alineación, ya que no es un modelo de lenguaje.

## Capacidades

- Representaciones espacio-temporales de observaciones satelitales geoestacionarias, capaces de codificar la evolución de nubes, convección y sistemas atmosféricos.
- Extracción de características multiespectrales: relaciones entre las 16 bandas del ABI (visible, infrarrojo cercano, infrarrojo térmico, etc.).
- Análisis de morfología de nubes, textura, gradientes y estructuras dentro de tiles de 512×512 píxeles.
- Captura de cambios temporales a lo largo de 7 observaciones espaciadas 20 minutos, lo que permite distinguir crecimiento, organización, desplazamiento y desarrollo convectivo.
- Modelo de tipo encoder, diseñado para ser reutilizado como backbone en tareas posteriores (downstream) mediante cabezas de predicción específicas.
- No es un modelo generativo de texto ni admite tool calling, agentes ni razonamiento simbólico; su ámbito es exclusivamente la visión por computadora aplicada a teledetección.

## Casos de uso

- Nowcasting meteorológico a corto plazo: el modelo puede alimentar sistemas de predicción inmediata de precipitación y convección, aprovechando su capacidad para modelar la evolución temporal de las nubes en ventanas de 2 horas.
- Caracterización de nubes: clasificación de tipos de nubes (cúmulos, estratos, cirros) y estimación de propiedades ópticas y microfísicas a partir de las representaciones multiespectrales.
- Análisis de convección profunda: detección y seguimiento de sistemas convectivos en desarrollo, útil para alertas tempranas de tormentas severas.
- Recuperación tridimensional de nubes: las representaciones espacio-temporales pueden servir como entrada para modelos que estiman la estructura vertical de las nubes a partir de observaciones satelitales.
- Monitorización de la evolución atmosférica en tiempo casi real: integración en pipelines operativos que procesan datos GOES-16 para servicios de vigilancia meteorológica.
- Investigación en ciencias atmosféricas: extracción de características para estudios de dinámica de nubes, interacción nube-aerosol y procesos de convección en regiones tropicales o de latitudes medias.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El modelo se encuentra en fase de pre-release y la documentación no incluye métricas cuantitativas de rendimiento en tareas posteriores.

## Requisitos de hardware

- VRAM estimada: no disponible. El tamaño del repositorio es de 0.7 GB, lo que sugiere que los pesos del modelo podrían caber en GPUs de 8 GB, pero el coste de activaciones durante la inferencia con secuencias de 7×16×512×512 puede ser significativamente mayor.
- GPU recomendadas: no se especifican. Para un modelo ViT de 24 bloques con embedding 1024, se recomienda al menos una GPU con 16 GB de VRAM (por ejemplo, RTX 4080, A10, L4) para inferencia en lotes pequeños. Para entrenamiento o fine-tuning, se necesitarían GPUs de 40 GB o más (A100, H100).
- Compatibilidad con GPUs de consumo: probablemente sí, con cuantización y optimización de memoria, aunque no hay garantías documentadas.
- Opciones de despliegue: al ser un modelo PyTorch estándar, puede servirse con frameworks como TorchServe, vLLM (si se adapta) o mediante una API personalizada. No hay integración nativa con llama.cpp u Ollama, que están orientados a modelos de lenguaje.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de una comparativa directa publicada. Sin embargo, existen modelos relacionados en el mismo dominio:

| Modelo | Arquitectura | Datos de entrenamiento | Contexto temporal | Licencia |
|---|---|---|---|---|
| SatVision-Pix4DCloud Base | ViT + MAE espacio-temporal | GOES-16 ABI L1B, 7 timesteps × 20 min | 120 minutos | Apache 2.0 |
| SatVision-Base (SatVis-B) | SwinV2 + MIM contrastivo | MODIS reflectancia superficial, 1.99M chips | Imágenes individuales (sin secuencia temporal) | Apache 2.0 |
| Prithvi (IBM-NASA) | ViT | HLS (Harmonized Landsat/Sentinel) | Imágenes individuales o series cortas | Apache 2.0 |

La diferencia clave es que SatVision-Pix4DCloud incorpora explícitamente la dimensión temporal, mientras que los otros modelos trabajan principalmente con imágenes estáticas o series muy cortas.

## Limitaciones y advertencias

- Versión pre-release: los pesos, procedimientos de preprocesado, interfaces y documentación pueden cambiar en futuras versiones.
- Requiere reproducir exactamente el pipeline de preprocesado y normalización utilizado durante el preentrenamiento para obtener resultados coherentes.
- Limitado a datos GOES-16 ABI; no es directamente aplicable a otros sensores sin adaptación.
- No se han publicado métricas de rendimiento ni estudios de sesgos; el comportamiento en escenarios de cielo despejado o superficies complejas no está caracterizado.
- La licencia Apache 2.0 permite uso comercial, pero al ser un modelo de investigación, no hay garantías de soporte ni de precisión en entornos de producción.
- El modelo no procesa texto ni lenguaje natural; su uso se limita a tareas de visión por computadora sobre datos satelitales.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/nasa-cisto-data-science-group/satvision-pix4d-cloud-base
- Repositorio GitHub del proyecto: https://github.com/nasa-nccs-hpda/satvision-pix4d-cloud
- Modelo relacionado SatVision-Base: https://huggingface.co/nasa-cisto-data-science-group/satvision-base
- Presentación NASA@SC23: https://www.nas.nasa.gov/SC23/research/project24.html
- Resumen en ADS: https://ui.adsabs.harvard.edu/abs/2023AGUFMIN53A..08L/abstract
