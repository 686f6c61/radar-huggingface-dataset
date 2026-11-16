# fusion-world-model/gru_100m_e-joint

## Resumen

`gru_100m_e-joint` es un modelo del mundo (world model) para plasmas de tokamak desarrollado por el usuario `fusion-world-model`. Se trata de una red recurrente de tipo GRU con un presupuesto de 100 millones de parametros, entrenada para predecir la evolucion temporal de plasmas de fusion dentro de reactores tipo tokamak. El modelo forma parte de un trabajo de investigacion mas amplio sobre modelos predictivos de dinamica de plasmas, y su checkpoint principal corresponde a la revision etiquetada como `release-2026.11.13rc2`.

El modelo se distribuye en formato PyTorch (`.pt`) e incluye el checkpoint elegido (`final.pt`), dos repeticiones con semillas distintas (`seed_1.pt`, `seed_2.pt`), la configuracion de entrenamiento, el registro de seleccion de hiperparametros y un manifiesto con hashes SHA-256. La receta de entrenamiento es la denominada "(e) joint training", y el checkpoint `final.pt` corresponde a la configuracion de indice 6 de las 20 exploradas en la busqueda de hiperparametros.

Su relevancia radica en que aplica tecnicas de modelado de series temporales y modelos del mundo al dominio de la fisica de plasmas de fusion, un area donde los modelos predictivos precisos son criticos para el control en tiempo real de reactores. El modelo se entrena sobre datos experimentales de multiples tokamaks (FAIR-MAST, HDB5, PR08, Alcator C-Mod, TCV, SPARC, STEP, entre otros) y tablas de flujos de QuaLiKiz.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GRU (red neuronal recurrente con compuertas) |
| Parametros totales | 100M (presupuesto de parametros) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo de series temporales, no de lenguaje) |
| Licencia | CC BY-SA 4.0 |
| Formato de pesos | PyTorch (`.pt`) |

## Arquitectura y entrenamiento

La arquitectura es una GRU (Gated Recurrent Unit) con un presupuesto de 100 millones de parametros. Segun la model card, el checkpoint principal `final.pt` corresponde a la configuracion de indice 6 de las 20 configuraciones exploradas en una busqueda de hiperparametros, seleccionada por la regla de seleccion del propio proceso de busqueda (los scores estan en `selection.json`). La configuracion de entrenamiento se detalla en `config.json`.

El modelo se entrena con la receta "(e) joint training". La model card menciona que la receta anterior (`old_recipe/`) tenia un suelo inferior sobre la dispersion predicha, sin tope en la verosimilitud y sin warmup del learning rate; la receta actual elimina esas restricciones. El entrenamiento se apoya en un conjunto de datos compuesto por multiples bases de datos experimentales de tokamaks: FAIR-MAST (UKAEA), HDB5 (International Global H-Mode Confinement Database), PR08 (ITPA multi-tokamak profile database), Open Density Limit Database (Alcator C-Mod), TCV L-H transition database, OpenSTEP (STEP SPP-001), SPARCPublic (Commonwealth Fusion Systems), y las tablas de flujos QLKNN10D y QLKNN11D de QuaLiKiz. No se especifica en la informacion disponible el numero total de tokens ni la composicion exacta del dataset.

Como innovacion destacable, el repositorio incluye en `e4/` los controladores entrenados en el mundo del modelo de `final.pt` mediante una receta PPO congelada, uno por tarea y semilla, lo que sugiere un uso del modelo como entorno simulado para aprendizaje por refuerzo.

## Capacidades

- Prediccion de la evolucion temporal de plasmas de tokamak (modelo del mundo).
- Modelado de series temporales fisicas en el dominio de la fusion.
- Servir como entorno simulado para entrenamiento de controladores mediante PPO (los controladores de Evaluation 4 estan incluidos en `e4/`).
- Reproducibilidad mediante multiples semillas (`seed_1.pt`, `seed_2.pt`).
- No es un modelo de lenguaje: no soporta generacion de texto, tool calling, agentes ni capacidades multilingues.
- No se documentan capacidades de vision, audio ni modos de razonamiento explicito.

## Casos de uso

- Prediccion de la evolucion de perfiles de plasma en tokamaks: el modelo puede usarse para anticipar la trayectoria temporal de variables fisicas del plasma a partir de condiciones iniciales y actuaciones, sirviendo como modelo del mundo para simulacion y planificacion.
- Entrenamiento de controladores por refuerzo: los controladores PPO incluidos en `e4/` demuestran el uso del modelo como entorno simulado donde entrenar politicas de control sin necesidad de interactuar con el tokamak real.
- Estudio de escenarios de operacion en reactores de fusion: el modelo permite explorar configuraciones de plasma y evaluar su evolucion antes de ejecutarlas en un dispositivo real.
- Analisis de transiciones de confinamiento (L-H): aprovechando los datos de TCV y otras bases, el modelo puede ayudar a estudiar la dinamica de transiciones de regimen de confinamiento.
- Investigacion en modelos del mundo para sistemas fisicos: sirve como caso de estudio de aplicacion de arquitecturas recurrentes a la prediccion de dinamica de sistemas complejos.
- Reproducibilidad de experimentos: los checkpoints con multiples semillas y el manifiesto con hashes SHA-256 permiten reproducir y auditar resultados de investigacion.
- Comparacion de recetas de entrenamiento: la inclusion de `old_recipe/final.pt` permite comparar el efecto de cambios en la receta (suelo de dispersion, tope de verosimilitud, warmup).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la informacion proporcionada. Con 100M de parametros, en precision FP32 el modelo ocuparia aproximadamente 400 MB de pesos; en FP16, unos 200 MB. Estas cifras son estimaciones tecnicas basadas en el tamano, no datos publicados.
- GPU recomendadas: no disponible. Por tamano, cabria en cualquier GPU consumer moderna (RTX 3060 o superior), pero no se documenta.
- Cabe en GPU consumer: previsiblemente si, dado el tamano de 100M de parametros, aunque no se confirma en la informacion disponible.
- Opciones de despliegue: al ser un modelo PyTorch de series temporales, se cargaria con `torch.load` en Python. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI (herramientas orientadas a modelos de lenguaje).
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye modelos comparables de la misma categoria (modelos del mundo para plasmas de tokamak).

## Limitaciones y advertencias

- Modelo de dominio muy especifico (plasmas de tokamak); no es un modelo de proposito general ni de lenguaje.
- No se documentan sesgos conocidos, pero al entrenarse con bases de datos experimentales de dispositivos concretos, puede heredar sesgos de esos regimenes de operacion.
- Riesgo de alucinacion no aplica en el sentido de modelos de lenguaje, pero si existe riesgo de predicciones fisicamente implausibles fuera del dominio de entrenamiento.
- La licencia CC BY-SA 4.0 exige atribucion y compartir bajo la misma licencia las obras derivadas; es importante para uso comercial y redistribucion.
- El modelo se apoya en datos con licencias diversas (CC BY-SA 4.0, CC BY 4.0, MIT, sin licencia formal en el caso de PR08), lo que puede condicionar la redistribucion de derivados.
- No se documentan limitaciones de contexto o idioma porque no es un modelo de lenguaje.
- El checkpoint `final.pt` es el resultado de una busqueda de hiperparametros sobre 20 configuraciones; su rendimiento fuera de las tareas evaluadas no esta garantizado.
- La model card advierte que `old_recipe/final.pt` no es el modelo reportado en el paper, sino el registro de la receta anterior.

## Enlaces

- Hugging Face: https://huggingface.co/fusion-world-model/gru_100m_e-joint
- FAIR-MAST (UKAEA): Jackson et al. 2025, IEEE Trans. Plasma Sci. 53, 2440, doi:10.1109/TPS.2025.3583419
- FAIR-MAST software: Jackson et al. 2024, SoftwareX 27, 101869, doi:10.1016/j.softx.2024.101869
- HDB5: Verdoolaege et al. 2021, Nucl. Fusion 61, 076006, doi:10.1088/1741-4326/abdb91
- PR08: Roach et al. 2008, Nucl. Fusion 48, 125001, doi:10.1088/0029-5515/48/12/125001
- Open Density Limit Database: https://github.com/MIT-PSFC/open_density_limit_database
- TCV L-H transition database: doi:10.5281/zenodo.14996664
- OpenSTEP: doi:10.14468/07jt-s540
- QLKNN10D: doi:10.5281/zenodo.3497066
- QLKNN11D: doi:10.5281/zenodo.8017522
- Licencia CC BY-SA 4.0: https://creativecommons.org/licenses/by-sa/4.0/
