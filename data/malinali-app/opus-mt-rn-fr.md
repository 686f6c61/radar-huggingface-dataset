# malinali-app/opus-mt-rn-fr

## Resumen

Opus-mt-rn-fr (malinali-app) es un paquete de traduccion automatica neuronal para el par kirundi (rn) → frances (fr), publicado por el proyecto Malinali a partir de los pesos del modelo Helsinki-NLP/opus-mt-rn-fr. No se trata de un entrenamiento nuevo: Malinali reempaqueta los pesos originales en formato safetensors y convierte los tokenizadores SentencePiece a JSON de tokenizador rapido de Hugging Face, con el objetivo de habilitar inferencia local en dispositivo mediante Candle (el crate `marian_flutter`). El repositorio ocupa 0,2 GB e incluye unicamente `config.json`, `model.safetensors`, `tokenizer-enc.json` y `tokenizer-dec.json`.

El modelo es un transformer encoder-decoder de tipo Marian (familia OPUS-MT, desarrollada por el grupo Language Technology de la Universidad de Helsinki), con 48.541.064 parametros totales segun los tensores safetensors publicados. Es un modelo pequeno y monodireccional: traduce exclusivamente de kirundi a frances, sin soporte declarado para otras lenguas ni para la direccion inversa. No es un modelo generativo de proposito general ni un modelo conversacional.

Su relevancia actual es acotada pero concreta: cubre un par de lenguas de bajos recursos (el kirundi es lengua oficial en Burundi, donde el frances tambien es idioma oficial) y lo hace con un artefacto lo bastante ligero como para ejecutarse en movil o en CPU, algo poco habitual en traduccion neuronal de calidad. Al estar pensado para Candle, encaja en aplicaciones Rust/Flutter con inferencia offline, sin dependencia de APIs en la nube.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder de tipo Marian (MarianMT) |
| Parametros totales | 48.541.064 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | no disponible; el repositorio solo publica pesos en safetensors (sin variantes GGUF, int8 ni fp16 declaradas) |
| Idiomas soportados | rn (kirundi) como origen, fr (frances) como destino |
| Licencia | no disponible en el repositorio; la model card remite a la licencia del modelo original (Helsinki-NLP/opus-mt-rn-fr, habitualmente CC-BY 4.0 para OPUS-MT) |
| Formato de pesos | safetensors (`model.safetensors`); tokenizadores en JSON (`tokenizer-enc.json`, `tokenizer-dec.json`) |
| Tamano del repositorio | 0,2 GB |
| Direccion de traduccion | rn → fr (unidireccional) |
| Modelo base | Helsinki-NLP/opus-mt-rn-fr |
| Libreria declarada | transformers |
| Pipeline | translation |

## Arquitectura y entrenamiento

La arquitectura corresponde a Marian NMT, un transformer encoder-decoder disenado especificamente para traduccion automatica y optimizado para eficiencia en entrenamiento e inferencia. Marian usa atencion multi-cabeza estandar y decodificacion autorregresiva; en la familia OPUS-MT los modelos se entrenan sobre corpus paralelos extraidos del proyecto OPUS. No se dispone de informacion en el repositorio sobre el numero de capas, la dimension del modelo, el numero de cabezas de atencion ni la longitud maxima de secuencia, por lo que estos datos se marcan como no disponibles.

Respecto al entrenamiento, el unico dato cierto es que Malinali no ha entrenado el modelo: la model card indica explicitamente que solo reempaqueta pesos y convierte el tokenizador SentencePiece a formato de tokenizador rapido de Hugging Face, y que no reclama la propiedad del modelo entrenado. No hay informacion publicada sobre el volumen de tokens de entrenamiento, la composicion del dataset, ni sobre si se aplicaron tecnicas de ajuste como RLHF o DPO (poco habituales en NMT). Al derivar del modelo de Helsinki-NLP, las caracteristicas de entrenamiento son las del OPUS-MT original, cuyos detalles tampoco se reproducen en este repositorio.

La innovacion practica del paquete es de ingenieria de despliegue, no de modelado: la separacion en dos tokenizadores rapidos (`tokenizer-enc.json` y `tokenizer-dec.json`) permite usar SentencePiece desde Candle sin depender de bibliotecas de Python, lo que facilita la integracion en aplicaciones nativas y moviles.

## Capacidades

- Traduccion de texto de kirundi (rn) a frances (fr), en modo texto a texto.
- Procesamiento por lotes (batch) a traves del pipeline `translation` de transformers.
- Ejecucion local en dispositivo mediante Candle, sin llamadas a servicios externos.
- Tokenizacion rapida independiente para origen y destino, lo que permite preprocesar entrada y salida por separado.
- Compatibilidad declarada con `endpoints_compatible` en HuggingFace, es decir, puede servirse mediante Inference Endpoints.
- No se declara soporte de tool calling ni function calling.
- No se declara soporte de agentes ni de razonamiento multi-paso.
- No se declara capacidad multilingue mas alla del par rn → fr.
- No se declara modo de razonamiento (thinking mode), vision, audio ni ninguna otra modalidad.

## Casos de uso

- Traduccion offline en aplicaciones moviles para Burundi: una app Flutter puede integrar el paquete via Candle y traducir texto kirundi a frances sin conexion, algo critico en zonas con cobertura intermitente. El tamano de 0,2 GB y 48,5 M de parametros lo hacen viable en un telefono de gama media.
- Digitalizacion de documentacion administrativa: formularios, avisos y comunicados redactados en kirundi pueden traducirse automaticamente al frances, idioma de trabajo de la administracion burundesa, con un coste de inferencia minimo al ejecutarse en CPU.
- Traduccion de contenido web y periodistico: sitios de noticias en kirundi pueden ofrecerse en frances pre-traduciendo articulos por lotes antes de su publicacion, con revision humana posterior.
- Preprocesado para pipelines de PLN: el modelo puede actuar como paso de normalizacion que convierte corpus kirundi a frances para alimentar despues analizadores de sentimiento, clasificadores o sistemas de recuperacion de informacion que solo tienen recursos en frances.
- Atencion al cliente en entornos bilingues: un servicio de soporte puede recibir consultas en kirundi y presentarlas al agente en frances, reduciendo la necesidad de personal bilingue en tiempo real.
- Investigacion en lenguas de bajos recursos: sirve como linea base reproducible para comparar tecnicas de traduccion neuronal en un par con pocos recursos paralelos, y como referencia frente a modelos multilingues mas grandes.
- Subtitulado y transcripcion asistida: combinado con un sistema de reconocimiento de voz en kirundi, puede generar subtitulos en frances para videos y materiales educativos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no incluye metricas BLEU, chrF, COMET ni evaluaciones sobre conjuntos de test (por ejemplo, Flores-200), y las busquedas web realizadas no han devuelto documentacion tecnica relevante sobre este artefacto concreto.

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: en torno a 200 MB solo para pesos (48,5 M de parametros), mas el consumo de activaciones y del tokenizador; en la practica cabe holgadamente en cualquier GPU con 1 GB o mas.
- En fp16 los pesos ocuparian aproximadamente 97 MB; en int8, unos 49 MB, aunque el repositorio no publica variantes cuantizadas y habria que generarlas.
- GPU recomendadas: no requiere GPU dedicada. Funciona en CPU, en GPU integradas y en cualquier GPU de consumo (GTX 1050 o superior, RTX 3060, RTX 4090), donde el modelo queda infrautilizado.
- Cabe sin problema en GPU de consumo e incluso en dispositivos moviles con Candle, que es precisamente el objetivo del paquete.
- Opciones de despliegue: transformers (PyTorch), Candle a traves del crate `marian_flutter`, servidores compatibles con el pipeline `translation` de Hugging Face e Inference Endpoints. No se publican pesos GGUF, por lo que llama.cpp y Ollama no son aplicables sin una conversion previa a un formato soportado; el soporte de Marian en vLLM y TGI no esta documentado.
- Latencia y throughput: no se publican mediciones. Por el tamano del modelo es razonable esperar latencias bajas incluso en CPU, pero no hay cifras confirmadas en la informacion disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Direccion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| malinali-app/opus-mt-rn-fr | 48,5 M | no disponible | rn → fr | no disponible (hereda la del modelo base) | HuggingFace, safetensors + tokenizadores Candle |
| Helsinki-NLP/opus-mt-rn-fr | no disponible en esta busqueda (mismo modelo de origen) | no disponible | rn → fr | habitualmente CC-BY 4.0 segun la model card original | HuggingFace, pesos originales en PyTorch |
| facebook/nllb-200-distilled-600M | en torno a 600 M | 512 tokens (segun documentacion de NLLB) | multilingue (200 idiomas) | CC-BY-NC-4.0 (uso comercial restringido) | HuggingFace, transformers |
| facebook/m2m100_418M | 418 M | 1024 tokens (segun documentacion de M2M-100) | multilingue (100 idiomas) | MIT | HuggingFace, transformers |

Frente a NLLB-200 y M2M-100, este paquete es dos ordenes de magnitud mas pequeno y esta especializado en un unico par, lo que se traduce en menor huella de memoria y despliegue en dispositivo, a costa de no cubrir otros idiomas ni direcciones. La comparacion de calidad de traduccion no puede establecerse porque no hay metricas publicadas para este repositorio.

## Limitaciones y advertencias

- Modelo unidireccional: solo traduce de kirundi a frances. No soporta la direccion fr → rn ni la traduccion entre otros pares.
- No hay datos publicados sobre sesgos. Al ser un modelo entrenado sobre corpus OPUS, es probable que herede los sesgos de dominio y de genero presentes en textos administrativos, religiosos o legislativos, que suelen sobrerrepresentarse en corpus paralelos de lenguas de bajos recursos.
- Riesgo de alucinacion y de omisiones en traduccion: los modelos NMT pueden producir contenido fluido pero infiel, especialmente con frases largas, terminologia especializada, nombres propios o variedades dialectales del kirundi.
- Longitud de contexto no documentada: no se especifica la longitud maxima de secuencia soportada, lo que obliga a validar empiricamente el comportamiento con entradas largas antes de usarlo en produccion.
- Cobertura de registros limitada: al ser un modelo especializado en un par concreto, su rendimiento en lenguaje coloquial, jerga o texto tecnico moderno es incierto y no esta evaluado.
- Licencia no declarada en el repositorio: la model card remite a la licencia del modelo original, pero no la fija explicitamente. Antes de un uso comercial es imprescindible verificar la licencia de Helsinki-NLP/opus-mt-rn-fr, ya que la ausencia de una licencia clara en este repositorio es un riesgo juridico.
- Ausencia de benchmarks: no hay ninguna metrica de calidad publicada, ni BLEU ni chrF ni COMET, ni comparacion con el modelo original o con alternativas multilingues.
- Madurez del artefacto: el repositorio registra cero descargas y cero "likes", y fue creado y actualizado con apenas doce segundos de diferencia, lo que sugiere un artefacto recien publicado y sin validacion por parte de la comunidad.
- Dependencia de un formato de tokenizador especifico: los archivos `tokenizer-enc.json` y `tokenizer-dec.json` estan pensados para el flujo de Candle; su uso fuera de ese ecosistema exige comprobar la compatibilidad con la implementacion de SentencePiece que se utilice.
- Caveat de mantenimiento: al ser un reempaquetado, cualquier mejora futura dependera del modelo original de Helsinki-NLP, no de este repositorio.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/malinali-app/opus-mt-rn-fr
- Modelo base original: https://huggingface.co/Helsinki-NLP/opus-mt-rn-fr
- Proyecto OPUS-MT (repositorio): https://github.com/Helsinki-NLP/Opus-MT
- Aplicacion Malinali: https://malinali.app
- Las busquedas web realizadas no han devuelto papers, blogs, demos ni repositorios adicionales relevantes sobre este modelo.
