# EmergenceMachines/psi-agent-trust-r42-after-the-lookup

## Resumen

`psi-agent-trust-r42-after-the-lookup` es un artefacto de investigación publicado por EmergenceMachines, no un modelo de propósito general. Se trata de un *replication kit* asociado a la ronda 42 de una serie de experimentos sobre confianza de agentes (psi-agent-trust), construido sobre el modelo base Qwen/Qwen3.5-0.8B mediante fine-tuning y evaluado con la librería `parameter-space-inspector` (PSI 0.5.0 o superior) y su *Context lab*. El repositorio contiene el pre-registro, los ítems de evaluación, los datos crudos de las respuestas y el código de puntuación, no un checkpoint pensado para despliegue.

El experimento aborda un problema concreto de fiabilidad en agentes con acceso a herramientas: qué fuente gana cuando la información de una herramienta (un *lookup*) contradice lo que el usuario ha dicho. La ronda 41 había observado que un lookup en el mensaje anulaba el turno previo del usuario en 11 de 12 casos. La ronda 42 altera el orden de los mensajes, introduce una corrección explícita del usuario tras la respuesta del modelo y marca el lookup como obsoleto ("last updated 2019; may be out of date").

El resultado central es que, en este modelo de 0,8B, lo último que se dice gana con independencia de quién lo diga: si el lookup va primero, gana en 5 de 12; si la corrección del usuario va después de la respuesta del modelo, gana en 11 de 12; y si el lookup se marca como desactualizado, se cita con su advertencia y se usa igualmente en 11 de 12. Es relevante para quien diseñe agentes con tool calling porque documenta un fallo de recencia y de obediencia a caveats textuales en modelos pequeños.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base Qwen/Qwen3.5-0.8B; el artefacto es un kit de replicación sobre PSI, no un checkpoint documentado) |
| Parametros totales | no disponible (el nombre del modelo base sugiere ~0,8B, sin confirmación en la información) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (la replicación usa Qwen3.5-0.8B en formato GGUF) |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | no disponible (el modelo base se ejecuta en GGUF; el repositorio publica datos JSONL, código Python y documentos Markdown) |

## Arquitectura y entrenamiento

El repositorio no documenta la arquitectura del modelo base más allá de la referencia a Qwen/Qwen3.5-0.8B como `base_model` con relación `finetune`. No se especifican número de tokens de entrenamiento, composición del dataset, ni si hubo RLHF, DPO o ajuste supervisado. El artefacto en sí es un conjunto de evaluación pre-registrado: `prereg.md` con su hash SHA-256 en `prereg.sha256`, los ítems en `code/items41.py` (heredados de la ronda 41), el runner `code/r42.py`, el scorer `code/score41.py` y un servidor MCP en `code/mcp.py`.

La innovación metodológica es el diseño experimental: 96 piezas de evaluación generadas con decodificación greedy, cuatro condiciones (línea base de la ronda 41, lookup primero, corrección del usuario después, lookup marcado como obsoleto) y una métrica de odds del valor del usuario en la primera pieza. El autor advierte que la copia pública está "limpiada": las etiquetas internas de la model card, `prereg.md` y `results.md` se sustituyeron por redacción neutra, de modo que `prereg.md` ya no coincide con `prereg.sha256`. Los números, ítems, código y datos se mantienen salvo rutas locales.

## Capacidades

- Generación de texto y respuesta a preguntas dentro del protocolo de evaluación del kit (conflicto usuario-herramienta).
- Tool calling / uso de herramientas simulado mediante un servidor MCP (`code/mcp.py`) y un lookup inyectado en el contexto.
- Manejo de conflictos de conocimiento (*knowledge conflict*): comparación entre el valor aportado por el usuario y el valor devuelto por la herramienta.
- Procesamiento de caveats textuales: el modelo repite advertencias de obsolescencia ("last updated 2019; may be out of date") sin que ello modifique su respuesta.
- Replicación determinista: la decodificación greedy reproduce las respuestas registradas en `data/raw.jsonl`.
- No se documentan capacidades de visión, audio, matemáticas avanzadas ni multilingüismo.

## Casos de uso

- Auditoría de fiabilidad de agentes con herramientas: el kit permite reproducir el experimento y comprobar si un modelo pequeño prioriza la herramienta sobre el usuario, midiendo el efecto del orden de los mensajes en 96 piezas.
- Diseño de políticas de contexto en agentes: los resultados (5/12 con lookup primero frente a 11/12 con corrección posterior) sirven para decidir en qué posición colocar correcciones del usuario en el prompt.
- Evaluación de manejo de datos obsoletos: la condición de lookup marcado como desactualizado (0/12 a favor del usuario, 4 caveats citados con el valor mantenido) es un test directo para sistemas que consumen APIs con frescura variable.
- Investigación replicable en *context labs*: el pre-registro, el hash y los datos crudos permiten reejecutar con PSI 0.5.0 o superior y comparar contra la ronda 41.
- Formación de criterio sobre modelos de 0,8B en producción: los fallos observados (recencia, obediencia a caveats) justifican no delegar en modelos de este tamaño decisiones donde el usuario corrige a una herramienta.
- Base para extensiones experimentales: el autor enumera lo que el diseño no resuelve (persistencia de la corrección en turnos posteriores, lookup marcado como erróneo de forma explícita, ambas fuentes en un mismo mensaje, modelos agent-native, modelos mayores), lo que convierte el kit en punto de partida para nuevas rondas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible (MMLU, HumanEval, GSM8K u otros). Los únicos datos cuantitativos son los del experimento de confianza:

| Condición | Valor del usuario | Valor de la herramienta | Conflicto o caveat nombrado | Ninguno | Odds del valor del usuario en la primera pieza |
|---|---|---|---|---|---|
| Línea base ronda 41 (turno del usuario, luego lookup) | 0 | 11 | 1 | 1 | 0,38 |
| Lookup primero, hecho del usuario al final | 5 | 5 | 2 | 2 | 0,86 |
| Corrección del usuario tras la respuesta del modelo | 11 | 0 | 0 | 1 | 0,95 |
| Lookup marcado "last updated 2019; may be out of date" | 0 | 11 | 4 caveats, valor mantenido | 1 | 0,39 |

El autor indica que el scorer por reglas subcuenta en algunos casos y que todas las respuestas se leyeron a mano en `results.md`. La calificación de hipótesis fue: h01 fallo de par, h05 fallo de par, h06 acierto de par, control acierto en todos.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información; por el tamaño implícito del modelo base (~0,8B) y el uso de GGUF, es plausible que quepa en GPU de consumo, pero el dato no está confirmado.
- GPU recomendadas: no disponible.
- ¿Cabe en GPU de consumo? No confirmado; el modelo base se ejecuta en GGUF según las instrucciones de replicación, lo que sugiere viabilidad en hardware modesto, sin cifras publicadas.
- Opciones de despliegue: PSI 0.5.0 o superior con el servidor de agentes y Qwen3.5-0.8B (GGUF) como modelo local. No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye modelos comparables de la misma categoría (kits de replicación sobre confianza de agentes), y las alternativas de modelo base (otros Qwen de la misma familia u otros modelos de ~0,8B) no se evalúan en el repositorio.

## Limitaciones y advertencias

- El artefacto no es un modelo desplegable: es un kit de replicación con datos, código y pre-registro; no debe tratarse como checkpoint de producción.
- El pre-registro público no coincide con su hash: `prereg.md` fue reescrito con redacción neutra y `prereg.sha256` corresponde al original, por lo que la verificación de integridad falla por diseño.
- Las notas de discusión internas no se incluyen y las etiquetas internas fueron sustituidas; la trazabilidad completa del experimento no es pública.
- El experimento se limita a un modelo de 0,8B con decodificación greedy y 12 ítems por condición (96 piezas en total); la muestra es pequeña y los resultados no son extrapolables a modelos mayores ni a modelos agent-native.
- El propio autor declara lo que el diseño no puede resolver: persistencia de la corrección en turnos posteriores, un lookup marcado como erróneo de forma explícita, ambas fuentes en un mismo mensaje, modelos agent-native y modelos de mayor tamaño.
- Riesgo de alucinación y sesgos: no evaluados en la información disponible; el fenómeno documentado es de priorización de fuentes (recencia y obediencia literal a caveats), no de veracidad factual.
- Licencia apache-2.0: permite uso comercial del artefacto, pero el modelo base Qwen3.5-0.8B puede tener condiciones propias no detalladas aquí; conviene verificar su licencia antes de reutilizarlo.
- El scorer por reglas subcuenta respuestas, según el autor; cualquier reutilización de la métrica debe leer las respuestas a mano contra `results.md`.

## Enlaces

- Hugging Face: https://huggingface.co/EmergenceMachines/psi-agent-trust-r42-after-the-lookup
- Ronda 41 (experimento previo): https://huggingface.co/EmergenceMachines/psi-agent-trust-r41-the-user-against-the-tool
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Pre-registro y resultados: `prereg.md`, `prereg.sha256`, `results.md` (dentro del repositorio)
- Datos y código: `data/raw.jsonl`, `data/raw_r41.jsonl`, `data/summary.json`, `data/run42.log`, `data/transcript.jsonl`, `code/items41.py`, `code/score41.py`, `code/r42.py`, `code/mcp.py` (dentro del repositorio)
- Paper, blog, repositorio externo o demo: no disponible
