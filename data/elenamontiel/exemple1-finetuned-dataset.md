# elenamontiel/exemple1-finetuned-dataset

## Resumen

`exemple1-finetuned-dataset` es un modelo de clasificación de texto obtenido mediante fine-tuning supervisado del checkpoint `projecte-aina/roberta-base-ca-v2`, un RoBERTa base entrenado específicamente para catalán por el Projecte AINA. El autor, elenamontiel, lo ha ajustado sobre el dataset `dair-ai/emotion`, un corpus de clasificación de emociones en inglés con seis etiquetas (tristeza, alegría, amor, enfado, miedo y sorpresa). El resultado es un modelo de 124,65 millones de parámetros con licencia Apache 2.0 y pesos en safetensors.

El modelo es relevante como ejemplo reproducible de fine-tuning de un encoder catalán sobre una tarea downstream concreta, y como punto de partida para experimentos de clasificación de emociones en entornos con recursos limitados: su tamaño (1,5 GB de repositorio) permite inferencia en CPU y en GPUs de consumo. No obstante, conviene subrayar que la model card está generada automáticamente por el Trainer de Hugging Face y no documenta usos previstos, limitaciones ni composición del conjunto de evaluación.

La información pública es escasa: no se declaran idiomas soportados, no hay resultados de benchmarks en el model-index y la única métrica disponible es la validación reportada durante el entrenamiento (accuracy 0,5962 y F1 0,5178 tras una época). Cualquier evaluación adicional debe realizarse por cuenta del usuario.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | RoBERTa (transformer encoder, base) |
| Parámetros totales | 124.653.325 |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (RoBERTa base admite hasta 512 tokens; no confirmado en la model card) |
| Tipos de cuantización | no disponible (pesos en safetensors; compatible con cuantización dinámica estándar de PyTorch, no documentada por el autor) |
| Idiomas soportados | no disponible (modelo base entrenado en catalán; dataset de fine-tuning en inglés) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura es un encoder transformer de tipo RoBERTa en configuración base, heredada de `projecte-aina/roberta-base-ca-v2`. Sobre esa base se ha aplicado una cabeza de clasificación de secuencias (`text-classification`) con seis clases correspondientes a las emociones del dataset `dair-ai/emotion`. El fine-tuning se realizó con el `Trainer` de Transformers durante una única época, con learning rate 2e-5, batch size de 64 (entrenamiento y evaluación), semilla 42, optimizador AdamW con betas (0,9; 0,999) y epsilon 1e-8, y scheduler lineal. El entrenamiento se detuvo en el paso 155.

No se documenta el número de tokens de entrenamiento, la composición exacta del dataset más allá de su nombre, ni si se aplicaron técnicas de aumento de datos o regularización adicionales. Tampoco hay información sobre RLHF, DPO ni innovaciones arquitectónicas: se trata de un fine-tuning estándar de clasificación. Las versiones de framework declaradas son Transformers 5.22.1, PyTorch 2.14.1+cu130, Datasets 2.21.0 y Tokenizers 0.23.3.

## Capacidades

- Clasificación de texto en seis categorías de emoción (tristeza, alegría, amor, enfado, miedo, sorpresa), según el esquema del dataset `dair-ai/emotion`.
- Inferencia sobre secuencias cortas o medias de texto, propia de un encoder RoBERTa.
- Ejecución en CPU y GPU de consumo gracias a su tamaño contenido (124,65 M de parámetros).
- Integración directa con la librería `transformers` mediante `pipeline("text-classification")`.
- No soporta generación de texto, tool calling, function calling, razonamiento multi-paso, agentes, visión, audio ni modo thinking: es un modelo discriminativo, no generativo.
- Capacidad multilingüe: no documentada. El modelo base está entrenado en catalán y el fine-tuning se hizo sobre un corpus en inglés, por lo que el comportamiento en castellano u otros idiomas no está garantizado.
- Compatible con endpoints de Hugging Face (tag `endpoints_compatible`).

## Casos de uso

- Clasificación de emociones en reseñas o comentarios: el modelo puede etiquetar textos breves en una de las seis emociones del dataset de origen, útil para análisis de sentimiento granular en paneles de opinión, siempre que el dominio y el idioma coincidan con los del entrenamiento.
- Moderación de contenido asistida: como señal auxiliar para detectar enfado o tristeza en mensajes de usuario y priorizar la revisión humana en comunidades online.
- Prototipado rápido de pipelines de NLP: al ser un modelo pequeño y con licencia permisiva, sirve para validar arquitecturas de clasificación antes de invertir en modelos mayores.
- Investigación académica sobre fine-tuning de encoders catalanes: el checkpoint permite reproducir el experimento y comparar el efecto de ajustar un modelo catalán sobre un corpus inglés.
- Enrutamiento de tickets de soporte: clasificar el tono emocional de una consulta entrante para derivarla a un equipo u otro, con la cautela de que las métricas reportadas son moderadas.
- Extracción de señales en encuestas abiertas: procesar respuestas de texto libre y agregar la distribución emocional por segmento de usuarios.
- Despliegue en entornos con recursos limitados: inferencia en CPU o en GPUs de gama baja para tareas de clasificación por lotes.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (validación durante el entrenamiento):

| Métrica | Valor |
|---|---|
| Validation loss | 1,9680 |
| Accuracy | 0,5962 |
| F1 | 0,5178 |
| Época | 1,0 |
| Paso | 155 |

El model-index no contiene resultados adicionales (lista vacía). No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP32: en torno a 0,5 GB de pesos (124,65 M de parámetros × 4 bytes) más activaciones; cabe holgadamente en cualquier GPU con 2 GB o más.
- VRAM estimada en FP16: aproximadamente 0,25 GB de pesos.
- GPU recomendadas: no requiere GPU dedicada; funciona en CPU. Para lotes grandes, cualquier GPU moderna (T4, L4, RTX 3060 en adelante) es suficiente.
- Cabe en GPU de consumo: sí, en cualquier RTX o GTX con suficiente memoria (prácticamente todas).
- Opciones de despliegue: `transformers` con `pipeline`, TorchServe, FastAPI con PyTorch, ONNX Runtime, o exportación a GGUF/llama.cpp no documentada por el autor. vLLM y TGI no están orientados a encoders de clasificación de este tamaño, aunque TGI podría servir el modelo.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| exemple1-finetuned-dataset | 124,65 M | no disponible (RoBERTa base: 512 tokens) | Clasificación de emociones (6 clases) | Apache 2.0 | Hugging Face |
| projecte-aina/roberta-base-ca-v2 | ~125 M (base) | 512 tokens (RoBERTa base) | Modelo base de lenguaje (catalán) | no disponible en esta ficha | Hugging Face |
| roberta-base (Facebook) | 125 M | 512 tokens | Modelo base de lenguaje (inglés) | MIT | Hugging Face |

La comparación se limita a modelos de la misma familia y tamaño, ya que no se dispone de datos de rendimiento de alternativas específicas de clasificación de emociones en la información proporcionada.

## Limitaciones y advertencias

- Métricas moderadas: accuracy de 0,5962 y F1 de 0,5178 en validación tras una sola época; el rendimiento en producción puede ser inferior.
- Desajuste de idioma: el modelo base está entrenado en catalán y el fine-tuning se realizó sobre un corpus en inglés (`dair-ai/emotion`); el comportamiento en catalán, castellano u otros idiomas no está documentado.
- Model card incompleta: las secciones de descripción, usos previstos, datos de entrenamiento y limitaciones contienen "More information needed".
- Riesgo de alucinación: no aplica en sentido generativo, pero sí existe riesgo de clasificaciones erróneas o sobreconfiadas en textos fuera de distribución.
- Sesgos: no documentados por el autor; el dataset de origen puede introducir sesgos demográficos y de dominio.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero el usuario debe verificar las condiciones del dataset `dair-ai/emotion` y del modelo base.
- Sin garantías de soporte ni mantenimiento: el repositorio tiene 0 likes y 55 descargas, lo que sugiere un uso muy limitado y poca validación comunitaria.
- No apto para tareas generativas, de razonamiento o multimodales.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/elenamontiel/exemple1-finetuned-dataset
- Modelo base: https://huggingface.co/projecte-aina/roberta-base-ca-v2
- Dataset de fine-tuning: https://huggingface.co/datasets/dair-ai/emotion
- Documentación de Transformers (pipeline de clasificación de texto): https://huggingface.co/docs/transformers/main_classes/pipelines#transformers.TextClassificationPipeline
