# microsoft/UserRepGen-4B

## Resumen

UserRepGen-4B es un generador de representaciones de usuario desarrollado por Microsoft. Se trata de un ajuste fino de Qwen3.5-4B (4.539.265.536 parámetros, ~4,54 mil millones) que recibe una conversación multi-turno entre usuario y asistente y devuelve un JSON con dos campos: `task` (descripción de la tarea del usuario) y `user_behavior` (descripción de su estilo y patrones de conducta). El resultado no es una transcripción ni un turno de diálogo, sino una representación en lenguaje natural pensada para condicionar un simulador de usuario independiente basado en otro LLM.

La diferencia clave respecto a trabajos previos del mismo grupo, como UserLM-8b y UserLM-2.0, es que UserRepGen-4B no genera intervenciones del usuario simulado ni ejecuta la tarea; produce la representación que alimenta al simulador. Esto separa la caracterización del usuario de la generación de diálogo, lo que permite reutilizar la representación con distintos simuladores y entornos de simulación.

El modelo es relevante para quien necesite evaluar asistentes conversacionales con usuarios sintéticos realistas, estudiar la diversidad conductual de poblaciones simuladas o reconstruir conversaciones con mayor fidelidad. Se entrenó entre julio y agosto de 2026 con supervisión en línea mediante *hindsight distillation*, se distribuye con licencia MIT y solo admite inglés. La model card advierte explícitamente de que las representaciones no están anonimizadas y mejoran la reidentificación de usuarios, lo que supone un riesgo de privacidad relevante.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder de la familia Qwen3.5, con adaptación LoRA de rango 64 sobre Qwen3.5-4B |
| Parámetros totales | 4.539.265.536 (~4,54 B) |
| Parámetros activos | No aplica: modelo denso, no es MoE |
| Longitud de contexto | Entrenado con secuencias de 9.216 tokens (hasta 8.192 de prompt y 1.024 de finalización). El código de ejemplo valida y rechaza prompts formateados de más de 8.192 tokens. La ventana nativa del modelo base no se detalla en la información disponible |
| Tipos de cuantización | No disponible en la model card. El repositorio contiene safetensors de 9,1 GB, tamaño coherente con pesos en bf16. El autor no publica variantes GGUF, AWQ ni GPTQ |
| Idiomas soportados | Inglés (`en`) |
| Licencia | MIT |
| Formato de pesos | safetensors (compatible con `transformers`); incluye el fichero `representation_prompt.txt` con la plantilla de inferencia |
| Tipo de entrada | Texto: conversaciones multi-turno usuario-asistente |
| Tipo de salida | Texto en formato JSON con los campos `task` y `user_behavior` |
| Etiqueta de pipeline | `text-generation` (el repositorio se carga con `AutoModelForImageTextToText`, aunque las entradas descritas son solo de texto) |
| Descargas / likes | 1.008 descargas, 13 likes (en el momento de la consulta) |
| Fecha de creación | 14 de octubre de 2026 |

## Arquitectura y entrenamiento

El modelo parte de Qwen3.5-4B, un transformer decoder denso de aproximadamente 4,5 mil millones de parámetros. Sobre esa base se aplica una adaptación LoRA de rango 64 entrenada con *online supervised fine-tuning* mediante *hindsight distillation*: el sistema compara el comportamiento de un usuario simulado con el del usuario original en la conversación y utiliza esa señal comparativa como realimentación para ajustar la generación de representaciones. En inferencia no se requieren rollouts de simulación ni señal de hindsight; basta con la conversación de origen y la plantilla `representation_prompt.txt`.

La longitud de secuencia de entrenamiento fue de 9.216 tokens, repartidos en hasta 8.192 tokens de prompt y 1.024 de finalización. El ejemplo oficial aplica la plantilla de chat con `enable_thinking=False`, es decir, con el modo de razonamiento del modelo base desactivado, y decodificación greedy (`do_sample=False`, sin temperatura, top-p ni top-k). La composición del dataset de entrenamiento, el número de tokens vistos, el uso de RLHF o DPO y cualquier innovación de atención o decodificación no se detallan en la información disponible.

## Capacidades

- Generación de representaciones estructuradas de usuario en JSON con dos campos: descripción de tarea (`task`) y descripción de comportamiento (`user_behavior`).
- Caracterización de conducta conversacional: estilo de comunicación, formulación de peticiones, revelación incremental de restricciones, patrones de respuesta, tipo de feedback aportado, provisión de contexto, nivel de implicación y comportamiento de terminación.
- Mejora de la fidelidad de reconstrucción de conversaciones cuando la representación se usa con un entorno de simulación LLM no visto durante el entrenamiento (hallazgo cualitativo reportado por el autor, sin cifras públicas).
- Transferencia de patrones conductuales específicos del usuario entre conversaciones y tareas no vistas, según la model card.
- Contribución a la diversidad conductual de poblaciones simuladas.
- Mejora del emparejamiento entre conversaciones del mismo usuario en la evaluación de reidentificación del trabajo asociado, lo que constituye a la vez una capacidad y un riesgo de privacidad.
- Procesamiento de conversaciones multi-turno de hasta 8.192 tokens de prompt.
- No soporta de forma documentada *tool calling*, uso agéntico, visión, audio ni otros idiomas distintos del inglés.
- No ejecuta la tarea del usuario ni actúa como simulador: solo genera la representación.

## Casos de uso

- **Evaluación de asistentes conversacionales con usuarios sintéticos**: se genera la representación de una conversación real autorizada y se pasa a un simulador LLM independiente, que reproduce el comportamiento del usuario frente a una nueva versión del asistente. Permite comparar versiones del sistema con condiciones de usuario realistas y reproducibles.
- **Pruebas de regresión en pipelines de diálogo**: la representación (`task` + `user_behavior`) actúa como fixture versionado en el repositorio de pruebas, de modo que los equipos pueden reejecutar escenarios de usuario estables tras cada cambio del asistente sin depender de transcripciones completas.
- **Investigación sobre diversidad conductual**: al condensar cada conversación en un comportamiento descrito, se pueden agrupar y muestrear poblaciones de usuarios simulados preservando la variedad de estilos y estrategias observada en el corpus de origen, algo útil en estudios de interacción y en la generación de *benchmarks* de diálogo.
- **Análisis de fricción y abandono**: el campo `user_behavior` incluye patrones de feedback y terminación, lo que permite estudiar por qué los usuarios abandonan una conversación y correlacionarlo con tramos concretos del diálogo.
- **Enriquecimiento y etiquetado de corpus conversacionales**: conversión de transcripciones multi-turno en metadatos estructurados (tarea declarada y estilo de usuario) para su uso en análisis posteriores, búsqueda o entrenamiento de otros componentes, siempre con revisión humana y minimización de datos personales.
- **Preparación de escenarios de *red teaming***: representaciones que capturan la revelación incremental de restricciones permiten construir usuarios simulados que no exponen toda la información de golpe, un patrón habitual en pruebas de robustez y seguridad de asistentes.
- **Ajuste de simuladores de usuario existentes**: la representación sirve como contexto de condicionamiento para simuladores ya desplegados (por ejemplo, la familia UserLM), sin necesidad de reentrenar el simulador para cada nuevo perfil de usuario.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card describe mejoras cualitativas en fidelidad de reconstrucción de conversaciones, transferencia de patrones conductuales, preservación de diversidad en poblaciones simuladas y emparejamiento entre conversaciones del mismo usuario en la evaluación de reidentificación del trabajo asociado, pero no acompaña esas afirmaciones con tablas ni métricas numéricas.

## Requisitos de hardware

- **VRAM estimada para inferencia** (calculada a partir del recuento de parámetros, no publicada por el autor): ~9,1 GB de pesos en bf16, ~18,2 GB en fp32, ~4,5 GB en int8 y ~2,3-2,7 GB en int4. A ello hay que sumar el KV cache, que con prompts de hasta 8.192 tokens y 1.024 tokens de salida puede añadir varios GB según la configuración de capas y cabezas del modelo base (dato no disponible).
- **GPU recomendadas**: A100 40 GB u H100 para servir varias peticiones concurrentes con prompts largos; L40S o A10G para despliegues de una sola copia en bf16; RTX 4090 (24 GB) para inferencia e iteración en bf16 con holgura.
- **¿Cabe en GPU de consumo?**: sí. RTX 4090/3090 (24 GB) y RTX 4080 (16 GB) en bf16; tarjetas de 12 GB requieren cuantización a int8 y tarjetas de 8 GB, int4. El ejemplo oficial también contempla ejecución en CPU en fp32 con 8 hilos, viable solo para pruebas puntuales.
- **Opciones de despliegue**: el autor documenta `transformers` con `AutoModelForImageTextToText` y `apply_chat_template`. vLLM, TGI u otros servidores no están verificados en la información disponible. llama.cpp y Ollama requerirían una conversión a GGUF que el autor no publica.
- **Latencia y throughput**: no disponibles. La decodificación es greedy y la salida está acotada a 1.024 tokens, lo que limita el coste por petición; el coste dominante es el prefill del prompt de hasta 8.192 tokens.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Función | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| UserRepGen-4B (Microsoft) | 4,54 B | 9.216 tokens de entrenamiento; prompt máximo 8.192 | Genera representaciones (`task` + `user_behavior`) para condicionar un simulador | MIT | Pesos en safetensors en HuggingFace |
| UserLM-8b (Microsoft) | ~8 B según el nombre del modelo; cifra exacta no disponible | No disponible | Genera turnos del usuario simulado | No disponible en la información proporcionada | HuggingFace |
| UserLM-2.0 (Microsoft) | No disponible | No disponible | Genera turnos del usuario simulado | No disponible en la información proporcionada | HuggingFace |
| Qwen3.5-4B (Qwen) | ~4 B (modelo base) | No disponible en la información proporcionada | Modelo de lenguaje generalista | No disponible en la información proporcionada | HuggingFace |

La comparación relevante es funcional: UserRepGen-4B y la familia UserLM resuelven la simulación de usuarios por vías distintas (representación frente a generación de turnos). No se dispone de datos públicos de rendimiento que permitan comparar su calidad de forma cuantitativa.

## Limitaciones y advertencias

- **Riesgo de privacidad**: la propia model card indica que las representaciones mejoran el emparejamiento entre conversaciones del mismo usuario en tareas de reidentificación y que no son datos anonimizados. Deben tratarse como datos personales y aplicar minimización, control de acceso y bases legales conforme al RGPD en despliegues en la UE.
- **Alucinación e inferencias no respaldadas**: el modelo puede atribuir al usuario rasgos o intenciones no presentes en la conversación; el flujo recomendado incluye revisar las descripciones antes de usarlas.
- **Fuga de información específica de la tarea**: la descripción de tarea puede contener detalles del caso concreto; el autor recomienda revisar y eliminar filtraciones antes de pasar la representación al simulador.
- **Alcance limitado**: solo inglés y solo entrada de texto. No hay soporte documentado de tool calling, agentes, visión ni audio.
- **No es un simulador**: no genera turnos de usuario ni ejecuta la tarea; usarlo como simulador produciría resultados incorrectos.
- **Límite de prompt**: 8.192 tokens. Conversaciones más largas deben truncarse o resumirse, con la consiguiente pérdida de señal conductual.
- **Salida no garantizada como JSON válido**: el flujo oficial incluye una fase de validación de los campos `task` y `user_behavior`.
- **Ausencia de benchmarks**: no hay métricas públicas que permitan estimar la calidad frente a alternativas, por lo que cualquier decisión de adopción debería basarse en una evaluación propia sobre el dominio objetivo.
- **Licencia**: MIT permite uso comercial y modificación, pero no exime del cumplimiento normativo en materia de protección de datos ni de las condiciones de uso de las conversaciones procesadas.
- **Sesgos**: no se documenta ninguna evaluación de sesgos en la información disponible; al derivar de conversaciones reales, puede reproducir los sesgos presentes en el corpus de origen.
- **Trazabilidad temporal**: el modelo se entrenó entre julio y agosto de 2026; no se especifica la fecha de corte de conocimiento del modelo base.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/microsoft/UserRepGen-4B
- Modelo base Qwen3.5-4B: https://huggingface.co/Qwen/Qwen3.5-4B
- UserLM-8b: https://huggingface.co/microsoft/UserLM-8b
- UserLM-2.0: https://huggingface.co/microsoft/UserLM-2.0
- Resultados de la búsqueda web: solo se recuperaron páginas corporativas genéricas de Microsoft (microsoft.com, account.microsoft.com, myaccount.microsoft.com) sin información técnica sobre el modelo. No se han encontrado en la búsqueda papers, blogs técnicos, repositorios de código ni demos adicionales.
