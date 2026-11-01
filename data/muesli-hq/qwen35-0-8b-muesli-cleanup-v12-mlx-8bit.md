# Muesli-HQ/qwen35-0.8b-muesli-cleanup-v12-mlx-8bit

## Resumen

Muesli Cleanup Lite v4 es un modelo de limpieza de dictado diseñado para ejecutarse en local dentro de Muesli, una aplicación de dictado para macOS. Se trata de un ajuste fino mediante LoRA del modelo base Qwen/Qwen3.5-0.8B, con 752.393.024 parámetros totales, que recibe la salida cruda de un sistema de reconocimiento de voz (y opcionalmente contexto de la aplicación en pantalla) y devuelve el texto corregido: elimina muletillas, aplica autocorrecciones dictadas, corrige errores evidentes de reconocimiento y formatea listas.

El modelo no es un transcriptor: es un post-procesador. Su relevancia radica en que aborda un problema muy concreto de los flujos de dictado en producción, donde el ASR introduce errores, repeticiones y puntuación inconsistente. Al estar cuantizado en 8 bits para MLX, está pensado para inferencia nativa en Apple Silicon mediante MLX-Swift-LM, con latencias de décimas de segundo en un M5.

La ficha corresponde al checkpoint v12 (no al v13), empaquetado en formato MLX con cuantización afín de 8 bits y tamaño de grupo 64. La licencia es Apache 2.0 y el único idioma soportado es el inglés.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (derivada de Qwen3.5-0.8B), ajuste fino LoRA fusionado |
| Parametros totales | 752.393.024 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (limite de generacion: 1.024 tokens nuevos) |
| Tipos de cuantizacion | 8-bit affine, group size 64 (MLX) |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (MLX, `model.safetensors`, 799.973.748 bytes) |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3.5-0.8B, un transformer decoder-only de aproximadamente 0,75 mil millones de parámetros, y se ajusta mediante LoRA de rango 16 con Unsloth durante 1 época, calculando la pérdida únicamente sobre la respuesta y fusionando después los adaptadores en los pesos base. El resultado se cuantiza a 8 bits en formato afín de MLX con tamaño de grupo 64 para su uso con MLX-Swift-LM.

El conjunto de entrenamiento, denominado `blend-v12`, contiene 155.081 pares de limpieza que cubren correo electrónico, chat, documentos, prompts para agentes de IA, código, hojas de cálculo y presentaciones, cuadros de búsqueda y dictados largos. Aproximadamente el 20 % de las filas incluyen contexto de pantalla. Los pares fueron generados por modelos abiertos alojados en Fireworks y filtrados por un modelo juez. El prompt de entrenamiento es estricto: un único turno de usuario sin mensaje de sistema, plantilla construida manualmente con `<|im_start|>`, bloque `<think>` vacío y decodificación greedy con parada en `<|im_end|>`.

## Capacidades

- Limpieza de transcripciones de voz: corrección de errores evidentes de reconocimiento, eliminación de muletillas (um, uh, like) y aplicación de autocorrecciones del tipo "scratch that" o "no wait".
- Formateo de listas numeradas o con viñetas cuando el dictado lo indica explícitamente.
- Adaptación del estilo de puntuación al contexto de la aplicación de destino.
- Uso opcional de contexto de pantalla (`<APP-CONTEXT>`): aplicación enfocada, nombre del campo, texto seleccionado y texto OCR, limitado a 1.200 caracteres, para resolver nombres, acrónimos y errores de transcripción.
- Preservación del texto ya correcto: el modelo devuelve la entrada sin cambios cuando no detecta errores.
- Generación de texto autoregresiva estándar (pipeline `text-generation`), aunque su uso previsto es exclusivamente la limpieza de dictado.
- No soporta tool calling, agentes multi-paso, visión ni audio de forma nativa; el contexto de pantalla llega como texto en el prompt.

## Casos de uso

- Dictado en aplicaciones de correo: el modelo recibe la transcripción cruda del ASR junto con el nombre del campo enfocado y devuelve el texto con puntuación y estilo adecuados, sin reformular la frase dictada.
- Mensajería y chat: limpieza de mensajes cortos dictados, eliminando muletillas y corrigiendo nombres propios gracias al bloque de contexto de la aplicación activa.
- Prompts para agentes de IA: el conjunto de entrenamiento incluye prompts dictados, por lo que puede normalizar la transcripción de instrucciones largas antes de enviarlas a un agente, manteniendo la formulación original del usuario.
- Documentos y edición de texto largo: con entradas de unas 289 palabras, la latencia medida es de 3,37 s de mediana en un M5, adecuada para dictados de párrafos completos.
- Hojas de cálculo y presentaciones: formateo de listas dictadas y corrección de términos técnicos usando el contexto del campo enfocado.
- Cuadros de búsqueda: limpieza de consultas cortas dictadas, donde la latencia en caliente es de 0,223 s de mediana y 0,306 s en el percentil 90 (60 entradas cortas).
- Integración en pipelines de dictado en local: al ser un modelo de 0,8 GB en 8 bits, puede ejecutarse en el dispositivo sin enviar audio ni texto a la nube, lo que resulta relevante para aplicaciones con requisitos de privacidad.

## Benchmarks y rendimiento

Evaluación nativa en Swift con MLX 8-bit, realizada el 2026-10-26 con los prompts de entrenamiento sin modificar y decodificación greedy. Los valores son tasas de error de palabra (WER) frente a la limpieza objetivo, no porcentajes de coincidencia exacta.

| Conjunto de evaluacion | WER |
|---|---|
| Screen-context 400 | 8,92 % |
| Plain 512 | 1,57 % |
| New categories A 309 | 2,93 % |
| New categories B 284 | 2,57 % |
| Realism 310 | 3,70 % |

Latencia medida en un Mac de desarrollo con Apple M5 y otras aplicaciones activas, excluyendo la carga del modelo: mediana en caliente de 0,223 s y p90 de 0,306 s sobre 60 entradas cortas; 0,31 s tras 30 segundos de inactividad; mediana de 3,37 s sobre 21 entradas largas de aproximadamente 289 palabras. El autor advierte que estos conjuntos son benchmarks creados por el propio autor y no una prueba ciega de aceptación con usuarios reales.

## Requisitos de hardware

- VRAM/unified memory estimada: el repositorio ocupa 0,8 GB y los pesos pesan 799.973.748 bytes en 8 bits, por lo que la inferencia requiere aproximadamente 1 GB de memoria unificada, más el espacio para el contexto.
- Hardware objetivo: Apple Silicon con MLX; el autor reporta mediciones en un Apple M5. No se proporcionan datos para GPU NVIDIA ni AMD.
- Cabe en hardware de consumo: sí, en cualquier Mac con Apple Silicon, dado el tamaño del modelo.
- Opciones de despliegue: MLX-Swift-LM 3.32.3 con Hugging Face Swift tokenizers 1.3.2 para uso nativo en Swift. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Detalle de integración: para esa versión del tokenizador hay que aliasar `Qwen3_5Tokenizer` a `Qwen2Tokenizer` en memoria, establecer `clean_up_tokenization_spaces=false` y codificar el prompt con `addSpecialTokens=false` sin aplicar plantilla de chat.
- Latencia y throughput: mediana de 0,223 s en entradas cortas y 3,37 s en entradas de ~289 palabras en un M5; no se publica throughput en tokens por segundo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Enfoque |
|---|---|---|---|---|---|
| Muesli Cleanup Lite v4 (este) | 752.393.024 | no disponible | Apache 2.0 | MLX 8-bit safetensors | Limpieza de dictado en ingles, on-device |
| Qwen/Qwen3.5-0.8B (base) | ~0,8 B | no disponible | no disponible en la informacion | safetensors | Modelo generalista de generacion de texto |
| Alternativas especificas de limpieza de dictado | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks de modelos comparables en la información proporcionada, por lo que no es posible establecer una comparación cuantitativa de rendimiento.

## Limitaciones y advertencias

- Solo inglés: no soporta otros idiomas, y el prompt de sistema está redactado en inglés.
- No es un reconocedor de voz: únicamente limpia texto ya transcrito.
- El prompt debe coincidir exactamente con el de entrenamiento (un turno de usuario, sin system message, `<think>` vacío, decodificación greedy, parada en `<|im_end|>`); desviarse puede degradar la calidad.
- El campo "Document context" del entrenamiento contenía el nombre del campo enfocado, no su contenido; las aplicaciones que envíen el contenido del campo pueden obtener resultados peores.
- Riesgo de alucinación y de copiar contexto: el prompt prohíbe explícitamente copiar el contexto de la aplicación en la salida, pero es una instrucción, no una garantía.
- El autor recomienda una salvaguarda en la aplicación: si la salida está vacía o supera 3 veces la longitud de la entrada, pegar la transcripción cruda.
- Los benchmarks son conjuntos creados por el autor y no una validación con usuarios reales; la latencia reportada no garantiza la latencia extremo a extremo del dictado.
- La licencia Apache 2.0 permite uso comercial, pero el modelo base Qwen3.5-0.8B debe verificarse por separado; su licencia no se detalla en la información disponible.
- Este repositorio corresponde al checkpoint v12, no al v13; conviene confirmar la versión antes de desplegar.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Muesli-HQ/qwen35-0.8b-muesli-cleanup-v12-mlx-8bit
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Repositorio MLX-Swift-LM: no disponible en la informacion proporcionada
- Paper o blog del autor: no disponible en la informacion proporcionada
