# fusion-world-model/gru-dw_1m_c-shots

## Resumen

`gru-dw_1m_c-shots` es un checkpoint de un modelo del mundo (world model) para plasmas de tokamak, publicado por el usuario `fusion-world-model` en Hugging Face. Se trata de un modelo recurrente de tipo GRU con un presupuesto de 1 millón de parámetros, entrenado para predecir la evolución temporal de plasmas en dispositivos de fusión, no un modelo de lenguaje. Su relevancia radica en que aborda un problema de control y predicción en reactores de fusión mediante aprendizaje automático sobre datos experimentales reales.

El checkpoint corresponde a la configuración ganadora de una búsqueda de hiperparámetros sobre 30 configuraciones posibles, según indica la model card. La receta de entrenamiento se denomina "(c) shots only", lo que sugiere que se emplearon únicamente datos de disparos (shots) experimentales. El repositorio incluye el checkpoint seleccionado (`final.pt`), réplicas con semillas alternativas (`seed_1.pt`, `seed_2.pt`) y los ficheros de configuración y selección.

No hay información sobre idiomas soportados ni sobre la arquitectura detallada más allá de que es un GRU de 2 capas con dropout 0.1 y warmup de 4.000 pasos. El modelo está pensado para series temporales de física de plasmas, no para generación de texto ni tareas de NLP.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GRU (2 capas, dropout 0.1, warmup 4.000 pasos) |
| Parametros totales | 1M (presupuesto declarado) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo de series temporales, no lingüístico) |
| Licencia | CC BY-SA 4.0 |
| Formato de pesos | PyTorch (`.pt`) |

## Arquitectura y entrenamiento

La arquitectura es una red recurrente GRU de 2 capas con dropout de 0.1 y un esquema de warmup de 4.000 pasos. El modelo fue dimensionado con un presupuesto de 1M de parámetros y entrenado bajo la receta "(c) shots only", que según la model card implica el uso exclusivo de datos de disparos experimentales. No se detalla el número de tokens ni la composición exacta del dataset más allá de las fuentes de datos citadas: FAIR-MAST (UKAEA), HDB5 (International Global H-Mode Confinement Database), PR08 (ITPA multi-tokamak profile database), la Open Density Limit Database (Alcator C-Mod) y la base de datos de transición L-H de TCV.

El checkpoint `final.pt` corresponde a la configuración de índice 20 de las 30 entrenadas, seleccionada por la regla de selección de la búsqueda (cuyas puntuaciones están en `selection.json`). Las réplicas `seed_1.pt` y `seed_2.pt` son la misma configuración reentrenada con semillas distintas. El checkpoint del paper está etiquetado con el tag `paper` (commit `7ab2a08a11fce1457974c1c88fe6937ab36743e2`). No se describe si hubo RLHF, DPO ni ninguna innovación técnica adicional como decodificación especulativa o atención lineal.

## Capacidades

- Predicción de la evolución temporal de plasmas de tokamak (series temporales de física de fusión).
- Modelado del mundo (world model) para dinámica de plasmas, orientado a simulación y control.
- Entrenado sobre datos experimentales de múltiples dispositivos (FAIR-MAST, HDB5, PR08, Alcator C-Mod, TCV).
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso en el sentido de los LLM.
- No tiene capacidades multilingües (no procesa texto).
- No dispone de modo thinking, visión ni audio.

## Casos de uso

- Predicción de la evolución temporal de un disparo de plasma: el modelo recibe una secuencia de estados del plasma y predice los estados futuros, útil para anticipar transiciones y evitar disrupciones en tokamaks.
- Control predictivo en reactores de fusión: al ser un world model ligero (1M de parámetros), puede integrarse en bucles de control en tiempo real donde un simulador físico completo sería demasiado costoso.
- Aumento de datos experimentales: generar trayectorias sintéticas de plasma para entrenar otros modelos o para explorar regímenes operativos poco representados en las bases de datos.
- Análisis de transiciones L-H: el modelo puede emplearse para estudiar la transición entre modos de confinamiento L y H, dado que una de las fuentes de datos es la base de datos de TCV sobre esta transición.
- Estudio de límites de densidad: con datos de la Open Density Limit Database (Alcator C-Mod), el modelo puede predecir el comportamiento cerca del límite de densidad.
- Comparación entre dispositivos: al entrenarse con datos de varios tokamaks (FAIR-MAST, HDB5, PR08, Alcator C-Mod, TCV), puede emplearse para analizar similitudes y diferencias en la dinámica del plasma entre máquinas.
- Reproducibilidad de experimentos: las réplicas con semillas alternativas permiten evaluar la variabilidad del entrenamiento y la robustez del modelo ante distintas inicializaciones.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB, dado el presupuesto de 1M de parámetros y el formato PyTorch (no cuantizado).
- GPU recomendadas: cualquier GPU consumer moderna es suficiente; no se requiere A100 ni H100.
- Cabe en cualquier GPU consumer (RTX 3060, RTX 4090, etc.) e incluso en CPU para inferencia.
- Opciones de despliegue: PyTorch nativo (los checkpoints son ficheros `.pt` guardados por el código de entrenamiento); no se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

No disponible. No se han proporcionado datos de otros world models de tokamak comparables en la información disponible.

## Limitaciones y advertencias

- Modelo de 1M de parámetros: capacidad limitada para capturar dinámicas complejas del plasma en comparación con simuladores físicos o modelos de mayor tamaño.
- Entrenado con la receta "(c) shots only": puede no generalizar bien a regímenes operativos ausentes en los datos de disparos.
- Dependencia de las bases de datos citadas (FAIR-MAST, HDB5, PR08, Alcator C-Mod, TCV): sesgos y cobertura limitados a los dispositivos y condiciones representados en ellas.
- Riesgo de alucinación en el sentido de predicciones físicamente inconsistentes fuera del dominio de entrenamiento.
- Licencia CC BY-SA 4.0: permite uso comercial con atribución y compartir-alike; las obras derivadas deben distribuirse bajo la misma licencia.
- Restricciones de atribución: es obligatorio citar las fuentes de datos según se indica en la model card (FAIR-MAST, HDB5, PR08, Open Density Limit Database, TCV).
- No es un modelo de lenguaje: no debe emplearse para tareas de NLP, generación de texto ni código.
- El repositorio tiene 0 descargas y 0 likes, y un tamaño de 0.0 GB, lo que sugiere que los ficheros pueden no estar disponibles o el repositorio es meramente de referencia.

## Enlaces

- Hugging Face: https://huggingface.co/fusion-world-model/gru-dw_1m_c-shots
- Checkpoint del paper (tag `paper`): commit `7ab2a08a11fce1457974c1c88fe6937ab36743e2`
- Licencia CC BY-SA 4.0: https://creativecommons.org/licenses/by-sa/4.0/
- FAIR-MAST (UKAEA): Jackson et al. 2025, IEEE Trans. Plasma Sci. 53, 2440 (doi:10.1109/TPS.2025.3583419); Jackson et al. 2024, SoftwareX 27, 101869 (doi:10.1016/j.softx.2024.101869)
- HDB5: Verdoolaege et al. 2021, Nucl. Fusion 61, 076006 (doi:10.1088/1741-4326/abdb91)
- PR08: Roach et al. 2008, Nucl. Fusion 48, 125001 (doi:10.1088/0029-5515/48/12/125001)
- Open Density Limit Database: https://github.com/MIT-PSFC/open_density_limit_database
- TCV L-H transition database: Labit and Pau (2025), Zenodo doi:10.5281/zenodo.14996664; Labit et al., Plasma Phys. Control. Fusion (2025), doi:10.1088/1361-6587/adc8ce
