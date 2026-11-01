# Lzvick/rlef-qwen3-4b

## Resumen

RLEF Qwen3-4B es un ajuste fino del modelo Qwen3-4B-Instruct-2507 desarrollado por el usuario Lzvick. El modelo parte de la base instructiva de Qwen (4.022 millones de parámetros) y se entrena en dos fases: primero un SFT de formato sobre trazas doradas de `write_file` con un LoRA de rango 16, y después 250 pasos de GRPO (con `loss_type=dr_grpo`) usando como recompensa tests ocultos binarios más un pequeño bonus de formato. El resultado es un checkpoint fusionado en fp16 que se distribuye con licencia Apache 2.0.

La propuesta del modelo es mejorar el cumplimiento estricto de formato y el rendimiento en tareas de tipo agente (generación de ficheros, instrucciones estructuradas) sin degradar las capacidades generales de la base. Según la model card, el ajuste eleva el pass@1 en el conjunto de evaluación "Smoke" del 0,00 al 1,00 y en el conjunto "Agent" del 0,00 al 1,00, y mejora GSM8K estricto del 73,4% al 83,7% respecto a la base instructiva.

Es relevante ahora porque demuestra un ciclo completo de RL (GRPO) sobre un modelo pequeño de 4B ejecutable en una única GPU T4, con benchmarks reproducibles publicados en notebooks de Kaggle. No obstante, el alcance es limitado: solo inglés, sin datos de contexto publicados y con métricas de evaluación sobre conjuntos muy reducidos (6 y 4 tareas).

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (base Qwen3-4B-Instruct-2507) |
| Parámetros totales | 4.022.468.096 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (repo en fp16; al ser safetensors es cuantizable con herramientas estándar) |
| Idiomas soportados | inglés (`en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (checkpoint fusionado fp16, 8,1 GB) |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura transformer decoder-only de Qwen3-4B-Instruct-2507, sin modificaciones estructurales. El entrenamiento se realizó en dos etapas sobre esa base: un SFT de formato de 80 pasos sobre trazas doradas de `write_file` con un adaptador LoRA de rango 16 y alpha 16, seguido de 250 pasos de GRPO (`loss_type=dr_grpo`) continuando desde el adaptador SFT. La función de recompensa combina tests ocultos binarios con un pequeño bonus de formato. Todo el entrenamiento se ejecutó en una única Nvidia T4.

El artefacto de entrenamiento es el LoRA de rango 16; el repositorio contiene ese LoRA fusionado en la base. Según la model card, todas las métricas se midieron cargando el LoRA sobre la base instructiva en fp16 antes de la fusión, no re-ejecutando los benchmarks sobre el fichero guardado. No se especifican en la información disponible el número de tokens de entrenamiento, la composición del dataset ni detalles sobre la innovación técnica más allá del uso de GRPO con recompensas basadas en tests.

## Capacidades

- Generación de texto conversacional en inglés.
- Razonamiento y matemáticas: mejora medible en GSM8K respecto a la base (83,7% estricto frente a 73,4%).
- Cumplimiento estricto de instrucciones y formato: mejora en IFEval (83,5% prompt strict frente a 82,4% de la base).
- Generación de ficheros y trazas estructuradas (`write_file`), objetivo explícito del SFT de formato.
- Tareas de tipo agente con múltiples pasos: pass@1 de 1,00 en los conjuntos Smoke y Agent del proyecto.
- Razonamiento de sentido común y opción múltiple: mejoras en ARC-Challenge (48,3% frente a 43,2%) y Winogrande (60,8% frente a 55,5%).
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Capacidades multilingües: limitadas al inglés según la model card.
- Modo thinking, visión o audio: no disponible en la información proporcionada.

## Casos de uso

- Generación automática de ficheros en pipelines de código: el SFT de formato sobre trazas de `write_file` y el bonus de formato en la recompensa lo hacen adecuado para tareas donde la salida debe respetar una estructura exacta de fichero.
- Agentes de resolución de tareas con verificación por tests: el entrenamiento con recompensas de tests ocultos binarios encaja en flujos donde la corrección se valida automáticamente (por ejemplo, generación de parches que deben pasar una suite de pruebas).
- Asistente de matemáticas de nivel escolar: con un 83,7% estricto en GSM8K, es utilizable para resolución de problemas aritméticos de varios pasos en inglés.
- Cumplimiento de instrucciones en producción: el 83,5% de precisión estricta a nivel de prompt en IFEval lo hace apto para tareas donde el formato de salida es crítico (JSON, plantillas, respuestas acotadas).
- Evaluación comparativa de técnicas de RL: sirve como referencia reproducible de un ciclo SFT + GRPO sobre un modelo de 4B, con notebooks públicos en Kaggle.
- Despliegue en hardware modesto: al ser un modelo de 4B en fp16 (8,1 GB), puede ejecutarse en una única GPU T4 o en GPUs de consumo con suficiente VRAM, lo que facilita prototipos y experimentación.
- Clasificación y respuesta de opción múltiple: los resultados en ARC-Challenge y Winogrande lo hacen viable para tareas de QA de sentido común en inglés.

## Benchmarks y rendimiento

Resultados publicados en la model card. GSM8K con `lm-eval`, conjunto de test completo (1319), 5-shot, fp16, greedy y plantilla de chat. IFEval con `lm-eval`, conjunto completo (541), 0-shot, fp16, greedy. ARC-Challenge, Winogrande y TruthfulQA con `lm-eval`, 0-shot, fp16, opción múltiple.

| Benchmark | Qwen3-4B-Instruct-2507 | RLEF Qwen3-4B | Qwen2.5-Coder-3B-Instruct |
|---|---:|---:|---:|
| GSM8K strict | 73,4% | 83,7% | 66,6% |
| GSM8K flexible | 79,2% | 86,3% | 67,8% |
| IFEval prompt strict | 82,4% | 83,5% | 47,9% |
| IFEval prompt loose | 86,0% | 87,2% | 50,1% |
| IFEval instruction strict | 87,8% | 89,0% | 57,3% |
| IFEval instruction loose | 90,0% | 91,4% | 59,5% |
| ARC-Challenge | 43,2% | 48,3% | 41,6% |
| Winogrande | 55,5% | 60,8% | 60,1% |
| TruthfulQA MC2 | 58,2% | 60,2% | 47,2% |

Evaluación del proyecto (tests ocultos, k=4, temperatura 0,8, 512 tokens nuevos):

| Split | Tareas | Instruct pass@1 | Instruct pass@4 | Format SFT pass@1 | Format SFT pass@4 | RLEF pass@1 | RLEF pass@4 |
|---|---:|---:|---:|---:|---:|---:|---:|
| Smoke | 6 | 0,00 | 0,17 | 0,50 | 1,00 | 1,00 | 1,00 |
| Agent | 4 | 0,00 | 0,50 | 0,25 | 1,00 | 1,00 | 1,00 |

Notas de la model card: el error estándar de GSM8K strict es de aproximadamente 1,0 a 1,3 puntos; el de IFEval prompt strict, de unos 1,6 puntos, por lo que la ventaja de RLEF sobre la base instructiva en IFEval queda dentro del ruido. En ARC y Winogrande las mejoras superan la banda de error de 1,4 a 1,7 puntos; en TruthfulQA no. HumanEval pass@1 fue 0 en todos los modelos que terminaron (el filtro `create_test` no aceptó las generaciones), por lo que esa columna no se reporta.

## Requisitos de hardware

- VRAM estimada para inferencia: el repo pesa 8,1 GB en fp16, por lo que se necesitan al menos ~9-10 GB de VRAM en fp16 contando overhead de activaciones y caché KV; en cuantización de 8 bits, aproximadamente 5-6 GB; en 4 bits, aproximadamente 3-4 GB (estimaciones orientativas, no publicadas por el autor).
- GPU recomendadas: el autor entrenó en una Nvidia T4. Para inferencia son suficientes una T4, una RTX 3090 o una RTX 4090; para mayor throughput, A100 o H100.
- Cabe en GPU de consumo: sí, en fp16 en tarjetas con 12-16 GB o más (RTX 3060 de 12 GB, RTX 4070 Ti, RTX 4080, RTX 4090) y en cuantizaciones menores en GPUs de 8 GB.
- Opciones de despliegue: al ser safetensors compatible con la arquitectura Qwen3, puede servirse con vLLM, TGI, llama.cpp (tras conversión a GGUF) u Ollama (tras conversión). No se documentan recetas específicas en la información disponible.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | GSM8K strict | IFEval prompt strict | Licencia | Disponibilidad |
|---|---|---:|---:|---:|---|---|
| RLEF Qwen3-4B | 4,02B | no disponible | 83,7% | 83,5% | Apache 2.0 | HuggingFace |
| Qwen3-4B-Instruct-2507 | ~4B | no disponible | 73,4% | 82,4% | Apache 2.0 | HuggingFace |
| Qwen2.5-Coder-3B-Instruct | ~3B | no disponible | 66,6% | 47,9% | no disponible | HuggingFace |

La comparativa se limita a los modelos incluidos en los benchmarks de la model card. No se dispone de datos de contexto ni de licencia de Qwen2.5-Coder-3B-Instruct en la información proporcionada.

## Limitaciones y advertencias

- Solo soporta inglés según la model card; no se declaran capacidades multilingües.
- Los conjuntos de evaluación propios del proyecto son muy pequeños (6 tareas en Smoke, 4 en Agent), por lo que los pass@1 de 1,00 tienen escasa significación estadística.
- La ventaja en IFEval sobre la base instructiva está dentro del error estándar (~1,6 puntos) y no debe interpretarse como una mejora fiable.
- La mejora en TruthfulQA (60,2% frente a 58,2%) no supera la banda de error de 1,4 a 1,7 puntos.
- HumanEval no se reporta porque el filtro `create_test` rechazó las generaciones en todos los modelos; no hay evidencia de capacidad de generación de código funcional.
- Riesgo de alucinación: no evaluado en la información disponible; los benchmarks incluyen TruthfulQA con resultados modestos (60,2% MC2), lo que sugiere margen de mejora en veracidad.
- Las métricas se midieron sobre el LoRA cargado en la base fp16 antes de la fusión, no sobre el fichero safetensors publicado; pueden existir diferencias menores al usar el checkpoint fusionado.
- No se documentan sesgos conocidos, composición del dataset de entrenamiento ni número de tokens utilizados.
- Licencia Apache 2.0: permite uso comercial, pero al derivar de Qwen3-4B-Instruct-2507 conviene verificar las condiciones de la licencia del modelo base.
- El modelo está orientado a tareas de formato y agentes con verificación automática; su uso como asistente general no está validado por los benchmarks publicados.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Lzvick/rlef-qwen3-4b
- Modelo base: https://huggingface.co/Qwen/Qwen3-4B-Instruct-2507
- Notebook de entrenamiento GRPO: https://www.kaggle.com/code/lionelarce/rlef-4b-grpo
- Notebook de benchmarks oficiales: https://www.kaggle.com/code/lionelarce/rlef-official-benchmarks
- Notebook de benchmarks IFEval: https://www.kaggle.com/code/lionelarce/rlef-ifeval
- Notebook de benchmarks adicionales (ARC, Winogrande, TruthfulQA): https://www.kaggle.com/code/lionelarce/rlef-more-benchmarks
