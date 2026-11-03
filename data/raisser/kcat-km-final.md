# raisser/kcat-km-final

## Resumen

kcat-km-final es un ensemble de modelos de prediccion de parametros cineticos enzimaticos (kcat y Km) publicado en HuggingFace por el usuario raisser. No se trata de un modelo de lenguaje: es un pipeline de regresion que combina embeddings de proteina extraidos con ESM-2 35M, descriptores moleculares calculados con RDKit (Morgan counts, MACCS y descriptores fisicoquimicos) y modelos de gradient boosting (LightGBM y Extra Trees) junto con una red neuronal ligera sobre ESM-2 parcialmente fine-tuneado. El objetivo es predecir la constante catalitica (kcat) y la constante de Michaelis (Km) para pares enzima-sustrato.

El modelo se entrena sobre el conjunto de entrenamiento del organizador de una competicion de prediccion cinetica mas tablas publicas de cinetica filtradas para evitar fugas de datos, sin usar modelos preentrenados especificamente en cinetica. El diseno combina dos ramas: una rama clasica (A) con ESM-2 congelado y boosting de arboles, y una rama neuronal (B) con fine-tuning parcial de las 4 capas superiores de ESM-2 mas una MLP sobre moleculas y caracteristicas cruzadas enzima-sustrato.

La relevancia practica es acotada y especifica: sirve como linea base reproducible para tareas de prediccion de kcat y Km en entornos de solo CPU, con un repo de 0,9 GB y un script de inferencia (`predict.py`). No hay model card con informacion sobre licencia, idiomas ni benchmarks frente a otros metodos, y el pipeline declarado no es un pipeline estandar de HuggingFace.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Ensemble: ESM-2 35M (congelado en rama A, parcialmente fine-tuneado en rama B) + descriptores RDKit + LightGBM por target + Extra Trees + MLP |
| Parametros totales | no disponible (incluye ESM-2 35M como backbone; el resto son modelos tabulares y una MLP ligera) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (no es un modelo de lenguaje; la entrada es una secuencia proteica y una molecula) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no aplica: entrada de secuencias proteicas y SMILES) |
| Licencia | no disponible |
| Formato de pesos | safetensors y joblib (segun tags del repo) |

## Arquitectura y entrenamiento

La rama A usa ESM-2 35M congelado, del que se extrae una representacion combinando el ultimo layer y el mean pooling del layer 8, reducida a 256 dimensiones mediante PCA. Esa representacion se concatena con descriptores moleculares (Morgan counts, MACCS y descriptores RDKit) y se alimenta a un LightGBM por target (kcat y Km) promediado sobre 5 semillas, mas un modelo Extra Trees sobre las mismas caracteristicas con peso 0,3 en el blend final.

La rama B parte de ESM-2 35M y fine-tunea las 4 capas superiores, anadiendo una MLP para la molecula y caracteristicas cruzadas enzima-sustrato, promediada sobre 4 semillas (variante "rank"). El blend final asigna peso 0,5 a la rama neuronal para kcat y 0,5 para Km. El entrenamiento usa el conjunto del organizador mas tablas publicas de cinetica filtradas por fugas, sin modelos preentrenados en cinetica. La validacion cruzada agrupada de cinco folds reporta kcat 0,4751, Km 0,6872 y media 0,5811 (metrica no especificada en la model card). La inferencia es solo CPU y comparte una unica pasada de ESM para las capas 0-7.

## Capacidades

- Prediccion de kcat para pares enzima-sustrato.
- Prediccion de Km para pares enzima-sustrato.
- Extraccion de embeddings proteicos con ESM-2 35M (ultimo layer y layer 8 con mean pooling, PCA-256).
- Calculo de descriptores moleculares con RDKit (Morgan counts, MACCS, descriptores fisicoquimicos).
- Inferencia en CPU sin GPU.
- Ejecucion mediante script CLI: `python /app/predict.py --input INPUT --output OUTPUT`.
- No soporta tool calling, agentes, razonamiento multi-paso, vision, audio ni generacion de texto.

## Casos de uso

- Filtrado previo en diseno de enzimas: dado un panel de variantes de una enzima y un sustrato, estimar kcat y Km para priorizar candidatos antes de ensayos experimentales, usando la rama de boosting que funciona en CPU.
- Anotacion de bases de datos de cinetica: rellenar valores faltantes de kcat y Km en tablas internas combinando el ensemble con los datos experimentales existentes.
- Analisis de sensibilidad sustrato-enzima: evaluar como varia la prediccion al cambiar el sustrato manteniendo la enzima, gracias a las caracteristicas cruzadas enzima-sustrato de la rama B.
- Linea base en competiciones y benchmarks de cinetica: el diseno declarado (CV agrupada, 5 folds, kcat 0,4751 / Km 0,6872) sirve como referencia reproducible para comparar metodos nuevos.
- Integracion en pipelines bioinformaticos ligeros: al ejecutarse solo en CPU y con un repo de 0,9 GB, puede desplegarse en contenedores sin GPU dentro de flujos de anotacion por lotes.
- Exploracion de relaciones estructura-funcion: usar los descriptores RDKit y los embeddings ESM-2 como features para analisis de importancia o para entrenar variantes del ensemble sobre datos propios.

## Benchmarks y rendimiento

Los unicos datos publicados en la model card son los resultados de validacion cruzada agrupada de cinco folds del propio diseno:

| Metrica | Valor |
|---|---|
| kcat (CV agrupada, 5 folds) | 0,4751 |
| Km (CV agrupada, 5 folds) | 0,6872 |
| Media | 0,5811 |

No se especifica la metrica exacta (no se indica si es R2, correlacion de Spearman, MAE normalizado u otra). No se han publicado comparaciones con otros metodos en la informacion disponible.

## Requisitos de hardware

- Inferencia solo CPU, segun declara el autor; no requiere GPU.
- VRAM estimada: no aplica (CPU only).
- GPU recomendadas: no aplica.
- No cabe en GPU consumer porque no se ejecuta en GPU; el coste esta en CPU y RAM.
- RAM estimada: no disponible; el repo ocupa 0,9 GB y el backbone es ESM-2 35M, por lo que el uso de memoria deberia ser moderado, pero no se aporta cifra.
- Opciones de despliegue: script CLI incluido (`/app/predict.py`); no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI (no aplican a este tipo de modelo).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye comparaciones con otros predictores de kcat/Km (por ejemplo, DLKcat, UniKP, EITLEM u otros), ni datos suficientes para establecer una comparativa fiable de parametros, contexto, rendimiento o licencia.

## Limitaciones y advertencias

- No es un modelo de lenguaje: no genera texto, no soporta tool calling ni agentes; cualquier uso fuera de prediccion de kcat/Km requiere adaptacion.
- La model card no especifica la licencia, lo que impide confirmar si el uso comercial esta permitido.
- No se documentan sesgos, cobertura del espacio quimico ni dominios enzimaticos representados en el entrenamiento.
- Riesgo de extrapolacion: al entrenarse sobre tablas publicas de cinetica y el conjunto del organizador, las predicciones fuera de esa distribucion (enzimas o sustratos poco representados) pueden degradarse sin aviso.
- La metrica de validacion no esta identificada, lo que dificulta interpretar los valores 0,4751 y 0,6872 frente a otros trabajos.
- El pipeline declarado no es un pipeline estandar de HuggingFace; la integracion requiere usar el script y el entorno del autor (RDKit, LightGBM, joblib, safetensors).
- No hay informacion sobre versiones de dependencias ni reproducibilidad del entorno.
- El repo tiene 0 descargas y 0 likes en el momento de la consulta, sin validacion externa conocida.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/raisser/kcat-km-final
- Referencia externa encontrada en la busqueda web (tesis sobre Chlorella sorokiniana, contexto de cinetica enzimatica, no especifica del modelo): https://discovery.ucl.ac.uk/10064964/1/Spencer-Milnes_Xenia_thesis_edited.pdf
