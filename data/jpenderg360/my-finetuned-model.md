# jpenderg360/my-finetuned-model

## Resumen

`jpenderg360/my-finetuned-model` es un adaptador LoRA sobre el encoder `distilbert-base-uncased` afinado para clasificación binaria de sentimiento en resenas de productos de Amazon. Lo desarrolla John Pendergrass como proyecto de ajuste fino con PEFT y se publica en Hugging Face con la librería `peft` y pesos en `safetensors`. El problema que resuelve es concreto: asignar una etiqueta positiva o negativa a una resena en inglés combinando título y cuerpo del texto.

La relevancia es limitada pero clara como referencia práctica: demuestra un flujo completo de adaptación de bajo rango sobre un transformer encoder pequeño (unos 66 millones de parámetros en el modelo base envuelto por PEFT, con 739.586 parámetros entrenables, el 1,09 % del total), con un resultado declarado de 94,0 % de exactitud sobre 1.000 resenas de test. No es un modelo generativo ni compite en la liga de los LLM: es un clasificador de texto pequeño, barato de desplegar y pensado para inferencia de baja latencia en CPU o GPU modesta.

No se dispone de información sobre licencia, datos de entrenamiento más allá de los 10.000 ejemplos declarados ni evaluación fuera de un único subconjunto de test. La ficha refleja por tanto lo publicado por el autor y marca como no disponible todo lo que la model card no documenta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (DistilBERT, 6 capas) con adaptadores LoRA en `q_lin` y `v_lin` y cabeza de clasificación de secuencias |
| Parametros totales | 67.694.596 (modelo envuelto por PEFT, según la model card) |
| Parametros activos | No aplica (no es MoE). Parametros entrenables: 739.586 (1,09 %) |
| Longitud de contexto | 512 tokens (truncado y padding a longitud fija 512) |
| Tipos de cuantizacion | No disponible (el autor no documenta cuantización; el adaptador se publica en safetensors) |
| Idiomas soportados | Inglés (`en`) |
| Licencia | No disponible |
| Formato de pesos | `safetensors` (adaptador PEFT/LoRA); requiere el checkpoint base `distilbert-base-uncased` |

## Arquitectura y entrenamiento

El modelo base es DistilBERT, un transformer encoder destilado de BERT con 6 capas y aproximadamente 66 millones de parámetros, tokenizador uncased y vocabulario WordPiece. Sobre ese encoder se aplican adaptadores LoRA de rango 8 y alpha 32 con dropout 0,05 y `bias="none"` en las proyecciones de query y value (`q_lin`, `v_lin`). El resto de pesos del encoder permanece congelado y se entrena además la cabeza de clasificación de secuencia (`SEQ_CLS`) con dos etiquetas (0 = negativo, 1 = positivo).

Los datos provienen del dataset `fancyzhx/amazon_polarity`, con etiquetas binarias de sentimiento. El autor baraja por separado los splits oficiales de train y test con semilla 42 y selecciona 10.000 resenas para entrenamiento y 1.000 para evaluación. Cada entrada concatena título, un espacio y cuerpo de la resena, se tokeniza con el tokenizador de DistilBERT, se trunca a 512 tokens y se rellena hasta esa longitud. El entrenamiento usa 2 épocas, batch de 16, learning rate 0,0005 y FP16 cuando hay CUDA disponible, con un total de 1.250 pasos de optimizador y PEFT 0.15.2. No se documenta RLHF, DPO ni ninguna innovación de decodificación; es un ajuste supervisado estándar de clasificación.

## Capacidades

- Clasificación binaria de sentimiento (positivo/negativo) en resenas de productos en inglés.
- Procesamiento de entradas de hasta 512 tokens combinando título y cuerpo del texto.
- Inferencia sobre CPU o GPU con dependencias mínimas (`torch`, `transformers`, `peft`).
- Salida de logits y probabilidad softmax por clase vía `model(**inputs).logits`.
- No soporta generación de texto, razonamiento, código ni matemáticas.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No soporta visión, audio ni modo "thinking".
- Capacidad multilingüe: no disponible; solo se declara inglés.
- No disponible cualquier capacidad de clasificación multietiqueta o de regresión de sentimiento.

## Casos de uso

- Monitorización de opiniones en marketplace: clasificar en lote resenas de Amazon o de un catálogo propio en inglés para alimentar un panel de sentimiento agregado por producto, usando el modelo en CPU con throughput alto por su tamaño reducido.
- Enrutado de tickets de soporte: usar la predicción positiva/negativa como señal previa para dirigir quejas a un equipo humano y comentarios favorables a un flujo de marketing, aprovechando la latencia baja del encoder de 6 capas.
- Filtrado de resenas para moderación asistida: marcar resenas negativas con alta probabilidad para revisión prioritaria, usando el score softmax como umbral configurable (con la advertencia de que la calibración no está evaluada).
- Análisis de series temporales de satisfacción: ejecutar el clasificador sobre resenas nuevas de forma periódica y calcular la proporción de negativas por semana o por SKU.
- Prototipado rápido de clasificación de texto: servir como línea base ajustable en proyectos donde se quiere demostrar un pipeline PEFT de extremo a extremo antes de escalar a un modelo mayor.
- Etiquetado asistido para creación de datasets: preetiquetar grandes volúmenes de texto en inglés y enviar solo los casos de baja confianza a anotación humana, reduciendo el coste de anotación manual.
- Componente en un pipeline de enriquecimiento de datos: añadir una columna de polaridad a registros de texto en inglés dentro de un ETL con `transformers` y procesamiento por lotes de 16, igual que en la evaluación del autor.

## Benchmarks y rendimiento

Los únicos datos publicados corresponden a la exactitud sobre el subconjunto de 1.000 resenas de test elegido por el autor, comparando antes y después del ajuste fino. No hay resultados de MMLU, HumanEval, GSM8K ni de benchmarks estándar de clasificación de sentimiento (SST-2, GLUE), por lo que no se incluyen comparaciones con otros modelos.

| Evaluacion | Exactitud | Predicciones correctas |
|---|---|---|
| Encoder preentrenado con cabeza de clasificación inicializada aleatoriamente (antes de entrenar) | 46,8 % | 468 / 1.000 |
| Tras ajuste fino con LoRA | 94,0 % | 940 / 1.000 |

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo completo en FP32 ocupa del orden de 270 MB (67,7 M de parámetros); en FP16, alrededor de 135 MB. Cabe holgadamente en cualquier GPU consumer, incluida una GTX 1650 de 4 GB, y también en CPU.
- GPU recomendadas: no requiere GPU dedicada. Cualquier GPU con CUDA (RTX 3060, RTX 4090, T4, A100, H100) sirve; en la práctica el cuello de botella será el preprocesado de texto, no el modelo.
- Cabe en GPU consumer: sí, en todas las GPU modernas con al menos 2 GB de VRAM; también en memoria unificada de portátiles y en Raspberry Pi para lotes pequeños.
- Opciones de despliegue: `transformers` + `peft` en Python (flujo documentado por el autor), exportación a ONNX u ONNX Runtime para CPU, TorchScript, o `optimum` para quantización dinámica. No se documenta soporte nativo en vLLM, llama.cpp, Ollama ni TGI, que están orientados a modelos generativos.
- Latencia y throughput: no disponibles. No se publican mediciones del autor; el tamaño del encoder sugiere lotes de decenas o cientos de ejemplos por segundo en GPU consumer, pero es una estimación no verificada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| jpenderg360/my-finetuned-model | 67,7 M (739.586 entrenables) | 512 tokens | LoRA sobre DistilBERT, clasificación binaria en inglés | no disponible | Hugging Face, repo de 0,0 GB |
| distilbert-base-uncased-finetuned-sst-2-english | 66,9 M | 512 tokens | Ajuste completo de DistilBERT sobre SST-2 | Apache 2.0 | Hugging Face, muy usado |
| roberta-base (fine-tune SST-2) | 125 M | 512 tokens | Ajuste completo de RoBERTa sobre SST-2 | MIT | Hugging Face |
| cardiffnlp/twitter-roberta-base-sentiment-latest | 125 M | 512 tokens | RoBERTa afinado en Twitter con 3 clases | MIT | Hugging Face |

La comparación relevante no es de rendimiento bruto —no hay evaluación cruzada— sino de reproducibilidad y coste: este adaptador entrena el 1,09 % de los parámetros, mientras que las alternativas citadas requieren ajuste completo. Frente a los modelos de la familia SST-2, su ventaja es el bajo coste de reentrenamiento sobre un dominio propio; su desventaja es la ausencia de licencia declarada y de evaluación fuera del subconjunto elegido por el autor.

## Limitaciones y advertencias

- Dominio estrecho: entrenado y evaluado solo con resenas de Amazon en inglés; el rendimiento en otros dominios (redes sociales, prensa, soporte técnico) no está evaluado.
- Sesgos conocidos: no se documenta ningún análisis de sesgo por demografía, producto o idioma; el dataset Amazon Polarity puede introducir sesgos de dominio y de estilo de redacción.
- Riesgo de alucinación: no aplica en sentido generativo, pero sí de error de clasificación; el autor documenta un caso de resena mixta ("damaged product") que el modelo sigue clasificando como negativa tras el ajuste.
- Limitación de longitud: los textos se truncan a 512 tokens, lo que puede eliminar información necesaria para interpretar el sentimiento en resenas largas.
- Decisión binaria forzada: el modelo asigna una etiqueta incluso cuando la resena contiene opiniones mixtas; no hay clase neutra ni umbral de abstención.
- Calibración no evaluada: el autor advierte explícitamente que la calibración de las probabilidades softmax no se ha medido, por lo que los scores no deben interpretarse como probabilidades fiables.
- Licencia no disponible: no hay licencia declarada en la model card, lo que impide asumir permisos de uso comercial; hay que contactar con el autor antes de usarlo en producción.
- Evaluación limitada: un único entrenamiento, un único subconjunto de 1.000 resenas y sin validación cruzada ni intervalo de confianza; la cifra de 94,0 % no debe tratarse como un rendimiento garantizado.
- Reproducibilidad: la configuración completa se documenta, pero el notebook de entrenamiento está referenciado como archivo del repo y no se verifica en la información disponible.
- Dependencia del checkpoint base: el adaptador LoRA necesita descargar `distilbert-base-uncased` para funcionar; no es un artefacto autónomo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/jpenderg360/my-finetuned-model
- Archivos del modelo: https://huggingface.co/jpenderg360/my-finetuned-model/tree/main
- Modelo base: https://huggingface.co/distilbert/distilbert-base-uncased
- Dataset de entrenamiento: https://huggingface.co/datasets/fancyzhx/amazon_polarity
- Documentación de PEFT (carga de adaptadores): https://huggingface.co/docs/peft/en/quicktour
