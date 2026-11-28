# litert-community/Falcon-H1-1.5B-Deep-Instruct

## Resumen

Falcon-H1-1.5B-Deep-Instruct es un modelo de lenguaje de 1.500 millones de parámetros desarrollado por el Instituto de Innovación Tecnológica (TII) de Abu Dabi. Pertenece a la familia Falcon-H1, que introduce una arquitectura híbrida en la que cada capa ejecuta en paralelo una rama de atención con grouped-query attention (GQA) y una rama de exploración selectiva Mamba2, sumando ambas salidas sobre la misma entrada. Esta ficha concreta corresponde a la conversión al formato LiteRT-LM (`.litertlm`) publicada por la comunidad `litert-community`, pensada para inferencia en dispositivo (*on-device*) con el runtime LiteRT-LM de Google.

La variante "Deep" del modelo intercambia anchura por profundidad: mantiene un tamaño de capa oculto de 1280 pero apila 66 capas, lo que da lugar a 264 buffers de estado (132 de convolución/SSM y 132 de caché KV). Es el tamaño de Falcon-H1 con mayor número de estados recurrentes, un dato relevante para quienes planifiquen despliegues con gestión de memoria ajustada.

El modelo es relevante ahora porque demuestra que es viable ejecutar un transformer híbrido con ramas Mamba2 en hardware de consumo y móvil mediante cuantización int8 dinámica y el runtime LiteRT-LM, con velocidades de decodificación medidas en dispositivos como el iPhone 17 Pro (16,5 tok/s en GPU Metal) o una Raspberry Pi 5 (2,0 tok/s en CPU). La conversión conserva el tokenizador y la plantilla de chat ChatML de Falcon-H1, y mantiene una correspondencia de logits prácticamente exacta con el modelo original en PyTorch.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer híbrido: atención GQA y Mamba2 en paralelo por capa |
| Parámetros totales | 1.500 millones (aproximado, según denominación del modelo) |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible en la información proporcionada (firmas de prefill exportadas de 1 a 1024 tokens) |
| Tipos de cuantización | int8 dinámico en capas lineales y embedding; convoluciones y exploración SSM en float; activaciones fp32 declaradas para GPU |
| Idiomas soportados | No disponible |
| Licencia | Falcon-LLM License (términos en falconllm.tii.ae) |
| Formato de pesos | `.litertlm` (LiteRT-LM); fichero `Falcon-H1-1.5B-Deep-Instruct_int8.litertlm` de 1,83 GB |

## Arquitectura y entrenamiento

Falcon-H1 emplea un diseño totalmente híbrido: cada una de las 66 capas procesa la entrada simultáneamente mediante una rama de atención con grouped-query attention y una rama Mamba2 de exploración selectiva, cuyas salidas se suman. Como consecuencia, cada capa mantiene tanto una caché KV como un estado recurrente de tamaño constante (convolución + SSM), lo que se traduce en 264 buffers de estado en esta variante Deep (132 de convolución/SSM y 132 de caché KV). El tamaño de capa oculto es de 1280, y la profundidad de 66 capas es la mayor de la familia Falcon-H1.

La información disponible no detalla el volumen de tokens de entrenamiento, la composición del dataset ni si se aplicaron etapas de RLHF o DPO sobre el modelo base. La conversión a LiteRT-LM aplica una cuantización int8 dinámica sobre las capas lineales y el embedding, dejando las convoluciones y la exploración SSM en coma flotante, y declara activaciones fp32 para la ruta GPU. Se exportan firmas de prefill de múltiples longitudes (1 a 1024) para que el runtime seleccione fragmentos ajustados, y el fichero incluye el tokenizador y la plantilla de chat ChatML estándar de Falcon-H1. La validación reportada incluye coincidencia de logits con PyTorch (top-1 y top-5 idénticos en 48 posiciones de decodificación, correlación media 1,0000, KL ≈ 0) y una prueba de cordura de 8 preguntas con 8/8 aciertos en todas las configuraciones probadas.

## Capacidades

- Generación de texto conversacional multi-turno con plantilla ChatML.
- Razonamiento aritmético básico y respuesta a preguntas factuales (validado en pruebas de cordura como "¿cuál es la capital de Francia?" o "¿cuánto es 17 por 23?").
- Inferencia en dispositivo (*on-device*) en Android, iOS (Metal) y Linux embebido (Raspberry Pi 5) mediante LiteRT-LM.
- Ejecución en CPU y GPU dentro del mismo runtime, con selección de backend por línea de comandos.
- Soporte de prefill fragmentado en longitudes de 1 a 1024 tokens para optimizar el uso de memoria.
- Capacidad multilingüe: no disponible en la información proporcionada.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Modo thinking, visión o audio: no disponible en la información proporcionada.

## Casos de uso

- Asistentes conversacionales sin conexión en aplicaciones móviles: el modelo se ejecuta íntegramente en el dispositivo con LiteRT-LM, lo que permite mantener conversaciones privadas sin enviar datos a la nube. En un iPhone 17 Pro alcanza 16,5 tok/s de decodificación en GPU Metal con 1,19 s de TTFT, suficiente para respuestas interactivas.
- Respuesta a preguntas factuales y aritmética sencilla en asistentes de bolsillo: la prueba de cordura de 8 preguntas con 8/8 aciertos en todas las configuraciones (GPU y CPU, LiteRT-LM 0.15.0 y 0.16.0) respalda su uso en tareas de conocimiento general y cálculo básico.
- Automatización en dispositivos IoT y edge computing: en una Raspberry Pi 5 con CPU de 4 hilos el modelo decodifica a 2,0 tok/s con 25 tok/s de prefill, lo que permite integrarlo en paneles de control, domótica o terminales de consulta donde no hay GPU disponible.
- Prototipado rápido de aplicaciones de IA generativa en Android: la ruta GPU con delegación completa (10.451 operaciones delegadas en Galaxy S26) y 6,0 tok/s de decodificación permite validar experiencias de usuario en hardware de consumo antes de escalar a la nube.
- Evaluación de arquitecturas híbridas Mamba2 + atención en entornos de investigación: al conservar la correspondencia de logits con el modelo PyTorch original (KL ≈ 0), sirve como banco de pruebas para estudiar el comportamiento de modelos híbridos cuantizados sin necesidad de infraestructura de servidor.
- Procesamiento de prompts de hasta 1024 tokens en el propio dispositivo: las firmas de prefill exportadas permiten tareas como resumen de notas, clasificación de texto o extracción de información de documentos cortos sin salir del terminal.
- Despliegue en entornos con requisitos de privacidad estrictos: al no requerir conexión externa, encaja en escenarios sanitarios, legales o industriales donde los datos no pueden abandonar el dispositivo.

## Benchmarks y rendimiento

La información disponible no incluye resultados de benchmarks académicos estándar (MMLU, HumanEval, GSM8K). Sí se reportan métricas de rendimiento en inferencia:

| Plataforma | Backend | Prefill (tok/s) | Decodificación (tok/s) | TTFT | Memoria pico |
|---|---|---|---|---|---|
| Apple M4 Max (benchmark, 256/256) | GPU | 1134 | 51,7 | 0,25 s | No disponible |
| Apple M4 Max (benchmark, 256/256) | CPU | 192 | 22,7 | 1,38 s | No disponible |
| iPhone 17 Pro | GPU (Metal) | 140,3 | 16,5 | 1,19 s | 4,89 GB |
| iPhone 17 Pro | CPU | 103,2 | 9,9 | 1,53 s | 1,74 GB |
| Galaxy S26 | GPU | 121 | 6,0 | 1,92 s | No disponible |
| Galaxy S26 | CPU | 103 | 12,0 | 2,14 s | No disponible |
| Raspberry Pi 5 (4 hilos) | CPU | 25 | 2,0 | 10,90 s | No disponible |

Pruebas de corrección: coincidencia de logits con PyTorch en 48 posiciones de decodificación (top-1 y top-5 idénticos, correlación media 1,0000, KL ≈ 0); prueba de cordura de 8 preguntas con 8/8 aciertos en todas las configuraciones; barrido de robustez de longitud de prompt con rellenos de 12 a 51 en CPU y de 12 a 31 en GPU sin degeneración.

## Requisitos de hardware

- VRAM/RAM estimada: el fichero int8 ocupa 1,83 GB. En iPhone 17 Pro la memoria pico medida es de 4,89 GB en GPU (activaciones fp32) y 1,74 GB en CPU.
- GPU recomendadas: no se especifican modelos de GPU de servidor; la información disponible se centra en GPU integradas y móviles (Metal en Apple, GPU de Galaxy S26).
- Compatibilidad con GPU de consumo: el modelo está pensado para dispositivos móviles y edge; no se reportan pruebas en RTX 4090, A100 o H100.
- Opciones de despliegue: LiteRT-LM (versión ≥ 0.15; se recomienda ≥ 0.20.0 por la corrección del bug de reutilización de estado entre conversaciones, commit e1f86b05 del 3 de noviembre de 2026). No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: ver tabla de benchmarks. En Apple M4 Max la GPU alcanza 1134 tok/s de prefill y 51,7 tok/s de decodificación; en Raspberry Pi 5 la decodificación cae a 2,0 tok/s con TTFT de 10,90 s.
- Nota de memoria: la ruta GPU utiliza activaciones fp32 y, por tanto, consume un múltiplo de memoria respecto a la CPU.
- Nota de rendimiento: la profundidad de 66 capas penaliza la decodificación, ya que implica 66 pasos secuenciales por token.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato | Licencia | Enfoque |
|---|---|---|---|---|---|
| Falcon-H1-1.5B-Deep-Instruct (esta ficha) | 1,5 B | No disponible | `.litertlm` int8 | Falcon-LLM License | On-device, híbrido Mamba2 + atención, 66 capas |
| Falcon-H1-1.5B-Instruct (litert-community) | 1,5 B | No disponible | `.litertlm` | Falcon-LLM License | On-device, híbrido, variante estándar (no Deep) |
| Falcon-H1-3B-Instruct (litert-community) | 3 B | No disponible | `.litertlm` | Falcon-LLM License | On-device, híbrido, mayor tamaño |
| Falcon-H1-0.5B-Instruct (litert-community) | 0,5 B | No disponible | `.litertlm` | Falcon-LLM License | On-device, híbrido, menor tamaño |

La información disponible no incluye comparaciones de rendimiento frente a modelos de otros fabricantes (Llama, Qwen, Gemma) en la misma categoría.

## Limitaciones y advertencias

- Bug conocido de reutilización de estado: en LiteRT-LM 0.18.0, el runtime inicia una nueva conversación sobre un Engine que ya ejecutó otra, reutilizando tokens de prompt compartidos y sin reiniciar el estado recurrente. Se recomienda crear un Engine nuevo por conversación o actualizar a LiteRT-LM ≥ 0.20.0, que incluye la corrección (commit e1f86b05). El modelo no fue probado con Engine compartido en v0.20.0.
- La ruta GPU emplea activaciones fp32 y consume bastante más memoria que la CPU (4,89 GB frente a 1,74 GB en iPhone 17 Pro).
- La profundidad de 66 capas limita la velocidad de decodificación; en hardware modesto como Raspberry Pi 5 se obtienen 2,0 tok/s.
- Requiere LiteRT-LM ≥ 0.15; no es compatible con runtimes estándar de Hugging Face Transformers, vLLM o llama.cpp sin conversión adicional.
- Licencia Falcon-LLM License: es necesario revisar los términos en falconllm.tii.ae antes de un uso comercial; la model card la etiqueta como "other".
- No se dispone de información sobre sesgos, tasas de alucinación ni cobertura idiomática; al ser un modelo de 1,5 B parámetros, es esperable una capacidad limitada en razonamiento complejo y conocimiento factual extenso, aunque no se aportan datos concretos.
- El modelo está orientado a texto; no se documentan capacidades multimodales, tool calling ni modo de razonamiento extendido.
- El repositorio tiene 310 descargas y 0 likes en el momento de la consulta, lo que indica una adopción todavía muy limitada y poca validación por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/litert-community/Falcon-H1-1.5B-Deep-Instruct
- Modelo base: https://huggingface.co/tiiuae/Falcon-H1-1.5B-Deep-Instruct
- Runtime LiteRT-LM: https://github.com/google-ai-edge/litert-lm
- Release LiteRT-LM v0.20.0: https://github.com/google-ai-edge/LiteRT-LM/releases/tag/v0.20.0
- Corrección del bug de estado compartido (commit): https://github.com/google-ai-edge/LiteRT-LM/commit/e1f86b05bf8a731331622a2622440e9f93d9a9f5
- Informe del problema de Engine compartido: https://github.com/google-ai-edge/LiteRT-LM/issues/3165
- Ficha de compatibilidad edge: https://github.com/john-rocky/edge-compat/blob/main/cards/falcon-h1-1.5b-deep-instruct-int8/CARD.md
- Conversiones relacionadas: https://huggingface.co/litert-community/Falcon-H1-0.5B-Instruct, https://huggingface.co/litert-community/Falcon-H1-1.5B-Instruct, https://huggingface.co/litert-community/Falcon-H1-3B-Instruct
- Términos de licencia Falcon: https://falconllm.tii.ae/falcon-terms-and-conditions.html
