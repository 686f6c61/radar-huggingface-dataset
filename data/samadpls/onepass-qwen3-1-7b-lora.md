# samadpls/onepass-qwen3-1.7b-lora

## Resumen
onepass-qwen3-1.7b-lora es un adaptador LoRA (PEFT) sobre el modelo base Qwen/Qwen3-1.7B, desarrollado por samadpls. No es un modelo generativo al uso: es un modelo de decisión tipada que recibe un texto de estado y una o varias preguntas cerradas (sí/no, elegir una opción entre varias, o seleccionar un nivel en una escala) y devuelve, en una única pasada forward, una distribución de probabilidad sobre cada respuesta posible. La salida se lee directamente de los logits de los tokens correspondientes a las letras de opción, por lo que no hay generación de texto y la respuesta nunca puede estar mal formada.

El modelo está calibrado: se entrenó sobre la proporción de anotadores humanos que eligieron cada respuesta, no sobre una etiqueta única, lo que produce probabilidades con sentido probabilístico (Brier 0.129, ECE 0.076 en el split de test del benchmark LocalLLaMA/typed-decisions). El adaptador entrena 35M parámetros sobre los 1.7B del base, con rango 32, alpha 64 y sin dropout, apuntando a las siete proyecciones de las 28 capas del transformer.

Su relevancia reside en el nicho: sustituye tareas de clasificación y enrutamiento que normalmente se resuelven con llamadas a un LLM generativo (más caras, más lentas y con riesgo de formato inválido) por una pasada única y determinista sobre un modelo de 1.7B. Está pensado para enrutamiento de tickets, extracción de decisiones binarias, moderación y evaluación de trazas de agentes.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen3) con adaptador LoRA; cabezal de decisión implícito sobre logits de letras de opción |
| Parametros totales | 1.7B (modelo base) + 35M entrenados en el adaptador |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (heredada del base Qwen3-1.7B) |
| Tipos de cuantizacion | no disponible para el adaptador; existen pesos GGUF en samadpls/onepass-qwen3-1.7b-GGUF |
| Idiomas soportados | inglés (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors en formato PEFT (adaptador LoRA, 140 MB en fp32); GGUF disponible en repositorio separado |

## Arquitectura y entrenamiento
El adaptador se aplica sobre Qwen3-1.7B, un transformer decoder-only. El entrenamiento LoRA usa rango 32, alpha 64, sin dropout, y apunta a `q_proj`, `k_proj`, `v_proj`, `o_proj`, `gate_proj`, `up_proj` y `down_proj` en las 28 capas del modelo base. El adaptador ocupa 140 MB en fp32.

Los datos de entrenamiento son 68.061 textos con 138.928 preguntas procedentes de 19 datasets abiertos, entre ellos n4ze3m/typed-decisions-synth, decisionmodels/sn92-specialists, tasksource/procedural-typed-decisions, BoolQ, UNLI, MultiNLI, WANLI, Civil Comments, PAWS, VitaminC, SMS Spam Collection, Banking77, CLINC OOS, DBpedia-14, Hate Speech Offensive, GoEmotions, Measuring Hate Speech, HelpSteer2 y BRIGHTER. El objetivo de entrenamiento no es la etiqueta mayoritaria sino la distribución de respuestas de anotadores humanos (cross-entropy sobre la distribución), con una temperatura de calibración final de 1.05.

La innovación técnica clave es el esquema de prompt: el estado se lista seguido de cada pregunta con sus opciones etiquetadas como letras (A, B, C...) y el sufijo `Answer:`; las probabilidades se leen de los logits de esas letras en esa posición. Un placeholder fijo tras cada slot impide que una respuesta contamine la siguiente, de modo que cada decisión depende solo del estado y de las preguntas previas. No hay decodificación especulativa ni generación autoregresiva de la respuesta.

## Capacidades
- Clasificación binaria (sí/no) con probabilidad calibrada.
- Elección única entre un conjunto cerrado de opciones (enrutamiento, etiquetado).
- Selección de nivel en una escala ordinal (calidad, intensidad, severidad).
- Respuesta a varias preguntas en una sola pasada forward.
- Probabilidades calibradas sobre proporción de anotadores, aptas para umbrales y agregación.
- Salida estructuralmente válida por construcción (no hay texto generado que pueda malformarse).
- Especialización en dominios de los datasets de entrenamiento: atención al cliente, facturas, incidentes de seguridad, trazas de agentes, moderación de contenido.
- No soporta tool calling ni function calling.
- No soporta razonamiento multi-paso generativo ni modo thinking.
- Sin capacidades de visión, audio ni multimodalidad.
- Multilingüe limitado al inglés.

## Casos de uso
- Enrutamiento de tickets de soporte: dado el mensaje del cliente y una pregunta de elección única con las categorías de equipo (billing, técnico, cuenta...), el modelo devuelve la distribución sobre cada equipo en una pasada; la probabilidad permite derivar a revisión humana cuando la confianza es baja. El autor reporta 0.686 de accuracy en el flujo de customer service.
- Moderación y triaje de contenido: preguntas de sí/no sobre toxicidad, odio o spam, con probabilidad calibrada para fijar umbrales de escalado en lugar de depender de un score sin calibrar.
- Procesamiento de facturas: extracción de decisiones tipadas (¿es una factura?, ¿qué nivel de confianza en el importe?, ¿requiere aprobación?) sobre texto OCR, con 0.654 de accuracy en el flujo de invoices.
- Triaje de incidentes de seguridad: clasificación de severidad en escala y decisión binaria de escalado (0.668 de accuracy en security incidents), útil en pipelines de alertas donde la latencia importa.
- Evaluación de trazas de agentes: decidir si una traza cumple criterios (¿usó la herramienta correcta?, ¿respetó el formato?) con 0.574 de accuracy en trazas de agente, como filtro previo a evaluación con LLM mayor.
- Verificación de respuestas RAG: pregunta sí/no sobre si la respuesta está respaldada por el contexto; el autor reporta 0.760 de accuracy en RAGTruth tras el ajuste, frente a 0.476 antes, lo que lo hace viable como guardarraíl de fidelidad.
- Clasificación de spam y categorización de intenciones en dominios de los datasets de entrenamiento (SMS Spam, Banking77, CLINC), con la ventaja de obtener probabilidades en una sola pasada.

## Benchmarks y rendimiento
Evaluado sobre el split de test de 400 casos (2.000 decisiones) de LocalLLaMA/typed-decisions, con las fórmulas del script de scoring del benchmark. Accuracy más alto es mejor; KL, Brier y ECE más bajo es mejor.

| Modelo | Accuracy | KL from gold | Brier | ECE |
|---|---|---|---|---|
| Qwen3-1.7B sin fine-tuning | 0.278 | 1.914 | 0.812 | 0.611 |
| Frecuencias de etiqueta del train split (ignora la entrada) | 0.481 | 0.327 | 0.181 | 0.036 |
| onepass 1.7B | 0.646 | 0.236 | 0.129 | 0.076 |

Accuracy por tipo de pregunta y flujo:

| Categoría | Accuracy |
|---|---|
| Sí/no | 0.755 |
| Elegir una | 0.605 |
| Elegir nivel | 0.594 |
| Trazas de agente | 0.574 |
| Atención al cliente | 0.686 |
| Facturas | 0.654 |
| Incidentes de seguridad | 0.668 |

Conjuntos humanos held-out (nunca vistos en entrenamiento), accuracy antes → después:

| Conjunto | Respuesta mayoritaria | Antes → después |
|---|---|---|
| CondaQA (negación, sí/no) | 0.483 | 0.495 → 0.476 |
| Cosmos QA (sentido común, elegir una) | 0.260 | 0.529 → 0.506 |
| SummEval (calidad de resumen, nivel) | 0.651 | 0.073 → 0.376 |
| RAGTruth (¿respuesta respaldada?, sí/no) | 0.768 | 0.476 → 0.760 |

El autor indica que la accuracy es mixta en held-out, pero las probabilidades mejoran en los cuatro conjuntos (el KL respecto al gold cae en todos).

## Requisitos de hardware
- VRAM estimada: el adaptador añade 140 MB en fp32 sobre el base. El base Qwen3-1.7B en bf16 ocupa aproximadamente 3,4 GB de pesos; en cuantización de 8 bits, en torno a 1,7-2 GB; en 4 bits, en torno a 1-1,2 GB. Cifras estimadas a partir del tamaño de parámetros, no publicadas por el autor.
- GPU recomendadas: cualquier GPU con al menos 4-6 GB de VRAM para bf16; RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4090, L4, A10G, A100 y H100 son holgadas. Cabe en GPUs de consumo.
- Despliegue: el adaptador se carga con PEFT + Transformers (ver ejemplo del autor). Para el modelo completo y GGUF existen repositorios separados (samadpls/onepass-qwen3-1.7b y samadpls/onepass-qwen3-1.7b-GGUF), lo que permite llama.cpp u Ollama con los GGUF. vLLM y TGI son posibles con el modelo fusionado, aunque el esquema de lectura de logits de letras requiere lógica de post-proceso propia.
- Latencia y throughput: no publicados. Al ser una sola pasada forward sin generación, la latencia es sustancialmente menor que la de un LLM generativo del mismo tamaño respondiendo las mismas preguntas, pero no hay cifras en la información disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| onepass-qwen3-1.7b-lora | 1.7B (35M entrenados) | no disponible | Decisión tipada en una pasada, probabilidades calibradas | Apache-2.0 | HF (adaptador, modelo completo y GGUF) |
| Qwen3-1.7B (base) | 1.7B | no disponible | LLM generativo generalista | Apache-2.0 | HF |
| onepass-qwen3-0.6b-lora | 0.6B | no disponible | Misma tarea, versión menor | Apache-2.0 | HF |

Frente al Qwen3-1.7B sin ajustar, onepass sube la accuracy de 0.278 a 0.646 y reduce el Brier de 0.812 a 0.129 en el benchmark de decisiones, a costa de renunciar a la generación libre. Frente a la variante de 0.6B del mismo autor, la de 1.7B ofrece mayor accuracy (el autor cita 0.92 y 0.95 en probabilidades de ejemplo para este tamaño) a cambio de más VRAM. No se dispone de comparación con clasificadores dedicados (p. ej., DeBERTa fine-tuneado) en la información proporcionada.

## Limitaciones y advertencias
- Solo inglés; no hay soporte multilingüe declarado.
- Solo responde preguntas cerradas con opciones predefinidas; no genera texto libre ni razona de forma abierta.
- Accuracy mixta en conjuntos held-out: en CondaQA y Cosmos QA empeora ligeramente respecto al modelo base (0.495 → 0.476 y 0.529 → 0.506), por lo que la generalización fuera de los dominios de entrenamiento no está garantizada.
- Riesgo de sobreajuste a la distribución de los 19 datasets de entrenamiento; el comportamiento en dominios nuevos requiere validación propia.
- Las probabilidades están calibradas con temperatura 1.05; usar otra temperatura o no aplicarla altera la calibración (ECE 0.076).
- Posibles sesgos heredados de los datasets de moderación y emoción (Civil Comments, Hate Speech Offensive, GoEmotions, Measuring Hate Speech), que reflejan sesgos de anotación.
- Licencia Apache-2.0 permite uso comercial, pero el modelo base Qwen3-1.7B tiene sus propios términos que deben respetarse.
- El adaptador no incluye el modelo base; hay que descargar Qwen/Qwen3-1.7B por separado.
- El esquema de prompt (letras de opción, sufijo `Answer:`, placeholder entre slots) es parte del contrato del modelo; desviarse de él invalida las probabilidades.
- Sin datos publicados de latencia, throughput ni longitud de contexto efectiva para esta tarea.

## Enlaces
- Adaptador LoRA: https://huggingface.co/samadpls/onepass-qwen3-1.7b-lora
- Modelo completo: https://huggingface.co/samadpls/onepass-qwen3-1.7b
- GGUF: https://huggingface.co/samadpls/onepass-qwen3-1.7b-GGUF
- Variante 0.6B: https://huggingface.co/samadpls/onepass-qwen3-0.6b-lora
- Modelo base: https://huggingface.co/Qwen/Qwen3-1.7B
- Código: https://github.com/samadpls/onepass
- Benchmark: https://huggingface.co/datasets/LocalLLaMA/typed-decisions
- Web del autor: https://samadpls.com
- Repositorio de fine-tuning citado: https://github.com/junaiddshaukat/finetune-anywhere
