# fusion-world-model/gru-dw_100m_d-sim-to-shots

## Resumen

`gru-dw_100m_d-sim-to-shots` es un modelo del mundo (*world model*) para plasmas de tokamak desarrollado por el usuario `fusion-world-model`. No es un modelo de lenguaje: es una red recurrente GRU que modela la dinamica temporal de descargas de plasma en reactores de fusion, con el objetivo de predecir la evolucion del estado del plasma a partir de condiciones iniciales y actuaciones. Se publica como parte del trabajo que describe un banco de pruebas y un procedimiento de busqueda de arquitecturas para modelos del mundo aplicados a tokamaks.

El checkpoint corresponde a una configuracion concreta de un presupuesto de 100 millones de parametros: GRU de 2 capas, dropout 0,1 y un calentamiento (*warmup*) de 4000 pasos, seleccionada como la mejor de 25 configuraciones evaluadas por la regla de seleccion del autor. La receta de entrenamiento es la denominada (d): preentrenamiento sobre datos de simulador y posterior ajuste con descargas reales (*shots*).

Su relevancia radica en el dominio: la prediccion de la evolucion del plasma es un problema central para el control y la planificacion de escenarios en reactores como ITER, SPARC, STEP o MAST Upgrade. El modelo se distribuye con licencia CC BY-SA 4.0, condicionada por las licencias de los datos de entrenamiento (FAIR-MAST y otras bases de datos cientificas).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GRU (red neuronal recurrente con compuertas), 2 capas, dropout 0,1 |
| Parametros totales | 100M (presupuesto de diseno) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no aplica (modelo de series temporales, no linguistico) |
| Licencia | CC BY-SA 4.0 |
| Formato de pesos | PyTorch (`.pt`), guardados por el codigo de entrenamiento |

## Arquitectura y entrenamiento

La arquitectura es una GRU de dos capas con dropout de 0,1 y un calentamiento de 4000 pasos, dentro de un presupuesto de 100 millones de parametros. Se trata de un modelo del mundo para series temporales de diagnostico de plasma: aprende la transicion dinamica del estado del tokamak, no la genera texto ni imagenes. La configuracion concreta se eligio mediante una busqueda sobre 25 configuraciones; `final.pt` corresponde al indice 10, la que la regla de seleccion del autor clasifica en primer lugar (los scores estan en `selection.json`).

El entrenamiento sigue la receta (d): preentrenamiento sobre datos de simulador y posterior ajuste con descargas reales (*sim-to-shots*). Los datos de entrenamiento se apoyan en un conjunto de fuentes cientificas citadas en la model card: FAIR-MAST (UKAEA), HDB5 (base de datos internacional de confinamiento H), PR08 (perfiles multi-tokamak del ITPA), la base de datos abierta de limite de densidad de Alcator C-Mod, la base de datos de transicion L-H de TCV, OpenSTEP (escenario SPP-001 de STEP), SPARCPublic (descarga de referencia de SPARC), las tablas de flujos QLKNN10D y QLKNN11D de QuaLiKiz, y descripciones de maquina de ITER, MAST Upgrade, SPARC y STEP. No se detalla en la informacion disponible el numero de tokens ni la composicion exacta del dataset, ni si se emplearon tecnicas de RLHF o DPO (no aplicables a este tipo de modelo).

## Capacidades

- Prediccion de la evolucion temporal de estados de plasma en tokamaks (series temporales multivariantes).
- Modelado del mundo: simulacion de la dinamica del plasma condicionada a condiciones iniciales y actuaciones.
- Transferencia simulador a experimento (*sim-to-shots*): el preentrenamiento en simulador y el ajuste con descargas reales buscan generalizar a datos experimentales.
- Reproducibilidad: se publican checkpoints con semillas alternativas (`seed_1.pt`, `seed_2.pt`) para la misma configuracion.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni capacidades multilingues: no es un modelo de lenguaje.
- No se documentan capacidades de vision, audio ni modo de razonamiento explicito.

## Casos de uso

- Control predictivo de escenarios de plasma: el modelo puede usarse como predictor de la evolucion del estado del plasma para alimentar un controlador que ajuste actuaciones (calentamiento, campo magnetico) antes de que se produzcan inestabilidades.
- Planificacion de escenarios en reactores: evaluar trayectorias candidatas de descarga en ITER, SPARC o STEP sin necesidad de ejecutar la simulacion completa, gracias al preentrenamiento sobre datos de simulador y a la transferencia a descargas reales.
- Deteccion temprana de transiciones de regimen: anticipar transiciones L-H o aproximaciones al limite de densidad usando la dinamica aprendida de las bases de datos TCV y Alcator C-Mod.
- Validacion cruzada entre maquinas: comparar predicciones del modelo con datos de distintas maquinas (MAST Upgrade, SPARC, ITER) para estudiar la generalizacion entre tokamaks.
- Investigacion en modelos del mundo: servir como referencia reproducible (checkpoints con semillas y registro de seleccion) para comparar arquitecturas recurrentes frente a alternativas en el dominio de fusion.
- Generacion de datos sinteticos de plasma: usar las trayectorias predichas para aumentar datasets de entrenamiento en regimenes con pocos datos experimentales.
- Docencia y divulgacion tecnica: ilustrar la dinamica del plasma con un modelo ligero (100M parametros) que cabe en hardware modesto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas numericas (error de prediccion, R², etc.) ni comparaciones con otros modelos.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la informacion proporcionada. Como referencia orientativa, un modelo de 100M parametros en precision FP32 ocupa aproximadamente 0,4 GB de pesos; en FP16, unos 0,2 GB. Estas cifras son estimaciones de orden de magnitud, no datos publicados.
- GPU recomendadas: no disponible. Por tamano, cualquier GPU consumer moderna (por ejemplo, RTX 3060 en adelante) deberia poder cargar los pesos, pero no se documenta el rendimiento real.
- Cabe en GPU consumer: previsiblemente si, dado el tamano de 100M parametros, aunque no se confirma en la informacion disponible.
- Opciones de despliegue: los checkpoints son ficheros PyTorch (`.pt`) guardados por el codigo de entrenamiento; no se documenta integracion con vLLM, llama.cpp, Ollama ni TGI (herramientas orientadas a modelos de lenguaje, no aplicables directamente).
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye modelos comparables del mismo dominio (modelos del mundo para plasmas de tokamak) ni sus especificaciones.

## Limitaciones y advertencias

- Sesgos conocidos: el modelo se entrena sobre bases de datos de un conjunto limitado de maquinas (FAIR-MAST, TCV, Alcator C-Mod, SPARC, STEP, ITER, MAST Upgrade); puede no generalizar a tokamaks o regimenes no representados.
- Riesgo de error de prediccion: al ser un modelo del mundo aprendido, sus predicciones pueden divergir de la dinamica real, especialmente fuera de la distribucion de entrenamiento; no se publican metricas de error.
- Limitaciones de contexto o idioma: no aplica el concepto de contexto linguistico; no se documenta la ventana temporal maxima que el modelo puede procesar.
- Restricciones de licencia: CC BY-SA 4.0 exige atribucion y compartir bajo la misma licencia las obras derivadas. Ademas, los datos de entrenamiento imponen condiciones adicionales de citacion y atribucion (FAIR-MAST, HDB5, PR08, Alcator C-Mod, TCV, OpenSTEP, SPARC, QLKNN, descripciones de maquina de ITER, MAST Upgrade, SPARC y STEP); es necesario revisar cada una antes de un uso comercial.
- Caveats para produccion: no se documentan requisitos de preprocesado, normalizacion de entradas ni formato exacto de las series temporales; el uso en produccion requeriria inspeccionar `config.json` y el codigo de entrenamiento.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta; no hay evidencia de validacion por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/fusion-world-model/gru-dw_100m_d-sim-to-shots
- Licencia CC BY-SA 4.0: https://creativecommons.org/licenses/by-sa/4.0/
- FAIR-MAST (UKAEA): Jackson et al. 2025, IEEE Trans. Plasma Sci. 53, 2440, doi:10.1109/TPS.2025.3583419; Jackson et al. 2024, SoftwareX 27, 101869, doi:10.1016/j.softx.2024.101869
- HDB5 (International Global H-Mode Confinement Database, DB5.2.3): Verdoolaege et al. 2021, Nucl. Fusion 61, 076006, doi:10.1088/1741-4326/abdb91
- PR08 (ITPA multi-tokamak profile database): Roach et al. 2008, Nucl. Fusion 48, 125001, doi:10.1088/0029-5515/48/12/125001
- Open Density Limit Database (Alcator C-Mod): https://github.com/MIT-PSFC/open_density_limit_database
- TCV L-H transition database: Labit y Pau (2025), Zenodo doi:10.5281/zenodo.14996664; Labit et al., Plasma Phys. Control. Fusion (2025), doi:10.1088/1361-6587/adc8ce
- OpenSTEP (escenario SPP-001 de STEP): doi:10.14468/07jt-s540; Hudoba et al., Nucl. Fusion 64, 086055 (2024); Tholerus et al., Nucl. Fusion 64, 106030 (2024)
- SPARCPublic (Commonwealth Fusion Systems): Creely et al., J. Plasma Phys. 86, 865860502 (2020)
- QLKNN10D y QLKNN11D (QuaLiKiz): Zenodo doi:10.5281/zenodo.3497066 y doi:10.5281/zenodo.8017522; van de Plassche et al., Phys. Plasmas 27, 022310 (2020), doi:10.1063/1.5134126
- Descripciones de maquina: ITER Physics Basis, Nucl. Fusion 39 (1999) 2137 y Nucl. Fusion 47 (2007) S1; MAST Upgrade, Nucl. Fusion 64 (2024), doi:10.1088/1741-4326/ad6011 y doi:10.1088/1741-4326/ad56a2; SPARC, Creely et al., J. Plasma Phys. 86 (2020) 865860502 y Phys. Plasmas 30 (2023) 090601; STEP, Meyer y STEP Team, Phil. Trans. R. Soc. A 382 (2024) 20230406, y OpenSTEP, doi:10.14468/07jt-s540
