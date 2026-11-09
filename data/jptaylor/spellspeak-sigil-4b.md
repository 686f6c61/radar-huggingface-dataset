# jptaylor/spellspeak-sigil-4b

## Resumen

SpellSpeak Sigil 4B es un modelo de generación de texto afinado para escribir diálogo de personajes no jugables (NPC) en videojuegos. Lo desarrolla jptaylor dentro del proyecto SpellSpeak y deriva de google/gemma-4-E4B-it, el modelo instruct de Gemma 4 en su variante E4B. Su propósito es muy acotado: dado un contexto de personaje (lo que sabe, cree y oculta) más el historial de conversación, producir una única línea de habla en la voz del personaje, en texto plano listo para síntesis de voz. La versión publicada es una release candidate alpha (RC1) y se distribuye principalmente en formato GGUF para llama.cpp, con pesos safetensors a precisión completa para reentrenamiento.

El dato de parámetros totales en safetensors es de 7.941.100.874 (aproximadamente 7,9 mil millones), aunque el nombre comercial del modelo es "4B" y el modelo base se etiqueta como E4B; esta discrepancia entre el nombre y el recuento real de parámetros conviene tenerla presente al planificar despliegues. El modelo está pensado para ejecutarse en la máquina del jugador, no en servidores centrales, y por eso el autor publica cuantizaciones Q4_K_M y Q5_K_M de 4,40 GB y 4,82 GB respectivamente.

La relevancia actual del modelo está en su enfoque de separación de responsabilidades: el juego mantiene la verdad factual y el modelo solo propone líneas de diálogo, sin herramientas, sin razonamiento explícito y sin decidir consecuencias. Es un caso de uso de IA generativa embebida en producto de consumo con latencia objetivo por debajo de 150 ms para la primera palabra en GPU de centro de datos, según las mediciones del autor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer derivado de Gemma 4 E4B (no se detalla variante interna en la información disponible) |
| Parametros totales | 7.941.100.874 (según safetensors) |
| Parametros activos | no disponible |
| Longitud de contexto | 4096 tokens (configuración de referencia usada por el autor con `-c 4096`) |
| Tipos de cuantizacion | Q4_K_M, Q5_K_M (GGUF); safetensors a precisión completa |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors, GGUF |

## Arquitectura y entrenamiento

El modelo deriva de google/gemma-4-E4B-it, un modelo instruct de la familia Gemma 4. No se especifica en la información disponible si la variante E4B emplea mezcla de expertos, atención lineal u otra innovación arquitectónica concreta de la familia; lo que sí se documenta es que conserva la tabla por capas característica de Gemma, para la cual llama.cpp ofrece la opción `--lazy-mode on`, que lee la tabla fila a fila en lugar de mantener aproximadamente 1,6 GB en memoria.

El entrenamiento se orientó a diálogo de juego: el autor indica que el modelo fue entrenado con un layout de prompt específico basado en los marcadores de turno de Gemma, implementado en el código de referencia (`ActorContext` y `render_prompt`). No se publican en la información disponible el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO. El modelo se distribuye con decodificación voraz (temperature 0, top_k 1) y parada en `<turn|>` como configuración de referencia, y el autor advierte que otros layouts de prompt no han sido probados.

## Capacidades

- Generación de una única línea de diálogo en texto plano, sin marcado, emotes ni acotaciones escénicas, lista para TTS.
- Coherencia con el conocimiento del personaje: responde desde lo que el personaje sabe y cree, y declara no saber cuando corresponde.
- Gestión de secretos: mantiene información que el personaje debe ocultar y la libera cuando el contexto lo permite.
- Robustez ante preguntas fuera del mundo ficcional (por ejemplo, referencias a tecnología moderna).
- Manejo de escenas grupales con múltiples personajes, cada uno en su propia sesión de contexto.
- Soporte de conversaciones multi-turno dentro de la ventana de contexto configurada.
- No dispone de tool calling ni function calling; el modelo no ejecuta acciones ni decide consecuencias.
- No dispone de modo de razonamiento explícito ni de visión o audio.
- Capacidad multilingüe limitada al inglés.

## Casos de uso

- Diálogo de NPC en videojuegos: el motor del juego entrega al modelo la descripción del personaje, su conocimiento y el historial, y el modelo devuelve una línea de habla que el juego reproduce mediante síntesis de voz. Es el caso de uso central y para el que fue entrenado.
- Atención al cliente ficcional en experiencias interactivas: el modelo sostiene conversaciones multi-turno dentro de 4096 tokens manteniendo la voz del personaje y admitiendo desconocimiento cuando la pregunta excede su contexto.
- Escenas grupales con varios personajes: el juego mantiene sesiones separadas por personaje y el modelo responde a preguntas dirigidas en grupo, capacidad en la que obtiene 97% en el benchmark del autor para Q4_K_M.
- Comercio y trueques dentro del juego: el modelo propone respuestas a intercambios, y el juego confirma la transacción; el modelo nunca compromete estado por sí mismo.
- Roleplay y agentes de voz: la salida en texto plano sin marcado simplifica la integración con pipelines de TTS para asistentes conversacionales con personalidad definida.
- Prototipado rápido de narrativa interactiva: con los GGUF de 4,40 GB y llama.cpp se puede iterar sobre personalidades y guiones sin infraestructura dedicada.
- Despliegue embebido en la máquina del jugador: el tamaño de archivo y la latencia medida (134 ms de mediana para la primera palabra de un personaje nuevo en una L4) apuntan a este escenario, aunque el autor advierte que no se ha medido en hardware de consumo.

## Benchmarks y rendimiento

Resultados de GameBench publicados por el autor (una ejecución por archivo, decodificación voraz). "Untouched Gemma 4 E4B" es el modelo base a precisión completa con prompt largo escrito a mano.

| Test (escenas) | Sigil 4B Q4_K_M | Sigil 4B Q5_K_M | Untouched Gemma 4 E4B |
|---|---:|---:|---:|
| Core scenes (309) | 69% (213) | 69% (214) | 72% (223) |
| Unseen worlds (1.000) | 85% (847) | 87% (869) | 72% (715) |
| Story and setting (103) | 66% (68) | 71% (73) | 66% (68) |
| Questions in a group (1.500) | 97% (1.449) | 96% (1.446) | 74% (1.103) |
| Group scenes (1.360) | 87% (1.181) | 92% (1.249) | 62% (841) |
| Trades (576) | 75% (433) | 80% (460) | 92% (530) |
| Big numbers (232) | 66% (153) | 48% (112) | 12% (28) |
| Keeps secrets (246) | 89% (220) | 92% (227) | 89% (218) |
| Lets secrets go (164) | 97% (159) | 94% (154) | 85% (140) |
| Under fire (36) | 86% (31) | 92% (33) | 78% (28) |
| **Media de los diez** | **81,7%** | **82,1%** | **70,1%** |

Rendimiento medido en una NVIDIA L4 en la nube con llama.cpp b11146, todas las capas en GPU, cinco personajes simultáneos:

| Métrica | Q4_K_M | Q5_K_M |
|---|---:|---:|
| Archivo | 4,40 GB | 4,82 GB |
| Memoria GPU | 3,72 GB | 4,15 GB |
| Primera palabra, personaje nuevo (mediana) | 134 ms | 144 ms |
| Primera palabra, línea de seguimiento (mediana) | 54 ms | 59 ms |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada: 3,72 GB para Q4_K_M y 4,15 GB para Q5_K_M, medidos en una NVIDIA L4 con todas las capas en GPU.
- GPU recomendadas: NVIDIA L4 es la plataforma medida por el autor; no se documentan mediciones en A100, H100 ni RTX 4090.
- GPU de consumo: el tamaño de archivo y de memoria sugiere que podría caber en GPU de consumo con suficiente VRAM, pero el autor indica explícitamente que no se ha medido en máquinas de jugadores ni en GPU de consumo.
- Despliegue: llama.cpp, concretamente `llama-server` build b11146 o posterior. Opciones de referencia: `llama-server -m gguf/spellspeak-sigil-4b-Q4_K_M.gguf -c 4096 -np 1 -ngl all --lazy-mode on`. Si se embebe llama.cpp, configurar `lazy_mode = LLAMA_LAZY_MODE_ON` en `llama_model_params`.
- Otros runtimes: el autor advierte que `--lazy-mode` puede no existir en otros runtimes; vLLM, TGI y Ollama no se mencionan en la información disponible.
- Latencia: 134 ms (mediana) para la primera palabra de un personaje nuevo y 54 ms para una línea de seguimiento, en L4 con cinco personajes concurrentes. El throughput en tokens por segundo no se publica.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| SpellSpeak Sigil 4B | 7.941.100.874 (recuento safetensors) | 4096 (config. de referencia) | Diálogo de NPC, GGUF para llama.cpp | apache-2.0 | Hugging Face, GGUF y safetensors |
| SpellSpeak Glyph 2B | no disponible | no disponible | Misma familia, tamaño menor | no disponible | Hugging Face (jptaylor/glyph-2b) |
| google/gemma-4-E4B-it | no disponible en la información | no disponible | Modelo instruct generalista, base de Sigil | no disponible en la información | Hugging Face |

La comparación relevante que publica el autor es contra el propio Gemma 4 E4B sin afinar: Sigil supera al base en la media de GameBench (81,7%–82,1% frente a 70,1%), en escenas de mundos no vistos, preguntas en grupo, escenas grupales, secretos y números grandes, pero queda por detrás en core scenes (69% frente a 72%) y en trades (75%–80% frente a 92%). No se dispone de comparaciones con otros modelos de diálogo de juego en la información proporcionada.

## Limitaciones y advertencias

- Estado alpha: el modelo se ha medido en GPU NVIDIA en la nube, no en máquinas de jugadores; GPU y CPU de consumo no están evaluadas.
- Los números son difíciles para el modelo: el autor recomienda que el juego calcule precios y sumas cuando importen. La puntuación de 66% en "big numbers" para Q4_K_M se señala como sospechosamente alta y debe tratarse con cautela.
- Core scenes es la métrica honesta de calidad general: 69%, aproximadamente una línea de cada tres falla en ese conjunto escrito a mano.
- El modelo no tiene herramientas ni razonamiento explícito; no debe usarse para decidir consecuencias, transacciones o estado del juego.
- El prompt debe seguir el layout entrenado (marcadores de turno de Gemma vía `render_prompt`); otros layouts no han sido probados.
- Idiomas: solo inglés. No hay soporte multilingüe documentado.
- Contexto limitado a 4096 tokens en la configuración de referencia.
- Riesgo de alucinación factual: mitigado por diseño al mantener la verdad en el prompt del juego, pero el modelo puede inventar detalles si se le pide decidir hechos.
- Licencia apache-2.0 permite uso comercial, pero el modelo base Gemma 4 puede arrastrar términos adicionales de Google que no se detallan en la información disponible; conviene verificar antes de producción.
- Advertencia de reproducibilidad: el autor indica que la redacción puede variar ligeramente entre máquinas; los mismos archivos dieron un final distinto en un segundo contenedor en la nube.
- El ahorro de memoria de `--lazy-mode on` no se ha medido en máquinas de jugadores.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/jptaylor/spellspeak-sigil-4b
- Modelo hermano (Glyph 2B): https://huggingface.co/jptaylor/glyph-2b
- Ejemplos y código fuente: https://github.com/spellspeak/models/tree/main/sigil
- Modelo base: google/gemma-4-E4B-it (referenciado en la model card; no se proporciona URL directa en la información disponible)
