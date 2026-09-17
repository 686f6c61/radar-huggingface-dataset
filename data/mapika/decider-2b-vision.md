# Mapika/decider-2b-vision

## Resumen

decider-2b-vision es un modelo visión-lenguaje de 2,21 mil millones de parámetros desarrollado por Mapika, obtenido por ajuste fino del modelo base Qwen/Qwen3.5-2B-Base. Su particularidad es que no genera texto: dada una imagen (una foto, un diagrama o un fotograma de un videojuego) junto con una pregunta de texto que incluye opciones etiquetadas con letras, el modelo devuelve en un único *forward pass* una distribución de probabilidad calibrada sobre esas opciones en una única posición de respuesta ("answer slot"). No hay decodificación autoregresiva ni muestreo de tokens: se lee directamente el softmax de los logits de ese slot.

El modelo está orientado a la toma de decisiones estructurada y a la política en entornos visuales. En un fotograma de juego de 256×240 píxeles consume únicamente 64 tokens visuales, lo que abarata mucho el coste por paso en bucles de control o de refuerzo. Además del uso con imagen, admite preguntas puramente textuales, ya que sus pesos de lenguaje parten de la versión v4 de decider-2b (la variante sin visión), lo que preserva las habilidades de decisión sobre texto.

Su relevancia actual reside en dos factores. Por un lado, ofrece salidas calibradas (ECE entre 0,02 y 0,07 en las tareas evaluadas), algo poco habitual en modelos de este tamaño y necesario cuando la probabilidad se usa como umbral de confianza o directamente como política. Por otro, demuestra que un modelo de 2 B puede alcanzar exactitudes de 0,85-0,95 en tareas de VQA de opción múltiple y mejorar su política jugando desde píxeles con PPO, sin necesidad de generación de texto ni de modelos de mayor tamaño. La licencia es Apache-2.0 y el modelo se publica solo en inglés.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer visión-lenguaje (tag `qwen3_5`), derivada de Qwen/Qwen3.5-2B-Base; cabeza de decisión sobre un único slot de respuesta. Detalles internos de atención no disponibles |
| Parámetros totales | 2.213.241.664 (~2,21 B) |
| Parámetros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible en la información proporcionada |
| Tipos de cuantización | No disponibles. El repositorio publica pesos en safetensors (4,4 GB, coherente con fp16); no se documentan versiones GGUF, AWQ, GPTQ ni int8 |
| Idiomas soportados | Inglés (`en`) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |
| Pipeline | image-text-to-text |
| Entradas admitidas | Imagen (PIL, array NumPy o bytes PNG) + pregunta de texto con opciones; `None` para uso solo texto |
| Coste visual | 64 tokens visuales por fotograma de 256×240 píxeles |
| Salida | Distribución softmax sobre las opciones en un slot de respuesta (sin generación) |
| Código de inferencia | Requiere el paquete `decider` (`decider.vision.VisionDecisionModel`, `decider.infer`) |

## Arquitectura y entrenamiento

El modelo parte del VLM Qwen3.5-2B completo (visión + lenguaje) y se ajusta para convertir la cabeza de generación en una cabeza de decisión: en lugar de producir texto libre, se entrena el modelo para que la distribución sobre las opciones de respuesta aparezca concentrada en un único slot del vocabulario. La inferencia se reduce a aplicar softmax sobre esos logits (`m.slot_logits(inp)`), lo que elimina por completo el bucle de decodificación y hace que el coste de cómputo sea el de un solo *forward pass*. Los pesos de lenguaje arrancan de decider-2b v4, por lo que el comportamiento de decisión sobre texto se conserva y se puede usar el modelo sin imagen.

El entrenamiento consistió en una sola época sobre 80.000 ejemplos, de los cuales 50.000 incluían imagen, combinando tres fuentes: fotogramas de juego de Pong, Breakout, CliffWalking, MiniGrid y Super Mario Bros etiquetados por políticas programadas (con sobremuestreo de acciones raras y frames generados por DAgger a partir del propio juego del modelo); tareas de opción múltiple sobre imágenes de The Cauldron (A-OKVQA, AI2D, ScienceQA, IconQA, TQA, Raven y Hateful Memes); y una repetición de la mezcla de texto original. Tras la etapa supervisada, la política se mejoró con PPO desde píxeles en Breakout y Pong durante 12 iteraciones, usando el propio softmax sobre las opciones de acción como política. Los detalles de composición exacta del dataset, tokenizador, resolución del codificador visual y esquema de atención no están disponibles en la información proporcionada.

## Capacidades

- Decisión visual calibrada: devuelve una probabilidad sobre opciones etiquetadas (a, b, c, d...) a partir de una imagen y una pregunta, sin generar texto.
- Modo solo texto: admite preguntas sin imagen (`None`), heredando las capacidades de decisión de decider-2b v4.
- VQA de opción múltiple en dominios diversos: escenas naturales (A-OKVQA), diagramas científicos (AI2D), material escolar (ScienceQA), iconos y pictogramas (IconQA), texto en imagen (TQA), razonamiento abstracto (Raven) y memes de odio (Hateful Memes).
- Percepción de fotogramas de videojuego a bajo coste: 64 tokens visuales por fotograma de 256×240, apto para bucles de control.
- Comportamiento como política de RL: la distribución softmax sobre acciones puede usarse directamente como política (validado con PPO desde píxeles en Breakout y Pong).
- Salidas estructuradas: el resultado es un vector de probabilidades de longitud fija, directamente consumible por lógica de decisión.
- Calibración explícita: se reportan valores de ECE por tarea (0,02-0,07), lo que permite fijar umbrales de confianza.
- No soporta, según la información disponible: generación de texto libre, tool calling, function calling, uso como agente conversacional multi-turno, audio ni otros idiomas distintos del inglés. El autor indica explícitamente que no está pensado como modelo de chat.

## Casos de uso

- Política en entornos visuales de refuerzo: el softmax sobre las opciones de acción se usa directamente como política del agente. Ya validado con PPO desde píxeles en Breakout (de 1 a 16 puntos tras el RL) y Pong (de 3 a 8), con un coste de 64 tokens visuales por fotograma.
- Etiquetado automático y DAgger para aprendizaje por imitación: el modelo etiqueta fotogramas con la acción correspondiente y su probabilidad; las muestras con baja confianza pueden descartarse o enviarse a revisión, lo que reduce el coste de anotación humana. El propio entrenamiento usó frames de DAgger generados así.
- Triage de moderación de contenido visual: clasificación de memes e imágenes con texto entre categorías de odio y no odio (0,80 de exactitud y 0,04 de ECE en Hateful Memes), usando la probabilidad como umbral para derivar casos dudosos a revisión humana.
- Interpretación de diagramas técnicos y científicos: extracción de la respuesta correcta en diagramas anotados y esquemas (0,93 en AI2D, 0,94 en IconQA), útil en herramientas educativas o de soporte técnico que ofrecen opciones cerradas al usuario.
- Evaluación automática de material educativo: preguntas de opción múltiple sobre imágenes de contenido escolar y científico (0,95 en ScienceQA) con puntuación de confianza, para generar informes de progreso sin intervención manual.
- Enrutamiento de decisiones con umbral de confianza: en sistemas multi-tenant o pipelines de producción, la probabilidad calibrada permite definir reglas del tipo "si p > 0,9 actuar, si no escalar", algo que un modelo generativo no ofrece de forma nativa.
- Sustitución de un VLM generativo en tareas de clasificación cerrada: cuando la salida es siempre elegir entre opciones predefinidas, este modelo evita el coste de decodificación autoregresiva y el riesgo de respuestas mal formateadas.
- Reutilización en modo texto: al conservar los pesos de decider-2b v4, se puede emplear el mismo checkpoint para decisiones sobre texto sin imagen, simplificando el despliegue de una única pieza de infraestructura.

## Benchmarks y rendimiento

Resultados reportados por el autor (300 elementos por tarea, salvo indicación contraria). ECE = error de calibración esperado.

| Tarea | Exactitud | ECE |
|---|---|---|
| A-OKVQA | 0,85 | 0,04 |
| AI2D | 0,93 | 0,02 |
| ScienceQA | 0,95 | 0,03 |
| IconQA | 0,94 | 0,02 |
| TQA | 0,82 | 0,06 |
| Raven | 0,80 | 0,07 |
| Hateful Memes | 0,80 | 0,04 |
| Visual7W (retenida) | 0,87 | 0,04 |
| VSR (retenida) | 0,75 | 0,05 |

Rendimiento como política tras el ajuste con PPO desde píxeles (12 iteraciones, política greedily, un episodio por juego):

| Juego | Supervisado | Tras RL desde píxeles | Profesor programado (estado de texto) |
|---|---|---|---|
| Breakout (entrenamiento) | 1 | 16 | 22 |
| Pong (entrenamiento) | 3 | 8 | 8 |
| CliffWalking (entrenamiento) | -13 (óptimo) | -13 | -13 |
| MiniGrid Empty (entrenamiento) | 0,96 | 0,96 | 0,96 |
| Freeway (nunca entrenado) | 6 | 8 | 5 |

No se han publicado resultados de benchmarks comparativos con otros modelos (MMLU, HumanEval, GSM8K u otros) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: en fp16, los pesos ocupan aproximadamente 4,4 GB (el repositorio completo pesa 4,4 GB), a los que hay que sumar el codificador visual, activaciones y el coste de preparar la entrada. En fp32 serían unos 8,9 GB. En int8 rondaría los 2,2 GB, aunque no se publican pesos cuantizados.
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM puede albergar los pesos en fp16 con margen ajustado; 12 GB (RTX 3060 12 GB, RTX 4070) es un objetivo cómodo; 16-24 GB (RTX 4080, RTX 4090, A100 40 GB, H100) no aporta ventaja de capacidad, solo de latencia.
- Cabe en GPU de consumo: sí. El tamaño de 2,21 B de parámetros y los 64 tokens visuales por fotograma lo sitúan en el rango de tarjetas de gama media y alta para consumidores.
- Opciones de despliegue: la inferencia está pensada para el paquete propio `decider` sobre PyTorch (`VisionDecisionModel`, `prepare`, `slot_logits`), con soporte de `grad_ckpt=False` y `.cuda().eval()`. No se documenta compatibilidad con vLLM, TGI, llama.cpp, Ollama ni otros servidores de inferencia estándar; al no ser un modelo generativo con decodificación, estos motores no son directamente aplicables.
- Latencia y throughput: no disponibles. El diseño de un solo *forward pass* sin decodificación y el reducido número de tokens visuales (64 por fotograma de 256×240) apuntan a un coste por paso muy inferior al de un VLM generativo equivalente, pero no se publican medidas.

## Comparativa con modelos similares

La información proporcionada no incluye comparativas de rendimiento con otros modelos. La comparación se limita a las características verificables.

| Modelo | Parámetros | Contexto | Tipo de salida | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| decider-2b-vision | 2,21 B | No disponible | Probabilidad calibrada sobre opciones (sin generación) | Apache-2.0 | HuggingFace + repo de código propio |
| decider-2b (variante de texto) | No disponible | No disponible | Probabilidad calibrada sobre opciones (sin generación) | No disponible | HuggingFace (referenciado por el autor) |
| Qwen/Qwen3.5-2B-Base | No disponible | No disponible | Generación de texto (modelo base) | No disponible | HuggingFace (modelo base) |
| VLM generativos de ~2-3 B (categoría general) | ~2-3 B | No disponible | Texto generado libremente | Varía | Amplia |

No disponible: no se han publicado datos que permitan comparar exactitud, ECE, latencia o coste frente a alternativas generativas de tamaño similar. La diferencia funcional principal frente a un VLM generativo es que decider-2b-vision no produce texto: solo puntúa opciones predefinidas, lo que a cambio ofrece calibración explícita y elimina el coste de decodificación.

## Limitaciones y advertencias

- No es un modelo de chat ni de generación de texto. No se puede usar para redactar, resumir, traducir ni mantener conversaciones; el autor lo indica de forma explícita ("Not intended as a chat model").
- Solo inglés. No hay soporte multilingüe declarado, por lo que el uso en castellano u otros idiomas no está cubierto.
- La longitud de contexto no está documentada. No se puede planificar el uso con entradas largas sin verificarla experimentalmente.
- Riesgo de alucinación bajo en el sentido clásico (no genera texto libre), pero riesgo de decisión incorrecta y de calibración degradada fuera de distribución. El ECE medido es de hasta 0,07 (Raven), lo que implica que en esas tareas los umbrales de confianza deben fijarse con margen.
- Sesgo de dominio: el entrenamiento se apoya fuertemente en fotogramas de videojuegos etiquetados por políticas programadas y en tareas de opción múltiple de The Cauldron. El rendimiento en dominios visuales alejados de esos conjuntos no está caracterizado.
- Fallos conocidos reportados por el autor: mundos de rejilla con profesores débiles y Super Mario Bros desde píxeles. El análisis completo de fallos está en el README de GitHub, no en la model card.
- El RL desde píxeles solo se aplicó a Breakout y Pong, por lo que las mejoras de política pueden no generalizar a otros entornos; en Freeway (no entrenado) la mejora fue de 6 a 8 frente a 5 del profesor programado.
- Requiere código propio (`decider`) para la inferencia. No es un checkpoint enchufable en los servidores estándar del ecosistema.
- Licencia Apache-2.0 para el ajuste, lo que en principio permite uso comercial; conviene verificar los términos del modelo base Qwen/Qwen3.5-2B-Base, cuyo licenciamiento no se detalla en la información disponible.
- Modelo recién publicado, con 0 descargas y 0 likes en el momento de la consulta. No hay validación independiente de los resultados reportados.
- No se documentan versiones cuantizadas, por lo que el despliegue en hardware muy limitado exige cuantizar por cuenta propia asumiendo el riesgo de degradar la calibración.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Mapika/decider-2b-vision
- Repositorio de código: https://github.com/Mapika/decider
- Variante de texto del mismo autor: https://huggingface.co/Mapika/decider-2b
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-2B-Base
- Búsqueda web: los resultados obtenidos no guardan relación con el modelo (hilos de foro en francés sobre errores de correo y equipos de instituto), por lo que no se incluye ningún enlace adicional. No se han encontrado papers, blogs ni demos asociados en la información disponible.
