# cribl-ai/cribl-decision-1.0

## Resumen

cribl-decision-1.0 es un adaptador LoRA de predicción de decisiones estructuradas publicado por cribl-ai, la división de inteligencia artificial de Cribl, empresa centrada en plataformas de gestión de telemetría. A diferencia de un modelo conversacional convencional, este adaptador no genera respuestas de texto libre: recibe un estado, una o varias preguntas tipadas y un conjunto explícito de opciones candidatas, y devuelve una distribución de probabilidad normalizada sobre esas candidatas. El repositorio contiene únicamente el adaptador; los pesos del modelo base deben descargarse por separado.

El modelo se apoya en el backbone transformer de Qwen/Qwen3.5-4B-Base (4.000 millones de parámetros) mediante una adaptación LoRA de bajo rango, y reutiliza el lm_head nativo de Qwen para puntuar las candidatas en la posición de decisión. Soporta tres tipos de salida tipada: `choice` (elección entre opciones con probabilidades), `noul` (probabilidad de una proposición booleana) y `score` (distribución sobre niveles ordenados con puntuación esperada). El formato admite hasta 255 opciones candidatas.

Su relevancia actual radica en que cubre un nicho poco atendido: servicios de decisión locales que necesitan probabilidades calibradas sobre un conjunto cerrado de opciones, en lugar de texto generado. Está pensado para llamarse desde software (clasificación, enrutado de intención, selección de acciones de agente, juicios de política o seguridad) y no como interfaz de chat. La licencia es Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen3.5) mas adaptador LoRA; lectura estructurada sobre lm_head nativo |
| Parametros totales | Modelo base de 4B (Qwen/Qwen3.5-4B-Base); el adaptador LoRA no incluye los pesos base |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (adaptador en safetensors; la cuantizacion depende del modelo base) |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA); el modelo base se descarga aparte |

## Arquitectura y entrenamiento

El adaptador se monta sobre el backbone transformer decoder-only de Qwen/Qwen3.5-4B-Base (revision 1001bb4d826a52d1f399e183466143f4da7b741b) mediante LoRA y PEFT. La innovación técnica no está en el backbone, sino en la lectura estructurada: el modelo toma el estado oculto en la ranura de decisión, lo proyecta contra los pesos de las candidatas (`candidate_logits = candidate_weights @ decision_hidden_state`), aplica softmax sobre esos logits y produce una salida tipada. Es decir, reutiliza el lm_head nativo de Qwen como cabeza de puntuación de candidatas en lugar de decodificar texto libre, lo que da distribuciones de probabilidad normalizadas sobre el conjunto de opciones aportado por el llamante.

Los datos de entrenamiento consisten en una mezcla amplia de decisiones estructuradas que, segun la model card, abarca familias de clasificación pública, intención, preferencia, seguridad, conocimiento, razonamiento, agente/herramienta y reglas programáticas. No se especifica el número total de tokens, la composición exacta del dataset ni si hubo fases de RLHF o DPO. Tampoco se documentan hiperparámetros de entrenamiento (rango LoRA, alpha, tasa de aprendizaje), por lo que esos datos quedan como no disponibles.

## Capacidades

- Predicción de decisiones estructuradas: devuelve una distribución de probabilidad sobre las candidatas aportadas, en lugar de texto libre.
- Tipo `choice`: selecciona una candidata y asigna una probabilidad a cada opción suministrada.
- Tipo `noul`: calcula la probabilidad de una proposición booleana (por ejemplo, si una acción es necesaria o si una condición es cierta).
- Tipo `score`: produce una distribución sobre niveles ordenados y una puntuación esperada (útil para rúbricas o escalas ordinales).
- Clasificación y enrutado de intención sobre conjuntos de etiquetas explícitos.
- Juicios estructurados de política y seguridad.
- Selección de acciones de herramienta y de agente.
- Comparaciones de preferencia y de calidad.
- Respuesta a preguntas de conocimiento cuando las respuestas son candidatas explícitas.
- Soporte de hasta 255 opciones candidatas en el formato de entrenamiento y evaluación.
- Despliegue local, sin servicio de inferencia alojado.
- Soporte de tool calling / function calling: no disponible explícitamente como tal; la selección de acciones de agente y herramienta se realiza mediante el mecanismo de decisiones estructuradas.
- Capacidades multilingües: no disponible.
- Modo de razonamiento extendido (thinking), visión o audio: no disponible.

## Casos de uso

- Enrutado de intención en asistentes: dado un mensaje de entrada y una lista de intenciones candidatas, el modelo devuelve la intención más probable con su distribución de probabilidad, lo que permite fijar umbrales de confianza antes de derivar a un humano.
- Clasificación de telemetría y eventos de seguridad: permite asignar categorías a eventos o trazas dentro de un conjunto cerrado de etiquetas y obtener probabilidades calibradas, útil en pipelines de detección y triaje.
- Selección de acciones de agente: ante un estado y un conjunto de herramientas o acciones disponibles, el modelo puntúa cada candidata y devuelve la probabilidad de cada acción, lo que facilita la construcción de políticas de decisión multi-paso con umbrales.
- Juicios de política y seguridad automatizados: evalúa si una acción cumple o infringe una política concreta mediante decisiones `noul` o `choice`, integrable como filtro previo a la ejecución.
- Puntuación ordinal y rúbricas: con el tipo `score`, permite clasificar respuestas, candidatos o contenidos en niveles ordenados y obtener una puntuación esperada, aplicable a evaluación de calidad de respuestas o de currículos.
- Comparación de preferencias: dado un par o conjunto de opciones, devuelve qué alternativa es preferible con su probabilidad, útil en pipelines de anotación asistida o de evaluación de modelos.
- Respuesta a preguntas sobre candidatas explícitas: en lugar de generar una respuesta abierta, selecciona la candidata correcta entre un conjunto dado, con probabilidad asociada; adecuado para sistemas de soporte donde las respuestas están predefinidas.
- Servicio de decisión local embebido en software: el endpoint local `/v1/systemone` permite llamar al modelo desde una aplicación sin depender de APIs externas, manteniendo los datos en la infraestructura propia.

## Benchmarks y rendimiento

Evaluación en 26 tareas con 29.743 registros reservados (no usados para selección de checkpoint):

| Metrica | Resultado |
|---|---:|
| Exactitud global | 77,34 % |
| Exactitud macro por tarea | 78,64 % |
| Macro-F1 macro por tarea | 78,65 % |

No se han publicado otros resultados de benchmarks (MMLU, HumanEval, GSM8K u otros) en la información disponible. No se dispone de comparaciones directas con modelos similares en los datos proporcionados.

## Requisitos de hardware

- VRAM estimada para inferencia: depende del modelo base Qwen3.5-4B. Como referencia general para un modelo de 4.000 millones de parámetros, en FP16/BF16 rondaría los 8-10 GB, en cuantización de 8 bits unos 5-6 GB y en 4 bits aproximadamente 3-4 GB. Estas cifras son estimaciones generales, no datos publicados para este adaptador.
- El adaptador LoRA en sí es pequeño (el repositorio ocupa 0,1 GB), por lo que el coste de memoria lo determina el modelo base.
- GPU recomendadas: para FP16, GPU con 16 GB o más (RTX 4080/4090, A100 40 GB, etc.); con cuantización de 4 bits cabe en GPU de consumo con 6-8 GB de VRAM (RTX 3060 12 GB, RTX 4060 Ti 16 GB, etc.).
- Cabe en GPU de consumo si se cuantiza el modelo base; en FP16 requiere GPU de gama alta o profesional.
- Opciones de despliegue: la model card indica despliegue local mediante un servidor de lectura estructurada que expone `POST /v1/systemone`. Carga vía PEFT con `transformers` y `peft`. No se documentan integraciones específicas con vLLM, llama.cpp, Ollama o TGI, y la lectura estructurada personalizada probablemente requiere la implementación de scoring de candidatas del autor.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

No se dispone de datos publicados de otros adaptadores de decisión estructurada comparables en la información proporcionada. Como referencias de categoría pueden considerarse los adaptadores LoRA de clasificación sobre modelos pequeños y los propios modelos base de la familia Qwen, pero no se ofrecen cifras comparables.

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| cribl-decision-1.0 | Base 4B + LoRA | no disponible | 77,34 % exactitud global (26 tareas) | apache-2.0 | Adaptador en HuggingFace |
| Qwen/Qwen3.5-4B-Base | 4B | no disponible | no disponible | no disponible | HuggingFace (modelo base) |
| Alternativas de clasificación/decision | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- El modelo no está pensado para generar texto libre: usarlo con generación no restringida produce resultados no representativos de su diseño.
- Para reproducir exactamente las salidas estructuradas hay que emplear la misma implementación de scoring de candidatas, el mismo tokenizador, el mismo orden de candidatas, el mismo formato de prompt, el mismo dtype y la misma revisión del modelo.
- No sustituye la revisión humana en decisiones críticas de seguridad, legales, médicas, financieras o de alto impacto, según advierte la propia model card.
- No se documentan sesgos conocidos, por lo que no puede afirmarse nada al respecto con la información disponible.
- Riesgo de alucinación: aunque el mecanismo restringe la salida a las candidatas aportadas, sigue existiendo el riesgo de asignar alta probabilidad a una opción incorrecta cuando el estado de entrada es ambiguo o está fuera de la distribución de entrenamiento.
- Limitaciones de contexto e idioma: no disponible. No se especifica la longitud de contexto soportada ni los idiomas cubiertos por el entrenamiento.
- Restricciones de licencia: la licencia Apache 2.0 permite uso comercial, pero no se detallan condiciones adicionales del modelo base Qwen3.5-4B-Base, cuya licencia debería verificarse por separado.
- Advertencia para producción: al ser un adaptador que depende de una revisión concreta del modelo base, actualizar el modelo base sin fijar la revisión puede romper la compatibilidad de la lectura estructurada.
- El repositorio registra 0 descargas y 2 me gusta en el momento de la consulta, lo que indica una adopción todavía muy baja y poca validación externa.

## Enlaces

- Adaptador en HuggingFace: https://huggingface.co/cribl-ai/cribl-decision-1.0
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B-Base
- Cribl (empresa): https://cribl.io/
- Cribl AI: https://cribl.io/products/cribl-ai/
- Cribl AI en documentacion: https://docs.cribl.io/copilot/
- Anuncio de Cribl Detect: https://www.publicnow.com/view/C6E1A245A7C1B78440A5A5CE6E65E87E057971FF
- Cobertura de Cribl Detect: https://www.sourcesecurity.com/news/cribl-detect-ai-siem-modern-security-co-1713267193-ga.1790769218.html
