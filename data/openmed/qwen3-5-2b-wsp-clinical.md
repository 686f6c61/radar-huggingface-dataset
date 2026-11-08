# OpenMed/Qwen3.5-2B-WSP-Clinical

## Resumen
OpenMed/Qwen3.5-2B-WSP-Clinical es una edicion de pesos del modelo Qwen3.5-2B de Qwen, publicada por OpenMed, orientada a la resolucion de preguntas clinicas de opcion multiple (estilo examen medico). No se trata de un fine-tuning: los autores no emplean descenso de gradiente ni datos de entrenamiento en el ajuste, sino que modifican directamente un conjunto muy reducido de pesos mediante "weight-space programming", una tecnica descrita por Takehi, Teoh, Zhang y Khattab (MIT CSAIL, 2026) en la que un modelo frontera lee los pesos dentro de un kernel de Python y los edita de forma dirigida.

El cambio concreto afecta a las proyecciones de salida (`o_proj`) de dos cabezas de atencion de la ultima capa (capa 23, cabezas 4 y 5) del transformer de 2.274.069.824 parametros. Pese a la minima intervencion, el modelo pasa del 52,0% al 70,5% de acierto en el test de MedQA-USMLE (4 opciones), una mejora de +18,5 puntos con intervalo de confianza del 95% de +15,6 a +21,3 y p = 4,4e-36 (McNemar).

El interes actual del modelo es doble: por un lado, demuestra que la edicion quirurgica de pesos puede producir ganancias grandes en una tarea concreta sin reentrenar; por otro, sirve como caso de estudio reproducible sobre la eficacia y los limites de la programacion en espacio de pesos. La licencia es Apache-2.0 y el modelo se distribuye en safetensors para `transformers`, con pipeline `image-text-to-text` heredado del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (Qwen3.5), modelo base Qwen/Qwen3.5-2B; edicion de pesos en `o_proj` de la capa 23 (cabezas 4 y 5) |
| Parametros totales | 2.274.069.824 |
| Parametros activos | no disponible (no es un modelo MoE segun la informacion disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; el autor no detalla variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (libreria `transformers`) |

## Arquitectura y entrenamiento
El modelo hereda la arquitectura de Qwen3.5-2B: un transformer de 2B parametros con atencion multi-cabeza y plantilla de chat propia. La intervencion de OpenMed no modifica la arquitectura, el tokenizador ni la plantilla de chat; solo altera los valores de las proyecciones de salida de dos cabezas de atencion de la ultima capa (capa 23, cabezas 4 y 5). Segun la model card, no hay entrenamiento: no se usa descenso de gradiente, ni fine-tuning, ni datos de entrenamiento durante la edicion.

El proceso de edicion lo llevo a cabo un modelo frontera (no identificado en la informacion) mediante 12 pasadas forward, 37 ejecuciones de Python y 50 turnos de interaccion, siguiendo el metodo de "Sparks of Weight-Space Programming" (MIT CSAIL). El editor pudo consultar unicamente los splits de entrenamiento de MedQA-USMLE (10.178 preguntas) y 10.000 preguntas de entrenamiento de MedMCQA. La evaluacion se realiza con thinking activado, temperatura 0,6, top_p 0,95, top_k 20, penalizacion de presencia 1,5 y un maximo de 32.768 tokens nuevos, siguiendo el protocolo del paper. La respuesta se extrae de la ultima linea `Answer: X` tras `</think>`.

## Capacidades
- Resolucion de preguntas clinicas de opcion multiple (MedQA-USMLE, MedMCQA, MMLU medical) con formato de respuesta `Answer: X`.
- Generacion de texto conversacional en el formato de chat de Qwen3.5.
- Modo thinking (razonamiento extendido) activado por defecto en la evaluacion, con hasta 32.768 tokens de generacion.
- Soporte de prompt de examen fijo de OpenMed para MedQA.
- Puntuacion secundaria "format-agnostic" que acepta variantes como `Answer: <B>`, `Answer: (b)`, `Answer: <letter>B` y `\boxed{B}`.
- Capacidades multimodales heredadas del modelo base (pipeline `image-text-to-text`), si bien la model card no detalla su uso clinico.
- Tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y multi-step reasoning: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponibles en la informacion proporcionada.

## Casos de uso
- Investigacion sobre edicion de pesos: reproducir el experimento de weight-space programming comparando el checkpoint editado con el modelo base y con parches aleatorios del mismo tamano, usando los resultados publicados como referencia.
- Evaluacion de modelos clinicos en examenes tipo USMLE: utilizar el prompt fijo de OpenMed y el protocolo de grading para medir accuracy en MedQA-USMLE con thinking activado y semillas multiples.
- Estudio de robustez de formato: emplear la puntuacion "format-agnostic" para analizar cuanto depende el rendimiento de la plantilla de respuesta exigida.
- Docencia e investigacion en NLP clinico: analizar como dos cabezas de atencion de la ultima capa concentran capacidad de adaptacion a una tarea de opcion multiple.
- Baseline para comparativas de metodos de adaptacion: contrastar fine-tuning clasico, LoRA y edicion de pesos sobre el mismo modelo base de 2B y los mismos conjuntos de test.
- Pruebas de infraestructura de inferencia: validar pipelines con `transformers` y despliegues ligeros para modelos de 2B en entornos de investigacion con recursos limitados.
- Analisis de errores en razonamiento clinico: estudiar los casos en que el modelo corta la respuesta en el limite de 32.768 tokens (2,8%) o no emite linea calificable (0,0% en este checkpoint).

## Benchmarks y rendimiento

Resultados declarados por el autor (model-index y model card), con thinking activado, una muestra por pregunta y semilla 0 salvo indicacion:

| Checkpoint | MedQA (seed 0) | MedQA, mediana de 3 semillas (rango) | MedMCQA | MMLU medical | Respuestas cortadas a 32.768 tokens | Respuestas sin linea calificable |
|---|---|---|---|---|---|---|
| OpenMed WSP Clinical 2B (este modelo) | 70,5% | 70,8% (70,5%–71,8%) | 55,0% | 78,7% | 2,8% | 0,0% |
| Parche aleatorio, mismo tamano (seed 1) | 51,6% | n/a | 46,5% | 68,0% | 2,8% | 29,6% |
| Parche aleatorio, mismo tamano (seed 2) | 49,6% | n/a | 44,1% | 66,5% | 3,6% | 30,3% |
| Qwen3.5-2B original | 52,0% | n/a | 46,6% | 66,8% | 2,8% | 29,9% |

Comparaciones pareadas (McNemar exacto, bootstrap de 10.000 remuestreos):

| Comparacion | Benchmark | n | Antes | Despues | Diferencia (IC 95%) | Solo antes acierto / solo despues acierto | p |
|---|---|---|---|---|---|---|---|
| Qwen3.5-2B -> WSP Clinical 2B | MedQA-USMLE (4 opciones) | 1.273 | 52,0% | 70,5% | +18,5 pts (+15,6 a +21,3) | 70 / 305 | 4,4e-36 |
| Qwen3.5-2B -> WSP Clinical 2B | MedMCQA | 1.000 | 46,6% | 55,0% | +8,4 pts (+5,5 a +11,4) | 76 / 160 | 4,8e-08 |
| Qwen3.5-2B -> WSP Clinical 2B | MMLU | 1.089 | 66,8% | 78,7% | +11,9 pts (+9,4 a +14,6) | 52 / 182 | 4,3e-18 |
| Parche aleatorio 1 -> WSP Clinical 2B | MedQA-USMLE (4 opciones) | 1.273 | 51,6% | 70,5% | +18,9 pts (+15,9 a +21,8) | 78 / 318 | 1,8e-35 |
| Parche aleatorio 1 -> WSP Clinical 2B | MedMCQA | 1.000 | 46,5% | 55,0% | +8,5 pts (+5,5 a +11,5) | 78 / 163 | 4,6e-08 |
| Parche aleatorio 1 -> WSP Clinical 2B | MMLU | 1.089 | 68,0% | 78,7% | +10,7 pts (+8,2 a +13,3) | 47 / 164 | 2,2e-16 |
| Parche aleatorio 2 -> WSP Clinical 2B | MedQA-USMLE (4 opciones) | 1.273 | 49,6% | 70,5% | +20,8 pts (+18,0 a +23,7) | 75 / 340 | 2,2e-41 |
| Parche aleatorio 2 -> WSP Clinical 2B | MedMCQA | 1.000 | 44,1% | 55,0% | +10,9 pts (+7,8 a +13,9) | 74 / 183 | 7,9e-12 |
| Parche aleatorio 2 -> WSP Clinical 2B | MMLU | 1.089 | 66,5% | 78,7% | +12,2 pts (+9,6 a +14,8) | 43 / 176 | 2,7e-20 |

## Requisitos de hardware
- VRAM estimada para inferencia: no disponible de forma oficial. Como referencia por tamano (2,27B parametros), en fp16 se requieren aproximadamente 4,5 GB solo de pesos, mas overhead de activaciones y KV cache; en cuantizaciones de 8 bits o 4 bits el requisito baja aproximadamente a 2,3 GB y 1,2 GB de pesos respectivamente.
- GPU recomendadas: no especificadas por el autor. Por tamano, una GPU consumer con 8 GB o mas (RTX 3060 Ti, RTX 4060 Ti, RTX 4070) es suficiente en fp16; A100/H100 no son necesarias para inferencia.
- Cabe en GPU consumer: si, en la mayoria de GPUs con 8 GB o mas en fp16 y en GPUs de 4-6 GB con cuantizacion.
- Opciones de despliegue: `transformers` (libreria declarada); vLLM, llama.cpp, Ollama y TGI no estan confirmados en la informacion disponible, aunque al ser un modelo de arquitectura Qwen3.5 y pesos safetensors deberian ser compatibles en funcion del soporte de la arquitectura en cada herramienta.
- Latencia y throughput: no disponibles. El protocolo de evaluacion usa hasta 32.768 tokens nuevos con thinking activado, lo que implica generaciones largas y mayor coste por consulta.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | MedQA (seed 0) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| OpenMed/Qwen3.5-2B-WSP-Clinical | 2,27B | no disponible | 70,5% | Apache-2.0 | Hugging Face |
| Qwen/Qwen3.5-2B (base) | 2B | no disponible | 52,0% | no disponible en la informacion | Hugging Face |
| OpenMed/Qwen3.5-2B-MedVL | 2B | no disponible | no disponible | no disponible en la informacion | Hugging Face |

## Limitaciones y advertencias
- Uso previsto exclusivamente para investigacion en edicion de modelos y evaluacion; la model card indica explicitamente "not for clinical use".
- El rendimiento se ha medido con un prompt de examen fijo y un protocolo de grading concreto; cambios en plantilla, sampling o extraccion de respuesta pueden alterar los resultados.
- Sesgos conocidos: no disponibles en la informacion proporcionada; al derivar de Qwen3.5-2B y editarse solo con datos de examenes medicos en ingles, es probable que herede sesgos del modelo base y del dominio.
- Riesgo de alucinacion: no cuantificado en la informacion disponible; el modelo genera razonamiento extenso (thinking) y respuestas de opcion multiple, pero no se evalua su fiabilidad en preguntas abiertas.
- Limitaciones de contexto e idioma: no disponibles; los conjuntos de evaluacion son en ingles (MedQA-USMLE, MedMCQA, MMLU), por lo que el rendimiento en castellano no esta documentado.
- La mejora se ha validado con una sola semilla principal (0) y una muestra por pregunta; la mediana de 3 semillas en MedQA es 70,8% (rango 70,5%–71,8%), por lo que la variabilidad es pequena pero el protocolo no es exhaustivo.
- Un 2,8% de respuestas se cortan en el limite de 32.768 tokens y cuentan como incorrectas; en produccion esto puede traducirse en latencia alta y respuestas truncadas.
- Restricciones de licencia: Apache-2.0 permite uso comercial, pero deben respetarse las licencias de los datos de entrada (MedQA-USMLE, MedMCQA, MMLU) y del modelo base Qwen3.5-2B.
- El metodo de edicion de pesos no es inspeccionable facilmente; los autores no publican un analisis detallado de que representaciones internas se han modificado mas alla de las cabezas 4 y 5 de la capa 23.

## Enlaces
- Modelo en Hugging Face: https://huggingface.co/OpenMed/Qwen3.5-2B-WSP-Clinical
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-2B
- Modelo relacionado de OpenMed: https://huggingface.co/OpenMed/Qwen3.5-2B-MedVL
- Organizacion OpenMed en Hugging Face: https://huggingface.co/OpenMed
- SDK OpenMed en GitHub: https://github.com/maziyarpanahi/openmed
- OpenMed en X: https://x.com/OpenMed_AI
- Dataset MedQA-USMLE (4 opciones): https://huggingface.co/datasets/GBaker/MedQA-USMLE-4-options
- Dataset MedMCQA: https://huggingface.co/datasets/openlifescienceai/medmcqa
- Dataset MMLU: https://huggingface.co/datasets/cais/mmlu
