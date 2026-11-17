# Samira-Hassan/modernbert-goemotions-6class

## Resumen

ModernBERT GoEmotions (6 clases) es un modelo de clasificación de texto en inglés desarrollado por Samira-Hassan mediante fine-tuning de `answerdotai/ModernBERT-base` sobre el conjunto de datos GoEmotions de Google Research. El modelo resuelve una tarea concreta: asignar a un comentario de texto una de seis emociones básicas (anger, disgust, fear, joy, sadness, surprise). Su relevancia radica en que aplica la arquitectura ModernBERT, un encoder bidireccional presentado a finales de 2024, a un problema clásico de análisis de sentimiento granular, y publica una comparativa transparente frente a alternativas recurrentes (BiLSTM, GRU, LSTM, TF-IDF + regresión logística).

El modelo es un encoder transformer de aproximadamente 149,6 millones de parámetros, con licencia Apache 2.0 y pesos en safetensors. Está pensado exclusivamente para inglés y para clasificación de una única etiqueta entre seis posibles. No es un modelo generativo: no produce texto, no soporta tool calling ni razonamiento multi-paso, y su utilidad se limita a inferencia de clasificación con ventana de 128 tokens.

La ficha es relevante para desarrolladores que necesiten un clasificador de emociones ligero, desplegable en GPU de consumo y con métricas publicadas de forma honesta, incluyendo una advertencia explícita de que la precisión ronda el 59 % y de que las predicciones no deben usarse como base única de decisiones que afecten a personas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ModernBERT (encoder transformer bidireccional) |
| Parametros totales | 149.609.478 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 128 tokens (longitud maxima de secuencia usada en entrenamiento) |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; no se documentan cuantizaciones GGUF/ONNX) |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |
| Modelo base | answerdotai/ModernBERT-base |
| Tarea (pipeline) | text-classification |
| Etiquetas | 6: anger, disgust, fear, joy, sadness, surprise |
| Tamano del repositorio | 0,6 GB |
| Libreria | transformers (>= 4.48) |
| Dataset de entrenamiento | google-research-datasets/go_emotions (split raw) |

## Arquitectura y entrenamiento

El modelo parte de `answerdotai/ModernBERT-base`, un encoder transformer bidireccional moderno descrito en el paper arXiv:2412.13663, que incorpora mejoras de eficiencia y contexto largo respecto a BERT clásico. Sobre esa base se realiza un fine-tuning de clasificación con cabeza de 6 clases. No se documenta en la model card ningún cambio estructural adicional más allá de la cabeza de clasificación; la innovación respecto al modelo base es el ajuste supervisado al dominio de emociones en comentarios de Reddit.

El entrenamiento se realizó sobre GoEmotions filtrado a muestras de etiqueta única entre las seis emociones principales, eliminando filas multi-etiqueta, neutrales/otras y duplicados, resultando en 24.321 muestras totales: 15.564 de entrenamiento, 3.892 de validación y 4.865 de test. Se usaron 3 épocas, learning rate 2e-5 con AdamW, warmup lineal y gradient clipping con `max_norm=1.0`, batch size 64, longitud máxima de secuencia 128 y pérdida de entropía cruzada ponderada con `compute_class_weight="balanced"` para compensar el desbalance de clases. El hardware de entrenamiento fueron GPUs T4/P100 en Kaggle. No se documenta uso de RLHF, DPO ni decodificación especulativa (no aplica a un clasificador).

## Capacidades

- Clasificación de texto en inglés en 6 emociones: anger, disgust, fear, joy, sadness, surprise.
- Salida de probabilidades por clase mediante `pipeline("text-classification", top_k=None)`.
- Inferencia rápida y ligera gracias al tamaño de 149,6 M de parámetros y ventana de 128 tokens.
- Integración con `transformers >= 4.48` y compatibilidad con Text Embeddings Inference y endpoints (según tags del repositorio).
- Preprocesado de texto documentado (limpieza HTML, normalización de contracciones, sustitución de URLs/emails/usuarios, demojización) para replicar las condiciones de entrenamiento.
- No soporta generación de texto, tool calling, agentes, razonamiento multi-paso, visión ni audio.
- No es multilingüe: solo inglés.

## Casos de uso

- Moderación de comunidades y foros: clasificar comentarios de Reddit u otras plataformas en emociones para priorizar revisiones humanas de contenido con carga emocional negativa (anger, disgust, fear). Adecuado por su entrenamiento específico en comentarios de Reddit y su bajo coste de inferencia.
- Análisis de sentimiento granular en redes sociales: procesar lotes de comentarios y agregar distribuciones de emociones por tema o periodo, usando la salida probabilística de las 6 clases. La ventana de 128 tokens es suficiente para comentarios cortos típicos.
- Enrutamiento de tickets de soporte: asignar emociones a mensajes de clientes para derivar casos de frustración o enfado a agentes especializados, como señal auxiliar y no como decisión única.
- Investigación en psicología computacional y NLP: replicar o comparar resultados frente a arquitecturas recurrentes (BiLSTM, GRU) gracias a la comparativa publicada en la model card.
- Prototipado rápido de APIs de análisis emocional: el autor publica una API y una interfaz web listas para ejecutar en el repositorio de GitHub Emotion-Analyzer, útiles para demos y validación de producto.
- Filtrado previo en pipelines de datos: etiquetar grandes volúmenes de texto antes de un análisis más costoso con modelos generativos, reduciendo el coste computacional al usar un encoder de 149,6 M de parámetros.
- Monitorización de reputación de marca: detectar picos de emociones negativas en menciones públicas en inglés y activar alertas, siempre con revisión humana.

## Benchmarks y rendimiento

Resultados publicados en la model card sobre el conjunto de test (4.865 muestras):

| Metrica | Valor |
|---|---|
| Accuracy | 0,5891 |
| Macro Precision | 0,5758 |
| Macro Recall | 0,5636 |
| Macro F1 | 0,5680 |
| Weighted F1 | 0,5924 |

Comparativa con otras arquitecturas probadas en el mismo proyecto (ordenadas por Macro F1):

| Modelo | Accuracy | Macro F1 | Weighted F1 |
|---|---|---|---|
| ModernBERT-base (este modelo) | 0,5891 | 0,5680 | 0,5924 |
| BiLSTM + Label-Wise Attention | 0,5741 | 0,5527 | 0,5738 |
| TF-IDF + Logistic Regression | 0,5501 | 0,5292 | 0,5514 |
| LSTM | 0,5468 | 0,5210 | 0,5449 |
| BiLSTM | 0,5482 | 0,5204 | 0,5484 |
| GRU | 0,5281 | 0,5082 | 0,5307 |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible; no aplican a un clasificador de emociones.

## Requisitos de hardware

- VRAM estimada para inferencia en FP32: en torno a 0,6 GB de pesos más overhead de activaciones y framework; en la práctica cabe en cualquier GPU con 2 GB o más.
- En FP16/BF16: aproximadamente 0,3 GB de pesos, holgado en GPUs de consumo.
- GPU recomendadas: cualquier GPU moderna; funciona en T4, P100, RTX 3060, RTX 4090, A100, H100. Para lotes grandes, A100/H100 mejoran el throughput.
- Cabe en GPU de consumo sin problemas (RTX 3060 12 GB, RTX 4060, RTX 4090) e incluso en CPU para volúmenes moderados.
- Opciones de despliegue: `transformers` (pipeline de text-classification), Text Embeddings Inference (tag `text-embeddings-inference`), endpoints compatibles (tag `endpoints_compatible`). No se documentan pesos GGUF ni soporte explícito de llama.cpp u Ollama.
- Latencia y throughput: no disponibles en la información proporcionada. Por el tamaño (149,6 M de parámetros) y la secuencia corta (128 tokens), se espera baja latencia en GPU, pero no se aportan cifras medidas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ModernBERT GoEmotions 6class (este) | 149,6 M | 128 tokens | Clasificacion de 6 emociones en ingles | Apache 2.0 | Hugging Face |
| answerdotai/ModernBERT-base | no disponible en la informacion | no disponible en la informacion | Encoder base (fine-tuning) | no disponible en la informacion | Hugging Face |
| BiLSTM + Label-Wise Attention (proyecto del autor) | no disponible | no disponible | Clasificacion de 6 emociones | no disponible | Solo resultados en model card |
| TF-IDF + Logistic Regression (proyecto del autor) | no disponible | no disponible | Clasificacion de 6 emociones | no disponible | Solo resultados en model card |

No se dispone de información sobre otros clasificadores de emociones comparables publicados en la búsqueda web; los únicos puntos de comparación documentados son las arquitecturas alternativas del mismo proyecto, cuyos resultados se recogen en la sección de benchmarks.

## Limitaciones y advertencias

- Precisión global de aproximadamente el 59 % en la tarea de 6 clases; las predicciones deben tratarse como señal auxiliar, no como verdad absoluta.
- Solo inglés; no se ha entrenado ni evaluado en otros idiomas.
- Fuerza una de las seis emociones incluso en textos neutrales o con emociones mixtas, lo que puede generar etiquetas engañosas.
- Entrenado sobre comentarios de Reddit; el rendimiento puede degradarse en otros dominios (noticias, literatura, atención al cliente formal).
- Dificultad documentada con sarcasmo, ironía y jerga.
- Ventana de contexto de 128 tokens: textos más largos se truncan o requieren segmentación previa.
- Requiere aplicar el mismo preprocesado de limpieza usado en entrenamiento para obtener resultados representativos.
- Uso previsto: investigación, prototipado y analítica; no debe ser la única base para decisiones que afecten a personas.
- Licencia Apache 2.0: permite uso comercial, pero se recomienda revisar las condiciones de los datos GoEmotions y citar los trabajos originales (Demszky et al., 2020; Warner et al., 2024).

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Samira-Hassan/modernbert-goemotions-6class
- Modelo base: https://huggingface.co/answerdotai/ModernBERT-base
- Dataset GoEmotions: https://huggingface.co/datasets/google-research-datasets/go_emotions
- Repositorio API y web: https://github.com/Samira-Hassann/Emotion-Analyzer
- Notebook de entrenamiento en Kaggle: https://www.kaggle.com/code/samoura/multi-class-emotion-classification-on-goemotion
- Paper ModernBERT (arXiv:2412.13663): https://arxiv.org/abs/2412.13663
- Paper GoEmotions (Demszky et al., 2020): https://aclanthology.org/2020.acl-main.372/
