# mlboydaisuke/SmolLM3-3B-LiteRT

## Resumen

SmolLM3-3B-LiteRT es una conversión del modelo HuggingFaceTB/SmolLM3-3B al formato `.litertlm` de Google, pensada para inferencia totalmente en dispositivo (on-device) mediante el runtime LiteRT-LM. El trabajo lo publica el usuario independiente mlboydaisuke, no Hugging Face, y su valor está en empaquetar un decoder de 3B parámetros en un único fichero de ~1,9 GB con cuantización int4 por bloques, tokenizador y plantilla de chat incluidos.

El modelo base SmolLM3-3B es un transformer decoder de 3B parámetros con licencia Apache-2.0, atención GQA, esquema NoPE en parte de las capas y entrenamiento con contexto largo. Esta conversión conserva esa arquitectura y añade cuantización int4 de pesos con bloques de 32 elementos y clipping óptimo OCTAV, embeddings en INT8 y cómputo entero, además de una caché KV limitada a 4096 tokens.

Su relevancia práctica es la ejecución local en móviles y portátiles sin GPU dedicada de altas prestaciones: el autor reporta ~22,5 tok/s en un iPhone 17 Pro con GPU Metal y ~93 tok/s en un Mac con chip M-series, con una huella de ~1,24 GB en el dispositivo. Es un artefacto de despliegue más que un modelo nuevo: no se ha reentrenado ni ajustado, solo cuantizado y reempaquetado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder (base SmolLM3-3B) con GQA y esquema de atención NoPE; formato LiteRT-LM |
| Parametros totales | 3B (heredados del modelo base) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 4096 tokens de caché KV en este empaquetado (el modelo base soporta más, pero no se especifica en la información disponible) |
| Tipos de cuantizacion | Pesos int4 por bloques (bloque 32) con clipping óptimo OCTAV, simétrico; embeddings INT8; cómputo entero |
| Idiomas soportados | no disponible (el modelo base es multilingüe, pero no se detalla la lista) |
| Licencia | Apache-2.0 |
| Formato de pesos | `.litertlm` (bundle de LiteRT-LM; ~1,9 GB) |

## Arquitectura y entrenamiento

Esta ficha corresponde a una conversión, no a un entrenamiento. La arquitectura subyacente es la de SmolLM3-3B: un decoder transformer de 3B parámetros con atención de consultas agrupadas (GQA), un esquema de atención NoPE en determinadas capas y entrenamiento con contexto largo. El autor no aporta detalles adicionales sobre el número de tokens de entrenamiento, la composición del dataset ni si hubo fases de RLHF o DPO, más allá de describir el modelo base como "fully-open" y "a strong small reasoner".

La innovación técnica de este artefacto está en la cuantización y el empaquetado. Los pesos se cuantizan a int4 en bloques de 32 con clipping óptimo (OCTAV), manteniendo simetría, y los embeddings en INT8, con cómputo entero en el runtime. El bundle `.litertlm` incluye el tokenizador y la plantilla ChatML (`<|im_start|>role` / `<|im_end|>`, stop token `<|im_end|>`), de modo que no hacen falta ficheros separados. El autor reporta que esta cuantización alcanza paridad con bf16 en GSM8K, lo que sugiere que la pérdida de calidad por cuantización es mínima en esa prueba.

## Capacidades

- Generación de texto y razonamiento de tipo "small reasoner", heredado del modelo base SmolLM3-3B.
- Modo de pensamiento (thinking) activo por defecto: el modelo emite un canal de razonamiento antes de la respuesta; según el autor, no puede desactivarse en litert-lm 0.18.0.
- Conversación multi-turno mediante plantilla ChatML incluida en el bundle.
- Capacidades multilingües heredadas del modelo base (no se detalla la lista de idiomas).
- Ejecución totalmente local y offline en móvil y escritorio, sin llamadas a servicios externos.
- Servidor local compatible con la API de OpenAI mediante `litert-lm serve`.
- No se documenta soporte de tool calling, function calling ni visión en la información disponible.

## Casos de uso

- Asistente conversacional en móvil sin conexión: con ~1,24 GB de huella y ~22,5 tok/s en un iPhone 17 Pro, el modelo puede gestionar chats multi-turno dentro de los 4096 tokens de caché KV sin enviar datos a la nube.
- Automatización de tareas de razonamiento en escritorio: en un Mac M-series rinde ~93 tok/s con decodificación greedy, suficiente para resúmenes, extracción de datos y clasificación por lotes en local.
- Prototipado de apps Android con IA embebida: el paquete `.litertlm` se integra mediante la API Kotlin de LiteRT-LM (`com.google.ai.edge.litertlm:litertlm-android`) dentro de una aplicación propia.
- Servidor de inferencia local compatible con OpenAI: `litert-lm serve` expone una API que permite conectar clientes existentes sin modificar código, útil para entornos de desarrollo o pruebas aisladas.
- Evaluación de cuantización int4: sirve como referencia para medir la degradación de un modelo de 3B al pasar a int4 con bloques de 32, dado el reporte de paridad en GSM8K.
- Demostraciones educativas de IA on-device: la app Google AI Edge Gallery permite importar el modelo directamente desde Hugging Face y probarlo en un teléfono sin ordenador ni `adb`.
- Procesamiento de documentos cortos y resúmenes en el dispositivo: dentro del límite de 4096 tokens de contexto, adecuado para correos, notas o fragmentos de documentación.

## Benchmarks y rendimiento

| Configuración | GSM8K (n=100, greedy, 0-shot CoT) |
|---|---|
| bf16 (referencia) | 81,0% |
| Este modelo — LiteRT int4 (BOCTAV4) | 81,0% |

Medición del autor con prompt y extracción de respuesta idénticos en ambas filas; la única diferencia es la cuantización. No se han publicado otros resultados de benchmarks (MMLU, HumanEval, etc.) en la información disponible.

Rendimiento de decodificación reportado por el autor:

| Plataforma | Velocidad | Notas |
|---|---|---|
| iPhone 17 Pro, GPU Metal | ~22,5 tok/s | Carga en 7,7 s, huella ~1,24 GB |
| Mac M-series, LiteRT-LM, GPU Metal | ~93 tok/s | Decodificación greedy |

## Requisitos de hardware

- VRAM/espacio estimado: ~1,9 GB para el fichero `.litertlm`; ~1,24 GB de huella en ejecución en iPhone 17 Pro según el autor.
- Cabe en GPU de consumo: el diseño apunta a móviles y portátiles; se ha verificado en iPhone 17 Pro (Metal) y en Mac con chip M-series (Metal). No se especifican requisitos mínimos para GPU de escritorio dedicadas (RTX 4090, A100, H100) en la información disponible.
- Backends soportados por LiteRT-LM: GPU (Metal en Apple) y CPU.
- Despliegue: runtime LiteRT-LM (CLI `litert-lm run`, servidor `litert-lm serve` compatible con OpenAI), app Google AI Edge Gallery (v1.0.16+ importa desde Hugging Face; 1.0.15+ soporta `.litertlm`) y API Kotlin para Android.
- Latencia y throughput: ver tabla de benchmarks; ~22,5 tok/s en iPhone 17 Pro y ~93 tok/s en Mac M-series.
- Limitación operativa: en litert-lm 0.18.x y 0.19.0, una llamada bloqueante `send_message` que tarde más de 10 minutos falla con `DEADLINE_EXCEEDED` y puede dejar un proceso colgado; se recomienda `send_message_async` o reducir `max_output_tokens`.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato / runtime | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| SmolLM3-3B-LiteRT (este) | 3B | 4096 (KV en este bundle) | `.litertlm` / LiteRT-LM | Apache-2.0 | Hugging Face (77 descargas) |
| HuggingFaceTB/SmolLM3-3B | 3B | no disponible en la información | safetensors / transformers | Apache-2.0 | Hugging Face (modelo base oficial) |
| Modelos oficiales `litert-community/*` | no disponible | no disponible | `.litertlm` / LiteRT-LM | no disponible | Hugging Face |

No se dispone de datos suficientes en la información proporcionada para comparar rendimiento con alternativas de la misma categoría más allá del modelo base y de los empaquetados oficiales de LiteRT-LM.

## Limitaciones y advertencias

- El modo de pensamiento no puede desactivarse en litert-lm 0.18.0: `ThinkingConfig(enable_thinking=False)` no tiene efecto y, con un límite de 400 tokens, el canal de razonamiento consume todo el presupuesto sin producir respuesta. Hay que fijar `thinking_token_budget` y un límite superior a este.
- Timeout fijo de 10 minutos en llamadas bloqueantes `send_message` en litert-lm 0.18.x y 0.19.0, con riesgo de caída del proceso; usar la variante asíncrona o acortar las respuestas.
- Contexto efectivo limitado a 4096 tokens de caché KV en este empaquetado, muy por debajo de lo que puede soportar el modelo base.
- Riesgo de descargas incompletas: el CLI de litert-lm (0.14.0 a 0.19.2 y nightly 0.20.0.dev20261112) puede importar un fichero truncado desde su caché sin verificar el tamaño; conviene borrar `~/.litert-lm/cache/huggingface/mlboydaisuke/SmolLM3-3B-LiteRT/model.litertlm` y reimportar si aparecen errores como `too large for file size` o un bus error (exit 138 en Mac).
- Si se importó el modelo antes del 2026-09-21 (17:24 UTC), la copia cacheada es la versión anterior; hay que borrarla y reimportar.
- Riesgo de alucinación y sesgos: no se documentan evaluaciones de sesgo ni tasas de alucinación en la información disponible; al ser un modelo de 3B, la fiabilidad en razonamiento complejo es limitada.
- La licencia Apache-2.0 permite uso comercial, pero el autor no ofrece garantías sobre el artefacto empaquetado; conviene validar la calidad en el dominio propio antes de producción.
- Es un artefacto de terceros no oficial: no está publicado por Hugging Face ni por Google, y tiene un historial mínimo (77 descargas, 0 likes).

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/mlboydaisuke/SmolLM3-3B-LiteRT
- Modelo base SmolLM3-3B: https://huggingface.co/HuggingFaceTB/SmolLM3-3B
- Repositorio LiteRT-LM: https://github.com/google-ai-edge/litert-lm
- Guía de inicio de la API Kotlin de LiteRT-LM: https://github.com/google-ai-edge/LiteRT-LM/blob/main/docs/api/kotlin/getting_started.md
- App Google AI Edge Gallery: https://github.com/google-ai-edge/gallery
- Releases de la app Gallery: https://github.com/google-ai-edge/gallery/releases
- Guía de importación de modelos locales en Gallery: https://github.com/google-ai-edge/gallery/wiki/6.-Importing-Local-Models-(optional)
