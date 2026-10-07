# andresdfx/ner-prostata-xlmr

## Resumen

`ner-prostata-xlmr` es un modelo de reconocimiento de entidades nombradas (NER) en espanol, obtenido por afinamiento de `xlm-roberta-base` sobre el corpus clinico denominado `prostata`. Lo publica el usuario de HuggingFace `andresdfx` y esta especializado en texto clinico del dominio urologico y oncologico de prostata, con 21 etiquetas en formato BIO que cubren entidades como biomarcadores, cancer, cirugia, dosis, edad, fecha, Gleason, medicamento, TNM y tratamiento.

Se trata de un modelo encoder-only de tipo transformer (277.469.205 parametros, 1,1 GB en el repositorio), orientado a clasificacion de tokens, no a generacion de texto. Su interes practico esta en la extraccion estructurada de informacion a partir de informes clinicos: convertir texto libre de historiales y anatomia patologica en campos normalizados que alimenten registros de cancer, bases de datos de investigacion o sistemas de ayuda a la decision.

El autor reporta un F1 de entidad de 0,9714, con precision 0,9692 y recall 0,9737, sobre el corpus de trabajo. El modelo tiene 0 descargas y 0 likes en el momento de la consulta y no declara licencia, lo que condiciona su uso en produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-only (familia XLM-RoBERTa, `xlm-roberta-base`: 12 capas, 768 de dimension oculta, 12 cabezas de atencion, vocabulario de 250.002 tokens) |
| Parametros totales | 277.469.205 |
| Longitud de contexto | 512 tokens del modelo base; el autor entreno con longitud maxima de 256 tokens |
| Tipos de cuantizacion | no disponible (no se publican versiones cuantizadas; los pesos en safetensors admiten cuantizacion dinamica via ONNX Runtime u Optimum) |
| Idiomas soportados | es (espanol) |
| Licencia | no disponible (el autor no la especifica; el modelo base `xlm-roberta-base` se distribuye bajo licencia MIT) |
| Formato de pesos | safetensors (repositorio de 1,1 GB; pesos en FP32) |
| Tarea | token-classification (NER, esquema BIO) |
| Etiquetas | O, B-/I- para BIOMARCADOR, CANCER, CIRUGIA, DOSIS, EDAD, FECHA, GLEASON, MEDICAMENTO, TNM, TRATAMIENTO |

## Arquitectura y entrenamiento

La arquitectura es la de `xlm-roberta-base`: un transformer encoder-only tipo RoBERTa con atencion bidireccional completa, 12 capas y 768 de dimension oculta, al que se anade una cabeza de clasificacion de tokens con 21 etiquetas. Al ser encoder-only, no genera texto: produce una etiqueta por token de entrada. El modelo base es multilingue (100 idiomas), aunque esta ficha solo declara uso en espanol.

El autor indica un afinamiento supervisado sobre el corpus `prostata` con lote de tamano 16, 8 epocas con early stopping (paciencia 3), longitud maxima de secuencia 256 y semilla 42. No se especifican en la informacion disponible el numero de tokens de entrenamiento, la composicion del dataset, el split utilizado para evaluar, ni si se aplicaron tecnicas de ajuste como RLHF o DPO (no procedentes, por otra parte, en una tarea de etiquetado). Tampoco se documentan innovaciones tecnicas adicionales (decodificacion especulativa, atencion lineal, destilacion u otras).

## Capacidades

- Reconocimiento de entidades nombradas en texto clinico en espanol, con 21 etiquetas BIO del dominio prostatico.
- Extraccion de entidades de anatomia patologica: puntuacion Gleason y clasificacion TNM.
- Deteccion de biomarcadores (por ejemplo, valores analiticos como el PSA) y de medicamentos con sus dosis.
- Deteccion de procedimientos quirurgicos y de tratamientos.
- Deteccion de datos temporales (fechas) y de edad.
- Salida a nivel de token, integrable como paso previo de normalizacion, codificacion a terminologias (SNOMED CT, ICD-10) o extraccion de relaciones.
- No soporta generacion de texto, tool calling, function calling ni razonamiento multi-paso: es un modelo discriminativo de etiquetado.
- No dispone de modo thinking, vision ni audio.
- Capacidad multilingue: no declarada; la model card solo indica espanol.

## Casos de uso

- Extraccion estructurada de informes de anatomia patologica de prostata: el modelo identifica Gleason y TNM en el texto libre, de modo que un servicio de urologia puede volcar automaticamente esos campos a su base de datos de tumores sin transcripcion manual.
- Construccion de registros de cancer y cohortes de investigacion: al etiquetar biomarcadores, fechas y tratamientos, permite seleccionar pacientes que cumplan criterios concretos (por ejemplo, un valor de biomarcador en un rango y un tratamiento determinado) sobre miles de informes.
- Pre-anotacion en pipelines de etiquetado manual: el modelo actua como primer pasador sobre el corpus y el anotador humano solo corrige, lo que reduce el coste por documento en proyectos de anotacion clinica.
- Cuadros de mando y explotacion analitica en comites de tumores: la salida etiquetada permite agregar estadisticas de estadio, tratamiento y biomarcadores por periodo.
- Farmacovigilancia y seguridad del paciente: la deteccion de las etiquetas MEDICAMENTO y DOSIS facilita la revision de prescripciones y la deteccion de discrepancias en informes.
- Soporte a la codificacion clinica: las entidades extraidas sirven como entrada a un modulo posterior de mapeo a codigos SNOMED CT o CIE-10, reduciendo el trabajo de codificacion manual.
- Enmascarado o revision de datos sensibles: al detectar FECHA y EDAD, el modelo puede alimentar un paso de minimizacion de datos en entornos de investigacion (no sustituye a un proceso de anonimizacion completo, ya que no cubre nombres ni identificadores).
- Indexacion y busqueda semantica en repositorios documentales clinicos: las entidades extraidas permiten filtrar y buscar informes por biomarcador, cirugia o tratamiento en lugar de por texto libre.

## Benchmarks y rendimiento

Los unicos datos publicados son los reportados por el autor sobre el corpus `prostata`. No se indica el split de evaluacion ni si se trata de un conjunto de test independiente del de entrenamiento, por lo que los valores deben interpretarse con cautela.

| Metrica | Valor reportado |
|---|---|
| F1 (entidad) | 0,9714 |
| Precision | 0,9692 |
| Recall | 0,9737 |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K u otros) en la informacion disponible, y estos no serian aplicables a un modelo encoder-only de clasificacion de tokens.

## Requisitos de hardware

- VRAM estimada en FP32: en torno a 1,1 GB solo para pesos, aproximadamente 1,5-2 GB contando activaciones con lotes pequenos y secuencias de 256-512 tokens.
- VRAM estimada en FP16: en torno a 0,55 GB de pesos, aproximadamente 1 GB con overhead.
- VRAM estimada en INT8 (cuantizacion dinamica ONNX): en torno a 0,3 GB de pesos.
- Cabe sin problema en GPU de consumo: cualquier GPU con 4 GB o mas (GTX 1650, RTX 3050, RTX 3060, RTX 4090) y tambien en GPUs de centro de datos pequenas (T4, L4). Es viable incluso en CPU para inferencia por lotes pequenos.
- Opciones de despliegue: pipeline `token-classification` de HuggingFace Transformers, ONNX Runtime u Optimum para inferencia optimizada, TorchScript, NVIDIA Triton Inference Server y servicios propios con FastAPI. No aplican vLLM, TGI, llama.cpp ni Ollama, orientados a modelos generativos o a pesos GGUF, y no se publica ninguna conversion GGUF.
- Latencia y throughput estimados: no disponibles (no se aportan mediciones).

## Comparativa con modelos similares

No se proporcionan datos comparativos con otros modelos en la informacion disponible. La unica comparacion verificable es con el modelo base del que deriva.

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `ner-prostata-xlmr` | 277.469.205 | 512 tokens (entrenado a 256) | NER clinico en espanol, 21 etiquetas | no disponible | HuggingFace, safetensors |
| `xlm-roberta-base` | no disponible en la informacion proporcionada | 512 tokens | Enmascarado de lenguaje y base para afinamiento | MIT | HuggingFace |

Alternativas de la misma categoria (NER clinico en espanol sobre backbone RoBERTa/XLM-R) existirian en el ecosistema, pero no se dispone de sus especificaciones ni metricas en la informacion proporcionada, por lo que no se incluye comparacion cuantitativa.

## Limitaciones y advertencias

- Dominio muy restringido: el modelo se entrena sobre un unico corpus de prostata; el rendimiento fuera de ese dominio o de ese tipo de informe no esta documentado.
- Idioma unico: solo espanol segun la model card, pese a que el modelo base es multilingue; el afinamiento puede degradar el comportamiento en otros idiomas.
- Sesgos conocidos: no disponibles. No se documenta la composicion demografica ni la procedencia de los datos de entrenamiento, por lo que no puede evaluarse el sesgo por subpoblaciones.
- Riesgo de alucinacion: en un modelo discriminativo no hay generacion, pero si falsos positivos y falsos negativos. Un F1 alto reportado por el propio autor sin split documentado eleva el riesgo de sobreajuste o de fuga de datos entre entrenamiento y evaluacion.
- Truncamiento: con longitud maxima de entrenamiento de 256 tokens, los informes largos se recortan y las entidades posteriores al corte se pierden; se requiere troceado con solapamiento en produccion.
- Cobertura de entidades limitada: no detecta nombres de personas, numeros de historia clinica ni otros identificadores, por lo que no sirve por si solo como anonimizador.
- No realiza extraccion de relaciones ni normalizacion a terminologias: la salida son etiquetas por token.
- Licencia no especificada: sin licencia explicita no hay autorizacion clara de uso comercial; conviene contactar con el autor antes de cualquier despliegue en produccion.
- Madurez: 0 descargas y 0 likes, creado y actualizado el mismo dia; no hay evidencia de uso externo ni de validacion independiente.
- Ambito sanitario: cualquier uso clinico real exige validacion local, supervision profesional y cumplimiento de la normativa de proteccion de datos aplicable.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/andresdfx/ner-prostata-xlmr
- Modelo base: https://huggingface.co/FacebookAI/xlm-roberta-base
- Paper del modelo base (XLM-R): https://arxiv.org/abs/1911.02116
- Paper de RoBERTa: https://arxiv.org/abs/1907.11692
- Repositorio o demo adicionales: no disponibles en la informacion proporcionada.
