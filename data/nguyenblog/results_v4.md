# nguyenblog/results_v4

## Resumen

`nguyenblog/results_v4` es un modelo de clasificación de texto obtenido mediante fine-tuning de `vinai/phobert-base`, un transformer encoder basado en RoBERTa entrenado específicamente para vietnamita. Lo publica el usuario `nguyenblog` en Hugging Face con licencia MIT y está pensado para una tarea de clasificación supervisada cuyo dataset de entrenamiento no se especifica en la model card ("None dataset").

El modelo tiene 135.000.579 parámetros y un tamaño de repositorio de 0,5 GB en formato safetensors. La model card es la generada automáticamente por el `Trainer` de Transformers y no ha sido completada por el autor: no hay descripción de la tarea, del dataset ni de los usos previstos. Los únicos datos concretos son los hiperparámetros de entrenamiento y las métricas de validación (accuracy 0,6502, F1 0,6266, loss 0,7976).

Su relevancia es limitada y muy acotada: se trata de un artefacto de experimentación más que de un modelo listo para producción. Resulta útil como referencia para quien quiera reproducir un fine-tuning de PhoBERT en clasificación de texto en vietnamita, pero la ausencia de documentación sobre la tarea y los datos hace imposible evaluar su idoneidad para un caso de uso concreto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (RoBERTa, base de PhoBERT) |
| Parametros totales | 135.000.579 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (PhoBERT-base admite hasta 256 tokens de entrada) |
| Tipos de cuantizacion | no disponible (pesos en safetensors sin versiones cuantizadas publicadas) |
| Idiomas soportados | no disponible en la model card; el modelo base PhoBERT esta orientado a vietnamita |
| Licencia | MIT |
| Formato de pesos | safetensors (libreria transformers) |

## Arquitectura y entrenamiento

El modelo es un fine-tuning completo de `vinai/phobert-base`, un transformer encoder de tipo RoBERTa con arquitectura base (12 capas, 768 dimensiones ocultas, 135M de parametros), preentrenado por VinAI Research sobre un corpus vietnamita de aproximadamente 20 GB de texto. Sobre esa base se ha realizado un ajuste supervisado para clasificacion de texto, aunque la model card no especifica la tarea, el numero de clases ni la composicion del dataset.

Los hiperparametros declarados son: learning rate 2e-5, batch size de entrenamiento y evaluacion de 16, 5 epocas, optimizador AdamW con betas (0,9; 0,999) y epsilon 1e-8, scheduler lineal, seed 42 y entrenamiento con AMP nativo. El numero de pasos registrados (280 en total, 56 por epoca) implica un conjunto de entrenamiento de aproximadamente 896 ejemplos, lo que sugiere un dataset pequeno. No se documenta ningun tipo de RLHF, DPO ni innovacion tecnica adicional; es un fine-tuning convencional con `Trainer`.

## Capacidades

- Clasificacion de texto supervisada: el pipeline declarado es `text-classification`, con una cabeza de clasificacion ajustada sobre PhoBERT-base.
- Procesamiento de vietnamita: hereda el tokenizador y el vocabulario de PhoBERT, disenados para ese idioma.
- Extraccion de representaciones contextuales: al ser un encoder, puede usarse como extractor de embeddings para clasificacion, similitud o clustering.
- No soporta generacion de texto, razonamiento, codigo ni matematicas: no es un modelo causal.
- No hay soporte declarado de tool calling ni function calling.
- No hay soporte declarado de agentes ni razonamiento multi-paso.
- No dispone de modo thinking, vision ni audio.
- Capacidades multilingues: no documentadas; el modelo base esta especializado en vietnamita.

## Casos de uso

- Clasificacion de resenas o comentarios en vietnamita: el modelo puede etiquetar sentimiento o categoria sobre textos cortos, siempre que la tarea coincida con la del fine-tuning original, que no se documenta.
- Moderacion de contenido en foros vietnamitas: util como clasificador binario o multiclase si se valida previamente contra el dominio objetivo.
- Etiquetado de tickets de soporte: permite asignar categorias a mensajes de usuario en vietnamita, aunque requiere reentrenamiento o validacion por la falta de informacion sobre las clases.
- Extraccion de embeddings para busqueda semantica: las representaciones del encoder pueden alimentar un indice vectorial para recuperacion de documentos en vietnamita.
- Baseline para experimentos academicos: sirve como punto de partida reproducible (seed 42, hiperparametros documentados) para comparar fine-tunings de PhoBERT.
- Prototipado rapido de clasificadores: al pesar 0,5 GB y ser un encoder base, se puede desplegar en una sola GPU consumer para pruebas de concepto.
- Filtrado previo en pipelines de datos: clasificacion de grandes volumenes de texto vietnamita antes de un procesamiento posterior mas costoso.

## Benchmarks y rendimiento

Los unicos resultados publicados son los de validacion durante el entrenamiento, declarados por el autor. No hay resultados en benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) ni comparaciones con otros modelos.

| Metrica | Valor (epoca 5, final) |
|---|---|
| Validation loss | 0,7976 |
| Accuracy | 0,6502 |
| F1 | 0,6266 |

Evolucion por epoca:

| Epoca | Step | Validation loss | Accuracy | F1 |
|---|---|---|---|---|
| 1 | 56 | 0,8786 | 0,6099 | 0,5343 |
| 2 | 112 | 0,8340 | 0,6009 | 0,5270 |
| 3 | 168 | 0,8262 | 0,6278 | 0,6111 |
| 4 | 224 | 0,8018 | 0,6323 | 0,6105 |
| 5 | 280 | 0,7976 | 0,6502 | 0,6266 |

No se han publicado resultados de benchmarks estandar en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP32: aproximadamente 0,55 GB solo para pesos, mas activaciones; en la practica cabe en cualquier GPU con 2 GB o mas.
- VRAM estimada en FP16/BF16: alrededor de 0,3 GB para pesos, con overhead minimo.
- GPU recomendadas: cualquier GPU moderna; una RTX 3060, RTX 4090, A100 o H100 lo ejecutan sin problema. Tambien es viable en CPU para lotes pequenos.
- Cabe en GPU consumer: si, en practicamente todas las GPU dedicadas actuales e incluso en iGPU con suficiente memoria compartida.
- Opciones de despliegue: `transformers` con pipeline `text-classification`, `optimum` para exportacion a ONNX, y servidores de inferencia compatibles con modelos encoder (por ejemplo, TorchServe o un endpoint de Hugging Face Inference Endpoints, dado el tag `endpoints_compatible`). No hay versiones GGUF publicadas, por lo que llama.cpp u Ollama no son opciones directas sin conversion.
- Latencia y throughput estimados: no disponibles; al ser un encoder de 135M de parametros, la latencia por peticion sera del orden de milisegundos en GPU, pero no se aportan mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| nguyenblog/results_v4 | 135M | no disponible | Clasificacion de texto (fine-tuned) | MIT | Hugging Face |
| vinai/phobert-base | 135M | 256 tokens | Modelo base encoder vietnamita | MIT | Hugging Face |
| vinai/phobert-large | 370M | 256 tokens | Modelo base encoder vietnamita | MIT | Hugging Face |
| FacebookAI/roberta-base | 125M | 512 tokens | Modelo base encoder multilingue/ingles | MIT | Hugging Face |

La comparativa se limita a modelos base porque no se dispone de resultados de benchmarks que permitan contrastar el rendimiento de `results_v4` frente a alternativas fine-tuned para la misma tarea. La ventaja de PhoBERT frente a RoBERTa en vietnamita es su tokenizador especifico y su preentrenamiento en ese idioma; la desventaja de `results_v4` es la falta de documentacion sobre la tarea para la que fue ajustado.

## Limitaciones y advertencias

- La model card no describe la tarea, el dataset ni las clases, por lo que no es posible saber que predice el modelo ni validar su comportamiento.
- El dataset de entrenamiento parece muy pequeno (unos 896 ejemplos segun los pasos registrados), lo que aumenta el riesgo de sobreajuste y de baja generalizacion.
- Accuracy de 0,6502 y F1 de 0,6266: rendimiento moderado que sugiere dificultad de la tarea o datos insuficientes; no es un modelo fiable para produccion sin validacion adicional.
- Sesgos conocidos: no documentados; al derivar de PhoBERT, hereda los sesgos del corpus vietnamita de preentrenamiento.
- Riesgo de alucinacion: no aplica en el sentido generativo, pero si puede producir clasificaciones erroneas con alta confianza en dominios distintos al de entrenamiento.
- Limitaciones de contexto e idioma: el contexto maximo no se documenta; PhoBERT-base admite 256 tokens, por lo que textos largos requieren truncamiento. El soporte multilingue no esta garantizado.
- Licencia MIT: permite uso comercial, pero el autor no ofrece garantias ni documentacion de soporte.
- Caveat importante para produccion: el tag `generated_from_trainer` y el aviso de la propia model card indican que no ha sido revisada por el autor; debe auditarse antes de cualquier despliegue.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/nguyenblog/results_v4
- Modelo base PhoBERT: https://huggingface.co/vinai/phobert-base
- Repositorio de PhoBERT (VinAI Research): https://github.com/VinAIResearch/PhoBERT
- Paper de PhoBERT: https://arxiv.org/abs/2003.00744
- Documentacion de Transformers (text-classification): https://huggingface.co/docs/transformers/tasks/sequence_classification
