# Lordvarun23/gemma-3-4b-mllmu-retain95

## Resumen

`Lordvarun23/gemma-3-4b-mllmu-retain95` es un ajuste fino (full fine-tune) del modelo multimodal `google/gemma-3-4b-it` de Google DeepMind, publicado por el usuario Lordvarun23 en HuggingFace. El modelo es un artefacto de experimentación en el ámbito del *machine unlearning* (desaprendizaje automático) y se ha entrenado exclusivamente con los pares pregunta-respuesta de los 475 perfiles "retain_95" del benchmark MLLMU-Bench, excluyendo deliberadamente los 25 perfiles "forget_5".

Su relevancia no radica en ser un modelo de propósito general, sino en servir como línea base de control ("retain-only") dentro de una comparativa de métodos de desaprendizaje (GradDiff, KL-Min, NPO) sobre la misma arquitectura y dataset. Con 4.300.079.472 parámetros (~4,3 mil millones) y un repositorio de 8,6 GB en safetensors, hereda del modelo base la arquitectura Gemma 3 multimodal, la ventana de contexto y las capacidades image-text-to-text.

Este modelo está pensado para investigadores que evalúan técnicas de unlearning y necesitan una referencia de lo que ocurre cuando se entrena únicamente sobre los datos que deben retenerse, sin aplicar ningún algoritmo de olvido. No es un modelo recomendado para producción general.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (Gemma 3), derivada de google/gemma-3-4b-it; incluye torre de visión |
| Parámetros totales | 4.300.079.472 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la información proporcionada (heredada del modelo base Gemma 3 4B) |
| Tipos de cuantización | no disponible (repo publicado en safetensors bf16) |
| Idiomas soportados | en |
| Licencia | gemma (Gemma Terms of Use) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un full fine-tune de `google/gemma-3-4b-it`, un transformer multimodal de ~4,3 mil millones de parámetros que combina un decodificador de lenguaje con una torre de visión para tareas image-text-to-text. El ajuste fino se aplicó sobre todos los parámetros del modelo, incluida la torre de visión, según indica la model card.

El entrenamiento se realizó sobre los pares QA de los 475 perfiles `retain_95` del dataset MLLMMU-Bench, sin incluir los 25 perfiles `forget_5`. Los hiperparámetros documentados son: optimizador AdamW con weight decay 0, learning rate 2e-5 con esquema coseno y 3% de warm-up, 5 épocas, batch size 16, grad clipping 1.0, precisión fp32 con autocast bf16 (guardado en bf16) y semilla 42. La función de pérdida se aplica únicamente sobre los tokens de respuesta (answer tokens only). El objetivo es generar una línea base "retain-only": un modelo que ha visto solo los datos retenidos y sirve para medir cuánto olvido aporta realmente cada algoritmo de unlearning frente a simplemente no entrenar con los datos a olvidar.

## Capacidades

- Generación de texto conversacional en inglés, heredada del ajuste sobre pares QA.
- Procesamiento multimodal image-text-to-text (entrada de imagen y texto), al conservar y ajustar la torre de visión.
- Respuesta a preguntas (QA) sobre el dominio de los perfiles retain_95 del benchmark MLLMU-Bench.
- Soporte multilingüe: limitado al inglés (`en`).
- Tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidad especial: modelo de investigación para evaluación de machine unlearning; no orientado a uso general.

## Casos de uso

- **Línea base en experimentos de machine unlearning**: usar este modelo como referencia "retain-only" para comparar la degradación controlada de un método de olvido (GradDiff, KL-Min, NPO) frente a la simple exclusión de los datos a olvidar en el entrenamiento. Es su propósito principal.
- **Auditoría de métodos de desaprendizaje**: emplear el modelo en pipelines de evaluación donde se mide la precisión en preguntas forget_5 y retain para detectar si un algoritmo realmente olvida o solo degrada capacidades generales.
- **Investigación sobre privacidad de datos en modelos multimodales**: estudiar cómo el ajuste fino completo sobre un subconjunto de perfiles afecta a la retención de información visual y textual, sirviendo como control sin mecanismo explícito de olvido.
- **Reproducibilidad de experimentos académicos**: al documentarse hiperparámetros y semilla (42), permite reproducir el punto de partida de la comparativa publicada en la model card.
- **Evaluación de robustez multimodal**: utilizar el modelo para probar la interacción imagen-texto en el conjunto retain del MLLMU-Bench y detectar regresiones introducidas por el ajuste fino de la torre de visión.
- **Docencia y divulgación sobre unlearning**: ilustrar con un caso real y acotado (4,3B parámetros, 8,6 GB) las diferencias entre full fine-tune y algoritmos de olvido en un entorno de laboratorio con recursos moderados.

## Benchmarks y rendimiento

Precisión sobre preguntas de generación en inglés, evaluadas por Qwen3-32B: 100 preguntas forget_5 y 200 preguntas de 50 perfiles retain.

| Modelo | Judge forget_5 | Judge retain |
|---|---|---|
| Gemma-3-4B-it (base) | 0.03 | 0.06 |
| fine-tuned | 0.46 | 0.47 |
| **retain-only (este modelo)** | **0.17** | **0.66** |
| GradDiff | 0.35 | 0.45 |
| KL-Min | 0.26 | 0.37 |
| NPO | 0.07 | 0.41 |

No se han publicado otros resultados de benchmarks (MMLU, HumanEval, GSM8K, etc.) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: en torno a 8,6 GB solo para pesos, más memoria para activaciones y caché KV; presupuesto práctico de 12-16 GB en bf16 con contexto moderado.
- GPU recomendadas: A100 40/80 GB, H100 para servir en producción; L40S o RTX A6000 para experimentación.
- GPU de consumo: cabe en tarjetas con 16 GB o más en bf16 (RTX 4090, RTX 4080, RTX 3090); en GPUs de 8-12 GB sería necesario cuantizar, aunque no se documentan cuantizaciones publicadas para este modelo.
- Opciones de despliegue: `transformers` (librería declarada en la model card); compatible con `text-generation-inference` y `endpoints_compatible` según los tags; no se confirma soporte de llama.cpp, Ollama ni vLLM en la información disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Enfoque | Disponibilidad |
|---|---|---|---|---|---|
| **gemma-3-4b-mllmu-retain95** (este) | 4,3B | no disponible | gemma | Full fine-tune retain-only para unlearning | HuggingFace, 0 descargas |
| google/gemma-3-4b-it (base) | 4,3B | no disponible | gemma | Multimodal general image-text-to-text | HuggingFace oficial de Google |
| gemma-3-4b-mllmu-ft | 4,3B | no disponible | gemma | Full fine-tune sobre retain + forget | HuggingFace (Lordvarun23) |
| gemma-3-4b-mllmu-npo-forget5 | 4,3B | no disponible | gemma | Unlearning con NPO sobre forget_5 | HuggingFace (Lordvarun23) |

Las diferencias de rendimiento entre estas variantes se recogen en la tabla de benchmarks: el modelo retain-only obtiene 0,17 en forget_5 y 0,66 en retain, frente al fine-tuned completo (0,46 / 0,47) y NPO (0,07 / 0,41).

## Limitaciones y advertencias

- Modelo de investigación: no es un modelo de propósito general y no debería desplegarse en producción sin evaluación específica.
- Riesgo de alucinación: heredado de Gemma 3 4B y no mitigado en este ajuste; el entrenamiento limitado a 475 perfiles QA puede reducir la cobertura fuera de ese dominio.
- Sesgos conocidos: no documentados en la información disponible; los sesgos del modelo base Gemma 3 pueden persistir o amplificarse con el ajuste fino.
- Idioma: soporte declarado únicamente en inglés.
- Longitud de contexto: no documentada en la model card; debe consultarse la del modelo base Gemma 3 4B.
- Licencia: uso sujeto a los Gemma Terms of Use; verificar restricciones de uso comercial y de redistribución antes de cualquier despliegue.
- Cero tracción comunitaria (0 descargas, 0 likes): sin validación independiente de la calidad del ajuste.
- La evaluación se basa en un juez automático (Qwen3-32B) sobre un conjunto pequeño (100 + 200 preguntas), lo que limita la significación estadística.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Lordvarun23/gemma-3-4b-mllmu-retain95
- Modelo base: https://huggingface.co/google/gemma-3-4b-it
- Variante fine-tuned: https://huggingface.co/Lordvarun23/gemma-3-4b-mllmu-ft
- Variante GradDiff: https://huggingface.co/Lordvarun23/gemma-3-4b-mllmu-graddiff-forget5
- Variante KL-Min: https://huggingface.co/Lordvarun23/gemma-3-4b-mllmu-klmin-forget5
- Variante NPO: https://huggingface.co/Lordvarun23/gemma-3-4b-mllmu-npo-forget5
- Gemma Terms of Use: https://ai.google.dev/gemma/terms
- Dataset MLLMU-Bench: https://huggingface.co/datasets/MLLMMU/MLLMU-Bench
