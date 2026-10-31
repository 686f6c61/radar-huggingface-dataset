# miniFranka/agentic-wam-posttrain-robotwin-suit

## Resumen

AgenticWAM RoboTwin es un conjunto de modelos de robótica publicado por la organización miniFranka en Hugging Face, correspondiente al proyecto agentic-wam (World Action Model). Se trata de pesos post-entrenados para el benchmark de manipulación robótica RoboTwin, orientados a tareas de manipulación bimanual con brazos de 14 grados de libertad (acciones articulares absolutas). El repositorio incluye dos variantes: un modelo WAM puro, que actúa como cabeza de acción directa, y un modelo híbrido que combina generación de código con fallback al WAM cuando el código generado no es suficiente para completar la tarea.

La relevancia de este lanzamiento radica en la tendencia actual de los world models agénticos aplicados a robótica: en lugar de aprender políticas end-to-end puras, el enfoque híbrido delega en un agente de código la planificación de subtareas y recurre al modelo de acción (WAM) como mecanismo de respaldo robusto. Esto permite mayor interpretabilidad y generalización a tareas compuestas, manteniendo la fiabilidad de las políticas entrenadas por imitación.

El sistema no es un modelo único sino un stack: se apoya en componentes públicos como Wan2.2-TI2V-5B (VAE para vídeo), Cosmos-Reason1-7B de NVIDIA (razonamiento visual), SDAR-1.7B-Chat y Qwen3-VL-2B-Instruct, además de Molmo, SAM3 y Contact-GraspNet para la variante híbrida. El repositorio pesa aproximadamente 19,9 GB y se distribuye bajo licencia BSD-2-Clause.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | World Action Model (WAM) con cabeza de acción; variante híbrida código + WAM fallback |
| Parámetros totales | no disponible (repo de 19,9 GB; usa componentes externos Wan2.2-TI2V-5B, Cosmos-Reason1-7B, SDAR-1.7B-Chat, Qwen3-VL-2B-Instruct) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible |
| Idiomas soportados | inglés (prompts e instrucciones) |
| Licencia | BSD-2-Clause |
| Formato de pesos | PyTorch (.pt): `wam.pt` y `hybrid.pt`; incluye `dataset_stats.json` y `task_skill_prompt.json` |

## Arquitectura y entrenamiento

El sistema se organiza en torno a un World Action Model cuya cabeza de acción (`wam.pt`) genera acciones articulares absolutas de 14 dimensiones a partir de la observación de tres cámaras. La variante híbrida (`hybrid.pt`) añade una capa agéntica: un agente genera programas de tarea (los programas predefinidos se incluyen en `configs/robotwin/tasks_indep/`) que orquestan la manipulación, y si el código no alcanza el objetivo, se recurre al WAM como política de respaldo. La percepción del modo híbrido se apoya en Molmo, SAM3 y Contact-GraspNet para detección, segmentación y estimación de puntos de agarre.

Sobre el proceso de entrenamiento no se han publicado detalles: no consta el número de tokens, la composición exacta del dataset ni el uso de técnicas concretas de post-entrenamiento. El nombre del repositorio («posttrain-robotwin») indica que los pesos son fruto de un post-entrenamiento sobre tareas del benchmark RoboTwin, y `dataset_stats.json` sugiere normalización de acciones derivada del dataset de entrenamiento. No se dispone de información sobre RLHF/DPO ni otras innovaciones técnicas documentadas más allá de la arquitectura agéntica descrita.

## Capacidades

- Generación de acciones de manipulación robótica: acciones articulares absolutas de 14 dimensiones para brazos duales.
- Percepción multi-cámara: procesa simultáneamente tres flujos de cámara como entrada del modelo de acción.
- Planificación agéntica mediante generación de código (variante híbrida), con programas de tarea editables por el usuario.
- Fallback a política aprendida (WAM) cuando la ejecución basada en código no completa la tarea.
- Razonamiento visual apoyado en componentes externos: Cosmos-Reason1-7B, Qwen3-VL-2B-Instruct y Molmo.
- Segmentación y estimación de agarre mediante SAM3 y Contact-GraspNet en la variante híbrida.
- Evaluación reproducible sobre el benchmark RoboTwin de 50 tareas, con informes reanudables y generación de vídeos de los episodios.
- No es un modelo de lenguaje general: no genera texto conversacional ni código de propósito general.

## Casos de uso

- Investigación en manipulación bimanual: evaluación y comparación de políticas sobre el benchmark RoboTwin de 50 tareas, con scripts de evaluación listos (`scripts/eval_robotwin_release.py`) y configuraciones limpias/aleatorizadas.
- Estudio de arquitecturas agénticas híbridas: análisis del compromiso entre planificación por código y políticas aprendidas, usando el fallback al WAM como objeto de estudio.
- Simulación con planificación de movimiento: integración con cuRobo y Vulkan para generar trayectorias articulares seguras en escenas simuladas con activos de robot y objetos.
- Prototipado de tareas compuestas: los programas de tarea en `configs/robotwin/tasks_indep/` permiten definir nuevas tareas por código apoyándose en el WAM para las primitivas de manipulación.
- Benchmarking reproducible de hardware y software: los informes reanudables bajo `evaluate_results/` y el `manifest.json` con checksums facilitan la comparación de resultados entre máquinas.
- Generación de datasets visuales: el modo `--render` guarda vídeos de los episodios, útil para análisis cualitativo y depuración de políticas.
- Base para transferencia a hardware real: el uso de acciones articulares absolutas de 14 dimensiones y tres cámaras es compatible con configuraciones de brazos duales tipo Franka, aunque la model card no documenta despliegue en robot físico.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica únicamente que ambos modelos superaron la evaluación de humo (smoke evaluation) en configuraciones limpia y aleatorizada para la tarea `click_alarmclock`, con un episodio por configuración. No se proporcionan tasas de éxito sobre las 50 tareas completas de RoboTwin ni comparaciones con otras políticas.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El repo pesa 19,9 GB y el stack completo incluye varios modelos auxiliares (Wan2.2 VAE, Cosmos-Reason1-7B, SDAR-1.7B-Chat, Qwen3-VL-2B-Instruct), por lo que se recomienda disponer de varias GPU.
- GPU recomendadas: no disponible explícitamente. Los scripts de evaluación aceptan `--gpus` para la política y `--vis-gpu` para la percepción, y la documentación aconseja mantener política y percepción en GPU separadas en ejecuciones multi-episodio; esto sugiere entornos multi-GPU (tipo A100, H100 o varias GPU de consumo de gama alta).
- Cabe en GPU de consumo: no disponible; dado el tamaño del repo y el número de componentes, es improbable que quepa en una única GPU de consumo.
- Opciones de despliegue: despliegue propio mediante el repositorio de código agentic-wam (PyTorch), con dependencias de RoboTwin, cuRobo, Vulkan y los activos de robot/objetos. No hay soporte documentado para vLLM, llama.cpp, Ollama o TGI, ya que no es un modelo de lenguaje convencional.
- Latencia y throughput: no disponible.
- Instalación guiada: la documentación de instalación está en https://github.com/ZhuoyangLiu2005/agentic-wam/blob/main/docs/INSTALL.md y la guía de RoboTwin en https://github.com/ZhuoyangLiu2005/agentic-wam/blob/main/docs/ROBOTWIN.md.

## Comparativa con modelos similares

| Modelo | Tipo | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|
| miniFranka/agentic-wam-posttrain-robotwin-suit | World Action Model agéntico (WAM + híbrido código) | Manipulación bimanual en RoboTwin | BSD-2-Clause | Pesos públicos en Hugging Face + código en GitHub |
| π0 (Physical Intelligence) | VLA (vision-language-action) | Manipulación robótica general | Restringida / no abierta | Pesos no liberados públicamente |
| OpenVLA | VLA de 7B basado en LLM | Manipulación con instrucciones de lenguaje | MIT | Pesos públicos en Hugging Face |
| GR00T N1 (NVIDIA) | Foundation model humanoid dual-system | Manipulación y locomoción humanoide | Abierta (licencia NVIDIA) | Pesos públicos en Hugging Face |

A diferencia de los VLA monolíticos como OpenVLA, que mapean directamente observación e instrucción a acción, agentic-wam introduce una capa de planificación por código con fallback a política, lo que favorece tareas compuestas a costa de una mayor complejidad de despliegue (más componentes y dependencias de simulación).

## Limitaciones y advertencias

- Sesgos conocidos: no disponible. Al tratarse de un modelo entrenado sobre RoboTwin, su rendimiento está ligado a la distribución de tareas, objetos y cámaras de ese benchmark; la generalización a escenas o sensores distintos no está documentada.
- Riesgo de alucinación: no aplicable en el sentido de LLM, pero la variante híbrida depende de la correcta generación de código y de la percepción (Molmo, SAM3, Contact-GraspNet); errores de percepción pueden propagarse a la planificación.
- Limitaciones de idioma: los prompts e instrucciones (`task_skill_prompt.json`) están en inglés; no hay soporte documentado para otros idiomas.
- Limitaciones de contexto: no disponible.
- Restricciones de licencia: BSD-2-Clause es muy permisiva y permite uso comercial con atribución; sin embargo, los componentes externos (Wan2.2, Cosmos-Reason1, Qwen3-VL, Molmo, SAM3, Contact-GraspNet) tienen sus propias licencias, que deben revisarse individualmente antes de un despliegue comercial.
- Caveats de producción: el modelo está validado solo en simulación (RoboTwin con cuRobo y Vulkan); no hay evidencia pública de transferencia a robot físico. La validación publicada se limita a una evaluación de humo en una tarea (`click_alarmclock`), por lo que el rendimiento en las 50 tareas completas debe verificarse de forma independiente. La descargas registradas (0) y el estado muy reciente del repositorio indican poca madurez y comunidad limitada.
- Requiere una configuración de entorno compleja (RoboTwin, cuRobo, Vulkan, activos, rutas en `site.yaml`), lo que eleva la barrera de entrada frente a modelos autocontenidos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/miniFranka/agentic-wam-posttrain-robotwin-suit
- Repositorio de código agentic-wam: https://github.com/ZhuoyangLiu2005/agentic-wam
- Guía de instalación: https://github.com/ZhuoyangLiu2005/agentic-wam/blob/main/docs/INSTALL.md
- Guía de RoboTwin: https://github.com/ZhuoyangLiu2005/agentic-wam/blob/main/docs/ROBOTWIN.md
- Setup de la variante híbrida (Molmo, SAM3, Contact-GraspNet): https://github.com/ZhuoyangLiu2005/agentic-wam/blob/main/codegen/sim/SETUP.md
- Componentes externos:
  - Wan-AI/Wan2.2-TI2V-5B: https://huggingface.co/Wan-AI/Wan2.2-TI2V-5B
  - nvidia/Cosmos-Reason1-7B: https://huggingface.co/nvidia/Cosmos-Reason1-7B
  - JetLM/SDAR-1.7B-Chat: https://huggingface.co/JetLM/SDAR-1.7B-Chat
  - Qwen/Qwen3-VL-2B-Instruct: https://huggingface.co/Qwen/Qwen3-VL-2B-Instruct
