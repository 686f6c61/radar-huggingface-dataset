# adolfo123456/logibot-slm

## Resumen

logibot-slm es un modelo de lenguaje de juguete de 3.647.232 parámetros publicado por el usuario adolfo123456 en HuggingFace. No es un modelo de producción ni un asistente general: es el artefacto resultante de un taller de destilación de conocimiento del curso *Tópicos Avanzados en Inteligencia Artificial 2* (magíster, UAI), en el que un "profesor" genera pares pregunta-respuesta sobre un centro de distribución ficticio (Austral Retail, Pudahuel: robots AMR, muelles, baterías, pasillos) y un "estudiante" diminuto aprende a imitarlos mediante LoRA.

La arquitectura es un transformer tipo Llama inicializado desde cero —no derivado de SmolLM2 ni de otro modelo publicado— con 4 capas, `hidden_size` 256 y un vocabulario BPE de solo 1.455 tokens. El entrenamiento se ejecutó íntegramente en CPU sobre 80 pares pregunta-respuesta, 10 épocas y 200 pasos, con una pérdida que bajó de 7,3471 a 0,0845. El resultado es un modelo que reproduce el registro y el vocabulario de un dominio ficticio muy acotado, y que falla fuera de él.

Su relevancia es fundamentalmente metodológica: documenta de forma inusualmente honesta un caso de destilación a escala mínima, incluye la curva de pérdida y el log de entrenamiento, y —dato poco habitual— reporta explícitamente que las métricas registradas durante el taller no se reprodujeron al reevaluar los pesos publicados (6,08 de nota media registrada frente a 3,17 en la reevaluación). Es, por tanto, un material docente y un ejemplo de trazabilidad y escepticismo sobre resultados de evaluación con conjuntos de 12 preguntas.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only tipo Llama, inicializado desde cero (4 capas, `hidden_size` 256) |
| Parametros totales | 3.647.232 |
| Parametros activos | No aplica (modelo denso, no es MoE) |
| Longitud de contexto | No disponible (no documentada en la model card ni en los datos proporcionados) |
| Tipos de cuantizacion | No disponible; solo se publican pesos en float32. No hay GGUF ni cuantizaciones de terceros publicadas |
| Idiomas soportados | Español (registro de español de Chile, dominio ficticio de logística) |
| Licencia | Apache 2.0 |
| Formato de pesos | `safetensors` (modelo fusionado base + LoRA) y `safetensors` del adaptador LoRA (`adapter/adapter_model.safetensors`, ≈ 4 MB); tokenizer y `config.json` en el repo |

Otros datos técnicos: vocabulario BPE de 1.455 tokens; LoRA con `r=16`, `alpha=32`, `dropout=0.05`, aplicado a todos los proyectores de atención y MLP más `embed_tokens` y `lm_head` entrenables; entrenamiento con lr 3e-3, semilla 42, 10 épocas, 200 pasos (20 lotes de 4). El repo incluye `base_tiny/` (estudiante sin entrenar), `resultados.png` y `entrenamiento_log.jsonl`. Descarga completa del snapshot: ≈ 34 MB.

## Arquitectura y entrenamiento

El estudiante es un transformer decoder-only de tipo Llama con 4 capas, dimensión oculta 256, vocabulario de 1.455 tokens y 3,647 millones de parámetros, inicializado desde cero y no derivado de ningún modelo preentrenado del Hub. Sobre esa base se aplicó un adaptador LoRA de rango 16 y alpha 32 con dropout 0,05 sobre todos los proyectores de atención y de la MLP, dejando también entrenables `embed_tokens` y `lm_head`. El modelo publicado es la fusión de base y adaptador; el adaptador y la base sin entrenar se distribuyen en subcarpetas separadas.

Los datos de entrenamiento son 80 pares pregunta-respuesta sobre un dominio ficticio, generados por un "profesor" simulado en modo offline (`--sin-internet`) con 162 respuestas simuladas y coste 0 USD; no se usó ningún LLM comercial para esta corrida concreta y el dataset no se publica. El entrenamiento consistió en 200 pasos (10 épocas × 20 lotes de 4), en CPU, con una pérdida que pasó de 7,3471 a 0,0845. No se documenta número total de tokens, composición del dataset, ni fases de RLHF o DPO. La innovación destacable no es arquitectónica sino metodológica: la card incluye un apartado de reproducibilidad que reconoce que la reevaluación de los pesos publicados con el mismo juez offline dio 3,17 de nota media y 1 de 12 aprobadas, frente al 6,08 y 9 de 12 registrados en la corrida original, sin haber determinado la causa.

## Capacidades

- Generación de texto conversacional en español (registro de español de Chile) limitada al dominio ficticio de logística de un centro de distribución.
- Respuesta a preguntas de un temario cerrado: robots AMR, gestión de muelles, baterías, pasillos, algoritmos de planificación como A*.
- Imitación de estilo y vocabulario técnico aprendidos de 80 pares de ejemplo (destilación de comportamiento, no adquisición de conocimiento general).
- Plantilla de chat con rol de sistema y de usuario (`apply_chat_template`), compatible con el formato conversacional de transformers.
- No dispone de tool calling, function calling, capacidad de agente, razonamiento multi-paso, visión, audio ni modo "thinking": nada de ello está implementado ni documentado.
- Multilingüismo: nulo más allá del español; el vocabulario de 1.455 tokens limita severamente cualquier texto fuera del dominio entrenado.

## Casos de uso

- Docencia de destilación de conocimiento: el paquete completo (base sin entrenar, adaptador LoRA, log de pérdida y examen de 12 preguntas) permite reproducir en una sesión de clase el ciclo completo de destilación y evaluar la diferencia entre base y estudiante.
- Práctica de despliegue con `transformers`: el repo sirve para ejercitar carga de modelos fusionados, carga de adaptadores PEFT desde ruta local y plantillas de chat, con un coste de descarga de 34 MB.
- Demostración de las limitaciones de la evaluación automática: comparar la nota del juez offline (6,08 registrada) con la reevaluación (3,17) es un caso concreto para discutir sobreajuste al conjunto de examen y varianza con 12 preguntas.
- Pruebas de humo de pipelines de inferencia: al ser un modelo de 3,6 M de parámetros, permite validar extremo a extremo un servicio de generación de texto (incluido `text-generation-inference`, ya que el repo declara compatibilidad con endpoints) sin consumir GPU.
- Ejemplo de resultado negativo controlado: el adaptador hermano sobre SmolLM2-135M-Instruct, con 1,70 → 2,25 de nota y 0 % de aprobación, sirve para ilustrar cuándo la destilación con pocos datos no transfiere el dominio.
- Prototipado de plantillas de prompt en español para dominios logísticos ficticios, antes de invertir en un modelo real.
- Material para estudiar el efecto de la penalización por repetición: el modelo entra en bucles sin `repetition_penalty=1.15`, lo que lo convierte en un caso práctico de decodificación degenerada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. La única evaluación es un examen propio de 12 preguntas del dominio, puntuado por un juez automático offline que compara palabras clave con una respuesta de referencia (no es un evaluador humano ni un LLM).

| Evaluación | Base sin entrenar | Destilado (registrado en el taller) | Destilado (reevaluación de los pesos publicados) |
|---|---|---|---|
| Nota media (escala 1-10), examen de 12 preguntas | 1,00 | 6,08 | 3,17 |
| Aprobación (nota ≥ 7) | 0 % | 75 % (9 de 12) | 8,3 % (1 de 12) |
| Coincidencia con el registro original | — | — | Ninguna respuesta coincidió |

| Corrida relacionada (otro modelo, no comparable directamente) | Base | Destilado |
|---|---|---|
| SmolLM2-135M-Instruct con profesor real (Colab, A100), examen de 20 preguntas | 1,70 | 2,25 |
| Aprobación | 0 % | 0 % |

Advertencias sobre estas cifras: el examen tiene 12 preguntas, dos respuestas obtuvieron nota 1 y una nota 2 en la corrida registrada; el margen de error es amplio y la propia card desaconseja leer el 6,08 como propiedad reproducida de los pesos.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB. Los pesos en float32 ocupan aproximadamente 14,6 MB (3.647.232 × 4 bytes); con overhead de activaciones y tokenizer el proceso completo cabe holgadamente en cualquier equipo.
- GPU recomendadas: ninguna en particular. El modelo se entrenó y se evaluó en CPU; cualquier GPU consumer (o ninguna) es suficiente.
- Cabe en cualquier GPU consumer, incluida una GTX 1050 o una iGPU moderna, y también en Raspberry Pi.
- Opciones de despliegue: `transformers` (ruta documentada por el autor), `peft` para cargar solo el adaptador desde una copia local con `snapshot_download` (el autor advierte de un fallo de rutas de `peft` en Windows al cargar el adaptador directamente desde el Hub), y servicio compatible con endpoints de text-generation-inference según los tags del repo. No hay GGUF publicado, por lo que `llama.cpp`/Ollama requerirían una conversión propia no documentada.
- Latencia y throughput: no disponible. No se han publicado medidas; la generación de referencia se hizo en CPU con float32, lotes de 8, decodificación determinista, `repetition_penalty=1.15` y 70 tokens nuevos (120 en el ejemplo de la card), sin cifras de tiempo.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Resultado en el taller |
|---|---|---|---|---|---|
| logibot-slm (este modelo) | 3,65 M | No disponible | Apache 2.0 | Pesos fusionados + base + adaptador en el Hub | 6,08 registrado / 3,17 reevaluado; 75 % / 8,3 % de aprobación |
| logibot-slm-smollm2-colab (adaptador LoRA sobre SmolLM2-135M-Instruct) | Base de 135 M (adaptador no cuantificado en la información) | No disponible en la información | No disponible en la información | Solo adaptador en el Hub | 1,70 → 2,25; 0 % de aprobación sobre 20 preguntas |
| SmolLM2-135M-Instruct (modelo base de la corrida anterior) | 135 M | No disponible en la información | No disponible en la información | Modelo público de HuggingFace | No evaluado directamente; sirve de referencia de tamaño |

No se han identificado en la información proporcionada otros modelos de 3-4 M de parámetros comparables. Los resultados de búsqueda con el nombre "Logibot" (logibot.eu/Logibot.Train, el proyecto Streamlit con IBM Granite y el agente de lablab.ai) corresponden a productos y proyectos independientes sin relación con este repositorio, por lo que no son alternativas comparables.

## Limitaciones y advertencias

- Modelo de juguete, no de producción. La propia model card lo declara explícitamente: no sirve como asistente general ni para decisiones operacionales reales.
- Dominio y empresa ficticios (Austral Retail, Pudahuel); los datos son sintéticos. Cualquier respuesta sobre operaciones reales es una alucinación.
- Entrenado con solo 80 pares pregunta-respuesta y 10 épocas: sobreajuste elevado al temario y generalización prácticamente nula fuera de él.
- Sin `repetition_penalty` (el autor usa 1,15) el modelo entra en bucles de repetición, lo que lo hace frágil en cualquier integración que no controle los parámetros de decodificación.
- Vocabulario de 1.455 tokens: cualquier texto fuera del dominio, y en particular cualquier otro idioma, se tokeniza de forma muy ineficiente o directamente se degrada.
- Registro lingüístico limitado a español de Chile; no es un modelo multilingüe ni cubre variantes del español de España.
- Discrepancia de reproducibilidad documentada: la reevaluación de los pesos publicados da 3,17 de nota media y 1 de 12 aprobadas frente al 6,08 y 9 de 12 registrados, sin causa determinada. No debe citarse el 6,08 sin esta salvedad.
- Evaluación con 12 preguntas y un juez automático por coincidencia de palabras clave: alta varianza y posible premio a respuestas que repiten términos sin ser correctas.
- Dataset de entrenamiento no publicado, lo que impide auditar la composición de los datos y reproducir el entrenamiento.
- Licencia Apache 2.0: permite uso comercial y modificaciones con atribución, pero la idoneidad técnica del modelo hace inviable cualquier uso comercial real. No se documentan restricciones adicionales.
- Longitud de contexto no documentada: no se puede planificar una integración en producción sin determinarla experimentalmente.
- El adaptador hermano sobre SmolLM2-135M-Instruct no aprendió el dominio (0 % de aprobación), lo que sugiere que la metodología con tan pocos datos no escala por sí sola.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/adolfo123456/logibot-slm
- Adaptador de la corrida relacionada (SmolLM2-135M-Instruct, resultado negativo): https://huggingface.co/adolfo123456/logibot-slm-smollm2-colab
- Logibot.Train (producto no relacionado, mismo nombre): https://www.logibot.eu/products/logibot-train
- Building AI Agents with Local Small Language Models (artículo de contexto sobre modelos pequeños locales): https://machinelearningmastery.com/building-ai-agents-with-local-small-language-models/
- Hugging Face (plataforma): https://huggingface.co/
- LogiBot con IBM Granite, proyecto Streamlit (no relacionado): https://github.com/martolini1124/streamlit_project
- LogiBot, agente logístico del hackathon de IBM Granite (no relacionado): https://lablab.ai/ai-hackathons/generative-ai-hackathon-with-ibm-granite/eirconnect/logibot-the-logistical-agent
