# lalodeavilaarm/convnext-transformer-mammo-report

## Resumen

ConvNeXt-Transformer para generacion de conclusiones de mamografia es un modelo de imagen a texto desarrollado por el grupo de investigacion Tamez (autoria de Bosques-Palomo, de Avila-Armenta et al.) que genera la conclusion de un informe radiologico de cribado de cancer de mama a partir de las cuatro vistas de un estudio (LCC, LMLO, RCC, RMLO). El modelo predice la categoria BI-RADS y la recomendacion de seguimiento o biopsia asociada. Es la implementacion de referencia del articulo "A ConvNeXt-Transformer Approach for Automated Conclusion Generation from Mammography", enviado a IEEE JBHI y actualmente en revision.

La arquitectura es hibrida y desacoplada: un codificador de imagen ConvNeXt-Small implementado en PyTorch (49,5 M de parametros) proyecta cada vista a un embedding de 768 dimensiones, y un Transformer encoder-decoder implementado en TensorFlow/Keras (76,9 M de parametros) genera el texto de la conclusion. El repositorio de Hugging Face ocupa 1,1 GB e incluye los pesos del codificador y tres configuraciones del generador de texto entrenadas sobre distintos subconjuntos de categorias BI-RADS.

El interes del modelo es acotado y fundamentalmente de investigacion: no es un modelo de proposito general ni un asistente clinico, sino un prototipo reproducible que demuestra que un pipeline ConvNeXt + Transformer puede aproximar la conclusion estructurada de un informe mamografico. Su licencia MIT y la publicacion del codigo en GitHub y Zenodo facilitan la reproduccion experimental, pero su validacion se limita a una unica institucion y a siete plantillas de conclusion estandarizadas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Hibrida: codificador ConvNeXt-Small (PyTorch) + Transformer encoder-decoder (TensorFlow/Keras) |
| Parametros totales | 126,4 M (49,5 M codificador + 76,9 M generador) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en punto flotante; no se documentan variantes cuantizadas) |
| Idiomas soportados | no disponible (las conclusiones generadas siguen plantillas en el idioma de los informes de entrenamiento; no se especifica) |
| Licencia | MIT |
| Formato de pesos | `trained_model.pth` (PyTorch) para el codificador; checkpoint de TensorFlow (`weights/`) para el Transformer |

## Arquitectura y entrenamiento

El pipeline separa codificacion visual y generacion de texto. Cada una de las cuatro vistas mamograficas se procesa con una ConvNeXt-Small que produce un embedding de 768 dimensiones; esos cuatro vectores alimentan un Transformer encoder-decoder que genera la conclusion del informe. La receta de entrenamiento de la ConvNeXt esta adaptada de la solucion que quedo en segundo lugar en el concurso RSNA Screening Mammography Breast Cancer Detection (licencia MIT). El codificador se entreno con mamografias de RSNA y de TecSalud del periodo 2014-2018.

El generador de texto se entreno sobre las conclusiones de informes de radiologos de una unica institucion (TecSalud, Monterrey, Mexico, 2014-2019). Las dianas de entrenamiento son siete plantillas estandarizadas de conclusion, una por categoria BI-RADS y recomendacion, de modo que el modelo reproduce esas plantillas y no texto libre. El repositorio publica tres configuraciones: `transformer/all/` (BI-RADS 1-5, recomendada para uso general), `transformer/1245/` (BI-RADS 1, 2, 4 y 5) y `transformer/1vs5/` (BI-RADS 1 y 5). Los pesos corresponden a las ejecuciones con semilla 42 de los experimentos del articulo, con particion por configuracion. No se documentan en la informacion disponible detalles sobre RLHF, DPO ni decodificacion especulativa.

## Capacidades

- Generacion de la conclusion de un informe de mamografia de cribado a partir de las cuatro vistas de un estudio (LCC, LMLO, RCC, RMLO).
- Prediccion de la categoria BI-RADS (1 a 5) y de la recomendacion de seguimiento o biopsia.
- Salida de probabilidades por clase para BI-RADS 1-5, ademas de la categoria escrita en el texto generado.
- Generacion de texto restringida a siete plantillas estandarizadas de conclusion (no texto libre).
- Extraccion de caracteristicas visuales de cada vista mediante el codificador ConvNeXt-Small, reutilizable por separado (`extract_features.py`).
- No soporta tool calling ni function calling.
- No soporta razonamiento multi-paso ni comportamiento agentico.
- No tiene capacidades multilingues documentadas ni modo de razonamiento explicito.
- No procesa audio ni video; la entrada es exclusivamente imagen mamografica en formato DICOM.

## Casos de uso

- Investigacion en generacion automatica de informes: reproduccion de los experimentos del articulo IEEE JBHI con los pesos publicados y la particion semilla 42, util para comparar arquitecturas imagen-a-texto en radiologia.
- Prototipado de sistemas de apoyo a la lectura en cribado: el modelo puede generar una conclusion candidata que un radiologo revise, siempre en entorno de investigacion y nunca como dispositivo medico.
- Extraccion de caracteristicas mamograficas: el codificador ConvNeXt-Small puede emplearse por separado (`extract_features.py`) para obtener embeddings de 768 dimensiones por vista y alimentar clasificadores o sistemas de recuperacion de casos similares.
- Estudio de calibracion y sesgo en IA medica: las probabilidades por clase BI-RADS permiten analizar el desajuste respecto a la prevalencia real de cribado (el modelo se entreno con datos balanceados), un caso de estudio util para metodos de calibracion.
- Docencia y formacion en radiologia computacional: el pipeline completo (DICOM a CSV de conclusiones) sirve como ejemplo didactico de integracion de un codificador visual en PyTorch con un generador de texto en TensorFlow/Keras.
- Benchmarking de modelos imagen-a-texto en dominio medico: las metricas BLEU, METEOR, BERTScore y los coeficientes kappa publicados permiten usar el modelo como linea base en comparaciones academicas.
- Analisis de confusion entre categorias intermedias: el modelo confunde a menudo BI-RADS 2-4, lo que lo hace util para investigar estrategias de agregacion de categorias o de abstenccion en pipelines clinicos simulados.

## Benchmarks y rendimiento

Resultados en conjuntos de test reservados, media ± desviacion tipica sobre 3 semillas de entrenamiento, segun la model card:

| Configuracion | n | BLEU | METEOR | BERTScore | kappa BI-RADS | kappa biopsia | AUPRC alto riesgo |
|---|---|---|---|---|---|---|---|
| BI-RADS 1 y 5 | 107 | 0,986 ± 0,003 | 0,993 ± 0,002 | 0,996 ± 0,001 | 0,96 ± 0,01 | 0,96 ± 0,01 | 0,998 |
| BI-RADS 1, 2, 4, 5 | 214 | 0,864 ± 0,004 | 0,923 ± 0,001 | 0,962 ± 0,001 | 0,55 ± 0,01 | 0,70 ± 0,02 | 0,935 |
| BI-RADS 1-5 | 267 | 0,759 ± 0,010 | 0,849 ± 0,003 | 0,925 ± 0,001 | 0,42 ± 0,03 | 0,58 ± 0,02 | 0,850 |

Los conjuntos de test estan balanceados por categoria BI-RADS. En la cohorte completa y desbalanceada (4 % de BI-RADS 4-5), el AUROC de alto riesgo es 0,82, segun el material suplementario del articulo. No se han publicado en la informacion disponible comparaciones directas con otros modelos en la misma tabla.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; con 126,4 M de parametros en punto flotante, el modelo completo cabe holgadamente en GPUs de consumo (una RTX 4090 o RTX 3090 con 24 GB sobra ampliamente; incluso GPUs de 8-12 GB deberian bastar para inferencia en precision completa).
- GPU recomendadas: no se especifican en la documentacion; por tamano, cualquier GPU con al menos 8 GB de VRAM es suficiente. El codificador ConvNeXt-Small procesa cuatro vistas por estudio, lo que multiplica el coste por estudio respecto a una sola imagen.
- Cabe en GPU de consumo: si, por el tamano del modelo (126,4 M de parametros en total).
- Opciones de despliegue: el flujo oficial usa scripts de Python (`extract_features.py` y `predict.py`) con PyTorch para el codificador y TensorFlow/Keras para el generador. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a esta arquitectura hibrida.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

No se dispone de comparaciones publicadas con modelos comparables en la informacion proporcionada. Como referencia cualitativa, el modelo se situa en la categoria de sistemas imagen-a-texto especializados en radiologia mamografica, un nicho con pocos modelos publicos de pesos abiertos. La comparativa cuantitativa con alternativas como sistemas multimodales generales (por ejemplo, modelos vision-language de proposito general) no es posible con los datos disponibles, ya que estos no se han evaluado sobre las mismas plantillas ni sobre el mismo conjunto de test.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| ConvNeXt-Transformer mammo-report | 126,4 M | no disponible | MIT | Pesos abiertos en Hugging Face y codigo en GitHub/Zenodo |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Uso exclusivamente de investigacion: no es un dispositivo medico y no esta validado para uso clinico.
- Entrenado en una unica institucion (TecSalud, Monterrey, Mexico, 2014-2019) con informes de un unico lector como referencia; el rendimiento en otras poblaciones, escaneres o instituciones es desconocido.
- Las dianas de entrenamiento son siete plantillas estandarizadas, por lo que el modelo no genera informes de texto libre.
- La concordancia con el radiologo es moderada en la tarea de cinco categorias (kappa aproximado de 0,42); las categorias intermedias (BI-RADS 2-4) se confunden con frecuencia.
- Entrenado con datos balanceados por BI-RADS: las probabilidades predichas no estan calibradas a la prevalencia real de cribado.
- Riesgo de alucinacion: al generar plantillas fijas, el riesgo no es de texto inventado sino de asignar una categoria o recomendacion incorrecta, lo que en un contexto clinico tendria consecuencias graves.
- Sesgos conocidos: no se documentan analisis de sesgo por edad, etnia, densidad mamaria o tipo de escaner; la unica institucion de origen limita la generalizacion.
- Restricciones de licencia: la licencia MIT permite uso comercial del software, pero la ausencia de validacion clinica y la naturaleza de investigacion del modelo desaconsejan cualquier uso en produccion sanitaria.
- Los datos de entrenamiento de TecSalud son privados y no se distribuyen; solo RSNA esta disponible publicamente en Kaggle.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que indica ausencia de validacion por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/lalodeavilaarm/convnext-transformer-mammo-report
- Codigo en GitHub: https://github.com/Tamez-Research-Group/convnext-transformer-mammo-report
- Archivo en Zenodo: https://doi.org/10.5281/zenodo.24484153
- Articulo: "A ConvNeXt-Transformer Approach for Automated Conclusion Generation from Mammography" (Bosques-Palomo, de Avila-Armenta et al., IEEE JBHI, en revision; referencia completa pendiente de publicacion)
- Dataset RSNA Screening Mammography Breast Cancer Detection: disponible en Kaggle (enlace no incluido en la informacion proporcionada)
