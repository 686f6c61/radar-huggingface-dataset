# dreamdifferent/vam-cross-level4-kuka-iiwa14-widowx-texture-v2-teleopaligned-videolora400-action-deco-3cfb1a837f

## Resumen

VAM-Cross MimicVideo World2Action decoder es un checkpoint de investigación publicado en HuggingFace por el usuario `dreamdifferent`. Se trata de la parte "World2Action" de una arquitectura MimicVideo: un decodificador que traduce representaciones de un world model de vídeo (Video2World) en acciones de robot. No es un modelo de lenguaje ni un modelo multimodal de propósito general, sino un componente de un pipeline de robótica orientado a la predicción de acciones de efector final y pinza.

El checkpoint corresponde a la iteración 1800 de la ejecución `w2a_kuka_iiwa14_level4_widowx_texture_2cam_hstack_v2_action_iter2374_videolora_iter400_widowx_teleop_recording_frame_v1`, que se detuvo por una causa desconocida según la propia model card. El repositorio ocupa 1,0 GB e incluye un `config.yaml` efectivo y un JSON con las dependencias fijadas, pero no incluye ni el dataset ni los pesos de los componentes congelados necesarios para ejecutarlo.

Su relevancia es acotada y muy específica: sirve como material reproducible para grupos que trabajan con world models de vídeo aplicados a manipulación robótica sobre brazos KUKA iiwa14 y WidowX, con entrada de dos cámaras y acciones a 5 Hz. No se han publicado parámetros totales, contexto, benchmarks ni licencia, y el repositorio no tiene descargas ni valoraciones en el momento de redactar esta ficha.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Decodificador World2Action sobre backbone Video2World (familia MimicVideo); detalles internos no disponibles |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo de robótica, no de texto) |
| Licencia | no disponible |
| Formato de pesos | no disponible (el repositorio incluye `config.yaml` y un JSON de dependencias fijadas) |
| Pipeline declarado | robotics |
| Etiquetas | mimic-video, robotics, action-prediction |
| Tamano del repositorio | 1,0 GB |
| Checkpoint | iteracion 1800 de la ejecucion `w2a_kuka_iiwa14_level4_widowx_texture_2cam_hstack_v2_action_iter2374_videolora_iter400_widowx_teleop_recording_frame_v1` |
| Estado de la ejecucion | detenida por causa `unknown` |
| Camaras de entrada | `observation.images.corner_cam`, `observation.images.front_cam` |
| Salida de acciones | 15 acciones de efector final logrado y pinza, a 5 Hz |
| Objetivo de pose | `relative_to_current_achieved_pose` en el marco `widowx_reference_base/teleop_aligned_tool` |
| Representacion de rotacion | `rotation_6d` |
| Dataset de entrenamiento | `dreamdifferent/vam-cross-level4-kuka-iiwa14-widowx-texture`, 192 episodios y 54 749 fotogramas (no incluido en el repositorio) |
| Fecha de creacion | 2026-09-16 |
| Fecha de actualizacion | 2026-09-16 |

## Arquitectura y entrenamiento

La model card describe el artefacto como un decodificador "World2Action" perteneciente a la familia MimicVideo. El pipeline fija tres componentes congelados: el backbone inicial Video2World `dreamdifferent/widowx250-video-fused` (revision `f0cea76b`), el decodificador de acciones inicial `dreamdifferent/vam-cross-target-widowx250-native-2cam-action-decoder` (revision `93750ccc`) y una LoRA de vídeo congelada `dreamdifferent/vam-cross-level4-kuka-iiwa14-widowx-texture-v2-video-lora-iter400` (revision `80d21fb5`), entrenada a 400 iteraciones. El propio MimicVideo queda anclado al commit `e3355dbc93132b576c02f920a59b4fc18a4f5906`. El repositorio publicado contiene únicamente el peso del decodificador World2Action, no el conjunto completo.

El contrato de datos indica entrenamiento sobre teleoperación alineada: 192 episodios y 54 749 fotogramas capturados con dos cámaras (`corner_cam` y `front_cam`), con 15 dimensiones de acción que combinan efector final logrado y pinza a 5 Hz. Las poses se expresan de forma relativa a la pose lograda actual en el marco `widowx_reference_base/teleop_aligned_tool`, y la rotación se codifica en `rotation_6d`. La model card no detalla la arquitectura interna del decodificador (número de capas, dimensión oculta, mecanismo de atención), ni el presupuesto de cómputo, ni si hubo etapas de ajuste fino con RLHF/DPO, ni la composición completa del dataset. El run se detuvo por una causa desconocida y el autor indica que verificó el último conjunto completo de checkpoint de modelo, optimizador, scheduler y trainer antes de seleccionar el peso subido, lo que sitúa este artefacto como un punto intermedio de una ejecución truncada.

## Capacidades

- Predicción de acciones de robot: genera 15 valores de acción correspondientes a efector final logrado y pinza, a una frecuencia de 5 Hz.
- Entrada visomotora con dos cámaras: consume las vistas `corner_cam` y `front_cam`.
- Codificación de pose relativa: trabaja con objetivos de pose relativos a la pose lograda actual, lo que permite correcciones incrementales durante la ejecución.
- Rotación en 6D: representa la orientación con `rotation_6d`, evitando problemas de continuidad de otras parametrizaciones como cuaterniones o ángulos de Euler.
- Alineación con teleoperación: el contrato de datos está definido en el marco `widowx_reference_base/teleop_aligned_tool`, lo que facilita el uso de demostraciones teleoperadas como referencia.
- Integración en un pipeline de world model: actúa como cabezal de acción sobre representaciones del backbone Video2World con una LoRA de vídeo congelada.
- Generación de texto: no.
- Razonamiento, matemáticas o código: no.
- Tool calling o function calling: no.
- Soporte de agentes o multi-step reasoning: no.
- Capacidades multilingües: no aplicable.
- Modo de pensamiento, visión general o audio: no disponible; la única entrada declarada es vídeo de dos cámaras orientado a control.

## Casos de uso

- Reproducción de experimentos de world models para robótica: el checkpoint permite reanudar o comparar la iteración 1800 de una ejecución concreta, siempre que se reconstruyan los componentes congelados con las revisiones exactas indicadas en el JSON del repositorio.
- Investigación en decodificadores de acción visomotores: sirve como punto de partida para estudiar cómo se traduce una representación latente de vídeo en comandos de efector final a 5 Hz con dos cámaras.
- Ajuste fino sobre nuevos brazos o tareas: al estar entrenado sobre KUKA iiwa14 y WidowX con textura, puede usarse como inicialización para fine-tuning en configuraciones similares de manipulación con teleoperación alineada.
- Evaluación de representaciones relativas de pose: el uso de `relative_to_current_achieved_pose` y `rotation_6d` lo hace adecuado para experimentos que comparan parametrizaciones de acción en políticas visomotoras.
- Recolección y validación de pipelines de teleoperación: el contrato de datos (192 episodios, 54 749 fotogramas, marco de referencia `teleop_aligned_tool`) sirve de plantilla para verificar que nuevos datasets cumplen el mismo formato antes de entrenar.
- Prototipado de control en laboratorio con dos cámaras: permite montar un bucle cerrado a 5 Hz sobre hardware de manipulación, con un presupuesto de 200 ms por paso si la inferencia se ejecuta en línea.
- Estudio de degradación por ejecuciones truncadas: al ser un checkpoint de un run detenido por causa desconocida, es útil como caso de estudio de la calidad de checkpoints intermedios frente al óptimo final.
- Integración como cabezal en una arquitectura MimicVideo completa: para equipos que ya disponen del backbone Video2World y de la LoRA congelada, este repositorio aporta el decodificador de acción sin necesidad de reentrenarlo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye tasas de éxito, errores de posición u orientación, comparaciones con políticas base ni métricas de validación. Tampoco se documentan latencia o throughput medidos.

## Requisitos de hardware

- VRAM para inferencia: no disponible. No se publican requisitos oficiales.
- Estimación a partir del tamaño del repositorio: el checkpoint ocupa 1,0 GB, pero la ejecución completa requiere además el backbone Video2World y la LoRA de vídeo congelada, por lo que la VRAM total será superior a la del propio decodificador. La cifra exacta no puede determinarse con los datos disponibles.
- GPU recomendadas: no disponibles. No hay especificación de GPU mínima ni de GPU validada por el autor.
- Compatibilidad con GPU de consumo: no confirmada. Dado que no se declara el número de parámetros ni el formato de pesos, no es posible afirmar si cabe en una RTX 4090 u otra GPU de gama de consumo.
- Opciones de despliegue: no documentadas. Las herramientas citadas habitualmente para modelos de lenguaje (vLLM, llama.cpp, Ollama, TGI) no son aplicables a este tipo de checkpoint; el despliegue depende del código de MimicVideo en el commit `e3355dbc93132b576c02f920a59b4fc18a4f5906`.
- Latencia y throughput: no disponibles. Como referencia derivada del contrato de datos, la frecuencia de 5 Hz implica un presupuesto de 200 ms por paso si se ejecuta en bucle cerrado con hardware real.
- Almacenamiento: 1,0 GB para este repositorio, más el espacio necesario para los componentes congelados y el dataset de 54 749 fotogramas, que no se incluyen.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la documentación proporcionada. No hay benchmarks ni especificaciones que permitan situar este checkpoint frente a alternativas de la misma categoría (por ejemplo, otras políticas visomotoras o decodificadores de acción). A continuación se listan, a modo de dependencias y no de alternativas, los artefactos de la misma familia que la model card declara como entradas congeladas.

| Artefacto | Rol en el pipeline | Revision fijada |
|---|---|---|
| `dreamdifferent/widowx250-video-fused` | Backbone inicial Video2World | `f0cea76b62c5dd66b06b9f965932ddea32a7b546` |
| `dreamdifferent/vam-cross-target-widowx250-native-2cam-action-decoder` | Decodificador de acciones inicial | `93750cccda01620e3c028477e4c49bc5c996a68d` |
| `dreamdifferent/vam-cross-level4-kuka-iiwa14-widowx-texture-v2-video-lora-iter400` | LoRA de vídeo congelada (400 iteraciones) | `80d21fb53a6718bab9b7a8ef4611a737f5bc27cf` |
| `dreamdifferent/vam-cross-level4-kuka-iiwa14-widowx-texture` | Dataset (192 episodios, 54 749 fotogramas) | `008d94dbe6fae4e6b8599cabf4515bd305f2d202` |
| MimicVideo | Código base | commit `e3355dbc93132b576c02f920a59b4fc18a4f5906` |

## Limitaciones y advertencias

- Licencia no disponible: no se puede determinar si el uso comercial está permitido. Cualquier despliegue en producción requiere aclarar este punto con el autor.
- Sin benchmarks publicados: no hay ninguna métrica de éxito, precisión de pose o robustez que permita estimar el rendimiento esperado.
- Checkpoint de una ejecución truncada: el run se detuvo por una causa `unknown`, por lo que este peso no es necesariamente el mejor de la ejecución ni está validado como punto final.
- Repositorio sin tracción: 0 descargas y 0 valoraciones, lo que implica ausencia de validación por parte de la comunidad.
- Dependencias no incluidas: el dataset, el backbone, el decodificador inicial y la LoRA congelada no forman parte del repositorio. La reproducibilidad depende de resolver esas revisiones exactas.
- Acoplamiento al hardware y a la configuración de captura: el modelo está atado a los brazos KUKA iiwa14 y WidowX, a las cámaras `corner_cam` y `front_cam` y al marco `widowx_reference_base/teleop_aligned_tool`. Cambiar cualquiera de estos elementos invalida el contrato de datos.
- Sesgo de dominio del dataset: 192 episodios de teleoperación alineada implican una distribución estrecha de tareas, objetos, texturas e iluminación. Se espera degradación fuera de esa distribución.
- Dependencia de la pose relativa: al predecir respecto a la pose lograda actual, los errores pueden acumularse en ejecuciones largas en bucle cerrado.
- Sin cuantizaciones declaradas: no se documentan versiones de 8 bits o 4 bits, ni un formato de pesos concreto, lo que dificulta el despliegue en hardware limitado.
- Riesgo de alucinación: no aplica en el sentido textual; el riesgo equivalente es la generación de acciones no válidas o inseguras en el espacio de efector final, que exige límites de seguridad en el controlador.
- Idiomas: no aplicable. La model card está redactada en inglés y no se declaran idiomas soportados.
- Fechas del repositorio: la creación y la actualización figuran como 2026-09-16, lo que conviene verificar antes de citar el artefacto.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/dreamdifferent/vam-cross-level4-kuka-iiwa14-widowx-texture-v2-teleopaligned-videolora400-action-deco-3cfb1a837f
- Backbone Video2World: https://huggingface.co/dreamdifferent/widowx250-video-fused
- Decodificador de acciones inicial: https://huggingface.co/dreamdifferent/vam-cross-target-widowx250-native-2cam-action-decoder
- LoRA de vídeo congelada: https://huggingface.co/dreamdifferent/vam-cross-level4-kuka-iiwa14-widowx-texture-v2-video-lora-iter400
- Dataset: https://huggingface.co/datasets/dreamdifferent/vam-cross-level4-kuka-iiwa14-widowx-texture
- Codigo base MimicVideo: no se ha encontrado URL publica en la informacion disponible; la model card solo indica el commit `e3355dbc93132b576c02f920a59b4fc18a4f5906`
- Paper, blog o demo: no disponibles
- Nota sobre la busqueda web: los resultados devueltos corresponden a paginas corporativas de Microsoft y no guardan relacion con este modelo, por lo que no aportan informacion adicional
