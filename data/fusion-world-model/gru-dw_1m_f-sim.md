# fusion-world-model/gru-dw_1m_f-sim

## Resumen

`gru-dw_1m_f-sim` es un modelo del mundo (world model) para plasmas de tokamak desarrollado por el proyecto fusion-world-model. Se trata de una red neuronal recurrente de tipo GRU que actúa como emulador del simulador de receta (f), con un presupuesto de parametros de 1 millon. El modelo predice la evolucion temporal de variables de plasma en reactores de fusion, un problema de series temporales cientificas de alta dimensionalidad y fuerte no linealidad.

El checkpoint publicado corresponde a la configuracion ganadora del diseno piloto del autor: 2 capas, dropout de 0,1 y un calentamiento (warmup) de 4000 pasos. El repositorio incluye el checkpoint seleccionado (`final.pt`), dos replicas con semillas de entrenamiento distintas y los metadatos de configuracion, seleccion y manifiesto de integridad. La revision etiquetada `paper` contiene el checkpoint exacto utilizado en la publicacion asociada.

Es relevante porque los emuladores de simuladores de plasma permiten acelerar barridos de parametros y estudios de escenarios de operacion en tokamaks (ITER, SPARC, STEP, MAST-U) sin ejecutar el coste computacional completo de los codigos de transporte. El modelo se distribuye con licencia CC BY-SA 4.0, heredada de los datos FAIR-MAST sobre los que se entreno.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GRU (recurrente, 2 capas, dropout 0,1) |
| Parametros totales | 1 millon (presupuesto de diseno) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (checkpoints PyTorch en coma flotante) |
| Idiomas soportados | no disponible (modelo numerico, no linguistico) |
| Licencia | CC BY-SA 4.0 |
| Formato de pesos | PyTorch (`.pt`) |

## Arquitectura y entrenamiento

El modelo es una red recurrente GRU de dos capas con dropout de 0,1, entrenada con un calentamiento de 4000 pasos. Su funcion es emular el simulador de la receta (f) para la evolucion temporal de plasmas de tokamak, dentro de un espacio de busqueda de 35 configuraciones. La configuracion publicada como `final.pt` es la que ocupa el primer puesto segun la regla de seleccion del autor, registrada en `selection.json`. Las replicas `seed_1.pt` y `seed_2.pt` corresponden a la misma configuracion reentrenada con semillas distintas, lo que permite evaluar la variabilidad del entrenamiento.

Los datos de entrenamiento se apoyan en un conjunto de fuentes cientificas de acceso publico, entre ellas FAIR-MAST (UKAEA), la base de datos HDB5 de confinamiento H-mode, PR08 del ITPA, la base de datos de limite de densidad de Alcator C-Mod, la base de transicion L-H de TCV, el escenario SPP-001 de OpenSTEP, la descarga de referencia de SPARC, las tablas de flujos QLKNN10D y QLKNN11D, y descripciones de maquinas de ITER, MAST Upgrade, SPARC y STEP. No se especifica en la informacion disponible el numero de tokens ni la composicion exacta del dataset, ni si se aplicaron tecnicas de RLHF o DPO (no procede en un modelo de regresion de series temporales).

## Capacidades

- Prediccion de la evolucion temporal de variables de plasma en tokamaks como emulador del simulador de receta (f).
- Modelado de series temporales cientificas con dinamica no lineal y dependencias temporales.
- Emulacion rapida de escenarios de operacion para barridos de parametros.
- Soporte de multiples semillas de entrenamiento para analisis de incertidumbre y reproducibilidad.
- No dispone de generacion de texto, codigo, matematicas simbolicas, vision ni audio.
- No soporta tool calling ni function calling.
- No esta disenado para razonamiento multi-paso ni para uso como agente.
- No tiene capacidades multilingues (es un modelo numerico, no linguistico).

## Casos de uso

- Barrido de parametros de diseno: el modelo emula el simulador de receta (f) para explorar rapidamente combinaciones de parametros de operacion del tokamak, reduciendo el coste frente a la ejecucion del simulador completo.
- Estudio de escenarios en ITER y SPARC: permite generar predicciones preliminares de la evolucion del plasma en configuraciones de referencia descritas en los datos de entrenamiento (SPARC, OpenSTEP, ITER).
- Analisis de sensibilidad y propagacion de incertidumbre: las replicas con semillas distintas (`seed_1.pt`, `seed_2.pt`) permiten estimar la variabilidad de las predicciones y acotar la incertidumbre del emulador.
- Prototipado de control y planificacion de descargas: al ser un modelo ligero (1M parametros), puede integrarse en bucles de simulacion rapida para evaluar trayectorias de descarga antes de la ejecucion real.
- Validacion cruzada de codigos de transporte: comparar las predicciones del emulador con salidas de codigos fisicos en regimenes cubiertos por las bases de datos (HDB5, PR08, QLKNN).
- Docencia e investigacion reproducible: el repositorio incluye manifiesto con hashes SHA-256 y configuracion de entrenamiento, lo que facilita la reproduccion de resultados en entornos academicos.
- Generacion de datos sinteticos para entrenar modelos mayores: el emulador puede producir trayectorias sinteticas de plasma a bajo coste para aumentar datasets de entrenamiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB para el checkpoint en precision completa, dado el presupuesto de 1 millon de parametros (unos 4 MB en FP32 para los pesos).
- GPU recomendadas: cualquier GPU consumer moderna (RTX 3060, RTX 4090) es suficiente; tambien puede ejecutarse en CPU sin problema.
- Cabe en cualquier GPU consumer y en la mayoria de entornos embebidos.
- Opciones de despliegue: PyTorch nativo (los checkpoints son `.pt`); no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que estan orientados a modelos de lenguaje.
- Latencia y throughput: no disponibles en la informacion proporcionada; por el tamano del modelo se espera una latencia muy baja en inferencia por paso temporal.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye modelos comparables de la misma categoria (emuladores de plasma basados en GRU con presupuesto de 1M parametros) ni sus metricas.

## Limitaciones y advertencias

- El modelo es un emulador del simulador de receta (f); su validez esta acotada al dominio y regimen cubiertos por los datos de entrenamiento (FAIR-MAST, HDB5, PR08, TCV, SPARC, etc.).
- Riesgo de extrapolacion incorrecta fuera de la distribucion de entrenamiento; no debe usarse como sustituto de la validacion experimental en tokamaks reales.
- No se documentan sesgos especificos, pero al derivarse de bases de datos experimentales puede heredar los sesgos de cobertura de dichas bases (por ejemplo, sobrerrepresentacion de ciertos regimenes de confinamiento).
- El modelo no es linguistico, por lo que no aplican limitaciones de idioma ni de contexto conversacional.
- Licencia CC BY-SA 4.0: permite uso comercial con atribucion y obliga a compartir bajo la misma licencia las obras derivadas; ademas, los datos de origen imponen requisitos de citacion especificos (FAIR-MAST, HDB5, PR08, QLKNN, SPARC, entre otros) que deben respetarse.
- Los datos de SPARC requieren el reconocimiento textual especificado por Commonwealth Fusion Systems.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no existe validacion externa de la comunidad.
- No se documenta el pipeline de Hugging Face ni el preprocesado de entrada, lo que puede dificultar la integracion directa sin consultar el codigo de entrenamiento.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/fusion-world-model/gru-dw_1m_f-sim
- Licencia CC BY-SA 4.0: https://creativecommons.org/licenses/by-sa/4.0/
- FAIR-MAST (UKAEA), Jackson et al. 2025, IEEE Trans. Plasma Sci. 53, 2440: doi:10.1109/TPS.2025.3583419
- FAIR-MAST, Jackson et al. 2024, SoftwareX 27, 101869: doi:10.1016/j.softx.2024.101869
- HDB5, Verdoolaege et al. 2021, Nucl. Fusion 61, 076006: doi:10.1088/1741-4326/abdb91
- PR08, Roach et al. 2008, Nucl. Fusion 48, 125001: doi:10.1088/0029-5515/48/12/125001
- Open Density Limit Database (MIT PSFC): https://github.com/MIT-PSFC/open_density_limit_database
- TCV L-H transition database, Labit y Pau (2025): doi:10.5281/zenodo.14996664
- TCV, Labit et al., Plasma Phys. Control. Fusion (2025): doi:10.1088/1361-6587/adc8ce
- OpenSTEP, escenario SPP-001: doi:10.14468/07jt-s540
- SPARC, Creely et al., J. Plasma Phys. 86, 865860502 (2020)
- QLKNN10D: doi:10.5281/zenodo.3497066
- QLKNN11D: doi:10.5281/zenodo.8017522
- QLKNN, van de Plassche et al., Phys. Plasmas 27, 022310 (2020): doi:10.1063/1.5134126
