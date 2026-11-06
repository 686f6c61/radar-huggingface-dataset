# gladia/qat-transfer-text

## Resumen

`gladia/qat-transfer-text` es un repositorio de checkpoints de investigación publicado por Gladia (equipo de investigación, no el producto comercial de transcripción de audio) asociado al artículo *Zero-Shot Quantization via Weight-Space Arithmetic* (NeurIPS 2026). No es un modelo generativo ni un clasificador único, sino una colección de pares de checkpoints (FP y QAT) para cuatro backbones de clasificación de texto: BERT-base, BERT-large, EmbeddingGemma-300M y Qwen3-Embedding-0.6B, entrenados sobre once datasets de clasificación.

El propósito es demostrar una técnica de transferencia de cuantización: la diferencia entre un finetune QAT de 3 bits y su equivalente en precisión completa define un "vector de cuantización" (`QV = QAT - FP`). Sumar ese vector de una tarea donante a un checkpoint FP de otra tarea receptora (`FP_receiver + lambda * QV_donor`) recupera buena parte del beneficio del QAT bajo PTQ de 3 bits, sin necesidad de ejecutar QAT en el receptor. Con `lambda = 1`, el receptor ni siquiera necesita datos propios.

Es relevante para investigadores en cuantización y eficiencia de modelos: ofrece un método reproducible, con checkpoints en formato PyTorch plano, para abaratar el despliegue de clasificadores en 3 bits. El repositorio ocupa 118,2 GB y no tiene descargas ni likes en el momento de redactar esta ficha.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer encoder (BERT-base/large, EmbeddingGemma-300M, Qwen3-Embedding-0.6B) con cabeza de clasificación |
| Parámetros totales | Depende del backbone: BERT-base (~110M), BERT-large (~340M), EmbeddingGemma-300M (~300M), Qwen3-Embedding-0.6B (~600M); no se detalla en la model card |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | QAT y PTQ de 3 bits, per-channel, con la cabeza de clasificación sin cuantizar (`classifier` en BERT, `score` en Gemma y Qwen) |
| Idiomas soportados | No disponible |
| Licencia | Mixta: Apache-2.0 (BERT, Qwen3-Embedding-0.6B) y Gemma Terms of Use con su Prohibited Use Policy (EmbeddingGemma-300M) |
| Formato de pesos | State dicts de PyTorch (`.pt`): `backbone_epoch_{N}.pt` y `head_epoch_{N}.pt` |

## Arquitectura y entrenamiento

El repositorio contiene finetunes de clasificación sobre cuatro backbones transformer encoder. Para cada combinación de backbone y dataset hay dos checkpoints con el mismo conjunto de claves: uno en precisión completa (FP) y otro con finetune QAT de 3 bits con Straight-Through Estimator (STE), guardado sin los wrappers de QAT para que el state dict sea directamente cargable. La cabeza de clasificación queda excluida de la cuantización.

La configuración de entrenamiento es compartida: AdamW, `lr=1e-5`, `wd=0.1`, sin label smoothing, gradient clipping a 1.0, semilla 2038 y schedule 1x (`mult=1`). Los modelos grandes se entrenaron con batch por dispositivo menor y acumulación de gradientes; el directorio `optim=` indica el batch por dispositivo. Los datasets cubren emoción, reseñas (IMDB, AmazonReviews), intenciones y dominios (Banking77, MASSIVE, MTOP), contra factuales, toxicidad y sentimiento en tuits.

La innovación técnica es la aritmética en el espacio de pesos: el vector `QV` extraído de un par FP/QAT de una tarea donante se transfiere a un receptor distinto, lo que permite aproximar el comportamiento QAT bajo PTQ de 3 bits sin datos del receptor (con `lambda = 1`) y sin ejecutar QAT. El método no requiere nada más allá de `torch` para construir el vector a mano.

## Capacidades

- Clasificación de texto (text-classification) sobre once datasets concretos: Emotion, IMDB, Banking77, AmazonReviewsClassification, AmazonCounterfactual, MassiveIntent, MassiveScenario, MTOPDomain, MTOPIntent, ToxicConversations y TweetSentimentExtraction.
- Extracción de representaciones de frase mediante los backbones de embedding (EmbeddingGemma-300M y Qwen3-Embedding-0.6B).
- Transferencia de cuantización entre tareas mediante aritmética de pesos, con evaluación bajo PTQ de 3 bits per-channel.
- Reproducción del método sin dependencias adicionales: los checkpoints son state dicts planos cargables con `torch.load`.
- No soporta tool calling, agentes, razonamiento multi-step, visión ni audio; es un repositorio de investigación en clasificación, no un modelo conversacional.
- Capacidades multilingües: no disponibles en la información proporcionada.

## Casos de uso

- Investigación en cuantización: reproducir el experimento de transferencia de vectores `QV` entre pares de tareas y medir la recuperación del beneficio QAT bajo PTQ de 3 bits, usando los scripts del repositorio de código con `CHECKPOINT_BASE_PATH` y `HEAD_BASE_PATH` apuntando a los checkpoints descargados.
- Despliegue de clasificadores de bajo coste: aplicar PTQ de 3 bits a un clasificador BERT-base finetuneado para una tarea nueva y usar un `QV` donante como sustituto del QAT, reduciendo el coste de entrenamiento y el espacio de almacenamiento en producción.
- Moderación de contenido: reutilizar los finetunes de ToxicConversations como donantes de `QV` para receptores de clasificación de toxicidad en dominios propios, sin datos etiquetados del receptor cuando `lambda = 1`.
- Análisis de sentimiento y reseñas: partir de los checkpoints de IMDB, AmazonReviews y TweetSentimentExtraction para construir clasificadores de sentimiento cuantizados en 3 bits en pipelines de procesamiento por lotes.
- Enrutado de intenciones en asistentes: usar los finetunes de Banking77, MASSIVE y MTOP como base para clasificación de intención y dominio en sistemas de diálogo, con la ventaja de que la cabeza permanece en precisión completa.
- Búsqueda semántica y clustering: emplear los backbones EmbeddingGemma-300M y Qwen3-Embedding-0.6B para generar embeddings de frase, con la opción de cuantizar las capas lineales a 3 bits para reducir memoria en servicios de recuperación.
- Estudio de sensibilidad a la cuantización por backbone: comparar la transferencia de `QV` entre BERT-base, BERT-large, Gemma y Qwen sobre el mismo conjunto de datasets para analizar qué arquitecturas toleran mejor el PTQ de 3 bits.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card describe el método y la configuración de entrenamiento, pero no incluye tablas de accuracy, F1 ni métricas de recuperación del beneficio QAT.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada. Como referencia orientativa por tamaño de backbone (no confirmada por el autor): BERT-base en FP32 ronda los 0,5 GB de pesos; en 3 bits, aproximadamente 0,05 GB de pesos más overhead de activaciones y cabeza. BERT-large y Qwen3-Embedding-0.6B multiplican esas cifras por 3 y 6 respectivamente.
- GPU recomendadas: no disponible. Por tamaño, los cuatro backbones caben en cualquier GPU consumer con suficiente VRAM para el batch elegido.
- Cabe en GPU consumer: sí, previsiblemente en RTX 3060, 4060, 4090 y similares, dado que el backbone más grande es de ~600M de parámetros; no confirmado por el autor.
- Opciones de despliegue: los checkpoints son state dicts de PyTorch; se cargan con `torch.load` y se integran en `transformers` (pipeline `text-classification`). El repositorio de código usa `CHECKPOINT_BASE_PATH` y `HEAD_BASE_PATH`. No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| gladia/qat-transfer-text (BERT-base) | ~110M | No disponible | Clasificación + transferencia de cuantización | Apache-2.0 | Hugging Face |
| gladia/qat-transfer-text (BERT-large) | ~340M | No disponible | Clasificación + transferencia de cuantización | Apache-2.0 | Hugging Face |
| gladia/qat-transfer-text (EmbeddingGemma-300M) | ~300M | No disponible | Clasificación + transferencia de cuantización | Gemma Terms of Use | Hugging Face |
| gladia/qat-transfer-text (Qwen3-Embedding-0.6B) | ~600M | No disponible | Clasificación + transferencia de cuantización | Apache-2.0 | Hugging Face |

No se dispone de datos de rendimiento para comparar con alternativas de la misma categoría (por ejemplo, clasificadores BERT estándar o modelos de embedding cuantizados de otros autores). La comparativa se limita a los cuatro backbones incluidos en el propio repositorio.

## Limitaciones y advertencias

- No es un modelo único ni un clasificador general: es una colección de checkpoints de investigación ligados a datasets y tareas concretos; no debe presentarse como un modelo listo para producción sin validación en el dominio objetivo.
- Licencia mixta: los finetunes de EmbeddingGemma-300M son derivados de Gemma y están sujetos a los Gemma Terms of Use y su Prohibited Use Policy, lo que restringe ciertos usos comerciales. BERT y Qwen3-Embedding-0.6B son Apache-2.0. Los datasets de finetuning tienen sus propias condiciones.
- Los checkpoints QAT se guardan sin los wrappers de QAT; para reproducir el comportamiento de 3 bits hay que aplicar PTQ de 3 bits per-channel a todas las capas lineales excepto la cabeza, tal como indica la model card.
- El método de transferencia de `QV` aproxima, no iguala, el beneficio del QAT en el receptor; la magnitud de la recuperación depende del par donante-receptor y no se documenta con métricas en la información disponible.
- Riesgo de sesgo y alucinación: no evaluado en la información proporcionada; los datasets de toxicidad, sentimiento e intención pueden introducir sesgos de dominio y de anotación.
- Idiomas soportados: no disponibles; los datasets citados son mayoritariamente en inglés, salvo MASSIVE y MTOP, que incluyen multilingüismo.
- Tamaño del repositorio de 118,2 GB: la descarga completa requiere espacio en disco considerable; la model card recomienda descargar solo un backbone con `--include`.
- Sin descargas ni likes en Hugging Face en el momento de redactar la ficha, lo que limita la validación comunitaria del artefacto.

## Enlaces

- Hugging Face: https://huggingface.co/gladia/qat-transfer-text
- Repositorio de código: https://github.com/gladia-research-group/qat-transfer
- arXiv: https://arxiv.org/abs/2604.03420 (DOI: 10.57967/hf/10767)
- OpenReview: https://openreview.net/forum?id=wrUEnnSgXa
- Grafo de investigación: https://flywheel.paradigma.inc/node/de486ca0-8e83-4041-bbf6-0b0be565435b
- Repositorio hermano (timm): https://huggingface.co/gladia/qat-transfer-timm
- Repositorio hermano (open_clip): https://huggingface.co/gladia/qat-transfer-open_clip
- Repositorio hermano (VAE): https://huggingface.co/gladia/qat-transfer-vae
- Términos de Gemma: https://ai.google.dev/gemma/terms
- Política de uso prohibido de Gemma: https://ai.google.dev/gemma/prohibited_use_policy
- Web de Gladia: https://www.gladia.io/
- Documentación de Gladia: https://docs.gladia.io/chapters/introduction
