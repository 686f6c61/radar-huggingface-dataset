# jshmhsb/EKPT-backup

## Resumen

EKPT-backup es un repositorio de Hugging Face identificado como `jshmhsb/EKPT-backup`, publicado por el usuario jshmhsb. No es un modelo de lenguaje ni un modelo generativo al uso: se define como un archivo publico curado, una "selected release" del proyecto local EKPT, orientada a la investigacion en procesos de puntos temporales (temporal point processes) y prediccion de eventos (event forecasting). El repositorio ocupa 7,5 GB y contiene, en su primera release, el paquete de reproduccion "Moreva EasyTPP-5": scripts de las Tablas 1 y Figura 3, 15 ficheros numericos de splits de EasyTPP y 18 checkpoints Moreva "tensor-only" seleccionados.

La relevancia de este artefacto es acotada y de caracter academico. Sirve para reproducir parcialmente experimentos de prediccion de eventos sobre cinco conjuntos de datos derivados de los splits publicados de EasyTPP (con licencia Apache-2.0 en sus fichas individuales) y emplea como base preentrenada el modelo Mamba-3 SISO 187M (state space model) de state-spaces, tambien declarado Apache-2.0. El autor advierte explicitamente de que no se trata de un backup completo del proyecto EKPT y de que el propio Table 1 del paquete permanece incompleto.

El repositorio no incluye historial de Git, credenciales de ejecucion, rutas personales, datasets crudos de terceros fuera de los splits licenciados, datos no publicados de EventBench, arboles amplios de `logs/`, `tmp/` y `runs/`, checkpoints de optimizador/recuperacion ni modelos Language-TPP no revisados. La licencia declarada es "other" y el autor indica que no se concede ninguna licencia global sobre el codigo original de EKPT ni sobre los pesos derivados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Proceso de puntos temporales para prediccion de eventos; base preentrenada referenciada: Mamba-3 SISO 187M (state space model). La arquitectura concreta de los checkpoints Moreva no esta documentada en el repositorio |
| Parametros totales | No disponible. Se referencia una base de 187M (Mamba-3 SISO); no se detallan los parametros de los 18 checkpoints Moreva |
| Parametros activos | No aplica (no se describe un modelo MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible (no es un modelo de lenguaje natural; se orienta a datos de eventos/secuencias) |
| Licencia | other. No se concede licencia global sobre codigo original de EKPT ni pesos derivados. Componentes: splits EasyTPP (Apache-2.0 en sus fichas individuales) y base Mamba-3 SISO 187M (Apache-2.0) |
| Formato de pesos | Checkpoints "tensor-only"; el formato de fichero concreto no se especifica en la informacion disponible |
| Tamano del repositorio | 7,5 GB |
| Descargas / likes | 0 / 0 |
| Fecha de creacion | 2026-09-26 |
| Ultima actualizacion | 2026-09-26 |
| Pipeline declarado | No disponible |

## Arquitectura y entrenamiento

La informacion disponible no describe la arquitectura interna del modelo EKPT ni el procedimiento de entrenamiento. Lo que si se documenta es que los checkpoints incluidos parten de una base preentrenada Mamba-3 SISO 187M, un modelo de espacio de estados (SSM) de la familia Mamba, y que el paquete de reproduccion se apoya en el framework EasyTPP para la evaluacion sobre cinco conjuntos de datos numericos derivados de sus splits publicados. No se especifican el numero de tokens de entrenamiento, la composicion del dataset, ni si hubo etapas de RLHF o DPO (en el contexto de procesos de puntos temporales estos terminos no son directamente aplicables).

El material incluido en la release publica comprende los scripts asociados a la Tabla 1 y a la Figura 3 del trabajo, 15 ficheros numericos de splits de EasyTPP y 18 checkpoints Moreva seleccionados. El autor senala que la Tabla 1 sigue incompleta, que las lineas base no disponibles no se rellenan con experimentos de seis fuentes, y que FIM-PP congelado no constituye una fila de la Tabla 1 en esta copia publica. No se documenta ninguna innovacion tecnica adicional (decodificacion especulativa, attention linear, etc.) mas alla del uso de la base SSM.

## Capacidades

- Prediccion de eventos en procesos de puntos temporales (event forecasting): estimacion de la distribucion temporal del siguiente evento en una secuencia.
- Modelado de intensidad condicional en el marco de EasyTPP, sobre cinco conjuntos de datos numericos derivados de sus splits.
- Reproduccion de experimentos academicos: los scripts permiten regenerar (parcialmente) los resultados de la Tabla 1 y la Figura 3 del trabajo asociado.
- Generacion de texto, razonamiento, codigo, matematicas o vision: no aplica, el artefacto no es un modelo de lenguaje ni multimodal.
- Tool calling / function calling: no soportado (no documentado).
- Soporte de agentes y razonamiento multi-paso: no soportado (no documentado).
- Capacidades multilingues: no aplica.
- Capacidades especiales: archivado de checkpoints "tensor-only" y paquete de reproduccion basado en `uv`.

## Casos de uso

- Reproducibilidad de investigacion: un grupo de investigacion puede descargar los scripts de la Tabla 1 y la Figura 3 y los 15 splits de EasyTPP-5 para intentar reproducir los resultados reportados en el trabajo asociado a EKPT.
- Evaluacion comparativa de modelos TPP: los 18 checkpoints Moreva permiten servir como linea base frente a nuevas arquitecturas de procesos de puntos temporales en tareas de prediccion de eventos.
- Prediccion de eventos en datos de transacciones: uso del modelo como estimador de la intensidad temporal de eventos en secuencias financieras con marcas de tiempo, aprovechando el enfoque de procesos de puntos.
- Analisis de logs y fallos en sistemas: aplicacion sobre secuencias de eventos de infraestructura (por ejemplo, fallos o peticiones) para estimar cuando ocurrira el proximo evento, dado que el modelo no depende de texto sino de marcas temporales y tipos de evento.
- Modelado de procesos de Hawkes y fenomenos autoexcitados: la base Mamba-3 SISO y el marco EasyTPP permiten aproximar dinamicas de intensidad dependientes del historial de eventos en dominios como redes sociales o biologico.
- Archivado y auditoria de artefactos de investigacion: el repositorio funciona como instantanea publica curada y verificable de una parte del proyecto EKPT, util para conservar checkpoints y splits con sus ficheros de licencia y NOTICE.
- Punto de partida para fine-tuning sobre EasyTPP-5: los checkpoints "tensor-only" pueden reutilizarse como inicializacion en experimentos nuevos que empleen los mismos splits numericos.

En todos los casos citados, el uso es de investigacion y requiere verificar la licencia y la procedencia de cada componente antes de un despliegue en produccion, algo que este repositorio no garantiza.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor indica que la Tabla 1 del paquete de reproduccion permanece incompleta y que las lineas base no disponibles no se completan en esta copia publica, por lo que no se ofrecen cifras agregadas de rendimiento. La busqueda web realizada no devolvio resultados relacionados con el modelo.

## Requisitos de hardware

- VRAM de inferencia: no disponible para los checkpoints concretos. Como referencia orientativa, una base de 187M de parametros en precision FP16 ocupa aproximadamente 0,4 GB de pesos, pero este dato corresponde a la base Mamba-3 SISO referenciada y no esta confirmado para los 18 checkpoints Moreva.
- GPU recomendadas: no disponible. No se especifican requisitos de hardware en la informacion proporcionada.
- Ejecucion en GPU de consumo: no confirmado. Por el tamano de la base referenciada (187M) podria caber en GPUs de consumo, pero no hay datos que lo verifiquen para los checkpoints del repositorio.
- Opciones de despliegue: no documentadas. El paquete de reproduccion se describe como basado en `uv`; no se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput estimados: no disponible.
- Almacenamiento: el repositorio ocupa 7,5 GB, por lo que se requiere ese espacio en disco para descargarlo completo.

## Comparativa con modelos similares

No hay datos de benchmarks ni especificaciones de los checkpoints que permitan una comparacion cuantitativa. A continuacion se comparan, de forma cualitativa y con los datos disponibles, el marco de origen y la base preentrenada referenciada.

| Aspecto | EKPT-backup (Moreva / EasyTPP-5) | EasyTPP (marco de referencia) | Mamba-3 SISO 187M (base preentrenada) |
|---|---|---|---|
| Categoria | Archivo de checkpoints y scripts de TPP | Framework y datasets de TPP | Modelo de espacio de estados (SSM) |
| Parametros | No disponible | No aplica (framework) | 187M |
| Contexto | No disponible | No disponible | No disponible |
| Licencia | other (sin licencia global) | Apache-2.0 en las fichas de los datasets | Apache-2.0 |
| Disponibilidad | Hugging Face, 0 descargas, 0 likes | Repositorio publico en GitHub | Hugging Face |
| Rendimiento | Sin datos publicados | No aplica | No disponible en esta ficha |

No se dispone de informacion suficiente para comparar con otros modelos de prediccion de eventos de terceros.

## Limitaciones y advertencias

- Alcance limitado: el propio autor aclara que el repositorio es una "selected release" publica y no un backup completo del proyecto EKPT. No debe usarse su existencia para borrar ficheros locales.
- Resultados incompletos: la Tabla 1 del paquete de reproduccion esta incompleta y FIM-PP congelado no aparece como fila en esta copia publica.
- Contenido excluido: no se incluyen historial de Git, credenciales, rutas personales absolutas, datasets crudos de terceros fuera de los splits licenciados, datos no publicados de EventBench, arboles amplios de `logs/`, `tmp/` y `runs/`, checkpoints de optimizador/recuperacion ni modelos Language-TPP no revisados.
- Licencia: la licencia declarada es "other" y no se concede una licencia global sobre el codigo original de EKPT ni sobre los pesos derivados. El uso comercial queda sin garantia explicita. Los componentes de terceros (splits EasyTPP y base Mamba-3) se rigen por Apache-2.0, con sus ficheros de licencia y NOTICE incluidos.
- Ausencia de benchmarks: no hay cifras verificables de MMLU, HumanEval, GSM8K ni de metricas propias de TPP (por ejemplo, NLL o tiempo de llegada), por lo que no es posible evaluar su calidad predictiva a partir de esta informacion.
- Idiomas y contexto: no se documentan idiomas soportados ni longitud de contexto; el artefacto no esta pensado para tareas de lenguaje natural.
- Riesgo de alucinacion: no aplica en el sentido habitual de los modelos generativos de texto. Al tratarse de un modelo de prediccion de eventos, el riesgo relevante es la calibracion incorrecta de la intensidad y la extrapolacion fuera de la distribucion de los datos de entrenamiento.
- Sesgos: no se documentan analisis de sesgo ni evaluaciones de equidad sobre los splits empleados.
- Estado del repositorio: 0 descargas y 0 likes, creado y actualizado el mismo dia (2026-09-26), sin mantenimiento posterior documentado.
- Busqueda web: los resultados de la busqueda realizada no guardan relacion con el modelo (corresponden a contenido de tipo comic/webtoon) y no aportan informacion tecnica.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/jshmhsb/EKPT-backup
- Splits publicados de EasyTPP (documentacion de datasets): https://github.com/ant-research/EasyTemporalPointProcess/blob/main/docs/source/user_guide/dataset.rst
- Base preentrenada Mamba-3 SISO 187M: https://huggingface.co/state-spaces/mamba3-siso-187m
- Paper, blog, repositorio o demo del proyecto EKPT: no disponibles en la informacion proporcionada.
- Resultados de busqueda web relevantes: no disponibles (la busqueda no devolvio resultados relacionados con el modelo).
