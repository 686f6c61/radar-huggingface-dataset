# MHRDYN7/native-photoz-mdn-ls-indomain-k9

## Resumen

MHRDYN7/native-photoz-mdn-ls-indomain-k9 es un modelo de estimacion de desplazamiento al rojo fotometrico (photo-z) desarrollado por el usuario MHRDYN7. A diferencia de los modelos de lenguaje, este artefacto resuelve un problema especifico de astrofisica: predecir el redshift de galaxias utilizando unicamente fotometria como entrada, empleando el redshift espectroscopico como unica etiqueta de entrenamiento. El modelo se enmarca en el contexto del proyecto AION-1 y del Legacy Survey, con datos asociados a DESI.

El modelo opera sobre caracteristicas previamente ingenierizadas (feature kind: engineered) y se entrena con una funcion de perdida de verosimilitud negativa basada en mezcla de densidades (spectroscopic_mixture_nll), lo que sugiere que produce una distribucion de probabilidad sobre el redshift en lugar de una unica estimacion puntual. Cuenta con aproximadamente 4,26 millones de parametros entrenables y un checkpoint de unos 0,1 GB, lo que lo situa en el rango de modelos ligeros.

Es relevante ahora porque aborda una de las tareas criticas para los grandes cartografiados espectroscopicos y fotometricos actuales: la estimacion precisa de redshifts para catalogos masivos donde la espectroscopia no es viable. Los resultados reportados en su conjunto de test (n = 3570) muestran un sigma_NMAD de 0,0229 y un sesgo de 0,00079, indicadores habituales de calidad en la comunidad de photo-z.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo de regresion sobre caracteristicas ingenierizadas, libreria pytorch) |
| Parametros totales | 4.259.867 parametros entrenables |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (no es un modelo de lenguaje) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no aplica; entrada fotometrica) |
| Licencia | MIT |
| Formato de pesos | no disponible (repo de 0,1 GB en PyTorch; formato concreto no especificado) |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna mas alla de que se implementa en PyTorch y que consume caracteristicas ingenierizadas (feature kind: engineered). El modelo se entrena exclusivamente con redshift espectroscopico como etiqueta y declara explicitamente que no utiliza el catalogo COSMOS 2025, ni la columna de catalog-redshift, ni imagenes, ni espectros como entradas. La seleccion de datos corresponde a in_pretraining_selection, lo que indica que las muestras pertenecen a un conjunto de seleccion previa al entrenamiento.

La funcion de perdida empleada es spectroscopic_mixture_nll, una verosimilitud negativa sobre una mezcla de densidades, coherente con un enfoque de estimacion probabilistica del redshift. El modelo se entreno con semilla 42. No se dispone de informacion sobre el volumen de tokens, la composicion del dataset de entrenamiento, ni sobre si se aplicaron tecnicas de refinamiento como RLHF o DPO (no aplicables en este dominio). Tampoco se documentan innovaciones tecnicas adicionales como decodificacion especulativa o atencion lineal.

## Capacidades

- Estimacion de redshift fotometrico a partir de fotometria exclusivamente, sin uso de espectros ni imagenes como entrada.
- Prediccion probabilistica del redshift mediante una mezcla de densidades (mixture density network), lo que permite obtener una distribucion y no solo un valor puntual.
- Entrenamiento supervisado con redshift espectroscopico como unica etiqueta.
- Seleccion de caracteristicas de tipo ingenierizado (engineered features).
- Aplicable a datos de Legacy Survey y potencialmente a catalogos asociados a DESI.
- No dispone de capacidades de generacion de texto, razonamiento, codigo, vision general, tool calling, agentes ni multilingueismo.

## Casos de uso

- Construccion de catalogos fotometricos de redshift: el modelo puede aplicarse a catalogos de galaxias con fotometria multibanda para asignar estimaciones de redshift donde no existe espectroscopia, aprovechando su naturaleza ligera (4,26 M de parametros) para procesar grandes volumenes de objetos.
- Analisis de estructura a gran escala: las estimaciones de photo-z alimentan mapas de densidad y estudios de correlacion espacial; el sesgo bajo reportado (0,00079) es relevante para no introducir desplazamientos sistematicos en estas medidas.
- Seleccion de candidatos para seguimiento espectroscopico: el modelo puede priorizar objetos con alta incertidumbre o redshifts de interes para observaciones de seguimiento en instalaciones como DESI.
- Estudios de lentes gravitacionales debiles: se requiere una distribucion precisa de redshifts fotometricos; el enfoque de mezcla de densidades proporciona la incertidumbre por objeto necesaria para la tomografia.
- Validacion cruzada con catalogos espectroscopicos: el modelo puede ejecutarse sobre subconjuntos con redshift espectroscopico conocido para monitorizar sesgos y deriva, usando las metricas sigma_NMAD, bias y eta como indicadores.
- Integracion en pipelines de analisis de survey: al ser un modelo PyTorch ligero con licencia MIT, puede incorporarse en flujos automatizados de reduccion y catalogacion de datos sin dependencias de gran infraestructura.

## Benchmarks y rendimiento

Metricas reportadas por el autor en el conjunto de test (n = 3570):

| Metrica | Valor |
|---|---|
| n (tamano de test) | 3570 |
| sigma_NMAD | 0,022882894780011313 |
| bias | 0,0007858079270375966 |
| eta(0,15) | 0,010924369747899159 |
| eta(0,02) | 0,3941176470588235 |

No se han publicado resultados comparativos con otros modelos de photo-z en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: muy reducida; con 4,26 M de parametros y un checkpoint de 0,1 GB, el modelo cabe holgadamente en cualquier GPU consumer (incluso GPUs integradas o CPU).
- GPU recomendadas: no se requiere hardware de gama alta; una RTX 4090, A100 o H100 son innecesarias para este tamano, aunque pueden acelerar el procesamiento por lotes de catalogos grandes.
- Cabe en GPU consumer: si, en practicamente cualquier GPU con unos pocos cientos de MB de memoria libre.
- Opciones de despliegue: al ser un modelo PyTorch, se puede servir con PyTorch nativo, TorchScript o exportacion a ONNX; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI (no aplicables a este tipo de modelo).
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye modelos comparables de photo-z ni datos de referencia para establecer una comparacion con alternativas de la misma categoria.

## Limitaciones y advertencias

- Entrenado exclusivamente con redshift espectroscopico como etiqueta; su comportamiento fuera de la distribucion de entrenamiento (in_pretraining_selection) no esta documentado.
- No utiliza imagenes ni espectros como entrada, por lo que no puede explotar informacion morfologica o espectral que otros metodos de photo-z si aprovechan.
- Las metricas reportadas corresponden a un unico conjunto de test (n = 3570); no se documenta validacion en otros catalogos ni robustez frente a cambios de survey.
- No se detalla la composicion del dataset de entrenamiento ni posibles sesgos de seleccion, lo que limita la evaluacion de su generalizacion.
- La licencia MIT permite uso comercial, pero no se especifican condiciones adicionales sobre los datos de entrenamiento ni sobre los catalogos de origen.
- No se documenta el formato exacto de los pesos ni instrucciones de uso, lo que puede dificultar la reproducibilidad.
- El modelo no es un LLM: no debe emplearse para tareas de texto, codigo o razonamiento general.

## Enlaces

- Hugging Face: https://huggingface.co/MHRDYN7/native-photoz-mdn-ls-indomain-k9
- No se han encontrado otros enlaces (papers, blogs, repos, demos) en la informacion disponible.
