# litert-community/Zamba2-1.2B-instruct

## Resumen

Zamba2-1.2B-instruct es un modelo de lenguaje de 1.200 millones de parámetros desarrollado originalmente por Zyphra, basado en una arquitectura híbrida que combina un backbone Mamba2 de tipo selective-scan con un único bloque transformer compartido que se aplica en seis posiciones intercaladas. Esta ficha corresponde concretamente a la conversión realizada por la comunidad litert-community al formato LiteRT-LM (`.litertlm`), pensada para inferencia en dispositivo (on-device) mediante el runtime LiteRT-LM de Google AI Edge.

El modelo resuelve el problema de ejecutar un LLM conversacional en hardware de borde —smartphones Android, iPhone y placas como Raspberry Pi 5— sin depender de la nube. Para ello se distribuye una única variante cuantizada a int8 dinámico en capas lineales y embeddings, mientras que las convoluciones y el mecanismo de scan permanecen en coma flotante; las activaciones se declaran en fp32 para la ruta GPU. El archivo ocupa 1,33 GB y requiere LiteRT-LM ≥ 0.15.

Su relevancia actual radica en que, según el autor de la conversión, se trata de la primera adaptación de Zamba2 a un runtime móvil. La model card documenta métricas medidas en dispositivo real (Galaxy S26, iPhone 17 Pro, Raspberry Pi 5) y una verificación de correctitud frente al modelo PyTorch original, lo que permite evaluar con datos concretos su viabilidad en producción embebida. La licencia Apache 2.0 facilita su uso comercial.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Híbrida: backbone Mamba2 (selective-scan, 32 capas) + un bloque transformer compartido aplicado en 6 posiciones intercaladas, con LoRA por posición |
| Parámetros totales | 1.200 millones (1.2B) |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | 4096 tokens (según las cachés KV descritas: 32 KV heads × 128 dim a 4096 de contexto) |
| Tipos de cuantización | int8 dinámico en capas lineales y embedding; convoluciones y scan en float; activaciones fp32 para GPU |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | `.litertlm` (LiteRT-LM); modelo base en formato Hugging Face |
| Tamaño del archivo | 1,33 GB (`Zamba2-1.2B-instruct_int8.litertlm`) |
| Runtime requerido | LiteRT-LM ≥ 0.15 |
| Plantilla de chat | ChatML estándar de Zamba2 (incluida en el archivo); desde 2026-09-21 acepta la forma content-parts de 0.18 |
| Firmas de prefill | Múltiples longitudes de 1 a 1024 tokens |

## Arquitectura y entrenamiento

La arquitectura de Zamba2 es una propuesta híbrida de Zyphra: un backbone Mamba2 de 32 capas basado en selective-scan sobre el que se intercala un único bloque transformer compartido en seis posiciones. Ese bloque reutiliza un solo conjunto de pesos de atención y MLP en cada posición, especializándose mediante adaptadores LoRA por posición, y atiende sobre la concatenación del estado oculto corriente y los embeddings originales. Este diseño reduce el número de parámetros de atención respecto a un transformer convencional del mismo tamaño y mantiene la eficiencia de decodificación propia de los modelos de estado recurrente.

La información disponible no detalla la composición del dataset de entrenamiento, el número de tokens vistos ni si se aplicaron fases de RLHF o DPO en el modelo original de Zyphra; esos datos corresponden a la model card del modelo base y no se incluyen en la documentación de esta conversión. La innovación técnica documentada aquí es la propia conversión: exportación a LiteRT-LM con firmas de prefill multi-longitud (1–1024) para que el runtime elija fragmentos ajustados, tokenizer y plantilla ChatML embebidos, y una verificación de correctitud que compara logits contra PyTorch en 48 posiciones de decodificación con top-1 y top-5 idénticos en todas ellas, correlación media de logits de 1.0000 y KL media ≈ 0.

## Capacidades

- Generación de texto conversacional multi-turno con plantilla ChatML.
- Razonamiento aritmético básico y preguntas de conocimiento general (verificado con un conjunto de 8 preguntas de sanity check).
- Inferencia en dispositivo con backend CPU y GPU (Metal en Apple, GPU en Android vía LiteRT-LM).
- Soporte de decodificación con caché recurrente de estado y gestión de conversaciones mediante objetos Engine/Conversation del runtime.
- Ejecución con prefill fragmentado en múltiples longitudes (1–1024) para optimizar el uso de memoria.
- No se documenta soporte de tool calling, function calling, agentes multi-paso, visión, audio ni modo thinking en la información disponible.
- Capacidades multilingües: no disponibles en la documentación.

## Casos de uso

- Asistentes conversacionales offline en smartphone: el modelo corre en un Galaxy S26 a 11,7 tok/s en GPU y 12,2 tok/s en CPU con TTFT de 1,94 s y 2,51 s respectivamente, suficiente para un chatbot local sin conexión que preserve la privacidad del usuario.
- Respuestas a preguntas de conocimiento general y cálculo sencillo en aplicaciones móviles: el sanity check de 8 preguntas se supera en 7/8 de forma consistente en cuatro ejecuciones (GPU y CPU, LiteRT-LM 0.15.0 y 0.16.0), lo que lo hace apto para FAQ y asistencia ligera.
- Automatización en Raspberry Pi 5: con 4 hilos de CPU alcanza 1,8 tok/s de decodificación y 24 tok/s de prefill con TTFT de 11,10 s, adecuado para tareas por lotes o notificaciones generadas localmente en domótica e IoT.
- Procesamiento de prompts de hasta 1024 tokens en una sola pasada gracias a las firmas de prefill exportadas, útil para resumir correos, notas o mensajes cortos en el propio dispositivo.
- Prototipado e investigación en eficiencia de modelos híbridos: la conversión permite medir el comportamiento real de la atención compartida de Zamba2 en hardware de borde con métricas reproducibles.
- Aplicaciones con requisitos de memoria estrictos: el backend CPU en iPhone 17 Pro consume 1,82 GB de pico, lo que permite integrarlo en apps móviles sin agotar la memoria del sistema; el backend GPU requiere 5,43 GB y un dispositivo de 12 GB ejecuta las 12 firmas sin presión de memoria.
- Evaluación comparativa de runtimes: sirve como banco de pruebas para comparar LiteRT-LM en CPU frente a GPU (por ejemplo, 1033 frente a 450 tok/s de prefill en un M4 Max).

## Benchmarks y rendimiento

Rendimiento medido con `litert-lm benchmark` (LiteRT-LM 0.16.0) en Apple M4 Max, con `-p 256 -d 256 --runs 3 --cache no`:

| Backend | Prefill (256 tokens) | Decode | TTFT |
|---|---|---|---|
| GPU | 1033 tok/s | 74,0 tok/s | 0,26 s |
| CPU | 450 tok/s | 22,7 tok/s | 0,61 s |

Rendimiento en dispositivo (arranque en frío, ejecuciones únicas, prompt compuesto):

| Dispositivo | Backend | Prefill | Decode | TTFT | Memoria pico |
|---|---|---|---|---|---|
| iPhone 17 Pro | GPU (Metal) | 96,6 tok/s | 12,8 tok/s | 1,63 s | 5,43 GB |
| iPhone 17 Pro | CPU | 87,3 tok/s | 7,4 tok/s | 1,73 s | 1,82 GB |
| Galaxy S26 | GPU | 116 tok/s | 11,7 tok/s | 1,94 s | No disponible |
| Galaxy S26 | CPU | 88 tok/s | 12,2 tok/s | 2,51 s | No disponible |
| Raspberry Pi 5 (CPU, 4 hilos) | CPU | 24 tok/s | 1,8 tok/s | 11,10 s | No disponible |

Resultados de correctitud:

| Prueba | Resultado |
|---|---|
| Coincidencia de logits vs PyTorch (48 posiciones) | Top-1 y top-5 idénticos; correlación 1.0000; KL ≈ 0 |
| Sanity check de 8 preguntas (4 ejecuciones) | 7/8 en todas; el mismo fallo en las cuatro: "¿Qué es mayor, 0,9 o 0,11?" → "0,11 es mayor que 0,9" |
| Test compuesto de 8 ítems en iPhone 17 Pro CPU | 8/8 |
| Test compuesto de 8 ítems en iPhone 17 Pro GPU | 6/8; los dos fallos coinciden con respuestas incorrectas del propio modelo de referencia fp32 |
| Barrido de longitud de prompt (prefill por fragmentos) | CPU 12–51 y GPU 12–31 sin errores |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM/memoria estimada: el archivo int8 ocupa 1,33 GB; en iPhone 17 Pro el pico es de 1,82 GB en CPU y 5,43 GB en GPU (activaciones fp32 y cachés KV de las seis posiciones de atención compartida a 4096 de contexto).
- GPU recomendadas: no se especifican modelos de datacenter; el modelo está orientado a GPU móviles e integradas. Como referencia de escritorio, un Apple M4 Max alcanza 74,0 tok/s de decodificación en GPU.
- Cabe en GPU de consumo: sí, siempre que se disponga de memoria suficiente para la ruta GPU; un teléfono de 12 GB ejecuta las 12 firmas sin presión de memoria. Para la ruta CPU basta con menos de 2 GB.
- Opciones de despliegue: exclusivamente el runtime LiteRT-LM (versión ≥ 0.15), mediante el comando `litert-lm run` con selección de backend (`--backend gpu`) y control de caché (`--cache no`). No se documenta compatibilidad con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: ver tabla de benchmarks. En Raspberry Pi 5 la decodificación cae a 1,8 tok/s y el TTFT sube a 11,10 s, lo que limita su uso a tareas no interactivas.

## Comparativa con modelos similares

No se dispone de datos de benchmarks estándar ni de comparaciones directas con otros modelos en la información proporcionada. La siguiente tabla recoge únicamente los datos verificables de esta conversión frente a su modelo base.

| Modelo | Parámetros | Contexto | Formato | Runtime | Licencia |
|---|---|---|---|---|---|
| litert-community/Zamba2-1.2B-instruct (esta ficha) | 1,2B | 4096 | `.litertlm` int8 | LiteRT-LM ≥ 0.15 | Apache 2.0 |
| Zyphra/Zamba2-1.2B-instruct (base) | 1,2B | No disponible en esta información | Pesos Hugging Face | PyTorch/Transformers | Apache 2.0 |

Comparativa con alternativas de la misma categoría (otros modelos de ~1B para dispositivo): no disponible.

## Limitaciones y advertencias

- El sanity check de 8 preguntas falla de forma consistente en la comparación numérica "0,9 frente a 0,11", lo que indica debilidades en razonamiento numérico básico.
- Riesgo de alucinación y de errores en aritmética: en el test compuesto del iPhone 17 Pro, la ruta GPU reproduce dos respuestas incorrectas del propio modelo de referencia fp32 (un "63" en lugar de 56 y un eco roto en la rima).
- La ruta GPU emplea activaciones fp32 y consume 5,43 GB de pico en iPhone 17 Pro, aproximadamente tres veces más que la ruta CPU (1,82 GB); en dispositivos con menos de 12 GB puede haber presión de memoria.
- Problema conocido del runtime: en LiteRT-LM 0.18.0, un Engine que ya ejecutó una conversación reutiliza tokens de prompt compartidos y no reinicia el estado recurrente al iniciar una nueva conversación. La solución es crear un Engine nuevo por conversación; el fallo se corrigió en LiteRT-LM main el 2026-11-03 (commit e1f86b05) y está incluido en la release v0.20.0, aunque este modelo no se probó con Engine compartido en esa versión.
- La prueba de conversación compartida no pudo completarse con el archivo `_int8` porque la respuesta del Engine nuevo a "17 × 23" no contenía 391 en ninguna de sus dos ejecuciones.
- Idiomas soportados no documentados; no se garantiza un comportamiento multilingüe correcto.
- No se documenta soporte de tool calling, agentes, visión ni audio, lo que limita su uso en pipelines complejos.
- El modelo requiere LiteRT-LM ≥ 0.15; no es desplegable en runtimes convencionales de servidor sin conversión adicional.
- La verificación de correctitud en iPhone 17 Pro GPU (6/8) fue puntuada con la misma comprobación que posteriormente se corrigió de 8/8 a 7/8 en el sanity check, y esas puntuaciones no se han vuelto a revisar según la model card.
- Licencia Apache 2.0: permite uso comercial, pero conviene conservar los avisos de atribución correspondientes.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/litert-community/Zamba2-1.2B-instruct
- Modelo base: https://huggingface.co/Zyphra/Zamba2-1.2B-instruct
- Runtime LiteRT-LM: https://github.com/google-ai-edge/litert-lm
- Release v0.20.0 de LiteRT-LM: https://github.com/google-ai-edge/LiteRT-LM/releases/tag/v0.20.0
- Commit de corrección del Engine compartido: https://github.com/google-ai-edge/LiteRT-LM/commit/e1f86b05bf8a731331622a2622440e9f93d9a9f5
- Informe del problema de Engine compartido: https://github.com/google-ai-edge/LiteRT-LM/issues/3165
- Ficha de compatibilidad en dispositivo (edge-compat): https://github.com/john-rocky/edge-compat/blob/main/cards/zamba2-1.2b-instruct-int8/CARD.md
