# fusion-world-model/lstm_100m_h-task-outputs

## Resumen

`lstm_100m_h-task-outputs` es un checkpoint de un modelo del mundo (*world model*) para plasmas de tokamak, desarrollado por el colectivo `fusion-world-model`. Se trata de una red LSTM con un presupuesto de 100 millones de parametros, entrenada para predecir la evolucion temporal de descargas de plasma en dispositivos de fusion por confinamiento magnetico. El modelo se enmarca en la receta denominada (h) *reward-only*, cuyos artefactos de salida son precisamente los que publica este repositorio.

El modelo resuelve un problema especifico del ambito de la fusion: disponer de un emulador rapido y diferenciable de la dinamica del plasma que complemente o sustituya parcialmente a las simulaciones fisicas costosas. Los datos de entrenamiento provienen de bases de datos experimentales multi-tokamak (FAIR-MAST, HDB5, PR08, la base de limites de densidad de Alcator C-Mod y la base de transiciones L-H de TCV), lo que lo convierte en un modelo transversal a varias maquinas en lugar de especifico de un unico dispositivo.

Es relevante ahora porque la comunidad de fusion esta explorando activamente el uso de modelos de aprendizaje automatico como surrogados para control y planificacion de escenarios, y este repositorio publica no solo el checkpoint elegido sino tambien las semillas alternativas y los registros de seleccion, lo que facilita la reproducibilidad y el analisis de sensibilidad. El repositorio tiene 1,2 GB, no registra descargas ni *likes* en el momento de la consulta y se distribuye bajo licencia CC BY-SA 4.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LSTM (red neuronal recurrente) |
| Parametros totales | 100M (presupuesto declarado) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo de series temporales, no linguistico) |
| Licencia | CC BY-SA 4.0 |
| Formato de pesos | PyTorch (`.pt`); no se publican safetensors ni GGUF |

## Arquitectura y entrenamiento

La arquitectura es una LSTM con un presupuesto de 100 millones de parametros. No se dispone de informacion sobre el numero de capas, la dimension oculta, el mecanismo de atencion (si lo hubiera) ni la formulacion exacta de la tarea de prediccion. El checkpoint publicado corresponde a la configuracion de indice 21 de las 30 configuraciones evaluadas durante la busqueda de hiperparametros; el fichero `selection.json` contiene las puntuaciones de seleccion que justifican la eleccion. Ademas de `final.pt`, se publican `seed_1.pt` y `seed_2.pt`, que son la misma configuracion reentrenada con semillas distintas, lo que permite estimar la varianza del entrenamiento.

Los datos de entrenamiento proceden de cinco fuentes experimentales de tokamaks: FAIR-MAST (UKAEA), la base internacional HDB5 de confinamiento en modo H, la base de perfiles PR08 del ITPA, la base de limites de densidad de Alcator C-Mod y la base de transiciones L-H de TCV. No se especifica el numero de tokens, el numero de descargas ni la composicion exacta del conjunto. Tampoco se documenta si hubo ajuste fino por refuerzo (RLHF/DPO) ni tecnicas de decodificacion especulativa; la etiqueta *reward-only* sugiere una formulacion de aprendizaje basada en recompensa, pero no se detalla el algoritmo.

## Capacidades

- Prediccion de series temporales de variables de plasma en tokamaks.
- Modelado de la dinamica de descargas individuales a partir de datos experimentales multi-maquina.
- Emulacion de un modelo del mundo (*world model*) del entorno de plasma, apto para planificacion o evaluacion de politicas de control.
- Entrenamiento reproducible: se publican semillas alternativas y registros de seleccion de hiperparametros.
- No se documentan capacidades de generacion de texto, codigo, matematicas, vision, audio ni *tool calling*.
- No se documentan capacidades multilingues (el modelo no opera sobre lenguaje natural).
- No se documenta soporte de agentes ni razonamiento multi-paso.

## Casos de uso

- Emulador rapido de la evolucion del plasma: sustituir simulaciones fisicas de alta fidelidad por una pasada de inferencia de la LSTM para explorar rapidamente escenarios de descarga y comparar trayectorias predichas frente a medidas experimentales.
- Control predictivo de escenarios: integrar el modelo como modelo interno en un bucle de control predictivo basado en modelo (MPC) para anticipar la respuesta del plasma ante cambios en actuadores, aprovechando el bajo coste de inferencia de una LSTM de 100M.
- Estudio de transiciones de confinamiento: analizar la prediccion de transiciones L-H y de limites de densidad a partir de las bases de TCV y Alcator C-Mod incluidas en el entrenamiento.
- Analisis de sensibilidad y reproducibilidad: usar `seed_1.pt` y `seed_2.pt` para cuantificar la variabilidad entre semillas de una misma configuracion, util en publicaciones que requieran intervalos de confianza sobre las predicciones.
- Preentrenamiento y *transfer learning*: servir de inicializacion para modelos mas grandes o especificos de una maquina concreta, dado que el modelo ya ha visto datos de cinco tokamaks distintos.
- Docencia e investigacion en fusion: emplear el checkpoint como referencia publica para comparar arquitecturas alternativas (transformer, SSM, hibridos) sobre las mismas bases de datos, ya que el repositorio documenta la configuracion y el proceso de seleccion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible con precision; para 100M parametros en FP32 se requieren aproximadamente 0,4 GB solo para pesos, mas el estado recurrente y los buffers de activacion. En la practica, un modelo de este tamano cabe holgadamente en cualquier GPU consumer moderna.
- GPU recomendadas: cualquier GPU con al menos 2-4 GB de VRAM (RTX 3060, RTX 4060, RTX 4090, A100, H100). No se requiere hardware de datacenter.
- Cabe en GPU consumer: si, practicamente en cualquier GPU consumer de los ultimos anos.
- Opciones de despliegue: al ser un checkpoint PyTorch (`.pt`) sin formato GGUF ni safetensors, el despliegue requiere cargar el fichero con `torch.load` en un script Python propio; no se documenta compatibilidad con vLLM, llama.cpp, Ollama ni TGI, que estan orientados a modelos de lenguaje.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

No se dispone de informacion sobre modelos comparables en la documentacion proporcionada. La categoria (modelos del mundo de plasmas de tokamak con arquitectura LSTM y presupuesto de 100M) es muy especifica y no se han identificado alternativas publicas con datos verificables en esta ficha.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| `lstm_100m_h-task-outputs` | 100M | no disponible | CC BY-SA 4.0 | Hugging Face |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Sesgos conocidos: el modelo se entrena con bases de datos experimentales de un conjunto concreto de tokamaks (MAST, HDB5, PR08, Alcator C-Mod, TCV); su comportamiento fuera de esa distribucion de maquinas y regimenes no esta caracterizado.
- Riesgo de alucinacion: en modelos de series temporales, el equivalente es la extrapolacion no fisica; no se documenta ningun mecanismo de salvaguarda ni validacion de consistencia fisica de las predicciones.
- Limitaciones de contexto o idioma: no aplica en el sentido linguistico, pero no se documenta la longitud de secuencia soportada ni el horizonte de prediccion validado.
- Restricciones de licencia: CC BY-SA 4.0 exige atribucion y compartir bajo la misma licencia las obras derivadas; es compatible con uso comercial siempre que se respeten esas condiciones. Ademas, los datos de entrenamiento tienen licencias propias (CC BY-SA 4.0, CC BY 4.0, sin licencia formal en PR08) que deben citarse segun se indica en la model card.
- Caveat para produccion: el repositorio tiene 0 descargas y 0 *likes*, no se ha validado de forma independiente y no se publican metricas de rendimiento; no se recomienda su uso en produccion sin una evaluacion propia.
- El checkpoint `paper` esta fijado al commit `849cfb55053d63ba0b431d81aa736ef29cb17d5c`; cualquier otro fichero en `main` puede haber cambiado respecto a ese estado.
- No se proporciona informacion sobre el preprocesado de datos, la normalizacion de variables ni el formato exacto de entrada/salida, lo que dificulta la reutilizacion directa sin consultar el codigo de entrenamiento (no incluido en el repositorio).

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/fusion-world-model/lstm_100m_h-task-outputs
- Licencia CC BY-SA 4.0: https://creativecommons.org/licenses/by-sa/4.0/
- FAIR-MAST (UKAEA), Jackson et al. 2025, IEEE Trans. Plasma Sci. 53, 2440: https://doi.org/10.1109/TPS.2025.3583419
- FAIR-MAST (UKAEA), Jackson et al. 2024, SoftwareX 27, 101869: https://doi.org/10.1016/j.softx.2024.101869
- HDB5, Verdoolaege et al. 2021, Nucl. Fusion 61, 076006: https://doi.org/10.1088/1741-4326/abdb91
- PR08, Roach et al. 2008, Nucl. Fusion 48, 125001: https://doi.org/10.1088/0029-5515/48/12/125001
- Open Density Limit Database (Alcator C-Mod): https://github.com/MIT-PSFC/open_density_limit_database
- TCV L-H transition database, Labit y Pau (2025), Zenodo: https://doi.org/10.5281/zenodo.14996664
- TCV, Labit et al., Plasma Phys. Control. Fusion (2025): https://doi.org/10.1088/1361-6587/adc8ce
