# KiyoZVS/amem-embeddinggemma-r1-GGUF

## Resumen

`KiyoZVS/amem-embeddinggemma-r1-GGUF` es una cuantizacion en formato GGUF (Q8_0, con capas densas preservadas) de un fine-tuning de `google/embeddinggemma-300m`, el modelo de embeddings de Google derivado de la familia Gemma. Lo publica el usuario KiyoZVS y su proposito declarado es la categorizacion de memoria personal en ruso e ingles. No es un modelo generativo: es un encoder de frases orientado a similitud semantica y extraccion de caracteristicas (feature extraction), empaquetado para su uso en runtimes de inferencia basados en GGUF.

El modelo base cuenta con 307.581.696 parametros (aproximadamente 308 M) y hereda la arquitectura y el entrenamiento de EmbeddingGemma-300M, un encoder transformer bidireccional disenado para producir representaciones densas de texto. El autor no documenta el proceso de fine-tuning, el dataset empleado ni metricas de evaluacion, por lo que la informacion tecnica disponible es escasa y se limita a la model card y a los metadatos del repositorio.

Su relevancia practica es limitada pero concreta: ofrece un encoder pequeno (0,3 GB en el repositorio) ejecutable en CPU o GPUs modestas mediante llama.cpp u otros runtimes compatibles con GGUF, especializado en una tarea de nicho (clasificacion y recuperacion de recuerdos personales) y con soporte declarado para ruso e ingles. La licencia es la Gemma Terms of Use, lo que condiciona el uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (heredada de google/embeddinggemma-300m; detalles no disponibles) |
| Parametros totales | 307.581.696 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q8_0 (unica publicada en este repo) |
| Idiomas soportados | ruso e ingles (segun la model card) |
| Licencia | Gemma Terms of Use (tag `license:gemma`) |
| Formato de pesos | GGUF (con capas densas incluidas) |

## Arquitectura y entrenamiento

El modelo es un fine-tuning de `google/embeddinggemma-300m`, un encoder de aproximadamente 308 M de parametros perteneciente a la familia Gemma de Google. La model card no detalla la arquitectura interna (numero de capas, dimension oculta, cabezas de atencion) ni el regimen de atencion; solo confirma que se trata de un modelo de embeddings para similitud de frases y extraccion de caracteristicas. La cuantizacion publicada es Q8_0 en GGUF e incluye explicitamente las capas densas, un detalle relevante porque en modelos de embeddings la cabeza de proyeccion suele perderse en conversiones descuidadas y degradar la calidad de los vectores.

Respecto al entrenamiento, la informacion disponible es minima: el autor indica que el fine-tuning esta orientado a la categorizacion de memoria personal en ruso e ingles y que deben usarse los mismos prefijos que en EmbeddingGemma. No se especifican volumen de datos, composicion del dataset, uso de RLHF/DPO ni tecnicas de entrenamiento contrastivo. Tampoco se documentan innovaciones tecnicas propias mas alla del ajuste fino y la conversion a GGUF.

## Capacidades

- Generacion de embeddings de frases para tareas de similitud semantica (`sentence-similarity`).
- Extraccion de caracteristicas (`feature-extraction`) para pipelines de recuperacion y clasificacion.
- Categorizacion de memorias personales, tarea declarada del fine-tuning.
- Soporte bilingue declarado: ruso e ingles.
- Uso de prefijos de tarea, heredados de EmbeddingGemma, para orientar el embedding.
- No soporta generacion de texto, tool calling, agentes, vision ni audio: es un encoder, no un modelo generativo.
- Compatibilidad con endpoints de inferencia (`endpoints_compatible` en los tags), lo que sugiere despliegue en infraestructura compatible con GGUF.

## Casos de uso

- Clasificacion de recuerdos personales: el modelo genera embeddings de notas, entradas de diario o mensajes y permite agruparlos por categoria (temas, personas, eventos) mediante similitud coseno o un clasificador ligero sobre los vectores.
- Recuperacion semantica en asistentes de memoria personal: dado un historial de conversaciones o notas en ruso o ingles, el encoder indexa cada fragmento y recupera los recuerdos mas relevantes para una consulta, con un coste de computo muy bajo al ser un modelo de 308 M de parametros.
- Deduplicacion y agrupamiento de notas: los embeddings permiten detectar entradas redundantes o casi identicas en una base de conocimiento personal sin depender de coincidencia exacta de cadenas.
- Busqueda bilingue ruso-ingles: al compartir espacio de representacion entre ambos idiomas, permite consultar en un idioma y recuperar contenido en el otro, util en bases de datos personales mixtas.
- Filtrado y etiquetado en pipelines de datos: clasificar grandes volumenes de texto corto (mensajes, titulares, comentarios) por similitud con prototipos de categoria, ejecutable en CPU gracias al formato GGUF y al tamano reducido.
- Prototipado rapido en local: al pesar 0,3 GB y estar en Q8_0, se puede desplegar en un portatil con llama.cpp u Ollama para validar una idea de recuperacion semantica antes de invertir en infraestructura mayor.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de recuperacion (Recall@k, nDCG), MTEB ni evaluaciones de similitud, ni comparaciones con el modelo base.

## Requisitos de hardware

- VRAM estimada: inferior a 1 GB para Q8_0 (308 M de parametros a 8 bits, mas overhead de contexto y runtime). Cabe holgadamente en cualquier GPU consumer.
- GPU recomendadas: no requiere GPU dedicada; cualquier GPU con 2 GB o mas de VRAM es suficiente. Una RTX 3060, RTX 4090 o incluso una iGPU moderna pueden ejecutarlo.
- CPU: viable en inferencia por CPU con llama.cpp; el cuello de botella sera el throughput de encoding, no la memoria.
- Opciones de despliegue: llama.cpp, Ollama y servidores compatibles con GGUF que expongan endpoints de embeddings. vLLM y TGI no estan confirmados para este formato concreto.
- Latencia y throughput: no disponibles en la informacion proporcionada. Por el tamano del modelo, se espera un throughput alto en GPU y aceptable en CPU, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| KiyoZVS/amem-embeddinggemma-r1-GGUF | 307.581.696 | no disponible | ruso, ingles | Gemma Terms of Use | GGUF (Q8_0) |
| google/embeddinggemma-300m (base) | ~308 M | no disponible | no disponible | Gemma Terms of Use | safetensors |
| Otros encoders pequenos (p. ej. familia MiniLM o E5-small) | no disponible | no disponible | no disponible | no disponible | no disponible |

La comparacion con alternativas concretas no esta disponible en la informacion proporcionada: no se han publicado metricas del fine-tuning ni del modelo base en este repositorio, por lo que no es posible establecer una comparacion cuantitativa de rendimiento.

## Limitaciones y advertencias

- No hay metricas publicadas: se desconoce si el fine-tuning mejora o degrada el rendimiento del modelo base en tareas generales de embeddings; el ajuste esta orientado a una tarea muy especifica.
- Uso de prefijos obligatorio segun el autor: omitirlos puede degradar la calidad de los embeddings, ya que EmbeddingGemma fue entrenado con prefijos de tarea.
- Cobertura idiomatica limitada declarada (ruso e ingles); el comportamiento en castellano u otros idiomas no esta documentado.
- Riesgo de sesgos heredados del corpus de entrenamiento de EmbeddingGemma y de los datos de fine-tuning, que no se describen.
- Riesgo de falsos positivos en similitud semantica: como todo encoder denso, puede agrupar textos con vocabulario similar pero significado distinto; conviene calibrar umbrales con datos propios.
- Licencia Gemma Terms of Use: impone restricciones y obligaciones especificas para uso comercial y redistribucion; es necesario revisar los terminos antes de integrarlo en un producto.
- Repositorio con 0 descargas y 1 like en el momento de la consulta: no hay evidencia de uso en produccion ni validacion independiente.
- Solo se publica Q8_0; no hay variantes Q4 o Q5 que reduzcan aun mas el footprint, aunque el modelo ya es pequeno.
- La model card no documenta el proceso de conversion a GGUF ni verificaciones de fidelidad respecto al modelo original.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/KiyoZVS/amem-embeddinggemma-r1-GGUF
- Modelo base: https://huggingface.co/google/embeddinggemma-300m
- Terminos de uso de Gemma: https://ai.google.dev/gemma/terms
