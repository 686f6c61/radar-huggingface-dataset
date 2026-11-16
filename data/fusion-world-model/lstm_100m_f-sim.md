# fusion-world-model/lstm_100m_f-sim

## Resumen

`lstm_100m_f-sim` es un modelo del mundo (world model) para plasmas de tokamak desarrollado por el proyecto `fusion-world-model`. Se trata de una red LSTM con un presupuesto de 100 millones de parametros, entrenada con la receta denominada "(f) simulator emulator", es decir, como emulador de un simulador de fisica de plasmas. El modelo predice la evolucion temporal de variables de plasma en reactores de fusion por confinamiento magnetico.

El repositorio publica el checkpoint seleccionado (`final.pt`) de entre 35 configuraciones exploradas durante una busqueda de hiperparametros, junto con dos replicas entrenadas con semillas distintas (`seed_1.pt`, `seed_2.pt`) y los metadatos de la seleccion. No es un modelo de lenguaje: no procesa texto ni dispone de una interfaz conversacional, sino que trabaja sobre series temporales fisicas.

Su relevancia radica en el contexto de la investigacion en fusion: emular rapidamente la respuesta de un plasma permite acelerar estudios de escenarios operativos, control y diseno de reactores (ITER, SPARC, STEP, MAST Upgrade) sin el coste computacional de un simulador completo. El modelo se distribuye bajo licencia CC BY-SA 4.0, heredada de los datos FAIR-MAST sobre los que se entreno.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LSTM (red neuronal recurrente) |
| Parametros totales | 100M (presupuesto de parametros declarado) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no aplica (modelo de series temporales, no linguistico) |
| Licencia | CC BY-SA 4.0 |
| Formato de pesos | PyTorch (`.pt`) |

## Arquitectura y entrenamiento

La arquitectura es una LSTM con un presupuesto de 100 millones de parametros. El modelo se entrena como emulador de simulador (receta "f"): aprende a reproducir la dinamica temporal que genera un simulador fisico de plasmas de tokamak, a partir de datos experimentales y de bases de datos de confinamiento y perfiles. No se dispone de informacion detallada sobre el numero de tokens o pasos temporales de entrenamiento, la composicion exacta del dataset ni si se aplicaron tecnicas de ajuste fino por refuerzo.

Los datos de entrenamiento pueden apoyarse en un conjunto amplio de fuentes citadas por el autor: FAIR-MAST (UKAEA), la base de datos HDB5 de confinamiento H-mode, PR08 del ITPA, la Open Density Limit Database de Alcator C-Mod, la base de datos de transicion L-H de TCV, OpenSTEP (escenario SPP-001 de STEP), SPARCPublic de Commonwealth Fusion Systems, las tablas de flujos QuaLiKiz QLKNN10D y QLKNN11D, y descripciones de maquina de ITER, MAST Upgrade, SPARC y STEP. La seleccion del checkpoint final se realizo mediante una regla de seleccion documentada en `selection.json`, sobre 35 configuraciones entrenadas.

## Capacidades

- Prediccion de series temporales de variables de plasma en tokamaks (emulacion de simulador fisico).
- Modelado de la evolucion temporal de escenarios de descarga y confinamiento.
- Emulacion de la respuesta del plasma en distintas maquinas (ITER, SPARC, STEP, MAST Upgrade) segun las fuentes de datos citadas.
- Reproducibilidad mediante multiples semillas de entrenamiento (`seed_1.pt`, `seed_2.pt`).
- No soporta tool calling, function calling ni razonamiento multi-paso en el sentido de los modelos de lenguaje.
- No dispone de capacidades multilingues, vision, audio ni modo de razonamiento (thinking mode).

## Casos de uso

- Emulacion rapida de simulaciones de plasma: sustituir llamadas costosas a un simulador fisico por inferencia de la LSTM para explorar grandes barridos de parametros de escenario en tiempos reducidos.
- Estudio de escenarios operativos en reactores de diseno: evaluar la evolucion temporal de descargas en configuraciones tipo ITER, SPARC o STEP usando los datos de maquina citados en el entrenamiento.
- Analisis de transiciones de confinamiento: modelar la dinamica en torno a la transicion L-H a partir de la base de datos de TCV incluida en las fuentes.
- Investigacion sobre limites de densidad: apoyar estudios del limite de densidad usando la Open Density Limit Database de Alcator C-Mod como referencia de entrenamiento.
- Control y planificacion de experimentos: generar predicciones de evolucion temporal que alimenten algoritmos de control o de planificacion de descargas en tokamaks.
- Reproducibilidad de resultados cientificos: comparar el checkpoint `paper` con las replicas por semilla para evaluar la varianza del entrenamiento en estudios de fusion.
- Docencia e investigacion en fisica de plasmas: disponer de un emulador ligero (100M parametros) para experimentar con dinamica de plasmas sin acceso a un simulador completo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma oficial; con 100M parametros en precision completa (fp32) el modelo ocupa aproximadamente 0,4 GB en pesos, y en fp16 alrededor de 0,2 GB, aunque el consumo real depende de la longitud de secuencia y del tamano de lote.
- GPU recomendadas: no especificadas por el autor; por tamano, cualquier GPU con al menos 2-4 GB de VRAM deberia poder ejecutar el modelo, incluidas GTX 1650, RTX 3060 o superiores.
- Cabe en GPU de consumo: si, por el reducido numero de parametros.
- Opciones de despliegue: al ser un checkpoint PyTorch (`.pt`) guardado por el codigo de entrenamiento, requiere cargarse con PyTorch; no se documenta soporte para vLLM, llama.cpp, Ollama o TGI, que estan orientados a modelos de lenguaje.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. No se han proporcionado modelos comparables de la misma categoria (emuladores LSTM de plasmas de tokamak) en la informacion disponible.

## Limitaciones y advertencias

- El modelo es un emulador de simulador: su fidelidad esta acotada por la del simulador y los datos de entrenamiento, y no sustituye a la fisica de primer principio en regimenes fuera de distribucion.
- Riesgo de extrapolacion incorrecta en escenarios, maquinas o regimenes no representados en los datos de entrenamiento (FAIR-MAST, HDB5, PR08, Alcator C-Mod, TCV, STEP, SPARC, entre otros).
- No es un modelo de lenguaje: no admite prompts en lenguaje natural ni genera texto; cualquier uso conversacional es inadecuado.
- La licencia CC BY-SA 4.0 obliga a atribuir y a compartir bajo la misma licencia las obras derivadas, lo que puede condicionar su uso en productos propietarios.
- El modelo se distribuye con 0 descargas y 0 likes en el momento de la consulta, sin validacion externa documentada.
- No se detallan sesgos, limitaciones de contexto ni resultados de evaluacion independientes.
- Las citas y atribuciones de las fuentes de datos son obligatorias segun los terminos de cada base de datos (FAIR-MAST, HDB5, PR08, Open Density Limit Database, TCV, OpenSTEP, SPARCPublic, QLKNN, entre otras).

## Enlaces

- Hugging Face: https://huggingface.co/fusion-world-model/lstm_100m_f-sim
- Checkpoint del paper (tag `paper`, commit `c965606514f1521aa4d1d35b22ce2dfe436792aa`): https://huggingface.co/fusion-world-model/lstm_100m_f-sim/tree/paper
- Licencia CC BY-SA 4.0: https://creativecommons.org/licenses/by-sa/4.0/
- FAIR-MAST (UKAEA): doi:10.1109/TPS.2025.3583419 y doi:10.1016/j.softx.2024.101869
- HDB5 (International Global H-Mode Confinement Database): doi:10.1088/1741-4326/abdb91
- PR08 (ITPA profile database): doi:10.1088/0029-5515/48/12/125001
- Open Density Limit Database (MIT PSFC): https://github.com/MIT-PSFC/open_density_limit_database
- TCV L-H transition database: doi:10.5281/zenodo.14996664 y doi:10.1088/1361-6587/adc8ce
- OpenSTEP (STEP SPP-001): doi:10.14468/07jt-s540
- SPARCPublic (Commonwealth Fusion Systems): Creely et al., J. Plasma Phys. 86, 865860502 (2020)
- QLKNN10D y QLKNN11D (QuaLiKiz): doi:10.5281/zenodo.3497066 y doi:10.5281/zenodo.8017522
