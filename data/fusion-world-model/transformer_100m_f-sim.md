# fusion-world-model/transformer_100m_f-sim

## Resumen

`transformer_100m_f-sim` es un modelo de mundo (world model) para plasmas de tokamak desarrollado por el colectivo fusion-world-model. Se trata de un transformer de 100 millones de parametros entrenado como emulador de simulador (receta "f") para predecir la evolucion temporal de plasmas de fusion. No es un modelo de lenguaje: es un modelo de series temporales cientificas orientado a la simulacion y prediccion de descargas en reactores de fusion por confinamiento magnetico.

El modelo se distribuye como checkpoints de PyTorch (`.pt`) generados por el codigo de entrenamiento del autor, no como pesos en formato safetensors ni con integracion en librerias de inferencia estandar. El repositorio incluye el checkpoint seleccionado (`final.pt`), dos replicas con semillas de entrenamiento distintas (`seed_1.pt`, `seed_2.pt`), la configuracion de entrenamiento (`config.json`), el registro de seleccion (`selection.json`) y un manifiesto con hashes SHA-256 de todos los ficheros.

Su relevancia radica en el dominio: la emulacion rapida de simuladores de plasma permite acelerar barridos de parametros, estudios de escenarios y diseno de control en reactores como ITER, MAST Upgrade, SPARC y STEP. El modelo se apoya en un conjunto amplio de bases de datos publicas de fusion (FAIR-MAST, HDB5, PR08, QLKNN, OpenSTEP, SPARCPublic, entre otras) y se libera bajo CC BY-SA 4.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (modelo de series temporales para emulacion de simulador de plasmas de tokamak) |
| Parametros totales | 100M (presupuesto de parametros declarado) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (checkpoints PyTorch en punto flotante) |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | CC BY-SA 4.0 |
| Formato de pesos | PyTorch (`.pt`) |

## Arquitectura y entrenamiento

La arquitectura es un transformer con un presupuesto de 100 millones de parametros, disenado como emulador de un simulador de plasmas de tokamak (receta "f" de las cuatro recetas del proyecto, segun la nomenclatura del autor). El modelo opera sobre series temporales de variables de plasma y se entrena para reproducir la salida del simulador de referencia, lo que lo convierte en un sustituto rapido y diferenciable de la simulacion fisica completa.

El proceso de entrenamiento incluyo una busqueda de configuraciones: se entrenaron 30 configuraciones y `final.pt` corresponde a la configuracion de indice 22, la mejor clasificada por la regla de seleccion del autor (los scores estan en `selection.json`). Los checkpoints `seed_1.pt` y `seed_2.pt` son la misma configuracion reentrenada con semillas distintas, lo que permite evaluar la varianza del entrenamiento. Los datos de entrenamiento se apoyan en un conjunto de bases de datos publicas de fusion: FAIR-MAST (UKAEA), HDB5, PR08, Open Density Limit Database, la base de transicion L-H de TCV, OpenSTEP, SPARCPublic (Common Fusion Systems), las tablas de flujos QLKNN10D y QLKNN11D, y descripciones de maquinas de ITER, MAST Upgrade, SPARC y STEP. No se especifican en la informacion disponible el numero de tokens, la composicion exacta del dataset ni si se aplicaron tecnicas de RLHF o DPO (poco probables en un modelo de este tipo).

## Capacidades

- Prediccion y emulacion de la evolucion temporal de plasmas de tokamak a partir de condiciones de contorno y parametros de descarga.
- Sustitucion rapida de simuladores fisicos en barridos de parametros y estudios de escenarios.
- Modelado de series temporales multivariantes de variables de plasma (perfil, confinamiento, transiciones).
- Generacion de trayectorias sinteticas para aumento de datos y analisis de sensibilidad.
- Reentrenamiento reproducible: los checkpoints con semillas alternativas permiten estimar incertidumbre del modelo.
- No soporta tool calling, function calling ni razonamiento multi-paso en el sentido de los LLM.
- No dispone de capacidades multilingues, vision ni audio.

## Casos de uso

- Emulacion de simulador para barridos de parametros: el modelo sustituye al simulador fisico en exploraciones de espacio de parametros, reduciendo el coste computacional de cada evaluacion.
- Diseno de escenarios en reactores: permite evaluar rapidamente configuraciones candidatas para ITER, SPARC o STEP antes de validarlas con simulacion completa.
- Estudio de transiciones de confinamiento: al entrenarse con datos de transicion L-H de TCV y HDB5, puede emplearse para analizar condiciones de acceso al regimen H.
- Aumento de datos para control: las trayectorias sinteticas generadas pueden alimentar el entrenamiento de controladores de plasma.
- Analisis de sensibilidad e incertidumbre: los checkpoints con semillas distintas permiten cuantificar la variabilidad de las predicciones.
- Investigacion reproducible en fusion: el manifiesto con SHA-256 y las revisiones etiquetadas facilitan la replicacion de resultados del paper asociado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la informacion proporcionada; para 100M de parametros en FP32 el peso ronda los 400 MB, y el repositorio completo ocupa 1,1 GB (incluyendo varios checkpoints).
- GPU recomendadas: no disponible; por tamano, cualquier GPU consumer moderna (RTX 3060 o superior) deberia poder cargar el modelo, pero no se confirma en la informacion.
- Cabe en GPU consumer: previsiblemente si, dado el tamano de 100M de parametros, aunque no se documenta.
- Opciones de despliegue: al ser checkpoints PyTorch crudos, requiere el codigo de entrenamiento del autor; no hay integracion documentada con vLLM, llama.cpp, Ollama ni TGI (no aplicables a este tipo de modelo).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. No se han proporcionado modelos comparables de emulacion de plasmas de tokamak en la informacion disponible.

## Limitaciones y advertencias

- El modelo es un emulador de simulador: su fidelidad esta acotada por la del simulador y los datos de entrenamiento, y puede divergir en regimenes poco representados.
- Riesgo de extrapolacion incorrecta fuera del dominio de las bases de datos de entrenamiento (FAIR-MAST, HDB5, PR08, TCV, SPARC, STEP, etc.).
- No es un modelo de lenguaje: no debe emplearse para tareas de texto, codigo o conversacion.
- La licencia CC BY-SA 4.0 obliga a atribuir y a compartir las obras derivadas bajo la misma licencia; revisar compatibilidad para uso comercial.
- Algunas fuentes de datos tienen condiciones de atribucion especificas (PR08 sin licencia formal, SPARCPublic con reconocimiento obligatorio) que deben respetarse en publicaciones.
- No se documentan sesgos, limites de contexto ni metricas de robustez; el autor no publica resultados de evaluacion en la model card.
- Los checkpoints son ficheros PyTorch sin formato de serializacion seguro documentado (`.pt`), lo que requiere precaucion al cargarlos.

## Enlaces

- Hugging Face: https://huggingface.co/fusion-world-model/transformer_100m_f-sim
- Licencia CC BY-SA 4.0: https://creativecommons.org/licenses/by-sa/4.0/
- FAIR-MAST (UKAEA), Jackson et al. 2025: doi:10.1109/TPS.2025.3583419
- FAIR-MAST (UKAEA), Jackson et al. 2024: doi:10.1016/j.softx.2024.101869
- HDB5, Verdoolaege et al. 2021: doi:10.1088/1741-4326/abdb91
- PR08, Roach et al. 2008: doi:10.1088/0029-5515/48/12/125001
- Open Density Limit Database: https://github.com/MIT-PSFC/open_density_limit_database
- TCV L-H transition database, Labit y Pau 2025: doi:10.5281/zenodo.14996664
- OpenSTEP, Brown et al. 2025: doi:10.14468/07jt-s540
- SPARCPublic, Creely et al. 2020: doi:10.1017/S0022377820001257
- QLKNN10D, van de Plassche et al. 2020: doi:10.1063/1.5134126
