# GaryAgasa/hw2-distilbert-emotion

## Resumen

hw2-distilbert-emotion es un modelo de clasificación de texto en inglés obtenido mediante fine-tuning de `distilbert-base-uncased` sobre el conjunto de datos `dair-ai/emotion`. Lo desarrolla el usuario GaryAgasa como parte de un trabajo académico (el identificador "hw2" sugiere una segunda tarea de curso) y clasifica textos cortos en seis emociones: sadness, joy, love, anger, fear y surprise. Con 66.958.086 parámetros y un repositorio de 0,3 GB, es un modelo compacto pensado para inferencia rápida en CPU o GPU de gama baja.

El problema que resuelve es el análisis de emociones (emotion classification) sobre frases cortas en inglés, una tarea habitual en moderación de contenido, análisis de opiniones y monitorización de redes sociales. Frente a alternativas más grandes, su principal atractivo es el coste: la arquitectura DistilBERT reduce el tamaño de BERT-base en aproximadamente un 40 % manteniendo buena parte del rendimiento en tareas de clasificación, lo que permite desplegarlo en entornos con recursos limitados.

La relevancia de esta ficha es limitada en términos de impacto: se trata de un modelo de curso con cero descargas y cero likes en el momento de la consulta, sin licencia declarada y con un único seed de entrenamiento. Aun así, sus métricas reportadas (exactitud de test de 0,9245 y macro-F1 de 0,8808) son razonables para la tarea, y el autor documenta con honestidad las limitaciones y la metodología de reproducción, lo que facilita evaluarlo como línea base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (DistilBERT, destilación de BERT-base) |
| Parametros totales | 66.958.086 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible como contexto generativo; entrenamiento e inferencia con `max_length=64` tokens |
| Tipos de cuantizacion | no disponible (pesos en safetensors; cuantización dinámica posible vía librerías externas, no documentada por el autor) |
| Idiomas soportados | en (inglés) |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de `distilbert-base-uncased`, un transformer encoder de 6 capas y 66 millones de parámetros obtenido por destilación de conocimiento de BERT-base (12 capas, 110 millones de parámetros). Sobre esa base se añade una cabeza de clasificación de 6 clases y se hace fine-tuning supervisado. No hay indicios de RLHF, DPO ni entrenamiento por preferencias: es un ajuste supervisado clásico con entropía cruzada.

El entrenamiento se realizó localmente sobre el split Emotion de `dair-ai/emotion` con 16.000 ejemplos de entrenamiento, 2.000 de validación y 2.000 de test. Hiperparámetros documentados: learning rate 5e-5, 2 épocas, batch efectivo 32, longitud máxima 64, seed 42, optimizador AdamW con weight decay 0,01 y decaimiento lineal con 10 % de warmup. La selección del checkpoint se hizo por macro-F1 de validación. El autor reconoce que solo se probó un seed y que la búsqueda de hiperparámetros fue limitada, por lo que no hay afirmación de significancia estadística. También señala que los splits originales contienen textos solapados y que, tras excluir 14 textos de test vistos en entrenamiento o validación, quedan 1.986 ejemplos con exactitud de 0,9265.

## Capacidades

- Clasificación de texto en inglés en seis emociones: sadness, joy, love, anger, fear y surprise.
- Salida de probabilidades por clase (softmax), aunque el autor advierte que no están calibradas.
- Entrada de texto corto, con truncamiento a 64 tokens; adecuado para frases, tuits, titulares o mensajes breves.
- No soporta generación de texto, tool calling, function calling, agentes ni razonamiento multi-paso.
- No tiene capacidades de visión, audio ni modo "thinking".
- Monolingüe: solo inglés; no se documenta soporte multilingüe.

## Casos de uso

- Moderación de contenido en foros y redes: clasificar mensajes cortos en categorías emocionales para priorizar revisiones humanas de contenido con carga de anger o fear, aprovechando la baja latencia de un modelo de 66 M de parámetros.
- Análisis de sentimiento y emoción en encuestas abiertas: procesar respuestas cortas de clientes o empleados y agregar distribuciones de emociones por segmento, con la cautela de que las probabilidades no están calibradas.
- Monitorización de reputación de marca: ingerir menciones en inglés de redes sociales y etiquetar la emoción dominante para detectar picos de anger o fear asociados a incidentes.
- Enrutamiento de tickets de soporte: usar la emoción detectada como señal auxiliar para derivar casos de frustración a agentes senior, combinándolo con otras señales del ticket.
- Investigación en psicología computacional o lingüística: servir como línea base reproducible para experimentos de clasificación emocional en textos cortos, dado que el autor publica scripts y entorno de reproducción.
- Preprocesado en pipelines de NLP más grandes: como componente ligero que filtra o etiqueta grandes volúmenes de texto antes de pasarlos a modelos generativos más caros, reduciendo coste computacional.
- Análisis de reseñas de productos: etiquetar reseñas cortas en inglés por emoción para complementar el análisis de sentimiento positivo/negativo tradicional.

## Benchmarks y rendimiento

| Metrica | Valor |
|---|---|
| Exactitud de validación | 0,9345 |
| Exactitud de test | 0,9245 |
| Macro-F1 de test | 0,8808 |
| F1 ponderado de test | 0,9250 |
| Exactitud de test (sin 14 textos solapados, 1.986 ejemplos) | 0,9265 |

No se han publicado comparaciones con otros modelos en la información disponible. Los resultados anteriores son los reportados por el autor en la model card, no verificados de forma independiente.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en fp32 (66,9 M de parámetros, aproximadamente 268 MB de pesos) y del orden de 100-150 MB en cuantización int8; el repositorio completo ocupa 0,3 GB.
- GPU recomendadas: cualquier GPU moderna sirve; no requiere A100 ni H100. Funciona bien en RTX 4090, RTX 3060, T4, e incluso en CPU.
- Cabe en cualquier GPU de consumo, incluidas integradas, y en CPU con latencias de milisegundos por frase corta.
- Opciones de despliegue: `transformers` con `pipeline("text-classification")`, TorchScript/ONNX para producción, y `llama.cpp`/Ollama no aplican (no es un modelo generativo). vLLM y TGI no están orientados a este tipo de clasificador, aunque es posible servirlo con frameworks de inferencia genéricos.
- Latencia y throughput: no se han publicado mediciones en la información disponible; por el tamaño, se espera un throughput alto en batch y latencia de un dígito de milisegundos en GPU para entradas de 64 tokens.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / max length | Licencia | Disponibilidad |
|---|---|---|---|---|
| hw2-distilbert-emotion | 66,9 M | 64 tokens (entrenamiento) | no disponible | Hugging Face (0 descargas) |
| distilbert-base-uncased-finetuned-sst-2-english | ~67 M | 512 tokens | Apache 2.0 | Hugging Face (muy usado) |
| roberta-base (fine-tune equivalente) | ~125 M | 512 tokens | MIT | Hugging Face |
| bhadresh-savani/distilbert-base-uncased-emotion | ~67 M | 512 tokens | no verificada en esta ficha | Hugging Face |

No se dispone de datos de rendimiento comparativo entre estos modelos en la información proporcionada; la comparación se limita a tamaño, contexto y licencia. Para una evaluación rigurosa habría que ejecutar los mismos 2.000 ejemplos de test sobre cada alternativa.

## Limitaciones y advertencias

- Solo inglés y solo texto corto; entradas largas se truncan a 64 tokens, perdiendo información.
- El autor advierte que la ironía, la negación, las emociones mixtas y las clases raras pueden fallar.
- Las puntuaciones softmax no están calibradas: no deben interpretarse como probabilidades fiables sin calibración previa.
- Las etiquetas son subjetivas; el autor prohíbe explícitamente usar el modelo para diagnosticar a personas.
- Los splits originales contienen textos solapados entre train, validation y test; el autor reporta métricas corregidas, pero el sesgo de solapamiento debe tenerse en cuenta.
- Un único seed y búsqueda de hiperparámetros limitada: sin afirmación de significancia estadística.
- Licencia no declarada: riesgo legal para uso comercial; hay que contactar con el autor o asumir que no hay permiso explícito.
- Modelo de curso con cero descargas y cero likes: sin validación comunitaria ni mantenimiento conocido.
- Riesgo de alucinación no aplica en sentido generativo, pero sí de clasificaciones erróneas confiadas en textos ambiguos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/GaryAgasa/hw2-distilbert-emotion
- Modelo base: https://huggingface.co/distilbert/distilbert-base-uncased
- Dataset: https://huggingface.co/datasets/dair-ai/emotion
- Repositorio de reproducción: referenciado en la model card como `run_experiments.py`, `results/environment.json` y `project2_completed.ipynb` dentro del repositorio del modelo (no se proporcionan URLs directas adicionales).
