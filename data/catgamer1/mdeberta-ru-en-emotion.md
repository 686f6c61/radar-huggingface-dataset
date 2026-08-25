# catgamer1/mdeberta-ru-en-emotion

## Resumen

El modelo `catgamer1/mdeberta-ru-en-emotion` es un clasificador de emociones multi-etiqueta (multi-label) en texto, desarrollado por el usuario catgamer1. Se basa en el modelo base `microsoft/mdeberta-v3-base` y está especializado en el reconocimiento de las seis emociones de Ekman (ira, asco, miedo, alegría, tristeza y sorpresa) más una categoría neutral. Está entrenado para procesar tanto ruso como inglés, lo que lo hace útil para análisis de sentimiento en redes sociales y textos informales.

El modelo se ha ajustado mediante LoRA (adaptadores de bajo rango) sobre el modelo base, que a su vez emplea la arquitectura DeBERTa v3 con atención desenredada (disentangled attention) y un decodificador de máscara mejorado. El resultado es un modelo con 278 millones de parámetros totales, con un peso en safetensors de 0,6 GB, licencia MIT y pipeline de clasificación de texto. Su relevancia actual radica en que cubre un hueco para el reconocimiento de emociones en ruso e inglés con un único modelo, ofreciendo métricas de rendimiento documentadas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DeBERTa v3 (disentangled attention) con clasificador multi-etiqueta |
| Parametros totales | 278.814.727 |
| Parametros activos | No aplicable (modelo denso, no MoE) |
| Longitud de contexto | 512 tokens (valor estándar de DeBERTa v3 base, no se especifica en la ficha) |
| Tipos de cuantizacion | No se especifican; se distribuye en safetensors (precisión completa) |
| Idiomas soportados | Ruso (ru) e inglés (en) |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en `microsoft/mdeberta-v3-base`, que emplea la arquitectura DeBERTa v3. La principal innovación de DeBERTa es la atención desenredada: en lugar de mezclar el contenido y la posición de cada token en una sola representación, procesa ambos por separado y luego los combina, lo que mejora la eficiencia del preentrenamiento y la comprensión contextual. El modelo base se entrenó con un objetivo de modelado de lenguaje enmascarado mejorado (enhanced mask decoder).

Para este ajuste fino, el autor utilizó LoRA (r=16, alpha=32) en las proyecciones q, k, v y densas, con dropout de 0.1. Se empleó una función de pérdida asimétrica recortada (clipped asymmetric loss) con epsilon=0.04, gamma_neg=3.5 y gamma_pos=1.5, para manejar el desbalance de clases. El optimizador fue AdamW con LR=2e-4 para LoRA y LR=1e-5 con epsilon=1e-3 para la cabeza de clasificación. Se usó un scheduler lineal con 10% de warmup, batch de 16 con acumulación de gradientes de 2 pasos, AMP de PyTorch y recorte de gradiente a 1.0. Se planificaron 10 épocas, pero el entrenamiento se detuvo en la época 7 por aumento de la pérdida de validación.

Los datos de entrenamiento provienen de tres conjuntos públicos: GoEmotions (inglés, con las 7 clases), CEDR (ruso, sin la clase disgust) y BRIGHTER (ruso e inglés; el inglés carece de disgust). La combinación de estos conjuntos permite al modelo cubrir ambas lenguas, aunque la clase disgust está subrepresentada en ruso y ausente en inglés dentro de BRIGHTER.

## Capacidades

- Clasificación multi-etiqueta de emociones en texto: asigna probabilidades a 7 categorías (ira, asco, miedo, alegría, tristeza, sorpresa y neutral) de forma simultánea.
- Soporte multilingüe para ruso e inglés en un único modelo.
- Acepta textos cortos de redes sociales, como tuits o comentarios.
- API simple mediante pipeline de Hugging Face, con opción de `top_k=None` y `function_to_apply='sigmoid'` para obtener probabilidades de todas las clases.
- No soporta tool calling, agentes ni razonamiento multi-paso; su función es exclusivamente clasificación de emociones.

## Casos de uso

- **Análisis de sentimiento en redes sociales**: permite monitorizar la reacción emocional de usuarios en Twitter o Facebook en inglés y ruso, clasificando cada mensaje en múltiples emociones. Adecuado para campañas de marketing o análisis de opinión pública.
- **Atención al cliente automatizada**: en un sistema de tickets, el modelo puede etiquetar automáticamente la emoción del cliente (ira, frustración, alegría) para priorizar las quejas y escalar las urgentes. Su ventana de 512 tokens es suficiente para mensajes de correo o chat.
- **Moderación de contenido**: en plataformas de contenido generado por usuarios, el modelo puede detectar mensajes con alta probabilidad de ira o asco para su revisión manual, ayudando a reducir el acoso o discursos de odio.
- **Investigación en psicología y ciencias sociales**: análisis de diarios o respuestas a encuestas abiertas para cuantificar estados emocionales en estudios longitudinales. La compatibilidad con ruso e inglés permite estudios comparativos.
- **Sistemas de recomendación de contenido**: en una aplicación de noticias, se puede clasificar la reacción emocional esperada de un artículo (sorpresa, alegría) y adaptar la selección de contenido para el usuario.
- **Evaluación de satisfacción en encuestas**: en formularios de opinión, el modelo puede asignar una etiqueta emocional a las respuestas abiertas, permitiendo un análisis cuantitativo de la satisfacción del cliente sin necesidad de encuestas cerradas.

## Benchmarks y rendimiento

El autor publicó resultados de evaluación sobre el conjunto combinado de GoEmotions + CEDR + BRIGHTER. El modelo alcanzó una AUC macro de **0.9291** y una F1 macro de **0.6957** (con umbrales óptimos de validación). La tabla siguiente muestra el desglose por emoción:

| Emoción | AUC | F1 |
| :--- | ---: | ---: |
| Ira (Anger) | 0.9113 | 0.6198 |
| Miedo (Fear) | 0.9505 | 0.7717 |
| Alegría (Joy) | 0.9376 | 0.7937 |
| Tristeza (Sadness) | 0.9245 | 0.7043 |
| Asco (Disgust) | 0.9725 | 0.6442 |
| Sorpresa (Surprise) | 0.9048 | 0.6432 |
| Neutral | 0.9024 | 0.6931 |

No se han publicado resultados en otros benchmarks estándar (MMLU, HumanEval, etc.) porque es un modelo de clasificación, no de generación.

## Requisitos de hardware

- **VRAM estimada**: el modelo tiene 278 millones de parámetros. En precisión fp32, el peso ocupa aproximadamente 1,1 GB; en fp16, 0,56 GB. Para inferencia, se puede estimar una huella de memoria de alrededor de 2 GB en fp16 (incluyendo activaciones). En cuantización int8, podría reducirse a ~1 GB.
- **GPU recomendadas**: cualquier GPU con al menos 2 GB de VRAM puede ejecutarlo. Modelos como GTX 1650, RTX 3050, o incluso CPU son viables para inferencia con baja latencia.
- **Cabe en consumer GPU**: sí, es un modelo pequeño que cabe en GPUs de gama media y baja.
- **Opciones de despliegue**: se puede usar con la librería `transformers` de Hugging Face (pipeline), también con ONNX Runtime o TensorRT si se exporta. No se menciona compatibilidad con vLLM o llama.cpp, pero al ser un modelo de clasificación, no requiere generación.
- **Latencia y throughput**: no se han publicado datos concretos. En una GPU RTX 3090, se espera una latencia de pocos milisegundos por texto corto (típico de modelos de tamaño similar). En CPU, la latencia puede ser del orden de decenas de milisegundos.

## Comparativa con modelos similares

No se dispone de una comparación directa con otros modelos de reconocimiento de emociones multilingüe en la información proporcionada. Sin embargo, se pueden mencionar alternativas generales:

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Rendimiento |
| :--- | ---: | ---: | --- | --- | --- |
| `catgamer1/mdeberta-ru-en-emotion` | 278M | 512 | ru, en | MIT | AUC 0.9291, F1 0.6957 (macro) |
| `cardiffnlp/twitter-xlm-roberta-base-emotion` | ~278M | 512 | multilingüe (incluye ru, en) | MIT | No se dispone de datos comparables |
| `bhadresh-savani/bert-base-uncased-emotion` | 110M | 512 | en | MIT | No se dispone de datos comparables |

Nota: la comparación con `twitter-xlm-roberta-base-emotion` se basa en que es otro modelo de clasificación de emociones, pero no se han publicado métricas equivalentes en los mismos conjuntos. La información de la comparativa no está disponible.

## Limitaciones y advertencias

- **Sesgos de datos**: los conjuntos de entrenamiento (GoEmotions, CEDR, BRIGHTER) provienen de redes sociales, lo que puede introducir sesgos en el vocabulario y en la forma de expresar emociones. No se ha evaluado su rendimiento en textos formales o técnicos.
- **Alucinación**: no aplica, es un clasificador y no genera texto.
- **Limitaciones de contexto**: la ventana de 512 tokens puede ser insuficiente para documentos largos; se debe truncar o dividir el texto.
- **Cobertura de emociones**: la clase "asco" está ausente en CEDR (ruso) y en BRIGHTER (inglés), lo que puede afectar al rendimiento en esa clase. El F1 para asco es notablemente menor que el de otras emociones (0.6442).
- **Licencia**: MIT permite uso comercial, pero el autor no proporciona garantías sobre el rendimiento en producción.
- **Uso en producción**: se recomienda validar el modelo en el dominio específico y ajustar los umbrales de decisión, ya que los valores de F1 se calcularon con umbrales óptimos de validación.

## Enlaces

- [Hugging Face: catgamer1/mdeberta-ru-en-emotion](https://huggingface.co/catgamer1/mdeberta-ru-en-emotion)
- [Modelo base: microsoft/mdeberta-v3-base](https://huggingface.co/microsoft/mdeberta-v3-base)
- [Dataset GoEmotions](https://huggingface.co/datasets/google-research-datasets/go_emotions)
- [Dataset CEDR](https://huggingface.co/datasets/sagteam/cedr_v1)
- [Dataset BRIGHTER](https://huggingface.co/datasets/brighter-dataset/BRIGHTER-emotion-categories)
- [Documentación de DeBERTa](https://huggingface.co/docs/transformers/model_doc/deberta)
