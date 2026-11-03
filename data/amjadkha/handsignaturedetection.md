# AmjadKha/HandSignatureDetection

## Resumen

HandSignatureDetection es un modelo de clasificación binaria de imágenes desarrollado por Amjad Khaliliah (usuario AmjadKha en HuggingFace) que distingue firmas manuscritas de contenido no correspondiente a firmas en documentos escaneados. El modelo se construye sobre la arquitectura MobileNetV3-Small, partiendo del checkpoint `qualcomm/MobileNet-v3-Small`, y se distribuye en formato ONNX. Su propósito es servir como filtro previo en pipelines de procesamiento inteligente de documentos (IDP), reduciendo falsos positivos antes de etapas posteriores de detección o verificación de firmas.

El modelo resuelve un problema acotado pero recurrente en digitalización documental: separar regiones que contienen firmas manuscritas de texto impreso, fechas, números u otros elementos visuales. Está pensado para entornos con recursos limitados, dado el reducido coste computacional de MobileNetV3-Small, y declara soporte para documentos en inglés y árabe.

La información pública disponible es muy escasa: el repositorio no contiene pesos visibles (tamaño de 0.0 GB), no se han publicado métricas de evaluación reales y la model card incluye un placeholder sin sustituir en el ejemplo de uso. La ficha refleja estos vacíos de forma explícita.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MobileNetV3-Small (CNN, clasificación de imágenes) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión, entrada RGB) |
| Tipos de cuantizacion | no disponible (distribución en ONNX) |
| Idiomas soportados | inglés y árabe (según documentos de entrenamiento) |
| Licencia | Apache License 2.0 (según model card; el campo de licencia en HuggingFace figura como no disponible) |
| Formato de pesos | ONNX (tag del repositorio); no se observan safetensors ni GGUF |

## Arquitectura y entrenamiento

El modelo emplea MobileNetV3-Small, una red convolucional ligera diseñada para inferencia eficiente en dispositivos con recursos limitados. La tarea es clasificación binaria de imágenes RGB en dos clases: `SIGNATURE` y `NOT_SIGNATURE`. El checkpoint base es `qualcomm/MobileNet-v3-Small`, sobre el que se ha realizado un ajuste fino para la tarea específica.

El entrenamiento utiliza el dataset `AmjadKha/HandWrittenSigntureDataset`, publicado por el mismo autor. La model card no especifica el número de imágenes, la composición del dataset, el número de épocas, la estrategia de aumento de datos ni si se aplicaron técnicas de regularización. Tampoco se documenta ningún proceso de RLHF, DPO ni innovación técnica adicional más allá del ajuste fino supervisado sobre la arquitectura base.

## Capacidades

- Clasificación binaria de imágenes en dos categorías: firma manuscrita (`SIGNATURE`) y contenido no firma (`NOT_SIGNATURE`).
- Procesamiento de imágenes RGB de documentos escaneados o fotografías de documentos.
- Discriminación entre firmas y elementos como texto impreso, fechas y números.
- Soporte declarado para documentos en inglés y árabe.
- Inferencia ligera apta para entornos de escritorio y recursos restringidos.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni generación de texto: es exclusivamente un clasificador de imágenes.
- No dispone de modo thinking, visión generativa, audio ni capacidades multimodales más allá de la clasificación visual.

## Casos de uso

- Filtrado previo en pipelines de IDP: el modelo se sitúa antes de un detector de firmas para descartar regiones candidatas que no contienen firma, reduciendo la carga sobre modelos más costosos.
- Procesamiento de documentación bancaria: clasificación de recortes de imágenes extraídos de formularios para identificar qué regiones corresponden a firmas antes de su revisión o verificación.
- Apertura de cuentas y onboarding de clientes: cribado automático de documentos firmados enviados por clientes, separando páginas o regiones con firma del resto del contenido.
- Filtrado de regiones de firma en PDF: integración en herramientas que extraen imágenes de PDF y necesitan decidir qué recortes contienen una firma manuscrita.
- Clasificación automática de documentos: uso como señal auxiliar para etiquetar documentos o páginas según la presencia de firmas manuscritas.
- Preprocesado para verificación de firmas: el modelo actúa como etapa de descarte (gatekeeper) que alimenta únicamente regiones con firma a un verificador biométrico posterior, reduciendo falsos positivos en el flujo completo.
- Procesamiento de documentos en árabe e inglés: clasificación en flujos documentales bilingües, dado el soporte declarado para ambos idiomas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card define las métricas de evaluación previstas (accuracy, precision, recall, F1-score) pero indica explícitamente que las puntuaciones reales deben añadirse tras evaluar sobre un conjunto de test separado. No se han publicado valores numéricos.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; por la arquitectura MobileNetV3-Small (unos pocos millones de parámetros) se espera un consumo muy reducido, del orden de cientos de MB o menos, aunque no se ha confirmado con datos publicados.
- GPU recomendadas: no disponible. La arquitectura es lo bastante ligera para ejecutarse en CPU y en GPUs de consumo, pero no se han publicado recomendaciones ni mediciones.
- Cabe en GPU de consumo: previsiblemente sí, dado el tamaño de MobileNetV3-Small, aunque no hay confirmación documentada.
- Opciones de despliegue: el repositorio se distribuye en formato ONNX, lo que permite inferencia con ONNX Runtime. La model card muestra un ejemplo con `transformers.pipeline("image-classification")`, lo que requiere pesos en formato compatible con Transformers; dado que el repositorio figura con 0.0 GB, la disponibilidad efectiva de pesos no está confirmada.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

No se dispone de datos de rendimiento publicados de este modelo, por lo que la comparativa numérica no es posible. A continuación se comparan características estructurales con alternativas genéricas de clasificación de imágenes ligeras.

| Modelo | Arquitectura | Tarea | Contexto/entrada | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| HandSignatureDetection | MobileNetV3-Small | Clasificación binaria firma/no firma | Imagen RGB | Apache 2.0 (según model card) | Repositorio sin pesos visibles (0.0 GB) |
| MobileNetV3-Small (base Qualcomm) | MobileNetV3-Small | Clasificación ImageNet | Imagen RGB | no disponible | Disponible en HuggingFace |
| ResNet-50 | CNN residual | Clasificación ImageNet | Imagen RGB | no disponible | Ampliamente disponible |
| ViT-base | Transformer de visión | Clasificación ImageNet | Imagen RGB | no disponible | Ampliamente disponible |

La comparativa con modelos específicos de detección o clasificación de firmas no está disponible en la información proporcionada.

## Limitaciones y advertencias

- La clasificación no establece la autenticidad legal de una firma; solo indica si el contenido parece una firma manuscrita.
- Nombres manuscritos e iniciales pueden parecerse a firmas y provocar clasificaciones erróneas hacia `SIGNATURE`.
- El rendimiento depende de la calidad de imagen, la resolución y la diversidad de los datos de entrenamiento, sin que se hayan publicado métricas que cuantifiquen esta dependencia.
- No se han publicado resultados de evaluación sobre un conjunto de test independiente; la model card lo señala como pendiente.
- El repositorio figura con un tamaño de 0.0 GB y el ejemplo de uso contiene un placeholder (`YOUR-MODEL-REPOSITORY`) sin sustituir, lo que sugiere que los pesos pueden no estar disponibles o la publicación está incompleta.
- El campo de licencia en HuggingFace figura como no disponible, aunque la model card declara Apache 2.0; conviene verificar la licencia efectiva antes de uso comercial.
- Para flujos de alta garantía debe combinarse con mecanismos de detección y verificación de firmas adicionales.
- No se documentan sesgos conocidos ni limitaciones específicas por idioma más allá del soporte declarado para inglés y árabe.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/AmjadKha/HandSignatureDetection
- Dataset de entrenamiento: https://huggingface.co/datasets/AmjadKha/HandWrittenSigntureDataset
- Modelo base: https://huggingface.co/qualcomm/MobileNet-v3-Small
- Perfil del autor: https://huggingface.co/AmjadKha
