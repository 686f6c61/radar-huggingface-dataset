# cangyeone/elastic-wave-structure-emerge

## Resumen

El repositorio `cangyeone/elastic-wave-structure-emerge` publica el código y los checkpoints asociados al manuscrito *"Convergent representations of elastic-wave structure emerge from distinct seismic training objectives"*. El autor, cangyeone, investiga si representaciones de ondas elásticas aprendidas mediante objetivos de entrenamiento deliberadamente heterogéneos (un phase picker especializado en fases Pg/Sg/Pn/Sn llamado PNSN, y un modelo multi-tarea más amplio llamado SeismicXM) convergen hacia una estructura reusable que permita transferencia entre tareas sismológicas sin necesidad de escalar parámetros. La tesis central es que la transferencia sísmica no requiere escalado de parámetros, sino aprender estructura elástica reusable.

El lanzamiento incluye cuatro checkpoints: PNSN, SeismicXM, y dos controles suplementarios (PhaseNet y EQTransformer), junto con programas de experimentos para funciones receptoras (RF), emisión acústica (AE), correlación cruzada de ruido ambiental (NCF), y lecturas de dispersión. Los datos de entrenamiento y evaluación no se incluyen en esta versión; el autor aún decide qué conjuntos puede redistribuir. El repositorio está bajo licencia GPL-3.0 y está orientado a la comunidad de sismología computacional, no a modelos de lenguaje o visión.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (checkpoints en PyTorch, sin especificación de red) |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no aplica a modelos de waveform) |
| Tipos de cuantizacion | no disponible (solo pesos en precisión original) |
| Idiomas soportados | no disponible (no es un modelo de texto) |
| Licencia | GPL-3.0 (checkpoints de PhaseNet y EQTransformer conservan sus términos MIT originales) |
| Formato de pesos | PyTorch `.pt` (no safetensors) |

## Arquitectura y entrenamiento

No se proporcionan detalles arquitectónicos en la información disponible. El repositorio contiene definiciones exactas de los modelos PNSN y SeismicXM en `model_definitions/`, pero no se describen capas, número de bloques ni mecanismos de atención. Se sabe que PNSN es un phase picker enfocado en cuatro fases sísmicas (Pg, Sg, Pn, Sn), mientras que SeismicXM es un modelo multi-tarea más amplio. No se indican datos de entrenamiento (número de tokens, composición del dataset, uso de RLHF/DPO) porque los datos no se incluyen en la release. La innovación principal del trabajo no es arquitectónica, sino metodológica: comparar trayectorias de entrenamiento heterogéneas para probar la existencia de una representación reusable de la estructura de ondas elásticas.

## Capacidades

- Detección y clasificación de fases sísmicas (PNSN: Pg, Sg, Pn, Sn).
- Análisis de funciones receptoras (RF) para estructura cortical y del manto.
- Procesamiento de emisión acústica (AE) para monitoreo de integridad estructural o microsismicidad.
- Análisis de dispersión de ruido ambiental (NCF) para tomografía de velocidad.
- Lecturas de dispersión de ondas superficiales (endpoint dispersion).
- Transferencia entre tareas sismológicas sin escalado de parámetros, según la hipótesis del manuscrito.

## Casos de uso

- **Monitoreo sísmico regional**: el phase picker PNSN puede integrarse en pipelines de detección automática de eventos para redes sismológicas locales, identificando fases Pg, Sg, Pn y Sn en registros continuos de velocidad.
- **Estudios de estructura cortical con funciones receptoras**: los programas de RF permiten procesar tele-sismos para estimar espesor de corteza y razón Vp/Vs, útil en geología estructural.
- **Detección de emisiones acústicas en laboratorio**: el modelo puede aplicarse a datos de AE para identificar microfracturas en ensayos de materiales, con aplicaciones en ingeniería civil y geomecánica.
- **Tomografía de ruido ambiental**: los módulos de NCF y dispersión permiten extraer curvas de dispersión de ondas superficiales a partir de ruido sísmico, para mapear velocidades de corte someras.
- **Validación de representaciones transferibles**: el repositorio sirve como banco de pruebas para comparar si representaciones aprendidas con un objetivo (p. ej., phase picking) son útiles para otro (p. ej., RF), sin reentrenar desde cero.
- **Investigación reproducible en sismología**: los scripts y checkpoints permiten reproducir los experimentos del manuscrito, siempre que se obtengan los datos externos según las instrucciones de `docs/DATA.md`.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El manuscrito asociado no se ha localizado en la búsqueda web, y la model card no incluye métricas numéricas (precisión, recall, F1, etc.) para los modelos. No se pueden reportar comparaciones cuantitativas con otros modelos.

## Requisitos de hardware

- No se especifican requisitos de VRAM ni GPU en la documentación.
- El tamaño del repositorio es de 4.5 GB, lo que sugiere que los checkpoints individuales son de tamaño moderado (probablemente decenas a cientos de MB cada uno).
- Los runners oficiales soportan CPU y Apple MPS; CUDA puede añadirse en un entorno PyTorch local, pero la interfaz histórica de línea de comandos se ejecutó en CPU/MPS.
- Para inferencia en producción, se recomienda una GPU con al menos 8 GB de VRAM si se desea acelerar el procesamiento de waveforms largos, aunque no hay datos de latencia o throughput.
- Opciones de despliegue: scripts Python directos con PyTorch; no se mencionan integraciones con vLLM, llama.cpp, Ollama o TGI (no aplicable a modelos de waveform).

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| PNSN (este repo) | Phase picker (Pg/Sg/Pn/Sn) | no disponible | no aplica | GPL-3.0 | Checkpoint en HuggingFace |
| SeismicXM (este repo) | Multi-tarea waveform | no disponible | no aplica | GPL-3.0 | Checkpoint en HuggingFace |
| PhaseNet (control) | Phase picker (P/S) | no disponible | no aplica | MIT | Checkpoint incluido |
| EQTransformer (control) | Phase picker + magnitud | no disponible | no aplica | MIT | Checkpoint incluido |

No se dispone de información pública sobre otros modelos comparables de la misma categoría (p. ej., otros phase pickers como GPD, o modelos de waveform como SeisBench) en la información proporcionada.

## Limitaciones y advertencias

- **Datos no incluidos**: los conjuntos de entrenamiento y evaluación no se redistribuyen; el usuario debe obtenerlos de fuentes autorizadas y crear manifiestos con rutas explícitas.
- **Licencia GPL-3.0**: el código derivado está bajo GPL-3.0, lo que implica que cualquier redistribución o modificación debe mantener la misma licencia. Los checkpoints de PhaseNet y EQTransformer conservan sus términos MIT, por lo que hay que revisar `docs/MODELS.md` antes de redistribuir.
- **Sin métricas publicadas**: no hay benchmarks ni evaluaciones cuantitativas en la model card, por lo que el rendimiento real en tareas específicas es desconocido.
- **Alcance limitado**: el modelo está diseñado para datos sísmicos de waveform; no es un modelo de lenguaje ni de visión, y no debe usarse fuera de su dominio.
- **Riesgo de sesgo**: al no haber datos de entrenamiento disponibles, no se puede evaluar si los modelos presentan sesgos geográficos o instrumentales.
- **Estado de investigación**: el repositorio es un release de código para un manuscrito; no está pensado como un producto listo para producción sin validación adicional.

## Enlaces

- HuggingFace: https://huggingface.co/cangyeone/elastic-wave-structure-emerge
- GitHub del autor: https://github.com/cangyeone/
- Repositorio de herramientas sismológicas: https://github.com/cangyeone/seismological-ai-tools
- Documentación generada por DeepWiki: https://deepwiki.com/cangyeone/seismological-ai-tools
