# litert-community/VibeThinker-3B

## Resumen

VibeThinker-3B es un modelo denso de 3.000 millones de parámetros especializado en razonamiento matemático y resolución de problemas aritméticos, desarrollado originalmente por WeiboAI sobre la arquitectura Qwen2 (`Qwen2ForCausalLM`, 36 capas). Genera una cadena de pensamiento (chain-of-thought) en línea antes de emitir la respuesta final encerrada en un bloque `\boxed{}`. Esta ficha describe la conversión publicada por la comunidad `litert-community` al formato `.litertlm` de LiteRT-LM, el runtime on-device de Google (sucesor de TensorFlow Lite), orientada a inferencia en dispositivos de borde.

La relevancia de esta versión concreta reside en el empaquetado: el modelo original en safetensors se distribuye aquí como un único fichero `model.litertlm` de aproximadamente 1,9 GB con cuantización int4 por bloques de 32 con clipping óptimo OCTAV y embeddings INT8 externalizados, lo que permite ejecutarlo en GPUs móviles, portátiles y navegadores mediante WebGPU. Las mediciones publicadas por el autor de la conversión reportan 125,6 tok/s de decodificación en un Mac Studio M4 Max, 25,2 tok/s en un Galaxy S26 y 7,6 tok/s en un Pixel 8a.

El modelo está pensado para escenarios donde se requiere razonamiento matemático verificable sin conexión a servicios en la nube. Su ventana de contexto efectiva en esta conversión es de 4096 tokens de caché KV, y requiere límites de generación de al menos 2048 tokens para completar el razonamiento antes de emitir la respuesta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso, `Qwen2ForCausalLM`, 36 capas |
| Parametros totales | 3B (aproximado, según nombre del modelo) |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | 4096 tokens (caché KV en la conversión LiteRT-LM) |
| Tipos de cuantizacion | int4 por bloques de 32 (simétrica) con OCTAV optimal-clipping; embeddings INT8 externalizados; activaciones fp16 o fp32 |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | `.litertlm` (LiteRT-LM); modelo base en safetensors |
| Tamano del artefacto | ~1,9 GB (`model.litertlm`, 2.059.236.272 bytes) |
| Tamano del repo | 14,4 GB |
| Modelo base | WeiboAI/VibeThinker-3B |
| Runtime | LiteRT-LM (Google AI Edge) |
| Backends | GPU (WebGPU/Metal), CPU (XNNPACK) |
| Descargas | 1.682 |
| Likes | 9 |

## Arquitectura y entrenamiento

La arquitectura es un transformer denso estándar Qwen2 con 36 capas, sin mezcla de expertos ni mecanismos de atención lineal. Al conservar la arquitectura original sin modificaciones estructurales, la conversión puede apoyarse directamente en el conversor `litert-torch` y en el runtime LiteRT-LM existentes, lo que el autor de la conversión documenta como una coincidencia numérica de 4e-7 frente al modelo original en una prueba sobre Galaxy S26 con LiteRT 2.2.0.

No se dispone de información sobre el dataset de entrenamiento del modelo base, el número de tokens procesados, la composición de los datos ni si se aplicaron fases de RLHF o DPO. El autor de la conversión tampoco detalla el proceso de calibración de la cuantización más allá de indicar el uso de clipping óptimo OCTAV sobre pesos int4 simétricos con bloques de 32.

La innovación técnica destacable está en la optimización del grafo para GPU publicada el 2026-10-06: las dos escrituras `DYNAMIC_UPDATE_SLICE` por capa sobre la caché KV se fusionaron en un único `STABLEHLO_COMPOSITE odml.cache_update`, y los productos de atención `BATCH_MATMUL(adjY)` se sustituyeron por `odml.runtime_bmm`. Se añadió además una firma `prefill_16` que comparte todos los buffers de pesos con `prefill_128`. El resultado medido en Mac Studio M4 Max con activaciones fp16 fue un incremento de decodificación de 92,0 a 125,6 tok/s y una reducción del TTFT de 16 tokens de 0,107 s a 0,035 s.

## Capacidades

- Generación de texto con razonamiento paso a paso explícito (chain-of-thought inline) antes de la respuesta final.
- Resolución de problemas aritméticos y de problemas verbales de matemáticas (math word problems).
- Emisión de la respuesta final en formato `\boxed{}`, facilitando la extracción automática del resultado.
- Inferencia on-device en GPU móvil (Android), portátil (macOS con Metal), CPU (XNNPACK) y navegador (WebGPU).
- Ejecución sin conexión de red una vez descargado el fichero `.litertlm`.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso orquestado más allá de la cadena de pensamiento interna.
- No se documenta capacidad de visión, audio ni multimodalidad.
- Capacidades multilingües: no disponibles en la información proporcionada.

## Casos de uso

- Tutoría matemática sin conexión: el modelo resuelve problemas aritméticos y verbales mostrando el razonamiento intermedio, lo que permite desplegarlo en aplicaciones educativas móviles que funcionan sin red y sin enviar datos del alumno a servidores externos.
- Verificación de cálculos en aplicaciones de campo: integrado en apps Android mediante LiteRT-LM, puede validar presupuestos, dosificaciones o conversiones de unidades en entornos sin cobertura, con la respuesta final extraíble del bloque `\boxed{}`.
- Procesamiento por lotes de problemas matemáticos en estación de trabajo: con 1459 tok/s de prefill y 125,6 tok/s de decodificación en Mac Studio M4 Max, es viable procesar conjuntos de problemas de forma local sin coste de API.
- Demostración interactiva en navegador: el chat web oficial carga el modelo de 2,06 GB y lo ejecuta con WebGPU, útil para prototipos y evaluaciones rápidas sin instalación.
- Asistente de razonamiento embebido en dispositivos de bajo consumo: en Raspberry Pi 5, Pixel 8a e iPhone 17 Pro se han publicado mediciones, lo que lo hace candidato para asistentes locales en hardware de gama media.
- Evaluación comparativa de runtimes on-device: sirve como banco de pruebas para medir latencia y throughput de LiteRT-LM frente a otras pilas de inferencia en el mismo hardware, dado que el autor publica protocolos de medición reproducibles.
- Filtrado y clasificación de problemas matemáticos en pipelines locales: la cadena de pensamiento permite inspeccionar el razonamiento y detectar problemas mal planteados antes de aceptar la respuesta.

## Benchmarks y rendimiento

El autor de la conversión publica resultados de calidad sobre GSM8K y mediciones de velocidad por dispositivo. No se han publicado resultados de MMLU, HumanEval ni otros benchmarks estándar en la información disponible.

Calidad (Mac Studio M4 Max, GPU, fp16, greedy, máx. 2048 tokens):

| Prueba | Fichero anterior | Fichero nuevo (2026-10-06) |
|---|---:|---:|
| 8 preguntas, respuesta final correcta | 8/8 | 8/8 |
| GSM8K, 30 preguntas | 29/30 | 30/30 |

Velocidad en Mac Studio M4 Max (`litert-lm` 0.17.1, 256 prefill / 256 decode):

| Backend | Prefill | Decode | TTFT | TTFT (prefill 16) | Init |
|---|---:|---:|---:|---:|---:|
| GPU (WebGPU on Metal) | 1459 tok/s | 125,6 tok/s | 0,19 s | 0,035 s | 2,8 s |
| CPU (XNNPACK) | 139 tok/s | 29,8 tok/s | 2,22 s | 0,526 s | 2,7 s |

Velocidad en dispositivos de borde:

| Dispositivo | Runtime | Backend | Decode | Prefill | TTFT | Ops delegadas |
|---|---|---|---:|---:|---:|---:|
| Galaxy S26 | LiteRT-LM prebuilt-adac974b | GPU | 25,2 tok/s | 388 tok/s | 2,68 s | 1636/1636 |
| Pixel 8a | LiteRT-LM 0.16.0 | GPU | 7,6 tok/s | 13 tok/s | 1,48 s | 1603/1603 |
| Mac Studio M4 Max | LiteRT-LM 0.17.1 | GPU | 125,6 tok/s | 1459 tok/s | 186 ms | 1636/1636 |

## Requisitos de hardware

- VRAM/almacenamiento: el fichero `model.litertlm` ocupa ~1,9 GB en disco; la caché KV para 4096 tokens añade memoria adicional no cuantificada en la información disponible.
- GPU recomendadas: cualquier GPU móvil con soporte WebGPU (Galaxy S26, Pixel 8a, iPhone 17 Pro medidos); GPU integradas Apple Silicon (M4 Max medido); CPU x86/ARM vía XNNPACK como alternativa.
- Cabe en GPUs de consumo: sí, en hardware móvil de gama alta y en Apple Silicon. No se documentan requisitos para GPUs de escritorio dedicadas (RTX 4090, A100, H100).
- Opciones de despliegue: LiteRT-LM (CLI y runtime), LiteRT-LM Web chat demo con WebGPU, y conversión desde PyTorch mediante `litert-torch`. No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI para este formato.
- Latencia y throughput: ver tabla de benchmarks. El TTFT de 16 tokens es de 0,035 s en GPU de M4 Max y 0,526 s en CPU del mismo equipo.
- Nota de inicialización: el valor `Init` del CLI cuenta dos veces la creación del motor según el issue LiteRT-LM #4057.

## Comparativa con modelos similares

No se dispone de datos de benchmarks de modelos comparables en la información proporcionada, por lo que la comparación se limita a características estructurales verificables.

| Modelo | Parámetros | Contexto | Formato on-device | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| VibeThinker-3B (LiteRT-LM) | 3B denso | 4096 (KV) | `.litertlm` int4 | MIT | Hugging Face, demo web |
| WeiboAI/VibeThinker-3B (base) | 3B denso | no disponible | safetensors | MIT | Hugging Face |
| Alternativas de 3B para razonamiento on-device | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Es un modelo de razonamiento: con `max_tokens` inferior a 2048 se corta antes de emitir la respuesta final. Todas las métricas de calidad publicadas se midieron con ese límite.
- Con activaciones fp16 por defecto, el fichero nuevo (2026-10-06) produjo una respuesta final incorrecta en un prompt largo donde el fichero intermedio acertaba; con activaciones fp32 las respuestas fueron idénticas byte a byte. Es un riesgo a considerar en producción con fp16.
- Ventana de contexto limitada a 4096 tokens de caché KV en esta conversión, insuficiente para documentos largos o conversaciones multi-turno extensas.
- Idiomas soportados no documentados; no se puede garantizar calidad fuera del inglés sin evaluación previa.
- No se documentan sesgos conocidos, pero al no disponerse de información sobre el dataset de entrenamiento no es posible evaluar su impacto.
- Riesgo de alucinación en problemas mal especificados: la cadena de pensamiento puede producir razonamientos plausibles con resultado incorrecto; se recomienda verificación externa en contextos críticos.
- Licencia MIT: permite uso comercial sin restricciones documentadas, pero se aplica sobre la conversión; conviene verificar la licencia del modelo base WeiboAI/VibeThinker-3B de forma independiente.
- El formato `.litertlm` está atado al runtime LiteRT-LM; no es portable a otras pilas de inferencia sin reconversión desde el modelo base.
- Las mediciones en Pixel 8a, Raspberry Pi 5 e iPhone 17 Pro corresponden al fichero anterior, no al publicado el 2026-10-06.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/litert-community/VibeThinker-3B
- Modelo base: https://huggingface.co/WeiboAI/VibeThinker-3B
- Demo web LiteRT-LM: https://google-ai-edge.github.io/LiteRT-LM/web_demos/chat/index.html?model=litert-community/VibeThinker-3B
- Runtime LiteRT-LM: https://github.com/google-ai-edge/litert-lm
- Ficha de mediciones edge-compat: https://github.com/john-rocky/edge-compat/blob/main/cards/vibethinker-3b/CARD.md
- Benchmark de runtimes en Apple Silicon: https://github.com/john-rocky/apple-silicon-llm-bench/blob/main/results/android/tinyhybridnet-three-runtimes.md
- Issue LiteRT-LM #4057 (tiempo de inicialización): https://github.com/google-ai-edge/LiteRT-LM/issues/4057
