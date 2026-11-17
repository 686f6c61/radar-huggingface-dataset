# fusion-world-model/gru-dw_1m_e-joint

## Resumen

`gru-dw_1m_e-joint` es un modelo del mundo (world model) para plasmas de tokamak, publicado por el colectivo `fusion-world-model` bajo licencia CC BY-SA 4.0. No es un modelo de lenguaje: es un modelo de series temporales basado en una red recurrente GRU que predice la evolucion dinamica de un plasma de fusion, entrenado sobre datos experimentales y simulados de multiples tokamaks (FAIR-MAST, HDB5, PR08, Alcator C-Mod, TCV, STEP, SPARC, entre otros).

El checkpoint corresponde a una configuracion concreta (indice 22 de 30) seleccionada por la regla de seleccion del autor durante una busqueda de hiperparametros: arquitectura GRU de 2 capas, dropout 0.1, warmup de 4000 pasos y un presupuesto de 1 millon de parametros. La receta de entrenamiento es la denominada "(e) joint training", que combina conjuntamente las distintas fuentes de datos.

Su relevancia es acotada y muy especializada: sirve como referencia reproducible para investigacion en control y prediccion de plasmas en reactores de fusion, no para tareas de NLP, codigo o agentes. El repositorio no incluye pesos en formato distribuible estandar (solo ficheros `.pt` de PyTorch), no declara idiomas ni pipeline, y no tiene descargas ni likes en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GRU (recurrente), 2 capas, dropout 0.1 |
| Parametros totales | 1 M (presupuesto declarado) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (checkpoints en precision de entrenamiento, sin variantes GGUF/AWQ) |
| Idiomas soportados | no disponible (modelo de series temporales, no linguistico) |
| Licencia | CC BY-SA 4.0 |
| Formato de pesos | PyTorch (`.pt`), guardados por el codigo de entrenamiento |

## Arquitectura y entrenamiento

El modelo es una red neuronal recurrente de tipo GRU con dos capas y dropout de 0.1, con un presupuesto de 1 millon de parametros. Se entrena con un esquema de "joint training" (receta e) sobre un conjunto heterogeneo de bases de datos de plasmas de tokamak: datos experimentales de FAIR-MAST (UKAEA), la base de datos internacional HDB5 de confinamiento H-mode, la base de perfiles multi-tokamak PR08 del ITPA, la base de limite de densidad de Alcator C-Mod, la base de transicion L-H de TCV, escenarios de STEP (OpenSTEP SPP-001) y la descarga de referencia de SPARC, ademas de tablas de flujos de QuaLiKiz (QLKNN10D y QLKNN11D) y descripciones de maquina de ITER, MAST Upgrade, SPARC y STEP.

El checkpoint `final.pt` corresponde a la configuracion de indice 22 de las 30 exploradas en la busqueda de hiperparametros, seleccionada por la regla de seleccion del autor (cuyas puntuaciones se recogen en `selection.json`). Los ficheros `seed_1.pt` y `seed_2.pt` reentrenan esa misma configuracion con semillas distintas. El entrenamiento incluye un warmup de 4000 pasos. No se detalla en la informacion disponible el numero total de tokens o pasos de entrenamiento, la composicion exacta del dataset ni si se aplico RLHF/DPO (no procede en un modelo de regresion de series temporales).

## Capacidades

- Prediccion de la evolucion temporal de variables de plasma en tokamaks (modelo del mundo para dinamica de plasma).
- Modelado conjunto de datos de multiples maquinas y regimenes (H-mode, transicion L-H, limite de densidad, escenarios de reactores).
- Generalizacion entre tokamaks de distintos disenos (ITER, MAST Upgrade, SPARC, STEP) gracias al entrenamiento conjunto.
- Reentrenamiento reproducible con distintas semillas (`seed_1.pt`, `seed_2.pt`).
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso.
- No tiene capacidades multilingues, vision, audio ni modo "thinking".
- No es un modelo generativo de texto: su salida son series temporales de magnitudes fisicas.

## Casos de uso

- Prediccion de la evolucion de perfiles de plasma en tiempo de descarga: el modelo puede usarse para anticipar la trayectoria de variables de confinamiento a partir de un estado inicial y una secuencia de actuaciones, util para control predictivo en experimentos de tokamak.
- Estudio de la transicion L-H: al haberse entrenado con la base de TCV, permite analizar condiciones de disparo de la transicion en escenarios simulados y comparar con datos experimentales.
- Evaluacion del limite de densidad: con datos de Alcator C-Mod, sirve para explorar regimenes cercanos al limite operativo y estudiar su dependencia de parametros de maquina.
- Prototipado de estrategias de control en SPARC y STEP: el modelo incorpora descripciones de maquina de ambos reactores, por lo que puede emplearse como entorno surrogate barato para probar politicas de control antes de experimentos reales.
- Benchmarking de modelos del mundo de plasma: al ser un checkpoint reproducible con semillas y configuracion publicadas, sirve como linea base para comparar arquitecturas (GRU frente a transformers o SSM) en la misma tarea.
- Analisis de sensibilidad y estudios de incertidumbre: el reentrenamiento con semillas distintas permite estimar la varianza del modelo frente a perturbaciones de los datos de entrada.
- Docencia e investigacion en fusion: modelo ligero (1 M de parametros) que cabe en cualquier portatil y permite reproducir resultados del paper asociado sin infraestructura de GPU.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB (1 M de parametros; los pesos ocupan unos pocos MB en precision FP32).
- GPU recomendadas: cualquiera; no requiere GPU dedicada. Funciona en CPU sin problema.
- Cabe en cualquier GPU consumer (RTX 3060, RTX 4090, integradas) y en portatiles sin GPU dedicada.
- Opciones de despliegue: PyTorch nativo (carga directa de los `.pt`); no hay soporte declarado para vLLM, llama.cpp, Ollama ni TGI, que no aplican a un modelo de series temporales.
- Latencia y throughput: no disponibles en la informacion proporcionada; por el tamano del modelo, la latencia por paso deberia ser del orden de microsegundos a milisegundos en CPU, pero no se confirma con datos.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| gru-dw_1m_e-joint | 1 M | no disponible | World model de plasma (tokamak) | CC BY-SA 4.0 | Hugging Face (`.pt`) |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de informacion sobre modelos comparables de la misma categoria en la documentacion proporcionada.

## Limitaciones y advertencias

- Modelo altamente especializado: no es util para NLP, codigo, agentes ni tareas genericas; su dominio se limita a la dinamica de plasmas de tokamak.
- Licencia CC BY-SA 4.0: permite uso comercial, pero obliga a atribucion y a compartir bajo la misma licencia las obras derivadas; ademas hereda las obligaciones de atribucion de las fuentes de datos (FAIR-MAST, HDB5, PR08, SPARC, STEP, etc.), que deben citarse explicitamente.
- Riesgo de extrapolacion: al entrenarse con datos de maquinas y regimenes concretos, las predicciones fuera del dominio cubierto (nuevos tokamaks, regimenes no representados) pueden ser poco fiables.
- Sin informacion sobre sesgos especificos, pero la cobertura desigual de las bases de datos puede introducir sesgos hacia los regimenes mejor representados (H-mode, maquinas occidentales).
- No hay pesos en formatos estandar de despliegue (GGUF, safetensors); requiere el codigo de entrenamiento o un adaptador para cargar los `.pt`.
- El repositorio tiene 0 descargas y 0 likes, y no se ha validado de forma independiente en el momento de la consulta; usarlo en produccion requiere validacion propia.
- No se especifica la longitud de contexto ni la ventana temporal de prediccion, lo que limita su uso en horizontes largos sin analisis previo.

## Enlaces

- Hugging Face: https://huggingface.co/fusion-world-model/gru-dw_1m_e-joint
- Checkpoint del paper (tag `paper`, commit `0c3d46bdbe0888d6c48ca3428e1cc52fb3e2ef60`): https://huggingface.co/fusion-world-model/gru-dw_1m_e-joint/tree/paper
- FAIR-MAST (UKAEA): doi:10.1109/TPS.2025.3583419 y doi:10.1016/j.softx.2024.101869
- HDB5 (International Global H-Mode Confinement Database): doi:10.1088/1741-4326/abdb91
- PR08 (ITPA profile database): doi:10.1088/0029-5515/48/12/125001
- Open Density Limit Database (Alcator C-Mod): https://github.com/MIT-PSFC/open_density_limit_database
- TCV L-H transition database: doi:10.5281/zenodo.14996664 y doi:10.1088/1361-6587/adc8ce
- OpenSTEP (STEP SPP-001): doi:10.14468/07jt-s540
- SPARC (Commonwealth Fusion Systems): doi:10.1017/S0022377820001257 (Creely et al., J. Plasma Phys. 86, 865860502)
- QLKNN10D: doi:10.5281/zenodo.3497066
- QLKNN11D: doi:10.5281/zenodo.8017522
- QLKNN paper: doi:10.1063/1.5134126
