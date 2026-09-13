# MakWaiGong/MoRE

## Resumen

MoRE (MHC-peptide binding pRediction Engine) es un framework de *deep learning* orientado a la prediccion de interacciones de union entre peptidos y moleculas del complejo mayor de histocompatibilidad (MHC). El repositorio, publicado por el autor MakWaiGong en Hugging Face y con codigo de referencia en GitHub, no contiene un modelo de lenguaje generativo, sino una coleccion de modelos y datasets para tareas de inmunoinformatica. Se organiza en cuatro componentes independientes: PPI-activity (prediccion de actividad de union MHC clase I y clase II), PPI-site (prediccion del sitio de union peptido-MHC, con modelos basados en ESM-2), pHLA (prediccion de union peptido-HLA) y pMHC-TCR (prediccion de union entre complejos pMHC y receptores de celulas T).

El repositorio ocupa 46,1 GB e incluye tanto codigo fuente como datasets en CSV (por ejemplo, `tcr.csv` con 728 MB) y pesos entrenados en formato PyTorch `.pth`. Los modelos de PPI-activity, pHLA y pMHC-TCR son comparativamente ligeros (entre 131 MB y 132 MB por fichero), mientras que los modelos de PPI-site son mucho mayores: cuatro ficheros de entre 10,60 GB y 10,79 GB que, por el limite de 5 GB por archivo de Hugging Face, se distribuyen troceados en tres partes comprimidas que deben reensamblarse con `cat` o con el script `scripts/merge_chunks.sh`.

La relevancia del proyecto radica en su ambito de aplicacion: la prediccion fiable de union peptido-MHC es una pieza central en el diseno de vacunas personalizadas contra el cancer, en la priorizacion de neoantigenos y en el desarrollo de terapias con celulas T. Sin embargo, la informacion publicada es muy escasa en cuanto a arquitectura detallada, datos de entrenamiento, licencia y resultados de evaluacion: el *model card* se limita practicamente a instrucciones de descarga y a la estructura de directorios, y no incluye metricas ni comparaciones con el estado del arte.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelos basados en ESM-2 para el componente PPI-site; la arquitectura del resto de componentes (PPI-activity, pHLA, pMHC-TCR) no esta especificada en la informacion disponible |
| Parametros totales | no disponible (los ficheros de pesos mayores ocupan 10,60-10,79 GB; si se almacenan en fp32, equivaldria a del orden de 2.700 millones de parametros, pero el autor no lo confirma) |
| Parametros activos | no aplicable (no se describe una arquitectura MoE) |
| Longitud de contexto | no aplicable (no es un modelo generativo de secuencias; procesa peptidos y secuencias proteicas de longitud fija segun la tarea) |
| Tipos de cuantizacion | no disponible; los pesos se distribuyen en formato `.pth` sin versiones cuantizadas |
| Idiomas soportados | no disponible; el dominio de aplicacion es secuencias biologicas (aminoacidos), no texto natural |
| Licencia | no disponible |
| Formato de pesos | PyTorch `.pth` (los ficheros de mas de 5 GB, troceados en partes `.part_aa/ab/ac` que deben reensamblarse) |
| Tamano del repositorio | 46,1 GB |
| Componentes | PPI-activity, PPI-site, pHLA, pMHC-TCR |
| Datos incluidos | CSV de entrenamiento y test; `pMHC-TCR/data/tcr.csv` de 728 MB |

## Arquitectura y entrenamiento

La informacion disponible solo permite confirmar que el componente PPI-site, encargado de predecir el sitio de union peptido-MHC, esta basado en ESM-2, el modelo de lenguaje de proteinas de Meta. El repositorio distingue tres variantes de pesos para esta tarea: `more/` (10,79 GB), `esm_plain/` (10,63 GB) y `linear/` (10,60 GB), lo que sugiere una comparacion experimental entre una variante propia (`more`), una version basada directamente en ESM-2 sin ajuste adicional (`esm_plain`) y un modelo lineal de referencia. El nombre `best_pretrain_model.pth` dentro de `more/` apunta a un esquema de preentrenamiento seguido de ajuste fino, aunque no se detalla ni el numero de tokens, ni la composicion del dataset, ni si se emplearon tecnicas de alineacion como RLHF o DPO.

Para el resto de componentes (PPI-activity, pHLA y pMHC-TCR) no se especifica la arquitectura, el proceso de entrenamiento ni la procedencia de los datos, mas alla de la presencia de directorios `data/`, `src/` y `result/` con pesos de aproximadamente 131-132 MB. Los datasets se distribuyen en formato CSV, lo que facilita la reproducibilidad del entrenamiento si el usuario dispone del codigo, pero no hay ninguna descripcion publicada de las innovaciones tecnicas, el preprocesado o las estrategias de validacion empleadas.

## Capacidades

- Prediccion de actividad de union entre peptidos y moleculas MHC de clase I y clase II (componente PPI-activity).
- Prediccion del sitio de union peptido-MHC a nivel de residuo, mediante modelos basados en ESM-2 (componente PPI-site).
- Prediccion de union peptido-HLA (componente pHLA).
- Prediccion de union entre complejos pMHC y receptores de celulas T (componente pMHC-TCR).
- Uso de representaciones de proteinas preentrenadas (ESM-2) como base para tareas de prediccion estructurada.
- Soporte de *tool calling* / *function calling*: no disponible (no es un modelo de lenguaje).
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no aplicable.
- Capacidades especiales (modo *thinking*, vision, audio): no disponible.

## Casos de uso

- Priorizacion de neoantigenos en vacunas personalizadas contra el cancer: los componentes PPI-activity y pHLA permiten puntuar peptidos derivados de mutaciones tumorales segun su probabilidad de union a los alelos HLA del paciente, lo que ayuda a seleccionar los candidatos mas inmunogenicos antes de la sintesis y validacion experimental.
- Diseno de vacunas contra patogenos: el modelo puede cribar bibliotecas de peptidos derivados de proteinas virales o bacterianas frente a un panel de alelos MHC de clase I y II, reduciendo el numero de candidatos que se llevan a ensayos de tetramero o ELISPOT.
- Mapeo de epitopos a resolucion de residuo: el componente PPI-site, basado en ESM-2, predice que posiciones del peptido y del surco MHC contribuyen a la union, informacion util para el diseno racional de peptidos modificados con mayor afinidad.
- Analisis de datos de inmunopeptidomica: los modelos pueden usarse para puntuar las listas de peptidos eluidos obtenidas por espectrometria de masas y discriminar entre ligandos reales y falsos positivos, complementando los motores de busqueda de espectros.
- Evaluacion de reactividad cruzada en terapias con celulas T: el componente pMHC-TCR permite estimar la union entre un TCR concreto y distintos complejos pMHC, lo que resulta relevante para descartar reacciones cruzadas indeseadas antes de avanzar en el desarrollo de terapias adoptivas.
- Estudios de autoinmunidad y asociacion HLA-enfermedad: la prediccion de union a alelos de clase II (incluidos los del sistema HLA-DQ y HLA-DR) permite explorar que peptidos propios o exogenos podrian presentarse de forma diferencial segun el genotipo HLA del individuo.
- Filtrado previo en pipelines de diseno de peptidos terapeuticos: integrado como paso de cribado computacional antes de simulaciones de dinamica molecular o de ensayos de afinidad in vitro, con el objetivo de descartar candidatos con baja probabilidad de union.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El *model card* del autor no incluye metricas de AUC, precision, recall ni comparaciones con otras herramientas del dominio (por ejemplo, NetMHCpan o MHCflurry), y los resultados de busqueda web proporcionados no contienen informacion relevante sobre este modelo.

## Requisitos de hardware

- VRAM estimada para los modelos grandes de PPI-site: los ficheros de pesos ocupan entre 10,60 GB y 10,79 GB. Si se cargan en fp32, la inferencia requiere aproximadamente 11 GB solo para los pesos, mas el espacio para activaciones y entradas, por lo que se recomienda un minimo de 16 GB de VRAM.
- VRAM estimada para los modelos pequenos (PPI-activity, pHLA, pMHC-TCR): aproximadamente 131-132 MB por fichero, por lo que son viables en cualquier GPU con 4 GB o mas, e incluso en CPU para lotes pequenos.
- GPU recomendadas: para los modelos grandes, NVIDIA A100 (40/80 GB), H100 o RTX 4090 (24 GB) si el consumo de memoria se mantiene contenido y se procesan lotes pequenos; para los modelos pequenos, cualquier GPU consumer reciente.
- Compatibilidad con GPU de consumo: los modelos de 131-132 MB caben en cualquier GPU consumer; los modelos de ~10,8 GB podrian caber en una RTX 4090 o RTX 3090 (24 GB) con lotes reducidos, aunque no hay confirmacion por parte del autor.
- Opciones de despliegue: inferencia mediante PyTorch y los scripts incluidos en `src/` de cada componente; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, dado que no se trata de un modelo de lenguaje generativo.
- Nota operativa: es imprescindible reensamblar los ficheros troceados con `cat` o con `bash scripts/merge_chunks.sh` antes de cargar los modelos grandes.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

La informacion proporcionada no incluye datos de rendimiento, licencia ni especificaciones de herramientas comparables del mismo dominio, por lo que no es posible elaborar una comparativa cuantitativa. Las alternativas habituales en prediccion de union peptido-MHC (NetMHCpan, MHCflurry, BigMHC, entre otras) no aparecen mencionadas en el *model card* ni en los resultados de busqueda, y sus valores de parametros, contexto y rendimiento figuran como no disponibles en el material consultado.

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| MoRE | no disponible (~10,8 GB en los ficheros mayores) | no aplicable | no disponible | no disponible | Hugging Face y GitHub |
| NetMHCpan | no disponible | no aplicable | no disponible | no disponible | no disponible |
| MHCflurry | no disponible | no aplicable | no disponible | no disponible | no disponible |
| BigMHC | no disponible | no aplicable | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Ausencia total de metricas de evaluacion publicadas: no es posible verificar la calidad de las predicciones ni compararlas con el estado del arte.
- Licencia no declarada: al no especificarse una licencia en Hugging Face, no hay autorizacion explicita para uso comercial ni para redistribucion de los pesos o los datasets.
- Informacion de arquitectura incompleta: solo se confirma el uso de ESM-2 en el componente PPI-site; el resto de componentes carece de descripcion tecnica.
- Riesgo de sobreajuste a los alelos HLA presentes en los datos de entrenamiento: los alelos poco representados o ausentes pueden producir predicciones poco fiables. No se publica informacion sobre la cobertura alélica.
- Sesgo de origen de datos: los datasets proceden de repositorios publicos de inmunopeptidomica, habitualmente sesgados hacia alelos comunes en poblaciones europeas, lo que puede reducir la equidad en el contexto de otras poblaciones.
- Riesgo de falsos positivos y falsos negativos: como todo predictor de union, sus salidas deben validarse experimentalmente antes de cualquier aplicacion clinica o de desarrollo de vacunas.
- Restricciones practicas de uso: los modelos grandes requieren reensamblar ficheros troceados y disponer de ~11 GB de almacenamiento adicional por cada uno, lo que complica su despliegue en entornos con espacio limitado.
- Idiomas soportados: no aplicable, al trabajar con secuencias de aminoacidos y no con texto natural.
- Caveat de fecha: el repositorio se creo en marzo de 2026 y se actualizo en septiembre de 2026 segun los metadatos, pero no hay historial de versiones ni notas de cambios publicadas.
- Resultados de busqueda web no relevantes: las consultas devolvieron unicamente enlaces sobre ChatGPT, Reddit y foros sin relacion con el modelo, por lo que no se ha podido contrastar informacion adicional.

## Enlaces

- Hugging Face: https://huggingface.co/MakWaiGong/MoRE
- GitHub (referenciado en la cita del autor): https://github.com/MakWaiGong/MoRE
- Documentacion de la CLI de Hugging Face: https://huggingface.co/docs/huggingface_hub
- No se han encontrado papers, blogs, demos ni repositorios adicionales en los resultados de busqueda web proporcionados.
