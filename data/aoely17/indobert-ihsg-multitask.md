# Aoely17/indobert-ihsg-multitask

## Resumen

IndoBERT IHSG Multitask es un modelo de clasificación de texto en indonesio especializado en el dominio financiero, concretamente en el análisis de noticias y opiniones relacionadas con el índice bursátil IHSG (Índice Harga Saham Gabungan) de Indonesia. Lo desarrolla el usuario Aoely17 y se distribuye bajo licencia Apache 2.0. El modelo parte del backbone `indobenchmark/indobert-base-p1` y añade dos cabezas de clasificación sobre la representación del token CLS: una para el registro del canal (OFF, NEWS, OPINION) y otra para la polaridad del sentimiento (NEGATIVE, NEUTRAL, POSITIVE).

La propuesta es una tarea de aprendizaje multitarea (multi-task learning) orientada a la investigación empírica en finanzas: el modelo no solo clasifica sentimiento, sino que primero distingue si el texto es una noticia, una opinión o un texto fuera de dominio. Esta distinción permite construir índices de sentimiento más limpios, separando la señal informativa de la opinión. El autor lo emplea para generar índices diarios MEDIA_SENTIMENT y RETAIL_SENTIMENT.

El modelo es de tamaño base (arquitectura BERT, 768 dimensiones ocultas) y está pensado para inferencia ligera en pipelines de investigación cuantitativa. No es un modelo generativo ni un LLM: es un encoder de clasificación con dos salidas, lo que limita su uso a etiquetado de texto, no a generación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | BERT base (IndoBERT-base-p1) con dos cabezas de clasificación lineal |
| Parametros totales | No disponible (backbone IndoBERT-base, ~124 M típico de BERT-base; el autor no lo declara) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (IndoBERT-base usa típicamente 512 tokens; el autor no lo especifica) |
| Tipos de cuantizacion | No disponible (pesos PyTorch; no se documentan variantes GGUF/ONNX) |
| Idiomas soportados | Indonesio (id) |
| Licencia | Apache 2.0 |
| Formato de pesos | PyTorch (safetensors/bin según repo; requiere `trust_remote_code=True`) |

## Arquitectura y entrenamiento

El modelo se construye sobre `indobenchmark/indobert-base-p1`, un encoder transformer tipo BERT preentrenado en indonesio. Sobre la salida del token CLS (768 dimensiones) se montan dos cabezas lineales independientes: `channel_head` (768 → 3: OFF, NEWS, OPINION) y `pol_head` (768 → 3: NEGATIVE, NEUTRAL, POSITIVE). La inferencia devuelve `channel_logits` y `pol_logits` en un diccionario, y requiere cargar el modelo con `trust_remote_code=True` por el código personalizado del repo.

El autor no documenta el volumen de tokens de entrenamiento, la composición exacta del dataset ni si hubo ajuste con RLHF/DPO (no aplica a un clasificador). Sí reporta evaluación sobre un conjunto de test held-out de N=150 ejemplos, con accuracy de canal del 90,00% y de polaridad del 70,67%, y una mejora de +44,67 puntos de accuracy frente a un RoBERTa zero-shot (26,00%). No se detalla la estrategia de congelación de capas ni hiperparámetros de fine-tuning.

## Capacidades

- Clasificación de registro de canal en tres clases: OFF (fuera de dominio), NEWS (noticia) y OPINION (opinión).
- Clasificación de polaridad de sentimiento en tres clases: NEGATIVE, NEUTRAL, POSITIVE.
- Procesamiento de texto financiero en indonesio (titulares y párrafos sobre el IHSG).
- Salida multitarea simultánea: ambas cabezas se computan en una sola pasada.
- No soporta tool calling ni function calling (es un encoder de clasificación, no un modelo generativo).
- No soporta agentes ni razonamiento multi-paso.
- Capacidad multilingüe limitada al indonesio; no se reporta transferencia a otros idiomas.
- No dispone de modo thinking, visión ni audio.

## Casos de uso

- Construcción de índices de sentimiento diario: clasificar titulares y artículos sobre el IHSG para agregar un MEDIA_SENTIMENT por día, usando la cabeza de polaridad y filtrando con la de canal para excluir textos OFF.
- Separación de noticia y opinión en corpus financieros: usar `channel_head` para etiquetar automáticamente un feed de noticias y distinguir información factual de columnas de opinión antes de análisis econométrico.
- Investigación empírica en finanzas: generar variables de sentimiento como regresores en modelos de series temporales del IHSG, tal como declara el autor con RETAIL_SENTIMENT.
- Monitorización de prensa económica: pipeline batch que etiqueta cada mañana los artículos publicados y alerta sobre cambios bruscos de polaridad en el canal NEWS.
- Filtrado de ruido en datasets scrapeados: usar la clase OFF para descartar textos no financieros antes de alimentar otros modelos o anotaciones manuales.
- Anotación asistida para etiquetado humano: preetiquetar grandes volúmenes y reservar la revisión manual a los casos de baja confianza, reduciendo coste de anotación.

## Benchmarks y rendimiento

Evaluación sobre conjunto held-out de N=150 ejemplos, según la model card:

| Tarea | Metrica | Resultado |
|---|---|---|
| Canal (3 clases) | Accuracy | 90,00% |
| Canal — NEWS | F1 | 0,9515 |
| Canal — OPINION | F1 | 0,7742 |
| Polaridad (3 clases) | Accuracy | 70,67% |
| Polaridad — Negative | F1 | 0,7438 |
| Polaridad — Positive | F1 | 0,7500 |
| Baseline zero-shot RoBERTa | Accuracy | 26,00% |

No se publican resultados en benchmarks estándar (MMLU, HumanEval, GSM8K) porque el modelo no es generativo y no aplica.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en FP32 para un BERT-base (~124 M parámetros); en FP16 aproximadamente 250-500 MB.
- GPU recomendadas: cualquier GPU consumer moderna es suficiente; RTX 3060, RTX 4090, T4, A100 o H100 funcionan sin problema, pero el modelo está sobredimensionado para ellas.
- Cabe en GPU consumer y también en CPU para lotes pequeños; el repo ocupa 0,5 GB.
- Opciones de despliegue: PyTorch + Transformers con `trust_remote_code=True`; no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI (no aplica a un clasificador encoder, salvo exportación manual a ONNX).
- Latencia y throughput: no disponibles; para un BERT-base en GPU moderna se espera del orden de milisegundos por muestra, pero el autor no publica cifras.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Aoely17/indobert-ihsg-multitask | No disponible (~124 M) | No disponible | Clasificación multitarea canal + polaridad (indonesio, finanzas) | Apache 2.0 | HuggingFace |
| indobenchmark/indobert-base-p1 | ~124 M | 512 (típico) | Encoder base indonesio (sin cabezas de tarea) | No disponible en la información | HuggingFace |
| RoBERTa (zero-shot, baseline del autor) | No disponible | No disponible | Clasificación genérica | No disponible | HuggingFace |

No se dispone de comparativas publicadas frente a otros clasificadores financieros en indonesio; la única referencia numérica es el baseline zero-shot RoBERTa reportado por el propio autor (26,00% de accuracy).

## Limitaciones y advertencias

- El conjunto de evaluación es pequeño (N=150), por lo que las métricas tienen alta varianza y deben interpretarse con cautela.
- La accuracy de polaridad (70,67%) es moderada; la clase NEUTRAL no se reporta con F1, lo que sugiere posible desequilibrio o bajo rendimiento en esa clase.
- El F1 de OPINION (0,7742) es notablemente inferior al de NEWS (0,9515), lo que indica confusión entre opinión y otros canales.
- Riesgo de alucinación no aplica en sentido generativo, pero sí de falsos positivos/negativos en la clasificación, especialmente en textos ambiguos o irónicos.
- Entrenado y evaluado solo en indonesio y en el dominio del IHSG; el rendimiento fuera de ese dominio o idioma no está garantizado.
- Requiere `trust_remote_code=True`, lo que implica ejecutar código del autor; conviene auditar el repo antes de usarlo en producción.
- Licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantías ni soporte; es un modelo de investigación.
- No se documentan sesgos específicos ni composición del dataset de entrenamiento, lo que dificulta evaluar riesgos de dominio.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Aoely17/indobert-ihsg-multitask
- Árbol de archivos del repo: https://huggingface.co/Aoely17/indobert-ihsg-multitask/tree/main
- IndoBERT (backbone): https://huggingface.co/indobenchmark/indobert-base-p1
- Referencia sobre IndoBERT: https://www.emergentmind.com/topics/indobert
