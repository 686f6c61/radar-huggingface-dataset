# fisherman611/vibi-appfilter-v2-c

## Resumen

vibi-appfilter-v2-c es un modelo de embeddings de frases en vietnamita especializado en la tarea de filtrado de aplicaciones (app filtering) para el asistente LifeMate, desarrollado por el usuario fisherman611 en el contexto del Zalo AI Challenge 2026. Se trata de un fine-tune del codificador bi-direccional bkai-foundation-models/vietnamese-bi-encoder, un modelo de arquitectura RoBERTa con 134.998.272 par\u00e1metros (aproximadamente 135M), que convierte consultas y descripciones de aplicaciones en vectores densos para su uso en recuperaci\u00f3n sem\u00e1ntica.

El modelo resuelve el problema de mapear una petici\u00f3n en lenguaje natural del usuario a la aplicaci\u00f3n correcta dentro de un cat\u00e1logo, combinando recuperaci\u00f3n l\u00e9xica (BM25) con recuperaci\u00f3n densa. Su relevancia radica en que reporta m\u00e9tricas de recall muy altas en el conjunto de validaci\u00f3n (98,2 % en val_in, 98,5 % en val_ood y 93,6 % en val_alias) usando la fusi\u00f3n h\u00edbrida, lo que lo hace \u00fatil como componente de un pipeline de b\u00fasqueda de aplicaciones en producci\u00f3n.

Es un modelo de nicho, con cero descargas y cero likes en el momento de la consulta, publicado sin licencia declarada y sin model card extensa. La informaci\u00f3n disponible se limita a los metadatos de Hugging Face y a las notas del autor sobre configuraci\u00f3n de entrenamiento y resultados de evaluaci\u00f3n.

## Especificaciones t\u00e9cnicas

| Par\u00e1metro | Valor |
|---|---|
| Arquitectura | RoBERTa (encoder bi-direccional, base del modelo vietnamese-bi-encoder) |
| Par\u00e1metros totales | 134.998.272 |
| Par\u00e1metros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizaci\u00f3n | no disponible (pesos en safetensors, sin variantes GGUF publicadas) |
| Idiomas soportados | vietnamita (vi) |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de bkai-foundation-models/vietnamese-bi-encoder, un encoder de tipo RoBERTa adaptado al vietnamita para generar embeddings de frases. Sobre esa base se aplica un fine-tune orientado a la tarea de filtrado de aplicaciones, con una configuraci\u00f3n que el autor denomina "C": una combinaci\u00f3n de la p\u00e9rdida MNRL (Multiple Negatives Ranking Loss) dentro del batch al 50 % y una p\u00e9rdida InfoNCE con dos negativos duros al 50 %, entrenada durante una \u00fanica \u00e9poca. El preprocesamiento requiere segmentaci\u00f3n de palabras en vietnamita con la librer\u00eda `pyvi` antes de codificar el texto.

Los datos de entrenamiento combinan el conjunto proporcionado por los organizadores del Zalo AI Challenge con datos aumentados generados por el autor: alias, variantes de interfaz y variantes fon\u00e9ticas, adem\u00e1s de un conjunto de aplicaciones escrito manualmente. Se excluyeron cinco aplicaciones retenidas para evaluaci\u00f3n (alarm, ewallet, flights, loyalty y podcast_radio) y, seg\u00fan el autor, no se utilizaron etiquetas ni frases de los conjuntos de test p\u00fablico o privado. El modelo se distribuye con la librer\u00eda sentence-transformers para su uso directo como codificador de frases.

## Capacidades

- Generaci\u00f3n de embeddings densos de frases en vietnamita para recuperaci\u00f3n sem\u00e1ntica.
- Codificaci\u00f3n de consultas de usuario y de descripciones o nombres de aplicaciones en un espacio vectorial com\u00fan.
- Recuperaci\u00f3n h\u00edbrida: el autor reporta resultados combinando BM25 y embeddings, lo que permite integrarlo en pipelines de b\u00fasqueda l\u00e9xica m\u00e1s densa.
- Manejo de variantes l\u00e9xicas: alias, variantes de interfaz y variantes fon\u00e9ticas de los nombres de aplicaciones, seg\u00fan los datos de entrenamiento descritos.
- Evaluaci\u00f3n en escenarios fuera de distribuci\u00f3n (val_ood) y de alias (val_alias), lo que indica cierta robustez ante formulaciones no vistas.
- No se documentan capacidades de generaci\u00f3n de texto, tool calling, razonamiento multi-paso, visi\u00f3n ni audio; es exclusivamente un encoder de embeddings.

## Casos de uso

- B\u00fasqueda de aplicaciones en asistentes conversacionales: el modelo codifica la petici\u00f3n del usuario y la compara con los embeddings del cat\u00e1logo de apps para devolver las m\u00e1s relevantes, combinado con BM25 para mejorar el recall en consultas ambiguas.
- Filtrado de aplicaciones en el asistente LifeMate: integrado en el pipeline del Zalo AI Challenge, permite seleccionar la app correcta a partir de una frase en vietnamita, incluyendo alias y variantes fon\u00e9ticas.
- Deduplicaci\u00f3n y agrupaci\u00f3n de fichas de aplicaciones: los embeddings permiten calcular similitud entre descripciones y detectar entradas duplicadas o casi duplicadas en un cat\u00e1logo.
- Enrutamiento de intenciones hacia servicios: en un asistente de voz o chat, el vector de la consulta puede usarse para decidir qu\u00e9 servicio o app invocar antes de ejecutar una acci\u00f3n.
- B\u00fasqueda sem\u00e1ntica en cat\u00e1logos peque\u00f1os y medianos: con 135M par\u00e1metros y pesos safetensors, puede desplegarse en CPU o GPU modesta para indexar y consultar cat\u00e1logos de aplicaciones sin infraestructura pesada.
- Evaluaci\u00f3n de robustez l\u00e9xica: sirve como referencia para medir cu\u00e1nto degrada un sistema de recuperaci\u00f3n ante alias y errores fon\u00e9ticos en vietnamita, gracias a las particiones val_ood y val_alias descritas por el autor.

## Benchmarks y rendimiento

El autor reporta \u00fanicamente m\u00e9tricas de recall para la fusi\u00f3n h\u00edbrida BM25@4 \u222a emb@5 y para el modo solo embeddings (emb-only) en val_ood@5:

| Conjunto | Recall h\u00edbrido BM25@4 \u222a emb@5 (%) | Recall emb-only@5 (%) |
|---|---|---|
| val_in | 98,2 | no disponible |
| val_ood | 98,5 | 88,8 |
| val_alias | 93,6 | no disponible |

El autor se\u00f1ala que el resultado emb-only en val_ood es inestable entre \u00e9pocas. No se han publicado resultados de benchmarks est\u00e1ndar (MMLU, HumanEval, GSM8K, MTEB) en la informaci\u00f3n disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: al tratarse de un encoder de 135M par\u00e1metros, los pesos en fp32 ocupan aproximadamente 540 MB; en fp16, unos 270 MB. El repo completo ocupa 0,5 GB.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM es suficiente; tarjetas como RTX 3060, RTX 4090, A100 o H100 pueden ejecutarlo con holgura, aunque el modelo no aprovecha su capacidad.
- Cabe en GPU de consumo: s\u00ed, en pr\u00e1cticamente cualquier GPU consumer moderna e incluso en CPU para cargas moderadas.
- Opciones de despliegue: sentence-transformers (librer\u00eda declarada), y por extensi\u00f3n frameworks compatibles con modelos de embeddings como Hugging Face Transformers, vLLM (para embeddings) o TGI. No se han publicado variantes GGUF para llama.cpp u Ollama.
- Latencia y throughput: no disponibles en la informaci\u00f3n proporcionada.
- Requisito de preprocesamiento: es necesario instalar `pyvi` y aplicar segmentaci\u00f3n de palabras en vietnamita antes de codificar.

## Comparativa con modelos similares

| Modelo | Par\u00e1metros | Contexto | Idiomas | Licencia | Enfoque |
|---|---|---|---|---|---|
| fisherman611/vibi-appfilter-v2-c | 134.998.272 | no disponible | vi | no disponible | Embeddings para filtrado de apps |
| bkai-foundation-models/vietnamese-bi-encoder | no disponible | no disponible | vi | no disponible | Embeddings generales en vietnamita (modelo base) |
| Sentence-transformers multiling\u00fces (p. ej. paraphrase-multilingual-MiniLM) | no disponible | no disponible | multiling\u00fce | no disponible | Embeddings generales multiling\u00fces |

No se dispone de datos de rendimiento comparables de los modelos alternativos en la informaci\u00f3n proporcionada, por lo que la comparaci\u00f3n se limita a par\u00e1metros, idioma y prop\u00f3sito.

## Limitaciones y advertencias

- Modelo de nicho: entrenado espec\u00edficamente para filtrado de aplicaciones en vietnamita; su rendimiento fuera de esa tarea no est\u00e1 documentado.
- Licencia no disponible: no se puede confirmar el uso comercial; es necesario contactar con el autor antes de utilizarlo en producci\u00f3n.
- Sin model card detallada: no se documentan sesgos, composici\u00f3n exacta del dataset ni limitaciones de contexto.
- Dependencia de preprocesamiento: requiere segmentaci\u00f3n con `pyvi`; omitirla puede degradar la calidad de los embeddings.
- Inestabilidad reportada: el autor indica que el recall emb-only en val_ood es inestable entre \u00e9pocas, lo que sugiere sensibilidad al entrenamiento y posibles fluctuaciones en producci\u00f3n.
- Riesgo de alucinaci\u00f3n: no aplica como modelo generativo, pero s\u00ed puede producir recuperaciones incorrectas cuando la consulta queda fuera de la distribuci\u00f3n de entrenamiento.
- Cobertura l\u00e9xica limitada a los datos de entrenamiento: alias y variantes fon\u00e9ticas no vistas pueden reducir el recall.
- Sin variantes cuantizadas publicadas: no hay GGUF ni otros formatos ligeros listos para usar.
- Cero descargas y validaci\u00f3n externa: no hay evidencia de uso por terceros ni evaluaciones independientes.

## Enlaces

- Hugging Face: https://huggingface.co/fisherman611/vibi-appfilter-v2-c
- Modelo base: https://huggingface.co/bkai-foundation-models/vietnamese-bi-encoder
- Zalo AI Challenge: no disponible en la informaci\u00f3n proporcionada
- Paper o blog del autor: no disponible en la informaci\u00f3n proporcionada
- Repositorio de c\u00f3digo: no disponible en la informaci\u00f3n proporcionada
