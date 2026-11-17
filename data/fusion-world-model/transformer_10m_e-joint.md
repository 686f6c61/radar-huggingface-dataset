# fusion-world-model/transformer_10m_e-joint

## Resumen

`transformer_10m_e-joint` es un checkpoint de un modelo del mundo (world model) para plasmas de tokamak, desarrollado por el usuario `fusion-world-model`. Se trata de un transformer con un presupuesto de parametros de 10 millones, entrenado con la receta denominada "(e) joint training". Su proposito es modelar la dinamica temporal de plasmas de fusion, un problema relevante para el diseno y control de reactores de fusion como ITER, SPARC o STEP.

El modelo se publica con un checkpoint seleccionado (`final.pt`) y dos replicas con semillas de entrenamiento distintas (`seed_1.pt`, `seed_2.pt`), junto con los ficheros de configuracion y seleccion. El checkpoint de referencia del articulo asociado esta etiquetado con la revision `paper`. El repositorio es de reducido tamano (0,1 GB) y los pesos se distribuyen en formato PyTorch (`.pt`).

La relevancia del modelo radica en su aplicacion a un dominio cientifico especifico (fusion por confinamiento magnetico) y en el uso de datos experimentales publicos de multiples tokamaks. No obstante, la informacion disponible es limitada: no se documentan resultados de benchmarks, idiomas soportados ni detalles completos de arquitectura y entrenamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (presupuesto de parametros 10M) |
| Parametros totales | 10M (presupuesto declarado) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | CC BY-SA 4.0 |
| Formato de pesos | PyTorch (`.pt`) |

## Arquitectura y entrenamiento

La arquitectura es un transformer con un presupuesto de parametros de 10 millones, orientado a series temporales de plasmas de tokamak. El entrenamiento sigue la receta "(e) joint training", cuyo detalle no se especifica en la informacion disponible. El checkpoint `final.pt` corresponde a la configuracion de indice 6 de las 25 configuraciones evaluadas en la busqueda de hiperparametros, seleccionada por la regla de seleccion del autor (los scores se recogen en `selection.json`). Las semillas `seed_1.pt` y `seed_2.pt` replican esa misma configuracion con semillas distintas.

Los datos de entrenamiento se apoyan en multiples fuentes publicas del dominio de fusion: FAIR-MAST (UKAEA), HDB5 (International Global H-Mode Confinement Database), PR08 (ITPA multi-tokamak profile database), Open Density Limit Database (Alcator C-Mod), la base de datos de transicion L-H de TCV, OpenSTEP (escenario SPP-001 de STEP), SPARCPublic (Commonwealth Fusion Systems), las tablas de flujos QLKNN10D y QLKNN11D (QuaLiKiz) y descripciones de maquinas de ITER, MAST Upgrade, SPARC y STEP. No se especifica el numero de tokens de entrenamiento, la composicion exacta del dataset ni si se aplicaron tecnicas de RLHF o DPO. Tampoco se documentan innovaciones tecnicas como decodificacion especulativa o atencion lineal.

## Capacidades

- Modelado de series temporales de plasmas de tokamak (world model del plasma).
- Prediccion de la dinamica del plasma bajo la receta de entrenamiento conjunto (joint training).
- Generacion de trayectorias o estados del plasma a partir de las condiciones de la maquina y del escenario.
- Capacidad de razonamiento sobre datos experimentales de multiples tokamaks (FAIR-MAST, TCV, Alcator C-Mod, SPARC, STEP, ITER, MAST Upgrade).
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible.
- Capacidades especiales (vision, audio, thinking mode): no disponible.

## Casos de uso

- Prediccion de la evolucion temporal del plasma en tokamaks: el modelo puede modelar la dinamica de un plasma a partir de las condiciones iniciales y de la configuracion de la maquina, util para anticipar transiciones y regimenes de operacion.
- Diseno de escenarios de operacion: permite evaluar escenarios candidatos (por ejemplo, el escenario SPP-001 de STEP) antes de su ejecucion en la maquina, reduciendo el coste de campanas experimentales.
- Estudio de la transicion L-H: entrenado con la base de datos de TCV, el modelo puede emplearse para analizar las condiciones que favorecen la transicion a modo H, relevante para el confinamiento.
- Analisis del limite de densidad: a partir de la Open Density Limit Database de Alcator C-Mod, el modelo puede explorar el comportamiento del plasma cerca del limite de densidad.
- Investigacion en control de plasma: el world model puede integrarse en bucles de simulacion para probar estrategias de control antes de su despliegue en sistemas de control en tiempo real.
- Comparacion entre maquinas: al entrenarse con datos de ITER, MAST Upgrade, SPARC y STEP, el modelo puede emplearse para estudiar la transferibilidad de comportamientos entre tokamaks de distinto tamano y configuracion.
- Reproducibilidad de experimentos: los checkpoints con semillas alternativas permiten analizar la variabilidad del modelo y validar resultados frente al checkpoint del articulo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; con 10M de parametros, la inferencia en precision completa requiere del orden de decenas de MB de memoria, aunque el dato exacto no se documenta.
- GPU recomendadas: no disponible.
- Cabe en GPU consumer: previsiblemente si, dado el reducido tamano del modelo (10M de parametros), aunque no se confirma en la informacion disponible.
- Opciones de despliegue: no disponible (los pesos son ficheros PyTorch `.pt`; no se documenta compatibilidad con vLLM, llama.cpp, Ollama ni TGI).
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye modelos comparables de la misma categoria (world models de plasmas de tokamak) ni datos de rendimiento que permitan una comparacion.

## Limitaciones y advertencias

- Dominio muy restringido: el modelo esta especializado en plasmas de tokamak y no es un modelo de proposito general.
- Sesgos conocidos: no documentados; al entrenarse con bases de datos experimentales concretas, puede heredar los sesgos y coberturas de esas fuentes.
- Riesgo de alucinacion: no evaluado en la informacion disponible; en un modelo de series temporales el riesgo se traduce en predicciones fisicamente inconsistentes.
- Limitaciones de contexto o idioma: no se documenta longitud de contexto ni idiomas soportados.
- Restricciones de licencia: CC BY-SA 4.0, que exige atribucion y compartir bajo la misma licencia las obras derivadas; ademas, los datos de origen imponen requisitos de citacion especificos (FAIR-MAST, HDB5, PR08, SPARCPublic, entre otros) que deben respetarse.
- Caveat para produccion: no se documentan benchmarks, latencia ni procesos de validacion; el uso en produccion requeriria evaluacion adicional.
- El repositorio tiene 0 descargas y 0 likes, lo que sugiere una validacion externa limitada.

## Enlaces

- Hugging Face: https://huggingface.co/fusion-world-model/transformer_10m_e-joint
- Licencia CC BY-SA 4.0: https://creativecommons.org/licenses/by-sa/4.0/
- FAIR-MAST (UKAEA), Jackson et al. 2025, IEEE Trans. Plasma Sci. 53, 2440: https://doi.org/10.1109/TPS.2025.3583419
- FAIR-MAST, Jackson et al. 2024, SoftwareX 27, 101869: https://doi.org/10.1016/j.softx.2024.101869
- HDB5, Verdoolaege et al. 2021, Nucl. Fusion 61, 076006: https://doi.org/10.1088/1741-4326/abdb91
- PR08, Roach et al. 2008, Nucl. Fusion 48, 125001: https://doi.org/10.1088/0029-5515/48/12/125001
- Open Density Limit Database (Alcator C-Mod): https://github.com/MIT-PSFC/open_density_limit_database
- TCV L-H transition database, Labit y Pau (2025), Zenodo: https://doi.org/10.5281/zenodo.14996664
- TCV, Labit et al., Plasma Phys. Control. Fusion (2025): https://doi.org/10.1088/1361-6587/adc8ce
- OpenSTEP, escenario SPP-001: https://doi.org/10.14468/07jt-s540
- SPARC, Creely et al., J. Plasma Phys. 86, 865860502 (2020)
- QLKNN10D, Zenodo: https://doi.org/10.5281/zenodo.3497066
- QLKNN11D, Zenodo: https://doi.org/10.5281/zenodo.8017522
- QLKNN, van de Plassche et al., Phys. Plasmas 27, 022310 (2020): https://doi.org/10.1063/1.5134126
