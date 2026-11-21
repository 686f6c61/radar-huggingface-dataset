# imYChaudhary22/zen-polish-v32-bf16

## Resumen

Kanso Satori 1.0 (publicado originalmente como zen-polish-v32-bf16) es un modelo de limpieza y formateo de dictado desarrollado por BuilderHelm AI para ZenVoice, una aplicación de dictado para macOS. Se trata de un fine-tuning mediante LoRA del modelo Qwen3-4B-Instruct-2507, cuyo objetivo es transformar transcripciones crudas de voz a texto en texto escrito bien formateado: corrige puntuación y mayúsculas, elimina muletillas y falsos arranques, y restaura las formas escritas de números, fechas, horas, importes, URL y direcciones de correo electrónico sin alterar el significado ni la formulación original del hablante.

El modelo tiene 4.022.468.096 parámetros en precisión completa bf16 (8,04 GB en dos shards) y está empaquetado en formato MLX, por lo que su ejecución está pensada para Apple Silicon. La relevancia de esta variante bf16 es que constituye el maestro de precisión completa desde el que se derivan las compilaciones cuantizadas para uso en dispositivo (la versión de 4 bits DWQ de 2,26 GB y la de 3 bits de 1,76 GB), y el punto de partida para cualquier cuantización futura.

El modelo no es un asistente generalista: es una herramienta especializada de post-procesado de ASR. Su utilidad práctica radica en que un modelo de 4B puede superar en calidad de formateo a alternativas más pequeñas (la variante Lite de 1,7B) manteniendo una latencia aceptable en hardware de consumo Apple, aunque a costa de un mayor consumo de memoria (8,2 GB) y una velocidad de decodificación notablemente inferior (15 tok/s frente a 47 tok/s de la versión de 4 bits en un M5).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso (Qwen3), fine-tuning LoRA fusionado |
| Parametros totales | 4.022.468.096 (4B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada (entrenamiento con max length 1.024) |
| Tipos de cuantizacion | bf16 (esta version); derivadas oficiales de 4 bits DWQ y 3 bits |
| Idiomas soportados | No disponible en la informacion proporcionada |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors en formato MLX (libreria mlx), dos shards, 8,04 GB |

## Arquitectura y entrenamiento

El modelo parte de Qwen3-4B-Instruct-2507, un transformer decoder-only denso de 4B parámetros, y le aplica un adaptador LoRA de rango 32, alpha 64, escala 2.0 y dropout 0.05 sobre las 36 capas y todos los módulos lineales. El entrenamiento se ejecutó sobre la versión de 4 bits del modelo base (`mlx-community/Qwen3-4B-Instruct-2507-4bit`, revisión `50d4277`) con un schedule de decaimiento coseno de 1e-4 a 1e-6 durante 3.400 pasos, batch de 2, 3.500 iteraciones, longitud máxima de 1.024 tokens y gradient checkpointing. El checkpoint final (paso 3500) se seleccionó sobre un conjunto de validación reservado, y el adaptador se fusionó posteriormente en los pesos bf16 originales con `mlx_lm fuse`.

Los datos de entrenamiento provienen del corpus de la versión v2.2, compuesto por 86.524 pares de entrenamiento extraídos de 10 fuentes con licencias MIT, Apache-2.0, CC-BY-4.0 y CC0. Una innovación relevante para la reproducibilidad es que el adaptador se entrenó con un bloque de pensamiento vacío (`<think>\n\n</think>\n\n`) al inicio de cada respuesta, de modo que el `chat_template.jinja` incluido en el repositorio difiere del template estándar de Qwen3-4B-Instruct-2507 y debe usarse obligatoriamente junto con los ficheros de tokenizer empaquetados; de lo contrario, las filas de entrenamiento se renderizan de forma distinta a la vista durante el ajuste.

## Capacidades

- Formateo de dictado: corrección de puntuación, mayúsculas y espaciado en transcripciones ASR crudas.
- Eliminación de muletillas, falsos arranques y repeticiones propias del habla espontánea.
- Normalización de formas escritas: números, fechas, horas, importes monetarios, URL y direcciones de correo electrónico.
- Adaptación de tono y capitalización al contexto de una aplicación indicada mediante una línea `app:` en el prompt de sistema.
- Generación de texto conversacional general, heredada del modelo base Qwen3-4B-Instruct-2507.
- Modo sin pensamiento explícito (`enable_thinking=False`), con el bloque de pensamiento vacío inyectado por el template.
- No se documentan en la información disponible capacidades de tool calling, function calling, agentes multi-paso, visión ni audio; el modelo es exclusivamente de texto.

## Casos de uso

- Post-procesado de dictado en aplicaciones de voz a texto: el modelo recibe la transcripción cruda del ASR y devuelve texto limpio y puntuado, integrándose como etapa final del pipeline de ZenVoice en macOS sobre Apple Silicon con MLX.
- Generación de actas y notas de reunión: a partir de transcripciones de voz, produce texto legible con puntuación correcta y sin muletillas, adecuado para revisión humana posterior.
- Redacción de correos dictados: la normalización de direcciones de correo y URL, junto con la adaptación de tono mediante la línea `app:`, permite generar mensajes listos para enviar desde un cliente de correo.
- Introducción de datos estructurados por voz: la restauración de fechas, horas e importes en su forma escrita facilita el registro de citas, gastos o eventos dictados en aplicaciones de productividad.
- Accesibilidad: usuarios con movilidad reducida que dependen del dictado obtienen texto con calidad de escritura sin necesidad de corrección manual posterior.
- Maestro para cuantización y despliegue en dispositivo: al ser la fuente bf16 de las compilaciones de 4 y 3 bits, sirve como referencia para evaluar la pérdida de calidad introducida por la cuantización y para generar nuevas variantes con `mlx_lm.convert` o `mlx_lm dwq`.
- Evaluación de modelos de formateo: su conjunto de evaluación eval_v500 (500 dictados con control de fuga) y sus métricas WER, exact match y Punct F1 permiten comparar sistemáticamente alternativas de post-procesado ASR.

## Benchmarks y rendimiento

Evaluación sobre eval_v500 (500 dictados, con control de fuga de datos), decodificación greedy, máximo 200 tokens, Apple M5, MLX 0.32.2:

| Metrica | v3.2 bf16 (este modelo) | v3.2 4-bit DWQ | v3.2 forma entrenada (base 4-bit + adaptador en vivo) | v2.2 Lite (1,7B) |
|---|---|---|---|---|
| WER | 5,1% | 4,7% | 5,0% | 5,5% |
| Exact match | 65,6% | 67,2% | 65,2% | 65,8% |
| Punct F1 | 0,849 | 0,859 | 0,861 | 0,863 |
| Pesos | 8,04 GB | 2,26 GB | 2,40 GB | 1,05 GB |
| Velocidad de decodificacion | 15 tok/s | 47 tok/s | 36 tok/s | 73 tok/s |

Según el autor, las cuatro variantes están dentro del ruido estadístico en este conjunto. La ventaja del 4B sobre la variante Lite se manifiesta en datos reservados de v2.2: la compilación de 4 bits obtiene +3,6 puntos de exact match (IC 95% de +0,4 a +6,8). No se han publicado resultados de benchmarks generales (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM/memoria unificada estimada para esta versión bf16: 8,2 GB según el autor.
- Hardware de referencia: Apple M5 con MLX 0.32.2, donde decodifica a 15 tok/s.
- Para uso en dispositivo se recomienda la compilación de 4 bits (2,26 GB, 47 tok/s en M5) o la de 3 bits (1,76 GB); esta versión bf16 es el maestro de precisión completa, no la compilación óptima para producción en dispositivo.
- Al estar empaquetado para MLX, el despliegue previsto es Apple Silicon; no se documenta soporte para GPU NVIDIA (A100, H100, RTX 4090) ni para backends CUDA en la información disponible.
- Opciones de despliegue documentadas: `mlx_lm` (carga y generación) y `mlx_lm.convert` / `mlx_lm dwq` para cuantización. No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Throughput y latencia: 15 tok/s en decodificación greedy sobre M5; no se proporcionan datos de latencia de prefill ni de throughput en lote.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | WER (eval_v500) | Exact match | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Kanso Satori 1.0 bf16 (este) | 4B | No disponible | 5,1% | 65,6% | Apache-2.0 | Hugging Face, formato MLX |
| Kanso Satori 1.0 (4-bit DWQ) | 4B | No disponible | 4,7% | 67,2% | Apache-2.0 | Hugging Face, 2,26 GB |
| Kanso Satori 1.0 3-bit | 4B | No disponible | No disponible | No disponible | Apache-2.0 | Hugging Face, 1,76 GB |
| Kanso Koi 1.0 / v2.2 Lite | 1,7B | No disponible | 5,5% | 65,8% | Apache-2.0 | Hugging Face, 1,05 GB |

La comparación con modelos de propósito general del mismo tamaño (por ejemplo, el propio Qwen3-4B-Instruct-2507 sin fine-tuning) no está disponible en la información proporcionada, ya que no se han publicado métricas de formateo de dictado para ellos en esta fuente.

## Limitaciones y advertencias

- Modelo especializado: su rendimiento óptimo se limita a la tarea de limpieza de dictado; no está diseñado como asistente generalista ni para razonamiento complejo.
- Riesgo de alucinación: al reescribir texto puede alterar el significado o la formulación original del hablante; el prompt de sistema insiste en preservar el significado y las palabras, pero no hay garantía formal.
- Dependencia estricta del template: usar el `chat_template.jinja` y los ficheros de tokenizer empaquetados es obligatorio; el template estándar de Qwen3-4B-Instruct-2507 no incluye el bloque de pensamiento vacío con el que se entrenó y degrada los resultados.
- Idiomas soportados no documentados: no se especifica qué lenguas cubre el corpus de entrenamiento ni su calidad fuera del inglés.
- Longitud de contexto no documentada; el entrenamiento usó una longitud máxima de 1.024 tokens, lo que limita los dictados largos.
- Formato MLX: no hay soporte documentado para CUDA, vLLM, llama.cpp u otros backends, lo que restringe el despliegue a Apple Silicon.
- La licencia Apache-2.0 permite uso comercial, pero los datos de entrenamiento solo proceden de fuentes MIT, Apache-2.0, CC-BY-4.0 y CC0; la lista de atribuciones está en el repositorio de ZenVoice.
- Esta versión bf16 consume 8,2 GB de memoria y decodifica a 15 tok/s, por lo que no es adecuada para dispositivos con memoria limitada; para ello existen las compilaciones cuantizadas.
- No se documentan sesgos específicos del fine-tuning; los sesgos heredados del modelo base Qwen3-4B-Instruct-2507 no están evaluados en la información disponible.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/imYChaudhary22/zen-polish-v32-bf16
- Repositorio de la organización: https://huggingface.co/BuilderHelm/Kanso-Satori-1.0-bf16
- Compilación de 4 bits recomendada: https://huggingface.co/BuilderHelm/Kanso-Satori-1.0
- Compilación de 3 bits: https://huggingface.co/BuilderHelm/Kanso-Satori-1.0-3bit
- Modelo base: https://huggingface.co/Qwen/Qwen3-4B-Instruct-2507
- Corpus de entrenamiento (Kanso Koi 1.0): https://huggingface.co/BuilderHelm/Kanso-Koi-1.0
- Página de ZenVoice: https://getzenvoice.com
- Descarga de ZenVoice para Mac: https://getzenvoice.com/download
- Organización BuilderHelm en Hugging Face: https://huggingface.co/BuilderHelm
- Licencia Apache-2.0 del modelo base: https://huggingface.co/Qwen/Qwen3-4B-Instruct-2507/blob/main/LICENSE
