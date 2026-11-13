# lair-nyu/pi05_handoff_yor_holdout-step19999

## Resumen

`pi05_handoff_yor_holdout-step19999` es un checkpoint de política robótica (policy) derivado de pi05, el modelo de visión-lenguaje-acción (VLA) de Physical Intelligence, publicado por el grupo lair-nyu en Hugging Face. No es un modelo de lenguaje generalista, sino un modelo de control para manipulación robótica que toma observaciones visuales y consignas en lenguaje natural y emite acciones motoras. El checkpoint corresponde al paso 19 999 de un ajuste fino de 20 000 pasos sobre datos de "handoff" del conjunto YOR, con episodios reservados (held-out) para evaluación.

El modelo se ha entrenado con el framework `multi-agent-r2s2r` sobre el código base de `openpi`, y solo se distribuyen los pesos (`params/`), las estadísticas de normalización (`assets/norm_stats.json`) y metadatos del checkpoint; el estado del optimizador (`train_state/`) se ha eliminado. El repositorio ocupa 12,4 GB, lo que es coherente con un modelo VLA de varios miles de millones de parámetros en precisión completa.

Su relevancia es acotada y muy específica: se trata de un artefacto de investigación reproducible para experimentos de aprendizaje por imitación en robótica, no de un modelo listo para producción. La model card no aporta información sobre arquitectura detallada, licencia, idiomas ni benchmarks, por lo que muchos campos de esta ficha quedan como "no disponible".

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VLA (vision-language-action) basada en pi05; detalles internos no disponibles |
| Parametros totales | no disponible (repo de 12,4 GB, coherente con un modelo de varios miles de millones de parametros) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (las consignas se infieren del dataset de entrenamiento, no declarado) |
| Licencia | no disponible |
| Formato de pesos | pesos en `params/` (formato nativo de openpi, presumiblemente safetensors), mas `assets/norm_stats.json` y `_CHECKPOINT_METADATA` |

## Arquitectura y entrenamiento

El modelo es un ajuste fino de pi05, la familia de políticas VLA de Physical Intelligence que combina un backbone de visión-lenguaje con un cabezal de acciones (action expert) para generar trayectorias motoras condicionadas por imágenes y texto. La model card no detalla el número de parámetros, la composición del backbone ni la longitud de contexto visual/textual, por lo que esos datos deben consultarse en la documentación de openpi y en el paper de pi05.

El entrenamiento se realizó con el repositorio `multi-agent-r2s2r`, configuración `configs/pi05_handoff_yor_holdout.py` (commit `fb25fc6e6edc3bc54c140f6b17ae5f2821d05685`), sobre openpi en el commit `c5efff14d4ea36a09a0b365cd0dc60a527027b73 (dirty)`. Se ejecutaron 20 000 pasos sobre datos de handoff del conjunto YOR con episodios reservados. El repositorio incluye `subtask_summary.json`, que documenta las subtareas de entrenamiento, el número de chunks, las proporciones de muestras y los episodios held-out. No se declara uso de RLHF, DPO ni decodificación especulativa; el paradigma es aprendizaje por imitación supervisado sobre demostraciones.

## Capacidades

- Control robótico de manipulación: genera acciones motoras a partir de observaciones visuales y consignas en lenguaje natural, en el marco de pi05.
- Ejecución de tareas de handoff (transferencia de objetos entre efectores o agentes), que es el dominio específico del ajuste fino.
- Condicionamiento multimodal: integra entrada visual y textual para producir la acción, propio de la arquitectura VLA.
- Soporte de tool calling / function calling: no disponible (no es un modelo conversacional).
- Soporte de agentes y razonamiento multi-paso: no disponible como capacidad declarada; el modelo opera dentro de un bucle de control, no como agente de lenguaje.
- Capacidades multilingües: no disponible.
- Capacidades especiales: checkpoint intermedio (paso 19 999 de 20 000) con episodios held-out para evaluación de generalización.

## Casos de uso

- Investigación en aprendizaje por imitación: reproducir el experimento de handoff con la configuración `pi05_handoff_yor_holdout` y comparar el rendimiento en los episodios held-out frente a otros checkpoints de la misma serie.
- Evaluación de generalización: usar los episodios reservados documentados en `subtask_summary.json` para medir la capacidad del modelo de transferir a trayectorias no vistas.
- Base para ajuste fino adicional: al incluir solo `params/` y `norm_stats.json`, sirve como inicialización para nuevos experimentos sobre el mismo dominio YOR.
- Benchmarking interno de políticas VLA: comparar este checkpoint con otras variantes pi05 entrenadas por el mismo grupo bajo condiciones controladas.
- Estudio de estabilidad de entrenamiento: analizar el comportamiento en el paso 19 999 frente a checkpoints anteriores o posteriores de la misma ejecución.
- Docencia y divulgación: ejemplo reproducible de pipeline openpi + multi-agent-r2s2r para cursos de robótica basada en aprendizaje.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible con precisión; el repo de 12,4 GB sugiere que los pesos en precisión completa requieren al menos ~12-13 GB solo para almacenamiento, más memoria para activaciones y observaciones visuales.
- GPU recomendadas: no declaradas por el autor; por tamaño, previsiblemente A100 40/80 GB, H100 o L40S para inferencia cómoda.
- ¿Cabe en consumer GPU? No confirmado. Una RTX 4090 (24 GB) podría alojar los pesos, pero la viabilidad depende del framework openpi y de las activaciones, no documentadas.
- Opciones de despliegue: `openpi` con la configuración de `multi-agent-r2s2r`; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI (no aplicables a un modelo de acciones).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| pi05_handoff_yor_holdout-step19999 | no disponible | no disponible | no disponible | Hugging Face (lair-nyu) |
| pi05 base (Physical Intelligence) | no disponible | no disponible | no disponible en esta ficha | Referencia de openpi |
| Otras políticas VLA (p. ej. OpenVLA, RT-2) | no disponible en esta ficha | no disponible | no disponible | no disponible |

No se dispone de datos comparativos verificados en la información proporcionada; la comparación cuantitativa con alternativas queda como no disponible.

## Limitaciones y advertencias

- Dominio muy restringido: entrenado específicamente para handoff en el conjunto YOR; no es un modelo generalista.
- Sin licencia declarada: no se puede asumir uso comercial; verificar con los autores antes de cualquier despliegue.
- Idiomas no declarados: no se puede garantizar el comportamiento ante consignas en castellano u otros idiomas.
- Riesgo de sobreajuste al conjunto de entrenamiento: es un checkpoint de paso 19 999 de 20 000, sin métricas publicadas de validación.
- Carga no trivial: requiere el checkout de `multi-agent-r2s2r` y la configuración de entrenamiento; no funciona con `transformers` estándar.
- Estado del optimizador eliminado: no se puede reanudar el entrenamiento desde este repo, solo inferencia o inicialización.
- Sin benchmarks: no hay evidencia publicada de rendimiento frente a alternativas.
- Posible alucinación en el sentido de acciones no válidas o inseguras en entornos reales; no se documentan salvaguardas.

## Enlaces

- Hugging Face: https://huggingface.co/lair-nyu/pi05_handoff_yor_holdout-step19999
- Repositorio de entrenamiento: https://github.com/LucaMacesanu/multi-agent-r2s2r
- OpenPI (código base): https://github.com/Physical-Intelligence/openpi
