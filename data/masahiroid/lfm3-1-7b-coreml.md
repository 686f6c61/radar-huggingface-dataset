# masahiroid/LFM3-1.7B-CoreML

## Resumen

LFM3-1.7B-CoreML es una conversión no oficial a formato Core ML del modelo LiquidAI/LFM3-1.7B, publicada por el usuario masahiroid. El modelo original, desarrollado por Liquid AI, es un transformer de 1.700 millones de parámetros con un contexto nativo de 256.000 tokens, pensado para ejecución en dispositivos. Esta conversión reimplementa el grafo como un modelo stateful de Core ML, de modo que la caché KV y los estados de las convoluciones cortas persisten entre llamadas y un único paquete sirve tanto para prefill como para decodificación.

El interés de esta ficha es práctico: permite ejecutar un modelo de lenguaje de 1,7B en iPhone, iPad y Mac sin dependencias de Python en tiempo de inferencia, usando las APIs nativas de Core ML. Se ofrecen dos variantes, int4 (0,9 GB) y fp16 (3,2 GB), con una ventana de contexto limitada a 2.048 tokens en esta compilación concreta, muy por debajo de los 256K del modelo original.

La verificación publicada por el autor es honesta y acotada: comparación de logits y de tokens greedy contra el modelo original en fp32 sobre Apple M2 Pro, con velocidades de decodificación de 20 a 28 tok/s en int4 y 22 tok/s en fp16. No se han medido el rendimiento en Neural Engine, el comportamiento en iPhone ni el rendimiento en contextos largos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con capas de atención (11) y convoluciones cortas (13 estados), grafo stateful de Core ML |
| Parametros totales | 1.700 millones (modelo base LFM3-1.7B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 2.048 tokens en esta compilación (el modelo original soporta 256K) |
| Tipos de cuantizacion | int4 (bloque de 32, simétrico) y fp16 |
| Idiomas soportados | inglés, japonés |
| Licencia | LFM Open License v1.0 (lfm1.0) |
| Formato de pesos | Core ML `.mlpackage` (int4: 0,9 GB; fp16: 3,2 GB) |

## Arquitectura y entrenamiento

El modelo base LFM3-1.7B es un transformer de Liquid AI con una combinación híbrida de capas: 11 capas de atención con caché KV y 13 estados de convolución corta, lo que explica los 35 buffers de estado que crea `make_state()` en Core ML. La conversión reimplementa el modelo en PyTorch (`lfm3_stateful.py`) y lo exporta con coremltools 9.0 sobre torch 2.7.1 y transformers 5.21, aprovechando `ct.StateType` para mantener el estado entre invocaciones. Esto evita recalcular el prompt en cada paso y permite un único paquete para prefill y decode.

No se dispone de información sobre el dataset de entrenamiento, el número de tokens, ni si hubo RLHF o DPO en el modelo original; esa información no está incluida en la model card de esta conversión. La innovación técnica destacable de esta ficha es la propia conversión: la gestión de estados (caché KV más convoluciones cortas) dentro de Core ML, la cuantización int4 con bloques de 32 y la verificación numérica contra el modelo original en fp32.

## Capacidades

- Generación de texto conversacional con plantilla de chat compatible con la del modelo original (`chat_template.jinja`).
- Razonamiento y respuesta a instrucciones en inglés y japonés.
- Inferencia en dispositivo en iOS 18 / macOS 15 o superior mediante Core ML.
- Prefill por fragmentos de hasta 128 tokens y decodificación token a token con estado persistente.
- Salida de logits para el último token de entrada, lo que permite integrar muestreo propio (greedy, top-k, top-p) en la aplicación.
- No se documenta soporte de tool calling, function calling, agentes, visión, audio ni modo thinking en esta conversión.

## Casos de uso

- Asistente conversacional offline en iOS: el paquete int4 de 0,9 GB cabe en la memoria de un iPhone moderno y permite conversaciones multi-turno sin conexión, manteniendo el estado entre turnos gracias al grafo stateful.
- Autocompletado y reescritura de texto en macOS: integrado en una app nativa mediante Core ML, con latencia de decodificación de 20 a 28 tok/s en M2 Pro, suficiente para sugerencias en tiempo real.
- Traducción y asistencia bilingüe inglés-japonés: el modelo está entrenado para ambos idiomas, lo que lo hace adecuado para herramientas de consulta o atención al usuario en esos mercados.
- Procesamiento de notas y documentos cortos: con 2.048 tokens de contexto puede resumir correos, mensajes o fragmentos de documentación en el propio dispositivo, sin enviar datos a la nube.
- Prototipado de apps de IA generativa en Apple Silicon: sirve como banco de pruebas para validar flujos de prefill/decode y gestión de estado antes de pasar a modelos mayores.
- Clasificación y etiquetado ligero de texto: usando los logits del último token se pueden construir clasificadores de intención o sentimiento con pocas clases, sin infraestructura de servidor.
- Educación y demos de inferencia local: útil para talleres sobre Core ML y modelos stateful, dado que el repositorio incluye scripts de conversión y verificación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible. La model card sí incluye una verificación numérica contra el modelo original en fp32:

| Variante | Coseno de logits (fin de prompt) | Tokens greedy idénticos al original | Velocidad de decodificación |
|---|---|---|---|
| fp16 | 0,999999 | 32/32 en ambos prompts | 22 tok/s |
| int4 | 0,975 - 0,983 | 20/32 y 32/32 (salidas coherentes) | 20 - 28 tok/s |

Medido en macOS sobre Apple M2 Pro con `CPU_AND_GPU`, dos prompts de 32 tokens. No se midió Neural Engine (`CPU_AND_NE`), velocidad ni memoria en iPhone, ni comportamiento con contextos superiores a 256 tokens.

## Requisitos de hardware

- VRAM/memoria unificada estimada: aproximadamente 0,9 GB para la variante int4 y 3,2 GB para fp16, más el estado (35 buffers) y el overhead de Core ML.
- Plataformas: iOS 18 o macOS 15 en adelante, por el requisito de `ct.StateType`.
- GPU recomendadas: Apple Silicon (M1, M2, M3, M4 y posteriores); el autor verificó en M2 Pro. No se documenta soporte en GPUs NVIDIA ni AMD.
- Cabe en hardware de consumo Apple: sí, tanto en Mac como presumiblemente en iPhone, aunque el rendimiento en iPhone no se ha medido.
- Opciones de despliegue: Core ML nativo (`coremltools`, `MLModel.predict` con `make_state()`); no se contemplan vLLM, llama.cpp, Ollama ni TGI para este formato.
- Latencia y throughput: 20-28 tok/s en int4 y 22 tok/s en fp16 sobre M2 Pro, con una implementación de atención no optimizada (atención enmascarada de longitud completa sobre la caché), por lo que hay margen de mejora.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| LFM3-1.7B-CoreML (esta ficha) | 1,7B | 2.048 (build) | Core ML | LFM Open License v1.0 | Conversión no oficial, stateful, iOS/macOS |
| LiquidAI/LFM3-1.7B | 1,7B | 256K | safetensors | LFM Open License v1.0 | Modelo original, requiere PyTorch/transformers |
| Otros modelos de ~1,7B en Core ML | no disponible | no disponible | Core ML | no disponible | No se dispone de datos comparables verificados en la información proporcionada |

## Limitaciones y advertencias

- Conversión no oficial: no es un lanzamiento de Liquid AI y no cuenta con su respaldo.
- Contexto limitado a 2.048 tokens en esta compilación, frente a los 256K del modelo original; para más longitud hay que recompilar con `conversion/convert.py <S>`.
- Las capas de ventana deslizante se implementan mediante enmascaramiento y solo se han validado con prompts cortos (32 tokens); el comportamiento en contextos largos no está medido.
- La cuantización int4 reduce la fidelidad de los logits (coseno 0,975-0,983) y puede producir divergencias en la decodificación greedy respecto al original.
- Solo inglés y japonés documentados; no se garantiza un rendimiento aceptable en castellano.
- Licencia LFM Open License v1.0: el uso comercial no está licenciado para entidades legales con ingresos anuales de 10 millones de dólares o más.
- No se ha medido el rendimiento ni el consumo de memoria en iPhone, ni la ejecución en Neural Engine.
- La velocidad de decodificación procede de una implementación de atención sin optimizar; en producción conviene optimizarla.
- Riesgo de alucinación inherente a un modelo de 1,7B; no se recomienda para tareas que exijan alta fiabilidad factual sin verificación.
- No se documentan sesgos específicos del modelo base en la información disponible.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/masahiroid/LFM3-1.7B-CoreML
- Modelo base: https://huggingface.co/LiquidAI/LFM3-1.7B
- Licencia LFM Open License v1.0: incluida en el repositorio como `LICENSE`
- Scripts de conversión y verificación: carpeta `conversion/` del repositorio (incluye `lfm3_stateful.py`, `convert.py` y scripts de verificación)
- coremltools: https://github.com/apple/coremltools
- Documentación de Core ML `StateType`: no disponible en la información proporcionada
