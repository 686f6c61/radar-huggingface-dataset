# Dongju-00/pawprint-dog-tagger

## Resumen

Pawprint Dog Tagger es un clasificador de imágenes de un solo etiquetado, desarrollado por el usuario Dongju-00 en el contexto de un hackatón (equipo 5), cuyo objetivo es organizar automáticamente fotos de perros domésticos según la situación que representan. El modelo parte de la arquitectura `efficientnet_b2` de la librería `timm` y se ha afinado para predecir una de siete clases: `costume`, `playing`, `sleeping`, `snow`, `water`, `with_friends` y `with_owner`. En el servicio original se añade una octava etiqueta, `etc`, que no es una clase aprendida sino una regla de descarte aplicada tras la inferencia cuando la probabilidad máxima del softmax cae por debajo de 0,35.

Se trata de un modelo de visión muy pequeño y ligero (pesos en un único `dog_model.pt`, repo de 0,0 GB), pensado para ejecutarse en CPU o GPU modesta y para integrarse en un pipeline de clasificación de imágenes, no en un pipeline de `transformers`. No incluye configuración para `transformers.pipeline()`, sino un `state_dict` de PyTorch con metadatos (`arch`, `img_size`, `classes`, `val_acc`) que hay que cargar manualmente con `timm.create_model`.

Su relevancia es limitada y muy acotada: no es un modelo de propósito general ni compite con clasificadores de imágenes de gran escala. Es un artefacto de demostración de un hackatón, con documentación honesta sobre sus limitaciones, sin datos verificables de composición del dataset, sin benchmarks publicados y sin licencia declarada, lo que impide recomendar su uso comercial. Resulta útil como referencia de cómo empaquetar un clasificador `timm` con preprocesado y umbral de confianza, y como ejemplo de model card que explicita lo que no se sabe.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | EfficientNet-B2 (`efficientnet_b2`, vía `timm`) |
| Parámetros totales | no disponible (EfficientNet-B2 tiene aproximadamente 9,1 M de parámetros según la implementación de `timm`; el autor no lo indica) |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión; entrada RGB de 224 × 224 píxeles) |
| Tipos de cuantización | no disponible (solo se distribuye el checkpoint en punto flotante PyTorch) |
| Idiomas soportados | `ko` (coreano), según los metadatos del repositorio; el modelo no procesa texto, la etiqueta se refiere al idioma de la documentación y del servicio |
| Licencia | no disponible (el autor declara explícitamente que no se conoce la licencia de los pesos ni de los datos de entrenamiento) |
| Formato de pesos | checkpoint PyTorch (`.pt`) con `state_dict` y metadatos (`arch`, `img_size`, `classes`, `val_acc`) |

## Arquitectura y entrenamiento

La arquitectura es una CNN EfficientNet-B2 con la cabeza de clasificación reconfigurada a 7 salidas. El checkpoint almacena la cadena de arquitectura, el tamaño de imagen (`224`), la lista ordenada de clases y un campo `val_acc` con valor `0,8699654775604143` (aproximadamente 87,00 %). La entrada se preprocesa redimensionando el lado corto a `int(224 × 1,14) = 255` píxeles manteniendo la relación de aspecto, recortando el centro a 224 × 224, convirtiendo a tensor en `[0, 1]` y normalizando con media `[0,485, 0,456, 0,406]` y desviación `[0,229, 0,224, 0,225]` de ImageNet.

No se dispone de información sobre el volumen de datos de entrenamiento, la procedencia del dataset, el procedimiento de etiquetado, el origen de los pesos preentrenados, los hiperparámetros de ajuste fino ni el código que calculó `val_acc`. El autor advierte que ese 87 % es un valor almacenado en los metadatos y no una evaluación reproducida durante la redacción de la model card, por lo que no debe interpretarse como precisión sobre un test independiente ni como rendimiento en producción. Tampoco hay datos de precisión, exhaustividad o F1 por clase, ni de latencia de inferencia. No se documenta ningún uso de RLHF, DPO ni técnicas de alineación, algo esperable en un clasificador de imágenes.

## Capacidades

- Clasificación de imágenes RGB de perros en una de siete categorías de situación: `costume`, `playing`, `sleeping`, `snow`, `water`, `with_friends`, `with_owner`.
- Salida de una única etiqueta por imagen (clasificación multiclase excluyente), devuelta como lista de un elemento, por ejemplo `["playing"]`.
- Aplicación de una etiqueta de descarte `etc` cuando la probabilidad softmax máxima es inferior a 0,35 o la clase predicha no está en la lista permitida.
- Exposición de la probabilidad de la clase superior (`top_class_probability`) para umbralizar o auditar decisiones.
- Ejecución en CPU o CUDA; el autor verificó el ejemplo en CPU con Python 3.12.10, PyTorch 2.13.0, torchvision 0.28.0, timm 1.0.28, Pillow 12.3.0 y huggingface_hub 1.28.0.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, texto, audio ni modo de pensamiento.
- No realiza detección de objetos, segmentación, identificación de individuos ni reconocimiento de raza.
- Capacidad multilingüe no aplicable: el modelo no procesa lenguaje; la etiqueta `ko` de los metadatos refleja el idioma de la documentación y del servicio.

## Casos de uso

- Organización automática de fototecas de mascotas: clasificar lotes de fotos en carpetas por situación (`playing`, `sleeping`, `snow`, etc.) para facilitar la búsqueda y la curación manual posterior, aprovechando que el modelo es ligero y puede ejecutarse en CPU sobre miles de imágenes.
- Etiquetado asistido en aplicaciones de álbumes de fotos: generar una etiqueta sugerida por imagen y dejar que el usuario la confirme o corrija, usando `top_class_probability` para ordenar las sugerencias por confianza y priorizar la revisión de las más dudosas.
- Filtrado previo en pipelines de generación de contenido: seleccionar fotos de perros en situaciones concretas (por ejemplo, `snow` o `water`) para campañas estacionales o publicaciones temáticas, con revisión humana obligatoria por la ausencia de detección de perros.
- Moderación y control de calidad de datasets internos: usar el clasificador como heurística barata para detectar imágenes mal etiquetadas o fuera de distribución antes de un etiquetado manual más costoso, aceptando que las imágenes sin perro pueden recibir una clase con alta probabilidad.
- Prototipado rápido en hackatones y pruebas de concepto: servir de base para demostrar un flujo completo de descarga de pesos, preprocesado, inferencia y umbralización con `timm` y `huggingface_hub`, reutilizable para otras taxonomías de imágenes.
- Evaluación comparativa de etiquetadores: el script `eval_frontier.py` del repositorio de servicio permite contrastar las etiquetas de este modelo con las de modelos externos; útil para medir concordancia entre clasificadores, siempre que se distinga de la precisión frente a verdad humana.
- Docencia y ejemplos de model cards rigurosas: el propio repositorio sirve como caso de estudio de documentación que declara explícitamente los datos ausentes (licencia, dataset, métricas por clase, calibración del umbral).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El único dato numérico es el campo `val_acc` del checkpoint, con valor `0,8699654775604143` (aproximadamente 87,00 %), que el autor advierte que no ha sido reproducido ni validado de forma independiente y cuya metodología de cálculo se desconoce. No hay resultados de MMLU, HumanEval, GSM8K ni de métricas de visión como precisión por clase, F1, mAP o latencia.

## Requisitos de hardware

- VRAM estimada para inferencia: muy baja; EfficientNet-B2 con 7 clases ocupa del orden de decenas de megabytes en punto flotante de 32 bits. No se publica una cifra oficial, pero cabe holgadamente en cualquier GPU consumer con 4 GB o más y en CPU.
- GPU recomendadas: no se especifican; por tamaño, cualquier GPU consumer moderna (RTX 3060, RTX 4060, RTX 4090) es sobredimensionada para este modelo. El autor verificó la ejecución en CPU.
- Cabe en GPU consumer: sí, en cualquier GPU consumer con memoria suficiente para el modelo y el lote; también en CPU, que es el entorno documentado en el ejemplo.
- Opciones de despliegue: no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI (no aplican a un clasificador de imágenes). El despliegue previsto es PyTorch con `timm` cargando el `state_dict`, o exportación manual a TorchScript u ONNX, no documentada por el autor.
- Latencia y throughput estimados: no disponibles. El autor no publica tiempos de inferencia ni métricas de rendimiento; solo confirma que el ejemplo se ejecutó correctamente en CPU con una foto de muestra.

## Comparativa con modelos similares

No se dispone de datos de benchmarks ni de especificaciones comparables publicadas por el autor, por lo que la comparación se limita a características estructurales.

| Modelo | Arquitectura | Clases | Entrada | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Pawprint Dog Tagger | EfficientNet-B2 (`timm`) | 7 (+ `etc` por regla) | 224 × 224 RGB | no disponible | HuggingFace, checkpoint `.pt` |
| EfficientNet-B0 genérico (`timm`) | EfficientNet-B0 | 1000 (ImageNet) | 224 × 224 RGB | según `timm` (habitualmente Apache-2.0 para el código; pesos con sus propios términos) | `timm`, ampliamente disponible |
| ResNet-50 (torchvision) | CNN residual | 1000 (ImageNet) | 224 × 224 RGB | BSD-3-Clause para el código; pesos con sus propios términos | torchvision, ampliamente disponible |
| CLIP ViT-B/32 (OpenAI) | Transformer visión-lenguaje | zero-shot | 224 × 224 RGB + texto | MIT para el código; pesos con sus propios términos | HuggingFace, ampliamente disponible |

La comparación de rendimiento con estas alternativas no es posible con la información disponible: no hay métricas del Pawprint Dog Tagger sobre un test independiente ni evaluaciones cruzadas publicadas. La ventaja diferencial del modelo es su taxonomía específica de situaciones caninas; su desventaja es la ausencia de licencia clara y de validación reproducible.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados. Al no conocerse la composición del dataset de entrenamiento, no es posible evaluar sesgos por raza, entorno, iluminación o demografía de las personas que aparecen en las fotos.
- Riesgo de alucinación: el modelo no genera texto, pero sí puede asignar una de las siete clases con alta confianza a imágenes que no contienen ningún perro, ya que no hay una etapa de detección previa y la regla `etc` no garantiza filtrarlas.
- Clasificación excluyente: ante situaciones solapadas (por ejemplo, un perro con abrigo jugando en la nieve) solo devuelve una etiqueta; no hay multilabel.
- Recorte central: el preprocesado recorta el centro a 224 × 224, lo que puede eliminar al perro, a la persona o al juguete relevantes si están en los bordes de la imagen.
- `with_owner` es solo un nombre de etiqueta: no verifica ninguna relación de propiedad entre la persona y el perro.
- Umbral sin calibrar: el autor indica que no se ha verificado la calibración del softmax ni la idoneidad del umbral 0,35; debe validarse y ajustarse sobre la distribución real de fotos de producción.
- Métricas no verificadas: el `val_acc` de aproximadamente 87,00 % procede de metadatos del checkpoint, sin código de cálculo, sin partición documentada y sin evaluación independiente; no debe usarse como garantía de rendimiento.
- Idiomas: los metadatos declaran `ko`; el modelo no procesa texto, de modo que la etiqueta afecta solo a la documentación y al servicio, no a una capacidad multilingüe.
- Restricciones de licencia: la licencia de los pesos y de los datos de entrenamiento no está disponible y el autor no concede permiso de uso comercial; no debe desplegarse en producción comercial sin aclarar antes los términos.
- Estado del repositorio: 0 descargas y 0 likes en el momento de la consulta, tamaño de 0,0 GB y `inference: false` en los metadatos; el código de servicio en GitHub puede requerir permisos de acceso.
- Fecha de creación y actualización futuras (2026) en los metadatos del repositorio, lo que conviene verificar antes de citar el modelo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Dongju-00/pawprint-dog-tagger
- Pesos (`dog_model.pt`): https://huggingface.co/Dongju-00/pawprint-dog-tagger/blob/main/dog_model.pt
- Repositorio de servicio (acceso posiblemente restringido): https://github.com/Dongju-00/ai-hackerton-team5-ai
- Librería `timm`: https://github.com/huggingface/pytorch-image-models
- Librería `huggingface_hub`: https://github.com/huggingface/huggingface_hub
- Paper de EfficientNet: https://arxiv.org/abs/1905.11946
