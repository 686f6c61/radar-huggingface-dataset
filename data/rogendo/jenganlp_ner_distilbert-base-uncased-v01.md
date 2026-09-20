# Rogendo/JengaNLP_NER_distilbert-base-uncased-v01

## Resumen

JengaNLP NER distilbert-base-uncased-v01 es un modelo de reconocimiento de entidades nombradas (NER) publicado por el usuario Rogendo dentro del marco JengaNLP, orientado a la extraccion estructurada de datos a partir de informes de incidentes en contextos administrativos y policiales de Africa Oriental. Se trata de un ajuste fino de `distilbert/distilbert-base-uncased` para clasificacion de tokens (`AutoModelForTokenClassification`), no de un modelo generativo: su salida es una etiqueta BIO por token.

El problema que aborda es concreto: los informes de incidentes, denuncias y declaraciones de testigos llegan en texto libre y contienen datos personales y de localizacion que hoy se digitalizan a mano. El modelo extrae entidades como nombres, edades, genero, telefonos, ubicaciones y puntos de referencia, lo que permite automatizar la digitalizacion y, a la vez, anonimizar informacion personal identificable (PII) sin enviar datos a APIs externas.

La relevancia actual del modelo es mas bien de nicho: su tamano reducido (backbone DistilBERT, ~66 millones de parametros) lo hace ejecutable en CPU y en dispositivos de borde, y su licencia Apache-2.0 permite uso comercial. Sin embargo, el repositorio no incluye metricas de evaluacion, el dataset de entrenamiento es sintetico y el modelo acumula cero descargas y cero likes en el momento de redactar esta ficha, por lo que debe considerarse un artefacto experimental y no un componente listo para produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder tipo DistilBERT (destilacion de BERT-base), con cabeza de clasificacion de tokens |
| Parametros totales | ~66 millones (heredados de distilbert-base-uncased) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | 512 tokens (limitacion posicional de DistilBERT) |
| Tipos de cuantizacion | no disponible en el repositorio (solo se publican pesos safetensors en fp32; admite cuantizacion dinamica int8 y exportacion a ONNX por herramientas externas) |
| Idiomas soportados | suajili (sw) e ingles (en), segun la model card; el backbone original esta preentrenado solo en ingles |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (tamano del repositorio: 0,3 GB) |

## Arquitectura y entrenamiento

La arquitectura es un encoder transformer de 6 capas con dimension oculta de 768 y 12 cabezas de atencion, resultado de destilar BERT-base. Sobre ese backbone se anade una cabeza de clasificacion token a token. El tokenizador es WordPiece con vocabulario de 30.522 piezas y no distingue mayusculas (`uncased`), lo que en la practica elimina informacion de capitalizacion util para NER de nombres propios: el modelo debe compensarlo con contexto.

Segun la model card, el ajuste fino se realizo sobre `ner synthetic dataset`, descrito como un conjunto curado de informes de incidentes sinteticos que reflejan patrones linguisticos del texto administrativo de Africa Oriental. No se especifica el numero de ejemplos, la composicion exacta (proporcion sw/en), el numero de epochs, la tasa de aprendizaje ni si hubo una fase de RLHF o DPO (no aplicable en un modelo discriminativo de este tipo). Tampoco se documenta ninguna innovacion tecnica adicional como decodificacion especulativa o atencion lineal.

Existe una discrepancia documental relevante: el texto de la model card afirma que el modelo detecta "10 tipos de entidad especificos", pero la tabla incluida en esa misma model card solo enumera 7 etiquetas (NAME, AGE, GENDER, PHONE_NUMBER, LOCATION, LANDMARK y O, esta ultima no es una entidad). No hay informacion sobre las etiquetas restantes.

## Capacidades

- Extraccion de entidades nombradas en etiquetado BIO sobre texto libre, con seis categorias de entidad documentadas: `NAME`, `AGE`, `GENDER`, `PHONE_NUMBER`, `LOCATION` y `LANDMARK`.
- Deteccion de informacion personal identificable (PII) para tareas de anonimizacion o enmascaramiento previo.
- Procesamiento de texto en suajili e ingles, segun la model card.
- Ejecucion en CPU y en dispositivos de borde gracias al tamano reducido del backbone.
- Integracion directa con el ecosistema Hugging Face Transformers mediante `AutoTokenizer` y `AutoModelForTokenClassification`.
- No soporta generacion de texto, razonamiento, codigo, matematicas, vision, audio, tool calling ni function calling: es un clasificador de tokens, no un modelo generativo ni conversacional.
- No hay evidencia publicada de soporte para agentes ni razonamiento multi-paso.
- No se documenta ningun modo especial (thinking mode, decodificacion restringida, etc.).

## Casos de uso

- Digitalizacion de denuncias y atestados policiales: el modelo convierte abstracts policiales en texto libre en campos estructurados (nombre, edad, genero, telefono, ubicacion), lo que reduce la introduccion manual de datos en sistemas de gestion de casos.
- Anonimizacion de PII antes de compartir datos: al etiquetar `NAME`, `PHONE_NUMBER` y `LOCATION`, puede alimentar una capa de enmascaramiento que permita publicar o ceder conjuntos de datos de incidentes sin exponer datos personales.
- Triaje de emergencias: sobre mensajes de auxilio o partes de incidentes, la extraccion de `LOCATION` y `LANDMARK` permite enrutar el aviso al equipo territorial correspondiente de forma semiautomatica.
- Enriquecimiento de bases de datos de seguridad ciudadana: extraccion por lotes de entidades de informes historicos para construir indices consultables por localizacion o por persona implicada.
- Cumplimiento normativo y privacidad en procesamiento local: al poder ejecutarse en CPU dentro de la propia infraestructura, encaja en flujos donde la normativa de proteccion de datos impide enviar texto a APIs de terceros.
- Preprocesado para pipelines de analitica legal: alimentar un motor de busqueda juridica con entidades normalizadas (persona, lugar, referencia) extraidas de declaraciones y afidavits.
- Componente de bajo coste en un pipeline mayor: al ser un encoder de ~66 millones de parametros, puede actuar como primer filtro de PII antes de pasar el texto a un modelo mayor o a un revisor humano.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de precision, recall ni F1 (ni globales ni por entidad), no se describe un conjunto de evaluacion y no se ofrecen comparaciones con otros sistemas NER. Tampoco hay datos de latencia o throughput medidos.

## Requisitos de hardware

- VRAM estimada para inferencia: menos de 1 GB en fp32 (~268 MB solo de pesos, mas activaciones y overhead de runtime con lotes pequenos); ~134 MB en fp16 y ~67 MB en int8.
- GPU recomendadas: cualquiera con al menos 2 GB de VRAM; una RTX 3060, RTX 4090, T4, A100 o H100 estan sobradamente dimensionadas para este modelo.
- Cabe holgadamente en GPU de consumo e incluso en GPU integradas; la inferencia en CPU es perfectamente viable para cargas moderadas.
- Opciones de despliegue: Hugging Face Transformers (PyTorch) como via documentada en la model card; exportacion a ONNX u ONNX Runtime mediante Optimum; TorchServe o FastAPI para servir el endpoint; Hugging Face Inference Endpoints. vLLM y TGI no son adecuados porque estan orientados a modelos generativos, no a clasificacion de tokens.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Enfoque |
|---|---|---|---|---|---|
| JengaNLP NER distilbert-base-uncased-v01 | ~66 M | 512 tokens | sw, en | apache-2.0 | NER de dominio (informes de incidentes, 6 entidades) |
| Davlan/distilbert-base-multilingual-cased-ner-hrl | ~135 M | 512 tokens | multilingue (10 idiomas de entrenamiento NER) | apache-2.0 | NER generalista (PER, ORG, LOC) |
| Davlan/afro-xlmr-base | ~278 M | 512 tokens | 20 idiomas africanos, incluido suajili | MIT | NER sobre MasakhaNER, base multilingue africana |
| bert-base-multilingual-cased (mBERT) | ~178 M | 512 tokens | 104 idiomas | apache-2.0 | Modelo base, requiere ajuste fino para NER |

Los datos de rendimiento comparado (F1 por idioma y por conjunto de evaluacion) no estan disponibles para el modelo de esta ficha, ya que su autor no publico metricas. Las alternativas citadas si cuentan con evaluaciones publicas en sus respectivas model cards, pero no se dispone de una comparacion directa bajo el mismo conjunto de prueba. La ventaja diferencial de JengaNLP frente a esas alternativas es la granularidad de sus entidades (edad, genero, telefono, punto de referencia), que los modelos NER generalistas no cubren.

## Limitaciones y advertencias

- Ausencia total de evaluacion publicada: no hay F1, precision ni recall, por lo que el rendimiento real es desconocido.
- Entrenamiento con datos sinteticos: la model card indica que el dataset es sintetico y "refleja patrones" del texto administrativo de Africa Oriental. El comportamiento sobre texto real puede degradarse de forma significativa, especialmente ante ruido, abreviaturas, errores ortograficos o mezcla de idiomas.
- Backbone `uncased`: la ausencia de distincion entre mayusculas y minusculas perjudica la deteccion de nombres propios, una senal clave en NER.
- Discrepancia en la documentacion: se anuncian 10 tipos de entidad pero solo se documentan 6 entidades mas la etiqueta `O`. Las etiquetas del `config.id2label` podrian no coincidir con lo descrito.
- Cobertura limitada a suajili e ingles: no hay indicios de soporte para otras lenguas africanas ni para el espanol.
- Ventana de contexto de 512 tokens: los informes largos requieren troceado, con el riesgo de partir entidades en los limites de los fragmentos.
- Riesgo de alucinacion no aplicable en el sentido generativo (el modelo no genera texto), pero si existe riesgo de falsos positivos y falsos negativos al asignar etiquetas.
- Sesgos potenciales: al entrenarse con datos sinteticos generados por el autor, puede reproducir los sesgos de ese generador y fallar mas en nombres, localizaciones o formatos de telefono poco representados.
- Licencia apache-2.0: permite uso comercial y modificacion sin restricciones relevantes, pero el autor no ofrece garantias ni soporte.
- Adopcion nula: 0 descargas y 0 likes en el momento de redactar; no hay evidencia de uso en produccion ni de validacion por terceros. La fecha de creacion del repositorio es posterior al conocimiento de referencia habitual, dato a verificar antes de integrarlo.
- No debe usarse como sistema unico de decision en contextos legales o policiales sin revision humana, dado que extrae PII y cualquier error afecta a personas identificables.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Rogendo/JengaNLP_NER_distilbert-base-uncased-v01
- Modelo base: https://huggingface.co/distilbert/distilbert-base-uncased
- Paper de DistilBERT (Sanh et al., 2019): https://arxiv.org/abs/1910.01108
- Paper de BERT (Devlin et al., 2018): https://arxiv.org/abs/1810.04805
- Modelo alternativo NER multilingue: https://huggingface.co/Davlan/distilbert-base-multilingual-cased-ner-hrl
- Modelo alternativo NER para lenguas africanas: https://huggingface.co/Davlan/afro-xlmr-base
- Los resultados de la busqueda web proporcionada no contienen informacion relevante sobre este modelo ni sobre JengaNLP: corresponden a herramientas en linea de fusion de PDF y no se han utilizado como fuente.
