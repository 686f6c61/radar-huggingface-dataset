# sifat-febo/banglish-embed

## Resumen

Banglish Embed es un modelo de embeddings de frases bilingüe desarrollado por Sifat Febo, diseñado para alinear representaciones semánticas entre el bengalí escrito en alfabeto bengalí y el banglish, es decir, el bengalí transliterado fonéticamente al alfabeto latino. El modelo resuelve un problema concreto: la búsqueda y recuperación de información en textos que mezclan ambos sistemas de escritura, un escenario habitual en redes sociales, foros y aplicaciones de mensajería en Bangladesh y la diáspora bengalí. Está entrenado desde cero, no es una adaptación de un modelo multilingüe existente, porque los tokenizadores de los modelos multilingües estándar fragmentan el banglish al no estar preparados para el alfabeto latino en este contexto.

Con 2,85 millones de parámetros, 128 dimensiones y 4 capas, es un modelo extremadamente ligero (12 MB) que se ejecuta en CPU sin necesidad de GPU. Su ventana de contexto es de 64 tokens, suficiente para frases cortas. Fue entrenado con 42.398 pares de frases alineadas del dataset BanglaTLit, mediante entrenamiento contrastivo simétrico, de modo que ninguna dirección (bengalí→banglish o banglish→bengalí) es privilegiada. Su relevancia actual radica en que cubre un hueco en el procesamiento de lenguas de bajos recursos: la mayoría de los modelos multilingües ignoran la variante transliterada, y este modelo la trata como ciudadana de primera clase.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (BERT) de 4 capas, 128 dimensiones de embedding |
| Parametros totales | 2.866.304 |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 64 tokens (aprox. 40 palabras) |
| Tipos de cuantizacion | No especificados por el autor; al ser safetensors, es posible cuantizar a int8 o int4 con herramientas como optimum o llama.cpp, aunque no hay guias oficiales |
| Idiomas soportados | Bengalí (alfabeto bengalí) y banglish (bengalí en alfabeto latino); inglés dentro de frases mixtas, pero no ingles puro |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (compatible con sentence-transformers y text-embeddings-inference) |

## Arquitectura y entrenamiento

El modelo es un transformer BERT pequeño, entrenado desde cero con un tokenizador BPE bilingüe de 16.000 tokens, construido sobre ambos alfabetos. Según el autor, este tokenizador logra un 0% de tokens desconocidos tanto en bengalí como en banglish, algo que no consiguen los tokenizadores de modelos multilingües generalistas. El entrenamiento se realizó con 42.398 pares de frases alineadas del dataset BanglaTLit, que contiene pares escritos por humanos en ambos sistemas de escritura. Se usó una pérdida contrastiva simétrica, de modo que el modelo aprende a acercar representaciones de frases equivalentes sin importar la dirección de la transliteración. No se menciona el uso de RLHF, DPO ni ninguna técnica de ajuste posterior; el entrenamiento es exclusivamente contrastivo a nivel de frase.

## Capacidades

- Generacion de embeddings de frases para similitud semantica y recuperacion.
- Busqueda cross-script: una consulta en banglish recupera documentos en bengalí y viceversa.
- Deduplicacion de contenido duplicado escrito en ambos alfabetos.
- Clustering de textos mixtos bengalí-banglish.
- Integracion en pipelines de RAG (retrieval augmented generation) sobre corpus bilingües.
- No soporta tool calling, agentes, vision ni audio; es exclusivamente un modelo de embeddings de texto.

## Casos de uso

- Busqueda en redes sociales y foros: un usuario escribe en banglish "Karo kaj korle bolben please" y el sistema recupera publicaciones en bengalí "কারো কাজ করলে বলবেন প্লিজ" que tratan el mismo tema, gracias a la alineacion cross-script.
- Deduplicacion de contenido en plataformas de noticias o blogs: el mismo articulo publicado en bengalí y en banglish se identifica como duplicado mediante la similitud de embeddings, evitando indexar dos veces.
- Chatbots de atencion al cliente con base de conocimiento bilingüe: las preguntas de usuarios en banglish se emparejan con respuestas almacenadas en bengalí, sin necesidad de traduccion intermedia.
- Clustering de comentarios o reseñas en aplicaciones de comercio electronico: agrupa opiniones sobre un mismo producto escritas en ambos alfabetos, facilitando el analisis de sentimiento.
- RAG para asistentes virtuales en bengalí: el modelo actua como retriever en un pipeline donde los documentos estan en bengalí y las consultas de los usuarios llegan en banglish, mejorando la precision de la recuperacion.
- Moderacion de contenido en plataformas sociales: detecta mensajes equivalentes escritos en ambos alfabetos para aplicar politicas de forma consistente, por ejemplo, spam o discursos de odio.

## Benchmarks y rendimiento

El autor publica resultados sobre 2.000 pares retenidos, donde se recupera la contraparte de cada consulta desde el pool completo. El azar se situa en 0,05%. Los resultados son:

| Direccion | recall@1 | recall@5 | MRR |
|---|---|---|---|
| Bengalí → Banglish | 97,3% | 99,3% | 0,981 |
| Banglish → Bengalí | 97,8% | 99,4% | 0,984 |

El autor advierte que estos numeros deben interpretarse como un minimo, ya que una parte de los fallos se debe a artefactos del dataset (por ejemplo, pares anonimizados solo en un lado) y a casi-duplicados que dicen lo mismo que la coincidencia verdadera. No se han publicado comparaciones con otros modelos de embeddings en esta tarea especifica.

## Requisitos de hardware

- VRAM: no requiere GPU; el modelo pesa 12 MB y se ejecuta completamente en CPU.
- GPU recomendada: ninguna; cualquier CPU moderna es suficiente.
- Compatible con hardware de consumo: si, incluso en Raspberry Pi o dispositivos moviles.
- Opciones de despliegue: sentence-transformers (Python), text-embeddings-inference (TEI) para servir endpoints, o exportacion a ONNX para entornos de produccion.
- Latencia: del orden de milisegundos por frase en CPU; throughput tipico de cientos de frases por segundo en un nucleo moderno, aunque no hay cifras oficiales.

## Comparativa con modelos similares

No se han publicado comparativas de rendimiento de este modelo contra alternativas en la tarea bengalí-banglish. A continuacion se comparan caracteristicas generales con otros modelos de embeddings multilingües que podrian usarse para el mismo fin, aunque ninguno esta especializado en banglish.

| Modelo | Parametros | Contexto | Idiomas | Licencia | Observaciones |
|---|---|---|---|---|---|
| banglish-embed | 2,85 M | 64 tokens | bn, banglish | Apache 2.0 | Entrenado desde cero, especializado en transliteracion |
| LaBSE | 471 M | 512 tokens | 109 idiomas | Apache 2.0 | Multilingüe generalista, tokeniza mal el banglish |
| multilingual-e5-small | 118 M | 512 tokens | 100 idiomas | MIT | Buen rendimiento general, pero no optimizado para banglish |
| MiniLM-L12-multilingual | 118 M | 256 tokens | 50+ idiomas | MIT | Similar a e5, sin soporte especifico para transliteracion |

La ventaja de banglish-embed es su tamano reducido y su especializacion, que evita el problema de tokenizacion del banglish. Su desventaja es la limitacion a un solo par de idiomas y a frases cortas.

## Limitaciones y advertencias

- Solo cubre dos sistemas de escritura para un unico idioma: bengalí y banglish. No es adecuado para ingles puro ni para otros idiomas.
- Longitud de contexto limitada a 64 tokens (unas 40 palabras); textos mas largos se truncan, perdiendo informacion.
- Entrenado a nivel de frase, por lo que no es un buen punto de partida para fine-tuning a nivel de token (por ejemplo, NER o POS).
- El modelo solo captura la relacion de equivalencia semantica entre dos frases; no distingue si el contenido es verdadero, falso, ofensivo o sobre un tema concreto en un sentido mas profundo.
- Posibles sesgos derivados del dataset BanglaTLit, que puede contener anonimizaciones inconsistentes o desequilibrios en los dominios representados.
- No hay informacion sobre el numero de tokens de entrenamiento ni la composicion exacta del dataset, lo que dificulta evaluar la robustez ante dominios no vistos.
- Licencia Apache 2.0 permite uso comercial, pero el dataset de entrenamiento (BanglaTLit) es MIT, por lo que no hay restricciones adicionales conocidas.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/sifat-febo/banglish-embed
- Dataset de entrenamiento: https://huggingface.co/datasets/aplycaebous/BanglaTLit
- Modelo companion (chatbot banglish): https://huggingface.co/sifat-febo/banglish-companion
- Perfil del autor: https://huggingface.co/sifat-febo
