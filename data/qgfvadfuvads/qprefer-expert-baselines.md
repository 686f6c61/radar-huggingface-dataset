# qgfvadfuvads/qprefer-expert-baselines

## Resumen

El repositorio `qgfvadfuvads/qprefer-expert-baselines` no es un modelo de IA generativa, sino un framework de evaluación y reproducción para siete modelos de calidad y recompensa de video: DOVER, Q-Align, Q-Eval, FAST-VQA, VideoReward, UnifiedReward-7B y VideoScore2. Desarrollado por el usuario `qgfvadfuvads`, resuelve el problema de unificar la ejecución y métricas de estos modelos, que tienen dependencias de Python incompatibles entre sí, al separar la lógica de evaluación en un paquete ligero (`expertbench`) y los adaptadores de cada modelo en entornos independientes (`workers/`).

Su relevancia actual radica en que proporciona una infraestructura reproducible para evaluar modelos de video en pares A/B, con métricas alineadas al paper Q-Prefer-Bench, incluyendo soporte para tareas text-to-video (T2V) e image-to-video (I2V). El repositorio incluye herramientas de validación de datos, ejecución de inferencia, cálculo de métricas y documentación de reproducción de resultados, pero no contiene los pesos de los modelos ni los datos de test privados.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | No aplicable (framework de evaluación, no un modelo único) |
| Parámetros totales | No disponible (depende de cada modelo evaluado) |
| Parámetros activos | No aplicable (no es un modelo MoE) |
| Longitud de contexto | No aplicable (trabaja con video, no texto) |
| Tipos de cuantización | No disponible (los modelos subyacentes pueden usar cuantización, pero no se documenta aquí) |
| Idiomas soportados | No disponible (la documentación está en chino e inglés, pero no es un modelo de lenguaje) |
| Licencia | No disponible (el repositorio indica respetar las licencias de los modelos subyacentes) |
| Formato de pesos | No aplicable (no se distribuyen pesos; los adaptadores cargan los modelos desde sus fuentes originales) |

## Arquitectura y entrenamiento

El repositorio está diseñado en dos capas. La primera, `expertbench`, es un paquete Python que solo depende de la biblioteca estándar y se encarga de la validación de datos, la orquestación de tareas y el cálculo de métricas. La segunda, `workers/`, contiene adaptadores que ejecutan cada modelo en su propio entorno de Python, evitando conflictos de dependencias (por ejemplo, DOVER, Qwen2-VL, LLaVA y VideoScore2). No hay entrenamiento de un modelo nuevo; se trata de un sistema de evaluación estandarizado para modelos existentes.

El flujo de trabajo incluye: preparación de un manifest JSONL con pares de videos, configuración de rutas y entornos para cada modelo, ejecución de inferencia (con soporte para multi-GPU y reanudación), y cálculo de métricas según el protocolo Q-Prefer-Bench (acc_with_ties, acc_without_ties, overall_macro_*). El repositorio también incluye herramientas para fusionar resultados parciales y detectar errores de polaridad en la asignación de etiquetas A/B.

## Capacidades

- Evaluación de calidad de video y alineación texto-video mediante siete modelos baseline: DOVER, Q-Align, Q2Eval, FAST-VQA, VideoReward, UnifiedReward-7B y VideoScore2.
- Soporte de tareas text-to-video (T2V) e image-to-video (I2V) con pares de videos A/B.
- Validación de manifiestos JSONL, incluyendo verificación de existencia de archivos y formato de etiquetas.
- Cálculo de métricas de precisión con manejo de empates (ties) y búsqueda de epsilon óptimo.
- Ejecución paralela en múltiples GPU mediante shards de manifiesto y fusión de resultados.
- Persistencia incremental de resultados (cada par completado se guarda inmediatamente).
- Reproducibilidad auditada: se incluyen referencias de números de paper, hashes de artefactos y scripts de reproducción.

## Casos de uso

- **Reproducción de resultados de papers**: investigadores pueden verificar las métricas publicadas de modelos como VideoScore2 o DOVER en su propio hardware, usando los scripts y referencias incluidas.
- **Benchmark de nuevos modelos de video**: al añadir un adaptador `worker/` para un modelo propio, se puede comparar su rendimiento contra los siete baselines en el mismo protocolo de evaluación.
- **Evaluación de calidad de generación de video**: para equipos que desarrollan modelos de generación T2V/I2V, el framework permite medir la calidad perceptual y la alineación con el prompt en pares de videos.
- **Auditoría de robustez de modelos**: el script `doctor` verifica la configuración de entornos y rutas sin cargar modelos, útil para detectar problemas de despliegue.
- **Integración en pipelines de CI/CD**: la línea de comandos permite ejecutar evaluaciones automáticas en entornos de integración continua, con salida de métricas en JSON.
- **Investigación sobre métricas de evaluación**: al separar la capa de cálculo de métricas, se pueden experimentar con nuevas definiciones de precisión sin modificar los adaptadores de modelos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El repositorio referencia archivos `paper_numbers.json` y `gpu_reproduction_*.json` que contienen los valores de los papers y las reproducciones, pero esos datos no se han incluido en la model card ni en la búsqueda web. No se puede presentar una tabla comparativa sin inventar números.

## Requisitos de hardware

- **VRAM estimada**: no disponible, depende de cada modelo evaluado (por ejemplo, VideoScore2 requiere una GPU con suficiente memoria para Qwen2-VL, mientras que DOVER puede ser más ligero).
- **GPUs recomendadas**: no se especifica, pero los adaptadores utilizan CUDA y se menciona `--device cuda`. Se puede inferir que se requieren GPUs de nivel de datacenter para modelos grandes (como VideoScore2 o UnifiedReward-7B).
- **Compatibilidad con GPUs de consumidor**: posiblemente para modelos pequeños como FAST-VQA, pero no hay confirmación.
- **Opciones de despliegue**: el framework se ejecuta como scripts de Python; no se mencionan vLLM, Ollama u otros servidores de inferencia.
- **Latencia y throughput**: no disponible.

## Comparativa con modelos similares

No disponible. El repositorio no es un modelo comparable con otros modelos de lenguaje o visión; es un benchmark de evaluación. No se pueden comparar parámetros, contexto o rendimiento con alternativas porque no es un modelo en sí.

## Limitaciones y advertencias

- **No es un modelo de IA**: este repositorio no proporciona un modelo entrenado, sino un framework para evaluar otros modelos. No debe usarse como un modelo para generar texto, código o imágenes.
- **Dependencias complejas**: la ejecución requiere configurar múltiples entornos de Python separados, lo que puede ser frágil y difícil de mantener en producción.
- **Datos de test no incluidos**: el repositorio no contiene los videos ni las etiquetas de los test sets privados, por lo que para usarlo hay que suministrar los propios datos.
- **Licencias de los modelos subyacentes**: cada modelo evaluado tiene su propia licencia (por ejemplo, VideoScore2 puede tener restricciones comerciales). El repositorio no las gestiona.
- **Riesgo de errores de configuración**: la documentación advierte sobre la necesidad de usar versiones específicas (CPython 3.12.12, variables de entorno) para VideoScore2; cualquier desviación puede invalidar los resultados.
- **Polaridad de etiquetas**: el framework incluye una advertencia sobre la polaridad (si se invierten A/B) para evitar errores de interpretación en los resultados.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/qgfvadfuvads/qprefer-expert-baselines
- Referencia de números de paper (en el repositorio): `reference/paper_numbers.json`
- Documentación de reproducción: `docs/REPRO_AUDIT.md` (no se proporciona URL directa, pero está en el repositorio)
- Documentación de modelos: `docs/MODELS.md` (en el repositorio)
