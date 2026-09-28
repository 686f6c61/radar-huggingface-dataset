# HarshilDaGoat/gem-certificate-extractor

## Resumen

`HarshilDaGoat/gem-certificate-extractor` es un modelo de clasificacion de tokens (token-classification) construido sobre `distilbert-base-cased` y ajustado para extraer los campos identificativos de certificados empresariales indios que se adjuntan a las licitaciones de la plataforma publica Government e-Marketplace (GeM). Devuelve un valor por campo con una puntuacion de confianza: GSTIN, PAN, numero Udyam, CIN, codigo de establecimiento EPFO, numero DPIIT, razon social y nombre comercial, actividad, categoria de empresa, porcentaje de contenido local certificado y fecha de validez.

El modelo forma parte de una plataforma de verificacion automatica de pliegos: sustituye a un parser de expresiones regulares en la fase documental y su salida se contrasta despues contra los portales gubernamentales mediante un motor de reglas auditable. Es, por tanto, una ayuda a la extraccion y no un verificador: extraer correctamente un GSTIN no dice nada sobre si ese GSTIN esta activo.

Su relevancia practica es la de un extractor pequeno y desplegable en CPU (65,2 millones de parametros, 0,3 GB de repositorio, licencia Apache 2.0) para un dominio muy vertical, con 12 tipos de entidad y entrenamiento exclusivamente sintetico (54.000 ejemplos de entrenamiento, 3.000 de validacion y 3.000 de test).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder tipo DistilBERT (6 capas, 768 de dimension oculta, 12 cabezas de atencion) con cabeza de clasificacion de tokens |
| Parametros totales | 65.210.137 (dato real del repositorio safetensors) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | 512 tokens (limite arquitectonico de DistilBERT) |
| Tipos de cuantizacion | no disponible (no se publican pesos GGUF, ONNX ni GPTQ; admite cuantizacion dinamica int8 con PyTorch u ONNX Runtime) |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |
| Tarea | token-classification (NER de dominio) |
| Modelo base | distilbert-base-cased (fine-tune) |
| Etiquetas de entidad | 12: ACTIVITY, CATEGORY, CIN, DPIIT, EPFO, GSTIN, LEGAL_NAME, LOCAL_CONTENT, PAN, TRADE_NAME, UDYAM, VALID_UNTIL |
| Datos de entrenamiento | 54.000 ejemplos de entrenamiento, 3.000 de validacion y 3.000 de test, todos sinteticos |
| Tamano del repositorio | 0,3 GB |
| Descargas y likes en HuggingFace | 0 descargas, 0 likes |

## Arquitectura y entrenamiento

Se trata de un fine-tune de `distilbert-base-cased`, un encoder transformer destilado de 6 capas y 768 dimensiones ocultas, con tokenizacion WordPiece sensible a mayusculas (caracteristica relevante aqui, porque los identificadores indios distinguen mayusculas y digitos). Sobre el encoder se anade una cabeza de clasificacion de tokens que asigna una etiqueta BIO a cada token; el modelo no genera texto, solo etiqueta spans. Esto implica un limite duro de 512 tokens por fragmento de entrada, por lo que los documentos largos deben trocearse con solapamiento.

El entrenamiento se genero con un script propio (`ml/extraction/generate.py`) que produce texto sintetico a partir de plantillas de documentos reales (certificado GST REG-06, certificado Udyam, autocertificado de contenido local Make in India, tarjeta PAN, certificado EPFO, reconocimiento DPIIT, carta de autorizacion de OEM, certificado de facturacion de CA y registro NSIC). El generador introduce deliberadamente casos que rompen a las expresiones regulares: el GSTIN del OEM junto al del licitador en cartas de autorizacion, umbrales de contenido local minimo reexpresados antes de la cifra certificada, fechas de inicio de validez, PAN embebidos dentro de GSTIN, clasificaciones Udyam de ejercicios anteriores, numeros UDIN/FRN/ESIC, ademas de confusiones tipicas de OCR (O/0, S/5, I/1) y lineas fusionadas. Los identificadores siguen formatos reales (los GSTIN llevan caracter de control valido) pero no corresponden a ninguna entidad existente. No se documenta uso de RLHF ni de DPO; es un ajuste supervisado de etiquetado de secuencias.

## Capacidades

- Extraccion de entidades por span para 12 campos, con puntuacion de confianza por campo.
- Reconocimiento de formato de identificadores administrativos indios: GSTIN (15 caracteres), PAN, CIN, numero Udyam, codigo EPFO, numero DPIIT.
- Extraccion de nombres: razon social (LEGAL_NAME) y nombre comercial (TRADE_NAME) como entidades separadas.
- Extraccion de valores no identificadores: actividad, categoria de empresa, porcentaje de contenido local y fecha de validez (VALID_UNTIL).
- Robustez declarada frente a ruido de OCR (sustituciones O/0, S/5, I/1) y lineas fusionadas, incorporada al generador de datos sinteticos.
- Desambiguacion contextual de multiples identificadores del mismo tipo en un documento (por ejemplo, GSTIN del OEM frente al del licitador).
- Funciona sobre texto plano: capa de texto de un PDF o salida de OCR. No procesa imagenes directamente.
- Inferencia viable en CPU por tamano (65 M de parametros) y compatible con `transformers` y endpoints de HuggingFace.
- No soporta tool calling, function calling, agentes, multi-step reasoning, vision, audio ni modo de razonamiento. No es un modelo generativo.
- Multilingue: no. Solo ingles; los identificadores son alfanumericos, pero las etiquetas de nombre y actividad dependen del ingles.

## Casos de uso

- Extraccion por lotes en plataformas de licitacion publica: procesar los certificados adjuntos a una puja de GeM, trocear el texto en fragmentos de 512 tokens y agregar los spans para obtener una ficha estructurada por proveedor antes de la revision humana.
- Sustitucion de parsers regex en la fase documental: el modelo cubre variaciones de plantilla y ruido de OCR que obligan a mantener decenas de expresiones regulares fragiles, con un unico punto de mantenimiento (el generador de datos).
- Pre-validacion previa al motor de reglas: emitir la ficha extraida con confianza por campo y marcar unicamente los campos de baja confianza para revision manual, reduciendo el coste de la cola de auditoria.
- Desambiguacion de cartas de autorizacion de OEM: distinguir el GSTIN del fabricante del de la empresa licitadora en documentos donde ambos aparecen, un error clasico de los extractores basados en patron.
- Verificacion de contenido local (Make in India): capturar el porcentaje de contenido local certificado, ignorando los umbrales minimos reexpresados en el mismo texto, como paso previo al contraste con la normativa de la convocatoria.
- Digitalizacion de archivos historicos de certificados: convertir lotes de PDF escaneados (GST, Udyam, EPFO) en un registro estructurado con fechas normalizadas, para trazabilidad y auditoria interna.
- Onboarding y expedientes de proveedores (KYC corporativo): poblar automaticamente el maestro de proveedores con razon social, nombre comercial, PAN y GSTIN, reduciendo la captura manual.
- Etiquetado asistido y active learning: usar las predicciones de este modelo como preetiquetado de documentos reales para corregir y reentrenar con datos de produccion, dado que el entrenamiento actual es 100 % sintetico.
- Servicio de extraccion en CPU: al ser un modelo de 65 M de parametros, puede desplegarse junto al backend en el mismo nodo sin GPU dedicada, con coste marginal bajo.

## Benchmarks y rendimiento

Los unicos datos publicados por el autor son de evaluacion sobre el conjunto de test sintetico reservado, con coincidencia exacta de span a nivel de entidad:

| Campo | Precision | Recall | F1 | Soporte |
|---|---|---|---|---|
| ACTIVITY | 100,0 % | 100,0 % | 100,0 % | 902 |
| CATEGORY | 100,0 % | 100,0 % | 100,0 % | 902 |
| CIN | 100,0 % | 100,0 % | 100,0 % | 124 |
| DPIIT | 100,0 % | 100,0 % | 100,0 % | 312 |
| EPFO | 100,0 % | 100,0 % | 100,0 % | 311 |
| GSTIN | 100,0 % | 100,0 % | 100,0 % | 1174 |
| LEGAL_NAME | 100,0 % | 100,0 % | 100,0 % | 3000 |
| LOCAL_CONTENT | 100,0 % | 99,7 % | 99,8 % | 296 |
| PAN | 100,0 % | 100,0 % | 100,0 % | 593 |
| TRADE_NAME | 100,0 % | 100,0 % | 100,0 % | 296 |
| UDYAM | 100,0 % | 100,0 % | 100,0 % | 902 |
| VALID_UNTIL | 100,0 % | 100,0 % | 100,0 % | 789 |
| Global (micro) | 100,0 % | 100,0 % | 100,0 % | 9601 |

Advertencias sobre estas cifras: proceden del mismo generador sintetico que los datos de entrenamiento, por lo que miden ajuste a la distribucion de plantillas y no rendimiento en documentos reales. El propio autor indica que la exactitud sobre certificados escaneados con disenos distintos a las plantillas sera inferior. No hay resultados publicados en benchmarks estandar (MMLU, GLUE, CoNLL, HumanEval ni equivalentes) ni evaluacion sobre documentos reales.

## Requisitos de hardware

- VRAM estimada en inferencia: menos de 1 GB en fp32 (pesos de ~250 MB mas activaciones con secuencias de 512 tokens); ~130 MB de pesos en fp16; ~65-70 MB de pesos en int8 con cuantizacion dinamica.
- GPU recomendadas: cualquiera con 2 GB o mas, incluidas GTX 1650, T4, L4, RTX 3060 y superiores. No requiere A100 ni H100.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU discreta e incluso en iGPU con suficiente memoria compartida.
- Inferencia en CPU: totalmente viable y probablemente el modo de despliegue razonable; soporta batching para aumentar el throughput.
- Opciones de despliegue: `transformers` con `pipeline("token-classification")` y `aggregation_strategy="simple"`, ONNX Runtime u Optimum para int8, TorchScript, FastAPI/uvicorn como servicio propio, y endpoints de HuggingFace (`endpoints_compatible` aparece en las etiquetas del repositorio). vLLM, TGI, llama.cpp, Ollama y GGUF no son aplicables: es un encoder de clasificacion, no un modelo generativo.
- Latencia y throughput: no disponible. No se publican medidas de latencia ni de tokens por segundo.

## Comparativa con modelos similares

Los datos de los modelos alternativos proceden de su documentacion publica; no se dispone de resultados de benchmarks comparables en la informacion proporcionada.

| Modelo | Parametros | Contexto | Tarea | Licencia | Benchmarks comparables |
|---|---|---|---|---|---|
| gem-certificate-extractor | 65.210.137 | 512 tokens | NER de 12 entidades sobre certificados GeM | apache-2.0 | Solo test sintetico propio (F1 micro 100 %) |
| distilbert-base-cased (modelo base, sin ajustar) | ~66 M (aprox.) | 512 tokens | Modelo de lenguaje enmascarado | apache-2.0 | No aplica a esta tarea |
| dslim/bert-base-NER | ~108 M (aprox.) | 512 tokens | NER generico (PER, ORG, LOC, MISC) | apache-2.0 | No disponible en la informacion proporcionada |
| LayoutLMv3-base | ~133 M (aprox.) | 512 tokens | Comprension de documentos con texto e imagen | no disponible | No disponible en la informacion proporcionada |
| Donut (base) | ~177 M (aprox.) | 2048 tokens | OCR-free document understanding | MIT (segun documentacion publica) | No disponible en la informacion proporcionada |

Diferencias clave frente a las alternativas: este modelo no procesa la imagen del documento (requiere capa de texto o OCR externo), esta especializado en un unico dominio administrativo indio y tiene la mitad de parametros que un BERT base. A cambio, los NER genericos no reconocen GSTIN, Udyam ni CIN, y los modelos de comprension de documentos con vision son entre dos y tres veces mas grandes y mas costosos de desplegar si el objetivo es solo extraer campos.

## Limitaciones y advertencias

- Entrenamiento 100 % sintetico: no ha visto certificados reales. La exactitud en documentos escaneados con maquetas distintas a las plantillas del generador sera inferior a las cifras publicadas; hay que evaluar sobre documentos propios antes de usarlo en produccion.
- Las metricas del 100 % de F1 indican ajuste casi perfecto al generador de datos sinteticos, no capacidad de generalizacion. Tratarlas como un test unitario del pipeline, no como rendimiento esperado.
- No es un verificador: no comprueba si un GSTIN, PAN o registro Udyam existe, esta activo o pertenece a quien lo presenta. La validacion requiere consultar los portales gubernamentales.
- Solo ingles. Los campos de nombre, actividad y categoria se extraen de texto en ingles; no hay soporte declarado para hindi ni para otras lenguas indias.
- Limite de 512 tokens: los certificados o expedientes mas largos deben trocearse, con el riesgo de partir entidades y de introducir duplicados que hay que deduplicar en el postprocesado.
- Riesgo de alucinacion de spans: como cualquier modelo discriminativo, puede asignar una etiqueta de identificador a una cadena que no lo es (por ejemplo, un UDIN o un FRN parecidos a un GSTIN). El motor de reglas posterior es imprescindible.
- Sensibilidad al OCR: aunque el generador simula confusiones O/0, S/5, I/1, errores de OCR mas graves o tablas mal reconstruidas degradaran la extraccion.
- Ambito geografico y normativo cerrado: asume formatos administrativos indios (GST, Udyam, EPFO, DPIIT, NSIC). No es reutilizable sin reentrenamiento en otros paises.
- Datos personales: los documentos tratados contienen identificadores fiscales (GSTIN, PAN) que en la India son datos personales bajo la DPDP Act y, si se procesan datos de personas en la UE, tambien bajo el RGPD. La licencia del modelo no cubre el cumplimiento normativo del tratamiento.
- Restricciones de licencia: Apache 2.0 permite uso comercial, modificacion y redistribucion, sin garantia. Hay que conservar el aviso de licencia y no usar marcas del autor.
- Adopcion practicamente nula: 0 descargas y 0 likes en el momento de la consulta, sin comunidad que haya validado el comportamiento fuera del entorno del autor.
- Fechas de publicacion del repositorio inusuales (creado y actualizado el 2026-09-28 segun los metadatos); conviene verificar la vigencia del repositorio antes de integrarlo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/HarshilDaGoat/gem-certificate-extractor
- Modelo base: https://huggingface.co/distilbert/distilbert-base-cased
- Repositorio del proyecto: no disponible (la model card menciona los scripts `ml/extraction/generate.py` e `ml/extraction/infer.py`, pero no enlaza ninguna URL)
- Paper o informe tecnico: no disponible
- Demo: no disponible
- Busqueda web: los resultados devueltos no guardan ninguna relacion con el modelo ni con procesamiento de documentos; no aportan enlaces utilizables.
