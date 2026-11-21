# aryanmaurya006/ner-distilbert-conll2003

## Resumen

`ner-distilbert-conll2003` es un modelo de reconocimiento de entidades nombradas (NER) obtenido mediante fine-tuning de `distilbert-base-cased` sobre el corpus CoNLL-2003. Lo publica el usuario aryanmaurya006 en Hugging Face bajo licencia Apache 2.0 y está pensado para etiquetar entidades de tipo persona (PER), organización (ORG), localización (LOC) y miscelánea (MISC) en texto en inglés. Con 65,2 millones de parámetros y un repositorio de 0,3 GB, es un modelo compacto orientado a inferencia rápida y despliegue en entornos con recursos limitados.

La relevancia del modelo es eminentemente práctica: DistilBERT conserva aproximadamente el 97 % del rendimiento de BERT en tareas de comprensión del lenguaje según sus autores originales, pero con un 40 % menos de parámetros y una latencia notablemente inferior, lo que lo convierte en una opción atractiva para pipelines de extracción de entidades a gran escala o en tiempo real. En este caso concreto, el autor declara un F1 de 0,8929 en el conjunto de test de CoNLL-2003, un valor razonable para la categoría aunque por debajo de los mejores modelos basados en BERT-large o en arquitecturas modernas.

El modelo forma parte del proyecto NER System, que añade detección de fechas mediante spaCy y una interfaz Streamlit. No se trata de un modelo generativo ni conversacional: es un clasificador de tokens puro, sin capacidades de tool calling, razonamiento multi-paso ni generación de texto. Su valor está en la extracción estructurada de entidades a partir de texto libre en inglés.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer encoder (DistilBERT, destilación de BERT-base) |
| Parámetros totales | 65.197.833 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | 512 tokens (límite estándar de DistilBERT; no especificado en la model card) |
| Tipos de cuantización | no disponible (pesos en safetensors; cuantización dinámica posible vía PyTorch/ONNX, no documentada por el autor) |
| Idiomas soportados | inglés (`en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en DistilBERT, una versión destilada de BERT-base que reduce el número de capas de 12 a 6 y elimina el entrenamiento de tipo masked language modeling con pooling de tokens, manteniendo la arquitectura transformer encoder. Sobre esta base se añade una cabeza de clasificación de tokens (`token-classification`) con cuatro etiquetas en formato BIO (PER, ORG, LOC, MISC), alineadas al primer subtoken de cada palabra; el resto de subtokens se ignoran en el cálculo de la pérdida.

El entrenamiento se realizó sobre el split de entrenamiento de CoNLL-2003 (14.041 frases) durante 3 épocas, con learning rate 2e-5, batch size 16, weight decay 0,01 y semilla 42. El autor indica que el entrenamiento se ejecutó en CPU en aproximadamente 55 minutos, lo que subraya la ligereza del modelo. No se documenta el uso de RLHF, DPO ni técnicas de alineación adicionales, algo esperable en un modelo discriminativo de este tipo. Tampoco se especifica el número total de tokens de entrenamiento ni la composición exacta del dataset más allá de la referencia a `tomaarsen/conll2003`.

## Capacidades

- Reconocimiento de entidades nombradas en inglés con cuatro categorías: PER (persona), ORG (organización), LOC (localización) y MISC (miscelánea).
- Clasificación a nivel de token con etiquetado BIO, apta para extracción de entidades en texto libre.
- Integración directa con el pipeline `token-classification` de Hugging Face Transformers, incluyendo `aggregation_strategy="simple"` para agrupar subtokens.
- No soporta tool calling ni function calling.
- No soporta razonamiento multi-paso ni comportamiento agente.
- No dispone de modo thinking, visión, audio ni generación de texto.
- Capacidad multilingüe limitada al inglés; no se declaran otros idiomas.
- Inferencia en CPU viable gracias a su tamaño reducido.

## Casos de uso

- Extracción de entidades en pipelines de procesamiento de noticias: el modelo etiqueta personas, organizaciones y localizaciones en artículos en inglés, permitiendo alimentar índices de búsqueda o bases de datos de entidades con un coste computacional muy bajo.
- Enriquecimiento de bases de datos CRM: dado un conjunto de correos o notas de clientes en inglés, el modelo identifica nombres de personas y empresas para poblar campos estructurados de forma automática.
- Preprocesamiento para sistemas de búsqueda y recuperación: las entidades extraídas pueden usarse como metadatos para filtrado y ranking en motores de búsqueda documental.
- Anonimización o seudonimización de textos: la detección de PER permite localizar nombres propios antes de aplicar un proceso de enmascarado en flujos de cumplimiento de privacidad.
- Análisis de documentos financieros o legales en inglés: identificación de organizaciones y localizaciones en informes para construir grafos de relaciones o resúmenes estructurados.
- Prototipado rápido y demos: al caber en CPU y requerir solo 0,3 GB de disco, es adecuado para pruebas de concepto, notebooks y aplicaciones Streamlit como la del proyecto NER System que lo utiliza.
- Moderación y clasificación de contenido: detección de entidades mencionadas en comentarios o publicaciones para señalización o revisión humana.

## Benchmarks y rendimiento

Resultados declarados por el autor en el conjunto de test de CoNLL-2003 (3.453 frases, 5.648 entidades), no verificados de forma independiente:

| Entidad | Precisión | Recall | F1 | Soporte |
|---|---|---|---|---|
| PER | 0,9610 | 0,9450 | 0,9529 | 1.617 |
| ORG | 0,8487 | 0,8814 | 0,8647 | 1.661 |
| LOC | 0,9180 | 0,9197 | 0,9188 | 1.668 |
| MISC | 0,7394 | 0,7963 | 0,7668 | 702 |
| **Global** | **0,8856** | **0,9003** | **0,8929** | **5.648** |

La accuracy global declarada es de 0,9786. No se han publicado en la información disponible resultados comparativos con otros modelos en la model card.

## Requisitos de hardware

- VRAM estimada para inferencia en FP32: aproximadamente 0,26 GB solo para pesos (65,2 M de parámetros × 4 bytes), más overhead de activaciones y del runtime; en la práctica cabe holgadamente en cualquier GPU con 2 GB o más.
- En FP16: aproximadamente 0,13 GB de pesos, con un consumo total típico por debajo de 1 GB.
- GPU recomendadas: cualquier GPU moderna es suficiente; RTX 3060, RTX 4090, A100 o H100 funcionan sin problema, aunque el modelo está claramente infrautilizado en GPUs de gama alta.
- Cabe en GPU de consumo: sí, en cualquier GPU consumer con al menos 2 GB de VRAM, e incluso en iGPU y CPU.
- Opciones de despliegue: `transformers` (pipeline nativo), ONNX Runtime, TorchScript, y servidores de inferencia como Hugging Face Inference Endpoints (el tag `endpoints_compatible` está presente). No se documenta soporte específico para vLLM, llama.cpp u Ollama, que están orientados a modelos generativos.
- Latencia y throughput: no disponibles de forma oficial; el autor indica que el fine-tuning completo en CPU tardó unos 55 minutos, lo que sugiere una inferencia muy rápida en CPU para lotes pequeños.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | F1 CoNLL-2003 (declarado) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| aryanmaurya006/ner-distilbert-conll2003 | 65,2 M | 512 | 0,8929 | Apache 2.0 | Hugging Face |
| `dslim/bert-base-NER` | ~110 M | 512 | no disponible en esta información | MIT (según su model card pública) | Hugging Face |
| `Jean-Baptiste/roberta-large-ner-english` | ~355 M | 512 | no disponible en esta información | MIT (según su model card pública) | Hugging Face |
| `distilbert-base-cased` sin fine-tuning | 65,2 M | 512 | no aplica (no entrenado para NER) | Apache 2.0 | Hugging Face |

No se dispone de resultados de benchmarks verificados de los modelos comparables en la información proporcionada, por lo que la comparación numérica de rendimiento no está disponible.

## Limitaciones y advertencias

- Entrenado sobre texto periodístico en inglés de la década de 1990 (CoNLL-2003), por lo que la precisión cae en redes sociales, chats, texto en minúsculas o dominios muy distintos.
- El modelo es *cased*, por lo que la capitalización es determinante: "Aryan" se detecta con más facilidad que "aryan".
- Solo detecta cuatro tipos de entidad (PER, ORG, LOC, MISC); no reconoce fechas, cantidades monetarias, porcentajes ni otras categorías fuera del esquema CoNLL.
- La categoría MISC es la más débil (F1 0,7668), con precisión de 0,7394, lo que implica una tasa apreciable de falsos positivos en esa clase.
- Los resultados declarados no están verificados de forma independiente (`verified: false` en el model-index).
- Riesgo de alucinación no aplica en sentido generativo, pero sí existe riesgo de etiquetado incorrecto en texto ambiguo o fuera de dominio.
- Licencia Apache 2.0: permite uso comercial y modificación, pero conviene revisar las condiciones de los datos de CoNLL-2003 si se redistribuye el modelo entrenado.
- No es un modelo generativo: no debe emplearse para tareas de resumen, traducción, diálogo ni razonamiento.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que sugiere escasa validación por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/aryanmaurya006/ner-distilbert-conll2003
- Modelo base: https://huggingface.co/distilbert/distilbert-base-cased
- Dataset utilizado: https://huggingface.co/datasets/tomaarsen/conll2003
- Proyecto NER System que lo utiliza: https://github.com/lakshyadangwal/ner-system
- Documentación de DistilBERT (paper original): https://arxiv.org/abs/1910.01108
- Documentación de CoNLL-2003: https://www.clips.uantwerpen.be/conll2003/ner/
