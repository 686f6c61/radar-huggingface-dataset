# ragraph-ai/LFM3-Omni-2B-RP

## Resumen

LFM3-Omni-2B-RP es un ajuste fino (finetune) del modelo multimodal LiquidAI/LFM3-Omni-2B, desarrollado por ragraph-ai y orientado a roleplay conversacional en inglés con personajes (character cards). Parte del modelo base de Liquid AI y conserva intacta toda la pila "omni": visión, entrada de audio y salida de voz. El ajuste se centró en el decodificador de lenguaje, aplicando una ablación ligera de rechazos mediante la herramienta Heretic para reducir las negativas del modelo a peticiones dañinas, manteniendo la coherencia de personaje.

El modelo tiene 2.166.928.384 parámetros totales (aproximadamente 2,17 mil millones) y se distribuye tanto en formato BF16 para Transformers como en cuantizaciones GGUF para llama.cpp, lo que permite su ejecución en dispositivos de gama baja, incluidos teléfonos. Su relevancia actual radica en combinar capacidades any-to-any (imagen, audio, voz y texto) en un tamaño muy reducido, con un enfoque explícito en conversación de rol sin censura y una licencia que conviene revisar antes de cualquier uso comercial.

La ficha describe un modelo especializado y de nicho: no está pensado como asistente general, sino como motor de conversación creativa para adultos con capacidades multimodales heredadas del modelo base.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (pila omni: encoders de visión y audio, decodificador de lenguaje, decodificador de voz y códec); detalles internos no disponibles |
| Parámetros totales | 2.166.928.384 (2,17 B) |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | Entrenado con conversaciones de hasta 8K tokens; el modelo base soporta 32K; 16K recomendado como valor por defecto |
| Tipos de cuantización | Q4_K_M, Q6_K, Q8_0, BF16 (GGUF); BF16 completo en safetensors |
| Idiomas soportados | Inglés (en) |
| Licencia | lfm1.0 (licencia "other" en Hugging Face, con archivo LICENSE propio) |
| Formato de pesos | safetensors (BF16, Transformers) y GGUF (llama.cpp) |

## Arquitectura y entrenamiento

El modelo es un finetune del checkpoint LiquidAI/LFM3-Omni-2B, que integra un decodificador de lenguaje con encoders de visión y audio, además de un decodificador de voz y un códec. El ajuste de ragraph-ai afectó únicamente al decodificador de lenguaje: según la model card, los encoders de visión y audio, el decodificador de voz y el códec son bit a bit idénticos al modelo base, y los proyectores multimodales (`mmproj`) distribuidos son los oficiales de Liquid AI, sin modificar.

El entrenamiento se orientó a chat de rol en inglés con tarjetas de personaje (persona, escenario y diálogo de ejemplo), usando plantilla ChatML. La ablación de rechazos se realizó con Heretic en su "trial 97" (ablación ligera), en contraste con la variante LowRefusal, que usa el "trial 105" (ablación fuerte). No se especifican en la información disponible el número de tokens de entrenamiento, la composición exacta del dataset ni si hubo RLHF o DPO. El modelo es no razonador (non-reasoning): cada respuesta comienza con un bloque `<think></think>` vacío, por lo que en llama.cpp es obligatorio desactivar el modo razonamiento.

## Capacidades

- Generación de texto conversacional en inglés con estilo de roleplay y ficción creativa.
- Visión: descripción y comprensión de imágenes y vídeo mediante el proyector multimodal.
- Entrada de audio: reconocimiento automático de voz (ASR) en inglés.
- Salida de voz: síntesis de texto a voz a 24 kHz en formato WAV, con opción de voz masculina.
- Conversación multi-turno con contexto de hasta 8K tokens de entrenamiento (16K recomendado en despliegue).
- Modo sin censura: escribe ficción explícita, violenta u ofensiva bajo petición.
- Compatibilidad con tarjetas de personaje estándar de SillyTavern.
- API compatible con OpenAI a través de llama-server.
- No dispone de modo de razonamiento (thinking mode desactivado por diseño).

## Casos de uso

- Roleplay conversacional con personajes: el modelo mantiene la coherencia de personaje durante conversaciones multi-turno gracias a su entrenamiento con tarjetas de personaje y a su ventana de contexto efectiva de 8K-16K tokens.
- Ficción creativa interactiva: escritura de narrativa explícita o violenta bajo demanda, adecuada para proyectos de escritura asistida para adultos que requieran ausencia de rechazos.
- Chat multimodal en el borde (edge): descripción de imágenes o vídeo en un servidor llama.cpp ligero, útil para prototipos de asistentes visuales en hardware de gama baja.
- Transcripción de voz (ASR) en inglés: uso de `llama-mtmd-cli --audio` para convertir discursos en texto con un modelo de 2B parámetros.
- Síntesis de voz para narrativa: generación de audio WAV a 24 kHz con `llama-tts`, aplicable a audiolibros o doblaje de pruebas de concepto.
- Integración en frontends de rol (SillyTavern): despliegue local con plantilla ChatML y configuración de samplers documentada, orientado a usuarios que ejecutan el modelo en su propia máquina.
- Prototipado de agentes conversacionales con API OpenAI-compatible: llama-server expone `/v1/chat/completions`, lo que facilita integrar el modelo en pipelines existentes sin reescribir el cliente.

## Benchmarks y rendimiento

La model card proporciona métricas propias de evaluación del ajuste, no benchmarks académicos estándar:

| Métrica | LFM3-Omni-2B-RP | LFM3-Omni-2B-RP-LowRefusal | Base |
|---|---|---|---|
| Rechazos en 100 peticiones dañinas (keyword) | 11 | 5 | 99 |
| Rechazos en 100 peticiones dañinas (classifier) | 17 | 7 | 98 |
| Tasa de victoria en juicio de roleplay vs base | 61,5% | 49,0% | — |
| Rechazos fuera de personaje en 300 respuestas de rol | 0 | 0 | — |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. El autor advierte que, en pruebas manuales, la variante principal rechaza con más frecuencia de lo que sugiere la cifra de 11/100.

## Requisitos de hardware

- VRAM estimada: Q4_K_M ~1,10 GB; Q6_K ~1,43 GB; Q8_0 ~1,85 GB; BF16 GGUF ~3,47 GB; más el proyector multimodal (0,51 GB en Q8_0 o 0,95 GB en BF16).
- Checkpoint completo en Transformers BF16: 4,3 GB de pesos; requiere GPU con al menos ~6-8 GB de VRAM para inferencia cómoda.
- GPU recomendadas: cualquier GPU consumer moderna (RTX 3060 12 GB, RTX 4060, RTX 4090) para las cuantizaciones GGUF; A100 o H100 no son necesarias dado el tamaño, pero son válidas para servir en BF16.
- Cabe en GPU consumer y en dispositivos de gama baja: la cuantización Q4_K_M está pensada para teléfonos y máquinas con poca RAM.
- Opciones de despliegue: llama.cpp (llama-server, llama-mtmd-cli, llama-tts) con versión b11960 o superior; Transformers para el checkpoint BF16.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Multimodalidad | Licencia | Enfoque |
|---|---|---|---|---|---|
| LFM3-Omni-2B-RP | 2,17 B | 8K entrenado / 32K base | Imagen, audio, voz | lfm1.0 | Roleplay sin censura |
| LiquidAI/LFM3-Omni-2B (base) | 2,17 B | 32K | Imagen, audio, voz | lfm1.0 | Asistente general multimodal |
| LFM3-Omni-2B-RP-LowRefusal | 2,17 B | 8K entrenado / 32K base | Imagen, audio, voz | lfm1.0 | Roleplay con menos rechazos |

No se dispone de datos de benchmarks comparativos con otras familias de modelos en la información proporcionada.

## Limitaciones y advertencias

- Contenido para adultos: el modelo genera ficción explícita, violenta u ofensiva; el autor declara la responsabilidad del usuario sobre lo generado.
- El contenido sexual con menores fue filtrado del dataset de entrenamiento; el autor pide explícitamente no intentar producirlo.
- Sesgos conocidos: no documentados en la información disponible, pero un modelo sin censura puede reproducir sesgos presentes en sus datos.
- Riesgo de alucinación: no cuantificado; al ser un modelo de 2B parámetros y no razonador, la fiabilidad factual es limitada.
- Idioma: solo inglés; no hay soporte multilingüe declarado.
- Contexto: entrenado con conversaciones de hasta 8K tokens; superar ese límite puede degradar la coherencia.
- Licencia lfm1.0: es una licencia "other" con términos propios; es imprescindible revisar el archivo LICENSE antes de cualquier uso comercial.
- El modelo es no razonador: requiere `--reasoning off` en llama.cpp; cada respuesta empieza con `<think></think>` vacío.
- La ablación de rechazos es ligera; el autor reconoce que en la práctica rechaza más de lo que indican las métricas.
- El GGUF solo contiene el modelo de lenguaje; para imagen, audio y voz se necesita el archivo `mmproj` correspondiente.

## Enlaces

- Hugging Face: https://huggingface.co/ragraph-ai/LFM3-Omni-2B-RP
- Variante LowRefusal: https://huggingface.co/ragraph-ai/LFM3-Omni-2B-RP-LowRefusal
- Modelo base: https://huggingface.co/LiquidAI/LFM3-Omni-2B
- Heretic (herramienta de ablación): https://github.com/p-e-w/heretic
- llama.cpp: https://github.com/ggml-org/llama.cpp
