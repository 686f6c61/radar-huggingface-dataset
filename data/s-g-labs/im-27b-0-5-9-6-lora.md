# s-g-labs/im-27b-0.5.9.6-lora

## Resumen

`im-27b-0.5.9.6-lora` es un adaptador LoRA de investigación publicado por el usuario s-g-labs (la model card referencia la ruta `UngaBungChadStyle/im-27b-0.5.9.6-lora`) sobre el modelo base `Qwen/Qwen3.8-27B`, en la revisión `1d4bf0f2ff6012fd82039f2fa52739d0dd7c60c0`. No es un modelo completo: el repositorio solo contiene los pesos del adaptador (0,6 GB), que deben cargarse junto al modelo base mediante PEFT o servirse con vLLM en modo multi-LoRA.

El objetivo declarado es el ajuste fino sobre "inner-voice text" (texto de voz interior) procedente de novelas y novelas visuales, con un formato de prompt muy específico basado en bloques de sistema (`【今天】`, `【事实列表】`), narración entre paréntesis y notas internas en `<think>`. El entrenamiento fue mínimo: 1 época, 162 registros, aproximadamente 186 000 tokens supervisados y longitud máxima de 16 384 tokens.

Su relevancia es limitada y acotada a experimentación: el propio autor lo etiqueta explícitamente como adaptador de investigación no apto para despliegue público, prohíbe su redistribución y su publicación combinada con el modelo base, y advierte de que los datos de entrenamiento no son redistribuibles. Con 15 descargas y 0 likes en el momento de la consulta, es un artefacto de nicho.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre transformer decoder-only (modelo base Qwen/Qwen3.8-27B) |
| Parametros totales | no disponible (el adaptador ocupa 0,6 GB; los parametros del base no se detallan en la informacion proporcionada) |
| Parametros activos | no disponible |
| Longitud de contexto | 16 384 tokens (longitud maxima de entrenamiento; el base puede soportar mas, no confirmado) |
| Tipos de cuantizacion | no disponible (el adaptador se distribuye en safetensors; el ejemplo de carga usa bfloat16) |
| Idiomas soportados | no disponible (el formato de prompt y los ejemplos estan en chino y japones) |
| Licencia | other (licencia personalizada; uso restringido, ver limitaciones) |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador aplica LoRA con rango 64, alpha 128 y dropout 0,05 sobre las proyecciones q/k/v/o y gate/up/down del modelo base Qwen/Qwen3.8-27B. El entrenamiento consistió en 1 época con learning rate 1e-4, longitud máxima de 16 384 tokens y semilla 0, sobre 162 registros que suman aproximadamente 186 000 tokens supervisados. No se documenta composición del dataset más allá de la mención a texto de voz interior de novelas y novelas visuales no redistribuibles, ni se indica si hubo RLHF, DPO u otras fases de alineamiento.

La innovación técnica no está en la arquitectura, sino en el formato de interacción: el sistema se divide en dos bloques (`【今天】` para la situación del día y `【事实列表】` para hechos sobre el personaje y su entorno), el turno del usuario mezcla narración entre paréntesis `（…）` con diálogos etiquetados `Nombre：línea`, y la respuesta del asistente incluye una nota breve en primera persona dentro de `<think>…</think>` seguida de burbujas de diálogo, con el token `<停>` para indicar silencio. Las notas `<think>` previas deben conservarse en el historial porque el modelo fue entrenado así.

## Capacidades

- Generación de diálogo en primera persona con voz interior explícita dentro de `<think>`, orientada a personajes de ficción.
- Roleplay narrativo con formato estructurado: situación del día, lista de hechos y turnos de conversación.
- Manejo de contexto multi-turno de hasta 16 384 tokens, conservando notas internas anteriores.
- Diferenciación entre narración (paréntesis) y diálogo de otros personajes (etiquetas `Nombre：`).
- Capacidad de "silencio" controlado mediante el token `<停>`.
- No se documenta soporte de tool calling, function calling, agentes, visión, audio ni matemáticas avanzadas.
- Capacidades multilingües: no disponibles formalmente; los ejemplos de la model card están en chino y japonés.

## Casos de uso

- Prototipado de personajes conversacionales en videojuegos narrativos: el adaptador reproduce el patrón de voz interior y diálogo por burbujas, adecuado para experimentar con NPCs que mantienen un monólogo interno separado de lo que dicen en voz alta.
- Investigación sobre formato de prompts estructurados: sirve para estudiar cómo un LoRA de rango 64 modifica el comportamiento de un modelo de 27B con solo 162 ejemplos y 186 000 tokens supervisados.
- Evaluación de técnicas PEFT en dominios creativos: útil como caso de estudio de ajuste fino con datos escasos y no redistribuibles.
- Pruebas de integración de LoRA en vLLM: el autor documenta el despliegue con `--enable-lora --max-lora-rank 64`, lo que permite validar pipelines multi-LoRA en entornos de investigación cerrados.
- Experimentos de consistencia de personaje a largo plazo: la ventana de 16 384 tokens y la conservación de notas `<think>` permiten medir la coherencia de la voz interior a lo largo de escenas extensas.
- Análisis de sesgos y estilo en corpus de ficción: al estar entrenado sobre novelas y novelas visuales, puede usarse para estudiar la transferencia de estilo narrativo desde un corpus pequeño.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible para el adaptador de forma aislada; depende enteramente del modelo base Qwen/Qwen3.8-27B, cuyos requisitos no se detallan en la información proporcionada.
- GPU recomendadas: no disponible. El ejemplo de carga usa `device_map="auto"` con `torch_dtype=torch.bfloat16`, lo que implica que el modelo base debe caber en la VRAM disponible o repartirse entre varias GPU.
- Viabilidad en GPU de consumo: no confirmada. Un modelo base de 27B en bfloat16 no cabe en GPU de consumo de 24 GB sin cuantización, y no se documentan opciones de cuantización para este adaptador.
- Opciones de despliegue: PEFT con Transformers (carga del adaptador sobre el base) y vLLM con `--enable-lora --max-lora-rank 64 --max-model-len 16384`. No se mencionan llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tipo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| im-27b-0.5.9.6-lora | Adaptador LoRA sobre base de 27B (parámetros del base no disponibles) | 16 384 tokens (entrenamiento) | LoRA/PEFT | other (restrictiva) | Hugging Face, 15 descargas |
| Modelo base Qwen/Qwen3.8-27B | no disponible en la información proporcionada | no disponible | Modelo completo | no disponible | Hugging Face |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de información suficiente para comparar con otros adaptadores LoRA de la misma categoría ni con modelos completos de tamaño similar.

## Limitaciones y advertencias

- El autor declara explícitamente que es un adaptador de investigación no apto para despliegue público.
- Prohibida la redistribución, la fusión con el modelo base y su publicación, y el servicio público del adaptador.
- Los datos de entrenamiento (texto de novelas y novelas visuales) no son redistribuibles, lo que impide auditar la composición del corpus.
- Entrenamiento muy pequeño (162 registros, 186 000 tokens, 1 época): alto riesgo de sobreajuste y de generalización deficiente fuera del formato exacto de prompt.
- El formato de prompt es rígido: desviarse de los bloques `【今天】`/`【事实列表】`, de la narración entre paréntesis o del esquema `Nombre：línea` puede degradar la salida.
- Riesgo de alucinación no evaluado; no hay benchmarks publicados.
- Idiomas soportados no declarados; los ejemplos sugieren chino y japonés, sin garantías para castellano.
- Licencia "other" con términos personalizados: es imprescindible revisar el texto completo antes de cualquier uso, incluido el comercial, que a priori queda excluido por la prohibición de despliegue público.
- La model card cita la ruta `UngaBungChadStyle/im-27b-0.5.9.6-lora` mientras que el ID del repositorio es `s-g-labs/im-27b-0.5.9.6-lora`; conviene verificar la ruta correcta al cargar el adaptador.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/s-g-labs/im-27b-0.5.9.6-lora
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Revisión del modelo base: `1d4bf0f2ff6012fd82039f2fa52739d0dd7c60c0`
- PEFT: https://github.com/huggingface/peft
- vLLM (soporte LoRA): https://docs.vllm.ai/
- No se han encontrado papers, blogs, repositorios adicionales ni demos en la información proporcionada.
