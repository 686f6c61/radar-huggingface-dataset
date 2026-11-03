# hari12-hp/enzyme-tfidf-logreg

## Resumen

`enzyme-tfidf-logreg` es un artefacto de participacion en el reto **Leak CURBER Enzyme Retrieval**, publicado por el usuario `hari12-hp` en Hugging Face. No es un modelo de lenguaje ni una red neuronal profunda: se trata de un pipeline clasico de recuperacion de informacion compuesto por vectorizacion **TF-IDF sobre n-gramas de caracteres** y una **regresion logistica one-vs-rest** entrenada con descenso de gradiente estocastico. Su tarea es predecir el codigo EC (Enzyme Commission) correspondiente a una reaccion enzimatica descrita por su SMILES de reaccion (`rxn_smiles`).

El repositorio contiene unicamente el codigo de entrenamiento e inferencia (`tfidf_logreg.py`, `predict.py`, `inputs.py`), el `Dockerfile`, `requirements.txt`, `task.json` y la estructura esperada por el starter oficial del concurso. El tamano del repo es de 0.0 GB, lo que indica que **no incluye pesos entrenados ni vocabulario EC**: el checkpoint `weights/tfidf_logreg.joblib` y el fichero `ec_vocabulary.json` se generan o descargan durante el entrenamiento local. Por tanto, el modelo no es directamente usable sin ejecutar el pipeline de entrenamiento sobre `train.parquet`.

Su relevancia es acotada y de nicho: sirve como linea base reproducible y ligera (CPU, 2 vCPU, 16 GB RAM, sin red) para el benchmark de anotacion enzimatica del certamen. La configuracion por defecto limita la salida a **300 etiquetas EC** (`--max-labels 300`), por lo que su cobertura de candidatos es parcial frente al vocabulario oficial de **6.939 entradas**.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | TF-IDF de n-gramas de caracteres + regresion logistica one-vs-rest (SGD) |
| Parametros totales | no disponible (depende del numero de etiquetas y del vocabulario TF-IDF generado en entrenamiento) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (no es un modelo de contexto; procesa cadenas `rxn_smiles`) |
| Tipos de cuantizacion | no aplica; pesos serializados en `joblib` |
| Idiomas soportados | no disponible (la entrada es SMILES de reaccion, no texto natural) |
| Licencia | no disponible |
| Formato de pesos | `joblib` (`weights/tfidf_logreg.joblib`) |

## Arquitectura y entrenamiento

El pipeline extrae caracteristicas mediante TF-IDF de n-gramas de caracteres sobre la representacion `rxn_smiles` de cada reaccion y entrena un clasificador de regresion logistica **one-vs-rest** con SGD, limitado por defecto a las **300 etiquetas EC** mas frecuentes o prioritarias (`--max-labels 300`). El autor indica que aumentar `--max-labels` mejora la cobertura de candidatos a costa de mayor coste de entrenamiento e inferencia. No hay transformer, atencion, capas convolucionales ni mecanismo de RLHF/DPO; es un modelo lineal sobre representaciones dispersas.

El script `tfidf_logreg.py` construye un **holdout local 80/20 agrupado por grupo de reaccion exacta con semilla 42**, imprime la metrica oficial de exactitud top-1 con credito fraccional L1-L4 del concurso y, posteriormente, reentrena sobre la totalidad de `train.parquet`. Las metricas locales se guardan en `local_results/metrics.json` y no forman parte del envio. El vocabulario EC oficial de **6.939 entradas** se copia del directorio padre si existe o se descarga del starter oficial durante el entrenamiento; el evaluador no tiene acceso a red, por lo que ambos artefactos (pesos y vocabulario) deben existir antes de subir el repositorio. La inferencia deduplica por `rxn_smiles` crudo, conserva el primer ID de entrada y emite exactamente una prediccion EC valida por linea en JSON Lines.

## Capacidades

- Clasificacion de reacciones enzimaticas a codigos EC de cuatro niveles (L1-L4) a partir de `rxn_smiles`.
- Deduplicacion de entradas por SMILES de reaccion crudo, sin canonicalizacion ni normalizacion.
- Emision de una unica etiqueta EC por instancia en formato JSON Lines con campos `id` y `prediction`.
- Ejecucion en CPU pura, sin GPU, sin red y con limites de 2 vCPU y 16 GB de RAM.
- Entrenamiento reproducible con holdout agrupado por reaccion exacta y semilla fija (42).
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, vision, audio ni modo thinking.
- No tiene capacidades multilingues en el sentido habitual: la entrada es una cadena SMILES, no lenguaje natural.

## Casos de uso

- **Linea base para el leaderboard Leak CURBER Enzyme Retrieval**: el repositorio cumple el contrato del starter oficial y permite obtener una referencia rapida de exactitud top-1 con credito fraccional L1-L4 antes de invertir en modelos mas complejos.
- **Prototipado rapido de anotacion EC**: con `--max-labels` ajustado al subconjunto de EC de interes, sirve para etiquetar lotes de reacciones y validar la calidad de los datos de entrada sin dependencias pesadas.
- **Pipeline de bajo coste en entornos restringidos**: el `Dockerfile` permite ejecutar inferencia en contenedores con `--network none`, 2 vCPU y 16 GB, adecuado para entornos air-gapped o de CI con recursos limitados.
- **Generacion de candidatos para un reranker posterior**: las probabilidades del clasificador one-vs-rest pueden usarse como señal previa para reducir el espacio de busqueda antes de aplicar un modelo mas costoso.
- **Auditoria de duplicados en datasets de reacciones**: la logica de `inputs.py` deduplica por `rxn_smiles` crudo y conserva el primer ID, util para detectar reacciones repetidas en conjuntos de validacion.
- **Docencia y experimentacion con TF-IDF + regresion logistica**: el codigo es compacto y explicito, lo que lo hace apropiado para demostrar el flujo completo de extraccion de caracteristicas, entrenamiento con SGD y evaluacion con metrica fraccional.
- **Verificacion del contrato de envio**: permite comprobar el formato exacto de salida (`id`, `prediction` como lista de un unico EC valido) y los limites de tiempo del concurso (15 minutos incluyendo pull y carga).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor indica que la exactitud local se imprime durante el entrenamiento y se guarda en `local_results/metrics.json`, pero no se proporcionan cifras en la model card ni en los metadatos del repositorio.

## Requisitos de hardware

- **VRAM**: no aplica; la inferencia es exclusivamente en CPU.
- **CPU**: el contrato del concurso especifica 2 vCPU en Linux x86-64.
- **RAM**: 16 GB segun el comando Docker oficial (`--memory 16g`).
- **GPU recomendadas**: ninguna; no se requiere A100, H100 ni RTX 4090.
- **Consumer GPU**: no aplica, el modelo no usa aceleracion grafica.
- **Opciones de despliegue**: Docker (`docker build --platform linux/amd64`) con `predict.py` como entrypoint; ejecucion directa con Python tras `pip install -r requirements.txt`.
- **Latencia y throughput**: no disponibles; el unico limite documentado es completar la inferencia en menos de 15 minutos incluyendo pull de imagen y carga del modelo.
- **Red**: no disponible en tiempo de evaluacion; el vocabulario EC y los pesos deben estar incluidos en el repositorio antes del envio.

## Comparativa con modelos similares

| Modelo | Enfoque | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `hari12-hp/enzyme-tfidf-logreg` | TF-IDF caracteres + regresion logistica one-vs-rest (SGD) | no disponible | no aplica | no disponible | Repo publico sin pesos ni vocabulario; requiere entrenamiento local |
| `starkAhmed43/leak-curber-enzyme-retrieval-starter` | Starter oficial del concurso (contrato y vocabulario EC de 6.939 entradas) | no disponible | no aplica | no disponible | Publico en Hugging Face |
| Modelos basados en transformers para prediccion EC | Encoder tipo transformer sobre SMILES | no disponible | no disponible | no disponible | No verificados en la informacion proporcionada |

No se dispone de datos de rendimiento comparativo entre estas alternativas en la informacion proporcionada.

## Limitaciones y advertencias

- **Cobertura limitada por defecto**: con `--max-labels 300` solo puede emitir 300 codigos EC, frente a las 6.939 entradas del vocabulario oficial; las etiquetas fuera de ese conjunto nunca se predicen.
- **Sin pesos incluidos**: el repositorio tiene 0.0 GB y no contiene `weights/tfidf_logreg.joblib` ni `ec_vocabulary.json`; es imprescindible entrenar localmente antes de usar o enviar.
- **Dependencia de red en entrenamiento**: si no hay conexion, el vocabulario EC debe copiarse manualmente desde el starter oficial; el evaluador no tiene red.
- **Licencia no declarada**: no se especifica licencia, lo que impide confirmar condiciones de uso comercial o redistribucion.
- **Sin idiomas declarados**: la entrada es SMILES de reaccion, no texto natural; no aplica evaluacion multilingue.
- **Riesgo de alucinacion en sentido estricto**: no aplica, pero el clasificador puede asignar una EC incorrecta con alta confianza cuando la reaccion cae fuera de la distribucion de entrenamiento.
- **Sesgo hacia etiquetas frecuentes**: la regresion logistica one-vs-rest con SGD y limite de etiquetas favorece las clases con mas soporte en `train.parquet`.
- **Deduplicacion sin canonicalizacion**: dos SMILES equivalentes quimicamente pero escritos de forma distinta se tratan como reacciones distintas, lo que puede generar predicciones redundantes o inconsistentes.
- **Metrica local no representativa**: la exactitud impresa corresponde al holdout derivado del entrenamiento, no al conjunto de validacion real, que carece de etiquetas.
- **Envio inmutable**: una submission apunta a un commit concreto de `main`; no se puede corregir sin crear una nueva revision.

## Enlaces

- Repositorio del modelo: https://huggingface.co/hari12-hp/enzyme-tfidf-logreg
- Starter oficial del concurso (vocabulario EC de 6.939 entradas): https://huggingface.co/starkAhmed43/leak-curber-enzyme-retrieval-starter
