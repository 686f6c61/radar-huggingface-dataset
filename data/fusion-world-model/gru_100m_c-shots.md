# fusion-world-model/gru_100m_c-shots

## Resumen

`gru_100m_c-shots` es un modelo del mundo (world model) para plasmas de tokamak desarrollado por el colectivo `fusion-world-model`. Se trata de una red recurrente de tipo GRU con un presupuesto de 100 millones de parametros, entrenada sobre datos experimentales de confinamiento y perfiles de plasma procedentes de bases de datos publicas de fusion (FAIR-MAST, HDB5, PR08, la base de limite de densidad de Alcator C-Mod y la base de transiciones L-H de TCV). Su objetivo es predecir la evolucion temporal del estado del plasma en un tokamak, lo que lo convierte en una herramienta de modelado predictivo y de control para investigacion en fusion por confinamiento magnetico.

El modelo se distribuye como checkpoints de PyTorch acompanados de la configuracion de entrenamiento, el registro de seleccion de hiperparametros y un manifiesto con hashes SHA-256. La receta `(c) shots only` indica que el entrenamiento se realizo exclusivamente con datos de disparos (shots) experimentales. El checkpoint de referencia del paper es la revision `release-2026.11.13rc2`; el autor senala ademas que las filas principales del paper usan una variante con diseno ganador de un piloto (2 capas, dropout 0.1, warmup de 4.000 pasos) alojada en el repositorio `gru-dw_100m_c-shots`, mientras que esta revision corresponde al diseno original del GRU.

Es relevante ahora porque ejemplifica el uso de modelos de series temporales ligeros como emuladores de dinamica de plasma, un campo donde los modelos fundacionales de fisica y los surrogates neuronales estan ganando peso para acelerar experimentos y disenar controladores. El repositorio incluye ademas controladores PPO entrenados dentro del world model congelado (carpeta `e4/`), lo que permite estudiar politicas de control sin coste experimental.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GRU (red neuronal recurrente) |
| Parametros totales | 100M (presupuesto declarado) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no aplica (modelo de series temporales, no de lenguaje) |
| Licencia | CC BY-SA 4.0 |
| Formato de pesos | PyTorch (`.pt`) |

## Arquitectura y entrenamiento

La arquitectura es una red recurrente GRU con un presupuesto de 100 millones de parametros. La model card menciona dos configuraciones: el diseno original de esta revision y el diseno ganador de un piloto (2 capas, dropout 0.1, warmup de 4.000 pasos), que es el que emplean las filas principales del paper. El checkpoint `final.pt` corresponde a la configuracion de indice 6 entre las 20 que entreno la busqueda de hiperparametros, seleccionada por la regla de seleccion del autor (los scores estan en `selection.json`). Se incluyen ademas `seed_1.pt` y `seed_2.pt`, que son la misma configuracion reentrenada con otras semillas.

El entrenamiento se realizo con la receta `(c) shots only`, es decir, exclusivamente con datos de disparos experimentales. Las fuentes de datos citadas son FAIR-MAST (UKAEA), HDB5 (International Global H-Mode Confinement Database), PR08 (base de perfiles multi-tokamak del ITPA), la Open Density Limit Database de Alcator C-Mod y la base de transiciones L-H de TCV. No se detalla en la informacion disponible el numero de tokens ni la composicion exacta del dataset, ni si hubo etapas de RLHF o DPO. La carpeta `e4/` contiene controladores PPO entrenados con una receta congelada dentro del world model de `final.pt`, uno por tarea y semilla, lo que sugiere un uso del modelo como entorno simulado para aprendizaje por refuerzo.

## Capacidades

- Prediccion de series temporales de estado de plasma en tokamaks (world model).
- Emulacion de dinamica de confinamiento y transiciones de regimen (incluye datos de transiciones L-H de TCV).
- Soporte como entorno simulado para entrenamiento de controladores mediante PPO (carpeta `e4/`).
- Modelado de limites de densidad y perfiles de plasma a partir de bases de datos multi-tokamak.
- Reproducibilidad mediante checkpoints por semilla y manifiesto con hashes SHA-256.
- No es un modelo de lenguaje: no soporta generacion de texto, tool calling, agentes ni capacidades multilingues.

## Casos de uso

- Emulacion rapida de la evolucion del plasma: el modelo puede sustituir simulaciones fisicas costosas en bucles de diseno, prediciendo la trayectoria temporal del estado del plasma a partir de condiciones iniciales y actuaciones.
- Entrenamiento de politicas de control: la carpeta `e4/` demuestra el uso del world model congelado como entorno para PPO, permitiendo entrenar controladores de plasma sin coste experimental ni riesgo en el tokamak real.
- Estudio de transiciones L-H: al haberse entrenado con la base de TCV, el modelo puede emplearse para analizar condiciones de transicion entre regimenes de confinamiento.
- Analisis de limites de densidad: con datos de Alcator C-Mod, sirve para explorar el comportamiento cerca del limite de densidad en escenarios simulados.
- Validacion cruzada entre tokamaks: al combinar FAIR-MAST, HDB5 y PR08, permite estudiar la transferibilidad de dinamicas entre dispositivos.
- Prototipado de estrategias de control antes de campanas experimentales: los controladores entrenados en el world model pueden evaluarse offline y priorizar que experimentos llevar al tokamak.
- Investigacion en modelado surrogate de fisica: util como baseline recurrente frente a modelos mas grandes o basados en transformers para series temporales de plasma.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la informacion proporcionada; con 100M de parametros en precision completa (fp32) el peso ronda los 0,4 GB, por lo que en la practica cabria en GPUs de consumo, pero no se confirma en la model card.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: previsiblemente si por tamano, pero no confirmado en la informacion disponible.
- Opciones de despliegue: no se documentan; los checkpoints son ficheros PyTorch guardados por el codigo de entrenamiento, sin mencion a vLLM, llama.cpp, Ollama ni TGI (herramientas orientadas a modelos de lenguaje, no aplicables directamente).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye modelos comparables de la misma categoria ni resultados que permitan una comparacion cuantitativa.

## Limitaciones y advertencias

- Modelo especifico de dominio (plasmas de tokamak); no es un modelo de lenguaje ni un modelo generalista.
- Entrenado con la receta `(c) shots only`; su validez fuera de la distribucion de disparos de las bases de datos citadas no esta garantizada.
- La model card distingue entre el diseno original (esta revision) y el diseno del piloto usado en las filas principales del paper; usar el checkpoint equivocado puede dar resultados no comparables con el paper.
- Licencia CC BY-SA 4.0: permite uso comercial, pero impone atribucion y compartir bajo la misma licencia las obras derivadas; ademas hereda las condiciones de atribucion de las fuentes de datos (FAIR-MAST, HDB5, PR08, Alcator C-Mod, TCV), algunas con requisitos de citacion especificos.
- PR08 se distribuye sin licencia formal y "as is"; conviene revisar las condiciones antes de redistribuir derivados.
- No se documentan sesgos, tasas de alucinacion ni limites de contexto en la informacion disponible.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta; no hay evidencia de validacion externa por la comunidad.

## Enlaces

- Hugging Face: https://huggingface.co/fusion-world-model/gru_100m_c-shots
- Repositorio de la variante del piloto: https://huggingface.co/fusion-world-model/gru-dw_100m_c-shots
- FAIR-MAST: Jackson et al. 2025, IEEE Trans. Plasma Sci. 53, 2440, doi:10.1109/TPS.2025.3583419
- FAIR-MAST software: Jackson et al. 2024, SoftwareX 27, 101869, doi:10.1016/j.softx.2024.101869
- HDB5: Verdoolaege et al. 2021, Nucl. Fusion 61, 076006, doi:10.1088/1741-4326/abdb91
- PR08: Roach et al. 2008, Nucl. Fusion 48, 125001, doi:10.1088/0029-5515/48/12/125001
- Open Density Limit Database: https://github.com/MIT-PSFC/open_density_limit_database
- TCV L-H transition database: https://doi.org/10.5281/zenodo.14996664
- TCV (paper): Labit et al., Plasma Phys. Control. Fusion (2025), doi:10.1088/1361-6587/adc8ce
- Licencia CC BY-SA 4.0: https://creativecommons.org/licenses/by-sa/4.0/
