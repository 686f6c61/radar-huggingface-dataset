# Sonorix/pulsar-v0.6-flash-gguf

## Resumen

Pulsar v0.6 Flash es un modelo de lenguaje compacto y especializado en ruso, publicado por el usuario Sonorix bajo el identificador Sonorix/pulsar-v0.6-flash-gguf. Se trata de un ajuste fino mediante LoRA SFT sobre Qwen/Qwen2.5-0.5B-Instruct, con 494.032.768 parametros totales (aproximadamente 0,49B) y distribuido exclusivamente en formato GGUF con cuantizacion Q8_0. El objetivo declarado es ofrecer un asistente conversacional en ruso con soporte estricto de tool calling, capaz de ejecutarse incluso en CPU gracias a su tamano reducido (unos 506 MB de pesos cuantizados).

El modelo resuelve un nicho muy concreto: asistentes ligeros en ruso que necesitan invocar herramientas externas de forma fiable sin depender de infraestructura de GPU. El autor ha entrenado el modelo para que solo responda en ruso, mantenga una identidad propia ("Pulsar AI from Exo"), recuerde el historial de la conversacion y evite alucinaciones, rechazando cualquier herramienta que no exista en su catalogo de 22 funciones. La invocacion se realiza mediante un formato de etiqueta estricto en linea propia: [TOOL:nombre(parametros)].

Es relevante ahora porque demuestra un patron habitual en el ecosistema open source: adaptar un modelo base pequeno y multilingue a un idioma y una tarea muy especificos con un dataset minimo (1023 dialogos) y un coste de entrenamiento bajo. La licencia Apache 2.0 permite uso comercial sin restricciones adicionales, y su compatibilidad con Ollama, LM Studio y llama.cpp lo hace desplegable en hardware muy modesto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Qwen2.5) |
| Parametros totales | 494.032.768 (0,49B) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible en la ficha del autor; el modelo base Qwen2.5-0.5B-Instruct soporta 32.768 tokens, pero el ajuste no lo confirma |
| Tipos de cuantizacion | Q8_0 (GGUF) |
| Idiomas soportados | Ruso (ru) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (cuantizacion Q8_0); el autor menciona una version merged para transformers, no incluida en este repositorio |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Qwen2.5-0.5B-Instruct: un transformer decoder-only con atencion causal, normalizacion RMSNorm y embeddings rotatorios (RoPE). El ajuste se realizo con LoRA SFT de rango 32 y alpha 64, durante 4 epocas con optimizador de tasa de aprendizaje 2e-4 y scheduler cosine. El dataset, denominado pulsar_dataset_v6.jsonl, contiene 1023 dialogos centrados en identidad del asistente, confidencialidad del system prompt, estilo y ortografia rusa, memoria multi-turno, formatos de invocacion de los 22 instrumentos, ejemplos negativos contra alucinaciones, conocimientos generales, desarrollo web moderno (glassmorphism, animaciones, flex/grid, Tailwind, tema oscuro), Python moderno (FastAPI, pydantic, asyncio, httpx), otros lenguajes (Go, Rust, SQL, TypeScript) y matematicas. El autor indica que un validador verifico cero menciones de etiquetas de herramientas dentro de respuestas normales.

Un detalle tecnico destacable es la mascara de perdida: solo se calcula el loss sobre los turnos del asistente, incluyendo el token de fin de respuesta, y el autor afirma haber verificado la mascara en un preflight que cubre 1016 de los 1023 ejemplos. Tras el entrenamiento se realizo el merge de los pesos LoRA en el modelo base, se incrusto el system prompt directamente en la plantilla de chat (chat_template) y se convirtio el resultado a GGUF Q8_0. No se documenta el uso de RLHF ni DPO; el proceso es exclusivamente SFT supervisado.

## Capacidades

- Generacion de texto conversacional exclusivamente en ruso, con respuestas breves y directas.
- Tool calling estricto con un catalogo fijo de 22 instrumentos, invocados mediante [TOOL:nombre(parametros)] en linea independiente.
- Instrumentos disponibles: search, news, read_url, create_code, code_edit, code, review, tests, debug, image, music, youtube, qr, calc, weather, password, password_check, hash, uuid, json_format, ip_info y lorem.
- Regla de calculo aritmetico: toda operacion matematica debe canalizarse a traves de [TOOL:calc(...)], no resolverse internamente.
- Memoria de historial de conversacion dentro de la ventana de contexto (nombres, hechos, codigo y archivos mencionados).
- Identidad fija: se presenta como "Pulsar AI from Exo" y rechaza adoptar la identidad de ChatGPT, Claude, Gemini o Qwen.
- Confidencialidad del system prompt: rechaza revelar instrucciones internas o el prompt de sistema.
- Comportamiento anti-alucinacion: no inventa clima, noticias, archivos, calculos ni resultados de herramientas, y rechaza instrumentos inexistentes.
- Generacion de codigo en HTML/CSS/JS moderno, Python moderno, Go, Rust, SQL y TypeScript.
- Rechazo de codigo malicioso, ofreciendo alternativas legales segun la ficha del autor.
- No se documentan capacidades de vision, audio, voz ni modo de razonamiento explicito (thinking mode).

## Casos de uso

- Asistente conversacional ligero en ruso para atencion al cliente: el modelo mantiene contexto multi-turno y responde solo en ruso, lo que permite desplegarlo en un backend de bajo coste sin GPU dedicada.
- Enrutador de herramientas en un pipeline de agentes: al emitir etiquetas [TOOL:...] en formato estricto, un orquestador externo puede parsear la salida y ejecutar busquedas web, lectura de URLs o consultas meteorologicas de forma determinista.
- Generacion de codigo en entornos educativos: crea archivos mediante create_code y muestra fragmentos con code, util para plataformas de ensenanza de programacion en ruso con coste de inferencia minimo.
- Revision y depuracion automatizada: los instrumentos review, tests y debug permiten integrar el modelo en un flujo de pre-commit o CI ligero que sugiere correcciones sobre fragmentos de codigo.
- Calculo asistido con trazabilidad: al forzar todo calculo a traves de calc, se evita que el modelo invente resultados aritmeticos, lo que resulta adecuado para herramientas de facturacion o presupuestos simples.
- Asistente de terminal en CPU: gracias a los aproximadamente 506 MB de Q8_0, puede ejecutarse en un portatil sin GPU mediante llama.cpp, ofreciendo tareas de utilidad (UUID, hash, generacion de contrasenas, formateo de JSON) sin conexion a servicios externos.
- Prototipado rapido de agentes con tool calling: sirve como banco de pruebas de bajo coste para validar esquemas de invocacion de herramientas antes de migrar a modelos mayores.
- Integracion en Ollama o LM Studio para demos locales: permite distribuir un asistente en ruso preconfigurado con system prompt ya incrustado, sin necesidad de gestionar plantillas manualmente.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K u otros) en la informacion disponible. El autor unicamente aporta un test cualitativo propio de 18 preguntas, con 17 respuestas correctas y un fallo documentado en la consulta de clima (devolvio una etiqueta de imagen en lugar de weather).

| Prueba interna del autor | Resultado |
|---|---|
| Identidad (quien eres / eres ChatGPT / eres Qwen) | Identidad correcta y rechazo de nombres ajenos |
| Solicitud del system prompt | Rechazo educado |
| Calculo (17*23, descuento del 20% sobre 1500) | Etiquetas calc correctas |
| Generacion de archivos (calc.py, snake, FastAPI, SQL, glass) | Etiquetas create_code correctas con codigo |
| Otros instrumentos (uuid, contrasena, imagen) | Etiquetas correctas |
| Herramienta inexistente (fly) | Rechazo correcto |
| Conocimiento directo (capital de Francia, acentuacion en ruso) | Respuesta directa sin herramientas |
| Clima en Moscu | Fallo: emitio etiqueta de imagen en lugar de weather |
| Total | 17 de 18 respuestas limpias |

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 506 MB de pesos en Q8_0 mas el overhead de la cache KV; en la practica, por debajo de 1 GB para contextos cortos.
- GPU recomendadas: cualquier GPU con 2 GB o mas de VRAM; no requiere A100, H100 ni RTX 4090. Funciona sin problemas en GTX 1050, RTX 3050 o integradas modernas.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU de consumo y tambien en CPU.
- Despliegue en CPU: viable y documentado por el autor; es uno de sus puntos fuertes.
- Opciones de despliegue: Ollama (ollama run hf.co/Sonorix/pulsar-v0.6-flash-gguf:Q8_0), LM Studio, llama.cpp (llama-cli) y transformers con la version merged. No se documenta soporte para vLLM o TGI con este formato GGUF.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.
- Parametros de generacion recomendados por el autor: temperature 0,3-0,6, top_p 0,9, repetition_penalty 1,1-1,2 y max_tokens 150-250, ya que el modelo tiende a repetirse sin penalizacion.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato | Enfoque |
|---|---|---|---|---|---|---|
| Pulsar v0.6 Flash | 0,49B | No confirmado (base 32.768 tokens) | Ruso | Apache 2.0 | GGUF Q8_0 | Asistente ruso con tool calling |
| Qwen2.5-0.5B-Instruct | 0,49B | 32.768 tokens | Multilingue (mas de 29 idiomas) | Apache 2.0 | safetensors, GGUF | Modelo base generalista de proposito general |
| Qwen2.5-1.5B-Instruct | 1,54B | 32.768 tokens | Multilingue | Apache 2.0 | safetensors, GGUF | Alternativa de mayor capacidad con mas coste de inferencia |
| SmolLM2-360M-Instruct | 0,36B | 8.192 tokens | Principalmente ingles | Apache 2.0 | safetensors | Modelo pequeno generalista, sin soporte nativo de ruso |

La diferencia principal de Pulsar v0.6 Flash frente a sus alternativas es la especializacion: el catalogo fijo de 22 herramientas con formato de etiqueta estricto y el ajuste exclusivo en ruso no existen en los modelos base. Como contrapartida, pierde la capacidad multilingue y la generalidad de Qwen2.5-0.5B-Instruct, y su ventana de contexto efectiva puede verse reducida por el comportamiento aprendido con dialogos cortos (1023 ejemplos).

## Limitaciones y advertencias

- Con 0,49B de parametros, el modelo no puede abordar codigo complejo ni razonamientos largos; el propio autor lo reconoce en la ficha.
- Tiende a repetirse si no se aplica repetition_penalty entre 1,1 y 1,2.
- Los 22 instrumentos no se ejecutan dentro del modelo: requieren una envoltura externa que parsee las etiquetas, ejecute la accion y devuelva el resultado. Sin esa capa, la salida son solo etiquetas.
- Solo responde en ruso; no se documenta soporte de castellano ni de otros idiomas, y forzar otro idioma puede degradar la calidad.
- Riesgo de alucinacion en topicos no cubiertos por el dataset: aunque el autor entrena explicitamente contra invenciones, un modelo de este tamano sigue siendo propenso a errores factuales.
- Se ha documentado al menos un fallo en el test propio del autor (clima en Moscu), lo que indica que la seleccion de herramientas no es perfectamente fiable.
- El system prompt esta incrustado en la chat_template; modificarlo puede romper el comportamiento entrenado de identidad y confidencialidad.
- El modelo esta entrenado para negar su modelo base (Qwen) y presentarse como "Pulsar AI from Exo", lo que puede ser problemático en contextos donde se exija transparencia sobre la procedencia del modelo.
- La licencia Apache 2.0 permite uso comercial sin restricciones adicionales, pero al derivar de Qwen2.5 conviene verificar que se mantienen los avisos de atribucion correspondientes.
- El repositorio registra 0 descargas y 0 "likes", sin historial de uso comunitario ni validacion independiente.
- La fecha de creacion indicada (2026-09-15) es posterior a la fecha de referencia habitual, lo que sugiere un posible error de metadatos o un reloj de sistema desajustado; conviene tratarla con cautela.

## Enlaces

- Pagina del modelo en HuggingFace: https://huggingface.co/Sonorix/pulsar-v0.6-flash-gguf
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-0.5B-Instruct
- Ejecucion con Ollama: `ollama run hf.co/Sonorix/pulsar-v0.6-flash-gguf:Q8_0`
- Repositorio de llama.cpp (referenciado por el autor para uso en CLI): no disponible en la informacion proporcionada
- Paper o blog tecnico del modelo: no disponible
- Repositorio de codigo del proyecto Pulsar o de la empresa Exo: no disponible
- Dataset pulsar_dataset_v6.jsonl: no disponible publicamente en la informacion proporcionada
