# Gajanan0530/satquery-ai-loveda-deeplabv3plus

## Resumen

SatQuery AI — DeepLabV3+ on LoveDA es un modelo de segmentación semántica de imágenes satelitales y de teledetección de alta resolución, desarrollado por Gajanan0530 dentro del proyecto de investigación SatQuery AI. Se trata de un DeepLabV3+ con encoder ResNet-50 preentrenado en ImageNet y ajustado sobre el dataset LoveDA (Land-cover Mapping Dataset), que cubre entornos urbanos y rurales. El modelo resuelve la tarea de clasificación densa de cobertura del suelo en siete clases: fondo, edificio, carretera, agua, terreno yermo, bosque y agricultura.

La arquitectura es un transformer no: es una red convolucional de segmentación semántica implementada con la librería Segmentation Models PyTorch, con 26.679.127 parámetros totales y una resolución de entrada de 1024 × 1024 píxeles. El entrenamiento se realizó con parches de 512 × 512, batch size de 4, precisión mixta FP16 y 10 épocas sobre una NVIDIA Tesla T4. El repositorio ocupa 0,6 GB e incluye dos checkpoints: el mejor por mIoU de validación y el final del entrenamiento.

Su relevancia es acotada y experimental: se trata de un piloto de 10 épocas con resultados de validación moderados (mIoU del 48,21 %, accuracy del 68,30 %) y sin evaluación sobre un conjunto de test independiente. Resulta útil como referencia reproducible de un pipeline de segmentación con LoveDA y como punto de partida para experimentos propios, no como modelo listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DeepLabV3+ con encoder ResNet-50 |
| Parametros totales | 26.679.127 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión; entrada de 1024 × 1024 píxeles) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | no disponible |
| Formato de pesos | PyTorch (.pth: `best_deeplabv3plus.pth`, `last_deeplabv3plus.pth`) |

## Arquitectura y entrenamiento

DeepLabV3+ es una arquitectura convolucional de segmentación semántica que combina un encoder para extracción de características multiescala con un decoder que refina los límites de los objetos. En este caso el encoder es ResNet-50 preentrenado en ImageNet, y la implementación procede de Segmentation Models PyTorch. La cabeza de segmentación produce siete clases más una etiqueta de no-data (255) que se ignora en el cálculo de la pérdida y de las métricas.

El ajuste se realizó sobre LoveDA: 2.522 imágenes de entrenamiento y 1.669 de validación, todas de 1024 × 1024 píxeles originales. Cada imagen se dividió en cuatro parches no solapados de 512 × 512; en cada época se seleccionó aleatoriamente un parche por imagen para entrenamiento, mientras que en validación se evaluaron los cuatro parches. La configuración incluye optimizador AdamW con learning rate 0,0001 y weight decay 0,0001, pérdida CrossEntropyLoss, scheduler ReduceLROnPlateau, precisión mixta FP16, batch size de 4 y 10 épocas sobre una NVIDIA Tesla T4. No se documenta uso de RLHF, DPO ni técnicas de decodificación especulativa, algo esperable en un modelo de visión.

## Capacidades

- Segmentación semántica densa de imágenes satelitales y de teledetección en siete clases de cobertura del suelo.
- Clasificación por píxel de fondo, edificio, carretera, agua, terreno yermo, bosque y agricultura.
- Generación de tres artefactos de salida: mapa de etiquetas (`prediction_labels.png`), mapa coloreado (`prediction_color.png`) y superposición sobre la imagen original (`prediction_overlay.png`).
- Manejo explícito de píxeles sin datos mediante la etiqueta 255, ignorada en entrenamiento y evaluación.
- Entrada restringida a imágenes RGB de 1024 × 1024 píxeles.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni capacidades multilingües: es un modelo puramente visual de segmentación.

## Casos de uso

- Cartografía de cobertura del suelo a escala local: el modelo permite generar mapas de siete clases sobre ortoimágenes de 1024 × 1024, útil para inventarios preliminares de edificación, vegetación y agua en entornos urbanos y rurales.
- Monitorización de crecimiento urbano: la clase Building alcanza un IoU del 60,12 % y un F1 del 75,09 %, lo que lo hace razonable para detectar expansión de suelo construido en series temporales de imágenes LoveDA.
- Análisis de masas de agua: con un IoU del 60,80 % en la clase Water, puede emplearse en seguimiento de embalses, cauces y láminas de agua en imágenes de alta resolución.
- Detección preliminar de superficies agrícolas: la clase Agriculture obtiene una precisión del 87,27 %, adecuada para tamizar imágenes candidatas antes de una revisión manual.
- Prototipado e investigación en teledetección: sirve como línea base reproducible (experimento `experiment-02-deeplabv3plus-loveda`) para comparar arquitecturas o estrategias de aumento de datos sobre LoveDA.
- Análisis de viabilidad urbana y planificación: la combinación de carretera, edificación y agua permite generar capas temáticas de apoyo a estudios de accesibilidad y uso del suelo, siempre con validación humana posterior.
- Docencia y experimentación con Segmentation Models PyTorch: el repositorio incluye un `inference.py` funcional y checkpoints listos para cargar, lo que facilita reproducir el pipeline en entornos académicos.

## Benchmarks y rendimiento

Resultados de validación del mejor checkpoint (época 10), según la model card:

| Metrica | Resultado |
|---|---:|
| Validation Loss | 0,86421 |
| Accuracy | 68,30 % |
| Mean IoU | 48,21 % |
| Mean F1 Score | 63,91 % |

Rendimiento por clase:

| Clase | IoU | Precision | Recall | F1 |
|---|---:|---:|---:|---:|
| Background | 52,91 % | 58,57 % | 84,56 % | 69,20 % |
| Building | 60,12 % | 76,30 % | 73,92 % | 75,09 % |
| Road | 50,68 % | 85,76 % | 55,33 % | 67,27 % |
| Water | 60,80 % | 82,12 % | 70,08 % | 75,62 % |
| Barren | 21,48 % | 75,04 % | 23,14 % | 35,37 % |
| Forest | 38,32 % | 54,37 % | 56,49 % | 55,41 % |
| Agriculture | 53,19 % | 87,27 % | 57,67 % | 69,44 % |

Estos resultados corresponden al split de validación, no a un conjunto de test independiente. No se han publicado comparaciones con otros modelos en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con 26,7 M de parámetros y entrada de 1024 × 1024, un modelo de este tamaño en FP32 ocupa del orden de 100 MB de pesos, pero las activaciones a resolución completa dominan el consumo. Se recomienda al menos 8 GB de VRAM para inferencia cómoda a 1024 × 1024.
- GPU de entrenamiento utilizada: NVIDIA Tesla T4 (16 GB), con batch size de 4 y FP16.
- GPU recomendadas para inferencia: cualquier GPU con 8 GB o más (RTX 3060 Ti, RTX 4070, RTX 4090, A100, H100). El modelo cabe holgadamente en GPUs de consumo.
- Despliegue: el autor proporciona un `inference.py` en el repositorio de GitHub; no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que no aplican a un modelo de segmentación de este tipo. Alternativas habituales serían TorchScript, ONNX Runtime o TensorRT, aunque no están documentadas en la información disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Arquitectura | Parametros | Contexto / entrada | mIoU reportado | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| SatQuery AI DeepLabV3+ (este modelo) | DeepLabV3+ / ResNet-50 | 26,7 M | 1024 × 1024 | 48,21 % (validación LoveDA) | no disponible | Hugging Face + GitHub |
| DeepLabV3+ / ResNet-101 (referencia SMP) | DeepLabV3+ / ResNet-101 | no disponible | variable | no disponible | según implementación | Segmentation Models PyTorch |
| U-Net / ResNet-50 (referencia SMP) | U-Net | no disponible | variable | no disponible | según implementación | Segmentation Models PyTorch |
| SegFormer (variantes B0-B5) | Transformer jerárquico | no disponible | variable | no disponible | según variante | Hugging Face |

No se dispone de datos de benchmarks comparativos publicados en la información proporcionada para establecer una comparación cuantitativa fiable con alternativas. La comparativa anterior es estructural, no de rendimiento.

## Limitaciones y advertencias

- Entrenamiento limitado a 10 épocas: se trata de un piloto, no de un modelo convergido ni ajustado exhaustivamente.
- Evaluación únicamente sobre el split de validación; no hay resultados sobre un conjunto de test independiente, por lo que el mIoU del 48,21 % puede no generalizar.
- Rendimiento débil en clases minoritarias: Barren (IoU 21,48 %, recall 23,14 %) y Forest (IoU 38,32 %) quedan muy por debajo del resto.
- Dificultad con estructuras finas y límites entre clases, según reconoce el propio autor.
- Entrada rígida: solo imágenes RGB de 1024 × 1024 píxeles; no se documenta manejo de otras resoluciones o composiciones de bandas.
- Licencia no disponible: no se puede confirmar el uso comercial; conviene contactar con el autor antes de cualquier despliegue productivo.
- Sin datos de sesgo: no se documenta el sesgo geográfico del dataset LoveDA ni su representatividad fuera de las regiones cubiertas.
- Riesgo de alucinación no aplica en el sentido de los LLM, pero sí existe riesgo de predicciones espurias en píxeles ambiguos o sin datos.
- Sin métricas de latencia, throughput ni consumo de VRAM documentadas.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: ecosistema de validación prácticamente nulo.

## Enlaces

- Hugging Face: https://huggingface.co/Gajanan0530/satquery-ai-loveda-deeplabv3plus
- Repositorio GitHub del proyecto: https://github.com/Gajanan0530/Sat-Query-AI
- Repositorio oficial de LoveDA: https://github.com/Junjue-Wang/LoveDA
- Dataset LoveDA en Zenodo: https://zenodo.org/records/5706578
