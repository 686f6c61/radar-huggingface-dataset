# fusion-world-model/gru_100m_f-sim

## Resumen

`gru_100m_f-sim` es un modelo del mundo (world model) para plasmas de tokamak desarrollado por el colectivo `fusion-world-model`. No es un modelo de lenguaje: es una red recurrente GRU con un presupuesto de 100 millones de parametros que actua como emulador de simulador (recipe f) del comportamiento dinamico de plasmas de fusion, entrenada sobre bases de datos experimentales de multiples tokamaks (FAIR-MAST, HDB5, PR08, SPARC, STEP, TCV, entre otras).

El modelo se publica como artefacto de investigacion asociado a un paper, con un checkpoint principal (`final.pt`) seleccionado entre 20 configuraciones de una busqueda de hiperparametros, mas dos replicas con semillas distintas (`seed_1.pt`, `seed_2.pt`). Su relevancia radica en que permite sustituir costosas simulaciones fisicas por inferencia neuronal rapida, habilitando entrenamiento de controladores (por ejemplo, PPO) dentro de un world model congelado, como demuestran los controladores incluidos en el directorio `e4/`.

La licencia es CC BY-SA 4.0, heredada de los datos FAIR-MAST, lo que impone obligaciones de atribucion y compartir-igual en obras derivadas. El repositorio ocupa 2,8 GB y los pesos se distribuyen en formato PyTorch (`.pt`), no en safetensors ni GGUF.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GRU (red neuronal recurrente) |
| Parametros totales | 100M (presupuesto de parametros declarado) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en PyTorch de precision nativa) |
| Idiomas soportados | no disponible (modelo no linguistico) |
| Licencia | CC BY-SA 4.0 |
| Formato de pesos | PyTorch (`.pt`) |
| Capas | 2 (configuracion ganadora del piloto de diseno) |
| Dropout | 0,1 |
| Warmup de learning rate | 4.000 pasos |
| Tamano del repositorio | 2,8 GB |
| Libreria | PyTorch |
| Dominio | Tokamak / fusion / series temporales / world model |

## Arquitectura y entrenamiento

La arquitectura es una GRU de dos capas con dropout de 0,1 y un warmup de learning rate de 4.000 pasos, segun la configuracion ganadora del piloto de diseno del paper. El checkpoint publicado (`final.pt`) corresponde a la configuracion de indice 0 entre las 20 entrenadas en la busqueda de hiperparametros, seleccionada por la regla de seleccion documentada en `selection.json`. Las replicas `seed_1.pt` y `seed_2.pt` reentrenan la misma configuracion con semillas distintas para estimar variabilidad.

El modelo se entrena como emulador de simulador (recipe f) sobre un corpus agregado de bases de datos experimentales y de simulacion de tokamaks: FAIR-MAST (UKAEA), HDB5 (base de datos internacional de confinamiento H-mode), PR08 (base de perfiles multi-tokamak del ITPA), la Open Density Limit Database de Alcator C-Mod, la base de transiciones L-H de TCV, OpenSTEP (escenario SPP-001 de STEP), SPARCPublic (descargas de referencia de SPARC), las tablas de flujos QuaLiKiz QLKNN10D y QLKNN11D, y descripciones de maquina de ITER, MAST Upgrade, SPARC y STEP. No se especifica en la informacion disponible el numero total de tokens ni la composicion exacta del dataset, ni si hubo etapas de RLHF o DPO (no aplicables en sentido estricto a un modelo de series temporales).

Una innovacion destacable es el uso del world model como entorno congelado para entrenar controladores con PPO: el directorio `e4/` contiene los controladores de la Evaluacion 4, uno por tarea y semilla, entrenados con una receta PPO congelada. El repositorio tambien incluye un checkpoint bajo la receta anterior (`old_recipe/final.pt`) con un suelo inferior sobre la dispersion predicha, sin tope en la verosimilitud y sin warmup, util para comparar recetas.

## Capacidades

- Emulacion de la dinamica de plasmas de tokamak como sustituto rapido de simuladores fisicos.
- Prediccion de series temporales multivariantes propias de descargas de plasma.
- Modelado de escenarios de confinamiento H-mode y transiciones L-H.
- Soporte como entorno congelado para entrenamiento de politicas de control con PPO.
- Generalizacion entre maquinas: el entrenamiento cubre ITER, MAST Upgrade, SPARC, STEP, TCV y Alcator C-Mod.
- Estimacion de dispersion predictiva (con receta ajustada respecto a la version anterior).
- No soporta generacion de texto, codigo, vision ni tool calling: es un modelo puramente numerico de dominio fisico.

## Casos de uso

- **Sustitucion de simuladores en bucles de optimizacion**: usar el emulador para evaluar miles de configuraciones de descarga en minutos en lugar de horas de simulacion, gracias al coste de inferencia de una GRU de 100M.
- **Entrenamiento de controladores de plasma**: emplear el world model congelado como entorno para PPO u otros algoritmos de RL, tal como se hace en `e4/`, evitando el coste de interactuar con el simulador real.
- **Exploracion de escenarios para reactores futuros**: evaluar rapidamente escenarios candidatos para ITER, SPARC o STEP antes de lanzar campanas experimentales costosas.
- **Estudios de sensibilidad y analisis de incertidumbre**: aprovechar las replicas con semillas distintas (`seed_1.pt`, `seed_2.pt`) para cuantificar la variabilidad del emulador en las predicciones.
- **Prototipado de estrategias de control en TCV o MAST Upgrade**: simular respuestas del plasma a actuaciones de control antes de trasladarlas a la maquina.
- **Generacion de datos sinteticos aumentados**: producir trayectorias plausibles de plasma para preentrenar otros modelos o controladores cuando los datos experimentales son escasos.
- **Comparacion de recetas de entrenamiento**: usar `old_recipe/final.pt` frente a `final.pt` para estudiar el efecto del suelo de dispersion, el tope de verosimilitud y el warmup.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la informacion; con 100M parametros en precision nativa (fp32) el peso de los parametros ronda los 400 MB, pero no se documenta el coste de activaciones ni la longitud de secuencia.
- GPU recomendadas: no disponible. Por tamano, cualquier GPU consumer moderna (RTX 3060 o superior) deberia poder alojar los pesos; no se confirma en la model card.
- Cabe en GPU consumer: probablemente si, dado el tamano de 100M parametros, aunque no esta verificado en la informacion proporcionada.
- Opciones de despliegue: no se documentan; los pesos son archivos PyTorch (`.pt`) cargables con PyTorch. No hay pesos GGUF ni soporte declarado para vLLM, llama.cpp, Ollama o TGI (herramientas orientadas a LLM, no aplicables directamente).
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye modelos comparables de emulacion de plasmas de tokamak ni referencias a alternativas de la misma categoria.

## Limitaciones y advertencias

- Modelo de dominio muy especifico (plasmas de tokamak); no es un modelo de lenguaje ni un modelo generalista.
- Sesgos potenciales derivados de la composicion del dataset: predominio de ciertas maquinas y regimenes (H-mode, escenarios de referencia) puede limitar la generalizacion a regimenes poco representados.
- Riesgo de extrapolacion incorrecta fuera del espacio de entrenamiento; el propio autor advierte que la configuracion `followup` queda "beyond the edge of its search space".
- Licencia CC BY-SA 4.0: obliga a atribucion y a compartir bajo la misma licencia las obras derivadas; revisar compatibilidad antes de uso comercial o integracion en productos propietarios.
- Multiples obligaciones de atribucion heredadas de los datasets de origen (FAIR-MAST, HDB5, PR08, OpenSTEP, SPARCPublic, QLKNN, entre otros), algunas con condiciones especificas de cita.
- PR08 se distribuye sin licencia formal, "as is", lo que anade incertidumbre juridica.
- No se documentan metricas de rendimiento ni validacion fuera de distribucion en la informacion disponible.
- El checkpoint del paper es la revision `release-2026.11.13rc2` (commit `5bcf00ad...`); usar otra revision puede no corresponder a los resultados publicados.
- No hay garantia de soporte ni mantenimiento; el repositorio tiene 1 descarga y 0 likes en el momento de la consulta.

## Enlaces

- Hugging Face: https://huggingface.co/fusion-world-model/gru_100m_f-sim
- Revision del paper: tag `release-2026.11.13rc2`, commit `5bcf00ad4d5f187c5f91ecf4e5a6b1c63e6ce8ef`
- FAIR-MAST (UKAEA): Jackson et al. 2025, IEEE Trans. Plasma Sci. 53, 2440, doi:10.1109/TPS.2025.3583419
- FAIR-MAST software: Jackson et al. 2024, SoftwareX 27, 101869, doi:10.1016/j.softx.2024.101869
- HDB5 (DB5.2.3): Verdoolaege et al. 2021, Nucl. Fusion 61, 076006, doi:10.1088/1741-4326/abdb91
- PR08 (ITPA profile database): Roach et al. 2008, Nucl. Fusion 48, 125001, doi:10.1088/0029-5515/48/12/125001
- Open Density Limit Database: https://github.com/MIT-PSFC/open_density_limit_database
- TCV L-H transition database: Zenodo doi:10.5281/zenodo.14996664; Labit et al., Plasma Phys. Control. Fusion (2025), doi:10.1088/1361-6587/adc8ce
- OpenSTEP (SPP-001): doi:10.14468/07jt-s540; Hudoba et al., Nucl. Fusion 64, 086055 (2024); Tholerus et al., Nucl. Fusion 64, 106030 (2024)
- SPARCPublic: Creely et al., J. Plasma Phys. 86, 865860502 (2020)
- QLKNN10D: Zenodo doi:10.5281/zenodo.3497066; van de Plassche et al., Phys. Plasmas 27, 022310 (2020), doi:10.1063/1.5134126
- QLKNN11D: Zenodo doi:10.5281/zenodo.8017522
- ITER Physics Basis: Nucl. Fusion 39 (1999) 2137 y Nucl. Fusion 47 (2007) S1
- MAST Upgrade: Nucl. Fusion 64 (2024), doi:10.1088/1741-4326/ad6011 y doi:10.1088/1741-4326/ad56a2
- SPARC: Creely et al., J. Plasma Phys. 86 (2020) 865860502 y Phys. Plasmas 30 (2023) 090601
- STEP: Meyer and the STEP Team, Phil. Trans. R. Soc. A 382 (2024) 20230406
- Licencia CC BY-SA 4.0: https://creativecommons.org/licenses/by-sa/4.0/
