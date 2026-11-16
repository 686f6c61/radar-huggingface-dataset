# fusion-world-model/gru-dw_1m_d-sim-to-shots

## Resumen

`gru-dw_1m_d-sim-to-shots` es un checkpoint de un modelo del mundo (world model) para plasmas de tokamak, publicado por el autor `fusion-world-model` en Hugging Face. No es un modelo de lenguaje: es una red recurrente GRU entrenada sobre series temporales de física de plasmas, con un presupuesto de 1 millón de parámetros y una arquitectura de 2 capas con dropout 0.1 y un calentamiento (warmup) de 4.000 pasos. Su propósito es predecir la evolución dinámica de descargas de tokamak, sirviendo como emulador rápido de simulaciones y como herramienta de exploración de escenarios de fusión.

El modelo se entrena en dos fases: primero un preentrenamiento sobre datos de simulador (receta "d", `sim-to-shots`) y después un ajuste sobre descargas reales ("shots"). Esta estrategia de transferencia simulador-a-experimento es relevante porque permite aprovechar el volumen de datos sintéticos de simuladores de plasma y corregir el sesgo con datos experimentales de tokamaks reales como JET, MAST Upgrade, Alcator C-Mod, TCV, SPARC o STEP.

El checkpoint publicado (`final.pt`) corresponde a la configuración de índice 19 de las 30 configuraciones evaluadas en una búsqueda de hiperparámetros, seleccionada por la regla de selección del autor. Se acompañan dos réplicas con semillas distintas (`seed_1.pt`, `seed_2.pt`) y los metadatos de configuración y selección. El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y el tamaño del repo es de 0.0 GB. La licencia es CC BY-SA 4.0, heredada de los datos FAIR-MAST sobre los que se entrenó.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GRU (2 capas, dropout 0.1, warmup de 4.000 pasos) |
| Parametros totales | 1M (presupuesto declarado) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | CC BY-SA 4.0 |
| Formato de pesos | PyTorch (`.pt`) |

## Arquitectura y entrenamiento

La arquitectura es una red neuronal recurrente de tipo GRU con dos capas y dropout de 0.1, con un presupuesto de 1 millón de parámetros y un calentamiento de 4.000 pasos durante el entrenamiento. La model card no detalla la dimensión oculta, el tamaño de las secuencias de entrada ni las variables físicas concretas que se predicen, por lo que esos datos no están disponibles. El modelo se encuadra en la categoría de "world models" de series temporales aplicados a plasmas de tokamak.

El entrenamiento sigue la receta (d): preentrenamiento sobre datos de simulador y posterior ajuste sobre descargas experimentales ("sim-to-shots"). Los datos de entrenamiento pueden apoyarse en un conjunto amplio de fuentes de física de fusión: FAIR-MAST (UKAEA), HDB5 (base de datos internacional de confinamiento H-mode), PR08 (base de perfiles multi-tokamak del ITPA), la Open Density Limit Database de Alcator C-Mod, la base de transición L-H de TCV, OpenSTEP (escenario SPP-001 de STEP), SPARCPublic (descarga de referencia de SPARC de Commonwealth Fusion Systems), las tablas de flujos QLKNN10D y QLKNN11D de QuaLiKiz, y descripciones de máquina de ITER, MAST Upgrade, SPARC y STEP. La model card no especifica el número de tokens ni la composición exacta del dataset, ni si hubo RLHF o DPO (no aplicable en este dominio).

## Capacidades

- Predicción de series temporales de plasmas de tokamak: modela la evolución dinámica de descargas a partir de datos de simulador y experimentales.
- Transferencia simulador-a-experimento: el preentrenamiento en simulador y el ajuste en "shots" permiten emular el comportamiento de descargas reales.
- Emulación rápida de simuladores de plasma: al ser un modelo de 1M de parámetros, puede sustituir a simuladores numéricos costosos en bucles de exploración.
- Exploración de escenarios de fusión: útil para barrer configuraciones de descarga y estudiar transiciones (por ejemplo, L-H) y límites de densidad.
- Reproducibilidad: se publican tres semillas (`final.pt`, `seed_1.pt`, `seed_2.pt`) y los metadatos de selección para evaluar la varianza del entrenamiento.
- No soporta tool calling, agentes, visión, audio ni capacidades multilingües; no es un modelo generativo de texto.

## Casos de uso

- Emulación de simuladores de transporte de plasma: sustituir llamadas costosas a códigos de simulación por el GRU en bucles de optimización de escenarios, aprovechando su bajo coste computacional (1M de parámetros).
- Exploración de espacio de parámetros de descarga: barrer configuraciones de tokamak para identificar regiones de operación estables antes de lanzar simulaciones de alta fidelidad.
- Estudio de transiciones L-H: usar el modelo para predecir la evolución temporal de descargas cerca de la transición, apoyándose en los datos de TCV incluidos en las fuentes de entrenamiento.
- Predicción de límites de densidad: modelar el comportamiento cerca del límite de densidad usando la Open Density Limit Database de Alcator C-Mod como referencia experimental.
- Preentrenamiento y ajuste fino para nuevos tokamaks: reutilizar el checkpoint como inicialización para adaptar el modelo a máquinas como SPARC, STEP o MAST Upgrade con datos limitados.
- Investigación en world models de series temporales: usar el checkpoint como línea base reproducible (tres semillas, configuración documentada) para comparar arquitecturas recurrentes en dominios físicos.
- Docencia y divulgación en física de plasmas: ilustrar cómo un modelo neuronal pequeño puede aproximar dinámicas complejas de confinamiento magnético.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en FP32 para un modelo de 1M de parámetros; cabe holgadamente en cualquier GPU consumer.
- GPU recomendadas: cualquier GPU moderna sirve; no se requiere A100 ni H100. Una RTX 4090 o incluso una GPU integrada es suficiente.
- Cabe en consumer GPU: sí, en cualquier GPU consumer e incluso en CPU.
- Opciones de despliegue: PyTorch nativo (los checkpoints son `.pt` guardados por el código de entrenamiento). No se documentan integraciones con vLLM, llama.cpp, Ollama o TGI, que no aplican a este tipo de modelo.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye otros world models de tokamak comparables ni datos de rendimiento que permitan una comparación cuantitativa.

## Limitaciones y advertencias

- Sesgos de datos: el modelo hereda los sesgos de las bases de datos de fusión utilizadas (FAIR-MAST, HDB5, PR08, Alcator C-Mod, TCV, OpenSTEP, SPARC, QLKNN), que no cubren uniformemente todos los regímenes de operación ni todas las máquinas.
- Riesgo de extrapolación: al ser un modelo de 1M de parámetros entrenado con datos acotados, puede fallar fuera de la distribución de descargas vista durante el entrenamiento.
- Sin benchmarks publicados: no hay métricas de error (RMSE, MAE) ni comparaciones con simuladores de referencia en la información disponible, lo que impide evaluar su fidelidad.
- Documentación incompleta: la model card no especifica variables de entrada/salida, longitud de secuencia, ni el procedimiento exacto de inferencia.
- Licencia CC BY-SA 4.0: permite uso comercial, pero obliga a atribuir y a compartir las obras derivadas bajo la misma licencia. Además, los datos de origen imponen requisitos de citación específicos (FAIR-MAST, HDB5, PR08, Alcator C-Mod, TCV, OpenSTEP, SPARC, QLKNN) que deben respetarse.
- Uso previsto restringido a investigación en fusión: no es un modelo de lenguaje y no debe emplearse para tareas de NLP, generación de texto ni agentes.
- Repositorio sin tracción: 0 descargas y 0 likes en el momento de la consulta, sin evidencia de validación por parte de la comunidad.

## Enlaces

- Hugging Face: https://huggingface.co/fusion-world-model/gru-dw_1m_d-sim-to-shots
- FAIR-MAST (UKAEA): Jackson et al. 2025, IEEE Trans. Plasma Sci. 53, 2440, doi:10.1109/TPS.2025.3583419
- FAIR-MAST (software): Jackson et al. 2024, SoftwareX 27, 101869, doi:10.1016/j.softx.2024.101869
- HDB5: Verdoolaege et al. 2021, Nucl. Fusion 61, 076006, doi:10.1088/1741-4326/abdb91
- PR08: Roach et al. 2008, Nucl. Fusion 48, 125001, doi:10.1088/0029-5515/48/12/125001
- Open Density Limit Database: https://github.com/MIT-PSFC/open_density_limit_database
- TCV L-H transition database: Labit y Pau (2025), Zenodo doi:10.5281/zenodo.14996664; Labit et al., Plasma Phys. Control. Fusion (2025), doi:10.1088/1361-6587/adc8ce
- OpenSTEP: Brown et al. (2025), doi:10.14468/07jt-s540; Hudoba et al., Nucl. Fusion 64, 086055 (2024); Tholerus et al., Nucl. Fusion 64, 106030 (2024)
- SPARCPublic: Creely et al., J. Plasma Phys. 86, 865860502 (2020)
- QLKNN10D: Zenodo doi:10.5281/zenodo.3497066; van de Plassche et al., Phys. Plasmas 27, 022310 (2020), doi:10.1063/1.5134126
- QLKNN11D: Zenodo doi:10.5281/zenodo.8017522
- Licencia CC BY-SA 4.0: https://creativecommons.org/licenses/by-sa/4.0/
