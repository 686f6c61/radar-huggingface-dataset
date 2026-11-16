# kevinp0/kcat-km-esm2-sub4

## Resumen

kcat-km-esm2-sub4 es un ensemble de modelos de aprendizaje automatico para la prediccion conjunta de parametros enzimaticos: la constante catalitica (kcat) y la constante de Michaelis (Km), ambas en escala log10. Lo desarrolla el usuario kevinp0 y se publica bajo licencia MIT en Hugging Face. No es un modelo de lenguaje generativo, sino un sistema de regresion especializado en bioinformatica, orientado a la prediccion de cinetica enzimatica a partir de la secuencia de la enzima y la estructura del sustrato.

El sistema combina tres componentes: una red neuronal de dos torres (two-tower) que procesa embeddings de ESM2 para la enzima y descriptores de RDKit para el sustrato, un modelo de ExtraTrees y un modelo de LightGBM. Las predicciones finales se combinan con pesos fijos (0,30 red neuronal + 0,50 ExtraTrees + 0,20 LightGBM). El paquete incluye los pesos de ESM2 (8M y 35M) empaquetados y un script de inferencia en CPU (`predict.py`), disenado para ejecutarse en menos de 10 minutos en cualquier maquina.

El modelo es relevante en el contexto de competiciones y tareas de prediccion de cinetica enzimatica (etiquetadas con "leak-curber"), donde la fuga de datos entre entrenamiento y validacion es un problema critico. El autor documenta un protocolo estricto de agrupacion por homologia de secuencia y filtrado de filas externas, lo que aporta rigor metodologico. El repositorio ocupa 1,4 GB e incluye codigo fuente, pesos y estadisticas de normalizacion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Ensemble: red two-tower (MLP con LayerNorm/GELU) + ExtraTrees + LightGBM |
| Parametros totales | no disponible (el repo incluye ESM2-8M y ESM2-35M como encoders) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (no es modelo de lenguaje; usa los primeros 1022 residuos de la secuencia) |
| Tipos de cuantizacion | ESM2-35M cuantizado a int8 para inferencia; resto de pesos en punto flotante |
| Idiomas soportados | no aplica (entrada: secuencias de aminoacidos y SMILES) |
| Licencia | MIT |
| Formato de pesos | safetensors (repo), `.pt` (PyTorch) y `.pkl` (scikit-learn/LightGBM) en `weights/` |

## Arquitectura y entrenamiento

La red neuronal es un modelo two-tower: la torre proteica toma el embedding medio de ESM2 (primeros 1022 residuos, estandarizado con estadisticas de entrenamiento) y la torre del ligando toma un fingerprint Morgan de conteo (radio 2, 2048 bits, con log1p), claves MACCS y descriptores 2D (signo-log, estandarizados y recortados). Cada torre es un MLP de dos capas Linear-LayerNorm-GELU-Dropout; las representaciones se fusionan como `[p, l, p*l]` y pasan por dos bloques residuales. La cabeza produce una media y una log-varianza por objetivo, entrenadas con una verosimilitud gaussiana heteroscedastica (Gaussian NLL). Se usa AdamW con warm-up y decaimiento coseno, dropout 0,3 y ruido gaussiano en la entrada. Los pesos de las ultimas epocas se promedian (SWA) y se forma un comite de 5 folds agrupados por homologia x semillas.

Los modelos de arboles complementan la red: ExtraTrees con 200 arboles sobre [embedding ESM2-35M, claves MACCS, descriptores], y LightGBM con un modelo por objetivo (1000 rondas) sobre [embedding ESM2-35M, composicion de la enzima (longitud, hidropatia, grupos de residuos, composicion de aminoacidos y dipetidos, composicion por tercios de secuencia), conteos Morgan, MACCS, descriptores y un prior del sustrato (media, conteo, desviacion tipica, maximo, minimo y mediana de las etiquetas de entrenamiento del sustrato, out-of-fold para las filas de entrenamiento)]. El entrenamiento usa 42.524 pares de la tarea mas 27.863 pares de tablas publicas de Leak-CURBER (BRENDA/SABIO-RK), con filtros estrictos: solo enzimas wildtype, pares (SMILES, secuencia) no presentes en train/validacion y sin homologia (coseno de 3-mer > 0,25) con enzimas de validacion. La validacion es 5-fold agrupada por clusters de homologia de secuencia.

## Capacidades

- Prediccion conjunta de log10(kcat) y log10(Km) a partir de secuencia de enzima y SMILES de sustrato.
- Extraccion de caracteristicas proteicas mediante ESM2 (8M y 35M) con pooling medio.
- Featurizacion de ligandos con RDKit (Morgan count, MACCS, descriptores 2D).
- Inferencia en CPU con presupuesto de tiempo controlado (limite de 10 minutos por ejecucion).
- Fallback escalonado: si el presupuesto se agota, usa ESM2-8M o el embedding medio de entrenamiento.
- Salida en CSV con columnas `id, log10_kcat, log10_km`.
- No soporta tool calling, agentes, vision, audio ni generacion de texto: es un regresor tabular/neuronal.

## Casos de uso

- Prediccion de cinetica enzimatica en pipelines de biologia computacional: dado un conjunto de pares enzima-sustrato en un fichero Parquet, el modelo genera predicciones de kcat y Km en CSV en una sola ejecucion de CPU, integrable en flujos de anotacion funcional.
- Filtrado previo en diseno de enzimas: estimar rapidamente que variantes de una enzima podrian tener mejor kcat o menor Km antes de validacion experimental, usando el comite de redes y arboles como cribado.
- Participacion en competiciones de prediccion de cinetica (estilo Leak-CURBER): el modelo esta construido explicitamente para este tipo de tareas, con protocolo anti-fuga y validacion por homologia.
- Analisis de sensibilidad sustrato-enzima: el prior del sustrato en LightGBM permite estudiar como las etiquetas historicas de un sustrato influyen en la prediccion, util para detectar sustratos con pocos datos.
- Docencia e investigacion en ML aplicado a bioinformatica: el codigo (`features.py`, `network.py`, `prior.py`) es reutilizable como referencia de ensemble heterogeneo con ESM2 y RDKit.
- Benchmarking de encoders proteicos: el repo incluye pesos de ESM2-8M y ESM2-35M, lo que permite comparar el rendimiento de ambos tamanos en la misma tarea.
- Prototipado rapido en entornos sin GPU: al ejecutarse en CPU con cuantizacion int8 del encoder, es adecuado para estaciones de trabajo modestas o contenedores sin acelerador.

## Benchmarks y rendimiento

Resultados de validacion cruzada 5-fold agrupada por homologia (SCC = coeficiente de correlacion de Spearman):

| Modelo | kcat SCC | Km SCC | Mean SCC |
|---|---|---|---|
| Ridge baseline | 0,265 | 0,500 | 0,383 |
| Comites de red (submission 1) | 0,442 | 0,651 | 0,547 |
| ExtraTrees solo | 0,427 | 0,651 | 0,539 |
| LightGBM solo | 0,424 | 0,649 | 0,536 |
| Red + ExtraTrees (submission 2) | no disponible | no disponible | 0,559 |
| Red + ExtraTrees + LightGBM (submission 3) | 0,459 | 0,666 | 0,562 |
| Comites de red con filas externas | 0,435 | 0,673 | 0,553 |
| ExtraTrees con filas externas | no disponible | no disponible | 0,558 |
| LightGBM con filas externas | 0,434 | 0,654 | 0,544 |
| **Este modelo** | **0,463** | **0,682** | **0,573** |

En el conjunto de validacion publico, las submissions 1, 2 y 3 obtuvieron 0,489, 0,501 y 0,518 respectivamente. La desviacion tipica de las predicciones de CV en una muestra del tamano de validacion es de aproximadamente 0,03, lo que da una idea de la variabilidad esperada.

## Requisitos de hardware

- Inferencia exclusivamente en CPU: el autor indica que `predict.py` esta disenado para ejecutarse en cualquier maquina dentro de un limite de 10 minutos.
- VRAM: no aplica (no requiere GPU). El encoder ESM2-35M se cuantiza a int8 para reducir coste computacional.
- GPU recomendadas: no aplica; no se documenta soporte GPU.
- Cabe en cualquier equipo con CPU moderna y suficiente RAM para cargar los pesos (repo de 1,4 GB).
- Opciones de despliegue: ejecucion directa con `python predict.py --input INPUT.parquet --output OUTPUT.csv`; no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI (no aplican a este tipo de modelo).
- Latencia y throughput: no disponibles de forma explicita; el presupuesto de tiempo esta acotado a 150 s para descriptores, 430 s para el encoder ESM2-35M int8 y 520 s para el fallback ESM2-8M, con limite global de 10 minutos.

## Comparativa con modelos similares

No se dispone de informacion sobre modelos comparables en la documentacion proporcionada. La model card incluye una comparacion interna con lineas base (Ridge) y con los componentes individuales del ensemble (red, ExtraTrees, LightGBM), pero no con otros modelos externos de prediccion de kcat/Km.

| Modelo | Parametros | Contexto | Rendimiento (Mean SCC) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| kcat-km-esm2-sub4 | no disponible | no aplica | 0,573 (CV) | MIT | Hugging Face |
| Ridge baseline | no disponible | no aplica | 0,383 (CV) | no disponible | incluido en la model card como referencia |
| Alternativas externas | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- No es un modelo de lenguaje: no genera texto, no soporta tool calling ni agentes; cualquier uso fuera de la prediccion de kcat/Km es inadecuado.
- El rendimiento depende fuertemente de la calidad de la secuencia (wildtype) y del SMILES; enzimas mutantes o sustratos atipicos pueden degradar las predicciones.
- Riesgo de sesgo hacia las distribuciones de BRENDA/SABIO-RK: los datos externos usados para entrenar pueden sobrerrepresentar ciertas familias enzimaticas.
- El protocolo anti-fuga es estricto, pero la validacion es interna (CV agrupada); el rendimiento en dominios muy alejados de la distribucion de entrenamiento no esta cuantificado.
- El presupuesto de tiempo puede provocar que algunas filas usen el fallback ESM2-8M o el embedding medio, con menor precision; el log indica cuantas filas cubre cada etapa.
- La licencia MIT permite uso comercial, pero el autor no ofrece garantias sobre la exactitud de las predicciones en contextos industriales.
- No se documentan idiomas ni sesgos linguisticos (no aplica); la unica entrada valida son secuencias de aminoacidos y SMILES.
- El modelo tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no hay evidencia de uso en produccion por terceros.

## Enlaces

- Hugging Face: https://huggingface.co/kevinp0/kcat-km-esm2-sub4
- Repositorio de ESM2-8M referenciado: https://huggingface.co/facebook/esm2_t6_8M_UR50D
- Repositorio de ESM2-35M referenciado: https://huggingface.co/facebook/esm2_t12_35M_UR50D
- No se han proporcionado enlaces adicionales a papers, blogs, repositorios o demos en la informacion disponible.
