# lair-nyu/pi05_handoff_yor_ultra-step19999

## Resumen

pi05_handoff_yor_ultra-step19999 es un checkpoint de robótica basado en la arquitectura pi05 (physical intelligence 0.5) de Physical Intelligence, publicado por el grupo lair-nyu. No es un modelo de lenguaje generalista, sino una política de control robótico entrenada para ejecutar tareas de manipulación a partir de instrucciones y observaciones visuales. El checkpoint corresponde al paso 19999 de un entrenamiento de 20 000 pasos denominado internamente "c1_v1 (C1)".

El modelo se ha co-entrenado con dos conjuntos de datos de "handoff" (transferencia de objetos entre agentes o entre humano y robot): datos YOR y datos Ultra, con una proporción del 30 % para Ultra. Se ha entrenado con el framework multi-agent-r2s2r, una extensión de openpi de Physical Intelligence, sobre un commit concreto de openpi. El repositorio incluye únicamente los pesos (`params/`), las estadísticas de normalización (`assets/norm_stats.json`) y metadatos del checkpoint; el estado del optimizador se ha eliminado, por lo que no sirve para reanudar el entrenamiento.

Es relevante porque los checkpoints pi05 son una de las bases abiertas más utilizadas para investigación en manipulación robótica con modelos visión-lenguaje-acción (VLA), y este checkpoint concreto documenta una receta de co-entrenamiento entre dos dominios de datos que puede interesar a quien investigue transferencia entre tareas de handoff. La información pública es muy escasa: no hay model card descriptiva, benchmarks ni licencia declarada.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | pi05 (vision-language-action, VLA), framework openpi |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo de robótica, no de texto general) |
| Licencia | no disponible |
| Formato de pesos | pesos openpi (`params/`), estadísticas en `assets/norm_stats.json`; tamaño del repo 12,4 GB |

## Arquitectura y entrenamiento

El checkpoint se basa en pi05, la familia de políticas VLA de Physical Intelligence integrada en el framework openpi. La arquitectura exacta (número de parámetros, tipo de backbone, mecanismo de atención) no se detalla en la información disponible; la carga requiere el config de entrenamiento `configs/pi05_handoff_yor_ultra.py` del repositorio multi-agent-r2s2r, que aporta la definición de arquitectura y las transformaciones de datos. Sin ese config no es posible reconstruir el modelo a partir de los pesos.

El entrenamiento se realizó durante 20 000 pasos (este checkpoint es el paso 19 999) sobre una mezcla de datos YOR handoff y Ultra handoff con un 30 % de peso para Ultra. El repositorio incluye `subtask_summary.json`, que documenta las subtareas de entrenamiento, recuentos de chunks, proporciones de muestras y episodios reservados (held-out). Se desconoce el número total de tokens o frames, la composición exacta del dataset y si hubo etapas de RLHF o DPO; en robótica VLA es habitual el entrenamiento supervisado por imitación (behavior cloning), pero no se confirma en la información disponible.

## Capacidades

- Control robótico de manipulación: genera acciones motrices a partir de observaciones visuales e instrucciones de tarea, en el paradigma visión-lenguaje-acción de pi05.
- Ejecución de tareas de handoff (transferencia de objetos) en los dominios YOR y Ultra.
- Co-entrenamiento multi-dominio: la mezcla 70/30 entre YOR y Ultra busca generalizar entre ambos entornos de handoff.
- Integración con openpi: se carga mediante `policy_config.create_trained_policy` con el config de multi-agent-r2s2r.
- No se documentan capacidades de tool calling, agentes multi-paso, multilingüismo, visión general, audio ni modo thinking; es un modelo específico de robótica.

## Casos de uso

- Investigación en transferencia entre dominios de handoff: comparar el rendimiento con el 30 % de Ultra frente a un entrenamiento solo con YOR para medir el efecto del co-entrenamiento.
- Reproducción de experimentos: el checkpoint y el config asociado permiten reproducir la receta c1_v1 y evaluar sobre los episodios held-out listados en `subtask_summary.json`.
- Punto de partida para fine-tuning: los pesos pueden servir como inicialización para nuevas tareas de manipulación con datos propios, aunque requeriría el config de arquitectura de multi-agent-r2s2r.
- Evaluación de políticas VLA en simulación o en banco físico: desplegar la política para medir tasas de éxito en tareas de entrega de objetos.
- Estudio de robustez ante variaciones de escena: al haberse entrenado con dos fuentes de datos, es adecuado para analizar sensibilidad a cambios de entorno.
- Baseline en comparativas de políticas robóticas: útil como referencia frente a otros checkpoints pi05 u otras arquitecturas VLA en tareas de handoff.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El tamaño del repo (12,4 GB) sugiere pesos en precisión mixta o bf16, pero no se confirma el número de parámetros ni el consumo real.
- GPU recomendadas: no disponible. Por el tamaño de los pesos, es probable que requiera GPUs de datacenter (A100, H100) o consumer de gama alta (RTX 4090, 24 GB), pero no hay confirmación.
- ¿Cabe en consumer GPU? No disponible.
- Opciones de despliegue: openpi con el config de multi-agent-r2s2r; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI (son herramientas de LLM, no aplicables directamente a políticas VLA).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Base | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| pi05_handoff_yor_ultra-step19999 | pi05 / openpi | no disponible | no disponible | Hugging Face (lair-nyu) |
| pi05 base (Physical Intelligence) | pi05 | no disponible | no disponible | openpi |
| Otros checkpoints pi05 en openpi | pi05 | no disponible | no disponible | Hugging Face / openpi |

No se dispone de datos de rendimiento ni de especificaciones detalladas de los modelos comparables en la información proporcionada.

## Limitaciones y advertencias

- Licencia no declarada: no se puede asumir uso comercial; contactar con el autor antes de cualquier despliegue en producción.
- Model card mínima: no hay descripción de arquitectura, datos, métricas ni limitaciones, lo que dificulta evaluar su idoneidad.
- Dependencia fuerte del config de entrenamiento: sin `configs/pi05_handoff_yor_ultra.py` de multi-agent-r2s2r (commit `fb25fc6e`), los pesos no se pueden cargar.
- Estado del optimizador eliminado: no es posible reanudar el entrenamiento desde este checkpoint.
- Especialización estrecha: entrenado para tareas de handoff en los dominios YOR y Ultra; no es un modelo generalista ni un LLM.
- Riesgo de sobreajuste a los entornos de entrenamiento y de fallo ante cambios de iluminación, objetos o cámaras no vistos.
- Sin benchmarks ni validación externa publicada: el rendimiento real es desconocido.
- Fecha de creación futura (2026-11-13) en los metadatos: verificar la integridad y procedencia del repositorio.

## Enlaces

- Hugging Face: https://huggingface.co/lair-nyu/pi05_handoff_yor_ultra-step19999
- Repositorio multi-agent-r2s2r: https://github.com/LucaMacesanu/multi-agent-r2s2r
- openpi (Physical Intelligence): no disponible en la información proporcionada
- Paper de pi05: no disponible en la información proporcionada
