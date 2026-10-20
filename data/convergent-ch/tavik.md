# Convergent-ch/Tavik

## Resumen

Tavik es un modelo de lenguaje conversacional en inglés de 20.405.376 parámetros (41 MB en f16) desarrollado por Convergent. Es el hermano mayor de Pico 1 y fue entrenado desde cero en una única GPU de consumo (una RTX 3060 Ti de 8 GB) en una sola noche, según la model card del autor. Su relevancia no está en el rendimiento, sino en el ejercicio de ingeniería: un SLM (small language model) completo, con tokenizador propio, formato de chat, pesos en safetensors y GGUF, que cabe en una Raspberry Pi 4 o 5 y se puede ejecutar en CPU.

La arquitectura es un decoder estilo Llama con RMSNorm, SwiGLU, RoPE y embeddings atados, de 9 capas, dimensión oculta 384, MLP de 1152 y 6 cabezas de atención (dimensión de cabeza 64). El vocabulario es de 8.192 tokens con BPE a nivel de byte y la longitud de contexto es de solo 1.024 tokens. Está pensado exclusivamente para inglés y para conversación sencilla: small talk, preguntas simples y listas cortas.

El modelo se distribuye con licencia Apache 2.0 y está etiquetado explícitamente por su autor como herramienta de experimentación, no de producción: los hechos que afirma suelen ser incorrectos, las listas contienen consejos inventados y no es capaz de hacer matemáticas ni de escribir código. Es, por tanto, un caso de estudio de entrenamiento de bajo coste más que un candidato para despliegues reales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Decoder estilo Llama (RMSNorm, SwiGLU, RoPE, embeddings atados) |
| Parametros totales | 20.405.376 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 1.024 tokens |
| Tipos de cuantizacion | GGUF en f16 publicado; no se han publicado otras cuantizaciones |
| Idiomas soportados | Ingles unicamente |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (transformers, `LlamaForCausalLM`), GGUF (f16), `Modelfile` para Ollama |

Datos adicionales de configuracion: 9 capas, hidden size 384, tamaño de MLP 1152, 6 cabezas de atencion con head dim 64, vocabulario de 8.192 tokens (BPE a nivel de byte), tamaño del repo 0,1 GB. Formato de chat: `<|bos|><|user|> ... <|end|> <|assistant|>`, con parada en `<|end|>`.

## Arquitectura y entrenamiento

Transformer decoder only de tipo Llama, con normalizacion RMSNorm, activacion SwiGLU, embeddings rotatorios (RoPE) y pesos de embedding atados entre entrada y salida. No hay mecanismos de atencion lineal, decodificacion especulativa ni modulos híbridos: es una arquitectura densa convencional a pequeña escala, con 20,4 M de parametros y un tokenizador byte-level BPE de 8.192 entradas entrenado para el modelo.

El entrenamiento se hizo en tres fases sobre una RTX 3060 Ti (8 GB), en bf16, con AdamW y schedule coseno, a 131.072 tokens por paso:

1. **Pretraining desde cero** con 355 M tokens de FineWeb-Edu (sample-10BT, primer shard, paginas de 150 a 3.000 palabras). 6.000 pasos (~786 M tokens, 2,2 epocas), learning rate 1,5e-3, 2 h 53 min. Loss de validacion 3,09.
2. **Entrenamiento de chat** con 586 K conversaciones (279 M tokens), calculando la loss solo sobre las respuestas del asistente. 3.000 pasos (~1,4 epocas), learning rate 5e-4, 1 h 23 min. Loss de validacion 1,82.
3. **Ajuste de identidad** con 37 K conversaciones: unas 1.000 sobre Tavik generadas localmente con Qwen3 8B (Apache 2.0) y 4.000 de plantilla, mezcladas con 30 K conversaciones ordinarias para evitar olvido catastrofico. 450 pasos a 32.768 tokens por paso, learning rate 1e-4. Loss de validacion final 1,76 (perplejidad 5,8) sobre chats reservados.

Los datos de chat provienen de Smol-SmolTalk (Apache 2.0, los cuatro shards, sin codigo ni LaTeX), TinyDialogues (MIT, solo dialogos uno a uno entre un niño y otro interlocutor, con el niño como usuario) y Everyday Conversations (Apache 2.0). No se documenta ninguna fase de RLHF ni de DPO; el alineamiento se limita al SFT sobre datos conversacionales.

## Capacidades

- Generacion de texto conversacional en ingles: small talk, respuestas cortas y frases gramaticales.
- Respuesta a preguntas simples de conocimiento general, con alta tasa de error factual.
- Redaccion de listas cortas (aunque con elementos inventados o sin sentido con frecuencia).
- Coherencia de identidad: sabe que se llama Tavik y que fue creado por Convergent, reforzado en la fase de identity tuning.
- Soporte de plantilla de chat con roles user/assistant y tokens especiales dedicados.
- Ejecucion en CPU y en dispositivos de muy bajos recursos (Raspberry Pi 4/5).
- No soporta tool calling ni function calling.
- No soporta razonamiento multi-paso ni modos de "thinking".
- Sin capacidades de vision, audio ni multimodalidad.
- Sin capacidad de matematicas ni de generacion de codigo (declarado explicitamente por el autor).
- Multilingue: no, solo ingles.

## Casos de uso

- **Experimentacion educativa con SLM**: sirve para reproducir un pipeline completo de entrenamiento (tokenizacion, pretraining, SFT, identity tuning) en una sola GPU de 8 GB, con tiempos documentados de menos de 5 horas en total.
- **Banco de pruebas de despliegue en edge**: al ocupar 41 MB en f16 y ejecutarse en CPU, permite validar integraciones con Ollama y llama.cpp en Raspberry Pi o dispositivos embebidos antes de portar un modelo mayor.
- **Prototipado de formato de chat y tokenizador**: util para iterar sobre plantillas de prompt, tokens de parada y temperaturas (el autor recomienda ~0,3 con penalizacion ligera de repeticion) sin coste de inferencia apreciable.
- **Demostraciones de chatbot minimo**: un asistente de conversacion de juguete para talleres, charlas o material docente donde el objetivo es mostrar el comportamiento de un modelo entrenado desde cero.
- **Generacion de datos sinteticos de relleno en tests**: respuestas cortas en ingles para poblar fixtures de pruebas de pipelines de NLP, asumiendo que el contenido no es fiable.
- **Evaluacion de tecnicas de identity tuning**: el modelo incluye una fase especifica de ajuste de identidad con datos generados por Qwen3 8B, lo que lo convierte en un caso reproducible para estudiar como se ancla la persona en modelos muy pequeños.
- **Investigacion sobre alucinacion a escala minima**: sus fallos son sistematicos y documentados (por ejemplo, la explicacion erronea de por que el cielo es azul), lo que lo hace util como sujeto de estudio de fluidez sin fundamento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible (ni MMLU, ni HumanEval, ni GSM8K, ni evaluaciones equivalentes). El autor solo reporta metricas de validacion durante el entrenamiento:

| Metrica | Fase | Valor |
|---|---|---|
| Loss de validacion | Pretraining | 3,09 |
| Loss de validacion | Chat training | 1,82 |
| Loss de validacion | Identity tuning | 1,76 |
| Perplejidad | Chats reservados (final) | 5,8 |

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en f16 (los pesos ocupan 41 MB); el consumo real lo domina el runtime, no el modelo.
- GPU recomendadas: cualquiera con mas de 1 GB de VRAM; el entrenamiento se realizo en una RTX 3060 Ti de 8 GB. Funciona igualmente en A100/H100 sin aprovechar su capacidad.
- Cabe holgadamente en GPU de consumo: RTX 3060, RTX 4060, GTX 1650, e incluso en iGPU y en CPU pura.
- Despliegue: Ollama (`tavik.gguf` + `Modelfile`), llama.cpp, y `transformers` con `AutoModelForCausalLM`. Compatible con text-generation-inference segun los tags del repo, aunque no se documenta configuracion especifica.
- Dispositivos objetivo declarados: Raspberry Pi 4 o 5.
- Latencia y throughput: no disponible (no se han publicado mediciones).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Tavik | 20,4 M | 1.024 | Apache 2.0 | HuggingFace (safetensors + GGUF) | Solo ingles, sin benchmarks publicados |
| Pico 1 (mismo autor) | no disponible | no disponible | no disponible | HuggingFace | Hermano menor de Tavik; datos no incluidos en la informacion proporcionada |
| SmolLM2-135M | 135 M | 8.192 | Apache 2.0 | HuggingFace | Alternativa de referencia en el segmento sub-200M; datos segun su model card publica |
| Qwen2.5-0.5B | ~0,49 B | 32.768 | Apache 2.0 | HuggingFace | Opcion mucho mayor, con soporte multilingue y de codigo; datos segun su model card publica |

Nota: los datos de SmolLM2-135M y Qwen2.5-0.5B provienen de sus model cards publicas y no han sido verificados en la busqueda realizada; no hay benchmarks comparativos directos con Tavik.

## Limitaciones y advertencias

- **Fiabilidad factual muy baja**: el autor advierte que los hechos son poco fiables y que el modelo suena seguro cuando se equivoca. Ejemplo documentado: explica que el cielo es azul porque "el cielo azul es rojo".
- **Listas y consejos inventados**: las recomendaciones y enumeraciones contienen elementos fabricados o sin sentido.
- **Sin matematicas, sin codigo y sin razonamiento multi-paso**: no debe emplearse en tareas que requieran calculo o planificacion.
- **Contexto muy corto**: 1.024 tokens limitan cualquier conversacion multi-turno o documento largo.
- **Solo ingles**: no hay soporte de castellano ni de otros idiomas.
- **Sin safety tuning**: el autor indica explicitamente que no debe usarse en productos ni para dar consejos de ningun tipo.
- **Licencia**: Apache 2.0 permite uso comercial, pero la propia model card desaconseja el uso en produccion; la licencia no exime de responsabilidad sobre las salidas.
- **Procedencia de los datos**: parte del corpus de chat fue generado con Llama 3.1, GPT-4 y Llama 3.1 70B Instruct por los autores de los datasets, con las condiciones de uso que estos impongan.
- **Fecha de publicacion atipica**: el repositorio figura creado el 2026-10-19, lo que conviene verificar antes de citarlo.
- **Sin benchmarks**: no existe evidencia cuantitativa de calidad mas alla de la loss de validacion.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Convergent-ch/Tavik
- Modelo hermano Pico 1: https://huggingface.co/Convergent-ch/Pico-1
- Dataset FineWeb-Edu: https://huggingface.co/datasets/HuggingFaceFW/fineweb-edu
- Dataset Smol-SmolTalk: https://huggingface.co/datasets/HuggingFaceTB/smol-smoltalk
- Dataset TinyDialogues: https://huggingface.co/datasets/styfeng/TinyDialogues
- Dataset Everyday Conversations: https://huggingface.co/datasets/HuggingFaceTB/everyday-conversations-llama3.1-2k

La busqueda web realizada no devolvio enlaces relevantes sobre el modelo: los resultados obtenidos corresponden a definiciones de diccionario del termino frances "convergent" y no guardan relacion con este proyecto. No se han encontrado papers, blogs, repositorios ni demos adicionales.
