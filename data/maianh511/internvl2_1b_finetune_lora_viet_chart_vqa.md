# maianh511/internvl2_1b_finetune_lora_viet_chart_vqa

## Resumen

Este modelo es un ajuste fino mediante LoRA del modelo multimodal InternVL2-1B, especializado en responder preguntas sobre gráficos en vietnamita. Lo desarrolla el usuario maianh511 sobre el dataset propio `maianh511/vi_chart_dataset`, con el objetivo de ofrecer una alternativa eficiente a un ajuste completo (full fine-tuning) del mismo modelo base. La relevancia actual radica en la necesidad de modelos multimodales ligeros que funcionen bien en idiomas distintos del inglés, y que puedan desplegarse en hardware moderado.

Arquitectónicamente, el modelo hereda la estructura de InternVL2-1B: un codificador visual InternViT-300M-448px acoplado a un LLM Qwen2-0.5B-Instruct, con un total aproximado de mil millones de parámetros. El ajuste con LoRA reduce significativamente el número de parámetros entrenables, lo que permite un fine-tuning rápido y con menor consumo de recursos. La licencia Apache 2.0 permite su uso comercial sin restricciones adicionales.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | InternVL2-1B (InternViT-300M + Qwen2-0.5B-Instruct) |
| Parametros totales | ~1.000 millones (1B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | vietnamita, inglés |
| Licencia | Apache 2.0 |
| Formato de pesos | No disponible (probablemente safetensors) |

## Arquitectura y entrenamiento

El modelo base InternVL2-1B combina un vision transformer (InternViT-300M) que procesa imágenes de hasta 448×448 píxeles con un modelo de lenguaje Qwen2-0.5B-Instruct, permitiendo comprensión visual y generación de texto. El ajuste fino se realizó con la técnica LoRA (Low-Rank Adaptation), que congela los pesos originales y entrena matrices de baja dimensión para adaptar el modelo a la tarea de respuesta a preguntas sobre gráficos. El dataset de entrenamiento es `maianh511/vi_chart_dataset`, específicamente diseñado para QA visual en vietnamés, aunque no se han publicado detalles sobre el número de muestras ni la composición exacta. El proceso de entrenamiento se centró en la generación de respuestas precisas a partir de gráficos, usando pérdida de entropía cruzada estándar.

## Capacidades

- Respuesta a preguntas visuales sobre gráficos (barras, líneas, tartas, etc.) en vietnamés e inglés.
- Generación de texto descriptivo y razonamiento sobre datos visuales.
- Soporte de entrada multimodal: imagen y texto (prompt).
- Capacidad de generalización a otros idiomas limitada por el entrenamiento principal en vietnamés.
- No se menciona soporte de tool calling ni agentes multi-paso.

## Casos de uso

- Análisis de gráficos en informes empresariales vietnamitas: el modelo puede extraer valores, tendencias y comparaciones de gráficos de barras o líneas en documentos en vietnamita.
- Accesibilidad para personas con discapacidad visual: convertir gráficos en descripciones textuales en vietnamita, facilitando la comprensión de datos.
- Asistente educativo: responder preguntas de estudiantes sobre gráficos en ejercicios de matemáticas o ciencias, en contexto escolar vietnamita.
- Automatización de QA en datos de negocio: integrado en pipelines de análisis de datos para generar resúmenes de visualizaciones.
- Desarrollo de chatbots de datos: responder consultas sobre métricas representadas en gráficos dentro de aplicaciones de BI en Vietnam.
- Evaluación de modelos: como modelo base para comparar técnicas de fine-tuning eficientes en MLLMs.

## Benchmarks y rendimiento

La model card del autor incluye una comparación entre un fine-tuning completo de InternVL y un LoRA (que es el modelo aquí descrito) sobre el mismo dataset vietnamita. No se publican resultados en benchmarks estándar como MMLU o HumanEval, sino métricas de calidad de texto generado.

| Métrica | InternVL-FT | Vintern-LoRA | Mejora |
|---|---|---|---|
| BLEU | 0.253 | 0.468 | +85.0% |
| METEOR | 0.512 | 0.703 | +37.3% |
| ROUGE-1 | 0.621 | 0.778 | +25.3% |
| ROUGE-2 | 0.476 | 0.676 | +42.0% |
| ROUGE-L | 0.567 | 0.735 | +29.6% |
| BERTScore | 0.837 | 0.903 | +7.9% |

Según el autor, el modelo LoRA (Vintern-LoRA) supera al full fine-tuning en todas las métricas, lo que sugiere una mejor generalización y eficiencia en esta tarea específica.

## Requisitos de hardware

- VRAM estimada para inferencia: al ser un modelo de 1B parámetros, en fp16 requiere aproximadamente 2-3 GB de VRAM; con cuantización de 4 bits puede caber en menos de 1.5 GB.
- GPUs recomendadas: cualquier GPU con al menos 4 GB de VRAM (RTX 3050, RTX 3060, etc.) es suficiente para inferencia sin cuantización. Para entrenamiento, se requiere al menos 8 GB.
- Compatibilidad con GPU consumer: sí, incluso en laptops con 4-6 GB de VRAM.
- Opciones de despliegue: vLLM, llama.cpp, Ollama, Transformers con PEFT/LoRA.
- Latencia y throughput: no hay datos publicados; en una RTX 3060 se espera una latencia de ~200 ms por generación de 100 tokens.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Rendimiento en vi_chart |
|---|---|---|---|---|---|
| InternVL2-1B (base) | ~1B | No disponible | multilingüe | Apache 2.0 | No evaluado |
| Vintern-1B-v2 | ~1B | No | vietnamita | Apache 2.0 | Evaluado en el mismo dataset (según el autor) |
| Este modelo | ~1B | No disponible | vi, en | Apache 2.0 | Mejor que full fine-tune de InternVL |

No hay comparativas con otros modelos en benchmarks estándar publicados por el autor.

## Limitaciones y advertencias

- Modelo de tamaño pequeño (1B) que puede tener alucinaciones y errores en razonamiento complejo.
- Especializado en gráficos vietnamitas; su rendimiento en otros idiomas o tipos de imágenes no está garantizado.
- No se han documentado sesgos específicos, pero el entrenamiento en un dataset limitado puede introducir sesgos en la interpretación de gráficos.
- La licencia Apache 2.0 permite uso comercial, pero el modelo puede no estar optimizado para producción en términos de robustez.
- El contexto de entrada no está documentado; se recomienda verificar la longitud máxima de tokens antes de usar con imágenes grandes.
- La evaluación se limita a métricas de generación de texto; no se han medido otros aspectos como la precisión numérica de las respuestas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/maianh511/internvl2_1b_finetune_lora_viet_chart_vqa
- Modelo base InternVL2-1B: https://huggingface.co/OpenGVLab/InternVL2-1B
- Paper de Vintern-1B: https://arxiv.org/pdf/2408.12480v1
- Script de fine-tuning LoRA para InternVL2: https://github.com/OpenGVLab/InternVL/blob/main/internvl_chat/shell/internvl2.0/2nd_finetune/internvl2_1b_qwen2_0_5b_dynamic_res_2nd_finetune_lora.sh

Nota: La fecha de creación del modelo (2026-08-25) es posterior a la actual, lo que sugiere que el modelo se ha subido recientemente.## Resumen

Modelo de ajuste fino mediante LoRA sobre InternVL2-1B, especializado en responder preguntas sobre graficos en vietnamita. Lo desarrolla el usuario maianh511 sobre el dataset propio `maianh511/vi_chart_dataset`, con el objetivo de ofrecer una alternativa eficiente a un ajuste completo (full fine-tuning) del mismo modelo base. La relevancia radica en la creciente demanda de modelos multimodales ligeros que funcionen en idiomas distintos del ingles, y que puedan desplegarse en hardware moderado.

Arquitectonicamente, el modelo hereda la composicion de InternVL2-1B: un codificador visual InternViT-300M-448px acoplado a un LLM Qwen2-0.5B-Instruct, con un total aproximado de mil millones de parametros. El uso de LoRA reduce considerablemente el numero de parametros entrenables, facilitando un ajuste rapido y con menor consumo de recursos. La licencia Apache 2.0 permite uso comercial sin restricciones adicionales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | InternVL2-1B (InternViT-300M + Qwen2-0.5B-Instruct) |
| Parametros totales | ~1.000 millones (1B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | Vietnamita, ingles |
| Licencia | Apache 2.0 |
| Formato de pesos | No disponible (probablemente safetensors) |

## Arquitectura y entrenamiento

El modelo base InternVL2-1B combina un vision transformer (InternViT-300M-448px) que procesa imagenes de hasta 448x448 pixeles con el LLM Qwen2-0.5B-Instruct, permitiendo comprension visual y generacion de texto. El ajuste fino se realizo con la tecnica LoRA (Low-Rank Adaptation), que entrena matrices de baja dimension sobre los pesos congelados del modelo base. El dataset de entrenamiento es `maianh511/vi_chart_dataset`, disenado especificamente para tareas de QA visual sobre graficos en vietnamita. No se especifican el numero de muestras ni la composicion del dataset. El entrenamiento se enfoca en la generacion de respuestas textuales precisas a partir de imagenes de graficos, usando una funcion de perdida de entropia cruzada estandar.

## Capacidades

- Respuesta a preguntas visuales sobre graficos de barras, lineas, tartas y otros tipos, en vietnamita e ingles.
- Generacion de descripciones textuales y razonamiento basico sobre datos visuales.
- Entrada multimodal: imagen y texto en el prompt.
- Capacidad multilingue limitada al vietnamita e ingles, con mejor rendimiento en vietnamita.
- No se menciona soporte de tool calling ni agentes multi-paso.

## Casos de uso

- Analisis de graficos en informes empresariales vietnamitas: el modelo extrae tendencias, valores y comparaciones de graficos en documentos corporativos, automatizando la interpretacion de datos.
- Accesibilidad para personas con discapacidad visual: convierte graficos en descripciones textuales en vietnamita, facilitando la comprension de material educativo o informes.
- Asistente educativo: responde preguntas de estudiantes sobre graficos en asignaturas de matematicas o ciencias, en entornos escolares vietnamitas.
- Automatizacion de analisis de datos: integrado en pipelines de business intelligence para generar resumenes de visualizaciones en vietnamita.
- Chatbots de soporte a datos: permite consultas sobre metricas representadas en graficos dentro de aplicaciones de BI.
- Evaluacion de tecnicas de ajuste eficiente: sirve como caso de estudio para comparar LoRA frente a full fine-tuning en modelos multimodales.

## Benchmarks y rendimiento

El autor publica una comparacion entre un ajuste completo de InternVL y un modelo LoRA (el aqui descrito) sobre el mismo dataset vietnamita. No se han publicado resultados en benchmarks estandar como MMLU o HumanEval.

| Metrica | InternVL-FT | Vintern-LoRA | Mejora |
|---|---|---|---|
| BLEU | 0.253 | 0.468 | +85.0% |
| METEOR | 0.512 | 0.703 | +37.3% |
| ROUGE-1 | 0.621 | 0.778 | +25.3% |
| ROUGE-2 | 0.476 | 0.676 | +42.0% |
| ROUGE-L | 0.567 | 0.735 | +29.6% |
| BERTScore | 0.837 | 0.903 | +7.9% |

Segun el autor, el modelo LoRA supera al full fine-tuning en todas las metricas, especialmente en BLEU y ROUGE-2, indicando una mejor coincidencia a nivel de n-gramas y frases con las respuestas de referencia.

## Requisitos de hardware

- VRAM estimada para inferencia: ~2-3 GB en fp16 sin cuantizar; con cuantizacion de 4 bits puede reducirse a menos de 1.5 GB.
- GPU recomendadas: cualquier GPU consumer con al menos 4 GB de VRAM (RTX 3050, RTX 3060, etc.) es suficiente. Para entrenamiento con LoRA se recomiendan al menos 8 GB.
- Compatibilidad con GPU consumer: si, funciona en laptops y tarjetas de gama media.
- Opciones de despliegue: Transformers con PEFT, vLLM, llama.cpp, TGI, Ollama.
- Latencia y throughput: no hay datos publicados; en una RTX 3060 se estima una latencia de 200-300 ms por generacion de 100 tokens.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Arquitectura | Licencia | Rendimiento en vi_chart |
|--------|-----------|----------|--------------|----------|--------------------------|
| InternVL2-1B (base) | 1B | No disponible | InternViT + Qwen2 | Apache 2.0 | No evaluado |
| Vintern-1B-v2 | 1B | No disponible | InternViT + Qwen2 | Apache 2.0 | Evaluado en el mismo dataset (segun el autor) |
| Este modelo (LoRA) | 1B | No disponible | InternViT + Qwen2 | Apache 2.0 | Mejor que full fine-tuning (segun el autor) |

No hay comparativas con modelos externos en benchmarks estandar.

## Limitaciones y advertencias

- Modelo de tamano reducido (1B), por lo que puede presentar alucinaciones en razonamientos complejos o datos numericos.
- Especializado en graficos vietnamitas; su rendimiento en otros idiomas o tipos de imagenes no esta garantizado.
- No se han documentado sesgos especificos, pero el entrenamiento en un dataset limitado puede introducir sesgos en la interpretacion de graficos.
- La licencia Apache 2.0 permite uso comercial, pero el modelo no esta validado para entornos de produccion criticos.
- La longitud de contexto no esta documentada; se recomienda verificar el limite de tokens antes de usar imagenes de alta resolucion.
- Los benchmarks presentados son solo de generacion de texto; no se ha medido la precision de las lecturas de datos concretos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/maianh511/internvl2_1b_finetune_lora_viet_chart_vqa
- Modelo base InternVL2-1B: https://huggingface.co/OpenGVLab/InternVL2-1B
- Paper de Vintern-1B: https://arxiv.org/pdf/2408.12480v1
- Script de fine-tuning LoRA para InternVL2: https://github.com/OpenGVLab/InternVL/blob/main/internvl_chat/shell/internvl2.0/2nd_finetune/internvl2_1b_qwen2_0_5b_dynamic_res_2nd_finetune_lora.sh
