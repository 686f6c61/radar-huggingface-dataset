# NIATphysicalAI/act_openarm_marker_drawer_v1

## Resumen

ACT (Action Chunking with Transformers) es un método de aprendizaje por imitación para robótica que predice secuencias cortas de acciones (chunks) en lugar de pasos individuales, lo que reduce el error de acumulación y mejora la estabilidad en tareas de manipulación. Este repositorio concreto, `act_openarm_marker_drawer_v1`, es una política entrenada por NIATphysicalAI sobre el robot bimanual OpenArm para ejecutar una tarea específica: coger un rotulador y colocarlo dentro de un cajón.

La política consume observaciones multimodales (estado de 16 dimensiones y cuatro cámaras: dos en la cabeza y dos en las muñecas) y produce un vector de acción de 16 dimensiones, correspondiente a los grados de libertad del robot bimanual. Con 51.637.904 parámetros y un tamaño de repositorio de 0,2 GB, es un modelo compacto orientado a inferencia en tiempo real a 30 FPS.

Es relevante como ejemplo de política de imitación entrenada con LeRobot 0.7.1 sobre un dataset propio de 100 episodios y 54.396 frames, y sirve como referencia para quien quiera reproducir el pipeline de entrenamiento o desplegar una política ACT sobre hardware OpenArm. No obstante, no incluye resultados de evaluación publicados ni licencia declarada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers), transformer con codificador visual y decodificador de acciones |
| Parametros totales | 51.637.904 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no aplica; política de control por chunk de acciones) |
| Tipos de cuantizacion | no disponible (pesos en safetensors, sin variantes GGUF publicadas) |
| Idiomas soportados | no disponible (modelo de robótica, sin capacidades linguisticas) |
| Licencia | no disponible |
| Formato de pesos | safetensors (libreria lerobot) |

## Arquitectura y entrenamiento

La arquitectura es ACT, presentada en el paper arXiv:2304.13705. Se trata de un transformer que combina un codificador de observaciones (estado propioceptivo de 16 dimensiones y cuatro flujos de imagen: `head_left` y `head_right` a 720x1280, `wrist_left` y `wrist_right` a 600x960) con un decodificador que genera chunks de acciones de 16 dimensiones. La predicción por chunks, en lugar de paso a paso, es la innovación clave del método: reduce el horizonte efectivo de error y permite control a 30 FPS con suavidad.

El entrenamiento se realizó con LeRobot 0.7.1 sobre el dataset `NIATphysicalAI/openarm_marker_drawer`: 100 episodios, 54.396 frames a 30 FPS, tarea "Pick the marker and place it inside the drawer". Configuración: 100.000 pasos, batch size 8, optimizador AdamW, learning rate 1e-05, semilla 1000. No se especifica el número de tokens ni si hubo RLHF/DPO (no aplica en aprendizaje por imitación supervisado). No se documentan aumentos de datos ni técnicas adicionales.

## Capacidades

- Control robótico bimanual: genera acciones de 16 dimensiones para el robot OpenArm.
- Aprendizaje por imitación: reproduce la tarea "coger el rotulador y colocarlo en el cajón" a partir de demostraciones teleoperadas.
- Fusión multimodal de cuatro cámaras (dos de cabeza, dos de muñeca) con estado propioceptivo.
- Predicción de chunks de acciones para control continuo a 30 FPS.
- Inferencia en tiempo real mediante `lerobot-rollout`.
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades lingüísticas: es una política de control, no un LLM.

## Casos de uso

- Automatización de pick-and-place en laboratorio: la política ejecuta la secuencia completa de coger el rotulador y depositarlo en el cajón, útil como banco de pruebas para validar hardware OpenArm antes de escalar a tareas más complejas.
- Base para fine-tuning en tareas similares: al estar entrenada sobre un dataset propio y con el pipeline estándar de LeRobot, sirve como punto de partida para reentrenar con nuevas posiciones de objeto o variaciones de la tarea.
- Referencia de reproducibilidad: permite replicar el flujo completo (`lerobot-train` + `lerobot-rollout`) con la misma configuración (100k pasos, batch 8, lr 1e-05) y comparar resultados.
- Evaluación de políticas bimanuales: útil para medir latencia, estabilidad y tasa de éxito en un robot de dos brazos con cuatro cámaras.
- Docencia y demostraciones: ejemplo compacto (0,2 GB, 51,6 M parámetros) para explicar ACT y el ecosistema LeRobot en cursos de robótica.
- Integración en pipelines de investigación: sirve como componente de control de bajo nivel dentro de arquitecturas jerárquicas donde un modelo de alto nivel planifica y esta política ejecuta.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente: "No evaluation results have been provided for this policy yet."

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; con 51,6 M parámetros en fp32 los pesos ocupan aproximadamente 0,2 GB, por lo que la VRAM vendrá dominada por los buffers de las cuatro cámaras de alta resolución.
- GPU recomendadas: no especificadas por el autor; cualquier GPU con CUDA y VRAM suficiente para procesar cuatro flujos de imagen (720x1280 y 600x960) a 30 FPS.
- Cabe en GPU de consumo: previsiblemente sí (el checkpoint es de 0,2 GB), aunque el coste real depende del preprocesado de imagen; no confirmado por el autor.
- Opciones de despliegue: `lerobot-rollout` (CLI oficial de LeRobot); no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI (no aplican a políticas robóticas).
- Latencia y throughput: no disponibles; el entrenamiento se hizo a 30 FPS, lo que sugiere que el bucle de control opera a esa frecuencia, pero no se publican mediciones de latencia.

## Comparativa con modelos similares

No disponible: la información proporcionada no incluye otros modelos comparables ni datos de rendimiento que permitan una comparación rigurosa. Como referencia metodológica, ACT compite con enfoques como Diffusion Policy o VQ-BeT, pero no se dispone de métricas de este checkpoint frente a ellos.

## Limitaciones y advertencias

- Sin licencia declarada: no se puede asumir uso comercial; hay que contactar con el autor antes de cualquier despliegue productivo.
- Sin resultados de evaluación: no hay tasa de éxito publicada, por lo que se desconoce su robustez real.
- Entrenada para una única tarea ("Pick the marker and place it inside the drawer") y un robot concreto (`openarm_bimanual`); no generaliza a otras tareas ni a otro hardware sin reentrenamiento.
- Dataset pequeño (100 episodios): riesgo de sobreajuste a posiciones, iluminación y disposición concretas del entorno de recogida.
- Dependencia de cuatro cámaras con nombres y resoluciones exactas (`head_left`, `head_right`, `wrist_left`, `wrist_right`); un montaje distinto invalida la política.
- Sin capacidades de lenguaje ni razonamiento: no debe presentarse como un modelo de propósito general.
- Riesgo de alucinación no aplica en el sentido de LLM, pero sí de ejecutar acciones incorrectas ante observaciones fuera de distribución.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/NIATphysicalAI/act_openarm_marker_drawer_v1
- Dataset de entrenamiento: https://huggingface.co/datasets/NIATphysicalAI/openarm_marker_drawer
- Paper de ACT: https://huggingface.co/papers/2304.13705 (arXiv:2304.13705)
- Repositorio LeRobot: https://github.com/huggingface/lerobot
- Guía ACT en LeRobot: https://huggingface.co/docs/lerobot/main/en/act
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Documentación de inferencia (rollout): https://huggingface.co/docs/lerobot/main/en/inference
- Visualizador de dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=NIATphysicalAI/openarm_marker_drawer
