# dylanqi27/disaster-tweet-bert

## Resumen

disaster-tweet-bert es un clasificador binario de textos cortos en inglés, especializado en distinguir tuits que describen catástrofes reales (DISASTER) de los que no (NOT_DISASTER). Lo desarrolla el usuario dylanqi27 como un fine-tuning de google-bert/bert-base-uncased sobre el dataset tweet_disaster, y se publica bajo licencia MIT con un tamaño de repositorio de 0,5 GB.

El modelo resuelve una tarea acotada y muy concreta: la clasificación de secuencias cortas (máximo 128 tokens) en dos clases, con un pipeline de text-classification estándar de transformers. Su interés práctico radica en que ofrece dos formatos de inferencia empaquetados en el mismo repositorio: pesos PyTorch (438 MB) y dos variantes ONNX (fp32 de 438 MB e int8 cuantizada de 111 MB), lo que permite desplegarlo tanto en servidores Python como directamente en el navegador mediante transformers.js.

La arquitectura subyacente es un transformer encoder BERT-base (no se especifica el número exacto de parámetros en la información disponible, pero bert-base-uncased es el checkpoint de referencia). El contexto efectivo está limitado a 128 tokens por la configuración de entrenamiento, suficiente para tuits pero no para documentos largos. Es un modelo pequeño, orientado a producción ligera y a demostraciones web, no a razonamiento general.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer encoder (BERT-base, fine-tuning de google-bert/bert-base-uncased) |
| Parámetros totales | no disponible (el modelo base es bert-base-uncased) |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | 128 tokens (max_len de entrenamiento) |
| Tipos de cuantización | fp32 (PyTorch y ONNX) e int8 per-channel dynamic quantization (ONNX) |
| Idiomas soportados | en (inglés) |
| Licencia | MIT |
| Formato de pesos | safetensors/PyTorch (transformers), ONNX (model.onnx fp32 y model_quantized.onnx int8) |

## Arquitectura y entrenamiento

El modelo es un fine-tuning completo de bert-base-uncased para clasificación de secuencias con dos etiquetas (id2label: 0 = NOT_DISASTER, 1 = DISASTER). Se entrenó durante 3 épocas con batch size 32, learning rate 2e-5, warmup ratio 0,1, max_len 128 y semilla 42, en una RTX 4060 Ti de 8 GB durante 175 segundos. El dataset es tweet_disaster, con un conjunto de test de n = 762 y la clase positiva definida como DISASTER. No se documenta en la información disponible el tamaño del conjunto de entrenamiento, la composición exacta del corpus ni si hubo técnicas de aumento de datos o balanceo de clases.

La innovación técnica destacable no está en la arquitectura, sino en el empaquetado: se exporta a ONNX con verificación de equivalencia numérica respecto a PyTorch (max|diff| = 0,0000 en fp32) y se añade una variante int8 con cuantización dinámica por canal. Esta variante reduce el peso de 438 MB a 111 MB y es la que transformers.js carga por defecto con dtype "q8". No se menciona uso de RLHF, DPO ni decodificación especulativa, lo cual es coherente con una tarea de clasificación.

## Capacidades

- Clasificación binaria de texto corto en inglés: devuelve la etiqueta DISASTER o NOT_DISASTER con una puntuación de probabilidad (softmax sobre logits).
- Inferencia en Python con transformers (AutoTokenizer y AutoModelForSequenceClassification).
- Inferencia en navegador con transformers.js 3.5.1, seleccionando dtype "q8" o "fp32".
- Inferencia con ONNX Runtime, con entradas input_ids, attention_mask y token_type_ids en int64 y batch y secuencia dinámicos.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-step.
- No tiene capacidades multilingües: solo inglés.
- No dispone de modo thinking, visión ni audio.
- No es un modelo generativo: no produce texto libre, solo etiquetas y scores.

## Casos de uso

- Monitorización de redes sociales en emergencias: ingesta de un flujo de tuits y clasificación automática para priorizar avisos de catástrofe real frente a ruido, con la ventaja de que el modelo es lo bastante pequeño (111 MB en int8) para ejecutarse en un contenedor modesto o incluso en el cliente.
- Filtrado previo en paneles de crisis: usar la salida DISASTER como primera etapa de un pipeline que después enruta los positivos a revisión humana o a un modelo mayor, reduciendo coste computacional gracias al bajo tamaño del clasificador.
- Aplicación web de demostración: integración directa con transformers.js en el navegador con dtype "q8", sin backend, útil para prototipos y demos interactivas de clasificación de tuits.
- Etiquetado asistido de datasets: preanotar corpus de tuits con la etiqueta de desastre para acelerar el trabajo de anotadores humanos, aceptando la precisión de 0,8478 en test como punto de partida.
- Análisis de campañas de comunicación de emergencias: procesar menciones y mensajes ciudadanos para medir cuántos corresponden a incidentes reales frente a opiniones o noticias genéricas.
- Servicio de inferencia ligero con ONNX Runtime: desplegar el modelo en entornos sin GPU y con requisitos de latencia bajos, aprovechando el grafo ONNX con batch y secuencia dinámicos para servir peticiones variables.
- Investigación sobre detección de desastres: línea base reproducible (semilla 42, hiperparámetros documentados) para comparar con modelos mayores o con enfoques multilingües.

## Benchmarks y rendimiento

Resultados publicados por el autor en el conjunto de test (n = 762, clase positiva DISASTER):

| Versión | Accuracy | F1 | Precision | Recall | Tamaño |
|---|---|---|---|---|---|
| PyTorch (out/best) | 0,8478 | 0,8165 | 0,8459 | 0,7890 | 438 MB |
| ONNX fp32 | 0,8478 | 0,8165 | 0,8459 | 0,7890 | 438 MB |
| ONNX int8 (per-channel dynamic) | 0,8294 | 0,7727 | 0,9020 | 0,6758 | 111 MB |

La cuantización int8 mantiene una precisión alta (0,9020) a costa de un recall notablemente menor (0,6758), lo que implica más falsos negativos: en un caso de uso de alertas de catástrofe, esto es un compromiso relevante que conviene tener en cuenta. No se han publicado comparaciones con otros modelos en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: muy baja; el modelo en fp32 ocupa 438 MB de pesos y en int8 111 MB, por lo que cabe holgadamente en cualquier GPU consumer con 4 GB o más.
- GPU recomendadas: no requiere GPU dedicada; el autor entrenó en una RTX 4060 Ti de 8 GB en 175 segundos, lo que da una idea de la ligereza del modelo. Para inferencia basta CPU.
- Cabe en GPU consumer: sí, en cualquier tarjeta moderna (RTX 3060, RTX 4060, RTX 4090, etc.) e incluso en iGPU o en el navegador.
- Opciones de despliegue: transformers (PyTorch), ONNX Runtime, transformers.js (navegador), y por los tags del repositorio también text-embeddings-inference y endpoints compatibles.
- Latencia y throughput: no disponibles de forma explícita; el tamaño reducido y el grafo ONNX con batch dinámico permiten servir múltiples peticiones por segundo en CPU, pero no se han publicado cifras concretas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| dylanqi27/disaster-tweet-bert | no disponible (base bert-base) | 128 tokens | Clasificación binaria de tuits de desastre | MIT | Hugging Face + ONNX + transformers.js |
| google-bert/bert-base-uncased | no disponible en la información | 512 tokens (estándar del checkpoint base) | Modelo base genérico; requiere fine-tuning para esta tarea | Apache 2.0 (según el checkpoint original) | Hugging Face |
| Modelos de clasificación de desastres similares | no disponible | no disponible | Clasificación de tuits | no disponible | no disponible |

No se dispone de datos de benchmarks de alternativas en la información proporcionada, por lo que la comparación cuantitativa de rendimiento no está disponible. La ventaja diferencial de este modelo frente al checkpoint base es el fine-tuning específico y el empaquetado ONNX listo para navegador; su desventaja es el contexto limitado a 128 tokens y el soporte exclusivo de inglés.

## Limitaciones y advertencias

- Solo inglés: cualquier texto en otro idioma queda fuera del dominio de entrenamiento y producirá predicciones poco fiables.
- Contexto de 128 tokens: los textos más largos se truncan, lo que puede eliminar información relevante.
- Riesgo de alucinación no aplica en sentido generativo, pero sí de falsos positivos y falsos negativos; el recall de 0,7890 en fp32 y 0,6758 en int8 implica que se escaparán catástrofes reales.
- La variante int8, aunque más ligera, degrada el recall de forma significativa; para sistemas de alerta conviene usar fp32 o calibrar el umbral de decisión.
- Sesgos: no se documenta análisis de sesgos demográficos, geográficos o de dominio; el dataset tweet_disaster puede sobrerrepresentar ciertos tipos de eventos o regiones.
- Licencia MIT: permite uso comercial, pero el modelo base google-bert/bert-base-uncased tiene su propia licencia que conviene verificar por separado.
- El modelo es de 2026 según la fecha de creación del repositorio; tiene 49 descargas y 0 likes, por lo que no cuenta con validación comunitaria amplia.
- No es un modelo generativo ni un asistente: no debe usarse para tareas de razonamiento, código o conversación.
- Para producción en alertas críticas, se recomienda combinar con revisión humana y no depender exclusivamente de la salida del clasificador.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/dylanqi27/disaster-tweet-bert
- Demo en Spaces: https://huggingface.co/spaces/dylanqi27/disaster-tweet-demo-static
- Modelo base: https://huggingface.co/google-bert/bert-base-uncased
- Librería transformers.js: https://cdn.jsdelivr.net/npm/@huggingface/transformers@3.5.1
- Dataset tweet_disaster: no disponible como enlace directo en la información proporcionada
