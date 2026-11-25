# litert-community/Inkling-2-Mini

## Resumen

Inkling-2-Mini es un modelo multimodal de tipo vision-language desarrollado por Thinking Machines, aquí distribuido por la comunidad litert-community como una conversión al runtime LiteRT-LM de Google para ejecución on-device. El modelo acepta entradas de texto e imagen y emplea una arquitectura de mezcla de expertos (MoE), según las etiquetas del repositorio. Esta conversión concreta está pensada para inferencia local sin depender de servicios en la nube, empaquetada en un único fichero de 27,74 GB en formato int8.

La relevancia de esta ficha radica en que documenta una conversión práctica a LiteRT-LM, con datos medidos de rendimiento y memoria sobre hardware Apple M4 Max. El contexto está limitado a 4.096 tokens, y cada imagen consume 256 de ellos. El modelo base es thinkingmachines/Inkling-2-Mini, y esta variante se distribuye bajo licencia Apache 2.0.

Los datos publicados por el autor incluyen métricas de prefill, decodificación, tiempo hasta el primer token y huella de memoria, además de comprobaciones de fidelidad frente al modelo original. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | MoE (mezcla de expertos), multimodal vision-language; runtime LiteRT-LM |
| Parámetros totales | no disponible |
| Parámetros activos | no disponible |
| Longitud de contexto | 4.096 tokens (cada imagen consume 256 tokens) |
| Tipos de cuantización | int8 (fichero `Inkling-2-Mini_int8.litertlm`) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | LiteRT-LM (`.litertlm`), conversión cuantizada del modelo base |

## Arquitectura y entrenamiento

La información disponible indica que el modelo base es de tipo MoE y multimodal (vision-language), capaz de recibir texto e imagen. La conversión a LiteRT-LM cuantiza el modelo a int8 y lo empaqueta en un único fichero `.litertlm` de 27,74 GB, ejecutable mediante el runtime LiteRT-LM 0.19.2. El pipeline declarado en Hugging Face es `image-text-to-text`.

No se dispone de datos sobre número de tokens de entrenamiento, composición del dataset, uso de RLHF/DPO ni innovaciones técnicas del modelo original en la información proporcionada. La conversión conserva el comportamiento del modelo base: las comprobaciones de fidelidad reportadas indican que, en 12 preguntas de texto corto y 3 imágenes, todos los tokens de respuesta quedaron a menos de 1,0 logit del token superior del modelo del autor. El runtime procesa imágenes redimensionándolas a 640 × 640 píxeles sin preservar la relación de aspecto.

## Capacidades

- Generación de texto multimodal: responde a preguntas sobre imágenes adjuntas (pipeline `image-text-to-text`).
- Modo de razonamiento explícito: las respuestas pueden incluir un bloque de pensamiento delimitado por `[thinking]` y `[/thinking]`, expuesto también como canal `thinking` separado en la API de Python.
- Conversación multi-turno: se reporta una conversación de 3 turnos con la tercera respuesta correcta.
- Lectura de texto en imágenes: en una prueba con un recibo de 16 líneas, se recuperaron 14/16 líneas en GPU y 15/16 en CPU.
- Ejecución on-device en GPU (WebGPU) y CPU (XNNPACK).
- Capacidades de tool calling, function calling, agentes, matemáticas o código: no disponibles en la información proporcionada.
- Idiomas soportados: no disponibles.

## Casos de uso

- Descripción y análisis de imágenes en local: el modelo puede describir fotografías y escenas sin enviar datos a la nube, útil en entornos con requisitos de privacidad, usando el backend GPU o CPU de LiteRT-LM.
- Extracción de información de documentos escaneados: la prueba con un recibo de 16 líneas muestra capacidad de lectura de texto en imagen; adecuado para digitalización de recibos o formularios con imágenes cuadradas de hasta 640 × 640 píxeles.
- Asistentes conversacionales multi-turno en dispositivos: el modelo mantiene contexto entre turnos dentro de la ventana de 4.096 tokens, con el pensamiento incluido en el cómputo del contexto.
- Prototipado de aplicaciones vision-language on-device: al ejecutarse con LiteRT-LM en macOS sobre Apple Silicon, sirve para validar pipelines de imagen-texto antes de desplegar en otros entornos.
- Preguntas y respuestas sobre capturas o fotos en escritorio: con una latencia de prefill de 80,75 tok/s en GPU, es viable para consultas interactivas sobre una imagen y una pregunta corta.
- Verificación de fidelidad de conversiones cuantizadas: las comprobaciones de logits frente al modelo base permiten usar esta variante como referencia para validar otras conversiones int8 del mismo modelo.
- Automatización por lotes en CPU: con 40,46 tok/s de prefill y 3,36 tok/s de decodificación en CPU, puede procesar tareas de descripción de imágenes en serie sin GPU.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. Se incluyen a continuación las métricas de rendimiento y fidelidad reportadas por el autor de la conversión, medidas en Apple M4 Max (128 GB, macOS 27.0) con LiteRT-LM 0.19.2, prompt de texto de 1.024 tokens y 256 tokens generados, mediana de 3 procesos (2026-11-22):

| Backend | Prefill (tok/s) | Decode (tok/s) | Time to first token |
|---|---:|---:|---:|
| GPU (WebGPU) | 80,75 | 7,05 | 12,82 s |
| CPU (XNNPACK, hilos por defecto) | 40,46 | 3,36 | 25,61 s |

| Comprobación | GPU (WebGPU) | CPU |
|---|---|---|
| 12 preguntas cortas de texto: respuesta correcta | 12/12 | 12/12 |
| Las mismas 12: todos los tokens a menos de 1,0 logit del token superior del modelo del autor | 12/12 | 12/12 |
| 3 imágenes: todos los tokens a menos de 1,0 logit del token superior del modelo del autor | 3/3 | 3/3 |
| Recibo de 16 líneas: líneas encontradas en la respuesta | 14/16 | 15/16 |
| Conversación de 3 turnos: tercera respuesta correcta | pass | pass |

| Memoria pico | GPU (WebGPU) | CPU |
|---|---:|---:|
| Prompt de texto de 1.024 tokens, 256 tokens de salida | ~11 GB | 9,15 GB |
| Una imagen y una pregunta corta | 16,54–16,60 GB | 4,76–4,86 GB |

| Primera ejecución | GPU (WebGPU) | CPU |
|---|---:|---:|
| Cachés escritas por los comandos de ejemplo | 25,90 GB | 27,03 GB |
| Primera ejecución completa, respuesta incluida | 102 s | 224 s |
| Creación del motor en la primera ejecución de solo texto, escribiendo cachés | 38,18 s | 22,44 s |
| Creación del motor en ejecuciones posteriores, leyendo cachés | 3,252–3,513 s | 0,445–0,935 s |

## Requisitos de hardware

- VRAM estimada: aproximadamente 11 GB en GPU para un prompt de texto de 1.024 tokens con 256 tokens de salida; 16,54–16,60 GB en GPU para una imagen con pregunta corta. En CPU, 9,15 GB y 4,76–4,86 GB respectivamente.
- Espacio en disco: el fichero pesa 27,74 GB; con las cachés de ambos backends tras la primera ejecución, el total asciende a 80,67 GB.
- GPU recomendadas: los datos reportados corresponden a Apple M4 Max con 128 GB mediante WebGPU; no se han publicado mediciones en A100, H100 o RTX 4090.
- GPU de consumo: no se ha verificado su ejecución en GPUs de consumo; el único hardware probado es Apple M4 Max.
- Móviles: no probado; el fichero supera los 12 GB de memoria de un Galaxy S26, por lo que no cabe en ese dispositivo.
- Opciones de despliegue: LiteRT-LM 0.19.2 (PyPI) mediante CLI `litert-lm run`, con backend GPU (WebGPU) o CPU (XNNPACK); también API de Python. No se mencionan vLLM, llama.cpp, Ollama ni TGI para este formato.
- Latencia y throughput: prefill 80,75 tok/s (GPU) y 40,46 tok/s (CPU); decodificación 7,05 tok/s (GPU) y 3,36 tok/s (CPU); tiempo hasta el primer token 12,82 s (GPU) y 25,61 s (CPU) en el benchmark de 1.024 tokens de entrada.
- Nota: el autor indica que la velocidad sigue en ajuste.

## Comparativa con modelos similares

No se dispone de datos de benchmarks ni de especificaciones de modelos comparables en la información proporcionada. La tabla siguiente recoge únicamente los datos disponibles de esta conversión; las celdas de alternativas quedan como no disponibles.

| Modelo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Inkling-2-Mini (LiteRT-LM, litert-community) | no disponible (MoE, int8, 27,74 GB) | 4.096 tokens | 7,05 tok/s decode GPU; 3,36 tok/s decode CPU (M4 Max) | Apache 2.0 | Hugging Face, LiteRT-LM |
| thinkingmachines/Inkling-2-Mini (modelo base) | no disponible | no disponible | no disponible | no disponible | Hugging Face |
| Alternativas de la misma categoría | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Contexto limitado a 4.096 tokens; superarlo provoca un error `INVALID_ARGUMENT: Input token ids are too long` (por ejemplo, 7.480 >= 4.096). El CLI puede salir con código 0 pese al fallo, por lo que hay que revisar la salida.
- Cada imagen consume 256 tokens del contexto.
- Las imágenes se estiran a 640 × 640 píxeles sin preservar la proporción; es necesario rellenarlas a un cuadrado (negro a la derecha y abajo) para evitar distorsión.
- El pensamiento generado se prefilla de nuevo en la caché KV tras cada respuesta completa y cuenta para el límite de 4.096 tokens; en una conversación de dos turnos por API de Python, el contexto retuvo 605 tokens tras el primer turno, 184 de ellos de pensamiento.
- En la API de Python de LiteRT-LM 0.19.2, el stream de la respuesta termina solo después de ese prefilling, 3,5–7,4 s después de `<|end_message|>` en CPU y 6,6–8,6 s en GPU.
- No probado en móviles; no cabe en dispositivos con 12 GB de memoria como un Galaxy S26.
- No se han publicado datos sobre sesgos, riesgo de alucinación ni idiomas soportados.
- Licencia Apache 2.0: permite uso comercial, pero deben conservarse los avisos de licencia; verificar las condiciones del modelo base thinkingmachines/Inkling-2-Mini.
- Rendimiento medido en un único equipo (Apple M4 Max); no hay datos de latencia o throughput en otras GPU.
- El autor advierte que la velocidad sigue en ajuste; los datos pueden cambiar en versiones posteriores del runtime.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/litert-community/Inkling-2-Mini
- Fichero de pesos: https://huggingface.co/litert-community/Inkling-2-Mini/blob/main/Inkling-2-Mini_int8.litertlm
- Modelo base: https://huggingface.co/thinkingmachines/Inkling-2-Mini
- Runtime LiteRT-LM: https://github.com/google-ai-edge/LiteRT-LM
- Imagen de ejemplo usada en la model card: https://huggingface.co/datasets/huggingface/documentation-images/resolve/main/pipeline-cat-chonk.jpeg
