# Sepideh2027/OmniLatent-TCGA-BRCA-model

## Resumen

OmniLatent-TCGA-BRCA-model es un autoencoder profundo (stacked autoencoder) desarrollado por Sepideh Moafi (usuario Sepideh2027) dentro del proyecto de investigación OmniLatent, orientado al aprendizaje de representaciones no lineales en genómica del cáncer. No es un modelo de lenguaje: su entrada son perfiles de expresión génica de RNA-seq en formato bulk y su salida es una reconstrucción de esos perfiles, con un espacio latente comprimido de 128 dimensiones a partir de 23.375 características de expresión génica, lo que supone una reducción de dimensionalidad del 99,5 %.

El modelo se entrenó sobre el conjunto TCGA-BRCA (cáncer de mama) con 1.231 muestras y 23.375 genes, empleando PyTorch como framework. Su función es convertir cada perfil transcriptómico en un vector latente compacto que puede utilizarse para clustering, visualización (PCA, UMAP) y descubrimiento de patrones biológicos, sustituyendo o complementando técnicas lineales clásicas como el PCA sobre datos de alta dimensionalidad.

Es relevante ahora porque la reducción de dimensionalidad no lineal en transcriptómica es una etapa habitual en flujos de trabajo de medicina de precisión, y el autor publica junto al modelo un pipeline reproducible y el dataset asociado (`Sepideh2027/biolatent-brca-tcga`), lo que permite reproducir experimentos de biología computacional. La model card restringe explícitamente su uso a investigación y educación, y excluye cualquier aplicación de diagnóstico o decisión clínica.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Autoencoder apilado (stacked autoencoder) implementado en PyTorch |
| Parametros totales | no disponible (la model card no los indica; solo se publica la dimension latente y la de entrada) |
| Longitud de contexto | no aplica (no es un modelo de lenguaje; procesa vectores de 23.375 caracteristicas de expresion genica) |
| Tipos de cuantizacion | no disponible (solo se distribuye el checkpoint en precision original de PyTorch; no se documentan variantes int8/float16) |
| Idiomas soportados | no aplica (modelo numerico sobre datos genomicos, no procesa texto) |
| Licencia | MIT |
| Formato de pesos | PyTorch (`best_model.pt`) |
| Dimension de entrada | 23.375 caracteristicas de expresion genica |
| Dimension latente | 128 |
| Reduccion de dimensionalidad | 99,5 % |
| Perdida de reconstruccion en test | 0,3129 |
| Framework | PyTorch |

## Arquitectura y entrenamiento

La arquitectura es un autoencoder apilado: un codificador que proyecta el vector de entrada de 23.375 genes a una representacion latente de 128 dimensiones y un decodificador que reconstruye el perfil de expresion original. El objetivo de entrenamiento es la reconstruccion (perdida de reconstruccion en test de 0,3129, valor consistente con un error cuadratico medio sobre datos normalizados, aunque la model card no especifica la funcion de perdida exacta). La model card no detalla el numero de capas, las dimensiones intermedias, las funciones de activacion ni el numero de parametros totales.

Los datos de entrenamiento son 1.231 muestras de RNA-seq bulk del proyecto TCGA-BRCA con 23.375 genes. El flujo de trabajo asociado incluye adquisicion de datos, preprocesado, filtrado de genes, normalizacion y control de calidad, y la caracterizacion posterior del espacio latente mediante PCA, UMAP y clustering. No se documenta el uso de RLHF, DPO ni tecnicas de ajuste por preferencias, algo esperable en un modelo de este tipo. Tampoco se especifican el numero de epocas, el tamano de batch, el optimizador ni si hubo busqueda de hiperparametros.

## Capacidades

- Compresion de perfiles transcriptomicos: codifica un vector de 23.375 genes en un vector latente de 128 dimensiones, con una reduccion del 99,5 %.
- Reconstruccion de perfiles de expresion: el decodificador regenera el perfil de entrada a partir del vector latente (perdida de reconstruccion en test de 0,3129).
- Generacion de representaciones para aprendizaje no supervisado: los vectores latentes sirven como entrada para clustering, clasificacion aguas abajo o busqueda de similitud entre muestras.
- Visualizacion y exploracion: el espacio latente de 128 dimensiones se caracterizo con PCA y UMAP segun la model card, lo que facilita la inspeccion visual de la estructura de los datos.
- Deteccion de patrones biologicos: la model card indica que permite descubrimiento de patrones, si bien estos deben verificarse de forma independiente.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, generacion de texto, codigo, matematicas, vision, audio ni capacidades multilingues: no es un modelo generativo de lenguaje.

## Casos de uso

- Reduccion de dimensionalidad en pipelines de RNA-seq bulk: se aplica el codificador a una matriz de expresion normalizada para obtener una matriz latente de 128 columnas que alimenta analisis posteriores (clustering, PCA, UMAP), reduciendo el coste computacional frente a trabajar con 23.375 genes.
- Clustering de subtipos tumorales: los vectores latentes pueden agruparse con k-means o clustering jerarquico para explorar si las muestras se separan en grupos con significado biologico, siempre con verificacion independiente de los grupos obtenidos.
- Visualizacion exploratoria de cohortes: proyectar el espacio latente con UMAP permite generar figuras de embedding para publicaciones o informes internos, comparando cohortes de cancer de mama.
- Seleccion de caracteristicas aguas abajo: usar el error de reconstruccion por gen como criterio para priorizar genes relevantes en la estructura latente, como paso previo a modelos predictivos supervisados.
- Integracion en flujos reproducibles de biologia computacional: al publicarse junto al dataset `Sepideh2027/biolatent-brca-tcga` y a un pipeline documentado, permite reproducir experimentos y comparar variantes de arquitectura en entornos de investigacion.
- Preentrenamiento y transferencia en genomica del cancer: el codificador puede servir como extractor de caracteristicas congelado para tareas supervisadas (por ejemplo, clasificacion de subtipos) cuando el numero de etiquetas es limitado, reentrenando la cabeza de clasificacion.
- Analisis de similitud entre muestras: calcular distancias en el espacio latente para recuperar muestras transcriptomicamente parecidas, util en estudios de casos atipicos o de control de calidad de cohortes.
- Docencia y prototipado: por su tamano reducido, el modelo es adecuado como ejemplo practico de autoencoders aplicados a datos biologicos en cursos de machine learning y bioinformatica.

## Benchmarks y rendimiento

La model card solo publica la perdida de reconstruccion en el conjunto de test. No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K ni equivalentes en el dominio genomico como clasificacion de subtipos PAM50 o silhouette score del clustering) en la informacion disponible.

| Metrica | Valor | Conjunto |
|---|---|---|
| Perdida de reconstruccion | 0,3129 | Test |
| Reduccion de dimensionalidad | 99,5 % (23.375 a 128) | No aplica |
| Muestras de entrenamiento | 1.231 | TCGA-BRCA |

No se proporcionan comparaciones numericas con otros metodos de reduccion de dimensionalidad, por lo que no es posible establecer una comparativa cuantitativa.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. El repositorio ocupa 0,8 GB, lo que sugiere un checkpoint de ese orden (probablemente con estado del optimizador incluido); la inferencia del modelo en float32 deberia caber holgadamente en menos de 2 GB de VRAM, pero es una estimacion, no un dato publicado.
- GPU recomendadas: cualquier GPU con al menos 2-4 GB de VRAM es suficiente para inferencia por lotes; una RTX 3060, RTX 4090, A100 o H100 funcionan sin problema, aunque estan sobredimensionadas para este modelo.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU de consumo moderna e incluso en GPU integradas, dado el caracter de red densa de pequeno tamano.
- Ejecucion en CPU: viable. Al no ser un transformer con atencion sobre secuencias largas, la inferencia sobre lotes de 1.231 muestras de 23.375 caracteristicas es factible en CPU en tiempos del orden de segundos o pocos minutos, dependiendo del numero de capas (no documentado).
- Opciones de despliegue: PyTorch nativo es la via documentada (`best_model.pt`). No se mencionan exportaciones a ONNX, TorchScript, GGUF ni integraciones con vLLM, llama.cpp, Ollama o TGI, que ademas no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles. No se publican mediciones de tiempo de codificacion por muestra ni de throughput por segundo.

## Comparativa con modelos similares

No se proporcionan datos cuantitativos de modelos comparables en la informacion disponible. Como referencia cualitativa del mismo tipo de tarea (representacion latente de transcriptomica), se puede situar frente a metodos clasicos y modelos generativos de la literatura, aunque sus cifras no se han facilitado y no deben inventarse.

| Alternativa | Tipo | Dimension latente | Contexto de datos | Licencia | Rendimiento comparado |
|---|---|---|---|---|---|
| OmniLatent-TCGA-BRCA-model | Autoencoder apilado | 128 | TCGA-BRCA, 1.231 muestras, 23.375 genes | MIT | Perdida de reconstruccion en test 0,3129 |
| PCA / UMAP sobre expresion genica | Metodo lineal / no lineal de reduccion de dimensionalidad | Configurable | Generico | Segun implementacion | no disponible |
| Autoencoders variacionales para transcriptomica (por ejemplo, familias tipo scVI) | Modelo generativo probabilistico | Configurable | Habitualmente celula unica o bulk segun variante | Segun proyecto | no disponible |
| Autoencoders densos de referencia en bioinformatica (por ejemplo, familias tipo DCA) | Autoencoder especifico de conteos | Configurable | RNA-seq bulk | Segun proyecto | no disponible |

La comparativa cuantitativa queda pendiente: la model card no ofrece evaluaciones en tareas aguas abajo que permitan situar el modelo frente a estas alternativas.

## Limitaciones y advertencias

- Generalizacion limitada: entrenado exclusivamente con TCGA-BRCA; no hay evidencia de que funcione en otros tipos de cancer, otras cohortes ni otras plataformas de secuenciacion sin reentrenamiento.
- No validado clinicamente: la propia model card indica que no debe usarse para diagnostico, decisiones de tratamiento ni uso clinico directo.
- Riesgo de interpretacion erronea: los patrones biologicos observados en el espacio latente deben verificarse de forma independiente con conocimiento de dominio; un embedding no es evidencia causal.
- Sin datos de sesgo: no se documenta analisis de sesgo por origen etnico, edad, subtipo tumoral ni composicion de la cohorte TCGA, que esta desequilibrada hacia determinadas poblaciones.
- Perdida de reconstruccion interpretable solo en contexto: el valor 0,3129 depende de la normalizacion y la funcion de perdida, que no se especifican; no es comparable directamente con cifras de otros trabajos.
- Sin informacion de versionado de datos: no se detalla la version del pipeline de preprocesado ni los criterios de filtrado de genes, lo que dificulta la reproducibilidad exacta.
- Restricciones de licencia: licencia MIT, que permite uso comercial y modificacion con atribucion; no obstante, el uso previsto declarado por el autor es investigacion y educacion, y las cuestiones de privacidad de datos genomicos derivados de TCGA siguen aplicando.
- Ausencia total de traccion: 0 descargas y 0 likes en el momento de la consulta; no existen evaluaciones de terceros ni issues publicos.
- Ambito cerrado: no procesa texto, imagenes ni audio; cualquier expectativa de uso como modelo de lenguaje es incorrecta.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Sepideh2027/OmniLatent-TCGA-BRCA-model
- Dataset asociado citado en la model card: https://huggingface.co/datasets/Sepideh2027/biolatent-brca-tcga
- Perfil de HuggingFace del autor: https://huggingface.co/Sepideh2027
- GitHub del autor: https://github.com/AIResearcher20
- Resultados de busqueda web: las consultas realizadas no devolvieron ningun enlace relevante sobre el modelo (los resultados obtenidos correspondian a sitios de restauracion de comida rapida y no guardan relacion con el contenido de esta ficha). No se dispone, por tanto, de paper, blog tecnico ni demo adicionales.
