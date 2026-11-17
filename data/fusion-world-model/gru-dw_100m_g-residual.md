# fusion-world-model/gru-dw_100m_g-residual

## Resumen

`gru-dw_100m_g-residual` es un modelo neuronal entrenado como emulador y corrector de la dinámica de plasmas de tokamak, desarrollado por el usuario `fusion-world-model` y publicado en Hugging Face bajo licencia CC BY-SA 4.0. Se trata de un modelo de tipo world model para series temporales, con una arquitectura recurrente GRU de 2 capas y un presupuesto de 100 millones de parametros, que combina un emulador congelado (cargado desde `emulator.pt`) con una etapa de correccion residual entrenada sobre datos experimentales de fusion.

El modelo no es un modelo de lenguaje: no procesa texto ni tiene capacidades generativas generales. Su proposito es predecir la evolucion temporal de variables de plasma en reactores de tipo tokamak, apoyandose en un conjunto de bases de datos publicas de fusion (FAIR-MAST, HDB5, PR08, QLKNN, entre otras) y en descripciones de maquinas como ITER, MAST Upgrade, SPARC y STEP. Es relevante porque aborda un problema de modelado cientifico complejo —la prediccion de confinamiento y transporte en plasmas— con un enfoque de emulacion aprendida combinada con correccion, lo que puede acelerar la simulacion frente a codigos fisicos de alto coste computacional.

El checkpoint publicado (`final.pt`) corresponde a la configuracion seleccionada por la regla de seleccion del autor entre 25 configuraciones entrenadas durante la busqueda, e incluye semillas adicionales (`seed_1.pt`, `seed_2.pt`) para reproducibilidad. El repositorio ocupa 1.2 GB e incluye el emulador congelado, la configuracion de entrenamiento, el registro de seleccion y un manifiesto con hashes SHA-256.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GRU recurrente, 2 capas, dropout 0.1, warmup de 4.000 pasos |
| Parametros totales | 100M (presupuesto declarado) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo de series temporales, no linguistico) |
| Licencia | CC BY-SA 4.0 |
| Formato de pesos | PyTorch (`.pt`) |

## Arquitectura y entrenamiento

El modelo es una red recurrente GRU de dos capas con dropout de 0.1 y un calentamiento de 4.000 pasos, entrenada bajo una receta denominada "emulator + correction" (receta g). La arquitectura combina un emulador congelado (`emulator.pt`), que presumiblemente aproxima la fisica del plasma a partir de tablas de flujos como QLKNN10D y QLKNN11D, con una correccion residual aprendida por la GRU. No se dispone de informacion sobre el numero de tokens de entrenamiento ni sobre la composicion exacta del dataset, aunque la model card enumera las fuentes de datos: FAIR-MAST (UKAEA), HDB5, PR08, la Open Density Limit Database, la base de transicion L-H de TCV, OpenSTEP, SPARCPublic y las tablas de flujos QuaLiKiz.

La seleccion del checkpoint final se realizo mediante una regla de seleccion documentada en `selection.json`, que puntua las 25 configuraciones entrenadas durante la busqueda. No se menciona el uso de RLHF, DPO ni tecnicas de alineacion, lo cual es coherente con un modelo de regresion cientifica. Tampoco se documentan innovaciones como decodificacion especulativa o atencion lineal, dado que la arquitectura es puramente recurrente.

## Capacidades

- Prediccion de series temporales de variables de plasma en tokamaks.
- Emulacion de la fisica del plasma mediante un emulador congelado combinado con una correccion residual aprendida.
- Modelado de escenarios de confinamiento y transiciones (por ejemplo, transicion L-H) a partir de bases de datos experimentales.
- Aplicacion a multiples maquinas: ITER, MAST Upgrade, SPARC y STEP, segun las descripciones de maquina referenciadas.
- No soporta tool calling, function calling ni razonamiento multi-paso.
- No tiene capacidades multilingues ni de generacion de texto.
- No dispone de modo thinking, vision ni audio.

## Casos de uso

- Simulacion acelerada de escenarios de plasma: el modelo puede sustituir o complementar codigos fisicos lentos en la exploracion de espacios de parametros de operacion de tokamaks, gracias a su naturaleza de emulador aprendido.
- Prediccion de transiciones de confinamiento: la incorporacion de la base de datos de transicion L-H de TCV permite entrenar y evaluar la prediccion de cambios de regimen en el plasma.
- Estudio de limites de densidad: el uso de la Open Density Limit Database de Alcator C-Mod hace al modelo adecuado para analizar el comportamiento cerca del limite de densidad.
- Diseno de escenarios para reactores futuros: las descripciones de ITER, SPARC y STEP permiten emplear el modelo en la evaluacion preliminar de escenarios operativos de estas maquinas.
- Correccion de emuladores existentes: la etapa de correccion residual puede aplicarse sobre emuladores basados en tablas de flujos (QLKNN) para mejorar su fidelidad frente a datos experimentales.
- Reproducibilidad de experimentos cientificos: la inclusion de semillas adicionales y de un manifiesto con hashes SHA-256 facilita la verificacion y replicacion de resultados en estudios de fusion.
- Analisis de sensibilidad y incertidumbre: al ser un modelo ligero (100M parametros), permite ejecutar barridos de parametros y estudios de robustez con coste computacional bajo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; con 100M parametros en precision completa (FP32) serian aproximadamente 0,4 GB solo para pesos, mas overhead de activaciones y del emulador congelado.
- GPU recomendadas: no disponible; por tamano, cualquier GPU consumer moderna (por ejemplo, RTX 3060 o superior) deberia poder cargar el modelo en FP32.
- Cabe en GPU consumer: si, previsiblemente, dado el presupuesto de 100M parametros.
- Opciones de despliegue: no disponible; al ser un checkpoint PyTorch (`.pt`), requiere el codigo de entrenamiento del autor para cargarse. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No disponible. No se han identificado en la informacion proporcionada modelos comparables de emulacion de plasmas de tokamak con caracteristicas equivalentes.

## Limitaciones y advertencias

- Modelo de dominio muy especifico (plasmas de tokamak); no es utilizable fuera de ese ambito.
- No es un modelo de lenguaje: no procesa texto, no responde a prompts en lenguaje natural y no tiene capacidades generativas generales.
- Riesgo de extrapolacion fuera de la distribucion de entrenamiento: al entrenarse sobre bases de datos experimentales concretas, su validez fuera de esos regimenes no esta garantizada.
- Dependencia del emulador congelado: el modelo requiere cargar `emulator.pt`, lo que anade una dependencia adicional para su uso.
- Licencia CC BY-SA 4.0: permite uso comercial con atribucion y compartir-al-igual; las obras derivadas deben distribuirse bajo la misma licencia.
- Obligaciones de atribucion multiple: la model card exige citar cada una de las fuentes de datos (FAIR-MAST, HDB5, PR08, etc.) en cualquier trabajo derivado, lo que puede complicar su uso en produccion.
- No se documentan sesgos, pero al derivarse de datos experimentales de unas pocas maquinas, puede heredar sesgos de esos dispositivos.
- Ausencia de benchmarks publicados: no es posible evaluar su rendimiento frente a alternativas.
- Fecha de creacion futura (2026-11-16) en los metadatos de Hugging Face, lo que conviene verificar antes de su adopcion.

## Enlaces

- Hugging Face: https://huggingface.co/fusion-world-model/gru-dw_100m_g-residual
- Licencia CC BY-SA 4.0: https://creativecommons.org/licenses/by-sa/4.0/
- FAIR-MAST (UKAEA): Jackson et al. 2025, IEEE Trans. Plasma Sci. 53, 2440, doi:10.1109/TPS.2025.3583419; Jackson et al. 2024, SoftwareX 27, 101869, doi:10.1016/j.softx.2024.101869
- HDB5: Verdoolaege et al. 2021, Nucl. Fusion 61, 076006, doi:10.1088/1741-4326/abdb91
- PR08: Roach et al. 2008, Nucl. Fusion 48, 125001, doi:10.1088/0029-5515/48/12/125001
- Open Density Limit Database: https://github.com/MIT-PSFC/open_density_limit_database
- TCV L-H transition database: doi:10.5281/zenodo.14996664; Labit et al., Plasma Phys. Control. Fusion (2025), doi:10.1088/1361-6587/adc8ce
- OpenSTEP: doi:10.14468/07jt-s540; Hudoba et al., Nucl. Fusion 64, 086055 (2024); Tholerus et al., Nucl. Fusion 64, 106030 (2024)
- SPARCPublic: Creely et al., J. Plasma Phys. 86, 865860502 (2020)
- QLKNN10D: doi:10.5281/zenodo.3497066; QLKNN11D: doi:10.5281/zenodo.8017522; van de Plassche et al., Phys. Plasmas 27, 022310 (2020), doi:10.1063/1.5134126
- ITER Physics Basis: Nucl. Fusion 39 (1999) 2137; Nucl. Fusion 47 (2007) S1
- MAST Upgrade: Nucl. Fusion 64 (2024), doi:10.1088/1741-4326/ad6011; doi:10.1088/1741-4326/ad56a2
- SPARC: Creely et al., J. Plasma Phys. 86 (2020) 865860502; Phys. Plasmas 30 (2023) 090601
- STEP: Meyer and the STEP Team, Phil. Trans. R. Soc. A 382 (2024) 20230406
