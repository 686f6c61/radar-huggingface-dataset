# fusion-world-model/lstm_100m_e-joint

## Resumen

`lstm_100m_e-joint` es un checkpoint de un modelo del mundo (world model) de plasmas de tokamak, desarrollado por el usuario `fusion-world-model` y publicado en Hugging Face. No es un modelo de lenguaje: es un modelo de series temporales entrenado para predecir la evolucion de plasmas en reactores de fusion por confinamiento magnetico. El modelo se basa en una arquitectura LSTM con un presupuesto de parametros de 100 millones y una receta de entrenamiento denominada "(e) joint training".

El checkpoint publicado como `final.pt` corresponde a la configuracion de indice 6 de las 25 configuraciones exploradas durante una busqueda de hiperparametros, seleccionada por la regla de seleccion del propio estudio (los resultados de esa seleccion se recogen en `selection.json`). Ademas, se incluyen dos replicas de entrenamiento con semillas distintas (`seed_1.pt`, `seed_2.pt`) para evaluar la variabilidad del entrenamiento. El checkpoint exacto utilizado en el articulo asociado esta etiquetado con el tag `paper` (commit `3ddb16c3344e45a267c07574785395b565d258d0`).

La relevancia de este modelo radica en su dominio de aplicacion: la modelizacion de plasmas de tokamak es un problema central para el diseno y control de reactores de fusion como ITER, SPARC, MAST Upgrade o STEP. El modelo se entrena con datos de multiples bases de datos experimentales y de simulacion (FAIR-MAST, HDB5, PR08, entre otras) bajo una licencia CC BY-SA 4.0, lo que facilita su reutilizacion en investigacion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LSTM (Long Short-Term Memory) |
| Parametros totales | 100M (presupuesto de parametros declarado) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo de series temporales, no linguistico) |
| Licencia | CC BY-SA 4.0 |
| Formato de pesos | PyTorch (`final.pt`, `seed_1.pt`, `seed_2.pt`) |

## Arquitectura y entrenamiento

La arquitectura es una red LSTM con un presupuesto de 100 millones de parametros, disenada para modelar la dinamica temporal de plasmas de tokamak. El checkpoint corresponde a la receta de entrenamiento "(e) joint training", si bien la model card no detalla en que consiste exactamente dicha receta ni la composicion exacta del dataset, el numero de tokens o pasos de entrenamiento, ni si se emplearon tecnicas de RLHF/DPO (poco probables en un modelo de series temporales de este tipo).

Los datos de entrenamiento se apoyan en un conjunto de fuentes experimentales y de simulacion del dominio de la fusion, entre ellas FAIR-MAST (UKAEA), HDB5 (base de datos internacional de confinamiento H-mode), PR08 (base de datos de perfiles multi-tokamak del ITPA), la Open Density Limit Database (Alcator C-Mod), la base de datos de transiciones L-H de TCV, OpenSTEP (escenario SPP-001 de STEP), SPARCPublic (Commonwealth Fusion Systems), las tablas de flujos QLKNN10D y QLKNN11D de QuaLiKiz, y descripciones de maquinas de ITER, MAST Upgrade, SPARC y STEP. La model card no especifica el volumen de datos, la division train/validation/test ni los detalles del proceso de seleccion de hiperparametros mas alla de que se exploraron 25 configuraciones.

## Capacidades

- Prediccion de series temporales de plasmas de tokamak: modela la evolucion temporal de variables del plasma a partir de datos experimentales y de simulacion.
- Modelo del mundo: aprende la dinamica subyacente del sistema para predecir estados futuros, lo que permite su uso en planificacion y control.
- Entrenamiento conjunto (joint training): la receta (e) combina multiples fuentes de datos del dominio de la fusion.
- Replicabilidad: se publican dos semillas adicionales (`seed_1.pt`, `seed_2.pt`) para evaluar la robustez del entrenamiento.
- Trazabilidad: incluye `manifest.json` con ruta, tamano y SHA-256 de cada fichero, y `selection.json` con las puntuaciones de seleccion.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni capacidades multilingues: no es un modelo de lenguaje.

## Casos de uso

- Prediccion de la evolucion de descargas en tokamaks: el modelo puede anticipar la trayectoria temporal de variables del plasma (perfil de densidad, temperatura, etc.) a partir de un estado inicial, util para planificar escenarios de descarga en reactores como ITER o SPARC.
- Control predictivo de plasma: integrado en un lazo de control, el modelo del mundo permite evaluar acciones de control antes de aplicarlas, reduciendo el riesgo de disrupciones.
- Validacion de escenarios de operacion: dado un escenario disenado (por ejemplo, SPP-001 de STEP), el modelo puede simular su evolucion y compararla con criterios de diseno.
- Estudio de transiciones L-H: el modelo puede emplearse para analizar la dinamica de transiciones de confinamiento utilizando los datos de TCV y HDB5.
- Generacion de datos sinteticos para aumento de dataset: las predicciones del modelo pueden complementar bases de datos experimentales escasas en regimenes poco explorados.
- Investigacion en modelizacion de series temporales: como checkpoint de referencia para comparar arquitecturas LSTM frente a alternativas (transformers, SSM) en dominios fisicos con datos limitados.
- Reproducibilidad de resultados cientificos: el tag `paper` y los ficheros de manifiesto permiten reproducir exactamente los resultados del articulo asociado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con 100M de parametros en precision FP32, el modelo ocupa aproximadamente 400 MB de pesos; en FP16, unos 200 MB. La VRAM total dependera del tamano de lote y de la longitud de la secuencia de entrada, no especificados.
- GPU recomendadas: cualquier GPU con al menos 2-4 GB de VRAM deberia ser suficiente para inferencia en FP32 con lotes pequenos; una RTX 3060 o superior es mas que adecuada.
- Cabe en GPU de consumo: si, practicamente cualquier GPU consumer moderna (RTX 20xx en adelante) puede ejecutar el modelo.
- Opciones de despliegue: al ser un checkpoint PyTorch (`final.pt`), se carga directamente con `torch.load`; no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI (no aplicables a un modelo de series temporales).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de informacion sobre modelos comparables en la documentacion proporcionada. Se trata de un checkpoint especifico de un estudio de modelizacion de plasmas de tokamak, y la model card no incluye comparaciones con otras arquitecturas (transformers, SSM, etc.) ni con otros modelos del mundo del mismo dominio.

## Limitaciones y advertencias

- Dominio muy restringido: el modelo esta entrenado exclusivamente para plasmas de tokamak; no es util fuera de ese ambito.
- No es un modelo de lenguaje: no soporta generacion de texto, codigo, vision ni ninguna capacidad conversacional.
- Informacion incompleta: la model card no detalla el numero de tokens de entrenamiento, la composicion exacta del dataset, la longitud de contexto, los tipos de cuantizacion ni los resultados de benchmarks, lo que dificulta evaluar su rendimiento de forma independiente.
- Riesgo de extrapolacion: al entrenarse con datos de maquinas concretas (FAIR-MAST, Alcator C-Mod, TCV, SPARC, STEP, ITER, MAST Upgrade), su capacidad de generalizacion a otras maquinas o regimenes no esta documentada.
- Licencia CC BY-SA 4.0: permite uso comercial, pero obliga a atribuir y a compartir las obras derivadas bajo la misma licencia. Ademas, los datos de origen imponen sus propias obligaciones de citacion (FAIR-MAST, HDB5, PR08, SPARCPublic, QLKNN, etc.), que deben respetarse.
- Sin senales de uso en produccion: el repositorio tiene 0 descargas y 0 likes, y no se documentan validaciones externas.
- Fecha de creacion futura (2026-11-14): conviene verificar la integridad y procedencia del repositorio antes de confiar en el.

## Enlaces

- Hugging Face: https://huggingface.co/fusion-world-model/lstm_100m_e-joint
- Checkpoint del articulo (tag `paper`): commit `3ddb16c3344e45a267c07574785395b565d258d0`
- Licencia CC BY-SA 4.0: https://creativecommons.org/licenses/by-sa/4.0/
- FAIR-MAST (UKAEA): Jackson et al. 2025, IEEE Trans. Plasma Sci. 53, 2440, doi:10.1109/TPS.2025.3583419; Jackson et al. 2024, SoftwareX 27, 101869, doi:10.1016/j.softx.2024.101869
- HDB5 (DB5.2.3): Verdoolaege et al. 2021, Nucl. Fusion 61, 076006, doi:10.1088/1741-4326/abdb91
- PR08 (ITPA): Roach et al. 2008, Nucl. Fusion 48, 125001, doi:10.1088/0029-5515/48/12/125001
- Open Density Limit Database (MIT PSFC): https://github.com/MIT-PSFC/open_density_limit_database
- TCV L-H transition database: Zenodo doi:10.5281/zenodo.14996664; Labit et al., Plasma Phys. Control. Fusion (2025), doi:10.1088/1361-6587/adc8ce
- OpenSTEP (SPP-001): doi:10.14468/07jt-s540; Hudoba et al., Nucl. Fusion 64, 086055 (2024); Tholerus et al., Nucl. Fusion 64, 106030 (2024)
- SPARCPublic (Commonwealth Fusion Systems): Creely et al., J. Plasma Phys. 86, 865860502 (2020)
- QLKNN10D: Zenodo doi:10.5281/zenodo.3497066; QLKNN11D: doi:10.5281/zenodo.8017522; van de Plassche et al., Phys. Plasmas 27, 022310 (2020), doi:10.1063/1.5134126
