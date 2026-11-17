# fusion-world-model/lstm_1m_h-task-outputs

## Resumen

`lstm_1m_h-task-outputs` es un checkpoint de un modelo del mundo (*world model*) de plasmas de tokamak, desarrollado por el colectivo `fusion-world-model`. El modelo aprende la dinamica temporal de descargas de plasma en dispositivos de fusion por confinamiento magnetico, con el objetivo de predecir la evolucion del estado del plasma y las salidas asociadas a la tarea de recompensa (*reward-only*). Se trata de una red LSTM con un presupuesto de parametros de aproximadamente 1 millon, entrenada sobre datos experimentales de tokamaks reales.

El modelo se enmarca en la receta identificada como `(h) reward-only` dentro de una busqueda de configuraciones de entrenamiento. El repositorio publica el checkpoint elegido (`final.pt`, configuracion de indice 20 de 30 exploradas), dos replicas con semillas distintas (`seed_1.pt`, `seed_2.pt`) y los metadatos de la seleccion. La relevancia actual radica en el uso de modelos del mundo ligeros para planificacion y control en reactores de fusion, un area donde los datos experimentales son escasos y costosos.

La publicacion es de tipo artefacto de investigacion: no es un modelo de lenguaje ni un asistente conversacional, sino un modelo de series temporales especifico de dominio, con licencia CC BY-SA 4.0 heredada de los datos FAIR-MAST sobre los que se entreno.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LSTM (red neuronal recurrente) |
| Parametros totales | ~1M (presupuesto de parametros de la receta) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (checkpoints PyTorch en coma flotante) |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | CC BY-SA 4.0 |
| Formato de pesos | PyTorch (`.pt`) |

## Arquitectura y entrenamiento

La arquitectura es una LSTM, es decir, una red neuronal recurrente adecuada para modelar dependencias temporales en series de datos secuenciales. El presupuesto de parametros es de aproximadamente 1 millon, lo que la situa en la categoria de modelos muy ligeros, disenados para ser entrenables y ejecutables con recursos minimos. No se dispone de informacion sobre el numero de capas, el tamano del estado oculto ni la longitud de las secuencias de entrenamiento.

El entrenamiento se realizo sobre datos de diagnostico de plasmas de tokamak procedentes de varias bases de datos: FAIR-MAST (UKAEA), la base internacional HDB5 de confinamiento en modo H, la base de perfiles PR08 del ITPA, la Open Density Limit Database de Alcator C-Mod y la base de transiciones L-H de TCV. La receta `(h) reward-only` indica que el objetivo de entrenamiento se centra en las salidas de recompensa de la tarea. El checkpoint `final.pt` corresponde a la configuracion de indice 20 de las 30 exploradas en la busqueda, seleccionada segun la regla de seleccion documentada en `selection.json`. No se especifican detalles sobre el numero de tokens, la composicion exacta del dataset ni el uso de RLHF o DPO (no aplicables a este tipo de modelo).

## Capacidades

- Modelado y prediccion de la dinamica temporal de plasmas de tokamak.
- Prediccion de las salidas asociadas a la tarea de recompensa (*reward-only*) definida en la receta.
- Aprendizaje de la evolucion del estado del plasma a partir de series temporales de diagnostico.
- Reproducibilidad mediante multiples semillas de entrenamiento (`seed_1.pt`, `seed_2.pt`).
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso en el sentido de los modelos de lenguaje.
- No tiene capacidades multilingues (no procesa texto).
- No dispone de modo de razonamiento (*thinking*), vision ni audio.

## Casos de uso

- Prediccion de la evolucion del plasma en tokamaks: el modelo puede usarse para anticipar la trayectoria temporal de variables de estado del plasma a partir de un estado inicial y una secuencia de actuaciones, lo que permite estudiar escenarios de operacion antes de ejecutarlos en el dispositivo.
- Control predictivo en reactores de fusion: al ser un modelo del mundo ligero (~1M parametros), puede integrarse en bucles de control que requieren inferencia rapida y bajo coste computacional para seleccionar acciones de control.
- Simulacion acelerada de descargas: sustituye parcialmente simulaciones fisicas costosas en exploraciones de espacio de parametros, ya que la LSTM infiere en milisegundos frente a los codigos de transporte.
- Estudio de transiciones de confinamiento (L-H): entrenado con la base de TCV, puede emplearse para analizar condiciones de transicion entre regimenes de confinamiento.
- Analisis de limites de densidad: a partir de la Open Density Limit Database, el modelo puede ayudar a predecir aproximaciones al limite de densidad en escenarios de Alcator C-Mod y extrapolaciones.
- Investigacion reproducible en modelos del mundo para fusion: los checkpoints con multiples semillas permiten estudiar la varianza del entrenamiento y validar la robustez de las predicciones en trabajos academicos.
- Benchmarking de recetas de entrenamiento: al publicarse la configuracion y las puntuaciones de seleccion, sirve como referencia para comparar futuras recetas sobre los mismos datos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB para un modelo de ~1M parametros en precision completa; margen amplio para lotes grandes.
- GPU recomendadas: cualquier GPU moderna es suficiente; no se requiere hardware de数据中心. Una GPU consumer de gama baja o incluso CPU es suficiente para inferencia.
- Cabe en cualquier GPU consumer (GTX 1060, RTX 3060, RTX 4090, etc.) y en CPU.
- Opciones de despliegue: PyTorch nativo (los checkpoints son `.pt`); no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI, que no son aplicables a este tipo de modelo.
- Latencia y throughput estimados: no disponibles; por el tamano del modelo, se espera latencia de milisegundos en GPU y decenas de milisegundos en CPU, aunque no se aportan mediciones.

## Comparativa con modelos similares

No se dispone de informacion sobre modelos comparables en la documentacion proporcionada. Se trata de un artefacto de investigacion especifico de dominio (modelos del mundo de plasmas de tokamak) sin una categoria estandar de comparacion publicada.

## Limitaciones y advertencias

- Modelo de dominio muy especifico: solo es valido para datos de plasmas de tokamak y no para tareas generales.
- No es un modelo de lenguaje: no procesa ni genera texto, por lo que no debe evaluarse con benchmarks de NLP.
- Riesgo de extrapolacion fuera de distribucion: al entrenarse con bases de datos experimentales concretas, las predicciones fuera del regimen cubierto pueden ser poco fiables.
- Sesgos de los datos de entrenamiento: las bases de datos proceden de un conjunto limitado de dispositivos y campanas experimentales, lo que puede introducir sesgos hacia esas condiciones operativas.
- Licencia CC BY-SA 4.0: permite uso comercial, pero exige atribucion y que las obras derivadas se distribuyan bajo la misma licencia (copyleft). Ademas, los datos de origen imponen requisitos de citacion especificos (FAIR-MAST, HDB5, PR08, Alcator C-Mod, TCV).
- PR08 no tiene licencia formal: su uso esta sujeto a la condicion de citar el articulo correspondiente y se proporciona "tal cual", lo que anade incertidumbre juridica.
- Ausencia de documentacion sobre el preprocesado y las entradas exactas: dificulta la reutilizacion directa sin el codigo de entrenamiento original.
- No se documentan metricas de rendimiento ni validacion, por lo que no es posible evaluar su calidad predictiva a partir de la informacion disponible.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/fusion-world-model/lstm_1m_h-task-outputs
- Licencia CC BY-SA 4.0: https://creativecommons.org/licenses/by-sa/4.0/
- FAIR-MAST (UKAEA): Jackson et al. 2025, IEEE Trans. Plasma Sci. 53, 2440, doi:10.1109/TPS.2025.3583419
- FAIR-MAST (software): Jackson et al. 2024, SoftwareX 27, 101869, doi:10.1016/j.softx.2024.101869
- HDB5 (International Global H-Mode Confinement Database): Verdoolaege et al. 2021, Nucl. Fusion 61, 076006, doi:10.1088/1741-4326/abdb91
- PR08 (ITPA multi-tokamak profile database): Roach et al. 2008, Nucl. Fusion 48, 125001, doi:10.1088/0029-5515/48/12/125001
- Open Density Limit Database (Alcator C-Mod): https://github.com/MIT-PSFC/open_density_limit_database
- TCV L-H transition database: Labit and Pau (2025), Zenodo doi:10.5281/zenodo.14996664
- TCV L-H transition (articulo): Labit et al., Plasma Phys. Control. Fusion (2025), doi:10.1088/1361-6587/adc8ce
