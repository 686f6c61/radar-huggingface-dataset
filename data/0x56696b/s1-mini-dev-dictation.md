# 0x56696B/S1-mini-dev-dictation

## Resumen

S1-mini-dev-dictation es un fine-tune de LoRA sobre S1-mini de Superwhisper, que a su vez deriva de Qwen3-0.6B. Lo desarrolla el usuario 0x56696B y su proposito es el post-procesado de transcripciones ASR en el ambito de la ingenieria de software, DevOps y herramientas de IA: convierte dictado crudo (con tartamudeos, muletillas, reinicios y terminos deletreados) en texto limpio, con puntuacion, mayusculas correctas y nomenclatura tecnica preservada.

El modelo no transcribe audio: recibe texto ASR y devuelve texto normalizado. Con 596 millones de parametros y arquitectura transformer decoder-only heredada de Qwen3, es un modelo pequeno pensado para ejecutarse en local o en el borde, como componente de un pipeline de dictado. Mantiene el formato de entrada, el estilo de salida y la linea de control de S1-mini, por lo que es un reemplazo directo (drop-in) del modelo base.

Es relevante porque ataca un problema concreto y mal cubierto: los asistentes de dictado genericos no entienden jerga como `~/.omp/agent/WATCHDOG.yml`, `--verbose` o `Qwen3.5-4B`, y ademas arrastran muletillas y repeticiones. Este fine-tune se entrena especificamente sobre ese dominio, con un conjunto de datos pequeno pero muy curado y verificado fila a fila.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (derivada de Qwen3-0.6B), 28 bloques |
| Parametros totales | 596.049.920 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | bf16 (pesos fusionados), GGUF Q8_0 y Q4_K_M; el adaptador LoRA se entrena en rank 16 |
| Idiomas soportados | en (ingles) |
| Licencia | s1-mini-license (Apache 2.0 con clausula adicional de atribucion del nombre) |
| Formato de pesos | safetensors, GGUF |

## Arquitectura y entrenamiento

El modelo conserva la arquitectura, el vocabulario, el tokenizer, la plantilla de chat y el system prompt originales de S1-mini (Qwen3-0.6B). Sobre esa base se aplica un fine-tune LoRA de rango 16, escala 4.0 y dropout 0.05 en todas las capas lineales de los 28 bloques, entrenado con mlx-lm a batch size 8 en dos rondas. La ronda 1 hizo 4 epocas a learning rate 1e-4; la ronda 2 continuo desde el adaptador de la ronda 1 a 5e-5 con gradient checkpointing, configurada para 2 epocas (553 iteraciones), aunque el adaptador publicado es el checkpoint de la iteracion 300 (aproximadamente 1,1 epocas, con perdida de validacion minima de 0.269 y final de 0.305). El adaptador se fusiona en los pesos bf16.

Los datos de entrenamiento son pares de transcripcion ASR cruda y texto limpio. La ronda 1 uso 1.248 filas (1.123 de entrenamiento, 125 de validacion): 249 pares de casos de fallo redactados con un asistente de IA, 564 filas de plantillas de frases rellenadas desde un vocabulario con formas habladas y escritas, 36 transcripciones limpiadas por Qwen3.5-9B y revisadas manualmente, y 399 transcripciones sinteticas generales limpiadas por S1-mini original para evitar olvido catastrofico. La ronda 2 anadio 86 pares escritos a mano, filas de 52 plantillas nuevas con ruido inyectado y varios cientos de dictados reales del autor anonimizados. La perdida se calcula solo sobre el texto limpio; el system prompt, la linea de control, la transcripcion y el bloque `<think>` vacio estan enmascarados. No se menciona RLHF ni DPO.

## Capacidades

- Normalizacion de texto ASR: puntuacion, mayusculas (truecasing) y eliminacion de muletillas (`um`, `uh`, `er`, `om`, `hmm`, etc.).
- Eliminacion de tartamudeos y reinicios (`the the`, `dep deploy`), preservando repeticiones con significado (`really really`, `that that`, `--`).
- Preservacion de nomenclatura tecnica dictada letra a letra o con palabras: `a d o` a `ADO`, `tilde slash dot omp` a `~/.omp/...`, `dash dash verbose` a `--verbose`.
- Limpieza de peticiones dictadas sin responderlas: el modelo limpia, nunca ejecuta la instruccion.
- Cuatro estilos de salida: casual, semi-casual, semi-formal y formal.
- Soporte de contexto de correo (`Context: email`) y de listas con vinetas.
- Control mediante linea de control y system prompt heredados de S1-mini.
- No dispone de tool calling, function calling, vision, audio ni modo thinking funcional (el bloque `<think>` va vacio).
- Capacidad multilingue limitada al ingles.

## Casos de uso

- Dictado de codigo y comandos en el editor: el modelo convierte "tilde slash dot omp slash agent slash watchdog dot yml" en `~/.omp/agent/WATCHDOG.yml`, lo que permite dictar rutas y flags de CLI sin correccion manual posterior.
- Post-procesado en pipelines ASR locales: se inserta entre el motor de reconocimiento (whisper.cpp, sherpa-onnx) y la aplicacion final para anadir puntuacion, mayusculas y limpiar muletillas antes de mostrar el texto.
- Redaccion de tickets y mensajes de commit: limpia dictados semi-formales y formales, elimina reinicios y deja frases coherentes listas para pegar en un issue tracker o en un mensaje de commit.
- Asistencia a reuniones y notas tecnicas: con el estilo semi-formal y soporte de listas, transforma transcripciones habladas en notas con vinetas.
- Correos dictados: el contexto `Context: email` adapta el registro y la puntuacion al formato de correo electronico.
- Herramientas de accesibilidad para desarrolladores: dictado manos libres en entornos donde el teclado no es practico, con preservacion de identificadores tecnicos.
- Integracion en asistentes de voz para DevOps: limpieza de comandos dictados antes de pasarlos a un shell o a un agente, evitando que muletillas o repeticiones rompan la ejecucion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card solo declara objetivos de comportamiento de entrenamiento (pares hablado/escrito) y una perdida de validacion de 0.269 en el checkpoint publicado, sin comparaciones con MMLU, HumanEval, GSM8K ni metricas ASR como WER o DER.

## Requisitos de hardware

- VRAM estimada: aproximadamente 1,2 GB en bf16 (596 M parametros), en torno a 0,6-0,7 GB en GGUF Q8_0 y 0,4 GB en Q4_K_M, mas overhead de contexto y runtime.
- Cabe holgadamente en cualquier GPU consumer: RTX 3060, RTX 4060, RTX 4090, asi como en Apple Silicon via mlx.
- Tambien puede ejecutarse en CPU con llama.cpp u Ollama para los builds GGUF, con latencia mayor pero suficiente para post-procesado de dictado.
- Opciones de despliegue: transformers (pesos safetensors), llama.cpp (GGUF), Ollama, y text-generation-inference por compatibilidad de endpoints.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| S1-mini-dev-dictation | 596 M | no disponible | Post-procesado ASR para ingenieria de software | s1-mini-license | Hugging Face |
| superwhisper/s1-mini | 596 M (base Qwen3-0.6B) | no disponible | Post-procesado ASR generico | s1-mini-license | Hugging Face |
| Qwen/Qwen3-0.6B | 596 M | no disponible | LLM generalista | Apache 2.0 | Hugging Face |

No se dispone de datos de rendimiento comparativos entre estos modelos en la informacion proporcionada; la comparacion se limita a parametros, licencia y proposito.

## Limitaciones y advertencias

- Solo soporta ingles; no hay capacidades multilingues declaradas.
- Entrenado sobre un conjunto de datos pequeno (poco mas de 1.300 filas en la ronda 1 mas ampliaciones en la ronda 2), lo que puede limitar la generalizacion fuera del dominio de ingenieria de software y DevOps.
- Riesgo de alucinacion o de "limpiar" en exceso contenido que deberia preservarse, especialmente con repeticiones ambiguas.
- No transcribe audio: requiere un motor ASR previo; su calidad depende de la calidad de la transcripcion de entrada.
- La licencia s1-mini-license impone una clausula de atribucion: cualquier uso, distribucion o integracion debe identificar el modelo como "S1-mini" de "Superwhisper" con esa capitalizacion exacta, incluso en productos derivados. Conviene revisar el texto completo antes de un uso comercial.
- El modelo limpia dictados pero no responde peticiones; no debe usarse como asistente conversacional.
- No dispone de tool calling ni de agentes; el bloque `<think>` esta vacio por diseno.
- Los objetivos de comportamiento de la model card son objetivos de entrenamiento, no resultados medidos.

## Enlaces

- Hugging Face: https://huggingface.co/0x56696B/S1-mini-dev-dictation
- Modelo base: https://huggingface.co/superwhisper/s1-mini
- Licencia S1-mini: https://huggingface.co/superwhisper/s1-mini/blob/main/LICENSE
- Qwen3-0.6B: https://huggingface.co/Qwen/Qwen3-0.6B
- Paper Qwen3 (arxiv:2505.09388): https://arxiv.org/abs/2505.09388
- mlx-lm: https://github.com/ml-explore/mlx-lm
