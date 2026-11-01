# abdElrahmanWaelYounes/egyptian-arabic-sentiment

## Resumen

El modelo `egyptian-arabic-sentiment` es un clasificador de sentimiento especializado en árabe dialectal egipcio, desarrollado por abdElrahmanWaelYounes. Se trata de un ajuste fino (fine-tuning) del modelo base CAMeL-Lab/bert-base-arabic-camelbert-mix sobre el corpus ASTD (Arabic Sentiment Tweets Dataset), con el objetivo de clasificar texto en cuatro categorías: positivo, negativo, mixto y objetivo. Resuelve el problema del análisis de opinión en un dialecto poco cubierto por los modelos genéricos de árabe moderno estándar (MSA).

Arquitectónicamente es un transformer encoder BERT con 109.084.420 parámetros totales, derivado de una variante de CAMeLBERT entrenada con datos mixtos (MSA, dialectal y clásico). El checkpoint se distribuye en formatos safetensors y ONNX, con un tamaño de repositorio de 1,0 GB, y se integra directamente en el pipeline `text-classification` de Transformers.

Su relevancia radica en la escasez de recursos abiertos para sentimiento en dialectos árabes y en la publicación transparente de resultados por semilla, incluida la comparación con una línea base TF-IDF y con CAMeLBERT-DA. No obstante, el rendimiento es moderado (macro-F1 de 0,533 en test) y el dominio de entrenamiento está muy acotado a tuits políticos de 2013.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder tipo BERT (CAMeLBERT-Mix) |
| Parametros totales | 109.084.420 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (arquitectura BERT, típicamente 512 tokens; no confirmado en la model card) |
| Tipos de cuantizacion | no disponible (se distribuye safetensors y ONNX; no se documentan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | árabe (`ar`), con foco en dialecto egipcio |
| Licencia | MIT |
| Formato de pesos | safetensors, ONNX |

## Arquitectura y entrenamiento

El modelo es un BERT base de 12 capas y 768 dimensiones ocultas (109 M de parámetros) inicializado desde `CAMeL-Lab/bert-base-arabic-camelbert-mix`, un checkpoint preentrenado por CAMeL Lab sobre una mezcla de corpus árabes (MSA, dialectal y clásico). Sobre esa base se aplicó un ajuste fino supervisado para clasificación de 4 clases, sin que la model card documente etapas de RLHF, DPO ni decodificación especulativa, algo esperable en un encoder de clasificación.

El conjunto de entrenamiento es el split oficial de ASTD (Arabic Sentiment Tweets Dataset), con 1.999 tuits en el conjunto de test. La model card reporta tres semillas por configuración: CAMeLBERT-DA alcanza un macro-F1 de 0,5374 ± 0,0088 y CAMeLBERT-Mix de 0,5424 ± 0,0078. El checkpoint publicado corresponde a la ejecución con semilla 7 de CAMeLBERT-Mix, seleccionada por validación. Se recomienda replicar el preprocesado de entrenamiento (`egysent.preprocess.clean_tweet`) para obtener resultados comparables.

## Capacidades

- Clasificación de sentimiento en texto árabe egipcio en cuatro etiquetas: positivo, negativo, mixto y objetivo.
- Integración directa con el pipeline `text-classification` de Hugging Face Transformers, incluyendo `top_k=None` para obtener las probabilidades de todas las clases.
- Ejecución en CPU y GPU gracias al tamaño reducido del modelo (109 M de parámetros).
- Inferencia mediante ONNX Runtime para despliegues de baja latencia.
- Procesamiento de texto corto (tuits y mensajes), no de documentos largos.
- No soporta tool calling, function calling, agentes, visión, audio ni modo de razonamiento explícito.
- Capacidad multilingüe limitada al árabe; no se documenta rendimiento en otros idiomas.

## Casos de uso

- Monitorización de opinión en redes sociales egipcias: el modelo clasifica tuits y comentarios en tiempo casi real, aprovechando su tamaño reducido para procesar grandes volúmenes en CPU o en una sola GPU consumer.
- Análisis de sentimiento en encuestas abiertas con respuestas en dialecto egipcio: permite agregar respuestas cualitativas en las cuatro categorías y detectar opiniones mixtas u objetivas, algo que un clasificador binario no captura.
- Moderación de comentarios en plataformas de contenido árabe: la etiqueta "negativo" puede usarse como señal de triaje para revisión humana, con la advertencia de que el F1 de la clase mixta es bajo.
- Investigación en procesamiento de lengua árabe: sirve como línea base reproducible (semilla 7, métricas publicadas) para comparar nuevos ajustes finos sobre CAMeLBERT.
- Enriquecimiento de datasets de opinión: clasificación por lotes de corpus históricos de tuits para construir series temporales de sentimiento.
- Clasificación de reseñas y mensajes de clientes en árabe egipcio, siempre que se valide previamente el dominio, dado que el entrenamiento se hizo sobre tuits políticos de 2013 y el rendimiento fuera de dominio puede degradarse.
- Despliegue en entornos con recursos limitados: con 109 M de parámetros cabe en dispositivos edge o en contenedores pequeños con ONNX Runtime, sin necesidad de GPU dedicada.

## Benchmarks y rendimiento

Resultados publicados en la model card sobre el test de ASTD (1.999 tuits):

| Modelo | Macro-F1 test | Accuracy test |
|---|---|---|
| TF-IDF + regresión logística | 0,445 | 0,618 |
| CAMeLBERT-DA (3 semillas) | 0,5374 ± 0,0088 | 0,6565 ± 0,0065 |
| CAMeLBERT-Mix (3 semillas) | 0,5424 ± 0,0078 | 0,6558 ± 0,0010 |
| Este checkpoint (semilla 7) | 0,533 | no disponible |

F1 por clase de este checkpoint: positivo 0,492; negativo 0,542; mixto 0,321; objetivo 0,779. No se han publicado resultados de MMLU, HumanEval, GSM8K ni otros benchmarks generales en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: aproximadamente 0,45 GB solo para pesos (109 M × 4 bytes), más activaciones; en la práctica menos de 1 GB.
- VRAM estimada en fp16: aproximadamente 0,22 GB para pesos; cabe holgadamente en cualquier GPU consumer.
- GPU recomendadas: no requiere GPU dedicada; funciona en CPU. Para alto throughput, cualquier GPU consumer (RTX 3060, RTX 4090) es más que suficiente.
- Cabe en GPU consumer: sí, en todas las GPU con al menos 2 GB de VRAM, e incluso en CPU.
- Opciones de despliegue: Transformers (`pipeline`), ONNX Runtime (pesos ONNX incluidos), y servidores de inferencia compatibles con modelos BERT (por ejemplo, TorchServe o FastAPI con Transformers). No se documentan artefactos para vLLM, llama.cpp, Ollama ni TGI, que están orientados a modelos generativos.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Macro-F1 ASTD | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| egyptian-arabic-sentiment (este) | 109 M | no disponible | 0,533 | MIT | Hugging Face |
| CAMeLBERT-Mix (base, sin ajuste de sentimiento) | 109 M | no disponible | 0,5424 ± 0,0078 (con ajuste equivalente) | no disponible en esta ficha | Hugging Face (CAMeL-Lab) |
| CAMeLBERT-DA (ajustado a ASTD) | 109 M | no disponible | 0,5374 ± 0,0088 | no disponible en esta ficha | Hugging Face (CAMeL-Lab) |
| TF-IDF + regresión logística | no aplica | no aplica | 0,445 | no disponible | línea base propia |

La comparación se limita a los modelos evaluados en la propia model card; no se dispone de datos de otros clasificadores de sentimiento árabe en la información proporcionada.

## Limitaciones y advertencias

- Dominio de entrenamiento restringido: tuits mayoritariamente políticos de alrededor de 2013; reseñas de productos y mensajes de atención al cliente pueden distribuirse de forma muy distinta y degradar el rendimiento.
- El F1 de la clase "mixto" es bajo (0,321), por lo que las opiniones mixtas y el sarcasmo son los casos más débiles.
- Riesgo de alucinación no aplica en sentido generativo, pero sí de clasificaciones erróneas con alta confianza en textos fuera de dominio.
- El rendimiento global es moderado (macro-F1 0,533, accuracy no reportada para este checkpoint), insuficiente para decisiones automatizadas sin revisión humana.
- Restricción de licencia: el modelo es MIT, pero el corpus ASTD es GPL-2.0; el autor advierte de que debe comprobarse que sus términos encajan con el uso comercial previsto antes de desplegar el modelo.
- Idioma limitado al árabe; no se documenta comportamiento en MSA formal ni en otros dialectos.
- Longitud de contexto no documentada; al ser un BERT, no está pensado para documentos largos.
- Sin datos publicados de sesgos específicos más allá del dominio político del corpus de entrenamiento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/abdElrahmanWaelYounes/egyptian-arabic-sentiment
- Modelo base CAMeLBERT-Mix: https://huggingface.co/CAMeL-Lab/bert-base-arabic-camelbert-mix
- Repositorio de código, notebook de entrenamiento y resultados: https://github.com/Younes695/egyptian-arabic-sentiment
- Dataset ASTD: https://github.com/mahmoudnabil/ASTD
