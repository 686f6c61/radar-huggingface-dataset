# Rajey/privacy-filter-ru

## Resumen

privacy-filter-ru es un modelo de clasificación de tokens (token classification) especializado en la detección de datos personales en texto en ruso. Es un ajuste fino del modelo de pesos abiertos openai/privacy-filter, desarrollado por el usuario independiente Rajey y publicado en HuggingFace bajo licencia Apache 2.0. Recibe una cadena de texto y devuelve fragmentos con su tipo y sus desplazamientos en caracteres, dejando en manos de la aplicación que lo integra la decisión de enmascarar, sustituir o cifrar cada entidad.

La arquitectura del modelo base no se ha modificado: se trata de un clasificador de tokens bidireccional con mezcla de expertos (MoE) de 1.399.504.813 parámetros totales y aproximadamente 50 millones activos por token, con tokenizador o200k. El ajuste cambia la cabeza de clasificación para pasar de 8 tipos de entidad a 15 (61 clases en esquema BIOES) e incorpora identificadores específicos del contexto ruso como INN, SNILS, OGRN, poliza OMS, número de pasaporte ruso y matrícula de vehículo.

Su relevancia es práctica: el modelo base de OpenAI está optimizado para inglés y su rendimiento cae fuera de distribución, mientras que este ajuste mejora el F1 por fragmento de 0,56 a 0,85 en el conjunto de evaluación v1 y de 0,48 a 0,61 en el conjunto más exigente test_new. La ficha y el repositorio incluyen métricas desglosadas, comparación explícita contra el modelo base y medidas de latencia en GPU y CPU, algo poco habitual en ajustes finos de autor individual.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Clasificador de tokens bidireccional con mezcla de expertos (MoE); sin cambios respecto a openai/privacy-filter |
| Parametros totales | 1.399.504.813 (aproximadamente 1,4 B) |
| Parametros activos | Aproximadamente 50 M (MoE) |
| Longitud de contexto | 128.000 tokens según OpenAI para el modelo base; no se especifica un valor propio en la model card del ajuste |
| Tipos de cuantizacion | No disponible; el autor documenta ejecución en float32 (por defecto, fijado en config.json) y bfloat16 opcional |
| Idiomas soportados | Ruso (ru) e inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (transformers); copia adicional del mismo checkpoint en formato del paquete opf dentro de `original/` |
| Tokenizador | o200k |
| Pipeline | token-classification |
| Etiquetas | 61 clases en esquema BIOES sobre 15 tipos de entidad |
| Tamano del repositorio | 5,6 GB |
| Requisitos de libreria | transformers >= 5.6 y torch |

Tipos de entidad detectados: `private_person`, `private_address`, `private_phone`, `private_email`, `private_url`, `private_date`, `secret`, `account_number`, `payment_card`, `passport_number`, `inn`, `snils`, `ogrn`, `oms_policy`, `vehicle_plate`.

## Arquitectura y entrenamiento

El modelo es un clasificador de tokens bidireccional con capas de mezcla de expertos. El autor indica explícitamente que la arquitectura no se ha tocado: se conservan el tokenizador o200k, el tronco y la implementación de expertos, y solo cambian la cabeza de clasificación (las etiquetas) y los pesos de las partes no expertas. La salida se decodifica con un Viterbi restringido sobre el esquema BIOES, implementado en el fichero `pii_pipeline.py` (unas 150 líneas) que se carga con `trust_remote_code=True`, y también de forma nativa en el paquete opf incluido en `original/`.

No se han publicado datos sobre el volumen de tokens de entrenamiento, la composición del corpus ni si se emplearon técnicas de alineación como RLHF o DPO; esa información no está disponible. Lo que sí se documenta es el protocolo de evaluación: dos conjuntos de test construidos con plantillas retenidas y textos redactados manualmente, sin solapamiento de plantillas con el entrenamiento. test v1 contiene 132 documentos y 336 fragmentos (17 plantillas reservadas desde la v1 más 36 textos manuales con chats, OCR, logs, texto mixto ruso-inglés y trampas con personas públicas); test_new contiene 78 documentos y 107 fragmentos (9 plantillas nuevas y 24 textos manuales centrados en etiquetas débiles y negativos). En plantillas vistas durante el entrenamiento pero con valores nuevos, el F1 reportado es de 0,96.

Una innovación relevante de la implementación es la configuración de `experts_implementation: grouped_mm` con `dtype: float32` en `config.json`: la implementación `eager` por defecto de transformers tarda unos 250 ms por texto en la misma GPU, mientras que `grouped_mm` en fp32 produce las mismas predicciones en todos los documentos de prueba y reduce la latencia a 31 ms por texto en ejecución individual.

## Capacidades

- Detección de entidades personales en ruso con límites exactos a nivel de carácter: nombres, direcciones, teléfonos, correos, URL personales y fechas.
- Detección de secretos y credenciales: contraseñas, tokens, claves de API, códigos SMS, PIN y CVV, agrupados bajo la etiqueta `secret`.
- Detección de identificadores financieros y administrativos rusos: número de cuenta bancaria, tarjeta de pago, pasaporte (nacional y extranjero), INN de 10 o 12 dígitos, SNILS, OGRN/OGRNIP, póliza OMS y matrícula de vehículo.
- Delimitación estricta del fragmento: en «ИНН 7707083893» solo se marca la cadena numérica, sin las palabras explicativas que la preceden.
- Salida con desplazamientos en caracteres (`start`/`end`) sobre la cadena original, apta para sustitución in situ sin recálculo de offsets.
- Procesamiento por lotes: acepta listas de textos con `batch_size`, devolviendo listas de resultados en el mismo orden.
- Manejo de entradas vacías: devuelve una lista vacía.
- Robustez declarada ante texto mixto ruso-inglés, OCR y conversaciones de chat, según los conjuntos de evaluación manual.
- Dos formatos de inferencia equivalentes: pipeline de transformers y CLI del paquete opf con Viterbi integrado; los logits de ambos formatos difieren como máximo 2,5e-5 y las etiquetas predichas coinciden en el 100 % de los textos de validación.
- No soporta generación de texto, tool calling, agentes, visión ni audio: es exclusivamente un etiquetador de tokens.

## Casos de uso

- Saneamiento de logs antes de su indexación: el modelo se inserta como etapa previa al envío de líneas de log a un SIEM o a un almacén de observabilidad, de modo que teléfonos, correos y tokens de sesión se sustituyen por marcadores antes de persistir. La latencia de 1,9 ms por texto con `batch_size=64` en una RTX 5080 (525 textos/s) permite procesar flujos de decenas de miles de líneas por minuto en una sola GPU de consumo.
- Limpieza de corpus de entrenamiento: antes de reutilizar un dataset scrapeado, se pasa cada documento por el pipeline y se eliminan o pseudonimizan los fragmentos marcados. La etiqueta `secret` cubre específicamente claves de API y contraseñas que aparecen con frecuencia en volcados de repositorios y ficheros de configuración.
- Pseudonimización previa al envío a un LLM de terceros: se detectan las entidades en la petición del usuario, se sustituyen por identificadores estables y se rehidratan en la respuesta. El contexto de 128.000 tokens heredado del modelo base permite procesar documentos completos sin trocear.
- Cumplimiento normativo en atención al cliente: transcripciones de chat y correos de soporte en ruso contienen nombres, direcciones y datos de pago; el modelo genera la anonimización previa al archivado para auditorías, con la posibilidad de conservar el mapeo en un almacén separado. Las 15 etiquetas cubren los identificadores rusos que un DLP genérico no reconoce (SNILS, OMS, OGRN).
- Revisión documental en recursos humanos y legal: extracción de pasaporte, INN y SNILS de currículos y contratos escaneados mediante OCR, con salida de offsets que permite pintar las entidades sobre el texto reconocido para revisión humana.
- Enmascaramiento en pipelines de datos clínicos o administrativos: aunque el modelo no está validado específicamente para dominios sanitarios, la etiqueta `oms_policy` y el conjunto de prueba con OCR lo hacen utilizable como primera pasada en formularios rusos, con revisión humana posterior obligatoria.
- Filtro de secretos en repositorios y sistemas de tickets: detección de tokens y contraseñas antes de que un issue o un commit se haga público, integrable en un pre-commit hook o en una acción de CI que llame al pipeline en modo CPU (27 ms por texto con 12 hilos).
- Construcción de datasets anonimizados para investigación: el modelo permite generar corpus en ruso libres de datos personales con trazabilidad de qué se ha eliminado y qué tipo de entidad era.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de propósito general (MMLU, HumanEval, GSM8K) en la información disponible: el modelo no es generativo y la model card solo reporta métricas de detección de entidades por fragmento (precisión, exhaustividad, F1 y proporción de fragmentos ocultos).

| Conjunto | Modelo | Precision | Recall | F1 | Fragmentos ocultos |
|---|---|---:|---:|---:|---:|
| test v1 (132 docs, 336 fragmentos) | openai/privacy-filter | 0,56 | 0,55 | 0,56 | 0,84 |
| test v1 | privacy-filter-ru v1 | 0,74 | 0,79 | 0,77 | 0,93 |
| test v1 | privacy-filter-ru v2 | 0,83 | 0,86 | 0,85 | 0,95 |
| test_new (78 docs, 107 fragmentos) | openai/privacy-filter | 0,49 | 0,48 | 0,48 | 0,74 |
| test_new | privacy-filter-ru v1 | 0,39 | 0,50 | 0,44 | 0,85 |
| test_new | privacy-filter-ru v2 | 0,55 | 0,67 | 0,61 | 0,97 |

Desglose por etiqueta en test v1 (solo las tres etiquetas con más casos gold publicadas):

| Etiqueta | Casos gold | F1 base | F1 v1 | F1 v2 | Ocultos base | Ocultos v1 | Ocultos v2 |
|---|---:|---:|---:|---:|---:|---:|---:|
| private_person | 131 | 0,67 | 0,82 | 0,88 | 0,79 | 0,95 | 0,95 |
| private_date | 62 | 0,55 | 0,84 | 0,80 | 0,81 | 0,95 | 0,97 |
| private_address | 27 | 0,13 | 0,68 | 0,69 | 0,89 | 0,93 | 0,93 |

Rendimiento medido por el autor (textos de unos 40 tokens, ciclo completo de cadena a fragmentos):

| Entorno | Configuracion | ms por texto | Textos por segundo |
|---|---|---:|---:|
| RTX 5080 | Un texto cada vez | 31 | 32 |
| RTX 5080 | `batch_size=64` | 1,9 | 525 |
| CPU 12 hilos | `batch_size=16` | 27 | 38 |
| RTX 5080 (referencia) | Implementacion `eager` de expertos | ~250 | ~4 |

Nota metodológica: sin el pipeline personalizado y usando la agregación estándar de transformers, el F1 cae de 0,85 a 0,74 porque la agregación por defecto solo entiende los prefijos B-/I- y rompe los fragmentos del esquema BIOES.

## Requisitos de hardware

- Peso de los pesos: 1.399.504.813 parámetros, aproximadamente 5,6 GB en float32 y unos 2,8 GB en bfloat16; el repositorio completo ocupa 5,6 GB e incluye además la copia en formato opf.
- VRAM estimada para inferencia en float32: en torno a 6-7 GB contando activaciones y overhead del runtime; en bfloat16, aproximadamente 3-4 GB. Cálculo estimado a partir del número de parámetros, no medido por el autor.
- GPU de consumo: cabe holgadamente en una RTX 5080 (medición directa del autor) y en cualquier GPU con 8 GB o más, como RTX 3060 Ti, RTX 4060 Ti, RTX 4070, RTX 4090 o RTX 3090.
- GPU de datacenter: A100, H100 o L40S son adecuadas para despliegues de alto throughput; el modelo no requiere memoria ni cómputo de gama alta al tener solo unos 50 M de parámetros activos.
- CPU: viable en producción de bajo volumen; 27 ms por texto con 12 hilos y `batch_size=16` (38 textos/s).
- Opciones de despliegue: pipeline de transformers con `trust_remote_code=True` (recomendado para aprovechar el Viterbi restringido), `pipeline("token-classification", ...)` estándar (peor calidad, F1 0,74), y el CLI del paquete opf sobre el checkpoint de `original/`. En Windows sin Triton es necesario exportar `OPF_MOE_TRITON=0`.
- Formatos no soportados: no se han publicado pesos GGUF ni cuantizaciones para llama.cpp u Ollama, y al ser un modelo de clasificación de tokens no es compatible con vLLM ni TGI en su modo generativo habitual.
- Latencia y throughput medidos: 31 ms/texto en ejecución individual y 1,9 ms/texto (525 textos/s) con `batch_size=64` en RTX 5080. El uso de bfloat16 acelera los lotes grandes aproximadamente un 50 % adicional, a costa de cambiar las predicciones en cerca del 2 % de los documentos.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Etiquetas | F1 test v1 | F1 test_new | Licencia |
|---|---|---:|---|---:|---:|---:|---|
| Rajey/privacy-filter-ru (v2) | 1,4 B totales / ~50 M activos | 128.000 tokens (heredado del base) | ru, en | 15 tipos, 61 clases BIOES | 0,85 | 0,61 | Apache 2.0 |
| Rajey/privacy-filter-ru v1 | 1,4 B / ~50 M activos | 128.000 tokens (heredado del base) | ru, en | No disponible con detalle; esquema previo | 0,77 | 0,44 | Apache 2.0 |
| openai/privacy-filter | 1,4 B / ~50 M activos | 128.000 tokens | Inglés principalmente | 8 tipos | 0,56 | 0,48 | Pesos abiertos (consultar términos en el repositorio) |
| Otros detectores PII multilingues | No disponible | No disponible | No disponible | No disponible | No disponible | No disponible | No disponible |

La comparación relevante es contra el modelo base: el ajuste multiplica por más de seis el F1 en direcciones rusas (0,13 a 0,69) y por más de cinco en personas (0,67 a 0,88), a costa de un rendimiento desigual en fechas (0,84 en v1 frente a 0,80 en v2). En test_new, el más adverso, la mejora sobre el base es de 0,13 puntos de F1 con una precisión de solo 0,55.

## Limitaciones y advertencias

- Rendimiento modesto en dominios no vistos: F1 de 0,61 y precisión de 0,55 en test_new implican que aproximadamente la mitad de las entidades predichas en ese conjunto son falsos positivos; no debe desplegarse sin validación sobre datos propios.
- Especialización limitada al ruso y al inglés. El propio OpenAI advierte en la model card del base que el rendimiento puede degradarse en texto no inglés, alfabetos no latinos y patrones de nombres fuera de distribución; el ajuste mitiga el caso ruso, no el resto.
- No marca personas públicas, organizaciones ni el nombre de una ciudad por sí solo, ni contactos corporativos como líneas de atención gratuita, direcciones `support@`/`noreply@` o sitios web de empresas. Tampoco marca datos bancarios que no pertenecen a una persona (KPP, BIK, cuenta corresponsal). Esto es intencionado, pero implica que no sustituye a un DLP basado en reglas para esos casos.
- Riesgo residual de fuga: en test v1 el 5 % de los fragmentos no queda completamente cubierto por ninguna predicción; en el modelo base ese porcentaje era del 16 %. Un enmascarado automático sin revisión humana puede dejar pasar datos.
- Entidades mal tipificadas: el autor reconoce que parte del acierto del modelo base en `account_number` proviene de que se le asigna esa etiqueta cuando no dispone de una más estrecha, lo que puede confundir cuentas bancarias con otros identificadores numéricos.
- Sin información pública sobre datos de entrenamiento, composición del corpus ni procesos de filtrado; no es posible evaluar sesgos de dominio ni de representación más allá de los conjuntos de prueba publicados.
- Ejecución de código remoto: el uso recomendado requiere `trust_remote_code=True`, lo que descarga y ejecuta `pii_pipeline.py` desde el repositorio. Conviene auditar ese fichero antes de integrarlo en producción.
- bfloat16 altera las predicciones en aproximadamente el 2 % de los documentos; si se exige reproducibilidad estricta frente a las métricas publicadas, debe mantenerse float32.
- La licencia Apache 2.0 permite uso comercial sin restricciones adicionales conocidas, pero el modelo se distribuye sin garantías y el autor no ofrece soporte; el repositorio registra 0 descargas y 0 likes en el momento de la consulta, por lo que no cuenta con validación externa independiente.
- No es un modelo generativo: no redacta, no resume y no decide la política de anonimización. La sustitución, el cifrado o la conservación del mapeo son responsabilidad de la aplicación que lo integra.
- Al ser un ajuste de un modelo de OpenAI, los términos del modelo base podrían imponer condiciones adicionales; conviene revisar la licencia del repositorio original antes de un despliegue comercial.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Rajey/privacy-filter-ru
- Modelo base en HuggingFace: https://huggingface.co/openai/privacy-filter
- Repositorio del paquete opf: https://github.com/openai/privacy-filter
- Anuncio de OpenAI Privacy Filter (inglés): https://openai.com/index/introducing-openai-privacy-filter/
- Anuncio de OpenAI Privacy Filter (ruso): https://openai.com/ru-RU/index/introducing-openai-privacy-filter/
- Análisis de arquitectura y prueba de OpenAI Privacy Filter en Habr: https://habr.com/ru/articles/1027266/
- Cobertura en AlternativeTo: https://alternativeto.net/news/2026/4/openai-releases-privacy-filter-a-local-open-weight-model-built-for-personal-data-masking/
- Cobertura en Windows Report: https://windowsreport.com/openai-launches-privacy-filter-a-new-model-that-auto-redacts-sensitive-data-in-text/
