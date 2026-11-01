# fecasado/gfm-kitchen-pan-fpv

## Resumen

`fecasado/gfm-kitchen-pan-fpv` es una política robótica (no un modelo de lenguaje) entrenada con LeRobot y publicada en Hugging Face por el usuario `fecasado`. El identificador interno del modelo es `gaze_flow_matching`, lo que sugiere una política de imitación basada en flow matching con una componente de atención guiada por la mirada (gaze) del operador. El modelo resuelve una tarea concreta de manipulación en cocina: sostener y manipular una sartén sobre una placa de cocción, a partir de observaciones de cámara en primera persona (FPV) a resolución 320x240.

El modelo tiene 75.248.330 parámetros (unos 75,2 millones) almacenados en formato safetensors, con un repositorio de 0,3 GB. Se distribuye bajo licencia Apache 2.0 y está pensado para ejecutarse con el stack LeRobot sobre robots tipo SO-100 (el ejemplo de la model card usa `so100_follower`). Es relevante ahora porque forma parte de la ola de políticas de imitación ligeras, entrenadas sobre datasets pequeños y específicos, que pueden desplegarse en hardware de consumo y servir como base para reproducir experimentos de aprendizaje por imitación en robótica de escritorio.

La información pública disponible es escasa: la model card es una plantilla sin rellenar más allá de la licencia y los comandos de entrenamiento y evaluación. No hay datos publicados sobre arquitectura interna, composición del dataset, benchmarks ni requisitos de hardware específicos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Política de imitación robótica con flow matching y atención guiada por mirada (según el nombre `gaze_flow_matching`); detalles internos no disponibles |
| Parametros totales | 75.248.330 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (no es un modelo de lenguaje; procesa observaciones por paso) |
| Tipos de cuantizacion | No disponible (pesos en safetensors sin cuantización publicada) |
| Idiomas soportados | No disponible (modelo de robótica, sin capacidades lingüísticas) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |
| Librería | LeRobot |
| Pipeline | Robotics |
| Dataset de entrenamiento | `fecasado/pan-on-hob-320x240` |
| Tamaño del repositorio | 0,3 GB |

## Arquitectura y entrenamiento

El nombre del modelo, `gaze_flow_matching`, apunta a una política de imitación que combina flow matching (un método generativo de transporte de probabilidad usado en políticas robóticas recientes para modelar distribuciones multimodales de acciones) con una señal de mirada del operador que guía la atención del modelo. Sin embargo, la model card no documenta la arquitectura con detalle: no se especifican el backbone visual, el encoder de acciones, el número de capas ni la configuración del módulo de gaze. La etiqueta `lerobot` confirma que se entrenó y publicó con el framework LeRobot de Hugging Face.

El entrenamiento se realizó sobre el dataset `fecasado/pan-on-hob-320x240`, que por su nombre corresponde a episodios de demostración de la tarea de manipular una sartén sobre una placa, con imágenes a 320x240 píxeles. No se dispone de información sobre número de episodios, horas de demostración, composición del dataset, uso de RLHF/DPO (improbable en una política de imitación) ni sobre ninguna innovación técnica adicional más allá de la propia combinación gaze + flow matching.

## Capacidades

- Manipulación robótica por imitación: genera trayectorias de acciones para sostener y mover una sartén sobre una placa de cocción a partir de observaciones visuales en primera persona.
- Control visomotor guiado por mirada: la señal de gaze del operador se usa como condicionamiento de la política, lo que puede mejorar la atención sobre objetos relevantes.
- Generación multimodal de acciones: el flow matching permite modelar distribuciones de acciones con múltiples modos, útil en tareas con variabilidad de ejecución.
- Entrenamiento y evaluación reproducibles con LeRobot: el flujo `lerobot-train` y `lerobot-record` está documentado en la model card.
- Integración con robots SO-100: el ejemplo de evaluación usa `robot.type=so100_follower`, un brazo robótico de bajo coste.
- No dispone de capacidades lingüísticas, tool calling, razonamiento multi-paso ni agentes: es una política de control, no un modelo generativo de texto.

## Casos de uso

- Automatización de tareas de cocina en laboratorio: la política puede ejecutar la secuencia de coger, sostener y colocar una sartén sobre una placa, lo que permite montar un banco de pruebas de manipulación doméstica con un SO-100 y una cámara FPV.
- Reproducción de experimentos de imitación: investigadores pueden reentrenar o afinar la política con `lerobot-train` sobre el dataset `pan-on-hob-320x240` para estudiar el efecto de la señal de gaze en el rendimiento de la tarea.
- Base para transferencia a tareas similares: al ser una política ligera de 75 M parámetros, puede servir como inicialización para tareas de manipulación con objetos planos y superficies calientes, ajustando el dataset.
- Evaluación de políticas en simulador o en robot real: el comando `lerobot-record` permite desplegar la política y grabar episodios de evaluación con prefijo `eval_`, facilitando la comparación con otras políticas del mismo dataset.
- Docencia y demostraciones de robótica de escritorio: el tamaño reducido del repositorio (0,3 GB) y el soporte de LeRobot permiten usarlo en talleres con hardware asequible.
- Estudio de atención guiada por mirada: el modelo puede usarse como caso de estudio para analizar cómo la señal de gaze condiciona la política en tareas de precisión, comparándolo con variantes sin gaze.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con 75,2 M parámetros en safetensors (probablemente fp32 o bf16), el peso ocupa entre 0,15 y 0,3 GB; la inferencia completa con buffers visuales requiere típicamente menos de 2 GB de VRAM, aunque no hay medición publicada.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM debería ser suficiente para inferencia; para entrenamiento se recomienda una GPU con 8-16 GB (RTX 3060/4070, RTX 4090, A100) según el tamaño del lote y la resolución de las observaciones.
- Cabe en GPU de consumo: sí, previsiblemente en GTX 1650, RTX 3050, RTX 4060 y superiores; no hay confirmación oficial.
- Opciones de despliegue: LeRobot (`lerobot-record` con `--policy.path`), con soporte de PyTorch en CUDA; no se documenta compatibilidad con vLLM, llama.cpp, Ollama o TGI, que no aplican a políticas robóticas.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto / observación | Licencia | Disponibilidad |
|---|---|---|---|---|
| `fecasado/gfm-kitchen-pan-fpv` | 75,2 M | Imágenes FPV 320x240 | Apache 2.0 | Hugging Face, LeRobot |
| Políticas ACT de LeRobot (referencia del framework) | Variable, típicamente decenas de millones | Imágenes de robot | Apache 2.0 | Hugging Face, LeRobot |
| Políticas de difusión para manipulación (por ejemplo, Diffusion Policy) | Variable | Imágenes multi-cámara | Según implementación | Repositorios de investigación |

No se dispone de datos de rendimiento comparables publicados para este modelo, por lo que la comparativa se limita a parámetros, licencia y disponibilidad. Las alternativas citadas son referencias genéricas del ecosistema LeRobot y de políticas de imitación, no modelos con benchmarks directamente comparables en esta ficha.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados; al entrenarse sobre un dataset específico de una tarea y probablemente un único entorno, la política puede sobreajustarse a condiciones de iluminación, posición de cámara y disposición de la cocina del dataset.
- Riesgo de alucinación: no aplica en el sentido lingüístico, pero la política puede generar acciones incorrectas o inseguras fuera de la distribución de entrenamiento, especialmente cerca de una placa caliente.
- Limitaciones de contexto o idioma: no es un modelo de lenguaje; no procesa texto ni mantiene contexto conversacional. La observación se limita a imágenes de 320x240 y al tipo de robot usado en el dataset.
- Restricciones de licencia: Apache 2.0 permite uso comercial y modificación con atribución y aviso de cambios; no hay restricciones adicionales documentadas.
- Caveats para producción: la model card es una plantilla incompleta y no documenta la arquitectura, el dataset ni las métricas; no hay garantías de seguridad para operar cerca de superficies calientes; se recomienda validación exhaustiva en el robot objetivo antes de cualquier despliegue real.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/fecasado/gfm-kitchen-pan-fpv
- Dataset de entrenamiento: https://huggingface.co/datasets/fecasado/pan-on-hob-320x240
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Guía de entrenamiento de políticas: https://huggingface.co/docs/lerobot/il_robots#train-a-policy
- Repositorio LeRobot: https://github.com/huggingface/lerobot
