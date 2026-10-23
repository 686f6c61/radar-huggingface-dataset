# microsoft/Sentiment-Analysis-7B

## Resumen

Sentiment-Analysis-7B es un modelo de lenguaje autorregresivo de 7 241 732 096 parámetros (7,24 B) publicado por Microsoft, construido mediante ajuste fino sobre `mistralai/Mistral-7B-Instruct-v0.2`. Su tarea no es la generación de texto abierta, sino la clasificación de sentimiento de mensajes de usuario dirigidos a un servicio, producto o agente (el "Target"), devolviendo una de tres etiquetas —`Positive`, `Neutral` o `Negative`— como primer token generado, seguida opcionalmente de una justificación breve en lenguaje natural.

El ajuste se realizó con aprendizaje por refuerzo usando un LLM como juez, sobre un conjunto interno de aproximadamente 300 ejemplos y sin etiquetas predefinidas. La ficha del autor reporta una accuracy del 72,8 % frente al 62,0 % del modelo base, medido sobre un conjunto de evaluación no descrito. El modelo es relevante como ejemplo de una tendencia concreta: reutilizar un LLM de 7 B como clasificador configurable mediante prompt en lugar de entrenar un encoder específico.

La propuesta es deliberadamente minimalista: no hay paper, no se publican datos de entrenamiento ni el conjunto de evaluación, y el repositorio solo contiene pesos en `safetensors`. Esto limita la reproducibilidad, pero abarata la adaptación a dominios nuevos, ya que el comportamiento se redefine editando el *system prompt* que describe el Target y las reglas de sentimiento.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (causal LM), heredada de Mistral-7B-Instruct-v0.2 |
| Parámetros totales | 7 241 732 096 (7,24 B) |
| Parámetros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 32 768 tokens según el modelo base (no reverificado en esta ficha); el fine-tune no documenta cambios |
| Tipos de cuantización | No se publican artefactos cuantizados; el repositorio solo contiene pesos en bfloat16. Cuantización posterior posible vía bitsandbytes (int8/NF4), GPTQ/AWQ o conversión propia a GGUF |
| Idiomas soportados | Inglés (`en`) |
| Licencia | MIT (según la model card; conviene verificar la licencia del modelo base) |
| Formato de pesos | `safetensors` (bfloat16), 14,5 GB de repositorio; librería `transformers` |

## Arquitectura y entrenamiento

La arquitectura es la del modelo base: un transformer decoder-only denso de 7 B, sin mezcla de expertos, cargado con `AutoModelForCausalLM`. El fine-tune no modifica la arquitectura; únicamente ajusta los pesos para que el primer token de la respuesta generada sea la etiqueta de sentimiento. El autor no detalla hiperparámetros, número de pasos, configuración del bucle de RL ni el modelo juez empleado.

El entrenamiento se describe como *reinforcement learning* con un LLM actuando como juez, sobre unos 300 ejemplos de un conjunto interno. No se usaron etiquetas predefinidas, de modo que el criterio de sentimiento se aprende implícitamente a partir de las preferencias del juez y se explicita en tiempo de inferencia mediante el *system prompt*. Ese prompt define qué es el Target y codifica reglas como: preguntas no relacionadas con el Target → Neutral; quejas, frustración o culpa → Negative; incidentes indirectos → Neutral; declaración de incapacidad o fallo → Negative; fallo acompañado de petición cortés de ayuda → Neutral. La innovación práctica del modelo es precisamente esta separación entre política de etiquetado (prompt) y comportamiento aprendido (pesos), lo que permite reajustar el criterio sin reentrenar. No se documentan técnicas como decodificación especulativa, atención lineal ni modo de razonamiento extendido.

## Capacidades

- Clasificación de sentimiento en tres clases (`Positive`, `Neutral`, `Negative`) con la etiqueta siempre como primer token generado.
- Generación opcional de una justificación corta y legible de la decisión, útil para trazabilidad y auditoría.
- Clasificación contextual respecto a un "Target" definido en el *system prompt* (servicio, producto, API, app o soporte), lo que permite desambiguar mensajes que mencionan terceros.
- Conversación multi-turno mediante la plantilla de chat heredada del modelo base (`apply_chat_template`).
- Generación de texto general heredada del modelo base, aunque no es el objetivo del ajuste y no se evalúa su preservación.
- Soporte de *tool calling* / *function calling*: no documentado en la model card.
- Capacidades de agente o razonamiento multi-paso: no documentadas.
- Capacidades multilingües: limitadas al inglés según la ficha.
- Visión, audio o *thinking mode*: no disponibles.

## Casos de uso

- Triaje de tickets de soporte: el modelo etiqueta cada mensaje entrante y permite priorizar las colas de quejas explícitas frente a consultas neutras, usando `max_new_tokens=3` para obtener solo la etiqueta con un coste de decodificación mínimo.
- Enrutado y escalado en chatbots: detectar frustración o culpa dirigida al Target en conversaciones multi-turno y derivar a un agente humano cuando la etiqueta sea `Negative`, aprovechando que el criterio de negatividad se define por prompt.
- Voice of Customer a escala: clasificar reseñas, correos y encuestas abiertas en inglés por lotes, guardando la etiqueta y la explicación generada como justificación almacenable junto a cada registro.
- Monitorización de calidad en contact center: calcular la proporción de mensajes negativos por producto, canal o franja horaria; el formato de salida de una sola palabra facilita el parseo y el agregado en paneles.
- Distinción entre incidencias indirectas y quejas activas: las reglas del prompt separan un reporte de bug aséptico ("mobile app crashes on startup") de una queja con reproche, lo que sirve para enrutar unos a ingeniería y otras a atención al cliente.
- Evaluación de sistemas conversacionales: usar el modelo como etiquetador de referencia en pruebas A/B de un asistente, comparando la tasa de sentimiento negativo antes y después de un cambio de flujo.
- Señal temprana de riesgo de abandono: agregar el sentimiento por cuenta de cliente a lo largo del tiempo y activar alertas cuando la secuencia de etiquetas se degrade de `Neutral` a `Negative` de forma sostenida.

## Benchmarks y rendimiento

La única métrica publicada en la información disponible es accuracy de clasificación:

| Modelo | Accuracy |
|---|---|
| mistralai/Mistral-7B-Instruct-v0.2 (base) | 62,0 % |
| Sentiment-Analysis-7B (fine-tune) | 72,8 % |

No se han publicado resultados de benchmarks en la información disponible para MMLU, HumanEval, GSM8K ni otras pruebas estándar. Tampoco se especifican el tamaño ni la composición del conjunto de evaluación, ni la distribución de clases.

## Requisitos de hardware

- Pesos en bfloat16: 14,5 GB, por lo que la inferencia sin cuantizar requiere al menos 16 GB de VRAM solo para pesos, más caché KV.
- GPU recomendadas en bf16: A100 40/80 GB, H100, L40S, A10G 24 GB o L4 24 GB para servir con margen de contexto.
- Consumer GPU: cabe en bf16 en RTX 3090 y RTX 4090 (24 GB) con contexto moderado; en RTX 4080/4070 Ti (16 GB) solo con contexto corto y riesgo de OOM.
- Con cuantización int8 el peso baja a ~7,3 GB y permite GPUs de 12-16 GB; con int4/NF4 baja a ~4 GB y permite GPUs de 8 GB, a costa de degradar ligeramente la fiabilidad de la etiqueta.
- Despliegue: `transformers` (ruta documentada en la model card), Text Generation Inference (etiqueta `text-generation-inference`) y vLLM. Para llama.cpp u Ollama sería necesario convertir a GGUF, ya que no se publican artefactos de ese tipo.
- Latencia: no hay mediciones publicadas. Como la variante de solo etiqueta decodifica 3 tokens, el coste dominante es el *prefill* del prompt, que incluye un *system prompt* relativamente largo; conviene mantenerlo corto y reutilizar caché de prefijo para reducir latencia.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Accuracy (sentimiento) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Sentiment-Analysis-7B | 7,24 B | 32 768 (heredado del base) | 72,8 % | MIT | Pesos en HF, 191 descargas, 19 likes |
| mistralai/Mistral-7B-Instruct-v0.2 | 7,24 B | 32 768 | 62,0 % | Según su propia model card (no verificada aquí) | Pesos en HF |
| Clasificadores encoder pequeños (BERT/DistilBERT) para sentimiento | No disponible en la información proporcionada | No disponible | No disponible | No disponible | No disponible |

No se han publicado comparaciones con otros fine-tunes de clasificación de sentimiento ni con clasificadores encoder, que serían la alternativa natural en coste por inferencia. La tabla se limita a los datos disponibles.

## Limitaciones y advertencias

- Entrenamiento sobre ~300 ejemplos: alta probabilidad de sobreajuste al criterio particular del juez y del conjunto interno; no se documenta validación cruzada ni conjunto de test independiente.
- Accuracy del 72,8 %: implica un 27,2 % de error. No es adecuado como única señal en decisiones sensibles (fraude, riesgo, cumplimiento) sin supervisión humana.
- Ausencia de probabilidades: al ser un modelo generativo, no devuelve *logits* calibrados por clase; no se pueden aplicar umbrales de confianza sin trabajo adicional de calibración, que no está documentado.
- Dependencia crítica del *system prompt*: cambiar la definición del Target o las reglas altera las etiquetas. Cualquier despliegue exige versionar el prompt junto al modelo.
- Fragilidad de formato: la etiqueta se obtiene del primer token generado; prompts fuera de distribución o un `max_new_tokens` mal ajustado pueden producir salidas que no empiecen por una de las tres etiquetas, obligando a validación y *fallback*.
- Alucinación en la justificación: el texto explicativo es plausible pero no verificable; no debe tratarse como evidencia.
- Idioma: solo inglés; el rendimiento en español u otras lenguas no está evaluado y previsiblemente será peor.
- Sesgos: no se publica ninguna evaluación de sesgo ni de robustez ante variedades dialectales, sarcasmo o mensajes muy cortos.
- Licencia: la ficha declara MIT, lo que permitiría uso comercial, pero debe verificarse la licencia efectiva del modelo base antes de producción.
- Reproducibilidad: sin paper, sin dataset y sin código de entrenamiento; el modelo no se puede replicar ni auditar más allá de la evaluación reportada.
- Coste: usar 7 B parámetros para una clasificación de tres clases es entre uno y dos órdenes de magnitud más caro por petición que un encoder pequeño; la comparación de coste/beneficio no está publicada.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/microsoft/Sentiment-Analysis-7B
- Modelo base: https://huggingface.co/mistralai/Mistral-7B-Instruct-v0.2
- Resultados de búsqueda web: solo devolvieron páginas corporativas genéricas de Microsoft (microsoft.com, account.microsoft.com, support.microsoft.com), sin documentación técnica, paper ni repositorio asociados al modelo. No se han encontrado demos, blogs ni publicaciones adicionales.
