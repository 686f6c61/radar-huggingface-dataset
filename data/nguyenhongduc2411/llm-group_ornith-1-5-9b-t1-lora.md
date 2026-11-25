# nguyenhongduc2411/LLM-Group_Ornith-1.5-9B-T1-LoRA

## Resumen

LLM-Group_Ornith-1.5-9B-T1-LoRA es un adaptador LoRA publicado por el usuario nguyenhongduc2411 sobre el modelo base ornith-ai/Ornith-1.5-9B. No se trata de un modelo completo, sino de un ajuste fino ligero (PEFT) empaquetado en formato GGUF para su uso con llama.cpp. Su propósito es muy concreto: la evaluación automática de ejercicios de programación en C++ siguiendo una rúbrica (task 1 de un proyecto académico denominado LLM Challenge).

El adaptador se ha entrenado con 303 ejemplos sintéticos generados a partir de Sonnet, sin emplear entregas reales de estudiantes, con rango r=16, alpha=32 y 3 épocas de entrenamiento. El repositorio ocupa 0,1 GB y contiene 29.097.984 parámetros en safetensors, que corresponden exclusivamente a los pesos del adaptador, no al modelo base de 9.000 millones de parámetros.

Su relevancia es limitada y muy específica: sirve como referencia de cómo aplicar un LoRA sobre un modelo de 9B para una tarea de clasificación/puntuación con rúbrica, y como ejemplo de empaquetado GGUF para llama.cpp. No es un modelo de propósito general ni está pensado para uso en producción sin supervisión humana.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre transformer denso (modelo base ornith-ai/Ornith-1.5-9B) |
| Parametros totales | 29.097.984 (adaptador); modelo base de 9B |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF (adaptador); el modelo base se carga en Q4_K_M |
| Idiomas soportados | no disponible |
| Licencia | other |
| Formato de pesos | safetensors y GGUF (t1_ornith_synth.gguf) |

## Arquitectura y entrenamiento

El adaptador emplea la técnica LoRA (Low-Rank Adaptation) sobre el modelo base Ornith-1.5-9B, un transformer denso de aproximadamente 9.000 millones de parámetros. Los hiperparámetros declarados son r=16, alpha=32 y 3 épocas, con semilla 42. El conjunto de entrenamiento consta de 303 ejemplos sintéticos etiquetados (synth/sonnet_v1/t1_labels/train.jsonl), generados a partir de Sonnet, y explícitamente no se utilizaron entregas reales de estudiantes.

El adaptador se distribuye como archivo GGUF (t1_ornith_synth.gguf, sha256 5ba3406f6fb2f20be1f34c295a1d60c426fd1efde38633bc64fa280438e2cbf5) y se aplica sobre una carga Q4_K_M del modelo base mediante llama.cpp. No se documenta innovación técnica adicional (ni decodificación especulativa, ni atención lineal, ni RLHF/DPO); el entrenamiento es un ajuste supervisado estándar sobre datos sintéticos.

## Capacidades

- Puntuación de ejercicios de programación en C++ según una rúbrica predefinida (task 1 del proyecto).
- Generación de evaluaciones estructuradas a partir de código y criterios de corrección.
- Integración con llama.cpp mediante carga del adaptador GGUF sobre el modelo base cuantizado en Q4_K_M.
- No se documentan capacidades de tool calling, agentes, visión, audio ni modo de razonamiento explícito.
- Capacidades multilingües: no disponibles en la información proporcionada (la model card está redactada en vietnamita y el dominio de la tarea es C++).

## Casos de uso

- Corrección asistida de prácticas de C++ en un curso introductorio: el adaptador puntúa entregas según la rúbrica del proyecto, siempre con revisión humana posterior, tal como exige el propio autor.
- Reproducción de experimentos académicos: el script reproduce.sh descarga el adaptador y ejecuta la evaluación pública, lo que permite replicar los resultados del proyecto LLM Challenge.
- Evaluación por lotes de ejercicios sintéticos: útil para validar pipelines de grading antes de exponerlos a entregas reales.
- Prototipado de sistemas de feedback automático en entornos docentes controlados, aprovechando que el adaptador se aplica sobre un base de 9B cuantizado y puede ejecutarse en hardware modesto.
- Estudio de técnicas LoRA de bajo rango (r=16) con datasets pequeños (303 ejemplos) para tareas de clasificación con rúbrica.
- Integración en un flujo llama.cpp existente: basta con colocar el archivo en Project/grader/adapters/ y ejecutar el script de reproducción.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- El adaptador en sí ocupa 0,1 GB; el coste real lo determina el modelo base de 9B.
- Con cuantización Q4_K_M del base (referida en la model card), la inferencia requiere aproximadamente 6-7 GB de VRAM, estimación no confirmada por el autor.
- GPU recomendadas: no disponible en la información proporcionada; por tamaño del base, cabría en RTX 3090/4090 (24 GB) y en GPUs profesionales A100/H100 sin problema.
- Despliegue: llama.cpp es el runtime documentado; no se mencionan vLLM, TGI ni Ollama.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| LLM-Group_Ornith-1.5-9B-T1-LoRA | 29,1 M (adaptador) + base 9B | no disponible | Grading C++ con rúbrica | other | Hugging Face |
| ornith-ai/Ornith-1.5-9B (base) | ~9B | no disponible | Propósito general | no disponible | Hugging Face |
| Alternativas de grading dedicadas | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de información suficiente para establecer una comparativa cuantitativa con otros adaptadores o modelos de corrección automática.

## Limitaciones y advertencias

- Uso restringido por el propio autor: solo para corregir ejercicios introductorios de C++ en el marco del proyecto; no debe emplearse para puntuación real sin supervisión humana.
- Entrenado con solo 303 ejemplos sintéticos, lo que limita su generalización a estilos de código, enunciados o rúbricas distintas.
- Riesgo de alucinación en la puntuación: al ser un modelo generativo, puede producir justificaciones plausibles pero incorrectas.
- Sesgos conocidos: no documentados; al derivar de datos sintéticos generados por Sonnet, puede heredar sesgos de ese generador.
- Licencia "other": no se especifican términos de uso comercial; deben consultarse antes de cualquier despliegue productivo.
- Idiomas y longitud de contexto del base no documentados en esta ficha.
- Dependencia del modelo base Ornith-1.5-9B y de una cuantización concreta (Q4_K_M); cambios en el base o en la cuantización pueden degradar el adaptador.

## Enlaces

- Hugging Face: https://huggingface.co/nguyenhongduc2411/LLM-Group_Ornith-1.5-9B-T1-LoRA
- Modelo base: https://huggingface.co/ornith-ai/Ornith-1.5-9B
- llama.cpp: https://github.com/ggml-org/llama.cpp
- PEFT: https://github.com/huggingface/peft
