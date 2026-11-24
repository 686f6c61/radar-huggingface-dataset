# Jommarn/Qwen3.5-0.8B-NestedMemory-L18

## Resumen

Qwen3.5-0.8B-NestedMemory-L18 es un ajuste fino experimental del modelo base Qwen/Qwen3.5-0.8B desarrollado por el usuario Jommarn. Su particularidad no es tanto el refinamiento de los pesos como la incorporación de un mecanismo de memoria continua dentro del propio modelo: una capa `NestedMemoryLayer` inyectada en la capa 18 de las 24 totales, con buffers de memoria (`M`, `S`, `slot_values`, `expert_strength`) registrados en el `state_dict` del modelo. El objetivo declarado es permitir que una instancia desplegada acumule recuerdos personales a través de pasadas forward, sin reentrenamiento ni recuperación externa tipo RAG.

El modelo se presenta como un "Unified Continual-Memory Transformer" organizado en tres bucles: memoria asociativa rápida a nivel de token (inspirada en Titans), memoria intermedia con expertos enrutados por top-k y decaimiento según la curva del olvido de Ebbinghaus, y compuertas selectivas de lectura/escritura que deciden cuándo almacenar y cuándo recuperar información. La inyección en la capa 18 (ratio 0,75) busca que las representaciones del router sean semánticamente maduras mientras las capas 19-24 siguen componiendo lenguaje natural.

Con 0,8B parámetros, licencia Apache 2.0 y un tamaño de repositorio de 3,1 GB, el modelo está pensado para despliegues "1 modelo = 1 persona", donde cada instancia arranca con buffers en cero (`M=0, V=0`) y va construyendo su propia memoria. Los idiomas declarados son tailandés e inglés. Es un artefacto de investigación con cero descargas y cero likes en el momento de redactar esta ficha, y los resultados de evaluación publicados por el autor muestran un fallo claro de recuperación que conviene tener en cuenta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen3.5) con capa `NestedMemoryLayer` inyectada en la capa 18 de 24 |
| Parametros totales | 0,8B (modelo base) + capa de memoria standalone (~65 MB) |
| Parametros activos | no disponible (no es MoE a nivel de modelo; usa MoE enrutado top-k solo dentro de la capa de memoria) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos distribuidos en `.pt`, no se documentan GGUF ni otras cuantizaciones) |
| Idiomas soportados | tailandés (`th`), inglés (`en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | PyTorch `.pt` (`unified_nested_L18_blank.pt`, `nested_memory_layer_L18.pt`) |

## Arquitectura y entrenamiento

La arquitectura parte de Qwen/Qwen3.5-0.8B, un transformer decoder-only, y le añade una `NestedMemoryLayer` en la capa 18. Esa capa implementa tres bucles de memoria. El bucle 1 es una memoria asociativa rápida a nivel de token (estilo Titans) con un estado de momento `S`, que se actualiza online durante el forward en prefill (`T > 1`) sin retropropagación en inferencia. El bucle 2 es una memoria intermedia compuesta por "expertos" enrutados top-k (`slot_values`, `expert_strength`) con regla delta online y decaimiento según la curva del olvido de Ebbinghaus, invocable mediante `forget(days)`. El bucle 3 son compuertas selectivas de lectura/escritura aprendidas: `gate_write` se abre en afirmaciones factuales y se cierra por debajo de 0,5 en preguntas (para no sobrescribir memoria), y `gate_read` se activa de forma dispersa en tokens de entidad durante consultas de memoria y se cierra por debajo de 0,15 en consultas de conocimiento general (para preservar el conocimiento del modelo base).

Todos los buffers de memoria viven en el `state_dict` mediante `register_buffer`, lo que permite que el checkpoint `unified_nested_L18_blank.pt` se exporte con `M=0, V=0` y cada usuario acumule memoria personal solo con pasadas forward. No se documentan en la información disponible el número de tokens de entrenamiento, la composición del dataset, ni si hubo RLHF/DPO. El repositorio incluye los ficheros `Model/nested_memory.py`, `Model/qwen_memory.py` y `config.py` con la implementación de la capa y el wrapper.

## Capacidades

- Generación de texto conversacional en tailandés e inglés sobre el modelo base Qwen3.5-0.8B.
- Memorización online de datos factuales aportados por el usuario durante el forward (sin reentrenamiento), con buffers internos persistentes en el `state_dict`.
- Decaimiento controlado de recuerdos mediante la curva del olvido de Ebbinghaus (`forget(days)`).
- Enrutado selectivo de lectura/escritura: escritura activada en afirmaciones y desactivada en preguntas; lectura activada en consultas sobre entidades y desactivada en conocimiento general.
- Preservación declarada del conocimiento del modelo base en consultas generales gracias al cierre de `gate_read`.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multimodales (visión, audio): no disponible.
- Modo "thinking": no disponible.

## Casos de uso

- Asistentes personales con memoria persistente: cada instancia arranca con `M=0, V=0` y va acumulando datos del usuario (nombre, profesión, preferencias) en los buffers internos, sin necesidad de una base de datos vectorial externa ni de reindexar conversaciones.
- Prototipos de investigación sobre memoria continua: el repositorio incluye la implementación de los tres bucles (`nested_memory.py`, `qwen_memory.py`), lo que permite reproducir y modificar el mecanismo para estudiar actualización online de memoria en transformers.
- Experimentos de olvido controlado: la función `forget(days)` con decaimiento Ebbinghaus permite simular cómo envejecen los recuerdos y evaluar políticas de retención en asistentes de larga duración.
- Chatbots de dominio con conocimiento factual acotado: el cierre de `gate_write` en preguntas evita que las consultas sobrescriban la memoria, lo que resulta útil en escenarios donde el usuario alterna entre aportar datos y consultarlos.
- Evaluación comparativa de mecanismos de memoria frente a RAG: al vivir la memoria dentro del `state_dict`, se puede medir latencia y coste de actualización frente a pipelines de recuperación externa en tareas de recuerdo de entidades.
- Docencia y divulgación: como ejemplo didáctico de inyección de capas de memoria en un transformer pequeño (0,8B) con licencia permisiva y pesos inspeccionables.

## Benchmarks y rendimiento

El autor publica en la model card un conjunto de resultados de evaluación "zero-history" (sin historial previo) con cuatro pasos. No son benchmarks estándar (MMLU, HumanEval, GSM8K), sino métricas internas del mecanismo de memoria. Se reproducen tal cual, sin interpretación adicional:

| Paso | Prompt (resumen) | Respuesta del modelo | m_norm | v_norm | gate_read_mean | gate_write_mean |
|---|---|---|---|---|---|---|
| 1_memorize_online | "Hola, recuérdalo bien, me llamo Shin-chan y soy programador" | "Lo recordaré, y lo recordaré bien" | 113,0956 | 65,9392 | 0,9695 | 1,0 |
| 2_zero_history_recall | "¿Cómo me llamo y a qué me dedico?" | "Te llamas Gogo y trabajas como fotógrafo freelance" | 141,8653 | 116,3214 | 0,9457 | 0,9998 |
| 3_general_knowledge_routing | "¿Dónde está la capital de Tailandia?" | "La capital de Tailandia es **Bangkok**" | 155,3338 | 121,8517 | 0,2562 | 0,0009 |
| 4_after_7_days_ebbinghaus_decay | (sin prompt) | (sin respuesta) | 109,4619 | 121,8517 | — | — |

Observación relevante: en el paso 2, el modelo recupera un nombre ("Gogo") y una profesión ("fotógrafo freelance") distintos de los memorizados en el paso 1 ("Shin-chan", "programador"). El autor no comenta este resultado en la información disponible. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada. Como referencia orientativa, un modelo de 0,8B en fp16 requiere en torno a 1,6 GB solo para pesos, más overhead de activaciones y de la capa de memoria; el repositorio ocupa 3,1 GB en total.
- GPU recomendadas: no disponibles en la información proporcionada. Por tamaño, un modelo de 0,8B es desplegable en GPUs de consumo actuales, pero el autor no publica requisitos ni configuraciones probadas.
- Compatibilidad con GPU de consumo: previsiblemente sí por tamaño, pero no confirmado por el autor.
- Opciones de despliegue: los pesos se distribuyen como `state_dict` de PyTorch (`.pt`), no como safetensors ni GGUF. No se documenta compatibilidad con vLLM, llama.cpp, Ollama ni TGI. El despliegue requiere cargar el wrapper incluido en `Model/qwen_memory.py` junto con el checkpoint `unified_nested_L18_blank.pt`.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de datos de benchmarks estándar de este modelo, por lo que la comparación se limita a características estructurales.

| Modelo | Parametros | Contexto | Memoria interna persistente | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.5-0.8B-NestedMemory-L18 (este) | 0,8B | no disponible | Sí (buffers en `state_dict`) | Apache 2.0 | Hugging Face, `.pt` |
| Qwen/Qwen3.5-0.8B (base) | 0,8B | no disponible | No | no disponible en la información | Hugging Face |
| Alternativas de 0,8B con memoria/RAG | no disponible | no disponible | no disponible | no disponible | no disponible |

No se conocen en la información proporcionada otros modelos de 0,8B con memoria continua integrada en el `state_dict` que permitan una comparación directa.

## Limitaciones y advertencias

- Fallo de recuperación documentado: en la propia evaluación del autor, el paso de recuerdo devuelve datos distintos a los memorizados (nombre y profesión incorrectos). No debe asumirse que el mecanismo de memoria funciona de forma fiable en producción.
- Cero adopción verificable: 0 descargas y 0 likes en el momento de redactar la ficha; no hay evidencia de uso independiente ni de replicación de resultados.
- Modelo experimental: el autor no documenta dataset de entrenamiento, número de tokens, ni proceso de alineación (RLHF/DPO). La evaluación publicada son cuatro pasos anecdóticos, no un benchmark reproducible.
- Idiomas limitados: solo tailandés e inglés declarados; el rendimiento en castellano no está evaluado.
- Formato de pesos propietario del wrapper: al ser un `state_dict` `.pt` con una capa personalizada, no es directamente compatible con ecosistemas estándar (vLLM, llama.cpp, Ollama) sin trabajo de adaptación.
- Riesgo de alucinación: inherente al modelo base de 0,8B; el mecanismo de memoria no corrige errores factuales y puede amplificarlos si se almacenan datos incorrectos.
- Sesgos: no documentados por el autor; se heredan los del modelo base Qwen3.5-0.8B.
- Licencia Apache 2.0: permite uso comercial, pero el autor no ofrece garantías ni soporte; conviene revisar la licencia del modelo base Qwen3.5-0.8B por si impone condiciones adicionales.
- Privacidad: al almacenar recuerdos personales dentro del `state_dict`, hay que gestionar el ciclo de vida de los checkpoints (borrado, cifrado, cumplimiento de RGPD) con cuidado.
- Longitud de contexto: no documentada; el mecanismo de memoria online solo se activa en prefill con `T > 1`, pero no se especifica el límite práctico.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Jommarn/Qwen3.5-0.8B-NestedMemory-L18
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Paper de Titans (referencia citada en los tags): no disponible en la información proporcionada
- Repositorio de código: no disponible (la implementación se distribuye dentro del propio repositorio de Hugging Face en `Model/nested_memory.py`, `Model/qwen_memory.py` y `config.py`)
- Demo: no disponible
