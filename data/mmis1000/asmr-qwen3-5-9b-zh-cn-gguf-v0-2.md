# mmis1000/asmr-qwen3.5-9b-zh-cn-gguf-v0.2

## Resumen

El modelo `mmis1000/asmr-qwen3.5-9b-zh-cn-gguf-v0.2` es un ajuste fino del modelo base `unsloth/Qwen3.5-9B` (arquitectura Qwen3.5, 8.95 mil millones de parametros) especializado en la traduccion de transcripciones de ASMR japonesas (generadas por sistemas ASR como Whisper) a chino simplificado. El autor, mmis1000, lo ha desarrollado como parte de un pipeline mas amplio de transcripcion y traduccion de audio ASMR, y esta distribuido exclusivamente en formato GGUF para su uso con llama.cpp y motores compatibles.

El modelo resuelve un problema muy concreto: las transcripciones automaticas de audio ASMR contienen errores tipicos de ASR (repeticiones, homofonos, ruido), y ademas el dominio tiene una terminologia especifica (onomatopeyas, gemidos, jerga de personajes) que una traduccion generica no maneja bien. Este modelo normaliza esas imperfecciones, aplica un glosario por obra y traduce el dialogo preservando el tono emocional. Su relevancia actual radica en que cubre un nicho de traduccion especializada con salida estructurada en JSON, pensada para flujos de subtitulado automatizado.

La version v0.2 extiende la ventana de contexto de entrenamiento hasta 8192 tokens sin usar RoPE scaling ni YaRN, mediante una continuacion determinista del adaptador v0.1. El modelo esta pensado para ejecutarse en local con cuantizaciones que van desde 5.2 GB (q4_k_m) hasta 16.7 GB (bf16), lo que lo hace accesible en GPUs de consumo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3.5 (transformer decoder-only, basado en unsloth/Qwen3.5-9B) |
| Parametros totales | 8.953.803.264 (8.95B) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | 8192 tokens (maxima de entrenamiento; contexto total en runtime, no solo entrada) |
| Tipos de cuantizacion | q4_k_m (5.2 GB), q6_k (6.9 GB), q8_0 (8.9 GB), bf16 (16.7 GB) |
| Idiomas soportados | japones (entrada), chino simplificado (salida) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (solo; el adaptador LoRA original no se publica en este repo) |

## Arquitectura y entrenamiento

El modelo parte de `unsloth/Qwen3.5-9B`, una version optimizada del modelo Qwen3.5 de 9B parametros. El ajuste fino se realizo con LoRA (rank 16, alpha 16) sobre los modulos `o_proj`, `gate_proj`, `q_proj`, `k_proj`, `down_proj`, `v_proj` y `up_proj`, en precision bf16 y con una longitud maxima de secuencia de 8192 tokens. No se empleo RoPE scaling ni YaRN; la extension a 8k se logro mediante una continuacion determinista del adaptador v0.1, consumiendo 800 pasos de entrenamiento distribuidos en 520 muestras coherentes de la misma pista, 120 de contexto lejano/recuperacion de glosario y 160 de repeticion ordinaria.

El entrenamiento se centra en una tarea de traduccion con formato estricto: entrada como array JSON de segmentos con `id`, `text`, `start` y `end`; salida como array JSON agrupando segmentos contiguos en una misma frase, con campos `ids`, `text`, `start` y `end`. El prompt incluye un glosario por obra (terminos japoneses con su traduccion al chino), reglas de correccion de errores ASR (repeticiones, homofonos, lineas de copyright) y reglas de transliteracion de onomatopeyas. No se menciona el uso de RLHF ni DPO; el ajuste es supervisado sobre pares de transcripcion-traduccion.

## Capacidades

- Traduccion de transcripciones ASR japonesas a chino simplificado, normalizando errores tipicos de Whisper (repeticiones, homofonos, fragmentos corruptos).
- Aplicacion de glosarios especificos por obra (terminos, personajes, CV) definidos en el prompt.
- Salida estructurada en JSON con agrupacion de segmentos contiguos en frases completas, incluyendo marcas temporales.
- Manejo de onomatopeyas japonesas (p. ej. パンパン → 啪啪) y de expresiones de gemidos/respiracion (あ、ん、はあ → 啊、嗯、哈、呼).
- Preservacion del tono emocional y el registro de los personajes en la traduccion.
- Deteccion y anulacion de lineas de copyright o marcas de agua (texto `null` en la salida).
- Generacion de texto en formato JSON valido, compatible con decodificacion estructurada (GBNF, JSON schema) en llama.cpp, vLLM y outlines.

## Casos de uso

- Subtitulado automatizado de audio ASMR japones: el modelo se integra en un pipeline que primero transcribe con Whisper/SenseVoice y luego traduce al chino simplificado, produciendo subtitulos con marcas temporales listos para su uso en reproductores de video.
- Localizacion de contenido ASMR para plataformas chinas: permite traducir obras completas manteniendo la coherencia de la terminologia gracias al glosario por obra, algo critico en un dominio con jerga muy especifica.
- Traduccion de dialogos con contexto largo: con 8192 tokens de contexto, puede procesar pistas de audio largas sin perder el hilo de la conversacion, agrupando segmentos separados en frases coherentes.
- Generacion de subtitulos bilingues: combinando la salida del modelo con la transcripcion original, se pueden generar subtitulos lado a lado en japones y chino para audiencias bilingues.
- Correccion y normalizacion de transcripciones ASR: el modelo no solo traduce, sino que limpia repeticiones y errores de reconocimiento, lo que lo hace util como post-procesador de cualquier salida de Whisper en japones.
- Flujos de traduccion por lotes con decodificacion estructurada: al garantizar JSON valido mediante esquemas, puede integrarse en pipelines de linea de comandos (como el repositorio `asmr-ai-translator-ja2zh`) para procesar bibliotecas enteras de audio sin intervencion manual.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La validacion descrita en la model card es cualitativa: seis filas de prueba con comprobacion semantica manual, de las cuales cinco resultaron semanticamente utilizables. No hay datos de MMLU, HumanEval, GSM8K ni otras metricas estandar comparables.

## Requisitos de hardware

- VRAM estimada para inferencia: 5.2 GB (q4_k_m), 6.9 GB (q6_k), 8.9 GB (q8_0), 16.7 GB (bf16). A estos valores hay que anadir el contexto (KV cache) y la memoria del runtime.
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM para q4_k_m (p. ej. RTX 3060 12GB, RTX 4060 Ti 16GB); para q8_0 o bf16 se recomienda 12-24 GB (RTX 3090, RTX 4090, A5000).
- Cabe en GPUs de consumo: si, la cuantizacion q4_k_m (5.2 GB) es ejecutable en GPUs de gama media con 8 GB o mas.
- Opciones de despliegue: llama.cpp (llama-server, llama-cli), vLLM, Ollama (si se importa el GGUF), TGI, y cualquier motor compatible con GGUF.
- Latencia y throughput: no disponible. El rendimiento dependera del hardware, la cuantizacion y el uso de decodificacion estructurada.

## Comparativa con modelos similares

No se dispone de informacion sobre modelos directamente comparables en la misma tarea (traduccion de ASMR japones a chino con salida JSON). El propio autor publica variantes relacionadas, como `asmr-qwen3.5-9b-zh-cn-echo-mtp-gguf-v0.1` (con modo echo y multi-track), pero no hay datos de rendimiento relativo entre ellas. Como referencia de arquitectura, el modelo base Qwen3.5-9B puede compararse con otros LLMs de 9B, pero la especializacion en este dominio no tiene equivalentes publicos documentados.

## Limitaciones y advertencias

- El modelo puede producir contenido sexualmente explicito, ya que el dominio de entrenamiento incluye dialogos ASMR para adultos. No es adecuado para uso general ni para menores.
- La validacion de esta version v0.2 fue limitada: no recibio la matriz completa de 200 filas usada en otras variantes del autor, y solo se evaluo con cuantizacion Q8_0; el resto de cuantizaciones no fueron puntuadas de forma independiente.
- Transcripciones ASR gravemente corruptas pueden provocar contenido inventado, incluso cuando la estructura JSON de salida es valida. El autor recomienda dividir el audio en ventanas mas cortas si el ASR es repetitivo o defectuoso.
- Pueden persistir errores de traduccion localizados en fragmentos ambiguos o malformados.
- El contexto de 8192 tokens es el contexto total en runtime, no un presupuesto solo de entrada; hay que reservar espacio para el JSON generado.
- No existe una comparacion controlada completa entre v0.1 y v0.2.
- La licencia Apache-2.0 permite uso comercial, pero el contenido generado puede estar sujeto a restricciones de la obra original (derechos de autor del audio ASMR).

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/mmis1000/asmr-qwen3.5-9b-zh-cn-gguf-v0.2
- Repositorio del pipeline de traduccion: https://github.com/mmis1000/asmr-ai-translator-ja2zh
- Variante v0.1 (chino simplificado, modo estandar): https://huggingface.co/mmis1000/asmr-qwen3.5-9b-zh-cn-gguf-v0.1
- Variante con modo echo y multi-track: https://huggingface.co/mmis1000/asmr-qwen3.5-9b-zh-cn-echo-mtp-gguf-v0.1
- Modelo base: https://huggingface.co/unsloth/Qwen3.5-9B
