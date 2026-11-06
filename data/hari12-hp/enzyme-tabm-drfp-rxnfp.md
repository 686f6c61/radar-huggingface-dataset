# hari12-hp/enzyme-tabm-drfp-rxnfp

## Resumen

`enzyme-tabm-drfp-rxnfp` es un artefacto de inferencia publicado por el usuario hari12-hp en Hugging Face, orientado a una tarea muy concreta de bioinformatica: la prediccion de la clase enzimatica EC nivel 4 (EC L4) a partir de la representacion SMILES de una reaccion quimica. No se trata de un modelo de lenguaje generativo ni de un transformer de proposito general, sino de un pipeline de recuperacion/clasificacion que combina descriptores de reaccion (DRFP, *Differential Reaction Fingerprints*) con embeddings preentrenados de reacciones (RXNFP) y un clasificador tabular basado en arquitectura TabM.

La relevancia del artefacto es acotada pero practica: empaqueta en un unico repositorio un checkpoint principal (`deep__tabm__s42.best.pt`) y un checkpoint de respaldo (`drfp__mlp__s42.best.pt`), junto con instrucciones de ejecucion via `predict.py` sobre ficheros Parquet de entrada y salida en JSONL. El diseno contempla inferencia en CPU y un mecanismo de *fallback* a DRFP-only en caso de timeout, lo que sugiere un escenario de despliegue con restricciones de latencia o de recursos.

El repositorio es de tamano practicamente nulo (0.0 GB reportados) y no cuenta con descargas ni *likes* en el momento de la consulta. La model card es muy escueta: no declara licencia, idiomas, pipeline ni resultados oficiales de evaluacion, y el propio autor advierte que solo se han medido puntuaciones de desarrollo y que la precision en el *leaderboard* oficial y el tiempo de CPU estan pendientes de verificacion. Cualquier uso en produccion debe por tanto tratarse con cautela y validarse de forma independiente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Clasificador tabular TabM sobre descriptores de reaccion (DRFP) y embeddings RXNFP; *fallback* MLP sobre DRFP |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (no es un modelo de lenguaje) |
| Tipos de cuantizacion | no disponible (checkpoints PyTorch `.pt`) |
| Idiomas soportados | no disponible (entrada: SMILES de reaccion; salida: etiqueta EC L4) |
| Licencia | no disponible |
| Formato de pesos | PyTorch (`deep__tabm__s42.best.pt`, `drfp__mlp__s42.best.pt`) |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna mas alla de los nombres de los checkpoints. El checkpoint principal se etiqueta como `deep__tabm__s42.best.pt`, lo que sugiere una variante profunda de TabM (un modelo tabular basado en *ensembling* de MLPs con parametros compartidos, segun la literatura de TabM) aplicada sobre un vector de caracteristicas que combina DRFP y RXNFP. El checkpoint de respaldo, `drfp__mlp__s42.best.pt`, corresponde a un perceptron multicapa entrenado unicamente con DRFP. El sufijo `s42` apunta a una semilla fija (42) en el entrenamiento.

El pipeline de inferencia descrito emplea DRFP calculado en CPU junto con un RXNFP preentrenado empaquetado en el repositorio, con un mecanismo de degradacion a DRFP-only si se supera un umbral de tiempo. No se especifican el numero de tokens de entrenamiento, la composicion del dataset, ni si se aplicaron tecnicas de RLHF/DPO (lo cual es esperable que no, dado que no es un modelo generativo). Tampoco se documenta el conjunto de datos de reacciones (posiblemente derivado de Rhea o de bases tipo BRENDA/ENZYME) ni el protocolo de particion train/valid/test.

## Capacidades

- Prediccion de la clase enzimatica EC nivel 4 (una unica etiqueta oficial) a partir de una reaccion expresada en SMILES.
- Extraccion de caracteristicas de reaccion mediante DRFP (fingerprints diferenciales) y RXNFP (embeddings preentrenados de reacciones).
- Clasificacion tabular con TabM como modelo principal y MLP como respaldo.
- Inferencia en CPU, con DRFP calculado en CPU y RXNFP empaquetado.
- Ejecucion por lotes sobre ficheros Parquet, con salida en JSONL.
- Mecanismo de *timeout* con degradacion controlada a DRFP-only.
- No soporta *tool calling*, agentes, razonamiento multi-paso, vision, audio ni generacion de texto: es un clasificador de dominio especifico.

## Casos de uso

- Anotacion automatica de reacciones en bases de datos metabolicas: dado un conjunto de reacciones en SMILES, el modelo asigna una etiqueta EC L4 que puede usarse como candidata para curación manual en bases como Rhea o MetaCyc.
- Priorizacion en pipelines de descubrimiento enzimatico: filtrar rapidamente reacciones candidatas por clase EC antes de aplicar metodos mas costosos (docking, dinamica molecular o modelos generativos de diseno de enzimas).
- Enriquecimiento de datasets de entrenamiento: generar etiquetas EC L4 para reacciones no anotadas y ampliar corpus destinados a entrenar modelos de recuperacion o generacion de enzimas.
- Integracion en flujos bioinformaticos por lotes: el formato Parquet de entrada y JSONL de salida facilita su inclusion en pipelines tipo Snakemake o Nextflow sobre CPU, sin necesidad de GPU.
- Analisis de rutas metabolicas: clasificar las reacciones de una ruta reconstruida para detectar pasos con clases EC inesperadas o inconsistentes.
- Prototipado y evaluacion de descriptores: servir como *baseline* reproducible (semilla 42, checkpoints fijos) para comparar DRFP frente a RXNFP u otras representaciones de reacciones en tareas de recuperacion enzimatica.
- Despliegue con restricciones de latencia: el *fallback* a DRFP-only permite mantener el servicio operativo cuando el calculo de RXNFP excede el tiempo disponible.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente que solo se midieron puntuaciones de desarrollo y que la precision en el *leaderboard* oficial y el tiempo de CPU estan pendientes de verificacion.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el pipeline esta disenado para ejecutarse en CPU.
- GPU recomendadas: no disponible; no se documenta soporte GPU ni requisitos de aceleracion.
- Compatibilidad con GPU de consumo: no disponible; el diseno declarado es CPU-first.
- Opciones de despliegue: script `predict.py` incluido en el repositorio (`python /app/predict.py --input /path/to/data.parquet --output /path/to/predictions.jsonl`); no se documenta integracion con vLLM, llama.cpp, Ollama ni TGI (no aplicables a este tipo de modelo).
- Latencia y throughput: no disponibles; el autor senala que el tiempo de CPU esta pendiente de verificacion y que existe un *timeout* que activa el *fallback* DRFP-only.

## Comparativa con modelos similares

| Modelo | Tipo | Entrada | Salida | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `hari12-hp/enzyme-tabm-drfp-rxnfp` | TabM + DRFP/RXNFP | SMILES de reaccion | Etiqueta EC L4 | no disponible | Hugging Face |
| `cthoyt/rhea-fingerprints` | Generacion de DRFP sobre Rhea | Reacciones Rhea | Fingerprints diferenciales | no disponible | GitHub |
| Modelos generativos de diseno de enzimas (familia descrita en Emergent Mind) | Transformer / graph networks / diffusion | Secuencias y estructuras | Secuencias o estructuras de enzima | no disponible | Literatura y repos varios |

La comparacion directa con alternativas de la misma categoria (clasificadores de reacciones a clase EC) no esta disponible en la informacion proporcionada. `rhea-fingerprints` no es un clasificador sino una herramienta de generacion de descriptores, por lo que la comparacion es solo de componente. Los modelos generativos de diseno de enzimas resuelven una tarea distinta (generacion de secuencias/estructuras) y no son sustitutos directos.

## Limitaciones y advertencias

- Sesgos conocidos: no disponibles; no se documenta la composicion del dataset de entrenamiento ni su cobertura taxonomica o quimica.
- Riesgo de alucinacion: no aplica en el sentido generativo, pero si existe riesgo de asignacion erronea de clase EC L4 en reacciones fuera de la distribucion de entrenamiento.
- Limitaciones de contexto o idioma: no aplica contexto de lenguaje; la cobertura depende de la representacion SMILES y de la calidad del DRFP/RXNFP.
- Restricciones de licencia para uso comercial: la licencia no esta declarada, por lo que no puede asumirse permiso de uso comercial.
- El autor advierte que solo se midieron puntuaciones de desarrollo y que la precision oficial y el tiempo de CPU estan sin verificar.
- El repositorio no registra descargas ni *likes*, lo que reduce la evidencia de validacion por parte de la comunidad.
- El mecanismo de *fallback* por timeout puede degradar silenciosamente la calidad de las predicciones si no se monitoriza.
- El tamano del repositorio reportado (0.0 GB) no permite verificar que los pesos y el RXNFP empaquetado esten efectivamente incluidos.
- No se documenta versionado de dependencias, entorno de ejecucion ni reproducibilidad del entrenamiento.

## Enlaces

- Hugging Face: https://huggingface.co/hari12-hp/enzyme-tabm-drfp-rxnfp
- GitHub `cthoyt/rhea-fingerprints`: https://github.com/cthoyt/rhea-fingerprints
- Generative AI for Enzyme Design (Emergent Mind): https://www.emergentmind.com/topics/generative-ai-models-for-enzyme-design
