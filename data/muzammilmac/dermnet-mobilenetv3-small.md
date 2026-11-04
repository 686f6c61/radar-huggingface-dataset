# Muzammilmac/dermnet-mobilenetv3-small

## Resumen

`Muzammilmac/dermnet-mobilenetv3-small` es un repositorio de HuggingFace que documenta la configuración de entrenamiento de un clasificador de imágenes dermatológicas basado en MobileNetV3-Small, con 23 clases de condiciones cutáneas comunes y entrenado sobre el dataset DermNet. El autor es el usuario Muzammilmac y el repositorio se creó el 4 de noviembre de 2026. Es importante señalar que, según la propia model card, el modelo **no está entrenado**: no se concedió presupuesto de cómputo durante la sesión de generación y los pesos no están publicados en el repositorio.

El interés técnico del artefacto reside en la receta de entrenamiento reproducible que acompaña al repositorio: backbone `mobilenetv3_small_100` de timm (2,5 M de parámetros, preentrenado en ImageNet), entrada de 224×224, entropía cruzada ponderada por clase para mitigar el desbalanceo (entre ~100 y ~2.300 imágenes por clase) y evaluación mediante top-1 accuracy sobre el split de test oficial más un 10 % estratificado de validación extraído del train. El dataset referenciado, `exper1ment/dermnet`, contiene 15.588 imágenes de entrenamiento y 3.977 de test.

Se trata, por tanto, de un recurso útil como plantilla de fine-tuning para clasificación dermatológica en dispositivos móviles, no de un modelo listo para inferencia. Cualquier evaluación de sus capacidades reales queda bloqueada hasta que el autor publique los pesos.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | CNN (MobileNetV3-Small, `mobilenetv3_small_100` de timm) |
| Parámetros totales | 2,5 M (backbone preentrenado en ImageNet) |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión, entrada 224×224 píxeles) |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no aplica (clasificador de imágenes) |
| Licencia | no disponible |
| Formato de pesos | no disponible (los pesos no están publicados) |

## Arquitectura y entrenamiento

La arquitectura es una CNN MobileNetV3-Small en su variante `_100` de timm, con 2,5 M de parámetros y pesos iniciales de ImageNet (`ra_in1k`). La entrada es de 224×224 píxeles, tomada de la `pretrained_cfg` del propio modelo. El entrenamiento previsto usa entropía cruzada ponderada por clase para compensar el fuerte desbalanceo del dataset (de ~100 a ~2.300 imágenes por clase), 8 épocas con batch 64 y un tiempo estimado de 30 a 60 minutos en cualquier GPU con al menos 8 GB de VRAM. El script `train_dermnet_mobilenetv3.py` con la opción `--push` sube pesos y `results.json` al repositorio; sin ella, los checkpoints quedan en `./checkpoints/`.

El dataset de entrenamiento es `exper1ment/dermnet`: 15.588 imágenes clínicas de entrenamiento y 3.977 de test, distribuidas en 23 condiciones (acné y rosácea, dermatitis atópica, eccema, psoriasis, tiña, verrugas, vasculitis, entre otras). No se documenta ningún proceso de RLHF, DPO ni aumento de datos más allá del redimensionado a 224×224. La innovación técnica es limitada por diseño: se prioriza la eficiencia en dispositivos móviles frente a la precisión máxima.

## Capacidades

- Clasificación de imágenes dermatológicas en 23 categorías de condiciones cutáneas comunes (no entrenado todavía; capacidades previstas).
- Inferencia ligera orientada a dispositivos móviles y entornos con recursos limitados, gracias a los 2,5 M de parámetros del backbone.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No tiene capacidades multilingües ni de generación de texto.
- No dispone de modo thinking, visión general, audio ni otras capacidades multimodales más allá de la clasificación de imagen.

## Casos de uso

- **Triaje preliminar en aplicaciones móviles de salud:** el clasificador podría integrarse en una app que, a partir de una foto tomada con el teléfono, devuelva una categoría probable entre 23 condiciones y derive al usuario a un dermatólogo. El tamaño reducido del modelo (2,5 M de parámetros) permite ejecución on-device sin conexión.
- **Preclasificación en pipelines de telemedicina:** las imágenes enviadas por pacientes podrían etiquetarse automáticamente antes de llegar al especialista, priorizando casos por categoría (por ejemplo, derivar antes las sospechas de psoriasis o vasculitis) y reduciendo el tiempo de revisión manual.
- **Herramienta educativa para estudiantes de dermatología:** un clasificador con 23 clases y una matriz de confusión documentada sirve para ilustrar las dificultades de distinguir grupos morfológicamente similares (eccema frente a dermatitis atópica) y para practicar la lectura de resultados probabilísticos.
- **Filtrado y organización de datasets clínicos:** el modelo puede usarse para etiquetar de forma preliminar grandes volúmenes de imágenes de archivos hospitalarios y facilitar la búsqueda por condición, siempre con revisión humana posterior.
- **Prototipado rápido de investigación:** la receta de entrenamiento (script, dataset, hiperparámetros y métricas) permite a un equipo reproducir el experimento en menos de una hora en una GPU de 8 GB y usarlo como línea base para comparar con arquitecturas mayores.
- **Sistemas de alerta en atención primaria:** integrado en el flujo de un centro de salud, podría señalar imágenes que requieran derivación urgente, actuando como segundo lector ante personal no especializado, con las advertencias de sesgo y precisión que se detallan más abajo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica que la métrica prevista es top-1 accuracy sobre el split de test oficial más un 10 % estratificado de validación, pero al no haberse entrenado el modelo no existen valores numéricos que reportar.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB para el backbone de 2,5 M de parámetros en FP32; no se dispone de cifras oficiales.
- GPU recomendadas para entrenamiento: cualquier GPU con al menos 8 GB de VRAM, según la propia model card (por ejemplo, RTX 3060, RTX 4060, RTX 4090, A100, H100).
- Cabe holgadamente en GPU de consumo: cualquier tarjeta con 8 GB o más es suficiente para el entrenamiento previsto en 30-60 minutos y 8 épocas con batch 64.
- Opciones de despliegue: no documentadas; al ser un modelo timm, podría exportarse a ONNX, TorchScript o TFLite para móvil, pero no se especifica en la información disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. No se han proporcionado datos de benchmarks ni comparaciones con otros clasificadores dermatológicos, y al no existir pesos entrenados no es posible establecer una comparación cuantitativa fiable.

## Limitaciones y advertencias

- **Modelo no entrenado:** los pesos no están publicados; el repositorio contiene únicamente la configuración y el script de entrenamiento. No es utilizable para inferencia en su estado actual.
- **Sesgo demográfico:** las imágenes de DermNet son fotografías clínicas y de biblioteca, mayoritariamente de tonos de piel claros. Un modelo entrenado solo con estos datos no generalizaría bien a cámaras de consumo ni a poblaciones con piel morena.
- **Etiquetas amplias y solapadas:** categorías como "Eczema Photos" agrupan varias enfermedades, por lo que es esperable confusión entre clases similares; la model card recomienda revisar la matriz de confusión y no solo la accuracy.
- **Riesgo de alucinación en el sentido clínico:** el modelo puede asignar una categoría con alta confianza a una imagen que no corresponde a ninguna de las 23 clases, sin mecanismo de rechazo documentado.
- **No es una herramienta diagnóstica:** la propia model card lo declara explícitamente; cualquier uso clínico requeriría validación regulatoria y supervisión médica.
- **Licencia no especificada:** no se indica licencia, lo que impide determinar si el uso comercial está permitido.
- **Idioma y contexto:** al ser un clasificador de imágenes, las limitaciones de idioma y contexto de texto no aplican, pero tampoco hay soporte para texto.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/Muzammilmac/dermnet-mobilenetv3-small
- Backbone en timm: https://huggingface.co/timm/mobilenetv3_small_100.ra_in1k
- Dataset DermNet: https://huggingface.co/datasets/exper1ment/dermnet
- Herramienta ML Intern: https://hf.co/chat?mode=ml-intern
