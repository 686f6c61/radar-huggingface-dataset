# mlboydaisuke/OLMo-2-1B-Instruct-LiteRT

## Resumen

OLMo-2-1B-Instruct-LiteRT es una conversión del modelo allenai/OLMo-2-0425-1B-Instruct de AllenAI al formato LiteRT-LM (`.litertlm`), empaquetado por el usuario mlboydaisuke para inferencia on-device con el runtime LiteRT-LM de Google. El objetivo es llevar un modelo de lenguaje de 1B parámetros al bolsillo: el bundle pesa aproximadamente 0,93 GB y se ha verificado su funcionamiento en un iPhone 17 Pro, además de en GPUs Metal de la serie M de Apple.

La conversión utiliza el exportador oficial `litert-torch` sin parches propios. La receta de cuantización es int4 por bloques de 32 con clipping óptimo OCTAV simétrico y embeddings en INT8, con cómputo entero. El contexto de la caché KV está fijado en 4096 tokens y el bundle incluye tokenizador y plantilla de prompt en formato Tülu nativo de OLMo-2.

El interés actual radica en la combinación de una licencia Apache-2.0 totalmente abierta (pesos, datos y código de entrenamiento del modelo base) con un formato ejecutable en dispositivos móviles y de escritorio. Es una opción realista para aplicaciones de texto en local sin conexión, con un coste de calidad medido y documentado frente a la referencia en bf16.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Olmo2ForCausalLM), post-norm reordenada con QK-norm |
| Parámetros totales | 1B (modelo base allenai/OLMo-2-0425-1B-Instruct) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | 4096 tokens (caché KV) |
| Tipos de cuantización | int4 por bloques (bloque 32) + OCTAV, simétrico; embeddings INT8; cómputo entero |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | `.litertlm` (bundle LiteRT-LM, ~0,93 GB); modelo base en safetensors |

## Arquitectura y entrenamiento

El modelo subyacente es un transformer decoder-only de la familia OLMo-2 de AllenAI. La conversión a LiteRT-LM aprovecha el conversor estándar sin código personalizado: la QK-norm y la post-norm reordenada de OLMo-2 se traducen a operaciones genéricas del runtime. La cuantización aplicada es int4 con bloques de 32 elementos y clipping óptimo OCTAV simétrico, mientras que la capa de embeddings se mantiene en INT8. El cómputo resultante es puramente entero, lo que permite ejecución eficiente en aceleradores móviles y GPUs integradas.

No se dispone en la información proporcionada de detalles sobre el número de tokens de entrenamiento, la composición del dataset ni las fases de alineación (RLHF/DPO) del modelo base. La model card sí documenta una corrección posterior del tokenizador embebido: la versión inicial llevaba el pre-tokenizador por defecto de GPT-2 en lugar de la regex propia del modelo, lo que provocaba diferencias de segmentación en los marcadores de rol (`<|user|>\n` y `<|assistant|>\n` diferían en 3 tokens por turno). Desde el 30 de agosto de 2026 el bundle incorpora el `tokenizer.json` upstream byte a byte, sin cambios en los pesos.

## Capacidades

- Generación de texto conversacional multi-turno con plantilla de prompt nativa de OLMo-2 (formato Tülu: `<|user|>` / `<|assistant|>`, token de parada `<|endoftext|>`).
- Razonamiento aritmético de cadena de pensamiento (chain-of-thought) con respuestas terminadas en estilo `\boxed{}` que finalizan limpiamente en el token de parada.
- Inferencia on-device completa: el bundle incluye tokenizador y plantilla, sin necesidad de ficheros auxiliares.
- Ejecución en Android mediante la app Google AI Edge Gallery (importación directa desde Hugging Face desde la versión 1.0.16) o mediante la API Kotlin `com.google.ai.edge.litertlm:litertlm-android` para integración en apps propias.
- Ejecución en escritorio (macOS, Linux, Windows) mediante la CLI oficial LiteRT-LM, incluyendo un servidor local compatible con la API de OpenAI.
- Selección de backend CPU o GPU en el runtime.
- Soporte de tool calling, agentes, visión, audio o modo thinking: no disponible en la información proporcionada.

## Casos de uso

- Asistente de texto sin conexión en aplicaciones móviles: el bundle de 0,93 GB cabe en un teléfono de 8 GB y se ejecuta con la API Kotlin de LiteRT-LM, lo que permite ofrecer chat local sin enviar datos a servidores externos.
- Prototipado rápido en Android con Google AI Edge Gallery: la importación directa desde Hugging Face en la versión 1.0.16 o superior permite evaluar el modelo en minutos sin ordenador ni `adb`, útil para validar la viabilidad de una idea antes de invertir en desarrollo.
- Servidor local compatible con OpenAI para desarrollo y pruebas: `litert-lm serve` expone una API que permite apuntar clientes existentes al modelo sin modificar el código de la aplicación, adecuado para entornos de desarrollo con requisitos de privacidad.
- Aplicaciones de escritorio con GPU integrada: en Macs de la serie M el modelo alcanza aproximadamente 138 tok/s con backend Metal, suficiente para interfaces de chat interactivas o generación de texto en herramientas ofimáticas locales.
- Educación y demostraciones de IA on-device: el modelo sirve para ilustrar en talleres y cursos cómo funciona la cuantización int4 y el despliegue en edge, con métricas reproducibles de velocidad y calidad documentadas en la model card.
- Evaluación de la degradación por cuantización en modelos pequeños: la comparación publicada entre bf16 (72,0 % en GSM8K) e int4 (63,0 %) permite estudiar el coste de la cuantización agresiva en modelos de 1B frente a alternativas int8 (65 % con un 60 % más de tamaño).
- Procesamiento de texto por lotes en dispositivos de bajos recursos: con un footprint de aproximadamente 1,2 GB en memoria, el modelo puede ejecutarse en paralelo con otras aplicaciones en hardware modesto para tareas de resumen o clasificación.

## Benchmarks y rendimiento

Resultados publicados en la model card sobre GSM8K (n=100, greedy, 0-shot chain-of-thought, prompt y extracción de respuesta idénticos en todas las filas):

| Configuración | GSM8K |
|---|---|
| bf16 (referencia) | 72,0 % |
| LiteRT int4 (BOCTAV4, este modelo) | 63,0 % |

No se han publicado resultados de otros benchmarks (MMLU, HumanEval, etc.) en la información disponible.

Métricas de velocidad documentadas por el autor:

| Plataforma | Decodificación | Carga | Footprint |
|---|---|---|---|
| iPhone 17 Pro | ~24 tok/s | 5,2 s | ~1,2 GB |
| Mac serie M (GPU Metal) | ~138 tok/s | no disponible | no disponible |

## Requisitos de hardware

- VRAM/memoria estimada: aproximadamente 1,2 GB de footprint en inferencia; el fichero en disco ocupa ~0,93 GB.
- Cabe en GPUs de consumo y en teléfonos: verificado en iPhone 17 Pro y en GPUs Metal de la serie M; el autor indica que cabe holgadamente en un teléfono de 8 GB.
- GPUs de datacenter (A100, H100): no documentadas en la información disponible; el modelo está orientado a edge, no a servidores de altas prestaciones.
- Opciones de despliegue: runtime LiteRT-LM (CLI `litert_lm_main` en escritorio y Android), app Google AI Edge Gallery para Android, API Kotlin `litertlm-android` para integración en apps, y servidor local compatible con OpenAI mediante `litert-lm serve`.
- Backends: CPU y GPU (Metal en Mac).
- Latencia y throughput: ~24 tok/s en iPhone 17 Pro y ~138 tok/s en Mac serie M con GPU Metal; carga de 5,2 s en iPhone 17 Pro.
- Advertencia operativa: las versiones 0.14.0 a 0.19.2 de la CLI (y la nightly 0.20.0.dev20261112) pueden conservar descargas incompletas en `~/.litert-lm/cache/huggingface/mlboydaisuke/OLMo-2-1B-Instruct-LiteRT/` e importarlas sin comprobar el tamaño, provocando errores de bus o mensajes `too large for file size`; la solución es borrar el fichero en caché y repetir `import`. Lo mismo aplica a importaciones realizadas antes del 30 de agosto de 2026 (05:48 UTC), que conservan la versión anterior del bundle.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato / despliegue | Licencia | Calidad documentada |
|---|---|---|---|---|---|
| OLMo-2-1B-Instruct-LiteRT (este) | 1B | 4096 | `.litertlm`, LiteRT-LM, edge | Apache-2.0 | GSM8K 63,0 % (int4), 72,0 % (bf16) |
| OLMo-2-0425-1B-Instruct (base) | 1B | no disponible | safetensors, servidores y frameworks estándar | Apache-2.0 | GSM8K 72,0 % (bf16) |
| Modelos `litert-community/*` | no disponible | no disponible | `.litertlm`, LiteRT-LM | no disponible | no disponible |

La comparación con alternativas de terceros de la misma categoría (modelos de 1B en formato edge) no está disponible en la información proporcionada.

## Limitaciones y advertencias

- Degradación por cuantización: la receta int4 pierde aproximadamente 9 puntos en GSM8K frente a bf16 (63,0 % frente a 72,0 %); un build int8 solo recupera unos 2 puntos (65 %) con un 60 % más de tamaño, según el autor.
- Contexto limitado: la caché KV está fijada en 4096 tokens, insuficiente para documentos largos o conversaciones muy extensas.
- Idiomas soportados no documentados: no hay información sobre cobertura multilingüe; el uso en castellano no está verificado en la model card.
- Riesgo de alucinación: inherente a un modelo de 1B parámetros; no se han publicado evaluaciones de factualidad ni de sesgos.
- Historial de tokenizador defectuoso: las versiones anteriores al 30 de agosto de 2026 segmentaban mal los marcadores de rol; cualquier copia importada antes de esa fecha debe regenerarse.
- Fallos de importación documentados en la CLI de LiteRT-LM (versiones 0.14.0 a 0.19.2 y nightly 0.20.0.dev20261112) por descargas incompletas no verificadas.
- Licencia Apache-2.0: permite uso comercial sin restricciones adicionales conocidas, pero conviene verificar las condiciones del modelo base allenai/OLMo-2-0425-1B-Instruct.
- Madurez del ecosistema: el formato `.litertlm` y el runtime LiteRT-LM son recientes y con cambios frecuentes; no se documenta soporte en vLLM, llama.cpp, Ollama ni TGI.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/mlboydaisuke/OLMo-2-1B-Instruct-LiteRT
- Modelo base: https://huggingface.co/allenai/OLMo-2-0425-1B-Instruct
- Runtime LiteRT-LM: https://github.com/google-ai-edge/litert-lm
- Conversor litert-torch: https://github.com/google-ai-edge/litert
- App Google AI Edge Gallery: https://github.com/google-ai-edge/gallery
- Releases de la app Gallery: https://github.com/google-ai-edge/gallery/releases
- Guía de importación de modelos locales: https://github.com/google-ai-edge/gallery/wiki/6.-Importing-Local-Models-(optional)
