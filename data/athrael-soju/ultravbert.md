# athrael-soju/UltraVBERT

## Resumen

UltraVBERT es un encoder vision-language de 293 millones de parametros desarrollado por el usuario athrael-soju, concebido como base para constructores de recuperacion de documentos visuales (visual document retrievers). El modelo combina el encoder de texto UltraBERT-150M con el encoder de vision SigLIP2-B/16-512, de forma que procesa imagenes de pagina y texto de manera conjunta y genera un embedding contextual por cada token. Su relevancia actual radica en que sirve como bloque fundacional de la familia ColUltraVBERT, orientada a la recuperacion de documentos mediante interaccion tardia (late interaction), un paradigma heredado de ColPali y evaluado en el ecosistema ViDoRe.

Tecnicamente, UltraVBERT es una extension de ModernVBERT (arXiv:2510.01149) en la que se sustituye el encoder de texto Ettin-150M por UltraBERT (arXiv:2610.15028), se anade un conector normalizado, se amplia la resolucion de pagina hasta 3.072 px y 27 tiles (frente a 2.048 px y 16 tiles) y se incorpora una etapa adicional de entrenamiento sobre paginas de texto renderizado. El modelo se publica bajo licencia MIT, con pesos en bfloat16 y un total de 293.115.648 parametros (254 millones sin la cabeza de masked language modelling).

Se trata de un encoder base, no de un modelo conversacional: su objetivo es producir representaciones de token de alta calidad para tareas posteriores de clasificacion, etiquetado de tokens y, sobre todo, recuperacion multimodal. En el momento de la ficha acumula 0 descargas y 2 "likes", con fecha de creacion el 15 de octubre de 2026 y ultima actualizacion el 17 de octubre de 2026.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder vision-language transformer: encoder de texto UltraBERT-150M + encoder de vision SigLIP2-B/16-512 + conector de pixel shuffle 4x4 |
| Parametros totales | 293.115.648 (254 millones sin la cabeza MLM) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible de forma explicita. Secuencia de tokens interpretable: hasta 1.792 tokens de imagen (28 x 64) mas tokens de texto. Atencion de ventana deslizante de 128 tokens en 2 de cada 3 capas del encoder de texto |
| Tipos de cuantizacion | No disponible (pesos publicados en bfloat16; no se documentan cuantizaciones GGUF, AWQ ni GPTQ) |
| Idiomas soportados | Ingles (en) |
| Licencia | MIT |
| Formato de pesos | safetensors (bfloat16) |

Desglose de componentes:

| Componente | Configuracion | Parametros |
|---|---|---:|
| Encoder de texto | UltraBERT-150M: 24 capas, hidden size 768, 6 cabezas, atencion de ventana deslizante de 128 tokens en 2 de cada 3 capas, 40 tokens especiales anadidos | 151.130.880 |
| Encoder de vision | SigLIP2-B/16-512: 12 capas, parches de 16 px, tiles de 512 px | 93.520.128 |
| Conector | Pixel shuffle 4 x 4, capa lineal de 12.288 a 768, RMSNorm | 9.437.952 |
| Cabeza MLM | Dos capas de 768 x 768 y una capa de salida de 49.280 tokens | 39.026.688 |
| Total | | 293.115.648 |

## Arquitectura y entrenamiento

SigLIP2 codifica cada tile de 512 px de una pagina en 1.024 parches. El conector fusiona cada bloque de 4 x 4 parches en un unico token, de modo que cada tile se convierte en 64 tokens, y los normaliza con RMSNorm a la escala de los embeddings de palabra de UltraBERT. A continuacion, UltraBERT atiende conjuntamente sobre los tokens de imagen y de texto. El procesador redimensiona la pagina a un borde largo maximo de 3.072 px, reduciendola en pasos de 512 px hasta que encaja en 27 tiles, y anade una copia reducida de la pagina completa, de forma que una pagina consume como maximo 28 x 64 = 1.792 tokens de imagen. Para secuencias mas cortas puede ajustarse `processor.image_processor.size = {"longest_edge": 2048}` (como maximo 1.088 tokens de imagen) o reducir `processor.image_processor.max_image_tiles`.

El entrenamiento se basa en masked language modelling sobre las respuestas de conversaciones ancladas en imagenes: se enmascara el 50 % de los tokens de respuesta (80 % con `<|mask|>`, 10 % con un token aleatorio y 10 % sin cambios). Se emplean adaptadores DoRA (rango 64, alpha 16) sobre ambos encoders y sobre la cabeza MLM, con un learning rate maximo de 1e-4. El conector se entrena por completo a 1e-3; los tokens de imagen parten de 10 veces el RMS de los embeddings de palabra de UltraBERT y los embeddings de los 40 tokens anadidos se entrenan directamente. El optimizador es AdamW (beta2 0,95) con weight decay 0,1, gradient clipping 1,0 y autocast en bfloat16.

El pipeline consta de dos etapas. La etapa de lectura (Reading) emplea 3.600 pasos y 0,36B tokens de texto, mezclando al 50 % paginas de Docmatix y pasajes renderizados de RLHN-680K. La etapa de mezcla (Mixture) emplea 34.206 pasos y 8,9B tokens de texto, con un schedule warmup-stable-decay y decaimiento 1 - sqrt durante el ultimo 20 % de los pasos. Las paginas se entrenan con borde largo de 1.024 px hasta el decaimiento y despues con bordes aleatorios entre 1.024 y 3.072 px. La composicion de la mezcla es la siguiente: instrucciones de texto 48,18 % (16 subsets de FineVision), OCR y documentos 16,21 % (Docmatix y 9 subsets de FineVision), screenshot-to-code 16,71 % (4 subsets de FineVision), paginas de texto renderizado 5,00 % (pasajes de RLHN-680K), graficos 5,00 % (8 subsets de FineVision), captioning 3,13 % (2 subsets de FineVision), tablas 3,00 % (6 subsets de FineVision), razonamiento y matematicas 1,61 % (7 subsets de FineVision) y VQA del mundo real 1,16 % (2 subsets de FineVision y TallyQA de The Cauldron).

## Capacidades

- Generacion de representaciones contextuales: produce un embedding de 768 dimensiones por cada token de texto y de imagen, util como base para tareas posteriores.
- Masked language modelling: prediccion de palabras enmascaradas a partir de una pagina e instrucciones de texto (`AutoModelForMaskedLM`).
- Comprension de documentos visuales: procesa imagenes de pagina completas, incluyendo OCR implicito, tablas, graficos y captions.
- Screenshot-to-code: entrenado explicitamente con un 16,71 % de tokens de subsets de screenshot-to-code.
- Razonamiento y matematicas basicas: 1,61 % de la mezcla de entrenamiento procedente de subsets de razonamiento y matematicas.
- VQA del mundo real: 1,16 % de la mezcla, con TallyQA de The Cauldron.
- Cabezas de tarea: `UltraVBertForSequenceClassification` y `UltraVBertForTokenClassification` anaden clasificacion de secuencia y de token sobre el mismo encoder.
- Base para recuperacion por interaccion tardia: sirve como encoder para ColUltraVBERT y ColUltraVBERT-Extreme.
- Tool calling / function calling: no disponible (no se documenta).
- Modo agentico o multi-step reasoning explicito: no disponible (no se documenta).
- Capacidades multilingues: no; el modelo esta etiquetado unicamente como ingles (en).
- Capacidades de vision, audio o thinking mode: dispone de vision (documentos); no se documentan audio ni modo de razonamiento explicito.

## Casos de uso

- Recuperacion de documentos visuales (RAG multimodal): el modelo genera embeddings por token sobre la pagina completa, lo que permite indexar facturas, informes o articulos escaneados y recuperarlos por similitud sin necesidad de un pipeline OCR separado.
- Construccion de un retriever ColBERT-style para documentos: mediante ColUltraVBERT sobre este encoder se pueden calcular puntuaciones de interaccion tardia entre tokens de consulta y tokens de pagina, util para busqueda enterprise sobre corpus de PDF.
- Extraccion de campos en formularios y facturas: la cabeza MLM permite enmascarar el valor de un campo y predecir su contenido condicionado por la imagen de la pagina.
- Indexacion de documentacion tecnica con tablas y graficos: la mezcla de entrenamiento incluye subsets especificos de tablas (3 %) y graficos (5 %), lo que resulta adecuado para manuales tecnicos y dashboards.
- Conversion de capturas de pantalla a codigo: gracias al 16,71 % de tokens de screenshot-to-code, puede emplearse como base para generar HTML o CSS a partir de mockups.
- Clasificacion de documentos por tipo o sensibilidad: con `UltraVBertForSequenceClassification` puede etiquetarse una pagina como contrato, nomina o informe sin extraer texto previamente.
- Etiquetado de tokens sobre documentos: con `UltraVBertForTokenClassification` se pueden detectar entidades o regiones relevantes directamente en la representacion de la pagina.
- Fine-tuning como backbone multimodal: al ser un encoder base de 293M parametros y licencia MIT, es adecuado como punto de partida para tareas propias de vision-language sin coste de licencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card y los metadatos de HuggingFace no incluyen cifras de MMLU, HumanEval, GSM8K, ViDoRe ni de ninguna otra evaluacion. Tampoco se han encontrado resultados en la busqueda web realizada, cuyos resultados no guardaban relacion con el modelo.

## Requisitos de hardware

- VRAM estimada para inferencia: los pesos en bfloat16 ocupan aproximadamente 0,6 GB (el repositorio completo ocupa 0,6 GB), por lo que la inferencia base cabe holgadamente en cualquier GPU moderna. Las estimaciones siguientes son calculos a partir del tamano del modelo, no datos publicados por el autor:
  - bfloat16: en torno a 1-2 GB de VRAM, incluyendo activaciones para una pagina de hasta 1.792 tokens de imagen.
  - Cuantizacion de 8 bits: aproximadamente 0,4-1 GB.
  - Cuantizacion de 4 bits: aproximadamente 0,3-0,8 GB.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM. Para lotes grandes o entrenamiento con imagenes a 3.072 px, se recomiendan A100, H100 o RTX 4090. Para inferencia de una sola pagina, una RTX 3060 o superior es suficiente.
- Compatibilidad con GPU de consumo: si, cabe en practicamente cualquier GPU de consumo actual (RTX 3060, RTX 4060, RTX 4090) e incluso en CPU para inferencia puntual, dado el reducido tamano de 293M parametros.
- Opciones de despliegue: al ser un modelo de la libreria transformers, puede servirse con vLLM, TGI o un script de PyTorch nativo. El autor indica que se necesita una version de transformers que incluya UltraVBERT, que esta en proceso de incorporacion upstream, por lo que el soporte en llama.cpp u Ollama no esta confirmado ni documentado.
- Latencia y throughput estimados: no disponibles. No se publican mediciones de latencia ni de tokens por segundo.

## Comparativa con modelos similares

| Modelo | Parametros | Resolucion / tiles | Encoder de texto | Licencia | Estado |
|---|---|---|---|---|---|
| UltraVBERT | 293.115.648 | Hasta 3.072 px, 27 tiles (+ copia reducida) | UltraBERT-150M | MIT | Disponible |
| ModernVBERT | No disponible | Hasta 2.048 px, 16 tiles | Ettin-150M | No disponible | Disponible (modelo base de este) |
| ColUltraVBERT | No disponible | No disponible | UltraVBERT | No disponible | Disponible (retriever de interaccion tardia) |
| ColUltraVBERT-Extreme | No disponible | No disponible | UltraVBERT | No disponible | En preparacion ("cooking") |

Los modelos comparables externos (ColPali, ColQwen2 y similares) no aparecen con datos de parametros, contexto ni rendimiento en la informacion proporcionada, por lo que no se incluye comparacion numerica con ellos.

## Limitaciones y advertencias

- Modelo base, no conversacional: es un encoder con cabeza MLM; no genera texto libre ni mantiene dialogos. Para uso practico requiere fine-tuning o el uso de los retrievers derivados (ColUltraVBERT).
- Unicamente en ingles: el campo `language` de la model card solo declara `en`; no se garantiza un comportamiento correcto en castellano ni en otros idiomas.
- Riesgo de alucinacion: la cabeza MLM puede predecir tokens plausibles pero incorrectos al rellenar valores en documentos (por ejemplo, cifras en una tabla), por lo que sus predicciones no deben usarse como fuente de verdad sin verificacion.
- Ausencia de benchmarks publicos: no hay cifras verificables de rendimiento en ViDoRe ni en otras evaluaciones, lo que dificulta comparar su calidad real frente a alternativas.
- Dependencia de version de transformers: el autor indica que se requiere una version de transformers que incluya UltraVBERT, todavia en proceso de incorporacion upstream; hasta entonces la integracion puede fallar.
- Coste computacional del preprocesado: una pagina a 3.072 px con 27 tiles mas la copia reducida genera hasta 1.792 tokens de imagen, lo que incrementa el coste de atencion frente a configuraciones mas reducidas.
- Datos de entrenamiento con licencias heterogeneas: la mezcla procede de Docmatix, FineVision, The Cauldron y RLHN-680K; conviene revisar las condiciones de cada dataset antes de un uso comercial, aunque la licencia del modelo sea MIT.
- Sesgos no evaluados: no se documentan analisis de sesgo ni de robustez, algo relevante al procesar documentos reales con sesgos de representacion.
- Adopcion muy baja: 0 descargas y 2 "likes" en el momento de la consulta, lo que implica poca validacion por parte de la comunidad y menor soporte ante problemas.
- Licencia MIT: permisiva y apta para uso comercial, sin restricciones adicionales documentadas, siempre que se respeten las licencias de los datasets subyacentes.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/athrael-soju/UltraVBERT
- ColUltraVBERT (retriever de interaccion tardia): https://huggingface.co/athrael-soju/ColUltraVBERT
- ColUltraVBERT-Extreme (en preparacion): https://huggingface.co/athrael-soju/ColUltraVBERT-Extreme
- Modelo base textual UltraBERT-150M: https://huggingface.co/dmis-lab/UltraBERT-150M
- Encoder de vision SigLIP2-B/16-512: https://huggingface.co/google/siglip2-base-patch16-512
- ModernVBERT (modelo del que deriva): https://huggingface.co/ModernVBERT/modernvbert
- Paper de ModernVBERT: https://arxiv.org/abs/2510.01149
- Paper de UltraBERT: https://arxiv.org/abs/2610.15028
- Dataset Docmatix: https://huggingface.co/datasets/HuggingFaceM4/Docmatix
- Dataset FineVision: https://huggingface.co/datasets/HuggingFaceM4/FineVision
- Dataset The Cauldron: https://huggingface.co/datasets/HuggingFaceM4/the_cauldron
- Dataset RLHN-680K: https://huggingface.co/datasets/rlhn/rlhn-680K

Nota: la busqueda web realizada no devolvio ningun resultado relevante sobre el modelo; las referencias anteriores proceden de la model card y de los metadatos de HuggingFace.
