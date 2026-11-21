# iBossonline/gemma-4-31B-it-The-custom-thinking

## Resumen

Gemma 4 31B IT The Custom Thinking es un ajuste fino del modelo multimodal google/gemma-4-31B-it publicado por el usuario iBossonline en Hugging Face. Se presenta como una variante "abliterated" y "uncensored" (sin los mecanismos de rechazo del modelo original), afinada mediante Unsloth sobre un conjunto de datos privado denominado "The DECKARD", orientado a escritura creativa, narrativa de ficcion y roleplaying. El modelo conserva la arquitectura y el tamano del Gemma 4 31B original: 31.273.086.512 parametros en formato bfloat16.

El modelo es relevante para quienes necesitan un asistente de generacion de texto con capacidad de vision (pipeline image-text-to-text), contexto de 128k tokens y una plantilla Jinja que fuerza el modo "thinking" por defecto, con la posibilidad de cambiar a modo instruct. La model card incluye benchmarks internos que comparan el ajuste con el modelo base en siete tareas (ARC, ARC-E, BoolQ, HellaSwag, OpenBookQA, PIQA y Winogrande), con resultados mixtos segun el modo de inferencia.

Al estar construido sobre Gemma 4 31B IT, hereda las capacidades multimodales y de razonamiento del modelo original de Google, pero el autor no documenta la composicion exacta del dataset de ajuste ni los detalles del proceso de abliteration, lo que limita la reproducibilidad y la evaluacion independiente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (image-text-to-text), basada en Gemma 4 31B IT |
| Parametros totales | 31.273.086.512 |
| Parametros activos | no disponible (no es MoE segun los datos disponibles) |
| Longitud de contexto | 128k tokens (segun la model card, "as per Gemma 4 ORG model specs") |
| Tipos de cuantizacion | bfloat16 en el repo; no se documentan otras cuantizaciones oficiales |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de google/gemma-4-31B-it, un transformer multimodal de 31B parametros que procesa entradas de imagen y texto y genera texto. Sobre esa base, el autor aplica un proceso de "abliteration" (eliminacion de direcciones de rechazo en el espacio de activaciones) seguido de un ajuste fino supervisado con Unsloth, descrito como de nivel "moderado". El conjunto de datos de ajuste, "The DECKARD", es privado y fue "manualmente ensamblado, limpiado y revisado" por el autor; forma parte del proyecto "Almost Human" y se ha usado en otros modelos del mismo autor.

La innovacion principal respecto al base es la plantilla Jinja modificada: el repo incluye una plantilla que fuerza el modo thinking (bloques delimitados por `<|channel>thought ... <channel|>`) y una alternativa para modo instruct puro (`chat_template-instruct.jinja`). No se documentan detalles sobre el numero de tokens de entrenamiento, la composicion del dataset, ni si hubo RLHF o DPO adicionales. Tampoco se especifican innovaciones arquitectonicas propias: el modelo hereda la arquitectura del Gemma 4 original.

## Capacidades

- Generacion de texto y razonamiento en modo thinking e instruct, con la plantilla Jinja que activa el modo thinking por defecto.
- Capacidades multimodales de entrada: procesa imagenes junto con texto (pipeline image-text-to-text).
- Escritura creativa y narrativa: generacion de ficcion, tramas, subtramas, continuacion de escenas, storytelling y roleplaying, segun los tags del autor.
- Generacion de codigo: el tag "coder" sugiere soporte para tareas de programacion, aunque no se detalla el alcance.
- Soporte multilingue: no disponible en la informacion proporcionada.
- Tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible de forma explicita; la model card menciona un ejemplo de prompt complejo multi-paso, pero sin documentar soporte formal de agentes.
- Modo thinking con bloques delimitados, que requiere ajustes en la aplicacion de inferencia para renderizarse correctamente.

## Casos de uso

- Escritura de ficcion y narrativa larga: el modelo puede generar tramas, subtramas y continuaciones de escenas con un contexto de 128k tokens, adecuado para mantener coherencia en novelas o relatos extensos.
- Roleplaying y personajes conversacionales: el ajuste sobre "The DECKARD" y los tags de roleplaying lo orientan a mantener personajes consistentes en conversaciones multi-turno.
- Generacion de guiones y dialogos: util para crear dialogos con voces diferenciadas, como muestra el ejemplo de la model card con Data, Philip K. Dick y Mark Twain.
- Asistencia creativa con imagenes: al ser image-text-to-text, puede describir o continuar narrativas a partir de imagenes de referencia.
- Prototipado de aplicaciones de escritura: integrable en editores o herramientas de escritura creativa que necesiten un modelo sin filtros de contenido.
- Experimentacion en investigacion sobre alineacion y censura: util para estudiar el efecto de la abliteration en el comportamiento del modelo frente al base.
- Generacion de codigo en entornos creativos o de prototipado: el tag "coder" sugiere uso para tareas de programacion, aunque sin benchmarks especificos publicados.

## Benchmarks y rendimiento

La model card incluye benchmarks internos del autor (no verificados de forma independiente) comparando el ajuste con el modelo base en modo instruct y thinking:

| Tarea | Thinking mode (qx86-hi) | Instruct mode (qx86-hi) | Base gemma-4-31B-it (instruct) |
|---|---|---|---|
| ARC | 0.431 | 0.573 | 0.496 |
| ARC-E | 0.505 | 0.719 | 0.653 |
| BoolQ | 0.426 | 0.900 | 0.901 |
| HellaSwag | 0.670 | 0.715 | 0.624 |
| OpenBookQA | 0.376 | 0.420 | 0.380 |
| PIQA | 0.766 | 0.781 | 0.732 |
| Winogrande | 0.710 | 0.695 | 0.653 |

El autor afirma que el modelo "supera al base en 6 de 7 benchmarks", lo que se cumple en modo instruct salvo en BoolQ (0.900 frente a 0.901). No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) para este ajuste concreto en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bfloat16: aproximadamente 62.6 GB solo para los pesos, mas overhead de activaciones y cache KV; se recomienda al menos 80 GB de VRAM para contexto largo.
- GPU recomendadas: A100 80GB, H100 80GB o multiples GPU para contexto completo de 128k.
- En GPU de consumo: no cabe en bfloat16 en una RTX 4090 (24 GB); requeriria cuantizacion (no documentada oficialmente) o descarga por capas en CPU.
- Opciones de despliegue: no se documentan en la model card; al ser safetensors, es compatible con frameworks estandar como vLLM o TGI, aunque el soporte de Gemma 4 debe verificarse en cada framework.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| iBossonline/gemma-4-31B-it-The-custom-thinking | 31B | 128k | apache-2.0 | Ajuste uncensored sobre Gemma 4 31B IT |
| google/gemma-4-31B-it | 31B | 128k | no disponible en la informacion | Modelo base oficial de Google |
| DavidAU/Qwen3.5-40B-Claude-4.6-Opus-Deckard-Heretic-Uncensored-Thinking | 40B | no disponible | no disponible | Otro modelo del mismo proyecto "The DECKARD" |

No se dispone de datos de rendimiento comparativo independiente entre estos modelos en la informacion proporcionada.

## Limitaciones y advertencias

- Modelo "uncensored": la abliteration elimina los mecanismos de rechazo, por lo que puede generar contenido inapropiado, ofensivo o peligroso sin filtros; no es adecuado para aplicaciones de produccion sin moderacion adicional.
- Riesgo de alucinacion: como todo modelo de lenguaje, puede inventar hechos; el ajuste creativo puede incrementar la tendencia a la fabulacion.
- Idiomas soportados no documentados: no se especifica que idiomas mantiene el ajuste ni si el castellano esta bien cubierto.
- Dataset de ajuste privado: la composicion y calidad de "The DECKARD" no son verificables, lo que impide evaluar sesgos introducidos.
- Benchmarks internos no reproducibles: los resultados publicados son del autor y no han sido validados de forma independiente.
- Licencia apache-2.0 declarada, pero el modelo base Gemma tiene sus propios terminos de uso que deben verificarse antes de uso comercial.
- El modo thinking requiere ajustes en la aplicacion para renderizar correctamente los bloques `<|channel>thought ... <channel|>`.
- Repo de 62.6 GB: requiere almacenamiento y ancho de banda considerables para su descarga.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/iBossonline/gemma-4-31B-it-The-custom-thinking
- Modelo base: https://huggingface.co/google/gemma-4-31B-it
- Otro modelo del proyecto "The DECKARD": https://huggingface.co/DavidAU/Qwen3.5-40B-Claude-4.6-Opus-Deckard-Heretic-Uncensored-Thinking
- Perfil del autor del dataset: https://huggingface.co/DavidAU
