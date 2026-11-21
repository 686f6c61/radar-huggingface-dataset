# BuilderHelm/Kanso-Satori-1.0-bf16

## Resumen

Kanso Satori 1.0 (bf16) es un modelo de limpieza y formateo de dictado desarrollado por BuilderHelm AI para ZenVoice, una aplicación de dictado para macOS. No es un modelo de propósito general: es un ajuste fino especializado de Qwen3-4B-Instruct-2507 entrenado para transformar transcripciones de voz en bruto (con muletillas, falsos arranques, puntuación ausente y números escritos con letras) en texto escrito limpio, conservando el significado y las palabras del hablante.

El modelo parte de la arquitectura transformer densa de Qwen3-4B-Instruct-2507, con 4.022.468.096 parámetros, y se distribuye en precisión completa bf16 (8,04 GB en dos shards) como fuente maestra desde la que se derivan las compilaciones cuantizadas para uso en dispositivo (2,26 GB en 4 bits y 1,76 GB en 3 bits). El adaptador LoRA v3.2 está fusionado en los pesos bf16 originales mediante `mlx_lm fuse`.

Su relevancia es práctica: ocupa un nicho muy concreto del pipeline de dictado (postprocesado de ASR) donde los modelos generalistas grandes son caros y lentos, y demuestra que un ajuste fino de 4B con LoRA r32 sobre 86.524 pares puede alcanzar un WER del 5,1% en su dominio, con un 65,6% de coincidencia exacta, ejecutándose en Apple Silicon vía MLX.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (Qwen3-4B-Instruct-2507), ajuste fino con LoRA fusionado |
| Parametros totales | 4.022.468.096 |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | no disponible (entrenamiento con max length 1.024) |
| Tipos de cuantizacion | bf16 (este repo); 4-bit DWQ (2,26 GB) y 3-bit (1,76 GB) en repos derivados |
| Idiomas soportados | no disponible (la model card no declara lista de idiomas) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (MLX, dos shards, 8,04 GB) |

## Arquitectura y entrenamiento

El modelo es un transformer denso de 4B parámetros heredado de Qwen3-4B-Instruct-2507, sin cambios estructurales. El ajuste se realizó con LoRA de rango 32, alpha 64, escala 2,0 y dropout 0,05, aplicado a las 36 capas y a todos los módulos lineales, sobre `mlx-community/Qwen3-4B-Instruct-2507-4bit` en la revisión `50d4277`. El schedule fue coseno de 1e-4 a 1e-6 durante 3.400 pasos, batch 2, 3.500 iteraciones, longitud máxima 1.024 y gradient checkpointing; el checkpoint final (paso 3500) se eligió sobre un conjunto de validación reservado.

Los datos de entrenamiento provienen del corpus v2.2 de 10 fuentes, con 86.524 pares de entrenamiento, y solo de fuentes con licencia MIT, Apache-2.0, CC-BY-4.0 o CC0. Una innovación relevante es el uso de un bloque de pensamiento vacío (`<think>\n\n</think>\n\n`) al inicio de cada respuesta durante el entrenamiento: el `chat_template.jinja` incluido en el repo termina el prompt de generación con ese bloque, a diferencia de la plantilla estándar de Qwen3-4B-Instruct-2507. Usar la plantilla oficial degrada la calidad de salida, por lo que el tokenizer y la plantilla incluidos son parte integral del artefacto.

## Capacidades

- Limpieza de dictado: corrección de puntuación y mayúsculas, eliminación de muletillas y falsos arranques.
- Restauración de formas escritas de números, fechas, horas, importes monetarios, URL y direcciones de correo.
- Adaptación de mayúsculas y tono al contexto de una aplicación indicada mediante una línea `app:` en el prompt.
- Salida directa del texto limpio, sin comentarios ni explicaciones adicionales.
- Generación de texto conversacional (pipeline `text-generation`) heredada del modelo base.
- No se documentan capacidades de tool calling, agentes, visión, audio ni modo de razonamiento extendido.
- Capacidades multilingües: no disponibles en la información proporcionada.

## Casos de uso

- Postprocesado de dictado en aplicaciones de voz a texto: el modelo recibe la transcripción bruta del ASR y devuelve texto con puntuación y mayúsculas correctas, eliminando muletillas; es exactamente el escenario para el que fue entrenado y el que evalúa el benchmark eval_v500.
- Integración en la app ZenVoice para Mac: las compilaciones cuantizadas (4-bit, 2,26 GB) están pensadas para ejecutarse en dispositivo con MLX sobre Apple Silicon, con 47 tok/s en un M5, lo que permite latencia interactiva sin conexión a la nube.
- Normalización de notas de reunión dictadas: convierte "so um can we move the standup to three" en "Can we move the standup to three.", restaurando además horas, fechas e importes en su forma escrita.
- Formateo contextual por aplicación: la línea `app:` del prompt permite ajustar mayúsculas y tono según si el texto va a un correo, un chat o un documento, útil en asistentes de escritura que enrutan dictado a distintas aplicaciones.
- Generación de corpus de texto limpio para evaluación de ASR: sirve como referencia de postprocesado para medir WER y coincidencia exacta en pipelines de reconocimiento de voz.
- Prototipado de pipelines de dictado en local: al ser Apache-2.0 y ejecutable con `mlx_lm`, permite experimentar con cuantización propia (`mlx_lm.convert`, `mlx_lm dwq`) partiendo de los pesos maestros bf16.
- Despliegue como fuente para cuantizaciones propias: el repo se declara explícitamente como punto de partida para futuras cuantizaciones, conservando tokenizer y plantilla incluidos.

## Benchmarks y rendimiento

Evaluación eval_v500 (500 dictados, control de fuga de datos), decodificación greedy, máximo 200 tokens, Apple M5, MLX 0.32.2:

| Metrica | v3.2 bf16 (este modelo) | v3.2 4-bit DWQ | v3.2 forma entrenada (base 4-bit + adaptador en vivo) | v2.2 Lite (1,7B) |
|---|---|---|---|---|
| WER | 5,1% | 4,7% | 5,0% | 5,5% |
| Exact match | 65,6% | 67,2% | 65,2% | 65,8% |
| Punct F1 | 0,849 | 0,859 | 0,861 | 0,863 |
| Pesos | 8,04 GB | 2,26 GB | 2,40 GB | 1,05 GB |
| Velocidad de decodificación | 15 tok/s | 47 tok/s | 36 tok/s | 73 tok/s |

Según la model card, las cuatro variantes están dentro del ruido en este conjunto. La ventaja del 4B sobre Lite se observa en datos reservados de v2.2: la compilación 4-bit obtiene +3,6 puntos de coincidencia exacta (IC 95%: +0,4 a +6,8). No se han publicado resultados de benchmarks generales (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM/memoria para inferencia: 8,2 GB para esta versión bf16 según la model card; 2,26 GB para la compilación 4-bit DWQ; 1,76 GB para la 3-bit.
- GPU recomendadas: el modelo está empaquetado para MLX, por lo que el entorno objetivo es Apple Silicon (la model card cita un Apple M5). Para GPU NVIDIA no se documenta soporte en este repo.
- ¿Cabe en GPU de consumo? No hay datos para GPUs de consumo NVIDIA; en Apple Silicon cabe en equipos con al menos 8,2 GB de memoria unificada para bf16, y en configuraciones mucho más modestas con las versiones cuantizadas.
- Opciones de despliegue: `mlx_lm` (load/generate), `mlx_lm.convert` y `mlx_lm dwq` para cuantizar. No se documenta vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: 15 tok/s en bf16 y 47 tok/s en 4-bit sobre Apple M5 con MLX 0.32.2, decodificación greedy y máximo 200 tokens.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento en dominio | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Kanso Satori 1.0 bf16 | 4,02B | no disponible | WER 5,1%; exact match 65,6% | Apache-2.0 | Hugging Face, MLX |
| Kanso Satori 1.0 (4-bit DWQ) | 4,02B | no disponible | WER 4,7%; exact match 67,2% | Apache-2.0 | Hugging Face, MLX |
| Kanso Koi 1.0 (v2.2 Lite) | 1,7B | no disponible | WER 5,5%; exact match 65,8% | Apache-2.0 (según repo base) | Hugging Face, MLX |
| Qwen3-4B-Instruct-2507 (base) | 4,02B | no disponible | no evaluado en tarea de dictado | Apache-2.0 | Hugging Face |

La comparación significativa es interna a la familia Kanso: el 4B supera al Lite de 1,7B en +3,6 puntos de exact match sobre datos reservados de v2.2, a costa de mayor peso y menor velocidad. No se dispone de comparación con modelos de limpieza de dictado de otros proveedores.

## Limitaciones y advertencias

- Modelo especializado: está entrenado para limpiar dictado; su uso como modelo conversacional general no está evaluado y probablemente rinda por debajo del base Qwen3-4B-Instruct-2507.
- Dependencia crítica de la plantilla: usar el `chat_template.jinja` oficial de Qwen en lugar del incluido elimina el bloque de pensamiento vacío con el que se entrenó y degrada la salida. Hay que conservar también los ficheros de tokenizer del repo.
- Riesgo de alucinación: como todo modelo generativo, puede reescribir o completar contenido no dicho; la model card insiste en conservar el significado y las palabras del hablante, pero no hay garantía formal.
- Sesgos: no se documentan sesgos conocidos ni evaluación de sesgo en la información disponible.
- Idiomas: la model card no declara idiomas soportados; el corpus de entrenamiento y la evaluación son en inglés, por lo que el rendimiento en castellano no está verificado.
- Contexto: la longitud de contexto no se declara; el entrenamiento usó longitud máxima 1.024, lo que limita los dictados largos.
- Licencia: Apache-2.0 permite uso comercial, pero los datos de entrenamiento solo cubren fuentes MIT, Apache-2.0, CC-BY-4.0 y CC0; la lista de atribuciones está en el repositorio de ZenVoice.
- Ecosistema: empaquetado exclusivamente para MLX; no hay pesos GGUF ni soporte documentado para vLLM, llama.cpp u Ollama en este repo.
- Rendimiento: 15 tok/s en bf16 es lento para uso interactivo; para producción en dispositivo hay que usar la compilación 4-bit.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/BuilderHelm/Kanso-Satori-1.0-bf16
- Compilación 4-bit recomendada: https://huggingface.co/BuilderHelm/Kanso-Satori-1.0
- Compilación 3-bit: https://huggingface.co/BuilderHelm/Kanso-Satori-1.0-3bit
- Corpus de entrenamiento v2.2: https://huggingface.co/BuilderHelm/Kanso-Koi-1.0
- Modelo base: https://huggingface.co/Qwen/Qwen3-4B-Instruct-2507
- Licencia del base: https://huggingface.co/Qwen/Qwen3-4B-Instruct-2507/blob/main/LICENSE
- Organización en Hugging Face: https://huggingface.co/BuilderHelm
- ZenVoice (homepage): https://getzenvoice.com
- ZenVoice para Mac (descarga): https://getzenvoice.com/download
