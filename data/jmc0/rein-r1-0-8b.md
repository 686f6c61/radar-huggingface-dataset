# jmc0/rein-r1-0.8b

## Resumen

Rein-r1-0.8B es un modelo de decisión tipada desarrollado por el usuario jmc0, construido como un ajuste fino (finetune) sobre Qwen/Qwen3.5-0.8B-Base. No es un modelo generativo de texto: su función es leer una conversación junto con una hoja de reglas definida por el operador y devolver, para cada regla, una probabilidad calibrada por cada opción posible. Esas decisiones se usan después para dirigir a un modelo de chat (por ejemplo, Qwen3.5 instruct), abriendo la respuesta con una llamada a herramienta, inyectando frases obligatorias, prohibiendo palabras o cortando respuestas que empiezan a violar una regla.

El modelo se presenta como una capa de control y guardrails para sistemas conversacionales, con especial énfasis en el cumplimiento fiable de tool calling. Según la model card, Rein-r1-0.8B responde correctamente al 95,8 % de las preguntas de elección de herramienta sobre reglas que nunca vio en entrenamiento. En un escenario extremo a extremo, Qwen3.5-0.8B llamó a la herramienta necesaria en el 93 % de los casos con Rein frente al 61 % en solitario, y a la herramienta correcta en el 89 % frente al 53 % (checkpoint previo de esta misma receta).

Con 752.393.024 parámetros reales (aproximadamente 0,75 mil millones) y un repositorio de 3,0 GB, es un modelo pequeno pensado para ejecutarse en GPU de consumo. La licencia es Apache 2.0, lo que facilita su integración en productos comerciales. Su relevancia actual radica en que aborda un problema persistente de los modelos de chat pequenos: omitir llamadas necesarias, invocar herramientas no solicitadas y narrar acciones que nunca se ejecutan.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer basado en Qwen3.5 (tag `qwen3_5_text`), con soporte opcional de kernels Gated DeltaNet |
| Parametros totales | 752.393.024 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (la model card menciona float32 y bfloat16 en sus ejemplos) |
| Idiomas soportados | en, pt, multilingual |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

Rein-r1-0.8B es un ajuste fino de Qwen/Qwen3.5-0.8B-Base, un transformer de la familia Qwen3.5. El modelo se etiqueta con `qwen3_5_text` y `custom_code`, lo que implica que el repositorio incluye código propio de decisión y control que debe ejecutarse con `trust_remote_code=True`. La model card menciona que `flash-linear-attention` y `causal-conv1d` son extras opcionales que anaden kernels fusionados de Gated DeltaNet en GPUs NVIDIA compatibles, con los mismos resultados; todas las cifras de velocidad y memoria reportadas se midieron con la ruta estándar de PyTorch en una GPU de consumo.

El entrenamiento se realizó sobre varios conjuntos de datos: jmc0/rein-decisions (dataset propio de decisiones), PolyAI/banking77, clinc/clinc_oos, AmazonScience/massive y jaredpalmer/kev-suites. No se especifica en la información disponible el número total de tokens de entrenamiento, la composición exacta del dataset ni si se aplicaron técnicas de RLHF o DPO. La innovación principal es el enfoque de "decisión tipada": cada regla se formula como una pregunta con opciones propias, y el modelo devuelve una probabilidad calibrada por opción, lo que permite umbrales como 0,85 para forzar una llamada a herramienta o 0,05 para retirar las herramientas de un turno.

## Capacidades

- Decisión tipada: responde a preguntas de elección con probabilidades calibradas por opción, sobre reglas vistas y no vistas en entrenamiento.
- Guardrails conversacionales: aplica hojas de reglas definidas por el operador para abrir respuestas con frases obligatorias, prohibir temas, banear palabras o cortar respuestas que violan una regla.
- Tool calling fiable: decide si un turno necesita herramienta y cuál, forzando que la respuesta se abra con esa llamada; también puede retirar las herramientas cuando está seguro de que no se necesitan.
- Corrección de acciones narradas: mediante reglas con `scope: draft`, lee la respuesta mientras se escribe y sustituye una acción narrada (por ejemplo, un reembolso falso) por la llamada real.
- Soporte multi-turno: lee conversaciones largas junto con la hoja de reglas antes y durante cada respuesta.
- Capacidades multilingües: declaradas para inglés, portugués y multilingüe.
- No genera texto: el texto lo produce el modelo de chat asociado (por ejemplo, Qwen3.5 instruct).

## Casos de uso

- Atención al cliente automatizada: Rein decide en cada turno si el mensaje del cliente requiere `track_order`, `issue_refund` u otra herramienta, y fuerza la llamada correcta antes de que el modelo de chat redacte la respuesta, evitando promesas de reembolso sin ejecución real.
- Guardrails de cumplimiento normativo: el operador define reglas como "no dar asesoramiento médico" o "no prometer plazos de entrega"; Rein devuelve la probabilidad de que la respuesta en curso viole cada regla y puede cortarla o sustituirla.
- Control de roleplay en produccion: en personajes o asistentes con restricciones temáticas, Rein aplica reglas de tema permitido o prohibido turno a turno sin necesidad de reentrenar el modelo de chat.
- Integración en pipelines de CI/CD para agentes: al ser un modelo pequeno (0,75 B) y licencia Apache 2.0, se puede desplegar como servicio de decisión junto a un modelo de chat mayor, verificando llamadas a herramientas antes de ejecutarlas.
- Moderación de conversaciones multi-turno: lee el historial completo y la hoja de reglas para detectar desviaciones acumuladas que un filtro por mensaje individual no captaría.
- Sistemas de agentes con multi-step reasoning: Rein decide qué herramienta abrir en cada paso, reduciendo llamadas omitidas o innecesarias en flujos con varias herramientas disponibles.
- Asistentes de banca y comercio electrónico: los datasets de entrenamiento (banking77, clinc_oos, massive) apuntan a dominios de intención de cliente, adecuados para clasificación de intenciones y enrutado a herramientas específicas.

## Benchmarks y rendimiento

| Metrica | Resultado |
|---|---|
| Precisión en elección de herramienta sobre reglas no vistas | 95,8 % |
| Llamada a la herramienta necesaria (Qwen3.5-0.8B + Rein) | 93 % |
| Llamada a la herramienta necesaria (Qwen3.5-0.8B solo) | 61 % |
| Llamada a la herramienta correcta (Qwen3.5-0.8B + Rein) | 89 % |
| Llamada a la herramienta correcta (Qwen3.5-0.8B solo) | 53 % |

Los datos corresponden al checkpoint previo de esta receta, según indica la propia model card. No se han publicado en la información disponible resultados de benchmarks estándar como MMLU, HumanEval o GSM8K.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita; con 752 millones de parámetros, en bfloat16 el peso ocupa aproximadamente 1,5 GB, y en float32 unos 3 GB, más el coste de activaciones y del modelo de chat asociado.
- GPU recomendadas: la model card indica que las cifras se midieron en una GPU de consumo; también menciona ejecución en CPU en float32 para los ejemplos. No se especifican modelos concretos de GPU.
- Cabe en GPU de consumo: sí, por tamano (0,75 B de parámetros).
- Opciones de despliegue: transformers (con `trust_remote_code=True`), safetensors; se mencionan `flash-linear-attention` y `causal-conv1d` como extras opcionales para kernels Gated DeltaNet. No se mencionan vLLM, llama.cpp, Ollama ni TGI en la información disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables de decisión tipada o guardrails en la documentación proporcionada. La comparación más directa disponible es contra el propio modelo de chat sin Rein, que se refleja en la tabla de benchmarks (93 % frente a 61 % en llamada necesaria; 89 % frente a 53 % en llamada correcta).

| Modelo | Parametros | Contexto | Tool calling | Licencia |
|---|---|---|---|---|
| Rein-r1-0.8B | 752.393.024 | no disponible | 95,8 % en elección sobre reglas no vistas | apache-2.0 |
| Qwen3.5-0.8B (sin Rein) | no disponible | no disponible | 61 % llamada necesaria, 53 % correcta | no disponible |

## Limitaciones y advertencias

- Rein no genera texto: requiere un modelo de chat externo que redacte las respuestas, lo que anade latencia y complejidad al despliegue.
- Requiere `trust_remote_code=True`, lo que implica ejecutar código personalizado incluido en el repositorio; la propia model card recomienda leerlo antes de ejecutarlo.
- Las cifras de rendimiento corresponden al checkpoint previo de la receta, según la model card, por lo que pueden no reflejar exactamente el estado actual del modelo.
- No se especifica la longitud de contexto soportada, un dato crítico para conversaciones largas.
- El modelo está orientado a decisión y control, no a generación; no debe evaluarse con benchmarks generativos estándar.
- El número de descargas (4) y likes (1) es muy bajo, lo que sugiere poca validación por parte de la comunidad.
- Aunque la licencia es Apache 2.0, el uso comercial del código personalizado del repositorio debe revisarse por separado.
- Riesgo de calibración: los umbrales (0,85 para forzar herramienta, 0,05 para retirarla) son valores por defecto que pueden requerir ajuste según el dominio.
- Idiomas declarados (en, pt, multilingual), pero no se detalla el rendimiento por idioma ni la cobertura real fuera del inglés y el portugués.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/jmc0/rein-r1-0.8b
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B-Base
- Dataset propio: https://huggingface.co/datasets/jmc0/rein-decisions
- Dataset PolyAI/banking77: https://huggingface.co/datasets/PolyAI/banking77
- Dataset clinc/clinc_oos: https://huggingface.co/datasets/clinc/clinc_oos
- Dataset AmazonScience/massive: https://huggingface.co/datasets/AmazonScience/massive
- Dataset jaredpalmer/kev-suites: https://huggingface.co/datasets/jaredpalmer/kev-suites
