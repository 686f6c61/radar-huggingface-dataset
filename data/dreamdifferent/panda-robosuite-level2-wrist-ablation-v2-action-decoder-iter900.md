# dreamdifferent/panda-robosuite-level2-wrist-ablation-v2-action-decoder-iter900

## Resumen

El repositorio `dreamdifferent/panda-robosuite-level2-wrist-ablation-v2-action-decoder-iter900` contiene un checkpoint del decodificador World2Action (W2A) del proyecto VAM-Cross MimicVideo, desarrollado por el usuario `dreamdifferent`. No es un modelo de lenguaje: es un cabezal de predicción de acciones para robótica de manipulación, entrenado dentro de un pipeline que combina un backbone de vídeo-mundo (Video2World) con una LoRA de vídeo congelada y un decodificador de acciones. En concreto, se publica la iteración 900 de una ejecución que finalizó con estado `completed`, tras verificar que el conjunto completo de checkpoints (modelo, optimizador, scheduler y trainer) era coherente.

El modelo está entrenado sobre el dataset `vam-cross-level2-panda-robosuite-widowx-texture-corner-wrist-v2`, con 280 episodios y 54.426 fotogramas procedentes de dos cámaras (`observation.images.corner_cam` y `observation.images.wrist_cam`). Su contrato de acción es de 15 dimensiones correspondientes a pose efectiva del efector final (EE) y pinza, a 5 Hz, con objetivo de pose relativo a la pose alcanzada (`relative_to_current_achieved_pose`) en el marco `widowx_reference_base/teleop_aligned_tool` y rotación en representación `rotation_6d`.

Es relevante únicamente como artefacto de investigación reproducible: tiene 0 descargas y 0 likes, no declara licencia ni idiomas, y no incluye ni el dataset ni los componentes congelados de los que depende (backbone Video2World inicial, decodificador de acción inicial y LoRA de vídeo). Sin esos componentes fijados por hash, el checkpoint no es autosuficiente.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Decodificador World2Action sobre backbone Video2World con LoRA de vídeo congelada; tipo exacto de capas no especificado en la información disponible |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible (procesa secuencias de vídeo de dos cámaras; no se indica el número de fotogramas de contexto) |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible (modelo de robótica; no declara soporte de lenguaje) |
| Licencia | no disponible |
| Formato de pesos | no especificado en la model card (el repositorio incluye el JSON de versiones fijadas y el `config.yaml` efectivo) |
| Tamaño del repositorio | 1,0 GB |
| Tarea (pipeline) | robotics / action-prediction |
| Iteración publicada | 900 |
| Espacio de acción | 15 dimensiones (pose EE alcanzada + pinza), 5 Hz |
| Marco de pose | `widowx_reference_base/teleop_aligned_tool`, objetivo relativo a la pose alcanzada actual |
| Representación de rotación | `rotation_6d` |
| Entradas | `observation.images.corner_cam`, `observation.images.wrist_cam` |
| Dataset de entrenamiento | `dreamdifferent/vam-cross-level2-panda-robosuite-widowx-texture-corner-wrist-v2` (280 episodios / 54.426 fotogramas) |
| Estado de la ejecución | `completed` |

## Arquitectura y entrenamiento

El modelo se enmarca en la familia MimicVideo / VAM-Cross y se compone de tres piezas: un backbone Video2World inicial (`dreamdifferent/widowx250-wrist-ablation-v1-video-fused@8e39d96344dea0a82ae673874a38206a6c412948`), una LoRA de vídeo congelada (`dreamdifferent/panda-robosuite-level2-wrist-ablation-v2-video-lora-iter200@399d3773289e26a0e063aa7418f05368306d065a`) y el decodificador de acciones que se publica aquí, inicializado desde `dreamdifferent/widowx250-wrist-ablation-v1-action-decoder-iter2374@0ea6db91672db019d9d6dc9a6c9bd1ecc0504001`. La model card no detalla el número de capas, la dimensión oculta ni el objetivo de entrenamiento (difusión, flow matching, regresión MSE u otro), por lo que esos datos no están disponibles.

El entrenamiento se realizó sobre el dataset citado, con 280 episodios y 54.426 fotogramas de grabaciones de teleoperación en el entorno Panda de RoboSuite, con texturas de esquina y cámara de muñeca. El contrato de datos fija dos cámaras y un objetivo de 15 acciones a 5 Hz en el marco de referencia `widowx_reference_base/teleop_aligned_tool`, con pose relativa a la pose alcanzada y rotación `rotation_6d`. El identificador de la ejecución incluye referencias a una fase previa de `action_iter2374` y `videolora_iter200`, lo que sugiere un esquema de entrenamiento por etapas con componentes congelados; no se especifican el número de tokens, la composición completa del dataset ni el uso de RLHF o DPO (no aplicables en este dominio).

## Capacidades

- Predicción de acciones de manipulación robótica: genera vectores de 15 dimensiones (pose del efector final más pinza) a partir de observaciones de vídeo, a una frecuencia de 5 Hz.
- Entrada multi-cámara: consume simultáneamente una vista de esquina (`corner_cam`) y una vista de muñeca (`wrist_cam`).
- Control en espacio de pose relativa: produce objetivos de pose relativos a la pose alcanzada actual, expresados en el marco `widowx_reference_base/teleop_aligned_tool`.
- Rotación en `rotation_6d`: representación continua de orientación que evita discontinuidades de cuaterniones y problemas de gimbal lock.
- Control de pinza: incluido dentro de las 15 dimensiones de acción.
- Integración en un world model de vídeo: el decodificador opera sobre representaciones producidas por el backbone Video2World con LoRA de vídeo congelada.
- No soporta generación de texto, razonamiento simbólico, código, matemáticas, visión general, tool calling, function calling, agentes multi-paso ni capacidades multilingües: no es un modelo de lenguaje y no se declara ninguna de estas funciones en la información disponible.

## Casos de uso

- Reproducción de experimentos de ablación de cámara de muñeca: el sufijo `wrist-ablation-v2` indica que el checkpoint forma parte de un estudio comparativo; sirve para replicar la iteración 900 con los hashes congelados y comprobar el efecto de la cámara de muñeca en el rendimiento del decodificador.
- Evaluación en simulación RoboSuite: permite ejecutar políticas de manipulación en el entorno Panda de RoboSuite con dos cámaras y medir tasas de éxito por tarea, siempre que se reconstruya el pipeline MimicVideo en el commit `e3355dbc93132b576c02f920a59b4fc18a4f5906`.
- Punto de partida para fine-tuning: al ser un decodificador de acciones con contrato explícito (15 dimensiones, 5 Hz, `rotation_6d`), puede reutilizarse como inicialización para nuevos datasets que respeten el mismo espacio de acción.
- Estudio de decodificación vídeo-a-acción: sirve como referencia para comparar arquitecturas de decodificación sobre representaciones de world models, analizando latencia y error de pose con el mismo backbone Video2World.
- Investigación en teleoperación alineada con WidowX: el marco de referencia y la convención de pose están tomados de grabaciones de teleoperación WidowX, lo que facilita trasladar experimentos entre plataformas con la misma convención.
- Destilación o extracción de políticas: el decodificador puede emplearse para generar etiquetas de acción sobre nuevos fotogramas y entrenar políticas más ligeras orientadas a despliegue en tiempo real.
- Banco de pruebas de robustez ante texturas: el dataset incluye variación de texturas (`texture-corner`), por lo que el checkpoint es adecuado para medir sensibilidad al aspecto visual del entorno.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM para el decodificador: no disponible con precisión. El repositorio ocupa 1,0 GB, pero ese tamaño incluye pesos, JSON de versiones fijadas y `config.yaml`, y no desglosa el peso del decodificador frente al resto de artefactos.
- VRAM para inferencia completa: no disponible. La ejecución real requiere además el backbone Video2World inicial y la LoRA de vídeo congelada, que no se incluyen en este repositorio y cuyo tamaño no se especifica.
- GPU recomendadas: no disponible en la información proporcionada.
- Viabilidad en GPU de consumo: no determinable con los datos disponibles; el decodificador por sí solo es pequeño (el repositorio completo es de 1,0 GB), pero el coste dominante sería el backbone de vídeo no incluido.
- Opciones de despliegue: no es compatible con servidores de LLM como vLLM, TGI, llama.cpp u Ollama, ya que no es un modelo de lenguaje. El despliegue debe hacerse con el código de MimicVideo en el commit fijado `e3355dbc93132b576c02f920a59b4fc18a4f5906`, cargando los pesos congelados por hash.
- Latencia y throughput: no disponibles. El contrato de acción a 5 Hz implica un presupuesto de 200 ms por inferencia para control en bucle cerrado, pero no se publica ninguna medición real de latencia.

## Comparativa con modelos similares

No se dispone de datos comparativos en la información proporcionada (ni parámetros, ni contexto, ni métricas) para este checkpoint ni para alternativas de la misma categoría. Como referencia cualitativa, la categoría de decodificadores de acción sobre observaciones visuales incluye enfoques como Diffusion Policy, ACT, OpenVLA o pi0, pero no se han facilitado especificaciones de ninguno de ellos en esta búsqueda, por lo que no se incluye tabla numérica.

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| panda-robosuite-level2-wrist-ablation-v2-action-decoder-iter900 | no disponible | no disponible | no disponible | HuggingFace, 0 descargas |
| Alternativas de la categoría (Diffusion Policy, ACT, OpenVLA, pi0) | no disponible | no disponible | no disponible | no disponible en la información proporcionada |

## Limitaciones y advertencias

- Licencia no declarada: sin licencia explícita, no puede asumirse permiso para uso comercial; el uso por defecto queda restringido a los términos que el autor establezca.
- Dependencia de componentes externos: el checkpoint no es autosuficiente. Necesita el backbone Video2World, el decodificador inicial y la LoRA de vídeo, cada uno fijado por hash, además del dataset, que tampoco se distribuye.
- Ausencia total de evaluación publicada: no hay benchmarks, métricas de éxito ni comparaciones, por lo que no puede estimarse su rendimiento real.
- Dominio muy restringido: entrenado en simulación RoboSuite sobre tareas de nivel 2 con el robot Panda y convenciones WidowX. La transferencia a hardware real o a otras morfologías no está documentada.
- Frecuencia de control baja: 5 Hz limita la aplicación a tareas de manipulación relativamente lentas; no es adecuado para control reactivo de alta frecuencia.
- Riesgo de sobreajuste al aspecto visual: el dataset usa texturas concretas (`texture-corner`), lo que puede degradar el rendimiento con fondos, iluminación o cámaras distintas.
- Dependencia de la representación de pose: cualquier cambio en el marco de referencia, en la convención de pose relativa o en `rotation_6d` invalida el contrato de acción y requiere reentrenamiento.
- Artefacto sin tracción: 0 descargas y 0 likes, sin garantía de mantenimiento ni de soporte por parte del autor.
- Riesgo de alucinación y sesgos: no aplica en el sentido de modelos de lenguaje, pero sí existe riesgo de predicciones de acción incoherentes fuera de la distribución de entrenamiento, sin métricas publicadas que lo cuantifiquen.
- Idiomas: no soporta entrada ni salida en lenguaje natural; la etiqueta de idioma no aplica.

## Enlaces

- HuggingFace: https://huggingface.co/dreamdifferent/panda-robosuite-level2-wrist-ablation-v2-action-decoder-iter900
- Backbone Video2World inicial: https://huggingface.co/dreamdifferent/widowx250-wrist-ablation-v1-video-fused
- Decodificador de acción inicial: https://huggingface.co/dreamdifferent/widowx250-wrist-ablation-v1-action-decoder-iter2374
- LoRA de vídeo congelada: https://huggingface.co/dreamdifferent/panda-robosuite-level2-wrist-ablation-v2-video-lora-iter200
- Dataset de entrenamiento: https://huggingface.co/dreamdifferent/vam-cross-level2-panda-robosuite-widowx-texture-corner-wrist-v2
- MimicVideo (commit fijado): `e3355dbc93132b576c02f920a59b4fc18a4f5906`
- La búsqueda web realizada no devolvió ningún enlace relevante para este modelo; los resultados obtenidos trataban sobre ChatGPT, GitHub Copilot y temas sin relación.
