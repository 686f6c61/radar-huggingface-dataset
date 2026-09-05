# Aleksander22/Koliber-v1.0-Base-copy

## Resumen

Koliber v1.0 Base es un modelo de lenguaje causal decoder-only de tamaño compacto, desarrollado por OrisTeam y entrenado desde cero. Esta ficha se basa en la copia publicada por Aleksander22, que replica el modelo original alojado en OrisTeam/Koliber-v1.0-Base. El modelo tiene 126 millones de parámetros, 12 capas, un tamaño de ocultación de 768 y una ventana de contexto de 1536 tokens. Está diseñado principalmente para el idioma polaco y se encuentra en la etapa de preentrenamiento base, por lo que no es un asistente instruido ni un chatbot.

Su relevancia radica en ser un modelo pequeño pero técnicamente interesante: incorpora atención con consultas agrupadas (GQA), codificación posicional rotatoria (RoPE), activación SwiGLU y normalización RMSNorm. Además, durante el entrenamiento se utilizó un objetivo auxiliar de predicción de estados futuros, que no afecta a la inferencia. Al ser un modelo base con licencia Apache 2.0, resulta adecuado como punto de partida para fine-tuning, investigación y experimentación en el ámbito del procesamiento del lenguaje natural en polaco.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only causal LM (GQA, RoPE, SwiGLU, RMSNorm) |
| Parametros totales | 126.044.928 (126M) |
| Longitud de contexto | 1536 tokens |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | Polaco (principalmente) |
| Licencia | Apache 2.0 |
| Formato de pesos | no disponible |
| Libreria | Transformers |
| Pipeline | text-generation |

## Arquitectura y entrenamiento

Koliber v1.0 Base es un modelo transformer decoder-only con 12 capas, tamaño de ocultación de 768, 12 cabezas de consulta y 2 cabezas de clave/valor, con una dimensión de cabeza de 64. La FFN tiene un tamaño de 3072, se usa RMSNorm y no se emplean sesgos. La cabeza de lenguaje está atada a las embeddings. La atención agrupada (GQA) y la codificación posicional rotatoria (RoPE) son innovaciones técnicas que reducen el coste computacional y mejoran la eficiencia en contextos largos, aunque en este caso la ventana es de 1536 tokens.

El modelo fue entrenado desde cero con aproximadamente 2.534 millones de tokens (2.534B), principalmente en polaco. Durante el entrenamiento se aplicó una pérdida auxiliar de predicción de estados futuros: una cabeza de entrenamiento aprende a predecir una representación oculta aproximadamente 128 tokens adelante, muestreada cada 32 tokens, mediante una proyección de baja dimensión de 192 y una pérdida de distancia coseno. La pérdida total fue L = L_NTP + 0.03 × L_future. Esta cabeza auxiliar no forma parte del modelo de inferencia, no añade parámetros en tiempo de ejecución y no es necesaria para cargar o generar con Koliber.

## Capacidades

- Generación de texto en polaco mediante completación de prefijos; el modelo está pensado para continuar texto natural, no para prompts de chat.
- Razonamiento básico como modelo de lenguaje autoregresivo, sin garantías de coherencia en tareas complejas.
- No soporta tool calling ni function calling, según la documentación disponible.
- No soporta tareas de agente ni razonamiento multi-paso estructurado.
- Capacidades multilingües limitadas al polaco, con posible transferencia a otros idiomas eslavos no verificada.
- Sin soporte de visión, audio u otras modalidades.
- Adecuado como base para fine-tuning supervisado, optimización de preferencias, continued pretraining, investigación y experimentación.

## Casos de uso

- Completación de texto en polaco: el modelo puede autocompletar frases en editores de texto, aplicaciones de mensajería o sistemas de escritura asistida, gracias a su tamaño compacto y su entrenamiento en polaco.
- Fine-tuning para análisis de sentimiento: al ser un modelo base, puede afinarse con datasets etiquetados en polaco para clasificar opiniones en reseñas, comentarios o redes sociales.
- Fine-tuning para chatbots básicos: con un pequeño conjunto de instrucciones, se puede adaptar para generar respuestas cortas en polaco en tareas de atención al cliente.
- Investigación en modelos pequeños: su arquitectura con GQA, RoPE y SwiGLU, junto con el objetivo auxiliar de predicción de estado futuro, lo hacen interesante para estudiar el impacto de estas técnicas en modelos compactos.
- Continued pretraining en dominios específicos: puede servir como punto de partida para entrenar con textos legales, médicos o técnicos en polaco, aprovechando su licencia Apache 2.0.
- Generación de contenido breve: puede producir titulares, resúmenes o descripciones cortas en polaco, aunque se recomienda fine-tuning para controlar el estilo y la precisión.
- Educación y prototipado: su tamaño reducido permite ejecutarlo en CPU o GPUs modestas, facilitando la experimentación en entornos educativos o en prototipos de baja demanda.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: en FP16 aproximadamente 252 MB para los pesos, más activaciones y KV cache; en 8-bit alrededor de 126 MB; en FP32 unos 504 MB.
- GPU recomendadas: cualquier GPU con al menos 1 GB de VRAM, como RTX 3050, RTX 4060, o incluso GPUs integradas; también puede ejecutarse en CPU.
- Cabe en GPU de consumo: sí, es un modelo muy pequeño que puede ejecutarse en portátiles o sistemas con GPU modesta.
- Opciones de despliegue: Transformers (Python), vLLM, llama.cpp, Ollama, TGI, o cualquier framework compatible con modelos de 126M.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idioma | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Koliber v1.0 Base | 126M | 1536 tokens | Polaco | Apache 2.0 | HuggingFace |
| Azurro/APT3-275M-Base | 275M | no disponible | no disponible | no disponible | HuggingFace |

No se dispone de más modelos comparables en la información proporcionada.

## Limitaciones y advertencias

- Modelo base sin alineación: no está afinado para seguir instrucciones, por lo que puede generar contenido no deseado o incoherente.
- Sesgos: al entrenarse principalmente con textos en polaco, puede reflejar sesgos presentes en esos datos.
- Riesgo de alucinación: como todos los modelos de lenguaje, puede generar información falsa o inventada.
- Contexto corto: la ventana de 1536 tokens limita su uso en tareas que requieren mucha información previa o documentos largos.
- Idioma: su rendimiento fuera del polaco no está garantizado; se recomienda fine-tuning para otros idiomas.
- Licencia: Apache 2.0 permite uso comercial, pero es responsabilidad del usuario asegurarse de que el fine-tuning cumpla con la licencia.
- Sin soporte de tool calling ni funciones de agente: no se han documentado estas capacidades.

## Enlaces

- https://huggingface.co/Aleksander22/Koliber-v1.0-Base-copy
- https://huggingface.co/OrisTeam/Koliber-v1.0-Base
- https://huggingface.co/OrisTeam/Koliber-v1.0-Base-Preview
