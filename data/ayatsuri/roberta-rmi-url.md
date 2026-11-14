# ayatsuri/roberta-rmi-url

## Resumen

`roberta-rmi-url` es un modelo de clasificación de texto obtenido mediante fine-tuning de `FacebookAI/roberta-base`, publicado por el usuario ayatsuri en Hugging Face. Por el nombre y la tarea declarada, el modelo parece orientado a la clasificación de URLs o de contenido asociado a URLs (la nomenclatura "rmi-url" sugiere una tarea de detección o categorización de enlaces), aunque la model card no documenta explícitamente el dominio ni la etiqueta objetivo.

Se trata de un encoder RoBERTa base con 124.651.784 parámetros, entrenado durante 3 épocas con un learning rate de 1e-05 y batch size de 32. Los resultados declarados en el conjunto de evaluación son modestos pero razonables para una tarea de clasificación binaria o multiclase: accuracy 0,8703, F1 0,8614, precision 0,8617 y recall 0,8618.

Su relevancia es limitada y muy específica: no es un modelo generativo ni compite con los LLM actuales, sino un clasificador ligero y desplegable en CPU que puede integrarse como componente en pipelines de filtrado, moderación o enrutamiento. La licencia MIT y el tamaño reducido lo hacen apto para producción, siempre que se valide su comportamiento en el dominio concreto de uso.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (RoBERTa base) |
| Parametros totales | 124.651.784 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (RoBERTa base admite hasta 512 tokens, dato no confirmado en la model card) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (el modelo base RoBERTa es principalmente inglés) |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un fine-tuning de `FacebookAI/roberta-base`, un transformer encoder de tipo BERT con 12 capas, 768 dimensiones ocultas y 12 cabezas de atención (arquitectura estándar de RoBERTa base). Sobre esta base se ha añadido una cabeza de clasificación de secuencias para la tarea `text-classification`. El número total de parámetros (124.651.784) es coherente con RoBERTa base más una cabeza de clasificación.

El entrenamiento se realizó con el `Trainer` de Hugging Face durante 3 épocas, con `learning_rate=1e-05`, `train_batch_size=32`, `eval_batch_size=32`, semilla 42, optimizador AdamW fused con betas (0,9; 0,999) y epsilon 1e-08, y scheduler lineal. Se registraron 3951 pasos totales (1317 por época). No se documenta la composición del dataset, el número de tokens de entrenamiento, ni si hubo técnicas de aumentación o balanceo de clases. Tampoco se indica si se aplicó alguna innovación técnica adicional (destilación, decodificación especulativa, atención lineal, etc.); no la hay.

## Capacidades

- Clasificación de texto: el modelo emite una etiqueta (o distribución de etiquetas) para una secuencia de entrada, presumiblemente relacionada con URLs.
- Detección y categorización de URLs: por la nomenclatura "rmi-url", se infiere un uso orientado a clasificar enlaces, aunque la model card no lo confirma.
- Inferencia ligera: al ser un encoder de 124M de parámetros, puede ejecutarse en CPU con latencia baja.
- No soporta generación de texto, razonamiento, código, matemáticas ni visión.
- No se documenta soporte de tool calling, function calling ni agentes.
- Capacidades multilingües: no documentadas; el modelo base RoBERTa está entrenado principalmente en inglés.
- No dispone de modo "thinking", ni capacidades de audio.

## Casos de uso

- Filtrado de URLs en pipelines de seguridad: el modelo puede clasificar enlaces entrantes para separar URLs legítimas de sospechosas, integrándose como paso previo a un análisis más profundo. Su tamaño reducido permite procesar lotes grandes en CPU.
- Moderación de enlaces en foros o comentarios: clasificar URLs publicadas por usuarios para detectar spam o contenido no deseado antes de mostrarlas, con un coste computacional mínimo.
- Enrutamiento de peticiones en APIs: usar la clasificación de la URL como señal para dirigir la petición a un microservicio u otro según la categoría detectada.
- Extracción de características para un clasificador posterior: emplear las representaciones del encoder como embeddings de URLs en un sistema de recomendación o clustering de enlaces.
- Análisis de logs de navegación: clasificar grandes volúmenes de URLs registradas en logs para agregar estadísticas por categoría sin necesidad de GPU.
- Prototipado rápido de clasificadores de texto: servir como baseline fine-tuneado para tareas de clasificación binaria con métricas ya reportadas (F1 ~0,86), antes de invertir en modelos mayores.
- Despliegue en entornos con recursos limitados: al caber en CPU y tener licencia MIT, puede embeberse en contenedores pequeños o dispositivos edge para clasificación en tiempo real.

## Benchmarks y rendimiento

Resultados declarados por el autor en el conjunto de evaluación (no se especifica el dataset):

| Metrica | Valor |
|---|---|
| Loss | 0,8178 |
| Accuracy | 0,8703 |
| Recall | 0,8618 |
| Precision | 0,8617 |
| F1 | 0,8614 |

Evolución por época según la model card:

| Epoca | Training loss | Validation loss | Accuracy | Recall | Precision | F1 |
|---|---|---|---|---|---|---|
| 1 | 1,0591 | 0,8719 | 0,8615 | 0,8523 | 0,8583 | 0,8528 |
| 2 | 0,7969 | 0,8136 | 0,8693 | 0,8614 | 0,8616 | 0,8604 |
| 3 | 0,6895 | 0,8178 | 0,8703 | 0,8618 | 0,8617 | 0,8614 |

No se han publicado resultados de benchmarks estándar (MMLU, GLUE, etc.) en la información disponible. El `model-index` del modelo está vacío.

## Requisitos de hardware

- VRAM estimada para inferencia en FP32: aproximadamente 0,5 GB para los pesos (124M × 4 bytes), más overhead de activaciones; en la práctica, menos de 1 GB.
- VRAM estimada en FP16: aproximadamente 0,25 GB para los pesos.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM es suficiente (GTX 1650, RTX 3050, T4, etc.). No requiere A100 ni H100.
- Cabe en GPU de consumo: sí, en cualquier GPU consumer moderna e incluso en iGPU con suficiente memoria compartida.
- Despliegue en CPU: viable y recomendado para esta carga; latencias del orden de milisegundos por secuencia corta.
- Opciones de despliegue: `transformers` (Pipeline de text-classification), `text-embeddings-inference` (según los tags), y potencialmente ONNX Runtime o TorchScript para optimización. No se documenta soporte explícito de vLLM, llama.cpp u Ollama (no aplica a encoders de clasificación).
- Throughput y latencia: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ayatsuri/roberta-rmi-url | 124,6M | no disponible | Clasificación de texto (URLs) | MIT | Hugging Face |
| FacebookAI/roberta-base | 125M | 512 tokens | Modelo base (masked LM) | MIT | Hugging Face |
| distilbert-base-uncased | 66M | 512 tokens | Modelo base (masked LM) | Apache 2.0 | Hugging Face |
| bert-base-uncased | 110M | 512 tokens | Modelo base (masked LM) | Apache 2.0 | Hugging Face |

`roberta-rmi-url` se diferencia de los modelos base en que está fine-tuneado para una tarea concreta, pero no se dispone de comparativas de rendimiento frente a otros clasificadores de URLs en la información proporcionada. La comparación con los modelos base es estructural, no de rendimiento en la tarea.

## Limitaciones y advertencias

- Dataset de entrenamiento no documentado: se desconoce la composición, el dominio y el balance de clases, lo que impide evaluar la generalización fuera del conjunto de evaluación original.
- Métricas sin contexto: accuracy y F1 de ~0,86 no permiten saber si la tarea es binaria o multiclase, ni cuál es el baseline trivial; en tareas desbalanceadas, un F1 de 0,86 puede ser engañoso.
- Riesgo de sobreajuste al dominio: al no conocerse el dataset, el modelo puede fallar en URLs de dominios, idiomas o formatos distintos a los vistos en entrenamiento.
- Idiomas: no se documenta el soporte multilingüe; RoBERTa base está entrenado principalmente en inglés, por lo que el rendimiento en castellano u otros idiomas es incierto.
- Sesgos: no se documentan análisis de sesgo; los modelos entrenados con datos web pueden heredar sesgos de dominio y de representación.
- Alucinación: no aplica en sentido generativo, pero sí puede producir clasificaciones erróneas con alta confianza en entradas fuera de distribución.
- Licencia MIT: permite uso comercial y modificación, pero el autor no ofrece garantías; conviene validar el modelo en el dominio de producción antes de desplegarlo.
- Model card incompleta: secciones de "Intended uses", "Training and evaluation data" y "Model description" marcadas como "More information needed"; el `model-index` está vacío.
- Fecha de creación futura (2026-11-13): dato anómalo en los metadatos de Hugging Face que conviene verificar.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ayatsuri/roberta-rmi-url
- Modelo base: https://huggingface.co/FacebookAI/roberta-base
- Paper de RoBERTa: https://arxiv.org/abs/1907.11692
- Repositorio de Transformers: https://github.com/huggingface/transformers
