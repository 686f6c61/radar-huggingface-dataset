# dreamdifferent/vam-cross-level4-kuka-iiwa14-widowx-texture-v2-teleopaligned-videolora200-action-decoder-iter900

## Resumen

El modelo es un checkpoint del decodificador World2Action dentro del framework VAM-Cross de MimicVideo. Lo desarrolla el usuario dreamdifferent, y su propósito es transformar observaciones visuales de robots (vídeo) en predicciones de acciones de control. Se trata de un componente de investigación para robótica, orientado a brazos WidowX y al dataset de teleoperación con dos cámaras. El checkpoint pertenece a la iteración 900 de un entrenamiento que se detuvo antes de completarse, por un motivo no especificado (`unknown`). Aunque el repositorio pesa 1,0 GB, no se publican detalles sobre arquitectura, número de parámetros ni longitud de contexto, por lo que la información disponible es parcial.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | No disponible (decodificador World2Action sobre backbone Video2World con adaptador LoRA) |
| Parámetros totales | No disponible |
| Longitud de contexto | No disponible |
| Tipos de cuantización | No disponible |
| Idiomas soportados | No disponible (no aplica: modelo de visión-acción) |
| Licencia | No disponible |
| Formato de pesos | No disponible |

## Arquitectura y entrenamiento

La arquitectura no se detalla en la documentación. Según la model card, el checkpoint es un decodificador de acciones (action decoder) que se acopla a un backbone Video2World preentrenado congelado (`dreamdifferent/widowx250-video-fused`) y a un adaptador Video LoRA congelado (`dreamdifferent/vam-cross-level4-kuka-iiwa14-widowx-texture-v2-video-lora-iter200`). El entrenamiento se realizó sobre el dataset `dreamdifferent/vam-cross-level4-kuka-iiwa14-widowx-texture`, que contiene 192 episodios y 54 749 fotogramas de dos cámaras (`corner_cam` y `front_cam`). El objetivo de salida son 15 acciones de posición del efector y del gripper a 5 Hz, expresadas en el sistema de coordenadas `widowx_reference_base/teleop_aligned_tool`, con rotación en formato 6D. No se especifica si se usó RLHF, DPO ni ninguna técnica de alineación posterior.

## Capacidades

- Predicción de acciones robóticas a partir de secuencias de vídeo capturadas con dos cámaras.
- Salida de coordenadas del efector final y del gripper (15 acciones por paso de inferencia).
- Representación de pose relativa con rotación en formato 6D.
- Integración con el ecosistema MimicVideo para el paso de world model a acción (World2Action).
- Soporte del pipeline de robótica de Hugging Face (pipeline: `robotics`).
- No soporta texto, tool calling, razonamiento simbólico ni capacidades de lenguaje; es un modelo de visión-acción específico.

## Casos de uso

- Teleoperación asistida: el decodificador puede convertir grabaciones de vídeo de teleoperación en comandos de movimiento y agarre del gripper a 5 Hz, utilizando las observaciones de `corner_cam` y `front_cam` para reconstruir la trayectoria del efector en el espacio `widowx_reference_base/teleop_aligned_tool`.
- Generación de políticas por imitación: a partir de demostraciones humanas registradas en el dataset de teleoperación, el modelo produce acciones de pose relativa que pueden usarse para entrenar un controlador en bucle cerrado para el brazo WidowX 250.
- Investigación en world models: al combinarse con el backbone Video2World congelado, permite cerrar el bucle entre predicción de vídeo y predicción de acciones, evaluando hipótesis sobre planificación y razonamiento espacial en robótica.
- Benchmarking de robots WidowX: el checkpoint está alineado con la configuración del brazo WidowX 250 y puede usarse como referencia para comparar estrategias de decodificación de acciones en tareas de manipulación.
- Simulación y transferencia: las predicciones de acciones pueden aplicarse a robots simulados que reproduzcan la configuración de cámaras y el marco de coordenadas del dataset, facilitando la transferencia de políticas a entornos virtuales.
- Anotación automática de datasets robóticos: el modelo puede ayudar a reetiquetar vídeos existentes con trayectorias de acciones, reduciendo el coste de anotación manual en nuevos conjuntos de datos de manipulación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas de éxito en tareas robóticas, ni tablas comparativas con otros modelos.

## Requisitos de hardware

- No se dispone de información sobre VRAM estimada, GPU recomendadas, latencia o throughput en la documentación publicada.
- El checkpoint se distribuye como un artefacto de entrenamiento dentro del framework MimicVideo, no como un modelo optimizado para inferencia con vLLM, llama.cpp, Ollama o TGI.
- No se indican requisitos específicos para consumidores con GPU domésticas; se requiere reproducir el entorno original de entrenamiento.

## Comparativa con modelos similares

No disponible. El checkpoint es un componente especializado de una línea de investigación concreta y no se identifican modelos alternativos de la misma categoría en la información consultada.

## Limitaciones y advertencias

- Checkpoint intermedio: la iteración 900 se seleccionó de un run detenido por `unknown`; no es un modelo final ni validado.
- Dependencias externas: requiere cargar un backbone inicial, un decoder inicial y un LoRA congelados que no se incluyen en el repositorio.
- Licencia no especificada: no se define si el uso comercial, académico o público está permitido.
- Sin benchmarks ni evaluaciones publicadas: no se aportan métricas de éxito en tareas robóticas.
- Dominio específico: solo se ha entrenado para el brazo WidowX 250 y el dataset de teleoperación con dos cámaras; no es transferible a otros robots sin reentrenamiento.
- Riesgo de predicciones incorrectas: el modelo puede generar acciones que no correspondan a la escena si la observación se aleja de la distribución del entrenamiento.

## Enlaces

- Repositorio del modelo: https://huggingface.co/dreamdifferent/vam-cross-level4-kuka-iiwa14-widowx-texture-v2-teleopaligned-videolora200-action-decoder-iter900
- Backbone Video2World inicial: https://huggingface.co/dreamdifferent/widowx250-video-fused
- Decoder de acciones inicial: https://huggingface.co/dreamdifferent/vam-cross-target-widowx250-native-2cam-action-decoder
- Video LoRA congelado: https://huggingface.co/dreamdifferent/vam-cross-level4-kuka-iiwa14-widowx-texture-v2-video-lora-iter200
- Dataset de entrenamiento: https://huggingface.co/datasets/dreamdifferent/vam-cross-level4-kuka-iiwa14-widowx-texture
- Commit de MimicVideo referenciado: `e3355dbc93132b576c02f920a59b4fc18a4f5906` (no disponible como URL pública en la documentación)
