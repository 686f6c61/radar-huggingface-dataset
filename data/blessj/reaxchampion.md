# BlessJ/reaxchampion

## Resumen

BlessJ/reaxchampion es un modelo de clasificación de texto derivado por fine-tuning del modelo base MachinePulseAI/karpo-decision-31B, un transformer de aproximadamente 31.273 millones de parámetros (31,27 B) según los pesos en safetensors publicados en el repositorio. Lo desarrolla el usuario BlessJ y se distribuye bajo licencia Apache 2.0, aunque el acceso está restringido (gated) y requiere aceptar condiciones en Hugging Face. El repositorio ocupa 62,6 GB, lo que es coherente con pesos en precisión de 16 bits para un modelo de ese tamaño.

El modelo se presenta como un "decision-model" orientado a text-classification, es decir, no está pensado como un generador conversacional generalista sino como un clasificador o evaluador de decisiones sobre entradas de texto. Al derivar de un modelo base de 31 B, hereda una arquitectura transformer de gran escala, aunque la información pública disponible no detalla la composición del dataset de fine-tuning, los idiomas soportados ni los resultados de evaluación.

Su relevancia actual es limitada pero concreta: se trata de un fine-tune reciente (creado en noviembre de 2026) con cero descargas y cero likes, sin documentación técnica publicada más allá de los metadatos de la model card. Resulta útil como caso de estudio de fine-tuning de clasificación sobre un backbone de 31 B, pero su adopción en producción exige validación propia dada la ausencia de benchmarks y de especificaciones detalladas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de MachinePulseAI/karpo-decision-31B; detalles no disponibles) |
| Parametros totales | 31.273.088.876 (31,27 B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; no se documentan GGUF ni otras) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La información disponible indica que reaxchampion es un fine-tune del modelo MachinePulseAI/karpo-decision-31B, etiquetado en Hugging Face como `base_model:finetune`. El pipeline declarado es `text-classification`, y los tags incluyen `decision-model` y `gemma4`, lo que sugiere que el backbone base pertenece a la familia Gemma 4, aunque no se confirma en la documentación accesible. No se publican detalles sobre el número de tokens de entrenamiento, la composición del dataset de ajuste, ni si se emplearon técnicas de RLHF, DPO o supervisión ligera para la tarea de clasificación.

Tampoco se documentan innovaciones técnicas específicas (decodificación especulativa, atención lineal, mezcla de expertos u otras). El tamaño del repositorio (62,6 GB) es consistente con pesos en bfloat16 o float16 para 31,27 B de parámetros, sin indicios de pesos cuantizados adicionales publicados.

## Capacidades

- Clasificación de texto: el pipeline declarado es `text-classification`, por lo que la salida esperada es una etiqueta o puntuación sobre una entrada textual.
- Modelo de decisión: el tag `decision-model` sugiere un uso orientado a evaluar o seleccionar entre opciones, aunque no se detalla el esquema de etiquetas.
- Herencia de un backbone de 31 B: potencial capacidad de razonamiento y comprensión de texto largo, no verificada en la documentación.
- Tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponibles (no se listan idiomas).
- Capacidades especiales (thinking mode, visión, audio): no disponibles.

## Casos de uso

- Clasificación de tickets de soporte: usar el modelo para asignar categorías o prioridades a mensajes de clientes; su tamaño de 31 B permite captar matices en textos largos, aunque la ausencia de benchmarks obliga a validar la precisión con un conjunto propio etiquetado.
- Filtrado de contenido en pipelines de moderación: integrar el clasificador como etapa de scoring previa a la revisión humana, aprovechando la licencia Apache 2.0 para uso comercial interno.
- Enrutamiento de decisiones en sistemas de recomendación: emplear el modelo como evaluador de candidatos textuales (por ejemplo, descripciones de productos) y seleccionar la opción con mayor puntuación.
- Investigación sobre fine-tuning de clasificadores grandes: servir como referencia para estudiar cómo se comporta un backbone de 31 B ajustado a una tarea discriminativa frente a modelos más pequeños.
- Extracción de señales en analítica de documentos: clasificar fragmentos de contratos o informes en categorías predefinidas dentro de un pipeline batch, con despliegue en GPU de centro de datos.
- Evaluación automática de respuestas generadas: usar el modelo como juez o clasificador de calidad sobre salidas de otros sistemas, siempre que se calibre contra anotaciones humanas dada la falta de métricas publicadas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16/bf16: aproximadamente 62-65 GB solo para pesos, más overhead de activaciones y KV cache; en la práctica se recomienda un nodo con 80 GB o más.
- VRAM estimada en cuantización de 8 bits: en torno a 32-35 GB, viable en una A100 40 GB o H100 40 GB.
- VRAM estimada en cuantización de 4 bits: en torno a 16-18 GB, potencialmente viable en una RTX 4090 (24 GB) o RTX A6000 (48 GB), aunque no se han publicado pesos cuantizados oficiales.
- GPU recomendadas: A100 80 GB, H100 80 GB o H200 para fp16; A100 40 GB o H100 40 GB para 8 bits.
- Cabe en GPU consumer: solo con cuantización agresiva (4 bits) y si se generan pesos GGUF propios, ya que el repositorio no los incluye.
- Opciones de despliegue: vLLM o TGI para clasificación con backbone grande; llama.cpp u Ollama requerirían conversión a GGUF no publicada. El acceso gated añade un paso de autenticación previo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| BlessJ/reaxchampion | 31,27 B | no disponible | text-classification | Apache 2.0 | Gated en HF |
| MachinePulseAI/karpo-decision-31B (base) | ~31 B (según fine-tune) | no disponible | decision-model | no disponible en esta ficha | HF |
| Clasificadores BERT-large | ~0,34 B | 512 tokens | text-classification | Apache 2.0 / MIT | Abiertos |
| Modelos de clasificación de 7-8 B (p. ej. fine-tunes de Llama) | ~7-8 B | variable | text-classification | variable | Abiertos |

La comparación cuantitativa de rendimiento no está disponible porque no se han publicado métricas de reaxchampion ni del modelo base en la información proporcionada. Frente a clasificadores BERT, el coste de inferencia es dos órdenes de magnitud mayor, lo que solo se justifica si la tarea requiere comprensión semántica profunda o contextos muy largos.

## Limitaciones y advertencias

- Ausencia total de benchmarks: no hay evidencia publicada de precisión, recall ni F1 en ninguna tarea, por lo que no debe desplegarse en producción sin evaluación propia.
- Documentación mínima: la model card no detalla dataset, idiomas, esquema de etiquetas ni hiperparámetros de entrenamiento.
- Acceso restringido: el repositorio es gated y requiere aceptar condiciones, lo que puede bloquear automatizaciones y despliegues CI/CD.
- Riesgo de alucinación y sesgos: inherente a los backbones de gran escala; al ser un clasificador, el riesgo se traduce en etiquetas erróneas o sobreconfiadas, no verificadas.
- Idiomas no declarados: no se puede asumir soporte multilingüe; validar el idioma objetivo antes de usar.
- Coste de inferencia elevado: 31 B de parámetros implican requisitos de GPU de centro de datos salvo cuantización no oficial.
- Licencia Apache 2.0: permite uso comercial, pero conviene revisar las condiciones del modelo base (MachinePulseAI/karpo-decision-31B) por si imponen restricciones adicionales.
- Madurez: cero descargas y cero likes en el momento de la consulta; sin comunidad ni soporte documentado.

## Enlaces

- Hugging Face: https://huggingface.co/BlessJ/reaxchampion
- Modelo base: https://huggingface.co/MachinePulseAI/karpo-decision-31B
