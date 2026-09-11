# met-no/bris-forecaster-pretrained

## Resumen

Bris Forecaster Pretrained es un artefacto de investigación publicado por met-no (Instituto Meteorológico de Noruega) en HuggingFace bajo el identificador `met-no/bris-forecaster-pretrained`. No es un modelo de lenguaje: se trata de un conjunto de configuraciones y un entorno reproducible para un modelo de predicción meteorológica probabilística de base de datos, cuyo nombre interno en la model card es "boiling-blizzard". El repositorio recoge los YAML de inferencia y de reentrenamiento por etapas, junto con un `pyproject.toml` y un `uv.lock` compartidos para `anemoi-inference` y `anemoi-training`, la pila de Anemoi.

El modelo aborda la predicción meteorológica probabilística de alta resolución mediante ensembles, con una innovación declarada en el título del artículo asociado: el uso de una malla estirada (stretched-grid). Está vinculado al preprint arXiv:2511.23043, "High-Resolution Probabilistic Data-Driven Weather Modeling with a Stretched-Grid" (Nordhagen et al., 2025), y sus checkpoints se entrenaron en el supercomputador EuroHPC LEONARDO alojado en CINECA (Italia), con recursos de la convocatoria EHPC-REG-2025R02-263.

Su relevancia actual es la de servir como punto de partida reproducible para la comunidad de predicción meteorológica data-driven: permite ejecutar inferencia del checkpoint preentrenado y reproducir el pipeline de reentrenamiento por etapas, incluida una etapa basada en IFS. En el momento de redactar esta ficha el repositorio no tiene descargas ni "likes" registrados, por lo que no existe validación comunitaria publicada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (el artefacto se ejecuta con `anemoi-inference` y se entrena con `anemoi-training`; la model card no detalla la arquitectura) |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no se indica que sea un modelo MoE) |
| Longitud de contexto | no disponible (no aplica como ventana de contexto de lenguaje; el horizonte de prediccion vendria fijado en los YAML, no especificado en la informacion disponible) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (ingles, segun los metadatos de la model card) |
| Licencia | apache-2.0 |
| Formato de pesos | no disponible (el repositorio ocupa 4,3 GB y contiene `configs/*.yaml`, `pyproject.toml` y `uv.lock`; las configs referencian rutas de checkpoint y de dataset externas) |
| Autor | met-no |
| Fecha de creacion | 2026-08-07 |
| Ultima actualizacion | 2026-09-11 |
| Descargas / likes | 0 / 0 |
| Etiquetas | weather-forecasting, weather, meteorology, ensemble-forecasting, probabilistic-forecasting, region:us |

## Arquitectura y entrenamiento

La informacion proporcionada no describe la arquitectura interna (tipo de red, numero de capas, resolucion espacial efectiva ni estrategia de representacion del estado atmosferico). Lo unico verificable es el ecosistema de ejecucion: el modelo se sirve mediante `anemoi-inference` y se entrena mediante `anemoi-training`, ambos integrados en un unico entorno `uv` bloqueado. El repositorio esta organizado siguiendo el mismo estilo orientado a artefactos que `~/bris-forecaster`: las configuraciones ejecutables se agrupan bajo un directorio `configs/` de nivel superior y la raiz del repositorio documenta su uso.

El pipeline de reentrenamiento esta dividido en etapas explicitas, lo que constituye el detalle tecnico mas concreto disponible: una etapa 1 (`config_training_r1.yaml`), una etapa 2 (`config_training_r2.yaml`), un bloque de etapas 3 a 6 (`config_training_r3_6.yaml`) y una etapa 6 especifica basada en IFS (`config_training_r6_ifs.yaml`). La citacion asociada indica que el trabajo se centra en modelizacion probabilistica de alta resolucion con malla estirada, pero la informacion disponible no incluye el numero de tokens de entrenamiento, la composicion del dataset, ni si se aplicaron tecnicas de RLHF o DPO, que en cualquier caso no serian propias de este dominio.

## Capacidades

- Prediccion meteorologica probabilistica: las etiquetas del repositorio indican prediccion por ensembles y prediccion probabilistica como capacidades centrales del artefacto.
- Generacion de ensembles: la etiqueta `ensemble-forecasting` sugiere la produccion de multiples miembros de prediccion en lugar de una unica trayectoria determinista.
- Prediccion de alta resolucion sobre malla estirada: segun el titulo del articulo asociado, el metodo emplea una malla estirada para modelizacion de alta resolucion.
- Inferencia sobre checkpoint preentrenado: la config `configs/config_anemoi_inference.yaml` esta preparada para ejecutar el checkpoint preentrenado.
- Reentrenamiento por etapas: las configs de las etapas 1, 2, 3-6 y la etapa 6 basada en IFS permiten reproducir o adaptar el entrenamiento.
- Entorno reproducible: `uv sync --locked` reconstruye un entorno con dependencias fijadas para inferencia y entrenamiento.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible (no aplica a un modelo de prediccion meteorologica).
- Capacidades multilingues: no disponible; el unico idioma declarado es el ingles.
- Capacidades especiales (modo thinking, vision, audio): no disponible.

## Casos de uso

- Prediccion operativa probabilistica: ejecutar `anemoi-inference run configs/config_anemoi_inference.yaml` para generar un ensemble de predicciones meteorologicas sobre el checkpoint preentrenado, aprovechando que la configuracion ya esta preparada para inferencia.
- Investigacion en prediccion data-driven: usar el checkpoint preentrenado como linea base reproducible frente a modelos numericos tradicionales y otros modelos data-driven, citando el articulo asociado.
- Experimentacion con malla estirada: evaluar el efecto de la malla estirada descrita en el articulo sobre la resolucion efectiva y la calidad del ensemble.
- Reentrenamiento por etapas: reproducir el pipeline completo usando `config_training_r1.yaml`, `config_training_r2.yaml` y `config_training_r3_6.yaml`, util para estudiar como cada etapa afecta al rendimiento final.
- Ajuste con datos IFS: emplear `config_training_r6_ifs.yaml` para la etapa final basada en IFS, por ejemplo al adaptar el modelo a un dominio o periodo concreto.
- Evaluacion de predicciones probabilisticas: integrar las salidas del ensemble en utilidades de verificacion (puntuaciones de probabilidad, cobertura de intervalos) para comparar con predicciones de referencia.
- Reproducibilidad de resultados: reconstruir el entorno exacto con `uv sync --locked` y ejecutar las configs para auditar o replicar resultados en otro centro de calculo.
- Formacion y docencia: usar las configs como ejemplo didactico de organizacion de un pipeline de entrenamiento por etapas con Hydra y Anemoi.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye tablas de metricas (por ejemplo RMSE, CRPSS u otras propias de la verificacion meteorologica) y el articulo arXiv:2511.23043 se cita como referencia pero su contenido no forma parte de la informacion proporcionada, por lo que no se reproducen cifras.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; la model card no especifica requisitos de memoria ni tamano de parametros.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible; no puede confirmarse ni descartarse con la informacion proporcionada.
- Espacio en disco: el repositorio ocupa 4,3 GB, cantidad que no incluye necesariamente los checkpoints y datasets referenciados externamente por las configs.
- Entorno de ejecucion: se requiere `uv` para reconstruir el entorno bloqueado (`uv sync --locked`); la inferencia se lanza con `uv run --locked anemoi-inference run configs/config_anemoi_inference.yaml`.
- Entrenamiento: se lanza con `uv run --locked anemoi-training train --config-path=configs --config-name=<config>.yaml`. Los checkpoints originales se entrenaron en el supercomputador EuroHPC LEONARDO (CINECA, Italia), lo que indica que el pipeline completo de entrenamiento esta pensado para infraestructura HPC.
- Opciones de despliegue alternativas (vLLM, llama.cpp, Ollama, TGI): no disponible; no aplican al stack declarado, que es Anemoi.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

La informacion proporcionada no incluye datos de rendimiento ni especificaciones de modelos comparables, por lo que la comparacion cuantitativa no puede realizarse. Cualitativamente, el artefacto pertenece a la categoria de modelos de prediccion meteorologica data-driven y probabilistica, en la que existen alternativas conocidas como GraphCast y GenCast (Google DeepMind), Pangu-Weather (Huawei) y los modelos de IA de ECMWF, pero no se dispone en esta ficha de sus parametros, contexto, resultados o condiciones de licencia verificados.

| Modelo | Parametros | Contexto / horizonte | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| bris-forecaster-pretrained (met-no) | no disponible | no disponible | no disponible | apache-2.0 | HuggingFace, 0 descargas, 0 likes |
| GraphCast (DeepMind) | no disponible en la informacion proporcionada | no disponible | no disponible | no disponible | no verificada en esta ficha |
| GenCast (DeepMind) | no disponible en la informacion proporcionada | no disponible | no disponible | no disponible | no verificada en esta ficha |
| Pangu-Weather (Huawei) | no disponible en la informacion proporcionada | no disponible | no disponible | no disponible | no verificada en esta ficha |

## Limitaciones y advertencias

- No se han publicado benchmarks ni validacion externa en la informacion disponible; el repositorio registra 0 descargas y 0 likes, por lo que carece de contraste de la comunidad.
- La arquitectura, el numero de parametros, la resolucion efectiva y el horizonte de prediccion no estan documentados en la ficha; cualquier evaluacion de idoneidad requiere leer el articulo arXiv:2511.23043.
- El unico idioma declarado en los metadatos es el ingles; la documentacion y las configs estan en ese idioma.
- Las configs referencian ubicaciones de checkpoint y de dataset que no se detallan; si esas rutas no son accesibles publicamente, la reproducibilidad puede quedar limitada.
- No se especifican sesgos conocidos, comportamiento en regimenes extremos ni tasas de error, por lo que no puede caracterizarse el riesgo de predicciones erroneas o poco calibradas.
- Aunque la licencia del repositorio es apache-2.0, los checkpoints, datasets y modelos auxiliares referenciados pueden estar sujetos a condiciones propias que deben verificarse antes de un uso comercial.
- Los artefactos estan orientados a investigacion; no se declara ningun uso operativo certificado ni soporte del fabricante.
- Las fechas de creacion y actualizacion indicadas (2026-08-07 y 2026-09-11) proceden de los metadatos de HuggingFace y no se han verificado de forma independiente.

## Enlaces

- HuggingFace: https://huggingface.co/met-no/bris-forecaster-pretrained
- Articulo citado: https://arxiv.org/abs/2511.23043 (Nordhagen, Haugen, Salihi, Ingstad, Nipen, Seierstad y Frogner, "High-Resolution Probabilistic Data-Driven Weather Modeling with a Stretched-Grid", 2025)
- La busqueda web realizada no devolvio ningun enlace relevante sobre el modelo; los resultados obtenidos correspondian a sitios de prevision meteorologica general, un museo y un fabricante de cascos, sin relacion con el artefacto.
