# fusion-world-model/transformer_1m_d-sim-to-shots

## Resumen

`transformer_1m_d-sim-to-shots` es un checkpoint de un modelo del mundo (world model) para plasmas de tokamak, publicado por el usuario `fusion-world-model` en Hugging Face. Se trata de un transformer con un presupuesto de 1 millon de parametros, entrenado con la receta denominada "(d) simulator pre-training, then shots": primero se preentrena sobre datos de simulador y despues se ajusta con descargas reales de tokamaks. El modelo resuelve el problema de predecir la evolucion temporal de variables de plasma en dispositivos de fusion, un dominio donde los datos experimentales son escasos y caros de obtener.

El repositorio no contiene la model card de un modelo generativo de proposito general, sino los artefactos de un experimento de investigacion: el checkpoint elegido (`final.pt`), dos replicas con semillas distintas (`seed_1.pt`, `seed_2.pt`), la configuracion de entrenamiento, el registro del proceso de seleccion y un manifiesto con hashes. La relevancia actual radica en el uso de modelos del mundo para control y prediccion en fusion nuclear, un area donde el aprendizaje sobre datos multimquina (FAIR-MAST, HDB5, PR08, SPARC, STEP, entre otros) empieza a explorarse con arquitecturas transformer.

Conviene subrayar que la informacion disponible es limitada: no se publican resultados de benchmarks, no se detalla la longitud de contexto ni el vocabulario, y el tamano del repositorio figura como 0.0 GB, lo que sugiere que los pesos podrian no estar efectivamente alojados o que el dato de tamano no es fiable. Todos los datos que siguen provienen exclusivamente de la model card y de los metadatos de Hugging Face.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (modelo del mundo para series temporales de plasma de tokamak) |
| Parametros totales | 1M (presupuesto declarado) |
| Parametros activos | no disponible (no es MoE segun la informacion disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (checkpoints en PyTorch de precision nativa) |
| Idiomas soportados | no disponible (modelo de series temporales, no de lenguaje natural) |
| Licencia | CC BY-SA 4.0 |
| Formato de pesos | PyTorch (`.pt`) |

## Arquitectura y entrenamiento

La arquitectura es un transformer con un presupuesto de 1 millon de parametros, disenado como modelo del mundo para plasmas de tokamak. La receta de entrenamiento es la "(d)": preentrenamiento sobre un simulador y posterior ajuste con descargas ("shots") de tokamaks reales. El checkpoint publicado corresponde a la configuracion de indice 27 de las 35 que entreno la busqueda de hiperparametros, seleccionada como primera por la regla de seleccion del autor; `selection.json` contiene las puntuaciones de esa seleccion y `config.json` la configuracion de entrenamiento de `final.pt`.

Los datos de entrenamiento pueden apoyarse, segun la model card, en un conjunto amplio de fuentes del dominio de la fusion: FAIR-MAST (UKAEA), HDB5 (International Global H-Mode Confinement Database), PR08 (ITPA multi-tokamak profile database), la Open Density Limit Database de Alcator C-Mod, la base de transiciones L-H de TCV, OpenSTEP (escenario SPP-001 de STEP), SPARCPublic (Commonwealth Fusion Systems), las tablas de flujos QuaLiKiz QLKNN10D y QLKNN11D, y descripciones de maquinas de ITER, MAST Upgrade, SPARC y STEP. No se especifica el numero de tokens, la composicion exacta del dataset ni si hubo RLHF o DPO; tampoco se detallan innovaciones tecnicas como decodificacion especulativa o atencion lineal.

## Capacidades

- Modelado y prediccion de series temporales de variables de plasma en tokamaks.
- Aprendizaje del mundo a partir de simulador y transferencia a descargas experimentales.
- Generacion de trayectorias o evoluciones de estado propias de un modelo del mundo (world model).
- Evaluacion de configuraciones mediante una regla de seleccion documentada en `selection.json`.
- Reproducibilidad mediante semillas alternativas (`seed_1.pt`, `seed_2.pt`) y manifiesto con SHA-256.
- No se documentan capacidades de generacion de texto, codigo, matematicas, vision, audio, tool calling, agentes ni multilingues.

## Casos de uso

- Prediccion de la evolucion temporal de perfiles de plasma: el modelo se usaria para anticipar la trayectoria de variables de plasma en escenarios de tokamak, aprovechando el preentrenamiento en simulador y el ajuste con descargas reales.
- Control predictivo en experimentos de fusion: al actuar como modelo del mundo, puede alimentar bucles de control que estimen el estado futuro del plasma y ajusten actuadores.
- Exploracion de escenarios en reactores en diseno (ITER, SPARC, STEP): permite simular de forma rapida escenarios descritos en las bases de datos citadas antes de ejecutar campanas costosas.
- Estudio de transiciones de confinamiento (L-H) y limites de densidad: el modelo puede emplearse para analizar regimenes descritos en las bases de TCV y Alcator C-Mod.
- Reproduccion de resultados de investigacion: el checkpoint etiquetado `paper` permite replicar el experimento del articulo asociado y comparar con las semillas alternativas.
- Evaluacion comparativa de recetas de entrenamiento: la existencia de 35 configuraciones y sus puntuaciones de seleccion permite estudiar el efecto de hiperparametros en modelos del mundo de plasma.
- Prototipado de bajo coste: con 1M de parametros, sirve como banco de pruebas para pipelines de datos de fusion antes de escalar a modelos mayores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- Al tratarse de un modelo de 1M de parametros en formato PyTorch, la inferencia cabe con holgura en cualquier GPU consumer moderna e incluso en CPU.
- VRAM estimada: no disponible en la informacion proporcionada; por el tamano del modelo, seria del orden de decenas de MB en precision nativa, aunque no se confirma.
- GPU recomendadas: no disponibles; cualquier GPU con soporte PyTorch deberia ser suficiente.
- Opciones de despliegue: carga directa con PyTorch (`torch.load`); no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que estan orientados a modelos de lenguaje.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye modelos comparables de la misma categoria (modelos del mundo para plasmas de tokamak) ni datos de rendimiento que permitan una comparacion rigurosa.

## Limitaciones y advertencias

- La informacion publicada es muy escasa: no hay benchmarks, contexto, vocabulario ni detalles de arquitectura mas alla del presupuesto de 1M de parametros.
- El tamano del repositorio figura como 0.0 GB, lo que puede indicar que los pesos no estan efectivamente alojados o que el dato no es fiable; conviene verificar antes de intentar la descarga.
- El modelo esta especializado en series temporales de plasma de tokamak; no es un modelo de lenguaje y no debe usarse para tareas de texto, codigo o vision.
- Riesgo de alucinacion no evaluado en la informacion disponible; en modelos del mundo, la extrapolacion fuera de la distribucion de entrenamiento puede producir predicciones fisicamente invalidas.
- La licencia CC BY-SA 4.0 impone atribucion y compartir bajo la misma licencia las obras derivadas; es compatible con uso comercial siempre que se respeten esas condiciones.
- La model card exige citar y atribuir multiples fuentes de datos (FAIR-MAST, HDB5, PR08, Alcator C-Mod, TCV, OpenSTEP, SPARC, QLKNN, ITER, MAST Upgrade, STEP); el incumplimiento de estas atribuciones puede vulnerar los terminos de las fuentes originales.
- No se documentan sesgos, limitaciones de contexto ni restricciones especificas de produccion mas alla de las anteriores.

## Enlaces

- Hugging Face: https://huggingface.co/fusion-world-model/transformer_1m_d-sim-to-shots
- Checkpoint del articulo (tag `paper`, commit `f9c3c35089c061e072b1a2ad80f94244dd5a870f`): https://huggingface.co/fusion-world-model/transformer_1m_d-sim-to-shots/tree/paper
- Licencia CC BY-SA 4.0: https://creativecommons.org/licenses/by-sa/4.0/
- FAIR-MAST (UKAEA), Jackson et al. 2025, IEEE Trans. Plasma Sci. 53, 2440: https://doi.org/10.1109/TPS.2025.3583419
- FAIR-MAST, Jackson et al. 2024, SoftwareX 27, 101869: https://doi.org/10.1016/j.softx.2024.101869
- HDB5, Verdoolaege et al. 2021, Nucl. Fusion 61, 076006: https://doi.org/10.1088/1741-4326/abdb91
- PR08, Roach et al. 2008, Nucl. Fusion 48, 125001: https://doi.org/10.1088/0029-5515/48/12/125001
- Open Density Limit Database (Alcator C-Mod): https://github.com/MIT-PSFC/open_density_limit_database
- TCV L-H transition database, Labit y Pau (2025): https://doi.org/10.5281/zenodo.14996664
- TCV, Labit et al., Plasma Phys. Control. Fusion (2025): https://doi.org/10.1088/1361-6587/adc8ce
- OpenSTEP, escenario SPP-001: https://doi.org/10.14468/07jt-s540
- SPARC, Creely et al., J. Plasma Phys. 86, 865860502 (2020)
- QLKNN10D: https://doi.org/10.5281/zenodo.3497066
- QLKNN11D: https://doi.org/10.5281/zenodo.8017522
- van de Plassche et al., Phys. Plasmas 27, 022310 (2020): https://doi.org/10.1063/1.5134126
