# Donoe/NaijaMultilingualBank

## Resumen

NaijaMultilingualBank es un modelo de clasificacion de intenciones bancarias desarrollado por el usuario Donoe, obtenido por fine-tuning de `FacebookAI/xlm-roberta-base`. Su objetivo es detectar la intencion de consultas bancarias en cuatro idiomas: ingles, yoruba, hausa e igbo. El modelo distingue entre 77 intenciones bancarias distintas y esta pensado como la capa de deteccion de intenciones de un asistente bancario nigeriano mas amplio, denominado NaijaBankBot, que combinaria clasificacion de intenciones, traduccion multilingue y una capa generativa basada en un LLM.

Tecnicamente es un encoder transformer bidireccional de tipo XLM-RoBERTa con 278.102.861 parametros (aproximadamente 278 M), pesos en safetensors y un repositorio de 1,1 GB. La longitud de secuencia configurada es de 128 tokens, muy por debajo de los 512 que admite habitualmente la arquitectura base, lo que lo situa en el rango de clasificadores ligeros aptos para inferencia en CPU o en GPU de gama baja.

Su relevancia actual es doble. Por un lado, aborda un nicho poco cubierto: la clasificacion de intenciones financieras en lenguas nigerianas de bajos recursos (yoruba, hausa, igbo), a partir de un dataset derivado de BANKING77 con 39.972 muestras y 9.993 consultas fuente unicas. Por otro, sus resultados publicados (65,87 % de accuracy y 64,51 % de macro F1 sobre 4.000 muestras de test) lo sitúan como una linea base de investigacion util, no como un sistema listo para produccion bancaria. El propio autor lo describe como un baseline de investigacion y portafolio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder bidireccional (XLM-RoBERTa base), fine-tuning para clasificacion de secuencias |
| Parametros totales | 278.102.861 |
| Parametros activos | No aplica (modelo denso, no es MoE) |
| Longitud de contexto | 128 tokens (longitud maxima de secuencia declarada por el autor); la arquitectura base admite 512 |
| Tipos de cuantizacion | No disponible. Solo se publican pesos sin cuantizar en safetensors; no hay versiones GGUF, AWQ, GPTQ ni ONNX publicadas |
| Idiomas soportados | Ingles, yoruba, hausa, igbo |
| Licencia | No disponible (el autor no declara licencia en la model card) |
| Formato de pesos | safetensors (repositorio de 1,1 GB) |
| Tarea | Clasificacion de texto: 77 clases de intencion bancaria |
| Libreria | transformers |
| Modelo base | FacebookAI/xlm-roberta-base |
| Descargas / likes | 0 / 0 |
| Fecha de publicacion | 2026-09-10 |

## Arquitectura y entrenamiento

El modelo parte de `FacebookAI/xlm-roberta-base`, un encoder transformer bidireccional preentrenado con objetivos de masked language modeling sobre corpus multilingues. Sobre esa base se arado una cabeza de clasificacion para 77 clases. El entrenamiento reportado por el autor es corto y de bajo coste: 3 epocas, learning rate de 2e-5, batch size de 8, acumulacion de gradientes de 2 y semilla aleatoria 42, con secuencias truncadas a 128 tokens. No se menciona en la informacion disponible el uso de RLHF, DPO ni tecnicas de alineacion adicionales, algo esperable en un clasificador encoder.

El dataset es multilingue y deriva de BANKING77: 39.972 muestras totales a partir de 9.993 consultas fuente unicas, en 4 idiomas y con las mismas 77 intenciones. El split es determinista con semilla 42: 31.976 muestras de entrenamiento, 3.996 de validacion y 4.000 de test. El autor indica que las muestras de test fueron reservadas y que el modelo final se recargo y verifico antes de la evaluacion. No se detalla en la model card la composicion exacta por idioma ni el proceso de traduccion o generacion de las variantes en yoruba, hausa e igbo, ni si se aplicaron tecnicas como back-translation; todos esos aspectos figuran como no disponibles.

## Capacidades

- Clasificacion de intenciones bancarias en 77 categorias distintas a partir de una consulta de hasta 128 tokens.
- Clasificacion multilingue en ingles, yoruba, hausa e igbo dentro del mismo modelo, sin necesidad de un clasificador separado por idioma.
- Salida de etiqueta unica por secuencia, con distribucion de probabilidad utilizable para umbrales de confianza y enrutado condicional.
- Uso como capa de deteccion de intenciones en asistentes conversacionales: el autor lo presenta explicitamente como el componente de intent detection de NaijaBankBot.
- Integracion con el ecosistema transformers y con endpoints compatibles (etiquetas `endpoints_compatible` y `text-embeddings-inference` en el repositorio).
- Uso como linea base de investigacion para fine-tuning en otras lenguas nigerianas o en dominios financieros similares.
- No dispone de capacidad de generacion de texto, tool calling, function calling, uso de agentes, razonamiento multi-paso, vision ni audio. Es exclusivamente un clasificador.

## Casos de uso

- Enrutado de intenciones en asistentes bancarios multilingues: la consulta del cliente (en ingles, yoruba, hausa o igbo) se clasifica en una de las 77 intenciones y se dirige al flujo de respuesta adecuado; es el caso de uso declarado por el autor para NaijaBankBot.
- Triaje y escalado a agentes humanos: si la probabilidad maxima de la clase predicha queda por debajo de un umbral calibrado, la consulta se deriva a un agente humano en lugar de a un flujo automatico, mitigando el 34 % aproximado de errores observados en test.
- Analitica de contact center: clasificar transcripciones de llamadas, correos o chats por intencion para medir volumen, tendencias y tiempos de resolucion por tipo de consulta bancaria, incluyendo las interacciones en lenguas nigerianas que hoy suelen quedar sin etiquetar.
- Filtro previo a un LLM generativo: usar el clasificador (278 M de parametros) como primera etapa barata que decide si se invoca un modelo generativo mucho mas costoso, reduciendo el gasto de inferencia en produccion.
- Autoservicio por canales de bajo ancho de banda (SMS, USSD, chat ligero): al ser un modelo pequeno con secuencias de 128 tokens, puede desplegarse en CPU o en hardware modesto y responder en milisegundos, algo critico en infraestructuras con recursos limitados.
- Clasificacion y moderacion de mensajes entrantes: etiquetar formularios web, correos o mensajes de apps moviles antes de que entren al sistema de gestion, para priorizar incidencias como fraude, bloqueo de tarjeta o disputas de cargos.
- Investigacion en PLN multilingue de bajos recursos: servir de baseline reproducible y comparable para experimentos con yoruba, hausa e igbo, y punto de partida para fine-tuning en otros dominios (seguros, telecomunicaciones) sobre BANKING77 u otros datasets traducidos.
- Sistema de FAQ determinista: predecir la intencion y devolver una respuesta predefinida o una plantilla, con traduccion posterior de la respuesta, sin necesidad de un modelo generativo en el bucle.

## Benchmarks y rendimiento

El autor publica una unica evaluacion, sobre 4.000 muestras de test reservadas:

| Metrica | Valor |
|---|---:|
| Accuracy | 65,87 % |
| Macro precision | 66,60 % |
| Macro recall | 65,49 % |
| Macro F1 | 64,51 % |
| Weighted precision | 67,17 % |
| Weighted recall | 65,87 % |
| Weighted F1 | 65,28 % |

No se han publicado resultados comparativos con otros modelos (MMLU, HumanEval, GSM8K u otros benchmarks no aplican a esta tarea, y no hay comparaciones frente a mBERT, XLM-R base o modelos especificos de BANKING77 en la informacion disponible). Tampoco se publican metricas desagregadas por idioma, por lo que se desconoce si el rendimiento en yoruba, hausa e igbo es homogeneo respecto al ingles.

## Requisitos de hardware

- VRAM estimada en fp32: aproximadamente 1,1 GB solo para los pesos, con un pico de 1,5 a 2 GB considerando activaciones con batch pequeno.
- VRAM estimada en fp16: aproximadamente 560 MB de pesos.
- VRAM estimada con cuantizacion dinamica int8 (via PyTorch u ONNX Runtime, no publicada por el autor): del orden de 280 MB de pesos.
- Cabe sin problema en cualquier GPU de consumo: GTX 1650 (4 GB), RTX 3060, RTX 4060, RTX 4090, e incluso en iGPU con memoria compartida.
- Inferencia en CPU perfectamente viable por el tamano del modelo y la longitud de secuencia de 128 tokens; no se publican cifras de latencia ni de throughput.
- GPU de datacenter (A100, H100, L4, T4) solo justificables si se necesita procesar lotes muy grandes o si se comparte la infraestructura con otros modelos.
- Opciones de despliegue: pipeline de transformers, Hugging Face Inference Endpoints (el repositorio esta etiquetado como `endpoints_compatible`), Text Embeddings Inference (etiqueta `text-embeddings-inference`), ONNX Runtime u Optimum para aceleracion, TorchServe o un servicio FastAPI propio con batching dinamico.
- vLLM, llama.cpp y Ollama no son vias directas: no hay pesos GGUF publicados y la arquitectura es un encoder de clasificacion, no un modelo generativo.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

Los datos de los modelos alternativos proceden de sus model cards publicas y deben verificarse antes de tomar decisiones de produccion. El rendimiento sobre tareas equivalentes de clasificacion de intenciones bancarias multilingues no esta publicado para ninguno de ellos.

| Modelo | Parametros | Contexto | Tarea | Idiomas | Licencia | Disponibilidad |
|---|---:|---:|---|---|---|---|
| Donoe/NaijaMultilingualBank | 278 M | 128 tokens | Clasificacion de 77 intenciones bancarias | Ingles, yoruba, hausa, igbo | No disponible | HuggingFace, 0 descargas |
| FacebookAI/xlm-roberta-base | 278 M | 512 tokens | Encoder generico (MLM, embeddings, fine-tuning) | 100 idiomas | No verificada en la informacion disponible | HuggingFace, ampliamente usado |
| bert-base-multilingual-cased (mBERT) | 178 M | 512 tokens | Encoder generico (MLM, fine-tuning) | ~104 idiomas | No verificada en la informacion disponible | HuggingFace, ampliamente usado |
| Encoders adaptados a lenguas africanas (por ejemplo, la familia AfroXLMR) | ~278 M | 512 tokens | Encoder generico para lenguas africanas | Lenguas africanas, entre ellas yoruba, hausa e igbo | No verificada en la informacion disponible | HuggingFace |

Comparativa cualitativa: NaijaMultilingualBank es el unico de la lista con una cabeza de clasificacion supervisada especifica para intenciones bancarias nigerianas, pero tambien el unico con un limite de 128 tokens y con licencia sin declarar. XLM-R base y mBERT serian los puntos de partida obvios para reproducir o mejorar este fine-tuning; los encoders adaptados a lenguas africanas podrian ofrecer mejores representaciones para yoruba, hausa e igbo, aunque no hay datos publicados que lo confirmen en esta tarea concreta.

## Limitaciones y advertencias

- Rendimiento moderado: 65,87 % de accuracy y 64,51 % de macro F1 implican que aproximadamente una de cada tres consultas se clasifica de forma incorrecta. No es apto como unica capa de decision en un sistema bancario.
- Confusion entre intenciones similares: el propio autor advierte que las intenciones bancarias parecidas entre si se confunden con frecuencia, lo que exige manejo de confianza, umbrales y validacion de negocio.
- Ambito funcional estricto: el modelo solo clasifica intenciones. No autoriza transacciones, no accede a cuentas ni ejecuta operaciones bancarias.
- Longitud limitada: las consultas de mas de 128 tokens se truncan, con la consiguiente perdida de informacion en mensajes largos, hilos de correo o transcripciones.
- Cobertura linguistica parcial: cubre ingles, yoruba, hausa e igbo, pero no otras lenguas y variedades de Nigeria (por ejemplo, pidgin nigeriano) ni el code-switching frecuente en conversaciones reales.
- Ausencia de metricas por idioma: no se publica el desglose de accuracy o F1 por lengua, por lo que se desconoce si el rendimiento en yoruba, hausa e igbo es comparable al del ingles.
- Posible sesgo de traduccion: al derivar de BANKING77 (consultas originalmente en ingles de un unico banco), las versiones en lenguas nigerianas pueden arrastrar artefactos de traduccion y un sesgo hacia las formulaciones y el catalogo de productos del banco de origen, probablemente poco representativo del mercado nigeriano real.
- Riesgo de sobreconfianza: como todo clasificador, puede asignar probabilidades altas a etiquetas incorrectas; es imprescindible calibrar y monitorizar en produccion.
- Licencia no disponible: el autor no declara licencia, lo que genera incertidumbre legal para uso comercial. La model card remite a las licencias y requisitos de atribucion del modelo base y del dataset de origen, que deben revisarse antes de redistribuir o explotar comercialmente el modelo.
- Madurez: 0 descargas y 0 likes en el momento de la consulta, sin validacion independiente por parte de la comunidad. El propio autor lo califica como baseline de investigacion y portafolio.
- Fecha de publicacion atipica (2026-09-10): conviene verificar la vigencia y el contexto temporal del repositorio.
- La busqueda web realizada no devolvio resultados relevantes sobre este modelo; toda la informacion tecnica procede de la model card y de los metadatos del repositorio en HuggingFace.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Donoe/NaijaMultilingualBank
- Modelo base: https://huggingface.co/FacebookAI/xlm-roberta-base
- Dataset de entrenamiento: https://huggingface.co/datasets/Donoe/multilingual-nigerian-banking77
- Dataset original BANKING77: https://huggingface.co/datasets/PolyAI/banking77
- Resultados de busqueda web: no se han encontrado enlaces relevantes sobre este modelo (los resultados devueltos correspondian a contenidos no relacionados).
