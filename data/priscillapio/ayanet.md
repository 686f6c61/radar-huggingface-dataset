# PriscillaPio/AYANet

## Resumen

AYANet es un modelo de detección de cambios en edificios (Building Change Detection, BCD) para imágenes de teledetección, desarrollado por el equipo Ayana del INRIA (Francia) y presentado en el ICPR 2024. El modelo combina un codificador basado en wavelets de Gabor con un codificador CNN en una arquitectura de doble codificador, aprovechando la textura regular y repetitiva característica de los edificios en imágenes de satélite o aéreas para mejorar la precisión de la detección de cambios.

El modelo resuelve el problema de identificar alteraciones estructurales (construcción, demolición, modificación) entre dos imágenes de la misma zona tomadas en momentos distintos, una tarea crítica para la monitorización urbana, la gestión de catástrofes y la actualización cartográfica. Su relevancia actual radica en la creciente disponibilidad de imágenes satelitales de alta resolución y la necesidad de métodos automáticos fiables para el análisis del territorio.

AYANet se validó en el conjunto de datos LEVIR-CD, donde alcanza un F1-Score de 91,41 y un IoU de 84,17. El repositorio oficial en Hugging Face incluye el código de entrenamiento y evaluación, así como los pesos del modelo, bajo licencia GPL-3.0. No se especifican el número de parámetros ni la arquitectura interna completa en la información disponible.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Doble codificador: codificador basado en wavelets de Gabor + codificador CNN (EfficientNet) con decodificador AYANet |
| Parametros totales | no disponible |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no aplica (modelo de vision por computador) |
| Tipos de cuantizacion | no disponible (pesos en punto flotante, sin cuantizacion publicada) |
| Idiomas soportados | no aplica (no es un modelo de lenguaje) |
| Licencia | GPL-3.0 |
| Formato de pesos | no disponible (probablemente checkpoints de PyTorch, no confirmado) |

## Arquitectura y entrenamiento

AYANet emplea una arquitectura de doble codificador. El primer codificador utiliza filtros de Gabor modulados dentro de una red CNN para extraer las características texturales distintivas de los edificios, que presentan patrones regulares y repetitivos en imágenes de teledetección. El segundo codificador, basado en EfficientNet, extrae características de alto nivel de la escena completa. Ambos codificadores se combinan en un decodificador específico (denominado `ayanet`) que produce el mapa binario de cambios.

El entrenamiento se realizó con el optimizador AdamW, una tasa de aprendizaje de 0.0001, tamaño de lote de 8 y 300 épocas, según los scripts proporcionados. El modelo se evaluó en tres conjuntos de datos de detección de cambios en edificios: LEVIR-CD, WHU-CD y S2Looking. No se detalla el número total de imágenes de entrenamiento ni si se aplicaron técnicas como aumento de datos, aunque el código permite configurar distintos modos de codificador (solo Gabor, solo EfficientNet o doble).

## Capacidades

- Detección de cambios en edificios entre imágenes bi-temporales de teledetección (detección binaria de cambios).
- Análisis de imágenes aéreas y satelitales de alta resolución.
- Extracción de características texturales mediante wavelets de Gabor, específicamente orientada a la morfología de edificios.
- Generación de mapas de cambios con indicadores de verdaderos positivos, falsos positivos, falsos negativos y verdaderos negativos para evaluación cualitativa.
- Soporte para entrenamiento y evaluación con diferentes configuraciones de codificador (doble, solo Gabor o solo EfficientNet).
- Capacidad de visualización de resultados cualitativos (imágenes originales, ground truth, predicciones y métricas por píxel).

## Casos de uso

- Monitorización urbana y planificación territorial: detectar automáticamente nuevas construcciones o demoliciones entre dos pasadas de satélite, permitiendo actualizar mapas catastrales y urbanísticos con mayor frecuencia y menor coste que la inspección manual.
- Gestión de desastres naturales: comparar imágenes pre y post evento (terremoto, inundación, incendio) para identificar edificios dañados o destruidos, facilitando la priorización de equipos de rescate y evaluación de daños.
- Control de cumplimiento normativo: verificar si se han realizado construcciones no autorizadas en zonas protegidas o de uso restringido, mediante la comparación de imágenes temporales de la misma área.
- Actualización de bases de datos geoespaciales: alimentar sistemas de información geográfica (SIG) con cambios de edificios detectados automáticamente, reduciendo el trabajo de campo necesario para mantener cartografía al día.
- Análisis de expansión urbana informal: identificar asentamientos ilegales o crecimiento no planificado en la periferia de ciudades mediante la detección de nuevas estructuras en imágenes de satélite de baja y media resolución.
- Auditoría de infraestructuras: comprobar la integridad de instalaciones críticas (subestaciones eléctricas, plantas industriales) comparando imágenes de distintas fechas para detectar modificaciones no documentadas.

## Benchmarks y rendimiento

El autor declara los siguientes resultados en el conjunto de datos LEVIR-CD para la tarea de detección de cambios en edificios:

| Dataset | Metrica | Valor |
|---|---|---|
| LEVIR-CD | F1-Score | 91,41 |
| LEVIR-CD | IoU | 84,17 |

No se han publicado resultados comparativos con otros modelos en la información disponible. Tampoco se indican métricas para los otros conjuntos de datos mencionados (WHU-CD, S2Looking).

## Requisitos de hardware

- No se especifican requisitos mínimos de hardware en la documentación proporcionada.
- Al ser un modelo basado en CNN con doble codificador, se estima que podría ejecutarse en GPUs de consumo medio (p. ej., NVIDIA RTX 3060 o superior) con 8-12 GB de VRAM, pero esta cifra es una estimación no confirmada.
- El código de entrenamiento y evaluación está diseñado para entornos con GPU (el script `run_CD.sh` incluye `gpu_ids`), probablemente usando CUDA.
- No se indican opciones de despliegue específicas (vLLM, TGI, etc.), ya que no es un modelo de lenguaje. La inferencia se realizaría mediante el propio código del repositorio o integrando los pesos en un pipeline de PyTorch.
- No hay datos de latencia ni throughput publicados.

## Comparativa con modelos similares

No se dispone de información comparativa con otros modelos de detección de cambios en edificios (como ChangeFormer, BIT, DTCDSCN, etc.) en la documentación proporcionada. El autor menciona en el paper que AYANet "mostró resultados prometedores en comparación con el estado del arte", pero no se incluyen los valores numéricos de esos competidores en la información disponible.

## Limitaciones y advertencias

- La licencia GPL-3.0 implica que cualquier uso comercial o distribución del modelo y sus derivados debe liberar el código fuente bajo la misma licencia, lo que puede ser restrictivo para integraciones propietarias.
- El modelo está entrenado específicamente para detección de cambios en edificios; su rendimiento en otros tipos de cambios (vegetación, agua, infraestructuras lineales) no está validado.
- Los resultados declarados (F1 91,41, IoU 84,17) provienen de una única evaluación en LEVIR-CD y no han sido verificados de forma independiente.
- No se documentan posibles sesgos relacionados con regiones geográficas, tipos de construcción o resoluciones de imagen diferentes a las de los conjuntos de entrenamiento.
- La generalización a otros sensores satelitales o condiciones atmosféricas puede verse limitada, aunque no se especifica.
- No se proporcionan pesos preentrenados en formatos estándar (safetensors, ONNX, TensorRT), lo que dificulta su integración en entornos de producción sin conversión manual.
- El repositorio de Hugging Face tiene 0 descargas y 0 likes, lo que sugiere una adopción limitada y una comunidad de usuarios pequeña.

## Enlaces

- Hugging Face: https://huggingface.co/PriscillaPio/AYANet
- Repositorio GitHub oficial: https://github.com/Ayana-Inria/AYANet
- Paper en HAL (acceso abierto): https://hal.science/hal-04675243
- Proceedings ICPR 2024 (Springer): https://link.springer.com/chapter/10.1007/978-3-031-78347-0_9
- Presentación del equipo INRIA (PDF): https://team.inria.fr/ayana/files/2024/12/demo_ayana2024_Priscilla.pdf
