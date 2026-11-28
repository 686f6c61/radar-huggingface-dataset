# priya30-dev/mindbridge-risk-muril

## Resumen

MindBridge risk classifier es un modelo de clasificación de texto derivado de google/muril-base-cased, ajustado por el usuario priya30-dev para la detección de riesgo en salud mental. Clasifica publicaciones cortas en tres categorías: sin señal de riesgo, riesgo leve y riesgo alto, y forma parte del proyecto MindBridge de cribado de salud mental. El modelo está pensado como herramienta de apoyo al cribado, no como sistema de diagnóstico clínico.

Con 237.558.531 parámetros y una arquitectura BERT (encoder transformer), el modelo hereda la base multilingüe de MuRIL, que cubre inglés e hindi, y añade soporte para hinglish romanizado. Su relevancia radica en la combinación de clasificación de riesgo con un detector de lenguaje de crisis basado en reglas, lo que permite un enfoque de doble comprobación en aplicaciones de salud mental.

El modelo se publicó en noviembre de 2026 con cero descargas y cero likes, y no dispone de licencia declarada, lo que limita su uso comercial sin aclaración previa por parte del autor.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | BERT (encoder transformer), base google/muril-base-cased |
| Parámetros totales | 237.558.531 |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible |
| Idiomas soportados | inglés, hindi (devanagari), hinglish (romanizado) |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un fine-tuning de google/muril-base-cased, un encoder transformer de tipo BERT diseñado para lenguas indias. La cabeza de clasificación produce tres clases (No Signal, Mild Risk, High Risk). El preprocesado de texto consiste en convertir a minúsculas y limpiar el texto de la misma forma que en entrenamiento (función `src/risk_model.clean`).

Los datos de entrenamiento provienen del dataset gokulan006/risk-analysis-dataset, construido a partir de los datasets de Kaggle "Sentiment Analysis for Mental Health" y "Suicidal Tweet Detection". Los ejemplos en hindi e hinglish fueron traducidos automáticamente con Helsinki-NLP/opus-mt-en-hi y romanizados, por lo que sus métricas miden texto traducido y no publicaciones nativas. No se especifica el número de tokens de entrenamiento ni si se aplicaron técnicas de RLHF o DPO; al tratarse de un modelo de clasificación, no se emplean técnicas de generación como decodificación especulativa.

## Capacidades

- Clasificación de texto en tres clases de riesgo: No Signal, Mild Risk y High Risk.
- Cálculo de una puntuación de riesgo de 0 a 100 mediante la fórmula 100 × (0.5 × P(Mild) + 1.0 × P(High)).
- Soporte multilingüe para inglés, hindi (devanagari) y hinglish romanizado.
- Integración con un detector de lenguaje de crisis basado en reglas dentro del proyecto MindBridge.
- No soporta tool calling ni function calling.
- No está diseñado para agentes ni razonamiento multi-paso.
- No dispone de modo thinking, visión ni audio.

## Casos de uso

- Cribado de publicaciones en redes sociales: el modelo clasifica posts cortos en inglés o hindi y genera una puntuación de riesgo que puede priorizar la revisión humana en plataformas comunitarias.
- Triaje en aplicaciones de salud mental: integrado en una app de bienestar, permite derivar a los usuarios con riesgo alto a recursos de ayuda (por ejemplo, Tele-MANAS 14416 en India) mientras filtra los casos sin señal.
- Moderación de comunidades online: combinado con el detector de crisis basado en reglas, ayuda a identificar mensajes que requieren intervención inmediata en foros o chats.
- Investigación en salud mental digital: permite analizar corpus de texto en inglés e hindi para estudiar patrones de riesgo, siempre con supervisión ética y clínica.
- Soporte a líneas de ayuda: como primera capa de clasificación en sistemas de mensajería, para enrutar conversaciones a operadores humanos según el nivel de riesgo detectado.
- Análisis de encuestas o formularios abiertos: clasifica respuestas de texto libre en estudios de salud mental, facilitando la agregación de indicadores de riesgo.
- Detección de riesgo en comunidades de habla hindi: el soporte para devanagari y hinglish permite ampliar el cribado a poblaciones que no escriben en inglés, aunque con las limitaciones de los datos traducidos.

## Benchmarks y rendimiento

Resultados de test publicados en la model card (conjunto de 6346 publicaciones):

| Subconjunto | Weighted F1 | Accuracy | High Risk recall | High Risk flagged as at least Mild |
|---|---|---|---|---|
| Todos | 0.7981 | 0.7989 | 0.6617 | 96.9% |
| Inglés (4350) | 0.8249 | 0.8251 | 0.7076 | 98.3% |
| Hindi traducido (998) | 0.7336 | 0.7365 | 0.5526 | 93.6% |
| Hinglish traducido y romanizado (998) | 0.7447 | 0.7475 | 0.5714 | 94.4% |

Por clase en el conjunto completo: No Signal F1 0.9238, Mild Risk F1 0.7812, High Risk F1 0.6790. No se han publicado comparaciones con otros modelos en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1 GB en fp32 (237,5 M de parámetros), menos de 500 MB en fp16 y del orden de 250 MB en cuantización de 8 bits.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM; tarjetas como RTX 3060, RTX 4090, A100 o H100 son suficientes, aunque el modelo es pequeño y puede ejecutarse en CPU.
- Cabe en GPU de consumo: sí, en cualquier GPU consumer moderna e incluso en CPU para inferencia por lotes pequeños.
- Opciones de despliegue: transformers (PyTorch), vLLM, TGI, ONNX Runtime y llama.cpp no aplica al no ser un modelo GGUF.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| priya30-dev/mindbridge-risk-muril | 237,5 M | no disponible | Clasificación de riesgo en salud mental (3 clases) | no disponible | Hugging Face |
| google/muril-base-cased | 237,5 M | 512 tokens (arquitectura BERT) | Modelo base multilingüe (en, hi) | Apache 2.0 (modelo base) | Hugging Face |
| Modelos de clasificación de salud mental basados en BERT | variable | variable | Clasificación binaria o multiclase | variable | Hugging Face |

No se dispone de datos de rendimiento de alternativas comparables en la información proporcionada.

## Limitaciones y advertencias

- No es un diagnóstico clínico: el propio autor lo describe como ayuda al cribado y recomienda combinarlo con un detector de crisis basado en reglas.
- Los datos de entrenamiento son de estilo redes sociales en inglés; puede fallar ante sarcasmo, lenguaje indirecto o contexto cultural.
- Los ejemplos en hindi e hinglish son traducciones automáticas, por lo que su rendimiento en publicaciones nativas puede ser inferior al reportado.
- El recall de la clase High Risk es moderado (0,66 en el conjunto completo, 0,55 en hindi traducido), lo que implica falsos negativos en una tarea sensible.
- Riesgo de sesgos derivado de los datasets de origen (Kaggle), cuyas licencias deben verificarse.
- Licencia no disponible: no se puede garantizar el uso comercial sin aclaración del autor.
- El modelo tiene cero descargas y cero likes, por lo que no hay evidencia de uso en producción ni validación externa.
- No se especifica la longitud máxima de contexto soportada.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/priya30-dev/mindbridge-risk-muril
- Repositorio del proyecto MindBridge: https://github.com/priya30-dev/MindBridge-Mental-Health-Screening
- Modelo base: https://huggingface.co/google/muril-base-cased
- Dataset de entrenamiento: https://huggingface.co/datasets/gokulan006/risk-analysis-dataset
- Modelo de traducción usado: https://huggingface.co/Helsinki-NLP/opus-mt-en-hi
