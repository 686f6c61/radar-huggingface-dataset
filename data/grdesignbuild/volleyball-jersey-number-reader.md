# grdesignbuild/volleyball-jersey-number-reader

## Resumen

El modelo `grdesignbuild/volleyball-jersey-number-reader` es un clasificador de imágenes basado en una red neuronal convolucional ResNet-18, desarrollado por el usuario `grdesignbuild` con el objetivo de leer el número de la camiseta de jugadores de voleibol a partir de recortes de personas detectadas en vídeo. Se trata de un modelo de fine-tuning sobre `microsoft/resnet-18`, con un total de 11.197.911 parámetros y un peso de 0.1 GB en formato `safetensors`. Está diseñado como complemento del detector `grdesignbuild/volleyball-person-ball-detector`: el detector localiza a las personas y este modelo lee sus dorsales, permitiendo asociar momentos y estadísticas a cada jugador.

Su principal innovación es una cabeza de salida de 23 logits organizados en tres grupos (decenas, unidades y legibilidad), lo que le permite leer números que nunca vio durante el entrenamiento. El modelo se entrenó con recortes de torso procedentes de 2.025 keyframes 4K de partidos de clubes juveniles, con pseudo-etiquetas generadas por el reconocedor de texto de Apple Vision. Aunque se trata de un modelo de nicho, es relevante para el análisis deportivo automatizado, ya que resuelve un problema concreto y molesto en la indexación de vídeo de voleibol: identificar de forma fiable a los jugadores a partir de sus dorsales.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ResNet-18 (CNN) |
| Parametros totales | 11.197.911 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No aplica (modelo de visión, no de texto) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

Adicionalmente, el modelo se publica con `library_name: transformers`, `pipeline_tag: image-classification` y es compatible con endpoints de Hugging Face (`endpoints_compatible`). Su modelo base es `microsoft/resnet-18`.

## Arquitectura y entrenamiento

La arquitectura es una ResNet-18 estándar, preentrenada en ImageNet y fine-tuneada para clasificación de imágenes. En lugar de una salida convencional de clases mutuamente excluyentes, el modelo tiene una cabeza de 23 logits dividida en tres grupos independientes: los logits 0-9 representan la cifra de las decenas (con el logit 10 indicando "en blanco" para números de una sola cifra), los logits 11-20 representan la cifra de las unidades, y los logits 21-22 indican si el número es legible o no. Esta descomposición permite leer números compuestos no vistos en entrenamiento, siempre que las cifras individuales hayan sido vistas.

El entrenamiento se realizó con recortes de torso (del 10 % al 60 % de la altura de la caja de persona, ampliados un 10 % por lado y redimensionados a 224×224) procedentes de 2.025 keyframes 4K de partidos de clubes juveniles en pabellones cubiertos, playa y césped. Las etiquetas fueron pseudo-etiquetas generadas por el reconocedor de texto de Apple Vision sobre mosaicos de la imagen completa, conservadas solo cuando la lectura caía dentro de una caja de persona, en su 70 % superior, y no era señalización estática. Los recortes sin lectura limpia se etiquetaron como "ilegible", limitados a un máximo del doble de los legibles. El conjunto final contiene 1.435 recortes legibles de 66 números distintos, divididos por grabación para que las grabaciones de validación sean inéditas. Las imágenes contienen menores y no se publican.

## Capacidades

- Lectura de números de camiseta en recortes de torso de jugadores de voleibol, con salida de número de una o dos cifras (incluyendo "07").
- Clasificación de legibilidad: distingue entre "legible" e "ilegible" mediante un logit dedicado.
- Generalización a números no vistos durante el entrenamiento gracias a la descomposición en decenas y unidades.
- Integración directa con el pipeline de Transformers (`AutoModelForImageClassification` y `AutoImageProcessor`).
- Compatibilidad con `endpoints_compatible`, lo que permite desplegarlo en Hugging Face Inference Endpoints.
- No soporta tool calling, ni razonamiento multi-paso, ni generación de texto, ni visión general: es un clasificador de imágenes de un solo propósito.

## Casos de uso

- Análisis de partidos de voleibol: el modelo se combina con el detector de personas/balón para leer los dorsales de los jugadores en cada frame y asignar estadísticas (saques, remates, bloqueos) a cada jugador de forma automática.
- Transmisión en directo: integrado en un sistema de seguimiento, puede superponer el nombre del jugador sobre su dorsal en tiempo real, mejorando la experiencia de los espectadores.
- Entrenamiento y análisis de rendimiento: los entrenadores pueden usar el modelo para generar informes individualizados de cada jugador a partir de vídeos de entrenamiento, sin anotación manual.
- Scouting automatizado: el modelo permite indexar vídeos de partidos y crear clips por jugador, facilitando la revisión de actuaciones concretas en ligas juveniles.
- Investigación en visión por computador deportiva: sirve como componente de referencia para pipelines de identificación de jugadores, especialmente en deportes donde los números de camiseta son la única señal visual fiable.
- Sistemas de vigilancia y análisis de aforo: en pabellones con cámaras fijas, puede leerse el dorsal de jugadores en combinación con un detector de personas, sin necesidad de sensores RFID.

## Benchmarks y rendimiento

La model card publica los siguientes resultados de evaluación sobre grabaciones reservadas, comparando las predicciones del modelo con las lecturas del profesor (Apple Vision):

| Metrica | Valor |
|---|---|
| Exactitud de número en recortes legibles | 0.671 |
| Precision de números predichos | 0.588 |
| Precision / recall de legible | 0.866 / 0.988 |
| Precision de números con confianza ≥ 0.85 | 0.79 (recall 0.49) |

El autor indica que las etiquetas del profesor tienen aproximadamente un 10 % de error, por lo que la exactitud real es algo mayor. No se han publicado resultados de benchmarks comparativos con otros modelos en la información disponible.

## Requisitos de hardware

- VRAM estimada: menos de 1 GB en FP32 (los pesos de ResNet-18 ocupan aproximadamente 45 MB).
- GPU recomendadas: cualquier GPU moderna con al menos 2 GB de VRAM (T4, RTX 2060, RTX 3060, A10). También puede ejecutarse en CPU con latencias aceptables para procesamiento por lotes.
- Cabe en cualquier GPU de consumo (RTX 3060, RTX 4090, etc.) y en dispositivos móviles tras exportar a CoreML, como sugieren las etiquetas del repositorio.
- Opciones de despliegue: Transformers (Python), Hugging Face Inference Endpoints, exportación a ONNX o CoreML.
- Latencia y throughput: no disponible, pero al ser una ResNet-18 de 11M parámetros, la inferencia es muy rápida (del orden de milisegundos por imagen en GPU).

## Comparativa con modelos similares

No se dispone de comparativas publicadas con modelos similares en la información disponible. El modelo es un fine-tuning de `microsoft/resnet-18`, por lo que puede compararse con el modelo base en cuanto a parámetros y arquitectura, pero las capacidades son completamente distintas: el modelo base clasifica 1.000 categorías de ImageNet, mientras que este modelo clasifica números de camiseta de voleibol. No se han encontrado alternativas equivalentes en la búsqueda web.

## Limitaciones y advertencias

- Los números solo son legibles una fracción del tiempo (espalda girada, oclusiones, distancia). Se espera que el modelo devuelva "ilegible" con frecuencia; se recomienda usar seguimiento multi-frame y confianza ≥ 0.85 para identificar jugadores de forma fiable.
- Entrenado exclusivamente con camisetas de clubes juveniles: fuentes inusuales, texto de patrocinadores cerca del número y números mayores de 99 quedan fuera del alcance.
- Los números de dos cifras con cero inicial (por ejemplo, "07") son raros en los datos de entrenamiento, lo que puede afectar a su precisión.
- Las imágenes de entrenamiento contienen menores y no se publican, lo que limita la reproducibilidad y la inspección del conjunto de datos.
- El modelo no es un modelo de lenguaje: no genera texto ni mantiene contexto conversacional. Su uso está restringido a clasificación de imágenes de recortes de torso.
- La exactitud de número en recortes legibles es moderada (0.671), por lo que no debe usarse como única fuente de identidad en aplicaciones críticas sin un sistema de seguimiento que refuerce la confianza.
- Licencia Apache-2.0 permite uso comercial, pero el tratamiento de imágenes de menores en vídeos deportivos puede estar sujeto a normativas de protección de datos (GDPR).

## Enlaces

- HuggingFace: https://huggingface.co/grdesignbuild/volleyball-jersey-number-reader
- Modelo compañero (detector de personas y balón): https://huggingface.co/grdesignbuild/volleyball-person-ball-detector
- Modelo base: https://huggingface.co/microsoft/resnet-18
- No se han encontrado papers, blogs ni repositorios adicionales en la búsqueda web.
