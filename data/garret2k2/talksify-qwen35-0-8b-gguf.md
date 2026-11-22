# garret2k2/talksify-qwen35-0.8b-gguf

## Resumen

Talksify Qwen3.5-0.8B es un ajuste fino mediante LoRA del modelo base Qwen/Qwen3.5-0.8B, desarrollado por el usuario garret2k2 y publicado en formato GGUF. Su propósito no es la generación de texto general, sino una tarea muy concreta: la limpieza de transcripciones de voz a texto (ASR post-processing). Convierte transcripciones crudas generadas por Parakeet TDT 0.6B v3 en prosa escrita coherente, eliminando muletillas, tartamudeos, falsos arranques y cortes artificiales producidos por el detector de actividad de voz (Silero VAD), preservando el contenido y la voz natural del hablante.

El modelo forma parte de Talksify, una aplicación de dictado por voz que se ejecuta localmente en el dispositivo. Con 752 millones de parámetros (0,8B), está diseñado para inferencia en hardware modesto: los checkpoints publicados en Q6_K ocupan 600,57 MB, lo que permite su despliegue en equipos de consumo sin GPU dedicada de gama alta. Soporta 25 idiomas europeos, lo que lo alinea con la cobertura multilingüe de Parakeet v3.

Su relevancia actual reside en la creciente demanda de pipelines de dictado local y privado, donde el post-procesado de transcripciones ASR es un cuello de botella de calidad. Un modelo pequeño, determinista y especializado resuelve ese problema con latencia baja y sin depender de servicios en la nube.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (base Qwen3.5), ajuste fino LoRA fusionado en bf16 |
| Parametros totales | 752.393.024 (0,75B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | Q6_K (unico publicado en este repositorio) |
| Idiomas soportados | 25 idiomas europeos: en, de, fr, es, it, ro, bg, hr, cs, da, nl, et, fi, el, hu, lv, lt, mt, pl, pt, ru, sk, sl, sv, uk |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (320 tensores de texto sin fusionar, sin tensores MTP ni de vision, con plantilla de chat incluida) |
| Tamano del repositorio | 1,3 GB |
| Modelo base | Qwen/Qwen3.5-0.8B |
| Configuracion LoRA | r=32, alpha=64, entrenamiento nativo en bf16, fusionado en bf16 |
| Convertidor | llama.cpp commit 19bc41dbb41e858eebc269b49ccdec1f0d28880c |

## Arquitectura y entrenamiento

El modelo se construye sobre Qwen3.5-0.8B, un transformer decoder-only de la familia Qwen3.5, y se ajusta con LoRA (r=32, alpha=64) en precisión bf16 sobre el checkpoint base. El adaptador se fusiona en bf16 y posteriormente se convierte a GGUF con cuantización Q6_K mediante el script `convert_hf_to_gguf.py` de llama.cpp, usando la opción `--no-mtp` para exportar únicamente los 320 tensores de texto, sin cabezas de predicción multi-token ni componentes de visión. El resultado es un GGUF de 600,57 MB compatible con `mistral.rs` gracias a la fusión de las entradas compartidas de Qwen3.5.

El entrenamiento se realizó durante 2 épocas con pérdida calculada únicamente sobre las completions (completions-only loss), alineada byte a byte con la plantilla de inferencia de producción de Talksify (`enable_thinking=False`). El conjunto de datos consta de 18.127 filas (17.221 de entrenamiento y 906 de validación, sin solapamiento con datos crudos), con una mezcla del 67,0% en inglés (12.145 filas) y 33,0% multilingüe (5.982 filas) cubriendo los 25 idiomas de Parakeet v3. Las fuentes incluyen `category271/whispernow-cleanup` (2.773 filas, licencias CC-BY-4.0 y MIT), `shantanugoel/aawaaz-transcript-cleanup-dataset`, `Akash-Sakala/transcript-formatter-curriculum`, `google-research-datasets/disfl_qa` y `nyralabs/disfluency_speech_german`. Se publican dos checkpoints de la misma ejecución: la época 1 (539 pasos, checkpoint por defecto, mejor WER de contenido en grabaciones reales) y la época 2 (1.078 pasos, menor pérdida de validación, 0,0549, y mejor evaluación sintética).

## Capacidades

- Limpieza de transcripciones ASR: elimina muletillas ("uh", "um"), tartamudeos y palabras repetidas ("I I", "that that").
- Eliminación de falsos arranques y reinicios a mitad de frase, conservando la formulación final del hablante.
- Corrección de cortes artificiales por VAD: elimina puntos y mayúsculas espurias insertadas en pausas y une las frases.
- Corrección de puntuación, mayúsculas y gramática oral rota para producir prosa natural.
- Uso de dos puntos en cláusulas introductorias ("the problem is this:", "here's what I think:").
- Preservación de la voz natural y el contenido real del hablante, incluidas palabras conversacionales como "so", "really", "maybe" o "I think"; no resume ni inventa ideas.
- Salida estrictamente en el idioma de entrada, sin deriva hacia el inglés, incluso con el prompt de sistema en inglés.
- Soporte de 25 idiomas europeos con especial cobertura del inglés (67% del entrenamiento) y del bloque Tier 1 (alemán, francés, español, italiano, rumano).
- Decodificación determinista (greedy, temperatura 0) y modo no-thinking.
- No soporta tool calling, function calling, agentes ni visión: es un modelo especializado de una sola tarea.

## Casos de uso

- Dictado local en aplicaciones de escritorio: integrado en Talksify, el modelo recibe la transcripción cruda de Parakeet TDT 0.6B v3 y devuelve texto limpio en el mismo idioma, con 600 MB de pesos que caben en cualquier equipo moderno.
- Privacidad en entornos sensibles: al ejecutarse en el dispositivo mediante GGUF, permite limpiar transcripciones de reuniones médicas, legales o internas sin enviar audio ni texto a servicios externos.
- Notas de voz multilingües: con 25 idiomas europeos soportados, un usuario que dicta en español, alemán o polaco obtiene prosa limpia sin que el modelo traduzca al inglés.
- Post-procesado de subtítulos generados por ASR: elimina muletillas y falsos arranques de transcripciones de vídeo antes de publicar subtítulos, mejorando la legibilidad sin alterar el contenido hablado.
- Transcripción de entrevistas y grupos focales: el modelo conserva el contenido y el tono del hablante (incluidas palabras conversacionales) mientras elimina el ruido oral, lo que reduce el trabajo de edición posterior.
- Integración en pipelines de accesibilidad: limpieza en tiempo real de dictado para usuarios con dificultades motoras o del habla, donde los tartamudeos y reinicios son frecuentes y deben eliminarse sin perder el mensaje.
- Evaluación A/B de checkpoints en producción: el repositorio incluye dos épocas para comparar conservadurismo en las eliminaciones (época 1) frente a menor pérdida de validación (época 2) según el caso de uso.

## Benchmarks y rendimiento

| Metrica | Epoca 1 (por defecto) | Epoca 2 (candidata A/B) |
|---|---|---|
| Pasos de entrenamiento | 539 | 1.078 |
| Perdida de validacion | No disponible | 0,0549 |
| WER de contenido en grabaciones reales | 5,5% global; 6,6% en segmentos >60 s | No disponible |
| Evaluacion sintetica | No disponible | 27/29 (incluye 5/5 en Tier 1 multilingue y 9/10 en evaluacion de prompt) |
| Tamano del archivo | 629.743.712 B (600,57 MB) | 629.743.712 B (600,57 MB) |
| SHA-256 | df21112849d9651b7b8bf9fc9d3c4fdd2e5bdf3b8bc09b1cd2ae312cb0e78d9b | 6b6beff4b254565030aeddb525ce61a3999887838e671d1fa0b6d8ebef5094ae |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible; las metricas anteriores son especificas de la tarea de limpieza de transcripciones.

## Requisitos de hardware

- VRAM estimada para inferencia: alrededor de 1 GB con Q6_K (600,57 MB de pesos mas cache KV y overhead del runtime); no se dispone de cifras oficiales de consumo.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM; tambien valido en CPU. No se especifican modelos concretos (A100, H100, RTX 4090) en la informacion disponible.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU de consumo moderna e incluso en graficas integradas, dado el tamano del checkpoint.
- Opciones de despliegue: llama.cpp (formato nativo GGUF), `mistral.rs` (compatibilidad declarada por el autor) y cualquier runtime compatible con GGUF. No se mencionan vLLM, Ollama o TGI en la informacion disponible.
- Latencia y throughput: no disponibles. La decodificacion es greedy determinista, lo que reduce la variabilidad pero no se publican cifras de tokens por segundo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Formato |
|---|---|---|---|---|---|
| Talksify Qwen3.5-0.8B | 0,75B | No disponible | Limpieza de transcripciones ASR en 25 idiomas europeos | Apache 2.0 | GGUF Q6_K |
| Qwen/Qwen3.5-0.8B (base) | 0,8B | No disponible | Generacion de texto general | No disponible en la informacion proporcionada | Safetensors |
| Parakeet TDT 0.6B v3 | 0,6B | No disponible | ASR (voz a texto) | No disponible en la informacion proporcionada | No disponible |

La comparativa con alternativas de la misma categoria (modelos especializados en limpieza de transcripciones) no esta disponible en la informacion proporcionada. El modelo base Qwen3.5-0.8B no realiza la tarea de limpieza sin el ajuste fino, y Parakeet es el componente ASR previo en el pipeline, no un sustituto.

## Limitaciones y advertencias

- Modelo de una sola tarea: no es un asistente general; no responde preguntas ni sigue instrucciones del contenido delimitado por `<transcript>`. Usarlo fuera de ese formato produce resultados no validados.
- Riesgo de eliminacion excesiva: la epoca 1 es conservadora, pero el modelo puede borrar contenido real si lo interpreta como muletilla o falso arranque; el autor reporta un WER de contenido del 5,5% en grabaciones reales.
- Riesgo de alucinacion: aunque el prompt exige no resumir ni inventar ideas, es un modelo generativo y puede introducir cambios no solicitados en pasajes ambiguos.
- Cobertura desigual por idioma: el 67% del entrenamiento es ingles; los idiomas Tier 2 (41,5% del bloque multilingue) tienen menos ejemplos y su calidad puede ser inferior.
- Contexto maximo no documentado: no se especifica la longitud de contexto, lo que limita la planificacion para transcripciones muy largas.
- Dependencia del pipeline: esta disenado para transcripciones de Parakeet TDT 0.6B v3 con cortes de Silero VAD; otros motores ASR o segmentadores pueden degradar la calidad.
- Formato de pesos unico: solo se publica Q6_K; no hay variantes de menor precision (Q4, Q5) ni safetensors en este repositorio.
- Licencia Apache 2.0: permite uso comercial, pero se recomienda verificar las licencias de los datasets de entrenamiento (CC-BY-4.0, MIT y otras) si se redistribuye el modelo.
- Sin datos de benchmarks estandar ni de latencia: la evaluacion en produccion requiere pruebas propias.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/garret2k2/talksify-qwen35-0.8b-gguf
- Checkpoint por defecto (epoca 1): https://huggingface.co/garret2k2/talksify-qwen35-0.8b-gguf/resolve/main/talksify-qwen35-0.8b-Q6_K.gguf
- Checkpoint epoca 2: https://huggingface.co/garret2k2/talksify-qwen35-0.8b-gguf/resolve/main/talksify-qwen35-0.8b-epoch2-Q6_K.gguf
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Repositorio de Talksify: https://github.com/dejang/talksify
- Modelo ASR Parakeet TDT 0.6B v3: https://huggingface.co/nvidia/parakeet-tdt-0.6b-v3
- Dataset whispernow-cleanup: https://huggingface.co/datasets/category271/whispernow-cleanup
- Dataset aawaaz-transcript-cleanup: https://huggingface.co/datasets/shantanugoel/aawaaz-transcript-cleanup-dataset
- Dataset transcript-formatter-curriculum: https://huggingface.co/datasets/Akash-Sakala/transcript-formatter-curriculum
- Dataset disfl_qa: https://huggingface.co/datasets/google-research-datasets/disfl_qa
- Dataset disfluency_speech_german: https://huggingface.co/datasets/nyralabs/disfluency_speech_german
