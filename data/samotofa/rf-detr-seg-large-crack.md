# samOTOFA/rf-detr-seg-large-crack

## Resumen

rf-detr-seg-large-crack es un modelo de segmentación de instancias especializado en la detección de fisuras en superficies de hormigón. Lo desarrolla el usuario samOTOFA y se distribuye bajo licencia Apache 2.0. El modelo parte de RF-DETR seg-large de Roboflow, un detector-segmentador basado en la arquitectura DETR (transformer de detección de objetos), y lo afina sobre el conjunto de datos Crack-seg para la tarea concreta de segmentar fisuras en carreteras y muros. La relevancia de este modelo reside en su especialización: en lugar de un detector genérico, ofrece una sola clase (`crack`) y un contrato de exportación a ONNX pensado para integrarse en pipelines de inspección estructural.

El repositorio es de tamaño reducido (0,1 GB) y contiene los pesos exportados a ONNX, con un contrato de entrada y salida bien definido. No se trata de un modelo de lenguaje, sino de un modelo de visión por computador para segmentación de instancias, por lo que las capacidades y los casos de uso difieren sustancialmente de los de un LLM. La información disponible sobre arquitectura interna, número de parámetros y datos de entrenamiento es limitada y se detalla en las secciones siguientes.

La model card está redactada en francés y describe el proceso de entrenamiento, las métricas de calidad sobre el split de test y el contrato de inferencia ONNX. Es un modelo de "veille" (vigilancia) según su propio autor, es decir, no ha sido evaluado fuera del dominio de Crack-seg, lo que condiciona su uso en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | RF-DETR seg-large (DETR con segmentación de instancias, base Roboflow) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión; entrada de imagen 504x504) |
| Tipos de cuantizacion | no disponible (pesos exportados a ONNX float32) |
| Idiomas soportados | no aplica (modelo de visión, sin componente de lenguaje) |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (opset 17, IR 8) |

## Arquitectura y entrenamiento

El modelo se basa en RF-DETR seg-large de Roboflow, una arquitectura de detección y segmentación de instancias derivada de la familia DETR (Detection Transformer). RF-DETR combina un backbone de extracción de características con un transformer de detección que predice directamente conjuntos de cajas y máscaras, eliminando la necesidad de anchors y de supresión no máxima (NMS) en la fase de post-proceso. La variante "seg" añade una cabeza de segmentación que produce máscaras por instancia. La información proporcionada no detalla el número de parámetros, la profundidad del transformer ni la configuración exacta del backbone.

El afinamiento se realizó sobre el conjunto Crack-seg, compuesto por 3717 imágenes de entrenamiento, 200 de validación y 112 de test, con dominio público (PDM 1.0) y procedente de Roboflow Universe (`university-bswxt/crack-bphdr`), a través del archivo de Ultralytics. Las imágenes representan carreteras y muros, casi todas con fisuras. Además, se añadieron 1000, 100 y 100 imágenes sanas (sin fisuras) de SDNET2018 (80 % muros, 20 % tableros y pavimentos), distribuidas entre los splits por fotografía de origen para evitar fuga de datos. SDNET2018 es de Maguire, Dorafshan y Thomas (2018), de la Utah State University, bajo licencia CC BY 4.0. No se especifica si hubo aumentación de datos, número de épocas, función de pérdida ni hiperparámetros de entrenamiento.

## Capacidades

- Segmentación de instancias de fisuras en imágenes de hormigón, con una única clase (`crack`).
- Detección de cajas delimitadoras además de máscaras por instancia (salidas `dets`, `labels` y `masks`).
- Inferencia sobre imágenes RGB de 504x504 píxeles, con normalización ImageNet y redimensionado bilineal.
- Exportación a ONNX con contrato fijo, probado con ONNX Runtime 1.20.1.
- Discriminación entre imágenes sanas y fisuradas: en el split de test, 0 de 100 imágenes sanas generaron al menos una detección al umbral 0,5, y 104 de 112 imágenes fisuradas fueron detectadas.
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades multilingües, al no ser un modelo de lenguaje.
- No dispone de modo "thinking", visión general, audio ni otras capacidades propias de modelos fundacionales multimodales.

## Casos de uso

- Inspección estructural de carreteras: el modelo puede procesar imágenes de pavimento y segmentar fisuras para cuantificar su extensión y orientación, integrándose en flujos de mantenimiento vial con la salida de máscaras ONNX.
- Monitorización de muros de hormigón: dado que el entrenamiento incluye un 80 % de imágenes de muros en SDNET2018, es adecuado para detectar fisuras en muros de contención y fachadas de obra civil.
- Pre-filtrado en pipelines de inspección con drones: al ser un modelo ONNX ligero (0,1 GB), puede desplegarse en entornos con recursos limitados para descartar imágenes sanas (0/100 falsos positivos en test) antes de un análisis más profundo.
- Anotación asistida de datasets: las máscaras predichas pueden servir como pre-anotaciones para acelerar el etiquetado de nuevas imágenes de fisuras, reduciendo el coste manual en proyectos de visión artificial.
- Integración en aplicaciones Java mediante poly-nlp-java: la model card incluye una declaración YAML para registrar el modelo en el ecosistema poly-nlp-java, lo que facilita su uso en aplicaciones Java existentes.
- Control de calidad en obra: el modelo puede emplearse para verificar de forma automatizada la presencia de fisuras en superficies recién construidas, con la salvedad de que no ha sido evaluado en fachadas siniestradas.
- Investigación en segmentación de fisuras: sirve como baseline afinado sobre Crack-seg para comparar con otros detectores-segmentadores en tareas de inspección de hormigón.

## Benchmarks y rendimiento

Los únicos datos disponibles son las métricas del split de test (no visto en entrenamiento) reportadas en la model card:

| Metrica | mAP50 | mAP50-95 |
|---|---|---|
| Máscara | 0,4923 | 0,149 |
| Caja | 0,7482 | 0,5755 |

Además, a nivel de imagen y con umbral 0,5 usando el ONNX:

| Metrica | Valor |
|---|---|
| Imágenes sanas con al menos una detección | 0/100 |
| Imágenes fisuradas detectadas | 104/112 |

No se han publicado resultados comparativos con otros modelos (MMLU, HumanEval, GSM8K u otros) en la información disponible, al no tratarse de un modelo de lenguaje.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; el repositorio ocupa 0,1 GB y los pesos son ONNX float32, por lo que la huella en memoria es reducida y compatible con GPUs de gama baja.
- GPU recomendadas: no disponible. Por el tamaño del artefacto, es probable que funcione en GPUs consumer (RTX 3060, RTX 4090) y en CPU mediante ONNX Runtime, aunque no se confirma en la información proporcionada.
- ¿Cabe en GPU consumer? No se especifica, pero el tamaño del repositorio (0,1 GB) sugiere que sí; se recomienda verificar con la GPU concreta.
- Opciones de despliegue: ONNX Runtime (probado con la versión 1.20.1), e integración declarada en poly-nlp-java mediante configuración YAML. No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la documentación proporcionada. La model card no incluye comparativas con otros detectores-segmentadores de fisuras ni con variantes de RF-DETR. Por tanto, la comparativa se indica como no disponible.

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| rf-detr-seg-large-crack | no disponible | no aplica (visión, 504x504) | mAP50 máscara 0,4923; caja 0,7482 | Apache 2.0 | Hugging Face |
| Alternativas | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- El propio autor lo describe como "modelo de vigilancia" (veille) y no lo ha evaluado sobre fotografías de fachadas siniestradas; las métricas solo son válidas para el dominio de Crack-seg.
- El rendimiento en segmentación es moderado: mAP50-95 de máscara de 0,149, lo que indica máscaras poco precisas en términos de solapamiento estricto.
- Riesgo de falsos negativos: 8 de 112 imágenes fisuradas no fueron detectadas al umbral 0,5 en el test.
- Sesgo de dominio: el entrenamiento se centra en carreteras y muros de hormigón, con un 80 % de muros en las imágenes sanas de SDNET2018; el rendimiento en otros materiales o condiciones de iluminación no está caracterizado.
- No se especifican sesgos demográficos ni sociales, al no tratar personas ni texto.
- Licencia Apache 2.0: permite uso comercial, pero se debe conservar el aviso de licencia y las atribuciones correspondientes; las imágenes de SDNET2018 están bajo CC BY 4.0 y las de Crack-seg bajo PDM 1.0, lo que conviene verificar en la redistribución de datos.
- El contrato ONNX es fijo (entrada 504x504, float32, normalización ImageNet); cualquier cambio de resolución o preprocesado requiere reexportar o adaptar el pipeline.
- No hay información sobre cuantización, por lo que el despliegue en entornos de muy bajos recursos debe validarse empíricamente.

## Enlaces

- Hugging Face: https://huggingface.co/samOTOFA/rf-detr-seg-large-crack
- Dataset Crack-seg en Roboflow Universe: https://universe.roboflow.com/university-bswxt/crack-bphdr
- SDNET2018 (referencia): https://doi.org/10.15142/T3TD19
- RF-DETR de Roboflow (modelo base): no disponible en la información proporcionada
- Repositorio poly-nlp-java: no disponible en la información proporcionada
