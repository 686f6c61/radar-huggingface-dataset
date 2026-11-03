# dreamdifferent/kuka-level2-no-source-stage-v1-video200-action900

## Resumen

VAM-Cross MimicVideo World2Action decoder es un checkpoint de decodificador de acciones para robótica, publicado por el usuario dreamdifferent en Hugging Face. Forma parte del proyecto MimicVideo y corresponde a la iteración 900 de un entrenamiento denominado `w2a_kuka_iiwa14_level2_widowx_texture_2cam_hstack_no_source_stage_v1_bridge_videolora_iter200_widowx_teleop_recording_frame_v1`. El modelo traduce representaciones de vídeo (generadas por un backbone Video2World congelado) en acciones de control para un brazo robótico KUKA iiwa14 con pinza WidowX.

El checkpoint se construye sobre una arquitectura de dos etapas: un backbone Video2World inicial (`jonpai/mimic-video`) con un adaptador LoRA de vídeo congelado, y un decodificador de acciones que se entrena para predecir comandos motores. El repositorio ocupa 1,0 GB y contiene únicamente los pesos del decodificador, no el dataset ni los inputs congelados.

Su relevancia es acotada: se trata de un artefacto de investigación reproducible (con commits y hashes fijados) orientado a experimentos de imitación robótica, no a un uso general. No hay información pública sobre licencia, idiomas ni benchmarks, y el número de descargas y likes es cero en el momento de la consulta.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Decodificador de acciones sobre backbone Video2World (MimicVideo); transformer de vídeo con LoRA congelado |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | no disponible (repo de 1,0 GB; probablemente safetensors o binarios PyTorch, sin confirmar) |

## Arquitectura y entrenamiento

El modelo sigue un esquema de dos fases. La primera fase es un backbone Video2World (`jonpai/mimic-video`, commit `f28339034831e3c2374be075e622e1ff38ebe0f8`) que permanece congelado, junto con un adaptador LoRA de vídeo también congelado (`dreamdifferent/kuka-level2-no-source-stage-v1-video-iter200`, commit `5e7b956d169482f17f428ea3cc6c98a693d67e2c`). La segunda fase es el decodificador de acciones World2Action, que es el componente entrenado y publicado en este repositorio. El código base de MimicVideo está fijado en el commit `e3355dbc93132b576c02f920a59b4fc18a4f5906`.

El entrenamiento se realizó sobre el dataset `dreamdifferent/vam-cross-level2-kuka-iiwa14-widowx-texture` (commit `34e9c1742ff40ca3b60e06fc3ae92872c33248fe`), con 256 episodios y 54.376 fotogramas. Se usan dos cámaras (`observation.images.corner_cam` y `observation.images.front_cam`). El objetivo son 15 acciones de efector final y pinza a 5 Hz, expresadas como pose relativa a la pose actual alcanzada (`relative_to_current_achieved_pose`) en el marco `widowx_reference_base/teleop_aligned_tool`, con rotación en representación `rotation_6d`. No se especifica el número de tokens de entrenamiento, la composición completa del dataset ni si hubo RLHF o DPO. El run se detuvo por causa `unknown`, aunque el autor indica que se verificó el conjunto completo de checkpoints de modelo, optimizador, scheduler y trainer antes de seleccionar los pesos subidos.

## Capacidades

- Predicción de acciones robóticas: genera 15 comandos de efector final y pinza a 5 Hz a partir de entradas visuales de dos cámaras.
- Control de brazo KUKA iiwa14 con pinza WidowX en tareas de manipulación de nivel 2.
- Imitación visual (mimic-video): utiliza representaciones de vídeo del backbone congelado para condicionar la predicción de acciones.
- Representación de pose relativa al efector actual, adecuada para control en bucle cerrado.
- Rotaciones en formato `rotation_6d`, lo que evita discontinuidades de las representaciones angulares clásicas.
- No se documentan capacidades de generación de texto, razonamiento, código, matemáticas, visión general, tool calling, agentes ni multilingüismo.

## Casos de uso

- Investigación en imitación robótica: reproducir el experimento con los commits y hashes fijados para validar la metodología World2Action sobre KUKA iiwa14.
- Manipulación de nivel 2 en laboratorio: usar el decodificador para generar trayectorias de efector final y pinza en tareas de pick-and-place con dos cámaras.
- Control teleoperado asistido: aprovechar la representación de pose relativa para suavizar o completar comandos de teleoperación alineados con el marco `widowx_reference_base`.
- Evaluación de decodificadores de acciones: comparar este checkpoint con el decodificador inicial de `jonpai/mimic-video` manteniendo el mismo backbone y LoRA congelados.
- Estudio de representaciones de rotación: analizar el efecto de `rotation_6d` frente a otras parametrizaciones en políticas visomotoras.
- Reproducibilidad de pipelines: servir como referencia congelada para auditar el entrenamiento y las dependencias exactas de un experimento de robótica.
- Base para fine-tuning: punto de partida para adaptar el decodificador a otras tareas o morfologías, siempre que se respeten las interfaces de entrada y salida documentadas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El repo ocupa 1,0 GB, pero se desconoce el tamaño del backbone Video2World congelado que debe cargarse junto con el decodificador.
- GPU recomendadas: no disponible. Al tratarse de un modelo de vídeo con dos cámaras, se requiere una GPU con memoria suficiente para el backbone completo; no se especifican modelos concretos.
- Compatibilidad con GPU de consumo: no confirmada. No hay datos para afirmar que quepa en RTX 4090 u otras GPU consumer.
- Opciones de despliegue: no disponible. No se documentan integraciones con vLLM, llama.cpp, Ollama o TGI, que además no son adecuadas para un decodificador de acciones robóticas.
- Latencia y throughput: no disponibles. El control se especifica a 5 Hz, pero no se aportan medidas de latencia del modelo.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| VAM-Cross World2Action decoder (este) | no disponible | no disponible | no disponible | no disponible | Hugging Face, repo de 1,0 GB |
| `jonpai/mimic-video` (decodificador inicial) | no disponible | no disponible | no disponible | no disponible | Hugging Face |
| `dreamdifferent/kuka-level2-no-source-stage-v1-video-iter200` (LoRA de vídeo) | no disponible | no disponible | no disponible | no disponible | Hugging Face |

No se dispone de datos de benchmarks ni de especificaciones de parámetros para establecer una comparación cuantitativa con alternativas de la misma categoría.

## Limitaciones y advertencias

- Licencia no especificada: no se puede garantizar el uso comercial ni la redistribución.
- El repositorio contiene solo el decodificador; el dataset, el backbone Video2World y el LoRA congelado no están incluidos y deben obtenerse por separado con los commits exactos indicados.
- El entrenamiento se detuvo por causa `unknown`, lo que puede implicar una convergencia incompleta o condiciones no documentadas.
- Ámbito muy restringido: diseñado para KUKA iiwa14 con pinza WidowX, dos cámaras concretas y tareas de nivel 2; no es un modelo general.
- Sin información sobre sesgos, alucinación, idiomas ni robustez fuera de la distribución de entrenamiento.
- Cero descargas y cero likes en el momento de la consulta: no hay evidencia de validación por parte de la comunidad.
- No se documentan requisitos de hardware, latencia ni procedimiento de inferencia, lo que dificulta su puesta en producción.
- Las interfaces de entrada y salida (15 acciones a 5 Hz, pose relativa, `rotation_6d`) son contractuales y cualquier uso fuera de ellas requiere adaptación.

## Enlaces

- Hugging Face: https://huggingface.co/dreamdifferent/kuka-level2-no-source-stage-v1-video200-action900
- Backbone inicial Video2World: https://huggingface.co/jonpai/mimic-video
- LoRA de vídeo congelado: https://huggingface.co/dreamdifferent/kuka-level2-no-source-stage-v1-video-iter200
- Dataset: https://huggingface.co/datasets/dreamdifferent/vam-cross-level2-kuka-iiwa14-widowx-texture
- Commit de MimicVideo: `e3355dbc93132b576c02f920a59b4fc18a4f5906` (sin URL directa en la información disponible)
