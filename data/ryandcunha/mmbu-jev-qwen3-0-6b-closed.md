# ryandcunha/mmbu-jev-qwen3-0.6b-closed

## Resumen

mmbu-jev-qwen3-0.6b-closed es un modelo de decisión de tipo "System One" construido con la librería any2jev a partir del modelo base Qwen/Qwen3-0.6B. No es un modelo generativo: no produce texto, sino respuestas tipadas (Choice, Score y Noul) acompañadas de probabilidades calibradas, obtenidas en una única pasada forward. El autor es el usuario de Hugging Face ryandcunha y el modelo se publica bajo licencia Apache 2.0.

Técnicamente se compone de un adaptador LoRA de rango 16 sobre Qwen3-0.6B al que se le ha eliminado la cabeza de vocabulario, más una cabeza pointer de dimensión 256 que puntúa las opciones frente a un token de decisión. El pipeline declarado en Hugging Face es text-classification. El entrenamiento implicó 10,6 M de parámetros entrenables, 1,0 época, learning rate 0,0002 y unos 5 minutos de reloj en una única GPU de consumo.

Su interés está en el nicho que ocupa: convertir un LLM pequeño en un clasificador/decididor determinista con probabilidades calibradas, útil para enrutado, triaje y puntuación donde no se necesita generar lenguaje. El repositorio registra 0 descargas y 0 "likes" en el momento de redactar esta ficha (creado el 25 de septiembre de 2026), por lo que es un proyecto reciente y sin validación externa pública.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder denso (Qwen3-0.6B) con adaptador LoRA r=16 y cabeza pointer de dimensión 256; cabeza de vocabulario eliminada |
| Parametros totales | 0,6 B en el modelo base; 10,6 M de parámetros entrenables en el adaptador LoRA |
| Parametros activos | No aplica: arquitectura densa, no es un modelo MoE |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (adaptador LoRA, `head.safetensors`, tokenizer) |

## Arquitectura y entrenamiento

El modelo parte de Qwen3-0.6B, un transformer decoder denso de la familia Qwen3 (que según el informe técnico de Qwen3 abarca arquitecturas densas y MoE de entre 0,6 y 235 B de parámetros). Sobre esa base se aplica un adaptador LoRA de rango 16 y se elimina la cabeza de vocabulario: la salida no es una distribución sobre tokens de texto, sino la puntuación de opciones contra un token de decisión mediante una cabeza pointer de dimensión 256. El archivo `any2jev.json` define los delimitadores, el modo (`packed`) y una temperatura de 0,307 ajustada sobre el conjunto de validación.

El entrenamiento se realizó sobre `data/train.jsonl` con 10,6 M de parámetros entrenables, 1,0 época, learning rate 0,0002 y batch 4 x 4, con un tiempo de reloj de 5 minutos en una GPU de consumo. La model card indica que los datos proceden de "unos pocos miles de decisiones etiquetadas de un puñado de fuentes". No se menciona el uso de RLHF, DPO ni ningún otro ajuste por preferencias, ni se detalla la composición lingüística del dataset.

## Capacidades

- Clasificación de texto orientada a decisión: recibe un estado (state) y devuelve respuestas tipadas Choice, Score y Noul.
- Choice: elección entre un conjunto de opciones proporcionadas (por ejemplo, enrutar a "billing, technical, sales").
- Score: puntuación de opciones frente a un token de decisión.
- Noul: respuesta a una pregunta de decisión planteada explícitamente (por ejemplo, "Is this urgent?").
- Salida con probabilidades calibradas (calibración ajustada sobre el split de validación).
- Inferencia en una sola pasada forward, sin decodificación autoregresiva ni generación de texto.
- Soporte de tool calling / function calling: no disponible (el modelo no genera texto ni llama a herramientas).
- Soporte de agentes y razonamiento multi-paso: no; el diseño es de tipo "System One", de un único paso.
- Capacidades multilingües: no disponibles (no se especifican idiomas en la ficha).
- No realiza razonamiento, generación de código, matemáticas ni visión.

## Casos de uso

- Triaje de tickets de soporte: el modelo recibe el texto de la incidencia y devuelve una Choice entre categorías como billing, technical o sales, lo que permite enrutar cada caso al equipo correspondiente sin invocar un LLM generativo.
- Priorización de urgencias: mediante Noul se puede plantear una pregunta binaria del estilo "¿es urgente?" y consumir la probabilidad calibrada como umbral configurable para escalar casos.
- Enrutado de peticiones en pipelines de IA: al ser un clasificador pequeño (0,6 B con adaptador de 10,6 M), puede actuar como filtro previo que decide qué consultas requieren un modelo mayor, reduciendo coste y latencia.
- Puntuación de leads o de riesgo: con la salida Score se pueden ordenar candidatos según su probabilidad asociada a un token de decisión, útil en scoring interno siempre que la distribución de entrada se parezca a la de entrenamiento.
- Detección de intención en asistentes conversacionales: clasificar la intención de un turno de usuario y derivar la conversación al flujo adecuado, con la probabilidad calibrada como señal de confianza.
- Moderación o etiquetado de contenido: clasificación categórica de textos cortos contra un conjunto fijo de etiquetas, integrable en colas de procesamiento por lotes.
- Automatización de decisiones repetitivas en back-office: cualquier decisión estructurada (asignar cola, marcar un caso como urgente, elegir una categoría) que hoy se resuelva con reglas heurísticas puede sustituirse por este modelo si existen datos etiquetados similares.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card menciona que existen métricas en `eval.json` y una temperatura de 0,307 ajustada sobre validación, pero no se incluyen cifras concretas de exactitud, F1 ni de ninguna otra métrica. Tampoco se aportan comparaciones numéricas con alternativas.

## Requisitos de hardware

- VRAM estimada para inferencia: no publicada por el autor. Como estimación derivada del recuento de parámetros, el modelo base en fp16 ronda 1,2 GB, más el adaptador LoRA (10,6 M de parámetros, ~0,04 GB) y la cabeza pointer de dimensión 256 (despreciable); en la práctica cabría esperar un consumo del orden de 1,5-2,5 GB incluyendo activaciones, aunque no es un dato confirmado.
- GPU recomendadas: no especificadas. Dado el tamaño, cualquier GPU con al menos unos pocos GB de VRAM libre es suficiente; no se requiere A100, H100 ni hardware de centro de datos.
- GPU de consumo: sí, cabe con holgura en GPU de consumo. El propio autor indica que el entrenamiento completo tardó 5 minutos en una GPU de consumo.
- Opciones de despliegue: servidor propio de any2jev (`pip install "any2jev[serve]"`, endpoint `POST /v1/systemone`, compatible con el SDK de TypeSafe); al ser un adaptador PEFT sobre Qwen3-0.6B, también puede cargarse con la pila estándar de transformers más PEFT.
- Latencia y throughput: no disponibles. Al tratarse de una única pasada forward sin decodificación, la latencia debería ser baja en relación con un LLM generativo del mismo tamaño, pero no hay cifras publicadas.
- Tamano del repositorio: 0,1 GB (solo adaptador, cabeza y tokenizer; el modelo base se descarga aparte).

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Salida | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| mmbu-jev-qwen3-0.6b-closed | Clasificador/decididor (LoRA sobre Qwen3-0.6B) | 0,6 B base + 10,6 M entrenables | Choice / Score / Noul con probabilidades calibradas | Apache 2.0 | Hugging Face; 0 descargas, 0 likes |
| Qwen/Qwen3-0.6B | LLM generativo denso | 0,6 B | Texto (modos thinking y non-thinking) | Apache 2.0 | Hugging Face, ampliamente distribuido |
| huihui-ai/Qwen3-0.6B-abliterated | LLM generativo denso modificado (abliterated) | 0,6 B | Texto | no disponible en la información proporcionada | Hugging Face |

La diferencia principal frente a los dos alternativas es funcional: mientras Qwen3-0.6B y su variante abliterated son modelos generativos de propósito general, mmbu-jev-qwen3-0.6b-closed es un clasificador que no genera texto y que solo resulta comparable a otros clasificadores de texto pequeños, categoría para la que no se dispone de datos de comparación en la información proporcionada.

## Limitaciones y advertencias

- Entrenado sobre unos pocos miles de decisiones etiquetadas procedentes de un puñado de fuentes: la precisión esperable es la reportada en el split de validación para entradas similares y sensiblemente menor fuera de distribución.
- Las probabilidades están calibradas sobre el split de validación, no son una garantía por respuesta individual.
- El autor recomienda explícitamente mantener la aritmética, las fechas y el conteo en código, no delegarlos en el modelo.
- No genera texto: cualquier caso de uso que requiera respuesta en lenguaje natural necesita otro componente.
- Idiomas soportados no especificados en la ficha; el comportamiento multilingüe es incierto.
- No hay información sobre sesgos, sobre la composición demográfica o temática del dataset de entrenamiento ni sobre evaluación de seguridad.
- Licencia Apache 2.0: permite uso comercial, modificación y redistribución, con las obligaciones habituales de conservar avisos de licencia y atribución; no se declaran restricciones adicionales.
- Proyecto independiente, no afiliado a TypeSafe AI, según la propia model card.
- Repositorio con 0 descargas y 0 likes: ausencia de validación externa, de reportes de terceros y de mantenimiento comprobable.
- El modelo requiere cargar el modelo base Qwen/Qwen3-0.6B por separado (el repositorio solo contiene el adaptador, la cabeza y el tokenizer).

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ryandcunha/mmbu-jev-qwen3-0.6b-closed
- Repositorio de any2jev: https://github.com/hwfengcs/any2jev
- Modelo base Qwen/Qwen3-0.6B: https://huggingface.co/Qwen/Qwen3-0.6B
- Informe técnico de Qwen3 (arXiv): https://arxiv.org/html/2505.09388v1
- Qwen3-0.6B en Qualcomm AI Hub: https://aihub.qualcomm.com/models/qwen3_0_6b
- Variante huihui-ai/Qwen3-0.6B-abliterated: https://huggingface.co/huihui-ai/Qwen3-0.6B-abliterated
- Guía de la familia Qwen3 (insiderllm): https://insiderllm.com/guides/qwen3-complete-guide/
