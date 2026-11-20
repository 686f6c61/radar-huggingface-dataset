# MultiSTEVE-1s/200bitflips

## Resumen

MultiSTEVE-1s/200bitflips es un repositorio de modelos de investigación que forma parte del proyecto MultiSTEVE-1s, centrado en el estudio de interpretabilidad de agentes entrenados para jugar a Minecraft. No se trata de un modelo de lenguaje generalista, sino de una colección de agentes STEVE-1 entrenados con perturbaciones de un solo bit en sus pesos iniciales, con el objetivo de analizar cómo pequeñas modificaciones en la inicialización afectan el comportamiento aprendido. El repositorio está gestionado por el autor MultiSTEVE-1s y se presenta como una expansión en curso del zoo de modelos que acompaña al paper del proyecto.

El objetivo declarado es alcanzar 200 agentes adicionales con perturbaciones de bit único, organizados en carpetas con la convención `dataset_seed1-weight_init_seed1-bitflip_seed<seed>/`. Cada carpeta contiene checkpoints inicial y final, el orden de los datos de entrenamiento y los registros de entrenamiento y errores. En el momento de la consulta, el repositorio indica que el entrenamiento y las subidas están en progreso, por lo que no todos los modelos están disponibles.

La relevancia de este artefacto es fundamentalmente metodológica: sirve como material reproducible para estudiar sensibilidad a la inicialización, robustez y interpretabilidad mecanicista en agentes de aprendizaje por imitación. No hay información pública sobre arquitectura, número de parámetros, contexto o licencia en la información proporcionada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | `.weights` (checkpoints STEVE-1, formato propietario del proyecto) |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna de STEVE-1 ni el número de tokens o composición del dataset de entrenamiento. Lo que sí se documenta es el protocolo experimental: cada agente se entrena a partir de una inicialización de pesos sometida a una perturbación de un solo bit, manteniendo fijos el seed del dataset y el seed de inicialización, y variando únicamente el seed de la perturbación. Esta configuración permite aislar el efecto de la perturbación sobre el resultado del entrenamiento.

Cada carpeta de modelo incluye un checkpoint inicial (`STEVE-1_snapshot_000000000.weights`), un checkpoint final (`STEVE-1_snapshot_160005120.weights`), el orden de los datos de entrenamiento (`STEVE-1_data_order.txt`) y registros de entrenamiento y errores. El sufijo numérico del checkpoint final sugiere un presupuesto de pasos de entrenamiento, pero no se especifica su significado exacto en la información proporcionada. No se documentan detalles sobre RLHF, DPO ni innovaciones de decodificación.

## Capacidades

- Agentes entrenados para jugar a Minecraft mediante aprendizaje por imitación, según la descripción del proyecto STEVE-1.
- Ejecución de rollouts de agente y evaluación mediante las herramientas del repositorio GitHub asociado.
- Análisis de interpretabilidad: comparación de comportamiento entre agentes con perturbaciones de bit único.
- Reproducibilidad de experimentos: checkpoints iniciales y finales, orden de datos y logs de entrenamiento incluidos por modelo.
- No se documentan capacidades de generación de texto, razonamiento, código, matemáticas, visión, tool calling, agentes multi-paso ni multilingüismo en la información disponible.

## Casos de uso

- Estudio de sensibilidad a la inicialización: entrenar y comparar agentes con perturbaciones de bit único para medir cómo cambios mínimos en los pesos iniciales alteran el comportamiento final en Minecraft.
- Interpretabilidad mecanicista: usar los checkpoints iniciales y finales junto con los logs para localizar capas o parámetros cuya modificación produce cambios funcionales observables.
- Reproducción de experimentos del paper: cargar los checkpoints y ejecutar rollouts con las herramientas del repositorio GitHub para replicar los resultados publicados.
- Análisis de robustez: evaluar si los agentes perturbados mantienen el rendimiento del agente base o degradan de forma medible en tareas del entorno.
- Docencia e investigación en aprendizaje por imitación: disponer de un zoo de agentes con variaciones controladas para ilustrar efectos de inicialización en cursos y proyectos.
- Auditoría de entrenamiento: inspeccionar los logs de entrenamiento y errores para detectar inestabilidades asociadas a cada perturbación.
- Benchmarking interno de métodos de interpretabilidad: comparar técnicas de análisis sobre un conjunto de agentes con diferencias conocidas y acotadas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: no se documentan vLLM, llama.cpp, Ollama ni TGI; el uso previsto es la carga de checkpoints `.weights` mediante las herramientas del repositorio GitHub del proyecto.
- Latencia y throughput estimados: no disponible.
- Nota de almacenamiento: el repositorio ocupa 144.7 GB, por lo que requiere espacio en disco significativo para clonar o descargar los checkpoints.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| MultiSTEVE-1s/200bitflips | no disponible | no disponible | no disponible | no disponible | Repositorio en expansión, subidas en progreso |
| MultiSTEVE-1s/MultiSTEVE-1s (model zoo principal) | no disponible | no disponible | no disponible | no disponible | Zoo de 240 agentes del paper, incluye 100 agentes con flip de bit único |
| STEVE-1 (modelo base del proyecto) | no disponible | no disponible | no disponible | no disponible | Referenciado en el paper del proyecto |

No se dispone de datos suficientes para comparar parámetros, contexto o rendimiento con alternativas de la misma categoría.

## Limitaciones y advertencias

- El repositorio no está completo: el nombre describe la expansión planificada a 200 modelos, pero no todos están subidos; debe consultarse la pestaña Files para ver los disponibles.
- No se especifica licencia, lo que impide confirmar condiciones de uso comercial o redistribución.
- No se documentan sesgos conocidos, riesgos de alucinación ni limitaciones de idioma; el artefacto no es un modelo de lenguaje generalista.
- Los checkpoints están en formato `.weights` propietario del proyecto, no en safetensors o GGUF, lo que limita su uso con herramientas estándar de inferencia.
- El tamaño del repositorio (144.7 GB) impone requisitos de almacenamiento y ancho de banda considerables.
- Al ser material de investigación en progreso, los resultados pueden cambiar entre revisiones y no deben tratarse como referencia estable de producción.

## Enlaces

- Hugging Face: https://huggingface.co/MultiSTEVE-1s/200bitflips
- Model zoo principal: https://huggingface.co/MultiSTEVE-1s/MultiSTEVE-1s
- Website del proyecto: https://sites.google.com/view/multisteve-1s
- Paper: https://openreview.net/pdf?id=sR3tHXbQxm
- Código: https://github.com/KarolisRam/MultiSTEVE-1s
