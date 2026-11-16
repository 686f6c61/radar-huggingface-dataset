# fusion-world-model/gru_10m_h-task-outputs

## Resumen

`gru_10m_h-task-outputs` es un modelo del mundo (world model) para plasmas de tokamak, desarrollado por el usuario `fusion-world-model` y publicado en Hugging Face. No es un modelo de lenguaje: se trata de una red recurrente GRU de tipo serie temporal, con un presupuesto de 10 millones de parametros, entrenada para predecir la evolucion dinamica de plasmas en reactores de fusion por confinamiento magnetico. El modelo forma parte de un conjunto de checkpoints asociados a un articulo cientifico, cuya revision de referencia es la etiqueta `release-2026.11.13rc2`.

El checkpoint principal (`final.pt`) corresponde a la configuracion de indice 6 entre 20 configuraciones exploradas en una busqueda de hiperparametros, seleccionada por la regla de seleccion del propio search. El sufijo "h-task-outputs" indica que se entrena con la receta (h) *reward-only* (solo recompensa), orientada a las salidas de tarea. El repositorio incluye tambien checkpoints replicados con distintas semillas (`seed_1.pt`, `seed_2.pt`), los controladores de la Evaluacion 4 (PPO congelado) y artefactos de trazabilidad como `selection.json` y `manifest.json`.

Su relevancia radica en el contexto de la fusion nuclear: los modelos del mundo permiten simular y predecir el comportamiento del plasma antes de ejecutar experimentos costosos en tokamaks reales, y sirven de base para entrenar controladores (por ejemplo, PPO) dentro de ese entorno simulado. El modelo es pequeno (10M parametros) y esta liberado bajo licencia CC BY-SA 4.0, lo que facilita su reproduccion y reutilizacion en investigacion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GRU (red neuronal recurrente) para series temporales |
| Parametros totales | 10M (presupuesto de parametros) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | CC BY-SA 4.0 |
| Formato de pesos | PyTorch (`.pt`, checkpoints guardados por el codigo de entrenamiento) |

## Arquitectura y entrenamiento

La arquitectura es una GRU (Gated Recurrent Unit) disenada para modelar series temporales de plasmas de tokamak. El checkpoint `final.pt` corresponde a la configuracion ganadora de una busqueda sobre 20 configuraciones; la model card indica que el checkpoint del articulo (revision `release-2026.11.13rc2`) usa la GRU en el diseno ganador de su piloto de diseno: 2 capas, dropout de 0.1 y un warmup de 4.000 pasos. Ademas, el articulo reporta esta revision como el diseno original de la GRU.

El entrenamiento se realizo con la receta (h) *reward-only*, que segun la model card se diferencia de la receta anterior (`old_recipe`) por tres cambios: un limite inferior sobre la dispersion predicha, la eliminacion del limite superior sobre la verosimilitud y la incorporacion de un calentamiento de la tasa de aprendizaje (learning-rate warmup). Los datos de entrenamiento proceden de bases de datos experimentales de fusion, entre ellas FAIR-MAST (UKAEA), HDB5 (International Global H-Mode Confinement Database), PR08 (ITPA multi-tokamak profile database), la Open Density Limit Database de Alcator C-Mod y la base de datos de transicion L-H de TCV. No se especifica en la informacion disponible el numero total de tokens ni la composicion exacta del dataset.

## Capacidades

- Modelado y prediccion de series temporales de plasmas de tokamak (evolucion dinamica del plasma).
- Uso como entorno o world model para entrenar controladores de politicas (por ejemplo, PPO) sobre el estado simulado.
- Generacion de salidas de tarea bajo la receta *reward-only*.
- Reproducibilidad mediante checkpoints con distintas semillas de entrenamiento.
- No dispone de capacidades de generacion de texto, codigo, matematicas, vision ni audio.
- No dispone de tool calling, function calling ni razonamiento multi-paso en el sentido de los LLM.
- Capacidades multilingues: no aplicable.

## Casos de uso

- Prediccion de la evolucion del plasma en tokamaks: el modelo aprende la dinamica temporal a partir de datos experimentales y puede anticipar la trayectoria de variables del plasma, util para planificar descargas experimentales.
- Entrenamiento de controladores de fusion: los controladores de la Evaluacion 4 (PPO congelado) se entrenan dentro del world model, permitiendo desarrollar politicas de control sin exponer el tokamak real a riesgos.
- Simulacion previa a experimentos costosos: al ser un modelo de 10M parametros, puede ejecutarse rapidamente para explorar escenarios antes de asignar tiempo de maquina en un tokamak.
- Estudios de estabilidad y transiciones de regimen: los datos de TCV (transicion L-H) y de HDB5 (confinamiento H-mode) permiten modelar cambios de regimen del plasma.
- Investigacion reproducible en fusion: los checkpoints con distintas semillas y los artefactos `selection.json` y `manifest.json` permiten replicar y auditar los resultados del articulo.
- Benchmarking de recetas de entrenamiento: la comparacion entre `final.pt`, `old_recipe/final.pt` y las semillas permite evaluar el efecto de cambios de receta (limites de dispersion, verosimilitud, warmup).
- Base para modelos del mundo de mayor escala: el diseno de 10M parametros sirve como piloto para arquitecturas recurrentes mayores en el mismo dominio.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye tablas de metricas (MSE, error de prediccion, recompensa de control, etc.) ni comparaciones numericas con otros modelos.

## Requisitos de hardware

- VRAM estimada para inferencia: muy reducida, coherente con un modelo de 10M parametros (del orden de decenas de MB en precision completa, menos aun en media precision); no se dispone de cifras exactas en la informacion proporcionada.
- GPU recomendadas: cualquier GPU consumer moderna es suficiente; no se especifican modelos concretos en la informacion disponible.
- Cabe en GPU consumer: si, dado el tamano del modelo (10M parametros) y el tamano del repositorio (0.2 GB).
- Opciones de despliegue: al ser checkpoints PyTorch (`.pt`), el despliegue se realiza cargando los pesos con PyTorch y el codigo de entrenamiento del autor; no se mencionan integraciones con vLLM, llama.cpp, Ollama o TGI (herramientas orientadas a LLM, no aplicables aqui).
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye otros modelos del mundo para plasmas de tokamak con los que comparar parametros, contexto, rendimiento o licencia.

## Limitaciones y advertencias

- Ambito restringido: el modelo esta especializado en series temporales de plasmas de tokamak; no es aplicable a tareas generales de lenguaje, codigo o vision.
- Riesgo de extrapolacion: al entrenarse con bases de datos experimentales concretas (FAIR-MAST, HDB5, PR08, Alcator C-Mod, TCV), su validez fuera de esos regimenes y maquinas no esta garantizada.
- Posible sesgo de datos: las bases de datos de fusion pueden estar desbalanceadas respecto a regimenes operativos y maquinas, lo que puede sesgar las predicciones.
- Incertidumbre no cuantificada en la informacion disponible: no se reportan metricas de calibracion ni intervalos de confianza.
- Licencia CC BY-SA 4.0: permite uso comercial con atribucion, pero exige compartir las obras derivadas bajo la misma licencia (share-alike), lo que puede condicionar productos propietarios.
- Atribucion obligatoria a las fuentes de datos: FAIR-MAST (UKAEA), HDB5, PR08, Open Density Limit Database y TCV deben citarse segun sus requisitos; PR08 no tiene licencia formal y se proporciona "as is".
- Checkpoint de referencia: para reproducir los resultados del articulo debe usarse la revision `release-2026.11.13rc2` (commit `1d917fc3fa0b7d30508f893e7cfa5a5c1c1b91ad`), no `main`.
- Artefactos de seleccion: `final.pt` es el resultado de una regla de seleccion interna; `old_recipe/final.pt` corresponde a una receta anterior y no al modelo reportado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/fusion-world-model/gru_10m_h-task-outputs
- Revision del articulo (commit): https://huggingface.co/fusion-world-model/gru_10m_h-task-outputs/tree/1d917fc3fa0b7d30508f893e7cfa5a5c1c1b91ad
- Licencia CC BY-SA 4.0: https://creativecommons.org/licenses/by-sa/4.0/
- FAIR-MAST (UKAEA): Jackson et al. 2025, IEEE Trans. Plasma Sci. 53, 2440, doi:10.1109/TPS.2025.3583419
- FAIR-MAST (UKAEA), software: Jackson et al. 2024, SoftwareX 27, 101869, doi:10.1016/j.softx.2024.101869
- HDB5 (International Global H-Mode Confinement Database): Verdoolaege et al. 2021, Nucl. Fusion 61, 076006, doi:10.1088/1741-4326/abdb91
- PR08 (ITPA multi-tokamak profile database): Roach et al. 2008, Nucl. Fusion 48, 125001, doi:10.1088/0029-5515/48/12/125001
- Open Density Limit Database (Alcator C-Mod): https://github.com/MIT-PSFC/open_density_limit_database
- TCV L-H transition database: Labit y Pau (2025), Zenodo doi:10.5281/zenodo.14996664
- TCV L-H transition database (articulo): Labit et al., Plasma Phys. Control. Fusion (2025), doi:10.1088/1361-6587/adc8ce
