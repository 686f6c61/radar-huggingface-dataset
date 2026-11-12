# qhchina/bert-base-chinese-douban-sentiment-2

## Resumen

`qhchina/bert-base-chinese-douban-sentiment-2` es un clasificador binario de sentimiento (negativo / positivo) para resenas en chino, obtenido mediante fine-tuning de `google-bert/bert-base-chinese`. Lo publica el usuario qhchina como artefacto de un trabajo academico (curso CHI3242) y esta pensado para clasificar criticas de Douban: una estrella se etiqueta como negativo y cinco estrellas como positivo. El modelo resuelve una tarea acotada de analisis de sentimiento en dominio de resenas culturales chinas, no es un modelo generativo ni un asistente conversacional.

Arquitectura y tamano son los del BERT base chino: transformer encoder de 12 capas, 768 dimensiones ocultas y 110 millones de parametros segun la ficha original de BERT; el recuento real de pesos en safetensors es de 102.269.186 parametros (la diferencia corresponde a la cabeza de clasificacion y a detalles de conteo). El contexto maximo es de 512 tokens, propio de BERT, y los pesos se distribuyen en safetensors con un tamano de repositorio de 0,4 GB.

Su relevancia es limitada y muy especifica: sirve como punto de partida barato y rapido para clasificacion de sentimiento en chino sobre resenas, con una precision reportada de 0,930 en un conjunto de test de 2.000 resenas. No hay publicaciones, benchmarks estandar ni adopcion comunitaria (0 descargas, 0 likes en el momento de la consulta), por lo que debe tratarse como un modelo experimental de nicho.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (BERT base), con cabeza de clasificacion sobre el vector [CLS] |
| Parametros totales | 102.269.186 (pesos en safetensors) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 512 tokens (limite de BERT) |
| Tipos de cuantizacion | No disponible (el autor no publica variantes cuantizadas; al ser un modelo de 0,4 GB es viable convertir a int8/ONNX por cuenta propia) |
| Idiomas soportados | Chino (zh) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un BERT base chino con una cabeza de clasificacion nueva sobre el vector [CLS], es decir, un fine-tuning de clasificacion estandar sobre un encoder preentrenado. El modelo base, `google-bert/bert-base-chinese`, aporta el conocimiento linguistico del chino; el autor solo sustituye la cabeza y ajusta el conjunto completo para la tarea binaria.

El entrenamiento se realizo con resenas de Douban procedentes del repositorio `qhchina-data`: 5.000 resenas de una estrella (negativo) y 5.000 de cinco estrellas (positivo), con una sola epoca y una tasa de aprendizaje de 2e-5. La evaluacion se hizo sobre 1.000 + 1.000 resenas reservadas, con una precision de 0,930. No se documentan tecnicas adicionales (RLHF, DPO, aumento de datos, decodificacion especulativa ni atencion lineal); es un fine-tuning supervisado convencional con un dataset pequeno y muy polarizado.

## Capacidades

- Clasificacion binaria de sentimiento en chino: devuelve etiquetas negativo / positivo sobre texto de entrada.
- Especializado en resenas de Douban, con dominio acotado a critica cultural (cine, libros, musica) en chino.
- No genera texto: es un modelo de clasificacion, no un modelo causal.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- Capacidad multilingue practicamente nula: solo se entreno y evaluo en chino.
- Sin modo thinking, vision, audio ni capacidades multimodales.
- Entrada limitada a 512 tokens, suficiente para resenas cortas o parrafos breves.

## Casos de uso

- Moderacion de resenas en plataformas de contenido chinas: clasificar automaticamente resenas de peliculas, libros o musica como positivas o negativas antes de publicarlas, con un coste de inferencia minimo al ser un modelo de 0,4 GB.
- Analisis de sentimiento de producto en comercio electronico: procesar lotes de opiniones en chino para calcular ratios de satisfaccion por articulo, usando el modelo como clasificador por lotes en un pipeline de datos.
- Monitorizacion de reputacion de marca: ingerir resenas y comentarios en chino y agregar la polaridad por dia o por producto para detectar caidas de valoracion.
- Etiquetado de datos para entrenamiento: usar el modelo como preanotador de sentimiento en corpus chinos y revisar manualmente solo los casos de baja confianza, reduciendo el coste de anotacion.
- Investigacion academica en PLN en chino: servir de baseline barato en experimentos de analisis de sentimiento o de comparacion frente a modelos mas grandes.
- Filtrado previo en sistemas de recomendacion: descartar o priorizar resenas segun su polaridad antes de pasarlas a un modelo generativo o a un sistema de ranking mas costoso.
- Clasificacion en entornos con recursos limitados: al caber en CPU y en GPUs de gama baja, permite desplegar el servicio en infraestructura minima o en el borde.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K u otros) en la informacion disponible. El unico dato de rendimiento reportado por el autor es la precision en su propio conjunto de test:

| Metrica | Valor | Conjunto |
|---|---|---|
| Precision (accuracy) | 0,930 | 1.000 resenas negativas + 1.000 positivas reservadas |

No hay datos de F1, precision/recall por clase, latencia ni throughput.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,4-0,5 GB en fp32 para los pesos; en la practica, menos de 1 GB incluyendo activaciones para lotes pequenos.
- GPU recomendadas: cualquier GPU con al menos 2 GB de memoria; una RTX 3060, RTX 4090, T4, A10, A100 o H100 son sobredimensionadas para este modelo.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU moderna e incluso en CPU para inferencia por lotes.
- Opciones de despliegue: transformers (PyTorch), ONNX Runtime, TorchScript, y servidores de inferencia como Hugging Face TGI o un endpoint sencillo con FastAPI. No hay variantes GGUF publicadas, aunque la conversion a llama.cpp no aplica porque no es un modelo generativo.
- Latencia y throughput: no disponibles en la informacion proporcionada; por el tamano, se espera un throughput alto en GPU y aceptable en CPU, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idioma | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| qhchina/bert-base-chinese-douban-sentiment-2 | 102,3 M | 512 | Chino | Clasificacion de sentimiento binaria | Apache 2.0 | Hugging Face, 0 descargas |
| google-bert/bert-base-chinese | 102,3 M (aprox.) | 512 | Chino | Modelo base preentrenado (MLM) | Apache 2.0 | Hugging Face, ampliamente usado |
| Modelos de sentimiento chino en Hugging Face (p. ej. variantes de bert-base-chinese fine-tuned) | ~100 M | 512 | Chino | Clasificacion de sentimiento | Variable | Multiples repositorios comunitarios |

La comparativa se limita al modelo base y a variantes comunitarias de la misma familia, ya que no se dispone de datos de benchmarks de alternativas concretas en la informacion proporcionada. Frente al modelo base, este aporta una cabeza de clasificacion entrenada para sentimiento en Douban; frente a alternativas comunitarias, no hay datos objetivos para establecer una comparacion de rendimiento.

## Limitaciones y advertencias

- Dataset de entrenamiento muy pequeno (10.000 resenas) y polarizado (solo 1 y 5 estrellas): el modelo puede fallar en resenas mixtas, neutras o con sentimiento moderado.
- Una sola epoca de entrenamiento: riesgo de infraajuste o de sensibilidad alta a la inicializacion.
- Dominio limitado a resenas de Douban en chino; el rendimiento fuera de ese dominio (otros productos, otros generos, texto informal o dialectal) no esta validado.
- Riesgo de sesgo hacia el vocabulario y el estilo de las resenas de Douban, con posible degradacion en otros registros.
- Riesgo de alucinacion no aplica en sentido generativo, pero si de clasificaciones erroneas con alta confianza en entradas fuera de distribucion.
- Limite de 512 tokens: resenas largas se truncan y pueden perder informacion relevante.
- Solo chino: no se debe usar con texto en otros idiomas.
- Licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantias ni soporte; es un artefacto academico sin mantenimiento declarado.
- Sin adopcion comunitaria (0 descargas, 0 likes): no hay validacion independiente de la precision reportada.
- No apto para producción critica sin una evaluacion propia sobre el dominio objetivo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/qhchina/bert-base-chinese-douban-sentiment-2
- Modelo base: https://huggingface.co/google-bert/bert-base-chinese
- Repositorio de datos citado por el autor: https://github.com/mcjkurz/qhchina-data
- Paper de BERT: https://arxiv.org/abs/1810.04805
