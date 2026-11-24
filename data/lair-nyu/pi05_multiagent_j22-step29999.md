# lair-nyu/pi05_multiagent_j22-step29999

## Resumen
pi05_multiagent_j22-step29999 es un checkpoint de robótica entrenado sobre la arquitectura pi05 (Physical Intelligence) y publicado por el grupo lair-nyu. Se trata de un modelo de política visomotora (vision-language-action) orientado a control de manipuladores, no de un modelo de lenguaje conversacional. El checkpoint corresponde al paso 29.999 de un entrenamiento de 30.000 pasos realizado sobre dos GPU H200 (run `multiagent_j22_v1`).

El modelo se ha entrenado sobre las tres tareas multiagente del dataset completo de 640p: entrega de cubo (cube handoff), caja (box) y cinta métrica (measuring tape), con articulaciones de 22 dimensiones. El muestreo se reparte aproximadamente un tercio por tarea y se reservan tres episodios por lista de tareas como conjunto de validación.

Su relevancia es acotada: es un artefacto de investigación reproducible (repo de 12,4 GB) que solo incluye pesos, estadísticas de normalización y metadatos, y cuya carga exige la configuración de entrenamiento de pi-atlas para reconstruir la arquitectura y las transformaciones de datos. No dispone de model card sustantiva más allá de las notas de entrenamiento, ni de licencia o idiomas declarados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | pi05 (política visomotora vision-language-action, familia openpi) |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (solo se distribuyen pesos en formato nativo) |
| Idiomas soportados | no disponible (modelo de robótica, no de texto) |
| Licencia | no disponible |
| Formato de pesos | pesos nativos openpi en `params/`, más `assets/norm_stats.json` y `_CHECKPOINT_METADATA` (sin `train_state/`) |

## Arquitectura y entrenamiento
El checkpoint sigue la arquitectura pi05 tal como la implementa la librería openpi, con la configuración `configs/pi05_multiagent_j22.py` del repositorio pi-atlas (commit `4468e502638fb5733f3d6732c1d34a2d2f6f530e`, marcado como dirty) sobre openpi en el commit `c5efff14d4ea36a09a0b365cd0dc60a527027b73` (también dirty). El modelo consume observaciones visuales y estado articular de 22 dimensiones y produce acciones de control; la configuración de pi-atlas es imprescindible para reconstruir la arquitectura y las transformaciones de datos en el momento de la carga.

El entrenamiento se realizó durante 30.000 pasos en 2 GPU H200 sobre el dataset completo de 640p, restringido a tres tareas multiagente (cube handoff, box, measuring tape), con un reparto de muestras de aproximadamente un tercio por tarea. El repositorio incluye `subtask_summary.json` con las subtareas de entrenamiento, recuento de chunks, proporción de muestras y episodios reservados. No se documenta el número de tokens, la composición detallada del dataset, ni si hubo RLHF o DPO; tampoco se describe ninguna innovación técnica adicional más allá de lo que aporta la propia arquitectura pi05.

## Capacidades
- Control visomotor de manipuladores robóticos a partir de observaciones visuales y estado articular de 22 dimensiones.
- Ejecución de tareas multiagente: entrega de cubo entre agentes, manipulación de caja y uso de cinta métrica.
- Generación de acciones de robot en el espacio articular, no de texto libre.
- Carga e inferencia mediante la API de políticas de openpi (`policy_config.create_trained_policy`).
- No se documenta soporte de tool calling, function calling, razonamiento multi-paso simbólico, capacidades multilingües ni modos de pensamiento.
- No se documentan capacidades de audio, vídeo o diálogo.

## Casos de uso
- Reproducción de experimentos de investigación en manipulación multiagente: permite replicar el run `multiagent_j22_v1` cargando el checkpoint con la configuración de pi-atlas y evaluar las tres tareas del dataset de 640p.
- Evaluación comparativa de políticas visomotoras: sirve como punto de referencia (paso 29.999) frente a checkpoints intermedios o configuraciones alternativas del mismo pipeline.
- Transferencia a tareas de entrega entre robots (cube handoff): el modelo está entrenado específicamente en la coordinación de dos agentes para el traspaso de objetos.
- Manipulación de objetos voluminosos (box): útil para estudiar estrategias de agarre y colocación con estado articular de 22 dimensiones.
- Tareas de precisión con herramientas (measuring tape): escenario de validación para medir la capacidad del modelo de manipular objetos flexibles y alargados.
- Base para fine-tuning en dominios robóticos propios: al estar construido sobre openpi y pi-atlas, puede servir de inicialización para nuevas tareas, siempre que se disponga de la configuración de entrenamiento y de datos compatibles.
- Docencia y formación en robótica de imitación: ejemplo reproducible de un pipeline completo (dataset, configuración, entrenamiento en 2x H200 y checkpoint final).

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas de éxito por tarea, tasas de acierto ni comparaciones cuantitativas; solo menciona que hay tres episodios por tarea reservados como conjunto de validación, sin reportar sus resultados.

## Requisitos de hardware
- VRAM estimada para inferencia: no disponible. El repo ocupa 12,4 GB e incluye únicamente pesos, estadísticas de normalización y metadatos; el tamaño exacto de los pesos no se detalla.
- GPU recomendadas: el entrenamiento se realizó en 2 GPU H200, lo que sugiere que la inferencia requiere GPU de centro de datos con memoria amplia (H100/H200 o A100 de 80 GB como mínimo razonable, aunque no está confirmado).
- Cabe en GPU de consumo: no disponible; no se documenta ninguna cuantización ni despliegue en RTX 4090 u otras GPU consumer.
- Opciones de despliegue: la vía documentada es openpi junto con la configuración de pi-atlas (`policy_config.create_trained_policy`). No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de política robótica.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares
No disponible. La información proporcionada no incluye otros checkpoints de la familia pi05 ni modelos de política visomotora comparables (por ejemplo, otras variantes de openpi o de la familia pi0) con los que contrastar parámetros, contexto, rendimiento o licencia. Tampoco se dispone de datos de benchmarks propios que permitan una comparación cuantitativa.

## Limitaciones y advertencias
- La licencia no está declarada; no se puede asumir uso comercial sin consultar al autor.
- Solo se distribuyen pesos, `norm_stats.json` y metadatos; el estado del optimizador (`train_state/`) se ha eliminado, por lo que no es posible reanudar el entrenamiento desde este repo.
- La carga exige la configuración de pi-atlas (`configs/pi05_multiagent_j22.py`) en un commit concreto y marcado como dirty; sin ella no se puede reconstruir la arquitectura ni las transformaciones de datos.
- El modelo está especializado en tres tareas concretas (cube handoff, box, measuring tape) con articulaciones de 22 dimensiones; no se espera generalización a otros robots, morfologías o tareas fuera de ese dominio.
- No hay métricas publicadas de éxito, robustez ni generalización; el rendimiento real en el mundo físico es desconocido.
- Riesgo de sobreajuste al dataset de 640p y a la configuración de hardware del entrenamiento (2x H200); no se documentan evaluaciones fuera de distribución.
- No se documentan sesgos, pero al ser un modelo entrenado con datos de demostración específicos, puede heredar sesgos de las trayectorias humanas registradas.
- No hay información sobre idiomas ni sobre capacidades de texto, por lo que no debe emplearse como modelo de lenguaje.

## Enlaces
- Modelo en Hugging Face: https://huggingface.co/lair-nyu/pi05_multiagent_j22-step29999
- Repositorio pi-atlas: https://github.com/LucaMacesanu/pi-atlas
- Configuración de entrenamiento: `configs/pi05_multiagent_j22.py` (commit `4468e502638fb5733f3d6732c1d34a2d2f6f530e`)
- openpi (commit de referencia `c5efff14d4ea36a09a0b365cd0dc60a527027b73`): no se proporciona URL directa en la información disponible
