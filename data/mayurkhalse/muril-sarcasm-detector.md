# Mayurkhalse/muril-sarcasm-detector

## Resumen

muril-sarcasm-detector es un modelo de clasificación de texto desarrollado por el usuario Mayurkhalse, consistente en un ajuste fino (fine-tuning) del modelo google/muril-base-cased de Google para la detección binaria de sarcasmo e ironía. Está especializado en tres registros lingüísticos: inglés, hindi (en escritura devanagari) y hinglish (mezcla de código hindi-inglés o hindi transliterado), un escenario poco cubierto por los clasificadores convencionales entrenados solo en inglés.

La arquitectura subyacente es MuRIL (Multilingual Representations for Indian Languages), un transformer de tipo encoder basado en BERT con 237.557.762 parámetros y vocabulario adaptado a lenguas indias. El modelo resuelve una tarea de clasificación de secuencias con dos etiquetas (0: no sarcástico, 1: sarcástico) y devuelve probabilidades calibradas mediante softmax, incorporando regularización con label smoothing (0.1) y weight decay L2 (0.05).

Su relevancia radica en el enfoque multilingüe para el análisis de opinión y moderación de contenido en entornos indios, donde el hinglish domina las redes sociales y los sistemas de detección de ironía escasean. No obstante, el repositorio registra 0 descargas y 0 likes en el momento de la ficha, y no se han publicado resultados de benchmarks, por lo que su rendimiento real no ha sido validado de forma independiente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder tipo BERT (MuRIL-base-cased) |
| Parametros totales | 237.557.762 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 512 tokens (heredado de MuRIL-base; no confirmado explicitamente en la model card) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en, hi, multilingual (incluye hinglish, hindi transliterado) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |
| Tamano del repositorio | 1.0 GB |
| Tarea (pipeline) | text-classification (clasificacion binaria) |

## Arquitectura y entrenamiento

El modelo parte de google/muril-base-cased, un transformer encoder de tipo BERT con 237 millones de parametros, entrenado originalmente por Google sobre 17 lenguas indias mas ingles, con datos traducidos y transliterados para alinear representaciones entre lenguas. Sobre esta base se ha realizado un ajuste fino para clasificacion de secuencias de dos clases, anadiendo una cabeza de clasificacion sobre la representacion del token [CLS]. La salida son logits que se normalizan con softmax para obtener probabilidades por clase.

La model card documenta el uso de label smoothing con valor 0.1 y weight decay L2 de 0.05, tecnicas orientadas a producir puntuaciones de confianza calibradas y a evitar el sobreajuste. No se especifican en la informacion disponible el numero de tokens de entrenamiento, la composicion del dataset, ni si se aplicaron tecnicas de alineacion como RLHF o DPO (no aplicables de forma habitual a un clasificador discriminativo). Tampoco se detalla la estrategia de validacion ni los hiperparametros completos de entrenamiento.

## Capacidades

- Clasificacion binaria de sarcasmo e ironia (etiquetas: 0 no sarcastico, 1 sarcastico) con puntuacion de confianza por clase.
- Deteccion de sarcasmo situacional, ironia y expresiones coloquiales sarcasticas en contextos de redes sociales, entorno laboral y conversacion.
- Procesamiento de ingles estandar.
- Procesamiento de hindi en escritura devanagari.
- Procesamiento de hinglish (codigo mezclado hindi-ingles y hindi transliterado con alfabeto latino).
- Manejo de entradas con truncado y padding hasta una longitud maxima configurable (el ejemplo de la model card usa 128 tokens).
- Inferencia por lotes (batch) mediante la API de transformers.
- No dispone de soporte documentado de tool calling, function calling, agentes ni razonamiento multi-paso (es un clasificador, no un modelo generativo).
- No dispone de capacidades de vision, audio ni modo de pensamiento (thinking mode).

## Casos de uso

- Moderacion de contenido en redes sociales: filtrar automaticamente comentarios sarcasticos o ironicos potencialmente ofensivos en comunidades indias donde predomina el hinglish, aprovechando la cobertura multilingue del modelo en una sola pasada.
- Analisis de sentimiento y opinion: enriquecer pipelines de analisis de opinion detectando la inversion de significado que introduce el sarcasmo, que suele confundir a los clasificadores de polaridad tradicionales.
- Monitorizacion de reputacion de marca: identificar menciones sarcasticas sobre un producto o servicio que un analisis de sentimiento convencional clasificaria erroneamente como positivas.
- Atencion al cliente automatizada: etiquetar mensajes entrantes de usuarios para priorizar aquellos con tono sarcastico o de queja encubierta, mejorando el enrutamiento hacia agentes humanos.
- Investigacion en procesamiento del lenguaje natural: servir como linea base (baseline) para estudios academicos sobre deteccion de ironia en lenguas indias y entornos de codigo mezclado.
- Analisis de conversaciones laborales: detectar ironia en herramientas de comunicacion interna (chat corporativo) en equipos multilingues que alternan ingles e hindi.
- Curacion de datasets: preetiquetar grandes volumenes de texto para crear corpus anotados de sarcasmo en ingles, hindi y hinglish, reduciendo el coste de anotacion manual.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no incluye metricas de exactitud, F1, precision ni recall, ni comparaciones cuantitativas con otros clasificadores de sarcasmo. Cualquier evaluacion de rendimiento requeriria una validacion independiente sobre un conjunto de prueba propio.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0.95 GB en precision fp32 (237 M de parametros x 4 bytes), unos 0.5 GB en fp16 y en torno a 0.25 GB en int8. El repositorio ocupa 1.0 GB, coherente con pesos en fp32.
- GPU recomendadas: cualquier GPU con 2 GB o mas de VRAM es suficiente (por ejemplo, GTX 1650, RTX 3050, RTX 4090, A100, H100). El modelo no requiere aceleradores de gama alta.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU de consumo moderna e incluso en GPUs integradas. Tambien es viable en CPU para cargas de baja concurrencia.
- Opciones de despliegue: transformers (PyTorch) de forma nativa; exportacion a ONNX para inferencia optimizada; servidores de inferencia compatibles con modelos BERT como Hugging Face Text Generation Inference (TGI) o TorchServe. No se documentan pesos GGUF ni soporte especifico de llama.cpp u Ollama (aunque al ser un modelo BERT podria convertirse a formatos alternativos con herramientas externas).
- Latencia y throughput estimados: no disponibles en la informacion proporcionada. Dado el tamano de 237 M de parametros y una secuencia de 128 tokens, la latencia en GPU de gama media seria del orden de milisegundos por lote, pero no se aportan mediciones oficiales.

## Comparativa con modelos similares

| Modelo | Parametros | Idiomas | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Mayurkhalse/muril-sarcasm-detector | 237,6 M | en, hi, hinglish | Deteccion de sarcasmo binaria | apache-2.0 | Hugging Face (0 descargas) |
| AventIQ-AI/Sarcasmdetection | no disponible | en principalmente | Deteccion de sarcasmo en titulares y texto | no disponible | Hugging Face |
| lm-kit/LM-Kit.Sarcasm_Detection-TinyLlama-1.1B-1T-OpenOrca-en-q4-gguf | 1.100 M (cuantizado q4) | en | Deteccion de sarcasmo (generativo) | no disponible | Hugging Face |

Los modelos comparables encontrados en la busqueda web no publican especificaciones completas de parametros, contexto o licencia, por lo que la comparacion cuantitativa fiable no esta disponible. El modelo de lm-kit se distingue por estar basado en un LLM generativo (TinyLlama 1.1B) cuantizado a q4, mientras que muril-sarcasm-detector es un encoder discriminativo especializado en lenguas indias, lo que constituye su principal diferenciador.

## Limitaciones y advertencias

- No se han publicado benchmarks ni evaluaciones independientes; el rendimiento real es desconocido.
- El repositorio presenta 0 descargas y 0 likes, por lo que no ha sido validado por la comunidad ni sometido a escrutinio externo.
- La model card no documenta el dataset de entrenamiento, su procedencia ni su tamano, lo que impide evaluar posibles sesgos de dominio o de anotacion.
- Riesgo de alucinacion no aplicable en sentido generativo (es un clasificador), pero si existe riesgo de clasificaciones erroneas con puntuaciones de confianza calibradas que pueden inducir a sobreconfianza.
- El sarcasmo depende en gran medida del contexto y de senales sociales y culturales; textos con contexto limitado o dependiente de conversaciones previas pueden clasificarse incorrectamente.
- La longitud de contexto efectiva esta limitada al maximo posicional de MuRIL-base (512 tokens) y el truncado en textos largos puede eliminar informacion relevante para la deteccion.
- Aunque declara soporte multilingue, la cobertura fuera del ingles, el hindi y el hinglish no esta garantizada ni evaluada.
- Licencia apache-2.0, que permite uso comercial, modificacion y redistribucion, siempre que se conserve el aviso de licencia y atribucion correspondiente.
- Para uso en produccion se recomienda validar sobre datos propios del dominio objetivo y establecer umbrales de decision ajustados, dado que no hay informacion sobre el punto de operacion optimo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Mayurkhalse/muril-sarcasm-detector
- Modelo base google/muril-base-cased: https://huggingface.co/google/muril-base-cased
- AventIQ-AI/Sarcasmdetection (modelo comparable): https://huggingface.co/AventIQ-AI/Sarcasmdetection
- Listado de modelos de deteccion de sarcasmo en Hugging Face: https://huggingface.co/models?sort=downloads&search=sarcasm
- Sarcasm Detection Using Neural Networks (GeeksforGeeks): https://www.geeksforgeeks.org/deep-learning/sarcasm-detection-using-neural-networks/
- On Sarcasm Detection with OpenAI GPT-based Models (arXiv): https://arxiv.org/abs/2312.04642
- An Evaluation of State-of-the-Art Large Language Models for Sarcasm Detection (arXiv): https://arxiv.org/pdf/2312.03706
