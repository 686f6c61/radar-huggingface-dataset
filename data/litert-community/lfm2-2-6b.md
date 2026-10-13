# litert-community/LFM2-2.6B

## Resumen

LFM2-2.6B en formato LiteRT-LM es una conversión cuantizada del modelo LiquidAI/LFM2-2.6B, publicada por el usuario comunitario litert-community para el runtime LiteRT-LM de Google (el sucesor de TFLite para inferencia en dispositivo). El modelo original lo desarrolla Liquid AI y emplea una arquitectura híbrida de 30 capas —22 convolucionales y 8 de atención— con 2.569.272.320 parámetros, orientada a ejecución en el borde (móvil, portátil, edge). Esta ficha cubre específicamente los artefactos `.litertlm` en int8 e int4, no los pesos originales en safetensors.

La relevancia de esta conversión es práctica: permite ejecutar un modelo de ~2,6 B en GPU y CPU de teléfonos Android y Mac sin infraestructura de servidor, con una pérdida de precisión mínima respecto a la referencia bf16 en las pruebas publicadas. Según Liquid AI, LFM2-2.6B es el único modelo de la familia LFM2 con razonamiento híbrido dinámico, que emite una traza entre `<think>` y `</think>` ante indicaciones complejas o multilingües.

El repo tiene un tamaño de 4,3 GB y contiene dos ficheros: uno int8 de 2,72 GB y uno int4 de 1,53 GB (un 43,8 % más pequeño). El contexto declarado por Liquid AI es de 32.768 tokens, pero estos ficheros están limitados a 4.096. La licencia es lfm1.0 (personalizada, no estándar), por lo que conviene revisar sus términos antes de cualquier uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer híbrido: 30 capas, 22 convolucionales + 8 de atención |
| Parametros totales | 2.569.272.320 (~2,57 B) |
| Parametros activos | No aplica (arquitectura densa, no MoE) |
| Longitud de contexto | 4.096 tokens en estos ficheros; Liquid AI declara 32.768 para el modelo original |
| Tipos de cuantizacion | int8 (dynamic en lineales + embedding int8, convoluciones en float); int4 (blockwise-32 + OCTAV en lineales, lm_head y embedding en int8) |
| Idiomas soportados | Inglés, árabe, chino, francés, alemán, japonés, coreano y español (según Liquid AI; los metadatos de HuggingFace indican "no disponible") |
| Licencia | lfm1.0 (licencia personalizada "other") |
| Formato de pesos | `.litertlm` (LiteRT-LM); no incluye safetensors ni GGUF |
| Tamano de los ficheros | int8: 2,72 GB (sección de pesos de 2.722.843.088 bytes, 2,54 GiB); int4: 1,53 GB |
| Runtime | LiteRT-LM (probado con litert-lm 0.18.0 en Mac y binario Android precompilado) |
| Modelo base | LiquidAI/LFM2-2.6B (relación: quantized) |

## Arquitectura y entrenamiento

La arquitectura subyacente es un transformer híbrido: de las 30 capas, 22 son convolucionales y 8 emplean atención, una combinación que Liquid AI usa para reducir el coste de cómputo y memoria en inferencia respecto a un transformer de atención completa equivalente. Esta ficha no describe el entrenamiento del modelo original (número de tokens, composición del dataset, uso de RLHF/DPO), ya que esa información no está incluida en la documentación proporcionada; para ello hay que consultar la model card de LiquidAI/LFM2-2.6B. La innovation destacable del modelo es el razonamiento híbrido dinámico: genera una traza interna entre `<think>` y `</think>` solo cuando la indicación lo requiere.

La conversión a LiteRT-LM mantiene las convoluciones en float en el fichero int8 y aplica cuantización blockwise-32 con OCTAV en los lineales del fichero int4, con lm_head y embedding en int8. En las pruebas de precisión publicadas, las versiones cuantizadas quedan dentro de dos ítems de la referencia bf16, lo que indica una degradación muy contenida. El chat template es idéntico byte a byte al de LiteRT-LM (`models/lfm2/chat_template.jinja`, commit 86a7e6d0), con tokens de parada `<|im_end|>` y `<|endoftext|>` y token de inicio `<|startoftext|>`. La traza de razonamiento se enruta a un canal `thought` que la CLI imprime entre `[thought]` y `[/thought]`.

## Capacidades

- Generación de texto y conversación multi-turno en ocho idiomas (inglés, árabe, chino, francés, alemán, japonés, coreano y español).
- Razonamiento paso a paso para problemas matemáticos: en GSM8K (n=100) con indicación de razonamiento por pasos, el fichero int8 obtiene 89 y el int4, 87.
- Seguimiento de instrucciones verificables: en IFEval-lite (n=120, prompt-level strict) el int8 obtiene 85 y el int4, 87.
- Razonamiento híbrido dinámico con traza entre `<think>` y `</think>` para indicaciones complejas o multilingües; en las pruebas apareció en 1 de 120 indicaciones de IFEval-lite y de forma inesperada ante "What is the capital of France?".
- Tool calling / function calling declarado (tipo de modelo `lfm2`): ambos ficheros devolvieron de forma parseada la llamada `get_weather` (información truncada en la model card).
- Extracción de datos estructurados: el ejemplo oficial extrae fechas de un texto ("The meeting moved from May 3 to May 17.").
- Uso orientado a agentes, RAG y escritura creativa, según las recomendaciones de Liquid AI.
- Ejecución en dispositivo con delegación completa de las 12 firmas del grafo en GPU (medido en tres GPUs).

## Casos de uso

- Asistente conversacional en el móvil: el modelo cabe en un teléfono Android de gama alta (Pixel 8a o Galaxy S26) y responde a preguntas cortas en CPU o GPU, lo que permite asistentes locales sin enviar datos a la nube.
- Extracción de datos estructurados en formularios: dado un texto libre, extrae campos como fechas o nombres; es el caso de uso documentado en la propia model card y encaja con sus 4.096 tokens de contexto.
- RAG en aplicaciones de escritorio: con un contexto de 4.096 tokens se pueden insertar unos pocos fragmentos recuperados y generar respuestas ancladas en ellos; Liquid AI lo recomienda explícitamente para RAG.
- Resolución de problemas matemáticos escolares: con indicación de razonamiento por pasos obtiene 87-89 sobre 100 en GSM8K, útil para tutores educativos que muestren el procedimiento.
- Agentes con tool calling en apps Android: el modelo declara llamadas a funciones parseables, lo que permite encadenar acciones (consultar clima, mover eventos de calendario) en un bucle multi-paso local.
- Generación de texto creativo y redacción multilingüe: cubre ocho idiomas y está pensado para conversación y escritura creativa, no para conocimiento factual intensivo.
- Clasificación y etiquetado de instrucciones verificables en pipelines de datos: sus buenos resultados en IFEval-lite (85-87) permiten usarlo como filtro de calidad de instrucciones en proceso por lotes.
- Prototipado de aplicaciones edge con la Google AI Edge Gallery: se puede probar en Android e iOS sin escribir código, para evaluar viabilidad antes de integrar.

## Benchmarks y rendimiento

Precisión (greedy, hasta 2048 tokens de salida; las puntuaciones solo son comparables dentro de esta tabla, no con las publicadas por Liquid AI, cuyo GSM8K es 82,41 con otra configuración):

| Configuracion | GSM8K (n=100) | IFEval-lite (n=120) |
|---|---|---|
| bf16 de referencia (transformers, MPS) | 88 | 85 |
| int8, litert-lm | 89 | 85 |
| int4, litert-lm | 87 | 87 |

Comprobación de corrección (8 preguntas, temperatura 0, un proceso por pregunta en Mac M4 Max): int8 7/8 en CPU y en GPU; int4 8/8 en CPU y 7/8 en GPU; bf16 con transformers 7/8. En ambos teléfonos, los dos ficheros respondieron correctamente a "What is the capital of France? Answer in one sentence." en GPU y CPU.

Rendimiento (segundos para un prefill de 1024 tokens más 256 tokens decodificados, contexto 2048):

| Configuracion | Mac M4 Max | Galaxy S26 | Pixel 8a |
|---|---|---|---|
| int4 GPU | 1,98 | 10,70 | 22,11 |
| int8 GPU | 2,45 | 13,47 | 25,07 |
| int8 CPU | 9,10 | 18,17 | 50,17 |
| int4 CPU | 10,75 | 23,54 | 68,48 |

El int4 es más rápido en toda GPU y el int8 en toda CPU. No hay mediciones en iOS.

## Requisitos de hardware

- Tamaño de pesos: 2,72 GB en int8 y 1,53 GB en int4. La sección de pesos del int8 ocupa exactamente 2.722.843.088 bytes (2,54 GiB).
- Caché de pesos compilados (si no se usa `--cache no`): 2,58 GB para int8 y 1,51 GB para int4 en CPU, que se escribe junto al modelo.
- VRAM y RAM totales: no se especifican cifras cerradas en la información disponible; como referencia práctica, hay que sumar los pesos más el estado del runtime y la caché KV para 4.096 tokens de contexto.
- GPU validadas: Apple M4 Max, Galaxy S26 y Pixel 8a (las 12 firmas del grafo se delegaron por completo en las tres).
- GPU de escritorio recomendadas: no disponible (no se han publicado pruebas con A100, H100 o RTX 4090).
- Viabilidad en GPU de consumo: el fichero int4 de 1,53 GB cabe con holgura en cualquier GPU consumer moderna; el int8 de 2,72 GB también, siempre que haya al menos 4 GB libres.
- Viabilidad en móvil: ambos ficheros se ejecutan en Pixel 8a y Galaxy S26; el int4 es notablemente más rápido (22,11 s frente a 25,07 s en GPU en Pixel 8a).
- iOS: no medido. El int8 necesita 2,54 GiB solo en pesos y la model card de LFM2.5-2.6B indica que un fichero int8 de 2,87 GB solo corrió en un iPhone 17 Pro con los entitlements de direccionamiento virtual extendido y memoria incrementada.
- Opciones de despliegue: CLI `litert-lm` (`run` y `benchmark`), binario Android precompilado y Google AI Edge Gallery en Android e iOS. No hay soporte documentado en esta ficha para vLLM, llama.cpp, Ollama o TGI, dado que el formato es propietario de LiteRT-LM.
- Muestreo por defecto: temperatura 0,1, top-k 50, top-p 1,0. Liquid AI recomienda temperatura 0,3, min_p 0,15 y repetition_penalty 1,05, pero el bundle no incorpora min_p ni penalización por repetición.
- Latencia: los tiempos de la tabla anterior son la referencia principal; no se publican cifras de tokens por segundo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| litert-community/LFM2-2.6B (int8) | 2,57 B | 4.096 (32.768 en el original) | `.litertlm` | lfm1.0 | Repo de 2,72 GB + pesos; 4 descargas |
| litert-community/LFM2-2.6B (int4) | 2,57 B | 4.096 (32.768 en el original) | `.litertlm` | lfm1.0 | Repo de 1,53 GB; 4 descargas |
| LiquidAI/LFM2-2.6B (bf16) | 2,57 B | 32.768 | safetensors | lfm1.0 | Modelo original de Liquid AI |
| litert-community/LFM2.5-2.6B (int8) | No disponible | No disponible | `.litertlm` | No disponible | Fichero int8 con sección de pesos de 2,87 GB; probado en iPhone 17 Pro con entitlements |

No se dispone de información en la documentación proporcionada sobre alternativas equivalentes de otros fabricantes (por ejemplo, modelos de 2-3 B para edge de otras familias), por lo que la comparativa se limita a variantes del mismo modelo.

## Limitaciones y advertencias

- Liquid AI indica explícitamente que LFM2 no está pensado para tareas intensivas en conocimiento ni para programación, y recomienda ajustarlo con fine-tuning a casos de uso concretos.
- Riesgo de alucinación inherente a un modelo de 2,57 B: no debe usarse como fuente de verdad factual sin verificación.
- El contexto queda reducido a 4.096 tokens en estos ficheros, frente a los 32.768 del modelo original; esto limita RAG con muchos fragmentos y conversaciones largas.
- La traza de razonamiento puede aparecer de forma inesperada (por ejemplo, ante una pregunta trivial como la capital de Francia) y `--thinking-budget 0` o `32` no la suprimieron en la prueba documentada; en GPU la salida del int8 fue idéntica a la del run sin flag.
- El sampler del bundle carece de min_p y de penalización por repetición, lo que impide reproducir la configuración recomendada por Liquid AI sin herramientas externas.
- La licencia lfm1.0 es personalizada ("other"): hay que revisar el enlace de licencia antes de cualquier uso comercial, y no se detallan aquí sus restricciones.
- El fichero int8 falló en litert-lm 0.17.1 (respondía como si no hubiera pregunta); se requiere 0.18.0 o superior.
- No hay mediciones en iOS, y el int8 podría no caber en iPhone sin entitlements especiales.
- El repositorio tiene 4 descargas y 0 likes: validación comunitaria mínima.
- La conversión es de un usuario comunitario (litert-community), no de Liquid AI, por lo que la garantía de calidad recae en las pruebas publicadas en la model card.
- Las fechas de creación y actualización del repositorio son de octubre de 2026, posteriores a la fecha de redacción habitual; conviene verificar su vigencia.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/litert-community/LFM2-2.6B
- Modelo base: https://huggingface.co/LiquidAI/LFM2-2.6B
- Licencia lfm1.0: https://huggingface.co/LiquidAI/LFM2-2.6B/blob/main/LICENSE
- Runtime LiteRT-LM: https://github.com/google-ai-edge/LiteRT-LM
- Chat template de referencia: https://github.com/google-ai-edge/LiteRT-LM/blob/86a7e6d098c3a6578208fc8538228fa704ca2e8b/models/lfm2/chat_template.jinja
- Guía de GPU en Android: https://github.com/john-rocky/hf-to-litertlm/blob/main/docs/android-gpu.md
- Script de verificación de calidad: https://github.com/john-rocky/hf-to-litertlm/blob/main/scripts/verify_quality.py
- Repositorio de conversión (referenciado en los enlaces anteriores): https://github.com/john-rocky/hf-to-litertlm
- Organización litert-community: https://huggingface.co/litert-community
- LFM2.5-2.6B en LiteRT-LM: https://huggingface.co/litert-community/LFM2.5-2.6B
- Google AI Edge Gallery: https://huggingface.co/litert-community (sección de la organización que recomienda probar los modelos en la app AI Edge Gallery en Android e iOS)
