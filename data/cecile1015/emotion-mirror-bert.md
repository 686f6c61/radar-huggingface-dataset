# Cecile1015/emotion-mirror-bert

## Resumen

Emotion Mirror BERT es un modelo de clasificación de texto en inglés desarrollado por Cecile1015 como proyecto final del curso CBS4702. Se trata de un ajuste fino (fine-tuning) completo de `google-bert/bert-base-uncased` sobre el conjunto de datos `dair-ai/emotion`, que contiene 16.000 textos de entrenamiento en inglés. El modelo clasifica textos cortos en seis emociones: tristeza, alegría, amor, enfado, miedo y sorpresa.

El problema que resuelve es la detección de emoción expresada en textos breves, típicamente mensajes de redes sociales o frases del estilo "i feel...". Con 109.486.854 parámetros y una arquitectura BERT base estándar, el modelo está pensado como una solución ligera y desplegable para tareas de análisis de sentimiento a nivel de emoción, no solo de polaridad positiva/negativa.

Su relevancia actual es limitada pero concreta: ofrece un punto de partida reproducible (semilla 42, hiperparámetros documentados, calibración por temperature scaling) para pipelines de clasificación emocional en inglés, con una licencia Apache 2.0 permisiva y un tamaño de repositorio de 0,4 GB que facilita su despliegue en infraestructura modesta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (BERT base, 12 capas, 768 dimensiones ocultas, 12 cabezas de atención) |
| Parametros totales | 109.486.854 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (arquitectura BERT base: 512 tokens) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de `bert-base-uncased`, un transformer encoder bidireccional de 12 capas con 768 dimensiones ocultas y 12 cabezas de atención. La cabeza de clasificación sigue el esquema `[CLS]` → pooler → dropout → capa lineal, con seis clases de salida correspondientes a las emociones del dataset. El ajuste fino es completo, no basado en adaptadores ni LoRA.

El entrenamiento se realizó sobre 16.000 textos de `dair-ai/emotion` con entropía cruzada ponderada por clase, optimizador AdamW, learning rate 5e-05 (seleccionado entre 2e-05, 3e-05 y 5e-05 según macro-F1 de validación), warm-up lineal del 10 %, batch size 32 y 4 épocas, con semilla 42. El checkpoint final se eligió por macro-F1 de validación en la época 3.0. Las probabilidades de salida están calibradas mediante temperature scaling con T = 1.320, valor almacenado en `training_info.json`; para obtener probabilidades calibradas debe aplicarse `softmax(logits / T)`.

## Capacidades

- Clasificación de texto corto en inglés en seis emociones: sadness, joy, love, anger, fear, surprise.
- Salida de logits y probabilidades por clase, con calibración por temperature scaling (T = 1.320).
- Detección de la emoción expresada en el texto, no del estado emocional real del autor.
- Procesamiento de frases breves del estilo "i feel ...", típicas de mensajes de Twitter.
- No soporta tool calling ni function calling.
- No está diseñado para razonamiento multi-paso ni para uso como agente.
- No dispone de modo thinking, visión ni audio.
- Capacidad multilingüe limitada al inglés.

## Casos de uso

- Análisis de sentimiento a nivel de emoción en redes sociales: el modelo clasifica mensajes cortos en inglés en seis categorías emocionales, adecuado para monitorización de opinión pública en Twitter y foros.
- Moderación de contenido asistida: detección de mensajes con carga emocional negativa (enfado, miedo, tristeza) para priorizar revisión humana en comunidades online.
- Investigación en psicología computacional: etiquetado automático de corpus de texto en inglés para estudios sobre expresión emocional, con la advertencia de que no es un instrumento clínico.
- Enrutamiento de tickets de soporte: clasificación de quejas o comentarios de clientes por emoción para dirigirlos al equipo adecuado o priorizar según urgencia percibida.
- Análisis de reseñas y feedback de producto: extracción de la emoción dominante en comentarios breves para complementar métricas de satisfacción tradicionales.
- Filtrado de datasets: preetiquetado de grandes volúmenes de texto en inglés por emoción antes de una revisión manual, aprovechando su tamaño reducido (0,4 GB) y su despliegue sencillo con `transformers`.
- Prototipado rápido en entornos con recursos limitados: al ser un BERT base de 109 M de parámetros, puede ejecutarse en CPU o en GPU de consumo para pruebas de concepto.

## Benchmarks y rendimiento

Resultados publicados en la model card sobre el split de test oficial (2.000 textos):

| Metrica | Valor |
|---|---|
| Accuracy | 0.930 |
| Macro-F1 | 0.896 |

F1 por clase:

| Clase | F1 |
|---|---|
| sadness | 0.969 |
| joy | 0.944 |
| love | 0.848 |
| anger | 0.941 |
| fear | 0.893 |
| surprise | 0.783 |

No se han publicado comparaciones con otros modelos en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: aproximadamente 0,44 GB solo para pesos (109,5 M de parámetros × 4 bytes), más overhead de activaciones y runtime; en la práctica, menos de 2 GB en la mayoría de configuraciones.
- En fp16: aproximadamente 0,22 GB para los pesos.
- GPU recomendadas: cualquier GPU con al menos 2-4 GB de VRAM; cabe holgadamente en RTX 3060, RTX 4060, RTX 4090, A100 y H100.
- Cabe en GPU de consumo y también puede ejecutarse en CPU para inferencia por lotes de textos cortos.
- Opciones de despliegue: `transformers` (librería nativa), Text Embeddings Inference (tag `text-embeddings-inference` presente en el repo), endpoints compatibles; no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI en la informacion disponible.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Emotion Mirror BERT | 109.486.854 | no disponible (BERT base: 512) | Clasificación de emociones (6 clases, inglés) | apache-2.0 | Hugging Face |
| bert-base-uncased | 109.482.240 (aprox.) | 512 | Modelo base preentrenado, sin cabeza de clasificación | apache-2.0 | Hugging Face |
| Alternativas de clasificación de emociones | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks comparativos con otros modelos de clasificación de emociones en la informacion proporcionada.

## Limitaciones y advertencias

- El dataset de entrenamiento son mensajes de Twitter en inglés construidos en torno a plantillas como "i feel ..."; el modelo puede generalizar mal a otros dominios o registros.
- Detecta la emoción expresada en el texto, no el estado emocional real de la persona que escribe.
- Es un proyecto de curso, no un instrumento clínico ni psicológico; no debe usarse para diagnóstico o evaluación de salud mental.
- Solo soporta inglés.
- Riesgo de alucinación no aplicable en sentido generativo, pero sí de clasificaciones erróneas en textos ambiguos, irónicos o fuera de dominio.
- El rendimiento es notablemente inferior en las clases `surprise` (F1 0.783) y `love` (F1 0.848) frente a `sadness` (0.969).
- Las probabilidades requieren aplicar temperature scaling (T = 1.320) para estar calibradas; usarlas sin calibrar puede distorsionar umbrales de decisión.
- Licencia Apache 2.0: permite uso comercial, pero se recomienda verificar los términos del dataset `dair-ai/emotion` para usos derivados.
- Sesgos conocidos: no documentados en la informacion proporcionada, aunque son esperables sesgos derivados de la distribución de Twitter en inglés.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Cecile1015/emotion-mirror-bert
- Repositorio de código y evaluación: https://github.com/Cecile1015/emotion-mirror-cbs4702 (notebook `notebooks/06_bert.ipynb`)
- Dataset de entrenamiento: https://huggingface.co/datasets/dair-ai/emotion
- Modelo base: https://huggingface.co/google-bert/bert-base-uncased
