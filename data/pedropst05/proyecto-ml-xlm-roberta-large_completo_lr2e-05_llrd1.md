# pedropst05/proyecto-ml-XLM-RoBERTa-large_completo_lr2e-05_llrd1

## Resumen

El modelo `pedropst05/proyecto-ml-XLM-RoBERTa-large_completo_lr2e-05_llrd1` es un ajuste fino de XLM-RoBERTa-large para clasificacion de sentimiento en resenas de productos, con tres clases: negativo, neutral y positivo. Lo desarrolla Pedro Pablo Sanin Trujillo en el marco del curso de Aprendizaje de Maquina (Grupo 36) de la Universidad de los Andes, y se publica bajo licencia MIT. No es un modelo generativo: es un encoder transformer de 559.893.507 parametros destinado a `text-classification`.

Su relevancia es acotada y practica: reutiliza el preentrenamiento multilingue de XLM-RoBERTa-large (Conneau et al., 2020) y anade una cabeza de clasificacion de tres clases, lo que permite analisis de sentimiento en espanol, ingles, portugues y frances con un unico modelo. El nombre del repositorio indica hiperparametros concretos de entrenamiento: learning rate 2e-05 y layer-wise learning rate decay (LLRD) activado.

El modelo tiene un caracter marcadamente academico: 2 descargas y 0 likes en el momento de la consulta, sin resultados de benchmarks publicados. Es util como referencia de ajuste fino multilingue y como componente de pipelines de analisis de opiniones, pero no debe considerarse un modelo de produccion validado a gran escala.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (XLM-RoBERTa-large, `XLMRobertaForSequenceClassification`) |
| Parametros totales | 559.893.507 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 512 tokens (maximo posicional de XLM-RoBERTa; no confirmado explicitamente en la model card) |
| Tipos de cuantizacion | no disponible (pesos publicados en float32; compatible con cuantizacion via transformers/bitsandbytes y text-embeddings-inference, no documentada por el autor) |
| Idiomas soportados | es, en, pt, fr |
| Licencia | MIT |
| Formato de pesos | safetensors (float32), mas tokenizer.json y tokenizer_config.json |

## Arquitectura y entrenamiento

La arquitectura es la de XLM-RoBERTa-large: un transformer encoder con atencion multi-cabeza bidireccional, preentrenado de forma no supervisada sobre corpus multilingues a gran escala (CommonCrawl) por FacebookAI. Sobre ese backbone se anadio una capa de clasificacion de tres clases y se reentreno el conjunto con resenas de productos etiquetadas como negativo, neutral o positivo. El autor no detalla el numero de tokens de entrenamiento ni la composicion exacta del dataset.

El identificador del repositorio documenta parte de la configuracion: learning rate de 2e-05 y layer-wise learning rate decay (LLRD) con factor 1, una tecnica habitual en ajuste fino de modelos grandes que aplica tasas de aprendizaje decrecientes en capas inferiores. El repositorio incluye `historial.json` con la perdida y el accuracy de entrenamiento por epoca, pero esos valores no se reproducen en la informacion disponible. No se menciona uso de RLHF, DPO ni tecnicas de decodificacion especulativa, algo esperable en un modelo de clasificacion.

## Capacidades

- Clasificacion de sentimiento en tres clases (negativo, neutral, positivo) sobre resenas de productos.
- Multilinguee en espanol, ingles, portugues y frances con un unico conjunto de pesos.
- Integracion directa con `transformers` mediante `pipeline("text-classification")`, ya que `config.json` contiene los nombres de las clases.
- Compatible con text-embeddings-inference y endpoints compatibles segun los tags del repositorio.
- No soporta generacion de texto, tool calling, agentes, vision ni audio: es un encoder de clasificacion.
- No dispone de modo de razonamiento (thinking mode) ni capacidades de razonamiento multi-paso.

## Casos de uso

- Analisis de opiniones en comercio electronico: clasificar resenas de productos en negativo, neutral y positivo para agregar puntuaciones por producto o categoria; el modelo esta entrenado especificamente con resenas de productos, que es su dominio natural.
- Monitorizacion de reputacion de marca en redes y foros: procesar menciones en espanol, portugues, frances e ingles con un solo modelo, reduciendo el coste de mantener cuatro clasificadores monolingueses.
- Enrutamiento de tickets de soporte: etiquetar el tono del mensaje del cliente para priorizar casos negativos hacia atencion humana y derivar los neutros o positivos a respuestas automatizadas.
- Analisis de encuestas abiertas (NPS, CSAT): convertir respuestas de texto libre en categorias de sentimiento para calcular metricas agregadas por segmento o pais.
- Filtrado previo en pipelines de datos: descartar o marcar resenas negativas antes de un proceso de curaduria de datasets o de deteccion de fraude en opiniones.
- Investigacion academica y docencia: servir como linea base reproducible de ajuste fino multilingue con LLRD, con historial de entrenamiento incluido en el repositorio.
- Moderacion de comentarios: detectar tono negativo en comentarios de usuarios como senal auxiliar, siempre con revision humana dado el riesgo de falsos positivos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio incluye un `historial.json` con perdida y accuracy de entrenamiento por epoca, pero sus valores no se han facilitado; ademas, metricas de entrenamiento no equivalen a evaluacion en test.

## Requisitos de hardware

- VRAM estimada en float32: aproximadamente 2,2 GB solo para pesos (559,9 M parametros x 4 bytes), mas activaciones y overhead del runtime; en la practica, entre 3 y 4 GB para lotes pequenos.
- En float16 o bfloat16: aproximadamente 1,1 GB de pesos, con un consumo total tipico de 2 a 3 GB.
- Cabe en GPU de consumo: RTX 3060 (12 GB), RTX 4060 Ti, RTX 4070, RTX 4090 y cualquier GPU con 4 GB o mas de VRAM.
- Tambien puede ejecutarse en CPU para inferencia por lotes con latencia aceptable, dado el tamano moderado del modelo.
- Opciones de despliegue: `transformers` (referencia), text-embeddings-inference (soportado segun tags), ONNX Runtime y cuantizacion via bitsandbytes. No hay confirmacion de soporte GGUF/Ollama ni de pesos convertidos a llama.cpp.
- Latencia y throughput: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Notas |
|---|---|---|---|---|---|
| Este modelo (XLM-RoBERTa-large fine-tuned) | 559,9 M | 512 tokens | es, en, pt, fr | MIT | Ajuste academico para 3 clases de sentimiento; sin benchmarks publicados |
| FacebookAI/xlm-roberta-large | 559,9 M | 512 tokens | ~100 idiomas | MIT | Modelo base sin cabeza de clasificacion; requiere ajuste fino |
| cardiffnlp/twitter-xlm-roberta-base-sentiment | ~278 M | 512 tokens | multilingue | no disponible en esta ficha | Sentimiento en 3 clases orientado a Twitter; base, no large |
| nlptown/bert-base-multilingual-uncased-sentiment | ~178 M | 512 tokens | multilingue | no disponible en esta ficha | Sentimiento en 5 estrellas sobre resenas; menor tamano |

La comparativa se limita a modelos de la misma familia o tarea; no se dispone de datos de rendimiento comparativo porque este modelo no publica evaluacion.

## Limitaciones y advertencias

- Entrenado exclusivamente con resenas de productos: su rendimiento puede degradarse con otros generos textuales (noticias, redes sociales, texto tecnico).
- Los errores se concentran en resenas mixtas que elogian un aspecto y critican otro, segun advierte el propio autor.
- Riesgo de alucinacion no aplica en sentido generativo, pero si de clasificaciones erroneas con alta confianza; conviene calibrar umbrales antes de automatizar decisiones.
- Sin benchmarks publicados ni evaluacion en test documentada: no hay evidencia cuantitativa de calidad fuera del conjunto de entrenamiento.
- El sesgo del modelo depende del dataset de resenas, no descrito; puede reflejar sesgos de dominio, idioma o cultura presentes en esos datos.
- Cobertura limitada a cuatro idiomas (es, en, pt, fr); el backbone soporta mas, pero no se garantiza el ajuste en otros.
- Contexto maximo de 512 tokens: resenas largas se truncan.
- Licencia MIT permite uso comercial, pero al ser un proyecto academico sin validacion externa, se recomienda evaluacion propia antes de desplegarlo en produccion.
- Actividad muy baja en el repositorio (2 descargas, 0 likes): no hay comunidad ni mantenimiento demostrado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/pedropst05/proyecto-ml-XLM-RoBERTa-large_completo_lr2e-05_llrd1
- Modelo base: https://huggingface.co/FacebookAI/xlm-roberta-large
- Paper de XLM-RoBERTa (Conneau et al., 2020): https://arxiv.org/abs/1911.02116
