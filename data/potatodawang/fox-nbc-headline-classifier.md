# Potatodawang/fox-nbc-headline-classifier

## Resumen

Fox-nbc-headline-classifier es un modelo de clasificación de texto binaria que predice si un titular o enlace de noticia proviene de Fox News o de NBC News, basándose únicamente en las palabras del titular (por ejemplo, `/biden-signs-infrastructure-bill`). Lo desarrolla Potatodawang (EvelynGao233) en el contexto del curso CIS 4190/5190, Track B, y se distribuye como un conjunto de tres implementaciones independientes más un ensemble de pesos iguales que constituye el envío final.

El modelo resuelve un problema acotado de atribución de estilo editorial: distinguir la línea editorial de dos cadenas estadounidenses a partir de la morfología del slug de la URL y del vocabulario del titular. No es un modelo generativo ni un LLM: son clasificadores ligeros implementados en PyTorch puro, con formas de tensor fijas, que se ejecutan en CPU sin necesidad de la librería `transformers`.

Su relevancia es fundamentalmente didáctica y de referencia para tareas de clasificación de texto con recursos limitados: demuestra que un ensemble de TF-IDF con regresión logística, un EmbeddingBag estilo fastText y un DistilBERT reimplementado alcanza un 89,9 % de accuracy en un conjunto de validación de titulares no vistos, frente al 73,9 % de la línea base del curso. El repositorio ocupa 0,6 GB y la licencia es MIT.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Ensemble de tres clasificadores: TF-IDF con hash + regresión logística; EmbeddingBag de subpalabras con hash (64-d) + MLP de 128 unidades; DistilBERT reimplementado en PyTorch puro |
| Parámetros totales | no disponible (el repo incluye tres `model.pt` de 16 MB, 134 MB y 134 MB; el ensemble final pesa 285 MB) |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible; el entrenamiento de DistilBERT usa un máximo de 64 tokens |
| Tipos de cuantización | no disponible (pesos en `model.pt` de PyTorch, sin versiones GGUF ni cuantizadas) |
| Idiomas soportados | inglés (`en`) |
| Licencia | MIT |
| Formato de pesos | `model.pt` (PyTorch `state_dict`), cargado con `torch.load`; sin safetensors ni GGUF |

## Arquitectura y entrenamiento

El ensemble combina tres enfoques clásicos de clasificación de texto. El primero es TF-IDF con hashing sobre n-gramas de palabra 1–3, de carácter 1–5 y de longitud, alimentando una regresión logística liblinear con C = 10. El segundo es una red fastText con EmbeddingBag de subpalabras con hash (dimensión 64) y un MLP de 128 unidades, entrenada con SparseAdam/Adam, learning rate 1e-2 con decaimiento lineal, batch de 256 y selección del mejor de 6 epochs sobre el conjunto de validación. El tercero es `distilbert-base-uncased` afinado durante 1,5 epochs y reimplementado en PyTorch puro con su tokenizador WordPiece, usando AdamW a 5e-5, batch de 256, 6 % de warm-up, fp16 y máximo de 64 tokens, con el mejor checkpoint de 2 epochs entrenado en una Colab T4. Los tres se combinan con pesos iguales en el modelo final.

Los datos de entrenamiento son 637 000 titulares: los enlaces del curso más enlaces extraídos de los sitemaps de ambas cadenas (Fox News desde 2022, NBC News desde 2015), con todos los titulares del conjunto de validación val20 eliminados. El conjunto val20 contiene 959 enlaces; el modelo se evalúa sobre titulares no vistos y el autor indica que ningún modelo consulta titulares de entrenamiento. Los historiales de entrenamiento están en `fasttext/train_history.json` y `distilbert/bert_history.json`.

## Capacidades

- Clasificación binaria de titulares o enlaces de noticia en dos clases: Fox News y NBC News.
- Normalización de URL a cadena de titular en minúsculas mediante `preprocess.prepare_data(csv_path)`, que reduce enlaces completos igual que lo hace el leaderboard del curso.
- Inferencia en CPU con PyTorch puro, sin dependencia de `transformers`.
- Procesamiento por lotes mediante el método `predict` sobre listas de cadenas.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni generación de texto.
- No tiene capacidades de visión, audio ni modo de razonamiento (thinking mode).
- Cobertura monolingüe: solo inglés.

## Casos de uso

- Clasificación de titulares en pipelines de monitorización de medios: dado un flujo de URLs de noticias, el modelo asigna cada titular a Fox News o NBC News para agregar métricas de cobertura por cadena.
- Etiquetado de datasets periodísticos: `preprocess.prepare_data` más el ensemble permiten anotar automáticamente corpus de titulares con la cadena de origen cuando el dominio no está disponible o se quiere verificar.
- Filtrado y enrutamiento en agregadores de noticias: clasificar enlaces entrantes para dirigirlos a secciones editoriales distintas según la cadena de procedencia.
- Estudio de estilo editorial: analizar qué vocabulario y estructuras de slug discriminan entre ambas cadenas, útil en investigación de comunicación política.
- Docencia y referencia de clasificación de texto: el repositorio incluye tres implementaciones independientes con scripts de entrenamiento, lo que lo convierte en material de comparación entre TF-IDF, embeddings y transformers destilados en tareas de clasificación.
- Prototipado rápido en CPU: al ejecutarse sin GPU y sin `transformers`, sirve para entornos con recursos limitados o para pruebas de concepto de clasificación binaria de titulares.

## Benchmarks y rendimiento

| Modelo | Accuracy en val20 (titulares no vistos) | Tamaño de `model.pt` |
|---|---|---|
| Ensemble de pesos iguales (envío final) | 89,9 % | 285 MB |
| TF-IDF con hash + regresión logística | 88,4 % | 16 MB |
| fastText (EmbeddingBag + MLP) | 88,1 % | 134 MB |
| DistilBERT reimplementado | 88,5 % | 134 MB |
| Línea base del curso | 73,9 % | no disponible |

El ensemble obtuvo un 96,34 % en el leaderboard del curso (8 000 enlaces ocultos). El autor advierte que esta cifra es superior a la de val20 porque muchos titulares de test también aparecen en los sitemaps públicos usados en el entrenamiento.

## Requisitos de hardware

- Inferencia en CPU: todos los modelos son PyTorch puro con formas de tensor fijas y se ejecutan sin GPU.
- VRAM estimada: no aplica para CPU; no se han publicado requisitos de VRAM para ejecución en GPU.
- GPU recomendadas: no disponible; el entrenamiento de DistilBERT se realizó en una Colab T4.
- Cabe en cualquier GPU consumer, aunque no es necesario el uso de GPU para inferencia.
- Opciones de despliegue: carga directa con `torch.load` e `importlib` según el ejemplo de la model card; no hay soporte documentado para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Contexto | Accuracy | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Fox-nbc-headline-classifier (ensemble) | Ensemble TF-IDF + fastText + DistilBERT | no disponible | no disponible (máx. 64 tokens en DistilBERT) | 89,9 % en val20 | MIT | Hugging Face |
| Línea base del curso CIS 4190/5190 | no disponible | no disponible | no disponible | 73,9 % en val20 | no disponible | no disponible |
| Clasificador binario genérico con DistilBERT | Transformer destilado | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks de alternativas externas en la información proporcionada.

## Limitaciones y advertencias

- El conjunto de validación val20 tiene solo 959 enlaces, con un error estándar de aproximadamente un punto porcentual, y los epochs se seleccionaron sobre él, lo que introduce sesgo de selección.
- Fox News cambió su estilo de URL alrededor de 2022 (los slugs antiguos conservan palabras funcionales), por lo que los modelos aprenden en parte el estilo del enlace y rinden mal en enlaces de Fox de 2014–2021.
- La puntuación del leaderboard (96,34 %) está inflada porque muchos titulares de test aparecen en los sitemaps públicos usados en entrenamiento; no debe interpretarse como rendimiento en datos realmente no vistos.
- Modelo monolingüe en inglés: no cubre titulares en otros idiomas.
- Tarea de clasificación binaria muy específica: no generaliza a otras cadenas ni a otros dominios sin reentrenamiento.
- Riesgo de alucinación no aplica (no es generativo), pero sí hay riesgo de clasificaciones erróneas en titulares ambiguos o con vocabulario compartido entre ambas cadenas.
- Licencia MIT: permite uso comercial, pero el modelo se distribuye como artefacto de curso sin garantías de mantenimiento ni soporte.
- No hay versiones cuantizadas ni formatos alternativos de pesos, lo que limita su integración en ecosistemas de despliegue estándar.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Potatodawang/fox-nbc-headline-classifier
- Repositorio de código, scripts de entrenamiento e informe: https://github.com/EvelynGao233/519
- Dataset de entrenamiento: https://huggingface.co/datasets/Potatodawang/fox-nbc-headline-links
