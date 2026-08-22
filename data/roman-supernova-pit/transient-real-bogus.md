# Roman-Supernova-PIT/transient-real-bogus

## Resumen

El modelo `Roman-Supernova-PIT/transient-real-bogus` es un conjunto (ensemble) de 24 clasificadores binarios diseñado para distinguir transitorios astronómicos reales de detecciones espurias (bogus) en imágenes de diferencia del telescopio espacial Nancy Grace Roman. Desarrollado por el Roman Supernova Project Infrastructure Team (SN PIT), este clasificador toma como entrada un recorte de 64×64 píxeles de una imagen de diferencia centrada en una candidata a detección y devuelve la probabilidad de que dicha candidata corresponda a un punto fuente astrofísico real (una supernova) en lugar de un artefacto de sustracción o un pico de ruido.

El ensemble combina seis familias de arquitecturas convolucionales y de transformers (DenseNet, ResNeXt, RegNetY, EfficientNet, ConvNeXt y DeiT), cada una con cuatro miembros entrenados de forma independiente. La media de las salidas sigmoideas de todos los miembros proporciona la predicción final. El modelo se distribuye bajo licencia CC-BY-4.0 y los pesos se guardan en formato PyTorch (`.pth`). Es una herramienta clave para el pipeline de detección de supernovas del Roman Space Telescope, que necesita clasificar miles de candidatas por imagen de forma rápida y fiable.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Ensemble de 24 modelos: DenseNet169 (from-scratch), ResNeXt50, RegNetY016, EfficientNetB0, ConvNeXtTiny y DeiTTiny (todos de timm, preentrenados en ImageNet excepto DenseNet) |
| Parametros totales | No disponible (cada familia tiene su propio número de parámetros; no se especifica en la documentación) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica (procesamiento de imágenes fijas) |
| Tipos de cuantizacion | No disponible (solo se publican pesos en precisión completa FP32) |
| Idiomas soportados | No disponible (no es un modelo de texto) |
| Licencia | CC-BY-4.0 |
| Formato de pesos | PyTorch `.pth` (checkpoints con estado del modelo) |

## Arquitectura y entrenamiento

El modelo es un ensemble de 24 clasificadores, organizados en 6 familias de arquitecturas. Cada familia tiene 4 miembros entrenados independientemente con una semilla distinta y un muestreo ponderado (WeightedRandomSampler) para equilibrar las clases. Las arquitecturas son: un DenseNet169 personalizado (sin preentrenamiento), y versiones de timm preentrenadas en ImageNet: ResNeXt50_32x4d, RegNetY016, EfficientNetB0, ConvNeXtTiny y DeiTTiny (este último con imagen de entrada 64×64). Todas las familias comparten el mismo formato de entrada: un recorte de imagen de diferencia (FITS) normalizado con `ZScaleInterval` y reescalado a [0,1], replicado a 3 canales para adaptarse a las arquitecturas que esperan RGB.

El entrenamiento se realizó con el optimizador AdamW, programación de tasa de aprendizaje con coseno y reinicios cálidos (cosine-annealing-with-warm-restarts), y early stopping basado en la precisión balanceada de validación. Los modelos se entrenaron durante 15 épocas (CNN) o 30 épocas (DeiT) sin aumento de datos; los tensores se cachean en RAM. Los datos positivos se generan inyectando una función de dispersión puntual (PSF) en imágenes de diferencia reales con SNR muestreada uniformemente en el rango [3,10], mientras que los negativos son detecciones del peak-finder (≥3σ) en imágenes no modificadas que no corresponden a ninguna inyección.

## Capacidades

- Clasificación binaria de transitorios: predice si un recorte de imagen de diferencia contiene un punto fuente real (supernova) o un artefacto (bogus).
- Procesamiento de imágenes astronómicas en formato FITS, con normalización específica para datos del telescopio Roman.
- Salida como probabilidad continua (sigmoid) que puede umbralizarse según la tasa de falsos positivos deseada.
- Inferencia por ensemble: promediar las salidas de los 24 miembros mejora la robustez y reduce la varianza.
- No tiene capacidades de generación de texto, razonamiento, código ni tool calling; es un modelo discriminativo puro para clasificación de imágenes.
- Soporta inferencia por lotes (batch) sobre tensores `(3, 64, 64)`.

## Casos de uso

- **Pipeline de alertas de supernovas en el Roman Space Telescope**: el modelo filtra candidatas a transitorios en tiempo real, reduciendo la carga de los sistemas de alerta (Roman Alerts Promptly from Image Differencing, RAPID PIT) al descartar la mayoría de las detecciones falsas.
- **Validación de candidatos en imágenes de diferencia**: en un flujo de trabajo de ciencia ciudadana o revisión manual, el modelo puede priorizar candidatos con alta probabilidad de ser reales, reduciendo el tiempo de inspección.
- **Entrenamiento de sistemas de aprendizaje automático para astronomía**: el ensemble puede usarse como base para transfer learning o para generar etiquetas pseudo-automáticas en grandes conjuntos de imágenes de diferencia.
- **Evaluación de la pureza del pipeline de detección**: al medir la tasa de falsos positivos sobre imágenes simuladas, permite ajustar los parámetros del peak-finder y de la inyección de PSF.
- **Análisis de datos de archivo**: aplicar el modelo a imágenes históricas del Roman (o de otros telescopios con características similares) para buscar eventos transitorios no detectados anteriormente.
- **Sistema de apoyo a la decisión en observaciones de seguimiento**: cuando un candidato supera un umbral de probabilidad, se puede activar una alerta automática para espectroscopía o fotometría de seguimiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible más allá de la precisión balanceada de validación (best-epoch balanced accuracy) por familia:

| Familia | Precisión balanceada (validación) |
|---|---|
| DenseNet169 (from-scratch) | 96.06% |
| ResNeXt50 (ImageNet) | 96.72% |
| RegNetY016 (ImageNet) | 97.21% |
| EfficientNetB0 (ImageNet) | 97.69% |
| ConvNeXtTiny (ImageNet) | 96.81% |
| DeiTTiny (ImageNet) | 92.92% |

Estos valores son la media de los 4 miembros de cada familia. No se proporcionan comparaciones con otros modelos ni métricas adicionales como precisión, recall o AUC.

## Requisitos de hardware

- **VRAM estimada**: no se especifica en la documentación. Las arquitecturas CNN típicas (EfficientNetB0, ResNeXt50, ConvNeXtTiny) requieren entre 1 y 4 GB de VRAM para inferencia en lote pequeño (batch size 1-8). DeiTTiny es un transformer ligero que también cabe en ese rango. El DenseNet169 personalizado podría requerir algo más, pero no hay datos concretos.
- **GPUs recomendadas**: cualquier GPU con al menos 4 GB de VRAM (p. ej., NVIDIA RTX 2060, GTX 1660 Ti, T4) puede ejecutar la inferencia de un solo modelo. Para el ensemble completo (24 modelos), se puede procesar secuencialmente o en paralelo en GPUs de mayor capacidad (A100, V100, RTX 3090).
- **Compatibilidad con consumer GPU**: Sí, los modelos son pequeños y se pueden ejecutar en GPUs de consumo (RTX 3060, 4070, etc.) sin problemas de memoria.
- **Opciones de despliegue**: Al ser modelos PyTorch, se pueden servir con frameworks de inferencia como TorchServe, vLLM (aunque vLLM está orientado a LLM, no a visión), o simplemente con un script Python que cargue los checkpoints y ejecute la inferencia. No se menciona soporte para GGUF, ONNX o TensorRT, aunque se podría convertir.
- **Latencia y throughput**: No se proporcionan datos. En una GPU moderna, la inferencia de una imagen de 64×64 con un modelo CNN típico toma del orden de milisegundos; el ensemble de 24 modelos podría tardar unos pocos milisegundos adicionales.

## Comparativa con modelos similares

No se dispone de información pública sobre otros clasificadores real/bogus para el Roman Space Telescope o para otros telescopios de sondeo (como ZTF o LSST) que se puedan comparar directamente con este ensemble. El equipo del Roman SN PIT menciona que su pipeline se basa en la experiencia con el Zwicky Transient Facility, pero no se publican métricas comparativas. Por tanto, la comparativa no está disponible en la documentación proporcionada.

## Limitaciones y advertencias

- **Sesgos de datos**: El modelo se entrena con simulaciones de PSF inyectadas en imágenes de diferencia reales. Esto puede no cubrir todos los tipos de transitorios reales (por ejemplo, eventos con morfología compleja o de baja SNR) y podría producir falsos negativos en casos extremos.
- **Riesgo de alucinación**: En el contexto de clasificación de imágenes, el riesgo de "alucinación" se traduce en falsos positivos (clasificar ruido como real). La precisión balanceada es alta (~97%), pero no perfecta.
- **Limitaciones de contexto**: El modelo solo procesa recortes de 64×64 píxeles. No puede analizar la imagen completa ni usar información temporal (series temporales) de un candidato.
- **Restricciones de licencia**: La licencia CC-BY-4.0 permite uso comercial con atribución, pero se debe citar el proyecto Roman SN PIT. No hay restricciones de uso militar o de alta riesgo, pero se recomienda revisar los términos de la licencia.
- **Caveat para producción**: El modelo está diseñado específicamente para datos del Roman Space Telescope (imágenes de diferencia con cierta normalización). Su uso en otros telescopios o con otros tipos de imágenes puede degradar el rendimiento. Además, el ensemble requiere cargar 24 checkpoints, lo que aumenta la complejidad de despliegue y el uso de memoria (aunque se puede inferir por lotes).

## Enlaces

- HuggingFace: [https://huggingface.co/Roman-Supernova-PIT/transient-real-bogus](https://huggingface.co/Roman-Supernova-PIT/transient-real-bogus)
- GitHub de la organización: [https://github.com/Roman-Supernova-PIT/](https://github.com/Roman-Supernova-PIT/)
- Sitio web del proyecto: [https://www.romansnpit.com/](https://www.romansnpit.com/)
- Documentación de datos del Roman PIT: [https://assets.science.nasa.gov/content/dam/science/missions/rst/science/Roman_PIT_Data_Products_User_Documentation_18feb2026.pdf](https://assets.science.nasa.gov/content/dam/science/missions/rst/science/Roman_PIT_Data_Products_User_Documentation_18feb2026.pdf)
- Repositorios de la organización en GitHub: [https://github.com/orgs/Roman-Supernova-PIT/repositories](https://github.com/orgs/Roman-Supernova-PIT/repositories)
