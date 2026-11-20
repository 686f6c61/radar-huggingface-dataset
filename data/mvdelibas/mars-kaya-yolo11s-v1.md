# mvdelibas/mars-kaya-yolo11s-v1

## Resumen

Mars Kaya YOLO11s v1 es un detector de objetos de clase única especializado en rocas (boulders) en imágenes de la Mastcam del rover Curiosity en Marte. Lo desarrolla mvdelibas y se distribuye como un modelo experimental dentro del ecosistema Ultralytics, con la arquitectura YOLO11s como base. Su propósito es servir de referencia reproducible para investigación en visión por computador aplicada a exploración planetaria, no como componente crítico de navegación.

El modelo se entrena sobre el MSL Boulder Dataset (1.552 imágenes, aproximadamente 175.000 cajas anotadas entre todos los splits), derivado de máscaras de píxeles convertidas a cajas mediante componentes conexos. La tarea es concreta: localizar rocas en el terreno marciano a partir de imágenes de una cámara científica real, con condiciones de iluminación, resolución y textura muy distintas a las de los datasets terrestres habituales.

Es relevante ahora porque la detección automática de rocas y obstáculos en imágenes de rovers es una pieza clave en la planificación de trayectorias y en el análisis geológico asistido, y porque existen pocos modelos públicos entrenados específicamente con datos MSL. El autor lo publica explícitamente como experimental, con métricas moderadas, para facilitar comparaciones y servir de línea base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | YOLO11s (Ultralytics), detector de objetos de una etapa |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión, no de lenguaje) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (etiquetas y documentación) |
| Licencia | cc-by-4.0 (pesos); la arquitectura y el código de entrenamiento son AGPL-3.0 de Ultralytics |
| Formato de pesos | .pt (PyTorch, Ultralytics) |

## Arquitectura y entrenamiento

Se trata de un detector YOLO11s, la variante small de la familia YOLO11 de Ultralytics: un transformer/CNN híbrido de una etapa que predice cajas y clases directamente en una sola pasada, sin etapa de propuestas regionales. El modelo se entrena durante 60 épocas a resolución de 1024 píxeles con batch de 8, sobre el dataset `mvdelibas/mars-kaya-msl-boulder-v1`.

Los datos provienen del MSL Boulder Dataset (Zenodo, doi:10.5281/zenodo.21313774, Durai y Doran, CC BY 4.0), con imágenes de NASA/JPL-Caltech/MSSS. Las anotaciones originales son máscaras de píxeles que se convierten a cajas delimitadoras mediante componentes conexos, lo que introduce un desajuste entre la caja y el contorno real de la roca. No se documenta uso de RLHF, DPO ni aumentación de datos específica más allá del pipeline estándar de Ultralytics.

## Capacidades

- Detección de objetos de clase única: localiza rocas (boulders) en imágenes Mastcam de Curiosity.
- Salida de cajas delimitadoras con coordenadas (`xyxy`) y puntuaciones de confianza.
- Inferencia a resolución de 1024 píxeles, adecuada para imágenes de cámara científica de alta resolución.
- Entrenado sobre imágenes reales de Marte, con dominio visual distinto al de datasets terrestres.
- No soporta tool calling, agentes, razonamiento multi-step ni generación de texto.
- No tiene capacidades multilingües más allá de las etiquetas en inglés.

## Casos de uso

- Línea base para investigación en detección de rocas marcianas: sirve como referencia reproducible para comparar nuevas arquitecturas o estrategias de anotación sobre el MSL Boulder Dataset.
- Análisis geológico asistido: contar y localizar rocas en imágenes Mastcam para caracterizar la densidad y distribución de boulders en una zona de estudio.
- Preetiquetado de datasets: usar las detecciones como propuesta inicial para acelerar la anotación manual de nuevas imágenes MSL.
- Estudio de robustez de dominio: evaluar cómo se comporta un detector YOLO entrenado en Marte frente a imágenes terrestres o de otros rovers, como análisis de transferencia.
- Docencia y divulgación: ejemplo práctico de pipeline Ultralytics aplicado a datos planetarios reales, con métricas y limitaciones documentadas.
- Comparación de estrategias de anotación: medir el impacto de cajas derivadas de máscaras frente a cajas dibujadas manualmente en la calidad final del detector.

## Benchmarks y rendimiento

Resultados publicados por el autor en el split de validación (una sola ejecución):

| Metrica | Valor |
|---|---|
| mAP50 | 0.492 |
| mAP50-95 | 0.319 |
| Precision | 0.499 |
| Recall | 0.540 |

No se han publicado comparaciones con otros modelos en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; YOLO11s a 1024 px requiere típicamente una GPU con al menos 4-6 GB de VRAM, aunque el dato no está confirmado por el autor.
- GPU recomendadas: no disponible; por tamaño del modelo, una RTX 3060/4090 o superiores serían suficientes para inferencia.
- Cabe en GPU de consumo: probablemente sí, dado que es la variante small de YOLO11, pero no hay confirmación en la información proporcionada.
- Opciones de despliegue: Ultralytics (PyTorch), exportación a ONNX/TensorRT mediante las herramientas de Ultralytics; no se documentan otras.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye comparaciones con otros detectores de rocas marcianas ni con variantes YOLO11 de distinto tamaño.

## Limitaciones y advertencias

- Modelo marcado como experimental por el propio autor: calidad moderada, compartido para investigación y comparación.
- Las imágenes contienen muchas rocas pequeñas y en contacto; las cajas derivadas de máscaras solo siguen aproximadamente el contorno de la roca, lo que reduce la métrica medida.
- No apto para seguridad del rover ni planificación de trayectorias por sí solo.
- Licencia de los pesos CC BY 4.0, pero la arquitectura y el código de entrenamiento son AGPL-3.0 de Ultralytics; hay que revisar esa licencia para uso comercial.
- Los propietarios de los datos (NASA/JPL-Caltech/MSSS) no respaldan este modelo.
- Riesgo de alucinación/falsos positivos inherente a un detector con precision y recall en torno a 0.5.
- Dominio restringido a imágenes Mastcam de Curiosity; no se garantiza su comportamiento en otras cámaras o rovers.
- Solo etiquetas en inglés y una única clase.

## Enlaces

- Hugging Face: https://huggingface.co/mvdelibas/mars-kaya-yolo11s-v1
- Dataset de entrenamiento: `mvdelibas/mars-kaya-msl-boulder-v1` (referenciado en la model card)
- MSL Boulder Dataset (Zenodo): https://doi.org/10.5281/zenodo.21313774
- Ultralytics (arquitectura y código): https://github.com/ultralytics/ultralytics
