# OneScience-Group/GPSite

## Resumen

GPSite es una red neuronal geométrica multitarea desarrollada por OneScience-Group para la predicción de sitios de unión en proteínas. El modelo predice simultáneamente los sitios de unión potenciales entre residuos de proteínas y diferentes ligandos: ADN, ARN, péptidos, proteínas, ATP, hemo (HEM) y varios iones metálicos. Su principal ventaja es que no necesita alineamientos múltiples de secuencias (MSA) ni estructuras experimentales resueltas, ya que utiliza representaciones de secuencia generadas por un modelo de lenguaje de proteínas preentrenado (ProtT5-XL-UniRef50) y estructuras predichas por ESMFold.

La arquitectura combina representaciones geométricas a nivel de residuo, construidas a partir de la estructura predicha y características DSSP, con una red de grafos (GNN) que genera puntuaciones de predicción para múltiples tipos de sitios de unión. El modelo está publicado en eLife y su licencia es MIT, lo que permite uso comercial. Está pensado para aplicaciones en biología computacional, descubrimiento de fármacos y anotación de proteomas.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Red neuronal de grafos (GNN) geométrica multitarea, con representaciones de secuencia de ProtT5-XL-UniRef50 y estructuras predichas por ESMFold |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (entrada basada en secuencias de proteínas, sin ventana de contexto en el sentido de LLM) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en, zh (idiomas de la model card; el modelo opera sobre secuencias de proteínas) |
| Licencia | MIT |
| Formato de pesos | Checkpoints PyTorch (.ckpt), cinco modelos: fold0.ckpt a fold4.ckpt |

## Arquitectura y entrenamiento

GPSite es una red geométrica multitarea que predice sitios de unión a nivel de residuo. El flujo de inferencia completo comienza con una secuencia FASTA de proteína. Primero, ESMFold predice la estructura tridimensional de la proteína y ProtT5-XL-UniRef50 extrae representaciones de secuencia. Después, la estructura predicha se combina con características DSSP para construir representaciones geométricas a nivel de residuo. Finalmente, la red de grafos GPSite procesa estas representaciones y emite puntuaciones de predicción para varios tipos de sitios de unión simultáneamente.

El entrenamiento se realiza con cinco pliegues (folds), cuyos pesos se cargan en secuencia durante la inferencia y se promedian las predicciones. No se han proporcionado detalles sobre el número de tokens de entrenamiento, la composición exacta del dataset ni si se aplicaron técnicas de RLHF o DPO (no aplicables a este tipo de modelo). La innovación técnica clave es que el modelo no depende de MSA ni de estructuras experimentales, lo que permite aplicarlo a proteínas sin información estructural previa. El trabajo está documentado en el artículo "Genome-scale annotation of protein binding sites via language model and geometric deep learning" (DOI: 10.7554/eLife.93695).

## Capacidades

- Predicción de sitios de unión a nivel de residuo para ADN, ARN, péptidos, proteínas, ATP, hemo (HEM) y varios iones metálicos.
- Entrada basada en secuencias FASTA de proteínas; no requiere MSA ni estructuras experimentales.
- Uso de estructuras predichas por ESMFold para el análisis sin estructura resuelta.
- Análisis por lotes de múltiples secuencias de proteínas en un archivo FASTA.
- Predicción multitarea: un único modelo genera puntuaciones para varios tipos de ligandos simultáneamente.
- Sin soporte de tool calling, generación de texto, razonamiento general, visión ni audio; es un modelo especializado en biología estructural.

## Casos de uso

- Descubrimiento de fármacos: identificar sitios de unión a ATP en proteínas diana para diseñar inhibidores competitivos. El modelo predice las posiciones de unión a ATP directamente desde la secuencia, lo que acelera el cribado virtual.
- Ingeniería de proteínas: predecir sitios de unión a ADN en factores de transcripción para diseñar variantes con afinidad modulada. La predicción simultánea de varios ligandos permite evaluar la especificidad de la proteína.
- Anotación de proteomas: analizar miles de secuencias FASTA por lotes para anotar sitios de unión a iones metálicos en genomas completos. La ejecución por lotes y la ausencia de MSA hacen viable el análisis a escala genómica.
- Estudio de interacciones proteína-proteína: predecir interfaces de unión entre proteínas para investigar complejos macromoleculares. El modelo puede identificar residuos implicados en la interacción sin necesidad de estructuras experimentales.
- Análisis de variantes: evaluar cómo mutaciones puntuales afectan a los sitios de unión a hemo en proteínas como citocromos o hemoglobinas. La predicción por residuo permite localizar el impacto de cada mutación.
- Biología estructural sin estructura experimental: obtener predicciones de sitios de unión para proteínas recién secuenciadas usando ESMFold para predecir la estructura. Esto es útil en organismos poco estudiados o en proteínas sin estructura resuelta.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El artículo original (DOI: 10.7554/eLife.93695) podría contener evaluaciones comparativas, pero no se incluyen datos numéricos en la model card ni en los resultados de búsqueda web.

## Requisitos de hardware

- Se recomienda una GPU o DCU para ejecutar el flujo completo, ya que ESMFold requiere un consumo computacional y de memoria de GPU considerable.
- La CPU es compatible, pero la etapa de predicción de estructura es significativamente más lenta sin GPU/DCU.
- No se especifican valores exactos de VRAM ni modelos de GPU concretos. Dado que ESMFold es un modelo de aproximadamente 3B parámetros, se necesita una GPU con al menos 16-24 GB de VRAM para un funcionamiento razonable (estimación orientativa, no confirmada por el autor).
- El despliegue se realiza mediante scripts de Python proporcionados en el repositorio (`scripts/run_infer.sh` y `scripts/predict.py`), no a través de vLLM, llama.cpp, Ollama ni TGI.
- También existe un entorno en línea llamado OneCode para programación AI4S con un clic, que permite ejecutar el modelo sin configuración local.

## Comparativa con modelos similares

No disponible. No se han proporcionado datos de modelos comparables de la misma categoría (predicción de sitios de unión a proteínas) en la información disponible.

## Limitaciones y advertencias

- La dependencia de ESMFold para la predicción de estructura puede introducir errores en la conformación predicha, lo que afecta directamente a la precisión de la predicción de sitios de unión.
- El modelo requiere descargar pesos adicionales de ProtT5-XL-UniRef50, ESMFold, ESM-2 y OpenFold, lo que aumenta la complejidad de la instalación y el espacio en disco.
- La ejecución en CPU es lenta, especialmente en la etapa de predicción de estructura, lo que limita su uso en entornos sin aceleración por hardware.
- No se han publicado benchmarks formales en la información disponible, por lo que el rendimiento relativo frente a otros métodos no es verificable.
- No se describen sesgos específicos del modelo, pero al depender de modelos de lenguaje de proteínas preentrenados, podría heredar sesgos de los datos de entrenamiento de ProtT5 y ESMFold.
- La licencia MIT permite uso comercial y modificación, pero es responsabilidad del usuario verificar el cumplimiento de las licencias de los modelos dependientes (ESMFold, ProtT5, etc.).
- El repositorio de HuggingFace muestra un tamaño de 0.0 GB, lo que sugiere que los pesos de GPSite podrían no estar incluidos en el paquete o que el modelo se distribuye de forma separada.

## Enlaces

- HuggingFace: https://huggingface.co/OneScience-Group/GPSite
- Paper (eLife): https://doi.org/10.7554/eLife.93695
- GitHub OneScience: https://github.com/onescience-ai/OneScience
- Perfil de HuggingFace de OneScience: https://huggingface.co/OneScience-Group/models
- Entorno OneCode (demo en línea): https://web-2069360198568017922-iaaj.ksai.scnet.cn:58043/home
