# elifsudayi/svm-ner

## Resumen

`elifsudayi/svm-ner` es un modelo de reconocimiento de entidades nombradas (NER) orientado a la deteccion de informacion personal identificable (PII) en textos financieros. No es un modelo neuronal: se trata de un clasificador `LinearSVC` de `scikit-learn` (con `C=0.1`) entrenado sobre caracteristicas artesanales de ventana de contexto y serializado con `joblib`. El problema que aborda es concreto: identificar nombres, correos, telefonos, fechas, identificadores, cuentas, direcciones y empresas en contratos, mensajes SWIFT y facturas, con el objetivo de permitir tareas de anonimizacion o redaccion automatica.

El modelo fue desarrollado por `elifsudayi` en el marco del proyecto de la asignatura COE025 NLP de la Universidad Istinye, y se entrena sobre el split ingles limpio del dataset `gretelai/synthetic_pii_finance_multilingual` (30.545 fragmentos de entrenamiento, 17 etiquetas BIO y 8 categorias de PII). Su relevancia actual es la de un baseline ligero y reproducible: no requiere GPU, ocupa 0,1 GB y sirve como referencia para comparar con aproximaciones neuronales o basadas en LLM en tareas de PII financiera.

La arquitectura es un clasificador lineal sobre caracteristicas hasheadas, no un transformer. No dispone de ventana de contexto en el sentido de los modelos generativos: opera token a token con una ventana local de +/-2 palabras. Su licencia Apache 2.0 permite uso comercial, aunque la calidad medida (entity micro-F1 de 0,7631 y tasa de PII no detectada del 27,2%) limita su uso en produccion sin supervision adicional.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Clasificador lineal `LinearSVC` (scikit-learn) sobre caracteristicas hasheadas |
| Parametros totales | no disponible (modelo lineal; numero de pesos dependiente del vocabulario hasheado) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | ventana local de +/-2 tokens alrededor de cada token |
| Tipos de cuantizacion | no aplica (no es un modelo neuronal; serializacion `joblib`) |
| Idiomas soportados | ingles (`en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | `joblib` (serializacion de `scikit-learn`) |
| Dimension del feature space | 2^20 caracteristicas via `FeatureHasher` |
| Etiquetas | 17 tags BIO en 8 categorias de PII |
| Version de scikit-learn | 1.9.1 (requerida para deserializacion) |
| Tamano del repositorio | 0,1 GB |

## Arquitectura y entrenamiento

El modelo no emplea una arquitectura de aprendizaje profundo. Se trata de un `LinearSVC` de `scikit-learn` que clasifica cada token de forma independiente usando una representacion dispersa construida con `FeatureHasher` de 2^20 dimensiones. Las caracteristicas por token incluyen la forma superficial de la palabra, una ventana de contexto de +/-2 tokens, prefijos y sufijos de 3 caracteres y patrones de forma de palabra (word shapes). El clasificador aprende una frontera lineal en ese espacio hasheado para asignar una de las 17 etiquetas BIO correspondientes a 8 categorias de PII (EMAIL, PHONE, DATE, NAME, ID, ACCOUNT, ADDRESS, COMPANY).

El entrenamiento se realizo sobre el split ingles limpio de `gretelai/synthetic_pii_finance_multilingual`, con 30.545 fragmentos de entrenamiento y evaluacion sobre 3.903 fragmentos de test. La evaluacion se hizo con `seqeval` en modo IOB2 estricto. No se documenta uso de RLHF, DPO ni tecnicas de aumento de datos mas alla del preprocesado del dataset. La innovacion tecnica es limitada por diseno: se trata de un baseline reproducible y de bajo coste computacional, pensado como referencia frente a modelos neuronales en la misma tarea.

## Capacidades

- Clasificacion de tokens en 17 etiquetas BIO correspondientes a 8 categorias de PII: EMAIL, PHONE, DATE, NAME, ID, ACCOUNT, ADDRESS y COMPANY.
- Deteccion de PII en textos financieros en ingles: contratos, mensajes SWIFT y facturas.
- Etiquetado a nivel de token con esquema IOB2 estricto, compatible con `seqeval`.
- Inferencia en CPU sin GPU, con latencia muy baja por tratarse de un modelo lineal.
- Serializacion portable via `joblib`, cargable con `scikit-learn==1.9.1`.
- No soporta tool calling ni function calling.
- No soporta razonamiento multi-paso ni comportamiento de agente.
- No soporta otros idiomas distintos del ingles.
- No dispone de modo thinking, vision ni audio.

## Casos de uso

- Anonimizacion previa a comparticion de contratos: el modelo etiqueta nombres, cuentas, direcciones y empresas en el texto, lo que permite enmascarar entidades antes de enviar documentos a terceros. Es adecuado por su bajo coste y su capacidad de ejecutarse en CPU dentro del propio pipeline documental.
- Filtrado de PII en mensajes SWIFT: dado que el modelo se entrena especificamente sobre textos financieros, puede aplicarse a la deteccion de identificadores de cuenta y nombres en mensajes estructurados antes de su almacenamiento o registro.
- Preprocesado en pipelines de facturacion electronica: el modelo puede marcar campos con PII en facturas para su redaccion automatica o para alimentar un sistema de gestion documental, con la ventaja de no requerir GPU ni infraestructura de inferencia neuronal.
- Baseline de comparacion en investigacion: util como referencia reproducible (entity micro-F1 de 0,7631) frente a modelos neuronales o basados en LLM en tareas de PII financiera, gracias a su licencia Apache 2.0 y a su reducido tamano de 0,1 GB.
- Deteccion de PII en logs de aplicaciones financieras: el modelo puede procesarse por lotes sobre registros en ingles para identificar telefonos, correos y cuentas antes de que los logs se envien a sistemas de observabilidad externos.
- Etiquetado asistido para anotacion humana: las predicciones del modelo pueden servir como preanotacion en herramientas de etiquetado, reduciendo el esfuerzo manual en la construccion de datasets de PII, siempre con revision humana dada la tasa de PII no detectada del 27,2%.
- Prototipado rapido en entornos con restricciones de hardware: al ejecutarse en CPU y ocupar 0,1 GB, permite validar un flujo de deteccion de PII en una maquina de desarrollo sin GPU antes de invertir en un modelo mayor.

## Benchmarks y rendimiento

Resultados de test publicados por el autor (3.903 fragmentos, IOB2 estricto, `seqeval`):

| Metrica | Valor |
|---|---|
| Entity micro-F1 | 0,7631 |
| Token macro-F1 | 0,7672 |
| Entity precision | 0,8019 |
| Entity recall | 0,7279 |
| Tasa de PII no detectada | 27,2% |

F1 por entidad en test:

| EMAIL | PHONE | DATE | NAME | ID | ACCOUNT | ADDRESS | COMPANY |
|---|---|---|---|---|---|---|---|
| 0,9397 | 0,8541 | 0,8127 | 0,8083 | 0,7839 | 0,7245 | 0,6823 | 0,6330 |

No se han publicado comparaciones con otros modelos en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: 0 GB (modelo lineal en CPU).
- GPU recomendadas: no aplica; no requiere GPU.
- Cabe en cualquier CPU consumer; el repositorio ocupa 0,1 GB.
- Opciones de despliegue: carga directa con `joblib` y `scikit-learn==1.9.1`; no es compatible con vLLM, llama.cpp, Ollama ni TGI, que estan orientados a modelos neuronales.
- Latencia y throughput: no disponibles en la informacion proporcionada; por la naturaleza del modelo (clasificacion lineal sobre caracteristicas dispersas) se espera baja latencia en CPU, pero no se aportan cifras medidas.

## Comparativa con modelos similares

No se dispone de datos de benchmarks de modelos alternativos en la informacion proporcionada para establecer una comparacion cuantitativa. A modo de contextualizacion estructural:

| Modelo | Tipo | Parametros | Contexto | Licencia | Despliegue |
|---|---|---|---|---|---|
| elifsudayi/svm-ner | LinearSVC + FeatureHasher | no disponible (lineal) | ventana local +/-2 tokens | Apache 2.0 | CPU, `joblib` |
| Alternativas neuronales de NER (p. ej. BERT-base NER) | Transformer encoder | ~110 M | 512 tokens | variable | GPU/CPU, `transformers` |
| Alternativas basadas en LLM para PII | Transformer decoder | miles de millones | miles de tokens | variable | GPU, vLLM/TGI |

Los datos de rendimiento de las alternativas no estan disponibles en la informacion proporcionada.

## Limitaciones y advertencias

- Tasa de PII no detectada del 27,2% en test: no es adecuado como unico mecanismo de redaccion de PII en produccion sin una capa de verificacion adicional.
- Rendimiento desigual por entidad: COMPANY (0,6330) y ADDRESS (0,6823) son las categorias con peor F1, lo que implica mayor riesgo de fuga en esos tipos de PII.
- Solo soporta ingles; no se ha validado su comportamiento en castellano ni en otros idiomas, pese a que el dataset de origen es multilingue.
- Entrenado sobre datos sinteticos (`gretelai/synthetic_pii_finance_multilingual`), lo que puede introducir un sesgo de distribucion respecto a textos financieros reales.
- Dependencia estricta de `scikit-learn==1.9.1`: versiones distintas pueden provocar errores de deserializacion al cargar el `.joblib`.
- Modelo lineal sin contexto global: no captura dependencias de largo alcance ni patrones complejos que un transformer podria aprender.
- Riesgo de alucinacion no aplica en el sentido generativo (no genera texto), pero si existe riesgo de falsos positivos y falsos negativos en la clasificacion.
- Licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantias ni soporte; el modelo se publica en el contexto de un proyecto academico.
- No se documentan sesgos especificos por demografia, pero al tratarse de un dataset sintetico no puede descartarse un sesgo en la generacion de nombres y entidades.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/elifsudayi/svm-ner
- Repositorio del proyecto: https://github.com/ata-sesli/nlp-project-2
- Dataset de entrenamiento: https://huggingface.co/datasets/gretelai/synthetic_pii_finance_multilingual
