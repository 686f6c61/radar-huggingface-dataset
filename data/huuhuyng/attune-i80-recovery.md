# huuhuyng/attune-i80-recovery

## Resumen

`attune-i80-recovery` es un conjunto de datos (no un modelo de lenguaje) publicado por el usuario `huuhuyng` en Hugging Face. Contiene episodios de demostración para tareas de manipulación robótica, concretamente pares de estados de "stall" (bloqueo) y sus correspondientes recuperaciones exitosas, generados a partir de la política `attune-i78-F-12000-raw`. El objetivo es entrenar o evaluar políticas de imitación capaces de recuperarse de fallos parciales en tareas de brazo robótico.

El repositorio ocupa 0,4 GB y no incluye model card estándar ni metadatos de licencia, idioma o pipeline. La información disponible se limita a la descripción técnica del autor, que detalla la construcción de los episodios: cada muestra combina el prefijo verbatim de la política base hasta el primer paso sin progreso, seguido de la ejecución completa de la tarea (`play_once`) mediante un shim (`data/i80/std_resume.py`) que evita reabrir agarres ya cerrados o cerrar manos vacías.

La relevancia es acotada: se trata de un artefacto de investigación muy específico, sin benchmarks publicados ni documentación de uso general. Es útil para quien trabaje en recuperación de fallos en políticas de imitación robótica, pero no es un modelo desplegable ni evaluable con métricas estándar de NLP.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (conjunto de datos de episodios de robótica, no un modelo) |
| Parámetros totales | no disponible |
| Parámetros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | no disponible (ficheros `.npz` con frames y metadatos `meta['i47']`) |

## Arquitectura y entrenamiento

No se describe una arquitectura de red neuronal en la información proporcionada. El artefacto es un dataset de episodios generados por la política `huuhuyng/attune-i78-F-12000-raw` (sha `d7c091c01477`), operando en nivel 4 (spec v4) sobre bloques frescos `S80B-<task>`. Cada episodio se compone de un prefijo capturado verbatim desde la fila 0 hasta la fila de primer "no-progress" (inicio del stall si el objeto fue levantado, o aproximación máxima de la mano antes de cualquier cierre) y una completación propia de la tarea mediante el shim `data/i80/std_resume.py`.

Los pares de entrenamiento (D22) se construyen con prompt = una demo experta estándar de otra escena y target = los episodios de recuperación. Los frames se procesan con `data/compact.py` usando cuantil q95 (frames de prompt en 0, 15, 30, … sin pérdida). Se incluye un censo por unidad (causa, paso de stall, brazo) en `sources/`. No hay información sobre tokens de entrenamiento, composición del dataset ni técnicas de RLHF/DPO.

## Capacidades

- Generación de episodios de recuperación para tareas de manipulación robótica: `beat_block_hammer` (2 recuperaciones), `place_mouse_pad` (9), `place_phone_stand` (10).
- Distribución por brazo (L/R/ambos): `beat_block_hammer` 0/2/0; `place_mouse_pad` 3/6/0; `place_phone_stand` 5/5/0.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible.
- Capacidades especiales: no disponible.

## Casos de uso

- Entrenamiento de políticas de recuperación: usar los pares prompt/target para ajustar una política de imitación que aprenda a retomar tareas tras un stall, aprovechando que cada target respeta el presupuesto de pasos (2× pasos expertos).
- Evaluación de robustez ante fallos: medir la tasa de éxito de una política candidata en las tres tareas incluidas (`beat_block_hammer`, `place_mouse_pad`, `place_phone_stand`) tras inducir el estado de stall correspondiente.
- Análisis de asimetría por brazo: estudiar por qué `place_mouse_pad` concentra recuperaciones en el brazo derecho (6 de 9) frente a `place_phone_stand`, que se reparte 5/5, para diagnosticar sesgos de la política base.
- Investigación en data augmentation para robótica: combinar demos expertas de otras escenas (prompt) con recuperaciones propias (target) para aumentar la diversidad del conjunto de entrenamiento.
- Depuración de shims de resumen: validar el comportamiento de `data/i80/std_resume.py` (evitar reabrir agarres, abrir manos vacías) en pipelines propios de ejecución de políticas.
- Reproducción de experimentos: reejecutar la política `attune-i78-F-12000-raw` en nivel 4 sobre bloques `S80B-<task>` y comparar los episodios generados con los publicados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible (no es un modelo de inferencia).
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue (vLLM, llama.cpp, Ollama, TGI): no aplicable.
- Latencia y throughput: no disponible.
- Almacenamiento: el repositorio ocupa 0,4 GB.

## Comparativa con modelos similares

No disponible. No se han identificado en la información proporcionada conjuntos de datos comparables de recuperación de stalls para las mismas tareas.

## Limitaciones y advertencias

- No es un modelo de lenguaje: no admite generación de texto, razonamiento ni tool calling; evaluarlo con métricas de NLP carece de sentido.
- Cobertura muy reducida: solo tres tareas y 21 recuperaciones en total (2 + 9 + 10), insuficiente para conclusiones estadísticas robustas.
- Sin licencia declarada: no se puede asumir permiso para uso comercial ni redistribución.
- Sin model card estándar, idiomas, pipeline ni métricas: la documentación es una descripción técnica interna del autor, no una ficha de uso.
- Dependencia de la política base `attune-i78-F-12000-raw` (sha `d7c091c01477`): los episodios no son reproducibles sin ese artefacto y el shim `data/i80/std_resume.py`.
- Riesgo de sobreajuste al formato de frames q95 y a los prompts de demo de otras escenas; la generalización a escenas nuevas no está documentada.
- Sin datos de sesgo, alucinación o limitaciones de contexto aplicables, al no tratarse de un modelo generativo de texto.

## Enlaces

- Hugging Face: https://huggingface.co/huuhuyng/attune-i80-recovery
- Política base: https://huggingface.co/huuhuyng/attune-i78-F-12000-raw (sha `d6aa5555da9f949a02882b89440a1c03ceb9d4aa`)
- Shim de resumen: `data/i80/std_resume.py` (referenciado en la model card, sin URL pública)
- Procesado de frames: `data/compact.py` (referenciado en la model card, sin URL pública)
- Censo por unidad: `sources/` (referenciado en la model card, sin URL pública)
