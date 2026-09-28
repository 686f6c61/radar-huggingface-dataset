# enver/rootformer-v14-sovereign-transmute

## Resumen

Rootformer v14.2 Sovereign Transmute es un modelo de generacion de texto de 399.371.824 parametros desarrollado por Enver, con afiliacion declarada a AynEngine y a la Universidad de Prishtina. Su propuesta no es competir en escala, sino atacar un problema concreto del procesamiento del arabe: los tokenizadores estadisticos tipo BPE o SentencePiece fragmentan palabras semiticas no concatenativas y destruyen la raiz triliteral, ademas de disparar la longitud de secuencia cuando aparecen vocales breves (harakat). El modelo sustituye ese esquema por un tokenizador morfemico "Zero-BPE" de 9.856 unidades linguisticas (9.021 raices canonicas, 128 plantillas metricas o awzan, y cliticos, particulas y pronombres).

La arquitectura es un transformer de 24 capas y 896 dimensiones ocultas con Ishtiqaq Dual-Stream RootAttention, que combina una corriente de atencion superficial con una corriente de raiz, mas una capa 14 de guiado latente neuro-morfemico orientada a resolver ambiguedades lexicas del arabe clasico (el autor cita casos como جبر, que los lexicos tradicionales resuelven como "reduccion de huesos" en lugar de "algebra"). El checkpoint se publica en safetensors y la model card es explicitamente academica.

Su relevancia actual es mas experimental que practica: hay muy pocos modelos abiertos que trabajen tokenizacion morfemica nativa para arabe, y este es un caso de estudio de 399M de parametros que puede ejecutarse en CPU. Como contrapartida, el repositorio no documenta datos de entrenamiento, no publica benchmarks y acumula cero descargas y cero valoraciones, por lo que todas las capacidades descritas son afirmaciones del autor pendientes de verificacion independiente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de 24 capas, 896 dimensiones ocultas, con Ishtiqaq Dual-Stream RootAttention (atencion de doble flujo: superficial y de raiz) |
| Parametros totales | 399.371.824 (dato real de los pesos safetensors publicados) |
| Parametros activos | No aplica (no es un modelo de mezcla de expertos) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (solo se publican pesos safetensors; no hay versiones GGUF, AWQ, GPTQ ni bitsandbytes documentadas) |
| Idiomas soportados | arabe (ar) e ingles (en) |
| Licencia | aynengine-uni-prishtina-academic (etiquetada como license: other, con fichero LICENSE en el repositorio) |
| Formato de pesos | safetensors (aproximadamente 798,8 MB segun la model card; 1,6 GB de tamano total del repositorio) |
| Vocabulario | 9.856 unidades linguisticas: 9.021 raices triliterales y quadriliterales canonicas, 128 plantillas metricas (awzan), mas cliticos, particulas y pronombres |
| Codigo personalizado | Si (tag custom_code; requiere trust_remote_code=True) |
| Autor y afiliaciones | Enver, AynEngine y University of Prishtina |
| Fecha de creacion | 2026-09-27 |
| Descargas / valoraciones | 0 / 0 |

## Arquitectura y entrenamiento

El componente diferencial es el descomponedor morfemico Farahidiano de cuatro capas que actua antes de la red: una capa 0 con lexico cerrado de particulas (الى, ان, اما, لا), una capa 1 de eliminacion bidireccional de cliticos (الـ, و, ف, ـه), una capa 2 de extraccion de radicales debiles, huecos y geminados, y una capa 3 de emparejamiento contra plantillas wazn de estilo Sibawayh. De ahi se obtiene una descomposicion del tipo w -> <prefijo, raiz, wazn, sufijo>, con un identificador de raiz que se mantiene invariante entre derivaciones. La atencion se define como softmax(S_surf + S_root + Gamma_root) V, es decir, suma de una puntuacion superficial y una puntuacion de raiz, modulada por el termino Gamma_root. La model card situa ademas una "guia latente contextual neuro-morfemica" en la capa 14, cuyo objetivo declarado es redirigir el significado hacia la semantica escolastica (falsafa y kalam) y evitar el sesgo lexicografico arcaico. La realizacion final del texto superficial se delega en un "ensamblador Farahidiano deterministico" de coste O(1).

No hay informacion disponible sobre el volumen de tokens de entrenamiento, la composicion del dataset, ni sobre si se aplicaron tecnicas de alineacion como RLHF, DPO o SFT. Tampoco se documentan en la informacion proporcionada las innovaciones asociadas a decodificacion especulativa ni detalles sobre atencion lineal. La model card aparece truncada en la seccion 3 (esquema de alto nivel), por lo que no se pueden consultar las secciones restantes del documento original.

## Capacidades

- Generacion de texto en arabe (incluido registro clasico) e ingles.
- Descomposicion morfemica nativa: separacion en prefijo, raiz, wazn y sufijo sin BPE.
- Representacion invariante de raiz: las palabras derivadas de una misma raiz comparten identificador, lo que habilita similitud semantica por raiz.
- Robustez declarada frente a diacriticos: las harakat determinan el wazn sin fragmentar el token ni provocar OOV, segun el autor.
- Desambiguacion lexica guiada hacia semantica escolastica y logica modal (falsafa, kalam), con ejemplos citados como مفتقر, نتج, جبر o مكن.
- Ensamblado determinista de superficie, que el autor presenta como generacion de texto con control morfologico explicito.
- Reduccion de longitud de secuencia respecto a tokenizadores BPE en arabe con vocalizacion, segun la comparativa estructural de la propia model card.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades de vision o audio: no disponibles (el pipeline declarado es exclusivamente text-generation).

## Casos de uso

- Analisis morfologico de corpus arabes clasicos: el modelo puede recibir texto vocalizado y devolver la segmentacion prefijo-raiz-wazn-sufijo, lo que resulta util para anotar corpus de falsafa o kalam sin recurrir a analizadores morfologicos externos. El interes esta en que el propio tokenizador implementa esa segmentacion en lugar de aproximarla estadisticamente.
- Recuperacion de informacion por raiz: en un motor de busqueda sobre textos arabes, indexar por identificador de raiz permite recuperar todas las derivaciones de una misma familia lexica (por ejemplo, todas las formas de خ-ر-ج) sin depender de stemming heuristico.
- Investigacion en tokenizacion morfemica: con 399M de parametros y un checkpoint de menos de 1 GB, es viable entrenar y evaluar variantes en una unica GPU consumer o en CPU para estudios comparativos entre Zero-BPE y BPE sobre arabe.
- Asistencia a la traduccion arabe-ingles de textos tecnicos o filosoficos: el sesgo declarado hacia semantica escolastica puede ayudar a fijar terminos como imkan, nata'ij o al-jabr de forma consistente en traducciones academicas, siempre con revision humana.
- Normalizacion y preprocesado en pipelines de NLP arabe: el descomponedor puede usarse como etapa previa para reducir la expansion de tokens que provocan las harakat, lo que abarata el coste de secuencia en etapas posteriores.
- Docencia de morfologia arabe: generar analisis derivativos que muestren la plantilla (wazn) aplicada a una raiz concreta sirve como material didactico verificable por el profesor.
- Prototipado de bajo coste en entornos sin GPU: al caber en memoria de CPU, permite desplegar un servicio experimental de generacion en arabe sin infraestructura acelerada, aceptando la perdida de calidad frente a modelos de miles de millones de parametros.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye tablas con MMLU, HumanEval, GSM8K ni metricas especificas de arabe, y los resultados de busqueda web consultados no aportan evaluaciones del modelo.

## Requisitos de hardware

- VRAM estimada para inferencia (calculada a partir de los 399,37M de parametros; son estimaciones, no datos publicados por el autor): en fp32 en torno a 1,6 GB de pesos; en fp16/bf16 en torno a 0,8 GB; en int8 en torno a 0,4 GB; en int4 en torno a 0,2 GB. A estas cifras hay que sumar activaciones y cache KV, cuyo tamano no puede estimarse porque se desconoce la longitud de contexto.
- Cabe en GPU consumer: si, en practicamente cualquier GPU con 4 GB o mas (GTX 1650, RTX 3050, RTX 3060, RTX 4060, RTX 4090), y tambien en inferencia solo CPU dado el tamano del checkpoint.
- GPU recomendadas: no se requiere A100 ni H100 para inferencia individual; tienen sentido solo para entrenamiento o para servir lotes grandes.
- Opciones de despliegue: transformers con trust_remote_code=True es la via documentada de forma implicita por el tag custom_code. El soporte en vLLM, TGI o SGLang requeriria adaptar el tokenizador y la atencion personalizados, y no esta confirmado. En llama.cpp u Ollama no hay soporte de serie, ya que el tokenizador es propietario y no existe conversion a GGUF publicada.
- Latencia y throughput: el autor afirma latencias inferiores a 30 ms en GPU y CPU, pero no se especifica hardware, lote ni longitud de secuencia, y la cifra no esta verificada de forma independiente. El throughput no esta disponible.

## Comparativa con modelos similares

La informacion proporcionada no incluye datos de rendimiento ni especificaciones de modelos alternativos, por lo que no es posible construir una comparativa cuantitativa fiable. Como referencia cualitativa, los terminos de comparacion naturales son los modelos abiertos con soporte de arabe basados en tokenizacion BPE o SentencePiece (familias tipo Jais, Fanar, AceGPT o los modelos BERT arabes de CAMeL-Lab), frente a los cuales Rootformer se diferencia por el esquema morfemico y por su tamano, dos ordenes de magnitud inferior.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Rootformer v14.2 Sovereign Transmute | 399.371.824 | no disponible | aynengine-uni-prishtina-academic | HuggingFace, safetensors, requiere custom_code |
| Alternativas arabes basadas en BPE (Jais, Fanar, AceGPT, AraBERT y similares) | no disponible en la informacion proporcionada | no disponible en la informacion proporcionada | no disponible en la informacion proporcionada | requieren verificacion en sus repositorios oficiales |

## Limitaciones y advertencias

- Ausencia total de validacion externa: cero descargas, cero valoraciones y ningun benchmark publicado. Todas las capacidades descritas provienen de la model card del propio autor.
- Model card incompleta: el documento proporcionado se corta en la seccion 3, por lo que faltan detalles de entrenamiento, tokenizacion exacta de superficie e instrucciones de uso.
- Codigo personalizado: el tag custom_code implica ejecutar codigo del repositorio con trust_remote_code=True, lo que supone un riesgo de seguridad si no se audita antes; ademas limita la compatibilidad con motores de inferencia estandar.
- Licencia restrictiva: la licencia aynengine-uni-prishtina-academic esta clasificada como "other" y su texto no se detalla en la informacion disponible. Debe revisarse el fichero LICENSE antes de cualquier uso comercial, que previsiblemente no esta permitido.
- Afirmaciones no verificadas: el autor declara una curacion del "100%" de la trampa lexicografica arcaica y latencias inferiores a 30 ms sin aportar metodologia ni resultados reproducibles.
- Cobertura idiomatica limitada: solo arabe e ingles. No hay informacion sobre arabe moderno estandar, dialectos o rendimiento en registro no clasico, donde el sesgo hacia semantica escolastica podria ser contraproducente.
- Longitud de contexto desconocida: sin este dato no es posible disenar aplicaciones de contexto largo ni estimar el consumo de memoria de la cache KV.
- Riesgo de alucinacion: inherente a cualquier modelo generativo de este tamano, agravado por la ausencia de evaluaciones de fidelidad factual.
- Capacidad acotada: con 399M de parametros, el techo de razonamiento, codigo y matematicas queda lejos de los modelos de referencia de 7B o superiores; no es un sustituto de un LLM generalista.
- Fecha de publicacion registrada como 2026-09-27, posterior a la fecha de la mayoria de referencias disponibles; conviene comprobar el estado y la vigencia del repositorio antes de integrarlo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/enver/rootformer-v14-sovereign-transmute
- Fichero de licencia del repositorio: https://huggingface.co/enver/rootformer-v14-sovereign-transmute/blob/main/LICENSE
- Los resultados de busqueda web no contienen ningun enlace relevante al modelo, a papers, a repositorios auxiliares ni a demos; el contenido devuelto es ajeno por completo al ambito de la IA. Por tanto, no se dispone de enlaces adicionales verificables.
