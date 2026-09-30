# jprivera/260924_full_eval_charts

## Resumen

Este repositorio de HuggingFace, identificado como `jprivera/260924_full_eval_charts`, no es un modelo de lenguaje: es un artefacto de evaluacion publicado por el usuario jprivera que contiene los graficos, tablas y scripts de un experimento sobre supervision de colusion (collusion monitoring) en modelos con adaptadores entrenados. El contenido se genero a partir de una evaluacion completa sobre datos retenidos (held-out) de 7.200 filas de panel mas 10.584 filas de remainder por brazo, cubriendo 96 brazos, y calificado con una copia del grader incluido en la propia carpeta. El repositorio ocupa 0,2 GB y fue creado el 30 de septiembre de 2026.

El material se organiza en cuatro figuras principales (vision general de colusion no detectada tras tres pasadas, colusion por comportamiento, curvas de dosis 0/1/2/3 pasadas y costes colaterales), un conjunto adicional de graficos de barras (colusion restante, transferencia, dosis, comportamientos y costes) y los datos subyacentes en formato JSON y Markdown dentro de `report/` y la raiz de la carpeta. El punto de entrada recomendado por el autor es `SUMMARY_FOR_PAPER_260924.md`, que recoge la conclusion principal, las afirmaciones, los hechos del protocolo, los problemas conocidos y el estado de la politica.

Es relevante en el contexto de la investigacion sobre alineacion y deteccion de recompensas fraudulentas porque documenta si los metodos de monitorizacion siguen detectando colusion cuando se aplican varias pasadas de filtrado, y con que coste en capacidades (se incluyen graficos de GSM8K y MMLU). Una comparacion con las figuras de solo panel indica que todos los metodos se desplazan dos puntos o menos, y un analisis adjunto sostiene que el tamano de la evaluacion es entre 5 y 7 veces mayor de lo que exige el resultado principal. Este repositorio no contiene pesos, tokenizador ni configuracion de inferencia, por lo que sus parametros, contexto y licencia figuran como no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no aplica (repositorio de resultados de evaluacion, no de un modelo de pesos) |
| Parametros totales | no aplica |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica |
| Tipos de cuantizacion | no aplica |
| Idiomas soportados | no disponibles (los idiomas del material no se declaran) |
| Licencia | no disponible |
| Formato de pesos | no aplica; el repositorio contiene PNG, JSON, Markdown y scripts Python |

Otros datos del repositorio:

| Parametro | Valor |
|---|---|
| Identificador | jprivera/260924_full_eval_charts |
| Autor | jprivera |
| Fecha de creacion | 2026-09-30 |
| Ultima actualizacion | 2026-09-30 |
| Tamano del repositorio | 0,2 GB |
| Descargas | 0 |
| Likes | 0 |
| Pipeline declarado | no disponible |
| Etiquetas | region:us |
| Volumen de evaluacion | 7.200 filas de panel + 10.584 filas de remainder por brazo, 96 brazos |
| Archivos de datos | report/grid.json, report/tables.md, report/dose_tables.md, fig1_numbers.json |
| Scripts incluidos | scripts/06_grade_full.py, scripts/make_figures_full.py, scripts/plot_*_full.py |

## Arquitectura y entrenamiento

No hay informacion sobre arquitectura ni entrenamiento porque el repositorio no publica un modelo. Lo que si describe es el protocolo de evaluacion: se construyo a partir de una evaluacion completa de monitor sobre datos retenidos, con 7.200 filas de panel y 10.584 filas de remainder por brazo, para un total de 96 brazos, y todas las filas se calificaron con una copia del grader alojada en la carpeta. El archivo `report/grid.json` contiene los resultados calificados de los 96 brazos con estado COMPLETE, y el grader `scripts/06_grade_full.py` acepta el SHA del manifiesto de la mitad de panel que el merge dejo en el archivo `ADAPTER_SHA.json` de cada brazo, ademas de imponer el conjunto exacto de identificadores de fila contra el manifiesto completo.

La innovacion metodologica documentada es la verificacion de integridad del calificado sobre un conjunto ampliado de datos: se mantiene la restriccion estricta de identificadores frente al manifiesto completo, lo que permite comprobar que la ampliacion con remainder no altera las conclusiones. El autor indica que los directorios `260923_paired_grid/` y `260923_paper_figures/` no se modificaron, de modo que este repositorio es una extension reproducible del material anterior y no una revision del mismo. No se documentan datos de entrenamiento, numero de tokens, composicion del dataset, ni fases de RLHF o DPO, ya que no se entrena ningun modelo en este artefacto.

## Capacidades

- Publicacion de resultados calificados de un experimento de monitorizacion de colusion sobre 96 brazos con estado COMPLETE.
- Generacion de figuras de sintesis: colusion no detectada tras tres pasadas, colusion restante por comportamiento, curvas de dosis 0/1/2/3 pasadas y costes colaterales.
- Generacion de graficos de barras de la vista general: colusion restante original frente a tres pasadas, transferencia, curvas de dosis, desglose por comportamiento (incluidas dos variantes cromaticas) y costes.
- Evaluacion de capacidades: graficos de GSM8K y MMLU, que el autor senala que no se ven afectados por el remainder.
- Aportacion de datos crudos en JSON (`report/grid.json`, `fig1_numbers.json`) y tablas en Markdown (`report/tables.md`, `report/dose_tables.md`).
- Recalificado reproducible mediante la copia del grader, con validacion del conjunto exacto de identificadores de fila contra el manifiesto completo.
- No incluye tool calling, function calling, soporte de agentes, capacidades multilingues, vision, audio ni modo de razonamiento, al no tratarse de un modelo.
- No incluye inferencia de ningun tipo: no hay pesos, tokenizador ni configuracion de despliegue.

## Casos de uso

- Reproduccion de resultados de investigacion sobre monitores de colusion: el repositorio entrega los datos calificados de los 96 brazos y el script grader, de modo que un grupo de investigacion puede recalificar y verificar que las cifras publicadas coinciden con las del paper.
- Auditoria de robustez de un grader: al disponer de una copia del grader y del manifiesto completo de identificadores, se puede comprobar si el calificado se degrada al ampliar el conjunto de filas con el remainder de 10.584 filas por brazo.
- Analisis de coste de la supervision: las figuras de costes colaterales y de capacidad (GSM8K y MMLU) permiten cuantificar cuanto rendimiento se sacrifica al aplicar una, dos o tres pasadas de filtrado sobre los adaptadores entrenados.
- Calibracion del tamano de evaluacion: el analisis `EVAL_SIZE_ANALYSIS.md` sostiene que la evaluacion de monitor es entre 5 y 7 veces mayor de lo necesario para el resultado principal, lo que sirve como referencia para disenar evaluaciones futuras mas baratas.
- Reutilizacion de los scripts de figura: los scripts `make_figures_full.py` y `plot_*_full.py` estan apuntados a la rejilla completa y escriben unicamente en esta carpeta, por lo que se pueden adaptar para regenerar el mismo conjunto de graficos con datos propios sin contaminar los directorios anteriores.
- Meta-analisis comparativo entre metodos: la figura de transferencia y la de comportamientos por variante cromatica permiten contrastar si una mejora en colusion restante se traslada entre comportamientos o si es especifica de uno.
- Docencia y divulgacion sobre deteccion de recompensas fraudulentas: las figuras de vision general y de dosis son material listo para presentar en un seminario tecnico, dado que cada grafico viene acompanado de los numeros que lo sustentan.

## Benchmarks y rendimiento

El repositorio incluye un grafico de capacidades que reporta GSM8K y MMLU (`figs_bars/overview_capability.png`), pero los datos proporcionados no incluyen las cifras numericas de esos benchmarks ni de ningun otro. El autor indica explicitamente que los datos de capacidad no se ven alterados por el remainder.

No se han publicado resultados de benchmarks numericos en la informacion disponible.

Unicos datos cuantitativos declarados en el material aportado:

| Dato | Valor |
|---|---|
| Filas de panel por brazo | 7.200 |
| Filas de remainder por brazo | 10.584 |
| Numero de brazos | 96 |
| Estado de la rejilla calificada | COMPLETE |
| Desviacion frente a las figuras de solo panel | 2 puntos o menos en todos los metodos |
| Tamano relativo de la evaluacion de monitor | 5 a 7 veces mayor que lo necesario para el resultado principal |
| Tamano de celda del control UltraChat | n=300 por celda (solo panel) |
| Benchmarks de capacidad graficados | GSM8K y MMLU (sin cifras publicadas) |

## Requisitos de hardware

- No requiere GPU: el artefacto son imagenes PNG, JSON, Markdown y scripts Python sin inferencia de red neuronal.
- Almacenamiento: el repositorio ocupa 0,2 GB; conviene reservar algo mas de espacio para los ficheros regenerados por los scripts.
- Memoria: suficiente para cargar `report/grid.json` y los JSON auxiliares en memoria; se estima un consumo del orden de centenares de megabytes a pocos gigabytes si se procesan todas las filas de los 96 brazos a la vez, aunque no se dispone de una cifra exacta.
- CPU: cualquier maquina de escritorio actual es suficiente para ejecutar los scripts de figura basados en Python.
- GPU recomendadas: no aplica; no se requiere A100, H100 ni RTX 4090.
- Cabe en cualquier equipo de consumo, incluidos portatiles modestos, siempre que se disponga del entorno Python necesario.
- Opciones de despliegue: no aplica vLLM, llama.cpp, Ollama ni TGI, ya que no hay pesos que servir. El uso es mediante ejecucion directa de los scripts Python del repositorio.
- Latencia y throughput: no disponibles; no se declaran tiempos de ejecucion de los scripts.

## Comparativa con modelos similares

Este repositorio no es un modelo, por lo que no procede compararlo con modelos de lenguaje. En la busqueda web realizada no aparecen artefactos de evaluacion directamente comparables a `260924_full_eval_charts`; el unico framework de evaluacion presente en los resultados es `openai/evals`, que es una plataforma generica de evaluacion de LLM y sistemas basados en LLM, no una publicacion de resultados de un experimento concreto sobre monitorizacion de colusion.

| Criterio | 260924_full_eval_charts | openai/evals |
|---|---|---|
| Tipo de artefacto | Resultados de evaluacion y figuras de un experimento concreto | Framework generico de evaluacion |
| Parametros | no aplica | no aplica |
| Contexto | no aplica | no aplica |
| Rendimiento | sin cifras publicadas | no disponible |
| Licencia | no disponible | no disponible |
| Disponibilidad | Repositorio HuggingFace publico, 0 descargas | Repositorio GitHub publico |

No se dispone de informacion suficiente para establecer una comparativa de rendimiento con alternativas de la misma categoria.

## Limitaciones y advertencias

- No es un modelo: no contiene pesos, tokenizador, configuracion de inferencia ni pipeline, por lo que no puede usarse para generar texto ni para ninguna tarea de inferencia.
- La licencia no esta declarada, lo que impide determinar si el uso comercial o la redistribucion estan permitidos. Conviene contactar con el autor antes de reutilizar el material.
- Los datos de la evaluacion control con UltraChat son solo de panel, con n=300 por celda, y su remainder nunca se ejecuto. El propio autor advierte que asi se etiqueta en las figuras, por lo que cualquier comparacion con los demas brazos debe tener en cuenta esa asimetria.
- El repositorio depende de un grader copiado y de un manifiesto concreto; si el manifiesto original o los adaptadores referenciados por `ADAPTER_SHA.json` dejan de estar disponibles, la reproducibilidad del calificado se pierde.
- Los datos de capacidad (GSM8K y MMLU) se presentan solo como graficos, sin cifras textuales en la informacion disponible, lo que limita su reutilizacion directa en analisis cuantitativos.
- No se declaran idiomas soportados, sesgos conocidos ni tasas de alucinacion porque no hay modelo subyacente al que atribuirlos.
- El autor advierte de que los directorios `260923_paired_grid/` y `260923_paper_figures/` no se modificaron; mezclar salidas de ambos conjuntos puede inducir a error sobre que version de las figuras es la vigente.
- Aunque las cifras se mueven dos puntos o menos respecto a las figuras de solo panel, ese margen no viene acompanado de intervalos de confianza ni de tamanos de efecto en la informacion disponible, por lo que no debe interpretarse como evidencia de equivalencia estadistica.
- Los resultados proceden de un unico experimento con 96 brazos; no se documenta replicacion independiente.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/jprivera/260924_full_eval_charts
- Perfil del autor en HuggingFace: https://huggingface.co/jprivera44
- Resumen para el paper: `SUMMARY_FOR_PAPER_260924.md` (dentro del repositorio)
- Analisis del tamano de evaluacion: `EVAL_SIZE_ANALYSIS.md` (dentro del repositorio)
- Figuras principales: `figs/fig1_overview.png`, `figs/fig2_behaviours.png`, `figs/fig3_dose.png`, `figs/fig4_costs.png`
- Graficos de barras: `figs_bars/overview_remaining_collusion.png`, `figs_bars/overview_transfer.png`, `figs_bars/overview_dose_curves.png`, `figs_bars/overview_by_behaviour.png`, `figs_bars/overview_by_behaviour_v2.png`, `figs_bars/overview_by_behaviour_v2_redgreen.png`, `figs_bars/overview_costs.png`, `figs_bars/overview_capability.png`
- Datos calificados: `report/grid.json`, `report/tables.md`, `report/dose_tables.md`, `fig1_numbers.json`
- Scripts: `scripts/06_grade_full.py`, `scripts/make_figures_full.py`, `scripts/plot_*_full.py`
- Framework de evaluacion citado en la busqueda: https://github.com/openai/evals
- Comparativa de modelos citada en la busqueda (sin relacion directa con este repositorio): https://artificialanalysis.ai/leaderboards/models
- Leaderboard citado en la busqueda (sin relacion directa con este repositorio): https://benchlm.ai/
