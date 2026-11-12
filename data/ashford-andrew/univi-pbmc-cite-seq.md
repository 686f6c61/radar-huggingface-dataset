# ashford-andrew/UniVI-PBMC-CITE-seq

## Resumen

UniVI-PBMC-CITE-seq es un checkpoint de referencia del modelo UniVI, un autoencoder variacional (VAE) con arquitectura de mezcla de expertos (mixture-of-experts) disenado para la integracion multimodal de datos de celula unica. Lo publica el usuario ashford-andrew en Hugging Face y acompana al articulo de Ashford AJ et al. en *Genome Research* (2026). No es un modelo de lenguaje: es un modelo biologico que aprende representaciones latentes conjuntas de expresion genica (RNA) y abundancia proteica (ADT) a partir de experimentos CITE-seq.

El modelo resuelve el problema de integrar dos modalidades de alta dimension y ruido heterogeneo (transcriptoma y proteoma de superficie) en un espacio latente comun, de modo que celulas con perfiles biologicos similares queden proximas independientemente de la modalidad observada. Se entrena sobre 30.000 celulas emparejadas del dataset PBMC CITE-seq de Hao et al. (GEO GSE164378) y se distribuye como un bundle de pesos PyTorch (`model.pt`) mas transformaciones de preprocesado ajustadas (`preprocessing.joblib`).

Es relevante para investigadores en genomica computacional porque ofrece un punto de partida reproducible para tareas de integracion multimodal, imputacion cruzada de modalidades y visualizacion de poblaciones inmunitarias, con codigo MIT y documentacion publica. El autor advierte explicitamente de que se trata de un modelo de referencia sobre PBMC y no de un modelo fundacional ni de una herramienta validada clinicamente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Autoencoder variacional (beta-VAE) con mezcla de expertos (mixture-of-experts) |
| Parametros totales | no disponible |
| Parametros activos | no disponible (la arquitectura es MoE; no se publica el desglose) |
| Longitud de contexto | no aplica (no es un modelo de lenguaje) |
| Tipos de cuantizacion | no disponible (pesos en punto flotante, `model.pt`) |
| Idiomas soportados | no aplica (modelo biologico, no linguistico) |
| Licencia | no disponible en el repo; el codigo fuente UniVI es MIT y los datos procesados de Zenodo son CC BY 4.0 |
| Formato de pesos | PyTorch (`model.pt`) + transformaciones `preprocessing.joblib`; features en `rna_features.json` y `adt_features.json` |

## Arquitectura y entrenamiento

UniVI es un beta-VAE con capa de mezcla de expertos que procesa dos modalidades de entrada, expresion genica (RNA) y abundancia de proteinas de superficie (ADT), y las proyecta en un espacio latente compartido. El objetivo combina reconstruccion gaussiana de ambas modalidades con un termino KL ponderado por el parametro beta, lo que favorece representaciones latentes mas disentangled. Los objetivos de reconstruccion operan sobre transformaciones ajustadas de RNA y ADT, por lo que las predicciones no son recuentos crudos sino valores en el espacio transformado.

El entrenamiento se realizo sobre 30.000 celulas emparejadas muestreadas aleatoriamente del dataset PBMC CITE-seq de Hao et al. (GEO GSE164378), con semilla 0 y particion estratificada por tipo celular: 23.989 de entrenamiento, 2.987 de validacion y 3.024 de test. El preprocesado se ajusto unicamente sobre las celulas de entrenamiento. La particion es aleatoria estratificada por tipo celular y no retiene donantes completos, de modo que la evaluacion no mide robustez frente a donantes nuevos. El checkpoint publicado es un reentrenamiento fresco y no el utilizado en el articulo original.

## Capacidades

- Aprendizaje de representaciones latentes conjuntas de RNA y ADT en celulas individuales.
- Reconstruccion e imputacion cruzada de modalidades: predecir el perfil proteico a partir del transcriptomico y viceversa.
- Integracion multimodal de datos CITE-seq para analisis de poblaciones celulares.
- Generacion de embeddings de celula unica para clustering, UMAP/t-SNE y analisis de vecindad.
- Evaluacion cuantitativa de reconstruccion mediante las metricas incluidas (`metrics.json`, `protein_metrics.csv`).
- No incluye cabecera de clasificacion de tipos celulares entrenada; las etiquetas son solo anotaciones para evaluacion y visualizacion.
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades linguisticas: no es un modelo de lenguaje.
- No incorpora las extensiones geometricas especificas de UniVII.

## Casos de uso

- Integracion multimodal de CITE-seq en inmunologia: cargar datos crudos de RNA en AnnData, restaurar el preprocesado publicado sin reajustarlo y obtener embeddings conjuntos de RNA y proteina para estudiar subpoblaciones de PBMC.
- Imputacion de marcadores proteicos: predecir la abundancia de proteinas de superficie a partir del perfil transcriptomico en experimentos donde el panel ADT sea limitado, usando las predicciones en el espacio transformado.
- Analisis exploratorio de poblaciones inmunitarias: proyectar celulas en el espacio latente para clustering y visualizacion con UMAP, apoyandose en las anotaciones incluidas para interpretar los grupos.
- Reproduccion de resultados: servir como referencia reproducible con semilla fija y particiones documentadas para comparar variantes de UniVI o de otros metodos de integracion multimodal.
- Validacion de pipelines bioinformaticos: usar el bundle como caso de prueba controlado para verificar que un pipeline de preprocesado y carga de pesos produce reconstrucciones coherentes con las metricas publicadas.
- Docencia y formacion en aprendizaje profundo aplicado a biologia: ilustrar el funcionamiento de un beta-VAE con mezcla de expertos sobre datos reales de celula unica con codigo y documentacion publicos.
- Exploracion interactiva de resultados: consultar el Space asociado para inspeccionar resultados derivados a nivel de celula antes de ejecutar el modelo localmente.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio incluye `metrics.json` y `protein_metrics.csv` con las metricas de reconstruccion del checkpoint, pero sus valores no se detallan en la informacion proporcionada.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el tamano del repo es de 0,0 GB y no se publica el numero de parametros.
- GPU recomendadas: no disponible; por la escala del dataset (30.000 celulas) y la naturaleza del modelo, es probable que quepa en GPU de consumo, pero no hay datos publicados que lo confirmen.
- Compatibilidad con GPU de consumo: no confirmada.
- Opciones de despliegue: inferencia en PyTorch con `load_example.py`; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI (no aplicables a este tipo de modelo).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| UniVI-PBMC-CITE-seq | beta-VAE con MoE para CITE-seq | no disponible | no aplica | no disponible (codigo MIT, datos CC BY 4.0) | Hugging Face |
| UniVI (original) | beta-VAE con MoE para CITE-seq | no disponible | no aplica | MIT (codigo) | GitHub y documentacion |
| UniVII | Extension geometrica de UniVI | no disponible | no aplica | no disponible | no disponible |
| Alternativas de integracion multimodal | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Ambito restringido: es una referencia de PBMC RNA/proteina, no un modelo fundacional; no se espera que generalice a otros tejidos, paneles o especies sin reentrenamiento.
- Particion no retenida por donante: la evaluacion estratifica por tipo celular, no por donante, por lo que no constituye evidencia de robustez frente a donantes nuevos ni de rendimiento clinico.
- Predicciones en espacio transformado: las salidas gaussianas no son recuentos crudos; interpretarlas como tales es incorrecto.
- Sin cabecera de clasificacion: no se exporta un clasificador de tipos celulares entrenado; las etiquetas son anotaciones para evaluacion y visualizacion.
- Licencia sin definir en el repo: el autor pide revisar la procedencia y elegir una licencia de checkpoint antes de publicar; no se debe asumir que la licencia MIT del codigo cubre los datos subyacentes.
- Riesgo de seguridad en el bundle: `preprocessing.joblib` usa pickle; debe cargarse solo desde un origen de confianza y revisado.
- Sin matrices crudas: el upload no incluye las matrices de origen, solo resultados derivados y anotaciones del explorador.
- Sin datos de sesgo, alucinacion ni rendimiento fuera de dominio publicados; no hay informacion sobre latencia ni coste computacional.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ashford-andrew/UniVI-PBMC-CITE-seq
- Explorador interactivo: https://huggingface.co/spaces/ashford-andrew/UniVI-explorer
- Codigo fuente: https://github.com/Ashford-A/UniVI
- Documentacion: https://univi.readthedocs.io/
- Articulo: https://doi.org/10.1101/gr.281431.125
- Datos procesados (Zenodo): https://zenodo.org/records/22883697
- Dataset original PBMC CITE-seq (GEO): https://www.ncbi.nlm.nih.gov/geo/query/acc.cgi?acc=GSE164378
