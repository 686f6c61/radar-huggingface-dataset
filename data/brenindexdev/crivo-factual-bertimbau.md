# brenindexdev/crivo-factual-bertimbau

## Resumen

Crivo Factual — BERTimbau es un clasificador binario de veracidad para noticias en portugués de Brasil, desarrollado por el usuario brenindexdev. Se trata de un fine-tuning de `neuralmind/bert-base-portuguese-cased` (BERTimbau) sobre corpus de noticias falsas brasileñas, con el objetivo de producir una señal de triaje que marque contenido potencialmente falso antes de una verificación humana o determinista.

El modelo no pretende emitir un veredicto final: según su propia model card, en el sistema Crivo Factual el veredicto se decide mediante reglas deterministas sobre fuentes primarias, y este clasificador solo aporta una señal previa. Es, por tanto, un componente de un pipeline mayor, no un detector autónomo de desinformación.

Con 108,9 millones de parámetros y un tamaño de repositorio de 0,4 GB, es un modelo pequeño y ligero, adecuado para despliegue en CPU o GPU de consumo. Su relevancia radica en la escasez de clasificadores de veracidad específicos para portugués brasileño con licencia Apache 2.0 y métricas publicadas, aunque su adopción actual es prácticamente nula (0 descargas, 0 likes en el momento de la consulta).

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer encoder (BERT base, BERTimbau) |
| Parámetros totales | 108.924.674 |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | 512 tokens (límite estándar de BERT); entrenado con max_len 256 |
| Tipos de cuantización | no disponible (pesos safetensors en fp32; cuantización no documentada) |
| Idiomas soportados | Portugués (pt), variante brasileña |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un BERT base (12 capas, hidden size 768, 12 cabezas de atención) inicializado desde `neuralmind/bert-base-portuguese-cased` y adaptado como `AutoModelForSequenceClassification` con dos etiquetas (verdadero/falso). La cabeza de clasificación se entrena sobre la representación del token `[CLS]`.

El entrenamiento se realizó sobre dos conjuntos: Fake.Br Corpus (7.200 artículos completos, 2018) y FakenewsBR (36.594 ítems que incluyen noticias, tuits y mensajes de WhatsApp), con particiones fijas y semilla 42. Hiperparámetros: 3 épocas, longitud máxima de 256 tokens, batch de 32, learning rate 2e-5 y pesos de clase para compensar el desbalance. No se documenta uso de RLHF, DPO ni técnicas de aumento de datos más allá de las particiones fijas.

## Capacidades

- Clasificación binaria de texto (verdadero/falso) en portugués brasileño.
- Procesamiento de artículos completos y de fragmentos cortos (tuits, mensajes), aunque con rendimiento desigual según longitud.
- Funciona como señal de triaje dentro de un pipeline de verificación, no como clasificador autónomo.
- No soporta tool calling ni function calling.
- No soporta razonamiento multi-paso ni comportamiento de agente.
- No dispone de modo thinking, visión ni audio.
- Capacidad multilingüe limitada al portugués; no se documenta rendimiento en otras lenguas.

## Casos de uso

- Triaje previo en una redacción de verificación: el modelo puntúa lotes de noticias y prioriza las de mayor probabilidad de ser falsas para revisión humana, reduciendo el volumen de trabajo manual.
- Moderación de contenido en plataformas en portugués: integrado como primera capa de filtro sobre publicaciones y comentarios, con revisión humana de los casos marcados.
- Monitorización de bulos en redes sociales: clasificación de tuits y mensajes de WhatsApp recopilados por un sistema de escucha activa, aprovechando que el modelo fue entrenado con ese tipo de ítems.
- Enriquecimiento de bases de datos periodísticas: etiquetado automático de un archivo histórico de noticias para construir un corpus anotado de veracidad que alimente análisis posteriores.
- Filtro en un pipeline de verificación determinista: como etapa previa al motor de reglas sobre fuentes primarias del proyecto Crivo Factual, descartando contenido con alta confianza de ser veraz.
- Docencia e investigación en PLN: modelo ligero y con licencia permisiva para experimentos de clasificación de desinformación en portugués, con métricas de referencia publicadas.
- Despliegue en entornos con recursos limitados: al tener 108,9 M de parámetros y 0,4 GB de pesos, puede ejecutarse en CPU para clasificación por lotes de baja latencia.

## Benchmarks y rendimiento

| Conjunto de test | Exactitud | Macro-F1 |
|---|---|---|
| Fake.Br artículos (n=1440) | 0,9854 | 0,9854 |
| FakenewsBR mixto (n=7319) | 0,8561 | 0,8243 |
| Política actual (nov 2026, n=20) | 0,85 | no disponible |
| Política actual — artículos (n=8) | 1,00 | no disponible |
| Política actual — afirmaciones cortas | 0,75 | no disponible |

Los resultados corresponden a un reentrenamiento fechado el 17/11/2026 según la model card. El autor señala que todos los modelos evaluados sobre-marcan como falsas las afirmaciones cortas veraces. No se han publicado comparaciones con otros modelos en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: en torno a 0,5 GB; en fp16, aproximadamente 0,25 GB.
- Cabe holgadamente en cualquier GPU de consumo (GTX 1060 6 GB, RTX 3060, RTX 4090) y también en CPU.
- GPU recomendadas para alto throughput: A100, H100 o L4 para procesamiento por lotes a gran escala; para uso individual basta una GPU de gama media.
- Opciones de despliegue: Hugging Face Transformers, vLLM, TGI, ONNX Runtime y llama.cpp no aplica (no hay GGUF publicado); Ollama requeriría conversión previa.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Crivo Factual — BERTimbau | 108,9 M | 512 | Clasificación veracidad (pt-BR) | Apache 2.0 | Hugging Face |
| BERTimbau base (`neuralmind`) | 108,9 M | 512 | Modelo base preentrenado (pt-BR) | MIT | Hugging Face |
| XLM-RoBERTa base | 278 M | 512 | Clasificación multilingüe | MIT | Hugging Face |

La comparación se limita a modelos base de la misma familia y tamaño, ya que no se dispone de datos de otros clasificadores de veracidad en portugués con métricas publicadas en la información consultada. No hay datos de rendimiento comparativo entre estos modelos.

## Limitaciones y advertencias

- El modelo es una señal de triaje, no un verificador de hechos: su salida no debe presentarse como veredicto.
- Sesgo documentado hacia clasificar como falsas las afirmaciones cortas veraces (exactitud de 0,75 en ese subconjunto).
- Riesgo de degradación ante temas de actualidad no presentes en los corpus de entrenamiento de 2018 y anteriores.
- Rendimiento notablemente inferior en el conjunto mixto (F1 0,8243) frente al de artículos (F1 0,9854), lo que sugiere dependencia del formato y la longitud del texto.
- Entrenado únicamente en portugués brasileño; no se garantiza su comportamiento en portugués europeo ni en otras lenguas.
- Licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantías sobre el modelo; se recomienda validación propia antes de producción.
- Adopción nula (0 descargas, 0 likes) y ausencia de auditoría externa; conviene tratar las métricas publicadas como no replicadas de forma independiente.
- Longitud máxima de 512 tokens: los artículos largos deben truncarse, lo que puede eliminar contexto relevante.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/brenindexdev/crivo-factual-bertimbau
- Repositorio del proyecto Crivo Factual: https://github.com/Crivo-Factual/crivo-factual-project
- Modelo base BERTimbau: https://huggingface.co/neuralmind/bert-base-portuguese-cased
