# aymanbm2000/ag-news-distilbert-lora-r8

## Resumen

ag-news-distilbert-lora-r8 es un adaptador LoRA de PEFT sobre DistilBERT (`distilbert-base-uncased`) entrenado para clasificación de texto en cuatro clases sobre el conjunto de datos AG News (World, Sports, Business, Sci/Tech). Lo publica el usuario aymanbm2000 (aymanbm2000/ag-news-distilbert-lora-r8) como parte de un estudio sistemático del compromiso entre rendimiento y coste computacional del rango de LoRA en una tarea de clasificación de textos cortos.

El modelo resuelve un problema acotado: asignar una de cuatro categorías temáticas a titulares o frases breves en inglés. Su relevancia es fundamentalmente metodológica y de eficiencia: con solo los módulos `q_lin` y `v_lin` adaptados (rango 8, alpha 16, dropout 0,1) alcanza una accuracy de 0,9272 en el split de test estándar de AG News (7.600 ejemplos), frente al 0,9333 de un ajuste completo de DistilBERT y al 0,9107 de una línea base TF-IDF + regresión logística.

Se trata por tanto de un modelo pequeño y especializado: 67 millones de parámetros en el modelo base, contexto arquitectónico de 512 tokens (aunque el entrenamiento y la evaluación se hicieron con una longitud máxima de 128 tokens), solo inglés, licencia Apache 2.0 y pesos distribuidos como adaptador en safetensors. No es un modelo generativo ni conversacional, y no soporta tool calling, agentes ni razonamiento multi-paso.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (DistilBERT, destilado de BERT-base) + adaptadores LoRA en `q_lin` y `v_lin` + cabeza de clasificación de 4 clases |
| Parametros totales | 67 M en el modelo base DistilBERT; el adaptador LoRA y la cabeza de clasificación son una fracción pequena del total (valor exacto no disponible) |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | 512 tokens en DistilBERT; entrenado y evaluado con `max_length=128` |
| Tipos de cuantizacion | no disponible (el adaptador se publica en safetensors; el autor no documenta cuantizaciones) |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA; requiere cargar el modelo base `distilbert-base-uncased` por separado) |

## Arquitectura y entrenamiento

La base es DistilBERT, un transformer encoder de 6 capas con 67 millones de parámetros obtenido por destilación de BERT-base. Sobre él se aplica LoRA mediante la librería PEFT: rango r=8, alpha=16, dropout=0,1 y módulos objetivo `q_lin` y `v_lin` (proyecciones de query y value en la atención). Solo se entrenan el adaptador y la cabeza de clasificación de 4 etiquetas; el resto del encoder permanece congelado. La inferencia requiere recomponer el modelo completo con `PeftModel.from_pretrained` sobre `distilbert-base-uncased`.

El entrenamiento usa aproximadamente 50.000 filas muestreadas del split de entrenamiento de AG News, con 3 épocas, learning rate 2e-4 (más alto que el 2e-5 típico de un ajuste completo, siguiendo la práctica habitual con LoRA), batch size 32 en entrenamiento y 64 en evaluación, y longitud máxima de 128 tokens. El optimizador y el scheduler son los valores por defecto del `Trainer` de HuggingFace, y la selección del mejor checkpoint se hace por macro F1 sobre un split de validación retenido (10% de los datos de entrenamiento). El seguimiento se realizó con Weights & Biases. No se documenta uso de RLHF, DPO ni decodificación especulativa, algo esperable en un clasificador. Este adaptador forma parte de una barrido de rangos (r=4/8/16/32) comparado además contra una línea base TF-IDF + regresión logística y un ajuste completo de DistilBERT.

## Capacidades

- Clasificación de texto en inglés en exactamente cuatro categorías: World, Sports, Business, Sci/Tech.
- Diseñado para textos cortos de estilo periodístico (titulares, entradillas breves), con truncado a 128 tokens.
- Devuelve logits sobre 4 clases, de los que se puede derivar una probabilidad mediante softmax (el ejemplo de la model card muestra `label_names[pred_idx]` y la probabilidad asociada).
- No dispone de generación de texto, razonamiento, código, matemáticas ni visión.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso; es un clasificador de un solo paso.
- Capacidad multilingüe nula: únicamente inglés, tal como declara la model card.
- No tiene modo "thinking" ni capacidades de audio.

## Casos de uso

- Enrutamiento de titulares en un agregador de noticias: el modelo asigna cada titular entrante a una de las cuatro secciones (World, Sports, Business, Sci/Tech) antes de pasarlo a un sistema de recomendación o a una cola editorial.
- Etiquetado automático de un archivo histórico de prensa: sobre lotes de decenas de miles de titulares en inglés, la inferencia es lo bastante barata para ejecutarse en CPU y clasificar el corpus completo sin GPU.
- Filtrado previo en un pipeline de análisis de sentimiento o de eventos: se usa como primera etapa para separar noticias de negocios o tecnología y aplicar después modelos más caros solo a las categorías relevantes.
- Monitorización de medios para equipos de comunicación: detección de menciones en la sección Business o Sci/Tech para alertar sobre movimientos de competidores o cambios regulatorios.
- Componente de un sistema de clasificación jerárquica: la salida de 4 clases sirve como primer nivel antes de un clasificador de subtemas más fino (que este modelo no cubre).
- Referencia académica y reproducción de experimentos: al formar parte de un barrido de rangos LoRA publicado, sirve como punto de comparación controlado frente a r=4, r=16, r=32 y al ajuste completo.
- Clasificación en el borde (edge) o en entornos sin GPU: al ser un adaptador sobre un encoder de 67 M de parámetros, cabe en dispositivos con recursos muy limitados y no requiere infraestructura de inferencia especializada.

## Benchmarks y rendimiento

Resultados declarados por el autor en el model-index (no verificados por terceros). Evaluación sobre el split de test estándar de AG News, 7.600 ejemplos.

| Metrica | Valor |
|---|---|
| Accuracy | 0,9272 |
| Macro F1 | 0,9272 |
| Errores | 553 / 7.600 (7,3%) |

Comparativa publicada por el autor entre rangos de LoRA, línea base y ajuste completo:

| Modelo | Accuracy en test | Macro F1 en test |
|---|---|---|
| Línea base (TF-IDF + regresión logística) | no disponible | 0,9107 |
| LoRA r=4, alpha=8 | 0,9264 | 0,9264 |
| LoRA r=8, alpha=16 (este modelo) | 0,9272 | 0,9272 |
| LoRA r=16, alpha=32 | 0,9293 | 0,9293 |
| LoRA r=32, alpha=64 | 0,9309 | 0,9309 |
| Ajuste completo de DistilBERT | 0,9333 | 0,9333 |

El autor señala que el rango de LoRA tiene un efecto positivo pequeño pero consistente, con ganancias incrementales de F1 en cada escalón de rango. No se han publicado en la información disponible resultados de otros benchmarks (MMLU, HumanEval, GSM8K u otros), algo coherente con la naturaleza de clasificador del modelo.

## Requisitos de hardware

- VRAM estimada para inferencia: el adaptador en safetensors es de tamaño muy reducido (el repositorio ocupa 0,0 GB según HuggingFace). El modelo base DistilBERT suma aproximadamente 270 MB en fp32 y unos 135 MB en fp16, cantidades poco relevantes para cualquier GPU actual.
- GPU recomendadas: no se requieren GPU dedicadas; cualquier GPU con más de 1 GB de VRAM es suficiente (GTX 1050 Ti, RTX 3050, T4, etc.). No tiene sentido desplegarlo en A100 o H100 por coste.
- Cabe en GPU de consumo: sí, en cualquier GPU de consumo de los últimos diez años, e incluso en GPUs integradas. También es viable en CPU.
- Opciones de despliegue: transformers + peft (patrón documentado en la model card), y exportación a ONNX o TorchScript para servir sin dependencia de PEFT. vLLM, TGI y llama.cpp no aplican a este tipo de modelo (clasificador encoder, no generativo).
- Latencia y throughput estimados: no disponibles. No obstante, dadas 6 capas y 67 M de parámetros, con batch size alto y secuencias de 128 tokens es esperable un throughput de miles de ejemplos por segundo en una GPU moderna y de centenares por segundo en CPU multinúcleo; se trata de una estimación orientativa, no de una cifra medida por el autor.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento (AG News) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ag-news-distilbert-lora-r8 (este modelo) | 67 M base + adaptador LoRA r=8 | 512 (entrenado a 128) | Accuracy 0,9272 / Macro F1 0,9272 | Apache 2.0 | HuggingFace (adaptador PEFT), 0 descargas |
| LoRA r=32 sobre DistilBERT (mismo autor) | 67 M base + adaptador LoRA r=32 | 512 (entrenado a 128) | Accuracy 0,9309 / Macro F1 0,9309 | Apache 2.0 (según la ficha del autor) | HuggingFace |
| DistilBERT con ajuste completo (mismo autor) | 67 M | 512 (entrenado a 128) | Accuracy 0,9333 / Macro F1 0,9333 | Apache 2.0 (modelo base) | Resultado del experimento; checkpoint específico no disponible |
| Línea base TF-IDF + regresión logística | No aplica (modelo lineal disperso) | No aplica (bolsa de palabras) | Macro F1 0,9107 | No disponible | Código del experimento, no publicado como modelo |

Alternativas externas de la misma categoría (por ejemplo otros checkpoints de DistilBERT o BERT afinados sobre AG News, o clasificadores lineales sobre TF-IDF): no disponible en la información proporcionada, por lo que no se incluyen cifras comparativas que no puedan contrastarse.

## Limitaciones y advertencias

- Dominio restringido: entrenado y evaluado únicamente sobre AG News. El rendimiento en otros conjuntos de clasificación de noticias o en otros dominios no está probado.
- Solo inglés. Cualquier texto en otro idioma queda fuera de su ámbito de uso previsto.
- Granularidad limitada a las cuatro categorías de AG News; no sirve para clasificación de subtemas ni de temas más finos.
- Ventana efectiva corta: aunque DistilBERT admite 512 tokens, el entrenamiento se hizo con `max_length=128`, por lo que el comportamiento con textos más largos no está validado.
- Riesgo de alucinación no aplica en sentido generativo, pero sí existe riesgo de clasificación errónea: la tasa de error declarada es del 7,3% sobre el test de AG News, con la consiguiente confusión entre categorías cercanas (por ejemplo Business y Sci/Tech).
- Sesgos heredados de los datos de preentrenamiento de DistilBERT, tal como reconoce el propio autor en la model card; no se documenta ninguna auditoría de sesgos ni análisis por subgrupos.
- Métricas no verificadas: el model-index marca `verified: false` tanto para accuracy como para macro F1, y el modelo cuenta con 0 descargas y 0 likes, por lo que no hay validación independiente de los resultados.
- Licencia Apache 2.0, que permite uso comercial, pero conviene verificar también las condiciones del modelo base `distilbert-base-uncased` (Apache 2.0) y de AG News como conjunto de datos antes de un despliegue en producción.
- Al ser un adaptador PEFT, no es autocontenido: requiere descargar y cargar el modelo base por separado, lo que añade un paso y una dependencia en el pipeline de despliegue.
- Omisión de la cabeza de clasificación no es posible: el adaptador incluye la cabeza de 4 clases, de modo que no se puede reutilizar directamente en una tarea con distinto número de etiquetas sin reentrenar esa parte.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/aymanbm2000/ag-news-distilbert-lora-r8
- Modelo base: https://huggingface.co/distilbert-base-uncased
- Paper de LoRA: https://arxiv.org/abs/2106.09685
- Repositorio PEFT: https://github.com/huggingface/peft
- Conjunto de datos AG News: https://huggingface.co/datasets/ag_news
- Weights & Biases (seguimiento de experimentos): https://wandb.ai
- Código del proyecto (enlace sin URL completa en la model card): github.com/aymanbm2000/project3
