# fusion-world-model/gru-dw_10m_h-task-outputs

## Resumen

`gru-dw_10m_h-task-outputs` es un checkpoint de un modelo de mundo (world model) para plasmas de tokamak, desarrollado por el proyecto `fusion-world-model`. No es un modelo de lenguaje: es un modelo de series temporales basado en una red recurrente GRU que predice la evolucion dinamica de un plasma de fusion a partir de senales de diagnostico, con un presupuesto de 10 millones de parametros y una receta de entrenamiento denominada (h) "reward-only" (salidas de tarea).

El modelo se presenta como la configuracion ganadora de una busqueda de hiperparametros (indice 20 de 25 configuraciones) con arquitectura GRU de 2 capas, dropout 0.1 y un calentamiento (warmup) de 4000 pasos. El repositorio incluye el checkpoint elegido (`final.pt`), dos replicas con semillas distintas (`seed_1.pt`, `seed_2.pt`), la configuracion de entrenamiento, el registro de seleccion y un manifiesto con hashes SHA-256. Existe ademas una revision etiquetada `paper` que corresponde al checkpoint exacto usado en la publicacion.

Su relevancia es de nicho pero clara: los world models de plasmas permiten simular y anticipar el comportamiento del plasma en reactores de fusion, lo que resulta util para control, planificacion de escenarios y estudio de transiciones (por ejemplo, L-H). El entrenamiento se apoya en bases de datos publicas de fisica de plasmas (FAIR-MAST, HDB5, PR08, Open Density Limit Database y la base de transiciones L-H de TCV), lo que condiciona tanto la licencia como las atribuciones exigidas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GRU (red neuronal recurrente con compuertas), 2 capas, dropout 0.1 |
| Parametros totales | Presupuesto de 10M (10 millones) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No aplica (modelo de series temporales, no linguistico) |
| Licencia | CC BY-SA 4.0 |
| Formato de pesos | PyTorch (`.pt`) |

## Arquitectura y entrenamiento

La arquitectura es una GRU de dos capas con dropout de 0.1 y un presupuesto de 10 millones de parametros, entrenada con un calentamiento de 4000 pasos. La configuracion concreta de `final.pt` se selecciono mediante una busqueda sobre 25 configuraciones, aplicando una regla de seleccion cuyas puntuaciones se recogen en `selection.json`. La receta empleada es la (h) "reward-only", que segun la nomenclatura del autor corresponde a las salidas de tarea (task outputs). Los checkpoints se guardaron con el codigo de entrenamiento en formato PyTorch nativo.

Los datos de entrenamiento proceden de varias bases de datos publicas de fisica de plasmas: FAIR-MAST (UKAEA), la base internacional HDB5 de confinamiento en modo H, la release publica de 2008 de la base de perfiles multi-tokamak PR08 del ITPA, la Open Density Limit Database (Alcator C-Mod) y la base de transiciones L-H de TCV (dataset limitado). No se especifican en la informacion disponible el numero total de tokens o pasos de entrenamiento, la composicion exacta del dataset ni si se aplicaron tecnicas de ajuste fino adicionales (RLHF/DPO no aplican a este dominio). Tampoco se documentan innovaciones como decodificacion especulativa o atencion lineal.

## Capacidades

- Prediccion de la evolucion temporal de estados de plasma en tokamaks a partir de senales de diagnostico.
- Modelado de mundo: simulacion autoregresiva de la dinamica del plasma para horizontes de prediccion.
- Representacion de escenarios de confinamiento en modo H (por la base HDB5) y de perfiles de plasma (por PR08).
- Modelado de transiciones L-H (por la base de TCV) y de limites de densidad (por la base de Alcator C-Mod).
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no aplica.
- Modo thinking, vision o audio: no disponible.

## Casos de uso

- Control predictivo de plasma: el modelo puede usarse como predictor de dinamica dentro de un lazo de control (model predictive control) para anticipar la evolucion de variables de plasma y ajustar actuadores con antelacion.
- Planificacion de escenarios de descarga: simular la evolucion de un escenario antes de ejecutarlo en el tokamak, reduciendo el riesgo de disrupciones y el coste de tiempo de maquina.
- Estudio de transiciones L-H: emplear el modelo para analizar condiciones de transicion y comparar predicciones con datos de TCV, apoyando el diseno de experimentos.
- Analisis de limites de densidad: evaluar el comportamiento cerca del limite de densidad usando la base de Alcator C-Mod como referencia para validacion cruzada.
- Generacion de datos sinteticos para aumento de dataset: producir trayectorias sinteticas de plasma para preentrenar o aumentar otros modelos de control cuando los datos reales son escasos.
- Investigacion en world models para fusion: servir como baseline reproducible (con semillas y manifiesto de hashes) para comparar nuevas arquitecturas o recetas de entrenamiento en el mismo dominio.
- Deteccion temprana de anomalias: usar el error de prediccion del modelo como senal de desviacion respecto al comportamiento esperado del plasma.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: muy baja; con 10M de parametros, el checkpoint en FP32 ocupa del orden de 40 MB, por lo que cabe holgadamente en cualquier GPU consumer.
- GPU recomendadas: cualquier GPU con al menos unos cientos de MB de VRAM libre; una RTX 4090 o incluso una GPU integrada son suficientes. Para entrenamiento o barridos de semillas, una GPU de gama media (por ejemplo, RTX 3060) es mas que suficiente.
- Cabe en GPU consumer: si, en practicamente todas las GPU consumer modernas e incluso en CPU para inferencia.
- Opciones de despliegue: al ser un checkpoint PyTorch nativo, se carga con `torch.load` y se sirve mediante un script de inferencia propio; no hay soporte documentado para vLLM, llama.cpp, Ollama o TGI (no aplican a este tipo de modelo).
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

No disponible. No se han identificado en la informacion proporcionada modelos comparables de world models de plasmas de tokamak con los que contrastar parametros, contexto, rendimiento o licencia.

## Limitaciones y advertencias

- El modelo esta especializado exclusivamente en dinamica de plasmas de tokamak; no es un modelo de lenguaje y no debe usarse para tareas de NLP.
- Alucinacion en sentido estricto no aplica, pero si el riesgo de predicciones fisicamente inconsistentes fuera del regimen de entrenamiento (extrapolacion a escenarios no representados en las bases de datos).
- La cobertura de datos depende de las bases publicas utilizadas (FAIR-MAST, HDB5, PR08, Alcator C-Mod, TCV); sesgos hacia las condiciones y maquinas representadas en esas bases.
- La licencia CC BY-SA 4.0 exige atribucion y compartir bajo la misma licencia las obras derivadas; es preciso cumplir las atribuciones especificas de cada base de datos (FAIR-MAST, HDB5, PR08, Open Density Limit Database y TCV), algunas con condiciones particulares como "provided as is" en PR08.
- No se documentan en la informacion disponible el contexto maximo, la sensibilidad a hiperparametros de inferencia ni el rendimiento fuera de las semillas reportadas.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que indica escasa validacion externa por parte de la comunidad.

## Enlaces

- Hugging Face: https://huggingface.co/fusion-world-model/gru-dw_10m_h-task-outputs
- Checkpoint de la publicacion (tag `paper`): commit `3474821fc7056613111ecc1c77f253f3f672b948`
- FAIR-MAST (UKAEA), articulo: Jackson et al. 2025, IEEE Trans. Plasma Sci. 53, 2440, doi:10.1109/TPS.2025.3583419
- FAIR-MAST (UKAEA), software: Jackson et al. 2024, SoftwareX 27, 101869, doi:10.1016/j.softx.2024.101869
- HDB5, International Global H-Mode Confinement Database (DB5.2.3): Verdoolaege et al. 2021, Nucl. Fusion 61, 076006, doi:10.1088/1741-4326/abdb91
- PR08, ITPA multi-tokamak profile database: Roach et al. 2008, Nucl. Fusion 48, 125001, doi:10.1088/0029-5515/48/12/125001
- Open Density Limit Database (Alcator C-Mod): https://github.com/MIT-PSFC/open_density_limit_database
- TCV L-H transition database: Labit and Pau (2025), Zenodo doi:10.5281/zenodo.14996664
- TCV L-H transition database, articulo: Labit et al., Plasma Phys. Control. Fusion (2025), doi:10.1088/1361-6587/adc8ce
- Licencia CC BY-SA 4.0: https://creativecommons.org/licenses/by-sa/4.0/
