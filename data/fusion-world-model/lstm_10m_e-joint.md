# fusion-world-model/lstm_10m_e-joint

## Resumen

`lstm_10m_e-joint` es un checkpoint de un modelo del mundo (world model) para plasmas de tokamak, desarrollado por el proyecto fusion-world-model. No es un modelo de lenguaje: es una red LSTM de aproximadamente 10 millones de parametros entrenada para modelar la dinamica temporal de plasmas en tokamaks, con el objetivo de servir como entorno simulado para control, prediccion y planificacion en investigacion de fusion nuclear.

El modelo se publica como parte de un conjunto de recetas de entrenamiento; esta en concreto corresponde a la receta "(e) joint training". El repositorio incluye el checkpoint elegido (`final.pt`), dos replicas con semillas distintas (`seed_1.pt`, `seed_2.pt`), la configuracion de entrenamiento y el registro de seleccion entre 30 configuraciones candidatas.

Es relevante para investigadores en fusion que necesiten un modelo ligero y reproducible de dinamica de plasma, entrenado sobre bases de datos publicas de tokamaks (FAIR-MAST, HDB5, PR08, entre otras) y liberado bajo licencia CC BY-SA 4.0. Su tamano reducido (repo de 0,1 GB) permite desplegarlo en hardware modesto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LSTM (red recurrente) |
| Parametros totales | aproximadamente 10M (presupuesto de parametros de la receta) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no aplica (modelo de series temporales, no de lenguaje) |
| Licencia | CC BY-SA 4.0 |
| Formato de pesos | PyTorch (`.pt`) |

## Arquitectura y entrenamiento

La arquitectura es una LSTM con un presupuesto de aproximadamente 10 millones de parametros, entrenada como modelo del mundo de plasmas de tokamak sobre datos de series temporales. La receta "(e) joint training" indica un regimen de entrenamiento conjunto (probablemente sobre multiples bases de datos o tareas combinadas), aunque la model card no detalla la composicion exacta del dataset ni el numero de tokens o pasos de entrenamiento.

El proceso de seleccion consistio en entrenar 30 configuraciones y elegir la que la regla de seleccion del proyecto clasifica en primer lugar (indice 20); los ficheros `seed_1.pt` y `seed_2.pt` replican esa configuracion con semillas distintas para evaluar variabilidad. Los datos de entrenamiento pueden apoyarse en FAIR-MAST (UKAEA), HDB5, PR08, la Open Density Limit Database, la base de transiciones L-H de TCV, OpenSTEP, SPARCPublic, las tablas de flujo QLKNN10D/QLKNN11D y descripciones de maquinas (ITER, MAST Upgrade, SPARC, STEP). No se documentan innovaciones como decodificacion especulativa ni atencion lineal.

## Capacidades

- Modelado de la dinamica temporal de plasmas de tokamak (prediccion de evolucion de estados del plasma).
- Uso como entorno o world model para entrenamiento de politicas de control en simulacion.
- Entrenamiento conjunto sobre multiples fuentes de datos de tokamaks (receta joint).
- Reproducibilidad mediante multiples semillas (`seed_1.pt`, `seed_2.pt`).
- No soporta tool calling, function calling ni razonamiento multi-paso en el sentido de los LLM.
- No tiene capacidades multilingues, de vision ni de audio.
- No dispone de modo "thinking" ni de generacion de texto.

## Casos de uso

- Investigacion en control de plasma: usar el modelo como entorno simulado ligero para entrenar y evaluar controladores antes de probarlos en codigo de simulacion pesado o en maquina real.
- Prediccion de evolucion temporal de descargas: alimentar secuencias de estados del plasma y obtener la prediccion del siguiente estado para analisis de estabilidad.
- Estudio de variabilidad entre semillas: comparar `final.pt` con `seed_1.pt` y `seed_2.pt` para cuantificar la robustez del entrenamiento y la incertidumbre del modelo.
- Reproduccion de resultados: el tag `paper` (commit `36d307d4...`) permite reproducir exactamente el checkpoint usado en la publicacion asociada.
- Prototipado rapido en hardware modesto: al ser un modelo de 10M de parametros y repo de 0,1 GB, cabe en CPU y GPUs de consumo para experimentos exploratorios.
- Benchmarking de recetas de entrenamiento: comparar la receta joint con otras recetas del mismo proyecto sobre las mismas bases de datos.
- Educacion y divulgacion: ejemplo didactico de world model aplicado a fusion, con datos y atribuciones completamente publicos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: muy baja; un modelo de 10M de parametros en fp32 ocupa aproximadamente 40 MB de pesos, por lo que cabe holgadamente en cualquier GPU.
- GPU recomendadas: cualquier GPU moderna es suficiente; no requiere A100 ni H100. Una RTX 4090 o incluso una GPU integrada puede ejecutarlo.
- Cabe en GPU de consumo: si, en cualquier GPU con al menos 1 GB de memoria; tambien es viable en CPU.
- Opciones de despliegue: inferencia directa con PyTorch (los checkpoints son ficheros `.pt`); no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI (no aplican a este tipo de modelo).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye otros world models de tokamak ni checkpoints comparables de la misma categoria con los que establecer una comparacion cuantitativa.

## Limitaciones y advertencias

- El modelo esta especializado exclusivamente en dinamica de plasmas de tokamak; no es un modelo de lenguaje y no debe usarse como tal.
- La model card no documenta sesgos especificos, pero al entrenarse sobre bases de datos historicas de tokamaks puede heredar sesgos de cobertura (sobre-representacion de ciertas maquinas y regimenes).
- Riesgo de extrapolacion fuera de distribucion: al ser un world model entrenado sobre datos publicos, sus predicciones pueden degradarse en regimenes o maquinas poco representados.
- No se documentan la longitud de contexto ni el horizonte de prediccion valido; deben determinarse empiricamente.
- Licencia CC BY-SA 4.0: permite uso comercial, pero obliga a atribucion y a compartir bajo la misma licencia las obras derivadas; ademas, los datos de origen imponen atribuciones adicionales (FAIR-MAST, HDB5, PR08, etc.) que deben respetarse.
- El uso de SPARCPublic exige una atribucion especifica a Commonwealth Fusion Systems tal como figura en la model card.
- Para produccion en control real de plasma se requeriria validacion exhaustiva contra codigos fisicos y datos experimentales; el modelo no sustituye a un simulador validado.

## Enlaces

- Hugging Face: https://huggingface.co/fusion-world-model/lstm_10m_e-joint
- Licencia CC BY-SA 4.0: https://creativecommons.org/licenses/by-sa/4.0/
- FAIR-MAST (UKAEA), Jackson et al. 2025, IEEE Trans. Plasma Sci. 53, 2440: https://doi.org/10.1109/TPS.2025.3583419
- FAIR-MAST, Jackson et al. 2024, SoftwareX 27, 101869: https://doi.org/10.1016/j.softx.2024.101869
- HDB5, Verdoolaege et al. 2021, Nucl. Fusion 61, 076006: https://doi.org/10.1088/1741-4326/abdb91
- PR08, Roach et al. 2008, Nucl. Fusion 48, 125001: https://doi.org/10.1088/0029-5515/48/12/125001
- Open Density Limit Database (MIT PSFC): https://github.com/MIT-PSFC/open_density_limit_database
- TCV L-H transition database, Labit y Pau (2025): https://doi.org/10.5281/zenodo.14996664
- TCV, Labit et al., Plasma Phys. Control. Fusion (2025): https://doi.org/10.1088/1361-6587/adc8ce
- OpenSTEP, STEP SPP-001: https://doi.org/10.14468/07jt-s540
- SPARC, Creely et al., J. Plasma Phys. 86, 865860502 (2020): https://doi.org/10.1017/S0022377820001041
- QLKNN10D v1.0: https://doi.org/10.5281/zenodo.3497066
- QLKNN11D v1.0.0: https://doi.org/10.5281/zenodo.8017522
- QLKNN, van de Plassche et al., Phys. Plasmas 27, 022310 (2020): https://doi.org/10.1063/1.5134126
