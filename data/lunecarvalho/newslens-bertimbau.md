# lunecarvalho/newslens-bertimbau

## Resumen

NewsLens BERTimbau es un modelo de clasificacion de texto en portugues para la deteccion binaria de noticias falsas, desarrollado por el usuario lunecarvalho como parte del proyecto academico NewsLens. Se trata de un fine-tuning de BERTimbau Base (`neuralmind/bert-base-portuguese-cased`), un transformer encoder de tipo BERT preentrenado para portugues de Brasil, con 108.924.674 parametros y una longitud maxima de secuencia de 512 tokens. El modelo clasifica cada articulo en dos clases: `0` (falsa) y `1` (verdadera).

El problema que aborda es la verificacion automatica de desinformacion en portugues, un idioma con menos recursos que el ingles en esta tarea. Frente a las aproximaciones clasicas del propio proyecto (regresion logistica, Naive Bayes multinomial y SVM lineal con TF-IDF), el autor selecciono este modelo como clasificador principal tras la evaluacion experimental. El interes practico del modelo reside en su arquitectura de encoder bidireccional, que captura patrones lexicos, estilisticos e institucionales del corpus mejor que las bolsas de palabras.

Es relevante ahora como ejemplo de fine-tuning ligero sobre un encoder de 110 millones de parametros, desplegable en hardware de consumo, pero debe presentarse con cautela: el propio autor advierte que el 99,44 % de exactitud corresponde exclusivamente a la particion de test del dataset interno y no es extrapolable a noticias arbitrarias de internet. El repositorio tiene 0 descargas y 0 likes, y no se han publicado resultados en benchmarks externos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder tipo BERT (BERTimbau Base), clasificacion de secuencias |
| Parametros totales | 108.924.674 |
| Parametros activos | No aplica: modelo denso, no MoE |
| Longitud de contexto | 512 tokens (longitud maxima de secuencia) |
| Tipos de cuantizacion | No disponible: el autor no publica versiones cuantizadas (pesos entrenados en BF16, distribuidos en safetensors) |
| Idiomas soportados | Portugues (portugues de Brasil, `pt`) |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (repo de 0,4 GB; compatible con PyTorch/Transformers) |
| Modelo base | neuralmind/bert-base-portuguese-cased |
| Tarea (pipeline) | text-classification (clasificacion binaria) |
| Etiquetas | 0 = falsa, 1 = verdadera |
| Framework | Transformers / PyTorch |

## Arquitectura y entrenamiento

La arquitectura es un transformer encoder bidireccional estandar de BERT Base: 12 capas, atencion multi-cabeza completa (no se especifica en la informacion disponible el numero de cabezas y la dimension oculta, aunque corresponden a la configuracion estandar de BERT Base) y una cabeza de clasificacion secuencial sobre el token `[CLS]`. El modelo parte de BERTimbau Base, preentrenado por neuralmind para portugues de Brasil, lo que aporta representaciones idiomaticas del portugues ya aprendidas antes del ajuste fino. No se emplean mecanismos de atencion lineal, decodificacion especulativa ni arquitecturas hibridas: es un encoder denso convencional.

El ajuste fino se realizo sobre articulos derivados del corpus Fake.Br, un conjunto de noticias falsas en portugues. El dataset procesado contiene 7.199 articulos con distribucion aproximadamente equilibrada entre falsas y verdaderas, dividido por muestreo estratificado en 5.759 ejemplos de entrenamiento (80 %), 720 de validacion (10 %) y 720 de test (10 %); el conjunto de test quedo reservado y no se uso para seleccionar el checkpoint. La configuracion de entrenamiento fue de 3 epocas, tasa de aprendizaje 2e-5, tamano de lote 8 (entrenamiento y evaluacion), weight decay 0,01, longitud maxima de secuencia 512 y precision BF16. El mejor checkpoint se selecciono segun el F1-score de validacion. No se documenta en la informacion disponible el uso de RLHF, DPO ni tecnicas de alineacion posteriores, algo poco habitual en modelos de clasificacion.

## Capacidades

- Clasificacion binaria de articulos de noticias en portugues de Brasil: devuelve la etiqueta `falsa` o `verdadera`.
- Analisis de textos de hasta 512 tokens, con truncamiento para documentos mas largos.
- Extraccion de representaciones contextuales del portugues gracias al preentrenamiento de BERTimbau, utiles para fine-tuning posterior en tareas relacionadas.
- Inferencia determinista y ligera mediante `AutoModelForSequenceClassification` de la libreria Transformers.
- No soporta generacion de texto: es un encoder discriminativo, no un modelo generativo.
- No dispone de tool calling ni function calling.
- No dispone de capacidades de agente, razonamiento multi-paso ni modo de pensamiento (thinking mode).
- No dispone de vision, audio ni multimodalidad.
- Capacidad multilingue limitada al portugues; no se ha entrenado ni evaluado en otros idiomas.
- No verifica afirmaciones contra fuentes externas ni recupera evidencia: solo emite una etiqueta sobre el texto de entrada.

## Casos de uso

- Triaje en redacciones y agencias de verificacion: el modelo actua como primer filtro sobre un flujo de articulos en portugues, marcando los candidatos sospechosos para que un verificador humano los revise con prioridad. Es adecuado por su baja latencia y porque el coste computacional es minimo frente a un modelo generativo.
- Moderacion de contenido en plataformas en portugues: integrado como servicio de clasificacion en un pipeline de ingestion, permite etiquetar articulos o publicaciones antes de su distribucion. Requiere validacion previa sobre datos propios, ya que el rendimiento fuera del corpus de entrenamiento no esta medido.
- Monitorizacion de medios y alertas tempranas: procesando feeds RSS o APIs de noticias en tiempo real, el modelo puede puntuar cada pieza y disparar alertas cuando la probabilidad de la clase `falsa` supera un umbral configurable, ajustable para priorizar recall.
- Investigacion academica en PLN: sirve como linea base fuerte frente a enfoques clasicos (SVM con TF-IDF, Naive Bayes) y como punto de partida para estudiar transferencia a otros corpus portugueses.
- Enriquecimiento de datasets: clasificando grandes volumenes de texto portugues para anotacion automatica preliminar, con revision humana posterior de los casos de baja confianza.
- Prototipo NewsLens y demos educativas: el modelo es el componente central del prototipo del proyecto, util para ilustrar tecnicas de fine-tuning de encoders en un contexto docente o de divulgacion.
- Analisis de patrones linguisticos: al ser un encoder contextual, permite inspeccionar representaciones internas y estudiar que rasgos lexicos o estilisticos separan las noticias falsas de las verdaderas en el corpus Fake.Br.
- Clasificacion por lotes en CPU: con 108,9 millones de parametros y pesos en safetensors, puede ejecutar inferencia por lotes en servidores sin GPU, lo que abarata el procesamiento de archivos historicos.

## Benchmarks y rendimiento

Los unicos datos disponibles son los reportados por el autor sobre la particion de test interna (720 articulos, 360 falsos y 360 verdaderos), no sobre benchmarks publicos estandar como MMLU o GLUE.

| Metrica | Valor |
|---|---|
| Exactitud (accuracy) | 99,44 % |
| F1-score | 99,44 % |
| Muestras correctas | 716 de 720 |

Rendimiento por clase:

| Clase | Precision | Recall | F1-score |
|---|---:|---:|---:|
| Falsa | 99,17 % | 99,72 % | 99,45 % |
| Verdadera | 99,72 % | 99,17 % | 99,44 % |

Matriz de confusion:

| | Predicha falsa | Predicha verdadera |
|---|---:|---:|
| Real falsa | 359 | 1 |
| Real verdadera | 3 | 357 |

Comparacion con el SVM lineal del mismo proyecto sobre el mismo conjunto de test (clase positiva = `verdadera`):

| Modelo | Exactitud | Precision | Recall | F1-score |
|---|---:|---:|---:|---:|
| SVM lineal (TF-IDF) | 92,22 % | 91,30 % | 93,33 % | 92,31 % |
| BERTimbau (NewsLens) | 99,44 % | 99,72 % | 99,17 % | 99,44 % |

El modelo cometio 4 errores de clasificacion, frente a 56 del SVM lineal sobre las mismas muestras. No se han publicado resultados de benchmarks en la informacion disponible para tareas distintas a la clasificacion binaria de este corpus.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,5 GB en FP32, 0,25 GB en FP16/BF16 y 0,15 GB en INT8, solo pesos; con activaciones y tokenizador conviene reservar entre 0,5 y 1,5 GB segun el tamano de lote y la longitud de secuencia.
- GPU recomendadas: cualquier GPU con 4 GB o mas de VRAM es suficiente (RTX 3050, RTX 3060, T4, L4). Para lotes grandes o alto throughput, una A100 o H100 estan sobredimensionadas para este tamano, pero permiten maximizar el numero de secuencias por segundo.
- Compatibilidad con GPU de consumo: si, cabe holgadamente en cualquier GPU de consumo moderna e incluso en GPUs integradas con suficiente memoria compartida.
- Inferencia en CPU: viable y habitual en este tamano de modelo; con optimizaciones (ONNX Runtime, cuantizacion dinamica INT8) se obtienen latencias del orden de milisegundos por muestra en CPU de servidor.
- Opciones de despliegue: Hugging Face Transformers con PyTorch, ONNX Runtime, TorchScript, FastAPI o Flask como microservicio, Hugging Face Inference Endpoints y TGI para pipelines de clasificacion. vLLM no es aplicable porque esta orientado a modelos generativos.
- Latencia y throughput estimados: no disponible; el autor no publica mediciones de latencia ni de tokens o muestras por segundo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea / idioma | Rendimiento reportado | Licencia |
|---|---|---|---|---|---|
| NewsLens BERTimbau | 108,9 M | 512 tokens | Clasificacion falsa/verdadera, portugues | 99,44 % exactitud y F1 en test interno | Apache 2.0 |
| SVM lineal con TF-IDF (mismo proyecto) | No aplica | No aplica | Clasificacion falsa/verdadera, portugues | 92,22 % exactitud, 92,31 % F1 en el mismo test | No disponible |
| neuralmind/bert-base-portuguese-cased (modelo base) | 108,9 M | 512 tokens | Modelo de lenguaje enmascarado, portugues | No disponible para esta tarea | No disponible en la informacion proporcionada |
| BERTimbau Large | No disponible | No disponible | Modelo de lenguaje enmascarado, portugues | No disponible | No disponible en la informacion proporcionada |

No se han identificado en la informacion proporcionada otros clasificadores de noticias falsas en portugues con resultados comparables sobre el mismo conjunto de test, por lo que la comparativa con alternativas de la misma categoria queda limitada al SVM lineal del propio proyecto y al modelo base.

## Limitaciones y advertencias

- El 99,44 % de exactitud corresponde exclusivamente a la particion de test derivada del dataset del experimento NewsLens; el autor advierte explicitamente que no debe interpretarse como una tasa de acierto sobre noticias arbitrarias de internet.
- El analisis exploratorio del proyecto detecto patrones lexicos, estilisticos, temporales, institucionales y de fuente en el corpus que pueden contribuir artificialmente a separar noticias falsas y verdaderas; el modelo puede haber aprendido atajos especificos del dataset.
- El rendimiento puede degradarse en noticias procedentes de otras fuentes, otros periodos temporales o registros distintos del corpus Fake.Br.
- Riesgo de alucinacion: no aplica en el sentido generativo, pero si existe riesgo de falsos positivos y falsos negativos con aparente alta confianza; las predicciones no constituyen verificacion de hechos.
- El modelo no contrasta afirmaciones con evidencia externa ni con fuentes fiables.
- Cobertura linguistica limitada al portugues de Brasil; no se ha evaluado en portugues europeo ni en otros idiomas.
- Limitacion de contexto: los textos superiores a 512 tokens se truncan, por lo que la clasificacion puede perder informacion relevante en articulos largos.
- Distribucion sesgada por el dominio: el corpus Fake.Br esta centrado en un contexto editorial concreto (Brasil), lo que puede introducir sesgos de fuente, tematica y periodo.
- Uso en produccion: se recomienda validacion externa obligatoria, monitorizacion de deriva y supervision humana antes de tomar decisiones automatizadas.
- Licencia Apache 2.0: permite uso comercial y modificacion, siempre que se conserven los avisos de copyright y se indiquen los cambios; no se ofrece ninguna garantia.
- Falta de traccion y validacion comunitaria: el repositorio registra 0 descargas y 0 likes, y no consta revision por pares ni evaluacion independiente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/lunecarvalho/newslens-bertimbau
- Repositorio del proyecto NewsLens: https://github.com/lunecarvalho/newslens-project
- Modelo base BERTimbau: https://huggingface.co/neuralmind/bert-base-portuguese-cased
- Corpus Fake.Br: no disponible en la informacion proporcionada (el enlace especifico no aparece en la model card)
- Paper o publicacion academica asociada: no disponible
- Demo en linea: no disponible
- Resultados de la busqueda web: no se han encontrado resultados relevantes sobre este modelo; las entradas recuperadas corresponden a definiciones del termino italiano "gotha" y no guardan relacion con el modelo.
