# malinali-app/opus-mt-lg-fr

## Resumen

malinali-app/opus-mt-lg-fr es un paquete de pesos derivado del modelo Helsinki-NLP/opus-mt-lg-fr, un sistema de traduccion automatica neuronal para el par idiomatico luganda (lg) a frances (fr). El autor, malinali-app, no entrena desde cero: republica los pesos originales en formato safetensors junto con tokenizadores rapidos preparados para su uso en el motor de inferencia Candle (Rust), a traves de su componente marian_flutter, orientado a la ejecucion en dispositivo (on-device) dentro de la aplicacion Malinali.

El modelo pertenece a la familia OPUS-MT, basada en la arquitectura MarianMT, un transformer encoder-decoder de tipo text2text-generation con aproximadamente 76,1 millones de parametros totales y un peso de repositorio de 0,3 GB. El problema que resuelve es la traduccion directa luganda-frances en entornos sin conectividad o con requisitos de privacidad, donde no es viable depender de una API en la nube.

Su relevancia es limitada pero concreta: el luganda es un idioma con recursos escasos y pocos modelos abiertos lo cubren; disponer de una version empaquetada y ligera permite integrarlo en aplicaciones moviles o de escritorio. Conviene subrayar que no se trata de un modelo nuevo ni reentrenado, sino de una redistribucion, por lo que sus capacidades y limitaciones son en esencia las del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MarianMT (transformer encoder-decoder, text2text-generation) |
| Parametros totales | 76.149.698 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible; el repositorio distribuye pesos en safetensors (precision completa) |
| Idiomas soportados | luganda (lg), frances (fr) |
| Licencia | no disponible en la ficha; el autor indica seguir la del modelo base (habitualmente CC-BY 4.0 para OPUS-MT) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura MarianMT, un transformer de tipo encoder-decoder disenado especificamente para traduccion automatica, con atencion de multiples cabezas y sin componentes de tipo MoE o SSM. El repositorio incluye un `config.json` de Marian, el fichero `model.safetensors` con los pesos y dos tokenizadores rapidos independientes (uno para la fuente, `tokenizer-enc.json`, y otro para el destino, `tokenizer-dec.json`), derivados de la conversion de los modelos SentencePiece originales al formato JSON de tokenizadores rapidos de Hugging Face.

No se dispone de informacion sobre el volumen de tokens de entrenamiento, la composicion exacta del corpus ni la aplicacion de tecnicas de RLHF o DPO en esta ficha; estos datos corresponden al trabajo original de Helsinki-NLP sobre OPUS-MT, entrenado con corpus paralelos del proyecto OPUS. La contribucion concreta de malinali-app se limita a reempaquetar los pesos y convertir los tokenizadores para inferencia on-device, por lo que no introduce ninguna innovacion arquitectonica ni de entrenamiento.

## Capacidades

- Traduccion automatica de texto en la direccion luganda a frances (unico sentido soportado).
- Generacion de texto condicionada a una secuencia fuente (text2text-generation).
- Inferencia en dispositivo mediante el motor Candle (componente marian_flutter), sin dependencia de servicios en la nube.
- Integracion con el ecosistema transformers de Hugging Face gracias a los ficheros de configuracion y tokenizadores incluidos.
- Traduccion frase a frase; no esta documentado el soporte de documentos largos completos.
- No hay evidencia en la informacion disponible de soporte de tool calling, function calling, agentes, razonamiento multi-paso, vision, audio ni modo de pensamiento (thinking mode).
- Capacidad multilingue limitada a los dos idiomas declarados (lg, fr).

## Casos de uso

- Traduccion de luganda a frances en aplicaciones moviles sin conexion: el paquete esta pensado para ejecucion on-device con Candle, de modo que la app Malinali puede traducir texto localmente sin enviar datos a un servidor, con el consiguiente ahorro de ancho de banda y mejora de privacidad.
- Traduccion de mensajes y conversaciones en tiempo casi real: al tratarse de un modelo ligero de ~76 M de parametros, la latencia por frase es reducida y cabe en dispositivos modestos, lo que permite integrarlo en chats o clientes de mensajeria.
- Digitalizacion de documentos y formularios en luganda hacia frances: textos administrativos, medicos o educativos escritos en luganda pueden preprocesarse por fragmentos y traducirse a frances para su revision por personal que no domina el luganda.
- Herramientas de asistencia linguistica para ONG y cooperacion: organizaciones que operan en regiones de Uganda pueden usar el modelo para traducir comunicaciones internas o material de campo del luganda al frances.
- Preprocesado en pipelines de datos multilingues: traduccion de lotes de textos en luganda a frances para normalizar corpus antes de tareas posteriores de analisis, indexacion o busqueda.
- Investigacion en traduccion de idiomas con pocos recursos: sirve como referencia reproducible (via el modelo base) para comparar tecnicas de traduccion de bajo recurso sobre el par lg-fr.
- Integracion en aplicaciones de escritorio o embebidas: al distribuirse en safetensors y con tokenizadores rapidos, puede cargarse en entornos Rust/Candle o mediante transformers para prototipos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La ficha del modelo y las busquedas realizadas no aportan metricas de BLEU, chrF, MMLU, HumanEval, GSM8K ni de ninguna otra tarea; tampoco se incluyen comparativas cuantitativas con modelos alternativos.

## Requisitos de hardware

- VRAM o memoria estimada para los pesos (calculo a partir de los 76.149.698 parametros):
  - Precision completa FP32: aproximadamente 305 MB.
  - FP16: aproximadamente 152 MB.
  - INT8: aproximadamente 76 MB.
  - INT4: aproximadamente 38 MB.
  (Estimaciones aritmeticas; el repositorio solo distribuye pesos en safetensors sin cuantizar.)
- GPU: cabe con holgura en cualquier GPU consumer (por ejemplo, RTX 3060, RTX 4090) y en GPUs de datacenter como A100 o H100, aunque estas ultimas estan sobredimensionadas para este tamano.
- CPU: es perfectamente ejecutable en CPU, dado el reducido numero de parametros.
- Dispositivos moviles y embebidos: disenado explicitamente para inferencia on-device (Candle/marian_flutter), por lo que es apto para telefonos y equipos con recursos limitados.
- Opciones de despliegue: transformers (PyTorch) y Candle mediante marian_flutter, segun lo indicado por el autor. No hay evidencia de soporte nativo en vLLM, TGI o llama.cpp para arquitecturas Marian; cualquier uso en esos motores requeriria conversion adicional no documentada. La conversion a ONNX tambien seria posible pero no esta confirmada en la informacion disponible.
- Latencia y throughput: no disponible. No se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| malinali-app/opus-mt-lg-fr | 76,1 M | no disponible | lg -> fr | no disponible (remite al modelo base) | Hugging Face, safetensors + tokenizadores rapidos |
| Helsinki-NLP/opus-mt-lg-fr (modelo base) | ~76 M (equivalente) | no disponible | lg -> fr | habitualmente CC-BY 4.0 | Hugging Face, pesos originales en formato Marian |
| facebook/nllb-200-distilled-600M | ~600 M | no disponible | ~200 idiomas, incluye lg y fr | no disponible en esta ficha (habitualmente restringida a uso no comercial) | Hugging Face |

Notas: el modelo de malinali-app es esencialmente el mismo conjunto de pesos que Helsinki-NLP/opus-mt-lg-fr, reempaquetado para Candle; por tanto, no cabe esperar diferencias de calidad respecto al base. NLLB-200 cubre ambos idiomas dentro de un modelo mucho mayor y multilingue, con mayor coste de computo, pero los datos concretos de licencia y contexto de esa alternativa no se han verificado en la informacion disponible y deben confirmarse en su ficha oficial.

## Limitaciones y advertencias

- Es una redistribucion, no un modelo reentrenado: hereda todas las limitaciones del modelo base Helsinki-NLP/opus-mt-lg-fr.
- Riesgo de alucinacion y de traducciones incorrectas, especialmente en terminologia especializada, nombres propios y frases idiomaticas, algo habitual en modelos de traduccion de bajo recurso.
- Direccion unica lg -> fr: no traduce en sentido inverso ni a otros idiomas.
- Idiomas con recursos limitados: la calidad esperada en luganda es inferior a la de pares con mas datos de entrenamiento, y el corpus OPUS para lg puede ser reducido.
- Longitud de contexto no documentada: no se garantiza un comportamiento correcto con entradas largas; conviene fragmentar el texto.
- Licencia no explicitada en la ficha del autor: aunque remite a la del modelo base (habitualmente CC-BY 4.0), la ausencia de una declaracion clara es un riesgo para uso comercial y de produccion; debe verificarse antes de desplegar.
- Metricas ausentes: no hay benchmarks publicados que respalden la calidad de la traduccion.
- Adopcion nula en el momento de los datos: 0 descargas y 0 likes, sin senales de validacion por parte de la comunidad.
- Ausencia de soporte documentado en motores de inferencia de alto rendimiento (vLLM, TGI), lo que limita el despliegue en servidores a gran escala.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/malinali-app/opus-mt-lg-fr
- Modelo base: https://huggingface.co/Helsinki-NLP/opus-mt-lg-fr
- Proyecto OPUS-MT (Helsinki-NLP): https://github.com/Helsinki-NLP/Opus-MT
- Aplicacion Malinali: https://malinali.app
- Las busquedas web realizadas no devolvieron articulos, papers, repositorios ni demos relevantes sobre este modelo.
