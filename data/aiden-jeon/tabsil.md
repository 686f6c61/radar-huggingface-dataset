# aiden-jeon/tabsil

## Resumen

TabSil es un modelo fundacional para datos tabulares desarrollado por aiden-jeon. Un unico conjunto de pesos resuelve tanto clasificacion como regresion: se le entrega una tabla de entrenamiento y predice las filas de test en un unico forward pass mediante aprendizaje en contexto (in-context learning), sin pasos de gradiente sobre los datos del usuario. Emplea la arquitectura `column_row_transformer`, con 221.553.734 parametros, y fue entrenado exclusivamente sobre tablas sinteticas generadas a partir del prior graph SCM de TabICLv2.

El modelo combina disenos publicados de TabPFN-3.5, Kumo-Tabular y TabICLv2, sin reutilizar los pesos de ninguno de ellos. Su interes radica en que elimina la necesidad de reentrenamiento por conjunto de datos: la inferencia es puramente contextual, lo que lo hace adecuado para escenarios de AutoML y evaluacion rapida sobre tablas nuevas.

Admite hasta 160 clases, 1.000.000 de filas de entrenamiento y 6.000 caracteristicas en evaluacion, aunque el entrenamiento cubrio hasta 60.000 filas y 100 caracteristicas. El nombre proviene del coreano *sil* (실, hilo): el modelo lee una tabla tejiendo columnas y filas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | column_row_transformer (etapas de columna/fila + etapa in-context) |
| Parametros totales | 221.553.734 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | hasta 1.000.000 de filas de entrenamiento y 6.000 caracteristicas (limites de evaluacion); entrenado hasta 60.000 filas y 100 caracteristicas |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo tabular, no linguistico) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (libreria pytorch) |

## Arquitectura y entrenamiento

La arquitectura se organiza en tres etapas. El codificador de celdas (herencia de TabPFN-3.5) z-normaliza cada caracteristica sobre las filas de entrenamiento, marca las celdas ausentes con un indicador y agrupa 3 caracteristicas por token, anadiendo Fourier features aprendidas y rangos ECDF dentro de columna, con anchura 256. Las etapas de columna y fila (de Kumo-Tabular) consisten en 6 pares intercalados de bloque de columna (256 inducing points que resumen las filas de entrenamiento) y bloque de fila (4 CLS tokens por fila), con 4 cabezas cada uno; las 4 salidas CLS se unen en un vector de fila de 1.024 dimensiones. Las filas de test leen los resumenes de las filas de entrenamiento pero nunca se atienden entre si. La etapa in-context (TabPFN-3.5) tiene 24 capas, 16 cabezas y anchura 1.024. La temperatura de atencion (Kumo-Tabular) usa q/k RMSNorm sin gain multiplicado por un log-scale aprendido, con `gated_logscale` en la etapa de fila cuyo gate de query sigue QASSMax de TabICLv2, sin soft-cap de logits.

Las salidas difieren por tarea: clasificacion con decodificador de recuperacion many-class (TabPFN-3.5) y regresion con prediccion de 999 cuantiles entrenados con pinball loss (Kumo-Tabular), convertidos en una distribucion sobre 5.000 buckets. Los codificadores de target y un MLP pre-cabeza son por tarea; el resto es compartido. El entrenamiento siguio el curriculum de tres etapas de TabICLv2 (arXiv 2602.11139) acortado: 150k pasos en etapa 1 (1.024 filas, lr 8e-4), 10k en etapa 2 (400-10.240 filas, lr 1e-4) y 2k en etapa 3 (400-60.000 filas, lr 2e-5), con batches de 256 tablas, optimizador Muon, bf16 y 32xH100 (aproximadamente 1.550 horas H100 en total). Cada paso entrena una tarea y las tareas alternan. La inferencia usa un ensemble de 8 miembros con escalado estandar, shuffle de caracteristicas y clases, columna identificadora de fila aleatoria, one-hot para categoricas de hasta 20 categorias y reparto balanceado de columnas cuando la tabla supera 768 columnas.

## Capacidades

- Clasificacion tabular en contexto con hasta 160 clases, sin ajuste de gradientes.
- Regresion tabular con salida distribucional (999 cuantiles sobre 5.000 buckets).
- Aprendizaje en contexto (in-context learning) sobre tablas de entrenamiento arbitrarias.
- Manejo de valores ausentes mediante indicadores en el codificador de celdas.
- Codificacion one-hot automatica de variables categoricas con hasta 20 categorias.
- Ensemble interno de 8 miembros con escalado estandar y reparto balanceado de columnas.
- Soporte de tablas anchas: hasta 6.000 caracteristicas en evaluacion, con reparto por miembro a partir de 768 columnas.
- No dispone de tool calling, capacidades de agente ni procesamiento de lenguaje, vision o audio.

## Casos de uso

- AutoML y seleccion rapida de modelos: dado un dataset tabular nuevo, TabSil produce predicciones en un forward pass sin entrenamiento, lo que permite comparar su rendimiento frente a gradient boosting en minutos en lugar de horas.
- Clasificacion de riesgo crediticio o scoring: con hasta 160 clases y manejo nativo de valores ausentes, puede puntuar solicitudes a partir de tablas historicas de entrenamiento sin reentrenar por cada cartera.
- Prediccion de demanda y regresion sobre series de negocio: la salida distribucional por cuantiles permite estimar intervalos de incertidumbre directamente, util para planificacion de inventario.
- Deteccion de fraude en transacciones: el modelo clasifica filas nuevas usando como contexto un conjunto etiquetado de transacciones pasadas, sin coste de reentrenamiento cuando cambian los patrones.
- Analisis de datos cientificos y ensayos clinicos: regresion y clasificacion sobre tablas pequenas y medianas (hasta 60.000 filas dentro del regimen entrenado) con variables mixtas y categoricas.
- Evaluacion de calidad de datos y benchmarking: servir como referencia fundacional para medir si un pipeline tabular supera a un modelo preentrenado en contexto.
- Segmentacion de clientes y marketing: clasificacion multietiqueta sobre tablas de comportamiento con columnas categoricas de baja cardinalidad codificadas automaticamente.

## Benchmarks y rendimiento

La model card reporta resultados parciales sobre los datasets AMLB del paper de TabPFN v2 (29 de clasificacion y 28 de regresion), pero el texto proporcionado queda truncado en ese punto y no incluye las cifras finales. Los unicos valores numericos disponibles son las perdidas de validacion por etapa.

| Metrica | Etapa 1 | Etapa 2 | Etapa 3 |
|---|---|---|---|
| Cross-entropy de clasificacion | 0.200 | 0.248 | 0.320 |
| Pinball loss de regresion | 0.0495 | 0.0492 | 0.0548 |
| TabArena-Lite (etapa 1, 150k vs 225k pasos) | 1429 vs 1423 | no disponible | no disponible |
| AMLB classification (etapa 1, 150k vs 225k pasos) | 0.9383 vs 0.9383 | no disponible | no disponible |

Los valores de perdida no son comparables entre etapas porque las etapas posteriores usan tablas mas largas. No se han publicado en la informacion disponible las cifras completas de MMLU, HumanEval, GSM8K ni de los benchmarks AMLB de TabPFN v2.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; con 221,5 millones de parametros, los pesos en bf16 ocupan aproximadamente 0,45 GB y el repo completo 2,7 GB, por lo que el grueso del consumo proviene de las activaciones sobre tablas largas.
- GPU de entrenamiento: 32xH100 durante aproximadamente 30 + 10 + 9 horas (unas 1.550 horas H100).
- GPU recomendadas para inferencia: cualquier GPU con suficiente memoria para las activaciones; no se especifican modelos concretos.
- Cabe en GPU de consumo: previsiblemente si en terminos de pesos (menos de 1 GB en bf16), pero las tablas de hasta 1.000.000 de filas y 6.000 caracteristicas pueden desbordar la memoria de una GPU consumer; no se confirma en la informacion disponible.
- Opciones de despliegue: libreria pytorch con el codigo del repositorio Aiden-Jeon/tabsil (`src/tabsil/recipe.py`); no se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto (filas/caracteristicas) | Tareas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| TabSil | 221,5 M | 1.000.000 filas / 6.000 caracteristicas (evaluacion) | Clasificacion y regresion en un solo modelo | apache-2.0 | Hugging Face y GitHub |
| TabPFN-3.5 | no disponible | misma envoltura de evaluacion que TabSil | clasificacion y regresion | no disponible | no disponible |
| Kumo-Tabular | no disponible | no disponible | tabular | no disponible | no disponible |
| TabICLv2 | no disponible | curriculum de tres etapas replicado | clasificacion y regresion separadas | no disponible | scripts publicos |

TabSil se distingue de TabICLv2 por usar un unico modelo multitarea con batch 256 frente a modelos separados con batch 64, y por etapas de entrenamiento acortadas. No se dispone de cifras comparativas de rendimiento frente a estos modelos en la informacion proporcionada.

## Limitaciones y advertencias

- Entrenado exclusivamente sobre tablas sinteticas del prior graph SCM de TabICLv2; el rendimiento sobre distribuciones reales alejadas de ese prior no esta cuantificado en la informacion disponible.
- El entrenamiento cubre hasta 60.000 filas y 100 caracteristicas; los limites de evaluacion (1.000.000 de filas y 6.000 caracteristicas) exceden ampliamente el regimen entrenado.
- Las perdidas de validacion empeoran en la etapa 3 (CE 0.320 frente a 0.200 de la etapa 1), aunque no son comparables entre etapas por el cambio de tamano de tabla.
- Los pesos publicados son los crudos del final de la etapa 3, no una media de pesos; no se aplico weight averaging.
- No hay datos publicados sobre sesgos, tasas de alucinacion ni comportamiento por idioma; al ser un modelo tabular, no procesa texto libre.
- Licencia apache-2.0: permite uso comercial, pero no se documentan restricciones adicionales ni garantias del autor.
- El modelo no incluye tool calling, agentes ni capacidades multimodales, lo que limita su integracion en pipelines que esperen interfaces de chat.
- No se dispone de informacion sobre cuantizacion, latencia o throughput, lo que dificulta planificar despliegues en produccion.

## Enlaces

- Hugging Face: https://huggingface.co/aiden-jeon/tabsil
- Repositorio de codigo: https://github.com/Aiden-Jeon/tabsil
- Codigo de entrenamiento previo: https://github.com/Aiden-Jeon/minipfn
- Paper TabICLv2: https://arxiv.org/abs/2602.11139
- Paper adicional citado en tags: https://arxiv.org/abs/2609.17895
