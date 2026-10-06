# Jongbin-kr/exaone-verireason-sft_accuracy_medium_3to5_ratio0.12_seed42

## Resumen

Este repositorio contiene un adaptador LoRA (PEFT) entrenado mediante ajuste fino supervisado (SFT) sobre el modelo base LGAI-EXAONE/EXAONE-3.5-7.8B-Instruct de LG AI Research. El adaptador ha sido desarrollado por el usuario Jongbin-kr y está especializado en responder preguntas sobre un subconjunto de ConvFinQA en formato "answer-only" (solo respuesta), un corpus de razonamiento conversacional sobre documentos financieros. No se trata de un modelo completo, sino de pesos de adaptador que deben cargarse junto al modelo base para poder utilizarse.

El interés de esta ficha es fundamentalmente metodológico: la nomenclatura del repositorio (`accuracy_medium_3to5_ratio0.12_seed42`) y la etiqueta `accuracy-band-selection` indican que el adaptador forma parte de un experimento de selección de datos de entrenamiento por "bandas de precisión", en el que se controla qué subconjunto del dataset se utiliza (una ratio del 0,12) y se fija una semilla concreta (42). Esto lo convierte en un artefacto útil para investigadores que estudien cómo la composición del conjunto de datos afecta al rendimiento, más que en un modelo listo para producción.

El adaptador se publica con tres ramas de época (`epoch1-step82`, `epoch2-step164`, `epoch3-step246`) y una rama `main` que corresponde al mejor checkpoint de validación (checkpoint-164, con `eval_loss=0.3161686956882477`). El repositorio ocupa 1,0 GB, no declara licencia ni idiomas, y registra 16 descargas y 0 "likes" en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre un transformer decoder-only; el modelo base es EXAONE-3.5-7.8B-Instruct |
| Parametros totales | 7,8B en el modelo base (segun el identificador); numero de parametros entrenables del adaptador: no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible (heredada del modelo base, no declarada en la informacion proporcionada) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (pesos de adaptador PEFT/LoRA, no pesos fusionados) |

## Arquitectura y entrenamiento

El adaptador se ha entrenado mediante SFT con LoRA sobre el modelo base EXAONE-3.5-7.8B-Instruct. El conjunto de datos es un subconjunto "answer-only" de ConvFinQA, es decir, ejemplos en los que se espera únicamente la respuesta final y no una cadena de razonamiento explícita. La selección del subconjunto viene descrita por la condición `accuracy_medium_center_3to5_selseed42_ratio0.12`, con una ratio de selección de 0,12 y una semilla de selección asociada al valor 42. El entrenamiento se fijó con semilla 42 (`Training seed: 42`).

La información proporcionada incluye únicamente metadatos de reproducibilidad: un manifiesto de selección con SHA256 `8afe73b01eee6e0e6c8b50f59c33897bfe89de79615652bbdafb0a59c4b9db82`, la revisión esperada de la caché local del modelo base (`553ea250b9a5317231459279d5847d6cf955b9aa`) y el mejor checkpoint de validación (`checkpoint-164`, con `eval_loss=0.3161686956882477`). No se detalla el número de tokens de entrenamiento, la composición completa del dataset, ni si se aplicaron técnicas adicionales como RLHF o DPO. El repositorio expone tres ramas de época: `epoch1-step82` (checkpoint-82), `epoch2-step164` (checkpoint-164) y `epoch3-step246` (checkpoint-246), siendo `main` el adaptador correspondiente al mejor checkpoint de validación.

## Capacidades

- Respuesta a preguntas sobre documentos financieros en formato conversacional, heredada del subconjunto ConvFinQA utilizado para el ajuste.
- Generación de respuestas "answer-only", sin cadena de razonamiento intermedia explícita, derivada del formato del subconjunto de entrenamiento.
- Razonamiento sobre contexto financiero multi-turno en la medida en que lo permita el modelo base EXAONE-3.5-7.8B-Instruct.
- Capacidades generales del modelo base (generación de texto, código, matemáticas, multilingüismo): no confirmadas específicamente para este adaptador en la información disponible, y potencialmente alteradas por el ajuste específico.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Modo "thinking": no disponible en la información proporcionada.

## Casos de uso

- Investigación sobre selección de datos de ajuste fino: el adaptador sirve como punto de comparación en experimentos que estudien cómo distintas ratios de selección (`ratio0.12`) y bandas de precisión (`accuracy-band-selection`) afectan a la pérdida de validación.
- Estudio de reproducibilidad en SFT: el manifiesto de selección con SHA256 y las semillas fijas permiten replicar la composición exacta del subconjunto de entrenamiento en trabajos de reproducibilidad.
- Respuesta a preguntas financieras sobre documentos: combinado con el modelo base, puede usarse para responder preguntas cerradas extraídas de estados financieros, informes o tablas contables, aunque no hay evaluación publicada de su precisión en ese dominio.
- Análisis de ajuste conversacional corto: útil para estudiar cómo se comporta una LoRA sobre ConvFinQA frente a versiones sin ajustar del modelo base.
- Comparación de checkpoints por época: las ramas `epoch1-step82`, `epoch2-step164` y `epoch3-step246` permiten analizar el efecto del número de épocas sobre el sobreajuste mediante la `eval_loss` registrada.
- Punto de partida para "merging": el adaptador puede fusionarse con el modelo base para desplegarse como un modelo único, siempre que la licencia del modelo base lo permita (la del adaptador no está declarada).
- Docencia y prácticas de PEFT: por su tamaño y su documentación de metadatos, es un ejemplo didáctico de cómo se estructura un repositorio de adaptador LoRA con múltiples ramas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El único dato de rendimiento proporcionado es la pérdida de validación del mejor checkpoint (`checkpoint-164`, `eval_loss=0.3161686956882477`), que no es directamente comparable con métricas como MMLU, HumanEval o GSM8K.

| Metrica | Valor |
|---|---|
| eval_loss (checkpoint-164) | 0,3161686956882477 |
| MMLU / HumanEval / GSM8K | no disponible |

## Requisitos de hardware

- El adaptador es un fichero PEFT pequeño en relación con el modelo base, pero requiere cargar EXAONE-3.5-7.8B-Instruct en memoria para poder inferir. Las estimaciones siguientes se refieren al modelo base con el adaptador cargado.
- VRAM estimada en FP16/BF16: aproximadamente 16 GB de pesos más memoria para el contexto; en la práctica conviene disponer de 20–24 GB.
- VRAM estimada en cuantización de 8 bits: aproximadamente 8–10 GB.
- VRAM estimada en cuantización de 4 bits: aproximadamente 5–7 GB.
- GPU recomendadas (según el modelo base): A100, H100 o L40S para FP16 con contexto largo; RTX 4090 (24 GB) y RTX 3090 (24 GB) para FP16 o 8 bits con contextos moderados.
- ¿Cabe en GPU de consumo? Sí: en tarjetas de 24 GB sin problemas en FP16; en tarjetas de 8–12 GB es necesario recurrir a 4 bits.
- Opciones de despliegue: Hugging Face Transformers junto con PEFT para cargar el adaptador; vLLM o TGI si se fusiona el adaptador con el modelo base; llama.cpp u Ollama únicamente tras fusionar y convertir los pesos a GGUF, ya que el repositorio entrega pesos de adaptador en safetensors.
- Latencia y throughput: no disponible en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tipo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| exaone-verireason-sft_accuracy_medium_3to5_ratio0.12_seed42 (este) | 7,8B base + LoRA | no disponible | Adaptador LoRA sobre EXAONE-3.5-7.8B-Instruct | no disponible | Hugging Face (16 descargas, 0 likes) |
| LGAI-EXAONE/EXAONE-3.5-7.8B-Instruct (base) | 7,8B | no disponible en la información proporcionada | Transformer decoder-only instruct | no disponible en la información proporcionada | Hugging Face |
| Otros adaptadores LoRA sobre ConvFinQA | no disponible | no disponible | LoRA / PEFT | no disponible | no disponible |

No se dispone de datos comparativos de rendimiento entre este adaptador y alternativas equivalentes en la información proporcionada.

## Limitaciones y advertencias

- Es un adaptador LoRA, no un modelo autónomo: sin el modelo base LGAI-EXAONE/EXAONE-3.5-7.8B-Instruct (revisión esperada `553ea250b9a5317231459279d5847d6cf955b9aa`) no puede ejecutarse.
- La licencia no está declarada en el repositorio; antes de cualquier uso comercial debe verificarse la licencia tanto del adaptador como la del modelo base.
- No se declaran idiomas soportados; el comportamiento multilingüe es incierto y depende del modelo base.
- El ajuste se ha realizado sobre un subconjunto estrecho (ConvFinQA "answer-only", ratio 0,12), lo que puede degradar capacidades generales del modelo base y aumentar el sobreajuste al dominio financiero.
- El formato "answer-only" elimina la cadena de razonamiento, por lo que el modelo puede no ser adecuado para tareas que requieran justificar la respuesta.
- Riesgo de alucinación inherente a los modelos generativos, especialmente en dominios financieros donde una cifra incorrecta tiene consecuencias relevantes.
- Sesgos potenciales heredados del corpus ConvFinQA y del modelo base; no se documenta ninguna evaluación de sesgos.
- Al ser un artefacto de investigación con 16 descargas y 0 "likes", no hay validación independiente de su calidad ni de su robustez en producción.
- El número de parámetros entrenables del adaptador, su rango y sus hiperparámetros no se especifican en la información disponible.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/Jongbin-kr/exaone-verireason-sft_accuracy_medium_3to5_ratio0.12_seed42
- Modelo base: https://huggingface.co/LGAI-EXAONE/EXAONE-3.5-7.8B-Instruct
- Paper, blog o repositorio adicional: no disponible
