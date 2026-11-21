# MisasAI/LittlePotion-1BPW

## Resumen

LittlePotion-1BPW es una versión comprimida del modelo de embeddings estáticos potion-base-8M de MinishLab, reducido de 15 MB a 931 KB mediante cuantización a 1 bit por peso con el método LittleBit de Samsung Research. Lo publica MisasAI como artefacto independiente y no oficial, manteniendo la licencia MIT del original. No es un modelo generativo: es una tabla de embeddings estáticos que transforma texto en vectores densos para tareas de similitud semántica y recuperación.

El modelo parte de la arquitectura Model2Vec, que destila un transformer de sentence-transformers en una única matriz de embeddings por token. LittlePotion aplica factorización latente de bajo rango con pesos binarios (+1/-1) y escalares de ajuste, seguida de un reentrenamiento sobre texto de Wikipedia para recuperar parte de la calidad perdida. El resultado es un artefacto de menos de 1 MB que conserva entre el 90 % y el 98 % del rendimiento del original en las métricas publicadas.

Su relevancia radica en el nicho: entornos con restricciones extremas de almacenamiento o memoria (dispositivos embebidos, extensiones de navegador, aplicaciones móviles, filtros previos en pipelines de búsqueda) donde 15 MB ya son un coste inasumible y 4 MB de cuantización estándar siguen siendo demasiado. Es una pieza de infraestructura, no un modelo de propósito general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Model2Vec (embeddings estáticos destilados), cuantización LittleBit 1 bit/peso |
| Parametros totales | no disponible (modelo base potion-base-8M: 8M) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (embeddings estáticos por token; sin ventana de atención) |
| Tipos de cuantizacion | 1 bit por peso (formato propietario `.lbit`); el script permite cualquier bit rate |
| Idiomas soportados | inglés (`en`) |
| Licencia | MIT |
| Formato de pesos | `.lbit` (931 KB) + `tokenizer.json`; no safetensors ni GGUF |
| Dimension de embedding | no disponible |
| Tamano del repositorio | 0.0 GB (931 KB de pesos) |
| Libreria | model2vec |

## Arquitectura y entrenamiento

potion-base-8M es un modelo de embeddings estáticos: cada token del vocabulario tiene asociado un vector y la representación de una frase se obtiene agregando (media o pooling similar) los vectores de sus tokens, sin atención ni capas transformer en inferencia. LittleBit reescribe la matriz de embeddings como producto de dos matrices binarias de bajo rango con escalares de escala por fila/columna, lo que permite almacenar cada peso en un bit.

El proceso de compresión degrada inicialmente la calidad, por lo que el autor reentrena el modelo cuantizado sobre texto de Wikipedia (dataset `Salesforce/wikitext`) optimizando la coincidencia de similitudes entre pares de frases respecto al modelo original. El reentrenamiento se centró en similitud semántica, no en recuperación, lo que explica que las métricas de búsqueda caigan más que las de similitud. El script `scripts/potion_lb.py` permite reproducir el proceso con `--bpw` y `--steps` configurables.

## Capacidades

- Generación de embeddings de frases y tokens para similitud semántica (cosine similarity).
- Feature extraction para pipelines de clasificación, clustering y deduplicación.
- Sentence similarity: comparación de pares de frases (STS).
- Recuperación de información básica (search), con degradación notable frente al original.
- Inferencia en CPU sin GPU, con coste por consulta muy bajo (una suma de vectores).
- No soporta tool calling, agentes, generación de texto, visión ni audio.
- Multilingüe: no; solo inglés.

## Casos de uso

- Filtro previo en pipelines de búsqueda: usar LittlePotion como primera etapa de recuperación en dispositivos con poca memoria para descartar candidatos obvios antes de un reranker más pesado, aprovechando su tamaño de 931 KB y su baja latencia.
- Deduplicación de registros en aplicaciones móviles: calcular similitud entre textos de usuario en el propio dispositivo sin enviar datos a un servidor, gracias a la inferencia puramente CPU y al reducido footprint.
- Extensiones de navegador: clasificar o agrupar pestañas, historial o notas por temática con un modelo que cabe en el paquete de la extensión sin superar límites de tamaño.
- Búsqueda semántica en documentación técnica embebida: indexar fragmentos cortos en firmware o dispositivos IoT con almacenamiento limitado, aceptando la pérdida de calidad en recuperación (90 % del nDCG del original en SciFact).
- Clustering de tickets de soporte en backend ligero: agrupar mensajes de usuarios por similitud para enrutamiento, con un modelo que se carga en memoria en milisegundos.
- Prototipado y tests de pipelines de embeddings: sustituir el modelo de producción por LittlePotion en tests unitarios para reducir tiempos de carga y dependencias, validando la lógica del pipeline sin coste de GPU.
- Sistemas de recomendación de contenido textual a pequeña escala: comparar descripciones de artículos o productos con un modelo que cabe en caché de CPU.

## Benchmarks y rendimiento

Datos publicados en la model card (Spearman para STS-B y SICK-R; nDCG@10 para SciFact):

| Modelo | Tamano | STS-B | SICK-R | SciFact |
|---|---|---|---|---|
| potion-base-8M (original) | 15 MB | 0.754 | 0.647 | 0.505 |
| LittlePotion-1BPW | 931 KB | 0.737 | 0.625 | 0.453 |
| Retenido | 16x menor | 98 % | 97 % | 90 % |

No se han publicado resultados de latencia o throughput en la informacion disponible.

## Requisitos de hardware

- VRAM: no requiere GPU; el modelo ocupa 931 KB en disco y una fracción de MB en RAM al cargarse.
- GPU recomendadas: ninguna; inferencia en CPU es el caso de uso previsto.
- Cabe en cualquier GPU consumer, e incluso en microcontroladores con suficiente RAM y almacenamiento.
- Despliegue: carga mediante el loader incluido (`littlepotion.py`) con dependencias `torch`, `safetensors` y `tokenizers`; si `model2vec` está instalado devuelve un `StaticModel` estándar. No es compatible con vLLM, llama.cpp, Ollama ni TGI (no es un modelo generativo ni usa formato GGUF).
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | STS-B | Licencia | Tamano |
|---|---|---|---|---|---|
| LittlePotion-1BPW | 8M (base) | no aplica | 0.737 | MIT | 931 KB |
| potion-base-8M | 8M | no aplica | 0.754 | MIT | 15 MB |
| potion-base-8M 4-bit | 8M | no aplica | prácticamente sin pérdida (segun el autor) | MIT | ~4 MB |
| LittleLittlePotion-164kb | 8M (base) | no aplica | no disponible | MIT | 164 KB |

La comparativa natural es con el propio modelo base y sus variantes de cuantización del mismo autor; no se dispone de datos de otros modelos de embeddings estáticos de tamaño comparable en la informacion proporcionada.

## Limitaciones y advertencias

- Solo inglés; no soporta otros idiomas.
- No es un modelo generativo: no produce texto, no hace razonamiento ni tool calling.
- Pérdida de calidad medible: 10 % en recuperación (SciFact) y 2-3 % en similitud frente al original.
- El reentrenamiento se optimizó para similitud, no para búsqueda; el uso en recuperación degrada más de lo que sugieren las métricas de STS.
- Formato propietario `.lbit` con loader propio; no es interoperable con ecosistemas estándar (safetensors, GGUF) sin el código incluido.
- Es una versión no oficial; el autor original (MinishLab) no la mantiene ni la respalda.
- Posibles sesgos heredados de Wikipedia y del corpus de destilación de potion-base-8M; no documentados en la model card.
- Riesgo de alucinación no aplica (no genera texto), pero sí de falsos positivos en similitud por la agresiva cuantización.
- Licencia MIT permite uso comercial, pero conviene verificar la licencia del modelo base y del método LittleBit en despliegues de producción.
- Para la mayoría de casos, la cuantización 4-bit de potion (~4 MB) es prácticamente sin pérdida y más sencilla; LittlePotion solo tiene sentido cuando cada kilobyte cuenta.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/MisasAI/LittlePotion-1BPW
- Modelo base: https://huggingface.co/minishlab/potion-base-8M
- Variante más pequeña: https://huggingface.co/MisasAI/LittleLittlePotion-164kb
- Paper LittleBit (Samsung Research, NeurIPS 2025): https://arxiv.org/abs/2506.13771
- Repositorio Model2Vec: https://github.com/MinishLab/model2vec
- DOI Model2Vec: https://doi.org/10.5281/zenodo.17270888
