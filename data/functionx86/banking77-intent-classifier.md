# functionX86/banking77-intent-classifier

## Resumen

El modelo `functionX86/banking77-intent-classifier` es un clasificador de intenciones de 77 clases para el dominio bancario, desarrollado por el usuario functionX86 y publicado en HuggingFace. Se construye mediante fine-tuning del modelo de embeddings `BAAI/bge-small-en-v1.5` (33 millones de parámetros, arquitectura BERT) sobre el dataset BANKING77 de PolyAI. Su propósito es resolver la tarea de clasificación de intenciones en mensajes de clientes de banca minorista, permitiendo enrutar automáticamente solicitudes como *"my card still hasn't arrived after two weeks"* hacia la intención correspondiente (`card_arrival`).

El modelo es relevante por dos motivos: por un lado, ofrece un rendimiento competitivo en un benchmark estándar de clasificación de intenciones (macro F1 de 0,9245 y accuracy de 0,9247 sobre el split de test oficial); por otro, su model card documenta de forma explícita y honesta un resultado negativo: un enfoque más simple basado en embeddings congelados del mismo encoder seguidos de una regresión logística alcanza un macro F1 de 0,935, superior al del fine-tuning completo. Esto lo convierte en un caso de estudio interesante sobre cuándo el fine-tuning aporta valor real y cuándo no. El modelo está licenciado bajo MIT, soporta únicamente inglés y tiene una longitud de contexto de 64 tokens.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | BERT-base (encoder transformer, fine-tuning de BAAI/bge-small-en-v1.5) |
| Parametros totales | 33.389.645 |
| Parametros activos | no aplicable (modelo denso, no MoE) |
| Longitud de contexto | 64 tokens (máximo de secuencia en entrenamiento) |
| Tipos de cuantizacion | no disponible (no se documentan cuantizaciones) |
| Idiomas soportados | en (inglés) |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un fine-tuning del encoder `BAAI/bge-small-en-v1.5`, que a su vez es una variante de BERT de 33 millones de parámetros preentrenada de forma contrastiva para similitud semántica. Sobre este encoder se añade una cabeza de clasificación de 77 clases y se entrena de extremo a extremo (end-to-end) con el dataset BANKING77, que contiene 10.003 ejemplos de entrenamiento distribuidos en 77 intenciones (aproximadamente 130 ejemplos por clase). El entrenamiento se realizó con una longitud máxima de secuencia de 64 tokens (el percentil 95 de las consultas de BANKING77 es de 29 palabras, por lo que apenas se trunca contenido), hasta 15 épocas con early stopping basado en macro-F1 sobre un split de validación estratificado del 10 %, batch size de 32, learning rate de 5e-5 con warmup del 10 % y weight decay de 0,01, en precisión fp16 sobre una GPU NVIDIA RTX 3050 Ti de 4 GB.

La model card documenta que el fine-tuning distorsiona la geometría del espacio de embeddings ya preentrenado de forma contrastiva, y que con solo 130 ejemplos por clase el modelo llega a memorizar el loss de entrenamiento antes de generalizar. Un enfoque alternativo que mantiene el encoder congelado y entrena únicamente una regresión logística sobre los embeddings obtiene un macro F1 de 0,935, superior al 0,9245 del fine-tuning. El autor publica el checkpoint como resultado negativo reproducible, no como recomendación de uso.

## Capacidades

- Clasificación de intenciones de texto en inglés, específicamente en el dominio de banca minorista (77 clases predefinidas).
- Detección de intenciones solapadas como `card_arrival` vs `card_delivery_estimate`, `top_up_failed` vs `top_up_reverted`, y el grupo de verificación de identidad.
- Inferencia rápida: ~0,34 ms por petición según la model card.
- Integración sencilla con la API `pipeline` de Transformers.
- No soporta tool calling, ni razonamiento multi-step, ni capacidades multilingües: es un clasificador de texto puro.

## Casos de uso

- Enrutamiento automático de consultas en atención al cliente bancaria: el modelo puede clasificar mensajes entrantes de clientes y dirigirlos al departamento o flujo de resolución adecuado (por ejemplo, reclamaciones de tarjetas, transferencias, top-ups).
- Triaje de tickets en sistemas de soporte: integrado en un backend, asigna una de las 77 intenciones a cada ticket para priorización y asignación a agentes especializados.
- Chatbots bancarios de primera línea: el clasificador puede actuar como componente de comprensión del lenguaje (NLU) en un diálogo, detectando la intención del usuario antes de que el sistema genere una respuesta.
- Análisis de logs de conversaciones: aplicar el modelo sobre históricos de chat para etiquetar automáticamente las consultas y extraer métricas de frecuencia por intención.
- Experimentación académica sobre clasificación de intenciones: sirve como punto de referencia en estudios comparativos de métodos (fine-tuning vs. embeddings congelados) y como ejemplo documentado de resultado negativo.
- Validación de pipelines de producción: aunque la propia model card desaconseja su uso directo en producción, puede emplearse como baseline en pruebas A/B frente a enfoques más simples o más complejos.

## Benchmarks y rendimiento

Los resultados oficiales declarados en el model-index de la model card son los siguientes:

| Metrica | Valor |
|---|---|
| Macro F1 | 0,9245 |
| Accuracy | 0,9247 |
| Top-3 accuracy | 0,974 |
| Inferencia | ~0,34 ms por petición |

La evaluación se realizó sobre el split de test oficial de BANKING77 (3080 peticiones, 40 por intención). La model card también reporta una comparativa interna con enfoques alternativos sobre el mismo dataset:

| Enfoque | Macro F1 | Coste de entrenamiento |
|---|---|---|
| TF-IDF (n-gramas de palabra y carácter) + regresión logística | 0,915 | 23 s, CPU |
| Embeddings congelados de `bge-small` + regresión logística | 0,935 | 54 s, CPU |
| Este modelo (fine-tuning de `bge-small` end-to-end) | 0,9245 | ~215 s, GPU |

No se han publicado resultados comparativos con otros modelos de clasificación de intenciones en BANKING77 más allá de estos datos internos.

## Requisitos de hardware

- VRAM estimada: el modelo tiene 33 millones de parámetros, por lo que en fp32 ocupa aproximadamente 133 MB y en fp16 unos 67 MB. Cabe sin problema en cualquier GPU con al menos 1 GB de VRAM.
- GPU recomendada: cualquier GPU consumer moderna, incluidas GTX 1060, RTX 2060, RTX 3050 Ti (la usada para entrenar), o incluso CPU para inferencia.
- Inferencia en CPU: viable, con latencias de pocos milisegundos por petición gracias al tamaño reducido.
- Opciones de despliegue: compatible con `transformers` pipeline, `text-embeddings-inference` (según tags del modelo), y puede exportarse a ONNX o TensorRT para optimización.
- Latencia: ~0,34 ms por petición en GPU según la model card; en CPU será algo mayor pero sigue siendo muy baja.

## Comparativa con modelos similares

No se dispone de datos de benchmarks comparativos con otros modelos de clasificación de intenciones bancarias en el momento de redactar esta ficha. Existen alternativas en HuggingFace como `learn-abc/banking77-intent-classifier-en` (un clasificador de 12 intenciones, también basado en BERT, pero con un conjunto reducido) o `learn-abc/banking77-intent-classifier`, pero no se han publicado métricas oficiales comparables. Otras implementaciones como `ibra-dotcom/banking77-intent-classifier` (DistilBERT) reportan una accuracy de 0,908, pero no se dispone de una evaluación estandarizada común. Se recomienda evaluar cada modelo sobre el split de test oficial de BANKING77 para una comparación justa.

## Limitaciones y advertencias

- El modelo está entrenado únicamente en inglés y sobre datos de banca minorista; no transferirá a otros dominios ni idiomas sin reentrenamiento.
- Varias intenciones de BANKING77 se solapan de forma intrínseca (por ejemplo, `card_arrival` vs `card_delivery_estimate`), lo que genera un error residual que ningún modelo puede resolver.
- Las puntuaciones softmax no están calibradas. Para usos que dependan de un umbral de confianza, es necesario ajustar una temperatura sobre datos de validación; la model card indica que en la variante de embeddings congelados esto redujo el error de calibración esperado de 0,110 a 0,012.
- La model card advierte explícitamente que el modelo no es adecuado para producción tal cual: fue entrenado con datos públicos de investigación, no con mensajes reales de clientes, y nunca se evaluó su equidad entre segmentos de clientes.
- El autor recomienda usar embeddings congelados con una cabeza lineal como mejor opción para esta tarea concreta, dado que supera al fine-tuning con un coste de entrenamiento mucho menor.
- Licencia MIT permite uso comercial, pero la responsabilidad de validación y calibración recae en quien lo despliegue.

## Enlaces

- Repositorio del modelo: https://huggingface.co/functionX86/banking77-intent-classifier
- Dataset BANKING77: https://github.com/PolyAI-LDN/task-specific-datasets
- Modelo base BAAI/bge-small-en-v1.5: https://huggingface.co/BAAI/bge-small-en-v1.5
- Alternativa con 12 intenciones: https://huggingface.co/learn-abc/banking77-intent-classifier-en
- Proyecto relacionado en GitHub: https://github.com/jasminejayasmita786-commits/Banking-ai-suite
- Clasificador basado en DistilBERT: https://github.com/ibra-dotcom/banking77-intent-classifier
- Benchmark de intent classification de Aito: https://aito.ai/docs/api/v2/benchmarks/banking77/
