# MayorChris/xlnet-large-cased-batch16-tass-finetuned-2026

## Resumen

`MayorChris/xlnet-large-cased-batch16-tass-finetuned-2026` es un modelo de clasificación de texto obtenido por ajuste fino (fine-tuning) supervisado de `xlnet/xlnet-large-cased`, publicado en HuggingFace por el usuario MayorChris el 24 de octubre de 2026. No es un modelo generativo ni un asistente conversacional: es un cabezal de clasificación de secuencias sobre un encoder XLNet, entrenado con la librería Transformers y distribuido con pesos en formato safetensors.

El problema que aborda es la clasificación de secuencias (predicción de una etiqueta por texto de entrada). Sin embargo, la propia model card no documenta el conjunto de datos, las etiquetas, el idioma ni el uso previsto: se limita a indicar "unknown dataset" y a volcar las métricas del entrenamiento. Los resultados declarados son bajos (accuracy 0,3923; F1 macro 0,1878; F1 ponderado 0,2211), compatibles con un modelo que no ha aprendido una separación útil entre clases o que predice mayoritariamente la clase dominante.

Su relevancia es, por tanto, limitada y de carácter experimental: sirve como ejemplo de pipeline de ajuste fino con `Trainer`, como baseline reproducible (semilla 42, hiperparámetros documentados) y como caso de estudio de un ajuste fino que no converge a un rendimiento aceptable. No hay descargas ni valoraciones registradas, y el repositorio ocupa 56,4 GB, un tamaño desproporcionado para 361 millones de parámetros, lo que sugiere la presencia de checkpoints intermedios u otros artefactos de entrenamiento.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer tipo XLNet (pretraining autorregresivo por permutaciones, con codificación posicional relativa y recurrencia de segmentos propia de Transformer-XL); cabezal de clasificación de secuencias |
| Parametros totales | 361.321.475 (361,3 M), según safetensors |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible en la model card; la arquitectura XLNet estándar admite 512 tokens |
| Tipos de cuantizacion | no disponible; pesos publicados en safetensors (previsiblemente FP32). Compatible con cuantización posterior a FP16/BF16/INT8 mediante herramientas externas |
| Idiomas soportados | no disponible en la model card; el modelo base `xlnet-large-cased` se entrenó sobre corpus en inglés |
| Licencia | MIT |
| Formato de pesos | safetensors (librería transformers) |
| Pipeline | text-classification |
| Modelo base | xlnet/xlnet-large-cased |
| Tamaño del repositorio | 56,4 GB |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

El modelo parte de XLNet-large-cased, un transformer con enmascaramiento por permutaciones que modela la probabilidad conjunta de la secuencia sin utilizar el token `[MASK]` durante el pretraining, y que incorpora codificación posicional relativa y recurrencia de segmentos heredadas de Transformer-XL. Sobre ese encoder se añade un cabezal de clasificación (pooling de la última representación + capa densa) cuyo número de clases no se especifica en la model card. El tokenizador es el `cased` del modelo base (sensible a mayúsculas).

El ajuste fino se realizó con `Trainer` de Transformers, con los siguientes hiperparámetros declarados: learning rate 1e-5, batch de entrenamiento 16, batch de evaluación 32, optimizador AdamW fused (betas 0,9/0,999, epsilon 1e-8), scheduler lineal, 10 épocas configuradas y semilla 42. El registro de entrenamiento solo recoge 6 épocas (hasta el paso 1446), con una pérdida de validación prácticamente plana en torno a 1,09 y métricas idénticas en todas las épocas, lo que indica ausencia de aprendizaje: el modelo no sale de un régimen degenerado. Versiones de framework declaradas: Transformers 5.20.2, PyTorch 2.11.0+cu130, Datasets 4.8.5 y Tokenizers 0.23.3. No se documenta el volumen de tokens, la composición del dataset, ni si hubo RLHF/DPO (no aplicable en un modelo discriminativo de este tipo).

## Capacidades

- Clasificación de secuencias de texto (una etiqueta por entrada) mediante la pipeline `text-classification` de Transformers.
- Inferencia rápida y determinista: no genera texto, por lo que no produce alucinaciones en el sentido generativo.
- Acepta batching (el autor usó batch de evaluación 32) y puede exportarse a ONNX para servir a gran escala.
- Capacidades multilingües: no documentadas; el modelo base está entrenado en inglés y el nombre incluye "tass", posible referencia al certamen TASS de análisis de sentimiento en español, pero la model card no lo confirma.
- Tool calling / function calling: no soportado (no es un modelo instruct ni generativo).
- Agentes y razonamiento multi-paso: no soportado.
- Capacidades especiales (modo thinking, visión, audio): no disponibles.

## Casos de uso

- Clasificación de sentimiento en textos cortos (tuits, reseñas, comentarios): encaja con la arquitectura y con el posible origen "tass" del ajuste, pero las métricas declaradas (F1 macro 0,1878) hacen imprescindible una validación propia antes de usarlo en producción.
- Enrutamiento de tickets de soporte por categoría: se usaría como clasificador de una sola etiqueta para dirigir cada incidencia al equipo correspondiente; el coste de inferencia es bajo (361 M de parámetros) y permite procesar colas grandes en CPU o en una GPU pequeña.
- Triaje de moderación de contenido: primera pasada para separar textos potencialmente problemáticos de los claramente inocuos, dejando la decisión final a un revisor humano o a un modelo mayor.
- Etiquetado asistido de datasets: preanotar corpus con una etiqueta por documento y corregir manualmente, siempre que se mida previamente la calidad por clase.
- Clasificación de respuestas abiertas en encuestas (NPS, CSAT): asignar categorías temáticas a comentarios libres en lotes grandes, con umbral de confianza para derivar los casos dudosos a revisión.
- Baseline reproducible en experimentación: sirve para comparar contra otros encoders (RoBERTa, DeBERTa, BERT) en la misma tarea, dado que los hiperparámetros y la semilla están documentados.
- Filtrado previo en pipelines de datos a gran escala: descartar documentos que no pertenecen a una categoría de interés antes de pasarlos a un modelo generativo más caro.

## Benchmarks y rendimiento

El `model-index` del autor no contiene resultados (`results: []`). No se han publicado resultados de benchmarks estándar (MMLU, GLUE, HumanEval, GSM8K, etc.) en la información disponible. Los únicos datos son las métricas de evaluación del propio ajuste fino, declaradas por el autor:

| Métrica | Valor |
|---|---|
| Loss (evaluación) | 1,0908 |
| F1 macro | 0,1878 |
| F1 ponderado | 0,2211 |
| Accuracy | 0,3923 |

Evolución durante el entrenamiento (según la model card):

| Época | Paso | Validation loss | F1 macro | F1 ponderado | Accuracy |
|---|---|---|---|---|---|
| 1.0 | 241 | 1,0906 | 0,1878 | 0,2211 | 0,3923 |
| 2.0 | 482 | 1,0932 | 0,1878 | 0,2211 | 0,3923 |
| 3.0 | 723 | 1,0904 | 0,1878 | 0,2211 | 0,3923 |
| 4.0 | 964 | 1,0914 | 0,1878 | 0,2211 | 0,3923 |
| 5.0 | 1205 | 1,0914 | 0,1878 | 0,2211 | 0,3923 |
| 6.0 | 1446 | 1,0908 | 0,1878 | 0,2211 | 0,3923 |

La invariancia exacta de las métricas entre épocas es una señal de alarma: sugiere que el modelo predice siempre la misma clase (o que la evaluación se ejecutó sobre un checkpoint congelado). No se dispone de comparación con otros modelos en la misma tarea.

## Requisitos de hardware

- VRAM estimada para inferencia: alrededor de 1,5 GB en FP32 para los pesos (361 M de parámetros), en torno a 0,75 GB en FP16/BF16 y 0,4 GB en INT8. Con activaciones y batching (32 secuencias de hasta 512 tokens), el consumo realista se sitúa en el rango de 2 a 4 GB.
- GPU recomendadas: cualquier GPU con 4 GB o más de VRAM es suficiente. Para servir con alto throughput, A100/H100 o L4/L40S permiten batching agresivo; una RTX 4090 o RTX 3090 es más que suficiente para uso intensivo en un solo nodo.
- Cabe en GPU de consumo: sí, en RTX 3060 12 GB, RTX 4060 Ti, RTX 4070, RTX 4090 y equivalentes; también en CPU para volúmenes moderados.
- Opciones de despliegue: pipeline `text-classification` de Transformers, exportación a ONNX Runtime para inferencia en CPU, TorchServe o un servicio FastAPI con batching dinámico. vLLM y TGI no están orientados a este tipo de cabezal de clasificación XLNet; llama.cpp/Ollama no aplican al no existir pesos GGUF publicados.
- Latencia y throughput: no se han publicado mediciones. Por tamaño de modelo se espera latencia de milisegundos por lote en GPU moderna, pero es una estimación, no un dato medido.
- Nota: el repositorio de 56,4 GB incluye previsiblemente checkpoints y estados del optimizador, no solo los pesos finales; para descarga conviene limitarse a los archivos safetensors necesarios.

## Comparativa con modelos similares

Datos de referencia de los modelos comparados tomados de sus repositorios públicos; conviene verificarlos antes de tomar decisiones.

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (XLNet-large fine-tuned) | 361,3 M | 512 (arquitectura XLNet; no confirmado en la card) | Clasificación de texto | MIT | HuggingFace, 0 descargas, métricas pobres |
| xlnet/xlnet-large-cased (base) | ~340 M | 512 | Modelo de representaciones (no clasificador) | MIT (según repositorio original) | HuggingFace, ampliamente usado |
| FacebookAI/roberta-large | ~355 M | 512 | Representaciones / clasificación con cabezal | MIT | HuggingFace, muy usado |
| microsoft/deberta-v3-large | ~435 M | 512 | Representaciones / clasificación con cabezal | MIT | HuggingFace, estado del arte en GLUE para su tamaño |

Frente a RoBERTa-large o DeBERTa-v3-large, este ajuste fino no aporta ninguna ventaja documentada: no hay dataset descrito, no hay comparación de rendimiento y las métricas absolutas son muy bajas. Su única ventaja relativa es la licencia MIT y un tamaño que cabe en cualquier GPU.

## Limitaciones y advertencias

- Rendimiento declarado muy bajo: accuracy 0,3923 y F1 macro 0,1878. Con métricas planas durante todo el entrenamiento, el modelo parece no haber aprendido señal discriminativa; no debe usarse sin una evaluación propia.
- Dataset de entrenamiento desconocido: la model card indica "unknown dataset" y no especifica número de clases, distribución, idioma ni procedencia de los datos. Es imposible evaluar sesgos o cobertura.
- Idiomas no documentados: el modelo base es de inglés; el uso con textos en español (u otras lenguas) no está validado.
- No es un modelo generativo: no admite prompts conversacionales, tool calling ni razonamiento multi-paso. Intentar usarlo como asistente producirá salidas sin sentido.
- Riesgo de alucinación: no aplica en sentido generativo, pero sí existe riesgo de predicciones erróneas presentadas con alta confianza si no se calibra el umbral de decisión.
- Sesgos: no documentados. Al desconocerse el corpus, no se puede descartar sesgo de clase mayoritaria; de hecho, las métricas sugieren precisamente un colapso hacia la clase dominante.
- Licencia MIT: permite uso comercial y modificación, pero el autor no ofrece garantías ni soporte; el modelo se distribuye "tal cual".
- Tamaño del repositorio (56,4 GB) desproporcionado para 361 M de parámetros: revisar qué artefactos se descargan y evitar espejos innecesarios.
- Sin validación comunitaria: 0 descargas y 0 likes en el momento de la consulta; no hay informes independientes de calidad.
- Considerar XLNet como arquitectura heredada: la investigación reciente se centra en encoders tipo RoBERTa/DeBERTa y en modelos generativos, por lo que el ecosistema de herramientas optimizadas para XLNet es más limitado.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/MayorChris/xlnet-large-cased-batch16-tass-finetuned-2026
- Modelo base: https://huggingface.co/xlnet/xlnet-large-cased
- Paper de XLNet (Yang et al., 2019): https://arxiv.org/abs/1906.08237
- Documentación de XLNet en Transformers: https://huggingface.co/docs/transformers/model_doc/xlnet
