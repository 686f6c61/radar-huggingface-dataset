# atharva-naik-1/awsp-readers

## Resumen

AWSP Readers es una colección de adaptadores LoRA (PEFT) desarrollados por atharva-naik-1 dentro de la serie de blog *Auto Weight-Space Programming*. No es un modelo de propósito general: los adaptadores enseñan a un LLM base a leer números copiados directamente de sus propios pesos MLP. Concretamente, el prompt contiene 128 coordenadas de la dirección de salida de una neurona (una columna de `mlp.down_proj`), escritas como enteros escalados de forma que 20 equivale a una desviación típica de la columna completa, y el modelo debe responder con los tokens que esa rebanada promueve y suprime a través del logit lens (su norma final y unembedding).

El repositorio cubre adaptadores para Qwen3.5-0.8B, Qwen3.5-2B, Qwen3.5-4B, Qwen3.5-9B y Llama-3.2-3B-Instruct, con el resultado principal en Qwen3.5-4B (coordenadas 0-127), que alcanza un 99,8 % de precisión en un test de cuatro vías con 1.000 ítems. Es relevante ahora porque demuestra que un modelo de 4B puede aprender a interpretar representaciones internas de sus propios pesos con suficiente precisión como para ser una herramienta de interpretabilidad mecánica, y que la capacidad emerge con un presupuesto de entrenamiento concreto (entre 32k y 48k ejemplos).

La licencia es Apache-2.0 para los adaptadores Qwen, mientras que el adaptador de Llama-3.2-3B-Instruct es derivado de Llama 3.2 y se distribuye bajo la Llama 3.2 Community License. El tamaño del repositorio es de 4,8 GB y la librería declarada es `peft`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre transformers Qwen3.5 (0.8B, 2B, 4B, 9B) y Llama-3.2-3B-Instruct |
| Parametros totales | No disponible (depende del modelo base; el adaptador es rank 32, alpha 64) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (heredada del modelo base; no especificada en la model card) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponibles |
| Licencia | Apache-2.0 (adaptadores Qwen); Llama 3.2 Community License (adaptador Llama-3.2-3B-Instruct) |
| Formato de pesos | safetensors (adaptadores PEFT/LoRA) |

## Arquitectura y entrenamiento

Cada adaptador es un LoRA de rango 32 y alpha 64 aplicado a todas las proyecciones de atención y MLP del modelo base, entrenado con learning rate 1e-4 y 16 ejemplos por paso, salvo que el nombre de la carpeta indique otra configuración (por ejemplo, `qwen3.5-9b/coords-0-127-lr5e-5-128k` usa lr 5e-5 y 128k ejemplos). El entrenamiento se organiza por rebanadas de 128 coordenadas de la columna de `mlp.down_proj`; el prompt codifica esas coordenadas como enteros escalados y la respuesta es la lista de tokens promovidos/suprimidos según el logit lens. Cada carpeta incluye el adaptador (`adapter_stage0/`), el `config.json` de la ejecución, el `log.jsonl` de entrenamiento, el filtro de tokens artefacto (`artifacts_128.json`) y los ficheros de evaluación por ítem (`eval_*.json`).

La innovación técnica destacable es el propio protocolo de evaluación: precisión de cuatro vías sobre un split de test bloqueado (la lista verdadera frente a tres listas de otras neuronas, con azar del 25 %), puntuando cada candidato por su log-likelihood con los números mostrados menos su log-likelihood con los números ocultos. Se incluyen variantes "shuffled" (permutación de los mismos números), "hard" (las tres listas incorrectas provienen de las rebanadas más similares de la misma capa) y "held-out layers" (cuatro capas nunca entrenadas). El dataset de entrenamiento y prompts está publicado en `awsp-neuron-reading` y el código en `src/raw_reader.py` (`user_prompt`, `make_prompt`, `eval_t2`). El uso indicado es con la plantilla de chat y *thinking* desactivado.

## Capacidades

- Lectura de coordenadas de pesos: dado un prompt con 128 coordenadas de una columna de `mlp.down_proj` codificadas como enteros escalados, el modelo devuelve la lista de tokens que esa rebanada promueve y suprime a través del logit lens.
- Generalización a neuronas no vistas: el test usa 977 neuronas distintas y capas retenidas, sin que el entrenamiento las haya visto.
- Generalización entre modelos: `qwen3.5-4b/reads-qwen3.5-0.8b` lee coordenadas de otro modelo (98,8 % de precisión en test) y `qwen3.5-0.8b/reads-qwen3.5-4b` lee las del 4B (62,0 %).
- Robustez a permutación: las variantes "shuffled" caen al nivel del azar (23-26 %), lo que indica que el modelo no responde a la mera presencia de números.
- Discriminación fina: variante "hard" con las tres listas incorrectas extraídas de las rebanadas más similares de la misma capa (hasta 100,0 % en el adaptador principal).
- Capacidad emergente con presupuesto: la serie `budget-*` muestra precisión de validación de 33,0 % con 24k ejemplos, 68,8 % con 32k, 96,5 % con 48k y 100,0 % con 96k.
- Lectura de floats sin escalar: variantes `raw-floats` con 3 dígitos significativos (99,7 % en coordenadas 0-127).
- No se documentan en la información disponible capacidades de tool calling, agentes, visión, audio ni multilingüismo; son adaptadores especializados de interpretabilidad, no asistentes generales.

## Casos de uso

- Interpretabilidad mecánica de MLPs: usar el adaptador como sonda para traducir columnas de `mlp.down_proj` a los tokens que promueven y suprimen, sustituyendo análisis manuales de logit lens por una lectura automática con 99,8 % de precisión en el adaptador principal de 4B.
- Auditoría de neuronas en producción: dado un modelo Qwen3.5-4B desplegado, extraer las direcciones de salida de neuronas concretas y pasarlas por el lector para identificar qué conceptos codifican, con la variante "hard" como control de especificidad.
- Estudio de circuitos entre capas: emplear la generalización a capas retenidas (99,8 % en el adaptador 0-127) para analizar capas no incluidas en el entrenamiento sin reentrenar.
- Comparación entre modelos: usar `reads-qwen3.5-0.8b` y `reads-qwen3.5-4b` para contrastar cómo representan las mismas coordenadas modelos de distinto tamaño, con la advertencia de que el 0.8B leyendo al 4B baja al 62,0 %.
- Investigación sobre emergencia de capacidades: la serie `budget-*` permite estudiar el umbral de ejemplos (entre 32k y 48k) en el que la lectura de pesos pasa de ~69 % a ~97 % de validación, un caso concreto para análisis de curvas de escalado en tareas de interpretabilidad.
- Validación de pipelines de extracción de pesos: usar los ficheros `eval_*.json` y el split bloqueado de 1.000 ítems como referencia reproducible para verificar implementaciones propias de logit lens y de escalado de coordenadas.
- Docencia y divulgación: los prompts listos en `awsp-neuron-reading` y el código en `src/raw_reader.py` permiten reproducir el experimento en un taller sin construir el dataset desde cero.

## Benchmarks y rendimiento

Precisión de cuatro vías (%) en el split de test bloqueado (1.000 ítems, 977 neuronas distintas; azar 25 %), con validación de 400 ítems donde se indica. Recall@8 es la proporción de los 8 tokens promovidos verdaderos que aparecen en el top 8 del propio modelo en la primera posición de respuesta, sin candidatos.

| Carpeta | Test | Shuffled | Hard | Capas retenidas | Recall@8 | Val |
|---|---|---|---|---|---|---|
| `qwen3.5-4b/coords-0-127` | 99,8 | 26,3 | 97,1 | 99,8 | 11,2 | 99,5 |
| `qwen3.5-4b/coords-0-127-raw-floats` | 99,7 | 25,5 | 97,8 | 99,7 | 14,3 | 99,5 |
| `qwen3.5-4b/coords-128-255` | 98,9 | 26,2 | 92,3 | 98,4 | 4,4 | 98,5 |
| `qwen3.5-4b/coords-1280-1407-64k` | 29,3 | 26,5 | 27,9 | 29,1 | 0,2 | 30,5 |
| `qwen3.5-4b/coords-1280-1407-192k` | 100,0 | 23,9 | 100,0 | 100,0 | 15,4 | 100,0 |
| `qwen3.5-4b/coords-1280-1407-from-0-127` | 100,0 | 23,6 | 99,7 | 100,0 | 6,0 | 100,0 |
| `qwen3.5-4b/coords-640-767-from-0-127` | 100,0 | 25,8 | 99,8 | 99,9 | 11,1 | 100,0 |
| `qwen3.5-4b/coords-2048-2175-from-0-127` | 100,0 | 26,5 | 99,7 | 100,0 | 5,3 | 100,0 |
| `qwen3.5-4b/coords-640-767-raw-floats` | 63,5 | 23,0 | 51,7 | 60,2 | 0,5 | 61,3 |
| `qwen3.5-4b/coords-1280-1407-raw-floats` | 28,2 | 25,6 | 28,9 | 28,9 | 0,3 | 31,5 |
| `qwen3.5-4b/budget-24k` | — | — | — | — | — | 33,0 |
| `qwen3.5-4b/budget-32k` | — | — | — | — | — | 68,8 |
| `qwen3.5-4b/budget-48k` | — | — | — | — | — | 96,5 |
| `qwen3.5-4b/budget-96k` | — | — | — | — | — | 100,0 |
| `qwen3.5-4b/reads-qwen3.5-0.8b` | 98,8 | 26,2 | 94,2 | 99,0 | 3,3 | 98,2 |
| `qwen3.5-0.8b/coords-0-127` | 35,8 | 25,0 | 32,2 | 34,7 | 0,9 | 33,8 |
| `qwen3.5-0.8b/reads-qwen3.5-4b` | 62,0 | 24,1 | 44,7 | 60,6 | 3,4 | 61,8 |
| `qwen3.5-2b/coords-0-127` | 62,4 | 25,8 | 52,6 | 63,8 | 0,3 | 69,0 |
| `qwen3.5-9b/coords-0-127` | 31,6 | 23,7 | 28,6 | 32,2 | 0,2 | 36,8 |
| `qwen3.5-9b/coords-0-127-lr5e-5-128k` | 54,5 | 24,2 | 45,0 | 52,9 | 0,4 | 54,5 |
| `Llama-3.2-3B-Instruct-reader/coords-0-127` | 52,9 | 26,2 | 43,3 | 51,2 | 0,3 | 51,5 |

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada. Depende del modelo base (Qwen3.5-0.8B, 2B, 4B, 9B o Llama-3.2-3B-Instruct) y de la cuantización, no del adaptador LoRA, que es de rango 32.
- GPU recomendadas: no disponible. El adaptador principal se evalúa sobre Qwen3.5-4B, que en bfloat16 requiere aproximadamente 8 GB solo para pesos; el 9B requiere bastante más. No se publican mediciones de VRAM, latencia ni throughput.
- Cabe en GPU de consumo: no confirmado en la información disponible; el adaptador de 0.8B y el de 2B son los candidatos más plausibles para GPUs de consumo, pero no hay datos publicados.
- Opciones de despliegue: la model card muestra `transformers` (`AutoModelForImageTextToText`, `AutoTokenizer`) junto con `peft.PeftModel.from_pretrained` y `huggingface_hub.snapshot_download`. No se mencionan vLLM, llama.cpp, Ollama ni TGI; al ser adaptadores PEFT sobre modelos base, su compatibilidad con esos motores no está documentada.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de una comparativa con adaptadores de interpretabilidad equivalentes en la información proporcionada. La comparación más directa es interna, entre los propios adaptadores del repositorio, con el mismo protocolo de evaluación:

| Adaptador | Modelo base | Test (%) | Hard (%) | Recall@8 | Licencia |
|---|---|---|---|---|---|
| `qwen3.5-4b/coords-0-127` | Qwen3.5-4B | 99,8 | 97,1 | 11,2 | Apache-2.0 |
| `qwen3.5-2b/coords-0-127` | Qwen3.5-2B | 62,4 | 52,6 | 0,3 | Apache-2.0 |
| `qwen3.5-0.8b/coords-0-127` | Qwen3.5-0.8B | 35,8 | 32,2 | 0,9 | Apache-2.0 |
| `qwen3.5-9b/coords-0-127-lr5e-5-128k` | Qwen3.5-9B | 54,5 | 45,0 | 0,4 | Apache-2.0 |
| `Llama-3.2-3B-Instruct-reader/coords-0-127` | Llama-3.2-3B-Instruct | 52,9 | 43,3 | 0,3 | Llama 3.2 Community |

## Limitaciones y advertencias

- No es un modelo de propósito general: los adaptadores solo realizan la tarea de lectura de coordenadas de pesos con el formato de prompt específico; no deben usarse como asistentes.
- Dependencia fuerte del presupuesto de entrenamiento: `coords-1280-1407-64k` falla (29,3 % de test, prácticamente azar) mientras que la variante con 192k ejemplos alcanza el 100,0 %.
- Dependencia del escalado de coordenadas: las variantes `raw-floats` sin escalar rinden peor en algunas rebanadas (63,5 % en 640-767 y 28,2 % en 1280-1407, cerca del azar).
- El modelo base importa: el mismo adaptador sobre Qwen3.5-9B solo alcanza 54,5 % incluso con lr 5e-5 y 128k ejemplos, y el 0.8B se queda en 35,8 %.
- El Recall@8 es bajo en general (0,2-15,4 %), lo que indica que la lista completa de tokens promovidos no se reproduce con precisión aunque la identificación de la neurona correcta entre cuatro sea casi perfecta.
- Riesgo de alucinación: no evaluado en la información disponible; el protocolo de cuatro vías mide discriminación entre candidatos, no la fidelidad de listas libres.
- Sesgos conocidos: no documentados.
- Idiomas soportados: no disponibles; la tarea es sobre tokens del vocabulario del modelo base, no sobre texto libre multilingüe.
- Restricciones de licencia: los adaptadores Qwen son Apache-2.0, pero el adaptador `Llama-3.2-3B-Instruct-reader` es derivado de Llama 3.2 y se rige por la Llama 3.2 Community License, con obligaciones de atribución ("Built with Llama"). Las etiquetas Atlas usadas en el proyecto provienen de neuron-explorer (lyramakesmusic, MIT).
- Uso en producción: el repositorio tiene 0 descargas y 0 likes en el momento de la consulta, sin pipeline declarado; conviene tratarlo como artefacto de investigación reproducible más que como componente listo para producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/atharva-naik-1/awsp-readers
- Dataset de prompts: https://huggingface.co/datasets/atharva-naik-1/awsp-neuron-reading
- Código: https://github.com/atharva-naik/auto-weight-space-programming (`src/raw_reader.py`)
- Modelos base: https://huggingface.co/Qwen/Qwen3.5-4B, https://huggingface.co/Qwen/Qwen3.5-0.8B, https://huggingface.co/Qwen/Qwen3.5-2B, https://huggingface.co/Qwen/Qwen3.5-9B, https://huggingface.co/meta-llama/Llama-3.2-3B-Instruct
- Etiquetas Atlas (neuron-explorer, MIT): https://github.com/lyramakesmusic/neuron-explorer
