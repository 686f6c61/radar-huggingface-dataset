# ethanCSL/openarm_wipeboard_lerobot_real_gr00t_v01

## Resumen

`ethanCSL/openarm_wipeboard_lerobot_real_gr00t_v01` es una política de imitación robótica publicada en Hugging Face por el usuario ethanCSL, entrenada con la librería LeRobot sobre la arquitectura GR00T N1.7 de NVIDIA. No se trata de un modelo de lenguaje generalista, sino de un modelo de control visuomotor que transforma observaciones multimodales (tres cámaras RGB y un vector de estado propioceptivo de 16 dimensiones) en un vector de acción de 16 dimensiones para el robot `openarm_umeow`. El modelo resuelve una tarea concreta: pasar un borrador de una mano a otra y limpiar una pizarra.

La relevancia de esta ficha está en que ejemplifica el flujo completo de LeRobot para robótica de imitación: un dataset pequeño (20 episodios, 22 322 fotogramas a 30 FPS), una configuración de entrenamiento reproducible (20 000 pasos, batch 8, AdamW, lr 1e-4) y un checkpoint de aproximadamente 3 144 millones de parámetros y 12,6 GB en safetensors. La licencia Apache 2.0 facilita su reutilización y auditoría.

Conviene subrayar que el autor no ha publicado resultados de evaluación en robot real, por lo que el rendimiento efectivo de la política no está cuantificado. La ficha describe, por tanto, la arquitectura declarada, los artefactos disponibles y las condiciones de entrenamiento, sin extrapolar capacidades no verificadas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GR00T N1.7 (backbone Cosmos-Reason2/Qwen3-VL + action transformer con flow matching) |
| Parametros totales | 3.144.016.000 (dato real de safetensors) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería LeRobot) |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura GR00T N1.7 de NVIDIA: un backbone vision-language basado en Cosmos-Reason2/Qwen3-VL que procesa las imágenes de cámara y las instrucciones en lenguaje natural, acoplado a un action transformer entrenado con flow matching que genera las acciones condicionadas por visión, lenguaje y propiocepción. La política consume tres cámaras (`body_cam`, `wrist_cam`, `right_wrist_cam`, cada una a 480x640 con 3 canales) y un vector `observation.state` de 16 dimensiones, y produce un vector `action` de 16 dimensiones.

El entrenamiento se realizó con LeRobot 0.6.2 sobre el dataset `ethanCSL/openarm_wipeboard_lerobot_real_v01`, compuesto por 20 episodios y 22 322 fotogramas a 30 FPS de la tarea "Left arm pass eraser to right arm to wipe off the board". La configuración declarada es de 20 000 pasos de entrenamiento, batch size 8, optimizador AdamW, learning rate 1e-4 y semilla 1000. No se especifican en la información disponible el número de tokens de entrenamiento del backbone, la composición completa del dataset ni si hubo etapas de RLHF o DPO.

## Capacidades

- Control visuomotor de un robot `openarm_umeow` para la tarea concreta de pasar un borrador entre brazos y limpiar una pizarra.
- Fusión de tres flujos visuales (cámara corporal y dos cámaras de muñeca) con un vector propioceptivo de 16 dimensiones.
- Generación de acciones continuas de 16 dimensiones mediante flow matching.
- Condicionamiento por instrucción en lenguaje natural a través del backbone vision-language.
- Ejecución autónoma en bucle mediante `lerobot-rollout` con estrategia `base`.
- No se declaran capacidades de tool calling, agentes multi-paso, razonamiento general ni procesamiento de audio.

## Casos de uso

- Automatización de tareas de limpieza de pizarras en entornos educativos o de laboratorio: la política puede ejecutar el intercambio de borrador entre brazos y el barrido sobre la superficie, siempre que el robot y las cámaras coincidan con la configuración de entrenamiento.
- Base para investigación en imitación con datasets pequeños: con solo 20 episodios, sirve como punto de partida para estudiar la sensibilidad de GR00T a la cantidad y calidad de demostraciones.
- Reentrenamiento para tareas análogas de manipulación bimanual: el pipeline `lerobot-train --policy.type=groot` permite sustituir el dataset y adaptar la política a otras tareas de coordinación entre brazos.
- Evaluación de la integración LeRobot + GR00T en hardware propio: útil para validar la cadena de despliegue (`lerobot-rollout`) antes de invertir en datasets mayores.
- Docencia en robótica de imitación: ejemplo reproducible de configuración de entrenamiento, features de observación y formato de acciones.
- Referencia para auditoría de políticas robóticas: al estar en Apache 2.0 y safetensors, permite inspeccionar pesos y reproducir el entrenamiento declarado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card incluye una sección de evaluación vacía y el autor indica explícitamente que no se han proporcionado resultados de evaluación en robot real.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada; con 3 144 millones de parámetros en safetensors, el checkpoint ocupa aproximadamente 12,6 GB, por lo que la inferencia en precisión nativa requiere al menos esa cantidad de memoria más el overhead del backbone visual.
- GPU recomendadas: no disponible; por tamaño, encajan GPU de datacenter como A100 o H100, y previsiblemente tarjetas consumer de 24 GB o más.
- Cabe en consumer GPU: no confirmado; el tamaño del checkpoint (12,6 GB) sugiere que una RTX 4090 de 24 GB podría albergarlo en precisión nativa, pero no hay datos de consumo real publicados.
- Opciones de despliegue: LeRobot (`lerobot-rollout` con `--strategy.type=base`); no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI, que además no aplican a un modelo de control robótico.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `ethanCSL/openarm_wipeboard_lerobot_real_gr00t_v01` | 3 144 016 000 | no disponible | Control visuomotor `openarm_umeow` | Apache 2.0 | Hugging Face, 0 descargas |
| Políticas ACT de LeRobot | no disponible | no disponible | Imitación visuomotora genérica | según checkpoint | Hub de LeRobot |
| Políticas Diffusion Policy de LeRobot | no disponible | no disponible | Imitación visuomotora genérica | según checkpoint | Hub de LeRobot |
| GR00T N1.7 base de NVIDIA | no disponible | no disponible | Fundacional humanoide | no disponible | Repositorio Isaac-GR00T |

La comparación cuantitativa con alternativas no está disponible: no hay benchmarks publicados para esta política ni datos de rendimiento de los modelos comparables en la información proporcionada.

## Limitaciones y advertencias

- Ausencia total de evaluación: el autor no reporta tasa de éxito ni número de ensayos, por lo que no hay evidencia cuantitativa de que la política funcione en robot real.
- Dataset muy reducido: 20 episodios y una única tarea limitan la generalización a variaciones de posición, iluminación, objetos o robots distintos.
- Acoplamiento al hardware: las features de observación están fijadas a `openarm_umeow` con tres cámaras concretas; usar otros nombres o resoluciones rompe la inferencia.
- Riesgo de sobreajuste a la tarea: al entrenarse sobre una instrucción única, es previsible que la política no responda correctamente a instrucciones distintas.
- Sin datos sobre sesgos, alucinación o comportamiento fuera de distribución; en robótica, los fallos se manifiestan como acciones físicas incorrectas, con riesgo material asociado.
- Licencia Apache 2.0 permite uso comercial, pero la responsabilidad sobre el comportamiento físico del robot recae en el integrador.
- No se documentan requisitos de seguridad, parada de emergencia ni límites de par para el despliegue.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ethanCSL/openarm_wipeboard_lerobot_real_gr00t_v01
- Dataset de entrenamiento: https://huggingface.co/datasets/ethanCSL/openarm_wipeboard_lerobot_real_v01
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=ethanCSL/openarm_wipeboard_lerobot_real_v01
- Repositorio Isaac-GR00T de NVIDIA: https://github.com/NVIDIA/Isaac-GR00T
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Guía LeRobot para GR00T: https://huggingface.co/docs/lerobot/main/en/groot
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Instalación de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabación de datos y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Referencia de comandos CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentación de inferencia: https://huggingface.co/docs/lerobot/main/en/inference
