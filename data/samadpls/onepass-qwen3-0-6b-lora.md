# samadpls/onepass-qwen3-0.6b-lora

## Resumen

onepass-qwen3-0.6b-lora es un adaptador LoRA en formato PEFT sobre el modelo base Qwen/Qwen3-0.6B, desarrollado por samadpls. No es un modelo generativo al uso: es un modelo de decisión tipada que, dado un texto de entrada (el "estado") y una batería de preguntas con opciones cerradas (sí/no, elegir una opción, elegir un nivel en una escala), devuelve una distribución de probabilidad sobre cada respuesta posible en un único forward pass. El resultado se lee directamente de las puntuaciones de los tokens correspondientes a las letras de cada opción, de modo que la salida nunca puede estar mal formada.

La relevancia del modelo está en su enfoque: en lugar de generar texto y parsearlo, calcula probabilidades calibradas para todas las preguntas a la vez. Se entrenó sobre la proporción de anotadores humanos que eligieron cada respuesta, no sobre una única etiqueta mayoritaria, lo que produce probabilidades calibradas (ECE de 0,049 en el benchmark de referencia). El adaptador entrena 20 millones de parámetros sobre un modelo de 0,6B, con un tamaño de repositorio de 0,1 GB (81 MB en fp32).

Está pensado para tareas de clasificación y decisión estructurada en inglés: enrutamiento de tickets, extracción de decisiones tipadas, evaluación de trazas de agentes o verificación de respuestas en pipelines RAG. Su licencia Apache-2.0 y su tamaño reducido lo hacen desplegable en hardware modesto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen3) con adaptador LoRA (PEFT) |
| Parametros totales | 0,6B (modelo base); 20M entrenados con LoRA |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible en esta ficha; el autor publica una variante GGUF en samadpls/onepass-qwen3-0.6b-GGUF |
| Idiomas soportados | ingles (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA); GGUF disponible en repositorio separado |

## Arquitectura y entrenamiento

El adaptador se aplica sobre Qwen3-0.6B, un transformer decoder-only. La configuración LoRA usa rank 32 y alpha 64, sin dropout, y ataca los módulos `q_proj`, `k_proj`, `v_proj`, `o_proj`, `gate_proj`, `up_proj` y `down_proj` en los 28 bloques del modelo base. El adaptador pesa 81 MB en fp32.

El entrenamiento usó 68.061 textos con 138.928 preguntas procedentes de 19 conjuntos de datos abiertos, entre ellos BoolQ, MultiNLI, WANLI, PAWS, Civil Comments, Banking77, CLINC OOS, DBpedia 14, GoEmotions, HelpSteer2 y BRIGHTER. La innovación clave es el objetivo de entrenamiento: en lugar de una etiqueta única, se aprende la distribución de respuestas de los anotadores humanos, lo que da lugar a probabilidades calibradas (temperatura de calibración 1,0). El prompt coloca cada pregunta con sus opciones como letras (A, B, C...) seguidas de `Answer:`, y un marcador de posición fijo tras cada slot impide que una respuesta condicione la siguiente. El modelo se evaluó en LocalLLaMA/typed-decisions, un benchmark en el que no fue entrenado.

## Capacidades

- Decisión tipada en un solo paso: responde simultáneamente a múltiples preguntas de tipo sí/no, elección única y escala de niveles.
- Salida en forma de distribución de probabilidad por opción, sin generación de texto libre y por tanto sin riesgo de formato inválido.
- Probabilidades calibradas sobre la proporción de anotadores humanos.
- Clasificación de texto: spam, intenciones (Banking77, CLINC OOS), temas (DBpedia 14).
- Análisis de sentimiento, emociones y toxicidad (GoEmotions, Hate Speech Offensive, Measuring Hate Speech, Civil Comments).
- Inferencia de relación entre frases (NLI: MultiNLI, WANLI, UNLI) y paráfrasis (PAWS).
- Evaluación de calidad de resúmenes y de soporte de respuestas en contexto RAG (RAGTruth).
- Decisión sobre trazas de agentes y flujos de trabajo (atención al cliente, facturas, incidentes de seguridad).
- No soporta generación de texto libre, tool calling ni razonamiento multi-paso generativo; su función es clasificar y decidir, no conversar.
- Solo inglés.

## Casos de uso

- Enrutamiento de tickets de soporte: dado el texto de un mensaje y preguntas como "¿es un reembolso?" o "¿equipo?", el modelo devuelve probabilidades (p. ej. reembolso 0,96, equipo billing 0,98) en un único forward pass, lo que permite umbrales de confianza y derivación automática.
- Clasificación de intenciones en asistentes conversacionales: con entrenamiento sobre Banking77 y CLINC OOS, puede etiquetar la intención del usuario entre un conjunto cerrado de opciones sin generar texto que haya que parsear.
- Moderación de contenido: clasificación de toxicidad, odio y emociones (GoEmotions, Civil Comments, Measuring Hate Speech) con probabilidades calibradas que permiten fijar políticas de umbral.
- Verificación de respuestas en pipelines RAG: responder a la pregunta "¿está la respuesta respaldada por el contexto?" (evaluado en RAGTruth) para filtrar alucinaciones antes de mostrar la respuesta al usuario.
- Evaluación de calidad de resúmenes generados: puntuar resúmenes en una escala de niveles (evaluado en SummEval) para seleccionar la mejor salida entre varias candidatas.
- Auditoría de trazas de agentes: dado el registro de un agente, responder preguntas tipadas sobre si completó la tarea, si usó una herramienta concreta o si hubo un error, útil para monitorización automatizada.
- Procesamiento de facturas y documentos: extracción de decisiones tipadas (¿es una factura?, ¿contiene un importe?, ¿es duplicada?) a partir del texto del documento.

## Benchmarks y rendimiento

Evaluado sobre el split de test de 400 casos (2.000 decisiones) de LocalLLaMA/typed-decisions, con las fórmulas del script oficial del benchmark. Accuracy: mayor es mejor; KL, Brier y ECE: menor es mejor.

| Modelo | Accuracy | KL from gold | Brier | ECE |
|---|---|---|---|---|
| Qwen3-0.6B sin fine-tuning | 0,311 | 0,888 | 0,428 | 0,306 |
| Frecuencias de etiqueta del train split (ignora la entrada) | 0,481 | 0,327 | 0,181 | 0,036 |
| onepass 0.6B | 0,601 | 0,270 | 0,154 | 0,049 |

Accuracy por tipo de pregunta y por flujo de trabajo:

| Categoría | Accuracy |
|---|---|
| Sí/no | 0,737 |
| Elegir una opción | 0,518 |
| Elegir un nivel | 0,561 |
| Trazas de agentes | 0,564 |
| Atención al cliente | 0,630 |
| Facturas | 0,614 |
| Incidentes de seguridad | 0,596 |

Conjuntos humanos retenidos (nunca vistos en entrenamiento), accuracy antes → después del fine-tuning:

| Conjunto | Respuesta más común | Antes → después |
|---|---|---|
| CondaQA (negación, sí/no) | 0,483 | 0,455 → 0,563 |
| Cosmos QA (sentido común, elegir una) | 0,260 | 0,282 → 0,373 |
| SummEval (calidad de resumen, nivel) | 0,651 | 0,504 → 0,265 |
| RAGTruth (¿respuesta respaldada?, sí/no) | 0,768 | 0,704 → 0,752 |

El autor señala que la accuracy es mixta (empeora en SummEval) pero las probabilidades mejoran en los cuatro conjuntos (el KL frente a la referencia cae en todos).

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo base de 0,6B en fp16 ocupa aproximadamente 1,2 GB; en 8 bits, del orden de 0,6 GB; en 4 bits, en torno a 0,4 GB. El adaptador LoRA añade 81 MB en fp32. Estas cifras son estimaciones a partir del tamaño de parámetros, no datos publicados por el autor.
- GPU recomendadas: cualquier GPU consumer con al menos 2-4 GB de VRAM es suficiente; RTX 3060, RTX 4060, RTX 4090 o superiores sin problema. En entornos de servidor, A100 o H100 no son necesarias pero funcionan.
- Cabe en GPU consumer: sí, en prácticamente cualquier GPU moderna e incluso en CPU para inferencia por lotes pequeños.
- Opciones de despliegue: transformers + PEFT para el adaptador; llama.cpp u Ollama con la variante GGUF publicada por el autor (samadpls/onepass-qwen3-0.6b-GGUF); el autor no documenta soporte explícito para vLLM o TGI.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia |
|---|---|---|---|---|
| onepass-qwen3-0.6b-lora | 0,6B (20M entrenados) | no disponible | Decisión tipada calibrada, un solo forward pass | Apache-2.0 |
| Qwen3-0.6B (base, sin fine-tuning) | 0,6B | no disponible | Generación de texto general | Apache-2.0 |
| onepass-qwen3-1.7b-lora (mismo autor) | 1,7B | no disponible | Decisión tipada calibrada, misma metodología | Apache-2.0 |

La comparación directa con el modelo base sin fine-tuning muestra la mejora del adaptador: accuracy 0,601 frente a 0,311 y ECE 0,049 frente a 0,306 en typed-decisions. La variante de 1,7B del mismo autor no tiene resultados publicados en esta ficha. No se dispone de comparación con clasificadores dedicados de tamaño similar en la información proporcionada.

## Limitaciones y advertencias

- Solo inglés: no soporta otros idiomas de forma fiable.
- No es un modelo generativo: no puede mantener conversaciones, generar código ni razonar de forma abierta; su salida es siempre una distribución sobre opciones predefinidas.
- Accuracy mixta en conjuntos retenidos: empeora respecto al baseline en SummEval (0,504 → 0,265), lo que indica que la calibración no garantiza mejor accuracy en todas las tareas.
- Riesgo de sesgo heredado de los conjuntos de entrenamiento (Civil Comments, Hate Speech Offensive, Measuring Hate Speech, HelpSteer2), que pueden contener anotaciones subjetivas o culturalmente sesgadas.
- Las probabilidades calibradas no eliminan el riesgo de error: en preguntas de elección única la accuracy es solo 0,518.
- La longitud de contexto no está documentada; prompts con estados muy largos pueden degradar el rendimiento.
- Aunque la licencia es Apache-2.0 y permite uso comercial, conviene validar el modelo en el dominio concreto antes de producción, dado el rendimiento desigual por tarea.
- El repositorio tiene 0 descargas y 1 like en el momento de la consulta: es un proyecto reciente (creado en noviembre de 2026) sin validación comunitaria amplia.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/samadpls/onepass-qwen3-0.6b-lora
- Modelo completo: https://huggingface.co/samadpls/onepass-qwen3-0.6b
- Variante GGUF: https://huggingface.co/samadpls/onepass-qwen3-0.6b-GGUF
- Variante de 1,7B: https://huggingface.co/samadpls/onepass-qwen3-1.7b-lora
- Modelo base: https://huggingface.co/Qwen/Qwen3-0.6B
- Repositorio de código: https://github.com/samadpls/onepass
- Benchmark: https://huggingface.co/datasets/LocalLLaMA/typed-decisions
- Repositorio de fine-tuning: https://github.com/junaiddshaukat/finetune-anywhere
- Web del autor: https://samadpls.com
