# rafalrudol/tt-pii-middleware

## Resumen

TT PII Middleware es un servicio autoalojado de deteccion y redaccion de datos personales (PII) orientado a pasarelas de inferencia desplegadas en la Union Europea. Lo publica el usuario rafalrudol en HuggingFace bajo el identificador rafalrudol/tt-pii-middleware, con licencia Apache-2.0, y su objetivo es detectar identificadores nacionales polacos (PESEL, NIP, REGON, DOWOD, KRS, matriculas de vehiculo, codigos postales, direcciones, fecha de nacimiento y formas societarias) junto con entidades universales (EMAIL, PHONE, IBAN, CARD) para redactarlas o pseudonimizarlas de forma reversible antes de que los prompts abandonen la VPC del operador.

No se trata de un modelo de lenguaje ni de una red neuronal entrenada por el autor: es un middleware que combina reconocedores deterministas con validacion de checksum, reglas personalizadas y modelos estadisticos de spaCy (pl_core_news_md y en_core_web_sm) orquestados mediante Presidio, y expuesto como API HTTP con FastAPI. Su relevancia actual esta en el hueco que cubre: los servicios gestionados de DLP implican salida de red, mientras que este runtime no necesita egreso de red porque los modelos de spaCy van empaquetados en la imagen.

El repositorio de HuggingFace no publica pesos, no declara numero de parametros y, en el momento de la consulta, acumula 0 descargas y 0 me gusta, por lo que se trata de un artefacto reciente y sin validacion independiente por parte de la comunidad. La model card si publica un benchmark propio sobre 3000 documentos sinteticos con micro F1 de 0,955 en el conjunto completo de etiquetas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Pipeline hibrido: reconocedores deterministas con validacion de checksum (pii-core / pii-presidio) + reglas personalizadas + NER estadistico de spaCy (pl_core_news_md, en_core_web_sm) + orquestacion con Presidio Analyzer/Anonymizer, servido por FastAPI |
| Parametros totales | no disponible (no se publican pesos ni recuento de parametros; el servicio reutiliza modelos preentrenados de spaCy) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible (no es un modelo generativo con ventana de contexto; procesa cada documento o peticion completa en una sola llamada) |
| Tipos de cuantizacion | no disponible (no se publican pesos que puedan cuantizarse) |
| Idiomas soportados | polaco (pl) e ingles (en) |
| Licencia | Apache-2.0 para el proyecto; modelos subyacentes con sus licencias de origen (spaCy MIT, Presidio Apache-2.0/MIT) |
| Formato de pesos | no disponible (el repositorio no publica pesos; los modelos de spaCy se incorporan dentro de la imagen del servicio) |

## Arquitectura y entrenamiento

El sistema es una cadena de reconocimiento en cuatro capas descritas por el autor. La primera aplica validacion de checksum sobre PESEL, NIP, REGON, IBAN polaco (PL-IBAN), tarjetas mediante algoritmo de Luhn y correo electronico. La segunda anade reconocedores propios para DOWOD (documento de identidad polaco, con checksum 7-3-1), telefonos polacos, matriculas, codigos postales, direcciones, control de fecha de nacimiento, KRS (opcional) y formas societarias. La tercera capa usa spaCy con pl_core_news_md y en_core_web_sm para PERSON, LOCATION y ORG blanda. La cuarta capa es Presidio, que actua como analizador y anonimizador con modos de enmascarado, reemplazo, hash y etiquetas del tipo [LABEL_NNN].

No hay entrenamiento de un transformer por parte del autor ni datos de RLHF o DPO: el comportamiento depende de reglas, checksums y modelos de spaCy ya preentrenados. El autor si publica un dataset sintetico asociado (rafalrudol/pl-pii-synthetic-v1) con aviso de uso exclusivo para evaluacion, y el benchmark se reproduce con los comandos make eval (3000 documentos, puertas de calidad de MVP) y make eval-public (solo checksums y etiquetas estructuradas). La reproducibilidad esta fijada con seed=42 y evaluacion por coincidencia exacta de span.

La innovacion tecnica destacable es la combinacion de validacion por checksum con NER estadistico, que permite reclamar cero falsos positivos por checksum invalido en PESEL, NIP, REGON, IBAN, DOWOD y CARD, ademas de que el runtime no requiere egreso de red y los registros solo almacenan tipos y recuentos de entidades, nunca el texto.

## Capacidades

- Deteccion de identificadores polacos con validacion de checksum: PESEL, NIP, REGON, DOWOD, PL-IBAN, KRS (opcional) y tarjetas bancarias mediante Luhn.
- Deteccion de entidades universales: EMAIL, PHONE, CARD e IBAN.
- Deteccion de entidades estructuradas polacas: matriculas de vehiculo, codigos postales, direcciones, fecha de nacimiento y formas societarias.
- Reconocimiento de entidades nombradas blandas con spaCy: PERSON, LOCATION y ORG (esta ultima apoyada en patrones de forma societaria).
- Redaccion con cuatro modos: replace, mask, hash y etiquetado con marcadores del tipo [LABEL_NNN].
- Pseudonimizacion reversible: el endpoint /v1/anonymize devuelve un mapeo y un identificador de sesion, y /v1/restore reconstruye el texto original.
- API HTTP con contrato definido: POST /v1/analyze, POST /v1/redact, POST /v1/anonymize, POST /v1/restore y GET /health.
- Capacidad multilingue limitada a polaco e ingles.
- Operacion sin egreso de red: los modelos de spaCy van incluidos en la imagen.
- No dispone de soporte de tool calling, agentes, vision, audio ni modo de razonamiento, ya que no es un modelo generativo.

## Casos de uso

- Pasarela de inferencia en la UE: el middleware se coloca delante de cualquier LLM externo y redacta los prompts antes de que salgan de la VPC, lo que evita enviar PESEL, NIP o IBAN a un proveedor tercero.
- Atencion al cliente automatizada: en conversaciones multi-turno en polaco, el servicio pseudonimiza identificadores con /v1/anonymize y permite restaurarlos en la respuesta final mediante /v1/restore, manteniendo la coherencia de la sesion.
- Enmascarado previo a indexacion en bases vectoriales: antes de generar embeddings para un sistema RAG, se limpian documentos con /v1/redact en modo hash para que el indice no almacene datos personales en claro.
- Analitica y observabilidad: los logs del propio servicio solo guardan tipos y recuentos de entidades, de modo que se puede auditar cuanta PII circula sin registrar el contenido.
- Cumplimiento en sectores regulados polacos (sanidad, legal, banca, seguros): deteccion de DOWOD, KRS y direcciones en expedientes antes de tratarlos con herramientas de terceros.
- Preprocesado de conjuntos de datos para etiquetado: uso del modo /v1/analyze para obtener spans con posiciones exactas y construir corpus anotados a partir del dataset sintetico de referencia.
- Middleware de proteccion en agentes y pipelines de herramientas: intercepta la carga util de las llamadas a funciones para eliminar PII antes de que el agente invoque servicios externos.
- Verificacion de calidad de datos sinteticos: comparar los spans detectados por el servicio con las anotaciones de pl-pii-synthetic-v1 para medir regresiones en los reconocedores.

## Benchmarks y rendimiento

Los unicos datos publicados son los del benchmark propio del autor (seed=42, n=3000, coincidencia exacta de span). No se han publicado comparaciones con otros modelos o servicios en la informacion disponible.

| Conjunto de etiquetas | Micro F1 | Notas |
|---|---:|---|
| Todas las etiquetas | 0,955 | Incluye NER blando |
| Conjunto de reclamacion publica (sin PERSON/ORG/ADDRESS) | ~1,00 | PESEL/NIP/REGON/IBAN/DOWOD/CARD/EMAIL/PHONE/POSTAL/KRS/DOB = 1,0; PLATE mayor o igual que 0,97 |
| Falsos positivos por checksum invalido | 0 | PESEL/NIP/REGON/IBAN/DOWOD/CARD |

Resultados de las etiquetas blandas, que el propio autor califica de heuristicas: PERSON aproximadamente 0,83 de F1, ORG aproximadamente 0,78 de F1 cuando se aplica el patron de forma societaria, y ADDRESS aproximadamente 0,93 de F1.

## Requisitos de hardware

- VRAM: no disponible. El stack descrito (spaCy pl_core_news_md, en_core_web_sm, reglas y Presidio) esta disenado para ejecutarse en CPU, por lo que no requiere GPU.
- GPU recomendadas: no aplica para el funcionamiento descrito; spaCy admite aceleracion opcional por GPU, pero el autor no documenta ninguna configuracion de este tipo.
- Compatibilidad con GPU de consumo: irrelevante en la configuracion por defecto, ya que el servicio puede correr solo con CPU.
- Opciones de despliegue: servicio HTTP con FastAPI (endpoints /v1/analyze, /v1/redact, /v1/anonymize, /v1/restore y /health), instalacion reproducible mediante Makefile (make install, make eval, make eval-public) y empaquetado en imagen con los modelos de spaCy incorporados. No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de componente.
- Latencia y throughput: no disponible. No se publican mediciones de latencia ni de peticiones por segundo.

## Comparativa con modelos similares

La informacion proporcionada no incluye comparaciones con alternativas. A continuacion se contrastan las diferencias conocidas frente a las piezas que el propio proyecto referencia.

| Alternativa | Tipo | Cobertura de identificadores polacos | Licencia | Despliegue |
|---|---|---|---|---|
| rafalrudol/tt-pii-middleware | Middleware autoalojado con checksums + reglas + spaCy + Presidio | PESEL, NIP, REGON, DOWOD, KRS (opcional), PL-IBAN, matriculas, codigos postales, direcciones, fecha de nacimiento, formas societarias | Apache-2.0 | API FastAPI autoalojada, sin egreso de red |
| Presidio estandar (Analyzer + Anonymizer) | Framework de deteccion y anonimizacion | Reconocedores genericos; los checksums polacos concretos no vienen de serie | Apache-2.0 / MIT segun componente | Biblioteca o servicio autoalojado |
| spaCy pl_core_news_md en solitario | Modelo NER estadistico | Solo entidades nombradas (PERSON, LOCATION, ORG); sin checksums ni identificadores estructurados | MIT | Biblioteca en Python |

## Limitaciones y advertencias

- Las etiquetas blandas son heuristicas y el propio autor pide no presentarlas como NER perfecto: PERSON ~0,83 de F1, ORG ~0,78 de F1 y ADDRESS ~0,93 de F1.
- La redaccion no equivale a cumplimiento del RGPD. El autor senala riesgo residual por ruido de OCR, codificaciones adversariales y reidentificacion a partir de contexto no PII.
- Los mapeos generados por /v1/anonymize permiten reidentificar el texto; deben custodiarse con controles de acceso estrictos.
- Cobertura limitada a polaco e ingles; no hay soporte declarado para otros idiomas ni para identificadores de otros paises mas alla de EMAIL, PHONE, IBAN y CARD.
- KRS es una deteccion opcional y no activada por defecto, por lo que su cobertura depende de la configuracion del operador.
- El benchmark es autodeclarado y se calcula sobre un dataset sintetico, con evaluacion por coincidencia exacta de span; no hay validacion independiente ni evaluacion sobre datos reales de produccion.
- El artefacto no registra descargas ni me gusta en HuggingFace y las fechas de creacion y actualizacion son de septiembre de 2026, lo que indica un proyecto muy reciente y sin adopcion verificable.
- No se publican pesos ni parametros, de modo que no es posible auditar el modelo subyacente mas alla de los modelos de spaCy referenciados.
- Aunque la licencia del proyecto es Apache-2.0, los componentes de terceros (spaCy, Presidio, pii-core) mantienen sus licencias de origen (MIT y Apache-2.0), que deben respetarse en un despliegue comercial.
- El modelo no realiza generacion de texto, razonamiento, codigo ni vision: cualquier expectativa de ese tipo es inaplicable.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/rafalrudol/tt-pii-middleware
- Codigo fuente (Apache-2.0): https://github.com/rrudol/tt-pii-middleware
- Dataset sintetico: https://huggingface.co/datasets/rafalrudol/pl-pii-synthetic-v1
- Space de metricas: https://huggingface.co/spaces/rafalrudol/pl-pii-metrics
- Demo de redaccion: https://huggingface.co/spaces/rafalrudol/pl-pii-redact-demo
- Resultados completos del benchmark: eval/RESULTS.md dentro del repositorio de GitHub
- Busqueda web: no se han encontrado enlaces relevantes adicionales; los resultados devueltos corresponden a generadores de imagenes y no guardan relacion con este artefacto.
