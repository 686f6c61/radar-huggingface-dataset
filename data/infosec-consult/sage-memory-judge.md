# Infosec-Consult/sage-memory-judge

## Resumen

SAGE Memory Judge (v17b) es un modelo de 0,8 mil millones de parámetros derivado de Qwen/Qwen3.5-0.8B mediante un ajuste fino completo, desarrollado por Infosec-Consult para el proyecto SAGE. No es un modelo conversacional: actúa como un clasificador binario local que decide si una memoria propuesta debe escribirse en el almacén de largo plazo de un agente. Responde a dos preguntas de sí/no —si la afirmación está respaldada por la evidencia aportada y si merece persistir como memoria duradera— leyendo directamente las log-probabilidades del primer token generado.

El modelo resuelve un problema concreto de ingeniería de agentes: evitar que un sistema de memoria persistente acumule ruido (comentarios de sesión, tareas puntuales, afirmaciones no sustentadas) sin depender de un servicio de inferencia en la nube. Se sirve exclusivamente en formato GGUF q8_0 a través de Ollama, con un endpoint compatible con la API de OpenAI, y está pensado para ejecutarse íntegramente en la máquina que aloja al agente.

La versión v17b corrige los sesgos de v16, que rechazaba sistemáticamente decisiones cortas del usuario y tareas etiquetadas con `TODO:` o `Task:`. Con 157 descargas y licencia Apache-2.0, es un componente de infraestructura más que un modelo de propósito general, y su relevancia radica en ofrecer un juez calibrado, determinista y auditable para pipelines de memoria de agentes.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (base Qwen3.5-0.8B), ajuste fino completo |
| Parametros totales | 772.845.888 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF q8_0 (único publicado: `sage-judge-v17b-q8_0.gguf`) |
| Idiomas soportados | en, ar, fa, zh, hi, ru, id, ja, ko, tr, vi, ur, bn, th, bg |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (runtime Ollama; endpoint compatible con OpenAI) |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3.5-0.8B, un transformer decoder-only de 772,8 millones de parámetros, y se somete a un ajuste fino completo (no LoRA). La innovación no está en la arquitectura, sino en el protocolo de inferencia: el juez formula dos preguntas de sí/no y extrae la probabilidad `P(Y)/(P(Y)+P(N))` renormalizada sobre la masa de etiquetas en el primer token generado. Para que esto funcione, el modo de razonamiento (thinking) debe estar desactivado obligatoriamente; en la ruta `/v1/chat/completions` de Ollama solo `reasoning_effort: "none"` lo desactiva, mientras que en `/api/chat` se usa `think:false`.

El entrenamiento se basa en destilación desde modelos instruct más grandes mediante etiquetas suaves (probabilísticas) sobre datos sintéticos y deduplicados. En v17b se añadieron pares de contraste de tipo task-keep / chat-only-task y pares de decisiones genéricas cortas, etiquetados por dos profesores y conservados solo cuando ambos coincidían con la etiqueta objetivo, con deduplicación contra todos los conjuntos de evaluación. Los datos de entrenamiento y los modelos profesores no forman parte de la release. Los conjuntos de evaluación se escribieron de forma independiente a los datos de entrenamiento y se congelaron por digest, aunque se usaron para aceptar v16 y v17b, por lo que deben tratarse como validación y no como test intacto.

## Capacidades

- Clasificación binaria calibrada de dos criterios: **Supported** (¿la afirmación está respaldada por la evidencia aportada, incluyendo marco temporal, certeza y dirección de la relación?) y **Lasting** (¿debe almacenarse como memoria de largo plazo frente a un comentario de sesión?).
- Salida de probabilidad numérica por token, apta para umbrales operativos: aceptar ≥ 0,90, rechazar < 0,50, retener para revisión humana en el rango intermedio.
- Detección de relaciones invertidas (reversed-relation) a nivel de clase, con validación específica sobre pares simétricos.
- Manejo de tareas etiquetadas (`TODO:`, `Task (planned):`) y decisiones cortas del usuario, corregido en v17b.
- Cobertura multilingüe declarada en 15 idiomas, aunque el inglés es el mejor cubierto.
- No soporta tool calling, function calling, agentes multi-paso ni generación de texto libre: es exclusivamente un juez de una sola pasada.
- No es un modelo de chat; cualquier uso fuera del protocolo de log-probabilidades del primer token invalida su calibración.

## Casos de uso

- **Puerta de escritura en memoria de agentes**: integrado en SAGE como `memory-gate`, evalúa cada memoria candidata antes de persistirla. Con umbrales 0,90/0,50 reduce la contaminación del almacén por comentarios de sesión y afirmaciones no sustentadas, y deriva los casos dudosos a revisión humana.
- **Sistemas de agentes con memoria a largo plazo en local**: al ejecutarse vía Ollama en la misma máquina, permite construir asistentes con memoria persistente sin enviar datos a la nube, requisito habitual en entornos sanitarios, legales o de defensa.
- **Filtrado de trazas de conversación**: en pipelines de registro, el criterio Lasting separa decisiones y reglas permanentes de meras observaciones de sesión, lo que facilita construir resúmenes de memoria depurados y auditables.
- **Verificación de consistencia documental**: con el criterio Supported, comprobar si una afirmación extraída de un documento está respaldada por la evidencia citada, incluyendo la dirección de relaciones y el marco temporal, como paso previo a la indexación.
- **Gestión de tareas en asistentes de productividad**: v17b conserva tareas con etiqueta `TODO:` o `Task (planned):` (16/16 en evaluación), lo que permite distinguir tareas planificadas de comentarios efímeros al construir listas de pendientes persistentes.
- **Cribado de conocimiento en bases RAG**: antes de insertar un fragmento en un almacén vectorial, el juez filtra afirmaciones no sustentadas por la fuente, reduciendo el riesgo de propagar alucinaciones a las respuestas posteriores.
- **Despliegue en hardware modesto**: con ~1,7 s por comprobación en CPU linux/arm64 y un único token generado, es viable en servidores sin GPU o en dispositivos edge donde no cabe un modelo mayor.

## Benchmarks y rendimiento

Resultados publicados por el autor, medidos con el lector Go de SAGE (`internal/hunch.LocalClient`, v11.25.1), debias off, sobre Ollama v0.31.1 en linux/arm64. Bandas: pass ≥ 0,90, hold 0,50–0,90, reject < 0,50.

| Conjunto | v16 | v17b |
|---|---|---|
| Lasting-hard: decisiones/preferencias de usuario conservadas (p ≥ 0,5) | 10/18 | 18/18 |
| Tareas con etiqueta `TODO:` / `Task (planned):` conservadas | 0/16 | 16/16 |
| Tareas sin etiqueta conservadas | 2/8 | 6/8 |
| Gemelas de tarea solo-chat rechazadas | 24/24 | 24/24 |
| Comentarios de sesión rechazados | 18/18 | 17/18 (una retenida) |
| AUROC Lasting-hard | 0,988 | 0,995 |
| Pares de aceptación, lasting (público, 80) | AUROC 0,999; 2 positivos rechazados | AUROC 1,000; 0 positivos rechazados |
| Pares de aceptación, support (público, 126) | AUROC 0,994; 1 trampa superada | AUROC 0,993; 1 trampa superada (mismo ítem) |
| Held-out 160 (support look-alikes) | AUROC 0,984 | AUROC 0,985; trampas superadas 0/80, genuinos rechazados 5/80 |
| Reversed-relation (90) | AUROC 0,992 | AUROC 0,989; trampas rechazadas 39/40 (1 retenida), gemelas genuinas 38/40, simétricas 10/10 |
| Supported-hard (264) | AUROC 0,899 | AUROC 0,909 |

Latencia: ~1,7 s por comprobación en CPU linux/arm64 con Ollama v0.31.1 (un token generado); más rápida en GPU. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- **VRAM estimada**: el checkpoint GGUF q8_0 ocupa aproximadamente 0,8 GB (el repo completo pesa 2,5 GB por incluir versiones anteriores v15 y v16). La inferencia cabe holgadamente en GPUs con 2 GB o más.
- **GPU recomendadas**: cualquier GPU consumer moderna (RTX 3060, RTX 4060, RTX 4090) es suficiente; también A100 o H100 si se comparte con otras cargas. El modelo no requiere GPU de datacenter.
- **CPU**: funciona en CPU sin GPU; el autor reporta ~1,7 s por comprobación en linux/arm64, lo que lo hace apto para servidores modestos y dispositivos edge.
- **Despliegue**: Ollama es el runtime de referencia (`ollama create sage-memory-judge:v17b -f Modelfile`). El endpoint es compatible con OpenAI; vLLM, llama.cpp o TGI no están documentados por el autor para este modelo.
- **Throughput**: no disponible más allá de la latencia por comprobación citada; al generar un solo token, el coste dominante es el prefill del prompt de evidencia.

## Comparativa con modelos similares

No se dispone de comparativas publicadas frente a otros jueces de memoria o clasificadores de escritura para agentes. Como referencia de la misma familia y tamaño:

| Modelo | Parametros | Contexto | Tarea | Licencia | Formato |
|---|---|---|---|---|---|
| SAGE Memory Judge v17b | 772,8 M | no disponible | Clasificación binaria de memoria (Supported / Lasting) | Apache-2.0 | GGUF q8_0 |
| Qwen/Qwen3.5-0.8B (base) | ~0,8 B | no disponible | Generación de texto general | Apache-2.0 | safetensors |
| Jueces genéricos tipo LLM-as-a-judge | 7 B o superior | variable | Evaluación abierta de texto | variable | variable |

La comparación con jueces genéricos no es directa: SAGE Memory Judge está especializado en dos preguntas concretas y no puede sustituirlos en evaluación abierta, mientras que un juez genérico de 7 B o más requeriría mucha más VRAM y no ofrecería probabilidades calibradas para este protocolo específico.

## Limitaciones y advertencias

- **Punto débil en Supported-hard**: los look-alikes (copias casi idénticas con flips, alcance de la negación, alias de entidades) alcanzan AUROC 0,909 y una parte de esas trampas llega a la banda de aceptación.
- **Tareas imperativas sin motivo**: las tareas del tipo "Write integration tests for X." se siguen rechazando aproximadamente una cuarta parte de las veces; añadir el motivo o formularlas como plan lo corrige.
- **Multilingüe limitado en Lasting**: los ítems multilingües de tipo lasting se conservan aproximadamente la mitad de las veces (6/12); el inglés es el idioma mejor cubierto pese a declarar 15 idiomas.
- **Relaciones invertidas**: la validación es a nivel de clase, no por forma de relación concreta.
- **Evidencia no autenticada**: comprueba el soporte contra la evidencia aportada por el llamante, pero no autentica la fuente de esa evidencia.
- **Riesgo operativo por configuración**: si el thinking no se desactiva correctamente, el primer token es de razonamiento y el lector falla cerrado (retiene para revisión) en todas las llamadas; en la ruta `/v1/chat/completions` solo `reasoning_effort: "none"` lo desactiva, y `think:false` o `chat_template_kwargs` no tienen efecto.
- **Conjuntos de evaluación**: se usaron para aceptar v16 y v17b, por lo que son validación y no test intacto; los resultados pueden estar optimistamente sesgados.
- **Licencia**: Apache-2.0 permite uso comercial, pero el modelo base Qwen3.5-0.8B también es Apache-2.0; conviene verificar los términos del proyecto SAGE si se integra en producción.
- **No es un modelo de chat**: usarlo para generación libre o tool calling produce resultados sin garantía de calibración.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Infosec-Consult/sage-memory-judge
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Repositorio del proyecto SAGE: https://github.com/l33tdawg/sage
- Resultados por ítem de los pares públicos: `bench/judge-qualify/results/sage-judge-v17b-ollama-0.31.1-go-arm64.json` (en el repositorio SAGE)
- Paper, blog o demo adicionales: no disponible
