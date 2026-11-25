# sadfjsf/act_loop_l3_cur

## Resumen

ACT (Action Chunking with Transformers) es un método de aprendizaje por imitación para control robótico que predice fragmentos cortos de acciones en lugar de pasos individuales, lo que reduce el error de acumulación y mejora las tasas de éxito en tareas de manipulación. Este repositorio concreto, `sadfjsf/act_loop_l3_cur`, es una política entrenada con LeRobot sobre el robot `omx_follower_current` para la tarea específica "grasp the paper loop and lift it" (agarrar el bucle de papel y levantarlo).

El modelo tiene 51.670.663 parámetros y consume dos flujos visuales (cámara de muñeca y cámara superior) de 480x640 junto con un vector de estado de 7 dimensiones, produciendo una acción de 7 dimensiones. Se entrenó durante 50.000 pasos con un batch size de 8 y un learning rate de 1e-5 sobre un dataset de 39 episodios y 9.281 fotogramas a 15 FPS.

Es relevante como ejemplo práctico de política de imitación ligera y desplegable en hardware de consumo, pero conviene subrayar que se trata de un modelo de nicho, con licencia no declarada, sin métricas de evaluación publicadas y orientado exclusivamente a un robot y una tarea concretos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers), transformer con codificador visual y decodificador de acciones |
| Parametros totales | 51.670.663 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (política de control, no modelo de lenguaje) |
| Tipos de cuantizacion | no disponible (pesos en safetensors de precisión completa) |
| Idiomas soportados | no disponible (no aplica; modelo de robótica) |
| Licencia | no disponible |
| Formato de pesos | safetensors (librería lerobot) |

## Arquitectura y entrenamiento

ACT es un transformer diseñado para aprendizaje por imitación que predice "chunks" de acciones (secuencias cortas de comandos) en lugar de una sola acción por paso. La política combina un codificador de imágenes (procesa las dos cámaras, `wrist` y `top`, a 3x480x640) con el estado proprioceptivo de 7 dimensiones, y un decodificador que genera el vector de acción de 7 dimensiones. La innovación clave del método original es la predicción de fragmentos de acción, que mitiga el error de compounding y estabiliza el control.

El entrenamiento se realizó con LeRobot 0.7.1 durante 50.000 pasos, batch size 8, optimizador AdamW y learning rate 1e-5, con semilla 1000. El dataset `choijunpyo/OMX_loop_L3_cur` contiene 39 episodios y 9.281 fotogramas a 15 FPS de teleoperación sobre la tarea "grasp the paper loop and lift it". No se documenta composición adicional del dataset, aumentos de datos ni etapas de RLHF/DPO (no aplicables a este paradigma).

## Capacidades

- Control robótico de manipulación: genera comandos de acción de 7 dimensiones a partir de observaciones visuales y de estado.
- Percepción visual multi-cámara: procesa simultáneamente las vistas de muñeca y superior a resolución 480x640.
- Aprendizaje por imitación: reproduce la política aprendida de demostraciones teleoperadas para una tarea concreta.
- Ejecución autónoma de la tarea "grasp the paper loop and lift it" en el robot `omx_follower_current`.
- No soporta tool calling, function calling ni razonamiento multi-paso en el sentido de los LLM.
- No dispone de capacidades multilingües, de visión general, audio ni modo "thinking".
- No es un modelo de propósito general: su competencia está acotada a la tarea y al robot de entrenamiento.

## Casos de uso

- Automatización de una celda de pick-and-place: la política ejecuta el agarre y elevación de un bucle de papel de forma repetible, adecuada para tareas de manipulación sencillas en líneas de montaje o laboratorios.
- Prototipado rápido de políticas de imitación: sirve como referencia para validar el pipeline de LeRobot (grabación, entrenamiento y despliegue) antes de escalar a tareas más complejas.
- Investigación en aprendizaje por imitación: útil como baseline reproducible para comparar variantes de ACT, aumentos de datos o cambios de arquitectura sobre el mismo dataset.
- Docencia y formación en robótica: ejemplo didáctico de extremo a extremo con hardware asequible y comandos CLI claros (`lerobot-rollout`, `lerobot-train`).
- Evaluación de robustez visual: al usar dos cámaras, permite estudiar el impacto de oclusiones o cambios de iluminación en la política.
- Despliegue en robot de bajo coste: con 51,7 M de parámetros y pesos de 0,2 GB, cabe en GPUs de consumo y permite inferencia en el borde (edge) junto al robot.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente: "No evaluation results have been provided for this policy yet."

## Requisitos de hardware

- VRAM estimada para inferencia: muy baja; con 51,7 M de parámetros y pesos safetensors de 0,2 GB, la inferencia requiere aproximadamente 1-2 GB de VRAM incluyendo buffers de las dos cámaras a 480x640.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM; RTX 3060, RTX 4060, RTX 4090, A100 o H100 son suficientes y en la mayoría de casos sobredimensionadas.
- Cabe en GPU de consumo: sí, en prácticamente cualquier GPU consumer moderna (GTX 1650 en adelante) e incluso en CPU para inferencia a baja frecuencia.
- Opciones de despliegue: LeRobot (`lerobot-rollout`), PyTorch nativo; no se documenta soporte para vLLM, llama.cpp, Ollama o TGI (no aplicables a este tipo de política).
- Latencia y throughput estimados: no disponibles; el control opera a 15 FPS según el dataset, pero no se publican mediciones de latencia en el robot.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / entradas | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| sadfjsf/act_loop_l3_cur (este) | 51,7 M | 2 imágenes 480x640 + estado 7D | "grasp the paper loop and lift it" en `omx_follower_current` | no disponible | Hugging Face (0 descargas) |
| Políticas ACT genéricas de LeRobot | variable (decenas de M) | imágenes + estado según robot | múltiples tareas de manipulación | Apache 2.0 (LeRobot) | Hugging Face / GitHub |
| Políticas Diffusion Policy | variable (mayor que ACT) | imágenes + estado | manipulación con acciones multimodales | según repositorio | Hugging Face / papers |
| Políticas VLA (p. ej. OpenVLA) | miles de millones | imágenes + instrucción en lenguaje | manipulación generalista | según modelo | Hugging Face |

No se dispone de datos de rendimiento comparativo para este checkpoint concreto; la comparación se limita a parámetros, entradas y licencia.

## Limitaciones y advertencias

- Sesgos conocidos: al entrenarse con 39 episodios de un único operador y robot, la política hereda los sesgos de las demostraciones (posiciones, velocidades y agarres específicos).
- Riesgo de alucinación: no aplica en el sentido lingüístico, pero la política puede generar acciones incorrectas o inseguras fuera de la distribución de entrenamiento.
- Limitaciones de contexto e idioma: no es un modelo de lenguaje; no procesa instrucciones en lenguaje natural ni soporta otros idiomas.
- Restricciones de licencia: la licencia no está declarada ("More Information Needed" en la model card), por lo que el uso comercial es incierto y requiere contacto con el autor.
- Especificidad de hardware: entrenada para `omx_follower_current` con cámaras `wrist` y `top`; no es portable directamente a otros robots sin reentrenamiento.
- Ausencia de evaluación: no hay tasas de éxito publicadas, lo que impide estimar su fiabilidad real en producción.
- Tarea única: solo cubre "grasp the paper loop and lift it"; no generaliza a otras tareas.
- Fecha de creación del repositorio (2026-11-25) y 0 descargas: ecosistema mínimo, sin comunidad ni soporte documentado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/sadfjsf/act_loop_l3_cur
- Dataset de entrenamiento: https://huggingface.co/datasets/choijunpyo/OMX_loop_L3_cur
- Paper de ACT: https://huggingface.co/papers/2304.13705 (arXiv:2304.13705)
- Guía de ACT en LeRobot: https://huggingface.co/docs/lerobot/main/en/act
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Instalación de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Grabación de datos y entrenamiento: https://huggingface.co/docs/lerobot/en/il_robots
- Cheat-sheet de CLI: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentación de inferencia/rollout: https://huggingface.co/docs/lerobot/main/en/inference
- Visualizador del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=choijunpyo/OMX_loop_L3_cur
