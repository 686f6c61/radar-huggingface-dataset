# litert-community/Qwen3.5-0.8B

## Resumen

Qwen3.5-0.8B es un modelo de lenguaje de 0,8 mil millones de parámetros desarrollado originalmente por Alibaba (Qwen) y convertido al formato LiteRT-LM por la comunidad `litert-community` para su ejecución en dispositivos (on-device). El modelo emplea una arquitectura híbrida poco habitual: bloques de atención lineal GatedDeltaNet (regla delta con compuerta) intercalados con un número reducido de bloques de atención completa con compuerta. En concreto, esta variante de 0,8B contiene 18 capas de atención lineal y 6 capas de atención completa, lo que reduce drásticamente el coste de memoria asociado al contexto.

La conversión a LiteRT-LM (extensión `.litertlm`) permite ejecutar el modelo con el runtime de Google LiteRT (antes TensorFlow Lite) en Android, iOS y macOS, con aceleración por GPU. Según las mediciones publicadas por el autor, el modelo alcanza 35,1 tok/s de decodificación en un Galaxy S26, 45,7 tok/s en un iPhone 17 Pro y 126,2 tok/s en un Mac Studio M4 Max, con tiempos hasta el primer token (TTFT) de 400 ms, 1,68 s y 154 ms respectivamente.

Es relevante ahora porque, según el autor, se trata de la primera conversión de un Qwen3.5 a LiteRT, la primera arquitectura híbrida GatedDeltaNet servida por el runtime LiteRT-LM publicado y, desde la actualización del 13 de agosto de 2026, la primera que ejecuta su exploración (scan) de regla delta en una GPU móvil. El paquete contiene únicamente el decodificador de texto: la torre de visión y las cabezas MTP del checkpoint original se han eliminado, siguiendo el contrato de carga solo-texto de `Qwen3_5ForCausalLM`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer híbrido: GatedDeltaNet (atención lineal con regla delta y compuerta) + atención completa con compuerta (18 capas lineales + 6 de atención) |
| Parametros totales | 0,8 mil millones (0.8B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | Presupuesto de KV de 4096 tokens en las 6 capas de atención; las capas lineales mantienen estado recurrente de tamaño constante |
| Tipos de cuantizacion | int8 dinámico; mixta 4/8 bits con Hadamard H=1024; pesos wi8 con activaciones fp32 (dynamic_wi8_afp32); mixed48_h1024 |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | `.litertlm` (LiteRT-LM); pesos externos en la variante mixed48 |
| Tamano del repo | 15,0 GB |
| Tamano de los ficheros principales | 487 MB (mixed48_h1024), 888 MB (int8_gpu_composite_v0190) |
| Runtime requerido | LiteRT-LM >= 0.15 (0.19.x para ficheros int8 base; >= 0.20.0 para mixed48 y dynamic_wi8_afp32) |
| Modelo base | Qwen/Qwen3.5-0.8B |
| Libreria | litert-lm |

## Arquitectura y entrenamiento

La arquitectura es un transformer híbrido propietario de Qwen (familia Qwen3.5) que combina bloques GatedDeltaNet con bloques de atención completa con compuerta. Los bloques de atención lineal portan un estado recurrente y de convolución de tamaño constante por capa en lugar de una caché KV que crece con el contexto, de modo que el uso de memoria se mantiene prácticamente plano respecto a la longitud de la secuencia. Solo las 6 capas de atención completa conservan caché KV, con un presupuesto de 4096 tokens en esta conversión. El checkpoint original de 0,8B es multimodal; esta conversión descarta la torre de visión y las cabezas MTP, conservando únicamente el decodificador de texto.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni las etapas de alineación (RLHF/DPO) en la información proporcionada. La innovación técnica destacable de esta conversión es la reexpresión del kernel de chunk de la regla delta con compuerta en una forma de rango ≤ 4 y sin relleno (pad-free) que el delegado GPU ejecuta correctamente, lo que permite delegar el grafo completo a la GPU. Durante esa reescritura el autor detectó un fallo de cálculo del delegado GPU en una forma de operación concreta, reportado upstream como LiteRT#9272, y ajustó el kernel para evitarla. La ejecución en GPU requiere activaciones fp32, declaradas en el paquete, con el consiguiente coste de memoria.

## Capacidades

- Generación de texto y razonamiento conversacional multi-turno, con plantilla de chat oficial `qwen3_5`.
- Modo de razonamiento (thinking) y plantilla de tool calling oficial de Qwen3.5 incluidos en la variante mixed48.
- Soporte de tool calling / function calling mediante la plantilla oficial.
- Ejecución on-device con aceleración GPU (Metal en Apple, delegado GPU en Android).
- Gestión de contexto con memoria casi constante gracias a las capas de atención lineal.
- Capacidades multilingües: no disponibles en la información proporcionada.
- La variante `Qwen3.5-0.8B-VL_int8.litertlm` incluye entrada de imagen (texto + imagen), aunque el paquete principal es solo texto.

## Casos de uso

- Asistentes conversacionales en el propio dispositivo: el modelo puede gestionar diálogos multi-turno sin conexión en móviles Android e iOS, con TTFT de 400 ms en Galaxy S26 y 1,68 s en iPhone 17 Pro, lo que hace viable la respuesta interactiva sin enviar datos a la nube.
- Autocompletado y redacción en aplicaciones de notas o correo: con 126,2 tok/s de decodificación en un Mac Studio M4 Max, la generación de párrafos cortos es prácticamente instantánea en escritorio.
- Clasificación y extracción de información local: al ejecutarse en CPU o GPU de dispositivos, permite procesar texto sensible (documentos personales, datos médicos) sin salir del terminal.
- Agentes ligeros con tool calling: la plantilla oficial de function calling permite integrar el modelo en asistentes que invocan APIs locales (calendario, ficheros, domótica) en el propio dispositivo.
- Prototipado y evaluación de arquitecturas híbridas: investigadores pueden desplegar un GatedDeltaNet real en hardware móvil con LiteRT-LM para medir latencia, memoria y calidad frente a transformers densos.
- Filtrado y moderación de contenido en el borde: con memoria casi plana respecto al contexto, puede procesar secuencias largas en dispositivos con RAM limitada sin degradación del uso de memoria.
- Educación y demos offline: aplicaciones de demostración de IA generativa que deben funcionar sin red, con un paquete de 487 MB en la variante mixed48.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K) en la información disponible. Sí se han publicado mediciones de rendimiento en dispositivo:

| Plataforma | Runtime / backend | Decodificación | Prefill | TTFT | Fecha |
|---|---|---|---|---|---|
| Galaxy S26 | LiteRT-LM 0.16.0, GPU | 35,1 tok/s | 551 tok/s | 400 ms | 2026-09-05 |
| iPhone 17 Pro | LiteRT-LM 0.16.0, GPU | 45,7 tok/s | 588 tok/s | 1,68 s | 2026-08-28 |
| Mac Studio M4 Max | LiteRT-LM 0.16.0, GPU | 126,2 tok/s | 1891 tok/s | 154 ms | 2026-08-28 |

En el Galaxy S26 se delegaron las 25.703 operaciones del grafo a la GPU. En macOS e iPhone 17 Pro (Metal), la decodificación en GPU rinde aproximadamente 2,8 veces más que en CPU, según el autor.

## Requisitos de hardware

- VRAM/RAM estimada: el fichero mixed48 ocupa 487 MB y el int8_gpu_composite 888 MB; la ejecución en GPU exige activaciones fp32, lo que incrementa el consumo de memoria respecto a la ejecución en CPU.
- GPU recomendadas: GPU integradas de smartphones de gama alta (Galaxy S26, iPhone 17 Pro con Metal), Apple Silicon (M4 Max) y GPUs de escritorio compatibles con el delegado GPU de LiteRT.
- Cabe en GPU de consumo: sí, en móviles de gama alta y en Apple Silicon; no se dispone de datos para GPUs de escritorio NVIDIA.
- Opciones de despliegue: LiteRT-LM >= 0.15 (0.19.x para int8 base; >= 0.20.0 para mixed48 y dynamic_wi8_afp32), con binario `litert-lm` y paquetes nightly `litert-lm-nightly 0.20.0.dev*`. No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: ver tabla de benchmarks (35,1 a 126,2 tok/s de decodificación; TTFT de 154 ms a 1,68 s).

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato / runtime | Notas |
|---|---|---|---|---|---|
| Qwen3.5-0.8B (LiteRT-LM) | 0,8B | KV 4096 en 6 capas; estado constante en 18 lineales | Apache 2.0 | `.litertlm`, LiteRT-LM | Híbrido GatedDeltaNet, on-device, GPU móvil |
| Qwen/Qwen3.5-0.8B (original) | 0,8B | No disponible | Apache 2.0 | safetensors (PyTorch) | Multimodal, incluye torre de visión y cabezas MTP |
| Alternativas on-device de tamaño similar | No disponible | No disponible | No disponible | No disponible | No se dispone de datos comparables en la información proporcionada |

## Limitaciones y advertencias

- El paquete es solo texto: la torre de visión y las cabezas MTP del checkpoint original se han eliminado (salvo en la variante VL).
- El presupuesto de caché KV es de 4096 tokens en las capas de atención; secuencias más largas pueden degradar la calidad.
- La ejecución en GPU requiere activaciones fp32, con mayor consumo de memoria que en CPU.
- La variante mixed48 y la dynamic_wi8_afp32 requieren LiteRT-LM >= 0.20.0; LiteRT-LM 0.19.2 falla en ambos backends con esos ficheros.
- Algunas builds que incluyen LiteRT #11565 rechazan `Qwen3.5-0.8B_int8_gpu_composite_v0190.litertlm` en GPU (entrada del 2026-11-13).
- El delegado GPU de LiteRT tenía un fallo de cálculo en una forma de operación concreta (LiteRT#9272), evitado por el kernel reescrito; otras formas de operación podrían presentar problemas similares.
- El token `<|im_end|>` solo se declaró como token de parada a partir de la corrección del 2026-08-07; versiones anteriores filtraban ese marcador en la salida.
- No se dispone de información sobre sesgos, riesgo de alucinación ni idiomas soportados.
- Licencia Apache 2.0: permite uso comercial, pero se recomienda revisar los términos del modelo base Qwen3.5-0.8B y las condiciones de uso del runtime LiteRT-LM.
- El tamaño del repo es de 15,0 GB, aunque cada fichero individual es mucho menor (487-888 MB).

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/litert-community/Qwen3.5-0.8B
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Runtime LiteRT-LM: https://github.com/google-ai-edge/litert-lm
- Issue LiteRT#9272: https://github.com/google-ai-edge/LiteRT/issues/9272
- Ficha de medición edge-compat: https://github.com/john-rocky/edge-compat/blob/main/cards/qwen35-0.8b-vl-int8/CARD.md
- Benchmark de runtimes en Android: https://github.com/john-rocky/apple-silicon-llm-bench/blob/main/results/android/tinyhybridnet-three-runtimes.md
