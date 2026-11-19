# 1sevvalyesilyurt/mbert-chat-moderation-swe015

## Resumen

mBERT Chat Moderation (SWE015) es un modelo de clasificación de texto derivado de `bert-base-multilingual-cased`, ajustado por el usuario 1sevvalyesilyurt para moderación de chats y detección de comentarios tóxicos. Se trata de un encoder BERT multilingüe de 177.854.978 parámetros, entrenado sobre un subconjunto de 50.000 muestras durante 2 épocas con un learning rate de 2e-5 y batch size de 32. El modelo se publica bajo licencia MIT y declara soporte para turco e inglés.

El problema que aborda es la clasificación binaria de contenido ofensivo en conversaciones, una tarea habitual en plataformas de mensajería, foros y comunidades online que necesitan filtrar o marcar mensajes inapropiados. Al partir de un checkpoint multilingüe ya preentrenado, el ajuste fino es económico y el modelo resultante es ligero (0,7 GB en el repositorio) y desplegable en hardware modesto.

Es relevante ahora por su perfil de rendimiento declarado: un macro-F1 de 0,902 y una accuracy del 96,38% en el conjunto de test, con un F1 de 0,8241 en la clase ofensiva. No obstante, se trata de un modelo de nicho, con cero descargas y cero likes en el momento de la consulta, sin paper asociado ni documentación más allá de la model card, por lo que debe evaluarse con cautela antes de usarlo en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (BERT base multilingüe, `bert-base-multilingual-cased`) |
| Parametros totales | 177.854.978 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (la model card no la especifica; el checkpoint base admite 512 tokens) |
| Tipos de cuantizacion | No disponible (solo se publican pesos safetensors sin cuantizaciones declaradas) |
| Idiomas soportados | Turco (tr) e inglés (en) |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un fine-tuning de `bert-base-multilingual-cased`, un transformer encoder bidireccional con vocabulario multilingüe y representaciones sensibles a mayúsculas. Sobre esa base se añade una cabeza de clasificación de texto para la tarea de moderación. El entrenamiento declarado consiste en 2 épocas sobre un subconjunto de 50.000 muestras, con batch size de 32 y learning rate de 2e-5, hiperparámetros típicos de un ajuste fino estándar de BERT.

No se detalla en la información disponible la composición del dataset, el origen de las etiquetas, si hubo balanceo de clases, técnicas de aumento de datos, ni si se aplicó algún proceso de RLHF o DPO (no aplicable en un encoder de clasificación). Tampoco se especifica la longitud máxima de secuencia usada durante el entrenamiento ni el esquema exacto de etiquetas (aunque la matriz de confusión sugiere una clasificación binaria entre no ofensivo y ofensivo). La innovación técnica es limitada: se trata de un ajuste fino convencional sin componentes arquitectónicos adicionales.

## Capacidades

- Clasificación binaria de texto para moderación de chats y detección de comentarios tóxicos u ofensivos.
- Procesamiento multilingüe limitado a turco e inglés según la model card.
- Salida de etiqueta con puntuación de confianza propia de la cabeza de clasificación (`text-classification`).
- No soporta generación de texto: es un encoder de clasificación, no un modelo causal.
- No dispone de tool calling ni function calling.
- No está diseñado para agentes ni razonamiento multi-paso.
- No incluye modo thinking, visión ni audio.
- Capacidad de clasificación sobre secuencias de hasta 512 tokens si se respeta la configuración del checkpoint base (no confirmado en la model card).

## Casos de uso

- Moderación en tiempo real de chats de comunidad: el modelo clasifica cada mensaje entrante como ofensivo o no ofensivo antes de publicarlo, con una latencia baja propia de un encoder BERT base.
- Filtrado previo en foros y secciones de comentarios: se puede ejecutar en lote sobre los comentarios enviados para marcar automáticamente los que requieran revisión humana, usando el F1 de 0,8241 en la clase ofensiva como referencia de sensibilidad.
- Triaje en colas de soporte al cliente: clasificar mensajes de usuarios con lenguaje agresivo para derivarlos a un equipo especializado o aplicar respuestas automatizadas con tono neutro.
- Moderación en plataformas con audiencia turca e inglesa: el modelo declara soporte para ambos idiomas, lo que permite cubrir comunidades bilingües con un único checkpoint.
- Preetiquetado para anotación humana: usar las predicciones del modelo como primera pasada en un pipeline de etiquetado de toxicidad, reduciendo el coste de anotación manual antes de la revisión final.
- Detección de abuso en canales de mensajería interna: integrar el clasificador en un servicio de mensajería corporativa para alertar sobre mensajes que puedan constituir acoso entre empleados.
- Evaluación comparativa de moderadores: servir como baseline ligero y barato (0,7 GB, licencia MIT) frente a clasificadores más grandes o APIs comerciales en pruebas A/B de sistemas de moderación.

## Benchmarks y rendimiento

Los únicos datos publicados provienen de la model card y corresponden al conjunto de test del autor:

| Metrica | Valor |
|---|---|
| Macro-F1 (test) | 0,902 |
| Accuracy (test) | 96,38% |
| F1 clase ofensiva | 0,8241 |
| Verdaderos negativos (TN) | 4395 |
| Falsos positivos (FP) | 97 |
| Falsos negativos (FN) | 84 |
| Verdaderos positivos (TP) | 424 |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible, ni comparaciones con modelos similares.

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: aproximadamente 0,7 GB solo para pesos, más overhead de activaciones; en la práctica, menos de 2 GB para lotes pequeños.
- VRAM estimada en fp16: alrededor de 0,35 GB para pesos, con overhead adicional.
- GPU recomendadas: cualquier GPU con al menos 2-4 GB de VRAM; una NVIDIA T4, RTX 3060 o superior es suficiente. También puede ejecutarse en CPU para volúmenes moderados.
- Cabe en GPU de consumo: sí, en cualquier GPU consumer moderna (GTX 1650, RTX 2060, RTX 3060, RTX 4090, etc.).
- Opciones de despliegue: Hugging Face `transformers` con `pipeline("text-classification")`, TorchServe, ONNX Runtime, o servidores de inferencia como TGI (aunque TGI está más orientado a modelos generativos). Para CPU, ONNX Runtime o quantización dinámica con `optimum`.
- Latencia y throughput estimados: no disponibles en la información proporcionada; al ser un BERT base, se espera un throughput alto en GPU (cientos a miles de secuencias por segundo en lotes), pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| mBERT Chat Moderation (SWE015) | 177,9 M | No disponible | Macro-F1 0,902; accuracy 96,38% | MIT | Hugging Face |
| `bert-base-multilingual-cased` (base sin ajustar) | 177,9 M | 512 tokens | No aplica a moderación sin ajuste | Apache 2.0 | Hugging Face |
| `unitary/multilingual-toxic-xlm-roberta` | No disponible en la información | No disponible | No disponible | No disponible | Hugging Face |
| `cardiffnlp/twitter-roberta-base-offensive` | No disponible en la información | No disponible | No disponible | No disponible | Hugging Face |

No se dispone de datos de benchmarks de los modelos alternativos en la información proporcionada, por lo que la comparación cuantitativa no es posible. La comparación se limita a parámetros, licencia y disponibilidad.

## Limitaciones y advertencias

- Modelo de nicho con cero descargas y cero likes en el momento de la consulta; no hay evidencia de uso en producción ni validación independiente.
- El rendimiento declarado (macro-F1 0,902) proviene únicamente de la model card del autor, sin conjunto de test público ni replicación externa.
- El conjunto de entrenamiento es un subconjunto de 50.000 muestras; no se detalla su composición, balance de clases ni origen, lo que impide evaluar sesgos.
- Riesgo de alucinación no aplicable en sentido generativo, pero sí riesgo de falsos positivos y falsos negativos: 97 FP y 84 FN en el test declarado, con un F1 de 0,8241 en la clase ofensiva que indica margen de mejora.
- Cobertura lingüística limitada a turco e inglés; el comportamiento en otros idiomas no está garantizado pese a partir de un checkpoint multilingüe.
- No se especifica la longitud máxima de secuencia usada en entrenamiento; mensajes largos pueden truncarse y perder contexto.
- Licencia MIT permite uso comercial, pero el autor no ofrece garantías ni soporte; conviene auditar el modelo con datos propios antes de desplegarlo.
- No hay información sobre sesgos demográficos, de género o culturales; un clasificador de toxicidad puede sobrerreaccionar ante lenguaje coloquial, dialectos o ironía.
- Al ser un encoder de clasificación, no puede explicar sus decisiones de forma nativa; se requerirían técnicas de atribución adicionales.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/1sevvalyesilyurt/mbert-chat-moderation-swe015
- Checkpoint base: https://huggingface.co/bert-base-multilingual-cased
- Documentación de BERT en Hugging Face: https://huggingface.co/docs/transformers/model_doc/bert
- No se han encontrado papers, blogs, repositorios ni demos adicionales en la información disponible.
