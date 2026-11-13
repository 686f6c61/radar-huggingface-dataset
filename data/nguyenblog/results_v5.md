# nguyenblog/results_v5

## Resumen

`nguyenblog/results_v5` es un modelo de clasificación de texto obtenido mediante ajuste fino (fine-tuning) de `vinai/phobert-base`, un transformer encoder basado en RoBERTa entrenado específicamente para vietnamita. El autor, identificado como `nguyenblog`, lo publica con licencia MIT y lo genera con la librería `transformers` usando el `Trainer` estándar. El modelo resuelve una tarea de clasificación de texto no especificada en la model card: el dataset de entrenamiento aparece como `None` y la descripción del modelo y de los datos no está rellenada.

Se trata de un artefacto de investigación de pequeño tamaño: 135.000.579 parámetros (unos 135 M) y un repositorio de 0,5 GB en formato safetensors. La relevancia es limitada fuera de su contexto original, ya que no se documentan ni la tarea concreta, ni el etiquetado, ni el idioma de los datos de entrenamiento, ni los casos de uso previstos. Aun así, los resultados declarados en el conjunto de evaluación (accuracy 0,7354 y F1 0,7342) permiten situarlo como un clasificador de dificultad moderada.

El modelo se publica con fecha de creación del 13 de noviembre de 2026 y no registra descargas ni likes en el momento de redactar esta ficha. Su interés principal es como ejemplo de fine-tuning de PhoBERT para clasificación, no como componente listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder tipo RoBERTa (base: `vinai/phobert-base`) |
| Parametros totales | 135.000.579 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (PhoBERT-base usa habitualmente 256 tokens, pero no se confirma en la model card) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (el modelo base PhoBERT esta orientado a vietnamita, pero la model card no lo declara) |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un fine-tuning de `vinai/phobert-base`, un transformer encoder de tipo RoBERTa adaptado al vietnamita. La arquitectura resultante conserva la pila de atención bidireccional del modelo base y añade una cabeza de clasificación de secuencia (sequence classification) sobre la representación del token especial. No se documenta ninguna innovación arquitectónica adicional: es un ajuste estándar con `Trainer`.

El entrenamiento se realizó durante 10 épocas con un learning rate de 2e-05, batch size de 16 (tanto en entrenamiento como en evaluación), semilla 42, optimizador AdamW con betas (0,9; 0,999) y epsilon 1e-08, scheduler lineal y precisión mixta nativa (AMP). El conjunto de datos no se identifica ("None dataset") y no se detalla su composición, número de tokens ni si hubo técnicas de alineación como RLHF o DPO. La evolución del entrenamiento muestra un sobreajuste claro: la pérdida de validación baja hasta 0,8567 en la época 5 y vuelve a subir hasta 1,0542 en la época 8, mientras la accuracy de validación mejora de forma irregular hasta 0,7354 en la época 10.

## Capacidades

- Clasificación de texto: el pipeline declarado es `text-classification`, con salida de etiquetas y puntuaciones sobre una secuencia de entrada.
- Fine-tuning supervisado sobre PhoBERT: hereda la tokenización y el vocabulario del modelo base vietnamita.
- No se documentan capacidades de generación de texto, razonamiento, código, matemáticas ni visión.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- Capacidades multilingües: no disponibles en la información proporcionada; el modelo base está orientado al vietnamita, pero la model card no declara idiomas.
- No se documentan modos especiales (thinking mode, audio, etc.).

## Casos de uso

- Clasificación de documentos en vietnamita: si el conjunto de entrenamiento original era vietnamita (coherente con el modelo base PhoBERT), podría usarse para etiquetar reseñas, noticias o tickets, aunque la tarea concreta no está documentada y habría que validarla empíricamente.
- Prototipado rápido de clasificadores: por su tamaño (135 M de parámetros) y su licencia MIT, sirve como punto de partida para experimentos de fine-tuning en entornos con recursos limitados.
- Baseline en investigación: útil como referencia de accuracy y F1 (0,7354 y 0,7342) para comparar con otros ajustes sobre PhoBERT.
- Extracción de señales en pipelines de NLP: integrable como etapa de clasificación dentro de un pipeline mayor mediante `transformers` o `text-classification` en la Inference API.
- Evaluación de sobreajuste: el historial de entrenamiento permite estudiar el comportamiento de PhoBERT con pocas épocas y learning rates bajos.
- Docencia y reproducción: sirve como ejemplo reproducible de fine-tuning con `Trainer` y precisión mixta AMP.

## Benchmarks y rendimiento

Resultados declarados por el autor en el conjunto de evaluación (model-index sin entradas; los datos provienen de la tabla de entrenamiento de la model card):

| Metrica | Valor |
|---|---|
| Loss (evaluacion) | 0,9704 |
| Accuracy | 0,7354 |
| F1 | 0,7342 |

Evolución por época (validación):

| Epoca | Step | Validation loss | Accuracy | F1 |
|---|---|---|---|---|
| 1 | 56 | 0,9918 | 0,5605 | 0,5758 |
| 2 | 112 | 0,9572 | 0,6368 | 0,6227 |
| 3 | 168 | 0,9271 | 0,6009 | 0,6131 |
| 4 | 224 | 0,9041 | 0,6054 | 0,6211 |
| 5 | 280 | 0,8567 | 0,6951 | 0,6980 |
| 6 | 336 | 0,8839 | 0,6726 | 0,6816 |
| 7 | 392 | 0,9662 | 0,7175 | 0,7139 |
| 8 | 448 | 1,0542 | 0,7309 | 0,7159 |
| 9 | 504 | 1,0043 | 0,7265 | 0,7193 |
| 10 | 560 | 0,9704 | 0,7354 | 0,7342 |

No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K, etc.) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo tiene 135 M de parámetros; en fp32 ocupa aproximadamente 540 MB de pesos, y en fp16 unos 270 MB. Con overhead de activaciones y tokenizador, cabe holgadamente en menos de 2 GB de VRAM.
- GPU recomendadas: cualquier GPU consumer moderna es suficiente (RTX 3060, RTX 4060, RTX 4090); también funciona en CPU para inferencia por lotes pequeños.
- Cabe en GPU consumer: sí, en cualquier GPU con al menos 2-4 GB de VRAM, e incluso en iGPU y CPU.
- Opciones de despliegue: `transformers` (pipeline `text-classification`), Inferencia compatible con endpoints (`endpoints_compatible` en los tags), y exportación a ONNX o TorchScript si se requiere optimización; no se documenta soporte específico de vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `nguyenblog/results_v5` | 135 M | no disponible | Clasificacion de texto | MIT | Hugging Face |
| `vinai/phobert-base` | ~135 M | no disponible | Modelo base (encoder vietnamita) | MIT | Hugging Face |
| `FacebookAI/roberta-base` | ~125 M | 512 tokens | Modelo base (encoder ingles) | MIT | Hugging Face |
| `distilbert-base-uncased` | ~66 M | 512 tokens | Modelo base (encoder ingles) | Apache-2.0 | Hugging Face |

La comparación directa de rendimiento no es posible: `results_v5` no publica métricas frente a alternativas y su tarea concreta no está identificada. Frente a `vinai/phobert-base`, la diferencia es que este último es un modelo base sin cabeza de clasificación, mientras que `results_v5` añade una cabeza entrenada para una tarea no documentada.

## Limitaciones y advertencias

- La model card no documenta la tarea, el dataset ni las etiquetas: el modelo no es reutilizable de forma fiable sin información adicional del autor.
- El dataset de entrenamiento aparece como "None" y la descripción del modelo indica "More information needed".
- Sobreajuste evidente: la pérdida de validación repunta a partir de la época 5 y la accuracy mejora de forma irregular; conviene revisar el checkpoint final frente a checkpoints intermedios.
- Riesgo de alucinación: no aplica directamente a clasificación, pero sí riesgo de clasificaciones erróneas fuera de la distribución de entrenamiento.
- Sesgos conocidos: no documentados; al entrenar sobre un dataset no identificado, los sesgos del corpus son desconocidos.
- Limitaciones de idioma: no declaradas; el modelo base PhoBERT está orientado al vietnamita, pero no se confirma que el fine-tuning se haya hecho en ese idioma.
- Licencia MIT: permite uso comercial y modificación, pero el autor no ofrece garantías ni documentación de procedencia de los datos.
- Sin descargas ni validación comunitaria: no hay evidencia externa de su calidad más allá de las métricas declaradas por el autor.
- Para producción, se recomienda validar el modelo en un conjunto propio y comprobar la compatibilidad del tokenizador con el idioma de destino.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/nguyenblog/results_v5
- Modelo base: https://huggingface.co/vinai/phobert-base
- Documentación de PhoBERT (paper): https://arxiv.org/abs/2003.00744
- Librería transformers: https://huggingface.co/docs/transformers
- Pipeline de clasificación de texto: https://huggingface.co/docs/transformers/main_classes/pipelines#transformers.TextClassificationPipeline
