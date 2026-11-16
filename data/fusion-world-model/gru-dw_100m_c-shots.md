# fusion-world-model/gru-dw_100m_c-shots

## Resumen

`gru-dw_100m_c-shots` es un modelo del mundo (world model) para plasmas de tokamak desarrollado por el colectivo `fusion-world-model`. No es un modelo de lenguaje: es una red neuronal recurrente de tipo GRU entrenada para predecir la evolución temporal de señales de diagnóstico de plasmas de fusión, actuando como simulador aprendido del comportamiento del plasma. El checkpoint publicado corresponde a la configuración ganadora de una búsqueda de 25 configuraciones, con un presupuesto de 100 millones de parámetros, arquitectura GRU de 2 capas, dropout 0,1 y un calentamiento (warmup) de 4000 pasos.

La relevancia del modelo reside en su dominio de aplicación: la modelización de plasmas de tokamak es un cuello de botella en el desarrollo de la fusión por confinamiento magnético, y un world model capaz de predecir la dinámica del plasma con antelación puede alimentar controladores y sistemas de predicción de disrupciones. El modelo se entrenó exclusivamente con la receta (c) *shots only*, es decir, únicamente con datos de descargas individuales, sin las demás fuentes que contempla la receta completa.

El repositorio (1,2 GB) contiene el checkpoint elegido (`final.pt`), dos réplicas con semillas de entrenamiento alternativas (`seed_1.pt`, `seed_2.pt`), la configuración de entrenamiento, el registro de selección y un manifiesto con hashes SHA-256. Los pesos se distribuyen bajo licencia CC BY-SA 4.0, heredada de los datos FAIR-MAST sobre los que se entrenó. No se trata de un modelo conversacional ni de propósito general: su interfaz es la de un modelo de series temporales sobre tensores PyTorch.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GRU (red neuronal recurrente con compuertas), 2 capas, dropout 0,1 |
| Parametros totales | 100M (presupuesto de diseño) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (modelo de series temporales, sin ventana de contexto declarada) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | CC BY-SA 4.0 |
| Formato de pesos | PyTorch (`.pt`, checkpoints guardados por el código de entrenamiento) |

## Arquitectura y entrenamiento

La arquitectura es una red recurrente GRU de dos capas con dropout de 0,1 y un calentamiento de 4000 pasos en el schedule de entrenamiento. El presupuesto de parámetros es de 100 millones. La configuración concreta publicada como `final.pt` es la de índice 6 entre las 25 configuraciones exploradas en la búsqueda de hiperparámetros, seleccionada por la regla de selección propia del autor (los scores están en `selection.json`). Los ficheros `seed_1.pt` y `seed_2.pt` son la misma configuración reentrenada con semillas distintas, lo que permite evaluar la variabilidad del entrenamiento.

El entrenamiento se realizó con la receta (c) *shots only*, es decir, únicamente con datos de descargas (shots) de tokamak. Las fuentes de datos acreditadas incluyen FAIR-MAST (UKAEA, CC BY-SA 4.0), la base de datos internacional HDB5/DB5.2.3 (CC BY 4.0), la release pública de 2008 de la base de perfiles multi-tokamak PR08 del ITPA, la Open Density Limit Database de Alcator C-Mod (MIT PSFC) y la base de datos de transiciones L-H de TCV. No se especifica en la información disponible el número total de tokens ni la composición exacta del dataset, ni si se aplicaron técnicas de RLHF o DPO (no procede en un modelo de series temporales de este tipo). El checkpoint de referencia del artículo es la revisión etiquetada `paper` (commit `f51b3fedb4f1a4ac49b5ed06df74091d5f78eec6`).

## Capacidades

- Predicción de la evolución temporal de señales de diagnóstico de plasmas de tokamak (modelo del mundo sobre series temporales).
- Simulación aprendida de la dinámica del plasma para horizontes de predicción definidos por el entrenamiento.
- Modelización multi-tokamak: el entrenamiento combina datos de FAIR-MAST, HDB5, PR08, Alcator C-Mod y TCV, por lo que el modelo está expuesto a regímenes y máquinas diversas.
- Reproducibilidad del entrenamiento mediante los checkpoints de semillas alternativas (`seed_1.pt`, `seed_2.pt`).
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso: no es un modelo de lenguaje.
- No tiene capacidades multilingües, de visión ni de audio.
- No dispone de modo *thinking* ni de decodificación especulativa.

## Casos de uso

- Predicción de disrupciones: el modelo puede usarse para anticipar la evolución de señales de diagnóstico y detectar precursores de disrupción con antelación suficiente para que un controlador actúe, aprovechando su entrenamiento sobre bases de datos multi-tokamak.
- Control en bucle cerrado: integrado como modelo predictivo dentro de un controlador de plasma, permite evaluar trayectorias futuras de las señales y seleccionar la acción de control que minimiza el riesgo de inestabilidad.
- Validación de escenarios en tokamaks existentes: dado un conjunto de condiciones iniciales y una secuencia de actuaciones, el modelo genera la evolución esperada del plasma, útil para planificar descargas antes de ejecutarlas en máquina.
- Estudio de transiciones L-H: el modelo se entrenó con la base de datos de transiciones L-H de TCV, por lo que puede emplearse para analizar la dinámica de esta transición en condiciones cercanas a las de entrenamiento.
- Análisis de límites de densidad: con datos de la Open Density Limit Database de Alcator C-Mod, el modelo puede explorar el comportamiento del plasma cerca del límite de densidad.
- Investigación comparativa de arquitecturas: los checkpoints de semillas permiten estudiar la estabilidad del entrenamiento y la variabilidad de las predicciones, útil para trabajos metodológicos sobre world models en fusión.
- Generación de datos sintéticos para aumento de dataset: las trayectorias predichas pueden emplearse como datos aumentados en el entrenamiento de otros modelos, siempre que se respete la licencia CC BY-SA 4.0.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada. Con 100M parámetros, en FP32 los pesos ocupan aproximadamente 400 MB; en FP16, unos 200 MB, pero estos cálculos son estimaciones a partir del recuento de parámetros y no datos publicados.
- GPU recomendadas: no disponible. Por tamaño, el modelo cabría en GPUs de consumo (RTX 3060, RTX 4090, etc.), pero no se confirma en la documentación.
- Cabe en consumer GPU: probablemente sí por tamaño de parámetros, aunque no está verificado en la información disponible.
- Opciones de despliegue: no disponible. Al ser un checkpoint PyTorch guardado por el código de entrenamiento, requiere cargarlo con PyTorch y la definición de arquitectura del autor; no se documenta compatibilidad con vLLM, llama.cpp, Ollama ni TGI (herramientas orientadas a modelos de lenguaje).
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye otros world models de tokamak comparables ni datos de rendimiento que permitan una comparación cuantitativa.

## Limitaciones y advertencias

- Modelo de dominio muy específico: solo es aplicable a series temporales de plasmas de tokamak; no sirve para generación de texto ni tareas de propósito general.
- Entrenado con la receta (c) *shots only*: no incorpora las demás fuentes de la receta completa, lo que puede limitar su generalización frente a variantes más completas.
- Riesgo de alucinación en el sentido de predicciones plausibles pero físicamente incorrectas fuera del régimen de entrenamiento; no se documentan métricas de error ni validación externa.
- Cobertura limitada a las máquinas y regímenes presentes en FAIR-MAST, HDB5, PR08, Alcator C-Mod y TCV; el comportamiento en tokamaks no representados es incierto.
- Licencia CC BY-SA 4.0: permite uso comercial con atribución y *share-alike*, lo que obliga a distribuir obras derivadas bajo la misma licencia. Es una restricción relevante para integración en productos propietarios.
- Los datos PR08 no tienen licencia formal y se proporcionan "as is"; conviene revisar las condiciones de atribución antes de un uso comercial.
- No se documentan sesgos ni limitaciones idiomáticas (no procede), pero tampoco se documenta el rendimiento en condiciones de ruido o datos faltantes.
- El checkpoint de referencia del artículo es la revisión `paper`; usar `final.pt` de `main` puede no coincidir con los resultados publicados.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/fusion-world-model/gru-dw_100m_c-shots
- Revisión del artículo (tag `paper`): commit `f51b3fedb4f1a4ac49b5ed06df74091d5f78eec6`
- Licencia CC BY-SA 4.0: https://creativecommons.org/licenses/by-sa/4.0/
- FAIR-MAST (UKAEA): Jackson et al. 2025, IEEE Trans. Plasma Sci. 53, 2440, doi:10.1109/TPS.2025.3583419; Jackson et al. 2024, SoftwareX 27, 101869, doi:10.1016/j.softx.2024.101869
- HDB5 (International Global H-Mode Confinement Database, DB5.2.3): Verdoolaege et al. 2021, Nucl. Fusion 61, 076006, doi:10.1088/1741-4326/abdb91
- PR08 (ITPA multi-tokamak profile database, 2008): Roach et al. 2008, Nucl. Fusion 48, 125001, doi:10.1088/0029-5515/48/12/125001
- Open Density Limit Database (Alcator C-Mod): https://github.com/MIT-PSFC/open_density_limit_database
- TCV L-H transition database: Labit y Pau (2025), Zenodo doi:10.5281/zenodo.14996664; Labit et al., Plasma Phys. Control. Fusion (2025), doi:10.1088/1361-6587/adc8ce
