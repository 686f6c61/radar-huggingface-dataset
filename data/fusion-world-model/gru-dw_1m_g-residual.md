# fusion-world-model/gru-dw_1m_g-residual

## Resumen

`gru-dw_1m_g-residual` es un modelo del mundo (world model) para plasmas de tokamak desarrollado por el colectivo `fusion-world-model`. No es un modelo de lenguaje: es una red recurrente GRU entrenada para predecir la evolucion temporal de la dinamica de un plasma de fusion, y se distribuye como checkpoint de PyTorch junto a un emulador congelado del que depende. Su relevancia es acotada pero clara dentro del ecosistema de IA para fusion nuclear: proporciona un modelo ligero (presupuesto de 1M de parametros) que puede servir como sustituto rapido de simulaciones fisicas costosas en tareas de control y exploracion de escenarios.

La arquitectura es una GRU de 2 capas con dropout 0.1 y un calentamiento (warmup) de 4000 pasos, segun la receta de "emulador + correccion" (recipe g). El checkpoint publicado como `final.pt` corresponde a la configuracion de indice 10 de las 25 que se entrenaron en la busqueda del autor, seleccionada por la regla de seleccion documentada en `selection.json`. Se acompanan dos replicas con semillas de entrenamiento distintas (`seed_1.pt`, `seed_2.pt`) y el emulador congelado `emulator.pt` que el modelo carga en inferencia.

El modelo no ofrece generacion de texto ni capacidades linguisticas: su dominio es exclusivamente la prediccion de series temporales de plasmas. La licencia CC BY-SA 4.0 hereda las condiciones de los datos FAIR-MAST con los que fue entrenado, lo que impone obligaciones de atribucion y comparticion bajo la misma licencia para obras derivadas. El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y un tamano de 0.0 GB, lo que sugiere un paquete de pesos muy pequeno (coherente con 1M de parametros).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GRU (2 capas, dropout 0.1, warmup de 4000 pasos) |
| Parametros totales | 1M (presupuesto de diseno) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (checkpoints PyTorch en `float` nativo) |
| Idiomas soportados | no aplica (modelo de series temporales, no linguistico) |
| Licencia | CC BY-SA 4.0 |
| Formato de pesos | PyTorch (`.pt`) |

## Arquitectura y entrenamiento

El modelo es una red neuronal recurrente del tipo GRU (Gated Recurrent Unit) de 2 capas con dropout 0.1 y un calentamiento de 4000 pasos en la tasa de aprendizaje. Se enmarca en la receta (g) del autor, descrita como "emulador + correccion": el modelo no predice directamente la dinamica del plasma, sino que se entrena contra un emulador congelado (`emulator.pt`) que actua como referencia fisica y aplica una correccion sobre sus salidas. El presupuesto de parametros es de 1M, lo que lo situa en la categoria de modelos ligeros aptos para inferencia en CPU o GPU de gama baja.

El entrenamiento se realizo sobre datos de multiples fuentes de fisica de plasmas de tokamak, todas ellas acreditadas en la model card: FAIR-MAST (UKAEA), la base de datos internacional HDB5 (DB5.2.3), PR08 del ITPA, la Open Density Limit Database de Alcator C-Mod, la base de datos de transicion L-H de TCV, OpenSTEP (escenario SPP-001 de STEP), SPARCPublic de Commonwealth Fusion Systems, las tablas de flujos QLKNN10D y QLKNN11D de QuaLiKiz, y descripciones de maquina de ITER, MAST Upgrade, SPARC y STEP. No se especifica el numero de tokens ni la composicion exacta del dataset de entrenamiento. La seleccion del checkpoint final se realizo entre 25 configuraciones entrenadas, aplicando la regla de seleccion registrada en `selection.json`; `final.pt` es la configuracion de indice 10, la mejor rankeada por dicha regla.

## Capacidades

- Prediccion de series temporales de plasmas de tokamak mediante modelado autorregresivo con estado recurrente.
- Emulacion de la dinamica del plasma con correccion sobre un emulador fisico congelado (`emulator.pt`).
- Soporte de multiples escenarios de maquina: los datos de entrenamiento cubren ITER, MAST Upgrade, SPARC, STEP y TCV, entre otros.
- Reproducibilidad de semillas: se publican `seed_1.pt` y `seed_2.pt` para evaluar la varianza entre ejecuciones de entrenamiento.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni capacidades multilingues.
- No dispone de modo "thinking", vision ni audio.

## Casos de uso

- **Sustituto rapido de simulaciones de plasma en bucles de control**: el modelo puede evaluar la evolucion de un estado de plasma en milisegundos en lugar de ejecutar un codigo de transporte completo, lo que lo hace adecuado para control en tiempo real o para exploracion de espacios de parametros.
- **Generacion de escenarios para STEP y SPARC**: dado que los datos de entrenamiento incluyen OpenSTEP (SPP-001) y SPARCPublic, el modelo puede usarse para predecir la evolucion de escenarios de referencia de estos reactores y comparar alternativas de operacion.
- **Aumento de datos para entrenamiento de controladores**: las predicciones del modelo pueden generar trayectorias sinteticas de plasma que sirvan como datos adicionales para entrenar politicas de control por refuerzo, reduciendo la dependencia de simulaciones costosas.
- **Estudio de transiciones L-H**: con la base de datos de TCV incluida en el entrenamiento, el modelo puede emplearse para analizar la transicion entre regimenes de confinamiento L y H y predecir sus condiciones de disparo.
- **Analisis de sensibilidad de parametros de maquina**: al cubrir descripciones de ITER, MAST Upgrade, SPARC y STEP, permite explorar como varian las predicciones ante cambios en parametros de diseno sin reejecutar la fisica de primer principio.
- **Prototipado rapido en investigacion de fusion**: con solo 1M de parametros y pesos PyTorch, se puede integrar en cuadernos de investigacion y pipelines de analisis en CPU, lo que facilita la experimentacion por parte de grupos con recursos limitados.
- **Validacion cruzada de emuladores**: el par `emulator.pt` + modelo corregido permite comparar la calidad del emulador fisico frente a la correccion aprendida en distintos regimenes de operacion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye tablas comparativas de error de prediccion, R², RMSE ni metricas frente a otros modelos de plasma.

## Requisitos de hardware

- **VRAM estimada para inferencia**: inferior a 100 MB en precision nativa, dado el presupuesto de 1M de parametros y el emulador congelado asociado.
- **GPU recomendadas**: cualquier GPU consumer moderna es suficiente; el modelo cabe holgadamente en GTX 1650, RTX 3060, RTX 4090 o superiores. Tambien es viable en CPU.
- **Cabe en consumer GPU**: si, en practicamente cualquier GPU consumer y en CPU.
- **Opciones de despliegue**: PyTorch nativo (el checkpoint se carga con el codigo de entrenamiento del autor); no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- **Latencia y throughput estimados**: no disponibles en la informacion proporcionada; por el tamano del modelo se espera latencia de milisegundos en GPU y decenas de milisegundos en CPU, pero no hay mediciones publicadas.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye otros world models de plasma comparables ni datos de rendimiento que permitan una comparacion cuantitativa. Como referencia cualitativa, el modelo se situa en la categoria de emuladores ligeros de dinamica de tokamak basados en redes recurrentes, frente a aproximaciones basadas en redes densas (tipo QLKNN) o en simulaciones de transporte completas, pero no se dispone de metricas para establecer una comparacion rigurosa.

## Limitaciones y advertencias

- **Dominio restringido**: el modelo solo predice dinamica de plasmas de tokamak; no es un modelo de lenguaje y no debe evaluarse con criterios de NLP.
- **Dependencia del emulador**: requiere cargar `emulator.pt` en inferencia; sin el, el checkpoint no es funcional de forma autonoma.
- **Riesgo de extrapolacion**: al entrenarse sobre bases de datos acotadas (FAIR-MAST, HDB5, PR08, TCV, STEP, SPARC, entre otras), las predicciones fuera de la distribucion de entrenamiento pueden degradarse sin aviso.
- **Varianza entre semillas**: la publicacion de `seed_1.pt` y `seed_2.pt` sugiere que los resultados dependen de la semilla de entrenamiento; conviene evaluar las tres variantes antes de usarlo en produccion.
- **Licencia copyleft**: CC BY-SA 4.0 obliga a atribuir y a compartir las obras derivadas bajo la misma licencia, lo que puede ser incompatible con despliegues comerciales cerrados.
- **Obligaciones de atribucion adicionales**: los datos de entrenamiento imponen citas especificas (FAIR-MAST, HDB5, PR08, OpenSTEP, SPARCPublic, QLKNN, entre otras) que deben respetarse en cualquier publicacion o producto derivado.
- **Sin garantias**: los datos PR08 se proporcionan "as is" y sin licencia formal, lo que anade incertidumbre juridica sobre el uso comercial del modelo entrenado con ellos.
- **Sin benchmarks publicados**: no hay metricas de error que permitan estimar su fidelidad frente a simulaciones de referencia.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/fusion-world-model/gru-dw_1m_g-residual
- Checkpoint del paper (tag `paper`, commit `28ca8347813f42abe805cbaa07acee1e54719669`): https://huggingface.co/fusion-world-model/gru-dw_1m_g-residual/tree/paper
- Licencia CC BY-SA 4.0: https://creativecommons.org/licenses/by-sa/4.0/
- FAIR-MAST (UKAEA): Jackson et al. 2025, IEEE Trans. Plasma Sci. 53, 2440, doi:10.1109/TPS.2025.3583419
- FAIR-MAST software: Jackson et al. 2024, SoftwareX 27, 101869, doi:10.1016/j.softx.2024.101869
- HDB5 (DB5.2.3): Verdoolaege et al. 2021, Nucl. Fusion 61, 076006, doi:10.1088/1741-4326/abdb91
- PR08 (ITPA): Roach et al. 2008, Nucl. Fusion 48, 125001, doi:10.1088/0029-5515/48/12/125001
- Open Density Limit Database (Alcator C-Mod): https://github.com/MIT-PSFC/open_density_limit_database
- TCV L-H transition database: Labit y Pau (2025), doi:10.5281/zenodo.14996664; Labit et al., Plasma Phys. Control. Fusion (2025), doi:10.1088/1361-6587/adc8ce
- OpenSTEP (SPP-001): doi:10.14468/07jt-s540; Hudoba et al., Nucl. Fusion 64, 086055 (2024); Tholerus et al., Nucl. Fusion 64, 106030 (2024)
- SPARCPublic (Commonwealth Fusion Systems): Creely et al., J. Plasma Phys. 86, 865860502 (2020)
- QLKNN10D: doi:10.5281/zenodo.3497066; QLKNN11D: doi:10.5281/zenodo.8017522; van de Plassche et al., Phys. Plasmas 27, 022310 (2020), doi:10.1063/1.5134126
- ITER Physics Basis: Nucl. Fusion 39 (1999) 2137 y Nucl. Fusion 47 (2007) S1
- MAST Upgrade: Nucl. Fusion 64 (2024), doi:10.1088/1741-4326/ad6011 y doi:10.1088/1741-4326/ad56a2
- SPARC: Creely et al., J. Plasma Phys. 86 (2020) 865860502; Phys. Plasmas 30 (2023) 090601
- STEP: Meyer y STEP Team, Phil. Trans. R. Soc. A 382 (2024) 20230406; OpenSTEP, doi:10.14468/07jt-s540
