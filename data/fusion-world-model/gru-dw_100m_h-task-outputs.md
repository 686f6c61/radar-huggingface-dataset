# fusion-world-model/gru-dw_100m_h-task-outputs

## Resumen

`gru-dw_100m_h-task-outputs` es un conjunto de checkpoints de un modelo del mundo (*world model*) para plasmas de tokamak, publicado por el usuario `fusion-world-model` en Hugging Face. No es un modelo de lenguaje: es un modelo de series temporales basado en una red GRU de 2 capas con dropout 0,1, un presupuesto de 100 millones de parametros y un calentamiento (*warmup*) de 4000 pasos, entrenado para predecir la evolucion de descargas de plasma en dispositivos de fusion por confinamiento magnetico.

El repositorio contiene el checkpoint seleccionado (`final.pt`), dos replicas entrenadas con semillas distintas (`seed_1.pt`, `seed_2.pt`), el fichero de configuracion de entrenamiento (`config.json`), el registro de seleccion (`selection.json`) y un manifiesto con rutas, tamanos y hashes SHA-256 (`manifest.json`). La receta identificada como (h) es de tipo *reward-only* y corresponde a lo que el autor denomina "task outputs".

Su relevancia es acotada pero especifica: se trata de un artefacto de investigacion reproducible para modelado predictivo de plasmas, con trazabilidad de seleccion entre 25 configuraciones y datos de entrenamiento procedentes de bases de datos publicas de fisica de plasmas (FAIR-MAST, HDB5, PR08, Open Density Limit Database y la base de transiciones L-H de TCV). No esta pensado para inferencia de texto, codigo ni tareas de NLP.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GRU (2 capas, dropout 0,1, warmup de 4000 pasos) |
| Parametros totales | Presupuesto de 100M (aproximadamente 100 millones) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible (no es un modelo linguistico) |
| Licencia | CC BY-SA 4.0 |
| Formato de pesos | PyTorch (`.pt`, checkpoints guardados por el codigo de entrenamiento) |

## Arquitectura y entrenamiento

La arquitectura es una red recurrente de tipo GRU con dos capas y dropout de 0,1, configurada con un calentamiento de 4000 pasos y un presupuesto de parametros de 100 millones. El modelo se enmarca en la categoria de *world model* de plasmas de tokamak: aprende la dinamica temporal de descargas para predecir estados futuros o salidas de tarea a partir de observaciones. El checkpoint `final.pt` corresponde a la configuracion de indice 6 de las 25 que entreno la busqueda del autor, seleccionada por la regla de seleccion documentada en `selection.json`.

Los datos de entrenamiento de la receta (h) provienen de cinco fuentes publicas de fisica de plasmas: FAIR-MAST (UKAEA), la base de datos internacional HDB5 (DB5.2.3), la release publica de 2008 de la base de perfiles multi-tokamak PR08 del ITPA, la Open Density Limit Database de Alcator C-Mod y la base de datos de transiciones L-H de TCV (dataset limitado). No se especifican en la informacion disponible el numero total de tokens, la composicion exacta del dataset ni si se aplicaron tecnicas de RLHF o DPO; dado que no es un modelo de lenguaje, estas tecnicas no resultan aplicables en su forma habitual. La innovacion metodologica destacable es la trazabilidad del proceso de seleccion: se entrenaron 25 configuraciones, se puntuaron con una regla explicita y se conservaron replicas con semillas alternativas para evaluar la varianza del entrenamiento.

## Capacidades

- Prediccion de series temporales de plasmas de tokamak: modelado de la evolucion temporal de descargas a partir de las variables de entrada de la base de datos correspondiente.
- Generacion de salidas de tarea (*task outputs*) bajo la receta (h) de tipo *reward-only*.
- Reproducibilidad experimental: checkpoints con semillas multiples (`seed_1.pt`, `seed_2.pt`) para medir la estabilidad del entrenamiento.
- Trazabilidad de seleccion: `selection.json` documenta las puntuaciones que justifican la eleccion de `final.pt`.
- Integridad de artefactos: `manifest.json` incluye ruta, tamano y SHA-256 de cada fichero.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, vision, audio ni capacidades multilingues; no es un modelo de lenguaje.

## Casos de uso

- Investigacion en fusion por confinamiento magnetico: usar el modelo como *world model* para predecir la evolucion de descargas y comparar con datos experimentales de tokamaks como MAST, JET, Alcator C-Mod o TCV, aprovechando que fue entrenado con bases de datos publicas de esos dispositivos.
- Reproduccion de resultados academicos: cargar la revision etiquetada `paper` (commit `0875544131275e18d1d837f5577fdea382c8ee37`) para replicar exactamente los resultados del articulo asociado.
- Estudio de estabilidad del entrenamiento: entrenar de nuevo la configuracion elegida con las semillas de `seed_1.pt` y `seed_2.pt` para cuantificar la varianza entre ejecuciones y evaluar la robustez del modelo ante cambios de inicializacion.
- Analisis de sensibilidad de hiperparametros: comparar la configuracion de indice 6 con las otras 24 exploradas por la busqueda del autor para estudiar el efecto de la profundidad, el dropout y el warmup en el rendimiento predictivo.
- Control y planificacion de escenarios de plasma: emplear las predicciones del modelo como componente de un lazo de simulacion para explorar escenarios de operacion antes de ejecutarlos en el tokamak real.
- Docencia y formacion en fisica de plasmas computacional: utilizar el repositorio como ejemplo reproducible de pipeline de entrenamiento de modelos de series temporales con datos de acceso abierto y licencia compatible.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio incluye `selection.json` con las puntuaciones de seleccion interna de las 25 configuraciones, pero no se proporcionan metricas estandarizadas (MSE, MAE, R2 u otras) ni comparaciones con modelos de referencia en la informacion facilitada.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la informacion proporcionada. Con un presupuesto de 100M de parametros y pesos en precision completa (FP32), el checkpoint rondaria los 400 MB; en FP16, unos 200 MB. Estas cifras son estimaciones por tamano de parametros, no datos publicados por el autor.
- GPU recomendadas: no disponible. Por el tamano del modelo, cualquier GPU consumer moderna (por ejemplo, RTX 3060 en adelante) deberia poder alojarlo en memoria, pero no hay datos oficiales de requisitos.
- Cabe en GPU consumer: previsiblemente si, dado el presupuesto de 100M de parametros, aunque no se confirma en la informacion disponible.
- Opciones de despliegue: los checkpoints son ficheros PyTorch (`.pt`) guardados por el codigo de entrenamiento del autor; no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que ademas no aplican a un modelo de series temporales.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye modelos comparables de la misma categoria (world models de plasmas de tokamak) ni datos de rendimiento que permitan una comparacion rigurosa.

## Limitaciones y advertencias

- No es un modelo de lenguaje: no admite prompts en lenguaje natural, generacion de texto, codigo ni tareas de NLP. Cualquier uso en esos dominios carece de sentido.
- Dominio restringido: el modelo esta especializado en plasmas de tokamak y su validez fuera de las condiciones cubiertas por FAIR-MAST, HDB5, PR08, la Open Density Limit Database y la base L-H de TCV no esta garantizada.
- Riesgo de extrapolacion: al entrenarse con bases de datos historicas de dispositivos concretos, las predicciones sobre regimenes de operacion no representados en esos datos pueden ser poco fiables.
- Licencia CC BY-SA 4.0: permite uso comercial con atribucion y obliga a compartir las obras derivadas bajo la misma licencia. Es necesario citar las fuentes de datos segun se indica en la model card (FAIR-MAST/Jackson et al. 2025 y 2024; Verdoolaege et al. 2021; Roach et al. 2008; Maris, Rea, Trevisan y Alcator C-Mod Team 2025; Labit y Pau 2025, y Labit et al. 2025).
- PR08 se distribuye sin licencia formal y "tal cual" (*as is*), con la unica condicion de citar su articulo; conviene revisar la compatibilidad con usos derivados.
- Sin datos de benchmarks publicos: no es posible evaluar su calidad predictiva a partir de la informacion disponible; la unica evidencia es la seleccion interna entre 25 configuraciones.
- Sin garantias de mantenimiento: el repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y no se documenta soporte ni actualizaciones futuras.
- Las etiquetas de revision (`paper`) no se mueven segun el autor, pero el resto de ficheros en `main` pueden cambiar; para reproducibilidad conviene fijar el commit.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/fusion-world-model/gru-dw_100m_h-task-outputs
- Revision del checkpoint del articulo: commit `0875544131275e18d1d837f5577fdea382c8ee37` (etiqueta `paper`)
- Licencia CC BY-SA 4.0: https://creativecommons.org/licenses/by-sa/4.0/
- FAIR-MAST (UKAEA), Jackson et al. 2025, IEEE Trans. Plasma Sci. 53, 2440: https://doi.org/10.1109/TPS.2025.3583419
- FAIR-MAST (UKAEA), Jackson et al. 2024, SoftwareX 27, 101869: https://doi.org/10.1016/j.softx.2024.101869
- HDB5, Verdoolaege et al. 2021, Nucl. Fusion 61, 076006: https://doi.org/10.1088/1741-4326/abdb91
- PR08, Roach et al. 2008, Nucl. Fusion 48, 125001: https://doi.org/10.1088/0029-5515/48/12/125001
- Open Density Limit Database (Alcator C-Mod): https://github.com/MIT-PSFC/open_density_limit_database
- TCV L-H transition database, Labit y Pau 2025, Zenodo: https://doi.org/10.5281/zenodo.14996664
- TCV L-H transition database, Labit et al. 2025, Plasma Phys. Control. Fusion: https://doi.org/10.1088/1361-6587/adc8ce
