# jaichang/embeddinggemma2-global-birds-2000

## Resumen

jaichang/embeddinggemma2-global-birds-2000 es un modelo de embeddings trimodal obtenido por ajuste fino de google/embeddinggemma-2 (744.371.512 parametros, aproximadamente 744 M) sobre observaciones reales de fauna salvaje. Lo desarrolla el usuario jaichang y su proposito es alinear en un unico espacio vectorial de 768 dimensiones (normalizado L2) tres modalidades distintas: canto de ave en audio a 16 kHz, fotografias de campo en RGB y descripciones ecologicas en lenguaje natural en coreano e ingles. La recuperacion se resuelve con similitud coseno sobre un indice multi-vector precalculado, sin necesidad de un cabezal de clasificacion entrenado por especie.

El modelo cubre un catalogo cerrado de 2.000 especies de aves silvestres, combinando 620 especies coreanas y 1.380 especies de distribucion global. Ademas de servir como buscador trimodal en servidor, el autor lo presenta como modelo profesor para destilar encoders ultraligeros que se ejecutan en movil con LiteRT (.tflite) y en navegador con WebGPU (.onnx), publicados en un repositorio companero.

Es relevante ahora porque demuestra un patron habitual en IA open source aplicada: un encoder de la familia Gemma reutilizado mediante fine-tuning con perdida de ranking (InfoNCE) para un dominio cientifico muy especifico, la bioacustica, donde los modelos clasicos suelen ser unimodales (solo audio o solo imagen). La licencia cc-by-sa-4.0 facilita el uso y la redistribucion con atribucion y compartir igual.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder derivado de google/embeddinggemma-2; dimension de embedding 768, normalizada L2; numero de capas, cabezas y dimension oculta: no disponible |
| Parametros totales | 744.371.512 (≈744 M), dato real de los pesos safetensors |
| Parametros activos | no aplica (modelo denso, no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el repositorio publica pesos safetensors; no se incluyen variantes GGUF, AWQ ni GPTQ) |
| Idiomas soportados | en, ko |
| Licencia | cc-by-sa-4.0 |
| Formato de pesos | safetensors (PyTorch), acompanado de config.json y tokenizer.json; indice adicional en .npz (float32) y catalogo en .json |
| Modalidades de entrada | audio (16 kHz, clips de 4-5 s), imagen RGB, texto (coreano e ingles) |
| Tamano del repositorio | 1,5 GB |
| Libreria de referencia | sentence-transformers |
| Pipeline declarado | zero-shot-classification |
| Descargas / likes | 18 / 0 |
| Fecha de creacion / actualizacion | 2026-10-11 / 2026-10-11 |

## Arquitectura y entrenamiento

El modelo parte del encoder google/embeddinggemma-2 y conserva su estructura de transformer, con salida proyectada a un espacio de 768 dimensiones que se normaliza L2 para que el producto escalar equivalga a la similitud coseno. Al tratarse de un encoder de embeddings y no de un modelo generativo, no existe decodificador autoregresivo: el uso previsto es la codificacion de consultas y referencias para recuperacion por vecino mas cercano.

El ajuste fino se realizo con Multiple Negatives Ranking Loss (InfoNCE) sobre pares y tripletas que cruzan las tres modalidades. Los datos proceden de tres fuentes: taxonomia de iNaturalist Open Taxonomy API y del Korea Biodiversity Information System (KBR) para las 2.000 especies; audio a 16 kHz de 4-5 segundos del iNaturalist Open Data Audio Archive, filtrado con `sounds=true&quality_grade=research` y licencias CC0 o CC-BY por observacion; e imagenes RGB del archivo S3 de iNaturalist, con licencias CC0 o CC-BY. El texto en coreano e ingles proviene de la API REST de resumen de Wikipedia (CC BY-SA 4.0). No se documentan en la informacion disponible el numero total de tokens o pares de entrenamiento, la composicion exacta del dataset, ni si hubo fases de RLHF o DPO (poco habituales en modelos de embeddings).

La innovacion principal es la alineacion trimodal en un unico espacio de 768 dimensiones y el uso del modelo como profesor de destilacion: los embeddings de este modelo sirven de referencia para entrenar encoders estudiantes de 9,2 MB (vision) y 14,7 MB (audio) que se ejecutan en dispositivo. El repositorio incluye ademas un indice multi-vector (`global_2000_birds_multivector_index.npz`) con las matrices `audio_hybrid_embs`, `photo_hybrid_embs` y `text_embs` en float32 con forma [N, 768], y un catalogo JSON con nombres cientificos, coreanos e ingleses, descripciones y URL de referencia.

## Capacidades

- Recuperacion texto-a-ave: consultas en lenguaje natural en ingles o coreano devuelven la especie mas probable mediante producto escalar contra el indice de fotos, audio o texto.
- Recuperacion audio-a-ave: codifica clips de canto a 16 kHz y busca la especie correspondiente en el espacio compartido.
- Recuperacion imagen-a-ave: codifica fotografias RGB de campo y las compara con las referencias del catalogo.
- Clasificacion zero-shot sobre un conjunto cerrado de 2.000 especies, sin cabezal especifico por clase.
- Capacidad multilingue limitada a ingles y coreano, incluyendo la coincidencia cruzada entre ambos idiomas dentro del mismo espacio vectorial.
- Indexacion y busqueda Top-K por similitud coseno sobre vectores precalculados, apta para busqueda por similitud a escala de catalogo.
- Funcion como modelo profesor para destilacion de conocimiento en encoders moviles (LiteRT/.tflite) y de navegador (WebGPU/.onnx).
- No dispone de generacion de texto, razonamiento multi-paso, tool calling, function calling ni capacidades de agente: no es un modelo de lenguaje generativo y la informacion disponible no documenta ninguna de estas funciones.
- La informacion disponible no documenta modo de pensamiento, salida de audio, ni vision generativa mas alla de la codificacion de imagenes.

## Casos de uso

- Identificacion de aves por canto en aplicaciones de campo: el usuario graba unos segundos de canto, el modelo lo codifica a 768 dimensiones y la busqueda por similitud coseno sobre `audio_hybrid_embs` devuelve las especies candidatas con su nombre cientifico y comun en coreano e ingles.
- Identificacion a partir de fotografias tomadas en salidas de observacion: la consulta visual se compara contra el indice de fotos de referencia, util para fotografia de fauna donde el diagnostico por canto no es posible.
- Busqueda descriptiva sin conocer el nombre de la especie: consultas del tipo "ave blanca y negra con cola larga y alas verdeazuladas" o su equivalente en coreano se resuelven contra el indice multimodal, lo que sirve para guias de campo interactivas y material educativo bilingue.
- Etiquetado asistido de ciencia ciudadana: plataformas tipo iNaturalist pueden usar las sugerencias del modelo como preetiquetado de observaciones pendientes de revision, reduciendo el trabajo de los identificadores humanos antes de la validacion experta.
- Filtrado y triaje de grabaciones pasivas de bioacustica: en un flujo de monitorizacion acustica continua, el modelo puede reducir el volumen de horas de grabacion descartando segmentos con baja similitud respecto al catalogo de 2.000 especies, siempre acotado a ese conjunto cerrado.
- Ecoturismo y educacion ambiental: aplicaciones moviles que combinan el encoder destilado del repositorio companero permiten identificar aves en el dispositivo, sin enviar audio ni fotos a un servidor y sin coste de inferencia en la nube.
- Generacion del conjunto de referencia para destilacion: equipos que quieran entrenar sus propios encoders ligeros de audio o vision pueden usar este modelo como profesor para producir los pares de embeddings de entrenamiento.
- Analisis de cobertura taxonomica en informes de biodiversidad: comparar la distribucion de similitudes de un conjunto de grabaciones frente al catalogo permite detectar especies poco representadas o posibles especies fuera del catalogo (con la cautela descrita en limitaciones).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor incluye tres rejillas de visualizacion de evaluacion (`korean_birds_gallery_grid.png`, `korean_620_birds_result_grid.png` y `korean_620_birds_photo_search_grid.png`), pero no se acompanan de cifras numericas como recall@K, mAP, precision@1 ni comparaciones cuantitativas con otros modelos. No se dispone de resultados de MMLU, HumanEval, GSM8K ni de metricas de recuperacion multimodal.

## Requisitos de hardware

- VRAM estimada en FP32: aproximadamente 3 GB solo para los pesos de 744 M de parametros, mas activaciones y espacio para el indice.
- VRAM estimada en FP16/BF16: aproximadamente 1,5 GB para los pesos, coherente con el tamano del repositorio (1,5 GB); con espacio de trabajo y batches moderados, la inferencia cabe en 2-4 GB de VRAM.
- Cuantizacion a 8 bits: pesos en torno a 0,75 GB, aunque el repositorio no publica pesos cuantizados oficiales, por lo que requeriria conversion propia.
- GPU consumer: si, cabe holgadamente en tarjetas con 6 GB o mas, como RTX 3060, RTX 4060, RTX 4070 o RTX 4090; tambien en GPUs integradas con memoria compartida para cargas de baja concurrencia.
- CPU: la inferencia en CPU es viable por el tamano del modelo, adecuada para indexado offline o entornos sin GPU.
- Opciones de despliegue: sentence-transformers (ruta documentada por el autor), PyTorch nativo, Text Embeddings Inference (TEI) para servir embeddings de texto. Para la parte multimodal es necesario codificar audio e imagen con el procesador correspondiente antes de proyectar al espacio de 768 dimensiones.
- llama.cpp y Ollama: no hay pesos GGUF publicados, por lo que no son una via de despliegue directa con estos pesos.
- vLLM: aplicable solo a la codificacion de texto, no a las entradas de audio o imagen.
- On-device: los encoders estudiantes del repositorio companero (9,2 MB vision y 14,7 MB audio en ONNX) estan pensados para movil y navegador, con latencia declarada inferior a un segundo por codificacion.
- Latencia y throughput del modelo de 740 M: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Modalidades | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| jaichang/embeddinggemma2-global-birds-2000 | Audio, imagen, texto (en/ko), dominio aves | 744 M | no disponible | cc-by-sa-4.0 | HuggingFace, pesos safetensors + indice |
| google/embeddinggemma-2 (modelo base) | Texto, multilingue general | 740 M segun la informacion de este repositorio | no disponible | no disponible en la informacion proporcionada | HuggingFace |
| BirdNET (Cornell Lab) | Audio, dominio aves | no disponible | no disponible | no disponible en la informacion proporcionada | Distribucion propia del proyecto |
| BioCLIP | Imagen y texto, dominio biologico | no disponible | no disponible | no disponible en la informacion proporcionada | Repositorio propio del proyecto |

Comparativa cualitativa: frente a los clasificadores bioacusticos clasicos, que operan solo sobre audio, este modelo anade imagen y descripcion textual en el mismo espacio vectorial, lo que permite consultas cruzadas entre modalidades. Frente al modelo base, la diferencia es el ajuste de dominio sobre fauna aviar y la incorporacion de un catalogo y un indice de referencia listos para usar. No se dispone de cifras publicadas que permitan comparar rendimiento de recuperacion entre estas alternativas, ni de datos verificados de parametros o licencia de BirdNET y BioCLIP en la informacion proporcionada.

## Limitaciones y advertencias

- Cobertura cerrada: el indice abarca exactamente 2.000 especies. Una consulta sobre una especie fuera de ese conjunto no devolvera "desconocido", sino la mas cercana del catalogo, con riesgo de falso positivo silencioso.
- Riesgo de clasificacion erronea con alta confianza: al ser un modelo de similitud, la similitud coseno no es una probabilidad calibrada. No se documentan umbrales de rechazo ni curvas de calibracion.
- Sesgo de muestreo: los datos proceden de observaciones de grado de investigacion de iNaturalist, con sobrerrepresentacion previsible de regiones con alta actividad de observadores y de especies fotografiadas y grabadas con frecuencia; las especies raras o de habitos cripticos estaran peor cubiertas.
- Sesgo acustico y visual: los clips son de 4-5 segundos a 16 kHz y las fotos son imagenes de referencia de calidad variable; cantos con ruido de fondo, solapamiento de especies o fotos con oclusion pueden degradar la recuperacion. No se documenta evaluacion de robustez ante ese dominio.
- Limitacion idiomatica: solo ingles y coreano. Las consultas en castellano u otros idiomas no estan soportadas por el ajuste.
- Limitaciones de contexto: la longitud de contexto del encoder no se especifica; en la practica el modelo trabaja con descripciones cortas y clips de pocos segundos, no con documentos largos.
- Licencia: cc-by-sa-4.0 permite uso comercial, pero exige atribucion y que las obras derivadas se distribuyan bajo la misma licencia, lo que puede condicionar productos propietarios que integren el modelo o sus embeddings. Ademas, el modelo deriva de google/embeddinggemma-2 y la informacion disponible no detalla como interactua la licencia cc-by-sa-4.0 con las condiciones del modelo base; conviene revisarlo antes de un despliegue comercial.
- Dependencia de datos de terceros: el indice y el catalogo incorporan referencias de iNaturalist y texto de Wikipedia (CC BY-SA 4.0), con lo que la redistribucion del indice hereda obligaciones de atribucion.
- Madurez: el repositorio tiene 18 descargas y 0 likes en el momento de la consulta, sin resultados de benchmarks publicados, por lo que no debe adoptarse en produccion sin una evaluacion propia sobre datos del dominio objetivo.
- Uso responsable: las predicciones sobre fauna no deben emplearse como unica base para decisiones de conservacion, gestion cinegetica o evaluaciones de impacto ambiental sin validacion por expertos.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/jaichang/embeddinggemma2-global-birds-2000
- Repositorio companero on-device (LiteRT .tflite y WebGPU .onnx): https://huggingface.co/jaichang/embeddinggemma2-global-birds-2000-litert
- Modelo base: https://huggingface.co/google/embeddinggemma-2
- iNaturalist Open Data (taxonomia, audio y fotos): https://www.inaturalist.org/pages/developers
- Archivo de fotos de iNaturalist Open Data en S3: https://inaturalist-open-data.s3.amazonaws.com
- API REST de resumen de Wikipedia, citada como fuente del texto: https://<codigo-idioma>.wikipedia.org/api/rest_v1/page/summary/
- Korea Biodiversity Information System (KBR), citado en la model card como fuente de taxonomia coreana: URL no disponible
- La busqueda web realizada no devolvio resultados relevantes sobre este modelo; los enlaces obtenidos no guardaban relacion con el contenido de la ficha.
