# fusion-world-model/gru_10m_d-sim-to-shots

## Resumen

`gru_10m_d-sim-to-shots` es un modelo del mundo (world model) neuronal para plasmas de tokamak, publicado por la organizacion `fusion-world-model` en Hugging Face. No es un modelo de lenguaje: es un modelo de series temporales que aprende la dinamica de un plasma de fusion y se utiliza como entorno sustituto ("surrogate") para entrenar controladores de politicas de control del plasma mediante aprendizaje por refuerzo. El checkpoint publicado corresponde a una arquitectura GRU con un presupuesto de 10 millones de parametros y a la receta identificada como "(d) simulador pre-training, then shots": preentrenamiento sobre datos de simulador seguido de ajuste fino con datos de descargas reales.

El modelo es relevante porque permite entrenar controladores de plasma sin necesidad de acceso continuo a un tokamak real ni a costosas simulaciones de primer principio en cada paso de entrenamiento. El repositorio incluye, ademas del checkpoint principal (`final.pt`), las semillas alternativas del mismo configurado, el registro de seleccion de hiperparametros y los controladores de la Evaluacion 4 entrenados dentro del modelo del mundo con una receta PPO congelada.

La ficha se basa exclusivamente en la informacion de la model card y de los metadatos de Hugging Face. Dado que el modelo no es un LLM, varias de las filas de la tabla de especificaciones estandar (contexto, cuantizacion, idiomas) no aplican y se indican como "no disponible" o "no aplica".

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GRU (recurrente, redes neuronales) |
| Parametros totales | 10 M (presupuesto de parametros declarado) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo de series temporales; no se declara ventana) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no aplica (modelo de series temporales de plasma) |
| Licencia | CC BY-SA 4.0 |
| Formato de pesos | PyTorch (`.pt`), guardados por el codigo de entrenamiento |
| Tamano del repo | 0,3 GB |
| Libreria | pytorch |
| Dominio | tokamak, fusion, world-model, time-series |
| Pipeline de Hugging Face | no disponible |

## Arquitectura y entrenamiento

La arquitectura es una red recurrente de tipo GRU con un presupuesto de 10 millones de parametros. La model card indica que el checkpoint del paper usa la configuracion ganadora del diseno piloto del GRU: 2 capas, dropout 0,1 y un calentamiento (warmup) de 4000 pasos. El modelo se selecciono entre 20 configuraciones entrenadas por una busqueda de hiperparametros; `final.pt` corresponde a la configuracion de indice 10, la mejor clasificada por la regla de seleccion de la busqueda (registrada en `selection.json`). Las semillas `seed_1.pt` y `seed_2.pt` son la misma configuracion reentrenada con otra semilla de entrenamiento.

La receta de entrenamiento es "(d) simulador pre-training, then shots": un preentrenamiento sobre datos de simulador seguido de un ajuste fino con datos de descargas (shots) reales. La model card no detalla el numero de tokens, la composicion exacta del dataset ni si se empleo RLHF/DPO; indica unicamente que los datos pueden descansar sobre las fuentes acreditadas en la seccion de atribucion (FAIR-MAST, HDB5, PR08, Open Density Limit Database, TCV L-H, OpenSTEP, SPARCPublic, QLKNN10D/11D y descripciones de maquinas ITER, MAST-U, SPARC y STEP). El repositorio incluye tambien un checkpoint `finetune_fixed/final.pt` cuya etapa de ajuste fino uso una tasa de aprendizaje fija en lugar de una fraccion de la buscada; `final.pt` lo reemplaza como eleccion final.

## Capacidades

- Modelado de la dinamica temporal de plasmas de tokamak como modelo del mundo (prediccion de la evolucion del estado del plasma).
- Preentrenamiento sobre simulador y ajuste fino sobre descargas reales, lo que permite su uso como entorno sustituto para aprendizaje por refuerzo.
- Servir de entorno para entrenar controladores de politica (el repositorio incluye controladores de la Evaluacion 4 entrenados con una receta PPO congelada, uno por tarea y semilla).
- Reproducibilidad: incluye multiples semillas, registro de seleccion de hiperparametros y manifiesto con SHA-256 de cada archivo.
- No se declaran capacidades de generacion de texto, codigo, matematicas, vision, audio, tool calling ni agentes; no aplica a este modelo.

## Casos de uso

- Entrenamiento de controladores de plasma por refuerzo: usar el modelo del mundo como entorno sustituto para que un agente PPO aprenda politicas de control sin necesidad de interactuar con un tokamak real en cada episodio.
- Evaluacion comparativa de politicas de control: los controladores incluidos en `e4/` permiten reproducir la Evaluacion 4 y comparar recetas de entrenamiento dentro de un mismo modelo del mundo congelado.
- Estudio de recetas de preentrenamiento simulador-a-real: la receta "(d)" y el checkpoint `finetune_fixed/final.pt` permiten analizar el efecto de la tasa de aprendizaje en la etapa de ajuste fino sobre descargas reales.
- Analisis de sensibilidad a semillas: `seed_1.pt` y `seed_2.pt` permiten medir la varianza del entrenamiento y de las politicas resultantes.
- Investigacion en modelado de series temporales de fusion: el modelo puede emplearse como base para experimentos de prediccion de la evolucion del plasma en tokamaks como ITER, MAST-U, SPARC o STEP, cuyas descripciones de maquina figuran entre las fuentes de datos.
- Reproducibilidad de resultados: el manifiesto con SHA-256 y las revisiones etiquetadas (`release-2026.11.13rc2`, entre otras) permiten reconstruir exactamente el checkpoint usado en el paper.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la model card; con 10 M de parametros el checkpoint es muy pequeno (repo de 0,3 GB, que incluye varios checkpoints y controladores), por lo que en la practica cabria en cualquier GPU consumer moderna, aunque no se proporcionan cifras oficiales.
- GPU recomendadas: no disponible.
- Cabe en GPU consumer: previsiblemente si, dado el tamano del modelo, aunque no se confirma en la informacion.
- Opciones de despliegue: no se documentan (vLLM, llama.cpp, Ollama o TGI no aplican a este tipo de modelo; el checkpoint es un `.pt` de PyTorch cargado por el codigo de entrenamiento).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye otros modelos del mundo para plasmas de tokamak con los que comparar parametros, contexto, rendimiento o licencia.

## Limitaciones y advertencias

- Modelo de dominio especifico (plasmas de tokamak); no es un modelo de lenguaje ni un modelo generalista.
- La model card no documenta sesgos, tasas de alucinacion ni limites de contexto o idioma; estos conceptos no aplican directamente, pero tampoco se ofrece una evaluacion de errores de prediccion.
- No se declaran datos de validacion fuera de distribucion ni garantias de generalizacion a tokamaks no representados en las fuentes de entrenamiento.
- Licencia CC BY-SA 4.0: permite uso comercial con atribucion y compartir-al-igual; las obras derivadas deben distribuirse bajo la misma licencia.
- Obligaciones de atribucion adicionales: la model card exige citar multiples fuentes de datos (FAIR-MAST, HDB5, PR08, Open Density Limit Database, TCV L-H, OpenSTEP, SPARCPublic, QLKNN10D/11D y descripciones de maquinas), algunas con condiciones especificas (por ejemplo, SPARCPublic requiere un reconocimiento textual concreto).
- `followup` es una configuracion de seguimiento fuera del espacio de busqueda y no es el checkpoint del paper; debe usarse con cautela si se busca reproducir resultados.
- El repositorio tiene muy pocas descargas y likes en el momento de la consulta, lo que limita la validacion externa por parte de la comunidad.

## Enlaces

- Hugging Face: https://huggingface.co/fusion-world-model/gru_10m_d-sim-to-shots
- Revision del paper (commit `e4e102b6bdcc424e3a3b83321d8b54d9b0890655`): https://huggingface.co/fusion-world-model/gru_10m_d-sim-to-shots/tree/release-2026.11.13rc2
- Licencia CC BY-SA 4.0: https://creativecommons.org/licenses/by-sa/4.0/
- FAIR-MAST (UKAEA): doi:10.1109/TPS.2025.3583419 y doi:10.1016/j.softx.2024.101869
- HDB5 (International Global H-Mode Confinement Database): doi:10.1088/1741-4326/abdb91
- PR08 (ITPA multi-tokamak profile database): doi:10.1088/0029-5515/48/12/125001
- Open Density Limit Database (Alcator C-Mod): https://github.com/MIT-PSFC/open_density_limit_database
- TCV L-H transition database: doi:10.5281/zenodo.14996664 y doi:10.1088/1361-6587/adc8ce
- OpenSTEP (STEP SPP-001): doi:10.14468/07jt-s540
- SPARCPublic (Commonwealth Fusion Systems): Creely et al., J. Plasma Phys. 86, 865860502 (2020)
- QLKNN10D: doi:10.5281/zenodo.3497066
- QLKNN11D: doi:10.5281/zenodo.8017522
- QLKNN (paper): doi:10.1063/1.5134126
