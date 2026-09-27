# helmo/DecidaBERT-large

## Resumen

DecidaBERT-large es un modelo de decisión de tipo encoder, desarrollado por el usuario helmo, que lee un estado (una descripción en lenguaje natural de una situación) y un conjunto de preguntas tipadas, y responde a todas ellas en una sola pasada hacia delante sin generar ningún token. Cada respuesta es una distribución de probabilidad sobre las opciones, niveles o la veracidad de un enunciado, no una frase. Se trata de un ModernBERT de 421.293.827 parámetros (aproximadamente 421M), afinado a partir de tasksource/ModernBERT-large-nli, pensado para ejecutarse en la GPU de un portátil en decenas de milisegundos y para ser servido por el framework Decida.

El modelo cubre tres tipos de pregunta: `choice` (entre 2 y 255 opciones con descripción), `score` (una lista ordenada de niveles) y `noul` (una pregunta de sí/no sobre el estado). Su propuesta encaja en la categoría de "system one" o decisión rápida: en lugar de razonar paso a paso con un modelo generativo, puntúa de forma calibrada y directa. Esto lo hace relevante para enrutado, clasificación y toma de decisiones de baja latencia, donde el coste de un modelo de lenguaje grande sería desproporcionado.

Es un modelo muy reciente (creado y actualizado el 26 de septiembre de 2026), con cero descargas y cero "likes" en el momento de la consulta, y publica resultados detallados en el conjunto de prueba typed-decisions. El propio autor advierte de que fue entrenado sobre el split de entrenamiento de ese mismo benchmark, por lo que sus cifras corresponden a un "modo especialista" y no deben leerse como rendimiento generalista.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (ModernBERT), con cabeza de puntuación personalizada |
| Parametros totales | 421.293.827 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 2048 tokens en el ejemplo de servicio (`--max-len 2048`); no se especifica otro maximo |
| Tipos de cuantizacion | No disponible (el repositorio solo distribuye pesos en safetensors) |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (1,7 GB de repositorio) |

## Arquitectura y entrenamiento

El modelo es un encoder ModernBERT de 421M parámetros, afinado desde tasksource/ModernBERT-large-nli. La innovación principal no está en el backbone, sino en la cabeza de puntuación: en lugar de generar texto, el modelo lee un estado, empaqueta después las instrucciones y las descripciones de todas las opciones, y extrae un marcador por opción para producir una distribución de probabilidad. Los pesos usan el mismo layout que Laya (convaiinnovations/laya) y no cargan con `AutoModel` convencional, porque la cabeza de scoring es personalizada; hay que servirlos con Decida o leer el cargador del repositorio (`src/decida/model/enc.py`).

En cuanto a los datos, la model card indica que se entrenó sobre el split de entrenamiento de LocalLLaMA/typed-decisions y sobre helmo/synthetic-typed-decisions. El conjunto de evaluación contiene 400 casos y 2.000 preguntas, y las etiquetas de referencia son la media de tres muestras de un modelo profesor, con una concordancia del profesor consigo mismo de aproximadamente 0,735, lo que las hace ruidosas. No se detalla en la información disponible el número de tokens de entrenamiento, la composición exacta del dataset ni si se aplicaron fases de RLHF o DPO; tampoco se registra temperatur scaling (`rl_agent_config.json` fija temperatura 1.0). Los datos de benchmarks que se citan son de "modo especialista", es decir, con posible solapamiento entre entrenamiento y prueba.

## Capacidades

- Clasificación y decisión tipada: responde preguntas de tipo `choice` (de 2 a 255 opciones), `score` (niveles ordenados, con nivel esperado) y `noul` (probabilidad de que un enunciado de sí/no sea cierto).
- Respuesta en una sola pasada: todas las preguntas de una petición se puntúan simultáneamente, sin generar tokens, lo que reduce la latencia frente a un modelo autoregresivo equivalente.
- Probabilidades calibradas: devuelve distribuciones, no etiquetas duras, lo que permite umbralizar, ordenar opciones o agregar confianza en un pipeline posterior.
- Procesamiento por lotes: el endpoint `POST /v1/systemone/batch` permite enviar muchas peticiones independientes en una sola llamada.
- Razonamiento simbólico sobre estados descritos en palabras: en el banco de pruebas resuelve tareas de ordenación, elección de posición y navegación cuando el estado se expresa lingüísticamente.
- Capacidades multilingües: no disponibles; el modelo está etiquetado únicamente para inglés.
- Tool calling / function calling, agentes multi-paso, visión y audio: no disponibles o no documentados en la información proporcionada.

## Casos de uso

- Enrutado de tickets de soporte: dado el texto de una queja, el modelo devuelve en una sola pasada la probabilidad de que corresponda a facturación, soporte técnico o ventas, y la probabilidad de que sea urgente mediante una pregunta `noul`. Es adecuado por su baja latencia y por devolver una distribución en lugar de una etiqueta rígida.
- Triaje de correo o mensajes entrantes: clasificar cada mensaje en una taxonomía de categorías definida en tiempo de ejecución (sin reentrenar), gracias al tipo `choice` con hasta 255 opciones descritas.
- Puntuación de prioridad o severidad: usar el tipo `score` para asignar un nivel ordenado (por ejemplo, de "informativo" a "crítico") y obtener tanto la distribución como el nivel esperado, útil para colas de priorización.
- Moderación y verificación de afirmaciones: plantear preguntas `noul` del estilo "¿el mensaje contiene una amenaza?" y usar la probabilidad devuelta como señal de moderación con umbral ajustable.
- Automatización de decisiones en videojuegos o simuladores: el banco de pruebas muestra su uso en Tetris (13,3 líneas por partida) y Flappy (22 pilares superados) cuando el estado se describe con palabras, no con números crudos.
- Orquestación de agentes como "system one": actuar como cabeza de decisión rápida que elige la siguiente acción o herramienta de un agente mayor, resolviendo la elección entre un conjunto acotado de opciones descritas.
- Enrutado de consultas en pipelines RAG: decidir a qué índice, colección o base de conocimiento debe dirigirse una consulta antes de invocar un recuperador o un modelo generativo.
- Navegación y selección sobre catálogos: en Wikispeedia alcanzó el objetivo en 13 de 20 pares de artículos con un máximo de 20 clics, frente a 1 de 100 del clic aleatorio, lo que sugiere utilidad en selección guiada sobre conjuntos de opciones descritas.

## Benchmarks y rendimiento

Conjunto de prueba typed-decisions (split de test retenido de LocalLLaMA/typed-decisions): 400 casos, 2.000 preguntas. Intervalos de confianza de Wilson al 95%. Modelo entrenado sobre el split de entrenamiento del mismo benchmark ("modo especialista").

| Tipo de pregunta | Preguntas | DecidaBERT-large | Intervalo 95% | Azar | Qwen3-0.6B zero-shot |
|---|---|---|---|---|---|
| choice | 600 | 0,722 | 0,685 a 0,756 | 0,233 | 0,350 |
| score | 800 | 0,694 | 0,661 a 0,725 | 0,244 | 0,281 |
| yes/no (noul) | 600 | 0,830 | 0,798 a 0,858 | 0,500 | 0,550 |
| Todos | 2.000 | 0,743 | 0,723 a 0,762 | | 0,383 |

En preguntas de tipo `score`, el modelo queda a un nivel o menos del nivel de referencia el 95,5% de las veces. La calibración (error de calibración esperado, 10 bins, sobre la respuesta principal) es de 0,130 en conjunto: 0,128 en choice, 0,137 en score y 0,122 en sí/no. El modelo es infraconfiado: su confianza media (0,59 en choice, 0,56 en score, 0,71 en sí/no) queda por debajo de su precisión. Qwen3-0.6B, leído en zero-shot a través de letras de opción, muestra el comportamiento opuesto (confianza media 0,92 en choice con precisión 0,35).

| Tarea del banco de pruebas Decida | Resultado |
|---|---|
| Clasificador de caramelos (5 cuencos, 256 preguntas por petición) | 96,5% correctos con descripción en palabras; 19,2% con valores RGB crudos |
| Tetris (3 partidas de 40 piezas) | 13,3 líneas por partida; la mejor opción coincidió con un oráculo exacto el 83% de las veces y el oráculo estuvo en el top 3 el 99% |
| Flappy (30 segundos) | 22 pilares superados sin choque con la altura descrita en palabras; 13 choques con la altura en números |
| Wikispeedia (20 pares, máximo 20 clics) | Objetivo alcanzado en 13 de 20; el clic aleatorio lo logra en 1 de 100; un modelo alojado mayor alcanzó los 20 |

El autor señala que las etiquetas de referencia son ruidosas (concordancia del profesor consigo mismo de ~0,735), por lo que puntuaciones cercanas a 0,75 están cerca del techo que permiten las etiquetas. No se reclama superioridad frente a otros modelos: en el mismo fichero y con el mismo scoring, el checkpoint typed-decisions de Laya obtuvo 0,761 global (choice 0,738, score 0,715, sí/no 0,847). El autor del dataset publicó 0,727 de precisión para TypeSafe Jev 1.13.0 en este test, en modo generalista y con una agregación no confirmada.

## Requisitos de hardware

- VRAM estimada para inferencia (cálculos a partir de los 421M parámetros; no publicados por el autor):
  - fp32: aproximadamente 1,7 GB de pesos (coincide con el tamaño del repositorio).
  - fp16/bf16: aproximadamente 0,85 GB de pesos.
  - int8: aproximadamente 0,42 GB de pesos.
  - int4: aproximadamente 0,21 GB de pesos.
- Al ser un encoder sin generación autoregresiva, no hay caché KV que crezca con la longitud de salida; el consumo adicional proviene de activaciones y de la longitud de la ventana de entrada.
- Cabe holgadamente en GPU de consumo: cualquier tarjeta con 4 GB o más de VRAM (por ejemplo, RTX 3050, RTX 3060, RTX 4060, RTX 4090) puede ejecutarlo, incluso en fp32. El autor lo describe como ejecutable "en la GPU de un portátil".
- GPU recomendadas: no se especifican oficialmente. Por tamaño, bastan GPU de consumo; A100 o H100 no son necesarias.
- Opciones de despliegue: Decida es el soporte previsto (`decida serve --model decidabert=helmo/DecidaBERT-large --max-len 2048`), con instalación mediante `git clone` y `uv sync`. No carga con `AutoModel` de Transformers por la cabeza personalizada. No hay soporte documentado para vLLM, llama.cpp, Ollama ni TGI en la información disponible.
- Latencia y throughput medidos por el autor en una GPU Apple Silicon: aproximadamente 25 ms por petición de una sola pregunta (mediana, una petición a la vez) y aproximadamente 2 segundos para 50 peticiones de tres preguntas enviadas en una sola llamada por lotes.

## Comparativa con modelos similares

| Modelo | Tipo | Resultado en typed-decisions (global) | Licencia | Disponibilidad |
|---|---|---|---|---|
| DecidaBERT-large (helmo) | Encoder ModernBERT de 421M, cabeza personalizada | 0,743 (modo especialista) | Apache 2.0 | Hugging Face |
| Laya (convaiinnovations/laya) | Decisor con el mismo layout de pesos | 0,761 (choice 0,738, score 0,715, sí/no 0,847) | No disponible | Hugging Face |
| Qwen3-0.6B | Modelo generativo leído en zero-shot | 0,383 | No disponible en esta información | No disponible en esta información |
| TypeSafe Jev 1.13.0 | Decisor generalista | 0,727 (agregación no confirmada, no comparable directamente) | No disponible | No disponible |

El autor no reclama que DecidaBERT-large supere a ningún otro modelo, y advierte que la comparación con Jev no es equivalente por diferencias de modo y de agregación. No se dispone de parámetros ni de contexto de Laya, Qwen3-0.6B o TypeSafe Jev en la información proporcionada.

## Limitaciones y advertencias

- Advertencia de especialista: el modelo se entrenó sobre el split de entrenamiento de typed-decisions, el mismo benchmark sobre el que reporta resultados; las cifras no deben interpretarse como rendimiento generalista.
- Sensibilidad al formato de entrada: obtiene buenos resultados cuando el estado se describe con palabras y malos cuando recibe números crudos (96,5% frente a 19,2% en el clasificador de caramelos; 13 choques en Flappy con valores numéricos). El autor recomienda explícitamente "poner el estado en palabras, nunca en números crudos".
- Calibración infraconfiada: ECE de 0,130 y confianza media inferior a la precisión; no se aplica temperature scaling (temperatura 1.0). La confianza absoluta no debe usarse directamente como probabilidad sin recalibrado.
- Etiquetas de referencia ruidosas: al proceder de un profesor con concordancia consigo mismo de ~0,735, el techo práctico de puntuación está cerca de 0,75.
- Conocimiento del mundo limitado: en Wikispeedia alcanzó el objetivo en 13 de 20 casos, mientras que un modelo alojado mayor llegó a 20 de 20; el autor atribuye esta diferencia a conocimiento del mundo.
- Idioma: solo inglés. No hay soporte multilingüe documentado.
- Carga no estándar: los pesos no cargan con `AutoModel`; requieren Decida o un cargador específico, lo que limita la integración con toolchains habituales (vLLM, TGI, llama.cpp, Ollama).
- Sesgos: no se documentan sesgos específicos en la información proporcionada.
- Riesgo de alucinación: al no generar texto, el riesgo no se manifiesta como invención de frases, pero sí como asignación de alta probabilidad a opciones incorrectas cuando el estado está fuera de la distribución de entrenamiento.
- Licencia: Apache 2.0, permisiva para uso comercial, sin restricciones adicionales indicadas.
- Madurez: cero descargas y cero "likes" en el momento de la consulta; el modelo es muy reciente y no tiene validación independiente externa.

## Enlaces

- Hugging Face: https://huggingface.co/helmo/DecidaBERT-large
- Repositorio Decida: https://github.com/heldernoid/decida
- Cargador de modelo en Decida: `src/decida/model/enc.py` (dentro del repositorio anterior)
- Modelo base: https://huggingface.co/tasksource/ModernBERT-large-nli
- Laya (mismo layout de pesos): https://huggingface.co/convaiinnovations/laya
- Dataset de entrenamiento: https://huggingface.co/datasets/LocalLLaMA/typed-decisions
- Dataset de entrenamiento: https://huggingface.co/datasets/helmo/synthetic-typed-decisions
- Script de reproducción: `eval_typed_decisions.py` (mencionado en la model card, dentro del repositorio de Decida)
- La búsqueda web realizada no ha devuelto enlaces relevantes al modelo; los resultados obtenidos corresponden a la institución educativa HELMo y no guardan relación con este proyecto.
