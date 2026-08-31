# dreamdifferent/vam-cross-level4-so101-widowx-texture-teleopaligned-videolora200-action-decoder-iter900

## Resumen

Este repositorio contiene el checkpoint del decoder World2Action del proyecto VAM-Cross, desarrollado por el usuario dreamdifferent. Se trata de un componente de un sistema de robótica basado en aprendizaje por imitación que convierte observaciones de video en comandos de acción para un brazo robótico WidowX SO-101. Concretamente, es la iteración 900 de un entrenamiento más largo (el run `w2a_so101_level4_widowx_texture_2cam_hstack_action_iter2374_videolora_iter200_widowx_teleop_recording_frame_v1`), que se detuvo por una causa no especificada. El modelo predice 15 acciones de efector final y pinza a 5 Hz a partir de dos cámaras (corner y front), utilizando una representación de pose relativa y rotación 6D. El tamaño del repositorio es de 1.0 GB, pero no se proporcionan detalles sobre la arquitectura interna, el número de parámetros ni la licencia. Es relevante para investigadores en manipulación robótica y control basado en video, ya que forma parte de un ecosistema más amplio de modelos VAM-Cross para diferentes brazos robóticos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | no disponible (repositorio de 1.0 GB) |

## Arquitectura y entrenamiento

El modelo es un decoder de acción dentro del framework VAM-Cross, que sigue un paradigma de video-to-action. Según la model card, requiere varios componentes congelados: un backbone Video2World (`dreamdifferent/widowx250-video-fused`), un decoder de acción inicial (`dreamdifferent/vam-cross-target-widowx250-native-2cam-action-decoder`) y un Video LoRA congelado (`dreamdifferent/vam-cross-level4-so101-widowx-texture-video-lora-iter-200`). El entrenamiento se realizó sobre un dataset de 151 episodios con 54 340 frames, con dos cámaras (`corner_cam` y `front_cam`). La salida son 15 acciones de efector final y pinza a 5 Hz, con pose relativa al pose logrado actual (`relative_to_current_achieved_pose`) en el marco `widowx_reference_base/teleop_aligned_tool`, y rotación en formato 6D. No se especifican detalles de la arquitectura interna del decoder (número de capas, tipo de atención, etc.) ni el proceso de entrenamiento (pérdidas, optimizador, épocas). El run se detuvo por `unknown`, lo que sugiere que el entrenamiento pudo no completarse según lo planeado.

## Capacidades

- Predicción de acciones de efector final y pinza a partir de observaciones de video de dos cámaras.
- Control robótico en bucle cerrado, según resultados reportados en un paper relacionado (dreamzero-so101) que indica errores de 0.57° RMSE en el frame canónico inicial y 1.6-2.3° en episodios de entrenamiento retenidos.
- Soporte de representación de rotación 6D para orientación del efector.
- Integración con el ecosistema VAM-Cross, que permite combinar diferentes backbones y LoRAs congelados.
- Diseñado específicamente para el brazo robótico WidowX SO-101, con teleoperación alineada.

## Casos de uso

- Aprendizaje por imitación para manipulación robótica: el modelo puede utilizarse para reproducir trayectorias demostradas por teleoperación, convirtiendo secuencias de video en comandos de acción.
- Control autónomo de brazo WidowX SO-101: dado un flujo de video de dos cámaras, el decoder genera acciones a 5 Hz, lo que permite operar el brazo en tareas de recogida y colocación, apilado o ensamblaje simple.
- Investigación en políticas de control basadas en video: sirve como componente de referencia para estudiar la transferencia de observaciones visuales a comandos motores.
- Evaluación de pipelines de video-to-action: al ser un checkpoint intermedio (iter 900), puede usarse para analizar la evolución del entrenamiento y comparar con iteraciones posteriores.
- Desarrollo de sistemas de demostración robótica: integrable en entornos de simulación o con el hardware real para validar algoritmos de control.
- Benchmarking de decoders de acción: junto con otros checkpoints de la serie VAM-Cross (level5, kuka-iiwa14), permite comparar el rendimiento entre diferentes configuraciones de brazo y niveles de entrenamiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks oficiales para este checkpoint concreto en la información disponible. Sin embargo, un paper relacionado del proyecto dreamzero-so101 (enlace en la sección de enlaces) reporta un RMSE de 0.57° en el frame canónico inicial y entre 1.6 y 2.3° en episodios de entrenamiento retenidos, lo que sugiere que el modelo es capaz de un control de precisión submilimétrica en el espacio de orientación. Estos datos deben tomarse con cautela, ya que no se confirma que correspondan exactamente a este checkpoint.

## Requisitos de hardware

No se dispone de información específica sobre requisitos de hardware. Dado que el repositorio ocupa 1.0 GB, es probable que el modelo pueda ejecutarse en GPUs de consumo como una RTX 3060 o superior, pero no hay datos confirmados sobre VRAM necesaria, latencia o throughput. Para despliegue, al ser un modelo de robótica, no se mencionan herramientas como vLLM u Ollama; el uso previsto es dentro del framework MimicVideo y el ecosistema VAM-Cross, probablemente con PyTorch y ROS.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables de otros desarrolladores. Dentro del mismo proyecto VAM-Cross existen otros checkpoints similares, como `dreamdifferent/vam-cross-level5-so101-widowx-texture-teleopaligned-videolora200-action-decoder-iter900` (nivel 5) y `dreamdifferent/vam-cross-level4-kuka-iiwa14-widowx-texture-teleopaligned-videolora200-action-decoder-iter900` (para el brazo KUKA IIWA 14). Estos comparten la misma estructura de decoder y pipeline, pero difieren en el nivel de entrenamiento y el brazo objetivo. No hay datos públicos que permitan comparar su rendimiento relativo.

## Limitaciones y advertencias

- Licencia no disponible: no se especifican términos de uso, lo que impide determinar si es apto para uso comercial o requiere atribución.
- Entrenamiento incompleto: el run se detuvo por `unknown`, por lo que el modelo puede no haber convergido completamente.
- Dependencia de componentes congelados: requiere el backbone Video2World, el decoder inicial y el Video LoRA específicos, que no se incluyen en este repositorio y deben obtenerse por separado.
- Específico para WidowX SO-101: no es directamente transferible a otros brazos sin reentrenamiento o adaptación.
- Sin información sobre sesgos o alucinaciones: al ser un modelo de control robótico, no aplican los riesgos típicos de los modelos de lenguaje, pero no se han documentado posibles fallos de seguridad en el control.
- Dataset no incluido: los datos de entrenamiento (151 episodios) no están disponibles en este repositorio, lo que limita la reproducibilidad.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/dreamdifferent/vam-cross-level4-so101-widowx-texture-teleopaligned-videolora200-action-decoder-iter900
- Checkpoint nivel 5 (variante): https://huggingface.co/dreamdifferent/vam-cross-level5-so101-widowx-texture-teleopaligned-videolora200-action-decoder-iter900
- Checkpoint KUKA IIWA 14 (variante): https://huggingface.co/dreamdifferent/vam-cross-level4-kuka-iiwa14-widowx-texture-teleopaligned-videolora200-action-decoder-iter900
- Paper relacionado (dreamzero-so101): https://github.com/Vizuara-AI-Lab/dreamzero-so101/blob/main/paper.html
