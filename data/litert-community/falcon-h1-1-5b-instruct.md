# litert-community/Falcon-H1-1.5B-Instruct

## Resumen

Falcon-H1-1.5B-Instruct (LiteRT-LM) es la conversión al formato `.litertlm` del modelo `tiiuae/Falcon-H1-1.5B-Instruct` de TII (Technology Innovation Institute), empaquetada por la comunidad `litert-community` para inferencia on-device con el runtime LiteRT-LM de Google. El modelo base emplea una arquitectura híbrida poco habitual: cada una de sus 24 capas ejecuta en paralelo una rama de atención con grouped-query attention (GQA) y una rama Mamba2 de selective scan, sumando ambas salidas sobre la misma entrada.

El resultado es un transformer híbrido con estado recurrente de tamaño constante (conv + SSM) además de la KV cache tradicional, lo que permite decodificación con huella de memoria más predecible en dispositivos con recursos limitados. Esta versión concreta se distribuye cuantizada a int8 dinámico en capas lineales y embedding, mientras que las convoluciones y el scan permanecen en coma flotante; el fichero resultante ocupa 1,61 GB.

Su relevancia radica en el despliegue local: no requiere GPU de servidor ni infraestructura cloud, y el runtime exporta firmas de prefill de múltiples longitudes (1–1024 tokens) para elegir fragmentos ajustados. Está pensado para aplicaciones móviles y de borde donde la latencia de arranque y el consumo de memoria son críticos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Híbrida paralela: GQA + Mamba2 selective scan en cada capa (24 capas) |
| Parametros totales | 1.500 millones (1.5B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible en la información proporcionada (firmas de prefill exportadas de 1 a 1024 tokens) |
| Tipos de cuantizacion | int8 dinámico en capas lineales y embedding; convs y scan en coma flotante; activaciones fp32 declaradas para GPU |
| Idiomas soportados | No disponible |
| Licencia | Falcon LLM License (falcon-llm-license), uso sujeto a los términos de TII |
| Formato de pesos | `.litertlm` (LiteRT-LM); requiere litert-lm ≥ 0.15 |
| Tamano del fichero | 1,61 GB (`Falcon-H1-1.5B-Instruct_int8.litertlm`) |
| Tamano del repositorio | 5,2 GB |
| Runtime | LiteRT-LM (Google AI Edge) |
| Backends soportados | CPU, GPU (Metal en Apple, OpenCL en Arm Mali, Qualcomm Adreno) |

## Arquitectura y entrenamiento

El diseño de Falcon-H1 es completamente híbrido: cada capa combina una rama de atención con grouped-query attention y una rama Mamba2 de selective scan que operan en paralelo sobre la misma entrada y cuyas salidas se suman. Esto implica que cada capa mantiene simultáneamente una KV cache y un estado recurrente de tamaño constante (convolución + SSM), lo que cambia el perfil de memoria respecto a un transformer puro, especialmente en generación de secuencias largas.

La información disponible no detalla el volumen de tokens de entrenamiento, la composición del dataset ni si hubo fases de RLHF o DPO en el modelo base. Tampoco se documentan innovaciones de decodificación especulativa. La conversión a LiteRT-LM sí incorpora trabajo técnico relevante: exportación con firmas de prefill de múltiples longitudes (1–1024) para que el runtime seleccione fragmentos ajustados, tokenizer embebido y la plantilla de chat ChatML estándar de Falcon-H1, actualizada el 2026-09-21 para aceptar la forma de partes de contenido de litert-lm 0.18 sin alterar pesos ni tokenizer.

## Capacidades

- Generación de texto conversacional e instructiva, con plantilla de chat ChatML de Falcon-H1.
- Razonamiento básico y aritmética simple, aunque frágil a esta escala (ver limitaciones).
- Ejecución on-device con backends CPU y GPU según el hardware.
- Prefill fragmentado en múltiples longitudes para reducir latencia de primer token.
- Soporte de conversaciones multi-turno mediante el objeto Conversation del runtime LiteRT-LM (con la salvedad del bug de estado recurrente descrito abajo).
- Capacidades multilingües: no documentadas en la información disponible.
- Tool calling, function calling, agentes y modos de razonamiento extendido: no documentados en la información disponible.
- Visión y audio: no soportados (modelo exclusivamente de texto).

## Casos de uso

- Asistentes embebidos en aplicaciones móviles: el fichero de 1,61 GB y el consumo de 2,54 GB en iPhone 17 Pro con backend Metal permiten integrar un asistente conversacional dentro de una app iOS o Android sin depender de la nube.
- Autocompletado y sugerencias de texto en el teclado: con 25,8 tok/s de decodificación en GPU móvil, el modelo puede generar sugerencias cortas con latencia aceptable en un teclado inteligente.
- Clasificación y etiquetado de texto en el dispositivo: útil en aplicaciones donde los datos no pueden salir del terminal (sanidad, legal, finanzas), aprovechando el backend CPU con 1,02 GB de memoria pico.
- Procesamiento de prompts largos en dispositivos de gama alta: el prefill de 186,8 tok/s en Metal y la ventana de prefill de hasta 1024 tokens lo hacen adecuado para resumir o analizar documentos cortos localmente.
- Prototipado e investigación en inferencia de borde: sirve como banco de pruebas para estudiar el comportamiento de arquitecturas híbridas Mamba2 + atención bajo cuantización int8 en hardware real.
- Filtrado y moderación de contenido offline: la baja huella de memoria en CPU (1,02 GB) permite ejecutarlo junto a otras tareas en un dispositivo sin agotar recursos.
- Aplicaciones de privacidad por diseño: cualquier flujo donde el texto del usuario no deba abandonar el dispositivo se beneficia de la inferencia puramente local.

## Benchmarks y rendimiento

Rendimiento medido con `litert-lm benchmark` (litert-lm 0.16.0) en Apple M4 Max, con `-p 256 -d 256 --runs 3 --cache no`:

| Backend | Prefill (256 tokens) | Decodificación | TTFT |
|---|---|---|---|
| GPU | 1447 tok/s | 102,9 tok/s | 0,19 s |
| CPU | 238 tok/s | 33,7 tok/s | 1,11 s |

Mediciones en dispositivo (arranque en frío, ejecución única, prompt compuesto de 146 tokens):

| Dispositivo | Backend | Prefill | Decodificación | TTFT | Memoria pico |
|---|---|---|---|---|---|
| iPhone 17 Pro | GPU (Metal) | 186,8 tok/s | 25,8 tok/s | 0,88 s | 2,54 GB |
| iPhone 17 Pro | CPU | 50,3 tok/s | 15,5 tok/s | 3,16 s | 1,02 GB |

En Samsung Galaxy S26 con backend GPU (medición del 2026-08-24, no repetida tras el reempaquetado del 2026-11-09): delegación completa de 41.683 de 41.683 operaciones en 12 subgrafos sobre LiteRT GPU, con pico de 2398 MiB.

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible. La model card sí reporta verificaciones de corrección: coincidencia de logits contra PyTorch con diferencia máxima de 1,6e-04 y correlación 1,000000 en 8 posiciones de decodificación; 7/8 aciertos en CPU y 6/8 en GPU sobre un test de 8 preguntas, y 8/8 en iPhone 17 Pro tanto en GPU como en CPU.

## Requisitos de hardware

- VRAM/memoria estimada: 1,61 GB de pesos en disco; 2,54 GB de memoria pico en GPU móvil (iPhone 17 Pro) y 1,02 GB en CPU. En Galaxy S26 con GPU, 2398 MiB.
- GPU recomendadas: Apple Silicon con Metal (M4 Max medido), iPhone 17 Pro, Pixel 8a (Arm Mali con OpenCL), Qualcomm Adreno. No se documentan requisitos para A100, H100 o RTX 4090, ya que el formato está orientado a borde.
- Cabe en GPU de consumo y en móviles de gama alta; el backend GPU usa activaciones fp32, por lo que el consumo de memoria es varias veces superior al de CPU.
- Opciones de despliegue: exclusivamente el runtime LiteRT-LM (versión ≥ 0.15; se recomienda ≥ 0.20.0 por la corrección del bug de estado recurrente). No hay soporte documentado para vLLM, llama.cpp, Ollama ni TGI en este formato.
- Latencia y throughput: TTFT de 0,19 s en GPU de M4 Max y 0,88 s en iPhone 17 Pro; decodificación de 102,9 tok/s en M4 Max GPU y 25,8 tok/s en iPhone 17 Pro GPU.
- En Android de gama baja, la GPU mejora el prefill y el TTFT pero no la decodificación, que está limitada por ancho de banda de memoria; para respuestas largas conviene el backend CPU.

## Comparativa con modelos similares

| Modelo | Parámetros | Arquitectura | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Falcon-H1-1.5B-Instruct (LiteRT-LM) | 1,5B | Híbrida GQA + Mamba2 | No disponible | `.litertlm` | Falcon LLM License | Hugging Face (litert-community) |
| Falcon-H1-0.5B-Instruct (LiteRT-LM) | 0,5B | Híbrida GQA + Mamba2 | No disponible | `.litertlm` | Falcon LLM License | Hugging Face (litert-community) |
| tiiuae/Falcon-H1-1.5B-Instruct | 1,5B | Híbrida GQA + Mamba2 | No disponible | safetensors (bf16) | Falcon LLM License | Hugging Face (TII) |

La comparación con alternativas de otros fabricantes en formato LiteRT-LM no está disponible en la información proporcionada. El modelo base en bf16 sirve como referencia de calidad: la exportación float iguala sus logits con diferencia máxima de 1,6e-04.

## Limitaciones y advertencias

- Aritmética frágil a esta escala: en el test de 8 preguntas, la pregunta "17+25" se responde "32" también en la referencia bf16 de Hugging Face, lo que indica un fallo del modelo base y no de la conversión.
- Cuantización int8: introduce inversiones greedy límite en ítems aritméticos concretos (fallo en "8×7" en GPU). No se observa degeneración general.
- Bug de estado recurrente en litert-lm 0.18.0: al reutilizar un Engine para una segunda conversación, el runtime reutiliza tokens de prompt compartidos y no reinicia el estado recurrente. Se corrigió en LiteRT-LM main el 2026-11-03 (commit e1f86b05) y está incluido en v0.20.0, pero este modelo no se probó con Engine compartido en v0.20.0. Crear un Engine nuevo por conversación.
- El fichero publicado el 2026-11-09 no se ha ejecutado en teléfono; las mediciones móviles corresponden a versiones anteriores del empaquetado.
- Backend GPU con activaciones fp32: consumo de memoria varias veces superior al de CPU.
- Licencia Falcon LLM License: no es una licencia de código abierto permisiva; es imprescindible revisar los términos de TII antes de uso comercial.
- Idiomas soportados no documentados; no se garantiza calidad multilingüe.
- Longitud de contexto no especificada en la información disponible.
- Riesgo de alucinación inherente a un modelo de 1,5B; no apto para tareas que exijan precisión factual sin verificación externa.
- Formato cerrado al runtime LiteRT-LM: no desplegable en stacks de servidor convencionales.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/litert-community/Falcon-H1-1.5B-Instruct
- Modelo base: https://huggingface.co/tiiuae/Falcon-H1-1.5B-Instruct
- Variante 0.5B en LiteRT-LM: https://huggingface.co/litert-community/Falcon-H1-0.5B-Instruct
- Runtime LiteRT-LM: https://github.com/google-ai-edge/litert-lm
- Release v0.20.0: https://github.com/google-ai-edge/LiteRT-LM/releases/tag/v0.20.0
- Commit de corrección del estado recurrente: https://github.com/google-ai-edge/LiteRT-LM/commit/e1f86b05bf8a731331622a2622440e9f93d9a9f5
- Informe del bug de Engine compartido: https://github.com/google-ai-edge/LiteRT-LM/issues/3165
- Términos de licencia Falcon: https://falconllm.tii.ae/falcon-terms-and-conditions.html
