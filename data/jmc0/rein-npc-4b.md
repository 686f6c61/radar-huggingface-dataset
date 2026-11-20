# jmc0/Rein-NPC-4B

## Resumen

Rein-NPC-4B es un ajuste fino de Qwen3.5-4B desarrollado por jmc0 (jasielmacedo) orientado a la creación de personajes no jugadores (NPC) en videojuegos que no solo conversan, sino que ejecutan acciones tipadas dentro del motor del juego. El modelo combina el chat base de Qwen3.5-4B con lo que el autor denomina el "modelo de decisión" de Rein: 64 tokens nuevos cuyas filas de embedding son los únicos parámetros entrenados, dejando intactos todos los pesos originales. Esto permite que el modelo conserve exactamente las capacidades conversacionales de Qwen3.5-4B mientras añade una capa de decisión calibrada que responde, en una sola completion de un token, si el último mensaje del jugador requiere una herramienta y cuál.

La propuesta es relevante porque resuelve un problema clásico de los NPC conversacionales: la deriva de personaje y la falta de acciones coherentes. Según la model card, en diez personajes de prueba con 80 turnos de jugador cada uno, el NPC tomó la acción adecuada el 96% de las veces, frente al 42% del mismo modelo sin la capa de decisión; y mantuvo su nombre o rasgo bloqueado el 90% del tiempo bajo ataque, frente al 78% en solitario. Todo el flujo se ejecuta con dos peticiones HTTP al mismo modelo cargado una vez, sin segundo modelo ni servidor adicional.

El modelo tiene 5.295.564.288 parámetros reales según los safetensors, se distribuye bajo licencia Apache-2.0, con pesos en safetensors y versiones GGUF (bf16, Q8_0, Q4_K_M), y está pensado para ejecutarse en la GPU del propio jugador con aproximadamente 3,4 GB de VRAM en Q4_K_M.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen3.5-4B) con 64 tokens de soft-prompt entrenados para decisión tipada |
| Parametros totales | 5.295.564.288 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | bf16, Q8_0, Q4_K_M (GGUF publicados) |
| Idiomas soportados | en, pt, multilingual (el jugador puede usar un idioma distinto al de la ficha del personaje) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors, GGUF |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3.5-4B, un transformer decoder-only de la familia Qwen3.5, y aplica un ajuste fino paramétricamente mínimo: se añaden 64 tokens nuevos cuyo embedding es el único conjunto de parámetros entrenado. Todos los pesos originales de Qwen3.5-4B permanecen sin cambios, de modo que la conversación se genera exactamente como lo haría el modelo base. La innovación consiste en empaquetar un "modelo de decisión" dentro del mismo modelo de chat: dado un prompt en el formato de Rein que plantea una regla del personaje sobre la conversación acumulada, con las opciones etiquetadas por letras, las probabilidades de esas letras constituyen la respuesta calibrada.

El entrenamiento se realizó sobre el dataset jmc0/rein-decisions, con reglas tipadas de dos clases (choice y yes_no) que cubren acciones con herramientas, bloqueo de nombre, ataques a hechos del mundo y situaciones no expresadas explícitamente. El autor reporta evaluación sobre 28.433 preguntas de test acerca de reglas nunca vistas en entrenamiento, con una puntuación de 0,958 para Rein-NPC-4B, frente a 0,968 de Rein-r1-4B (el lector de dos modelos) y 0,846 de Kev-4B (modelo de decisión genérico del mismo tamaño). No se detalla en la información disponible el número de tokens de entrenamiento, la composición completa del dataset ni si se emplearon RLHF o DPO.

## Capacidades

- Generación de texto conversacional multi-turno con la calidad del chat de Qwen3.5-4B.
- Decisión tipada de un token: determina si el turno requiere una herramienta y cuál, con probabilidad calibrada (por ejemplo, `show_inventory` 0,99 frente a `none` 0,01).
- Soporte de tool calling / function calling mediante esquemas de herramientas en formato estándar (nombre, descripción, parámetros) y acciones de tipo `tool`.
- Coherencia de personaje: reglas de bloqueo de nombre y de rasgos que impiden que el jugador renombre o redefina al NPC.
- Defensa ante ataques a hechos del mundo y ante situaciones de riesgo, con acciones como `call_guards`.
- Multilingüismo: el jugador puede usar un idioma distinto al de la ficha del personaje.
- Integración con motores de juego mediante dos peticiones HTTP al mismo modelo (llama.cpp, LLMUnity, wllama, vLLM, Transformers, navegador).
- No requiere entrenamiento para crear un personaje nuevo: basta con una ficha corta en texto y reglas tipadas.

## Casos de uso

- Comerciantes y tenderos de RPG: una ficha como la de Mira Ashgrove define inventario, precios y reglas; el modelo decide cuándo mostrar inventario, vender, comprar o reparar equipo, y ejecuta la herramienta correspondiente en el motor.
- Atención al cliente dentro de un juego o simulación: el NPC gestiona conversaciones multi-turno con contexto de escena y estado del mundo, y deriva a acciones del sistema cuando la petición lo exige.
- Seguridad y respuesta a amenazas en entornos interactivos: ante un jugador que desenvaina un arma o amenaza al personaje, el modelo activa `call_guards` de forma autónoma, sin instrucción explícita del diseñador en ese turno.
- Coherencia narrativa en juegos de rol: las reglas de bloqueo de nombre y de rasgos mantienen la identidad del personaje cuando el jugador intenta confundirlo con otro NPC o reescribir su historia.
- Despliegue en la GPU del jugador: con Q4_K_M (~3,4 GB de VRAM) y un único GGUF, el NPC se ejecuta localmente en el cliente sin servidor adicional ni segundo modelo, lo que reduce costes de infraestructura y latencia de red.
- Prototipado rápido de NPC en motores como Unity (LLMUnity) o en el navegador (wllama): el mismo par de peticiones se mapea a la API C de llama.cpp, vLLM o Transformers, permitiendo iterar sobre fichas de personaje sin reentrenar.
- Simulaciones y experiencias educativas multilingües: el jugador puede escribir en un idioma distinto al de la ficha, lo que facilita localizar el contenido sin duplicar personajes.

## Benchmarks y rendimiento

| Metrica | Rein-NPC-4B | Rein-r1-4B | Kev-4B | Qwen3.5-4B sin capa |
|---|---|---|---|---|
| Precisión en decisiones (28.433 preguntas de test con reglas no vistas) | 0,958 | 0,968 | 0,846 | No disponible |
| Acción correcta en 10 personajes × 80 turnos | 96% | No disponible | No disponible | 42% |
| Mantenimiento de nombre/rasgo bloqueado bajo ataque | 90% | No disponible | No disponible | 78% |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada: aproximadamente 3,4 GB en cuantización Q4_K_M; bf16 y Q8_0 requieren más memoria (el repo completo pesa 10,6 GB).
- GPU recomendadas: cualquier GPU consumer con al menos 4 GB de VRAM para Q4_K_M; para bf16 se recomienda una GPU con 12 GB o más (RTX 3060 12 GB, RTX 4070, RTX 4090) o GPUs de datacenter (A100, H100) para despliegues concurrentes.
- Cabe en GPU consumer: sí, en Q4_K_M con GPUs de 4 GB o más; el autor lo presenta explícitamente como ejecutable en la GPU del propio jugador.
- Opciones de despliegue: llama.cpp / llama-server (ejemplo con `curl` en la model card), LLMUnity, API C de llama.cpp, wllama (navegador), vLLM y Transformers.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Decision tipada | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Rein-NPC-4B | 5.295.564.288 | No disponible | Sí, integrada en el mismo modelo (0,958) | Apache-2.0 | Hugging Face (safetensors y GGUF) |
| Rein-r1-4B | No disponible | No disponible | Sí, lector de dos modelos (0,968) | No disponible | No disponible |
| Kev-4B | ~4B (mismo tamaño) | No disponible | Sí, modelo de decisión genérico (0,846) | No disponible | No disponible |
| Qwen3.5-4B | ~4B | No disponible | No (42% de acción correcta sin capa) | No disponible | Hugging Face |

## Limitaciones y advertencias

- El propio autor advierte que el modelo "lee mejor las peticiones que las situaciones no expresadas": su rendimiento es superior cuando el jugador formula una petición explícita que cuando la situación requiere inferencia implícita.
- No es un filtro de seguridad: no debe usarse como mecanismo de moderación ni como barrera de contenido.
- La evaluación se basa en reglas tipadas y personajes de prueba del autor; el rendimiento en personajes o dominios muy distintos puede degradarse.
- Riesgo de alucinación inherente al modelo base Qwen3.5-4B en la generación conversacional; la capa de decisión no lo elimina.
- No se dispone de información sobre sesgos conocidos, longitud de contexto ni composición detallada del dataset de entrenamiento.
- La licencia Apache-2.0 permite uso comercial, pero se recomienda verificar las condiciones del modelo base Qwen3.5-4B y de los datos de entrenamiento antes de un despliegue en producción.
- El flujo requiere implementar dos peticiones por turno (decisión y chat) y mapear las acciones a la lógica del motor; no es un reemplazo directo de un chat convencional.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/jmc0/Rein-NPC-4B
- GGUF: https://huggingface.co/jmc0/Rein-NPC-4B-GGUF
- Playground en el navegador: https://huggingface.co/spaces/jmc0/rein-npc-playground
- Código y evaluación en GitHub: https://github.com/jasielmacedo/rein
- Dataset: https://huggingface.co/datasets/jmc0/rein-decisions
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
