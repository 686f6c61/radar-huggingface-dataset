# fusion-world-model/transformer_10m_d-sim-to-shots

## Resumen

`transformer_10m_d-sim-to-shots` es un modelo de mundo (world model) para plasmas de tokamak desarrollado por el colectivo `fusion-world-model`. Se trata de un transformer de aproximadamente 10 millones de parametros entrenado para predecir la evolucion temporal de descargas de plasma en dispositivos de fusion por confinamiento magnetico. El modelo forma parte de un estudio comparativo mas amplio (una busqueda de 30 configuraciones) documentado en un paper, y este repositorio publica el checkpoint seleccionado por la regla de seleccion del propio estudio, junto con dos replicas con semillas de entrenamiento alternativas.

La relevancia del modelo reside en su enfoque de modelado hibrido: la receta (d) consiste en un preentrenamiento sobre datos simulados seguido de un ajuste sobre descargas reales (shots). Esto permite al modelo aprender la dinamica fisica subyacente en un entorno controlado y luego adaptarse a la variabilidad y ruido de los datos experimentales de multiples tokamaks (FAIR-MAST, JET, Alcator C-Mod, TCV, SPARC, STEP, entre otros). Es, por tanto, una herramienta de investigacion para la prediccion de series temporales fisicas en el dominio de la fusion, no un modelo de lenguaje.

El modelo se distribuye como checkpoints de PyTorch (`.pt`) con un peso total de repositorio de aproximadamente 0,1 GB, lo que es coherente con un presupuesto de 10M de parametros. La licencia es CC BY-SA 4.0, heredada de los datos FAIR-MAST sobre los que se entrena. No se proporcionan datos sobre longitud de contexto, tokenizador ni idiomas, ya que no es un modelo de texto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (modelo de mundo para series temporales de plasma) |
| Parametros totales | ~10M (presupuesto de parametros segun el nombre y la model card) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (checkpoints en precision de entrenamiento PyTorch) |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | CC BY-SA 4.0 |
| Formato de pesos | PyTorch (`.pt`) |

## Arquitectura y entrenamiento

La arquitectura es un transformer de aproximadamente 10 millones de parametros disenado para modelar la evolucion temporal de estados de plasma en tokamaks. La receta de entrenamiento (d) es un esquema en dos fases: primero un preentrenamiento sobre datos de simulador (que aportan la fisica de referencia y cobertura del espacio de estados) y despues un ajuste sobre descargas experimentales reales (shots). El repositorio publica el checkpoint `final.pt`, correspondiente a la configuracion de indice 21 de las 30 exploradas en la busqueda de hiperparametros, seleccionada por la regla de seleccion del estudio (cuyas puntuaciones se recogen en `selection.json`). Se incluyen ademas `seed_1.pt` y `seed_2.pt`, que son la misma configuracion entrenada con semillas distintas, lo que permite evaluar la varianza del entrenamiento.

Los datos de entrenamiento proceden de una combinacion de bases de datos publicas y descripciones de maquinas: FAIR-MAST (UKAEA), la base de datos internacional HDB5 de confinamiento H, PR08 del ITPA, la base de datos de limite de densidad de Alcator C-Mod, la base de transicion L-H de TCV, el escenario SPP-001 de OpenSTEP, la descarga de referencia de SPARC, las tablas de flujos QLKNN10D y QLKNN11D, y descripciones de diseno de ITER, MAST Upgrade, SPARC y STEP. No se detallan en la model card el numero de tokens de entrenamiento, la composicion exacta del dataset ni si se emplearon tecnicas de RLHF o DPO (no aplicables en este dominio). La innovacion tecnica destacable es el propio enfoque de world model fisico con preentrenamiento sim-to-real sobre multiples tokamaks.

## Capacidades

- Prediccion de la evolucion temporal de estados de plasma en tokamaks (series temporales fisicas).
- Modelado de mundo: aprendizaje de la dinamica subyacente del plasma a partir de datos simulados y reales.
- Transferencia sim-to-real: preentrenamiento en simulador y ajuste sobre descargas experimentales.
- Generalizacion entre maquinas: entrenado con datos de multiples tokamaks (FAIR-MAST, JET, Alcator C-Mod, TCV, SPARC, STEP, ITER via descripciones de diseno).
- Evaluacion de robustez mediante replicas con semillas alternativas (`seed_1.pt`, `seed_2.pt`).
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, vision, audio ni capacidades multilingues: no es un modelo de lenguaje.

## Casos de uso

- Prediccion de la evolucion de perfiles de plasma: el modelo puede usarse para anticipar la trayectoria temporal de variables de plasma en escenarios de descarga, lo que ayuda a disenar estrategias de control en tiempo real en tokamaks como MAST Upgrade o SPARC.
- Validacion de simuladores: comparando las predicciones del world model con la salida de codigos de simulacion se puede detectar desviacion entre la fisica simulada y la observada en shots reales, gracias al preentrenamiento sim-to-real.
- Planificacion de escenarios en reactores futuros: con datos de descripciones de diseno de ITER y STEP, el modelo puede explorar la evolucion esperada de escenarios SPP-001 de OpenSTEP antes de ejecutar campanas experimentales costosas.
- Estudios de transicion L-H y limites de densidad: entrenado con las bases de datos de TCV y Alcator C-Mod, puede emplearse para analizar condiciones de transicion y proximidad al limite de densidad en distintos dispositivos.
- Analisis de sensibilidad y propagacion de incertidumbre: las replicas con semillas distintas permiten estimar la varianza del modelo y acotar la incertidumbre en predicciones de series temporales fisicas.
- Investigacion reproducible en fusion: al publicar checkpoint, configuracion, registro de seleccion y manifiesto con SHA-256, el modelo sirve como referencia reproducible para comparar recetas de world models en plasmas.
- Benchmarking de arquitecturas de series temporales en dominio cientifico: el modelo puede actuar como linea base de 10M de parametros frente a otras arquitecturas en tareas de prediccion de dinamica de plasma.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: muy reducida; con ~10M de parametros en precision completa (fp32) el checkpoint ocupa del orden de 40 MB, y el repositorio completo pesa ~0,1 GB. Cabe holgadamente en cualquier GPU consumer.
- GPU recomendadas: cualquier GPU moderna es suficiente; una RTX 3060, RTX 4090, A100 o H100 pueden ejecutar el modelo sin problema. Para lotes grandes o barridos de hiperparametros, una GPU con mas memoria acelera el proceso.
- Cabe en GPU consumer: si, en practicamente todas las GPU consumer con CUDA.
- Opciones de despliegue: al ser checkpoints de PyTorch guardados por el codigo de entrenamiento, el despliegue requiere cargar los `.pt` con PyTorch y el codigo de entrenamiento del autor; no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI (no aplicables).
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

No se dispone de informacion sobre modelos comparables de world models de plasma en la informacion proporcionada. La model card no incluye comparativas con alternativas.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| transformer_10m_d-sim-to-shots | ~10M | no disponible | CC BY-SA 4.0 | Hugging Face (checkpoints PyTorch) |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Ambito restringido: es un modelo de mundo para series temporales de plasma de tokamak, no un modelo de lenguaje ni un modelo generativo de proposito general.
- Ausencia de benchmarks publicos en la informacion disponible: no se puede evaluar su rendimiento frente a alternativas sin consultar el paper asociado.
- Dependencia de los datos de entrenamiento: al entrenarse sobre bases de datos publicas concretas (FAIR-MAST, HDB5, PR08, Alcator C-Mod, TCV, OpenSTEP, SPARC, QLKNN), su generalizacion a maquinas o regimenes no representados esta acotada.
- Licencia CC BY-SA 4.0: permite uso comercial con atribucion y obligacion de compartir bajo la misma licencia las obras derivadas; hay que respetar tambien las atribuciones y condiciones de cada fuente de datos listada en la model card (algunas sin licencia formal, como PR08, o con condiciones especificas de acknowledgement, como SPARC).
- Riesgo de extrapolacion fisica: las predicciones fuera del dominio de entrenamiento pueden no respetar restricciones fisicas; conviene validarlas contra simuladores o datos experimentales.
- Sin informacion sobre sesgos: no se documentan sesgos especificos, aunque al ser un modelo fisico el concepto de sesgo social no aplica; si aplica el sesgo de cobertura de los datos.
- Requiere el codigo de entrenamiento del autor para cargar y ejecutar los checkpoints; no se proporciona una API de inferencia estandar.
- Fecha de creacion del repositorio (2026-11-16) y ausencia de descargas e interacciones: modelo muy reciente y sin validacion comunitaria publica en el momento de la ficha.

## Enlaces

- Hugging Face: https://huggingface.co/fusion-world-model/transformer_10m_d-sim-to-shots
- Checkpoint del paper (tag `paper`, commit `f08f412611c59d3a446c6e5bbfc786405950b66c`): https://huggingface.co/fusion-world-model/transformer_10m_d-sim-to-shots/tree/paper
- Licencia CC BY-SA 4.0: https://creativecommons.org/licenses/by-sa/4.0/
- FAIR-MAST (UKAEA): Jackson et al. 2025, IEEE Trans. Plasma Sci. 53, 2440, doi:10.1109/TPS.2025.3583419; Jackson et al. 2024, SoftwareX 27, 101869, doi:10.1016/j.softx.2024.101869
- HDB5 (International Global H-Mode Confinement Database): Verdoolaege et al. 2021, Nucl. Fusion 61, 076006, doi:10.1088/1741-4326/abdb91
- PR08 (ITPA profile database): Roach et al. 2008, Nucl. Fusion 48, 125001, doi:10.1088/0029-5515/48/12/125001
- Open Density Limit Database (Alcator C-Mod): https://github.com/MIT-PSFC/open_density_limit_database
- TCV L-H transition database: Zenodo doi:10.5281/zenodo.14996664; Labit et al., Plasma Phys. Control. Fusion (2025), doi:10.1088/1361-6587/adc8ce
- OpenSTEP SPP-001: doi:10.14468/07jt-s540; Hudoba et al., Nucl. Fusion 64, 086055 (2024); Tholerus et al., Nucl. Fusion 64, 106030 (2024)
- SPARC baseline (Commonwealth Fusion Systems): Creely et al., J. Plasma Phys. 86, 865860502 (2020)
- QLKNN10D: Zenodo doi:10.5281/zenodo.3497066; QLKNN11D: Zenodo doi:10.5281/zenodo.8017522; van de Plassche et al., Phys. Plasmas 27, 022310 (2020), doi:10.1063/1.5134126
