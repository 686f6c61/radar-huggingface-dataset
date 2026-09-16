# Iltaf/sst2-lora-distilbert

## Resumen

Este repositorio contiene un adaptador LoRA (Low-Rank Adaptation) para clasificación binaria de sentimiento en inglés, publicado por el usuario Iltaf y entrenado sobre un subconjunto de SST-2. El adaptador se monta sobre `distilbert-base-uncased-finetuned-sst-2-english`, un checkpoint de DistilBERT (encoder de 6 capas, aproximadamente 66 M de parámetros) que HuggingFace ya había ajustado previamente sobre la totalidad de SST-2. No es, por tanto, un modelo completo ni un ajuste desde cero, sino un delta de bajo rango sobre un clasificador ya competente.

El interés del repositorio no reside en su rendimiento, sino en su honestidad metodológica: la propia model card documenta un resultado negativo. El adaptador no mejora al checkpoint congelado; sobre el conjunto de test (72 filas) y sobre la validación completa de SST-2 (872 filas) las predicciones son idénticas, y en el subconjunto de validación de 800 filas empeora 0,50 puntos de accuracy y de macro-F1. La pérdida de entrenamiento baja de 0,0505 a 0,0368 mientras la de validación no mejora, firma típica de sobreajuste leve cuando el modelo base ya está saturado en la tarea.

Es relevante ahora como ejemplo reproducible y transparente del flujo baseline, entrenamiento, medición y reporte, ejecutado íntegramente en hardware gratuito (Google Colab T4) en unos 36 segundos. También sirve como recordatorio práctico de que un adaptador LoRA no aporta valor automáticamente cuando el margen de mejora sobre el modelo base es mínimo.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer encoder (DistilBERT: 6 capas, hidden 768, 12 cabezas) con adaptador LoRA acoplado |
| Parámetros totales | ≈66 M en el modelo base (DistilBERT) más el adaptador; el repositorio ocupa menos de 0,1 GB |
| Parámetros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | 512 tokens (límite posicional del encoder DistilBERT base) |
| Tipos de cuantización | No disponible (la model card no documenta cuantización; el adaptador se publica en precisión estándar) |
| Idiomas soportados | Inglés (SST-2 es un corpus en inglés; la model card no declara cobertura multilingüe) |
| Licencia | No disponible |
| Formato de pesos | safetensors, formato de adaptador PEFT/LoRA (librería `peft`) |

Detalle de la configuración LoRA declarada por el autor: `r=8`, `alpha=16`, `dropout=0.05`, módulos objetivo `q_lin` y `v_lin`, y cabezas `classifier` y `pre_classifier` incluidas en `modules_to_save`. Estimación propia de componentes entrenables a partir de esa configuración: unos 147 K parámetros en las matrices LoRA (6 capas × 2 módulos × 2 matrices de 8×768) y unos 592 K en las cabezas guardadas, en total del orden de 0,74 M de parámetros entrenables.

## Arquitectura y entrenamiento

La base es DistilBERT, un transformer encoder destilado de BERT con 6 capas, dimensión oculta 768 y 12 cabezas de atención, al que se le añade una cabeza de clasificación de secuencia para dos etiquetas (positivo/negativo). Sobre ese checkpoint se entrena un adaptador LoRA de rango 8 aplicado a las proyecciones de query y value de cada capa, con las cabezas de clasificación (`pre_classifier` y `classifier`) incluidas en `modules_to_save`, es decir, entrenadas también como módulos completos. El adaptador no modifica la arquitectura del modelo subyacente.

Los datos de entrenamiento son 8.000 filas muestreadas de `nyu-mll/glue`, configuración `sst2`, con semilla `SEED=42`; esto representa aproximadamente el 12 % del conjunto de entrenamiento de SST-2. No se aplicó RLHF ni DPO; es aprendizaje supervisado con entropía cruzada. La configuración fue de 3 épocas, batch 32, learning rate 2e-4 y precisión fp16, con 750 pasos totales y un tiempo de entrenamiento de aproximadamente 36 segundos en una T4 (unas 24.000 muestras procesadas, del orden de 667 muestras por segundo). El checkpoint final se seleccionó con `load_best_model_at_end=True` según macro-F1 de validación, lo que resultó en el epoch 1. No hubo búsqueda de hiperparámetros: los valores son predeterminados estándar.

La innovación técnica relevante aquí es metodológica más que algorítmica: evaluación con código, tokenizador, collator y particiones idénticos para el baseline y para el modelo entrenado, de modo que la única variable sea el peso del adaptador. El resultado honesto es que no hay mejora, y la model card lo explicita como resultado negativo intencionado del ejercicio.

## Capacidades

- Clasificación binaria de sentimiento (positivo/negativo) en inglés, sobre textos de hasta 512 tokens.
- Inferencia con cabezas de clasificación de secuencia (`AutoModelForSequenceClassification` + `PeftModel`), devolviendo logits de dos clases.
- Compatible con el ecosistema PEFT: carga y descarga de adaptadores, fusión con `merge_and_unload` para exportar pesos combinados.
- Evaluación con métricas de accuracy y F1 macro sobre GLUE/SST-2.
- No dispone de tool calling ni function calling.
- No dispone de capacidades de agente ni de razonamiento multi-paso.
- No dispone de modo de pensamiento, visión, audio ni generación de texto libre.
- Multilingüismo: no soportado; el tokenizador y los datos son exclusivamente en inglés.
- Capacidad generativa: nula por diseño, es un modelo de clasificación.

## Casos de uso

- Análisis de reseñas de producto en inglés: el modelo clasifica cada reseña como positiva o negativa para alimentar paneles de satisfacción; es adecuado por su bajo coste computacional, aunque conviene usar el checkpoint base directamente dado que el adaptador no aporta mejora medible.
- Monitorización de redes sociales en inglés: puntuación de sentimiento por lotes sobre miles de publicaciones, ejecutable en CPU o en una GPU de gama baja.
- Triaje de tickets de soporte: clasificación previa de la queja como positiva o negativa para enrutar casos críticos; el límite de 512 tokens es suficiente para la mayoría de tickets.
- Etiquetado asistido y pseudo-etiquetado de corpus en inglés: el modelo puede preanotar grandes volúmenes de texto para revisión humana posterior, dado su reducido coste de inferencia.
- Extracción de señales de sentimiento en pipelines de analítica: integración como etapa de un flujo de procesamiento de datos con `transformers` o exportándolo a ONNX.
- Material didáctico y de formación: reproducción completa del ejercicio baseline, entrenamiento, medición y reporte en una T4 gratuita en menos de un minuto, útil para enseñar PEFT y evaluación rigurosa.
- Referencia de control en experimentos de fine-tuning: sirve como adaptador de comparación frente a otros ajustes sobre el mismo base, especialmente para estudiar sobreajuste con subconjuntos pequeños.
- No recomendado como componente crítico de producción en inglés sin antes verificar contra el checkpoint base, ya que las métricas son idénticas o ligeramente peores.

## Benchmarks y rendimiento

Datos publicados en la model card, con evaluación idéntica para el baseline (checkpoint base congelado) y el modelo con adaptador:

| Split | n | Accuracy baseline | Accuracy con adaptador | Delta accuracy | F1 baseline | F1 con adaptador | Delta F1 |
|---|---|---|---|---|---|---|---|
| test | 72 | 0,9028 | 0,9028 | +0,0000 | 0,9019 | 0,9019 | +0,0000 |
| val (en entrenamiento) | 800 | 0,9113 | 0,9062 | -0,0050 | 0,9112 | 0,9061 | -0,0050 |
| SST-2 val completo | 872 | 0,9060 | 0,9060 | +0,0000 | 0,9058 | 0,9058 | +0,0000 |

Curva de entrenamiento reportada:

| Época | Pérdida de entrenamiento | Pérdida de validación | Accuracy de validación | F1 de validación |
|---|---|---|---|---|
| 1 | 0,0505 | 0,3336 | 0,9063 | 0,9061 |
| 2 | 0,0380 | 0,3589 | 0,9050 | 0,9049 |
| 3 | 0,0368 | 0,3361 | 0,9038 | 0,9036 |

Conclusión reportada por el autor: el adaptador no mejora al checkpoint base y empeora 0,50 puntos en el subconjunto de validación de 800 filas. No hay resultados de MMLU, HumanEval, GSM8K ni de otros benchmarks en la información disponible, ni comparaciones con terceros modelos medidas por el autor.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 264 MB de pesos en fp32 y unos 132 MB en fp16 para los 66 M de parámetros del modelo base, más el adaptador (menos de 20 MB) y el espacio de activaciones; en la práctica, por debajo de 1 GB para lotes pequeños.
- GPU recomendadas: cualquiera con al menos 2 GB de VRAM es suficiente; el autor entrenó en una NVIDIA T4 de 15 GB en Google Colab. No requiere A100, H100 ni similares.
- Compatible con GPU de consumo: sí, en cualquier GPU de consumo moderna (RTX 3060, RTX 4090, GTX 1650 o inferiores) e incluso en CPU.
- Opciones de despliegue: `transformers` junto con `peft` (`PeftModel.from_pretrained`), fusión de pesos con `merge_and_unload` para exportar un modelo estándar, exportación a ONNX mediante Optimum, y despliegue en CPU con PyTorch o con runtime ONNX. vLLM y TGI están orientados a generación y no cubren de forma estándar la clasificación de secuencia con adaptadores LoRA.
- Latencia y throughput: no se documenta latencia de inferencia. El único dato de rendimiento disponible es el entrenamiento: 750 pasos con batch 32 (24.000 muestras en 3 épocas) en aproximadamente 36 segundos sobre una T4 con fp16, del orden de 667 muestras por segundo en fase de entrenamiento.
- Almacenamiento: el repositorio del adaptador ocupa menos de 0,1 GB.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | SST-2 val (872) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Iltaf/sst2-lora-distilbert (este adaptador) | ≈66 M base + ≈0,74 M entrenables (estimado) | 512 tokens | 0,9060 accuracy / 0,9058 F1 | No disponible | HuggingFace, librería `peft` |
| distilbert-base-uncased-finetuned-sst-2-english (modelo base) | ≈66 M | 512 tokens | 0,9060 accuracy / 0,9058 F1 | Apache-2.0 según el repositorio del modelo base | HuggingFace, `transformers` |
| distilbert-base-uncased (sin ajustar) | ≈66 M | 512 tokens | No disponible (no tiene cabeza de clasificación de sentimiento) | Apache-2.0 según el repositorio del modelo base | HuggingFace, `transformers` |
| RoBERTa-base (familia comparable de encoder) | ≈125 M | 512 tokens | No disponible en la información proporcionada | MIT según el repositorio del modelo | HuggingFace, `transformers` |

La comparación cuantitativa con alternativas no puede completarse: la información proporcionada solo incluye métricas del checkpoint base y del adaptador, medidas con el mismo protocolo. Cualquier cifra de terceros modelos debería verificarse en sus propias model cards.

## Limitaciones y advertencias

- Resultado negativo documentado: el adaptador no mejora al modelo base y empeora 0,50 puntos en el subconjunto de validación de 800 filas. No hay justificación técnica para preferirlo frente al checkpoint original.
- Ruido estadístico elevado en el conjunto de test: solo 72 filas, de modo que una única predicción invertida supone ±1,39 % de accuracy. Cualquier cifra de test debe tratarse como orientativa.
- Conjunto de entrenamiento reducido: 8.000 filas, aproximadamente el 12 % de SST-2 train, limitación deliberada para ajustarse al hardware gratuito de Colab.
- Sobreajuste leve: la pérdida de entrenamiento desciende de 0,0505 a 0,0368 mientras la de validación no mejora, con la mejor época seleccionada en la primera vuelta.
- Sin búsqueda de hiperparámetros: `r=8`, `alpha=16`, learning rate 2e-4 y 3 épocas son valores predeterminados, no optimizados.
- Atribución del impacto poco limpia: al incluir `classifier` y `pre_classifier` en `modules_to_save`, parte del resultado proviene del reentrenamiento de las cabezas y no exclusivamente de las matrices LoRA de atención.
- Licencia no declarada: no hay información de licencia en el repositorio, por lo que no puede asumirse uso comercial sin consultar previamente al autor.
- Idioma y dominio limitados: solo inglés y solo texto; el tokenizador es el de DistilBERT uncased y la tarea es exclusivamente clasificación binaria de sentimiento.
- Ventana de contexto limitada a 512 tokens: no admite documentos largos sin truncado o segmentación previa.
- Riesgo de sesgo y de alucinación conceptual: al ser un clasificador, no genera texto, pero hereda los sesgos del corpus SST-2 (reseñas de cine en inglés) y puede mostrar un comportamiento poco fiable fuera de ese dominio.
- Idoneidad para producción no demostrada: sin evaluación en datos propios, sin tests de robustez y con métricas idénticas al base, no se recomienda como componente crítico sin una validación adicional.
- Reproducibilidad parcial: la model card menciona que el notebook, las semillas y la traza completa están disponibles bajo petición, no publicados en el repositorio.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Iltaf/sst2-lora-distilbert
- Modelo base: https://huggingface.co/distilbert-base-uncased-finetuned-sst-2-english
- DistilBERT base sin ajustar: https://huggingface.co/distilbert-base-uncased
- Dataset: https://huggingface.co/datasets/nyu-mll/glue
- Librería PEFT: https://huggingface.co/docs/peft
- Paper de DistilBERT (Sanh et al., 2019): https://arxiv.org/abs/1910.01108
- Paper de LoRA (Hu et al., 2021): https://arxiv.org/abs/2106.09685
- Paper de GLUE (Wang et al., 2018): https://arxiv.org/abs/1804.07461

Nota: la búsqueda web realizada no devolvió resultados relevantes sobre este modelo; únicamente aparecieron páginas de servicios de correo y tareas de Microsoft, sin relación con el repositorio. El resto de enlaces se derivan de los identificadores citados en la model card.
