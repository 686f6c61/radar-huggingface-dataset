# ReefNet/reefnet-mllm-lora-extras

## Resumen

ReefNet/reefnet-mllm-lora-extras es una colección de adaptadores LoRA de PEFT publicada por ReefNet como material suplementario del artículo ReefNet (NeurIPS 2026, track Evaluations & Datasets) y de su fase de rebatimiento. No es un modelo independiente, sino un conjunto de 18 adaptadores que se montan sobre cinco modelos multimodales de imagen-texto distintos: Qwen3-VL-8B-Instruct, MiniCPM-V 4.5, InternVL3.5-8B, LLaVA-NeXT (Vicuna-13B) y LLaVA-OneVision-7B. El problema que resuelve es muy concreto: clasificación fina de género de coral a partir de un recorte de 1024x1024 píxeles centrado en un punto anotado, con salida de una sola palabra.

El repositorio principal de ReefNet contiene los adaptadores de los modelos afinados principales (reefnet-qwen3-vl-8b-lora, reefnet-minicpm-v-4.5-lora y reefnet-internvl3.5-8b-lora); este repositorio agrupa los experimentos auxiliares: barridos few-shot de k=1, 5, 10 y 20, estudios de varianza entre semillas y ejecuciones de convergencia y de líneas base alternativas. El interés actual reside en que permite reproducir tablas completas del artículo y auditar la robustez del ajuste fino con LoRA en tareas de biodiversidad marina con clases muy desbalanceadas.

Todos los adaptadores usan rango 8 sobre capas lineales y se entrenaron con LLaMA-Factory (commit 589da21d). El repositorio ocupa 1,7 GB, tiene 0 descargas y 0 likes, y su licencia declarada en los metadatos es llama2, aunque la model card indica Apache-2.0 para la mayoría de subcarpetas y Llama 2 únicamente para el adaptador de LLaVA-NeXT.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Adaptadores LoRA (PEFT) sobre modelos vision-language transformer; cinco bases distintas: Qwen3-VL-8B-Instruct, MiniCPM-V 4.5, InternVL3.5-8B, LLaVA-NeXT (Vicuna-13B), LLaVA-OneVision-7B |
| Parámetros totales | No aplica a los adaptadores; rango 8 sobre todas las capas lineales. Modelos base: ~8B (Qwen3-VL-8B, MiniCPM-V 4.5, InternVL3.5-8B), ~7B (LLaVA-OneVision-7B) y ~13B (LLaVA-NeXT Vicuna-13B) |
| Parámetros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible (depende del modelo base; no se documenta en la información proporcionada) |
| Tipos de cuantización | No disponible. Los adaptadores se distribuyen en safetensors y el entrenamiento se hizo en bf16; cualquier cuantización depende del modelo base elegido |
| Idiomas soportados | No disponibles. Los prompts de entrenamiento y evaluación están en inglés |
| Licencia | llama2 en los metadatos del repositorio; la model card especifica Apache-2.0 para la mayoría de adaptadores y Llama 2 para el adaptador de LLaVA-NeXT |
| Formato de pesos | safetensors (adaptadores PEFT LoRA), con train_config.yaml, logs del entrenador y predictions/ en cada subcarpeta |
| Pipeline | image-text-to-text |
| Dataset de entrenamiento | ReefNet/ReefNet-1.0 |
| Métrica | Macro recall (balanced accuracy) con decodificación greedy y max_new_tokens=32 |
| Tamaño del repositorio | 1,7 GB |
| Revisiones de los modelos base | Qwen3-VL-8B-Instruct@0c351dd0, MiniCPM-V-4_5@c1a6986b, InternVL3_5-8B-HF@741a7d03, llava-v1.6-vicuna-13b-hf@745cfbdb, llava-onevision-qwen2-7b-ov-hf@0d506805 |

## Arquitectura y entrenamiento

Cada subcarpeta es un adaptador PEFT autocontenido que se carga sobre su modelo base correspondiente mediante `PeftModel.from_pretrained`. El ajuste se realizó con LoRA de rango 8 aplicado a todas las capas lineales, optimizador AdamW con learning rate 5e-5, schedule coseno, warmup ratio 0,03, precisión bf16, batch por dispositivo de 8 sin acumulación de gradientes y `image_max_pixels` de 1024x1024 sin aumento de datos. La pila software es transformers 4.57.1, peft 0.18.1 y torch 2.9.1, sobre LLaMA-Factory en el commit 589da21d. La selección de modelo se hizo con el split de validación de ReefNet; el conjunto Al-Wajh nunca se usó para entrenamiento, ajuste ni selección, lo que lo convierte en un test fuera de dominio.

Los conjuntos de soporte few-shot son anidados: k=1 es subconjunto de k=5, que lo es de k=10 y de k=20, y se muestrean del split de entrenamiento de ReefNet con listas de muestras depositadas en el repositorio reefnet-mllm. Las tareas son de clasificación generativa restringida: el prompt de entrenamiento, validación y test de ReefNet es `What is the genus in the center of the image <image>? Answer with one word`, mientras que el de Al-Wajh es `<image>Identify the hard coral genus in this image. Respond with only the genus name.`. La salida se normaliza (strip y capitalización) y debe coincidir exactamente con un género; una predicción fuera del conjunto de etiquetas cuenta como error. En ReefNet hay 39 etiquetas y 23.043 recortes de test; en Al-Wajh se promedian los 13 géneros presentes sobre 4.624 recortes, pero el modelo conserva la salida completa de 39 vías.

## Capacidades

- Clasificación fina de género de coral a partir de un recorte de imagen centrado en un punto anotado, con salida de una única palabra restringida a un vocabulario de 39 géneros.
- Aprendizaje few-shot: se publican adaptadores para k=1, 5, 10 y 20 ejemplos por género, con ganancias monótonas al aumentar k en la mayoría de bases.
- Evaluación de robustez fuera de dominio: los adaptadores se evalúan íntegros sobre el conjunto Al-Wajh, con 13 géneros presentes y 4.624 recortes.
- Análisis de varianza entre semillas: tres ejecuciones con submuestreo limitado a 300 imágenes por género permiten estimar la variabilidad run-to-run.
- Reanudación de entrenamiento: se incluye un adaptador de continuación de +0,5 épocas para estudiar la convergencia.
- Compatibilidad con líneas base alternativas: se publican adaptadores para LLaVA-NeXT en el paso 14000 y LLaVA-OneVision-7B en el paso 26000 (3 GPU, batch efectivo 24).
- No se documentan capacidades de tool calling, function calling, agentes, razonamiento multi-paso, audio ni modo de pensamiento explícito.

## Casos de uso

- Clasificación automatizada de transectos de arrecife: el modelo recibe recortes de 1024x1024 centrados en cada punto anotado de un transecto y devuelve el género en una palabra, lo que permite procesar lotes de miles de imágenes con una única pasada greedy.
- Pre-etiquetado de datasets de biodiversidad marina: usar el adaptador de k=20 sobre Qwen3-VL (27,22 de macro recall en ReefNet) para generar etiquetas iniciales que después revisa un taxónomo, reduciendo el coste de anotación manual.
- Monitorización de programas de conservación: comparar la distribución de géneros predicha entre campañas sucesivas en el mismo arrecife para detectar desplazamientos en la composición de la comunidad coralina.
- Investigación metodológica en few-shot learning: los conjuntos anidados k=1/5/10/20 y las tres semillas de varianza permiten estudiar curvas de aprendizaje y estabilidad de LoRA en clasificación fina con clases desbalanceadas.
- Evaluación de transferencia entre dominios: el conjunto Al-Wajh, nunca usado en entrenamiento ni selección, sirve para medir la degradación de un clasificador de corales entrenado en un dominio y desplegado en otro.
- Selección de arquitectura base para un proyecto de visión ecológica: la tabla comparativa interna (Qwen3-VL, MiniCPM-V, InternVL3.5, LLaVA-NeXT, LLaVA-OneVision) permite elegir la base con mejor compromiso entre coste de GPU y macro recall.
- Auditoría y reproducción de resultados: cada subcarpeta incluye las predicciones por muestra y el script tools/recompute_macro_recall.py, lo que permite recalcular las cifras publicadas sin reentrenar.

## Benchmarks y rendimiento

Macro recall (balanced accuracy) reportado en la model card. ReefNet: 39 etiquetas, 23.043 recortes de test. Al-Wajh: 13 géneros presentes, 4.624 recortes, salida completa de 39 vías y predicción fuera de los 13 géneros contabilizada como error.

| Subcarpeta | Modelo base | Configuración | ReefNet | Al-Wajh |
|---|---|---|---|---|
| few_shot/k1/qwen3_vl | Qwen3-VL-8B-Instruct | Tabla 4, 1-shot | 5,56 | 10,93 |
| few_shot/k1/minicpm_v | MiniCPM-V 4.5 | Tabla 4, 1-shot | 2,85 | 7,68 |
| few_shot/k1/internvl3_5 | InternVL3.5-8B | Tabla 4, 1-shot | 2,00 | 10,31 |
| few_shot/k5/qwen3_vl | Qwen3-VL-8B-Instruct | Tabla 4, 5-shot | 9,15 | 13,77 |
| few_shot/k5/minicpm_v | MiniCPM-V 4.5 | Tabla 4, 5-shot | 7,32 | 8,52 |
| few_shot/k5/internvl3_5 | InternVL3.5-8B | Tabla 4, 5-shot | 2,87 | 9,01 |
| few_shot/k10/qwen3_vl | Qwen3-VL-8B-Instruct | Tabla 4, 10-shot | 17,24 | 25,87 |
| few_shot/k10/minicpm_v | MiniCPM-V 4.5 | Tabla 4, 10-shot | 14,95 | 12,77 |
| few_shot/k10/internvl3_5 | InternVL3.5-8B | Tabla 4, 10-shot | 10,44 | 12,80 |
| few_shot/k20/qwen3_vl | Qwen3-VL-8B-Instruct | Tabla 4, 20-shot | 27,22 | 31,27 |
| few_shot/k20/minicpm_v | MiniCPM-V 4.5 | Tabla 4, 20-shot | 21,95 | 20,88 |
| few_shot/k20/internvl3_5 | InternVL3.5-8B | Tabla 4, 20-shot | 18,34 | 12,87 |
| seed_variance/qwen3_vl_cap300_seed1 | Qwen3-VL-8B-Instruct | Varianza entre ejecuciones, submuestra limitada a 300 por género | 50,96 | 34,72 |
| seed_variance/qwen3_vl_cap300_seed2 | Qwen3-VL-8B-Instruct | Varianza entre ejecuciones, submuestra limitada a 300 por género | 50,45 | 34,68 |
| seed_variance/qwen3_vl_cap300_seed3 | Qwen3-VL-8B-Instruct | Varianza entre ejecuciones, submuestra limitada a 300 por género | 50,16 | 32,66 |
| convergence/qwen3_vl_cont_2p5ep | Qwen3-VL-8B-Instruct | Continuación de +0,5 épocas | 72,75 | 56,94 |
| llava/llava_next_13b_ckpt14000 | LLaVA-NeXT (Vicuna-13B) | Paso 14000 | 61,70 | 38,62 |
| llava/llava_onevision_7b_ckpt26000 | LLaVA-OneVision-7B | Paso 26000, 3 GPU, batch efectivo 24 | 60,50 | 35,39 |

No se han publicado en la información disponible resultados de benchmarks generales (MMLU, HumanEval, GSM8K ni similares), ni cifras de latencia o throughput.

## Requisitos de hardware

- Los adaptadores son ligeros (el repositorio completo ocupa 1,7 GB), pero requieren cargar el modelo base completo en memoria para inferir.
- Modelos base de ~7-8B en bf16: aproximadamente 16-17 GB de pesos más el codificador visual y las activaciones, lo que sitúa la VRAM práctica en torno a 18-22 GB para una imagen de 1024x1024.
- Modelos base de ~13B en bf16 (LLaVA-NeXT Vicuna-13B): aproximadamente 26 GB solo en pesos, por lo que requiere GPU de 40 GB o superior, o bien cuantización.
- GPU recomendadas: A100 40/80 GB o H100 para las configuraciones de 13B sin cuantizar; A100 40 GB, L40S o RTX 4090 para las configuraciones de 7-8B.
- En GPU de consumo: una RTX 4090 de 24 GB debería alojar los adaptadores sobre Qwen3-VL-8B, MiniCPM-V 4.5 o InternVL3.5-8B en bf16. Las tarjetas de 12-16 GB necesitan cuantización del modelo base, que no está documentada en este repositorio.
- Opciones de despliegue: transformers con peft (el ejemplo de la model card usa `AutoModelForImageTextToText` y `PeftModel`), LLaMA-Factory para reentrenamiento o evaluación, y servidores compatibles con adaptadores LoRA (por ejemplo vLLM con soporte de LoRA) previa verificación de compatibilidad con cada arquitectura base.
- No se publican pesos GGUF ni convertidos a llama.cpp u Ollama, por lo que el despliegue en CPU no está cubierto por el repositorio.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

La comparación relevante no es con otros modelos de propósito general, sino entre las cinco bases sobre las que se montan los adaptadores. Los datos de macro recall proceden de las ejecuciones de esta misma colección.

| Modelo base | Parámetros | Contexto | Licencia (según la model card) | Resultado destacado |
|---|---|---|---|---|
| Qwen3-VL-8B-Instruct | ~8B | No disponible | Apache-2.0 (adaptador) | Mejor en few-shot (27,22 en ReefNet a 20-shot) y en convergencia (72,75 ReefNet / 56,94 Al-Wajh) |
| MiniCPM-V 4.5 | ~8B | No disponible | Apache-2.0 (adaptador) | 21,95 en ReefNet a 20-shot; 14,95 a 10-shot |
| InternVL3.5-8B | ~8B | No disponible | Apache-2.0 (adaptador) | 18,34 en ReefNet a 20-shot; muy sensible al número de ejemplos en few-shot |
| LLaVA-OneVision-7B | ~7B | No disponible | Apache-2.0 (adaptador) | 60,50 en ReefNet en el paso 26000 (3 GPU, batch efectivo 24) |
| LLaVA-NeXT (Vicuna-13B) | ~13B | No disponible | Llama 2 (hereda la licencia de su base) | 61,70 en ReefNet en el paso 14000, con mayor coste de VRAM |

No se dispone de comparaciones con modelos de clasificación de corales ajenos a esta familia, ni de cifras de terceros en los mismos conjuntos de test.

## Limitaciones y advertencias

- El modelo solo produce una palabra de un vocabulario cerrado de 39 géneros; cualquier pregunta fuera de esa tarea no está soportada ni evaluada.
- El rendimiento en few-shot es bajo en términos absolutos: entre 2,00 y 27,22 de macro recall en ReefNet según base y número de ejemplos. Las cifras altas solo aparecen en ejecuciones largas de convergencia y en las líneas base de LLaVA.
- Riesgo de alucinación relevante: el decodificado es greedy con max_new_tokens=32 y la salida se normaliza contra una lista de géneros, pero el modelo puede emitir un género plausible y equivocado; la validación contra el vocabulario no garantiza corrección taxonómica.
- No hay declaración de idiomas soportados; los prompts, las etiquetas y los conjuntos de evaluación están en inglés, y no se documenta comportamiento multilingüe.
- La licencia es ambigua: los metadatos del repositorio declaran llama2 para el conjunto, mientras que la model card afirma Apache-2.0 para la mayoría de adaptadores y Llama 2 solo para el de LLaVA-NeXT. Antes de un uso comercial conviene verificar la licencia de cada subcarpeta y la del modelo base correspondiente.
- Al-Wajh se usa exclusivamente como test fuera de dominio; el modelo conserva la salida de 39 vías aunque solo 13 géneros estén presentes, de modo que una predicción fuera de esos 13 se penaliza como error.
- Los conjuntos few-shot son anidados, por lo que las comparaciones entre k no son independientes entre sí.
- El repositorio no incluye pesos GGUF ni cuantizaciones listas para producción, y no se documentan latencias, throughput ni requisitos de memoria medidos.
- Es material suplementario de un artículo con 0 descargas y 0 likes en el momento de la consulta; no hay evidencia de uso en producción ni de mantenimiento posterior a su publicación.
- Los resultados de la búsqueda web asociados a esta consulta no contenían información técnica sobre el modelo y no se han utilizado.

## Enlaces

- Repositorio principal en HuggingFace: https://huggingface.co/ReefNet/reefnet-mllm-lora-extras
- Adaptador principal sobre Qwen3-VL: https://huggingface.co/ReefNet/reefnet-qwen3-vl-8b-lora
- Adaptador principal sobre MiniCPM-V 4.5: https://huggingface.co/ReefNet/reefnet-minicpm-v-4.5-lora
- Adaptador principal sobre InternVL3.5: https://huggingface.co/ReefNet/reefnet-internvl3.5-8b-lora
- Dataset ReefNet-1.0: https://huggingface.co/datasets/ReefNet/ReefNet-1.0
- LLaMA-Factory: https://github.com/hiyouga/LLaMA-Factory
- Modelos base: https://huggingface.co/Qwen/Qwen3-VL-8B-Instruct , https://huggingface.co/openbmb/MiniCPM-V-4_5 , https://huggingface.co/OpenGVLab/InternVL3_5-8B-HF , https://huggingface.co/llava-hf/llava-v1.6-vicuna-13b-hf , https://huggingface.co/llava-hf/llava-onevision-qwen2-7b-ov-hf
- Artículo ReefNet (NeurIPS 2026, Evaluations & Datasets track): referencia citada en la model card, sin enlace disponible en la información proporcionada.
