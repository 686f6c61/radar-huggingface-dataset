# nberezny/act_lite6_nudge_wp

## Resumen

`nberezny/act_lite6_nudge_wp` es una política de imitación para robótica basada en el método Action Chunking with Transformers (ACT), publicado en el paper arXiv:2304.13705. El modelo ha sido entrenado y subido al Hub mediante LeRobot, la librería de Hugging Face para aprendizaje por imitación en robótica real. No se trata de un modelo de lenguaje: es un controlador visomotor que consume dos flujos de imagen y el estado de las articulaciones, y emite comandos de acción para un brazo robótico.

El modelo está especializado en una única tarea: coger un cubo rojo y colocarlo sobre un cuadrado azul. Se entrenó sobre el dataset `nberezny/lite6_pick_place_nudge_wp`, con 800 episodios de teleoperación que suman 18.162 fotogramas a 20 FPS. El robot objetivo es una variante simulada del UFactory Lite 6 (`ufactory_lite6_sim_hybrid_wp`), con dos cámaras: una cenital (`overhead`) y otra en la muñeca (`wrist`).

Con 51.582.603 parámetros y un repo de 0,8 GB, es un modelo pequeño que cabe holgadamente en cualquier GPU de consumo. Su relevancia es la de un ejemplo práctico y reproducible de pipeline de aprendizaje por imitación con LeRobot: registro de datos, entrenamiento con ACT y despliegue con `lerobot-rollout`. La model card no incluye resultados de evaluación ni licencia declarada, por lo que su uso en producción exige validación propia.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers) |
| Parámetros totales | 51.582.603 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no aplicable (política robótica; no hay ventana de contexto textual) |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | no disponible (la model card indica «More Information Needed») |
| Formato de pesos | safetensors |
| Librería | lerobot 0.7.0 |
| Tipo de robot | `ufactory_lite6_sim_hybrid_wp` |
| Cámaras | `overhead`, `wrist` (3×240×320 cada una) |
| Entrada de estado | `observation.state`, forma (16,) |
| Salida de acción | `action`, forma (11,) |
| Frecuencia de los datos | 20 FPS |
| Dataset de entrenamiento | `nberezny/lite6_pick_place_nudge_wp` (800 episodios, 18.162 fotogramas) |
| Tarea | «Pick up the red cube and place it on the blue square.» |

## Arquitectura y entrenamiento

ACT es un método de aprendizaje por imitación que predice fragmentos de acción (*action chunks*) en lugar de pasos individuales, lo que reduce el error de acumulación y estabiliza el control. La arquitectura combina un codificador visual (procesa las dos cámaras a 240×320) con un codificador de estado y un decodificador transformer que genera la secuencia de acciones. El paper de referencia es arXiv:2304.13705.

El entrenamiento se realizó con LeRobot 0.7.0 durante 100.000 pasos, con batch size 8, optimizador AdamW, learning rate 1e-05 y semilla 1000. Los datos provienen de 800 episodios teleoperados de una sola tarea (pick-and-place con nudge), a 20 FPS, lo que da 18.162 fotogramas. No se documenta en la model card el uso de RLHF, DPO ni aumentos de datos; tampoco se especifica la composición exacta del dataset más allá de la tarea y el número de episodios.

## Capacidades

- Control visomotor de un brazo UFactory Lite 6 (variante simulada) para la tarea de coger el cubo rojo y dejarlo en el cuadrado azul.
- Fusión de dos vistas: cámara cenital y cámara de muñeca, con entradas de 3×240×320 píxeles.
- Predicción de acciones en forma de *chunks*, lo que aporta suavidad y reduce el error compuesto frente a políticas paso a paso.
- Entrada de estado articular de 16 dimensiones y salida de acción de 11 dimensiones.
- No soporta tool calling, function calling, agentes multi-paso ni razonamiento textual: es una política robótica, no un modelo de lenguaje.
- No tiene capacidades multilingües, de visión general, audio ni modo de razonamiento.

## Casos de uso

- **Manipulación pick-and-place en simulación:** desplegar la política en el entorno `ufactory_lite6_sim_hybrid_wp` con `lerobot-rollout` para validar la tarea de coger el cubo rojo y soltarlo en el cuadrado azul, útil como banco de pruebas de pipelines de imitación.
- **Punto de partida para fine-tuning:** reentrenar con `lerobot-train --policy.type=act` sobre un dataset propio para adaptar la política a nuevas posiciones de objetos o distinta iluminación, aprovechando los 51,6 M de parámetros y los 100.000 pasos de receta ya validada.
- **Referencia docente de aprendizaje por imitación:** usar el repo como ejemplo completo (dataset de 800 episodios, configuración de entrenamiento y comandos de despliegue) en cursos o talleres sobre LeRobot.
- **Pruebas de integración de hardware Lite 6:** validar la cadena cámara-estado-acción con dos cámaras OpenCV (cenital y muñeca) antes de invertir en un dataset propio más grande.
- **Evaluación comparativa de políticas ACT:** servir de baseline frente a otras políticas entrenadas con LeRobot sobre la misma tarea, midiendo tasa de éxito y suavidad de trayectoria.
- **Generación de datos sintéticos de control:** ejecutar la política en bucle para producir rollouts que alimenten análisis de estabilidad o entrenamiento de modelos auxiliares.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card incluye una sección de evaluación vacía con el texto «No evaluation results have been provided for this policy yet.», por lo que no hay tasas de éxito ni métricas de la tarea.

## Requisitos de hardware

- **VRAM estimada:** con 51,6 M de parámetros en safetensors, los pesos ocupan aproximadamente 0,1 GB en FP32; la inferencia completa con dos codificadores visuales requiere del orden de 1-2 GB de VRAM, aunque no se dispone de una cifra oficial.
- **GPU recomendadas:** cualquier GPU con al menos 4 GB de VRAM es suficiente; se documenta el entrenamiento con `--policy.device=cuda`, por lo que se asume una GPU NVIDIA. Para entrenamiento se recomienda una RTX 3060/4060 o superior.
- **GPU de consumo:** sí cabe en tarjetas de consumo, incluidas GTX 1660, RTX 2060, RTX 3060, RTX 4060 y superiores.
- **Despliegue:** `lerobot-rollout` con `--strategy.type=base`, robot `ufactory_lite6_sim_hybrid_wp` y dos cámaras OpenCV. No se documenta soporte para vLLM, llama.cpp, Ollama o TGI, que no aplican a este tipo de política.
- **Latencia y throughput:** no disponibles; dependen del hardware y de la frecuencia de control del robot (los datos se registraron a 20 FPS).

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye otros modelos comparables de la misma categoría con datos verificables de parámetros, contexto, rendimiento o licencia.

## Limitaciones y advertencias

- **Tarea única:** la política está entrenada exclusivamente para «Pick up the red cube and place it on the blue square»; no generaliza a otras tareas sin reentrenamiento.
- **Entorno simulado:** el tipo de robot es `ufactory_lite6_sim_hybrid_wp`, una variante simulada; el traslado a un Lite 6 físico puede requerir recalibración o ajuste fino.
- **Dependencia de las cámaras:** las cámaras deben llamarse `overhead` y `wrist` y respetar la resolución 3×240×320; cualquier cambio de montaje, iluminación o posición altera el rendimiento.
- **Sin evaluación publicada:** no hay tasas de éxito ni pruebas en robot real, por lo que no se puede afirmar su fiabilidad en producción.
- **Licencia no declarada:** la model card indica «More Information Needed»; el uso comercial queda sin autorización explícita y requiere contactar con el autor.
- **Riesgo de sobreajuste:** 800 episodios de una sola tarea y semilla fija (1000) limitan la diversidad; es probable que la política sea frágil ante distracciones o posiciones de objeto no vistas.
- **Sin sesgos ni alucinaciones en sentido lingüístico:** al no ser un modelo de lenguaje, no aplican sesgos textuales, pero sí pueden aparecer fallos de percepción visual (confundir el cubo con otros objetos rojos).
- **Repo pequeño y sin actividad:** 0 descargas y 0 likes indican ausencia de validación por la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/nberezny/act_lite6_nudge_wp
- Dataset de entrenamiento: https://huggingface.co/datasets/nberezny/lite6_pick_place_nudge_wp
- Visualización del dataset: https://huggingface.co/spaces/lerobot/visualize_dataset?path=nberezny/lite6_pick_place_nudge_wp
- Paper de ACT: https://huggingface.co/papers/2304.13705
- Guía de ACT en LeRobot: https://huggingface.co/docs/lerobot/main/en/act
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Instalación de LeRobot: https://huggingface.co/docs/lerobot/main/en/installation
- Guía de hardware: https://huggingface.co/docs/lerobot/main/en/hardware_guide
- Registro de datos y entrenamiento de políticas: https://huggingface.co/docs/lerobot/en/il_robots
- Referencia rápida de comandos: https://huggingface.co/docs/lerobot/main/en/cheat-sheet
- Documentación de inferencia (rollout): https://huggingface.co/docs/lerobot/main/en/inference
- Repositorio LeRobot: https://github.com/huggingface/lerobot
