# fusion-world-model/lstm_1m_d-sim-to-shots

## Resumen

`lstm_1m_d-sim-to-shots` es un checkpoint de un modelo del mundo (*world model*) para plasmas de tokamak, desarrollado por el usuario `fusion-world-model`. Se trata de una red LSTM con un presupuesto de parametros de aproximadamente 1 millon, entrenada con la receta "(d)": preentrenamiento sobre datos de simulador y posterior ajuste con descargas reales (*shots*) de tokamaks. El modelo no es un modelo de lenguaje: es un modelo de series temporales orientado a predecir la dinamica de plasmas en dispositivos de fusion por confinamiento magnetico.

Su relevancia es acotada pero especifica: forma parte de un estudio comparativo de recetas de entrenamiento para modelos del mundo aplicados a fusion, y su publicacion en Hugging Face sigue una practica de reproducibilidad poco habitual en el campo (checkpoints versionados por tag, manifiesto con hashes SHA-256 y semillas adicionales para evaluar varianza de entrenamiento). El repositorio incluye `final.pt` (configuracion seleccionada de entre 30), dos replicas con semillas distintas (`seed_1.pt`, `seed_2.pt`) y los ficheros de configuracion y seleccion.

No se dispone de informacion sobre arquitectura detallada mas alla de que es una LSTM, ni sobre el numero exacto de parametros, contexto temporal, idiomas (no aplica) o formato distinto de PyTorch. La licencia es CC BY-SA 4.0, heredada de los datos FAIR-MAST sobre los que se entreno.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LSTM (red neuronal recurrente) |
| Parametros totales | presupuesto de 1M (valor exacto no disponible) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no aplica (modelo de series temporales, no linguistico) |
| Licencia | CC BY-SA 4.0 |
| Formato de pesos | PyTorch (`.pt`) |

## Arquitectura y entrenamiento

La arquitectura es una LSTM con un presupuesto de parametros de 1 millon. El modelo se entrena en dos fases segun la receta "(d)": primero un preentrenamiento sobre datos generados por simulador y despues un ajuste con descargas (*shots*) reales de tokamaks. No se detalla en la model card el numero de tokens, la composicion exacta del dataset, la longitud de secuencia ni si se emplearon tecnicas de RLHF, DPO o similares (no aplica en este dominio, pero no se documenta ninguna etapa de alineamiento).

El proceso de seleccion es destacable desde el punto de vista metodologico: se entrenaron 30 configuraciones y `final.pt` corresponde a la de indice 20, la mejor segun la regla de seleccion del estudio (cuyas puntuaciones se guardan en `selection.json`). Las replicas `seed_1.pt` y `seed_2.pt` permiten estimar la varianza entre semillas. Los datos de entrenamiento proceden de fuentes de acceso publico en fisica de plasmas: FAIR-MAST (UKAEA), HDB5, PR08, la Open Density Limit Database, la base de transiciones L-H de TCV, OpenSTEP, SPARCPublic, las tablas de flujos QLKNN10D y QLKNN11D, y descripciones publicas de las maquinas ITER, MAST Upgrade, SPARC y STEP.

## Capacidades

- Prediccion de series temporales de plasmas de tokamak (evolucion de variables fisicas del plasma).
- Modelado del mundo: simula la dinamica del sistema a partir de observaciones, segun la formulacion del estudio.
- Transferencia simulador a datos reales: el preentrenamiento en simulador y el ajuste posterior con *shots* permiten evaluar la brecha sim-a-real.
- Reproducibilidad: checkpoints con semillas multiples y manifiesto con hashes SHA-256.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni capacidades multilingues (no es un modelo de lenguaje).
- No dispone de modo *thinking*, vision ni audio.

## Casos de uso

- Investigacion en control de fusion: usar el modelo como predictor de la evolucion del plasma para estudiar estrategias de control en simulacion antes de probarlas en maquina real.
- Estudio de transferencia sim-a-real: comparar el rendimiento de `final.pt` frente a las replicas `seed_1.pt` y `seed_2.pt` para cuantificar la varianza de la receta (d) y su robustez al cambiar de semilla.
- Benchmark de recetas de entrenamiento: emplear el checkpoint como referencia en comparaciones entre recetas de preentrenamiento (simulador vs. datos reales) dentro del mismo estudio.
- Analisis de sensibilidad a datos de distintas maquinas: dado que el entrenamiento integra datos de MAST, TCV, SPARC, STEP e ITER, el modelo puede usarse para explorar generalizacion entre dispositivos.
- Prototipado de modelos del mundo en series temporales cientificas: servir de linea base LSTM de 1M de parametros para comparar con arquitecturas mas grandes o transformers temporales.
- Docencia y divulgacion en fisica de plasmas computacional: el modelo es pequeno y ligero (repo de 0.0 GB declarado), lo que facilita su inspeccion y ejecucion en entornos modestos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas numericas (MSE, MAE, R² u otras) ni comparaciones cuantitativas con modelos alternativos.

## Requisitos de hardware

- VRAM estimada para inferencia: muy baja; con 1M de parametros, el modelo cabe holgadamente en cualquier GPU consumer (incluso integradas) y en CPU.
- GPU recomendadas: no se especifican; cualquier GPU con soporte PyTorch es suficiente. Para lotes grandes o barridos de semillas, una RTX 3060 o superior es mas que suficiente.
- Cabe en GPU consumer: si, en practicamente todas las GPU modernas e incluso en CPU.
- Opciones de despliegue: PyTorch nativo (carga directa de los `.pt`), TorchScript o exportacion a ONNX si se requiere. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI (no aplican a este tipo de modelo).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye otros modelos del mundo para plasmas de tokamak con los que comparar parametros, contexto, rendimiento o licencia. El propio repositorio incluye replicas con semillas distintas del mismo modelo, que pueden servir como referencia interna de variabilidad, pero no como alternativa externa.

## Limitaciones y advertencias

- Modelo de dominio muy especifico (plasmas de tokamak); no es utilizable fuera de ese ambito.
- No es un modelo de lenguaje: no procesa ni genera texto, por lo que no aplican capacidades conversacionales.
- Sesgos potenciales derivados de los datos de entrenamiento: predominio de ciertas maquinas (MAST, TCV, SPARC, STEP, ITER) y regimenes operativos, lo que puede limitar la generalizacion a dispositivos o escenarios no representados.
- Riesgo de extrapolacion incorrecta fuera del regimen de entrenamiento; no se documentan metricas de error ni intervalos de confianza.
- Licencia CC BY-SA 4.0: permite uso comercial y modificacion, pero obliga a atribucion y a compartir las obras derivadas bajo la misma licencia. Ademas, los datos de origen imponen obligaciones de citacion especificas (FAIR-MAST, HDB5, PR08, SPARCPublic, etc.) que deben respetarse.
- El aviso de SPARCPublic exige una formula de reconocimiento concreta ("The information, data, or work presented herein builds on the SPARC primary reference discharge and X-point target discharge data provided by Commonwealth Fusion Systems.") que debe incluirse en publicaciones derivadas.
- El repositorio declara un tamano de 0.0 GB, lo que sugiere que los pesos pueden no estar efectivamente alojados o que el tamano es inferior a la precision de redondeo; conviene verificar el manifiesto (`manifest.json`) antes de asumir disponibilidad completa.
- No se documenta el preprocesado, la normalizacion ni el formato exacto de entrada/salida; sera necesario consultar el codigo de entrenamiento (no enlazado en la informacion disponible) para usarlo en produccion.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/fusion-world-model/lstm_1m_d-sim-to-shots
- Checkpoint del paper (tag `paper`, commit `33c684cde7d2b31f3c97259f042e0afadb3691cb`): https://huggingface.co/fusion-world-model/lstm_1m_d-sim-to-shots/tree/paper
- Licencia CC BY-SA 4.0: https://creativecommons.org/licenses/by-sa/4.0/
- FAIR-MAST (UKAEA): Jackson et al. 2025, IEEE Trans. Plasma Sci. 53, 2440, doi:10.1109/TPS.2025.3583419; Jackson et al. 2024, SoftwareX 27, 101869, doi:10.1016/j.softx.2024.101869
- HDB5 (International Global H-Mode Confinement Database): Verdoolaege et al. 2021, Nucl. Fusion 61, 076006, doi:10.1088/1741-4326/abdb91
- PR08 (ITPA multi-tokamak profile database): Roach et al. 2008, Nucl. Fusion 48, 125001, doi:10.1088/0029-5515/48/12/125001
- Open Density Limit Database (Alcator C-Mod): https://github.com/MIT-PSFC/open_density_limit_database
- TCV L-H transition database: Labit y Pau (2025), Zenodo doi:10.5281/zenodo.14996664; Labit et al., Plasma Phys. Control. Fusion (2025), doi:10.1088/1361-6587/adc8ce
- OpenSTEP (SPP-001): doi:10.14468/07jt-s540; Hudoba et al., Nucl. Fusion 64, 086055 (2024); Tholerus et al., Nucl. Fusion 64, 106030 (2024)
- SPARCPublic (Commonwealth Fusion Systems): Creely et al., J. Plasma Phys. 86, 865860502 (2020)
- QLKNN10D y QLKNN11D (QuaLiKiz): Zenodo doi:10.5281/zenodo.3497066 y doi:10.5281/zenodo.8017522; van de Plassche et al., Phys. Plasmas 27, 022310 (2020), doi:10.1063/1.5134126
- Descripciones de maquinas: ITER Physics Basis, Nucl. Fusion 39 (1999) 2137 y Nucl. Fusion 47 (2007) S1; MAST Upgrade, Nucl. Fusion 64 (2024), doi:10.1088/1741-4326/ad6011 y doi:10.1088/1741-4326/ad56a2; SPARC, Creely et al., J. Plasma Phys. 86 (2020) 865860502 y Phys. Plasmas 30 (2023) 090601; STEP, Meyer y STEP Team, Phil. Trans. R. Soc. A 382 (2024) 20230406, y OpenSTEP, doi:10.14468/07jt-s540
