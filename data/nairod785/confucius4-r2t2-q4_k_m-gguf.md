# Nairod785/Confucius4-R2T2-Q4_K_M-GGUF

## Resumen

Confucius4-R2T2 en formato Q4_K_M GGUF es una cuantizacion del modelo de reconocimiento automatico del habla (ASR) desarrollado por NetEase Youdao, publicado por el usuario Nairod785. El modelo original es un sistema de transcripcion en streaming de baja latencia, con decodificacion "append-only" (solo anade texto, sin reescribir lo ya emitido) y tecnica de Longest Stable Prefix, afinado a partir de Qwen3-ASR-1.7B. Esta version GGUF permite ejecutarlo de forma nativa en los runtimes transcribe.cpp y audio.cpp, sin necesidad de infraestructura Python.

La relevancia de esta ficha concreta esta en la receta de cuantizacion asimetrica por tensor: versiones anteriores en 4 y 5 bits sufrían dos fallos graves, salidas vacias catastroficas y deriva silenciosa de idioma (por ejemplo, transcribir aleman o ruso como si fuera ingles). El autor resuelve ambos problemas manteniendo las proyecciones MLP down en Q6_K y las embeddings en Q2_K, logrando un archivo de 1.187 GB, un 52 % mas pequeno que la referencia Q8_0 de 2.478 GB, con paridad funcional verificada en cinco idiomas.

El modelo cubre 30 idiomas, con optimizacion especial para chino y ingles, y esta pensado para transcripcion en tiempo real y por lotes. Su licencia es la NetEase Youdao Model Use License, que conviene revisar antes de cualquier uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder de audio Qwen3-ASR (24 capas, ancho 1024, ancho proyectado 2048) + decoder LM causal (28 capas, 16 cabezas de consulta, 8 cabezas KV, ancho de cabeza 128) |
| Parametros totales | no disponible (el modelo base se describe como Qwen3-ASR-1.7B) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (ventana de audio por chunk configurable de 80 a 2000 ms) |
| Tipos de cuantizacion | Q4_K_M asimetrica por tensor (audio tower BF16/Q4_K, proyecciones de atencion Q4_K, MLP gate/up Q4_K, MLP down Q6_K, embeddings Q2_K) |
| Idiomas soportados | zh, en, yue, ar, de, fr, es, pt, id, it, ko, ru, th, vi, ja, tr, hi, ms, nl, sv, da, fi, pl, cs, fil, fa, el, hu, mk, ro (30 idiomas) |
| Licencia | netease-model-use-license |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

El modelo sigue un esquema encoder-decoder clasico para ASR. El encoder de audio procede de Qwen3-ASR, con 24 capas, anchura de 1024 y proyeccion a 2048 dimensiones; el decoder es un LM causal de 28 capas con atencion GQA (16 cabezas de consulta y 8 de clave-valor, con 128 dimensiones por cabeza). Sobre esta base, NetEase Youdao aplica un ajuste fino orientado a streaming con decodificacion de prefijo mas largo estable, que permite emitir texto de forma incremental sin reescribir fragmentos ya entregados.

No se dispone de informacion sobre el volumen de tokens de entrenamiento, la composicion del dataset ni el uso de RLHF o DPO en la informacion proporcionada. La innovacion documentada en esta publicacion es exclusivamente la receta de cuantizacion: se preservan en BF16 las proyecciones sensibles del encoder de audio, se mantiene el MLP down en Q6_K como suelo duro porque escribe en el flujo residual y su degradacion provoca perdida multilingue, y se comprimen las embeddings a Q2_K porque el error de tabla de busqueda no se acumula. El resultado es una cuantizacion de 4 bits que evita tanto el colapso a salida vacia como la deriva de idioma.

## Capacidades

- Reconocimiento automatico del habla en modo offline y en modo streaming en tiempo real.
- Decodificacion append-only con Longest Stable Prefix: el texto emitido no se corrige retroactivamente, lo que simplifica su integracion en interfaces en vivo.
- Chunks de audio configurables entre 80 ms y 2000 ms, con 320 ms como valor recomendado por defecto.
- Transcripcion multilingue en 30 idiomas, con rendimiento optimizado para chino y ingles y soporte de cantonés.
- Servidor compatible con la API de transcripciones de OpenAI (`/v1/audio/transcriptions`), incluyendo modo streaming mediante `stream=true`.
- Ejecucion nativa en transcribe.cpp y audio.cpp con backend CUDA, CPU y Metal.
- No dispone de tool calling, function calling, capacidades de agente, vision, audio de entrada distinto de voz ni modo de razonamiento explicito.

## Casos de uso

- Subtitulado en directo de reuniones y webinars: el modo streaming con chunks de 320 ms permite emitir subtitulos incrementales sin reescrituras, adecuado para videoconferencia donde la latencia percibida importa mas que la revision posterior.
- Transcripcion de reuniones multilingues: con 30 idiomas y estabilidad verificada en aleman, frances, ruso y chino, un mismo despliegue cubre equipos distribuidos sin cambiar de modelo por idioma.
- Atencion al cliente con analitica de voz: el servidor compatible con OpenAI permite enviar grabaciones por lotes desde un pipeline existente y obtener transcripciones para clasificacion, busqueda o cumplimiento normativo.
- Despliegue en hardware de consumo: con 1.187 GB de pesos, el modelo cabe en GPUs de portatil; el autor reporta 69,6x tiempo real en una RTX 4070 Laptop y 3,1x tiempo real en CPU i9-13900H, lo que habilita prototipos y demos locales sin GPU de datacenter.
- Transcripcion en el borde o en entornos sin conectividad: la ejecucion con audio.cpp y backend CPU o Metal permite integrar ASR en aplicaciones de escritorio y dispositivos Apple sin depender de servicios en la nube.
- Generacion de actas y notas a partir de audio de movil: la velocidad en CPU (3,1x tiempo real) hace viable procesar grabaciones de forma local en un portatil convencional antes de subir solo el texto.
- Accesibilidad para contenido audiovisual: la salida incremental encaja en lectores y reproductores que necesitan texto sincronizado en tiempo real para personas con discapacidad auditiva.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (WER en FLEURS, Common Voice, MMLU u otros) en la informacion disponible. Los unicos datos empiricos aportados son de velocidad y paridad:

| Metrica | Valor | Condiciones |
|---|---|---|
| Velocidad en CUDA | 69,6x tiempo real | RTX 4070 Laptop, clip aleman de 29 s, 421 ms totales, 137 tokens de decodificacion/s |
| Velocidad en CPU | 3,1x tiempo real | Intel i9-13900H |
| Paridad de salida | Byte-identica al build sin optimizar | 100 clips FLEURS en 5 idiomas |
| Tamano del archivo | 1.187 GB (1.186.939.968 bytes) | Frente a 2.478 GB del Q8_0 de referencia |
| Reduccion de tamano | 52 % | Respecto a Q8_0 |

## Requisitos de hardware

- VRAM estimada: no disponible de forma explicita; con pesos de 1.187 GB en Q4_K_M, el modelo completo cabe holgadamente en GPUs con 4 GB o mas, aunque el consumo real depende del backend y del buffer de audio.
- GPU recomendadas: RTX 4070 Laptop verificada por el autor; cualquier GPU NVIDIA con soporte CUDA y al menos 4 GB de VRAM deberia ser suficiente. No se han publicado pruebas en A100, H100 ni RTX 4090.
- GPU de consumo: si, cabe en la mayoria de GPUs de consumo actuales, incluidas las de portatil de gama media.
- CPU: viable para uso offline, con 3,1x tiempo real medido en un i9-13900H.
- Opciones de despliegue: transcribe-cli, audiocpp_cli (backends CUDA, CPU y Metal) y servidor HTTP compatible con la API de OpenAI en el puerto 8488.
- Latencia y throughput: 421 ms para un clip de 29 s en RTX 4070 Laptop (69,6x tiempo real) y 137 tokens de decodificacion por segundo en esa misma configuracion.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| Confucius4-R2T2 Q4_K_M (esta ficha) | no disponible (base Qwen3-ASR-1.7B) | no disponible | 30 | netease-model-use-license | GGUF |
| netease-youdao/Confucius4-R2T2 (original) | no disponible (base Qwen3-ASR-1.7B) | no disponible | 30 | netease-model-use-license | safetensors (presumible, no confirmado) |
| davidxifeng/Confucius4-R2T2-gguf | no disponible | no disponible | no disponible | no disponible | GGUF |
| Whisper large-v3 | no disponible en la informacion proporcionada | no disponible | no disponible | no disponible | no disponible |

La comparacion con alternativas de la misma categoria no puede completarse con rigor porque la informacion proporcionada no incluye especificaciones de otros sistemas ASR. Los unicos puntos de referencia citados son la version original de NetEase Youdao y el repositorio GGUF de David Xi Feng, que sirvio de inspiracion.

## Limitaciones y advertencias

- La licencia NetEase Youdao Model Use License no es una licencia open source estandar; es imprescindible revisar sus terminos antes de cualquier uso comercial o redistribucion.
- Al ser un trabajo derivado cuantizado, hereda las limitaciones del modelo original, incluidas las de su dataset de entrenamiento, no documentado en la informacion disponible.
- El riesgo de alucinacion en ASR se manifiesta como sustituciones o traducciones espurias; el autor documenta que cuantizaciones uniformes de 4 y 5 bits provocaban deriva de idioma, mitigada aqui pero no eliminada en todos los pares linguisticos.
- La validacion multilingue reportada cubre ingles, chino, aleman y frances, y la paridad byte a byte se comprobo en 5 idiomas sobre FLEURS; el resto de los 30 idiomas no tiene verificacion publicada en esta ficha.
- El rendimiento esta optimizado para chino e ingles; los idiomas de la cola larga pueden presentar mayor tasa de error.
- No se han publicado mediciones de WER ni comparaciones con otros sistemas, por lo que la calidad absoluta no puede evaluarse con los datos disponibles.
- Requiere los runtimes transcribe.cpp o audio.cpp; no es compatible directamente con llama.cpp, vLLM, Ollama ni TGI.
- El modo streaming append-only no permite revision retroactiva del texto, lo que puede ser inadecuado en flujos que exigen correccion completa de la transcripcion.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Nairod785/Confucius4-R2T2-Q4_K_M-GGUF
- Modelo original: https://huggingface.co/netease-youdao/Confucius4-R2T2
- Codigo fuente del modelo original: https://github.com/netease-youdao/Confucius4-R2T2
- Demo: https://r2t2.youdao.com/demo
- Repositorio GGUF de referencia: https://huggingface.co/davidxifeng/Confucius4-R2T2-gguf
- transcribe.cpp: https://github.com/NairoDorian/transcribe.cpp
- audio.cpp: https://github.com/0xShug0/audio.cpp
- Licencia: https://github.com/netease-youdao/Confucius4-R2T2/blob/master/MODEL_LICENSE
- Informe de cuantizacion: QUANTIZATION.md (incluido en el repositorio del modelo)
- Metodologia de cuantizacion por tensor: QUANTIZATION_ARMS.md (incluido en el repositorio del modelo)
