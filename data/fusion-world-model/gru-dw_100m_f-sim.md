# fusion-world-model/gru-dw_100m_f-sim

## Resumen

`gru-dw_100m_f-sim` es un modelo del mundo (world model) para plasmas de tokamak desarrollado por el proyecto fusion-world-model. Se trata de una red recurrente GRU de 2 capas con dropout de 0,1 y un presupuesto de parametros de 100 millones, entrenada como emulador de simulador (receta "f") para predecir la evolucion temporal de plasmas de fusion. El modelo no es un modelo de lenguaje: es un modelo de series temporales especializado en fisica de plasmas, orientado a la simulacion y prediccion de escenarios en reactores de fusion por confinamiento magnetico.

El checkpoint publicado como `final.pt` corresponde a la configuracion de indice 24 de las 35 configuraciones exploradas en la busqueda de hiperparametros del proyecto, seleccionada segun la regla de seleccion del propio autor (los scores estan en `selection.json`). El repositorio incluye ademas dos replicas de entrenamiento con semillas distintas (`seed_1.pt`, `seed_2.pt`) y el checkpoint exacto usado en el paper, accesible mediante la etiqueta `paper`.

Su relevancia radica en que los emuladores de simuladores de plasmas permiten acelerar drasticamente la exploracion de escenarios de operacion en tokamaks (ITER, SPARC, STEP, MAST-U) sin ejecutar codigos de transporte completos, lo que resulta util para diseno de experimentos, control y analisis de estabilidad. La licencia CC BY-SA 4.0 hereda la del dataset FAIR-MAST sobre el que se entrena.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GRU (2 capas, dropout 0,1, warmup de 4.000 pasos) |
| Parametros totales | 100M (presupuesto declarado) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no aplica (modelo de series temporales, no linguistico) |
| Licencia | CC BY-SA 4.0 |
| Formato de pesos | PyTorch (`.pt`) |

## Arquitectura y entrenamiento

La arquitectura es una red recurrente GRU de dos capas con dropout de 0,1 y un calentamiento (warmup) de 4.000 pasos, dentro de un presupuesto de 100 millones de parametros. El modelo se entrena como emulador de simulador (receta "f"), es decir, aprende a reproducir la salida de un codigo de simulacion de plasmas de tokamak a partir de condiciones de contorno y parametros de descarga. La configuracion concreta publicada es la de indice 24, seleccionada entre 35 configuraciones exploradas; el criterio de seleccion y las puntuaciones se documentan en `selection.json`.

Los datos de entrenamiento provienen de un conjunto de bases de datos publicas de fisica de plasmas, entre ellas FAIR-MAST (UKAEA), HDB5 (base internacional de confinamiento H-mode), PR08 (perfiles multi-tokamak del ITPA), la Open Density Limit Database (Alcator C-Mod), la base de transiciones L-H de TCV, OpenSTEP (escenario SPP-001 de STEP), SPARCPublic (descarga de referencia de SPARC) y las tablas de flujos QLKNN10D y QLKNN11D de QuaLiKiz. No se documenta en la informacion disponible el numero exacto de tokens ni la composicion cuantitativa del dataset, ni si hubo etapas de RLHF o DPO (no aplicables en un modelo de regresion de series temporales).

## Capacidades

- Prediccion y emulacion de la evolucion temporal de plasmas de tokamak a partir de parametros de descarga.
- Modelado de series temporales fisicas con dependencias de largo alcance (arquitectura recurrente GRU).
- Emulacion de simulador: reproduce salidas de codigos de transporte/equilibrio para escenarios de tokamaks como ITER, MAST-U, SPARC o STEP.
- Soporte de multiples maquinas y escenarios gracias a la diversidad de bases de datos de entrenamiento (HDB5, PR08, SPARC, STEP, TCV, Alcator C-Mod).
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso en el sentido de los LLM.
- No tiene capacidades multilingues, de vision ni de audio.
- No dispone de modo "thinking" ni de decodificacion especulativa.

## Casos de uso

- Exploracion rapida de escenarios de operacion en tokamaks: el modelo permite evaluar barridos de parametros de descarga sin ejecutar el simulador completo, acelerando la busqueda de puntos operativos viables en ITER, SPARC o STEP.
- Diseno de experimentos en maquinas existentes: dado que se entrena con datos de MAST-U, TCV y Alcator C-Mod, puede usarse para predecir el comportamiento esperado de nuevas descargas antes de solicitarlas.
- Control y planificacion de descargas: la salida temporal del GRU puede alimentar bucles de control o sistemas de supervision que necesitan predicciones a corto plazo de variables del plasma.
- Analisis de transiciones L-H y limites de densidad: al incorporar la base de TCV y la Open Density Limit Database, el modelo es adecuado para estudiar regimenes cercanos a transiciones y limites operativos.
- Estudio de confinamiento H-mode: la inclusion de HDB5 permite usar el modelo para analizar escalados de tiempo de confinamiento en funcion de parametros de la maquina.
- Emulacion de flujos turbulentos: al entrenarse con tablas QLKNN, puede servir como aproximacion rapida de flujos de transporte en pipelines de simulacion integrada.
- Generacion de datos sinteticos para entrenamiento: las predicciones del emulador pueden usarse para aumentar datasets escasos en regimenes poco representados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el checkpoint pesa aproximadamente 1,2 GB en el repositorio (incluyendo varios ficheros); un modelo de 100M de parametros en FP32 ocupa en torno a 400 MB de pesos, y en FP16 alrededor de 200 MB. La VRAM total depende del tamano del lote y de la longitud de las secuencias de entrada, no especificados.
- GPU recomendadas: cualquier GPU consumer moderna (RTX 3060 o superior) es suficiente para inferencia; para entrenamiento o lotes grandes se recomienda A100 o H100.
- Cabe en GPU consumer: si, con amplio margen, dado el tamano de 100M de parametros.
- Opciones de despliegue: al ser un checkpoint PyTorch puro (`.pt`), se carga con `torch.load` y se sirve mediante un script Python propio; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI (no aplicables a un modelo de series temporales).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye modelos comparables de emulacion de plasmas de tokamak con los que contrastar parametros, contexto, rendimiento o licencia.

## Limitaciones y advertencias

- El modelo es un emulador de simulador: su fidelidad esta acotada por el simulador y por los datos de entrenamiento; no sustituye a la simulacion de alta fidelidad en regimenes fuera de distribucion.
- Riesgo de extrapolacion incorrecta en escenarios o maquinas poco representados en el dataset (por ejemplo, regimenes no cubiertos por HDB5, PR08 o las bases de TCV y Alcator C-Mod).
- La licencia CC BY-SA 4.0 obliga a atribuir y a compartir bajo la misma licencia las obras derivadas, lo que puede condicionar el uso comercial y la integracion en productos propietarios.
- El uso de datos con distintas licencias (CC BY-SA 4.0, CC BY 4.0, MIT, sin licencia formal en PR08) impone obligaciones de citacion especificas que deben respetarse en publicaciones y presentaciones.
- No se documentan sesgos en el sentido estadistico habitual, pero si un sesgo de cobertura hacia las maquinas y regimenes presentes en las bases de datos.
- No hay informacion sobre calibracion de incertidumbre ni sobre intervalos de confianza de las predicciones.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no hay evidencia de uso comunitario ni de validacion externa.

## Enlaces

- Hugging Face: https://huggingface.co/fusion-world-model/gru-dw_100m_f-sim
- Checkpoint del paper (tag `paper`, commit `81975745c375e2eb21409473595dc55ce2d7ae36`): accesible desde el propio repositorio de Hugging Face.
- FAIR-MAST (UKAEA): Jackson et al. 2025, IEEE Trans. Plasma Sci. 53, 2440, doi:10.1109/TPS.2025.3583419; Jackson et al. 2024, SoftwareX 27, 101869, doi:10.1016/j.softx.2024.101869.
- HDB5 (International Global H-Mode Confinement Database, DB5.2.3): Verdoolaege et al. 2021, Nucl. Fusion 61, 076006, doi:10.1088/1741-4326/abdb91.
- PR08 (ITPA multi-tokamak profile database, 2008): Roach et al. 2008, Nucl. Fusion 48, 125001, doi:10.1088/0029-5515/48/12/125001.
- Open Density Limit Database (Alcator C-Mod): https://github.com/MIT-PSFC/open_density_limit_database
- TCV L-H transition database: Labit and Pau (2025), Zenodo doi:10.5281/zenodo.14996664; Labit et al., Plasma Phys. Control. Fusion (2025), doi:10.1088/1361-6587/adc8ce.
- OpenSTEP (STEP SPP-001): doi:10.14468/07jt-s540; Hudoba et al., Nucl. Fusion 64, 086055 (2024); Tholerus et al., Nucl. Fusion 64, 106030 (2024).
- SPARCPublic (Commonwealth Fusion Systems): Creely et al., J. Plasma Phys. 86, 865860502 (2020).
- QLKNN10D y QLKNN11D (QuaLiKiz): Zenodo doi:10.5281/zenodo.3497066 y doi:10.5281/zenodo.8017522; van de Plassche et al., Phys. Plasmas 27, 022310 (2020), doi:10.1063/1.5134126.
- Licencia CC BY-SA 4.0: https://creativecommons.org/licenses/by-sa/4.0/
