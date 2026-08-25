# Felladrin/SmolLM2-135M-Heretic-RP

## Resumen

SmolLM2-135M-Heretic-RP es un modelo de lenguaje especializado en roleplay y continuación de historias, desarrollado por Felladrin (Victor Nogueira) como un fine-tune supervisado del checkpoint SmolLM2-135M-Instruct-heretic, que a su vez deriva de SmolLM2-135M-Instruct de HuggingFaceTB. El modelo está pensado para ejecutarse en hardware muy limitado, donde modelos de 7B o más no son viables, y se distribuye exclusivamente en formato GGUF, lo que permite su uso directo con llama.cpp y sus derivados.

La innovación principal del fine-tune es que entrena simultáneamente dos formatos de interacción: ChatML para el endpoint `/v1/chat/completions` y transcripciones de persona para el endpoint `/completions`, supervisando únicamente la respuesta del personaje y enmascarando los turnos del humano. Esto corrige un defecto común en fine-tunes de roleplay: que el modelo aprenda a escribir también el turno del usuario. Con 134,5 millones de parámetros, es un modelo muy pequeño que prioriza la fluidez conversacional en inglés sobre la precisión factual o el razonamiento complejo.

La relevancia actual radica en que demuestra un flujo de trabajo completo de fine-tuning con pesos en GGUF de principio a fin, usando la herramienta gguf-trainer, y ofrece una alternativa práctica para aplicaciones de roleplay en entornos con recursos mínimos, como una Raspberry Pi o una CPU sin GPU.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder (SmolLM2) |
| Parametros totales | 134.515.008 |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | no disponible (el ejemplo de uso recomienda 4096) |
| Tipos de cuantizacion | GGUF (Q8_0 mencionado; otras cuantizaciones no especificadas) |
| Idiomas soportados | en (ingles) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (unico formato distribuido) |

## Arquitectura y entrenamiento

El modelo parte de SmolLM2-135M-Instruct-heretic, un checkpoint intermedio de la familia SmolLM2, que es un transformer decoder con 135 millones de parametros entrenado por HuggingFaceTB sobre 2 billones de tokens. Sobre ese checkpoint, Felladrin aplico un fine-tune supervisado (SFT) utilizando la herramienta gguf-trainer, que trabaja directamente con pesos en formato GGUF. El entrenamiento se realizo sobre una mezcla de datasets orientados a roleplay y dialogo: PygmalionAI/PIPPA, Gryphe/Opus-WritingPrompts, kalomaze/Opus_Instruct_3k, jondurbin/gutenberg-dpo-v0.1 y HuggingFaceTB/smol-smoltalk.

La particularidad del entrenamiento es que se supervisan dos formatos de prompt de forma simultanea: por un lado, el formato ChatML (con etiquetas `<|im_start|>` y `<|im_end|>`) para el endpoint de chat, y por otro, transcripciones de persona con cabeceras `[Character: ...]` y turnos etiquetados para el endpoint de completado. En ambos casos, solo se calcula la perdida sobre la respuesta del personaje, enmascarando los turnos del humano. Esto evita que el modelo aprenda a generar el turno del usuario, un fallo tipico en fine-tunes de roleplay entrenados sobre transcripciones crudas. No se menciona el uso de RLHF ni DPO; es exclusivamente un ajuste supervisado.

## Capacidades

- Generacion de texto conversacional en ingles, especializado en roleplay y continuacion de historias.
- Mantenimiento de una persona definida en el prompt del sistema o en la cabecera de personaje, aunque con limitaciones en sesiones largas.
- Soporte de dos endpoints de llama.cpp: `/v1/chat/completions` (formato ChatML) y `/completions` (transcripciones de persona).
- Capacidad de terminar su propio turno con EOS en el endpoint de completado, reduciendo la necesidad de stop strings.
- No soporta tool calling, vision, audio ni razonamiento multi-paso.
- Multilingue limitado: solo ingles, con vocabulario y registro orientados a roleplay.

## Casos de uso

- Roleplay interactivo en hardware de bajos recursos: el modelo puede ejecutarse en una CPU sin GPU o en una Raspberry Pi, ofreciendo respuestas de personaje fluidas para juegos de rol por texto. Su tamano permite latencias bajas incluso en equipos modestos.
- Continuacion de historias creativas: dado un fragmento narrativo, el modelo puede generar continuaciones coherentes en estilo literario, aprovechando los datasets de escritura creativa con los que fue entrenado.
- Asistentes de escritura para ficcion: puede usarse como generador de dialogos entre personajes, ayudando a autores a explorar interacciones o superar bloqueos creativos.
- Prototipado rapido de chatbots de personaje: al ser ligero y facil de desplegar con llama.cpp, permite iterar rapidamente sobre personalidades y estilos de conversacion antes de escalar a modelos mayores.
- Educacion y experimentacion con fine-tuning en GGUF: sirve como ejemplo practico de como ajustar un modelo pequeno con gguf-trainer, util para desarrolladores que quieren aprender el flujo de trabajo.
- Integracion en aplicaciones de chat locales sin conexion: al ser un modelo pequeno y con licencia Apache-2.0, puede integrarse en aplicaciones de escritorio o moviles que requieran privacidad y funcionamiento offline.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card incluye una evaluacion cualitativa propia del autor sobre la correccion del defecto de "escribir el turno del humano", pero no hay metricas estandar como MMLU, HumanEval o GSM8K. Se recomienda no usar este modelo para tareas que requieran precision factual o razonamiento.

## Requisitos de hardware

- VRAM estimada: con cuantizacion Q8_0, los pesos ocupan aproximadamente 135 MB, por lo que cabe en cualquier GPU con al menos 1 GB de VRAM, incluyendo iGPUs.
- GPU recomendadas: cualquier GPU moderna, incluso integradas (Intel UHD, AMD Vega) o discretas de gama baja (GTX 1650, RTX 2050). Tambien funciona en CPU pura con llama.cpp.
- En consumer GPU: si, cabe en practicamente cualquier equipo, incluyendo portatiles sin GPU dedicada.
- Opciones de despliegue: llama.cpp (llama-server), Ollama, KoboldCpp, SillyTavern (via API), AI Horde, o cualquier servidor compatible con OpenAI API.
- Latencia y throughput: al ser un modelo de 135M, la generacion es muy rapida incluso en CPU; se pueden alcanzar decenas de tokens por segundo en hardware moderno, aunque no se proporcionan cifras exactas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Enfoque |
|---|---|---|---|---|
| SmolLM2-135M-Heretic-RP (este) | 135M | no disponible | Apache-2.0 | Roleplay, GGUF |
| SmolLM2-135M-Instruct (base) | 135M | 8192 (segun documentacion publica) | Apache-2.0 | Instrucciones generales |
| TinyLlama-1.1B-Chat | 1.1B | 2048 | Apache-2.0 | Chat general, mayor tamano |

No se dispone de datos de rendimiento comparativo en benchmarks. La diferencia principal con el modelo base es el ajuste especifico para roleplay y la correccion del defecto de turnos duplicados. TinyLlama es mas grande y generalista, pero requiere mas recursos.

## Limitaciones y advertencias

- Modelo muy pequeno (135M): su capacidad de razonamiento y memoria factual es limitada; los hechos pueden ser inventados o inconsistentes.
- Tendencia a la repeticion: sin control de repeticion (repeat-penalty), el modelo entra en bucles de frases. El autor recomienda usar `--repeat-penalty 1.1 --repeat-last-n 128` de forma obligatoria.
- Mantenimiento debil de la persona: en sesiones largas, el personaje puede perder coherencia o "salirse" de su rol.
- Solo ingles: no soporta otros idiomas de forma fiable.
- No apto para tareas donde un error tenga consecuencias: no debe usarse para informacion factual, codigo, matematicas o cualquier aplicacion critica.
- Distribucion solo en GGUF: no se ofrecen pesos en safetensors, lo que limita su uso con frameworks que no soporten este formato (aunque la mayoria de motores de inferencia lo aceptan).
- La licencia Apache-2.0 permite uso comercial, pero el modelo hereda los datos de entrenamiento de terceros; se debe verificar la licencia de los datasets originales si se usa en produccion.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Felladrin/SmolLM2-135M-Heretic-RP
- Modelo base (heretic): https://huggingface.co/saidutta69/SmolLM2-135M-Instruct-heretic
- Modelo base original: https://huggingface.co/HuggingFaceTB/SmolLM2-135M
- Herramienta gguf-trainer: https://github.com/felladrin/gguf-trainer
- Perfil del autor en HuggingFace: https://huggingface.co/Felladrin
- Perfil del autor en GitHub: https://github.com/felladrin
- Datasets usados: PygmalionAI/PIPPA, Gryphe/Opus-WritingPrompts, kalomaze/Opus_Instruct_3k, jondurbin/gutenberg-dpo-v0.1, HuggingFaceTB/smol-smoltalk
