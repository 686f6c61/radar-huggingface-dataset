# dreamdifferent/panda-robosuite-level5-wrist-ablation-v1-videolora200-action-decoder-iter1800

## Resumen

El modelo identificado como `dreamdifferent/panda-robosuite-level5-wrist-ablation-v1-videolora200-action-decoder-iter1800` es un decodificador de acciones (World2Action) perteneciente al proyecto VAM-Cross MimicVideo, publicado por el usuario `dreamdifferent`. No se trata de un modelo de lenguaje, sino de un componente de robótica: recibe como entrada observaciones visuales de dos cámaras y produce una secuencia de acciones de control para un brazo manipulador. Concretamente, el checkpoint corresponde a la iteración 1800 de una ejecución de entrenamiento cuya denominación interna es `w2a_panda_robosuite_level5_2cam_wrist_ablation_v1_action_iter2374_videolora_iter200_widowx_teleop_recording_frame_v1`.

El modelo resuelve el problema de convertir representaciones vídeo-mundo (Video2World) en comandos motores sobre el entorno de simulación RoboSuite, en la tarea denominada level5 con un robot Panda y dos cámaras (`corner_cam` y `wrist_cam`). El repositorio ocupa 1,0 GB y contiene únicamente el peso del decodificador seleccionado tras verificar el conjunto completo de checkpoints de modelo, optimizador, scheduler y trainer. La ejecución se detuvo por un motivo registrado como `unknown`.

Su relevancia es acotada y de investigación: se trata de un artefacto de ablación reproducible, con entradas congeladas fijadas por commit (backbone Video2World, decodificador de acción inicial y LoRA de vídeo), y no de un modelo listo para producción. No se dispone de licencia declarada, ni de idiomas, ni de resultados de benchmarks en la información proporcionada.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Decodificador de acciones World2Action sobre un backbone Video2World con LoRA de vídeo congelada; no se detalla la arquitectura interna (no disponible) |
| Parámetros totales | no disponible |
| Parámetros activos | no procede: no se indica que sea un modelo MoE |
| Longitud de contexto | no aplicable (modelo de acción, no de lenguaje); no disponible como ventana de tokens |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponibles (no es un modelo de lenguaje) |
| Licencia | no disponible |
| Formato de pesos | no disponible (el repositorio ocupa 1,0 GB e incluye un JSON fijado y un `config.yaml` efectivo) |

Datos del contrato de acción y datos:

| Parámetro | Valor |
|---|---|
| Dataset de entrenamiento | `dreamdifferent/vam-cross-level5-panda-robosuite-widowx-texture-corner-wrist` (commit `18d8be57a660329248e8800c28b61bc16b79e424`) |
| Episodios / fotogramas | 166 episodios / 54 264 fotogramas |
| Cámaras de entrada | `observation.images.corner_cam`, `observation.images.wrist_cam` |
| Salida | 15 acciones de efector final y pinza (`achieved-EE/gripper`) a 5 Hz |
| Objetivo de pose | `relative_to_current_achieved_pose` en `widowx_reference_base/teleop_aligned_tool` |
| Representación de rotación | `rotation_6d` |
| Iteración del checkpoint | 1800 |

## Arquitectura y entrenamiento

El modelo se describe como el decodificador World2Action del proyecto VAM-Cross MimicVideo. La construcción es modular y por etapas: parte de un backbone Video2World inicial (`dreamdifferent/widowx250-wrist-ablation-v1-video-fused`, commit `8e39d96344dea0a82ae673874a38206a6c412948`) y de un decodificador de acción inicial (`dreamdifferent/widowx250-wrist-ablation-v1-action-decoder-iter2374`, commit `0ea6db91672db019d9d6dc9a6c9bd1ecc0504001`), sobre los que se aplica una LoRA de vídeo congelada (`dreamdifferent/panda-robosuite-level5-wrist-ablation-v1-video-lora-iter200`, commit `2c9643d02c8aedfde187ba456a6d02a3ec3cb259`). El código de referencia es el commit `e3355dbc93132b576c02f920a59b4fc18a4f5906` de MimicVideo. No se especifican en la información disponible el número de capas, la dimensión oculta, el tipo de atención ni el número de tokens de vídeo empleados.

El entrenamiento se realizó sobre 166 episodios (54 264 fotogramas) de teleoperación en RoboSuite con el robot Panda y texturas de estilo WidowX. La supervisión es de imitación sobre acciones de efector final ya alcanzadas, expresadas de forma relativa a la pose actual y con rotación en representación 6D, a una frecuencia de control de 5 Hz. No se documenta en la información proporcionada el uso de RLHF, DPO ni ningún otro ajuste por preferencias, ni el número total de tokens o pasos de entrenamiento. La ejecución terminó con estado `unknown`, y el autor indica que se verificó el conjunto completo de checkpoints antes de seleccionar el peso publicado.

## Capacidades

- Predicción de acciones de manipulación robótica: genera 15 valores de acción de efector final y pinza a partir de observaciones visuales.
- Entrada visual multi-cámara: consume simultáneamente una vista de esquina (`corner_cam`) y una vista de muñeca (`wrist_cam`).
- Control a 5 Hz: el contrato de datos fija acciones a esa frecuencia, lo que condiciona el presupuesto de latencia de inferencia (200 ms por paso).
- Representación de pose relativa: trabaja con poses relativas a la pose alcanzada actual en el marco `widowx_reference_base/teleop_aligned_tool`.
- Rotación en 6D: emplea `rotation_6d` como formato de rotación, habitual en políticas de imitación por su continuidad.
- Condicionamiento por vídeo: la LoRA de vídeo congelada aporta la componente World2Action del pipeline.
- Generación de texto, razonamiento, código, matemáticas, visión general, audio: no aplicable, el modelo no es un modelo de lenguaje ni multimodal de propósito general.
- Tool calling / function calling: no disponible; no se documenta ninguna interfaz de este tipo.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no aplicable.
- Modo thinking: no aplicable.

## Casos de uso

- Investigación en políticas de imitación video-condicionadas: permite reproducir y auditar una ablación concreta (variante `wrist_ablation_v1`) fijando los commits de backbone, decodificador inicial y LoRA, lo que facilita comparaciones controladas entre iteraciones.
- Experimentos de ablación de cámara de muñeca: el nombre del checkpoint indica una ablación sobre la cámara de muñeca; sirve para medir la contribución de esa vista en la tarea level5 de RoboSuite.
- Evaluación de decodificadores de acción en simulación: al producir acciones EE/pinza a 5 Hz sobre RoboSuite, se puede integrar en bucles de evaluación estandarizados dentro del simulador.
- Generación de datos sintéticos de manipulación: ejecutando la política en el simulador se pueden recoger trayectorias adicionales para aumentar el dataset original de 166 episodios y 54 264 fotogramas.
- Punto de partida para nuevos ajustes: al depender de entradas congeladas versionadas por commit, es utilizable como inicialización de decodificador en experimentos posteriores del mismo pipeline MimicVideo.
- Estudio de representaciones de rotación y pose relativa: el uso de `rotation_6d` y de poses relativas a la alcanzada permite analizar estabilidad y deriva del control en tareas de precisión del level5.
- Comparación de arquitecturas World2Action: sirve como referencia interna frente a otros checkpoints de la misma familia del autor (por ejemplo, el decodificador `widowx250-wrist-ablation-v1-action-decoder-iter2374`).
- Reproducción de experimentos y depuración de pipelines: al incluir un JSON fijado y el `config.yaml` efectivo, permite reconstruir la configuración exacta de la iteración 1800.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas de éxito de tarea, error de pose, ni comparaciones cuantitativas con otras políticas. Tampoco se aportan tasas de acierto, distancias de error ni curvas de entrenamiento. Los resultados de la búsqueda web proporcionada no contienen información relacionada con este modelo.

## Requisitos de hardware

- VRAM para el checkpoint publicado: estimación mínima de 1-2 GB para cargar en memoria el peso de 1,0 GB del decodificador en precisión de 16 bits.
- VRAM para el pipeline completo: no disponible. La inferencia real requiere además el backbone Video2World y la LoRA de vídeo congelada, cuyos tamaños no se indican en la información disponible.
- GPU recomendadas: no disponible. No se especifica ninguna GPU objetivo ni en la model card ni en los resultados de búsqueda.
- Viabilidad en GPU de consumo: el checkpoint aislado (1,0 GB) cabe sin problema en GPUs de consumo; el pipeline completo no puede afirmarse sin conocer el tamaño del backbone.
- Latencia: requisito derivado del contrato de datos, la política debe producir acciones a 5 Hz, es decir, un paso de inferencia cada 200 ms. El rendimiento medido no está disponible.
- Throughput: no disponible.
- Opciones de despliegue: no se documentan. El modelo no es compatible con servidores de inferencia de lenguaje como vLLM, TGI, llama.cpp u Ollama; su ejecución depende del código de MimicVideo en el commit `e3355dbc93132b576c02f920a59b4fc18a4f5906`.
- Almacenamiento: el repositorio ocupa 1,0 GB, sin contar el dataset ni las entradas congeladas, que no se incluyen.

## Comparativa con modelos similares

No se dispone de datos comparativos de benchmarks ni de licencias para establecer una comparación rigurosa. La única comparación posible con la información proporcionada es genealógica, dentro de la propia familia de checkpoints del autor:

| Modelo | Rol en el pipeline | Parámetros | Contexto | Licencia |
|---|---|---|---|---|
| `panda-robosuite-level5-wrist-ablation-v1-videolora200-action-decoder-iter1800` | Decodificador de acción final (iteración 1800) | no disponible | no aplicable | no disponible |
| `widowx250-wrist-ablation-v1-action-decoder-iter2374` | Decodificador de acción inicial, entrada congelada | no disponible | no aplicable | no disponible |
| `widowx250-wrist-ablation-v1-video-fused` | Backbone Video2World inicial, entrada congelada | no disponible | no aplicable | no disponible |
| `panda-robosuite-level5-wrist-ablation-v1-video-lora-iter200` | LoRA de vídeo congelada | no disponible | no aplicable | no disponible |

No se conocen modelos alternativos de terceros comparables en la información disponible.

## Limitaciones y advertencias

- Licencia no declarada: al no indicarse licencia, no puede asumirse permiso de uso comercial ni de redistribución.
- Ejecución terminada con estado `unknown`: el autor indica que el run se detuvo por un motivo desconocido, lo que introduce incertidumbre sobre la estabilidad del entrenamiento y la calidad del checkpoint seleccionado.
- Dependencia estricta de versiones: el modelo exige commits concretos de MimicVideo y de tres artefactos congelados; cualquier desviación puede invalidar la reproducibilidad.
- Dataset y entradas congeladas no incluidos: el repositorio solo contiene el peso del decodificador, el JSON fijado y el `config.yaml`; el dataset de 166 episodios no se distribuye.
- Dominio muy restringido: entrenado para la tarea level5 de RoboSuite con robot Panda, dos cámaras concretas y texturas de estilo WidowX; no hay evidencia de generalización a otros robots, escenas o tareas.
- Volumen de datos reducido: 54 264 fotogramas de 166 episodios es un conjunto pequeño para una política de manipulación, lo que favorece el sobreajuste al entorno simulado.
- Dependencia de la pose alcanzada: el objetivo relativo a la pose actual implica que el modelo necesita el estado del simulador y no funciona como política puramente reactiva a imagen.
- Control limitado a 5 Hz: no apto para tareas que requieran control de alta frecuencia.
- Ausencia de benchmarks: no hay métricas publicadas de éxito de tarea, error de pose ni comparaciones con alternativas.
- Riesgo de alucinación: no aplicable en el sentido de generación de texto; el riesgo equivalente es la deriva acumulada y la predicción de acciones incoherentes fuera de la distribución de entrenamiento.
- Idiomas y sesgos sociales: no aplicable, el modelo no procesa lenguaje natural.
- Fecha de publicación registrada como 2026-09-13, con 0 descargas y 0 «likes», lo que indica ausencia de validación por parte de la comunidad.

## Enlaces

- Repositorio del modelo: https://huggingface.co/dreamdifferent/panda-robosuite-level5-wrist-ablation-v1-videolora200-action-decoder-iter1800
- Backbone Video2World inicial: https://huggingface.co/dreamdifferent/widowx250-wrist-ablation-v1-video-fused (commit `8e39d96344dea0a82ae673874a38206a6c412948`)
- Decodificador de acción inicial: https://huggingface.co/dreamdifferent/widowx250-wrist-ablation-v1-action-decoder-iter2374 (commit `0ea6db91672db019d9d6dc9a6c9bd1ecc0504001`)
- LoRA de vídeo congelada: https://huggingface.co/dreamdifferent/panda-robosuite-level5-wrist-ablation-v1-video-lora-iter200 (commit `2c9643d02c8aedfde187ba456a6d02a3ec3cb259`)
- Dataset: https://huggingface.co/datasets/dreamdifferent/vam-cross-level5-panda-robosuite-widowx-texture-corner-wrist (commit `18d8be57a660329248e8800c28b61bc16b79e424`)
- Código MimicVideo: commit `e3355dbc93132b576c02f920a59b4fc18a4f5906` (repositorio no enlazado en la información disponible)
- Paper, blog, demo o espacio de inferencia: no disponible
