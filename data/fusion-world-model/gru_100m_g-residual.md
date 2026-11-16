# fusion-world-model/gru_100m_g-residual

## Resumen

`gru_100m_g-residual` es un modelo del mundo (world model) para plasmas de tokamak desarrollado por el colectivo `fusion-world-model`. Se trata de una red recurrente de tipo GRU con un presupuesto de 100 millones de parametros, entrenada con la receta denominada "emulator + correction", que combina un emulador congelado de fisica del plasma con una correccion aprendida. El modelo predice la evolucion temporal de variables de plasma en reactores de fusion, un problema de series temporales de alta dimensionalidad y dinamica no lineal.

El modelo es relevante porque la investigacion en fusion por confinamiento magnetico depende de simulaciones y control en tiempo real de plasmas, y los world models ligeros permiten acelerar la evaluacion de escenarios y servir como entorno para entrenar controladores mediante aprendizaje por refuerzo. De hecho, el repositorio incluye controladores PPO entrenados dentro del propio world model (`e4/`), lo que ilustra su uso como simulador para RL.

La ficha se basa exclusivamente en la model card publicada. No hay informacion sobre el numero de tokens de entrenamiento, la longitud de contexto operativa ni resultados de benchmarks en la informacion disponible. El checkpoint de referencia del articulo es la revision `release-2026.11.13rc2`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GRU (red neuronal recurrente), receta emulador + correccion |
| Parametros totales | 100M (presupuesto declarado) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo de series temporales, no linguistico) |
| Licencia | CC BY-SA 4.0 |
| Formato de pesos | PyTorch (`.pt`); emulador congelado en `emulator.pt` |

## Arquitectura y entrenamiento

La arquitectura es una GRU (Gated Recurrent Unit) con un presupuesto de parametros de 100M, configurada con 2 capas, dropout de 0,1 y un calentamiento (warmup) de 4.000 pasos en el diseno piloto ganador del articulo. La receta de entrenamiento es "emulator + correction": el modelo carga un emulador congelado (`emulator.pt`) y aprende una correccion sobre sus predicciones, de modo que el world model combina conocimiento fisico preexistente con una capa aprendida de ajuste.

El checkpoint `final.pt` corresponde a la configuracion de indice 6 de las 25 configuraciones exploradas en la busqueda de hiperparametros, seleccionada por la regla de seleccion del propio search (los scores estan en `selection.json`). Se incluyen dos semillas adicionales (`seed_1.pt`, `seed_2.pt`) de la misma configuracion. No se especifican en la informacion disponible el volumen de datos de entrenamiento, la composicion exacta del dataset ni si se empleo RLHF/DPO. Los datos de entrenamiento se apoyan en bases de datos publicas de fusion como FAIR-MAST, HDB5, PR08, la Open Density Limit Database, la base de transiciones L-H de TCV, OpenSTEP, SPARCPublic, las tablas de flujos QLKNN10D/QLKNN11D y descripciones de maquinas (ITER, MAST Upgrade, SPARC, STEP).

## Capacidades

- Prediccion de la evolucion temporal de plasmas de tokamak como world model de series temporales.
- Emulacion con correccion aprendida sobre un emulador fisico congelado.
- Servir como entorno de simulacion para entrenar controladores mediante RL (se incluyen controladores PPO en `e4/`).
- Evaluacion de escenarios de plasma en multiples maquinas (ITER, MAST Upgrade, SPARC, STEP) segun las fuentes de datos citadas.
- Reproducibilidad mediante multiples semillas de entrenamiento y manifiesto con hashes SHA-256.
- No se documentan capacidades de generacion de texto, codigo, vision, audio, tool calling ni razonamiento multilingue.

## Casos de uso

- Simulacion rapida de escenarios de plasma: el world model sustituye o acelera simulaciones fisicas costosas para explorar configuraciones de descarga en tokamaks como ITER o SPARC, apoyandose en el emulador congelado y la correccion aprendida.
- Entrenamiento de controladores por refuerzo: los controladores PPO incluidos en `e4/` demuestran el uso del modelo como entorno de RL para aprender politicas de control del plasma sin coste de simulacion fisica completa.
- Estudios de transiciones de confinamiento: modelar transiciones L-H usando la base de datos de TCV como referencia para analizar condiciones de disparo.
- Analisis de limites de densidad: emplear la Open Density Limit Database de Alcator C-Mod para estudiar el comportamiento cerca del limite de densidad en escenarios simulados.
- Evaluacion comparativa de maquinas: usar las descripciones de ITER, MAST Upgrade, SPARC y STEP para comparar predicciones del modelo entre geometrias y parametros de operacion.
- Investigacion reproducible: aprovechar las semillas multiples y el manifiesto SHA-256 para replicar experimentos y cuantificar la varianza entre entrenamientos.
- Prototipado de estrategias de control antes de validacion en experimento real, reduciendo el numero de descargas necesarias.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; con 100M parametros en precision completa (FP32) el peso ronda los 0,4 GB, pero la memoria total depende de la longitud de secuencia y del estado recurrente, no documentados.
- GPU recomendadas: no disponibles en la informacion; por tamano, cualquier GPU con al menos unos pocos GB de VRAM deberia poder cargar los pesos.
- Cabe en GPU de consumo: probablemente si, dado el tamano de 100M parametros, aunque no se confirma en la model card.
- Opciones de despliegue: los checkpoints son archivos PyTorch (`.pt`) guardados por el codigo de entrenamiento; no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI (no aplicables a un modelo de series temporales).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye modelos comparables de world models de tokamak ni referencias de rendimiento frente a alternativas.

## Limitaciones y advertencias

- Modelo especifico de dominio (plasmas de tokamak); no es un modelo de lenguaje ni tiene capacidades generales.
- No se documentan sesgos, pero al entrenarse sobre bases de datos de maquinas concretas puede generalizar mal a geometrias o regimenes no representados.
- Riesgo de error en extrapolacion fuera de la distribucion de los datos de entrenamiento (escenarios de plasma no vistos).
- La licencia CC BY-SA 4.0 es copyleft: las obras derivadas deben distribuirse bajo la misma licencia y con atribucion; revisar implicaciones para uso comercial.
- La licencia se hereda de los datos FAIR-MAST; hay que respetar las atribuciones y condiciones de cada fuente de datos citada (algunas sin licencia formal, como PR08, o con requisitos de reconocimiento especificos, como SPARCPublic).
- El checkpoint del articulo es una revision concreta (`release-2026.11.13rc2`); usar otra revision puede dar resultados distintos a los reportados.
- No se documentan la longitud de contexto ni el regimen de inferencia, lo que dificulta planificar despliegues en produccion.
- Ausencia de benchmarks publicos en la informacion disponible impide validar el rendimiento de forma independiente.

## Enlaces

- Hugging Face: https://huggingface.co/fusion-world-model/gru_100m_g-residual
- Revision del articulo: commit `6d6ab400328525dad0ab45bb6edf6e7776fc2c08` (tag `release-2026.11.13rc2`)
- FAIR-MAST (UKAEA): Jackson et al. 2025, IEEE Trans. Plasma Sci. 53, 2440, doi:10.1109/TPS.2025.3583419; Jackson et al. 2024, SoftwareX 27, 101869, doi:10.1016/j.softx.2024.101869
- HDB5 (International Global H-Mode Confinement Database): Verdoolaege et al. 2021, Nucl. Fusion 61, 076006, doi:10.1088/1741-4326/abdb91
- PR08 (ITPA profile database): Roach et al. 2008, Nucl. Fusion 48, 125001, doi:10.1088/0029-5515/48/12/125001
- Open Density Limit Database (Alcator C-Mod): https://github.com/MIT-PSFC/open_density_limit_database
- TCV L-H transition database: Zenodo doi:10.5281/zenodo.14996664; Labit et al., Plasma Phys. Control. Fusion (2025), doi:10.1088/1361-6587/adc8ce
- OpenSTEP (SPP-001): doi:10.14468/07jt-s540; Hudoba et al., Nucl. Fusion 64, 086055 (2024); Tholerus et al., Nucl. Fusion 64, 106030 (2024)
- SPARCPublic (Commonwealth Fusion Systems): Creely et al., J. Plasma Phys. 86, 865860502 (2020)
- QLKNN10D / QLKNN11D: Zenodo doi:10.5281/zenodo.3497066 y doi:10.5281/zenodo.8017522; van de Plassche et al., Phys. Plasmas 27, 022310 (2020), doi:10.1063/1.5134126
- ITER Physics Basis: Nucl. Fusion 39 (1999) 2137 y Nucl. Fusion 47 (2007) S1
- MAST Upgrade: Nucl. Fusion 64 (2024), doi:10.1088/1741-4326/ad6011 y doi:10.1088/1741-4326/ad56a2
- SPARC: Creely et al., J. Plasma Phys. 86 (2020) 865860502; Phys. Plasmas 30 (2023) 090601
- STEP: Meyer and the STEP Team, Phil. Trans. R. Soc. A 382 (2024) 20230406; OpenSTEP, doi:10.14468/07jt-s540
- Licencia CC BY-SA 4.0: https://creativecommons.org/licenses/by-sa/4.0/
