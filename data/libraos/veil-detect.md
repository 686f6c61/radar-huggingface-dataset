# libraos/veil-detect

## Resumen

veil-detect es un modelo de deteccion de informacion personal (PII) publicado por Libra OS (organizacion `libraos` en HuggingFace). Se trata del detector de spans del pipeline de desidentificacion *veil* que la empresa usa internamente, liberado de forma independiente bajo licencia Apache-2.0. Su funcion es localizar en texto nombres, organizaciones, direcciones, datos de contacto, identificadores, datos financieros, credenciales, fechas y atributos demograficos, devolviendo spans de caracteres etiquetados.

Tecnicamente es un `xlm-roberta-base` ajustado para token-classification con 277.469.205 parametros, esquema BIO sobre 10 etiquetas (21 clases incluyendo `O`) y entrenamiento en ventanas de 384 tokens. Su diseno prioriza el recall: propone todo lo que podria necesitar enmascararse, de modo que la decision de que enmascarar queda en una capa de politica posterior. Segun la model card, sobre tres muestras ciegas de sentencias judiciales de EE. UU. deja sin detectar entre un 3 % y un 5 % de las menciones, frente al 21-24 % del mejor alternativo abierto comparado.

Es relevante ahora porque cubre una necesidad practica de cumplimiento (RGPD, anonimizacion de datasets, redaccion previa a pipelines de LLM) con un modelo pequeno que cabe en 1,9 GiB de VRAM y que tambien funciona solo en CPU: aproximadamente 0,6 s por cada 1.000 caracteres en 2 nucleos y 1,6 GB de RAM.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (XLM-RoBERTa base) con cabeza de clasificacion de tokens; esquema de etiquetado BIO |
| Parametros totales | 277.469.205 (aprox. 278 M) |
| Parametros activos | No aplica: no es un modelo MoE |
| Longitud de contexto | Ventanas de 384 tokens (entrenado y usado asi); documentos largos mediante ventana deslizante con stride de 64 |
| Tipos de cuantizacion | no disponible (el repo solo publica pesos en safetensors; el tamano del repo, 1,1 GB, es coherente con pesos de 32 bits, aunque la model card no lo especifica) |
| Idiomas soportados | Ingles (`en`) y chino (`zh`), incluidos formatos de China continental (documento de identidad, moviles, codigo unificado de credito social, numeros de caso) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (compatible con `transformers`; revision fijable con el tag `v1.0.0`) |

Etiquetas del modelo (10 clases, BIO):

| Etiqueta | Cubre | Ejemplos de la model card |
|---|---|---|
| `person` | Nombres, incluidos solo apellido e iniciales | Maria Gonzalez, Mr Kowalski, A.L.Y., 张伟 |
| `organization` | Empresas, despachos, tribunales, agencias, escuelas | Brightline Hosting, Fla. 4th DCA |
| `location` | Direcciones, calles, ciudades, regiones | 12 Baker Street, 杭州市西湖区文三路100号 |
| `contact` | Correo, telefono, URL, nombres de usuario y handles | +1 415 555 0132, kai_rivers92, wxid_maple199 |
| `id` | Documentos nacionales, pasaportes, numeros de cuenta, de expediente y de solicitud | 110101199003071234, No. 4D17-248, 12345/09 |
| `financial` | Tarjetas, IBAN, cuentas bancarias | DE89 3704 0044 0532 0130 00 |
| `credential` | Contrasenas, claves de API, PIN, codigos de seguridad, frases de recuperacion | (sin ejemplo en la card) |
| `date` | Fechas y horas | 3 May 2009, 2024-08-06 07:27 |
| `date_of_birth` | Fechas de nacimiento de una persona | born 14 March 1987 |
| `demographic` | Ocupacion, nacionalidad, edad, genero, religion, condiciones de salud y similares | Senior Manager, aged 42 |

## Arquitectura y entrenamiento

El modelo parte de `FacebookAI/xlm-roberta-base` y anade una cabeza de clasificacion de tokens sobre 21 clases (BIO sobre las 10 etiquetas anteriores). No es un modelo generativo ni un MoE: es un encoder bidireccional que etiqueta cada token y reconstruye spans a nivel de caracter mediante el mapeo de offsets del tokenizer. La model card insiste en que se use con ventanas de 384 tokens tal y como fue entrenado, con solapamiento (stride de 64) para documentos largos, y desaconseja el pipeline `token-classification` de `transformers` porque, con este tokenizer, sus modos de agregacion parten o fusionan spans de forma incorrecta.

En cuanto a datos, la card declara un linaje de entrenamiento "limpio": solo datasets con licencias permisivas y generadores de plantillas propios. Los datasets citados son `nvidia/Nemotron-PII`, `gravitee-io/pii-detection-dataset`, `gretelai/synthetic_pii_finance_multilingual`, `xusenlin/clue-ner` e `ildpil/text-anonymization-benchmark`. Se afirma explicitamente que no se usaron logs de usuarios ni de chat, y que ninguna etiqueta provino de la salida de un modelo de lenguaje de terceros. No se documentan en la informacion disponible el numero de tokens de entrenamiento, la composicion exacta del dataset ni si hubo RLHF/DPO (no aplicable en un encoder de clasificacion, pero no se detalla el procedimiento de ajuste fino).

No se describen innovaciones tecnicas adicionales (atencion lineal, decodificacion especulativa, etc.). La version publicada es la 1.0.0 (2026-10-21; card revisada el 2026-10-23, pesos sin cambios).

## Capacidades

- Deteccion de PII en texto con granularidad de caracter: devuelve `start`, `end`, `label` y el texto de cada span.
- Cobertura de 10 categorias: personas, organizaciones, localizaciones, contacto, identificadores, financiero, credenciales, fechas, fecha de nacimiento y demograficos.
- Procesamiento de documentos de longitud arbitraria mediante ventana deslizante sobre ventanas de 384 tokens con stride configurable.
- Bilinguismo ingles-chino, con soporte de formatos administrativos de China continental (身份证, numeros de movil, 统一社会信用代码, 案号).
- Orientacion a recall: etiqueta tanto entidades privadas como publicas (jueces, tribunales, organismos) de forma deliberada, para que la capa de politica decida que enmascarar.
- Funcionamiento en CPU sin GPU, lo que permite despliegues on-premise y procesamiento por lotes de bajo coste.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, vision ni audio: es un modelo discriminativo de etiquetado, no generativo.
- No se documenta modo "thinking" ni capacidades de generacion de texto, codigo o matematicas.

## Casos de uso

- Anonimizacion de resoluciones judiciales: el modelo fue evaluado precisamente sobre sentencias de EE. UU. (Caselaw Access Project) y etiqueta nombres de partes, jueces, despachos, tribunales y numeros de expediente (`id`), lo que permite redactar documentos antes de publicarlos o reutilizarlos.
- Cumplimiento de RGPD antes de enviar texto a un LLM: se ejecuta como paso previo de redaccion sobre prompts y documentos; al caber en 1,9 GiB de VRAM o funcionar en CPU, se puede desplegar en la misma infraestructura que el pipeline generativo.
- Redaccion de tickets y transcripciones de atencion al cliente: deteccion de `person`, `contact`, `id` y `credential` en conversaciones multi-turno, troceadas en ventanas de 384 tokens con solapamiento para no perder entidades en los limites.
- Publicacion de datasets y corpus de investigacion: limpieza de PII en corpus textuales (incluidos los dominios financiero y legal de los datasets de entrenamiento) antes de subirlos a un repositorio publico.
- Sector financiero: etiquetado de `financial` (tarjetas, IBAN, cuentas) y `credential` en narrativas de transacciones, informes de fraude o notas de analistas; el modelo se entreno con datos sinteticos financieros multilingues.
- Escaneo de secretos y credenciales en logs y repositorios: la etiqueta `credential` cubre contrasenas, claves de API, PIN y frases de recuperacion, util como filtro previo a la indexacion de logs.
- Mercado chino: procesamiento de documentos con documento nacional de identidad, numeros de movil y codigos de credito social, gracias al entrenamiento con `xusenlin/clue-ner`.
- Revisión asistida por humanos: al priorizar recall, encaja como primera pasada de una cola de revision donde un operador descarta falsos positivos, en lugar de como unica capa de decision.
- Analitica sobre texto anonimizado: extraccion de menciones de organizaciones y localizaciones para estudios agregados sin conservar los identificadores originales.

## Benchmarks y rendimiento

La model card solo publica una evaluacion sobre tres muestras ciegas de sentencias judiciales de EE. UU. del Caselaw Access Project, con gold basado en el acuerdo de dos anotadores independientes. Una mencion se cuenta como detectada si cualquier span predicho se solapa con ella. veil-detect se puntuo junto con la capa de reglas de *veil* para formatos exactos, tal como funciona en produccion.

| Modelo | Tasa de menciones no detectadas (miss rate) |
|---|---|
| libraos/veil-detect | 4,1 % |
| nvidia/gliner-PII | 22,3 % |
| OpenMed nemotron | 41,4 % |
| openai/privacy-filter | 50,3 % |

La card resume el resultado como un 3-5 % de menciones perdidas en las tres muestras, frente al 21-24 % del mejor alternativo abierto. Tambien menciona una metrica de "must-mask recall" sobre las menciones que identifican a alguien directa o indirectamente, pero los valores numericos no aparecen en la informacion disponible.

No se han publicado resultados de benchmarks en la informacion disponible para MMLU, HumanEval, GSM8K ni otras tareas estandar, algo esperable en un modelo de token-classification.

## Requisitos de hardware

- VRAM estimada para inferencia: 1,9 GiB en GPU segun la model card.
- Memoria en CPU: 1,6 GB de RAM.
- Rendimiento en CPU: aproximadamente 0,6 s por cada 1.000 caracteres en 2 nucleos.
- Throughput: la card afirma unas diez veces el throughput de los detectores basados en GLiNER y en LLM con los que se comparo; no se publican valores absolutos (tokens/s o documentos/s) en la informacion disponible.
- GPU: cabe holgadamente en cualquier GPU consumer con 2 GB o mas de VRAM (GTX 1650, RTX 3050, RTX 4060, RTX 4090); no requiere A100 ni H100, y de hecho esta pensado para no necesitarlas.
- Despliegue: `transformers` con `AutoTokenizer` y `AutoModelForTokenClassification` (funciones de ejemplo incluidas en la model card). El pipeline `token-classification` de `transformers` esta desaconsejado por el autor por problemas de agregacion de spans. No se documentan integraciones con vLLM, TGI, llama.cpp ni Ollama (son servidores orientados a modelos generativos), ni existen pesos GGUF publicados.
- Latencia: no se publican cifras de latencia por peticion mas alla de la referencia en CPU; en GPU la card no da datos numericos.

## Comparativa con modelos similares

Comparativa limitada a los datos que aparecen en la model card; el resto de campos no estan disponibles en la informacion proporcionada.

| Modelo | Parametros | Contexto | Miss rate en muestras legales ciegas | Licencia | Idiomas |
|---|---|---|---|---|---|
| libraos/veil-detect | 278 M (277.469.205) | Ventanas de 384 tokens | 4,1 % | Apache-2.0 | en, zh |
| nvidia/gliner-PII | no disponible | no disponible | 22,3 % | no disponible | no disponible |
| OpenMed nemotron | no disponible | no disponible | 41,4 % | no disponible | no disponible |
| openai/privacy-filter | no disponible | no disponible | 50,3 % | no disponible | no disponible |

La ventaja declarada frente a los detectores basados en GLiNER y en LLM no es solo de recall, sino tambien de coste: 278 M de parametros y 1,9 GiB de VRAM frente a arquitecturas mucho mayores, con aproximadamente diez veces su throughput.

## Limitaciones y advertencias

- Orientado a recall, no a precision: etiqueta deliberadamente jueces, tribunales, organismos publicos y nombres conocidos como si fueran datos privados. Enmascarar todo lo que devuelve es la opcion de maxima privacidad, pero produce sobremascarado; la card recomienda anadir una politica propia o un paso de revision.
- El modelo solo detecta; no decide ni aplica el enmascaramiento. Cualquier flujo de produccion necesita una capa posterior que sustituya, generalice o elimine los spans.
- Cobertura linguistica limitada a ingles y chino; no hay soporte declarado de castellano ni de otras lenguas, por lo que su uso en textos en espanol no esta validado.
- Entrenado y evaluado en ventanas de 384 tokens: texto mas alla de esa longitud depende del troceado con solapamiento. Un stride mal elegido puede partir entidades en los limites de ventana.
- El pipeline `token-classification` de `transformers` no es fiable con este tokenizer segun el autor: sus modos de agregacion parten o fusionan spans. Hay que usar el mapeo de offsets manualmente.
- Evaluacion limitada: los unicos resultados publicados son tres muestras ciegas de sentencias de EE. UU.; no hay benchmarks en dominios clinico, financiero real ni conversacional, ni evaluacion independiente conocida.
- Riesgo de falso negativo en formatos no vistos: al depender de datasets y generadores de plantillas propios, los identificadores con formatos nuevos o poco frecuentes pueden escaparse.
- Sesgos: no se documentan analisis de sesgo por genero, origen o idioma; la etiqueta `demographic` agrupa ocupacion, nacionalidad, edad, genero, religion y salud, lo que puede requerir post-procesado para politicas granulares.
- Licencia Apache-2.0: permite uso comercial y modificacion con atribucion y aviso de cambios; no impone restricciones adicionales conocidas, pero conviene revisar las licencias de los datasets de entrenamiento citados si se redistribuye el modelo.
- Repo con muy poca traccion (11 descargas y 0 likes en el momento de la consulta) y versión unica 1.0.0: no hay historial de mantenimiento ni comunidad que valide los resultados. Fijar la revision `v1.0.0` es recomendable para reproducibilidad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/libraos/veil-detect
- Organizacion del autor: https://huggingface.co/libraos
- Modelo base: https://huggingface.co/FacebookAI/xlm-roberta-base
- Revision fijada de los pesos: https://huggingface.co/libraos/veil-detect/tree/v1.0.0
- Grafico de la evaluacion en muestras legales ciegas: https://huggingface.co/libraos/veil-detect/resolve/main/assets/blind-miss-rate.png
- Dataset de entrenamiento: https://huggingface.co/datasets/nvidia/Nemotron-PII
- Dataset de entrenamiento: https://huggingface.co/datasets/gravitee-io/pii-detection-dataset
- Dataset de entrenamiento: https://huggingface.co/datasets/gretelai/synthetic_pii_finance_multilingual
- Dataset de entrenamiento: https://huggingface.co/datasets/xusenlin/clue-ner
- Dataset de entrenamiento: https://huggingface.co/datasets/ildpil/text-anonymization-benchmark

No se han encontrado en la busqueda web papers, blogs, repositorios ni demos adicionales del modelo; el resto de resultados devueltos no guarda relacion con el.
