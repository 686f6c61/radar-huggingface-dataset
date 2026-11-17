# fusion-world-model/transformer_10m_h-task-outputs

## Resumen

`transformer_10m_h-task-outputs` es un checkpoint de un modelo del mundo (world model) para plasmas de tokamak, desarrollado por el proyecto `fusion-world-model`. Se trata de un transformer con un presupuesto de parametros de 10 millones, entrenado con la receta denominada "(h) reward-only" para predecir la evolucion temporal de plasmas en dispositivos de fusion por confinamiento magnetico. El modelo se publica como artefacto de investigacion junto a un articulo cientifico, y su checkpoint de referencia es la revision etiquetada como `paper`.

El modelo no es un modelo de lenguaje: es un modelo de series temporales especializado en un dominio cientifico concreto (fusion nuclear). Su relevancia radica en que aplica arquitecturas transformer a la modelizacion predictiva de plasmas de tokamak, un problema de control y prediccion con implicaciones directas para el diseno y operacion de reactores de fusion. El repositorio incluye el checkpoint elegido (`final.pt`), dos replicas con semillas de entrenamiento distintas, la configuracion de entrenamiento, el registro del proceso de seleccion y un manifiesto con hashes SHA-256.

El checkpoint publicado corresponde a la configuracion de indice 25 de las 30 configuraciones evaluadas en la busqueda de hiperparametros del autor, seleccionada segun la regla de seleccion descrita en `selection.json`. El tamano del repositorio es de aproximadamente 0,1 GB, coherente con un modelo de 10 millones de parametros en formato PyTorch.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer |
| Parametros totales | 10M (presupuesto declarado) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo de series temporales, no linguistico) |
| Licencia | CC BY-SA 4.0 |
| Formato de pesos | PyTorch (`.pt`) |
| Dominio | Plasmas de tokamak (fusion) |
| Tipo de tarea | Series temporales / world model |
| Receta de entrenamiento | (h) reward-only |
| Tamano del repositorio | ~0,1 GB |
| Libreria | PyTorch |

## Arquitectura y entrenamiento

La arquitectura es un transformer con un presupuesto de 10 millones de parametros, segun declara el autor en la model card. No se especifican en la informacion disponible el numero de capas, dimensiones del modelo, numero de cabezas de atencion ni la longitud de contexto utilizada para las series temporales de plasma. El modelo se enmarca en la categoria de "world model": aprende la dinamica de un sistema fisico (el plasma de un tokamak) para predecir su evolucion.

El entrenamiento emplea la receta "(h) reward-only", cuyo detalle no se describe en la model card. Los datos de entrenamiento proceden de varias bases de datos de fusion: FAIR-MAST (UKAEA), la base de datos internacional H-Mode Confinement (HDB5, DB5.2.3), la base de perfiles multi-tokamak del ITPA (PR08), la Open Density Limit Database de Alcator C-Mod y la base de datos de transiciones L-H de TCV. No se indica el numero total de tokens ni la composicion exacta del dataset, ni si se emplearon tecnicas de RLHF o DPO (poco probables en este dominio). El proceso de seleccion del checkpoint se baso en una busqueda sobre 30 configuraciones, de las que se eligio la de indice 25 segun la regla de seleccion registrada en `selection.json`.

## Capacidades

- Prediccion de la evolucion temporal de plasmas de tokamak (world model de dinamica de plasma).
- Modelizacion de series temporales en el dominio de la fusion por confinamiento magnetico.
- Generacion de trayectorias predichas condicionadas a la configuracion del plasma (segun la receta reward-only).
- Replicabilidad: se publican dos semillas adicionales (`seed_1.pt`, `seed_2.pt`) de la misma configuracion para evaluar la varianza del entrenamiento.
- Trazabilidad: manifiesto con hashes SHA-256 de todos los ficheros y registro de seleccion.
- No se documentan capacidades de generacion de texto, codigo, matematicas, vision, tool calling, agentes ni multilingues, dado que no es un modelo linguistico.

## Casos de uso

- Prediccion de la evolucion de un plasma en experimentos de tokamak: el modelo puede usarse para anticipar la trayectoria temporal de variables del plasma a partir de un estado inicial, lo que resulta util para planificar descargas experimentales y evaluar su estabilidad antes de ejecutarlas.
- Control predictivo en tiempo real: integrado en un lazo de control, un world model de este tipo permite estimar el estado futuro del plasma y ajustar actuadores (campos magneticos, calentamiento) con antelacion, reduciendo el riesgo de disrupciones.
- Estudio de transiciones de confinamiento (L-H): entrenado con la base de datos de transiciones L-H de TCV, el modelo puede emplearse para analizar las condiciones bajo las cuales se produce la transicion a modo H, un regimen de alto confinamiento relevante para reactores.
- Analisis de limites de densidad: a partir de la Open Density Limit Database de Alcator C-Mod, el modelo puede apoyar el estudio de las condiciones que conducen a la perdida de confinamiento por limite de densidad.
- Comparacion entre dispositivos y escalado: al combinar datos de multiples tokamaks (MAST, bases multi-maquina HDB5 e ITPA PR08), el modelo puede utilizarse para explorar el escalado de comportamientos entre maquinas de distinto tamano.
- Investigacion reproducible en aprendizaje de dinamica de sistemas fisicos: el repositorio publica semillas multiples y manifiesto de integridad, lo que facilita replicar experimentos y comparar variantes de la receta de entrenamiento.
- Baseline para modelos del mundo en fisica de plasmas: por su tamano reducido (10M parametros), sirve como referencia ligera para comparar arquitecturas y recetas en la modelizacion de series temporales de fusion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas cuantitativas (error de prediccion, R², etc.) ni comparaciones con otros modelos.

## Requisitos de hardware

- VRAM estimada para inferencia: un modelo de 10M parametros en precision completa (FP32) ocupa aproximadamente 40 MB de pesos; en FP16, unos 20 MB. La VRAM total depende del tamano de lote y de la longitud de la secuencia de entrada, no especificada.
- GPU recomendadas: cualquier GPU moderna con al menos 2-4 GB de VRAM es suficiente; el modelo cabe holgadamente en GPUs de consumo.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU consumer (GTX 1060 o superior, RTX 3050 o superior), e incluso en CPU para inferencia por lotes pequenos.
- Opciones de despliegue: al ser un checkpoint PyTorch (`.pt`) guardado por el codigo de entrenamiento, requiere cargar el modelo con el codigo del autor o reconstruir la arquitectura a partir de `config.json`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que estan orientados a modelos linguisticos.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye otros modelos del mundo para plasmas de tokamak ni resultados comparables. Como referencia de categoria, existen modelos de series temporales transformer de tamano similar (por ejemplo, variantes de PatchTST o Informer en el rango de millones de parametros), pero no se dispone de datos de rendimiento de este checkpoint para establecer una comparacion rigurosa.

## Limitaciones y advertencias

- Dominio muy restringido: el modelo solo es valido para series temporales de plasmas de tokamak; no es un modelo de proposito general ni linguistico.
- Datos de entrenamiento limitados a las bases de datos citadas; su generalizacion a tokamaks no representados en esas fuentes es incierta.
- No se documentan metricas de error ni validacion externa en la model card, por lo que no es posible evaluar su precision predictiva sin ejecutar el codigo del autor.
- Riesgo de extrapolacion incorrecta fuera del regimen de operacion cubierto por los datos (por ejemplo, regimes de plasma no presentes en FAIR-MAST, HDB5, PR08, Alcator C-Mod o TCV).
- La licencia CC BY-SA 4.0 exige atribucion y compartir bajo la misma licencia las obras derivadas; es compatible con uso comercial siempre que se respeten esas condiciones, pero conviene revisar las obligaciones de atribucion de cada fuente de datos (FAIR-MAST, HDB5, PR08, etc.).
- PR08 no tiene licencia formal: se distribuye "tal cual" con la unica condicion de citar el articulo correspondiente, lo que anade una obligacion de atribucion adicional.
- El checkpoint es un artefacto de investigacion: no se documenta soporte, mantenimiento ni garantias de produccion.
- No se especifican sesgos conocidos; en un modelo fisico, el "sesgo" relevante seria la cobertura desigual de regimens de plasma en los datos de entrenamiento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/fusion-world-model/transformer_10m_h-task-outputs
- Licencia CC BY-SA 4.0: https://creativecommons.org/licenses/by-sa/4.0/
- FAIR-MAST (UKAEA): Jackson et al. 2025, IEEE Trans. Plasma Sci. 53, 2440, doi:10.1109/TPS.2025.3583419; Jackson et al. 2024, SoftwareX 27, 101869, doi:10.1016/j.softx.2024.101869
- HDB5, International Global H-Mode Confinement Database (DB5.2.3): Verdoolaege et al. 2021, Nucl. Fusion 61, 076006, doi:10.1088/1741-4326/abdb91
- PR08, ITPA multi-tokamak profile database: Roach et al. 2008, Nucl. Fusion 48, 125001, doi:10.1088/0029-5515/48/12/125001
- Open Density Limit Database (Alcator C-Mod): https://github.com/MIT-PSFC/open_density_limit_database
- TCV L-H transition database: Labit and Pau (2025), Zenodo doi:10.5281/zenodo.14996664; Labit et al., Plasma Phys. Control. Fusion (2025), doi:10.1088/1361-6587/adc8ce
