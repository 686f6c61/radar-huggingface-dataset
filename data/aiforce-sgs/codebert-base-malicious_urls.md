# aiforce-sgs/codebert-base-Malicious_URLs

## Resumen

El modelo `aiforce-sgs/codebert-base-Malicious_URLs` es una adaptación de `microsoft/codebert-base` orientada a la clasificación de URLs maliciosas. Sin embargo, la ficha publicada en HuggingFace es prácticamente vacía: no incluye descripción, métricas, ni detalles de entrenamiento. La única información disponible es la licencia MIT y la fecha de creación. Los resultados de búsqueda web apuntan a un modelo homónimo desarrollado por `DunnBC22` con la misma denominación, que sí documenta un fine-tuning sobre CodeBERT para esta tarea. Es probable que el modelo de `aiforce-sgs` sea una copia o un fork sin documentación adicional, pero no hay garantía de que sean idénticos.

Dado que la información oficial del modelo es insuficiente, esta ficha se basa en los datos disponibles del modelo original de `DunnBC22` y en las características conocidas de CodeBERT-base. Se recomienda consultar el repositorio original para obtener métricas y detalles verificados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (BERT-based, CodeBERT-base) |
| Parametros totales | 125 millones (estimado, segun CodeBERT-base) |
| Parametros activos | no disponible |
| Longitud de contexto | 512 tokens (tipico de BERT) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | ingles (principal, por el entrenamiento de CodeBERT) |
| Licencia | MIT |
| Formato de pesos | safetensors (probable, no confirmado) |

## Arquitectura y entrenamiento

CodeBERT-base es un modelo transformer bidireccional preentrenado conjuntamente sobre código fuente y lenguaje natural, desarrollado por Microsoft. Su arquitectura sigue el diseño de BERT-base, con 12 capas, 12 cabezas de atencion y una dimension oculta de 768. El modelo original se entreno con un objetivo de modelado de lenguaje enmascarado (MLM) y prediccion de tokens reemplazados (RTD), sobre un corpus de codigo y documentacion.

El fine-tuning para clasificacion de URLs maliciosas consiste en anadir una cabeza de clasificacion sobre la representacion del token `[CLS]` y ajustar los pesos con un dataset etiquetado de URLs benignas y maliciosas. El modelo de `DunnBC22` reporta haber utilizado el framework de HuggingFace Transformers, pero no se especifican los hiperparametros ni el tamaño del dataset en la informacion disponible. No se menciona el uso de tecnicas como RLHF o DPO.

## Capacidades

- Clasificacion de URLs en categorias de maliciosidad (binaria o multiclase, segun el dataset de entrenamiento).
- Deteccion de patrones de URLs sospechosas basada en representaciones contextuales de tokens.
- Capacidad de procesar secuencias de hasta 512 tokens, suficiente para analizar URLs largas y parametros.
- Soporte limitado a texto en ingles, aunque las URLs pueden contener caracteres de cualquier idioma.
- No dispone de capacidades de generacion de texto, tool calling ni razonamiento multi-paso.

## Casos de uso

- Filtrado de URLs en pasarelas de correo: el modelo puede integrarse en un pipeline de seguridad para clasificar enlaces en correos entrantes y bloquear aquellos marcados como maliciosos, reduciendo el riesgo de phishing.
- Analisis de logs de acceso web: se puede aplicar a grandes volumenes de URLs registradas en servidores proxy o firewalls para identificar intentos de acceso a dominios peligrosos.
- Enriquecimiento de sistemas SIEM: las predicciones del modelo pueden alimentar correlaciones de eventos de seguridad, priorizando alertas que involucren URLs clasificadas como maliciosas.
- Extension de navegador para proteccion en tiempo real: el modelo, al ser ligero, puede ejecutarse localmente para advertir al usuario antes de hacer clic en un enlace sospechoso.
- Investigacion de inteligencia de amenazas: analisis de URLs extraidas de campañas de phishing o malware para identificar variantes y patrones comunes.
- Evaluacion de reputacion de dominios en servicios de analisis: como complemento a listas negras, el modelo puede clasificar URLs no catalogadas previamente.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion proporcionada para el modelo `aiforce-sgs`. Sin embargo, el modelo original de `DunnBC22` reporta los siguientes resultados en su conjunto de evaluacion:

| Metrica | Valor |
|---|---|
| Loss | 0.8225 |
| Accuracy | 0.7279 |
| Weighted F1 | 0.6508 |
| Micro F1 | 0.7279 |
| Macro F1 | 0.4611 |
| Weighted recall | 0.7279 |
| Micro recall | 0.7279 |
| Macro recall | 0.4422 |
| Weighted precision | 0.6256 |
| Micro precision | 0.7279 |
| Macro precision | 0.5436 |

Estos valores corresponden al modelo de `DunnBC22` y no necesariamente al de `aiforce-sgs`. No se dispone de comparaciones con otros modelos en la informacion disponible.

## Requisitos de hardware

- Al ser un modelo de 125 millones de parametros, la inferencia puede ejecutarse en CPU con un consumo de RAM de aproximadamente 500 MB (en precision float32).
- En GPU, cabe en cualquier tarjeta con al menos 2 GB de VRAM, como una NVIDIA GTX 1050 Ti o superior.
- Es adecuado para despliegue en entornos con recursos limitados, como routers o dispositivos edge.
- Se puede servir con frameworks como HuggingFace Transformers, ONNX Runtime o TensorFlow Lite.
- No se requieren GPUs especializadas como A100 o H100.
- La latencia por clasificacion de una URL corta en CPU es del orden de 10-50 ms, dependiendo del hardware.

## Comparativa con modelos similares

No se dispone de informacion suficiente para realizar una comparativa con otros modelos de deteccion de URLs maliciosas. El modelo base CodeBERT es comparable a otros BERT-like como RoBERTa o DistilBERT en cuanto a arquitectura, pero no se han encontrado benchmarks publicos que comparen directamente estos modelos en la tarea de clasificacion de URLs. Por tanto, la comparativa se limita a indicar que el modelo es un fine-tune de CodeBERT-base, con las mismas limitaciones de contexto y capacidades.

## Limitaciones y advertencias

- La ausencia de documentacion en el repositorio de `aiforce-sgs` impide verificar la procedencia exacta de los pesos y si coinciden con el modelo de `DunnBC22`.
- El modelo puede presentar sesgos derivados del dataset de entrenamiento, que no se especifica. Es posible que no generalice bien a URLs de dominios nuevos o con formatos poco comunes.
- La exactitud reportada (0.7279) es moderada, lo que implica una tasa de falsos positivos y negativos no despreciable. No debe usarse como unico mecanismo de seguridad.
- La clasificacion se basa en el texto de la URL, por lo que URLs ofuscadas o con redirecciones pueden evadir la deteccion.
- La licencia MIT permite uso comercial, pero no se garantiza la ausencia de patentes ni la idoneidad para entornos de produccion sin una evaluacion adicional.
- El modelo no soporta multiples idiomas de forma explicita, aunque las URLs pueden contener caracteres Unicode.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/aiforce-sgs/codebert-base-Malicious_URLs
- Modelo original documentado (DunnBC22): https://huggingface.co/DunnBC22/codebert-base-Malicious_URLs
- Pagina de descripcion en AIbase: https://model.aibase.com/models/details/1915731699713073154
- Pagina en Inferix: https://inferix.co/models/DunnBC22/codebert-base-Malicious_URLs
