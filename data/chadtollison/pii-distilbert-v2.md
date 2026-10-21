# ChadTollison/pii-distilbert-v2

## Resumen

ChadTollison/pii-distilbert-v2 es un modelo de clasificación de tokens (token classification) construido por Chad Tollison mediante fine-tuning de `distilbert-base-cased`. Su función es detectar y etiquetar fragmentos de información personal identificable (PII) en texto: PERSON, EMAIL, PHONE, SSN, CREDIT_CARD e IP_ADDRESS, usando un esquema de etiquetado BIO. No es un modelo generativo: devuelve etiquetas por token y está pensado como etapa de candidatos dentro de una pipeline en la que validadores de formato (checksum de Luhn para tarjetas, reglas estructurales para SSN e IPs) confirman los tipos estructurados.

El modelo tiene 65.200.909 parámetros y un repositorio de 0,3 GB con pesos en safetensors. Se entrenó sobre 8.000 ejemplos sintéticos generados por plantillas, un dato clave para interpretar sus métricas: el autor reporta un F1 de 0,97 a nivel de span en un conjunto de validación de 1.000 ejemplos con plantillas y nombres no vistos, que sube a 0,98 al combinar el modelo con validadores.

Su relevancia práctica es la de un componente ligero y desplegable en CPU para anonimización y filtrado de datos sensibles en pipelines de datos, logs o formularios. La contrapartida principal es que la evaluación se hizo íntegramente sobre datos sintéticos y con formatos estadounidenses, por lo que el rendimiento en texto real puede degradarse de forma significativa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DistilBERT (transformer encoder destilado) con cabeza de clasificacion de tokens y etiquetado BIO |
| Parametros totales | 65.200.909 (65,2 M) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible en la ficha del autor; el modelo base `distilbert-base-cased` admite secuencias de hasta 512 tokens |
| Tipos de cuantizacion | No se publican variantes cuantizadas; solo pesos safetensors en su precision original (cuantificacion a int8/ONNX posible con herramientas externas) |
| Idiomas soportados | No disponible en la ficha; el modelo base `distilbert-base-cased` esta entrenado principalmente en ingles |
| Licencia | Apache 2.0 segun la model card (el metadato de HuggingFace no declara licencia) |
| Formato de pesos | safetensors |
| Tarea (pipeline) | token-classification (no declarada en el metadato de HuggingFace) |
| Etiquetas de salida | PERSON, EMAIL, PHONE, SSN, CREDIT_CARD, IP_ADDRESS (esquema BIO) |
| Modelo base | distilbert-base-cased |
| Tamano del repositorio | 0,3 GB |
| Descargas / likes | 10 / 0 |

## Arquitectura y entrenamiento

La arquitectura es un encoder transformer DistilBERT, es decir, una version destilada de BERT con la mitad aproximada de profundidad que el original, sobre la que se anade una cabeza de clasificacion de tokens que emite etiquetas BIO para seis categorias de PII. El autor parte de los pesos de `distilbert-base-cased` y realiza un fine-tuning supervisado sobre 8.000 ejemplos sinteticos generados mediante plantillas. La model card no documenta el numero de tokens de entrenamiento, la composicion exacta del dataset, ni si se aplicaron tecnicas de RLHF o DPO (en un modelo discriminativo de este tipo no serian el procedimiento habitual).

La innovacion tecnica no esta en la arquitectura, sino en el diseno de uso: el modelo se plantea como etapa de generacion de candidatos, no como detector final. Los tipos estructurados (tarjetas, SSN, IPs) se confirman despues con validadores de formato, incluido el checksum de Luhn para numeros de tarjeta. El autor publica codigo, evaluacion y un servicio FastAPI en el repositorio de GitHub asociado. No se documentan tecnicas como decodificacion especulativa, atencion lineal ni modos de razonamiento, que no aplican a esta clase de modelo.

## Capacidades

- Deteccion de PII por token con etiquetado BIO en seis categorias: PERSON, EMAIL, PHONE, SSN, CREDIT_CARD e IP_ADDRESS.
- Clasificacion de secuencias completas en una sola pasada, sin generacion de texto ni razonamiento multi-paso.
- Extraccion de spans a nivel de caracter valiendose de los offsets del tokenizer, apta para tareas de redaccion (redaction) y enmascarado.
- Integracion como etapa de candidatos en una pipeline con validadores deterministas que confirman checksums y formatos estructurados.
- Despliegue ligero en CPU o GPU de gama baja gracias a sus 65,2 M de parametros.
- Capacidades multilingues: no documentadas; el modelo base es de dominio mayoritariamente ingles.
- No soporta tool calling ni function calling, ni modos de pensamiento, vision o audio: es un modelo discriminativo de clasificacion.

## Casos de uso

- Anonimizacion de logs de aplicacion: el modelo marca spans de email, IP y telefono en cada linea antes de persistirla en un sistema de observabilidad, reduciendo la exposicion de datos personales en herramientas de terceros.
- Redaccion de documentos antes de enviarlos a un LLM externo: se ejecuta el detector sobre el prompt, se sustituyen los spans marcados por placeholders y se envia el texto saneado, lo que encaja con el patron de "candidate-finding + validadores" descrito por el autor.
- Cumplimiento y auditoria de datos (GDPR/CCPA): inventariar que categorias de PII aparecen en un corpus y en que volumen, usando las etiquetas por token para generar metricas agregadas por documento.
- Saneado de datasets de entrenamiento: pasar el modelo sobre un corpus antes de publicarlo o reutilizarlo, filtrando registros que contengan SSN o numeros de tarjeta validados por Luhn.
- Enmascarado en formularios y atencion al cliente: procesar texto libre introducido por usuarios en tickets o chats para ocultar telefonos y correos antes de que el contenido llegue a un agente o a un panel de analitica.
- Preprocesado en pipelines de DLP (data loss prevention): usar la salida del modelo como primera senal y encadenar validadores estructurales para decidir el bloqueo o la cuarentena de un documento.
- Etiquetado asistido para humanos: pre-anotar corpus de PII y revisar solo las discrepancias, dada la velocidad de inferencia de un modelo de 65 M de parametros en CPU.

## Benchmarks y rendimiento

Unicos datos publicados, facilitados por el autor. Evaluacion a nivel de span con coincidencia exacta sobre un conjunto de validacion de 1.000 ejemplos con plantillas y nombres no vistos:

| Configuracion | Precision | Recall | F1 |
|---|---|---|---|
| Modelo solo | 0,97 | 0,98 | 0,97 |
| Modelo + validadores | 0,98 | 0,98 | 0,98 |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, GLUE, CoNLL) en la informacion disponible, ni comparaciones con otros detectores de PII. Las cifras anteriores proceden de una evaluacion propia sobre datos sinteticos y no deben extrapolarse a texto real.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 261 MB en fp32 (65,2 M de parametros x 4 bytes), unos 130 MB en fp16 y unos 65 MB en int8, sin contar memoria de activaciones, que escala con el tamano de lote y la longitud de secuencia.
- GPU recomendadas: cualquier GPU con 1 GB o mas de VRAM es suficiente; el modelo no aprovecha aceleradores de gama alta como A100 u H100 salvo en escenarios de throughput masivo por lotes.
- Cabe en cualquier GPU de consumo: GTX 1050 Ti, GTX 1650, RTX 3060, RTX 4090, e incluso en iGPU con memoria compartida.
- Inferencia en CPU viable: con 65,2 M de parametros es apto para servidores sin GPU y para procesamiento por lotes de grandes volumenes de texto.
- Opciones de despliegue: pipeline `token-classification` de Transformers, exportacion a ONNX Runtime, TorchScript, el servicio FastAPI incluido en el repositorio del autor y frameworks de servido ligeros. vLLM, llama.cpp, Ollama y TGI no estan orientados a este tipo de modelo (encoder discriminativo con salida por token), por lo que no son opciones naturales.
- Latencia y throughput estimados: no disponible; no se han publicado mediciones.

## Comparativa con modelos similares

No se dispone de datos comparativos publicados en la informacion proporcionada. La tabla recoge la comparacion cualitativa posible; las celdas sin datos se marcan como no disponibles en lugar de estimarse.

| Modelo | Parametros | Contexto | Rendimiento PII | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ChadTollison/pii-distilbert-v2 | 65,2 M | No disponible (base: 512 tokens) | F1 0,97 span-level en test sintetico propio | Apache 2.0 (model card) | HuggingFace + GitHub |
| Alternativas tipo BERT-base NER (p. ej. dslim/bert-base-NER) | No disponible | No disponible | No disponible | No disponible | No disponible |
| Herramientas deterministas de redaccion (p. ej. Microsoft Presidio) | No aplica (reglas + NER) | No aplica | No disponible | No disponible | No disponible |

Criterio de comparacion: mismo nicho funcional (deteccion de PII en texto) y modelos encoder de tamano pequeno. Cualquier comparacion cuantitativa exigiria reevaluar todas las opciones sobre el mismo corpus real, algo que no se ha hecho en la informacion disponible.

## Limitaciones y advertencias

- Entrenamiento y evaluacion exclusivamente con datos sinteticos generados por plantillas: el propio autor advierte que el texto real sera mas dificil. El F1 de 0,97 no es trasladable a produccion sin una reevaluacion sobre datos reales anotados.
- Cobertura geografica limitada a formatos estadounidenses: SSN, numeros de telefono y prefijos de tarjeta tipo Visa. Los formatos espanoles (DNI/NIE, IBAN, telefono con prefijo +34) no estan contemplados.
- El modelo no verifica checksums por si mismo; sin validadores externos (Luhn para tarjetas, reglas para SSN e IPs) es esperable un exceso de falsos positivos en tipos estructurados.
- Falsos positivos documentados: palabras capitalizadas al inicio de frase se etiquetan en ocasiones como nombres de persona.
- Riesgo de alucinacion no aplica en el sentido generativo (el modelo no produce texto libre), pero si existe riesgo de falsos negativos y positivos silenciosos en el etiquetado.
- Idiomas no declarados en la ficha y modelo base de dominio mayoritariamente ingles: el comportamiento en castellano es una incognita no medida.
- Restricciones de licencia: la model card declara Apache 2.0, lo que permitiria uso comercial, pero el metadato de HuggingFace no expone licencia. Conviene verificar la procedencia de los datos sinteticos y los terminos del modelo base antes de un despliegue comercial.
- Senales de adopcion muy bajas (10 descargas, 0 likes) y ficha creada y actualizada el mismo dia: no hay evidencia de uso en produccion ni de mantenimiento posterior.
- Para produccion se recomienda tratarlo como una senal mas dentro de un sistema con validadores y revision humana, nunca como unico mecanismo de proteccion de datos.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/ChadTollison/pii-distilbert-v2
- Repositorio con codigo, evaluacion y servicio FastAPI: https://github.com/chadtollison/PII-Detector
- Modelo base: https://huggingface.co/distilbert-base-cased
