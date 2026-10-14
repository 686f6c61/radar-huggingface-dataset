# Gkea/kinyarwanda-sentiment-afroxlmr-large

## Resumen

Gkea/kinyarwanda-sentiment-afroxlmr-large es un modelo de clasificacion de texto (analisis de sentimiento) especializado en kinyarwanda (codigo ISO `rw`). Se trata de un ajuste fino de Davlan/afro-xlmr-large, un encoder multilingue basado en XLM-RoBERTa-large con preentrenamiento continuado sobre lenguas africanas, y ha sido entrenado sobre el subconjunto de kinyarwanda del corpus AfriSenti (Muhammad et al., 2023), derivado de tuits.

El modelo resuelve una tarea concreta: asignar a un texto corto en kinyarwanda una de tres etiquetas de sentimiento (positivo, neutral o negativo). No es un modelo generativo ni conversacional; su salida es una distribucion de probabilidad sobre tres clases. Con 559.893.507 parametros, se situa en la categoria de encoders grandes (large) y es adecuado para inferencia de bajo coste en GPU de consumo.

Su relevancia radica en la escasez de recursos NLP para kinyarwanda: la mayoria de modelos de sentimiento publicados estan centrados en ingles o en lenguas europeas, y las variantes multilingues genericas rinden peor en lenguas africanas de bajos recursos. Este modelo aporta un punto de partida reproducible (semilla 42, hiperparametros documentados) y una metrica declarada de macro-F1 de 0.697 sobre 1.026 tuits de test, con licencia CC-BY-4.0 que permite uso comercial con atribucion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (XLM-RoBERTa-large; 24 capas, 1024 de dimension oculta, 16 cabezas de atencion) |
| Parametros totales | 559.893.507 |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | Maximo de la arquitectura XLM-RoBERTa: 512 tokens (514 posiciones); no se documenta en la model card |
| Tipos de cuantizacion | No disponible (no se documenta); al ser un encoder estandar admite cuantizacion dinamica de PyTorch y ONNX Runtime |
| Idiomas soportados | Kinyarwanda (`rw`) como idioma objetivo declarado; el modelo base es multilingue (afro-xlmr-large) |
| Licencia | CC-BY-4.0 |
| Formato de pesos | safetensors (tag del repositorio); tamano del repositorio 2,3 GB |

## Arquitectura y entrenamiento

La arquitectura es un transformer encoder de tipo XLM-RoBERTa en su variante large, con normalizacion pre-LN y embeddings posicionales absolutos. Sobre la cabeza de clasificacion se aplica una capa lineal que proyecta la representacion del token especial `<s>` a tres logits (positivo, neutral, negativo). El recuento de parametros (559.893.507) coincide con el de XLM-RoBERTa-large, lo que confirma que el fine-tuning no anadio capas intermedias. El modelo base, Davlan/afro-xlmr-large, es el resultado de continuar el preentrenamiento de XLM-R sobre corpus de lenguas africanas; no se detalla en la informacion disponible el volumen exacto de tokens ni la composicion de ese corpus de preentrenamiento.

El ajuste fino se realizo sobre el subconjunto de kinyarwanda del dataset shmuhammad/AfriSenti-twitter-sentiment, con aproximadamente 3.300 tuits de entrenamiento. Los hiperparametros documentados son: tasa de aprendizaje 1e-5, tamano de lote 16, 5 epocas con conservacion del mejor checkpoint (epoca 3) y semilla 42. No se menciona el uso de RLHF, DPO ni tecnicas de alineamiento, algo esperable en un clasificador discriminativo. La metrica de seleccion declarada es F1 (macro), evaluada sobre 1.026 tuits de test.

## Capacidades

- Clasificacion de sentimiento en tres clases (positivo, neutral, negativo) para texto corto en kinyarwanda.
- Procesamiento de textos tipo tuit (mensajes cortos, lenguaje informal, posible presencia de ruido ortografico).
- Inferencia por lotes: al ser un encoder, permite procesar grandes volumenes de texto en paralelo de forma eficiente.
- Extraccion de representaciones contextuales (embeddings de la ultima capa oculta) reutilizables para otras tareas de clasificacion o clustering en kinyarwanda.
- No dispone de generacion de texto, razonamiento multi-paso, uso de herramientas (tool calling) ni capacidades de agente.
- No dispone de capacidades de vision ni de audio.
- El soporte multilingue se limita a lo heredado del modelo base; el ajuste fino y la evaluacion se han realizado exclusivamente en kinyarwanda.

## Casos de uso

- Monitorizacion de redes sociales: clasificacion automatica de tuits en kinyarwanda para detectar sentimentos negativos hacia una marca, un servicio publico o una campana, agregando los resultados por franja temporal y por tema.
- Moderacion y priorizacion de quejas: en una plataforma de atencion ciudadana, el modelo puede etiquetar los mensajes entrantes como negativos para enrutarlos primero al equipo humano correspondiente.
- Analisis de opinion en investigacion social: procesamiento de corpus de tuits recogidos durante periodos electorales o eventos de actualidad en Ruanda, generando series temporales de polaridad.
- Enriquecimiento de datasets: uso del modelo como etiquetador automatico (weak supervision) para preanotar grandes volumenes de texto en kinyarwanda y reducir el coste de anotacion manual en proyectos posteriores.
- Panel de analitica de producto: integracion del clasificador en un pipeline de ingestion (por ejemplo, con ONNX Runtime o TorchServe) que puntue en tiempo casi real las menciones de una aplicacion publicadas en redes.
- Filtrado de contenido para estudios de mercado: separar opiniones negativas y positivas sobre un sector (telecomunicaciones, banca movil) a partir de conversaciones publicas en kinyarwanda.
- Investigacion comparativa en NLP de bajos recursos: servir como punto de referencia (baseline) reproducible frente a modelos multilingues genericos en tareas de sentimiento en lenguas africanas.

## Benchmarks y rendimiento

Unicos resultados publicados en la informacion disponible:

| Metrica | Valor | Conjunto de evaluacion |
|---|---|---|
| F1 macro | 0.697 | 1.026 tuits de test (subconjunto de kinyarwanda de AfriSenti) |
| Exactitud (accuracy) | 0.693 | 1.026 tuits de test (subconjunto de kinyarwanda de AfriSenti) |

No se han publicado resultados comparativos frente a otros modelos (MMLU, HumanEval, GSM8K u otros) en la informacion disponible, ni desagregados por clase mas alla de la observacion cualitativa de que la clase neutral es la mas debil.

## Requisitos de hardware

- VRAM estimada para inferencia (calculada a partir del recuento real de parametros; son estimaciones, no medidas publicadas):
  - FP32: ~2,24 GB solo de pesos; ~3 GB contando activaciones y overhead del runtime.
  - FP16/BF16: ~1,12 GB de pesos; ~2 GB en total.
  - INT8 (cuantizacion dinamica): ~0,56 GB de pesos; ~1,5 GB en total.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM sirve para lotes pequenos. Tarjetas comodas: RTX 3060, RTX 4060, RTX 4070, T4, L4, A10G. Para lotes grandes (256-1024 secuencias de 128 tokens) conviene partir de 8-16 GB de VRAM.
- Cabe en GPU de consumo: si, en practicamente todas las tarjetas modernas (GTX 1650 4 GB, RTX 3050, RTX 3060, RTX 4060 y superiores), especialmente en FP16 o INT8. Tambien es viable la inferencia en CPU para cargas no criticas en latencia.
- Opciones de despliegue: Hugging Face Transformers (pipeline `text-classification`), ONNX Runtime, TorchServe, NVIDIA Triton, FastAPI con un servidor propio y Hugging Face Inference Endpoints. vLLM, llama.cpp, Ollama y TGI no son adecuados: estan orientados a modelos generativos decoder-only y no soportan de forma nativa clasificadores encoder-only de este tipo (TGI puede soportar algunos modelos de clasificacion, pero no esta documentado para esta arquitectura en la informacion disponible).
- Latencia y throughput: no disponible. No se han publicado mediciones en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Idioma objetivo | Tarea | Contexto | Licencia | F1 / rendimiento | Disponibilidad |
|---|---|---|---|---|---|---|---|
| Gkea/kinyarwanda-sentiment-afroxlmr-large | 559.893.507 | Kinyarwanda (rw) | Sentimiento 3 clases | 512 tokens | CC-BY-4.0 | F1 macro 0.697; accuracy 0.693 | Hugging Face (0 descargas, 0 likes) |
| Davlan/afro-xlmr-large (modelo base) | ~560 M | 20 lenguas africanas, entre ellas kinyarwanda | Modelo de representacion (no clasificador) | 512 tokens | No disponible en la informacion proporcionada | No comparable directamente (requiere fine-tuning) | Hugging Face |
| Modelos multilingues de sentimiento genericos (por ejemplo, basados en XLM-R) | ~278 M (base) o ~560 M (large) | Multilingue con cobertura limitada del kinyarwanda | Sentimiento 3 clases | 512 tokens | Variable, a menudo no comercial | No disponible en la informacion proporcionada | Hugging Face |

Comparativa de rendimiento cuantitativa: no disponible. La informacion proporcionada solo incluye las metricas de este modelo, sin resultados de referencia de AfriSenti para kinyarwanda ni de las alternativas citadas.

## Limitaciones y advertencias

- Volumen de entrenamiento reducido: aproximadamente 3.300 tuits, lo que limita la generalizacion a otros dominios (prensa, literatura, conversaciones formales).
- La clase neutral es la mas debil segun el propio autor, lo que previsiblemente produce falsos negativos y falsos positivos en esa categoria.
- Se documentan errores sistematicos en anuncios, ironia y chistes, que suelen clasificarse incorrectamente. La deteccion de sarcasmo es un problema abierto en analisis de sentimiento en general.
- Riesgo de alucinacion: no aplica en el sentido generativo, ya que el modelo no produce texto libre; el riesgo equivalente es la asignacion de una etiqueta incorrecta con alta confianza.
- Dominio restringido al registro de Twitter: el rendimiento puede degradarse con textos mas largos o con ortografia normalizada respecto a la usada en redes sociales.
- Limite de contexto de 512 tokens: los documentos mas largos deben truncarse o segmentarse, con la consiguiente perdida de informacion.
- Idioma: el modelo esta ajustado y evaluado unicamente en kinyarwanda. Aunque el modelo base es multilingue, no hay evidencia de rendimiento en otras lenguas tras el ajuste.
- Licencia CC-BY-4.0: permite uso comercial, pero obliga a atribuir la autoria y a indicar si se han realizado modificaciones. No incluye clausula de patentes ni garantias.
- Ausencia de validacion externa: cero descargas y cero likes en el momento de la consulta, sin evaluaciones independientes que confirmen las metricas declaradas.
- Sesgos: no se documenta ningun analisis de sesgo por genero, origen geografico o dialecto dentro del kinyarwanda. La distribucion de AfriSenti (tuits) puede sobrerrepresentar determinados temas de actualidad de la ventana temporal de recogida.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Gkea/kinyarwanda-sentiment-afroxlmr-large
- Modelo base: https://huggingface.co/Davlan/afro-xlmr-large
- Dataset de ajuste fino (subconjunto de kinyarwanda): https://huggingface.co/datasets/shmuhammad/AfriSenti-twitter-sentiment
- Articulo de AfriSenti (Muhammad et al., 2023), citado en la model card: https://arxiv.org/abs/2302.08956
- Articulo de XLM-RoBERTa (arquitectura base): https://arxiv.org/abs/1911.02116
