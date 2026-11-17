# fusion-world-model/lstm_10m_h-task-outputs

## Resumen

`lstm_10m_h-task-outputs` es un checkpoint de un modelo del mundo (*world model*) de plasmas de tokamak, desarrollado por el proyecto `fusion-world-model`. El modelo aprende la dinamica temporal de descargas de plasma en tokamaks y se publica como parte de un estudio sobre recetas de entrenamiento y seleccion de configuraciones. La arquitectura es una LSTM con un presupuesto de parametros de 10 millones, orientada a series temporales cientificas del dominio de la fusion nuclear.

La relevancia del modelo es doble. Por un lado, aplica aprendizaje automatico a un problema de fisica de plasmas de alta complejidad, donde los datos experimentales son escasos, costosos y heterogeneos entre maquinas. Por otro, la publicacion es metodologicamente cuidadosa: se documenta el proceso de busqueda de configuraciones (35 configuraciones entrenadas, seleccion de la mejor segun una regla explicita), se incluyen semillas alternativas para evaluar varianza y se fija un checkpoint concreto (`paper`) para reproducibilidad.

El repositorio tiene un tamano de 0,1 GB y contiene unicamente pesos en formato PyTorch (`.pt`), acompanados de ficheros de configuracion y metadatos. No es un modelo de lenguaje: no genera texto ni soporta instrucciones, sino que produce predicciones sobre series temporales de diagnostico de plasma. La licencia es CC BY-SA 4.0, heredada de los datos FAIR-MAST sobre los que se entreno.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LSTM (red neuronal recurrente) |
| Parametros totales | 10M (presupuesto de parametros declarado) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos PyTorch en coma flotante; no se documentan variantes cuantizadas) |
| Idiomas soportados | no aplica (modelo de series temporales, no linguistico) |
| Licencia | CC BY-SA 4.0 |
| Formato de pesos | PyTorch (`.pt`), guardados por el codigo de entrenamiento |

## Arquitectura y entrenamiento

El modelo es una LSTM con un presupuesto de 10 millones de parametros. La model card no detalla el numero de capas, el tamano del estado oculto ni la dimension de las entradas y salidas; unicamente se especifica la familia arquitectonica y el presupuesto de parametros. El objetivo es modelar la evolucion temporal de senales de diagnostico de plasmas de tokamak, lo que encaja con la naturaleza secuencial de los datos de descarga.

El entrenamiento se realizo dentro de una busqueda de 35 configuraciones. El checkpoint `final.pt` corresponde a la configuracion de indice 27, que resulto la mejor clasificada por la regla de seleccion del estudio (los scores estan en `selection.json`). Se incluyen dos semillas adicionales (`seed_1.pt`, `seed_2.pt`) de la misma configuracion para medir la variabilidad del entrenamiento. El checkpoint exacto usado en el articulo esta fijado con la etiqueta `paper` (commit `e469dddea0a17a2dcae953d9c654df159d0aa2aa`), que no se mueve.

Los datos de entrenamiento provienen de varias bases de datos publicas de fisica de plasmas: FAIR-MAST (UKAEA), la base internacional HDB5 de confinamiento en modo H, el release publico 2008 de la base de perfiles multi-tokamak PR08 del ITPA, la Open Density Limit Database de Alcator C-Mod y la base de transiciones L-H de TCV. No se especifican en la informacion disponible el numero de tokens, la composicion exacta del dataset ni si se aplicaron tecnicas de RLHF o DPO (poco probables en un modelo de regresion sobre series temporales).

## Capacidades

- Modelado y prediccion de series temporales de diagnostico de plasmas de tokamak.
- Aprendizaje de dinamicas de descarga a partir de datos experimentales de multiples maquinas (MAST, bases multi-tokamak, Alcator C-Mod, TCV).
- Generacion de predicciones autoregresivas sobre el estado del plasma (segun la formulacion propia de un *world model*).
- Evaluacion de robustez mediante semillas de entrenamiento alternativas.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso en el sentido de los LLM.
- No tiene capacidades multilingues: no procesa ni genera lenguaje natural.
- No dispone de modo *thinking*, vision ni audio.

## Casos de uso

- Prediccion de la evolucion temporal de senales de plasma en tokamaks: el modelo puede usarse como *world model* para anticipar la trayectoria de variables de diagnostico durante una descarga, lo que permite estudiar regimenes antes de ejecutarlos en la maquina.
- Control predictivo en experiments de fusion: integrado en un bucle de control, el modelo puede proporcionar predicciones a corto plazo del estado del plasma para informar estrategias de actuacion sobre los sistemas de calentamiento y campo magnetico.
- Estudio de transiciones de regimen (L-H): dado que los datos de entrenamiento incluyen la base de transiciones L-H de TCV, el modelo es adecuado para analizar la dinamica de estas transiciones y su dependencia de parametros de operacion.
- Analisis de limites de densidad: con la Open Density Limit Database de Alcator C-Mod entre las fuentes, el modelo puede emplearse para explorar condiciones cercanas al limite de densidad y su evolucion temporal.
- Comparacion entre maquinas: al entrenarse con bases multi-tokamak (HDB5, PR08), el modelo permite estudiar similitudes y diferencias de comportamiento entre dispositivos.
- Reproduccion de resultados cientificos: el checkpoint `paper` y las semillas adicionales permiten reproducir y auditar los resultados del articulo, asi como medir la sensibilidad a la inicializacion.
- Prototipado rapido en investigacion: con 10M de parametros y 0,1 GB de pesos, es ligero y facil de cargar en un entorno de investigacion para experimentos exploratorios.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: muy baja. Con 10M de parametros en coma flotante de 32 bits, los pesos ocupan aproximadamente 40 MB; en FP16, unos 20 MB.
- GPU recomendadas: cualquier GPU moderna es suficiente; no se requiere hardware de datacenter. Una RTX 4090, A100 o H100 estan sobredimensionadas para este modelo.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU de consumo con suficiente memoria para el lote de inferencia (incluso GPUs de gama baja con 4-8 GB).
- Opciones de despliegue: al ser un checkpoint PyTorch puro, el despliegue se realiza cargando los pesos con PyTorch. No se documentan integraciones con vLLM, llama.cpp, Ollama o TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye modelos comparables de la misma categoria (world models de plasmas de tokamak con LSTM de 10M de parametros) ni datos de rendimiento que permitan una comparacion rigurosa.

## Limitaciones y advertencias

- Modelo de dominio muy especifico: solo es util para series temporales de plasmas de tokamak; no es un modelo de proposito general.
- No es un modelo de lenguaje: no procesa ni genera texto, no soporta instrucciones ni tool calling.
- La model card no documenta la arquitectura interna (capas, dimensiones, entradas y salidas), lo que dificulta la reutilizacion sin inspeccionar el codigo de entrenamiento.
- Riesgo de extrapolacion: al entrenarse con un conjunto limitado de maquinas y bases de datos, su validez fuera de esas condiciones no esta garantizada.
- Sesgos potenciales derivados de la composicion del dataset: la representacion de cada maquina y regimen depende de la cantidad y calidad de datos disponibles en cada base.
- Restricciones de licencia: CC BY-SA 4.0 exige atribucion y compartir bajo la misma licencia las obras derivadas, lo que puede condicionar su uso en productos propietarios.
- Obligaciones de atribucion adicionales: los datos de entrenamiento imponen citas especificas (FAIR-MAST, HDB5, PR08, Open Density Limit Database, TCV) que deben respetarse en publicaciones y trabajos derivados.
- No se documentan resultados de benchmarks ni metricas de rendimiento en la informacion disponible, por lo que no es posible evaluar su calidad predictiva sin consultar el articulo asociado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/fusion-world-model/lstm_10m_h-task-outputs
- Checkpoint del articulo (tag `paper`): https://huggingface.co/fusion-world-model/lstm_10m_h-task-outputs/tree/paper
- Licencia CC BY-SA 4.0: https://creativecommons.org/licenses/by-sa/4.0/
- FAIR-MAST (UKAEA), Jackson et al. 2025, IEEE Trans. Plasma Sci. 53, 2440: https://doi.org/10.1109/TPS.2025.3583419
- FAIR-MAST (UKAEA), Jackson et al. 2024, SoftwareX 27, 101869: https://doi.org/10.1016/j.softx.2024.101869
- HDB5, Verdoolaege et al. 2021, Nucl. Fusion 61, 076006: https://doi.org/10.1088/1741-4326/abdb91
- PR08, Roach et al. 2008, Nucl. Fusion 48, 125001: https://doi.org/10.1088/0029-5515/48/12/125001
- Open Density Limit Database (MIT PSFC): https://github.com/MIT-PSFC/open_density_limit_database
- TCV L-H transition database, Labit y Pau (2025), Zenodo: https://doi.org/10.5281/zenodo.14996664
- TCV L-H transition, Labit et al., Plasma Phys. Control. Fusion (2025): https://doi.org/10.1088/1361-6587/adc8ce
