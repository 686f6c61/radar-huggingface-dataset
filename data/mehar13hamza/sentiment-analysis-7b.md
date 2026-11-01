# mehar13hamza/Sentiment-Analysis-7B

## Resumen

Sentiment-Analysis-7B es un modelo de lenguaje autorregresivo de 7.240 millones de parámetros, ajustado (fine-tuned) a partir de Mistral-7B-Instruct-v0.2 de Mistral AI para tareas de clasificación de sentimiento en mensajes de usuario dirigidos a un servicio, producto o agente concreto (el "Target"). Su autor es el usuario de Hugging Face mehar13hamza y se publica bajo licencia MIT.

A diferencia de los clasificadores tradicionales, el modelo se entrena mediante aprendizaje por refuerzo usando otro LLM como juez (LLM-as-a-judge), sobre un conjunto interno de apenas ~300 ejemplos y sin etiquetas predefinidas. La salida generada sigue un formato fijo: el primer token es la etiqueta de sentimiento (`Negative`, `Neutral` o `Positive`), seguido de una breve explicación de la decisión.

Su relevancia radica en demostrar cómo un ajuste muy ligero con refuerzo puede mejorar sustancialmente una tarea de clasificación específica: según la model card, pasa de un 62,0 % de accuracy (modelo base) a un 72,8 %, una mejora de 10,8 puntos porcentuales. Es un modelo de nicho, orientado a desarrolladores que necesiten análisis de sentimiento contextualizado en pipelines de atención al cliente, con la flexibilidad de un LLM generativo en lugar de un clasificador BERT-like.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer autorregresivo causal (base Mistral 7B) |
| Parámetros totales | 7.241.732.096 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (el modelo base Mistral-7B-Instruct-v0.2 usa 32.768 tokens) |
| Tipos de cuantización | no disponible (solo pesos en bfloat16 en el repo) |
| Idiomas soportados | Inglés (en) |
| Licencia | MIT |
| Formato de pesos | safetensors (14,5 GB en el repositorio) |

## Arquitectura y entrenamiento

El modelo parte de la arquitectura de Mistral-7B-Instruct-v0.2: un transformer decoder causal de 7.240 millones de parámetros con atención agrupada (GQA, grouped-query attention), ventana deslizante de atención (sliding window attention) y vocabulario por tokens byte-fallback. El ajuste no modifica la arquitectura; se trata de un fine-tune de los pesos del modelo instruct.

El entrenamiento se realizó mediante aprendizaje por refuerzo, empleando un LLM como juez para generar la señal de recompensa, en lugar de un ajuste supervisado clásico con etiquetas. El conjunto de entrenamiento es notablemente pequeño: aproximadamente 300 ejemplos internos, sin etiquetas predefinidas. Este enfoque permite que el modelo aprenda las reglas de sentimiento definidas en el system prompt (por ejemplo, distinguir entre quejas directas, incidentes indirectos y peticiones de ayuda corteses) sin necesidad de anotación manual masiva. No hay información disponible sobre el número de tokens de entrenamiento, el optimizador, los hiperparámetros ni el método exacto de RL (RLHF, DPO, GRPO, etc.).

## Capacidades

- Clasificación de sentimiento en tres clases (`Positive`, `Neutral`, `Negative`) sobre mensajes de usuario dirigidos a un "Target" (servicio, producto o agente con el que interactúa el usuario).
- Generación de una explicación breve y justificada tras la etiqueta, lo que facilita auditoría y depuración de las decisiones del clasificador.
- Salida estructurada y determinista: con `do_sample=False` y `max_new_tokens=3` se obtiene únicamente la etiqueta en el primer token, ideal para integración en pipelines.
- Manejo de reglas de sentimiento no triviales: distingue entre quejas con culpa o frustración (negativo), incidentes indirectos como tickets de helpdesk (neutral), declaraciones de fallo (negativo) y fallo acompañado de petición cortés de ayuda (neutral).
- Capacidades generativas heredadas del modelo base Mistral-7B-Instruct-v0.2 (conversación, generación de texto), aunque no están ni evaluadas ni garantizadas tras el ajuste.
- No hay información disponible sobre tool calling, capacidades de agentes, visión, audio ni rendimiento multilingüe (la model card declara solo inglés).

## Casos de uso

- Clasificación de sentimiento en tickets de soporte: al recibir un mensaje de usuario en un sistema de helpdesk, el modelo etiqueta el sentimiento hacia el servicio y permite priorizar tickets negativos; su regla de "fallo + petición cortesa = neutral" evita falsos positivos de urgencia.
- Monitorización de calidad en chatbots de atención al cliente: se puede ejecutar en línea sobre cada turno de conversación para detectar frustración del usuario y escalar a un agente humano en tiempo real.
- Análisis de feedback de producto: procesar comentarios, reseñas de app o mensajes dirigidos a un producto concreto, con la ventaja de que el "Target" se define por prompt y se puede adaptar a cada producto sin reentrenar.
- Dashboards de experiencia de usuario: como la etiqueta es el primer token generado, se puede llamar con `max_new_tokens=3` para inferencia barata y agregable a métricas agregadas (porcentaje de mensajes negativos por día, por canal, etc.).
- Explicabilidad en auditoría de conversaciones: solicitar `max_new_tokens=64` devuelve la etiqueta más una explicación en lenguaje natural, útil para revisión humana de decisiones y para entrenar a equipos de soporte.
- Integración en pipelines de MLOps: al ser un modelo causal compatible con `transformers` y `text-generation-inference`, se puede desplegar como endpoint y consumir desde sistemas de análisis de logs de conversación.
- Generación de datos etiquetados: dado que entrega etiqueta y justificación, puede usarse como etiquetador inicial (weak labeling) para construir datasets de clasificación más grandes.

## Benchmarks y rendimiento

La model card solo publica una métrica de evaluación: accuracy en la tarea de clasificación de sentimiento, comparando el modelo base con la versión ajustada. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible.

| Modelo | Accuracy (sentimiento) |
|---|---|
| mistralai/Mistral-7B-Instruct-v0.2 | 62,0 % |
| **Sentiment-Analysis-7B** | **72,8 %** |

No se detalla el tamaño ni la composición del conjunto de evaluación, por lo que el 72,8 % debe interpretarse con cautela: probablemente corresponde a la distribución interna de la tarea y no es directamente comparable con benchmarks públicos.

## Requisitos de hardware

- VRAM estimada para inferencia en bfloat16: aproximadamente 14,5 GB solo de pesos, más la sobrecarga de activaciones y KV cache; en la práctica, una GPU con 16 GB de VRAM es el mínimo realista para contextos cortos.
- GPU recomendadas: NVIDIA RTX 4090 (24 GB), RTX 3090 (24 GB), A10G, L4 o A100 para despliegue en servidor.
- En GPU de consumo: cabe en una RTX 4090 o RTX 3090 en bf16; en GPUs de 8-12 GB sería necesario cuantizar a 4 bits (por ejemplo con bitsandbytes o GGUF), aunque no hay versiones cuantizadas publicadas en el repositorio.
- En CPU: teóricamente posible con llama.cpp tras convertir a GGUF, pero sin conversión publicada y con latencias altas para un modelo de 7B; no es el escenario previsto.
- Opciones de despliegue: la model card muestra uso con `transformers` (`AutoModelForCausalLM`) y el repositorio está etiquetado como compatible con `text-generation-inference` (TGI); por ser un modelo Mistral estándar en safetensors, debería funcionar también con vLLM y Ollama (tras conversión a GGUF), aunque no hay soporte oficial documentado.
- Latencia: no disponible. Al tratarse de clasificación con 1-3 tokens de salida en modo determinista, la latencia por mensaje debería dominarse por el prefill del prompt, no por la decodificación.

## Comparativa con modelos similares

| Modelo | Parámetros | Tarea | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Sentiment-Analysis-7B | 7,24B | Sentimiento (3 clases) sobre "Target" | Fine-tune con RL y LLM-as-a-judge, ~300 ejemplos | MIT | Hugging Face, safetensors |
| mistralai/Mistral-7B-Instruct-v0.2 (base) | 7,24B | General instruct | Modelo base sin ajuste de sentimiento | Apache 2.0 | Hugging Face, amplio soporte |
| cardiffnlp/twitter-roberta-base-sentiment-latest | 125M | Sentimiento (3 clases) | Clasificador supervisado clásico | MIT | Hugging Face, muy ligero |

La comparación con el modelo base muestra la ganancia del ajuste (+10,8 puntos de accuracy). Frente a clasificadores ligeros tipo RoBERTa, este modelo ofrece explicabilidad (justificación en lenguaje natural) y reglas de sentimiento configurables por prompt, a costa de un coste computacional muy superior (7B frente a 125M de parámetros) y latencias mayores.

## Limitaciones y advertencias

- Rendimiento moderado: con un 72,8 % de accuracy, más de uno de cada cuatro mensajes se clasifica erróneamente; no es adecuado como único criterio para decisiones automáticas críticas sin revisión humana.
- Conjunto de entrenamiento muy pequeño (~300 ejemplos): alto riesgo de sobreajuste a la distribución interna del autor y de comportamiento impredecible fuera de ese dominio.
- Sesgos: no hay información disponible sobre sesgos evaluados; al heredar Mistral-7B-Instruct-v0.2, puede arrastrar los sesgos de sus datos de preentrenamiento, y el uso de un LLM juez puede introducir los sesgos del propio juez.
- Riesgo de alucinación en las explicaciones: la justificación en lenguaje natural es generativa y puede no reflejar fielmente el motivo real de la clasificación.
- Idioma: declarado solo para inglés; no hay garantías de funcionamiento en castellano ni en otros idiomas.
- Contexto y cuantización: la longitud de contexto y las cuantizaciones oficiales no están documentadas; cualquier uso en producción requerirá validación propia.
- Licencia: MIT permite uso comercial sin restricciones relevantes; no obstante, conviene revisar los términos de uso del modelo base de Mistral AI.
- Detalles de entrenamiento no publicados (método de RL exacto, hiperparámetros, datos de evaluación), lo que dificulta reproducir el resultado.
- Advertencia de procedencia: el código de ejemplo de la model card referencia el model_id `microsoft/Sentiment-Analysis-7B`, que no coincide con el ID real del repositorio (`mehar13hamza/Sentiment-Analysis-7B`); hay que usar el ID correcto al cargar el modelo.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/mehar13hamza/Sentiment-Analysis-7B
- Modelo base: https://huggingface.co/mistralai/Mistral-7B-Instruct-v0.2
- Paper: no disponible
- Blog o demo: no disponible
