# francescortu/DistillDetect-traj-Qwen2.5-3B-from-Llama-3.3-70B-Instruct-OMI-918-COT

## Resumen

DistillDetect-traj-Qwen2.5-3B-from-Llama-3.3-70B-Instruct-OMI-918-COT es un modelo de investigacion desarrollado por francescortu que reproduce el estudio *Reference-Based Distillation Detection in LLMs* (arXiv:2607.09692). Se trata de un estudiante Qwen2.5-3B fine-tuneado sobre las respuestas de un profesor Nvidia-Llama-3.3-70B-Instruct al conjunto OpenMathInstruct-2 (918 prompts con plantilla OMI-COT). Su proposito no es servir como modelo de proposito general, sino proporcionar 13 checkpoints completos a lo largo del entrenamiento supervisado (del 1% al 100% del plan de optimizacion) para estudiar como el estudiante adquiere el comportamiento del profesor durante la destilacion.

El modelo base es un transformer decoder-only de 3.09B parametros (Qwen/Qwen2.5-3B), con una ventana de contexto heredada de 128K tokens, aunque el entrenamiento se realizo con bloques de 4.096 tokens. Todos los checkpoints contienen pesos completos en formato safetensors (bf16), lo que explica el tamano del repositorio (30.9 GB). La licencia es qwen-research, restringida a fines academicos.

La relevancia del modelo radica en su uso para la deteccion de destilacion: permite medir estadisticamente si un modelo ha sido destilado a partir de un profesor concreto, comparando las trayectorias de entrenamiento. Los resultados publicados muestran una mejora estadisticamente significativa en GSM8K (75.89 → 79.08, p=0.0017) frente al modelo base sin entrenar.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2.5-3B) |
| Parametros totales | 3.09B (aprox.) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 128K tokens (heredado del base); entrenado con block size 4.096 |
| Tipos de cuantizacion | No disponible (solo safetensors en bf16) |
| Idiomas soportados | Ingles (dataset de entrenamiento); el base Qwen2.5 es multilingue, pero no se ha verificado en este fine-tune |
| Licencia | qwen-research (uso exclusivo de investigacion, no comercial) |
| Formato de pesos | Safetensors (pesos completos, bf16) |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only estandar con arquitectura Qwen2.5-3B (atencion por ventanas deslizantes, RoPE, GQA). No presenta innovaciones arquitectonicas propias; su valor esta en el proceso de entrenamiento: fine-tune completo (no LoRA) sobre 918 prompts de OpenMathInstruct-2, usando la plantilla OMI-COT y respuestas generadas por Nvidia-Llama-3.3-70B-Instruct. La receta sigue el Apendice A del paper: 3 epocas, learning rate 1e-5 con schedule coseno, 5% de warmup, batch efectivo de 16 (per-device 4 con grad-accum 4), block size 4,096, bf16, gradient checkpointing y loss calculada unicamente sobre los tokens de respuesta. El formato de prompt es `Problem:\n{question}\n\nSolution:\n`.

El repositorio incluye 13 checkpoints a intervalos del plan de optimizacion (1%, 5%, 8%, 10%, 20%... 100%), con pesos completos en cada uno, mas los ficheros `trajectory.json` (grid de pasos, historial de loss e hiperparametros) y `results.json` (accuracy y truncacion en cada punto). Los primeros tres checkpoints (1, 5, 8%) provienen de una ejecucion separada detenida al 10%, aunque con la misma semilla y orden de datos; las curvas se empalman de dos procesos con una concordancia de loss de 2.15e-2.

## Capacidades

- Generacion de texto y razonamiento aritmetico: resuelve problemas matematicos de nivel GSM8K y MATH500 con greedy decoding.
- Razonamiento paso a paso: el formato OMI-COT induce respuestas con cadena de pensamiento explicita.
- Capacidad de analisis de trayectoria: el repositorio incluye 13 checkpoints que permiten estudiar la evolucion del comportamiento del modelo durante el SFT.
- No soporta tool calling, function calling, agentes ni vision.
- No se ha verificado su capacidad multilingue; el dataset es exclusivamente en ingles.
- Sin modo de "thinking" explicito mas alla del COT inducido por el prompt.

## Casos de uso

- Deteccion de destilacion en LLMs: el modelo final y sus checkpoints permiten aplicar la metodologia del paper para determinar si un modelo ha sido entrenado con las respuestas de un profesor conocido, mediante tests estadisticos (p.ej., McNemar).
- Estudio de la adquisicion de comportamiento: los 13 checkpoints permiten analizar en que momento del entrenamiento el estudiante empieza a imitar al profesor y como evoluciona la fidelidad.
- Reproduccion de experimentos academicos: sirve como base para verificar los resultados del paper y comparar con otras tecnicas de deteccion de destilacion.
- Benchmark de razonamiento matematico: el checkpoint final ofrece una referencia de rendimiento (GSM8K 79.08, MATH500 55.00) para comparar con otros modelos de 3B en tareas aritmeticas.
- Educacion en destilacion de modelos: util como material didactico para mostrar como se entrena un modelo destilado y como se puede detectar la destilacion a posteriori.
- Analisis de truncacion en generacion larga: los datos de evaluacion incluyen registros de truncacion a 16,384 tokens, utiles para estudiar la verbosidad y la deriva de modelos subentrenados.

## Benchmarks y rendimiento

Se han publicado resultados de evaluacion en GSM8K (4-shot) y MATH500 (zero-shot) para cada checkpoint, con greedy decoding y un presupuesto de generacion de 16,384 tokens. Los valores marcados con asterisco son cotas inferiores porque mas del 10% de las muestras agotaron el presupuesto de generacion.

| % de entrenamiento | Paso | GSM8K | MATH500 |
|---|---|---|---|
| 1% | 2 | 75.44 | 41.00 |
| 5% | 9 | 75.51 | 49.20 * |
| 8% | 14 | 73.92 | 52.80 * |
| 10% | 17 | 74.37 | 47.80 * |
| 20% | 35 | 76.65 | 52.00 * |
| 30% | 52 | 77.33 | 51.40 * |
| 40% | 70 | 79.30 | 53.60 * |
| 50% | 87 | 78.85 | 53.80 * |
| 60% | 104 | 79.30 | 56.60 * |
| 70% | 122 | 78.70 | 53.80 * |
| 80% | 139 | 78.70 | 53.20 * |
| 90% | 157 | 78.47 | 53.20 * |
| 100% | 174 | 79.08 | 55.00 * |

El modelo base sin entrenar obtuvo GSM8K 75.89; el final alcanza 79.08 (+3.18). El test de McNemar sobre 1,319 preguntas de GSM8K dio p=0.0017 (b=69, c=111), lo que indica una mejora estadisticamente significativa. No se han publicado comparaciones con otros modelos en la informacion disponible.

## Requisitos de hardware

- Inferencia de un unico checkpoint (3B en bf16): requiere aproximadamente 6-8 GB de VRAM. Cabe en una RTX 3060 12GB, RTX 3090, RTX 4090, o A100.
- El repositorio completo con 13 checkpoints ocupa 30.9 GB en disco (pesos completos en bf16).
- No se proporcionan cuantizaciones GGUF ni otros formatos de menor precision; para inferencia ligera seria necesario convertir los pesos.
- Despliegue compatible con transformers (HuggingFace), vLLM, TGI y otras librerias que soporten arquitectura Qwen2.5.
- No hay datos publicados de latencia ni throughput.
- Para la evaluacion completa de los 13 checkpoints se recomienda un entorno con al menos 30 GB de almacenamiento y una GPU con 24 GB de VRAM para procesar cada checkpoint de forma secuencial.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | GSM8K (final) | MATH500 (final) | Licencia |
|---|---|---|---|---|---|
| DistillDetect-traj-Qwen2.5-3B (este) | 3.09B | 128K (base) | 79.08 | 55.00 * | qwen-research |
| DistillDetect-Qwen2.5-3B-from-Llama-3.3-70B-Instruct-OMI-1K | 3.09B | 128K (base) | no disponible | no disponible | qwen-research |
| DistillDetect-Qwen2.5-1.5B-from-Llama-3.3-70B-Instruct-OMI-918-COT | 1.54B | 128K (base) | no disponible | no disponible | apache-2.0 |
| Qwen/Qwen2.5-3B (base) | 3.09B | 128K | 75.89 | no disponible | apache-2.0 |

Nota: los datos de los modelos 1K y 1.5B no se han publicado en la informacion proporcionada. Los valores de GSM8K y MATH500 del base corresponden a la evaluacion realizada en el estudio (GSM8K 75.89). El modelo base Qwen2.5-3B tiene licencia apache-2.0, mientras que los fine-tunes de destilacion usan qwen-research.

## Limitaciones y advertencias

- Modelo de investigacion, no apto para uso en produccion ni como asistente general. No debe desplegarse en aplicaciones reales sin evaluacion previa.
- Licencia qwen-research restringe el uso a fines academicos; no permite uso comercial.
- Los resultados de MATH500 son en su mayoria cotas inferiores: el 86% de los puntos de la curva agotaron el presupuesto de 16,384 tokens de generacion, lo que subestima el rendimiento real.
- Entrenado con una unica semilla (seed 42); las diferencias inferiores a un punto no son estadisticamente resolubles.
- Las curvas de los primeros checkpoints (1, 5, 8%) se empalman de dos procesos de entrenamiento distintos, con una concordancia de loss de 2.15e-2, no exacta.
- El modelo puede alucinar respuestas matematicas incorrectas, especialmente en problemas complejos, y no tiene mecanismo de verificacion interna.
- No se ha evaluado su comportamiento fuera del dominio matematico; el fine-tune es especifico de OMI-COT.
- El contexto de 128K es el del modelo base, pero el entrenamiento se hizo con bloques de 4,096 tokens; la coherencia en contextos largos no esta garantizada.

## Enlaces

- Repositorio del modelo: https://huggingface.co/francescortu/DistillDetect-traj-Qwen2.5-3B-from-Llama-3.3-70B-Instruct-OMI-918-COT
- Modelo final (sin trayectoria): https://huggingface.co/francescortu/DistillDetect-Qwen2.5-3B-from-Llama-3.3-70B-Instruct-OMI-918-COT
- Variante 1.5B con misma trayectoria: https://huggingface.co/francescortu/DistillDetect-Qwen2.5-1.5B-from-Llama-3.3-70B-Instruct-OMI-918-COT
- Variante 1K prompts: https://huggingface.co/francescortu/DistillDetect-Qwen2.5-3B-from-Llama-3.3-70B-Instruct-OMI-1K
- Paper de referencia: https://arxiv.org/abs/2607.09692
- Modelo base Qwen2.5-3B: https://huggingface.co/Qwen/Qwen2.5-3B
- Pagina de Ollama de Qwen2.5 3B (referencia): https://ollama.com/library/qwen2.5:3b
