# lair-nyu/pi05_handoff_yor_nobase-step19999

## Resumen

pi05_handoff_yor_nobase-step19999 es un checkpoint de robótica basado en la arquitectura pi05 (Physical Intelligence), publicado por el laboratorio lair-nyu. Se trata de un fine-tuning de pi05 sobre el conjunto completo de datos de handoff de YOR, sin holdout y sin comando base, entrenado durante 20 000 pasos. El modelo se distribuye a través de la librería openpi y está etiquetado como pipeline de robótica, lo que lo orienta a la generación de acciones motoras para control de robots manipuladores.

El repositorio contiene exclusivamente los pesos del modelo (`params/`), las estadísticas de normalización (`assets/norm_stats.json`) y un fichero de metadatos del checkpoint (`_CHECKPOINT_METADATA`). El estado del optimizador (`train_state/`) se ha eliminado, por lo que no es posible reanudar el entrenamiento directamente desde este snapshot. Además, se incluye `subtask_summary.json` con la lista de subtareas de entrenamiento, recuento de chunks, proporción de muestras y episodios reservados.

Su relevancia radica en que documenta un experimento reproducible de transferencia de habilidades de handoff (entrega de objetos entre humano y robot o entre efectores) sobre pi05, con configuración de entrenamiento y commits exactos identificados. No obstante, la información pública es muy escasa: no hay benchmarks, licencia ni idiomas declarados, y el modelo requiere una configuración de entrenamiento externa para cargarse.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | pi05 (modelo de política para robótica, librería openpi) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | pesos propietarios de openpi (`params/`), más `norm_stats.json` en `assets/` |

## Arquitectura y entrenamiento

El modelo parte de la arquitectura pi05, un modelo de política visomotora orientado a robótica que se distribuye mediante la librería openpi. El checkpoint corresponde a un fine-tuning sobre el conjunto completo de datos de handoff de YOR, sin episodios de validación reservados (no holdout) y sin comando base, durante 20 000 pasos de entrenamiento. La configuración utilizada es `configs/pi05_handoff_yor_nobase.py` del repositorio multi-agent-r2s2r, en el commit `fb25fc6e6edc3bc54c140f6b17ae5f2821d05685`, sobre openpi en el commit `c5efff14d4ea36a09a0b365cd0dc60a527027b73 (dirty)`.

No se dispone de información sobre el número de tokens, la composición del dataset, ni sobre si se aplicaron técnicas de RLHF, DPO o decodificación especulativa. El fichero `subtask_summary.json` incluido en el repo contiene los detalles de subtareas, chunks y proporciones de muestras, pero su contenido no está disponible en la información proporcionada. La carga del modelo exige la configuración de entrenamiento de multi-agent-r2s2r, que aporta la arquitectura y las transformaciones de datos.

## Capacidades

- Generación de acciones motoras para tareas de manipulación robótica, en particular handoff (entrega de objetos).
- Fine-tuning específico sobre datos de handoff de YOR, orientado a políticas de control.
- Integración con el ecosistema openpi para carga y despliegue de políticas entrenadas.
- No se dispone de información sobre soporte de tool calling, agentes multi-paso, capacidades multilingües, visión general, audio o modos de razonamiento explícito.

## Casos de uso

- Transferencia de objetos entre humano y robot: el modelo se entrena sobre datos de handoff de YOR, por lo que puede emplearse para generar políticas de entrega en entornos controlados, cargándolo con la configuración de multi-agent-r2s2r.
- Investigación reproducible en robótica: al documentarse commits exactos y configuración de entrenamiento, sirve como punto de partida para replicar o comparar experimentos de fine-tuning sobre pi05.
- Evaluación de políticas sin holdout: útil para analizar el comportamiento de un modelo entrenado sobre todos los datos disponibles, aunque requiere validación externa para medir generalización.
- Integración en pipelines openpi: puede cargarse mediante `policy_config.create_trained_policy` y desplegarse en el stack openpi para experimentos de control.
- Estudio de normalización de acciones: el fichero `assets/norm_stats.json` permite inspeccionar las estadísticas usadas para normalizar las salidas del modelo.
- Análisis de subtareas: `subtask_summary.json` facilita auditar qué subtareas, chunks y proporciones de muestras se usaron durante el entrenamiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible (el tamaño del repo es de 12,4 GB, pero no se detalla el desglose entre pesos y otros artefactos).
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: librería openpi, con carga mediante `policy_config.create_trained_policy` y la configuración de multi-agent-r2s2r; no se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No disponible. No se dispone de información sobre modelos comparables de la misma categoría (políticas robóticas pi05 con fine-tuning de handoff) en la información proporcionada.

## Limitaciones y advertencias

- No se declara licencia, por lo que el uso comercial queda sin claridad legal y debe consultarse con el autor.
- El modelo se entrenó sin holdout, lo que impide estimar su generalización a episodios no vistos a partir de este checkpoint.
- Requiere la configuración de entrenamiento de multi-agent-r2s2r para cargarse; no es autocontenido con la librería openpi estándar.
- El estado del optimizador (`train_state/`) se ha eliminado, por lo que no se puede reanudar el entrenamiento desde este snapshot.
- No hay información sobre sesgos, riesgo de alucinación ni limitaciones idiomáticas; en robótica, el riesgo principal es la ejecución de políticas fuera de distribución.
- El commit de openpi se marca como `(dirty)`, lo que puede afectar la reproducibilidad exacta del entorno de entrenamiento.
- Sin benchmarks publicados, no es posible comparar su rendimiento con alternativas de forma objetiva.

## Enlaces

- Hugging Face: https://huggingface.co/lair-nyu/pi05_handoff_yor_nobase-step19999
- Repositorio multi-agent-r2s2r: https://github.com/LucaMacesanu/multi-agent-r2s2r
- Configuración de entrenamiento: `configs/pi05_handoff_yor_nobase.py` (commit `fb25fc6e6edc3bc54c140f6b17ae5f2821d05685`) en el repo multi-agent-r2s2r
- openpi (commit `c5efff14d4ea36a09a0b365cd0dc60a527027b73`): no se proporciona URL directa en la información disponible.
