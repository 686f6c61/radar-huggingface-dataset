# leminhhung0101/anomaly_3branch

## Resumen

El modelo `anomaly_3branch` es un pipeline de detección de anomalías en imágenes basado en tres ramas complementarias de extracción de características: DINOv2, ConvNeXt y WideResNet50 con scoring estilo PatchCore. Está diseñado para un escenario de detección de anomalías de una sola clase (one-class / unsupervised), donde el conjunto de entrenamiento contiene únicamente imágenes normales. En lugar de entrenar un clasificador binario convencional, el sistema aprende la distribución de características de las muestras normales y asigna una puntuación de anomalía a cada imagen nueva según su distancia a dicha distribución.

Desarrollado por Lê Minh Hùng (usuario `leminhhung0101` en Hugging Face), el proyecto se publica como repositorio en GitHub y como modelo en Hugging Face, con un tamaño de repositorio de 0,3 GB. La relevancia actual radica en que aborda un problema común en entornos industriales y de manufactura: la detección de defectos cuando solo se dispone de ejemplos normales, sin necesidad de etiquetas de anomalías. El pipeline combina representaciones globales y semánticas (DINOv2), características jerárquicas multi-escala (ConvNeXt) y defectos locales a nivel de parche (WideResNet50 + PatchCore), fusionando las tres puntuaciones mediante normalización robusta y umbrales por categoría.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Pipeline de tres ramas: DINOv2 (transformer), ConvNeXt (CNN jerárquica), WideResNet50 + PatchCore (memoria de parches) |
| Parametros totales | no disponible (los backbones preentrenados están congelados; estimación aproximada de 240 M combinando los tres) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo de visión, sin contexto textual) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | no disponible |
| Formato de pesos | no disponible (repo de 0,3 GB; probablemente safetensors o pickle, sin confirmar) |

## Arquitectura y entrenamiento

El sistema se compone de tres ramas de extracción de características que operan en paralelo sobre la imagen de entrada. La primera rama utiliza DINOv2, un transformer preentrenado de forma autosupervisada, del que se extraen representaciones intermedias para capturar estructura global y semántica de alto nivel. La segunda rama emplea ConvNeXt, una arquitectura CNN jerárquica, cuyas características de varias etapas se agrupan y concatenan antes de reducir dimensionalidad, lo que permite detectar anomalías de textura, cambios superficiales y diferencias estructurales a escala media. La tercera rama se basa en WideResNet50 con un enfoque estilo PatchCore: los mapas de características intermedios se convierten en embeddings de parche que se almacenan en un banco de memoria de parches normales; para cada parche de prueba se busca el parche normal más cercano, y la puntuación final se calcula a partir de los parches más anómalos.

El entrenamiento es no supervisado y no implica una etapa de red neuronal convencional: los backbones preentrenados se mantienen congelados. Sobre las características extraídas de las imágenes normales se ajusta un PCA (solo con datos normales), se normalizan las embeddings con L2 y se construye una memoria kNN de vecinos normales. La puntuación de anomalía de cada rama se calcula como la distancia media a los K vecinos más cercanos. Las tres puntuaciones se normalizan de forma robusta (transformación Z) y se fusionan con igual peso. El proyecto incluye validación 5-fold out-of-fold (OOF) para estimar puntuaciones de anomalía en muestras normales no vistas, y validación con anomalías sintéticas (CutPaste, enmascarado local, duplicación de parches, desenfoque local y arañazos sintéticos) generadas a partir de imágenes normales retenidas, como herramienta de estrés y comparación de estrategias.

## Capacidades

- Detección de anomalías en imágenes en un escenario de una sola clase (solo se dispone de muestras normales para construir el modelo).
- Captura de anomalías globales y estructurales mediante DINOv2: formas anómalas, componentes faltantes o extra, cambios estructurales y desviaciones de apariencia global.
- Detección de anomalías de textura y superficie mediante ConvNeXt: cambios de textura, variaciones locales de apariencia y patrones visuales anómalos.
- Detección de defectos locales finos mediante la rama PatchCore: arañazos, pequeños agujeros, deformaciones locales, manchas, piezas diminutas faltantes y defectos de textura localizados.
- Fusión de puntuaciones de tres ramas con normalización robusta y umbrales por categoría, lo que permite adaptar la sensibilidad a cada tipo de defecto.
- Validación con anomalías sintéticas para comparar extractores de características, estrategias de fusión y robustez de umbrales, sin depender de etiquetas reales de anomalías.

## Casos de uso

- Inspección de calidad en manufactura: el pipeline puede integrarse en una línea de producción para detectar arañazos, abolladuras o decoloraciones en piezas metálicas o plásticas, utilizando únicamente imágenes de piezas correctas como referencia. La rama PatchCore es especialmente adecuada para defectos locales pequeños.
- Control de calidad en electrónica: detección de componentes faltantes, mal colocados o dañados en placas de circuito impreso (PCB). La rama DINOv2 captura cambios estructurales y de disposición, mientras que ConvNeXt detecta variaciones de textura en la superficie de la placa.
- Inspección de superficies textiles: identificación de defectos de tejido como hilos sueltos, manchas o patrones irregulares. La combinación de características multi-escala de ConvNeXt y la memoria de parches de PatchCore permite localizar anomalías de textura a diferentes escalas.
- Vigilancia de infraestructuras: detección de grietas, corrosión o deformaciones en estructuras de hormigón o metal a partir de fotografías periódicas. El modelo puede funcionar con un conjunto de imágenes normales de referencia y alertar sobre desviaciones significativas.
- Control de calidad en agricultura: clasificación de frutas o verduras con defectos superficiales (magulladuras, manchas, podredumbre incipiente) usando solo imágenes de productos sanos para construir la memoria normal. La fusión de las tres ramas mejora la robustez frente a variaciones de iluminación y fondo.
- Análisis de imágenes médicas (asistido): detección de hallazgos anómalos en radiografías o tomografías cuando no se dispone de un gran conjunto de casos patológicos etiquetados. El modelo puede señalar regiones que se desvían de la apariencia normal aprendida, como apoyo al especialista, aunque requiere validación clínica adicional.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas cuantitativas (como AUROC, F1-score o precisión) sobre conjuntos de datos estándar como MVTec AD, VisA o BTAD. Tampoco se proporcionan comparaciones con otros métodos de detección de anomalías.

## Requisitos de hardware

- Inferencia en GPU consumer: dado que los backbones están congelados y el pipeline no requiere entrenamiento de red, la inferencia es factible en GPUs de gama media como RTX 3060 (12 GB) o RTX 4060 (8 GB), dependiendo del tamaño de imagen y del número de parches procesados.
- VRAM estimada: no disponible de forma oficial. Con los tres backbones cargados simultáneamente (DINOv2 ViT-B ~86 M, ConvNeXt-B ~89 M, WideResNet50 ~68 M), se estima un uso de memoria de entre 2 y 4 GB en FP32 para la inferencia, más la memoria del banco de parches normales, que puede crecer con el número de imágenes de referencia.
- GPU recomendada: para procesamiento por lotes o imágenes de alta resolución, se recomienda una GPU con al menos 12 GB de VRAM (por ejemplo, RTX 3080, RTX 4070 Ti o A10). Para despliegue en producción con muchas categorías, una A100 o H100 ofrecería mayor throughput.
- Opciones de despliegue: al ser un pipeline de Python con dependencias de PyTorch, puede ejecutarse como servicio mediante FastAPI o Flask, o integrarse en sistemas de visión por computador existentes. No se han publicado adaptaciones para vLLM, llama.cpp u Ollama, ya que no es un modelo de lenguaje.
- Latencia y throughput: no disponibles. Dependen de la resolución de entrada, del número de vecinos k en kNN y del tamaño del banco de memoria de parches.

## Comparativa con modelos similares

No se dispone de una comparativa directa publicada por el autor. Como referencia, existen otros métodos de detección de anomalías de una clase que comparten enfoques similares:

| Modelo / método | Enfoque | Características | Licencia |
|---|---|---|---|
| PatchCore (Roth et al., 2022) | Memoria de parches con características de WideResNet50 | Detección de defectos locales, sin entrenamiento, muy eficiente | MIT (código) |
| PaDiM (Defard et al., 2021) | Distribución gaussiana por parche con características de CNN | Detección de anomalías locales y globales, ligero | Apache 2.0 |
| anomaly_3branch (este modelo) | Fusión de DINOv2 + ConvNeXt + PatchCore | Combina semántica global, textura multi-escala y defectos locales | no disponible |

La principal diferencia de `anomaly_3branch` es la combinación de tres extractores complementarios, lo que podría mejorar la robustez frente a tipos de defectos muy variados, aunque no se han publicado resultados que lo demuestren cuantitativamente.

## Limitaciones y advertencias

- No se ha publicado una licencia clara para el modelo ni para el código; antes de un uso comercial, es necesario contactar con el autor o revisar el repositorio de GitHub para confirmar los términos.
- El pipeline no incluye una etapa de entrenamiento de red neuronal; depende completamente de la calidad de las características preentrenadas de DINOv2, ConvNeXt y WideResNet50. Si el dominio de aplicación difiere mucho de los datos de preentrenamiento (ImageNet), el rendimiento puede degradarse.
- La validación con anomalías sintéticas (CutPaste, arañazos, etc.) no garantiza que el modelo generalice a anomalías reales no vistas; el autor lo indica explícitamente como herramienta de estrés, no como ground truth.
- El umbral por categoría requiere ajuste manual o mediante validación con datos etiquetados, lo que puede ser costoso en entornos reales.
- No se proporcionan métricas de rendimiento ni comparativas con otros métodos, por lo que no es posible evaluar su eficacia relativa sin experimentación propia.
- El tamaño del banco de memoria de parches crece con el número de imágenes normales de referencia; en conjuntos muy grandes, la búsqueda de vecinos puede volverse lenta sin técnicas de submuestreo o indexación aproximada.
- No se han documentado sesgos específicos, pero al ser un modelo de visión basado en características preentrenadas, puede presentar sesgos de representación según los datos de preentrenamiento (por ejemplo, menor precisión en ciertos tipos de objetos o condiciones de iluminación).

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/leminhhung0101/anomaly_3branch
- Repositorio en GitHub: https://github.com/hungle2006/anomaly_3branch
- Perfil del autor en Hugging Face: https://huggingface.co/leminhhung0101/models
