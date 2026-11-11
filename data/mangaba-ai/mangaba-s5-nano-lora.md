# mangaba-ai/Mangaba-S5-nano-LoRA

## Resumen

Mangaba-S5-nano-LoRA es un adaptador LoRA publicado por Mangaba AI sobre el modelo base S5-nano de Maritaca AI, un modelo de 4B parámetros orientado a portugués y distribuido con licencia Apache 2.0. El adaptador no redistribuye los pesos originales: se aplica sobre el S5-nano cuantizado en 8 bits y modifica únicamente las capas lineales mediante un LoRA de rango 16. Su propósito es mejorar el rendimiento del modelo base en tareas de inferencia textual en portugués, en concreto en el benchmark ASSIN 2, donde el autor reporta una subida del 93,0% al 98,0%.

El entrenamiento se realizó con 991 ejemplos de entrenamiento y 50 de validación, combinando instrucciones con restricciones de formato, conversaciones en portugués, recusas seguras y problemas de matemáticas, ENEM y OAB. El adaptador está empaquetado en formato MLX, por lo que su uso está orientado a hardware Apple Silicon mediante la librería mlx-lm. La relevancia actual reside en que demuestra un ajuste fino ligero y reproducible sobre un modelo abierto en portugués, con evaluación pareada e intervalos de confianza, aunque con un alcance limitado a una única tarea y muestras reducidas.

El adaptador es un trabajo derivado e independiente, no endosado por Maritaca AI. El modelo base S5-nano está construido sobre Qwen3.5-4B según la model card, y el adaptador conserva la licencia Apache 2.0 del original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA sobre transformer (modelo base S5-nano, construido sobre Qwen3.5-4B) |
| Parametros totales | 4B en el modelo base; el adaptador LoRA no declara recuento propio |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 8 bits (grupo 64) sobre el modelo base; el adaptador se aplica sobre esa cuantizacion |
| Idiomas soportados | Portugues (pt) |
| Licencia | Apache 2.0 |
| Formato de pesos | Adaptador en formato MLX (lora); modelo base en safetensors y convertible a MLX 8 bits |

## Arquitectura y entrenamiento

El adaptador es un LoRA de rango 16 con escala 2,0 (alfa 32) aplicado a todas las capas lineales del modelo base S5-nano, que a su vez es un transformer de 4B parámetros construido sobre Qwen3.5-4B. El entrenamiento se realizó sobre el S5-nano cuantizado en 8 bits con grupo de 64, con tasa de aprendizaje 1e-4, calentamiento y decaimiento coseno, lote efectivo de 8, 1,5 épocas (185 pasos) y hasta 512 tokens por ejemplo.

El conjunto de datos consta de 1.041 ejemplos (991 de entrenamiento y 50 de validación): 498 instrucciones con restricciones de formato y razonamiento corto verificadas con las reglas de IFEvalG, 370 conversaciones en portugués (170 generadas por el modelo profesor de Mangaba y 200 del dataset Aira v3), 100 recusas seguras del dataset harmful-dataset y 73 problemas de matemáticas, ENEM y OAB obtenidos por muestreo de rechazo del propio S5-nano y verificados contra el gabarito. Se aplicó descontaminación eliminando todo ejemplo con una secuencia de 13 palabras en común con los textos de test.

## Capacidades

- Generación de texto en portugués, con modo *thinking* (razonamiento explícito) heredado del modelo base.
- Razonamiento de inferencia textual: el adaptador mejora específicamente tareas de implicación y relación entre frases (ASSIN 2).
- Resolución de problemas matemáticos y de exámenes tipo ENEM y OAB, según los datos de entrenamiento.
- Seguimiento de instrucciones con restricciones de formato (datos verificados con reglas de IFEvalG).
- Recusas seguras ante peticiones dañinas (entrenado con harmful-dataset).
- Conversación multi-turno en portugués (datos de Aira v3 y del modelo profesor).
- No se documentan capacidades de tool calling, function calling, agentes, visión ni audio en la información disponible.

## Casos de uso

- Evaluación de inferencia textual en portugués: el adaptador está optimizado para tareas de implicación entre frases, por lo que encaja en pipelines de evaluación de pares de frases (NLI) y en la validación de sistemas de comprensión lectora en portugués.
- Clasificación y filtrado de contenido conversacional: las 370 conversaciones en portugués del entrenamiento permiten usar el adaptador en sistemas de atención al cliente o moderación que requieran respuestas cortas y controladas.
- Generación de respuestas con formato restringido: los 498 ejemplos verificados con IFEvalG lo hacen adecuado para tareas donde la salida debe cumplir un esquema o longitud concreta, como extracción de datos o generación de informes estructurados.
- Asistencia educativa en portugués: los 73 problemas de matemáticas, ENEM y OAB permiten emplearlo en tutores o correctores automáticos de ejercicios de secundaria y oposiciones en Brasil.
- Recusas seguras en producción: el entrenamiento con harmful-dataset lo hace útil como capa de rechazo ante peticiones dañinas en asistentes desplegados en portugués.
- Prototipado en Apple Silicon: al estar en formato MLX, permite iterar y probar el modelo en portátiles y equipos Mac sin GPU dedicada, aplicando el adaptador sobre el S5-nano en 8 bits.
- Investigación sobre ajuste fino ligero: sirve como referencia reproducible para estudiar el efecto de un LoRA pequeño (991 ejemplos) sobre un modelo de 4B en una tarea concreta.

## Benchmarks y rendimiento

Evaluación con los casos y correctores oficiales del Observatorio Maritaca, modo *thinking*, mismas preguntas para ambos modelos (8 bits), diferencia pareada con IC95 por remuestreo (2.000 remuestras):

| Tarea | n | S5-nano | Este adaptador | Diferencia [IC95] |
|---|---|---|---|---|
| ASSIN 2 · inferencia | 100 | 93,0% | 98,0% | +5,0 [+1,0; +10,0] |
| MATH-PT | 60 | 70,0% | 66,7% | −3,3 [−11,7; +5,0] |
| BRoverbs | 100 | 95,0% | 90,0% | −5,0 [−10,0; 0,0] |
| IFBench | 100 | 37,0% | 32,0% | −5,0 [−16,0; +6,0] |

En ASSIN 2 el adaptador corrigió 5 preguntas y no introdujo ningún error nuevo (F1 macro 92,9 → 98,0). Ningún ejemplo de ASSIN entró en el entrenamiento. El razonamiento se acortó: en IFBench la mediana pasó de 4.096 a 252 tokens y las respuestas truncadas de 71 a 2.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita; el modelo base es de 4B parámetros y el adaptador se aplica sobre la versión en 8 bits, lo que reduce el requisito respecto a los pesos completos.
- GPU recomendadas: no disponible; el adaptador está empaquetado para MLX, orientado a Apple Silicon (M1, M2, M3, M4 y posteriores).
- Cabe en GPU de consumo: no se documenta; el formato MLX apunta a memoria unificada de equipos Mac, no a GPUs NVIDIA de consumo.
- Opciones de despliegue: mlx-lm (conversión a 8 bits, aplicación del adaptador y fusión mediante `mlx_lm.fuse`). No se documentan opciones para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Mangaba-S5-nano-LoRA | 4B (base) + LoRA | no disponible | ASSIN 2 98,0%; MATH-PT 66,7%; BRoverbs 90,0%; IFBench 32,0% | Apache 2.0 | Hugging Face (formato MLX) |
| S5-nano (maritaca-ai) | 4B | no disponible | ASSIN 2 93,0%; MATH-PT 70,0%; BRoverbs 95,0%; IFBench 37,0% | Apache 2.0 | Hugging Face |
| Qwen3.5-4B (base del S5-nano) | 4B | no disponible | no disponible en la información proporcionada | no disponible | no disponible |

## Limitaciones y advertencias

- La mejora solo es significativa en una tarea (ASSIN 2); en MATH-PT, BRoverbs e IFBench no hay diferencia significativa y en BRoverbs el intervalo termina en cero, en el límite de una pérdida significativa.
- Las muestras son reducidas: entre 60 y 100 preguntas por tarea, lo que limita la potencia estadística de las conclusiones.
- El adaptador solo cubre portugués; no se documenta soporte de otros idiomas.
- El formato es exclusivamente MLX, por lo que no es directamente desplegable en entornos NVIDIA ni en servidores estándar sin conversión adicional.
- Riesgo de alucinación y sesgos: no se documentan evaluaciones específicas de sesgo ni de tasa de alucinación en la información disponible.
- No redistribuye los pesos del modelo base: es necesario descargar y cuantizar el S5-nano por separado antes de aplicar el adaptador.
- Es un trabajo derivado e independiente, no endosado por Maritaca AI; conviene revisar el archivo NOTICE para los términos de atribución.
- La licencia Apache 2.0 permite uso comercial, pero el modelo base y los datasets de terceros (Aira v3, harmful-dataset) pueden tener condiciones propias que deben verificarse.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/mangaba-ai/Mangaba-S5-nano-LoRA
- Modelo base S5-nano: https://huggingface.co/maritaca-ai/S5-nano
- Artículo del autor: https://www.mangaba.ia.br/artigos/s5-nano-ajustado-assin
- Mangaba AI: https://www.mangaba.ia.br
- Observatorio Maritaca: https://github.com/maritaca-ai/observatorio-maritaca
- Dataset Aira v3: https://huggingface.co/datasets/nicholasKluge/instruct-aira-dataset-v3
- Dataset harmful-dataset: https://huggingface.co/datasets/LLM-LAT/harmful-dataset
- Librería MLX-LM: https://github.com/ml-explore/mlx-lm
