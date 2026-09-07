# koppolusameer/rfdetr-medium-basketball-playerexpanded-referee-detection

## Resumen

El modelo `koppolusameer/rfdetr-medium-basketball-playerexpanded-referee-detection` es un ajuste fino de `Roboflow/rf-detr-medium`, un modelo de detección de objetos en tiempo real basado en arquitectura transformer (DETR). El autor, `koppolusameer`, ha entrenado el modelo para identificar jugadores y árbitros en imágenes de baloncesto, incluyendo subclases de acciones específicas como dribling, tiro en suspensión, bandeja, pantalla y bloqueo de tiro. El modelo tiene 33.370.834 parámetros y está publicado con licencia Apache 2.0.

El modelo resuelve el problema de detección de personas y acciones en vídeo deportivo, un requisito habitual en sistemas de análisis de rendimiento, asistencia arbitral y generación automática de clips. Al tratarse de un modelo pequeño (33 millones de parámetros), puede ejecutarse en hardware de gama media, lo que lo hace interesante para aplicaciones en tiempo real. No se ha publicado información sobre el dataset de entrenamiento ni sobre la composición de los datos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de detección (RF-DETR medium, basado en DETR) |
| Parametros totales | 33.370.834 |
| Parametros activos | No aplicable (modelo denso) |
| Longitud de contexto | No aplicable (modelo de detección de objetos; sin ventana de contexto de texto) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un ajuste fino del modelo base `Roboflow/rf-detr-medium`, que pertenece a la familia RF-DETR. Se trata de un detector de objetos basado en transformer con decodificador DETR, optimizado para inferencia en tiempo real. El ajuste se realizó con la librería `transformers` y el entrenador de Hugging Face. Según la model card, los hiperparámetros usados fueron: tasa de aprendizaje de 0.0001, tamaño de lote de 16, optimizador AdamW con betas=(0.9, 0.999), programador de tasa de aprendizaje coseno y 50 épocas. El dataset de entrenamiento no se especifica en la documentación disponible. No se menciona ningún proceso de RLHF, DPO ni otra técnica de alineación; el entrenamiento es supervisado estándar para detección de objetos.

## Capacidades

- Detección de objetos en imágenes: identifica jugadores de baloncesto y árbitros.
- Detección de acciones específicas de jugadores: dribling, tiro en suspensión, bandeja, pantalla y bloqueo de tiro.
- Clases disponibles según las métricas publicadas: Player, Player-dribble, Player-jump-shot, Player-layup, Player-screen, Player-shot-block y Referee.
- No soporta generación de texto, tool calling, razonamiento multi-paso ni agentes.
- No es un modelo multilingüe; su entrada son imágenes, no texto.

## Casos de uso

- Análisis de vídeo de partidos de baloncesto: el modelo puede detectar y seguir jugadores y árbitros en cada fotograma, lo que permite generar estadísticas automáticas de presencia y movimiento.
- Detección de jugadas concretas: con las subclases de acciones, es posible identificar driblings, tiros en suspensión, bandejas, pantallas y bloqueos, facilitando la anotación automática de eventos en el partido.
- Asistencia arbitral: la detección fiable de árbitros (Map Referee de 0.7298) permite a sistemas de revisión de jugadas localizar al árbitro en el campo y seguir su posición durante decisiones polémicas.
- Generación automática de clips: un sistema de análisis deportivo puede usar el modelo para segmentar vídeo en momentos relevantes, como tiros o jugadas, y crear resúmenes automáticos.
- Análisis de rendimiento de jugadores: la frecuencia de acciones detectadas (por ejemplo, número de bloqueos o tiros) puede alimentar métricas de rendimiento individual o de equipo.
- Integración en sistemas de transmisión en vivo: el modelo puede ejecutarse en tiempo real para superponer resaltados o etiquetas sobre los jugadores detectados, mejorando la experiencia del espectador.

## Benchmarks y rendimiento

Los siguientes resultados son los declarados por el autor en la model card para el conjunto de evaluación. No se han publicado comparaciones con otros modelos en la información disponible.

| Metrica | Valor |
|---|---|
| Loss | 15.6833 |
| Map | 0.3744 |
| Map 50 | 0.5605 |
| Map 75 | 0.405 |
| Map Small | 0.5669 |
| Map Medium | 0.3747 |
| Map Large | 0.4978 |
| Mar 1 | 0.3974 |
| Mar 10 | 0.6699 |
| Mar 100 | 0.6974 |
| Mar Small | 0.65 |
| Mar Medium | 0.7003 |
| Mar Large | 0.7021 |
| Map Player | 0.6974 |
| Map Player-dribble | 0.2424 |
| Map Player-jump-shot | 0.5346 |
| Map Player-layup | 0.0732 |
| Map Player-screen | 0.0621 |
| Map Player-shot-block | 0.2811 |
| Map Referee | 0.7298 |

## Requisitos de hardware

- VRAM estimada para inferencia: un modelo de 33 millones de parámetros ocupa aproximadamente 0,5 GB en FP32 y unos 0,25 GB en FP16. No hay datos oficiales de VRAM en la documentación.
- GPU recomendadas: cualquier GPU moderna con al menos 1 GB de VRAM es suficiente, por ejemplo una RTX 3060 o superior. El modelo también puede ejecutarse en CPU para inferencia de imágenes individuales.
- Despliegue: compatible con la librería `transformers` de Hugging Face y con los Inference Endpoints de Hugging Face. Puede exportarse a ONNX para servidores propios.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No se dispone de información comparativa con otros modelos en los datos proporcionados. La model card no incluye resultados de modelos competidores ni referencias a alternativas de la misma categoría.

## Limitaciones y advertencias

- Las métricas para las clases Player-layup (Map 0.0732) y Player-screen (Map 0.0621) son muy bajas, lo que indica un rendimiento deficiente en la detección de estas acciones.
- El dataset de entrenamiento no está documentado, por lo que no se puede evaluar la generalización del modelo a otras ligas, cámaras o condiciones de iluminación.
- No se han publicado evaluaciones de sesgos ni de robustez.
- El modelo no tiene descargas ni interacciones registradas, por lo que no existe evidencia de uso en producción.
- La licencia Apache 2.0 permite uso comercial, pero el autor no garantiza resultados ni ofrece soporte técnico.

## Enlaces

- HuggingFace: https://huggingface.co/koppolusameer/rfdetr-medium-basketball-playerexpanded-referee-detection
- Modelo base: https://huggingface.co/Roboflow/rf-detr-medium
