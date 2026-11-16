# fusion-world-model/gru_1m_c-shots

## Resumen

`gru_1m_c-shots` es un modelo del mundo (world model) para plasmas de tokamak desarrollado por el proyecto fusion-world-model. Se trata de una red neuronal recurrente de tipo GRU con un presupuesto de parametros de aproximadamente 1 millon, entrenada para predecir la evolucion temporal de plasmas en dispositivos de fusion por confinamiento magnetico. El modelo se publica como parte del material de un articulo cientifico, y su checkpoint de referencia corresponde a la revision etiquetada `release-2026.11.13rc2`.

El modelo no es un modelo de lenguaje: es un modelo de series temporales especializado en fisica de plasmas. Los tags del repositorio (tokamak, fusion, world-model, time-series) y la receta de entrenamiento ("c-shots only") indican que se entrena exclusivamente con disparos (shots) experimentales del conjunto de datos FAIR-MAST de UKAEA, junto con bases de datos auxiliares de confinamiento y perfiles (HDB5, PR08, Open Density Limit Database y TCV L-H).

La relevancia del modelo radica en su uso como entorno simulado ("world model") para entrenar controladores de plasma mediante aprendizaje por refuerzo: el repositorio incluye el directorio `e4/` con los controladores que la Evaluacion 4 entreno dentro del world model congelado. Su tamano reducido (1M de parametros) y su licencia CC BY-SA 4.0 lo hacen accesible para investigacion en control de fusion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GRU (red neuronal recurrente con compuertas) |
| Parametros totales | aproximadamente 1M (presupuesto de parametros declarado: 1M) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (checkpoints en PyTorch de precision nativa) |
| Idiomas soportados | no aplica (modelo de series temporales, no linguistico) |
| Licencia | CC BY-SA 4.0 |
| Formato de pesos | `.pt` (PyTorch) |

## Arquitectura y entrenamiento

La arquitectura es una GRU (Gated Recurrent Unit) con un presupuesto de 1 millon de parametros. La configuracion elegida corresponde al indice 19 de las 20 configuraciones exploradas por una busqueda de hiperparametros; la regla de seleccion de dicha busqueda la situa en primera posicion (los scores estan en `selection.json`). La configuracion del checkpoint final se recoge en `config.json`. El checkpoint del articulo usa el diseno ganador del piloto de diseno de la GRU (2 capas, dropout 0.1, calentamiento de 4.000 pasos), mientras que esta revision se reporta como el diseno original de la GRU.

La receta de entrenamiento es la denominada "(c) shots only", es decir, entrenamiento exclusivamente con disparos experimentales. Los datos proceden de FAIR-MAST (UKAEA), HDB5 (International Global H-Mode Confinement Database, DB5.2.3), PR08 (base de datos de perfiles multi-tokamak del ITPA, release publica de 2008), la Open Density Limit Database de Alcator C-Mod y la base de datos de transicion L-H de TCV. El repositorio incluye tambien un checkpoint bajo una receta anterior (`old_recipe/final.pt`) con un suelo inferior en la dispersion predicha, sin tope en la verosimilitud y sin calentamiento de learning rate. No se detalla en la informacion disponible el numero total de tokens ni la composicion exacta del dataset, ni si se aplicaron tecnicas de RLHF/DPO (no aplicables a este dominio).

## Capacidades

- Prediccion de la evolucion temporal de plasmas de tokamak (modelo del mundo para series temporales de fisica de plasmas).
- Entrenamiento de controladores de plasma dentro del world model congelado: el directorio `e4/` contiene los controladores de la Evaluacion 4, uno por tarea y semilla, entrenados con una receta PPO congelada.
- Reproducibilidad experimental: incluye `seed_1.pt` y `seed_2.pt` con la misma configuracion entrenada con otras semillas, y `manifest.json` con ruta, tamano y SHA-256 de cada fichero.
- Versionado inmutable por tags (`release-2026.11.13rc2`, `2026.11.12`, `2026.11.12-extras`, `followup`), con la garantia de que un tag nunca se mueve.
- No dispone de generacion de texto, codigo, matematicas, vision, audio, tool calling ni capacidades multilingues: es un modelo de series temporales de dominio especifico.

## Casos de uso

- Entrenamiento de controladores de plasma por refuerzo: el world model sirve como entorno simulado rapido y congelado donde entrenar politicas PPO (como los controladores de `e4/`) sin necesidad de acceso a un tokamak real, reduciendo coste y riesgo experimental.
- Prediccion de la evolucion de un disparo: dado el estado inicial y las actuaciones, el modelo estima la trayectoria temporal del plasma, util para planificacion de escenarios antes de la ejecucion.
- Estudio de sensibilidad y analisis de incertidumbre: las semillas adicionales (`seed_1.pt`, `seed_2.pt`) permiten medir la variabilidad de las predicciones entre entrenamientos y acotar el error del modelo.
- Reproduccion de resultados cientificos: el checkpoint etiquetado `release-2026.11.13rc2` y el manifiesto con hashes permiten replicar exactamente las filas del articulo correspondientes a la GRU.
- Investigacion en modelado de series temporales fisicas: la GRU de 1M de parametros es un baseline ligero y barato de entrenar para comparar con arquitecturas mayores en tareas de prediccion de plasmas.
- Integracion en pipelines de control offline: el modelo puede ejecutarse en CPU o GPU de gama baja por su tamano minimo, lo que facilita su inclusion en bucles de simulacion y evaluacion automatizada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB con los pesos en precision nativa (1M de parametros), dado el tamano minimo del modelo.
- GPU recomendadas: cualquier GPU moderna es suficiente; no se requiere A100, H100 ni RTX 4090. Una GPU integrada o incluso CPU es viable.
- Cabe en cualquier GPU de consumo, incluidas las de gama baja y las integradas.
- Opciones de despliegue: carga directa con PyTorch (`torch.load`) de los ficheros `.pt`; no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que no son aplicables a este tipo de modelo.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye modelos comparables de la misma categoria (world models de plasmas de tokamak con presupuesto de 1M de parametros).

## Limitaciones y advertencias

- Modelo de dominio muy especifico: solo es valido para plasmas de tokamak y datos de las fuentes empleadas; no generaliza a otras tareas ni a otros dominios.
- Entrenado con la receta "(c) shots only", lo que limita su cobertura a la distribucion de disparos experimentales incluidos; el comportamiento fuera de esa distribucion no esta documentado.
- El checkpoint reportado en el articulo es la revision `release-2026.11.13rc2`, no necesariamente `final.pt` de `main`; usar el tag correcto es critico para reproducir los resultados publicados.
- `followup` es una configuracion fuera del espacio de busqueda y no es el checkpoint del articulo; no debe usarse para replicar el paper.
- `old_recipe/final.pt` corresponde a una receta anterior y no es el modelo reportado.
- Licencia CC BY-SA 4.0: permite uso comercial, pero impone atribucion y compartir bajo la misma licencia las obras derivadas; ademas hereda las condiciones de atribucion de FAIR-MAST y del resto de fuentes de datos.
- Riesgo de extrapolacion en regimenes de plasma no representados en los datos de entrenamiento; no hay informacion publicada sobre sesgos ni sobre evaluacion de robustez fuera de distribucion.
- No se documentan limitaciones de contexto ni idioma porque el modelo no procesa texto.

## Enlaces

- Hugging Face: https://huggingface.co/fusion-world-model/gru_1m_c-shots
- FAIR-MAST (UKAEA): Jackson et al. 2025, IEEE Trans. Plasma Sci. 53, 2440, doi:10.1109/TPS.2025.3583419
- FAIR-MAST (UKAEA): Jackson et al. 2024, SoftwareX 27, 101869, doi:10.1016/j.softx.2024.101869
- HDB5 (DB5.2.3): Verdoolaege et al. 2021, Nucl. Fusion 61, 076006, doi:10.1088/1741-4326/abdb91
- PR08 (ITPA): Roach et al. 2008, Nucl. Fusion 48, 125001, doi:10.1088/0029-5515/48/12/125001
- Open Density Limit Database (Alcator C-Mod): https://github.com/MIT-PSFC/open_density_limit_database
- TCV L-H transition database: Labit y Pau (2025), Zenodo doi:10.5281/zenodo.14996664
- TCV L-H transition database: Labit et al., Plasma Phys. Control. Fusion (2025), doi:10.1088/1361-6587/adc8ce
- Licencia CC BY-SA 4.0: https://creativecommons.org/licenses/by-sa/4.0/
