# fusion-world-model/gru_10m_c-shots

## Resumen

`gru_10m_c-shots` es un modelo del mundo (*world model*) para plasmas de tokamak, publicado por el usuario `fusion-world-model` en Hugging Face. Se trata de una red recurrente de tipo GRU con un presupuesto de parametros de 10 millones, entrenada con la receta denominada "(c) shots only" sobre datos experimentales de descarga de varios tokamaks (FAIR-MAST, HDB5, PR08, la base de datos de limite de densidad de Alcator C-Mod y la base de transiciones L-H de TCV). No es un modelo de lenguaje: es un modelo de series temporales que predice la evolucion de un plasma de fusion a partir de datos de disparos.

El modelo se enmarca en un trabajo de investigacion sobre modelos del mundo aplicados al control de plasmas. El repositorio incluye el checkpoint elegido (`final.pt`), dos replicas con semillas distintas (`seed_1.pt`, `seed_2.pt`), la configuracion de entrenamiento, el registro de seleccion entre 20 configuraciones y los controladores PPO entrenados dentro del modelo del mundo (`e4/`). La revision `release-2026.11.13rc2` es el checkpoint que el articulo reporta como principal.

Su relevancia es acotada y muy especifica: sirve como base reproducible para investigacion en control predictivo de plasmas y como ejemplo de modelo del mundo de bajo coste computacional (10 M de parametros, repo de 0,2 GB) entrenado con datos abiertos de fusion. No esta pensado para uso general ni para inferencia en dominios distintos del modelado de descargas de tokamak.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GRU (red neuronal recurrente con compuertas), 2 capas y dropout 0,1 en el checkpoint del articulo |
| Parametros totales | 10 M (presupuesto de parametros declarado) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | CC BY-SA 4.0 |
| Formato de pesos | PyTorch (`.pt`), guardados por el codigo de entrenamiento |

## Arquitectura y entrenamiento

La arquitectura es una GRU recurrente con dos capas y dropout de 0,1, con un calentamiento de learning rate de 4.000 pasos en el checkpoint reportado por el articulo. El modelo se entrena como modelo del mundo de series temporales de plasmas de tokamak: recibe secuencias de disparos y aprende a predecir su evolucion. El repositorio documenta una busqueda sobre 20 configuraciones; `final.pt` corresponde a la configuracion de indice 6, la mejor segun la regla de seleccion del autor (puntuaciones en `selection.json`). Se incluyen dos replicas con semillas alternativas para evaluar varianza de entrenamiento.

La receta "(c) shots only" indica que el entrenamiento usa unicamente datos de disparos, sin otras fuentes auxiliares. Los datos proceden de FAIR-MAST (UKAEA), HDB5 (base internacional de confinamiento H), PR08 (base de perfiles multi-tokamak del ITPA), la base de limite de densidad de Alcator C-Mod y la base de transiciones L-H de TCV. El repositorio tambien conserva un checkpoint bajo una receta anterior (`old_recipe/final.pt`) con un suelo inferior sobre la dispersion predicha, sin tope en la verosimilitud y sin calentamiento de learning rate, que no es el modelo reportado. No se documentan en la informacion disponible detalles sobre volumen total de tokens, composicion exacta del dataset ni uso de RLHF/DPO para el modelo del mundo; los controladores PPO de `e4/` se entrenan dentro del modelo congelado.

## Capacidades

- Prediccion de series temporales de plasmas de tokamak a partir de datos de disparos.
- Modelado del mundo para entrenamiento de controladores: el repositorio incluye controladores PPO entrenados dentro del modelo congelado (`e4/`), uno por tarea y semilla.
- Reproducibilidad de experimentos: checkpoints con semillas alternativas y registro de seleccion entre configuraciones.
- No soporta generacion de texto, codigo, matematicas ni vision.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso en el sentido de los modelos de lenguaje.
- No dispone de capacidades multilingues.
- No dispone de modo de razonamiento (*thinking mode*), audio ni vision.

## Casos de uso

- Investigacion en control predictivo de plasmas: el modelo del mundo permite simular la evolucion de una descarga y entrenar o evaluar controladores (por ejemplo, PPO) sin coste de experimento real, usando los controladores ya incluidos en `e4/`.
- Reproduccion de resultados academicos: `final.pt`, `seed_1.pt` y `seed_2.pt` permiten replicar las filas del articulo y medir la varianza entre semillas de entrenamiento.
- Estudio de recetas de entrenamiento: la comparacion entre la receta actual y `old_recipe/final.pt` sirve para analizar el efecto del suelo sobre la dispersion predicha, el tope de verosimilitud y el calentamiento de learning rate.
- Analisis de sensibilidad a la seleccion de hiperparametros: `selection.json` y las 20 configuraciones exploradas permiten estudiar como la regla de seleccion afecta al checkpoint final.
- Prototipado de bajo coste: con 10 M de parametros y un repo de 0,2 GB, el modelo cabe en cualquier GPU consumer y permite iterar rapidamente en experimentos de modelado de series temporales de fusion.
- Docencia y divulgacion: como ejemplo compacto y abierto de modelo del mundo aplicado a un dominio cientifico concreto, con datos y licencias documentados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: muy baja por el tamano del modelo (10 M de parametros); cabe holgadamente en cualquier GPU consumer, aunque no se proporciona una cifra concreta en la informacion disponible.
- GPU recomendadas: cualquier GPU con soporte PyTorch; no se especifican modelos concretos (A100, H100, RTX 4090) en la documentacion.
- Cabe en GPU consumer: si, por el reducido numero de parametros y el tamano del repo (0,2 GB).
- Opciones de despliegue: el modelo se distribuye como ficheros PyTorch (`.pt`) y se carga con el codigo de entrenamiento del autor; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye modelos comparables de la misma categoria (modelos del mundo de plasmas de tokamak con presupuesto de 10 M de parametros).

## Limitaciones y advertencias

- Dominio muy restringido: solo modela plasmas de tokamak a partir de datos de disparos; no es utilizable fuera de ese dominio.
- No es un modelo de lenguaje: no genera texto, codigo ni respuestas conversacionales.
- Riesgo de alucinacion en el sentido de predicciones fisicamente implausibles fuera de la distribucion de entrenamiento; no se documentan metricas de calibracion en la informacion disponible.
- Sesgos potenciales derivados de la composicion del dataset (FAIR-MAST, HDB5, PR08, Alcator C-Mod, TCV); no se detalla la cobertura por maquina ni por regimen de operacion.
- Limitaciones de contexto: no se especifica la longitud de secuencia soportada.
- Licencia CC BY-SA 4.0: permite uso comercial con atribucion y compartir igual; las obras derivadas deben distribuirse bajo la misma licencia. Es la licencia de los datos FAIR-MAST subyacentes.
- Los datos de PR08 no tienen licencia formal y se proporcionan "as is"; conviene revisar las condiciones de atribucion antes de su uso en produccion.
- El checkpoint reportado por el articulo es `release-2026.11.13rc2`; `main` puede contener ficheros en un estado distinto al de ese commit.
- No se documentan garantias de robustez ni validacion en produccion.

## Enlaces

- Hugging Face: https://huggingface.co/fusion-world-model/gru_10m_c-shots
- FAIR-MAST (UKAEA): Jackson et al. 2025, IEEE Trans. Plasma Sci. 53, 2440, doi:10.1109/TPS.2025.3583419
- FAIR-MAST (UKAEA): Jackson et al. 2024, SoftwareX 27, 101869, doi:10.1016/j.softx.2024.101869
- HDB5 (International Global H-Mode Confinement Database, DB5.2.3): Verdoolaege et al. 2021, Nucl. Fusion 61, 076006, doi:10.1088/1741-4326/abdb91
- PR08 (ITPA multi-tokamak profile database, 2008): Roach et al. 2008, Nucl. Fusion 48, 125001, doi:10.1088/0029-5515/48/12/125001
- Open Density Limit Database (Alcator C-Mod): https://github.com/MIT-PSFC/open_density_limit_database
- TCV L-H transition database: Labit y Pau (2025), Zenodo doi:10.5281/zenodo.14996664
- TCV L-H transition database: Labit et al., Plasma Phys. Control. Fusion (2025), doi:10.1088/1361-6587/adc8ce
- Licencia CC BY-SA 4.0: https://creativecommons.org/licenses/by-sa/4.0/
