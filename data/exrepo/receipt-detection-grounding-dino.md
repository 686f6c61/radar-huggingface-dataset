# exrepo/receipt-detection-grounding-dino

## Resumen

Grounding DINO para tickets de compra (receipt-detection-grounding-dino) es un ajuste fino del modelo IDEA-Research/grounding-dino-base, publicado por el usuario exrepo, especializado en la deteccion zero-shot de tickets de compra en fotografias. El modelo parte de la arquitectura Grounding DINO, un detector abierto que combina un backbone de imagen con un encoder de texto para localizar objetos descritos mediante lenguaje natural, y ha sido reentrenado para que la frase "a receipt." funcione como prompt de deteccion fiable.

El ajuste se realizo sobre un conjunto muy reducido de 468 fotografias de tickets etiquetadas en el dataset billiegreen-v1, con el objetivo declarado de mejorar la localizacion del ticket frente al modelo base. Segun la model card, el resultado es un detector que encuentra el ticket en el 100 % de las imagenes de test con un IoU medio de 0,973, frente al 97,3 % de deteccion y 0,930 de IoU del modelo base.

Es relevante ahora porque demuestra un patron habitual en la practica: adaptar un modelo fundacional de deteccion abierta a un dominio concreto con muy pocos datos y coste computacional bajo, congelando los backbones y entrenando solo el decoder. El modelo tiene 232.315.264 parametros, un repositorio de 0,9 GB y se distribuye en formato safetensors para la libreria transformers.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Grounding DINO (detector abierto: backbone de imagen + encoder de texto + decoder de cajas) |
| Parametros totales | 232.315.264 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (modelo de vision, no de texto generativo) |
| Tipos de cuantizacion | no disponible (el repositorio solo contiene safetensors en el formato original) |
| Idiomas soportados | no disponible; el prompt de entrenamiento es la frase en ingles "a receipt." |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un ajuste fino de IDEA-Research/grounding-dino-base, un detector de objetos abierto que alinea regiones de imagen con descripciones textuales. En este ajuste se congelaron tanto el backbone de texto como el backbone de imagen, y se entreno unicamente el decoder, con la perdida calculada solo sobre las capas del decoder (excluyendo las propuestas del encoder). El entrenamiento duro 20 epocas con optimizador AdamW y learning rate 2e-5.

Los datos de entrenamiento consisten en 468 fotografias de tickets del dataset billiegreen-v1, con etiquetas en exrepo/receipt_detection (billiegreen-v1/labels.json). Se uso una unica frase de prompt, "a receipt.", y las imagenes sin ticket se incluyeron con objetivo vacio. La aumentacion incluye recortes con y sin ticket, rotaciones en pasos de 90 grados y espejado, rotacion libre de hasta mas o menos 30 grados, y perturbaciones de color, desenfoque, compresion JPEG y ruido. El pipeline de entrenamiento y evaluacion esta en el repositorio bite, en training/detection/ (train.py, evaluate.py, SPEC.md), y los ajustes y la perdida por epoca en train_meta.json.

## Capacidades

- Deteccion zero-shot de tickets de compra en imagenes mediante la frase "a receipt.".
- Localizacion de la caja delimitadora del ticket con puntuacion de confianza asociada.
- Capacidad de devolver multiples detecciones ordenadas por score, aunque el uso previsto es seleccionar la de mayor puntuacion.
- Manejo de imagenes sin ticket: el modelo puede no devolver detecciones cuando no hay objeto (se entreno con ejemplos negativos).
- Robustez ante rotaciones (hasta mas o menos 30 grados libres y pasos de 90 grados), cambios de color, desenfoque, ruido y compresion JPEG, segun la aumentacion aplicada.
- No es un modelo generativo: no produce texto, no soporta tool calling ni razonamiento multi-paso.
- Capacidad multilingue del prompt: no disponible; solo se valido la frase en ingles.

## Casos de uso

- Digitalizacion de tickets en aplicaciones de gastos: el modelo localiza el ticket en la foto para recortarlo antes de pasarlo a un OCR, lo que reduce errores de lectura en imagenes con fondo desordenado.
- Preprocesado en pipelines de contabilidad automatizada: se detecta la region del ticket y se recorta para alimentar un motor de extraccion de lineas y totales, mejorando la precision del OCR al eliminar el fondo.
- Escaneo movil en apps de finanzas personales: integrado en el flujo de captura, el modelo valida que la imagen contiene un ticket antes de subirla, evitando envios erroneos.
- Clasificacion y triaje de imagenes en lotes: en un sistema de gestion documental, el detector filtra que fotos contienen tickets y cuales no (entrenado con ejemplos negativos) antes de procesos costosos.
- Control de calidad en captura: comprobar que la caja detectada cubre una porcion razonable de la imagen para avisar al usuario de que repita la foto si el ticket esta cortado o demasiado lejos.
- Automatizacion de reembolsos: en un flujo de atencion al cliente, el modelo acompana a la extraccion de datos para verificar que el documento aportado es un ticket y localizar su region.

## Benchmarks y rendimiento

Resultados publicados en la model card, medidos sobre el holdout de 50 imagenes y el conjunto de test de 74 tickets mas 1 imagen sin ticket. La seleccion de caja sigue la logica de select_receipt con umbral 0,3; el IoU se calcula contra la caja etiquetada y un fallo de deteccion cuenta como 0.

| Modelo / variante | Holdout (50): encontrado | Holdout: IoU | Test: encontrado | Test: IoU | Test: IoU >= 0,5 | Test: falsos positivos |
|---|---|---|---|---|---|---|
| base (Grounding DINO original) | 100 % | 0,975 | 97,3 % | 0,930 | 94,6 % | 1 |
| este modelo (full) | 100 % | 0,989 | 100 % | 0,973 | 100 % | 0 |
| sin rotacion libre | 100 % | 0,989 | no disponible | 0,976 | no disponible | 0 |
| sin recortes sin ticket | 100 % | 0,989 | no disponible | 0,974 | no disponible | 1 |

La propia model card advierte que el conjunto de test es pequeno y que las diferencias de una sola imagen son atribuibles al azar.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita en la informacion proporcionada; con 232 millones de parametros en precision completa (fp32) el peso ronda los 0,9 GB, por lo que la inferencia cabe holgadamente en GPUs de consumo.
- GPU recomendadas: cualquier GPU con al menos 4-6 GB de VRAM deberia ser suficiente para inferencia en fp32 o fp16; no se han publicado mediciones oficiales.
- Cabe en GPU de consumo: si, practicamente cualquier GPU moderna de consumo (por ejemplo, gama RTX 30/40) por el tamano del modelo.
- Opciones de despliegue: transformers con AutoModelForZeroShotObjectDetection y AutoProcessor, tal como indica la model card; el tag endpoints_compatible sugiere compatibilidad con Inference Endpoints. No se documentan opciones para vLLM, llama.cpp, Ollama ni TGI (no aplicables a un detector de este tipo).
- Latencia y throughput: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Tarea | Contexto / prompt | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| exrepo/receipt-detection-grounding-dino | 232.315.264 | Deteccion zero-shot de tickets | Frase "a receipt." | no disponible | Hugging Face, 0 descargas |
| IDEA-Research/grounding-dino-base | no disponible en la informacion | Deteccion zero-shot generica | Frases libres en lenguaje natural | no disponible en la informacion | Hugging Face (modelo base) |
| Otros detectores especializados en documentos | no disponible | Deteccion de documentos/tickets | no disponible | no disponible | no disponible |

La comparacion directa disponible es con el modelo base, cuyos resultados se recogen en la tabla de benchmarks: este ajuste mejora la tasa de deteccion en test (100 % frente a 97,3 %), el IoU medio (0,973 frente a 0,930) y elimina el falso positivo observado en el modelo base.

## Limitaciones y advertencias

- Entrenado con una unica frase de prompt ("a receipt."); usar otras frases en la misma peticion altera las puntuaciones, segun advierte la model card.
- Requiere redimensionar la imagen a un lado mayor de 800 px, igual que en el entrenamiento, para un comportamiento consistente.
- Conjunto de entrenamiento muy pequeno (468 imagenes) y test reducido (74 tickets mas 1 negativa); las conclusiones sobre mejoras son estadisticamente fragiles.
- Licencia no disponible: no se puede confirmar el uso comercial ni las condiciones de redistribucion; conviene verificar la licencia del modelo base IDEA-Research/grounding-dino-base antes de produccion.
- Idiomas soportados no disponibles; el prompt validado esta en ingles, por lo que no hay garantia con prompts en castellano u otros idiomas.
- No es un modelo generativo ni un OCR: solo localiza la caja del ticket; la extraccion de texto requiere un modelo adicional.
- Riesgo de falsos positivos o cajas imprecisas en imagenes muy distintas al dominio de entrenamiento (tickets fotografiados en condiciones atipicas, otros documentos con formato similar).
- No se han publicado datos sobre sesgos; al ser un detector de objetos, el riesgo principal es de rendimiento desigual segun condiciones de captura mas que de sesgo linguistico.
- Sin descargas ni likes en el momento de la ficha: no hay evidencia de uso en produccion ni validacion por terceros.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/exrepo/receipt-detection-grounding-dino
- Modelo base: https://huggingface.co/IDEA-Research/grounding-dino-base
- Dataset de etiquetas: exrepo/receipt_detection (billiegreen-v1/labels.json), referenciado en la model card; URL no disponible en la informacion proporcionada.
- Repositorio de entrenamiento y evaluacion: bite, training/detection/ (train.py, evaluate.py, SPEC.md); URL no disponible en la informacion proporcionada.
- Paper de Grounding DINO: no disponible en la informacion proporcionada.
- Demo o espacio asociado: no disponible.
