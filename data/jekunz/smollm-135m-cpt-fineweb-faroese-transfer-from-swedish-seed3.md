# jekunz/smollm-135m-cpt-fineweb-faroese-transfer-from-swedish-seed3

## Resumen

SmolLM-135M CPT FineWeb Faroese (transfer desde sueco, semilla 3) es un modelo de lenguaje de 134,5 millones de parámetros derivado de SmolLM2-135M-Instruct, desarrollado por el usuario jekunz. Se trata de un experimento de investigación de entrenamiento continuado (continued pre-training, CPT) en el que el modelo base se ajusta primero sobre la porción sueca de FineWeb-2 y después sobre la porción feroesa del mismo corpus, con el objetivo de dotar a un modelo pequeño de capacidades de generación de texto en feroés.

El modelo emplea una arquitectura transformer tipo Llama con pesos en safetensors, una longitud de contexto máxima de 2048 tokens durante el entrenamiento y licencia Apache 2.0. Por su tamaño reducido (0,3 GB de repositorio) está pensado para inferencia en hardware modesto, pero su alcance es estrictamente de investigación: el autor indica explícitamente que no ha sido evaluado de forma amplia.

Su relevancia actual es metodológica más que de producto: ilustra una estrategia de transferencia lingüística de bajo coste (sueco como lengua puente hacia el feroés) sobre un modelo pequeño, útil para estudiar currículos de CPT en lenguas de bajos recursos con corpus web masivos como FineWeb-2.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer tipo Llama (derivado de SmolLM2-135M-Instruct) |
| Parámetros totales | 134.515.008 |
| Parámetros activos | No aplica (modelo denso) |
| Longitud de contexto | 2048 tokens (máxima durante el entrenamiento) |
| Tipos de cuantización | No disponible (pesos publicados en safetensors; no se documentan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | Feroés (fo); entrenamiento intermedio en sueco (sv) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería transformers) |

## Arquitectura y entrenamiento

El modelo parte de SmolLM2-135M-Instruct, un transformer decoder-only denso de la familia Llama, y aplica un entrenamiento continuado en dos fases: primero 1 época sobre la porción sueca de HuggingFaceFW/fineweb-2 y después 5 épocas sobre la porción feroesa del mismo corpus. La configuración de entrenamiento reportada incluye tasa de aprendizaje 5e-4 con scheduler coseno, ratio de warmup de 0,05, tamaño de lote 8, acumulación de gradientes de 32 pasos (lote efectivo de 256), longitud máxima de contexto de 2048 tokens y ejecución en una única GPU A100 de 40 GB. Esta ficha corresponde a la semilla 3 de tres semillas de entrenamiento para la misma configuración.

No se documentan en la información disponible detalles sobre la composición exacta del dataset (número de tokens, filtrado, deduplicación), ni sobre etapas de alineación adicionales como RLHF o DPO posteriores al CPT. La innovación técnica principal es el uso de una lengua puente (sueco) para transferir capacidades a una lengua de bajos recursos (feroés) mediante CPT secuencial, una técnica de bajo coste computacional aplicable a modelos pequeños.

## Capacidades

- Generación de texto conversacional en feroés, heredada del ajuste instructivo del modelo base y del CPT sobre FineWeb-2.
- Generación de texto en sueco como efecto del entrenamiento intermedio, aunque no se documenta su calidad.
- Razonamiento básico y respuesta a instrucciones, limitado por el tamaño de 135M parámetros del modelo base.
- Soporte de tool calling / function calling: no disponible (no documentado).
- Soporte de agentes y razonamiento multi-paso: no disponible (no documentado).
- Capacidades multilingües: limitadas al feroés y, de forma indirecta, al sueco; no se documentan otras lenguas.
- Capacidades especiales (modo thinking, visión, audio): no disponibles.

## Casos de uso

- Investigación en transferencia lingüística: el modelo sirve como punto de comparación para estudiar el efecto del CPT secuencial sueco→feroés frente a entrenamiento directo en feroés, con tres semillas disponibles para medir varianza.
- Generación de texto sintético en feroés: puede emplearse para aumentar corpus de lenguas de bajos recursos, siempre con revisión humana dada la ausencia de evaluación publicada.
- Prototipado de asistentes conversacionales en feroés: con 135M parámetros y contexto de 2048 tokens, permite desplegar un chatbot ligero en hardware de consumo para pruebas internas.
- Experimentos de currículo de datos: la configuración (1 época sueco, 5 épocas feroés, lr 5e-4) es replicable en una sola A100 de 40 GB, lo que facilita estudios controlados de hiperparámetros.
- Evaluación de corpus FineWeb-2: útil para analizar la calidad de la porción feroesa del corpus midiendo la perplejidad del modelo resultante.
- Docencia y formación: modelo pequeño y de licencia permisiva para enseñar pipelines de CPT con transformers y Hugging Face.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor indica explícitamente que el modelo "no ha sido evaluado más ampliamente todavía".

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,3 GB en fp32 (134,5M parámetros × 4 bytes), alrededor de 0,15 GB en fp16/bf16 y menos de 0,1 GB en cuantización de 4 bits.
- GPU recomendadas: cualquier GPU con al menos 1-2 GB de VRAM; el entrenamiento se realizó en una A100 de 40 GB, pero la inferencia no requiere hardware de datacenter.
- Cabe en GPU de consumo: sí, en cualquier GPU consumer moderna (RTX 3060, RTX 4090, etc.) e incluso en CPU para inferencia de baja latencia.
- Opciones de despliegue: transformers (librería nativa), text-generation-inference (tag endpoints_compatible), y conversión a GGUF para llama.cpp u Ollama si se genera dicha conversión (no publicada).
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| jekunz/smollm-135m-cpt-fineweb-faroese-transfer-from-swedish-seed3 | 134,5M | 2048 | Feroés (fo) | Apache 2.0 | Hugging Face |
| HuggingFaceTB/SmolLM2-135M-Instruct (modelo base) | 135M | 2048 | Principalmente inglés | Apache 2.0 | Hugging Face |
| jekunz/smollm-135m-cpt-fineweb-swedish (modelo intermedio) | 135M | 2048 | Sueco | Apache 2.0 | Hugging Face |

No se dispone de datos de rendimiento comparativo (benchmarks) entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- Modelo de investigación sin evaluación amplia: el autor advierte que no ha sido evaluado más allá del entrenamiento, por lo que su calidad en feroés es incierta.
- Riesgo elevado de alucinación y de generación incoherente por el tamaño reducido (135M parámetros) y por el CPT sobre corpus web sin filtrado documentado.
- Sesgos potenciales heredados de FineWeb-2 (corpus web) y del modelo base SmolLM2, no analizados en la model card.
- Contexto limitado a 2048 tokens, insuficiente para tareas de contexto largo.
- Cobertura lingüística restringida al feroés (y sueco de forma indirecta); no se garantiza un comportamiento correcto en otras lenguas.
- Licencia Apache 2.0 permite uso comercial, pero la ausencia de evaluación hace desaconsejable su uso en producción sin validación previa.
- No se documentan cuantizaciones oficiales ni formatos GGUF, lo que limita el despliegue directo en herramientas como Ollama sin conversión manual.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/jekunz/smollm-135m-cpt-fineweb-faroese-transfer-from-swedish-seed3
- Modelo base intermedio: https://huggingface.co/jekunz/smollm-135m-cpt-fineweb-swedish
- Dataset FineWeb-2: https://huggingface.co/datasets/HuggingFaceFW/fineweb-2
- Modelo base original SmolLM2-135M-Instruct: https://huggingface.co/HuggingFaceTB/SmolLM2-135M-Instruct
