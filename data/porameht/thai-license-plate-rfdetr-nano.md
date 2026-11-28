# Porameht/thai-license-plate-rfdetr-nano

## Resumen

Thai License Plate Detector (RF-DETR Nano, también denominado BLUR plate Nano v2) es un detector de objetos de una sola clase especializado en matrículas tailandesas, desarrollado por el usuario Porameht. Se trata de un ajuste fino del modelo RF-DETR Nano de Roboflow (licencia Apache-2.0), que emplea la arquitectura RF-DETR (Real-Time Detection Transformer) a una resolución de entrada de 640 píxeles. El repositorio ocupa 0,1 GB y se distribuye bajo licencia Apache-2.0.

El modelo no está pensado como detector principal sobre fotogramas completos, sino como segundo verificador dentro de una canalización de anonimización de vídeo denominada BLUR: se encarga de reexaminar recortes de vehículos (`roi_redetect`) y de emitir una segunda opinión sobre cada pista de matrícula (`plate_verify`). Para ello se entrenó con negativos duros específicos del dominio tailandés, como carteles de tiendas, pancartas, letreros de techo de taxi y faros.

Su relevancia radica en la combinación de un modelo transformer de detección en tiempo real de tamano reducido con un conjunto de datos curado para el contexto tailandés, un caso poco cubierto por los detectores genéricos. La model card reporta resultados de AP50 en siete conjuntos de prueba, con especial buen comportamiento en matrículas de coches cercanos (89,3 %) y en el conjunto kbtest (98,8 %, aunque este último es optimista por solapamiento con el entrenamiento).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | RF-DETR (Real-Time Detection Transformer), variante Nano, resolución de entrada 640 px |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión, no de lenguaje) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no aplica (detección visual; el dominio es matrículas tailandesas) |
| Licencia | Apache-2.0 |
| Formato de pesos | `.pth` (checkpoint `checkpoint_best_total.pth`) |
| Clases | 1 (matrícula) |
| Resolución de entrenamiento | 640 px |
| Librería | `rfdetr` |
| Tamano del repositorio | 0,1 GB |

## Arquitectura y entrenamiento

El modelo se basa en RF-DETR, un detector transformer en tiempo real de Roboflow, en su variante Nano y a 640 píxeles de resolución. Se parte de los pesos preentrenados `rf-detr-nano.pth` (Apache-2.0) y se ajusta con `num_classes=1` para la tarea de detección de matrículas. La inferencia se realiza mediante la clase `RFDETRNano` de la librería `rfdetr`, con un umbral de confianza recomendado de 0,25.

El ajuste fino se llevó a cabo el 23 de noviembre de 2026 sobre una RTX 5090 en aproximadamente 30 minutos, con parada temprana en la época 11 y mejor época la 3. El conjunto de datos `ds_v2` contiene 18 338 imágenes de entrenamiento, 784 de validación y 882 de prueba. Las fuentes combinan el split de entrenamiento de `keremberke/license-plate-object-detection` (con una copia aumentada), 902 fotografías de vehículos tailandeses de Wikimedia Commons y negativos duros también de Commons (carteles de carretera, vallas publicitarias, letreros de techo de taxi y faros). Las etiquetas de las imágenes de Commons son pseudoetiquetas generadas con `justjuu/rtdetr-v2-license-plate-detection` (Apache-2.0), conservadas solo cuando la caja se sitúa sobre un vehículo detectado por RF-DETR Medium; los aciertos fuera de vehículos se dejaron sin etiquetar como negativos duros. Se aplicaron aumentos específicos: recoloreado amarillo de matrículas blancas, lavado de imagen, baja resolución con reescalado y desenfoque de movimiento.

## Capacidades

- Detección de matrículas tailandesas en imágenes, con una única clase de salida.
- Funciona como verificador secundario sobre recortes de vehículos, no como detector principal sobre fotogramas completos.
- Inferencia sobre imágenes completas y sobre mosaicos 2x2 (tiling) para escenas de alta resolución.
- Manejo de negativos duros del dominio tailandés: carteles de tienda, pancartas, letreros de techo de taxi y faros.
- Integración con la librería `rfdetr` mediante `RFDETRNano` y el método `predict` con umbral configurable.
- Capacidad de producir cajas delimitadoras con puntuación de confianza para su uso en canalizaciones de desenfoque o anonimización.
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades multilingües (es un detector visual).

## Casos de uso

- Anonimización de vídeo de tráfico: el modelo actúa como segunda pasada sobre recortes de vehículos para confirmar matrículas antes de aplicar el desenfoque, reduciendo falsos positivos en la canalización BLUR.
- Verificación de pistas de matrícula: dado un seguimiento de matrícula ya detectado, el modelo emite una segunda opinión que permite descartar detecciones espurias antes de publicar el vídeo.
- Procesamiento de imágenes de alta resolución con mosaicos: para escenas 4K o superiores, se aplica sobre teselas de 640 px, lo que mejora la cobertura de matrículas pequenas en imágenes de tráfico urbano.
- Redacción de matrículas en material de archivo: aplicable a vídeos de Wikimedia Commons u otras fuentes públicas donde sea necesario ocultar matrículas antes de su reutilización.
- Filtrado previo en conjuntos de datos de vehículos: el modelo puede etiquetar automáticamente recortes de vehículos para construir o depurar datasets de matrículas tailandesas.
- Control de calidad en pipelines de detección existentes: se integra como etapa de validación entre un detector principal y el módulo de desenfoque, aprovechando su bajo coste computacional (modelo Nano).
- Detección en vehículos cercanos: con AP50 de 89,3 % en el conjunto de coches tailandeses cercanos, es adecuado para escenarios de aparcamiento o cámaras de proximidad.

## Benchmarks y rendimiento

AP50 (%), umbral 0,25, fotograma completo más teselas de 640 px, RTX 4090, 28-11-2026; todos los modelos evaluados con el mismo código.

| Conjunto de prueba | Imágenes / matrículas | Este modelo | RT-DETRv2 R50 (`justjuu/rtdetr-v2-license-plate-detection`) | D-FINE-S Thai (propio) |
|---|---|---|---|---|
| Calle tailandesa, Bangkok 4K (Roboflow cytron `thai-license-plate-detector` v1) | 153 / 515 | 42,5 | 25,6 | 49,4 |
| Coches tailandeses, cerca (Roboflow `ga/thai_license_plate` v3) | 98 / 109 | 89,3 | 87,6 | 96,2 |
| Matrículas de papel tailandesas ante webcam (cytron `-2` v1) | 46 / 46 | 38,0 | 87,7 | 69,0 |
| Recortes de matrículas tailandesas (Roboflow training-101 valid+test) | 2436 / 2584 | 43,9 | 49,1 | 94,1 |
| PP4AV, conducción europea (cámaras normales) | 3203 / 7787 | 59,1 | 37,9 | 71,7 |
| kbtest (keremberke test)* | 882 / 902 | 98,8 | 98,2 | 88,0 |
| CCPD hard splits | 2100 / 2100 | 85,1 | 84,4 | 97,4 |

\* El modelo se entrenó con el split de entrenamiento de keremberke, por lo que kbtest resulta optimista. El resto de conjuntos no se usaron en entrenamiento. La validación durante el entrenamiento (ds_v2 valid, 784 imágenes, mismas fuentes que el entrenamiento) reporta mAP50 de 0,905 y mAP50:95 de 0,648.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; por el tamano del repositorio (0,1 GB) y la variante Nano, cabe holgadamente en GPUs de consumo.
- GPU de entrenamiento reportada: RTX 5090 (aproximadamente 30 minutos de ajuste fino).
- GPU de evaluación reportada: RTX 4090.
- Cabe en GPU de consumo: sí, por el tamano reducido del checkpoint y la naturaleza Nano del modelo.
- Opciones de despliegue: librería `rfdetr` (uso nativo mostrado en la model card); no se documentan otras opciones como vLLM, llama.cpp, Ollama o TGI, que no aplican a un detector visual de este tipo.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Arquitectura | Clases | Licencia | Contexto / resolución | AP50 destacado | Disponibilidad |
|---|---|---|---|---|---|---|
| Este modelo (RF-DETR Nano Thai) | RF-DETR Nano | 1 (matrícula) | Apache-2.0 | 640 px | 89,3 % en coches cercanos; 98,8 % en kbtest | Hugging Face (`Porameht/thai-license-plate-rfdetr-nano`) |
| RT-DETRv2 R50 (`justjuu/rtdetr-v2-license-plate-detection`) | RT-DETRv2 R50 | 1 (matrícula) | Apache-2.0 | no disponible | 87,7 % en webcam; 98,2 % en kbtest | Hugging Face |
| D-FINE-S Thai (propio del autor) | D-FINE-S | 1 (matrícula) | no disponible | no disponible | 96,2 % en coches cercanos; 97,4 % en CCPD | Referenciado en la benchmark de la model card |

El modelo se posiciona como una alternativa ligera (Nano) frente a RT-DETRv2 R50 y D-FINE-S, con mejor rendimiento que RT-DETRv2 en varios conjuntos (calle 4K, PP4AV, CCPD) pero inferior a D-FINE-S Thai en la mayoría de pruebas. Su ventaja principal es el coste computacional reducido y su papel como verificador secundario, no como detector principal.

## Limitaciones y advertencias

- No está disenado como único detector de matrículas sobre fotogramas completos; su rendimiento en esa modalidad es limitado (AP50 de 42,5 % en calle 4K y 38,0 % en matrículas de papel ante webcam).
- El resultado en kbtest (98,8 %) es optimista porque el modelo se entrenó con el split de entrenamiento de keremberke; no debe interpretarse como rendimiento en datos no vistos.
- Las etiquetas de las imágenes de Wikimedia Commons son pseudoetiquetas generadas por otro detector, lo que puede introducir ruido y sesgos en el ajuste.
- El modelo detecta una única clase (matrícula) y no distingue tipos, países ni estados; está especializado en el contexto tailandés.
- Puede producir falsos positivos en elementos visuales similares a matrículas, como números pintados en carrocerías (la model card documenta una caja sobre un número de teléfono en la puerta de un taxi rosa con confianza 0,68).
- Licencia Apache-2.0 permite uso comercial, pero las fuentes de datos subyacentes tienen licencias variadas (CC BY 4.0, CC0, PD, CC BY, CC BY-SA) que deben respetarse en la atribución; los manifiestos `commons_manifest.json` y `neg_manifest.json` contienen la atribución de cada imagen.
- No se documentan sesgos demográficos ni geográficos más allá del dominio tailandés; su uso fuera de Tailandia o con matrículas de otros formatos no está validado.
- No se dispone de información sobre cuantización ni sobre latencia/throughput en producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Porameht/thai-license-plate-rfdetr-nano
- Dataset de entrenamiento principal: https://huggingface.co/datasets/keremberke/license-plate-object-detection
- Modelo base RF-DETR (Roboflow, Apache-2.0): no se proporciona URL directa en la información disponible
- Modelo usado para pseudoetiquetado: https://huggingface.co/justjuu/rtdetr-v2-license-plate-detection
- Vídeo de ejemplo (Wikimedia Commons, dominio público): https://commons.wikimedia.org/wiki/File:Bangkok_Traffic_During_Enduring_Partners_26_(1009429).webm
- Conjunto de evaluación cytron `thai-license-plate-detector` (Roboflow): no se proporciona URL directa
- Conjunto de evaluación `ga/thai_license_plate` (Roboflow): no se proporciona URL directa
- Conjunto PP4AV: no se proporciona URL directa
- Conjunto CCPD: no se proporciona URL directa
