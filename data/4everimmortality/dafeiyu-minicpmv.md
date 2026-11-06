# 4everImmortality/dafeiyu-minicpmv

## Resumen

Dafeiyu V6 (大肥鱼 V6) es un ajuste fino del modelo multimodal MiniCPM-V-4.7-1B de OpenBMB, publicado por el usuario 4everImmortality. Se trata de un modelo de 1.006 millones de parametros orientado a image-text-to-text, entrenado para encarnar un personaje original (OC) tipo "vtuber" llamado Dafeiyu, una "chica ballena" de habla china. El modelo resuelve el problema de dotar de una personalidad consistente y un estilo de habla concreto a un modelo base pequeno, con capacidad de interpretar imagenes (fotogramas de video, imagenes adjuntas) y responder en chino e ingles.

El ajuste se realizo mediante un LoRA de rango 16 y alpha 32 sobre el modelo base fijado, con una tasa de aprendizaje de 1.8e-5 y calculo de perdida sobre todas las respuestas del asistente. El conjunto de entrenamiento consta de 1066 muestras y 146 de validacion, con dialogos de personaje agrupados por fuente y fotogramas de video reales con subtitulos. El resultado se distribuye principalmente en formato GGUF cuantizado Q4_K_M, pensado para ejecutarse en dispositivos de borde como una Jetson.

Su relevancia actual radica en que demuestra un flujo completo de personalizacion de un modelo multimodal pequeno para despliegue local en hardware limitado, con soporte de contexto largo (hasta 131072 tokens en pruebas con KV cache q4_0) y una integracion practica con llama.cpp mediante servidor compatible con la API de OpenAI.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (hereda la de MiniCPM-V-4.7-1B; detalles internos no disponibles) |
| Parametros totales | 1.006.209.856 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | hasta 131072 tokens en pruebas del autor (configuracion de llama.cpp); uso recomendado en el ejemplo con --ctx-size 4096 |
| Tipos de cuantizacion | Q4_K_M (GGUF); proyector visual en F16 (4x) |
| Idiomas soportados | chino (zh), ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (pesos principales y mmproj); repositorio de 2.2 GB |

## Arquitectura y entrenamiento

El modelo parte de MiniCPM-V-4.7-1B, un modelo multimodal de 1B parametros de OpenBMB que procesa imagen y texto. Sobre esa base se aplico un ajuste fino tipo LoRA con rango 16 y alpha 32, tasa de aprendizaje 1.8e-5, continuando desde un LoRA V2 previo sobre el mismo modelo base fijado. La perdida se calcula sobre todas las respuestas del asistente, no solo sobre un subconjunto.

El conjunto de datos de la version V6 contiene 1066 muestras de entrenamiento y 146 de validacion. Incluye dialogos de personaje con particion agrupada por fuente (para evitar fuga entre train y validacion) y pares de fotogramas de video reales con sus subtitulos, lo que aporta capacidad de "grounding" visual. El autor documenta las versiones exactas del modelo base y del commit de llama.cpp utilizado en un manifiesto (`bundle.json`) con tamanos y hashes SHA-256. No se dispone de informacion sobre el volumen total de tokens de entrenamiento ni sobre el uso de RLHF o DPO.

## Capacidades

- Generacion de texto conversacional con una personalidad de personaje consistente (estilo "vtuber", uso de pronombres y apelativos concretos segun el contexto).
- Comprension de imagen y texto (image-text-to-text): interpreta fotogramas de video e imagenes adjuntas en el mensaje del usuario.
- Roleplay multi-turno con una tarjeta de personaje de 88 caracteres como mensaje de sistema.
- Respuesta a comentarios, mensajes directos, publicaciones y respuestas a video, segun el caso de uso declarado por el autor.
- Soporte de modo "thinking" desactivable mediante `chat_template_kwargs.enable_thinking=false` en la plantilla de chat.
- Capacidad de contexto largo: en pruebas en Jetson con ventana de 131072 y KV cache q4_0 recibio 130.914 tokens y recupero un identificador situado al inicio.
- Integracion con servidor compatible con la API de OpenAI (Chat Completions) a traves de llama.cpp.
- Capacidades multilingues limitadas a chino e ingles.

## Casos de uso

- Atencion al cliente con personaje: el modelo puede gestionar conversaciones multi-turno manteniendo una voz de marca concreta, usando la tarjeta de personaje como system message y aprovechando su ventana de contexto para conservar el historial.
- Moderacion y respuesta de comentarios en redes: dado un comentario de texto o una captura, genera una respuesta con el tono del personaje, adecuado para flujos automatizados de comunidad.
- Generacion de respuestas a video: con fotogramas extraidos del video y sus subtitulos, el modelo produce una reaccion contextualizada, lo que encaja en pipelines de creacion de contenido.
- Despliegue en dispositivos de borde: al caber en formato Q4_K_M sobre una Jetson y ejecutarse con llama.cpp, sirve para asistentes locales sin dependencia de la nube.
- Prototipado de agentes conversacionales con vision: util para experimentar con tool calling a traves de la API compatible de OpenAI y validar arquitecturas de agente antes de escalar a modelos mayores.
- Demostraciones de VTuber o avatar interactivo: combinado con un motor de sintesis de voz (el autor menciona Genie completando una frase de voz no silenciosa), permite construir un personaje que ve y responde en tiempo real.
- Evaluacion de tecnicas de ajuste eficiente: sirve como referencia practica de LoRA de rango 16 sobre un modelo de 1B para investigadores que estudian personalizacion de modelos multimodales pequenos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K u otros) en la informacion disponible. El autor unicamente reporta una evaluacion cualitativa interna: en una prueba de seleccion sobre estaciones de trabajo, 20 de 32 respuestas designadas a videos independientes acertaron simultaneamente el hecho y la cita. No se proporcionan metricas numericas adicionales.

## Requisitos de hardware

- VRAM estimada para inferencia: el repositorio ocupa 2.2 GB y el peso principal se distribuye en Q4_K_M, por lo que la inferencia cabe holgadamente en GPUs con 4-6 GB de VRAM; el proyector visual en F16 anade una fraccion adicional.
- GPU recomendadas: cualquier GPU consumer moderna (RTX 3060, RTX 4060, RTX 4090) puede ejecutarlo con todas las capas en GPU (`--n-gpu-layers 99`). Tambien esta pensado para NVIDIA Jetson.
- Cabe en GPU consumer: si, en practicamente todas las GPU consumer con al menos 6 GB de VRAM.
- Opciones de despliegue: llama.cpp (con soporte para MiniCPM-V-4.7), mediante `llama-server` con `--model`, `--mmproj`, `--jinja` y `--alias`. El autor no menciona soporte verificado en vLLM, TGI u Ollama.
- Latencia y throughput: no disponible. El autor indica que la latencia del primer audio en navegador para streaming debe medirse en cada cadena concreta.
- Contexto largo: probado con 131072 tokens de ventana y KV cache q4_0 en Jetson, con recuperacion correcta de un identificador al inicio del contexto.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Dafeiyu V6 (este) | 1.006 M | hasta 131072 (probado) | Apache 2.0 | GGUF Q4_K_M | Ajuste de personaje sobre MiniCPM-V-4.7-1B |
| openbmb/MiniCPM-V-4.7-1B | 1.006 M | no disponible | no disponible | safetensors/GGUF | Modelo base multimodal de OpenBMB |
| Alternativas de 1B multimodales | no disponible | no disponible | no disponible | no disponible | No se dispone de datos comparables en la informacion proporcionada |

No se dispone de informacion suficiente para comparar con alternativas concretas de la misma categoria con datos verificables de rendimiento, contexto o disponibilidad.

## Limitaciones y advertencias

- El autor reconoce que en conversaciones multi-turno el modelo tiende a repetir o confundir el reparto de roles y contexto previo.
- En preguntas de conocimiento general ocasionalmente responde con seguridad pero de forma incorrecta, lo que implica riesgo de alucinacion.
- La evaluacion reportada es cualitativa y de muestra pequena (32 casos), no un benchmark estandar reproducible.
- El soporte de idiomas se limita a chino e ingles; no se declaran otros idiomas.
- El ajuste esta especializado en un unico personaje y estilo, por lo que su utilidad fuera de ese rol es limitada.
- La licencia Apache 2.0 permite uso comercial, pero el modelo base y sus condiciones deben verificarse por separado.
- El despliegue requiere una build de llama.cpp que soporte MiniCPM-V-4.7; versiones sin ese soporte no cargaran el modelo correctamente.
- El modo "thinking" debe desactivarse explicitamente para el uso conversacional normal.
- No se documentan sesgos especificos del ajuste; al heredar el modelo base, puede arrastrar los sesgos de este.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/4everImmortality/dafeiyu-minicpmv
- Modelo base: https://huggingface.co/openbmb/MiniCPM-V-4.7-1B
- Perfil del autor: https://huggingface.co/4everImmortality
- Repositorio personal del autor: https://github.com/4everImmortality/4everImmortality.github.io/blob/main/index.md
- Model card anterior (version de texto): https://huggingface.co/4everImmortality/dafeiyu-minicpmv/blob/ab82405603f501bdc123d0221d99b280d82a79e3/README.md
