# fusion-world-model/gru-dw_10m_c-shots

## Resumen

`gru-dw_10m_c-shots` es un modelo del mundo (world model) para plasmas de tokamak desarrollado por el colectivo `fusion-world-model`. Se trata de una red neuronal recurrente de tipo GRU con 2 capas, dropout de 0,1 y un presupuesto de parametros de 10 millones, entrenada para predecir la evolucion temporal de plasmas en dispositivos de fusion por confinamiento magnetico. El modelo forma parte de un estudio mas amplio sobre modelos del mundo aplicados a tokamaks y se publica como checkpoint de referencia de un articulo cientifico.

La relevancia del modelo es acotada y especifica: no es un modelo de lenguaje ni un modelo generativo de proposito general, sino un componente de simulacion y prediccion de series temporales fisicas. Su interes radica en que se entrena con datos experimentales reales de multiples tokamaks (FAIR-MAST, HDB5, PR08, Alcator C-Mod y TCV), lo que lo convierte en una pieza util para investigacion en control de plasma y planificacion de escenarios de fusion.

El checkpoint publicado corresponde a la configuracion de indice 21 de las 25 exploradas en la busqueda de hiperparametros del autor, seleccionada por la regla de seleccion descrita en `selection.json`. Se distribuye en formato PyTorch (`.pt`) bajo licencia CC BY-SA 4.0, heredada de los datos FAIR-MAST con los que fue entrenado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GRU (2 capas, dropout 0,1, warmup de 4.000 pasos) |
| Parametros totales | 10M (presupuesto declarado) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo de series temporales, no linguistico) |
| Licencia | CC BY-SA 4.0 |
| Formato de pesos | PyTorch (`.pt`) |

## Arquitectura y entrenamiento

La arquitectura es una red recurrente GRU de dos capas con dropout de 0,1 y un regimen de warmup de 4.000 pasos durante el entrenamiento. El presupuesto de parametros es de 10 millones, lo que la situa en la categoria de modelos ligeros para series temporales. El modelo se entrena como modelo del mundo: aprende la dinamica temporal de plasmas de tokamak a partir de datos experimentales, con el objetivo de predecir la evolucion de variables de plasma.

La receta de entrenamiento corresponde a la variante "(c) shots only", es decir, entrenada unicamente con datos de disparos (shots) experimentales. Los datos de entrenamiento provienen de FAIR-MAST (UKAEA), la base de datos HDB5 de confinamiento H-mode, la base de perfiles PR08 del ITPA, la Open Density Limit Database de Alcator C-Mod y la base de datos de transiciones L-H de TCV. No se especifica en la informacion disponible el numero total de tokens, la composicion exacta del dataset ni si se aplicaron tecnicas de RLHF o DPO (poco probables en este dominio). El repositorio incluye `config.json` con la configuracion de entrenamiento de `final.pt` y `selection.json` con las puntuaciones de seleccion.

## Capacidades

- Prediccion de la evolucion temporal de plasmas de tokamak a partir de datos de disparos experimentales.
- Modelado de dinamica de series temporales fisicas en el dominio de la fusion por confinamiento magnetico.
- Aprendizaje de la dinamica subyacente a partir de multiples bases de datos experimentales (FAIR-MAST, HDB5, PR08, Alcator C-Mod, TCV).
- Reproducibilidad mediante multiples semillas de entrenamiento (`seed_1.pt`, `seed_2.pt`).
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso: no es un modelo de lenguaje.
- No dispone de capacidades multilingues, de vision ni de audio.
- No dispone de modo de pensamiento (thinking mode) ni capacidades generativas de texto.

## Casos de uso

- Prediccion de escenarios de plasma en tokamaks: el modelo puede usarse para anticipar la evolucion temporal de variables de plasma en un disparo, lo que resulta util para planificar escenarios operativos antes de ejecutarlos en el dispositivo.
- Control predictivo de plasma: al ser un modelo del mundo ligero (10M parametros), puede integrarse en bucles de control que requieran predicciones rapidas de la dinamica del plasma en tiempo casi real.
- Investigacion en transiciones L-H: entrenado con la base de datos de TCV, permite estudiar la dinamica de transiciones de confinamiento y validar hipotesis sobre sus condiciones de disparo.
- Analisis de limites de densidad: con datos de la Open Density Limit Database de Alcator C-Mod, el modelo puede emplearse para explorar el comportamiento del plasma cerca del limite de densidad.
- Estudio de confinamiento H-mode: la inclusion de HDB5 permite usar el modelo para analizar escalados de confinamiento y comparar predicciones con datos experimentales de multiples tokamaks.
- Reproduccion de resultados cientificos: el checkpoint etiquetado `paper` y las semillas adicionales permiten reproducir y verificar los resultados del articulo asociado.
- Desarrollo de modelos del mundo para fusion: sirve como linea base ligera para comparar con arquitecturas mas grandes o con recetas de entrenamiento alternativas en futuros estudios.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: muy baja, del orden de decenas de MB para un modelo de 10M parametros en precision completa (no se dispone de mediciones oficiales).
- GPU recomendadas: cualquier GPU moderna es suficiente; el modelo cabe holgadamente en GPUs de consumo como RTX 3060, RTX 4060 o superiores.
- Cabe en GPU de consumo: si, practicamente en cualquier GPU con al menos 1 GB de VRAM.
- Opciones de despliegue: inferencia directa con PyTorch (unica libreria declarada); no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI, que no aplican a este tipo de modelo.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye modelos comparables de la misma categoria (modelos del mundo para plasmas de tokamak) ni datos de rendimiento que permitan una comparacion cuantitativa.

## Limitaciones y advertencias

- Modelo de dominio muy especifico: solo es aplicable a series temporales de plasmas de tokamak; no sirve para tareas de lenguaje, vision ni proposito general.
- Sesgos de datos: entrenado con un conjunto limitado de bases de datos experimentales (FAIR-MAST, HDB5, PR08, Alcator C-Mod, TCV), por lo que puede generalizar mal a dispositivos o regimenes no representados.
- Riesgo de extrapolacion incorrecta fuera del dominio de entrenamiento; no hay benchmarks publicados que cuantifiquen su error.
- Restricciones de licencia: CC BY-SA 4.0 obliga a atribucion y a compartir bajo la misma licencia las obras derivadas; ademas, los datos de origen imponen requisitos de citacion especificos (FAIR-MAST, HDB5, PR08, Alcator C-Mod, TCV) que deben respetarse.
- El checkpoint `paper` es el de referencia para el articulo; `final.pt` puede diferir de el, por lo que conviene verificar que revision se usa en produccion o en comparaciones.
- No se documentan limitaciones de contexto ni de idioma porque el modelo no opera sobre texto.
- Sin pipeline declarado ni tarjeta de uso detallada: la integracion en produccion requiere conocer el codigo de entrenamiento del autor.

## Enlaces

- Hugging Face: https://huggingface.co/fusion-world-model/gru-dw_10m_c-shots
- Revision `paper` (commit `39f99a26630f666d1dfb66672354025a00588e17`): https://huggingface.co/fusion-world-model/gru-dw_10m_c-shots/tree/39f99a26630f666d1dfb66672354025a00588e17
- Licencia CC BY-SA 4.0: https://creativecommons.org/licenses/by-sa/4.0/
- FAIR-MAST (UKAEA), Jackson et al. 2025, IEEE Trans. Plasma Sci. 53, 2440: https://doi.org/10.1109/TPS.2025.3583419
- FAIR-MAST, Jackson et al. 2024, SoftwareX 27, 101869: https://doi.org/10.1016/j.softx.2024.101869
- HDB5, Verdoolaege et al. 2021, Nucl. Fusion 61, 076006: https://doi.org/10.1088/1741-4326/abdb91
- PR08, Roach et al. 2008, Nucl. Fusion 48, 125001: https://doi.org/10.1088/0029-5515/48/12/125001
- Open Density Limit Database (MIT PSFC): https://github.com/MIT-PSFC/open_density_limit_database
- TCV L-H transition database, Labit y Pau (2025), Zenodo: https://doi.org/10.5281/zenodo.14996664
- TCV, Labit et al., Plasma Phys. Control. Fusion (2025): https://doi.org/10.1088/1361-6587/adc8ce
