# HanyueShen/tiny-seastate-latent-int8

## Resumen

TinySeaState-LatentINT8 es un clasificador de imágenes de estado del mar desarrollado por Xinling Liao y Hanyue Shen, de YH Intelligence Technology (Pekín, China). El modelo resuelve la clasificación de cuatro estados del mar (calma, leve, moderado y agitado) a partir de imágenes RGB de 224×224 píxeles, con un diseño extremadamente compacto: el encoder cuenta con 25.432 parámetros totales y el checkpoint en formato SafeTensors ocupa 104.856 bytes. Su relevancia radica en que, pese a su tamaño mínimo, alcanza una precisión del 89,0208 % en el conjunto de prueba oficial de MU-SSiD, superando a MUSeNet (88,7 %) y a los 21 modelos comparados en el estudio original de Umair et al. (2022). El modelo está orientado a despliegue en entornos de edge computing y demuestra que es posible lograr resultados competitivos con arquitecturas ultraligeras. La liberación es solo de pesos, sin código de entrenamiento ni procedimiento de entrenamiento detallado.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder convolucional ligero que produce un tensor latente de 16×7×7; los 4 primeros canales actúan como coordenadas de clase y se aplica un voto espacial por pluralidad sobre 49 sitios |
| Parametros totales | 25.432 (según el archivo safetensors; la model card declara 24.984 parámetros de encoder) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo de visión, entrada de imagen fija de 224×224) |
| Tipos de cuantizacion | Cuantización simétrica por imagen a INT8 del tensor latente (latent-INT8) |
| Idiomas soportados | no disponible (el modelo no procesa texto) |
| Licencia | no disponible |
| Formato de pesos | safetensors (también se incluye un checkpoint PyTorch .pth) |

## Arquitectura y entrenamiento

La arquitectura es un encoder de visión que transforma una imagen RGB de 224×224 en un tensor latente de 16 canales y 7×7 posiciones espaciales. Los primeros cuatro canales del tensor se interpretan como coordenadas de clase fijas: para cada una de las 49 posiciones, se selecciona el canal con mayor valor entre los cuatro, y la etiqueta final se determina por voto mayoritario entre todas las posiciones, con desempate hacia el índice de clase más bajo. Esta estructura permite una inferencia extremadamente simple y eficiente, sin capas de clasificación adicionales. Para el endpoint entero, el tensor latente se cuantiza simétricamente por imagen a INT8 antes de aplicar la misma regla de orden y voto; la concordancia entre las predicciones en coma flotante y las cuantizadas es del 99,9583 %. No se dispone de información sobre el procedimiento de entrenamiento: no se especifican el número de épocas, la composición del dataset de entrenamiento, la función de pérdida ni si se emplearon técnicas como aumento de datos o regularización. La liberación es solo de pesos, sin código de entrenamiento ni registros internos.

## Capacidades

- Clasificación de imágenes de estado del mar en cuatro clases: calma (B1), leve (B2), moderada (B3) y agitada (B4).
- Procesamiento de imágenes RGB de 224×224 con normalización estándar (media y desviación típica de ImageNet).
- Salida de un tensor latente de 16×7×7 que puede utilizarse para otras tareas si se dispone del código de lectura adecuado.
- Cuantización INT8 del tensor latente sin pérdida práctica de precisión (concordancia del 99,9583 % con la versión en coma flotante).
- Inferencia de muy bajo coste computacional, adecuada para despliegue en dispositivos de borde.
- No soporta generación de texto, tool calling, razonamiento multi-paso, ni capacidades multimodales más allá de la visión.

## Casos de uso

- Monitorización meteorológica automatizada: el modelo puede integrarse en estaciones costeras que capturan imágenes del mar y generan alertas de estado de agitación, ayudando a la navegación y a la seguridad de las actividades portuarias.
- Sistemas de aviso para embarcaciones recreativas: una aplicación móvil o un dispositivo embarcado podría clasificar el estado del mar en tiempo real a partir de la cámara del teléfono, advirtiendo de condiciones peligrosas.
- Vigilancia marítima en infraestructuras offshore: plataformas petrolíferas o parques eólicos marinos pueden emplear cámaras fijas y este clasificador para registrar la evolución del oleaje sin necesidad de sensores costosos.
- Investigación oceanográfica de bajo coste: el modelo puede utilizarse para etiquetar automáticamente grandes colecciones de imágenes de archivo, facilitando estudios retrospectivos sobre condiciones del mar.
- Educación y divulgación: por su tamaño mínimo, puede ejecutarse en microcontroladores o en el navegador, sirviendo como ejemplo didáctico de clasificación de imágenes con redes ultraligeras.
- Sistemas de seguridad en puertos deportivos: clasificación automática de las condiciones del mar para decidir si se permiten salidas de embarcaciones pequeñas, integrándose en paneles de control con hardware limitado.

## Benchmarks y rendimiento

El autor declara los siguientes resultados en el model-index de Hugging Face, correspondientes al conjunto de prueba oficial de MU-SSiD (4.800 imágenes de 224×224):

| Tarea | Dataset | Métrica | Valor |
|---|---|---|---|
| Clasificación de estado del mar | MU-SSiD (test oficial) | Latent-INT8 hard-vote accuracy | 89,0208 % |
| Clasificación de estado del mar | MU-SSiD (test oficial) | Floating hard-vote accuracy | 89,0208 % |
| Clasificación de estado del mar | MU-SSiD (test oficial) | Float/INT8 prediction agreement | 99,9583 % |
| Clasificación de estado del mar | MU-SSiD (test oficial) | Correct predictions (sobre 4.800) | 4.273 |

Según la model card, este resultado supera al 88,7 % de MUSeNet y a los 21 modelos evaluados en la comparativa publicada por Umair et al. (2022). No se aportan más métricas (precisión por clase, F1, etc.) en la información disponible.

## Requisitos de hardware

- Al tratarse de un modelo con solo 25.432 parámetros, la VRAM necesaria es insignificante: puede ejecutarse en cualquier CPU moderna, incluso en placas de desarrollo como Raspberry Pi o microcontroladores con soporte para PyTorch.
- No se requiere GPU para inferencia; en caso de usarse, cualquier GPU con más de 1 GB de VRAM sería sobrada.
- El checkpoint en SafeTensors ocupa 104.856 bytes, por lo que puede cargarse en memoria en dispositivos con menos de 1 MB de RAM libre.
- Opciones de despliegue: al ser un modelo PyTorch estándar, puede servirse con TorchServe, ONNX Runtime (si se exporta), o integrarse directamente en aplicaciones Python. Para entornos de muy bajo consumo, podría convertirse a TensorFlow Lite o a formato C.
- La latencia estimada es del orden de milisegundos en CPU moderna, y de microsegundos en GPU, aunque no se han publicado mediciones oficiales.

## Comparativa con modelos similares

No se dispone de información detallada sobre modelos comparables más allá de la referencia a MUSeNet y a los 21 modelos del estudio de Umair et al. (2022). La model card indica que TinySeaState-LatentINT8 supera a todos ellos en el mismo protocolo de prueba, pero no se aportan las arquitecturas ni los tamaños de esos modelos. Se puede establecer una comparación directa con MUSeNet:

| Modelo | Parámetros | Precisión en MU-SSiD test | Licencia |
|---|---|---|---|
| TinySeaState-LatentINT8 | 25.432 | 89,0208 % | no disponible |
| MUSeNet | no disponible | 88,7 % | no disponible |

Para el resto de modelos de la comparativa original no se ofrecen datos individuales en la información disponible.

## Limitaciones y advertencias

- La licencia del modelo no está especificada, lo que genera incertidumbre sobre las condiciones de uso comercial y redistribución. Se recomienda contactar con los autores antes de utilizarlo en producción.
- No se ha publicado información sobre el procedimiento de entrenamiento, los datos utilizados ni las posibles fuentes de sesgo. La precisión declarada se basa únicamente en el conjunto de prueba oficial de MU-SSiD, que puede no representar todas las condiciones oceánicas reales.
- El modelo está limitado a cuatro clases de estado del mar según la escala de Douglas (B1 a B4); no cubre estados más extremos (B5, B6, etc.) ni condiciones como hielo marino o aguas interiores.
- Al ser un modelo de clasificación de imágenes, no genera explicaciones ni justificaciones de sus predicciones; puede ser propenso a errores en imágenes con condiciones de iluminación atípicas, niebla o reflexiones.
- La cuantización INT8 se aplica al tensor latente, no a los pesos del encoder; aunque la concordancia es muy alta, existe una pequeña probabilidad de diferencias en las predicciones (2 de 4.800 imágenes cambiaron en la evaluación).
- No se incluyen scripts de inferencia ni código de demostración en el repositorio, por lo que el usuario debe implementar la lógica de voto y la cuantización por su cuenta según la descripción de la model card.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/HanyueShen/tiny-seastate-latent-int8
- Dataset MU-SSiD en Kaggle: https://www.kaggle.com/datasets/umairatwork/mu-ssid/data
- Paper de referencia: Muhammad Umair et al., "A Novel Deep Learning Model for Sea State Classification Using Visual-Range Sea Images", *Symmetry*, 14(7), 1487, 2022. DOI: https://doi.org/10.3390/sym14071487
