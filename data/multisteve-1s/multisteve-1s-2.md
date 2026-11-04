# MultiSTEVE-1s/MultiSTEVE-1s-2

## Resumen

MultiSTEVE-1s-2 es un repositorio de tipo model zoo publicado por el colectivo MultiSTEVE-1s que contiene 140 agentes de Minecraft entrenados con la arquitectura STEVE-1/VPT (Video PreTraining). No es un modelo de lenguaje generativo al uso, sino una coleccion de politicas de reinforcement learning para el entorno MineRL, entrenadas con hiperparametros fijos y aleatoriedad controlada con el objetivo de estudiar la reproducibilidad y la no determinacion del entrenamiento.

El repositorio se organiza en cinco conjuntos de ejecuciones que varian sistematicamente las semillas de inicializacion de pesos y de ordenacion de datos, incluyendo un conjunto con un bit invertido en una capa de embeddings de MineCLIP y 100 ejecuciones adicionales para busqueda de valores atipicos. Cada ejecucion contiene checkpoints intermedios y finales, asi como registros de ordenacion de datos y de entrenamiento.

Su relevancia es metodologica: proporciona material reproducible para interpretabilidad y comparaciones controladas de variabilidad en el entrenamiento de agentes, no para despliegue en produccion. El repositorio tiene un tamano de 1248,3 GB, lo que refleja la acumulacion de cientos de checkpoints de pesos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | STEVE-1/VPT (agente de reinforcement learning para Minecraft; no disponible el detalle de capas) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (no es un modelo de contexto textual; actua sobre observaciones de Minecraft) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (etiqueta del repositorio; el agente no procesa lenguaje natural de forma general) |
| Licencia | multisteve-1-research-artefact-terms (license: other) |
| Formato de pesos | `.weights` (checkpoints STEVE-1, p. ej. `STEVE-1_snapshot_<frames>.weights`) |

## Arquitectura y entrenamiento

Los agentes siguen la linea STEVE-1/VPT: politicas entrenadas para Minecraft en el entorno MineRL, derivadas de VPT (Video PreTraining) y STEVE-1, con senales de objetivo basadas en MineCLIP/MineDojo. El repositorio no documenta el numero de parametros ni la composicion exacta del dataset; unicamente referencia el dataset `randomhuggingfaceuser1273823147/steve1-training-data`.

La innovacion del release es el diseno experimental: 140 ejecuciones con hiperparametros fijos y variacion controlada de semillas. El conjunto `01_init_seed_only` fija la semilla del dataset y varia la de inicializacion; `02_data_seed_only` hace lo contrario; `03_init_and_data` varia ambas; `04_single_lsb_flip` invierte un bit seleccionado de una capa de embeddings de MineCLIP antes del entrenamiento; y `05_final_init_and_data_100` anade 100 ejecuciones para busqueda de valores atipicos. Se incluyen logs de ordenacion de datos y de entrenamiento, con checkpoints como `000000000` (inicial) y `160005120` (final principal).

## Capacidades

- Ejecucion de politicas de agente en Minecraft a traves de MineRL.
- Aprendizaje por refuerzo con objetivos derivados de MineCLIP.
- Reproduccion controlada de entrenamientos con semillas fijas o variables.
- Analisis de interpretabilidad mediante comparacion de checkpoints y bit-flips.
- Registro de ordenacion de datos y logs de entrenamiento para auditoria.
- No soporta tool calling, function calling, agentes multi-paso genericos ni capacidades multilingues.
- No dispone de modo thinking, vision general, audio ni generacion de texto libre.

## Casos de uso

- Estudio de reproducibilidad en RL: comparar ejecuciones de `01_init_seed_only` y `02_data_seed_only` para aislar el efecto de la semilla de inicializacion frente a la del orden de datos.
- Analisis de sensibilidad a perturbaciones: usar `04_single_lsb_flip` para medir como un unico bit invertido en una capa de embeddings de MineCLIP altera la politica final.
- Busqueda de valores atipicos: emplear las 100 ejecuciones de `05_final_init_and_data_100` para identificar entrenamientos con comportamiento anomalo.
- Interpretabilidad de representaciones: comparar checkpoints intermedios (`STEVE-1_snapshot_<frames>.weights`) para trazar la evolucion de la politica durante el entrenamiento.
- Auditoria de pipelines de entrenamiento: validar que el codigo suplementario reproduce los logs de ordenacion de datos y los checkpoints documentados.
- Docencia e investigacion metodologica: disponer de un banco de agentes con hiperparametros fijos para ensenar variabilidad de entrenamiento en RL.
- Benchmarking interno de infraestructura: evaluar el impacto de versiones de CUDA, GPU, driver, PyTorch y MineRL en la reproducibilidad bit a bit.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; depende del tamano de los checkpoints STEVE-1/VPT, no documentado.
- GPU recomendadas: no disponible en la model card; la reproducibilidad bit a bit es sensible a CUDA, GPU, driver, PyTorch y MineRL.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: codigo suplementario del release, que espera el repositorio en `data/model_zoo/`; no se documentan vLLM, llama.cpp, Ollama ni TGI (no aplicables a este tipo de artefacto).
- Latencia y throughput: no disponible.
- Almacenamiento: el repositorio ocupa 1248,3 GB, por lo que requiere espacio en disco considerable.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| MultiSTEVE-1s-2 | Model zoo de agentes RL (STEVE-1/VPT) | no disponible | no aplica | research artefact terms | HuggingFace |
| STEVE-1 (original) | Agente RL para Minecraft | no disponible | no aplica | no disponible | no disponible |
| VPT (Video PreTraining) | Agente RL para Minecraft | no disponible | no aplica | no disponible | no disponible |

No se dispone de datos de rendimiento comparables en la informacion proporcionada.

## Limitaciones y advertencias

- Los agentes actuan unicamente en MineRL/Minecraft; no son politicas de proposito general.
- La reproduccion bit a bit es sensible a versiones de CUDA, GPU, driver, PyTorch y MineRL.
- Los checkpoints son artefactos de investigacion para estudiar variacion e interpretabilidad, no sistemas certificados para seguridad.
- La licencia `multisteve-1-research-artefact-terms` no concede derechos sobre STEVE-1, VPT, MineCLIP/MineDojo, MineRL, demostraciones de contratistas de OpenAI ni activos de Minecraft mas alla de sus propias licencias.
- El codigo fuente nuevo especifico de MultiSTEVE se libera bajo MIT en el release suplementario, pero el repositorio de modelos no amplia derechos de terceros.
- No es un producto oficial de Minecraft ni esta aprobado por Mojang o Microsoft.
- No se documentan sesgos, tasas de alucinacion ni limitaciones de contexto o idioma en la informacion disponible.
- El uso comercial queda restringido por los terminos del artefacto de investigacion y por las licencias upstream.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/MultiSTEVE-1s/MultiSTEVE-1s-2
- Dataset referenciado: https://huggingface.co/datasets/randomhuggingfaceuser1273823147/steve1-training-data
- Documentacion del release suplementario (referenciada en la model card): `README.md`, `docs/data_and_weights.md`, `docs/training.md`, `docs/evaluations.md`, `docs/reproducibility.md`
- No se han encontrado en la informacion disponible enlaces a papers, blogs, repositorios de codigo o demos adicionales.
