# cribl-ai/cribl-decision-2-0.8B

## Resumen

Cribl Decision 2 Mini es un modelo de 752 millones de parámetros (0,75B) desarrollado por cribl-ai, un fine-tune del backbone de texto Qwen3.5-0.8B especializado en responder preguntas de elección múltiple sobre datos de TI, seguridad y telemetría. No es un modelo generativo: recibe un estado (cualquier texto, como líneas de log, un inventario o un fragmento de configuración), una pregunta y una lista de opciones, y devuelve una probabilidad calibrada para cada opción en un único forward pass, sin generar texto.

El modelo resuelve un problema concreto de clasificación y extracción de información en pipelines de observabilidad: determinar qué tipo de log es una línea, si un evento es sospechoso, qué campo contiene el usuario o cuál es la severidad de una alerta. Su tamaño reducido permite desplegarlo en entornos con recursos limitados y con latencias bajas, lo que lo hace adecuado para procesar grandes volúmenes de telemetría en tiempo casi real.

La relevancia actual del modelo radica en su enfoque de "lector" en lugar de "generador": al leer el prompt en ambas direcciones mediante capas de atención bidireccional y un scorer de opciones de bajo rango, evita los costes y la variabilidad de la generación de texto, y además soporta hasta 255 opciones por pregunta (limitado únicamente por la longitud del prompt, fijada en 4.096 tokens). Se publica bajo licencia Apache 2.0 y solo soporta inglés.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer híbrido (Qwen3.5-0.8B: 24 capas, de las cuales 6 son de atención completa y el resto de atención lineal) con atención bidireccional en las capas completas, lectura inversa en las capas lineales previas a cada capa completa y un scorer de opciones bilineal de bajo rango |
| Parámetros totales | 752.393.024 (0,75B) |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | 4.096 tokens de prompt; entradas más largas lanzan un error en lugar de truncarse |
| Tipos de cuantización | No disponible (el modelo se libera en safetensors; la model card no detalla cuantizaciones oficiales) |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (checkpoint estándar de transformers más `decision_head.safetensors` y `decision_config.json`) |

## Arquitectura y entrenamiento

El modelo parte del backbone de texto de Qwen3.5-0.8B, un transformer híbrido con 24 capas, de las cuales 6 son de atención completa y el resto de atención lineal. Sobre esta base se introducen tres modificaciones. Primero, las 6 capas de atención completa pasan a ser bidireccionales, de modo que ven todo el prompt en ambos sentidos. Segundo, la capa de atención lineal inmediatamente anterior a cada capa de atención completa lee también el prompt de derecha a izquierda con los mismos pesos, y las dos direcciones se mezclan mediante una compuerta aprendida (`reverse_gate.<layer>`); el resto de capas lineales siguen leyendo de izquierda a derecha como en el modelo base. Tercero, se añade un scorer de opciones: cada opción termina en su propio token marcador, y el logit de una opción es una puntuación bilineal de rango 256 entre el estado oculto final en el token de lectura y el estado en el marcador de esa opción; un softmax sobre las opciones de la pregunta produce las probabilidades. No hay tabla de etiquetas de respuesta, por lo que el número de opciones solo está limitado por la longitud del prompt (en entrenamiento se usaron hasta 255).

El entrenamiento se realizó en tres etapas a partir de Qwen3.5-0.8B. La etapa general usó aproximadamente 400.000 preguntas de elección múltiple y clasificación convertidas de datasets públicos de NLP. La etapa de lector usó unas 130.000 preguntas generales en el formato de prompt final, para entrenar las capas de lectura inversa y el nuevo scorer de opciones. La etapa de dominio usó unas 40.000 preguntas, aproximadamente la mitad sobre TI, seguridad y telemetría, y la otra mitad preguntas generales reproducidas de la primera etapa para preservar la capacidad general del modelo. Los pesos liberados son la media de igual peso de dos ejecuciones de fine-tuning con semillas distintas; como promediar dos scorers entrenados por separado reduce sus logits, la media incorpora una temperatura de 0,41 ajustada sobre preguntas generales de dev reservadas (nunca sobre los benchmarks) y plegada en los pesos del scorer. El prompt es exactamente la plantilla de chat del tokenizador tal como se usó en entrenamiento, incluyendo la cabecera de asistente y el bloque de pensamiento vacío tras el token de lectura; la respuesta se lee en el token de lectura.

## Capacidades

- Clasificación y elección múltiple sobre texto libre: devuelve una distribución de probabilidad calibrada sobre todas las opciones en un único forward pass, sin generación de texto.
- Tres tipos de pregunta: `choice` (lista de etiquetas o mapping etiqueta → descripción, con `None` para sin descripción), `boolean` (respuesta `"false"` o `"true"`, con descripciones opcionales) y `score` (niveles ordenados de menor a mayor, con un valor `expected` ponderado por probabilidad, por ejemplo `low/medium/high` a `0.05/0.30/0.65` da 2,60).
- Análisis de logs y telemetría: identificación de tipo de log (por ejemplo, firewall Linux netfilter/UFW frente a servidor OpenSSH), detección de eventos sospechosos, localización de campos (como el campo que contiene el usuario) y evaluación de severidad de alertas.
- Preguntas de seguridad: detección de intentos de fuerza bruta y clasificación de eventos anómalos a partir de estados textuales.
- Procesamiento por lotes: `decide_batch` admite varias preguntas, cada una como su propia secuencia, con padding a la derecha y tamaño de lote configurable.
- Soporte de hasta 255 opciones por pregunta (limitado por la longitud del prompt), sin tabla de etiquetas fija.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni generación de texto; tampoco soporta `pipeline()` de clasificación de texto de transformers.
- Capacidad multilingüe limitada al inglés.

## Casos de uso

- Clasificación de tipos de log en pipelines de ingesta: dado un estado con una o varias líneas de log, el modelo devuelve la probabilidad de cada tipo de log candidato (firewall, SSH, aplicación, etc.), lo que permite enrutar eventos a parsers o índices distintos sin escribir reglas manuales para cada formato.
- Detección de fuerza bruta y accesos anómalos: con un estado como `user=alice action=login result=failure count=37 window=60s`, el modelo responde a la pregunta booleana de si es probable un intento de fuerza bruta, adecuado para alertas tempranas en sistemas de autenticación.
- Triaje de alertas de infraestructura: a partir de métricas textuales (por ejemplo, CPU al 98% durante 45 minutos en db-03 con p99 de 4,2 s), el modelo asigna una severidad en una escala ordenada y calcula un nivel esperado ponderado, útil para priorizar la cola de incidentes.
- Extracción de campos en datos no estructurados: formular preguntas de elección múltiple sobre qué campo de un registro contiene el usuario, la IP de origen o el identificador de sesión, para normalizar telemetría heterogénea antes de almacenarla.
- Enriquecimiento de inventarios y configuraciones: dado un fragmento de configuración o un inventario, el modelo puede responder preguntas cerradas sobre el tipo de dispositivo, el rol del servicio o la presencia de una directiva concreta, con probabilidades calibradas para umbralizar decisiones.
- Filtrado y priorización de documentos de seguridad: clasificar extractos de documentación o avisos en categorías predefinidas (por ejemplo, tipo de vulnerabilidad o criticidad) usando el modo `choice` con descripciones de etiqueta, lo que reduce el volumen que llega a revisión humana.
- Procesamiento por lotes de telemetría a gran escala: gracias a su tamaño de 0,75B y a la inferencia en un solo forward pass sin generación, puede ejecutarse sobre lotes de preguntas en CPU, Apple Silicon (MPS) o CUDA en bf16, lo que encaja en tareas de clasificación masiva dentro de pipelines de observabilidad.

## Benchmarks y rendimiento

La model card incluye una tabla de evaluación cuyo contenido proporcionado está truncado (solo se muestran las cabeceras: Benchmark, Questions, Accuracy, Macro accuracy, NLL). No se han publicado en la información disponible los valores numéricos de accuracy, macro accuracy ni NLL para los benchmarks, por lo que no se presentan cifras.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita en la model card; con 752 millones de parámetros, el checkpoint en safetensors ocupa 1,5 GB en el repositorio, y la inferencia en bf16 requiere del orden de 1,5-2 GB de memoria más el overhead del runtime (estimación orientativa, no confirmada por el autor).
- GPU recomendadas: no especificadas por el autor; el modelo funciona en CUDA, Apple Silicon (MPS) y CPU en bf16.
- En CUDA, instalar `flash-linear-attention` y `causal-conv1d` acelera notablemente las capas de atención lineal.
- Cabe en GPU de consumo: por su tamaño (0,75B), es apto para GPUs consumer con suficiente memoria para bf16, aunque el autor no publica una lista de modelos concretos.
- Opciones de despliegue: la vía de referencia es `transformers` (>= 5.17) con `DecisionModel` de `decision.py` o `AutoModel.from_pretrained(..., trust_remote_code=True)`; sin `trust_remote_code=True`, `AutoModel` carga solo el backbone, que no puede puntuar opciones por sí solo. No se mencionan vLLM, llama.cpp, Ollama ni TGI, y los `pipeline()` de clasificación de texto no están soportados.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tipo de tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Cribl Decision 2 Mini | 0,75B | 4.096 tokens | Elección múltiple y clasificación con scorer de opciones | Apache 2.0 | Hugging Face (cribl-ai/cribl-decision-2-mini) |
| Cribl Decision 2 | 4B | No disponible | Elección múltiple y clasificación con scorer de opciones (mayor precisión según el autor) | No disponible en la información | Hugging Face (cribl-ai/cribl-decision-2) |
| Qwen3.5-0.8B | 0,8B (aproximado) | No disponible | Modelo base de texto generativo | No disponible en la información | Hugging Face (Qwen/Qwen3.5-0.8B) |

No se dispone de datos de benchmarks ni de otros modelos comparables de la misma categoría en la información proporcionada.

## Limitaciones y advertencias

- Solo inglés: el modelo no soporta otros idiomas, lo que limita su uso en entornos con logs o documentación en castellano u otras lenguas.
- No es generativo: no produce texto libre, no soporta tool calling, function calling, agentes ni razonamiento multi-paso; su uso está restringido a preguntas de elección múltiple, booleanas o de puntuación.
- Límite estricto de 4.096 tokens de prompt: las entradas más largas lanzan un error en lugar de truncarse, por lo que hay que segmentar previamente los estados largos.
- Dependencia de código remoto: el uso completo requiere `trust_remote_code=True` o el `decision.py` del repositorio; sin ello, `AutoModel` carga solo el backbone, que no puede puntuar opciones.
- Riesgo de alucinación y calibración: las probabilidades dependen de la temperatura (0,41) ajustada sobre preguntas generales de dev y plegada en los pesos del scorer; fuera de la distribución de entrenamiento (TI, seguridad y telemetría) la calibración puede degradarse.
- Sesgos: no se documentan sesgos conocidos en la información proporcionada; al derivar de datasets públicos de NLP, puede heredar sesgos presentes en ellos.
- Licencia Apache 2.0: permite uso comercial, pero conviene revisar las condiciones del modelo base Qwen3.5-0.8B y de los datasets de entrenamiento.
- Para producción: el autor recomienda Cribl Decision 2 (4B) si se necesita mayor precisión; el Mini está pensado para velocidad y recursos limitados.
- Estado del repositorio: 23 descargas y 0 likes en el momento de la consulta, lo que indica una adopción todavía muy baja y poca validación externa.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/cribl-ai/cribl-decision-2-mini
- Modelo de mayor precisión (4B): https://huggingface.co/cribl-ai/cribl-decision-2
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
