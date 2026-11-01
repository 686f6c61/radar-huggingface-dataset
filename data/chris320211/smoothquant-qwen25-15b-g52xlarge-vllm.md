# chris320211/smoothquant-qwen25-15b-g52xlarge-vllm

## Resumen

`chris320211/smoothquant-qwen25-15b-g52xlarge-vllm` es un checkpoint cuantizado en int8 del modelo `Qwen/Qwen2.5-1.5B-Instruct`, empaquetado en el formato nativo `compressed-tensors` que consume vLLM sin necesidad de código personalizado ni `trust_remote_code`. Lo publica el usuario chris320211 mediante su herramienta QuantPort, y deriva del artefacto previo `chris320211/smoothquant-qwen25-15b-g52xlarge`, del que reutiliza exactamente los mismos bytes de pesos int8, únicamente renombrados para que vLLM los cargue de forma nativa.

El modelo base es un transformer decoder-only de la familia Qwen2.5, con 1.543.714.304 parámetros y licencia Apache 2.0. La cuantización aplicada es SmoothQuant en esquema W8A8: pesos int8 con escala por canal y activaciones int8 dinámicas por token. El objetivo es doble: reducir el peso del checkpoint a aproximadamente 1,8 GB y acelerar la inferencia en GPU frente al modelo en fp16, manteniendo una degradación de perplejidad muy contenida.

Su relevancia práctica es que ofrece una vía de despliegue en producción de un modelo pequeño de instrucciones con un pipeline estándar de vLLM, sin dependencias exóticas, con ganancias medidas de prefill y decode sobre la misma GPU. Es una pieza de infraestructura más que un modelo nuevo: no añade capacidades, sino que hace más barato servir las que ya tiene Qwen2.5-1.5B-Instruct.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2), cuantizado SmoothQuant W8A8 |
| Parametros totales | 1.543.714.304 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (heredada del modelo base Qwen2.5-1.5B-Instruct) |
| Tipos de cuantizacion | int8 W8A8: pesos int8 con escala por canal, activaciones int8 dinamicas por token; un modulo se mantiene en fp16 |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 (heredada de Qwen/Qwen2.5-1.5B-Instruct) |
| Formato de pesos | safetensors en formato `compressed-tensors` (`int-quantized`), con `vllm.json` y `vllm_export.json` |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Qwen2.5-1.5B-Instruct: un transformer decoder-only con atención completa, orientado a generación de texto conversacional. Este repositorio no entrena ni afina el modelo; aplica una cuantización post-entrenamiento de tipo SmoothQuant sobre los pesos del modelo base. SmoothQuant migra la dificultad de cuantización de las activaciones hacia los pesos mediante un factor de escala por canal, lo que permite cuantizar tanto pesos como activaciones a int8 sin recalibración costosa. En este checkpoint, el perfil de exportación `w8a8_int8` deja un único módulo en fp16.

El detalle técnico relevante es que el artefacto se ha convertido al formato `compressed-tensors` que vLLM reconoce de forma nativa, de modo que la ruta de inferencia de vLLM cuantiza únicamente las entradas de las capas lineales y mantiene la atención en fp16. Por eso los resultados de vLLM no son bit a bit idénticos a los del artefacto original en Transformers, aunque compartan los mismos pesos: la ruta de ejecución redondea en menos puntos. No se documentan en la información disponible los datos de entrenamiento originales del modelo base, el volumen de tokens ni si hubo RLHF o DPO; esos datos corresponden a la model card de Qwen2.5-1.5B-Instruct, no a este repositorio.

## Capacidades

- Generación de texto y conversación multi-turno, heredadas de Qwen2.5-1.5B-Instruct.
- Razonamiento básico, matemáticas y generación de código en la medida en que lo permite un modelo de 1,5B parámetros.
- Soporte de instrucciones y formato de chat del modelo base (no se documenta en este repositorio el detalle de la plantilla).
- Inferencia acelerada en vLLM con pesos int8 y activaciones int8 dinámicas por token.
- Compatibilidad con el ecosistema `compressed-tensors`, lo que permite cargarlo sin `trust_remote_code`.
- No se documentan en la información disponible capacidades de tool calling, agentes, visión, audio ni modo thinking específicas de este checkpoint.

## Casos de uso

- Servicio de chat de bajo coste: desplegar el modelo con `vllm serve` para atender conversaciones multi-turno en una sola GPU de consumo, aprovechando el throughput de decode medido de 260,7 tok/s a batch 1 y 3.715,8 tok/s a batch 16 en una RTX 3090.
- Clasificación y extracción de información en lote: procesar grandes volúmenes de texto con prefill a 41.765 tok/s en vLLM int8, adecuado para tareas de etiquetado, resumen o extracción de entidades donde el coste por token importa.
- Backend de prototipos y demos: al ocupar un checkpoint de 1,8 GB y requerir poca VRAM, encaja en entornos de desarrollo con una única GPU consumer para validar productos conversacionales antes de escalar a modelos mayores.
- Generación asistida en herramientas internas: integrar el modelo en asistentes de documentación o ayuda contextual donde la latencia de decode a batch pequeño (260,7 tok/s) es suficiente para respuestas interactivas.
- Evaluación de pipelines de cuantización: servir como referencia para comparar la calidad y el rendimiento de SmoothQuant W8A8 frente a fp16 en vLLM, con una degradación de perplejidad medida de solo 1,0148×.
- Despliegue en entornos con restricciones de memoria: usar la reducción de VRAM frente a fp16 para ejecutar el modelo junto con otros servicios en la misma GPU, o en GPUs con menos de 8 GB.
- Generación de código en herramientas locales: aprovechar el modelo base para autocompletado o explicación de fragmentos en IDE, con la ventaja de un checkpoint int8 que cabe en GPUs de gama media.

## Benchmarks y rendimiento

Resultados medidos con vLLM 0.30.0 en una NVIDIA GeForce RTX 3090, sobre WikiText-2 test con ventanas de 2048 tokens (65.504 tokens), comparando contra vLLM fp16 del modelo base y contra Transformers en ambos formatos:

| Métrica | vLLM int8 | vLLM fp16 | Transformers int8 | Transformers fp16 |
|---|---:|---:|---:|---:|
| Perplejidad | 9,7210 | 9,5795 | 10,0674 | 9,5791 |
| Prefill tok/s | 41.765,3 | 22.615,8 | 24.379,2 | 20.487,2 |
| Decode tok/s, batch 1 | 260,7 | 208,5 | 5,9 | 14,3 |
| Decode tok/s, batch 16 | 3.715,8 | 2.618,9 | 87,3 | 222,8 |
| VRAM pico GB | no disponible | no disponible | 4,68 | 5,84 |

Datos derivados reportados por el autor: ratio de perplejidad int8/fp16 de 1,0148; drift frente al ratio del benchmark en HuggingFace (1,0509) de 0,9656, dentro del umbral de 1,02 exigido; speedup de prefill de 1,85× y de decode de 1,25× a batch 1 y 1,42× a batch 16. Frente a Transformers fp16, vLLM int8 alcanza 2,04× en prefill, 18,28× en decode a batch 1 y 16,68× a batch 16. No se han publicado resultados de benchmarks de tareas (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada: el checkpoint pesa 1,8 GB; en Transformers el pico medido es de 4,68 GB en int8 y 5,84 GB en fp16. En vLLM no se reporta VRAM pico, pero por el tamaño de pesos debería situarse por debajo de los 4 GB con overhead de runtime.
- GPU recomendadas: NVIDIA RTX 3090 es la GPU de referencia de las mediciones; cualquier GPU con al menos 8 GB de VRAM debería ser suficiente. Para mayor throughput, A100 o H100.
- Cabe en GPU consumer: sí, en RTX 3090, RTX 4090 y previsiblemente en GPUs de 8 GB o más.
- Opciones de despliegue: vLLM es la vía nativa y documentada (`vllm serve chris320211/smoothquant-qwen25-15b-g52xlarge-vllm`). El formato `compressed-tensors` limita la compatibilidad con otros runtimes; no se documenta soporte para llama.cpp, Ollama ni TGI en la información disponible.
- Latencia y throughput: prefill de 41.765,3 tok/s, decode de 260,7 tok/s a batch 1 y 3.715,8 tok/s a batch 16 en RTX 3090 con vLLM 0.30.0.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| smoothquant-qwen25-15b-g52xlarge-vllm | 1,54B | no disponible | int8 W8A8, compressed-tensors | Apache 2.0 | Este modelo; PPL 9,7210 en vLLM |
| Qwen2.5-1.5B-Instruct (fp16) | 1,54B | no disponible | safetensors fp16 | Apache 2.0 | Base; PPL 9,5795 en vLLM, decode 208,5 tok/s a batch 1 |
| smoothquant-qwen25-15b-g52xlarge (Transformers) | 1,54B | no disponible | int8 con adaptador de inferencia | Apache 2.0 | Artefacto original; PPL 10,0674 en Transformers, decode 5,9 tok/s a batch 1 |
| Otros modelos de ~1,5B | no disponible | no disponible | no disponible | no disponible | No se dispone de datos comparativos en la información proporcionada |

## Limitaciones y advertencias

- La cuantización introduce una degradación medible: la perplejidad sube de 9,5795 a 9,7210 (ratio 1,0148), lo que puede afectar a tareas sensibles a la precisión numérica.
- Los resultados de vLLM no son bit a bit idénticos a los del artefacto original en Transformers, porque la ruta de vLLM mantiene la atención en fp16 y cuantiza menos puntos.
- El modelo base es de 1,5B parámetros: capacidad limitada para razonamiento complejo, matemáticas avanzadas y código de larga extensión.
- No se documentan los idiomas soportados en este repositorio; hay que remitirse a la model card de Qwen2.5-1.5B-Instruct.
- No se documenta la longitud de contexto efectiva de este checkpoint; conviene verificar la del modelo base antes de usarlo en producción.
- Riesgo de alucinación inherente a los modelos generativos de este tamaño; no hay evaluación específica publicada en la información disponible.
- La licencia Apache 2.0 permite uso comercial, pero se hereda del modelo base y se suma la licencia del repositorio del método; conviene revisar ambas.
- El autor es un particular y el repositorio tiene 71 descargas y 0 likes: no hay garantía de mantenimiento ni de soporte.
- El formato `compressed-tensors` restringe el despliegue a runtimes compatibles, principalmente vLLM; no se documenta compatibilidad con llama.cpp u Ollama.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/chris320211/smoothquant-qwen25-15b-g52xlarge-vllm
- Artefacto original: https://huggingface.co/chris320211/smoothquant-qwen25-15b-g52xlarge
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-1.5B-Instruct
- Licencia del modelo base: https://huggingface.co/Qwen/Qwen2.5-1.5B-Instruct/blob/main/LICENSE
- Repositorio de QuantPort: https://github.com/chris320211/QuantPort
