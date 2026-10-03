# malinali-app/opus-mt-fi-ny

## Resumen

malinali-app/opus-mt-fi-ny es un paquete de pesos del modelo de traduccion automatica Helsinki-NLP/opus-mt-fi-ny, republicado por el equipo de Malinali para inferencia en dispositivo (on-device). Se trata de un modelo Marian de tipo transformer encoder-decoder con 76.227.161 parametros (unos 76 millones), especializado en la direccion finlandes (fi) a chichewa o nyanja (ny). El repositorio no entrena nada nuevo: empaqueta los pesos originales en safetensors junto con tokenizadores rapidos en JSON, adaptados para el runtime Candle a traves del componente `marian_flutter`.

El problema que resuelve es el de disponer de traduccion fi-ny ejecutable localmente, sin depender de una API en la nube. Al pesar unos 76 M de parametros y ocupar el repositorio 0,3 GB, es viable en movil, navegador o CPU de gama baja, lo que encaja en aplicaciones de traduccion offline. El modelo base pertenece a la familia OPUS-MT de Helsinki-NLP, entrenada sobre corpus paralelos del proyecto OPUS.

Su relevancia es limitada pero concreta: el par fi-ny es de bajos recursos y cuenta con pocas alternativas ligeras y desplegables en local. Al ser un reempaquetado, su utilidad depende de que la conversion SentencePiece a tokenizador rapido y el formato safetensors sean correctos, algo que el autor afirma pero no documenta con evaluaciones. La ficha de HuggingFace no declara licencia propia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Marian NMT) |
| Parametros totales | 76.227.161 (aproximadamente 76 M) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible (la familia OPUS-MT suele trabajar a nivel de frase, con 512 tokens como valor tipico; no confirmado en la informacion proporcionada) |
| Tipos de cuantizacion | No disponible (el repositorio solo distribuye pesos safetensors; no incluye GGUF ni cuantizaciones publicadas) |
| Idiomas soportados | Finlandes (fi) como origen, chichewa/nyanja (ny) como destino |
| Licencia | No disponible en la ficha; la model card indica que se debe seguir la licencia del modelo base (tipicamente CC-BY 4.0 en OPUS-MT) |
| Formato de pesos | safetensors (`model.safetensors`) mas tokenizadores rapidos JSON (`tokenizer-enc.json`, `tokenizer-dec.json`) y `config.json` |
| Tamano del repositorio | 0,3 GB |
| Direccion de traduccion | fi → ny (unidireccional) |
| Biblioteca declarada | transformers |
| Modelo base | Helsinki-NLP/opus-mt-fi-ny |

## Arquitectura y entrenamiento

La arquitectura es la de Marian NMT: una red transformer completa (encoder y decoder) con atencion, disenada especificamente para traduccion automatica y entrenada con objetivo de maxima verosimilitud sobre pares de frases paralelas. No incorpora tecnicas de alineacion por RLHF ni DPO, ni modulos multimodales. El autor del reempaquetado no aporta informacion sobre el numero de capas, dimension del modelo, cabezas de atencion, vocabulario exacto ni composicion del dataset; estos datos corresponden al modelo original de Helsinki-NLP y no se detallan en la informacion disponible. El entrenamiento original procede del proyecto OPUS-MT, que usa corpus paralelos agregados por OPUS para pares de idiomas, en este caso fi-ny.

La unica innovacion tecnica del repositorio es de empaquetado, no de modelado. Malinali convierte los tokenizadores SentencePiece originales a formato de tokenizador rapido de Hugging Face y publica los pesos en safetensors para poder ejecutarse con Candle mediante `marian_flutter`, un runtime orientado a Flutter y despliegue en dispositivo. El repositorio declara explicitamente que no reclama la propiedad del modelo entrenado y que solo redistribuye pesos y tokenizadores. No se documentan pasos de destilacion, pruning ni cuantizacion durante el proceso.

## Capacidades

- Traduccion de texto unidireccional de finlandes (fi) a chichewa/nyanja (ny), a nivel de frase o parrafo corto.
- Generacion de texto condicionada a la traduccion (tarea `text2text-generation` con pipeline `translation`).
- Inferencia en dispositivo mediante Candle, sin necesidad de conexion a red, gracias a los tokenizadores rapidos incluidos.
- Compatibilidad declarada con `transformers` y con endpoints (`endpoints_compatible` en los tags del repositorio).
- No dispone de soporte documentado de tool calling ni de function calling.
- No dispone de soporte documentado de agentes, razonamiento multi-paso ni planificacion.
- No dispone de capacidades multimodales (vision, audio) ni de modo de razonamiento explicito.
- No es un modelo multilingue general: solo cubre el par fi-ny.
- No se documentan capacidades de control de estilo, terminologia o glosarios.

## Casos de uso

- Traduccion offline en aplicaciones moviles para hablantes de finlandes que necesiten comunicarse en chichewa: el modelo puede embeberse en una app Flutter a traves de `marian_flutter`, ocupando menos de 0,5 GB y funcionando sin conectividad.
- Atencion al cliente en zonas con conectividad limitada: integrado en un sistema de ticketing local, traduce mensajes entrantes en finlandes a chichewa antes de que un agente humano los revise.
- Digitalizacion de documentacion administrativa o sanitaria: traduccion por lotes de formularios y folletos del finlandes al chichewa, con revision humana posterior dado el caracter de bajo recurso del par.
- Herramientas de ayuda humanitaria y cooperacion al desarrollo: traduccion de instrucciones, avisos y material formativo en entornos con infraestructura de red escasa, ejecutando el modelo en portatiles o dispositivos de gama media.
- Pretraduccion asistida por traductor (CAT): generar una primera version en chichewa que un traductor profesional post-edite, reduciendo el tiempo inicial de trabajo en un par con poca oferta de traductores.
- Investigacion en traduccion automatica de bajos recursos: servir como linea base reproducible para experimentos de fine-tuning o comparacion de tecnicas sobre el par fi-ny, con pesos en safetensors faciles de cargar.
- Filtrado y analisis de corpus: traduccion de grandes volumenes de texto finlandes a chichewa para tareas de mineria de datos o clasificacion posterior, siempre que se acepte la perdida de matices.
- Aprendizaje de idiomas: herramienta de apoyo para estudiantes de chichewa que partan del finlandes, mostrando traducciones de frases sueltas con la advertencia de que no sustituye a un diccionario.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La ficha de HuggingFace y la model card no incluyen metricas BLEU, chrF, COMET ni evaluaciones humanas para este reempaquetado ni para el modelo base en el par fi-ny. Tampoco se aportan comparaciones con otros sistemas.

## Requisitos de hardware

- VRAM estimada en fp32: aproximadamente 305 MB solo para pesos (76,2 M de parametros x 4 bytes), mas overhead de activaciones y tokenizadores; en la practica, menos de 1 GB en total.
- VRAM estimada en fp16/bf16: aproximadamente 152 MB de pesos; en int8 rondaria los 76 MB, aunque no se distribuyen cuantizaciones oficiales.
- Cabe sin problema en GPU de consumo: RTX 3060, RTX 4060, RTX 4090 y cualquier GPU con 4 GB o mas; tambien en iGPU modernas.
- Ejecucion en CPU viable y probablemente suficiente para uso interactivo, dado el tamano del modelo y la naturaleza frase a frase de la tarea.
- Despliegue en dispositivo movil mediante Candle y `marian_flutter` (Flutter), que es el objetivo declarado del repositorio.
- Despliegue en servidor con la libreria `transformers` (pipeline `translation`); el repositorio esta marcado como `endpoints_compatible`.
- Compatibilidad con vLLM, llama.cpp, Ollama o TGI: no disponible en la informacion proporcionada; estos runtimes no soportan de forma general la arquitectura Marian en el formato distribuido aqui.
- Latencia y throughput estimados: no disponible. No se publican mediciones de tokens por segundo ni de tiempo por frase.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| malinali-app/opus-mt-fi-ny | 76,2 M | No disponible | fi → ny | No disponible (hereda la del base) | HuggingFace, safetensors, Candle |
| Helsinki-NLP/opus-mt-fi-ny | 76,2 M (mismos pesos) | No disponible | fi → ny | CC-BY 4.0 tipicamente, segun model card del proyecto OPUS-MT | HuggingFace, pesos originales |
| facebook/nllb-200-distilled-600M | 600 M | 512 tokens (declarado por el autor) | 200 idiomas, incluidos fi y ny | CC-BY-NC-4.0 (uso no comercial) | HuggingFace |
| facebook/m2m-100 (418M) | 418 M | No disponible | 100 idiomas | MIT | HuggingFace |

La ventaja diferencial del modelo de Malinali frente a NLLB o M2M-100 es el tamano reducido y la orientacion a inferencia local; su desventaja es que solo cubre una direccion de traduccion y carece de evaluacion publicada. NLLB-200 y M2M-100 cubren el par fi-ny dentro de su cobertura multilingue, pero con un coste computacional muy superior y, en el caso de NLLB, con licencia no comercial.

## Limitaciones y advertencias

- Par de bajos recursos: el chichewa/nyanja tiene presencia limitada en los corpus de OPUS, por lo que la calidad esperada es inferior a la de pares con muchos datos paralelos.
- Riesgo de alucinacion y de omisiones en traduccion automatica neuronal: puede inventar contenido, repetir fragmentos o dejar terminos sin traducir, especialmente con frases largas, nombres propios o terminologia tecnica.
- Ausencia total de evaluacion publicada: no hay BLEU, chrF ni COMET, asi que cualquier despliegue en produccion exige una validacion propia con datos del dominio objetivo.
- Licencia no aclarada en la ficha de HuggingFace: aunque la model card remite a la licencia del modelo base (tipicamente CC-BY 4.0 en OPUS-MT), el reempaquetado no la declara de forma explicita; conviene verificar antes de un uso comercial.
- Es un reempaquetado de terceros: la calidad de la conversion de SentencePiece a tokenizador rapido JSON no esta documentada con tests ni evaluaciones, lo que introduce riesgo de discrepancias entre la tokenizacion de entrenamiento y la de inferencia.
- Modelo unidireccional: no traduce de ny a fi; para la direccion inversa hace falta otro modelo de la familia OPUS-MT.
- Alcance limitado a texto: no procesa audio, imagenes ni documentos completos; los ficheros largos deben segmentarse en frases.
- Sin soporte de glosarios, terminologia controlada ni instrucciones de estilo: no se puede guiar la salida con prompts ni restricciones.
- Contexto de trabajo corto y orientado a frase: los fenomenos que dependen de contexto entre frases (referencias, coherencia de genero, pronombres) no se resuelven de forma fiable.
- Senales de adopcion nulas en el momento de la consulta: 0 descargas y 0 likes, sin issues ni discusion documentada que permitan juzgar su fiabilidad.
- Fecha de creacion del repositorio: 2026-10-02, segun los metadatos de HuggingFace.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/malinali-app/opus-mt-fi-ny
- Modelo base: https://huggingface.co/Helsinki-NLP/opus-mt-fi-ny
- Proyecto OPUS-MT (Helsinki-NLP): https://github.com/Helsinki-NLP/Opus-MT
- Aplicacion Malinali: https://malinali.app
- Paper o documentacion adicional sobre el reempaquetado: no disponible
- Demo: no disponible
