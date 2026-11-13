# chetankerhalkar/talkfixai-small-gguf

## Resumen

TalkFixAI small es un conjunto de tres ficheros GGUF publicados por el usuario chetankerhalkar para el motor llama.cpp de la aplicación TalkFixAI. No se trata de un modelo entrenado desde cero, sino de derivados cuantizados de dos modelos base distintos: un modelo conversacional basado en google/gemma-3-1b-it (1B parámetros, instruction-tuned) con un ajuste LoRA fusionado, y un modelo de descripción visual basado en LiquidAI/LFM2.5-VL-450M (modelo visión-lenguaje ligero de Liquid AI) con LoRA fusionado y un proyector multimodal separado. El repositorio ocupa 1,1 GB e incluye pesos en formato GGUF listos para inferencia en dispositivo.

El interés del paquete es fundamentalmente práctico: demuestra un patrón de despliegue on-device con llama.cpp que separa el modelo de conversación del modelo de percepción visual, permitiendo cargar solo el componente necesario y usar un proyector multimodal en Q8 junto a un lenguaje en Q4_K_M. Es un ejemplo de integración de modelos pequeños (sub-1B) para asistentes de reparación con entrada de cámara.

La información pública es escasa: cero descargas, cero likes, sin pipeline declarado, sin idiomas indicados y con licencia "other" que remite a las licencias de los modelos base (Gemma Terms of Use y LFM Open License v1.0). El número de parámetros reportado en safetensors (354.483.968) corresponde al componente LFM2.5-VL-450M, no al modelo conversacional de 1B.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible (derivados de Gemma 3 1B y LFM2.5-VL-450M; el repositorio solo distribuye GGUF) |
| Parametros totales | 354.483.968 (reportado en safetensors, correspondiente a LFM2.5-VL-450M); el modelo conversacional deriva de Gemma 3 1B |
| Parametros activos | No disponible (no se indica que los modelos base sean MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | Q4_K_M (modelo de conversación y parte de lenguaje del de cámara), Q8 (proyector multimodal) |
| Idiomas soportados | No disponible |
| Licencia | other (Gemma Terms of Use para tfai_talk_q4km.gguf; LFM Open License v1.0 para tfai_camera.gguf y tfai_camera_mmproj.gguf) |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

El repositorio no contiene pesos en safetensors ni documentación de arquitectura propia: distribuye únicamente ficheros GGUF. El modelo conversacional `tfai_talk_q4km.gguf` deriva de google/gemma-3-1b-it, un transformer decoder-only instruction-tuned de la familia Gemma 3, al que se le ha fusionado un ajuste LoRA y posteriormente se ha cuantizado a Q4_K_M. El modelo de cámara se compone de dos ficheros: `tfai_camera.gguf`, que contiene la parte de lenguaje de LiquidAI/LFM2.5-VL-450M con un LoRA fusionado en Q4_K_M, y `tfai_camera_mmproj.gguf`, el proyector visión-lenguaje en Q8 que conecta el encoder visual con el modelo de lenguaje.

No se especifican en la información disponible el número de tokens de entrenamiento, la composición del dataset del ajuste LoRA, ni si se emplearon técnicas de RLHF o DPO. Tampoco se detalla la innovación arquitectónica de los modelos base (Gemma 3 y LFM2.5-VL), más allá de que el segundo es un modelo visión-lenguaje de 450M parámetros. El ajuste LoRA está orientado a tareas concretas: conversación para la app TalkFixAI y descripción de fotogramas de cámara para un asistente de reparación.

## Capacidades

- Generación de texto conversacional multi-turno mediante el modelo derivado de Gemma 3 1B (etiquetado como "conversational" en Hugging Face).
- Descripción de imágenes de cámara: el modelo `tfai_camera` responde a un único prompt, "Describe this camera frame for a repair assistant.", con tres líneas estructuradas: `SEES:`, `TEXT:` y `HAZARD:`.
- Percepción visual como ayuda al diagnóstico: identificación de texto visible en la escena y aviso de peligros (con limitaciones explícitas, ver sección de limitaciones).
- Inferencia on-device mediante llama.cpp, con soporte de cuantización Q4_K_M y Q8.
- Compatibilidad declarada con endpoints (tag `endpoints_compatible` en Hugging Face).
- No se documenta soporte de tool calling, function calling, agentes multi-paso, modo thinking ni capacidades de audio en la información disponible.
- Capacidades multilingües: no disponibles (no se declaran idiomas en la ficha).

## Casos de uso

- Asistente de reparación en dispositivo: la app TalkFixAI carga `tfai_talk_q4km.gguf` en llama.cpp para mantener conversaciones guiadas con el usuario sobre el problema a reparar, sin depender de conectividad ni de servidores externos.
- Diagnóstico visual de averías: el usuario enfoca la cámara a un componente y `tfai_camera.gguf` junto con `tfai_camera_mmproj.gguf` genera las líneas `SEES:`, `TEXT:` y `HAZARD:` para orientar la reparación y señalar riesgos visibles.
- Lectura de etiquetas y serigrafías: la línea `TEXT:` permite extraer texto visible en placas, etiquetas o pantallas de equipos, útil en manuales de mantenimiento o identificación de modelos.
- Detección de advertencias de seguridad en campo: la línea `HAZARD:` sirve como primera señal de peligro (cables expuestos, componentes calientes) antes de manipular un equipo, siempre como ayuda y no como dispositivo de seguridad certificado.
- Despliegue en hardware de bajos recursos: al usar cuantización Q4_K_M y modelos de 450M–1B, el paquete puede ejecutarse en dispositivos con poca memoria, incluyendo móviles o placas embebidas, mediante llama.cpp.
- Prototipado de pipelines multimodales con llama.cpp: el par lenguaje + mmproj en cuantizaciones distintas (Q4_K_M y Q8) sirve como referencia para integrar visión en aplicaciones llama.cpp existentes.
- Base para ajustes LoRA específicos de dominio: el patrón de fusionar un LoRA sobre un modelo base pequeño y cuantizarlo a GGUF es replicable para otros dominios verticales (fontanería, electricidad, automoción).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: el repositorio completo ocupa 1,1 GB; el modelo conversacional Q4_K_M de 1B ronda unos 0,7–0,8 GB en disco, y el par de cámara (Q4_K_M + proyector Q8) se mantiene por debajo de 0,5 GB. La memoria necesaria para inferencia es del orden de 1–2 GB según contexto y backend.
- GPU recomendadas: no se especifican. Por tamaño, cualquier GPU consumer con 4 GB o más (GTX 1650, RTX 3050, RTX 4060) es suficiente; también iGPU y CPU.
- Cabe en GPU consumer: sí, con amplio margen, dado el tamaño sub-1B de ambos componentes.
- Opciones de despliegue: llama.cpp (motor declarado por la app), y por compatibilidad de formato GGUF, otros runners basados en llama.cpp como Ollama o servidores compatibles con GGUF. No se confirma soporte de vLLM ni TGI en la información disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| TalkFixAI small (este repo) | ~1B (conversación) + 450M (visión) | No disponible | GGUF | Other (Gemma Terms / LFM Open License v1.0) | Paquete de dos modelos con LoRA fusionado para app de reparación |
| google/gemma-3-1b-it | 1B | No disponible en esta ficha | Safetensors, GGUF | Gemma Terms of Use | Modelo base del componente conversacional |
| LiquidAI/LFM2.5-VL-450M | 450M | No disponible en esta ficha | No disponible en esta ficha | LFM Open License v1.0 | Modelo base del componente de cámara |
| Qwen2.5-VL-3B-Instruct | 3B | No disponible en esta ficha | Safetensors, GGUF | Apache 2.0 (según el modelo original) | Alternativa visión-lenguaje mayor, más costosa en dispositivo |

## Limitaciones y advertencias

- El modelo de cámara es una ayuda a la percepción, no un dispositivo de seguridad: la propia model card advierte que "misses hazards" (pasa por alto peligros). No debe usarse como única barrera de seguridad.
- El modelo de cámara responde a un único prompt fijo; no es un asistente visual general y su comportamiento fuera de ese prompt no está documentado.
- Riesgo de alucinación inherente a modelos pequeños (1B y 450M) y a la cuantización Q4_K_M, especialmente en la línea `TEXT:` al leer texto de imágenes.
- No se declaran idiomas soportados; el comportamiento multilingüe es desconocido y no debe asumirse.
- Licencia "other" con obligaciones heredadas: el uso comercial queda sujeto a Gemma Terms of Use y LFM Open License v1.0. Es necesario revisar ambas antes de redistribuir o integrar en productos.
- Sin descargas ni validación comunitaria (0 descargas, 0 likes), sin pipeline declarado y sin benchmarks: la calidad real del ajuste LoRA no está verificada de forma independiente.
- El repositorio mezcla dos modelos base con licencias distintas; cualquier redistribución debe mantener la atribución y las condiciones de cada fichero por separado.
- No hay información sobre longitud de contexto efectiva tras el ajuste, lo que limita el diseño de conversaciones largas.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/chetankerhalkar/talkfixai-small-gguf
- Modelo base conversacional: https://huggingface.co/google/gemma-3-1b-it
- Modelo base de visión: https://huggingface.co/LiquidAI/LFM2.5-VL-450M
- Términos de uso de Gemma: https://ai.google.dev/gemma/terms
- Licencia LFM Open License v1.0: no disponible en la información proporcionada (referenciada en la model card)
- llama.cpp: https://github.com/ggml-org/llama.cpp
