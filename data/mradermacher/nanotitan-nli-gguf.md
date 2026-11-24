# mradermacher/NanoTitan-NLI-GGUF

## Resumen

NanoTitan-NLI-GGUF es la version cuantizada en formato GGUF del modelo NanoTitan-NLI, desarrollado originalmente por blueprint-ai-bot y convertido por mradermacher. Se trata de un modelo encoder de tipo transformer con 33.213.315 parametros (aproximadamente 33 millones), disenado especificamente para tareas de inferencia de lenguaje natural (NLI), clasificacion zero-shot y extraccion de caracteristicas. Su reducido tamano lo convierte en una opcion extremadamente ligera para tareas de clasificacion de texto en produccion.

El modelo resuelve el problema de clasificar relaciones entre pares de frases (implicacion, contradiccion, neutralidad) y de realizar clasificacion zero-shot sobre textos, tareas fundamentales en pipelines de NLP como filtrado de contenido, deteccion de contradicciones en bases de conocimiento o enrutamiento de consultas. Al estar disponible en formato GGUF con cuantizaciones desde Q2_K hasta f16, puede ejecutarse en CPU y en hardware de gama baja sin necesidad de GPU dedicada.

Su relevancia actual radica en que ofrece capacidades de clasificacion NLI en un paquete de menos de 0,2 GB en su version f16, lo que facilita el despliegue en entornos con recursos limitados, aplicaciones de borde (edge computing) y sistemas donde la latencia y el consumo de memoria son criticos. La licencia MIT permite uso comercial sin restricciones adicionales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (derivada del modelo base NanoTitan-NLI) |
| Parametros totales | 33.213.315 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 |
| Idiomas soportados | en (ingles) |
| Licencia | MIT |
| Formato de pesos | GGUF (safetensors en el modelo base) |

## Arquitectura y entrenamiento

El modelo base NanoTitan-NLI es un transformer encoder de aproximadamente 33 millones de parametros, orientado a tareas de comprension del lenguaje y clasificacion. La informacion disponible no detalla la configuracion exacta de capas, dimensiones ocultas ni mecanismos de atencion especificos. El modelo ha sido entrenado sobre un conjunto de datasets que incluyen MultiNLI (nyu-mll/multi_nli) para inferencia de lenguaje natural, AG News (fancyzhx/ag_news) para clasificacion tematica, SST-2 (SetFit/sst2) para analisis de sentimiento, TweetEval (cardiffnlp/tweet_eval) para texto de redes sociales, Subj (SetFit/subj) para subjetividad y Rotten Tomatoes (cornell-movie-review-data/rotten_tomatoes) para resenas de cine.

La informacion proporcionada no especifica el numero total de tokens de entrenamiento, la composicion exacta del dataset ni si se aplicaron tecnicas de RLHF o DPO. Tampoco se documentan innovaciones tecnicas destacables como decodificacion especulativa o atencion lineal. La version GGUF ha sido generada mediante cuantizacion estatica (quantize_version 2, output_tensor_quantised 1) a partir de los pesos en formato Hugging Face del modelo base.

## Capacidades

- Clasificacion de texto: el modelo esta disenado para tareas de text-classification, incluyendo clasificacion binaria y multiclase.
- Inferencia de lenguaje natural (NLI): determina la relacion logica entre un par de frases (implicacion, contradiccion, neutralidad).
- Clasificacion zero-shot: puede asignar etiquetas a textos sin entrenamiento especifico previo sobre esas categorias, segun los tags del modelo.
- Extraccion de caracteristicas (feature-extraction): genera representaciones vectoriales de texto utilizables en pipelines downstream.
- Analisis de sentimiento: entrenado sobre SST-2 y Rotten Tomatoes, adecuado para clasificar polaridad en resenas y textos cortos.
- Clasificacion tematica: entrenado sobre AG News, puede categorizar noticias y textos en topics predefinidos.
- Procesamiento de texto de redes sociales: el dataset TweetEval indica capacidad para manejar texto informal y ruidoso.
- Deteccion de subjetividad: el dataset Subj permite distinguir entre texto objetivo y subjetivo.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y multi-step reasoning: no disponible (modelo encoder, no generativo).
- Capacidades multilingues: solo ingles.
- Capacidades especiales: no se documentan modos de pensamiento, vision ni audio.

## Casos de uso

- Filtrado de contradicciones en bases de conocimiento: el modelo puede comparar pares de afirmaciones extraidas de una KB y detectar si se contradicen, usando su capacidad NLI para mantener la coherencia factual en sistemas de gestion del conocimiento.
- Clasificacion zero-shot de tickets de soporte: sin entrenamiento adicional, se pueden definir categorias (facturacion, tecnico, reclamacion) y el modelo asigna cada ticket a la categoria mas probable, aprovechando su capacidad de zero-shot-classification.
- Moderacion de contenido en redes sociales: entrenado sobre TweetEval, puede clasificar textos informales y detectar categorias como toxicidad, emociones o temas, integrándose en pipelines de moderacion con latencia minima.
- Analisis de sentimiento en resenas de productos: su entrenamiento sobre SST-2 y Rotten Tomatoes lo hace adecuado para clasificar polaridad en resenas de cine, restaurantes o productos, con despliegue en CPU.
- Enrutamiento de consultas en buscadores: clasificar la intencion de una consulta (navegacional, informacional, transaccional) mediante clasificacion zero-shot para dirigirla al modulo adecuado del sistema de busqueda.
- Deduplicacion semantica de documentos: usando feature-extraction, se generan embeddings de textos y se detectan duplicados o near-duplicates en grandes corpus, con la ventaja de que el modelo cabe en memoria en cualquier maquina.
- Clasificacion de noticias en tiempo real: con AG News como dataset de entrenamiento, puede categorizar articulos entrantes en topics (deportes, tecnologia, politica) en un pipeline de ingesta de noticias de bajo coste.
- Deteccion de subjetividad en foros: distinguir opiniones de hechos en comentarios de usuarios para priorizar contenido objetivo en sistemas de reputacion o analisis de opinion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 0,2 GB en f16; inferior a 0,1 GB en cuantizaciones Q4_K_M o Q2_K. El modelo completo en f16 ocupa aproximadamente 0,2 GB en disco.
- GPU recomendadas: cualquier GPU con al menos 1 GB de VRAM es suficiente; el modelo puede ejecutarse en GPUs integradas y en CPU sin problema.
- Cabe en consumer GPU: si, en cualquier GPU consumer (GTX 1050, RTX 3060, RTX 4090, etc.) e incluso en Raspberry Pi y dispositivos de borde.
- Opciones de despliegue: llama.cpp, Ollama, y cualquier runtime compatible con GGUF; el modelo base puede desplegarse con transformers y Text Embedding Inference (TEI) para feature-extraction.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada; dado el tamano reducido, se espera latencia de milisegundos en CPU y throughput alto en lote, pero no se aportan cifras concretas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| NanoTitan-NLI-GGUF | 33,2 M | no disponible | en | MIT | GGUF |
| MiniLM-L6-v2 (referencia) | 22,7 M | 512 tokens | multilingue (variantes) | Apache 2.0 | safetensors, GGUF |
| DistilBERT-base (referencia) | 66 M | 512 tokens | en (mayoritariamente) | Apache 2.0 | safetensors, GGUF |
| DeBERTa-v3-xsmall (referencia) | 22 M | 512 tokens | en | MIT | safetensors, GGUF |

Nota: los datos de los modelos de referencia son orientativos y no provienen de la informacion proporcionada; se incluyen para contextualizar el tamano y la categoria. No se dispone de datos de rendimiento comparativo del modelo NanoTitan-NLI frente a estas alternativas.

## Limitaciones y advertencias

- Sesgos conocidos: al entrenarse sobre datasets como MultiNLI, TweetEval y Rotten Tomatoes, puede heredar sesgos de genero, raza y edad presentes en dichos corpus; no se documentan analisis de sesgo en la informacion disponible.
- Riesgo de alucinacion: al ser un modelo encoder de clasificacion, no genera texto libre, por lo que el riesgo de alucinacion se limita a clasificaciones erroneas o asignaciones de etiquetas con alta confianza pero incorrectas.
- Limitaciones de contexto: la longitud maxima de contexto no esta documentada; los modelos encoder de este tamano suelen limitarse a 512 tokens, lo que restringe el procesamiento de documentos largos.
- Limitaciones de idioma: solo soporta ingles; su uso con textos en castellano u otros idiomas producira resultados degradados.
- Restricciones de licencia: licencia MIT, que permite uso comercial, modificacion y redistribucion sin restricciones adicionales, siempre que se incluya el aviso de copyright.
- Caveats para produccion: las cuantizaciones Q2_K y Q3_K pueden degradar la calidad de clasificacion; se recomienda Q4_K_M o superior para produccion. No se han publicado evaluaciones formales de rendimiento en la informacion disponible, por lo que se recomienda validar el modelo sobre el dominio especifico antes de desplegarlo.

## Enlaces

- Hugging Face (modelo cuantizado): https://huggingface.co/mradermacher/NanoTitan-NLI-GGUF
- Modelo base: https://huggingface.co/blueprint-ai-bot/NanoTitan-NLI
- Pagina de descargas del cuantizador: https://hf.tst.eu/model#NanoTitan-NLI-GGUF
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafico de calidad de cuantizaciones (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas sobre cuantizaciones (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Solicitudes de modelos del cuantizador: https://huggingface.co/mradermacher/model_requests
- Dataset MultiNLI: https://huggingface.co/datasets/nyu-mll/multi_nli
- Dataset AG News: https://huggingface.co/datasets/fancyzhx/ag_news
- Dataset SST-2: https://huggingface.co/datasets/SetFit/sst2
- Dataset TweetEval: https://huggingface.co/datasets/cardiffnlp/tweet_eval
- Dataset Subj: https://huggingface.co/datasets/SetFit/subj
- Dataset Rotten Tomatoes: https://huggingface.co/datasets/cornell-movie-review-data/rotten_tomatoes
