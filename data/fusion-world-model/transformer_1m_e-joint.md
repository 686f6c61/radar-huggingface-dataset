# fusion-world-model/transformer_1m_e-joint

## Resumen

`transformer_1m_e-joint` es un checkpoint de un modelo del mundo (world model) para plasmas de tokamak, desarrollado por el proyecto `fusion-world-model` y publicado en Hugging Face. Se trata de un transformer con un presupuesto de parametros de 1 millon, entrenado con la receta denominada "(e) joint training" sobre datos de diagnostico y confinamiento de multiples tokamaks. El modelo no es un modelo de lenguaje: es un modelo de series temporales orientado a predecir la evolucion de plasmas en dispositivos de fusion por confinamiento magnetico.

El repositorio contiene el checkpoint elegido (`final.pt`), que corresponde a la configuracion de indice 14 de las 25 exploradas en la busqueda de hiperparametros, seleccionada por la regla de seleccion interna del proyecto. Ademas incluye dos replicas con semillas de entrenamiento distintas (`seed_1.pt`, `seed_2.pt`) y metadatos de configuracion y seleccion. La revision etiquetada `paper` contiene el checkpoint exacto usado en la publicacion asociada.

Su relevancia radica en el dominio: los world models de plasmas permiten simular y anticipar el comportamiento del plasma en reactores como ITER, MAST-U, SPARC o STEP, lo que resulta util para control en tiempo real, planificacion de escenarios y estudios de extrapolacion. El tamano de 1M de parametros lo hace extremadamente ligero, pensado como pieza de un estudio comparativo de recetas de entrenamiento mas que como modelo de produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (modelo de series temporales para plasmas de tokamak) |
| Parametros totales | 1M (presupuesto de parametros declarado) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | CC BY-SA 4.0 |
| Formato de pesos | PyTorch (`.pt`) |

## Arquitectura y entrenamiento

La arquitectura es un transformer con un presupuesto de 1 millon de parametros, disenado para modelar la dinamica temporal de plasmas de tokamak. La receta de entrenamiento es la "(e) joint training", que combina de forma conjunta las distintas fuentes de datos del proyecto. El checkpoint publicado es la configuracion de indice 14 de las 25 exploradas en la busqueda de hiperparametros, seleccionada por la regla de seleccion del propio proyecto (cuyas puntuaciones se registran en `selection.json`). Se incluyen dos replicas con semillas alternativas para evaluar la varianza del entrenamiento.

Los datos de entrenamiento provienen de un conjunto de bases de datos publicas de fusion: FAIR-MAST (UKAEA), HDB5 (International Global H-Mode Confinement Database), PR08 (ITPA multi-tokamak profile database), la Open Density Limit Database de Alcator C-Mod, la base de datos de transicion L-H de TCV, OpenSTEP (escenario SPP-001 de STEP), SPARCPublic de Commonwealth Fusion Systems, las tablas de flujos QuaLiKiz QLKNN10D y QLKNN11D, y descripciones de maquina de ITER, MAST Upgrade, SPARC y STEP. No se especifica en la informacion disponible el numero total de tokens ni la composicion exacta del dataset, ni si se aplicaron tecnicas de RLHF o DPO (no aplicables en este dominio). Tampoco se detallan innovaciones tecnicas adicionales mas alla del propio enfoque de world model.

## Capacidades

- Modelado y prediccion de la evolucion temporal de plasmas de tokamak a partir de datos de diagnostico y parametros de descarga.
- Entrenamiento conjunto (joint training) sobre multiples bases de datos de dispositivos (MAST, Alcator C-Mod, TCV, SPARC, STEP, ITER) y de confinamiento (HDB5, PR08).
- Aprendizaje de la dinamica de transiciones L-H y de limites de densidad.
- Aprovechamiento de tablas de flujos de transporte (QLKNN10D/11D) como fuente de fisica del transporte turbulento.
- Reproducibilidad mediante multiples semillas de entrenamiento (`seed_1.pt`, `seed_2.pt`) para analisis de varianza.
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso en el sentido de los LLM.
- No dispone de capacidades multilingues, de vision ni de audio.

## Casos de uso

- Estudio de recetas de entrenamiento: el checkpoint sirve como referencia para comparar la receta "(e) joint training" frente a otras recetas del proyecto, dado que el repositorio documenta la seleccion entre 25 configuraciones.
- Prediccion de escenarios de plasma: usar el modelo para anticipar la evolucion temporal de un plasma a partir de condiciones iniciales y parametros de descarga, util en planificacion de experimentos en tokamaks.
- Analisis de transiciones L-H: modelar la transicion entre regimenes de confinamiento L y H empleando los datos de TCV integrados en el entrenamiento.
- Estudio de limites de densidad: emplear el modelo entrenado con la Open Density Limit Database para analizar el comportamiento cerca del limite de densidad en Alcator C-Mod.
- Extrapolacion a reactores: aprovechar las descripciones de maquina de ITER, SPARC y STEP para estudios de extrapolacion de escenarios a dispositivos futuros.
- Reproducibilidad de resultados: usar la revision `paper` (commit `5fffde1ea0e16ea2fb4ffdf86e952b902bccf14a`) para reproducir exactamente los resultados de la publicacion asociada.
- Analisis de incertidumbre: comparar las predicciones de `final.pt` con las de `seed_1.pt` y `seed_2.pt` para estimar la variabilidad del modelo ante cambios de semilla.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio incluye `selection.json` con las puntuaciones de seleccion internas del proyecto, pero no se proporcionan valores numericos ni comparaciones con otros modelos en la informacion facilitada.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB, dado el presupuesto de 1M de parametros (los pesos en `float32` ocuparian aproximadamente 4 MB; en `float16`, unos 2 MB).
- GPU recomendadas: cualquier GPU moderna es suficiente; el modelo cabe holgadamente en GPUs de consumo como RTX 3060, RTX 4060 o superiores. Tambien puede ejecutarse en CPU sin problema.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU con al menos 1 GB de VRAM, e incluso en CPU.
- Opciones de despliegue: al ser un checkpoint PyTorch (`.pt`) guardado por el codigo de entrenamiento, requiere cargarlo con PyTorch y el codigo del proyecto. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI (no aplicables a este tipo de modelo).
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye modelos comparables de la misma categoria (world models de plasmas de tokamak con presupuesto de 1M de parametros) ni datos de rendimiento que permitan una comparacion fundamentada.

## Limitaciones y advertencias

- Modelo de dominio muy especifico (plasmas de tokamak): no es un modelo de lenguaje ni un modelo de proposito general; no debe emplearse fuera de su ambito.
- Presupuesto de solo 1M de parametros: capacidad limitada para capturar dinamicas complejas; los resultados deben interpretarse en el contexto del estudio comparativo del proyecto.
- No se documentan sesgos conocidos, pero al entrenarse con bases de datos de dispositivos concretos (MAST, Alcator C-Mod, TCV, SPARC, STEP, ITER) puede presentar sesgo hacia las condiciones representadas en esas bases y pobre generalizacion a regimenes no cubiertos.
- Riesgo de extrapolacion incorrecta fuera del rango de los datos de entrenamiento; no se documenta evaluacion de robustez fuera de distribucion.
- Licencia CC BY-SA 4.0: permite uso comercial con atribucion y compartir bajo la misma licencia; es obligatorio citar las fuentes de datos listadas en la model card (FAIR-MAST, HDB5, PR08, Open Density Limit Database, TCV L-H, OpenSTEP, SPARCPublic, QLKNN, descripciones de maquina) y respetar sus condiciones especificas, algunas de las cuales exigen reconocimientos concretos (por ejemplo, SPARCPublic).
- El repositorio tiene 0.0 GB de tamano reportado y 0 descargas, lo que sugiere que los archivos pueden no estar disponibles o el repositorio esta vacio en el momento de la consulta; conviene verificar `manifest.json` antes de su uso.
- No se proporcionan garantias de soporte ni mantenimiento del codigo de entrenamiento necesario para cargar los checkpoints.

## Enlaces

- Hugging Face: https://huggingface.co/fusion-world-model/transformer_1m_e-joint
- Revision `paper` (commit): https://huggingface.co/fusion-world-model/transformer_1m_e-joint/tree/5fffde1ea0e16ea2fb4ffdf86e952b902bccf14a
- Licencia CC BY-SA 4.0: https://creativecommons.org/licenses/by-sa/4.0/
- FAIR-MAST (UKAEA), Jackson et al. 2025, IEEE Trans. Plasma Sci. 53, 2440: https://doi.org/10.1109/TPS.2025.3583419
- FAIR-MAST, Jackson et al. 2024, SoftwareX 27, 101869: https://doi.org/10.1016/j.softx.2024.101869
- HDB5, Verdoolaege et al. 2021, Nucl. Fusion 61, 076006: https://doi.org/10.1088/1741-4326/abdb91
- PR08, Roach et al. 2008, Nucl. Fusion 48, 125001: https://doi.org/10.1088/0029-5515/48/12/125001
- Open Density Limit Database (MIT PSFC): https://github.com/MIT-PSFC/open_density_limit_database
- TCV L-H transition database, Labit y Pau (2025), Zenodo: https://doi.org/10.5281/zenodo.14996664
- TCV L-H transition, Labit et al., Plasma Phys. Control. Fusion (2025): https://doi.org/10.1088/1361-6587/adc8ce
- OpenSTEP, escenario SPP-001: https://doi.org/10.14468/07jt-s540
- SPARC baseline, Creely et al., J. Plasma Phys. 86, 865860502 (2020): https://doi.org/10.1017/S0022377820001257
- QLKNN10D v1.0, Zenodo: https://doi.org/10.5281/zenodo.3497066
- QLKNN11D v1.0.0, Zenodo: https://doi.org/10.5281/zenodo.8017522
- QLKNN, van de Plassche et al., Phys. Plasmas 27, 022310 (2020): https://doi.org/10.1063/1.5134126
