# shash4333/novapay-sentiment

## Resumen

El modelo `shash4333/novapay-sentiment` es un clasificador de texto (análisis de sentimiento) obtenido mediante fine-tuning de `distilbert/distilbert-base-uncased`, un transformer encoder destilado de BERT. Desarrollado por el usuario shash4333, el modelo está pensado para tareas de clasificación de sentimiento en texto, probablemente orientado a dominios fintech o de pagos, como sugiere el nombre "novapay". Con 66,9 millones de parámetros y una arquitectura ligera, es adecuado para despliegues con recursos limitados, manteniendo un rendimiento competitivo en precisión y F1 (0,886 y 0,8862 respectivamente según la evaluación del autor). La licencia Apache 2.0 permite uso comercial sin restricciones adicionales.

El modelo se distribuye en formato safetensors y es compatible con la librería Transformers, así como con `text-embeddings-inference` y endpoints compatibles. Aunque la model card es escasa en detalles sobre el dataset de entrenamiento y las clases objetivo, los resultados reportados indican una precisión del 88,6% en el conjunto de evaluación, lo que lo convierte en una opción viable para prototipos y aplicaciones de análisis de sentimiento en producción ligera.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | DistilBERT (transformer encoder, 6 capas, 768 dimensiones ocultas, 12 cabezas de atención) |
| Parámetros totales | 66.955.010 |
| Parámetros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 512 tokens (heredado de DistilBERT base) |
| Tipos de cuantización | No disponible (se distribuye en safetensors, sin cuantización declarada) |
| Idiomas soportados | No disponible (el modelo base es inglés, pero no se especifica en la ficha) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en DistilBERT, una versión destilada de BERT que reduce el número de capas de 12 a 6, manteniendo la misma dimensión de embeddings y atención. Esta arquitectura permite una inferencia aproximadamente un 40% más rápida que BERT base, con una reducción del 40% en el tamaño del modelo, a costa de una ligera pérdida de precisión. El fine-tuning se realizó sobre un dataset desconocido, con los siguientes hiperparámetros: learning rate de 2e-05, batch size de 16, optimizador AdamW (con betas 0.9 y 0.999), scheduler lineal y 2 épocas. No se menciona el uso de técnicas como RLHF o DPO; el entrenamiento es un fine-tuning supervisado estándar.

La model card indica que el modelo fue generado con el Trainer de Hugging Face, y los resultados de entrenamiento muestran una mejora progresiva: en la primera época se alcanzó una precisión de 0,829 y F1 de 0,8477, mientras que en la segunda época se llegó a 0,886 y 0,8862 respectivamente, con una pérdida de validación de 0,3012.

## Capacidades

- Clasificación de sentimiento en texto: el modelo asigna una etiqueta de sentimiento (probablemente positivo, negativo o neutral) a fragmentos de texto, aunque el número exacto de clases no se especifica.
- Procesamiento de texto en inglés: al estar basado en `distilbert-base-uncased`, el modelo está optimizado para texto en inglés sin distinción de mayúsculas.
- Inferencia rápida y ligera: gracias a su tamaño reducido, es adecuado para aplicaciones en tiempo real con baja latencia.
- Compatibilidad con pipelines de Transformers: se puede usar directamente con la clase `pipeline` de Hugging Face para clasificación de texto.
- No incluye capacidades de tool calling, agentes, visión, audio ni razonamiento multi-paso; es un modelo puramente discriminativo para clasificación.

## Casos de uso

- Análisis de opiniones de clientes en plataformas de reseñas: el modelo puede clasificar comentarios de usuarios en positivos, negativos o neutrales, permitiendo a empresas de servicios financieros monitorizar la satisfacción del cliente en tiempo real.
- Monitorización de redes sociales: integrado en un pipeline de scraping, puede etiquetar menciones de una marca o producto en Twitter, Reddit o foros, ayudando a detectar crisis de reputación.
- Filtrado de tickets de soporte: en un sistema de atención al cliente, el modelo puede priorizar tickets con sentimiento negativo para que sean atendidos con mayor urgencia.
- Análisis de encuestas de satisfacción: respuestas abiertas de encuestas pueden clasificarse automáticamente para obtener métricas agregadas de sentimiento.
- Clasificación de comentarios en aplicaciones de banca móvil: dado el nombre "novapay", podría usarse para analizar feedback de usuarios de una app de pagos, identificando áreas de mejora.
- Prototipado rápido de sistemas de análisis de sentimiento: al ser un modelo pequeño y con licencia permisiva, es ideal para pruebas de concepto y MVPs antes de escalar a modelos más grandes.

## Benchmarks y rendimiento

La model card reporta los siguientes resultados en el conjunto de evaluación (declarados por el autor):

| Métrica | Valor |
|---|---|
| Pérdida (loss) | 0,3012 |
| Precisión (accuracy) | 0,886 |
| F1 | 0,8862 |

No se han publicado comparaciones con otros modelos en el mismo dataset, ni resultados en benchmarks estándar como MMLU, GLUE o SuperGLUE. Los datos presentados son los únicos disponibles y provienen de la evaluación del autor.

## Requisitos de hardware

- VRAM estimada: con 66,9 millones de parámetros, el modelo requiere aproximadamente 268 MB en FP32 y 134 MB en FP16. Esto permite ejecutarlo en GPUs con 2 GB de VRAM o menos, e incluso en CPU con un rendimiento aceptable.
- GPUs recomendadas: cualquier GPU moderna con al menos 2 GB de VRAM, como NVIDIA GTX 1650, RTX 2060, RTX 3060 o superiores. También es viable en hardware de gama baja.
- Compatibilidad con consumer GPU: sí, cabe en prácticamente cualquier GPU de consumo actual.
- Opciones de despliegue: se puede servir con Hugging Face Transformers, ONNX Runtime, TensorRT, o mediante servidores de inferencia como vLLM (aunque no es óptimo para modelos encoder pequeños), TGI (Text Generation Inference) o simplemente con FastAPI y la librería Transformers.
- Latencia y throughput: al ser un modelo pequeño, la inferencia en CPU tarda unos pocos milisegundos por muestra (dependiendo del hardware); en GPU, la latencia es sub-milisegundo. No se dispone de cifras exactas del autor.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Precisión (evaluación) | Licencia |
|---|---|---|---|---|
| shash4333/novapay-sentiment | 66,9M | 512 | 0,886 | Apache 2.0 |
| distilbert-base-uncased (base sin fine-tune) | 66,9M | 512 | No aplica (modelo preentrenado) | Apache 2.0 |
| bert-base-uncased (fine-tune típico) | 110M | 512 | Variable según dataset | Apache 2.0 |

No se dispone de una comparativa directa con otros modelos de análisis de sentimiento en el mismo dataset. El modelo es comparable en tamaño a DistilBERT base, pero con un fine-tuning específico para sentimiento. Frente a BERT base, ofrece menor latencia y menor huella de memoria, aunque potencialmente menor precisión en tareas complejas.

## Limitaciones y advertencias

- El dataset de entrenamiento es desconocido, por lo que no se puede evaluar la generalización a dominios fuera del contexto original. Es probable que el modelo esté sesgado hacia el dominio fintech o de pagos, dado el nombre "novapay".
- No se especifica el número de clases ni la distribución de etiquetas, lo que dificulta interpretar la precisión reportada.
- El modelo está basado en un tokenizador uncased, por lo que no distingue entre mayúsculas y minúsculas, lo que puede afectar a ciertos textos (por ejemplo, acrónimos).
- No se han realizado pruebas de robustez frente a ataques adversariales o textos con ruido.
- La licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantías sobre el rendimiento en producción.
- Al ser un modelo de clasificación, no genera texto; no es adecuado para tareas generativas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/shash4333/novapay-sentiment
- Modelo base: https://huggingface.co/distilbert/distilbert-base-uncased
- Modelo similar (otro autor): https://huggingface.co/abhishes/novapay-sentiment
- Repositorio relacionado (NovaPay MCP): https://github.com/NovaPay/novapay-mcp
- Proyecto Support IQ (relacionado con NovaPay): https://github.com/amartyasingh-code/Support_IQ
