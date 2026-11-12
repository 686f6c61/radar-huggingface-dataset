# antalvdb/olifant-edufineweb-chatbot

## Resumen

OLIFANT EduFineweb Chatbot es un modelo de generación de texto desarrollado por Antal van den Bosch (antalvdb) que sustituye por completo las redes neuronales por aprendizaje basado en memoria (*memory-based learning*). En lugar de ajustar pesos mediante descenso de gradiente, el modelo indexa ejemplos de entrenamiento en una estructura de trie de prefijos y, en inferencia, recupera el siguiente token mediante clasificación k-NN aproximada con IGTree (la aproximación de árbol de decisión rápida del motor TiMBL). Cada predicción puede rastrearse hasta ejemplos concretos del corpus de entrenamiento con sus puntuaciones de similitud, lo que proporciona una trazabilidad completa.

El modelo se entrena sobre EduFineweb (texto web educativo de alta calidad) combinado con datos de instrucciones conversacionales, y se distribuye en tres variantes: XS (~71M tokens indexados, ventana de 4 tokens, ~1,4 GB), S (~121M tokens, ventana de 4 tokens, ~2,4 GB) y M (~300M tokens de EduFineweb más ~21M de instrucciones, ventana de 16 tokens, ~8,1 GB). Utiliza el tokenizador de GPT-2 y está pensado para inferencia exclusiva en CPU con 8-10 GB de RAM.

Su relevancia actual radica en dos ejes: la sostenibilidad (el autor declara una huella de CO2 unas 1.000 veces menor que los LLM neuronales, sin GPU en entrenamiento ni inferencia) y la auditabilidad regulatoria, al ofrecer un registro completo de decisiones útil en sectores como salud, finanzas o legal. Es, por tanto, una propuesta de investigación y nicho, no un sustituto de un LLM conversacional de propósito general.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Aprendizaje basado en memoria (TiMBL, clasificador IGTree); sin red neuronal; trie de prefijos sobre tokens GPT-2 |
| Parametros totales | No disponible (no hay pesos neuronales; el tamaño se mide en tokens indexados y tamaño de fichero) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 4 tokens (XS y S); 16 tokens (M) |
| Tipos de cuantizacion | No aplica (no hay pesos que cuantizar; el índice se almacena en formato .ibase) |
| Idiomas soportados | Inglés (en) |
| Licencia | GPL-3.0 |
| Formato de pesos | Ficheros TiMBL `.ibase` (índice de instancias); tokenizador GPT-2 |

Variantes disponibles:

| Variante | Fichero | Contexto | Tokens de entrenamiento | Tamano de fichero |
|---|---|---|---|---|
| XS | edufineweb_chatbot_71M.l4r0.igtree.ibase | 4 | ~50M EduFineweb (shard 1) + ~21M instrucciones | ~1,4 GB |
| S | edufineweb_chatbot_121M.l4r0.igtree.ibase | 4 | ~100M EduFineweb (shard 1) + ~21M instrucciones | ~2,4 GB |
| M | edufineweb_train_1-3_chatbot_tok.l16r0.igtree.ibase | 16 | ~300M EduFineweb (shards 1-3) + ~21M instrucciones | ~8,1 GB |

## Arquitectura y entrenamiento

OLIFANT no entrena parámetros: construye un índice de instancias (base de ejemplos) en una estructura de trie de prefijos sobre secuencias de tokens del tokenizador GPT-2. La clasificación se realiza con IGTree, una aproximación mediante árbol de decisión del k-vecinos más cercanos de TiMBL, que recupera la distribución de clases (el siguiente token) a partir de los ejemplos más similares del índice. Los sufijos de los nombres de fichero (`l4r0`, `l16r0`) indican la ventana de contexto (4 o 16 tokens) y el parámetro de retroceso o relajación (`r0`); el modelo M usa además un índice entrenado sobre los shards 1-3 de EduFineweb.

Los datos de entrenamiento combinan EduFineweb (MLZoo/edu-fineweb-10B) con pares instrucción-respuesta conversacionales (alespalla/chatbot_instruction_prompts). No hay RLHF ni DPO: el "aprendizaje" consiste en indexar ejemplos. La innovación principal es la explicabilidad nativa (cada predicción devuelve ejemplos de referencia con puntuaciones de similitud) y la eficiencia energética; el paper asociado (arXiv:2510.22317) describe además decodificación especulativa con estos índices, disponible en un repositorio aparte.

## Capacidades

- Generación de texto por recuperación de siguiente token sobre contexto corto (4 o 16 tokens).
- Completado factual y recitación de contenido cercano al corpus de entrenamiento (respuestas estructuradas, definiciones, continuaciones de texto educativo).
- Generación conversacional básica gracias al corpus de instrucciones, limitada por la ventana de contexto.
- Explicabilidad total: cada predicción incluye los ejemplos de entrenamiento que la sustentan y sus puntuaciones de similitud.
- Inferencia en CPU sin GPU, con requisitos de RAM de 8-10 GB.
- No soporta tool calling ni function calling (no documentado).
- No soporta razonamiento multi-paso ni modo de pensamiento (*thinking mode*).
- Sin capacidades de visión, audio ni multimodalidad.
- Multilingüe: no; solo inglés.
- Decodificación especulativa disponible mediante un repositorio separado de índices especulativos.

## Casos de uso

- Completado factual en entornos regulados: en aplicaciones de salud, finanzas o legal donde se exige un rastro de auditoría, el modelo devuelve junto a cada token los ejemplos de entrenamiento que lo justifican, lo que facilita la revisión humana y el cumplimiento normativo.
- Despliegue en *edge computing* y dispositivos sin GPU: con 8-10 GB de RAM y sin acelerador, puede ejecutarse en servidores modestos o equipos de campo para tareas de completado corto (20-50 tokens), donde un LLM neuronal sería inviable.
- Aplicaciones de *green AI*: organizaciones con objetivos de sostenibilidad pueden usar el modelo como alternativa de bajas emisiones (el autor declara ~1.000x menos CO2) para generación de texto auxiliar no crítica.
- Investigación en interpretabilidad: sirve como banco de pruebas para estudiar cómo el contexto influye en la predicción, comparando las recuperaciones de memoria con las activaciones de modelos neuronales.
- Generación de respuestas estructuradas y plantillas: para formularios, FAQs o respuestas de formato fijo donde la creatividad no es deseable y la fidelidad al corpus es una ventaja.
- Educación y demostraciones docentes: permite ilustrar el funcionamiento de un modelo de lenguaje sin caja negra, mostrando en vivo qué ejemplos del corpus guían cada predicción.
- Prototipado rápido en CPU: para validar pipelines de generación de texto con el tokenizador de GPT-2 antes de migrar a un modelo neuronal, sin necesidad de infraestructura GPU.

## Benchmarks y rendimiento

| Metrica | Valor |
|---|---|
| Velocidad de inferencia | 10-50 tokens/s (CPU) |
| RAM requerida | ~8-10 GB |
| Precisión de predicción de siguiente token | "Cercana al nivel de GPT-2" según el autor (arXiv:2510.22317); sin cifras concretas en la información disponible |
| Mejor uso | Completados cortos (20-50 tokens) |

No se han publicado en la información disponible resultados numéricos de benchmarks estándar (MMLU, HumanEval, GSM8K) ni comparativas cuantitativas con modelos neuronales.

## Requisitos de hardware

- VRAM: no aplica; el modelo no usa GPU. Requiere ~8-10 GB de RAM del sistema.
- GPU recomendadas: ninguna; funciona en CPU estándar.
- ¿Cabe en GPU de consumo? La pregunta no aplica; el modelo está diseñado para CPU. El índice M ocupa ~8,1 GB en disco.
- Opciones de despliegue: TiMBL (paquete del sistema, necesario para entrenamiento e inferencia), Python con `timbl` y `transformers` (tokenizador GPT-2), y una demo Gradio alojada en Hugging Face Spaces.
- Latencia y throughput: 10-50 tokens/s en CPU según el autor; dependiente del tamaño del índice y de la variante (XS, S, M).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| OLIFANT M (este) | No disponible (índice de ~321M tokens) | 16 tokens | Memoria (TiMBL/IGTree) | GPL-3.0 | Hugging Face + GitHub |
| GPT-2 (small) | 124M | 1.024 tokens | Transformer | MIT | Hugging Face |
| Modelos neuronales pequeños tipo TinyLlama | ~1.100M | 2.048 tokens | Transformer | Apache-2.0 | Hugging Face |

La comparación directa es limitada: OLIFANT no comparte la métrica de parámetros ni el régimen de contexto de los transformers, y no se dispone de benchmarks comparativos publicados en la información proporcionada. Frente a GPT-2 y modelos pequeños similares, OLIFANT ofrece explicabilidad y eficiencia energética a costa de una ventana de contexto drásticamente menor (4-16 tokens frente a 1.024-2.048) y de una generación menos creativa.

## Limitaciones y advertencias

- Ventana de contexto muy corta (4 tokens en XS/S, 16 en M), muy inferior a los LLM modernos; limita la coherencia en conversaciones multi-turno.
- La generación por recuperación mantiene las salidas cerca del corpus de entrenamiento y reduce la creatividad; no es adecuada para texto novel o razonamiento abierto.
- Riesgo de reproducir sesgos y contenido del corpus EduFineweb y de los datos de instrucciones, sin filtrado RLHF documentado.
- Solo inglés; sin soporte multilingüe.
- La licencia GPL-3.0 impone obligaciones de copyleft: el uso comercial es posible, pero la distribución de obras derivadas debe mantenerse bajo GPL-3.0, lo que puede ser incompatible con productos propietarios.
- Dependencia del paquete de sistema TiMBL para entrenamiento e inferencia, lo que complica el despliegue en contenedores y entornos gestionados.
- Sin soporte documentado de tool calling, agentes ni razonamiento multi-paso.
- El rendimiento "cercano a GPT-2" es una afirmación del autor sin cifras verificables en la información disponible; conviene validarlo en el caso de uso concreto.
- Modelo con 0 descargas y 0 likes en el momento de la consulta: ecosistema y soporte comunitario prácticamente inexistentes.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/antalvdb/olifant-edufineweb-chatbot
- Paper (arXiv:2510.22317): https://arxiv.org/abs/2510.22317
- Repositorio GitHub: https://github.com/antalvdb/olifant
- Demo Gradio: https://huggingface.co/spaces/antalvdb/olifant-generate-server
- Índices para decodificación especulativa: https://huggingface.co/antalvdb/olifant-speculative-ibases
- Demo de explicabilidad: https://huggingface.co/spaces/antalvdb/olifant-explainability-demo
- Dataset EduFineweb: https://huggingface.co/datasets/MLZoo/edu-fineweb-10B
- Dataset de instrucciones: https://huggingface.co/datasets/alespalla/chatbot_instruction_prompts
