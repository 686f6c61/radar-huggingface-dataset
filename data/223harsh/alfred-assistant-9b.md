# 223Harsh/alfred-assistant-9b

## Resumen

ALFRED Assistant 9B es un ajuste fino por destilación de Qwen3.5-9B, desarrollado por 223Harsh en el marco del hackathon GDG *Agentic AI in companies* (Turín, 21 de noviembre de 2026). El modelo está especializado en tareas operativas de banca: triaje de recordatorios de préstamos vencidos, preguntas y respuestas con citas sobre documentación interna, extracción de hechos y generación de resúmenes matutinos. No es un asesor financiero general, sino un componente de un sistema agéntico con control humano.

La relevancia técnica reside en su método de construcción: un profesor de 180B parámetros (Qwen3.8-Flash-Next) respondió 1.650 tareas bancarias y solo se conservaron las 1.309 respuestas que coincidían con las etiquetas de referencia. Sobre ese conjunto se aplicó un LoRA posteriormente fusionado en los pesos base. El resultado es un modelo de 9.409.813.744 parámetros (9,4B) con licencia Apache 2.0 que, según el autor, iguala o supera al profesor en varias tareas del dominio con menor latencia.

El modelo está diseñado para operar exclusivamente sobre texto seudonimizado (marcadores como `<CLIENT_0042>`), detrás de un filtro de roles, un verificador independiente de respuestas y un paso de aprobación humana. Su ámbito lingüístico declarado es inglés e italiano, y su uso previsto excluye la toma de decisiones autónomas sobre personas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Qwen3.5), ajuste fino LoRA fusionado |
| Parametros totales | 9.409.813.744 (9,4B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada |
| Tipos de cuantizacion | No disponible en la informacion proporcionada (pesos publicados en safetensors) |
| Idiomas soportados | Ingles, italiano |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors |

## Arquitectura y entrenamiento

El modelo parte de Qwen3.5-9B, un transformer decoder-only denso de 9,4B parámetros, y se entrena mediante destilación de un profesor de 180B (Qwen3.8-Flash-Next). El proceso consistió en generar 1.650 respuestas del profesor a tareas bancarias y filtrar por coincidencia con las etiquetas de referencia, conservando 1.309 ejemplos. Sobre ese conjunto se aplicó un ajuste LoRA que posteriormente se fusionó en los pesos base, dando lugar a un checkpoint único en safetensors de 18,8 GB.

Los datos de entrenamiento son sintéticos: clientes ficticios generados con Faker, junto con conjuntos de datos públicos, sin datos reales de clientes ni información personal. Las tareas cubiertas en el entrenamiento son cuatro: `triage` (triaje de recordatorios de préstamos), `qa` (preguntas y respuestas con citas), `extract_facts` (extracción de hechos) y `brief` (resúmenes matutinos). Los formatos de prompt están definidos en `llm/prompts.py` del repositorio de GitHub. No se especifican en la información disponible el número total de tokens de entrenamiento, la composición exacta del dataset público ni si se aplicaron fases de RLHF o DPO.

## Capacidades

- Generación de texto conversacional orientada a tareas operativas bancarias.
- Triaje de préstamos vencidos: decisión exacta más identificación de excepciones.
- Preguntas y respuestas fundamentadas (*grounded Q&A*) con citas a la documentación recuperada.
- Abstención explícita: responde "I DON'T KNOW" ante preguntas sin respuesta en el contexto proporcionado.
- Extracción de hechos estructurados a partir de texto documental.
- Generación de resúmenes matutinos (*morning briefs*).
- Resistencia a inyección de instrucciones dentro de documentos (según el autor, 100% en los casos evaluados).
- Capacidad multilingüe limitada a inglés e italiano.
- Modo *thinking* desactivable mediante `chat_template_kwargs={"enable_thinking": false}`.
- Integración con servidores compatibles con la API de OpenAI (por ejemplo, vLLM).

## Casos de uso

- Triaje de cartera de préstamos vencidos: el modelo clasifica cada recordatorio con una decisión exacta y detecta excepciones que requieren revisión humana; encaja en un flujo donde las reglas del banco siguen siendo autoritativas y cualquier discrepancia detiene el caso.
- Atención al cliente interna con recuperación aumentada: responde consultas de empleados bancarios exclusivamente a partir de documentación aprobada y devuelve citas verificables, lo que permite auditar cada respuesta.
- Extracción de hechos de contratos y expedientes: convierte texto documental seudonimizado en campos estructurados para alimentar sistemas posteriores, con una recall de clave del 98,8% según el autor.
- Generación de resúmenes operativos diarios: produce el *morning brief* del equipo a partir del estado del sistema y de los casos abiertos, reduciendo el trabajo manual de preparación.
- Asistente con abstención controlada en mesas de soporte: cuando la respuesta no está en la base de conocimiento, el modelo declina en lugar de improvisar, lo que reduce el riesgo de alucinación en un entorno regulado.
- Despliegue on-premise en infraestructura bancaria: al ser un modelo de 9,4B con licencia Apache 2.0 y pesos safetensors, puede servirse en servidores compatibles con OpenAI dentro del perímetro de la entidad, sin dependencia de APIs externas.
- Verificación cruzada en pipelines agénticos: actúa como componente de un sistema con verificador independiente y aprobación humana, aportando la capa de razonamiento sobre políticas y documentos.

## Benchmarks y rendimiento

Resultados en conjunto de retención (*held-out*) publicados por el autor:

| Tarea | Qwen3.5-9B base | ALFRED Assistant 9B | Profesor 180B |
|---|---|---|---|
| Triaje de recordatorios de préstamos (decisión exacta + excepción) | 91,0% | 100% | 95,5% |
| Q&A correcto / citado | 99,0% / 100% | 100% / 100% | 100% / 100% |
| Pregunta sin respuesta → "I DON'T KNOW" | 100% | 100% (0 alucinaciones) | 100% |
| Extracción de hechos (recall de claves) | ~100% | 98,8% | No disponible |
| Latencia por llamada (1 GPU) | 1,84 s | 1,24 s | 1,59 s |

Casos difíciles reportados por el autor: conflictos de versión de políticas 100%, preguntas casi sin respuesta con abstención 100%, instrucciones inyectadas en documentos ignoradas 100%, paráfrasis, erratas e italiano 81%, triaje en límites de reglas 93%.

No se han publicado resultados en benchmarks generales (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; para un modelo denso de 9,4B, los pesos en safetensors ocupan aproximadamente 18,8 GB en precisión completa (fp16/bf16), por lo que se requiere al menos esa cantidad de VRAM para servir sin cuantizar.
- GPU recomendadas: no especificadas por el autor. El benchmark de latencia se ejecutó en "1 GPU" sin identificar el modelo.
- Cabe en GPU de consumo: no confirmado en la información disponible; dependerá de la cuantización aplicada, que el autor no documenta.
- Opciones de despliegue: cualquier servidor compatible con la API de OpenAI, con vLLM mencionado explícitamente. No se confirma soporte de llama.cpp, Ollama o TGI.
- Latencia: 1,24 s por llamada en la configuración de evaluación del autor (1 GPU). Throughput no disponible.
- Configuración de inferencia recomendada: *thinking* desactivado y temperatura 0.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Enfoque | Disponibilidad |
|---|---|---|---|---|---|
| ALFRED Assistant 9B | 9,4B | No disponible | Apache 2.0 | Banca agéntica, destilado de profesor 180B | Hugging Face |
| Qwen3.5-9B (base) | 9,4B | No disponible | Según Qwen (no especificada aquí) | Propósito general | Hugging Face |
| Qwen3.8-Flash-Next (profesor) | 180B | No disponible | Qwen community licence | Propósito general, usado como profesor | No disponible en la información |

No se dispone de datos de benchmarks generales ni de otros modelos especializados en banca comparables en la información proporcionada.

## Limitaciones y advertencias

- Entrenado para las políticas y formatos de un banco ficticio (Lumen Bank); no es un asesor bancario general y no debe usarse fuera de ese dominio sin reevaluación.
- Debe operar detrás de recuperación con citas, control de acceso por roles y aprobación humana; nunca debe tomar decisiones sobre personas de forma autónoma.
- La destilación proviene de salidas de Qwen3.8-Flash-Next, sujeto a la licencia comunitaria de Qwen; aunque los pesos se publican como Apache 2.0, conviene revisar esa licencia para el caso de uso concreto.
- Idiomas limitados a inglés e italiano; el rendimiento en paráfrasis, erratas e italiano cae al 81% en los casos difíciles evaluados.
- Riesgo de alucinación mitigado por diseño (abstención y verificador independiente), pero no eliminado; el propio autor reporta 0 alucinaciones solo en el conjunto de evaluación de preguntas sin respuesta.
- El triaje en límites de reglas alcanza el 93%, por lo que las discrepancias deben detener el caso y escalarse a una persona.
- Solo se ha evaluado con datos sintéticos; el comportamiento con datos reales de producción no está documentado.
- No hay información pública sobre cuantizaciones, contexto máximo efectivo ni throughput en producción.
- Sesgos conocidos: no documentados en la información disponible.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/223Harsh/alfred-assistant-9b
- Repositorio de código y evaluación: https://github.com/Harsh223/alfred
- Demo en vivo y arena de red team: https://alfred.harsh.one
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
